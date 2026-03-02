from fastapi import APIRouter, HTTPException

from problems.registry import get_problem, list_problems

router = APIRouter(tags=["problems"])


@router.get("/problems")
async def get_problems():
    """Return metadata for all available problems."""
    return list_problems()


@router.get("/problems/{problem_id}")
async def get_problem_detail(problem_id: str):
    """Return full problem detail including brief data."""
    problem = get_problem(problem_id)
    if problem is None:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found")

    return {
        **problem.get_catalog_entry(),
        "default_active_file": problem.default_active_file,
        "brief": problem.brief,
        "chat_hints": problem.chat_hints,
    }


@router.get("/problems/{problem_id}/files")
async def get_problem_files(problem_id: str):
    """Return file tree and file contents for a problem's source codebase."""
    problem = get_problem(problem_id)
    if problem is None:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found")

    return {
        "file_tree": problem.file_tree,
        "file_contents": problem.file_contents,
    }
