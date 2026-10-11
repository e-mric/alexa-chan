// SSML helpers. Japanese lines are spoken with a Japanese voice via SSML,
// scaled by the current intensity mode.
const { state } = require('./state');

// Amazon Polly Japanese voices available in Alexa SSML.
const JP_VOICE = 'Takumi';

function jp(phrase) {
  return `<voice name="${JP_VOICE}"><lang xml:lang="ja-JP">${phrase.jp}</lang></voice>`;
}

// Build a full response according to mode:
// calm: greeting + info + short closing
// hero: greeting + dramatic flavor + info + closing + english gloss
// training: hero + romaji/translation teaching of the closing phrase
// immersion: as much Japanese as we have, gloss only if asked
function wrap({ greeting, flavor, info, closing }) {
  const parts = [];
  const mode = state.mode;

  if (greeting) parts.push(jp(greeting));
  if (flavor && (mode === 'hero' || mode === 'training' || mode === 'immersion')) parts.push(flavor);
  if (info) parts.push(info);
  if (closing) {
    parts.push(jp(closing));
    if (mode === 'training') {
      parts.push(`<break time="300ms"/>That means: ${closing.en}. Say it with me: ${jp(closing)}`);
    } else if (mode !== 'immersion') {
      parts.push(`${closing.en}!`);
    }
  }
  return parts.join(' <break time="250ms"/> ');
}

module.exports = { jp, wrap };
