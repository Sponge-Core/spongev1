# FRONTEND_AGENTS.md — Frontend Claude Code Context

Read `AGENTS.md` first for full project context. This file is frontend-specific.

## Component Ownership

Two people work on the frontend. They do NOT touch each other's components.

### Zidan — Core Product (`components/editor/`, `components/chat/`)

| Component | Purpose |
|-----------|---------|
| `editor/FileTree.jsx` | File explorer sidebar — renders the RQ file tree, handles open/close |
| `editor/CodeEditor.jsx` | Monaco editor — syntax highlighting, file tabs, edit tracking |
| `editor/ProblemStatement.jsx` | Problem description shown above the file tree |
| `chat/ChatTerminal.jsx` | AI chat panel — message list, input bar, typing indicator |
| `chat/ChatMessage.jsx` | Single chat message renderer (markdown, code blocks, inline code) |

Also owns: `pages/SessionPage.jsx`, `pages/DemoPage.jsx`, `pages/ProblemsPage.jsx`, `hooks/useSession.jsx`, `hooks/useTimer.js`, `api/client.js`, `components/game/LandingScreen.jsx`, `components/game/BriefScreen.jsx`

> **Note on LandingScreen:** it lives in `components/game/` but is owned by **Zidan**, not Josh. It's the marketing landing page (hero, CTA to `/problems`), not game UI. Josh does not touch it.

### Designer — Game Layer (`components/game/`, except LandingScreen)

| Component | Purpose |
|-----------|---------|
| `game/ResultsScreen.jsx` | Post-session results — score circle, insight cards, breakdown bars, metrics |
| `game/Leaderboard.jsx` | Leaderboard table with rankings, scores, badges |
| `game/Badge.jsx` | Badge component — icon + label for each badge tier |

Also owns: `pages/LeaderboardPage.jsx`

### Shared (`components/shared/`)

Both can use and modify these:

| Component | Purpose |
|-----------|---------|
| `shared/Button.jsx` | Reusable button with variants (primary, secondary, ghost) |
| `shared/Timer.jsx` | Countdown timer display used in the header |

## File Structure

```
frontend/src/
  components/
    editor/
      FileTree.jsx       ← dynamic tree from API (no static import)
      CodeEditor.jsx
      ProblemStatement.jsx ← dynamic content from problemData.brief
    chat/
      ChatTerminal.jsx   ← placeholder hint from problemData
      ChatMessage.jsx
    game/
      LandingScreen.jsx  ← marketing hero, CTA links to /problems
      BriefScreen.jsx    ← dynamic brief from problemData
      ResultsScreen.jsx
      Leaderboard.jsx
      Badge.jsx
    shared/
      Button.jsx
      Header.jsx         ← dynamic problem title from problemData
      Timer.jsx
  pages/
    ProblemsPage.jsx     ← /problems — challenge catalog with cards from API
    DemoPage.jsx         ← reads problemId from URL, calls selectProblem()
    SessionPage.jsx
    LeaderboardPage.jsx
  api/
    client.js            ← includes fetchProblems, fetchProblemDetail, fetchProblemFiles
  hooks/
    useSession.jsx       ← manages problemId, problemData, problemFiles state
    useTimer.js
  App.jsx                ← routes: /, /problems, /demo/:problemId?
  main.jsx
  index.css              ← includes problems page + challenge card styles
```

**Deprecated (no longer imported):**
- `data/fileTree.js` — file tree now loaded from `GET /problems/{id}/files`
- `data/fileContents.js` — file contents now loaded from API

## API Client (`api/client.js`)

All API calls go through `api/client.js`. All endpoints hit the live backend — there are **no mocks**. The base URL defaults to `https://sponge-backend.vercel.app` and can be overridden via `VITE_API_URL`.

```js
// Problem endpoints (all silent: true — degrade gracefully if backend doesn't have them yet)
fetchProblems()                                                                // GET /problems
fetchProblemDetail(problemId)                                                  // GET /problems/{id}
fetchProblemFiles(problemId)                                                   // GET /problems/{id}/files

// Session endpoints
startSession(username, problemId)                                              // POST /session/start (sends problem_id in body)
sendPrompt({ session_id, prompt_text, conversation_history, active_file, file_contents })  // POST /prompt
logEvent({ session_id, event, file, ts })                                      // POST /session/event
runTests({ session_id, file_contents })                                        // POST /run-tests
submitSession({ session_id, final_code, username })                            // POST /submit
```

Error handling: `safeFetch` wrapper emits errors via `onApiError` subscriber pattern. `logEvent` swallows errors silently (fire-and-forget). All `/problems` endpoints use `silent: true` so the landing page and demo page don't show error banners when the backend hasn't been updated yet.

### Score response shape (from `/submit`)

The frontend consumes these fields from the response:
- `total_score` (int, 0-100)
- `breakdown` — legacy 0-10 metric scores (displayed in full breakdown view)
- `rubric_breakdown` — category scores: `{ problem_solving, code_quality, verification, communication }` with maxes 12/13/12/13
- `headline_metrics` — 8 rate metrics (displayed in full breakdown view)
- `interpretation` (string) — brief summary (fallback if insights unavailable)
- `badge` (string) — one of "AI Collaborator", "On Your Way", "Needs Work", "Just Vibing"
- `insights` — array of `{ category, type, title, description }` — Gemini-powered personalised feedback cards (strengths + improvements)
- `sub_criteria`, `penalty_detail`, `test_suite` — optional detailed breakdowns

