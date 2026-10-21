# Judge guide — Kaela's university day

Use Node.js 24 LTS. No Alexa, calendar, ElevenLabs or LLM account keys are needed.

```sh
npm ci
npm --prefix web ci
npm run build
npm start
```

Open http://127.0.0.1:3001/student-mcp and **Connect MCP**. The friendlier home
page at `/` uses the same real client with **Try Kaela's day**. Keep the server running.
`npm run start:mcp` is an alias; only `npm run start:legacy` starts the old ASK adapter.

## Walkthrough

1. Read today's two fictional university events, their times and locations.
2. Expand **A little Japanese, if you’re curious** and try Meaning · Iké,
   More detail · Motto, How to ask · Nanté; explanations are English. Listen uses
   installed device voices, never autoplay. Missing voices are reported.
3. For Nanté, type `Kyō no yotei wa?` or use the hint and ask in Japanese.
   The actual MCP programme tool is called again; no phrase is silently saved.
4. Keep the encouragement or question, open Memories, optionally show a pronunciation
   hint, reveal and choose Again
   or Remembered. Reload/reconnect to verify persistence.
5. Expand Connection proof: inspect actual initialize (2025-11-25), notification,
   tools/list and tools/call, success/failure and timings. Tokens are not displayed.
6. Open `/student` for your own local notes; create/save without a calendar.
   `/student-ride` presents the same notes in the cyberpunk ride.

The example rolls from today through six days ahead in Europe/Brussels. Today
contains computer science and a group project; the next four days one event each;
the last two are empty. Outside dates are distinguished from empty dates. These
are relative sample days, not a real weekly university schedule or enrolment.
Its badge stays visible; expand **About this example** for limitations/reconnection.
The unified player offers pause/resume and slower speech with explicit language
and source. No playback starts automatically and no fake duration/progress is shown.

## Why Alexa+ and how to try the short interaction

**Accepted presentation direction, 22 October:** a useful daily conversation can
offer a little Japanese only when requested. Alexa-chan contributes contextual
phrases, explicit capture and persistent recall, rather than automatic translation
or a compulsory lesson.

The video illustrates the intended Alexa+ dialogue. To exercise its real tools
today, use the web client:

| Intended conversational turn | Current web action | Real MCP tool |
| --- | --- | --- |
| “What's on my day?” | Try Kaela's day / Connect MCP | `get_day_programme` |
| “How do I ask that in Japanese?” | Open optional Japanese → How to ask · Nanté | `explain_phrase` |
| “Keep that one.” | Save the question | `save_phrase`, then `list_memories` |
| Revisit the phrase | Memories → reveal → explicit rating | `list_memories`, `review_phrase` |

These English sentences are storyboards, not accepted commands in a new speech
or natural-language input box. The web input only accepts the supported guided
Japanese question. A future Alexa+ connection would provide the conversational
interface; this pilot verifies the underlying tools through its actual web client.
Personal notebooks remain browser-local and inaccessible to these tools. There is
no newly implemented or tested Alexa+ device connection.

## Actual integration

The official MCP SDK browser client uses StreamableHTTPClientTransport; Express
uses McpServer and StreamableHTTPServerTransport with stateless JSON responses.
POST `/mcp` handles the protocol. GET returns 405; standalone SSE is not offered.

| Tool | Purpose | Mutation |
| --- | --- | --- |
| get_day_programme | Fictional day and contextual phrase | None |
| explain_phrase | Meaning, detail or guided Japanese question | None |
| save_phrase | Explicit, deduplicated phrase capture | Profile progress |
| list_memories | Saved cards, due dates and server time | None |
| review_phrase | Explicit rating with stale-review protection | Profile progress |

`lib/mcp-app.js` owns tools/protections; `lib/mcp-store.js` persists profiles;
`web/src/lib/founders-mcp.js` contains the client (historical internal filename);
`StudentMcp.svelte` implements the university interface. This is not a general
LLM agent, live timetable integration or direct Alexa+ connection.

## Privacy and recovery

The client bootstraps a random key via POST `/mcp/profile` with `{}` and uses it
as Bearer authorization. It stores that capability in
`alexa-chan:student:mcp-profile:v1`; the server stores only hashes and phrase
progress in gitignored `data/mcp-profiles.json`. Anyone with the key can access
that sample deck. Clearing browser data loses its capability. This is local
sample authentication, not production identity or OAuth.

Own notes use `alexa-chan:student:personal:v1`. The MCP client never reads or uploads
them. Personal export/restore is separate from the example server deck. Preserve
the same origin and back up before clearing browser data.

Server safeguards include loopback binding, Host/Origin validation, 16 KB JSON
limits, maximum 200 profiles, validated tool arguments, atomic restrictive file
writes, explicit storage failures and rejecting stale review ratings. Invalid
stored JSON stops startup without resetting data. Run only one server per store.
No public tunnel or hosted deployment is included. Add production identity,
TLS, rate limiting, deletion/export and consent before any internet/private-data use.

## Checks and limitations

Run `npm test`, `npm --prefix web run check`, `npm run build`,
`npm audit --omit=dev` and `npm --prefix web audit`. Tests exercise real official
SDK calls, invalid input, concurrency, profile isolation, persistence, reviews,
origins/hosts, body limits, storage failures and browser-client round trips.
They use synthetic temporary stores, not personal material.

The judging distribution deliberately omits provider-generated audio; its four
recording-catalogue checks are skipped, while speech behaviour tests still run.
The private development source retains those recordings and runs the catalogue
checks. Source-code licensing alone does not clear generated assets.

See `submission-readiness.md` for release receipts and outstanding submission
steps. Device/accessibility testing, competent-speaker review and real learning
outcomes are not implied by automated checks.
