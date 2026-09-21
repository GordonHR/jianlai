# 剑来项目 · 长期约定
> 只存跨会话铁律与待办；当日细节见 `YYYY-MM-DD.md`

## 0. 小程序分包硬约束
- 分包引主包用相对路径 `../../../utils/x.js`；主包 `utils/*` 自身禁 `/utils/..`（真机分包构建失败→整页空白）。分包内资源用带包前缀绝对路径（如 `/packageShujianhu/assets/...`，合法）。
- 主包不能引分包资源（图/JS），反向合法。解法=把页面移进资源所在子包。
- 包体门禁 `_wx_size_guard.cjs`（主包/单包/预下载合计/总计四线+90%预警）。**2026-09-20 实测**：主包 516.9KB；**Art 1891.6KB(92% 最紧)**、Shui 1500、Fulu 1301、Tales 785.5、Shujianhu 654、Media/Longque/Map/Ref <170；合计 7.39MB。**Art 禁止再加图/塞 preloadRule**。
- preloadRule 按"合计"≤2MB（违反报 80058）。title 只预下载 Map+Longque+Ref(≈365KB)。
- `project.config.json` packOptions.ignore 已排除 .py/.cjs/.txt/.md；开发文件别放 weapp/utils/。
- 立绘死文件判据两条都查：① `data.js` `artUrl(k)` 仅用 CHARS key；② `sect.js` `SECT_ART_SET`+`art:'名'`、`wushipai` `w:'名'`（中文名）。门禁 `_port_ref_guard.cjs`，删前删后必跑（曾按①误删顾璨/米裕，已恢复）。
- 工程图=packageMap canvas 矢量图（`mapgeo.js` 由 `_map_extract_weapp.cjs` 抽取，不需底图）；回归 `_map_verify.cjs`(91项)。
- 改源头别改生成物：`longque.js`/`data.js` 由 `_lq_sync_weapp.cjs`/`gen_data.js` 生成；同步脚本模板禁用正则转义（用 charAt/slice）。
- `'/'+path` 双斜杠坑（数据已含前导 /）→ 统一走 `abs()`，转换只在渲染层做一次。
- canvas 手势坐标双兜底 `px(t)=t.x!=null?t.x:t.clientX`；双指抬一指用 `touchend` 余指续接。
- 跨包迁移后工具报已删页 ENOENT=会话缓存，重开项目即恢复。PC 端无去 AI 化纪律；微信端按小程序规范。

## 1. 原著纪律
- 人物/技能/飞剑贴原著；本命飞剑仅剑修；未载标 `src:'推定'`、明载标 `src:'原著'`。
- **戏里戏外（tales）定位（用户 2026-09-20，一直如此、非临时改）**：通过**名场面 + 小故事**表达《剑来》作者想表达的事项（道理、人情、守与还、少年与山河）；不是人物志。现有条目不必须保留——该删删、该加加。铁律「**可以没有，不能乱写**」：拿不准留空或从简；quote 无把握一律 `''`；与 briefs/skill 表冲突以已核设定为准。
- 本命飞剑：7 角色 CHARS 有 `sword`（阿良饮者/米裕霞满天/陈清都浮萍/陆芝抱朴·北斗/火龙真人火龙/刘景龙规矩/于樾惊鸟·百花）；`feijian` 的 `sub` 全库无逻辑读取（纯标签）。
- 荀渊=玉圭宗老宗主/飞升境；李宝瓶非陈平安弟子，顾粲是好友。书简湖设局人=崔瀺；1谷雨=10小暑=1000雪花；山水神道冲仙人境需渡天劫。
- 原著无「飞升之争」（纯游戏原创旧梗）→ PC 与 weapp 均已清，统一为「建宗大典」。**注意 weapp `sect.js` 的 `sectMoodLine` 与 PC 实现不同**（weapp 按季节池、PC 按幕池 `sectCurrentBook`），本轮只对齐文案、未强行统一实现。
- 原著「天时/地利/人和」=十四境合道三途径 → 局内环境机制只能叫「天象」，禁叫"天时"。