See `AGENTS.md` for the full response JSON.

## Design System (CSS Custom Properties)

All colors and sizes are defined in `index.css` as CSS custom properties. Use these — do not hardcode colors.

```css
/* Backgrounds */
--bg-root: #0a0c0b
--bg-surface: #111413
--bg-surface-2: #191d1b
--bg-surface-3: #1e2321
--bg-hover: #242a27

/* Borders */
--border: #2a2f2c
--border-subtle: #1e2321

/* Forest green accent */
--green-dark: #2d6a4f
--green: #40916c
--green-light: #52b788
--green-lighter: #74c69d
--green-faint: rgba(64, 145, 108, 0.08)

/* Cream text */
--cream: #f5f0e8
--cream-dim: #b8b0a4

/* Text hierarchy */
--text: #e0ddd7         /* body text */
--text-secondary: #9a958e  /* secondary */
--text-dim: #6b665f      /* labels, hints */

/* Status colors */
--red: #e05555
--yellow: #e0b555
--blue: #5588cc

/* Fonts */
Body: 'Inter', -apple-system, sans-serif
Code: 'JetBrains Mono', 'Fira Code', monospace
```

## File Tree (dynamic from API)

The file tree shown in the sidebar is loaded from `GET /problems/{id}/files` via `problemFiles.file_tree`. File contents come from the same endpoint via `problemFiles.file_contents`. Test files are visible in the tree but NOT accessible (no content loaded — they appear grayed out). This is intentional: we don't want users reverse-engineering the test suite.

For the RQ problem, the tree looks like:

```
rq/
  __init__.py
  cli/
    __init__.py
    cli.py
    helpers.py
  compat/
    __init__.py
    connections.py
    dictconfig.py
  connections.py
  contrib/
    __init__.py
    legacy.py
    sentry.py
  decorators.py
  defaults.py
  dummy.py
  exceptions.py
  job.py          ← key file
  local.py
  logutils.py
  queue.py        ← key file
  registry.py     ← key file
  suspension.py
  timeouts.py
  utils.py
  version.py
  worker.py       ← key file
  worker_registration.py
tests/            ← visible but NOT accessible
  __init__.py
  fixtures.py
  test_cli.py
  test_connection.py
  test_decorator.py
  test_helpers.py
  test_job.py
  test_queue.py
  test_registry.py
  test_sentry.py
  test_utils.py
  test_worker.py
  test_worker_registration.py
docs/
examples/
README.md
requirements.txt
setup.py
```

## State Management

All session state lives in `hooks/useSession.jsx` via React Context:

**Problem state (loaded before session starts):**
- `problemId` — selected problem ID (e.g. `"rq-delayed-jobs"`)
- `problemData` — metadata + brief + chat hints (from `fetchProblemDetail`)
- `problemFiles` — file tree + file contents (from `fetchProblemFiles`)
- `isProblemLoading` — loading state for `selectProblem()`
- `selectProblem(id)` — fetches detail + files from API, sets `totalTime` from problem config

**Session state:**
- `sessionId` — current session ID from backend
- `view` — `'idle'` | `'brief'` | `'session'` | `'results'`
- `timeLeft` / `totalTime` — countdown timer (from `problemData.time_limit_seconds`)
- `activeFile` / `openFiles` — editor file state (initialized from `problemData.default_active_file`)
- `fileBuffers` — in-memory file contents (initialized from `problemFiles.file_contents`)
- `chatHistory` — array of `{ role, content }` messages
- `isAiLoading` — whether AI is generating a response
- `results` — scoring results from submit endpoint
- `isSubmitting` — loading state for submit

**View flow:** `idle → brief → session → results`. Problem selection happens on the `/problems` page, which navigates to `/demo/:problemId`. DemoPage calls `selectProblem()` on mount, then `beginSession()` once loaded.

## Key Implementation Notes

- Monaco Editor is used for the code editor (`@monaco-editor/react`)
- Custom Monaco theme `sponge-dark` matches the design system
- File contents are loaded dynamically from `GET /problems/{id}/files` — the editor is read/write but changes only live in memory
- The chat panel renders markdown (code blocks, inline code, bold, bullets) with a custom renderer
- Chat placeholder hint comes from `problemData.brief.chat_placeholder_hint`
- Events are logged to the backend via `logEvent()` for scoring analysis
- `/problems` route — dedicated page listing all challenges; fetches from `GET /problems`, renders challenge cards
- Landing page CTA ("Browse challenges") navigates to `/problems`
- `/demo/:problemId?` route — `problemId` param is optional, defaults to `"rq-delayed-jobs"`
- BriefScreen and ProblemStatement render all content from `problemData.brief` (title, context, objective, requirements, constraints, footer_note)
- Header shows `problemData.short_title` instead of hardcoded text

## Context Sync Reminder

After every big change (new component, renamed file, changed hook signature, new CSS vars, modified mock data), update this file. See `AGENTS.md > Context Sync Protocol` for the full rules. If your change would break or confuse another team member's Claude Code agent, document it here before committing.
