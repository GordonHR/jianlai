'use strict';
/* 天下舆图 · canvas 矢量渲染器
 * 逻辑坐标系固定 1600×1100（与 PC 版 SVG viewBox 一致）。
 * 相机 cam = { s, tx, ty, cw, ch }：屏幕坐标 = 逻辑坐标 * s + t。
 *
 * 真地图观感要点：
 *   1) 相机会以 cover 方式铺满屏幕（不留黑边、不像"贴了一张图"）；
 *   2) 海洋底在**屏幕空间**铺满，拖到图外面也是海；
 *   3) 平移有边界钳制，图小于视口时自动居中；
 *   4) 标注层保持恒定屏幕尺寸，缩放时始终清晰。
 */
const vecpath = require('./vecpath.js');
const GEO = require('./mapgeo.js');

const VW = 1600, VH = 1100;
const FONT = 'serif';
/* 初始视点的地理焦点：中土神州（世界图中心偏南，视觉上最平衡） */
const FOCUS = [780, 520];

const CLS = {
  red: '#9c3b2e', gold: '#b5892f', green: '#4f7a3a', purple: '#6a4a7a',
  blue: '#3f6a8a', teal: '#2f8a7a', ink: '#2f2a20'
};
const SECT_TAGS = ['宗门', '洞天', '道场', '山字印', '剑庐', '洞府', '下宗', '福地宗门', '福地'];
const CAP_TAGS = ['王朝', '国都', '藩属', '首富', '飞升境', '武场', '边关', '南疆大城', '世家', '军营', '一洲首富'];

const DAO_D = 'M-32,22 L-32,-4 L-19,-22 L-6,-4 L-6,22 L6,-4 L19,-22 L32,-4 L32,22 Z';

/* PC 版靠 CSS 变量继承：仅 :root 定义 paper/ink，其余画风只覆盖配色。
 * 这里等价地做合并，缺项回落到青绿山水，避免取到 undefined。 */
const _palCache = {};
function palette(key) {
  if (_palCache[key]) return _palCache[key];
  const p = Object.assign({}, GEO.STYLES.qinglv || {}, GEO.STYLES[key] || {});
  _palCache[key] = p;
  return p;
}

/* ---------- 相机 ---------- */
/* 平移钳制：图比视口大则限制在图内；比视口小则该轴居中 */
function clampToBounds(cam, cw, ch) {
  cw = cw == null ? cam.cw : cw;
  ch = ch == null ? cam.ch : ch;
  cam.cw = cw; cam.ch = ch;
  const w = VW * cam.s, h = VH * cam.s;
  cam.tx = (w <= cw) ? (cw - w) / 2 : Math.min(0, Math.max(cw - w, cam.tx));
  cam.ty = (h <= ch) ? (ch - h) / 2 : Math.min(0, Math.max(ch - h, cam.ty));
  return cam;
}
/* cover：铺满屏幕（取 max 而非 min），这是"全屏地图"的关键 */
function coverScale(cw, ch) { return Math.max(cw / VW, ch / VH); }
/* 整图可见（缩到底）时的比例，用于允许"缩到看见整幅舆图" */
function fitScale(cw, ch) { return Math.min(cw / VW, ch / VH); }
function coverCam(cw, ch, fx, fy) {
  const s = coverScale(cw, ch);
  const cam = { s: s, tx: 0, ty: 0, cw: cw, ch: ch };
  const f = (fx == null) ? FOCUS : [fx, fy];
  cam.tx = cw / 2 - f[0] * s;
  cam.ty = ch / 2 - f[1] * s;
  return clampToBounds(cam, cw, ch);
}
/* 兼容旧名（自测与页面曾用 worldCam） */
function worldCam(cw, ch) { return coverCam(cw, ch); }
function centerOn(cam, vx, vy) {
  cam.tx = cam.cw / 2 - vx * cam.s;
  cam.ty = cam.ch / 2 - vy * cam.s;
  return clampToBounds(cam, cam.cw, cam.ch);
}

