#!/usr/bin/env node
'use strict';
/* 双端常量一致性门禁 —— 防止 PC 端(prototype/*) 与小程序端(weapp/*) 的关键参数静默漂移
 *
 * 背景（2026-09-18 复盘）：
 *   本项目的双端数据有两类关系，都会产生"改了一端、忘了另一端"的漂移：
 *     ① 自动生成链路：weapp/utils/data.js 由 gen_data.js 从 PC 的 game.js 抽取生成
 *        （文件头写着"自动生成，请勿手改"）。game.js 改了但没重跑 gen_data.js → 小程序静默发旧数据。
 *     ② 手工同步副本：sect.js / shenci.js / baofuzhai.js 两端各有一份，纯数据常量（阈值、数组、枚举）
 *        靠人肉同步，极易漏。
 *
 * 本门禁的做法：对每组 (PC源文件, 小程序副本, 常量名列表)，从两端各自抽取同名常量的"赋值右值"，
 *   归一化（去注释 + 折叠空白 + 去字符串外括号差异）后做字符串比对。
 *   —— 只要"两端都声明、但值不同"或"本该两端都有、却只在一端"就判失败（退出码 1）。
 *
 * 归一化细节：
 *   - 去掉 /* *\/ 与 // 注释（保留 :// 不被误删）
 *   - 折叠所有空白（含换行）为单个空格
 *   - 括号匹配用"字符串感知"扫描（跳过 ' 与 " 内部内容），避免技能文本里的符号误判
 *
 * 用法：node prototype/_dual_const_guard.cjs
 * 报告：prototype/_dual_const_report.txt
 */
const fs = require('fs'), path = require('path');
const R = __dirname;

/* 任何未捕获异常都落 UTF-8 日志，避免被 PowerShell 吞掉 */
function dumpErr(e) {
  try {
    fs.writeFileSync(path.join(__dirname, '_dual_err.txt'),
      '=== 运行异常 ===\n' + (e && e.stack ? e.stack : String(e)) + '\n', 'utf8');
  } catch (_) {}
}
process.on('uncaughtException', e => { dumpErr(e); console.error(e); process.exit(2); });

/* ---------- 配置：每组比对的两端文件 + 必须一致的常量名 ---------- */
const PAIRS = [
  {
    tag: '对局数据(自动生成) game.js → weapp/utils/data.js',
    pc: 'game.js',
    wx: 'weapp/utils/data.js',
    deep: true, // 大对象（CHARS/SKILLS）按"键排序无关"深度比对，避免键顺序误报
    // data.js 是 game.js 纯抽取，下列块应逐字一致
    consts: ['FACTIONS', 'HOSTILE', 'CHARS', 'REALM_LIMIT', 'SKILLS', 'TALENT_DESC',
             'CARD_SIG', 'CARD_KIND', 'SHOUTS', 'MODE_META', 'BG_LIST', 'ASKLAKE_QUESTIONS']
  },
  {
    tag: '落魄山 sect.js',
    pc: 'sect.js',
    wx: 'weapp/utils/sect.js',
    consts: ['SECT_REALMS', 'SECT_REALM_XIU', 'SECT_MASTER_CULT', 'SECT_DISCIPLE_STAGE_TXT',
             'SECT_SWORD_WORDS', 'SECT_NODE_ORDER', 'SECT_REL_ORDER', 'SECT_RETINUE_ORDER']
  },
  {
    tag: '山水祠 shenci.js',
    pc: 'shenci.js',
    wx: 'weapp/packageShui/utils/shenci.js',
    consts: ['SC_RANK_MAX', 'SC_ASCEND_NEED', 'SC_XK_MAX', 'SC_TOTAL_XUN',
             'SC_SEASONS', 'SC_RES_KEYS', 'SC_RES_CAP']
  },
  {
    tag: '包袱斋 baofuzhai.js',
    pc: 'baofuzhai.js',
    wx: 'weapp/packageRef/utils/baofuzhai.js',
    consts: ['BF_COIN_WIN', 'BF_COIN_LOSE', 'BF_SELL_RATE', 'BF_CREDIT_MAX', 'BF_GEAR_SLOTS',
             'BF_MARK_SLOT_MAX', 'BF_STALL_N', 'BF_EYE_BASE', 'BF_EYE_PER_BOOK', 'BF_EYE_MAX',
             'BF_EYE_ROBE', 'BF_RATE']
  },
];

