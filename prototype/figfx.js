/* ============================================================
 * figfx.js —— 「画意」图案特效层
 * ------------------------------------------------------------
 * 现有特效（game.js 的 spawnFx）都是 CSS 几何粒子：光点、线条、涟漪，
 * 没有「形象」。本层补上第二套：手绘 SVG 水墨剪影，让特效有画面——
 * 喝酒就是一个古人仰头举壶畅饮，出剑就是一个人拔剑斜劈。
 *
 * 用法：FigFx.play('drink', { line:'且饮此杯', seal:'酒' })
 *
 * 实现要点：
 *  - 每个图案是完整 inline SVG，注入 #figfx 图层，播完自毁。
 *  - 剪影用同色图形叠加（圆 + path）拼出人形，避免手写长 path 失真。
 *  - 局部旋转一律走 `transform-box:view-box` + 显式 `transform-origin`，
 *    外层 <g> 用 CSS transform、内层 <g> 保留 attribute transform，
 *    这样 CSS 动画不会覆盖掉定位。
 * ============================================================ */
(function (global) {
  'use strict';

  /* ---------- 水墨配色 ---------- */
  var INK = '#0d0a07';          // 剪影墨色
  var INK2 = '#1a140d';         // 次层剪影（远、淡）
  var GOLD = '#e8c66a';         // 主金
  var GOLD2 = '#c9a227';
  var PAPER = '#f0e6d2';        // 宣纸/留白
  var MOON = '#f6ecd2';
  var JADE = '#8fd8ff';         // 剑气青
  var CINNABAR = '#c0392b';     // 朱砂印泥

  /* ---------- 小工具 ---------- */
  function r2(n) { return Math.round(n * 100) / 100; }
  function rep(times, fn) {
    var out = '';
    for (var i = 0; i < times; i++) out += fn(i);
    return out;
  }
  /* 显式指定旋转中心（相对 viewBox），这样 CSS 动画的 rotate 才不会跑偏 */
  function piv(x, y, cls, inner) {
    return '<g class="' + (cls || '') + '" style="transform-box:view-box;transform-origin:' +
      r2(x) + 'px ' + r2(y) + 'px">' + inner + '</g>';
  }

  /* ============================================================
   * 人物零件（可复用的水墨剪影块）
   * ============================================================ */

  /* 立姿：袍摆 + 躯干，返回 body 的 path 串。cx=中轴，top=肩 y，bot=脚 y */
  function robe(cx, top, bot, w) {
    w = w || 1;
    var sh = 34 * w,   // 肩半宽
      wt = 24 * w,   // 腰半宽
      hm = 56 * w;   // 摆半宽
    var mid = top + (bot - top) * 0.36;
    return '<path d="M' + r2(cx - wt) + ' ' + r2(mid) +
      ' C' + r2(cx - wt - 6) + ' ' + r2(top + (bot - top) * 0.62) +
      ' ' + r2(cx - hm + 8) + ' ' + r2(bot - 30) +
      ' ' + r2(cx - hm) + ' ' + r2(bot) +
      ' L' + r2(cx + hm) + ' ' + r2(bot) +
      ' C' + r2(cx + hm - 8) + ' ' + r2(bot - 30) +
      ' ' + r2(cx + wt + 6) + ' ' + r2(top + (bot - top) * 0.62) +
      ' ' + r2(cx + wt) + ' ' + r2(mid) + ' Z"/>' +
      '<path d="M' + r2(cx - sh) + ' ' + r2(top + 6) +
      ' C' + r2(cx - sh + 4) + ' ' + r2(top + (mid - top) * 0.5) +
      ' ' + r2(cx - wt - 3) + ' ' + r2(top + (mid - top) * 0.78) +
      ' ' + r2(cx - wt) + ' ' + r2(mid) +
      ' L' + r2(cx + wt) + ' ' + r2(mid) +
      ' C' + r2(cx + wt + 3) + ' ' + r2(top + (mid - top) * 0.78) +
      ' ' + r2(cx + sh - 4) + ' ' + r2(top + (mid - top) * 0.5) +
      ' ' + r2(cx + sh) + ' ' + r2(top + 6) + ' Z"/>';
  }

  /* 头 + 发髻。cx/cy 为中心，rot 为脸朝向（正=顺时针=脸朝右下） */
  function head(cx, cy, rx, rot) {
    rot = rot || 0;
    return '<g transform="rotate(' + rot + ' ' + r2(cx) + ' ' + r2(cy) + ')">' +
      '<ellipse cx="' + r2(cx) + '" cy="' + r2(cy) + '" rx="' + rx + '" ry="' + r2(rx * 1.14) + '"/>' +
      /* 发髻偏后（脸朝哪，髻就在反侧） */
      '<ellipse cx="' + r2(cx - rx * 0.78) + '" cy="' + r2(cy - rx * 0.5) +
      '" rx="' + r2(rx * 0.62) + '" ry="' + r2(rx * 0.5) + '" transform="rotate(-24 ' +
      r2(cx - rx * 0.78) + ' ' + r2(cy - rx * 0.5) + ')"/>' +
      '</g>';
  }

  /* 手臂：二次贝塞尔，stroke 当肢体 */
  function arm(d, w) {
    return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (w || 16) +
      '" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  /* 远山：底部一条起伏剪影 */
  function hills(y, fill, op) {
    return '<path d="M-20 400 L-20 ' + (y + 26) + ' L34 ' + (y - 34) + ' L82 ' + (y + 6) +
      ' L138 ' + (y - 48) + ' L192 ' + (y + 14) + ' L246 ' + (y - 30) + ' L302 ' + (y + 18) +
      ' L358 ' + (y - 22) + ' L420 ' + (y + 16) + ' L420 400 Z" fill="' + (fill || INK) +
      '" opacity="' + (op == null ? 0.3 : op) + '"/>';
  }

  /* 月 */
  function moon(cx, cy, r) {
    return '<circle class="fxfig-moon" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#fgMoon)"/>' +
      '<circle class="fxfig-moondisc" cx="' + cx + '" cy="' + cy + '" r="' + r2(r * 0.52) +
      '" fill="' + MOON + '" opacity=".22"/>';
  }

  /* 通用 defs：月晕、墨晕、雾 */
  var DEFS =
    '<defs>' +
    '<radialGradient id="fgMoon">' +
    '<stop offset="0" stop-color="#f6ecd2" stop-opacity=".5"/>' +
    '<stop offset=".55" stop-color="#f6ecd2" stop-opacity=".14"/>' +
    '<stop offset="1" stop-color="#f6ecd2" stop-opacity="0"/>' +
    '</radialGradient>' +
    '<radialGradient id="fgHalo">' +
    '<stop offset="0" stop-color="#e8c66a" stop-opacity=".55"/>' +
    '<stop offset="1" stop-color="#e8c66a" stop-opacity="0"/>' +
    '</radialGradient>' +
    '<radialGradient id="fgJade">' +
    '<stop offset="0" stop-color="#8fd8ff" stop-opacity=".6"/>' +
    '<stop offset="1" stop-color="#8fd8ff" stop-opacity="0"/>' +
    '</radialGradient>' +
    /* 墨边（主）：先用噪声扰动轮廓，做出墨在宣纸上渗化的不规则毛边，再柔化。
       单纯 feGaussianBlur 只会把硬边糊成「齐边」，矢量味仍在；
       displacement 让边真正「毛」出来，才是水墨。scale 控制毛刺幅度，过大则形状散架。 */
    '<filter id="fgInk" x="-35%" y="-35%" width="170%" height="170%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="3" seed="5" result="n"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="6.5" ' +
    'xChannelSelector="R" yChannelSelector="G" result="d"/>' +
    '<feGaussianBlur in="d" stdDeviation="1.5"/>' +
    '</filter>' +
    /* 更润的一档：给衣袂、飘带、雾气这类轻薄元素（毛刺更长、更模糊） */
    '<filter id="fgInk2" x="-45%" y="-45%" width="190%" height="190%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.026" numOctaves="3" seed="11" result="n"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="9" ' +
    'xChannelSelector="R" yChannelSelector="G" result="d"/>' +
    '<feGaussianBlur in="d" stdDeviation="2.6"/>' +
    '</filter>' +
    /* 细节档：头、发髻、贴头的飘带根部这类小尺度元素专用。
       位移量是绝对值，对 60px 宽的头比对 140px 宽的袍子破坏大得多 ——
       同样 scale=6.5，袍子只是多了道毛边，头却会被撕得五官错位。
       故本档 scale 只取 fgInk 的一半左右，毛刺更细、模糊更轻，保住轮廓可辨。 */
    '<filter id="fgInkH" x="-40%" y="-40%" width="180%" height="180%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="9" result="n"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="3" ' +
    'xChannelSelector="R" yChannelSelector="G" result="d"/>' +
    '<feGaussianBlur in="d" stdDeviation="1.1"/>' +
    '</filter>' +
    /* 锐边：剑刃、印章这类要利落的，只做极轻模糊，不走扰动 */
    '<filter id="fgSharp" x="-25%" y="-25%" width="150%" height="150%">' +
    '<feGaussianBlur stdDeviation="0.6"/>' +
    '</filter>' +
    '<filter id="fgSoft" x="-40%" y="-40%" width="180%" height="180%">' +
    '<feGaussianBlur stdDeviation="7"/>' +
    '</filter>' +
    '<filter id="fgGlow" x="-60%" y="-60%" width="220%" height="220%">' +
    '<feGaussianBlur stdDeviation="3.4" result="b"/>' +
    '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
    '</filter>' +
    /* 单柄小剑：竖直、尖朝上，中心在 (20,20) */
    '<g id="fgJian">' +
    '<path d="M20 1 L23.4 12 L23.4 29 L20 36 L16.6 29 L16.6 12 Z"/>' +
    '<path d="M11.6 29.4 L28.4 29.4 L28.4 32.4 L11.6 32.4 Z"/>' +
    '<rect x="18.2" y="32" width="3.6" height="6.6" rx="1.4"/>' +
    '<rect x="18.6" y="38.2" width="2.8" height="1.6" rx=".8"/>' +
    '</g>' +
    '</defs>';

  /* ============================================================
   * 图案库：name -> { w,h,dur,body(svg内部),css(可选) }
   * 每个 body 使用 viewBox 0 0 400 400 的坐标系。
   * ============================================================ */
  var FIG = {};

  /* ---------- 一、饮酒图：一人仰头举壶畅饮 ---------- */
  /* ---------- 饮酒图（重写版） ----------
   * 旧版用 robe()/arm()/head() 三个零件拼：对称梯形袍、等宽 stroke 手臂、双椭圆头 —— 几何拼接味重。
   * 新版要点：
   *   1) 躯干与袍摆写成一条连续 path，左右不对称；底边自左下向右上斜起，是被夜风带起的势；
   *   2) 手臂改用填充 path 描述粗细（肩端宽、腕端窄），不再是等宽棍子；
   *   3) 头用单条 path 勾轮廓（含仰起的下颌走向），发髻另起一笔；
   *   4) 飘带做成「根部宽、末端收尖」的月牙，同向右上（月亮方向）流动，多条长短错落。
   * 注：return 后不能直接换行（ASI 会把 return 吞成 undefined），注释一律前置。 */
  FIG.drink = {
    dur: 2900,
    body: function () {
      /* 葫芦：本地坐标竖直，塞在上端；整体绕自身中心旋转 -122° 使壶口朝左下（正对仰起的嘴） */
      var gourd =
        '<g transform="translate(272,50) rotate(-122)">' +
        '<circle cx="0" cy="10" r="19"/>' +             /* 下腹（大） */
        '<circle cx="0" cy="-18" r="12.5"/>' +           /* 上腹（小） */
        '<ellipse cx="0" cy="-3" rx="9.5" ry="8.5"/>' +  /* 束腰 */
        '<path d="M-6 -29 L6 -29 L5 -38 L-5 -38 Z"/>' +  /* 壶塞 */
        '<path d="M-12.5 -18 A12.5 12.5 0 0 0 12.5 -18" fill="' + GOLD + '" opacity=".5"/>' +
        '</g>';

      /* 躯干 + 袍摆：一条连续 path。左下摆 (123,372) 沉底，右下摆 (262,350) 被风带起，
         底边因此斜向右上；右侧自摆口一路收至髋、腰、肩，肩线本身也略微右高左低。 */
      var torso =
        '<path d="M186 124 ' +
        'C170 130 156 136 148 150 ' +
        'C141 163 145 183 151 201 ' +
        'C157 217 160 222 160 236 ' +
        'C158 256 152 280 143 308 ' +
        'C134 336 126 356 123 372 ' +
        'C146 379 170 381 194 379 ' +
        'C220 377 244 368 262 350 ' +
        'C252 320 240 292 232 268 ' +
        'C228 254 224 250 218 244 ' +
        'C214 234 212 226 210 218 ' +
        'C220 194 224 168 220 150 ' +
        'C218 138 216 130 214 124 Z"/>';

      /* 左臂：垂下的宽袖，肩端宽约 22，袖口散开 */
      var armL =
        '<path d="M150 148 ' +
        'C138 158 133 182 135 206 ' +
        'C137 232 143 260 150 276 ' +
        'C164 274 170 250 168 224 ' +
        'C166 198 166 168 170 150 Z"/>';

      /* 右臂：自肩举向右上，肩端宽 22、腕端收窄到 10，末端接壶 */
      var armR =
        '<path d="M206 146 ' +
        'C218 134 234 112 246 92 ' +
        'C252 82 256 74 260 68 ' +
        'C268 71 270 79 268 89 ' +
        'C262 107 250 129 238 147 ' +
        'C230 159 214 159 206 152 Z"/>';

      /* 头：卵形，长轴随仰头之势倾向右上（下颌在右下、后脑在左上）。
         各段接缝均做切线连续 —— 相邻两段在接点上的进出方向夹角依次约 22°/0°/0°/0°/4°，
         几何上不存在折角（旧版闭合点 (178,78) 处夹角 74°，是个实打实的尖）。 */
      var headPath =
        '<g fill="' + INK + '" filter="url(#fgInkH)">' +
        '<path d="M196 54 ' +
        'C216 56 230 72 232 92 ' +
        'C234 108 226 122 212 128 ' +
        'C200 133 186 132 178 125 ' +
        'C170 118 168 106 170 94 ' +
        'C172 76 182 58 196 54 Z"/>' +
        /* 发髻：改用椭圆，不再手绘 path。二次曲线没有角点，被位移扰动后只会变成
           一枚不规则椭圆，数学上长不出尖刺；旧版手绘发髻 path 在 (177,77) 与 (177,86)
           各有一个 65°/79° 的折角，与头顶那个 74° 折角挤在一起，正是「狼耳」的来源。 */
        '<ellipse cx="168" cy="96" rx="16" ry="13"/>' +
        '</g>' +
        /* 发带：横过发髻的一道金线。作用不是装饰，是「语义锚点」——
           明确告诉眼睛这是束起的头发，而不是从头侧支出来的耳朵。 */
        '<path d="M150 90 C160 95 176 99 189 96" fill="none" stroke="' + GOLD +
        '" stroke-width="2.2" stroke-linecap="round" opacity=".5" filter="url(#fgSharp)"/>';

      /* 头巾飘带：改用 stroke + round 线帽，两端天然圆头、不再有收尖。
         关键改动 —— 根部与末端分级施滤：
         旧版整条飘带都套全库最强的 fgInk2（scale=9），而根部起点 (176,72) 正落在头轮廓之外，
         一根 11px 宽的笔画末端被 9 单位位移撕扯，只会甩出舌状突出物（即用户看到的那根「狼吻」）。
         现按「离头远近」分档：根部埋进头内并改弱扰动，末端已甩在空处才放开做长毛刺与渐隐。 */
      var ribbon =
        '<g fill="none" stroke="' + INK + '" stroke-linecap="round" filter="url(#fgInkH)">' +
        '<path class="fxfig-ribbon" d="M200 60 C210 53 220 47 230 41" stroke-width="10" opacity=".9"/>' +
        '<path class="fxfig-ribbon fxfig-ribbon2" d="M203 74 C214 68 226 62 236 57" stroke-width="7" opacity=".68"/>' +
        '</g>' +
        '<g fill="none" stroke="' + INK + '" stroke-linecap="round" filter="url(#fgInk2)">' +
        '<path class="fxfig-ribbon" d="M230 41 C244 33 256 27 266 21" stroke-width="7" opacity=".74"/>' +
        '<path class="fxfig-ribbon fxfig-ribbon2" d="M236 57 C248 53 258 50 266 48" stroke-width="4.5" opacity=".5"/>' +
        '</g>';

      /* 腰带与腰带飘带：飘带向右下甩，与头巾形成上下呼应的动势。
         飘带同样用圆头 stroke 拆两段，末端渐细渐隐，不留尖角。 */
      var sash =
        '<path d="M162 228 C180 222 200 222 212 228 ' +
        'C214 238 214 250 212 258 ' +
        'C198 264 176 264 160 258 ' +
        'C158 248 158 236 162 228 Z" fill="' + INK2 + '"/>' +
        '<g fill="none" stroke="' + INK + '" stroke-linecap="round">' +
        '<path class="fxfig-sash" d="M208 234 C234 241 254 252 268 266" stroke-width="9" opacity=".82"/>' +
        '<path class="fxfig-sash" d="M268 266 C275 272 280 278 284 284" stroke-width="5" opacity=".56"/>' +
        '</g>';

      /* 衣纹：用浅色细线压在墨色袍上，交代结构与风的走向 */
      var folds =
        '<g fill="none" stroke="' + PAPER + '" stroke-linecap="round" opacity=".16">' +
        '<path d="M172 198 C179 240 176 292 165 342" stroke-width="2.1"/>' +
        '<path d="M198 214 C204 258 202 306 194 352" stroke-width="1.7"/>' +
        '<path d="M152 262 C166 292 176 322 180 356" stroke-width="1.5"/>' +
        '<path d="M214 168 C209 196 208 222 212 246" stroke-width="1.4"/>' +
        '</g>';

      return moon(300, 116, 78) + hills(352, INK, 0.26) +
        /* 地上一摊酒渍 */
        '<ellipse class="fxfig-pool" cx="188" cy="380" rx="86" ry="11" fill="' + GOLD + '" opacity=".16"/>' +
        /* 墨韵：主体下面垫一层更大更淡的晕，模拟宣纸吃墨、边缘化开 */
        '<g fill="' + INK + '" filter="url(#fgSoft)" opacity=".26">' + torso + '</g>' +
        '<g fill="' + INK + '" filter="url(#fgInk)">' + torso + armL + '</g>' +
        /* 颈：旧版是个矩形，四个 90° 直角就在头部正下方，方方正正的硬边跟周围的墨韵格格不入。
           改成一根圆头 stroke —— 线帽天然是圆，不存在角点；上下两端分别埋进头与躯干内部，
           只露出中间一小段，读起来就是下颌到肩的过渡。 */
        '<path d="M202 106 L204 146" fill="none" stroke="' + INK +
        '" stroke-width="30" stroke-linecap="round" filter="url(#fgInkH)"/>' +
        /* 头：整组绕颈根旋转，做「仰头」动作 */
        piv(204, 132, 'fxfig-head', headPath + ribbon) +
        '<g fill="' + INK + '" filter="url(#fgInk)">' + armR + '</g>' +
        folds +
        '<g fill="' + INK + '" filter="url(#fgInk)">' + sash + '</g>' +
        /* 壶：外层做倾倒动画 */
        piv(272, 50, 'fxfig-gourd', gourd) +
        /* 酒液：自壶口垂落至唇边 */
        '<path class="fxfig-wine" d="M240 70 Q224 84 207 101" fill="none" stroke="' + GOLD +
        '" stroke-width="3.4" stroke-linecap="round" filter="url(#fgGlow)"/>' +
        '<circle class="fxfig-drop" cx="207" cy="107" r="2.8" fill="' + GOLD + '"/>' +
        '<circle class="fxfig-drop" cx="204" cy="119" r="2.1" fill="' + GOLD + '" opacity=".8"/>' +
        /* 喉间酒气 */
        '<path class="fxfig-breath" d="M212 120 Q228 130 220 148" fill="none" stroke="' + GOLD +
        '" stroke-width="2.2" opacity=".5"/>';
    }
  };

  /* ---------- 二、出剑图：低身弓步，一剑斜劈 ---------- */
  FIG.sword = {
    dur: 2200,
    body: function () {
      return hills(360, INK, 0.24) +
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        /* 后腿蹬地 */
        '<path d="M138 376 L206 376 L188 296 L142 302 Z"/>' +
        /* 前腿弓步 */
        '<path d="M196 376 L262 376 L240 288 L190 292 Z"/>' +
        /* 前倾的躯干 */
        '<path d="M186 292 C174 250 176 202 198 168 L250 188 C240 228 242 272 256 302 Z"/>' +
        '</g>' +
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        head(214, 150, 21, -16) +
        '</g>' +
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        /* 左臂后展（配重） */
        arm('M198 196 Q162 206 136 184', 15) +
        /* 右臂前伸握剑 */
        arm('M236 196 Q276 190 302 170', 16) +
        '</g>' +
        /* 剑：绕握把旋转，从「垂」到「斜劈」 */
        piv(302, 170, 'fxfig-blade',
          '<g transform="translate(302,170) rotate(-46)">' +
          '<path d="M-6 -2 L96 -11 L104 0 L96 11 L-6 2 Z"/>' +     /* 剑身 */
          '<path d="M-14 -14 L-4 -14 L-4 14 L-14 14 Z"/>' +        /* 护手 */
          '<rect x="-26" y="-6" width="14" height="12" rx="3"/>' +  /* 柄 */
          '<circle cx="-27" cy="0" r="5"/>' +                       /* 剑首 */
          '<path d="M2 -2.4 L96 -6.6 L96 -3 L2 -.4 Z" fill="' + '#eaf6ff' + '" opacity=".85"/>' +
          '</g>'
        ) +
        /* 斩击弧白痕 */
        '<path class="fxfig-arc" d="M34 336 Q200 176 386 44" fill="none" stroke="#eaf6ff" ' +
        'stroke-width="4.5" stroke-linecap="round" filter="url(#fgGlow)"/>' +
        '<path class="fxfig-arc2" d="M20 356 Q190 200 380 30" fill="none" stroke="' + JADE +
        '" stroke-width="2" stroke-linecap="round" opacity=".8"/>';
    }
  };

  /* ---------- 三、剑雨图：城头独立，万剑齐落 ---------- */
  FIG.swordrain = {
    dur: 2600,
    body: function () {
      /* 城墙 */
      var wall =
        '<path d="M-20 400 L-20 322 L46 322 L46 296 L104 296 L104 322 L186 322 L186 288 L248 288 ' +
        'L248 322 L326 322 L326 302 L384 302 L384 322 L420 322 L420 400 Z" fill="' + INK + '" opacity=".62"/>' +
        '<path d="M186 288 L248 288 L248 296 L186 296 Z" fill="' + INK2 + '"/>';

      /* 城头小人：背身而立，手按剑 */
      var man =
        '<g fill="' + INK + '">' +
        '<path d="M198 290 C192 258 194 236 204 220 L228 220 C234 240 232 264 236 290 Z"/>' +
        head(216, 206, 14, 8) +
        arm('M228 232 Q252 220 262 202', 11) +
        '<path d="M258 206 L272 176 L276 178 L263 208 Z" fill="' + INK + '"/>' +
        '</g>';

      /* 万剑：三批错开落下 */
      var rain = '';
      [[30, 0.55, 0.62, 0], [26, 0.78, 0.8, .12], [22, 1.05, 0.95, .26]].forEach(function (g, gi) {
        var n = g[0], sc = g[1], op = g[2], dl = g[3];
        for (var i = 0; i < n; i++) {
          var x = r2(-10 + Math.random() * 420);
          var y = r2(-60 - Math.random() * 200);
          var rot = r2(150 + Math.random() * 60);   /* 尖朝下 */
          var s = r2(sc * (0.6 + Math.random() * 0.7));
          var d = r2(Math.random() * 0.9);
          rain += '<use href="#fgJian" xlink:href="#fgJian" class="fxfig-rain" fill="' + (i % 5 === 0 ? JADE : '#dfe9f2') +
            '" opacity="' + op + '" style="animation-delay:' + r2(dl + d) + 's" ' +
            'transform="translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')"/>';
        }
      });

      return '<rect x="0" y="0" width="400" height="400" fill="url(#fgJade)" opacity=".22" class="fxfig-wash"/>' +
        moon(78, 92, 62) + rain + wall + man;
    }
  };

  /* ---------- 四、展卷图：儒门端坐，一卷摊开 ---------- */
  FIG.scroll = {
    dur: 2700,
    body: function () {
      var words = '有 教 无 类';
      return hills(372, INK, 0.18) +
        '<circle cx="200" cy="196" r="150" fill="url(#fgHalo)" class="fxfig-wash"/>' +
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        /* 盘坐 */
        '<path d="M120 376 C116 320 148 290 200 290 C252 290 284 320 280 376 Z"/>' +
        /* 身 */
        '<path d="M176 292 C168 250 170 214 182 186 L224 186 C234 216 234 252 228 292 Z"/>' +
        '</g>' +
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        head(203, 162, 22, 0) +
        /* 儒冠 */
        '<path d="M176 148 L230 148 L230 136 L176 136 Z"/>' +
        '<path d="M184 136 L222 136 L214 120 L192 120 Z"/>' +
        '</g>' +
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        /* 双臂展卷 */
        arm('M184 202 Q146 212 120 234', 15) +
        arm('M226 202 Q264 212 290 234', 15) +
        '</g>' +
        /* 卷轴：两边展开 */
        '<g class="fxfig-scroll">' +
        '<rect x="112" y="228" width="176" height="50" fill="' + PAPER + '" opacity=".93"/>' +
        '<rect x="104" y="222" width="13" height="62" rx="6.5" fill="#6b4f2a"/>' +
        '<rect x="283" y="222" width="13" height="62" rx="6.5" fill="#6b4f2a"/>' +
        '<text x="200" y="260" text-anchor="middle" fill="' + INK + '" ' +
        'font-family="STKaiti,KaiTi,Sarasa Gothic SC,serif" font-size="26" letter-spacing="6">' +
        words + '</text>' +
        '</g>' +
        /* 卷上升起的墨字气韵 */
        rep(7, function (i) {
          var x = 128 + i * 24, d = r2(0.5 + i * 0.11);
          return '<circle class="fxfig-wisp" cx="' + x + '" cy="228" r="' + r2(2.4 + (i % 3)) +
            '" fill="' + INK + '" opacity=".5" style="animation-delay:' + d + 's"/>';
        });
    }
  };

  /* ---------- 五、莲华图：佛影盘坐，莲瓣三层绽开 ---------- */
  FIG.lotus = {
    dur: 2800,
    body: function () {
      /* 莲瓣：每环若干枚，绕中心放射 */
      function ring(n, rad, len, wd, col, op, cls) {
        return rep(n, function (i) {
          var a = (360 / n) * i;
          return '<g class="' + (cls || 'fxfig-petal') + '" style="animation-delay:' +
            r2(0.12 + i * 0.055) + 's" transform="translate(200,' + rad + ')">' +
            '<ellipse cx="0" cy="' + r2(-len / 2) + '" rx="' + r2(wd / 2) + '" ry="' + r2(len / 2) +
            '" fill="' + col + '" opacity="' + op + '" transform="rotate(' + r2(a) + ')"/>' +
            '</g>';
        });
      }
      var cy = 300;
      return '<circle cx="200" cy="220" r="160" fill="url(#fgHalo)" class="fxfig-wash"/>' +
        /* 后两环 */
        ring(10, cy, 120, 34, '#f3d9e4', 0.55, 'fxfig-petal fxfig-p-back') +
        ring(8, cy, 92, 26, '#fbeaf1', 0.75) +
        /* 佛影 */
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        '<path d="M138 344 C134 306 162 282 200 282 C238 282 266 306 262 344 Z"/>' +
        '<path d="M180 284 C172 248 174 216 186 190 L216 190 C228 218 228 250 222 284 Z"/>' +
        head(201, 168, 20, 0) +
        /* 肉髻 */
        '<ellipse cx="201" cy="144" rx="9" ry="7"/>' +
        /* 结印双手 */
        '<path d="M186 236 Q200 250 216 236 Q210 258 200 258 Q190 258 186 236 Z"/>' +
        '</g>' +
        /* 头光 */
        '<circle class="fxfig-halo" cx="201" cy="166" r="42" fill="none" stroke="' + GOLD +
        '" stroke-width="2.4" opacity=".7"/>' +
        /* 前环 */
        ring(6, cy, 74, 22, '#ffffff', 0.9) +
        /* 花蕊 */
        rep(9, function (i) {
          var a = (Math.PI * 2 / 9) * i;
          return '<circle class="fxfig-wisp" cx="' + r2(200 + Math.cos(a) * 12) +
            '" cy="' + r2(cy - 16 + Math.sin(a) * 6) + '" r="2.4" fill="' + GOLD +
            '" style="animation-delay:' + r2(0.5 + i * 0.07) + 's"/>';
        });
    }
  };

  /* ---------- 六、太极图：道门，阴阳鱼转 + 三道人影（一气化三清） ---------- */
  FIG.taiji = {
    dur: 2800,
    body: function () {
      var taiji =
        '<g transform="translate(200,190)">' +
        '<circle r="76" fill="' + INK + '" opacity=".92"/>' +
        '<path d="M0 -76 A76 76 0 0 1 0 76 A38 38 0 0 1 0 0 A38 38 0 0 0 0 -76 Z" fill="' + PAPER + '"/>' +
        '<circle cx="0" cy="-38" r="10" fill="' + INK + '"/>' +
        '<circle cx="0" cy="38" r="10" fill="' + PAPER + '"/>' +
        '<circle r="76" fill="none" stroke="' + GOLD + '" stroke-width="1.6" opacity=".55"/>' +
        '</g>';

      /* 三清人影：中间实、两侧虚 */
      function shade(cx, op, cls) {
        return '<g class="' + cls + '" opacity="' + op + '" fill="' + INK + '">' +
          '<path d="M' + (cx - 30) + ' 376 C' + (cx - 34) + ' 320 ' + (cx - 20) + ' 296 ' + cx +
          ' 296 C' + (cx + 20) + ' 296 ' + (cx + 34) + ' 320 ' + (cx + 30) + ' 376 Z"/>' +
          '<path d="M' + (cx - 17) + ' 300 C' + (cx - 22) + ' 258 ' + (cx - 20) + ' 226 ' + (cx - 12) +
          ' 202 L' + (cx + 12) + ' 202 C' + (cx + 20) + ' 228 ' + (cx + 22) + ' 260 ' + (cx + 17) + ' 300 Z"/>' +
          '<ellipse cx="' + cx + '" cy="182" rx="18" ry="21"/>' +
          '<ellipse cx="' + cx + '" cy="160" rx="8" ry="6"/>' +
          '</g>';
      }

      return '<circle cx="200" cy="200" r="176" fill="url(#fgHalo)" class="fxfig-wash"/>' +
        shade(96, 0.35, 'fxfig-qing fxfig-qing-l') +
        shade(304, 0.35, 'fxfig-qing fxfig-qing-r') +
        shade(200, 0.9, 'fxfig-qing fxfig-qing-m') +
        piv(200, 190, 'fxfig-taiji', taiji) +
        /* 环绕符文 */
        rep(12, function (i) {
          var a = (Math.PI * 2 / 12) * i;
          return '<text class="fxfig-runechar" x="' + r2(200 + Math.cos(a) * 96) + '" y="' +
            r2(190 + Math.sin(a) * 96) + '" text-anchor="middle" fill="' + GOLD +
            '" font-size="17" font-family="STKaiti,KaiTi,serif" opacity=".85" ' +
            'style="animation-delay:' + r2(i * 0.06) + 's">' +
            '道天地玄洪荒宙盈虚无极一'[i] + '</text>';
        });
    }
  };

  /* ---------- 七、妖雾图：蛮荒巨兽，雾中睁眼 ---------- */
  FIG.beast = {
    dur: 2700,
    body: function () {
      /* 雾团 —— 注：return 后不能直接换行，否则 ASI 会把 return 吞成 undefined */
      return '<ellipse class="fxfig-mist" cx="200" cy="300" rx="200" ry="96" fill="#8fa39a" opacity=".2" filter="url(#fgSoft)"/>' +
        '<ellipse class="fxfig-mist" cx="120" cy="250" rx="120" ry="72" fill="#8fa39a" opacity=".16" filter="url(#fgSoft)" style="animation-delay:.5s"/>' +
        '<ellipse class="fxfig-mist" cx="300" cy="256" rx="120" ry="72" fill="#8fa39a" opacity=".16" filter="url(#fgSoft)" style="animation-delay:.9s"/>' +
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        /* 蜿蜒的兽身 */
        '<path d="M132 226 C62 252 34 306 52 366 L104 362 C88 306 100 264 148 248 Z"/>' +
        /* 颈与头 */
        '<path d="M132 226 C126 190 150 158 196 152 C246 146 276 176 272 210 C270 232 246 246 216 242 L196 240 Z"/>' +
        /* 双耳 */
        '<path d="M150 158 L136 108 L182 142 Z"/>' +
        '<path d="M214 150 L244 106 L246 156 Z"/>' +
        /* 獠牙 */
        '<path d="M182 216 L188 240 L196 216 Z" fill="' + PAPER + '"/>' +
        '<path d="M204 216 L210 240 L218 216 Z" fill="' + PAPER + '"/>' +
        '</g>' +
        /* 双眼：雾中亮起 */
        '<ellipse class="fxfig-eye" cx="172" cy="180" rx="9" ry="5" fill="#ff6a3a" filter="url(#fgGlow)"/>' +
        '<ellipse class="fxfig-eye" cx="234" cy="176" rx="9" ry="5" fill="#ff6a3a" filter="url(#fgGlow)"/>' +
        /* 鼻息 */
        rep(4, function (i) {
          return '<ellipse class="fxfig-breath2" cx="' + (196 + i * 8) + '" cy="252" rx="' + (7 + i * 3) +
            '" ry="' + (4 + i * 1.6) + '" fill="#c9d4cd" opacity=".3" style="animation-delay:' +
            r2(i * 0.14) + 's"/>';
        });
    }
  };

  /* ---------- 八、祭剑图：炉火打铁，锤落星溅 ---------- */
  FIG.forge = {
    dur: 2600,
    body: function () {
      /* 炉火 —— 同上，return 后不可换行 */
      return '<ellipse class="fxfig-fire" cx="150" cy="336" rx="72" ry="52" fill="#ff8a2b" opacity=".34" filter="url(#fgSoft)"/>' +
        '<ellipse class="fxfig-fire" cx="150" cy="340" rx="40" ry="30" fill="#ffd27a" opacity=".5" filter="url(#fgSoft)" style="animation-delay:.2s"/>' +
        /* 炉 */
        '<g fill="' + INK + '">' +
        '<path d="M92 376 L92 320 L208 320 L208 376 Z"/>' +
        '<path d="M84 320 L216 320 L216 306 L84 306 Z"/>' +
        '</g>' +
        /* 铁砧 */
        '<g fill="' + INK2 + '">' +
        '<path d="M226 332 L316 332 L304 350 L238 350 Z"/>' +
        '<path d="M246 350 L296 350 L300 376 L242 376 Z"/>' +
        '</g>' +
        /* 剑胚（烧红） */
        '<path class="fxfig-blank" d="M240 328 L308 322 L312 330 L244 336 Z" fill="#ff7a2a" filter="url(#fgGlow)"/>' +
        /* 匠人：举锤 */
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        '<path d="M330 376 L378 376 L366 300 L336 300 Z"/>' +
        '<path d="M340 300 C334 258 344 224 356 200 L386 210 C378 246 380 280 386 300 Z"/>' +
        head(366, 182, 20, 12) +
        '</g>' +
        /* 抡起的手臂 + 锤 */
        piv(360, 212, 'fxfig-hammer',
          '<g fill="' + INK + '">' +
          arm('M360 214 Q318 196 300 160', 15) +
          '<rect x="284" y="132" width="40" height="22" rx="5" transform="rotate(-24 304 143)"/>' +
          '<rect x="292" y="150" width="10" height="46" rx="4" transform="rotate(-24 297 173)"/>' +
          '</g>'
        ) +
        /* 火星 */
        rep(16, function (i) {
          var a = -0.5 - Math.random() * 2.2, d = 40 + Math.random() * 90;
          return '<circle class="fxfig-spark" cx="276" cy="330" r="' + r2(1.6 + Math.random() * 2.2) +
            '" fill="#ffcf6a" style="--dx:' + r2(Math.cos(a) * d) + 'px;--dy:' + r2(Math.sin(a) * d) +
            'px;animation-delay:' + r2(Math.random() * 0.7) + 's"/>';
        });
    }
  };

  /* ---------- 九、雷法图：结印引雷，雷纹贯下 ---------- */
  FIG.thunder = {
    dur: 2400,
    body: function () {
      /* 云 */
      var cloud =
        '<path d="M40 118 C40 92 64 78 92 84 C104 58 146 52 166 78 C196 62 232 78 236 106 ' +
        'C266 104 282 126 274 146 L52 146 C34 142 32 126 40 118 Z" fill="' + INK + '" opacity=".78"/>';

      /* 雷纹折线 */
      var bolt =
        '<path class="fxfig-bolt" d="M186 146 L150 224 L184 226 L140 320 L226 208 L190 206 Z" ' +
        'fill="none" stroke="#eaf6ff" stroke-width="4" stroke-linejoin="round" filter="url(#fgGlow)"/>' +
        '<path class="fxfig-bolt" d="M258 146 L232 206 L258 208 L226 278 L292 196 L262 194 Z" ' +
        'fill="none" stroke="' + JADE + '" stroke-width="2.6" stroke-linejoin="round" opacity=".9" ' +
        'style="animation-delay:.12s"/>';

      return hills(374, INK, 0.22) +
        '<rect class="fxfig-wash" x="0" y="0" width="400" height="400" fill="' + JADE + '" opacity="0"/>' +
        cloud + bolt +
        /* 结印者：仰面举双手 */
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        '<path d="M164 376 C158 320 170 294 196 294 C222 294 234 320 228 376 Z"/>' +
        '<path d="M176 296 C168 258 170 226 180 200 L216 200 C226 228 226 260 220 296 Z"/>' +
        head(200, 176, 21, 0) +
        arm('M182 206 Q150 186 136 152', 14) +
        arm('M218 206 Q250 186 264 152', 14) +
        '</g>' +
        /* 印诀光点 */
        '<circle class="fxfig-wisp" cx="136" cy="150" r="5" fill="#eaf6ff" filter="url(#fgGlow)"/>' +
        '<circle class="fxfig-wisp" cx="264" cy="150" r="5" fill="#eaf6ff" filter="url(#fgGlow)" style="animation-delay:.15s"/>' +
        /* 落雷溅射 */
        rep(12, function (i) {
          var a = (Math.PI / 12) * i + Math.PI * 0.06;
          return '<path class="fxfig-shard" d="M0 0 L30 -6 L26 0 L30 6 Z" fill="#eaf6ff" opacity=".9" ' +
            'style="--ang:' + r2(a * 57.3) + 'deg;animation-delay:' + r2(Math.random() * 0.2) +
            's" transform="translate(140,320)"/>';
        });
    }
  };

  /* ---------- 十、观星图：夜立山巅，仰观星象 ---------- */
  FIG.star = {
    dur: 2800,
    body: function () {
      /* 星图连线（北斗） */
      var dipper = [[92, 96], [122, 78], [156, 86], [182, 74], [212, 92], [244, 84], [268, 104]];
      var line = '<path class="fxfig-starline" d="M' + dipper.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L') +
        '" fill="none" stroke="' + GOLD + '" stroke-width="1.6" opacity=".8"/>';
      var dots = rep(dipper.length, function (i) {
        return '<circle class="fxfig-stardot" cx="' + dipper[i][0] + '" cy="' + dipper[i][1] +
          '" r="' + (i === 3 ? 4.2 : 3) + '" fill="' + GOLD + '" style="animation-delay:' + r2(i * 0.09) + 's"/>';
      });
      var dust = rep(34, function () {
        var x = r2(Math.random() * 400), y = r2(Math.random() * 250), s = r2(0.8 + Math.random() * 1.8);
        return '<circle class="fxfig-stardot" cx="' + x + '" cy="' + y + '" r="' + s +
          '" fill="' + PAPER + '" opacity=".7" style="animation-delay:' + r2(Math.random() * 1.2) + 's"/>';
      });

      return '<rect x="0" y="0" width="400" height="400" fill="#0a1020" opacity=".42" class="fxfig-wash"/>' +
        dust + line + dots +
        hills(330, '#05070c', 0.6) +
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        /* 立姿：背身仰观 */
        robe(196, 214, 348, 0.78) +
        /* 双臂上举 */
        arm('M176 224 Q152 192 150 158', 12) +
        arm('M216 224 Q240 192 244 160', 12) +
        '</g>' +
        head(200, 196, 17, -14) +
        /* 手中星芒 */
        '<circle class="fxfig-wisp" cx="150" cy="156" r="4" fill="' + GOLD + '" filter="url(#fgGlow)"/>' +
        '<circle class="fxfig-wisp" cx="244" cy="158" r="4" fill="' + GOLD + '" filter="url(#fgGlow)" style="animation-delay:.2s"/>';
    }
  };

  /* ---------- 十一、远行图：一人一剑，走向远山（转场/胜负） ---------- */
  FIG.walk = {
    dur: 3000,
    body: function () {
      return moon(308, 104, 70) +
        hills(300, INK, 0.16) +
        hills(336, INK, 0.3) +
        hills(372, INK, 0.5) +
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        /* 背身行路：袍摆被风带起 */
        robe(178, 176, 350, 0.94) +
        '<path class="fxfig-cloak" d="M204 186 C236 200 268 236 286 286 C258 268 226 250 200 246 Z" opacity=".9"/>' +
        head(176, 152, 19, 6) +
        /* 斗笠 */
        '<path d="M138 142 L214 142 C204 124 186 114 176 114 C166 114 148 124 138 142 Z"/>' +
        '<path d="M150 140 L202 140 L202 146 L150 146 Z" opacity=".6"/>' +
        /* 背后斜负的长剑 */
        '<g transform="rotate(38 190 210)">' +
        '<rect x="186" y="150" width="8" height="130" rx="3"/>' +
        '<path d="M180 150 L200 150 L200 158 L180 158 Z"/>' +
        '</g>' +
        /* 提囊的手臂 */
        arm('M162 190 Q146 220 152 250', 13) +
        '<ellipse cx="152" cy="258" rx="12" ry="15"/>' +
        '</g>' +
        /* 脚下尘土 */
        rep(8, function (i) {
          return '<ellipse class="fxfig-dust" cx="' + r2(120 + i * 22) + '" cy="' + r2(346 + (i % 3) * 8) +
            '" rx="' + r2(10 + i * 2) + '" ry="4" fill="' + INK + '" opacity=".22" style="animation-delay:' +
            r2(i * 0.1) + 's"/>';
        });
    }
  };

  /* ---------- 十二、护心图：张臂结界，六面镜盾 ---------- */
  FIG.shield = {
    dur: 2300,
    body: function () {
      return '<circle cx="200" cy="210" r="150" fill="url(#fgJade)" class="fxfig-wash"/>' +
        '<g fill="' + INK + '" filter="url(#fgInk)">' +
        '<path d="M158 376 C154 322 172 296 200 296 C228 296 246 322 242 376 Z"/>' +
        '<path d="M176 298 C168 258 170 222 182 194 L220 194 C232 224 232 260 224 298 Z"/>' +
        head(201, 172, 21, 0) +
        /* 双臂外张（结界） */
        arm('M184 208 Q142 214 116 240', 15) +
        arm('M220 208 Q262 214 288 240', 15) +
        '</g>' +
        /* 六面镜盾旋出 */
        rep(6, function (i) {
          return '<g class="fxfig-mirror" style="animation-delay:' + r2(i * 0.07) + 's">' +
            '<path d="M200 108 L234 172 L200 200 L166 172 Z" fill="' + JADE + '" opacity=".26" ' +
            'stroke="' + JADE + '" stroke-width="1.6" transform="rotate(' + (i * 60) + ' 200 210)"/>' +
            '</g>';
        }) +
        '<circle class="fxfig-ring" cx="200" cy="210" r="104" fill="none" stroke="' + GOLD +
        '" stroke-width="2.2" opacity=".7"/>' +
        '<circle class="fxfig-ring" cx="200" cy="210" r="128" fill="none" stroke="' + GOLD +
        '" stroke-width="1.2" opacity=".45" style="animation-delay:.12s"/>';
    }
  };

  /* ============================================================
   * 台词 + 印章
   * ============================================================ */
  var SEAL_CHAR = {
    wine: '酒', sword: '剑', scroll: '儒', lotus: '禅', rune: '道',
    mist: '妖', forge: '炼', thunder: '雷', star: '星', shield: '守',
    aura: '气', blood: '杀', flame: '炎', walk: '行', drink: '酒'
  };

  /* 竖排台词：每个字一个 span，逐字浮现 */
  function lineHTML(text) {
    if (!text) return '';
    var chars = String(text).split('').filter(function (c) { return c !== ' '; });
    return '<div class="fxfig-line">' + chars.map(function (c, i) {
      return '<span style="animation-delay:' + r2(0.34 + i * 0.11) + 's">' + c + '</span>';
    }).join('') + '</div>';
  }

  /* 朱砂方印：落下 + 印泥飞溅 */
  function sealHTML(ch) {
    if (!ch) return '';
    return '<div class="fxfig-seal"><span>' + ch + '</span>' +
      rep(8, function (i) {
        var a = (Math.PI * 2 / 8) * i;
        return '<i style="--dx:' + r2(Math.cos(a) * (16 + i % 3 * 9)) + 'px;--dy:' +
          r2(Math.sin(a) * (16 + i % 3 * 9)) + 'px"></i>';
      }) + '</div>';
  }

  /* ============================================================
   * 图层管理
   * ============================================================ */
  var host = null;
  var queue = [];
  var busy = false;
  var CSS_INJECTED = false;

  function layer() {
    if (host && host.isConnected !== false) return host;
    host = document.getElementById('figfx');
    if (!host) {
      host = document.createElement('div');
      host.id = 'figfx';
      (document.body || document.documentElement).appendChild(host);
    }
    return host;
  }

  var CSS = [
    '#figfx{position:fixed;inset:0;z-index:44;pointer-events:none;overflow:hidden;display:flex;' +
    'align-items:center;justify-content:center;}',

    /* 单幅画：整体进出 */
    '.fxfig{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
    'opacity:0;animation:fxfigIn var(--dur,2.6s) cubic-bezier(.2,.7,.3,1) forwards;}',
    '@keyframes fxfigIn{0%{opacity:0;transform:scale(.9) translateY(18px);filter:blur(6px);}' +
    '14%{opacity:1;transform:scale(1) translateY(0);filter:blur(0);}' +
    '78%{opacity:1;transform:scale(1.012);}' +
    '100%{opacity:0;transform:scale(1.05);filter:blur(3px);}}',
    '.fxfig svg{width:min(78vh,86vw);height:min(78vh,86vw);overflow:visible;}',

    /* 背景底衬：让剪影从画面里浮出来 */
    '.fxfig-veil{position:absolute;inset:0;opacity:0;animation:fxfigVeil var(--dur,2.6s) ease forwards;}',
    '@keyframes fxfigVeil{0%{opacity:0;}16%{opacity:1;}76%{opacity:1;}100%{opacity:0;}}',

    /* 月与雾的呼吸 */
    '.fxfig-moon{animation:fxfigBreath var(--dur,2.6s) ease-in-out infinite;}',
    '@keyframes fxfigBreath{0%,100%{opacity:.72;}50%{opacity:1;}}',
    '.fxfig-moondisc{animation:fxfigBreath 3.4s ease-in-out infinite;}',
    '.fxfig-wash{animation:fxfigBreath 2.2s ease-in-out infinite;}',
    '.fxfig-mist{opacity:0;animation:fxfigMist var(--dur,2.6s) ease-out forwards;}',
    '@keyframes fxfigMist{0%{opacity:0;transform:scale(.6);}30%{opacity:.22;}' +
    '75%{opacity:.2;transform:scale(1.1);}100%{opacity:0;transform:scale(1.24);}}',

    /* 饮酒图：仰头、倾壶、酒线、飘带 */
    '.fxfig-head{animation:fxfigHead var(--dur,2.6s) cubic-bezier(.3,.7,.3,1) forwards;}',
    '@keyframes fxfigHead{0%,20%{transform:rotate(0deg);}' +
    '58%,100%{transform:rotate(-9deg);}}',
    '.fxfig-gourd{animation:fxfigPour var(--dur,2.6s) cubic-bezier(.35,.6,.3,1) forwards;}',
    '@keyframes fxfigPour{0%,14%{transform:rotate(26deg);opacity:0;}' +
    '26%{opacity:1;transform:rotate(2deg);}' +
    '46%{transform:rotate(-6deg);}62%{transform:rotate(-16deg);}' +
    '80%{transform:rotate(-8deg);}100%{transform:rotate(-12deg);}}',
    '.fxfig-wine{stroke-dasharray:60;stroke-dashoffset:60;opacity:0;' +
    'animation:fxfigWine var(--dur,2.6s) ease-out forwards;}',
    '@keyframes fxfigWine{0%{opacity:0;stroke-dashoffset:60;}' +
    '30%{opacity:0;stroke-dashoffset:60;}' +
    '42%{opacity:1;stroke-dashoffset:0;}' +
    '80%{opacity:1;stroke-dashoffset:0;}100%{opacity:0;stroke-dashoffset:-14;}}',
    '.fxfig-drop{opacity:0;animation:fxfigDrop 1.5s ease-in forwards;}',
    '@keyframes fxfigDrop{0%{opacity:0;transform:translateY(-8px) scale(.4);}' +
    '45%{opacity:.95;transform:translateY(0) scale(1);}' +
    '100%{opacity:0;transform:translateY(26px) scale(.5);}}',
    '.fxfig-breath{stroke-dasharray:44;stroke-dashoffset:44;opacity:0;' +
    'animation:fxfigBreathLine var(--dur,2.6s) ease-out forwards .8s;}',
    '@keyframes fxfigBreathLine{0%{opacity:0;stroke-dashoffset:44;}30%{opacity:.55;stroke-dashoffset:0;}' +
    '100%{opacity:0;stroke-dashoffset:-20;}}',
    /* 飘带绕「根部」摆动。旧版飘带向左飘出，旋转中心在右端；新版自头部向右上（月亮方向）
       飘出，故旋转中心改到左端。两条周期/幅度/延迟各不相同，避免同频摆动显得机械。 */
    /* 旋转中心用 view-box 绝对值锚到飘带根部：stroke 元素的 fill-box 不含线宽，会偏。 */
    '.fxfig-ribbon{animation:fxfigRibbon 1.9s ease-in-out infinite;transform-box:view-box;' +
    'transform-origin:200px 60px;}',
    '@keyframes fxfigRibbon{0%,100%{transform:rotate(0) translateX(0);}' +
    '50%{transform:rotate(-6deg) translateX(-4px);}}',
    '.fxfig-ribbon2{animation:fxfigRibbon2 2.6s ease-in-out infinite .35s;transform-box:view-box;' +
    'transform-origin:203px 74px;}',
    '@keyframes fxfigRibbon2{0%,100%{transform:rotate(0) translateX(0);}' +
    '50%{transform:rotate(-3.5deg) translateX(-2px);}}',
    /* 腰带飘带：自腰向右下甩，摆动方向与头巾相反，上下呼应 */
    '.fxfig-sash{animation:fxfigSash 2.2s ease-in-out infinite .15s;transform-box:view-box;' +
    'transform-origin:208px 240px;}',
    '@keyframes fxfigSash{0%,100%{transform:rotate(0) translateY(0);}' +
    '50%{transform:rotate(4deg) translateY(-3px);}}',
    '.fxfig-pool{opacity:0;animation:fxfigPool var(--dur,2.6s) ease-out forwards;}',
    '@keyframes fxfigPool{0%{opacity:0;transform:scaleX(.2);}60%{opacity:.18;transform:scaleX(1);}' +
    '100%{opacity:0;transform:scaleX(1.1);}}',

    /* 出剑图：落剑、白痕 */
    '.fxfig-blade{animation:fxfigSlash var(--dur,2.2s) cubic-bezier(.2,.8,.25,1) forwards;}',
    '@keyframes fxfigSlash{0%,10%{transform:rotate(58deg);opacity:0;}' +
    '24%{opacity:1;transform:rotate(46deg);}' +
    '46%{transform:rotate(-6deg);}58%{transform:rotate(4deg);}100%{transform:rotate(0deg);}}',
    '.fxfig-arc{stroke-dasharray:520;stroke-dashoffset:520;opacity:0;' +
    'animation:fxfigArc var(--dur,2.2s) ease-out forwards;}',
    '@keyframes fxfigArc{0%{opacity:0;stroke-dashoffset:520;}' +
    '44%{opacity:0;stroke-dashoffset:520;}' +
    '62%{opacity:1;stroke-dashoffset:0;}' +
    '84%{opacity:.9;stroke-dashoffset:0;}100%{opacity:0;stroke-dashoffset:-60;}}',
    '.fxfig-arc2{stroke-dasharray:520;stroke-dashoffset:520;opacity:0;' +
    'animation:fxfigArc var(--dur,2.2s) ease-out forwards .1s;}',

    /* 剑雨 */
    '.fxfig-rain{animation:fxfigRain 1.5s cubic-bezier(.4,0,.9,1) forwards;}',
    '@keyframes fxfigRain{0%{opacity:0;transform:translateY(-40px);}' +
    '14%{opacity:1;}100%{transform:translateY(520px);opacity:0;}}',

    /* 展卷 */
    '.fxfig-scroll{opacity:0;animation:fxfigScroll var(--dur,2.7s) cubic-bezier(.25,.8,.3,1) forwards;}',
    '@keyframes fxfigScroll{0%{opacity:0;transform:scaleX(0) ;}' +
    '26%{opacity:1;transform:scaleX(.5);}' +
    '52%{opacity:1;transform:scaleX(1.04);}64%{transform:scaleX(1);}' +
    '100%{opacity:0;transform:scaleX(1.02) translateY(-8px);}}',
    '.fxfig-wisp{opacity:0;animation:fxfigWisp 1.9s ease-out forwards;}',
    '@keyframes fxfigWisp{0%{opacity:0;transform:translateY(6px) scale(.3);}' +
    '35%{opacity:.8;transform:translateY(-6px) scale(1);}' +
    '100%{opacity:0;transform:translateY(-42px) scale(.4);}}',

    /* 莲华 */
    '.fxfig-petal{opacity:0;animation:fxfigPetal var(--dur,2.8s) cubic-bezier(.2,.8,.3,1) forwards;' +
    'transform-box:fill-box;transform-origin:50% 100%;}',
    '@keyframes fxfigPetal{0%{opacity:0;transform:scale(.1) rotate(-24deg);}' +
    '45%{opacity:1;transform:scale(1.06) rotate(2deg);}' +
    '64%{transform:scale(1) rotate(0);}100%{opacity:0;transform:scale(1.14) rotate(3deg);}}',
    '.fxfig-p-back{filter:blur(1.4px);}',
    '.fxfig-halo{opacity:0;animation:fxfigHalo var(--dur,2.8s) ease-out forwards;}',
    '@keyframes fxfigHalo{0%{opacity:0;transform:scale(.4);}40%{opacity:.75;transform:scale(1);}' +
    '100%{opacity:0;transform:scale(1.3);}}',

    /* 太极 */
    '.fxfig-taiji{animation:fxfigSpin var(--dur,2.8s) cubic-bezier(.3,.7,.3,1) forwards;}',
    '@keyframes fxfigSpin{0%{transform:rotate(-160deg) scale(.4);opacity:0;}' +
    '30%{opacity:1;transform:rotate(0deg) scale(1);}' +
    '100%{transform:rotate(340deg) scale(1);opacity:.9;}}',
    '.fxfig-qing{opacity:0;animation:fxfigQing var(--dur,2.8s) ease-out forwards;}',
    '@keyframes fxfigQing{0%{opacity:0;transform:translateY(14px);}' +
    '34%{opacity:var(--qo,.9);transform:translateY(0);}' +
    '100%{opacity:0;transform:translateY(-6px);}}',
    '.fxfig-qing-l{--qo:.4;animation-delay:.14s;}',
    '.fxfig-qing-r{--qo:.4;animation-delay:.28s;}',
    '.fxfig-runechar{opacity:0;animation:fxfigRune var(--dur,2.8s) ease-out forwards;}',
    '@keyframes fxfigRune{0%{opacity:0;transform:translateY(8px) scale(.6);}' +
    '40%{opacity:.9;transform:translateY(0) scale(1);}' +
    '100%{opacity:0;transform:translateY(-16px) scale(1.1);}}',

    /* 妖兽 */
    '.fxfig-eye{opacity:0;animation:fxfigEye var(--dur,2.7s) ease-out forwards;}',
    '@keyframes fxfigEye{0%{opacity:0;}42%{opacity:0;}' +
    '56%{opacity:1;}88%{opacity:1;}100%{opacity:0;}}',
    '.fxfig-breath2{opacity:0;animation:fxfigBreath2 1.8s ease-out forwards;}',
    '@keyframes fxfigBreath2{0%{opacity:0;transform:translate(0,0) scale(.3);}' +
    '40%{opacity:.32;transform:translate(-14px,-10px) scale(1);}' +
    '100%{opacity:0;transform:translate(-30px,-22px) scale(1.5);}}',

    /* 祭剑 */
    '.fxfig-fire{opacity:0;animation:fxfigFire 1.5s ease-in-out infinite;}',
    '@keyframes fxfigFire{0%,100%{opacity:.26;transform:scale(.92);}' +
    '50%{opacity:.6;transform:scale(1.08);}}',
    '.fxfig-blank{animation:fxfigBlank var(--dur,2.6s) ease-in-out forwards;}',
    '@keyframes fxfigBlank{0%,100%{fill:#ff7a2a;}' +
    '46%{fill:#ffd9a0;}52%{fill:#fff;}58%{fill:#ffd9a0;}}',
    '.fxfig-hammer{animation:fxfigHammer var(--dur,2.6s) cubic-bezier(.4,0,.3,1) forwards;}',
    '@keyframes fxfigHammer{0%,18%{transform:rotate(-52deg);}' +
    '38%{transform:rotate(6deg);}46%{transform:rotate(0deg);}' +
    '56%{transform:rotate(-38deg);}100%{transform:rotate(-30deg);}}',
    '.fxfig-spark{opacity:0;animation:fxfigSpark 1.1s ease-out forwards;}',
    '@keyframes fxfigSpark{0%{opacity:0;transform:translate(0,0) scale(.4);}' +
    '20%{opacity:1;}' +
    '100%{opacity:0;transform:translate(var(--dx,20px),var(--dy,-40px)) scale(.2);}}',

    /* 雷法 */
    '.fxfig-bolt{opacity:0;animation:fxfigBolt .7s ease-out forwards;}',
    '@keyframes fxfigBolt{0%{opacity:0;}12%{opacity:1;}24%{opacity:.2;}' +
    '36%{opacity:1;}70%{opacity:.9;}100%{opacity:0;}}',
    '.fxfig-shard{opacity:0;animation:fxfigShard .8s ease-out forwards;' +
    'transform-box:fill-box;transform-origin:0 50%;}',
    '@keyframes fxfigShard{0%{opacity:0;transform:rotate(var(--ang,0deg)) scaleX(.2);}' +
    '25%{opacity:1;transform:rotate(var(--ang,0deg)) scaleX(1);}' +
    '100%{opacity:0;transform:rotate(var(--ang,0deg)) scaleX(1.6) translateX(24px);}}',

    /* 观星 */
    '.fxfig-starline{stroke-dasharray:320;stroke-dashoffset:320;opacity:0;' +
    'animation:fxfigStarline var(--dur,2.8s) ease-out forwards;}',
    '@keyframes fxfigStarline{0%{opacity:0;stroke-dashoffset:320;}' +
    '36%{opacity:.8;stroke-dashoffset:0;}100%{opacity:0;stroke-dashoffset:-40;}}',
    '.fxfig-stardot{opacity:0;animation:fxfigStardot var(--dur,2.8s) ease-in-out forwards;}',
    '@keyframes fxfigStardot{0%{opacity:0;transform:scale(.3);}' +
    '40%{opacity:1;transform:scale(1);}70%{opacity:.7;transform:scale(1);}' +
    '100%{opacity:0;transform:scale(.5);}}',

    /* 远行 */
    '.fxfig-cloak{animation:fxfigCloak 2.2s ease-in-out infinite;transform-box:fill-box;' +
    'transform-origin:0% 20%;}',
    '@keyframes fxfigCloak{0%,100%{transform:rotate(0) scaleX(1);}' +
    '50%{transform:rotate(-3.5deg) scaleX(1.06);}}',
    '.fxfig-dust{opacity:0;animation:fxfigDust 1.7s ease-out forwards;}',
    '@keyframes fxfigDust{0%{opacity:0;transform:translate(0,0) scale(.4);}' +
    '40%{opacity:.24;transform:translate(-12px,-6px) scale(1);}' +
    '100%{opacity:0;transform:translate(-30px,-16px) scale(1.6);}}',

    /* 护心 */
    '.fxfig-mirror{opacity:0;animation:fxfigMirror var(--dur,2.3s) cubic-bezier(.2,.8,.3,1) forwards;' +
    'transform-box:fill-box;transform-origin:50% 50%;}',
    '@keyframes fxfigMirror{0%{opacity:0;transform:rotate(0deg) scale(.2);}' +
    '40%{opacity:1;transform:rotate(120deg) scale(1.06);}' +
    '60%{transform:rotate(60deg) scale(1);}100%{opacity:0;transform:rotate(70deg) scale(1.1);}}',
    '.fxfig-ring{opacity:0;animation:fxfigRing var(--dur,2.3s) ease-out forwards;' +
    'transform-box:fill-box;transform-origin:50% 50%;}',
    '@keyframes fxfigRing{0%{opacity:0;transform:scale(.3) rotate(-40deg);}' +
    '42%{opacity:.8;transform:scale(1) rotate(0);}' +
    '100%{opacity:0;transform:scale(1.18) rotate(24deg);}}',

    /* 台词：竖排、逐字浮现、书法体 */
    '.fxfig-line{position:absolute;right:6.5vw;top:50%;transform:translateY(-50%);' +
    'display:flex;flex-direction:column;gap:.22em;color:' + GOLD + ';' +
    'font-family:STKaiti,KaiTi,STSong,Sarasa Gothic SC,serif;' +
    'font-size:clamp(26px,4.4vh,46px);line-height:1.06;letter-spacing:.1em;' +
    'text-shadow:0 0 18px rgba(232,198,106,.55),0 2px 10px rgba(0,0,0,.9);}',
    '.fxfig-line span{opacity:0;display:block;animation:fxfigChar 1.9s cubic-bezier(.2,.8,.3,1) forwards;}',
    '@keyframes fxfigChar{0%{opacity:0;transform:translateY(16px) scale(1.5);filter:blur(8px);}' +
    '30%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}' +
    '80%{opacity:1;}100%{opacity:0;transform:translateY(-8px);filter:blur(3px);}}',
    '@media (max-aspect-ratio:3/4){.fxfig-line{right:auto;left:50%;top:auto;bottom:5vh;' +
    'transform:translateX(-50%);flex-direction:row;font-size:clamp(20px,3vh,30px);}}',

    /* 朱砂印：右下角落款 */
    '.fxfig-seal{position:absolute;right:6vw;bottom:11vh;width:clamp(52px,8vh,78px);' +
    'height:clamp(52px,8vh,78px);border:3px solid ' + CINNABAR + ';border-radius:6px;' +
    'display:flex;align-items:center;justify-content:center;opacity:0;' +
    'animation:fxfigSeal var(--dur,2.6s) cubic-bezier(.2,.9,.3,1) forwards .55s;' +
    'box-shadow:0 0 22px rgba(192,57,43,.4) inset;}',
    '.fxfig-seal span{color:' + CINNABAR + ';font-family:STKaiti,KaiTi,serif;' +
    'font-size:clamp(28px,4.6vh,44px);font-weight:700;' +
    'text-shadow:0 0 10px rgba(192,57,43,.5);}',
    '@keyframes fxfigSeal{0%{opacity:0;transform:scale(2.1) rotate(-16deg);filter:blur(6px);}' +
    '18%{opacity:1;transform:scale(1) rotate(-6deg);filter:blur(0);}' +
    '26%{transform:scale(1.06) rotate(-4deg);}34%{transform:scale(1) rotate(-6deg);}' +
    '82%{opacity:1;}100%{opacity:0;transform:scale(1.04) rotate(-6deg);}}',
    '.fxfig-seal i{position:absolute;left:50%;top:50%;width:5px;height:5px;border-radius:50%;' +
    'background:' + CINNABAR + ';opacity:0;animation:fxfigInkSplash .9s ease-out forwards .6s;}',
    '@keyframes fxfigInkSplash{0%{opacity:0;transform:translate(-50%,-50%) scale(.3);}' +
    '25%{opacity:.85;}' +
    '100%{opacity:0;transform:translate(calc(-50% + var(--dx,10px)),calc(-50% + var(--dy,10px))) scale(1.3);}}'
  ].join('\n');

  function injectCSS() {
    if (CSS_INJECTED) return;
    CSS_INJECTED = true;
    var s = document.createElement('style');
    s.id = 'figfx-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* 底衬：一层很淡的暗色/暖色遮罩，让水墨剪影浮出来 */
  var VEIL = {
    drink: 'radial-gradient(ellipse at 50% 45%, rgba(60,34,10,.34), rgba(8,6,4,.72) 72%)',
    sword: 'radial-gradient(ellipse at 50% 45%, rgba(10,26,40,.34), rgba(4,6,10,.74) 72%)',
    swordrain: 'linear-gradient(180deg, rgba(6,18,32,.2), rgba(4,8,14,.76))',
    scroll: 'radial-gradient(ellipse at 50% 48%, rgba(58,44,20,.28), rgba(10,8,5,.72) 74%)',
    lotus: 'radial-gradient(ellipse at 50% 44%, rgba(48,26,40,.3), rgba(10,6,10,.72) 74%)',
    taiji: 'radial-gradient(ellipse at 50% 46%, rgba(20,30,26,.3), rgba(5,9,7,.74) 74%)',
    beast: 'radial-gradient(ellipse at 50% 50%, rgba(24,34,28,.34), rgba(6,9,8,.78) 72%)',
    forge: 'radial-gradient(ellipse at 42% 60%, rgba(70,28,6,.4), rgba(8,5,3,.78) 72%)',
    thunder: 'radial-gradient(ellipse at 50% 40%, rgba(12,26,46,.4), rgba(4,6,12,.78) 72%)',
    star: 'radial-gradient(ellipse at 50% 40%, rgba(10,16,36,.5), rgba(3,5,10,.82) 74%)',
    walk: 'radial-gradient(ellipse at 46% 46%, rgba(30,26,18,.3), rgba(6,6,6,.76) 74%)',
    shield: 'radial-gradient(ellipse at 50% 48%, rgba(12,32,44,.34), rgba(4,8,12,.74) 74%)'
  };

  /* ---------- 播放 ---------- */
  function render(name, opt) {
    var fig = FIG[name];
    if (!fig) return null;
    injectCSS();
    opt = opt || {};
    var dur = (opt.dur || fig.dur || 2600) / 1000;

    var box = document.createElement('div');
    box.className = 'fxfig';
    box.style.setProperty('--dur', dur + 's');

    var veil = document.createElement('div');
    veil.className = 'fxfig-veil';
    veil.style.background = VEIL[name] || VEIL.walk;
    box.appendChild(veil);

    var svg = '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" ' +
      'xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet">' +
      DEFS + (typeof fig.body === 'function' ? fig.body(opt) : fig.body) + '</svg>';
    box.innerHTML += svg;

    box.insertAdjacentHTML('beforeend', lineHTML(opt.line));
    box.insertAdjacentHTML('beforeend', sealHTML(opt.seal || SEAL_CHAR[name] || ''));

    layer().appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, dur * 1000 + 260);
    return box;
  }

  /* 排队：同一时刻只放一幅，避免叠成一团 */
  function play(name, opt) {
    /* 技能数据用的是原始标签（blood/aura/rune/mist/flame…），
     * 必须先经 map 归一到 FIG 的规范名（sword/walk/taiji/beast/forge…），
     * 否则这些标签查不到 FIG[name] 会被静默丢弃，旗舰角色的「画意」整幅不显示。 */
    var MAP = (global.FigFx && global.FigFx.map) || null;
    if (MAP && MAP[name]) name = MAP[name];
    if (!FIG[name]) return null;
    if (!layer()) return null;
    queue.push({ name: name, opt: opt || {} });
    pump();
    return true;
  }
  function pump() {
    if (busy || !queue.length) return;
    var job = queue.shift();
    busy = true;
    render(job.name, job.opt);
    var dur = (job.opt.dur || FIG[job.name].dur || 2600);
    /* 允许下一幅在 62% 处入场，形成轻微叠化 */
    setTimeout(function () { busy = false; pump(); }, dur * 0.62);
  }

  /* 立即清场 */
  function clear() {
    queue.length = 0; busy = false;
    var L = layer(); if (L) L.innerHTML = '';
  }

  /* 图鉴：给设置/调试用 */
  function list() { return Object.keys(FIG); }

  global.FigFx = {
    play: play,
    clear: clear,
    list: list,
    /* 技能特效 -> 图案名 */
    map: {
      wine: 'drink', drink: 'drink',
      sword: 'sword', blood: 'sword',
      swordrain: 'swordrain',
      scroll: 'scroll',
      lotus: 'lotus',
      rune: 'taiji',
      mist: 'beast',
      forge: 'forge',
      thunder: 'thunder',
      star: 'star',
      shield: 'shield',
      aura: 'walk',
      flame: 'forge',
      walk: 'walk'
    },
    SEAL_CHAR: SEAL_CHAR
  };
})(typeof window !== 'undefined' ? window : this);
