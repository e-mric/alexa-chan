# Cyberpunk quest-card world

Generated with the built-in GPT image generation tool on 30 September 2026.
Assets live in web/static/images: quest-city.png (homepage and onboarding), weather-quest.png (quest panel), memory-quest.png (review sidebar).
These are narrative illustrations, not indicators of real weather or progress.

## Runtime derivatives — 20 October 2026

The student ride uses `ride-fuji.webp` (~227 KiB) and one viewport-appropriate
`ride-rider-courier.webp` (~197 KiB) or `ride-rider-courier-rear.webp` (~215 KiB).
Notebook covers use `quest-city-cover.webp` (~89 KiB, 768 pixels wide). Each has
a regression budget below 500,000 bytes. Originals are preserved; this is format
optimization, not new artwork or additional usage-rights clearance.

Reproduce with `cwebp` 1.6.0: `-q 82 -alpha_q 100` for riders, `-q 82` for Fuji,
and `-q 78 -resize 768 0` for the city cover. Preserve original rider dimensions
(1024 × 1536) so animation masks remain aligned. `ride-assets.js` chooses a rider
at the existing 800px breakpoint and caches a second only if resized across it.

## Practical courier rider update

On 7 October 2026, the built-in GPT image generation tool edited the existing
desktop and rear-view rider sprites. The new transparent assets are
`web/static/images/ride-rider-courier.png` and
`web/static/images/ride-rider-courier-rear.png`. Both are 1024 × 1536 PNGs.
The original sprites remain available. The public ride and university ride use
the new assets with the existing wheel animation masks.

Prompt used for each input sprite:

Use case: precise-object-edit. Edit target: the supplied motorcycle rider sprite for a Three.js scene. Change ONLY the adult female rider's clothing. Make her a practical cyberpunk courier, not a pin-up: a slightly oversized red textile motorcycle jacket with natural loose folds, longer hem covering the hips and upper seat, and loose matte charcoal reinforced cargo riding trousers, subtle utility pockets and knee protection. Retain the cream kanji 旅 clearly on the back, black high ponytail, gloves and boots. No glossy tight trousers, no exaggerated anatomy, no exposed waist. Keep EXACTLY the same pose, hands on handlebars, character scale, head position, motorcycle, rear and front tyres, rims, mechanical details, camera angle and all pixel positions of the bike. This is an in-place wardrobe change, not a new composition: do not crop, recenter or scale the subject. The exact wheel centers and bottom contact points must stay fixed for existing animation masks. Preserve the same 2:3 portrait canvas and hand-inked cyberpunk manga rendering with warm highlights. Output a clean cutout with genuinely transparent background, no floor or cast shadow. No new text, objects or scenery.

## Exact generation prompts

### City

Use case: stylized-concept. Production illustration for Alexa-chan, a Japanese learning companion, in a coherent cyberpunk quest cards world. Original 1980s Japanese science-fiction anime cel illustration, meticulous ink contours, painterly atmospheric city backgrounds, restrained grain, signal vermilion red, icy cyan, charcoal, warm ivory. Evocative, hopeful, inviting, premium collectible card illustration, not generic neon purple. No text, lettering, logos, watermark, UI, or recognizable franchise characters. Asset: landscape homepage hero, 3:2 composition. A red-jacketed young adult courier seen from behind at a rooftop overlook beside an original futuristic red motorcycle, dense Japanese megacity in the blue morning haze, immense red sun, small floating translucent quest-card shapes near the courier's wrist. Strong silhouette and sweeping diagonal road, beautifully detailed but legible at small size. Full bleed illustration.

### Weather

Use case: stylized-concept. Production illustration for Alexa-chan, a Japanese learning companion, in a coherent cyberpunk quest cards world. Original 1980s Japanese science-fiction anime cel illustration, meticulous ink contours, painterly atmospheric city backgrounds, restrained grain, signal vermilion red, icy cyan, charcoal, warm ivory. Evocative, hopeful, inviting, premium collectible card illustration, not generic neon purple. No text, lettering, logos, watermark, UI, or recognizable franchise characters. Asset: portrait weather quest card artwork, 2:3 composition. A single young adult courier in a red rain jacket holding a clear domed umbrella on a rain-soaked futuristic Japanese side street, looking upward at breaks of cyan sky. Wet red reflections, intricate pipes and cables, little amber window lights. Composition centered, cinematic depth, no card frame or written words. Full bleed illustration.

### Memory

Use case: stylized-concept. Production illustration for Alexa-chan, a Japanese learning companion, in a coherent cyberpunk quest cards world. Original 1980s Japanese science-fiction anime cel illustration, meticulous ink contours, painterly atmospheric city backgrounds, restrained grain, signal vermilion red, icy cyan, charcoal, warm ivory. Evocative, hopeful, inviting, premium collectible card illustration, not generic neon purple. No text, lettering, logos, watermark, UI, or recognizable franchise characters. Asset: portrait Japanese memory quest card artwork, 2:3 composition. Close view of a red-sleeved courier's hand holding a luminous blank ivory collectible memory card above a compact retro futuristic desk terminal; several blank cards orbit gently in cyan light, red mechanical casing, distant megacity visible through a window. A quiet contemplative study moment, tactile painted details, no glyphs or text on the cards. Full bleed illustration.
