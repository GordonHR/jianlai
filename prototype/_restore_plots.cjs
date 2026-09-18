const fs = require('fs');
const { execSync } = require('child_process');
const git = execSync('git show HEAD:prototype/briefs.js', { encoding: 'utf8', maxBuffer: 20*1024*1024 });
const m = git.match(/const PLOTS = \{[\s\S]*?\n\};/);
if (!m) { console.error('no PLOTS'); process.exit(1); }
let plots = m[0];

// 删除非原著 / 已合并条目
const drop = ['齐景龙', '玉圭', 'xieshi', 'laojiao', 'xianzhu', '萧𢙏'];
for (const k of drop) {
  const re = new RegExp("\\n  ['\"]?" + k + "['\"]?:\\s*\\[[\\s\\S]*?\\n  \\],");
  const before = plots.length;
  plots = plots.replace(re, '\n');
  console.log('drop', k, before - plots.length);
}
// 也处理无尾逗号的情况
for (const k of drop) {
  const re = new RegExp("\\n  ['\"]?" + k + "['\"]?:\\s*\\[[\\s\\S]*?\\n  \\](?!,)");
  plots = plots.replace(re, '\n');
}
// 萧愻：若 git 用萧𢙏，重命名键并保留简短剧情
if (!plots.includes("'萧愻'") && !plots.includes('"萧愻"')) {
  plots = plots.replace(/\n\};/, `\n  '萧愻':[
    '剑气长城前任隐官（原著用字萧愻），叛变后陈平安临危受命接任隐官，调度众剑仙。'
  ],\n};`);
  console.log('added 萧愻 plot');
} else {
  plots = plots.replace(/萧𢙏/g, '萧愻');
}
// 曹慈：大骊武夫，非皇子（保持我们改过的口径）
plots = plots.replace(/caoci:\[\s*'大骊王朝皇子[^']*',/, `caoci:[\n    '大骊武道天才（非大骊皇子）。',`);
// 火龙真人 plot 若无则补
if (!plots.includes('火龙真人')) {
  plots = plots.replace(/\n\};/, `\n  '火龙真人':[
    '趴地峰火龙真人，火德一脉；对战卡「本命飞剑·火龙」为机制名，勿与阮邛混写。'
  ],\n};`);
}
if (!plots.includes("'谢狗'") && !plots.includes('谢狗')) {
  plots = plots.replace(/\n\};/, `\n  '谢狗':[\n    '化名白景，落魄山一等供奉；与小陌同在落魄山。'\n  ],\n};`);
}
if (!plots.includes("'小陌'") && !plots.includes('小陌:')) {
  plots = plots.replace(/\n\};/, `\n  '小陌':[\n    '落魄山一等供奉，道号喜烛，真身蜘蛛鼅鼄。'\n  ],\n};`);
}
if (!plots.includes("'裴杯'") && !plots.includes('裴杯:')) {
  plots = plots.replace(/\n\};/, `\n  '裴杯':[\n    '中土神州女子武夫。'\n  ],\n};`);
}

let briefs = fs.readFileSync('prototype/briefs.js', 'utf8');
const cur = briefs.match(/const PLOTS = \{[\s\S]*?\n\};/);
if (cur) {
  briefs = briefs.replace(cur[0], plots);
} else {
  briefs = briefs.trimEnd() + '\n\n' + plots + '\n';
}
fs.writeFileSync('prototype/briefs.js', briefs);
const keys = [...plots.matchAll(/^\s{2}([A-Za-z0-9_]+):|^\s{2}'([^']+)':/gm)].map(x => x[1] || x[2]);
console.log('new PLOTS keys', keys.length);
console.log(keys.filter(k => ['玉圭','齐景龙','xieshi','laojiao','xianzhu','萧𢙏','萧愻','火龙真人','谢狗','小陌','裴杯'].includes(k)));
