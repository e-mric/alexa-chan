const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createMcpApp } = require('../lib/mcp-app');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StreamableHTTPClientTransport } = require('@modelcontextprotocol/sdk/client/streamableHttp.js');

const fixedTime = Date.parse('2026-10-07T07:00:00Z');
async function serve(file) {
  const app = await createMcpApp({ file, clock: () => fixedTime, serveWeb: false });
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }) };
}
async function profile(url) {
  const res = await fetch(`${url}/mcp/profile`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 201);
  return (await res.json()).token;
}
async function connect(url, token) {
  const client = new Client({ name: 'integration-test', version: '1.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${url}/mcp`), { requestInit: { headers: { Authorization: `Bearer ${token}` } } }));
  return client;
}
const call = async (client, name, args = {}) => {
  const response = await client.callTool({ name, arguments: args });
  assert.ok(!response.isError, JSON.stringify(response.content));
  return response.structuredContent;
};

test('MCP server uses real Streamable HTTP, isolated persistent profiles and safe failure paths', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'alexa-mcp-test-'));
  const file = path.join(directory, 'profiles.json');
  let running = await serve(file), a, b;
  t.after(async () => { await a?.close(); await b?.close(); await running.close(); await fs.rm(directory, { recursive: true, force: true }); });
  const tokenA = await profile(running.url), tokenB = await profile(running.url);
  a = await connect(running.url, tokenA); b = await connect(running.url, tokenB);

  await t.test('initializes using 2025-11-25 and lists all five tools', async () => {
    const response = await fetch(`${running.url}/mcp`, { method: 'POST', headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'raw-test', version: '1' } } }) });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).result.protocolVersion, '2025-11-25');
    assert.deepEqual((await a.listTools()).tools.map(x => x.name).sort(), ['get_day_programme', 'explain_phrase', 'save_phrase', 'list_memories', 'review_phrase'].sort());
  });
  await t.test('serves labelled synthetic events and contextual Japanese, never private data', async () => {
    const day = await call(a, 'get_day_programme', { language: 'en' });
    assert.equal(day.date, '2026-10-07'); assert.equal(day.sampleOnly, true); assert.equal(day.status, 'ready');
    assert.equal(day.events.length, 2);
    assert.equal(day.events[0].title, 'Introduction to computer science · example');
    assert.equal(day.events[1].title, 'Group project meeting · example');
    assert.equal(day.events[1].startTime, '14:00');
    assert.equal(day.phrase.jp, '一歩ずつ。');
    const presentation = await call(a, 'get_day_programme', { date: '2026-10-09' });
    assert.equal(presentation.events[0].title, 'Presentation practice · example');
    assert.equal(presentation.phrase.jp, '君ならできる！');
    assert.equal((await call(a, 'get_day_programme', { date: '2026-10-12' })).status, 'empty');
    assert.equal((await call(a, 'get_day_programme', { date: '2020-01-01' })).status, 'outside');
    const explanation = await call(a, 'explain_phrase', { phraseId: 'courage', language: 'en', depth: 'question' });
    assert.equal(explanation.phrase.jp, '今日の予定は？'); assert.equal(explanation.text, 'What’s on my calendar today?');
  });
  await t.test('invalid dates and unsupported phrases fail without writes', async () => {
    for (const [name, args] of [['get_day_programme', { date: '2026-02-30' }], ['save_phrase', { phraseId: '../../private' }], ['explain_phrase', { phraseId: 'step', language: 'xx' }]]) {
      assert.equal((await a.callTool({ name, arguments: args })).isError, true);
    }
    assert.equal((await call(a, 'list_memories')).memories.length, 0);
  });
  await t.test('student tools offer English explanations only and reject other base languages', async () => {
    const catalogue = await a.listTools();
    for (const tool of catalogue.tools.filter(tool => tool.inputSchema.properties?.language)) {
      const schema = tool.inputSchema.properties.language;
      assert.ok(schema.const === 'en' || JSON.stringify(schema.enum) === '["en"]');
    }
    for (const language of ['fr', 'nl', 'de']) {
      assert.equal((await a.callTool({ name: 'explain_phrase', arguments: { phraseId: 'step', language } })).isError, true);
    }
    assert.equal((await call(a, 'list_memories')).memories.length, 0);
  });
  await t.test('concurrent duplicate saves are idempotent and profiles do not leak', async () => {
    await Promise.all([call(a, 'save_phrase', { phraseId: 'question' }), call(a, 'save_phrase', { phraseId: 'question' }), call(a, 'save_phrase', { phraseId: 'step' })]);
    assert.equal((await call(a, 'list_memories')).memories.length, 2);
    assert.equal((await call(b, 'list_memories')).memories.length, 0);
    const disk = await fs.readFile(file, 'utf8'); assert.ok(!disk.includes(tokenA)); assert.ok(!disk.includes(tokenB));
  });
  await t.test('review schedules next day and rejects duplicate stale reviews', async () => {
    const response = await call(a, 'review_phrase', { phraseId: 'question', rating: 'good', expectedReviews: 0 });
    assert.equal(response.memories.find(m => m.id === 'question').due, fixedTime + 86400000);
    assert.equal((await a.callTool({ name: 'review_phrase', arguments: { phraseId: 'question', rating: 'good', expectedReviews: 0 } })).isError, true);
  });
  await t.test('reloads saved cards after the server restarts', async () => {
    await a.close(); await b.close(); await running.close();
    running = await serve(file); a = await connect(running.url, tokenA); b = await connect(running.url, tokenB);
    const data = await call(a, 'list_memories');
    assert.equal(data.memories.length, 2); assert.equal(data.memories.find(m => m.id === 'question').reviews, 1);
    assert.equal((await call(b, 'list_memories')).memories.length, 0);
  });
  await t.test('rejects foreign origins, invalid hosts, missing tokens and oversized bodies', async () => {
    assert.equal((await fetch(`${running.url}/mcp`, { method: 'POST' })).status, 401);
    assert.equal((await fetch(`${running.url}/mcp/profile`, { method: 'POST', headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
    // Node fetch normalizes Host; use the raw HTTP API to exercise rebinding protection.
    const hostStatus = await new Promise((resolve, reject) => {
      require('node:http').get(`${running.url}/health`, { headers: { Host: 'attacker.example' } }, res => { res.resume(); resolve(res.statusCode); }).on('error', reject);
    });
    assert.equal(hostStatus, 403);
    assert.equal((await fetch(`${running.url}/mcp`, { headers: { Authorization: `Bearer ${tokenA}` } })).status, 405);
    assert.equal((await fetch(`${running.url}/mcp`, { method: 'POST', headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'x'.repeat(17000) }) })).status, 413);
    assert.equal((await fetch(`${running.url}/mcp`, { method: 'POST', headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' }, body: '{bad' })).status, 400);
  });
  await t.test('browser client performs initialize/list/call without reading personal storage', async () => {
    const { createFoundersClient, JUDGE_KEY } = await import('../web/src/lib/founders-mcp.js');
    const values = new Map(), reads = [], log = [];
    const storage = { getItem: key => { reads.push(key); return values.get(key) ?? null; }, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
    const web = createFoundersClient({ baseUrl: running.url, storage, onTrace: entry => log.push(entry) });
    try {
      await web.connect();
      await web.call('save_phrase', { phraseId: 'courage' });
      await web.close(); await web.connect();
      assert.equal((await web.call('list_memories')).memories.length, 1);
      assert.ok(log.some(e => e.name === 'initialize' && e.protocol === '2025-11-25'));
      assert.ok(log.some(e => e.name === 'tools/list' && e.ok));
      assert.ok(log.some(e => e.name === 'tools/call · save_phrase' && e.ok));
      assert.ok(reads.every(key => key === JUDGE_KEY));
      assert.ok(!JSON.stringify(log).includes(values.get(JUDGE_KEY)));
    } finally { await web.close(); }
  });
  await t.test('storage failure returns a tool error rather than a false saved state', async () => {
    await fs.rename(directory, `${directory}-hold`);
    await fs.writeFile(directory, 'not a directory');
    try { assert.equal((await b.callTool({ name: 'save_phrase', arguments: { phraseId: 'step' } })).isError, true); }
    finally { await fs.unlink(directory); await fs.rename(`${directory}-hold`, directory); }
    assert.equal((await call(b, 'list_memories')).memories.length, 0);
  });
  await t.test('browser client surfaces network failure with no fabricated programme', async () => {
    const { createFoundersClient } = await import('../web/src/lib/founders-mcp.js');
    const log = [];
    const web = createFoundersClient({ baseUrl: running.url, storage: { getItem: () => tokenA },
      fetcher: async () => { throw Error('Simulated offline server'); }, onTrace: entry => log.push(entry) });
    await assert.rejects(web.connect(), /offline/);
    await assert.rejects(web.call('get_day_programme'), /Connect/);
    assert.ok(log.some(e => e.name === 'initialize' && !e.ok));
    await web.close();
  });
});
