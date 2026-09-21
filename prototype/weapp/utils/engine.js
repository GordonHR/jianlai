'use strict';
/* 剑来 · 卡牌对战 —— 小程序战斗引擎（无 DOM 版）
 * 移植自 game.js，重构点：
 *   - 所有界面渲染改为经 emit(state) 通知页面 setData；
 *   - ask/showChoice/showMulti/chooseTarget 改为基于 state.modal / state.await 的 Promise；
 *   - noDodgeFrom 由 Set 改为数组（便于序列化）；
 *   - SFX / 粒子特效降级为无副作用实现（可后续接 wx.vibrate / 动画）。
 */
const D = require('./data.js');
const FACTIONS = D.FACTIONS, HOSTILE = D.HOSTILE, CHARS = D.CHARS, REALM_LIMIT = D.REALM_LIMIT,
      TALENT_DESC = D.TALENT_DESC, CARD_SIG = D.CARD_SIG, CARD_KIND = D.CARD_KIND,
      cardSig = D.cardSig, cardCls = D.cardCls, cardPoint = D.cardPoint,
      SHOUTS = D.SHOUTS, pickShout = D.pickShout, MODE_META = D.MODE_META, BG_LIST = D.BG_LIST;

let state = null;
let emit = function(){};
let speedMul = 1;
let cardUid = 0;
let fxId = 0;
let pendingChoice = null;
let pendingMulti = null;
let pendingTarget = null;

// 小程序无 WebAudio → 用轻触觉补偿关键节拍（PC 端走 24 条 WebAudio 音效）
// vb() 复用 sect/shenci/baofuzhai/profile 的同一范式；wx 缺失时（Node 测试环境）自动降级为无副作用。
function vb(t){ try{ if (typeof wx !== 'undefined' && wx.vibrateShort){ wx.vibrateShort({ type:(t||'light') }); } }catch(e){} }
const SFX = {
  set(){}, isOn(){ return false; },
  click(){ vb('light'); }, draw(){ vb('light'); }, turn(){ vb('medium'); }, slash(){ vb('medium'); }, hit(){ vb('medium'); },
  heal(){ vb('light'); }, die(){ vb('heavy'); }, win(){ vb('heavy'); }, lose(){ vb('heavy'); }, breakout(){ vb('medium'); },
  execute(){ vb('heavy'); }, swordrain(){ vb('medium'); }, mist(){ vb('light'); },
};

const sleep = ms => new Promise(r => setTimeout(r, Math.max(0, Math.round(ms * speedMul))));

// 连击总开关（供平衡采样对照用；默认开启）
const COMBO_ON = true;

/* ===================== 包袱斋接线（跨分包） =====================
 * 本引擎在主包，包袱斋模块在 packageRef 分包——主包引不到分包，不能 require。
 * 故：装配时由包袱斋把 eff 列表预计算进存档 loadout 字段，此处只读、零数据复制。
 * 常量 BF_SETTLE 与 packageRef/utils/baofuzhai.js 的 BF_COIN_WIN / BF_COIN_LOSE 同值，
 * 两处分包互引被禁无法共享，改动请同时改两处（_selftest 有一致性断言）。 */
const BF_SETTLE = { win:18, lose:6 };
const BF_KEY = 'jianlai_baofu';
function storeGet(k){
  try{
    if(typeof wx!=='undefined' && wx.getStorageSync) return wx.getStorageSync(k);
    return (typeof global!=='undefined' && global.__ls && global.__ls[k]);
  }catch(e){ return null; }
}
function storeSet(k, v){
  try{
    if(typeof wx!=='undefined' && wx.setStorageSync){ wx.setStorageSync(k, v); return; }
    if(typeof global!=='undefined'){ global.__ls = global.__ls || {}; global.__ls[k] = v; }
  }catch(e){}
}
function bfReadSave(){
  try{
    let o = storeGet(BF_KEY);
    if(typeof o === 'string') o = JSON.parse(o);
    if(!o || typeof o!=='object' || o.v!==2) return null;
    return o;
  }catch(e){ return null; }
}
/* 取「已装配的法宝/印记」eff 列表（包袱斋预计算写入） */
function bfLoadout(){
  const o = bfReadSave();
  return (o && Array.isArray(o.loadout)) ? o.loadout : [];
}
/* 一局终了结账：读档 → 加雪花钱（先抵赊欠）→ 写回。与 PC baofuzhai.bfAddCoin 同口径。 */
function bfSettle(win){
  let o = bfReadSave();
  if(!o) o = { v:2, coin:0, debt:0 };          // 首次：立个钱袋（其余字段由包袱斋 bfLoad 补全）
  const gain = win ? BF_SETTLE.win : BF_SETTLE.lose;
  let left = gain, pay = 0;
  if((o.debt|0) > 0){ pay = Math.min(o.debt|0, left); o.debt = (o.debt|0) - pay; left -= pay; }
  o.coin = Math.max(0, (o.coin|0) + left);
  storeSet(BF_KEY, JSON.stringify(o));
  return { gain:gain, pay:pay, net:gain-pay, coin:o.coin, debt:o.debt };
}

/* ===================== 工具 ===================== */
function isFlagship(p){ return p.flagship === true; }
function talentOf(p){ return isFlagship(p) ? null : (p.talent || null); }

function buildDeck(){
  const lib = [
    ['attack','剑气',null,20], ['dodge','守心',null,16], ['heal','丹药',null,8], ['wine','饮者',null,5],
    ['trick','论道','duel',4], ['trick','万剑归宗','wanjian',2], ['trick','蛮荒入侵','nanman',2],
    ['trick','破阵','pozhen',3], ['trick','借物','jiewu',3], ['trick','天劫','tianjie',1],
    ['trick','读书','dushu',3], ['trick','炼器','lianqi',2],
    ['equip','本命飞剑','feijian',4],
  ];
  const deck = [];
  for (const [type,name,sub,count] of lib){
    for (let i=0;i<count;i++) deck.push({ uid:++cardUid, type, name, sub:sub||null });
  }
  return D.shuffle(deck);
}

function playerById(id){ return state.players.find(p=>p.id===id); }
function current(){ return state.players[state.current]; }
function alivePlayers(){ return state.players.filter(p=>p.alive); }
function aliveOthers(p){ return state.players.filter(q=>q.alive && q.id!==p.id); }
function hasAlly(pl){ return state.players.some(q=>q.alive && q.id!==pl.id && q.faction===pl.faction); }
function isAI(p){
  if(state && state.auto) return true;                    // 托管：人类座位一并交给 AI 代打
  if(state.mode==='ai')    return p.id !== state.human;
  if(state.mode==='siege') return p.side === 'foe';
  if(state.mode==='boss')  return p.side === 'boss';
  return false;
}
/* 人类座位（不看托管标记）：托管时仍要认出「这是谁的牌」，以便继续亮牌给玩家看 */
function isHumanSeat(p){
  if(!state || !p) return false;
  if(state.mode==='ai')    return p.id === state.human;
  if(state.mode==='siege') return p.side !== 'foe';
  if(state.mode==='boss')  return p.side !== 'boss';
  return true;                                            // 热座：全员都是人
}
/* 托管观战态：AI 代打，但手牌照常摊开（不可点） */
function isTrusteeView(p){ return !!(state && state.auto) && isHumanSeat(p); }
/* 阵营对位：以 mode 决定"我方"判定（与 PC game.js 对齐） */
function isMyTeam(pl){
  const me = state.players.find(p=>p.id===state.human) || state.players[state.current];
  if(!me || pl.id===me.id) return true;
  if(state.mode==='siege') return me.side==='ally' && pl.side==='ally';
  if(state.mode==='boss')  return me.side==='hero' && pl.side==='hero';
  if(state.mode==='ai')    return me.faction && pl.faction===me.faction;
  return false;                                  // hot / 其他：单挑
}
function hasCard(p,type){ return p.hand.some(c=>c.type===type); }
function countCard(p,type){ return p.hand.filter(c=>c.type===type).length; }
function findCard(p,type){ return p.hand.find(c=>c.type===type); }
function removeFromHand(p,card){ const i=p.hand.indexOf(card); if(i>=0) p.hand.splice(i,1); }
function discardCard(p,card){ removeFromHand(p,card); state.discard.push(card); }
function draw(p,n){
  let got=0;
  for(let i=0;i<n;i++){
    if(state.deck.length===0){ if(state.discard.length===0) break; state.deck=D.shuffle(state.discard.splice(0)); }
    p.hand.push(state.deck.pop()); got++;
  }
  if(got>0) pendingFx.push({ id:p.id, type:'draw', amt:got });
  return got;
}
function log(s, cls){ state.log.push({ t:s, c:cls||'' }); if(state.log.length>400) state.log.shift(); }
function realmLimit(p){ return REALM_LIMIT[p.realm] || 5; }
function handLimit(p){ let n = REALM_LIMIT[p.realm] || 5; if(p.equip) n += 1; n += sumK(p,'hand'); return n; }
function attackLimit(p){
  let n = 1;
  if(p.equip) n += 1;
  if(p.key==='米裕' || p.key==='齐廷济') n += 1;
  if(p.isBoss) n += 1;
  if(state && (state.mode==='boss' || state.mode==='siege') && p.side!=='foe' && p.side!=='boss') n += 1;
  n += sumK(p,'atkLimit');
  return n;
}
function isBaizeBlocked(t){ return t.key==='baize'; }

/* ===================== 技能引擎（与 PC game.js 对齐） =====================
 * 说明：PC 端 distance/nodist/range 依赖「座次距离判定」，本引擎不强制攻击距离，
 * 故 nodist/range 在 mini 程序中视为被动常驻（不影响默认「任意目标可击」手感）。 */
/* 角色技 + 包袱斋随身之物（extraSkills，见顶部「包袱斋接线」）。
   与 PC game.js skillsOf 同规则：必须合并，否则小程序端「买了不生效」。 */
