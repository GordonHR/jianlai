'use strict';
/* ==========================================================================
 * 行迹录 · 修士档案  （profile.js · 小程序端 no-DOM 移植）
 * 源自 prototype/profile.js 逻辑核心。
 * 移植约定：删去 CSS 注入与 DOM 渲染，render() 改为 view() 推送纯数据快照。
 *
 * 境界体系复刻《剑来》原著：
 *  · 练气士十五境（下五境 / 中五境 / 上五境 / 失传二境）
 *  · 武道九境 + 止境三层 + 武神（第十一境）
 *  · 剑修共用练气十五境，作为道途分支（不臆造第三套境界表）。
 * ========================================================================== */

const WX = (typeof wx !== 'undefined') ? wx : null;
function lsGet(k, d){
  try{ const v = WX ? WX.getStorageSync(k) : (global.__ls && global.__ls[k]); return v==null ? d : v; }
  catch(e){ return d; }
}
function lsSet(k, v){
  try{ if(WX) WX.setStorageSync(k, v); else { global.__ls = global.__ls||{}; global.__ls[k]=v; } }catch(e){}
}
function vb(t){ if(WX && WX.vibrateShort){ try{ WX.vibrateShort({ type:(t||'light') }); }catch(e){} } }
const SFX = { set(){}, click(){ vb('light'); }, play(){ vb('medium'); }, ok(){ vb('medium'); }, bad(){ vb('heavy'); } };

/* ===================== 一、境界阶梯（复刻原著） ===================== */
const REALMS_LQ = [
  { i:1,  n:'铜 皮', grp:'下五境', d:'激发真气时，皮肤呈现紫铜色。' },
  { i:2,  n:'草 根', grp:'下五境', d:'斩草不除根，春风吹又生——出众的血肉恢复能力。' },
  { i:3,  n:'柳 筋', grp:'下五境', d:'昔有柳姓修士单凭炼筋登入上五境，前无古人。又称「留人境」。' },
  { i:4,  n:'骨 气', grp:'下五境', d:'「造就千金重骨，方有一两气。」儒教修士在此境得天独厚。' },
  { i:5,  n:'铸 炉', grp:'下五境', d:'「人生天地间，体魄为熔炉。」一只脚才算踏进修行的门槛。' },
  { i:6,  n:'洞 府', grp:'中五境', d:'府门洞开，开窍纳气。男子需再开九窍，女子十五窍——修行真正的第一道门槛。' },
  { i:7,  n:'观 海', grp:'中五境', d:'「我登楼观百川，入海即入我怀。」灵气反哺肉身，寻常可寿至百岁。' },
  { i:8,  n:'龙 门', grp:'中五境', d:'灵气逆流而上，如鲤鱼跃龙门。一生三次机会，三次不过便终身止步洞府。' },
  { i:9,  n:'金 丹', grp:'中五境', d:'「结成金丹客，方是我辈人。」整座气海凝为一颗金丹，自此可开宗立派。' },
  { i:10, n:'元 婴', grp:'中五境', d:'育一尊阳神或阴神，识海之内如有稚童居住。又称地仙，阳寿三百年起。' },
  { i:11, n:'玉 璞', grp:'上五境', d:'练气大成，返璞归真，修成无垢琉璃之躯，寿元五百年起。' },
  { i:12, n:'仙 人', grp:'上五境', d:'分左右两境，仙在前人在后——后者是提醒修士，莫忘先人后仙的本心初衷。' },
  { i:13, n:'飞 升', grp:'上五境', d:'天下之巅峰顶点。一入此境便为天地所不容，被视为天地之大盗巨寇。' },
  { i:14, n:'合 道', grp:'失传二境', d:'天机不可泄露，任何修士都三缄其口。合道分天时、地利、人和三途，皆不可言说。', lost:true },
  { i:15, n:'三教祖师', grp:'失传二境', d:'人间修士天花板，仅道祖、至圣先师、佛祖三位抵达（即十五境）。', lost:true }
];
const REALMS_WU = [
  { i:1,  n:'泥 胚', grp:'炼体三境', d:'粗糙不堪。巅峰圆满时，自身如一尊泥菩萨，气沉丹田，不动如山。' },
  { i:2,  n:'木 胎', grp:'炼体三境', d:'由粗入细，肌肤纹理精密如篆刻铭文。又名开山境，根骨好坏在此高下立判。' },
  { i:3,  n:'水 银', grp:'炼体三境', d:'血液浓稠如水银，重量却更加轻盈。突破需渡一劫，叫「泥菩萨过江」。' },
  { i:4,  n:'英 魂', grp:'炼气三境', d:'气血化魂，武魂真身初具。炼气三境，统称小宗师境界。' },
  { i:5,  n:'雄 魄', grp:'炼气三境', d:'魂魄壮大，气势慑人，可震慑低境修士——武夫战力的分水岭。' },
  { i:6,  n:'武 胆', grp:'炼气三境', d:'塑就一颗武胆，如练气士之金丹，绝境之中反而愈发勇猛。' },
  { i:7,  n:'金 身', grp:'炼神三境', d:'肉身成金，神力自生。佼佼者可修成金刚不败之躯、无垢金仙之体。' },
  { i:8,  n:'羽 化', grp:'炼神三境', d:'能够虚空悬停、御风而飞，故又称远游境。' },
  { i:9,  n:'山 巅', grp:'炼神三境', d:'被誉为「止境宗师」。拳裂城墙、掌劈大江，一身雄浑罡气，千军辟易。' },
  { i:10, n:'止境 · 气盛', grp:'止境三层', d:'第十境第一层。气血如烘炉，同境无敌。' },
  { i:11, n:'止境 · 归真', grp:'止境三层', d:'招式返璞，无招胜有招。' },
  { i:12, n:'止境 · 神到', grp:'止境三层', d:'心神与天地共鸣，一念之间可感知天地变化。' },
  { i:13, n:'武 神', grp:'第十一境', d:'武道巅峰，再进便是断头路。可媲美练气士十四境，世间仅有一人曾半步触及。' }
];
const XP_TH_LQ = [0, 20, 55, 110, 190, 300, 440, 620, 840, 1120, 1480, 1940, 2520, 3300, 4300];
const XP_TH_WU = [0, 20, 55, 115, 195, 300, 440, 620, 850, 1150, 1520, 1980, 2600];

