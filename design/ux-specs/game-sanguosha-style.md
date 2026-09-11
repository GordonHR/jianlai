# 《剑来》微信小程序 · 对战页（三国杀风格）交互 / UX 升级规格

> 受众：engineering-lead（实施）、art-director（视觉对齐）
> 范围：仅表现层 `pages/game/game.wxml` + `game.wxss` + `game.js`；**不改动 `engine.js` 逻辑**，仅一处必要的新增状态字段（见 §6）。
> 参考：三国杀小程序对战截图（`C:\Users\Administrator\.workbuddy\clipboard-images\clipboard-2026-09-07T04-05-16-114Z-adf12926.png`）

---

## 0. 设计约束（铁律）

1. **去 AI 化**：无径向渐变光晕、无 emoji、无悬停抬升辉光、无大 KPI 卡；深色扁平背景，状态用「实线金边 + 角标 / 横幅」表达，不用 `box-shadow` 光晕。
2. **≤2MB 包体**：复用现有立绘（`D.artUrl`，无资源则显示阵营色占位「剑来」）与卡面字纹 `sig`（剑 / 守 / 丹 / 万…）；**不引入任何新图片资源**。卡面「大尺寸插画区」用 `sig` 大字 + 势力底色块承载，不用卡图。
3. **四角站位不变**：保持「上敌 / 左敌 / 右友 / 底自己」结构，仅放大卡体并补充字段层级。
4. **两步出牌 / 手牌折叠 / 战报收起**等已落地交互全部保留并增强。

---

## 1. 信息架构（IA）

### 1.1 四角座位卡字段优先级（高 → 低）

| 优先级 | 字段 | 来源 state 字段 | 呈现方式 |
|---|---|---|---|
| P0 | 立绘 / 头像 | `item.art`（空则占位「剑来」） | 卡内大图区 |
| P0 | 势力条 | `item.faction` + `item.rel` | 卡顶满宽色块条（见 §7.1） |
| P1 | 名字 | `item.name` | 卡底名牌（左对齐，势力色强调） |
| P1 | 号位 | `item.seatLabel`（一号位…四号位） | 右上角小标 |
| P1 | 血量豆 | `item.beans`（见 §4.5，由 `hp/maxHp` 派生） | 名牌上方一排小圆豆，前 `hp` 颗实心 |
| P2 | 当前行动态 | `item.isCurrent` + `item.ai` | 实线金边 + 「思考中 / 行棋中」横幅（AI 时） |
| P2 | 目标标记 | `item.canTarget` | 右侧 ▼ + 实线金边（选目标态） |
| P2 | 阵亡 / 离场态 | `item.dead` | 灰度 + 半透明大字「阵亡」覆盖 |
| P3 | 装备 | `item.equipName` | 卡底一行小字（有则显） |
| P3 | 阵营标签 | `item.sideLabel`（来犯之敌 / 同袍 / 巨寇） | 卡顶势力条下方细字（低密度，可省） |
| P3 | 手牌数 | `item.handCount` | 对手卡角标「手牌 N」（仅敌/友卡） |

### 1.2 自己区信息分区（底栏，左卡 + 右操作区）

| 分区 | 内容 | 来源 |
|---|---|---|
| 大立绘 | 立绘 / 头像（放大） | `s.me.art` |
| 身份条 | 势力条 + 名字 + 号位 + 境界 | `s.me.faction/rel/name/seatLabel/realm` |
| 气血区 | 血量豆 + 数值 | `s.me.beans` + `s.me.hp`/`maxHp` |
| 资源区（血·怒·装） | 剑气槽（怒气位）+ 饮者标记 + 装备位 | `s.me.attackUsed/attackLimit`（→`ragePct`）、`s.me.wineActive`、`s.me.equipName` |
| 技能栏 | 技能按钮 | `s.meSkills`（key/label/tip） |
| 手牌区 | 手牌列表 + 出牌确认条 + 折叠开关 | `s.meHand`、`selUid`、`handCollapsed` |

> **关于「怒气」**：三国杀神吕布有独立怒气机制；本游戏无该数值。**怒气位直接复用「剑气」资源**（`attackUsed/attackLimit`）作战意展示，不新增机制、不新增引擎字段。若产品后续要做真正持久怒气，属设计 + 引擎改动，超出本规格范围。

### 1.3 中间舞台内容（自上而下）

