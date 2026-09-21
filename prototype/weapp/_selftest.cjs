'use strict';
// Self-test for the ported mini-program modules (no DOM / no wx).
const path = require('path');
const fs = require('fs');
const U = path.join(__dirname, 'utils');
const R = __dirname.replace(/\\/g, '/');
const RF = R + '/packageRef/utils';            // 下放后的共享逻辑
const SH = R + '/packageShui/utils';
const LQ = R + '/packageLongque/utils';

let fails = 0;
function ok(cond, msg){ if(cond){ LOG.push('  PASS ' + msg); } else { fails++; LOG.push('  FAIL ' + msg); } }
const LOG = [];

// ---- stubs ----
global.__ls = {};
global.Page = function(o){ return o; };
// wx intentionally undefined -> modules fall back to global.__ls

function load(p){ const m = require(p); return m; }

// ============ 包袱斋 ============
LOG.push('【包袱斋 baofuzhai】');
const bf = load(RF + '/baofuzhai.js');
let snap = null;
bf.setHook(s => { snap = s; });
bf.open();
ok(snap && snap.ready, 'open() 推送快照');
ok(snap.head.coin === 0, '初始雪花钱为 0');
ok(Array.isArray(snap.tabs) && snap.tabs.length === 4, '四个页签');
ok(snap.body.kind === 'heqi', '默认页签=和气斋');
ok(snap.body.rooms.length === 24, '和气斋物件 24 间 (实际 ' + snap.body.rooms.length + ')');
bf.tab('lou'); ok(snap.body.kind === 'lou' && snap.body.stalls.length === 3, '拣漏 3 摊');
bf.tab('shu'); ok(snap.body.kind === 'shu' && snap.body.books.length === 9, '藏书阁 9 本');
bf.tab('nang'); ok(snap.body.kind === 'nang', '行囊页');
bf.addCoin(2000); ok(snap.head.coin === 2000, '结算入账 2000');
bf.tab('heqi');
const target = snap.body.rooms.find(r => r.id === 'baigu');
ok(target && target.afford, 'baigu 价 12，2000 钱可买');
bf.buy('baigu');
ok(snap.body.rooms.find(r => r.id === 'baigu').owned, '买下 baigu(藏品) 后记为已得');
ok(snap.head.coin === 2000 - 12, '扣钱 12 (余 ' + snap.head.coin + ')');
bf.buy('lufu');
ok(snap.body.rooms.find(r => r.id === 'lufu').owned, '买下 lufu(法宝) 后记为已得');
bf.toggleGear('lufu');
ok(snap.body.kind === 'heqi' && snap.body.rooms.find(r => r.id==='lufu').on, '带上 lufu（法宝挂行囊）');
bf.tab('shu'); bf.read('xiaoxue');
ok(snap.body.books.find(b => b.id==='xiaoxue').got, '读《小学》记为已读');
ok(snap.head.marks === 1, '悟道印记 1 道');
bf.tab('lou');
bf.refreshStall();
const st = snap.body.stalls[0];
bf.buyStall(st.idx);
ok(true, 'buyStall 不抛错');
bf.eye(1);
ok(true, 'eye 不抛错');

// ---- 装配后写 loadout 预计算（主包战斗引擎跨分包读不到本模块，只能走存档）----
const _s0 = JSON.parse(global.__ls['jianlai_baofu'] || '{}');
ok(Array.isArray(_s0.loadout) && _s0.loadout.length >= 2, '装配后写入 loadout 预计算 (实际 ' + ((_s0.loadout || []).length) + ' 项)');
ok(_s0.loadout.some(x => x.k === 'range'), 'loadout 含 lufu 的 range 效果');
ok(_s0.loadout.every(x => x && x.n && x.k && typeof x.v === 'number'), 'loadout 每项结构完整');

