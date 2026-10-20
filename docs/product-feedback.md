# Product feedback — owner-review draft

Updated 20 October 2026. Based on implementation and recorded checks, not invented user
research. Review the proposed reuse decisions and any subjective statements
before copying them into Devpost. Runtime and development tools are both covered.

| Tool/API/SDK | Use | What worked | Friction / improvement | Onboarding evidence | Proposed reuse decision |
| --- | --- | --- | --- | --- | --- |
| MCP TypeScript SDK / Streamable HTTP | Actual server/client lifecycle and five journey tools | Integration tests exercise negotiation, discovery, real calls and persistent profiles | Easier complete examples of browser auth/bootstrap and deployment boundaries would help | Working SDK server/client built; clean setup documented | Yes: inspectable interoperability without a proprietary assistant console |
| Alexa+ developer ecosystem | Intended assistant platform; submission uses the documented MCP path | FAQ clarifies use of an independent web client | Gated docs can look like a setup route available to hackathon entrants; put availability beside each guide | No access to gated SDK/CLI/simulator; no device integration tested | Explore when access exists; no runtime-use claim today |
| SvelteKit / Svelte / Vite / adapter-static | Reactive personal and judge interfaces, static production build | Shared simple/ride component and multilingual copy; diagnostics/build pass | Express needed extensionless route handling; build emits dependency annotation warnings | Existing app migrated and built from lockfiles | Yes: suitable for the present web product |
| Three.js | Original animated city/road/rider | Pause and static fallbacks keep practical reading available | Sprite alignment, tyre motion and distant road occlusion needed custom work; heavy scenes complicate mobile QA | Running ride and motion regression tests | Yes for atmosphere; keep task controls in ordinary HTML |
| Node.js / Express | Local MCP and legacy Alexa services | Small loopback service, straightforward static serving and tests | Public deployment would need a separate account/transport design; do not expose the prototype unchanged | Both local entry points start from documented commands | Yes for the scoped service |
| Zod | Validate MCP tool arguments | Invalid dates and unsupported arguments fail before writes | Current dependency emits bundler annotation warnings | Used with SDK schemas and invalid-input tests | Yes: useful validation at the tool boundary |
| Web Speech API | Dynamic notes/programme and unrecorded text | Explicit language selection and device-source label; available German/Japanese voices played in walkthroughs | Installed voices vary; natural multilingual text needs segmentation; unsupported/missing voices need clear feedback | Tested player behavior and real browser playback | Yes as an explicit fallback, not a guarantee of identical voices |
| ElevenLabs | New English video narration; earlier private exact-text audio prototype is not bundled in the judging app | Connected MCP voice lookup and a 110.08-second narration take completed; short private clips previously worked without installed TTS voices | Earlier generation required incremental browser work; account distribution rights must be recorded, not inferred from credits | Selected voice/model checked; owner confirmed a current paid plan before new generation; no runtime API dependency | Yes for reviewed narration/curated clips, subject to applicable permissions |
| GPT Image | Original city, cards and courier sprites | Coherent visual identity and documented prompts | Generated wheel contacts and framing required careful integration; artwork is not real-world state | Generated assets integrated with provenance | Yes for original atmosphere and prototypes |
| Codex / Claude | Development, iteration, inspection, tests and documentation | Helped iterate from concept to working flows and identify concrete bugs | Simulated persona checks must not be reported as human research; verification still needs explicit evidence | Claude used in the first prototype; Codex used in later implementation/checks | Yes, with executable and browser verification |
| Alexa Skills Kit / ASK adapter | Separate legacy French skill | Prior prototype device use and handler tests provide a foundation | Current adapter dependency chain has a high-severity signature-verification advisory; it is not loaded by the MCP entry point | Earlier Echo success predates current MCP work; latest skill/device flow unverified | Reassess/replace affected adapter before any public legacy endpoint |
| Google Calendar API | Separate read-only today/tomorrow reader | Tests cover account gating, pagination and local-day boundaries | Developer-managed OAuth credentials are not end-user onboarding | Implementation/tests complete; actual account authorization remains unverified | Consider later when users need live calendars |
| Open-Meteo | Separate legacy weather lookup | Prior live request and useful no-key interface | Edge cases/timeouts require further hardening | Legacy lookup tested; not part of the MCP judge calendar | Consider later after the current daily loop |
| GitHub / GitLab | Judging source copy and development repository | GitLab retains development history; GitHub supports required code access and CI | Keep private snapshots/backups out of both; judge invitations/access must be verified | Existing GitLab workflow; GitHub publishing checked separately | Yes |
| markdown-it 15.0.3 | Optional formatted student notes | Headings/lists/code render without rewriting source; HTML-disabled parser supports a bounded renderer | Remote image loading and relative/unsafe links need explicit policy, not just default parsing | Security and source-preservation regressions; browser rendering checked | Yes with the current restricted renderer |
| Impeccable 4.7.0 | Source-level interface audit plus manual playbook | Concrete contrast/target/media checklist; detector actually ran | Regex warnings about body fonts and intentional borders require context; not a WCAG certificate | Installed from official repository; initial launcher executable bit required restoration | Yes with rendered verification and the brief taking precedence |
| cwebp | Smaller runtime art derivatives | Rider alpha/dimensions retained with substantially smaller files | Encoding must not alter UV/mask geometry; keep originals | Local encoding and per-image budget tests | Yes for static runtime assets |
| FFmpeg / workspace canvas | English demo editing and motion-graphic chapter captions | Actual app captures can be framed and encoded reproducibly | Footage framing requires checking encoded frames, not only source captures | Local H.264/AAC export with metadata and visual QA | Yes for the demo, not an app dependency |

**20 October ElevenLabs update:** the MCP successfully listed the selected Koichi
voice. The owner confirmed a current paid plan and authorized new video narration;
one `eleven_v4` take (110.08 seconds, about 1,545 credits) was generated. Old
free-credit clips remain excluded from judging source. Current-plan confirmation
is not retroactive clearance for those older recordings. No live app TTS API or
private-note upload is claimed.

## Optional friction entries worth validating

1. **Gated Alexa+ setup route** — attempted task: choose a supported assistant
   integration. Expected: an available setup path. Observed: FAQ says tools are
   select-partner-only. Workaround: actual independent MCP client/server.
   Severity: important. Suggestion: show the access restriction and self-hosted
   alternative at the top of each affected guide. This is documentation friction,
   not a claim that a gated SDK was run and failed.
2. **Browser-specific voices** — attempted task: read dynamic content and
   Japanese consistently. Expected: appropriate voice availability. Observed:
   availability depends on installed system voices. Workaround: exact prerecorded
   phrases plus labelled device playback and explicit unavailable states.
   Severity: important. Suggestion: clearer voice installation guidance.

Do not submit the earlier ElevenLabs error as a detailed friction log unless its
exact attempt, response, model and workaround can be substantiated. No AWS usage
or mini-challenge evidence is implied by this feedback.

## Observed browser-generation friction on 12 October

Task: generate the English notebook meaning “First, let’s listen.” with the
already selected Koichi voice and Multilingual v2. Steps: enter the text and click
Generate speech. Expected: a generated clip in the player. Actual: “Failed to
fetch”, with no English entry in the subsequently loaded history. Workaround:
retry once after checking history; the generated result appeared and downloaded.
Severity: minor, recovered. Suggestion: show whether a failed generation was
charged/completed and provide an explicit safe retry tied to that attempt. This
was the web interface, not an MCP/API error. The five-clip batch used 90 credits.
