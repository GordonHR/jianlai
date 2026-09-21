/* 校验：地图视口贴合（无黑边）逻辑
   1) 抽出主图 fitBox 源码，在 vm 中用假元素跑真实尺寸；
   2) 断言 viewBox 宽高比 == 舞台宽高比（→ 不再出现留边）；
   3) 断言 1600×1100 内容框完整落在 viewBox 内（内容不被裁）；
   4) 断言满铺矩形（海面/纸面）覆盖 viewBox 全域（→ 多出的部分有内容，不露底色）；
   5) 断言骊珠层满铺矩形在缩放组之外（不随缩放平移）。
*/
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT='C:/Users/Administrator/Desktop/jianlai';
const MAIN=path.join(ROOT,'pc-map','浩然天下地图.html');
const src=fs.readFileSync(MAIN,'utf8').replace(/\r/g,'');
let fail=0, pass=0;
const ok=(c,m)=>{ if(c){pass++;} else {fail++; console.log('FAIL: '+m);} };

/* ---- 抽 fitBox ---- */
const fm=src.match(/function fitBox\(el,bw,bh\)\{[\s\S]*?\n\}/);
ok(!!fm,'fitBox 未找到');
const ctx={Math};
vm.createContext(ctx);
vm.runInContext(fm[0]+'\nthis.fitBox=fitBox;',ctx);
const fitBox=ctx.fitBox;

const sizes=[[1080,530,'当前截图窗口'],[1920,1080,'1080p'],[2560,1080,'21:9'],[3440,1440,'21:9 高分'],
  [5120,1440,'32:9'],[390,844,'竖屏手机'],[1024,1366,'竖屏平板'],[800,600,'4:3'],[1280,800,'16:10']];
/* 满铺矩形范围（与代码常量一致） */
const BLEED_W={x0:-4000,x1:5600,y0:-4000,y1:5100};
const BLEED_L={x0:-4000,x1:5600,y0:-4000,y1:5000};

function run(bw,bh,W,H,bleed,baseW,baseH,tag){
  const el={getBoundingClientRect:()=>({left:0,top:0,width:W,height:H}),vb:null,
    setAttribute:(k,v)=>{ el.vb=v; }};
  const r=fitBox(el,bw,bh);
  ok(!!r,'['+tag+'] fitBox 返回空（尺寸保护触发）');
  if(!r) return;
  const [x,y,w,h]=r;
  ok(Math.abs(w/h - W/H) < 1e-9, '['+tag+'] viewBox 宽高比 '+ (w/h).toFixed(9) +' ≠ 舞台 '+(W/H).toFixed(9)+'（会留边）');
  ok(x<=1e-6 && y<=1e-6 && x+w>=baseW-1e-6 && y+h>=baseH-1e-6, '['+tag+'] 内容框被裁：x='+x.toFixed(1)+' y='+y.toFixed(1)+' w='+w.toFixed(1)+' h='+h.toFixed(1));
  ok(x>=bleed.x0 && x+w<=bleed.x1 && y>=bleed.y0 && y+h<=bleed.y1, '['+tag+'] 满铺矩形覆盖不足：需 x∈['+x.toFixed(0)+','+(x+w).toFixed(0)+'] y∈['+y.toFixed(0)+','+(y+h).toFixed(0)+']');
  const k=W/w;
  const kMeet=Math.min(W/baseW,H/baseH);
  ok(Math.abs(k-kMeet)<1e-9,'['+tag+'] 内容缩放 '+k.toFixed(4)+' ≠ 完整可见缩放 '+kMeet.toFixed(4)+'（内容大小被改变）');
  const zoomOut=0.6; /* 最小缩放：scene 可视范围 = viewBox / scale */
  ok(x/zoomOut>=bleed.x0 && (x+w)/zoomOut<=bleed.x1 && y/zoomOut>=bleed.y0 && (y+h)/zoomOut<=bleed.y1,
     '['+tag+'] 缩到 60% 后满铺矩形覆盖不足');
  console.log('  '+tag.padEnd(12)+' '+String(W)+'x'+String(H)+'  viewBox='+[x,y,w,h].map(n=>n.toFixed(1)).join(' ')+'  内容缩放='+k.toFixed(4)+'  倍率×'+ (k>0? (1/1).toFixed(0):'') +'');
}
console.log('== 总图 #map（1600×1100）==');
sizes.forEach(([W,H,t])=>run(1600,1100,W,H,BLEED_W,1600,1100,t));
console.log('== 骊珠层 #lizhuMap（1400×1000）==');
sizes.forEach(([W,H,t])=>run(1400,1000,W,H,BLEED_L,1400,1000,'骊珠 '+t));

/* ---- 结构断言 ---- */
ok(/\.ocean-bleed\{\s*pointer-events:none/.test(src),'缺 .ocean-bleed 样式');
ok((src.match(/s\+=bleedBase\(painted\);/g)||[]).length===2,'满铺底色注入点应为 world+zhou 共 2 处');
ok(/'#9dafb6':'var\(--ocean1\)'/.test(src),'满铺底色取值不符（绘卷应取底图边色、矢量取海色）');
ok((src.match(/s\+=BLEED_WAVE;/g)||[]).length===2,'BLEED_WAVE 注入点应为 world+zhou 共 2 处');
ok(/const BLEED_RECT='x="-4000" y="-4000" width="9600" height="9100"';/.test(src),'BLEED_RECT 常量不符');
const lzIdx=src.indexOf('<g id="lizhuViewport">');
const lzBleed=src.indexOf('class="ocean-bleed"');
ok(lzBleed>0 && lzBleed<lzIdx,'骊珠满铺矩形必须在 #lizhuViewport 之前（否则会跟着缩放平移）');
ok(/fitLizhuVB\(\);\s*\n\s*resetLizhu\(\);/.test(src),'enterLizhu 未在重置前贴合视口');
ok(/fitStage\(\);\s*\n\s*resetT\(\);\s*renderZhou\('bao'\);/.test(src),'exitLizhu 未重新贴合总图视口');
ok(/^fitStage\(\);\s*$/m.test(src),'初始化未调用 fitStage');
ok(/window\.addEventListener\('resize',fitStage\);/.test(src),'缺 resize 监听');
ok(!/r\.width\*1600|r\.height\*1100/.test(src),'仍残留写死的 1600/1100 坐标换算');
console.log('\n== 结果 ==  pass='+pass+'  fail='+fail);
process.exit(fail?1:0);
