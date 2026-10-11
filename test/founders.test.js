const test = require('node:test');
const assert = require('node:assert/strict');
const model = import('../web/src/lib/founders.js');
// Synthetic data only: the private programme snapshot must never enter this suite.
const fixture = () => ({ version: 1, timezone: 'Europe/Brussels', capturedOn: '2026-10-06',
  coverage: { from: '2026-10-06', to: '2026-10-31' }, sourceUrl: 'https://example.notion.site/calendar',
  events: [{ id: 'synthetic-session', title: 'Example workshop', date: '2026-10-07',
    startTime: '09:30', endTime: '12:30', attendance: 'mandatory', kind: 'workshop', url: 'https://example.notion.site/session' }] });

test('core personal journey Japanese phrases have exact-text recordings', async t => {
  const { phrases } = await model;
  const { voiceRecordings } = await import('../web/src/lib/voice-recordings.js');
  if (!voiceRecordings.length) return t.skip('Device-voice distribution intentionally omits provider recordings.');
  for (const phrase of ['courage', 'step', 'question'].map(id => phrases[id])) {
    assert.ok(voiceRecordings.some(clip => clip.text === phrase.jp && clip.lang === 'ja-JP'));
  }
});

test('Belgian base languages have recordings for meanings, details and preparation', async t => {
  const { phrases, LOCALES } = await model;
  const { copy } = await import('../web/src/lib/founders-copy.js');
  const { voiceRecordings } = await import('../web/src/lib/voice-recordings.js');
  if (!voiceRecordings.length) return t.skip('Device-voice distribution intentionally omits provider recordings.');
  for (const language of ['fr', 'nl', 'de']) {
    const texts = [copy[language].prep, ...['courage', 'step', 'question'].map(id => phrases[id]).flatMap(p => [p.meaning[language], p.detail[language]])];
    for (const text of texts) assert.ok(voiceRecordings.some(clip => clip.text === text && clip.lang === LOCALES[language]), `${language}: ${text}`);
  }
});

test('all four base languages cover the same interface and Japanese phrase keys', async () => {
  const { copy, languageNames } = await import('../web/src/lib/founders-copy.js');
  const { audioCopy } = await import('../web/src/lib/audio-copy.js');
  const { phrases, LOCALES } = await model;
  assert.deepEqual(Object.keys(LOCALES), Object.keys(languageNames));
  for (const language of Object.keys(LOCALES)) {
    assert.deepEqual(Object.keys(copy[language]).sort(), Object.keys(copy.en).sort());
    assert.deepEqual(Object.keys(audioCopy[language]).sort(), Object.keys(audioCopy.en).sort());
    assert.ok(Object.values(copy[language]).every(s => typeof s === 'string' && s.length));
    for (const phrase of Object.values(phrases)) assert.ok(phrase.meaning[language] && phrase.detail[language]);
  }
});

test('snapshot validation preserves unknown times, strips unrelated personal fields and sorts events', async () => {
  const { validateSnapshot, parseSnapshot } = await model;
  const raw = fixture();
  raw.events.push({ ...raw.events[0], id: 'earlier', date: '2026-10-06', startTime: null, endTime: null, secret: 'not stored' });
  raw.secret = 'not stored';
  const result = parseSnapshot(JSON.stringify(raw));
  assert.equal(result.events[0].id, 'earlier');
  assert.equal(result.events[0].startTime, null);
  assert.equal(result.events[0].endDate, '2026-10-06');
  assert.equal(result.events[0].secret, undefined);
  assert.equal(result.secret, undefined);
  assert.deepEqual(validateSnapshot(result), result);
});

test('invalid dates, unsafe source URLs, duplicate events and malformed times are rejected', async () => {
  const { validateSnapshot, parseSnapshot, validDate } = await model;
  for (const value of ['2026-02-30', '2026-13-01', '2026-1-02', null]) assert.equal(validDate(value), false);
  const bad = [
    raw => raw.events.push(raw.events[0]), raw => raw.events[0].date = '2026-02-30',
    raw => raw.events[0].date = '2027-01-01', raw => raw.coverage.to = '2026-01-01',
    raw => raw.events[0].startTime = '25:00', raw => raw.events[0].endTime = '08:00',
    raw => raw.events[0].startTime = null, raw => raw.sourceUrl = 'javascript:alert(1)',
    raw => raw.events[0].url = 'https://notion.site.evil.example/calendar',
    raw => raw.sourceUrl = 'https://user:password@notion.site/calendar'
  ];
  for (const mutate of bad) { const raw = fixture(); mutate(raw); assert.throws(() => validateSnapshot(raw)); }
  assert.throws(() => parseSnapshot('not json'));
  assert.throws(() => parseSnapshot(' '.repeat(512001)));
});

