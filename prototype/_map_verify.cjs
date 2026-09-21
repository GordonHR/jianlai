'use strict';
/* 天下舆图 · 常驻回归（Node 侧，假 canvas ctx 真跑绘制 + 真跑 Page 手势）
 * 用法：node prototype/_map_verify.cjs ；报告写入同目录 _map_verify_report.txt
 * 覆盖：mapgeo 数据完整性 / vecpath 解析 / 九洲与洲详图绘制 / 命中检测 /
 *       控制器状态机 / 分包与路由 / 全屏页壳 / 触摸手势与返回语义 / JS 语法
 */
/* 天下舆图 · Node 侧集中验证（假 canvas ctx 真跑绘制） */
const fs = require('fs'), path = require('path');
const R = require('path').join(__dirname, 'weapp');
const PM = R + '/packageMap';
const out = [];
let fail = 0;
function ok(c, m) { out.push((c ? '  PASS ' : '  FAIL ') + m); if (!c) fail++; }
process.on('uncaughtException', e => { out.push('UNCAUGHT: ' + (e && e.stack || e)); flush(); process.exit(0); });

/* ---------- 假 ctx ---------- */
function fakeCtx() {
  const c = {
    n: { fill: 0, stroke: 0, text: 0, arc: 0, rect: 0, path: 0, img: 0 },
    _ops: [],
    setTransform() {}, transform() {}, save() {}, restore() {},
    translate() {}, scale() {}, rotate() {}, setLineDash() {},
    beginPath() { c.n.path++; }, moveTo() {}, lineTo() {},
    bezierCurveTo() {}, quadraticCurveTo() {}, closePath() {},
    fill() { c.n.fill++; }, stroke() { c.n.stroke++; },
    fillRect() { c.n.rect++; }, strokeRect() { c.n.rect++; },
    clearRect() {},
    arc() { c.n.arc++; },
    ellipse() { c.n.arc++; },
    createRadialGradient() { return { addColorStop() {} }; },
    createPattern() { return null; },
    drawImage() { c.n.img++; },
    fillText() { c.n.text++; }, strokeText() { c.n.text++; },
    measureText() { return { width: 10 }; }
  };
  return c;
}
function flush() { fs.writeFileSync(require('path').join(__dirname, '_map_verify_report.txt'), out.join('\n'), 'utf8'); }

/* ---------- 1. 数据完整性 ---------- */
out.push('【1. mapgeo 数据】');
const GEO = require(PM + '/utils/mapgeo.js');
ok(GEO.VIEW[0] === 1600 && GEO.VIEW[1] === 1100, 'viewBox 1600×1100');
ok(Object.keys(GEO.LAND).length === 9, '九洲陆地路径 9 条 (实际 ' + Object.keys(GEO.LAND).length + ')');
ok(GEO.WORLD.length === 9, 'WORLD 9 条 (实际 ' + GEO.WORLD.length + ')');
ok(Object.keys(GEO.ZHOU).length === 9, 'ZHOU 9 条');
ok(Object.keys(GEO.STYLES).length === 6, '六套设色 (实际 ' + Object.keys(GEO.STYLES).length + ')');
ok(GEO.STYLE_LIST.length === 6, '设色清单 6 项');
const mdPre = require(PM + '/utils/mapdraw.js');
const needVars = ['land', 'land-stroke', 'ocean0', 'ocean1', 'wave', 'mtn-f', 'mtn-s', 'river', 'ink', 'paper'];
let varMiss = [];
Object.keys(GEO.STYLES).forEach(k => { const P = mdPre.palette(k); needVars.forEach(v => { if (!P[v]) varMiss.push(k + '.' + v); }); });
ok(varMiss.length === 0, '设色变量齐全' + (varMiss.length ? ' 缺: ' + varMiss.join(',') : ''));
const landMiss = GEO.WORLD.filter(c => !GEO.LAND[c.key]);
ok(landMiss.length === 0, '每条 WORLD 都有对应 land 路径');
ok(!!GEO.WALL && !!GEO.MANHUANG && !!GEO.DAOXUAN, '长城/蛮荒/倒悬山常量齐备');
ok(!!GEO.ZHOU_RELS && Object.keys(GEO.ZHOU_RELS).length === 9, '洲际关系 9 条');
ok(!!GEO.CHAR_IDX && !!GEO.PLACE_CHARS, 'CHAR_IDX/PLACE_CHARS 存在');
ok(!Object.keys(GEO.CHAR_IDX).some(k => GEO.CHAR_IDX[k].img), '已剔除跨分包立绘 img 字段');