function skillsOf(p){
  const base = (D.SKILLS && p && D.SKILLS[p.key]) || [];
  const ex = (p && p.extraSkills) || null;
  return (ex && ex.length) ? base.concat(ex) : base;
}
function condOk(p, c, t){
  if(!c) return true;
  if(typeof c === 'string'){
    switch(c){
      case 'mang':  return !!t && t.faction==='蛮荒天下';
      case 'ru':    return !!t && t.faction==='中土文庙';
      case 'qing':  return !!t && t.faction==='青冥天下';
      case 'lotus': return !!t && t.faction==='莲花天下';
      case 'far':   return !!t && isFar(p, t);
      case 'third': return !!p && (p._atkThisTurn||0)>=3;
      case 'low':   return !!p && p.hp<=1;
      case 'hurt':  return !!p && p.hp<p.maxHp;
    }
    return true;
  }
  if(c.with) return state.players.some(q=>q.alive && q.id!==p.id && (q.key===c.with || q.name===c.with));
  return true;
}
function usedFlag(p, s){ const b=s.n||s.k; if(s.o==='turn') return !!p['_sk_'+b+'_r'+state.round]; return !!p['_sk_'+b]; }
function markUsed(p, s){ const b=s.n||s.k; if(s.o==='turn') p['_sk_'+b+'_r'+state.round]=1; else p['_sk_'+b]=1; }
function sumK(p, k, t){ if(!p) return 0; let v=0; for(const s of skillsOf(p)){ if(s.k!==k) continue; if(s.o==='once'&&usedFlag(p,s)) continue; if(!condOk(p,s.c,t)) continue; v+=(s.v||0); } return v; }
function hasK(p, k, t){ if(!p) return false; for(const s of skillsOf(p)){ if(s.k!==k) continue; if(s.o==='once'&&usedFlag(p,s)) continue; if(condOk(p,s.c,t)) return true; } return false; }
function firstK(p, k, t){ if(!p) return null; for(const s of skillsOf(p)){ if(s.k!==k) continue; if(s.o==='once'&&usedFlag(p,s)) continue; if(condOk(p,s.c,t)) return s; } return null; }
function equipUpOf(p){ return sumK(p,'equipUp'); }
function distOf(a,b){ if(!state||!state.players.length) return 1; const n=state.players.length; const d=Math.abs(a.id-b.id); return Math.min(d, n-d); }
function isFar(p,t){ if(hasK(p,'nodist')) return false; return distOf(p,t) > (1+sumK(p,'range')); }
function auraAtk(p, t){
  let v=0;
  if(!state||!state.players) return 0;
  for(const q of state.players){
    if(!q.alive || q.id===p.id) continue;
    for(const s of skillsOf(q)){
      if(s.k!=='auraAtk') continue;
      if(s.c==='faction' && q.faction!==p.faction) continue;
      if(!condOk(q, s.c, t)) continue;
      v += (s.v||0);
    }
  }
  return v;
}
function immuneTo(t, kind){ const s=firstK(t,'immune'); if(!s) return false; const v=s.v; return v==='all'||v==='lang'||v===kind; }

function newStats(){ return { kills:0, dmg:0, taken:0, heal:0 }; }
function makePlayer(key, id, side){
  let c = CHARS[key];
  if(!c){
    const alt = Object.keys(CHARS).find(k=>CHARS[k].name === key);
    if(alt){ key = alt; c = CHARS[key]; }
  }
  if(!c){ c = CHARS.chenpingan; key = 'chenpingan'; }
  /* 座位号：全局递增的入场序，所有模式/siege 新生敌人/boss 都拿到唯一号
     ——绝不复用，绝不重号；阵亡、离场、被替换都保留旧号 */
  let seatNo = 0;
  if(state){
    state.seatCounter = (state.seatCounter|0);
    state.seatCounter++;
    seatNo = state.seatCounter;
  }
  return {
    id, key, side:side||null,
    name:c.name, faction:c.faction,
    hp:c.hp, maxHp:c.hp, realm:c.realm,
    hand:[], equip:null, alive:true,
    skills: c.skills || [],
    wineActive:false, baiyeBonus:0, noDodgeFrom:[],
    caociUsed:false, chenqingduUsed:false, lisanTrickUsed:false,
    flagship: c.flagship === true, talent: c.talent || null,
    lifestealUsed:false, wuweiUsed:false, jiyuanUsed:false, fengmangUsed:false,
    attackUsed:0, stats:newStats(),
    // 连击：同一回合内每成功命中一次即累加；第 2 次起每层 +1 伤害（上限 +2）
    hitThisTurn:0, combo:0,
    seatNo,
  };
}

const pendingFx = [];

/* ===================== 启动对局 ===================== */
function startGame(keys, mode){
  mode = mode || 'hot';
  state = {
    phase:'game', mode, human:0,
    deck:buildDeck(), discard:[], current:0, round:1, tphase:'draw',
    await:null, busy:false, log:[], over:false, win:false,
    winner:null, winnerId:-1, resultTitle:'',
    auto:false,            // 托管：开则人类座位也由 AI 代打
    sel:keys.slice(),
    wave:0, maxWave:5, pressureRound:0,
    bgIdx:0, shout:null, banner:null, flash:null, popup:null, modal:null,
    fx:[],
    lastPlay:null,   // 视图字段：最近一次出牌/技能名（供对战页舞台虚拟卡显示）
    seatCounter:0,   // 座位号全局递增（每 makePlayer 自增一次，绝不复用）
  };
  const players = keys.map((k,i)=>makePlayer(k, i, null));
  state.players = players;

  /* 包袱斋：随身法宝与悟道印记随我方入场（群雄论剑为同席切磋，不带私物）。
     在设 side 之前按 mode 判定——siege/boss 初始全员同阵营，等价于全注入；
     与 PC game.js 的 injectLoadout 同一纪律（PC 原先写在设 side 之前，已同步修正）。 */
  const LOADOUT = bfLoadout();
  if(LOADOUT.length && mode!=='hot'){
    players.forEach(function(p){
      if(mode==='siege' || mode==='boss') p.extraSkills = LOADOUT.slice();
      else if(mode==='ai' && p.id===0)    p.extraSkills = LOADOUT.slice();
    });
  }

  if(mode==='siege'){
    players.forEach(p=>{ p.side='ally'; });
    state.human = 0;
    players.forEach(p=>draw(p,4));
    state.log = [];
    log('蛮荒叩关，剑气长城告急——守住五波！', 'sys');
    players.forEach(p=>draw(p,2));
    nextWave();
    runTurn(true);
    return;
  }
  if(mode==='boss'){
    const BOSS_POOL = ['托月山','龙君','zhoumi','zhoumi','托月山'];
    const bossKey = BOSS_POOL[Math.floor(Math.random()*BOSS_POOL.length)];
    const boss = makePlayer(bossKey, players.length, 'boss');
    boss.maxHp = Math.round(boss.maxHp * 1.6);
    boss.hp = boss.maxHp;
    boss.isBoss = true;
    players.forEach(p=>{ p.side='hero'; });
    players.push(boss);
    state.players = players;
    state.log = [];
    players.forEach(p=>draw(p,4));
    log('共伐'+boss.name+'！巨寇气血 '+boss.maxHp+'，每轮威压渐盛。', 'big');
    runTurn(true);
    return;
  }

  players.forEach(p=>draw(p,4));
  state.log = [];
  log('群雄聚首，剑气干云。', 'sys');
  runTurn(true);
}

function pickOpponents(myKey, n){
  const me = CHARS[myKey];
  const pool = Object.keys(CHARS).filter(k=>k!==myKey);
  const hostile = pool.filter(k=>CHARS[k].faction === (HOSTILE[me.faction]||'__'));
  const other   = pool.filter(k=>CHARS[k].faction !== me.faction && hostile.indexOf(k)<0);
  const rest    = pool.filter(k=>CHARS[k].faction === me.faction);
  const out=[];
  const take=arr=>{ const a=arr.slice(); while(a.length && out.length<n){ out.push(a.splice(Math.floor(Math.random()*a.length),1)[0]); } };
  take(hostile); take(other); take(rest);
  return out.slice(0,n);
}

/* ===================== 回合流程 ===================== */
function beginTurn(p){
  p.wineActive=false; p.baiyeBonus=0; p.noDodgeFrom=[];
  p.caociUsed=false;   p.lifestealUsed=false; p.wuweiUsed=false; p.attackUsed=0;
  p.jiyuanUsed=false; p.fengmangUsed=false;
  p.judgeBuff=false;                     // 判定阶段「气势」加成，每回合清零
  p.hitThisTurn=0; p.combo=0;            // 连击每回合清零
  draw(p,2);
  const _db = sumK(p,'draw'); if(_db>0){ draw(p,_db); const _ds=firstK(p,'draw'); if(_ds) log('【'+_ds.n+'】'+p.name+' 多摸 '+_db+' 张。', 'heal'); }
  if(!isFlagship(p) && talentOf(p)==='耕读') draw(p,1);
  log('—— '+p.name+'（'+p.faction+'）行棋 ——', 'sys');
}

async function bossPressure(){
  if(state.mode!=='boss') return;
  if(state.round < 5 || state.pressureRound >= state.round) return;
  const boss = state.players.find(p=>p.side==='boss' && p.alive);
  if(!boss) return;
  state.pressureRound = state.round;
  const heroes = state.players.filter(p=>p.alive && p.side==='hero');
  if(!heroes.length) return;
  log('【威压】'+boss.name+' 气势如山，诸修各受 1 伤。', 'big');
  shout('威 压', '#ff8a6b');
  emitState();
  await sleep(300);
  for(const h of heroes){
    if(state.over) return;
    await loseHp(h, 1, '（威压）', boss);
  }
  emitState(); flushFx();
  await sleep(300);
}

/* ===================== 判定阶段（与 PC game.js 对齐） ===================== */
// 每回合出牌前翻一张判定牌，点数 ≥ JP_THRESHOLD 得「气势」（本回合首剑 +1）。
// 此阶段也是 贺小凉【小凉】重掷 / 周澄【澄】换牌 / 杨老头【棋】改判 的落点。
const JP_THRESHOLD = 6;
function synthJudgeCard(){             // 牌库见底时的兜底判定牌，不消耗牌库
  const T = [['dodge','守心'],['heal','丹药'],['attack','剑气'],['wine','酒'],['trick','锦囊'],['equip','本命飞剑']];
  const t = T[Math.floor(Math.random()*T.length)];
  return { uid:++cardUid, type:t[0], name:t[1], sub:(t[0]==='trick'?'duel':t[0]) };
}
function judgePoint(p, card){ return cardPoint(card) + sumK(p,'judge'); }
function _hiCard(arr){ return arr.reduce((a,b)=> cardPoint(b)>cardPoint(a)?b:a, arr[0]); }
function _loCard(arr){ return arr.reduce((a,b)=> cardPoint(b)<cardPoint(a)?b:a, arr[0]); }

