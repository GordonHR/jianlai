// 一次性：导出四表 key/name，比对差异（PC game.js + briefs.js ↔ weapp utils/data.js + briefs.js）
const fs = require('fs');
const R = 'C:/Users/Administrator/Desktop/jianlai/prototype/';

function block(file, name) {
  const src = fs.readFileSync(R + file, 'utf8');
  const re = new RegExp('const ' + name + ' = (\\{[\\s\\S]*?\\n\\};?)');
  const m = src.match(re);
  if (!m) { console.log('!! block not found: ' + name + ' in ' + file); return null; }
  try { return new Function('return ' + m[1].replace(/;$/, ''))(); }
  catch (e) { console.log('!! parse fail ' + name + ': ' + e.message); return null; }
}
const PC_CHARS = block('game.js', 'CHARS');
const PC_PATH = block('game.js', 'CHAR_PATH');
const PC_BRIEFS = block('briefs.js', 'BRIEFS');
const PC_PLOTS = block('briefs.js', 'PLOTS');
const WX_CHARS = block('weapp/utils/data.js', 'CHARS');
const WX_BRIEFS = block('weapp/utils/briefs.js', 'BRIEFS');

const K = o => o ? Object.keys(o) : [];
const diff = (a, b) => K(a).filter(k => !K(b).includes(k));
console.log('PC_CHARS=' + K(PC_CHARS).length + '  PC_PATH=' + K(PC_PATH).length +
            '  PC_BRIEFS=' + K(PC_BRIEFS).length + '  PLOTS=' + K(PC_PLOTS).length +
            '  WX_CHARS=' + K(WX_CHARS).length + '  WX_BRIEFS=' + K(WX_BRIEFS).length);
console.log('CHARS缺PATH: ' + diff(PC_CHARS, PC_PATH).join(','));
console.log('CHARS缺BRIEFS: ' + diff(PC_CHARS, PC_BRIEFS).join(','));
console.log('WX_CHARS缺PC: ' + diff(PC_CHARS, WX_CHARS).join(','));
console.log('WX_BRIEFS缺PC: ' + diff(PC_BRIEFS, WX_BRIEFS).join(','));
console.log('CHARS缺PLOTS: ' + diff(PC_CHARS, PC_PLOTS).join(','));

// 按阵营分组输出名单
const byFac = {};
for (const k of K(PC_CHARS)) {
  const c = PC_CHARS[k];
  (byFac[c.faction] = byFac[c.faction] || []).push(c.name);
}
console.log('\n===== 现有名单（按阵营）=====');
for (const f of Object.keys(byFac)) console.log('【' + f + '】' + byFac[f].length + '：' + byFac[f].join('、'));