1. 当前行动提示：`s.currentPlayer.name` + 标签（你的回合 / 天意行棋 / 行棋中）
2. **当前出牌虚拟卡（新增）**：打出者的牌（name / kind / point / sig）→ `s.activePlay`
3. 牌库 / 弃牌堆（缩小为两枚角标，让虚拟卡主导）：`s.deckCount` / `s.discardCount`
4. 战报：`s.stageLog`（默认仅留最新 1 条，可展开）

---

## 2. 组件规格

### 2.1 座位卡 `seatCard`（上 / 左 / 右三角）

- **尺寸**：宽 ≈ `190rpx`；立绘区 `190 × 250rpx`；整卡（含势力条 + 名牌 + 血豆）≈ `190 × 330rpx`。较现状 120×160 显著放大，逼近屏宽 1/4 观感。
- **立绘**：`item.art` 有则 `<image mode="aspectFill">`，无则占位大字「剑来」（透明、低对比，不喧宾夺主）。
- **势力条**：卡顶满宽 `28rpx` 色块，底色由 `item.rel` 决定（enemy 暗红 / friend 暗青 / neutral 暗金），文字为 `item.faction`，去掉原内联 `color:{{col}}`（避免文字色与底色冲突），改用浅色 `#f0e8d2`。
- **名字 + 号位**：名牌置于立绘底部，名字左对齐、号位右上角小标。
- **血量豆**：名牌上方一排圆豆（每颗 `14rpx`），渲染 `item.beans`（见 §4.5），前 `hp` 颗实心（势力色/红），其余空心描边。
- **当前行动态**：`isCurrent` 时整卡加 `4rpx` 实线金边 `#e8c66a`；若 `ai` 再叠一条横幅「思考中」（或「天意行棋」），**不用辉光**。
- **目标标记**：`canTarget` 时右侧 ▼ + 实线金边（`.clickable`）。
- **阵亡态**：`dead` 时整卡 `grayscale + 透明度 .45`，叠加半透明大字「阵亡」（保留现有 `.seat-dead`，放大字号、降对比）。可选：若需「已离场」区分，见 §6.3。

### 2.2 自己区 `my-card`（底栏左侧）

- **尺寸**：宽 ≈ `200rpx`；立绘 `200 × 250rpx`；整卡（立绘 + 资源条）≈ `200 × 310rpx`。较现状 160 宽 / 220 立绘放大。
- **结构**：`.my-portrait`（立绘 + 名牌 + 血豆）紧接 `.my-extra`（资源条），见 §7.2。
- **大立绘**：`s.me.art`，无则占位「剑来」。
- **血·怒·装（`.my-extra`）**：
  - `.my-rage`：剑气槽——`.bar` 内 `i` 宽度 `style="width:{{s.me.ragePct}}%"`，`.n` 显 `{{attackUsed}}/{{attackLimit}}`；填充随出剑增多（战意 = 怒气隐喻）。
  - `.my-equip`：渲染 `.slot`，有 `equipName` 则填 1 格（`s.me.equipName`），其余为空占位（当前最多 1 件装备）。
  - 饮者：`s.me.wineActive` 为真时，资源区显「饮」小标记（金边小角标）。
- **当前行动**：`s.isMyTurn` 时自己卡加细金边 + 「行动中」小标（轻量，不抢手牌视觉）。

### 2.3 中间舞台 `stage`（含虚拟出牌卡）

- **定位**：跟随 art-director 调整，`top:260rpx / bottom:280rpx`（见 §7.4）；若自己卡放大到 310rpx，建议 `bottom` 提到 `320rpx` 以免重叠（待对齐确认）。
- **虚拟卡 `.stage-card`**：`150 × 210rpx`、实线金边 `#c9a24b`（**去掉内发光**，见 §5）、内容与手牌卡一致：
  - `.cf-point` 左上角花色点数（圆点数字）
  - `.cf-art` 中央大字 `sig`（剑 / 守 / 丹 / 万…）
  - `.cf-foot` 底部卡类别（基本·攻 / 锦囊 / 装备）
  - 卡上方一行小字：`{{activePlay.actorName}} 打出`
  - 数据来源：**`s.activePlay`**（见 §6.1，引擎新增；出牌时置位，约 1.2s 后清除）。
- **牌库 / 弃牌**：缩为两枚 `90 × 120rpx` 角标，置于虚拟卡两侧，勿喧宾夺主。
- **战报**：`s.stageLog` 默认收起仅最新 1 条，`log-toggle` 展开（保留现状）。

