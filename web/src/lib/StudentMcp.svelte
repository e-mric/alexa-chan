<script>
  import { onMount } from 'svelte';
  import RideScene from '$lib/RideScene.svelte';
  import Listen from '$lib/Listen.svelte';
  import { speech } from '$lib/speech.js';
  import { createFoundersClient, STUDENT_JUDGE_KEY } from '$lib/founders-mcp.js';
  import { LOCALES, isTodayQuestion } from '$lib/founders.js';

  let { judgeMode = true } = $props();

  let api, disposed = false;
  let ready = $state(false), busy = $state(false), error = $state(''), notice = $state('');
  let entries = $state([]), programme = $state(null), explanation = $state(null), memories = $state([]), serverNow = $state(0);
  let view = $state('programme'), language = $state('en'), question = $state(''), revealed = $state(false);
  let paused = $state(false), reduced = $state(true), fallback = $state(false), mounted = $state(false);
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
    memories = data.memories; serverNow = data.now; revealed = false;
  }
  async function loadDay(date) {
    programme = await api.call('get_day_programme', { ...(date ? { date } : {}), language });
    explanation = null; view = 'programme';
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
      { text: programme.phrase.jp, lang: 'ja-JP' }]);
  }
</script>

<svelte:head><title>Alexa-chan · Noor’s university day</title><meta name="description" content="A university student's day with optional Japanese learning, a real MCP connection and clearly labelled fictional classes."/></svelte:head>
<div class="world" aria-hidden="true"><div class="sky"></div>{#if !fallback}<RideScene paused={stopped} slow={!!explanation || view === 'memories'} onfallback={() => fallback = true}/>{:else}<img src="/images/ride-rider-courier.png" alt=""/>{/if}<div class="shade"></div></div>
<header><a class="brand" href="/">● alexa-chan</a><span>NOOR’S UNIVERSITY DAY{judgeMode ? ' / MCP' : ''}</span><a href="/student-ride">My study notes ↗</a><button disabled={reduced || fallback} aria-pressed={stopped} onclick={() => paused = !paused}>{reduced || fallback ? 'Motion off' : paused ? 'Resume ride' : 'Pause ride'}</button></header>
<main>
  <section class="intro"><span>YOUR DAY FIRST. A LITTLE JAPANESE ALONG THE WAY.</span><h1>A little Japanese.<br/>Between classes.</h1><p>Meet Noor, a university student. Classes, a group project, and one small phrase to take along.</p></section>
  <div class="deck">
    <aside class="sample"><b>Noor’s day · fictional university timetable</b><p>This seven-day sample rolls forward with today’s date. It never reads a real university calendar or your personal notes. No Alexa+ device connection.</p><p>Audio uses your device’s voices. Add a Japanese voice if needed; nothing plays automatically.</p></aside>
    <section class="connection" aria-label={judgeMode ? 'MCP connection' : 'Start the example'}><div><strong>{ready ? (judgeMode ? 'Connected · Streamable HTTP' : 'Noor’s day is ready') : 'A day between classes'}</strong><small>{judgeMode ? (ready ? 'Real server tools · isolated saved progress' : 'Start the local MCP server, then connect.') : 'Useful information first. Japanese when you’re curious.'}</small></div><button disabled={busy || !mounted} onclick={connect}>{busy ? 'Working…' : ready ? (judgeMode ? 'Reconnect' : 'Refresh the day') : (judgeMode ? 'Connect MCP' : 'Try Noor’s day')}</button></section>
    {#if error}<p class="error" role="alert">{error} No offline success is simulated.{#if !ready} Run <code>npm run start:mcp</code>.{/if}</p>{/if}
    {#if notice}<p class="notice" role="status">{notice}</p>{/if}
    {#if ready}
      <nav aria-label="Journey"><button aria-current={view === 'programme' ? 'page' : undefined} disabled={busy} onclick={() => view = 'programme'}>01 / Campus day</button><button aria-current={view === 'memories' ? 'page' : undefined} disabled={busy} onclick={() => run(async () => { await refreshMemories(); view = 'memories'; })}>02 / Memories ({memories.length})</button></nav>
      <label class="language">Explain Japanese in <select bind:value={language} disabled={busy} onchange={() => run(async () => { explanation = null; if (view === 'memories') await refreshMemories(); else if (programme) await loadDay(programme.date); })}><option value="en">English</option><option value="fr">Français</option><option value="nl">Nederlands</option><option value="de">Deutsch</option></select></label>
      <div class="card-stack" aria-busy={busy}>
      {#if view === 'programme' && programme}
        <article class="card"><div class="card-top"><span>01 / YOUR EXAMPLE DAY</span><span>{programme.date} · Brussels</span></div>
          <div class="day-actions"><button disabled={busy} onclick={() => run(() => loadDay())}>Today</button><button disabled={busy} onclick={() => run(() => loadDay(new Date(Date.parse(programme.today) + 86400000).toISOString().slice(0,10)))}>Tomorrow</button></div>
          {#each programme.events as event}<section class="event"><time>{event.startTime}—{event.endTime}</time><h2>{event.title}</h2><p>{event.location}</p></section>{/each}
          {#if !programme.events.length}<p>{programme.status === 'outside' ? 'This date is outside the sample coverage.' : 'No example events for this day.'}</p>{/if}
          <button class="text-button" onclick={readProgramme}>♪ Listen to the briefing</button>
          <div class="japanese"><span>ONE SMALL ENCOURAGEMENT</span><h2 lang="ja">{programme.phrase.jp}</h2><p>{programme.phrase.romaji}</p><Listen text={programme.phrase.jp} lang="ja-JP" label="Listen in Japanese"/></div>
          <div class="helpers"><button disabled={busy} aria-pressed={explanation?.depth === 'meaning'} onclick={() => helper('meaning')}>Iké<small>The meaning</small></button><button disabled={busy} aria-pressed={explanation?.depth === 'detail'} onclick={() => helper('detail')}>Motto<small>A little more</small></button><button disabled={busy} aria-pressed={explanation?.depth === 'question'} onclick={() => helper('question')}>Nanté<small>My turn</small></button></div>
          {#if explanation}<div class="explanation"><p>{explanation.text}</p><Listen text={explanation.text} lang={LOCALES[language]} label="Listen to the explanation"/>
            {#if explanation.depth === 'question'}<h3 lang="ja">{explanation.phrase.jp}</h3><p>{explanation.phrase.romaji}</p><Listen text={explanation.phrase.jp} lang="ja-JP" label="Listen to the question"/><form onsubmit={ask}><label for="mcp-question">Ask for today’s programme</label><input id="mcp-question" bind:value={question} maxlength="100" placeholder="Kyō no yotei wa?" disabled={busy}/><div class="actions"><button type="button" disabled={busy} onclick={() => question = explanation.phrase.jp}>Use a hint</button><button class="primary" disabled={busy || !question.trim()}>Ask in Japanese →</button></div></form><button class="text-button" disabled={busy || memories.some(m => m.id === 'question')} onclick={() => save('question')}>{memories.some(m => m.id === 'question') ? 'Question saved ✓' : 'Save the question'}</button>{/if}
          </div>{/if}
          <button class="save" disabled={busy || memories.some(m => m.id === programme.phrase.id)} onclick={() => save(programme.phrase.id)}>{memories.some(m => m.id === programme.phrase.id) ? 'Saved to your memories ✓' : '＋ Keep this phrase'}</button>
        </article>
        <button class="next" disabled={busy} onclick={() => run(async () => { await refreshMemories(); view = 'memories'; })}>02 / YOUR MEMORIES →</button>
      {:else if view === 'memories'}
        <article class="card memories"><span>02 / SERVER-SAVED MEMORIES</span><h2>A little stays with you.</h2>
          {#if card}<h3 lang="ja">{card.phrase.jp}</h3><p>{card.phrase.romaji}</p><Listen text={card.phrase.jp} lang="ja-JP" label="Listen in Japanese"/>{#if revealed}<p class="meaning">{card.phrase.meaning}</p><Listen text={card.phrase.meaning} lang={LOCALES[language]} label="Listen to the meaning"/><div class="actions"><button disabled={busy} onclick={() => review('again')}>Again</button><button class="primary" disabled={busy} onclick={() => review('good')}>Remembered</button></div>{:else}<button class="save" disabled={busy} onclick={() => revealed = true}>Reveal the meaning</button>{/if}
          {:else}<p>{memories.length ? 'Nothing due right now. No pressure.' : 'Keep a phrase from your programme to start.'}</p>{#if memories.length}<p>Next review: {new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', dateStyle: 'medium', timeStyle: 'short' }).format(Math.min(...memories.map(m => m.due)))} Brussels time.</p>{/if}{/if}
          <button class="text-button" disabled={busy} onclick={() => run(refreshMemories)}>Refresh from server</button><p class="fine">Refresh the page and reconnect: these cards stay on the local server, separate from your personal journey.</p>
        </article>
      {/if}
      </div>
    {/if}
    <details class="trace"><summary>{judgeMode ? 'Connection proof' : 'Behind the scenes'} · {entries.length} recent requests</summary><p>Actual MCP requests from this browser. No tokens or calendar contents are logged here.</p><ol>{#each entries as entry}<li class:failed={!entry.ok}><b>{entry.ok ? '✓' : '×'} {entry.name}</b><span>{entry.protocol || `${entry.status} · ${entry.ms} ms`}</span></li>{/each}</ol>{#if !entries.length}<p>Connect to see initialize, tools/list and tools/call.</p>{/if}</details>
    <footer>{judgeMode ? 'Guided interactions, not a general AI chat. Your random judge access key is stored in this browser; anyone with that key can access this example deck. No private notes are sent.' : 'An example day, not your live timetable. Your own notes stay separate in this browser.'}<a href="/student">Keep your own study notes ↗</a>{#if !judgeMode}<a href="/student-mcp">How the connection works ↗</a>{/if}</footer>
  </div>
</main>

<style>
  :global(body){margin:0;background:#162b36;color:#152e38;font-family:Arial,sans-serif} :global(*){box-sizing:border-box}
  .world{position:fixed;inset:0;z-index:-1;overflow:hidden;background:#597584}.sky{position:absolute;inset:0;background:url('/images/ride-fuji.png') center top/100% auto no-repeat}.world img{position:absolute;height:60%;max-width:45%;object-fit:contain;bottom:0;left:7%}.shade{position:absolute;inset:0;background:linear-gradient(90deg,#152b3820,#152b3870)}
  header{display:flex;align-items:center;gap:24px;padding:18px 4%;color:#fff;background:#142d3cbb;backdrop-filter:blur(8px);border-bottom:1px solid #ffffff30}header>a{color:#fff;text-decoration:none;font-size:12px}.brand{font-size:24px;font-weight:800!important;margin-right:auto}header>span{font:10px monospace;letter-spacing:1px}button,select,input{font:inherit}button{cursor:pointer}button:disabled{opacity:.55;cursor:default}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #fc9474;outline-offset:3px}header button{color:white;border:1px solid #ffffff60;background:transparent;border-radius:24px;padding:10px 15px}
  main{padding:32px 5% 75px;display:grid;grid-template-columns:1fr minmax(380px,510px);gap:8%}.intro{align-self:start;color:#fff4df;max-width:470px;text-shadow:0 2px 20px #102331}.intro>span{font:10px monospace;letter-spacing:2px}.intro h1{font:clamp(30px,3.3vw,52px)/1.1 Georgia,serif;font-weight:400}.intro p{font-size:14px}.deck{min-width:0}.sample{background:#e9f0e9ed;padding:14px 18px;border-radius:5px;font-size:12px;border-left:3px solid #bd4133}.sample p{font-size:11px;margin:6px 0 0;line-height:1.6}.connection{display:flex;align-items:center;gap:12px;justify-content:space-between;background:#152e3be8;color:white;padding:15px;margin:12px 0;border:1px solid #ffffff55;border-radius:5px}.connection strong{font-size:12px}.connection small{display:block;font-size:10px;margin-top:6px;color:#d0e0df}.connection button{flex-shrink:0;background:#bd3c30;border:0;color:white;border-radius:4px;padding:12px;font-size:12px}.error,.notice{font-size:12px;line-height:1.6;padding:15px;background:#ffecd9;border-left:3px solid #bc372b;overflow-wrap:anywhere}nav{display:flex;gap:8px}nav button{flex:1;border:1px solid #ffffff55;border-radius:4px;color:white;background:#1b3440ec;padding:14px 8px;font-size:12px}nav button[aria-current]{background:#fff6e7;color:#a13228}.language{display:flex;align-items:center;justify-content:space-between;color:#fff;font-size:11px;margin:14px 0}select{padding:8px 12px;background:#193644;color:white;border:1px solid #ffffff70;border-radius:4px}.card-stack{transform:perspective(1500px) rotateY(-4deg);transform-origin:right center}.card{background:#faf8eded;border:2px solid #c14b3e;border-radius:4px 24px 5px 14px;padding:26px;box-shadow:0 15px 50px #0a233955}.card-top{display:flex;justify-content:space-between;gap:12px;font:10px monospace;line-height:1.6}.day-actions{display:flex;gap:10px;margin-top:20px}.day-actions button,.actions button{padding:10px 15px;border:1px solid #8fa6a8;border-radius:5px;color:#19343e;background:none;font-size:12px}.event time{display:block;margin-top:22px;font:12px monospace;color:#ae3b2f}.event h2{font:29px/1.2 Georgia,serif;margin:12px 0}.event p{font-size:12px;color:#567075}.text-button{color:#a7362a;border:0;background:none;padding:12px 0;font-size:12px}.japanese{text-align:center;border-top:1px solid #d6d7c9;padding-top:22px;margin-top:14px}.japanese>span{font:9px monospace;letter-spacing:1px}.japanese h2{font-size:34px;font-weight:400;margin:16px 0 8px}.japanese p{font:13px monospace;color:#567075}.helpers{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:24px}.helpers button{border:1px solid #8fa6a8;border-radius:7px;background:none;color:#1f3940;padding:14px 5px;font-size:20px}.helpers small{display:block;font-size:10px;margin-top:7px}.helpers button[aria-pressed=true]{color:#fff;background:#b8392d;border-color:#b8392d}.explanation{margin-top:18px;padding-left:15px;border-left:2px solid #b63b2f;font-size:14px;line-height:1.6}.explanation h3{font-size:27px}.explanation label{display:block;font-size:12px;margin:15px 0 6px}input{width:100%;min-width:0;padding:12px;border:1px solid #a2b7b5;border-radius:4px;background:#fffef5}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}.actions .primary{background:#b8392d;color:#fff;border-color:#b8392d}.save{width:100%;margin-top:18px;padding:15px;border:0;border-radius:4px;text-align:left;background:#dce7dc;color:#213f3e;font-size:12px}.next{width:100%;padding:18px 25px;text-align:left;margin-top:12px;border:1px solid #fff8;border-radius:5px 15px 5px 5px;background:#e2eae8ed;color:#203c45;font:12px monospace}.memories{margin-top:18px}.memories>span{font:10px monospace}.memories h2{font:28px Georgia,serif}.memories h3{font-size:34px}.memories p{font-size:14px;line-height:1.6}.memories .fine{font-size:11px}.trace{background:#173140e8;color:#f2eee1;margin-top:20px;padding:15px;border:1px solid #ffffff40;border-radius:5px;font-size:11px}.trace summary{cursor:pointer}.trace p{line-height:1.6}.trace ol{padding-left:18px}.trace li{padding:7px 0}.trace li span{display:block;color:#a5d9ce;font:10px monospace;margin-top:5px}.trace .failed{color:#ffb49c}footer{margin-top:18px;background:#173140cc;padding:14px;color:#e6efec;font-size:10px;line-height:1.7}footer a{display:block;color:#f8d3b8;margin-top:8px}
  @media(max-width:800px){header{flex-wrap:wrap;gap:12px}header>span{display:none}.brand{font-size:20px}header>a:not(.brand){font-size:10px}header button{font-size:11px}main{display:block;padding:250px 18px 40px}.world{height:420px}.sky{background-size:auto 100%}.intro{display:none}.deck{max-width:540px;margin:auto}.card-stack{transform:none}.card{padding:22px}.connection{flex-wrap:wrap}.event h2{font-size:25px}.japanese h2{font-size:29px}}
  @media(prefers-reduced-motion:reduce){.card-stack{transform:none}}
</style>
