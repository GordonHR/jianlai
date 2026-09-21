'use strict';
/* 天下舆图 · 状态与查询控制器（纯逻辑，无 DOM / 无 canvas，可 Node 侧单测）
 * 绘制交由 mapdraw.js + 页面 canvas；本模块只管"现在该看哪一层、有哪些可查"。
 */
const GEO = require('./mapgeo.js');
const LZ = require('./lizhu.js');

const DEFAULT_LAYERS = { roads: true, names: true, roadLbl: true, realm: true, sea: true, wall: true };
const ZHOU_ORDER = ['zhongtu', 'bao', 'beiju', 'aiai', 'liuxia', 'jinjia', 'fuyao', 'tongye', 'posuo'];

let S = null;
let emit = function () {};

function nameOf(key) {
  if (!key) return '';
  const c = GEO.CHAR_IDX[key];
  if (c && c.n) return c.n;
  if (LZ.CHARNAMES && LZ.CHARNAMES[key]) return LZ.CHARNAMES[key];
  return key;
}
function charsOfPlace(placeKey) {
  const list = GEO.PLACE_CHARS[placeKey] || [];
  const seen = {}, out = [];
  list.forEach(function (k) {
    const n = nameOf(k);
    if (!n || seen[n]) return;
    seen[n] = 1;
    out.push({ k: k, n: n, title: (GEO.CHAR_IDX[k] && GEO.CHAR_IDX[k].r) || '' });
  });
  return out;
}
function zhouName(k) { return (GEO.ZHOU[k] && GEO.ZHOU[k].name) || ''; }
function styleLabel(k) {
  for (let i = 0; i < GEO.STYLE_LIST.length; i++) if (GEO.STYLE_LIST[i][0] === k) return GEO.STYLE_LIST[i][1];
  return '青绿山水';
}
const ZHOU_ITEMS = GEO.WORLD.map(function (c) { return { k: c.key, n: c.name, sub: c.sub }; });

function snapshot() {
  const base = {
    ready: true,
    level: S.level,
    styles: GEO.STYLE_LIST.map(function (p) { return { k: p[0], n: p[1] }; }),
    styleKey: S.styleKey,
    styleName: styleLabel(S.styleKey),
    layers: S.layers,
    place: null,
    lizhu: null,
    zhous: ZHOU_ITEMS,
    places: [],
    realms: [],
    zhouKey: S.zhouKey || '',
    zhouName: S.zhouKey ? zhouName(S.zhouKey) : '',
    zhouSub: (S.zhouKey && GEO.ZHOU[S.zhouKey] && GEO.ZHOU[S.zhouKey].sub) || '',
    crumb: '浩然天下 · 五方九洲',
    canBack: false
  };

  if (S.level === 'lizhu') {
    const groups = [];
    const idx = {};
    (LZ.LIZHU || []).forEach(function (it) {
      const tag = it.tag || '其他';
      if (!idx[tag]) { idx[tag] = { tag: tag, items: [] }; groups.push(idx[tag]); }
      idx[tag].items.push({ key: it.key, name: it.name, desc: it.desc });
    });
    base.lizhu = { groups: groups, count: (LZ.LIZHU || []).length };
    base.crumb = '骊珠洞天 · 地名考据';
    base.canBack = true;
  } else if (S.level === 'zhou') {
    base.crumb = zhouName(S.zhouKey) + ' · 洲内详图';
    base.canBack = true;
    const zd = (GEO.ZHOU[S.zhouKey] && GEO.ZHOU[S.zhouKey].detail) || {};
    base.places = (zd.places || []).map(function (p) { return { k: p.key, n: p.name, tag: p.tag || '' }; });
    base.realms = (zd.realms || []).map(function (r) { return { name: r.name, desc: r.desc || '' }; });
  }

  if (S.place) {
    if (S.level === 'lizhu') {
      const it = (LZ.LIZHU || []).filter(function (p) { return p.key === S.place; })[0];
      if (it) base.place = { key: it.key, name: it.name, tag: it.tag || '', desc: it.desc || '', chars: [] };
    } else {
      const z = GEO.ZHOU[S.zhouKey];
      const pl = z && z.detail ? (z.detail.places || []).filter(function (p) { return p.key === S.place; })[0] : null;
      if (pl) base.place = { key: pl.key, name: pl.name, tag: pl.tag || '', desc: pl.desc || '', chars: charsOfPlace(pl.key) };
    }
  }
  return base;
}
function emitView() { emit(snapshot()); }