/* ===================== 二、三条道途 ===================== */
const PF_PATHS = [
  {
    key:'jianxiu', name:'剑 修', sub:'杀力第一 · 境界从练气士',
    desc:'剑修没有自己的境界表，修为照练气士算。只是同境之下，没有谁的剑比剑修更快、更狠。所得精进，都用在那一剑上。',
    realms:'LQ', th:XP_TH_LQ,
    gains:[
      { at:3,  n:'剑骨', k:'range',    v:1, q:'筋脉既韧，一剑所能及的范围也不同了。' },
      { at:5,  n:'气府', k:'hand',     v:1, q:'体魄成炉，手里便也留得住牌。' },
      { at:7,  n:'剑心', k:'judge',    v:1, q:'剑心通明，道理先一步落在佛前。' },
      { at:9,  n:'剑丹', k:'draw',     v:1, q:'气海凝一剑丹，剑未出，意已先至。' },
      { at:11, n:'剑仙', k:'atk',      v:1, q:'玉璞之躯，剑气化形。这一剑，重一分。' },
      { at:13, n:'剑开天门', k:'atkLimit', v:1, q:'一剑之后，还有一剑。' }
    ]
  },
  {
    key:'lianqi', name:'练 气 士', sub:'纳气于府 · 修十五境',
    desc:'天下修士通用的一把尺子：把天地灵气牵引进來，浇筑皮肉筋骨，一步一步往上登山。牌多、气长、后劲足。',
    realms:'LQ', th:XP_TH_LQ,
    gains:[
      { at:3,  n:'留人', k:'judge',    v:1, q:'柳筋既成，道理讲得比旁人通透半分。' },
      { at:5,  n:'气府', k:'hand',     v:1, q:'体魄为熔炉，真气有了存处，手里自然宽裕。' },
      { at:7,  n:'观海', k:'draw',     v:1, q:'百川入海，皆入我怀——取之不尽。' },
      { at:9,  n:'凝丹', k:'hand',     v:1, q:'结成金丹客，方是我辈人。' },
      { at:11, n:'无垢', k:'draw',     v:1, q:'琉璃无垢之躯，天地灵气来去自如。' },
      { at:13, n:'大盗', k:'atk',      v:1, q:'天地视我为大盗巨寇——那便让它怕得有理。' }
    ]
  },
  {
    key:'wufu', name:'武 夫', sub:'独修己身 · 武道九境',
    desc:'不借天地一分力气，只把自家的一身皮肉血气打磨到极处。寿元比不得山上人，可近身十丈之内，谁都得先掂量掂量自己的骨头。',
    realms:'WU', th:XP_TH_WU,
    gains:[
      { at:2,  n:'开山', k:'range',    v:1, q:'经脉拓宽如阳关大道，出手自然够得着了。' },
      { at:4,  n:'英魂', k:'judge',    v:1, q:'气血化魂，敌未动而其势先为我所察。' },
      { at:6,  n:'武胆', k:'hand',     v:1, q:'一颗武胆在，绝境里才腾得出手。' },
      { at:8,  n:'远游', k:'draw',     v:1, q:'御风而行，看得远，路子也多。' },
      { at:10, n:'气盛', k:'atk',      v:1, q:'气血如烘炉，一拳下去，不会有人觉得轻。' },
      { at:12, n:'神到', k:'atkLimit', v:1, q:'心神与天地共鸣，一念起，拳已至。' }
    ]
  }
];

