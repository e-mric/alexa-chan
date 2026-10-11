// Shared in-memory state: the Alexa skill writes here, the dashboard reads it.
const { PHRASES_OF_POWER } = require('./content');

const state = {
  heroName: 'Emeric',
  mode: 'hero', // calm | hero | training | immersion
  xp: 0,
  level: 1,
  quests: [], // { id, title, type, status: 'active'|'done', xp }
  phrasesLearned: [], // { jp, romaji, en, seenCount }
  log: [], // recent interactions for the dashboard feed
};

function xpForLevel(level) {
  return level * 100;
}

function addXp(amount, reason) {
  state.xp += amount;
  while (state.xp >= xpForLevel(state.level)) {
    state.xp -= xpForLevel(state.level);
    state.level += 1;
    logEvent(`LEVEL UP! Reached level ${state.level}`, 'levelup');
  }
  logEvent(`+${amount} XP — ${reason}`, 'xp');
}

function addQuest(title, type, xp = 20) {
  const quest = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title, type, status: 'active', xp };
  state.quests.push(quest);
  logEvent(`New quest: ${title}`, 'quest');
  return quest;
}

function completeQuest(id) {
  const quest = state.quests.find((q) => q.id === id && q.status === 'active');
  if (!quest) return null;
  quest.status = 'done';
  addXp(quest.xp, `Quest completed: ${quest.title}`);
  return quest;
}

function learnPhrase(phrase) {
  const existing = state.phrasesLearned.find((p) => p.jp === phrase.jp);
  if (existing) existing.seenCount += 1;
  else state.phrasesLearned.push({ ...phrase, seenCount: 1 });
}

function phraseOfTheDay() {
  const dayIndex = Math.floor(Date.now() / 86400000) % PHRASES_OF_POWER.length;
  return PHRASES_OF_POWER[dayIndex];
}

function logEvent(text, kind = 'info') {
  state.log.unshift({ text, kind, at: new Date().toISOString() });
  if (state.log.length > 50) state.log.pop();
}

module.exports = { state, addXp, addQuest, completeQuest, learnPhrase, phraseOfTheDay, logEvent, xpForLevel };
