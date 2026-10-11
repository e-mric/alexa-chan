// Quest Mode Alexa skill handlers.
const Alexa = require('ask-sdk-core');
const { GREETINGS, WEATHER_FLAVOR, MODES } = require('./content');
const { state, addXp, addQuest, completeQuest, learnPhrase, phraseOfTheDay, logEvent } = require('./state');
const { getWeather } = require('./weather');
const { jp, wrap } = require('./speech');

function fill(phrase, name) {
  return {
    jp: phrase.jp.replace('{name}', name),
    romaji: phrase.romaji.replace('{name}', name),
    en: phrase.en.replace('{name}', name),
  };
}

function randomGreeting() {
  const g = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  return fill(g, state.heroName);
}

const LaunchRequestHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'LaunchRequest';
  },
  handle(input) {
    const potd = phraseOfTheDay();
    learnPhrase(potd);
    logEvent('Adventure started (skill launched)', 'info');
    const activeQuests = state.quests.filter((q) => q.status === 'active').length;
    const speech = wrap({
      greeting: randomGreeting(),
      flavor: 'A new adventure begins!',
      info: `You are level ${state.level}, with ${activeQuests} active ${activeQuests === 1 ? 'quest' : 'quests'}. Today's phrase of power is ${jp(potd)} — ${potd.romaji} — which means: ${potd.en}. Ask me for the weather, start a quest, or begin a training timer.`,
      closing: null,
    });
    return input.responseBuilder.speak(speech).reprompt('What is your first move, hero?').getResponse();
  },
};

const WeatherIntentHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(input.requestEnvelope) === 'WeatherIntent';
  },
  async handle(input) {
    const citySlot = Alexa.getSlotValue(input.requestEnvelope, 'city');
    let speech;
    try {
      const w = await getWeather(citySlot);
      const flavor = WEATHER_FLAVOR[w.category];
      learnPhrase({ jp: flavor.jp, romaji: flavor.romaji, en: flavor.en });
      addXp(10, 'Checked the morning briefing');
      logEvent(`Weather briefing for ${w.city}: ${w.category}, ${w.tMin}–${w.tMax}°C`, 'info');
      speech = wrap({
        greeting: randomGreeting(),
        flavor: flavor.line,
        info: `In ${w.city}, expect a high of ${w.tMax} and a low of ${w.tMin} degrees.`,
        closing: { jp: flavor.jp, romaji: flavor.romaji, en: flavor.en },
      });
    } catch (e) {
      speech = 'Even heroes face fog sometimes — I could not reach the weather service. Try again in a moment.';
    }
    return input.responseBuilder.speak(speech).reprompt('Anything else, hero?').getResponse();
  },
};

const StartQuestIntentHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(input.requestEnvelope) === 'StartQuestIntent';
  },
  handle(input) {
    const title = Alexa.getSlotValue(input.requestEnvelope, 'quest') || 'a mysterious mission';
    addQuest(title, 'quest');
    const speech = wrap({
      greeting: null,
      flavor: `Quest accepted: ${title}.`,
      info: 'Complete it and tell me — experience awaits.',
      closing: { jp: '君ならできる！', romaji: 'Kimi nara dekiru!', en: 'You can do it' },
    });
    return input.responseBuilder.speak(speech).reprompt('What next?').getResponse();
  },
};

const CompleteQuestIntentHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(input.requestEnvelope) === 'CompleteQuestIntent';
  },
  handle(input) {
    const active = state.quests.filter((q) => q.status === 'active');
    if (active.length === 0) {
      return input.responseBuilder
        .speak('No active quests, hero. Start one first — say: start a quest.')
        .reprompt('Say: start a quest.')
        .getResponse();
    }
    const quest = completeQuest(active[active.length - 1].id);
    const closing = { jp: 'よくできました', romaji: 'Yoku dekimashita', en: 'Well done' };
    learnPhrase(closing);
    const speech = wrap({
      greeting: null,
      flavor: `Quest completed: ${quest.title}! You earned ${quest.xp} experience points.`,
      info: `You are now level ${state.level}.`,
      closing,
    });
    return input.responseBuilder.speak(speech).reprompt('What next, hero?').getResponse();
  },
};

const TrainingTimerIntentHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(input.requestEnvelope) === 'TrainingTimerIntent';
  },
  handle(input) {
    const minutes = parseInt(Alexa.getSlotValue(input.requestEnvelope, 'minutes'), 10) || 20;
    addQuest(`Training session — ${minutes} minutes`, 'training', 15);
    const closing = { jp: '集中して！', romaji: 'Shūchū shite!', en: 'Stay focused' };
    learnPhrase(closing);
    const speech = wrap({
      greeting: null,
      flavor: `Your ${minutes}-minute training session begins now.`,
      info: 'Tell me when you finish to claim your experience.',
      closing,
    });
    return input.responseBuilder.speak(speech).reprompt('Ready?').getResponse();
  },
};

const PhraseIntentHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(input.requestEnvelope) === 'PhraseIntent';
  },
  handle(input) {
    const potd = phraseOfTheDay();
    learnPhrase(potd);
    addXp(5, 'Practiced the phrase of power');
    const speech = `Today's phrase of power is ${jp(potd)}. <break time="300ms"/> ${potd.romaji}. It means: ${potd.en}. <break time="300ms"/> Repeat after me: ${jp(potd)}`;
    return input.responseBuilder.speak(speech).reprompt('Try saying it!').getResponse();
  },
};

const SetModeIntentHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(input.requestEnvelope) === 'SetModeIntent';
  },
  handle(input) {
    const mode = (Alexa.getSlotValue(input.requestEnvelope, 'mode') || '').toLowerCase();
    if (!MODES.includes(mode)) {
      return input.responseBuilder
        .speak(`Choose your path: calm, hero, training, or immersion.`)
        .reprompt('Which mode?')
        .getResponse();
    }
    state.mode = mode;
    logEvent(`Mode changed to ${mode}`, 'info');
    return input.responseBuilder
      .speak(`${mode} mode engaged. ${jp({ jp: '行くぞ！' })} Let's go!`)
      .reprompt('What next?')
      .getResponse();
  },
};

const StatusIntentHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(input.requestEnvelope) === 'StatusIntent';
  },
  handle(input) {
    const active = state.quests.filter((q) => q.status === 'active').length;
    const done = state.quests.filter((q) => q.status === 'done').length;
    const speech = wrap({
      greeting: null,
      flavor: 'Hero status report!',
      info: `Level ${state.level}, ${state.xp} experience points, ${done} quests completed, ${active} in progress, and ${state.phrasesLearned.length} phrases of power learned.`,
      closing: { jp: '一歩ずつ強くなろう', romaji: 'Ippo zutsu tsuyoku narou', en: "Let's get stronger, one step at a time" },
    });
    return input.responseBuilder.speak(speech).reprompt('What next?').getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(input.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(input) {
    return input.responseBuilder
      .speak('You can ask for the weather briefing, start a quest, complete a quest, begin a training timer, hear the phrase of the day, check your hero status, or switch mode to calm, hero, training, or immersion.')
      .reprompt('What is your move?')
      .getResponse();
  },
};

const StopHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
      && ['AMAZON.StopIntent', 'AMAZON.CancelIntent'].includes(Alexa.getIntentName(input.requestEnvelope));
  },
  handle(input) {
    return input.responseBuilder
      .speak(`${jp({ jp: 'また会おう！' })} Until we meet again, hero!`)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const SessionEndedHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(input) {
    return input.responseBuilder.getResponse();
  },
};

const FallbackHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(input.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(input) {
    return input.responseBuilder
      .speak('Even a hero mishears sometimes. Try: what is the weather, or: start a quest.')
      .reprompt('What next?')
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(input, error) {
    console.error('Skill error:', error);
    return input.responseBuilder
      .speak('A wild bug appeared! I could not do that. Try again.')
      .reprompt('Try again?')
      .getResponse();
  },
};

const skill = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    require('./learning').createLearningHandler(),
    LaunchRequestHandler,
    WeatherIntentHandler,
    StartQuestIntentHandler,
    CompleteQuestIntentHandler,
    TrainingTimerIntentHandler,
    PhraseIntentHandler,
    SetModeIntentHandler,
    StatusIntentHandler,
    HelpIntentHandler,
    StopHandler,
    FallbackHandler,
    SessionEndedHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .create();

module.exports = { skill };
