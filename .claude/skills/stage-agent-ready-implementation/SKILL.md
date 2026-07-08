---
name: stage-agent-ready-implementation
description: Turn a rough product idea, feature concept, or brainstorming thread into an agent-ready implementation package. Use when the user wants to brainstorm from an idea into a detailed implementation guide, run gap and quick-win review passes, use subagents or a swarm for independent feedback, iterate until the guide is clear, and parse the final plan into individual user stories or delivery tasks.
---

# Stage Agent-Ready Implementation

## Overview

Use this skill to move deliberately from an early idea to implementation-ready work that another coding agent can execute. The output is usually a repo-local implementation guide plus a set of user story files with clear metadata, acceptance criteria, dependencies, and validation notes.

The core loop is:

```text
idea -> brainstorm -> grounded guide -> swarm review -> revise -> repeat -> user stories -> handoff
```

## Operating Principles

- Preserve the user's intent while making hidden decisions explicit.
- Distinguish confirmed facts, assumptions, likely inferences, and unknowns.
- Inspect the actual repo, documents, previous thread context, or design artifacts before naming implementation files, services, APIs, tests, or constraints.
- Keep current behavior and backward compatibility visible unless the user explicitly wants a breaking change.
- Ask clarifying questions only when the answer affects architecture, irreversible work, or materially different outcomes.
- Treat quick wins as scoped improvements that reduce implementation risk or user friction, not as unrelated enhancements.
- Do not perform external writes, deploys, pushes, publishes, or environment changes without explicit approval immediately before the action.

## Workflow

### 1. Capture The Idea

Restate the product idea in plain language and identify:

- The user outcome.
- The current behavior being preserved or replaced.
- The new behavior being introduced.
- Known constraints, non-goals, and future ideas.
- The likely product vocabulary to use consistently.

When the idea is still fluid, brainstorm in chat first. Prefer concrete experience sketches, user flows, tradeoffs, and open questions over implementation details too early.

### 2. Ground The Plan

Before drafting an implementation guide, inspect the relevant source of truth:

- Repo structure and nearby comparable code.
- Existing models, services, UI flows, prompt files, tests, smoke tests, settings, persistence, and import/export paths.
- Existing documentation and prior implementation notes.
- Referenced chats or artifacts when available.
- Current official documentation when the work depends on fast-moving SDKs, APIs, frameworks, or platform behavior.

Record architecture facts as confirmed only when directly verified from source, docs, tests, or runtime behavior.

### 3. Draft The Implementation Guide

Create or update a single implementation guide unless the user requests another format. A strong guide usually includes:

- Purpose and product intent.
- Current architecture facts, with file and component names.
- MVP definition.
- Non-goals and future scope.
- Data model and persistence changes.
- UI and interaction flow.
- Service, repository, prompt, background job, or integration changes.
- Backward compatibility and migration behavior.
- Validation strategy, smoke tests, manual tests, and failure handling.
- Security, privacy, safety, and external-write guardrails.
- Implementation order.
- Acceptance criteria.
- Risks, assumptions, and open questions.

Write the guide so a fresh coding agent can execute it without reading the whole brainstorming transcript.

### 4. Run A Gap And Quick-Win Review

When the user asks for a swarm, subagents, or another review pass, create at least one reviewer per major feature or workstream. Useful reviewer roles include:

- Data model, persistence, and backward compatibility.
- UI flow, accessibility, and user friction.
- Context import, file handling, and copy/order behavior.
- Prompting, agent instructions, and frame refresh behavior.
- Heuristics, suggestions, scoring, and confidence labels.
- Error handling, recovery, and fallback behavior.
- Test strategy, smoke tests, and manual validation.
- Future extensibility, templates, settings, and migration paths.
- Story slicing, dependencies, and delivery order.

Ask reviewers to return high-priority gaps first, then relevant quick wins. Keep feedback tied to the guide's text, missing decisions, or implementation ambiguity.

If actual subagent tooling is unavailable, say so and perform a structured multi-perspective review in the main thread.

### 5. Fold Feedback Into The Guide

Apply judgment rather than copying every suggestion:

- Include gaps that would block implementation, cause inconsistent behavior, or create rework.
- Include quick wins that are low-risk and improve correctness, clarity, compatibility, or user experience.
- Reject or defer suggestions that expand scope beyond the MVP, duplicate existing guidance, or require unverified architecture changes.
- Update the guide directly and keep wording implementation-ready.

After changes, summarize what was added, what was intentionally deferred, and any remaining open questions.

### 6. Loop Until Satisfied

Repeat review and revision until:

- High-priority gaps are resolved.
- Remaining open questions are clearly labeled and can be answered during implementation.
- The guide has enough file-level and behavior-level detail for an agent to start coding.
- The user confirms the plan is ready, or asks to proceed to story parsing.

Do not treat one swarm review as final if the guide changed materially from that review.

### 7. Parse Into User Stories

When asked to parse the guide into stories, create one markdown file per story in the requested folder. If no folder is specified, ask once or use the repo's existing planning/story convention if obvious.

Each story should include frontmatter similar to:

```yaml
---
id: FEATURE-001
title: Add session mode metadata
status: todo
priority: high
type: user-story
feature: Goal Sessions
source: docs/goal-session-implementation-guide.md
created: 2026-07-07
---
```

Recommended story body:

```markdown
# Add session mode metadata

## Story
As a user, I want ...

## Acceptance Criteria
- ...

## Implementation Notes
- ...

## Dependencies
- ...

## Validation
- ...
```

Story slicing guidance:

- Prefer independently deliverable slices over one file per technical layer when possible.
- Keep dependencies explicit when a story must be implemented before another.
- Include compatibility and validation stories when they are real work, not afterthoughts.
- Preserve IDs and titles once created unless the user asks for renumbering.

### 8. Handoff

End non-trivial work with a concise handoff:

- What changed.
- What was validated.
- Files touched.
- Commands run.
- Remaining risks, assumptions, or decisions.

## Additional Steps To Consider

Add these when relevant, even if the user did not explicitly name them:

- **Source-of-truth decision:** Identify which file, model, prompt, setting, or service owns each new concept.
- **Compatibility pass:** Define behavior for existing data, legacy sessions, old settings, missing metadata, and partial migrations.
- **Failure-mode pass:** Define what happens when imports fail, AI output is invalid, context is too large, prompts error, or generated artifacts cannot render.
- **Invalidation/update pass:** Make refresh, cache, hash, and stale-content behavior explicit when source context changes.
- **Copy/order pass:** Specify user-facing sequence, button labels, status messages, and where warnings appear.
- **Observability pass:** Add logs, status messages, counters, or smoke-test assertions where future agents would otherwise have to guess.
- **Scope boundary pass:** Move templates, settings, automation, or platform integrations into future scope unless the MVP needs them.

## Quality Bar

The result is agent-ready when a fresh implementation agent can answer:

- What files probably need to change?
- What behavior must remain unchanged?
- What new behavior must exist?
- What data must be persisted and how does legacy data behave?
- What prompts or agent instructions change?
- What tests and manual checks prove the feature works?
- What should not be implemented yet?
- What stories can be picked up independently, and in what order?
