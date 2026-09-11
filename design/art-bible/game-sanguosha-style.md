# 《剑来》对战页 · 视觉风格升级方案

> 参考：三国杀小程序对战截图（纯深蓝灰扁平背景、四角小头像座位、中间舞台战报、底部自己区大立绘+手牌+技能）。
> 目标：把三国杀的**布局骨架**嫁接到《剑来》的**古风铁律**上——金 `#e8c66a` / 赭石 / 墨黑 / 土黄 + 水墨写意。
> 质感边界（关键）：本游戏为**游戏产品**，用户明确允许**适度质感**——金色描边、暗角(vignette)、光影(含辉光/微光)；**唯一硬约束：绝对不用 emoji**。「去 AI 化 = 无渐变无光晕」那套**仅适用于 CRM 原型，不适用于本游戏**。
> 范围：仅视觉方案，不改 `game.wxml` / `game.js`；所有 WXSS 片段供开发落地。

---

## 0. 设计意图与对参考图的「刻意偏离」

| 三国杀参考 | 《剑来》落地决策 | 原因 |
|---|---|---|
| 深蓝灰扁平背景 | 墨黑 `#14110f` + 暗角 vignette | 古风铁律要求金/赭石/墨黑/土黄；冷蓝灰不用，暗角属允许质感 |
| 当前行动=绿色发光边框 | 金边 `3rpx` + 金底横幅 + 微光 | 金=自己/当前语义；微光作「光影」质感允许 |
| 势力红/蓝实色条 | 敌朱砂 / 友竹青 / 自己金 / 中立土黄 | 在古风色板内表达归属 |
| 血量豆 | 平涂「气血」文字徽 + 平涂血条（旧渐变亦可保留作水墨） | 去写实光效，但水墨渐变允许 |
| 手牌大尺寸+插画 | 保留大尺寸，插画区用招式签名/水墨占位 | 同参考 |

**布局不重做**：四角站位、两步出牌、手牌折叠、战报收起已落地，本方案只升级视觉，并补齐文策渊新增的 class。

---

## 1. 色彩 Token

> 定义在 `page`（或 `.game`）作用域，全页复用。势力色由 `style="--fac:{{item.col}}"` 注入到座位卡。
> `--gold-rgb` 用于所有「金色的低透明描边/辉光」，避免 iPhone P3 下低透明金变紫（见 §5.2）。

```css
page, .game {
  /* —— 画布 —— */
  --bg:        #14110f;   /* 墨黑 背景基底 */
  --bg-2:      #1d1712;   /* 卡面 / 面板底色 */
  --bg-3:      #211b16;   /* 牌面 / 次级面板 */
  --bg-line:   #3a2f23;   /* 分割线 / 弱边框（赭墨） */

  /* —— 文字色阶 —— */
  --ink:       #e8e0d2;   /* 主文字 宣纸白 */
  --ink-2:     #b8ac98;   /* 次级文字 */
  --ink-3:     #8a7e6c;   /* 三级 / 弱提示 */

  /* —— 金系 —— */
  --gold:      #e8c66a;   /* 金 主强调（自己 / 当前行动），实色使用 */
  --gold-deep: #c9a24b;   /* 暗金 次强调 / 描边 */
  --gold-solid:#b9892f;   /* 实色暗金：描边/低透明金边的防变紫基色 */
  --gold-rgb:  185,137,47;/* #b9892f 的 RGB，供 rgba(var(--gold-rgb), a) 复用 */

  /* —— 古风语义色 —— */
  --ochre:     #9c6b3f;   /* 赭石 */
  --earth:     #8a7e6c;   /* 土黄 / 灰褐（中性） */

  /* —— 势力色（注入 --fac 时取其一） —— */
  --fac-enemy: #a8412e;   /* 敌 朱砂赭红 */
  --fac-mate:  #5e8c6a;   /* 友 竹青 */
  --fac-self:  #e8c66a;   /* 自己 金 */
  --fac-neutral:#8a7e6c;  /* 中立 土黄灰 */

  /* —— 当前行动高亮（替代三国杀绿色辉光） —— */
  --current:        #e8c66a;  /* 金边 */
  --current-banner: #241c08;  /* 横幅底 暗金咖 */

  /* —— 阵亡灰度 —— */
  --dead-opacity: .42;
  --dead-filter:  grayscale(1);

  /* —— 状态语义 —— */
  --hp:   #b0492f;   /* 气血（平涂；旧 linear-gradient 亦可保留作水墨） */
  --heal: #79e6a0;
  --hit:  #ff8a6b;

  /* —— 安全区 —— */
  --safe-top:    env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left:   env(safe-area-inset-left, 0px);
  --safe-right:  env(safe-area-inset-right, 0px);
}
```

