/* ==========================================================================
   境界图标 · 柔和版（realm-icons.js）
   —— 复刻《剑来》原著境界体系，每个境界一枚「柔和、无尖角」的金色线描图标。
   风格纪律：统一圆形章 + 贝塞尔曲线母题，绝不使用 polygon / 直角矩形，
   一律 stroke-linejoin:round，避免尖角直线。
   依赖约定：纯字符串产出，typeof 保护由调用方负责；本文件被 game.js 与
   profile.js 同时引用，故以 var 暴露为全局。
   ========================================================================== */
(function (W) {
  'use strict';

  /* 圆形章母版：外圈柔光 + 内描金线（曲线母题） */
  function _rf (inner, opt) {
    opt = opt || {};
    var ring = opt.ring || 'rgba(232,198,106,.5)';
    var fill = opt.fill || 'rgba(232,198,106,.05)';
    return '<svg class="ric" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<circle cx="32" cy="32" r="29" fill="' + fill + '" stroke="' + ring + '" stroke-width="1.4"/>'
      + '<g fill="none" stroke="#e8cf8f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + inner + '</g></svg>';
  }

  var M = {};   /* 练气士十五境 */
  var WU = {};  /* 武道十三境 */

  /* —— 练气士 · 下五境 —— */
  M['铜皮'] = _rf(
    '<path d="M32 13 C23 13 23 51 32 51 C41 51 41 13 32 13 Z"/>'
    + '<path d="M27 22 C25 29 25 39 27 45" stroke-width="1.2" opacity=".6"/>');
  M['草根'] = _rf(
    '<path d="M32 48 C32 40 32 34 32 28"/>'
    + '<path d="M32 30 C24 28 20 22 22 16 C28 18 32 24 32 30 Z"/>'
    + '<path d="M32 30 C40 28 44 22 42 16 C36 18 32 24 32 30 Z"/>'
    + '<path d="M32 48 C29 52 27 54 26 57" stroke-width="1.4"/>'
    + '<path d="M32 48 C35 52 37 54 38 57" stroke-width="1.4"/>');
  M['柳筋'] = _rf(
    '<path d="M30 14 C35 24 29 34 34 46"/>'
    + '<ellipse cx="29" cy="22" rx="4.5" ry="2.4" transform="rotate(28 29 22)" opacity=".85"/>'
    + '<ellipse cx="33" cy="30" rx="4.5" ry="2.4" transform="rotate(38 33 30)" opacity=".85"/>'
    + '<ellipse cx="35" cy="39" rx="4.5" ry="2.4" transform="rotate(46 35 39)" opacity=".85"/>');
  M['骨气'] = _rf(
    '<path d="M22 22 C26 26 26 26 30 30 C34 34 34 34 38 38 C42 42 42 42 44 44"/>'
    + '<circle cx="21" cy="21" r="4.5"/>'
    + '<circle cx="45" cy="45" r="4.5"/>'
    + '<path d="M45 16 C41 20 47 24 43 28 C40 31 45 34 42 37" stroke-width="1.3" opacity=".7"/>');
  M['铸炉'] = _rf(
    '<path d="M22 30 C22 44 26 50 32 50 C38 50 42 44 42 30 Z"/>'
    + '<path d="M24 30 C24 27 40 27 40 30"/>'
    + '<circle cx="32" cy="40" r="5" stroke-width="1.2" opacity=".7"/>');

  /* —— 练气士 · 中五境 —— */
  M['洞府'] = _rf(
    '<path d="M22 48 C22 38 22 30 28 24 C32 20 32 20 36 24 C42 30 42 38 42 48"/>'
    + '<path d="M27 44 C28 38 36 38 37 44" stroke-width="1.2" opacity=".55"/>');
  M['观海'] = _rf(
    '<circle cx="32" cy="24" r="5"/>'
    + '<path d="M18 46 C24 42 28 50 34 46 C40 42 44 50 48 46" stroke-width="1.6"/>'
    + '<path d="M20 51 C26 47 30 55 36 51 C42 47 46 55 50 51" stroke-width="1.6" opacity=".7"/>');
  M['龙门'] = _rf(
    '<path d="M22 48 C22 38 22 30 24 26"/>'
    + '<path d="M42 48 C42 38 42 30 40 26"/>'
    + '<path d="M22 26 C26 20 38 20 42 26"/>'
    + '<path d="M24 44 C30 38 34 34 32 28 C30 34 38 36 40 44" stroke-width="1.4" opacity=".8"/>');
  M['金丹'] = _rf(
    '<circle cx="32" cy="32" r="15" stroke-width="1" opacity=".4"/>'
    + '<circle cx="32" cy="32" r="10"/>'
    + '<circle cx="32" cy="32" r="4.5" stroke-width="1.3" opacity=".7"/>');
  M['元婴'] = _rf(
    '<circle cx="32" cy="23" r="7"/>'
    + '<path d="M32 30 C24 30 22 40 28 45 C34 49 42 44 40 36 C39 33 36 30 32 30 Z"/>');

  /* —— 练气士 · 上五境 —— */
  M['玉璞'] = _rf(
    '<path d="M20 36 C20 28 28 22 36 24 C44 26 46 34 42 42 C38 48 26 48 22 42 C20 40 20 38 20 36 Z"/>'
    + '<path d="M26 30 C30 27 36 28 39 31" stroke-width="1.2" opacity=".6"/>');
  M['仙人'] = _rf(
    '<path d="M18 40 C16 34 24 32 28 36 C30 30 40 30 42 36 C48 34 50 42 44 44 C42 47 22 47 18 44 Z"/>'
    + '<circle cx="32" cy="23" r="5"/>'
    + '<path d="M32 18 C31 15 33 13 32 11" stroke-width="1.3" opacity=".7"/>');
  M['飞升'] = _rf(
    '<path d="M32 51 C23 47 23 38 32 35 C43 32 43 23 32 20 C21 17 21 11 30 10"/>'
    + '<path d="M27 14 C29 11 35 11 37 14" stroke-width="1.3" opacity=".7"/>');

  /* —— 失传二境 —— */
  M['合道'] = _rf(
    '<circle cx="32" cy="32" r="20" stroke-width="1" opacity=".35"/>'
    + '<circle cx="32" cy="32" r="13"/>'
    + '<circle cx="32" cy="32" r="6" stroke-width="1.3" opacity=".7"/>');
  M['三教祖师'] = _rf(
    '<path d="M15 47 C19 35 24 35 27 45"/>'
    + '<path d="M26 47 C30 27 34 27 38 45"/>'
    + '<path d="M37 47 C41 37 46 37 49 45"/>'
    + '<circle cx="32" cy="22" r="3" opacity=".8"/>');

  /* —— 武道 · 炼体三境 —— */
  WU['泥胚'] = _rf(
    '<path d="M26 24 C26 20 38 20 38 24 C40 28 40 40 36 46 C32 49 28 49 24 46 C20 40 20 28 26 24 Z"/>'
    + '<path d="M32 26 C32 34 32 40 32 46" stroke-width="1.2" opacity=".5"/>');
  WU['木胎'] = _rf(
    '<path d="M22 26 C22 22 42 22 42 26 C44 34 44 42 42 46 C42 50 22 50 22 46 C20 42 20 34 22 26 Z"/>'
    + '<path d="M28 30 C32 32 32 36 28 38" stroke-width="1.2" opacity=".6"/>'
    + '<path d="M36 34 C32 36 32 40 36 42" stroke-width="1.2" opacity=".6"/>');
  WU['水银'] = _rf(
    '<ellipse cx="26" cy="38" rx="7.5" ry="6.5"/>'
    + '<ellipse cx="41" cy="33" rx="5.5" ry="5"/>'
    + '<ellipse cx="34" cy="47" rx="4.5" ry="3.8" opacity=".8"/>');

  /* —— 武道 · 炼气三境 —— */
  WU['英魂'] = _rf(
    '<path d="M32 15 C26 23 26 30 30 36 C26 40 28 48 32 50 C36 48 38 40 34 36 C38 30 38 23 32 15 Z"/>');
  WU['雄魄'] = _rf(
    '<circle cx="32" cy="32" r="10"/>'
    + '<path d="M32 16 C31 19 33 19 32 22" stroke-width="1.3" opacity=".7"/>'
    + '<path d="M32 42 C31 45 33 45 32 48" stroke-width="1.3" opacity=".7"/>'
    + '<path d="M16 32 C19 31 19 33 22 32" stroke-width="1.3" opacity=".7"/>'
    + '<path d="M42 32 C45 31 45 33 48 32" stroke-width="1.3" opacity=".7"/>');
  WU['武胆'] = _rf(
    '<circle cx="32" cy="32" r="11"/>'
    + '<path d="M32 25 C28 29 28 36 32 39 C36 36 36 29 32 25 Z" stroke-width="1.3" opacity=".7"/>');

  /* —— 武道 · 炼神三境 —— */
  WU['金身'] = _rf(
    '<circle cx="32" cy="20" r="5"/>'
    + '<path d="M24 30 C24 28 40 28 40 30 C42 38 40 48 32 49 C24 48 22 38 24 30 Z"/>'
    + '<path d="M24 34 C20 38 20 42 23 44" stroke-width="1.2" opacity=".6"/>'
    + '<path d="M40 34 C44 38 44 42 41 44" stroke-width="1.2" opacity=".6"/>');
  WU['羽化'] = _rf(
    '<path d="M33 15 C28 24 28 40 33 51 C38 40 38 24 33 15 Z"/>'
    + '<path d="M33 16 L33 50" stroke-width="1.2" opacity=".6"/>'
    + '<path d="M33 22 C29 22 25 25 22 29" stroke-width="1.2" opacity=".6"/>'
    + '<path d="M33 30 C29 30 25 33 22 37" stroke-width="1.2" opacity=".6"/>'
    + '<path d="M33 38 C29 38 26 41 24 44" stroke-width="1.2" opacity=".6"/>');
  WU['山巅'] = _rf(
    '<path d="M13 48 C22 33 26 29 32 27 C38 29 42 33 51 48 Z"/>'
    + '<path d="M27 32 C30 30 34 30 37 32" stroke-width="1.2" opacity=".5"/>');

  /* —— 武道 · 止境三层 —— */
  WU['止境·气盛'] = _rf(
    '<path d="M32 17 C25 25 27 31 31 33 C27 37 30 46 32 49 C34 46 37 37 33 33 C37 31 39 25 32 17 Z"/>');
  WU['止境·归真'] = _rf(
    '<circle cx="32" cy="32" r="13"/>'
    + '<path d="M24 36 C30 32 36 36 40 32" stroke-width="1.2" opacity=".5"/>');
  WU['止境·神到'] = _rf(
    '<circle cx="32" cy="32" r="14" stroke-width="1" opacity=".35"/>'
    + '<circle cx="32" cy="32" r="6"/>'
    + '<path d="M32 17 C31 20 33 20 32 23" stroke-width="1.3" opacity=".7"/>'
    + '<path d="M32 41 C31 44 33 44 32 47" stroke-width="1.3" opacity=".7"/>'
    + '<path d="M17 32 C20 31 20 33 23 32" stroke-width="1.3" opacity=".7"/>'
    + '<path d="M41 32 C44 31 44 33 47 32" stroke-width="1.3" opacity=".7"/>');

  /* —— 武道 · 武神（第十一境） —— */
  WU['武神'] = _rf(
    '<path d="M22 26 C24 20 28 22 32 18 C36 22 40 20 42 26 C38 28 26 28 22 26 Z"/>'
    + '<circle cx="32" cy="39" r="7"/>');

  /* 合并：以「去空格的境名」为键，供 profile.js 直接按 now.n 取用 */
  var REALM_ICON_BY_NAME = {};
  function _copy (src) { for (var k in src) { REALM_ICON_BY_NAME[k.replace(/\s/g, '')] = src[k]; } }
  _copy(M); _copy(WU);

  /* 角色角标额外别名：练气（无对应阶梯条目，独立一枚「真气漩涡」） */
  REALM_ICON_BY_NAME['练气'] = _rf(
    '<path d="M32 19 C41 21 43 32 36 41 C29 49 19 43 20 32 C21 24 27 18 32 19 Z"/>'
    + '<path d="M28 30 C30 27 36 28 36 33 C36 39 30 41 27 36" stroke-width="1.2" opacity=".7"/>');

  /* 角色角标（game.js realmTag 用的粗粒度名）→ 图标 */
  var CHAR_REALM_MAP = {
    '练气': '练气',
    '止境': '飞升',
    '飞升境': '飞升',
    '玉璞境': '玉璞',
    '山巅境': '山巅',
    '武神境': '武神',
    '止境·神到': '止境·神到',
    '十四境·合道': '合道',
    '止境武夫': '山巅',
    '十五境': '三教祖师'
  };

  function realmIconSVG (name) {
    if (!name) return '';
    return REALM_ICON_BY_NAME[name.replace(/\s/g, '')] || '';
  }
  function realmIconForChar (realm) {
    if (!realm) return '';
    var key = CHAR_REALM_MAP[realm] || realm;
    return realmIconSVG(key);
  }

  /* 暴露全局 */
  W.REALM_ICON_BY_NAME = REALM_ICON_BY_NAME;
  W.realmIconSVG = realmIconSVG;
  W.realmIconForChar = realmIconForChar;
})(typeof window !== 'undefined' ? window : this);
