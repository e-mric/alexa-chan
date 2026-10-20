# Alexa-chan — English submission draft

Updated 20 October 2026. Draft only; owner review and the public video URL are
required. Browser sign-in confirmed the existing DRAFT. Name, pitch, public story,
source link, track and additional technical answers were saved without submitting.
Video URL, screenshots/thumbnail, fuller technology tags and owner review remain.

## Name and tagline

Name: Alexa-chan

Pitch: Your next chapter starts between classes. Take on your day, keep your notes,
and discover Japanese along the way. One phrase at a time. Let’s go!

## Public project story

### Inspiration

You love the idea of learning Japanese. Finding time for another course? Not so easy.

Alexa-chan brings a little Japanese into something you already do: checking your
day and rereading your study notes. Your day comes first. Learning is an invitation.

### Meet Noor

Noor is a university student with classes, a group project, and notes to go through.
She opens Alexa-chan to see her day. Alongside the useful answer, she finds a short
Japanese encouragement.

She can leave it there, listen to it, or get curious. **Iké** explains the meaning.
**Motto** goes a little deeper. **Nanté** shows her how to ask the question in Japanese.
If a phrase matters to her, she can save it and come back to it later.

After class, Noor keeps her own notes. Her words stay unchanged and private in her
browser. A Japanese phrase is there if she wants it, never a compulsory lesson.

### A small adventure between classes

A red motorcycle, a city ahead, and Mount Fuji on the horizon. The shōnen-inspired
ride gives everyday student life a sense of adventure. Prefer somewhere quiet to
read? Switch to the simple notebook view.

There is no streak to protect and no lesson blocking your notes. You choose what
to explore and what to keep.

### What we built and learned

We built a working web app with an example day, personal notebooks, listening,
phrase saving, and later review. The hardest part was keeping it useful without
turning every visit into a language exercise.

The demo timetable is fictional. It uses a real local MCP connection for the Alexa+
track, but does not connect to a live university calendar or an Alexa+ device.

Next, we want students to try it in their own routines and a competent Japanese
speaker to review the phrases. The goal is simple: enjoy your day, and perhaps
take a little Japanese with you.

## Technical and judge reference

The sections below support testing and additional-info fields. They are not the
public About text.

## Track

Alexa+ via a self-hosted MCP server and actual web client. No mini-challenge
claimed; no direct Alexa+ device connection, AWS deployment or Kiro contribution claimed.

## Inspiration

Noor is curious about Japanese, but university already fills her day. We wanted
learning to accompany something useful: checking classes, planning a group project
or rereading study notes. A short familiar phrase can invite curiosity without
turning every visit into a lesson. The focused student experience is English →
Japanese; original notes are not automatically translated.

## What it does

Alexa-chan answers a practical request first, then offers one small Japanese
encouragement. Iké explains the meaning, Motto adds detail, and Nanté teaches the
corresponding question. Noor can ignore Japanese, listen, explore, or explicitly
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

Use Node.js 24 LTS: `npm ci`, `npm --prefix web ci`, `npm run build`, `npm start`.
Open http://127.0.0.1:3001/student-mcp. Connect, inspect today's example classes,
try a helper/question, keep a phrase, reveal/rate it and reconnect after reload.
Expand Connection proof. No external account keys are needed.

For private notebooks, open `/student`, create a titled dated
notebook, paste synthetic notes and save. Explore Japanese optionally. Keep the
same origin for stored data; export a backup before switching devices. Device
audio depends on installed voices. See `docs/mcp-judge-trial.md`.

## Built with

Node.js, Express, JavaScript, SvelteKit, Svelte, Three.js, Model Context Protocol,
MCP TypeScript SDK, Web Speech API, markdown-it, GPT Image, Codex, Claude, Zod.
ElevenLabs supplied the separate video narration, not recordings bundled in the app.

## Required links and feedback

- Source: verify the clean GitHub distribution and reviewer access before submission.
- Public English YouTube/Vimeo demo: owner-reviewed upload pending; no URL claimed.
- Tool/API feedback: `docs/product-feedback.md`.
- Test evidence and release checklist: `docs/persona-validation.md`, `docs/submission-readiness.md`.
- Actual captured demo: `docs/submission-demo.md`.

## Next

Run seven-day trials with real permitted study material, have a competent speaker
review Japanese, and fix the largest usability problem. Then explore consented
calendar integrations and a supported Alexa+ connection, without expanding into
unrelated messaging or native apps before the core loop is useful.
