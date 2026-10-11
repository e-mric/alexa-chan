// Quest Mode content: original narrator "Senpai Hoshi" (星先輩) — an
// original genre-inspired mentor character, intentionally NOT based on any
// existing anime IP.

const PHRASES_OF_POWER = [
  { jp: '準備はできた？', romaji: 'Junbi wa dekita?', en: 'Are you ready?' },
  { jp: '一歩ずつ強くなろう', romaji: 'Ippo zutsu tsuyoku narou', en: "Let's get stronger, one step at a time" },
  { jp: '集中して！', romaji: 'Shūchū shite!', en: 'Stay focused!' },
  { jp: '負けないで！', romaji: 'Makenaide!', en: "Don't give up!" },
  { jp: 'よくできました', romaji: 'Yoku dekimashita', en: 'Well done' },
  { jp: '新しい冒険の始まりだ！', romaji: 'Atarashii bōken no hajimari da!', en: 'A new adventure begins!' },
  { jp: '君ならできる！', romaji: 'Kimi nara dekiru!', en: 'You can do it!' },
];

const GREETINGS = [
  { jp: 'おはよう、{name}さん！', romaji: 'Ohayō, {name}-san!', en: 'Good morning, {name}!' },
  { jp: 'やあ、{name}さん！', romaji: 'Yā, {name}-san!', en: 'Hey, {name}!' },
  { jp: 'ようこそ、勇者{name}！', romaji: 'Yōkoso, yūsha {name}!', en: 'Welcome, hero {name}!' },
];

const WEATHER_FLAVOR = {
  sunny: { line: 'The sun shines on your path — a perfect day to begin the adventure.', jp: '今日も冒険日和だ！', romaji: 'Kyō mo bōken biyori da!', en: 'Another perfect day for an adventure!' },
  rain: { line: 'Rain approaches like a powerful rival. Take your umbrella into battle.', jp: '負けないで！', romaji: 'Makenaide!', en: "Don't give up!" },
  cloudy: { line: 'Clouds gather, but a true hero trains in any weather.', jp: '心は晴れだ！', romaji: 'Kokoro wa hare da!', en: 'The heart stays sunny!' },
  snow: { line: 'A field of snow — the world holds its breath before your next move.', jp: '寒さに負けるな！', romaji: 'Samusa ni makeru na!', en: "Don't lose to the cold!" },
  storm: { line: 'A storm rages — the final boss of the sky. Stay safe indoors, hero.', jp: '嵐の後には虹が出る', romaji: 'Arashi no ato ni wa niji ga deru', en: 'After the storm comes a rainbow' },
};

// Modes control how much Japanese wraps each answer.
const MODES = ['calm', 'hero', 'training', 'immersion'];

function weatherCategory(code) {
  if (code === 0 || code === 1) return 'sunny';
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 95) return 'storm';
  return 'cloudy';
}

module.exports = { PHRASES_OF_POWER, GREETINGS, WEATHER_FLAVOR, MODES, weatherCategory };
