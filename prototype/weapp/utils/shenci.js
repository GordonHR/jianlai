/* ==========================================================================
 * 山水祠 · 一方水土   （shenci.js）
 * 自包含模块：原著依据 / CSS / FX / 配置 / 状态 / 旬循环 / 祈愿 / 越界 / 天劫 / 结局 / 渲染
 * 由 game.js 的 render() 依 state.phase==='shenci' 分派到 renderShenci(app)
 *
 * ── 原著依据（2026-08-31 查证，来源：快懂百科「剑来」「魏檗」词条 + 有声书原文）
 *  · 神道品秩：北岳正神 / 山君 > 山神（辖百里）> 土地公；河伯辖一条河水；
 *    城隍需朝廷敕封、着礼部特制官服，行走阴间约束鬼魅。
 *  · 香火即经济：「大香客更换了烧香的门庭，从山神庙去了水神祠，
 *    那可关系着每年小十万两白银。」（有声书 1154 集）
 *  · 神位可废：魏檗因庇护旧国遗民触怒大骊皇帝，神位被废，金身被打碎沉江，
 *    自北岳正神贬为棋墩山土地公。（快懂百科「魏檗」）
 *  · 铁律：「世间狐精不可成为山神是铁律。」（有声书 544 集）
 *  · 冲境代价：山水神祇若想冲击仙人境，需渡过凶险异常的神道天劫，
 *    且极易脱离山水根基、失去神职依托。
 *  · 越界：山神涉水、水神上山会引发邻神冲突，惊动城隍则被斥责。
 *  · 陈平安后期遍访浩然天下山水神灵，以全部功德换取众神点燃心香，
 *    共同祈福修复桐叶洲。（快懂百科「剑来」）
 *
 * ── 与落魄山的界线（勿混）
 *    落魄山经营的是「人」：弟子、飞剑、银钱。
 *    山水祠经营的是「信」：香火、气数、阴德、威灵。
 *    且本作主角是神不是人 —— 只能「应」或「不应」，不能直接下场。
 * ========================================================================== */

'use strict';
/* 山水祠 · 小程序端 no-DOM 移植（源自 prototype/shenci.js 逻辑核心）
   移植约定：删去 CSS 注入与 FX 演出层，render() 改为 emitView() 推送纯数据快照。 */
const WX = (typeof wx !== 'undefined') ? wx : null;
function lsGet(k, d){ try{ const v = WX ? WX.getStorageSync(k) : (global.__ls && global.__ls[k]); return v==null ? d : v; }catch(e){ return d; } }
function lsSet(k, v){ try{ if(WX) WX.setStorageSync(k, v); else { global.__ls = global.__ls||{}; global.__ls[k]=v; } }catch(e){} }
/* 小程序端无 WebAudio：用轻量震动做"有声"反馈 */
function vb(t){ if(WX && WX.vibrateShort){ try{ WX.vibrateShort({ type:(t||'light') }); }catch(e){} } }
const SFX = { set(){}, click(){ vb('light'); }, play(){ vb('medium'); }, ok(){ vb('medium'); }, bad(){ vb('heavy'); } };

/* ===================== 演出层（横幅/飘字，经 setData 推送，独立于主视图重绘） ===================== */
let FXB = [];            // 当前展示的横幅（一次一个，队列）
let FXF = [];            // 飘字（资源增减等，可多个并存）
let FXID = 0;
let scBannerQueue = [];
let scBannerBusy = false;
function scFXInit(){}
function scFXClear(){ FXB = []; FXF = []; scBannerQueue = []; scBannerBusy = false; emitView(); }
function scBannerShow(){
  if(!scBannerQueue.length){ scBannerBusy = false; FXB = []; emitView(); return; }
  scBannerBusy = true;
  const b = scBannerQueue.shift();
  FXB = [{ title:b.title, sub:b.sub||'', cls:b.cls||'' }];
  emitView();
  setTimeout(function(){ scBannerShow(); }, 1900);
}
function scBanner(title, sub, cls){
  scBannerQueue.push({ title:title, sub:sub||'', cls:cls||'' });
  if(!scBannerBusy) scBannerShow();
}
/* 资源飘字配色：用内联 color，不用中文类名（小程序 WXSS 不认中文选择器） */
const SC_FLOAT_COLOR = { 香火:'#e8b45f', 气数:'#8fc49b', 阴德:'#c3cec8', 威灵:'#9fb8d0', 香客:'#e8cf8f', 神职:'#b4453c' };
/* 飘字落位：左右交替成斜阶，逐枚下沉一行（单位 rpx）。
   任意两枚之间，要么横向拉开 ≥232rpx，要么纵向拉开 ≥76rpx，绝不叠成一坨。 */
function scFloatSlot(i){
  const n = (i==null ? 0 : i);
  const side = (n % 2 === 0) ? -1 : 1;          // 左右交替
  const row  = Math.floor(n / 2);                // 每两枚下沉一行
  const jx = Math.round(Math.random()*16 - 8);
  const jy = Math.round(Math.random()*16 - 8);
  return {
    dx: side * (116 + row * 36) + jx,
    dy: -108 + Math.min(n, 7) * 76 + jy,
  };
}
function scFloat(text, cls, color, i){
  const id = ++FXID;
  const p = scFloatSlot(i);
  FXF.push({ id:id, text:text, cls:cls||'neutral', color:color||'', dx:p.dx, dy:p.dy });
  emitView();
  setTimeout(function(){ FXF = FXF.filter(function(f){ return f.id!==id; }); emitView(); }, 1500);
}
/* 资源增减飘字：把 fxQueue 变成可见飘字（带错峰，避免一坨同时浮起） */
function scFlushFx(s){
  if(!s || !s.fxQueue || !s.fxQueue.length) return;
  const q = s.fxQueue; s.fxQueue = [];
  q.forEach(function(f, i){
    setTimeout(function(){ scFloat((f.v>0?'+':'')+f.v+' '+f.k, '', SC_FLOAT_COLOR[f.k] || '', i); }, i*170);
  });
}
let state = null;
let difficulty = 'normal';
let HOOK = null;
function emitView(){ if(HOOK) try{ HOOK(view()); }catch(e){ console.error(e); } }
function setHook(fn){ HOOK = fn; if(state) emitView(); }
function render(){ emitView(); }
function toggleCiwu(){ const s = state && state.shenci; if(!s || s.over) return; s.ciwu = !s.ciwu; SFX.click(); render(); }

/* ===================== 配置 ===================== */
const SC_DIFF = {
  easy:   { key:'easy',   name:'简 单', 香火:46, 气数:52, 阴德:6,  威灵:16, 香客:13, tithe:1.25 },
  normal: { key:'normal', name:'普 通', 香火:32, 气数:42, 阴德:0,  威灵:10, 香客:10, tithe:1.00 },
  hard:   { key:'hard',   name:'困 难', 香火:22, 气数:34, 阴德:-6, 威灵:6,  香客:8,  tithe:0.80 },
};

/* 神道品秩（原著：北岳正神 / 山君 > 山神(辖百里) > 土地公；河伯辖一河） */
const SC_RANKS = {
  shan: [
    { name:'土地公', desc:'辖一山一隅，位卑言轻' },
    { name:'山神',   desc:'辖百里地界' },
    { name:'山君',   desc:'一山之主，可辖三十余山头' },
    { name:'北岳正神', desc:'执掌千里地界，护水土扛文运' },
  ],
  shui: [
    { name:'土地公', desc:'辖一水一隅，位卑言轻' },
    { name:'河伯',   desc:'辖一条两百里河水' },
    { name:'水君',   desc:'一水之主，江湖河渠皆在其手' },
    { name:'江河正神', desc:'执掌千里水域，享万民香火' },
  ],
};
const SC_RANK_MAX = 3;

/* 冲境（神道天劫）门槛：香火 + 阴德 */
const SC_ASCEND_NEED = [
  { 香火:0,   阴德:0,  气数:0  },
  { 香火:110, 阴德:6,  气数:42 },   // 土地 → 山神/河伯
  { 香火:220, 阴德:16, 气数:46 },   // 山神 → 山君/水君
  { 香火:270, 阴德:30, 气数:48 },   // 山君 → 正神
];

/* 印章图形：小程序 <image> 加载 svg 时 currentColor 不继承，故颜色内嵌于 svg 文件 */
const SC_SEAL_IMG = { shan:'/assets/icon/seal-shan.svg', shui:'/assets/icon/seal-shui.svg' };

/* 辖地类型 */
const SC_DOMAIN = {
  shan: { key:'shan', seal:'山', name:'棋墩山土地', 神名:'山神', 邻名:'埋河水神',
    desc:'辖棋墩山一带百里山地。山民、猎户、采药人是你的香客；\n山下的溪涧与山中的精魅，皆在你的眼皮底下。',
    origin:'棋墩山——前北岳正神魏檗被贬为土地公时，曾在此坐镇。他因庇护旧国遗民触怒大骊，金身碎、沉江底，才换来这一方土地的安稳。你今日坐的，正是他踩过的那方土。' },
  shui: { key:'shui', seal:'水', name:'埋河水神', 神名:'河伯', 邻名:'棋墩山山神',
    desc:'辖埋河一条两百里河水。船家、渔户、行商是你的香客；\n水底的精怪与两岸的田地，皆系于你一念之间。',
    origin:'埋河——陈平安出藕花福地后，于此结识埋河水神，亲授其「顺序之学」。水有章法，河知进退，皆是那人留下的规矩。你承这河伯之位，便接下了这份秩序。' },
};

const SC_XK_MAX = 30;             // 香客上限（一方水土的规模感，不滚雪球）

/* 香客上限随「脱根」下压 —— 原著：冲境极易脱离山水根基、失去神职依托。
   位阶越高，辖内对你的感应越弱：爬得上去，未必守得住。脱根3 时上限仅 12，
   而正神需「香客 >= 初始」，窗口极窄 —— 这便是「脚下的土薄了一寸」。 */
function scXkCap(s){ return Math.max(6, SC_XK_MAX - s.脱根*4); }

/* 旬制 */
const SC_TOTAL_XUN = 48;          // 四十八旬
const SC_SEASONS = ['春','夏','秋','冬'];
function scSeason(s){ return SC_SEASONS[(Math.floor((s.xun-1)/3))%4]; }
function scYearOf(s){ return Math.floor((s.xun-1)/12)+1; }

/* ===================== 状态 ===================== */
function newScState(domKey, diffKey){
  const d = SC_DIFF[diffKey] || SC_DIFF.normal;
  return {
    dom: domKey || 'shan',
    diff: diffKey || 'normal',
    xun: 1, ap: 3,
    res: { 香火:d.香火, 气数:d.气数, 阴德:d.阴德, 威灵:d.威灵 },
    香客: d.香客,          // 香客户数
    信心: 55,              // 百姓信不信你
    rank: 0,               // 神道品秩 0-3
    脱根: 0,               // 冲境次数 = 脱离山水根基的程度（原著：冲境易失根基）
    越界: 0,               // 越界干预累积
    rel: { 邻神:0, 城隍:0, 百姓:0 },
    tithe: d.tithe,
    events: [],
    backlog: 0,
    flags: {},
    nodeFired: {},
    over: false, ending: null,
    ui: 'main',
    ciwu: false,           // 祠务抽屉默认收起
    log: [],
    fxQueue: [],
    trail: [],
    noAnswerStreak: 0,     // 连续「不应」次数
    qiZeroStreak: 0,       // 气数见底的旬数（连续 3 旬则神位不保）
    prologue: null,
    pick: null,            // 'pick' 时显示开场择地
    settling: false,       // 本旬已结算、待确认进入下一旬（中转页）
    turnStart: null,       // 本回合开始基线（抉择尚未落地），账本「所奏」的对照点
    lastSettle: null,      // 中转页账目快照 { year,xun,season,isLast,ledger,notes,backlogLeft }
  };
}

/* ===================== 工具 ===================== */
function scClamp(s){
  const r = s.res;
  r.香火 = Math.max(0, Math.min(999, r.香火));
  r.气数 = Math.max(0, Math.min(100, r.气数));
  r.阴德 = Math.max(-100, Math.min(100, r.阴德));
  r.威灵 = Math.max(0, Math.min(100, r.威灵));
  s.香客 = Math.max(0, Math.min(scXkCap(s), s.香客));
  s.信心 = Math.max(0, Math.min(100, s.信心));
}
function scGain(s, k, v){ s.res[k] = (s.res[k]||0) + v; scClamp(s); }
/* 资源快照（六维：四资源 + 香客 + 信心），用于账本基线对照 */
function scSnap(s){ return { 香火:s.res.香火, 气数:s.res.气数, 阴德:s.res.阴德, 威灵:s.res.威灵, 香客:s.香客, 信心:s.信心 }; }
/* 账本一行：净 = 所奏（本旬抉择的因果）+ 自然（山水供养：收入/气数回润/脱根流失…） */
function scLedRow(kLed, kRes, ts, before, after){
  const evt = before[kRes] - ts[kRes];     // 所奏：玩家抉择造成的变动
  const nat = after[kRes]  - before[kRes]; // 自然：结算阶段被动经营（不含抉择）
  const net = after[kRes]  - ts[kRes];      // 净账
  return { k:kLed, evt, nat, net };
}
function scLog(s, t, cls){ s.log.unshift({ t, cls:cls||'' }); if(s.log.length>60) s.log.pop(); }
function scTrail(s, t, c){ s.trail.push({ t, c }); }
function scRankName(s){ return SC_RANKS[s.dom][s.rank].name; }
function scRankNextName(s){ return s.rank>=SC_RANK_MAX ? '' : SC_RANKS[s.dom][s.rank+1].name; }