const XP_SRC = {
  win:   { hot:6,  ai:12, siege:20, boss:18 },
  lose:  { hot:3,  ai:5,  siege:6,  boss:5  },
  ending:{ asklake:15, sect:25, shenci:15 },
  repeat:{ asklake:3,  sect:4,  shenci:3  },
  baofu: { buy:2, real:6, fake:2, eye:3 },
  read:  { codex:1, wsp:2 }
};

/* 见闻总量（收集度分母）
   ------------------------------------------------------------------
   微信分包之间不可相互 require，故此处以常量记录总量；改动源头时必须同步本表：
     书简湖 asklake = packageShujianhu/utils/shujianhu.js  AL_ENDINGS   （19）
     落魄山 sect    = 主包 utils/sect.js                    SECT_ENDINGS （17）
     山水祠 shenci  = packageShui/utils/shenci.js           SC_ENDINGS   （7）
     人物志 codex   = 主包 utils/data.js                    CHARS        （136，运行时动态取，取不到才用此值）
     无事牌 wsp     = packageArt/pages/wushipai/wushipai.js WSP_CARDS    （80） */
const PF_SEEN_TOT = { asklake:19, sect:17, shenci:7, codex:136, wsp:80 };

/* ===================== 三、存档 ===================== */
const PF_KEY = 'jianlai_profile';
let PF = null;
let PF_broke = null;       // 本次会话待展示的破境信息
let SHOW_LADDER = 'LQ';    // 境界图鉴参考切换（LQ / WU）
let HOOK = null;
function pfDefault(){
  const d = new Date();
  return {
    v:1, name:'', path:'', xp:0,
    since: d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(),
    batt:{ total:0, win:0, lose:0, streak:0, best:0 },
    byMode:{}, byDiff:{}, byChar:{},
    seen:{ asklake:{}, sect:{}, shenci:{} },
    read:{ codex:{}, wsp:0, wspSeen:{} },
    log:[]
  };
}
function pfLoad(){
  if(PF) return PF;
  PF = pfDefault();
  try{
    const o = JSON.parse(lsGet(PF_KEY, 'null'));
    if(o && typeof o==='object'){
      PF.name   = typeof o.name==='string' ? o.name : '';
      PF.path   = (pfPath(o.path) ? o.path : '');
      PF.xp     = o.xp|0;
      PF.since  = o.since || PF.since;
      const b = o.batt||{};
      PF.batt = { total:b.total|0, win:b.win|0, lose:b.lose|0, streak:b.streak|0, best:b.best|0 };
      PF.byMode = (o.byMode && typeof o.byMode==='object') ? o.byMode : {};
      PF.byDiff = (o.byDiff && typeof o.byDiff==='object') ? o.byDiff : {};
      PF.byChar = (o.byChar && typeof o.byChar==='object') ? o.byChar : {};
      const s = o.seen||{};
      PF.seen = {
        asklake: (s.asklake && typeof s.asklake==='object') ? s.asklake : {},
        sect:    (s.sect    && typeof s.sect   ==='object') ? s.sect    : {},
        shenci:  (s.shenci  && typeof s.shenci ==='object') ? s.shenci  : {}
      };
      const r = o.read||{};
      PF.read = { codex:(r.codex && typeof r.codex==='object') ? r.codex : {}, wsp:r.wsp|0, wspSeen:(r.wspSeen && typeof r.wspSeen==='object') ? r.wspSeen : {} };
      PF.log  = Array.isArray(o.log) ? o.log.slice(0,60) : [];
    }
  }catch(e){}
  return PF;
}
function pfSave(){ if(!PF) return; try{ lsSet(PF_KEY, JSON.stringify(PF)); }catch(e){} }
function pfPath(key){ return PF_PATHS.filter(p=>p.key===key)[0] || null; }
function pfRealms(){ const p = pfPath(PF ? PF.path : ''); return (p && p.realms==='WU') ? REALMS_WU : REALMS_LQ; }
function pfThresholds(){ const p = pfPath(PF ? PF.path : ''); return (p && p.realms==='WU') ? XP_TH_WU : XP_TH_LQ; }