test('unknown, uncovered and empty days are different; multi-day breaks respect coverage', async () => {
  const { validateSnapshot, daySchedule, snapshotAge } = await model;
  const raw = fixture();
  raw.events.push({ ...raw.events[0], id: 'break', kind: 'break', date: '2026-10-24', endDate: '2026-11-02' });
  const snapshot = validateSnapshot(raw);
  assert.equal(daySchedule(null, '2026-10-07').status, 'missing');
  assert.equal(daySchedule(snapshot, '2026-11-01').status, 'outside');
  assert.equal(daySchedule(snapshot, '2026-10-08').status, 'empty');
  assert.equal(daySchedule(snapshot, '2026-10-07').status, 'ready');
  assert.equal(daySchedule(snapshot, '2026-10-31').events[0].kind, 'break');
  assert.equal(snapshotAge(snapshot, '2026-10-14'), 8);
});

test('calendar days use Brussels timezone including daylight-saving boundaries', async () => {
  const { brusselsDate, moveDay } = await model;
  assert.equal(brusselsDate(new Date('2026-10-06T22:30:00Z')), '2026-10-07');
  assert.equal(brusselsDate(new Date('2026-10-25T22:30:00Z')), '2026-10-25');
  assert.equal(brusselsDate(new Date('2026-10-25T23:30:00Z')), '2026-10-26');
  assert.equal(moveDay('2026-10-25', 1), '2026-10-26');
  assert.equal(moveDay('2026-10-31', 1), '2026-11-01');
});

test('guided Japanese shortcut accepts kana and romaji, not arbitrary or translated questions', async () => {
  const { isTodayQuestion } = await model;
  for (const input of ['今日の予定は？', 'Kyō no yotei wa?', 'KYOU NO YOTEI WA', '  kyo no yotei wa  ']) assert.ok(isTodayQuestion(input));
  for (const input of ['What is my agenda?', 'weather', '', null]) assert.equal(isTodayQuestion(input), false);
});

test('memories deduplicate, reveal no event data and have persistent due times', async () => {
  const { freshProgress, saveMemory, dueMemories, rateMemory, serializePersonal, parseBackup } = await model;
  let progress = saveMemory(freshProgress(), 'step', 1000);
  progress = saveMemory(progress, 'step', 2000);
  assert.equal(progress.memories.length, 1);
  assert.deepEqual(Object.keys(progress.memories[0]).sort(), ['due', 'id', 'interval', 'reviews']);
  progress = rateMemory(progress, 'step', 'again', 1000);
  assert.equal(dueMemories(progress, 60999).length, 0);
  assert.equal(dueMemories(progress, 61000).length, 1);
  progress = rateMemory(progress, 'step', 'good', 61000);
  const restored = parseBackup(serializePersonal({ snapshot: null, progress })).progress;
  assert.equal(restored.memories[0].due, 86461000);
  assert.equal(restored.memories[0].reviews, 2);
  assert.throws(() => rateMemory(restored, 'step', 'good', 61001));
});

test('one atomic local save round-trips language, notes and snapshot without uploading', async () => {
  const { readPersonal, writePersonal, freshProgress, saveMemory, validateSnapshot, PERSONAL_KEY } = await model;
  const values = new Map();
  const storage = { getItem: k => values.get(k), setItem: (k, v) => values.set(k, v) };
  const progress = { ...saveMemory(freshProgress(), 'question', 1000), locale: 'nl', notes: { '2026-10-07': 'My own next step' } };
  const snapshot = validateSnapshot(fixture());
  writePersonal(storage, { snapshot, progress });
  assert.equal(values.size, 1);
  assert.ok(values.has(PERSONAL_KEY));
  assert.deepEqual(readPersonal(storage), { snapshot, progress });
  writePersonal(storage, { snapshot: null, progress });
  assert.deepEqual(readPersonal(storage).progress, progress);
  assert.equal(readPersonal(storage).snapshot, null);
  assert.throws(() => writePersonal({ setItem() { throw Error('quota'); } }, { snapshot, progress }));
});

test('malformed backups and oversized notes cannot overwrite valid progress', async () => {
  const { parseBackup, validateProgress, freshProgress, readPersonal } = await model;
  assert.throws(() => parseBackup('{"kind":"wrong"}'));
  assert.throws(() => validateProgress({ ...freshProgress(), locale: 'xx' }));
  assert.throws(() => validateProgress({ ...freshProgress(), notes: { '2026-10-07': 'x'.repeat(2001) } }));
  assert.throws(() => readPersonal({ getItem: () => 'broken' }));
});
