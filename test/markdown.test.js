const { test } = require('node:test');
const assert = require('node:assert/strict');

test('formatted notes render common Markdown without changing the saved source', async () => {
  const { renderNoteMarkdown } = await import('../web/src/lib/note-markdown.js');
  const source = '# Lecture\n\n**Important** and *curious*.\n\n- First\n- Second\n\n> A quote\n\n```js\nconst n = 1;\n```\n';
  const html = renderNoteMarkdown(source);
  for (const pattern of [/<h5>Lecture<\/h5>/, /<strong>Important<\/strong>/, /<em>curious<\/em>/, /<ul>/, /<blockquote>/, /<pre><code/]) assert.match(html, pattern);
  assert.match(html, /const n = 1;/);
  assert.equal(source.startsWith('# Lecture\n\n'), true);
});

test('formatted notes cannot run HTML, load remote images or activate unsafe links', async () => {
  const { renderNoteMarkdown } = await import('../web/src/lib/note-markdown.js');
  const source = '<script>alert(1)</script>\n<img src="https://example.com/pixel" onerror="alert(1)">\n\n![Private image](https://example.com/private.png)\n\n[bad](javascript:alert(1)) [data](data:text/html,attack) [file](file:///tmp/private) [relative](/mcp/profile)\n\n[safe](https://example.com/read)';
  const html = renderNoteMarkdown(source);
  assert.doesNotMatch(html, /<(?:script|img|iframe|svg)\b/i);
  assert.doesNotMatch(html, /href="(?:javascript:|data:|file:|\/mcp)/i);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Private image/);
  assert.match(html, /href="https:\/\/example.com\/read"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /referrerpolicy="no-referrer"/);
});

test('Markdown links cannot smuggle encoded protocols or attributes', async () => {
  const { renderNoteMarkdown } = await import('../web/src/lib/note-markdown.js');
  for (const source of ['[bad](javascript&#58;alert(1))', '[bad](java&#x73;cript:alert(1))', '[bad](//example.com/pixel)', '<a href="javascript:alert(1)">bad</a>', '[safe](https://example.com "\" onmouseover=\"alert(1)")']) {
    const html = renderNoteMarkdown(source);
    assert.doesNotMatch(html, /href="(?:javascript:|\/\/)/i);
    assert.doesNotMatch(html, /<[^>]+\son(?:click|mouseover|error)\s*=/i);
  }
});