---

## 2. 字号 / 尺寸 Token

```css
/* 通用 */
--r-card: 14rpx;   /* 卡片圆角 */
--r-sm:   10rpx;   /* 小元素圆角 */
--gap:    12rpx;   /* 通用间距 */
--gap-lg: 16rpx;

/* 座位卡 .seat（参考三国杀小头像卡，竖立绘 ≈ 3:4） */
--seat-w:        120rpx;
--seat-h:        160rpx;
--seat-portrait-h: 100rpx;   /* 头像区占比 ~62% */
--seat-fac-h:    26rpx;      /* 顶部势力条高 */
--seat-name-h:   28rpx;

/* 自己区 .my-card */
--my-w:          160rpx;     /* 卡宽 */
--my-portrait-h: 220rpx;     /* 竖向大立绘（偏竖） */
--my-extra-h:    56rpx;      /* 怒气/装备铭牌区 */

/* 手牌 .card（大尺寸，竖牌 ≈ 0.72） */
--card-w:   132rpx;
--card-h:   184rpx;
--card-head-h: 30rpx;        /* 花色点数区 */
--card-art-h:  92rpx;        /* 插画区 */
--card-foot-h: 30rpx;        /* 牌名区 */
--card-point: 30rpx;         /* 点数圆直径 */
--card-radius: 12rpx;

/* 技能按钮 .skill */
--skill-h:    60rpx;
--skill-pad:  0 22rpx;
--skill-radius: 10rpx;

/* 舞台 .stage */
--stage-top:    200rpx;
--stage-side:   150rpx;
--stage-bottom: 250rpx;

/* 字号（rpx） */
--fs-phase:  24rpx;  --fs-name: 22rpx;  --fs-fac: 18rpx;
--fs-hp:     18rpx;  --fs-dead: 36rpx;  --fs-card-name: 28rpx;
--fs-skill:  24rpx;  --fs-log:  20rpx;  --fs-sc-name: 28rpx;
```

---

## 3. 关键组件样式草案

> 给出 token 与关键选择器；未写死的细节（如个别 padding）开发可微调。
> 本游戏允许适度质感：金色描边、暗角、光影（含辉光/微光）。辉光一律用 `rgba(var(--gold-rgb), a)` 以规避 iPhone 变紫（§5.2）。

### 3.1 `.battlefield` 背景（暗角保留）
```css
.battlefield { position:relative; flex:1; overflow:hidden; background: var(--bg); }
/* 暗角 vignette（用户允许，保留既有氛围）： */
.game { background: radial-gradient(circle at 50% -10%, #2a2118 0%, #14110f 60%); }
/* 备选（若想更平）：background: var(--bg); */
```

