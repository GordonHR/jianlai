/* 山水祠 · PC 端冒烟（临时脚本，跑完即删）
   拼串丢 vm，注入 DOM / AudioContext 打桩，验证：
   ① 语法与顶层求值无误 ② 入口可开 ③ 择地→开局→解祈愿→推进→终局 全链路不崩 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = __dirname;
const files = ['briefs.js', 'figfx.js', 'juice.js', 'game.js', 'sect.js', 'shenci.js', 'tales.js', 'wushipai.js'];
let src = '';
files.forEach(f => { src += fs.readFileSync(path.join(dir, f), 'utf8') + '\n;\n'; });
/* VM 内无 require：提前在 Node 侧读出 packageTales 导航样式，注入断言 */
let __talesNavStyle = 'missing';
try {
  const _pj = JSON.parse(fs.readFileSync(path.join(dir, 'weapp', 'packageTales', 'pages', 'tales', 'tales.json'), 'utf8'));
  __talesNavStyle = _pj.navigationStyle || '';
} catch (e) { __talesNavStyle = 'missing'; }

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
/* SFX 由 juice.js 定义，此处不再打桩 */
`;

const drv = `
var LOG = [];
function T(name, fn){
  try { fn(); LOG.push('PASS  ' + name); }
  catch(e){ LOG.push('FAIL  ' + name + '  ::  ' + e.message + ' @ ' + (e.stack||'').split('\\n')[1]); }
}
var app = document.getElementById('app');

T('01 模块顶层求值完成', function(){ if(typeof renderShenci !== 'function') throw new Error('renderShenci 未定义'); });
T('02 入口 openShenci 可用', function(){ if(typeof openShenci !== 'function') throw new Error('openShenci 未定义'); });

T('03 开局 · 山线普通', function(){
  openShenci();
  if(state.phase !== 'shenci') throw new Error('phase 未切到 shenci，实为 ' + state.phase);
  scPickDomain('shan'); scPickDiff('normal'); scStart();
  var s = state.shenci;
  if(!s) throw new Error('state.shenci 为空');
  if(s.dom !== 'shan') throw new Error('dom 错');
  if(s.香客 <= 0) throw new Error('初始香客为 0');
});

T('04 渲染主界面不崩', function(){ renderShenci(app); });

T('05 解一桩祈愿不崩', function(){
  var s = state.shenci;
  if(!s.events.length) throw new Error('开局无祈愿');
  if(s.pick) throw new Error('pick 未清空，仍在择地阶段');
  var def = scEventDef(s.events[0].id);
  if(!def) throw new Error('祈愿定义缺失: ' + s.events[0].id);
  var oi = 0;
  for(var i=0;i<def.opts.length;i++){ if(scOptReqOk(s, def.opts[i]).ok){ oi = i; break; } }
  scResolveEvent(0, oi);
});

T('06 主动动作 · 巡视/养地脉/请天劫', function(){
  var s = state.shenci;
  s.ap = 5; s.res.香火 = 999;
  scPatrol(); scNourish(); scRequestTianjie();
});

T('07 推进 48 旬不崩（自动解祈愿）', function(){
  var s = state.shenci, guard = 0;
  while(!s.over && guard++ < 400){
    var inner = 0;
    while(s.events.length && s.ap > 0 && inner++ < 20){
      var def = scEventDef(s.events[0].id);
      if(!def){ s.events.shift(); continue; }
      var oi = -1;
      for(var i=0;i<def.opts.length;i++){ if(scOptReqOk(s, def.opts[i]).ok){ oi = i; break; } }
      if(oi < 0) break;
      scResolveEvent(0, oi);
    }
    if(s.over) break;
    scAdvance();
  }
  if(!s.over) throw new Error('未走到终局，xun=' + s.xun);
});

T('08 终局渲染不崩', function(){
  var s = state.shenci;
  if(!SC_ENDINGS[s.ending]) throw new Error('未知结局: ' + s.ending);
  renderShenci(app);
});