/* ---------- 2. 路径解析 ---------- */
out.push('【2. vecpath 解析】');
const vp = require(PM + '/utils/vecpath.js');
function allPaths() {
  const arr = [];
  Object.keys(GEO.LAND).forEach(k => arr.push(['land:' + k, GEO.LAND[k]]));
  Object.keys(GEO.SYM).forEach(k => { if (GEO.SYM[k].d) arr.push(['sym:' + k, GEO.SYM[k].d]); if (GEO.SYM[k].inner) arr.push(['sym:' + k + '.inner', GEO.SYM[k].inner]); });
  Object.keys(GEO.ZHOU).forEach(zk => {
    const d = GEO.ZHOU[zk].detail || {};
    (d.realms || []).forEach((r, i) => arr.push(['realm:' + zk + i, r.d]));
    (d.roads || []).forEach((r, i) => arr.push(['road:' + zk + i, r && typeof r === 'object' ? r.d : r]));
    (d.rivers || []).forEach((r, i) => arr.push(['river:' + zk + i, r && typeof r === 'object' ? r.d : r]));
    if (d.territory) arr.push(['territory:' + zk, d.territory]);
  });
  return arr;
}
const AP = allPaths();
let bad = [];
AP.forEach(([n, d]) => {
  try { const ops = vp.parse(d); if (!ops.length) bad.push(n + ':empty'); }
  catch (e) { bad.push(n + ':' + e.message); }
});
ok(bad.length === 0, '全部 ' + AP.length + ' 条路径可解析' + (bad.length ? ' 失败: ' + bad.slice(0, 5).join(',') : ''));
ok(vp.parse('M0,0 l10,0 0,10 z').length === 4, '相对/隐式重复指令正确 (M+2L+Z=4 ops)');
ok(vp.parse('M0,0 C1,1 2,2 3,3 Z').length === 3, 'C/Z 指令正确 (M+C+Z=3 ops)');
ok(vp.parse('M0,0 L10,0 L10,10 Z').length === 4, '绝对 L 指令正确');
ok(vp.parse('M10,10 m5,5').length === 2 && vp.parse('M10,10 m5,5')[1].p[0] === 15, '相对 m 位移正确');
const zOps = vp.parse(GEO.LAND.zhongtu);
ok(zOps.filter(o => o.c === 'M').length === 4, '中土神州含 4 段子路径（本土+3 岛）(实际 ' + zOps.filter(o => o.c === 'M').length + ')');

/* ---------- 3. 绘制不抛错 ---------- */
out.push('【3. mapdraw 绘制】');
const md = require(PM + '/utils/mapdraw.js');
const cam = md.coverCam(375, 640);
const cw = 375, chh = 640;
ok(cam.s > 0, 'coverCam 计算合理 (s=' + cam.s.toFixed(3) + ')');
ok(1600 * cam.s >= cw - 0.01 && 1100 * cam.s >= chh - 0.01,
  'cover 铺满屏幕：图 ' + (1600 * cam.s).toFixed(0) + '×' + (1100 * cam.s).toFixed(0) + ' ≥ 视口 ' + cw + '×' + chh);
