# Focused chat starters

Use one prompt in a new chat, replacing the bracketed task/environment. These are
work categories, not five permanent processes or authorization to create chats.
The wiki carries durable context; transcripts are not automatically shared.
Keep a substantial implementation or testing outcome in its own chat.

## 1. Product scope & roadmap

Purpose: choose the next useful student outcome without reopening every idea.

```text
Read AGENTS.md, docs/index.md and docs/project-state.md, then docs/prd.md.
Task: decide [specific product question or next milestone]. Inspect relevant current
behaviour before relying on earlier claims. Keep the useful activity first and
Japanese optional; distinguish the fictional university example from personal notes.
Identify users/problem, options, priorities, exclusions and observable success.
Separate evidence, assumptions, proposals and accepted owner decisions; ask only
questions that change the direction. Do not implement or publish this plan.
Output a recommendation with trade-offs and the smallest milestone/acceptance criteria.
Update the existing authoritative topic only for durable conclusions, without
silently treating your recommendation as accepted. Finish with remaining decisions,
relevant files and an actionable handoff. Done when the choice is understandable
and its acceptance is testable, with uncertainty explicit.
```

## 2. Research & studies

Purpose: resolve one uncertainty with traceable evidence, not a broad reading list.

```text
Read AGENTS.md, docs/index.md and docs/project-state.md; follow the relevant topic.
Question: [bounded research question and how its answer affects Alexa-chan].
Use the research skill when available and follow claims to primary sources/studies.
Record source links, publication/review dates, methods/population where relevant,
limitations, contradictions and uncertainty. Separate findings from implications
and proposals. Incidental exposure and simulated tests are not proof of retention.
Preserve original sources; keep private notes and credentials outside shared pages.
Output a concise cited answer in the existing topic, or one substantive research
page linked from the index when needed. Do not change application behaviour.
Done when the question has an evidence-bounded answer (including inconclusive),
with product implications, remaining questions and a current handoff.
```

## 3. Design

Purpose: make one useful journey clearer without expanding the product.

```text
Read AGENTS.md, docs/index.md, docs/project-state.md and the PRD design/acceptance
sections. Inspect [specific route/journey] in the agreed environment [URL/origin].
Improve [bounded UX/accessibility/visual problem] for [user and task]. Respect the
calm reading/cyberpunk world direction, original notes, opt-in Japanese, truthful
sample labels, keyboard use, reduced motion and EN/FR/NL/DE personal UI.
Explain how each change serves user needs and observable acceptance. Use a prototype
only to resolve a specific design uncertainty; label proposed versus accepted design.
Output a focused journey/design recommendation or explicitly authorized prototype,
with expected states, failure/accessibility checks and implementation handoff.
Do not replace the app or copy reference art. Done when the chosen interaction is
testable, its assumptions are stated and unresolved owner choices are listed.
```

## 4. Implementation

Purpose: deliver one bounded feature or fix against accepted requirements.

```text
Read AGENTS.md, docs/index.md, docs/project-state.md and docs/engineering.md; follow
the relevant accepted PRD requirement. Inspect current source, status and existing
diff first. Implement [one feature/fix] with acceptance [observable outcomes].
State constraints/exclusions, checkpoints and verification before complex edits.
Preserve unrelated changes and existing data/storage boundaries. Use focused
helpers/adapters, meaningful behaviour tests and a regression for bugs; do not
invoke every design skill or reorganize the application.
Run affected checks and npm run verify; exercise the changed UI journey if applicable.
Review the scoped diff against acceptance and engineering rules. Update affected
wiki topics and re-read shared pages before editing. Report passed, failed, skipped
and unverified checks, environment/baseline and remaining work. No remote writes,
new chats or production changes unless separately authorized. Done when acceptance
and evidence match, or a concrete blocker is handed back without false completion.
```

## 5. External testing

Purpose: independently evaluate actual journeys, not infer success from source/tests.

```text
Read AGENTS.md, docs/index.md and docs/project-state.md, then the relevant trial,
PRD acceptance and persona-validation pages. Independently test [bounded journeys]
on [agreed URL/origin, revision, browser/device and permitted access].
Use synthetic material, preserve owner data and stay inside the agreed environment.
Record expected versus observed behaviour, reproducible steps, severity, evidence
and pass/fail/inconclusive. Distinguish mocked/provider tests, local MCP integration,
live external-system checks and human observations. Include Japanese ignored as well
as opt-in use, persistence/recovery and relevant accessibility/failure cases.
Identify checks needing a person, installed Japanese voice or external authorization.
Output actionable findings in the existing evidence page (or a dated substantive
report linked from it) and a focused implementation handoff. Do not implement fixes,
message users or alter production configuration. Done when every scoped case has
an evidenced result or explicit reason it remains inconclusive.
```

## Optional categories, only when useful

- **Architecture & decisions:** a consequential interface/storage boundary, not a
  folder-cleanup exercise. Use the design/domain method appropriate to the question.
- **Independent code review:** name the baseline and requirements, distinguish new
  changes from existing dirty work, and report actionable findings without fixing them.
- **Security & privacy:** a concrete data flow/threat/access question; use synthetic
  input and explicitly agree on external testing scope.
- **Release & operations:** verify the exact clean judging revision, installation,
  media/access/video/Devpost checklist and rollback/recovery; publication needs authority.

Every handoff names goal, completed work, remaining steps, relevant files, blockers
and dated verification. Commit/sync an agreed shared foundation before concurrent
overlapping worktrees; each checkout must read the wiki revision it actually contains.
