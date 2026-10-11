const { test } = require('node:test');
const assert = require('node:assert/strict');
test('Marta demo recognizes supported Japanese and romaji questions without accepting unrelated input', async () => {
  const { matchesQuestion } = await import('../web/src/lib/demo.js');
  for (const value of ['今日の天気は？', 'Kyō no tenki wa?', 'kyou no tenki wa']) assert.equal(matchesQuestion('weather', value), true);
  assert.equal(matchesQuestion('calendar', '今日の予定は？'), true);
  assert.equal(matchesQuestion('calendar', 'Kyō no yotei wa?'), true);
  for (const value of ['', 'hello', '今日の予定は？']) assert.equal(matchesQuestion('weather', value), false);
});
test('Marta journey captures unique cards without storing appointment details', async () => {
  const { capture, getCard } = await import('../web/src/lib/demo.js');
  let cards = [];
  for (const scene of ['weather', 'calendar']) {
    cards = capture(cards, scene); cards = capture(cards, scene); cards = capture(cards, scene, 'question');
  }
  assert.equal(cards.length, 4);
  for (const id of cards) {
    const card = getCard(id);
    assert.ok(card.jp && card.en && card.romaji);
    assert.doesNotMatch(JSON.stringify(card), /Lea|9:30|2 PM/);
  }
});
test('judge demo teaches Japanese from English in both daily scenarios', async () => {
  const { scenes, getCard } = await import('../web/src/lib/demo.js');
  assert.equal(scenes.weather.prompt, 'What’s the weather today?');
  assert.equal(scenes.calendar.prompt, 'What’s on my calendar today?');
  assert.equal(getCard('weather:phrase').en, 'It’s sunny today.');
  assert.equal(getCard('calendar:phrase').en, 'You can do it!');
  for (const key of ['weather','calendar']) {
    assert.equal(getCard(`${key}:question`).en, scenes[key].questionMeaning);
    assert.match(scenes[key].jp, /[\u3040-\u9fff]/);
    assert.ok(!('fr' in getCard(`${key}:phrase`)));
  }
});
