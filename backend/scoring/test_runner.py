"""
Test runner service — sandbox execution for correctness verification.

Parses user-submitted final_code, overlays it onto a copy of the problem's
source codebase, runs the test suite via pytest subprocess, and returns
TestSuiteResult with per-test pass/fail and core test failures.

Supports multiple problems via the problem registry. Each problem defines
its own source directory, test suites, conftest template, and test names.

Entry point: run_correctness_tests(final_code, problem_id, include_hidden) -> Optional[TestSuiteResult]
"""

import asyncio
import logging
import os
import re
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from typing import Optional

from models.score import TestResult, TestSuiteResult

logger = logging.getLogger(__name__)

# Legacy constants kept for backward compatibility (used by run_tests debug endpoint)
BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RQ_SOURCE = os.path.join(BACKEND_ROOT, "rq-v1.0")


def _get_problem_config(problem_id: str):
    """Get problem config from registry, or return None."""
    try:
        from problems.registry import get_problem
        return get_problem(problem_id)
    except Exception:
        return None


def parse_final_code(final_code: str) -> dict[str, str]:
    """Parse concatenated final_code into individual files.

    Expected format:
        // --- rq/queue.py ---
        <file contents>
        // --- rq/worker.py ---
        <file contents>

    Returns dict mapping relative paths to file contents.
    """
    files = {}
    current_file = None
    current_lines = []

    for line in final_code.split("\n"):
        # Match file header: // --- rq/queue.py ---
        match = re.match(r"^//\s*---\s*(.+?)\s*---\s*$", line)
        if match:
            # Save previous file
            if current_file is not None:
                files[current_file] = "\n".join(current_lines)
            current_file = match.group(1).strip()
            current_lines = []
        else:
            current_lines.append(line)

    # Save last file
    if current_file is not None:
        files[current_file] = "\n".join(current_lines)

    return files


def _run_tests_sync(
    final_code: str,
    include_hidden: bool = False,
    *,
    source_path: str,
    visible_test_path: str,
    hidden_test_path: str,
    conftest_content: str,
    env_var_name: str,
    extra_python_paths: list[str],
    timeout: int,
    all_visible_test_names: list[str],
    core_test_names: set[str],
    hidden_test_names: list[str],
) -> TestSuiteResult:
    """Synchronous test execution — called via asyncio.to_thread.

    Raises on failure instead of returning None so callers can see the error.
    """
    tmpdir = None
    try:
        # Parse user's code into files
        user_files = parse_final_code(final_code)
        if not user_files:
            raise ValueError("No files parsed from final_code")

        # Create temp directory and copy source codebase into it
        tmpdir = tempfile.mkdtemp(prefix="sponge_test_")
        source_copy = os.path.join(tmpdir, "source")
        shutil.copytree(source_path, source_copy)

        # Write conftest.py (e.g. patches redis with fakeredis)
        if conftest_content:
            with open(os.path.join(tmpdir, "conftest.py"), "w") as f:
                f.write(conftest_content)

        # Overlay user's modified files
        for rel_path, content in user_files.items():
            dest = os.path.join(source_copy, rel_path)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "w") as f:
                f.write(content)

        # Copy the test suite into the temp dir
        test_dest = os.path.join(tmpdir, "test_submission.py")
        shutil.copy2(visible_test_path, test_dest)

        test_files_to_run = [test_dest]
        if include_hidden and hidden_test_path and os.path.isfile(hidden_test_path):
            hidden_dest = os.path.join(tmpdir, "test_hidden.py")
            shutil.copy2(hidden_test_path, hidden_dest)
            test_files_to_run.append(hidden_dest)

        # Build the pytest command
        env = os.environ.copy()
        env[env_var_name] = source_copy
        runtime_paths = os.pathsep.join(p for p in sys.path if p)

        # Build extra paths from config (resolve relative to tmpdir — the sandbox root)
        # e.g. "source" → /tmp/.../source (where rq/ package lives)
        resolved_extra = []
        for ep in extra_python_paths:
            resolved_extra.append(os.path.join(tmpdir, ep) if not os.path.isabs(ep) else ep)
        if not resolved_extra:
            resolved_extra = [source_copy, os.path.join(source_copy, "tests")]
        extra = os.pathsep.join(resolved_extra)
        env["PYTHONPATH"] = extra + os.pathsep + runtime_paths

        xml_path = os.path.join(tmpdir, "results.xml")
        python_exe = sys.executable
        cmd = [
            python_exe, "-m", "pytest",
            *test_files_to_run,
            f"--junitxml={xml_path}",
            "-q",
            "--no-header",
            f"--ignore={os.path.join(source_copy, 'tests')}",
            f"--rootdir={tmpdir}",
        ]

        # Run pytest with timeout — capture output for diagnostics
        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=tmpdir,
                env=env,
            )
        except subprocess.TimeoutExpired:
            raise RuntimeError(f"pytest timed out after {timeout}s")

        # Parse JUnit XML results
        all_test_names = list(all_visible_test_names)
        if include_hidden:
            all_test_names.extend(hidden_test_names)

        result = _parse_junit_xml(xml_path, all_test_names, core_test_names)
        if result is None:
            raise RuntimeError(
                f"pytest produced no parseable results. "
                f"returncode={proc.returncode}, "
                f"stdout={proc.stdout[-800:] if proc.stdout else ''}, "
                f"stderr={proc.stderr[-800:] if proc.stderr else ''}"
            )
        return result

    finally:
        if tmpdir and os.path.exists(tmpdir):
            try:
                shutil.rmtree(tmpdir)
            except Exception:
                logger.warning("test_runner: failed to clean up %s", tmpdir)