/* 每旬香火收入：香客 × 系数 × 气数加成，冲境脱根则递减。
   水域（河伯）辖地人流、商旅更密， baseline 香火略丰 —— 但水线事件的香火消耗也重，整体仍是更难经营的一脉。 */
function scIncome(s){
  const domMul = (s.dom==='shui') ? 1.12 : 1.0;
  const base = s.香客 * s.tithe * domMul * (0.45 + s.res.气数/180);
  const root = Math.max(0, 1 - s.脱根*0.15);
  return Math.max(0, Math.round(base * root));
}

/* 神威：用于越界冲突与精怪弹压判定 */
function scPower(s){
  return Math.round(s.res.威灵*0.7 + s.res.香火*0.05 + s.rank*9 + s.res.气数*0.2);
}

function scEventDef(id){
  return SC_EVENTS.filter(e=>e.id===id)[0];
}

/* 选项门控（锁定原因属约束提示，可显示；不剧透「选了会怎样」） */
function scOptReqOk(s, opt){
  if(opt.ban) return { ok:false, why:opt.ban };   // 原著铁律：硬性不可为
  const r = opt.req; if(!r) return { ok:true };
  if(r.香火!=null && s.res.香火 < r.香火) return { ok:false, why:'需香火≥'+r.香火 };
  if(r.气数!=null && s.res.气数 < r.气数) return { ok:false, why:'需气数≥'+r.气数 };
  if(r.阴德!=null && s.res.阴德 < r.阴德) return { ok:false, why:'需阴德≥'+r.阴德 };
  if(r.威灵!=null && s.res.威灵 < r.威灵) return { ok:false, why:'需威灵≥'+r.威灵 };
  if(r.香客!=null && s.香客 < r.香客)     return { ok:false, why:'需香客≥'+r.香客 };
  if(r.rank!=null && s.rank < r.rank)     return { ok:false, why:'需神职·'+SC_RANKS[s.dom][r.rank].name };
  if(r.flag && !s.flags[r.flag])          return { ok:false, why:'需先结下此段因缘' };
  if(r.noFlag && s.flags[r.noFlag])       return { ok:false, why:'此事已了' };
  return { ok:true };
}

/* 效果结算：数值变动入 fxQueue（提交后才飘字揭示），不事前剧透 */
const SC_RES_KEYS = ['香火','气数','阴德','威灵'];

/* 选项左前小图标。小程序 WXML 无法解析 SVG HTML 字符串，
   故把 SVG 抽到独立文件，用 <image src="/assets/icon/xxx.svg"/> 引用。 */
/* 有配图的事件 id 集合（与 prototype/assets/shenci/、weapp/assets/shenci/ 下的文件一一对应）
   不在集合内的事件赋空串 img：wxml `wx:if="{{item.img}}"` 判空为 false → 不渲染 <image>，
   避免加载不存在的 jpg 导致开发者工具显示灰色占位、真机直接隐藏的两端不一致。 */
const SC_IMG_IDS = new Set([
  'shan_qiuyu','shan_hujing','shan_menghu','shan_zhuoya','shan_kaikuang',
  'shan_gankao','shan_tongnv','shan_kujing','shan_shanxiao','shan_laoyu',
  'shan_zhengshui','shan_xinmiao','shan_leipi','shan_shanhong',
  'shui_fengping','shui_qiuyu','shui_luoshui','shui_shuigui','shui_quqin',
  'shui_liangan','shui_duanliu','shui_hongshui','shui_qiaota','shui_chenchuan',
  'shui_jingguai','shui_touhe','shui_zhengchuan','shui_shixiu'
]);
function scWishImg(id){ return SC_IMG_IDS.has(id) ? '/assets/shenci/'+id+'.jpg' : ''; }

const SC_EV_ICON = { '危机':'/assets/icon/opt-sword.svg', '册目':'/assets/icon/opt-book.svg', '祈愿':'/assets/icon/opt-censer.svg' };
function evOptIco(type){ return SC_EV_ICON[type] || '/assets/icon/opt-censer.svg'; }

/* 资源满值基准（刻度比例用，与 PC 端一致） */
const SC_RES_CAP = { 香火:400, 气数:100, 阴德:30, 威灵:40, 香客:null };
function scResRatio(k, s){
  if(k==='香客') return Math.max(0, Math.min(1, s.香客 / scXkCap(s)));
  if(k==='威灵') return Math.max(0, Math.min(1, s.res.威灵 / SC_RES_CAP.威灵));
  const cap = SC_RES_CAP[k] || 1;
  const v = (s.res[k]!=null ? s.res[k] : 0);
  return Math.max(0, Math.min(1, v / cap));
}
/* 器物图标路径（静态 svg 文件，不含动态刻度；刻度由 wxml 结构呈现） */
const SC_RES_ICO = {
  xianghuo:'/assets/icon/res-xianghuo.svg', qishui:'/assets/icon/res-qishui.svg',
  yinde:'/assets/icon/res-yinde.svg', weiling:'/assets/icon/res-weiling.svg',
  xiangke:'/assets/icon/res-xiangke.svg',
  xinxin:'/assets/icon/res-xinxin.svg',
  zhun:'/assets/icon/res-zhun.svg', bo:'/assets/icon/res-bo.svg', ge:'/assets/icon/res-ge.svg',
};
/* 旬中转页 · 账本行图标：功德取阴德（竹简刻痕），信心取民心心形 */
const SC_ST_ICO = { 香火:'xianghuo', 气数:'qishui', 功德:'yinde', 威灵:'weiling', 香客:'xiangke', 信心:'xinxin' };
/* 旬中转页 · 所奏统计图标：应=准印 / 不应=驳印 / 搁置=悬牌 / 香火收入=香炉 */
const SC_STAT_ICO = { 应:'zhun', 不应:'bo', 搁置:'ge', 香火收入:'xianghuo' };
function scApplyEff(s, eff){
  if(!eff) return;
  const before = {};
  SC_RES_KEYS.forEach(k=>{ before[k] = s.res[k]; });
  const beforeX = s.香客;
  SC_RES_KEYS.forEach(k=>{
    if(eff[k]!=null){
      let v = eff[k];
      // 水线事件多为香火消耗，折算以缓解「道德经营便香火饿死」的死局（增益不动）
      if(k==='香火' && s.dom==='shui' && v < 0) v = Math.round(v * 0.65);
      scGain(s, k, v);
    }
  });
  if(eff.香客!=null) s.香客 = Math.max(0, Math.min(scXkCap(s), s.香客 + eff.香客));
  if(eff.信心!=null) s.信心 = Math.max(0, Math.min(100, s.信心 + eff.信心));
  if(eff.越界!=null) s.越界 = Math.max(0, s.越界 + eff.越界);
  if(eff.脱根!=null) s.脱根 = Math.max(0, s.脱根 + eff.脱根);
  if(eff.rank!=null) s.rank = Math.max(0, Math.min(SC_RANK_MAX, s.rank + eff.rank));
  scClamp(s);
  if(!s.fxQueue) s.fxQueue = [];
  SC_RES_KEYS.forEach(k=>{
    const d = s.res[k] - before[k];
    if(d !== 0) s.fxQueue.push({ k:k, v:d });
  });
  if(eff.香客!=null && s.香客!==beforeX) s.fxQueue.push({ k:'香客', v:s.香客-beforeX });
  if(eff.realmJump) s.fxQueue.push({ k:'神职 · '+SC_RANKS[s.dom][s.rank].name, v:0 });
  if(eff.flag)  s.flags[eff.flag] = 1;
  if(eff.unflag) delete s.flags[eff.unflag];
  if(eff.events) s.events.push({ id:eff.events });   // 抉择点可引出后续事件（如天劫）
  if(eff.rel){ for(const k in eff.rel){ s.rel[k] = Math.max(-10, Math.min(10, (s.rel[k]||0)+eff.rel[k])); } }
  if(eff.msg) scLog(s, eff.msg, eff.阴德!=null&&eff.阴德<0 ? 'bad' : (eff.香火!=null&&eff.香火>0 ? 'good' : ''));
  if(eff.answer === false) s.noAnswerStreak++;
  else s.noAnswerStreak = 0;
}

/* 解决一桩祈愿 */
function scResolveEvent(idx, optIdx){
  const s = state.shenci; if(s.over || s.settling) return;
  const ev = s.events[idx]; if(!ev) return;
  const def = scEventDef(ev.id); if(!def) return;
  const opt = def.opts[optIdx]; if(!opt) return;
  const rq = scOptReqOk(s, opt); if(!rq.ok) return;
  if(s.ap <= 0) return;
  s.ap--;                                  // 一旬只有三桩事能认真办，其余只能搁置

  let tianjieR = null;
  if(opt.debate){
    // 神道论理：以阴德 + 威灵 博弈（与落魄山「论道」同构）；天劫难度随品秩递增
    const pow = (ev.id==='tianjie') ? (24 + s.rank*18) : opt.debate.power;
    const my  = s.res.阴德*0.6 + s.res.威灵*0.4 + Math.floor(Math.random()*12);
    const foe = pow + Math.floor(Math.random()*12);
    const win = my >= foe;
    const eff = win ? opt.debate.win : opt.debate.lose;
    tianjieR = eff.tianjie || null;
    scApplyEff(s, eff);
    scTrail(s, def.title, (win?'理直 · 胜':'理屈 · 败')+'（我 '+Math.round(my)+' · 彼 '+foe+'）');
    s.events.splice(idx,1);
    if(def.once) s.flags[def.once] = 1;
    scBanner(win ? '理 直' : '理 屈', win ? '此方水土认你' : '神威有亏', '');
    SFX.click();
  } else {
    scApplyEff(s, opt.eff);
    scTrail(s, def.title, opt.txt);
    s.events.splice(idx,1);
    if(def.once) s.flags[def.once] = 1;
    tianjieR = (opt.eff && opt.eff.tianjie) || null;
    SFX.click();
  }
  if(ev.id === 'tianjie' && tianjieR) scTianjieResult(s, tianjieR);
  if(!s.xunStats) s.xunStats = {应:0,不应:0,搁置:0};
  if(opt.eff){
    if(opt.eff.answer === true) s.xunStats.应++;
    else if(opt.eff.answer === false) s.xunStats.不应++;
  }
  scAfterEvent(s, def, opt);
}

/* 神道天劫结算：渡则升品秩并「脱根」（原著：冲境易脱离山水根基、失去神职依托） */
function scTianjieResult(s, r){
  if(r === 'pass'){
    s.rank = Math.min(SC_RANK_MAX, s.rank+1);
    s.脱根 += 1;
    scLog(s, '天劫已过，你受【'+scRankName(s)+'】之位。金身渐离水土，脚下薄了一分。', 'good');
    scBanner('神 道 天 劫', '受 '+scRankName(s)+' 之位', '');
    if(!s.fxQueue) s.fxQueue = [];
    s.fxQueue.push({ k:'神职 · '+scRankName(s), v:0 });
    s.fxQueue.push({ k:'脱根', v:1 });
  } else if(r === 'fail'){
    scLog(s, '天劫未过，金身崩裂，香火气数俱损。位阶仍在原地。', 'bad');
    scBanner('天 劫 未 过', '金身崩裂', '');
  }
}

/* 事件结算后的统一出口：预检结局 → render → flushFx */
function scAfterEvent(s, def, opt){
  scCheckEndingLive(s);
  render();
  scFlushFx(s);
  scMaybeAutoSettle(s);   // 行动力耗尽 → 自动结算，不必再手动点「过此旬」
}

