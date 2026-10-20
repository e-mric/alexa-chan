# Workflow sources for Alexa-chan

Researched 2026-10-17; all sources accessed that date. This page owns source findings
and rationale; [engineering](engineering.md) owns the implemented workflow and
verified local plugin configuration.

## Source-backed findings

- [OpenAI best practices](https://learn.chatgpt.com/guides/best-practices) recommends prompts that state the goal, relevant context, constraints, and completion criteria. Keep `AGENTS.md` short and accurate, with layout, commands, constraints, and verification expectations; link longer task-specific documents. Validate behavior with relevant tests, static checks, and diff review. Add reusable guidance after recurring mistakes, and introduce tools or skills when an actual workflow warrants them.
- [OpenAI instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md) describes global guidance followed by project-root-to-working-directory guidance, with later instructions overriding earlier ones. Within a directory, `AGENTS.override.md` takes precedence over `AGENTS.md`. The default combined project-document limit is 32 KiB; this is a loading ceiling, not a recommended document size.
- [OpenAI skills documentation](https://learn.chatgpt.com/docs/build-skills) describes metadata-first discovery and loading full instructions when a skill is selected. Invocation can be explicit or description-matched. Keep skills focused, describe their boundaries, and prefer instructions unless scripts improve determinism. Repository skills live under `.agents/skills`.
- [Matt Pocock’s repository README](https://github.com/mattpocock/skills) advocates shared terminology, recorded decisions, and feedback through types, browser inspection, and automated tests. It documents debugging, TDD, research, and review skills, and recommends repository setup to choose issue tracking and documentation locations. Its Codex installation commands are:

  ```sh
  codex plugin marketplace add mattpocock/skills
  codex plugin add mattpocock-skills@mattpocock
  ```

  These are documented commands, not evidence of installation. The README then recommends `/setup-matt-pocock-skills`.
- [OpenAI worktrees documentation](https://learn.chatgpt.com/docs/environments/git-worktrees) describes independent checkouts sharing Git history. Managed worktrees normally start at the selected branch’s HEAD in detached mode; selecting local changes can include them. Git generally prevents checking out one branch in multiple worktrees simultaneously. This isolation does not define a maximum number of implementation revisions.

## Alexa-chan adaptations and proposals

- Use a compact root `AGENTS.md` as an index to existing authoritative docs and verified package scripts. Add narrower guidance only when a directory needs different rules.
- Scope each task to one observable outcome, permitted files, relevant evidence, and explicit completion checks. Diagnose unclear failures before expanding implementation.
- Make verification repeatable: use existing Node tests, Svelte checks, and build scripts appropriate to the change; stub external services where needed. Record exact commands and outcomes. Browser inspection supplements automated checks for UI behavior.
- Curate durable context: retain accepted decisions, definitions, constraints, source links, and dates; remove stale summaries. Preserve confidential originals and unrelated dirty work; do not copy private source contents into workflow notes.
- Select available skills by task fit; inspect installed versions and command support
  before setup. Keep reusable methods in skills, not copied into a broad harness.
- For parallel implementation, record the starting revision and owned files. Share
  approved context through committed/synced wiki pages and recheck integrated changes
  after merging; worktrees are not a live shared documentation store.

## Uncertainty

Web documentation and Matt’s default-branch README can change. Skill names and
setup behaviour may differ from an installed version. See engineering for the
dated local installation check; current source guidance is not proof of local setup.
