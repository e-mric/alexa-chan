# Project wiki

Start each task with [AGENTS.md](../AGENTS.md) and [project state](project-state.md),
then select a topic below. Review source before relying on implementation claims.
This is a curated map, not a request to load every document.

## Choose by task

| Task | Authoritative starting point |
| --- | --- |
| Understand the product or choose scope | [PRD: mission, accepted scope, acceptance criteria](prd.md) |
| Resume work, find blockers or hand off | [Project state](project-state.md) |
| Change or verify code; choose a skill; use worktrees | [Engineering](engineering.md) |
| Start a focused chat | [Five starter prompts](chat-starters.md) |
| Try personal notes and plan a real trial | [Student walkthrough](student-trial.md) |
| Inspect MCP, authentication, data boundaries or tool contracts | [MCP judge guide](mcp-judge-trial.md) |
| Understand design/interaction direction | [PRD visual direction](prd.md#visual-and-interaction-direction) |
| Inspect persona evidence, interface audit and their limits | [Journey and interface verification](persona-validation.md) |
| Prepare a release or identify owner submission steps | [Submission readiness](submission-readiness.md) |
| Draft the entry or video | [English submission](../devpost-submission.md), [demo materials](submission-demo.md), [tool feedback](product-feedback.md) |
| Check media provenance | [Notices](../THIRD_PARTY_NOTICES.md), [generated visual assets](visual-assets.md) |
| Review the basis for this development workflow | [Primary-source notes](workflow-sources.md) |

## Authority and upkeep

- **AGENTS.md** owns engineering/agent rules; **skills** own reusable methods.
- **PRD** owns product decisions and acceptance, including current design direction.
- **Engineering** owns the architecture/workflow map; package scripts, CI and code
  own executable truth. Detailed MCP contracts/privacy stay in the judge guide.
- **Project state** owns the current milestone, decisions still needed and actionable
  handoff with dated verification; the release checklist owns submission obligations
  and release receipts. Neither proves remote publication without checking it.
- **Persona validation** owns synthetic journey evidence, not human study results.
  Keep substantive new research beside the source notes, with provenance and limits;
  create a new topic only when existing pages cannot sensibly own it.

Separate source facts, assumptions, proposals and accepted decisions. Record review
dates and evidence scope. Re-read before editing, preserve concurrent changes and
link rather than duplicate the authoritative topic. Replace stale current-state
claims; preserve original sources and use Git for ordinary history. Leave a concrete
handoff when work remains. Confidential content stays outside this wiki.

## Historical / owner-only material

`docs/context.md` records the September brainstorm and early Echo architecture;
`docs/hackathon-readiness.md` is the superseded 6–7 October audit.
`docs/incidental-learning.md` and `docs/google-calendar.md` describe the legacy
French ASK pilot, not the student MCP app. `docs/founders-trial.md`,
`docs/notebook-audio.md` and `docs/archive/` retain parked/private-pilot context.
Consult these only for a relevant compatibility/provenance question. They are not
current product requirements and are intentionally omitted from judging copies.
Use code-path references here rather than links into material absent from that copy.
