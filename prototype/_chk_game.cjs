'use strict';
const fs = require('fs');
function extractConst(src, name) {
  const re = new RegExp('(?:const|let|var)\\s+' + name + '\\s*=');
  const lines = src.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) { start = i; break; }
  if (start < 0) return null;
  let open = null, openCh = '';
  outer: for (let i = start; i < lines.length; i++) {
    let inS = null, esc = false;
    for (let j = 0; j < lines[i].length; j++) {
      const c = lines[i][j];
      if (inS) { if (esc) { esc = false; continue; } if (c === '\\') { esc = true; continue; } if (c === inS) inS = null; continue; }
      if (c === '\'' || c === '"') { inS = c; continue; }
      if (c === '{' || c === '[' || c === '(') { open = i; openCh = c; break outer; }
    }
  }
  if (open == null) { const eq = lines[start].indexOf('='); return lines[start].slice(eq + 1).replace(/;.*$/, '').trim(); }
  const closeCh = openCh === '{' ? '}' : (openCh === '[' ? ']' : ')');
  let depth = 0, ended = -1, inS = null, esc = false;
  for (let i = open; i < lines.length; i++) {
    for (let j = 0; j < lines[i].length; j++) {
      const c = lines[i][j];
      if (inS) { if (esc) { esc = false; continue; } if (c === '\\') { esc = true; continue; } if (c === inS) inS = null; continue; }
      if (c === '\'' || c === '"') { inS = c; continue; }
      if (c === openCh) depth++; else if (c === closeCh) { depth--; if (depth === 0) { ended = i; break; } }
    }
    if (ended >= 0) break;
  }
  let firstLine = lines[open]; const ocIdx = firstLine.indexOf(openCh); if (ocIdx >= 0) firstLine = firstLine.slice(ocIdx);
  return (firstLine + '\n' + lines.slice(open + 1, ended + 1).join('\n')).trim();
}
try {
  const src = fs.readFileSync('game.js', 'utf8');
  const raw = extractConst(src, 'CHARS').replace(/;\s*$/, '').replace(/\/\/.*$/, '').trim();
  const obj = eval('(' + raw + ')');
  const keys = Object.keys(obj);
  fs.writeFileSync('_chk_game.txt', 'game.js CHARS 角色数: ' + keys.length + '\n前5: ' + keys.slice(0, 5).join(', ') + '\n', 'utf8');
} catch (e) {
  fs.writeFileSync('_chk_game.txt', 'ERR: ' + (e && e.stack ? e.stack : String(e)) + '\n', 'utf8');
}
