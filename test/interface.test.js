const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function luminance(hex) {
  const values = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
}
test('semantic normal-text colours meet 4.5:1 on their declared reading surfaces', () => {
  const css = fs.readFileSync(path.join(__dirname, '../web/src/lib/identity.css'), 'utf8');
  const tokens = Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*(#[\da-f]{6})(?=\s*[;}])/gi)].map(match => [match[1], match[2]]));
  for (const [foreground, background] of [['--ink', '--paper'], ['--muted', '--paper'], ['--signal', '--paper'], ['--action-ink', '--paper'], ['--muted-on-dark', '--ink']]) {
    assert.ok(tokens[foreground] && tokens[background], `Missing ${foreground}/${background}`);
    const a = luminance(tokens[foreground]), b = luminance(tokens[background]);
    const contrast = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    assert.ok(contrast >= 4.5, `${foreground} on ${background}: ${contrast.toFixed(2)}:1`);
  }
});

test('responsive rider selection uses one optimised asset per viewport', async () => {
  const { riderAssetFor } = await import('../web/src/lib/ride-assets.js');
  assert.equal(riderAssetFor(390), '/images/ride-rider-courier-rear.webp');
  assert.equal(riderAssetFor(800), '/images/ride-rider-courier-rear.webp');
  assert.equal(riderAssetFor(1280), '/images/ride-rider-courier.webp');
  for (const asset of [riderAssetFor(390), riderAssetFor(1280), '/images/ride-fuji.webp', '/images/quest-city-cover.webp']) {
    const bytes = fs.readFileSync(path.join(__dirname, '../web/static', asset));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.ok(bytes.length < 500000, `${asset} exceeds the per-image budget`);
  }
});

test('intro leaves the scene transparent and its text backing stays readable over white', () => {
  const source = fs.readFileSync(path.join(__dirname, '../web/src/lib/StudentMcp.svelte'), 'utf8');
  assert.match(source, /\.intro\{[^}]*background:transparent/);
  const opacity = Number(source.match(/background:color-mix\(in srgb,var\(--ink\) (\d+)%,transparent\)/)?.[1]) / 100;
  assert.ok(opacity > 0 && opacity < 1, 'Use translucent backing on text, not an opaque intro panel');
  const css = fs.readFileSync(path.join(__dirname, '../web/src/lib/identity.css'), 'utf8');
  const ink = css.match(/--ink:\s*(#[\da-f]{6})/i)[1];
  const paper = css.match(/--paper:\s*(#[\da-f]{6})/i)[1];
  const whiteComposite = '#' + ink.slice(1).match(/../g)
    .map(channel => Math.round(parseInt(channel, 16) * opacity + 255 * (1 - opacity)).toString(16).padStart(2, '0')).join('');
  assert.ok((luminance(paper) + .05) / (luminance(whiteComposite) + .05) >= 4.5);
});