T('09 铁律 · 狐精不可为山神', function(){
  var s = newScState('shan', 'normal'); state.shenci = s;
  var found = false;
  for(var i=0;i<SC_EVENTS.length;i++){
    var d = SC_EVENTS[i];
    for(var j=0;j<(d.opts||[]).length;j++){
      if(d.opts[j].ban){ found = true;
        var r = scOptReqOk(s, d.opts[j]);
        if(r.ok) throw new Error('ban 选项竟可通过: ' + d.id + ' / ' + d.opts[j].txt);
      }
    }
  }
  if(!found) throw new Error('未找到任何 ban 选项，铁律可能未实装');
});

T('10 水线开局与推进不崩', function(){
  openShenci(); scPickDomain('shui'); scPickDiff('hard'); scStart();
  var s = state.shenci, guard = 0;
  while(!s.over && guard++ < 400){
    var inner = 0;
    while(s.events.length && s.ap > 0 && inner++ < 20){
      var def = scEventDef(s.events[0].id);
      if(!def){ s.events.shift(); continue; }
      var oi = -1;
      for(var i=0;i<def.opts.length;i++){ if(scOptReqOk(s, def.opts[i]).ok){ oi = i; break; } }
      if(oi < 0) break;
      scResolveEvent(0, oi);
    }
    if(s.over) break;
    scAdvance();
  }
  renderShenci(app);
});

T('11 全祈愿定义可解析（id/title/opts 完整）', function(){
  var bad = [];
  for(var i=0;i<SC_EVENTS.length;i++){
    var d = SC_EVENTS[i];
    if(!d.id || !d.title || !d.opts || !d.opts.length){ bad.push(d.id||('#'+i)); continue; }
    for(var j=0;j<d.opts.length;j++){
      var o = d.opts[j];
      if(!o.txt) bad.push(d.id + '.opt' + j + ' 缺 txt');
      if(!o.eff && !o.debate && !o.ban) bad.push(d.id + '.opt' + j + ' 无 eff/debate/ban');
    }
  }
  if(bad.length) throw new Error(bad.length + ' 处问题: ' + bad.slice(0,5).join(' | '));
});

T('12 不剧透纪律 · 选项须有后果但不得外挂提示字段', function(){
  var bad = [];
  for(var i=0;i<SC_EVENTS.length;i++){
    var d = SC_EVENTS[i];
    for(var j=0;j<(d.opts||[]).length;j++){
      var o = d.opts[j];
      if(o.tags || o.note || o.gain) bad.push(d.id + '.opt' + j);
    }
  }
  if(bad.length) throw new Error('存在剧透字段: ' + bad.slice(0,6).join(' | '));
});

T('13 戏里戏外 · 详情=人物志式图铺顶+信息卡上滑（整页滚动）', function(){
  state = { phase:'codex', mode:'codex', sel:[], filter:'全部', q:'', log:[], codexTab:'tales', selTale:'yanghuan' };
  render();
  var h = app.innerHTML;
  if(h.indexOf('class="tale-full"') < 0) throw new Error('缺全屏外壳 tale-full');
  if(h.indexOf('class="tale-hero"') < 0) throw new Error('缺立绘区 tale-hero（文档流铺顶）');
  if(h.indexOf('class="tale-full-bg"') < 0) throw new Error('缺配图 tale-full-bg');
  if(h.indexOf('class="tale-full-sheet"') < 0) throw new Error('缺信息卡 tale-full-sheet');
  if(h.indexOf('class="tale-full-head"') < 0) throw new Error('缺压图标题区 tale-full-head');
  if(h.indexOf('showTale(null)') < 0) throw new Error('缺关闭入口');
  if(h.indexOf('class="cx-quote"') < 0) throw new Error('缺引句');
  if(h.indexOf('class="tale-scroll"') >= 0) throw new Error('仍残留旧画卷弹框 tale-scroll');
  if(h.indexOf('tale-full-brand') >= 0) throw new Error('详情仍带顶栏题字 tale-full-brand');
  /* 整页滚动 + 卡片负 margin：CSS 侧对齐人物志 .cx-sheet 思路 */
  if(cssText.indexOf('.tale-hero') < 0) throw new Error('缺 .tale-hero 样式');
  if(cssText.indexOf('.tale-full-sheet') < 0) throw new Error('缺 .tale-full-sheet 样式');
  if(!/margin\s*:\s*-/.test(cssText.split('.tale-full-sheet')[1] || '')) throw new Error('信息卡应为负 margin 压住立绘底部');
  if(cssText.indexOf('overflow-y:auto') < 0) throw new Error('详情容器应整页 overflow-y:auto 可滚');
  if(typeof __talesNavStyle === 'undefined' || __talesNavStyle !== 'custom') throw new Error('tales.json 应为 navigationStyle:custom，实际 ' + __talesNavStyle);
  if(typeof TALES === 'undefined' || TALES.length < 9) throw new Error('TALES 数量异常: ' + (TALES?TALES.length:'undefined'));
});


