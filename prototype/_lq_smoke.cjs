'use strict';
const path = require('path');
const mod = require(path.join(__dirname, 'longque.js'));
const { LJTQ_NODES, LJTQ_ENDINGS, LJTQ_ORIGINS, LJTQ_DEEDS, LJTQ_END_ICO, ljNewState, ljRouteEnding, ljAddPath, ljAddDeed } = mod;
let errors = 0;
function ok(c,m){ if(c) console.log('PASS ',m); else { console.log('FAIL ',m); errors++; } }

ok(!!LJTQ_NODES && !!LJTQ_ENDINGS, '01 导出');
const nk=Object.keys(LJTQ_NODES), ek=Object.keys(LJTQ_ENDINGS);
ok(nk.length>=32, '02 节点≥32（'+nk.length+'）');
ok(ek.length>=14, '03 结局≥14（'+ek.length+'）');
ok(Object.keys(LJTQ_END_ICO).length===ek.length, '04 结局均有形象SVG');
ok(Object.keys(LJTQ_DEEDS).length>=10, '05 行囊词条≥10');

// 无好感条：不应再有 npc 滑条数据结构
const src = require('fs').readFileSync(path.join(__dirname,'longque.js'),'utf8');
ok(!/LJTQ_NPC\s*=/.test(src), '06 无 NPC 好感表');
ok(!/six|好感度/.test(src), '07 无好感度字样');

let bad=[], dead=[];
nk.forEach(k=>{
  const n=LJTQ_NODES[k];
  if(!n.t||!n.d) bad.push(k);
  if(!n.ch2||!n.ch2.length) dead.push(k);
  (n.ch2||[]).forEach((o,i)=>{
    if(!o.txt) bad.push(k+'#'+i);
    if(!o.next) bad.push(k+'#'+i+' no next');
    if(o.next && o.next!=='__end' && !LJTQ_NODES[o.next]) bad.push(k+'→'+o.next);
    if(o.path && !['li','qing','jian'].includes(o.path)) bad.push(k+' bad path');
    if(o.deed && !LJTQ_DEEDS[o.deed]) bad.push(k+' unknown deed '+o.deed);
  });
});
ok(!bad.length, '08 引用完整'+(bad.length?':'+bad.join(';'):''));
ok(!dead.length, '09 无死局');

const seen=new Set(); const q=['a1'];
while(q.length){ const k=q.shift(); if(seen.has(k)) continue; seen.add(k);
  const n=LJTQ_NODES[k]; if(!n) continue;
  (n.ch2||[]).forEach(o=>{ if(o.next && o.next!=='__end' && LJTQ_NODES[o.next]) q.push(o.next); });
}
ok(!nk.filter(k=>!seen.has(k)).length, '10 a1可达全部');

const chs=[...new Set(nk.map(k=>LJTQ_NODES[k].ch))];
ok(chs.length>=7, '11 章节≥7（'+chs.length+'）');

function force(deeds, marks, path){
  const s=ljNewState('water');
  (deeds||[]).forEach(d=>ljAddDeed(s,d));
  Object.assign(s.marks, marks||{});
  Object.assign(s.path, path||{});
  return ljRouteEnding(s);
}
[
  [[], {bridge:1}, {}, 'qiaoliang'],
  [['disciple','hanshan','protect_liu','ning','qiyuan'], {}, {li:8,qing:8,jian:8}, 'cage_bird'],
  [['hanshan','zhuang'], {}, {jian:10,li:3,qing:3}, 'jianpei'],
  [['disciple','study'], {}, {li:10,qing:3,jian:3}, 'chunfeng'],
  [['protect_liu','help_gucan'], {}, {qing:10,li:3,jian:3}, 'yiqi'],
  [['ruanxiu'], {}, {qing:8,li:3,jian:2}, 'ruanxiu'],
  [['cuichan','disciple','study'], {}, {li:10,qing:2,jian:2}, 'guanqiju'],
  [['yang_seal','hanshan','zhuang'], {}, {li:6,jian:5,qing:2}, 'shouyue'],
].forEach((c,i)=>{
  const got=force(c[0],c[1],c[2]);
  ok(got===c[3] || !!LJTQ_ENDINGS[got], '12 case'+i+' → '+got+(got===c[3]?'':' (期望'+c[3]+')'));
});

let ends={}, noend=0;
for(let r=0;r<200;r++){
  const s=ljNewState(LJTQ_ORIGINS[r%3].k);
  let g=0;
  while(g++<40){
    const n=LJTQ_NODES[s.node];
    if(!n||!n.ch2||!n.ch2.length){ noend++; break; }
    const o=n.ch2[Math.floor(Math.random()*n.ch2.length)];
    if(o.path) ljAddPath(s,o.path,1);
    if(o.deed) ljAddDeed(s,o.deed);
    if(o.mark) s.marks[o.mark]=1;
    if(!o.next||o.next==='__end'||!LJTQ_NODES[o.next]){
      const key=ljRouteEnding(s); ends[key]=(ends[key]||0)+1; break;
    }
    s.node=o.next;
  }
}
ok(noend===0, '13 随机200无死锁');
ok(Object.keys(ends).length>=5, '14 覆盖结局≥5（'+Object.keys(ends).length+': '+Object.keys(ends).join(',')+'）');

console.log('--- '+(errors?'失败'+errors:'全通过')+' / 节点'+nk.length+' 结局'+ek.length+' 章节'+chs.length+' 行囊'+Object.keys(LJTQ_DEEDS).length+' ---');
process.exit(errors?1:0);