### 2.4 底部手牌 / 技能

- **手牌卡放大**：宽 `150rpx`、高 `210rpx`（现状 120×150）；`.cf-art` 高度提到 `110rpx` 承载大字 `sig`；`.cf-point` 圆点保留。
- **两步出牌确认条**：`selUid` 置位时浮现「出牌 / 取消」（保留）；选中卡用**实线金边**表达（去掉 `translateY` 抬升 + `box-shadow` 辉光，见 §5）。
- **技能栏**：`s.meSkills` 渲染为底部按钮行（金边），非我回合 / 选目标 / 托管时隐藏（保留现状）；`tip` 作长按提示可用。
- **折叠开关**：手牌 >7 张时显「展 开 / 收 起」（保留）。

---

## 3. 交互流程

### 3.1 两步出牌确认（保留并增强视觉）
1. 点手牌 → `tapCard`：首次点置 `selUid`，卡显实线金边 + 底部确认条（出牌 / 取消）。
2. 再点同张 或 点「出牌」→ `_play(uid)` → `Engine.onCardClick(uid)`。
3. 点「取消」/ 点别张 → 清 `selUid`。
4. 若需选目标 → `s.await` 置位，转 §3.2。

### 3.2 选目标高亮
- `s.await` 置位：所有 `alive` 角色 `canTarget=true` → 座位卡 / 自己卡显 ▼ + 实线金边（`.clickable`）；中部提示「请点击上方一名角色为【{{await.label}}】目标…」。
- 点角色 → `Engine.onPlayerClick(id)`；点「取消」→ `tapCancelAwait`。
- 高亮用实线金边 + ▼，**不用辉光**。

### 3.3 技能按钮触发
- `s.meSkills` 按钮 → `Engine.onSkill(key)`；若技能需选目标，同样进 `s.await`（§3.2）。
- 技能在 `s.await` / 非我回合 / 托管时隐藏（保留）。

### 3.4 当前行动提示
- 当前行动者 = `s.currentPlayer`（= `s.hero`）。其座位卡 `isCurrent` 加金边；AI 时叠「思考中」横幅。
- 中部 `stage-hint` 显 `currentPlayer.name` + 标签（你的回合 / 天意行棋 / 行棋中）。
- 自己回合时自己卡加「行动中」轻量标记。

---

## 4. 字段映射表（state → UI）

### 4.1 顶层 `s.*`

| 字段 | UI 呈现 |
|---|---|
| `s.round` | 顶栏「第 N 轮」 |
| `s.mode` | 顶栏模式文案（siege/boss/hot/ai）+ 决定 `oppLabel/allyLabel` |
| `s.wave` / `s.maxWave` | 守城波次「守城 N / M 波」 |
| `s.tphase` | 阶段步进器（摸牌 / 判定 / 出牌 / 弃牌 高亮） |
| `s.deckCount` / `s.discardCount` | 牌库 / 弃牌堆数字 |
| `s.over` / `s.win` | 结算覆盖层开关 |
| `s.busy` | 锁输入 |
| `s.opps` / `s.mates` / `s.enemies` | 四角座位卡数据（opps=上/左敌，mates=右友） |
| `s.oppLabel` / `s.allyLabel` | 阵营分组名（可选顶栏小标） |
| `s.me` | 自己区 |
| `s.meHand` | 手牌 |
| `s.meSkills` | 技能按钮 |
| `s.meTrustee` | 托管标记「· 托管中」 |
| `s.currentPlayer` / `s.hero` | 当前行动者（舞台提示 + 座位卡高亮；二者一致，复用其一即可） |
| `s.isMyTurn` | 是否自己回合（控出牌 / 技能可用） |
| `s.auto` | 托管中（顶栏「托管 中」） |
| `s.stageLog` / `s.log` | 战报（舞台 / 结算） |
| `s.modal` | 抉择 / 多选弹窗 |
| `s.await` | 选目标态（`.label`） |
| `s.shout` / `s.banner` / `s.flash` / `s.popup` | 招式题字 / 入局横幅 / 斩字 / 飘字特效（保留） |
| `s.bgIdx` | 背景索引（换景） |
| `s.result` | 结算数据 |
| `s.speedMul` | 节奏（疾 / 缓） |
| **`s.activePlay`（新增，见 §6.1）** | **中央虚拟出牌卡** |

### 4.2 `playerView`（座位卡 / 自己区 / 当前行动者共用）

