/* ==========================================================================
   行迹录 · 修士档案  (profile.js)
   —— 玩家信息 / 境界等级 / 跨模块记录      PC 端专属，暂不同步小程序
   --------------------------------------------------------------------------
   境界体系复刻《剑来》原著：
     · 练气士十五境（下五境 / 中五境 / 上五境 / 失传二境）
     · 武道九境 + 止境三层 + 武神（第十一境）
   原著中「剑修」并无独立于练气士的境界表，只是同境杀力最强。故此处不臆造
   第三套境界表，而是把「剑修」作为练气十五境上的道途分支：共用同一份阶梯，
   但所得境界收益偏攻击方向。
   --------------------------------------------------------------------------
   依赖约定：所有对外调用均允许宿主缺失（typeof 保护），不得因本模块缺失
   或报错而打断任何一个既有模块的流程。
   ========================================================================== */

/* ---------------- 一、境界阶梯（复刻原著） ---------------- */

/* 练气士十五境 —— 剑修与练气士共用 */
const REALMS_LQ = [
  { i:1,  n:'铜 皮', grp:'下五境', d:'激发真气时，皮肤呈现紫铜色。' },
  { i:2,  n:'草 根', grp:'下五境', d:'斩草不除根，春风吹又生——出众的血肉恢复能力。' },
  { i:3,  n:'柳 筋', grp:'下五境', d:'昔有柳姓修士单凭炼筋登入上五境，前无古人。又称「留人境」，因太多人在此钻牛角尖、贻误终身。' },
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
  { i:14, n:'合 道', grp:'失传二境', d:'天机不可泄露，任何修士都三缄其口。此境以下，只余揣测。合道分天时、地利、人和三途，皆不可言说。', lost:true },
  { i:15, n:'三教祖师', grp:'失传二境', d:'人间修士天花板，仅道祖、至圣先师、佛祖三位抵达（即十五境）。', lost:true }
];

/* 武道 —— 炼体三境 / 炼气三境 / 炼神三境 / 止境三层 / 武神 */
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
  { i:13, n:'武 神', grp:'第十一境', d:'武道巅峰，再进便是断头路。真正的十一境可媲美练气士十四境，传说中世间仅有一人曾半步触及此境。' }
];

/* 道行门槛：道途各自 separate 曲线，前期快、后期慢 */
const XP_TH_LQ = [0, 20, 55, 110, 190, 300, 440, 620, 840, 1120, 1480, 1940, 2520, 3300, 4300];
const XP_TH_WU = [0, 20, 55, 115, 195, 300, 440, 620, 850, 1150, 1520, 1980, 2600];

/* ---------------- 二、三条道途 ----------------
   境界收益一律只走「可累加」技能键（atk / atkLimit / draw / hand / judge / range）。
   理由：reduce / regen / hitdraw / hitextra / nododge 等键在结算里走 firstK，
   只取第一个生效，若角色本身已有同类技能，注入项会被吃掉变成白给。
   强度纪律：每条道途只有 1 点 atk、1 点 atkLimit，且都落在第 9 境之后，
   前期 4 个解锁点全部是「资源/感知」类，避免早早滚雪球。               */

