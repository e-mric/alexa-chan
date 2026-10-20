const { test } = require('node:test');
const assert = require('node:assert/strict');

function recordedHost() {
  const audio = [];
  return { audio, Audio: class {
    constructor(src) { this.src = src; this.paused = true; audio.push(this); }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    removeAttribute() {} load() {}
  } };
}

test('judge playback can exclude recordings while personal playback can restore them', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = { ...fakeHost(), ...recordedHost() };
  const player = createSpeechPlayer(() => host, [{ text: '今日は晴れです。', lang: 'ja-JP', file: '/recorded.mp3' }]);
  let state; player.subscribe(value => state = value);
  player.useRecordings(false);
  assert.equal(state.recordingsAvailable, false, 'The options panel must not advertise disabled recordings');
  await player.speak('今日は晴れです。', 'ja-JP');
  assert.equal(host.audio.length, 0);
  assert.equal(host.spoken[0].lang, 'ja-JP');
  assert.equal(state.source, 'Device voice');
  player.useRecordings(true);
  assert.equal(state.recordingsAvailable, true);
  assert.equal(state.playing, false);
  await player.speak('今日は晴れです。', 'ja-JP');
  assert.equal(host.audio.length, 1);
  assert.equal(state.source, 'Koichi · ElevenLabs');
});

test('Koichi recordings work without installed voices and stop without stale callbacks', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = recordedHost();
  const player = createSpeechPlayer(() => host, [{ text: '今日は晴れです。', lang: 'ja-JP', file: '/weather.mp3' }]);
  let state; player.subscribe(s => state = s);
  await player.speak('今日は晴れです。', 'ja-JP');
  assert.equal(host.audio[0].src, '/weather.mp3'); assert.equal(host.audio[0].playbackRate, .9);
  assert.equal(state.source, 'Koichi · ElevenLabs'); assert.equal(state.playing, true);
  const oldEnd = host.audio[0].onended;
  await player.speak('今日は晴れです。', 'ja-JP');
  assert.equal(host.audio[0].paused, true);
  oldEnd(); assert.equal(host.audio.length, 2); assert.equal(state.playing, true);
  player.stop(); assert.equal(host.audio[1].paused, true); assert.equal(state.playing, false);
});

test('unrecorded text uses labelled device voice, never an unrelated recording', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = { ...fakeHost(), ...recordedHost() };
  const player = createSpeechPlayer(() => host, [{text:'Recorded line',file:'/recorded.mp3',lang:'en-US'}]);
  let state; player.subscribe(s => state = s);
  await player.play([{text:'Recorded line',lang:'en-US'},{text:'A changed line',lang:'en-US'}]);
  host.audio[0].onended();
  assert.equal(state.source, 'Device voice'); assert.equal(host.spoken[0].text, 'A changed line');
  assert.equal(host.audio.length, 1);
});

test('recording failures are explicit and do not silently substitute another voice', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = { ...fakeHost(), ...recordedHost() };
  const player = createSpeechPlayer(() => host, [{text:'Recorded line',file:'/recorded.mp3',lang:'en-US'}]);
  let state; player.subscribe(s => state = s);
  await player.speak('Recorded line'); host.audio[0].onerror({name:'NetworkError'});
  assert.equal(state.playing, false); assert.match(state.message, /Koichi recording could not play/);
  assert.equal(host.spoken.length, 0); assert.equal(host.audio[0].paused, true);
});

