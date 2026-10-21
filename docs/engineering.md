# Engineering and development workflow

Reviewed 21 October 2026 against current source. [AGENTS.md](../AGENTS.md) owns
rules; [project state](project-state.md) owns progress; [PRD](prd.md) owns product
acceptance. This map describes the existing application, not a reorganization plan.

## Feature ownership

| Feature | Presentation | Rules / application | Infrastructure / boundary |
| --- | --- | --- | --- |
| Example day and server memories | `StudentMcp.svelte`; `/`, `/student-mcp` | Tool orchestration in `lib/mcp-app.js`; phrases/review in `web/src/lib/founders.js` | `founders-mcp.js` official SDK client; `lib/mcp-store.js` atomic JSON; `mcp-server.js` loopback entry |
| Personal notebooks and review | `FoundersJourney.svelte`, `SessionNotes.svelte`, `NotePhraseCard.svelte`; `/student`, `/student-ride` | `session-notes.js` validates/imports/selects a stable phrase; `note-markdown.js` owns the HTML-disabled Markdown renderer; `founders.js` validates backups/reviews | Storage injected into helpers; browser `localStorage` wiring in journey |
| Listening and localization | `AudioReader.svelte`, `Listen.svelte`; `*-copy.js` | Queue/state and explicit language/source in `speech.js` | Web Speech / HTML audio; exact-text manifest `voice-recordings.js` |
| Ride and identity | `RideScene.svelte`, `JourneyNav.svelte`, `Torii.svelte`, `identity.css` | `ride-motion.js` motion/contact; `ride-assets.js` viewport atlas selection | Three.js; original imagery and WebP derivatives |
| Legacy Alexa experiments | Old routes, `dashboard/`, `skill-package/` | `lib/skill.js`, `learning.js`, `review.js`, `state.js` | `server.js`, ASK, weather and developer-managed calendar providers; explicit legacy start only |

Web filenames above are under `web/src/lib/` unless a different path is shown.
Historical `founders*` internal names are shared implementation, not public branding.
Do not rename them or stored identifiers merely to tidy the tree; preserve contracts.
Detailed MCP tools/security/store keys are owned by [the integration guide](mcp-judge-trial.md).

Student presentation is always English (`student-copy.js:interfaceLocale`), without
rewriting stored locale values or original notes. MCP tool language is English only.
The parked UI and old translation catalogues remain for compatibility. Markdown
rendering is presentation only: source/storage schemas are unchanged. Raw HTML is
disabled; custom link validation allows HTTP(S)/mailto only, and images become inert
alt-text placeholders. Do not add plugins/embeds without security regressions.

The focused student reader keeps its DOM mounted while the separate optional
`NotePhraseCard` is shown, restoring window scroll and the invoking control on return.
Discovery is not review: no rating is attached to an unsaved suggestion. The transient
focused-listening/tools stores in `audio-copy.js` only control presentation; they are
not persisted with notes. `AudioReader` retains page/selection reading and transport,
but its idle toggle is hidden in the focused reader/card and accessed through More.

The server is CommonJS, web helpers are ESM, UI uses Svelte 5 and tests use
`node:test`/strict assertions. Follow neighbouring code and explicit injection seams.
When extending a feature, group its behaviour coherently; use domain/application/
infrastructure/presentation layers only where there is actual behaviour to separate.
Keep interfaces small and dependencies explicit. No architecture rewrite, DI framework,
TypeScript migration or mandatory new folders is required for this milestone.

## Run and verify

Use Node 24 LTS; install both lockfiles with `npm ci` and `npm --prefix web ci`.

| Need | Command / environment |
| --- | --- |
| Built app, including MCP | `npm run build`, then `npm start`; `http://127.0.0.1:3001/` |
| Hot reload | Keep MCP on 3001, run `npm run dev`; `http://127.0.0.1:5173/` |
| Complete local/CI gate | `npm run verify` |
| Documentation-only edits | `npm run check:docs`, factual/formatting review and scoped diff |
| Focused regression | e.g. `node --test test/session-notes.test.js` or `node --test test/mcp.test.js` |
| Fresh judging source copy | `node scripts/prepare-judge-release.cjs`; inspect its returned new directory |

Vite proxies `/mcp` to 3001; its `/api` proxy targets the separate legacy server on
3000 and is not needed for the current student journey. Starting only Vite cannot
make the MCP connection work. Use the built server for a final smoke test. Reuse
the exact origin for personal storage; a new host/port is a different store, not a
data-loss fix. The old file-opened dashboard is not the supported entry point.

`verify` checks local documentation targets, runs all Node tests, Svelte diagnostics,
production build, root `npm audit --omit=dev` and full web audit, stopping on failure.
CI installs both lockfiles on Linux/Node 24 and runs the same command. Audits need
registry/network access; report network failures as unavailable evidence, not a pass.
`test/note-screens.test.js` uses the existing Vite/Svelte compiler to render the real
card/collection on the server and adds source-contract checks. It does not simulate
browser events; scroll/focus, draft guard and listening still require the UI journey.
The docs check validates Markdown inline/reference local paths; it does not validate
anchors, external URLs, prose claims, runtime routes or confidentiality.