const c2 = md.clampToBounds({ s: cam.s, tx: 9999, ty: 9999, cw: cw, ch: chh }, cw, chh);
ok(c2.tx <= 0.01 && c2.ty <= 0.01, '平移右/下越界被钳制 (tx=' + c2.tx.toFixed(1) + ',ty=' + c2.ty.toFixed(1) + ')');
const c3 = md.clampToBounds({ s: cam.s, tx: -99999, ty: -99999, cw: cw, ch: chh }, cw, chh);
ok(c3.tx >= cw - 1600 * cam.s - 0.01 && c3.ty >= chh - 1100 * cam.s - 0.01, '平移左/上越界被钳制');
const c4 = md.clampToBounds({ s: md.fitScale(cw, chh) * 0.9, tx: 0, ty: 0, cw: cw, ch: chh }, cw, chh);
const w4 = 1600 * c4.s, h4 = 1100 * c4.s;
ok(Math.abs(c4.tx - (cw - w4) / 2) < 0.01 && Math.abs(c4.ty - (chh - h4) / 2) < 0.01,
  '缩到整图以下时自动居中');
ok(md.fitScale(cw, chh) < md.coverScale(cw, chh), 'fitScale < coverScale（可缩到看全图）');
const base = [2, 0, 0, 2, 0, 0];
let drawBad = [];
let wCount = null;
try {
  const c = fakeCtx();
  GEO.STYLE_LIST.forEach(st => {
    const ctx = fakeCtx();
    md.drawWorld(ctx, cam, { pal: md.palette(st[0]), layers: Object.assign({}, require(PM + '/utils/map.js').DEFAULT_LAYERS), base: base });
    if (!wCount) wCount = ctx.n;
  });
} catch (e) { drawBad.push('world:' + e.message); }
ok(drawBad.length === 0, '世界视图六套设色均绘制成功' + (drawBad.length ? ' ' + drawBad.join(';') : ''));
const wMtnTotal = GEO.WORLD.reduce((s, c) => s + (c.wMtn || []).length, 0);
ok(wCount && wCount.fill >= 9 + wMtnTotal + 1, '世界视图填充 = 9 陆 + ' + wMtnTotal + ' 山 + 倒悬山 (' + (wCount && wCount.fill) + ')');
ok(wCount && wCount.text >= 30, '世界视图文字标注 (海名4+洲名9×2+长城+蛮荒2+倒悬山) = ' + (wCount && wCount.text));

let zBad = [];
const zStat = {};
Object.keys(GEO.ZHOU).forEach(k => {
  try {
    const ctx = fakeCtx();
    md.drawZhou(ctx, cam, { pal: md.palette('qinglv'), layers: Object.assign({}, require(PM + '/utils/map.js').DEFAULT_LAYERS), base: base }, k);
    zStat[k] = ctx.n;
  } catch (e) { zBad.push(k + ':' + e.message); }
});
ok(zBad.length === 0, '九个洲详图均绘制成功' + (zBad.length ? ' ' + zBad.join(';') : ''));
const totalText = Object.keys(zStat).reduce((s, k) => s + zStat[k].text, 0);
ok(totalText > 0, '洲详图地名/路名/势力名绘制 (' + totalText + ' 次)');
ok(new Set(Object.keys(zStat)).size === 9, '覆盖 9 个洲');

/* ---------- 4. 命中检测 ---------- */
out.push('【4. 命中检测】');
let hitOk = 0, hitBad = [];
GEO.WORLD.forEach(c => {
  const h = c.hit;
  const sx = h.x * cam.s + cam.tx, sy = h.y * cam.s + cam.ty;
  const r = md.hitWorld(cam, sx, sy);
  if (r && r.key === c.key) hitOk++; else hitBad.push(c.key + '->' + (r && r.key));
});
ok(hitOk === 9, '九洲热区命中 9/9' + (hitBad.length ? ' 失败: ' + hitBad.join(',') : ''));
const dh = GEO.DAOXUAN.hit;
const dres = md.hitWorld(cam, dh.x * cam.s + cam.tx, dh.y * cam.s + cam.ty);
ok(dres && dres.poi === 'daoxuan', '倒悬山命中并带 poi 标记');
ok(md.hitWorld(cam, -9999, -9999) === null, '空白处不误命中');
const bd = GEO.ZHOU.bao.detail;
let zhit = 0;
const fitB = md.fitLayer(bd);
const p0 = bd.places[0];
const P = md.projector(cam, fitB);
const sp = P(p0.x, p0.y);
ok(md.hitZhou(cam, 'bao', sp[0], sp[1], 32) === p0.key, '东宝瓶洲首个要地可命中 (' + p0.name + ')');

