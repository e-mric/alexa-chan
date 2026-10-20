<script>
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { speech } from './speech.js';
  import { studentCopy } from './student-copy.js';
  import { audioLanguage, audioCopy } from './audio-copy.js';
  const t = $derived(audioCopy[$audioLanguage]);
  const spokenLanguage = $derived(({ en: 'English', ja: '日本語', fr: 'Français', nl: 'Nederlands', de: 'Deutsch' })[$speech.lang?.slice(0,2)] || $speech.lang || '');
  let picking = $state(false), selection = $state(''), selectionLang = $state('en-US');
  let expanded = $state(false);
  afterNavigate(() => { speech.stop(); picking = false; selection = ''; });
  function language(element) { return element?.closest('[lang]')?.lang || 'en-US'; }
  function readPage() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const parts = [];
    while (walker.nextNode()) {
      const node = walker.currentNode, el = node.parentElement;
      if (!el || el.closest('[data-audio-ui], [aria-hidden="true"], script, style, .romaji, .roman, .spoken-answer')) continue;
      const style = getComputedStyle(el);
      if (!el.getClientRects().length || style.visibility === 'hidden' || style.display === 'none' || style.clipPath === 'inset(50%)') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) continue;
      // A closed <details> can still give its descendants layout boxes.
      const details = el.closest('details:not([open])');
      if (details && !el.closest('summary')) continue;
      parts.push({text:node.textContent, lang:language(el)});
    }
    speech.play(parts, { title: t.page });
  }
  onMount(() => {
    function rememberSelection() {
      const selected = window.getSelection();
      if (!selected?.toString().trim()) return;
      const element = selected.anchorNode?.parentElement;
      if (element?.closest('[data-audio-ui]')) return;
      selection = selected.toString(); selectionLang = language(element);
    }
    function pick(event) {
      if (!picking || !(event.target instanceof Element) || event.target.closest('[data-audio-ui]')) return;
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault(); event.stopImmediatePropagation();
      const element = event.target.closest('p,h1,h2,h3,h4,button,a,label,summary,span,small,b,li') || event.target;
      const text = element.getAttribute('aria-label') || element.textContent;
      speech.speak(text, language(element), t.choose);
    }
    function escape(event) { if (event.key === 'Escape') { picking = false; speech.stop(); } }
    document.addEventListener('selectionchange', rememberSelection);
    document.addEventListener('click', pick, true);
    document.addEventListener('keydown', pick, true);
    document.addEventListener('keydown', escape);
    return () => {
      speech.stop(); document.removeEventListener('selectionchange', rememberSelection);
      document.removeEventListener('click', pick, true); document.removeEventListener('keydown', pick, true);
      document.removeEventListener('keydown', escape);
    };
  });
</script>

<aside class="audio-reader" data-audio-ui aria-label={t.controls} lang={$audioLanguage}>
  {#if $speech.playing}
    <div class="player">
      <div class="player-art" aria-hidden="true">旅</div>
      <div class="now-playing"><span class="player-language">{spokenLanguage} · {$speech.paused ? t.paused : t.playing}</span><strong>{$speech.title || t.title}</strong><span class="excerpt">{$speech.text}</span><small>{$speech.source === 'Device voice' ? t.device : $speech.source}</small></div>
      <div class="transport"><button class="pause" aria-label={$speech.paused ? t.resume : t.pause} onclick={() => $speech.paused ? speech.resume() : speech.pause()}>{$speech.paused ? '▶' : 'Ⅱ'}</button><button class="speed" aria-pressed={$speech.slow} title={t.slowHelp} onclick={() => speech.setSlow(!$speech.slow)}>{t.slower}</button><button class="stop" aria-label={t.stop} onclick={() => speech.stop()}>■</button></div>
    </div>
  {/if}
  <button class="toggle" aria-expanded={expanded} onclick={() => expanded = !expanded}>♪ {t.options}</button>
  {#if expanded}
    <div class="panel">
      <p>{t.title}</p>
      <button onclick={readPage}>{t.page}</button>
      <button aria-pressed={picking} onclick={() => { picking = !picking; speech.stop(); }}>{picking ? t.finish : t.choose}</button>
      <button disabled={!selection} onclick={() => speech.speak(selection, selectionLang, t.selection)}>{t.selection}</button>
      <small>{picking ? t.picking : t.help}</small>
      <small>{$speech.recordingsAvailable ? t.note : studentCopy[$audioLanguage].deviceAudio}</small>
    </div>
  {/if}
  {#if picking && !expanded}<p class="status">{t.choose} · <button onclick={() => picking = false}>{t.done}</button></p>{/if}
  {#if $speech.message}<p class="status" role="status">{$speech.message}</p>{/if}
</aside>
<style>
  .audio-reader{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:1000;font:12px/1.5 Arial,sans-serif;color:var(--paper);max-width:calc(100vw - 28px);display:flex;flex-direction:column;align-items:center;gap:6px}
  button{font:inherit;cursor:pointer;touch-action:manipulation;min-height:var(--control-target);min-width:var(--control-target)}button:focus-visible{outline:3px solid var(--focus-on-dark);outline-offset:3px}button:disabled{opacity:.5;cursor:default}
  .player{display:flex;align-items:center;gap:12px;width:min(550px,calc(100vw - 28px));box-sizing:border-box;padding:12px;background:var(--ink);border:1px solid var(--border);box-shadow:0 10px 40px #071a3260;border-radius:12px}.player-art{display:flex;align-items:center;justify-content:center;background:var(--signal);border-radius:7px;font-size:27px;flex-shrink:0;width:48px;height:56px}.now-playing{min-width:0;flex:1}.player-language{font-size:11px;color:var(--amber)}.now-playing strong{display:block;font-size:12px;font-weight:500;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.excerpt{display:block;font-size:12px;color:var(--muted-on-dark);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.now-playing small{font-size:11px;color:var(--muted-on-dark)}.transport{display:grid;grid-template-columns:44px auto 44px;gap:6px;align-items:center}.transport button{border:0;color:var(--paper);background:#ffffff0c;border-radius:6px;padding:6px;font-size:12px}.transport .pause{font-size:17px;background:var(--paper);color:var(--ink)}.transport .speed[aria-pressed=true]{background:var(--signal)}.transport .stop{background:transparent}
  .toggle{border:1px solid var(--border);background:var(--ink);border-radius:22px;color:inherit;padding:8px 14px;font-size:12px}.panel{position:absolute;bottom:58px;left:50%;transform:translateX(-50%);width:min(310px,calc(100vw - 28px));max-height:calc(100svh - 190px);overflow:auto;box-sizing:border-box;padding:18px;border-radius:12px;background:var(--ink);border:1px solid var(--border);box-shadow:0 8px 24px #08192370;display:grid;gap:8px}.audio-reader:has(.player) .panel{bottom:158px}.panel p{margin:0 0 4px;font-weight:bold}.panel button{border:1px solid var(--border);background:transparent;color:inherit;border-radius:6px;padding:8px;text-align:left}.panel button[aria-pressed=true]{background:var(--signal)}
  .panel small{font-size:12px;color:var(--muted-on-dark)}.status{max-width:400px;padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;margin:0;font-size:12px}.status button{background:none;border:0;color:inherit;text-decoration:underline}
  @media(max-width:500px){.player{gap:8px;padding:10px}.player-art{display:none}.now-playing strong,.excerpt{font-size:12px}}
</style>
