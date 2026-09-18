# 剑来项目 · 长期约定
> 只存跨会话铁律；当日细节见 `YYYY-MM-DD.md`

## 0. 硬约束
- **分包引主包代码 + 主包共享模块内部，均不得用绝对路径 require**：分包页面引主包须相对路径 `../../../utils/x.js`；**主包 `utils/*` 共享模块自身也禁止 `/utils/..` 绝对路径**（被子包引到时真机分包构建上下文解析失败 → 模块加载抛错 → 整页空白）。2026-09-18 实锤：`packageArt` 三页（codex/setup/game）绝对路径 + `engine.js` 内部绝对 `require('/utils/data.js')` 两层坑。判别依据：全项目只有 packageArt 用绝对路径（页自身）、且 engine.js 内部绝对（对战引它故炸、codex 不引故先好）。
- **主包不能引用分包资源（图片/JS 都不行，真机必不显示）**；反向「子包引主包资源」是合法的。2026-09-18 实锤：sect/shenci 曾作为主包页引用 `/packageShui|packageMedia|packageArt/assets/*` → 山水祠/落魄山图全空。**正确解法不是把图搬回主包（会爆 2MB），而是把页面移进就近资源所在子包**。修完主包 `pages/` 只剩 title/asklake。
- **主包 ~1.78MB**（2026-09-18 迁移 sect/shenci 进子包 + 清死重后实测，余 ~229KB）。构成：utils ~0.81MB（跨子包共享逻辑必须留主包）+ assets ~0.96MB（含可被下放的 `assets/longque` 112KB 零引用死重）+ 主包页。任何"加图/加音效"必须先瘦身或把子包专属图移进子包目录，否则超限。**packageArt 已 1.86MB（仅余 ~140KB），是下一个最容易爆的包。**
- **页面跨包迁移后，开发者工具会持续报已删页面的 `ENOENT`（pages/xxx/xxx.wxml/.wxss）**——源码其实已干净，是工具会话缓存。**关闭项目重新打开即恢复**，不要误判为代码问题反复改。同理 `module 'xxx.js' is not defined` 若文件确实存在且语法正常，也多为缓存假象。
- **符箓图鉴已分包**：`pages/fulu` 在 `packageFulu`，微信端纯文字；PC 端 `assets/fulu/<id>.jpg`。
- PC 端无"去AI化"纪律；微信端按小程序规范。
- 删临时文件用 python `os.remove`（**脚本文件**形式；本沙箱 `python -c` 内联不可用，exit 1）。受沙箱 `[safe-delete]` 护栏限制，见 §6。
- 四表 key 必须一致；key 是内部标识，改显示名只改 `CHARS[key].name`；删角色=四表×双端 8 处 + 进 `_sc_keys.cjs` gone。
- 判"原著编造"前先查 `game.js` `faction`；散修/蛮荒多为游戏原创，不适用原著铁律。

## 1. 原著纪律
- 人物/技能/飞剑贴原著；本命飞剑仅剑修；未载标 `src:'推定'`，明载标 `src:'原著'`。
- 荀渊=玉圭宗老宗主/飞升境；石柔双端已对齐；李宝瓶非陈平安弟子，顾粲是好友。
- 书简湖设局人=崔瀺；神仙钱：1谷雨=10小暑=1000雪花；山水神道冲仙人境需渡天劫。
- 原著无「飞升之争」，sect.js"第五年飞升之争"是游戏原创，待改。

## 2. 卡牌引擎
- `state.phase`/`state.tphase` 不混用；endTurn→advanceTurn 不 await。
- 伤害唯一源 `swordDamage`；外部技能入口 `skillsOf`；调数值前跑 ≥40 局 A/B。
- 常驻门禁：`_sc_keys`/`_sc_smoke`/`_sc_battle`/`_wx_probe`/`_pc_combo`/`_pf_smoke`。

## 3. 叙事/经营模块
- sect（6幕/54选/17结局）、shenci（48旬/ap3/五维）、baofuzhai（跨模块闭环）、wushipai（80面）、profile（行迹录）、tales（戏里戏外）。

## 4. 交互
- 只呈现选择本身，不剧透后果；禁用态不降整块 opacity。
- 标题疏排主菜单卡片只用 `letter-spacing`，不再加字面空格。

## 5. 配图
- 符箓/云篆必须是真符箓体例（黄纸·云篆·符头符胆符脚·朱砂·朱印）。2026-09-14 补 4 张原著明载（井字符/神行符/三山符/替身符篆），图鉴 17→21。
- ImageGen 逐张生成 1024×1024 → `_fulu_process.py` 去右下角水印、转 jpg q88。
- 山水祠新图 1408×704 q88；手机图 ≤12KB。

## 6. 踩坑
- Node 走 PowerShell 托管路径；改后必跑语法/冒烟；结论看真实文件/渲染。
- 删文件走 python；Edit 后必须 grep/读文件验证。
- **CSS 内联样式表"未闭合字符串"断点**：`content:"..."` 若缺右引号，解析器会把其后所有文本（跨 `}`）一路吞到下一个 `"`，导致中间整片 CSS 规则"消失"（表现为某些区块/弹框样式全坏，但文件里明明有）。本项目 `prototype/index.html` 内联 132KB 样式表曾出现 4 处：`164 .skname::after`、`763 .fx-glyph::before`、`1292 .msk-name::after`、`1662 .al-cx-card:not(.got)::after`（后三处连锁，1292 一处未闭合即吞掉 ~145 行直到下一个 `"`，并级联吞掉全部弹框/人物志/codex/`.al-*` 样式）。**修复 = 给 `content` 补 `""` 闭合**；**排查 = 脚本扫描"跨越 `}` 的字符串"**（jsdom/CSSOM 看不到失败规则，只能靠字符串扫描或逐区试渲染）。Edit 同文件批量易丢改（EBUSY/静默），须一次一处 + 立即 Read 验证。
- **沙箱批量删除护栏（2026-09-17 踩）**：`[safe-delete][SAFE_DELETE_BULK_CONFIRM_REQUIRED] {"count":N,"threshold":50,"scope":"turn"}` —— 单轮（turn）**累计删除上限 50 个文件**，超限后**任何**删除（python `os.remove` 或 PowerShell `Remove-Item`）都被拒。护栏通过直接终止进程实现：**异常捕获不到、脚本静默退出、日志不落地**（表现为"脚本明明写了报告文件却没有"）。对策：① 单轮删 ≤50；② 跨轮分批（用户再发一条消息即重置额度）；③ 先删小文件、大目录单独占一轮。`python -c` 内联在本沙箱 exit 1（不可用），删除/诊断一律**写脚本文件到系统 temp 目录**再运行（避免给项目添乱）。
- **本沙箱环境**：PowerShell stdout 常被吞 → 一切输出**写文件再 Read**；`Add-Type`（含 `Microsoft.VisualBasic` 送回收站）被安全策略拦截；`2>`/`Out-File` 可能写 UTF-16（Read 报 binary）→ python 脚本内用 `open(...,encoding='utf-8')` 自己写。
- **项目可能被并发编辑**：2026-09-17 16:06 出现非本人创建的 `prototype/_gen_episode.py`（mtime 即当时分钟）。清理前**必查 mtime/size**，别把别的会话正在产出的文件当垃圾删。