/* ---------- 抽取单个常量赋值右值（字符串感知括号匹配） ---------- */
function extractConst(src, name) {
  const re = new RegExp('(?:const|let|var)\\s+' + name + '\\s*=');
  const lines = src.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) { start = i; break; }
  }
  if (start < 0) return null;

  // 从 start 行起，扫描第一个字符串外的 { [ ( 作为开括号
  let open = null, openCh = '';
  outer:
  for (let i = start; i < lines.length; i++) {
    let inS = null, esc = false;
    const text = lines[i];
    for (let j = 0; j < text.length; j++) {
      const c = text[j];
      if (inS) {
        if (esc) { esc = false; continue; }
        if (c === '\\') { esc = true; continue; }
        if (c === inS) inS = null;
        continue;
      }
      if (c === '\'' || c === '"') { inS = c; continue; }
      if (c === '{' || c === '[' || c === '(') { open = i; openCh = c; break outer; }
    }
  }

  if (!open) {
    // 标量：取 start 行中 '=' 之后的内容到行末（或到 ';'）
    const eq = lines[start].indexOf('=');
    let tail = lines[start].slice(eq + 1);
    const sc = tail.indexOf(';');
    if (sc >= 0) tail = tail.slice(0, sc);
    return tail.trim();
  }

  const closeCh = openCh === '{' ? '}' : (openCh === '[' ? ']' : ')');
  let depth = 0, ended = -1, inS = null, esc = false;
  for (let i = open; i < lines.length; i++) {
    const text = lines[i];
    for (let j = 0; j < text.length; j++) {
      const c = text[j];
      if (inS) {
        if (esc) { esc = false; continue; }
        if (c === '\\') { esc = true; continue; }
        if (c === inS) inS = null;
        continue;
      }
      if (c === '\'' || c === '"') { inS = c; continue; }
      if (c === openCh) depth++;
      else if (c === closeCh) { depth--; if (depth === 0) { ended = i; break; } }
    }
    if (ended >= 0) break;
  }
  if (ended < 0) return null; // 解析失败（容错：跳过而非中断）
  // 剥掉首行声明前缀（const X =），只留字面量本身
  let firstLine = lines[open];
  const ocIdx = firstLine.indexOf(openCh);
  if (ocIdx >= 0) firstLine = firstLine.slice(ocIdx);
  const slice = firstLine + '\n' + lines.slice(open + 1, ended + 1).join('\n');
  return slice.trim();
}

