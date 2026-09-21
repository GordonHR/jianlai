---
name: jianlai-character-credits
description: 生成剑来式片尾角色巡礼视频：透明立绘右入左出，山水卷轴开合、路径景深、人名延迟显示、狂草片头与水长东落印。Use when the user asks for 角色巡礼/片尾人物介绍/立绘动起来做视频/人物长卷视频, or when new 剑来角色立绘 images are added and a credits parade video should be re-rendered. Do NOT use for three.js games, card UI, or still poster generation.
---

# 剑来角色巡礼片尾视频

把透明底角色立绘批量做成动漫片尾式巡礼：人物从右侧入镜、左侧离场；片头/片尾为山水画卷展开与收起。

## 固定审美（与当前成片一致）

| 项 | 取值 |
|----|------|
| 画幅 | 1920×1080 @ 24fps |
| 人物 | 右→左连续巡礼，轻微重叠，脚底锁死、不做整图左右晃 |
| 片头/片尾 | 画卷展开/收起；**只**保留狂草「剑来」+ 右侧留空隙的无框「水长东」；**不要**副标题、圆圈、片尾文案「众生皆有来处」 |
| 配乐 | 国风堂《知我》；文件放 `data/music/`，用 `tools/mux_credits_music.py` 合成 |
| 背景 | 淡墨远山 + 雾带，缓慢波动；不要纯黑、不要泼墨飞溅 |
| 人物光影 | 立绘外侧淡墨晕 + 暖光（水墨光影），可轻微呼吸 |
| 景深 | 路径 0（最右）轻糊 → 0.25 清晰 → 维持 → 0.75 起再轻糊；**不糊死** |
| 人名 | 竖排，**不提前出现**；约 local 0.22–0.80 才显示（与清晰段同步） |
| 人名字体 | 默认马善政；备选见 `references/fonts.md` |

## 项目目录约定（根目录勿堆文件）

```
jianlai/
  design/          # 品牌、字体、印章
  data/            # 名单等数据
  tools/           # 脚本与 _rembg_venv
  video/output/    # 成片 mp4
  video/previews/  # 样片
  video/frames/    # 抽帧 QA
  assets/          # 生成图、长卷、开场等素材
  docs/            # 方案与报告 md
  .mimocode/skills # 技能
```

新模块/新脚本/新成片一律放对应子目录，**不要**直接写在项目根目录。

## 素材路径（默认）

- 立绘目录：`C:\Users\Administrator\Desktop\剑来角色立绘\*.png`（透明底 RGBA）
- 名单顺序：`data/剑来人物长卷_名单.txt`
- 狂草字标：`design/brand/wordmark-jianlai.png`
- 水长东印：`design/brand/seal-zhu-shuichangdong-noframe.png`
- 字体：`design/brand/MaShanZheng-Regular.ttf` 等（见 fonts.md）
- Python：`tools/_rembg_venv/Scripts/python.exe`（含 imageio-ffmpeg）
- 渲染脚本：本技能 `scripts/render_character_credits.py`
- 成片输出：`video/output/`；样片：`video/previews/`

## 操作步骤

### 1. 确认立绘

列出源目录 PNG 数量与新文件名。要求：透明背景；文件名可含角色名（可带 `剑来-` 前缀）。

```powershell
Get-ChildItem "C:\Users\Administrator\Desktop\剑来角色立绘" -Filter *.png | Measure-Object
```

### 2. 更新名单（可选）

若有新角色，在 `剑来人物长卷_名单.txt` 末尾追加显示名（与立绘文件名能匹配，如 `陈平安` 或 `剑来-陈平安`）。脚本会：名单优先 → 剩余文件按文件名排序。

### 3. 预览（强烈建议）

```powershell
$py = "C:\Users\Administrator\Desktop\jianlai\tools\_rembg_venv\Scripts\python.exe"
$script = "C:\Users\Administrator\Desktop\jianlai\.mimocode\skills\jianlai-character-credits\scripts\render_character_credits.py"
& $py $script preview 5 "C:\Users\Administrator\Desktop\jianlai\video\previews\剑来_角色巡礼_样片.mp4"
```

