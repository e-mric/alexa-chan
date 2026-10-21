# English student demonstration

## Current female-voice Kaela film — 22 October 2026

**Accepted decision:** the owner requested a female voice because Kaela tells
the story in first person. **Confirmed owner-local export:**
`data/submission-2026-10-22/kaela-female/alexa-chan-kaela-female.mp4`.
**78 seconds**, **1920 × 1080**, **24 fps**, H.264/AAC, 48 kHz stereo.
This replaces the male-narrated version as the current review candidate.

**Submission-ready filename, 22 October:**
`data/submission-2026-10-22/Alexa-chan-Devpost-Demo.mp4` is a byte-identical copy
of this export (same SHA-256 below). The source film and edit assets are preserved.
This filename change is local only; it is not a public video link or an upload.

One new **71.84-second** take uses **Jessica — Playful, Bright, Warm**,
`cgSgspJ2msm6clMCkdW9`, selected from the connected ElevenLabs voice list for a
young adult female storyteller. Model: `eleven_v4`; cost: **1,297.8702 credits**.
The approved script, original artwork, genuine synthetic app captures and quiet
music are unchanged. Scene boundaries and captions are retimed to this performance.
The complete voice plays once, without trims, joins or crossfades. No additional
music/image generation was needed, and the previous films remain intact.

One female narrator performs both Kaela and the assistant. The exchange remains
labelled **Alexa+ conversation concept**, separately from **actual web demo**
results; no native Alexa voice or device session is implied. The central pitch
and approved web-MCP end card are unchanged. The underlying web evidence is the
22 October port-3011 check below, not a fresh app/device test for this voice edit.

The `kaela-female` folder contains the new MP3, unchanged script, provider timing
JSON, retimed SRT/WebVTT, storyboard, renderer, edit manifest and QA recipe/receipt.
The media-only edit changes no application voice catalogue, runtime or storage.

**Verification, 22 October:** full encoded decode and ffprobe format/duration
checks passed. Sixteen storyboard frames and sixteen encoded samples were
inspected. Final levels: **−16.16 LUFS integrated, −1.82 dBTP**. Checks confirm
one complete untrimmed narration, 4.91 seconds of ending room, matching retimed
captions with no overlaps/direction tags and separate save-request/confirmation
cues. The previous 79-second film's hash is unchanged. The new file is
**14,374,211 bytes**, SHA-256
`b5a6c229fcbc9e42c000042f07916c044421d4080a56fc70472364a42bf41ed5`.
Provider timing text is an editorial aid, not independent pronunciation evidence.
Documentation/whitespace checks passed; no runtime gate was rerun for this media edit.

Owner full watch/listen and competent Japanese pronunciation review remain.
Nothing was uploaded, committed, pushed or changed in the remote Devpost draft.

## Previous from-scratch Kaela film — 22 October 2026

**Confirmed owner-local export:**
`data/submission-2026-10-22/kaela-from-scratch/alexa-chan-kaela-your-day-first-v2.mp4`.
**79 seconds**, **1920 × 1080**, **24 fps**, H.264/AAC, 48 kHz stereo.
This male-narrated cut is preserved, superseded by the female edition above.
It was not uploaded or submitted.

**Accepted direction:** Alexa helps Kaela get through her day. Alexa-chan makes
room for a little Japanese inside that conversation, **only when she wants it**.
The new script puts that pitch before the short interaction. One question runs
through asking, choosing to save and later recall. Notes are a brief practical
supporting moment: the app never rewrites her words; personal notes stay in her
browser and can be backed up. No compulsory lesson or learning outcome is implied.

The film was rebuilt with a **fresh script, standalone render recipe and timeline**,
not a repair of the previous insert. One new **73.04-second** Koichi performance
(`H8ZPDxbrPcks5hEsi2fq`, `eleven_v4`, **1,297.8702 credits**) plays uncut, with
a 1.25-second opening offset and more than four seconds of ending room. There are
**no narration joins, trims or crossfades**. Existing original manga artwork and
quiet instrumental music are reused; no new artwork/music generation was needed.
The first local 79-second encoding is preserved; v2 improves sentence-level
caption boundaries without regenerating or editing the voice.

