from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

import store

router = APIRouter(tags=["leaderboard"])


# ---------- Response schema ----------

class LeaderboardEntry(BaseModel):
    username: str
    score: int
    badge: str
    problem_id: str
    time_completed: str     # ISO-8601


# ---------- Endpoint ----------

@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(problem_id: Optional[str] = Query(None)):
    """
    Returns all completed sessions sorted by total_score descending.
    Only sessions that have been submitted (i.e. have a score) appear here.
    Optionally filter by problem_id.
    """
    entries: list[LeaderboardEntry] = []

    for session in store.sessions.values():
        if session.score is None:
            continue
        if problem_id and session.problem_id != problem_id:
            continue

        entries.append(
            LeaderboardEntry(
                username=session.username or "Anonymous",
                score=session.score.total_score,
                badge=session.score.badge,
                problem_id=session.problem_id,
                time_completed=(session.completed_at or session.started_at).isoformat() + "Z",
            )
        )

    entries.sort(key=lambda e: e.score, reverse=True)
    return entries
