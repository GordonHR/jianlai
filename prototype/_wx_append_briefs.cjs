const fs = require('fs');
const keys = ['郭稼','叠嶂','观照','陈淳安','邵云岩','种秋','刘志茂','嫩道人','邓剑翘','赵鸾','陈对','离真','姚冲道','顾佑'];
const src = fs.readFileSync('briefs.js', 'utf8');
const blocks = [];
for (const k of keys) {
  const re = new RegExp("'" + k + "':\\s*\\{[\\s\\S]*?\\n\\},", 'm');
  const m = src.match(re);
  if (!m) { console.log('miss', k); continue; }
  // eval the object literal body safely-ish
  const body = m[0].replace(/'/g, '"');
  // key
  const objSrc = body.replace(/^[^:]+:/, '').replace(/,\s*$/, '');
  let obj;
  try { obj = eval('(' + objSrc + ')'); }
  catch (e) { console.log('eval fail', k, e.message); continue; }
  blocks.push({ key: k, obj });
}
console.log('parsed', blocks.length);

let wb = fs.readFileSync('weapp/utils/briefs.js', 'utf8');
const close = wb.lastIndexOf('\n};');
if (close < 0) throw new Error('no close');
const chunk = blocks.map(({key, obj}) => {
  return '  ' + JSON.stringify(key) + ': ' + JSON.stringify(obj, null, 2).split('\n').map((line, i) => i===0?line:'  '+line).join('\n') + ',';
}).join('\n');
let prev = close - 1;
while (prev > 0 && !wb[prev].trim()) prev--;
let next = wb;
if (!wb.slice(Math.max(0,prev-2), prev+1).includes(',')) {
  // add comma after last property
  next = wb.slice(0, close) + ',' + wb.slice(close);
}
const close2 = next.lastIndexOf('\n};');
next = next.slice(0, close2) + '\n' + chunk + next.slice(close2);
fs.writeFileSync('weapp/utils/briefs.js', next);
const wb2 = require('./weapp/utils/briefs.js');
for (const k of keys) console.log(k, !!wb2[k]);
console.log('wx briefs count', Object.keys(wb2).length);
