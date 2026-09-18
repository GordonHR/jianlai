'use strict';
/* 极简 SVG path 解析 → canvas 重放
 * 舆图数据实际只用到 M / L / C / Z（共 6.8KB 路径），此处额外兼容 H/V/S/Q/T，
 * 以便后续加入新的矢量图无需再改本模块。
 * 相对指令（小写）与隐式重复坐标均按 SVG 规范处理。
 */

/* 每个指令的参数个数（Z 无参数，单独处理） */
const ARGC = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2 };

function tokenize(d) {
  const t = [];
  const re = /([MmLlHhVvCcSsQqTtZz])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/g;
  let m;
  while ((m = re.exec(d)) !== null) {
    if (m[1]) t.push(m[1]);
    else { const v = parseFloat(m[2]); if (!isNaN(v)) t.push(v); }
  }
  return t;
}

function parse(d) {
  const ops = [];
  if (!d) return ops;
  const t = tokenize(d);
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0;

  while (i < t.length) {
    if (typeof t[i] === 'string') { cmd = t[i++]; }
    else if (!cmd) { break; }

    const up = cmd.toUpperCase();
    const rel = cmd !== up;

    if (up === 'Z') { ops.push({ c: 'Z' }); x = sx; y = sy; px = x; py = y; cmd = ''; continue; }

    const n = ARGC[up];
    if (n === undefined) { i++; continue; }
    if (i + n > t.length) break;

    const a = t.slice(i, i + n);
    i += n;

    switch (up) {
      case 'M': {
        const nx = rel ? x + a[0] : a[0], ny = rel ? y + a[1] : a[1];
        ops.push({ c: 'M', p: [nx, ny] });
        x = sx = nx; y = sy = ny; px = x; py = y;
        cmd = rel ? 'l' : 'L';           /* 后续隐式坐标按 L 处理 */
        break;
      }
      case 'L': {
        const nx = rel ? x + a[0] : a[0], ny = rel ? y + a[1] : a[1];
        ops.push({ c: 'L', p: [nx, ny] });
        x = nx; y = ny; px = x; py = y;
        break;
      }
      case 'H': {
        const nx = rel ? x + a[0] : a[0];
        ops.push({ c: 'L', p: [nx, y] });
        x = nx; px = x; py = y;
        break;
      }
      case 'V': {
        const ny = rel ? y + a[0] : a[0];
        ops.push({ c: 'L', p: [x, ny] });
        y = ny; px = x; py = y;
        break;
      }
      case 'C': {
        let x1 = a[0], y1 = a[1], x2 = a[2], y2 = a[3], nx = a[4], ny = a[5];
        if (rel) { x1 += x; y1 += y; x2 += x; y2 += y; nx += x; ny += y; }
        ops.push({ c: 'C', p: [x1, y1, x2, y2, nx, ny] });
        px = x2; py = y2; x = nx; y = ny;
        break;
      }
      case 'S': {
        let x2 = a[0], y2 = a[1], nx = a[2], ny = a[3];
        if (rel) { x2 += x; y2 += y; nx += x; ny += y; }
        const x1 = 2 * x - px, y1 = 2 * y - py;
        ops.push({ c: 'C', p: [x1, y1, x2, y2, nx, ny] });
        px = x2; py = y2; x = nx; y = ny;
        break;
      }
      case 'Q': {
        let x1 = a[0], y1 = a[1], nx = a[2], ny = a[3];
        if (rel) { x1 += x; y1 += y; nx += x; ny += y; }
        ops.push({ c: 'Q', p: [x1, y1, nx, ny] });
        px = x1; py = y1; x = nx; y = ny;
        break;
      }
      case 'T': {
        let nx = a[0], ny = a[1];
        if (rel) { nx += x; ny += y; }
        const x1 = 2 * x - px, y1 = 2 * y - py;
        ops.push({ c: 'Q', p: [x1, y1, nx, ny] });
        px = x1; py = y1; x = nx; y = ny;
        break;
      }
      default: break;
    }
  }
  return ops;
}

/* 路径字符串 → ops，带缓存（同一路径每帧重放，必须缓存） */
const CACHE = {};
function cached(d) {
  if (!Object.prototype.hasOwnProperty.call(CACHE, d)) CACHE[d] = parse(d);
  return CACHE[d];
}

/* 把 ops 写进当前路径（调用方自己 beginPath / fill / stroke） */
function build(ops, ctx) {
  ctx.beginPath();
  for (let k = 0; k < ops.length; k++) {
    const o = ops[k], p = o.p;
    switch (o.c) {
      case 'M': ctx.moveTo(p[0], p[1]); break;
      case 'L': ctx.lineTo(p[0], p[1]); break;
      case 'C': ctx.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]); break;
      case 'Q': ctx.quadraticCurveTo(p[0], p[1], p[2], p[3]); break;
      case 'Z': ctx.closePath(); break;
      default: break;
    }
  }
  return ctx;
}

/* 独立描边/填充（内部含 beginPath） */
function fill(ops, ctx) { build(ops, ctx); ctx.fill(); }
function stroke(ops, ctx) { build(ops, ctx); ctx.stroke(); }

module.exports = { parse, cached, build, fill, stroke, tokenize, CACHE };
