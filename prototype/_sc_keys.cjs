/* 三表 key 对账（临时脚本，跑完即删）
   CHARS(game.js) <-> BRIEFS(briefs.js) <-> PLOTS(briefs.js) 须一致；
   PC 端与小程序端也须一致。输出保持 ASCII，避免 GBK 控制台吃中文后数字。 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = __dirname;

const files = ['briefs.js', 'figfx.js', 'juice.js', 'game.js', 'sect.js', 'shenci.js'];
let src = '';
files.forEach(f => { src += fs.readFileSync(path.join(dir, f), 'utf8') + '\n;\n'; });

const stub = `
var __els = {};
function __mkEl(id){
  var e = {
    id:id||'', style:{ setProperty:function(){}, removeProperty:function(){} },
    textContent:'', className:'', innerHTML:'', value:'', dataset:{},
    children:[], classList:{ add:function(){}, remove:function(){}, toggle:function(){}, contains:function(){return false;} },
    appendChild:function(c){ this.children.push(c); return c; },
    removeChild:function(){}, remove:function(){}, insertBefore:function(){},
    setAttribute:function(){}, getAttribute:function(){ return null; },
    addEventListener:function(){}, removeEventListener:function(){},
    querySelector:function(){ return null; }, querySelectorAll:function(){ return []; },
    getBoundingClientRect:function(){ return {left:0,top:0,width:100,height:100}; },
    focus:function(){}, blur:function(){}, click:function(){}, scrollIntoView:function(){},
    parentNode:null, firstChild:null, lastChild:null, offsetWidth:100, offsetHeight:100,
  };
  return e;
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
function AudioContext(){ return { createOscillator:function(){ return {connect:function(){},start:function(){},stop:function(){},frequency:{value:0}}; },
  createGain:function(){ return {connect:function(){},gain:{value:0}}; }, destination:{}, currentTime:0, state:'running', resume:function(){} }; }
var __timers = [];
function setTimeout(fn, t){ __timers.push(fn); return __timers.length; }
function clearTimeout(){}
function setInterval(fn, t){ return 0; }
function clearInterval(){}
function requestAnimationFrame(fn){ return 0; }
function cancelAnimationFrame(){}
`;

const drv = `
globalThis.__K = {
  CHARS:  Object.keys(CHARS),
  BRIEFS: Object.keys(BRIEFS),
  PLOTS:  Object.keys(PLOTS),
  PATH:   (typeof CHAR_PATH !== 'undefined') ? Object.keys(CHAR_PATH) : []
};
`;

const ctx = vm.createContext({ console, Math, Date, JSON, parseInt, parseFloat, isNaN, String, Number, Array, Object, RegExp, Error });
vm.runInContext(stub + '\n' + src + '\n' + drv, ctx, { timeout: 120000 });
const K = ctx.__K;

// 小程序端
const wxData = require(path.join(dir, 'weapp', 'utils', 'data.js'));
// 注意：weapp/utils/briefs.js 是 module.exports = BRIEFS;（直接导出对象，非 {BRIEFS}）
const wxBriefsRaw = require(path.join(dir, 'weapp', 'utils', 'briefs.js'));
const WX_CHARS = Object.keys(wxData.CHARS);
const WX_BRIEFS = Object.keys(wxBriefsRaw);
const WX_PLOTS = Object.keys(wxBriefsRaw.PLOTS || {});

function diff(a, b) {
  const sa = new Set(a), sb = new Set(b);
  return {
    onlyA: a.filter(k => !sb.has(k)),
    onlyB: b.filter(k => !sa.has(k)),
  };
}
function rep(name, a, b) {
  const d = diff(a, b);
  const ok = d.onlyA.length === 0 && d.onlyB.length === 0;
  console.log((ok ? 'OK   ' : 'DIFF ') + name + '  A=' + a.length + ' B=' + b.length
    + (d.onlyA.length ? '  onlyA=' + JSON.stringify(d.onlyA) : '')
    + (d.onlyB.length ? '  onlyB=' + JSON.stringify(d.onlyB) : ''));
  return ok;
}

let pass = true;
console.log('--- three-table key alignment ---');
pass = rep('CHARS vs BRIEFS (PC)', K.CHARS, K.BRIEFS) && pass;
pass = rep('CHARS vs PLOTS  (PC)', K.CHARS, K.PLOTS) && pass;
pass = rep('BRIEFS vs PLOTS (PC)', K.BRIEFS, K.PLOTS) && pass;
if (K.PATH.length) pass = rep('CHARS vs CHAR_PATH (PC)', K.CHARS, K.PATH) && pass;

console.log('--- PC vs weapp ---');
// PC 端先行、小程序暂未移植的角色（用户明确「只做 PC，不要影响小程序」时在此登记，
// 移植到 weapp 后请从名单移除，否则此处的差异将被永久豁免）
const PC_ONLY_KEYS = ['石柔'];
const C_FOR_WX = K.CHARS.filter(k => !PC_ONLY_KEYS.includes(k));
const B_FOR_WX = K.BRIEFS.filter(k => !PC_ONLY_KEYS.includes(k));
if (PC_ONLY_KEYS.length) console.log('NOTE  PC-only（尚未移植小程序，已豁免）: ' + JSON.stringify(PC_ONLY_KEYS));
pass = rep('CHARS  PC vs WX', C_FOR_WX, WX_CHARS) && pass;
pass = rep('BRIEFS PC vs WX', B_FOR_WX, WX_BRIEFS) && pass;
if (WX_PLOTS.length) pass = rep('PLOTS  PC vs WX', K.PLOTS, WX_PLOTS) && pass;
else console.log('NOTE  weapp briefs.js has no PLOTS (PC-only table), skipped');

console.log('--- deleted keys must be gone ---');
const gone = ['阿弥陀佛', '多宝', '莲荷', '菩萨（群体）', 'xiaoxun', 'manhuangdazu', 'laoguanzhu'];
gone.forEach(k => {
  const hit = [];
  if (K.CHARS.includes(k)) hit.push('CHARS');
  if (K.BRIEFS.includes(k)) hit.push('BRIEFS');
  if (K.PLOTS.includes(k)) hit.push('PLOTS');
  if (WX_CHARS.includes(k)) hit.push('WX.CHARS');
  if (WX_BRIEFS.includes(k)) hit.push('WX.BRIEFS');
  if (hit.length) { console.log('DIFF still present: ' + k + ' in ' + hit.join(',')); pass = false; }
  else console.log('OK   removed: ' + k);
});

console.log('--- fourteen seats present ---');
// 注意：部分角色 key 为拼音（如 周密->zhoumi），此处必须用 CHARS 的真实 key。
const seats = ['托月山', 'zhoumi', '刘叉', '五嶽', '荷花庵主', '龙君', '白莹', '袁首', '仰止', '绯妃', '牛刀', '曜甲', '切韵', '黄鸾'];
const missing = seats.filter(k => !K.CHARS.includes(k));
if (missing.length) { console.log('DIFF missing in CHARS: ' + JSON.stringify(missing)); pass = false; }
else console.log('OK   all 14 seats in CHARS');
const missB = seats.filter(k => !K.BRIEFS.includes(k));
if (missB.length) { console.log('DIFF missing in BRIEFS: ' + JSON.stringify(missB)); pass = false; }
else console.log('OK   all 14 seats in BRIEFS');
const missP = seats.filter(k => !K.PLOTS.includes(k));
if (missP.length) { console.log('DIFF missing in PLOTS: ' + JSON.stringify(missP)); pass = false; }
else console.log('OK   all 14 seats in PLOTS');
const missW = seats.filter(k => !WX_BRIEFS.includes(k));
if (missW.length) { console.log('DIFF missing in WX.BRIEFS: ' + JSON.stringify(missW)); pass = false; }
else console.log('OK   all 14 seats in WX.BRIEFS');

console.log(pass ? '\nALL_KEYS_OK' : '\nKEYS_HAVE_DIFF');
process.exit(pass ? 0 : 1);