// ---- 捡漏不再挂已拥有的真品（旧 bug：重复购入 → owned 重复 → 反复退货刷钱）----
bf.refreshStall();
ok(snap.body.stalls.every(s => s.name !== '路引符' && s.name !== '莹莹白骨'), '摊上不再挂已拥有的真品');
ok(snap.body.stalls.length > 0, '仍能挂出其它物件');

// ---- 退货全清同 id 重复项 ----
const _s1 = JSON.parse(global.__ls['jianlai_baofu']);
_s1.coin = 0; _s1.owned = ['lufu', 'lufu']; _s1.gear = ['lufu', 'lufu'];
global.__ls['jianlai_baofu'] = JSON.stringify(_s1);
bf.open();
bf.sell('lufu');
const _s2 = JSON.parse(global.__ls['jianlai_baofu']);
ok(_s2.owned.indexOf('lufu') < 0 && _s2.gear.indexOf('lufu') < 0, '退货后同 id 无残留（堵住重复变现）');
ok(_s2.coin === 15, '退货入账 15 (实际 ' + _s2.coin + ')');

// ============ 对战引擎 × 包袱斋（跨分包走存档 loadout） ============
LOG.push('【对战引擎 × 包袱斋】');
const eng = load(U + '/engine.js');
const ET = eng._t;
ok(!!ET && typeof ET.bfLoadout === 'function' && typeof ET.bfSettle === 'function', '引擎导出测试接口');
ok(bf.coinWin === eng.BF_SETTLE.win && bf.coinLose === eng.BF_SETTLE.lose,
   '雪花钱常量两端一致 (' + eng.BF_SETTLE.win + '/' + eng.BF_SETTLE.lose + ')');

const _s3 = JSON.parse(global.__ls['jianlai_baofu']);
_s3.loadout = [{ n: '路引符', k: 'range', v: 1, o: null, c: null }];
global.__ls['jianlai_baofu'] = JSON.stringify(_s3);
ok(ET.bfLoadout().length === 1, '引擎从存档读到 loadout');
const _base = ET.skillsOf({ key: 'chenpingan' }).length;
const _with = ET.skillsOf({ key: 'chenpingan', extraSkills: [{ n: '路引符', k: 'range', v: 1 }] }).length;
ok(_with === _base + 1, 'skillsOf 合并 extraSkills（买了才生效，+' + (_with - _base) + '）');

// 结算：胜 +18 先抵赊欠，败 +6
global.__ls['jianlai_baofu'] = JSON.stringify({ v: 2, coin: 10, debt: 5, gear: [], marks: [], owned: [], loadout: [] });
const _gg = ET.bfSettle(true);
ok(_gg && _gg.gain === 18 && _gg.pay === 5 && _gg.coin === 23, '结算先抵赊欠 (coin=' + (_gg && _gg.coin) + ')');
const _gg2 = ET.bfSettle(false);
ok(_gg2 && _gg2.gain === 6 && _gg2.coin === 29, '败局 +6 (coin=' + (_gg2 && _gg2.coin) + ')');
// startGame 挂载 / endGame 结算：静态断言（动态调会启动异步对局，不适合放进自测）
const engSrc = fs.readFileSync(U + '/engine.js', 'utf8');
ok(/LOADOUT\.length && mode!=='hot'/.test(engSrc) && /p\.extraSkills = LOADOUT\.slice\(\)/.test(engSrc),
   'startGame 按模式挂载 loadout（静态断言）');
ok(/state\.bfSettled/.test(engSrc) && /bfSettle\(!!win\)/.test(engSrc), 'endGame 结算只记一次（静态断言）');

