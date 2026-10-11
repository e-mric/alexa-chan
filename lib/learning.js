// French-first learning pilot. Profiles survive sessions, not server restarts.
const Alexa = require('ask-sdk-core');
const { state } = require('./state');
const { getWeather } = require('./weather');
const profiles = new Map();
const question = { jp: '今日の天気は？', romaji: 'Kyō no tenki wa?', fr: 'Quel temps fait-il aujourd’hui ?' };
const questions = {
  weather: question,
  today: { jp: '今日の予定は？', romaji: 'Kyō no yotei wa?', fr: 'Quel est mon programme aujourd’hui ?' },
  tomorrow: { jp: '明日の予定は？', romaji: 'Ashita no yotei wa?', fr: 'Quel est mon programme demain ?' },
};
const questTitles = { weather: 'Demander la météo en japonais', today: 'Demander le programme du jour en japonais', tomorrow: 'Demander le programme de demain en japonais' };
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const japanese = text => `<voice name="Takumi"><lang xml:lang="ja-JP">${escape(text)}</lang></voice>`;
const conditions = {
  sunny: ['du soleil', '今日は晴れだ！', 'Kyō wa hare da!', 'Aujourd’hui, il fait beau !', 'Hare signifie un temps clair.'],
  rain: ['de la pluie', '今日は雨だ！', 'Kyō wa ame da!', 'Aujourd’hui, il pleut !', 'Ame signifie pluie.'],
  cloudy: ['un ciel nuageux', '今日は曇りだ！', 'Kyō wa kumori da!', 'Aujourd’hui, le ciel est nuageux !', 'Kumori signifie un ciel nuageux.'],
  snow: ['de la neige', '今日は雪だ！', 'Kyō wa yuki da!', 'Aujourd’hui, il neige !', 'Yuki signifie neige.'],
  storm: ['des orages', '今日は雷雨だ！', 'Kyō wa raiu da!', 'Aujourd’hui, il y a des orages !', 'Raiu signifie un orage avec pluie.'],
};
function createLearningHandler(weather = getWeather, review = require('./review').getReviewStore(), calendar = require('./calendar').getSchedule) {
  return {
    canHandle(input) { return input.requestEnvelope.request.locale === 'fr-FR' && input.requestEnvelope.request.type !== 'SessionEndedRequest'; },
    async handle(input) {
      const envelope = input.requestEnvelope;
      const id = envelope.context?.System?.user?.userId || envelope.session?.user?.userId || envelope.session?.sessionId;
      if (!id) return input.responseBuilder.speak('Je ne peux pas retrouver ta session. Rouvre la skill.').withShouldEndSession(true).getResponse();
      if (!profiles.has(id)) profiles.set(id, { quest: null, last: null });
      const profile = profiles.get(id);
      const attrs = input.attributesManager.getSessionAttributes();
      const name = envelope.request.intent?.name;
      function reply(text, end = false) {
        state.learning = { ...profile, question };
        return input.responseBuilder.speak(text).withShouldEndSession(end).getResponse();
      }
      if (envelope.request.type === 'LaunchRequest') return reply('Bonjour ! Demande-moi la météo ou ton programme. Après le japonais, dis Iké pour le sens, Motto pour les détails, ou Nanté pour apprendre à poser la question.');
      if (['AMAZON.StopIntent','AMAZON.CancelIntent'].includes(name)) return reply('À bientôt !', true);
      if (['ScheduleTodayIntent','ScheduleTomorrowIntent','JapaneseScheduleTodayIntent','JapaneseScheduleTomorrowIntent'].includes(name)) {
        const day = name.includes('Tomorrow') ? 'tomorrow' : 'today';
        // A failed new request must not leave helpers referring to an older task.
        delete attrs.learningContext;
        input.attributesManager.setSessionAttributes(attrs);
        try {
          const schedule = await calendar({ day, userId: id });
          if (schedule.status === 'not_connected') return reply('Ton calendrier n’est pas encore connecté. Je ne peux pas lire tes rendez-vous.');
          if (schedule.status !== 'ok' || !Array.isArray(schedule.events)) throw Error('Calendar unavailable');
          const passage = day === 'today'
            ? { jp: '君ならできる！', romaji: 'Kimi nara dekiru!', fr: 'Tu peux le faire !', detail: 'Kimi signifie toi. Dekiru signifie pouvoir faire. Cette expression sert à encourager.' }
            : { jp: '明日も頑張ろう！', romaji: 'Ashita mo ganbarō!', fr: 'Demain aussi, faisons de notre mieux !', detail: 'Ashita signifie demain. Mo signifie aussi. Ganbarō invite à faire de notre mieux.' };
          const dayLabel = day === 'today' ? 'Aujourd’hui' : 'Demain';
          const events = schedule.events.slice(0, 5).map(e => `${escape(e.title)}${e.allDay ? ', toute la journée' : ` à ${escape(e.time)}`}`).join(' ; ');
          const info = schedule.events.length ? `${dayLabel}, tu as ${events}.${schedule.events.length > 5 ? ` Et ${schedule.events.length - 5} autres rendez-vous.` : ''}` : `${dayLabel}, tu n’as aucun rendez-vous dans le calendrier connecté.`;
          attrs.learningContext = { capability: day, passage };
          input.attributesManager.setSessionAttributes(attrs);
          // Never copy appointment titles or times into shared review/dashboard data.
          profile.last = passage;
          try { review.capture(passage); } catch (error) { console.error('Review save failed:', error.message); }
          let celebration = '';
          if (name.startsWith('Japanese') && profile.quest?.status === 'active' && profile.quest.capability === day) {
            profile.quest.status = 'done';
            celebration = ` ${japanese('やった！')} Tu as demandé ton programme en japonais. Quête accomplie !`;
          }
          return reply(`${schedule.demo ? 'Exemple fictif de démonstration. ' : ''}${info} ${japanese(passage.jp)}${celebration}`);
        } catch { return reply('Je n’arrive pas à accéder au calendrier pour le moment. Cela ne veut pas dire que ta journée est libre.'); }
      }
      if (['WeatherIntent', 'JapaneseWeatherIntent'].includes(name)) {
        try {
          const w = await weather(Alexa.getSlotValue(envelope, 'city'));
          const c = conditions[w.category] || conditions.cloudy;
          const passage = { jp: c[1], romaji: c[2], fr: c[3], detail: `Kyō signifie aujourd’hui. ${c[4]} Da donne ici un ton direct et énergique.` };
          attrs.learningContext = { capability: 'weather', passage };
          input.attributesManager.setSessionAttributes(attrs);
          profile.last = passage;
          // Review storage failure must not prevent the useful spoken answer.
          try { review.capture(passage); } catch (error) { console.error('Review save failed:', error.message); }
          let celebration = '';
          if (name === 'JapaneseWeatherIntent' && profile.quest?.status === 'active' && (profile.quest.capability || 'weather') === 'weather') {
            profile.quest.status = 'done';
            celebration = ` ${japanese('やった！')} Tu as demandé la météo en japonais. Quête accomplie !`;
          }
          return reply(`À ${escape(w.city)}, prévois ${c[0]}, entre ${escape(w.tMin)} et ${escape(w.tMax)} degrés. ${japanese(passage.jp)}${celebration}`);
        } catch {
          return reply('Je ne peux pas récupérer la météo pour le moment. Réessaie un peu plus tard.');
        }
      }
      if (name === 'StartQuestIntent') {
        const capability = attrs.learningContext?.capability || 'weather';
        if (!profile.quest || (profile.quest.status === 'done' && profile.quest.capability !== capability)) profile.quest = { title: questTitles[capability], capability, status: 'active', ...questions[capability] };
        return reply(profile.quest.status === 'done' ? 'Tu as déjà réussi cette quête. Tu peux continuer à pratiquer quand tu veux.' : `Ta quête : ${escape(profile.quest.title)}. ${japanese(profile.quest.jp)} Tu peux demander Nanté autant de fois que tu veux.`);
      }
      if (name === 'StatusIntent') return reply(profile.quest ? `${profile.quest.status === 'done' ? 'Quête accomplie' : 'Ta quête'} : ${escape(profile.quest.title)}.` : 'Pas de quête pour le moment. Dis « propose une quête » si tu en as envie.');
      if (['TranslateIntent','ExplainIntent','TeachQuestionIntent'].includes(name)) {
        const context = attrs.learningContext;
        if (name === 'TeachQuestionIntent' && (questions[context?.capability] || profile.quest?.status === 'active')) {
          const target = questions[context?.capability] || profile.quest;
          try { review.capture(target, 'question', true); } catch (error) { console.error('Review save failed:', error.message); }
          return reply(`Tu peux dire : ${japanese(target.jp)} Ça veut dire : ${escape(target.fr)}${!profile.quest ? ' Si tu veux en faire ta petite quête, dis « propose une quête ».' : ''}`);
        }
        if (!context) return reply('Demande-moi d’abord la météo, puis utilise Iké, Motto ou Nanté.');
        try { review.capture(context.passage, 'meaning', true); } catch (error) { console.error('Review save failed:', error.message); }
        return reply(name === 'TranslateIntent' ? escape(context.passage.fr) : `${escape(context.passage.fr)} ${escape(context.passage.detail)}`);
      }
      return reply('Demande la météo, ou dis « propose une quête ». Iké donne le sens, Motto explique, et Nanté montre comment poser la question en japonais.');
    },
  };
}
module.exports = { createLearningHandler, profiles };
