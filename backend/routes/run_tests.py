import asyncio
import os
import shutil
import subprocess
import sys
import traceback
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

import store
from models.score import TestSuiteResult
from models.session import Session
from scoring.test_runner import run_correctness_tests_verbose
from problems.registry import get_problem

router = APIRouter(tags=["run-tests"])


class RunTestsRequest(BaseModel):
    session_id: str
    file_contents: str  # concatenated // --- path --- format, same as submit


@router.post("/run-tests")
async def run_tests(body: RunTestsRequest):
    """Run user-visible test cases against the current code.

    Reuses the same sandbox test runner as submission, but returns
    results immediately without triggering scoring or Gemini evaluation.
    """
    # Ensure session exists (serverless: auto-create across cold starts)
    session = store.sessions.get(body.session_id)
    if session is None:
        session = Session(session_id=body.session_id)
        store.sessions[body.session_id] = session

    try:
        return await run_correctness_tests_verbose(
            body.file_contents, problem_id=session.problem_id,
        )
    except Exception as e:
        tb = traceback.format_exc()
        return {
            "error": f"{type(e).__name__}: {e}",
            "traceback": tb[-1500:],
        }


@router.get("/run-tests/debug")
async def debug_test_runner():
    """Temporary debug endpoint — runs actual test flow using registry and reports errors."""
    import tempfile
    from scoring.test_runner import parse_final_code

    problem = get_problem("rq-delayed-jobs")
    if problem is None:
        return {"error": "Problem 'rq-delayed-jobs' not found in registry"}

    tc = problem.test_config
    info = {"python": sys.executable, "version": sys.version}

    # Read a real file from source to build test input
    queue_path = os.path.join(problem.source_path, "rq", "queue.py")
    if not os.path.exists(queue_path):
        info["error"] = f"queue.py not found at {queue_path}"
        return info

    with open(queue_path) as f:
        queue_code = f.read()
    final_code = f"// --- rq/queue.py ---\n{queue_code}"

    # Step 1: parse
    user_files = parse_final_code(final_code)
    info["parsed_files"] = list(user_files.keys())
    if not user_files:
        info["error"] = "parse_final_code returned empty"
        return info

    # Step 2: copy source
    tmpdir = tempfile.mkdtemp(prefix="sponge_debug_")
    try:
        source_copy = os.path.join(tmpdir, "source")
        shutil.copytree(problem.source_path, source_copy)
        info["copytree"] = "ok"

        # Step 3: write conftest
        if tc.conftest_content:
            with open(os.path.join(tmpdir, "conftest.py"), "w") as f:
                f.write(tc.conftest_content)

        # Step 4: overlay user files
        for rel_path, content in user_files.items():
            dest = os.path.join(source_copy, rel_path)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "w") as f:
                f.write(content)

        # Step 5: copy test suite
        test_dest = os.path.join(tmpdir, "test_submission.py")
        shutil.copy2(tc.visible_test_path, test_dest)

        # Step 6: run pytest
        env = os.environ.copy()
        env[tc.env_var_name] = source_copy
        runtime_paths = os.pathsep.join(p for p in sys.path if p)
        extra_paths = source_copy + os.pathsep + os.path.join(source_copy, "tests")
        env["PYTHONPATH"] = extra_paths + os.pathsep + runtime_paths

        xml_path = os.path.join(tmpdir, "results.xml")
        cmd = [
            sys.executable, "-m", "pytest", test_dest,
            f"--junitxml={xml_path}", "-q", "--no-header",
            f"--ignore={os.path.join(source_copy, 'tests')}",
            f"--rootdir={tmpdir}",
        ]

        result = subprocess.run(
            cmd, capture_output=True, text=True,
            timeout=tc.timeout_seconds, cwd=tmpdir, env=env,
        )
        info["returncode"] = result.returncode
        info["stdout_tail"] = result.stdout[-1000:] if result.stdout else ""
        info["stderr_tail"] = result.stderr[-1000:] if result.stderr else ""
        info["xml_exists"] = os.path.exists(xml_path)

    except Exception as e:
        info["error"] = f"{type(e).__name__}: {e}"
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

    return info