## 2. 卡牌引擎
- `state.phase`/`state.tphase` 不混用；endTurn→advanceTurn 不 await；伤害唯一源 `swordDamage`；外部技能入口 `skillsOf`；调数值前跑≥40局 A/B。
- **常驻门禁 12 项**，统一入口 `node prototype/regress.cjs`（写 `_regress_report.txt`，任一失败退出码 1）；**发布前必跑**。旧 `_wx_probe`/`_pc_combo` 不存在（幻觉名）。
- `_sc_battle.cjs` 判据已分离（2026-09-20）：`stuck`=回合数 8s 无推进→真死锁，必 FAIL；`timeout`=撞 45s 墙钟→机器负载，≤20% 容忍（旧版把负载抖动当 FAIL，且报告文案误写 `>12s` 而实际阈值 45s）。**仍须独占跑**，别并行其它 node 任务。
- 难度（PC `DIFF`）两维：① 资源差 `allyDraw/foeDraw/bossMul` ② **决策智商 `iq`**（0 简单会漏招 / 1 普通=旧行为逐字不变 / 2 困难集火更狠）；入口 `aiIQ()`，注入 `aiChooseTarget`(40% 随机走神 + 残血权重 5 vs 3)/`aiPickCard`(20% 整回合收手)/`aiTrySkills`(50% 漏技)。只动 AI 决策、不动伤害公式；验证脚本模板 `_chk_diff.cjs`（临时，跑完删）。weapp 对战端无难度选择，未 port。
- 天象（PC `game.js`，weapp 未 port）：6 池风起/月晦/清明/雷泽/大雾/太平，开局 `rollTianxiang()`；四注入点=beginTurn 摸牌 / judgePhase 判定±1 / swordDamage 伤害±1(写 `_parts`) / 顶栏徽标。
- 讲道理（PC）：`judgePhase` 内弃最高手牌计入判定（`JP_THRESHOLD=6`），不另起第二套规则；AI 自动弃、人类可跳过。
- 对战 UI 已落地（PC）：禁攻/嘲讽 chip、战报摸牌折叠、伤害构成 `.dmg-chip`、技法徽记 `.ss-chip.sk`、旗舰 `flagshipInk`（vm 无 DOM 时 return）。
- **入局注入必须在设 `p.side` 之后**：`bfApplyLoadout`/`prApplyRealm` 均按 `p.side` 判「我方」，PC 原写在设 side 之前 → 守城/讨伐两模式从未注入（仅 1v1 `id===0` 侥幸生效）。现统一走 `injectLoadout()` 闭包、各分支设完 side 后调。weapp 按 `mode` 判定（siege/boss 初始全员同阵营，等价全注入）。
- **结算只记一次**：PC `endGame` 有 `state.recorded` 守卫；weapp 原缺，2026-09-20 补 `state.bfSettled`（`checkEnd` 多分支会走到同一结算）。

## 3. 叙事 / 经营
sect(6幕/54选/17结局)、shenci(48旬/ap3/五维)、baofuzhai、wushipai(80面)、profile、tales(27则+packageTales)。
- 人物志银幕点映（PC）：`openCodex`→`codexIntroMode()`（`jianlai_codex_intro_v1`：无=full/有=short/`prefers-reduced-motion`=skip）；三行交替轮映 136 key，每行 9 格 DOM + rAF translate3d；图走 `art/_mq/<key>.jpg`(184×276 q72≈11KB)，`onerror` 回退原图；改后 bump `game.js?v=`。
- 已落地：人物简报笔锋入卷、筛选金尘过场、小程序 codex 详情（立绘铺顶+卡上滑、custom 导航、滚动立绘图蒙版 background-attachment:local）。
- **小程序启动页运镜（定稿）**：底图 `bg-ink.jpg`（人脚 py≈94%）。片头：更近锁人 `scale 1.35 ty -30.5%`（脚对底）→ 匀速 linear↓ 至 `scale 0.72 ty -2%`（高度填满不漏黑）后停住，不再放大。题字只压暗。`title.js` camOut 3.5s，无 camPush。`.op-bgimg` overscan `left/top:-25% w/h:150%`。transform 勿打 `.op-stage`。图变必改运镜。

## 4. 交互
只呈现选择本身不剧透后果（`fxQueue` 提交后才飘字）；禁用态不降整块 opacity；标题卡只用 letter-spacing。

