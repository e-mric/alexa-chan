<script>
  import { onMount, onDestroy } from 'svelte';
  import { phrases, LOCALES, saveMemory, formatDay, brusselsDate, validDate } from './founders.js';
  import { MAX_NOTE_LENGTH, noteKey, saveSessionNote, readNoteFile } from './session-notes.js';
  import { notebookCopy } from './session-notes-copy.js';
  import { copy } from './founders-copy.js';
  import { studentCopy } from './student-copy.js';
  import { speech, hasRecordings } from './speech.js';
  import Listen from './Listen.svelte';
  let { progress, session = null, oncommit, ondirty, onback, disabled = false, immersive = false } = $props();
  let active = $state(null), mode = $state('read'), body = $state(''), question = $state(''), takeaway = $state('');
  let japanese = $state(false), status = $state(''), busy = $state(false);
  let creating = $state(false), newTitle = $state(''), newDate = $state('');
  const locale = $derived(progress.locale), t = $derived(notebookCopy[locale]), common = $derived({ ...copy[locale], audioNote: hasRecordings ? copy[locale].audioNote : studentCopy[locale].deviceAudio });
  const records = $derived([...(progress.sessionNotes || [])].sort((a,b) => b.date.localeCompare(a.date) || b.updatedAt-a.updatedAt));
  const saved = $derived(active ? records.find(n => noteKey(n) === noteKey(active)) : null);
  const dirty = $derived((creating && !!newTitle) || (!!active && (body !== (saved?.body || '') || question !== (saved?.question || '') || takeaway !== (saved?.takeaway || ''))));
  const phrase = $derived(saved ? phrases[saved.phraseId] : null);
  $effect(() => { ondirty(dirty || busy); });
  onMount(() => { if (session) open(session); });
  onDestroy(() => { speech.stop(); ondirty(false); });
  function restoreDraft() {
    const entry = records.find(n => noteKey(n) === noteKey(active));
    body = entry?.body || ''; question = entry?.question || ''; takeaway = entry?.takeaway || '';
  }
  function open(next) {
    if (dirty || busy) { status = 'dirty'; return; }
    speech.stop(); creating = false; newTitle = ''; active = next; restoreDraft();
    mode = records.some(n => noteKey(n) === noteKey(next)) ? 'read' : 'edit'; japanese = false; status = '';
  }
  function library() {
    if (dirty || busy) { status = 'dirty'; return; }
    speech.stop(); creating = false; newTitle = ''; active = null; japanese = false; status = '';
  }
  function createNotebook() {
    if (!newTitle.trim() || !validDate(newDate) || disabled) return;
    active = { id: `notebook-${crypto.randomUUID()}`, title: newTitle.trim(), date: newDate };
    creating = false; newTitle = ''; restoreDraft(); mode = 'edit'; japanese = false; status = '';
  }
  function cancelCreate() {
    if (dirty && !window.confirm(t.confirmDiscard)) return;
    creating = false; newTitle = ''; status = '';
  }
  function save() {
    try {
      if (!oncommit(saveSessionNote(progress, active, { body, question, takeaway }))) throw Error('save');
      speech.stop(); mode = 'read'; japanese = false; status = 'saved';
    } catch { status = 'failed'; }
  }
  async function importText(event) {
    const input = event.currentTarget, file = input.files?.[0];
    if (!file) return;
    busy = true;
    try {
      const next = await readNoteFile(file);
      if (body && !window.confirm(t.replace)) return;
      body = next; status = 'imported';
    } catch { status = 'badFile'; }
    finally { busy = false; input.value = ''; }
  }
  function discard() {
    if (window.confirm(t.confirmDiscard)) { restoreDraft(); mode = saved ? 'read' : 'edit'; status = ''; }
  }
  function remove() {
    if (!window.confirm(t.confirmRemove)) return;
    if (oncommit({ ...progress, sessionNotes: records.filter(n => noteKey(n) !== noteKey(active)) })) {
      speech.stop(); active = null; japanese = false; status = '';
    } else status = 'failed';
  }
</script>