| 字段 | UI 呈现 |
|---|---|
| `id` | `bindtap="tapPlayer" data-id` |
| `name` | 名牌 |
| `faction` | 势力条文字；`col` 同 |
| `col` | 势力色（边框 / 名牌强调 / 血豆实心） |
| `art` | 立绘 `src`（空则占位「剑来」） |
| `hp` / `maxHp` | 血量豆 + 数值 |
| `hpPct` | （可选）名牌旁细条 |
| `realm` | 境界小字（低密度） |
| `alive` / `dead` | 阵亡态 |
| `isCurrent` | 当前行动态（金边） |
| `ai` | 「思考中」横幅条件 |
| `canTarget` | 目标标记（▼ + 金边） |
| `isYou` | 自区标识 |
| `isBoss` | 巨寇标记（boss 模式） |
| `sideLabel` | 阵营标签（低密度） |
| `seatLabel` | 号位（一号位…四号位） |
| `equipName` | 装备位（`.my-equip .slot`） |
| `handCount` | 对手手牌数角标 |
| `attackUsed` / `attackLimit` | 剑气槽（怒气位），→ `ragePct` |
| `handLimit` | 手牌上限（标题提示） |
| `wineActive` | 饮者标记 |
| `fx` / `shake` / `glow` / `sway` | 受击 / 回血 / 饮者 动效钩子（保留 CSS 动效层） |

### 4.3 `cardView`（手牌 / 虚拟卡共用）

| 字段 | UI 呈现 |
|---|---|
| `uid` | `bindtap="tapCard" data-uid` |
| `name` | 卡名（虚拟卡 / 手牌头） |
| `type` | 卡类型（决定 `cls` 配色） |
| `sub` | 锦囊子类型（可选，用于特效区分） |
| `sig` | 大尺寸插画区大字（剑 / 守 / 丹 / 万…） |
| `cls` | 花色配色 class |
| `kind` | 卡类别（基本·攻 / 锦囊 / 装备） |
| `point` | 花色点数（左上角圆点数字） |
| `disabled` | 禁用态（剑气已尽，变灰） |

### 4.4 `skillButtons`

| 字段 | UI 呈现 |
|---|---|
| `key` | `bindtap="tapSkill" data-key` |
| `label` | 按钮文字 |
| `tip` | 长按提示（原著台词 / 天赋说明） |

### 4.5 表现层派生字段（**无需引擎改动**）

| 派生字段 | 计算位置 | 计算方式 | 用途 |
|---|---|---|---|
| `item.rel` | `game.js` `onState` | `isMyTeam(pl)?'friend':'enemy'`，标注到 `s.opps/s.mates` 各项 | 势力条底色（enemy/friend/neutral） |
| `item.beans` | `game.js` `onState` | `Array.from({length:maxHp},(_,i)=>i<hp)` 标注到每个 playerView | 血量豆渲染（WXML 需数组才能 `wx:for`） |
| `s.me.ragePct` | `game.js` `onState` | `round(attackUsed/attackLimit*100)` | `.my-rage .bar i` 宽度 |

---

## 5. 去 AI 化合规清单（实施自检）

| 现状（违规） | 处置 |
|---|---|
| `.game` 背景 `radial-gradient(circle...)` | **改为纯色** `#14110f`（去掉径向渐变光晕） |
| `.seat.clickable` / `.seat.current` 的 `box-shadow` 辉光 | 改为 `4rpx` 实线金边 `#e8c66a` |
| `.card.sel` `translateY(-24rpx)` 抬升 + `box-shadow` 辉光 | 改为实线金边（可保留轻微 `translateY` 仅作状态区分，不加辉光） |
| `.seat-hp` 背景 `linear-gradient(红→紫)` | 改为纯色（红 `#9b2f2f` 或势力色） |
| `.stage-card` 内发光（art-director 初版） | **去掉内发光**，仅实线金边（待 art-director 同步） |
| emoji / 大 KPI 卡 | 本页无，保持 |

---

## 6. 引擎改动需求

### 6.1 必须新增：`state.activePlay`（中央虚拟出牌卡）
- **位置**：`playCard` / `playTrick`（任何角色打出实体牌时）置位；释放约 `1.2s` 后清除并 `emitState()`。
- **结构**：`{ actorName, actorCol, name, kind, point, sig, type, sub }`（即 `cardView(playedCard)` + 出牌者 `name/col`）。
- **snapshot()** 输出 `activePlay`。
- **理由**：中央需展示「打出者的牌」（名 / 类 / 点 / 字），现有 `s.shout`（仅题字文本）、`s.flash`、`s.fx` 均无卡对象，无法在表现层还原卡形，故必须由引擎在出牌点暴露。
- **技能释放**（如万剑归宗本身是 trick 卡，已覆盖；纯技能无卡形）复用 `s.shout` 题字，不需虚拟卡。

