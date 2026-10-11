<script>
  import { onMount } from 'svelte';
  import { speech } from '$lib/speech.js';
  import City from '$lib/City.svelte';
  import Onboarding from '$lib/Onboarding.svelte';
  let showGuide = $state(false);
  function finishGuide() {
    showGuide = false;
    try { localStorage.setItem('alexa-chan:onboarding:v1', 'done'); } catch { /* Storage may be disabled. */ }
  }
  let tab = $state('today');
  let learning = $state(null);
  let online = $state(false);
  let deck = $state({ total: 0, due: [], dueCount: 0, nextDue: null });
  let revealed = $state(false);
  let romaji = $state(true);
  let busy = $state(false);
  let message = $state('');
  let reviewed = $state(0);
  let card = $derived(deck.due[0]);
  async function loadDeck() {
    const response = await fetch('/api/review');
    if (!response.ok) throw Error('Could not load the cards.');
    deck = await response.json();
  }
  async function selectTab(value) {
    speech.stop();
    if (showGuide) finishGuide();
    tab = value; message = ''; revealed = false;
    if (value === 'review') try { await loadDeck(); } catch (error) { message = error.message; }
  }
  async function rate(rating) {
    speech.stop();
    if (!card || busy) return;
    busy = true; message = '';
    try {
      const response = await fetch(`/api/review/${card.id}/rate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating, reviews: card.reviews }) });
      if (!response.ok) throw Error('Your rating was not saved. Reload the cards before trying again.');
      reviewed += 1; revealed = false;
      await loadDeck();
    } catch (error) { message = error.message; }
    finally { busy = false; }
  }
  function listen() {
    if (card) speech.speak(card.jp, 'ja-JP');
  }
  onMount(() => {
    try { showGuide = localStorage.getItem('alexa-chan:onboarding:v1') !== 'done'; } catch { showGuide = true; }
    let stopped = false, timer;
    async function poll() {
      try {
        const response = await fetch('/api/state', { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw Error();
        const state = await response.json(); learning = state.learning || null; online = true;
      } catch { online = false; }
      if (!stopped) timer = setTimeout(poll, 2000);
    }
    poll(); loadDeck().catch(() => {});
    return () => { stopped = true; clearTimeout(timer); };
  });
</script>

<svelte:head><title>Alexa-chan — A little Japanese, every day</title><meta name="description" content="Your everyday life becomes a little Japanese adventure. Conversations, quests, and pressure-free review."/></svelte:head>

<div class="shell">
  <header><a href="/" class="brand"><span class="brand-symbol">ア</span>alexa<span>-chan</span></a><nav aria-label="Main navigation"><button class:active={tab === 'today'} onclick={() => selectTab('today')}>Today</button><button class:active={tab === 'review'} onclick={() => selectTab('review')}>Review <span class="count">{deck.dueCount}</span></button></nav><span class="status" role="status"><i class:online></i>{online ? 'Connected' : 'Offline'}</span></header>
  <div class="guide-link"><a href="/student">Study notes · FR / NL / DE / EN ↗</a><a href="/student-mcp">Noor’s university day ↗</a><button onclick={() => showGuide = true}>How does it work?</button></div>
  {#if showGuide}
    <Onboarding onfinish={finishGuide}/>
  {:else if tab === 'today'}
    <section class="hero"><div class="hero-copy"><span class="eyebrow">EVERYDAY LIFE, ANIME STYLE</span><h1>A little<br>adventure.<br><em>Every day.</em></h1><p>Live your day. Pick up a little Japanese along the way.</p><div class="voice"><span>◉</span> Legacy Alexa voice skill · French</div></div><div class="scene"><City/><span class="scene-caption">次の一歩 / THE NEXT STEP</span></div></section>
    <main class="today-grid"><section class="conversation"><div class="section-label"><span>01 / WHAT YOU JUST HEARD</span><span aria-hidden="true">↙</span></div>{#if learning?.last}<h2 lang="ja">{learning.last.jp}</h2><p class="roman">{learning.last.romaji}</p><p lang="fr">{learning.last.fr}</p><small>French translation from the legacy Alexa skill</small>{:else}<h2 lang="ja">おはよう！</h2><p class="roman">Ohayō! · Good morning!</p><p>Try the English ride demo to get started.</p>{/if}<div class="keywords"><div><b>Iké</b><small>Meaning</small></div><div><b>Motto</b><small>Explain</small></div><div><b>Nanté</b><small>How to say it</small></div></div></section><section class="quest"><div class="section-label">02 / A QUEST, IF YOU WANT</div><img class="quest-illustration" src="/images/weather-quest.png" alt="A courier under an umbrella in a futuristic city after the rain." width="1024" height="1536" loading="lazy"/><div class="quest-art" aria-hidden="true">{learning?.quest?.status === 'done' ? '✓' : '↗'}</div><h2>{learning?.quest?.status === 'done' ? 'You did it!' : learning?.quest ? learning.quest.title : 'Your next small step.'}</h2><p>{learning?.quest ? learning.quest.romaji : 'Try Nanté in the English demo to start a mini quest.'}</p><span class="soft-label">{learning?.quest?.status === 'done' ? 'A real question. A real win.' : 'No timer. Hints count too.'}</span></section></main>
  {:else}
    <main class="review"><p class="legacy-note">Legacy Alexa integration: saved translations are in French. <a href="/ride">Open the English learning demo ↗</a></p><div class="review-intro"><span class="eyebrow">A LITTLE TODAY. A LITTLE MORE TOMORROW.</span><h1>Remember this?</h1><p>Words from your conversations. At your own pace.</p></div><div class="review-layout"><aside><div class="mini-scene"><img class="memory-illustration" src="/images/memory-quest.png" alt="Glowing memory cards above a retrofuturistic terminal." width="1024" height="1536" loading="lazy"/></div><h2>No streak to maintain.</h2><p>A few cards are enough.<br>Stop whenever you like.</p><div class="review-stat"><b>{reviewed}</b><span>cards reviewed today<br><small>during this visit</small></span></div><small>Shared legacy demo collection · {deck.total} cards</small></aside><section class="flashcard" aria-label="Review card"><div class="section-label"><span>{card ? (card.kind === 'question' ? 'HOW DO YOU ASK?' : 'DO YOU RECOGNISE THIS PHRASE?') : 'YOUR COLLECTION'}</span><span>{deck.dueCount} due</span></div>{#if card}<div class="card-face"><h2 lang={card.kind === 'question' ? 'fr' : 'ja'}>{card.kind === 'question' ? card.fr : card.jp}</h2>{#if romaji && card.kind !== 'question'}<p class="roman">{card.romaji}</p>{/if}{#if revealed}<div class="answer"><h3>{card.kind === 'question' ? card.jp : card.fr}</h3>{#if card.kind === 'question' && romaji}<p class="roman">{card.romaji}</p>{/if}</div>{/if}</div><div class="card-tools"><label><input type="checkbox" bind:checked={romaji}/> Romaji</label>{#if card.kind !== 'question' || revealed}<button onclick={listen}>♪ Listen</button>{/if}</div>{#if !revealed}<button class="primary reveal" onclick={() => revealed = true}>Reveal the answer ↗</button>{:else}<p class="rating-label">How did that feel?</p><div class="ratings">{#each [['again','Again','1 min'],['hard','Hard','≥ 1 day'],['good','Good','≥ 3 days'],['easy','Easy','≥ 7 days']] as [value,label,time]}<button disabled={busy} onclick={() => rate(value)}>{label}<small>{time}</small></button>{/each}</div>{/if}{:else}<div class="card-face"><div class="empty-mark" aria-hidden="true">{deck.total ? '✓' : 'あ'}</div><h2>{deck.total ? 'All done for now.' : 'It starts with a conversation.'}</h2><p>{deck.total ? 'Come back later: your cards will return when they are due.' : 'This legacy deck receives phrases from the French Alexa skill. For English learning, open the ride demo.'}</p></div>{/if}<div role="status" class="message">{message}</div><button class="refresh" onclick={async () => { try { await loadDeck(); revealed = false; message = ''; } catch (e) { message = e.message; } }}>Refresh cards</button></section></div></main>
  {/if}
  <footer><span>A small step already means a lot.</span><span lang="ja">君ならできる。</span></footer>
</div>

<style>
.quest-illustration{width:100%;height:220px;object-fit:cover;object-position:center 48%;display:block;margin-top:20px;border-radius:3px}.memory-illustration{width:100%;height:auto;display:block}.quest .quest-art{font-size:32px;margin-top:14px}

.guide-link{display:flex;justify-content:space-between;align-items:center;gap:16px}.guide-link a{color:#a2201a;font-size:12px}.guide-link button{background:none;border:0;color:#526258;padding:12px 0;font-size:12px;min-height:44px}
:global(*){box-sizing:border-box} :global(body){margin:0;background:#e4e9e3;color:#202b29;font-family:Arial,sans-serif} :global(button),:global(input){font:inherit} :global(button){cursor:pointer} :global(button:focus-visible),:global(a:focus-visible){outline:3px solid #c83128;outline-offset:5px} .shell{max-width:1300px;margin:auto;padding:0 38px}header{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:25px 0;border-bottom:1px solid #bdc8c0}.brand{display:flex;align-items:center;font-size:24px;font-weight:800;letter-spacing:-1px;text-decoration:none;color:inherit}.brand>span:last-child{font-weight:400}.brand-symbol{display:grid;place-items:center;width:35px;height:35px;background:#c83128;color:#fff;margin-right:10px;transform:rotate(-7deg)}nav{display:flex;gap:8px}nav button,.card-tools button,.refresh{border:0;background:transparent;padding:10px 14px;color:#56655c}nav button.active{background:#202b29;color:#fff;border-radius:24px}.count{font-size:11px;margin-left:5px}.status{font:11px monospace;display:flex;align-items:center;gap:8px}.status i{width:7px;height:7px;border-radius:50%;background:#8a948f}.status i.online{background:#c83128}.hero{display:grid;grid-template-columns:1fr 1.3fr;align-items:center;gap:24px;padding:45px 0}.eyebrow,.section-label{font:10px/1.6 monospace;letter-spacing:1.5px}h1{font-size:clamp(40px,5.2vw,70px);line-height:1.02;letter-spacing:-3px;margin:22px 0;font-weight:800}h1 em{color:#c83128;font-style:normal}p{line-height:1.65;color:#526258;font-size:14px}.hero-copy>p{max-width:290px}.voice{margin-top:27px;font-size:13px;display:flex;align-items:center;gap:12px}.voice span{font-size:25px;color:#c83128}.scene{position:relative;transform:rotate(-2deg);border:8px solid #f2f2e9;box-shadow:7px 10px 0 #202b2912}.scene-caption{display:block;padding:12px;background:#f2f2e9;font:10px monospace;letter-spacing:2px}.today-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:22px;padding-bottom:38px}.conversation,.quest{padding:28px;background:#f5f4ec;border-radius:3px}.section-label{display:flex;justify-content:space-between;gap:15px;color:#56655c}.conversation h2{font-size:34px;margin:30px 0 12px}.roman{font-family:monospace;font-size:13px}.keywords{display:flex;justify-content:space-between;border-top:1px solid #cdd3c9;padding-top:20px;margin-top:25px;gap:18px}.keywords b{font-size:20px}.keywords small{display:block;margin-top:7px;color:#657065}.quest{position:relative;background:#c7dce0}.quest-art{font-size:65px;line-height:1;color:#c83128;margin-top:18px}.quest h2{font-size:24px;letter-spacing:-.7px;margin:12px 0}.soft-label{font-size:11px;color:#526258}footer{padding:22px 0;border-top:1px solid #bdc8c0;display:flex;justify-content:space-between;gap:12px;font-size:11px;color:#657065}footer span:last-child{color:#c83128}.review{padding:35px 0}.review-intro h1{margin:12px 0}.review-layout{display:grid;grid-template-columns:.7fr 1.3fr;gap:40px;margin-top:30px}.mini-scene{max-width:310px;border:5px solid #f5f4ec;transform:rotate(-3deg);margin:10px 0 28px}aside h2{font-size:20px}aside>small{font-size:10px;color:#657065}.review-stat{display:flex;gap:15px;align-items:center;margin:22px 0}.review-stat b{font-size:44px;color:#c83128}.review-stat span{font-size:12px;line-height:1.5}.flashcard{background:#f5f4ec;padding:28px;box-shadow:5px 5px 0 #202b2910;min-width:0}.card-face{min-height:225px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px 0}.card-face h2{font-size:30px;line-height:1.4;margin:12px 0;overflow-wrap:anywhere}.card-face h3{font-size:21px;margin:10px 0}.answer{border-top:1px solid #cbd3c8;margin-top:15px;padding-top:14px;width:100%}.card-tools{display:flex;align-items:center;justify-content:space-between;font-size:12px;min-height:42px}.primary{background:#c83128;color:white;border:0;padding:16px 20px}.reveal{width:100%;margin-top:15px}.ratings{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.ratings button{padding:13px 4px;background:#e4e9e3;border:1px solid #c3cfc3;font-size:12px}.ratings button:last-child{background:#c7dce0}.ratings small{display:block;margin-top:8px;font-size:10px}.rating-label{font-size:12px}.message{color:#a2201a;font-size:12px;margin-top:14px}.refresh{font-size:11px;padding-left:0}.empty-mark{font-size:64px;color:#c83128}.ratings button:disabled{opacity:.5;cursor:wait}
@media(max-width:700px){.shell{padding:0 18px}header{flex-wrap:wrap;padding:18px 0}.brand{font-size:21px}.status{display:none}.hero,.today-grid,.review-layout{grid-template-columns:1fr}.hero{gap:25px;padding:30px 0}h1{font-size:51px}.hero-copy>p{max-width:none}.scene{max-width:500px}.review-layout{gap:20px}.review-layout aside{display:none}.conversation,.quest,.flashcard{padding:22px}.conversation h2{font-size:28px}.card-face h2{font-size:26px}nav button{padding:9px;font-size:12px}.section-label{font-size:9px}.keywords{gap:10px}}
</style>