function pfLevel(){ const th = pfThresholds(), xp = (PF && PF.xp) || 0; let i = 0; for(let k=0;k<th.length;k++){ if(xp >= th[k]) i = k; } return i; }
function pfNow(){ const rs = pfRealms(); return rs[pfLevel()] || rs[0]; }
function pfNext(){
  const th = pfThresholds(), rs = pfRealms(), i = pfLevel();
  if(i >= th.length-1) return null;
  return { realm: rs[i+1], need: th[i+1], cur: (PF && PF.xp)||0, far: th[i+1]-((PF&&PF.xp)||0) };
}
function pfProgress(){
  const th = pfThresholds(), i = pfLevel(), xp = (PF&&PF.xp)||0;
  if(i >= th.length-1) return 100;
  const a = th[i], b = th[i+1];
  return Math.max(0, Math.min(100, Math.round((xp-a)/(b-a)*100)));
}
function pfGains(level){ const p = pfPath(PF ? PF.path : ''); if(!p) return []; return p.gains.filter(g=>g.at <= level); }

/* ===================== 五、道行加减与破境 ===================== */
function pfStamp(){ const d = new Date(); return (d.getMonth()+1)+'月'+d.getDate()+'日'; }
function pfNote(mod, txt, xp){ pfLoad(); PF.log.unshift({ t:pfStamp(), m:mod, s:txt, x:(xp||0) }); if(PF.log.length > 60) PF.log.length = 60; }
function pfAdd(n, note, mod){
  pfLoad();
  if(!n){ if(note) pfNote(mod||'杂', note, 0); pfSave(); emitView(); return null; }
  const before = pfLevel();
  PF.xp += n;
  const after = pfLevel();
  pfNote(mod||'杂', note || ('得道行 '+n), n);
  pfSave();
  /* 破境信息必须在 emitView 之前挂好 —— 否则 view() 取到的仍是旧值，
     破境横幅永远推送不出去（原实现先 emitView 再赋 PF_broke，属时序错位）。 */
  let info = null;
  if(after > before){
    info = { from: pfRealms()[before], to: pfRealms()[after], gains: pfGains(after).filter(g=>g.at>before) };
    PF_broke = info;
  }
  emitView();
  return info;
}

