const fs = require('fs');
const D = require('./weapp/utils/data.js');
const CHARS = D.CHARS;
const names = new Set(Object.values(CHARS).map(c => c.name));
const b = fs.readFileSync('briefs.js','utf8');
const g = fs.readFileSync('game.js','utf8');
const sect = fs.readFileSync('weapp/utils/sect.js','utf8');
const tales = fs.readFileSync('weapp/utils/tales.js','utf8');

// 项目内出现过的疑似人名（从 rel/剧情里抠）
const suspects = [
  '种秋','叠嶂','郭稼','观照','陈淳安','刘志茂','嫩道人','邵云岩','邓剑翘','赵鸾','陈对',
  '顾佑','桃亭','贺乡亭','虞青章','蒲禾','孙怀中','离真','姚冲道','林正诚','陈灵均',
  '周神芝','姚可久','白霜','杜懋','宁府','文圣','隐官','萧愻','荀渊','谢时',
  '阿弥陀佛','多宝','菩萨','寇名','初升','新妆','柔荑','仙尉','赵天籁','路人',
  '种先生','老瞎子','李柳','姜赦','稚圭','宋雨烧','董水井','苏稼','裴杯'
];

console.log('=== 在剧情/rel 出现、但 CHARS 无卡 ===');
for (const n of suspects) {
  if (names.has(n)) continue;
  const hits = [];
  if (b.includes(n)) hits.push('briefs');
  if (g.includes(n)) hits.push('game');
  if (sect.includes(n)) hits.push('sect');
  if (tales.includes(n)) hits.push('tales');
  if (hits.length) console.log(n.padEnd(8), hits.join(','));
}

console.log('\n=== CHARS 全名单 ===');
console.log([...names].sort().join('、'));
console.log('count', names.size);
