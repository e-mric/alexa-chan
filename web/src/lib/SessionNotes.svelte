<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { phrases, LOCALES, saveMemory, formatDay, brusselsDate, validDate } from './founders.js';
  import { MAX_NOTE_LENGTH, noteKey, saveSessionNote, readNoteFile } from './session-notes.js';
  import { notebookCopy } from './session-notes-copy.js';
  import { copy } from './founders-copy.js';
  import { studentCopy, interfaceLocale } from './student-copy.js';
  import { journeyCopy } from './journey-copy.js';
  import { speech, hasRecordings } from './speech.js';
  import Listen from './Listen.svelte';
  import Torii from './Torii.svelte';
  import { renderNoteMarkdown } from './note-markdown.js';
  import NotePhraseCard from './NotePhraseCard.svelte';
  import { focusedListening, audioTools, openAudioTools } from './audio-copy.js';
  let { progress, student = false, session = null, oncommit, ondirty, onback, onfocus = () => {}, disabled = false, immersive = false } = $props();
  let active = $state(null), mode = $state('read'), body = $state(''), question = $state(''), takeaway = $state('');
  let japanese = $state(false), status = $state(''), busy = $state(false);
  let formatted = $state(true);
  let creating = $state(false), newTitle = $state(''), newDate = $state('');
  let readerElement = $state(), studyElement = $state();
  let returnTarget, readerScroll = 0;
  const focused = $derived(student && !!active);
  const locale = $derived(interfaceLocale(student, progress.locale)), journey = $derived(journeyCopy[locale]), t = $derived({ ...notebookCopy[locale], ...(student ? { title: journey.notebook, intro: journey.intro, empty: journey.empty, programme: journey.today } : {}) }), common = $derived({ ...copy[locale], audioNote: hasRecordings ? copy[locale].audioNote : studentCopy[locale].deviceAudio });
  const records = $derived([...(progress.sessionNotes || [])].sort((a,b) => b.date.localeCompare(a.date) || b.updatedAt-a.updatedAt));
  const saved = $derived(active ? records.find(n => noteKey(n) === noteKey(active)) : null);
  const dirty = $derived((creating && !!newTitle) || (!!active && (body !== (saved?.body || '') || question !== (saved?.question || '') || takeaway !== (saved?.takeaway || ''))));
  const phrase = $derived(saved ? phrases[saved.phraseId] : null);
  $effect(() => { ondirty(dirty || busy); });
  $effect(() => { onfocus(focused); });
  $effect(() => { focusedListening.set(focused); });
  onMount(() => { if (session) open(session); });
  onDestroy(() => { speech.stop(); ondirty(false); onfocus(false); focusedListening.set(false); audioTools.set({ open: false, trigger: null }); });
  async function openStudy(event) {
    if (!saved || !phrase || dirty || busy) return;
    speech.stop(); returnTarget = event.currentTarget; readerScroll = window.scrollY;
    if (status === 'saved' || status === 'phraseSaved') status = '';
    japanese = true;
    await tick(); window.scrollTo({ top: 0, behavior: 'instant' });
    studyElement?.querySelector('h2')?.focus({ preventScroll: true });
  }
  async function backToNote() {
    speech.stop(); japanese = false;
    await tick(); window.scrollTo({ top: readerScroll, behavior: 'instant' });
    returnTarget?.focus({ preventScroll: true });
  }
  function keepPhrase() {
    if (disabled || !saved) return;
    try { if (!oncommit(saveMemory(progress, saved.phraseId))) throw Error('save'); status = 'phraseSaved'; }
    catch { status = 'failed'; }
  }
  async function editNote() {
    speech.stop(); mode = 'edit'; japanese = false; status = '';
    await tick(); document.getElementById('session-body')?.focus();
  }
  async function openAtTop(next) {
    open(next);
    if (!student || dirty || busy) return;
    await tick(); window.scrollTo({ top: 0, behavior: 'instant' });
    readerElement?.querySelector('h3')?.focus({ preventScroll: true });
  }
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
  async function save() {
    try {
      if (!oncommit(saveSessionNote(progress, active, { body, question, takeaway }))) throw Error('save');
      speech.stop(); mode = 'read'; japanese = false; status = 'saved';
      if (student) {
        await tick(); window.scrollTo({ top: 0, behavior: 'instant' });
        readerElement?.querySelector('h3')?.focus({ preventScroll: true });
      }
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

<section class="notebooks" class:student-notes={student} class:focus-notebook={focused} aria-label={t.title}>
  {#if focused}
    <div class="focus-brand"><a href="/" aria-label="Alexa-chan home"><span aria-hidden="true"></span>alexa-chan</a>{#if saved && mode === 'read'}<button class="study-entry" hidden={japanese} onclick={openStudy}><Torii/> A little Japanese</button>{/if}</div>
  {:else}
    <div class="notebook-heading"><div>{#if !student}<span class="eyebrow">ALEXA-CHAN / NOTES</span>{/if}<h2>{t.title}</h2></div><button onclick={onback}>{t.programme} <Torii/></button></div>
    {#if immersive}<p class="quiet">{t.quiet}</p>{/if}
  {/if}
  {#if status && status !== 'saved' && status !== 'phraseSaved'}<p class="status" role="status">{t[status]}</p>{/if}
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
    {#if records.length}<div class="collection-heading"><span>{journey.library}</span><span>{records.length}</span></div>{/if}
    <div class="library">{#each records as record, index (noteKey(record))}<button onclick={() => openAtTop(record)}>{#if !student}<div class="notebook-cover" aria-hidden="true" style={`background-position:${20 + index % 4 * 20}% center`}><span>NOTE / {String(index + 1).padStart(2, '0')}</span></div>{/if}<div class="notebook-meta"><time>{formatDay(record.date, locale)}</time><strong>{record.title}</strong><p>{record.takeaway || record.question || record.body.slice(0, 110) || t.original}</p><span class="open-mark"><Torii/></span></div></button>{/each}</div>
  {:else}
    <div class="note-reader" hidden={student && japanese} bind:this={readerElement}>
    {#if student}
      <div class="reader-toolbar"><button class="back" onclick={library}>← Back to notes</button><div class="reader-actions">
        {#if mode === 'read'}<button class="edit" onclick={editNote}>Edit</button>{#if saved?.body}<Listen text={saved.body} lang={LOCALES[locale]} label="Listen to your note"/>{/if}{/if}
        <details class="more"><summary>More</summary><div class="more-options">
          <button onclick={event => { const menu = event.currentTarget.closest('details'); menu.open = false; openAudioTools(menu.querySelector('summary')); }}>Listening tools</button>
          {#if mode === 'read' && saved?.body}<div class="reading-options" role="group" aria-label="Note presentation"><button aria-pressed={formatted} onclick={() => { speech.stop(); formatted = true; }}>Formatted</button><button aria-pressed={!formatted} onclick={() => { speech.stop(); formatted = false; }}>Original text</button></div>{/if}
          <p>{common.audioNote}</p><p>{t.privacy}</p>
          {#if saved}<button class="delete" onclick={remove} disabled={disabled}>{t.remove}</button>{/if}
        </div></details>
      </div></div>
    {:else}<button class="back" onclick={library}>← {t.back}</button>{/if}
    <header><time>{formatDay(active.date, locale)}</time><h3 tabindex="-1">{active.title}</h3></header>
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
        {#if saved.question}<section class="prep-note"><h4>{t.question}</h4><p class="literal">{saved.question}</p></section>{/if}
        <section class="original"><h4>{t.original}</h4>
          {#if student && formatted && saved.body}<div class="markdown note-body" data-testid="formatted-session-notes">{@html renderNoteMarkdown(saved.body)}</div>{:else}<div class="literal note-body" data-testid="original-session-notes">{saved.body || t.noBody}</div>{/if}
        </section>
        {#if saved.takeaway}<section class="takeaway"><h4>{t.takeaway}</h4><p class="literal">{saved.takeaway}</p></section>{/if}
      </div>
      {#if student}
        <div class="reader-end"><button class="study-entry" onclick={openStudy}><Torii/> A little Japanese</button><span>Optional. Your notes stay unchanged.</span></div>
        <p class="save-state">{t.saved}</p>
      {:else}
      <div class="actions"><button onclick={editNote}>{t.edit}</button>{#if saved.body}<Listen text={saved.body} lang={LOCALES[locale]} label={common.readNote}/>{/if}</div>
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
    </div>
    {#if student && japanese && phrase && saved}<div bind:this={studyElement}><NotePhraseCard {phrase} saved={progress.memories.some(m => m.id === saved.phraseId)} {disabled} onkeep={keepPhrase} onback={backToNote}/></div>{/if}
  {/if}
  {#if !focused}<p class="privacy">{t.privacy}</p>{/if}
</section>

<style>
  .new-notebook{max-width:540px;padding:0 0 24px}.new-notebook input{display:block;width:100%;box-sizing:border-box;padding:12px;border:1px solid var(--border);border-radius:5px;background:var(--surface);color:var(--ink)}
  .notebooks{background:var(--paper);color:var(--ink);padding:clamp(20px,4vw,48px);border:1px solid var(--line);border-top:3px solid var(--signal);border-radius:5px 18px 5px 5px;box-shadow:0 16px 60px #142b4020;line-height:1.7}
  .notebook-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.eyebrow,time,.quiet{font:12px/1.7 monospace;color:var(--muted)}.eyebrow{letter-spacing:1.4px}h2{font:32px/1.2 Georgia,serif;margin:8px 0}header{border-bottom:1px solid var(--line);margin:24px 0}h3{font:30px/1.25 Georgia,serif;margin:8px 0 24px;overflow-wrap:anywhere}h4{font:12px/1.7 monospace;letter-spacing:.6px;text-transform:uppercase;color:var(--muted);margin:0 0 12px}
  button,input,textarea{font:inherit}button{cursor:pointer;border:1px solid var(--border);border-radius:5px;padding:10px 14px;background:transparent;color:var(--ink);font-size:13px;min-height:var(--control-target);min-width:var(--control-target)}button:disabled{opacity:.5;cursor:default}button:focus-visible,textarea:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid var(--focus);outline-offset:3px}.primary{background:var(--signal);color:var(--paper);border-color:var(--signal)}.back{border:0;padding-left:0;color:var(--action-ink)}.quiet{border-left:2px solid var(--signal);padding-left:12px}.status{background:var(--warning-bg);border-left:3px solid var(--signal);padding:12px;font-size:13px}
  label{display:block;font-weight:bold;font-size:13px;margin:24px 0 8px}textarea{width:100%;resize:vertical;box-sizing:border-box;line-height:1.7;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:5px;color:var(--ink)}#session-body{font-family:monospace;font-size:14px}.file-label{font-weight:normal}.file-label input{display:block;margin-top:10px;max-width:100%;font-size:12px}.length{display:block;text-align:right;font:12px monospace;color:var(--muted)}.small,.privacy{font-size:12px;color:var(--muted);line-height:1.7}.privacy{border-top:1px solid var(--line);margin-top:28px;padding-top:16px}.actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:20px 0}.actions small{color:var(--action-ink)}.literal{white-space:pre-wrap;overflow-wrap:anywhere;margin:0}.note-body{font:18px/1.9 Georgia,serif;min-height:80px}.original{padding:24px 0 28px}.prep-note,.takeaway{background:var(--surface-soft);border-left:2px solid var(--border);padding:18px 22px}.japanese{margin-top:30px;border-top:1px solid var(--line);padding-top:16px}.optional{border:0;width:100%;text-align:left;padding:10px 0;color:var(--muted);display:flex;justify-content:space-between;gap:12px}.phrase{font-size:27px;margin-bottom:6px}.keep{margin-top:16px}.remove{margin-top:32px;font-size:12px;color:var(--muted)}.remove button{margin-top:10px}summary{cursor:pointer;font-size:13px;min-height:var(--control-target);padding:10px 0}.empty{padding:32px 0;color:var(--muted)}
  .collection-heading{display:flex;justify-content:space-between;margin:32px 0 12px;font:12px monospace;color:var(--muted)}.library{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:14px 0 28px}.library button{text-align:left;display:block;padding:0;border:1px solid var(--line);border-radius:9px;overflow:hidden;background:var(--surface);transition:border-color .15s}.library button:hover{border-color:var(--signal)}.notebook-cover{height:94px;background:linear-gradient(#162c3810,#162c3870),url('/images/quest-city-cover.webp');background-size:cover;display:flex;align-items:end;padding:12px}.notebook-cover span{font:10px monospace;color:var(--paper);background:var(--ink);padding:3px 6px;border-radius:3px;letter-spacing:1px}.notebook-meta{position:relative;padding:18px}.notebook-meta strong{display:block;font:20px/1.3 Georgia,serif;margin:8px 20px 10px 0;overflow-wrap:anywhere}.notebook-meta p{font-size:13px;line-height:1.6;color:var(--muted);margin:0;white-space:pre-wrap;overflow-wrap:anywhere;max-height:3.2em;overflow:hidden}.open-mark{position:absolute;top:20px;right:18px;color:var(--action-ink)}.reading,.note-reader>header{max-width:var(--reading-width);margin-left:auto;margin-right:auto}.note-reader>.actions,.note-reader>.japanese{max-width:var(--reading-width);margin-left:auto;margin-right:auto}
  @media(max-width:600px){h2{font-size:27px}h3{font-size:25px}.notebooks{padding:20px}.note-body,.reading .note-body{font-size:16px}.prep-note,.takeaway{padding:14px}.actions{gap:8px}.library{grid-template-columns:1fr}.notebook-cover{height:80px}}
  @media(prefers-reduced-motion:reduce){.library button{transition:none}}
  .reading-options{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px}.reading-options button[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
  .markdown{overflow-wrap:anywhere}.markdown :global(h5),.markdown :global(h6){font-family:Georgia,serif;line-height:1.3;margin:1.6em 0 .6em;color:var(--ink)}.markdown :global(h5){font-size:25px}.markdown :global(h6){font-size:21px}.markdown :global(> :first-child){margin-top:0}.markdown :global(p){margin:.8em 0}.markdown :global(ul),.markdown :global(ol){padding-left:1.5em}.markdown :global(li){margin:.3em 0}.markdown :global(blockquote){margin:1.3em 0;padding:12px 18px;background:var(--surface-soft);border-left:1px solid var(--border)}.markdown :global(pre){max-width:100%;overflow:auto;padding:16px;background:var(--ink);color:var(--paper);border-radius:6px;line-height:1.6}.markdown :global(code){font:14px/1.6 monospace;overflow-wrap:anywhere}.markdown :global(:not(pre)>code){background:var(--surface-soft);padding:2px 4px;border-radius:3px}.markdown :global(a){color:var(--action-ink);text-underline-offset:3px}.markdown :global(a:focus-visible){outline:3px solid var(--focus);outline-offset:3px}.markdown :global(table){display:block;max-width:100%;overflow:auto;border-collapse:collapse;font:14px/1.6 Arial,sans-serif}.markdown :global(th),.markdown :global(td){border:1px solid var(--border);padding:8px 12px;min-width:100px;text-align:left}.markdown :global(hr){border:0;border-top:1px solid var(--border);margin:24px 0}.markdown :global(.note-image){font:12px/1.6 Arial,sans-serif;color:var(--muted)}
  .student-notes .library button{border-radius:14px}.student-notes .notebook-meta{padding:24px}.student-notes .notebook-meta strong{font-size:24px}.student-notes .notebook-meta p{min-height:3.2em}
  .focus-notebook{padding:0;border:0;border-radius:0;box-shadow:none;min-height:100svh;background:var(--paper)}
  .focus-brand{position:sticky;top:0;z-index:3;background:var(--paper);display:flex;justify-content:space-between;gap:16px;align-items:center;min-height:84px;padding:16px 32px;border-bottom:1px solid var(--line)}
  .focus-brand>a{display:inline-flex;align-items:center;gap:10px;font-size:23px;font-weight:bold;letter-spacing:-.7px;text-decoration:none;color:var(--ink);min-height:var(--control-target)}.focus-brand>a>span{width:14px;height:14px;border-radius:50%;background:var(--signal)}
  .study-entry{display:inline-flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--signal);color:var(--action-ink);border-radius:8px;font-size:14px;background:transparent}.study-entry:hover{background:var(--surface-soft)}
  .reader-toolbar{display:flex;justify-content:space-between;gap:16px;align-items:center;background:var(--paper);border-bottom:1px solid var(--line);padding:10px 32px;min-height:66px}.reader-toolbar .back{font-size:14px;color:var(--ink)}
  .reader-actions{display:flex;align-items:center;gap:8px}.reader-actions>.edit{border:0;font-size:14px}.more{position:relative}.more>summary{font-size:14px;padding:10px;min-width:70px}.more-options{position:absolute;right:0;top:100%;width:min(310px,calc(100vw - 32px));padding:20px;border:1px solid var(--border);background:var(--surface);border-radius:12px;z-index:3}.more-options p{font-size:12px;line-height:1.7;margin:14px 0;color:var(--muted)}.more-options .reading-options{margin:0;gap:6px}.more-options .reading-options button{font-size:12px;padding:8px}.delete{color:var(--action-ink);width:100%;text-align:left}
  .focus-notebook .note-reader>header{max-width:var(--reading-width);margin:48px auto 0;padding:0 24px 28px;border-bottom:1px solid var(--line)}.focus-notebook h3{font-size:clamp(30px,4vw,42px);margin:12px 0 0;letter-spacing:-.025em;text-wrap:balance}.focus-notebook h3:focus{outline:none}
  .focus-notebook .reading{max-width:var(--reading-width);padding:0 24px}.focus-notebook .original{padding:28px 0 36px}.student-notes .original>h4{display:none}.focus-notebook .note-body{font:18px/1.85 Arial,"Noto Sans JP",sans-serif}
  .focus-notebook .prep-note,.focus-notebook .takeaway{margin:28px 0;padding:0;background:none;border:0}.focus-notebook h4{font:600 17px/1.5 Arial,sans-serif;letter-spacing:0;text-transform:none;color:var(--ink)}
  .focus-notebook .markdown :global(h5),.focus-notebook .markdown :global(h6){font-family:Georgia,serif}.focus-notebook .markdown :global(li::marker){color:var(--signal)}
  .focus-notebook form{max-width:var(--reading-width);margin:28px auto;padding:0 24px}.focus-notebook .note-reader>form>label:first-child{margin-top:0}
  .reader-end,.save-state{max-width:var(--reading-width);margin:24px auto;padding:0 24px}.reader-end{display:flex;align-items:center;gap:16px;border-top:1px solid var(--line);padding-top:24px;flex-wrap:wrap}.reader-end>span,.save-state{font-size:12px;color:var(--muted)}.save-state{padding-bottom:32px}.focus-notebook .status{margin:16px 24px}
  .note-reader[hidden],.study-entry[hidden]{display:none}.focus-notebook :global(.study){padding-top:16px}
  .focus-notebook ::selection{background:var(--surface-soft);color:var(--ink)}.focus-notebook textarea{caret-color:var(--signal)}.focus-notebook .note-body{scrollbar-color:var(--border) var(--paper)}
  @media(max-width:600px){.focus-brand{padding:12px 16px;gap:12px;min-height:76px}.focus-brand>a{font-size:20px}.focus-brand .study-entry{font-size:12px;padding:8px}.reader-toolbar{padding:8px 12px;gap:4px;align-items:start;flex-wrap:wrap}.reader-actions{gap:0}.reader-toolbar .back{font-size:13px}.focus-notebook .note-reader>header{margin-top:32px;padding:0 20px 24px}.focus-notebook .reading,.focus-notebook form{padding-left:20px;padding-right:20px}.focus-notebook .note-body{font-size:17px}.focus-notebook .more-options{position:fixed;top:auto;right:16px}.reader-end,.save-state{padding-left:20px;padding-right:20px}.student-notes .notebook-meta{padding:20px}}
</style>
