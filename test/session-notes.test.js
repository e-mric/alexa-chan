const { test } = require('node:test');
const assert = require('node:assert/strict');
const notebook = import('../web/src/lib/session-notes.js');
const founders = import('../web/src/lib/founders.js');
const session = { id: 'synthetic-interview', date: '2026-10-07', title: 'Customer interviews · example' };
const draft = { question: '  What should I ask?\n', body: '# My notes\n\n  Listen before proposing.\n<script>alert(1)</script>\n![image](https://example.com/private)\n', takeaway: ' Ask an open question. ' };

test('session notes preserve original text exactly through save, reload and backup', async () => {
  const { saveSessionNote } = await notebook;
  const { freshProgress, writePersonal, readPersonal, serializePersonal, parseBackup } = await founders;
  let value; const storage = { getItem: () => value, setItem: (_, next) => { value = next; } };
  const progress = saveSessionNote(freshProgress(), session, draft, 1000);
  writePersonal(storage, { snapshot: null, progress });
  const restored = parseBackup(serializePersonal(readPersonal(storage)));
  for (const key of ['body','question','takeaway']) assert.equal(restored.progress.sessionNotes[0][key], draft[key]);
  assert.equal(restored.progress.sessionNotes[0].title, session.title);
  assert.equal(restored.progress.sessionNotes[0].phraseId, 'listening');
});
test('legacy backups retain daily reflections and migrate without inventing session notes', async () => {
  const { validateProgress, freshProgress } = await founders;
  const old = freshProgress(); delete old.sessionNotes;
  old.notes['2026-10-07'] = 'Existing daily reflection';
  const restored = validateProgress(old);
  assert.deepEqual(restored.sessionNotes, []);
  assert.equal(restored.notes['2026-10-07'], 'Existing daily reflection');
});
test('notes are tied to session and date, not just day; phrase stays stable on edits', async () => {
  const { saveSessionNote, noteKey } = await notebook;
  const { freshProgress } = await founders;
  let progress = saveSessionNote(freshProgress(), session, draft, 1000);
  progress = saveSessionNote(progress, {...session,id:'second'}, {...draft,body:'Another session'}, 2000);
  progress = saveSessionNote(progress, {...session,date:'2026-10-08'}, draft, 3000);
  progress = saveSessionNote(progress, session, {...draft,body:'Now my notes say something different'}, 4000);
  assert.equal(progress.sessionNotes.length,3);
  assert.equal(progress.sessionNotes.find(n => noteKey(n)===noteKey(session)).phraseId,'listening');
  assert.equal(progress.sessionNotes.find(n => n.id==='second').body,'Another session');
});
test('bounded imports accept only valid UTF-8 text/Markdown and preserve whitespace', async () => {
  const { readNoteFile } = await notebook;
  function file(name, text) { const buffer = new TextEncoder().encode(text); return {name,size:buffer.length,arrayBuffer:async()=>buffer}; }
  assert.equal(await readNoteFile(file('notes.md',draft.body)),draft.body);
  assert.equal(await readNoteFile(file('notes.TXT','聞こう\n')), '聞こう\n');
  for(const f of [file('notes.html','text'),file('notes.pdf','text'),file('notes.txt','x'.repeat(20001)),file('notes.md','bad\0text'),{...file('notes.md','text'),size:80001}, {name:'notes.txt',size:2,arrayBuffer:async()=>new Uint8Array([255,255])}]) {
    await assert.rejects(()=>readNoteFile(f));
  }
});
test('invalid or excessive notebook data cannot be persisted; storage failures are not success', async () => {
  const { saveSessionNote, validateSessionNotes } = await notebook;
  const { freshProgress, writePersonal } = await founders;
  const progress = saveSessionNote(freshProgress(),session,draft,1000);
  const n = progress.sessionNotes[0];
  for(const bad of [ {...n,body:'x'.repeat(20001)}, {...n,phraseId:'invented'}, {...n,date:'2026-02-30'}, {...n,updatedAt:NaN}, {...n,question:null} ]) assert.throws(()=>validateSessionNotes([bad]));
  assert.throws(()=>validateSessionNotes([n,n]));
  assert.throws(()=>validateSessionNotes(Array.from({length:30},(_,i)=>({...n,id:String(i),body:'x'.repeat(20000)}))));
  let saved = 'original';
  assert.throws(()=>writePersonal({setItem:(_,v)=>{saved=v;}},{snapshot:null,progress:{...progress,sessionNotes:[{...n,body:7}]}}));
  assert.equal(saved,'original');
  assert.throws(()=>writePersonal({setItem(){throw Error('quota');}},{snapshot:null,progress}));
  assert.equal(progress.sessionNotes[0].body,draft.body);
});
test('one contextual phrase is reused and can enter the existing optional memory loop', async () => {
  const { suggestNotePhrase } = await notebook;
  const { freshProgress, saveMemory, validateProgress, phrases } = await founders;
  assert.equal(suggestNotePhrase('Customer interviews'),'listening');
  assert.equal(suggestNotePhrase('Atelier','écouter les clients'),'listening');
  assert.equal(suggestNotePhrase('Workshop','naar klanten luisteren'),'listening');
  assert.equal(suggestNotePhrase('Workshop','Kunden zuhören'),'listening');
  assert.equal(suggestNotePhrase('Pitch coaching'),'courage');
  assert.equal(suggestNotePhrase('Business planning'),'step');
  let p = freshProgress(); for (const id of Object.keys(phrases)) p=saveMemory(p,id,1000);
  assert.equal(validateProgress(p).memories.length,4);
  assert.equal(saveMemory(p,'listening',2000).memories.length,4);
});
test('notebook interface is complete in all four base languages',async()=>{
  const { notebookCopy } = await import('../web/src/lib/session-notes-copy.js');
  for (const locale of ['fr','nl','de','en']) {
    assert.deepEqual(Object.keys(notebookCopy[locale]).sort(),Object.keys(notebookCopy.en).sort());
    assert.ok(Object.values(notebookCopy[locale]).every(v=>typeof v==='string' && v.length>0));
  }
});