### 6.2 无需引擎改动（全部在表现层）
- `item.rel`（敌/友/中立）、`item.beans`（血豆数组）、`s.me.ragePct`（剑气槽百分比）—— 均在 `game.js` `onState` 派生（§4.5）。
- 立绘 / 势力 / 血量 / 号位 / 当前行动 / 阵亡 / 目标 / 装备 / 技能 / 手牌 —— 全部已有字段。
- 背景渐变、辉光、抬升等纯 `game.wxss` 调整。

### 6.3 可选（非必要）
- 若需区分「阵亡」与「已离场」：在 `playerView` 增 `left` 字段（对手中途退出/逃走）。当前游戏无此状态，默认不实现，阵亡统一显「阵亡」。

---

## 7. 与 art-director 样式契约对齐

> 以下 class 已由 art-director 预留，WXML 按此契约接入即可。

### 7.1 `.seat-fac`（势力条）
- WXML：`class="seat-fac {{item.rel==='enemy'?'enemy':(item.rel==='friend'?'friend':'neutral')}}"`（去掉原 `style="color:{{item.col}}"`）。
- 底色由 `rel` 修饰类提供（enemy 暗红 / friend 暗青 / neutral 暗金），文字浅色 `#f0e8d2`。
- `rel` 来源：§4.5（game.js 派生，无需引擎改动）。

### 7.2 `.my-extra`（怒气 / 装备位，置于 `.my-card` 内、`.my-portrait` 之后）
- `.my-rage`：`.bar` 内 `i` 宽度 `style="width:{{s.me.ragePct}}%"`；`.n` 显 `{{s.me.attackUsed}}/{{s.me.attackLimit}}`。
- `.my-equip`：`wx:for` 渲染 `.slot`，有 `s.me.equipName` 填 1 格，其余空占位。

### 7.3 `.stage-card`（中央虚拟出牌卡）
- 置于 `.stage` 中央区（虚拟卡在牌库/弃牌角标之上）。
- 子结构 `.cf-point / .cf-art / .cf-sig / .cf-foot` 与手牌卡一致；上方一行 `{{activePlay.actorName}} 打出`。
- **状态来源 `s.activePlay`（§6.1，引擎新增）**。

### 7.4 `.stage` 定位
- art-director 已下移为 `top:260rpx / bottom:280rpx` 以容纳放大座位卡。
- 若自己卡放大到 ≈310rpx，建议 `bottom` 提到 `320rpx` 避免与底栏重叠——**待与 art-director 最终对齐**。

---

## 8. 待主理人审批项 / 风险取舍

1. **「怒气」= 剑气复用**（推荐）：不新增机制，怒气位显示 `attackUsed/attackLimit`。取舍：与三国杀神吕布「持久怒气」观感不同，但符合本游戏词汇与去 AI 化（无新 KPI）。
2. **血豆 vs 纯数字**：推荐血豆（`item.beans` 派生）。取舍：更贴近三国杀，但需 game.js 派生数组。
3. **自己卡高度 / stage `bottom` 内缩**：需与 art-director 确认 310rpx 卡体下 `bottom` 取值（280 → 约 320），避免重叠。
4. **`activePlay` 为唯一引擎新增字段**：若主理人坚持「零引擎改动」，则中央虚拟卡只能退化为复用 `s.shout` 题字（无卡形），观感弱于规格——建议保留 `activePlay`。

---

## 9. 下一步建议

1. engineering-lead：按本规格改 `game.wxml`（接入 `rel` / `beans` / `activePlay` / `.stage-card` / 放大的卡体）+ `game.js`（派生 §4.5 三字段）+ `game.wxss`（去渐变/辉光、放大尺寸）。
2. art-director：同步去掉 `.stage-card` 内发光、确认 `stage` `bottom` 内缩值。
3. 引擎侧（如需）：在 `playCard`/`playTrick` 置位 / 清除 `state.activePlay` 并加入 `snapshot()`。
4. 自检：包体仍 ≤2MB（无新增资源）、四角卡体放大后中部虚拟卡不与其他元素重叠。
