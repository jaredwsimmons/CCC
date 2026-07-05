---
name: authz-check
description: Verify that an endpoint checks ownership, not just authentication. Use on any handler that reads or mutates user data.
when_to_use: new/changed endpoint, "get user X's data", a mutation, an admin action
---
# Authz Check
The most common security hole: the code checks you're logged IN, but not that you OWN the thing.
- For every resource access: does it verify the current user is allowed THIS specific record? `WHERE id = ? AND owner_id = current_user` — not just `WHERE id = ?`.
- IDOR test: swap the ID in the request to another user's. Does it leak/allow?
- Admin/privileged actions: is the role checked server-side, every time, not just hidden in the UI?
- Default deny: new endpoints should require explicit authorization, not be open by oversight.
Output each handler that authenticates but doesn't authorize, with the missing check.

---
_Adapted from [Archive228/loopkit](https://github.com/Archive228/loopkit), MIT — see `.claude/skills/LICENSE-loopkit`._

## This repo (Chelsea Community Church)
There is **no logged-in user** here — **`functions/api/pco-form.js`** is a public, unauthenticated
endpoint that writes into the church's Planning Center account. So the classic IDOR/ownership check
doesn't apply; the equivalent risk is **unbounded anonymous writes** to a live third-party system:
- **Default deny by allowlist** — only `formType` values in `FORM_IDS` (`prayer`, `visit`) and only
  fields present in `FIELD_MAP` may reach the Planning Center API. Reject everything else; never forward arbitrary posted keys.
- **Abuse control** — because anyone can call it, treat rate-limiting / spam defenses (the `company`
  honeypot, and ideally Cloudflare Turnstile or a per-IP limit) as the "authorization" layer that keeps the PCO account from being flooded.
- Confirm no path lets a caller pick an arbitrary Planning Center form id or field id from the request body.