function scSkipEvent(idx){
  const s = state.shenci; if(s.over || s.settling) return;
  const ev = s.events[idx]; if(!ev) return;
  const def = scEventDef(ev.id); if(!def) return;
  // 对神而言，「搁置」本身就是一种「不应」
  if(!s.xunStats) s.xunStats = {应:0,不应:0,搁置:0};
  s.xunStats.搁置++;
  s.events.splice(idx,1);
  s.backlog++;
  s.noAnswerStreak++;
  s.信心 = Math.max(0, s.信心 - 4);
  scLog(s, '你将「'+def.title+'」搁过一旁。香案前的那炷香，又冷了一分。', '');
  SFX.click();
  render();
  scMaybeAutoSettle(s);   // 祈愿已空且再无可为 → 自动结算
}

/* ==========================================================================
 * 祈愿池
 *  · dom:'shan' 山线 / 'shui' 水线 / 不填 = 通用
 *  · type:'祈愿' 常规抽卡 / '危机' 条件触发 / '册目' 按 bookXun 脚本注入
 *  · opt.ban = 硬禁制（原著铁律），显示锁定原因且不可选
 *  · 【不剧透纪律】选项只写「做什么」，不写「会怎样」；后果由 fxQueue 飘字 +
 *    scLog 纪事在提交后揭示。
 * ========================================================================== */