### 3.2 `.seat` 座位卡（势力条 / 血量 / 阵亡 / 当前行动 / 目标）
```css
.seat {
  position:relative; width:var(--seat-w); height:var(--seat-h);
  background:var(--bg-2); border:2rpx solid var(--bg-line);
  border-radius:var(--r-card); padding:0; box-sizing:border-box; overflow:hidden;
}
/* 当前行动：实色金边 + 微光（光影质感，允许）；辉光用 --gold-rgb 防变紫 */
.seat.current   { border:3rpx solid var(--gold); box-shadow:0 0 16rpx rgba(var(--gold-rgb), .4); }
.seat.clickable { border-color:var(--gold-deep); box-shadow:0 0 14rpx rgba(var(--gold-rgb), .35); } /* 可点目标 */
.seat.dead      { opacity:var(--dead-opacity); filter:var(--dead-filter); }

/* 势力条（顶部贴边，实色块 + 阵营名，表达敌/友/中立） */
.seat-fac {
  position:absolute; left:0; right:0; top:0; height:var(--seat-fac-h);
  background:var(--fac); color:#f3ead2;                       /* var(--fac) 由 wxml 注入 */
  font-size:var(--fs-fac); line-height:var(--seat-fac-h);
  text-align:center; letter-spacing:2rpx; z-index:2;
}
.seat-portrait { width:100%; height:100%; }
.seat-img { width:100%; height:100%; }
.seat-name {
  position:absolute; left:0; bottom:0; width:100%;
  background:rgba(0,0,0,.6); color:#f3ead2; font-size:var(--fs-name);
  padding:4rpx 8rpx; box-sizing:border-box;
}
/* 气血：平涂实色徽；旧 linear-gradient 亦可作为水墨质感保留 */
.seat-hp {
  position:absolute; left:6rpx; bottom:30rpx; font-size:var(--fs-hp);
  padding:2rpx 8rpx; border-radius:6rpx; background:var(--hp); color:#fff; z-index:2;
}
/* 阵亡态 + 次级「已离开」标签 */
.seat-dead {
  position:absolute; inset:0; z-index:3; display:flex; flex-direction:column;
  align-items:center; justify-content:center; background:rgba(0,0,0,.5);
  font-size:var(--fs-dead); color:#fff; font-weight:900; letter-spacing:12rpx;
}
.seat-left-tag {
  font-size:16rpx; letter-spacing:4rpx; color:var(--ink-3);   /* 弱化、次级 */
  font-weight:400; margin-top:6rpx;
}
/* 当前行动标签：仅透明度脉冲（不靠辉光吸睛） */
@keyframes beat { 0%,100%{opacity:1} 50%{opacity:.55} }
.seat-thinking {                                     /* AI 回合：行棋中 */
  position:absolute; right:6rpx; top:32rpx; z-index:3;
  padding:2rpx 10rpx; border-radius:20rpx; font-size:18rpx; font-weight:bold;
  border:1rpx solid var(--gold); color:var(--gold); background:transparent;
  animation:beat 1.4s ease-in-out infinite;
}
.seat-turn {                                        /* 自己回合：最强提示（实色金底） */
  position:absolute; right:6rpx; top:32rpx; z-index:4;
  padding:4rpx 12rpx; border-radius:8rpx; font-size:20rpx; font-weight:bold;
  background:var(--gold); color:var(--current-banner);
}
.seat-tgt {                                         /* ▼ 几何三角，非 emoji，原样式保留 */
  position:absolute; right:6rpx; top:50%; transform:translateY(-50%);
  color:var(--gold); font-size:24rpx; z-index:2;
}
```

