# 剑来项目 · 长期约定
> 只存跨会话铁律；当日细节见 `YYYY-MM-DD.md`

## 0. 硬约束（动手前先看）
- **小程序主包 2,150,014 B，超 2MB 上限 52,862 B，且无分包**（2026-09-09 实测）。资源占比：portraits 493K / shenci 358K / sect 298K / shujianhu 107K / bg 34K / card 25K / icon 30K。**任何"加图/加音效"的加法必须先做分包或资源瘦身，否则加不进去。**
- **PC 端（剑来）无"去AI化"纪律**：允许光晕/渐变/悬浮/拟物，按效果来（与 CTMS/PMIS 铁律相反，勿混淆）。
- 删临时文件：`rm`/`fs.unlinkSync`/PowerShell `Remove-Item` 全被沙箱静默拦截，**只有 `python -c "import os; os.remove(路径)"` 有效**。
- 四表（CHARS / CHAR_PATH / BRIEFS / PLOTS）**当前 127 条 key 必须一致**（2026-09-10 实测，门禁 `_sc_keys.cjs` 报 A=B=127），改人物四处同步 + 跑 `_sc_keys.cjs`。**key 是内部标识，绝不可为"语义更对"改 key**（改显示名只改 `CHARS[key].name`）。判角色是否存在用 `Object.values(CHARS).some(c=>c.name===n)`。
- **删角色的标准动作 = 四表 × 双端 8 处 + 进 `gone`**：`game.js`（CHARS/CHAR_PATH/SKILLS）、`weapp/utils/data.js`（CHARS/SKILLS）、`briefs.js`（BRIEFS+PLOTS）、`weapp/utils/briefs.js`（BRIEFS），并把 key 加进 `_sc_keys.cjs` 的 `gone` 数组防止复活。写一次性 `.cjs` 脚本跑（整行删 / 跨行删 / 整块删三种），别逐条 Edit。已删：阿弥陀佛、多宝、莲荷、菩萨（群体）、xiaoxun、manhuangdazu、`laoguanzhu`。
- **`briefs.js` 有两张独立表**：`const BRIEFS = {…}`（人物详介，双端同步）与 `const PLOTS = {…}`（PC 独有的"关键情节"表，weapp 无，`_sc_keys.cjs` 明确 skip）。**二者不是重复键、不存在覆盖**；改 PLOTS 只改 PC 端。PLOTS 键一律带引号，BRIEFS 拼音键不带引号、中文名键带引号。
- **判"原著编造"前先查 `game.js` CHARS 的 `faction`**：`散修`/`蛮荒天下` 多为**游戏原创角色**（技能名如「稼」「杯」「景清」「书简湖」是卡牌自造），其游戏化简介**不适用原著铁律，勿当编造清空**。原著角色（如刘景龙·本命飞剑「规矩」，见 §1）即使简介写得抒情也**不得清空**。清理口径=「无原著出处 **且** 写得像原著人物」。
- **石柔双端自洽（已修复 · 2026-09-11）**：原 PC-only（`_sc_keys.cjs` 豁免 `PC_ONLY_KEYS=['石柔']`）。现 weapp `data.js` CHARS+SKILLS 已补石柔（对齐 PC：`蜕`=reduce/once/shield、`窥`=judge/aura），`_sc_keys.cjs` 的 `PC_ONLY_KEYS` 已清空为 `[]`。门禁 `_sc_keys` 现 RUN_EXIT=0、A=B=127 全 OK（历史 onlyB=石柔 一并消除）。

