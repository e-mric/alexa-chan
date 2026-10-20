<script>
  let { active = 'today', labels = { today: 'Today', notes: 'Notes', memories: 'Memories' },
    count = 0, ontoday, onnotes, onmemories, todayHref, notesHref, memoriesHref,
    disabled = false } = $props();
  const items = $derived([
    { key: 'today', label: labels.today, href: todayHref, action: ontoday },
    { key: 'notes', label: labels.notes, href: notesHref, action: onnotes },
    { key: 'memories', label: labels.memories, href: memoriesHref, action: onmemories }
  ]);
</script>
<nav class="journey-nav" aria-label="Journey">
  {#each items as item}
    {#if item.href}
      <a href={item.href} aria-current={active === item.key ? 'page' : undefined}>{item.label}{#if item.key === 'memories' && count}<span>{count}</span>{/if}</a>
    {:else}
      <button type="button" disabled={disabled} onclick={item.action} aria-current={active === item.key ? 'page' : undefined}>{item.label}{#if item.key === 'memories' && count}<span>{count}</span>{/if}</button>
    {/if}
  {/each}
</nav>
<style>
  .journey-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:5px;border:1px solid var(--border);border-radius:12px;background:color-mix(in srgb,var(--ink) 88%,transparent);margin-bottom:18px}
  a,button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:var(--control-target);padding:10px 8px;font:500 13px/1.3 Arial,sans-serif;text-decoration:none;color:var(--paper);border:0;border-radius:8px;background:transparent;cursor:pointer}
  [aria-current]{background:var(--paper);color:var(--ink)}a:hover,button:hover{background:#ffffff14}[aria-current]:hover{background:var(--surface)}span{font:11px monospace;border:1px solid currentColor;border-radius:20px;padding:2px 6px}button:disabled{opacity:.5;cursor:default}a:focus-visible,button:focus-visible{outline:3px solid var(--focus-on-dark);outline-offset:2px}
</style>
