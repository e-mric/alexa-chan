# Alexa-chan — Product Requirements Document

Version 3.4 · 22 October 2026 · Owner: Emeric Van Frausum

## Mission

Help Japanese beginners pick up a little Japanese during an activity they already
want to do. **Your day first. A little Japanese along the way.** This is incidental
learning, not a replacement for a language course or a demonstrated learning outcome.

## Current scope

The primary example is **Kaela's university day**. **Accepted decision, 20 October:**
the student experience, personal UI and explanations are English → Japanese only.
Older FR/NL/DE locale values remain intact in stored data and recoverable backups;
they do not select another student interface language. Original notes are never
translated automatically. Membership of any external programme
is irrelevant to using the app. The earlier programme-specific pilot is parked,
unlinked, and must not appear in navigation, onboarding or public storytelling.
Existing private notes and calendar data must not be erased or republished.

Prove one loop:

**Read your day or notes → notice a phrase → optionally understand/listen →
explicitly keep it → recognize it on a later visit.**

The useful activity must work even when Japanese is ignored.

## Four priorities

1. Useful, reliable daily task: example timetable and original study notebooks.
2. Subtle, accurate Japanese with explicit listening and optional explanations.
3. Durable, recoverable notes and opt-in memories.
4. Reproducible real integration and honest testing evidence.

New channels, live campus calendars, WhatsApp, cloud sync, mobile apps, open-ended
tutoring, extra art, XP and compulsory streaks are out of scope. A direct Alexa+
connection follows a proven core and supported account access; none is claimed today.

**Accepted presentation direction, 22 October:** a short Kaela/Alexa-chan exchange
should make the Alexa+ value clear: a practical day answer, Japanese only on
request, and explicit phrase capture for later recall. This is an intended
conversational experience illustrated alongside real web MCP results, not a new
runtime feature or a claim of device integration. The web controls and privacy
boundary remain as specified below; the judge guide maps the example turns.

## Primary scenario

Kaela checks today's classes: 09:00 computer science and 14:00 a group project
meeting. Times and locations come first. Alexa-chan offers 一歩ずつ。
(`Ippo zutsu.` / One step at a time.) Kaela can do nothing and carry on.

If curious, Kaela chooses **Iké** for the meaning, **Motto** for a little detail,
or **Nanté** for `今日の予定は？` / `Kyō no yotei wa?` / What's today's plan?
These are stable app shortcuts, not a claim that every label is the literal
Japanese translation of its action. Asking the guided question retrieves the day
again through MCP; it does not automatically save a learning card.

After class, Kaela creates a notebook, pastes notes, and saves them. Original text
and whitespace stay intact. Japanese is initially closed; opening it reveals one
curated phrase appropriate to supported keywords, not a translation of the notes.
Only **Keep this phrase** opts into review. Nothing blocks rereading.

## Product requirements and acceptance criteria

| Area | Required behaviour | Acceptance |
| --- | --- | --- |
| First use | Clearly labelled university example; separate personal notes entry | No programme membership, account or calendar needed |
| Timetable | Rolling seven-day fictional data in Brussels time | Today has two events; following four days one each; final two empty; outside range distinct |
| Notebooks | Titled/dated text or Markdown; save, reopen, import, backup/restore; formatted/original-text views | Exact source preserved; raw HTML inert, unsafe links blocked, remote images not loaded; invalid backup cannot overwrite valid notes |
| Drafts | Warn/block losing unsaved changes; surface storage failure | No silent success or accidental draft loss |
| Japanese | Small curated catalogue: courage, step, question, listening | Optional meaning/detail/romaji; no automatic note rewriting or saving |
| Audio | User-triggered, language-labelled playback; stop/navigation controls | Missing voices, denied playback and failed recordings explicitly reported; no autoplay |
| Review | Explicit capture, deduplication, reveal before rating | Newly saved phrase due immediately; rating updates next due time; reload retains progress |
| Views | Simple notes and decorative Three.js ride share personal store | Reading pauses ride; reduced-motion/static fallback; readable usable controls |
| Languages | Student UI and Japanese explanations in English; optional Japanese listening | Old locale values/notes survive reload and backup; presentation remains English |
| Integration | Official MCP SDK, Streamable HTTP, protocol 2025-11-25 | Real initialize/tools/list/tools/call; trace redacts tokens; no simulated success |
| Privacy | Personal notes never sent through MCP | Student and parked personal stores separate; judge stores only phrase progress |

## Visual and interaction direction

The October visual pass follows **cinematic world, calm interface**. Original
city/rider art stays atmospheric; warm ivory reading surfaces, petrol-blue chrome,
vermilion actions and muted metadata define the shared visual language.

**Accepted refinements, 20 October:** preserve the visible rider and city. The
intro uses localized feathered petrol shading, not rectangular text backings;
header/navigation are translucent, while reading surfaces stay opaque ivory.
Normal text targets at least 4.5:1;
primary/audio controls target 44 × 44 CSS pixels. Shared semantic tokens own
reading/action colours. Optimized WebP derivatives retain the source artwork;
the ride initially loads only the viewport-appropriate rider atlas. A small
decorative torii marks internal journey entry links, alongside explicit text;
ordinary back controls and external links keep conventional directional cues.