def _parse_junit_xml(
    xml_path: str,
    all_test_names: list[str],
    core_test_names: set[str],
) -> Optional[TestSuiteResult]:
    """Parse JUnit XML produced by pytest --junitxml into TestSuiteResult."""
    if not os.path.exists(xml_path):
        logger.warning("test_runner: JUnit XML not found at %s", xml_path)
        return None

    try:
        tree = ET.parse(xml_path)
    except ET.ParseError:
        logger.warning("test_runner: failed to parse JUnit XML")
        return None

    root = tree.getroot()

    # Extract per-test results from <testcase> elements
    xml_results = {}  # test_name -> (passed, error_message)
    for tc in root.iter("testcase"):
        name = tc.attrib.get("name", "")
        failure = tc.find("failure")
        error = tc.find("error")
        if failure is not None:
            msg = failure.attrib.get("message", "Test failed")
            xml_results[name] = (False, msg)
        elif error is not None:
            msg = error.attrib.get("message", "Test error")
            xml_results[name] = (False, msg)
        else:
            xml_results[name] = (True, None)

    results = []
    total_passed = 0
    total_failed = 0

    for test_name in all_test_names:
        is_core = test_name in core_test_names
        passed, error_msg = xml_results.get(test_name, (False, "Test not found in output"))
        if passed:
            total_passed += 1
            results.append(TestResult(test_name=test_name, passed=True, is_core=is_core))
        else:
            total_failed += 1
            results.append(TestResult(
                test_name=test_name, passed=False,
                error_message=error_msg, is_core=is_core,
            ))

    total = total_passed + total_failed
    if total == 0:
        logger.warning("test_runner: no test results found in JUnit XML")
        return None

    core_failures = [r.test_name for r in results if r.is_core and not r.passed]
    pass_rate = total_passed / total if total > 0 else 0.0

    return TestSuiteResult(
        total=total,
        passed=total_passed,
        failed=total_failed,
        pass_rate=round(pass_rate, 2),
        results=results,
        core_failures=core_failures,
    )


def _resolve_test_config(problem_id: str):
    """Resolve test config from registry, raising on missing problem."""
    problem = _get_problem_config(problem_id)
    if problem is None:
        raise ValueError(f"Problem '{problem_id}' not found in registry")
    tc = problem.test_config
    return {
        "source_path": problem.source_path,
        "visible_test_path": tc.visible_test_path,
        "hidden_test_path": tc.hidden_test_path,
        "conftest_content": tc.conftest_content,
        "env_var_name": tc.env_var_name,
        "extra_python_paths": tc.extra_python_paths,
        "timeout": tc.timeout_seconds,
        "all_visible_test_names": tc.all_visible_test_names,
        "core_test_names": tc.core_test_names,
        "hidden_test_names": tc.hidden_test_names,
    }


async def run_correctness_tests(
    final_code: str,
    problem_id: str = "rq-delayed-jobs",
    include_hidden: bool = False,
) -> Optional[TestSuiteResult]:
    """Run the test suite against user's submitted code.

    Returns TestSuiteResult or None if execution fails for any reason.
    This function never raises — all errors are caught and logged.
    Used by submit.py where we want safe fallback behavior.
    """
    if not final_code or not final_code.strip():
        logger.warning("test_runner: empty final_code")
        return None

    try:
        config = _resolve_test_config(problem_id)
        return await asyncio.to_thread(
            _run_tests_sync, final_code, include_hidden, **config,
        )
    except Exception:
        logger.exception("test_runner: failed to run tests")
        return None


async def run_correctness_tests_verbose(
    final_code: str,
    problem_id: str = "rq-delayed-jobs",
    include_hidden: bool = False,
) -> TestSuiteResult:
    """Like run_correctness_tests but lets exceptions propagate for debugging.

    Used by the /run-tests endpoint where we want to surface errors to the user.
    """
    if not final_code or not final_code.strip():
        raise ValueError("empty final_code")

    config = _resolve_test_config(problem_id)
    return await asyncio.to_thread(
        _run_tests_sync, final_code, include_hidden, **config,
    )
