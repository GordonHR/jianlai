/* 玩家档案（profile.js）全模块集成冒烟：加载全部游戏脚本（含 profile/baofuzhai），
   验证首屏行迹录卡、开档案、择道、实战结算埋点、入局注入、匣斋埋点、返回标题 全链路不崩且生效。
   临时脚本，跑完即删。 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = __dirname;
const files = ['briefs.js','figfx.js','juice.js','game.js','sect.js','shenci.js','tales.js','wushipai.js','baofuzhai.js','profile.js'];
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
  addEventListener: function(){}, removeEventListener: function(){},
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
var __LOG=[];
function T(n,fn){ try{ fn(); __LOG.push('PASS '+n); }catch(e){ __LOG.push('FAIL '+n+' :: '+e.message+' @ '+((e.stack||'').split('\\n')[1]||'').trim()); } }
var app=document.getElementById('app');

T('01 顶层求值 + profile 函数齐全', function(){
  if(typeof render!=='function') throw new Error('render 未定义');
  if(typeof pfPick!=='function') throw new Error('pfPick 未定义');
  if(typeof prRecordBattle!=='function') throw new Error('prRecordBattle 未定义');
  if(typeof prApplyRealm!=='function') throw new Error('prApplyRealm 未定义');
  if(typeof openProfile!=='function') throw new Error('openProfile 未定义');
});

T('02 首屏含行迹录修士卡', function(){
  render();
  if(app.innerHTML.indexOf('行迹录')<0) throw new Error('标题屏缺少行迹录卡片');
});

T('03 开档案 -> 未择道显示择道界面', function(){
  openProfile();
  if(app.innerHTML.indexOf('择 道')<0) throw new Error('未显示择道界面');
});

T('04 择剑修后显示境界条', function(){
  pfPick('jianxiu');
  if(app.innerHTML.indexOf('境 界')<0) throw new Error('择道后无境界区块');
  if(app.innerHTML.indexOf('剑修')<0) throw new Error('未显示所选道途');
});

T('05 实战结算写入道行与战绩', function(){
  state = { phase:'game', mode:'ai', players:[{id:0,key:'chen',isAI:false},{id:1,key:'ning',isAI:true}], round:12 };
  difficulty='normal';
  updateRecord(true,'ai');
  var pf=JSON.parse(localStorage.getItem('jianlai_profile')||'null');
  if(!pf) throw new Error('jianlai_profile 未写入');
  if(pf.batt.total!==1) throw new Error('batt.total='+pf.batt.total);
  if(pf.batt.win!==1) throw new Error('batt.win='+pf.batt.win);
  if(pf.byChar.chen.p!==1) throw new Error('byChar chen p='+(pf.byChar.chen&&pf.byChar.chen.p));
});

T('06 入局仅注入我方（ai 模式，需先攒道行破境）', function(){
  // 攒道行至至少第 3 境（剑骨 at:3，xp>=110）
  for(var i=0;i<12;i++){ updateRecord(true,'ai'); }
  var pf=JSON.parse(localStorage.getItem('jianlai_profile')||'null');
  if(pf.xp<110) throw new Error('xp 不足未破境 xp='+pf.xp);
  var players=[{id:0,key:'chen',isAI:false,extraSkills:[]},{id:1,key:'ning',isAI:true,extraSkills:[]}];
  prApplyRealm(players,'ai');
  if(players[0].extraSkills.length<1) throw new Error('我方未注入收益 len='+players[0].extraSkills.length);
  if(players[1].extraSkills.length!==0) throw new Error('敌方被误注入');
});

T('07 匣斋拣漏入行迹', function(){
  prRecordBaofu('real','某物');
  var pf=JSON.parse(localStorage.getItem('jianlai_profile')||'null');
  var hasBaofu = pf.log.some(function(l){ return l.s.indexOf('包袱斋')>=0; });
  if(!hasBaofu) throw new Error('匣斋埋点未进 log');
});

T('08 返回标题仍显示修士卡（含境界进度）', function(){
  openProfileBack();
  render();
  if(app.innerHTML.indexOf('行迹录')<0) throw new Error('返回标题丢失修士卡');
  if(app.innerHTML.indexOf('道行')<0) throw new Error('修士卡无道行');
});

__LOG.forEach(function(l){ console.log(l); });
console.log('INT ' + (__LOG.filter(function(l){return l.indexOf('FAIL')>=0;}).length ? 'FAIL' : 'ALL PASS'));
`;

const ctx = { console, Math, Date, JSON, Array, Object, String, parseInt, isNaN, RegExp, Number };
vm.createContext(ctx);
vm.runInContext(stub, ctx, { filename:'stub' });
files.forEach(f => { vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename:f }); });
vm.runInContext(drv, ctx, { filename:'drv' });
