const fs = require('fs');
const path = require('path');
const g = fs.readFileSync('game.js','utf8');
const b = fs.readFileSync('briefs.js','utf8');
const wb = fs.readFileSync('weapp/utils/briefs.js','utf8');
const d = fs.readFileSync('weapp/utils/data.js','utf8');
const CHARS = require('./weapp/utils/data.js').CHARS;
const SKILLS = require('./weapp/utils/data.js').SKILLS;
const gone = ['玉圭','齐景龙','谢时','老蛟','仙珠','xieshi','laojiao','xianzhu'];
const checks = [];
for (const k of gone) {
  checks.push(['CHARS无 '+k, !CHARS[k]]);
  checks.push(['SKILLS无 '+k, !SKILLS[k]]);
  checks.push(['data无 '+k+':', !d.includes("'"+k+"':") && !d.includes('"'+k+'":')]);
}
checks.push(['火龙趴地峰 path', g.includes('趴地峰火龙真人')]);
checks.push(['谢狗白景', g.includes('化名白景') && CHARS['谢狗']]);
checks.push(['小陌在', !!CHARS['小陌']]);
checks.push(['裴杯女子武夫', g.includes('中土神州女子武夫')]);
checks.push(['萧愻在', !!CHARS['萧愻'] && !!SKILLS['萧愻']]);
checks.push(['刘景龙在规矩', CHARS['liujinglong'] && CHARS['liujinglong'].skills && CHARS['liujinglong'].skills.includes('规矩')]);
checks.push(['白也散修', CHARS.baiye && CHARS.baiye.faction==='散修']);
checks.push(['pc briefs无谢时键', !b.includes("xieshi:") && !b.includes("'谢时':")]);
checks.push(['wx briefs无玉圭键', !wb.includes('"玉圭"')]);
checks.push(['wx briefs无齐景龙键', !wb.includes('"齐景龙"')]);
checks.push(['wx briefs萧愻', wb.includes('"萧愻"')]);
checks.push(['wx briefs无萧𢙏键', !wb.includes('"萧𢙏"')]);
let fail=0;
for (const [n,ok] of checks){ console.log(ok?'PASS':'FAIL', n); if(!ok) fail++; }
console.log('CHARS count', Object.keys(CHARS).length);
process.exit(fail?1:0);
