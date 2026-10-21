<script>
  import { onMount, onDestroy } from 'svelte';
  import Listen from '$lib/Listen.svelte';
  import { speech } from '$lib/speech.js';
  import RideScene from '$lib/RideScene.svelte';
  import { scenes, capture, getCard, matchesQuestion } from '$lib/demo.js';
  let paused = $state(false), reduced = $state(true), simple = $state(false), fallback = $state(false);
  let active = $state('weather'), open = $state(true), helper = $state(''), input = $state(''), feedback = $state('');
  let cards = $state(capture([], 'weather')), completed = $state([]), reviewed = $state([]), queue = $state([]), revealed = $state(false), audioMessage = $state('');
  let scene = $derived(scenes[active]);
  let otherCards = $derived.by(() => {
    const selected = active;
    return ['weather', 'calendar', 'memories'].filter(key => key !== selected);
  });
  let memory = $derived(queue.length ? getCard(queue[0]) : null);
  const labels = { weather: 'Weather', calendar: 'Calendar', memories: 'Memories' };
  let stopped = $derived(paused || reduced || simple || fallback);
  onMount(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>reduced=media.matches; update(); media.addEventListener('change',update);
    return ()=>media.removeEventListener('change',update);
  });
  function silence(){speech.stop();}
  onDestroy(silence);
  function select(key){
    silence(); active=key; open=false; helper=''; input='';feedback='';audioMessage='';revealed=false;
    if(key==='memories') queue=cards.filter(id=>!reviewed.includes(id));
  }
  function ask(){open=true;cards=capture(cards,active);}
  function help(key){helper=key;cards=capture(cards,active);if(key==='nante') cards=capture(cards,active,'question');}
  function attempt(){
    if(!matchesQuestion(active,input)){feedback='Try the suggested phrase in Japanese or romaji. This demo only recognises these phrases.';return;}
    cards=capture(cards,active,'question'); if(!completed.includes(active)) completed=[...completed,active];
    feedback='You did it! An everyday question, in Japanese.';
  }
  function rate(remembered){
    const id=queue[0]; if(!id)return;
    queue=remembered?queue.slice(1):[...queue.slice(1),id];
    if(remembered)reviewed=[...reviewed,id];revealed=false;silence();
  }

  function reset(){cards=[];completed=[];reviewed=[];queue=[];select('weather');}
</script>

<svelte:head><title>The ride · Alexa-chan</title><meta name="description" content="A ride towards Mount Fuji. Weather, your calendar, and a little Japanese along the way."/></svelte:head>