- Today · Notes · Memories share navigation labels across the example and personal
  views. Example memories and personal notebook memories remain distinctly labelled
  and stored separately; this pass does not migrate data or pretend to unify stores.
- Timetable cards foreground time, event and location. The example badge stays
  visible; expanded limitations and real protocol proof are disclosed below.
- A small Japanese phrase can be heard immediately. Optional helpers expand only
  when curious: Meaning · Iké, More detail · Motto, How to ask · Nanté.
- **Accepted decision, 21 October:** student collections use quiet title/date/preview
  cards without repeated artwork. Opening a notebook gives it a focused ivory reader,
  without the ride or surrounding navigation competing with long notes. Original
  Markdown and storage stay unchanged. Blank preparation/takeaway sections stay hidden.
- The reader's **A little Japanese** entry opens a separate optional card screen,
  not a lesson below a long document. Returning restores reading position and focus.
  Pronunciation starts visible, with an option to hide it; meaning starts unrevealed.
  Only **Keep this phrase** captures a memory. This is a curated companion phrase,
  not an automatically generated translation of the note.
- One global player shows the active text, language and source, with pause/resume,
  stop and slower playback. Changing device-speech speed restarts the current
  spoken sentence; changing it while paused must not autoplay. No fake timeline.
- **Accepted decision, 21 October:** focused notes/cards use contextual Listen actions
  and show the floating transport only during playback. Advanced page/text reading
  remains under **More**; errors and active text-picking still show explicit feedback.
  Other views retain their existing global audio entry.
- First use offers a useful example or private notes directly, with no new account,
  lengthy questionnaire or required Japanese lesson. No reference artwork is copied.

Interaction references inspected through Mobbin: [Amie](https://mobbin.com/screens/05c4146b-77d3-486d-809d-d8173d8aa4d6),
[Finch](https://mobbin.com/screens/e8ec9fce-b079-4636-8d45-01795e9084e8),
[Substack](https://mobbin.com/screens/040a97be-8e47-4be4-823e-f36cda57588b),
[Matter](https://mobbin.com/screens/dd74962c-5184-459c-9281-12e2c19bb44b),
[Vizcom](https://mobbin.com/sites/sections/ea8b50e2-1c36-4925-bf02-59d901080f1a).
These are design references, not evidence that the proposed patterns improve outcomes.
The 21 October notes/card refinement also inspected
[hilos](https://mobbin.com/screens/55536f55-3dc0-47d3-b4a4-104c1c867f6a),
[Quizlet](https://mobbin.com/screens/a6fa907d-6b71-4ae5-89d8-0c67e196bd09) and
[CapWords](https://mobbin.com/screens/6a6db198-c314-44a6-bc3d-8d8beac946b8).
**Proposal, not implemented:** a small branching diagram maps the app shortcuts
Iké → Meaning, Motto → More detail and Nanté → How to ask. The owner confirmed
these labels and requested a generated mockup; final diagram approval and the
notebook-specific Nanté interaction remain separate from the working reader/card.
Audio uses the documented device APIs for [pause](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/pause),
[resume](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/resume)
and [recorded playback speed](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate);
browser behaviour remains explicitly tested rather than assumed from API availability.

## Storage and security boundary

`/student` and `/student-ride` share browser key `alexa-chan:student:personal:v1`.
The parked private pilot keeps its original key; no automatic migration occurs.
Origin changes require export/restore. There is no cloud account or multi-device sync.

`/` and `/student-mcp` share `alexa-chan:student:mcp-profile:v1`, containing a
random local sample-profile capability. The loopback server hashes that key and
atomically persists phrase progress in gitignored `data/mcp-profiles.json`.
Anyone with the capability can access the example deck. It is not production OAuth.
Host/Origin checks, bounded inputs, stale-review checks and explicit storage errors
are required. Internet hosting needs proper identity, TLS, rate limits, user deletion
and a consented data flow before collecting private information.

The judging distribution uses device speech and omits ElevenLabs recordings.
Private development clips are preserved but not evidence of distribution clearance.

## Personas and evidence

Marta: French-speaking university beginner, calendar plus presentation notes.
Noor: Dutch-speaking student, calendar-free project notes and keyboard use.
Lena: German-speaking working student, limited time, ignores Japanese.
Sam: English-speaking international student, unfamiliar app, backup/recovery.

These are fictional test profiles, not recruited participants. Earlier multilingual
checks remain historical/compatibility evidence. The current student interface is
English for all four. Browser evidence and limitations are in `persona-validation.md`.

## Release and evaluation gates

Before judging: clean install, tests, Svelte diagnostics, build, runtime audit,
real MCP browser walkthrough, persistence/recovery, safe source package, English
instructions and a public English demo below three minutes. Owner registration,
reviewer access, media entitlement and explicit final submission remain separate.

Afterward: seven days with real permitted study material; observe practical value,
distraction, voluntary exploration and later unaided recognition. Review Japanese
with a competent speaker. Exposure counts, simulated visits and passing tests
must not be presented as language proficiency or proven retention.

Earlier Quest Mode/productivity experiments and programme pilot documentation
are historical context, not current requirements. See `student-trial.md` and
`submission-readiness.md` for the current path.
