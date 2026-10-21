<script>
  import { tick } from 'svelte';
  import Listen from './Listen.svelte';
  import { speech } from './speech.js';
  import { openAudioTools } from './audio-copy.js';
  let { phrase, saved = false, disabled = false, onkeep, onback } = $props();
  let revealed = $state(false), pronunciation = $state(true);
  let meaningElement = $state();
  async function reveal() {
    speech.stop(); revealed = true;
    await tick(); meaningElement?.focus({ preventScroll: true });
  }
</script>

<section class="study" aria-labelledby="study-title" data-testid="note-study-screen">
  <div class="study-toolbar"><button class="back" onclick={onback}>← Back to your note</button><button class="more" onclick={event => openAudioTools(event.currentTarget)}>More</button></div>
  <h2 id="study-title" tabindex="-1">Take one phrase with you.</h2>
  <p class="context">A little Japanese. Only if you feel like it.</p>
  <article class="phrase-card" aria-label="Curated Japanese study phrase">
    <div class="card-tools"><Listen text={phrase.jp} lang="ja-JP" label="Listen in Japanese"/><span>Curated study phrase</span></div>
    <div class="phrase-face">
      <p class="japanese" lang="ja">{phrase.jp}</p>
      {#if pronunciation}<p class="romaji">{phrase.romaji}</p>{/if}
      {#if revealed}
        <div class="meaning" tabindex="-1" bind:this={meaningElement}><p>{phrase.meaning.en}</p><Listen text={phrase.meaning.en} lang="en-GB" label="Listen to the meaning"/></div>
      {:else}<button class="reveal" onclick={reveal}>Reveal meaning</button>{/if}
    </div>
    <label class="pronunciation"><input type="checkbox" bind:checked={pronunciation}/> Show pronunciation hint</label>
  </article>
  {#if revealed}<details class="explanation"><summary>A little more detail</summary><p>{phrase.detail.en}</p><Listen text={phrase.detail.en} lang="en-GB" label="Listen to the explanation"/></details>{/if}
  <button class="keep" disabled={disabled || saved} onclick={onkeep}>{saved ? 'Saved to your memories' : 'Keep this phrase'}</button>
  <button class="not-now" onclick={onback}>{saved ? 'Back to my notes' : 'Not now'}</button>
  <p class="boundary">A companion phrase, not a translation. Your original notes stay unchanged.</p>
</section>

<style>
  .study{max-width:620px;margin:auto;color:var(--ink);padding:0 24px 40px}
  button{font:inherit;min-height:var(--control-target);min-width:var(--control-target);cursor:pointer;color:var(--ink);border:0;background:transparent;border-radius:8px;padding:10px 16px}
  button:focus-visible,summary:focus-visible,input:focus-visible{outline:3px solid var(--focus);outline-offset:4px}button:disabled{opacity:.6;cursor:default}
  .back{padding-left:0;margin-bottom:20px;font-size:14px}.back:hover,.not-now:hover{text-decoration:underline;text-underline-offset:4px}
  .study-toolbar{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.more{font-size:14px}.more:hover{text-decoration:underline;text-underline-offset:4px}
  h2{font:clamp(27px,4vw,36px)/1.2 Georgia,serif;margin:0 0 12px;text-wrap:balance}h2:focus{outline:none}
  .context{font-size:15px;color:var(--muted);margin:0 0 28px;line-height:1.6}
  .phrase-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:20px 28px;min-height:clamp(260px,calc(100svh - 380px),400px);display:flex;flex-direction:column}
  .card-tools{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.card-tools>span{font-size:12px;color:var(--muted)}
  .phrase-face{padding:46px 0 24px;text-align:center;flex:1;align-content:center}.japanese{font-size:clamp(32px,5vw,56px);line-height:1.5;overflow-wrap:anywhere;margin:0}.romaji{font-size:18px;line-height:1.6;color:var(--muted);margin:12px 0 0}
  .meaning{border-top:1px solid var(--line);margin-top:28px;padding-top:20px}.meaning p{font-size:clamp(21px,3vw,28px);line-height:1.4;margin:0;text-wrap:balance}.reveal{margin-top:28px;border:1px solid var(--border);font-size:15px}.reveal:hover{background:var(--surface-soft)}
  .pronunciation{display:flex;align-items:center;gap:8px;min-height:var(--control-target);font-size:13px;color:var(--muted);cursor:pointer}.pronunciation input{accent-color:var(--signal);width:18px;height:18px}
  .keep{display:block;width:100%;background:var(--signal);color:var(--paper);font-size:16px;font-weight:bold;margin-top:24px;padding:16px}.keep:hover:not(:disabled){background:var(--action-ink)}
  .not-now{display:block;margin:8px auto;font-size:14px}.boundary{border-top:1px solid var(--line);margin:24px 0 0;padding-top:20px;color:var(--muted);text-align:center;font-size:12px;line-height:1.7}
  .explanation{margin-top:16px;font-size:14px;line-height:1.7}.explanation summary{min-height:var(--control-target);align-content:center;cursor:pointer}.explanation p{margin:8px 0}
  .meaning:focus{outline:none}
  @media(max-width:600px){.study{padding:0 16px 28px}.phrase-card{padding:16px;min-height:340px}.phrase-face{padding:28px 0 20px}.back{margin-bottom:12px}.context{margin-bottom:20px}}
  ::selection{background:var(--surface-soft);color:var(--ink)}
</style>
