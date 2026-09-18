const map = require('../../utils/map.js');
const md = require('../../utils/mapdraw.js');

const DOUBLE_MS = 260;      /* 双击判定窗口 */
const DOUBLE_PX = 30;
const TAP_MS = 240;         /* 单击延迟，避免双击时误触发下钻 */

/* 触摸坐标：小程序 canvas 触摸对象带 x/y，个别环境只给 clientX/clientY —— 两者兜底。
 * 画布铺满全屏且左上角对齐视口原点，故 clientX/Y 与画布坐标等价。 */
function px(t) { return t.x != null ? t.x : t.clientX; }
function py(t) { return t.y != null ? t.y : t.clientY; }
function dist(t) { return Math.hypot(px(t[0]) - px(t[1]), py(t[0]) - py(t[1])); }
function mid(t) { return { x: (px(t[0]) + px(t[1])) / 2, y: (py(t[0]) + py(t[1])) / 2 }; }
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

Page({
  data: {
    v: { ready: false },
    showStyle: false,
    showLayer: false,
    showSearch: false,
    q: '',
    hits: [],
    expanded: {}
  },

  onLoad() {
    map.init((snap) => {
      this.snap = snap;
      this.setData({ v: snap });
      this.redraw();
    });
    map.open();
  },

  onReady() { this.initCanvas(); },

  onUnload() {
    if (this._tapTimer) clearTimeout(this._tapTimer);
    if (this._raf && this.canvas && this.canvas.cancelAnimationFrame) {
      try { this.canvas.cancelAnimationFrame(this._raf); } catch (e) { /* noop */ }
    }
  },

  /* ---------- canvas 初始化 ---------- */
  dprOf() {
    try {
      if (wx.getWindowInfo) return wx.getWindowInfo().pixelRatio || 1;
      return wx.getSystemInfoSync().pixelRatio || 1;
    } catch (e) { return 1; }
  },
  initCanvas() {
    wx.createSelectorQuery().in(this).select('#cv').fields({ node: true, size: true }).exec((res) => {
      const r = res && res[0];
      if (!r || !r.node) return;
      const dpr = this.dprOf();
      const w = r.width, h = r.height;
      const node = r.node;
      node.width = Math.round(w * dpr);
      node.height = Math.round(h * dpr);
      this.canvas = node;
      this.ctx = node.getContext('2d');
      this.cw = w; this.ch = h; this.dpr = dpr;
      this.base = [dpr, 0, 0, dpr, 0, 0];
      /* 初始 cover：铺满屏幕（真地图观感），而非"整图适配 + 四周留边"；
       * 缩放下限放到"整图可见"，配合屏幕空间的海，缩到底也不会出现黑边。 */
      this.cam = md.coverCam(w, h);
      this.minS = md.fitScale(w, h) * 0.92;
      this.maxS = md.coverScale(w, h) * 9;
      this.redraw();
    });
  },

  /* 尺寸变化（横竖屏切换 / 窗口缩放）时自适应，保持视点中心 */
  onResize() {
    if (!this.ctx || !this.canvas) return;
    wx.createSelectorQuery().in(this).select('#cv').fields({ size: true }).exec((res) => {
      const r = res && res[0];
      if (!r || !r.width) return;
      const ocx = (this.cw / 2 - this.cam.tx) / this.cam.s;
      const ocy = (this.ch / 2 - this.cam.ty) / this.cam.s;
      this.cw = r.width; this.ch = r.height;
      this.canvas.width = Math.round(r.width * this.dpr);
      this.canvas.height = Math.round(r.height * this.dpr);
      this.minS = md.fitScale(r.width, r.height) * 0.92;
      this.maxS = md.coverScale(r.width, r.height) * 9;
      this.cam.s = Math.max(this.cam.s, this.minS);
      md.centerOn(this.cam, ocx, ocy);
      this.redraw();
    });
  },

  redraw() {
    if (!this.ctx || !this.cam) return;
    const st = { pal: map.currentStyle(), layers: map.layers(), base: this.base };
    const s = map.state();
    try {
      if (s.level === 'zhou') md.drawZhou(this.ctx, this.cam, st, s.zhouKey);
      else md.drawWorld(this.ctx, this.cam, st);
    } catch (e) {
      /* 绘制异常不阻断交互 */
    }
  },

  clampCam() {
    /* 标准地图手感：图大于视口则拖不出图外；小于视口则该轴居中 */
    md.clampToBounds(this.cam, this.cw, this.ch);
  },

  /* ---------- 手势 ---------- */
  onTS(e) {
    const t = e.touches || [];
    this.moved = false;
    this._pan = null; this._pinch = null;
    if (this._tapTimer) { clearTimeout(this._tapTimer); this._tapTimer = null; }
    if (t.length === 1) {
      this._pan = { x0: px(t[0]), y0: py(t[0]), lx: px(t[0]), ly: py(t[0]), lt: Date.now() };
      this.vx = 0; this.vy = 0;
    } else if (t.length >= 2) {
      this._pinch = { d: dist(t), m: mid(t), s0: this.cam.s, tx0: this.cam.tx, ty0: this.cam.ty };
    }
  },

  onTM(e) {
    const t = e.touches || [];
    if (this._pinch && t.length >= 2) {
      const d = dist(t), m = mid(t);
      const ns = clamp(this._pinch.s0 * (d / (this._pinch.d || 1)), this.minS, this.maxS);
      const r = ns / this._pinch.s0;
      this.cam.s = ns;
      this.cam.tx = m.x - (this._pinch.m.x - this._pinch.tx0) * r;
      this.cam.ty = m.y - (this._pinch.m.y - this._pinch.ty0) * r;
      this.moved = true;
      this.clampCam();
      this.redraw();
      return;
    }
    if (t.length === 1 && this._pan) {
      const nx = px(t[0]), ny = py(t[0]);
      const dx = nx - this._pan.lx, dy = ny - this._pan.ly;
      if (Math.abs(nx - this._pan.x0) + Math.abs(ny - this._pan.y0) > 6) this.moved = true;
      this.cam.tx += dx; this.cam.ty += dy;
      const now = Date.now(), dt = Math.max(1, now - this._pan.lt);
      this.vx = dx / dt; this.vy = dy / dt;
      this._pan.lx = nx; this._pan.ly = ny; this._pan.lt = now;
      this.clampCam();
      this.redraw();
    }
  },

  onTE(e) {
    if (this._pinch) {
      this._pinch = null;
      /* 双指中抬起一指 → 用剩余手指续接单指拖拽，避免手势"卡死" */
      const rem = e.touches || [];
      this._pan = rem.length === 1
        ? { x0: px(rem[0]), y0: py(rem[0]), lx: px(rem[0]), ly: py(rem[0]), lt: Date.now() }
        : null;
      return;
    }
    const t = (e.changedTouches && e.changedTouches[0]) || null;
    this._pan = null;
    if (this.moved) { this.inertia(); return; }
    if (!t) return;
    const x = px(t), y = py(t);
    const now = Date.now();
    const last = this.lastTap;
    if (last && now - last.t < DOUBLE_MS && Math.abs(x - last.x) < DOUBLE_PX && Math.abs(y - last.y) < DOUBLE_PX) {
      this.lastTap = null;
      this.zoomBy(1.9, x, y);
      return;
    }
    this.lastTap = { t: now, x: x, y: y };
    this._tapTimer = setTimeout(() => { this.hitAt(x, y); }, TAP_MS);
  },

  hitAt(x, y) {
    const s = map.state();
    if (s.level === 'world') {
      const h = md.hitWorld(this.cam, x, y);
      if (!h) return;
      this.lastTap = null;
      map.drill(h.key);
      this.zoomReset();
      if (h.poi) setTimeout(() => map.showPlace(h.poi), 0);
    } else if (s.level === 'zhou') {
      const pk = md.hitZhou(this.cam, s.zhouKey, x, y, 32);
      if (pk) { this.lastTap = null; map.showPlace(pk); }
    }
  },

  inertia() {
    if (!this.canvas) return;
    const decay = 0.93;
    const step = () => {
      this.vx *= decay; this.vy *= decay;
      if (Math.abs(this.vx) < 0.02 && Math.abs(this.vy) < 0.02) { this.vx = this.vy = 0; return; }
      this.cam.tx += this.vx * 16;
      this.cam.ty += this.vy * 16;
      this.clampCam();
      this.redraw();
      this._raf = this.canvas.requestAnimationFrame(step);
    };
    if (Math.abs(this.vx) > 0.06 || Math.abs(this.vy) > 0.06) {
      if (this._raf && this.canvas.cancelAnimationFrame) {
        try { this.canvas.cancelAnimationFrame(this._raf); } catch (e) { /* noop */ }
      }
      this._raf = this.canvas.requestAnimationFrame(step);
    }
  },

  /* ---------- 缩放按钮 ---------- */
  zoomBy(f, cx, cy) {
    const x = cx == null ? this.cw / 2 : cx;
    const y = cy == null ? this.ch / 2 : cy;
    const ns = clamp(this.cam.s * f, this.minS, this.maxS);
    const r = ns / this.cam.s;
    this.cam.tx = x - (x - this.cam.tx) * r;
    this.cam.ty = y - (y - this.cam.ty) * r;
    this.cam.s = ns;
    this.clampCam();
    this.redraw();
  },
  zoomIn() { this.zoomBy(1.35); },
  zoomOut() { this.zoomBy(1 / 1.35); },
  zoomReset() {
    /* 复位 = 回到铺满的初始视点；洲内数据坐标由 fitLayer 自适应到 1600×1100 */
    this.cam = md.coverCam(this.cw, this.ch);
    this.redraw();
  },

  pickPlace(e) { map.showPlace(e.currentTarget.dataset.k); },

  /* 自定义导航，返回键常驻：世界层退出页面，其余层退回上一层 */
  goBack() {
    const s = map.state();
    if (s.level === 'world') {
      wx.navigateBack({ delta: 1, fail() { wx.reLaunch({ url: '/pages/title/title' }); } });
      return;
    }
    map.backWorld();
    this.zoomReset();
  },
  closePlace() { map.closePlace(); },

  /* ---------- 顶栏面板 ---------- */
  toggleStyle() { this.setData({ showStyle: !this.data.showStyle, showLayer: false, showSearch: false }); },
  toggleLayer() { this.setData({ showLayer: !this.data.showLayer, showStyle: false, showSearch: false }); },
  toggleSearch() { this.setData({ showSearch: !this.data.showSearch, showStyle: false, showLayer: false }); },
  pickStyle(e) { map.setStyle(e.currentTarget.dataset.k); this.setData({ showStyle: false }); },
  pickLayer(e) { map.toggleLayer(e.currentTarget.dataset.n); },

  onInput(e) {
    const q = e.detail.value;
    this.setData({ q: q, hits: map.search(q) });
  },
  pickHit(e) {
    const it = this.data.hits[e.currentTarget.dataset.i];
    if (!it) return;
    this.setData({ showSearch: false, hits: [], q: '' });
    if (it.kind === 'zhou') { map.drill(it.zhouKey); this.zoomReset(); return; }
    if (it.kind === 'lizhu') {
      map.drillLizhu();
      this.setData({ expanded: { [it.key]: true } });
      return;
    }
    map.drill(it.zhouKey);
    this.zoomReset();
    setTimeout(() => map.showPlace(it.key), 0);
  },

  /* ---------- 快捷入口 ---------- */
  drillZhou(e) { map.drill(e.currentTarget.dataset.k); this.zoomReset(); },
  openLizhu() { map.drillLizhu(); },
  toggleLizhuItem(e) {
    const k = e.currentTarget.dataset.k;
    const ex = Object.assign({}, this.data.expanded);
    ex[k] = !ex[k];
    this.setData({ expanded: ex });
  },
  gotoCodex() {
    wx.navigateTo({
      url: '/packageArt/pages/codex/codex',
      fail() { wx.showToast({ title: '人物志在「剑来 · 人物志」入口', icon: 'none' }); }
    });
  },
  goHome() {
    wx.navigateBack({ delta: 1, fail() { wx.reLaunch({ url: '/pages/title/title' }); } });
  }
});
