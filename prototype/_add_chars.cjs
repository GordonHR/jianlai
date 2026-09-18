/* P0/P1 原著人物入库（完整脚本） */
const fs = require('fs');

const NEW = [
  { key:'郭稼', name:'郭稼', faction:'剑气长城', hp:3, realm:'玉璞境', talent:'锋芒',
    skills:['家剑','祭奠'],
    txt:'【家剑】你的「剑气」对蛮荒角色伤害 +1（长城郭家）；【祭奠】出牌阶段可弃一张牌，令一名队友摸一张',
    path:{path:'jianxiu', realm:'玉璞境', src:'原著', note:'剑气长城郭家剑仙，郭竹酒之父；郭家是当年唯一举家祭奠宁姚父母的家族'},
    sk:[{n:'家剑',k:'atk',v:1,c:'mang',f:'sword'},{n:'祭奠',k:'act',a:'give',f:'aura'}],
    brief:{ pos:'剑气长城 · 郭家剑仙 · 郭竹酒之父',
      intro:'剑气长城郭家剑仙，郭竹酒之父。郭家是当年唯一举家祭奠宁姚父母的家族；陈平安后于酒铺夜收其女为徒。',
      tags:['剑气长城','郭家','郭竹酒之父','原著'],
      scenes:[{t:'郭家与宁府',d:'长城大姓中，郭家是当年唯一举家祭奠宁姚父母的家族。'}],
      rel:{女:['郭竹酒'],所属:['剑气长城郭家']},
      verdict:'郭家的剑，先有情义，后有锋芒。'},
    plot:['剑气长城郭家剑仙，郭竹酒之父；家族曾举家祭奠宁姚父母。'] },

  { key:'叠嶂', name:'叠嶂', faction:'剑气长城', hp:3, realm:null, talent:'锋芒',
    skills:['酒铺','叠嶂'],
    txt:'【酒铺】摸牌阶段多摸一张；【叠嶂】出牌阶段给一名队友一张牌（每回合限一次）',
    path:{path:'lianqi', realm:null, src:'原著', note:'剑气长城人物，与陈平安合伙开酒铺'},
    sk:[{n:'酒铺',k:'draw',v:1,f:'lotus'},{n:'叠嶂',k:'act',a:'give',f:'aura'}],
    brief:{ pos:'剑气长城 · 酒铺合伙人',
      intro:'剑气长城人物，与陈平安合伙开酒铺。郭竹酒拜师前常来捧场，墙上留下「师父卖酒徒弟买酒」。',
      tags:['剑气长城','酒铺','原著'],
      scenes:[{t:'长城酒铺',d:'与陈平安合伙经营；郭竹酒拜师前的重要场景。'}],
      rel:{合伙:['陈平安'],相关:['郭竹酒'],所属:['剑气长城']},
      verdict:'酒铺里的人情，比酒更烈。'},
    plot:['与陈平安在剑气长城合伙开酒铺。'] },

  { key:'观照', name:'观照', faction:'剑气长城', hp:4, realm:null, talent:'锋芒',
    skills:['问剑','托月'],
    txt:'【问剑】出牌阶段指定一名角色，其本回合不能使用「守心」（每局限两次）；【托月】每局限一次，你的「剑气」伤害 +2',
    path:{path:'jianxiu', realm:null, src:'原著', note:'剑气长城顶层剑修；与陈清都等「问剑托月山」战史相关'},
    sk:[{n:'问剑',k:'act',a:'wenjian',f:'sword'},{n:'托月',k:'atk',v:2,o:'once',f:'sword'}],
    brief:{ pos:'剑气长城 · 顶层剑修',
      intro:'剑气长城顶层剑修之一，名字与「问剑托月山」的长城战史相连。',
      tags:['剑气长城','托月山','剑修','原著'],
      scenes:[{t:'问剑托月山',d:'长城战史中与托月山相关的问剑者之一。'}],
      rel:{同代:['陈清都'],所属:['剑气长城']},
      verdict:'问剑托月的那一路人。'},
    plot:['剑气长城剑修，与问剑托月山战史相关。'] },

  { key:'陈淳安', name:'陈淳安', faction:'散修', hp:4, realm:null, talent:'机缘',
    skills:['陪都','打落'],
    txt:'【陪都】你受到蛮荒角色伤害 -1（每回合限一次）；【打落】每局限一次，你对蛮荒角色伤害 +2',
    path:{path:'lianqi', realm:null, src:'原著', note:'大骊末代陪都人物；以命打落刘叉的十四境合道之路'},
    sk:[{n:'陪都',k:'reduce',v:1,o:'turn',f:'shield'},{n:'打落',k:'atk',v:2,o:'once',c:'mang',f:'blood'}],
    brief:{ pos:'大骊末代陪都 · 以命打落刘叉',
      intro:'大骊末代陪都人物。刘叉于浩然跻身十四境后，被陈淳安以命打落——十四王座刘叉线上最关键的人族对位者之一。',
      tags:['大骊','陪都','刘叉','原著'],
      scenes:[{t:'以命打落',d:'以自身性命为代价，打落刘叉的十四境合道之路。'}],
      rel:{对手:['刘叉'],所属:['大骊陪都']},
      verdict:'有人用命，把妖座从天上拽下来。'},
    plot:['大骊末代陪都人物，以命打落刘叉的十四境合道之路。'] },

  { key:'邵云岩', name:'邵云岩', faction:'散修', hp:3, realm:null, talent:'机缘',
    skills:['倒悬','嫡传'],
    txt:'【倒悬】摸牌阶段多摸一张；【嫡传】陈平安在场时你的判定 +1',
    path:{path:'lianqi', realm:null, src:'原著', note:'倒悬山一脉，落魄山泉府韦文龙之师'},
    sk:[{n:'倒悬',k:'draw',v:1,f:'scroll'},{n:'嫡传',k:'judge',v:1,c:{with:'陈平安'},f:'aura'}],
    brief:{ pos:'倒悬山 · 韦文龙之师',
      intro:'倒悬山一脉人物，落魄山泉府账房韦文龙的师父，术算一脉上代。',
      tags:['倒悬山','韦文龙之师','原著'],
      scenes:[{t:'嫡传一脉',d:'授韦文龙术算；弟子后被陈平安力邀上山执掌泉府。'}],
      rel:{弟子:['韦文龙'],所属:['倒悬山']},
      verdict:'账房一脉的上代。'},
    plot:['倒悬山一脉，韦文龙之师。'] },

  { key:'种秋', name:'种秋', faction:'散修', hp:3, realm:null, talent:'机缘',
    skills:['种','秋'],
    txt:'【种】出牌阶段给一名队友一张牌（每回合限一次）；【秋】你的判定 +1',
    path:{path:'lianqi', realm:null, src:'推定', note:'与落魄山一系相关的原著人物（项目文本已引用）；境界未载'},
    sk:[{n:'种',k:'act',a:'give',f:'lotus'},{n:'秋',k:'judge',v:1,f:'scroll'}],
    brief:{ pos:'落魄山相关 · 种秋',
      intro:'与落魄山一系相关的原著人物。人物志 rel 中已引用，卡池补全其位。',
      tags:['落魄山','原著'],
      scenes:[], rel:{相关:['曹晴朗','落魄山']},
      verdict:'山外有山，秋后有账。'},
    plot:['与落魄山一系相关的原著人物。'] },

  { key:'刘志茂', name:'刘志茂', faction:'散修', hp:3, realm:null, talent:'机缘',
    skills:['书简','看中'],
    txt:'【书简】出牌阶段可观看一名角色一张手牌；【看中】对「顾粲」（顾璨）伤害 +1',
    path:{path:'lianqi', realm:null, src:'原著', note:'书简湖人物，早年看中顾璨并将其带往书简湖修行'},
    sk:[{n:'书简',k:'act',a:'peek',f:'rune'},{n:'看中',k:'atk',v:1,c:{with:'顾粲'},f:'blood'}],
    brief:{ pos:'书简湖 · 顾璨早年师承',
      intro:'书简湖人物，早年看中顾璨并将其带往书简湖修行——问心局因果链起点之一。',
      tags:['书简湖','顾璨','原著'],
      scenes:[{t:'看中顾璨',d:'将少年顾璨带往书简湖修行，因果由此而起。'}],
      rel:{相关:['顾璨','陈平安'],所属:['书简湖']},
      verdict:'书简湖的水，从看中一个孩子开始变浑。'},
    plot:['书简湖人物，早年带顾璨入湖修行。'] },

  { key:'嫩道人', name:'嫩道人', faction:'散修', hp:3, realm:null, talent:'机缘',
    skills:['嫩','护道'],
    txt:'【嫩】每回合限一次，你受到的伤害 -1；【护道】「李槐」在场时你的手牌上限 +1',
    path:{path:'lianqi', realm:null, src:'原著', note:'李槐护道人'},
    sk:[{n:'嫩',k:'reduce',v:1,o:'turn',f:'shield'},{n:'护道',k:'hand',v:1,c:{with:'李槐'},f:'aura'}],
    brief:{ pos:'李槐护道人',
      intro:'李槐的护道人。李槐为老瞎子关门弟子，后坐镇十万大山。',
      tags:['李槐','护道','原著'],
      scenes:[{t:'护道',d:'随护李槐游历与修行。'}],
      rel:{所护:['李槐']},
      verdict:'护道的人，不必名字响亮。'},
    plot:['李槐护道人。'] },

  { key:'邓剑翘', name:'邓剑翘', faction:'散修', hp:4, realm:null, talent:'机缘',
    skills:['翘','拳'],
    txt:'【翘】你受到伤害 -1（每回合限一次）；【拳】你的「剑气」伤害 +1（女子武夫）',
    path:{path:'wufu', realm:null, src:'原著', note:'北俱芦洲女子武夫，邓剑枰之姐'},
    sk:[{n:'翘',k:'reduce',v:1,o:'turn',f:'shield'},{n:'拳',k:'atk',v:1,f:'blood'}],
    brief:{ pos:'北俱芦洲 · 女子武夫 · 邓剑枰之姐',
      intro:'北俱芦洲女子武夫，邓剑枰之姐；姐弟自幼相依为命。',
      tags:['北俱芦洲','武夫','邓剑枰之姐','原著'],
      scenes:[{t:'姐弟相依',d:'与邓剑枰自幼相依为命。'}],
      rel:{弟:['邓剑枰'],所属:['北俱芦洲']},
      verdict:'姐姐的拳，替弟弟挡过风雨。'},
    plot:['北俱芦洲女子武夫，邓剑枰之姐。'] },

  { key:'赵鸾', name:'赵鸾', faction:'散修', hp:3, realm:null, talent:'机缘',
    skills:['鸾','妹'],
    txt:'【鸾】成为「剑气」目标时可弃一张牌视为打出「守心」；【妹】「赵树下」在场时手牌上限 +1',
    path:{path:'lianqi', realm:null, src:'原著', note:'赵树下之妹；胭脂郡旧事相关'},
    sk:[{n:'鸾',k:'dodgeAs',f:'shield'},{n:'妹',k:'hand',v:1,c:{with:'赵树下'},f:'aura'}],
    brief:{ pos:'胭脂郡 · 赵树下之妹',
      intro:'赵树下之妹。妖魔打进胭脂郡那天，兄长抄柴刀挡在她身前。',
      tags:['赵树下之妹','胭脂郡','原著'],
      scenes:[{t:'柴刀护妹',d:'兄长赵树下护妹的那一幕。'}],
      rel:{兄:['赵树下'],所属:['胭脂郡']},
      verdict:'有人替她挡过刀。'},
    plot:['赵树下之妹。'] },

  { key:'陈对', name:'陈对', faction:'散修', hp:3, realm:null, talent:'机缘',
    skills:['颍阴','救'],
    txt:'【颍阴】摸牌阶段多摸一张；【救】每局限一次，一名角色濒死时令其回复 1 点气血',
    path:{path:'lianqi', realm:null, src:'原著', note:'颍阴陈氏；救活刘羡阳并带往南婆娑洲'},
    sk:[{n:'颍阴',k:'draw',v:1,f:'lotus'},{n:'救',k:'deathsave',f:'lotus'}],
    brief:{ pos:'颍阴陈氏 · 救刘羡阳',
      intro:'颍阴陈氏人物。刘羡阳濒死时被其救活并带往南婆娑洲。',
      tags:['颍阴陈氏','刘羡阳','原著'],
      scenes:[{t:'救活刘羡阳',d:'在刘羡阳濒死之际出手相救。'}],
      rel:{相关:['刘羡阳','陈平安'],所属:['颍阴陈氏']},
      verdict:'一命之恩，埋下梦中练剑的后文。'},
    plot:['颍阴陈氏，救活刘羡阳。'] },

  { key:'离真', name:'离真', faction:'蛮荒天下', hp:4, realm:null, talent:'嗜血',
    skills:['天骄','离'],
    txt:'【天骄】你的「剑气」伤害 +1；【离】每局限一次，受到致命伤时免伤',
    path:{path:'yaozu', realm:null, src:'原著', note:'蛮荒第一天骄；隐官线与陈平安交手'},
    sk:[{n:'天骄',k:'atk',v:1,f:'blood'},{n:'离',k:'deathsave',f:'mist'}],
    brief:{ pos:'蛮荒天下 · 第一天骄',
      intro:'蛮荒第一天骄。隐官线上与陈平安正面交锋的关键对手。',
      tags:['蛮荒','天骄','隐官线','原著'],
      scenes:[{t:'与隐官交手',d:'蛮荒天骄与陈平安的正面交锋。'}],
      rel:{对手:['陈平安'],所属:['蛮荒天下']},
      verdict:'天骄对上隐官，剑下见真章。'},
    plot:['蛮荒第一天骄，隐官线关键对手。'] },

  { key:'姚冲道', name:'姚冲道', faction:'剑气长城', hp:3, realm:null, talent:'锋芒',
    skills:['冲道','联手'],
    txt:'【冲道】你的「剑气」伤害 +1；【联手】场上有「阿良」时手牌上限 +1',
    path:{path:'jianxiu', realm:null, src:'原著', note:'剑气长城剑修；与阿良联手对付蛮荒王座黄鸾'},
    sk:[{n:'冲道',k:'atk',v:1,f:'sword'},{n:'联手',k:'hand',v:1,c:{with:'阿良'},f:'aura'}],
    brief:{ pos:'剑气长城 · 与阿良联手',
      intro:'剑气长城一系剑修。王座黄鸾战记中，与阿良联手对其造成重创。',
      tags:['剑气长城','黄鸾','阿良','原著'],
      scenes:[{t:'联手斩鸾',d:'与阿良联手对付蛮荒王座黄鸾。'}],
      rel:{同伴:['阿良'],所属:['剑气长城']},
      verdict:'长城的剑，从来不是一个人在递。'},
    plot:['剑气长城剑修，与阿良联手对付黄鸾。'] },

  { key:'顾佑', name:'顾佑', faction:'散修', hp:4, realm:'止境武夫', talent:'机缘',
    skills:['佑','止境'],
    txt:'【佑】你受到伤害 -1（每回合限一次）；【止境】你的「剑气」伤害 +1（止境武夫）',
    path:{path:'wufu', realm:'止境武夫', src:'原著', note:'原著点名的止境武夫之一（与崔诚、马苦玄并列提及）'},
    sk:[{n:'佑',k:'reduce',v:1,o:'turn',f:'shield'},{n:'止境',k:'atk',v:1,f:'blood'}],
    brief:{ pos:'止境武夫',
      intro:'原著点名的止境武夫之一，常与崔诚、马苦玄并列提及。',
      tags:['武夫','止境','原著'],
      scenes:[], rel:{同列:['崔诚','马苦玄']},
      verdict:'止境武夫，拳重于言。'},
    plot:['原著点名的止境武夫之一。'] },
];

