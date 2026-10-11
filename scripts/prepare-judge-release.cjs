const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// A new directory every time. Never mutate the development checkout or its data.
const source = path.resolve(__dirname, '..');
const target = fs.mkdtempSync(path.join(os.tmpdir(), 'alexa-chan-judge-'));
const ignored = new Set(['node_modules', '.svelte-kit', 'build', '.DS_Store', '.git']);
let count = 0;
function copy(relative) {
  if (relative.startsWith('web/static/audio/koichi')) return;
  const from = path.join(source, relative), to = path.join(target, relative);
  const stat = fs.lstatSync(from);
  if (stat.isSymbolicLink()) throw Error(`Unexpected symlink: ${relative}`);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const item of fs.readdirSync(from)) if (!ignored.has(item)) copy(`${relative}/${item}`);
    return;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(relative === 'web/src/lib/voice-recordings.js'
    ? path.join(source, 'scripts/device-voice-recordings.js') : from, to);
  count++;
}
for (const item of ['.gitignore', '.env.example', 'LICENSE', 'THIRD_PARTY_NOTICES.md',
  'README.md', 'devpost-submission.md', 'package.json', 'package-lock.json',
  'mcp-server.js', 'server.js', 'lib', 'test', 'dashboard', 'skill-package', 'web', '.github', 'scripts']) copy(item);
for (const file of ['prd.md', 'student-trial.md', 'mcp-judge-trial.md', 'persona-validation.md',
  'submission-readiness.md', 'submission-demo.md', 'product-feedback.md', 'visual-assets.md']) copy(`docs/${file}`);
console.log(JSON.stringify({ directory: target, files: count, providerRecordings: 0,
  privateData: false, parkedProgrammeDocs: false }));
