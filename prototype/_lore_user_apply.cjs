/* 人物勘误落地：删无效卡 + 恢复/校正身份（只动源头，生成物另跑 gen_data） */
const fs = require('fs');
const path = require('path');

const DEL_KEYS = ['玉圭', '齐景龙', 'xieshi', 'laojiao', 'xianzhu'];
const DEL_NAMES = ['玉圭', '齐景龙', '谢时', '老蛟', '仙珠'];

function stripLines(text, keys, names) {
  let lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    const hitKey = keys.some(k => {
      // CHARS/SKILLS/CHAR_PATH/PLOTS/BRIEFS 开头条目
      return (
        L.includes("'" + k + "':") && /:\s*\{/.test(L) ||
        L.includes('"' + k + '":') ||
        (L.includes("'" + k + "':[") ) ||
        (L.trimStart().startsWith("'" + k + "':") && !L.includes('name:') === false)
      );
    });
    // 更稳妥：命中 key 且是对象/数组起始行
    const startsEntry =
      keys.some(k =>
        new RegExp("^\\s*['\"]" + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"]\\s*:").test(L)
      );
    if (startsEntry) {
      // 跳到该条目结束：从本行开始配对 {} 或 []
      let open = -1, ch = '';
      for (let j = i; j < lines.length; j++) {
        const s = lines[j];
        if (open < 0) {
          const a = s.indexOf('{'), b = s.indexOf('[');
          if (a >= 0 && (b < 0 || a < b)) { open = j; ch = '{'; }
          else if (b >= 0) { open = j; ch = '['; }
          else continue;
        }
        let depth = 0, ended = false;
        for (const c of lines[j]) {
          if (c === ch) depth++;
          else if (c === (ch === '{' ? '}' : ']')) {
            depth--;
            if (depth === 0) { ended = true; break; }
          }
        }
        // 单行结束
        if (ended && j === i) { i = j; break; }
        if (ended) { i = j; break; }
        if (j === lines.length - 1) { i = j; }
      }
      // 丢弃注释行（若紧挨上一行是 // 且提到 key/name，一并丢）
      while (out.length) {
        const prev = out[out.length - 1];
        if (prev.trimStart().startsWith('//') && (keys.some(k => prev.includes(k)) || names.some(n => prev.includes(n)))) out.pop();
        else break;
      }
      continue;
    }
    // rel 列表里的引用行：单独一行仅 "齐景龙" / '齐景龙'
    const refOnly = keys.some(k => {
      const t = L.trim().replace(/^["']|["'],?$/g, '');
      return t === k;
    });
    if (refOnly) continue;
    out.push(L);
  }
  return out.join('\n');
}

// —— game.js ——
let game = fs.readFileSync('game.js', 'utf8');
game = stripLines(game, DEL_KEYS, DEL_NAMES);
// 齐廷济 / 董三更 briefs 中的同僚引用
game = game.replace(/同僚:\['姚近之','齐景龙'\]/g, "同僚:['姚近之']");
game = game.replace(/同僚:\['齐景龙','阿良','陈清都'\]/g, "同僚:['阿良','陈清都']");
game = game.replace(/同僚:\['姚近之','齐景龙'\]/g, "同僚:['姚近之']");
game = game.replace(/与齐景龙并称/g, '齐家剑修');
game = game.replace(/他和齐景龙齐名于长城，常被并称为/g, '他是长城齐姓一脉老辈，剑势常被并称为');
game = game.replace(/'齐景龙'/g, "'刘景龙'"); // 若有残留 rel 引用，归并到刘景龙（用户：二人实为一人，保留刘景龙）
// 注意：上面 replace 可能误伤已删除条目——已先删除条目再替换引用

// 身份校正
game = game.replace(
  `  // 【游戏原创】原著无独立角色「火龙真人」；本命飞剑「火龙」为卡牌机制，勿与阮邛/阮秀混写。
  '火龙真人': { name:'火龙真人', faction:'散修', hp:4, realm:'止境', skills:['铸剑','火德'], txt:'【铸剑】开局获得专属「本命飞剑·火龙」（游戏原创机制）；【火德】你的装备牌效果对所有角色 +1', talent:'机缘' },`,
  `  // 原著人物：趴地峰火龙真人（火德一脉）；卡内「本命飞剑·火龙」为机制名，勿与阮邛混写。
  '火龙真人': { name:'火龙真人', faction:'散修', hp:4, realm:'止境', skills:['铸剑','火德'], txt:'【铸剑】开局获得专属「本命飞剑·火龙」；【火德】你的装备牌效果对所有角色 +1（趴地峰火德一脉）', talent:'机缘' },`
);
game = game.replace(
  `  '火龙真人': { path:'lianqi', realm:null, src:'游戏原创', note:'原著无独立角色「火龙真人」。卡牌机制角色：开局自带「本命飞剑·火龙」。禁止写成阮邛之师或阮邛别号' },`,
  `  '火龙真人': { path:'lianqi', realm:null, src:'原著', note:'趴地峰火龙真人，火德一脉；与张山峰等趴地峰一脉相关。卡内「本命飞剑·火龙」为对战机制名。禁止与铸剑师阮邛混写' },`
);
game = game.replace(
  `  '火龙真人':[{n:'铸剑',k:'startequip',q:'',f:'forge'},
              {n:'火德',k:'equipUp',v:1,q:'',f:'flame'}],`,
  `  '火龙真人':[{n:'铸剑',k:'startequip',q:'',f:'forge'},
              {n:'火德',k:'equipUp',v:1,q:'',f:'flame'}],`
);
game = game.replace(
  `  '谢狗': { name:'谢狗', faction:'散修', hp:3, realm:'止境', skills:['狗'], txt:'【狗】受伤时若手牌有「守心」则免 1 伤（每回合限一次）', talent:'机缘' },`,
  `  '谢狗': { name:'谢狗', faction:'散修', hp:3, realm:'止境', skills:['狗'], txt:'【狗】受伤时若手牌有「守心」则免 1 伤（每回合限一次）（落魄山供奉·化名白景）', talent:'机缘' },`
);
game = game.replace(
  `  '谢狗': { path:'lianqi', realm:null, src:'待考', note:'人物志/落魄山线对其身份记载不一（散修少年 vs 化名白景之远古大妖剑修），境界未载；待外部复核后统一' },`,
  `  '谢狗': { path:'jianxiu', realm:'飞升境', src:'原著', note:'化名白景，落魄山一等供奉；飞升境剑修，两把本命飞剑（名未载）。与小陌同在落魄山' },`
);
game = game.replace(
  `  '小陌': { path:'lianqi', realm:null, src:'待考', note:'落魄山供奉；briefs 载真身蜘蛛鼅鼄、道号喜烛，sect 载飞升境剑修/持剑者带来，对战卡仍为练气——身份与境界待统一，勿当「同乡少年」' },`,
  `  '小陌': { path:'jianxiu', realm:'飞升境', src:'原著', note:'落魄山一等供奉；真身蜘蛛鼅鼄、道号喜烛。持剑者引入山中当保镖。与谢狗（化名白景）同属落魄山' },`
);
game = game.replace(
  `  '裴杯': { name:'裴杯', faction:'散修', hp:3, realm:'止境', skills:['杯'], txt:'【杯】出牌阶段弃一牌令一名角色摸一（敬酒）', talent:'机缘' },`,
  `  '裴杯': { name:'裴杯', faction:'散修', hp:3, realm:'止境', skills:['杯'], txt:'【杯】出牌阶段弃一牌令一名角色摸一（中土神州女子武夫）', talent:'机缘' },`
);
game = game.replace(
  `  '裴杯': { path:'lianqi', realm:'止境', src:'推定', note:'裴钱授业之一，止境' },`,
  `  '裴杯': { path:'wufu', realm:null, src:'原著', note:'中土神州女子武夫（非炼气士）；境界未载。技能「杯」为卡牌机制，非其武道路数全貌' },`
);
game = game.replace(
  `  'liujinglong': { path:'jianxiu', realm:'飞升境', src:'原著', note:'剑气长城剑修，本命飞剑「规矩」（神通「我见即我属」），飞升境。与礼圣技能名「规矩」重名但语义不同' },`,
  `  'liujinglong': { path:'jianxiu', realm:'飞升境', src:'原著', note:'剑气长城剑修，本命飞剑「规矩」（神通「我见即我属」），飞升境。旧卡「齐景龙」与本条为同一人，已合并；符箓异文「齐景龙」亦归此' },`
);
game = game.replace(
  `  '萧愻': { path:'jianxiu', realm:'止境', src:'推定', note:'剑气长城剑修，前任隐官；粉丝整理称本命飞剑「藏锋」，原著未完全坐实，待考' },`,
  `  '萧愻': { path:'jianxiu', realm:'止境', src:'原著', note:'剑气长城前任隐官（原著用字萧愻；旧误作萧𢙏，同一人）。叛变后陈平安接任隐官。飞剑名未载/「藏锋」待考' },`
);
game = game.replace(
  `'萧愻': { name:'萧愻', faction:'剑气长城', hp:3, realm:'止境', skills:['愻'], txt:'【愻】「剑气」命中后，可立即再打出一张「剑气」（每回合限一次）', talent:'锋芒' },`,
  `'萧愻': { name:'萧愻', faction:'剑气长城', hp:3, realm:'止境', skills:['愻'], txt:'【愻】「剑气」命中后，可立即再打出一张「剑气」（每回合限一次）（剑气长城前隐官）', talent:'锋芒' },`
);

fs.writeFileSync('game.js', game);
console.log('game.js updated');

// —— PC briefs.js ——
function cleanBriefs(file) {
  let t = fs.readFileSync(file, 'utf8');
  t = stripLines(t, DEL_KEYS, DEL_NAMES);
  t = t.replace(/同僚:\['姚近之','齐景龙'\]/g, "同僚:['姚近之']");
  t = t.replace(/同僚:\['齐景龙','阿良','陈清都'\]/g, "同僚:['阿良','陈清都']");
  t = t.replace(/同僚:\['姚近之','齐景龙'\]/g, "同僚:['姚近之']");
  t = t.replace(/与齐景龙并称/g, '齐家老辈剑修');
  t = t.replace(/他和齐景龙齐名于长城/g, '他是长城齐姓一脉老辈');
  t = t.replace(/"齐景龙"/g, '"刘景龙"');
  t = t.replace(/'齐景龙'/g, "'刘景龙'");
  fs.writeFileSync(file, t);
  console.log(file, 'updated');
}

// 火龙真人 / 谢狗 / 小陌 / 裴杯 briefs 大块替换（PC）
let b = fs.readFileSync('briefs.js', 'utf8');
b = stripLines(b, DEL_KEYS, DEL_NAMES);
b = b.replace(/同僚:\['姚近之','齐景龙'\]/g, "同僚:['姚近之']");
b = b.replace(/同僚:\['齐景龙','阿良','陈清都'\]/g, "同僚:['阿良','陈清都']");
b = b.replace(/与齐景龙并称/g, '齐家老辈剑修');
b = b.replace(/他和齐景龙齐名于长城/g, '他是长城齐姓一脉老辈');
// rel 数组内单独引用
b = b.replace(/\n\s*'齐景龙',/g, '\n');
b = b.replace(/\n\s*"齐景龙",/g, '\n');

// 替换火龙真人 briefs 块
b = b.replace(/'火龙真人':\s*\{[\s\S]*?\n\},/, `'火龙真人': {
  pos:'趴地峰 · 火龙真人 · 火德一脉',
  intro:'原著人物，居趴地峰，火德修行。与趴地峰一脉相关（张山峰等）。卡牌「本命飞剑·火龙」为对战机制名，勿与骊珠洞天铸剑师阮邛混写。',
  tags:['趴地峰','火德','原著','火龙'],
  scenes:[
    {t:'趴地峰火德', d:'火德一脉修行者，居趴地峰；对战卡以「铸剑/火德」表现其火属与器道气质。', q:''}
  ],
  quotes:[],
  rel:{所属:['趴地山']},
  verdict:'趴地峰上，火德不熄。',
  look: [],
  dress: ['道袍'],
  temper: []
},`);

b = b.replace(/'谢狗':\s*\{[\s\S]*?\n\},/, `'谢狗': {
  pos:'落魄山一等供奉 · 化名白景 · 剑修',
  intro:'化名白景，落魄山一等供奉；飞升境剑修，两把本命飞剑（名未载）。与小陌同在落魄山。人物志 look 或记貂帽少女/高挑女子等形象细节。',
  tags:['落魄山','白景','供奉','剑修'],
  scenes:[
    {t:'白景入山', d:'以化名白景行走，实为谢狗；与小陌一并为落魄山供奉。', q:''}
  ],
  quotes:[],
  rel:{同僚:['小陌'],所属:['落魄山']},
  verdict:'落魄山一等供奉，白景即谢狗。',
  look: ['头戴貂帽', '恢复真容为高挑女子（人物志）'],
  dress: [],
  temper: []
},`);

b = b.replace(/'小陌':\s*\{[\s\S]*?\n\},/, `'小陌': {
  pos:'落魄山一等供奉 · 道号喜烛',
  intro:'落魄山一等供奉；真身蜘蛛鼅鼄、道号喜烛。持剑者引入山中当保镖。与谢狗（化名白景）同属落魄山。',
  tags:['落魄山','供奉','喜烛','鼅鼄'],
  scenes:[
    {t:'入山为供奉', d:'持剑者将沉睡于皓彩明月中的小陌带到陈平安面前，后为落魄山一等供奉。', q:''}
  ],
  quotes:[],
  rel:{同僚:['谢狗'],所属:['落魄山']},
  verdict:'话极少，剑极快；落魄山一等供奉。',
  look: ['真身蜘蛛（鼅鼄）','道号喜烛','容貌俊美'],
  dress: [],
  temper: ['沉默寡言','专一忠诚']
},`);

b = b.replace(/'裴杯':\s*\{[\s\S]*?\n\},/, `'裴杯': {
  pos:'中土神州 · 女子武夫',
  intro:'中土神州女子武夫（非炼气士）。卡牌技能「杯」为对战机制，非其武道路数全貌。境界原著未载。',
  tags:['中土神州','女子武夫','原著'],
  scenes:[],
  quotes:[],
  rel:{所属:['中土神州']},
  verdict:'中土神州女子武夫。',
  look: [],
  dress: [],
  temper: []
},`);

fs.writeFileSync('briefs.js', b);
console.log('briefs.js blocks patched');

// weapp briefs: strip deleted keys + light text fixes
let wb = fs.readFileSync('weapp/utils/briefs.js', 'utf8');
wb = stripLines(wb, DEL_KEYS, DEL_NAMES);
wb = wb.replace(/\n\s*"齐景龙",/g, '\n');
wb = wb.replace(/与齐景龙并称/g, '齐家老辈剑修');
wb = wb.replace(/他和齐景龙齐名于长城/g, '他是长城齐姓一脉老辈');
wb = wb.replace(/游戏原创角色「火龙真人」/g, '趴地峰火龙真人');
wb = wb.replace(/【游戏原创】原著《剑来》无独立角色「火龙真人」。本条为对战卡池机制角色：开局自带「本命飞剑·火龙」。禁止与铸剑师阮邛、阮秀之父女线混写，亦非「阮邛之师\/别号」。/g,
  '原著人物，居趴地峰，火德修行。卡内「本命飞剑·火龙」为对战机制名，勿与骊珠洞天铸剑师阮邛混写。');
wb = wb.replace(/【游戏原创】卡牌机制角色 · 非原著人物/g, '趴地峰 · 火龙真人 · 火德一脉');
fs.writeFileSync('weapp/utils/briefs.js', wb);
console.log('weapp briefs stripped');

// sect.js SECT_ART_SET 去掉齐景龙
let sect = fs.readFileSync('weapp/utils/sect.js', 'utf8');
sect = sect.replace('"齐景龙":1', '');
sect = sect.replace(/,"齐景龙":1/, '');
sect = sect.replace(/"齐景龙":1,/, '');
fs.writeFileSync('weapp/utils/sect.js', sect);
console.log('sect SECT_ART_SET cleaned');

// fulu 异文案
for (const f of ['weapp/packageFulu/pages/fulu/fulu.js']) {
  if (!fs.existsSync(f)) continue;
  let x = fs.readFileSync(f, 'utf8');
  x = x.replace(/刘景龙传授（原著第651集作"齐景龙"，存异文）；/g, '刘景龙传授；');
  x = x.replace(/原著·刘景龙传授·白泽路引符（存异文：第651集作齐景龙）/g, '原著·刘景龙传授·白泽路引符');
  x = x.replace(/原著·刘景龙传授·剑气过桥符（存异文：第651集作齐景龙）/g, '原著·刘景龙传授·剑气过桥符');
  fs.writeFileSync(f, x);
  console.log(f, 'fulu notes updated');
}

console.log('DONE');
