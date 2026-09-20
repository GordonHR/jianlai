/* 人物志银幕点映 · 冒烟：openCodex 完整/短开场、跳过、重播、leaveCodex 不崩 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = __dirname;
const files = ['briefs.js', 'figfx.js', 'juice.js', 'game.js'];
let src = '';
files.forEach(f => { src += fs.readFileSync(path.join(dir, f), 'utf8') + '\n;\n'; });

const stub = `
var __els = {};
function __mkEl(id){
  var e = {
    id:id||'', style:{ setProperty:function(){}, removeProperty:function(){} },
    textContent:'', className:'', innerHTML:'', value:'', dataset:{},
    children:[], hidden:true,
    classList:{ _s:{}, add:function(c){ this._s[c]=1; }, remove:function(c){ delete this._s[c]; },
                toggle:function(){}, contains:function(c){ return !!this._s[c]; } },
    appendChild:function(c){ this.children.push(c); return c; },
    removeChild:function(){}, remove:function(){}, insertBefore:function(){},
    setAttribute:function(){}, getAttribute:function(){ return null; },
    addEventListener:function(){}, removeEventListener:function(){},
    querySelector:function(){ return null; }, querySelectorAll:function(){ return []; },
    getBoundingClientRect:function(){ return {left:0,top:0,width:100,height:100}; },
    focus:function(){}, blur:function(){}, click:function(){}, scrollIntoView:function(){},
    parentNode:null, firstChild:null, offsetWidth:100, offsetHeight:100,
  };
  return e;
}
var document = {
  getElementById: function(id){ if(!__els[id]) __els[id] = __mkEl(id); return __els[id]; },
  createElement: function(){ return __mkEl(''); },
  createTextNode: function(){ return __mkEl(''); },
  querySelector: function(){ return null; },
  querySelectorAll: function(){ return []; },
  addEventListener:function(){}, removeEventListener:function(){},
  head: { appendChild:function(){} }, body: { appendChild:function(){} },
  documentElement: { style:{ setProperty:function(){} } },
};
var window = { innerWidth:1200, innerHeight:800, addEventListener:function(){}, devicePixelRatio:1,
               matchMedia:function(){ return { matches:false }; } };
var navigator = { userAgent:'node' };
var localStorage = { _d:{}, getItem:function(k){ return this._d[k]||null; }, setItem:function(k,v){ this._d[k]=String(v); }, removeItem:function(k){ delete this._d[k]; } };
var requestAnimationFrame = undefined;
var cancelAnimationFrame = undefined;
var performance = { now: function(){ return Date.now(); } };
var navigator = { userAgent:'node' };

var AudioContext = function(){ this.createOscillator=function(){ return { connect:function(){}, start:function(){}, stop:function(){}, frequency:{value:0,type:''}, type:'' }; };
  this.createGain=function(){ return { connect:function(){}, gain:{value:1, setValueAtTime:function(){}, exponentialRampToValueAtTime:function(){}, linearRampToValueAtTime:function(){}, cancelScheduledValues:function(){}} }; };
  this.destination={}; this.currentTime=0; this.close=function(){}; };
`;

const ctx = {
  console, setTimeout, clearTimeout, setInterval, clearInterval,
  Date, Math, JSON, Object, Array, String, Number, Boolean, Error, RegExp,
  parseInt, parseFloat, isNaN, encodeURIComponent, decodeURIComponent,
  process, Buffer,
};
vm.createContext(ctx);
vm.runInContext(stub + '\n' + src + '\n;this.__game={openCodex,playCodexIntro,endCodexIntro,leaveCodex,replayCodexIntro,codexIntroMode,pickCodexCast,splitCodexCastRows,allCodexKeys,landCodexGrid,get state(){return state;},CHARS,CODEX_INTRO_KEY,CODEX_CAST,CODEX_MARQUEE_CELLS};', ctx, { filename: 'bundle.js' });

const G = ctx.__game;
let fail = 0;
function ok(cond, msg){ if(cond) console.log('  PASS', msg); else { console.log('  FAIL', msg); fail++; } }

console.log('== codex intro smoke ==');
ok(typeof G.openCodex === 'function', 'openCodex exists');
ok(typeof G.playCodexIntro === 'function', 'playCodexIntro exists');
ok(typeof G.leaveCodex === 'function', 'leaveCodex exists');

const mode0 = G.codexIntroMode();
ok(mode0 === 'full', 'first visit mode=full, got=' + mode0);

const cast = G.allCodexKeys();
ok(Array.isArray(cast) && cast.length === Object.keys(G.CHARS).length,
   'allCodexKeys covers full CHARS, got=' + cast.length);
ok(cast.every(k => G.CHARS[k]), 'all keys valid');

const rows = G.splitCodexCastRows(cast, 3);
ok(Array.isArray(rows) && rows.length === 3, 'split into 3 rows');
ok(rows[0].length + rows[1].length + rows[2].length === cast.length, 'rows cover full cast');
ok(rows.every(r => r.length > 0), 'all rows non-empty');

G.openCodex();
ok(G.state && G.state.phase === 'codex', 'after openCodex phase=codex');
ok(G.state.codexIntro === 'full', 'state.codexIntro=full');
ok(ctx.localStorage.getItem(G.CODEX_INTRO_KEY) === '1', 'intro flag set after first visit');

// overlay element created
const el = ctx.document.getElementById('codexIntro');
ok(!!el, 'codexIntro element exists');
const html = String(el.innerHTML);
ok(html.indexOf('人 物 志') >= 0, 'overlay has title 人物志');
ok(html.indexOf('cxi-strips') >= 0, 'overlay has cxi-strips');
ok(html.indexOf('cxi-strip ltr') >= 0 || html.indexOf('ltr r') >= 0, 'has LTR row class');
ok(html.indexOf('rtl') >= 0, 'has RTL row class');
ok(html.indexOf('cxi-prog') >= 0, 'has progress readout');
ok(html.indexOf('cxi-freeze') >= 0, 'overlay has freeze frame');
/* 每行只挂 CODEX_MARQUEE_CELLS 格，而不是全量 key */
const cellCount = (html.match(/cxi-cell/g) || []).length;
const expectCells = G.CODEX_MARQUEE_CELLS * 3;
ok(cellCount === expectCells, 'DOM cells=' + cellCount + ' expect=' + expectCells + ' (recycle, not all 127)');
ok(html.indexOf('art/') >= 0, 'cells reference art paths');
ok(html.indexOf('群像轮映') >= 0, 'title sub mentions 轮映');

G.replayCodexIntro();
ok(String(el.innerHTML).indexOf('cxi-cell') >= 0, 'replay rebuilds strip cells');

G.leaveCodex();
ok(G.state.phase === 'title', 'leaveCodex -> title');
ok(el.hidden === true, 'leaveCodex hides overlay');

// second visit short
const mode1 = G.codexIntroMode();
ok(mode1 === 'short', 'second visit mode=short, got=' + mode1);
G.openCodex();
ok(G.state.codexIntro === 'short', 'state.codexIntro=short on revisit');

// reduced motion
ctx.window.matchMedia = function(){ return { matches:true }; };
ok(G.codexIntroMode() === 'skip', 'prefers-reduced-motion -> skip');
ctx.window.matchMedia = function(){ return { matches:false }; };

// empty CHARS fallback path
const cast2 = G.pickCodexCast(3);
ok(cast2.length > 0, 'pickCodexCast still works after rotation');

G.endCodexIntro(true);
console.log(fail ? ('FAIL ' + fail) : 'ALL PASS');
process.exit(fail ? 1 : 0);