const PF_PATHS = [
  {
    key:'jianxiu', name:'剑 修', sub:'杀力第一 · 境界从练气士',
    desc:'剑修没有自己的境界表，修为照练气士算。只是同境之下，没有谁的剑比剑修更快、更狠。'
       + '你走的是纯粹剑道——所得精进，都用在那一剑上。',
    realms:'LQ', th:XP_TH_LQ,
    gains:[
      { at:3,  n:'剑骨', k:'range',    v:1, q:'筋脉既韧，一剑所能及的范围也不同了。' },
      { at:5,  n:'气府', k:'hand',     v:1, q:'体魄成炉，容得下的东西多了，手里便也留得住牌。' },
      { at:7,  n:'剑心', k:'judge',    v:1, q:'剑心通明，道理先一步落在佛前——气势自生。' },
      { at:9,  n:'剑丹', k:'draw',     v:1, q:'气海凝一剑丹，剑未出，意已先至。' },
      { at:11, n:'剑仙', k:'atk',      v:1, q:'玉璞之躯，剑气化形。这一剑，重一分。' },
      { at:13, n:'剑开天门', k:'atkLimit', v:1, q:'一剑之后，还有一剑。' }
    ]
  },
  {
    key:'lianqi', name:'练 气 士', sub:'纳气于府 · 修十五境',
    desc:'天下修士通用的一把尺子：把天地灵气牵引进來，浇筑皮肉筋骨，一步一步往上登山。你走的是正宗修行——牌多、气长、后劲足。',
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

/* ---------------- 三、道行来源分量 ---------------- */
const XP_SRC = {
  win:   { hot:6,  ai:12, siege:20, boss:18 },
  lose:  { hot:3,  ai:5,  siege:6,  boss:5  },
  ending:{ asklake:15, sect:25, shenci:15 },
  repeat:{ asklake:3,  sect:4,  shenci:3  },
  baofu: { buy:2, real:6, fake:2, eye:3 },
  read:  { codex:1, wsp:2 }
};

/* ---------------- 四、存档 ---------------- */
const PF_KEY = 'jianlai_profile';
var PF = null;          // 存档对象（懒加载）。用 var：浏览器顶层 var 即全局，game.js 的 pfTitleCard 需跨脚本访问 PF
var PF_broke = null;    // 本次会话待展示的破境信息

function pfDefault(){
  const d = new Date();
  return {
    v:1,
    name:'', path:'', xp:0,
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
    const o = JSON.parse(localStorage.getItem(PF_KEY)||'null');
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
      PF.read = { codex:(r.codex && typeof r.codex==='object') ? r.codex : {},
                  wsp:r.wsp|0,
                  wspSeen:(r.wspSeen && typeof r.wspSeen==='object') ? r.wspSeen : {} };
      PF.log  = Array.isArray(o.log) ? o.log.slice(0,60) : [];
    }
  }catch(e){}
  return PF;
}
function pfSave(){
  if(!PF) return;
  try{ localStorage.setItem(PF_KEY, JSON.stringify(PF)); }catch(e){}
}
function pfPath(key){ return PF_PATHS.filter(p=>p.key===key)[0] || null; }
function pfRealms(){
  const p = pfPath(PF ? PF.path : '');
  return (p && p.realms==='WU') ? REALMS_WU : REALMS_LQ;
}
function pfThresholds(){
  const p = pfPath(PF ? PF.path : '');
  return (p && p.realms==='WU') ? XP_TH_WU : XP_TH_LQ;
}
/* 当前境界索引（0 起）与基本信息 */
function pfLevel(){
  const th = pfThresholds(), xp = (PF && PF.xp) || 0;
  let i = 0;
  for(let k=0;k<th.length;k++){ if(xp >= th[k]) i = k; }
  return i;
}
function pfNow(){
  const rs = pfRealms();
  return rs[pfLevel()] || rs[0];
}
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
/* 已解锁的境界收益（含是否被下方极端 race 影响：一律永久生效，不带 once） */
function pfGains(level){
  const p = pfPath(PF ? PF.path : '');
  if(!p) return [];
  return p.gains.filter(g=>g.at <= level);
}

/* ---------------- 五、道行加减与破境 ---------------- */
function pfStamp(){
  const d = new Date();
  return (d.getMonth()+1)+'月'+d.getDate()+'日';
}
function pfNote(mod, txt, xp){
  pfLoad();
  PF.log.unshift({ t:pfStamp(), m:mod, s:txt, x:(xp||0) });
  if(PF.log.length > 60) PF.log.length = 60;
}
/* 加道行，返回是否破境 */
function pfAdd(n, note, mod){
  pfLoad();
  if(!n) { if(note) pfNote(mod||'杂', note, 0); pfSave(); return null; }
  const before = pfLevel();
  PF.xp += n;
  const after = pfLevel();
  pfNote(mod||'杂', note || ('得道行 '+n), n);
  pfSave();
  if(after > before){
    const info = { from: pfRealms()[before], to: pfRealms()[after], gains: pfGains(after).filter(g=>g.at>before) };
    PF_broke = info;
    return info;
  }
  return null;
}

/* ---------------- 六、对外：各模块埋点 ---------------- */

/* 战局：mode / diff / 回合数 / 我方出战角色 keys */
function prRecordBattle(win, mode, diff, rounds, myChars){
  pfLoad();
  const m = XP_SRC.win[mode]!==undefined ? mode : 'ai';
  const xp = win ? XP_SRC.win[m] : XP_SRC.lose[m];
  const dMul = (diff==='hard') ? 1.25 : (diff==='easy' ? 0.8 : 1);
  const gain = Math.max(1, Math.round(xp * dMul));

  PF.batt.total++;
  const bm = PF.byMode[mode] || { w:0, l:0 };
  bm[win?'w':'l']++;
  PF.byMode[mode] = bm;

  const bd = PF.byDiff[diff||'normal'] || { w:0, l:0 };
  bd[win?'w':'l']++;
  PF.byDiff[diff||'normal'] = bd;

  if(win){ PF.batt.win++; PF.batt.streak++; if(PF.batt.streak>PF.batt.best) PF.batt.best=PF.batt.streak; }
  else   { PF.batt.lose++; PF.batt.streak = 0; }

  let named = '';
  try{
    const me = Array.isArray(myChars) ? myChars : [];
    named = me.map(k=>(typeof CHARS!=='undefined' && CHARS[k]) ? CHARS[k].name : k).join('、');
    me.forEach(k=>{
      const c = PF.byChar[k] || { p:0, w:0, l:0 };
      c.p++; c[win?'w':'l']++;
      PF.byChar[k] = c;
    });
  }catch(e){}

  const modeName = { hot:'群雄论剑', ai:'仗剑独行', siege:'剑气长城', boss:'天下共伐' }[mode] || mode;
  const txt = (win ? '胜' : '败') + ' · ' + modeName
            + (named ? ('　同座：'+named) : '')
            + (rounds ? ('　'+rounds+' 回合') : '');
  return pfAdd(gain, txt, '战');
}

/* 叙事/经营结局：mod = asklake | sect | shenci；isNew 是否首次解锁 */
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

/* 包袱斋 */
function prRecordBaofu(kind, name){
  pfLoad();
  const xp = XP_SRC.baofu[kind] || 1;
  const map = { buy:'购得', real:'拣漏', fake:'打眼', eye:'掌眼' };
  return pfAdd(xp, '包袱斋 · '+(map[kind]||kind)+'「'+(name||'一物')+'」', '斋');
}

/* 阅览：人物志 / 无事牌（每位/每十面只记一次） */
function prRecordRead(kind, key, name){
  pfLoad();
  if(kind==='codex'){
    if(PF.read.codex[key]) return null;
    PF.read.codex[key] = 1;
    return pfAdd(XP_SRC.read.codex, '翻阅人物志 · '+(name||key), '阅');
  }
  if(kind==='wsp'){
    if(PF.read.wspSeen[key]) { pfSave(); return null; }   // 同一面只算一次
    PF.read.wspSeen[key] = 1;
    PF.read.wsp++;
    pfSave();
    if(PF.read.wsp % 10 !== 0) return null;
    return pfAdd(XP_SRC.read.wsp, '无事牌翻过 '+PF.read.wsp+' 面', '阅');
  }
  return null;
}

/* ---------------- 七、对外：入局注入境界收益 ----------------
   与包袱斋 bfApplyLoadout 同一纪律：群雄论剑（hot）为同席切磋，不带境界入局，
   以存公允。必须是 ai/siege/boss 才注入。 */
function prApplyRealm(players, mode){
  pfLoad();
  if(!players || !players.length || mode==='hot') return;
  if(!PF.path) return;                       // 尚未择道
  const lv = pfLevel();
  const gs = pfGains(lv);
  if(!gs.length) return;
  const list = gs.map(g=>({ n:g.n, k:g.k, v:g.v, o:null, c:null }));
  players.forEach(p=>{
    const mine = (mode==='siege') ? p.side==='ally'
               : (mode==='boss')  ? p.side==='hero'
               : (mode==='ai')    ? p.id===0
               : false;
    if(mine){
      p.extraSkills = ((p&&p.extraSkills) ? p.extraSkills : []).concat(list);
    }
  });
}

/* ---------------- 八、改名号 / 择道 ---------------- */
function pfSetName(nm){
  pfLoad();
  PF.name = String(nm||'').replace(/[<>\\]/g,'').slice(0,12);
  pfSave();
}
function pfSetPath(key){
  pfLoad();
  if(!pfPath(key)) return;
  PF.path = key;
  PF.log.unshift({ t:pfStamp(), m:'路', s:'择定道途 · ' + pfPath(key).name.replace(/\s/g,''), x:0 });
  pfSave();
}
/* 随机道号：姓 + 双字，取原著气味的字，不取真人角色全名 */
function pfRandomName(){
  const XING = ['陈','李','宁','齐','崔','魏','裴','赵','郭','苏','晋','阮','陆','柳','顾','钱','姜','胡','陶','卓'];
  const MING = ['平安','石头','守拙','问心','见山','行舟','知秋','不争','寄声','朝雾','青笠','负笈','折梅','枕流','抱朴','观棋','听雨','扶疏','子归','未眠'];
  const pick = function(a){ return a[Math.floor(Math.random()*a.length)]; };
  return (pick(XING) + pick(MING)).slice(0,6);
}

/* ---------------- 九、界面入口 ---------------- */
function openProfile(){
  SFX.set(true); SFX.click();
  state = { phase:'profile', mode:'profile', sel:[], filter:'全部', q:'', log:[] };
  render();
}
function pfEsc(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function pfTitle(){ return PF.name ? ('道友 · '+PF.name) : '行 迹 录'; }
function pfGreet(){
  const p = pfPath(PF.path);
  const rl = pfNow();
  if(!p) return '尚未择道。';
  return p.name.replace(/\s/g,'') + ' · ' + rl.n.replace(/\s/g,'') + '　|　' + rl.grp;
}

/* ==========================================================================
   十、行迹录界面
   ========================================================================== */

(function injectProfileStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('profile-style')) return;
  const css = `
  .pf { max-width:1080px; margin:0 auto; padding:34px 26px 90px; position:relative; z-index:1; color:#ddd2ba; }
  .pf-top { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:6px; }
  .pf-h { font-size:30px; letter-spacing:12px; color:var(--gold,#e8c66a); margin:0; font-weight:500; }
  .pf-sub { font-size:12px; letter-spacing:3px; color:#8b8371; margin:0 0 26px; text-align:center; }
  .pf-back { font-size:13px; letter-spacing:2px; color:#b8893b; border:1px solid rgba(232,198,106,.3);
             background:rgba(0,0,0,.3); padding:8px 16px; border-radius:3px; cursor:pointer; transition:all .16s; }
  .pf-back:hover { color:var(--gold,#e8c66a); border-color:var(--gold,#e8c66a); }

  .pf-broke { margin:0 0 22px; padding:14px 18px; border:1px solid rgba(232,198,106,.45); border-radius:3px;
              background:linear-gradient(180deg, rgba(232,198,106,.14), rgba(232,198,106,.04)); text-align:center; }
  .pf-broke .bk { font-size:14px; letter-spacing:4px; color:var(--gold,#e8c66a); margin-bottom:6px; }
  .pf-broke .bd { font-size:12.5px; line-height:1.9; color:#a89f8c; letter-spacing:1px; }

  /* —— 档案条 —— */
  .pf-card { border:1px solid rgba(232,198,106,.2); background:rgba(20,17,15,.72); border-radius:3px;
             padding:22px 24px; margin-bottom:18px; }
  .pf-card-h { font-size:13px; letter-spacing:6px; color:var(--gold-dim,#b8893b); margin:0 0 16px;
               padding-bottom:10px; border-bottom:1px solid rgba(232,198,106,.16); }
  .pf-name-row { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .pf-name { font-size:26px; letter-spacing:5px; color:#ece6d8; cursor:pointer; }
  .pf-name:hover { color:var(--gold,#e8c66a); }
  .pf-name.empty { color:#6f6857; font-size:20px; }
  .pf-tag { font-size:12px; letter-spacing:2px; color:#9c9382; border:1px solid rgba(232,198,106,.22);
            padding:4px 10px; border-radius:2px; background:rgba(0,0,0,.25); }
  .pf-mini { font-size:12px; letter-spacing:2px; color:#b8893b; cursor:pointer; padding:4px 9px;
             border:1px solid rgba(232,198,106,.22); border-radius:2px; background:rgba(0,0,0,.25); transition:all .16s; }
  .pf-mini:hover { color:var(--gold,#e8c66a); border-color:var(--gold,#e8c66a); }
  .pf-since { font-size:12px; letter-spacing:2px; color:#7d7666; margin-left:auto; }

  /* —— 境界 —— */
  .pf-realm { display:flex; align-items:flex-end; gap:18px; flex-wrap:wrap; }
  .pf-realm-now { font-size:40px; letter-spacing:8px; color:var(--gold,#e8c66a); line-height:1.1; display:flex; align-items:center; gap:16px; }
  .pf-realm-grp { font-size:13px; letter-spacing:3px; color:#9c9382; padding-bottom:8px; }
  .pf-realm-d { font-size:13px; line-height:2; color:#a89f8c; margin:14px 0 0; letter-spacing:1px; }
  /* —— 境界图标（柔和金色线描） —— */
  .realm-ic { width:100%; height:100%; display:block; }
  .pf-realm-ic { width:58px; height:58px; flex:0 0 auto; filter:drop-shadow(0 0 6px rgba(232,198,106,.25)); display:flex; align-items:center; justify-content:center; }
  .pf-realm-ic svg, .pf-realm-ic .ric { width:100%; height:100%; display:block; }
  .pf-step { display:inline-flex; align-items:center; gap:5px; }
  .pf-step .ric { width:18px; height:18px; flex:0 0 auto; opacity:.85; }
  .badge-realm { display:inline-flex; align-items:center; gap:4px; }
  .badge-realm .ric { width:15px; height:15px; flex:0 0 auto; }
  .cr .ric { width:14px; height:14px; flex:0 0 auto; vertical-align:middle; margin-right:3px; opacity:.9; }
  .pf-bar { height:6px; background:rgba(255,255,255,.07); border-radius:3px; overflow:hidden; margin:16px 0 8px; }
  .pf-bar-i { height:100%; background:linear-gradient(90deg, var(--gold-dim,#b8893b), var(--gold,#e8c66a)); border-radius:3px; }
  .pf-bar-x { font-size:12px; letter-spacing:2px; color:#8b8371; }
  .pf-sec-t { font-size:12px; letter-spacing:4px; color:var(--gold-dim,#b8893b); margin:22px 0 12px; }
  .pf-stair { display:flex; flex-wrap:wrap; gap:6px; }
  .pf-step { font-size:12px; letter-spacing:1px; padding:5px 9px; border-radius:2px; border:1px solid rgba(255,255,255,.09);
             color:#6f6857; background:rgba(255,255,255,.02); }
  .pf-step.done { color:#a89f8c; border-color:rgba(232,198,106,.2); background:rgba(232,198,106,.05); }
  .pf-step.cur  { color:var(--gold,#e8c66a); border-color:var(--gold,#e8c66a); background:rgba(232,198,106,.12); font-weight:600; }
  .pf-step.lost { color:#5c5749; border-style:dashed; }
  .pf-gain { display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; }
  .pf-g { font-size:12px; letter-spacing:1px; padding:5px 11px; border-radius:2px;
          border:1px solid rgba(232,198,106,.3); color:var(--gold,#e8c66a); background:rgba(232,198,106,.08); }
  .pf-g em { font-style:normal; color:#8b8371; margin-left:5px; font-size:11px; }
  .pf-none { font-size:12.5px; color:#6f6857; letter-spacing:1px; }

  /* —— 统计 —— */
  .pf-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:10px; }
  .pf-stat { border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.025); border-radius:2px; padding:12px 14px; text-align:center; }
  .pf-stat .v { font-size:22px; color:var(--gold,#e8c66a); letter-spacing:1px; }
  .pf-stat .k { font-size:11.5px; color:#8b8371; letter-spacing:2px; margin-top:5px; }
  .pf-tbl { width:100%; border-collapse:collapse; font-size:13px; }
  .pf-tbl th { font-size:11.5px; letter-spacing:2px; color:#8b8371; font-weight:400; text-align:right;
               padding:7px 10px; border-bottom:1px solid rgba(232,198,106,.16); }
  .pf-tbl th:first-child, .pf-tbl td:first-child { text-align:left; }
  .pf-tbl td { padding:8px 10px; text-align:right; color:#bdb49f; border-bottom:1px solid rgba(255,255,255,.05); }
  .pf-tbl tr:hover td { background:rgba(232,198,106,.05); }
  .pf-tbl .nm { color:#ddd2ba; letter-spacing:1px; }
  .pf-bar2 { display:inline-block; height:5px; border-radius:2px; background:var(--gold-dim,#b8893b); vertical-align:middle; margin-left:8px; }
  .pf-2col { display:grid; grid-template-columns:1fr 1fr; gap:22px; }
  @media (max-width:820px){ .pf-2col { grid-template-columns:1fr; } }

  /* —— 见闻 —— */
  .pf-see { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:10px; }
  .pf-si { border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.025); border-radius:2px; padding:13px 15px; }
  .pf-si .t { font-size:13.5px; letter-spacing:3px; color:#ddd2ba; }
  .pf-si .n { float:right; font-size:13px; color:var(--gold,#e8c66a); letter-spacing:1px; }
  .pf-si .b { margin-top:9px; height:5px; background:rgba(255,255,255,.07); border-radius:3px; overflow:hidden; }
  .pf-si .b i { display:block; height:100%; background:linear-gradient(90deg,var(--gold-dim,#b8893b),var(--gold,#e8c66a)); }

  /* —— 行迹 —— */
  .pf-log { max-height:420px; overflow-y:auto; }
  .pf-log::-webkit-scrollbar { width:6px; }
  .pf-log::-webkit-scrollbar-thumb { background:rgba(232,198,106,.25); border-radius:3px; }
  .pf-li { display:flex; gap:12px; padding:9px 6px; border-bottom:1px solid rgba(255,255,255,.05); font-size:13px; align-items:baseline; }
  .pf-li .dt { color:#7d7666; font-size:11.5px; letter-spacing:1px; min-width:52px; }
  .pf-li .mm { color:var(--gold-dim,#b8893b); font-size:11.5px; letter-spacing:1px; min-width:32px; }
  .pf-li .ss { color:#bdb49f; letter-spacing:.6px; line-height:1.7; flex:1; }
  .pf-li .xx { color:var(--gold,#e8c66a); font-size:12px; min-width:42px; text-align:right; }
  .pf-li.brk .ss { color:var(--gold,#e8c66a); }

  /* —— 择道 —— */
  .pf-pick { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:14px; margin-top:4px; }
  .pf-p { border:1px solid rgba(232,198,106,.22); background:rgba(20,17,15,.6); border-radius:3px;
          padding:22px 20px; cursor:pointer; transition:all .18s; }
  .pf-p:hover { border-color:var(--gold,#e8c66a); background:rgba(232,198,106,.07); transform:translateY(-2px); }
  .pf-p .pn { font-size:20px; letter-spacing:6px; color:var(--gold,#e8c66a); margin-bottom:6px; }
  .pf-p .ps { font-size:11.5px; letter-spacing:2px; color:#8b8371; margin-bottom:12px; }
  .pf-p .pd { font-size:12.5px; line-height:2; color:#a89f8c; letter-spacing:.8px; }
  .pf-p .pk { margin-top:14px; font-size:11.5px; color:#7d7666; letter-spacing:1px; line-height:1.9; }
  `;
  const s = document.createElement('style');
  s.id = 'profile-style';
  s.textContent = css;
  document.head.appendChild(s);
})();

