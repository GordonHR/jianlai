/* ============================================================
 * juice.js —— 「手感」层：微交互 / 光泽 / 水墨转场
 * ------------------------------------------------------------
 * 与 figfx.js 的分工：figfx 管「大画意」，本文件管「小触感」。
 * 全部走事件委托 + 自注入 CSS，不侵入 game.js 的渲染逻辑。
 *
 *   1) 卡牌 3D 倾斜 + 高光追随（鼠标在卡面上移动，光斑跟着走）
 *   2) 按钮 / 卡牌 涟漪（pointerdown 处墨圈扩散）
 *   3) 水墨横扫转场（波次推进、大场景切换）
 * ============================================================ */
(function (global) {
  'use strict';

  var CSS = [
    /* ---------- 1. 卡牌 3D 倾斜 + 高光 ----------
     * perspective() 必须写在 transform 最前，且要保留原有的 --rot 扇形角与 --lift 抬起量，
     * 否则手牌扇形会被拆掉。 */
    '.card{transform:perspective(760px) rotate(var(--rot,0deg)) translateY(var(--lift,0px))' +
    ' rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg));}',
    '.card:hover{transform:perspective(760px) rotate(0deg) translateY(-18px) scale(1.09)' +
    ' rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg));}',
    '.card:active{transition-duration:.06s;}',
    /* 光斑：白 + 卡牌类型色各一层，扫过时有「烫金」感 */
    '.card::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:6;' +
    'border-radius:inherit;opacity:0;transition:opacity .18s ease;mix-blend-mode:screen;' +
    'background:radial-gradient(240px 240px at var(--sx,50%) var(--sy,50%),' +
    'rgba(255,255,255,.40),rgba(255,255,255,.10) 36%,transparent 62%);}',
    '.card:hover::after{opacity:1;}',
    '.card::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:5;' +
    'border-radius:inherit;opacity:0;transition:opacity .18s ease;mix-blend-mode:soft-light;' +
    'background:radial-gradient(180px 180px at var(--sx,50%) var(--sy,50%),' +
    'var(--cc,#8a2b2b),transparent 68%);}',
    '.card:hover::before{opacity:.55;}',
    /* 悬停时描边染上类型色，牌面字微微放大 */
    '.card:hover{border-color:var(--cc,#8a7448);}',
    '.card:hover .cf-sig{transform:scale(1.06);}',
    '.cf-sig{transition:transform .18s cubic-bezier(.2,.8,.3,1);}',
    /* 可点按的牌抬手时给出「可以打」的提示 */
    '.card:not(.disabled){cursor:pointer;}',

    /* ---------- 2. 涟漪 ---------- */
    '.btn{position:relative;overflow:hidden;}',
    '.jc-ripple{position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;z-index:9;' +
    'transform:translate(-50%,-50%) scale(0);' +
    'background:radial-gradient(circle,rgba(255,255,255,.5),rgba(255,255,255,.14) 45%,transparent 70%);' +
    'animation:jcRipple .58s cubic-bezier(.2,.7,.3,1) forwards;}',
    '@keyframes jcRipple{0%{transform:translate(-50%,-50%) scale(0);opacity:.85;}' +
    '100%{transform:translate(-50%,-50%) scale(1);opacity:0;}}',
    /* 深色按钮（技能/幽灵）用暖金涟漪更看得见 */
    '.btn.skill .jc-ripple,.btn.ghost .jc-ripple{' +
    'background:radial-gradient(circle,rgba(232,198,106,.55),rgba(232,198,106,.12) 45%,transparent 70%);}',

    /* ---------- 3. 水墨横扫转场 ---------- */
    '#jcwipe{position:fixed;inset:0;z-index:45;pointer-events:none;opacity:0;}',
    '#jcwipe .jc-ink{position:absolute;inset:-10% -30%;' +
    'background:linear-gradient(100deg,rgba(10,8,5,0) 0%,rgba(10,8,5,.22) 20%,' +
    'rgba(10,8,5,.72) 38%,rgba(10,8,5,.86) 50%,rgba(10,8,5,.72) 62%,' +
    'rgba(10,8,5,.22) 80%,rgba(10,8,5,0) 100%);}',
    '#jcwipe .jc-edge{position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;' +
    'background:linear-gradient(180deg,transparent,rgba(232,198,106,.85),transparent);' +
    'box-shadow:0 0 24px rgba(232,198,106,.6);}',
    '#jcwipe.go{animation:jcSweep .72s cubic-bezier(.45,0,.4,1) forwards;}',
    '@keyframes jcSweep{0%{opacity:0;transform:translateX(-105%);}' +
    '38%{opacity:1;}100%{opacity:0;transform:translateX(105%);}}',

    /* ---------- 4. 通用按下回弹 ---------- */
    '.btn:not(:disabled):active{transform:translateY(1px) scale(.985);}',
    '.card:not(.disabled):active{transform:perspective(760px) rotate(0deg) translateY(-14px) scale(1.04)' +
    ' rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg));}'
  ].join('\n');

  var injected = false;
  function inject() {
    if (injected) return;
    injected = true;
    var s = document.createElement('style');
    s.id = 'juice-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------- 卡牌 3D 倾斜 + 高光追随 ---------- */
  var TILT_MAX = 9;          // 最大倾斜角（度）
  var lastTilt = null;

  function onMove(e) {
    var card = e.target && e.target.closest ? e.target.closest('.card') : null;
    if (!card || card.classList.contains('disabled')) { resetTilt(); return; }
    var r = card.getBoundingClientRect();
    if (!r.width || !r.height) return;
    /* 归一化到 -0.5 ~ 0.5 */
    var nx = (e.clientX - r.left) / r.width - 0.5;
    var ny = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--tx', (-ny * TILT_MAX * 2).toFixed(2) + 'deg');
    card.style.setProperty('--ty', (nx * TILT_MAX * 2).toFixed(2) + 'deg');
    card.style.setProperty('--sx', ((nx + 0.5) * 100).toFixed(1) + '%');
    card.style.setProperty('--sy', ((ny + 0.5) * 100).toFixed(1) + '%');
    lastTilt = card;
  }
  function resetTilt() {
    if (!lastTilt) return;
    lastTilt.style.setProperty('--tx', '0deg');
    lastTilt.style.setProperty('--ty', '0deg');
    lastTilt.style.setProperty('--sx', '50%');
    lastTilt.style.setProperty('--sy', '50%');
    lastTilt = null;
  }

  /* ---------- 涟漪 ---------- */
  function ripple(e) {
    var host = e.target && e.target.closest ? e.target.closest('.btn, .card, .bg-btn, .sk-btn') : null;
    if (!host) return;
    if (host.classList.contains('disabled') || host.disabled) return;
    /* .card 已有 overflow:hidden；按钮由 CSS 补上 */
    var r = host.getBoundingClientRect();
    var d = Math.max(r.width, r.height) * 2.1;
    var s = document.createElement('span');
    s.className = 'jc-ripple';
    s.style.width = d + 'px';
    s.style.height = d + 'px';
    s.style.left = (e.clientX - r.left) + 'px';
    s.style.top = (e.clientY - r.top) + 'px';
    host.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 620);
  }

  /* ---------- 水墨横扫转场 ---------- */
  var wipeEl = null;
  function wipe() {
    if (!wipeEl) {
      wipeEl = document.getElementById('jcwipe');
      if (!wipeEl) {
        wipeEl = document.createElement('div');
        wipeEl.id = 'jcwipe';
        wipeEl.innerHTML = '<div class="jc-ink"></div><div class="jc-edge"></div>';
        (document.body || document.documentElement).appendChild(wipeEl);
      }
    }
    wipeEl.classList.remove('go');
    void wipeEl.offsetWidth;                 // 强制重排，保证连续两次也能重放
    wipeEl.classList.add('go');
    clearTimeout(wipe._t);
    wipe._t = setTimeout(function () { wipeEl.classList.remove('go'); }, 780);
  }

  /* ---------- 安装 ---------- */
  function init() {
    inject();
    /* 触屏设备不需要倾斜，也能省掉每帧计算 */
    var fine = !(global.matchMedia && global.matchMedia('(pointer: coarse)').matches);
    if (fine) {
      document.addEventListener('mousemove', onMove, { passive: true });
      document.addEventListener('mouseleave', resetTilt);
    }
    document.addEventListener('pointerdown', ripple, { passive: true });
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.Juice = { wipe: wipe, ripple: ripple, init: init };
})(typeof window !== 'undefined' ? window : this);
