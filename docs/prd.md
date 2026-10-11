# Alexa-chan — Product Requirements Document

Version 3.0 · 12 October 2026 · Owner: Emeric Van Frausum

## Mission

Help Japanese beginners pick up a little Japanese during an activity they already
want to do. **Your day first. A little Japanese along the way.** This is incidental
learning, not a replacement for a language course or a demonstrated learning outcome.

## Current scope

The primary example is **Noor's university day**, in English for judges. Personal
study notes and phrase explanations support French, Dutch, German and English.
Japanese is the target language throughout. Membership of any external programme
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

## Primary scenario

Noor checks today's classes: 09:00 computer science and 14:00 a group project
meeting. Times and locations come first. Alexa-chan offers 一歩ずつ。
(`Ippo zutsu.` / One step at a time.) Noor can do nothing and carry on.

If curious, Noor chooses **Iké** for the meaning, **Motto** for a little detail,
or **Nanté** for `今日の予定は？` / `Kyō no yotei wa?` / What's today's plan?
These are stable app shortcuts, not a claim that every label is the literal
Japanese translation of its action. Asking the guided question retrieves the day
again through MCP; it does not automatically save a learning card.

After class, Noor creates a notebook, pastes notes, and saves them. Original text
and whitespace stay intact. Japanese is initially closed; opening it reveals one
curated phrase appropriate to supported keywords, not a translation of the notes.
Only **Keep this phrase** opts into review. Nothing blocks rereading.

## Product requirements and acceptance criteria

| Area | Required behaviour | Acceptance |
| --- | --- | --- |
| First use | Clearly labelled university example; separate personal notes entry | No programme membership, account or calendar needed |
| Timetable | Rolling seven-day fictional data in Brussels time | Today has two events; following four days one each; final two empty; outside range distinct |
| Notebooks | Titled/dated text or Markdown; save, reopen, import, backup/restore | Original content preserved; HTML displayed as text; invalid backup cannot overwrite valid notes |
| Drafts | Warn/block losing unsaved changes; surface storage failure | No silent success or accidental draft loss |
| Japanese | Small curated catalogue: courage, step, question, listening | Optional meaning/detail/romaji; no automatic note rewriting or saving |
| Audio | User-triggered, language-labelled playback; stop/navigation controls | Missing voices, denied playback and failed recordings explicitly reported; no autoplay |
| Review | Explicit capture, deduplication, reveal before rating | Newly saved phrase due immediately; rating updates next due time; reload retains progress |
| Views | Simple notes and decorative Three.js ride share personal store | Reading pauses ride; reduced-motion/static fallback; readable usable controls |
| Languages | Personal UI and Japanese help in FR/NL/DE/EN; judge interface English | Same supported functionality; original note/timetable language not rewritten |
| Integration | Official MCP SDK, Streamable HTTP, protocol 2025-11-25 | Real initialize/tools/list/tools/call; trace redacts tokens; no simulated success |
| Privacy | Personal notes never sent through MCP | Student and parked personal stores separate; judge stores only phrase progress |

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

These are fictional test profiles, not recruited participants. Automated checks
cover all four; browser evidence and limitations are in `persona-validation.md`.

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