The root full/dev audit retains legacy ASK advisory exposure; the production MCP
audit excludes that chain. Do not claim every dependency is cleared or expose
`start:legacy` publicly. Read [readiness](submission-readiness.md#audio-and-dependencies)
before changing that boundary. Large Three.js chunks are a build warning, not a
mobile-performance assessment. There is no dedicated formatter/linter, browser E2E
runner, screen-reader suite or learning-outcome test; Svelte check is not a substitute.

## Change loop and evidence

1. **Bound:** read the three entry documents, inspect status/diff and relevant code.
   State goal, constraints, exclusions, observable acceptance, checkpoints and checks
   before a complex change. Identify existing dirty work and the review baseline.
2. **Implement:** one feature/fix at a time. Reproduce a bug and add a meaningful
   regression; use test-first when appropriate/requested. Keep source facts distinct
   from hypotheses and do not refactor unrelated shared helpers.
3. **Verify:** start with affected behaviour. Business/validation tests use synthetic
   input; application decisions test opt-in capture, draft safety and review. Inject
   clocks, storage, fetch/audio where deterministic. MCP tests use actual SDK client/
   server over loopback and temporary stores, including restart, isolation and failure.
   Calendar-provider tests use controlled responses, not real Google authorization.
4. **Exercise UI:** relevant useful task, Japanese ignored and explored, explicit
   save/review, reload, failure handling, keyboard focus, motion and narrow viewport.
   For notes also test literal text/draft guard/backup recovery; audio needs actual
   installed-voice/missing-voice and pause/speed checks. Use synthetic notes and an
   agreed test origin. [Walkthrough](student-trial.md), [MCP steps](mcp-judge-trial.md).
5. **Review/handoff:** compare the scoped final diff with acceptance and invariants;
   report passed/failed/skipped/unverified checks with date, environment and revision
   or working-tree scope. Update the authoritative topic and current state when
   material facts change; list remaining actions and owner dependencies.

Automated persona tests are model/data journeys; they do not test every DOM control
or constitute interviews. [Persona validation](persona-validation.md) owns those
distinctions. Browser automation is not physical-device, pronunciation or human
usability sign-off. A pure-doc edit needs link/fact/format checks, not unrelated
application tests; changes to verification scripts or CI need their gate exercised.

## Skills

Verified 17 October: marketplace `mattpocock`, installed/enabled plugin
`mattpocock-skills@mattpocock` 1.3.1. The requested methods below are exposed
in this chat. Discover availability again in a new environment; the plugin cache
may contain methods not exposed in its current skill catalog.

| Intent | Method |
| --- | --- |
| Specific evidence question, durable primary-source findings | `research` |
| Small interfaces, explicit/testable seams | `codebase-design` |
| Ambiguous domain terms or consequential architectural decision | `domain-modeling` |
| Bounded experimental design question | `prototype` |
| Reported failure or performance regression | `diagnosing-bugs` |
| Test-first feature/fix or requested integration tests | `tdd` |
| Independent standards/spec review against a named baseline | `code-review` |
| Pull-request description | `pr` |
| Agent-facing instructions/routing | `writing-for-agents` |

Read the installed instructions before using any method. Apply the skill
selection/conflict rules in AGENTS, not all workflows on every change. Product,
research, design, implementation and testing phases may have different primary skills.
No custom skill or additional plugin is needed for the present workflow.

On a machine where these are missing, inspect `codex plugin marketplace list` and
`codex plugin list --marketplace mattpocock --json`, then install only missing parts:

```sh
codex plugin marketplace add mattpocock/skills
codex plugin add mattpocock-skills@mattpocock
```

Verify installed/enabled state and current skill exposure afterward. Preserve
unrelated settings; no update/reinstallation was needed here. See [source notes](workflow-sources.md).

## Chats, worktrees and releases

Use the [starter prompts](chat-starters.md); a transcript is not shared context.
Before editing a shared page, re-read its current contents and merge updates.
Do not store credentials, personal notes or verbatim source dumps in handoffs.
Project state is a current summary; Git supplies ordinary edit history.

For overlapping implementation, agree on a committed foundation (including wiki
and shared uncommitted UI work only after review/authorization), then create a
separate worktree on a `codex/` branch when authorized. Uncommitted files do not
follow into a new worktree. Commit/cherry-pick/merge approved shared updates and
re-read them before depending on them; coordinate shared doc edits rather than
treating identical paths in different checkouts as a live shared database.
No new chats, worktrees, recurring jobs, remote changes or publishing are implicit
in adopting this workflow.

The judging-copy script is an explicit allowlist: new required files/docs must be
added deliberately. It creates a fresh directory, excludes private data and
provider MP3s, replaces the copied audio manifest with the device-only template,
and leaves source untouched. Check the resulting copy, run clean installs and
`npm run verify` there before sharing. Only recording-catalog tests may skip because
the clips are omitted. Runtime stores, local captures and the owner development
copy are not release inputs. Remote repos use separate snapshot histories; verify
the exact destination/revision, reviewer access, media rights and [owner checklist](submission-readiness.md)
before any authorized publication. A local pass is not a GitHub CI receipt.
