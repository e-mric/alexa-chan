const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCalendarReader, dayBounds } = require('../lib/calendar');
const Alexa = require('ask-sdk-core');
const { createLearningHandler, profiles } = require('../lib/learning');
test('calendar scopes account, handles pagination and local daylight-saving boundaries', async () => {
  const spring = dayBounds('today', 'Europe/Brussels', Date.parse('2026-03-29T12:00:00Z'));
  assert.equal(Date.parse(spring.timeMax) - Date.parse(spring.timeMin), 23 * 3600000);
  const env = { GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret', GOOGLE_REFRESH_TOKEN: 'refresh', CALENDAR_ALEXA_USER_ID: 'marta' };
  let calls = 0;
  const reader = createCalendarReader(env, async (url) => {
    calls++;
    return { ok: true, json: async () => url.includes('/token') ? { access_token: 'test' } : url.includes('pageToken') ? { items: [] } : { items: [{ summary: 'Meeting', start: { dateTime: '2026-09-30T10:00:00+02:00' } }, { summary: 'Holiday', start: { date: '2026-09-30' } }, { status: 'cancelled' }], nextPageToken: 'next' } };
  });
  assert.equal((await reader({ day: 'today', userId: 'other' })).status, 'not_connected');
  assert.equal(calls, 0);
  const result = await reader({ day: 'today', userId: 'marta' });
  assert.equal(calls, 3);
  assert.equal(result.events.length, 2);
  assert.equal(result.events[0].time, '10:00');
  assert.equal(result.events[1].allDay, true);
});
test('calendar helpers, empty/error states and matching quests', async () => {
  profiles.clear();
  let status = 'ok';
  const skill = Alexa.SkillBuilders.custom().addRequestHandlers(createLearningHandler(async () => ({ city: 'Paris', category: 'sunny', tMin: 10, tMax: 20 }), { capture() {} }, async () => ({ status, events: [] }))).create();
  let attributes = {};
  async function send(name) {
    const r = await skill.invoke({ version: '1.0', session: { new: false, sessionId: 'c', user: { userId: 'marta' }, attributes }, request: { type: 'IntentRequest', locale: 'fr-FR', requestId: 'r', intent: { name, slots: {} } } });
    attributes = r.sessionAttributes; return r.response.outputSpeech.ssml;
  }
  assert.match(await send('ScheduleTodayIntent'), /aucun rendez-vous/);
  assert.match(await send('TranslateIntent'), /Tu peux le faire/);
  assert.match(await send('TeachQuestionIntent'), /今日の予定は/);
  await send('StartQuestIntent');
  await send('JapaneseWeatherIntent');
  assert.equal(profiles.get('marta').quest.status, 'active');
  status = 'error';
  assert.match(await send('JapaneseScheduleTodayIntent'), /ne veut pas dire/);
  assert.equal(profiles.get('marta').quest.status, 'active');
  status = 'not_connected';
  assert.match(await send('ScheduleTodayIntent'), /pas encore connecté/);
  status = 'ok';
  assert.match(await send('JapaneseScheduleTodayIntent'), /Quête accomplie/);
  await send('ScheduleTomorrowIntent');
  assert.match(await send('TeachQuestionIntent'), /明日の予定は/);
  await send('StartQuestIntent');
  assert.equal(profiles.get('marta').quest.capability, 'tomorrow');
});
