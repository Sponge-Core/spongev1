"""
Problem registry — discovers and loads problem manifests from backend/problems/.

Each subdirectory with a manifest.json is a valid problem.
Problems are loaded once at startup and cached in memory.
"""

import json
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

PROBLEMS_ROOT = os.path.dirname(__file__)


class TestRunnerConfig:
    """Configuration for problem-specific test execution."""

    def __init__(self, data: dict, problem_root: str):
        self.conftest_template_path = os.path.join(problem_root, data.get("conftest_template", ""))
        self.visible_test_path = os.path.join(problem_root, data.get("visible_test_file", ""))
        self.hidden_test_path = os.path.join(problem_root, data.get("hidden_test_file", ""))
        self.timeout_seconds = data.get("timeout_seconds", 45)
        self.env_var_name = data.get("env_var_name", "CODEBASE_PATH")
        self.extra_python_paths = data.get("extra_python_paths", [])
        self.core_test_names = set(data.get("core_test_names", []))
        self.hidden_test_names = data.get("hidden_test_names", [])
        self.all_visible_test_names = data.get("all_visible_test_names", [])

        # Read conftest content
        self.conftest_content = ""
        if os.path.isfile(self.conftest_template_path):
            with open(self.conftest_template_path) as f:
                self.conftest_content = f.read()


class Problem:
    """Loaded problem with all data cached in memory."""

    def __init__(self, manifest: dict, root_path: str):
        self.id = manifest["id"]
        self.version = manifest.get("version", "1.0.0")
        self.title = manifest["title"]
        self.short_title = manifest.get("short_title", self.title)
        self.language = manifest.get("language", "python")
        self.difficulty = manifest.get("difficulty", "intermediate")
        self.time_limit_seconds = manifest.get("time_limit_seconds", 3600)
        self.description = manifest.get("description", "")
        self.default_active_file = manifest.get("default_active_file", "")
        self.file_separator_pattern = manifest.get("file_separator_pattern", "// --- {path} ---")

        self.root_path = root_path

        # Resolve source directory
        source_dir = manifest.get("source_dir", "source")
        self.source_path = os.path.realpath(os.path.join(root_path, source_dir))

        # Load test runner config
        self.test_config = TestRunnerConfig(
            manifest.get("test_runner_config", {}), root_path,
        )

        # Load prompts
        self.prompts: dict[str, str] = {}
        for key, rel_path in manifest.get("prompts", {}).items():
            full_path = os.path.join(root_path, rel_path)
            if os.path.isfile(full_path):
                with open(full_path) as f:
                    self.prompts[key] = f.read().strip()
            else:
                logger.warning("Problem %s: prompt file not found: %s", self.id, full_path)

        # Convenience prompt accessors
        self.system_prompt: Optional[str] = self.prompts.get("system")
        self.eval_prompt: Optional[str] = self.prompts.get("eval")
        self.code_eval_prompt: Optional[str] = self.prompts.get("code_eval")
        self.insights_prompt: Optional[str] = self.prompts.get("insights")

        # Load frontend data
        frontend = manifest.get("frontend", {})
        self.brief = _load_json(root_path, frontend.get("brief", ""))
        self.file_tree = _load_json(root_path, frontend.get("file_tree", ""))
        self.chat_hints = _load_json(root_path, frontend.get("chat_hints", ""))

        # Build file contents by reading source directory
        self.file_contents: dict[str, str] = {}
        self._load_file_contents()

    def _load_file_contents(self):
        """Walk the source directory and read all text files into memory."""
        if not os.path.isdir(self.source_path):
            logger.warning("Problem %s: source dir not found: %s", self.id, self.source_path)
            return

        text_extensions = {
            ".py", ".md", ".txt", ".cfg", ".ini", ".yml", ".yaml",
            ".html", ".css", ".js", ".json", ".toml", ".rst",
            ".in", ".coveragerc", ".gitignore", ".mailmap", ".travis.yml",
        }
        # Also include extensionless files like Makefile, LICENSE
        extensionless_names = {"Makefile", "LICENSE", "run_tests", "MANIFEST.in"}

        for dirpath, _dirnames, filenames in os.walk(self.source_path):
            for fname in filenames:
                full_path = os.path.join(dirpath, fname)
                rel_path = os.path.relpath(full_path, self.source_path)
                _, ext = os.path.splitext(fname)

                if ext in text_extensions or fname in extensionless_names or ext == "":
                    try:
                        with open(full_path, encoding="utf-8", errors="replace") as f:
                            self.file_contents[rel_path] = f.read()
                    except Exception:
                        pass

    def get_catalog_entry(self) -> dict:
        """Return metadata for the problem catalog listing."""
        return {
            "id": self.id,
            "title": self.title,
            "short_title": self.short_title,
            "language": self.language,
            "difficulty": self.difficulty,
            "time_limit_seconds": self.time_limit_seconds,
            "description": self.description,
        }


def _load_json(root_path: str, rel_path: str):
    """Load a JSON file relative to the problem root, or return empty."""
    if not rel_path:
        return {}
    full_path = os.path.join(root_path, rel_path)
    if not os.path.isfile(full_path):
        return {}
    try:
        with open(full_path) as f:
            return json.load(f)
    except Exception:
        return {}


# ── Global registry ──────────────────────────────────────────────────────

_registry: dict[str, Problem] = {}


def load_all_problems():
    """Scan problems/ directory and load all manifests."""
    global _registry
    _registry.clear()

    for entry in os.listdir(PROBLEMS_ROOT):
        entry_path = os.path.join(PROBLEMS_ROOT, entry)
        manifest_path = os.path.join(entry_path, "manifest.json")

        if not os.path.isdir(entry_path) or not os.path.isfile(manifest_path):
            continue

        try:
            with open(manifest_path) as f:
                manifest = json.load(f)

            problem = Problem(manifest, entry_path)
            _registry[problem.id] = problem
            logger.info("Loaded problem: %s (%s)", problem.id, problem.title)
        except Exception:
            logger.exception("Failed to load problem from %s", entry_path)

    logger.info("Problem registry: %d problem(s) loaded", len(_registry))


def get_problem(problem_id: str) -> Optional[Problem]:
    """Return a loaded Problem by ID, or None."""
    return _registry.get(problem_id)


def list_problems() -> list[dict]:
    """Return catalog metadata for all registered problems."""
    return [p.get_catalog_entry() for p in _registry.values()]
