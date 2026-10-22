# Alexa-chan — English submission draft

Updated 22 October 2026. Draft only; final submission remains separate. The signed-in
browser saved and re-read the revised pitch, Kaela story, neutral timetable
caption and video URL. The preview shows the new video/thumbnail and still says
INCOMPLETE SUBMISSION. The separately authorized gallery refresh replaced all
five older images with real current-build captures: Kaela's fictional day,
focused notes, separate Japanese card, saved-phrase review and actual MCP proof.
Captions and order were re-read after saving. Original capture files remain
preserved locally. That gallery task did not change repository access,
additional-info answers or eligibility/terms.

The subsequent authorized additional-info refresh was saved and re-read: current
public-repository cloning, focused notes/separate Japanese card instructions,
English/Japanese scope, final 78-second female narration/music and explicitly
historical prototype integrations. The owner had already corrected the code and
friction-log URLs to `https://github.com/e-mric/alexa-chan`; a read-only GitHub check
confirmed the renamed clean repository is public, with an ISC license detected.
Eligibility, Significant/Yes, track and mini-challenge selections were preserved.
Final terms remain unchecked; the project is still DRAFT, not submitted. No GitHub
contents or local Git remotes were changed by this form update.

The owner subsequently confirmed the final video/signed-out playback and personal
eligibility/terms reviews are okay, and authorized this documentation push and
clean GitHub refresh. This is owner-reported review, not a new agent assessment
or evidence that the final submit action has occurred.

## Name and tagline

Name: Alexa-chan

Pitch: Take on your day with Alexa-chan. Make room for a little Japanese in the
conversation, only when you want it. Your next chapter starts one phrase at a time.

## Public project story

### Your day comes first

Kaela has classes to get to, a group project to prepare, and notes to reread. She is
curious about Japanese, but she does not need another task on her list.

Alexa-chan explores a simple idea: Alexa helps Kaela get through her day, and a
little Japanese can join that conversation only when she wants it.

### One small adventure

Imagine Kaela asking, “Alexa-chan, what’s on my day?” She gets the useful answer
first. Then, if she is curious, she can ask how to say that in Japanese.

She can hear a phrase, discover its meaning, and choose to keep it for another day.
Or she can move on. Nothing plays automatically, and exploring a phrase never
silently adds it to her review cards.

The manga-inspired city and motorcycle ride give this everyday journey a sense of
adventure. Kaela is the example character. Alexa-chan is the companion at the
centre of the idea.

### Her notes stay hers

After class, Kaela rereads her notes on a quiet, separate screen. The app never
rewrites what she wrote. Her original text and Markdown stay in her browser, and
she can back them up.

An optional Japanese card waits separately, without interrupting a long note. She
chooses whether to open it, listen, or save the phrase.

### What works today

The working web demo includes a fictional university day, original study notes,
listening, explicit phrase saving, and later review. A self-hosted MCP server
powers the example-day tools and saved example cards.

The video distinguishes the imagined Alexa conversation from the working web app.
This prototype is not connected to a live university calendar or directly to an
Alexa+ device.

### What we built and learned

We built the web experience with SvelteKit, a Three.js ride, and a Node.js MCP
service. Codex helped with implementation and testing; generated manga artwork
and ElevenLabs narration bring Kaela’s story to life.

The biggest challenge was keeping Japanese optional. A useful day and readable
notes must come first. Next, we want real student trials and a competent Japanese
speaker to review the phrases.

Your day. Your pace. A little Japanese along the way.

## Technical and judge reference

The sections below support testing and additional-info fields. They are not the
public About text.

## Track

Alexa+ via a self-hosted MCP server and actual web client. No mini-challenge
claimed; no direct Alexa+ device connection, AWS deployment or Kiro contribution claimed.

## Inspiration

Kaela is curious about Japanese, but university already fills her day. We wanted
learning to accompany something useful: checking classes, planning a group project
or rereading study notes. A short familiar phrase can invite curiosity without
turning every visit into a lesson. The focused student experience is English →
Japanese; original notes are not automatically translated.

## What it does

Alexa-chan answers a practical request first, then offers one small Japanese
encouragement. Iké explains the meaning, Motto adds detail, and Nanté teaches the
corresponding question. Kaela can ignore Japanese, listen, explore, or explicitly
keep a phrase for later recall. Trying Japanese never silently enrols her in review.

The English university example uses a real MCP web client/server inside an
original cyberpunk motorcycle journey. The clearly fictional timetable rolls
forward with the date; no university login, private calendar or API key is needed.
Asking the guided Japanese question retrieves the day through a tool call.
Saved phrase reviews persist on the local server; the visible request trace
shows actual protocol calls, not a prerecorded connection animation.

