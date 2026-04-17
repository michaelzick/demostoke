@AGENTS.md

## Gemini Harness Notes
- Gemini CLI project memory lives in `GEMINI.md`; this file intentionally imports the canonical shared memory from `AGENTS.md` so Gemini and Codex stay aligned.
- Whenever you make code changes, check whether `AGENTS.md` is now stale. If durable project behavior changed, update `AGENTS.md` in the same change.
- Add Gemini-specific guidance here only when it is truly Gemini-specific. Keep the repository map and durable architecture notes in `AGENTS.md`.
- If the repo later needs module-specific Gemini memory, prefer additional nested `GEMINI.md` files near the relevant subtree instead of bloating this root file.
