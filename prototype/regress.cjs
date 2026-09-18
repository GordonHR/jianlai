/* =========================================================================
 * regress.cjs — 剑来 一键回归入口
 * -------------------------------------------------------------------------
 * 统一编排 prototype/ 下所有常驻门禁 + weapp/_selftest.cjs，
 * 一次运行、汇总 PASS/FAIL、写 _regress_report.txt，任一失败则退出码 1。
 *
 * 用法（在 prototype/ 目录）：
 *   node regress.cjs            # 跑全部门禁
 *   node regress.cjs --list     # 仅列出将执行的门禁与状态（不运行）
 *
 * 注意：子进程复用运行本脚本的同一 node（process.execPath），
 * 因此在受管 node 下跑，子门禁也走受管 node，环境一致。
 * ========================================================================= */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const R = __dirname;
const NODE = process.execPath;

/* 门禁清单：[相对路径(相对 prototype/), 中文标签, 是否必跑]
 * 只收录磁盘上真实存在的脚本；其余（生成脚本 _lq_sync/_map_extract、调试残留 _chk_*）不在此列。 */
const GUARDS = [
  ['_sc_keys.cjs',          '卡牌键一致性',     true],
  ['_sc_smoke.cjs',         '卡牌冒烟',         true],
  ['_sc_battle.cjs',        '卡牌对战逻辑',     true],
  ['_narr_smoke.cjs',       '叙事冒烟',         true],
  ['_pf_smoke.cjs',         '经营冒烟',         true],
  ['_pf_int.cjs',           '经营集成',         true],
  ['_lq_smoke.cjs',         '笼中雀冒烟',       true],
  ['_map_verify.cjs',       '地图矢量校验',     true],
  ['_wx_size_guard.cjs',    '包体体积门禁',     true],
  ['_port_ref_guard.cjs',   '立绘引用完整性',   true],
  ['_dual_const_guard.cjs', '双端常量一致性',   true],
  ['weapp/_selftest.cjs',   '小程序自测',       true],
];

function pad(s, n) { s = String(s); return s.length >= n ? s : s + ' '.repeat(n - s.length); }
function stamp() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const listOnly = process.argv.slice(2).includes('--list');

const out = [];
const bar = '='.repeat(68);
out.push(bar);
out.push('剑来 一键回归 (regress)  @ ' + stamp());
out.push(bar);
out.push('node      : ' + NODE);
out.push('工作目录  : ' + R);
out.push('门禁数量  : ' + GUARDS.length);
out.push('');

if (listOnly) {
  GUARDS.forEach(([rel, label], i) => {
    const exists = fs.existsSync(path.join(R, rel));
    out.push(`  [${pad(i + 1, 2)}] ${pad(exists ? 'OK ' : '缺失', 4)} ${pad(rel, 24)} ${label}`);
  });
  out.push('');
  out.push('缺失项将被跳过（不计入 FAIL）。');
  const txt = out.join('\n');
  fs.writeFileSync(path.join(R, '_regress_report.txt'), txt, 'utf8');
  process.stdout.write(txt);
  process.exit(0);
}

const results = [];   // { rel, label, status, ms, tail }
let idx = 0;
const appendix = [];  // 失败项的输出尾巴

for (const [rel, label, required] of GUARDS) {
  idx++;
  const abs = path.join(R, rel);
  if (!fs.existsSync(abs)) {
    const line = `[${pad(idx, 2)}/${pad(GUARDS.length, 2)}] ${pad(rel, 24)} ${pad(label, 12)} SKIP（文件缺失）`;
    out.push(line);
    results.push({ rel, label, status: 'SKIP', ms: 0, tail: '' });
    continue;
  }
  const t0 = Date.now();
  let status = 'PASS', tail = '';
  try {
    execFileSync(NODE, [rel], { cwd: R, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    status = 'FAIL';
    const buf = [e.stdout || '', e.stderr || ''].join('\n');
    tail = buf.length > 1500 ? '\n…(截断前)\n' + buf.slice(-1500) : buf;
  }
  const ms = Date.now() - t0;
  out.push(`[${pad(idx, 2)}/${pad(GUARDS.length, 2)}] ${pad(rel, 24)} ${pad(label, 12)} ${pad(status, 4)} (${ms / 1000}s)`);
  results.push({ rel, label, status, ms, tail });
  if (status === 'FAIL') {
    appendix.push(`\n----- FAIL: ${rel} (${label}) -----\n` + (tail || '(无输出)'));
  }
}

const pass = results.filter(r => r.status === 'PASS').length;
const fail = results.filter(r => r.status === 'FAIL').length;
const skip = results.filter(r => r.status === 'SKIP').length;

out.push('-'.repeat(68));
out.push(`总计 ${GUARDS.length} 项   PASS ${pass}   FAIL ${fail}   SKIP ${skip}`);
out.push(bar);
out.push('EXIT=' + (fail ? 1 : 0));
if (appendix.length) out.push('\n' + appendix.join('\n'));

const txt = out.join('\n');
fs.writeFileSync(path.join(R, '_regress_report.txt'), txt, 'utf8');
process.stdout.write(txt);
process.exit(fail ? 1 : 0);
