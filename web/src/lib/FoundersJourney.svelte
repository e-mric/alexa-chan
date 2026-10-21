<script>
  import { onMount, onDestroy } from 'svelte';
  import { beforeNavigate, goto } from '$app/navigation';
  import RideScene from '$lib/RideScene.svelte';
  import SessionNotes from '$lib/SessionNotes.svelte';
  import JourneyNav from '$lib/JourneyNav.svelte';
  import { journeyCopy } from '$lib/journey-copy.js';
  import { notebookCopy } from '$lib/session-notes-copy.js';
  import { noteKey } from '$lib/session-notes.js';
  import Listen from '$lib/Listen.svelte';
  import Torii from '$lib/Torii.svelte';
  import { speech, hasRecordings } from '$lib/speech.js';
  import { audioLanguage } from '$lib/audio-copy.js';
  import { copy, languageNames } from '$lib/founders-copy.js';
  import { studentCopy, interfaceLocale } from '$lib/student-copy.js';
  import { PERSONAL_KEY, STUDENT_PERSONAL_KEY, LOCALES, brusselsDate, moveDay, formatDay, validDate, parseSnapshot, daySchedule, snapshotAge, phrases, isTodayQuestion, freshProgress, saveMemory, dueMemories, rateMemory, readPersonal, writePersonal, parseBackup, serializePersonal } from '$lib/founders.js';

  let { immersive = false, student = false } = $props();
  const storageKey = $derived(student ? STUDENT_PERSONAL_KEY : PERSONAL_KEY);
  let paused = $state(false), reduced = $state(true), fallback = $state(false), rideCard = $state('programme');
  const stopped = $derived(paused || reduced || fallback || view === 'notes' || (student && view !== 'day'));
  let noteSession = $state(null), sessionDirty = $state(false), noteFocused = $state(false);
  let snapshot = $state(null), progress = $state(freshProgress()), loaded = $state(false), loadError = $state(false);
  let today = $state(''), selected = $state(''), now = $state(0), view = $state('day'), helper = $state(''), input = $state('');
  let notice = $state(''), feedback = $state(''), note = $state(''), revealed = $state(false), imported = $state(false), romajiHint = $state(false);
  const locale = $derived(interfaceLocale(student, progress.locale)), t = $derived({ ...copy[locale], ...(student ? studentCopy[locale] : {}), audioNote: hasRecordings ? copy[locale].audioNote : studentCopy[locale].deviceAudio }), voice = $derived(LOCALES[locale]);
  const journey = $derived(journeyCopy[locale]);
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
    if (student) view = 'notes';
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
  <meta name="description" content="Your day and study notes in English, with optional Japanese along the way." />
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="founders" class:immersive class:student-mode={student} class:note-focused={student && view === 'notes' && noteFocused} class:reading-mode={view === 'notes' || (student && view !== 'day')} lang={locale}>
  {#if immersive}
    <div class="ride-world" aria-hidden="true">
      <div class="ride-sky"></div>
      {#if !fallback}<RideScene paused={stopped} slow={!!helper || view !== 'day' || rideCard === 'note'} onfallback={() => fallback = true}/>{/if}
      <div class="ride-shade"></div>
      {#if fallback}<img class="fallback-rider" src="/images/ride-rider-courier.webp" alt=""/>{/if}
    </div>
  {/if}
  <header>
    <a class="brand" href="/">{#if student}<span class="brand-dot" aria-hidden="true"></span>{:else}ア{/if} <span>alexa-chan</span></a>
    <span class="edition">{student ? t.edition : 'alexa-chan'} <small>{t.local}</small></span>
    {#if student}<button class="settings-link" onclick={() => changeView('settings')}>{journey.settings}</button>{/if}
    <div class="view-controls"><a class="view-link" href={student ? (immersive ? '/student' : '/student-ride') : (immersive ? '/founders' : '/founders-ride')}>{immersive ? t.simpleView : t.rideView} <Torii/></a>{#if immersive}<button aria-pressed={stopped} disabled={reduced || fallback || view === 'notes'} onclick={() => paused = !paused}>{view === 'notes' ? notebookCopy[locale].quiet : stopped ? t.resumeRide : t.pauseRide}</button>{/if}</div>
    {#if !student}<label class="language">{t.language}<select aria-label={t.language} value={locale} onchange={changeLanguage} disabled={!loaded || loadError}>{#each Object.entries(languageNames) as [id, label]}<option value={id}>{label}</option>{/each}</select></label>{:else}<span class="language-pair">English → <span lang="ja">日本語</span></span>{/if}
  </header>
  <main>
    {#if immersive || student}<h1 class="sr-only">Alexa-chan · {t.title}</h1>{/if}
    {#if !student && !immersive}<section class="hero">
      <div class="hero-copy"><span class="eyebrow">{student ? 'CAMPUS' : 'ALEXA-CHAN'} / 一歩ずつ</span><h1>{t.title}<span>.</span></h1><p>{t.intro}</p><span class="route-mark">BRUXELLES → 日本</span></div>
      <div class="hero-art"><img src="/images/quest-city.png" alt="" width="1536" height="1024" /><span>{t.tagline}</span></div>
    </section>{/if}
    <div class="ride-deck">
    {#if student}
    <div class="journey-navigation"><JourneyNav active={view === 'notes' ? 'notes' : view === 'memories' ? 'memories' : ''} labels={journey} count={progress.memories.length}
      todayHref="/" onnotes={() => openNotebook()} onmemories={() => changeView('memories')}/>
    <div class="private-label">{journey.private}</div></div>
    {:else}<nav aria-label={t.title}>
      <button aria-current={view === 'day' ? 'page' : undefined} onclick={() => changeView('day')}>{t.programme}</button>
      <button aria-current={view === 'notes' ? 'page' : undefined} onclick={() => openNotebook()}>{notebookCopy[locale].title}</button>
      <button aria-current={view === 'memories' ? 'page' : undefined} onclick={() => changeView('memories')}>{t.memories} <span class="count">{progress.memories.length}</span></button>
      <button aria-current={view === 'settings' ? 'page' : undefined} onclick={() => changeView('settings')}>{t.settings}</button>
    </nav>{/if}
    {#if notice}<p class="notice" role="status">{notice === 'sessionDirty' ? notebookCopy[locale].dirty : t[notice]}</p>{/if}
    {#if snapshot && view !== 'notes'}<aside class="provenance"><span class="dot"></span><details open={!immersive}><summary><b>{t.snapshot}</b></summary><p>{t.captured} {snapshot.capturedOn} · {t.coverage} {snapshot.coverage.from} → {snapshot.coverage.to} · Europe/Brussels</p>{#if age > 7}<p class="warning">{t.stale}</p>{:else if age < 0}<p class="warning">{t.future}</p>{/if}</details><a href={snapshot.sourceUrl} target="_blank" rel="noopener noreferrer">{t.source} ↗</a></aside>{/if}

    {#if view === 'day' && !snapshot}
      <section class="welcome panel"><span class="eyebrow">ALEXA-CHAN / 一歩ずつ</span><h2>{notebookCopy[locale].startTitle}</h2><p>{notebookCopy[locale].startBody}</p><div class="actions"><button class="primary" disabled={!loaded || loadError} onclick={() => openNotebook()}>{notebookCopy[locale].create} →</button><button class="outline" onclick={() => changeView('settings')}>{t.settings}</button></div><p class="small">{notebookCopy[locale].startHint}</p></section>
    {/if}
    {#if view === 'settings'}
      <section class="settings panel">
        {#if student}<h2>{journey.settings}</h2><p>Keep a backup before changing browser or device. Your notes stay on this browser; no calendar connection is needed.</p>
        {:else}<span class="eyebrow">01 / NOTION</span><h2>{snapshot ? t.settings : t.missing}</h2><p>{t.missingBody}</p><p>{t.helpImport}</p>
        <label class="upload">{t.import}<input type="file" accept="application/json,.json" onchange={e => importFile(e)} disabled={!loaded || loadError} /></label><p class="small">{t.replace}</p>
        {#if imported && snapshot}<button class="primary" onclick={() => changeView('day')}>{t.programme} →</button>{/if}
        {/if}
        <hr/><h3>{student ? 'Privacy & storage' : t.storage}</h3>{#if student}<p>{t.storage}</p>{/if}<p class="small">{t.audioNote}</p>
        <div class="settings-actions"><button class="outline" onclick={exportBackup} disabled={!loaded || loadError}>{t.export}</button><label class="upload secondary">{t.restore}<input type="file" accept="application/json,.json" onchange={e => importFile(e, true)} disabled={!loaded || loadError} /></label></div><p class="small">{student ? 'Restore replaces your saved personal data on this browser. Older language preferences stay in the backup; this student interface remains English.' : t.restoreHelp}</p>
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
      <SessionNotes {progress} {student} session={noteSession} oncommit={commit} ondirty={notebookDirty} onfocus={value => noteFocused = value} onback={() => student && !snapshot ? goto('/') : changeView('day')} disabled={!loaded || loadError} {immersive}/>
    {:else if view === 'memories'}
      <section class="memory-view panel"><span class="eyebrow">{t.allMemories} / {progress.memories.length}</span><h2>{student ? journey.memories : t.memories}</h2>{#if student}<p class="small">{journey.personalMemories}</p>{/if}{#if memory}<p>{t.due}: {due.length}</p><h3 lang="ja">{phrases[memory.id].jp}</h3><label class="hint-toggle"><input type="checkbox" bind:checked={romajiHint}/>{notebookCopy[locale].pronunciation}</label>{#if romajiHint || revealed}<p class="romaji">{phrases[memory.id].romaji}</p>{/if}<Listen text={phrases[memory.id].jp} lang="ja-JP" label={t.listenJapanese}/>{#if !revealed}<button class="primary" onclick={() => revealed = true}>{t.reveal}</button>{:else}<p class="meaning">{phrases[memory.id].meaning[locale]}</p><Listen text={phrases[memory.id].meaning[locale]} lang={voice} label={t.listen}/><div class="actions"><button class="outline" onclick={() => rate('again')}>{t.again}</button><button class="primary" onclick={() => rate('good')}>{t.good}</button></div>{/if}{:else}<div class="empty"><span aria-hidden="true">一歩</span><p>{progress.memories.length ? t.done : t.noCards}</p>{#if nextDue}<p>{t.nextDue}: {new Intl.DateTimeFormat(LOCALES[locale], { timeZone: 'Europe/Brussels', dateStyle: 'medium', timeStyle: 'short' }).format(nextDue)}</p>{/if}</div>{/if}</section>
    {/if}
    <footer><p>{t.storage}</p><a href="/student-mcp">Kaela’s university day <Torii/></a></footer>
    </div>
    {#if immersive}<p class="ride-caption">{fallback ? t.staticScene : reduced ? t.reducedMotion : t.tagline} <span>{student ? 'CAMPUS' : 'ALEXA-CHAN'} → 富士山</span></p>{/if}
  </main>
</div>

<style>
  .student-mode .hero{display:none}.student-mode .brand{display:flex;align-items:center;gap:10px}.student-mode .brand span{margin-left:0;font-size:24px;letter-spacing:-.8px}.student-mode .brand .brand-dot{display:block;width:11px;height:11px;background:#e65343;border-radius:50%;flex-shrink:0}.student-mode header{gap:18px}.student-mode .ride-deck{padding-bottom:30px}
  .settings-link{border:0;background:transparent;font-size:12px;color:var(--muted);padding:10px;min-height:var(--control-target)}.immersive .settings-link{color:var(--paper)}.private-label{padding:10px 12px;background:var(--paper);border-radius:6px;font:11px monospace;letter-spacing:1.3px;color:var(--muted);margin:0 4px 14px}.immersive .private-label{color:var(--paper);background:var(--ink)}.reading-mode main{padding-bottom:75px}.reading-mode .ride-deck{margin-top:24px}.reading-mode:not(.immersive) .ride-deck{max-width:900px}.reading-mode.immersive .ride-deck{width:min(900px,100%)}
  .welcome{max-width:780px;margin:24px auto}.welcome h2{font:32px/1.25 Georgia,serif}.welcome>p{max-width:560px}.hint-toggle{min-height:var(--control-target);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px}.hint-toggle input{padding:0}
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
  .view-controls{display:flex;align-items:center;gap:12px}.view-link{gap:8px;display:inline-flex;align-items:center;min-height:var(--control-target);font-size:12px;white-space:nowrap}.view-controls button{border:1px solid var(--border);border-radius:24px;background:var(--ink);color:var(--paper);padding:10px 16px;font-size:12px}
  .ride-world{position:fixed;inset:0;z-index:-1;overflow:hidden;background:#607e91}.ride-sky{position:absolute;inset:0;background:#405e71 url('/images/ride-fuji.webp') center top/100% auto no-repeat}.ride-shade{position:absolute;inset:0;background:linear-gradient(180deg,#071e3325,transparent 45%,#101f3555)}.fallback-rider{position:absolute;left:10%;bottom:2%;height:55%;max-width:45%;object-fit:contain;object-position:bottom}
  .immersive{max-width:none;min-height:100svh;padding:0;isolation:isolate}.immersive header{padding:14px 3%;color:var(--paper);background:var(--ink);backdrop-filter:blur(6px);border-color:#ffffff30;gap:16px}.immersive .brand span,.immersive .edition small,.immersive .view-link{color:var(--paper)}.immersive .brand{font-size:24px}.immersive .language{margin-left:auto}.immersive select{background:var(--ink);color:var(--paper);border-color:#bbcaca80}.immersive main{padding:24px 5% 80px}.immersive .hero{display:none}.immersive .ride-deck{width:clamp(380px,37vw,560px);margin-left:auto}.immersive nav{background:var(--ink);border-radius:5px 15px 5px 5px;border-color:#ffffff60;padding:0 10px;gap:3px;justify-content:space-between;margin-bottom:14px}.immersive nav button{color:var(--muted-on-dark);font-size:12px}.immersive nav button[aria-current]{color:var(--paper);border-color:var(--focus-on-dark)}.immersive .count{color:#193743}.immersive .provenance{padding:11px 14px;gap:7px;background:var(--paper);margin-bottom:14px;flex-wrap:wrap}.immersive .provenance p{font-size:12px}.immersive .provenance a{margin-left:14px}.immersive .datebar{padding:12px;background:var(--ink);color:var(--paper);border-radius:5px;margin:0 0 12px;flex-wrap:wrap;gap:12px}.immersive .day-buttons button{color:var(--paper);border-color:#b2c4c6;padding:8px 12px;font-size:12px}.immersive .day-buttons button.active{background:var(--signal)}.immersive .datebar label{font-size:12px}.immersive input[type=date]{padding:8px}.ride-tabs{display:flex;gap:6px;margin:12px 0}.ride-tabs button{flex:1;font-size:12px;padding:12px 6px;border:1px solid #e7e5d8a0;border-radius:6px;background:var(--ink);color:var(--paper)}.ride-tabs button[aria-pressed=true]{background:var(--paper);color:var(--action-ink)}.immersive .ride-card-stack{transform:perspective(1500px) rotateY(-5deg);transform-origin:right center}.immersive .day-grid{display:block}.immersive .programme{padding:24px;background:var(--paper);border:2px solid var(--signal);border-radius:4px 20px 4px 13px;box-shadow:0 18px 55px #142b4050}.immersive .event{padding:18px 0;border:0;border-top:1px solid var(--border);background:none;border-radius:0}.immersive .event h3{font-family:Georgia,serif;font-weight:400;font-size:25px}.immersive .prep{margin-top:12px;padding-top:12px}.immersive .upcoming{margin-bottom:0}.immersive .upcoming button{font-size:12px;padding:12px 0}.immersive .learning,.immersive .reflection{margin:0;background:var(--paper);border:2px solid var(--signal);border-radius:4px 20px 4px 13px}.immersive .reflection{display:block}.immersive .ride-hidden{display:none}.ride-next button{margin-top:12px;width:100%;display:block;text-align:left;padding:18px 24px;border:1px solid #fff8;border-radius:5px 15px 5px 5px;background:var(--paper);color:var(--ink);font:12px monospace}.immersive footer{border-color:#ffffff50;gap:12px;margin-top:22px;flex-direction:column;background:var(--ink);padding:12px;border-radius:5px}.immersive footer p,.immersive footer a{color:var(--paper)}.ride-caption{position:fixed;bottom:0;left:0;right:0;padding:15px 4%;margin:0;color:var(--paper);background:linear-gradient(transparent,#152835e8);pointer-events:none;font:11px monospace;display:flex;justify-content:space-between}.immersive .settings,.immersive .memory-view{background:var(--paper);border:2px solid var(--signal)}
  @media(max-width:800px){.immersive header{flex-wrap:wrap;padding:15px 20px}.immersive .view-controls{margin-left:auto}.immersive .edition{display:none}.immersive .language{width:100%;justify-content:space-between}.immersive main{padding:265px 18px 75px}.immersive .ride-world{height:450px}.immersive .ride-sky{background-size:auto 100%;background-position:center top}.immersive .ride-deck{width:100%;max-width:540px;margin:auto}.immersive .ride-card-stack{transform:none}.immersive .datebar{flex-direction:row}.immersive .ride-caption span{display:none}}
  @media(prefers-reduced-motion:reduce){.immersive .ride-card-stack{transform:none}}
  :global(body){margin:0;background:var(--paper);color:var(--ink);font-family:Arial,sans-serif} :global(*){box-sizing:border-box}
  .founders{max-width:1280px;margin:auto;padding:0 36px 50px}button,input,select,textarea{font:inherit}input::placeholder,textarea::placeholder{color:var(--muted);opacity:1}.language-pair{font-size:12px;color:var(--muted);white-space:nowrap}.immersive .language-pair{color:var(--paper)}.immersive :focus-visible{outline-color:var(--focus-on-dark)}.immersive .panel :focus-visible{outline-color:var(--focus)}button{cursor:pointer;min-height:var(--control-target);min-width:var(--control-target)}button:disabled{opacity:.55;cursor:default}a{color:var(--action-ink)}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid var(--focus);outline-offset:4px}
  header{display:flex;align-items:center;gap:28px;justify-content:space-between;padding:24px 0;border-bottom:1px solid var(--line)}.brand{font-size:28px;font-weight:800;color:var(--action-ink);text-decoration:none}.brand span{color:var(--ink);font-size:22px;margin-left:8px}.edition{font-weight:bold}.edition small{display:block;font:11px monospace;letter-spacing:2px;margin-top:6px;color:var(--muted)}.language{display:flex;align-items:center;gap:10px;font-size:12px}select{padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:6px}.hero{display:grid;grid-template-columns:1fr .85fr;gap:48px;padding:38px 0;align-items:center}.eyebrow{font:11px/1.6 monospace;letter-spacing:1.4px;text-transform:uppercase}.hero h1{font-size:clamp(36px,4.6vw,60px);line-height:1.05;letter-spacing:-2px;margin:20px 0}.hero h1 span{color:var(--signal)}.hero p{max-width:410px;font-size:16px;line-height:1.7;color:var(--muted)}.route-mark{font:11px monospace;letter-spacing:2px;display:block;margin-top:22px}.hero-art{position:relative;border:6px solid var(--paper);transform:rotate(-1.5deg);box-shadow:8px 10px 0 #263e430b}.hero-art img{display:block;width:100%;height:235px;object-fit:cover}.hero-art>span{display:block;background:var(--paper);padding:12px;font:11px/1.5 monospace}nav{display:flex;gap:12px;border-bottom:1px solid var(--line);margin-bottom:24px}nav button{background:none;border:0;padding:16px 10px;font-size:13px;color:var(--muted);border-bottom:3px solid transparent}nav button[aria-current]{color:var(--action-ink);border-color:var(--signal)}.count{font:11px monospace;background:var(--surface-soft);padding:3px 7px;border-radius:10px;margin-left:6px}
  p{line-height:1.65} .small{font-size:12px;color:var(--muted);line-height:1.65}.notice{background:var(--warning-bg);border-left:3px solid var(--signal);padding:14px;font-size:13px}.provenance{display:flex;align-items:center;gap:12px;padding:14px 18px;background:var(--surface-soft);margin-bottom:24px;border-radius:4px}.provenance b{font-size:12px}.provenance p{font:11px/1.6 monospace;margin:5px 0}.provenance a{font-size:12px;margin-left:auto;max-width:160px}.dot{width:8px;height:8px;background:var(--signal);border-radius:50%;flex-shrink:0}.warning{color:var(--action-ink)}.datebar{display:flex;justify-content:space-between;gap:20px;align-items:center;margin:24px 0}.day-buttons{display:flex;gap:8px}.day-buttons button{background:transparent;border:1px solid var(--border);padding:10px 18px;border-radius:22px;color:var(--ink)}.day-buttons button.active{background:var(--ink);color:var(--paper)}.datebar label{display:flex;align-items:center;gap:10px;font-size:12px}input,textarea{padding:12px;border:1px solid var(--border);background:var(--surface);border-radius:4px;min-width:0}input[type=date]{font-size:12px}.day-grid{display:grid;grid-template-columns:1.35fr .85fr;gap:28px;align-items:start}.section-heading h2{font-size:22px;text-transform:capitalize;letter-spacing:-.5px;margin:8px 0}.panel{background:var(--surface);border:1px solid var(--line);border-radius:5px;padding:26px}.event{margin-top:14px}.event-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.time{font:12px/1.6 monospace;color:var(--action-ink)}.badge{font-size:12px;padding:5px 8px;background:var(--surface-soft);border-radius:3px;white-space:nowrap}.event h3{font-size:22px;line-height:1.3;margin:16px 0}.location{font-size:12px;color:var(--muted)}summary{font-size:12px;cursor:pointer;line-height:1.5;min-height:var(--control-target);align-content:center}details p{font-size:13px;color:var(--muted)}.event-bottom{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:18px}.event-bottom small{font:11px monospace;color:var(--muted)}.event-bottom a{font-size:12px}.prep{border-top:1px solid var(--line);margin-top:20px;padding-top:17px}.prep p{font-size:13px;margin-bottom:0}.prep .eyebrow{color:var(--muted);font-size:12px}.learning{position:relative;overflow:hidden;border-top:3px solid var(--signal);margin-top:7px}.learning h2{font-size:35px;margin:50px 0 10px;position:relative}.romaji{font:13px/1.7 monospace;color:var(--muted)}.kanji-watermark{position:absolute;right:18px;top:25px;font-size:120px;opacity:.045;pointer-events:none}.helpers{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:25px 0 12px}.helpers button{border:1px solid var(--border);border-radius:5px;background:none;padding:13px 4px;color:var(--ink)}.helpers b{font-size:17px}.helpers small{display:block;font-size:12px;margin-top:6px}.helpers button[aria-pressed=true]{color:var(--paper);background:var(--signal);border-color:var(--signal)}.help{border-left:2px solid var(--signal);padding:0 0 0 16px;margin:20px 0}.help p{font-size:13px}.help .question{font-size:25px}.help input{width:100%;margin-top:8px}.help h3{font-size:17px}.help label,.reflection label{font-size:12px;display:block}.primary,.outline,.keep{border:0;border-radius:4px;padding:13px 16px;font-size:12px;line-height:1.5}.primary{background:var(--signal);color:var(--paper)}.outline{border:1px solid var(--border);background:transparent;color:var(--ink)}.keep{background:var(--surface-soft);color:var(--ink);width:100%;margin-top:18px;text-align:left}.actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px}.text-button{background:none;border:0;color:var(--action-ink);padding:10px 0;font-size:12px}.upcoming{margin:28px 0}.upcoming button{display:flex;gap:12px;align-items:center;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);padding:15px 0;color:var(--ink);font-size:12px}.upcoming time{font:11px monospace;flex-shrink:0}.upcoming button span:last-child{margin-left:auto}.reflection{display:grid;grid-template-columns:1fr 1.2fr;gap:36px;margin-top:30px}.reflection h2{font-size:22px}.reflection p{font-size:13px;color:var(--muted)}.reflection textarea{width:100%;resize:vertical;margin-top:8px}.settings{max-width:780px;margin:20px auto}.settings h2{font-size:28px}.settings h3{font-size:15px;line-height:1.7;font-weight:400}.settings p{font-size:13px}.upload{display:block;font-size:13px;margin-top:20px;font-weight:bold}.upload input{display:block;width:100%;margin-top:10px;font-size:12px}.settings-actions{display:flex;gap:14px;flex-wrap:wrap;align-items:start}.settings-actions .upload{margin-top:0;font-weight:400}.settings-actions .upload input{max-width:320px}hr{border:0;border-top:1px solid var(--line);margin:30px 0}.empty{padding:28px 0}.empty.panel{padding:30px}.empty>span{font-size:48px;color:var(--signal)}.empty p{font-size:14px}.empty a{font-size:12px}.memory-view{max-width:660px;margin:30px auto;text-align:center;padding:45px}.memory-view h3{font-size:42px;margin:45px 0 12px}.memory-view>.primary{display:block;margin:30px auto}.memory-view .actions{justify-content:center}.meaning{font-size:22px}.memory-view .empty{padding:35px 0}footer{border-top:1px solid var(--line);margin-top:40px;padding:20px 0;display:flex;justify-content:space-between;gap:30px}footer p{font-size:12px;max-width:650px;color:var(--muted);margin:0}footer a{gap:8px;display:inline-flex;align-items:center;min-height:var(--control-target);font-size:12px}
  @media(max-width:800px){.founders{padding:0 18px 60px}header{flex-wrap:wrap;gap:15px}.edition{font-size:12px}.language{width:100%;justify-content:space-between}.hero{gap:20px;grid-template-columns:1fr;padding:25px 0}.hero-art img{height:180px}.hero-art{max-width:500px}.hero h1{font-size:40px;letter-spacing:-1.5px}.hero p{font-size:14px}nav{gap:0;justify-content:space-between}nav button{font-size:12px;padding:14px 5px}.provenance{flex-wrap:wrap}.provenance a{margin-left:20px;max-width:none}.datebar{align-items:start;flex-direction:column;gap:14px}.datebar label{width:100%;justify-content:space-between}.day-grid,.reflection{grid-template-columns:1fr;gap:20px}.learning{margin-top:0}.learning h2{margin-top:28px}.panel{padding:22px}.event h3{font-size:20px}.event-top{flex-wrap:wrap}.reflection{margin-top:20px}.memory-view{padding:28px 20px}.memory-view h3{font-size:33px}footer{flex-direction:column;gap:12px}}
  .founders.note-focused{max-width:none;padding:0;background:var(--paper);min-height:100svh}
  .note-focused>header,.note-focused .journey-navigation,.note-focused footer,.note-focused .ride-caption,.note-focused .ride-world{display:none}
  .note-focused main,.immersive.note-focused main{padding:0 0 80px}
  .note-focused.reading-mode .ride-deck,.note-focused.immersive.reading-mode .ride-deck{width:100%;max-width:960px;margin:0 auto;padding:0}
  .note-focused .notice{margin:0}
</style>
