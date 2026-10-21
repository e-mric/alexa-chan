# Current project state

Reviewed **22 October 2026**, Europe/Brussels. This is a source-workspace handoff,
not a remote-submission receipt. Recheck source, working tree and external status.

## Accepted direction and authority

Finish the university-student pilot: useful day/notes → optional Japanese →
explicit keep → later recall. The student interface and explanations are now
**English → Japanese only**. Preserve old locale values, literal notes and backups;
do not migrate or reintroduce the parked programme. [PRD](prd.md) owns acceptance.

The owner authorized readability/mobile/media fixes, Impeccable installation/audit,
torii entry icons, formatted Markdown, a new English video and a **refresh of the
clean GitHub judging repository only**. The owner will manage reviewer access:
**no invitations or visibility changes**. Devpost fields may be drafted, but
**do not submit**. No new source-workspace commit/push is implied by the separate
judging-repository authorization.
The owner separately authorized **commit and push on 21 October**. The configured
source remote is GitLab `origin`, branch `main`; that operation does not refresh
the separate GitHub judging mirror or authorize submission/access changes.
Source commit `a4f4205b4fcc36889683f7f17d35febdbb6eedae` was pushed to GitLab.
The owner then separately requested the GitHub refresh recorded below.

**22 October authorization:** commit/push the scoped Kaela source and current
pitch/testing/media documentation, then refresh the clean GitHub judging copy.
Do not stage the private workflow-state file, generated media or runtime stores.
Reviewer access, visibility, video upload and final submission remain separate.
The owner is handling the YouTube upload; no public URL has been provided yet.

On 21 October the owner approved the generated notes-first reader/separate-card
design, pronunciation visible by default, and contextual audio without a duplicate
idle floating entry. This source checkpoint includes those changes. The three-shortcut diagram is
still a generated proposal, not an implemented feature or approved new interaction.

**Accepted presentation direction, 22 October:** explain Alexa+ relevance with a
short Kaela/Alexa-chan conversation: day first, Japanese on request, explicit keep.
The film must distinguish the intended Alexa+ conversation from real web-client
tool results. This authorizes a media/pitch revision, not a device connection,
English conversational frontend, notes upload, deployment or publication.
The owner then requested a from-scratch film centred on: **Alexa helps Kaela get
through her day; Alexa-chan makes room for a little Japanese inside that
conversation, only when she wants it.** Reuse cleared local artwork/music, but use
a fresh full narration and timeline rather than splicing the old recording.
The owner subsequently requested a **female narrator for Kaela**; this changes
the video voice, not the app's listening defaults or recording catalogue.

## Confirmed implementation

- **21 October:** the primary fictional student is now **Kaela**, including
  onboarding, page title, timetable heading and linked routes. This is copy only:
  storage keys, original notes and historical persona-test identities are unchanged.
  This rename is included in the verified/pushed 22 October release below.
- `/` and `/student-mcp`: actual SDK/Streamable HTTP MCP, labelled fictional
  rolling timetable, explicit phrase capture and server-persistent review.
- `/student` and `/student-ride`: browser-local original notebooks and separate
  opt-in memories. Settings focus on backup/privacy, not parked calendar import.
- English presentation does not overwrite older stored FR/NL/DE preferences.
  MCP language schema is English only; Japanese language parts remain explicit.
- Opaque reading surfaces and shared contrast tokens; larger audio targets;
  viewport-selected WebP rider and smaller Fuji/notebook cover derivatives.
- The owner approved the generated no-boxes direction. It is now implemented:
  localized feathered shading behind the intro, translucent header/navigation,
  unchanged world artwork and opaque ivory task cards. Desktop and narrow
  layouts were checked; phone spacing leaves the rider below the title.
- Saved Markdown has Formatted/Original text views. Exact source still owns edits
  and backups. Raw HTML is inert; remote images and unsafe/relative links are inactive.
- Student notebooks now open in a focused reader; optional Japanese has its own
  screen with default-visible pronunciation, explicit meaning reveal and capture.
  Returning restores scroll and keyboard focus. Collections no longer repeat covers.
