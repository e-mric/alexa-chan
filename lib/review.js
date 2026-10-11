// Shared demo deck, persisted separately from the in-memory Alexa session.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const DAY = 86400000;
function createReviewStore(file = path.join(__dirname, '../data/review.json')) {
  let cards = [];
  try { cards = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!Array.isArray(cards)) throw Error('Invalid review data');
  function save(next) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file + '.tmp', JSON.stringify(next, null, 2), { mode: 0o600 });
    fs.renameSync(file + '.tmp', file);
    cards = next;
  }
  function capture(phrase, kind = 'meaning', priority = false) {
    const id = crypto.createHash('sha256').update(kind + ':' + phrase.jp).digest('hex').slice(0, 20);
    const existing = cards.find(c => c.id === id);
    if (existing) {
      if (priority && !existing.priority) save(cards.map(c => c.id === id ? { ...c, priority: true } : c));
      return;
    }
    save([...cards, { id, kind, jp: phrase.jp, romaji: phrase.romaji, fr: phrase.fr,
      priority, due: Date.now(), interval: 0, reviews: 0 }]);
  }
  function list(now = Date.now()) {
    return { total: cards.length, due: cards.filter(c => c.due <= now)
      .sort((a,b) => Number(b.priority) - Number(a.priority) || a.due - b.due).slice(0, 5),
      dueCount: cards.filter(c => c.due <= now).length,
      nextDue: cards.length ? Math.min(...cards.map(c => c.due)) : null };
  }
  function rate(id, rating, expectedReviews, now = Date.now()) {
    if (!['again','hard','good','easy'].includes(rating)) throw Object.assign(Error('Invalid rating'), { status: 400 });
    const card = cards.find(c => c.id === id);
    if (!card) throw Object.assign(Error('Card not found'), { status: 404 });
    if (card.reviews !== expectedReviews || card.due > now) throw Object.assign(Error('Card already reviewed; reload'), { status: 409 });
    const interval = rating === 'again' ? 1 / 1440 : rating === 'hard' ? Math.max(1, card.interval * 1.2) : rating === 'good' ? Math.max(3, card.interval * 2) : Math.max(7, card.interval * 3);
    const updated = { ...card, interval, due: now + Math.round(interval * DAY), reviews: card.reviews + 1 };
    save(cards.map(c => c.id === id ? updated : c));
    return updated;
  }
  return { capture, list, rate };
}
let instance;
function getReviewStore() { return instance ||= createReviewStore(); }
module.exports = { createReviewStore, getReviewStore };