<div class="ride" class:simple class:still={stopped}>
  <div class="world" aria-hidden="true">
    <div class="sky"></div>
    {#if !simple && !fallback}<RideScene paused={stopped} slow={!!helper || active==='memories'} onfallback={()=>fallback=true}/>{/if}
    <div class="shade"></div>
    {#if fallback}<img class="fallback-rider" src="/images/ride-rider-courier.png" alt="" />{/if}
  </div>
  <header><a class="brand" href="/"><i></i>alexa-chan</a><nav aria-label="Navigation"><a href="/ride" aria-current="page">The ride</a><a href="/student-mcp">Kaela’s university day</a><a href="/student-ride">Study notes</a></nav><div class="controls"><button onclick={()=>simple=!simple} aria-pressed={simple}>{simple?'Immersive view':'Simple view'}</button><button onclick={()=>paused=!paused} disabled={reduced||simple||fallback} aria-pressed={stopped}>{stopped?'▷ Resume':'Ⅱ Pause'}</button></div></header>
  <main>
    <div class="journey"><span class="eyebrow">CHAPTER 01 / THE FIRST STEP</span><h1>A little Japanese,<br/><em>along the way.</em></h1><p>No tests. Just a day to live.</p><div class="route"><span lang="ja">東京</span><i></i><span lang="ja">富士山</span></div></div>
    <section class="deck" aria-label="Journey cards">
      <div class="deck-meta"><span>MARTA / BEGINNER</span><span>{cards.length} {cards.length===1?'memory':'memories'} · {completed.length}/2 quests</span></div>
      <div class="card-stack">
      {#key active}<article class="card">
        <div class="card-heading"><span>0{active==='weather'?1:active==='calendar'?2:3} / {labels[active].toUpperCase()}</span><span aria-hidden="true">{active==='weather'?'':active==='calendar'?'◷':'✧'}</span></div>
        {#if active==='memories'}
          {#if memory}<div class="memory-face"><span class="eyebrow">DO YOU REMEMBER?</span><h2 lang="ja">{memory.jp}</h2><p class="romaji">{memory.romaji}</p><Listen text={memory.jp} lang="ja-JP" label="Listen in Japanese" />{#if revealed}<p class="translation">{memory.en}</p><Listen text={memory.en} label="Listen to the meaning" />{:else}<button class="primary" onclick={()=>revealed=true}>Reveal the answer ↗</button>{/if}</div>{#if revealed}<div class="ratings"><button onclick={()=>rate(false)}>Review again ↺</button><button onclick={()=>rate(true)}>I remember ✓</button></div>{/if}<p class="small">{queue.length} left · review during this visit</p>
          {:else}<h2>{cards.length?'A small step. A big beginning.':'It starts with a conversation.'}</h2><p>{cards.length?'Your memories are reviewed for this session. Keep riding at your own pace.':'Ask about the weather or your day. The phrases you encounter will appear here.'}</p><button class="primary" onclick={()=>select('weather')}>Back to your day →</button>{/if}
        {:else}
          {#if active==='weather'}<div class="weather-top"><div class="temperature">18<span>°</span></div><svg class="weather-icon" viewBox="0 0 100 90" aria-hidden="true"><g stroke="#e6a041" stroke-width="3" stroke-linecap="round"><path d="M39 5v7m0 46v7M9 35h7m46 0h7M18 14l5 5m32 32 5 5M18 56l5-5m32-32 5-5"/><circle cx="39" cy="35" r="16" fill="#f2b04f" stroke="none"/></g><path d="M30 71c-13 0-15-19-3-23 0-22 30-27 38-7 20-5 29 27 10 30Z" fill="#a0b2c0"/></svg></div><h2 class="weather-title">A sunny start to your day.</h2><p class="location">Brussels · sample weather</p>{:else}<h2>Your day,<br/>your adventure.</h2><div class="events"><div><b>09:30</b><span>Team meeting</span></div><div><b>14:00</b><span>Coffee with Lea</span></div></div><p class="location">Sample calendar · no account connected</p>{/if}
          {#if !open}<button class="primary ask" onclick={ask}>« {scene.prompt} » ↗</button><p class="small">Click to ask · no microphone</p><Listen text={scene.prompt} label="Listen to the request" />
          {:else}<div class="answer"><p class="spoken-answer">{scene.answer}</p><h3 lang="ja">{scene.jp}</h3><p class="romaji">{scene.romaji}</p><Listen text={scene.answer} label="Listen in English" /><Listen text={scene.jp} lang="ja-JP" label="Listen in Japanese" /></div>
          <div class="helpers">{#each [['ike','Iké','Meaning'],['motto','Motto','Explain'],['nante','Nanté','My turn']] as [id,label,description]}<button class:chosen={helper===id} aria-pressed={helper===id} onclick={()=>help(id)}><b>{label}</b><small>{description}</small></button>{/each}</div>
          {#if helper}<div class="help" aria-live="polite">{#if helper==='ike'}<p>{scene.translation}</p><Listen text={scene.translation} label="Listen to the meaning" />{:else if helper==='motto'}<p>{scene.detail}</p><Listen text={scene.detail} label="Listen to the explanation" />{:else}<p class="small">YOUR OPTIONAL MINI QUEST</p><h3 lang="ja">{scene.question}</h3><p class="romaji">{scene.questionRomaji}</p><Listen text={scene.question} lang="ja-JP" label="Listen to the question" /><p>{scene.questionMeaning}</p><Listen text={scene.questionMeaning} label="Listen to its meaning" /><form onsubmit={e=>{e.preventDefault();attempt();}}><label for="question">Try it in Japanese or romaji</label><input id="question" bind:value={input} autocomplete="off" placeholder={scene.questionRomaji}/><div class="quest-actions"><button type="button" class="quiet" onclick={()=>input=scene.questionRomaji}>Use a hint</button><button class="primary" disabled={!input.trim()}>Try it ↗</button></div></form><p role="status">{feedback}</p>{#if feedback}<Listen text={feedback} label="Listen to feedback" />{/if}{/if}</div>{/if}
          <button class="continue" onclick={()=>select(active==='weather'?'calendar':'memories')}>Continue my day →</button>{/if}
        {/if}
        {#if audioMessage}<p class="small" role="status">{audioMessage}</p>{/if}
      </article>{/key}
      <div class="other-cards">{#each otherCards as key (key)}<button onclick={()=>select(key)}><span>0{key==='weather'?1:key==='calendar'?2:3} / {labels[key].toUpperCase()}</span><span>↗</span></button>{/each}</div>
      </div>
      <p class="disclosure">Guided demo · scripted responses · no live Alexa+ connection<br/>Progress lasts for this visit. <button onclick={reset}>Start over</button></p>
    </section>
  </main>
  <footer><span><i></i>{reduced?'Reduced motion':fallback?'Static scene · 3D unavailable':simple?'Simple view':paused?'A break, at your own pace':helper||active==='memories'?'The road slows down. Take your time.':'A little Japanese, along the way.'}</span><span>TOKYO → FUJI · INTERACTIVE DEMO</span></footer>
</div>

<style>
  .fallback-rider{position:absolute;left:10%;bottom:2%;height:55%;max-width:45%;object-fit:contain;object-position:bottom}
  @media(min-width:801px){
    .deck{perspective:1400px}
    .card-stack{transform:perspective(1400px) rotateY(-7deg) rotateZ(-.6deg);transform-origin:center right}
    .simple .card-stack{transform:none}
  }
  :global(body){margin:0;background:#233b49;color:#182c38;font-family:Arial,sans-serif}
:global(*){box-sizing:border-box}
button,input,a{touch-action:manipulation}
button,input{font:inherit}
button{cursor:pointer}
button:disabled{opacity:.5;cursor:default}
button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #ef6953;outline-offset:4px}
.ride{min-height:100svh;isolation:isolate}
.world{position:fixed;inset:0;z-index:-1;overflow:hidden;background:#607e91}
.sky{position:absolute;inset:0;background:#405e71 url('/images/ride-fuji.png') center top/100% auto no-repeat}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,#071e3318,transparent 35%,#152a3910 75%,#101f3555)}
header{display:flex;align-items:center;gap:34px;min-height:62px;padding:7px 3%;border-bottom:1px solid #ffffff30;background:#18304140;color:#fff;backdrop-filter:blur(6px)}
a{color:inherit;text-decoration:none}
.brand{display:flex;align-items:center;gap:12px;font-size:26px;font-weight:bold;letter-spacing:-1px}
.brand i{width:15px;height:15px;background:#ee4c41;border-radius:50%}
nav{display:flex;gap:25px;font-size:13px}
nav a{padding:14px 0;opacity:.7}
nav a[aria-current]{border-bottom:2px solid #ef584a;opacity:1}
.controls{margin-left:auto;display:flex;gap:10px}
.controls button{color:#fff;border:1px solid #ffffff65;border-radius:30px;background:#20394770;padding:10px 17px;font-size:12px;min-height:40px}
main{padding:28px 6% 80px;display:flex;justify-content:flex-end;gap:35px;align-items:flex-start}
.journey{color:#fff4e8;margin-top:18px;text-shadow:0 2px 18px #173448}
.eyebrow{font:10px/1.6 monospace;letter-spacing:2px}
h1{font-size:clamp(32px,3.6vw,55px);line-height:1.05;font-weight:500;letter-spacing:-2px;margin:17px 0}
h1 em{font-style:normal;color:#ffdcbd}
.journey p{font-size:13px}
.route{display:flex;align-items:center;gap:15px;width:200px;margin-top:26px;font-size:11px}
.route i{height:1px;flex:1;background:#eecbb57a}
.deck{width:clamp(350px,29vw,460px);flex-shrink:0;perspective:1200px}
.deck-meta{display:flex;justify-content:space-between;font:9px/1.6 monospace;letter-spacing:1px;color:#fff;padding:0 3px 13px;text-shadow:0 1px 3px #0d2636}
.card{background:linear-gradient(120deg,#fffdf6f5,#e4e9e7f2);padding:28px 28px 20px;border:2px solid #c94c42;border-radius:3px 20px 3px 13px;box-shadow:0 18px 60px #10283560,4px 4px 0 #9e332b55;animation:arrive .5s ease-out}
@keyframes arrive{from{opacity:0}
to{opacity:1}
}
.card-heading{display:flex;justify-content:space-between;align-items:center;font:11px monospace;letter-spacing:1.8px}
.card-heading>span:last-child{font-size:30px;color:#d17e37}
.temperature{font-family:Georgia,serif;font-size:100px;line-height:1.1;letter-spacing:-8px;margin-top:4px}
.temperature span{font-size:65px;vertical-align:top}
.weather-top{display:flex;align-items:center;justify-content:space-between;margin-top:14px}
.weather-icon{width:88px;height:80px;flex-shrink:0}
.weather-title{font-size:clamp(21px,1.7vw,28px)}
h2{font-family:Georgia,serif;font-weight:400;font-size:29px;line-height:1.15;letter-spacing:-.7px;margin:12px 0}
p{font-size:13px;line-height:1.65}
.location{font:10px monospace;color:#637480;margin:15px 0 23px}
.primary{background:#bd392e;color:#fff;border:0;border-radius:5px;padding:12px 16px;font-size:12px;line-height:1.5}
.ask{width:100%;text-align:left}
.small{font-size:10px;color:#586e78;line-height:1.6}
.answer{position:relative;padding-top:12px;text-align:center}
.answer::before{content:'';display:block;width:32px;height:1px;background:#c34638;margin:0 auto 20px}
.spoken-answer{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.answer p:first-child{font-size:12px}
.answer h3,.help h3{font-size:27px;font-weight:500;margin:18px 0 8px}
.romaji{font-family:monospace;font-size:13px;margin:7px 0}
.quiet{background:none;border:0;color:#914038;font-size:11px;padding:10px 0}
.helpers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px;align-items:stretch}
.helpers button{display:grid;grid-template-rows:24px 16px;align-content:center;gap:5px;min-height:68px;border:1px solid #95a8ae;background:transparent;border-radius:9px;padding:10px 4px}
.helpers button.chosen{background:#bb382e;color:#fff;border-color:#bb382e}
.helpers:not(:has(.chosen)) button:first-child{background:#bb382e;color:#fff;border-color:#bb382e}
.helpers b{font-size:17px;font-weight:500}
.helpers small{display:block;font-size:9px;margin:0;line-height:16px;white-space:nowrap}
.help{margin-top:15px;border-left:2px solid #c54639;padding-left:13px}
.help p{font-size:12px}
.help label{font-size:10px;display:block;margin:12px 0 7px}
.help input{width:100%;padding:11px;border:1px solid #9bafb6;border-radius:3px;background:#ffffff8f;color:#182c38;font-size:12px}
.quest-actions{display:flex;justify-content:space-between;margin-top:8px}
.continue{background:none;border:0;color:#9b382e;font-size:11px;font-weight:bold;padding:16px 0 2px}
.events{margin:20px 0}
.events>div{display:flex;gap:22px;border-bottom:1px solid #bcc9cc;padding:13px 0;font-size:13px}
.events b{font:14px monospace;color:#af3d31}
.other-cards{display:grid;gap:12px;margin-top:14px}
.other-cards button{display:flex;justify-content:space-between;align-items:center;padding:17px 22px;background:#e9f0efdb;border:1px solid #ffffff8c;border-radius:5px 15px 5px 5px;box-shadow:0 10px 24px #12293633;color:#243a47;font:10px monospace;letter-spacing:1px}
.other-cards button:hover{background:#fff4e8}
.disclosure{font-size:9px;color:#f1f4f2;text-shadow:0 1px 4px #142e40;line-height:1.7}
.disclosure button{background:none;border:0;color:inherit;text-decoration:underline;font-size:9px;padding:0}
.memory-face{text-align:center;min-height:240px;padding:30px 0 20px}
.memory-face h2{font:27px/1.5 Arial,sans-serif}
.memory-face .primary{display:block;margin:20px auto 0}
.translation{border-top:1px solid #a1b4b8;padding-top:18px;font-size:18px}
.ratings{display:flex;gap:8px}
.ratings button{flex:1;padding:13px 5px;border:1px solid #a5babc;border-radius:5px;background:#d9e4df;color:#243c44;font-size:11px}
footer{position:fixed;bottom:0;left:0;right:0;padding:17px 4%;display:flex;justify-content:space-between;color:#edeade;font:9px monospace;letter-spacing:1px;background:linear-gradient(transparent,#152835d9);pointer-events:none}
footer i{display:inline-block;width:20px;height:2px;background:#ef6753;vertical-align:middle;margin-right:10px}
.simple .world{opacity:.2}
.simple main{max-width:1100px;margin:auto}
.simple .deck{width:440px}
.simple .card{animation:none}
@media(min-width:801px){
  .journey{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
  .simple .journey{position:static;width:auto;height:auto;clip-path:none}
  .simple main{justify-content:space-between}
  .answer h3{font-size:clamp(26px,2.1vw,34px);white-space:nowrap}
  .helpers{margin-top:10px}
}
@media(prefers-reduced-motion:reduce){.card{animation:none}}
@media(min-width:1500px){.deck{width:440px}
.card{padding:30px 34px}
}
@media(max-width:800px){header{padding:12px 20px;gap:14px;flex-wrap:wrap}
.brand{font-size:22px}
nav{display:none}
.controls{gap:6px}
.controls button{padding:8px 10px;font-size:10px}
main{display:block;padding:25px 20px 90px}
.journey{margin-top:0;height:310px;pointer-events:none}
.journey h1{font-size:24px;max-width:250px}
.journey p{max-width:190px;font-size:11px}
.route{display:none}
.deck,.simple .deck{width:min(100%,440px);margin:0 auto}
.world{height:470px}
.sky{background-size:auto 100%;background-position:center top}
.deck-meta{background:#17344370;padding:10px}
.card{padding:24px}
.temperature{font-size:78px}
.simple .journey{height:auto;margin-bottom:24px}
.simple .world{height:100%}
footer{font-size:8px}
footer>span:last-child{display:none}
}
</style>