### 3.3 `.my-card` 自己区（竖向大立绘 / 血条 / 怒气·装备铭牌）
```css
.my-card {
  width:var(--my-w); flex:0 0 var(--my-w);
  background:var(--bg-2); border:2rpx solid var(--bg-line);
  border-radius:var(--r-card); padding:8rpx; box-sizing:border-box;
}
.my-card.dead { opacity:var(--dead-opacity); filter:var(--dead-filter); }
.my-portrait {
  position:relative; width:100%; height:var(--my-portrait-h);
  border-radius:var(--r-sm); overflow:hidden; background:var(--bg-3);
}
.my-img { width:100%; height:100%; }
.my-name {
  position:absolute; left:0; bottom:0; width:100%; background:rgba(0,0,0,.6);
  color:#f3ead2; font-size:var(--fs-name); padding:4rpx 8rpx; box-sizing:border-box;
}
/* 气血条（平涂；文策渊已在 wxml 补 .my-hpbar / .my-hpbar-fill，宽度 = s.me.hpPct） */
.my-hpbar { position:absolute; left:6rpx; right:6rpx; bottom:30rpx; height:8rpx;
  border-radius:4rpx; background:var(--bg); overflow:hidden; }
.my-hpbar-fill { height:100%; background:var(--hp); }      /* style="width:{{s.me.hpPct}}%" */
.my-hp { position:absolute; left:6rpx; bottom:42rpx; font-size:16rpx; color:#f3ead2; } /* 数字徽，与血条并存 */
.my-seat { position:absolute; right:6rpx; top:6rpx; font-size:18rpx; padding:2rpx 8rpx;
  border-radius:6rpx; background:var(--gold); color:var(--current-banner); }
.my-dead { position:absolute; inset:0; z-index:3; display:flex; align-items:center; justify-content:center;
  font-size:44rpx; color:#fff; font-weight:900; letter-spacing:16rpx; background:rgba(0,0,0,.5); }

/* 状态铭牌区：怒气 / 问剑 / 装备 */
.my-extra {
  display:flex; flex-direction:column; gap:4rpx; margin-top:8rpx;
  padding:6rpx 8rpx; background:var(--bg-3);
  border:1rpx solid var(--gold-deep); border-radius:var(--r-sm);   /* 金/墨 铭牌质感 */
}
.my-qi      { font-size:18rpx; color:var(--ink); }
.my-wenjian { font-size:16rpx; color:var(--gold); }     /* 问剑已饮 */
.my-equip   { font-size:16rpx; color:var(--ochre); }   /* 本命飞剑等 */
```

### 3.4 `.card` 手牌（大尺寸 / 花色点数区 / 插画区 / 牌名区）
```css
.card {
  position:relative; flex:0 0 var(--card-w); width:var(--card-w);
  background:var(--bg-3); border:2rpx solid var(--bg-line);
  border-radius:var(--card-radius); padding:8rpx; box-sizing:border-box;
}
.card.disabled { opacity:.35; }
/* 选中态：实色金边 + 抬升 + 微光（选中反馈，非 hover；光影质感允许）
   若想要更平的观感，可去掉 translateY / box-shadow，只用金边。 */
.card.sel {
  border:3rpx solid var(--gold); transform:translateY(-24rpx);
  box-shadow:0 8rpx 22rpx rgba(var(--gold-rgb), .45); z-index:6;
}
.cf-head { display:flex; align-items:center; gap:4rpx; font-size:var(--fs-name); font-weight:bold; }
.cf-point { width:var(--card-point); height:var(--card-point); border-radius:50%;
  background:var(--gold); color:var(--current-banner);    /* 点数圆：实色 */
  display:inline-flex; align-items:center; justify-content:center; font-size:16rpx; }
.cf-art { height:var(--card-art-h); display:flex; align-items:center; justify-content:center; }
.cf-sig { font-size:28rpx; color:var(--fac-mate); }        /* 招式签名 竹青 */
.cf-foot { font-size:16rpx; color:var(--ink-3); text-align:center; }
.cardback { flex:0 0 90rpx; width:90rpx; height:120rpx;
  /* 水墨渐变可保留作质感；此处给平涂备选 */
  background:linear-gradient(135deg,#3a2f23,#211b16); border:1rpx solid var(--gold-deep);
  border-radius:10rpx; display:flex; align-items:center; justify-content:center; color:var(--gold-deep); }
```