/* ---------- 5. 控制器 ---------- */
out.push('【5. map 控制器】');
delete require.cache[require.resolve(PM + '/utils/map.js')];
const map = require(PM + '/utils/map.js');
let snap = null;
map.init(s => { snap = s; });
map.open();
ok(snap && snap.ready && snap.level === 'world', 'open() → 世界视图');
ok(snap.zhous.length === 9, '世界视图提供九洲快捷清单');
ok(snap.styles.length === 6 && snap.styleName === '青绿山水', '默认设色=青绿山水');
map.drill('bao');
ok(snap.level === 'zhou' && snap.zhouKey === 'bao', 'drill → 东宝瓶洲');
ok(snap.places.length === 15, '宝瓶洲要地 15 条 (实际 ' + snap.places.length + ')');
ok(snap.canBack === true, '洲视图可返回');
map.showPlace('lizhu');
ok(snap.place && snap.place.name === '骊珠洞天', '要地详情：' + (snap.place && snap.place.name));
ok(snap.place.chars.length > 0, '相关人物 ' + (snap.place && snap.place.chars.length) + ' 位');
map.closePlace();
ok(snap.place === null, '关闭详情');
map.toggleLayer('names');
ok(snap.layers.names === false, '图层开关生效');
map.toggleLayer('names');
map.setStyle('shuimo');
ok(snap.styleKey === 'shuimo', '设色切换生效');
map.backWorld();
ok(snap.level === 'world', '返回世界');
map.drillLizhu();
ok(snap.level === 'lizhu' && snap.lizhu && snap.lizhu.count === 53, '骊珠地名考据 53 处');
ok(snap.lizhu.groups.length > 1, '按方位分组 ' + snap.lizhu.groups.length + ' 组');
/* 骊珠矢量舆图：控制器 + 绘制 + 命中（接用户所选「小程序补骊珠矢量舆图」方向） */
map.showLizhu('dongmen');
ok(snap.level === 'lizhu' && snap.place && snap.place.key === 'dongmen', 'showLizhu → 骊珠地名详情：' + (snap.place && snap.place.name));
ok(snap.place && typeof snap.place.desc === 'string' && snap.place.desc.length > 0, '骊珠地名带考据文案 (' + (snap.place && snap.place.desc.length) + ' 字)');
map.closePlace();
ok(snap.place === null, '骊珠详情可关闭');
const LZ2 = require(PM + '/utils/lizhu.js');
ok(LZ2.LIZHU_GEO && LZ2.LIZHU_GEO.view && LZ2.LIZHU_GEO.view[0] === 1400 && LZ2.LIZHU_GEO.view[1] === 1000, '骊珠矢量视图 1400×1000');
ok(LZ2.LIZHU_GEO.places.length === 53, '骊珠矢量 POI 坐标齐全 (53)');
ok(LZ2.LIZHU.every(function (it) { return it.x != null && it.y != null; }), 'LIZHU 每条文字考据均带 x,y 坐标');
ok(!!LZ2.LIZHU_GEO.land && !!LZ2.LIZHU_GEO.rivers && !!LZ2.LIZHU_GEO.roads, '骊珠底图 陆地/河流/道路 齐备');
let dlBad = null;
try {
  const c = fakeCtx();
  md.drawLizhu(c, cam, { pal: md.palette('qinglv'), layers: Object.assign({}, require(PM + '/utils/map.js').DEFAULT_LAYERS), base: base });
} catch (e) { dlBad = e.message; }
ok(!dlBad, 'drawLizhu 绘制不抛错' + (dlBad ? ' :: ' + dlBad : ''));
const fitL = md.fitLayer(LZ2.LIZHU_GEO);
const PL = md.projector(cam, fitL);
const dongG = LZ2.LIZHU_GEO.places.filter(function (p) { return p.key === 'dongmen'; })[0];
const spL = PL(dongG.x, dongG.y);
ok(md.hitLizhu(cam, spL[0], spL[1], 30) === 'dongmen', 'hitLizhu 命中东门 (' + (dongG && dongG.name) + ')');
ok(md.hitLizhu(cam, 2, 2, 8) === null, 'hitLizhu 空白处不误命中');
map.open();
const s1 = map.search('骊珠');
ok(s1.length > 0, '搜「骊珠」命中 ' + s1.length + ' 条');
ok(s1.some(x => x.name.indexOf('骊珠') >= 0), '搜索结果含骊珠相关');
const s2 = map.search('宝瓶');
ok(s2.length > 0, '搜「宝瓶」命中 ' + s2.length + ' 条');
ok(map.search('') .length === 0, '空查询返回空');
ok(map.nameOf('宋集薪') === '宋集薪', 'CHARNAMES 兜底显示名');

