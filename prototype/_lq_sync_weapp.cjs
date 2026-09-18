'use strict';
/* 从 PC longque.js 生成 weapp 分包逻辑 */
const fs = require('fs');
const path = require('path');
const pc = require('./longque.js');

const out = `'use strict';
/* 笼中雀（小程序分包）· 场面链 + 行囊，无好感条。由 longque.js 同步，请改 PC 后重跑 _lq_sync_weapp.cjs */
const WX = (typeof wx !== 'undefined') ? wx : null;
function lsGet(k,d){ try{ const v=WX?WX.getStorageSync(k):null; return v==null||v===''?d:v; }catch(e){ return d; } }
function lsSet(k,v){ try{ if(WX) WX.setStorageSync(k,v); }catch(e){} }
let emit=function(){};
let LQ=null;

const LJTQ_PATHS = ${JSON.stringify(pc.LJTQ_PATHS)};
const LJTQ_DEEDS = ${JSON.stringify(pc.LJTQ_DEEDS)};
const LJTQ_ORIGINS = ${JSON.stringify(pc.LJTQ_ORIGINS)};
const LJTQ_INTERLUDES = ${JSON.stringify(pc.LJTQ_INTERLUDES)};
const LJTQ_ENDINGS = ${JSON.stringify(pc.LJTQ_ENDINGS)};
const LJTQ_NODES = ${JSON.stringify(pc.LJTQ_NODES)};
const LQ_TOTAL = Object.keys(LJTQ_ENDINGS).length;
function lqEndIco(k){ return k ? ('/packageLongque/assets/icon/end-lq-'+k+'.svg') : ''; }
function lqAbs(p){ if(!p) return ''; p=String(p); while(p.charAt(0)==='/'){ p=p.slice(1); } return '/packageLongque/'+p; }

function addPath(s,p,n){ if(p && s.path[p]!=null) s.path[p]+=(n==null?1:n); }
function addDeed(s,k){ if(k && s.deeds.indexOf(k)<0) s.deeds.push(k); }
function lean(s){
  const p=s.path, max=Math.max(p.li,p.qing,p.jian);
  if(max<=0) return '';
  const hits=[];
  if(p.li===max) hits.push('理');
  if(p.qing===max) hits.push('情');
  if(p.jian===max) hits.push('剑');
  return hits.join(' · ');
}
function seen(){ return lsGet('ljtq_v1',{endings:{},runs:0}); }
function unlock(key){
  const c=seen(); if(!c.endings) c.endings={};
  c.endings[key]=(c.endings[key]||0)+1; c.runs=(c.runs||0)+1;
  lsSet('ljtq_v1',c); return c.endings[key]===1;
}
function routeEnding(s){
  const m=s.marks||{};
  const has=(k)=> s.deeds.indexOf(k)>=0 || !!m[k];
  const p=s.path;
  const exit=m.exit_li?'li':(m.exit_qing?'qing':(m.exit_jian?'jian':null));
  if(m.bridge && !has('hanshan')) return 'qiaoliang';
  if(has('disciple') && has('hanshan') && has('protect_liu') && has('ning')
     && has('qiyuan') && p.li>=5 && p.qing>=5 && p.jian>=5) return 'cage_bird';
  if(has('hanshan') && has('zhuang') && p.jian>=Math.max(p.li,p.qing) && p.jian>=6) return 'jianpei';
  if(has('ning') && has('protect_liu') && p.jian>=5 && p.qing>=4) return 'ningyao';
  if(has('cuichan') && has('disciple') && p.li>=6) return 'guanqiju';
  if(has('yang_seal') && has('hanshan') && p.li>=5) return 'shouyue';
  if(has('disciple') && has('study') && p.li>=Math.max(p.qing,p.jian) && p.li>=6) return 'chunfeng';
  if(has('study') && p.li>=6 && !has('disciple')) return 'daoli';
  if(has('disciple') && p.li>=4 && !has('study')) return 'qiaoda';
  if(has('protect_liu') && has('help_gucan') && p.qing>=6) return 'yiqi';
  if(has('ruanxiu') && p.qing>=5) return 'ruanxiu';
  if(exit==='jian' && p.jian>=4) return 'jianpei';
  if(exit==='li' && has('disciple')) return 'chunfeng';
  if(exit==='qing' && p.qing>=4) return 'yiqi';
  if(p.jian>=5 && p.qing<3) return 'gulu';
  if(has('jing_fu') || (has('jing_watch') && p.qing<3 && p.li<4)) return 'jingdi';
  if(p.li>=4 && p.qing<3) return 'duju';
  return 'danshui';
}

function deedChips(s){
  return s.deeds.map(k=>{
    const d=LJTQ_DEEDS[k];
    return d ? { t:d.t, path:d.path||'' } : null;
  }).filter(Boolean);
}
function view(){
  if(!LQ) return { stage:'origin', total:LQ_TOTAL, seen:0 };
  const c=seen();
  const base={ stage:LQ.stage, total:LQ_TOTAL, seen:Object.keys(c.endings||{}).length, step:LQ.step };
  if(LQ.stage==='origin'){
    return Object.assign(base,{ origins:LJTQ_ORIGINS.map(o=>({k:o.k,t:o.t,mark:o.mark,d:o.d})) });
  }
  if(LQ.stage==='codex'){
    return Object.assign(base,{ runs:c.runs||0, codex:Object.keys(LJTQ_ENDINGS).map(k=>{
      const e=LJTQ_ENDINGS[k]; const got=!!(c.endings&&c.endings[k]);
      return { key:k, ico:lqEndIco(k), g:e.g, t:e.t, seen:got, d:got?e.d:'？？？', poem:got?(e.poem||''):'', n:got?c.endings[k]:0 };
    })});
  }
  if(LQ.stage==='il') return Object.assign(base,{ il:{ t:LQ.il.t, d:LQ.il.d, img:LQ.il.img ? lqAbs(LQ.il.img) : '' } });
  if(LQ.stage==='end'){
    const e=LJTQ_ENDINGS[LQ.endingKey]||LJTQ_ENDINGS.danshui;
    return Object.assign(base,{
      ending:{
        key:LQ.endingKey, ico:lqEndIco(LQ.endingKey), g:e.g, t:e.t, d:e.d, poem:e.poem||'',
        isNew:!!LQ._isNew, lean:lean(LQ), path:LQ.path, deeds:deedChips(LQ),
        trail:LQ.trail.map((x,i)=>({i:i+1,t:x.t,note:x.note}))
      }
    });
  }
  const nd=LJTQ_NODES[LQ.node];
  const prog=Math.min(100, Math.round((LQ.step/18)*100));
  return Object.assign(base,{
    node:{ ch:nd.ch, t:nd.t, d:nd.d, prog, img:nd.img ? lqAbs(nd.img) : '' },
    choices:(nd.ch2||[]).map((ch,i)=>({
      idx:i, txt:ch.txt, note:ch.note||'',
      path:ch.path||'', pathN:ch.path?(LJTQ_PATHS[ch.path]||{}).n:'',
      deed: (()=>{
        const a = ch.deed && LJTQ_DEEDS[ch.deed] ? LJTQ_DEEDS[ch.deed].t : '';
        const b = ch.deed2 && LJTQ_DEEDS[ch.deed2] ? LJTQ_DEEDS[ch.deed2].t : '';
        return [a,b].filter(Boolean).join(' / ');
      })()
    })),
    lean:lean(LQ), path:LQ.path, deeds:deedChips(LQ)
  });
}
function emitView(){ emit(view()); }

function init(fn){ emit=fn||function(){}; }
function start(){
  LQ={ stage:'origin', step:0, path:{li:0,qing:0,jian:0}, deeds:[], marks:{}, trail:[], ilUsed:{}, ilCount:0 };
  emitView();
}
function restart(){ start(); }
function back(){ start(); }
function openCodex(){ if(LQ){ LQ.stage='codex'; emitView(); } }
function pickOrigin(k){
  if(!LQ) start();
  const o=LJTQ_ORIGINS.filter(x=>x.k===k)[0]; if(!o) return;
  if(o.path) addPath(LQ,o.path,1);
  if(o.deed) addDeed(LQ,o.deed);
  LQ.origin=o.k; LQ.stage='play'; LQ.node='a1'; LQ.step=0;
  LQ.trail=[{t:'开局 · '+o.t,note:''}];
  emitView();
}
function choose(i){
  if(!LQ||LQ.stage!=='play') return;
  const nd=LJTQ_NODES[LQ.node]; if(!nd) return;
  const ch=(nd.ch2||[])[i]; if(!ch) return;
  if(ch.path) addPath(LQ,ch.path,1);
  if(ch.deed) addDeed(LQ,ch.deed);
  if(ch.deed2) addDeed(LQ,ch.deed2);
  if(ch.mark) LQ.marks[ch.mark]=1;
  LQ.trail.push({t:nd.t+' → '+ch.txt, note:ch.note||''});
  LQ.step++;
  if(nd.il && LQ.ilCount<3){
    const pool=LJTQ_INTERLUDES.filter((_,idx)=>!LQ.ilUsed[idx]);
    if(pool.length){
      const pick=pool[Math.floor(Math.random()*pool.length)];
      LQ.ilUsed[LJTQ_INTERLUDES.indexOf(pick)]=1; LQ.ilCount++;
      if(pick.path) addPath(LQ,pick.path,1);
      if(pick.deed) addDeed(LQ,pick.deed);
      LQ.il=pick; LQ.nextNode=ch.next; LQ.stage='il';
      emitView(); return;
    }
  }
  if(!ch.next||ch.next==='__end'||!LJTQ_NODES[ch.next]){ finish(); return; }
  LQ.node=ch.next; emitView();
}
function ilNext(){
  if(!LQ||LQ.stage!=='il') return;
  const nk=LQ.nextNode; LQ.il=null; LQ.nextNode=null;
  if(!nk||nk==='__end'||!LJTQ_NODES[nk]){ finish(); return; }
  LQ.node=nk; LQ.stage='play'; emitView();
}
function finish(){
  if(!LQ) return;
  const key=routeEnding(LQ);
  LQ.endingKey=key; LQ.stage='end'; LQ._isNew=unlock(key);
  emitView();
}
module.exports={ init,start,restart,back,openCodex,pickOrigin,choose,ilNext, LQ_TOTAL, LJTQ_ENDINGS, LJTQ_NODES, routeEnding, getState(){return LQ;} };
`;

fs.writeFileSync(path.join(__dirname, 'weapp/packageLongque/utils/longque.js'), out);
console.log('wrote weapp/packageLongque/utils/longque.js', 'bytes', out.length);

const ico = pc.LJTQ_END_ICO;
Object.keys(ico).forEach(k => {
  fs.writeFileSync(path.join(__dirname, 'weapp/packageLongque/assets/icon/end-lq-'+k+'.svg'), ico[k]+'\n');
});
console.log('svg', Object.keys(ico).length);
console.log('done');
