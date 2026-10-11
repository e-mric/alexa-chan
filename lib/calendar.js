const { DateTime } = require('luxon');
function dayBounds(day, zone, now = Date.now()) {
  const start = DateTime.fromMillis(now, { zone }).startOf('day').plus({ days: day === 'tomorrow' ? 1 : 0 });
  if (!start.isValid) throw Error('Invalid calendar timezone');
  return { timeMin: start.toISO(), timeMax: start.plus({ days: 1 }).toISO() };
}
function createCalendarReader(env = process.env, request = fetch) {
  return async function getSchedule({ day, userId }) {
  if (env.CALENDAR_DEMO === 'true') return { status: 'ok', demo: true, events: day === 'tomorrow'
    ? [{ title: 'Yoga', time: '09:00' }]
    : [{ title: 'Réunion', time: '10:00' }, { title: 'Dentiste', time: '16:00' }] };
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN || !env.CALENDAR_ALEXA_USER_ID || userId !== env.CALENDAR_ALEXA_USER_ID) return { status: 'not_connected' };
  const signal = AbortSignal.timeout(5500);
  const tokenResponse = await request('https://oauth2.googleapis.com/token', { method: 'POST', signal, body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' }) });
  if (!tokenResponse.ok) throw Error('Google authorization failed');
  const token = await tokenResponse.json();
  if (!token.access_token) throw Error('Google authorization failed');
  const zone = env.CALENDAR_TIMEZONE || 'Europe/Brussels';
  const bounds = dayBounds(day, zone);
  const events = [];
  let pageToken;
  do {
    const params = new URLSearchParams({ ...bounds, timeZone: zone, singleEvents: 'true', orderBy: 'startTime', showDeleted: 'false', maxResults: '250' });
    if (pageToken) params.set('pageToken', pageToken);
    const response = await request(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env.GOOGLE_CALENDAR_ID || 'primary')}/events?${params}`, { signal, headers: { Authorization: `Bearer ${token.access_token}` } });
    if (!response.ok) throw Error('Calendar read failed');
    const data = await response.json();
    if (!Array.isArray(data.items)) throw Error('Invalid calendar response');
    for (const event of data.items) {
      if (event.status === 'cancelled' || event.attendees?.some(a => a.self && a.responseStatus === 'declined')) continue;
      const allDay = !!event.start?.date;
      const time = allDay ? '' : DateTime.fromISO(event.start?.dateTime || '', { zone }).setZone(zone).toFormat('HH:mm');
      if (!allDay && time === 'Invalid DateTime') throw Error('Invalid appointment time');
      events.push({ title: event.summary || 'Rendez-vous sans titre', allDay, time });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return { status: 'ok', events };
  };
}
module.exports = { getSchedule: createCalendarReader(), createCalendarReader, dayBounds };
