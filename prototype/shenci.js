/* ==========================================================================
 * 山水祠 · 一方水土   （shenci.js）
 * 自包含模块：原著依据 / CSS / FX / 配置 / 状态 / 旬循环 / 祈愿 / 越界 / 天劫 / 结局 / 渲染
 * 由 game.js 的 render() 依 state.phase==='shenci' 分派到 renderShenci(app)
 *
 * ── 原著依据（2026-08-31 查证，来源：快懂百科「剑来」「魏檗」词条 + 有声书原文）
 *  · 神道品秩：北岳正神 / 山君 > 山神（辖百里）> 土地公；河伯辖一条河水；
 *    城隍需朝廷敕封、着礼部特制官服，行走阴间约束鬼魅。
 *  · 香火即经济：「大香客更换了烧香的门庭，从山神庙去了水神祠，
 *    那可关系着每年小十万两白银。」（有声书 1154 集）
 *  · 神位可废：魏檗因庇护旧国遗民触怒大骊皇帝，神位被废，金身被打碎沉江，
 *    自北岳正神贬为棋墩山土地公。（快懂百科「魏檗」）
 *  · 铁律：「世间狐精不可成为山神是铁律。」（有声书 544 集）
 *  · 冲境代价：山水神祇若想冲击仙人境，需渡过凶险异常的神道天劫，
 *    且极易脱离山水根基、失去神职依托。
 *  · 越界：山神涉水、水神上山会引发邻神冲突，惊动城隍则被斥责。
 *  · 陈平安后期遍访浩然天下山水神灵，以全部功德换取众神点燃心香，
 *    共同祈福修复桐叶洲。（快懂百科「剑来」）
 *
 * ── 与落魄山的界线（勿混）
 *    落魄山经营的是「人」：弟子、飞剑、银钱。
 *    山水祠经营的是「信」：香火、气数、阴德、威灵。
 *    且本作主角是神不是人 —— 只能「应」或「不应」，不能直接下场。
 * ========================================================================== */

/* ===================== 样式 ===================== */
(function(){
  if(document.getElementById('sc-css')) return;
  const st = document.createElement('style');
  st.id = 'sc-css';
  st.textContent = `
/* 演出层：挂 body，因 renderShenci 会整屏重写 #app */
#sc-fx{position:fixed;inset:0;pointer-events:none;z-index:9000;overflow:hidden}
.sc-float{position:absolute;font-size:14px;font-weight:500;letter-spacing:1px;
  animation:sc-float-up 1.5s ease-out forwards;white-space:nowrap;
  text-shadow:0 1px 2px rgba(0,0,0,.6)}
@keyframes sc-float-up{
  0%{opacity:0;transform:translate(-50%,0) scale(.9)}
  15%{opacity:1;transform:translate(-50%,-8px) scale(1)}
  100%{opacity:0;transform:translate(-50%,-52px) scale(1)}
}
.sc-banner{position:absolute;left:50%;top:34%;transform:translateX(-50%);
  text-align:center;animation:sc-banner-in 1.9s ease-out forwards;pointer-events:none}
.sc-banner .bt{font-size:30px;font-weight:500;letter-spacing:8px;color:#e8b45f}
.sc-banner .bs{font-size:13px;letter-spacing:4px;color:#9fb0a6;margin-top:6px}
@keyframes sc-banner-in{
  0%{opacity:0;transform:translateX(-50%) scale(.94)}
  12%{opacity:1;transform:translateX(-50%) scale(1)}
  78%{opacity:1}
  100%{opacity:0;transform:translateX(-50%) scale(1.02)}
}

/* 容器 */
.sc{max-width:900px;margin:0 auto;padding:24px 18px 40px;
  color:#d8e0dc;font-family:"Songti SC","SimSun",serif}
.sc-head{text-align:center;padding:16px 14px 14px;margin-bottom:14px;
  border:1px solid #2c3a33;background:#141c18;border-radius:2px}
.sc-hero{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px}
.sc-hero .seal{width:44px;height:44px;border:1px solid #b4453c;color:#b4453c;
  display:flex;align-items:center;justify-content:center;font-size:20px;border-radius:2px;
  background:#1b1311;flex:none}
.sc-hero .hname{font-size:20px;letter-spacing:4px;color:#e8cf8f}
.sc-hero .hsub{font-size:12px;letter-spacing:2px;color:#8fa098;margin-top:3px}
.sc-timer{font-size:12px;color:#8fa098;line-height:1.9;letter-spacing:1px}
.sc-timer b{color:#e8cf8f;font-weight:500}

/* 资源条 */
.sc-res{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px}
.sc-res .ri{display:flex;align-items:center;gap:6px;border:1px solid #2c3a33;background:#151e19;padding:5px 12px;
  border-radius:2px;font-size:12px;letter-spacing:1px;color:#9fb0a6}
.sc-res .ri .ico{display:inline-flex;width:26px;height:26px;flex:0 0 26px}
.sc-res .ri .ico svg{display:block}
.sc-res .ri .lbl{white-space:nowrap}
.sc-res .ri b{color:#e8cf8f;font-size:14px;font-weight:500;margin-left:2px}
.sc-res .ri.warn b{color:#d98b6a}
.sc-res .ri.good b{color:#8fc49b}

/* 叙事节拍 */
.sc-mood{text-align:center;font-size:14px;color:#a8bdb1;line-height:1.9;
  padding:12px 16px;margin-bottom:14px;border-left:2px solid #2c3a33;border-right:2px solid #2c3a33;
  background:#131a16;letter-spacing:1px}

/* 主舞台：本旬香火 */
.sc-stage{border:1px solid #3a4a42;background:#16201b;border-radius:2px;
  padding:14px 16px 16px;margin-bottom:14px}
.sc-stage h3{font-size:14px;letter-spacing:5px;color:#e8cf8f;font-weight:500;
  margin:0 0 4px;text-align:center}
.sc-stage .st-sub{font-size:12px;color:#7f9088;text-align:center;margin-bottom:12px;letter-spacing:1px}
.sc-empty{text-align:center;font-size:13px;color:#7f9088;padding:18px 0;letter-spacing:2px}

/* 祈愿卡 */
.sc-wish{border:1px solid #2f3d35;background:#18221d;padding:12px 14px;margin-bottom:10px;border-radius:2px}
.sc-wish.urgent{border-color:#6a3b33;background:#1b1615}
.sc-wish.rite{border-color:#3a4a52;background:#141c1f}
.sc-w-title{font-size:15px;color:#e8cf8f;letter-spacing:2px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #2c3a33}
.sc-w-who{font-size:12px;color:#7f9088;letter-spacing:1px;margin-bottom:8px}
.sc-w-desc{font-size:13px;line-height:1.95;color:#c3cec8;margin-bottom:11px;padding-bottom:11px;border-bottom:1px dashed #223029;letter-spacing:.6px}
.sc-w-opts{display:flex;flex-direction:column;gap:8px;align-items:stretch}
.sc-w-opts .sc-btn{flex:0 0 auto}
.sc-w-opts .sc-btn.sc-opt{flex:1 1 100%;min-width:100%;box-sizing:border-box}

/* 事件选项图标 */
.sc-opt-ico{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;margin-right:10px;border:1px solid rgba(232,198,106,.4);border-radius:50%;background:rgba(20,17,15,.55);color:#e8cf8f;font-size:13px;line-height:1;flex-shrink:0;font-family:serif}
.sc-opt-ico svg{width:14px;height:14px;display:block}
.sc-wish.urgent .sc-opt-ico{border-color:rgba(217,139,106,.55);color:#e0916a}
.sc-wish.urgent .sc-opt-ico svg{stroke:#e0916a}
.sc-wish.rite .sc-opt-ico{border-color:rgba(180,160,90,.55);color:#e0c87f}
.sc-opt .sc-opt-body{display:inline-flex;align-items:center}
.sc-opt .sc-opt-body>span:not(.sc-opt-ico){vertical-align:middle}

/* 开关/按钮 */
.sc-btn{display:inline-block;padding:7px 16px;font-size:13px;letter-spacing:2px;
  border:1px solid #3a4a42;background:#18211c;color:#c3cec8;cursor:pointer;
  border-radius:2px;font-family:inherit;transition:background .15s,border-color .15s}
.sc-btn:hover{background:#1f2b24;border-color:#4d6157}
.sc-btn.primary{border-color:#8a6a2f;background:#241d10;color:#e8cf8f}
.sc-btn.primary:hover{background:#2d2413}
.sc-btn.ghost{border-color:#2c3a33;background:transparent;color:#8fa098}
.sc-btn.ghost:hover{background:#18211c;color:#c3cec8}
.sc-btn.sm{padding:5px 12px;font-size:12px;letter-spacing:1px}
.sc-btn:disabled{opacity:.4;cursor:not-allowed;border-color:#263029;color:#6a7a71}
.sc-btn:disabled:hover{background:#18211c;border-color:#263029}
.sc-lock{font-size:11px;color:#8a6a5a;letter-spacing:1px;margin-left:6px}
/* 事件选项：与落魄山 .sect-opt 同规格（padding / 字号 / 行高 / 最小高度 / 圆角 一致） */
.sc-opt{padding:10px 14px;font-size:14px;line-height:1.5;min-height:44px;letter-spacing:1px;border-radius:2px}
.sc-opt .sc-lock{font-size:12px;color:#8a6a5a;letter-spacing:1px;margin-left:8px}
/* 搁置：与正常选项同长宽、同图标圆章，仅压暗边框/底以示「暂缓」语义 */
.sc-opt.skip-opt{ border-color:rgba(232,198,106,.16); background:rgba(20,17,15,.38); }
.sc-opt.skip-opt span:last-child{ color:#b9ad8f; }
/* 禁用态：不再用整体 opacity 淡化——那会把「为何不能选」的原因一起吃掉。
   改为压暗底色与边框，正文保留可读对比度，锁定原因反而提亮，便于看清约束。 */
.sc-opt:disabled{opacity:1;cursor:not-allowed;border-color:#2a332e;background:#111714;color:#7f8d85}
.sc-opt:disabled:hover{background:#111714;border-color:#2a332e}
.sc-opt:disabled .sc-lock{color:#e0916a}
.sc-w-prog{text-align:center;font-size:12px;color:#7f9088;letter-spacing:2px;margin-bottom:10px}
.sc-w-prog b{color:#e8cf8f;font-weight:500}
.sc-w-more{text-align:center;font-size:12px;color:#6f8079;letter-spacing:1px;margin-top:4px;font-style:italic}

/* 行动栏 */
.sc-ap{text-align:center;font-size:12px;color:#8fa098;margin-bottom:8px;letter-spacing:1px}
.sc-ap b{color:#e8cf8f;font-weight:500}
.sc-actions{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;margin:6px 0 14px;padding-top:14px;border-top:1px solid #2c3a33}

/* 抽屉 */
.sc-drawer-mask{position:fixed;inset:0;background:rgba(6,10,8,.62);z-index:400}
.sc-drawer{position:fixed;right:0;top:0;bottom:0;width:min(560px,92vw);z-index:401;
  background:#121a16;border-left:1px solid #2c3a33;overflow-y:auto;padding:16px 16px 40px}
.sc-drawer-h{display:flex;justify-content:space-between;align-items:center;
  font-size:15px;letter-spacing:6px;color:#e8cf8f;margin-bottom:12px;
  padding-bottom:10px;border-bottom:1px solid #26332c}
.sc-panel{border:1px solid #26332c;background:#151e19;padding:11px 13px;margin-bottom:11px;border-radius:2px}
.sc-panel h3{font-size:13px;letter-spacing:4px;color:#e8cf8f;font-weight:500;margin:0 0 8px}
.sc-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:620px){.sc-grid{grid-template-columns:1fr}}
.sc-kv{display:flex;justify-content:space-between;font-size:12px;color:#9fb0a6;
  padding:4px 0;border-bottom:1px dashed #223029;letter-spacing:1px}
.sc-kv:last-child{border-bottom:none}
.sc-kv b{color:#d8e0dc;font-weight:500}
.sc-log{font-size:12px;line-height:1.9;color:#9fb0a6;max-height:230px;overflow-y:auto;letter-spacing:.5px}
.sc-log .good{color:#8fc49b}
.sc-log .bad{color:#d98b6a}
.sc-log .big{color:#e8cf8f;letter-spacing:2px}

/* 册目题头 */
.sc-prologue{border:1px solid #3a4a42;background:#131a16;padding:20px 22px;
  margin-bottom:14px;text-align:center;border-radius:2px}
.sc-prologue .pl-sub{font-size:12px;color:#7f9088;letter-spacing:3px;margin-bottom:8px}
.sc-prologue .pl-title{font-size:22px;color:#e8cf8f;letter-spacing:6px;margin-bottom:12px}
.sc-prologue .pl-body{font-size:13px;line-height:2.1;color:#b3c0b9;
  white-space:pre-wrap;text-align:left;letter-spacing:.8px}
.sc-prologue .pl-turn{margin-top:14px}

/* 结局 */
.sc-ending{border:1px solid #3a4a42;background:#141c18;padding:30px 26px;text-align:center;border-radius:2px}
.sc-ending .grade{font-size:38px;letter-spacing:6px;color:#e8cf8f;margin-bottom:6px}
.sc-ending .grade.g-A{color:#c9d4cd}.sc-ending .grade.g-B{color:#9fb0a6}
.sc-ending .grade.g-C{color:#c98b6a}.sc-ending .grade.g-D{color:#8fa098}
.sc-ending .et{font-size:19px;letter-spacing:6px;color:#e8cf8f;margin-bottom:14px}
.sc-ending .ed{font-size:13px;line-height:2.1;color:#b3c0b9;max-width:600px;
  margin:0 auto 16px;text-align:left;letter-spacing:.8px}
.sc-ending .ep{font-size:14px;line-height:2;color:#a8bdb1;letter-spacing:2px;
  border-top:1px solid #26332c;padding-top:14px;max-width:600px;margin:0 auto 12px}
.sc-ending .erec{font-size:12px;line-height:2;color:#8fa098;max-width:600px;margin:0 auto;letter-spacing:1px}
.sc-back{text-align:center;margin-top:16px}

/* 开场：择山或择水 */
.sc-pick{max-width:760px;margin:0 auto;padding:40px 18px;text-align:center}
.sc-pick .pk-t{font-size:22px;letter-spacing:8px;color:#e8cf8f;margin-bottom:8px}
.sc-pick .pk-s{font-size:13px;letter-spacing:2px;color:#8fa098;line-height:2;margin-bottom:26px}
.sc-pick .pk-cards{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.sc-pick .pk-card{width:280px;border:1px solid #2c3a33;background:#141c18;
  padding:22px 18px;cursor:pointer;border-radius:2px;transition:border-color .15s,background .15s}
.sc-pick .pk-card:hover{border-color:#8a6a2f;background:#191f17}
.sc-pick .pk-seal{width:60px;height:60px;margin:0 auto 12px;
  display:flex;align-items:center;justify-content:center;color:#b4453c;line-height:0}
.sc-pick .pk-n{font-size:17px;letter-spacing:4px;color:#e8cf8f;margin-bottom:6px}
.sc-pick .pk-d{font-size:12px;line-height:2;color:#9fb0a6;letter-spacing:1px;text-align:left}
.sc-pick .pk-diff{margin-top:26px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap}

/* 本旬中转页 */
.sc-settle{text-align:center;padding:40px 18px}
.sc-settle .st-head{font-size:30px;letter-spacing:10px;color:#e8cf8f;margin-bottom:8px}
.sc-settle .st-sub{font-size:13px;color:#9ed4be;letter-spacing:2px;margin-bottom:24px}
.sc-settle .st-ledger{max-width:520px;margin:0 auto 18px;border:1px solid #2c3a33;background:#141c18;border-radius:2px;overflow:hidden}
.sc-settle .st-row{display:flex;align-items:center;gap:12px;padding:13px 22px;border-bottom:1px solid #26332c}
.sc-settle .st-row:last-child{border-bottom:none}
.sc-settle .st-ico{width:26px;height:26px;flex:0 0 26px;display:flex;align-items:center;justify-content:center;color:#8a9a90}
.sc-settle .st-ico svg{display:block}
.sc-settle .st-k{flex:1;text-align:left;font-size:14px;color:#9fb0a6;letter-spacing:2px}
.sc-settle .st-v{display:flex;flex-direction:column;align-items:flex-end;gap:3px;text-align:right}
.sc-settle .st-v .sv-net{font-size:18px;font-weight:bold;line-height:1.1;color:#b9ad8f;font-family:"KaiTi","STKaiti",serif}
.sc-settle .st-v .sv-sub{font-size:11px;line-height:1.15;color:#7f8f86;letter-spacing:1px;font-family:"KaiTi","STKaiti",serif}
.sc-settle .st-row.up .st-v .sv-net{color:#8fc49b}
.sc-settle .st-row.down .st-v .sv-net{color:#d98b6a}
.sc-settle .st-stats{max-width:520px;margin:0 auto 18px;display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #2c3a33;background:#141c18;border-radius:2px;overflow:hidden}
.sc-settle .st-stat{padding:12px 6px 11px;border-right:1px solid #26332c;display:flex;flex-direction:column;align-items:center;gap:5px}
.sc-settle .st-stat:last-child{border-right:none}
.sc-settle .st-stat .st-sico{width:22px;height:22px;display:flex;align-items:center;justify-content:center;color:#8a9a90}
.sc-settle .st-stat .st-sico svg{display:block}
.sc-settle .st-stat b{font-size:18px;font-weight:bold;color:#b9ad8f;font-family:"KaiTi","STKaiti",serif;line-height:1.2}
.sc-settle .st-stat span{font-size:11px;color:#7f8f86;letter-spacing:2px}
.sc-settle .st-stat.up b{color:#8fc49b}
.sc-settle .st-stat.down b{color:#d98b6a}
.sc-settle .st-stat.gold b{color:#e8cf8f}
.sc-settle .st-notes{max-width:560px;margin:0 auto 14px}
.sc-settle .st-note{font-size:12px;color:#8fa098;line-height:1.8;font-style:italic}
.sc-settle .st-backlog{font-size:12px;color:#d98b6a;margin-bottom:18px}
/* 本旬中转 · 入场动效：卷轴铺开，逐行落账 */
@keyframes stSeal{
  0%{opacity:0;transform:scale(1.14);letter-spacing:26px;filter:blur(6px)}
  60%{opacity:1}
  100%{opacity:1;transform:scale(1);letter-spacing:10px;filter:blur(0)}
}
@keyframes stFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes stUnroll{0%{opacity:0;transform:scaleY(.62)}100%{opacity:1;transform:scaleY(1)}}
@keyframes stRowIn{0%{opacity:0;transform:translateX(-14px);filter:blur(3px)}100%{opacity:1;transform:translateX(0);filter:blur(0)}}
@keyframes stNumIn{0%{opacity:0;transform:scale(1.16)}70%{opacity:1}100%{opacity:1;transform:scale(1)}}
.sc-settle .st-head{animation:stSeal .56s cubic-bezier(.2,.8,.3,1) both}
.sc-settle .st-sub{animation:stFadeUp .46s ease-out .20s both}
.sc-settle .st-label{animation:stFadeUp .40s ease-out both}
.sc-settle .st-label.ledger-l{animation-delay:.30s}
.sc-settle .st-ledger{transform-origin:top center;animation:stUnroll .42s cubic-bezier(.2,.8,.3,1) .32s both}
.sc-settle .st-row{animation:stRowIn .32s ease-out both}
.sc-settle .st-v{animation:stNumIn .26s ease-out both}
.sc-settle .st-row:nth-child(1){animation-delay:.42s}.sc-settle .st-row:nth-child(1) .st-v{animation-delay:.50s}
.sc-settle .st-row:nth-child(2){animation-delay:.49s}.sc-settle .st-row:nth-child(2) .st-v{animation-delay:.57s}
.sc-settle .st-row:nth-child(3){animation-delay:.56s}.sc-settle .st-row:nth-child(3) .st-v{animation-delay:.64s}
.sc-settle .st-row:nth-child(4){animation-delay:.63s}.sc-settle .st-row:nth-child(4) .st-v{animation-delay:.71s}
.sc-settle .st-row:nth-child(5){animation-delay:.70s}.sc-settle .st-row:nth-child(5) .st-v{animation-delay:.78s}
.sc-settle .st-row:nth-child(6){animation-delay:.77s}.sc-settle .st-row:nth-child(6) .st-v{animation-delay:.85s}
.sc-settle .st-label.stats-l{animation-delay:.84s}
.sc-settle .st-stats{animation:stFadeUp .42s ease-out .88s both}
.sc-settle .st-notes{animation:stFadeUp .42s ease-out .94s both}
.sc-settle .st-backlog{animation:stFadeUp .42s ease-out .98s both}
.sc-settle .sc-btn.primary{animation:stFadeUp .44s ease-out 1.02s both}
  `;
  document.head.appendChild(st);
})();