### 3.5 `.skills` 技能按钮区
```css
.skills { display:flex; gap:var(--gap); flex-wrap:wrap; }
.skill {
  height:var(--skill-h); padding:var(--skill-pad); display:inline-flex; align-items:center;
  border:1rpx solid var(--gold-deep); border-radius:var(--skill-radius);
  background:var(--bg-2); color:var(--gold); font-size:var(--fs-skill);
}
.skill.on { background:var(--gold); color:var(--current-banner); box-shadow:0 0 12rpx rgba(var(--gold-rgb), .4); } /* 激活：实色翻转 + 微光 */
```

### 3.6 `.stage` 中间舞台（当前出牌虚拟卡 + 战报）
```css
.stage {
  position:absolute; top:var(--stage-top); left:var(--stage-side); right:var(--stage-side);
  bottom:var(--stage-bottom); z-index:5;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
}
/* 当前出牌虚拟卡：宣纸质感 + 金边（可加微光） */
.stage-card {
  position:relative; width:200rpx; padding:12rpx 16rpx; box-sizing:border-box;
  background:#efe6d2; border:2rpx solid var(--gold-deep);   /* 宣纸暖白 */
  border-radius:var(--r-sm); text-align:center;
}
.stage-card::after { content:""; position:absolute; inset:4rpx;
  border:1rpx solid rgba(var(--gold-rgb), .5); border-radius:6rpx; }  /* 内描金线（用 --gold-rgb 防变紫） */
.sc-label { display:block; font-size:18rpx; color:var(--earth); letter-spacing:4rpx; }
.sc-name  { display:block; font-size:var(--fs-sc-name); color:#3a2f23; font-weight:bold; letter-spacing:2rpx; }
/* 牌库 / 弃牌 桩 */
.pile { width:120rpx; height:160rpx; border-radius:12rpx; background:var(--bg-3); border:1rpx solid var(--bg-line); }
.pile .n { color:var(--gold); }
/* 战报（浅色大字，平铺） */
.stage-log { width:100%; max-width:560rpx; background:rgba(0,0,0,.3); border-radius:12rpx; padding:12rpx 16rpx; }
.lg { font-size:var(--fs-log); line-height:1.6; color:var(--ink-2); }
.lg-big { color:var(--gold); } .lg-hit { color:var(--hit); }
.lg-heal { color:var(--heal); } .lg-sys { color:var(--fac-mate); }
```

---

## 4. 质感边界检查清单（本游戏专属）

> ⚠️ **边界更正**：用户明确——「去 AI 化 = 无渐变无光晕」那套**只适用于 CRM 原型，不适用于本游戏**。本游戏允许**适度质感**（金色描边、暗角、光影）。**唯一硬约束：绝对不用 emoji。** 下表据此重审既有效果，不再要求删除渐变/辉光。

| 效果 | 既有实现（game.wxss） | 判定 | 处理 |
|---|---|---|---|
| 暗角 vignette | `.game` radial-gradient 暗角 | ✅ 允许（用户点名） | 保留；中心亮度勿低于 `#1a1610` |
| 渐变质感 | `.seat-hp` / `.cardback` linear-gradient | ✅ 允许（水墨写意） | 保留；新增组件平涂亦可 |
| 辉光 / 光影 | `.seat.current`/`.clickable` box-shadow；`.card.sel` 辉光；`.skill.on` 微光 | ✅ 允许（光影） | 保留；克制、不过曝（blur ≤ 24rpx，α ≤ .45） |
| 选中抬升 | `.card.sel { translateY(-24rpx) }` | ✅ 允许（选中态，非 hover） | 保留作选中反馈 |
| emoji | 无（仅几何 `▼`/`▲`/`›`） | ✅ 无 | 严禁新增任何 emoji |
| 大 KPI 卡 | 对战页无 | ✅ 不涉及 | — |

**落盘前 grep 复核（唯一硬约束）**：`emoji` 字符（含 ❤ ⚔ 🗡 ✦ 等装饰符号）。渐变 / 辉光 / 抬升**不再作为禁止项**。