async function judgePhase(p){
  if(state.over) return;
  state.tphase = 'judge';
  banner(p.name, '判 定');
  emitState();
  SFX.turn();
  await sleep(380);
  if(state.over) return;

  let jc = state.deck.length ? state.deck.pop() : synthJudgeCard();
  log(p.name+' 取判定牌「'+jc.name+'」（'+cardPoint(jc)+'）。', 'sys');

  // 贺小凉【小凉】：判定牌可重掷一次（取两次中点数高者）
  if(hasK(p,'jReroll')){
    const alt = state.deck.length ? state.deck.pop() : synthJudgeCard();
    if(cardPoint(alt) > cardPoint(jc)){ state.discard.push(jc); jc = alt; log('【小凉】'+p.name+' 重掷，得「'+jc.name+'」（'+cardPoint(jc)+'）。', 'sys'); }
    else state.discard.push(alt);
  }

  // 周澄【澄】：判定阶段可将判定牌替换为自己的一张手牌
  if(hasK(p,'jSwap') && p.hand.length){
    let rep = null;
    if(isAI(p)){ const best = _hiCard(p.hand); if(cardPoint(best) > cardPoint(jc)) rep = best; }
    else {
      const opts = p.hand.map(c=>({ v:c.uid, t:'以「'+c.name+'」（'+cardPoint(c)+'）替换' }));
      opts.push({ v:'keep', t:'保持「'+jc.name+'」' });
      const ch = await ask(p, p.name+'【澄】：是否以手牌替换判定牌？', opts,
        ()=>{ const b=_hiCard(p.hand); return cardPoint(b)>cardPoint(jc)?b.uid:'keep'; });
      if(ch!=='keep') rep = p.hand.find(c=>c.uid==ch);
    }
    if(rep){ state.discard.push(jc); removeFromHand(p, rep); jc = rep; log('【澄】'+p.name+' 以手牌替换判定牌，得「'+jc.name+'」（'+cardPoint(jc)+'）。', 'sys'); }
  }

  // 杨老头【棋】：他人判定结算前可改其判定牌（敌则求其低、友则求其高）
  const changer = state.players.find(q=>q.alive && q.id!==p.id && hasK(q,'jChange'));
  if(changer && changer.hand.length){
    const enemy = !isMyTeamOf(changer, p);
    const cur = judgePoint(p, jc);
    let rep = null;
    if(isAI(changer)){
      if(enemy && cur >= JP_THRESHOLD) rep = _loCard(changer.hand);
      else if(!enemy && cur < JP_THRESHOLD) rep = _hiCard(changer.hand);
    } else {
      const opts = changer.hand.map(c=>({ v:c.uid, t:'改判定牌为「'+c.name+'」（'+cardPoint(c)+'）' }));
      opts.push({ v:'keep', t:'不动' });
      const ch = await ask(changer, changer.name+'【棋】：改动 '+p.name+' 的判定牌？', opts,
        ()=>{ if(enemy && cur>=JP_THRESHOLD) return _loCard(changer.hand).uid; if(!enemy && cur<JP_THRESHOLD) return _hiCard(changer.hand).uid; return 'keep'; });
      if(ch!=='keep') rep = changer.hand.find(c=>c.uid==ch);
    }
    if(rep){ state.discard.push(jc); removeFromHand(changer, rep); jc = rep; log('【棋】'+changer.name+' 落子，'+p.name+' 判定牌易为「'+jc.name+'」（'+cardPoint(jc)+'）。', 'sys'); }
  }

  const jp = judgePoint(p, jc);
  if(jp >= JP_THRESHOLD){
    p.judgeBuff = true;
    log('【道心通明】'+p.name+' 判定 '+jp+' ≥ '+JP_THRESHOLD+'，本回合首剑气势如虹（+1）。', 'big');
  } else {
    log(p.name+' 判定 '+jp+'（＜'+JP_THRESHOLD+'），道心平平。', 'sys');
  }
  state.discard.push(jc);
  emitState();
  await sleep(260);
}

/* 判定/AI 用的"是否同阵营"判断：不依赖 state.current，可对任意两人比较 */
function isMyTeamOf(me, pl){
  if(!me || !pl || me.id===pl.id) return true;
  if(state.mode==='siege') return me.side===pl.side;
  if(state.mode==='boss')  return me.side===pl.side;
  if(state.mode==='ai')    return !!(me.faction && pl.faction===me.faction);
  return false;                                  // hot：单挑
}

/* 后期势压（防僵局）：回合数越高，剑气越重、丹药越弱 */
function fatigue(){
  return state.round >= 40 ? 2 : (state.round >= 25 ? 1 : 0);
}

/* 热座模式换手提示：不可跳过，点「准备好了」才继续 */
function showHandoff(p){
  return ask(p, '群雄论剑 · 请把设备交给 '+p.name, [{v:'ok', t:'准备好了'}], ()=>'ok');
}

/* 剑气来源明细（信息清晰度：让玩家看懂这一剑为何是 N 点） */
function atkBonusParts(p, t){
  const out = [];
  if(p.equip) out.push({ n:'本命飞剑', v:1 + equipUpOf(p) });
  if(p.wineActive) out.push({ n:'饮者', v:1 });
  if(p.baiyeBonus>0) out.push({ n:'诗剑', v:p.baiyeBonus });
  if(p.key==='caoci') out.push({ n:'武', v:1 });
  for(const sk of skillsOf(p)){
    if(sk.k!=='atk' && sk.k!=='auraAtk') continue;
    if(sk.o==='once' && usedFlag(p,sk)) continue;
    if(!condOk(p, sk.c, t)) continue;
    if(sk.k==='auraAtk' && sk.c==='faction') continue;
    out.push({ n:sk.n, v:(sk.v||0) });
  }
  const au = auraAtk(p, t);
  if(au) out.push({ n:'阵营光环', v:au });
  if(t && t.faction !== p.faction
     && aliveOthers(p).some(q=>q.faction===p.faction && q.id!==t.id)) out.push({ n:'齐心', v:1 });
  return out;
}

async function runTurn(first){
  if(state.over) return;
  const p = current();
  if(!p.alive){ advanceTurn(); return; }
  state.tphase = 'draw';
  banner(p.name, first ? '入 局' : '行 棋');
  SFX.turn();
  beginTurn(p);
  emitState();
  await sleep(460);
  if(state.over) return;
  // 热座模式：每回合开始前提示换手（托管时不打断）
  if(state.mode==='hot' && !state.over && !state.auto) await showHandoff(p);
  if(state.over) return;
  if(p.side==='hero') await bossPressure();
  if(state.over) return;
  await judgePhase(p);                 // 判定阶段：道心/气运，judge 类技能在此落点
  if(state.over) return;
  state.tphase = 'play';
  emitState();
  if(isAI(p)){
    await sleep(360);
    await aiPlay(p);
    await sleep(260);
    if(!state.over) endTurn();
  }
}

async function endTurn(){
  if(state.over || state.busy || state.await) return;
  const p = current();
  const rg = sumK(p,'regen'); if(rg>0 && p.alive){ p.hp=Math.min(p.maxHp,p.hp+rg); log('【'+(firstK(p,'regen')||{n:'回气'}).n+'】'+p.name+' 回合末回气 '+rg+'。', 'heal'); pushFx('heal',p.id,{amt:rg}); }
  state.tphase = 'discard';
  const over = p.hand.length - handLimit(p);
  if(over > 0){
    let drop = null;
    if(isAI(p)) drop = aiDiscard(p, over);
    else drop = await showMulti('弃牌阶段：手牌超出上限 '+handLimit(p)+' 张，需弃置 '+over+' 张', p.hand, over, '弃 置');
    if(drop && drop.length){
      drop.forEach(c=>{ removeFromHand(p,c); state.discard.push(c); });
      log(p.name+' 弃置 '+drop.map(c=>'「'+c.name+'」').join(''), 'sys');
    }
  }
  emitState();
  await sleep(220);
  advanceTurn();
}

function advanceTurn(){
  if(state.over) return;
  const old = state.current;
  let n = old;
  do { n = (n+1) % state.players.length; } while(!state.players[n].alive);
  if(n <= old) state.round++;
  state.current = n;
  runTurn(false);
}

/* ===================== 伤害 / 死亡 ===================== */
async function loseHp(p, amt, reason, source){
  let realAmt = amt;
  if(!isFlagship(p) && talentOf(p)==='无为' && !p.wuweiUsed){ realAmt -= 1; p.wuweiUsed = true; }
  if(realAmt < 0) realAmt = 0;
  p.hp -= realAmt;
  p.stats.taken += realAmt;
  if(source && source.id!==p.id) source.stats.dmg += realAmt;
  if(realAmt>0){
    log(p.name+' 受 '+realAmt+' 点伤害'+(reason||''), 'hit');
    pendingFx.push({ id:p.id, amt:realAmt, type:'hit' });
    pushFx('hit', p.id, { col:'#ff8a6b', amt:realAmt });
  }
  if(p.hp<=0){
    const ds = firstK(p,'deathsave');
    if(ds && !usedFlag(p,ds) && p.hand.length>=2){
      markUsed(p,ds);
      const drop = p.hand.splice(0,2);
      drop.forEach(c=>state.discard.push(c));
      p.hp = 1;
      log('【'+ds.n+'】'+p.name+' 弃 2 牌，死里逃生。', 'big');
      return;
    }
    p.hp=0; die(p, source);
  }
}
function die(p, killer){
  p.alive=false;
  log(p.name+' 气绝身亡。', 'big');
  SFX.die();
  pushFx('death', p.id);
  p.hand.forEach(c=>state.discard.push(c)); p.hand=[]; p.equip=null;
  if(killer && killer.alive && killer.id!==p.id){
    killer.stats.kills++;
    const _kd = firstK(killer,'killdraw'); if(_kd){ draw(killer, 1); log('【'+_kd.n+'】'+killer.name+' 击杀后摸 1 张。', 'heal'); }
    const _da = firstK(p,'deathally'); if(_da){ aliveOthers(p).filter(q=>q.faction===p.faction).forEach(q=>draw(q, _da.v||1)); log('【'+_da.n+'】'+p.name+' 阵亡，同道各摸 '+(_da.v||1)+' 张。', 'heal'); }
    const _df = firstK(p,'deathfac'); if(_df){ aliveOthers(p).filter(q=>q.faction===p.faction).forEach(q=>{ q.hp=Math.min(q.maxHp, q.hp+(_df.v||1)); }); log('【'+_df.n+'】'+p.name+' 阵亡，同阵营回气。', 'heal'); }
    breakthrough(killer, p);
    const involvesHuman = (state.mode!=='ai') || killer.id===state.human || p.id===state.human;
    if(involvesHuman) fxExecute(p.name);
  }
  checkEnd();
}

function checkEnd(){
  if(state.over) return;
  if(state.mode==='siege'){
    const allies = state.players.filter(p=>p.alive && p.side==='ally');
    const foes   = state.players.filter(p=>p.alive && p.side==='foe');
    if(allies.length===0){ endGame(false, '剑气长城失守', '蛮荒天下'); return; }
    if(foes.length===0){ nextWave(); return; }
    return;
  }
  if(state.mode==='boss'){
    const boss   = state.players.find(p=>p.side==='boss');
    const heroes = state.players.filter(p=>p.alive && p.side==='hero');
    if(!boss || !boss.alive){ endGame(true, '共伐功成 · 巨寇伏诛', '讨伐诸修'); return; }
    if(heroes.length===0){ endGame(false, '讨伐失利 · 全军覆没', boss ? boss.name : '巨寇'); return; }
    return;
  }
  const alive = alivePlayers();
  if(alive.length<=1){
    endGame(true, '尘埃落定，胜者：'+(alive[0] ? alive[0].name : '无'),
      alive[0] ? alive[0].name : '无', alive[0] ? alive[0].id : -1);
  }
}