/* ===================== 演出层（挂 body） ===================== */
function scFXInit(){
  if(document.getElementById('sc-fx')) return;
  const d = document.createElement('div');
  d.id = 'sc-fx';
  document.body.appendChild(d);
}
function scFXClear(){
  const d = document.getElementById('sc-fx');
  if(d) d.innerHTML = '';
}
let scBannerQueue = [];
let scBannerBusy = false;
function scBanner(title, sub, cls){
  scFXInit();
  scBannerQueue.push({ title, sub, cls });
  if(!scBannerBusy) scBannerShow();
}
function scBannerShow(){
  if(!scBannerQueue.length){ scBannerBusy = false; return; }
  scBannerBusy = true;
  const b = scBannerQueue.shift();
  const host = document.getElementById('sc-fx');
  if(!host){ scBannerBusy = false; return; }
  const d = document.createElement('div');
  d.className = 'sc-banner';
  d.innerHTML = '<div class="bt">'+b.title+'</div>'+(b.sub?'<div class="bs">'+b.sub+'</div>':'');
  host.appendChild(d);
  setTimeout(()=>{ if(d.parentNode) d.parentNode.removeChild(d); scBannerShow(); }, 1900);
}
/* 飘字落位：左右交替成斜阶，逐枚下沉一行。
   任意两枚之间，要么横向拉开 ≥100px，要么纵向拉开 ≥60px，绝不叠成一坨。 */
function scFloatSlot(i){
  const n = (i==null ? 0 : i);
  const side = (n % 2 === 0) ? -1 : 1;          // 左右交替
  const row  = Math.floor(n / 2);                // 每两枚下沉一行
  const dx = side * (58 + row * 18) + (Math.random()*8-4);
  const dy = -54 + Math.min(n, 7) * 34 + (Math.random()*8-4);
  return { dx, dy };
}
function scFloat(text, cls, i){
  scFXInit();
  const host = document.getElementById('sc-fx');
  if(!host) return;
  const d = document.createElement('div');
  d.className = 'sc-float';
  d.textContent = text;
  const col = { 香火:'#e8b45f', 气数:'#8fc49b', 阴德:'#c3cec8', 威灵:'#9fb8d0',
                香客:'#e8cf8f', 神职:'#b4453c', bad:'#d98b6a' };
  d.style.color = col[cls] || (cls==='bad' ? '#d98b6a' : '#e8cf8f');
  const p = scFloatSlot(i);
  d.style.left = (window.innerWidth/2 + p.dx) + 'px';
  d.style.top  = (window.innerHeight*0.52 + p.dy) + 'px';
  host.appendChild(d);
  setTimeout(()=>{ if(d.parentNode) d.parentNode.removeChild(d); }, 1500);
}
function scFlushFx(s){
  if(!s.fxQueue || !s.fxQueue.length) return;
  const q = s.fxQueue; s.fxQueue = [];
  let i = 0;
  q.forEach(f=>{
    setTimeout(()=>{ scFloat((f.v>0?'+':'')+f.v+' '+f.k, f.k, i); }, i*170);
    i++;
  });
}

/* ===================== 配置 ===================== */
const SC_DIFF = {
  easy:   { key:'easy',   name:'简 单', 香火:46, 气数:52, 阴德:6,  威灵:16, 香客:13, tithe:1.25 },
  normal: { key:'normal', name:'普 通', 香火:32, 气数:42, 阴德:0,  威灵:10, 香客:10, tithe:1.00 },
  hard:   { key:'hard',   name:'困 难', 香火:22, 气数:34, 阴德:-6, 威灵:6,  香客:8,  tithe:0.80 },
};

/* 神道品秩（原著：北岳正神 / 山君 > 山神(辖百里) > 土地公；河伯辖一河） */
const SC_RANKS = {
  shan: [
    { name:'土地公', desc:'辖一山一隅，位卑言轻' },
    { name:'山神',   desc:'辖百里地界' },
    { name:'山君',   desc:'一山之主，可辖三十余山头' },
    { name:'北岳正神', desc:'执掌千里地界，护水土扛文运' },
  ],
  shui: [
    { name:'土地公', desc:'辖一水一隅，位卑言轻' },
    { name:'河伯',   desc:'辖一条两百里河水' },
    { name:'水君',   desc:'一水之主，江湖河渠皆在其手' },
    { name:'江河正神', desc:'执掌千里水域，享万民香火' },
  ],
};
const SC_RANK_MAX = 3;

/* 冲境（神道天劫）门槛：香火 + 阴德 */
const SC_ASCEND_NEED = [
  { 香火:0,   阴德:0,  气数:0  },
  { 香火:110, 阴德:6,  气数:42 },   // 土地 → 山神/河伯
  { 香火:220, 阴德:16, 气数:46 },   // 山神 → 山君/水君
  { 香火:270, 阴德:30, 气数:48 },   // 山君 → 正神
];

/* 辖地类型 */
/* 印章 SVG（古典木刻·朱文，去 AI 化细线条）：山印/水印 + 卡面复用 */
const SC_SVG_SHAN = '<svg viewBox="0 0 46 46" width="46" height="46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
  + '<path d="M7 34 Q11 27 16 24 Q19 22.5 21 27 Q23.5 21 26 19 Q28.5 22.5 31 25 Q34 23 36 21 Q38 25 40 34 Z" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
  + '<path d="M13.5 30 Q14.2 31 15 32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
  + '<path d="M22 26 Q22.5 27 23 28" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
  + '<path d="M29 28 Q29.8 29 30.5 30" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
  + '</svg>';
const SC_SVG_SHUI = '<svg viewBox="0 0 46 46" width="46" height="46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
  + '<path d="M7 16 Q13 11, 19 16 T 31 16 T 40 16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<path d="M7 24 Q13 19, 19 24 T 31 24 T 40 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<path d="M7 32 Q13 27, 19 32 T 31 32 T 40 32" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  + '</svg>';

/* 资源条器物图标：单色描边、stroke-width 2、round 端点/转角、无渐变光晕。
   颜色用 currentColor，由 .ri .ico 的 color 控制（金 #e8cf8f）。viewBox 一律 0 0 30 30。
   —— 与印章同一条视觉纪律：柔和不尖角、稍粗。 */
const SC_ICO = {
  // 香火：双耳三足香炉 + 炉口烟 + 灰积（灰积横线数随 ratio 增多）
  xianghuo(ratio){
    const r = (ratio==null?0.5:Math.max(0,Math.min(1,ratio)));
    const layers = Math.max(0, Math.round(r*3)); // 0~3 道灰积
    const ashY = [22, 19, 16];
    let ash='';
    for(let i=0;i<layers;i++){
      ash += '<line x1="'+(9+0.5*i)+'" y1="'+ashY[i]+'" x2="'+(21-0.5*i)+'" y2="'+ashY[i]+'" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity="'+(0.35+0.3*(i+1))+'"/>';
    }
    return '<svg viewBox="0 0 30 30" width="26" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<path d="M5 13 Q15 11 25 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M6 14 L9 26 L21 26 L24 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
      + '<path d="M7 11 Q4 11 4 14 Q4 16 7 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<path d="M23 11 Q26 11 26 14 Q26 16 23 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<path d="M8 26 L7 28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M15 26 L15 28.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M22 26 L23 28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M15 11 Q12 8 14 5 Q17 3 15 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
      + ash + '</svg>';
  },
  // 气数：圆底水潭 + 容量刻度线 + 水面波纹
  qishui(ratio){
    const r = (ratio==null?0.5:Math.max(0,Math.min(1,ratio)));
    const fillY = 14 + (1-r)*13; // 水位：值越高越靠上
    return '<svg viewBox="0 0 30 30" width="26" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<path d="M3 12 L3 19 Q3 27 15 27 Q27 27 27 19 L27 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
      + '<line x1="3" y1="14" x2="27" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".5"/>'
      + '<line x1="3" y1="17" x2="27" y2="17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".3"/>'
      + '<path d="M5 '+fillY.toFixed(1)+' Q9 '+(fillY-1.5).toFixed(1)+' 13 '+fillY.toFixed(1)+' T 21 '+fillY.toFixed(1)+' T 27 '+fillY.toFixed(1)+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<circle cx="11" cy="9" r="0.8" fill="currentColor"/>'
      + '<circle cx="16" cy="7" r="0.8" fill="currentColor"/>'
      + '<circle cx="20" cy="9" r="0.8" fill="currentColor"/>'
      + '</svg>';
  },
  // 阴德：竹简绳扎 + 简边竖纹 + 刻痕（刻痕数随 ratio 增多，0~4）
  yinde(ratio){
    const r = (ratio==null?0.5:Math.max(0,Math.min(1,ratio)));
    const n = Math.max(0, Math.round(r*4)); // 0~4 道刻痕
    const yPos = [13, 15.5, 18, 20.5];
    let marks='';
    for(let i=0;i<4;i++){
      const op = i<n ? (0.55+0.15*i) : 0.18;
      marks += '<line x1="11" y1="'+yPos[i]+'" x2="19" y2="'+yPos[i]+'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-opacity="'+op+'"/>';
    }
    return '<svg viewBox="0 0 30 30" width="26" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<path d="M4 8 L26 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M4 25 L26 23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<line x1="7" y1="10" x2="7" y2="22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".4"/>'
      + '<line x1="23" y1="9" x2="23" y2="21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".4"/>'
      + marks + '</svg>';
  },
  // 威灵：完整方印（外框+内框+印纽+篆字「令」）
  weiling(){
    return '<svg viewBox="0 0 30 30" width="26" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<rect x="5" y="5" width="20" height="20" rx="1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
      + '<rect x="8" y="8" width="14" height="14" rx="0.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-opacity=".5"/>'
      + '<path d="M12 5 L12 2 Q15 0 18 2 L18 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<path d="M15 12 L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M12 14 L18 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M12 17 L18 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '</svg>';
  },
  // 香客：人形（头+袍服）+ 点阵（亮点数随 ratio，0~5）
  xiangke(ratio){
    const r = (ratio==null?0.5:Math.max(0,Math.min(1,ratio)));
    const n = Math.max(1, Math.round(r*5)); // 1~5 个亮人
    let dots='';
    for(let i=0;i<5;i++){
      dots += '<circle cx="'+(5+i*5)+'" cy="27" r="1.5" fill="currentColor" fill-opacity="'+(i<n?1:0.25)+'"/>';
    }
    return '<svg viewBox="0 0 30 30" width="26" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<circle cx="15" cy="9" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/>'
      + '<path d="M9 19 Q9 14 15 14 Q21 14 21 19 L21 22 L9 22 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
      + dots + '</svg>';
  },
  // 信心：心形（外沿 + 内衬一重，取「民心所向」）
  xinxin(){
    return '<svg viewBox="0 0 30 30" width="26" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<path d="M15 25.5 Q5.5 18.5 5.5 12 Q5.5 8 9 8 Q12 8 15 11 Q18 8 21 8 Q24.5 8 24.5 12 Q24.5 18.5 15 25.5 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
      + '<path d="M15 20 Q10.5 16.4 10.5 13 Q10.5 11.2 12 11.2 Q13.5 11.2 15 12.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-opacity=".45" stroke-linecap="round"/>'
      + '</svg>';
  },
  // 准：圆印 + 勾（所奏已应）
  zhun(){
    return '<svg viewBox="0 0 30 30" width="22" height="22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<circle cx="15" cy="15" r="11" fill="none" stroke="currentColor" stroke-width="2"/>'
      + '<circle cx="15" cy="15" r="8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-opacity=".45"/>'
      + '<path d="M10 15.4 L13.6 19 L20.4 11.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>';
  },
  // 驳：圆印 + 叉（所奏未应）
  bo(){
    return '<svg viewBox="0 0 30 30" width="22" height="22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<circle cx="15" cy="15" r="11" fill="none" stroke="currentColor" stroke-width="2"/>'
      + '<circle cx="15" cy="15" r="8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-opacity=".45"/>'
      + '<path d="M10.8 10.8 L19.2 19.2 M19.2 10.8 L10.8 19.2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
      + '</svg>';
  },
  // 搁：悬绳木牌（待批未决）
  ge(){
    return '<svg viewBox="0 0 30 30" width="22" height="22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<path d="M15 4.5 L15 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
      + '<path d="M7.5 13.5 L7.5 24 Q7.5 26.5 10 26.5 L20 26.5 Q22.5 26.5 22.5 24 L22.5 13.5 Q22.5 9.5 15 8.8 Q7.5 9.5 7.5 13.5 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
      + '<circle cx="15" cy="12" r="1.4" fill="none" stroke="currentColor" stroke-width="1.4"/>'
      + '<line x1="11" y1="18" x2="19" y2="18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-opacity=".5"/>'
      + '<line x1="11" y1="22" x2="19" y2="22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-opacity=".32"/>'
      + '</svg>';
  },
};

// 资源满值基准（用于刻度比例）
const SC_RES_CAP = { 香火:400, 气数:100, 阴德:30, 威灵:40, 香客:null };