/* 洲详图：数据坐标 → 视图坐标（与 PC fitLayer 一致） */
function fitLayer(detail) {
  const d = detail || {};
  const xs = [], ys = [];
  function pushNums(str) {
    if (!str) return;
    const nums = String(str).match(/-?\d+(?:\.\d+)?/g) || [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const px = parseFloat(nums[i]), py = parseFloat(nums[i + 1]);
      if (isFinite(px) && isFinite(py)) { xs.push(px); ys.push(py); }
    }
  }
  (d.places || []).forEach(function (p) {
    xs.push(p.x, p.lx != null ? p.lx : p.x);
    ys.push(p.y, p.ly != null ? p.ly : p.y);
  });
  (d.realms || []).forEach(function (r) {
    if (r.lx != null) { xs.push(r.lx); ys.push(r.ly); }
    pushNums(r.d);
  });
  (d.mtn || []).forEach(function (m) { xs.push(m.x); ys.push(m.y); });
  (d.roads || []).forEach(function (r) { pushNums(r && typeof r === 'object' ? r.d : r); });
  (d.rivers || []).forEach(function (r) { pushNums(r && typeof r === 'object' ? r.d : r); });
  pushNums(d.territory);
  if (!xs.length) return { ox: 220, oy: 140, s: 1.35 };
  const minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
  const minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
  const bw = Math.max(60, maxX - minX), bh = Math.max(60, maxY - minY);
  const padX = 200, padY = 120, availW = VW - padX * 2, availH = VH - padY * 2;
  const sc = Math.min(availW / bw, availH / bh, 2.4);
  return {
    ox: padX + (availW - bw * sc) / 2 - minX * sc,
    oy: padY + (availH - bh * sc) / 2 - minY * sc,
    s: sc
  };
}

/* 投影器：逻辑/数据坐标 → 屏幕像素 */
function projector(cam, fit) {
  if (!fit) return function (x, y) { return [x * cam.s + cam.tx, y * cam.s + cam.ty]; };
  return function (x, y) {
    return [(x * fit.s + fit.ox) * cam.s + cam.tx, (y * fit.s + fit.oy) * cam.s + cam.ty];
  };
}

