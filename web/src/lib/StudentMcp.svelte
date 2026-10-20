<script>
  import { onMount } from 'svelte';
  import RideScene from '$lib/RideScene.svelte';
  import Listen from '$lib/Listen.svelte';
  import JourneyNav from '$lib/JourneyNav.svelte';
  import Torii from '$lib/Torii.svelte';
  import { speech } from '$lib/speech.js';
  import { createFoundersClient, STUDENT_JUDGE_KEY } from '$lib/founders-mcp.js';
  import { LOCALES, isTodayQuestion } from '$lib/founders.js';

  let { judgeMode = true } = $props();

  let api, disposed = false;
  let ready = $state(false), busy = $state(false), error = $state(''), notice = $state('');
  let entries = $state([]), programme = $state(null), explanation = $state(null), memories = $state([]), serverNow = $state(0);
  const language = 'en';
  let view = $state('programme'), question = $state(''), revealed = $state(false);
  let paused = $state(false), reduced = $state(true), fallback = $state(false), mounted = $state(false);
  let showJapanese = $state(false), pronunciation = $state(false);
  const card = $derived(memories.find(item => item.due <= serverNow));
  const stopped = $derived(paused || reduced || fallback);
  onMount(() => {
    // Judge playback stays independent of unverified recording distribution rights.
    speech.useRecordings(false);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => reduced = media.matches;
    motion(); media.addEventListener('change', motion);
    api = createFoundersClient({ baseUrl: location.origin, storage: localStorage, storageKey: STUDENT_JUDGE_KEY, onTrace: entry => { if (!disposed) entries = [...entries.slice(-19), entry]; } });
    mounted = true;
    return () => { disposed = true; speech.useRecordings(true); media.removeEventListener('change', motion); api?.close().catch(() => {}); };
  });
  async function run(action) {
    if (busy || !api) return;
    busy = true; error = ''; notice = ''; speech.stop();
    try { await action(); }
    catch (problem) { error = `Action not completed. ${problem.message || 'Check the MCP server and retry.'}`; }
    finally { busy = false; }
  }
  async function refreshMemories() {
    const data = await api.call('list_memories', { language });
    memories = data.memories; serverNow = data.now; revealed = false; pronunciation = false;
  }
  async function loadDay(date) {
    programme = await api.call('get_day_programme', { ...(date ? { date } : {}), language });
    explanation = null; showJapanese = false; view = 'programme';
  }
  function connect() { run(async () => { ready = false; await api.connect(); ready = true; await loadDay(); await refreshMemories(); }); }
  function helper(depth) { run(async () => { explanation = await api.call('explain_phrase', { phraseId: programme.phrase.id, language, depth }); }); }
  function save(id) { run(async () => { await api.call('save_phrase', { phraseId: id }); notice = 'Phrase saved on the MCP server.'; await refreshMemories(); }); }
  function ask(event) {
    event.preventDefault();
    if (!isTodayQuestion(question)) { error = 'Try 今日の予定は？ or Kyō no yotei wa? This is a guided phrase, not an open-ended chatbot.'; return; }
    run(async () => { await loadDay(); notice = 'You asked in Japanese. These are today’s fictional example events, fetched from the MCP server.'; });
  }
  function review(rating) { run(async () => { await api.call('review_phrase', { phraseId: card.id, rating, expectedReviews: card.reviews }); await refreshMemories(); notice = 'Review saved on the MCP server.'; }); }
  function readProgramme() {
    speech.play([{ text: 'Fictional university timetable. Not your real calendar.', lang: 'en-GB' },
      ...programme.events.map(event => ({ text: `${event.startTime}. ${event.title}. ${event.location}.`, lang: 'en-GB' })),
      { text: programme.phrase.jp, lang: 'ja-JP' }], { title: 'Your daily briefing' });
  }
</script>