function scResRatio(k, s){
  if(k==='香客') return Math.max(0, Math.min(1, s.香客 / scXkCap(s)));
  if(k==='威灵') return Math.max(0, Math.min(1, s.res.威灵 / SC_RES_CAP.威灵));
  const cap = SC_RES_CAP[k] || 1;
  const v = (s.res[k]!=null ? s.res[k] : 0);
  return Math.max(0, Math.min(1, v / cap));
}

const SC_DOMAIN = {
  shan: { key:'shan', seal:SC_SVG_SHAN, name:'棋墩山土地', 神名:'山神', 邻名:'埋河水神',
    desc:'辖棋墩山一带百里山地。山民、猎户、采药人是你的香客；\n山下的溪涧与山中的精魅，皆在你的眼皮底下。',
    origin:'棋墩山——前北岳正神魏檗被贬为土地公时，曾在此坐镇。他因庇护旧国遗民触怒大骊，金身碎、沉江底，才换来这一方土地的安稳。你今日坐的，正是他踩过的那方土。' },
  shui: { key:'shui', seal:SC_SVG_SHUI, name:'埋河水神', 神名:'河伯', 邻名:'棋墩山山神',
    desc:'辖埋河一条两百里河水。船家、渔户、行商是你的香客；\n水底的精怪与两岸的田地，皆系于你一念之间。',
    origin:'埋河——陈平安出藕花福地后，于此结识埋河水神，亲授其「顺序之学」。水有章法，河知进退，皆是那人留下的规矩。你承这河伯之位，便接下了这份秩序。' },
};

const SC_XK_MAX = 30;             // 香客上限（一方水土的规模感，不滚雪球）

/* 香客上限随「脱根」下压 —— 原著：冲境极易脱离山水根基、失去神职依托。
   位阶越高，辖内对你的感应越弱：爬得上去，未必守得住。脱根3 时上限仅 12，
   而正神需「香客 >= 初始」，窗口极窄 —— 这便是「脚下的土薄了一寸」。 */
function scXkCap(s){ return Math.max(6, SC_XK_MAX - s.脱根*4); }

/* 旬制 */
const SC_TOTAL_XUN = 48;          // 四十八旬
const SC_SEASONS = ['春','夏','秋','冬'];
function scSeason(s){ return SC_SEASONS[(Math.floor((s.xun-1)/3))%4]; }
function scYearOf(s){ return Math.floor((s.xun-1)/12)+1; }

/* ===================== 状态 ===================== */
function newScState(domKey, diffKey){
  const d = SC_DIFF[diffKey] || SC_DIFF.normal;
  return {
    dom: domKey || 'shan',
    diff: diffKey || 'normal',
    xun: 1, ap: 3,
    res: { 香火:d.香火, 气数:d.气数, 阴德:d.阴德, 威灵:d.威灵 },
    香客: d.香客,          // 香客户数
    信心: 55,              // 百姓信不信你
    rank: 0,               // 神道品秩 0-3
    脱根: 0,               // 冲境次数 = 脱离山水根基的程度（原著：冲境易失根基）
    越界: 0,               // 越界干预累积
    rel: { 邻神:0, 城隍:0, 百姓:0 },
    tithe: d.tithe,
    events: [],
    backlog: 0,
    flags: {},
    nodeFired: {},
    over: false, ending: null,
    ui: 'main',
    ciwu: false,           // 祠务抽屉默认收起
    log: [],
    fxQueue: [],
    trail: [],
    noAnswerStreak: 0,     // 连续「不应」次数
    qiZeroStreak: 0,       // 气数见底的旬数（连续 3 旬则神位不保）
    xunStats: { 应:0, 不应:0, 搁置:0 },  // 本旬所奏统计（应 / 不应 / 搁置）
    prologue: null,
    pick: null,            // 'pick' 时显示开场择地
    settling: false,       // 本旬已结算、待确认进入下一旬（中转页）
    lastSettle: null,
    turnStart: null,       // 本回合开始基线（抉择尚未落地），账本「所奏」对照点
  };
}

/* ===================== 工具 ===================== */
function scClamp(s){
  const r = s.res;
  r.香火 = Math.max(0, Math.min(999, r.香火));
  r.气数 = Math.max(0, Math.min(100, r.气数));
  r.阴德 = Math.max(-100, Math.min(100, r.阴德));
  r.威灵 = Math.max(0, Math.min(100, r.威灵));
  s.香客 = Math.max(0, Math.min(scXkCap(s), s.香客));
  s.信心 = Math.max(0, Math.min(100, s.信心));
}
function scGain(s, k, v){ s.res[k] = (s.res[k]||0) + v; scClamp(s); }
function scSnap(s){ return { 香火:s.res.香火, 气数:s.res.气数, 阴德:s.res.阴德, 威灵:s.res.威灵, 香客:s.香客, 信心:s.信心 }; }
function scLedRow(kLed, kRes, ts, before, after){
  const evt = before[kRes] - ts[kRes];     // 所奏：玩家抉择造成的变动
  const nat = after[kRes]  - before[kRes]; // 自然：结算阶段被动经营（不含抉择）
  const net = after[kRes]  - ts[kRes];     // 净账
  return { k:kLed, evt, nat, net };
}
function scLog(s, t, cls){ s.log.unshift({ t, cls:cls||'' }); if(s.log.length>60) s.log.pop(); }
function scTrail(s, t, c){ s.trail.push({ t, c }); }
function scRankName(s){ return SC_RANKS[s.dom][s.rank].name; }
function scRankNextName(s){ return s.rank>=SC_RANK_MAX ? '' : SC_RANKS[s.dom][s.rank+1].name; }

/* 每旬香火收入：香客 × 系数 × 气数加成，冲境脱根则递减。
   水域（河伯）辖地人流、商旅更密， baseline 香火略丰 —— 但水线事件的香火消耗也重，整体仍是更难经营的一脉。 */
function scIncome(s){
  const domMul = (s.dom==='shui') ? 1.12 : 1.0;
  const base = s.香客 * s.tithe * domMul * (0.45 + s.res.气数/180);
  const root = Math.max(0, 1 - s.脱根*0.15);
  return Math.max(0, Math.round(base * root));
}

/* 神威：用于越界冲突与精怪弹压判定 */
function scPower(s){
  return Math.round(s.res.威灵*0.7 + s.res.香火*0.05 + s.rank*9 + s.res.气数*0.2);
}

function scEventDef(id){
  return SC_EVENTS.filter(e=>e.id===id)[0];
}

/* 选项门控（锁定原因属约束提示，可显示；不剧透「选了会怎样」） */
function scOptReqOk(s, opt){
  if(opt.ban) return { ok:false, why:opt.ban };   // 原著铁律：硬性不可为
  const r = opt.req; if(!r) return { ok:true };
  if(r.香火!=null && s.res.香火 < r.香火) return { ok:false, why:'需香火≥'+r.香火 };
  if(r.气数!=null && s.res.气数 < r.气数) return { ok:false, why:'需气数≥'+r.气数 };
  if(r.阴德!=null && s.res.阴德 < r.阴德) return { ok:false, why:'需阴德≥'+r.阴德 };
  if(r.威灵!=null && s.res.威灵 < r.威灵) return { ok:false, why:'需威灵≥'+r.威灵 };
  if(r.香客!=null && s.香客 < r.香客)     return { ok:false, why:'需香客≥'+r.香客 };
  if(r.rank!=null && s.rank < r.rank)     return { ok:false, why:'需神职·'+SC_RANKS[s.dom][r.rank].name };
  if(r.flag && !s.flags[r.flag])          return { ok:false, why:'需先结下此段因缘' };
  if(r.noFlag && s.flags[r.noFlag])       return { ok:false, why:'此事已了' };
  return { ok:true };
}

/* 效果结算：数值变动入 fxQueue（提交后才飘字揭示），不事前剧透 */
const SC_RES_KEYS = ['香火','气数','阴德','威灵'];
function scApplyEff(s, eff){
  if(!eff) return;
  const before = {};
  SC_RES_KEYS.forEach(k=>{ before[k] = s.res[k]; });
  const beforeX = s.香客;
  SC_RES_KEYS.forEach(k=>{
    if(eff[k]!=null){
      let v = eff[k];
      // 水线事件多为香火消耗，折算以缓解「道德经营便香火饿死」的死局（增益不动）
      if(k==='香火' && s.dom==='shui' && v < 0) v = Math.round(v * 0.65);
      scGain(s, k, v);
    }
  });
  if(eff.香客!=null) s.香客 = Math.max(0, Math.min(scXkCap(s), s.香客 + eff.香客));
  if(eff.信心!=null) s.信心 = Math.max(0, Math.min(100, s.信心 + eff.信心));
  if(eff.越界!=null) s.越界 = Math.max(0, s.越界 + eff.越界);
  if(eff.脱根!=null) s.脱根 = Math.max(0, s.脱根 + eff.脱根);
  if(eff.rank!=null) s.rank = Math.max(0, Math.min(SC_RANK_MAX, s.rank + eff.rank));
  scClamp(s);
  if(!s.fxQueue) s.fxQueue = [];
  SC_RES_KEYS.forEach(k=>{
    const d = s.res[k] - before[k];
    if(d !== 0) s.fxQueue.push({ k:k, v:d });
  });
  if(eff.香客!=null && s.香客!==beforeX) s.fxQueue.push({ k:'香客', v:s.香客-beforeX });
  if(eff.realmJump) s.fxQueue.push({ k:'神职 · '+SC_RANKS[s.dom][s.rank].name, v:0 });
  if(eff.flag)  s.flags[eff.flag] = 1;
  if(eff.unflag) delete s.flags[eff.unflag];
  if(eff.events) s.events.push({ id:eff.events });   // 抉择点可引出后续事件（如天劫）
  if(eff.rel){ for(const k in eff.rel){ s.rel[k] = Math.max(-10, Math.min(10, (s.rel[k]||0)+eff.rel[k])); } }
  if(eff.msg) scLog(s, eff.msg, eff.阴德!=null&&eff.阴德<0 ? 'bad' : (eff.香火!=null&&eff.香火>0 ? 'good' : ''));
  if(eff.answer === false) s.noAnswerStreak++;
  else s.noAnswerStreak = 0;
}

/* 解决一桩祈愿 */
function scResolveEvent(idx, optIdx){
  const s = state.shenci; if(s.over || s.settling) return;
  const ev = s.events[idx]; if(!ev) return;
  const def = scEventDef(ev.id); if(!def) return;
  const opt = def.opts[optIdx]; if(!opt) return;
  const rq = scOptReqOk(s, opt); if(!rq.ok) return;
  if(s.ap <= 0) return;
  s.ap--;                                  // 一旬只有三桩事能认真办，其余只能搁置

  let tianjieR = null;
  if(opt.debate){
    // 神道论理：以阴德 + 威灵 博弈（与落魄山「论道」同构）；天劫难度随品秩递增
    const pow = (ev.id==='tianjie') ? (24 + s.rank*18) : opt.debate.power;
    const my  = s.res.阴德*0.6 + s.res.威灵*0.4 + Math.floor(Math.random()*12);
    const foe = pow + Math.floor(Math.random()*12);
    const win = my >= foe;
    const eff = win ? opt.debate.win : opt.debate.lose;
    tianjieR = eff.tianjie || null;
    scApplyEff(s, eff);
    scTrail(s, def.title, (win?'理直 · 胜':'理屈 · 败')+'（我 '+Math.round(my)+' · 彼 '+foe+'）');
    s.events.splice(idx,1);
    if(def.once) s.flags[def.once] = 1;
    scBanner(win ? '理 直' : '理 屈', win ? '此方水土认你' : '神威有亏', '');
    SFX.click();
  } else {
    scApplyEff(s, opt.eff);
    scTrail(s, def.title, opt.txt);
    s.events.splice(idx,1);
    if(def.once) s.flags[def.once] = 1;
    tianjieR = (opt.eff && opt.eff.tianjie) || null;
    SFX.click();
  }
  if(ev.id === 'tianjie' && tianjieR) scTianjieResult(s, tianjieR);
  if(!s.xunStats) s.xunStats = {应:0,不应:0,搁置:0};
  if(opt.eff){
    if(opt.eff.answer === true) s.xunStats.应++;
    else if(opt.eff.answer === false) s.xunStats.不应++;
  }
  scAfterEvent(s, def, opt);
}

/* 神道天劫结算：渡则升品秩并「脱根」（原著：冲境易脱离山水根基、失去神职依托） */
function scTianjieResult(s, r){
  if(r === 'pass'){
    s.rank = Math.min(SC_RANK_MAX, s.rank+1);
    s.脱根 += 1;
    scLog(s, '天劫已过，你受【'+scRankName(s)+'】之位。金身渐离水土，脚下薄了一分。', 'good');
    scBanner('神 道 天 劫', '受 '+scRankName(s)+' 之位', '');
    if(!s.fxQueue) s.fxQueue = [];
    s.fxQueue.push({ k:'神职 · '+scRankName(s), v:0 });
    s.fxQueue.push({ k:'脱根', v:1 });
  } else if(r === 'fail'){
    scLog(s, '天劫未过，金身崩裂，香火气数俱损。位阶仍在原地。', 'bad');
    scBanner('天 劫 未 过', '金身崩裂', '');
  }
}

/* 事件结算后的统一出口：预检结局 → render → flushFx */
function scAfterEvent(s, def, opt){
  scCheckEndingLive(s);
  render();
  scFlushFx(s);
  scMaybeAutoSettle(s);   // 行动力耗尽 → 自动结算，不必再手动点「过此旬」
}

function scSkipEvent(idx){
  const s = state.shenci; if(s.over || s.settling) return;
  const ev = s.events[idx]; if(!ev) return;
  const def = scEventDef(ev.id); if(!def) return;
  // 对神而言，「搁置」本身就是一种「不应」
  if(!s.xunStats) s.xunStats = {应:0,不应:0,搁置:0};
  s.xunStats.搁置++;
  s.events.splice(idx,1);
  s.backlog++;
  s.noAnswerStreak++;
  s.信心 = Math.max(0, s.信心 - 4);
  scLog(s, '你将「'+def.title+'」搁过一旁。香案前的那炷香，又冷了一分。', '');
  SFX.click();
  render();
  scMaybeAutoSettle(s);   // 祈愿已空且再无可为 → 自动结算
}

/* ==========================================================================
 * 祈愿池
 *  · dom:'shan' 山线 / 'shui' 水线 / 不填 = 通用
 *  · type:'祈愿' 常规抽卡 / '危机' 条件触发 / '册目' 按 bookXun 脚本注入
 *  · opt.ban = 硬禁制（原著铁律），显示锁定原因且不可选
 *  · 【不剧透纪律】选项只写「做什么」，不写「会怎样」；后果由 fxQueue 飘字 +
 *    scLog 纪事在提交后揭示。
 * ========================================================================== */
