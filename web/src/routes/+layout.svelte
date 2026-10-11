<script>
  import AudioReader from '$lib/AudioReader.svelte';
  let { children } = $props();
</script>
{@render children()}
<AudioReader />