function insertBlock(src, startRe, block) {
  const lines = src.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (startRe.test(lines[i])) { start = i; break; }
  }
  if (start < 0) throw new Error('no start ' + startRe);
  let open = -1, openCh = '';
  for (let i = start; i < lines.length; i++) {
    const a = lines[i].indexOf('{'), b = lines[i].indexOf('[');
    if (a >= 0 && (b < 0 || a < b)) { open = i; openCh = '{'; break; }
    if (b >= 0) { open = i; openCh = '['; break; }
  }
  const closeCh = openCh === '{' ? '}' : ']';
  let depth = 0, end = -1;
  for (let i = open; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === openCh) depth++;
      else if (ch === closeCh) { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end >= 0) break;
  }
  if (end < 0) throw new Error('no end');
  let prev = end - 1;
  while (prev > 0 && !String(lines[prev]).trim()) prev--;
  if (prev > 0 && lines[prev].trim() && !lines[prev].trimEnd().endsWith(',') && !lines[prev].trimEnd().endsWith('{') && !lines[prev].trimEnd().endsWith('[')) {
    lines[prev] = lines[prev].replace(/\s*$/, ',');
  }
  lines.splice(end, 0, block);
  return lines.join('\n');
}

// game.js
let g = fs.readFileSync('game.js', 'utf8');
const charsBlock = NEW.map(c =>
  `  '${c.key}': { name:'${c.name}', faction:'${c.faction}', hp:${c.hp}, realm:${c.realm===null?'null':`'${c.realm}'`}, skills:['${c.skills[0]}','${c.skills[1]}'], talent:'${c.talent}', txt:'${c.txt}' },`
).join('\n');
const pathBlock = NEW.map(c =>
  `  '${c.key}': { path:'${c.path.path}', realm:${c.path.realm===null?'null':`'${c.path.realm}'`}, src:'${c.path.src}', note:'${c.path.note}' },`
).join('\n');
const skBlock = NEW.map(c => {
  const items = c.sk.map(s => {
    let mid = '';
    if (s.v !== undefined) mid += `,v:${s.v}`;
    if (s.o) mid += `,o:'${s.o}'`;
    if (typeof s.c === 'string') mid += `,c:'${s.c}'`;
    else if (s.c && s.c.with) mid += `,c:{with:'${s.c.with}'}`;
    return `{n:'${s.n}',k:'${s.k}'${mid},q:'',f:'${s.f}'}`;
  });
  return `  '${c.key}':[${items.join(',') }],`;
}).join('\n');