const SC_EVENTS = [

/* ─────────────── 山线祈愿 ─────────────── */
{ id:'shan_qiuyu', dom:'shan', type:'祈愿', title:'求 雨', who:'山下赵家坳的里正', q:'山神爷，求您降场雨吧。地里裂得能塞进拳头，娃娃们舔露水过活。',
  desc:'开春三个月没落一滴雨。里正领着十几个老农跪在庙前，额头抵着青砖，一声不吭。供品是一篮鸡蛋——他们也只有这个了。',
  opts:[
    { txt:'借云气，落一场透雨', req:{香火:18}, eff:{香火:-18,气数:-2,阴德:3,香客:2,信心:6,answer:true,
      msg:'你借了东边的水气，落了三尺雨。老农们没道谢，只是把那篮鸡蛋又往供桌上推了推。'} },
    { txt:'只润一层地皮', req:{香火:8}, eff:{香火:-8,气数:-2,阴德:1,香客:1,信心:2,answer:true,
      msg:'你匀了些水汽下去，够麦子缓一口气。'} },
    { txt:'不应此愿', eff:{阴德:-2,信心:-8,香客:-1,answer:false,
      msg:'你没动。他们跪到日头偏西，起身时膝盖都僵了。'} },
  ]},

{ id:'shan_hujing', dom:'shan', type:'祈愿', title:'老狐求名', who:'山中修行三百年的老狐', q:'我守这座山三百年，比谁都久。不求山神之位，只求您给个正经名分，好让山民别再喊我畜生。',
  desc:'老狐化作青衫翁，捧着一坛酒来贺。酒过三巡，它才开口，说想请你在辖内给它一个正经名分——它守这片山，比谁都久。',
  opts:[
    { txt:'许它山神之位', ban:'铁律 · 狐精不可为山神', eff:{} },
    { txt:'给一块「护山庙祝」的木牌', eff:{阴德:2,威灵:-3,香火:5,answer:true,
      msg:'你削了块木牌递过去。它捧着看了很久，末了问：「庙祝算不算官？」你说不算。它说，那也挺好。'} },
    { txt:'只答四个字：不可为神', eff:{阴德:1,威灵:4,香客:-1,answer:true,
      msg:'你只说了四个字。它没恼，把剩下的半坛酒喝完，起身走了。'} },
    { txt:'不置可否', eff:{阴德:-1,信心:-3,answer:false,
      msg:'你端起酒碗，没接这话。它笑了一声，也没再提。'} },
  ]},

{ id:'shan_menghu', dom:'shan', type:'祈愿', title:'虎 患', who:'猎户王二', q:'山神爷，那虎吃了我家牛，再不管下回就吃人了。您给句话，我们这就上山。',
  desc:'一头吊睛白额虎下山，咬死了三头牛、一只羊，还没伤人。王二带了七八个后生堵在庙门口，手里攥着叉子，等你一句话。',
  opts:[
    { txt:'拦下众人，遣虎归山', req:{威灵:14}, eff:{威灵:-5,阴德:2,气数:2,香客:1,answer:true,
      msg:'你托梦给那头虎，它回了深山。王二骂了半宿，说山神爷护畜生。'} },
    { txt:'任他们去打', eff:{阴德:-1,威灵:2,香客:1,信心:3,气数:-3,answer:true,
      msg:'他们打了三天，抬着虎尸回来，在庙前剥皮。血渗进砖缝，你闻了很久。'} },
    { txt:'不应此愿', eff:{信心:-5,气数:-2,answer:false,
      msg:'庙门关着。他们等了半日，散了。后来那头虎又咬死了一个人。'} },
  ]},

{ id:'shan_zhuoya', dom:'shan', type:'祈愿', title:'采药人坠崖', who:'一个不相干的外乡人', q:'我是外乡人，不归您管，可您能不能，就当行个善？',
  desc:'外乡人来采崖上的石斛，绳子断了，卡在半崖一棵歪脖子松上，喊了两天。山民说，他是外乡人，不归你管。',
  opts:[
    { txt:'托一阵风，托他一把', req:{香火:10}, eff:{香火:-10,阴德:4,威灵:1,信心:2,answer:true,
      msg:'你托了一阵风。他爬上来以后，在崖下磕了九个头，然后走了，再没回来过。'} },
    { txt:'由他去', eff:{阴德:-4,信心:-2,answer:false,
      msg:'第三天崖下没声了。开春有人捡到一副骨架，顺手埋了。'} },
  ]},

{ id:'shan_kaikuang', dom:'shan', type:'祈愿', title:'开 矿', who:'大骊工部的采办官', q:'山神爷，奉上命开矿铸剑，是大骊急务。您行个方便，朝廷亏不了您。',
  desc:'采办官带着一队兵丁上山，说要开一处铁矿，供大骊铸剑。他说话客气，但兵丁的刀就挂在腰上。开了矿，山要掉一层皮。',
  opts:[
    { txt:'准了', eff:{香火:30,气数:-12,阴德:-5,威灵:3,香客:-1,answer:true,
      msg:'你准了。半年后山北塌了半边，溪水变成锈红色。但庙里多了两尊新供的金身。'} },
    { txt:'以神威拒之', req:{威灵:30}, eff:{威灵:-8,气数:4,阴德:3,香客:1,信心:5,answer:true,
      msg:'你夜里起了场大雾，兵丁迷了三天路。采办官临走撂下一句：「这山神有点意思。」'} },
    { txt:'推说此山无矿', eff:{威灵:-2,阴德:1,气数:2,answer:true,
      msg:'你说此山无矿。他看了你一眼，信了，也可能没信。总之人走了。'} },
  ]},

{ id:'shan_gankao', dom:'shan', type:'祈愿', title:'赶 考', who:'一个读了十年书的穷秀才', q:'山神爷，学生念了一篇文章，您听听，成不成？',
  desc:'秀才来庙里，什么都没求，只把一篇文章念给你听，念完说：「若我中了，回来给您重修庙宇。」说完就走了，走了三十里。',
  opts:[
    { txt:'托一句好话给文运', req:{阴德:10}, eff:{阴德:-3,威灵:-4,香火:6,信心:4,answer:true,
      msg:'你托了一句。他中了。两年后真回来修庙，还带来一块他亲手写的匾。'} },
    { txt:'不涉文昌之事', eff:{阴德:-1,信心:-3,answer:false,
      msg:'你没管。他落第了，回来的路上把书都烧了。'} },
  ]},

{ id:'shan_tongnv', dom:'shan', type:'祈愿', title:'童女祭河', who:'河对岸的里长', q:'河伯娶亲是老礼数，山神爷管得着对岸的事么？',
  desc:'河对岸要祭河伯，绑了个丫头往水里沉。那是埋河的事，不归你管。可那丫头是山上李家的闺女。',
  opts:[
    { txt:'越界救人', eff:{越界:2,阴德:6,威灵:-6,香火:-12,气数:-2,信心:4,answer:true,
      msg:'你掀起一阵山风，把人卷了上来。对岸的鼓乐停了。你知道，这事没完。'} },
    { txt:'不管', eff:{阴德:-6,信心:-6,香客:-1,answer:false,
      msg:'你听着对岸的鼓乐响了一夜。第二天山民发现，庙门的门槛上被人泼了狗血。'} },
    { txt:'托梦给那丫头的爹', eff:{阴德:2,威灵:-2,信心:-2,answer:true,
      msg:'你托梦给她爹，说了一句「去晚了」。他连夜下山，只捞上来一只鞋。'} },
  ]},

{ id:'shan_kujing', dom:'shan', type:'祈愿', title:'枯 井', who:'山腰独居的寡妇', q:'井干了两个月，我每天走十里挑水。山神爷，求您开开眼。',
  desc:'山腰那口井干了。寡妇每天走十里山路去挑水，挑了两个月。她来庙里，只问了一句：「是不是我哪里得罪了山神爷？」',
  opts:[
    { txt:'引一线泉脉过去', req:{香火:14}, eff:{香火:-14,气数:-4,阴德:3,香客:1,信心:5,answer:true,
      msg:'你引了一线泉脉。井冒水的那天，她在井边坐了半宿，一句话没说。'} },
    { txt:'不应此愿', eff:{阴德:-2,信心:-5,香客:-1,answer:false,
      msg:'你没应。第三个月，她搬走了，房子塌在雨季里。'} },
  ]},

{ id:'shan_shanxiao', dom:'shan', type:'祈愿', title:'山魈作祟', who:'山里的老住户', q:'那东西学人说话，在村口喊人的名。山神爷，它是山里的老人，可它糟蹋庄稼啊。',
  desc:'一只成了气候的山魈领着群猴子糟蹋庄稼，还学人说话，在村口喊人的名字。山民说，那是山里的老人，惹不得。',
  opts:[
    { txt:'以神威压服', req:{威灵:20}, eff:{威灵:-6,阴德:1,气数:3,香客:1,信心:4,answer:true,
      msg:'你显了一次真形。山魈带着猴子搬去了后山，从此见人就拜。'} },
    { txt:'许它一处不受打扰的山坳', eff:{威灵:-2,阴德:2,气数:-2,香客:1,answer:true,
      msg:'你划了片山坳给它。它不再糟蹋庄稼，偶尔在坳口放几颗野果。'} },
    { txt:'装作没看见', eff:{威灵:-4,气数:-4,信心:-4,answer:false,
      msg:'你没管。秋收少了三成，山民开始去别处烧香。'} },
  ]},

{ id:'shan_laoyu', dom:'shan', type:'祈愿', title:'求 子', who:'一个守了十年寡的老妪', q:'儿子没了，我只求他下一世别再受苦。山神爷，您行行好。',
  desc:'老妪的儿子死在采石场上。她来求的不是儿子回来，是求给儿子托生个好人家。她说：「我这辈子没做过坏事。」',
  opts:[
    { txt:'查一查生死簿', req:{威灵:16}, eff:{威灵:-6,阴德:4,香火:8,信心:3,answer:true,
      msg:'你查了。他下一世在三百里外一户打铁的人家。你只告诉她：「是个劳碌命，但活得长。」'} },
    { txt:'只说「自有安排」', eff:{阴德:-1,信心:-2,香火:3,answer:true,
      msg:'你说了句「自有安排」。她磕了头，走了，脚步比来时轻些。'} },
    { txt:'不应此愿', eff:{阴德:-3,信心:-4,answer:false,
      msg:'你没应。她后来每一旬都来一次，庙里的香灰积了厚厚一层。'} },
  ]},

{ id:'shan_zhengshui', dom:'shan', type:'祈愿', title:'两村争水', who:'上村与下村的里正', q:'这水是我们上村的，他们下村凭什么来抢？',
  desc:'上下两个村子为一条溪水打了三代人，今年打出了人命。两村的里正一起来庙里，都跪着，都说是对方的错。',
  opts:[
    { txt:'断个公道', req:{威灵:18}, eff:{威灵:-5,阴德:5,气数:3,香客:2,信心:6,answer:true,
      msg:'你在溪心立了块分水石，写了两村的份例。他们不打了——因为都不满意，也都不敢动那块石头。'} },
    { txt:'各打五十大板', eff:{威灵:-2,阴德:1,信心:-1,answer:true,
      msg:'你说了句「都回去」。他们骂骂咧咧地走了，第二年又打。'} },
    { txt:'让他们自己去商量', eff:{阴德:-2,信心:-3,气数:-2,answer:false,
      msg:'你让他们自己商量。那年夏天，溪水被血染红过一次。'} },
  ]},

{ id:'shan_xinmiao', dom:'shan', type:'祈愿', title:'新庙选址', who:'一伙外来的香客', q:'山神爷，我们攒钱给您盖新庙，山顶风水最好。您点点头，这就动工。',
  desc:'外来的香客攒了钱，要给你盖一座新庙。他们选的地方在山顶——那是一片老林子，住着不少活物。盖了庙，林子就得砍。',
  opts:[
    { txt:'准他们在山顶起庙', eff:{香火:24,威灵:5,气数:-5,阴德:-2,香客:2,answer:true,
      msg:'庙起得很气派，站在庙门口能看见三县。只是山顶那片林子，从此再没鸟叫。'} },
    { txt:'指一处山脚的荒地', eff:{香火:10,气数:3,阴德:2,香客:1,answer:true,
      msg:'你指了山脚的荒地。庙小了些，但鸟还在。'} },
    { txt:'不受此庙', eff:{香火:-6,阴德:1,香客:-1,信心:-3,answer:false,
      msg:'你说不需要。他们愣了半天，把钱捐去修了桥。'} },
  ]},

{ id:'shan_leipi', dom:'shan', type:'祈愿', title:'雷劈古木', who:'一株八百年的老槐', q:'我修八百年，未曾害人。这道天雷……我认了。',
  desc:'天雷要劈那株老槐。它修行了八百年，从没伤过人。按天数，它该有此劫；按人情，它什么都没做错。',
  opts:[
    { txt:'替它挡一道', req:{香火:30, 威灵:20}, eff:{香火:-30,威灵:-10,阴德:7,气数:4,信心:5,answer:true,
      msg:'你替它挡了。金身裂了一道纹，它第二天开花了，开得满山都是。'} },
    { txt:'闭上眼，由天去', eff:{阴德:-3,威灵:3,气数:-1,answer:false,
      msg:'你闭了眼。雷劈了三天三夜。事后山民在树桩上刻了「山神在此」四个字。'} },
  ]},

{ id:'shan_shanhong', dom:'shan', type:'祈愿', title:'山 洪', who:'整条沟的人', q:'山神爷！水来了！沟里两百多口人，救命啊！',
  desc:'连下了六天暴雨。半夜，山洪下来了。沟里有三个村子，两百多口人。你有半个时辰。',
  opts:[
    { txt:'托梦给每一个睡着的人', req:{香火:36}, eff:{香火:-36,威灵:-8,阴德:9,气数:3,香客:3,信心:9,answer:true,
      msg:'你挨家挨户地托梦，托了两百多个。天亮时金身暗得像块石头，但一个人都没少。'} },
    { txt:'只托梦给里正与甲长', req:{香火:14}, eff:{香火:-14,阴德:3,气数:1,香客:1,信心:3,answer:true,
      msg:'你只叫醒了几个管事的。他们敲锣喊人，救出了大半。'} },
    { txt:'洪水果然是天数', eff:{阴德:-10,信心:-12,香客:-3,气数:-8,answer:false,
      msg:'你没动。天亮后沟里多了四十七座新坟。庙里的香，断了整整一年。'} },
  ]},

/* ─────────────── 通用祈愿 ─────────────── */
{ id:'daxiangke', type:'祈愿', title:'大 香 客', who:'一位换了门庭的大香客', q:'我去年去了邻祠，今年回来，就想看看您这儿还灵不灵。',
  desc:'这位大香客一年在庙里烧的香，值十万两白银。他前年去了邻祠，今年又回来了，说想看看你这里还灵不灵。',
  opts:[
    { txt:'为他显一次灵', req:{香火:20, 威灵:12}, eff:{香火:-20,威灵:-5,香客:5,信心:8,阴德:-2,answer:true,
      msg:'你为他显了一次灵。他捐了三年的香油钱。只是从那以后，庙里来的人都在等下一次显灵。'} },
    { txt:'只给他一句准话', req:{阴德:6}, eff:{阴德:-4,香客:3,信心:5,answer:true,
      msg:'你只给了他一句准话，说中了。他没再问别的，磕了头就走。'} },
    { txt:'不见', eff:{香客:-4,信心:-6,阴德:-3,answer:false,
      msg:'你没见他。他去了邻祠，第二年邻祠重修了一遍。'} },
  ]},

{ id:'heyi_buying', type:'祈愿', title:'为何不应', who:'一个烧了二十年香的老香客', q:'我烧了二十年香，求十应三。山神爷，您到底在不在？',
  desc:'他跪在香案前，问的不是事，是一句话：「这些年我求的十件事，神明只应了三件。是我心不诚，还是神明本就不在乎？」',
  opts:[
    { txt:'托梦答他', req:{香火:12}, eff:{香火:-12,阴德:3,信心:6,香客:1,answer:true,
      msg:'你托梦给他，只说了一句：「香火养的是神，不是道理。」他醒来后想了三天，从此只烧香，不求事。'} },
    { txt:'让他自己想', eff:{信心:-4,香客:-1,阴德:-1,answer:false,
      msg:'你没答。他走的时候把香折断，扔在门槛外。'} },
  ]},

{ id:'yinci_xian', type:'祈愿', title:'游方道士', who:'一个自称谱牒仙师的游方道士', q:'你这庙名不正言不顺，贫道替天行道，今日拆了它！',
  desc:'道士围着你的庙转了三圈，说你这庙「名不正言不顺」，要替天行道，把庙拆了。他背后站着三十个拿了钱的山民。',
  opts:[
    { txt:'以神威慑之', req:{威灵:24}, eff:{威灵:-8,阴德:-2,香客:2,信心:5,answer:true,
      msg:'你让庙里的烛火同时灭了。道士连夜跑了，跑丢了一只鞋。'} },
    { txt:'请城隍来断', eff:{威灵:-3,阴德:2,香火:-10,信心:2,answer:true,
      msg:'你请了城隍来。城隍判你「名正」，判道士「妖言」。道士被打了二十板。'} },
    { txt:'由他拆', eff:{香火:-28,威灵:-12,气数:-8,香客:-2,信心:-8,阴德:2,answer:false,
      msg:'庙拆了。你在废墟上坐了一年，香火断了，但没再有人来管你叫「淫祀」。'} },
  ]},

{ id:'miaozhu_tanmo', type:'祈愿', title:'庙祝贪墨', who:'庙里的庙祝', q:'香油钱嘛，庙里庙外都是我的，神又不会说话。',
  desc:'庙祝把香油钱拿去买了田，还在庙后养了三房外室。山民来告了三次，你都没空理。',
  opts:[
    { txt:'拿下他，另择庙祝', req:{威灵:10}, eff:{威灵:-4,阴德:3,香火:12,信心:6,香客:1,answer:true,
      msg:'你让他连着做了七夜噩梦，第八天他自己把田契交了出来。'} },
    { txt:'睁一只眼闭一只眼', eff:{香火:8,阴德:-5,信心:-5,香客:-1,answer:false,
      msg:'你没管。他胆子越来越大，最后连庙都敢卖。'} },
  ]},

{ id:'youfang_daozhang', type:'祈愿', title:'借 香 火', who:'一个过路的野修', q:'替您办一件事，只求分三年香火。实在话，最实在的话。',
  desc:'野修在庙里借宿，临走说，愿替你办一件事，只求分你三年香火。他说得很实在，实在得让人不太放心。',
  opts:[
    { txt:'许他三年香火', eff:{香火:20,阴德:-4,威灵:-3,answer:true,
      msg:'他替你平了三桩事，然后卷着三年的香火走了。你后来才知道，他拿去喂了剑。'} },
    { txt:'只留他住一宿', eff:{阴德:2,香火:3,信心:2,answer:true,
      msg:'你留他住了一宿，第二天给了他一袋干粮。他道了谢，走了。'} },
    { txt:'赶他出去', eff:{威灵:2,阴德:-2,香火:-3,answer:false,
      msg:'你把他赶了出去。他走的时候说了句「小气」。'} },
  ]},

{ id:'chenghuang_chuanxun', type:'祈愿', title:'城隍传讯', who:'本州城隍爷', q:'着尔辖内清丈人口，造册上报。自此后生老病死皆须上账，不得擅专。',
  desc:'城隍爷派人送来一纸文书：着你辖内清丈人口、造册上报。造册之后，辖内每一户生老病死都得上账，从此不得擅专。',
  opts:[
    { txt:'如实造册', eff:{阴德:2,威灵:-6,香火:-8,气数:2,信心:2,answer:true,
      msg:'你如实造了册。城隍赞你「安分」。只是从此辖内少了一个人，你当天就得知道。'} },
    { txt:'拖一拖', eff:{威灵:-2,阴德:-2,信心:-1,answer:false,
      msg:'你拖了三旬。第四旬城隍亲自来了，什么都没说，只看了你一眼。'} },
  ]},

/* ─────────────── 水线祈愿 ─────────────── */
{ id:'shui_fengping', dom:'shui', type:'祈愿', title:'求 风 平', who:'一船赶着交纳官粮的船家',
  desc:'风起了。船上装的是官粮，误了期限要掉脑袋。船家跪在船头，往水里倒了三碗酒，喊你的名号。',
  opts:[
    { txt:'压住这一程风浪', req:{香火:16}, eff:{香火:-16,气数:-4,阴德:3,香客:2,信心:5,answer:true,
      msg:'你压了三十里水路的浪。船到码头时，他把最后一碗酒倒进了河里。'} },
    { txt:'只护他船不沉', req:{香火:7}, eff:{香火:-7,阴德:1,香客:1,信心:2,answer:true,
      msg:'你只护住了船。货湿了一半，他挨了二十板，但命还在。'} },
    { txt:'不应此愿', eff:{阴德:-3,信心:-6,香客:-1,answer:false,
      msg:'你没应。船翻在第三个滩口，捞上来七具尸首。'} },
  ]},

{ id:'shui_qiuyu', dom:'shui', type:'祈愿', title:'求 鱼', who:'下游三百户渔家',
  desc:'今年河里的鱼少得反常。渔家说，是有人在河湾下了绝户网，也有人说，是河神爷不高兴了。',
  opts:[
    { txt:'查一查河底', req:{威灵:12}, eff:{威灵:-5,阴德:2,气数:4,香客:2,信心:4,answer:true,
      msg:'你查了。是上游新修的一处陂塘断了鱼道。你托梦给修陂塘的官，他改了。'} },
    { txt:'任他们多捕些', eff:{气数:-8,阴德:-3,香客:1,信心:2,answer:true,
      msg:'你由他们捕。那一年鱼多得一网三十斤，第二年一网三条。'} },
    { txt:'不应此愿', eff:{信心:-4,香客:-1,answer:false,
      msg:'你没应。渔家开始去海边求龙王，虽然他们谁也没见过大海。'} },
  ]},

{ id:'shui_luoshui', dom:'shui', type:'祈愿', title:'落 水', who:'一个在河边洗衣服的妇人',
  desc:'妇人失足掉进深水凼，怀里还抱着个孩子。岸上有十几个人，会水的都在上游干活，不会水的在岸边哭。',
  opts:[
    { txt:'托她一把', req:{香火:12}, eff:{香火:-12,阴德:5,信心:4,香客:1,answer:true,
      msg:'你托了她一把。她上岸后第一件事是找孩子，孩子还睡着，一点没湿。'} },
    { txt:'只护住孩子', req:{香火:6}, eff:{香火:-6,阴德:1,信心:-1,answer:true,
      msg:'你只护住了孩子。第二天，那孩子被人抱去舅舅家养了。'} },
    { txt:'不应此愿', eff:{阴德:-5,信心:-6,香客:-1,answer:false,
      msg:'你没应。两天后尸体冲到下游的浅滩上，怀里的孩子早没了。'} },
  ]},

{ id:'shui_shuigui', dom:'shui', type:'祈愿', title:'水鬼索替', who:'一个泡了六十年的水鬼',
  desc:'水鬼找上门来，说按规矩，它只要拉一个人下水，就能去投胎。它已经等了六十年，等得实在不耐烦了。',
  opts:[
    { txt:'许它一个别的法子', req:{阴德:8}, eff:{阴德:-4,威灵:-4,香火:6,气数:2,answer:true,
      msg:'你许它积满一百件善事再走。它骂骂咧咧地去了，从此每年往岸边推几个落水的商人。'} },
    { txt:'压它下水，不许出来', req:{威灵:20}, eff:{威灵:-7,阴德:-2,气数:3,香客:1,answer:true,
      msg:'你把它压回水底。它在水里骂了三年，第四年不骂了。'} },
    { txt:'装作不知道', eff:{阴德:-4,信心:-4,气数:-2,answer:false,
      msg:'你装作不知道。那年河里多了一具尸首，水鬼再没出现过。'} },
  ]},

{ id:'shui_quqin', dom:'shui', type:'祈愿', title:'河伯娶亲', who:'两岸的乡绅',
  desc:'乡绅们凑了钱，要给你办一场娶亲，买了个佃户家的闺女。他们说这是老规矩，办了你才有烟火气。那闺女十四岁。',
  opts:[
    { txt:'受了这场烟火气', eff:{香火:35,阴德:-12,威灵:4,香客:3,信心:-3,answer:true,
      msg:'你受了。此后每年一次，庙里的香火旺得呛人。那闺女第二年被抬回来时，已经不会说话了。'} },
    { txt:'掀翻花轿，斥为淫祀', req:{阴德:5}, eff:{香火:-16,阴德:8,威灵:-5,香客:-2,信心:4,answer:true,
      msg:'你掀了花轿。乡绅们说这河神疯了，第二年香火少了一半，但那闺女活到了六十三岁。'} },
    { txt:'不置可否', eff:{阴德:-6,信心:-5,香客:-1,answer:false,
      msg:'你没说话。花轿照常抬走。之后每年庙里都多一盏长明灯。'} },
  ]},

{ id:'shui_liangan', dom:'shui', type:'祈愿', title:'两岸争水', who:'河东与河西的农户',
  desc:'河东要引水灌田，河西要放船通商。两边各来了两百人，扛着锄头和橹桨，站在河滩上对骂。',
  opts:[
    { txt:'定下用水与通航的时辰', req:{威灵:16}, eff:{威灵:-5,阴德:4,气数:3,香客:2,信心:5,answer:true,
      msg:'你定了时辰：白日行船，夜里灌田。两边都骂神明偏心，但都照做了。'} },
    { txt:'让上游多放些水下来', req:{香火:14}, eff:{香火:-14,气数:-5,阴德:2,香客:1,信心:3,answer:true,
      msg:'你让上游多放了水。两边都够用了，谁也没谢谁。'} },
    { txt:'由他们打', eff:{阴德:-4,气数:-4,信心:-6,香客:-1,answer:false,
      msg:'你没管。那年河滩上死了三个人，从此两边三年不通婚。'} },
  ]},

{ id:'shui_duanliu', dom:'shui', type:'祈愿', title:'断 流', who:'整条河',
  desc:'大旱。河水只剩中间一线，河床裂得像老人的手。两岸的井都干了，再不下雨，今年颗粒无收。',
  opts:[
    { txt:'向上游借水', req:{香火:26, 越界:0}, eff:{香火:-26,越界:1,阴德:3,气数:-3,香客:2,信心:5,answer:true,
      msg:'你向上游借了水。上游那位什么都没说，但从此你欠他一次。'} },
    { txt:'掘地脉，续一线水', req:{香火:18}, eff:{香火:-18,气数:-7,阴德:2,香客:1,信心:4,answer:true,
      msg:'你掘了地脉。水续上了，但三年之内，这条河的底气都补不回来。'} },
    { txt:'旱是天数', eff:{阴德:-6,气数:-6,信心:-8,香客:-2,answer:false,
      msg:'你没动。那年有人开始往龙王庙去，一去就没再回来。'} },
  ]},

{ id:'shui_hongshui', dom:'shui', type:'祈愿', title:'洪 水', who:'下游七十二圩',
  desc:'上游连下暴雨，洪峰下来了。泄洪，下游七十二圩全淹；不泄，上游三个县城要泡在水里。你有半个时辰。',
  opts:[
    { txt:'泄洪，保住三个县城', req:{香火:30}, eff:{香火:-30,阴德:-6,气数:-10,香客:-3,信心:-5,answer:true,
      msg:'你泄了洪。三个县城保住了，七十二圩淹了十九圩。第二年，你在河底发现了一座新庙的残骸。'} },
    { txt:'不泄，硬扛', req:{威灵:34}, eff:{威灵:-12,阴德:6,香火:-20,气数:2,香客:2,信心:6,answer:true,
      msg:'你硬扛了。金身差点散掉，但七十二圩一圩没淹。上游死了十一个人。'} },
    { txt:'分洪，两边各伤一半', req:{香火:16}, eff:{香火:-16,阴德:1,气数:0,香客:-1,信心:1,answer:true,
      msg:'你分了洪。两边都有损失，两边都骂，两边都还来烧香。'} },
  ]},

{ id:'shui_qiaota', dom:'shui', type:'祈愿', title:'桥 塌', who:'一座刚修好三年的石桥',
  desc:'桥塌了。修桥的银子被人贪了一半，用了糯米汁兑沙浆。塌的时候桥上有二十几个人，还有一辆运药的马车。',
  opts:[
    { txt:'救人', req:{香火:14}, eff:{香火:-14,阴德:4,信心:4,香客:1,answer:true,
      msg:'你救了十九个。有一个没救上来，是修桥的工头，他自己跳下去的。'} },
    { txt:'托梦给查账的官', req:{威灵:10}, eff:{威灵:-4,阴德:5,气数:2,香客:1,信心:5,answer:true,
      msg:'你托梦给了查账的官。他挖出了账本，牵出七个人。桥重修了，用的是真糯米汁。'} },
    { txt:'不该你管的事', eff:{阴德:-3,信心:-4,answer:false,
      msg:'你说这不该你管。第二年那座桥又修了一次，又塌了一次。'} },
  ]},

{ id:'shui_chenchuan', dom:'shui', type:'祈愿', title:'沉 船', who:'一艘装着私盐的商船',
  desc:'盐船半夜沉了，沉得很蹊跷——舱里装的不全是盐。船主跪在河边，求的不是货，是求别让人知道这船是他的。',
  opts:[
    { txt:'替他瞒下来', eff:{香火:22,阴德:-8,威灵:-3,香客:1,answer:true,
      msg:'你替他瞒了。他每月十五来烧一炷香，从不敢抬头看神像。'} },
    { txt:'把船拖上来，公之于众', req:{威灵:14}, eff:{威灵:-5,阴德:6,香火:-6,信心:4,香客:1,answer:true,
      msg:'你把船拖上岸。官家抄了盐、抓了人，也顺手修了河堤。'} },
    { txt:'不管', eff:{阴德:-2,香火:5,answer:false,
      msg:'你没管。半年后有人在河湾捞到几箱东西，从此再没在这条河上出现过。'} },
  ]},

{ id:'shui_jingguai', dom:'shui', type:'祈愿', title:'水底精怪', who:'一只成了气候的老鼋',
  desc:'老鼋在河底住了四百年，从没伤过人。今年它开始掀船，因为它要挪窝——河床被泥沙垫高了，它住不下了。',
  opts:[
    { txt:'替它清一处深潭', req:{香火:20}, eff:{香火:-20,气数:4,阴德:4,香客:1,信心:3,answer:true,
      msg:'你替它清了深潭。它搬过去那天，往岸边推了一船鱼。'} },
    { txt:'以神威镇之', req:{威灵:22}, eff:{威灵:-8,阴德:-2,气数:2,香客:1,answer:true,
      msg:'你镇了它。它不再掀船，也不再出来。三年后有人在深潭底发现了一副很大的壳。'} },
    { txt:'随它去', eff:{气数:-5,信心:-5,香客:-1,answer:false,
      msg:'你随它去。那年又沉了两条船，从此没人敢走夜航。'} },
  ]},

{ id:'shui_touhe', dom:'shui', type:'祈愿', title:'投 河', who:'一个欠了赌债的米店掌柜',
  desc:'掌柜半夜来投河。他站在桥上站了半个时辰，最后没跳，跪在桥头哭了半宿，天亮前走了。',
  opts:[
    { txt:'托一句话给他', req:{阴德:4}, eff:{阴德:-2,信心:3,香火:4,answer:true,
      msg:'你托了一句「账可以慢慢还」。他后来还了八年，还清了，六十大寿那天来庙里磕了头。'} },
    { txt:'由他', eff:{阴德:-3,信心:-3,answer:false,
      msg:'你由他。三天后，打捞的人在下游找到了人。'} },
  ]},

{ id:'shui_zhengchuan', dom:'shui', type:'祈愿', title:'官家征船', who:'大骊水师的校尉',
  desc:'水师要征走河上所有的船，运兵南下。征了船，两岸三百户渔家今年就得饿死；不征，军法从事的是校尉。',
  opts:[
    { txt:'准他征', eff:{香火:18,威灵:3,阴德:-7,香客:-3,信心:-6,answer:true,
      msg:'你准了。船走了，渔家卖船卖网，那年冬天有人开始吃观音土。'} },
    { txt:'与他讲一个道理', req:{威灵:18}, eff:{威灵:-6,阴德:4,香火:-10,香客:1,信心:4,answer:true,
      msg:'你与他讲了个道理：留三分之一的船打鱼，其余随征。他愣了半宿，改了令。'} },
    { txt:'拖到他走', eff:{威灵:-3,阴德:-3,气数:-2,answer:false,
      msg:'你拖。他等了五天，走了，船一条没征到。第七天来了个更大的官。'} },
  ]},

{ id:'shui_shixiu', dom:'shui', type:'祈愿', title:'庙 塌 了', who:'你自己',
  desc:'水神庙年久失修，屋顶塌了半边，神像脸上的金漆掉得只剩一只眼睛。香客说，这庙太破了，神明大概早搬走了。',
  opts:[
    { txt:'自己动手修', req:{香火:24}, eff:{香火:-24,气数:3,阴德:3,香客:2,信心:7,answer:true,
      msg:'你用了三旬，一寸一寸把庙修好了。修好那天，来烧香的人比往年多了一倍。'} },
    { txt:'托梦给里正', req:{威灵:8}, eff:{威灵:-3,香火:-8,香客:1,信心:4,answer:true,
      msg:'你托梦给里正。他第二天就带着人来修，还顺手多修了一间偏殿。'} },
    { txt:'塌就塌了', eff:{香火:-10,威灵:-6,香客:-2,信心:-6,answer:false,
      msg:'塌就塌了。你在露天的神座上坐了两年，香客换了个地方烧香。'} },
  ]},

/* ─────────────── 危机（条件触发，不入普通抽卡） ─────────────── */
{ id:'cr_xiangke_pao', type:'危机', title:'香客转投邻祠', who:'辖内的香客',
  desc:'一连几旬，你都没应过一件事。庙里的香案积了灰。有人开始收拾香烛，说要去邻祠试试——那位至少还灵。',
  opts:[
    { txt:'立刻显一次灵', req:{香火:22, 威灵:10}, eff:{香火:-22,威灵:-5,香客:-2,信心:8,阴德:-2,answer:true,
      msg:'你显了一次灵。要走的人留下了，留下的问你：那之前为什么不灵？'} },
    { txt:'挨家挨户托梦', req:{香火:14}, eff:{香火:-14,信心:6,香客:-1,香火2:0,阴德:1,answer:true,
      msg:'你挨家挨户地托梦，什么都没许，只说了一句「我还在」。第二天来的人，比前一天多。'} },
    { txt:'由他们去', eff:{香客:-4,信心:-6,香火:-8,answer:false,
      msg:'你由他们去。邻祠那一年重修了庙门。'} },
  ]},

{ id:'cr_yinci', type:'危机', title:'淫 祠 之 议', who:'本州城隍爷',
  desc:'城隍爷亲自来了。他说辖内有司上奏，说你「名不正言不顺，聚众受香，惑乱人心」，要拆庙除名。他问你一句：可有话说？',
  opts:[
    { txt:'自陈功德', req:{阴德:12}, eff:{威灵:-4,阴德:3,香火:-6,信心:3,answer:true,
      msg:'你把辖内的功德一件件报了出来。城隍听完了，说：「那就留着吧。」临走前看了你一眼。'} },
    { txt:'请辖内百姓作证', req:{香客:10}, eff:{香火:-12,阴德:2,香客:1,信心:8,answer:true,
      msg:'你请百姓作证。来了两百多人，跪在庙前一言不发。城隍站了半炷香，走了。'} },
    { txt:'认了', eff:{香火:-40,威灵:-15,气数:-10,香客:-3,信心:-10,阴德:4,answer:false,
      msg:'你认了。庙拆了，名除了。你在废墟上待了很久，直到有个孩子偷偷来放了一支香。'} },
  ]},

{ id:'cr_jingguai', type:'危机', title:'精怪作乱', who:'辖内成了气候的精怪',
  desc:'你这些日子神威不振，辖内的精怪都察觉了。它们开始在夜里出来，学着你的样子受香火。',
  opts:[
    { txt:'杀一儆百', req:{威灵:20}, eff:{威灵:-9,阴德:-3,气数:4,香客:1,信心:4,answer:true,
      msg:'你当众收了一只。剩下的老实了三年。'} },
    { txt:'招来立规矩', req:{香火:16}, eff:{香火:-16,威灵:-3,阴德:3,气数:2,香客:1,answer:true,
      msg:'你把它们招来，立了三条规矩。它们守了很久，比人守得还久。'} },
    { txt:'不管', eff:{威灵:-8,气数:-5,香客:-2,信心:-5,answer:false,
      msg:'你没管。半年后，辖内多了三座野庙。'} },
  ]},

{ id:'cr_jinshen', type:'危机', title:'金身蒙尘', who:'你自己的金身',
  desc:'辖内水土凋敝，你的金身开始蒙尘、褪色，指甲盖大的金漆一片片往下掉。这是根基在烂。',
  opts:[
    { txt:'以香火重镀金身', req:{香火:34}, eff:{香火:-34,气数:8,威灵:5,answer:true,
      msg:'你重镀了金身。金身亮起来的时候，你也觉得自己远了些。'} },
    { txt:'去辖内走一走', eff:{气数:5,信心:4,香客:1,威灵:-2,answer:true,
      msg:'你化作凡人，在辖内走了一旬。回来时金身还是旧的，但没再掉漆。'} },
    { txt:'由它去', eff:{气数:-8,威灵:-6,answer:false,
      msg:'你由它去。金身掉得只剩泥胎，香客看见就哭。'} },
  ]},

{ id:'cr_linshen', type:'危机', title:'邻 神 挑 衅', who:'辖界那边的邻神',
  desc:'邻神越界了。它把你辖内的三处水口（或三道山口）占了，还留了句话：「有本事自己来要。」',
  opts:[
    { txt:'打回去', req:{威灵:18}, eff:{越界:1,威灵:-7,阴德:-2,香火:14,气数:3,香客:1,信心:5,answer:true,
      msg:'你打回去了。它没再敢越界，但这笔账记下了。'} },
    { txt:'请城隍来断', eff:{越界:-1,阴德:2,香火:-10,威灵:-3,信心:2,answer:true,
      msg:'你请城隍来断。城隍判它归还，也判你「不得擅启争端」。'} },
    { txt:'让给它', eff:{气数:-6,威灵:-6,香客:-1,信心:-4,香火:-8,answer:false,
      msg:'你让了。三年之内，它又占了两处。'} },
  ]},

{ id:'tianjie', type:'危机', title:'神 道 天 劫', who:'天 上',
  desc:'香火已足，神职可升。但天劫来了——这是山水神祇进阶必经的一关。扛过去，位阶更尊；扛不过去，金身崩裂。更要紧的是，渡劫之后，你将离这片水土更远一分。',
  opts:[
    { txt:'以身渡之', debate:{ power:0,
      win:  { tianjie:'pass', 阴德:5, 威灵:7, 信心:3, msg:'天劫过了。你受位之时，山（水）还是那座山（水），只是你已看不太清山下的炊烟。' },
      lose: { tianjie:'fail', 香火:-30, 气数:-12, 威灵:-8, msg:'天劫未过。金身崩了半边，香火气数俱损，位阶仍在原地。' } } },
    { txt:'止步于此', eff:{香火:-10, 阴德:2, 气数:3, 信心:2,
      msg:'你没渡。天劫在头顶响了半宿，绕着庙走了三圈，散了。你还在原地，脚下的土还在。' } },
  ]},

/* ─────────────── 册目：按旬注入的抉择点 ─────────────── */
{ id:'bk_lici', type:'册目', bookXun:3, once:'bk_lici', title:'立 祠 之 本', who:'你自己',
  desc:'你受封不过几旬。昨夜梦见有人问你：「你想做哪一路神明？」你想了一夜，没想明白。天亮了，该给个说法了。',
  opts:[
    { txt:'做一方父母神', eff:{阴德:6,威灵:-4,气数:4,信心:5,flag:'dao_fumu',answer:true,
      msg:'你选了做父母神。此后辖内生老病死，你都得管，管到脱不了身。'} },
    { txt:'做一方威灵神', eff:{威灵:8,阴德:-3,气数:-2,香客:1,flag:'dao_weiling',answer:true,
      msg:'你选了做威灵神。辖内从此没人敢作乱，也没人敢跟你说话。'} },
    { txt:'先活着，别的不急', eff:{香火:12,气数:2,阴德:-2,flag:'dao_huo',answer:true,
      msg:'你说先活着。这话听起来没出息，但香火确实稳了些。'} },
  ]},

{ id:'bk_weibo', type:'册目', bookXun:8, once:'bk_weibo', title:'夜 游 神 君', who:'一位姓魏的老山神',
  desc:'一个白发老者拄着青色拐杖来到庙前，自称姓魏。他看了你一眼，说：「你这庙里人气还行，就是没个章法。」他在门槛上坐了一下午，讲了不少山水神道的规矩，走的时候什么都没要。',
  opts:[
    { txt:'请他留下喝一杯', eff:{阴德:3,威灵:2,气数:3,香客:1,rel:{城隍:1},flag:'weibo_friend',answer:true,
      msg:'你留他喝了杯酒。他说了句「山神这行当，最忌讳的是忘了自己管着谁」，然后走了。这话你记了很多年。'} },
    { txt:'只听，不接话', eff:{威灵:1,气数:1,flag:'weibo_heard',answer:true,
      msg:'你听了一下午，没接话。他临走时说：「年轻人话少，是好事，也是坏事。」'} },
    { txt:'送客', eff:{威灵:-2,阴德:-2,answer:false,
      msg:'你送了客。他笑了笑，什么都没说，拄着拐杖下山去了。'} },
  ]},

{ id:'bk_zhengxiang', type:'册目', bookXun:14, once:'bk_zhengxiang', title:'争 香', who:'辖界那边的邻神',
  desc:'邻祠那边来了人，说辖界边上那三座村子历来是他们家的香火地，要你归还。你翻了翻册子——那三座村子，确实在两边都烧过香。',
  opts:[
    { txt:'按册子争', req:{威灵:14}, eff:{威灵:-5,阴德:-2,香火:16,香客:2,信心:3,越界:1,answer:true,
      msg:'你按册子争赢了。三座村子的香归了你，但从此两家的庙祝见面不说话。'} },
    { txt:'划界，各占一半', eff:{香火:6,阴德:3,香客:1,信心:3,rel:{邻神:2},answer:true,
      msg:'你划了界，一家一半。邻神后来送了你一坛酒。'} },
    { txt:'让出去', eff:{香火:-14,香客:-2,阴德:2,威灵:-4,信心:-2,rel:{邻神:3},answer:false,
      msg:'你让了。三座村子的香火从此归邻祠，你辖内的香案冷了一年。'} },
  ]},

{ id:'bk_tielv', type:'册目', bookXun:20, once:'bk_tielv', title:'铁 律', who:'一只修行千年的狐精',
  desc:'它修成了人形，也积了千年功德，辖内百姓都替它求情。它只求一个神职——不求山神，只求一方土地的位子。天上没有明说不许，但你知道那条铁律就在那里。',
  opts:[
    { txt:'破一次例', eff:{阴德:10,威灵:-12,气数:-6,香客:2,信心:6,flag:'tielv_po',answer:true,
      msg:'你替它求了。位子给了，天上什么都没说。但第二个月，你的金身无缘无故裂了一道。'} },
    { txt:'据实以告，铁律不可破', eff:{阴德:4,威灵:8,香客:-1,信心:-2,flag:'tielv_shou',answer:true,
      msg:'你说了那条铁律。它听完，磕了个头，说「知道了」，然后走了。三年后它散尽修为，救了一村的人。'} },
    { txt:'推给城隍去判', eff:{阴德:-2,威灵:-3,香火:-8,flag:'tielv_tui',answer:true,
      msg:'你推给了城隍。城隍判了不许，还顺手参了你一本「推诿」。'} },
  ]},

{ id:'bk_xuncha', type:'册目', bookXun:26, once:'bk_xuncha', title:'城 隍 巡 查', who:'本州城隍爷',
  desc:'城隍巡查辖内山水神祇，到你这里停了。他翻了功德簿，看了香火册，最后抬起头问了一句：「这些年，你替辖内做过什么？」',
  opts:[
    { txt:'一件件报出来', req:{阴德:20}, eff:{阴德:5,威灵:6,香火:18,香客:2,信心:6,rel:{城隍:3},answer:true,
      msg:'你报了两个时辰。城隍听完，在册子上画了个圈，说：「该给你的，一样不少。」'} },
    { txt:'只说「尽本分而已」', eff:{阴德:2,威灵:2,香火:6,rel:{城隍:1},answer:true,
      msg:'你说了句「尽本分」。城隍点点头，走了，什么也没加，什么也没减。'} },
    { txt:'请他看看辖内百姓', req:{香客:12}, eff:{威灵:-2,阴德:4,香火:8,香客:1,信心:7,rel:{城隍:2},answer:true,
      msg:'你说：「功德簿上看不出来的，让他们自己说。」那天来了三百多口人。城隍站了很久。'} },
  ]},

{ id:'bk_tianjie', type:'册目', bookXun:32, once:'bk_tianjie', title:'可 以 上 了', who:'天 上',
  desc:'香火与功德都已够了。神职就在头顶，只等你点头。但那位姓魏的老山神说过：山水神祇往上走一步，脚下的土就薄一寸。',
  opts:[
    { txt:'请天劫下来', req:{香火:120, 阴德:8}, eff:{events:'tianjie',answer:true,
      msg:'你点了头。天上响了一声，那声音辖内每个人都听见了，但谁也没抬头。'} },
    { txt:'再等等', eff:{香火:10,气数:3,阴德:2,信心:3,answer:false,
      msg:'你说再等等。天上什么都没响。你在庙里坐到天亮，觉得脚下的土还厚实。'} },
  ]},

{ id:'bk_daxiangke', type:'册目', bookXun:38, once:'bk_daxiangke', title:'十 万 两', who:'一位年烧十万两香的大香客',
  desc:'他来了第三次。这次他说得很直白：只要你在三年之内替他做成三件事，他就把这一门香火全归你，从此不踏邻祠一步。三件事，他没说是哪三件。',
  opts:[
    { txt:'应下', eff:{香火:60,香客:5,阴德:-10,威灵:-4,信心:4,flag:'daxiangke_ying',answer:true,
      msg:'你应下了。第一件事是让他家的病秧子多活三年，第二件是让对门那家败落，第三件你至今没敢问。'} },
    { txt:'只受香火，不认这件事', req:{阴德:15}, eff:{香火:22,香客:2,阴德:4,威灵:3,信心:5,flag:'daxiangke_ju',answer:true,
      msg:'你说：「香你只管烧，事我不能应。」他愣了很久，最后笑了，说「你这神明有意思」，香火照旧。'} },
    { txt:'不见', eff:{香火:-18,香客:-3,信心:-5,阴德:1,flag:'daxiangke_bujian',answer:false,
      msg:'你没见他。第二天，庙里最大的那口香炉被人抬走了。'} },
  ]},

{ id:'bk_xinxiang', type:'册目', bookXun:44, once:'bk_xinxiang', title:'点 一 炷 心 香', who:'一位远道而来的青衫剑客',
  desc:'他走了很远的路，一家一家地敲门，请辖内山水神灵点燃一炷心香。他说，南边有一洲水土破碎，需要所有山水神祇一起祈福。心香一点，你的功德、气数、甚至香火，都要烧掉一大半。而他只是一个过路的，什么也给不了你。',
  opts:[
    { txt:'点', req:{阴德:25, 气数:50}, eff:{阴德:20,气数:-25,香火:-60,威灵:8,香客:2,信心:8,flag:'xinxiang',answer:true,
      msg:'你点了。那炷香烧了七天七夜，烧掉了你一半的身家。他临走时说了一句：「多谢。」就这两个字。'} },
    { txt:'问一句为什么', eff:{阴德:6,气数:-8,香火:-20,威灵:3,flag:'xinxiang_wen',answer:true,
      msg:'你问了。他说：「因为该做。」你想了想，点了半炷。'} },
    { txt:'不点', eff:{阴德:-12,香火:12,气数:4,信心:-6,flag:'xinxiang_bu',answer:false,
      msg:'你没点。他没说什么，磕了个头，去下一家了。那年南边那一洲，没能修回来。'} },
  ]},
];