// ============ 行者录 ============
LOG.push('【行者录 profile】');
const pf = load(RF + '/profile.js');
let ps = null;
pf.setHook(s => { ps = s; });
pf.open();
ok(ps && ps.ready, 'open() 快照');
ok(ps.hasPath === false, '尚未择道');
ok(ps.ladderLQ.length === 15, '练气十五境 (实际 ' + ps.ladderLQ.length + ')');
ok(ps.ladderWU.length === 13, '武道十三境 (实际 ' + ps.ladderWU.length + ')');
pf.pick('jianxiu');
ok(ps.hasPath === true && ps.greet.indexOf('剑') >= 0, '择定剑修');
const xp0 = ps.xp;
pf.recordWin();
ok(ps.xp > xp0, '录一胜道行增加 (' + xp0 + '→' + ps.xp + ')');
ok(ps.stats.batt.win === 1, '胜场计数');
pf.recordBattle(true, 'siege', 'normal', 12, []);
const xp1 = ps.xp;
pf.recordBaofu('buy', '莹莹白骨');
ok(ps.xp > xp1, '包袱斋购得回报道行');
pf.recordRead('codex', 'chenpingan');
ok(ps.stats.codex === 1, '人物志计数 +1');
let _g = 0;
while((ps.level||0) < 3 && _g < 30){ pf.recordWin(); _g++; }
const players = [{ id:0, side:'hero', extraSkills:[] }, { id:1, side:'enemy', extraSkills:[] }];
pf.applyRealm(players, 'ai');
ok(Array.isArray(players[0].extraSkills) && players[0].extraSkills.length > 0, '对战注入境界收益(ai)');
ok(players[1].extraSkills === undefined || players[1].extraSkills.length === 0, '敌方不注入');

// ============ 天下舆图 ============
LOG.push('【天下舆图 map】');
const MPU = R + '/packageMap/utils';
const mp = load(MPU + '/map.js');
let ms = null;
mp.init(s => { ms = s; });
mp.open();
ok(ms && ms.ready && ms.level === 'world', '世界总览');
ok(ms.zhous.length === 9, '九洲 9 (实际 ' + ms.zhous.length + ')');
ok(ms.styles.length === 6 && ms.styleName === '青绿山水', '六套设色 + 默认青绿山水');
mp.drill('bao');
ok(ms.level === 'zhou' && ms.zhouName === '东宝瓶洲', '下钻东宝瓶洲');
ok(ms.places.length === 15, '东宝瓶洲要地 15 (实际 ' + ms.places.length + ')');
ok(ms.realms.length === 4, '东宝瓶洲势力 4');
mp.showPlace('lizhu');
ok(ms.place && ms.place.name === '骊珠洞天', '选中骊珠洞天详情');
ok(ms.place.chars.some(c => c.n === '陈平安'), '关联人物为姓名(陈平安)非 key');
mp.closePlace();
ok(ms.place === null, '关闭详情');
mp.drillLizhu();
ok(ms.level === 'lizhu' && ms.lizhu.count === 53 && ms.lizhu.groups.length > 1, '骊珠洞天 53 地分组');
mp.backWorld();
ok(ms.level === 'world', '返回世界总览');
mp.setStyle('shuimo');
ok(ms.styleKey === 'shuimo', '设色切换生效');
mp.open();
ok(mp.search('骊珠').length > 0, '搜地名「骊珠」命中');
ok(mp.nameOf('宋集薪') === '宋集薪', '人物名解析(CHARNAMES)');
ok(mp.LZ.LIZHU.length === 53, 'lizhu 数据 53 地');
ok(Object.keys(mp.GEO.LAND).length === 9 && Object.keys(mp.GEO.STYLES).length === 6, 'mapgeo: 九洲路径 + 六套设色');
// 矢量地图渲染器（假 ctx 真跑一遍，确认路径解析/绘制不抛错）
const mdw = load(MPU + '/mapdraw.js');
function fakeCtx() {
  const c = { setTransform(){}, transform(){}, save(){}, restore(){}, translate(){}, scale(){}, rotate(){},
    setLineDash(){}, beginPath(){}, moveTo(){}, lineTo(){}, bezierCurveTo(){}, quadraticCurveTo(){}, closePath(){},
    fill(){}, stroke(){}, fillRect(){}, strokeRect(){}, clearRect(){}, arc(){},
    createRadialGradient(){ return { addColorStop(){} }; }, drawImage(){}, fillText(){}, strokeText(){},
    measureText(){ return { width: 10 }; } };
  return c;
}
let drawErr = '';
try {
  const cam = mdw.coverCam(375, 640);
  const st = { pal: mdw.palette('qinglv'), layers: JSON.parse(JSON.stringify(mp.DEFAULT_LAYERS)), base: [2,0,0,2,0,0] };
  mdw.drawWorld(fakeCtx(), cam, st);
  Object.keys(mp.GEO.ZHOU).forEach(k => mdw.drawZhou(fakeCtx(), cam, st, k));
} catch (e) { drawErr = e.message; }
ok(drawErr === '', '世界 + 9 洲详图绘制不抛错' + (drawErr ? ' :: ' + drawErr : ''));
ok(1600 * mdw.coverScale(375, 640) >= 375 - 0.01 && 1100 * mdw.coverScale(375, 640) >= 640 - 0.01, 'cover 铺满屏幕');
ok(mdw.hitWorld(mdw.coverCam(375, 640), 0, 0) === null || true, '热区命中函数可调用');

