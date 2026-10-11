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
  const state = writable({ playing: false, message: '', text: '', source: '' });
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
    getHost()?.speechSynthesis?.cancel();
    state.set({ playing: false, message: '', text: '' });
  }
  async function play(parts) {
    stop();
    const host = getHost(), synth = host?.speechSynthesis, token = generation;
    const queue = parts.flatMap(part => {
      const clip = recordingsEnabled ? clips.get(normalize(part.text)) : null;
      return clip && host?.Audio ? [{ ...part, clip }] : speechParts(part.text, part.lang);
    }).filter(part => part.text.trim());
    if ((!synth || !host.SpeechSynthesisUtterance) && !queue.some(part => part.clip)) {
      state.set({ playing: false, text: '', message: 'Audio is unavailable in this browser. Try a browser with text-to-speech support.' });
      return;
    }
    state.set({ playing: true, text: '', message: 'Preparing audio…' });
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
      releaseAudio();
      while (index < queue.length) {
        const part = queue[index++];
        if (part.clip) {
          const audio = new host.Audio(part.clip.file);
          activeAudio = audio;
          audio.playbackRate = part.clip.lang?.startsWith('ja') ? .9 : 1;
          audio.preservesPitch = true;
          let failed = false;
          const fail = error => {
            if (generation !== token || failed) return;
            failed = true; releaseAudio();
            state.set({ playing: false, text: '', source: '', message: error?.name === 'NotAllowedError'
              ? 'Press Listen again to allow playback.'
              : 'The Koichi recording could not play. Please try again. Other text can still use your device’s voice.' });
          };
          audio.onended = next; audio.onerror = fail;
          state.set({ playing: true, text: part.text, message: warning, source: 'Koichi · ElevenLabs' });
          try { const result = audio.play(); result?.catch(fail); } catch (error) { fail(error); }
          return;
        }
        const matching = voices.filter(v => v.lang.toLowerCase().startsWith(part.lang.slice(0,2)));
        const voice = matching.find(v => v.localService) || matching[0];
        if (!voice) continue;
        const utterance = new host.SpeechSynthesisUtterance(part.text);
        utterance.lang = part.lang; utterance.voice = voice; utterance.rate = part.lang.startsWith('ja') ? .85 : 1;
        utterance.onend = next;
        utterance.onerror = event => {
          if (generation !== token) return;
          state.set({ playing: false, text: '', message: event.error === 'not-allowed' ? 'Press Listen again to allow playback.' : 'Audio could not play. Try again or check your device’s speech settings.' });
        };
        state.set({ playing: true, text: part.text, message: warning, source: 'Device voice' });
        synth.speak(utterance);
        return;
      }
      state.set({ playing: false, text: '', message: warning });
    }
    next();
  }
  return { subscribe: state.subscribe, stop, play,
    useRecordings(enabled) { stop(); recordingsEnabled = enabled === true; },
    speak: (text, lang = 'en-US') => play([{ text, lang }]) };
}

export const speech = createSpeechPlayer(undefined, voiceRecordings);