const SC_EVENTS = [

/* ─────────────── 山线祈愿 ─────────────── */
{ id:'shan_qiuyu', dom:'shan', type:'祈愿', title:'求 雨', who:'山下赵家坳的里正',
  desc:'开春三个月没落一滴雨。里正领着十几个老农跪在庙前，额头抵着青砖，一声不吭。供品是一篮鸡蛋——他们也只有这个了。',
  opts:[
    { txt:'借云气，落一场透雨', req:{香火:18}, eff:{香火:-18,气数:-2,阴德:3,香客:2,信心:6,answer:true,
      msg:'你借了东边的水气，落了三尺雨。老农们没道谢，只是把那篮鸡蛋又往供桌上推了推。'} },
    { txt:'只润一层地皮', req:{香火:8}, eff:{香火:-8,气数:-2,阴德:1,香客:1,信心:2,answer:true,
      msg:'你匀了些水汽下去，够麦子缓一口气。'} },
    { txt:'不应此愿', eff:{阴德:-2,信心:-8,香客:-1,answer:false,
      msg:'你没动。他们跪到日头偏西，起身时膝盖都僵了。'} },
  ]},

{ id:'shan_hujing', dom:'shan', type:'祈愿', title:'老狐求名', who:'山中修行三百年的老狐',
  desc:'老狐化作青衫翁，捧着一坛酒来贺。酒过三巡，它才开口，说想请你在辖内给它一个正经名分——它守这片山，比谁都久。',
  opts:[
    { txt:'许它山神之位', ban:'铁律 · 狐精不可为山神', eff:{} },
    { txt:'给一块「护山庙祝」的木牌', eff:{阴德:2,威灵:-3,香火:5,answer:true,
      msg:'你削了块木牌递过去。它捧着看了很久，末了问：「庙祝算不算官？」你说不算。它说，那也挺好。'} },
    { txt:'只答四个字：不可为神', eff:{阴德:1,威灵:4,香客:-1,answer:true,
      msg:'你只说了四个字。它没恼，把剩下的半坛酒喝完，起身走了。'} },
    { txt:'不置可否', eff:{阴德:-1,信心:-3,answer:false,
      msg:'你端起酒碗，没接这话。它笑了一声，也没再提。'} },
  ]},

{ id:'shan_menghu', dom:'shan', type:'祈愿', title:'虎 患', who:'猎户王二',
  desc:'一头吊睛白额虎下山，咬死了三头牛、一只羊，还没伤人。王二带了七八个后生堵在庙门口，手里攥着叉子，等你一句话。',
  opts:[
    { txt:'拦下众人，遣虎归山', req:{威灵:14}, eff:{威灵:-5,阴德:2,气数:2,香客:1,answer:true,
      msg:'你托梦给那头虎，它回了深山。王二骂了半宿，说山神爷护畜生。'} },
    { txt:'任他们去打', eff:{阴德:-1,威灵:2,香客:1,信心:3,气数:-3,answer:true,
      msg:'他们打了三天，抬着虎尸回来，在庙前剥皮。血渗进砖缝，你闻了很久。'} },
    { txt:'不应此愿', eff:{信心:-5,气数:-2,answer:false,
      msg:'庙门关着。他们等了半日，散了。后来那头虎又咬死了一个人。'} },
  ]},

{ id:'shan_zhuoya', dom:'shan', type:'祈愿', title:'采药人坠崖', who:'一个不相干的外乡人',
  desc:'外乡人来采崖上的石斛，绳子断了，卡在半崖一棵歪脖子松上，喊了两天。山民说，他是外乡人，不归你管。',
  opts:[
    { txt:'托一阵风，托他一把', req:{香火:10}, eff:{香火:-10,阴德:4,威灵:1,信心:2,answer:true,
      msg:'你托了一阵风。他爬上来以后，在崖下磕了九个头，然后走了，再没回来过。'} },
    { txt:'由他去', eff:{阴德:-4,信心:-2,answer:false,
      msg:'第三天崖下没声了。开春有人捡到一副骨架，顺手埋了。'} },
  ]},

{ id:'shan_kaikuang', dom:'shan', type:'祈愿', title:'开 矿', who:'大骊工部的采办官',
  desc:'采办官带着一队兵丁上山，说要开一处铁矿，供大骊铸剑。他说话客气，但兵丁的刀就挂在腰上。开了矿，山要掉一层皮。',
  opts:[
    { txt:'准了', eff:{香火:30,气数:-12,阴德:-5,威灵:3,香客:-1,answer:true,
      msg:'你准了。半年后山北塌了半边，溪水变成锈红色。但庙里多了两尊新供的金身。'} },
    { txt:'以神威拒之', req:{威灵:30}, eff:{威灵:-8,气数:4,阴德:3,香客:1,信心:5,answer:true,
      msg:'你夜里起了场大雾，兵丁迷了三天路。采办官临走撂下一句：「这山神有点意思。」'} },
    { txt:'推说此山无矿', eff:{威灵:-2,阴德:1,气数:2,answer:true,
      msg:'你说此山无矿。他看了你一眼，信了，也可能没信。总之人走了。'} },
  ]},

{ id:'shan_gankao', dom:'shan', type:'祈愿', title:'赶 考', who:'一个读了十年书的穷秀才',
  desc:'秀才来庙里，什么都没求，只把一篇文章念给你听，念完说：「若我中了，回来给您重修庙宇。」说完就走了，走了三十里。',
  opts:[
    { txt:'托一句好话给文运', req:{阴德:10}, eff:{阴德:-3,威灵:-4,香火:6,信心:4,answer:true,
      msg:'你托了一句。他中了。两年后真回来修庙，还带来一块他亲手写的匾。'} },
    { txt:'不涉文昌之事', eff:{阴德:-1,信心:-3,answer:false,
      msg:'你没管。他落第了，回来的路上把书都烧了。'} },
  ]},

{ id:'shan_tongnv', dom:'shan', type:'祈愿', title:'童女祭河', who:'河对岸的里长',
  desc:'河对岸要祭河伯，绑了个丫头往水里沉。那是埋河的事，不归你管。可那丫头是山上李家的闺女。',
  opts:[
    { txt:'越界救人', eff:{越界:2,阴德:6,威灵:-6,香火:-12,气数:-2,信心:4,answer:true,
      msg:'你掀起一阵山风，把人卷了上来。对岸的鼓乐停了。你知道，这事没完。'} },
    { txt:'不管', eff:{阴德:-6,信心:-6,香客:-1,answer:false,
      msg:'你听着对岸的鼓乐响了一夜。第二天山民发现，庙门的门槛上被人泼了狗血。'} },
    { txt:'托梦给那丫头的爹', eff:{阴德:2,威灵:-2,信心:-2,answer:true,
      msg:'你托梦给她爹，说了一句「去晚了」。他连夜下山，只捞上来一只鞋。'} },
  ]},

{ id:'shan_kujing', dom:'shan', type:'祈愿', title:'枯 井', who:'山腰独居的寡妇',
  desc:'山腰那口井干了。寡妇每天走十里山路去挑水，挑了两个月。她来庙里，只问了一句：「是不是我哪里得罪了山神爷？」',
  opts:[
    { txt:'引一线泉脉过去', req:{香火:14}, eff:{香火:-14,气数:-4,阴德:3,香客:1,信心:5,answer:true,
      msg:'你引了一线泉脉。井冒水的那天，她在井边坐了半宿，一句话没说。'} },
    { txt:'不应此愿', eff:{阴德:-2,信心:-5,香客:-1,answer:false,
      msg:'你没应。第三个月，她搬走了，房子塌在雨季里。'} },
  ]},

{ id:'shan_shanxiao', dom:'shan', type:'祈愿', title:'山魈作祟', who:'山里的老住户',
  desc:'一只成了气候的山魈领着群猴子糟蹋庄稼，还学人说话，在村口喊人的名字。山民说，那是山里的老人，惹不得。',
  opts:[
    { txt:'以神威压服', req:{威灵:20}, eff:{威灵:-6,阴德:1,气数:3,香客:1,信心:4,answer:true,
      msg:'你显了一次真形。山魈带着猴子搬去了后山，从此见人就拜。'} },
    { txt:'许它一处不受打扰的山坳', eff:{威灵:-2,阴德:2,气数:-2,香客:1,answer:true,
      msg:'你划了片山坳给它。它不再糟蹋庄稼，偶尔在坳口放几颗野果。'} },
    { txt:'装作没看见', eff:{威灵:-4,气数:-4,信心:-4,answer:false,
      msg:'你没管。秋收少了三成，山民开始去别处烧香。'} },
  ]},

{ id:'shan_laoyu', dom:'shan', type:'祈愿', title:'求 子', who:'一个守了十年寡的老妪',
  desc:'老妪的儿子死在采石场上。她来求的不是儿子回来，是求给儿子托生个好人家。她说：「我这辈子没做过坏事。」',
  opts:[
    { txt:'查一查生死簿', req:{威灵:16}, eff:{威灵:-6,阴德:4,香火:8,信心:3,answer:true,
      msg:'你查了。他下一世在三百里外一户打铁的人家。你只告诉她：「是个劳碌命，但活得长。」'} },
    { txt:'只说「自有安排」', eff:{阴德:-1,信心:-2,香火:3,answer:true,
      msg:'你说了句「自有安排」。她磕了头，走了，脚步比来时轻些。'} },
    { txt:'不应此愿', eff:{阴德:-3,信心:-4,answer:false,
      msg:'你没应。她后来每一旬都来一次，庙里的香灰积了厚厚一层。'} },
  ]},

{ id:'shan_zhengshui', dom:'shan', type:'祈愿', title:'两村争水', who:'上村与下村的里正',
  desc:'上下两个村子为一条溪水打了三代人，今年打出了人命。两村的里正一起来庙里，都跪着，都说是对方的错。',
  opts:[
    { txt:'断个公道', req:{威灵:18}, eff:{威灵:-5,阴德:5,气数:3,香客:2,信心:6,answer:true,
      msg:'你在溪心立了块分水石，写了两村的份例。他们不打了——因为都不满意，也都不敢动那块石头。'} },
    { txt:'各打五十大板', eff:{威灵:-2,阴德:1,信心:-1,answer:true,
      msg:'你说了句「都回去」。他们骂骂咧咧地走了，第二年又打。'} },
    { txt:'让他们自己去商量', eff:{阴德:-2,信心:-3,气数:-2,answer:false,
      msg:'你让他们自己商量。那年夏天，溪水被血染红过一次。'} },
  ]},

{ id:'shan_xinmiao', dom:'shan', type:'祈愿', title:'新庙选址', who:'一伙外来的香客',
  desc:'外来的香客攒了钱，要给你盖一座新庙。他们选的地方在山顶——那是一片老林子，住着不少活物。盖了庙，林子就得砍。',
  opts:[
    { txt:'准他们在山顶起庙', eff:{香火:24,威灵:5,气数:-5,阴德:-2,香客:2,answer:true,
      msg:'庙起得很气派，站在庙门口能看见三县。只是山顶那片林子，从此再没鸟叫。'} },
    { txt:'指一处山脚的荒地', eff:{香火:10,气数:3,阴德:2,香客:1,answer:true,
      msg:'你指了山脚的荒地。庙小了些，但鸟还在。'} },
    { txt:'不受此庙', eff:{香火:-6,阴德:1,香客:-1,信心:-3,answer:false,
      msg:'你说不需要。他们愣了半天，把钱捐去修了桥。'} },
  ]},

{ id:'shan_leipi', dom:'shan', type:'祈愿', title:'雷劈古木', who:'一株八百年的老槐',
  desc:'天雷要劈那株老槐。它修行了八百年，从没伤过人。按天数，它该有此劫；按人情，它什么都没做错。',
  opts:[
    { txt:'替它挡一道', req:{香火:30, 威灵:20}, eff:{香火:-30,威灵:-10,阴德:7,气数:4,信心:5,answer:true,
      msg:'你替它挡了。金身裂了一道纹，它第二天开花了，开得满山都是。'} },
    { txt:'闭上眼，由天去', eff:{阴德:-3,威灵:3,气数:-1,answer:false,
      msg:'你闭了眼。雷劈了三天三夜。事后山民在树桩上刻了「山神在此」四个字。'} },
  ]},

{ id:'shan_shanhong', dom:'shan', type:'祈愿', title:'山 洪', who:'整条沟的人',
  desc:'连下了六天暴雨。半夜，山洪下来了。沟里有三个村子，两百多口人。你有半个时辰。',
  opts:[
    { txt:'托梦给每一个睡着的人', req:{香火:36}, eff:{香火:-36,威灵:-8,阴德:9,气数:3,香客:3,信心:9,answer:true,
      msg:'你挨家挨户地托梦，托了两百多个。天亮时金身暗得像块石头，但一个人都没少。'} },
    { txt:'只托梦给里正与甲长', req:{香火:14}, eff:{香火:-14,阴德:3,气数:1,香客:1,信心:3,answer:true,
      msg:'你只叫醒了几个管事的。他们敲锣喊人，救出了大半。'} },
    { txt:'洪水果然是天数', eff:{阴德:-10,信心:-12,香客:-3,气数:-8,answer:false,
      msg:'你没动。天亮后沟里多了四十七座新坟。庙里的香，断了整整一年。'} },
  ]},

/* ─────────────── 通用祈愿 ─────────────── */
{ id:'daxiangke', type:'祈愿', title:'大 香 客', who:'一位换了门庭的大香客',
  desc:'这位大香客一年在庙里烧的香，值十万两白银。他前年去了邻祠，今年又回来了，说想看看你这里还灵不灵。',
  opts:[
    { txt:'为他显一次灵', req:{香火:20, 威灵:12}, eff:{香火:-20,威灵:-5,香客:5,信心:8,阴德:-2,answer:true,
      msg:'你为他显了一次灵。他捐了三年的香油钱。只是从那以后，庙里来的人都在等下一次显灵。'} },
    { txt:'只给他一句准话', req:{阴德:6}, eff:{阴德:-4,香客:3,信心:5,answer:true,
      msg:'你只给了他一句准话，说中了。他没再问别的，磕了头就走。'} },
    { txt:'不见', eff:{香客:-4,信心:-6,阴德:-3,answer:false,
      msg:'你没见他。他去了邻祠，第二年邻祠重修了一遍。'} },
  ]},

{ id:'heyi_buying', type:'祈愿', title:'为何不应', who:'一个烧了二十年香的老香客',
  desc:'他跪在香案前，问的不是事，是一句话：「这些年我求的十件事，神明只应了三件。是我心不诚，还是神明本就不在乎？」',
  opts:[
    { txt:'托梦答他', req:{香火:12}, eff:{香火:-12,阴德:3,信心:6,香客:1,answer:true,
      msg:'你托梦给他，只说了一句：「香火养的是神，不是道理。」他醒来后想了三天，从此只烧香，不求事。'} },
    { txt:'让他自己想', eff:{信心:-4,香客:-1,阴德:-1,answer:false,
      msg:'你没答。他走的时候把香折断，扔在门槛外。'} },
  ]},

{ id:'yinci_xian', type:'祈愿', title:'游方道士', who:'一个自称谱牒仙师的游方道士',
  desc:'道士围着你的庙转了三圈，说你这庙「名不正言不顺」，要替天行道，把庙拆了。他背后站着三十个拿了钱的山民。',
  opts:[
    { txt:'以神威慑之', req:{威灵:24}, eff:{威灵:-8,阴德:-2,香客:2,信心:5,answer:true,
      msg:'你让庙里的烛火同时灭了。道士连夜跑了，跑丢了一只鞋。'} },
    { txt:'请城隍来断', eff:{威灵:-3,阴德:2,香火:-10,信心:2,answer:true,
      msg:'你请了城隍来。城隍判你「名正」，判道士「妖言」。道士被打了二十板。'} },
    { txt:'由他拆', eff:{香火:-28,威灵:-12,气数:-8,香客:-2,信心:-8,阴德:2,answer:false,
      msg:'庙拆了。你在废墟上坐了一年，香火断了，但没再有人来管你叫「淫祀」。'} },
  ]},

{ id:'miaozhu_tanmo', type:'祈愿', title:'庙祝贪墨', who:'庙里的庙祝',
  desc:'庙祝把香油钱拿去买了田，还在庙后养了三房外室。山民来告了三次，你都没空理。',
  opts:[
    { txt:'拿下他，另择庙祝', req:{威灵:10}, eff:{威灵:-4,阴德:3,香火:12,信心:6,香客:1,answer:true,
      msg:'你让他连着做了七夜噩梦，第八天他自己把田契交了出来。'} },
    { txt:'睁一只眼闭一只眼', eff:{香火:8,阴德:-5,信心:-5,香客:-1,answer:false,
      msg:'你没管。他胆子越来越大，最后连庙都敢卖。'} },
  ]},

{ id:'youfang_daozhang', type:'祈愿', title:'借 香 火', who:'一个过路的野修',
  desc:'野修在庙里借宿，临走说，愿替你办一件事，只求分你三年香火。他说得很实在，实在得让人不太放心。',
  opts:[
    { txt:'许他三年香火', eff:{香火:20,阴德:-4,威灵:-3,answer:true,
      msg:'他替你平了三桩事，然后卷着三年的香火走了。你后来才知道，他拿去喂了剑。'} },
    { txt:'只留他住一宿', eff:{阴德:2,香火:3,信心:2,answer:true,
      msg:'你留他住了一宿，第二天给了他一袋干粮。他道了谢，走了。'} },
    { txt:'赶他出去', eff:{威灵:2,阴德:-2,香火:-3,answer:false,
      msg:'你把他赶了出去。他走的时候说了句「小气」。'} },
  ]},

{ id:'chenghuang_chuanxun', type:'祈愿', title:'城隍传讯', who:'本州城隍爷',
  desc:'城隍爷派人送来一纸文书：着你辖内清丈人口、造册上报。造册之后，辖内每一户生老病死都得上账，从此不得擅专。',
  opts:[
    { txt:'如实造册', eff:{阴德:2,威灵:-6,香火:-8,气数:2,信心:2,answer:true,
      msg:'你如实造了册。城隍赞你「安分」。只是从此辖内少了一个人，你当天就得知道。'} },
    { txt:'拖一拖', eff:{威灵:-2,阴德:-2,信心:-1,answer:false,
      msg:'你拖了三旬。第四旬城隍亲自来了，什么都没说，只看了你一眼。'} },
  ]},

/* ─────────────── 水线祈愿 ─────────────── */
{ id:'shui_fengping', dom:'shui', type:'祈愿', title:'求 风 平', who:'一船赶着交纳官粮的船家',
  desc:'风起了。船上装的是官粮，误了期限要掉脑袋。船家跪在船头，往水里倒了三碗酒，喊你的名号。',
  opts:[
    { txt:'压住这一程风浪', req:{香火:16}, eff:{香火:-16,气数:-4,阴德:3,香客:2,信心:5,answer:true,
      msg:'你压了三十里水路的浪。船到码头时，他把最后一碗酒倒进了河里。'} },
    { txt:'只护他船不沉', req:{香火:7}, eff:{香火:-7,阴德:1,香客:1,信心:2,answer:true,
      msg:'你只护住了船。货湿了一半，他挨了二十板，但命还在。'} },
    { txt:'不应此愿', eff:{阴德:-3,信心:-6,香客:-1,answer:false,
      msg:'你没应。船翻在第三个滩口，捞上来七具尸首。'} },
  ]},

{ id:'shui_qiuyu', dom:'shui', type:'祈愿', title:'求 鱼', who:'下游三百户渔家',
  desc:'今年河里的鱼少得反常。渔家说，是有人在河湾下了绝户网，也有人说，是河神爷不高兴了。',
  opts:[
    { txt:'查一查河底', req:{威灵:12}, eff:{威灵:-5,阴德:2,气数:4,香客:2,信心:4,answer:true,
      msg:'你查了。是上游新修的一处陂塘断了鱼道。你托梦给修陂塘的官，他改了。'} },
    { txt:'任他们多捕些', eff:{气数:-8,阴德:-3,香客:1,信心:2,answer:true,
      msg:'你由他们捕。那一年鱼多得一网三十斤，第二年一网三条。'} },
    { txt:'不应此愿', eff:{信心:-4,香客:-1,answer:false,
      msg:'你没应。渔家开始去海边求龙王，虽然他们谁也没见过大海。'} },
  ]},

{ id:'shui_luoshui', dom:'shui', type:'祈愿', title:'落 水', who:'一个在河边洗衣服的妇人',
  desc:'妇人失足掉进深水凼，怀里还抱着个孩子。岸上有十几个人，会水的都在上游干活，不会水的在岸边哭。',
  opts:[
    { txt:'托她一把', req:{香火:12}, eff:{香火:-12,阴德:5,信心:4,香客:1,answer:true,
      msg:'你托了她一把。她上岸后第一件事是找孩子，孩子还睡着，一点没湿。'} },
    { txt:'只护住孩子', req:{香火:6}, eff:{香火:-6,阴德:1,信心:-1,answer:true,
      msg:'你只护住了孩子。第二天，那孩子被人抱去舅舅家养了。'} },
    { txt:'不应此愿', eff:{阴德:-5,信心:-6,香客:-1,answer:false,
      msg:'你没应。两天后尸体冲到下游的浅滩上，怀里的孩子早没了。'} },
  ]},

{ id:'shui_shuigui', dom:'shui', type:'祈愿', title:'水鬼索替', who:'一个泡了六十年的水鬼',
  desc:'水鬼找上门来，说按规矩，它只要拉一个人下水，就能去投胎。它已经等了六十年，等得实在不耐烦了。',
  opts:[
    { txt:'许它一个别的法子', req:{阴德:8}, eff:{阴德:-4,威灵:-4,香火:6,气数:2,answer:true,
      msg:'你许它积满一百件善事再走。它骂骂咧咧地去了，从此每年往岸边推几个落水的商人。'} },
    { txt:'压它下水，不许出来', req:{威灵:20}, eff:{威灵:-7,阴德:-2,气数:3,香客:1,answer:true,
      msg:'你把它压回水底。它在水里骂了三年，第四年不骂了。'} },
    { txt:'装作不知道', eff:{阴德:-4,信心:-4,气数:-2,answer:false,
      msg:'你装作不知道。那年河里多了一具尸首，水鬼再没出现过。'} },
  ]},

{ id:'shui_quqin', dom:'shui', type:'祈愿', title:'河伯娶亲', who:'两岸的乡绅',
  desc:'乡绅们凑了钱，要给你办一场娶亲，买了个佃户家的闺女。他们说这是老规矩，办了你才有烟火气。那闺女十四岁。',
  opts:[
    { txt:'受了这场烟火气', eff:{香火:35,阴德:-12,威灵:4,香客:3,信心:-3,answer:true,
      msg:'你受了。此后每年一次，庙里的香火旺得呛人。那闺女第二年被抬回来时，已经不会说话了。'} },
    { txt:'掀翻花轿，斥为淫祀', req:{阴德:5}, eff:{香火:-16,阴德:8,威灵:-5,香客:-2,信心:4,answer:true,
      msg:'你掀了花轿。乡绅们说这河神疯了，第二年香火少了一半，但那闺女活到了六十三岁。'} },
    { txt:'不置可否', eff:{阴德:-6,信心:-5,香客:-1,answer:false,
      msg:'你没说话。花轿照常抬走。之后每年庙里都多一盏长明灯。'} },
  ]},

{ id:'shui_liangan', dom:'shui', type:'祈愿', title:'两岸争水', who:'河东与河西的农户',
  desc:'河东要引水灌田，河西要放船通商。两边各来了两百人，扛着锄头和橹桨，站在河滩上对骂。',
  opts:[
    { txt:'定下用水与通航的时辰', req:{威灵:16}, eff:{威灵:-5,阴德:4,气数:3,香客:2,信心:5,answer:true,
      msg:'你定了时辰：白日行船，夜里灌田。两边都骂神明偏心，但都照做了。'} },
    { txt:'让上游多放些水下来', req:{香火:14}, eff:{香火:-14,气数:-5,阴德:2,香客:1,信心:3,answer:true,
      msg:'你让上游多放了水。两边都够用了，谁也没谢谁。'} },
    { txt:'由他们打', eff:{阴德:-4,气数:-4,信心:-6,香客:-1,answer:false,
      msg:'你没管。那年河滩上死了三个人，从此两边三年不通婚。'} },
  ]},

{ id:'shui_duanliu', dom:'shui', type:'祈愿', title:'断 流', who:'整条河',
  desc:'大旱。河水只剩中间一线，河床裂得像老人的手。两岸的井都干了，再不下雨，今年颗粒无收。',
  opts:[
    { txt:'向上游借水', req:{香火:26, 越界:0}, eff:{香火:-26,越界:1,阴德:3,气数:-3,香客:2,信心:5,answer:true,
      msg:'你向上游借了水。上游那位什么都没说，但从此你欠他一次。'} },
    { txt:'掘地脉，续一线水', req:{香火:18}, eff:{香火:-18,气数:-7,阴德:2,香客:1,信心:4,answer:true,
      msg:'你掘了地脉。水续上了，但三年之内，这条河的底气都补不回来。'} },
    { txt:'旱是天数', eff:{阴德:-6,气数:-6,信心:-8,香客:-2,answer:false,
      msg:'你没动。那年有人开始往龙王庙去，一去就没再回来。'} },
  ]},

{ id:'shui_hongshui', dom:'shui', type:'祈愿', title:'洪 水', who:'下游七十二圩',
  desc:'上游连下暴雨，洪峰下来了。泄洪，下游七十二圩全淹；不泄，上游三个县城要泡在水里。你有半个时辰。',
  opts:[
    { txt:'泄洪，保住三个县城', req:{香火:30}, eff:{香火:-30,阴德:-6,气数:-10,香客:-3,信心:-5,answer:true,
      msg:'你泄了洪。三个县城保住了，七十二圩淹了十九圩。第二年，你在河底发现了一座新庙的残骸。'} },
    { txt:'不泄，硬扛', req:{威灵:34}, eff:{威灵:-12,阴德:6,香火:-20,气数:2,香客:2,信心:6,answer:true,
      msg:'你硬扛了。金身差点散掉，但七十二圩一圩没淹。上游死了十一个人。'} },
    { txt:'分洪，两边各伤一半', req:{香火:16}, eff:{香火:-16,阴德:1,气数:0,香客:-1,信心:1,answer:true,
      msg:'你分了洪。两边都有损失，两边都骂，两边都还来烧香。'} },
  ]},

{ id:'shui_qiaota', dom:'shui', type:'祈愿', title:'桥 塌', who:'一座刚修好三年的石桥',
  desc:'桥塌了。修桥的银子被人贪了一半，用了糯米汁兑沙浆。塌的时候桥上有二十几个人，还有一辆运药的马车。',
  opts:[
    { txt:'救人', req:{香火:14}, eff:{香火:-14,阴德:4,信心:4,香客:1,answer:true,
      msg:'你救了十九个。有一个没救上来，是修桥的工头，他自己跳下去的。'} },
    { txt:'托梦给查账的官', req:{威灵:10}, eff:{威灵:-4,阴德:5,气数:2,香客:1,信心:5,answer:true,
      msg:'你托梦给了查账的官。他挖出了账本，牵出七个人。桥重修了，用的是真糯米汁。'} },
    { txt:'不该你管的事', eff:{阴德:-3,信心:-4,answer:false,
      msg:'你说这不该你管。第二年那座桥又修了一次，又塌了一次。'} },
  ]},

{ id:'shui_chenchuan', dom:'shui', type:'祈愿', title:'沉 船', who:'一艘装着私盐的商船',
  desc:'盐船半夜沉了，沉得很蹊跷——舱里装的不全是盐。船主跪在河边，求的不是货，是求别让人知道这船是他的。',
  opts:[
    { txt:'替他瞒下来', eff:{香火:22,阴德:-8,威灵:-3,香客:1,answer:true,
      msg:'你替他瞒了。他每月十五来烧一炷香，从不敢抬头看神像。'} },
    { txt:'把船拖上来，公之于众', req:{威灵:14}, eff:{威灵:-5,阴德:6,香火:-6,信心:4,香客:1,answer:true,
      msg:'你把船拖上岸。官家抄了盐、抓了人，也顺手修了河堤。'} },
    { txt:'不管', eff:{阴德:-2,香火:5,answer:false,
      msg:'你没管。半年后有人在河湾捞到几箱东西，从此再没在这条河上出现过。'} },
  ]},

{ id:'shui_jingguai', dom:'shui', type:'祈愿', title:'水底精怪', who:'一只成了气候的老鼋',
  desc:'老鼋在河底住了四百年，从没伤过人。今年它开始掀船，因为它要挪窝——河床被泥沙垫高了，它住不下了。',
  opts:[
    { txt:'替它清一处深潭', req:{香火:20}, eff:{香火:-20,气数:4,阴德:4,香客:1,信心:3,answer:true,
      msg:'你替它清了深潭。它搬过去那天，往岸边推了一船鱼。'} },
    { txt:'以神威镇之', req:{威灵:22}, eff:{威灵:-8,阴德:-2,气数:2,香客:1,answer:true,
      msg:'你镇了它。它不再掀船，也不再出来。三年后有人在深潭底发现了一副很大的壳。'} },
    { txt:'随它去', eff:{气数:-5,信心:-5,香客:-1,answer:false,
      msg:'你随它去。那年又沉了两条船，从此没人敢走夜航。'} },
  ]},

{ id:'shui_touhe', dom:'shui', type:'祈愿', title:'投 河', who:'一个欠了赌债的米店掌柜',
  desc:'掌柜半夜来投河。他站在桥上站了半个时辰，最后没跳，跪在桥头哭了半宿，天亮前走了。',
  opts:[
    { txt:'托一句话给他', req:{阴德:4}, eff:{阴德:-2,信心:3,香火:4,answer:true,
      msg:'你托了一句「账可以慢慢还」。他后来还了八年，还清了，六十大寿那天来庙里磕了头。'} },
    { txt:'由他', eff:{阴德:-3,信心:-3,answer:false,
      msg:'你由他。三天后，打捞的人在下游找到了人。'} },
  ]},

{ id:'shui_zhengchuan', dom:'shui', type:'祈愿', title:'官家征船', who:'大骊水师的校尉',
  desc:'水师要征走河上所有的船，运兵南下。征了船，两岸三百户渔家今年就得饿死；不征，军法从事的是校尉。',
  opts:[
    { txt:'准他征', eff:{香火:18,威灵:3,阴德:-7,香客:-3,信心:-6,answer:true,
      msg:'你准了。船走了，渔家卖船卖网，那年冬天有人开始吃观音土。'} },
    { txt:'与他讲一个道理', req:{威灵:18}, eff:{威灵:-6,阴德:4,香火:-10,香客:1,信心:4,answer:true,
      msg:'你与他讲了个道理：留三分之一的船打鱼，其余随征。他愣了半宿，改了令。'} },
    { txt:'拖到他走', eff:{威灵:-3,阴德:-3,气数:-2,answer:false,
      msg:'你拖。他等了五天，走了，船一条没征到。第七天来了个更大的官。'} },
  ]},

{ id:'shui_shixiu', dom:'shui', type:'祈愿', title:'庙 塌 了', who:'你自己',
  desc:'水神庙年久失修，屋顶塌了半边，神像脸上的金漆掉得只剩一只眼睛。香客说，这庙太破了，神明大概早搬走了。',
  opts:[
    { txt:'自己动手修', req:{香火:24}, eff:{香火:-24,气数:3,阴德:3,香客:2,信心:7,answer:true,
      msg:'你用了三旬，一寸一寸把庙修好了。修好那天，来烧香的人比往年多了一倍。'} },
    { txt:'托梦给里正', req:{威灵:8}, eff:{威灵:-3,香火:-8,香客:1,信心:4,answer:true,
      msg:'你托梦给里正。他第二天就带着人来修，还顺手多修了一间偏殿。'} },
    { txt:'塌就塌了', eff:{香火:-10,威灵:-6,香客:-2,信心:-6,answer:false,
      msg:'塌就塌了。你在露天的神座上坐了两年，香客换了个地方烧香。'} },
  ]},

/* ─────────────── 危机（条件触发，不入普通抽卡） ─────────────── */
{ id:'cr_xiangke_pao', type:'危机', title:'香客转投邻祠', who:'辖内的香客',
  desc:'一连几旬，你都没应过一件事。庙里的香案积了灰。有人开始收拾香烛，说要去邻祠试试——那位至少还灵。',
  opts:[
    { txt:'立刻显一次灵', req:{香火:22, 威灵:10}, eff:{香火:-22,威灵:-5,香客:-2,信心:8,阴德:-2,answer:true,
      msg:'你显了一次灵。要走的人留下了，留下的问你：那之前为什么不灵？'} },
    { txt:'挨家挨户托梦', req:{香火:14}, eff:{香火:-14,信心:6,香客:-1,香火2:0,阴德:1,answer:true,
      msg:'你挨家挨户地托梦，什么都没许，只说了一句「我还在」。第二天来的人，比前一天多。'} },
    { txt:'由他们去', eff:{香客:-4,信心:-6,香火:-8,answer:false,
      msg:'你由他们去。邻祠那一年重修了庙门。'} },
  ]},

{ id:'cr_yinci', type:'危机', title:'淫 祠 之 议', who:'本州城隍爷',
  desc:'城隍爷亲自来了。他说辖内有司上奏，说你「名不正言不顺，聚众受香，惑乱人心」，要拆庙除名。他问你一句：可有话说？',
  opts:[
    { txt:'自陈功德', req:{阴德:12}, eff:{威灵:-4,阴德:3,香火:-6,信心:3,answer:true,
      msg:'你把辖内的功德一件件报了出来。城隍听完了，说：「那就留着吧。」临走前看了你一眼。'} },
    { txt:'请辖内百姓作证', req:{香客:10}, eff:{香火:-12,阴德:2,香客:1,信心:8,answer:true,
      msg:'你请百姓作证。来了两百多人，跪在庙前一言不发。城隍站了半炷香，走了。'} },
    { txt:'认了', eff:{香火:-40,威灵:-15,气数:-10,香客:-3,信心:-10,阴德:4,answer:false,
      msg:'你认了。庙拆了，名除了。你在废墟上待了很久，直到有个孩子偷偷来放了一支香。'} },
  ]},

{ id:'cr_jingguai', type:'危机', title:'精怪作乱', who:'辖内成了气候的精怪',
  desc:'你这些日子神威不振，辖内的精怪都察觉了。它们开始在夜里出来，学着你的样子受香火。',
  opts:[
    { txt:'杀一儆百', req:{威灵:20}, eff:{威灵:-9,阴德:-3,气数:4,香客:1,信心:4,answer:true,
      msg:'你当众收了一只。剩下的老实了三年。'} },
    { txt:'招来立规矩', req:{香火:16}, eff:{香火:-16,威灵:-3,阴德:3,气数:2,香客:1,answer:true,
      msg:'你把它们招来，立了三条规矩。它们守了很久，比人守得还久。'} },
    { txt:'不管', eff:{威灵:-8,气数:-5,香客:-2,信心:-5,answer:false,
      msg:'你没管。半年后，辖内多了三座野庙。'} },
  ]},

{ id:'cr_jinshen', type:'危机', title:'金身蒙尘', who:'你自己的金身',
  desc:'辖内水土凋敝，你的金身开始蒙尘、褪色，指甲盖大的金漆一片片往下掉。这是根基在烂。',
  opts:[
    { txt:'以香火重镀金身', req:{香火:34}, eff:{香火:-34,气数:8,威灵:5,answer:true,
      msg:'你重镀了金身。金身亮起来的时候，你也觉得自己远了些。'} },
    { txt:'去辖内走一走', eff:{气数:5,信心:4,香客:1,威灵:-2,answer:true,
      msg:'你化作凡人，在辖内走了一旬。回来时金身还是旧的，但没再掉漆。'} },
    { txt:'由它去', eff:{气数:-8,威灵:-6,answer:false,
      msg:'你由它去。金身掉得只剩泥胎，香客看见就哭。'} },
  ]},

{ id:'cr_linshen', type:'危机', title:'邻 神 挑 衅', who:'辖界那边的邻神',
  desc:'邻神越界了。它把你辖内的三处水口（或三道山口）占了，还留了句话：「有本事自己来要。」',
  opts:[
    { txt:'打回去', req:{威灵:18}, eff:{越界:1,威灵:-7,阴德:-2,香火:14,气数:3,香客:1,信心:5,answer:true,
      msg:'你打回去了。它没再敢越界，但这笔账记下了。'} },
    { txt:'请城隍来断', eff:{越界:-1,阴德:2,香火:-10,威灵:-3,信心:2,answer:true,
      msg:'你请城隍来断。城隍判它归还，也判你「不得擅启争端」。'} },
    { txt:'让给它', eff:{气数:-6,威灵:-6,香客:-1,信心:-4,香火:-8,answer:false,
      msg:'你让了。三年之内，它又占了两处。'} },
  ]},

{ id:'tianjie', type:'危机', title:'神 道 天 劫', who:'天 上',
  desc:'香火已足，神职可升。但天劫来了——这是山水神祇进阶必经的一关。扛过去，位阶更尊；扛不过去，金身崩裂。更要紧的是，渡劫之后，你将离这片水土更远一分。',
  opts:[
    { txt:'以身渡之', debate:{ power:0,
      win:  { tianjie:'pass', 阴德:5, 威灵:7, 信心:3, msg:'天劫过了。你受位之时，山（水）还是那座山（水），只是你已看不太清山下的炊烟。' },
      lose: { tianjie:'fail', 香火:-30, 气数:-12, 威灵:-8, msg:'天劫未过。金身崩了半边，香火气数俱损，位阶仍在原地。' } } },
    { txt:'止步于此', eff:{香火:-10, 阴德:2, 气数:3, 信心:2,
      msg:'你没渡。天劫在头顶响了半宿，绕着庙走了三圈，散了。你还在原地，脚下的土还在。' } },
  ]},

/* ─────────────── 册目：按旬注入的抉择点 ─────────────── */
{ id:'bk_lici', type:'册目', bookXun:3, once:'bk_lici', title:'立 祠 之 本', who:'你自己',
  desc:'你受封不过几旬。昨夜梦见有人问你：「你想做哪一路神明？」你想了一夜，没想明白。天亮了，该给个说法了。',
  opts:[
    { txt:'做一方父母神', eff:{阴德:6,威灵:-4,气数:4,信心:5,flag:'dao_fumu',answer:true,
      msg:'你选了做父母神。此后辖内生老病死，你都得管，管到脱不了身。'} },
    { txt:'做一方威灵神', eff:{威灵:8,阴德:-3,气数:-2,香客:1,flag:'dao_weiling',answer:true,
      msg:'你选了做威灵神。辖内从此没人敢作乱，也没人敢跟你说话。'} },
    { txt:'先活着，别的不急', eff:{香火:12,气数:2,阴德:-2,flag:'dao_huo',answer:true,
      msg:'你说先活着。这话听起来没出息，但香火确实稳了些。'} },
  ]},

{ id:'bk_weibo', type:'册目', bookXun:8, once:'bk_weibo', title:'夜 游 神 君', who:'一位姓魏的老山神',
  desc:'一个白发老者拄着青色拐杖来到庙前，自称姓魏。他看了你一眼，说：「你这庙里人气还行，就是没个章法。」他在门槛上坐了一下午，讲了不少山水神道的规矩，走的时候什么都没要。',
  opts:[
    { txt:'请他留下喝一杯', eff:{阴德:3,威灵:2,气数:3,香客:1,rel:{城隍:1},flag:'weibo_friend',answer:true,
      msg:'你留他喝了杯酒。他说了句「山神这行当，最忌讳的是忘了自己管着谁」，然后走了。这话你记了很多年。'} },
    { txt:'只听，不接话', eff:{威灵:1,气数:1,flag:'weibo_heard',answer:true,
      msg:'你听了一下午，没接话。他临走时说：「年轻人话少，是好事，也是坏事。」'} },
    { txt:'送客', eff:{威灵:-2,阴德:-2,answer:false,
      msg:'你送了客。他笑了笑，什么都没说，拄着拐杖下山去了。'} },
  ]},

{ id:'bk_zhengxiang', type:'册目', bookXun:14, once:'bk_zhengxiang', title:'争 香', who:'辖界那边的邻神',
  desc:'邻祠那边来了人，说辖界边上那三座村子历来是他们家的香火地，要你归还。你翻了翻册子——那三座村子，确实在两边都烧过香。',
  opts:[
    { txt:'按册子争', req:{威灵:14}, eff:{威灵:-5,阴德:-2,香火:16,香客:2,信心:3,越界:1,answer:true,
      msg:'你按册子争赢了。三座村子的香归了你，但从此两家的庙祝见面不说话。'} },
    { txt:'划界，各占一半', eff:{香火:6,阴德:3,香客:1,信心:3,rel:{邻神:2},answer:true,
      msg:'你划了界，一家一半。邻神后来送了你一坛酒。'} },
    { txt:'让出去', eff:{香火:-14,香客:-2,阴德:2,威灵:-4,信心:-2,rel:{邻神:3},answer:false,
      msg:'你让了。三座村子的香火从此归邻祠，你辖内的香案冷了一年。'} },
  ]},

{ id:'bk_tielv', type:'册目', bookXun:20, once:'bk_tielv', title:'铁 律', who:'一只修行千年的狐精',
  desc:'它修成了人形，也积了千年功德，辖内百姓都替它求情。它只求一个神职——不求山神，只求一方土地的位子。天上没有明说不许，但你知道那条铁律就在那里。',
  opts:[
    { txt:'破一次例', eff:{阴德:10,威灵:-12,气数:-6,香客:2,信心:6,flag:'tielv_po',answer:true,
      msg:'你替它求了。位子给了，天上什么都没说。但第二个月，你的金身无缘无故裂了一道。'} },
    { txt:'据实以告，铁律不可破', eff:{阴德:4,威灵:8,香客:-1,信心:-2,flag:'tielv_shou',answer:true,
      msg:'你说了那条铁律。它听完，磕了个头，说「知道了」，然后走了。三年后它散尽修为，救了一村的人。'} },
    { txt:'推给城隍去判', eff:{阴德:-2,威灵:-3,香火:-8,flag:'tielv_tui',answer:true,
      msg:'你推给了城隍。城隍判了不许，还顺手参了你一本「推诿」。'} },
  ]},

{ id:'bk_xuncha', type:'册目', bookXun:26, once:'bk_xuncha', title:'城 隍 巡 查', who:'本州城隍爷',
  desc:'城隍巡查辖内山水神祇，到你这里停了。他翻了功德簿，看了香火册，最后抬起头问了一句：「这些年，你替辖内做过什么？」',
  opts:[
    { txt:'一件件报出来', req:{阴德:20}, eff:{阴德:5,威灵:6,香火:18,香客:2,信心:6,rel:{城隍:3},answer:true,
      msg:'你报了两个时辰。城隍听完，在册子上画了个圈，说：「该给你的，一样不少。」'} },
    { txt:'只说「尽本分而已」', eff:{阴德:2,威灵:2,香火:6,rel:{城隍:1},answer:true,
      msg:'你说了句「尽本分」。城隍点点头，走了，什么也没加，什么也没减。'} },
    { txt:'请他看看辖内百姓', req:{香客:12}, eff:{威灵:-2,阴德:4,香火:8,香客:1,信心:7,rel:{城隍:2},answer:true,
      msg:'你说：「功德簿上看不出来的，让他们自己说。」那天来了三百多口人。城隍站了很久。'} },
  ]},

{ id:'bk_tianjie', type:'册目', bookXun:32, once:'bk_tianjie', title:'可 以 上 了', who:'天 上',
  desc:'香火与功德都已够了。神职就在头顶，只等你点头。但那位姓魏的老山神说过：山水神祇往上走一步，脚下的土就薄一寸。',
  opts:[
    { txt:'请天劫下来', req:{香火:120, 阴德:8}, eff:{events:'tianjie',answer:true,
      msg:'你点了头。天上响了一声，那声音辖内每个人都听见了，但谁也没抬头。'} },
    { txt:'再等等', eff:{香火:10,气数:3,阴德:2,信心:3,answer:false,
      msg:'你说再等等。天上什么都没响。你在庙里坐到天亮，觉得脚下的土还厚实。'} },
  ]},

{ id:'bk_daxiangke', type:'册目', bookXun:38, once:'bk_daxiangke', title:'十 万 两', who:'一位年烧十万两香的大香客',
  desc:'他来了第三次。这次他说得很直白：只要你在三年之内替他做成三件事，他就把这一门香火全归你，从此不踏邻祠一步。三件事，他没说是哪三件。',
  opts:[
    { txt:'应下', eff:{香火:60,香客:5,阴德:-10,威灵:-4,信心:4,flag:'daxiangke_ying',answer:true,
      msg:'你应下了。第一件事是让他家的病秧子多活三年，第二件是让对门那家败落，第三件你至今没敢问。'} },
    { txt:'只受香火，不认这件事', req:{阴德:15}, eff:{香火:22,香客:2,阴德:4,威灵:3,信心:5,flag:'daxiangke_ju',answer:true,
      msg:'你说：「香你只管烧，事我不能应。」他愣了很久，最后笑了，说「你这神明有意思」，香火照旧。'} },
    { txt:'不见', eff:{香火:-18,香客:-3,信心:-5,阴德:1,flag:'daxiangke_bujian',answer:false,
      msg:'你没见他。第二天，庙里最大的那口香炉被人抬走了。'} },
  ]},

{ id:'bk_xinxiang', type:'册目', bookXun:44, once:'bk_xinxiang', title:'点 一 炷 心 香', who:'一位远道而来的青衫剑客',
  desc:'他走了很远的路，一家一家地敲门，请辖内山水神灵点燃一炷心香。他说，南边有一洲水土破碎，需要所有山水神祇一起祈福。心香一点，你的功德、气数、甚至香火，都要烧掉一大半。而他只是一个过路的，什么也给不了你。',
  opts:[
    { txt:'点', req:{阴德:25, 气数:50}, eff:{阴德:20,气数:-25,香火:-60,威灵:8,香客:2,信心:8,flag:'xinxiang',answer:true,
      msg:'你点了。那炷香烧了七天七夜，烧掉了你一半的身家。他临走时说了一句：「多谢。」就这两个字。'} },
    { txt:'问一句为什么', eff:{阴德:6,气数:-8,香火:-20,威灵:3,flag:'xinxiang_wen',answer:true,
      msg:'你问了。他说：「因为该做。」你想了想，点了半炷。'} },
    { txt:'不点', eff:{阴德:-12,香火:12,气数:4,信心:-6,flag:'xinxiang_bu',answer:false,
      msg:'你没点。他没说什么，磕了个头，去下一家了。那年南边那一洲，没能修回来。'} },
  ]},
];

