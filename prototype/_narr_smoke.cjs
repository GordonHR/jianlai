/* 叙事模块小程序端自走探针：验证演出层(FX)真触发 + 整局不报错 + 结局可达性审计
 * 用法: node _narr_smoke.cjs [局数] [种子]
 *
 * 重要：选项必须随机化，不能固定取「第 0 个可行项」。
 *   固定取第 0 项会让自走变成确定性单线，结局分布 100% 撞同一个键，
 *   「结局可达性审计」因此完全失真（曾因此误判「因果归宿判定退化」）。
 *   此处用 mulberry32 种子随机，保证可复现且覆盖度真实。
 */
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = __dirname;
const sect = require(path.join(ROOT, 'weapp/utils/sect.js'));
const shenci = require(path.join(ROOT, 'weapp/utils/shenci.js'));

/** 从源码文本中截取 `const NAME = {` 起、到花括号配平为止的整块并求值。
 *  扫描时跳过字符串/模板/注释，避免内容里的括号干扰配平。
 *  （结局表未导出，只能走文本；好处是键集永远与源码一致，不会像手写清单那样失真） */
function evalBlock(file, name){
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const m = new RegExp('^const ' + name + '\\s*=\\s*\\{', 'm').exec(src);
  if(!m) return null;
  let i = src.indexOf('{', m.index), d = 0, q = null;
  for(; i < src.length; i++){
    const c = src[i];
    if(q){
      if(c === '\\'){ i++; continue; }
      if(c === q) q = null;
      continue;
    }
    if(c === '\'' || c === '"' || c === '`'){ q = c; continue; }
    if(c === '/' && src[i+1] === '/'){ i = src.indexOf('\n', i); if(i < 0) break; continue; }
    if(c === '/' && src[i+1] === '*'){ i = src.indexOf('*/', i) + 1; continue; }
    if(c === '{') d++;
    else if(c === '}'){ d--; if(d === 0) return eval('(' + src.slice(src.indexOf('{', m.index), i+1) + ')'); }
  }
  return null;
}

