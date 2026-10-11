const express = require('express');
const path = require('node:path');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { z } = require('zod');
const { createMcpStore } = require('./mcp-store');

const result = data => ({ content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data });
const failure = message => ({ isError: true, content: [{ type: 'text', text: message }] });

async function createMcpApp({ file = path.join(__dirname, '../data/mcp-profiles.json'), clock = Date.now,
  origins = ['http://127.0.0.1:3001', 'http://localhost:3001', 'http://127.0.0.1:5173', 'http://localhost:5173'],
  hosts = ['127.0.0.1', 'localhost', '[::1]'], serveWeb = true } = {}) {
  const model = await import('../web/src/lib/founders.js');
  const store = await createMcpStore(file, model, clock);
  const app = express();
  app.disable('x-powered-by');
  // This is a loopback-only pilot, not an internet-facing OAuth deployment.
  app.use((req, res, next) => {
    if (!hosts.includes(req.hostname) || (req.headers.origin && !origins.includes(req.headers.origin))) {
      return res.status(403).json({ error: 'Origin or host not allowed' });
    }
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  app.get('/health', (_req, res) => res.json({ service: 'alexa-chan-mcp', protocol: '2025-11-25', sampleOnly: true }));
  app.post('/mcp/profile', async (req, res) => {
    if (!req.is('application/json') || !req.body || Object.keys(req.body).length) return res.status(400).json({ error: 'Expected an empty JSON object' });
    try { res.status(201).json({ token: await store.create(), sampleOnly: true }); }
    catch { res.status(503).json({ error: 'Cannot create a local profile. Check server storage or profile limit.' }); }
  });
  app.use('/mcp', (req, res, next) => {
    const token = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    if (!token || !store.has(token)) return res.status(401).json({ error: 'A valid local judge profile is required' });
    res.locals.token = token;
    next();
  });

  function buildServer(token) {
    const server = new McpServer({ name: 'alexa-chan-student', version: '1.0.0' }, {
      instructions: 'A Japanese-learning university student companion. All classes and meetings are fictional judge examples, never a live university timetable. Explain phrases only when requested. Saving or rating memories requires user intent. No Alexa+ device connection or general-purpose chatbot.'
    });
    const language = z.enum(['en', 'fr', 'nl', 'de']).default('en');
    const phraseId = z.enum(['courage', 'step', 'question']);
    const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
    function phrase(id, lang) { const p = model.phrases[id]; return { id, jp: p.jp, romaji: p.romaji, meaning: p.meaning[lang], detail: p.detail[lang] }; }
    server.registerTool('get_day_programme', {
      description: 'Read fictional university classes and project meetings for a date in Europe/Brussels, with one contextual Japanese phrase. Never claims to read a live university timetable.',
      inputSchema: { date: z.string().refine(model.validDate, 'Use a valid YYYY-MM-DD date').optional(), language }, annotations: readOnly
    }, async ({ date = model.brusselsDate(new Date(clock())), language: lang }) => {
      // Relative sample data remains usable during judging without importing any private data.
      const today = model.brusselsDate(new Date(clock()));
      const offset = Math.round((Date.parse(date) - Date.parse(today)) / model.DAY);
      const inCoverage = offset >= 0 && offset <= 6;
      const week = [
        [['Introduction to computer science · example', '09:00', '10:30', 'Lecture hall B · example'], ['Group project meeting · example', '14:00', '15:00', 'Study room 2 · example']],
        [['Research methods seminar · example', '10:00', '11:30', 'Seminar room 4 · example']],
        [['Presentation practice · example', '13:00', '14:00', 'Study room 2 · example']],
        [['Statistics tutorial · example', '09:30', '11:00', 'Lecture hall A · example']],
        [['Library study session · example', '14:00', '15:30', 'University library · example']]
      ];
      const events = (inCoverage ? week[offset] || [] : []).map(([title, startTime, endTime, location], index) => ({
        id: `sample-${date}-${index}`, date, startTime, endTime, title, location,
        description: 'Fictional university example for testing. Not a real enrolment, class or appointment.'
      }));
      return result({ sampleOnly: true, source: 'Rolling fictional seven-day university timetable', timezone: 'Europe/Brussels', date, today,
        coverage: { from: today, to: model.moveDay(today, 6) }, status: !inCoverage ? 'outside' : events.length ? 'ready' : 'empty',
        events, phrase: phrase(offset === 2 ? 'courage' : 'step', lang) });
    });
    server.registerTool('explain_phrase', {
      description: 'Give the meaning, a short explanation, or how to ask for today’s programme in Japanese. No open-ended translation.',
      inputSchema: { phraseId, language, depth: z.enum(['meaning', 'detail', 'question']).default('meaning') }, annotations: readOnly
    }, async ({ phraseId: id, language: lang, depth }) => {
      const entry = phrase(depth === 'question' ? 'question' : id, lang);
      return result({ phrase: entry, depth, text: depth === 'detail' ? entry.detail : entry.meaning });
    });
    server.registerTool('save_phrase', {
      description: 'Save one supported phrase to this authenticated local judge profile. Duplicate saves are safe. No calendar details or notes are stored.',
      inputSchema: { phraseId }, annotations: { ...readOnly, readOnlyHint: false }
    }, async ({ phraseId: id }) => {
      try { return result({ memories: await store.save(token, id), persisted: true }); }
      catch { return failure('The server could not save this phrase. Nothing has been confirmed saved. Try again.'); }
    });
    server.registerTool('list_memories', {
      description: 'Read this local judge profile’s saved phrases and due review times.', inputSchema: { language }, annotations: readOnly
    }, async ({ language: lang }) => result({ memories: store.get(token).progress.memories.map(card => ({ ...card, phrase: phrase(card.id, lang) })), now: clock() }));
    server.registerTool('review_phrase', {
      description: 'After the user reveals a saved phrase, record Again or Remembered. Requires the latest reviews count to reject stale submissions.',
      inputSchema: { phraseId, rating: z.enum(['again', 'good']), expectedReviews: z.number().int().min(0).max(9999) },
      annotations: { ...readOnly, readOnlyHint: false, idempotentHint: false }
    }, async ({ phraseId: id, rating, expectedReviews }) => {
      try { return result({ memories: await store.rate(token, id, rating, expectedReviews), persisted: true }); }
      catch { return failure('This review could not be saved. Refresh the deck; the card may have changed, may not be due, or storage may be unavailable.'); }
    });
    return server;
  }
  app.post('/mcp', async (req, res) => {
    const server = buildServer(res.locals.token);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => { transport.close().catch(() => {}); server.close().catch(() => {}); });
    try { await server.connect(transport); await transport.handleRequest(req, res, req.body); }
    catch { if (!res.headersSent) res.status(500).json({ error: 'MCP request failed' }); }
  });
  app.all('/mcp', (_req, res) => res.status(405).set('Allow', 'POST').json({ error: 'Standalone SSE and session deletion are not supported by this stateless server' }));
  if (serveWeb) {
    app.use(express.static(path.join(__dirname, '../web/build'), { extensions: ['html'] }));
  }
  app.use((err, _req, res, _next) => res.status(err.status === 413 ? 413 : 400).json({ error: 'Invalid request body' }));
  return app;
}
module.exports = { createMcpApp };
