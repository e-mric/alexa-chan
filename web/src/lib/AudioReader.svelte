<script>
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { speech } from './speech.js';
  import { audioLanguage, audioCopy } from './audio-copy.js';
  const t = $derived(audioCopy[$audioLanguage]);
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
    speech.play(parts);
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
      speech.speak(text, language(element));
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
  <button class="toggle" aria-expanded={expanded} onclick={() => expanded = !expanded}>♪ Audio {$speech.playing ? `· ${t.playing}` : ''}</button>
  {#if $speech.playing}<button class="stop" onclick={() => speech.stop()}>{t.stop} ■</button>{/if}
  {#if $speech.playing && $speech.source}<span class="voice-source">{$speech.source === 'Device voice' ? t.device : $speech.source}</span>{/if}
  {#if expanded}
    <div class="panel">
      <p>{t.title}</p>
      <button onclick={readPage}>{t.page}</button>
      <button aria-pressed={picking} onclick={() => { picking = !picking; speech.stop(); }}>{picking ? t.finish : t.choose}</button>
      <button disabled={!selection} onclick={() => speech.speak(selection, selectionLang)}>{t.selection}</button>
      <small>{picking ? t.picking : t.help}</small>
      <small>{t.note}</small>
    </div>
  {/if}
  {#if picking && !expanded}<p class="status">{t.choose} · <button onclick={() => picking = false}>{t.done}</button></p>{/if}
  {#if $speech.message}<p class="status" role="status">{$speech.message}</p>{/if}
</aside>
<style>
  .audio-reader{position:fixed;bottom:12px;left:14px;z-index:1000;font:12px/1.5 Arial,sans-serif;color:#f5f2e9;max-width:calc(100vw - 28px)}
  button{font:inherit;cursor:pointer;touch-action:manipulation;min-height:38px}button:focus-visible{outline:3px solid #ef6953;outline-offset:3px}button:disabled{opacity:.5;cursor:default}
  .toggle,.stop{border:1px solid #bbcaca80;background:#193542f5;border-radius:20px;color:inherit;padding:7px 16px}.stop{margin-left:6px;background:#a83730}
  .voice-source{display:block;font-size:10px;background:#193542;border-radius:5px;padding:3px 8px;margin-top:4px;width:fit-content}
  .panel{position:absolute;bottom:48px;left:0;width:min(290px,calc(100vw - 28px));padding:16px;border-radius:12px;background:#16313ff7;border:1px solid #bbcaca80;box-shadow:0 8px 24px #08192370;display:grid;gap:8px}
  .panel p{margin:0 0 4px;font-weight:bold}.panel button{border:1px solid #bbcaca80;background:#ffffff0d;color:inherit;border-radius:6px;padding:8px;text-align:left}.panel button[aria-pressed=true]{background:#a83730}
  small{font-size:10px;opacity:.85}.status{max-width:290px;padding:10px;background:#193542;border-radius:8px;margin:6px 0 0}.status button{background:none;border:0;color:inherit;text-decoration:underline}
</style>
