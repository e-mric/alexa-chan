const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');

// Compile the real Svelte components, not a hand-written HTML fixture.
const web = path.resolve(__dirname, '../web');
const resolveWeb = name => pathToFileURL(require.resolve(name, { paths: [web] })).href;
let server, render, Card, Notes, Student;
before(async () => {
  const { createServer } = await import(resolveWeb('vite'));
  const { svelte } = await import(resolveWeb('@sveltejs/vite-plugin-svelte'));
  server = await createServer({ root: web, configFile: false, plugins: [svelte({ configFile: false })],
    resolve: { alias: { $lib: path.join(web, 'src/lib') } },
    server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  ({ render } = await server.ssrLoadModule('svelte/server'));
  Card = (await server.ssrLoadModule('/src/lib/NotePhraseCard.svelte')).default;
  Notes = (await server.ssrLoadModule('/src/lib/SessionNotes.svelte')).default;
  Student = (await server.ssrLoadModule('/src/lib/StudentMcp.svelte')).default;
});
after(async () => { await server?.close(); });

test('Kaela is the fictional student in the rendered onboarding and linked routes', () => {
  const output = render(Student, { props: { judgeMode: false } });
  assert.match(output.head, /Kaela’s university day/);
  assert.match(output.body, /MEET KAELA/);
  assert.match(output.body, /Try Kaela’s day/);
  assert.match(output.body, /Kaela’s seven-day university timetable is fictional/);
  assert.doesNotMatch(output.body + output.head, /Noor|NOOR/);
  for (const name of ['lib/StudentMcp.svelte', 'lib/FoundersJourney.svelte', 'routes/ride/+page.svelte', 'routes/legacy/+page.svelte']) {
    const source = fs.readFileSync(path.join(web, 'src', name), 'utf8');
    assert.doesNotMatch(source, /Noor|NOOR/, name);
    assert.match(source, /Kaela/, name);
  }
});

test('note discovery starts unrevealed, with no implicit capture or recall score', async () => {
  const { phrases } = await import('../web/src/lib/founders.js');
  let writes = 0;
  const html = render(Card, { props: { phrase: phrases.step, onkeep: () => writes++, onback() {} } }).body;
  assert.match(html, /一歩ずつ。/);
  assert.match(html, /Reveal meaning/);
  assert.match(html, /Keep this phrase/);
  assert.match(html, /Back to your note/);
  assert.match(html, /Ippo zutsu/);
  assert.match(html, /<input[^>]*checked/);
  assert.doesNotMatch(html, /One step at a time|Remembered|Again|autoplay|<audio/);
  assert.equal(writes, 0);
});

test('an existing saved phrase cannot be captured twice by the study card', async () => {
  const { phrases } = await import('../web/src/lib/founders.js');
  const html = render(Card, { props: { phrase: phrases.step, saved: true, onkeep() {}, onback() {} } }).body;
  assert.match(html, /<button[^>]*disabled[^>]*>Saved to your memories<\/button>/);
  assert.doesNotMatch(html, /Remembered|Again/);
});

test('student collection renders original previews without covers or learning interruptions', async () => {
  const { freshProgress } = await import('../web/src/lib/founders.js');
  const { saveSessionNote } = await import('../web/src/lib/session-notes.js');
  const body = '  Literal <script>neverExecute()</script>\n\n# My original notes';
  const progress = saveSessionNote(freshProgress(), { id: 'synthetic-ui', date: '2026-10-21', title: 'My class' },
    { body, question: '', takeaway: '' }, 1000);
  let writes = 0;
  const html = render(Notes, { props: { progress, student: true, oncommit: () => writes++, ondirty() {}, onback() {} } }).body;
  assert.match(html, /My class/);
  assert.match(html, /Literal &lt;script(?:>|&gt;)neverExecute\(\)&lt;\/script(?:>|&gt;)/);
  assert.doesNotMatch(html, /<script>neverExecute/);
  assert.doesNotMatch(html, /notebook-cover|note-study-screen|Reveal meaning/);
  assert.equal(progress.sessionNotes[0].body, body);
  assert.equal(writes, 0);
});

test('reader stays mounted outside study mode, with explicit scroll and focus restoration', () => {
  const source = fs.readFileSync(path.join(web, 'src/lib/SessionNotes.svelte'), 'utf8');
  assert.match(source, /class="note-reader" hidden=\{student && japanese\}/);
  assert.match(source, /readerScroll = window\.scrollY/);
  assert.match(source, /window\.scrollTo\(\{ top: readerScroll, behavior: 'instant' \}\)/);
  assert.match(source, /returnTarget\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(source, /class="study-entry" hidden=\{japanese\}/);
  assert.match(source, /if \(!saved \|\| !phrase \|\| dirty \|\| busy\) return/);
});

test('focused notes move advanced listening behind More without removing transport or errors', () => {
  const player = fs.readFileSync(path.join(web, 'src/lib/AudioReader.svelte'), 'utf8');
  const notes = fs.readFileSync(path.join(web, 'src/lib/SessionNotes.svelte'), 'utf8');
  const card = fs.readFileSync(path.join(web, 'src/lib/NotePhraseCard.svelte'), 'utf8');
  assert.match(player, /\{#if !\$focusedListening\}<button class="toggle"/);
  assert.match(player, /\{#if \$speech\.playing\}/);
  assert.match(player, /speech\.pause\(\)/);
  assert.match(player, /speech\.setSlow\(/);
  assert.match(player, /\{#if \$speech\.message\}<p class="status" role="status"/);
  assert.match(notes, /openAudioTools\(menu\.querySelector\('summary'\)\)/);
  assert.match(card, /class="more" onclick=\{event => openAudioTools\(event\.currentTarget\)\}/);
});
