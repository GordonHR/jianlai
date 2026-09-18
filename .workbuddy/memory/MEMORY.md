# 剑来项目 · 长期约定
> 只存跨会话铁律；当日细节见 `YYYY-MM-DD.md`

## 0. 硬约束（微信小程序分包）
- **绝对路径 require 禁令**：分包引主包须相对路径 `../../../utils/x.js`；主包 `utils/*` 共享模块自身也禁止 `/utils/..` 绝对路径（被子包引到时真机分包构建解析失败→整页空白）。全项目只有 packageArt 用绝对路径。
- **主包不能引用分包资源**（图/JS 都不行）；反向合法。正确解法是把页面移进就近资源所在子包，而非把图搬回主包。
- **包体实算（2026-09-18）**：主包 1342.5KB(余~705KB)；子包 Art 1752.7KB(86%/余295KB,最紧)、Shui 1500(73%)、Fulu 1301.4(64%)、Media 754.2、Longque 166.3、Map 122.8、Ref 75.8；合计 6.85MB。主包 assets 大头 `assets/shujianhu` 598.9KB（被 packageShui 引用，暂不动）。加图/音效先算该包余量。
- **⚠️ preloadRule 是"合计"2MB**：同一页面预下载的分包总和≤2MB，违反报 `80058`。门禁 `_wx_size_guard.cjs`（主包/单包/预下载合计/总计四条线+90%预警）。`pages/title/title` 现只预下载 `packageMap+packageLongque+packageRef`(≈365KB)；**packageArt 已达86%，别再塞进 preloadRule**。
- **开发文件排除出包**：`project.config.json` 的 `packOptions.ignore` 已加 `.py/.cjs/.txt/.md`；开发文件别放 `weapp/utils/`。
- **立绘死文件判据（两条来源都查）**：① `data.js` 的 `artUrl(k)` 只用 CHARS key；② `utils/sect.js` 的 `SECT_ART_SET` + `art:'名字'` 字面量、`pages/wushipai` 的 `w:'名字'` 字面量（中文名/别名，与 CHARS key 不重合）。⚠️ 误删坑：曾按①删15个误删 `顾璨.jpg`/`米裕.jpg`（被②硬引用，已恢复）。真正可删13个：佛祖/周密/宁姚/文圣/曹慈/白也/白泽/礼圣/道祖/阿良/陈平安/陈清都/齐静春。门禁 `_port_ref_guard.cjs`；删立绘前后必跑。
- **工程图为 canvas 矢量真地图**：独立分包 `packageMap`(122.8KB)，`mapgeo.js` 由 `_map_extract_weapp.cjs` 程序化抽取（九洲真 coastline+6套设色31KB，不需28.6MB底图）；cover初始相机+屏幕空间海洋+双指以中点为锚缩放+平移钳制+`navigationStyle:custom`全屏浮层。回归 `_map_verify.cjs`(91项)。
- **改源头别改生成物**：`longque.js`/`data.js` 等由 `_lq_sync_weapp.cjs`/`gen_data.js` 生成，手改下次同步即覆盖→路径转换写进脚本模板。
- **同步脚本模板禁用正则转义**（`/^\/+/` 被模板字面量还原成非法正则）→ 改用 `charAt/slice`。
- **`'/'+path` 双斜杠坑**：数据已含前导 `/` 再拼成 `//xxx`（协议相对地址）→ image 加载失败。统一走 `abs()` helper，转换只在渲染层做一次。
- **canvas 手势坐标双兜底**：只读 `x/y` 会让整页手势 NaN（部分环境只给 `clientX/clientY`）→ `px(t)=t.x!=null?t.x:t.clientX` 兜底；双指抬一指在 `touchend` 用剩余手指续接单指拖拽。
- **页面跨包迁移后开发者工具持续报已删页 ENOENT**：源码已干净，是工具会话缓存→关闭项目重开即恢复，别误判。
- **符箓图鉴已分包** `pages/fulu`(packageFulu)；PC端 `assets/fulu/<id>.jpg`。
- PC端无去AI化纪律；微信端按小程序规范。
- 删临时文件走 python 脚本（`python -c` 内联本沙箱 exit 1）；四表 key 必须一致；判"原著编造"前先查 `game.js` `faction`（散修/蛮荒多为游戏原创）。

## 1. 原著纪律
- 人物/技能/飞剑贴原著；本命飞剑仅剑修；未载标 `src:'推定'`、明载标 `src:'原著'`。
- 荀渊=玉圭宗老宗主/飞升境；石柔双端对齐；李宝瓶非陈平安弟子，顾粲是好友。
- 书简湖设局人=崔瀺；神仙钱 1谷雨=10小暑=1000雪花；山水神道冲仙人境需渡天劫。
- 原著无「飞升之争」，sect.js"第五年飞升之争"是游戏原创，待改。