/* ---------- 6. 分包/路由/体积 ---------- */
out.push('【6. 分包与路由】');
const appj = JSON.parse(fs.readFileSync(R + '/app.json', 'utf8'));
const msp = appj.subPackages.filter(x => x.root === 'packageMap')[0];
ok(!!msp && msp.pages.indexOf('pages/map/map') >= 0, 'app.json 注册 packageMap 分包');
ok(!appj.subPackages.some(x => x.root === 'packageRef' && x.pages.indexOf('pages/map/map') >= 0), 'packageRef 已移除地图页');
ok((appj.preloadRule['pages/title/title'].packages || []).indexOf('packageMap') >= 0, 'preloadRule 含 packageMap');
const tj = fs.readFileSync(R + '/pages/title/title.js', 'utf8');
ok(tj.indexOf('/packageMap/pages/map/map') >= 0 && tj.indexOf('packageRef/pages/map') < 0, 'title 入口已指向 packageMap');
[['mapgeo.js'], ['lizhu.js'], ['vecpath.js'], ['mapdraw.js'], ['map.js'], ['pages/map/map.js'], ['pages/map/map.wxml'], ['pages/map/map.wxss'], ['pages/map/map.json']].forEach(a => {
  const p = (a[0].indexOf('pages/') === 0 ? PM + '/' : PM + '/utils/') + a[0];
  ok(fs.existsSync(p), '存在 ' + a[0]);
});
let bytes = 0, files = 0;
(function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p); else { bytes += st.size; files++; }
  });
})(PM);
out.push('  packageMap 体积 = ' + (bytes / 1024).toFixed(1) + 'KB / ' + files + ' 文件（单包上限 2048KB）');
ok(bytes < 2048 * 1024, 'packageMap 未超 2MB 上限');
ok(!fs.existsSync(R + '/packageRef/pages/map'), '旧 packageRef/pages/map 已删除');
ok(!fs.existsSync(R + '/packageRef/utils/mapdata.js') && !fs.existsSync(R + '/packageRef/utils/map.js'), '旧地图模块已删除');

/* ---------- 7. 全屏页壳 ---------- */
out.push('【7. 全屏页壳】');
/* 已知坑：WXSS/CSS 里未闭合的字符串会把其后所有文本一路吞到下一个引号，
 * 表现为大片样式"凭空消失"（文件里明明有）。这里直接扫描"跨 } 的字符串"。 */