The dialogue is labelled **Alexa+ conversation concept**, alongside separately
labelled **actual web demo** results. One narrator performs both roles. This is
not native Alexa speech, an implemented English-language agent, or an Echo session.
The spoken script explicitly describes the Alexa+ idea and today's web demo.
The approved end card remains: **“Working web demo powered by a self-hosted MCP
server.”** No spoken device-test disclaimer is added.

**Fresh local integration evidence:** the isolated provider-free build at port
3011 performed real `get_day_programme`, `explain_phrase`, `save_phrase`,
`list_memories` and `review_phrase` calls. The saved question was reviewed/rated;
its next-review state survived reload/reconnect. The capture tab and server were
closed afterwards. Synthetic captures and the visible protocol receipt are beside
the film; the short notes-reader capture reuses the verified synthetic 21 October
material. No personal notebook, account setting or app runtime was changed.

The folder contains `narration.txt`, `narration.mp3`, provider `words.json`,
`transcript.txt`, SRT/WebVTT, captures, storyboard/encoded frames,
`render-film.cjs`, `edit-manifest.json`, `check-film.cjs` and `qa.json`.
English captions romanize the Japanese question and keep the user's save request
separate from the assistant confirmation. Provider word timings are editorial
aids, not independent proof of what was spoken or its pronunciation.

**Verified export:** **14,550,567 bytes**, SHA-256
`458a96f82e037dabd366b93791922bc448ddfe56a00f67652e3710b80defe927`.
Full encoded decode passed; ffprobe confirms format/duration. Final levels are
**−16.44 LUFS integrated, −1.94 dBTP**. Eighteen storyboard frames and fourteen
encoded samples were inspected, including 00:19–00:21, the separate save request
and confirmation, review and ending. Automated checks confirm the complete
single narration, 4.71 seconds after its end, script/caption correspondence,
non-overlapping cues and no stranded “it.” cue. The old 105-second film's hash
still matches. Documentation checks and scoped whitespace checks passed; no app
test gate was rerun for this media-only revision.

**Review requirement:** technical export checks and sampled-frame inspection do
not replace a full owner watch/listen and competent Japanese pronunciation review.
Nothing was uploaded, committed, pushed or added to the remote Devpost draft.

## Superseded conversation-insert cut — 22 October 2026

**Known defect:** the owner reported a clipped voice near 00:20. Diagnostic
waveform/silence checks found that the 19.6-second source trim crossed active
speech (approximately −29 dBFS over a 50 ms window), rather than the preceding
pause. The earlier decode/level checks below did not establish perceptual quality.
This cut remains intact for history and is **not the current review candidate**.

**Confirmed owner-local export:**
`data/submission-2026-10-22/alexa-conversation/alexa-chan-kaela-conversation.mp4`.
**105 seconds**, **1920 × 1080**, **24 fps**, H.264/AAC, 48 kHz stereo,
**23,170,051 bytes** (~23.2 MB). The approximately 23-second standalone excerpt is
`short-interaction.mp4` in that folder (22.9167 seconds, 2,532,920 bytes).
Neither file has been uploaded or added to Devpost.

**Accepted direction, 22 October:** explain the Alexa+ value through a short
Kaela/Alexa-chan interaction: useful day answer → Japanese on request → explicit
“Keep that one.” The exchange starts around **00:21**, replacing the earlier
spoken timetable feature list. The rest of the practical notes-first story stays.

The manga dialogue is labelled **“Alexa+ conversation concept”** throughout, with
**actual web demo** results in a separate panel. The introduction says it is the
conversation Kaela would like to have. English turns and spoken answers are
editorial, not an implemented English-language agent or an Echo/Alexa+ session.
One Koichi narrator performs both roles, differentiated by delivery and labelled
speech balloons. The approved web-MCP end card remains; there is no spoken device
test disclaimer. No notes upload or live university calendar is implied.

**22 October browser evidence:** the isolated provider-free build at port 3010
performed real `get_day_programme`, `explain_phrase`, `save_phrase`,
`list_memories` and `review_phrase` calls. The Japanese question was explicitly
saved, revealed/rated, and its next-review state survived reload/reconnect. The
redacted visible protocol receipt and synthetic screenshots are saved alongside
the media. These are web-client results, not proof of natural-language routing
by Alexa+. The [judge guide](mcp-judge-trial.md) maps each intended turn to its
current web action. The capture server was stopped after the checks.

