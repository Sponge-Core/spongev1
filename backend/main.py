from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from problems.registry import load_all_problems
from routes import session, prompt, submit, leaderboard, run_tests, problems

app = FastAPI(title="Sponge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router)
app.include_router(prompt.router)
app.include_router(submit.router)
app.include_router(leaderboard.router)
app.include_router(run_tests.router)
app.include_router(problems.router)


@app.on_event("startup")
async def startup():
    load_all_problems()


@app.get("/")
def health():
    return {"status": "ok", "service": "sponge"}
