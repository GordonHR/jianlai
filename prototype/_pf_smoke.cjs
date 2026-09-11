const fs = require('fs');
const vm = require('vm');

const store = {};
const localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k,v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
const document = {
  getElementById: () => null,
  createElement: () => ({ set textContent(v){}, set id(v){}, appendChild(){} }),
  head: { appendChild(){} }
};
const CHARS = { chen:{name:'陈平安'}, ning:{name:'宁姚'} };
const AL_ENDINGS = { a:{}, b:{}, c:{} };
const SECT_ENDINGS = { s1:{}, s2:{} };
const SC_ENDINGS = { x1:{}, x2:{} };
const WSP = [{},{},{},{},{}];
const BF = { owned:['item1','item2'] };
const SFX = { set(){}, click(){} };
let renderCalls = 0;
function render(){ renderCalls++; }

const ctx = {
  localStorage, document, CHARS, AL_ENDINGS, SECT_ENDINGS, SC_ENDINGS, WSP, BF, SFX,
  render, console, Math, Date, JSON, Array, Object, String, parseInt, isNaN, RegExp
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('profile.js','utf8'), ctx, { filename:'profile.js' });

const log = [];
let fail = false;
function ok(c,m){ log.push((c?'PASS':'FAIL')+' '+m); if(!c) fail = true; }
function loadPF(){ return JSON.parse(store['jianlai_profile']||'null'); }

// 1. 择道
ctx.pfPick('jianxiu');
ok(loadPF() && loadPF().path==='jianxiu', 'pick jianxiu -> path set');
ok(ctx.pfRealms().length===15, 'LQ realms has 15 steps');

// 2. 刷 60 胜（ai normal 12xp each）应越过 3 个解锁点
for(let i=0;i<60;i++) ctx.prRecordBattle(true,'ai','normal',12,['chen']);
let lv = ctx.pfLevel();
ok(lv>=7, 'after 60 wins lv='+lv+' xp='+loadPF().xp);
let gs = ctx.pfGains(lv);
ok(gs.length>=3, 'gains unlocked='+gs.length+' ('+gs.map(g=>g.n).join('/')+')');
ok(loadPF().batt.total===60 && loadPF().batt.win===60, 'batt total/win='+loadPF().batt.total+'/'+loadPF().batt.win);
ok(loadPF().byChar.chen && loadPF().byChar.chen.p===60, 'byChar chen p='+(loadPF().byChar.chen&&loadPF().byChar.chen.p));

// 3. 入局注入：仅我方，hot 不注入
const players = [ { id:0, key:'chen', isAI:false, extraSkills:[] }, { id:1, key:'ning', isAI:true, extraSkills:[] } ];
ctx.prApplyRealm(players, 'ai');
ok(players[0].extraSkills.length===gs.length, 'hero injected '+players[0].extraSkills.length+' skills');
ok((players[1].extraSkills||[]).length===0, 'ai not injected in ai mode');
const hot = [ { id:0, key:'chen', extraSkills:[] } ];
ctx.prApplyRealm(hot, 'hot');
ok((hot[0].extraSkills||[]).length===0, 'hot -> no injection');

// 4. 结局 / 匣斋 / 阅览
ctx.prRecordEnding('sect','s1','建宗大典', true);
ok(loadPF().seen.sect.s1===1, 'sect ending seen');
ctx.prRecordEnding('sect','s1','建宗大典', false);
ok(loadPF().seen.sect.s1===2, 'sect replay increments');
ctx.prRecordBaofu('real','某物');
ok(true, 'baofu ok');
const xpB = loadPF().xp;
ctx.prRecordRead('codex','chen','陈平安');
const xpAfter1 = loadPF().xp;
ctx.prRecordRead('codex','chen','陈平安');   // 第二次应去重，不加道行
const xpAfter2 = loadPF().xp;
ok(loadPF().read.codex.chen===1 && xpAfter2===xpAfter1 && xpAfter1>xpB, 'codex read once, dedup no double xp');
for(let i=1;i<=25;i++) ctx.prRecordRead('wsp', i, '面'+i);
ok(loadPF().read.wsp===25, 'wsp count='+loadPF().read.wsp);

// 5. 武夫路径（WU 12 境）换道后境界表切换
ctx.pfSetPath('wufu');
ok(ctx.pfRealms().length===13, 'WU realms has 13 steps (9+止境3+武神)');
ok(ctx.pfThresholds()[0]===0, 'WU thresholds ok');

// 6. 渲染
const app = { innerHTML:'' };
ctx.renderProfile(app);
ok(app.innerHTML.indexOf('行 迹 录')>=0, 'renderProfile rendered len='+app.innerHTML.length);
ok(app.innerHTML.indexOf('破 境')>=0, 'renderProfile shows broke banner');

// 7. 改名号
ctx.pfSetName('test道号');
ok(loadPF().name==='test道号', 'setName ok');

// 8. 持久化往返
const raw = localStorage.getItem('jianlai_profile');
ok(raw && JSON.parse(raw).path==='wufu', 'persisted to localStorage');

console.log(log.join('\n'));
console.log('RESULT: ' + (fail ? 'FAIL' : 'ALL PASS'));
fs.writeFileSync('_pf_smoke_out.txt', (fail?'FAIL\n':'PASS\n') + log.join('\n'));
