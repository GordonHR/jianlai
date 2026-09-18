const { execSync } = require('child_process');
const fs = require('fs');
const out = execSync('git show HEAD:prototype/briefs.js', { encoding: 'utf8', maxBuffer: 20*1024*1024 });
const re = /const PLOTS = \{[\s\S]*?\n\};/;
const m = out.match(re);
if (!m) { console.error('PLOTS not found in git'); process.exit(1); }
fs.writeFileSync('_plots_from_git.txt', m[0]);
const keys = [...m[0].matchAll(/^\s{2}([A-Za-z0-9_]+):/gm)].map(x => x[1]);
const cjk = [...m[0].matchAll(/^\s{2}'([^']+)':/gm)].map(x => x[1]);
console.log('ascii keys', keys.length);
console.log('cjk keys', cjk.length);
console.log('total', keys.length + cjk.length);
console.log([...keys, ...cjk].join(' | '));
