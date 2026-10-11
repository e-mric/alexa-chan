<script>
  import { speech } from './speech.js';
  let { text, lang = 'en-US', label = 'Listen' } = $props();
</script>
<button class="listen" data-audio-ui type="button" aria-label={label} onclick={() => speech.speak(text, lang)}><span aria-hidden="true">♪</span> {label}</button>
<style>
  .listen{font:inherit;font-size:11px;line-height:1.5;background:transparent;border:0;color:#914038;padding:8px 3px;min-height:34px;cursor:pointer;touch-action:manipulation}
  .listen:hover{text-decoration:underline}.listen:focus-visible{outline:3px solid #e56a52;outline-offset:2px;border-radius:3px}
</style>