function endGame(win, title, winnerName, winnerId){
  state.over = true;
  state.win = !!win;
  /* 包袱斋结账：胜/败得雪花钱（先抵赊欠）。与 PC endGame→updateRecord 同纪律——只记一次，
     否则 checkEnd 多分支走到同一结算会反复入账。 */
  if(!state.bfSettled){ state.bfSettled = true; state.bfGain = bfSettle(!!win); }
  state.winner = winnerName || '无';
  state.winnerId = (winnerId===undefined || winnerId===null) ? -1 : winnerId;
  state.resultTitle = title || '';
  log(title, 'big');
}

/* ---------- 守城波次 ---------- */
function spawnWave(){
  const ALL = Object.keys(CHARS).filter(k=>CHARS[k].faction==='蛮荒天下');
  const n = Math.min(3, 1 + Math.floor(state.wave/2));
  const born = [];
  for(let i=0;i<n;i++){
    const onField = state.players.filter(p=>p.alive && p.side==='foe').map(p=>p.key);
    let pool = ALL.filter(k=>onField.indexOf(k)<0);
    if(!pool.length) pool = ALL.slice();
    if(!pool.length) break;
    const k = pool[Math.floor(Math.random()*pool.length)];
    const pl = makePlayer(k, state.players.length, 'foe');
    state.players.push(pl);
    born.push(pl.name);
  }
  return born;
}
function nextWave(){
  state.wave++;
  if(state.wave > state.maxWave){
    state.wave = state.maxWave;
    endGame(true, '守城功成 · 蛮荒退兵', '守城诸修');
    return;
  }
  const allies = state.players.filter(p=>p.alive && p.side==='ally');
  allies.forEach(p=>{
    p.hp = Math.min(p.maxHp, p.hp + 3);
    draw(p, 3);
  });
  const born = spawnWave();
  log('第 '+state.wave+' 波蛮荒大军压境：'+born.join('、'), 'big');
  shout('第 '+state.wave+' 波', '#ff8a6b');
  SFX.turn();
}

function breakthrough(killer, victim){
  const order = ['练气','止境','飞升'];
  killer.maxHp += 1;
  killer.hp = Math.min(killer.maxHp, killer.hp + 1);
  const i = order.indexOf(killer.realm);
  if(i >= 0 && i < order.length-1){
    killer.realm = order[i+1];
    log(''+killer.name+' 斩 '+victim.name+'，境界突破至【'+killer.realm+'】！', 'big');
  } else {
    log(''+killer.name+' 斩 '+victim.name+'，气血上限 +1！', 'big');
  }
  pendingFx.push({ id:killer.id, amt:1, type:'heal' });
  pushFx('heal', killer.id, { amt:1 });
  SFX.breakout();
  shout('境界突破', '#ffe9a8');
}

/* ===================== 攻击结算 ===================== */
/* 剑气伤害的唯一来源：实战结算（apply=true）与 AI 预估（apply=false）共用同一公式，
   避免两处各写一份导致 AI 低估伤害、该补刀时不补刀。
   apply=false 时不消耗「气势」、不写日志，纯查询。 */
function swordDamage(attacker, target, apply){
  let dmg = 1;
  if(attacker.equip) dmg += 1 + equipUpOf(attacker);
  if(attacker.wineActive) dmg += 1;
  if(attacker.key==='miyu') dmg = Math.max(dmg,2);
  if(attacker.baiyeBonus>0) dmg += attacker.baiyeBonus;
  if(attacker.key==='ningyao' && target.faction==='蛮荒天下') dmg += 1;
  if(attacker.key==='miyu' && target.faction==='蛮荒天下') dmg += 1;
  if(attacker.key==='caoci') dmg += 1;
  dmg += sumK(attacker,'atk', target);
  if(attacker.judgeBuff){
    dmg += 1;
    if(apply){ attacker.judgeBuff = false; log('【气势】'+attacker.name+' 道心通明，剑气 +1。', 'sys'); }
  }
  dmg += auraAtk(attacker, target);
  // 同阵营齐心：有同阵营存活友方、且剑锋指向外敌时，剑气 +1
  const united = target.faction !== attacker.faction
    && aliveOthers(attacker).some(q=>q.faction===attacker.faction && q.id!==target.id);
  if(united) dmg += 1;
  const fat = fatigue();
  if(fat > 0){
    dmg += fat;
    if(apply) log('【天道势压】第 '+state.round+' 轮，剑气 +'+fat+'。', 'sys');
  }
  return dmg;
}

async function resolveAttack(attacker, target){
  const _hadBuff = !!attacker.judgeBuff;
  const _fat = fatigue();
  let dmg = swordDamage(attacker, target, true);

  const _parts = atkBonusParts(attacker, target);
  if(_hadBuff) _parts.push({ n:'气势', v:1 });
  if(_fat > 0) _parts.push({ n:'天道势压', v:_fat });
  // 每剑都播报伤害（含无加成的基础一剑），反馈更及时
  log('　剑气 '+dmg+' 点' + (_parts.length ? '：'+_parts.map(x=>x.n+' +'+x.v).join('、') : '。'), 'sys');

  const swordheart = (attacker.key==='ningyao');
  const _nd = firstK(attacker,'nododge',target);
  const noDodge = swordheart || _nd || attacker.noDodgeFrom.indexOf(target.id)>=0;

  if(!noDodge && hasCard(target,'dodge')){
    const c = await ask(target, target.name+' 遭 '+dmg+' 点剑气，可出【守心】？',
      [{v:'d',t:'出守心（免伤）'},{v:'t',t:'硬受此剑'}],
      ()=> (target.hp<=dmg || countCard(target,'dodge')>=2) ? 'd' : 't');
    if(c==='d'){
      discardCard(target, findCard(target,'dodge'));
      log(target.name+' 守心如玉，免此一剑。', '');
      shout(pickShout(SHOUTS.dodge), '#7fb8d8'); SFX.click();
      pushFx('shield', target.id);
      return;
    }
  } else if(noDodge && swordheart){
    log('【剑心】锋芒难避，'+target.name+' 无从守心。', 'sys');
  }

  if(target.key==='chenpingan' && target.hand.length>0 && !noDodge){
    const c = await ask(target, target.name+'（陈平安）可用【守拙】弃一张牌当守心，是否使用？',
      [{v:'sz',t:'守拙（弃一张牌免伤）'},{v:'t',t:'硬受此剑'}],
      ()=> (target.hp<=dmg) ? 'sz' : 't');
    if(c==='sz'){ discardCard(target, target.hand[0]); log('陈平安 守拙免伤。', ''); return; }
  }

  // 连击：本回合此前已命中过，则剑势连绵、伤害递增（每层 +1，最多 +2）
  // 限定我方（非 AI）——巨寇与来犯之敌本就多出一剑，放任其叠连击会让玩家侧胜率崩塌
  if(COMBO_ON && !isAI(attacker) && attacker.hitThisTurn > 0){
    const cb = Math.min(attacker.hitThisTurn, 2);
    dmg += cb;
    attacker.combo = attacker.hitThisTurn + 1;
    log('【连击 ×'+attacker.combo+'】'+attacker.name+' 剑势连绵，伤害 +'+cb+'。', 'sys');
    shout('连击 ×'+attacker.combo, '#d4a574');
    pushFx('combo', attacker.id, { txt:'连击 ×'+attacker.combo, col:'#d4a574' });
  }

  if(!isFlagship(attacker) && talentOf(attacker)==='锋芒' && !attacker.fengmangUsed){
    attacker.fengmangUsed = true;
    dmg += 1;
    log('【锋芒】'+attacker.name+' 剑意 +1。', 'sys');
  }

  slashFx(attacker.faction);
  SFX.slash();
  await sleep(180);
  await applyDamage(attacker, target, dmg);
}

async function applyDamage(attacker, target, dmg){
  const rd = sumK(target,'reduce'); if(rd>0){ dmg -= rd; if(dmg<0) dmg=0; }
  if(target.key==='caoci' && !target.caociUsed){
    target.caociUsed = true; dmg -= 1;
    if(attacker && attacker.alive) await loseHp(attacker, 1, '（曹慈·慈 反弹）', target);
  }
  if(target.key==='fozu'){
    dmg -= 1;
    if(attacker && attacker.alive) await loseHp(attacker, 1, '（佛祖·因果 反弹）', target);
  }
  const rf = sumK(target,'reflect'); if(rf>0 && attacker && attacker.alive){ for(let i=0;i<rf;i++){ await loseHp(attacker, 1, '（反弹）', target); } }
  if(dmg>0) await loseHp(target, dmg, '', attacker);
  // 命中即累计连击层数（未造成伤害不计，反弹致死也不计）
  if(dmg>0 && attacker) attacker.hitThisTurn = (attacker.hitThisTurn||0) + 1;

  // 命中触发类技能：摸牌 / 再出一剑
  if(dmg>0 && attacker && attacker.alive){
    if(hasK(attacker,'hitdraw')){ draw(attacker, 1); const _hd=firstK(attacker,'hitdraw'); log('【'+(_hd?_hd.n:'命中')+'】'+attacker.name+' 命中后摸 1 张。', 'heal'); }
    if(hasK(attacker,'hitextra')){ attacker.attackUsed = Math.max(0, attacker.attackUsed-1); const _he=firstK(attacker,'hitextra'); log('【'+(_he?_he.n:'再剑')+'】'+attacker.name+' 命中后可再出一剑。', 'sys'); }
  }

  if(dmg>0 && attacker && attacker.alive && !isFlagship(attacker)
     && talentOf(attacker)==='嗜血' && !attacker.lifestealUsed){
    attacker.lifestealUsed = true;
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + 1);
    log('蛮荒【嗜血】'+attacker.name+' 回 1 气血。', 'heal');
    pendingFx.push({ id:attacker.id, amt:1, type:'heal' });
    pushFx('heal', attacker.id, { amt:1 });
  }
  if(attacker && attacker.key==='chenpingan' && target.alive){
    await wenxin(attacker, target);
  }
}

async function wenxin(attacker, target){
  if(target.hand.length===0) return;
  const opts = target.hand.map(c=>({ v:c.uid, t:'讲「'+c.name+'」（'+cardPoint(c)+'）' }));
  opts.push({ v:'skip', t:'不予理会' });
  const best = target.hand.reduce((a,b)=> cardPoint(b) > cardPoint(a) ? b : a, target.hand[0]);
  const ch = await ask(target, '陈平安【问心】：'+target.name+' 且讲道理（点数须 >5 方可讲过）', opts,
    ()=> cardPoint(best) > 5 ? best.uid : 'skip');
  if(ch==='skip') return;
  const card = target.hand.find(c=>c.uid==ch);
  if(!card) return;
  if(judgePoint(target, card) <= 5 + sumK(attacker,'judge')){ discardCard(target, card); log(target.name+' 理屈词穷，弃「'+card.name+'」。', ''); }
  else log(target.name+' 侃侃而谈，保住手牌。', '');
}