T('14 戏里戏外 · 全部故事均可开卷不崩', function(){
  state.codexTab = 'tales';
  for(var i=0;i<TALES.length;i++){
    state.selTale = TALES[i].id; render();
    if(app.innerHTML.indexOf('tale-full') < 0) throw new Error('故事无法开卷: ' + TALES[i].id);
    if(app.innerHTML.indexOf('tale-full-sheet') < 0) throw new Error('开卷缺内容卡: ' + TALES[i].id);
  }
});

T('15 戏里戏外 · 收卷返回列表', function(){
  state.selTale = null; render();
  var h = app.innerHTML;
  if(h.indexOf('class="tale-full"') >= 0) throw new Error('收卷后详情未关闭');
  if(h.indexOf('cx-tale') < 0) throw new Error('收卷后未见列表卡片');
  if(h.indexOf('原著中的小故事') < 0) throw new Error('收卷后未见列表提示');
});

T('16 旬中转页 · 账本六行且逐行带图标', function(){
  openShenci(); scPickDomain('shan'); scPickDiff('normal'); scStart();
  scSettle(); renderShenci(app);
  var h = app.innerHTML;
  if(h.indexOf('本 旬 账 本') < 0) throw new Error('未见「本旬账本」分段');
  var rows = (h.match(/class="st-row /g) || []).length;
  if(rows !== 6) throw new Error('账本行数 ' + rows + ' ≠ 6');
  if(h.indexOf('功德') < 0) throw new Error('账本缺「功德」行');
  var box = (h.match(/class="st-ico">/g) || []).length;
  var fig = (h.match(/class="st-ico"><svg/g) || []).length;
  if(box !== 6 || fig !== 6) throw new Error('账本图标未齐：容器 ' + box + ' / 有图 ' + fig);
});

T('17 旬中转页 · 本旬所奏四格且逐格带图标', function(){
  var h = app.innerHTML;
  if(h.indexOf('本 旬 所 奏') < 0) throw new Error('未见「本旬所奏」分段');
  var cells = (h.match(/class="st-stat /g) || []).length;
  if(cells !== 4) throw new Error('统计格数 ' + cells + ' ≠ 4');
  var si = (h.match(/class="st-sico"><svg/g) || []).length;
  if(si !== 4) throw new Error('统计格图标未齐：' + si);
});

T('18 飘字落位 · 多枚错峰不重叠', function(){
  // 取 8 枚（远超单次结算实际枚数），逐一算落位；任意两枚须横向拉开 ≥100 或纵向拉开 ≥60
  var pts = [];
  for(var i=0;i<8;i++) pts.push(scFloatSlot(i));
  for(var a=0;a<pts.length;a++){
    for(var b=a+1;b<pts.length;b++){
      var ddx = Math.abs(pts[a].dx - pts[b].dx);
      var ddy = Math.abs(pts[a].dy - pts[b].dy);
      if(ddx < 100 && ddy < 60){
        throw new Error('第 ' + a + '、' + b + ' 枚会重叠：Δdx=' + ddx.toFixed(1) + ' Δdy=' + ddy.toFixed(1));
      }
    }
  }
  if(Math.abs(pts[0].dx) < 40 || Math.abs(pts[1].dx) < 40) throw new Error('首两枚未向两侧分开');
  if(pts[0].dx * pts[1].dx > 0) throw new Error('首两枚未分列左右');
});

T('19 无事牌 · 顶部栏已撤 + 80 张 + 模糊立绘 + 底部纹路 + 无原著标签 + 已见计数已撤', function(){
  state = { phase:'codex', mode:'codex', sel:[], filter:'全部', q:'', log:[],
            codexTab:'wsp', selTale:null, wspSeen:{}, wspBack:{} };
  render();
  var h = app.innerHTML;
  if(h.indexOf('无事牌未载入') >= 0) throw new Error('renderWushipai 未载入');
  if(h.indexOf('wsp-topbar-title') >= 0) throw new Error('仍保留已撤掉的顶部栏 wsp-topbar-title');
  if(h.indexOf('天 下 太 平') >= 0) throw new Error('仍保留"天 下 太 平"标题（用户 2026-09-03 已撤）');
  if(h.indexOf('随 手 抽 一 张') < 0) throw new Error('缺随机抽取按钮');
  if(h.indexOf('wsp-bar') < 0) throw new Error('缺操作条');
  if(h.indexOf('wsp-bar-count') >= 0) throw new Error('已见计数 wsp-bar-count 应已移除');
  if(h.indexOf('已见') >= 0) throw new Error('页面仍出现"已见"字样');
  if(h.indexOf('wsp-dt-x') >= 0) throw new Error('仍含收起按钮 wsp-dt-x（应仅点击遮罩关闭）');
  var n = (h.match(/class="wsp-card/g) || []).length;
  if(n !== 80) throw new Error('木牌数量异常：' + n + '（应为 80）');
  if(h.indexOf('wsp-art') < 0) throw new Error('无模糊立绘引用');
  if(h.indexOf('wsp-pattern') < 0) throw new Error('无立绘图块应使用底部纹路 .wsp-pattern');
  if(h.indexOf('wsp-seal') < 0) throw new Error('缺集齐朱印');
  if(/wsp-src/.test(h)) throw new Error('木牌仍带 src 标签');
  if(/wsp-again/.test(h)) throw new Error('木牌仍带"再翻"标签');
  if(/wsp-dt-src/.test(h)) throw new Error('放大层仍带 src 标签');
  /* CSS 结构性断言：翻转开合 + 斜向光影 + 竖排单列（无 CSS 多列分列） */
  if(cssText.indexOf('wspFlip') < 0) throw new Error('缺翻转开合动画 wspFlip');
  if(cssText.indexOf('writing-mode:vertical-rl') < 0) throw new Error('缺竖排牌文 writing-mode:vertical-rl（用户要竖排单列）');
  if(/\bcolumn-count\s*:/.test(cssText)) throw new Error('牌文不该用 CSS 多列分列（用户 2026-09-04 三次反馈 writing-mode 下不可靠每列没写到底，撤回用 JS 切列）');
  if(cssText.indexOf('wsp-dt-sheen') < 0) throw new Error('缺斜向光影 wsp-dt-sheen');
  if(cssText.indexOf('wspSheen') < 0) throw new Error('缺斜光影横扫动画 wspSheen');
});

T('20 画卷 · 全屏图上滑动画且无晃动/无透视劫持', function(){
  state = { phase:'codex', mode:'codex', sel:[], filter:'全部', q:'', log:[],
            codexTab:'tales', selTale: TALES[0].id };
  render();
  var h = app.innerHTML;
  if(h.indexOf('class="tale-full"') < 0) throw new Error('缺全屏详情外壳');
  if(h.indexOf('tale-full-bg') < 0) throw new Error('缺全屏底图节点');
  if(h.indexOf('tale-full-sheet') < 0) throw new Error('缺底部上滑内容卡');
  if(h.indexOf('taleSway') >= 0) throw new Error('仍存在左右晃动 taleSway');
  if(h.indexOf('class="tale-scroll"') >= 0) throw new Error('仍渲染旧画卷弹框 tale-scroll');
  /* 新版式：图淡入 + 内容卡上滑；perspective/preserve-3d 会劫持 touchmove，禁用 */
  if(cssText.indexOf('@keyframes taleSheetUp') < 0) throw new Error('缺底部上滑动画 taleSheetUp');
  if(cssText.indexOf('@keyframes taleBgIn') < 0) throw new Error('缺底图淡入动画 taleBgIn');
  if(cssText.indexOf('.tale-full-sheet') < 0) throw new Error('缺 .tale-full-sheet 样式');
  if(/tale-full[^{]*\{[^}]*perspective/.test(cssText)) throw new Error('tale-full 使用了 perspective（会劫持 touchmove）');
  if(/tale-full[^{]*\{[^}]*preserve-3d/.test(cssText)) throw new Error('tale-full 使用了 preserve-3d（会劫持 touchmove）');
  /* 人物志画轴柔光仍保留（另一模块） */
  if(cssText.indexOf('@keyframes briefRiverDrift') < 0) throw new Error('缺人物志画轴柔光漂移动画 briefRiverDrift');
  if(cssText.indexOf('riverFlow2') >= 0) throw new Error('仍残留已废弃的 riverFlow2 关键帧');
});

T('21 无事牌 · 点击放大详情层含模糊立绘与双面再翻', function(){
  /* 有对应人物（魏晋）→ 放大层应以模糊立绘做底 */
  wspOpen(null, 2);
  var r1 = document.getElementById('wsp-overlay');
  if(!r1 || r1.innerHTML.indexOf('wsp-dt-card') < 0) throw new Error('未弹出放大详情层');
  if(r1.innerHTML.indexOf('wsp-dt-bg') < 0) throw new Error('有对应人物却无模糊立绘做底');
  if(r1.innerHTML.indexOf('art/魏晋.png') < 0) throw new Error('模糊立绘路径错误');
  if(r1.innerHTML.indexOf('wsp-dt-glow') < 0) throw new Error('放大层缺四边光辉');
  if(r1.innerHTML.indexOf('wsp-dt-txt') < 0) throw new Error('缺放大牌文');
  /* 无对应人物（第30面 人生苦短）→ 不应渲染模糊立绘，应渲染底部纹路 */
  wspOpen(null, 30);
  var r2 = document.getElementById('wsp-overlay');
  if(r2.innerHTML.indexOf('wsp-dt-bg') >= 0) throw new Error('无对应人物却渲染了模糊立绘');
  if(r2.innerHTML.indexOf('wsp-dt-pattern') < 0) throw new Error('无对应人物却缺底部纹路做底');
  /* 双面牌（第10面 刘铁夫，含 b 面）→ 应有再翻与背面牌文 */
  wspOpen(null, 10);
  var r3 = document.getElementById('wsp-overlay');
  if(r3.innerHTML.indexOf('wsp-dt-txt2') < 0) throw new Error('双面牌缺背面牌文');
  /* 用户 2026-09-03 撤除"再翻 / 收起"按钮：点击弹框任意区域、点击遮罩、按 Esc 均可关闭 */
  if(/wsp-dt-again|wsp-dt-x/.test(r3.innerHTML)) throw new Error('放大层仍含"再翻 / 收起"按钮（用户 2026-09-03 已撤除）');
  wspClose();
});

T('22 无事牌 · 顶部栏已撤 + 2:3 竖版比例 + 随机抽打开弹层 + 入口名"无事牌"', function(){
  state = { phase:'codex', mode:'codex', sel:[], filter:'全部', q:'', log:[],
            codexTab:'wsp', selTale:null, wspSeen:{}, wspBack:{} };
  render();
  var h = app.innerHTML;
  if(h.indexOf('wsp-topbar-title') >= 0) throw new Error('顶部栏 wsp-topbar-title 不应再出现');
  if(h.indexOf('天 下 太 平') >= 0) throw new Error('"天 下 太 平"标题不应再出现');
  if(cssText.indexOf('aspect-ratio:2/3') < 0) throw new Error('CSS 缺 aspect-ratio:2/3（2:3 竖版比例）');
  if(cssText.indexOf('aspect-ratio:3/2') >= 0) throw new Error('CSS 仍有旧 3:2 横版比例（应替换为 2:3）');
  wspDraw();
  /* sandbox 中 classList 是桩，无法取实际 class；改为检查 overlay DOM 已被创建且含 wsp-dt-card */
  var after = document.getElementById('wsp-overlay');
  if(!after || after.innerHTML.indexOf('wsp-dt-card') < 0) throw new Error('wspDraw 未打开弹层');
  wspClose();
  /* 入口名：标题页"阅览"组卡片应改为"无 事 牌"（用户 2026-09-03 撤"太平无事牌"前缀）
     标题页阶段才渲染 .ts-mode 卡片；改用 phase='title' 渲染后查 app.innerHTML */
  state = { phase:'title' };
  render();
  var tHtml = app.innerHTML;
  if(tHtml.indexOf('<h3>无事牌</h3>') < 0) throw new Error('标题页入口未改名"无事牌"');
  if(tHtml.indexOf('太 平 无 事 牌') >= 0) throw new Error('标题页入口仍含"太 平 无 事 牌"前缀');
});

T('23 无事牌 · JS 按"每列固定 12 字"切列 + writing-mode 只在 col 不在 txt + 名字在文字左边 + 卡片不显文字（2026-09-04）', function(){
  /* 1. n:10 数据层必须有 w:'ningyao'（牌文是刘铁夫赠宁姚） */
  var n10 = WSP_CARDS.filter(function(c){ return c.n===10; })[0];
  if(!n10) throw new Error('n:10 缺失');
  if(n10.w !== 'ningyao') throw new Error('n:10 w 绑定错：' + n10.w + '（应为 ningyao，让宁姚立绘做底）');
  /* 1.5 wspSplit.per 必须 = 12（用户 2026-09-04 明示：固定每列 12 字） */
  var probe = wspSplit('一二三四五六七八九十十一十二十三十四十五'); // 15 字
  if(!probe.cols || probe.cols.length !== 2) throw new Error('wspSplit.per 必须是 12（15 字 → 期望 2 列），实际 '+probe.cols.length+' 列');
  if(probe.cols[0].length !== 12) throw new Error('wspSplit 首列必须 12 字，实际 '+probe.cols[0].length);
  /* 2. CSS 必须是竖排 + flex 多列（每列一个 .wsp-dt-col）+ 名字列样式；不应再有 CSS column（不可靠） */
  if(cssText.indexOf('writing-mode:vertical-rl') < 0) throw new Error('牌文缺竖排 writing-mode:vertical-rl');
  if(cssText.indexOf('text-orientation:upright') < 0) throw new Error('牌文缺 text-orientation:upright（竖排正立）');
  if(cssText.indexOf('column-count') >= 0) throw new Error('牌文不该用 CSS column-count（用户 2026-09-04 二次反馈 writing-mode 下不可靠每列没写到底）');
  if(cssText.indexOf('.wsp-dt-col') < 0) throw new Error('弹框缺牌文列样式 .wsp-dt-col（JS 切列后每列一个 .wsp-dt-col span）');
  if(!/wsp-dt-txt[^{]*\{[^}]*flex-direction:\s*row-reverse/.test(cssText)) throw new Error('.wsp-dt-txt 缺 flex row-reverse（让切出来的列从右往左排）');
  /* 字号必须 30px（用户 2026-09-04 两次反馈字太小：26→30px）；行高 1.5 × 12 字 ≈540px + 字距 ≈11px ≤ panel 552px，填满不溢出 */
  if(cssText.indexOf('font-size:30px') < 0) throw new Error('牌文缺字号 30px（用户 2026-09-04 两次反馈字太小、下面空很多）');
  /* .wsp-dt-words 规则段（切片判断，不用正则——vm 编译管道会破坏 \s 转义）：必须 justify-content:center（文字组水平居中、不贴左）、
     且必须 row（不能 row-reverse，否则名字会跑到文字右边）。 */
  var iWords = cssText.indexOf('.wsp-dt-words {');
  var wordsSeg = iWords >= 0 ? cssText.slice(iWords, iWords + 240) : '';
  if(wordsSeg.indexOf('justify-content:center') < 0) throw new Error('.wsp-dt-words 缺 justify-content:center（短牌文字组水平居中、不贴左）');
  if(wordsSeg.indexOf('flex-direction:row-reverse') >= 0) throw new Error('.wsp-dt-words 不该用 row-reverse（名字会跑到文字右边）');
  /* 关键：.wsp-dt-txt 规则段内不能写 writing-mode——否则 row-reverse 会被旋转成上下堆叠（这是第 11 轮 bug 的根）。 */
  var iTxt = cssText.indexOf('.wsp-dt-txt,');
  var txtSeg = iTxt >= 0 ? cssText.slice(iTxt, iTxt + 260) : '';
  if(txtSeg.indexOf('writing-mode') >= 0) throw new Error('.wsp-dt-txt 绝对不能写 writing-mode（row-reverse 会被旋转成上下堆叠，只在 .wsp-dt-col 上写）');
  /* .wsp-dt-col 规则段必须写 writing-mode:vertical-rl（每列内部竖排） */
  var iCol = cssText.indexOf('.wsp-dt-col {');
  var colSeg = iCol >= 0 ? cssText.slice(iCol, iCol + 140) : '';
  if(colSeg.indexOf('writing-mode:vertical-rl') < 0) throw new Error('.wsp-dt-col 必须写 writing-mode:vertical-rl（每列内部竖排）');
  if(cssText.indexOf('.wsp-dt-who') < 0) throw new Error('弹框缺"说的人"名字列样式 .wsp-dt-who');
  if(cssText.indexOf('brightness(.5)') < 0) throw new Error('有立绘做底未压暗（brightness(.5)）文字易看不清');
  if(cssText.indexOf('linear-gradient(168deg, #ecdcbe') < 0) throw new Error('弹框卡缺米色兜底 linear-gradient');
  /* 3. 打开弹层，验证 .wsp-dt-bg 用了 ningyao.png + 牌文被 JS 切多列 + 名字列显示"宁姚" */
  state = { phase:'codex', mode:'codex', sel:[], filter:'全部', q:'', log:[],
            codexTab:'wsp', selTale:null, wspSeen:{} };
  render();
  /* 多卡片页面（牌墙）不应再渲染牌文文字（用户：只在弹框展示） */
  if(app.innerHTML.indexOf('wsp-txt') >= 0) throw new Error('牌墙仍渲染牌文文字 .wsp-txt（应只在弹框展示）');
  wspDetail(10);
  var r = document.getElementById('wsp-overlay');
  if(!r) throw new Error('弹层未挂载');
  if(r.innerHTML.indexOf('wsp-dt-bg') < 0) throw new Error('弹层缺模糊立绘 wsp-dt-bg');
  if(r.innerHTML.indexOf('ningyao.png') < 0) throw new Error('弹层未引用 ningyao.png 立绘资源');
  if(r.innerHTML.indexOf('wsp-dt-txt') < 0) throw new Error('弹层缺 .wsp-dt-txt（牌文竖排容器）');
  if(r.innerHTML.indexOf('wsp-dt-who') < 0) throw new Error('弹层缺"说的人"名字列 .wsp-dt-who');
  if(r.innerHTML.indexOf('宁姚') < 0) throw new Error('名字列未显示人物名"宁姚"（n:10 的 w=ningyao）');
  /* 牌文被 JS 切多列：n:10 的 t=20 字 → 每列 12 → 应有 2 个 .wsp-dt-col（用户要"写到底再折"） */
  var colMatches = r.innerHTML.match(/wsp-dt-col/g);
  if(!colMatches || colMatches.length < 2) throw new Error('牌文 JS 切列后应有 ≥2 个 .wsp-dt-col（n:10 20 字 per=12 → 2 列），实际 '+(colMatches?colMatches.length:0));
  /* 名字列在文字列之前（DOM 顺序 [who, txt]，row 布局 → 名字在文字左边） */
  var whoAt = r.innerHTML.indexOf('wsp-dt-who');
  var txtAt = r.innerHTML.indexOf('wsp-dt-txt');
  if(whoAt < 0 || txtAt < 0) throw new Error('DOM 顺序异常');
  if(whoAt > txtAt) throw new Error('名字列应在文字列左边（DOM 中 who 必须在 txt 之前）');
  wspClose();
});

globalThis.__SMOKE = LOG;
`;

const cssText = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const ctx = vm.createContext({ console, Math, Date, JSON, parseInt, parseFloat, isNaN, String, Number, Array, Object, RegExp, Error, cssText, __talesNavStyle });
try {
  vm.runInContext(stub + '\n' + src + '\n' + drv, ctx, { timeout: 120000 });
} catch (e) {
  console.log('!! 顶层执行异常: ' + e.message);
  console.log((e.stack || '').split('\n').slice(0, 6).join('\n'));
  process.exit(1);
}
const LOG = ctx.__SMOKE || [];
LOG.forEach(l => console.log(l));
const fails = LOG.filter(l => l.indexOf('FAIL') === 0).length;
console.log('\n--- ' + (LOG.length - fails) + ' 通过 / ' + fails + ' 失败 ---');
process.exit(fails ? 1 : 0);