// skip if already added
if (!g.includes("'郭稼':")) {
  g = insertBlock(g, /^const CHARS\s*=/, charsBlock);
  g = insertBlock(g, /^const CHAR_PATH\s*=/, pathBlock);
  g = insertBlock(g, /^const SKILLS\s*=/, skBlock);
  fs.writeFileSync('game.js', g);
  console.log('game.js patched', NEW.length);
} else console.log('game.js already has new chars');

// briefs.js — BRIEFS object starts with first char key; find `const BRIEFS` or first entry after comments
// In this project BRIEFS is a large object starting near top. Use chenpingan as anchor.
function makeBrief(c) {
  const br = c.brief;
  const scenes = br.scenes.map(s => `{t:'${s.t}', d:'${s.d}', q:''}`).join(',');
  const rel = Object.entries(br.rel).map(([k,v]) => `${k}:[${v.map(x=>`'${x}'`).join(',')}]`).join(',');
  const tags = br.tags.map(t=>`'${t}'`).join(',');
  return `'${c.key}': {
  pos:'${br.pos}',
  intro:'${br.intro}',
  tags:[${tags}],
  scenes:[${scenes}],
  quotes:[],
  rel:{${rel}},
  verdict:'${br.verdict}',
  look:[],
  dress:[],
  temper:[]
},`;
}
const briefBlock = NEW.map(makeBrief).join('\n\n');
const plotBlock = NEW.map(c => `  '${c.key}':[\n    '${c.plot[0]}'\n  ],`).join('\n');

