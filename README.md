# Alexa-chan

Get the answer you need. Pick up a little Japanese along the way.

Meet **Noor, a university student**. Check an example day of classes and a group
project, notice one small Japanese encouragement, and choose whether to explore
it. Keep your own study notes without a calendar or account. Japanese is optional:
your notes stay unchanged, and only phrases you explicitly keep become memories.

English is the default demonstration language. Explanations and the personal
notebook interface also support French, Dutch and German.

## Try it locally

Use Node.js 24 LTS and npm. No external API keys are required.

```sh
npm ci
npm --prefix web ci
npm run build
npm start
```

Open [Alexa-chan](http://127.0.0.1:3001/) and choose **Try Noor’s day**.
The seven-day timetable is visibly fictional, rolls forward with today's date,
and is returned by a real MCP server. It is not a university calendar connection,
an unrestricted AI chat, or a direct Alexa+ device connection.

- [My study notes](http://127.0.0.1:3001/student): create a titled notebook, paste
  or import text/Markdown, save, then explore Japanese only when curious.
- [The cyberpunk ride](http://127.0.0.1:3001/student-ride): the same personal notes
  and memories in the Three.js world. Pause and reduced-motion fallbacks are available.
- [Integration proof](http://127.0.0.1:3001/student-mcp): real MCP initialization,
  tool discovery, explanations and server-saved review, with a visible request trace.

Keep the same browser, host and port for personal notes. They are stored locally,
not uploaded through MCP. Export a backup before changing devices or clearing
browser data. Server-saved example memories are separate from your private notes.

Audio requires installed device voices in the judging distribution. Missing
Japanese voices are explained; no wrong-language fallback or autoplay is used.
The private development copy may contain exact-text ElevenLabs recordings; they
are excluded from the judging package while distribution permission is unverified.

## Verify

```sh
npm test
npm --prefix web run check
npm run build
npm audit --omit=dev
npm --prefix web audit
```

For hot reload, leave the MCP server running and run `npm run dev`; open
http://127.0.0.1:5173/. The development proxy forwards MCP requests to port 3001.
Never open the old dashboard HTML directly.

## Documentation

- [Morning walkthrough and seven-day trial](docs/student-trial.md)
- [Focused PRD](docs/prd.md)
- [MCP architecture, privacy and judging guide](docs/mcp-judge-trial.md)
- [Four fictional student personas and testing evidence](docs/persona-validation.md)
- [Submission readiness and remaining owner steps](docs/submission-readiness.md)
- [English submission draft](devpost-submission.md)
- [Demo materials](docs/submission-demo.md) and [tool feedback](docs/product-feedback.md)

Original source is [ISC-licensed](LICENSE). See [media provenance and notices](THIRD_PARTY_NOTICES.md).

## Boundaries

This is a locally runnable pilot, not a hosted production account service. Learning
effectiveness and pronunciation still require human testing. New integrations,
WhatsApp, native mobile apps, extra scenery and compulsory gamification are deferred.

Earlier programme-specific experiments are parked, unlinked and not part of the
student experience; their local data is not migrated or erased. Legacy Alexa ASK
code is retained for development, launched only with `npm run start:legacy`.
Do not expose that server publicly: its development-only adapter dependency has
an unresolved advisory. `npm start` runs the separate loopback MCP service.
