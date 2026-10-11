// Personal pilot: only explicit browser storage, never the shared legacy API.
import { listeningPhrase, validateSessionNotes } from './session-notes.js';
export const PERSONAL_KEY = 'alexa-chan:founders:personal:v1';
export const STUDENT_PERSONAL_KEY = 'alexa-chan:student:personal:v1';
export const LOCALES = { fr: 'fr-BE', nl: 'nl-BE', de: 'de-BE', en: 'en-GB' };
export const DAY = 86400000;
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function brusselsDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return ['year', 'month', 'day'].map(key => parts.find(p => p.type === key).value).join('-');
}
export function moveDay(date, delta) {
  if (!validDate(date)) throw Error('date');
  return new Date(Date.parse(date) + delta * DAY).toISOString().slice(0, 10);
}
export function formatDay(date, locale = 'fr') {
  return validDate(date) ? new Intl.DateTimeFormat(LOCALES[locale] || LOCALES.fr, { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date)) : '';
}
function text(value, max, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw Error('text');
  return value.trim();
}
function sourceUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || !/^(?:[a-z0-9-]+\.)?(?:notion\.site|notion\.so)$/.test(url.hostname)) throw Error('source');
  return url.href;
}
function time(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw Error('time');
  return value;
}
export function validateSnapshot(raw) {
  if (!raw || raw.version !== 1 || raw.timezone !== 'Europe/Brussels' || !validDate(raw.capturedOn) ||
    !validDate(raw.coverage?.from) || !validDate(raw.coverage?.to) || raw.coverage.from > raw.coverage.to ||
    !Array.isArray(raw.events) || raw.events.length > 500) throw Error('snapshot');
  const ids = new Set();
  const events = raw.events.map(event => {
    const id = text(event.id, 100, true);
    if (ids.has(id) || !validDate(event.date) || !validDate(event.endDate || event.date)) throw Error('event');
    ids.add(id);
    const endDate = event.endDate || event.date;
    if (endDate < event.date || event.date > raw.coverage.to || endDate < raw.coverage.from) throw Error('range');
    const startTime = time(event.startTime), endTime = time(event.endTime);
    if ((endTime && !startTime) || (endTime && endDate === event.date && endTime < startTime)) throw Error('time');
    if (!['mandatory', 'optional', 'unknown'].includes(event.attendance) || !['workshop', 'break'].includes(event.kind)) throw Error('event');
    return { id, title: text(event.title, 300, true), date: event.date, endDate, startTime, endTime,
      attendance: event.attendance, kind: event.kind, location: text(event.location || '', 300),
      description: text(event.description || '', 3000), phase: text(event.phase || '', 200), url: sourceUrl(event.url) };
  });
  return { version: 1, timezone: 'Europe/Brussels', capturedOn: raw.capturedOn,
    coverage: { from: raw.coverage.from, to: raw.coverage.to }, sourceUrl: sourceUrl(raw.sourceUrl),
    events: events.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '99:99').localeCompare(b.startTime || '99:99') || a.id.localeCompare(b.id)) };
}
export function parseSnapshot(input) {
  if (typeof input !== 'string' || input.length > 512000) throw Error('size');
  return validateSnapshot(JSON.parse(input));
}
export function daySchedule(snapshot, date) {
  if (!snapshot) return { status: 'missing', events: [] };
  if (!validDate(date) || date < snapshot.coverage.from || date > snapshot.coverage.to) return { status: 'outside', events: [] };
  const events = snapshot.events.filter(e => e.date <= date && e.endDate >= date);
  return { status: events.length ? 'ready' : 'empty', events };
}
export function snapshotAge(snapshot, today) {
  return snapshot ? Math.floor((Date.parse(today) - Date.parse(snapshot.capturedOn)) / DAY) : 0;
}
export const phrases = {
  listening: listeningPhrase,
  courage: { jp: '君ならできる！', romaji: 'Kimi nara dekiru!', meaning: { en: 'You can do it!', fr: 'Tu peux le faire !', nl: 'Je kunt het!', de: 'Du schaffst das!' }, detail: {
    en: 'Kimi means you, nara means if it is you, and dekiru means can do it. This is familiar encouragement, not formal speech.',
    fr: 'Kimi signifie toi, nara signifie si c’est toi, et dekiru signifie pouvoir le faire. C’est un encouragement familier, pas une formule formelle.',
    nl: 'Kimi betekent jij, nara betekent als jij het bent, en dekiru betekent het kunnen. Dit is een informele aanmoediging.',
    de: 'Kimi bedeutet du, nara bedeutet wenn du es bist, und dekiru bedeutet es schaffen. Das ist eine vertraute Ermutigung, keine förmliche Anrede.' } },
  step: { jp: '一歩ずつ。', romaji: 'Ippo zutsu.', meaning: { en: 'One step at a time.', fr: 'Un pas à la fois.', nl: 'Stap voor stap.', de: 'Schritt für Schritt.' }, detail: {
    en: 'Ippo means one step. Zutsu means at a time. A short phrase for making steady progress.', fr: 'Ippo signifie un pas. Zutsu signifie à la fois. Une petite phrase pour avancer à ton rythme.',
    nl: 'Ippo betekent één stap. Zutsu betekent telkens. Een korte zin om op je eigen tempo vooruit te gaan.', de: 'Ippo bedeutet ein Schritt. Zutsu bedeutet jeweils. Ein kurzer Ausdruck, um in deinem Tempo voranzukommen.' } },
  question: { jp: '今日の予定は？', romaji: 'Kyō no yotei wa?', meaning: { en: 'What’s on my calendar today?', fr: 'Quel est mon programme aujourd’hui ?', nl: 'Wat staat er vandaag op mijn planning?', de: 'Was steht heute auf meinem Programm?' }, detail: {
    en: 'Kyō means today. Yotei means plans or schedule. This short question asks about today’s plans.', fr: 'Kyō signifie aujourd’hui. Yotei signifie programme ou projets. Cette question courte porte sur le programme du jour.',
    nl: 'Kyō betekent vandaag. Yotei betekent plannen of planning. Met deze korte vraag vraag je naar de planning van vandaag.', de: 'Kyō bedeutet heute. Yotei bedeutet Pläne oder Programm. Diese kurze Frage bezieht sich auf den heutigen Tagesplan.' } }
};
const normalize = s => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[?？!！。、’']/g, '').replace(/\s+/g, ' ').trim();
export function isTodayQuestion(input) {
  return typeof input === 'string' && [phrases.question.jp, phrases.question.romaji, 'kyou no yotei wa'].some(q => normalize(q) === normalize(input));
}
export function freshProgress() { return { version: 1, locale: 'fr', memories: [], notes: {}, sessionNotes: [], questionUsed: false }; }
export function validateProgress(raw) {
  if (!raw || raw.version !== 1 || !Object.hasOwn(LOCALES, raw.locale) || !Array.isArray(raw.memories) || raw.memories.length > Object.keys(phrases).length || !raw.notes || typeof raw.notes !== 'object' || Array.isArray(raw.notes)) throw Error('progress');
  const ids = new Set();
  const memories = raw.memories.map(m => {
    if (!Object.hasOwn(phrases, m.id) || ids.has(m.id) || !Number.isSafeInteger(m.due) || m.due < 0 || !Number.isInteger(m.reviews) || m.reviews < 0 || m.reviews > 10000 || !Number.isFinite(m.interval) || m.interval < 0 || m.interval > 365) throw Error('memory');
    ids.add(m.id); return { id: m.id, due: m.due, reviews: m.reviews, interval: m.interval };
  });
  const notes = {};
  if (Object.keys(raw.notes).length > 400) throw Error('notes');
  for (const [date, note] of Object.entries(raw.notes)) {
    if (!validDate(date)) throw Error('date');
    notes[date] = text(note, 2000);
  }
  return { version: 1, locale: raw.locale, memories, notes, sessionNotes: validateSessionNotes(raw.sessionNotes), questionUsed: raw.questionUsed === true };
}
export function saveMemory(progress, id, now = Date.now()) {
  if (!Object.hasOwn(phrases, id)) throw Error('phrase');
  if (progress.memories.some(m => m.id === id)) return progress;
  return { ...progress, memories: [...progress.memories, { id, due: now, reviews: 0, interval: 0 }] };
}
export function dueMemories(progress, now = Date.now()) { return progress.memories.filter(m => m.due <= now).sort((a, b) => a.due - b.due); }
export function rateMemory(progress, id, rating, now = Date.now()) {
  const m = progress.memories.find(m => m.id === id);
  if (!m || m.due > now || !['again', 'good'].includes(rating)) throw Error('rating');
  const interval = rating === 'again' ? 1 / 1440 : Math.min(365, Math.max(1, m.interval * 2));
  return { ...progress, memories: progress.memories.map(card => card.id === id ? { ...card, interval, due: now + Math.round(interval * DAY), reviews: card.reviews + 1 } : card) };
}
export function readPersonal(storage, key = PERSONAL_KEY) {
  const saved = storage.getItem(key);
  return saved ? parseBackup(saved) : { snapshot: null, progress: freshProgress() };
}
export function parseBackup(input) {
  if (typeof input !== 'string' || input.length > 1500000) throw Error('size');
  const raw = JSON.parse(input);
  if (raw?.kind !== 'alexa-chan-founders' || raw.version !== 1) throw Error('backup');
  return { snapshot: raw.snapshot === null ? null : validateSnapshot(raw.snapshot), progress: validateProgress(raw.progress) };
}
export function serializePersonal({ snapshot, progress }) {
  const serialized = JSON.stringify({ kind: 'alexa-chan-founders', version: 1, snapshot: snapshot ? validateSnapshot(snapshot) : null, progress: validateProgress(progress) });
  if (serialized.length > 1500000) throw Error('size');
  return serialized;
}
export function writePersonal(storage, state, key = PERSONAL_KEY) {
  // A single atomic storage write avoids half-restored calendar/progress pairs.
  storage.setItem(key, serializePersonal(state));
}
