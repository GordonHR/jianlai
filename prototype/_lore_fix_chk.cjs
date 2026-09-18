const fs = require('fs');
const g = fs.readFileSync('game.js','utf8');
const d = fs.readFileSync('weapp/utils/data.js','utf8');
const b = fs.readFileSync('briefs.js','utf8');
const wb = fs.readFileSync('weapp/utils/briefs.js','utf8');
const t = fs.readFileSync('tales.js','utf8');
const wt = fs.readFileSync('weapp/utils/tales.js','utf8');
const checks = [
  ['白也 faction=散修 (PC+WX)', g.includes("name:'白也', faction:'散修'") && d.includes("name:'白也', faction:'散修'")],
  ['宋长镜 faction=散修', g.includes("name:'宋长镜', faction:'散修'") && d.includes("name:'宋长镜', faction:'散修'")],
  ['杨老头 faction=散修', g.includes("name:'杨老头', faction:'散修'") && d.includes("name:'杨老头', faction:'散修'")],
  ['萧愻 key 双端', g.includes("'萧愻'") && d.includes("'萧愻'") && b.includes("'萧愻'") && wb.includes('"萧愻"')],
  ['data 无萧𢙏条目', !d.includes("'萧𢙏':") && !g.includes("'萧𢙏':")],
  ['无莲藕福地', !g.includes('莲藕') && !b.includes('莲藕') && !wb.includes('莲藕') && !d.includes('莲藕')],
  ['魏晋=风雪庙', g.includes('风雪庙剑修') && b.includes('风雪庙') && wb.includes('风雪庙')],
  ['火龙=游戏原创', g.includes("src:'游戏原创'") && b.includes('游戏原创') && wb.includes('游戏原创')],
  ['玉圭=游戏占位', g.includes('游戏占位') && b.includes('游戏占位') && wb.includes('游戏占位')],
  ['tales 阮邛不写火龙真人', t.includes('铸剑师阮邛之女') && wt.includes('铸剑师阮邛之女') && !t.includes('火龙真人阮邛之女')],
  ['顾璨非弟子 CHAR_PATH', g.includes('泥瓶巷陈平安故交（非徒弟）')],
  ['技能表规矩归刘景龙', fs.readFileSync('../剑来全角色技能表.md','utf8').includes('属刘景龙')],
];
let fail = 0;
for (const [n, ok] of checks) {
  console.log((ok ? 'PASS' : 'FAIL'), n);
  if (!ok) fail++;
}
// CHARS/SKILLS key alignment for renamed char
const CHARS = require('./weapp/utils/data.js').CHARS;
const SKILLS = require('./weapp/utils/data.js').SKILLS;
console.log('CHARS 萧愻', !!CHARS['萧愻'], 'SKILLS 萧愻', !!SKILLS['萧愻']);
console.log('CHARS 白也 faction', CHARS.baiye && CHARS.baiye.faction);
console.log('CHARS 火龙真人 present', !!CHARS['火龙真人']);
process.exit(fail ? 1 : 0);