/* ===================== 出牌 ===================== */
function chooseTarget(p, label, aiPick, allowSelf){
  const cands = allowSelf ? state.players.filter(q=>q.alive) : aliveOthers(p);
  if(!cands.length) return Promise.resolve(null);
  if(isAI(p)) return Promise.resolve(aiPick ? aiPick(cands) : cands[0]);
  return new Promise(res=>{
    state.await = { label:label, allowSelf:!!allowSelf };
    pendingTarget = res;
    emitState();
  });
}

function onCardClick(uid){
  if(state.over || state.await || state.busy) return;
  const p = current();
  if(isAI(p)) return;
  const card = p.hand.find(c=>c.uid===uid);
  if(!card) return;
  if(card.type==='attack' && p.attackUsed >= attackLimit(p)){
    log('本回合剑气已尽，且待下回合。', 'sys'); emitState(); return;
  }
  attemptPlay(p, card);
}

function afterAction(){ emitState(); flushFx(); }

function attemptPlay(p, card){
  state.busy = true;
  playCard(p, card).then(()=>{
    state.busy = false;
    if(!state.over) afterAction();
  });
}

async function playCard(p, card){
  if(card.type==='dodge'){ log('【守心】只能应敌时打出。', 'sys'); return; }

  if(card.type==='attack'){
    if(p.attackUsed >= attackLimit(p)){ log('本回合剑气已尽。', 'sys'); return; }
    const t = await chooseTarget(p, '剑气', ()=>aiChooseTarget(p));
    if(!t) return;
    p.attackUsed++;
    removeFromHand(p, card); state.discard.push(card);
    log(p.name+' 一剑递向 '+t.name+'。', '');
    state.lastPlay = card.name;
    pushFx('swordqi', p.id, { col: FACTIONS[p.faction]||'#e8c66a' });
    shout(pickShout(SHOUTS.attack), '#ff8a6b');
    await bladeFx(p, t);
    await resolveAttack(p, t);
    return;
  }

  if(card.type==='heal'){
    const t = await chooseTarget(p, '丹药', cands=>{
      const hurt = cands.filter(q=>q.hp < q.maxHp);
      if(hurt.length){
        hurt.sort((a,b)=> (a.id===p.id?-1:0)-(b.id===p.id?-1:0) || (a.hp/a.maxHp)-(b.hp/b.maxHp));
        return hurt[0];
      }
      return p;
    }, true);
    if(!t) return;
    removeFromHand(p, card); state.discard.push(card);
    if(t.hp >= t.maxHp) log(t.name+' 气血已满，丹药空耗。', 'sys');
    state.lastPlay = card.name;
    doHeal(p, t, card);
    return;
  }

  if(card.type==='wine'){
    removeFromHand(p, card); state.discard.push(card);
    p.wineActive = true;
    state.lastPlay = card.name;
    pushFx('wine', p.id);
    log(p.name+' 饮下饮者，本回合剑气 +1。', '');
    shout(pickShout(SHOUTS.wine), '#e8c66a'); SFX.click();
    return;
  }

  if(card.type==='equip'){
    removeFromHand(p, card); p.equip = card;
    pushFx('equip', p.id);
    log(p.name+' 祭出【本命飞剑】（攻击 +1，多出一剑）。', '');
    state.lastPlay = card.name;
    shout('本命飞剑·出鞘', '#cfe6a0'); SFX.heal();
    return;
  }

  if(card.type==='trick'){ state.lastPlay = card.name; await playTrick(p, card); return; }
}

function doHeal(p, t, card){
  let amt = (p.faction==='莲花天下') ? 2 : 1;
  const fat = fatigue();
  if(fat > 0){ amt = Math.max(0, amt - fat); log('【天道势压】第 '+state.round+' 轮，丹药效力降至 '+amt+'。', 'sys'); }
  const before = t.hp;
  t.hp = Math.min(t.maxHp, t.hp + amt);
  const real = t.hp - before;
  p.stats.heal += real;
  log(p.name+' 以丹药为 '+t.name+' 回复 '+real+' 气血。', 'heal');
  shout(pickShout(SHOUTS.heal), '#79e6a0'); SFX.heal();
  pendingFx.push({ id:t.id, amt:real, type:'heal' });
  pushFx('heal', t.id, { amt:real });
  if(p.faction==='莲花天下' && aliveOthers(p).length>0){
    const ally = aliveOthers(p)[0];
    const b2 = ally.hp;
    ally.hp = Math.min(ally.maxHp, ally.hp + 1);
    log('莲花【慈悲】泽被 '+ally.name+'，回 '+(ally.hp-b2)+'。', 'heal');
    pendingFx.push({ id:ally.id, amt:ally.hp-b2, type:'heal' });
    pushFx('heal', ally.id, { amt:ally.hp-b2 });
  }
}

/* ===================== 锦囊 ===================== */
async function playTrick(p, card){
  removeFromHand(p, card); state.discard.push(card);
  pushFx('trick', p.id);
  if(p.key==='baiye') p.baiyeBonus += 1;
  if(!isFlagship(p) && talentOf(p)==='机缘' && !p.jiyuanUsed){ p.jiyuanUsed = true; draw(p,1); log('散修【机缘】'+p.name+' 摸 1 张。', 'heal'); }
  const s = SHOUTS.trick[card.sub] || card.name;
  shout(s, '#c89fe0');

  if(card.sub==='wanjian'){
    log(p.name+' 施展【万剑归宗】，万剑齐落！', 'big');
    pushFx('swordrain', null);
    for(const t of aliveOthers(p)){
      if(hasCard(t,'dodge')){
        const c = await ask(t, t.name+' 需出【守心】抵御万剑', [{v:'d',t:'出守心'},{v:'t',t:'受 1 伤'}],
          ()=> (t.hp<=1 || countCard(t,'dodge')>=2) ? 'd' : 't');
        if(c==='d'){ discardCard(t, findCard(t,'dodge')); log(t.name+' 剑阵中守心全身。', ''); continue; }
      }
      if(immuneTo(t,'trick')){ log(t.name+' 免疫万剑。', 'sys'); }
      else { await loseHp(t,1,'（万剑归宗）', p); }
    }
    return;
  }
  if(card.sub==='nanman'){
    log(p.name+' 引【蛮荒入侵】，妖潮漫野！', 'big');
    pushFx('mist', null);
    for(const t of aliveOthers(p)){
      if(hasCard(t,'attack')){
        const c = await ask(t, t.name+' 需出【剑气】抵御妖潮', [{v:'a',t:'出剑气'},{v:'t',t:'受 1 伤'}],
          ()=> (t.hp<=1) ? 'a' : (countCard(t,'attack')>=2 ? 'a' : 't'));
        if(c==='a'){ discardCard(t, findCard(t,'attack')); log(t.name+' 挥剑斩妖。', ''); continue; }
      }
      if(immuneTo(t,'trick')){ log(t.name+' 免疫妖潮。', 'sys'); }
      else { await loseHp(t,1,'（蛮荒入侵）', p); }
    }
    return;
  }
  if(card.sub==='tianjie'){
    const t = await chooseTarget(p, '天劫', ()=>aiChooseTarget(p));
    if(!t) return;
    if(immuneTo(t,'trick')){ log(t.name+'【'+(firstK(t,'immune')||{n:'免疫'}).n+'】免疫天劫。', 'sys'); return; }
    if(t.key==='lisan' && !t.lisanTrickUsed){ t.lisanTrickUsed=true; log('礼圣【礼法】消解天劫。', 'sys'); return; }
    await loseHp(t,2,'（天劫）', p);
    return;
  }
  if(card.sub==='duel'){
    const t = await chooseTarget(p, '论道', ()=>aiChooseTarget(p));
    if(!t) return;
    if(isBaizeBlocked(t)){ log('白泽【旁观】，不可为单体锦囊之的。', 'sys'); return; }
    if(immuneTo(t,'trick')){ log(t.name+'【'+(firstK(t,'immune')||{n:'免疫'}).n+'】免疫论道。', 'sys'); return; }
    if(t.key==='lisan' && !t.lisanTrickUsed){ t.lisanTrickUsed=true; log('礼圣【礼法】消解论道。', 'sys'); return; }
    await duel(p, t);
    return;
  }
  if(card.sub==='pozhen'){
    const t = await chooseTarget(p, '破阵', ()=>aiChooseTarget(p));
    if(!t) return;
    if(isBaizeBlocked(t)){ log('白泽【旁观】，不可为的。', 'sys'); return; }
    if(immuneTo(t,'trick')){ log(t.name+'【'+(firstK(t,'immune')||{n:'免疫'}).n+'】免疫破阵。', 'sys'); return; }
    if(t.key==='lisan' && !t.lisanTrickUsed){ t.lisanTrickUsed=true; log('礼圣【礼法】消解破阵。', 'sys'); return; }
    if(t.equip){ t.equip=null; log(t.name+' 的本命飞剑被破。', ''); }
    else if(t.hand.length){
      const c = await ask(t, t.name+'【破阵】：弃一张手牌',
        t.hand.map(x=>({v:x.uid,t:'弃「'+x.name+'」'})),
        ()=> (findCard(t,'dodge')||t.hand[0]).uid);
      const card2 = t.hand.find(x=>x.uid===c);
      if(card2){ discardCard(t, card2); log(t.name+' 弃「'+card2.name+'」。', ''); }
    }
    return;
  }
  if(card.sub==='jiewu'){
    const t = await chooseTarget(p, '借物', ()=>aiChooseTarget(p));
    if(!t) return;
    if(isBaizeBlocked(t)){ log('白泽【旁观】，不可为的。', 'sys'); return; }
    if(immuneTo(t,'trick')){ log(t.name+'【'+(firstK(t,'immune')||{n:'免疫'}).n+'】免疫借物。', 'sys'); return; }
    if(t.key==='lisan' && !t.lisanTrickUsed){ t.lisanTrickUsed=true; log('礼圣【礼法】消解借物。', 'sys'); return; }
    if(t.hand.length){
      const i=Math.floor(Math.random()*t.hand.length);
      const c=t.hand.splice(i,1)[0]; p.hand.push(c);
      log(p.name+' 借物代形，得 '+t.name+' 一张牌。', '');
    }
    return;
  }
  if(card.sub==='dushu'){
    draw(p,2); log(p.name+'【读书】养浩然气，摸 2 张。', 'heal'); SFX.draw();
    return;
  }
  if(card.sub==='lianqi'){
    p.equip = { uid:++cardUid, type:'equip', name:'本命飞剑', sub:'feijian' };
    log(p.name+'【炼器】祭炼出一柄本命飞剑。', ''); SFX.heal();
    return;
  }
}