One **22.88-second** ElevenLabs `eleven_v4` insert using owner-selected Koichi
(`H8ZPDxbrPcks5hEsi2fq`) cost **425.9574 credits**. Existing first-person narration,
original manga art and music were reused; no new images or soundtrack were
generated. The script, source MP3, word timings, full transcript, SRT/WebVTT,
`render-conversation.cjs`, edit manifest and QA receipt are in the same local folder.
English captions romanize the Japanese phrase. User intent and assistant save
confirmation are separate subtitle cues.

**Verification:** full film and short excerpt decode without errors. Format and
duration were checked with ffprobe. Fifteen storyboard frames and encoded
explanation/save/return-to-notes frames were inspected. Final film levels:
**−16.35 LUFS integrated, −1.92 dBTP**. The insert script matches provider timing
text after removing direction tags; captions contain no tags or merged save
request/confirmation. Original 90-second export hash remains unchanged. These
checks do not replace owner full watch/listen or Japanese pronunciation review.
No application runtime, permissions, remote draft or repository was changed by
this media revision.

## Previous Kaela manga-story cut — 21 October 2026

**Confirmed owner-local export:**
`data/submission-2026-10-21/kaela-manga/alexa-chan-kaelas-next-chapter.mp4`.
**90 seconds**, **1920 × 1080**, **24 fps**, H.264/AAC, 48 kHz stereo,
**21,943,360 bytes** (~21.9 MB). It has not been uploaded or added to Devpost.

**Accepted direction:** Kaela is the main character. Practical first-person
narration explains the useful task before optional Japanese: checking the fictional
day, rereading her own notes, listening/revealing one companion phrase, explicitly
keeping it and trying recall. “They're still my words. The app doesn't rewrite
them.” replaces the technical Markdown feature list. No automatic translation,
cloud sync or language-mastery outcome is implied.

Three original manga pages were generated with built-in image generation. Exact
prompts are saved in `kaela-manga/image-prompts.json` beside the media. Kaela's
appearance is consistent across campus, study and recall panels. These are labelled
**story illustration**, not a record of human study outcomes. **60.6 seconds** of
the film feature actual app captures as the main right-hand panel, alongside the
illustrated story. Captures use synthetic notes and the isolated provider-free
Kaela build at port 3009. They show genuine MCP lookup, note reading, device audio
activation, meaning reveal, explicit capture, rating and next-review state.

Motion graphics include staggered panel reveals, slow editorial illustration
push-ins, chapter stamps, ink-rule draws, Listen/Reveal/Keep callouts, a
Read/Notice/Keep/Recall diagram and timed English captions. App captures are held
still at a readable scale; editorial cuts/crops do not imply continuous real-time
interaction or measured latency. No character-body animation or fake app UI is used.

The owner-approved end card reads **“Working web demo powered by a self-hosted MCP
server.”** Device-test limitations remain in testing notes, not in Kaela's dialogue.

- Revised narration: one **83.04-second** take of owner-selected **Koichi**,
  `H8ZPDxbrPcks5hEsi2fq`, `eleven_v4`, **1,491.8508 credits**.
- Music: reuses the original 140-second instrumental from the earlier cut below;
  **no additional music generation or music credits**. It stays quiet, with
  speech-keyed ducking and opening/ending fades. App speech is not mixed into the film.
- Earlier first-pass Kaela narration (113.68 seconds, 2,014.7985 credits) remains
  preserved locally but is **not used** in this first-person export. Earlier films
  and their audio also remain intact.

The matching script, MP3, provider word timings, SRT/WebVTT, source captures,
`render-manga.cjs`, `edit-manifest-pov.json` and `qa-pov.json` are alongside the film
under the gitignored `kaela-manga` folder. The script filename retains `draft` for
continuity; it is the text used for this export. No provider URL/token is needed to
reproduce the local edit from these assets.

**Verification:** ffprobe confirms format/duration; full encoded decode passed
without errors. Twenty-two storyboard frames plus encoded opening/review frames
were inspected. Crop bounds are asserted by the recipe. Final encoded levels:
**−16.26 LUFS integrated, −1.93 dBTP**. The 254-word script matches the provider
timing text after removing direction tags; burned-in and sidecar captions have no
tags. These timings are not independent proof of pronunciation or a full human
watch/listen review. Owner review remains before public upload.

