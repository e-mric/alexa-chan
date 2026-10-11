# Alexa-chan — English submission draft

Prepared 12 October 2026. Local draft, not submitted. Owner review and final URLs
are required. Registration and remote Devpost draft status remain unverified.

## Name and tagline

Alexa-chan — Your day first. A little Japanese along the way.

## Track

Alexa+ via a self-hosted MCP server and actual web client. No mini-challenge
claimed; no direct Alexa+ device connection, AWS deployment or Kiro contribution claimed.

## Inspiration

Noor is curious about Japanese, but university already fills her day. We wanted
learning to accompany something useful: checking classes, planning a group project
or rereading study notes. A short familiar phrase can invite curiosity without
turning every visit into a lesson. French, Dutch, German and English are supported
starting languages; Japanese is the learning language.

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
recordings. GPT Image created original visuals; source/media notices distinguish
code licensing from generated-media rights. Codex supported implementation and
verification; Claude helped with the earlier prototype.

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

For private notebooks, open `/student`, choose a language, create a titled dated
notebook, paste synthetic notes and save. Explore Japanese optionally. Keep the
same origin for stored data; export a backup before switching devices. Device
audio depends on installed voices. See `docs/mcp-judge-trial.md`.

## Built with

Node.js, Express, JavaScript, SvelteKit, Svelte, Three.js, Model Context Protocol,
MCP TypeScript SDK, Web Speech API, GPT Image, Codex, Claude, Zod.
ElevenLabs was used in private audio prototyping, not bundled in the judging release.

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