async function duel(p, t){
  log(p.name+' 与 '+t.name+' 论道。', '');
  // 讲道理：判定点数高者，理亏方先弃一张
  const jp=sumK(p,'judge'), jt=sumK(t,'judge');
  if(jp!==jt && p.alive && t.alive){
    const loser = jp>jt?t:p, win = jp>jt?p:t, s=firstK(win,'judge');
    if(loser.hand.length){ const c=loser.hand.pop(); state.discard.push(c); log('【'+(s?s.n:'判定')+'】'+loser.name+' 理亏，先弃「'+c.name+'」。', 'sys'); }
  }
  while(true){
    if(!hasCard(t,'attack')){ await loseHp(t,1,'（论道）', p); return; }
    const r1 = await ask(t, t.name+'【论道】：可出剑气？', [{v:'a',t:'出剑气'},{v:'t',t:'受 1 伤'}], ()=> t.hp<=1?'a':'a');
    if(r1!=='a'){ await loseHp(t,1,'（论道）', p); return; }
    discardCard(t, findCard(t,'attack'));
    if(!hasCard(p,'attack')){ await loseHp(p,1,'（论道）', t); return; }
    const r2 = await ask(p, p.name+'【论道】：可出剑气？', [{v:'a',t:'出剑气'},{v:'t',t:'受 1 伤'}], ()=> p.hp<=1?'a':'a');
    if(r2!=='a'){ await loseHp(p,1,'（论道）', t); return; }
    discardCard(p, findCard(p,'attack'));
  }
}

/* ===================== 主动技能 ===================== */
function onSkill(key){
  if(state.over || state.await || state.busy) return;
  const p = current();
  if(isAI(p)) return;
  if(key==='talent'){
    showChoice('【'+p.talent+'】天赋\n'+(TALENT_DESC[p.talent]||''), [{v:'ok',t:'知晓了'}]);
    return;
  }
  state.busy = true;
  useSkill(p, key).then(()=>{ state.busy=false; if(!state.over) afterAction(); });
}

const ACT_NEED = { yijian:3, daoziran:2, jiaohua:1, give:1, forge:2, qizi:1, sanqing:0, steal:0, peek:0, wenjian:0, suanji:0 };
async function useSkill(p, key){
  const _s = skillsOf(p).find(x=>x.k==='act' && x.a===key);
  if(_s && (_s.o==='once'||_s.o==='turn')) markUsed(p, _s);
  if(key==='yijian'){
    if(p.chenqingduUsed){ log('一剑已出，难再。', 'sys'); return; }
    if(p.hand.length===0){ log('无牌可弃，一剑难出。', 'sys'); return; }
    const t = await chooseTarget(p, '一剑', ()=>aiChooseTarget(p));
    if(!t) return;
    const X = p.hand.length;
    const dmg = Math.max(X, Math.ceil(t.hp/2));
    p.hand.forEach(c=>state.discard.push(c)); p.hand=[];
    p.chenqingduUsed = true;
    log('陈清都【一剑】弃 '+X+' 牌，剑意贯虹，造 '+dmg+' 伤！', 'big');
    state.lastPlay = '一剑';
    pushFx('swordqi', p.id, { col: FACTIONS[p.faction]||'#e8c66a', big:true });
    shout('一 剑', '#ff8a6b');
    await bladeFx(p, t);
    await applyDamage(p, t, dmg);
    return;
  }
  if(key==='daoziran'){
    if(p.hand.length<2){ log('手牌不足，道法难行。', 'sys'); return; }
    const a=p.hand.pop(), b=p.hand.pop(); state.discard.push(a,b);
    let n=2; if(a.type==='trick'||b.type==='trick') n=3;
    draw(p,n); log('道祖【道法自然】弃 2 摸 '+n+'。', 'heal'); shout('道法自然', '#9ed4be');
    state.lastPlay = '道法自然';
    pushFx('trick', p.id);
    return;
  }
  if(key==='suanji'){
    const t = await chooseTarget(p, '算计', ()=>aiChooseTarget(p));
    if(!t) return;
    if(t.hand.length){
      const i=Math.floor(Math.random()*t.hand.length);
      const c=t.hand.splice(i,1)[0]; p.hand.push(c);
      log(p.name+'【算计】得 '+t.name+' 一张牌。', ''); shout('算 计', '#c89fe0');
      state.lastPlay = '算计';
      pushFx('trick', p.id);
    }
    return;
  }
  if(key==='wenjian'){
    const t = await chooseTarget(p, '问剑', ()=>aiChooseTarget(p));
    if(!t) return;
    p.noDodgeFrom.push(t.id);
    log(p.name+'【问剑】'+t.name+' 本回合不得守心。', ''); shout('问 剑', '#e8c66a');
    state.lastPlay = '问剑';
    pushFx('swordqi', p.id, { col: FACTIONS[p.faction]||'#e8c66a' });
    return;
  }
  if(key==='jiaohua'){
    const t = await chooseTarget(p, '教化', ()=>{
      const ally = aliveOthers(p).filter(q=>q.faction===p.faction);
      return ally.length ? ally[0] : aliveOthers(p)[0];
    });
    if(!t) return;
    if(t.faction===p.faction && p.hand.length){
      const c=p.hand.pop(); t.hand.push(c);
      log(p.name+'【教化】授 '+t.name+' 一卷书。', 'heal'); shout('教 化', '#9ed4be');
      state.lastPlay = '教化';
      pushFx('trick', p.id);
    } else log('教化只可授同阵营之人。', 'sys');
    return;
  }
  if(key==='give'){
    if(p.hand.length===0){ log('无牌可授。', 'sys'); return; }
    const t = await chooseTarget(p, '授牌', ()=>{
      const ally = state.players.filter(q=>q.alive && q.id!==p.id && q.faction===p.faction);
      return (ally.length?ally:aliveOthers(p))[0];
    }, true);
    if(!t) return;
    const c = p.hand.pop(); t.hand.push(c);
    log(p.name+' 授 '+t.name+' 一张「'+c.name+'」。', 'heal');
    state.lastPlay = '授牌';
    pushFx('trick', p.id);
    return;
  }
  if(key==='peek'){
    const t = await chooseTarget(p, '观牌', ()=>aiChooseTarget(p));
    if(!t) return;
    if(t.hand.length){
      const c = t.hand[Math.floor(Math.random()*t.hand.length)];
      log(p.name+' 窥见 '+t.name+' 一张「'+c.name+'」。', 'sys');
    } else log(t.name+' 两手空空。', 'sys');
    state.lastPlay = '观牌';
    pushFx('trick', p.id);
    return;
  }
  if(key==='steal'){
    const t = await chooseTarget(p, '夺牌', ()=>aiChooseTarget(p));
    if(!t) return;
    if(t.hand.length){
      const i=Math.floor(Math.random()*t.hand.length);
      const c=t.hand.splice(i,1)[0]; p.hand.push(c);
      log(p.name+' 夺得 '+t.name+' 一张牌。', '');
      state.lastPlay = '夺牌';
      pushFx('trick', p.id);
    } else log(t.name+' 无牌可夺。', 'sys');
    return;
  }
  if(key==='forge'){
    if(p.hand.length<2){ log('牌不足，难以祭炼。', 'sys'); return; }
    const a1=p.hand.pop(), a2=p.hand.pop(); state.discard.push(a1,a2);
    p.equip = { uid:++cardUid, type:'equip', name:'本命飞剑', sub:'feijian' };
    log(p.name+' 祭炼出一柄本命飞剑。', 'big');
    state.lastPlay = '祭炼';
    pushFx('forge', p.id); SFX.heal();
    return;
  }
  if(key==='sanqing'){
    if(p['_sk_三清']) { log('一气化三清已用。', 'sys'); return; }
    const c = await ask(p, '一气化三清：择其一', [
      {v:'g',t:'攻 · 本回合剑气 +1'},
      {v:'s',t:'守 · 免疫下一次伤害'},
      {v:'b',t:'变 · 弃一摸二'}], ()=>'g');
    p['_sk_三清'] = 1;
    state.lastPlay = '一气化三清';
    if(c==='g'){ p.baiyeBonus = (p.baiyeBonus||0)+1; log('【一气化三清·攻】'+p.name+' 本回合剑气 +1。', 'big'); pushFx('swordqi', p.id); }
    else if(c==='s'){ p._sanqingGuard = 1; log('【一气化三清·守】'+p.name+' 免疫下一次伤害。', 'big'); pushFx('shield', p.id); }
    else { if(p.hand.length){ const d=p.hand.pop(); state.discard.push(d); } draw(p,2); log('【一气化三清·变】'+p.name+' 弃一摸二。', 'big'); pushFx('trick', p.id); }
    return;
  }
  if(key==='qizi'){
    if(p.hand.length===0){ log('无牌可弃。', 'sys'); return; }
    const t = await chooseTarget(p, '棋子', ()=>aiChooseTarget(p));
    if(!t) return;
    const c = p.hand.pop(); state.discard.push(c);
    t._noAttackNext = state.round + 1;
    log('【棋子】'+p.name+' 落子，'+t.name+' 下回合不得出剑气。', 'big');
    state.lastPlay = '棋子';
    pushFx('trick', p.id);
    return;
  }
}

/* ===================== AI ===================== */
// AI 预估这一剑的伤害：直接复用实战公式（含技能剑气/气势/势压/齐心），
// 避免只算「酒+飞剑」导致 AI 严重低估伤害、明明能斩杀却不补刀。
function aiExpectedAtk(p, q){ return swordDamage(p, q, false); }

function aiChooseTarget(p){
  const cands = aliveOthers(p);
  if(!cands.length) return null;
  // 守城/讨伐是协作模式：只以「敌对阵营（不同 side）」为目标，绝不内讧。
  // 若不这样限定，巨寇高气血会被「集火残血」项压到最低分，导致讨伐方转而互砍。
  let pool = cands;
  if(state.mode==='siege' || state.mode==='boss'){
    const foes = cands.filter(q=>q.side !== p.side);
    if(foes.length) pool = foes;
  }
  const score = q=>{
    let s = 0;
    if(q.faction !== p.faction) s += 10;
    if(q.faction === (HOSTILE[p.faction]||'__')) s += 6;
    if(aiExpectedAtk(p,q) >= q.hp) s += 40;   // 可一剑斩杀，最高优先（补刀意识）
    if(q.flagship) s += 4;                    // 主将倒则阵崩，优先压制
    s -= q.hp * 3;                            // 残血优先集火
    s -= q.hand.length * 0.4;
    if(q.key==='caoci' || q.key==='fozu') s -= 3;   // 反弹，非必要时不碰
    if(p.noDodgeFrom && p.noDodgeFrom.indexOf(q.id)>=0) s += 8;   // 已问剑夺守，必补刀
    return s;
  };
  const sorted = pool.slice().sort((a,b)=> score(b)-score(a));
  return sorted[0];
}

