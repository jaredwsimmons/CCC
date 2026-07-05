#!/usr/bin/env node
// secret-scan — PreToolUse(Bash) reflex for this repo.
// Gates `git commit`: scans the staged diff (plus the working tree for `commit -a`)
// for real-looking credentials and blocks the commit if any survive the placeholder
// filter. .gitignore stays the primary control (.env, studio/.env, *Credentials*);
// this is the backstop for a secret (Sanity token, API key) that slips into an
// ordinary tracked file. Cross-platform: pure Node, no jq/bash needed.
//
// Wiring (Jared, in .claude/settings.json — the agent can't self-grant hook execution):
//   { "hooks": { "PreToolUse": [ { "matcher": "Bash",
//       "hooks": [ { "type": "command", "command": "node .claude/hooks/secret-scan.mjs" } ] } ] } }
//
// Contract: exit 0 = allow; exit 2 = block + stderr fed back to Claude.
// Fail-open on internal error (never brick commits over a hook bug), but warn.

import { execSync } from "node:child_process";

// --- high-confidence: structural token shapes. The regexes require a real
//     token body, so prose that merely NAMES a pattern (e.g. the literal
//     "ghp_" or "AKIA[0-9A-Z]{16}") does NOT trip them. ---
const HIGH = [
  { name: "AWS access key id", re: /AKIA[0-9A-Z]{16}/g },
  { name: "GitHub token", re: /gh[pousr]_[A-Za-z0-9]{30,}/g },
  { name: "GitHub fine-grained PAT", re: /github_pat_[A-Za-z0-9_]{40,}/g },
  { name: "OpenAI/Anthropic-style key", re: /sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/g },
  { name: "Google API key", re: /AIza[0-9A-Za-z_-]{35}/g },
  { name: "Slack token", re: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
  { name: "Sanity auth token", re: /sk[A-Za-z0-9]{40,}/g },
  { name: "Private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g },
];

// --- medium-confidence: `key = "value"` assignments. Value is captured and
//     run through the placeholder filter so examples/env-refs pass through. ---
const GENERIC = {
  name: "hardcoded secret assignment",
  re: /(?:api[_-]?key|secret|token|password|passwd|pwd|access[_-]?key|client[_-]?secret|bearer)["'\s]*[:=]\s*["'`]([^"'`]{8,})["'`]/gi,
};

const PLACEHOLDER = [
  "example", "placeholder", "your_", "your-", "yourkey", "changeme", "change_me",
  "dummy", "redacted", "todo", "sample", "xxxx", "...", "<", "abc123", "foo", "bar",
  "test-", "sk-...", "insert", "replace",
];

// Value is not a real secret if it's an env-var reference or an obvious stand-in.
function isPlaceholder(v) {
  const s = String(v).toLowerCase();
  if (/\$\{|\$[a-z_]|%[a-z_]+%|process\.env|os\.environ|import\.meta\.env/i.test(v)) return true;
  if (/^<.*>$/.test(v.trim())) return true;
  if (/^x+$/i.test(v.replace(/[-_]/g, ""))) return true;
  return PLACEHOLDER.some((p) => s.includes(p));
}

function redact(tok) {
  const t = String(tok);
  return t.length <= 6 ? "***" : `${t.slice(0, 4)}…(${t.length} chars)`;
}

// Parse a unified diff, yielding {file, line, addedText} for each ADDED line.
function* addedLines(diff) {
  let file = "?";
  let n = 0;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("+++ b/")) { file = raw.slice(6); continue; }
    if (raw.startsWith("+++") || raw.startsWith("---")) continue;
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (hunk) { n = parseInt(hunk[1], 10); continue; }
    if (raw.startsWith("+")) { yield { file, line: n, text: raw.slice(1) }; n++; continue; }
    if (raw.startsWith("-")) continue;
    n++; // context line
  }
}

function scan(diff, hits) {
  for (const { file, line, text } of addedLines(diff)) {
    for (const { name, re } of HIGH) {
      re.lastIndex = 0;
      for (const m of text.matchAll(re)) {
        if (/example/i.test(text)) continue; // AKIA...EXAMPLE etc. in docs
        hits.push({ file, line, name, snippet: redact(m[0]) });
      }
    }
    GENERIC.re.lastIndex = 0;
    for (const m of text.matchAll(GENERIC.re)) {
      if (!isPlaceholder(m[1])) hits.push({ file, line, name: GENERIC.name, snippet: redact(m[1]) });
    }
  }
}

function main() {
  let stdin = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (c) => (stdin += c));
  process.stdin.on("end", () => {
    let cmd = "", cwd = process.cwd();
    try {
      const p = JSON.parse(stdin || "{}");
      cmd = p?.tool_input?.command ?? "";
      cwd = p?.cwd || cwd;
    } catch { process.exit(0); } // can't parse → don't block

    // Only care about `git commit`. Let everything else through untouched.
    if (!/\bgit\b[\s\S]*\bcommit\b/.test(cmd) || /--help|-h\b/.test(cmd)) process.exit(0);

    const opts = { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] };
    const hits = [];
    try {
      scan(execSync("git diff --cached --no-color -U0", opts), hits);
      if (/\bcommit\b[^\n]*\s-[A-Za-z]*a|\b--all\b/.test(cmd)) {
        scan(execSync("git diff --no-color -U0", opts), hits); // `-a` also sweeps tracked edits
      }
    } catch { process.exit(0); } // not a repo / git error → don't block

    if (hits.length === 0) process.exit(0);

    const seen = new Set();
    const lines = hits.filter((h) => {
      const k = `${h.file}:${h.line}:${h.name}`;
      return seen.has(k) ? false : (seen.add(k), true);
    }).map((h) => `  ${h.file}:${h.line}  [${h.name}]  ${h.snippet}`);

    process.stderr.write(
      `🔒 secret-scan BLOCKED this commit — possible secret(s) in staged changes:\n\n` +
        lines.join("\n") +
        `\n\nA secret in git history is COMPROMISED even after you delete the line.\n` +
        `Fix: remove the value → move it to an env var or a .gitignored file → ROTATE the key.\n` +
        `False positive (placeholder / documented pattern)? Tune .claude/hooks/secret-scan.mjs.\n`
    );
    process.exit(2); // block the commit; stderr goes back to Claude
  });
}

main();