test('every recorded lesson has a local MP3 and exact-text manifest entry', async t => {
  const fs = require('node:fs'); const path = require('node:path');
  const { voiceRecordings } = await import('../web/src/lib/voice-recordings.js');
  if (!voiceRecordings.length) return t.skip('Device-voice distribution intentionally omits provider recordings.');
  const { scenes } = await import('../web/src/lib/demo.js');
  assert.equal(new Set(voiceRecordings.map(c=>c.text)).size, voiceRecordings.length);
  for (const [scene, lesson] of Object.entries(scenes)) {
    for (const field of ['prompt','answer','jp','translation','detail','question','questionMeaning']) {
      assert.ok(voiceRecordings.some(c=>c.text===lesson[field]), `${scene} ${field}`);
    }
  }
  for(const clip of voiceRecordings) {
    assert.ok(clip.file.startsWith('/audio/koichi/'));
    const bytes=fs.readFileSync(path.join(__dirname,'../web/static',clip.file));
    assert.ok(bytes.length>1000); assert.equal(bytes.subarray(0,3).toString(),'ID3');
  }
});

test('notebook listening phrase and all four meanings have exact-text clips', async t => {
  const { voiceRecordings } = await import('../web/src/lib/voice-recordings.js');
  if (!voiceRecordings.length) return t.skip('Device-voice distribution intentionally omits provider recordings.');
  const { listeningPhrase } = await import('../web/src/lib/session-notes.js');
  for (const text of [listeningPhrase.jp, ...Object.values(listeningPhrase.meaning)]) {
    assert.equal(voiceRecordings.filter(clip => clip.text === text).length, 1);
  }
});

function fakeHost(voices = [{ lang: 'en-US', localService: true }, { lang: 'ja-JP', localService: true }]) {
  const spoken = [], listeners = new Map();
  return { spoken, SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } }, speechSynthesis: {
    getVoices: () => voices, speak: u => spoken.push(u), cancel() {},
    addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name)
  }, listeners };
}

test('audio splits mixed Japanese and English explanations and bounds long passages', async () => {
  const { speechParts } = await import('../web/src/lib/speech.js');
  assert.deepEqual(speechParts('今日は晴れです。'), [{ text: '今日は晴れです。', lang: 'ja-JP' }]);
  const parts = speechParts('今日 (kyō) = today.');
  assert.equal(parts[0].lang, 'ja-JP'); assert.equal(parts[1].lang, 'en-US');
  assert.equal(speechParts('Bonjour', 'fr-FR')[0].lang, 'fr-FR');
  assert.ok(speechParts('A long explanation. '.repeat(80)).every(p => p.text.length <= 181));
  assert.deepEqual(speechParts('♪ → ·'), []);
});

test('playback selects each language, slows Japanese, cancels old queues and stops', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = fakeHost(), player = createSpeechPlayer(() => host);
  let state; const unsubscribe = player.subscribe(s => state = s);
  await player.speak('Today. 今日は晴れです。');
  assert.equal(host.spoken[0].lang, 'en-US');
  host.spoken[0].onend();
  assert.equal(host.spoken[1].lang, 'ja-JP'); assert.equal(host.spoken[1].rate, .85);
  const old = host.spoken[1];
  await player.speak('New request');
  old.onend(); assert.equal(host.spoken.length, 3);
  player.stop(); assert.equal(state.playing, false);
  host.spoken[2].onend(); assert.equal(host.spoken.length, 3);
  unsubscribe();
});

test('missing voices and unavailable speech are explained without wrong-language fallback', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = fakeHost([{ lang: 'en-US' }]), player = createSpeechPlayer(() => host);
  let state; player.subscribe(s => state = s);
  await player.speak('今日は晴れです。');
  assert.match(state.message, /No Japanese voice/); assert.equal(state.playing, false); assert.equal(host.spoken.length, 0);
  const unsupported = createSpeechPlayer(() => null);
  unsupported.subscribe(s => state = s); await unsupported.speak('Hello');
  assert.match(state.message, /unavailable/);
});

test('late-loading voice lists are handled and playback errors are surfaced', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const voices = [], host = fakeHost(voices), player = createSpeechPlayer(() => host);
  let state; player.subscribe(s => state = s);
  const pending = player.speak('Hello');
  voices.push({ lang: 'en-US' }); host.listeners.get('voiceschanged')(); await pending;
  assert.equal(host.spoken.length, 1);
  host.spoken[0].onerror({ error: 'not-allowed' });
  assert.equal(state.playing, false); assert.match(state.message, /Press Listen again/);
});

