const fs = require('fs');
const g = fs.readFileSync('game.js','utf8');
const b = fs.readFileSync('briefs.js','utf8');
const wb = fs.readFileSync('weapp/utils/briefs.js','utf8');
const t = fs.readFileSync('tales.js','utf8');
const sect = fs.readFileSync('weapp/utils/sect.js','utf8');
const D = require('./weapp/utils/data.js');
const CHARS = D.CHARS;

// extract CHAR_PATH notes
const pathBlock = g.match(/const CHAR_PATH = \{[\s\S]*?\n\};/);
const notes = [];
if (pathBlock) {
  const re = /['"]([^'"]+)['"]\s*:\s*\{[^}]*?src:'([^']*)'[^}]*?note:'([^']*)'/g;
  let m;
  while ((m = re.exec(pathBlock[0]))) notes.push({key:m[1], src:m[2], note:m[3]});
}

console.log('=== CHARS faction anomalies (known-risk names) ===');
const risk = ['baiye','火龙真人','谢狗','小陌','裴杯','魏晋','宋长镜','杨老头','蔡金简','郭竹酒','顾粲','荀渊','刘景龙','萧愻','石柔','郑居中','姜尚真','阮邛','阮秀','裴钱','曹晴朗','持剑者','白泽','斐然','于玄','长命','苏稼','裴杯'];
for (const [k,c] of Object.entries(CHARS)) {
  const n = c.name;
  if (/火龙|谢狗|小陌|裴杯|魏晋|宋长镜|杨老头|蔡金简|郭竹|顾|荀渊|刘景|萧|石柔|郑居中|姜尚|阮|裴钱|曹晴|持剑|白泽|斐然|于玄|长命|苏稼|白也/.test(n)) {
    const p = notes.find(x => x.key===k || x.key===n);
    console.log(k, '|', n, '|', c.faction, '|', c.realm, '|', p ? (p.src+' · '+p.note.slice(0,60)) : 'no CHAR_PATH');
  }
}

console.log('\n=== suspicious phrases in briefs ===');
const phrases = [
  '游戏原创','游戏占位','待核','推定','弟子','齐景龙','萧𢙏','莲藕','火龙真人阮邛','大骊皇子','中土文庙',
  '同乡少年','文庙小夫子','阮邛之师','半师之谊','落魄山弟子','玉圭宗之主','风雪庙','趴地峰','白景','中土神州'
];
for (const p of phrases) {
  const pc = (b.match(new RegExp(p,'g'))||[]).length;
  const wx = (wb.match(new RegExp(p,'g'))||[]).length;
  const tt = (t.match(new RegExp(p,'g'))||[]).length;
  if (pc||wx||tt) console.log(p, 'pc',pc,'wx',wx,'tales',tt);
}

console.log('\n=== briefs intro snippets for high-risk chars ===');
for (const name of ['魏晋','火龙真人','谢狗','小陌','裴杯','杨老头','郭竹酒','顾粲','荀渊','蔡金简','裴钱','白也','郑居中','姜尚真','石柔','斐然','于玄','长命','苏稼','裴杯','持剑者','刘景龙','萧愻','宋长镜']) {
  const re = new RegExp("['\"]"+name+"['\"]:\\s*\\{[\\s\\S]{0,400}?intro:\\s*'([^']*)'");
  const re2 = new RegExp("['\"]"+name+"['\"]:\\s*\\{[\\s\\S]{0,400}?intro:\\s*\"([^\"]*)\"");
  const m = b.match(re) || b.match(re2);
  const m2 = wb.match(new RegExp("\""+name+"\":\\s*\\{[\\s\\S]{0,500}?\"intro\":\\s*\"([^\"]*)\""));
  console.log('—', name);
  console.log('  PC:', m ? m[1].slice(0,120) : '(none)');
  console.log('  WX:', m2 ? m2[1].slice(0,120) : '(none)');
}

console.log('\n=== sect.js desc keywords ===');
for (const s of ['白景','火龙','齐景龙','萧','藕花','莲藕','飞升境','游戏原创','玉圭']) {
  if (sect.includes(s)) console.log('sect has', s);
}