let b = fs.readFileSync('briefs.js', 'utf8');
if (!b.includes("'郭稼':")) {
  // BRIEFS: insert before `};\n\n/* ===== 关键情节` or before `const PLOTS`
  if (b.includes('const PLOTS = {')) {
    b = b.replace(/(\n\};\s*\n\s*\/\* ===== 关键情节)/, '\n' + briefBlock + '\n$1');
    // if replace failed pattern, try before const PLOTS after };
  }
  if (!b.includes("'郭稼':")) {
    // fallback: insert before closing of BRIEFS by locating first `};` that precedes const PLOTS
    const pi = b.indexOf('const PLOTS = {');
    if (pi < 0) throw new Error('no PLOTS');
    // walk back to `};` before PLOTS
    const before = b.slice(0, pi);
    const closeIdx = before.lastIndexOf('\n};');
    if (closeIdx < 0) throw new Error('no BRIEFS close');
    b = b.slice(0, closeIdx) + '\n' + briefBlock + b.slice(closeIdx);
  }
  // PLOTS insert before final `};` of PLOTS
  if (!b.includes("'郭稼':[") && !b.includes("'郭稼': [")) {
    // find last }; of file or of PLOTS
    const lastClose = b.lastIndexOf('\n};');
    b = b.slice(0, lastClose) + '\n' + plotBlock + b.slice(lastClose);
  }
  fs.writeFileSync('briefs.js', b);
  console.log('briefs.js patched');
} else console.log('briefs already has new chars');

