const { test } = require('node:test');
const assert = require('node:assert/strict');

test('student notebooks and old personal data use independent stores', async () => {
  const { PERSONAL_KEY, STUDENT_PERSONAL_KEY, freshProgress, readPersonal, writePersonal } = await import('../web/src/lib/founders.js');
  const values = new Map();
  const storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  const old = { snapshot: null, progress: { ...freshProgress(), notes: { '2026-10-12': 'Existing personal note' } } };
  writePersonal(storage, old);
  const original = values.get(PERSONAL_KEY);
  assert.equal(readPersonal(storage, STUDENT_PERSONAL_KEY).progress.sessionNotes.length, 0);
  writePersonal(storage, { snapshot: null, progress: { ...freshProgress(), locale: 'en', notes: { '2026-10-12': 'Study notes' } } }, STUDENT_PERSONAL_KEY);
  assert.equal(values.get(PERSONAL_KEY), original);
  assert.equal(readPersonal(storage).progress.notes['2026-10-12'], 'Existing personal note');
  assert.equal(readPersonal(storage, STUDENT_PERSONAL_KEY).progress.notes['2026-10-12'], 'Study notes');
  assert.equal(readPersonal(storage, STUDENT_PERSONAL_KEY).progress.locale, 'en');
});

test('student interface copy exists consistently in every starting language', async () => {
  const { studentCopy } = await import('../web/src/lib/student-copy.js');
  for (const locale of ['en', 'fr', 'nl', 'de']) {
    assert.deepEqual(Object.keys(studentCopy[locale]), Object.keys(studentCopy.en));
    assert.ok(Object.values(studentCopy[locale]).every(text => typeof text === 'string' && text.length));
  }
});

test('student MCP storage preflight never touches the parked profile namespace', async () => {
  const { createFoundersClient, JUDGE_KEY, STUDENT_JUDGE_KEY } = await import('../web/src/lib/founders-mcp.js');
  const values = new Map([[JUDGE_KEY, 'parked profile'], [`${JUDGE_KEY}:check`, 'existing value']]);
  const reads = [], writes = [], removals = [];
  const storage = {
    getItem: key => { reads.push(key); return values.get(key) || null; },
    setItem: (key, value) => { writes.push(key); values.set(key, value); },
    removeItem: key => { removals.push(key); values.delete(key); }
  };
  const client = createFoundersClient({ baseUrl: 'http://127.0.0.1:3001', storage, storageKey: STUDENT_JUDGE_KEY,
    fetcher: async () => new Response('{}', { status: 503 }) });
  await assert.rejects(client.connect(), /Cannot create a judge profile/);
  assert.deepEqual(reads, [STUDENT_JUDGE_KEY]);
  assert.deepEqual(writes, [`${STUDENT_JUDGE_KEY}:check`]);
  assert.deepEqual(removals, [`${STUDENT_JUDGE_KEY}:check`]);
  assert.equal(values.get(JUDGE_KEY), 'parked profile');
  assert.equal(values.get(`${JUDGE_KEY}:check`), 'existing value');
  await client.close();
});

test('journey navigation and audio transport copy cover all four starting languages', async () => {
  const { journeyCopy } = await import('../web/src/lib/journey-copy.js');
  const { audioCopy } = await import('../web/src/lib/audio-copy.js');
  for (const locale of ['en', 'fr', 'nl', 'de']) {
    assert.deepEqual(Object.keys(journeyCopy[locale]), Object.keys(journeyCopy.en));
    assert.deepEqual(Object.keys(audioCopy[locale]), Object.keys(audioCopy.en));
    for (const key of ['pause', 'resume', 'slower', 'options', 'slowHelp']) assert.ok(audioCopy[locale][key]);
  }
});

test('student presentation is English without overwriting older saved language or note data', async () => {
  const { interfaceLocale } = await import('../web/src/lib/student-copy.js');
  const model = await import('../web/src/lib/founders.js');
  const { saveSessionNote } = await import('../web/src/lib/session-notes.js');
  for (const locale of ['fr', 'nl', 'de', 'en']) {
    const values = new Map();
    const storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
    const progress = saveSessionNote({ ...model.freshProgress(), locale },
      { id: 'synthetic-lecture', title: 'Synthetic lecture', date: '2026-10-20' },
      { body: '  Original wording.\n', question: '', takeaway: '' });
    model.writePersonal(storage, { snapshot: null, progress }, model.STUDENT_PERSONAL_KEY);
    const original = values.get(model.STUDENT_PERSONAL_KEY);
    const loaded = model.readPersonal(storage, model.STUDENT_PERSONAL_KEY);
    assert.equal(interfaceLocale(true, loaded.progress.locale), 'en');
    assert.equal(interfaceLocale(false, loaded.progress.locale), locale, 'Parked compatibility remains available');
    assert.equal(values.get(model.STUDENT_PERSONAL_KEY), original);
    assert.equal(loaded.progress.sessionNotes[0].body, '  Original wording.\n');
    assert.equal(loaded.progress.locale, locale);
  }
});
