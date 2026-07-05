---
name: owasp-review
description: Security-review a diff against the OWASP Top 10. Use before merging anything that touches auth, input handling, queries, or external calls.
when_to_use: new endpoint, auth/session change, user input, raw query, file upload, deserialization
---
# OWASP Review
Check the diff for each, with the exact line:
- **Injection** — any string-built SQL/shell/HTML. Demand parameterized queries / escaping.
- **Broken access control** — does it verify the user OWNS the resource, not just that they're logged in?
- **Auth** — secrets in code? tokens without expiry? password compare not constant-time?
- **SSRF** — user-controlled URL fetched server-side without an allowlist.
- **Sensitive data** — PII/secrets logged, returned in errors, or sent unencrypted.
- **Deserialization** — untrusted input into pickle/yaml.load/eval.
- **Dependency** — a new package with known CVEs or no maintenance.
Output: a list of {line, risk, fix}. If clean, say so explicitly. Never assume input is safe because "it comes from our frontend".

---
_Adapted from [Archive228/loopkit](https://github.com/Archive228/loopkit), MIT — see `.claude/skills/LICENSE-loopkit`._

## This repo (Chelsea Community Church)
Primary attack surface: **`functions/api/pco-form.js`** — a Cloudflare Pages Function that
takes **untrusted public form input** (prayer / plan-a-visit / connect) and POSTs it to the
**Planning Center (Church Center) People API** under the church's own `PCO_APP_ID` / `PCO_SECRET`
Basic-auth credentials. Walk the OWASP list against *that handler specifically*:
- **Sensitive data / error leakage** — on a 502 it returns Planning Center's raw `detail`
  body straight to the browser. Don't echo upstream errors verbatim; log server-side, return a generic message.
- **Auth / secrets** — `PCO_APP_ID`/`PCO_SECRET` must stay Cloudflare encrypted env vars, never in code, `.env`, or logs.
- **Broken access control** — the endpoint is intentionally anonymous, so the guardrail is the
  `FORM_IDS` allowlist (only `prayer`/`visit`), not per-user ownership. Anything not on the allowlist must be rejected.
- **Injection / abuse** — field values are `String(...)`-cast and forwarded unbounded; treat every value as hostile (see `input-validation`).
- Never assume input is safe because "it comes from our own form" — the POST can come from anywhere on the internet.
