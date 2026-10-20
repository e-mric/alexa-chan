const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { localTargets, checkLinks, documentationFiles } = require('../scripts/check-docs.cjs');

test('documentation targets include inline, image and reference paths but skip code and remote links', () => {
  const input = [
    '[Topic](docs/topic.md#section) ![Image](images/cover.png)',
    '[with spaces](<docs/a page.md>)',
    '[ref]: docs/topic.md "A title"',
    '[web](https://example.com) [mail](mailto:a@example.com) [section](#heading)',
    '`[sample](absent.md)`',
    '```md', '[example](missing.md)', '```',
    '~~~', '[example](also-missing.md)', '~~~'
  ].join('\n');
  assert.deepEqual(localTargets(input), [
    { target: 'docs/topic.md#section', line: 1 }, { target: 'images/cover.png', line: 1 },
    { target: 'docs/a page.md', line: 2 }, { target: 'docs/topic.md', line: 3 }
  ]);
});

test('documentation checks resolve relative/encoded paths and report missing, escaping and malformed targets', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'alexa-docs-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'docs', 'nested'), { recursive: true });
  fs.writeFileSync(path.join(root, 'README.md'), '# Readme');
  fs.writeFileSync(path.join(root, 'docs', 'a page.md'), '# A page');
  fs.writeFileSync(path.join(root, 'docs', 'nested', 'guide.md'), [
    '[Root](../../README.md#unvalidated-anchor)', '[Space](../a%20page.md)',
    '[Missing](absent.md)', '[Escape](../../../outside.md)', '[Bad](%ZZ.md)'
  ].join('\n'));
  fs.writeFileSync(path.join(root, 'docs', 'notes.txt'), 'Not a Markdown document');
  assert.deepEqual(documentationFiles(root), ['README.md', 'docs/a page.md', 'docs/nested/guide.md']);
  assert.deepEqual(checkLinks(root, documentationFiles(root)), [
    'docs/nested/guide.md:3: absent.md (missing target)',
    'docs/nested/guide.md:4: ../../../outside.md (outside repository)',
    'docs/nested/guide.md:5: %ZZ.md (invalid encoding)'
  ]);
});
