/* _sc_battle.cjs — 卡牌对战平衡采样（常驻门禁）
 *
 * 背景：项目此前只有叙事模块（山水祠/落魄山）的采样脚本 _sc_sim.cjs，
 * 卡牌对战长期无采样。改动机理（阵营归属 / 技能 / 伤害资源）时无从对账，
 * 本脚本补上这一缺口。
 *
 * 用法： node _sc_battle.cjs [每模式局数，默认 30]
 * 输出：ASCII（Windows GBK 控制台会吃掉中文后的数字，故输出严禁中文）
 *
 * 自走原理：
 *   - game.js 的 isAI(p) 决定 ask() 走 AI 自动应答还是弹 choice 框；
 *     在 vm 上下文里把 isAI 覆盖为恒真，即可全场 AI 自走。
 *   - runTurn/endTurn/advanceTurn 为 async + fire-and-forget 链，
 *     故必须注入【真实 setTimeout】（不能用压到 1ms 的空操作桩，
 *     否则定时器相关逻辑全部测不到 —— 见 MEMORY 假绿灯教训）。
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const dir = __dirname;

const N = parseInt(process.argv[2], 10) || 30;
/* 对照采样：--exclude-seats 排除本轮新增的十位王座，用于验证新角色是否拖慢对局 */
const EXCLUDE_SEATS = process.argv.includes('--exclude-seats');
const NEW_SEATS = ['刘叉', '袁首', '五嶽', '牛刀', '白莹', '绯妃', '曜甲', '切韵', '黄鸾', '荷花庵主'];

/* DOM / 运行环境打桩。setTimeout 使用真实实现，其余按最小可用打桩。 */
const stub = `
var __els = {};
function __mkEl(id){
  return {
    id:id||'', textContent:'', className:'', innerHTML:'', value:'', dataset:{},
    style:{ setProperty:function(){}, removeProperty:function(){} },
    classList:{ add:function(){}, remove:function(){}, toggle:function(){}, contains:function(){return false;} },
    children:[], appendChild:function(c){ this.children.push(c); return c; },
    removeChild:function(){}, remove:function(){}, insertBefore:function(){},
    setAttribute:function(){}, getAttribute:function(){ return null; },
    addEventListener:function(){}, removeEventListener:function(){},
    querySelector:function(){ return null; }, querySelectorAll:function(){ return []; },
    getBoundingClientRect:function(){ return {left:0,top:0,width:100,height:100}; },
    focus:function(){}, blur:function(){}, click:function(){}, scrollIntoView:function(){},
    parentNode:null, firstChild:null, lastChild:null, offsetWidth:100, offsetHeight:100,
  };
}
var document = {
  getElementById: function(id){ if(!__els[id]) __els[id] = __mkEl(id); return __els[id]; },
  createElement: function(){ return __mkEl(''); },
  createTextNode: function(){ return __mkEl(''); },
  querySelector: function(){ return null; },
  querySelectorAll: function(){ return []; },
  addEventListener: function(){}, removeEventListener:function(){},
  head: { appendChild:function(){} }, body: { appendChild:function(){} },
  documentElement: { style:{ setProperty:function(){} } },
};
var window = { innerWidth:1200, innerHeight:800, addEventListener:function(){}, devicePixelRatio:1 };
var navigator = { userAgent:'node' };
var localStorage = { _d:{}, getItem:function(k){ return this._d[k]||null; }, setItem:function(k,v){ this._d[k]=v; }, removeItem:function(k){ delete this._d[k]; } };
function AudioContext(){ return {
  createOscillator:function(){ return {connect:function(){},start:function(){},stop:function(){},frequency:{value:0}}; },
  createGain:function(){ return {connect:function(){},gain:{value:0}}; },
  destination:{}, currentTime:0, state:'running', resume:function(){} }; }
function requestAnimationFrame(fn){ return setTimeout(fn, 16); }
function cancelAnimationFrame(id){ clearTimeout(id); }
function setInterval(fn, t){ return 0; }
function clearInterval(){}
`;

