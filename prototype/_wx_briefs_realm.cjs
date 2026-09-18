const fs = require('fs');
const f = 'weapp/utils/briefs.js';
let t = fs.readFileSync(f, 'utf8');

function setIntroPos(src, key, pos, intro) {
  const reP = new RegExp('("' + key + '"\\s*:\\s*\\{[\\s\\S]*?"pos"\\s*:\\s*")[^"]*(")');
  const reI = new RegExp('("' + key + '"\\s*:\\s*\\{[\\s\\S]*?"intro"\\s*:\\s*")[^"]*(")');
  if (reP.test(src)) src = src.replace(reP, '$1' + pos + '$2');
  else console.log('miss pos', key);
  if (reI.test(src)) src = src.replace(reI, '$1' + intro.replace(/\\/g,'\\\\').replace(/"/g,'\\"') + '$2');
  else console.log('miss intro', key);
  return src;
}

t = setIntroPos(t, '火龙真人',
  '趴地峰 · 火龙真人 · 张山峰之师',
  '原著人物，居趴地峰，火德一脉，张山峰之师。卡内「本命飞剑·火龙」为对战机制名，勿与骊珠洞天铸剑师阮邛混写。');
t = setIntroPos(t, '裴杯',
  '中土神州 · 女子武夫 · 曹慈之师',
  '中土神州女子武夫，曹慈之师（非炼气士）。卡牌技能「杯」为对战机制。境界原著未载。');
t = setIntroPos(t, '持剑者',
  '旧天庭五至高 · 万剑之源（非剑气长城）',
  '旧天庭执掌剑道规则的五至高之一，万剑之祖。非剑气长城出身；佩剑/神物「老剑条」后认主陈平安。卡池阵营以「散修」压缩。');
t = setIntroPos(t, '谢狗',
  '落魄山一等供奉 · 化名白景 · 飞升境剑修',
  '化名白景，落魄山一等供奉；飞升境剑修，两把本命飞剑（名未载）。与小陌同在落魄山。');
t = setIntroPos(t, '小陌',
  '落魄山一等供奉 · 飞升境 · 道号喜烛',
  '落魄山一等供奉；真身蜘蛛鼅鼄、道号喜烛，飞升境。持剑者引入山中当保镖。与谢狗（化名白景）同属落魄山。');
t = setIntroPos(t, '姜尚真',
  '落魄山首席供奉 · 玉圭宗宗主 · 玉璞境',
  '桐叶洲玉圭宗宗主，化名周肥，落魄山首席供奉；本命飞剑仅剩一片柳叶。境界口径：玉璞境。');
// 张山峰
t = setIntroPos(t, '张山峰',
  '趴地峰火龙真人之徒 · 武夫',
  '趴地峰火龙真人之徒；对战卡挂中土文庙为阵营压缩。');

fs.writeFileSync(f, t);
console.log('wx briefs realm/mentor sync done');
