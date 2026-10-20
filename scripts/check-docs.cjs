const fs = require('node:fs');
const path = require('node:path');

// Local Markdown file targets only. No network, credentials, Git writes or rendering.
function localTargets(markdown) {
  let fence;
  const targets = [];
  for (const [index, line] of markdown.split('\n').entries()) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = undefined;
      continue;
    }
    if (fence) continue;
    const prose = line.replace(/(`+)[\s\S]*?\1/g, '');
    const inline = [...prose.matchAll(/!?\[[^\]\n]*\]\((<[^>\n]+>|[^\s)]+)(?:\s+["'][^\n]*?["'])?\)/g)].map(m => m[1]);
    const reference = prose.match(/^ {0,3}\[[^\]]+\]:\s*(<[^>\n]+>|\S+)/);
    for (let target of [...inline, ...(reference ? [reference[1]] : [])]) {
      if (target.startsWith('<')) target = target.slice(1, -1);
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) continue;
      targets.push({ target, line: index + 1 });
    }
  }
  return targets;
}

function checkLinks(root, files) {
  root = path.resolve(root);
  const errors = [];
  for (const file of files) {
    for (const { target, line } of localTargets(fs.readFileSync(path.join(root, file), 'utf8'))) {
      const label = `${file}:${line}: ${target}`;
      let decoded;
      try { decoded = decodeURIComponent(target.split(/[?#]/)[0]); }
      catch { errors.push(`${label} (invalid encoding)`); continue; }
      const resolved = path.resolve(root, path.dirname(file), decoded);
      const relative = path.relative(root, resolved);
      if (path.isAbsolute(decoded) || relative === '..' || relative.startsWith(`..${path.sep}`)) {
        errors.push(`${label} (outside repository)`);
      } else if (!fs.existsSync(resolved)) errors.push(`${label} (missing target)`);
    }
  }
  return errors;
}

function documentationFiles(root) {
  const files = fs.readdirSync(root).filter(name => name.endsWith('.md'));
  function visit(relative) {
    for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
      const name = path.join(relative, entry.name);
      if (entry.isDirectory()) visit(name);
      else if (entry.isFile() && name.endsWith('.md')) files.push(name);
    }
  }
  visit('docs');
  return files.sort();
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const files = documentationFiles(root);
  const errors = checkLinks(root, files);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log(`Checked local Markdown targets in ${files.length} files (no external URL or anchor validation).`);
}
module.exports = { localTargets, checkLinks, documentationFiles };