function ensure() {
  if (!S) S = { level: 'world', zhouKey: null, place: null, styleKey: 'qinglv', layers: Object.assign({}, DEFAULT_LAYERS) };
}

function init(fn) { emit = fn || function () {}; ensure(); }
function open() {
  ensure();
  S.level = 'world'; S.zhouKey = null; S.place = null;
  emitView();
  return S;
}
function restart() { return open(); }
function drill(key) {
  ensure();
  if (!GEO.ZHOU[key]) return;
  S.level = 'zhou'; S.zhouKey = key; S.place = null;
  emitView();
}
function drillLizhu() { ensure(); S.level = 'lizhu'; S.place = null; emitView(); }
function backWorld() { ensure(); S.level = 'world'; S.zhouKey = null; S.place = null; emitView(); }
function showPlace(key) {
  ensure();
  if (!key) return;
  S.place = key;
  emitView();
}
function closePlace() { ensure(); S.place = null; emitView(); }
function showLizhu(key) { ensure(); if (!key) return; S.place = key; emitView(); }
function setStyle(k) {
  ensure();
  if (GEO.STYLES[k]) { S.styleKey = k; emitView(); }
}
function toggleLayer(name) {
  ensure();
  if (Object.prototype.hasOwnProperty.call(S.layers, name)) {
    S.layers[name] = !S.layers[name];
    emitView();
  }
}
function currentStyle() { ensure(); return GEO.STYLES[S.styleKey]; }
function layers() { ensure(); return S.layers; }
function state() { ensure(); return S; }
function zhouOf(k) { return GEO.ZHOU[k] || null; }
function placeOf(zhouKey, placeKey) {
  const z = GEO.ZHOU[zhouKey];
  if (!z || !z.detail) return null;
  return (z.detail.places || []).filter(function (p) { return p.key === placeKey; })[0] || null;
}

/* 搜地名：洲名 + 洲内要地 + 骊珠地名 */
function search(q) {
  q = (q || '').trim();
  if (!q) return [];
  const out = [], seen = {};
  GEO.WORLD.forEach(function (c) {
    if (c.name.indexOf(q) >= 0 && !seen['z:' + c.key]) {
      seen['z:' + c.key] = 1;
      out.push({ kind: 'zhou', zhouKey: c.key, zhouName: c.name, name: c.name, sub: c.sub });
    }
  });
  ZHOU_ORDER.forEach(function (zk) {
    const z = GEO.ZHOU[zk];
    if (!z || !z.detail) return;
    (z.detail.places || []).forEach(function (p) {
      if (p.name.indexOf(q) >= 0 && !seen['p:' + zk + ':' + p.key]) {
        seen['p:' + zk + ':' + p.key] = 1;
        out.push({ kind: 'place', zhouKey: zk, zhouName: z.name, key: p.key, name: p.name, sub: p.tag || '' });
      }
    });
  });
  (LZ.LIZHU || []).forEach(function (it) {
    if (it.name.indexOf(q) >= 0 && !seen['l:' + it.key]) {
      seen['l:' + it.key] = 1;
      out.push({ kind: 'lizhu', key: it.key, name: it.name, sub: it.tag || '' });
    }
  });
  return out.slice(0, 40);
}

module.exports = {
  GEO: GEO,
  LZ: LZ,
  ZHOU_ORDER: ZHOU_ORDER,
  DEFAULT_LAYERS: DEFAULT_LAYERS,
  init: init,
  open: open,
  restart: restart,
  drill: drill,
  drillLizhu: drillLizhu,
  backWorld: backWorld,
  showPlace: showPlace,
  closePlace: closePlace,
  showLizhu: showLizhu,
  setStyle: setStyle,
  toggleLayer: toggleLayer,
  currentStyle: currentStyle,
  layers: layers,
  state: state,
  zhouOf: zhouOf,
  placeOf: placeOf,
  nameOf: nameOf,
  charsOfPlace: charsOfPlace,
  search: search
};
