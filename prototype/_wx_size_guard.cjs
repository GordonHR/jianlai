#!/usr/bin/env node
'use strict';
/* 微信小程序体积门禁 —— 常驻校验，防止再次出现"单包都没超但打包被拒"
 *
 * 覆盖四条红线（微信官方口径）：
 *   1) 主包 <= 2MB
 *   2) 单个分包 <= 2MB
 *   3) preloadRule 里【同一个页面预下载的分包合计】<= 2MB   ← 最易漏，报 80058
 *   4) 全部分包合计 <= 20MB
 * 另：自动扣除 project.config.json 的 packOptions.ignore（开发文件不入包）。
 *
 * 用法：node _wx_size_guard.cjs          # 违反则退出码 1
 */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, 'weapp');
const MB = 1024 * 1024, KB = 1024;

const app = JSON.parse(fs.readFileSync(path.join(R, 'app.json'), 'utf8'));
let cfg = { packOptions: { ignore: [] } };
try { cfg = JSON.parse(fs.readFileSync(path.join(R, 'project.config.json'), 'utf8')); } catch (e) { /* 用默认 */ }
const igSuffix = ((cfg.packOptions && cfg.packOptions.ignore) || [])
  .filter(x => x.type === 'suffix').map(x => String(x.value).toLowerCase());

const roots = (app.subPackages || []).map(s => s.root);
const files = [];
(function walk(d, rel) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const p = path.join(d, e.name), r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) walk(p, r);
    else if (!igSuffix.some(s => r.toLowerCase().endsWith(s))) files.push({ rel: r, size: fs.statSync(p).size });
  });
})(R, '');

function bucketOf(rel) {
  for (const k of roots) if (rel === k || rel.indexOf(k + '/') === 0) return k;
  return '__MAIN__';
}
const sums = {}; roots.concat(['__MAIN__']).forEach(k => sums[k] = 0);
files.forEach(f => { sums[bucketOf(f.rel)] += f.size; });

const out = [], fail = [], warn = [];
function chk(cond, msg, hard) { out.push((cond ? '  PASS  ' : (hard ? '  FAIL  ' : '  WARN  ')) + msg); if (!cond) (hard ? fail : warn).push(msg); }
const kb = n => (n / KB).toFixed(1) + 'KB';

out.push('=== 微信小程序体积门禁 ===');
out.push('packOptions.ignore(后缀) = ' + (igSuffix.join(', ') || '(空)'));
out.push('');
out.push('【主包】' + kb(sums.__MAIN__) + '   余 ' + kb(2 * MB - sums.__MAIN__));
chk(sums.__MAIN__ <= 2 * MB, '主包 <= 2MB', true);
if (sums.__MAIN__ > 2 * MB * 0.9) warn.push('主包已达 ' + (sums.__MAIN__ / (2 * MB) * 100).toFixed(0) + '%，接近上限');

out.push('');
out.push('【分包】');
roots.forEach(k => {
  const pct = (sums[k] / (2 * MB) * 100).toFixed(0);
  out.push('  ' + k.padEnd(15) + kb(sums[k]).padStart(10) + '   余 ' + kb(2 * MB - sums[k]).padStart(10) + '   占限 ' + pct + '%');
  chk(sums[k] <= 2 * MB, '分包 ' + k + ' <= 2MB', true);
  if (sums[k] > 2 * MB * 0.9) warn.push(k + ' 已达 ' + pct + '%，再加大件会超限');
});

out.push('');
out.push('【preloadRule 预下载合计（同一页面）】');
const pr = app.preloadRule || {};
Object.keys(pr).forEach(page => {
  const pkgs = pr[page].packages || [];
  let t = 0, names = [];
  pkgs.forEach(n => { if (n === '__APP__') { t += sums.__MAIN__; names.push('__APP__(主包)'); } else { t += (sums[n] || 0); names.push(n); } });
  out.push('  ' + page + '  ->  ' + names.join(' + '));
  out.push('    合计 ' + kb(t) + '  余 ' + kb(2 * MB - t));
  chk(t <= 2 * MB, page + ' 预下载合计 <= 2MB（微信错误码 80058）', true);
  if (t > 2 * MB * 0.9 && t <= 2 * MB) warn.push(page + ' 预下载已达 ' + (t / (2 * MB) * 100).toFixed(0) + '%');
});

out.push('');
const total = files.reduce((a, b) => a + b.size, 0);
chk(total <= 20 * MB, '全部分包合计 <= 20MB（当前 ' + (total / MB).toFixed(2) + 'MB）', true);

if (warn.length) { out.push(''); out.push('【预警】'); warn.forEach(w => out.push('  ⚠ ' + w)); }
out.push('');
out.push(fail.length === 0 ? '★ 体积门禁通过 ★' : ('★ 体积门禁未通过：' + fail.length + ' 项 ★'));
const rep = out.join('\n');
fs.writeFileSync(path.join(__dirname, '_wx_size_report.txt'), rep, 'utf8');
console.log(rep);
process.exit(fail.length ? 1 : 0);