function aiPickCard(p){
  const h = p.hand;
  if(!p.equip && hasCard(p,'equip')) return findCard(p,'equip');
  if(p.hp <= 2 && hasCard(p,'heal')) return findCard(p,'heal');
  // 2.5 准备类锦囊（炼器铸剑 / 读书）须先于剑气，否则本回合攻击吃不到增益（组合技关键）
  const setup = h.find(c=>c.type==='trick' && ['lianqi','dushu'].includes(c.sub));
  if(setup) return setup;
  const isCoop = (state.mode==='siege' || state.mode==='boss');
  const aoe = h.find(c=>c.type==='trick' && (c.sub==='wanjian'||c.sub==='nanman'));
  if(aoe && aliveOthers(p).length >= 2 && !isCoop) return aoe;
  const worthwhile = sub=>{
    if(sub==='pozhen' || sub==='jiewu'){
      const pool = isCoop ? aliveOthers(p).filter(q=>q.side!==p.side) : aliveOthers(p);
      return pool.some(q=> q.equip || q.hand.length>=1);
    }
    return true;
  };
  const off = h.find(c=>['duel','tianjie','pozhen','jiewu'].includes(c.sub) && worthwhile(c.sub));
  if(off) return off;
  if(!p.wineActive && hasCard(p,'wine') && hasCard(p,'attack') && p.attackUsed < attackLimit(p) && aliveOthers(p).length) return findCard(p,'wine');
  if(hasCard(p,'attack') && p.attackUsed < attackLimit(p) && aliveOthers(p).length) return findCard(p,'attack');
  if(hasCard(p,'equip')) return findCard(p,'equip');
  return null;
}

/* ===================== AI 组合技（连携） =====================
 * 与 PC game.js 同构：让 AI 把「准备/增益」与「进攻」串成连招，并播报【连携】反馈。
 * 仅改 AI 出牌顺序与反馈，不触碰任何数值/阵营平衡。 */
function _comboTag(p, c){
  if(!p._combo) p._combo = [];
  let t = 'misc';
  if(c.type==='equip' || c.sub==='lianqi') t='forge';
  else if(c.sub==='dushu') t='draw';
  else if(c.type==='wine') t='wine';
  else if(c.type==='attack') t='atk';
  else if(c.sub==='wanjian'||c.sub==='nanman') t='aoe';
  else if(['duel','tianjie','pozhen','jiewu'].includes(c.sub)) t='trick';
  p._combo.push(t);
}
function _emitCombo(p){
  const seq = p._combo || [];
  const setup = seq.some(t=>['forge','wenjian','buff','aoe','trick','draw'].includes(t));
  const hasAtk = seq.includes('atk');
  if(seq.length < 2 || !setup || !hasAtk) return;   // 至少「准备→进攻」两式才算连携
  let name = '符箓连击';
  if(seq.includes('forge')) name = '本命飞剑·连打';
  else if(seq.includes('wenjian')) name = '问剑夺守';
  else if(seq.includes('buff')) name = '三清剑势';
  else if(seq.includes('aoe')) name = '万剑掩杀';
  else if(seq.includes('draw')) name = '读书助剑';
  log('【连携·'+name+'】'+p.name+' 一气呵成（'+seq.length+' 式）。', 'sys');
  if(typeof shout==='function'){ try{ shout('连 携', '#e8c66a'); }catch(e){} }
}

async function aiPlay(p){
  p._combo = [];
  await aiTrySkills(p);
  await sleep(240);
  let guard = 0;
  while(guard++ < 14 && !state.over){
    const c = aiPickCard(p);
    if(!c) break;
    _comboTag(p, c);
    await playCard(p, c);
    await sleep(420);
  }
  _emitCombo(p);
}

async function aiTrySkills(p){
  if(state.over) return;
  // 数据驱动：按 SKILLS 表逐个尝试主动技，手牌不足则跳过（与 PC 一致）
  for(const sk of skillsOf(p)){
    if(sk.k!=='act') continue;
    if(sk.o==='once' && usedFlag(p,sk)) continue;
    if(sk.o==='turn' && usedFlag(p,sk)) continue;
    if(p.hand.length < (ACT_NEED[sk.a]||0)) continue;
    await useSkill(p, sk.a);
    if(!p._combo) p._combo = [];
    if(sk.a==='forge') p._combo.push('forge');
    else if(sk.a==='wenjian') p._combo.push('wenjian');
    else if(sk.a==='sanqing') p._combo.push('buff');
    await sleep(420);
    if(state.over) return;
  }
}

function aiDiscard(p, n){
  const h = p.hand.slice();
  const val = c => ({dodge:0, attack:1, wine:2, heal:3, equip:4, trick:5})[c.type];
  h.sort((a,b)=> val(a)-val(b));
  return h.slice(0, n);
}

/* ===================== 询问（人类弹窗 / AI 自动） ===================== */
function ask(resp, text, options, aiPick){
  if(resp && isAI(resp)){
    const v = aiPick ? aiPick(options) : options[0].v;
    const o = options.find(x=>x.v===v) || options[0];
    log('（'+resp.name+' 抉择：'+o.t+'）', 'sys');
    return Promise.resolve(v);
  }
  return showChoice(text, options);
}

function showChoice(text, options){
  return new Promise(res=>{
    state.modal = { type:'choice', title:text, options:options };
    pendingChoice = res;
    emitState();
  });
}

function showMulti(title, cards, count, confirmLabel){
  const list = cards.map(c=>({ uid:c.uid, name:c.name }));
  return new Promise(res=>{
    state.modal = { type:'multi', title:title, cards:list, count:count, confirmLabel:confirmLabel };
    pendingMulti = { res, orig:cards };
    emitState();
  });
}

/* ===================== 交互回调（页面调用） ===================== */
function onPlayerClick(id){
  if(state && state.await && pendingTarget){
    const r = pendingTarget;
    state.await = null; pendingTarget = null;
    emitState();
    r(playerById(id));
  }
}
/* 取消目标选择：resolve(null)，出牌流程会 return，卡牌留在手上、局面不变 */
function cancelAwait(){
  if(!state || !state.await || !pendingTarget) return;
  const r = pendingTarget;
  state.await = null; pendingTarget = null;
  log('取消目标选择。', 'sys');
  emitState();
  r(null);
}
function resolveModal(v){
  if(pendingChoice){
    const r = pendingChoice; pendingChoice = null;
    state.modal = null; emitState();
    r(v);
  }
}
function resolveMulti(uids){
  if(!pendingMulti) return;
  const { res, orig } = pendingMulti; pendingMulti = null;
  const sel = orig.filter(c=>uids.indexOf(c.uid)>=0);
  state.modal = null; emitState();
  res(sel);
}
function onEndTurn(){
  if(state.over || state.busy || state.await) return;
  endTurn();
}
function rematch(){
  const keys = state.sel.slice();
  startGame(keys, state.mode);
  emitState();
}
function cycleBg(){ state.bgIdx = ((state.bgIdx||0)+1) % BG_LIST.length; emitState(); }
function toggleSpeed(){ speedMul = (speedMul > 0.7) ? 0.4 : 1; emitState(); }
function getSpeed(){ return speedMul; }
/* 托管：人类座位交给 AI 代打；再点一次收回。
   只改「谁来下棋」，不碰任何数值与技能结算（AI 与人类共用 playCard/useSkill）。 */
function toggleAuto(){
  if(!state || state.over) return;
  state.auto = !state.auto;
  log(state.auto ? '【托管】此后由天意行棋，再点「托管 中」收回。' : '【托管】你接过了棋子。', 'sys');
  emitState();
  if(state.auto) autoTakeOver();
}
function getAuto(){ return !!(state && state.auto); }
/* 托管接管：若此刻正停在人类出牌阶段，立刻把这一手走完；
   其余阶段（摸牌/判定）由 runTurn 自然流转到 AI 分支，不重复驱动。 */
async function autoTakeOver(){
  if(!state || !state.auto || state.over || state.busy || state.await || state.modal) return;
  if(state.tphase !== 'play') return;
  const p = current();
  if(!p || !p.alive) return;
  await sleep(300);
  if(!state.auto || state.over) return;
  await aiPlay(p);
  await sleep(240);
  if(!state.over && state.auto) endTurn();
}

/* ===================== 特效（小程序版：state + CSS 动画） ===================== */
// 每个特效是一个描述符，挂到 state.fx；页面按 pid 锚定到对应角色卡，
// 全局特效 pid=null。引擎负责到点自动移除并 emitState，页面只管渲染。
const FX_DUR = {
  slash:480, hit:420, heal:700, death:600, wine:1500, equip:1200,
  trick:1000, shield:900, blade:460, swordqi:620, combo:760,
  mist:1800, swordrain:1500,
};
function pushFx(type, pid, opts){
  const st = state;
  const f = Object.assign({ key:++fxId, type, pid:(pid===undefined?null:pid) }, opts||{});
  st.fx.push(f);
  const dur = f.dur || FX_DUR[type] || 700;
  setTimeout(()=>{
    const i = st.fx.findIndex(x=>x.key===f.key);
    if(i>=0){ st.fx.splice(i,1); emitState(); }
  }, dur);
  return f;
}
function shout(text, color){
  var seal = (text||'').replace(/[\s·．.]/g,'').charAt(0) || '剑';
  state.shout = { text, color:color||'#e8c66a', seal:seal, id:++fxId };
  emitState();
}
function banner(name, sub){ state.banner = { name, sub, id:++fxId }; emitState(); }
function slashFx(faction){ pushFx('slash', null, { col: FACTIONS[faction]||'#fff' }); }
function bladeFx(from, to){ if(to) pushFx('blade', to.id, { col: FACTIONS[from ? from.faction : null]||'#e8c66a' }); return sleep(430); }
function fxExecute(victimName){ state.flash = { text:'斩', sub:victimName+' · 殁', id:++fxId }; emitState(); }
function flushFx(){
  for(const f of pendingFx){
    if(f.type==='hit') state.popup = { id:f.id, amt:f.amt, type:'hit', fx:++fxId };
    else if(f.type==='heal') state.popup = { id:f.id, amt:f.amt, type:'heal', fx:++fxId };
    else if(f.type==='draw') SFX.draw();
  }
  pendingFx.length = 0;
  emitState();
}