/* ===================== 危机与册目注入 ===================== */
function scCrisisCd(s, key){ return (s.flags['cd_'+key]||0); }
function scPushCrisis(s, key){
  if(s.events.some(x=>x.id===key)) return;
  if(s.xun - scCrisisCd(s, key) < 8) return;
  s.events.push({ id:key });
  s.flags['cd_'+key] = s.xun;
}
function scSpawnCrises(s){
  if(s.noAnswerStreak >= 2)      scPushCrisis(s, 'cr_xiangke_pao');
  if(s.res.阴德 <= -10 && s.越界 >= 2) scPushCrisis(s, 'cr_yinci');
  if(s.res.威灵 <= 8)            scPushCrisis(s, 'cr_jingguai');
  if(s.res.气数 <= 20)           scPushCrisis(s, 'cr_jinshen');
  if(s.越界 >= 3)                scPushCrisis(s, 'cr_linshen');
}
function scSpawnBook(s){
  for(const def of SC_EVENTS){
    if(def.type !== '册目') continue;
    if(s.events.some(e=>e.id===def.id)) continue;
    if(def.once && s.flags[def.once]) continue;
    if(s.xun < def.bookXun) continue;
    s.events.push({ id:def.id });
  }
}

/* ===================== 旬循环 ===================== */
/* 点「过此旬」→ 先结算本旬、出中转页，不推进时间、不注入新祈愿 */
function scSettle(){
  const s = state.shenci; if(s.over) return;

  const ts = s.turnStart || scSnap(s);
  const before = scSnap(s);  // 结算前快照（抉择已落地、被动经营尚未算）
  s.settleBefore = before;   // 供结算页内嵌祠务后 scResettle 重算账本（所奏=before-ts，自然=after-before）
  const notes = [];

  // 1) 本旬结算
  const inc = scIncome(s);
  scGain(s, '香火', inc);
  if(s.脱根 > 0 && Math.random() < 0.13 * s.脱根){
    s.香客 = Math.max(0, s.香客 - 1);
    scLog(s, '香火簿上又少了一户。他们没说什么，只是不再来了。', 'bad');
    notes.push('香火簿上又少了一户。');
  }
  if(s.noAnswerStreak >= 3){
    s.信心 = Math.max(0, s.信心 - 3);
    scLog(s, '辖内开始有人说，这庙里的神明不管事。', 'bad');
    notes.push('辖内开始有人说，这庙里的神明不管事。');
  }
  const season = scSeason(s);
  let qi = Math.floor(s.香客/8) + Math.max(0, Math.floor(s.res.阴德/35)) - Math.round(s.脱根*1.6);
  if(season==='春') qi += 2; else if(season==='夏') qi += 1;
  else if(season==='秋') qi += 0; else qi -= 1;
  if(s.香客 <= 3) qi -= 2;
  scGain(s, '气数', qi);
  if(s.res.气数 <= 0) s.qiZeroStreak++; else s.qiZeroStreak = 0;
  if(s.res.香火 >= 150) scGain(s, '威灵', 1);

  // 2) 积压惩罚
  if(s.backlog > 0){
    s.backlog--;
    s.信心 = Math.max(0, s.信心 - 3);
    scGain(s, '气数', -2);
    scLog(s, '搁置的祈愿生了怨，辖内气数渐薄。', 'bad');
    notes.push('搁置的祈愿生了怨，辖内气数渐薄。');
  }

  // 3) 账目快照
  const after = scSnap(s);
  const ledger = [
    scLedRow('香火', '香火', ts, before, after),
    scLedRow('气数', '气数', ts, before, after),
    scLedRow('功德', '阴德', ts, before, after),
    scLedRow('威灵', '威灵', ts, before, after),
    scLedRow('香客', '香客', ts, before, after),
    scLedRow('信心', '信心', ts, before, after),
  ];
  s.lastSettle = {
    year: scYearOf(s), xun: ((s.xun-1)%12+1), season,
    isLast: (s.xun >= SC_TOTAL_XUN),
    ledger, notes,
    backlogLeft: s.backlog,
    income: inc,
    xunStats: Object.assign({应:0,不应:0,搁置:0}, s.xunStats||{}),
  };
  s.settling = true;
  render();
  scFlushFx(s);
}