function pausableHost() {
  const host = fakeHost();
  host.speechSynthesis.paused = false;
  host.speechSynthesis.pause = () => host.speechSynthesis.paused = true;
  host.speechSynthesis.resume = () => host.speechSynthesis.paused = false;
  return host;
}

test('device audio pauses, resumes, slows the current sentence and retains queue language/title', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = pausableHost(), player = createSpeechPlayer(() => host);
  let state; player.subscribe(value => state = value);
  await player.play([{ text: 'A useful class note.', lang: 'en-GB' }, { text: '一歩ずつ。', lang: 'ja-JP' }], { title: 'Class notes' });
  assert.equal(state.title, 'Class notes'); assert.equal(state.lang, 'en-GB');
  player.pause(); assert.equal(state.paused, true); assert.equal(host.speechSynthesis.paused, true);
  await player.resume(); assert.equal(state.paused, false); assert.equal(host.spoken.length, 1);
  const oldEnd = host.spoken[0].onend;
  await player.setSlow(true); assert.equal(host.spoken[1].rate, .75); assert.equal(state.slow, true);
  oldEnd(); assert.equal(host.spoken.length, 2);
  host.spoken[1].onend(); assert.equal(state.lang, 'ja-JP'); assert.equal(state.title, 'Class notes');
  assert.equal(host.spoken[2].rate, .85 * .75);
  player.pause(); player.stop(); assert.equal(state.playing, false); assert.equal(state.paused, false); assert.equal(host.speechSynthesis.paused, false);
});

test('changing device speed while paused does not resume or autoplay', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = pausableHost(), player = createSpeechPlayer(() => host);
  let state; player.subscribe(value => state = value);
  await player.speak('A note to reread.', 'en-US');
  player.pause(); await player.setSlow(true);
  assert.equal(state.paused, true); assert.equal(host.spoken.length, 1);
  await player.resume(); assert.equal(state.paused, false); assert.equal(host.spoken.length, 2); assert.equal(host.spoken[1].rate, .75);
});

test('a late sentence-end callback cannot advance playback while paused', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = pausableHost(), player = createSpeechPlayer(() => host);
  await player.play([{ text: 'First note.', lang: 'en-US' }, { text: 'Second note.', lang: 'en-US' }]);
  player.pause(); host.spoken[0].onend(); assert.equal(host.spoken.length, 1);
  await player.resume(); assert.equal(host.spoken.length, 2); assert.equal(host.spoken[1].text, 'Second note.');
});

test('recorded playback pauses and changes speed without replacing its audio or position', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = recordedHost(), player = createSpeechPlayer(() => host, [{ text: '一歩ずつ。', lang: 'ja-JP', file: '/step.mp3' }]);
  let state; player.subscribe(value => state = value);
  await player.speak('一歩ずつ。', 'ja-JP', 'Listen in Japanese');
  const original = host.audio[0]; original.currentTime = 1.5;
  player.pause(); await player.setSlow(true); assert.equal(original.paused, true); assert.equal(original.playbackRate, .9 * .75);
  await player.resume(); assert.equal(original.paused, false); assert.equal(host.audio.length, 1); assert.equal(original.currentTime, 1.5);
  assert.equal(state.lang, 'ja-JP'); assert.equal(state.paused, false);
});

test('a denied recording resume reports failure instead of pretending to play', async () => {
  const { createSpeechPlayer } = await import('../web/src/lib/speech.js');
  const host = recordedHost(), player = createSpeechPlayer(() => host, [{ text: 'Recorded.', lang: 'en-US', file: '/note.mp3' }]);
  let state; player.subscribe(value => state = value);
  await player.speak('Recorded.'); player.pause();
  host.audio[0].play = () => Promise.reject(Error('denied'));
  await player.resume(); assert.equal(state.playing, false); assert.match(state.message, /could not resume/);
});