/* ===================== 快照（供 wxml 渲染） ===================== */
function sideLabelOf(pl){
  if(state.mode==='siege') return pl.side==='foe' ? '来犯之敌' : '守城';
  if(state.mode==='boss')  return pl.side==='boss' ? '巨 寇' : '讨伐';
  return null;
}
const SEAT_ZH = ['一','二','三','四','五','六','七','八','九','十'];
function seatLabelOf(pl){
  /* 用持久 seatNo（全局唯一），不再用 state.players.indexOf
     —— siege/boss 模式 push 会让 index 漂移，但 seatNo 永远稳定 */
  const n = pl && pl.seatNo;
  if(!n || n<1) return '';
  return (SEAT_ZH[n-1] || (''+n)) + '号位';
}
function cardView(c, cur){
  return {
    uid:c.uid, name:c.name, type:c.type, sub:c.sub,
    sig:cardSig(c), cls:cardCls(c), kind:CARD_KIND[c.type], point:cardPoint(c),
    disabled: c.type==='attack' && cur.attackUsed >= attackLimit(cur),
  };
}
function playerView(pl){
  return {
    id:pl.id, key:pl.key, name:pl.name,     faction:pl.faction,
    col: FACTIONS[pl.faction]||'#999',
    art: D.artUrl(pl.key),
    hp:pl.hp, maxHp:pl.maxHp, hpPct: Math.max(0, pl.hp)/pl.maxHp*100,
    realm:pl.realm, alive:pl.alive, dead:!pl.alive,
    isCurrent: pl.id===state.current, ai:isAI(pl),
    canTarget: !!(state.await && pl.alive),
    isYou: (state.mode==='ai' && pl.id===state.human),
    isBoss: !!pl.isBoss, sideLabel: sideLabelOf(pl), seatLabel: seatLabelOf(pl),
    equipName: pl.equip ? pl.equip.name : null,
    handCount: pl.hand.length,
    skills: (pl.skills||[]),
    hasAlly: hasAlly(pl),
    lowHp: pl.alive && pl.hp<=1,
    attackUsed: pl.attackUsed, attackLimit: attackLimit(pl),
    handLimit: handLimit(pl), wineActive: pl.wineActive,
    fx: state.fx.filter(f=>f.pid===pl.id),
    shake: state.fx.some(f=>f.pid===pl.id && f.type==='hit'),
    glow: state.fx.some(f=>f.pid===pl.id && f.type==='heal'),
    sway: state.fx.some(f=>f.pid===pl.id && f.type==='wine'),
  };
}
function skillButtons(p){
  const out=[];
  for(const sk of skillsOf(p)){
    if(sk.k!=='act') continue;
    if(sk.o==='once' && usedFlag(p,sk)) continue;
    if(sk.o==='turn' && usedFlag(p,sk)) continue;
    out.push({ key:sk.a, label:sk.n, tip:(sk.q||'')+(sk.qo?'（原著）':'') });
  }
  if(!isFlagship(p) && p.talent) out.push({key:'talent', label:'天赋 · '+p.talent, tip:D.TALENT_DESC[p.talent]||''});
  return out;
}
/* 加冕时刻：决出"全场魁首"
   - 败方：不加冕（return null）
   - 热座（hot）：魁首 = 唯一赢家
   - 其余模式：我方阵营中 杀优先 + 伤补足 的最强者（死了也表彰） */
function computeMVP(){
  const wid = state.winnerId;
  const won = state.win !== false;
  const coop = (state.mode==='siege' || state.mode==='boss');
  const humanWin = coop ? won : ((state.mode==='hot') || (wid===state.human));
  if(!humanWin) return null;
  if(state.mode==='hot') return state.players.find(p=>p.id===wid) || null;
  const me = state.players[state.current] || state.players.find(p=>p.id===state.human);
  const pool = me ? state.players.filter(p => p.id===me.id || p.faction===me.faction || p.side===me.side)
                  : state.players.slice();
  let best=null, bestScore=-1;
  for(const pl of pool){
    const score = (pl.stats.kills||0)*1000 + (pl.stats.dmg||0);
    if(score > bestScore){ bestScore=score; best=pl; }
  }
  return best;
}
function buildResult(s){
  const wid = s.winnerId;
  const won = s.win !== false;
  const humanWin = (s.mode==='siege' || s.mode==='boss')
    ? won
    : ((s.mode==='hot') || (wid===s.human));
  let sub;
  if(s.mode==='siege') sub = won ? '五波蛮荒尽退，长城无恙。' : '守至第 '+s.wave+' 波，城破人亡。';
  else if(s.mode==='boss') sub = won ? '巨寇伏诛，天下共伐功成。' : '讨伐失利，巨寇犹在。';
  else sub = humanWin ? '剑气长存，胜者 '+s.winner : s.winner+' 技高一筹，再练三年';
  const rows = s.players.slice().sort((a,b)=> (b.alive?1:0)-(a.alive?1:0) || b.stats.kills-a.stats.kills)
    .map(pl=>({
      name:pl.name+(pl.alive?'':'（殁）'), faction:pl.faction, col:FACTIONS[pl.faction]||'#999',
      art: D.artUrl(pl.key),
      realm:pl.realm, kills:pl.stats.kills, dmg:pl.stats.dmg, taken:pl.stats.taken, heal:pl.stats.heal,
      win: pl.id===wid,
    }));
  /* 加冕魁首（只有胜方才生成） */
  let mvp=null;
  const coop = (s.mode==='siege' || s.mode==='boss');
  const hWin = coop ? won : ((s.mode==='hot') || (wid===s.human));
  if(hWin){
    if(s.mode==='hot'){
      const w = s.players.find(p=>p.id===wid);
      if(w) mvp = { name:w.name, faction:w.faction, col:FACTIONS[w.faction]||'#e8c66a',
                    art:D.artUrl(w.key), kills:w.stats.kills||0, dmg:w.stats.dmg||0,
                    heal:w.stats.heal||0, realm:w.realm||'', facLab: w.faction };
    } else {
      const me = s.players[s.current] || s.players.find(p=>p.id===s.human);
      const pool = me ? s.players.filter(p => p.id===me.id || p.faction===me.faction || p.side===me.side)
                      : s.players.slice();
      let best=null, bestScore=-1;
      for(const pl of pool){
        const sc=(pl.stats.kills||0)*1000+(pl.stats.dmg||0);
        if(sc>bestScore){ bestScore=sc; best=pl; }
      }
      if(best){
        const lab = best.faction + (best.side && best.side!=='hero' && best.side!=='ally' && best.side!=='boss' && best.side!='foe' ? ' · '+best.side : '');
        mvp = { name:best.name, faction:best.faction, col:FACTIONS[best.faction]||'#e8c66a',
                art:D.artUrl(best.key), kills:best.stats.kills||0, dmg:best.stats.dmg||0,
                heal:best.stats.heal||0, realm:best.realm||'', facLab: lab };
      }
    }
  }
  let banner = (s.mode==='siege') ? '守城同道'
              : (s.mode==='boss') ? '天下共伐'
              : (s.mode==='hot')  ? '热座争锋' : '同门之最';
  /* 本局成就：按 human 玩家整局战绩评定一枚《剑来》意境称号 */
  const meA = s.players.find(p=>p.id===s.human) || s.players[s.current] || null;
  let achievement=null;
  if(meA){
    const k=meA.stats.kills||0, d=meA.stats.dmg||0, t=meA.stats.taken||0, h=meA.stats.heal||0, alive=meA.alive;
    if(hWin && k>=6)          achievement={ title:'一剑霜寒', grade:'神品', gkey:'divine', note:'杀伐之盛，一剑霜寒，万修辟易。' };
    else if(hWin && h>=6)     achievement={ title:'春风化雨', grade:'上品', gkey:'high',    note:'以疗护友，如春风化雨，润物无声。' };
    else if(hWin && t>=10)    achievement={ title:'中流一柱', grade:'上品', gkey:'high',    note:'独承锋镝，中流一柱，镇守山河。' };
    else if(hWin && d>=14)    achievement={ title:'万军辟易', grade:'神品', gkey:'divine', note:'剑气纵横，所向披靡，万军辟易如卷席。' };
    else if(hWin && alive && t<=2) achievement={ title:'守心如玉', grade:'上品', gkey:'high', note:'守心如玉，问心无愧于天地。' };
    else if(hWin)             achievement={ title:'浩然长存', grade:'中品', gkey:'mid',     note:'持正而行，浩然之气长存。' };
    else if(alive)            achievement={ title:'卷土可来', grade:'中品', gkey:'mid',     note:'败而不馁，他日卷土可重来。' };
    else                      achievement={ title:'百折不回', grade:'下品', gkey:'low',     note:'道阻且长，百折其志不回。' };
  }
  return { humanWin, win:humanWin, sub, title:s.resultTitle, winner:s.winner, rows, mvp, banner, achievement,
           coinGain: s.bfGain || null,          // 包袱斋结账明细（供结算页显示雪花钱得数）
           logFull: s.log.slice() };
}

function snapshot(){
  if(!state) return null;
  const cur = current();
  const mePl = state.players.find(p=>p.id===state.human) || cur;
  const allOthers = state.players.filter(pl=>pl.id!==mePl.id);
  const others = allOthers.map(playerView);
  const mates = allOthers.filter(pl=>isMyTeam(pl)).map(playerView);
  const opps  = allOthers.filter(pl=>!isMyTeam(pl)).map(playerView);
  let oppLabel='对 位', allyLabel='同 阵 营';
  if(state.mode==='siege'){ oppLabel='来犯之敌'; allyLabel='守城同道'; }
  if(state.mode==='boss') { oppLabel='巨 寇';    allyLabel='共 伐 者'; }
  return {
    mode: state.mode, round: state.round, tphase: state.tphase,
    wave: state.wave, maxWave: state.maxWave,
    deckCount: state.deck.length, discardCount: state.discard.length,
    over: state.over, win: state.win, busy: state.busy, fx: state.fx.slice(),
    enemies: others, opps, mates, oppLabel, allyLabel,
    hero: playerView(cur),
    heroHand: cur.hand.map(c=>cardView(c, cur)),
    heroSkills: skillButtons(cur),
    heroIsAI: isAI(cur),
    heroTrustee: isTrusteeView(cur),
    me: playerView(mePl),
    meHand: mePl.hand.map(c=>cardView(c, mePl)),
    meSkills: skillButtons(mePl),
    meTrustee: isTrusteeView(mePl),
    currentPlayer: playerView(cur),
    lastPlay: state.lastPlay,
    isMyTurn: cur.id === mePl.id,
    auto: !!state.auto,
    log: state.log.slice(-14),
    stageLog: state.log.slice(-4),
    modal: state.modal,
    await: state.await,
    shout: state.shout, banner: state.banner, flash: state.flash, popup: state.popup,
    bgIdx: state.bgIdx||0,
    result: state.over ? buildResult(state) : null,
    speedMul,
  };
}

function emitState(){ emit(snapshot()); }

/* ===================== 导出 ===================== */
module.exports = {
  init(cb){ emit = cb || function(){}; },
  startGame, pickOpponents,
  onCardClick, onSkill, onPlayerClick, onEndTurn, cancelAwait,
  resolveModal, resolveMulti, rematch,
  cycleBg, toggleSpeed, getSpeed,
  toggleAuto, getAuto,
  getState(){ return state; },
  BF_SETTLE,        // 供 _selftest 与分包 baofuzhai.js 的 BF_COIN_* 做一致性断言
  _t: { bfLoadout, bfSettle, skillsOf },   // 仅供 _selftest 断言（页面不直接调用）
};
