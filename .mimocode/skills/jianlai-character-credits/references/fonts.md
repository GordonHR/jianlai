# 人名字体备选

字体均位于 `design/brand/`（开源可商用）。脚本 `FONT_NAME_CANDIDATES` 按优先级取第一个存在的文件。

| 文件名 | 名称 | 风格 | 可读性 |
|--------|------|------|--------|
| MaShanZheng-Regular.ttf | 马善政 | 毛笔行楷（当前默认） | 较好 |
| LongCang-Regular.ttf | 龙藏 | 手写放逸 | 中等 |
| ZhiMangXing-Regular.ttf | 智勇行 | 行书手写 | 中等 |
| LiuJianMaoCao-Regular.ttf | 流江毛草 | 草书/近狂草 | 较低 |
| ZCOOLXiaoWei-Regular.ttf | 站酷小薇 | 装饰体 | 高，非书法 |
| ZCOOLQingKeHuangYou-Regular.ttf | 站酷庆科黄油 | 标题体 | 高，非书法 |
| ../simkai.ttf 或 C:\Windows\Fonts\simkai.ttf | 楷体 | 系统楷体 | 最高 |

片头「剑来」固定使用 `wordmark-jianlai.png` 狂草字标，**不**使用上述人名字体。

更换默认字体：编辑 `scripts/render_character_credits.py` 中 `FONT_NAME_CANDIDATES` 列表顺序，或把目标 ttf 放到列表首位。
