// Private, deterministic notebook helpers. No network calls or generated rewrites.
export const MAX_NOTE_LENGTH = 20000;
export const listeningPhrase = {
  jp: 'まず、聞こう。', romaji: 'Mazu, kikō.',
  meaning: { en: 'First, let’s listen.', fr: 'D’abord, écoutons.', nl: 'Laten we eerst luisteren.', de: 'Hören wir zuerst zu.' },
  detail: {
    en: 'Mazu means first. Kikō means let’s listen. An informal reminder, not a translation of your notes.',
    fr: 'Mazu signifie d’abord. Kikō signifie écoutons. Un rappel informel, pas une traduction de tes notes.',
    nl: 'Mazu betekent eerst. Kikō betekent laten we luisteren. Een informele herinnering, geen vertaling van je notities.',
    de: 'Mazu bedeutet zuerst. Kikō bedeutet lass uns zuhören. Eine informelle Erinnerung, keine Übersetzung deiner Notizen.'
  }
};
export const NOTE_PHRASES = ['step', 'courage', 'listening'];
export function suggestNotePhrase(title, body = '') {
  const context = `${title} ${body}`.toLowerCase();
  if (/interview|customer|client|écout|ecout|luister|klant|zuhör|zuhoer|kund|listen/.test(context)) return 'listening';
  if (/pitch|coaching|present|présent/.test(context)) return 'courage';
  return 'step';
}
export function noteKey(session) { return JSON.stringify([session.id, session.date]); }
function literal(value, max) {
  if (typeof value !== 'string' || value.length > max || value.includes('\0')) throw Error('note');
  return value; // Preserve whitespace, Markdown and wording exactly.
}
export function validateSessionNotes(raw = []) {
  if (!Array.isArray(raw) || raw.length > 100) throw Error('notes');
  const keys = new Set();
  const result = raw.map(n => {
    if (!n || typeof n.id !== 'string' || !n.id.trim() || n.id.length > 100 ||
      typeof n.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(n.date) ||
      !Number.isFinite(Date.parse(n.date)) || new Date(n.date).toISOString().slice(0,10) !== n.date ||
      !NOTE_PHRASES.includes(n.phraseId) || !Number.isSafeInteger(n.updatedAt) || n.updatedAt < 0) throw Error('note');
    const key = noteKey(n);
    if (keys.has(key)) throw Error('duplicate');
    keys.add(key);
    const title = literal(n.title, 300);
    if (!title.trim()) throw Error('title');
    return { id: n.id, date: n.date, title, question: literal(n.question, 1000),
      body: literal(n.body, MAX_NOTE_LENGTH), takeaway: literal(n.takeaway, 1000), phraseId: n.phraseId, updatedAt: n.updatedAt };
  });
  if (JSON.stringify(result).length > 500000) throw Error('size');
  return result;
}
export function saveSessionNote(progress, session, draft, now = Date.now()) {
  const existing = (progress.sessionNotes || []).find(n => noteKey(n) === noteKey(session));
  const record = { id: session.id, date: session.date, title: session.title,
    question: draft.question, body: draft.body, takeaway: draft.takeaway,
    phraseId: existing?.phraseId || suggestNotePhrase(session.title, draft.body), updatedAt: now };
  const sessionNotes = validateSessionNotes([...(progress.sessionNotes || []).filter(n => noteKey(n) !== noteKey(session)), record]);
  return { ...progress, sessionNotes };
}
export async function readNoteFile(file) {
  if (!file || !/\.(txt|md)$/i.test(file.name) || file.size > 80000) throw Error('file');
  const body = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
  return literal(body, MAX_NOTE_LENGTH);
}
