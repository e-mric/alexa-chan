import { writable } from 'svelte/store';
import { voiceRecordings } from './voice-recordings.js';
export const hasRecordings = voiceRecordings.length > 0;

// Keep Japanese runs in their native voice even inside English explanations.
export function speechParts(text, language = 'en-US') {
  return String(text).split(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々]+[。、！？]?)/u)
    .filter(part => /[\p{L}\p{N}]/u.test(part))
    .flatMap(part => {
      const lang = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(part) ? 'ja-JP' : language;
      return (part.match(/.{1,180}(?:\s|$)|.{1,180}/gu) || []).map(text => ({ text: text.trim(), lang }));
    });
}

export function createSpeechPlayer(getHost = () => typeof window === 'undefined' ? null : window, recordings = []) {
  let slow = false, current, remaining = [], restartOnResume = false, continueQueue, pendingNext = false;
  const state = writable({ playing: false, paused: false, slow, message: '', text: '', source: '', lang: '', title: '', recordingsAvailable: recordings.length > 0 });
  function publish(value) { current = { playing: false, paused: false, slow, message: '', text: '', source: '', lang: '', title: '', ...value, recordingsAvailable: recordingsEnabled && recordings.length > 0 }; state.set(current); }
  const normalize = text => String(text).normalize('NFC').replace(/\s+/g, ' ').trim();
  const clips = new Map(recordings.map(clip => [normalize(clip.text), clip]));
  let generation = 0, activeAudio = null, recordingsEnabled = true;
  function releaseAudio() {
    if (!activeAudio) return;
    activeAudio.onended = activeAudio.onerror = null;
    activeAudio.pause();
    activeAudio.removeAttribute?.('src');
    activeAudio.load?.();
    activeAudio = null;
  }
  function stop() {
    generation++;
    releaseAudio();
    const synth = getHost()?.speechSynthesis;
    synth?.cancel();
    if (synth?.paused) synth.resume?.();
    remaining = []; restartOnResume = false; pendingNext = false; continueQueue = undefined;
    publish({});
  }
  async function play(parts, options = {}) {
    stop();
    const title = options.title || '';
    const host = getHost(), synth = host?.speechSynthesis, token = generation;
    const queue = parts.flatMap(part => {
      const clip = recordingsEnabled ? clips.get(normalize(part.text)) : null;
      return clip && host?.Audio ? [{ ...part, clip }] : speechParts(part.text, part.lang);
    }).filter(part => part.text.trim());
    if ((!synth || !host.SpeechSynthesisUtterance) && !queue.some(part => part.clip)) {
      publish({ message: 'Audio is unavailable in this browser. Try a browser with text-to-speech support.' });
      return;
    }
    publish({ playing: true, title, message: 'Preparing audio…' });
    // Some browsers populate voices after the first interaction.
    if (queue.some(part => !part.clip) && synth && !synth.getVoices().length) await new Promise(resolve => {
      const done = () => { clearTimeout(timer); synth.removeEventListener('voiceschanged', done); resolve(); };
      const timer = setTimeout(done, 1200);
      synth.addEventListener('voiceschanged', done);
    });
    if (generation !== token) return;
    const voices = synth?.getVoices() || [];
    const missing = [...new Set(queue.filter(part => !part.clip && !voices.some(v => v.lang.toLowerCase().startsWith(part.lang.slice(0,2))))
      .map(part => ({ ja: 'Japanese', en: 'English', fr: 'French' }[part.lang.slice(0,2)] || part.lang)))];
    const warning = missing.length ? `No ${missing.join(' / ')} voice is installed. Add it in your device’s speech settings; those passages are skipped.` : '';
    let index = 0;
    function next() {
      if (generation !== token) return;
      if (current?.paused) { pendingNext = true; remaining = queue.slice(index).map(({ text, lang }) => ({ text, lang })); return; }
      releaseAudio();
      while (index < queue.length) {
        const part = queue[index++];
        remaining = [part, ...queue.slice(index)].map(({ text, lang }) => ({ text, lang }));
        if (part.clip) {
          const audio = new host.Audio(part.clip.file);
          activeAudio = audio;
          audio.playbackRate = (part.clip.lang?.startsWith('ja') ? .9 : 1) * (slow ? .75 : 1);
          audio.preservesPitch = true;
          let failed = false;
          const fail = error => {
            if (generation !== token || failed) return;
            failed = true; releaseAudio();
            publish({ message: error?.name === 'NotAllowedError'
              ? 'Press Listen again to allow playback.'
              : 'The Koichi recording could not play. Please try again. Other text can still use your device’s voice.' });
          };
          audio.onended = next; audio.onerror = fail;
          publish({ playing: true, text: part.text, title, lang: part.clip.lang || part.lang, message: warning, source: 'Koichi · ElevenLabs' });
          try { const result = audio.play(); result?.catch(fail); } catch (error) { fail(error); }
          return;
        }
        const matching = voices.filter(v => v.lang.toLowerCase().startsWith(part.lang.slice(0,2)));
        const voice = matching.find(v => v.localService) || matching[0];
        if (!voice) continue;
        const utterance = new host.SpeechSynthesisUtterance(part.text);
        utterance.lang = part.lang; utterance.voice = voice; utterance.rate = (part.lang.startsWith('ja') ? .85 : 1) * (slow ? .75 : 1);
        utterance.onend = next;
        utterance.onerror = event => {
          if (generation !== token) return;
          remaining = [];
          publish({ message: event.error === 'not-allowed' ? 'Press Listen again to allow playback.' : 'Audio could not play. Try again or check your device’s speech settings.' });
        };
        publish({ playing: true, text: part.text, title, lang: part.lang, message: warning, source: 'Device voice' });
        synth.speak(utterance);
        return;
      }
      remaining = [];
      publish({ message: warning });
    }
    continueQueue = next;
    next();
  }
  function pause() {
    if (!current?.playing || current.paused || !remaining.length) return;
    if (activeAudio) activeAudio.pause();
    else if (typeof getHost()?.speechSynthesis?.pause === 'function') getHost().speechSynthesis.pause();
    else { publish({ ...current, message: 'Pause is unavailable in this browser. You can stop and listen again.' }); return; }
    publish({ ...current, paused: true });
  }
  async function resume() {
    if (!current?.playing || !current.paused) return;
    if (restartOnResume) { await play(remaining, { title: current.title }); return; }
    if (pendingNext) { pendingNext = false; getHost()?.speechSynthesis?.resume?.(); publish({ ...current, paused: false }); continueQueue?.(); return; }
    if (activeAudio) {
      const token = generation;
      try { await activeAudio.play(); } catch { if (token === generation) { stop(); publish({ message: 'Audio could not resume. Press Listen again.' }); } return; }
      if (token !== generation) return;
    } else getHost()?.speechSynthesis?.resume?.();
    publish({ ...current, paused: false });
  }
  async function setSlow(enabled) {
    slow = enabled === true;
    if (activeAudio) { activeAudio.playbackRate = (current.lang?.startsWith('ja') ? .9 : 1) * (slow ? .75 : 1); publish({ ...current, slow }); }
    else if (current?.playing && current.paused) { restartOnResume = true; publish({ ...current, slow }); }
    else if (current?.playing && remaining.length) await play(remaining, { title: current.title });
    else publish({ ...current, slow });
  }
  return { subscribe: state.subscribe, stop, play, pause, resume, setSlow,
    useRecordings(enabled) { recordingsEnabled = enabled === true; stop(); },
    speak: (text, lang = 'en-US', title = '') => play([{ text, lang }], { title }) };
}

export const speech = createSpeechPlayer(undefined, voiceRecordings);