/* 驱动：跑 N 局，采样回合数 / 胜方阵营 / 异常 */
const drv = `
var __N = ${N};
var __RESULT = { games:0, timeout:0, stuck:0, error:0, started:0, loops:0, rounds:[], wins:{}, factionWins:{}, errors:[],
                 longGames: [], seatRound: {}, seatLong: {} };   // 长局诊断用

function __sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function __pickN(arr, n){ var a=arr.slice(), out=[]; while(out.length<n && a.length){ out.push(a.splice(Math.floor(Math.random()*a.length),1)[0]); } return out; }

async function __runOne(idx){
  var keys = __pickN(__CHARS_KEYS, 4);
  __RESULT.started++;
  try {
    isAI = function(){ return true; };          // 全场自走
    speedMul = 0;                               // 关闭演出步进延迟（sleep(ms*speedMul)）
    startGame(keys, 'ai');
    var t0 = Date.now(), lastRound = -1, lastProgress = Date.now();
    while(!state.over && (Date.now()-t0) < 45000){
      __RESULT.loops++;
      await __sleep(5);
      if(state.round !== lastRound){ lastRound = state.round; lastProgress = Date.now(); }
      if(Date.now() - lastProgress > 8000) break;      // 回合数 8s 无推进 → 逻辑停滞
    }
    if(!state.over){
      if(Date.now() - lastProgress > 8000) __RESULT.stuck++;   // 真僵局/死锁
      else __RESULT.timeout++;                                 // 纯墙钟超时（机器负载）
      return;
    }
    __RESULT.games++;
    __RESULT.rounds.push(state.round);
    /* 长局诊断：记录参与者，并按角色累计「出场局数 / 长局数」，用于定位僵局组合 */
    keys.forEach(function(k){
      __RESULT.seatRound[k] = __RESULT.seatRound[k] || { n:0, long:0, sum:0 };
      __RESULT.seatRound[k].n++;
      __RESULT.seatRound[k].sum += state.round;
      if(state.round >= 40) __RESULT.seatRound[k].long++;
    });
    if(state.round >= 40) __RESULT.longGames.push({ r:state.round, keys:keys.slice() });
    /* state.winner 是【名字字符串】，不是 player 对象；阵营须经 winnerId 反查 */
    var wn = state.winner || '无';
    __RESULT.wins[wn] = (__RESULT.wins[wn]||0)+1;
    var wp = (state.winnerId>=0 && typeof playerById==='function') ? playerById(state.winnerId) : null;
    var wf = wp ? (wp.faction||'?') : '?';
    __RESULT.factionWins[wf] = (__RESULT.factionWins[wf]||0)+1;
  } catch(e){
    __RESULT.error++;
    if(__RESULT.errors.length<5) __RESULT.errors.push(String(e && e.message || e));
  }
}

(async function(){
  console.log('[drv] begin N=' + __N + ' keys=' + __CHARS_KEYS.length);
  for(var i=0;i<__N;i++){ await __runOne(i); }
  console.log('[drv] done started=' + __RESULT.started + ' games=' + __RESULT.games + ' timeout=' + __RESULT.timeout + ' stuck=' + (__RESULT.stuck|0) + ' err=' + __RESULT.error + ' loops=' + __RESULT.loops);
  __done(__RESULT);
})();
`;