function badStrings(css) {
  const bad = []; let i = 0;
  while (i < css.length) {
    const ch = css[i];
    if (ch === '"' || ch === "'") {
      let j = i + 1, s = '';
      while (j < css.length && css[j] !== ch) { if (css[j] === '\\') j++; s += css[j]; j++; }
      if (j >= css.length) { bad.push('EOF:' + s.slice(0, 24)); break; }
      if (s.indexOf('}') >= 0) bad.push(s.slice(0, 30));
      i = j + 1;
    } else i++;
  }
  return bad;
}
const mjson = JSON.parse(fs.readFileSync(PM + '/pages/map/map.json', 'utf8'));
ok(mjson.navigationStyle === 'custom', 'map.json 自定义导航（画布可铺到状态栏）');
const wxss = fs.readFileSync(PM + '/pages/map/map.wxss', 'utf8');
ok(/\.mp\s*\{[^}]*height:100vh/.test(wxss), '.mp 满屏 100vh');
ok(/\.mp-stage\s*\{[^}]*position:absolute/.test(wxss), '画布层绝对定位铺满全屏');
ok(/\.mp-cv\s*\{[^}]*width:100%/.test(wxss), 'canvas 宽高 100%');
ok(wxss.indexOf('safe-area-inset-top') >= 0, '顶部工具条让出状态栏安全区');
ok(wxss.indexOf('safe-area-inset-bottom') >= 0, '底部快捷条让出安全区');
ok(wxss.indexOf('top:124rpx') >= 0, 'env() 不可用时工具条有兜底偏移');
const bs = badStrings(wxss);
ok(bs.length === 0, 'wxss 无跨 } 的未闭合字符串' + (bs.length ? ' :: ' + bs.join(' | ') : ''));
const wxml = fs.readFileSync(PM + '/pages/map/map.wxml', 'utf8');
ok(wxml.indexOf('mp-fade-t') >= 0, '含状态栏渐隐层');
ok(wxml.indexOf('class="mp-back" bindtap="goBack"') >= 0, '返回键常驻（自定义导航必须留出口）');
ok(wxml.indexOf('mp-back" wx:if') < 0, '返回键不再受 canBack 条件约束');
const mpjs = fs.readFileSync(PM + '/pages/map/map.js', 'utf8');
ok(mpjs.indexOf('navigateBack') >= 0, '世界层返回键退出页面');
ok(mpjs.indexOf('function px(') >= 0 && mpjs.indexOf('clientX') >= 0, '触摸坐标 x/y 与 clientX/Y 双兜底');
ok(mpjs.indexOf('t[0].x') < 0 && mpjs.indexOf('const x = t.x') < 0, '手势无裸坐标访问（全部经 px/py）');
ok(mpjs.indexOf('md.coverCam') >= 0 && mpjs.indexOf('md.fitScale') >= 0, '页面用 coverCam 初始化 + fitScale 定缩放下限');
ok(mpjs.indexOf('md.clampToBounds') >= 0, '页面用 clampToBounds 做平移钳制');

/* ---------- 8. 页面手势（真跑 Page 实例） ---------- */
out.push('【8. 手势与返回】');
let pageObj = null;
const wxCalls = { navigateBack: 0 };
global.wx = {
  getWindowInfo() { return { pixelRatio: 2 }; },
  getSystemInfoSync() { return { pixelRatio: 2 }; },
  createSelectorQuery() {
    return { in() { return this; }, select() { return this; }, fields() { return this; }, exec(cb) { cb([null]); } };
  },
  navigateBack() { wxCalls.navigateBack++; },
  reLaunch() {}, showToast() {}, navigateTo() {}
};
global.Page = function (o) { pageObj = o; };
delete require.cache[require.resolve(PM + '/pages/map/map.js')];
require(PM + '/pages/map/map.js');
ok(!!pageObj && typeof pageObj.onTS === 'function', '页面模块可加载（无顶层 ReferenceError）');
const inst = Object.assign({}, pageObj);
inst.data = JSON.parse(JSON.stringify(pageObj.data));
inst.setData = function (o) { Object.assign(inst.data, o); };
inst.cw = 375; inst.ch = 640; inst.dpr = 2;
inst.redraw = function () {};
inst.canvas = null;
/* 放大一点，使横纵两轴都有平移余量，便于精确断言 */
inst.cam = md.coverCam(375, 640);
inst.cam.s = 1.2;
md.centerOn(inst.cam, 780, 520);
inst.minS = md.fitScale(375, 640) * 0.92;
inst.maxS = md.coverScale(375, 640) * 9;

