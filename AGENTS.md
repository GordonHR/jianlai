# 剑来项目说明

## 目录约定（必须遵守）

根目录只保留目录与 `.gitignore` 等极少数项目级文件。**新模块不要直接堆在根目录。**

| 目录 | 用途 |
|------|------|
| `design/` | 品牌 logo、狂草字标、印章、字体 |
| `data/` | 名单、配置等数据（如 `剑来人物长卷_名单.txt`） |
| `tools/` | 一次性/流水线脚本、`_rembg_venv`、诊断工具 |
| `video/output/` | 最终成片 |
| `video/previews/` | 样片 |
| `video/frames/` | 抽帧 QA |
| `assets/` | 生成图、长卷图、开场、墨色素材等 |
| `docs/` | 方案、评估、报告 markdown |
| `.mimocode/skills/` | 可复用技能 |
| `game-jianlai-3d/` `pc-map/` `prototype/` `剑来小红书/` `generated-images/` | 既有产品模块（保持） |

## 角色巡礼片尾视频

- 技能：`.mimocode/skills/jianlai-character-credits/`
- 立绘：`C:\Users\Administrator\Desktop\剑来角色立绘`
- 渲染：`tools\_rembg_venv\Scripts\python.exe` + 技能内 `scripts/render_character_credits.py`
- 成片默认输出：`video/output/剑来_角色巡礼片尾_卷轴水墨.mp4`
- 新对话才会自动加载技能；也可按脚本路径直接执行

## 审美基线（片尾）

狂草片头 + 无框水长东印；山水卷轴开合；人物右入左出、路径轻景深；人名不提前；周身水墨光影；不要泼墨脏点、不要片头副标题圆圈。