The companion notebooks let a student keep original text/Markdown, save and
reread it without a calendar, and explore one curated Japanese phrase only when
curious. Personal notes remain in the browser, with backup/restore. The simpler
view shares the same data as the ride; reading notes pauses the motion.
Saved Markdown has formatted and original-text views, with exact source preserved
for editing and backups. Raw HTML cannot run, and remote images do not load.

Notes are not automatically translated or rewritten. No live campus integration,
general-purpose conversational AI or proven language-learning outcome is claimed.

## How we built it

SvelteKit handles the interface, Three.js the ride, and Node.js/Express the local
service. The official MCP SDK implements Streamable HTTP with protocol 2025-11-25.
Five tools read the day, explain a phrase, save it, list memories and schedule reviews.

Personal and example-profile stores are separate. MCP receives no personal notes
or calendar. Example profiles use random local access keys; hashes and progress
are persisted atomically. This is a loopback judging pilot, not a cloud account service.
The judging distribution uses labelled device speech and contains no ElevenLabs
recordings. A separate English demo video uses a freshly generated ElevenLabs
narration, after the owner confirmed a paid plan. Earlier free-credit recordings
remain excluded. GPT Image created original visuals; source/media notices distinguish
code licensing from generated-media rights.

## How we used AI and Codex

Codex supported implementation, debugging, regression tests and browser journey
checks. Claude helped with the earlier prototype; GPT Image supplied original
cyberpunk artwork. The current app uses curated Japanese phrases and deterministic
review logic, not a hidden general-purpose LLM or automatic note translation.
ElevenLabs generated the new English video narration, not live answers in the app.

## Work during the submission window

Local development history begins 17 September 2026. The project evolved from a
classic Alexa dashboard into SvelteKit, contextual Japanese, explicit review,
a Three.js ride and original notebooks. Real MCP tools/client were added on
7 October (`0ed10b3`), notebooks on 7 October (`8e9491e`). On 12 October,
four fictional persona checks drove calendar-free entry/review fixes, and the
primary example became a university student with isolated personal storage.
GitHub distribution snapshots have separate history; they are not the original
project creation date. No pre-window work is claimed as new work.

## Challenges and lessons

The key design challenge was knowing when to stop teaching. Reading notes must
remain useful when Japanese never opens. Stable phrases and voluntary exploration
serve that goal better than adding a lesson or reward to every interaction.

A reproducible integration mattered too: clean clones must work after the filming
date changes. Real protocol traces and saved reviews make that claim inspectable.
The four personas are simulations, not interviews or proof of learning effectiveness.

## Testing instructions

Clone the public [judging repository](https://github.com/e-mric/alexa-chan).
Use Node.js 24 LTS: `npm ci`, `npm --prefix web ci`, `npm run build`, `npm start`.
Open http://127.0.0.1:3001/student-mcp. Connect, inspect today's example classes,
try a helper/question, keep a phrase, reveal/rate it and reconnect after reload.
Expand Connection proof. No external account keys are needed.

For private notebooks, open `/student`, create a titled dated
notebook, paste synthetic notes and save. Open the focused reader and compare
Formatted / Original text. Japanese opens on a separate optional card with
pronunciation visible by default; return to the note without losing your place.
Personal notes/review stay separate from server example profiles. Keep the
same origin for stored data; export a backup before switching devices. Device
audio depends on installed voices. See `docs/mcp-judge-trial.md`.

## Built with

Node.js, Express, JavaScript, SvelteKit, Svelte, Three.js, Model Context Protocol,
MCP TypeScript SDK, Web Speech API, markdown-it, GPT Image, Codex, Claude, Zod.
ElevenLabs supplied the separate video narration, not recordings bundled in the app.

## Required links and feedback

- Source: public [clean GitHub distribution](https://github.com/e-mric/alexa-chan),
  with an ISC license detected by GitHub on 22 October.
- English demo: [Kaela’s Next Chapter](https://youtu.be/UNwvPkaCGCg), supplied by
  the owner and saved in Devpost. Embedded thumbnail verified; signed-out full
  playback was not independently verified by the agent. The owner subsequently
  confirmed the video/playback review is okay.
- Tool/API feedback: `docs/product-feedback.md`.
- Test evidence and release checklist: `docs/persona-validation.md`, `docs/submission-readiness.md`.
- Actual captured demo: `docs/submission-demo.md`.

## Next

Run seven-day trials with real permitted study material, have a competent speaker
review Japanese, and fix the largest usability problem. Then explore consented
calendar integrations and a supported Alexa+ connection, without expanding into
unrelated messaging or native apps before the core loop is useful.