/* ===================== 危机与册目注入 ===================== */
function scCrisisCd(s, key){ return (s.flags['cd_'+key]||0); }
function scPushCrisis(s, key){
  if(s.events.some(x=>x.id===key)) return;
  if(s.xun - scCrisisCd(s, key) < 8) return;
  s.events.push({ id:key });
  s.flags['cd_'+key] = s.xun;
}
function scSpawnCrises(s){
  if(s.noAnswerStreak >= 2)      scPushCrisis(s, 'cr_xiangke_pao');
  if(s.res.阴德 <= -10 && s.越界 >= 2) scPushCrisis(s, 'cr_yinci');
  if(s.res.威灵 <= 8)            scPushCrisis(s, 'cr_jingguai');
  if(s.res.气数 <= 20)           scPushCrisis(s, 'cr_jinshen');
  if(s.越界 >= 3)                scPushCrisis(s, 'cr_linshen');
}
function scSpawnBook(s){
  for(const def of SC_EVENTS){
    if(def.type !== '册目') continue;
    if(s.events.some(e=>e.id===def.id)) continue;
    if(def.once && s.flags[def.once]) continue;
    if(s.xun < def.bookXun) continue;
    s.events.push({ id:def.id });
  }
}

/* ===================== 旬循环 ===================== */
/* 点「过此旬」→ 先结算本旬、出中转页，不推进时间、不注入新祈愿 */
function scSettle(){
  const s = state.shenci; if(s.over) return;

  // 回合开始基线（抉择尚未落地）；结算前基线（抉择已落地、被动经营尚未算）
  const ts = s.turnStart || scSnap(s);
  const before = scSnap(s);
  s.settleBefore = before;   // 供结算页内嵌祠务后 scResettle 重算账本（所奏=before-ts，自然=after-before）
  const notes = [];

  // 1) 本旬结算
  const inc = scIncome(s);
  scGain(s, '香火', inc);
  // 脱离根基：每旬香客自然流失（脱根越深流失越快）
  if(s.脱根 > 0 && Math.random() < 0.13 * s.脱根){
    s.香客 = Math.max(0, s.香客 - 1);
    scLog(s, '香火簿上又少了一户。他们没说什么，只是不再来了。', 'bad');
    notes.push('香火簿上又少了一户。');
  }
  // 连续不应：信心持续下滑
  if(s.noAnswerStreak >= 3){
    s.信心 = Math.max(0, s.信心 - 3);
    scLog(s, '辖内开始有人说，这庙里的神明不管事。', 'bad');
    notes.push('辖内开始有人说，这庙里的神明不管事。');
  }
  // 气数：人气养地 + 阴德润泽 + 季节；冲境脱根则持续失血
  // （设计要义：尽职则辖地兴旺，不作为则地荒，越界与动地脉则伤根基）
  const season = scSeason(s);
  let qi = Math.floor(s.香客/8) + Math.max(0, Math.floor(s.res.阴德/35)) - Math.round(s.脱根*1.6);
  if(season==='春') qi += 2; else if(season==='夏') qi += 1;
  else if(season==='秋') qi += 0; else qi -= 1;
  if(s.香客 <= 3) qi -= 2;
  scGain(s, '气数', qi);
  if(s.res.气数 <= 0) s.qiZeroStreak++; else s.qiZeroStreak = 0;
  // 高香火养威灵
  if(s.res.香火 >= 150) scGain(s, '威灵', 1);

  // 2) 积压惩罚（本旬积压生怨）
  if(s.backlog > 0){
    s.backlog--;
    s.信心 = Math.max(0, s.信心 - 3);
    scGain(s, '气数', -2);
    scLog(s, '搁置的祈愿生了怨，辖内气数渐薄。', 'bad');
    notes.push('搁置的祈愿生了怨，辖内气数渐薄。');
  }

  // 3) 账目快照：净 = 所奏（本旬抉择）+ 自然（山水供养/收入/气数回润）
  const after = scSnap(s);
  const ledger = [
    scLedRow('香火', '香火', ts, before, after),
    scLedRow('气数', '气数', ts, before, after),
    scLedRow('功德', '阴德', ts, before, after),
    scLedRow('威灵', '威灵', ts, before, after),
    scLedRow('香客', '香客', ts, before, after),
    scLedRow('信心', '信心', ts, before, after),
  ];
  s.lastSettle = {
    year: scYearOf(s), xun: ((s.xun-1)%12+1), season,
    isLast: (s.xun >= SC_TOTAL_XUN),     // 这一旬就是最后一旬
    ledger, notes,
    backlogLeft: s.backlog,
    income: inc,
    xunStats: Object.assign({应:0,不应:0,搁置:0}, s.xunStats||{}),
  };
  s.settling = true;
  render();
  scFlushFx(s);
}