/* ---------- 归一化：去注释 + 去引号 + 折叠空白 ---------- */
function normalize(s) {
  if (s == null) return null;
  let t = s;
  t = t.replace(/\/\*[\s\S]*?\*\//g, '');          // 块注释
  t = t.replace(/(^|[^:])\/\/.*$/gm, '$1');         // 行注释（保留 ://）
  t = t.replace(/['"]/g, '');                        // 去引号（单/双）—— 让 JS 字面量 与 JSON 风格 仅比"数据"
  t = t.replace(/\s+/g, '');                         // 删除全部空白（JSON 排版空格纯属噪音）
  return t;
}

/* ---------- 深度比对（键排序无关）：把字面量 eval 成对象再规范化 ---------- */
function canonical(v) {
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  if (v && typeof v === 'object') {
    const ks = Object.keys(v).sort();
    return '{' + ks.map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}
function diffPath(a, b, path) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return path + '(类型不同)';
    if (a.length !== b.length) return path + '(数组长度 ' + a.length + '≠' + b.length + ')';
    for (let i = 0; i < a.length; i++) { const d = diffPath(a[i], b[i], path + '[' + i + ']'); if (d) return d; }
    return null;
  }
  if (a && typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    const all = Array.from(new Set(ka.concat(kb)));
    for (const k of all) {
      if (!(k in a)) return path + '.' + k + '(仅小程序端有)';
      if (!(k in b)) return path + '.' + k + '(仅PC端有)';
      const d = diffPath(a[k], b[k], path + '.' + k); if (d) return d;
    }
    return null;
  }
  if (a !== b) return path + '(' + JSON.stringify(a) + '≠' + JSON.stringify(b) + ')';
  return null;
}
function deepCompare(pcRaw, wxRaw, name) {
  const clean = s => (s || '').trim().replace(/;\s*$/, '').replace(/\/\/.*$/, '').trim();
  let po, wo;
  try { po = eval('(' + clean(pcRaw) + ')'); } catch (e) { return { ok: false, why: 'PC端解析失败:' + e.message }; }
  try { wo = eval('(' + clean(wxRaw) + ')'); } catch (e) { return { ok: false, why: '小程序端解析失败:' + e.message }; }
  const a = canonical(po), b = canonical(wo);
  if (a === b) return { ok: true };
  let why = '内容不一致；首处差异: ' + (diffPath(po, wo, name) || '未知');
  return { ok: false, why };
}

/* ---------- 比对 ---------- */
const out = [], fail = [], info = [];
function line(s) { out.push(s); }
function chk(cond, msg, hard) { out.push((cond ? '  PASS  ' : (hard ? '  FAIL  ' : '  WARN  ')) + msg); if (!cond) (hard ? fail : info).push(msg); }

line('=== 双端常量一致性门禁 ===');
line('比对时间：' + new Date().toISOString());
line('');

PAIRS.forEach(p => {
  const pcPath = path.join(R, p.pc);
  const wxPath = path.join(R, p.wx);
  line('—— ' + p.tag + ' ——');
  if (!fs.existsSync(pcPath)) { line('  [skip] PC 端文件缺失: ' + p.pc); return; }
  if (!fs.existsSync(wxPath)) { line('  [skip] 小程序文件缺失: ' + p.wx); return; }
  const pcSrc = fs.readFileSync(pcPath, 'utf8');
  const wxSrc = fs.readFileSync(wxPath, 'utf8');

  p.consts.forEach(name => {
    const pcRaw = extractConst(pcSrc, name);
    const wxRaw = extractConst(wxSrc, name);
    const pc = normalize(pcRaw), wx = normalize(wxRaw);
    if (pc == null && wx == null) { line('  [skip] ' + name + ' 两端都不存在（一致缺失）'); return; }
    if (pc == null) { chk(false, name + '：仅小程序端有（PC 端缺失）→ 疑似小程序端残留旧定义', true); return; }
    if (wx == null) { chk(false, name + '：仅 PC 端有（小程序端缺失）→ 未同步到小程序', true); return; }
    if (p.deep) {
      const r = deepCompare(pcRaw, wxRaw, name);
      if (!r.ok && r.why && r.why.indexOf('解析失败') >= 0) {
        chk(false, name + ' 深度比对失败，降级为字符串比对（' + r.why + '）', true);
        chk(pc === wx, name + ' 两端一致' + (pc === wx ? '' : '（已漂移！）'), true);
        if (pc !== wx) { out.push('      PC : ' + (pc.length > 120 ? pc.slice(0, 120) + '…' : pc)); out.push('      WX : ' + (wx.length > 120 ? wx.slice(0, 120) + '…' : wx)); }
      } else {
        chk(r.ok, name + ' 两端一致（深度比对）' + (r.ok ? '' : '（已漂移！' + (r.why || '') + '）'), true);
      }
    } else {
      chk(pc === wx, name + ' 两端一致' + (pc === wx ? '' : '（已漂移！）'), true);
      if (pc !== wx) {
        out.push('      PC : ' + (pc.length > 120 ? pc.slice(0, 120) + '…' : pc));
        out.push('      WX : ' + (wx.length > 120 ? wx.slice(0, 120) + '…' : wx));
      }
    }
  });
  line('');
});

line(fail.length === 0
  ? '★ 双端常量一致性通过 ★（共比对 ' + PAIRS.reduce((a, p) => a + p.consts.length, 0) + ' 项常量）'
  : ('★ 未通过：' + fail.length + ' 项常量漂移 ★'));
const rep = out.join('\n');
fs.writeFileSync(path.join(__dirname, '_dual_const_report.txt'), rep, 'utf8');
console.log(rep);
try { fs.unlinkSync(path.join(__dirname, '_dual_err.txt')); } catch (_) {}
process.exit(fail.length ? 1 : 0);