/* 结算页内嵌祠务（巡/养/请天劫）后，用结算前快照重算账本，避免重复结算副作用。
   玩家在结算页补做事的变动只反映到本旬账本与下一旬起始值，不重跑 scSettle 的随机惩罚。 */
function scResettle(s){
  if(!s.settling || !s.lastSettle || !s.settleBefore) return;
  const ts = s.turnStart || s.settleBefore;
  const b = s.settleBefore;          // 抉择已落地、祠务尚未算
  const after = scSnap(s);           // 含结算页补做的巡/养/请天劫
  s.lastSettle.ledger = [
    scLedRow('香火', '香火', ts, b, after),
    scLedRow('气数', '气数', ts, b, after),
    scLedRow('功德', '阴德', ts, b, after),
    scLedRow('威灵', '威灵', ts, b, after),
    scLedRow('香客', '香客', ts, b, after),
    scLedRow('信心', '信心', ts, b, after),
  ];
  render();
  scFlushFx(s);
}

/* 中转页「入下一旬」→ 真正推进时间、注入新祈愿 */
function scEnterNext(){
  const s = state.shenci; if(s.over || !s.settling) return;
  s.settling = false;
  s.lastSettle = null;

  // 1) 推进时间
  s.xun++;
  s.ap = 3;
  s.year = scYearOf(s);
  s.turnStart = scSnap(s);   // 新回合开始基线（资源已承接上旬，抉择尚未落地）

  // 2) 终局
  if(s.xun > SC_TOTAL_XUN){ scEnding(s, scRouteEnding(s)); return; }

  // 3) 注入：危机 + 册目 + 普通祈愿
  const season = scSeason(s);
  scSpawnCrises(s);
  scSpawnBook(s);
  let n = 3;
  if(season==='秋') n = 4;
  if(s.香客 >= 14) n += 1;
  n = Math.min(4, n);
  scDealWishes(s, n);

  // 4) 结局预检
  scCheckEndingLive(s);
  if(s.over) return;

  scLog(s, '—— 第 '+scYearOf(s)+' 年 · '+scSeason(s)+' · 第 '+((s.xun-1)%12+1)+' 旬 ——', 'big');
  scBanner('第 '+scYearOf(s)+' 年', '· '+scSeason(s)+' · 第 '+((s.xun-1)%12+1)+' 旬');
  render();
  scFlushFx(s);
}

