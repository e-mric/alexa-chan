<script>
  import AudioReader from '$lib/AudioReader.svelte';
  import '$lib/identity.css';
  let { children } = $props();
</script>
{@render children()}
<AudioReader />