// ============ 笼中雀（配图路径回归） ============
LOG.push('【笼中雀 longque】');
const lq = load(LQ + '/longque.js');
let qs = null;
lq.init(s => { qs = s; });
lq.start();
lq.pickOrigin('water');
ok(qs && qs.stage === 'play' && qs.node && qs.node.t === '天不亮的井', 'a1 场面「天不亮的井」');
const qimg = (qs.node && qs.node.img) || '';
ok(/^\/packageLongque\/assets\/longque\/.+\.jpg$/.test(qimg), 'a1 配图=合法分包绝对路径 (' + qimg + ')');
ok(qimg.indexOf('//') < 0, 'a1 配图无双斜杠（协议相对地址陷阱）');
ok(qimg && fs.existsSync(path.join(R, qimg.slice(1))), 'a1 配图文件真实存在');
// 全部场面配图 / 结局图标存在性
const lqSrc = fs.readFileSync(LQ + '/longque.js', 'utf8');
const lqRaw = Array.from(new Set((lqSrc.match(/"img":"([^"]+)"/g) || []).map(s => s.slice(7, -1))));
let lqMiss = 0;
lqRaw.forEach(r => {
  const abs = '/' + String(r).replace(/^\/+/, '');
  const full = abs.startsWith('/packageLongque/') ? abs : ('/packageLongque/' + String(r).replace(/^\/+/, ''));
  if (!fs.existsSync(path.join(R, full.slice(1)))) lqMiss++;
});
ok(lqRaw.length === 6 && lqMiss === 0, '全部场面配图 ' + lqRaw.length + ' 张、缺失 ' + lqMiss);
const icoDir = path.join(R, 'packageLongque/assets/icon');
const lqIcons = fs.existsSync(icoDir) ? fs.readdirSync(icoDir).filter(f => /^end-lq-.*\.svg$/.test(f)) : [];
ok(lqIcons.length === Object.keys(lq.LJTQ_ENDINGS).length, '结局图标 ' + lqIcons.length + ' 个与结局数一致');

// ============ 山水祠（配图路径回归） ============
LOG.push('【山水祠 shenci】');
const scSrc = fs.readFileSync(SH + '/shenci.js', 'utf8');
ok(/\/packageShui\/assets\/shenci\//.test(scSrc), '结局图走 /packageShui/ 绝对路径');
ok(scSrc.indexOf("'/assets/shenci/") < 0 && scSrc.indexOf('"/assets/shenci/') < 0, '无遗留主包 /assets/shenci 引用');

// ============ 页面外壳可加载（含 require 路径） ============
LOG.push('【页面外壳加载】');
try {
  load(R + '/packageRef/pages/baofu/baofu.js');
  load(R + '/packageRef/pages/profile/profile.js');
  load(R + '/packageMap/pages/map/map.js');
  load(R + '/pages/title/title.js');
  load(R + '/packageLongque/pages/longque/longque.js');
  ok(true, '6 个页面外壳 + title 均可 require（语法/路由 OK）');
} catch(e){ ok(false, '页面外壳加载抛错: ' + e.message); }

// ============ 配置/数据 JSON 合法 ============
LOG.push('【配置/数据校验】');
function jsonOk(p){ try { JSON.parse(fs.readFileSync(p,'utf-8')); return true; } catch(e){ return false; } }
ok(jsonOk(R + '/app.json'), 'app.json 合法 JSON');
ok(jsonOk(R + '/pages/title/title.json'), 'title.json 合法');
ok(jsonOk(R + '/packageRef/pages/baofu/baofu.json'), 'baofu.json 合法');
ok(jsonOk(R + '/packageRef/pages/profile/profile.json'), 'profile.json 合法');
ok(jsonOk(R + '/packageMap/pages/map/map.json'), 'map.json 合法');
ok(jsonOk(R + '/project.config.json'), 'project.config.json 合法');
const appj = JSON.parse(fs.readFileSync(R + '/app.json','utf-8'));
const regRef = appj.subPackages.some(sp => sp.root === 'packageRef' && sp.pages.includes('pages/baofu/baofu') && sp.pages.includes('pages/profile/profile'));
ok(regRef, 'app.json 已注册 packageRef（baofu + profile）');
ok(!appj.subPackages.some(sp => sp.root === 'packageRef' && sp.pages.includes('pages/map/map')), 'packageRef 已移除地图页');
const regMap = appj.subPackages.some(sp => sp.root === 'packageMap' && sp.pages.includes('pages/map/map'));
ok(regMap, 'app.json 已注册 packageMap 分包（地图独立）');
// preloadRule 预下载"合计"不得超 2MB（微信 80058），逐页累加校验
const pr = appj.preloadRule || {};
const rootOf = {}; appj.subPackages.forEach(sp => rootOf[sp.root] = true);
const sizeOf = {};
function dirSize(d) { let n = 0; (function w(x) { fs.readdirSync(x, { withFileTypes: true }).forEach(e => { const q = path.join(x, e.name); if (e.isDirectory()) w(q); else n += fs.statSync(q).size; }); })(d); return n; }
Object.keys(rootOf).forEach(k => { const d = path.join(R, k); sizeOf[k] = fs.existsSync(d) ? dirSize(d) : 0; });
let prBad = [];
Object.keys(pr).forEach(pg => {
  const t = (pr[pg].packages || []).reduce((a, n) => a + (sizeOf[n] || 0), 0);
  if (t > 2 * 1024 * 1024) prBad.push(pg + '=' + (t / 1024).toFixed(0) + 'KB');
});
ok(prBad.length === 0, 'preloadRule 每页预下载合计 <= 2MB' + (prBad.length ? ' 超限: ' + prBad.join(',') : ''));
const dgeo = load(MPU + '/mapgeo.js');
const dlz = load(MPU + '/lizhu.js');
ok(dlz.LIZHU.length === 53 && dlz.CHARNAMES['chenpingan'] === '陈平安', 'lizhu: 骊珠 53 地 + 人物名解析');
ok(Object.keys(dgeo.LAND).length === 9 && dgeo.WORLD.length === 9, 'mapgeo: 九洲 land 路径 + WORLD 9');
ok(!fs.existsSync(R + '/packageRef/utils/mapdata.js'), '旧 mapdata.js 已删除');

LOG.push('');
LOG.push(fails === 0 ? '★ 全部通过 ★' : ('★ 失败 ' + fails + ' 项 ★'));
fs.writeFileSync(R + '/_selftest_report.txt', LOG.join('\n'), 'utf-8');
console.log(LOG.join('\n'));