抽帧检查：片头无副标题、卷轴展开、人名不抢跑、景深轻糊而非糊死、山水非纯黑。

### 4. 全量渲染

```powershell
& $py $script full "C:\Users\Administrator\Desktop\jianlai\video\output\剑来_角色巡礼片尾_卷轴水墨.mp4"
```

约 3–5 分钟（111 人时约 4 分钟量级）。输出约 200MB 级 mp4（libx264 + yuv420p + faststart）。

### 5. 配乐（可选）

曲目约定：**国风堂《知我》**。正版音源请放到：

`data/music/知我.mp3`（或 `国风堂-知我.mp3`）

```powershell
& "C:\Users\Administrator\Desktop\jianlai\tools\_rembg_venv\Scripts\python.exe" `
  "C:\Users\Administrator\Desktop\jianlai\tools\mux_credits_music.py"
```

默认合入 `video/output/剑来_角色巡礼片尾_卷轴水墨.mp4` → `..._卷轴水墨_配乐.mp4`。  
**不要从网络抓取受版权保护的音源**；本机没有文件时脚本会提示放置路径。

### 6. 交付

用 `present_files` 给出 mp4 路径（有配乐则给 `_配乐` 成片）。只交付最终成片；中间帧目录不必展示。

## 可调参数

脚本顶部或 CLI 环境可改（改脚本常量后重跑）：

- `GAP_SEC`（默认 1.9）人物间隔，越小越挤
- `TRAVEL_SEC`（默认 5.8）单人横穿时长
- `CHAR_H`（默认 760）立绘高度
- `FONT_NAME_CANDIDATES` 人名字体优先级
- `path_blur_radius()` 景深曲线
- 人名显示窗口：`0.22–0.80`（在 `_render` 的 parade 分支）

CLI：

```
preview [n] [out.mp4]
full [out.mp4]
```

可选覆盖：

```
--src "D:\path\to\立绘目录"
--font "C:\path\to\NameFont.ttf"
--out "D:\out\video.mp4"
```

例：立绘更新后仅换源目录全量出片：

```powershell
& $py $script full "C:\Users\Administrator\Desktop\jianlai\剑来_角色巡礼片尾_卷轴水墨.mp4" --src "C:\Users\Administrator\Desktop\剑来角色立绘"
```

常量路径也可直接改脚本：`SRC_DIR`、`NAME_LIST`、`WORDMARK`、`SEAL_SCD_NF`、`FONT_NAME_CANDIDATES`。

## 运行环境注意

- 本机无系统 ffmpeg 时，**不要**另装；使用 rembg venv 内 imageio-ffmpeg。
- 不要用 MIMO_PYTHON 直接渲视频（缺 imageio/ffmpeg）。
- 渲染前勿在输出路径占用；覆盖写即可。
- 新技能/新脚本放进 `.mimocode/skills/` 后，**新开对话**才会自动加载技能说明；本脚本可直接路径调用，不依赖对话内技能触发。

## 失败排查

| 现象 | 处理 |
|------|------|
| `imageio` / ffmpeg 报错 | 改用 `tools\_rembg_venv\Scripts\python.exe` |
| 字体 `truetype` 失败 | 确认 `design/brand/*.ttf` 存在；或改 `FONT_NAME_CANDIDATES` 回 `simkai.ttf` |
| 立绘显示方框/黑底 | 源图非透明底，需先抠图（项目内已有 rembg venv） |
| 人名提前/过晚 | 调 parade 分支里 `vis` 的 `0.22/0.28/0.74/0.80` |
| 人物移动抖动 | 勿改回背景横移 + 双重 lag；保持整数 round 单一路径 |
| 片头出现副标题 | 删除 title 分支中 subtitle paste；只保留 calligraphy + seal |
| 导出无法播放 | 已带 `+faststart`；若仍失败，用 rembg ffmpeg `-c copy -movflags +faststart` 修复 |

## 成片参考

- `video/output/剑来_角色巡礼片尾_卷轴水墨.mp4` — 当前基线成片
- 品牌与字体：`design/brand/`
- 脚本草稿（历史版本）：`tools/_render_credits_v*.py`
