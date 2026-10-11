<script>
  import City from './City.svelte';
  let { onfinish } = $props();
  let step = $state(0);
  let selected = $state('Iké');
  const steps = [
    { title: 'Start in English.', text: 'Alexa-chan answers your request, then adds a little Japanese. You don’t need to know a single word.', quote: 'What’s the weather today?', hint: 'Try the weather card in the English ride demo.' },
    { title: 'Follow your curiosity.', text: 'After the Japanese phrase, you can leave it there. Or choose a shortcut to explore a little further.', quote: '今日は雨だ！', hint: 'Kyō wa ame da! · Example weather response' },
    { title: 'Try when you’re ready.', text: 'Choose Nanté to try an everyday request in Japanese. Hints count too, with no timer or pressure.', quote: '今日の天気は？', hint: 'Kyō no tenki wa? · What’s the weather today?' },
    { title: 'Meet your words again.', text: 'In Memories, phrases from your conversations become cards. Reveal the answer, then tell us whether you remembered it.', quote: '雨 → rain', hint: 'Choose Review again or I remember. The demo keeps your progress for this visit.' }
  ];
  const examples = { 'Iké': '“It’s raining today!” — the meaning in English.', 'Motto': '“Ame means rain. Kyō means today.” — a little explanation.', 'Nanté': '“Kyō no tenki wa?” — how to ask about the weather in Japanese.' };
</script>

<main class="onboarding" aria-label="Welcome to Alexa-chan">
  <div class="top"><span>YOUR FIRST SMALL STEP</span><button onclick={onfinish}>Skip the guide ↗</button></div>
  <div class="layout"><div class="visual"><City/><div class="caption">聞く · わかる · 話す<br><span>Listen. Understand. Try.</span></div></div><section>
    <div class="progress" aria-label={`Step ${step + 1} of 4`}>{#each steps as item, i}<span class:current={i <= step}></span>{/each}<small>{step + 1} / 4</small></div>
    <div aria-live="polite"><h1>{steps[step].title}</h1><p>{steps[step].text}</p><div class="example"><strong>{steps[step].quote}</strong><p>{steps[step].hint}</p></div></div>
    {#if step === 0}<p class="note">Start with the English ride demo or Marta’s guided journey. Use the buttons to simulate requests; no microphone is needed.</p><details><summary>Using the legacy Alexa skill?</summary><p>The separate legacy “quest mode” skill still uses French (France). Enable development testing in your Amazon account and use the same account on your Echo. Its server and tunnel must be running. The English web demo works independently.</p></details>{/if}
    {#if step === 1}<div class="shortcuts" aria-label="Shortcut examples">{#each Object.keys(examples) as keyword}<button aria-pressed={selected === keyword} onclick={() => selected = keyword}>{keyword}</button>{/each}</div><p class="explanation" aria-live="polite">{examples[selected]}</p><small>These buttons show examples; they do not send commands to Alexa.</small>{/if}
    {#if step === 2}<p class="note">Nanté shows you how to ask. Type the suggested Japanese or romaji phrase to complete the optional demo quest.</p>{/if}
    {#if step === 3}<p class="note">The ride starts with a sample weather phrase. New phrases join your Memories as you explore. Demo progress lasts for this visit.</p>{/if}
    <div class="actions"><button disabled={step === 0} onclick={() => step -= 1}>← Back</button><button class="primary" onclick={() => step < 3 ? step += 1 : onfinish()}>{step === 3 ? 'Let’s go ↗' : 'Continue →'}</button></div>
  </section></div>
</main>

<style>
.onboarding{padding:25px 0 38px}.top{display:flex;justify-content:space-between;align-items:center;gap:12px;font:10px monospace;letter-spacing:1px}button{background:none;border:0;color:#526258;padding:12px;font:inherit;min-height:44px}.layout{display:grid;grid-template-columns:1fr 1fr;gap:45px;align-items:center;padding:32px 0}.visual{border:8px solid #f5f4ec;transform:rotate(-2deg);background:#f5f4ec}.caption{text-align:center;font-size:28px;padding:24px}.caption span{font-size:12px;color:#526258}.progress{display:flex;gap:7px;align-items:center}.progress>span{height:4px;width:32px;background:#c0cdc5}.progress>span.current{background:#c83128}.progress small{margin-left:8px;font:11px monospace}h1{font-size:clamp(32px,4vw,48px);letter-spacing:-1.7px;line-height:1.1;margin:24px 0 16px}p{font-size:14px;line-height:1.7;color:#526258}.example{background:#f5f4ec;padding:22px;margin:24px 0}.example strong{font-size:25px;font-weight:600}.example p{font-size:12px;margin-bottom:0}.note,details p{font-size:12px}summary{cursor:pointer;font-size:12px;padding:8px 0}.shortcuts{display:flex;gap:9px}.shortcuts button{border:1px solid #aebdb3;min-width:70px}.shortcuts button[aria-pressed=true]{background:#202b29;color:#fff}.explanation{min-height:48px}small{font-size:11px;color:#526258}.actions{display:flex;justify-content:space-between;margin-top:25px;gap:12px}.primary{background:#c83128;color:white;padding:12px 22px}button:disabled{opacity:.35;cursor:default}@media(max-width:700px){.layout{grid-template-columns:1fr;gap:25px;padding:24px 0}.visual{max-width:320px;margin:auto}.caption{padding:10px;font-size:20px}.example strong{font-size:22px}h1{margin-top:20px}}
</style>