/* ===================== 六、对外：各模块埋点 ===================== */
function prRecordBattle(win, mode, diff, rounds, myChars){
  pfLoad();
  const m = XP_SRC.win[mode]!==undefined ? mode : 'ai';
  const xp = win ? XP_SRC.win[m] : XP_SRC.lose[m];
  const dMul = (diff==='hard') ? 1.25 : (diff==='easy' ? 0.8 : 1);
  const gain = Math.max(1, Math.round(xp * dMul));
  PF.batt.total++;
  const bm = PF.byMode[mode] || { w:0, l:0 };
  bm[win?'w':'l']++; PF.byMode[mode] = bm;
  const bd = PF.byDiff[diff||'normal'] || { w:0, l:0 };
  bd[win?'w':'l']++; PF.byDiff[diff||'normal'] = bd;
  if(win){ PF.batt.win++; PF.batt.streak++; if(PF.batt.streak>PF.batt.best) PF.batt.best=PF.batt.streak; }
  else   { PF.batt.lose++; PF.batt.streak = 0; }
  /* 出战角色写入流水（对齐 PC 的「同座：X、Y」）。角色名尽量从主包 data.js 取，
     取不到（如测试环境无 require）则退回角色 key，不影响流程。 */
  let named = '';
  try{
    const me = Array.isArray(myChars) ? myChars : [];
    if(me.length){
      let CH = null;
      try{ if(typeof require==='function'){ const d = require('../../utils/data.js'); CH = d && d.CHARS; } }catch(e){}
      named = me.map(function(k){ const c = CH && CH[k]; return (c && c.name) ? c.name : k; }).join('、');
    }
  }catch(e){}
  const modeName = { hot:'群雄论剑', ai:'仗剑独行', siege:'剑气长城', boss:'天下共伐' }[mode] || mode;
  const txt = (win ? '胜' : '败') + ' · ' + modeName
            + (named ? ('　同座：' + named) : '')
            + (rounds ? ('　' + rounds + ' 回合') : '');
  return pfAdd(gain, txt, '战');
}
function prRecordEnding(mod, key, title, isNew){
  pfLoad();
  const table = isNew ? XP_SRC.ending : XP_SRC.repeat;
  let xp = table[mod] || 3;
  const seen = PF.seen[mod] || (PF.seen[mod] = {});
  seen[key] = (seen[key]||0) + 1;
  const map = { asklake:'书简湖', sect:'落魄山', shenci:'山水祠' };
  const txt = (isNew ? '新得结局' : '再走一回') + ' · ' + (map[mod]||mod) + '「'+(title||key)+'」';
  return pfAdd(xp, txt, mod);
}
function prRecordBaofu(kind, name){
  pfLoad();
  const xp = XP_SRC.baofu[kind] || 1;
  const map = { buy:'购得', real:'拣漏', fake:'打眼', eye:'掌眼' };
  return pfAdd(xp, '包袱斋 · '+(map[kind]||kind)+'「'+(name||'一物')+'」', '斋');
}
function prRecordRead(kind, key, name){
  pfLoad();
  if(kind==='codex'){
    if(PF.read.codex[key]) return null;
    PF.read.codex[key] = 1;
    return pfAdd(XP_SRC.read.codex, '翻阅人物志 · '+(name||key), '阅');
  }
  if(kind==='wsp'){
    if(PF.read.wspSeen[key]){ pfSave(); return null; }
    PF.read.wspSeen[key] = 1; PF.read.wsp++;
    pfSave();
    if(PF.read.wsp % 10 !== 0) return null;
    return pfAdd(XP_SRC.read.wsp, '无事牌翻过 '+PF.read.wsp+' 面', '阅');
  }
  return null;
}
/* ---------------- 入局注入境界收益 ----------------
 * 与包袱斋 bfApplyLoadout 同一纪律：群雄论剑（hot）为同席切磋，不带境界入局，以存公允。
 * 必须是 ai/siege/boss 才注入。 */