/* 关键：只给 clientX/clientY（无 x/y），也必须正常工作 */
inst.onTS({ touches: [{ clientX: 120, clientY: 260 }] });
ok(!!inst._pan && inst._pan.x0 === 120 && inst._pan.y0 === 260, '拖拽起点经 clientX/Y 兜底正确');
const t0x = inst.cam.tx, t0y = inst.cam.ty;
inst.onTM({ touches: [{ clientX: 160, clientY: 300 }] });
ok(Math.abs(inst.cam.tx - (t0x + 40)) < 1e-6 && Math.abs(inst.cam.ty - (t0y + 40)) < 1e-6,
  '拖拽平移量精确 (+40, +40)');
ok(inst.moved === true, '拖拽判定为移动（不会误触发下钻）');

inst.onTS({ touches: [{ clientX: 100, clientY: 200 }, { clientX: 200, clientY: 300 }] });
ok(!!inst._pinch && Math.abs(inst._pinch.d - Math.sqrt(20000)) < 0.01, '双指初始间距正确');
const s0 = inst.cam.s;
inst.onTM({ touches: [{ clientX: 50, clientY: 150 }, { clientX: 250, clientY: 350 }] });
ok(inst.cam.s > s0 * 1.9, '双指张开 → 放大 (' + s0.toFixed(3) + '→' + inst.cam.s.toFixed(3) + ')');
ok(inst.cam.s <= inst.maxS + 1e-9 && inst.cam.s >= inst.minS - 1e-9, '缩放受 min/max 钳制');

/* 双指抬一指 → 必须续接单指拖拽 */
inst.onTS({ touches: [{ clientX: 100, clientY: 100 }, { clientX: 300, clientY: 300 }] });
inst.onTE({ touches: [{ clientX: 300, clientY: 300 }], changedTouches: [{ clientX: 100, clientY: 100 }] });
ok(inst._pinch === null && !!inst._pan && inst._pan.x0 === 300, '双指抬一指后续接单指拖拽（不卡死）');
inst.moved = true;   /* 让最后一次抬手走惯性分支，避免留下 240ms 单击定时器 */
inst.onTE({ touches: [], changedTouches: [{ clientX: 300, clientY: 300 }] });
ok(inst._pan === null, '手指全抬起后清空拖拽态');
if (inst._tapTimer) { clearTimeout(inst._tapTimer); inst._tapTimer = null; }

/* 返回键语义（自定义导航下的唯一出口） */
map.backWorld();
wxCalls.navigateBack = 0;
inst.goBack();
ok(wxCalls.navigateBack === 1, '世界层返回键 → 退出页面');
map.drill('bao');
inst.goBack();
ok(map.state().level === 'world', '洲层返回键 → 退回世界');
map.drillLizhu();
inst.goBack();
ok(map.state().level === 'world', '骊珠层返回键 → 退回世界');
delete global.wx; delete global.Page;

/* ---------- 汇总 ---------- */
out.push('');
out.push('【JS 语法】');
const { execFileSync } = require('child_process');
['utils/mapgeo.js', 'utils/lizhu.js', 'utils/vecpath.js', 'utils/mapdraw.js', 'utils/map.js', 'pages/map/map.js'].forEach(rel => {
  try { execFileSync(process.execPath, ['--check', PM + '/' + rel]); ok(true, '语法 OK ' + rel); }
  catch (e) { ok(false, '语法错误 ' + rel + ' :: ' + String(e.message).slice(0, 120)); }
});

out.push('');
out.push(fail === 0 ? '★ 全部通过 ★' : ('★ 失败 ' + fail + ' 项 ★'));
flush();