/* ---------- 基础工具 ---------- */
function resetBase(ctx, base) {
  if (!ctx.setTransform) return;
  if (base) ctx.setTransform(base[0], base[1], base[2], base[3], base[4], base[5]);
  else ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function applyCam(ctx, cam) { ctx.transform(cam.s, 0, 0, cam.s, cam.tx, cam.ty); }
function setText(ctx, size, weight, anchor) {
  ctx.font = (weight ? weight + ' ' : '') + size + 'px ' + FONT;
  ctx.textAlign = anchor || 'center';
  ctx.textBaseline = 'middle';
}
/* 单一入口：设色先于绘制，避免"先 fill 后改色"的顺序错误 */
function paint(ctx, d, opt) {
  vecpath.build(vecpath.cached(d), ctx);
  if (opt.fill) { ctx.fillStyle = opt.fill; ctx.fill(); }
  if (opt.stroke) {
    ctx.lineWidth = opt.lw || 1;
    ctx.strokeStyle = opt.stroke;
    ctx.lineJoin = opt.join || 'round';
    ctx.stroke();
  }
}

/* ---------- 海浪底纹（离屏缓存，按设色） ---------- */
const _seaCache = {};
function seaLayer(color) {
  if (Object.prototype.hasOwnProperty.call(_seaCache, color)) return _seaCache[color];
  let cv = null;
  try {
    if (typeof wx !== 'undefined' && wx.createOffscreenCanvas) {
      const W = 800, H = 550;                    /* 半分辨率，绘制时放大 2 倍 */
      const oc = wx.createOffscreenCanvas({ type: '2d', width: W, height: H });
      const c = oc.getContext('2d');
      c.strokeStyle = color;
      c.lineWidth = 0.5;
      c.globalAlpha = 0.55;
      for (let y = -12; y <= H + 12; y += 12) {
        for (let x = -23; x <= W + 23; x += 23) {
          c.beginPath();
          c.moveTo(x, y + 6);
          c.quadraticCurveTo(x + 5.5, y + 2, x + 11.5, y + 6);
          c.quadraticCurveTo(x + 17.5, y + 10, x + 23, y + 6);
          c.stroke();
        }
      }
      cv = oc;
    }
  } catch (e) { cv = null; }
  _seaCache[color] = cv;
  return cv;
}

/* ---------- 海洋底（屏幕空间铺满，拖出图外也是海） ---------- */
function drawOceanScreen(ctx, cam, pal) {
  const cx = VW * 0.5 * cam.s + cam.tx;
  const cy = VH * 0.46 * cam.s + cam.ty;
  const r = Math.max(cam.cw, cam.ch) * 1.6;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, pal.ocean0);
  g.addColorStop(1, pal.ocean1);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cam.cw, cam.ch);
  ctx.restore();
}
/* 海浪：在世界坐标里对"可见矩形"平铺，因此拖到哪儿都有纹样 */
function drawWaves(ctx, cam, color) {
  const vx0 = (0 - cam.tx) / cam.s, vy0 = (0 - cam.ty) / cam.s;
  const vx1 = (cam.cw - cam.tx) / cam.s, vy1 = (cam.ch - cam.ty) / cam.s;
  const sea = seaLayer(color);
  if (sea) {
    const x0 = Math.floor(vx0 / VW) * VW, y0 = Math.floor(vy0 / VH) * VH;
    const x1 = Math.ceil(vx1 / VW) * VW, y1 = Math.ceil(vy1 / VH) * VH;
    for (let x = x0; x < x1; x += VW) {
      for (let y = y0; y < y1; y += VH) ctx.drawImage(sea, x, y, VW, VH);
    }
    return;
  }
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 / cam.s;
  ctx.globalAlpha = 0.5;
  const gx0 = Math.floor(vx0 / 46) * 46, gy0 = Math.floor(vy0 / 24) * 24;
  const gx1 = Math.ceil(vx1 / 46) * 46, gy1 = Math.ceil(vy1 / 24) * 24;
  for (let y = gy0; y <= gy1; y += 24) {
    for (let x = gx0; x <= gx1; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x, y + 12);
      ctx.bezierCurveTo(x + 11, y + 4, x + 12, y + 4, x + 23, y + 12);
      ctx.bezierCurveTo(x + 34, y + 20, x + 35, y + 20, x + 46, y + 12);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ---------- 世界视图 ---------- */
function drawWorld(ctx, cam, st) {
  const pal = st.pal;
  resetBase(ctx, st.base);
  ctx.clearRect(0, 0, cam.cw, cam.ch);

  drawOceanScreen(ctx, cam, pal);

  /* ===== 几何层（随缩放） ===== */
  ctx.save();
  applyCam(ctx, cam);
  ctx.globalAlpha = 1;
  drawWaves(ctx, cam, pal.wave);

  GEO.WORLD.forEach(function (c) {
    ctx.save();
    ctx.translate(c.wx, c.wy);
    ctx.scale(c.ws, c.ws);
    paint(ctx, GEO.LAND[c.key], { fill: pal.land, stroke: pal['land-stroke'], lw: 2 / cam.s });
    ctx.restore();

    (c.wMtn || []).forEach(function (m) {
      ctx.save();
      ctx.translate(c.wx + m.x * c.ws, c.wy + m.y * c.ws);
      ctx.scale(c.ws * m.s, c.ws * m.s);
      ctx.globalAlpha = 0.55;
      paint(ctx, GEO.SYM.mtnS.d, { fill: pal['mtn-f'], stroke: pal['mtn-s'], lw: 1 / cam.s });
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  });

  if (st.layers.wall) {
    ctx.save();
    ctx.setLineDash([10 / cam.s, 7 / cam.s]);
    ctx.strokeStyle = '#9c3b2e';
    ctx.lineWidth = 3.4 / cam.s;
    ctx.globalAlpha = 0.62;
    ctx.beginPath();
    ctx.moveTo(GEO.WALL.x, GEO.WALL.y0);
    ctx.lineTo(GEO.WALL.x, GEO.WALL.y1);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(GEO.DAOXUAN.x, GEO.DAOXUAN.y);
  paint(ctx, DAO_D, { fill: '#b5892f', stroke: '#5a3e1a', lw: 1.6 / cam.s });
  ctx.beginPath();
  ctx.arc(44, -8, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#9c3b2e';
  ctx.fill();
  ctx.lineWidth = 1.2 / cam.s;
  ctx.strokeStyle = '#5a2018';
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  /* ===== 标注层（恒定屏幕尺寸） ===== */
  const P = projector(cam);
  ctx.save();

  if (st.layers.sea) {
    GEO.SEAS.forEach(function (s) {
      const p = P(s[1], s[2]);
      if (p[0] < -60 || p[1] < -40 || p[0] > cam.cw + 60 || p[1] > cam.ch + 40) return;
      ctx.save();
      ctx.globalAlpha = 0.7;
      setText(ctx, 19, '', 'center');
      ctx.fillStyle = '#7fa0a6';
      ctx.fillText(s[0], p[0], p[1]);
      ctx.restore();
    });
  }

  if (st.layers.names) {
    GEO.WORLD.forEach(function (c) {
      const p = P(c.lx, c.ly);
      if (p[0] < -120 || p[1] < -60 || p[0] > cam.cw + 120 || p[1] > cam.ch + 60) return;
      ctx.save();
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = pal.paper || '#e9dcbe';
      setText(ctx, 21, 'bold', 'center');
      ctx.strokeText(c.name, p[0], p[1]);
      ctx.fillStyle = pal.ink || '#2f2a20';
      ctx.fillText(c.name, p[0], p[1]);
      setText(ctx, 11, '', 'center');
      ctx.strokeText(c.sub, p[0], p[1] + 17);
      ctx.fillStyle = pal['land-stroke'] || '#6b5f49';
      ctx.fillText(c.sub, p[0], p[1] + 17);
      ctx.restore();
    });

    const wp = P(GEO.WALL.x - 14, (GEO.WALL.y0 + GEO.WALL.y1) / 2);
    if (wp[0] > -80 && wp[0] < cam.cw + 80) {
      ctx.save();
      ctx.translate(wp[0], wp[1]);
      ctx.rotate(Math.PI / 2);
      ctx.globalAlpha = 0.82;
      setText(ctx, 13, '', 'center');
      ctx.fillStyle = '#9c3b2e';
      ctx.fillText(GEO.WALL.label, 0, 0);
      ctx.restore();
    }

    const mp = P(GEO.MANHUANG.x, GEO.MANHUANG.y);
    if (mp[0] < cam.cw + 160) {
      ctx.save();
      ctx.globalAlpha = 0.72;
      setText(ctx, 21, 'bold', 'center');
      ctx.fillStyle = '#6b3a30';
      ctx.fillText(GEO.MANHUANG.t, mp[0], mp[1]);
      setText(ctx, 12, '', 'center');
      ctx.globalAlpha = 0.62;
      ctx.fillText(GEO.MANHUANG.s, mp[0], mp[1] + 22);
      ctx.restore();
    }

    const dp = P(GEO.DAOXUAN.x, GEO.DAOXUAN.y);
    ctx.save();
    setText(ctx, 14, 'bold', 'center');
    ctx.fillStyle = '#ffffff';
    ctx.fillText('山', dp[0] + 44 * cam.s, dp[1] - 8 * cam.s);
    setText(ctx, 14, 'bold', 'left');
    ctx.fillStyle = '#9a7b2e';
    ctx.fillText(GEO.DAOXUAN.name, dp[0] + 30 * cam.s, dp[1] - 4 * cam.s);
    ctx.restore();
  }
  ctx.restore();

  return { fit: null };
}

/* ---------- 洲详图 ---------- */
function drawZhou(ctx, cam, st, key) {
  const z = GEO.ZHOU[key];
  const pal = st.pal;
  resetBase(ctx, st.base);
  ctx.clearRect(0, 0, cam.cw, cam.ch);

  const d = (z && z.detail) || {};
  const fit = fitLayer(d);
  const P = projector(cam, fit);
  const k = cam.s * fit.s;                 /* 数据坐标 → 屏幕的总缩放 */

  drawOceanScreen(ctx, cam, pal);

  /* ===== 几何层 ===== */
  ctx.save();
  applyCam(ctx, cam);
  ctx.globalAlpha = 1;
  drawWaves(ctx, cam, pal.wave);

  ctx.save();
  ctx.translate(fit.ox, fit.oy);
  ctx.scale(fit.s, fit.s);

  paint(ctx, GEO.LAND[key], { fill: pal.land, stroke: pal['land-stroke'], lw: 2.2 / k });

  if (st.layers.realm) {
    (d.realms || []).forEach(function (r) {
      ctx.save();
      ctx.globalAlpha = 0.16;
      paint(ctx, r.d, { fill: r.fill || '#b5892f' });
      ctx.globalAlpha = 1;
      ctx.setLineDash([6 / k, 4 / k]);
      paint(ctx, r.d, { stroke: r.fill || '#b5892f', lw: 1.2 / k });
      ctx.restore();
    });
  }
  if (d.territory) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    paint(ctx, d.territory, { fill: '#b5892f' });
    ctx.restore();
  }

  (d.rivers || []).forEach(function (r) {
    const path = r && typeof r === 'object' ? r.d : r;
    ctx.save();
    ctx.globalAlpha = 0.7;
    paint(ctx, path, { stroke: pal.river, lw: 3 / k });
    ctx.restore();
  });

  (d.mtn || []).forEach(function (m) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.scale(m.s, m.s);
    paint(ctx, GEO.SYM.mtn.d, { fill: pal['mtn-f'], stroke: pal['mtn-s'], lw: 1 / k });
    ctx.save();
    ctx.globalAlpha = 0.5;
    paint(ctx, GEO.SYM.mtn.inner, { stroke: pal['mtn-in'], lw: 0.6 / k });
    ctx.restore();
    ctx.restore();
  });

  if (st.layers.roads) {
    ctx.save();
    ctx.globalAlpha = 0.88;
    ctx.lineCap = 'round';
    (d.roads || []).forEach(function (r) {
      const path = r && typeof r === 'object' ? r.d : r;
      if (path) paint(ctx, path, { stroke: '#caa86a', lw: 3.4 / k });
    });
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();

  /* ===== 标注层 ===== */
  ctx.save();
  if (st.layers.names) {
    if (st.layers.roadLbl) {
      (d.roads || []).forEach(function (r) {
        if (!r || typeof r !== 'object' || !r.name) return;
        const mm = r.d && r.d.match(/M\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/);
        if (!mm) return;
        const p = P(parseFloat(mm[1]) + 8, parseFloat(mm[2]) - 6);
        setText(ctx, 11, '', 'left');
        ctx.fillStyle = '#8a785a';
        ctx.fillText(r.name, p[0], p[1]);
      });
    }
    (d.rivers || []).forEach(function (r) {
      if (!r || typeof r !== 'object' || !r.name) return;
      const mm = r.d && r.d.match(/M\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/);
      if (!mm) return;
      const p = P(parseFloat(mm[1]) + 6, parseFloat(mm[2]) + 12);
      ctx.save();
      ctx.globalAlpha = 0.85;
      setText(ctx, 11, '', 'left');
      ctx.fillStyle = pal.river;
      ctx.fillText(r.name, p[0], p[1]);
      ctx.restore();
    });
    (d.realms || []).forEach(function (r) {
      if (r.lx == null) return;
      const p = P(r.lx, r.ly);
      ctx.save();
      setText(ctx, 15, 'bold', 'center');
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = pal.paper || '#e9dcbe';
      ctx.strokeText(r.name, p[0], p[1]);
      ctx.fillStyle = r.fill || '#6b5f49';
      ctx.fillText(r.name, p[0], p[1]);
      ctx.restore();
    });
  }

  (d.places || []).forEach(function (pl) {
    const ps = P(pl.x, pl.y);
    const ls = P(pl.lx != null ? pl.lx : pl.x, pl.ly != null ? pl.ly : pl.y);
    const isSect = SECT_TAGS.indexOf(pl.tag) >= 0;
    const isCap = CAP_TAGS.indexOf(pl.tag) >= 0;

    if (Math.abs(ls[0] - ps[0]) > 2 || Math.abs(ls[1] - ps[1]) > 2) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#6b5f49';
      ctx.beginPath();
      ctx.moveTo(ps[0], ps[1]);
      ctx.lineTo(ls[0], ls[1]);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(ps[0], ps[1]);
    if (isSect) {
      ctx.beginPath();
      ctx.moveTo(0, -8); ctx.lineTo(7, 3); ctx.lineTo(-7, 3); ctx.closePath();
      ctx.fillStyle = '#8a6aa0'; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = '#4a2a5a'; ctx.stroke();
    } else if (isCap) {
      ctx.fillStyle = '#b5892f';
      ctx.fillRect(-8, -8, 16, 16);
      ctx.lineWidth = 1.2; ctx.strokeStyle = '#5a3f12';
      ctx.strokeRect(-8, -8, 16, 16);
      ctx.fillStyle = '#f1e4c4';
      ctx.fillRect(-2.6, -2.6, 5.2, 5.2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#caa86a'; ctx.fill();
      ctx.lineWidth = 1.1; ctx.strokeStyle = '#5a4a2a'; ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 3.4, 0, Math.PI * 2);
    ctx.fillStyle = CLS[pl.cls] || '#2f2a20';
    ctx.fill();
    ctx.restore();

    if (st.layers.names) {
      ctx.save();
      ctx.lineWidth = 3.2;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = pal.paper || '#e9dcbe';
      setText(ctx, 14, 'bold', 'center');
      ctx.strokeText(pl.name, ls[0], ls[1]);
      ctx.fillStyle = pal.ink || '#2f2a20';
      ctx.fillText(pl.name, ls[0], ls[1]);
      ctx.restore();
    }
  });
  ctx.restore();

  return { fit: fit };
}

/* ---------- 命中检测 ---------- */
function hitWorld(cam, sx, sy) {
  const vx = (sx - cam.tx) / cam.s, vy = (sy - cam.ty) / cam.s;
  const dh = GEO.DAOXUAN.hit;
  if (Math.abs(vx - dh.x) <= dh.rx && Math.abs(vy - dh.y) <= dh.ry) {
    return { key: GEO.DAOXUAN.zhou, poi: 'daoxuan' };
  }
  for (let i = 0; i < GEO.WORLD.length; i++) {
    const c = GEO.WORLD[i];
    const h = c.hit || { x: c.lx, y: c.ly, rx: 80, ry: 40 };
    const dx = (vx - h.x) / h.rx, dy = (vy - h.y) / h.ry;
    if (dx * dx + dy * dy <= 1) return { key: c.key, poi: null };
  }
  return null;
}

function hitZhou(cam, key, sx, sy, radius) {
  const z = GEO.ZHOU[key];
  if (!z) return null;
  const fit = fitLayer(z.detail || {});
  const P = projector(cam, fit);
  const r = radius || 32;
  let best = null, bestD = r * r;
  (z.detail && z.detail.places || []).forEach(function (pl) {
    const p = P(pl.x, pl.y);
    const dx = p[0] - sx, dy = p[1] - sy;
    const dd = dx * dx + dy * dy;
    if (dd <= bestD) { bestD = dd; best = pl.key; }
  });
  return best;
}

module.exports = {
  VIEW: [VW, VH],
  FOCUS: FOCUS,
  CLS: CLS,
  SECT_TAGS: SECT_TAGS,
  CAP_TAGS: CAP_TAGS,
  palette: palette,
  coverScale: coverScale,
  fitScale: fitScale,
  coverCam: coverCam,
  worldCam: worldCam,
  centerOn: centerOn,
  clampToBounds: clampToBounds,
  fitLayer: fitLayer,
  projector: projector,
  paint: paint,
  drawWorld: drawWorld,
  drawZhou: drawZhou,
  hitWorld: hitWorld,
  hitZhou: hitZhou
};