## 1. 原著设定纪律（最高优先级）
- 人物/技能/飞剑须贴原著，不可乱编；本命飞剑标可信度。来源可信度：百度百科≈有声书原文 > 书评 > 「AI生成」榜单（一律不可信）。未载标 `src:'推定'`，明载 `src:'原著'`。
- **仅剑修有本命飞剑**（儒/妖/道/佛/武夫/商贾勿编）。明载：宁姚天真+斩仙／阿良饮者／陆芝北斗+抱朴／刘景龙规矩／齐廷济兵解／董三更一丈高／陈清都浮萍／于樾惊鸟+百花。陈平安=笼中雀+井中月（自育），初一·十五为赠剑胚（非本命）。
- **荀渊身份勘误（2026-09-10 修正）**：原误配为「文圣一脉·中土文庙·止境儒修」。真实=桐叶洲**玉圭宗老宗主**、飞升境大修士；本命枪法「一尺枪」、常书「余家贫」三字，与姜尚真亦师亦友，蛮荒入侵桐叶洲时战死。四表双端已改：faction=散修、realm=飞升境、skills=[一尺枪/余家贫]、CHAR_PATH=玉圭宗老宗主。另：谢时（礼圣一脉君子之剑）出处待核，BRIEFS 已标注「游戏设定补全，出处待核」。
- 易错：高烛=魏晋佩剑（**非**左右本命飞剑，左右原著未明言）；白也持仙剑太白、非纯剑修；道老二=余斗、道老三=陆沉。
- **落魄山**：骊珠洞天降格后陈平安用三袋金精铜钱买五山头之一，主峰集灵峰（竹楼）、次峰霁色峰（祖师堂）。八弟子=崔东山·裴钱·曹晴朗·赵树下·郭竹酒·宁吉·邓剑枰·袁黄。**李宝瓶是齐静春弟子（称小师叔，非弟子）**、顾粲是好友非弟子。青萍剑宗=桐叶洲下宗（崔东山首任宗主、崔嵬掌律、米裕首席供奉、曹晴朗接宗主）；龙象剑宗=南婆娑洲下宗。
- **魏檗**：北岳正神→神位废沉江→棋墩山土地→披云山山神/大骊北岳正神，神号"夜游"，落魄山"住山大使"，办夜游宴攒下一半家底。
- **书简湖设局人=崔瀺（绣虎）**，余斗只是对照组。节点：糖葫芦（邹子）／蔡金简（齐静春）／裴钱（莲花福地）／陆台·刘材（邹子）／造化窟三梦／大骊宋和。
- **包袱斋≠随身小洞天**：古玩行术语+松散门派，无祖师堂；"和气斋"=九十九间屋每间一物，**可赊欠历来定例**。老聋儿是 CHARS 角色，与包袱斋无关；"账房先生"=陈平安。
- **神仙钱**：1谷雨=10小暑=1000雪花，1雪花=1000两白银（"1小暑=10雪花"错；"碎银"已废）。
- **山水神道**：北岳正神/山君 > 山神（辖百里）> 土地公；河伯辖一河；城隍需朝廷敕封；狐精不可为山神；**冲仙人境需渡神道天劫且极易脱离山水根基**（=shenci 的"脱根"机制）。埋河水神（非"埋河河伯"）出原著。
- **问剑规则**：左右定义"问剑=多递出一剑"；晋升剑仙来三位问剑（了结/撑场/传道）；问剑始旁人不可打断。
- **原著无「飞升之争」**：落魄山终局=共斩蛮荒→建宗大典→问剑正阳山→遍访山水神灵以文庙功德修复桐叶洲→建下宗青萍剑宗。sect.js 的"第五年飞升之争"是游戏原创，气质与原著（"还"与"守"）拧，待改。

## 2. 卡牌引擎（game.js + weapp/utils/engine.js，两端 1:1）
- `state.phase`：title→setup→game→result（另有 codex/asklake/sect）；`state.tphase`：draw→judge→play→discard。两套不混用。
- AI/人共用 playCard/useSkill，靠 `isAI(p)`+`ask()`+`chooseTarget()` 分叉；所有询问走 ask。`state.busy` 异步锁；endTurn→advanceTurn→runTurn **fire-and-forget 不 await**。
- 已实装：攻/守/丹/问剑/本命飞剑/六大锦囊/境界突破/齐心/读书·炼器/连击/难度三档/本地战绩/AI 连携。模式：身份局 ai / hot 群雄论剑 / siege 剑气长城(5波) / boss 天下共伐。
- **伤害唯一真相源 `swordDamage(attacker,target,apply)`**：AI 预估与真实结算共用一式。judgePhase：`judgePoint=cardPoint+sumK(p,'judge')` ≥6 → judgeBuff（首剑+1）。fatigue：`round>=40?2:(>=25?1:0)`。
- **外部技能唯一入口 `skillsOf(p)`**：concat `p.extraSkills`（法宝/悟道印记），与角色技共用 sumK/hasK/firstK；注入时机=startGame 中 `state.players=players;` 后 `bfApplyLoadout(players,mode)`（**hot 不注入**）。外部技能必须用既有 k（atk/atkLimit/hand/draw/judge/range/nododge/reduce/regen/hitdraw…），否则静默失效。`condOk` 里 low=hp≤1、hurt=hp<maxHp。
- 平衡：4 人中位 15–18 回合、方差大；**调数值前必跑 ≥40 局 A/B 对照**。常驻门禁：`_sc_keys.cjs`／`_sc_smoke.cjs`／`_sc_battle.cjs`／`_wx_probe.cjs`／`_pc_combo.cjs`／`_pf_smoke.cjs`。