**质感克制建议（非硬约束，供美术把关）**：
- 辉光 blur ≤ 24rpx、α ≤ .45，避免过曝抢戏；
- 暗角中心亮度 ≥ `#1a1610`，边缘自然收；
- 金色描边/辉光优先用 `rgba(var(--gold-rgb), a)`（即 `--gold-solid` 的 RGB），防 iPhone P3 变紫（见 §5.2）。

---

## 5. 适配备注

### 5.1 iPhone 安全区
- `app.json` 页需全屏：`"window": { "navigationStyle": "custom" }`，并确保 viewport 已 `viewport-fit=cover`（微信默认全屏页即覆盖）。
- `.game` 加安全区内边距：
  ```css
  .game { padding-top:var(--safe-top); padding-bottom:var(--safe-bottom); }
  .topbar { padding-top:calc(12rpx + var(--safe-top)); }
  .seat-bottom { padding-bottom:calc(16rpx + var(--safe-bottom)); }
  ```
- 浮层 `.modal-mask` / `.result-mask`（`position:fixed; inset:0`）底部按钮需避让 home indicator：
  ```css
  .result { margin-bottom:var(--safe-bottom); }
  .rs-btns { padding-bottom:calc(24rpx + var(--safe-bottom)); }
  ```

### 5.2 iPhone 深色模式：低透明金边/金辉光变紫
> 此条与「去 AI 化」**无关**，是 iPhone P3 广色域 + iOS 合成的硬技术约束——即便允许辉光也必须遵守。
**根因**：金 `#c9a24b` / `#e8c66a` 以低 alpha 叠在墨黑上，在 P3 + iOS 合成下会去饱和偏紫/品红。
**对策**：
1. 所有「金色低透明」一律用 `--gold-rgb`（即实色暗金 `#b9892f` 的 RGB），如 `rgba(var(--gold-rgb), .4)`；大面积实色描边用 `--gold-solid`。
   - 已落地：`.seat.current`/`.clickable`、`.card.sel`、`.skill.on`、`.stage-card::after` 均改用 `--gold-rgb`。
   - 待核：`.modal-frame::before/::after`（`rgba(201,162,75,.35)`→`rgba(var(--gold-rgb),.35)`）、`.rs-mvp-card` 系列 `rgba(255,225,160,.x)`→`rgba(var(--gold-rgb),.x)`、`.pickcard.on` 已实色可保留。
2. 锁死深色，阻止 iOS 自动反色：
   ```css
   page { color-scheme: dark; }   /* 不要写 prefers-color-scheme: light 分支 */
   ```
3. 真 OLED 可把 `--bg` 降到 `#0c0a08`（省电 + 更纯墨），按需。

---

## 6. 已知事项（非 debt，供排期参考）

- **`.my-hpbar` 元素已补**：文策渊已在 `.my-portrait` 内加 `.my-hpbar`/`.my-hpbar-fill`，宽度由 `s.me.hpPct`（engine.js playerView 已暴露）注入；本方案 §3.3 样式就绪，无需引擎改动。
- **全局特效性能**：`.gfx-slash` 用 `mix-blend-mode:screen` + 渐变（属「光影」，允许），需确认低性能机不掉帧；`≤2MB` 包体约束下，特效资源走 CDN/按需加载，不打包进主包。

---

## 7. 待主理人审批 / 开发落地点

1. **质感边界确认**：本游戏允许金色描边 / 暗角 / 光影（辉光、选中抬升均可保留），唯一硬约束 = 无 emoji；与 CRM 原型的「去 AI 化」规则明确区分。
2. 当前行动配色用**金**（非三国杀绿）确认符合古风铁律。
3. 势力四色取值（敌朱砂 `#a8412e` / 友竹青 `#5e8c6a` / 自己金 / 中立土黄）确认。
4. 血条（`.my-hpbar`）已随本轮补 wxml，样式就绪，无需引擎改动。
