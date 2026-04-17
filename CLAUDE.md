@AGENTS.md

## Claude Harness Notes
- Claude Code project memory lives in `CLAUDE.md`; this file intentionally imports the canonical shared memory from `AGENTS.md` so Claude and Codex stay aligned.
- Whenever you make code changes, check whether `AGENTS.md` is now stale. If durable project behavior changed, update `AGENTS.md` in the same change.
- Add Claude-specific guidance here only when it is truly Claude-specific. Keep the repository map and durable architecture notes in `AGENTS.md`.
- If the repo later needs path-scoped Claude memory, prefer additional local `CLAUDE.md` files near the relevant subtree instead of bloating this root file.
