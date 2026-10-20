<script>
  import { speech } from './speech.js';
  let { text, lang = 'en-US', label = 'Listen' } = $props();
</script>
<button class="listen" data-audio-ui type="button" aria-label={label} onclick={() => speech.speak(text, lang, label)}><span aria-hidden="true">♪</span> {label}</button>
<style>
  .listen{font:inherit;font-size:12px;line-height:1.5;background:transparent;border:0;color:var(--action-ink);padding:10px 6px;min-height:var(--control-target);min-width:var(--control-target);cursor:pointer;touch-action:manipulation}
  .listen:hover{text-decoration:underline}.listen:focus-visible{outline:3px solid var(--focus);outline-offset:2px;border-radius:3px}
</style>
