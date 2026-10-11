export const scenes = {
  weather: {
    title: 'Before you head out', icon: '☀', image: 'weather-quest.png',
    prompt: 'What’s the weather today?',
    answer: 'It’s 18 °C in Brussels. A few clouds, with a sunny break to start your adventure!',
    jp: '今日は晴れです。', romaji: 'Kyō wa hare desu.', translation: 'It’s sunny today.',
    detail: '今日 (kyō) = today · は (wa) marks the topic · 晴れ (hare) = sunny weather · です (desu) makes the sentence polite.',
    question: '今日の天気は？', questionRomaji: 'Kyō no tenki wa?', questionMeaning: 'What’s the weather today?',
    accepted: ['今日の天気は', 'kyou no tenki wa', 'kyo no tenki wa']
  },
  calendar: {
    title: 'Your everyday adventure', icon: '◷', image: 'quest-city.png',
    prompt: 'What’s on my calendar today?',
    answer: 'You have a team meeting at 9:30 AM and coffee with Lea at 2 PM. There’s time to catch your breath in between.',
    jp: '君ならできる！', romaji: 'Kimi nara dekiru!', translation: 'You can do it!',
    detail: '君 (kimi) = you · なら (nara) = if it’s you · できる (dekiru) = can do it. A familiar, encouraging way to say “I believe in you!”',
    question: '今日の予定は？', questionRomaji: 'Kyō no yotei wa?', questionMeaning: 'What’s on my calendar today?',
    accepted: ['今日の予定は', 'kyou no yotei wa', 'kyo no yotei wa']
  }
};

export function normalizeAnswer(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[?!？！，。、.]/g, '').replace(/\s+/g, ' ').trim();
}
export function matchesQuestion(scene, value) {
  return scenes[scene]?.accepted.some(answer => normalizeAnswer(answer) === normalizeAnswer(value)) ?? false;
}
export function capture(cards, scene, kind = 'phrase') {
  const id = `${scene}:${kind}`;
  return cards.includes(id) ? cards : [...cards, id];
}
export function getCard(id) {
  const [scene, kind] = id.split(':');
  const item = scenes[scene];
  return kind === 'question' ? { jp: item.question, romaji: item.questionRomaji, en: item.questionMeaning } : { jp: item.jp, romaji: item.romaji, en: item.translation };
}
