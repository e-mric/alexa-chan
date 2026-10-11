const { test } = require('node:test');
const assert = require('node:assert/strict');
const Alexa = require('ask-sdk-core');
const { createLearningHandler, profiles } = require('../lib/learning');
test('French weather, contextual shortcuts, optional quest, isolation and failure', async () => {
  profiles.clear();
  let fail = false;
  const skill = Alexa.SkillBuilders.custom().addRequestHandlers(createLearningHandler(async () => {
    if (fail) throw Error('offline');
    return { city: 'Paris', category: 'rain', tMin: 12, tMax: 18 };
  }, { capture() {} })).create();
  let attributes = {};
  async function send(name, user = 'marta') {
    const result = await skill.invoke({ version: '1.0', session: { new: false, sessionId: 's', user: { userId: user }, attributes }, request: { type: 'IntentRequest', locale: 'fr-FR', requestId: 'r', intent: { name, slots: {} } } });
    attributes = result.sessionAttributes;
    return result.response;
  }
  assert.match((await send('TranslateIntent')).outputSpeech.ssml, /d’abord/);
  const weather = await send('WeatherIntent');
  assert.match(weather.outputSpeech.ssml, /Paris.*pluie.*今日は雨だ/);
  assert.equal(weather.shouldEndSession, false);
  assert.equal(weather.reprompt, undefined);
  assert.equal(profiles.get('marta').quest, null);
  assert.match((await send('TranslateIntent')).outputSpeech.ssml, /il pleut/);
  assert.match((await send('ExplainIntent')).outputSpeech.ssml, /Ame signifie/);
  assert.match((await send('TeachQuestionIntent')).outputSpeech.ssml, /今日の天気は/);
  await send('StartQuestIntent');
  await send('StartQuestIntent');
  await send('TeachQuestionIntent');
  await send('WeatherIntent');
  assert.equal(profiles.get('marta').quest.status, 'active');
  fail = true;
  await send('JapaneseWeatherIntent');
  assert.equal(profiles.get('marta').quest.status, 'active');
  fail = false;
  attributes = {}; // A new session retains the quest, but not stale translation context.
  assert.match((await send('TranslateIntent')).outputSpeech.ssml, /d’abord/);
  assert.match((await send('JapaneseWeatherIntent')).outputSpeech.ssml, /Quête accomplie/);
  assert.doesNotMatch((await send('JapaneseWeatherIntent')).outputSpeech.ssml, /Quête accomplie/);
  attributes = {};
  await send('StatusIntent', 'alex');
  assert.equal(profiles.get('alex').quest, null);
  assert.equal((await send('AMAZON.StopIntent')).shouldEndSession, true);
});
