# Four student personas — 12 October 2026

Fictional profiles, automated data journeys and agent-run browser checks, not
interviews or evidence of learning effectiveness. All test material is synthetic.
Owner notes/calendar were not copied into a test, release or demonstration.

| Persona | Language / context | Practical task | Learning choice |
| --- | --- | --- | --- |
| Marta | French university beginner | Presentation planning and notes | Inspect encouragement; explicitly save |
| Noor | Dutch university student | Calendar-free project notebook | Optional help, keyboard use and recall |
| Lena | German working student | Reread a small study plan | Ignore Japanese; finish without a quiz |
| Sam | English international student | Research notes and backup/recovery | Optional meaning, listen, keep and review |

`test/personas.test.js` exercises each through save/reload/export/recovery,
original-text preservation, language persistence, deduplication and later review.
Lena keeps no learning cards. `test/student.test.js` verifies isolated student and
parked personal storage and consistent localized student copy. Other tests cover
literal HTML, invalid imports, storage failure, motion and real MCP lifecycle.

## Browser verification

The current university MCP page connected using 2025-11-25 and displayed the
09:00–10:30 computer-science class and 14:00–15:00 group meeting. Iké returned
the contextual meaning; Nanté taught the question. Typing the question made a
real programme request without adding a card. Explicit Keep created one card;
reveal/rate scheduled the next day. Reload/reconnect retained it and showed the
actual initialization/discovery/call trace.

The university notebook check created class notes without a calendar and saved
line breaks and indentation unchanged. Japanese initially remained closed.
Additional language, recovery and distribution checks are recorded in the release
checklist; do not interpret an automated persona test as a browser walkthrough.

The clean distribution was also exercised in EN/FR/NL/DE, played Japanese using
device speech, saved/reviewed a notebook phrase, preserved it after reload and
restored a synthetic backup in an empty origin. The original notes and rated card
returned. The Dutch private-development notebook also survived a language change
and reload. These are component/journey checks, not four recruited student trials.

Earlier four-origin walkthroughs found and fixed mandatory-calendar entry,
intrusive setup during review, an outdated review clock, always-visible personal
romaji, missing explanation audio and automatic question capture. Their historical
report is preserved privately in `docs/archive/persona-validation-initial.md`.
It is not bundled in the judging distribution or presented as new student research.

Audio-source/playback checks do not assess pronunciation. Human Japanese review,
physical-device accessibility and seven-day real use remain outstanding.
See `student-trial.md` for an honest follow-up trial.
