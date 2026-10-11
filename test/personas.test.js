const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const personas = [
  { name: 'Marta · French university student', locale: 'fr', title: 'Presentation practice', body: '  Ma présentation : comparer les deux sources.\n\nUne idée à la fois.', phrase: 'courage', calendar: true },
  { name: 'Noor · Dutch student', locale: 'nl', title: 'Projectplanning', body: '# Projectplanning\n\n  Eerst de opdracht begrijpen.\nDaarna één haalbare stap.', phrase: 'step' },
  { name: 'Lena · German working student', locale: 'de', title: 'Meine Lernwoche', body: 'Montag: eine Aufgabe auswählen.\nFreitag: Zeit zum Nachdenken.', phrase: 'step', skipJapanese: true },
  { name: 'Sam · English international student', locale: 'en', title: 'Research seminar', body: '# Research seminar\n\n  Listen first.\n<script>literal text</script>', phrase: 'listening' }
];

for (const persona of personas) test(`${persona.name}: useful notes, optional Japanese and recovery across visits`, async () => {
  const model = await import('../web/src/lib/founders.js');
  const { saveSessionNote } = await import('../web/src/lib/session-notes.js');
  const now = Date.parse('2026-10-11T07:00:00Z');
  const snapshot = persona.calendar ? model.parseSnapshot(fs.readFileSync(path.join(__dirname, 'fixtures/persona-calendar.json'), 'utf8')) : null;
  const session = persona.calendar ? model.daySchedule(snapshot, '2026-10-11').events[0]
    : { id: `notebook-${persona.locale}`, title: persona.title, date: '2026-10-11' };
  let progress = saveSessionNote({ ...model.freshProgress(), locale: persona.locale }, session,
    { body: persona.body, question: '', takeaway: '' }, now);
  assert.equal(progress.sessionNotes[0].phraseId, persona.phrase);
  assert.equal(progress.memories.length, 0, 'Saving useful notes must not force learning');
  assert.ok(model.phrases[persona.phrase].meaning[persona.locale]);
  if (!persona.skipJapanese) {
    progress = model.saveMemory(progress, persona.phrase, now);
    progress = model.saveMemory(progress, persona.phrase, now);
    assert.equal(progress.memories.length, 1);
    progress = model.rateMemory(progress, persona.phrase, 'good', now);
    assert.equal(model.dueMemories(progress, now + 60_000).length, 0);
  }
  let saved;
  const storage = { getItem: () => saved, setItem: (_, value) => { saved = value; } };
  model.writePersonal(storage, { snapshot, progress });
  const restored = model.parseBackup(model.serializePersonal(model.readPersonal(storage)));
  assert.equal(restored.progress.locale, persona.locale);
  assert.equal(restored.progress.sessionNotes[0].body, persona.body);
  assert.equal(restored.progress.memories.length, persona.skipJapanese ? 0 : 1);
  if (!persona.skipJapanese) assert.equal(model.dueMemories(restored.progress, now + model.DAY).length, 1);
  const existing = saved;
  assert.throws(() => model.parseBackup('{"kind":"alexa-chan-founders","version":1,"snapshot":null,"progress":{}}'));
  assert.equal(saved, existing);
  assert.equal(restored.snapshot === null, !persona.calendar);
});
