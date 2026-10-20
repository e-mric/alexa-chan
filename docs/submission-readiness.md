# Release and submission readiness — updated 20 October 2026

For the current milestone, source-workspace checks and handoff, read
[project state](project-state.md). This page owns the release/owner checklist and
dated release receipts; those receipts are not automatically refreshed by new code.

**Local judging product: prepared and verified. Devpost entry: not yet ready to
send.** The remaining account/publication steps are listed below, not hidden
behind a claim of full production readiness. Draft fields are saved; no entry has
been submitted.

## Current preflight — 20 October

The focused English → Japanese app now includes opaque reading surfaces, larger
audio targets, WebP imagery, torii entry icons and safe formatted/original Markdown
notes. Source gate: **78 tests passed**; refreshed clean-copy gate: **74 passed + four
intentional recording skips**; Svelte zero diagnostics, build/runtime/web audits pass.
[Current browser/audit evidence](persona-validation.md#remediation-and-installed-impeccable-audit--20-october-2026)
owns details and limits; the older receipts below remain historical.

**Confirmed by read-only GitHub inspection:** the judging repository was private,
at `84c7906`, with only the owner and no pending invitations before this refresh.
The owner authorized refreshing source, **not reviewer invitations or visibility**.
The development workspace remains separate and dirty. Refresh **`d26db33`** was
pushed and [its CI passed](https://github.com/e-mric/alexa-chan-submission/actions/runs/39465766000).
The owner-approved no-boxes/header follow-up is being verified separately. Read-only
access checks still show private, owner-only and no pending invitations.

New video: **112 seconds, 1920×1080, 24fps, H.264/AAC**, approximately 6.0 MB,
English Koichi narration plus motion-graphic captions over actual synthetic app
captures. [Demo materials](submission-demo.md) identifies the reviewed local file.
It still needs owner viewing and a public YouTube/Vimeo URL.

The owner confirmed a current paid ElevenLabs plan. Only new video narration was
generated under that confirmation; old free-credit clips stay out of judging code.
Generated-art entitlement and final personal/team eligibility remain owner checks.

Devpost MCP requires reauthentication; that connector was not retried. The owner
completed browser sign-in. The existing DRAFT was inspected and name/pitch,
short student-facing story, code link, Alexa+ track, no mini-challenges, testing
instructions, tool feedback, 14 technology tags and owner-confirmed learning answers
were saved.
Five synthetic real-app screenshots with captions are saved. Video URL and
thumbnail verification remain. Eligibility/final terms were not changed
and Submit was never clicked. This does not claim refreshed MCP credentials.

### Remaining before the entry is ready

1. Finish draft media and review the saved fields. The owner approved the no-boxes
   proposal; the actual implementation uses CSS shading, not a flattened mockup.
2. Owner reviews narration/video and clears art, then provides a public video URL.
3. Owner grants required access to the private judging repo (or chooses a cleared
   public licensed copy). No access settings will be changed by this refresh.
4. Owner reviews all fields and decides when to submit. **Do not submit in this task.**

### Local visual revision — 12 October

The current working checkout has a Mobbin-informed visual/UX pass: compact agenda,
shared Today/Notes/Memories labels, opt-in Japanese helpers with familiar-language
labels, visual notebook collection, quiet reading and a unified audio player with
language/source, pause/resume and slower playback. No private data was migrated.

Local revision checks: **68 tests passed**, zero Svelte errors/warnings and a
successful production build. Browser checks covered real MCP lookup without
automatic capture, device pause/resume and slower-while-paused behavior, unchanged
synthetic notes, unsaved-draft guards, opt-in review and reload persistence. A 390px
breakpoint check for the agenda and Dutch notebook library had no horizontal
overflow; that is not a physical-device or screen-reader certification.
The new device-voice distribution copy also passed clean installs, **64 tests
with four recording-catalogue checks deliberately skipped**, Svelte diagnostics
and production build. The main checkout's MCP runtime and web audits remained clean.

The GitHub commits/CI receipts, archive and 108-second video below describe the
previous shipped snapshot, not this local visual revision. They need refreshing
after owner review of the changed interface; no new video or push is claimed.

## Current release

The main example is Noor's university day. Public-facing navigation, onboarding
and copy do not mention the parked external programme. Personal student notes
use a new isolated browser key; existing private pilot contents remain untouched.
The useful day/notes → optional Japanese → explicit save → recall loop is the scope.

The clean judging repository is [e-mric/alexa-chan-submission](https://github.com/e-mric/alexa-chan-submission),
private pending owner review/access decisions. It starts a fresh distribution
history with **no ElevenLabs recordings**, private notes, calendar snapshot,
credentials, runtime stores or archived programme documents. The separate private
[owner source copy](https://github.com/e-mric/alexa-chan) retains development material.
Do not give reviewers that full copy while its recording entitlement is unverified.

`node scripts/prepare-judge-release.cjs` reproducibly copies an allowlisted source
package into a new temporary directory, omitting provider audio and replacing
only the copied audio catalogue with the device-voice template. It never mutates
the development checkout or its private data. Source artwork remains included;
the owner must confirm applicable generated-art usage entitlement before publication.

## Verification receipts

- Full development regression: **62 passed**, zero Svelte errors/warnings,
  successful production build.
- Clean judging copy: clean npm installs, **58 passed, four skipped** (only
  recording-catalogue checks, because recordings are deliberately absent), zero
  Svelte errors/warnings, production build succeeded. Speech behaviour still tested.
- Both `npm audit --omit=dev` at root and `npm --prefix web audit` report zero
  vulnerabilities. CI runs those checks as well as tests, diagnostics and build.
- Real production browser: fictional computer-science and group-project events;
  actual MCP initialization at 2025-11-25, discovery and tool calls; optional help,
  guided Japanese question, explicit save, reveal/rate and reload persistence.
  Asking Japanese did not silently save a card.
- Clean distribution notebook browser: calendar-free creation, original text
  including indentation, Japanese initially closed, optional meaning/romaji,
  Japanese device playback, immediate due phrase and reveal-before-rating.
  English, French, Dutch and German interface selections were checked. Language
  and original notebook persisted after reload. A synthetic backup was exported
  and restored into an empty origin, retaining original notes and one rated card.
  The clean root homepage also fetched the day through MCP; inspected consoles
  reported no warnings/errors.
- Student/parked personal storage isolation is covered by regression tests.
  No owner calendar/notes were imported, migrated or exported in these checks.
- English student capture: 108 seconds, H.264 1280 × 816 at 24 fps, ~6.2 MB.
  Local and silent, with edited readable pauses and captions. It is not a public
  video or a performance benchmark; see demo materials.

The build warns about the large Three.js bundle and dependency annotations.
Physical mobile-device/accessibility assessment, native-speaker review and real
learning outcomes remain unverified. This is a loopback pilot, not a hosted SaaS.

## Source delivery notes

The source checkout was committed locally using a Git implementation that does
not require Xcode. At that release, native Git was blocked by an unaccepted Xcode
licence, and no reusable GitLab credential was available; **the latest source has not been pushed
to GitLab**. No licence agreement was accepted on the owner's behalf. Both private
GitHub destinations are maintained separately; the judging copy omits provider
audio and private data. Verify their automated checks before sharing.

The first clean distribution commit was `288f912ff6abe3e58046b73f03ee5870d5d21791`;
[its Linux CI passed](https://github.com/e-mric/alexa-chan-submission/actions/runs/38184555551),
including tests, Svelte diagnostics, build and both audits. Later hardening adds
the student-only storage preflight regression; current results are listed above.
[Latest distribution checks](https://github.com/e-mric/alexa-chan-submission/actions).

## Official hackathon requirements

Rechecked read-only on **20 October 2026** against the requested [rules](https://amazonappdev2026.devpost.com/rules),
[FAQ](https://amazonappdev2026.devpost.com/details/faqs) and
[updates](https://amazonappdev2026.devpost.com/updates).

Deadline: **23 October 2026, 19:00 UTC / 21:00 Brussels**. Judging: 9–20 November.
Alexa+ accepts a self-hosted MCP server with protocol 2025-11-25 or later over
Streamable HTTP and an actual web client. Gated Alexa+ SDK/CLI/simulator and
physical devices are not required. Local runnable GitHub source plus video is
sufficient; hosting is optional. The implemented technical path matches this
route; this is not an organizer eligibility determination.

The entry needs GitHub code access, English description/testing instructions,
a public English YouTube/Vimeo demonstration below three minutes, feedback for
used developer tools/APIs/SDKs and track selection. No mini-challenge is claimed.
Submission-window work is described honestly in `devpost-submission.md`.

## Audio and dependencies

The browser confirmed an ElevenLabs Free plan; registration credits do not prove
a paid generation-time licence. [Provider publication guidance](https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform)
distinguishes Free-plan permissions/attribution from paid licensing. Whether the
intended prize submission is covered was not established. The judging package
therefore omits all those clips, including from initial history, and uses device
speech. Private originals remain preserved. Five private clips used 90 credits;
6,179 remained. No subscription was purchased or licence assumed.

The legacy ASK adapter retains an unresolved `node-forge` advisory and two high
full/development audit entries. [Advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
ASK and its tooling are now development-only dependencies; the MCP runtime does
not import them or expose `/alexa`. `npm start` launches MCP; do not expose
`npm run start:legacy` publicly or claim the entire legacy toolchain is cleared.

## Owner steps before submitting

1. Watch the student demo, approve the English write-up/feedback and confirm
   generated-art usage entitlement. Upload the approved video to YouTube/Vimeo
   and test unauthenticated playback. No public video URL exists yet.
2. Authorize/verify reviewer access to the clean GitHub repository or make a
   cleared source copy public. Rules name `chris-trag`, `knmeiss`, `giolaq`,
   `anishamalde`, `mosesroth`, `emersonsklar` and `testing@devpost.com`.
   Private invitations expire in seven days: issue near submission, not now.
   No invitations or visibility change were performed.
3. Sign in to Devpost, verify registration and personal/team eligibility, and
   complete the form with actual URLs, testing instructions, feedback and track.
   The live browser was logged out; remote draft/status remains unverified.
4. Review the final entry and explicitly authorize submission; verify its receipt.

The earlier connected overview returned an internal error; on 20 October the
connector required reauthentication. Neither registration nor submission was fabricated.
Aim to finish the owner steps by 21 October and retain a deadline buffer.

**Official Devpost pages prevail over this helper if requirements change or differ.**
