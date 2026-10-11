# Release and submission readiness — 12 October 2026

**Local judging product: prepared and verified. Devpost entry: not yet ready to
send.** The remaining account/publication steps are listed below, not hidden
behind a claim of full production readiness. No submission has been sent.

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

- Full development regression: **61 passed**, zero Svelte errors/warnings,
  successful production build.
- Clean judging copy: clean npm installs, **57 passed, four skipped** (only
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

## Official hackathon requirements

Checked against the requested [rules](https://amazonappdev2026.devpost.com/rules),
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

The connected Devpost overview call returned an internal error. Prior local rules
acknowledgment was preserved; neither registration nor submission was fabricated.
Aim to finish the owner steps by 21 October and retain a deadline buffer.

**Official Devpost pages prevail over this helper if requirements change or differ.**
