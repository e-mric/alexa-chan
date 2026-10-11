<script>
  import { onMount, onDestroy } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import RideScene from '$lib/RideScene.svelte';
  import SessionNotes from '$lib/SessionNotes.svelte';
  import { notebookCopy } from '$lib/session-notes-copy.js';
  import { noteKey } from '$lib/session-notes.js';
  import Listen from '$lib/Listen.svelte';
  import { speech, hasRecordings } from '$lib/speech.js';
  import { audioLanguage } from '$lib/audio-copy.js';
  import { copy, languageNames } from '$lib/founders-copy.js';
  import { studentCopy } from '$lib/student-copy.js';
  import { PERSONAL_KEY, STUDENT_PERSONAL_KEY, LOCALES, brusselsDate, moveDay, formatDay, validDate, parseSnapshot, daySchedule, snapshotAge, phrases, isTodayQuestion, freshProgress, saveMemory, dueMemories, rateMemory, readPersonal, writePersonal, parseBackup, serializePersonal } from '$lib/founders.js';

  let { immersive = false, student = false } = $props();
  const storageKey = $derived(student ? STUDENT_PERSONAL_KEY : PERSONAL_KEY);
  let paused = $state(false), reduced = $state(true), fallback = $state(false), rideCard = $state('programme');
  const stopped = $derived(paused || reduced || fallback || view === 'notes');
  let noteSession = $state(null), sessionDirty = $state(false);
  let snapshot = $state(null), progress = $state(freshProgress()), loaded = $state(false), loadError = $state(false);
  let today = $state(''), selected = $state(''), now = $state(0), view = $state('day'), helper = $state(''), input = $state('');
  let notice = $state(''), feedback = $state(''), note = $state(''), revealed = $state(false), imported = $state(false), romajiHint = $state(false);
  const locale = $derived(!loaded && student ? 'en' : progress.locale), t = $derived({ ...copy[locale], ...(student ? studentCopy[locale] : {}), audioNote: hasRecordings ? copy[locale].audioNote : studentCopy[locale].deviceAudio }), voice = $derived(LOCALES[locale]);
  const schedule = $derived(daySchedule(snapshot, selected));
  const phraseId = $derived(schedule.events.some(e => /coaching/i.test(e.title)) ? 'courage' : 'step');
  const phrase = $derived(phrases[phraseId]);
  const age = $derived(snapshotAge(snapshot, today));
  const due = $derived(dueMemories(progress, now));
  const memory = $derived(due[0]);
  const noteDirty = $derived(note !== (progress.notes[selected] || ''));
  const nextDue = $derived(progress.memories.length ? Math.min(...progress.memories.map(m => m.due)) : null);
  const upcoming = $derived(snapshot ? snapshot.events.filter(e => e.date > selected && e.date <= snapshot.coverage.to).slice(0, 3) : []);
  function readBriefing() {
    if (schedule.status !== 'ready') { speech.speak(t[schedule.status], voice); return; }
    speech.play([
      { text: `${formatDay(selected, locale)}. ${t.count}: ${schedule.events.length}.`, lang: voice },
      ...schedule.events.flatMap(e => [
        { text: e.title, lang: 'en-GB' },
        { text: `${timeLabel(e)}. ${e.kind === 'break' ? t.break : t[e.attendance]}.`, lang: voice },
        { text: e.location || t.unknownLocation, lang: e.location ? 'en-GB' : voice }
      ]),
      { text: t.unverified, lang: voice },
      { text: phrase.jp, lang: 'ja-JP' }
    ]);
  }

  onMount(() => {
    today = brusselsDate(); selected = today; now = Date.now();
    try { const data = readPersonal(localStorage, storageKey); snapshot = data.snapshot; progress = data.progress; if (student && !localStorage.getItem(storageKey)) progress = { ...progress, locale: 'en' }; note = progress.notes[selected] || ''; }
    catch { loadError = true; notice = 'storageBad'; }
    loaded = true;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => reduced = media.matches;
    updateMotion(); media.addEventListener('change', updateMotion);
    const timer = setInterval(() => { now = Date.now(); today = brusselsDate(); }, 30000);
    return () => { clearInterval(timer); media.removeEventListener('change', updateMotion); };
  });
  beforeNavigate(({ cancel }) => { if (noteDirty || sessionDirty) { cancel(); notice = sessionDirty ? 'sessionDirty' : 'noteDirty'; } });
  $effect(() => { audioLanguage.set(locale); });
  onDestroy(() => { speech.stop(); audioLanguage.set('en'); });
  function commit(nextProgress = progress, nextSnapshot = snapshot) {
    if (loadError) { notice = 'storageBad'; return false; }
    try {
      writePersonal(localStorage, { snapshot: nextSnapshot, progress: nextProgress }, storageKey);
      progress = nextProgress; snapshot = nextSnapshot; now = Date.now(); return true;
    } catch { notice = 'storageBad'; return false; }
  }
  function changeLanguage(event) {
    speech.stop();
    if (!commit({ ...progress, locale: event.currentTarget.value })) event.currentTarget.value = locale;
  }
  function chooseDay(value) {
    if (noteDirty || sessionDirty) { notice = sessionDirty ? 'sessionDirty' : 'noteDirty'; return false; }
    if (!validDate(value)) return false;
    speech.stop(); selected = value; note = progress.notes[value] || ''; helper = ''; feedback = ''; notice = ''; view = 'day'; return true;
  }
  function changeView(next) {
    if (noteDirty || sessionDirty) { notice = sessionDirty ? 'sessionDirty' : 'noteDirty'; return false; }
    speech.stop(); view = next; revealed = false; romajiHint = false; notice = ''; return true;
  }
  function openNotebook(event = null) {
    if (changeView('notes')) noteSession = event;
  }
  function notebookDirty(dirty) {
    sessionDirty = dirty;
    if (!dirty && notice === 'sessionDirty') notice = '';
  }
  function sessionQuestion(event) { return progress.sessionNotes?.find(n => noteKey(n) === noteKey(event))?.question; }
  function timeLabel(event) {
    if (!event.startTime) return t.unknownTime;
    if (event.endDate !== event.date) return `${formatDay(event.date, locale)} ${event.startTime} → ${formatDay(event.endDate, locale)} ${event.endTime || ''}`;
    return `${event.startTime}${event.endTime ? `–${event.endTime}` : ''}`;
  }
  async function importFile(event, backup = false) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const target = event.currentTarget;
    if (noteDirty || sessionDirty) { notice = sessionDirty ? 'sessionDirty' : 'noteDirty'; target.value = ''; return; }
    try {
      if (file.size > (backup ? 1500000 : 512000)) throw Error('size');
      const body = await file.text();
      if (backup) {
        const data = parseBackup(body);
        if (!window.confirm(t.consentRestore)) return;
        if (commit(data.progress, data.snapshot)) { note = progress.notes[selected] || ''; notice = 'restored'; revealed = false; }
      } else {
        const data = parseSnapshot(body);
        if (commit(progress, data)) { notice = 'importGood'; imported = true; }
      }
      speech.stop();
    } catch { notice = backup ? 'restoreBad' : 'importBad'; }
    finally { target.value = ''; }
  }
  function exportBackup() {
    if (loadError) { notice = 'storageBad'; return; }
    const url = URL.createObjectURL(new Blob([serializePersonal({ snapshot, progress })], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `alexa-chan-personal-${today}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function keep(id) { if (commit(saveMemory(progress, id))) now = Date.now(); }
  function askToday(event) {
    event.preventDefault();
    if (!isTodayQuestion(input)) { feedback = 'retry'; return; }
    if (!chooseDay(today)) return;
    // The actual snapshot query is displayed even when unavailable; no fictitious success.
    const result = daySchedule(snapshot, today);
    if (result.status === 'ready') {
      commit({ ...progress, questionUsed: true });
    }
    helper = 'nante'; feedback = result.status === 'ready' ? 'success' : result.status;
    if (immersive) { rideCard = 'programme'; notice = feedback; }
  }
  function rate(rating) {
    if (!memory) return;
    speech.stop();
    try { if (commit(rateMemory(progress, memory.id, rating, Date.now()))) { revealed = false; romajiHint = false; } }
    catch { now = Date.now(); revealed = false; }
  }
  function saveNote() {
    const notes = { ...progress.notes };
    if (note.trim()) notes[selected] = note.trim(); else delete notes[selected];
    if (commit({ ...progress, notes })) { note = progress.notes[selected] || ''; notice = 'noteSaved'; }
  }
</script>

<svelte:window onbeforeunload={event => { if (noteDirty || sessionDirty) { event.preventDefault(); event.returnValue = ''; } }} />

<svelte:head>
  <title>{t.title}{immersive ? ' · Ride' : ''} · Alexa-chan</title>
  <meta name="description" content="Your day and your notes in French, Dutch, German or English, with optional Japanese along the way." />
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="founders" class:immersive class:reading-mode={view === 'notes'} lang={locale}>
  {#if immersive}
    <div class="ride-world" aria-hidden="true">
      <div class="ride-sky"></div>
      {#if !fallback}<RideScene paused={stopped} slow={!!helper || view !== 'day' || rideCard === 'note'} onfallback={() => fallback = true}/>{/if}
      <div class="ride-shade"></div>
      {#if fallback}<img class="fallback-rider" src="/images/ride-rider-courier.png" alt=""/>{/if}
    </div>
  {/if}
  <header>
    <a class="brand" href="/">ア <span>alexa-chan</span></a>
    <span class="edition">{student ? t.edition : 'alexa-chan'} <small>{t.local}</small></span>
    <div class="view-controls"><a class="view-link" href={student ? (immersive ? '/student' : '/student-ride') : (immersive ? '/founders' : '/founders-ride')}>{immersive ? t.simpleView : t.rideView} ↗</a>{#if immersive}<button aria-pressed={stopped} disabled={reduced || fallback || view === 'notes'} onclick={() => paused = !paused}>{view === 'notes' ? notebookCopy[locale].quiet : stopped ? t.resumeRide : t.pauseRide}</button>{/if}</div>
    <label class="language">{t.language}<select aria-label={t.language} value={locale} onchange={changeLanguage} disabled={!loaded || loadError}>{#each Object.entries(languageNames) as [id, label]}<option value={id}>{label}</option>{/each}</select></label>
  </header>
  <main>
    {#if immersive}<h1 class="sr-only">Alexa-chan · {t.title}</h1>{/if}
    <section class="hero">
      <div class="hero-copy"><span class="eyebrow">{student ? 'CAMPUS' : 'ALEXA-CHAN'} / 一歩ずつ</span><h1>{t.title}<span>.</span></h1><p>{t.intro}</p><span class="route-mark">BRUXELLES → 日本</span></div>
      <div class="hero-art"><img src="/images/quest-city.png" alt="" width="1536" height="1024" /><span>{t.tagline}</span></div>
    </section>
    <div class="ride-deck">
    <nav aria-label={t.title}>
      <button aria-current={view === 'day' ? 'page' : undefined} onclick={() => changeView('day')}>{t.programme}</button>
      <button aria-current={view === 'notes' ? 'page' : undefined} onclick={() => openNotebook()}>{notebookCopy[locale].title}</button>
      <button aria-current={view === 'memories' ? 'page' : undefined} onclick={() => changeView('memories')}>{t.memories} <span class="count">{progress.memories.length}</span></button>
      <button aria-current={view === 'settings' ? 'page' : undefined} onclick={() => changeView('settings')}>{t.settings}</button>
    </nav>
    {#if notice}<p class="notice" role="status">{notice === 'sessionDirty' ? notebookCopy[locale].dirty : t[notice]}</p>{/if}
    {#if snapshot && view !== 'notes'}<aside class="provenance"><span class="dot"></span><details open={!immersive}><summary><b>{t.snapshot}</b></summary><p>{t.captured} {snapshot.capturedOn} · {t.coverage} {snapshot.coverage.from} → {snapshot.coverage.to} · Europe/Brussels</p>{#if age > 7}<p class="warning">{t.stale}</p>{:else if age < 0}<p class="warning">{t.future}</p>{/if}</details><a href={snapshot.sourceUrl} target="_blank" rel="noopener noreferrer">{t.source} ↗</a></aside>{/if}

    {#if view === 'day' && !snapshot}
      <section class="welcome panel"><span class="eyebrow">ALEXA-CHAN / 一歩ずつ</span><h2>{notebookCopy[locale].startTitle}</h2><p>{notebookCopy[locale].startBody}</p><div class="actions"><button class="primary" disabled={!loaded || loadError} onclick={() => openNotebook()}>{notebookCopy[locale].create} →</button><button class="outline" onclick={() => changeView('settings')}>{t.settings}</button></div><p class="small">{notebookCopy[locale].startHint}</p></section>
    {/if}
    {#if view === 'settings'}
      <section class="settings panel"><span class="eyebrow">01 / NOTION</span><h2>{snapshot ? t.settings : t.missing}</h2><p>{t.missingBody}</p><p>{t.helpImport}</p>
        <label class="upload">{t.import}<input type="file" accept="application/json,.json" onchange={e => importFile(e)} disabled={!loaded || loadError} /></label><p class="small">{t.replace}</p>
        {#if imported && snapshot}<button class="primary" onclick={() => changeView('day')}>{t.programme} →</button>{/if}
        <hr/><h3>{t.storage}</h3><p class="small">{t.audioNote}</p>
        <div class="settings-actions"><button class="outline" onclick={exportBackup} disabled={!loaded || loadError}>{t.export}</button><label class="upload secondary">{t.restore}<input type="file" accept="application/json,.json" onchange={e => importFile(e, true)} disabled={!loaded || loadError} /></label></div><p class="small">{t.restoreHelp}</p>
        {#if snapshot}<details><summary>{t.clear}</summary><p>{t.clearHelp}</p><button class="outline" onclick={() => { if (window.confirm(t.confirmClear) && commit(progress, null)) { imported = false; notice = ''; } }}>{t.clear}</button></details>{/if}
      </section>
    {/if}

    {#if view === 'day' && snapshot}
      <div class="datebar"><div class="day-buttons"><button class:active={selected === today} onclick={() => chooseDay(today)}>{t.today}</button><button class:active={selected === moveDay(today, 1)} onclick={() => chooseDay(moveDay(today, 1))}>{t.tomorrow}</button></div><label>{t.date}<input aria-label={t.date} type="date" value={selected} onchange={e => { if (!chooseDay(e.currentTarget.value)) e.currentTarget.value = selected; }} /></label></div>
      {#if immersive}<div class="ride-tabs" aria-label={t.selected}>{#each [['programme',t.programme],['japanese',t.japanese],['note',t.note]] as [key,label]}<button aria-pressed={rideCard === key} onclick={() => { speech.stop(); rideCard = key; }}>{label}</button>{/each}</div>{/if}
      <div class="ride-card-stack">
      <div class="day-grid">
        <section class="programme" class:ride-hidden={immersive && rideCard !== 'programme'}><div class="section-heading"><div><span class="eyebrow">01 / {t.selected}</span><h2>{formatDay(selected, locale)}</h2></div></div><button class="text-button" data-audio-ui onclick={readBriefing}>♪ {t.read}</button>
          {#if schedule.status !== 'ready'}<div class="empty panel"><span aria-hidden="true">↗</span><p>{t[schedule.status]}</p><a href={snapshot.sourceUrl} target="_blank" rel="noopener noreferrer">{t.source} ↗</a></div>{/if}
          {#each schedule.events as event (event.id)}
            <article class="event panel"><div class="event-top"><span class="time">{timeLabel(event)}</span><span class="badge">{event.kind === 'break' ? t.break : t[event.attendance]}</span></div><h3 lang="en">{event.title}</h3><p class="location">⌖ {event.location || t.unknownLocation}</p>{#if event.description}<details><summary>{t.sourceEvent}</summary><p lang="en">{event.description}</p></details>{/if}<div class="event-bottom"><small>{event.phase}</small><a href={event.url} target="_blank" rel="noopener noreferrer">Notion ↗</a></div>
            {#if event.kind !== 'break'}<div class="prep"><span class="eyebrow">{sessionQuestion(event) ? notebookCopy[locale].question : t.suggestion}</span><p>{sessionQuestion(event) || t.prep}</p><Listen text={sessionQuestion(event) || t.prep} lang={voice} label={t.listen}/><button class="outline session-open" onclick={() => openNotebook(event)}>{notebookCopy[locale].open} ↗</button></div>{/if}</article>
          {/each}
          <p class="small">{t.sourceLanguage}</p>
          {#if upcoming.length}<details class="upcoming" open={!immersive}><summary>{t.programme} →</summary>{#each upcoming as event (event.id)}<button onclick={() => chooseDay(event.date)}><time>{event.date}</time><span lang="en">{event.title}</span><span>↗</span></button>{/each}</details>{/if}
        </section>
        <aside class="learning panel" class:ride-hidden={immersive && rideCard !== 'japanese'}><span class="eyebrow">02 / {t.japanese}</span><span class="kanji-watermark" aria-hidden="true">旅</span><h2 lang="ja">{phrase.jp}</h2><p class="romaji">{phrase.romaji}</p><Listen text={phrase.jp} lang="ja-JP" label={t.listenJapanese}/><div class="helpers"><button aria-pressed={helper === 'ike'} onclick={() => { speech.stop(); helper = helper === 'ike' ? '' : 'ike'; }}><b>Iké</b><small>{t.meaning}</small></button><button aria-pressed={helper === 'motto'} onclick={() => { speech.stop(); helper = helper === 'motto' ? '' : 'motto'; }}><b>Motto</b><small>{t.explain}</small></button><button aria-pressed={helper === 'nante'} onclick={() => { speech.stop(); helper = helper === 'nante' ? '' : 'nante'; }}><b>Nanté</b><small>{t.myTurn}</small></button></div>
          {#if helper === 'ike' || helper === 'motto'}<div class="help" aria-live="polite"><p>{phrase.meaning[locale]}</p><Listen text={phrase.meaning[locale]} lang={voice} label={t.listen}/>{#if helper === 'motto'}<p>{phrase.detail[locale]}</p><Listen text={phrase.detail[locale]} lang={voice} label={t.listen}/>{/if}</div>{/if}
          {#if helper === 'nante'}<div class="help"><h3>{t.practice}</h3><p class="question" lang="ja">{phrases.question.jp}</p><p class="romaji">{phrases.question.romaji}</p><Listen text={phrases.question.jp} lang="ja-JP" label={t.listenJapanese}/><p>{phrases.question.meaning[locale]}</p><Listen text={phrases.question.meaning[locale]} lang={voice} label={t.listen}/><p class="small">{t.supported}</p><form onsubmit={askToday}><label for="founder-question">{t.practice}</label><input id="founder-question" bind:value={input} autocomplete="off"/><div class="actions"><button type="button" class="outline" onclick={() => input = phrases.question.romaji}>{t.hint}</button><button class="primary" disabled={!input.trim()}>{t.ask} →</button></div></form>{#if feedback}<p role="status">{t[feedback]}</p>{/if}<button class="text-button" onclick={() => keep('question')} disabled={progress.memories.some(m => m.id === 'question')}>{progress.memories.some(m => m.id === 'question') ? t.saved : t.save}</button></div>{/if}
          <button class="keep" onclick={() => keep(phraseId)} disabled={progress.memories.some(m => m.id === phraseId)}>{progress.memories.some(m => m.id === phraseId) ? `✓ ${t.saved}` : `＋ ${t.save}`}</button>
          <p class="small">{t.audioNote}</p>
        </aside>
      </div>
      <section class="reflection panel" class:ride-hidden={immersive && rideCard !== 'note'}><div><span class="eyebrow">03 / 一歩ずつ</span><h2>{t.note}</h2><p>{t.noteHelp}</p></div><form onsubmit={e => { e.preventDefault(); saveNote(); }}><label for="founder-note">{t.note}</label><textarea id="founder-note" maxlength="2000" rows="3" bind:value={note}></textarea><div class="actions"><button class="primary" disabled={!noteDirty}>{t.noteSave}</button>{#if note}<Listen text={note} lang={voice} label={t.readNote}/>{/if}</div></form></section>
      {#if immersive}<div class="ride-next"><button onclick={() => { speech.stop(); rideCard = rideCard === 'programme' ? 'japanese' : rideCard === 'japanese' ? 'note' : 'programme'; }}>{rideCard === 'programme' ? t.japanese : rideCard === 'japanese' ? t.note : t.programme} →</button></div>{/if}
      </div>
    {:else if view === 'notes'}
      <SessionNotes {progress} session={noteSession} oncommit={commit} ondirty={notebookDirty} onback={() => changeView('day')} disabled={!loaded || loadError} {immersive}/>
    {:else if view === 'memories'}
      <section class="memory-view panel"><span class="eyebrow">{t.allMemories} / {progress.memories.length}</span><h2>{t.memories}</h2>{#if memory}<p>{t.due}: {due.length}</p><h3 lang="ja">{phrases[memory.id].jp}</h3><label class="hint-toggle"><input type="checkbox" bind:checked={romajiHint}/>{notebookCopy[locale].pronunciation}</label>{#if romajiHint || revealed}<p class="romaji">{phrases[memory.id].romaji}</p>{/if}<Listen text={phrases[memory.id].jp} lang="ja-JP" label={t.listenJapanese}/>{#if !revealed}<button class="primary" onclick={() => revealed = true}>{t.reveal}</button>{:else}<p class="meaning">{phrases[memory.id].meaning[locale]}</p><Listen text={phrases[memory.id].meaning[locale]} lang={voice} label={t.listen}/><div class="actions"><button class="outline" onclick={() => rate('again')}>{t.again}</button><button class="primary" onclick={() => rate('good')}>{t.good}</button></div>{/if}{:else}<div class="empty"><span aria-hidden="true">一歩</span><p>{progress.memories.length ? t.done : t.noCards}</p>{#if nextDue}<p>{t.nextDue}: {new Intl.DateTimeFormat(LOCALES[locale], { timeZone: 'Europe/Brussels', dateStyle: 'medium', timeStyle: 'short' }).format(nextDue)}</p>{/if}</div>{/if}</section>
    {/if}
    <footer><p>{t.storage}</p><a href="/student-mcp">Noor’s university day ↗</a></footer>
    </div>
    {#if immersive}<p class="ride-caption">{fallback ? t.staticScene : reduced ? t.reducedMotion : t.tagline} <span>{student ? 'CAMPUS' : 'ALEXA-CHAN'} → 富士山</span></p>{/if}
  </main>
</div>

<style>
  .welcome{max-width:780px;margin:24px auto}.welcome h2{font:32px/1.25 Georgia,serif}.welcome>p{max-width:560px}.hint-toggle{display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px}.hint-toggle input{padding:0}
  .session-open{display:block;margin-top:12px;width:100%;text-align:left}
  .reading-mode .hero{display:none}
  .reading-mode:not(.immersive) .ride-deck{max-width:840px;margin:32px auto}
  .immersive.reading-mode .ride-deck{width:min(840px,100%);margin:0 auto}
  .immersive.reading-mode .ride-world{opacity:.22}
  .immersive.reading-mode .ride-caption{display:none}
  .immersive.reading-mode main{padding-top:24px}
  .immersive nav{flex-wrap:wrap}
  .founders.immersive{max-width:none;padding:0}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
  .view-controls{display:flex;align-items:center;gap:12px}.view-link{font-size:12px;white-space:nowrap}.view-controls button{border:1px solid #b1c3c7;border-radius:24px;background:#193b48b0;color:white;padding:10px 16px;font-size:12px}
  .ride-world{position:fixed;inset:0;z-index:-1;overflow:hidden;background:#607e91}.ride-sky{position:absolute;inset:0;background:#405e71 url('/images/ride-fuji.png') center top/100% auto no-repeat}.ride-shade{position:absolute;inset:0;background:linear-gradient(180deg,#071e3325,transparent 45%,#101f3555)}.fallback-rider{position:absolute;left:10%;bottom:2%;height:55%;max-width:45%;object-fit:contain;object-position:bottom}
  .immersive{max-width:none;min-height:100svh;padding:0;isolation:isolate}.immersive header{padding:14px 3%;color:#fff;background:#18304175;backdrop-filter:blur(6px);border-color:#ffffff30;gap:16px}.immersive .brand span,.immersive .edition small,.immersive .view-link{color:#fff}.immersive .brand{font-size:24px}.immersive .language{margin-left:auto}.immersive select{background:#193b48d9;color:#fff;border-color:#bbcaca80}.immersive main{padding:24px 5% 80px}.immersive .hero{display:none}.immersive .ride-deck{width:clamp(380px,37vw,560px);margin-left:auto}.immersive nav{background:#173443df;border-radius:5px 15px 5px 5px;border-color:#ffffff60;padding:0 10px;gap:3px;justify-content:space-between;margin-bottom:14px}.immersive nav button{color:#d1dddb;font-size:11px}.immersive nav button[aria-current]{color:#fff1df;border-color:#ff7564}.immersive .count{color:#193743}.immersive .provenance{padding:11px 14px;gap:7px;background:#f0f1e5ed;margin-bottom:14px;flex-wrap:wrap}.immersive .provenance p{font-size:9px}.immersive .provenance a{margin-left:14px}.immersive .datebar{padding:12px;background:#173443dc;color:white;border-radius:5px;margin:0 0 12px;flex-wrap:wrap;gap:12px}.immersive .day-buttons button{color:#fff;border-color:#b2c4c6;padding:8px 12px;font-size:11px}.immersive .day-buttons button.active{background:#b6372b}.immersive .datebar label{font-size:10px}.immersive input[type=date]{padding:8px}.ride-tabs{display:flex;gap:6px;margin:12px 0}.ride-tabs button{flex:1;font-size:10px;padding:12px 6px;border:1px solid #e7e5d8a0;border-radius:6px;background:#203d49e8;color:#fff}.ride-tabs button[aria-pressed=true]{background:#fff6e8;color:#a3342a}.immersive .ride-card-stack{transform:perspective(1500px) rotateY(-5deg);transform-origin:right center}.immersive .day-grid{display:block}.immersive .programme{padding:24px;background:#f8f8eeed;border:2px solid #c44a3e;border-radius:4px 20px 4px 13px;box-shadow:0 18px 55px #142b4050}.immersive .event{padding:18px 0;border:0;border-top:1px solid #afbcbb;background:none;border-radius:0}.immersive .event h3{font-family:Georgia,serif;font-weight:400;font-size:25px}.immersive .prep{margin-top:12px;padding-top:12px}.immersive .upcoming{margin-bottom:0}.immersive .upcoming button{font-size:11px;padding:12px 0}.immersive .learning,.immersive .reflection{margin:0;background:#f8f8eeed;border:2px solid #c44a3e;border-radius:4px 20px 4px 13px}.immersive .reflection{display:block}.immersive .ride-hidden{display:none}.ride-next button{margin-top:12px;width:100%;display:block;text-align:left;padding:18px 24px;border:1px solid #fff8;border-radius:5px 15px 5px 5px;background:#e9f0efee;color:#243a47;font:12px monospace}.immersive footer{border-color:#ffffff50;gap:12px;margin-top:22px;flex-direction:column;background:#173443cf;padding:12px;border-radius:5px}.immersive footer p,.immersive footer a{color:#edf2ee}.ride-caption{position:fixed;bottom:0;left:0;right:0;padding:15px 4%;margin:0;color:#fff0db;background:linear-gradient(transparent,#152835e8);pointer-events:none;font:10px monospace;display:flex;justify-content:space-between}.immersive .settings,.immersive .memory-view{background:#fff8eeed;border:2px solid #c44a3e}
  @media(max-width:800px){.immersive header{flex-wrap:wrap;padding:15px 20px}.immersive .view-controls{margin-left:auto}.immersive .edition{display:none}.immersive .language{width:100%;justify-content:space-between}.immersive main{padding:265px 18px 75px}.immersive .ride-world{height:450px}.immersive .ride-sky{background-size:auto 100%;background-position:center top}.immersive .ride-deck{width:100%;max-width:540px;margin:auto}.immersive .ride-card-stack{transform:none}.immersive .datebar{flex-direction:row}.immersive .ride-caption span{display:none}}
  @media(prefers-reduced-motion:reduce){.immersive .ride-card-stack{transform:none}}
  :global(body){margin:0;background:#e9ede7;color:#1c3035;font-family:Arial,sans-serif} :global(*){box-sizing:border-box}
  .founders{max-width:1280px;margin:auto;padding:0 36px 50px}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.55;cursor:default}a{color:#9b332c}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid #c63c30;outline-offset:4px}
  header{display:flex;align-items:center;gap:28px;justify-content:space-between;padding:24px 0;border-bottom:1px solid #c0cbc5}.brand{font-size:28px;font-weight:800;color:#b6352b;text-decoration:none}.brand span{color:#253d43;font-size:22px;margin-left:8px}.edition{font-weight:bold}.edition small{display:block;font:9px monospace;letter-spacing:2px;margin-top:6px;color:#657674}.language{display:flex;align-items:center;gap:10px;font-size:12px}select{padding:10px;background:#f8f7f0;border:1px solid #acbbb7;border-radius:6px}.hero{display:grid;grid-template-columns:1fr .85fr;gap:48px;padding:38px 0;align-items:center}.eyebrow{font:10px/1.6 monospace;letter-spacing:1.4px;text-transform:uppercase}.hero h1{font-size:clamp(36px,4.6vw,60px);line-height:1.05;letter-spacing:-2px;margin:20px 0}.hero h1 span{color:#bd3c32}.hero p{max-width:410px;font-size:16px;line-height:1.7;color:#546b6d}.route-mark{font:10px monospace;letter-spacing:2px;display:block;margin-top:22px}.hero-art{position:relative;border:6px solid #faf8ef;transform:rotate(-1.5deg);box-shadow:8px 10px 0 #263e430b}.hero-art img{display:block;width:100%;height:235px;object-fit:cover}.hero-art>span{display:block;background:#faf8ef;padding:12px;font:11px/1.5 monospace}nav{display:flex;gap:12px;border-bottom:1px solid #bdccc7;margin-bottom:24px}nav button{background:none;border:0;padding:16px 10px;font-size:13px;color:#52696a;border-bottom:3px solid transparent}nav button[aria-current]{color:#a82f26;border-color:#bc3930}.count{font:11px monospace;background:#cad9d5;padding:3px 7px;border-radius:10px;margin-left:6px}
  p{line-height:1.65} .small{font-size:11px;color:#586e70;line-height:1.65}.notice{background:#f9e3cb;border-left:3px solid #be5734;padding:14px;font-size:13px}.provenance{display:flex;align-items:center;gap:12px;padding:14px 18px;background:#dce5df;margin-bottom:24px;border-radius:4px}.provenance b{font-size:12px}.provenance p{font:10px/1.6 monospace;margin:5px 0}.provenance a{font-size:11px;margin-left:auto;max-width:160px}.dot{width:8px;height:8px;background:#c06d32;border-radius:50%;flex-shrink:0}.warning{color:#97351f}.datebar{display:flex;justify-content:space-between;gap:20px;align-items:center;margin:24px 0}.day-buttons{display:flex;gap:8px}.day-buttons button{background:transparent;border:1px solid #aebfba;padding:10px 18px;border-radius:22px;color:#314d51}.day-buttons button.active{background:#263f46;color:#fff}.datebar label{display:flex;align-items:center;gap:10px;font-size:11px}input,textarea{padding:12px;border:1px solid #adbfb8;background:#fffef9;border-radius:4px;min-width:0}input[type=date]{font-size:12px}.day-grid{display:grid;grid-template-columns:1.35fr .85fr;gap:28px;align-items:start}.section-heading h2{font-size:22px;text-transform:capitalize;letter-spacing:-.5px;margin:8px 0}.panel{background:#faf9f1;border:1px solid #d2dcd4;border-radius:5px;padding:26px}.event{margin-top:14px}.event-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.time{font:12px/1.6 monospace;color:#a1332b}.badge{font-size:9px;padding:5px 8px;background:#e5e9df;border-radius:3px;white-space:nowrap}.event h3{font-size:22px;line-height:1.3;margin:16px 0}.location{font-size:12px;color:#5a7170}summary{font-size:12px;cursor:pointer;line-height:1.5}details p{font-size:13px;color:#52696a}.event-bottom{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:18px}.event-bottom small{font:9px monospace;color:#5b6e6d}.event-bottom a{font-size:11px}.prep{border-top:1px solid #d5dfd5;margin-top:20px;padding-top:17px}.prep p{font-size:13px;margin-bottom:0}.prep .eyebrow{color:#6c7f76;font-size:9px}.learning{position:relative;overflow:hidden;border-top:3px solid #bf3b30;margin-top:7px}.learning h2{font-size:35px;margin:50px 0 10px;position:relative}.romaji{font:13px/1.7 monospace;color:#587070}.kanji-watermark{position:absolute;right:18px;top:25px;font-size:120px;opacity:.045;pointer-events:none}.helpers{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:25px 0 12px}.helpers button{border:1px solid #a5bbb9;border-radius:5px;background:none;padding:13px 4px;color:#31484e}.helpers b{font-size:17px}.helpers small{display:block;font-size:9px;margin-top:6px}.helpers button[aria-pressed=true]{color:white;background:#b5352c;border-color:#b5352c}.help{border-left:2px solid #b5352c;padding:0 0 0 16px;margin:20px 0}.help p{font-size:13px}.help .question{font-size:25px}.help input{width:100%;margin-top:8px}.help h3{font-size:17px}.help label,.reflection label{font-size:11px;display:block}.primary,.outline,.keep{border:0;border-radius:4px;padding:13px 16px;font-size:12px;line-height:1.5}.primary{background:#b5352c;color:#fff}.outline{border:1px solid #a8beb8;background:transparent;color:#28464a}.keep{background:#e3ebe2;color:#294841;width:100%;margin-top:18px;text-align:left}.actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px}.text-button{background:none;border:0;color:#9b332c;padding:10px 0;font-size:12px}.upcoming{margin:28px 0}.upcoming button{display:flex;gap:12px;align-items:center;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid #bdccc7;padding:15px 0;color:#314d51;font-size:12px}.upcoming time{font:10px monospace;flex-shrink:0}.upcoming button span:last-child{margin-left:auto}.reflection{display:grid;grid-template-columns:1fr 1.2fr;gap:36px;margin-top:30px}.reflection h2{font-size:22px}.reflection p{font-size:13px;color:#607471}.reflection textarea{width:100%;resize:vertical;margin-top:8px}.settings{max-width:780px;margin:20px auto}.settings h2{font-size:28px}.settings h3{font-size:15px;line-height:1.7;font-weight:400}.settings p{font-size:13px}.upload{display:block;font-size:13px;margin-top:20px;font-weight:bold}.upload input{display:block;width:100%;margin-top:10px;font-size:12px}.settings-actions{display:flex;gap:14px;flex-wrap:wrap;align-items:start}.settings-actions .upload{margin-top:0;font-weight:400}.settings-actions .upload input{max-width:320px}hr{border:0;border-top:1px solid #cad7cc;margin:30px 0}.empty{padding:28px 0}.empty.panel{padding:30px}.empty>span{font-size:48px;color:#b4342d}.empty p{font-size:14px}.empty a{font-size:12px}.memory-view{max-width:660px;margin:30px auto;text-align:center;padding:45px}.memory-view h3{font-size:42px;margin:45px 0 12px}.memory-view>.primary{display:block;margin:30px auto}.memory-view .actions{justify-content:center}.meaning{font-size:22px}.memory-view .empty{padding:35px 0}footer{border-top:1px solid #bfcfc7;margin-top:40px;padding:20px 0;display:flex;justify-content:space-between;gap:30px}footer p{font-size:10px;max-width:650px;color:#607573;margin:0}footer a{font-size:11px;white-space:nowrap}
  @media(max-width:800px){.founders{padding:0 18px 60px}header{flex-wrap:wrap;gap:15px}.edition{font-size:12px}.language{width:100%;justify-content:space-between}.hero{gap:20px;grid-template-columns:1fr;padding:25px 0}.hero-art img{height:180px}.hero-art{max-width:500px}.hero h1{font-size:40px;letter-spacing:-1.5px}.hero p{font-size:14px}nav{gap:0;justify-content:space-between}nav button{font-size:11px;padding:14px 5px}.provenance{flex-wrap:wrap}.provenance a{margin-left:20px;max-width:none}.datebar{align-items:start;flex-direction:column;gap:14px}.datebar label{width:100%;justify-content:space-between}.day-grid,.reflection{grid-template-columns:1fr;gap:20px}.learning{margin-top:0}.learning h2{margin-top:28px}.panel{padding:22px}.event h3{font-size:20px}.event-top{flex-wrap:wrap}.reflection{margin-top:20px}.memory-view{padding:28px 20px}.memory-view h3{font-size:33px}footer{flex-direction:column;gap:12px}}
</style>