- Focused notes/cards hide idle Audio options; More retains advanced page/text tools.
  Playing/paused transport, storage/audio failures and text-picking remain explicit.
- Device audio stays the judging-app default. The global player now reflects whether
  recordings are actually enabled. No autoplay; pause/slower behavior is tested.
- No live university calendar, open-ended tutor, cloud notes account or direct
  Alexa+ device connection is claimed. [Engineering](engineering.md) maps ownership.

## Verification and audit

**22 October publication receipt:** source checkpoint
**`ffd9e1bd871b3d4dd77b5e6134f79c4753d65a57`** was pushed to GitLab `origin/main`.
The clean 118-file judging refresh was pushed to GitHub `main` as
**`83e5ca75c7b2c146ec0bbf9cf7d5e07fd84e2775`**.
[Its exact Linux CI passed](https://github.com/e-mric/alexa-chan-submission/actions/runs/39691282144).
The runtime now includes Kaela, the rendered regression and matching pitch/testing
docs. Only the source workspace's private workflow-state file remains outside the
scoped commits. Media, private data and recordings were not added to the clean
repository. Later receipt commits change documentation only; they do not alter
the runtime verified at these checkpoints. No access or Devpost changes occurred.

**22 October release candidate, Node 24.20.0:** source `npm run verify` passed
**84 tests**, zero Svelte errors/warnings, build and clean production-runtime/full-web
audits. A fresh 118-file provider-free package passed clean installs and the same
gate: **80 passed, four intentional recording-catalogue skips**, zero diagnostics,
build and clean runtime/full-web audits. Legacy full/dev ASK exposure remains.
The package contains no provider recordings, private workflow state, runtime data
or parked programme documents.

The built package at isolated port 3012 confirmed Kaela onboarding, real MCP day,
explanation, explicit question save, reveal/rating and next-review persistence on
reload/reconnect. A synthetic Markdown notebook rendered correctly, exact source
was retained, optional Japanese opened separately with pronunciation visible, and
return restored focus. No audio playback or physical-device assessment was repeated.
Evidence is owner-local under `data/release-2026-10-22/`. The test tab/server were
closed; existing development servers and private notebooks were untouched.

**21 October, local dirty source including Kaela:** `npm run verify` passed **84 tests**, zero
Svelte errors/warnings, build, production-runtime audit and full web audit. The gate
initially found a newly reported Vite advisory; the lockfile-only compatible patch
from 7.3.6 to 7.3.7 cleared it. No other dependency changed in that fix.

Synthetic browser checks on the separate local origin at port 3006 covered a long
Markdown note, exact source in edit mode, unsaved-draft guard, separate card, default
pronunciation/toggle, explicit capture and reload, and 1800px scroll/focus restoration.
Reader/card reflow passed at 320/390/768px and desktop at 1280px. Contextual listening,
More tools, focus return, English device pause/slower/stop and Japanese recorded
playback were exercised. Impeccable found no warnings in the new card/global-player
pass; the broader shared notes/journey scan retained seven legacy/style warnings.
This is not a physical-device, native-speaker or accessibility certification.

**21 October, local Kaela distribution:** a fresh 118-file provider-free copy passed
clean installs and `npm run verify`: **80 passed, four intentional recording skips**,
zero Svelte diagnostics, build and clean runtime/full-web audits. Browser capture
on port 3009 confirmed actual local MCP results, synthetic notes with exact source
preserved, optional card/default pronunciation, explicit save/review/rating and
reload persistence. Kaela onboarding also rendered at 390px. Full-page capture
shows the idle floating audio entry crossing a secondary link at that viewport;
this was observed, not fixed or certified as accessible by the media task.
The temporary capture server was stopped; existing development servers were left
alone. No Kaela release was pushed, deployed or submitted.

**21 October, confirmed judging refresh:** allowlisted source from `a4f4205`
was pushed separately as **`1c36f2bd1eff8f40f565e0fce2bfc3bcaca4382c`** to
[the judging repository](https://github.com/e-mric/alexa-chan-submission).
[Its exact GitHub CI passed](https://github.com/e-mric/alexa-chan-submission/actions/runs/39672294741).
Fresh clean installs and `npm run verify` passed locally: **79 passed, four
intentional recording-catalogue skips**, zero Svelte diagnostics, build and clean
production-runtime/full-web audits. The 118-file allowlist had no private data,
provider recordings, parked documents or extra tracked files. Browser smoke on
the built clean copy at port 3007 confirmed actual local MCP connection, synthetic
Markdown save/read, separate Japanese card, default pronunciation and device-only
listening disclosure. This is not an Echo/Alexa+ device test.
The destination remains private, owner-only, with no pending invitations.
The Devpost screenshots still predate this reader pass. The owner-local video was
refreshed on 21 October as recorded below; it has not been uploaded to Devpost.
Port 3006 contains explicitly synthetic test notebooks, including a UI-check note
with harmless HTML/image-blocking samples; these are not seeded into the product.

**20 October, macOS / Node 24.20.0 / npm 11.19.0, dirty source based on main
`b4776efe788ac70a4c232da2af7d09964d6c7536`:**

- Full local gate passed: **78 tests**, zero Svelte errors/warnings, production
  build and clean production-runtime/full-web dependency audits.
- Fresh provider-free judging copy: clean installs and gate passed, **74 passed,
  four intentional recording-catalogue skips**. Legacy full/dev audit still has
  two high ASK-chain advisories; that entry point is not the production MCP app.
- Browser: actual MCP question/save/reveal/rate/reconnect; private notebook
  save/read/Markdown/source/edit, optional Japanese/device audio, personal review,
  synthetic French-preference backup recovery with English UI and unchanged text.
- Rendered notebook reflow checked at 320/390/768px and desktop at 1280px. Audio
  targets measured at least 44 × 44. Metadata contrast **5.70:1**; opaque paper on
  ink **12.74:1**. Earlier inspected consoles were empty; a long-lived preview tab
  later recorded stale chunk fetches during rebuilds, resolved on reload. No new
  error appeared in the final MCP smoke check. Owner data untouched.
- Impeccable **4.7.0** installed; source detector ran, returning **10 style warnings**.
  Follow-up manual score **14/20**, not automatic clearance or WCAG certification.
  [Audit evidence and limits](persona-validation.md#remediation-and-installed-impeccable-audit--20-october-2026).
- Eight new regressions cover semantic colour ratios, responsive asset budgets,
  English presentation/schema compatibility, restricted Markdown rendering and
  no-boxes intro structure and translucent surface-core contrast over white.
  This does not numerically certify every pixel of the feathered edge.
  Existing audio tests also cover actual recording availability.

The earlier 17 October gate was 70 tests; the 20 October gate was 78. Neither is
the latest source revision's receipt.
Large Three.js/dependency-annotation build warnings remain. No physical-device,
screen-reader/text-zoom, native-speaker or learning-outcome certification is claimed.

## Submission materials and remaining authority

**22 October, current female-voice film:** **78 seconds**, 1920×1080, H.264/AAC,
24fps. One new complete **71.84-second Jessica** narration cost **1,297.8702
credits**. The approved script, artwork, actual synthetic app captures and quiet
music are unchanged; scenes and captions follow the new delivery. No voice joins
or trims. The Alexa+ pitch comes before the short opt-in exchange; notes remain
a supporting moment. Concept dialogue and actual web results stay labelled.
The underlying isolated port-3011 checks exercised all five tools, explicit saving,
review and next-review persistence after reload/reconnect. Those are reused
22 October web evidence, not a new app/device test for this voice-only edit.
No runtime, app listening default, private notes or remote draft changed.
The previous 79-second Koichi film remains preserved with its export receipt.
Full encoded decode, 16 storyboard/16 encoded samples, complete voice and retimed
caption checks passed; final levels are −16.16 LUFS, −1.82 dBTP. Documentation
checks passed; no runtime gate was rerun for the media-only edit.
Owner full watch/listen and pronunciation review remain before publication.
The owner requested a submission-ready filename: the byte-identical local copy
is `data/submission-2026-10-22/Alexa-chan-Devpost-Demo.mp4`; source media is preserved.
[Demo materials](submission-demo.md) owns exact files, provenance and QA; the
[judge guide](mcp-judge-trial.md) maps intended turns to working web controls.

**22 October pre-refresh read-only publication check (superseded by the receipt
above):** GitLab `main` resolved to
`a4f4205b4fcc36889683f7f17d35febdbb6eedae`. The judging GitHub `main` resolves to
docs-only `90f7e74520a00104def8514d83bfba344fcb48a4`; its exact CI succeeded.
The remote `StudentMcp.svelte` still renders **MEET NOOR / Try Noor’s day**.
It is private, with only `e-mric` and zero pending invitations. Local Kaela copy,
regression and current pitch/media documentation were uncommitted/unpushed then.
The video is ignored local media, not Git source. Devpost `get_project` returned
reauthentication required; no retry, login, remote write or submission occurred.
The earlier browser-draft receipt is not a current live verification.

The previous **105-second insert cut is superseded**: a reported voice glitch
near 00:20 was traced to an audio trim through active speech. Its earlier decode
and level checks were insufficient to establish perceptual quality. Older films
remain preserved; the fresh film uses one uncut narration instead.

**21 October, preserved Kaela manga-story export:** the earlier owner-local English film is
**90 seconds, 1920×1080, H.264/AAC, 24fps**. Practical first-person Kaela narration
is matched to real notes/card/review captures, three original manga pages, panel
reveals, chapter stamps, animated callouts and English captions. One replacement
Koichi take cost **1,491.8508 credits**; existing quiet instrumental music was reused
without another generation. The end card uses the owner's approved “Working web
demo powered by a self-hosted MCP server.” It does not narrate device-test limitations.
Encoded decode, sampled frames, captions and level checks passed; full owner
watch/listen review remains. [Demo materials](submission-demo.md) owns the exact
path, provenance, QA and preserved earlier drafts. Nothing was uploaded to Devpost.

The owner confirmed a **current paid ElevenLabs plan** and authorized the new audio.
The MCP voice lookup and speech/music generations worked.
This does not retroactively clear older free-credit clips; those remain excluded
from judging source. No subscription was bought or private notes uploaded.

Devpost MCP returned **reauthentication required**; no stale connector retry was
made. The owner completed browser sign-in. The existing **DRAFT** was inspected
and its name, shōnen-style pitch, simplified student story, GitHub link, Alexa+
track, no mini-challenges, testing instructions and five feedback answers saved.
The owner's learning/career answers are Significant/Yes. Eligibility attestations
and final terms were not changed; Submit was never clicked. Five actual synthetic
app screenshots with captions and 14 technology/creative-tool tags were saved.
The actual-app thumbnail is also verified on a fresh overview page. Video URL
and final owner review remain. These are browser
receipts, not a claim that connector credentials were refreshed.

The owner explicitly requested the official pages be rechecked. Read-only website
review on 20 October confirms the recorded deadline **23 October, 21:00 Brussels**,
actual web MCP client/server route, GitHub access, English public sub-three-minute
video and feedback requirements. This did not pass the connector's blocked rules
gate or accept any new terms. [Release checklist](submission-readiness.md) owns
official links, repository/access decisions and remaining owner steps.

## Next steps

1. The verified Kaela runtime is pushed to both repositories, with exact GitHub CI
   passing as recorded above. Keep the private workflow-state change uncommitted;
   do not mistake the ignored local video for a public submission link.
2. Review the new 78-second female-voice film, not the previous male-narrated cuts.
   Owner: verify eligibility, approve the video/art and provide the public link/reviewer access.
3. Owner: review saved draft fields, provide the public video URL and complete
   personal eligibility/terms only when ready. Never click Submit in this task.
4. Run a real seven-day notebook trial and competent-speaker review after this
   milestone. More integrations, native apps and messaging remain out of scope.

Other chats start from [the index](index.md) and [starter prompts](chat-starters.md).
Existing unrelated dirty work remains preserved. Use Git/release receipts rather
than this handoff as proof of publication.
