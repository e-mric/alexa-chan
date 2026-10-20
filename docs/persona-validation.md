# Student journey and interface verification

Latest interface audit: [20 October remediation and installed audit](#remediation-and-installed-impeccable-audit--20-october-2026).
The persona evidence below remains dated **12 October 2026**; it was not rerun as
four human student trials during the interface audit.

## Four student personas — 12 October 2026

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

## Interface audit — 20 October 2026

This section is the **before-fix baseline**. The later remediation section
supersedes its current-state and installation claims, while retaining evidence.

### Method and scope

Requested Impeccable audit. No installed Impeccable skill/launcher was available;
the upstream [skill entry](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/SKILL.md)
and [audit playbook](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/reference/audit.md)
were read as reference guidance. This is a manual, Impeccable-guided assessment,
**not output from its bundled detector**. No plugin, hook or configuration was installed.
The [public command description](https://impeccable.style/docs/audit/) explains the
technical scope; this is not a redesign or a backend security/compliance audit.

Inspected current source and an isolated device-voice judging copy, built from the
dirty working tree on 20 October. Clean root/web installs and production build
passed. Browser checks used the in-app browser at loopback port 3003, with one
synthetic notebook and a new example profile; owner notes/calendar were untouched.
Surfaces: homepage before/after connection, helpers, simple notebook create/save/read,
German library and immersive notes. Viewports: 1280×720, 390×844, 320×740 and 768×900.
These were **emulated viewports and pointer/keyboard actions**, not physical touch.
Observed no horizontal overflow in the inspected mobile/tablet states; inspected
console warning/error log was empty. Temporary viewport override was reset.

Not run: Impeccable detector, Lighthouse/Core Web Vitals, network throttling,
screen reader, full browser matrix, text-only zoom, physical device/gesture tests,
native-speaker assessment or long-term learning study. Reduced-motion implementation
was inspected in source; an OS preference change was not exercised in this audit.
The full regression gate last passed on 17 October, not rerun or relabelled today.

### Assessment

**Implementation integrity: coherent product-specific system, with verified issues.**
Original world imagery, shared navigation, quiet reading and voluntary Japanese
express the accepted PRD. This is not an automated anti-pattern clearance.

| Dimension | Provisional manual score / 4 | Evidence |
| --- | --- | --- |
| Accessibility | 2 | Confirmed low-contrast labels and wrong language inheritance |
| Performance | 2 | Large PNGs and bundle; dynamic Three.js import and cleanup are positives |
| Theming | 2 | Shared palette exists, but many component values bypass it |
| Responsive behaviour | 3 | Inspected layouts reflow; several small mobile controls |
| Implementation integrity | 3 | Consistent product intent and shared components; remaining integration gaps |
| Total | **12 / 20** | Significant targeted improvements; not a certification or measured performance score |

**Five findings: 0 P0, 2 P1, 3 P2, 0 P3.** No task-blocking failure was observed in
these particular journeys; this does not establish that every user journey passes.

### P1 — General audio reader assigns English to French explanations

- **Category/location:** accessibility/integration. `StudentMcp.svelte` explanation
  and memory-meaning blocks (around lines 87–101); `AudioReader.svelte:12` and
  `AudioReader.svelte:38` use the nearest DOM `lang`.
- **Reproduce:** connect the example → expand Japanese → Explain in Français →
  More detail → Audio options → Choose text to hear → click the French paragraph.
- **Observed:** the visible French paragraph inherited `lang="en"`. The player
  displayed **English · Playing**, and **English · Paused** after pausing, while
  its excerpt contained the French text. The explicit explanation Listen action
  has an explicit locale; the confirmed failure is the general text-reader path.
- **Impact:** screen-reader/general audio pronunciation can be wrong even though
  the requested explanation language is supported. French was reproduced; NL/DE
  share the unannotated markup but were not separately played in this audit.
- **Recommendation:** annotate each translated block with its actual language,
  including mixed Japanese/base-language parts. Regression-check picked text,
  selection and page reading in every supported language, not only dedicated Listen.
  Relevant standard: [WCAG language of parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html).
  Suggested follow-up: `$impeccable harden` (or equivalent scoped implementation).

### P1 — Notebook metadata falls below normal-text contrast minimum

- **Category/location:** accessibility. `SessionNotes.svelte:130` heading/date
  colours; actual notebook background resolves to `--paper`, `#f5f0e6`.
- **Measured from rendered styles:** the 11px original-notes heading `#687c76`
  has **3.91:1** contrast; the 11px date `#607574` has **4.31:1**. Both are
  informative normal-sized text, below [WCAG 1.4.3's 4.5:1 minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
  Ratios were computed from source/computed colours, not screenshot anti-aliasing.
- **Impact:** dates and section labels become difficult to read for low-vision users.
- **Recommendation:** darken metadata/heading tokens and verify every actual paper
  surface. Preserve the ivory/petrol/vermilion identity; no palette redesign needed.
  Suggested follow-up: `$impeccable harden` with contrast regression checks.

### P2 — Mobile audio controls are smaller than the audit's comfort target

- **Category/location:** responsive interaction. `AudioReader.svelte:83` and its
  mobile transport grid; compact links in `StudentMcp.svelte:114` and `:128`.
- **Observed at 390px:** Resume **32×40**, Stop **24×40**, Slower approximately
  **43×40** CSS pixels. Day buttons were 34px high; the Audio options toggle 32px.
- **Impact:** small controls are harder to operate accurately on a phone.
- **Recommendation:** increase hit areas to approximately 44×44 with appropriate
  spacing, retaining compact visual glyphs. This is Impeccable's comfort criterion,
  **not a blanket WCAG AA failure**: [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  uses 24px/spacing exceptions and must be assessed separately. Touch gestures were
  not synthesized or physically tested. Suggested follow-up: `$impeccable adapt`.

### P2 — Decorative media loads without a small-device asset budget

- **Category/location:** performance. `RideScene.svelte:166` loads both courier
  sprite variants; `StudentMcp.svelte:113` uses the Fuji background;
  `SessionNotes.svelte:133` uses the full city PNG for small notebook covers.
- **Verified source/build evidence:** each rider PNG is about 2.1–2.2 MiB; Fuji is
  about 2.3 MiB, and the notebook-cover source about 2.8 MiB. Both sprite variants
  are requested by the scene. The production build warns about a roughly 747 kB
  uncompressed Three.js chunk. These are file/bundle sizes, **not measured transfer
  totals, load times, frame drops or a failed Core Web Vitals result**.
- **Impact:** unnecessary download/decode work risks slow startup on mobile.
- **Recommendation:** preserve visuals with optimized/responsive raster assets,
  select the required sprite variant and use appropriately sized notebook covers.
  Measure a cold, throttled run before calling performance fixed. Keep the existing
  dynamic Three.js import, pixel-ratio cap and resource disposal.
  Suggested follow-up: `$impeccable optimize`.

### P2 — Shared tokens do not govern all related surfaces

- **Category/location:** theming/maintainability. `identity.css:1` defines the
  palette; `FoundersJourney.svelte:258`, `StudentMcp.svelte:118` and
  `SessionNotes.svelte:129` retain component-specific paper/border/text values and
  later overrides. There are several independently maintained versions of cards.
- **Impact:** a global contrast/palette fix will miss hard-coded descendants;
  the confirmed notebook contrast failures illustrate the maintenance cost.
- **Recommendation:** route related semantic colours through shared tokens as
  affected surfaces are fixed, removing superseded overrides incrementally. Do not
  add a new design-system package or rewrite every component before submission.
  No dark-mode feature is promised by the PRD; its absence is **not** a defect here.
  Suggested follow-up: `$impeccable polish` after the behaviour/accessibility fixes.

### Positives, non-findings and handoff

- Real MCP connection and truthful sample labels were visible; Japanese stayed
  optional and notes saved without silently creating learning cards.
- The synthetic original note survived save/reread, cross-view navigation and a
  language change. The immersive notebook correctly reported a paused ride.
- Inputs have associated labels, shared navigation has active state/focus styles,
  and reading text has a comfortable measure. Decorative world is hidden from AT.
- Starting a notebook briefly moves focus to BODY when its old button disappears,
  but pressing Tab reached `new-notebook-title`. No keyboard trap was reproduced;
  this was not promoted into a blocking finding.
- No changes to application code, settings, recordings, owner data or remotes.
  Local screenshot evidence is in gitignored `data/audit-2026-10-20-language.jpg`
  and `data/audit-2026-10-20-reading.jpg`; these are synthetic audit captures,
  not new video/submission materials and are not bundled in judging source.

**Next:** authorize the two P1 fixes first, add targeted regressions, run the full
gate on the changed revision and repeat these browser checks. Then address mobile
targets/assets proportionately and finish with `$impeccable polish`. The command
names describe upstream workflows; they are not a claim that the missing skill
has been installed. Read its current instructions if installing/using it later.

## Remediation and installed Impeccable audit — 20 October 2026

**Confirmed:** user authorized English → Japanese only, contrast fixes, the three
lower-priority improvements, skill installation/audit, torii entry icons and safe
Markdown reading. No owner data was migrated. Source remains based on the dirty
`b4776ef` workspace; this is not evidence of a fresh remote CI run.

Impeccable **4.7.0** was installed from `pbakaus/impeccable` using the skill
installer. Its context launcher initially lacked executable permission, so the
existing PRD/engineering context was used; the launcher's executable bit was then
restored. No PRODUCT/DESIGN replacement, hooks or detector suppressions were added.
The installed **source detector actually ran** over StudentMcp, SessionNotes,
FoundersJourney, JourneyNav, AudioReader, identity.css and Torii. Exit 2 means
findings, not a clean audit: **10 warnings** (seven accent-border findings and
three Arial findings). This regex source scan is not rendered pixel contrast analysis.

**Integrity verdict:** coherent, product-specific implementation with minor style
findings. Borders are visible and can be simplified later; they do not prevent
reading. The Arial findings refer to functional body typography, not a generic
display heading (headings use Georgia); treat them as contextual non-blockers,
not proven usability failures. The cyberpunk world is the accepted brief.

| Dimension | Follow-up score / 4 | Verified basis / remaining limit |
| --- | --- | --- |
| Accessibility | 3 | Opaque text surfaces, stronger labels, correct English/Japanese language parts; no screen-reader certification |
| Performance | 2 | Small WebP derivatives, one initial rider atlas; large Three.js chunk and no throttled measurement |
| Theming | 3 | Shared paper/ink/muted/action tokens in student surfaces; world/material colours remain local |
| Responsive | 3 | Tested narrow reflow and enlarged audio hit areas; no physical touch or text-only zoom test |
| Integrity | 3 | Real calls/persistence, original-note boundary and decorative labelled torii; accent-border warnings remain |
| Total | **14 / 20** | Good within inspected scope, not WCAG/performance certification |

### Fixed and checked

- English-only student presentation is independent of stored locale. MCP schemas
  reject FR/NL/DE explanation requests; older catalogues remain compatible.
  Browser-picked explanation text displayed **English · Paused**; switching speed
  while paused did not start it. Japanese notebook listening used **日本語 / Device voice**.
- Actual date/section-label colour is now `#4f625f` on opaque `#f5f0e6`:
  **5.70:1**. Paper text on opaque ink is **12.74:1**; action text on paper **6.56:1**.
  Navigation, status labels, expanded disclosures and footer have opaque backing.
  The oversized intro panel was subsequently removed after owner feedback: compact
  translucent text backings preserve contrast over a worst-case white pixel in a
  new regression. The owner requested a no-boxes generated proposal; its feathered
  shading/header treatment is **not yet implemented or measured**.
- At 390px, Resume and Stop measured **44 × 44**, Slower **48.68 × 44**,
  Audio options **111.40 × 44**, Today **66.02 × 44**, Tomorrow **86.68 × 44**.
  Notebook/form controls use the shared 44px target. This is not an assertion that
  every inline hyperlink needs a 44px box or that WCAG is fully assessed.
- Fuji **231,988 bytes**, desktop rider **202,050**, rear rider **219,650**,
  notebook cover **90,786**. Original PNGs remain. A helper/cache selects one rider
  initially and loads the other only if resized across the breakpoint. These are
  file/source measurements, not cold-network transfer or frame-rate results.
- Markdown headings/lists/emphasis/quote/code rendered in a real notebook. Switching
  to Original text and back to the editor preserved exact whitespace/source.
  Raw script/image HTML created no DOM scripts/images; remote Markdown images
  became inert alt text. Unit tests also reject unsafe/encoded/relative links.
- A synthetic backup containing an older French preference restored on a test
  origin with English UI and identical original source. Existing student/parked
  storage isolation and memory/persistence tests remain green.
- Student Settings & backup no longer exposes the parked Notion-import onboarding.
  The audio panel reports actual recording availability, rather than advertising
  clips disabled on the example page. Both were caught during this walkthrough.
- The clean app exercised real MCP question/save/reveal/rate/reconnect plus private
  notebook save/listen/capture/review. Explicit capture remained mandatory. Device
  Japanese worked without provider clips. No owner notes/calendar were accessed.

Automated gate: development **78 passed**; refreshed clean distribution **74 passed + four
intentional recording-catalogue skips**; Svelte zero errors/warnings, build and
runtime/web audits pass. `test/interface.test.js`, `test/markdown.test.js` and
language/audio regressions cover the changes. Legacy full/dev audit exposure is
still separate from the clean production runtime audit.

Rendered notes reflowed at **320×740, 390×844, 768×900** with document widths
305/375/753 respectively; desktop checked at 1280×800. Inspected consoles were
empty. These are emulated viewport/pointer checks, not physical-device gestures.
Source preview used isolated port 3004; a provider-free judging copy used 3005.

### Remaining findings and follow-up

- **P2 Performance:** the roughly 747 kB Three.js chunk still warrants cold,
  throttled testing before claiming a fast mobile experience. Dynamic loading,
  pause and simple view are retained. Suggested command: `$impeccable optimize`.
- **P3 Visual consistency:** the detector's accent-border group remains in the
  paper/notebook treatment. Simplify only if visual review finds real clutter;
  preserve the accepted world. Suggested final pass: `$impeccable polish`.

No P0 or P1 was reproduced in the inspected follow-up journeys. That is not a
claim of universal clearance. Physical access, screen reader, text zoom,
pronunciation, network throttling and seven-day learning outcomes remain unverified.
You can run the recommended commands one at a time or together; re-run the audit
after further fixes. Local captures/video are gitignored and use synthetic data.