## 5. 配图 / 战斗演出
- 符箓须真符箓体例（黄纸·云篆·符头符胆符脚·朱砂·朱印）；ImageGen 1024²→`_fulu_process.py` q88；山水祠 1408×704 q88；手机图≤12KB。
- **PC 对战视觉分层（2026-09-20）**：优先「命中冲击 + 定向招式」，文字降为战报。`dirSwordFx(from,to)`：fxlayer 阵营色光痕+剑尖攻→守，260ms 后 `hitSparks`+`.fx-dir-hit`；`resolveAttack`/【一剑】在 `applyDamage` 前调用。`fxHit(id,amt,fac)` 目标火花/光环；`loseHp` pendingFx 带 `fac`。vm 无 DOM 安全 return。regress 12/12，数值未动。
- tales 27 图：PC `assets/tales/` q88；weapp `packageTales/assets/tales/` 宽750 ≤40KB（`_tales_process.py`）；数据在 `utils/tales.js`，渲染层拼包前缀。
- **PC 舆图满屏纪律（2026-09-21，含「框」二次修复）**：SVG 画布**禁用「固定 viewBox + `preserveAspectRatio="meet"`」**——视口宽高比与之不同就居中留边，露出 `.mapstage` 暗底＝用户说的"四周黑边"。改法：`fitBox(el,bw,bh)` 用**元素自身** `getBoundingClientRect()` 算 `k=min(W/bw,H/bh)`，viewBox 等比向外撑开并居中（`fitWorldVB/fitLizhuVB`，`fitStage()` 按 `view` 分流，绑 resize；元素 `display:none` 时 gBCR=0 → **先显示再 fit**，`enterLizhu`/`exitLizhu` 已按此序）。**满铺底两层**：① **屏幕固定层 `#oceanbg`**（在 `#scene` 之外，不随缩放平移）巨型 rect `-4000,-4000,9600,9100`，矢量画风 `url(#ocean)` / 写实绘卷 `#9dafb6`——任何窗口/缩放都严丝合缝盖满，地图缩小到底也不露边；② 场景内 `WAVE_RECT` 仅**透明浪纹 `url(#sea)`**（无底色），海色完全由 `#oceanbg` 提供，**场景内不再有不透明矩形去形成"框"**。`#ocean`/`#parch` 渐变改 `userSpaceOnUse` 锚图幅中心、外圈平接 `--ocean1`/`#d2bf94`，渐变走不完也无硬边。层级序 `#oceanbg→#scene→#ui-fixed`（UI 正确叠加）。**内容缩放必须仍等于 meet 缩放（只补边、不裁内容）**，禁改用 `slice`（会裁掉图例/指北针/南婆娑洲）。坐标换算一律走 `vbX/vbY/vbW/vbH`，**禁写死 1600/1100**（旧 `clientToSvg`/拖拽/`touchMid` 写死，在 letterbox 下拖拽速度与缩放锚点本就偏）。门禁 `prototype/_pc_vb_fit_check.cjs`（断言宽高比相等/内容框含于 viewBox/满铺覆盖·含缩到 60%/缩放==meet，9 种窗口 ×world+lizhu）；验「框」用 `_pc_fullframe.py`（全图闭合矩形探测）+`_pc_seam_probe.py`（内容框边界色阶）。**文件位置（2026-09-21 归置）**：PC 舆图主页与资产移出根目录 → `pc-map/浩然天下地图.html` + `pc-map/map-assets/`（骊珠 `pc-map/骊珠洞天古地图.html` 同置）；探针/抽取脚本仍在 `prototype/`，源路径已改指 `pc-map/`。

## 6. 踩坑（沙箱 / 环境）
- PowerShell stdout 常被吞→输出写文件再 Read；`2>`/`Out-File` 可能 UTF-16；`Add-Type` 被拦。
- 沙箱单轮累计删除 ≤50，超限静默拒绝→分批、先删小文件。
- CSS `content:"..."` 缺右引号会吞掉其后所有规则。
- 项目可能被并发编辑→清理前必查 mtime/size。
- **摘要/跨边界后动手前先 Read 目标文件真实内容**（勿凭上轮"已改"记忆；曾出现工具报成功但未落盘）。**2026-09-20 再现**：同一批 5 处 Edit 只落了 3 处（漏掉 `__RESULT.stuck:0` 初始化与报告文案），导致门禁误报 ATTENTION。→ **改完必须 Grep 复核关键行**，不能只看工具回执。