/* 兼容旧调用（测试/脚本）：结算并立即进入下一旬 */
function scAdvance(){ scSettle(); scEnterNext(); }

/* ── 本旬是否已尽（无事可做）──────────────────────────────
   行动力是唯一门票：ap 归零后，解祈愿 / 巡山 / 养气 / 请天劫 全部失效，
   此时「过此旬」已不是选择、而是必然的结算 —— 必然的事不该再要玩家点一下。
   另一种：祈愿已空且三项主动动作皆不可用（罕见），同样无事可做。 */
function scCanTianjie(s){
  // 请天劫需 1 点、应天劫再需 1 点，故须 ap>=2；否则请了天劫却无力应劫，天劫会卡在队列里
  if(s.rank >= SC_RANK_MAX || s.ap < 2) return false;
  const need = SC_ASCEND_NEED[s.rank+1]; if(!need) return false;
  return s.res.香火>=need.香火 && s.res.阴德>=need.阴德 && s.res.气数>=need.气数;
}
function scXunExhausted(s){
  if(!s || s.over || s.settling) return false;
  if(s.ap <= 0){
    // 队列里若还压着天劫，不自动结算 —— 天劫是大事，不能被账本顺手跳过
    if(s.events.some(function(e){ return e.id === 'tianjie'; })) return false;
    return true;
  }
  if(s.events.length === 0){
    // 事件清空即结 — 「过此旬」是必然操作，不该再要玩家点（用户 2026-09-04 明令）
    return true;
  }
  return false;
}
/* 本旬已尽 → 自动出账本中转页。留一拍让飘字与叙事先落地，免得刚做完的结果被吞 */
function scMaybeAutoSettle(s){
  if(s.settling) return;          // 已在结算，不重复触发（用户 2026-09-04：去 900ms 闪一下，直接跳）
  if(!scXunExhausted(s)) return;
  scSettle();
}

/* 主动请天劫：够格时玩家可随时选择「再往上走一步」——诱惑常在，代价是自找的 */
function scRequestTianjie(){
  const s = state.shenci; if(s.over) return;
  if(!scCanTianjie(s)) return;
  s.ap--;
  s.events.push({ id:'tianjie' });
  scLog(s,'你点向头顶。天上响了一声，辖内每个人都听见了，但谁也没抬头。','big');
  SFX.click(); render();
  scMaybeAutoSettle(s);
}

/* ===================== 主动养护（香火 → 辖地） =====================
   神明不能出手，但可以「走一走」「润一润」：把香火换回地气，
   这是玩家唯一主动的支出出口，也是气数见底时的自救手段。 */
function scPatrol(){
  const s = state.shenci; if(s.over) return;
  if(s.ap<=0 || s.res.香火<8) return;
  s.ap--; scGain(s,'香火',-8); scGain(s,'气数',5);
  s.信心 = Math.min(100, s.信心+2);
  scLog(s,'你化作凡人，在辖内走了一旬。田埂、渡口、庙前那棵老树，都看了一遍。','');
  if(!s.fxQueue) s.fxQueue = [];
  s.fxQueue.push({k:'香火',v:-8}); s.fxQueue.push({k:'气数',v:5});
  SFX.click(); render(); scFlushFx(s);
  scMaybeAutoSettle(s);   // 行动力耗尽 → 自动结算
  if(s.settling) scResettle(s);   // 已在结算页做祠务 → 重算账本
}
function scNourish(){
  const s = state.shenci; if(s.over) return;
  if(s.ap<=0 || s.res.香火<20) return;
  s.ap--; scGain(s,'香火',-20); scGain(s,'气数',11); scGain(s,'威灵',-2);
  scLog(s,'你把攒下的香火化进地脉。辖内的草木，来年会长得更好些。','');
  if(!s.fxQueue) s.fxQueue = [];
  s.fxQueue.push({k:'香火',v:-20}); s.fxQueue.push({k:'气数',v:11});
  SFX.click(); render(); scFlushFx(s);
  scMaybeAutoSettle(s);   // 行动力耗尽 → 自动结算
  if(s.settling) scResettle(s);   // 已在结算页做祠务 → 重算账本
}

/* ===================== 结局 ===================== */
const SC_ENDINGS = {
  zhengshen: { g:'S', t:'正 神',
    d:'你受封正神，执掌千里地界，护水土、扛文运，享万民香火。\n\n你走过很远的路，远到有时候要很费力，才想得起最初那座小庙的样子。但你每次想起来，都还记得。\n\n辖内的人说，这位神明很怪——位子越高，来得越勤。',
    poem:'千年香火一朝新，犹记当年一炷心。' },
  shanjun: { g:'A', t:'山 君',
    d:'你做到一山之主，辖三十余山头，一方水土都服你。\n\n庙修过三次，一次比一次大。只是上山的路也越修越宽，宽到山民上香时，很少再像从前那样，站下来跟你说几句话。\n\n你想，这大概就是往上走的代价。',
    poem:'山有木兮木有枝，心悦君兮君已知。' },
  shoutu: { g:'B', t:'守 土',
    d:'你没有再往上走。位子不高，香火不算旺，但你守着这一方水土，一守就是很多年。\n\n辖内每一户人家的红白喜事，你都在。谁家的田今年收成好，谁家的孩子考中了，你比谁都先知道。\n\n有人替你惋惜，说你本来可以更高。你没接这话——脚下的土还厚实，这比什么都强。',
    poem:'不须更上层楼去，自有青山在脚边。' },
  tuogen: { g:'C', t:'脱 根',
    d:'你上去了。位阶一次比一次高，金身一次比一次亮。\n\n可不知从哪一年起，山下的炊烟你渐渐看不清，辖内谁家添了丁、谁家走了人，你也渐渐不知道了。有天你低头看了一眼，发现脚下的土已经薄得几乎没有。\n\n你成了很高很大的神明，只是没有地方可回了。',
    poem:'更上一层楼，回首不见人。' },
  chenjiang: { g:'C', t:'沉 江',
    d:'神位被废。金身被打碎，抛进了江里。\n\n香火断了，庙拆了，辖内的册子上再没有你的名字。你在江底躺了很多年，看着一代又一代人从桥上走过去。\n\n很多年后，有个孩子在江边捡到一块碎金，拿回家给他娘看。他娘看了很久，说：好像是庙里的东西。',
    poem:'金身沉江底，香火付东流。' },
  yinci: { g:'D', t:'淫 祠',
    d:'朝廷判你淫祠，庙拆，名除。\n\n你在废墟上坐了很多年。偶尔还有人偷偷来放一炷香，放完就走，走得很快，像做贼。\n\n你想说点什么，但已经没有人听得见了。',
    poem:'名不正则言不顺，香火虽在已无人。' },
  xiaosan: { g:'D', t:'消 解',
    d:'香客散尽，庙门紧闭，神像落满了灰。\n\n你没有死，只是慢慢没人记得了。风从破窗里吹进来，吹动香案上一层薄薄的灰。\n\n神明不是被打倒的，是被忘掉的。',
    poem:'香冷灰深人不至，一庙风雨自消磨。' },
};

function scRouteEnding(s){
  const init = SC_DIFF[s.diff].香客;
  if(s.香客 <= 1) return 'xiaosan';
  if(s.res.气数 <= 8 && s.香客 <= Math.ceil(init*0.5)) return 'chenjiang';
  // 淫祠：香火还在、人还来，可来的都是怕你的（原著：名不正则言不顺，非无人祭祀）
  if(s.res.阴德 < -8 && s.香客 >= Math.ceil(init*0.35) && s.res.威灵 >= 8) return 'yinci';
  // 脱根：爬得高，脚下的土却没了。以「当前上限」而非初始值为尺 ——
  // 位子越高，辖内本该越兴旺，你却连守住这一方水土都做不到（非败于人，败于离土）
  if(s.rank >= 2 && s.香客 <= Math.ceil(scXkCap(s)*0.4)) return 'tuogen';
  if(s.rank >= 3 && s.香客 >= init && s.res.阴德 >= 38) return 'zhengshen';
  if(s.rank >= 2) return 'shanjun';
  if(s.香客 >= init && s.res.气数 >= 50) return 'shoutu';
  if(s.rank >= 1 && s.香客 >= Math.ceil(init*0.7)) return 'shoutu';
  return 'xiaosan';
}

function scCheckEndingLive(s){
  if(s.over) return;
  // 气数见底连续三旬 → 神位不保（留三旬缓冲，不瞬死）
  if(s.qiZeroStreak >= 3){ scEnding(s, 'chenjiang'); return; }
  if(s.res.香火 <= 0 && s.res.气数 <= 0 && s.香客 <= 1){ scEnding(s, 'chenjiang'); return; }
  // 脱根：居高位而辖内已无人问津。这一刻就该结束，不必等四十八旬 ——
  // 香客流失是雪崩式的，终局判定抓不住那个「回头看，山下空了」的瞬间
  if(s.rank >= 2 && s.香客 > 0 && s.香客 <= Math.ceil(scXkCap(s)*0.4)){ scEnding(s, 'tuogen'); return; }
  if(s.香客 <= 0){ scEnding(s, 'xiaosan'); return; }
  if(s.xun > SC_TOTAL_XUN){ scEnding(s, scRouteEnding(s)); return; }
}

function scEnding(s, key){
  s.over = true; s.ending = key;
  scLog(s, '终局 · '+SC_ENDINGS[key].t, 'big');
  // 山水祠此前没有本地存档，打完即散——此处一并补上结局图鉴留存
  let isNew = true;
  try{
    const o = JSON.parse(localStorage.getItem('jianlai_shenci')||'{}');
    isNew = !o[key];
    o[key] = (o[key]||0)+1;
    localStorage.setItem('jianlai_shenci', JSON.stringify(o));
  }catch(e){}
  try{ if(typeof prRecordEnding==='function') prRecordEnding('shenci', key, SC_ENDINGS[key].t, isNew); }catch(e){}
  scBanner(SC_ENDINGS[key].t, SC_ENDINGS[key].g + ' 等', '');
  render();
}

/* ===================== 叙事节拍 ===================== */
const SC_MOOD = {
  春:['山下在插秧，一行一行，插得很直。','庙前的桃花开了，风吹一夜，落了满阶。','有人在庙外续了半炷香，站了一会儿，走了。'],
  夏:['蝉叫得人心烦。你在庙里坐了一整天。','河水涨了，淹了下游半片滩地。','夜里下了一场雨，打在瓦上，像有人在敲门。'],
  秋:['稻子熟了，辖内飘着新米的味道。','有人来还愿，抬着一整头猪。','天高得很，山下的炊烟直直地往上走。'],
  冬:['庙里冷。香客来得少，来得都很急。','下了三天雪，山都白了。','门槛外有一串脚印，来了又走了。'],
};
function scMoodLine(s){
  const se = scSeason(s);
  const arr = SC_MOOD[se];
  let line = arr[(s.xun + s.香客) % arr.length];
  if(s.脱根 >= 2) line = '你又往上走了一步。回头看时，山下的灯火小得像几点火星。';
  if(s.香客 <= 3) line = '庙里很静。静得能听见香灰落下的声音。';
  if(s.noAnswerStreak >= 3) line = '好些日子没应过一件事了。供桌上的果子，放得发了霉。';
  return line;
}

/* ===================== 入口 ===================== */
function openShenci(){
  try { SFX.set(true); SFX.click(); }catch(_){}
  try { scFXClear(); scFXInit(); }catch(_){}
  state = { phase:'shenci', shenci:newScState('shan', difficulty) };
  state.shenci.pick = 'pick';
  try { render(); }catch(e){ console.error('[shenci] render after openShenci failed:', e); }
}
function scPickDomain(dom){
  const s = state.shenci; s.dom = dom;
  try { SFX.click(); render(); }catch(e){ console.error('[shenci] scPickDomain render failed:', e); }
}
function scPickDiff(d){
  const s = state.shenci;
  const ns = newScState(s.dom, d);
  ns.pick = 'pick';
  state.shenci = ns;
  try { SFX.click(); render(); }catch(e){ console.error('[shenci] scPickDiff render failed:', e); }
}
function scDealWishes(s, n){
  for(let i=0;i<n;i++){
    const pool = SC_EVENTS.filter(e=>e.type==='祈愿'
      && (!e.dom || e.dom===s.dom)
      && (!e.once || !s.flags[e.once])
      && (!e.gate || e.gate(s))
      && !s.events.some(x=>x.id===e.id));
    if(!pool.length) break;
    s.events.push({ id:pool[Math.floor(Math.random()*pool.length)].id });
  }
}
function scStart(){
  const s = state.shenci;
  s.pick = null;
  scDealWishes(s, 2);
  s.turnStart = scSnap(s);   // 回合开始基线（首旬）
  scLog(s, '你于一隅受香，位卑言轻。山水之间，从此多了一双眼睛。', 'big');
  scBanner('受 香', '一方水土 · 一位末流神明', '');
  try { SFX.click(); render(); }catch(e){ console.error('[shenci] scStart render failed:', e); }
}

/* ===================== 渲染 ===================== */
function scRenderRes(s){
  const items = [
    ['香火', s.res.香火, scResRatio('香火',s), SC_ICO.xianghuo(scResRatio('香火',s)), s.res.香火<20?'warn':''],
    ['气数', s.res.气数, scResRatio('气数',s), SC_ICO.qishui(scResRatio('气数',s)), s.res.气数<20?'warn':(s.res.气数>=60?'good':'')],
    ['阴德', s.res.阴德, scResRatio('阴德',s), SC_ICO.yinde(scResRatio('阴德',s)), s.res.阴德<0?'warn':(s.res.阴德>=30?'good':'')],
    ['威灵', s.res.威灵, scResRatio('威灵',s), SC_ICO.weiling(), ''],
    ['香客', s.香客+' 户', scResRatio('香客',s), SC_ICO.xiangke(scResRatio('香客',s)), s.香客<=3?'warn':(s.香客>=12?'good':'')],
  ];
  return '<div class="sc-res">' + items.map(it=>
    '<div class="ri '+it[4]+'">'
    + '<span class="ico" style="color:'+(it[4]==='warn'?'#d98b6a':(it[4]==='good'?'#8fc49b':'#e8cf8f'))+'">'+it[3]+'</span>'
    + '<span class="lbl">'+it[0]+'</span><b>'+it[1]+'</b></div>').join('') + '</div>';
}

/* 主舞台一次只呈一桩事：先见眼前这桩，了却方见下一桩 */
/* 有配图的事件 id 集合（与 prototype/assets/shenci/、weapp/assets/shenci/ 下的文件一一对应）
   不在集合内的事件直接不 emit <img>，避免加载不存在文件。 */