function pfGainText(g){
  const map = { range:'出手范围 +', hand:'手牌上限 +', judge:'道理判定 +', draw:'每回合多摸 +',
                atk:'剑气伤害 +', atkLimit:'每回合多出剑 +' };
  return g.n + '　' + (map[g.k] || (g.k + ' +')) + g.v;
}

function renderProfile(app){
  pfLoad();
  const broke = PF_broke; PF_broke = null;

  /* —— 尚未择道 —— */
  if(!PF.path){
    app.innerHTML = '<div class="pf">'
      + '<div class="pf-top"><div><h1 class="pf-h">行 迹 录</h1></div>'
      +   '<div class="pf-back" onclick="openProfileBack()">返回</div></div>'
      + '<p class="pf-sub">先择一条道，此后的每一步才算得数</p>'
      + '<div class="pf-card"><div class="pf-card-h">择 道</div><div class="pf-pick">'
      + PF_PATHS.map(function(p){
          const g = p.gains.map(function(x){ return '<div>' + pfEsc(pfGainText(x)) + '</div>'; }).join('');
          return '<div class="pf-p" onclick="pfPick(\''+p.key+'\')">'
               +   '<div class="pn">'+p.name+'</div><div class="ps">'+pfEsc(p.sub)+'</div>'
               +   '<div class="pd">'+pfEsc(p.desc.replace(/\s+/g,''))+'</div>'
               +   '<div class="pk">沿途所得：'+g+'</div>'
               + '</div>';
        }).join('')
      + '</div></div></div>';
    return;
  }

  const P   = pfPath(PF.path) || PF_PATHS[0];
  const rs  = pfRealms();
  const lv  = pfLevel();
  const now = rs[lv];
  const nx  = pfNext();
  const prg = pfProgress();
  const gains = pfGains(lv);
  const b = PF.batt;
  const wr = b.total ? Math.round(b.win/b.total*100) : 0;

  /* —— 已解锁分支已经锁定收益名单 —— */
  const stairHtml = rs.map(function(r, i){
    const cls = i===lv ? 'cur' : (i<lv ? 'done' : (r.lost?'lost':''));
    return '<span class="pf-step '+cls+'" title="'+pfEsc(r.d)+'">'+(typeof realmIconSVG==='function'?realmIconSVG(r.n):'')+pfEsc(r.n.replace(/\s/g,''))+'</span>';
  }).join('');

  const gainsHtml = gains.length
    ? gains.map(function(g){
        return '<span class="pf-g">'+pfEsc(pfGainText(g))+'<em>'+pfEsc(g.q)+'</em></span>';
      }).join('')
    : '<div class="pf-none">尚未有一项境界收益落定——再走几步。</div>';

  /* —— 分模式 —— */
  const MODE_NM = { hot:'群雄论剑', ai:'仗剑独行', siege:'剑气长城', boss:'天下共伐' };
  const modeHtml = Object.keys(MODE_NM).map(function(k){
    const m = PF.byMode[k];
    if(!m || !(m.w+m.l)) return '';
    const tot = m.w+m.l, pct = Math.round(m.w/tot*100);
    return '<tr><td class="nm">'+MODE_NM[k]+'</td><td>'+tot+'</td><td>'+m.w+'</td><td>'+m.l+'</td>'
         + '<td>'+pct+'%<span class="pf-bar2" style="width:'+Math.max(4,Math.round(pct*0.5))+'px"></span></td></tr>';
  }).join('') || '<tr><td class="nm" colspan="5" style="color:#6f6857">未曾下场</td></tr>';

  /* —— 分难度：PF.byDiff 一直在记账，此前界面从不展示 —— */
  const DIFF_NM = { easy:'简 单', normal:'普 通', hard:'困 难' };
  const diffHtml = Object.keys(DIFF_NM).map(function(k){
    const m = PF.byDiff[k];
    if(!m || !(m.w+m.l)) return '';
    const tot = m.w+m.l, pct = Math.round(m.w/tot*100);
    return '<tr><td class="nm">'+DIFF_NM[k]+'</td><td>'+tot+'</td><td>'+m.w+'</td><td>'+m.l+'</td>'
         + '<td>'+pct+'%<span class="pf-bar2" style="width:'+Math.max(4,Math.round(pct*0.5))+'px"></span></td></tr>';
  }).join('') || '<tr><td class="nm" colspan="5" style="color:#6f6857">未曾按难度分账</td></tr>';

  /* —— 分角色 Top —— */
  const chars = Object.keys(PF.byChar).map(function(k){
      const c = PF.byChar[k];
      let nm = k;
      try{ if(typeof CHARS!=='undefined' && CHARS[k]) nm = CHARS[k].name; }catch(e){}
      return { k:k, nm:nm, p:c.p|0, w:c.w|0, l:c.l|0, rate: c.p ? Math.round(c.w/c.p*100) : 0 };
    }).sort(function(x,y){ return (y.p-x.p) || (y.rate-x.rate); }).slice(0,6);
  const charHtml = chars.length ? chars.map(function(c){
      return '<tr><td class="nm">'+pfEsc(c.nm)+'</td><td>'+c.p+'</td><td>'+c.w+'</td><td>'+c.l+'</td>'
           + '<td>'+c.rate+'%<span class="pf-bar2" style="width:'+Math.max(4,Math.round(c.rate*0.5))+'px"></span></td></tr>';
    }).join('') : '<tr><td class="nm" colspan="5" style="color:#6f6857">未曾有人替你出战</td></tr>';

  /* —— 见闻 —— */
  function countEnding(modObj){ try{ return Object.keys(modObj||{}).length; }catch(e){ return 0; } }
  let TOT = { al:0, sect:0, sc:0, ch:0 };
  try{ if(typeof AL_ENDINGS!=='undefined')  TOT.al   = Object.keys(AL_ENDINGS).length; }catch(e){}
  try{ if(typeof SECT_ENDINGS!=='undefined')TOT.sect = Object.keys(SECT_ENDINGS).length; }catch(e){}
  try{ if(typeof SC_ENDINGS!=='undefined')  TOT.sc   = Object.keys(SC_ENDINGS).length; }catch(e){}
  try{ if(typeof CHARS!=='undefined')       TOT.ch   = Object.keys(CHARS).length; }catch(e){}
  let bfOwn = 0;
  try{ if(typeof BF!=='undefined' && BF && Array.isArray(BF.owned)) bfOwn = BF.owned.length; }catch(e){}
  let wspTotal = 0;
  try{ if(typeof WSP!=='undefined' && Array.isArray(WSP)) wspTotal = WSP.length; }catch(e){}

  const SEES = [
    { t:'书简湖', n:countEnding(PF.seen.asklake), tot:TOT.al,
      x: PF.seen.asklake ? countEnding(PF.seen.asklake)+' ／ '+TOT.al : '未入湖' },
    { t:'落魄山', n:countEnding(PF.seen.sect),    tot:TOT.sect,
      x: PF.seen.sect    ? countEnding(PF.seen.sect)+' ／ '+TOT.sect : '未立山' },
    { t:'山水祠', n:countEnding(PF.seen.shenci),  tot:TOT.sc,
      x: PF.seen.shenci  ? countEnding(PF.seen.shenci)+' ／ '+TOT.sc : '未受香火' },
    { t:'包袱斋', n:bfOwn, tot:0, x: bfOwn+' 件随身' },
    { t:'人物志', n:countEnding(PF.read.codex), tot:TOT.ch,
      x: countEnding(PF.read.codex)+' ／ '+TOT.ch },
    { t:'无事牌', n:PF.read.wsp|0, tot:wspTotal, x: (PF.read.wsp|0)+' 面' }
  ];
  const seeHtml = SEES.map(function(s){
    const pct = (s.tot>0) ? Math.min(100, Math.round(s.n/s.tot*100)) : 0;
    return '<div class="pf-si"><span class="n">'+s.x+'</span><div class="t">'+s.t+'</div>'
         + '<div class="b"><i style="width:'+pct+'%"></i></div></div>';
  }).join('');

  /* —— 行迹流水 —— */
  const logHtml = PF.log.length
    ? PF.log.map(function(l){
        const xp = l.x ? ('+'+l.x) : '';
        return '<div class="pf-li'+((l.t==='破境')?' brk':'')+'"><span class="dt">'+pfEsc(l.t)+'</span>'
             + '<span class="mm">'+pfEsc(l.m||'')+'</span>'
             + '<span class="ss">'+pfEsc(l.s)+'</span>'
             + '<span class="xx">'+xp+'</span></div>';
      }).join('')
    : '<div class="pf-none">行迹还是空的。去下一盘，或翻一卷。</div>';

  app.innerHTML = '<div class="pf">'

    + '<div class="pf-top"><div><h1 class="pf-h">行 迹 录</h1></div>'
    +   '<div class="pf-back" onclick="openProfileBack()">返回</div></div>'
    + '<p class="pf-sub">'+pfEsc(pfGreet())+'</p>'

    + (broke ? ('<div class="pf-broke"><div class="bk">破 境 · '+pfEsc(broke.to.n.replace(/\s/g,''))+'</div>'
              + '<div class="bd">'+pfEsc(broke.from ? broke.from.n.replace(/\s/g,'') : '')+' → '+pfEsc(broke.to.n.replace(/\s/g,''))
              + (broke.gains.length ? ('　|　新得：'+broke.gains.map(function(g){return g.n;}).join('、')) : '')
              + '<br>'+pfEsc(broke.to.d || '')+'</div></div>') : '')

    /* 档案 */
    + '<div class="pf-card"><div class="pf-card-h">档 案</div>'
    +   '<div class="pf-name-row">'
    +     '<span class="pf-name'+(PF.name?'':' empty')+'" onclick="pfEditName()" title="点击改名号">'
    +       (PF.name ? pfEsc(PF.name) : '未 留 名 号')+'</span>'
    +     '<span class="pf-tag">'+pfEsc(P.name.replace(/\s/g,''))+'</span>'
    +     '<span class="pf-mini" onclick="pfEditName()">改名号</span>'
    +     '<span class="pf-mini" onclick="pfRollName()">随 缘</span>'
    +     '<span class="pf-since">自 '+pfEsc(PF.since||'')+' 入江湖　·　累计道行 <b style="color:#e8c66a">'+PF.xp+'</b></span>'
    +   '</div>'
    + '</div>'

    /* 境界 */
    + '<div class="pf-card"><div class="pf-card-h">境 界</div>'
    +   '<div class="pf-realm">'
    +     '<div class="pf-realm-now"><span class="pf-realm-ic">'+(typeof realmIconSVG==='function'?realmIconSVG(now.n):'')+'</span><span>'+pfEsc(now.n)+'</span></div>'
    +     '<div class="pf-realm-grp">'+pfEsc(now.grp)+'　第 '+(lv+1)+' 阶</div>'
    +   '</div>'
    +   '<div class="pf-bar"><div class="pf-bar-i" style="width:'+prg+'%"></div></div>'
    +   '<div class="pf-bar-x">'+(nx ? ('下一境界「'+pfEsc(nx.realm.n.replace(/\s/g,''))+'」　尚需道行 '+nx.far+'　（'+prg+'%）')
                                     : '已至顶端——此境之下不复有境界可言')+'</div>'
    +   '<p class="pf-realm-d">'+pfEsc(now.d)+'</p>'
    +   '<div class="pf-sec-t">境 界 楼 梯</div><div class="pf-stair">'+stairHtml+'</div>'
    +   '<div class="pf-sec-t">已 得 精 进</div><div class="pf-gain">'+gainsHtml+'</div>'
    + '</div>'

    /* 战绩 */
    + '<div class="pf-card"><div class="pf-card-h">战 绩</div>'
    +   '<div class="pf-grid">'
    +     '<div class="pf-stat"><div class="v">'+b.total+'</div><div class="k">总 局</div></div>'
    +     '<div class="pf-stat"><div class="v">'+b.win+'</div><div class="k">胜</div></div>'
    +     '<div class="pf-stat"><div class="v">'+b.lose+'</div><div class="k">负</div></div>'
    +     '<div class="pf-stat"><div class="v">'+wr+'%</div><div class="k">胜 率</div></div>'
    +     '<div class="pf-stat"><div class="v">'+b.streak+'</div><div class="k">当前连胜</div></div>'
    +     '<div class="pf-stat"><div class="v">'+b.best+'</div><div class="k">最高连胜</div></div>'
    +   '</div>'
    +   '<div class="pf-2col">'
    +     '<div><div class="pf-sec-t">分 模 式</div><table class="pf-tbl">'
    +       '<tr><th>模式</th><th>局</th><th>胜</th><th>负</th><th>胜率</th></tr>'+modeHtml+'</table>'
    +       '<div class="pf-sec-t">分 难 度</div><table class="pf-tbl">'
    +       '<tr><th>难度</th><th>局</th><th>胜</th><th>负</th><th>胜率</th></tr>'+diffHtml+'</table></div>'
    +     '<div><div class="pf-sec-t">常 用 角 色</div><table class="pf-tbl">'
    +       '<tr><th>角色</th><th>出场</th><th>胜</th><th>负</th><th>胜率</th></tr>'+charHtml+'</table></div>'
    +   '</div>'
    + '</div>'

    /* 见闻 */
    + '<div class="pf-card"><div class="pf-card-h">见 闻</div><div class="pf-see">'+seeHtml+'</div></div>'

    /* 行迹 */
    + '<div class="pf-card"><div class="pf-card-h">行 迹</div><div class="pf-log">'+logHtml+'</div></div>'

    + '</div>';
}

function pfPick(key){
  try{ SFX.click(); }catch(e){}
  pfSetPath(key);
  render();
}
function pfEditName(){
  pfLoad();
  let nm = '';
  try{ nm = window.prompt('取个道号（留空则不留名）', PF.name || '') || ''; }catch(e){ return; }
  pfSetName(nm);
  render();
}
function pfRollName(){
  pfLoad();
  pfSetName(pfRandomName());
  try{ SFX.click(); }catch(e){}
  render();
}
function openProfileBack(){
  try{ SFX.click(); }catch(e){}
  state = { phase:'title', mode:'title', sel:[], filter:'全部', q:'', log:[] };
  render();
}