## 7. 模块连接 · 存档
- 3 条跨模块链：对战↔包袱斋（PC 直调 `bfAddCoin`/`bfApplyLoadout`；**weapp 走存档 `jianlai_baofu.loadout` 预计算** —— 引擎在主包、包袱斋在 packageRef，主包引不到分包，故由包袱斋 `bfSyncLoadout()` 在每次 `bfSave()` 时把已装配法宝/印记算成 `[{n,k,v,o,c}]` 写盘，引擎只读、零数据复制，改物件表不必同步第二处）、落魄山→对战（`jianlai_sect_allies`）、包袱斋→行迹录（`jianlai_baofu.coin`）。
- **跨分包常量无法共享** → weapp `engine.js` 内 `BF_SETTLE={win:18,lose:6}` 与分包 `baofuzhai.BF_COIN_WIN/LOSE` 同值，**改一处须改两处**；`_selftest` 有此一致性断言。`engine.js` **不在** `_dual_const_guard` 白名单。
- 包袱斋装备生效链（两端同）：买/捡 → `BF.owned` → `toggleGear`/`toggleMark` → `BF.gear`/`BF.marks` → 注入 `p.extraSkills` → `skillsOf` 合并 → `sumK/hasK`（不改任何伤害公式）。
- `_selftest` **不能调 `startGame`**（会启动异步对局、进程挂住）→ 需用「导出 `_t` 测试接口 + 静态断言」组合验证引擎接线。
- 8 个 localStorage key：`jianlai_record/diff/sect_allies/baofu/profile/shenci/asklake` + `ljtq_v1`。**无全局 SCHEMA_VERSION/迁移机制**。
- 双端两套源码拷贝（baofuzhai/sect/shenci/profile/engine 各一份），数值靠人工同步；`_dual_const_guard.cjs` 比对同名常量。
- `_dual_const_guard` 为**白名单式**（仅 game.js/sect/shenci/baofuzhai 四组），**profile 不在其列** → 小程序 `packageRef/utils/profile.js` 的 `PF_SEEN_TOT`（见闻分母：书简湖19/落魄山17/山水祠7/人物志136/无事牌80）属**手写常量**，改源头 `AL_ENDINGS/SECT_ENDINGS/SC_ENDINGS/CHARS/WSP_CARDS` 须同步（人物志已改走主包 `data.js` 动态取）。
- 小程序对战端**未接行迹录埋点**（`prRecordBattle` 在 weapp 只有测试调），仅 profile 页「录一胜」手动补 —— 因**分包互引被禁**（packageArt 不能 require packageRef），属已知架构限制。
- 卡牌角色 **136**（`game.js` CHARS，双端 `utils/data.js` 同源一致，2026-09-20 实测；旧记 127 已过时）；briefs 127 keys（30 无立绘）。PC 音效 24 条 WebAudio；weapp `engine.js` `vb(t)`+SFX 三档触觉（笼中雀/悟世牌待补）。

## 8. 待办 · 进度
**已清（2026-09-20）**：① 飞升之争旧梗双端统一为「建宗大典」；② AI 难度质变 `DIFF.iq`；③ `_sc_battle` 假阳性根治（timeout/stuck 分离）；④ 小程序体验债（背景 `fixed`、`100vh` 魔法数、四角自适应、`seatPulse`、8 处 `lazy-load`）；⑤ **行迹录双端**（3 个真 bug + 胜率/连胜/见闻分母/模块列/同座）；⑥ **包袱斋双端**（PC 注入时序 P0 + 刷钱漏洞 + 小程序接线打通 + 飘字 + 结算反馈）；⑦ **骊珠矢量舆图双端落地**：小程序 `packageMap`（`LIZHU_GEO` 村社级底图+53 POI，mapdraw drawLizhu/hitLizhu，页面接入；`_map_verify`★全过★、packageMap 146KB）+ **PC `浩然天下地图.html` 从 iframe 浮层改为「主图内下钻层级」**（view:world→zhou(bao)→lizhu，艺术层 SVG+`LIZHU_DESC`(53)+考据面板内联注入，`enterLizhu/exitLizhu/bindLizhuPoi`+SVG `getScreenCTM` 缩放平移，面包屑/缩放钮/百分比/详情抽屉共用主图、全屏）；`_pc_lizhu_syntax.cjs` 语法校验 OK。**细节逐条见当日日志。**

**未做**
1. **一本账**跨模块元进度闭环：4 套资源（雪花钱/香火功德/金精铜钱·人情/声望XP）不通兑 → 需先立 SCHEMA_VERSION+迁移骨架（动老存档，不可逆，须单独排期）。
2. weapp 未 port：天象 / 讲道理 / 技能徽记 / 旗舰印章舞台 / `sword` 消费（weapp 对战端连难度选择都没有，属"精简移植"已知状态；Art 包已 92%，加东西前先看包体）。
3. 本命飞剑 subtype 效果层未落地（`sub` 无逻辑读取）——属**新增机制**，需先设计（subtype/效果/平衡/UI）再动手，且改 CHARS 要重跑 `gen_data.js`。
4. 小程序端余项：无音频（`createInnerAudioContext` 未接）、处决 `.flash-fx` 仅 0.2s（PC 1.15s，改它需同步改 JS `flashOn` 定时）。
5. 人物志详情 `scroll-view` 内 sticky 兼容性待真机确认。
6. **小程序对战端仍未接行迹录埋点**（打牌不涨道行/不记战绩，只有 profile 页「录一胜」手动补）——与包袱斋是**同类跨分包问题**，本轮只打通了包袱斋（走 `loadout` 预计算写盘）；行迹录可**复用同一范式**（把境界 eff 预计算写 `jianlai_profile`，引擎只读）。
7. 包袱斋小遗留：眼力上限 80% 在**读满 5 本**（30+10×5）即到顶，后 4 本只值悟道印记，UI 未提示「眼力已满」。
8. 工程卫生：根目录 30 张 `generated-*/edited-*.png`(37MB)、`prototype/` 65 个 `_*` 临时脚本与报告(336KB)——**只出清单；删除前须用户确认**。