const SC_IMG_IDS = new Set([
  'shan_qiuyu','shan_hujing','shan_menghu','shan_zhuoya','shan_kaikuang',
  'shan_gankao','shan_tongnv','shan_kujing','shan_shanxiao','shan_laoyu',
  'shan_zhengshui','shan_xinmiao','shan_leipi','shan_shanhong',
  'shui_fengping','shui_qiuyu','shui_luoshui','shui_shuigui','shui_quqin',
  'shui_liangan','shui_duanliu','shui_hongshui','shui_qiaota','shui_chenchuan',
  'shui_jingguai','shui_touhe','shui_zhengchuan','shui_shixiu',
  'daxiangke','heyi_buying','yinci_xian','miaozhu_tanmo','youfang_daozhang',
  'chenghuang_chuanxun','cr_xiangke_pao','cr_yinci','cr_jingguai','cr_jinshen',
  'cr_linshen','tianjie','bk_lici','bk_weibo','bk_zhengxiang','bk_tielv',
  'bk_xuncha','bk_tianjie','bk_daxiangke','bk_xinxiang'
]);
function scWishImg(id){ return SC_IMG_IDS.has(id) ? '<img class="sc-wish-img" src="assets/shenci/'+id+'.jpg" alt="" onerror="this.style.display=\'none\'">' : ''; }

function scRenderWishes(s){
  // 合并后：事件清空即自动跳 settle 屏出账本，不显示空状态过渡文字
  if(!s.events.length) return '';
  const apOut = s.ap <= 0;
  const total = s.events.length;
  const ev = s.events[0];
  const def = scEventDef(ev.id); if(!def) return '';
  let h = '';
  if(total > 1){
    h += '<div class="sc-w-prog">本旬所奏 · 第 <b>1</b> 桩 ／ 共 <b>'+total+'</b> 桩</div>';
  }
  h += '<div class="sc-wish'+(def.type==='危机'?' urgent':'')+(def.type==='册目'?' rite':'')+'">';
  h += scWishImg(ev.id);
  h += '<div class="sc-w-title">'+def.title+'</div>';
  h += '<div class="sc-w-who">'+def.who+'</div>';
  h += '<div class="sc-w-desc">'+def.desc.replace(/\n/g,'<br>')+'</div>';
  if(def.q) h += '<blockquote class="sc-quote">「'+def.q.replace(/</g,'&lt;')+'」</blockquote>';
  h += '<div class="sc-w-opts">';
  def.opts.forEach((opt, oi)=>{
    const rq = scOptReqOk(s, opt);
    const dis = !rq.ok || apOut;
    const why = !rq.ok ? rq.why : (apOut ? '行动力已尽' : '');
    const ico = scOptIcon(def.type);
    h += '<button class="sc-btn sc-opt" '+(dis?'disabled':'')+' onclick="scResolveEvent(0,'+oi+')">'
       + '<span class="sc-opt-body"><span class="sc-opt-ico">'+ico+'</span>'
       + '<span>'+opt.txt + (why?'<span class="sc-lock">'+why+'</span>':'')+'</span></span></button>';
  });
  h += '</div>';
  h += '<div style="text-align:right;margin-top:9px">'
     + '<button class="sc-opt skip-opt" onclick="scSkipEvent(0)">'
     + '<span class="sc-opt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 H19"/><path d="M8 19 V12 H16 V19"/><path d="M8 12 H16"/><path d="M12 5 V9"/><path d="M9.5 7.5 L12 5 L14.5 7.5"/></svg></span>'
     + '<span>搁 置</span></button></div>';
  h += '</div>';
  if(total > 1){
    h += '<div class="sc-w-more">了却眼前这桩，方见其后 '+(total-1)+' 桩。</div>';
  }
  return h;
}

/* 事件选项图标：按 type 给一枚朴素的古风小图，不上渐变/光晕 */
function scOptIcon(type){
  if(type==='危机'){
    // 短剑
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 3 L20 8.5 L8.5 20 L3 20 L3 14.5 Z"/><path d="M14.5 3 L17 5.5"/></svg>';
  }
  if(type==='册目'){
    // 竹简/书卷
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4 H17 a3 3 0 0 1 3 3 V17 a3 3 0 0 1-3 3 H7 a3 3 0 0 1-3-3 V4 Z"/><path d="M4 8 H20"/><path d="M8 12 H16"/><path d="M8 16 H13"/></svg>';
  }
  // 祈愿：默认 香炉
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9 H17 V13 a5 5 0 0 1-5 5 a5 5 0 0 1-5-5 Z"/><path d="M5 9 H19"/><path d="M12 5 V3"/><path d="M9 4.5 Q12 2 15 4.5"/><path d="M9 20 H15"/></svg>';
}

function scRenderLog(s){
  if(!s.log.length) return '<div class="sc-log">尚无纪事。</div>';
  return '<div class="sc-log">' + s.log.slice(0,26).map(l=>
    '<div class="'+l.cls+'">'+l.t+'</div>').join('') + '</div>';
}

function scRenderCiwu(s){
  const cur = SC_RANKS[s.dom][s.rank];
  const next = s.rank>=SC_RANK_MAX ? null : SC_RANKS[s.dom][s.rank+1];
  const need = s.rank>=SC_RANK_MAX ? null : SC_ASCEND_NEED[s.rank+1];
  let h = '';
  h += '<div class="sc-actions" style="margin-bottom:11px">'
     + '<button class="sc-btn sm" '+((s.ap>0&&s.res.香火>=8)?'':'disabled')+' onclick="scPatrol()">巡 辖 内（香火 8）</button>'
     + '<button class="sc-btn sm" '+((s.ap>0&&s.res.香火>=20)?'':'disabled')+' onclick="scNourish()">润 地 脉（香火 20）</button>'
     + '</div>';
  h += '<div class="sc-panel"><h3>神 职</h3>'
     + '<div class="sc-kv"><span>今 位</span><b>'+cur.name+'</b></div>'
     + '<div class="sc-kv"><span>辖 地</span><b>'+cur.desc+'</b></div>'
     + '<div class="sc-kv"><span>脱离根基</span><b>'+s.脱根+' 分</b></div>'
     + '<div class="sc-kv"><span>越界干预</span><b>'+s.越界+' 次</b></div>'
     + '</div>';
  if(next && need){
    const ok = s.res.香火>=need.香火 && s.res.阴德>=need.阴德 && s.res.气数>=need.气数;
    h += '<div class="sc-panel"><h3>上 行 之 路</h3>'
       + '<div class="sc-kv"><span>下一位</span><b>'+next.name+'</b></div>'
       + '<div class="sc-kv"><span>需香火</span><b>'+need.香火+'</b></div>'
       + '<div class="sc-kv"><span>需阴德</span><b>'+need.阴德+'</b></div>'
       + '<div class="sc-kv"><span>需气数</span><b>'+need.气数+'</b></div>'
       + '<div class="sc-kv"><span>眼下</span><b>'+(ok?'已够格':'尚欠')+'</b></div>'
       + (ok ? '<div style="margin-top:9px"><button class="sc-btn sm" '+(scCanTianjie(s)?'':'disabled')+' onclick="scRequestTianjie()">请 天 劫 下 来</button>'
             + (scCanTianjie(s) ? '' : '<div style="margin-top:6px;font-size:11px;color:#8a6a5a;letter-spacing:1px">行动力不足 · 请劫与应劫各需一点</div>')
             + '</div>' : '')
       + '</div>';
  } else {
    h += '<div class="sc-panel"><h3>上 行 之 路</h3><div class="sc-kv"><span>已至绝顶</span><b>再上便要离了这片水土</b></div></div>';
  }
  h += '<div class="sc-panel"><h3>辖 内</h3>'
     + '<div class="sc-kv"><span>百姓信心</span><b>'+s.信心+' / 100</b></div>'
     + '<div class="sc-kv"><span>本旬香火收入</span><b>'+scIncome(s)+'</b></div>'
     + '<div class="sc-kv"><span>香客较受封时</span><b>'+(s.香客-SC_DIFF[s.diff].香客>=0?'+':'')+(s.香客-SC_DIFF[s.diff].香客)+' 户</b></div>'
     + '</div>';
  h += '<div class="sc-panel"><h3>辖 内 纪 事</h3>'+scRenderLog(s)+'</div>';
  if(s.trail.length){
    h += '<div class="sc-panel"><h3>因 果 簿</h3><div class="sc-log">'
       + s.trail.slice(-12).reverse().map(t=>'<div>· '+t.t+'　'+t.c+'</div>').join('')
       + '</div></div>';
  }
  return h;
}

function scRenderPick(s){
  const dom = s.dom;
  let h = '<div class="sc-pick"><div class="pk-t">山 水 祠</div>'
    + '<div class="pk-s">你是一位末流的山水神明，辖一方水土，享一方香火。<br>'
    + '你不能下山，不能出手，只能应，或不应。<br>'
    + '香火养你，也绑住你；往上走一步，脚下的土就薄一寸。</div>'
    + '<div class="pk-cards">';
  ['shan','shui'].forEach(k=>{
    const d = SC_DOMAIN[k];
    h += '<div class="pk-card" onclick="scPickDomain(\''+k+'\')" style="'+(dom===k?'border-color:#8a6a2f;background:#191f17':'')+'">'
       + '<div class="pk-seal">'+d.seal+'</div>'
       + '<div class="pk-n">'+d.name+'</div>'
       + '<div class="pk-d">'+d.desc.replace(/\n/g,'<br>')+'</div>'
       + '<div class="pk-origin">'+d.origin.replace(/\n/g,'<br>')+'</div>'
       + '</div>';
  });
  h += '</div><div class="pk-diff">';
  ['easy','normal','hard'].forEach(k=>{
    const d = SC_DIFF[k];
    h += '<button class="sc-btn'+(s.diff===k?' primary':'')+'" onclick="scPickDiff(\''+k+'\')">'+d.name+'</button>';
  });
  h += '</div><div class="pk-diff"><button class="sc-btn primary" onclick="scStart()">受 香 立 位 →</button> '
     + '<button class="sc-btn ghost" onclick="state={phase:\'title\',sel:[],log:[]};render()">回到卷首</button></div>';
  h += '</div>';
  return h;
}

function scRecap(s){
  const init = SC_DIFF[s.diff].香客;
  return '受封 '+SC_TOTAL_XUN+' 旬　·　位至 '+scRankName(s)
       + '　·　香客 '+init+' → '+s.香客+' 户'
       + '　·　阴德 '+s.res.阴德
       + '<br>脱离根基 '+s.脱根+' 分　·　越界 '+s.越界+' 次　·　辖内气数 '+s.res.气数;
}

function renderShenci(app){
  const s = state.shenci;
  if(s.pick){ app.innerHTML = scRenderPick(s); return; }

  if(s.over){
    const e = SC_ENDINGS[s.ending];
    app.innerHTML = '<div class="sc"><div class="sc-ending">'
      + '<div class="grade g-'+e.g+'">'+e.g+'</div>'
      + '<div class="et">'+e.t+'</div>'
      + '<div class="ed">'+e.d.replace(/\n/g,'<br>')+'</div>'
      + '<div class="ep">「'+e.poem+'」</div>'
      + '<div class="erec">'+scRecap(s)+'</div>'
      + '<div class="sc-back">'
      + '<button class="sc-btn primary" onclick="openShenci()">重 开 一 局</button> '
      + '<button class="sc-btn ghost" onclick="state={phase:\'title\',sel:[],log:[]};render()">回到卷首</button>'
      + '</div></div></div>';
    return;
  }

  if(s.settling && s.lastSettle){
    const st = s.lastSettle;
    const SC_ST_ICO = { 香火:'xianghuo', 气数:'qishui', 功德:'yinde', 威灵:'weiling', 香客:'xiangke', 信心:'xinxin' };
    let lh = '';
    st.ledger.forEach(r=>{
      const cls = r.net>0?'up':(r.net<0?'down':'');
      const netTxt = (r.net>0?'+':'')+r.net;
      const evtTxt = (r.evt>0?'+':'')+r.evt;
      const natTxt = (r.nat>0?'+':'')+r.nat;
      const icoFn = SC_ICO[SC_ST_ICO[r.k]];
      const ico = icoFn ? '<div class="st-ico">'+icoFn()+'</div>' : '<div class="st-ico"></div>';
      lh += '<div class="st-row '+cls+'">'+ico+'<div class="st-k">'+r.k+'</div>'
          + '<div class="st-v"><span class="sv-net">'+netTxt+'</span><span class="sv-sub">所奏 '+evtTxt+' ／ 自然 '+natTxt+'</span></div></div>';
    });
    let nh = '';
    (st.notes||[]).forEach(n=>{ nh += '<div class="st-note">'+n+'</div>'; });
    const backlog = st.backlogLeft>0 ? '<div class="st-backlog">尚有 '+st.backlogLeft+' 桩积压，悬而未决。</div>' : '';
    const xs = st.xunStats || {应:0,不应:0,搁置:0};
    const sIco = { 应:SC_ICO.zhun(), 不应:SC_ICO.bo(), 搁置:SC_ICO.ge(), 香火收入:SC_ICO.xianghuo() };
    const stat = (n,v,cls)=>'<div class="st-stat '+cls+'"><div class="st-sico">'+(sIco[n]||'')+'</div><b>'+v+'</b><span>'+n+'</span></div>';
    const stats = '<div class="st-stats">'
      + stat('应', xs.应, 'up')
      + stat('不应', xs.不应, 'down')
      + stat('搁置', xs.搁置, '')
      + stat('香火收入', '+'+(st.income||0), 'gold')
      + '</div>';
    const canCiwu = s.ap>0 && (s.res.香火>=8 || s.res.香火>=20 || scCanTianjie(s));
    app.innerHTML = '<div class="sc"><div class="sc-settle">'
      + '<div class="st-head">本 旬 已 了</div>'
      + '<div class="st-sub">第 '+st.year+' 年 · 第 '+st.xun+' 旬 · '+st.season+'</div>'
      + '<div class="st-label ledger-l">本 旬 账 本</div>'
      + '<div class="st-ledger">'+lh+'</div>'
      + '<div class="st-label stats-l">本 旬 所 奏</div>'
      + stats
      + (nh?'<div class="st-notes">'+nh+'</div>':'')
      + backlog
      + (canCiwu ? '<button class="sc-btn" onclick="toggleCiwu()">祠 务 ▸</button>' : '')
      + '<button class="sc-btn primary" onclick="scEnterNext()">'+(st.isLast?'入 终 局 →':'入 下 一 旬 →')+'</button>'
      + '</div></div>';
    if(s.ciwu){
      app.innerHTML += '<div class="sc-drawer-mask" onclick="toggleCiwu()"></div>';
      app.innerHTML += '<div class="sc-drawer"><div class="sc-drawer-h"><span>祠 务</span>'
         + '<button class="sc-btn ghost sm" onclick="toggleCiwu()">收起 ✕</button></div>'
         + scRenderCiwu(s) + '</div>';
    }
    return;
  }

  const dom = SC_DOMAIN[s.dom];
  let h = '<div class="sc">';
  h += '<div class="sc-head">'
     + '<div class="sc-hero">'
     +   '<div class="seal">'+dom.seal+'</div>'
     +   '<div><div class="hname">'+dom.name+'</div>'
     +   '<div class="hsub">'+scRankName(s)+'　·　'+SC_RANKS[s.dom][s.rank].desc+'　·　第 '+scYearOf(s)+' 年</div></div>'
     + '</div>'
     + '<div class="sc-timer">第 <b>'+((s.xun-1)%12+1)+'</b> 旬 · <span>'+scSeason(s)+'</span> · 尚余 <b>'+(SC_TOTAL_XUN - s.xun + 1)+'</b> 旬'
     + '<br>本旬香火收入 <b>'+scIncome(s)+'</b>　·　百姓信心 <b>'+s.信心+'</b></div>'
     + '</div>';
  h += scRenderRes(s);
  h += '<div class="sc-mood">'+scMoodLine(s)+'</div>';
  h += '<div class="sc-stage"><h3>本 旬 香 火</h3>'
     + '<div class="st-sub">辖内所奏之事，待你一言而决</div>'
     + scRenderWishes(s) + '</div>';
  h += '<div class="sc-ap">本旬行动力 <b>'+s.ap+'</b> ／ 3　·　搁置未理事 <b>'+s.backlog+'</b></div>';
  h += '<div class="sc-actions">'
     + '<button class="sc-btn" onclick="toggleCiwu()">祠 务 ▸</button>'
     + '</div>';

  if(s.ciwu){
    h += '<div class="sc-drawer-mask" onclick="toggleCiwu()"></div>';
    h += '<div class="sc-drawer"><div class="sc-drawer-h"><span>祠 务</span>'
       + '<button class="sc-btn ghost sm" onclick="toggleCiwu()">收起 ✕</button></div>'
       + scRenderCiwu(s) + '</div>';
  }

  h += '<div class="sc-back"><button class="sc-btn ghost" onclick="state={phase:\'title\',sel:[],log:[]};render()">回到卷首</button></div>';
  h += '</div>';
  app.innerHTML = h;
}

function toggleCiwu(){
  const s = state.shenci; if(s.over) return;
  s.ciwu = !s.ciwu; SFX.click(); render();
}
