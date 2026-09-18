#!/usr/bin/env node
'use strict';
/* 立绘引用完整性门禁 —— 防止"删/改立绘文件后，代码里还按名字引用"导致图片空白或破损
 *
 * 背景（2026-09-18 实战教训）：
 *   立绘路径有两个来源，只查一个必然漏——
 *     ① `weapp/utils/data.js` 的 `artUrl(key)`  → 只用 **CHARS key** 拼 `/packageArt/assets/portraits/<key>.jpg`
 *     ② `weapp/utils/sect.js` 的 `SECT_ART_SET` + `art:'名字'` 字面量、`pages/wushipai` 的 `w:'名字'` 字面量
 *        → 用**中文名/别名**，与 CHARS key 集合并**不重合**（例：CHARS key 是 `顾粲`，sect.js 却引用 `顾璨`；
 *          `miyu` 是 key，`米裕` 是别名）。
 *   我曾只按 ① 判断"死文件"，删掉 `顾璨.jpg`/`米裕.jpg` → ② 立刻变成悬空引用。本门禁即为此而设。
 *
 * 判定：**只要有任何"声明有立绘但文件不存在"的引用即失败**（退出码 1）。
 * 用法：node prototype/_port_ref_guard.cjs
 */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, 'weapp');
const PD = path.join(R, 'packageArt/assets/portraits');
const out = [], fail = [], warn = [];
function chk(cond, msg, hard) { out.push((cond ? '  PASS  ' : (hard ? '  FAIL  ' : '  WARN  ')) + msg); if (!cond) (hard ? fail : warn).push(msg); }

if (!fs.existsSync(PD)) {
  console.log('未找到立绘目录: ' + PD);
  process.exit(1);
}
const files = fs.readdirSync(PD).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
const onDisk = new Set(files.map(f => f.replace(/\.[^.]+$/, '')));

/* CHARS key 集合（顶层键） */
const dj = fs.readFileSync(path.join(R, 'utils/data.js'), 'utf8');
const lines = dj.split('\n');
let s = -1, e = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^const CHARS = \{/.test(lines[i])) s = i;
  if (s >= 0 && /^const REALM_LIMIT/.test(lines[i])) { e = i; break; }
}
const keys = [];
for (let i = s + 1; i < e; i++) {
  const m = lines[i].match(/^ {2}(?:'([^']+)'|"([^"]+)"|([A-Za-z_$][\w$]*))\s*:/);
  if (m) keys.push(m[1] || m[2] || m[3]);
}
const keySet = new Set(keys);

/* 各来源引用的名字 */
function pick(src, re) { const s2 = new Set(); let m; while ((m = re.exec(src))) s2.add(m[1]); return s2; }
const sectSrc = fs.existsSync(path.join(R, 'utils/sect.js')) ? fs.readFileSync(path.join(R, 'utils/sect.js'), 'utf8') : '';
const sectSetLine = (sectSrc.split('\n').find(l => /SECT_ART_SET\s*=/.test(l)) || '');
const sectDeclared = pick(sectSetLine, /"([^"]+)"/g);          /* SECT_ART_SET 的键 */
const sectArtLits = pick(sectSrc, /\bart\s*:\s*'([^']+)'/g);   /* art:'名字' 字面量 */
const wspSrc = fs.existsSync(path.join(R, 'packageArt/pages/wushipai/wushipai.js'))
  ? fs.readFileSync(path.join(R, 'packageArt/pages/wushipai/wushipai.js'), 'utf8') : '';
const wspLits = pick(wspSrc, /\bw\s*:\s*'([^']+)'/g);

out.push('=== 立绘引用完整性门禁 ===');
out.push('磁盘立绘 ' + files.length + ' 个；CHARS key ' + keys.length + ' 个（其中 ' +
  keys.filter(k => onDisk.has(k)).length + ' 个有立绘）');
out.push('引用来源：SECT_ART_SET ' + sectDeclared.size + ' / sect art: 字面量 ' + sectArtLits.size + ' / wushipai w: 字面量 ' + wspLits.size);
out.push('');

/* ① artUrl 路径：CHARS key 无图 = 该角色图鉴显示占位（不算悬空，只统计） */
const noArt = keys.filter(k => !onDisk.has(k));
out.push('【CHARS 角色无立绘】' + noArt.length + ' 个（图鉴/卡牌显示占位符，非破损）');
out.push('  ' + (noArt.join(', ') || '（无）'));
out.push('');

/* ② 悬空引用 = 声明有立绘 / 作为 art 字面量使用，但文件不在 */
function dangling(set, label) {
  const miss = Array.from(set).filter(n => !onDisk.has(n));
  chk(miss.length === 0, label + ' 无悬空引用' + (miss.length ? '，缺失: ' + miss.join(', ') : ''), true);
  return miss;
}
const d1 = dangling(sectDeclared, 'SECT_ART_SET（声明有立绘）');
/* art: 字面量：只有同时命中 SECT_ART_SET 才真渲染，其余走占位 → 仅警告 */
const litMiss = Array.from(sectArtLits).filter(n => !onDisk.has(n));
const litHard = litMiss.filter(n => sectDeclared.has(n));
const litSoft = litMiss.filter(n => !sectDeclared.has(n));
chk(litHard.length === 0, 'sect art: 字面量中"会真渲染却缺图"的 ' + litHard.length + ' 个' +
  (litHard.length ? '：' + litHard.join(', ') : ''), true);
if (litSoft.length) out.push('  WARN  sect art: 字面量缺图但不在 SECT_ART_SET（走占位符，非破损）: ' + litSoft.join(', '));
const d3 = dangling(wspLits, 'wushipai w:（立绘名）');

/* ③ 死重提示：磁盘上既非 CHARS key、也未被任何名字集合引用 */
const referenced = new Set([].concat(Array.from(sectDeclared), Array.from(sectArtLits), Array.from(wspLits)));
const dead = files.map(f => f.replace(/\.[^.]+$/, '')).filter(n => !keySet.has(n) && !referenced.has(n));
out.push('');
out.push('【疑似死重（既非 CHARS key 也不被硬引用）】' + dead.length + ' 个 — 仅供参考，删除前务必确认');
out.push('  ' + (dead.join(', ') || '（无）'));

out.push('');
out.push(fail.length === 0 ? '★ 立绘引用完整性通过 ★' : ('★ 未通过：' + fail.length + ' 项悬空引用 ★'));
const rep = out.join('\n');
fs.writeFileSync(path.join(__dirname, '_port_ref_report.txt'), rep, 'utf8');
console.log(rep);
process.exit(fail.length ? 1 : 0);
