# 剑来项目 · 长期约定
> 只存跨会话铁律；当日细节见 `YYYY-MM-DD.md`

## 0. 硬约束
- **主包仍超 2MB 约 170KB**（portraits/sect/shenci 图资挤主包）。任何"加图/加音效"必须先分包或瘦身，否则加不进去。
- **符箓图鉴已分包**：`pages/fulu` 在 `packageFulu`，微信端纯文字；PC 端 `assets/fulu/<id>.jpg`。
- PC 端无"去AI化"纪律；微信端按小程序规范。
- 删临时文件只能用 python `os.remove`。
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