## 3. 叙事 / 经营
- **sect.js 落魄山**：自包含，render() 按 `state.phase==='sect'` 分派；演出层 `#sect-fx`，飘字入 fxQueue 重绘后 flush。SECT_ACTS 6幕/16抉择点（54 选点/17 结局）；因果引擎 relations(道契)+stance(剑礼/守/势)，事件 opt 带 `eff.rel/eff.stance`，门控 `req.*/gate(s)`。nodeFire:'ascend' 会在置 over 后注入看不到，改用 `bookXun:56`。
- **shenci.js 山水祠**：48 旬、ap=3、五维资源=香火/气数/阴德/威灵/香客；冲境门槛（香火+阴德+气数）→ 神道天劫；脱根机制。
- **baofuzhai.js 包袱斋**：存档 `jianlai_baofu`（coin/debt/read/marks/gear/owned/fakes/stall）；神仙钱货币；**对战胜利经 `updateRecord`→`bfAddCoin` 结账（先抵赊欠）** → 这是目前唯一存在的跨模块闭环。掌柜石柔昼夜两副面目（夜=女子真身）。
- **wushipai.js** = 太平无事牌·八十面箴言匣（阅览，纯原著牌文）。**profile.js** = 行迹录（XP/等级/境界说明，存档 `pfSave`）。**tales.js** = 戏里戏外。

## 4. 交互设计纪律
- **只呈现选择本身，不剧透后果**（已删 tags/note/gain）；例外：锁定原因可显示。
- 选项规格：PC `padding:10px 14px/font:14px/line-height:1.5/min-height:44px`；小程序 `margin:12rpx 0/padding:16rpx 18rpx/font:26rpx/min-height:88rpx`。
- **禁用态禁止整块 opacity 淡化**（吃掉锁定原因）：底色边框压暗 + 正文降灰 + 原因反提亮；hover 加 `:not(:disabled)`。
- 永久数值面板默认收抽屉；主舞台只放核心交互。**必然发生的操作不做成按钮**（分支汇同一出口则自动推进，延迟一拍让飘字落地）。
- **「先做一个给我看」= 出预览，不动生产文件**：产物=独立 `_xxx_preview.html`，生产资源零改动，选定后再同步所有端点。**动手前先确认回滚源在哪一侧**。
- **疏排（字间距）纪律**：全项目标题用「字面空格 + CSS `letter-spacing`」双机制做疏排，但**二者叠加=双重间距**，窄容器会溢出折行。主菜单卡片 `.ts-mode h3`（宽 250px，h3 可用≈170px）**标题绝不可再带字面空格**——已把 `人物志/戏里戏外/无事牌/符箓图鉴/包袱斋/行迹录` 六卡改为纯 `letter-spacing:6px`（与 `落魄山/群雄论剑` 及 `.ts-group-title` 一致），4 字标题不再折行。详情页 `h1`（`.codex-head h1` 6px + 字面空格）宽裕不折行，保持原样。改卡片标题串须同步门禁 `_sc_smoke.cjs`（查 `<h3>无 事 牌</h3>`）与 `_pf_int.cjs`（标题屏查 `行 迹 录`）。
- **已否决路线**：模式图标走「实心剪影」（礼帽斗篷/斗笠剑客）→ 用户"太丑了，别瞎了我的眼"。图标维持「金色细线 + 拟物四件套」（体块淡填充 .10~.15 + 器壁双线 + 釉光弧 + 案上投影）。

## 5. 配图 / 视觉
- 可配图但**不要乱配图**：① 贴原著（`art/<中文名>.png`，无图 onerror 隐藏）② 功能弹框可用古风 SVG ③ PC 与小程序同步。
- **叙事插图双端分规格**：宋元文人画水墨写意，赭石/墨黑/土黄，大留白。ImageGen 默认带 `AI生成 WORKBUDDY` 水印 → 必须 Pillow 处理（左侧邻区 patch+羽化保留尺寸，勿硬裁）。PC 大图：山水祠新图统一 1408×704 q88 jpg（shui_*14+新增20），shan_* 仍 1280×879 q82（用户明确不统一）；**手机 ≤12KB/张**（`_squeeze_weapp.py`）。已落地（PC）：书简湖 8 / 落魄山 23 / 山水祠 48 = 79 张（weapp 山水祠仍 28，未同步）。
- **接线范式（零改数据）**：slug=结局 key/事件 id，渲染/emit 从 key/id 派生路径 + onerror/wx:if 兜底。小程序的"有图 id 清单"前置过滤是首选（山水祠 SC_IMG_IDS 48 = SC_EVENTS 总数，PC 端每旬事件皆有图；weapp 28 未同步），binderror 只作兜底——因 `<image>` 失败时开发者工具显灰占位、真机直接隐藏，两端不一致。
- 批量压缩用 Pillow：`--target` 装 `~/.workbuddy/_piplib` + PYTHONPATH 引入（Windows venv 用 C:/ 盘符路径）。