/* 可复现的种子随机（mulberry32） */
function mkRng(seed){
  let a = seed >>> 0;
  return function(){
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let RNG = mkRng(20260903);
const pick = arr => arr[Math.floor(RNG() * arr.length)];
/** 从候选项中随机挑一个可行项；无可行项返回 -1 */
function pickOpt(opts){
  const oks = [];
  opts.forEach((o, i) => { if (o.ok !== false) oks.push(i); });
  return oks.length ? pick(oks) : -1;
}

function playSect(){
  sect.open('normal');
  let guard = 0, fxSteps = 0, steps = 0;
  const endings = {}, evSeen = new Set();
  while(guard++ < 1200){
    const v = sect.view();
    if(v.over){ endings[v.ending ? v.ending.key : '?'] = (endings[v.ending ? v.ending.key : '?']||0)+1; break; }
    steps++;
    if(v.fxBanners && v.fxBanners.length) fxSteps++;
    if(v.fxFloats && v.fxFloats.length) fxSteps++;
    if(v.prologue){ sect.closePrologue(); continue; }
    if(v.events && v.events.length){
      const ev = v.events[0]; evSeen.add(ev.id);
      const oi = pickOpt(ev.opts);
      if(oi < 0){ sect.sectSkipEvent(ev.idx); continue; }
      sect.sectResolveEvent(ev.idx, oi);
      continue;
    }
    if(v.settling){ sect.sectEnterNext(); continue; }
    // 常规行动也随机化：一味 sectSettle 会让弟子恒为 0，触发「弟子尽散」结局，
    // 掩盖其余结局的真实可达性。寻访/营造/讲道等按概率穿插。
    const r = RNG();
    if(r < 0.22) { try{ sect.sectRecruitSeek(); }catch(e){ sect.sectSettle(); } }
    else if(r < 0.34){ try{ sect.sectPreach(); }catch(e){ sect.sectSettle(); } }
    else if(r < 0.44){ try{ sect.sectBreak(); }catch(e){ sect.sectSettle(); } }
    else sect.sectSettle();
  }
  return { endings, evSeen:[...evSeen], fxSteps, steps, guard };
}

function playShenci(){
  shenci.open('normal');
  shenci.pickDomain('shan'); shenci.pickDiff('normal'); shenci.start();
  let guard = 0, fxSteps = 0, steps = 0;
  const endings = {}, evSeen = new Set();
  while(guard++ < 1500){
    const v = shenci.view();
    if(v.phase === 'over'){ endings[v.ending ? v.ending.key : '?'] = (endings[v.ending ? v.ending.key : '?']||0)+1; break; }
    steps++;
    if(v.fxBanners && v.fxBanners.length) fxSteps++;
    if(v.fxFloats && v.fxFloats.length) fxSteps++;
    if(v.phase === 'pick'){ shenci.pickDomain('shan'); shenci.pickDiff('normal'); shenci.start(); continue; }
    if(v.wishes && v.wishes.length){
      const w = v.wishes[0]; evSeen.add(w.id);
      const oi = pickOpt(w.opts);
      if(oi < 0){ shenci.skip(w.idx); continue; }
      shenci.resolve(w.idx, oi);
      continue;
    }
    if(v.phase === 'settle'){ shenci.enterNext(); continue; }
    shenci.settle();
  }
  return { endings, evSeen:[...evSeen], fxSteps, steps, guard };
}

const N = process.argv[2] ? parseInt(process.argv[2],10) : 120;
const SEED = process.argv[3] ? parseInt(process.argv[3],10) : 20260903;
RNG = mkRng(SEED);
let err = 0;
const allEndSect = {}, allEndShen = {};
let sectFx = 0, shenFx = 0, sectSteps = 0, shenSteps = 0;
const sectEv = new Set(), shenEv = new Set();

for(let i=0;i<N;i++){
  try{
    const a = playSect();
    Object.keys(a.endings).forEach(k=>allEndSect[k]=(allEndSect[k]||0)+1);
    sectFx += a.fxSteps; sectSteps += a.steps; a.evSeen.forEach(e=>sectEv.add(e));
    if(a.guard >= 1200) console.log('  [sect] 局'+i+' 触 guard 上限（可能卡死）');
  }catch(e){ err++; if(err<=3) console.log('  [sect] 局'+i+' 抛错: '+e.message); }
  try{
    const b = playShenci();
    Object.keys(b.endings).forEach(k=>allEndShen[k]=(allEndShen[k]||0)+1);
    shenFx += b.fxSteps; shenSteps += b.steps; b.evSeen.forEach(e=>shenEv.add(e));
    if(b.guard >= 1500) console.log('  [shenci] 局'+i+' 触 guard 上限（可能卡死）');
  }catch(e){ err++; if(err<=3) console.log('  [shenci] 局'+i+' 抛错: '+e.message); }
}

console.log('=== 叙事模块小程序端自走 ('+N+' 局/端) ===');
console.log('错误局数: '+err+' / '+(N*2));
console.log('落魄山: 总步 '+sectSteps+' · 演出层可见步 '+sectFx+' ('+(sectFx/sectSteps*100).toFixed(1)+'%) · 触发事件 '+sectEv.size+' 类');
console.log('  结局分布: '+JSON.stringify(allEndSect));
console.log('山水祠: 总步 '+shenSteps+' · 演出层可见步 '+shenFx+' ('+(shenFx/shenSteps*100).toFixed(1)+'%) · 触发事件 '+shenEv.size+' 类');
console.log('  结局分布: '+JSON.stringify(allEndShen));

// 结局全集：直接派生自源码，不用手写清单
// （旧版手写清单混入了卡牌引擎的键如 siege_win/S/demon，导致 17 条全是假警报）
const KNOWN_SECT = Object.keys(evalBlock('weapp/utils/sect.js', 'SECT_ENDINGS') || {});
const KNOWN_SHEN = Object.keys(evalBlock('weapp/utils/shenci.js', 'SC_ENDINGS') || {});
if(!KNOWN_SECT.length || !KNOWN_SHEN.length){
  console.log('!! 结局表解析失败，可达性审计跳过（sect='+KNOWN_SECT.length+' shenci='+KNOWN_SHEN.length+'）');
}
const deadSect = KNOWN_SECT.filter(k=>!(k in allEndSect));
const deadShen = KNOWN_SHEN.filter(k=>!(k in allEndShen));
console.log('落魄山 结局键 '+KNOWN_SECT.length+' 个 · 随机自走未触及 '+deadSect.length+' 个: '+(deadSect.length?deadSect.join(', '):'无'));
console.log('山水祠 结局键 '+KNOWN_SHEN.length+' 个 · 随机自走未触及 '+deadShen.length+' 个: '+(deadShen.length?deadShen.join(', '):'无'));
console.log(err===0 ? 'NARR_SMOKE_OK' : 'NARR_SMOKE_FAIL');