/* 结算页内嵌祠务（巡/养/请天劫）后，用结算前快照重算账本，避免重复结算副作用。
   玩家在结算页补做事的变动只反映到本旬账本与下一旬起始值，不重跑 scSettle 的随机惩罚。 */
function scResettle(s){
  if(!s.settling || !s.lastSettle || !s.settleBefore) return;
  const ts = s.turnStart || s.settleBefore;
  const b = s.settleBefore;          // 抉择已落地、祠务尚未算
  const after = scSnap(s);           // 含结算页补做的巡/养/请天劫
  s.lastSettle.ledger = [
    scLedRow('香火', '香火', ts, b, after),
    scLedRow('气数', '气数', ts, b, after),
    scLedRow('功德', '阴德', ts, b, after),
    scLedRow('威灵', '威灵', ts, b, after),
    scLedRow('香客', '香客', ts, b, after),
    scLedRow('信心', '信心', ts, b, after),
  ];
  delete s.lastSettle._v;   // 清缓存，让 view() 重新生成账本（否则 _v.ledger 不跟随更新）
  render();
  scFlushFx(s);
}

/* 中转页「入下一旬」→ 真正推进时间、注入新祈愿 */
function scEnterNext(){
  const s = state.shenci; if(s.over || !s.settling) return;
  s.settling = false;
  s.lastSettle = null;
  s.xunStats = { 应:0, 不应:0, 搁置:0 };

  // 1) 推进时间
  s.xun++;
  s.ap = 3;
  s.year = scYearOf(s);
  s.turnStart = scSnap(s);   // 新回合开始基线（资源已承接上旬，抉择尚未落地）

  // 2) 终局
  if(s.xun > SC_TOTAL_XUN){ scEnding(s, scRouteEnding(s)); return; }

  // 3) 注入：危机 + 册目 + 普通祈愿
  const season = scSeason(s);
  scSpawnCrises(s);
  scSpawnBook(s);
  // 每旬奏事多于行动力，逼出「答应哪三桩」的取舍
  let n = 3;
  if(season==='秋') n = 4;
  if(s.香客 >= 14) n += 1;
  n = Math.min(4, n);
  scDealWishes(s, n);

  // 4) 结局预检
  scCheckEndingLive(s);
  if(s.over) return;

  scLog(s, '—— 第 '+scYearOf(s)+' 年 · '+scSeason(s)+' · 第 '+((s.xun-1)%12+1)+' 旬 ——', 'big');
  scBanner('第 '+scYearOf(s)+' 年', '· '+scSeason(s)+' · 第 '+((s.xun-1)%12+1)+' 旬');
  render();
  scFlushFx(s);
}

