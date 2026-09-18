/* weapp briefs：同步 PC 已校正的五人身份 + 李二/李柳/李希圣 */
const fs = require('fs');
const f = 'weapp/utils/briefs.js';
let t = fs.readFileSync(f, 'utf8');

function replaceBlock(src, key, pos, intro) {
  const re = new RegExp('("' + key + '"\\s*:\\s*\\{[\\s\\S]*?"pos"\\s*:\\s*")[^"]+(")');
  if (!re.test(src)) console.log('no pos', key);
  else src = src.replace(re, '$1' + pos + '$2');
  const re2 = new RegExp('("' + key + '"\\s*:\\s*\\{[\\s\\S]*?"intro"\\s*:\\s*")[^"]+(")');
  if (!re2.test(src)) console.log('no intro', key);
  else src = src.replace(re2, '$1' + intro.replace(/"/g, '\\"') + '$2');
  return src;
}

t = replaceBlock(t, '魏晋',
  '风雪庙剑修 · 左右之徒 · 曾驻剑气长城',
  '风雪庙出身的剑修，左右之徒；与宁姚同代，曾驻剑气长城协同御蛮。佩剑「高烛」为齐家老祖所铸半仙兵（非本命飞剑）。无事牌原著句：为情所困，剑不得出。风雪庙魏晋。');
t = replaceBlock(t, '谢狗',
  '落魄山一等供奉 · 化名白景 · 剑修',
  '化名白景，落魄山一等供奉；飞升境剑修，两把本命飞剑（名未载）。与小陌同在落魄山。');
t = replaceBlock(t, '小陌',
  '落魄山一等供奉 · 道号喜烛',
  '落魄山一等供奉；真身蜘蛛鼅鼄、道号喜烛。持剑者引入山中当保镖。与谢狗（化名白景）同属落魄山。');
t = replaceBlock(t, '裴杯',
  '中土神州 · 女子武夫',
  '中土神州女子武夫（非炼气士）。卡牌技能「杯」为对战机制，非其武道路数全貌。境界原著未载。');
t = replaceBlock(t, '杨老头',
  '青童天君 · 骊珠洞天暗线布局者 · 郑大风之师',
  '青童天君，骊珠洞天与落魄山背后的布局者之一。棋子落处皆是棋眼；郑大风、李二出其门下。他不是中土文庙儒修，对战卡池阵营压缩为「散修」。');
t = t.replace(/游戏原创角色「火龙真人」/g, '趴地峰火龙真人');
t = t.replace(/，与火龙真人相对——一火一水，皆是散修中的特例。/g, '。与趴地峰火龙真人一火一水，气质对照（火龙真人为原著人物）。');
t = t.replace(/莲藕福地/g, '藕花福地');

fs.writeFileSync(f, t);
console.log('weapp briefs identity sync done');