<svelte:head><title>Alexa-chan · Noor’s university day</title><meta name="description" content="A university student's day with optional Japanese learning, a real MCP connection and clearly labelled fictional classes."/></svelte:head>
<div class="world" aria-hidden="true"><div class="sky"></div>{#if !fallback}<RideScene paused={stopped} slow={!!explanation || view === 'memories'} onfallback={() => fallback = true}/>{:else}<img src="/images/ride-rider-courier.webp" alt=""/>{/if}<div class="shade"></div></div>
<header><a class="brand" href="/"><span class="brand-dot" aria-hidden="true"></span> alexa-chan</a><span class="edition">STUDENT LIFE{judgeMode ? ' / MCP TRIAL' : ''}</span><a href="/student">Simple notes <Torii/></a><button disabled={reduced || fallback} aria-pressed={stopped} onclick={() => paused = !paused}>{reduced || fallback ? 'Motion off' : paused ? 'Resume ride' : 'Pause ride'}</button></header>
<main>
  <section class="intro"><h1><span>A little Japanese.</span><br/><i>Between classes.</i></h1><p>Check your day. Keep your notes.<br/>Take one small phrase along.</p></section>
  <div class="deck">
    <JourneyNav active={view === 'programme' ? 'today' : 'memories'} count={memories.length}
      ontoday={() => { speech.stop(); view = 'programme'; }} notesHref="/student-ride"
      onmemories={() => { if (ready) run(async () => { await refreshMemories(); view = 'memories'; }); }} disabled={!ready || busy}/>
    <div class="deck-heading"><span class="sample-badge">EXAMPLE TIMETABLE</span><span class="connection-status"><span class:connected={ready}></span>{ready ? 'Connected' : 'Local demo'}</span></div>
    {#if !ready}
      <section class="welcome card" aria-label={judgeMode ? 'MCP connection' : 'Start the example'}><span class="eyebrow">MEET NOOR</span><h2>A day between classes.</h2><p>Two classes or meetings. Your notes.<br/>Japanese, only when you’re curious.</p><button class="primary" disabled={busy || !mounted} onclick={connect}>{busy ? 'Working…' : judgeMode ? 'Connect MCP' : 'Try Noor’s day'} <Torii/></button><a href="/student-ride">Or start with your own notes <Torii/></a><small>A fictional day. No account or calendar needed.</small></section>
    {/if}
    {#if error}<p class="error" role="alert">{error} No offline success is simulated.{#if !ready} Run <code>npm run start:mcp</code>.{/if}</p>{/if}
    {#if notice}<p class="notice" role="status">{notice}</p>{/if}
    {#if ready}
      <div class="card-stack" aria-busy={busy}>
      {#if view === 'programme' && programme}
        <article class="card"><div class="card-top"><div><span class="eyebrow">NOOR’S DAY</span><h2 class="day-title">{programme.date === programme.today ? 'Today, at a glance.' : 'A little further ahead.'}</h2></div><span>{programme.date}<br/>Brussels</span></div>
          <div class="day-actions"><button aria-pressed={programme.date === programme.today} disabled={busy} onclick={() => run(() => loadDay())}>Today</button><button aria-pressed={programme.date !== programme.today} disabled={busy} onclick={() => run(() => loadDay(new Date(Date.parse(programme.today) + 86400000).toISOString().slice(0,10)))}>Tomorrow</button></div>
          <div class="agenda">{#each programme.events as event, index}<section class="event"><div class="event-time"><time>{event.startTime}</time><small>{event.endTime}</small></div><div class="event-copy"><span class="event-tag">{index === 0 ? 'FIRST ON YOUR PLAN' : 'ALSO TODAY'}</span><h3>{event.title.replace(/ · example$/, '')}</h3><p>{event.location.replace(/ · example$/, '')}</p></div></section>{/each}</div>
          {#if !programme.events.length}<p>{programme.status === 'outside' ? 'This date is outside the sample coverage.' : 'No example events for this day.'}</p>{/if}
          <button class="text-button" data-audio-ui onclick={readProgramme}>♪ Listen to the briefing</button>
          <div class="japanese"><div class="phrase-strip"><span lang="ja">{programme.phrase.jp}</span><Listen text={programme.phrase.jp} lang="ja-JP" label="Listen in Japanese"/></div><button class="optional" aria-expanded={showJapanese} onclick={() => { speech.stop(); showJapanese = !showJapanese; }}>A little Japanese, if you’re curious <span aria-hidden="true">{showJapanese ? '−' : '+'}</span></button></div>
          {#if showJapanese}
          <div class="helpers"><button disabled={busy} aria-pressed={explanation?.depth === 'meaning'} onclick={() => helper('meaning')}>Meaning<small>Iké</small></button><button disabled={busy} aria-pressed={explanation?.depth === 'detail'} onclick={() => helper('detail')}>More detail<small>Motto</small></button><button disabled={busy} aria-pressed={explanation?.depth === 'question'} onclick={() => helper('question')}>How to ask<small>Nanté</small></button></div>
          {#if explanation}<div class="explanation" lang="en"><p>{explanation.text}</p><Listen text={explanation.text} lang={LOCALES[language]} label="Listen to the explanation"/>
            {#if explanation.depth === 'question'}<h3 lang="ja">{explanation.phrase.jp}</h3><p>{explanation.phrase.romaji}</p><Listen text={explanation.phrase.jp} lang="ja-JP" label="Listen to the question"/><form onsubmit={ask}><label for="mcp-question">Ask for today’s programme</label><input id="mcp-question" bind:value={question} maxlength="100" placeholder="Kyō no yotei wa?" disabled={busy}/><div class="actions"><button type="button" disabled={busy} onclick={() => question = explanation.phrase.jp}>Use a hint</button><button class="primary" disabled={busy || !question.trim()}>Ask in Japanese →</button></div></form><button class="text-button" disabled={busy || memories.some(m => m.id === 'question')} onclick={() => save('question')}>{memories.some(m => m.id === 'question') ? 'Question saved ✓' : 'Save the question'}</button>{/if}
          </div>{/if}
          <button class="save" disabled={busy || memories.some(m => m.id === programme.phrase.id)} onclick={() => save(programme.phrase.id)}>{memories.some(m => m.id === programme.phrase.id) ? 'Saved to example memories ✓' : '＋ Keep this phrase'}</button>
          {/if}
        </article>
        <a class="next" href="/student-ride"><div><span class="eyebrow">AFTER CLASS</span><strong>Your notes, unchanged.</strong></div><Torii/></a>
      {:else if view === 'memories'}
        <article class="card memories"><span class="eyebrow">SAVED FROM THE EXAMPLE DAY · {memories.length}</span><h2>A little stays with you.</h2><p class="fine">These example memories live on the local server. Your notebook memories stay separately in your browser.</p>
          {#if card}<h3 lang="ja">{card.phrase.jp}</h3><label class="pronunciation"><input type="checkbox" bind:checked={pronunciation}/> Show pronunciation hint</label>{#if pronunciation || revealed}<p class="romaji">{card.phrase.romaji}</p>{/if}<Listen text={card.phrase.jp} lang="ja-JP" label="Listen in Japanese"/>{#if revealed}<p class="meaning">{card.phrase.meaning}</p><Listen text={card.phrase.meaning} lang={LOCALES[language]} label="Listen to the meaning"/><div class="actions"><button disabled={busy} onclick={() => review('again')}>Again</button><button class="primary" disabled={busy} onclick={() => review('good')}>Remembered</button></div>{:else}<button class="save" disabled={busy} onclick={() => revealed = true}>Reveal the meaning</button>{/if}
          {:else}<p>{memories.length ? 'Nothing due right now. No pressure.' : 'Keep a phrase from your programme to start.'}</p>{#if memories.length}<p>Next review: {new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', dateStyle: 'medium', timeStyle: 'short' }).format(Math.min(...memories.map(m => m.due)))} Brussels time.</p>{/if}{/if}
          <button class="text-button" disabled={busy} onclick={() => run(refreshMemories)}>Refresh from server</button><p class="fine">Refresh the page and reconnect: these cards stay on the local server, separate from your personal journey.</p>
        </article>
      {/if}
      </div>
    {/if}
    <details class="sample"><summary>About this example</summary><p>Noor’s seven-day university timetable is fictional and rolls forward with today’s date. No real university calendar, private notes or Alexa+ device are connected.</p><p>Audio uses device voices; you may need a Japanese voice installed. Nothing plays automatically.</p><button class="text-button" disabled={!mounted || busy} onclick={connect}>{ready ? 'Reconnect to the local server' : 'Connect to the local server'}</button></details>
    <details class="trace"><summary>{judgeMode ? 'Connection proof' : 'Behind the scenes'} · {entries.length} recent requests</summary><p>Actual MCP requests from this browser. No tokens or calendar contents are logged here.</p><ol>{#each entries as entry}<li class:failed={!entry.ok}><b>{entry.ok ? '✓' : '×'} {entry.name}</b><span>{entry.protocol || `${entry.status} · ${entry.ms} ms`}</span></li>{/each}</ol>{#if !entries.length}<p>Connect to see initialize, tools/list and tools/call.</p>{/if}</details>
    <footer>{judgeMode ? 'Guided interactions, not a general AI chat. Your random judge access key is stored in this browser; anyone with that key can access this example deck. No private notes are sent.' : 'An example day, not your live timetable. Your own notes stay separate in this browser.'}<a href="/student">Keep your own study notes <Torii/></a>{#if !judgeMode}<a href="/student-mcp">How the connection works <Torii/></a>{/if}</footer>
  </div>
</main>

<style>
  :global(body){margin:0;background:var(--ink);color:var(--ink);font-family:Arial,sans-serif} :global(*){box-sizing:border-box}
  .world{position:fixed;inset:0;z-index:-1;overflow:hidden;background:#597584}.sky{position:absolute;inset:0;background:url('/images/ride-fuji.webp') center top/100% auto no-repeat}.world img{position:absolute;height:60%;max-width:45%;object-fit:contain;bottom:0;left:7%}.shade{position:absolute;inset:0;background:linear-gradient(90deg,#142a3820,#142a3860)}
  header{display:flex;align-items:center;gap:24px;padding:12px 4%;color:var(--paper);background:var(--ink);border-bottom:1px solid var(--border)}header>a{gap:8px;display:inline-flex;align-items:center;min-height:var(--control-target);color:var(--paper);text-decoration:none;font-size:12px}.brand{gap:10px;font-size:24px;font-weight:800;letter-spacing:-.6px;margin-right:auto}.brand-dot{width:11px;height:11px;background:var(--signal);border-radius:50%}.edition{font:11px monospace;letter-spacing:1px}
  button,input{font:inherit}button{cursor:pointer;min-height:var(--control-target);min-width:var(--control-target)}button:disabled{opacity:.5;cursor:default}button:focus-visible,a:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid var(--focus);outline-offset:3px}header :focus-visible,.sample :focus-visible,.trace :focus-visible,footer :focus-visible{outline-color:var(--focus-on-dark)}header button{color:var(--paper);border:1px solid var(--border);background:transparent;border-radius:24px;padding:8px 15px;font-size:12px}
  main{padding:32px 5% 100px;display:grid;grid-template-columns:minmax(0,1fr) minmax(380px,490px);gap:7%;align-items:start}.intro{color:var(--paper);max-width:460px;padding:0;background:transparent}.intro h1{font:clamp(28px,3.1vw,44px)/1.3 Georgia,serif;font-weight:400;letter-spacing:-.7px;margin:0 0 12px}.intro h1 span,.intro h1 i,.intro p{background:color-mix(in srgb,var(--ink) 86%,transparent);box-decoration-break:clone;-webkit-box-decoration-break:clone;padding:2px 8px}.intro h1 i{font-weight:400}.intro p{width:fit-content;font-size:14px;line-height:1.7;color:var(--paper);margin:0;padding:6px 8px}
  .deck{min-width:0}.deck-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;color:var(--paper);background:var(--ink);padding:10px 12px;border-radius:6px;font:11px/1.5 monospace;margin:0 0 14px}.sample-badge{letter-spacing:.6px}.connection-status{display:flex;align-items:center;gap:6px;color:var(--muted-on-dark)}.connection-status>span{width:6px;height:6px;background:var(--muted-on-dark);border-radius:50%}.connection-status .connected{background:#a5cbb8}
  .card-stack{transform:perspective(1600px) rotateY(-3deg);transform-origin:right center}.card{background:var(--paper);border-top:3px solid var(--signal);border-radius:5px 20px 7px 12px;padding:26px;box-shadow:0 16px 55px #0b1f3b40}.eyebrow{font:11px/1.6 monospace;letter-spacing:1px;color:var(--muted)}.card-top{display:flex;justify-content:space-between;gap:16px;align-items:center}.card-top>span{font:11px/1.8 monospace;text-align:right;color:var(--muted);white-space:nowrap}.day-title{font:30px/1.2 Georgia,serif;letter-spacing:-.6px;margin:9px 0 0}
  .day-actions{display:flex;gap:8px;margin:20px 0}.day-actions button{padding:10px 16px;border:1px solid var(--border);border-radius:22px;background:none;color:var(--ink);font-size:12px}.day-actions button[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}.agenda{border-top:1px solid var(--line)}.event{display:grid;grid-template-columns:62px minmax(0,1fr);gap:14px;padding:18px 0;border-bottom:1px solid var(--line)}.event-time{display:flex;flex-direction:column;gap:7px;padding-top:2px}.event-time time{font:16px monospace;color:var(--action-ink)}.event-time small{font:12px monospace;color:var(--muted)}.event-tag{font:11px/1.4 monospace;letter-spacing:.5px;color:var(--muted)}.event h3{font:20px/1.25 Georgia,serif;font-weight:400;margin:6px 0}.event p{font-size:12px;color:var(--muted);margin:0;line-height:1.5}
  .text-button{color:var(--action-ink);border:0;background:none;padding:10px 0;font-size:12px}.japanese{margin-top:8px;border-top:1px solid var(--line);padding-top:16px}.phrase-strip{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.phrase-strip>span{font-size:24px}.optional{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;border:0;background:transparent;color:var(--muted);font-size:12px;padding:10px 0}.optional:hover{color:var(--action-ink)}
  .helpers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:16px}.helpers button{border:1px solid var(--border);border-radius:7px;background:none;color:var(--ink);padding:12px 5px;font-size:12px}.helpers small{display:block;font:11px monospace;margin-top:6px;color:var(--muted)}.helpers button[aria-pressed=true]{color:var(--paper);background:var(--signal);border-color:var(--signal)}.helpers button[aria-pressed=true] small{color:var(--paper)}
  .explanation{margin-top:20px;padding-left:16px;border-left:1px solid var(--signal);font-size:14px;line-height:1.7}.explanation h3{font-size:27px}.explanation label{display:block;font-size:12px;margin:14px 0 8px}input{width:100%;min-width:0;padding:12px;border:1px solid var(--border);border-radius:5px;background:var(--surface);color:var(--ink)}input::placeholder{color:var(--muted);opacity:1}.actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.actions button{border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--ink);font-size:12px;padding:10px 15px}.primary,.actions .primary{background:var(--signal);border:1px solid var(--signal);color:var(--paper);border-radius:6px;padding:12px 18px;font-size:13px}.save{width:100%;margin-top:18px;padding:14px;border:0;border-radius:6px;text-align:left;background:var(--surface-soft);color:var(--ink);font-size:12px}
  .next{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;padding:15px 23px;text-decoration:none;color:var(--ink);border-radius:6px 16px 6px 6px;background:var(--paper)}.next strong{display:block;font:17px/1.4 Georgia,serif;margin-top:4px}.next:hover{background:var(--surface)}
  .welcome{margin-bottom:18px}.welcome h2{font:32px/1.2 Georgia,serif;letter-spacing:-.6px;margin:12px 0}.welcome p{font-size:14px;line-height:1.8;color:var(--muted)}.welcome .primary{width:100%;display:flex;justify-content:space-between;align-items:center;margin:24px 0 14px}.welcome a{gap:10px;display:flex;align-items:center;justify-content:center;min-height:var(--control-target);text-align:center;color:var(--action-ink);font-size:13px;text-decoration:none;padding:10px}.welcome small{display:block;text-align:center;font-size:12px;color:var(--muted);margin-top:16px}
  .memories h2{font:30px Georgia,serif;margin:16px 0}.memories h3{font-size:34px;margin:24px 0 14px}.memories p{font-size:14px;line-height:1.7}.memories .fine{font-size:12px;color:var(--muted)}.pronunciation{display:flex;align-items:center;gap:8px;min-height:var(--control-target);font-size:12px;color:var(--muted)}.pronunciation input{width:auto}.romaji{font:13px monospace;color:var(--muted)}.meaning{font-size:21px!important}
  .sample,.trace{background:var(--ink);color:var(--paper);margin-top:16px;padding:10px 14px;border:1px solid var(--border);border-radius:7px;font-size:12px}.sample summary,.trace summary{cursor:pointer;min-height:var(--control-target);display:list-item;align-content:center;line-height:1.6}.sample p,.trace p{line-height:1.7;color:var(--muted-on-dark)}.sample .text-button{color:var(--amber)}.trace ol{padding-left:18px}.trace li{padding:6px 0}.trace li span{display:block;color:var(--muted-on-dark);font:11px monospace;margin-top:5px}.trace .failed{color:var(--focus-on-dark)}.error,.notice{font-size:13px;line-height:1.7;padding:12px;background:var(--warning-bg);border-left:1px solid var(--signal);overflow-wrap:anywhere;border-radius:4px}
  footer{margin-top:16px;padding:16px;border-radius:7px;background:var(--ink);color:var(--muted-on-dark);font-size:12px;line-height:1.7}footer a{gap:8px;display:flex;align-items:center;min-height:var(--control-target);color:var(--paper);margin-top:7px}
  @media(max-width:800px){header{flex-wrap:wrap;gap:12px;padding:12px 20px}.edition{display:none}.brand{font-size:21px}main{display:block;padding:24px 18px 100px}.world{height:420px}.sky{background-size:auto 100%}.intro{margin-bottom:140px;max-width:460px}.intro h1{font-size:28px;margin:0}.intro p{display:none}.deck{max-width:540px;margin:auto}.card-stack{transform:none}.card{padding:22px}.day-title{font-size:26px}.event{grid-template-columns:55px 1fr;gap:12px}.event h3{font-size:19px}.card-top{align-items:start;flex-wrap:wrap}.card-top>span{text-align:left}.phrase-strip>span{font-size:22px}}
  @media(prefers-reduced-motion:reduce){.card-stack{transform:none}}
</style>