(function main(){
  const files = ['briefs.js', 'figfx.js', 'juice.js', 'game.js'];
  let src = '';
  files.forEach(f => { src += fs.readFileSync(path.join(dir, f), 'utf8') + '\n;\n'; });

  /* CHARS_KEYS 由 data.js（game.js 同源再生产物）提供，避免依赖 game.js 内部变量提升 */
  const keysSrc = 'var __CHARS_KEYS = ' + JSON.stringify(
    Object.keys(require(path.join(dir, 'weapp', 'utils', 'data.js')).CHARS)
      .filter(k => !(EXCLUDE_SEATS && NEW_SEATS.includes(k)))
  ) + ';\n';

  /* 用宿主回调回传结果：不依赖 vm 的 globalThis 语义（context 里 globalThis 指向易被覆盖，
     此前 globalThis.__RESULT 传值会导致宿主侧提前读到空对象）。 */
  let finished = false;
  const ctx = vm.createContext({
    console, Math, Date, JSON, parseInt, parseFloat, isNaN, String, Number,
    Array, Object, RegExp, Error, Promise,
    setTimeout, clearTimeout, setInterval, clearInterval,
    __done: (R) => { if (!finished) { finished = true; report(R); } },
  });

  try {
    vm.runInContext(stub + '\n' + src + '\n' + keysSrc + '\n' + drv, ctx, { timeout: 600000 });
  } catch (e) {
    console.log('VM_ERROR :: ' + (e && e.message));
    process.exit(1);
  }

  /* 兜底：若驱动未回调（如死循环），超时后报错退出 */
  setTimeout(() => {
    if (!finished) { console.log('SIM_HANG :: driver did not finish in time'); process.exit(3); }
  }, Math.max(60000, N * 15000));

  function report(R) {
    const n = R.games;
    const sum = R.rounds.reduce((a, b) => a + b, 0);
    const avg = n ? (sum / n).toFixed(2) : 'n/a';
    const sorted = R.rounds.slice().sort((a, b) => a - b);
    const med = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 'n/a';

    console.log('=== BATTLE SIM (mode=ai, 4 players, N=' + N + ') ===');
    console.log('finished      : ' + n);
    console.log('timeout(>45s) : ' + R.timeout + '   <- wall-clock only (slow machine / load), tolerated');
    console.log('stuck(8s stall) : ' + (R.stuck|0) + '   <- real deadlock / stalemate');
    console.log('error         : ' + R.error);
    if (R.errors.length) console.log('error samples : ' + R.errors.join(' | '));
    console.log('rounds avg    : ' + avg);
    console.log('rounds median : ' + med);
    console.log('rounds min/max: ' + (sorted.length ? sorted[0] + '/' + sorted[sorted.length - 1] : 'n/a'));
    console.log('--- faction win distribution ---');
    Object.keys(R.factionWins).sort((a, b) => R.factionWins[b] - R.factionWins[a])
      .forEach(k => console.log('  ' + k + ' : ' + R.factionWins[k]));
    console.log('--- top winners ---');
    Object.keys(R.wins).sort((a, b) => R.wins[b] - R.wins[a]).slice(0, 8)
      .forEach(k => console.log('  ' + k + ' : ' + R.wins[k]));

    /* 长局诊断：定位僵局是否由特定角色/组合驱动 */
    const pct = sorted.length ? (sorted.filter(x => x >= 40).length / sorted.length * 100).toFixed(0) : '0';
    console.log('--- long game diagnosis (>=40 rounds: ' + pct + '% of games) ---');
    if (!R.longGames.length) {
      console.log('  none');
    } else {
      R.longGames.sort((a, b) => b.r - a.r).slice(0, 5)
        .forEach(g => console.log('  ' + g.r + ' rounds  <- ' + g.keys.join(',')));
      const rows = Object.keys(R.seatRound)
        .map(k => ({ k, n: R.seatRound[k].n, lg: R.seatRound[k].long,
                     avgRound: R.seatRound[k].sum / R.seatRound[k].n }))
        .filter(r => r.n >= 3 && r.lg > 0)
        .sort((a, b) => (b.lg / b.n) - (a.lg / a.n));
      console.log('  [per-char long-game rate, n>=3]');
      rows.slice(0, 10).forEach(r =>
        console.log('    ' + r.k + ' : long ' + r.lg + '/' + r.n +
                    '  avgRounds ' + r.avgRound.toFixed(1)));
      if (!rows.length) console.log('    (no char with long games at n>=3)');
    }

    /* 判据分离（2026-09-20 复盘）：
       - stuck   = 回合数 8s 无推进 → 真死锁/僵局，必 FAIL
       - timeout = 撞 45s 墙钟上限 → 多为机器负载抖动（并发跑门禁时曾误报 FAIL），
                   少量容忍；仅当超过 20% 才认为整轮不可信。
       注意：跑本门禁请独占，勿与其它 node 任务并行。 */
    const ok = (R.stuck === 0) && (R.error === 0) && n >= Math.floor(N * 0.8)
             && R.timeout <= Math.floor(N * 0.2);
    if (ok && R.timeout > 0) console.log('NOTE: ' + R.timeout + ' wall-clock timeout tolerated (no logic stall detected)');
    console.log(ok ? 'BATTLE_SIM_OK' : 'BATTLE_SIM_ATTENTION');
    process.exit(ok ? 0 : 2);
  }
})();
