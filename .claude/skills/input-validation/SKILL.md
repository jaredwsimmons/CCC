---
name: input-validation
description: Validate and constrain untrusted input at the boundary. Use on any handler that accepts external data.
when_to_use: request bodies, query params, file uploads, webhook payloads, form data
---
# Input Validation
Validate at the edge, before the data touches logic or storage.
- **Schema** — type, required fields, allowed values. Reject unknown fields rather than ignoring them.
- **Bounds** — string length, number ranges, array size. An unbounded input is a DoS and a memory bomb.
- **Format** — emails, UUIDs, dates parsed and re-validated, not trusted as strings.
- **Files** — size limit, type allowlist (check content, not just extension), no path traversal in names.
- Reject with a clear 4xx and a message that says what's wrong — without leaking internals.
Never trust "it comes from our own frontend". The request can come from anywhere.

---
_Adapted from [Archive228/loopkit](https://github.com/Archive228/loopkit), MIT — see `.claude/skills/LICENSE-loopkit`._

## This repo (Chelsea Community Church)
This is the skill that most directly applies to **`functions/api/pco-form.js`**. It parses
`await request.json()` from the public prayer / plan-a-visit / connect forms and forwards the
values to the **Planning Center (Church Center) People API**. Validate at that boundary, before the fetch:
- **Schema** — accept only the known fields per form (`name`, `email`, `phone`, `request`/`message`);
  the `FIELD_MAP` allowlist already drops unknown keys — keep it that way, don't loosen it.
- **Bounds** — cap every string (e.g. name ≤ 100, message ≤ 2000). Values are currently `String(...)`-cast
  with no length limit, so a huge body sails straight through to Planning Center.
- **Format** — actually parse `email` and `phone`; a bad `formType` is already rejected via `FORM_IDS`, treat other fields the same way.
- **Spam** — the `company` honeypot is checked; keep it and fail closed on anything malformed.
- Reject with a clear `4xx` that says what's wrong **without leaking internals** (don't relay Planning Center's raw error).
- Never trust "it comes from our own form" — the request can come from anywhere.