<section class="notebooks" aria-label={t.title}>
  <div class="notebook-heading"><div><span class="eyebrow">ALEXA-CHAN / NOTES</span><h2>{t.title}</h2></div><button onclick={onback}>{t.programme} ↗</button></div>
  {#if immersive}<p class="quiet">Ⅱ {t.quiet}</p>{/if}
  {#if status}<p class="status" role="status">{t[status]}</p>{/if}
  {#if !active}
    <p>{t.intro}</p>
    {#if !records.length}<p class="empty">{t.empty}</p>{/if}
    {#if creating}
      <form class="new-notebook" onsubmit={e => { e.preventDefault(); createNotebook(); }}>
        <p>{t.createHelp}</p>
        <label for="new-notebook-title">{t.newTitle}</label><input id="new-notebook-title" required maxlength="300" bind:value={newTitle} disabled={disabled} />
        <label for="new-notebook-date">{t.newDate}</label><input id="new-notebook-date" type="date" required bind:value={newDate} disabled={disabled} />
        <div class="actions"><button class="primary" disabled={disabled || !newTitle.trim() || !validDate(newDate)}>{t.create}</button><button type="button" onclick={cancelCreate}>{t.cancel}</button></div>
      </form>
    {:else}
      <button class="primary" onclick={() => { speech.stop(); newDate = brusselsDate(); creating = true; }} disabled={disabled}>{t.create} ＋</button>
    {/if}
    <div class="library">{#each records as record (noteKey(record))}<button onclick={() => open(record)}><time>{formatDay(record.date, locale)}</time><strong>{record.title}</strong><span>{record.takeaway || record.question || t.original}</span><span aria-hidden="true">↗</span></button>{/each}</div>
  {:else}
    <button class="back" onclick={library}>← {t.back}</button>
    <header><time>{formatDay(active.date, locale)}</time><h3>{active.title}</h3></header>
    {#if mode === 'edit'}
      <form onsubmit={e => { e.preventDefault(); save(); }}>
        <label for="session-question">{t.question}</label><textarea id="session-question" rows="2" maxlength="1000" bind:value={question} disabled={busy || disabled}></textarea>
        <label for="session-body">{t.body}</label><textarea id="session-body" rows="14" maxlength={MAX_NOTE_LENGTH} placeholder={t.paste} bind:value={body} disabled={busy || disabled}></textarea>
        <span class="length">{body.length.toLocaleString(LOCALES[locale])} / 20 000</span>
        <label class="file-label">{t.import}<input type="file" accept=".txt,.md,text/plain,text/markdown" onchange={importText} disabled={busy || disabled}/></label><p class="small">{t.limits}</p>
        <label for="session-takeaway">{t.takeaway}</label><textarea id="session-takeaway" rows="2" maxlength="1000" bind:value={takeaway} disabled={busy || disabled}></textarea>
        <div class="actions"><button class="primary" disabled={busy || disabled || (!dirty && !!saved)}>{t.save}</button>{#if dirty}<button type="button" onclick={discard} disabled={busy}>{t.discard}</button><small>{t.unsaved}</small>{/if}{#if saved && !dirty}<button type="button" onclick={() => { mode = 'read'; speech.stop(); }}>{t.original}</button>{/if}</div>
      </form>
    {:else if saved}
      <div class="reading" data-testid="session-reading">
        <section class="prep-note"><h4>{t.question}</h4><p class="literal">{saved.question || t.noQuestion}</p></section>
        <section class="original"><h4>{t.original}</h4><div class="literal note-body" data-testid="original-session-notes">{saved.body || t.noBody}</div></section>
        <section class="takeaway"><h4>{t.takeaway}</h4><p class="literal">{saved.takeaway || t.noTakeaway}</p></section>
      </div>
      <div class="actions"><button onclick={() => { speech.stop(); mode = 'edit'; japanese = false; status = ''; }}>{t.edit}</button>{#if saved.body}<Listen text={saved.body} lang={LOCALES[locale]} label={common.readNote}/>{/if}</div>
      <p class="small">{common.audioNote}</p>
      <aside class="japanese">
        <button class="optional" aria-expanded={japanese} onclick={() => { speech.stop(); japanese = !japanese; }}>{japanese ? t.hide : t.japanese} <span aria-hidden="true">{japanese ? '−' : '+'}</span></button>
        {#if japanese && phrase}
          <p class="small">{t.suggestion}</p><p class="phrase" lang="ja">{phrase.jp}</p>
          <Listen text={phrase.jp} lang="ja-JP" label={common.listenJapanese}/>
          <details><summary>{t.meaning}</summary><p>{phrase.romaji}</p><p>{phrase.meaning[locale]}</p><Listen text={phrase.meaning[locale]} lang={LOCALES[locale]} label={common.listen}/><p class="small">{phrase.detail[locale]}</p><Listen text={phrase.detail[locale]} lang={LOCALES[locale]} label={common.listen}/></details>
          <button class="keep" disabled={disabled || progress.memories.some(m => m.id === saved.phraseId)} onclick={() => { if (!oncommit(saveMemory(progress, saved.phraseId))) status = 'failed'; }}>{progress.memories.some(m => m.id === saved.phraseId) ? common.saved : common.save}</button><p class="small">{t.repeat}</p>
        {/if}
      </aside>
      <details class="remove"><summary>{t.remove}</summary><button onclick={remove} disabled={disabled}>{t.remove}</button></details>
    {/if}
  {/if}
  <p class="privacy">{t.privacy}</p>
</section>

<style>
  .new-notebook{max-width:540px;padding:0 0 24px}.new-notebook input{display:block;width:100%;box-sizing:border-box;padding:12px;border:1px solid #aec0b8;border-radius:5px;background:#fffef9;color:#20383e}
  .notebooks{background:#faf9f1;color:#20383e;padding:clamp(20px,4vw,48px);border:1px solid #bdcdc6;border-top:3px solid #b83c30;border-radius:5px 18px 5px 5px;box-shadow:0 16px 60px #142b4020;line-height:1.7}
  .notebook-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.eyebrow,time,.quiet{font:11px/1.7 monospace;color:#607574}.eyebrow{letter-spacing:1.4px}h2{font:32px/1.2 Georgia,serif;margin:8px 0}header{border-bottom:1px solid #ced8d0;margin:24px 0}h3{font:30px/1.25 Georgia,serif;margin:8px 0 24px;overflow-wrap:anywhere}h4{font:11px/1.7 monospace;letter-spacing:.6px;text-transform:uppercase;color:#687c76;margin:0 0 12px}
  button,input,textarea{font:inherit}button{cursor:pointer;border:1px solid #a8bbb5;border-radius:5px;padding:10px 14px;background:transparent;color:#29474b;font-size:12px;min-height:42px}button:disabled{opacity:.5;cursor:default}button:focus-visible,textarea:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid #bd4435;outline-offset:3px}.primary{background:#af352b;color:white;border-color:#af352b}.back{border:0;padding-left:0;color:#9b352a}.quiet{border-left:2px solid #b43a30;padding-left:12px}.status{background:#f8e4cf;border-left:3px solid #aa4531;padding:12px;font-size:13px}
  label{display:block;font-weight:bold;font-size:12px;margin:24px 0 8px}textarea{width:100%;resize:vertical;box-sizing:border-box;line-height:1.7;padding:14px;background:#fffef9;border:1px solid #aec0b8;border-radius:5px;color:#20383e}#session-body{font-family:monospace;font-size:14px}.file-label{font-weight:normal}.file-label input{display:block;margin-top:10px;max-width:100%;font-size:12px}.length{display:block;text-align:right;font:11px monospace;color:#637871}.small,.privacy{font-size:11px;color:#586e68;line-height:1.7}.privacy{border-top:1px solid #ced8d0;margin-top:28px;padding-top:16px}.actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:20px 0}.actions small{color:#9b352a}.literal{white-space:pre-wrap;overflow-wrap:anywhere}.note-body{font:17px/1.9 Georgia,serif;min-height:80px}.original{padding:28px 0}.prep-note,.takeaway{background:#edf0e6;border-left:2px solid #9caf9d;padding:18px 22px}.literal{margin:0}.japanese{margin-top:30px;border-top:1px solid #d0d9cf;padding-top:16px}.optional{border:0;width:100%;text-align:left;padding:8px 0;color:#726c54;display:flex;justify-content:space-between;gap:12px}.phrase{font-size:27px;margin-bottom:6px}.keep{margin-top:16px}.remove{margin-top:32px;font-size:11px;color:#756b61}.remove button{margin-top:10px}summary{cursor:pointer;font-size:12px}.empty{padding:32px 0;color:#637574}
  .library{display:grid;gap:12px;margin:28px 0}.library button{text-align:left;display:grid;grid-template-columns:1fr auto;gap:5px 15px;padding:20px;background:#fffdf7}.library time,.library strong,.library span:first-of-type{grid-column:1;overflow-wrap:anywhere}.library strong{font:22px/1.4 Georgia,serif}.library span:first-of-type{font-size:12px;white-space:pre-wrap;max-height:3.4em;overflow:hidden}.library span:last-child{grid-column:2;grid-row:1/4;align-self:center}
  @media(max-width:600px){h2{font-size:27px}h3{font-size:25px}.notebooks{padding:20px}.note-body{font-size:16px}.prep-note,.takeaway{padding:14px}.actions{gap:8px}}
</style>