## 2. 卡牌引擎
- `state.phase`/`state.tphase` 不混用；endTurn→advanceTurn 不 await；伤害唯一源 `swordDamage`；外部技能入口 `skillsOf`；调数值前跑≥40局A/B。
- **常驻门禁12项**（`prototype/` 下 `_sc_keys`/`_sc_smoke`/`_sc_battle`/`_narr_smoke`/`_pf_smoke`/`_pf_int`/`_lq_smoke`/`_map_verify`/`_wx_size_guard`/`_port_ref_guard`/`_dual_const_guard` + `weapp/_selftest.cjs`）。⚠️ 旧 `_wx_probe`/`_pc_combo` 全库不存在（幻觉名单）。**统一入口 `prototype/regress.cjs`**（编排全部12项、写 `_regress_report.txt`、任一失败退出码1、`--list` 仅列清单）；子进程复用 `process.execPath`。**发布前必跑 `node prototype/regress.cjs`**。
- `_narr_smoke.cjs` 的 shenci 路径已随分包重构更正：`weapp/utils/shenci.js` → `weapp/packageShui/utils/shenci.js`（第14行 require + 第147行 evalBlock 两处）。

## 3. 叙事/经营模块
sect(6幕/54选/17结局)、shenci(48旬/ap3/五维)、baofuzhai(跨模块闭环)、wushipai(80面)、profile(行迹录)、tales(戏里戏外)。

## 4. 交互
只呈现选择本身不剧透后果；禁用态不降整块 opacity；标题疏排主菜单卡片只用 `letter-spacing`。

## 5. 配图
符箓/云篆须真符箓体例（黄纸·云篆·符头符胆符脚·朱砂·朱印）；ImageGen 1024²→`_fulu_process.py` 去水印转 jpg q88；山水祠新图 1408×704 q88；手机图≤12KB。

## 6. 踩坑（沙箱/环境）
- PowerShell stdout 常被吞→一切输出写文件再 Read；`2>`/`Out-File` 可能写 UTF-16→python 内 `open(...,encoding='utf-8')` 自写；`Add-Type` 被安全策略拦截。
- **沙箱批量删除护栏**：单轮累计删≤50，超50任何删除被拒且静默退出（异常捕获不到/日志不落地）→ 跨轮分批、先删小文件。
- **CSS 内联未闭合字符串断点**：`content:"..."` 缺右引号会吞掉其后跨 `}` 的全部 CSS 规则→修复补 `""`、排查用脚本扫"跨越 } 的字符串"。
- 项目可能被并发编辑→清理前必查 mtime/size，别把别会话产出当垃圾删。

## 7. 模块连接 · 存档 · 双端同步
- **3 条跨模块链（非孤岛）**：① 对战↔包袱斋双向（出 `game.js:1225 bfAddCoin`、入 `baofuzhai.js:306 bfApplyLoadout`）；② 落魄山→对战（写 `sect.js:2662 jianlai_sect_allies`、读 `game.js:1189 loadSectAllies()`）；③ 包袱斋→行迹录（`profile.js:312` 读 `jianlai_baofu.coin`）。真短板=4套资源不通兑（雪花钱/香火功德/金精铜钱·人情/声望XP）。
- **8 个 localStorage key**：`jianlai_record/diff/sect_allies/baofu/profile/shenci/asklake` + `ljtq_v1`(笼中雀)。仅 `BF_VER` 零散版本字段，**无全局 SCHEMA_VERSION/迁移机制**→改存档结构/做统一账本须先立版本+迁移骨架（不可逆，会打坏老存档）。
- **双端两套源码拷贝**（`baofuzhai.js`/`sect.js`/`shenci.js`/`profile.js`/`engine.js` 各一份），数值靠人工同步；`BF_COIN_WIN/LOSE`/`TIER_LIMIT`/`REALM_LIMIT`/`JP_THRESHOLD` 等不一致不报错、冒烟查不出→改数值必两端同步核。**`_dual_const_guard.cjs`** 比对 PC源(game.js→data.js/sect/shenci/baofuzhai)与小程序副本同名常量（CHARS/SKILLS 键排序无关深度比对），首跑抓到 data.js 郭竹酒「饮者→问剑」漂移→重跑 `gen_data.js` 归零。
- **卡牌角色 127**（`game.js` CHARS 实测；旧记108已过时）；briefs 127 keys（30无立绘）。PC 音效24条(WebAudio实时合成)；**小程序 SFX 原空函数**→ 已给 `engine.js` 加 `vb(t)`（与 sect/shenci/baofuzhai/profile 同范式，wx缺失降级）+ `SFX` 各方法挂 light/medium/heavy 三档触觉（点击/抽牌/回合/攻击/治疗/阵亡/处决）。触觉现覆盖落魄山/山水祠/行迹录/包袱斋/对战引擎五处；笼中雀/悟世牌待补。
- **原著「天时/地利/人和」= 十四境合道三条途径**（`game.js:236` 明载）→ **不可拿"天时"当局内环境牌名**（概念撞车），此类机制叫「天象」。
- **"讲道理"已是完整 judge 链**（`game.js:1456 JP_THRESHOLD=6`，【问心】【化外】【通晓】【至高】四技能挂其上）→ 深化应"把 judge 从被动概率改主动投入"，别另起"暗牌比点数"两套规则（设计债；原著讲道理=立规矩/争道统非比大小）。
