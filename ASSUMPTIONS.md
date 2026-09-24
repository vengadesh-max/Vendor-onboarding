# Assumptions & Architectural Choices

1. **Document extraction** — Simulated extracted document fields in JSON payload (as per PS-2 specification, avoiding duplicate PDF/OCR parsing scope from PS-1).
2. **Deterministic vs. LLM Separation** — Structural checks (format regex, field presence, DB duplicate detection) run deterministically in code. Gemini `gemini-2.0-flash` is invoked only for ambiguous name/document fuzzy judgment and vendor-facing communication drafting.
3. **Database Architecture** — Uses PostgreSQL via `pg` pooled connection (`DATABASE_URL`) for serverless Vercel / Neon production deployment. Falls back gracefully to SQLite (`better-sqlite3`) in local environments when `DATABASE_URL` is omitted.
4. **LLM Integration** — Direct REST API integration with Gemini API (`gemini-3.6-flash`) using `responseMimeType: "application/json"` for structured judgment calls and low temperature (0.2) for explainable, consistent evaluation.
5. **Live Run View** — Pipeline runs server-side with step delay (~400ms per stage); the frontend animates sequential stage completion to provide transparent execution visibility.
6. **Decision Engine** — Final decision (`APPROVED`, `PENDING`, `REJECTED`) is aggregated deterministically from step results in code to guarantee auditability and prevent LLM drift.
7. **Deployment Strategy** — Configured for Vercel deployment with single-repo frontend SPA and Express API rewrites via `vercel.json`.