/* 兼容旧调用（测试/脚本）：结算并立即进入下一旬 */
function scAdvance(){ scSettle(); scEnterNext(); }

/* ── 本旬是否已尽（无事可做）──────────────────────────────
   行动力是唯一门票：ap 归零后，解祈愿 / 巡山 / 养气 / 请天劫 全部失效，
   此时「过此旬」已不是选择、而是必然的结算 —— 必然的事不该再要玩家点一下。
   另一种：祈愿已空且三项主动动作皆不可用（罕见），同样无事可做。 */
function scCanTianjie(s){
  // 请天劫需 1 点、应天劫再需 1 点，故须 ap>=2；否则请了天劫却无力应劫，天劫会卡在队列里
  if(s.rank >= SC_RANK_MAX || s.ap < 2) return false;
  const need = SC_ASCEND_NEED[s.rank+1]; if(!need) return false;
  return s.res.香火>=need.香火 && s.res.阴德>=need.阴德 && s.res.气数>=need.气数;
}
function scXunExhausted(s){
  if(!s || s.over || s.settling) return false;
  if(s.ap <= 0){
    // 队列里若还压着天劫，不自动结算 —— 天劫是大事，不能被账本顺手跳过
    if(s.events.some(function(e){ return e.id === 'tianjie'; })) return false;
    return true;
  }
  if(s.events.length === 0){
    // 事件清空即结 — 「过此旬」是必然操作，不该再要玩家点（用户 2026-09-04 明令）
    return true;
  }
  return false;
}
/* 本旬已尽 → 自动出账本中转页。留一拍让飘字与叙事先落地，免得刚做完的结果被吞 */
function scMaybeAutoSettle(s){
  if(s.settling) return;          // 已在结算，不重复触发（用户 2026-09-04：去 900ms 闪一下，直接跳）
  if(!scXunExhausted(s)) return;
  scSettle();
}

/* 主动请天劫：够格时玩家可随时选择「再往上走一步」——诱惑常在，代价是自找的 */
function scRequestTianjie(){
  const s = state.shenci; if(s.over) return;
  if(!scCanTianjie(s)) return;
  s.ap--;
  s.events.push({ id:'tianjie' });
  scLog(s,'你点向头顶。天上响了一声，辖内每个人都听见了，但谁也没抬头。','big');
  SFX.click(); render();
  scMaybeAutoSettle(s);
}

/* ===================== 主动养护（香火 → 辖地） =====================
   神明不能出手，但可以「走一走」「润一润」：把香火换回地气，
   这是玩家唯一主动的支出出口，也是气数见底时的自救手段。 */
function scPatrol(){
  const s = state.shenci; if(s.over) return;
  if(s.ap<=0 || s.res.香火<8) return;
  s.ap--; scGain(s,'香火',-8); scGain(s,'气数',5);
  s.信心 = Math.min(100, s.信心+2);
  scLog(s,'你化作凡人，在辖内走了一旬。田埂、渡口、庙前那棵老树，都看了一遍。','');
  if(!s.fxQueue) s.fxQueue = [];
  s.fxQueue.push({k:'香火',v:-8}); s.fxQueue.push({k:'气数',v:5});
  SFX.click(); render(); scFlushFx(s);
  scMaybeAutoSettle(s);   // 行动力耗尽 → 自动结算
  if(s.settling) scResettle(s);   // 已在结算页做祠务 → 重算账本
}
function scNourish(){
  const s = state.shenci; if(s.over) return;
  if(s.ap<=0 || s.res.香火<20) return;
  s.ap--; scGain(s,'香火',-20); scGain(s,'气数',11); scGain(s,'威灵',-2);
  scLog(s,'你把攒下的香火化进地脉。辖内的草木，来年会长得更好些。','');
  if(!s.fxQueue) s.fxQueue = [];
  s.fxQueue.push({k:'香火',v:-20}); s.fxQueue.push({k:'气数',v:11});
  SFX.click(); render(); scFlushFx(s);
  scMaybeAutoSettle(s);   // 行动力耗尽 → 自动结算
  if(s.settling) scResettle(s);   // 已在结算页做祠务 → 重算账本
}

/* ===================== 结局 ===================== */
const SC_ENDINGS = {
  zhengshen: { g:'S', t:'正 神',
    d:'你受封正神，执掌千里地界，护水土、扛文运，享万民香火。\n\n你走过很远的路，远到有时候要很费力，才想得起最初那座小庙的样子。但你每次想起来，都还记得。\n\n辖内的人说，这位神明很怪——位子越高，来得越勤。',
    poem:'千年香火一朝新，犹记当年一炷心。' },
  shanjun: { g:'A', t:'山 君',
    d:'你做到一山之主，辖三十余山头，一方水土都服你。\n\n庙修过三次，一次比一次大。只是上山的路也越修越宽，宽到山民上香时，很少再像从前那样，站下来跟你说几句话。\n\n你想，这大概就是往上走的代价。',
    poem:'山有木兮木有枝，心悦君兮君已知。' },
  shoutu: { g:'B', t:'守 土',
    d:'你没有再往上走。位子不高，香火不算旺，但你守着这一方水土，一守就是很多年。\n\n辖内每一户人家的红白喜事，你都在。谁家的田今年收成好，谁家的孩子考中了，你比谁都先知道。\n\n有人替你惋惜，说你本来可以更高。你没接这话——脚下的土还厚实，这比什么都强。',
    poem:'不须更上层楼去，自有青山在脚边。' },
  tuogen: { g:'C', t:'脱 根',
    d:'你上去了。位阶一次比一次高，金身一次比一次亮。\n\n可不知从哪一年起，山下的炊烟你渐渐看不清，辖内谁家添了丁、谁家走了人，你也渐渐不知道了。有天你低头看了一眼，发现脚下的土已经薄得几乎没有。\n\n你成了很高很大的神明，只是没有地方可回了。',
    poem:'更上一层楼，回首不见人。' },
  chenjiang: { g:'C', t:'沉 江',
    d:'神位被废。金身被打碎，抛进了江里。\n\n香火断了，庙拆了，辖内的册子上再没有你的名字。你在江底躺了很多年，看着一代又一代人从桥上走过去。\n\n很多年后，有个孩子在江边捡到一块碎金，拿回家给他娘看。他娘看了很久，说：好像是庙里的东西。',
    poem:'金身沉江底，香火付东流。' },
  yinci: { g:'D', t:'淫 祠',
    d:'朝廷判你淫祠，庙拆，名除。\n\n你在废墟上坐了很多年。偶尔还有人偷偷来放一炷香，放完就走，走得很快，像做贼。\n\n你想说点什么，但已经没有人听得见了。',
    poem:'名不正则言不顺，香火虽在已无人。' },
  xiaosan: { g:'D', t:'消 解',
    d:'香客散尽，庙门紧闭，神像落满了灰。\n\n你没有死，只是慢慢没人记得了。风从破窗里吹进来，吹动香案上一层薄薄的灰。\n\n神明不是被打倒的，是被忘掉的。',
    poem:'香冷灰深人不至，一庙风雨自消磨。' },
};

function scRouteEnding(s){
  const init = SC_DIFF[s.diff].香客;
  if(s.香客 <= 1) return 'xiaosan';
  if(s.res.气数 <= 8 && s.香客 <= Math.ceil(init*0.5)) return 'chenjiang';
  // 淫祠：香火还在、人还来，可来的都是怕你的（原著：名不正则言不顺，非无人祭祀）
  if(s.res.阴德 < -8 && s.香客 >= Math.ceil(init*0.35) && s.res.威灵 >= 8) return 'yinci';
  // 脱根：爬得高，脚下的土却没了。以「当前上限」而非初始值为尺 ——
  // 位子越高，辖内本该越兴旺，你却连守住这一方水土都做不到（非败于人，败于离土）
  if(s.rank >= 2 && s.香客 <= Math.ceil(scXkCap(s)*0.4)) return 'tuogen';
  if(s.rank >= 3 && s.香客 >= init && s.res.阴德 >= 38) return 'zhengshen';
  if(s.rank >= 2) return 'shanjun';
  if(s.香客 >= init && s.res.气数 >= 50) return 'shoutu';
  if(s.rank >= 1 && s.香客 >= Math.ceil(init*0.7)) return 'shoutu';
  return 'xiaosan';
}