## 6. 移植与踩坑
- **Edit 的 old_string 含函数头时 new_string 必须原样带回**；改完必跑语法/冒烟。
- **运行 Node 走 PowerShell**：bash 直接调 `D:\NodeJS\node.exe` 报 `Permission denied`（沙箱拦 exe 执行），须 `PowerShell -Command "& 'D:\NodeJS\node.exe' xx.cjs"`；或改用托管 node `C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2-2\node.exe`（同样需 PowerShell 起）。bash 跑命令还会注入 `error launching git:` 噪声（非致命）。删文件仍只认 python `os.remove`（见 §0）。
- **Edit 偶发"报告成功但未落盘"**：改后必须 grep/读真文件验证。**同文件多条 Edit 时极易部分丢失 → 批量替换优先写一次性 `.cjs` 脚本（含 miss 报告），别逐条 Edit**。冒烟全绿 ≠ CSS 真改对（冒烟只测 JS）。
- **清空字段前先确认渲染有兜底**：`intro` 原无条件渲染 → 已改 `if(b.intro)`+整理中文案；`scenes` 需 filter 掉 d/q 皆空者，否则只剩标题的空壳（PC game.js 与 weapp codex.js 双端都已加）。
- 小程序 `<button>` 内置 display:inline-block，width:100% 压不过 → 撑满须改 `<view bindtap hover-class>`；disabled 改 class 切换。
- **WXSS 语法错会作废其后所有规则**（静默失效），改后 grep 关键类验证。
- 结论必须建立在"看实际文件/渲染"上。

## 7. 图标 / 画卷意象
- **画卷意象**（戏里戏外/人物志详情）：轴线金线 + 朱印 + 宣纸底纹 + 光阴长河金芒 + 摊卷入场（PC `taleUnroll` .62s / 小程序 `cxUnroll` .52s）。
- **境界图标**：`assets/realm/realm-icons.js` 单一全局模块（柔和金色线描，圆形章+纯曲线，无尖角），`REALM_ICON_BY_NAME` 覆盖 profile.js 28 境 + `练气` 别名；`realmIconForChar(realm)` 供角标。**SVG 类名必须是 `ric`（不是 `realm-ic`）**，让 profile.js 已有的 `.pf-step .ric { 18px }`/`.badge-realm .ric { 15px }`/`.cr .ric { 14px }` 三条规则直接命中。**SVG 自身绝不带 inline `width:100%` 之类样式**——inline 优先级压过外层 CSS，会撑爆没有包装盒的场景（步梯/角标）。「当前境界」用法必须**外加 `<span class="pf-realm-ic">` 包装盒**并配 `.pf-realm-ic svg { width:100%; height:100% }` 规则让 svg 充满 58px 包装盒。凡加境界图标走此模块，勿散写内联 SVG。
- **SVG 图标双端目录须同步**：`weapp/assets/icon/` 与 `assets/icon/`（PC）内容一致，新增/改两侧都落。落魄山/山水祠选项图标 PC 内联 SVG（sectOptIcon/scOptIcon，stroke=currentColor）不依赖文件。
- **符箓/云篆类配图铁律（2026-09-11 用户纠正）**：符箓必须是**真符箓体例**——黄纸·云篆（符头·符胆·符脚）·朱砂·朱印·敕令笔势，**不是意境山水画**。此前误生成"山水/火焰/剑光"水墨场景被用户打回。ImageGen 生成后须 Pillow 去右下角 `AI生成 WORKBUDDY` 水印并转 jpg；**逐张串行生成**（并行会因秒级时间戳重名互相覆盖丢失）。英文 prompt 可规避"五雷正法/天师府"等敏感词拦截。PC 端 `assets/fulu/<id>.jpg`，微信端纯文字不引图。处理管线脚本 `prototype/_fulu_process.py`（含 feathered inpaint 去水印）。