function prApplyRealm(players, mode){
  pfLoad();
  if(!players || !players.length || mode==='hot') return;
  if(!PF.path) return;                       // 尚未择道
  const lv = pfLevel();
  const gs = pfGains(lv);
  if(!gs.length) return;
  const list = gs.map(function(g){ return { n:g.n, k:g.k, v:g.v, o:null, c:null }; });
  players.forEach(function(p){
    const mine = (mode==='siege') ? p.side==='ally'
               : (mode==='boss')  ? p.side==='hero'
               : (mode==='ai')    ? p.id===0
               : false;
    if(mine){ p.extraSkills = ((p&&p.extraSkills) ? p.extraSkills : []).concat(list); }
  });
}

/* 跨模块入口：被其他模块（如包袱斋）调用，统一路由到 pfAdd */
function profileRecord(mod, kind, name){
  if(mod==='baofu') return prRecordBaofu(kind, name);
  return null;
}
if(typeof global!=='undefined'){ global.__jl_profile_record = profileRecord; }

/* ===================== 七、择道 / 改名号 ===================== */
function pfSetPath(key){ pfLoad(); if(!pfPath(key)) return; PF.path = key; PF.log.unshift({ t:pfStamp(), m:'路', s:'择定道途 · ' + pfPath(key).name.replace(/\s/g,''), x:0 }); pfSave(); if(HOOK) emitView(); }
function pfSetName(nm){ pfLoad(); PF.name = String(nm||'').replace(/[<>\\]/g,'').slice(0,12); pfSave(); if(HOOK) emitView(); }
function pfRandomName(){
  const XING = ['陈','李','宁','齐','崔','魏','裴','赵','郭','苏','晋','阮','陆','柳','顾','钱','姜','胡','陶','卓'];
  const MING = ['平安','石头','守拙','问心','见山','行舟','知秋','不争','寄声','朝雾','青笠','负笈','折梅','枕流','抱朴','观棋','听雨','扶疏','子归','未眠'];
  const pick = function(a){ return a[Math.floor(Math.random()*a.length)]; };
  return (pick(XING) + pick(MING)).slice(0,6);
}
/* 手动录入战功（移动端自包含；正式对战模块亦会埋点） */
function pfRecordWin(){ return prRecordBattle(true,'ai','normal',10,[]); }

/* ===================== 八、境界图鉴参考 ===================== */
function ladderOf(which){
  const rs = (which==='WU') ? REALMS_WU : REALMS_LQ;
  const lv = (PF && PF.path) ? pfLevel() : -1;      // -1 = 尚未择道
  /* 当前道途是否正是这套体系 —— 武道玩家翻练气士图鉴时不标「已抵达」，免得张冠李戴 */
  const same = !!(PF && PF.path) && (pfRealms() === rs);
  return rs.map(function(r){
    /* 修正：原判定用 th[lv]+1（道行阈值）去比 r.i（境界序号），六境之后恒真，
       导致全部境界误显示为已解锁。正解是拿现处境界序号比：r.i <= lv+1。 */
    const reached = (lv >= 0 && same) ? (r.i <= lv + 1) : false;
    return { i:r.i, n:r.n, grp:r.grp, d:r.d, lost:!!r.lost,
             unlocked: reached,
             isNow: (reached && r.i === (lv + 1)) };
  });
}

/* ===================== 快照 ===================== */
function emitView(){ if(HOOK) try{ HOOK(view()); }catch(e){ console.error(e); } }
function setHook(fn){ HOOK = fn; if(PF) emitView(); }
function open(){
  pfLoad();
  /* 图鉴默认跟随已择道途：武道玩家进来先看武道，免得先见练气士十五境还要手动切 */
  const p = pfPath(PF.path);
  SHOW_LADDER = (p && p.realms === 'WU') ? 'WU' : 'LQ';
  if(HOOK) emitView();
}
function setLadder(w){ SHOW_LADDER = (w==='WU') ? 'WU' : 'LQ'; if(HOOK) emitView(); }

