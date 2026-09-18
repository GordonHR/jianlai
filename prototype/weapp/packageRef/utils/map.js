'use strict';
/* ==========================================================================
 * 天下舆图 · 剑来世界地理  （map.js · 小程序端 no-DOM 移植）
 * 数据源自 prototype 两幅 PC 地图 HTML（浩然天下堪舆总图 / 骊珠洞天古地图），
 * 经脚本忠实抽取为 mapdata.js，本文件只做快照推送与下钻逻辑，不渲染 DOM/SVG。
 *
 * 结构：浩然天下（五方·九洲）→ 各洲要地/势力/航路 → 骊珠洞天（详图）。
 * 严守原著：未明载之山头、地名不臆造；相关人物索引打通人物志称谓。
 * ========================================================================== */
const DATA = require('./mapdata.js');

const WX = (typeof wx !== 'undefined') ? wx : null;
function vb(t){ if(WX && WX.vibrateShort){ try{ WX.vibrateShort({ type:(t||'light') }); }catch(e){} } }
const SFX = { click(){ vb('light'); }, ok(){ vb('medium'); } };

const WORLD_INTRO =
  '浩然天下为《剑来》世界之主体，分五方（中·东·南·西·北），内含九洲。中土神州居中央，文庙总庙所在，统筹天下规矩、发行神仙钱；东宝瓶洲在最东，面积最小，却是本书故事的起点；北俱芦洲剑修密度冠绝九洲；皑皑洲富甲一方；流霞洲隐世；金甲洲武夫边关；扶摇洲为蛮荒主战场、战后残破；桐叶洲物产丰饶；南婆娑洲亚圣文脉、倒悬山雄踞。天下东接剑气长城，长城以东，便是蛮荒天下——妖族祖地，与浩然隔城对峙。';

const LIZHU_INTRO =
  '骊珠洞天，三十六小洞天之一，悬于东宝瓶洲最北端，如一粒珠子高挂天际，隶属大骊，是九洲中最小的一处洞天。三千年前，世间最后一条真龙被三教一家围杀，残魂化「骊珠」囚于锁龙井，洞天因而得名，并由万法宗师三山九侯先生亲手布置「困龙局」。三十余年前珠壁破碎、洞天坠地；齐静春一力担下因果，兵解前代师收徒陈平安。洞天压制内部修行，外来高阶修士法力亦暂被压制。此处，是陈平安的故乡，也是一切的起点。';

let level = 'world';
let zhouKey = null;
let selPlace = null;     // 当前洲内选中要地
let selLizhu = null;     // 骊珠洞天内选中地点
let HOOK = null;

function charsOf(placeKey){
  return (DATA.PLACE_CHARS[placeKey] || []).map(function(k){ return DATA.CHARNAMES[k] || k; });
}
function worldView(){
  return {
    ready:true, level:'world',
    intro: WORLD_INTRO,
    worlds: DATA.worlds.map(function(w){ return { key:w.key, name:w.name, sub:w.sub }; }),
    lizhu: { name:'骊珠洞天', sub:'东宝瓶洲最北端 · 故事起点' },
    manhuang: { name:'蛮荒天下', sub:'剑气长城以东 · 妖族祖地' },
    place:null
  };
}
function zhouView(){
  const z = DATA.ZHOU[zhouKey] || { name:zhouKey, sub:'', realms:[], places:[], roads:[] };
  const places = (z.places||[]).map(function(p){
    return { key:p.key, name:p.name, tag:p.tag, desc:p.desc, chars:charsOf(p.key) };
  });
  const roads = (z.roads||[]).map(function(r){
    return { name:r.name, via:((r.from&&r.to) ? (r.from+' ↔ '+r.to) : ''), desc:r.desc };
  });
  const realms = (z.realms||[]).map(function(r){ return { name:r.name, desc:r.desc }; });
  const rels = (DATA.RELS[zhouKey]||[]).map(function(k){
    const zn = (DATA.ZHOU[k] && DATA.ZHOU[k].name) || k; return { key:k, name:zn };
  });
  let place = null;
  if(selPlace){
    const p = (z.places||[]).filter(function(x){ return x.key===selPlace; })[0];
    if(p) place = { name:p.name, tag:p.tag, desc:p.desc, chars:charsOf(p.key) };
  }
  return { ready:true, level:'zhou', zhouKey:zhouKey, name:z.name, sub:z.sub, realms:realms, places:places, roads:roads, rels:rels, place:place };
}
function lizhuView(){
  const groups = {}; const order = [];
  DATA.LIZHU.forEach(function(p){
    if(!groups[p.tag]){ groups[p.tag] = []; order.push(p.tag); }
    groups[p.tag].push({ key:p.key, name:p.name, desc:p.desc });
  });
  const g = order.map(function(t){ return { tag:t, places:groups[t] }; });
  let place = null;
  if(selLizhu){
    const p = DATA.LIZHU.filter(function(x){ return x.key===selLizhu; })[0];
    if(p) place = { name:p.name, tag:p.tag, desc:p.desc };
  }
  return { ready:true, level:'lizhu', name:'骊珠洞天', sub:'东宝瓶洲最北端 · 三十六小洞天最小', intro:LIZHU_INTRO, groups:g, place:place };
}
function view(){
  if(level==='zhou') return zhouView();
  if(level==='lizhu') return lizhuView();
  return worldView();
}
function emitView(){ if(HOOK) try{ HOOK(view()); }catch(e){ console.error(e); } }
function setHook(fn){ HOOK = fn; emitView(); }
function open(){ level='world'; zhouKey=null; selPlace=null; selLizhu=null; emitView(); }

function drill(k){ SFX.click(); level='zhou'; zhouKey=k; selPlace=null; emitView(); }
function drillLizhu(){ SFX.click(); level='lizhu'; selLizhu=null; emitView(); }
function backWorld(){ SFX.click(); level='world'; emitView(); }
function showPlace(k){ SFX.click(); selPlace=k; emitView(); }
function showLizhuPlace(k){ SFX.click(); selLizhu=k; emitView(); }
function closePlace(){ selPlace=null; selLizhu=null; emitView(); }

module.exports = {
  setHook:setHook, emitView:emitView, open:open,
  drill:drill, drillLizhu:drillLizhu, backWorld:backWorld,
  showPlace:showPlace, showLizhuPlace:showLizhuPlace, closePlace:closePlace,
  view:view
};