## Previous third-person cut — 21 October 2026

Preserved owner-local draft:
`data/submission-2026-10-21/alexa-chan-a-new-chapter.mp4`.
Verified: **116 seconds**, H.264/AAC, **1920 × 1080**, **24 fps**,
48 kHz stereo, **12,317,209 bytes** (~12.3 MB). English subtitles, torii chapter
graphics, edited reading pans and a progress line frame actual app captures.

The source is an isolated, provider-free judging app from source `a4f4205`, with
Noor's fictional day and synthetic research-methods notes. Browser actions genuinely
fetched, saved, listened, revealed and rated. The notes/card/review shots were captured
on 21 October; a short genuine 20 October ride segment supplies the looped opening
and ending. Holds, crops and pans are editorial, not continuous real-time interaction
or a latency benchmark. No private notes, credentials or old provider audio entered
the film. A taller review capture avoids the floating audio control covering a rating.

### Previous-cut audio and provenance

The owner requested a shōnen-style delivery and light music, then explicitly chose
**one narration take and one music track**. The direction uses a determined, warm
adventure arc rather than a named character or performer imitation.

- Narration: owner-selected **Koichi**, voice `H8ZPDxbrPcks5hEsi2fq`, `eleven_v4`,
  **111.68 seconds**, **1,874.8125 credits**.
- Music: original instrumental `eleven_music_v2`, generated **140 seconds**, trimmed
  for the film, **2,099.5333 credits**. Prompt: restrained cinematic chill synthwave,
  warm pads, pentatonic plucks, soft piano and light percussion; no vocals or named
  artist/soundtrack references. Total reported generation cost: about **3,974 credits**.
- Mix: narration normalized separately; music targeted to −30 LUFS before additional
  speech-keyed ducking, with opening/closing fades. The film does not mix in app speech.

The owner confirmed a paid plan on 20 October and authorized these new generations
on 21 October. That is not retroactive clearance for older clips and does not add
a live app TTS API. The app shown uses device voices; ElevenLabs is editorial audio.

Local editing recipe, source captures, narration text and metadata are alongside
the video under the same gitignored folder. They are not bundled into judging code.
The recipe uses FFmpeg and workspace canvas. SRT and WebVTT subtitles are alongside
the film; the burned-in English captions exclude performance tags. The provider's
transcription/timing result includes upstream direction tags, so it is not independent
proof of word-perfect audio. No human full listening review is claimed.
The final graphic states the local/fictional-data/no-device boundary explicitly.

The old founder capture is an archived draft and must not be used for submission.
Review the student capture before uploading. A local file is not the required
public YouTube/Vimeo URL; no public video has been posted by this work.

### Previous-cut story shown

1. Noor's clearly fictional university day and cyberpunk ride.
2. A real MCP connection; computer science and a group project with times/rooms.
3. Optional day-phrase meaning; useful tasks do not require Japanese.
4. Focused long-form notes, formatted Markdown and original text preserved.
5. Browser-local note and backup boundary.
6. A separate optional Japanese card with default-visible pronunciation.
7. Explicit device listening, meaning reveal and phrase capture.
8. Return to the note; later personal-memory recall, reveal, rating and next review.
9. Actual protocol trace from the web MCP client.
10. Truthful local-pilot recap; no direct Alexa+ device session tested.

`ffprobe` confirms duration, codecs, dimensions, frame rate and stereo sample rate.
The final file decoded end-to-end without errors. Twenty storyboard frames and
encoded opening/review frames were inspected; capture crop bounds are checked by
the recipe. Final encoded audio measured **−16.59 LUFS integrated**, **−1.89 dBTP**,
with no clipping indicated. This is not human pronunciation, complete audiovisual
timing or accessibility sign-off. The owner still needs a full watch/listen review.

The 20 October 112-second narrated film and 12 October silent film remain historical
drafts. No public video has been uploaded or URL claimed by this work. Source/app
files, account permissions and Devpost fields were not changed for this media refresh.

## Owner finishing steps

Watch the entire file. Check legibility, fictitious-data labels and that no account
credentials/private notes are visible. Confirm generated-art usage entitlement.
Upload to your YouTube/Vimeo account, test unauthenticated playback, and put the
actual link into Devpost. Do not describe the demo as a live Alexa+ device session
or as evidence of Japanese mastery.