function view(){
  pfLoad();
  const p = pfPath(PF.path);
  const lv = (PF && PF.path) ? pfLevel() : -1;
  const broke = PF_broke; PF_broke = null;
  // 跨模块：若包袱斋有雪花钱，一并呈现
  let baofuCoin = 0;
  try{ const b = JSON.parse(lsGet('jianlai_baofu','null')); if(b && typeof b==='object') baofuCoin = b.coin|0; }catch(e){}
  /* 见闻口径对齐 PC：记「结局种类数」而非「走过次数」，收集度才有意义 */
  const kindCount = function(o){ let n=0; if(o) for(const k in o){ if(o[k]) n++; } return n; };
  const B = PF.batt;
  const wr = B.total ? Math.round(B.win / B.total * 100) : 0;
  /* 人物志总量优先动态取（主包 data.js 对分包可 require），取不到用常量兜底 */
  let codexTot = PF_SEEN_TOT.codex;
  try{ if(typeof require==='function'){ const d = require('../../utils/data.js'); if(d && d.CHARS) codexTot = Object.keys(d.CHARS).length || codexTot; } }catch(e){}
  return {
    ready:true,
    title: PF.name ? ('道友 · '+PF.name) : '行 迹 录',
    greet: p ? (p.name.replace(/\s/g,'') + ' · ' + pfNow().n.replace(/\s/g,'') + '　|　' + pfNow().grp) : '尚未择道',
    hasPath: !!p,
    name: PF.name, since: PF.since, xp: PF.xp,
    paths: PF_PATHS.map(function(pp){ return { key:pp.key, name:pp.name, sub:pp.sub, desc:pp.desc, on:(pp.key===PF.path) }; }),
    ladderKind: SHOW_LADDER,
    ladderLQ: ladderOf('LQ'),
    ladderWU: ladderOf('WU'),
    level: lv, progress: pfProgress(),
    gains: (p ? pfGains(lv).map(function(g){ return { n:g.n, cls:g.k, q:g.q }; }) : []),
    next: (p && pfNext()) ? { name: pfNext().realm.n.replace(/\s/g,''), far: pfNext().far } : null,
    /* 本次会话新破境时给出，供页面顶部横幅展示（此前算出来却被丢弃，破境提示永不显示） */
    broke: broke ? {
      to: broke.to.n.replace(/\s/g,''), grp: broke.to.grp,
      from: broke.from ? broke.from.n.replace(/\s/g,'') : '',
      gains: broke.gains.map(function(g){ return g.n; }).join('、'), d: broke.to.d || ''
    } : null,
    stats: {
      batt: PF.batt, wr: wr,
      baofuCoin: baofuCoin,
      seen: {
        asklake: kindCount(PF.seen.asklake), sect: kindCount(PF.seen.sect), shenci: kindCount(PF.seen.shenci),
        totAsklake: PF_SEEN_TOT.asklake, totSect: PF_SEEN_TOT.sect, totShenci: PF_SEEN_TOT.shenci
      },
      codex: kindCount(PF.read.codex), codexTot: codexTot,
      wsp: PF.read.wsp, wspTot: PF_SEEN_TOT.wsp
    },
    log: PF.log.slice(0, 20)
  };
}

module.exports = {
  setHook:setHook, emitView:emitView, open:open, setLadder:setLadder, view:view,
  pick:pfSetPath, setName:pfSetName, randomName:pfRandomName, recordWin:pfRecordWin,
  recordBattle:prRecordBattle, recordEnding:prRecordEnding, recordBaofu:prRecordBaofu, recordRead:prRecordRead,
  applyRealm:prApplyRealm, level:pfLevel, gains:pfGains, realms:pfRealms, thresholds:pfThresholds,
  paths:PF_PATHS, realmsLQ:REALMS_LQ, realmsWU:REALMS_WU, xpSrc:XP_SRC
};