function scCheckEndingLive(s){
  if(s.over) return;
  // 气数见底连续三旬 → 神位不保（留三旬缓冲，不瞬死）
  if(s.qiZeroStreak >= 3){ scEnding(s, 'chenjiang'); return; }
  if(s.res.香火 <= 0 && s.res.气数 <= 0 && s.香客 <= 1){ scEnding(s, 'chenjiang'); return; }
  // 脱根：居高位而辖内已无人问津。这一刻就该结束，不必等四十八旬 ——
  // 香客流失是雪崩式的，终局判定抓不住那个「回头看，山下空了」的瞬间
  if(s.rank >= 2 && s.香客 > 0 && s.香客 <= Math.ceil(scXkCap(s)*0.4)){ scEnding(s, 'tuogen'); return; }
  if(s.香客 <= 0){ scEnding(s, 'xiaosan'); return; }
  if(s.xun > SC_TOTAL_XUN){ scEnding(s, scRouteEnding(s)); return; }
}

function scEnding(s, key){
  s.over = true; s.ending = key;
  scLog(s, '终局 · '+SC_ENDINGS[key].t, 'big');
  scBanner(SC_ENDINGS[key].t, SC_ENDINGS[key].g + ' 等', '');
  render();
}

/* ===================== 叙事节拍 ===================== */
const SC_MOOD = {
  春:['山下在插秧，一行一行，插得很直。','庙前的桃花开了，风吹一夜，落了满阶。','有人在庙外续了半炷香，站了一会儿，走了。'],
  夏:['蝉叫得人心烦。你在庙里坐了一整天。','河水涨了，淹了下游半片滩地。','夜里下了一场雨，打在瓦上，像有人在敲门。'],
  秋:['稻子熟了，辖内飘着新米的味道。','有人来还愿，抬着一整头猪。','天高得很，山下的炊烟直直地往上走。'],
  冬:['庙里冷。香客来得少，来得都很急。','下了三天雪，山都白了。','门槛外有一串脚印，来了又走了。'],
};
function scMoodLine(s){
  const se = scSeason(s);
  const arr = SC_MOOD[se];
  let line = arr[(s.xun + s.香客) % arr.length];
  if(s.脱根 >= 2) line = '你又往上走了一步。回头看时，山下的灯火小得像几点火星。';
  if(s.香客 <= 3) line = '庙里很静。静得能听见香灰落下的声音。';
  if(s.noAnswerStreak >= 3) line = '好些日子没应过一件事了。供桌上的果子，放得发了霉。';
  return line;
}

/* ===================== 入口 ===================== */
function openShenci(){
  try{
    SFX.set(true); SFX.click();
    scFXClear(); scFXInit();
    state = { phase:'shenci', shenci:newScState('shan', difficulty) };
    state.shenci.pick = 'pick';
    render();
  }catch(e){ console.error('[shenci] openShenci failed:', e); }
}
function scPickDomain(dom){
  try{
    const s = state.shenci; s.dom = dom; SFX.click(); render();
  }catch(e){ console.error('[shenci] scPickDomain failed:', e); }
}
function scPickDiff(d){
  try{
    const s = state.shenci;
    const ns = newScState(s.dom, d);
    ns.pick = 'pick';
    state.shenci = ns;
    SFX.click(); render();
  }catch(e){ console.error('[shenci] scPickDiff failed:', e); }
}
function scDealWishes(s, n){
  for(let i=0;i<n;i++){
    const pool = SC_EVENTS.filter(e=>e.type==='祈愿'
      && (!e.dom || e.dom===s.dom)
      && (!e.once || !s.flags[e.once])
      && (!e.gate || e.gate(s))
      && !s.events.some(x=>x.id===e.id));
    if(!pool.length) break;
    s.events.push({ id:pool[Math.floor(Math.random()*pool.length)].id });
  }
}
function scStart(){
  try{
    const s = state.shenci;
    s.pick = null;
    scDealWishes(s, 2);
    s.turnStart = scSnap(s);   // 回合开始基线（首旬）
    scLog(s, '你于一隅受香，位卑言轻。山水之间，从此多了一双眼睛。', 'big');
    scBanner('受 香', '一方水土 · 一位末流神明', '');
    SFX.click(); render();
  }catch(e){ console.error('[shenci] scStart failed:', e); }
}


/* 终局总览（PC 端定义在渲染层，移植时按行号切分会漏掉，故在此补录） */
function scRecap(s){
  const init = SC_DIFF[s.diff].香客;
  return '受封 '+SC_TOTAL_XUN+' 旬　·　位至 '+scRankName(s)
       + '　·　香客 '+init+' → '+s.香客+' 户'
       + '　·　阴德 '+s.res.阴德
       + '<br>脱离根基 '+s.脱根+' 分　·　越界 '+s.越界+' 次　·　辖内气数 '+s.res.气数;
}

/* ===================== 视图快照 =====================
   key 一律 ASCII（WXSS 拒绝中文选择器），中文仅作值 */
function view(){
  const s = state && state.shenci;
  if(!s) return { ready:false };
  const out = { ready:true, phase: s.over ? 'over' : (s.pick ? 'pick' : (s.settling ? 'settle' : 'main')) };

  if(out.phase === 'pick'){
    out.pick = {
      dom: s.dom,
      intro: ['你是一位末流的山水神明，辖一方水土，享一方香火。',
              '你不能下山，不能出手，只能应，或不应。',
              '香火养你，也绑住你；往上走一步，脚下的土就薄一寸。'],
      cards: ['shan','shui'].map(k=>({
        key:k, sealImg:SC_SEAL_IMG[k], name:SC_DOMAIN[k].name,
        desc:(SC_DOMAIN[k].desc||'').split('\n'),
        origin:(SC_DOMAIN[k].origin||'').split('\n'),
        on:(s.dom===k)
      })),
      diffs: ['easy','normal','hard'].map(k=>({ key:k, name:SC_DIFF[k].name, on:(s.diff===k) })),
    };
    return out;
  }

  const dom = SC_DOMAIN[s.dom];
  out.head = {
    sealImg: SC_SEAL_IMG[s.dom], domName: dom.name,
    rankName: scRankName(s), rankDesc: SC_RANKS[s.dom][s.rank].desc,
    year: scYearOf(s), xun: ((s.xun-1)%12+1), season: scSeason(s),
    left: (SC_TOTAL_XUN - s.xun + 1),
    income: scIncome(s), faith: s.信心,
    ap: s.ap, apMax: 3, backlog: s.backlog,
  };
  out.res = [
    { k:'xianghuo', n:'香火', v:s.res.香火, ratio:scResRatio('香火',s), ico:SC_RES_ICO.xianghuo, cls:s.res.香火<20?'warn':'' },
    { k:'qishu',    n:'气数', v:s.res.气数, ratio:scResRatio('气数',s), ico:SC_RES_ICO.qishui,  cls:s.res.气数<20?'warn':(s.res.气数>=60?'good':'') },
    { k:'yinde',    n:'阴德', v:s.res.阴德, ratio:scResRatio('阴德',s), ico:SC_RES_ICO.yinde,  cls:s.res.阴德<0?'warn':(s.res.阴德>=30?'good':'') },
    { k:'weiling',  n:'威灵', v:s.res.威灵, ratio:scResRatio('威灵',s), ico:SC_RES_ICO.weiling, cls:'' },
    { k:'xiangke',  n:'香客', v:s.香客+' 户', ratio:scResRatio('香客',s), ico:SC_RES_ICO.xiangke, cls:s.香客<=3?'warn':(s.香客>=12?'good':'') },
  ];
  out.mood = scMoodLine(s);
  out.apOut = s.ap <= 0;
  out.wishes = [];
  out.wishIndex = 1;            // 主舞台一次只呈一桩：始终展示首桩
  out.wishTotal = s.events.length;
  if(s.events.length){
    const ev = s.events[0];
    const def = scEventDef(ev.id);
    if(def){
      out.wishes.push({
        idx: 0, id: ev.id, title: def.title, who: def.who, img: scWishImg(ev.id),
        desc: (def.desc||'').split('\n'),
        cls: def.type==='危机' ? 'urgent' : (def.type==='册目' ? 'rite' : ''),
        opts: def.opts.map((opt, oi)=>{
          const rq = scOptReqOk(s, opt);
          return { oi:oi, txt:opt.txt, ok: rq.ok && !out.apOut,
                   why: rq.ok ? (out.apOut?'行动力已尽':(rq.why||'')) : (rq.why||''),
                   ico: evOptIco(def.type) };
        }),
      });
    }
  }
  out.actions = {
    canPatrol:  s.ap>0 && s.res.香火>=8,
    canNourish: s.ap>0 && s.res.香火>=20,
  };
  out.ciwuOpen = !!s.ciwu;

  const next = s.rank>=SC_RANK_MAX ? null : SC_RANKS[s.dom][s.rank+1];
  const need = s.rank>=SC_RANK_MAX ? null : SC_ASCEND_NEED[s.rank+1];
  const initXk = SC_DIFF[s.diff].香客;
  out.ciwu = {
    rankName: scRankName(s),
    rankDesc: SC_RANKS[s.dom][s.rank].desc,
    tuogen: s.脱根, yuejie: s.越界,
    cap: scXkCap(s),
    next: next && need ? {
      name: next.name,
      need: [ { n:'香火', v:need.香火, ok:s.res.香火>=need.香火 },
              { n:'阴德', v:need.阴德, ok:s.res.阴德>=need.阴德 },
              { n:'气数', v:need.气数, ok:s.res.气数>=need.气数 } ],
      qualified: s.res.香火>=need.香火 && s.res.阴德>=need.阴德 && s.res.气数>=need.气数,
      canAsk: s.ap>=2,        // 请天劫 1 点 + 应天劫 1 点，缺一则天劫会卡在队列
    } : null,
    xkDelta: (s.香客-initXk>=0?'+':'') + (s.香客-initXk),
    log: s.log.slice(0,26).map(l=>({ t:l.t, cls:l.cls||'' })),
    trail: s.trail.slice(-12).reverse().map(t=>({ t:t.t, c:t.c })),
  };

  if(out.phase === 'over'){
    const e = SC_ENDINGS[s.ending];
    out.ending = {
      key: s.ending, g: e.g, t: e.t,
      d: (e.d||'').split('\n'), poem: e.poem||'',
      recap: scRecap(s).split('<br>'),
    };
  }

  if(out.phase === 'settle' && s.lastSettle){
    const st = s.lastSettle;
    // 缓存视图对象并保持同一引用：否则每次 setData 都会下发新对象，
    // WXML 节点被重建，账本入场动效会被反复重放（表现为整页闪烁）
    if(!st._v){
      const xs = Object.assign({应:0,不应:0,搁置:0}, st.xunStats||{});
      st._v = {
        year: st.year, xun: st.xun, season: st.season,
        isLast: st.isLast,
        ledger: st.ledger.map(l=>({
          k:l.k,
          evt: l.evt, nat: l.nat, net: l.net,
          cls: l.net>0 ? 'up' : (l.net<0 ? 'down' : ''),
          netTxt: (l.net>0?'+':'') + l.net,
          evtTxt: (l.evt>0?'+':'') + l.evt,
          natTxt: (l.nat>0?'+':'') + l.nat,
          ico: SC_RES_ICO[SC_ST_ICO[l.k]] || '',
        })),
        notes: st.notes,
        backlogLeft: st.backlogLeft,
        income: st.income || 0,
        stats: [
          { n:'应',  v:xs.应,   cls:'up',   ico:SC_RES_ICO[SC_STAT_ICO['应']] },
          { n:'不应', v:xs.不应, cls:'down', ico:SC_RES_ICO[SC_STAT_ICO['不应']] },
          { n:'搁置', v:xs.搁置, cls:'',     ico:SC_RES_ICO[SC_STAT_ICO['搁置']] },
          { n:'香火收入', v:'+'+(st.income||0), cls:'gold', ico:SC_RES_ICO[SC_STAT_ICO['香火收入']] },
        ],
      };
    }
    out.settle = st._v;
    out.canCiwu = s.ap>0 && (s.res.香火>=8 || s.res.香火>=20 || scCanTianjie(s));
  }

  out.fxBanners = FXB.slice();
  out.fxFloats = FXF.slice();
  return out;
}

module.exports = {
  open: openShenci, setHook, view, getState: ()=>state,
  scFloatSlot,
  pickDomain: scPickDomain, pickDiff: scPickDiff, start: scStart,
  resolve: scResolveEvent, skip: scSkipEvent, settle: scSettle, enterNext: scEnterNext, advance: scAdvance,
  patrol: scPatrol, nourish: scNourish, tianjie: scRequestTianjie,
  toggleCiwu, SC_DIFF, SC_DOMAIN,
};