// weapp briefs.js — module.exports object; append keys before final closing
let wb = fs.readFileSync('weapp/utils/briefs.js', 'utf8');
if (!wb.includes('"郭稼"')) {
  const wxBlock = NEW.map(c => {
    const br = c.brief;
    const scenes = br.scenes.map(s => `{"t":"${s.t}","d":"${s.d}","q":""}`).join(',');
    const rel = Object.entries(br.rel).map(([k,v]) => `"${k}":[${v.map(x=>`"${x}"`).join(',')}]`).join(',');
    const tags = br.tags.map(t=>`"${t}"`).join(',');
    return `  "${c.key}": {
    "pos": "${br.pos}",
    "intro": "${br.intro}",
    "tags": [${tags}],
    "scenes": [${scenes}],
    "quotes": [],
    "rel": {${rel}},
    "verdict": "${br.verdict}",
    "look": [],
    "dress": [],
    "temper": []
  },`;
  }).join('\n');
  // weapp file structure: module.exports = { ... keys ... };  OR just object of BRIEFS then PLOTS
  // Insert before the last `};` that closes module.exports
  const last = wb.lastIndexOf('\n};');
  if (last < 0) throw new Error('weapp briefs no close');
  // ensure comma on previous
  let prev = last - 1;
  while (prev > 0 && !wb[prev].trim()) prev--;
  let patched = wb;
  if (!wb.slice(prev-5, prev+1).trimEnd().endsWith(',')) {
    // insert comma at end of previous property line
    patched = wb.slice(0, last) + ',' + wb.slice(last);
    const last2 = patched.lastIndexOf('\n};');
    patched = patched.slice(0, last2) + '\n' + wxBlock + patched.slice(last2);
  } else {
    patched = wb.slice(0, last) + '\n' + wxBlock + wb.slice(last);
  }
  fs.writeFileSync('weapp/utils/briefs.js', patched);
  console.log('weapp briefs patched');
} else console.log('weapp briefs already has new');

console.log('DONE add', NEW.map(c=>c.name).join(','));
