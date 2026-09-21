# -*- coding: utf-8 -*-
"""剑来片尾角色巡礼 v6：
- 卷轴开场展开 / 片尾收起
- 人物右入左出；路径轻景深：入口略糊 → 1/4 清晰 → 维持 → 3/4 起再略糊（不糊死）
- 人名不提前出现：仅在清晰段显示
- 片头：狂草「剑来」+ 无框水长东（无副标题）
- 背景：水墨山水缓慢波动；人物周身水墨光影
"""

from __future__ import annotations

import math
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# 默认路径（项目根 jianlai）；新模块请放在对应子目录，勿堆根目录
PROJ_ROOT = Path(r"C:\Users\Administrator\Desktop\jianlai")
SRC_DIR = Path(r"C:\Users\Administrator\Desktop\剑来角色立绘")
OUT_DIR = PROJ_ROOT / "video" / "output"
PREVIEW_DIR = PROJ_ROOT / "video" / "previews"
NAME_LIST = PROJ_ROOT / "data" / "剑来人物长卷_名单.txt"
BRAND = PROJ_ROOT / "design" / "brand"
REMBG_PY = PROJ_ROOT / "tools" / "_rembg_venv" / "Scripts" / "python.exe"

FONT_KAI = BRAND / "simkai.ttf"
FONT_HEI = BRAND / "simhei.ttf"
if not FONT_KAI.exists():
    FONT_KAI = Path(r"C:\Windows\Fonts\simkai.ttf")
if not FONT_HEI.exists():
    FONT_HEI = Path(r"C:\Windows\Fonts\simhei.ttf")

# 人名字库（按优先级）
FONT_NAME_CANDIDATES = [
    BRAND / "MaShanZheng-Regular.ttf",
    BRAND / "LongCang-Regular.ttf",
    BRAND / "ZhiMangXing-Regular.ttf",
    BRAND / "LiuJianMaoCao-Regular.ttf",
    BRAND / "ZCOOLXiaoWei-Regular.ttf",
    FONT_KAI,
]

WORDMARK = BRAND / "wordmark-jianlai.png"
SEAL_SCD_NF = BRAND / "seal-zhu-shuichangdong-noframe.png"

W, H = 1920, 1080
FPS = 24
CHAR_H = 760
GROUND_Y = 990
TRAVEL_SEC = 5.8
GAP_SEC = 1.9
TITLE_SEC = 3.0
END_SEC = 3.2

TEXT_COLOR = (248, 236, 214)
TEXT_SOFT = (230, 214, 186)
GOLD = (230, 190, 100)

SCROLL_W = int(W * 2.2)


def display_name(filename: str) -> str:
    stem = Path(filename).stem
    stem = re.sub(r"^剑来[-_ ]?", "", stem)
    stem = re.sub(r"[-_ ]?(后期|少女|少年|真容|立绘|透明)$", "", stem)
    return stem or Path(filename).stem


def pick_name_font() -> Path:
    for p in FONT_NAME_CANDIDATES:
        if p.exists():
            return p
    return FONT_KAI


def load_ordered_characters():
    files = sorted([p for p in SRC_DIR.iterdir() if p.suffix.lower() == ".png"], key=lambda p: p.name)
    order: list[str] = []
    if NAME_LIST.exists():
        order = [ln.strip() for ln in NAME_LIST.read_text(encoding="utf-8").splitlines() if ln.strip()]

    def match_score(path: Path, key: str) -> int:
        stem = path.stem
        if stem == key:
            return 100
        if stem == f"剑来-{key}":
            return 95
        if key and key in stem:
            return 80 - (len(stem) - len(key))
        return 0

    used: set[Path] = set()
    ordered: list[Path] = []
    for key in order:
        best, best_s = None, 0
        for p in files:
            if p in used:
                continue
            s = match_score(p, key)
            if s > best_s:
                best, best_s = p, s
        if best is not None and best_s > 0:
            ordered.append(best)
            used.add(best)
    for p in files:
        if p not in used:
            ordered.append(p)
            used.add(p)
    return ordered


def prepare_sprite(path: Path, char_h: int = CHAR_H) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    ys, xs = np.where(arr[:, :, 3] > 8)
    if len(xs):
        im = im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    w, h = im.size
    scale = char_h / float(h)
    nw, nh = max(8, int(round(w * scale))), max(8, int(round(h * scale)))
    return im.resize((nw, nh), Image.Resampling.LANCZOS)


def _ridge(y0: float, amp: float, freqs, x: np.ndarray) -> np.ndarray:
    y = np.full_like(x, y0, dtype=np.float32)
    for f, ph, a in freqs:
        y += a * amp * np.sin(x * f + ph)
    return y


def build_ink_layers() -> dict:
    """Build layered ink-wash landscape as RGBA layers for slow undulation."""
    w, h = SCROLL_W, H
    rng = np.random.default_rng(23)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    xs = xx[0]

    def to_rgba(rgb, alpha):
        a = np.clip(alpha, 0, 1)
        out = np.zeros((h, w, 4), dtype=np.float32)
        arr = np.asarray(rgb, dtype=np.float32)
        if arr.ndim == 1:
            out[..., 0] = arr[0]
            out[..., 1] = arr[1]
            out[..., 2] = arr[2]
        else:
            out[..., 0] = arr[..., 0]
            out[..., 1] = arr[..., 1]
            out[..., 2] = arr[..., 2]
        out[..., 3] = a * 255.0
        return Image.fromarray(out.astype(np.uint8), "RGBA")

    # ---- sky / paper wash ----
    sky_top = np.array([42, 56, 68], dtype=np.float32)
    sky_mid = np.array([78, 90, 96], dtype=np.float32)
    sky_low = np.array([118, 124, 120], dtype=np.float32)
    t = np.clip(yy / (h * 0.65), 0, 1)
    sky = np.where(
        t[..., None] < 0.5,
        sky_top + (sky_mid - sky_top) * (t[..., None] / 0.5),
        sky_mid + (sky_low - sky_mid) * ((t[..., None] - 0.5) / 0.5),
    )
    # paper fiber
    grain = rng.normal(0, 1, size=(h // 3, w // 3)).astype(np.float32)
    gimg = Image.fromarray(((grain - grain.min()) / (np.ptp(grain) + 1e-6) * 255).astype(np.uint8), "L")
    gimg = gimg.resize((w, h), Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(0.7))
    g = np.asarray(gimg, dtype=np.float32) / 255.0 - 0.5
    sky += g[..., None] * 12.0
    sky_img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8), "RGB").convert("RGBA")

    # ---- mountain layers (more ink contrast) ----
    def mountain_layer(y0, amp, freqs, color, soft=5.0, ink_edge=True):
        ridge = _ridge(y0, amp, freqs, xs)
        # brush-like irregularity on silhouette
        brush = np.sin(xs * 0.02 + y0) * 2.0 + np.sin(xs * 0.07) * 1.2
        ridge = ridge + brush
        mask = np.clip((yy - ridge) / soft + 0.5, 0, 1)
        if ink_edge:
            # darker rim just under ridge = wet ink edge
            edge = np.clip(1.0 - np.abs(yy - ridge) / 10.0, 0, 1)
            col = np.array(color, dtype=np.float32)[None, None, :]
            col = np.broadcast_to(col, (h, w, 3)).copy()
            col = col * (1 - edge[..., None] * 0.35) + np.array([10, 12, 14], dtype=np.float32) * (edge[..., None] * 0.35)
        else:
            col = np.array(color, dtype=np.float32)
        # internal wash variation
        wash = 0.85 + 0.15 * np.sin(yy * 0.04 + ridge * 0.02)
        if col.ndim == 1:
            col = np.broadcast_to(col, (h, w, 3)).copy()
        col = col * wash[..., None]
        return to_rgba(col, mask)

    far = mountain_layer(
        h * 0.36,
        h * 0.11,
        [(0.0016, 0.3, 1.0), (0.0035, 1.9, 0.55), (0.0075, 3.4, 0.25)],
        (70, 84, 92),
        soft=8.0,
    )
    mid = mountain_layer(
        h * 0.48,
        h * 0.09,
        [(0.0014, 2.4, 1.0), (0.0031, 0.8, 0.55), (0.0065, 4.1, 0.22)],
        (40, 50, 58),
        soft=6.0,
    )
    near = mountain_layer(
        h * 0.64,
        h * 0.07,
        [(0.0012, 5.2, 1.0), (0.0028, 1.4, 0.45), (0.0055, 2.6, 0.2)],
        (22, 26, 30),
        soft=5.0,
    )

    # ---- mist bands (will undulate most) ----
    def mist_layer(centers, widths, strengths, tint):
        alpha = np.zeros((h, w), dtype=np.float32)
        for center, width, strength in centers:
            wave = np.sin(xx * 0.0025 + center * 0.01) * 14 + np.sin(xx * 0.006 + 1.7) * 7
            dist = np.abs(yy - (center + wave))
            alpha = np.maximum(alpha, np.clip(1.0 - dist / width, 0, 1) ** 1.3 * strength)
        return to_rgba(tint, alpha)

    mist1 = mist_layer(
        [(h * 0.40, 40, 0.7), (h * 0.46, 28, 0.45)],
        None,
        None,
        np.array([176, 182, 176], dtype=np.float32),
    )
    mist2 = mist_layer(
        [(h * 0.54, 48, 0.55), (h * 0.62, 36, 0.4)],
        None,
        None,
        np.array([148, 154, 150], dtype=np.float32),
    )
    mist3 = mist_layer(
        [(h * 0.72, 42, 0.35)],
        None,
        None,
        np.array([120, 126, 122], dtype=np.float32),
    )

    # ---- ground / valley ----
    floor_y = h * 0.78
    gmask = np.clip((yy - floor_y) / (h * 0.1), 0, 1)
    ground = to_rgba(
        np.array([32, 36, 38], dtype=np.float32)
        + np.array([20, 18, 14], dtype=np.float32) * np.clip(1 - np.abs(yy - GROUND_Y) / 80, 0, 1)[..., None],
        gmask * 0.85,
    )

    # vignette overlay
    vx = (xx / w - 0.5) * 2
    vy = (yy / h - 0.5) * 2
    vig = np.clip(np.sqrt(vx * vx + vy * vy) * 0.55, 0, 0.55)
    vignette = to_rgba(np.array([8, 10, 12], dtype=np.float32), vig * 0.55)

    return {
        "sky": sky_img,
        "far": far,
        "mist1": mist1,
        "mid": mid,
        "mist2": mist2,
        "near": near,
        "mist3": mist3,
        "ground": ground,
        "vignette": vignette,
    }


def make_name_layer(text: str, font_path: Path, size: int, fill, alpha_max=245) -> Image.Image:
    font = ImageFont.truetype(str(font_path), size)
    pad = int(size * 0.28)
    metrics = []
    for ch in text:
        tmp = Image.new("RGBA", (size * 3, size * 3), (0, 0, 0, 0))
        d = ImageDraw.Draw(tmp)
        bb = d.textbbox((0, 0), ch, font=font)
        metrics.append((max(1, bb[2] - bb[0]), max(1, bb[3] - bb[1]), bb[0], bb[1]))
    max_cw = max(m[0] for m in metrics)
    gap = size * 0.1
    total_h = sum(m[1] for m in metrics) + gap * max(0, len(text) - 1) + pad * 2
    total_w = max_cw + pad * 2 + 8
    img = Image.new("RGBA", (int(total_w), int(max(total_h, size + pad * 2))), (0, 0, 0, 0))
    y = pad
    for chx, (cw, ch, ox, oy) in zip(text, metrics):
        px = int(pad + (max_cw - cw) / 2)
        tmp = Image.new("RGBA", (cw + 24, ch + 24), (0, 0, 0, 0))
        td = ImageDraw.Draw(tmp)
        td.text((12 - ox, 12 - oy), chx, font=font, fill=(15, 14, 12, int(alpha_max * 0.55)))
        td.text((10 - ox, 10 - oy), chx, font=font, fill=(*fill, alpha_max))
        img.alpha_composite(tmp, dest=(max(0, px - 10), max(0, int(y) - 10)))
        y += ch + gap
    ga = np.array(img)
    ys, xs = np.where(ga[:, :, 3] > 4)
    if len(xs):
        img = img.crop((max(0, int(xs.min()) - 3), max(0, int(ys.min()) - 3), min(img.width, int(xs.max()) + 4), min(img.height, int(ys.max()) + 4)))
    return img


def make_shadow(w: int) -> Image.Image:
    sw = max(40, int(w * 0.82))
    sh = max(14, int(sw * 0.12))
    img = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    ImageDraw.Draw(img).ellipse((0, 0, sw - 1, sh - 1), fill=(18, 20, 22, 100))
    return img.filter(ImageFilter.GaussianBlur(8))


def make_ink_aura(sprite: Image.Image) -> Image.Image:
    """水墨光影：人物轮廓外扩的淡墨晕 + 冷暖双层柔光。"""
    w, h = sprite.size
    alpha = sprite.getchannel("A")

    # soft outer wash
    wash = alpha.filter(ImageFilter.GaussianBlur(28))
    wa = np.array(wash).astype(np.float32)
    wa = np.clip((wa - 8) * 1.6, 0, 255) * 0.35

    # second tighter halo
    halo = alpha.filter(ImageFilter.GaussianBlur(12))
    ha = np.array(halo).astype(np.float32)
    ha = np.clip((ha - 20) * 2.0, 0, 255) * 0.28

    # cool ink wash + warm rim light
    cool = np.zeros((h, w, 4), dtype=np.float32)
    cool[..., 0] = 92
    cool[..., 1] = 104
    cool[..., 2] = 112
    cool[..., 3] = wa

    warm = np.zeros((h, w, 4), dtype=np.float32)
    warm[..., 0] = 168
    warm[..., 1] = 148
    warm[..., 2] = 110
    warm[..., 3] = ha * 0.75

    base = Image.fromarray(cool.astype(np.uint8), "RGBA")
    # slight lift of warm light from center-left (like ink light)
    base.alpha_composite(Image.fromarray(warm.astype(np.uint8), "RGBA"), dest=(int(w * 0.04), int(-h * 0.02)))
    return base


def extract_gold_calligraphy() -> Image.Image:
    if WORDMARK.exists():
        im = Image.open(WORDMARK).convert("RGBA")
        arr = np.array(im)
        ys, xs = np.where(arr[:, :, 3] > 12)
        if len(xs):
            im = im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
        return im
    font = ImageFont.truetype(str(FONT_KAI), 160)
    img = Image.new("RGBA", (420, 280), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((20, 40), "剑来", font=font, fill=(*GOLD, 255))
    return img


def load_seal() -> Image.Image | None:
    p = SEAL_SCD_NF
    if not p.exists():
        return None
    seal = Image.open(p).convert("RGBA")
    arr = np.array(seal)
    if arr[:, :, 3].min() == 255:
        lum = arr[:, :, :3].max(axis=2)
        arr = arr.copy()
        arr[:, :, 3] = np.clip((lum - 18) * 4.5, 0, 255)
        seal = Image.fromarray(arr, "RGBA")
    ys, xs = np.where(np.array(seal)[:, :, 3] > 12)
    if len(xs):
        seal = seal.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    return seal


def ease_in_out(x: float) -> float:
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def paste_layered_bg(layers: dict, t_sec: float, phase: str) -> Image.Image:
    """Compose ink landscape with slow undulation / drift."""
    # layer offsets: (x speed px/s, y amp, y omega, y phase)
    # parade phase: very subtle so characters don't jitter against bg
    calm = phase == "parade"
    cfg = [
        ("sky", 2.0 if not calm else 0.6, 2, 0.25, 0.0),
        ("far", 5.0 if not calm else 1.2, 4, 0.35, 0.4),
        ("mist1", 12.0 if not calm else 2.5, 10, 0.45, 0.8),
        ("mid", 8.0 if not calm else 1.6, 6, 0.4, 1.3),
        ("mist2", 16.0 if not calm else 3.0, 14, 0.55, 1.9),
        ("near", 4.0 if not calm else 0.8, 3, 0.3, 2.4),
        ("mist3", 10.0 if not calm else 2.0, 8, 0.5, 2.9),
        ("ground", 0.5 if not calm else 0.2, 1, 0.2, 0.0),
    ]
    frame = Image.new("RGB", (W, H), (20, 24, 28))
    max_dx = SCROLL_W - W
    for key, vx, yamp, w, ph in cfg:
        layer = layers[key]
        # x drift with wrap
        ox = int((t_sec * vx) % max_dx)
        # y undulation
        oy = int(round(math.sin(t_sec * w + ph) * yamp))
        # crop with vertical offset via paste y
        crop = layer.crop((ox, 0, ox + W, H))
        if oy != 0:
            # shift layer vertically by pasting offset; fill edge by stretching edge row is ok for mist
            tmp = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            tmp.paste(crop, (0, oy))
            if oy > 0:
                top = crop.crop((0, 0, W, 1)).resize((W, oy), Image.Resampling.BILINEAR)
                tmp.paste(top, (0, 0))
            else:
                bot = crop.crop((0, H - 1, W, H)).resize((W, -oy), Image.Resampling.BILINEAR)
                tmp.paste(bot, (0, H + oy))
            crop = tmp
        frame = Image.alpha_composite(frame.convert("RGBA"), crop.convert("RGBA")).convert("RGB")

    # vignette on top
    vig = layers["vignette"]
    ox = int((t_sec * 0.4) % max_dx)
    frame = Image.alpha_composite(frame.convert("RGBA"), vig.crop((ox, 0, ox + W, H))).convert("RGB")
    return frame


def path_blur_radius(local: float) -> float:
    """0=最右入场, 1=左侧出场. 入口轻糊→1/4全清→维持→3/4再轻糊. 不完全糊."""
    max_r = 3.2
    if local < 0.25:
        t = local / 0.25
        return max_r * (1.0 - ease_in_out(t))
    if local <= 0.75:
        return 0.0
    t = (local - 0.75) / 0.25
    return max_r * ease_in_out(t)


def apply_scroll_reveal(scene: Image.Image, open_amount: float) -> Image.Image:
    """山水画卷展开/收起：中心向两侧揭开，边缘加卷轴杆。open_amount 0=收起 1=全开。"""
    open_amount = max(0.0, min(1.0, open_amount))
    if open_amount >= 0.995:
        return scene

    canvas = Image.new("RGB", (W, H), (6, 8, 10))
    eased = ease_in_out(open_amount)
    half = max(3, int(W * 0.5 * eased))
    x0 = max(0, W // 2 - half)
    x1 = min(W, W // 2 + half)
    if x1 <= x0:
        return canvas
    strip = scene.crop((x0, 0, x1, H))
    canvas.paste(strip, (x0, 0))

    # 卷轴杆（木色竖条 + 高光）
    draw = ImageDraw.Draw(canvas)
    bar_w = max(6, int(14 * (0.55 + 0.45 * (1 - eased))))
    # left roller
    if x0 > 0:
        draw.rectangle((x0 - bar_w, 0, x0 + 2, H), fill=(42, 32, 24))
        draw.rectangle((x0 - bar_w + 2, 0, x0 - bar_w + 5, H), fill=(78, 62, 44))
        draw.rectangle((max(0, x0 - bar_w), 0, max(1, x0 - bar_w + 2), H), fill=(20, 14, 10))
    # right roller
    if x1 < W:
        draw.rectangle((x1 - 2, 0, x1 + bar_w, H), fill=(42, 32, 24))
        draw.rectangle((x1 + bar_w - 5, 0, x1 + bar_w - 2, H), fill=(78, 62, 44))
        draw.rectangle((min(W - 1, x1 + bar_w - 2), 0, min(W, x1 + bar_w), H), fill=(20, 14, 10))

    # 微暗渐入纸边
    edge = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ed = ImageDraw.Draw(edge)
    if x0 > 2:
        for i in range(18):
            a = int(90 * (1 - i / 18) * eased)
            ed.line((x0 + 2 + i, 0, x0 + 2 + i, H), fill=(0, 0, 0, a))
    if x1 < W - 2:
        for i in range(18):
            a = int(90 * (1 - i / 18) * eased)
            ed.line((x1 - 2 - i, 0, x1 - 2 - i, H), fill=(0, 0, 0, a))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), edge).convert("RGB")
    return canvas


def build_particles(n=30):
    rng = np.random.default_rng(7)
    parts = []
    for _ in range(n):
        parts.append(
            {
                "x": rng.uniform(0, W),
                "y": rng.uniform(40, H * 0.7),
                "r": rng.uniform(0.5, 2.0),
                "vx": rng.uniform(-10, -3),
                "vy": rng.uniform(-1.5, 1.5),
                "a": rng.uniform(0.03, 0.12),
                "phase": rng.uniform(0, math.tau),
            }
        )
    return parts


def _render(files: list[Path], out_path: Path, title_sec: float, end_sec: float):
    name_font_path = pick_name_font()
    print(f"name font: {name_font_path.name}")
    print("building ink layers...")
    layers = build_ink_layers()

    print(f"preparing {len(files)} sprites...")
    sprites = []
    for i, p in enumerate(files):
        spr = prepare_sprite(p)
        name = display_name(p.name)
        aura = make_ink_aura(spr)
        sprites.append({"img": spr, "name": name, "aura": aura})
        if (i + 1) % 20 == 0 or i == len(files) - 1:
            print(f"  sprite {i+1}/{len(files)} {name} {spr.size}", flush=True)

    for s in sprites:
        s["name_img"] = make_name_layer(s["name"], name_font_path, 54, TEXT_COLOR)
        s["shadow"] = make_shadow(s["img"].width)

    callig = extract_gold_calligraphy()
    ch_target = 400
    callig = callig.resize((max(8, int(callig.width * ch_target / callig.height)), ch_target), Image.Resampling.LANCZOS)
    seal = load_seal()
    if seal is not None:
        seal = seal.resize((max(28, int(seal.width * 150 / max(seal.height, 1))), 150), Image.Resampling.LANCZOS)

    end_font = ImageFont.truetype(str(FONT_KAI), 56)
    sub_font = ImageFont.truetype(str(FONT_KAI), 36)

    particles = build_particles(30)

    travel_frames = int(TRAVEL_SEC * FPS)
    gap_frames = int(GAP_SEC * FPS)
    title_frames = int(title_sec * FPS)
    end_frames = int(end_sec * FPS)
    n_chars = len(sprites)
    parade_frames = (n_chars - 1) * gap_frames + travel_frames + int(1.2 * FPS)
    total_frames = title_frames + parade_frames + end_frames
    print(f"total_frames={total_frames} (~{total_frames/FPS:.1f}s) fps={FPS} chars={n_chars}")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    import imageio.v2 as imageio

    writer = imageio.get_writer(
        str(out_path),
        fps=FPS,
        codec="libx264",
        quality=8,
        macro_block_size=2,
        ffmpeg_log_level="error",
        output_params=["-pix_fmt", "yuv420p", "-movflags", "+faststart"],
    )

    try:
        for fi in range(total_frames):
            t_sec = fi / FPS
            if fi < title_frames:
                phase = "title"
            elif fi < title_frames + parade_frames:
                phase = "parade"
            else:
                phase = "end"

            landscape = paste_layered_bg(layers, t_sec, phase)
            draw = ImageDraw.Draw(landscape, "RGBA")
            for p in particles:
                px = (p["x"] + p["vx"] * t_sec) % (W + 40) - 20
                py = p["y"] + p["vy"] * math.sin(t_sec * 0.35 + p["phase"])
                a = int(255 * p["a"] * (0.7 + 0.3 * math.sin(t_sec * 1.3 + p["phase"])))
                r = p["r"]
                draw.ellipse((px - r, py - r, px + r, py + r), fill=(230, 232, 228, max(6, a)))

            if phase == "title":
                local = fi / max(title_frames - 1, 1)
                # 卷轴：前 55% 展开，随后 logo 浮现
                open_amt = ease_in_out(min(1.0, local / 0.55))
                scene = apply_scroll_reveal(landscape, open_amt)
                # logo 在展开过半后出现
                fade = ease_in_out(max(0.0, min(1.0, (local - 0.42) / 0.35)))
                reveal = ease_in_out(max(0.0, min(1.0, (local - 0.42) / 0.4)))
                if fade > 0.02:
                    cx, cy = W // 2, H // 2 - 30
                    wash = Image.new("RGBA", (760, 620), (0, 0, 0, 0))
                    wd = ImageDraw.Draw(wash)
                    wd.ellipse((40, 40, 720, 580), fill=(16, 18, 20, int(100 * fade)))
                    wash = wash.filter(ImageFilter.GaussianBlur(42))
                    scene.paste(wash, (cx - 380, cy - 310), wash)

                    cw, chh = callig.size
                    draw_w = int(cw * (0.92 + 0.08 * reveal))
                    draw_h = int(chh * (0.92 + 0.08 * reveal))
                    logo = callig.resize((draw_w, draw_h), Image.Resampling.LANCZOS)
                    la = np.array(logo)
                    la[:, :, 3] = (la[:, :, 3] * fade).astype(np.uint8)
                    logo = Image.fromarray(la, "RGBA")
                    lx = cx - draw_w // 2
                    ly = cy - draw_h // 2
                    glow = logo.filter(ImageFilter.GaussianBlur(8))
                    ga = np.array(glow)
                    ga[:, :, 3] = (ga[:, :, 3] * 0.3 * fade).astype(np.uint8)
                    glow = Image.fromarray(ga, "RGBA")
                    scene.paste(glow, (lx, ly), glow)
                    scene.paste(logo, (lx, ly), logo)

                    if seal is not None:
                        stamp = ease_in_out(max(0.0, (local - 0.55) / 0.28))
                        if stamp > 0:
                            sa = np.array(seal)
                            sa[:, :, 3] = (sa[:, :, 3] * fade * stamp).astype(np.uint8)
                            seal_s = Image.fromarray(sa, "RGBA")
                            # 落款在狂草右侧，留出明显空隙（不挨着）
                            sx = lx + draw_w + 42
                            sy = ly + draw_h - seal_s.height + 28
                            scene.paste(seal_s, (int(sx), int(sy)), seal_s)
                frame = scene

            elif phase == "parade":
                rel = fi - title_frames
                scene = landscape
                for idx, s in enumerate(sprites):
                    start = idx * gap_frames
                    end = start + travel_frames
                    if rel < start - 2 or rel > end + 2:
                        continue
                    local = (rel - start) / float(travel_frames)
                    if local < 0.0:
                        local = 0.0
                    elif local > 1.0:
                        local = 1.0
                    spr = s["img"]
                    aura = s["aura"]
                    cw, chh = spr.size
                    x0p = float(W + 90)
                    x1p = float(-cw - 90)
                    x_f = x0p + (x1p - x0p) * local
                    y_f = float(GROUND_Y - chh)
                    xi = int(round(x_f))
                    yi = int(round(y_f))

                    # 路径景深：轻糊 → 清晰 → 轻糊
                    br = path_blur_radius(local)
                    if br > 0.12:
                        spr_draw = spr.filter(ImageFilter.GaussianBlur(radius=br))
                        aura_draw = aura.filter(ImageFilter.GaussianBlur(radius=max(0.0, br * 0.6)))
                    else:
                        spr_draw = spr
                        aura_draw = aura

                    sh = s["shadow"]
                    sh_x = int(round(x_f + (cw - sh.width) / 2.0))
                    sh_y = int(round(GROUND_Y - sh.height * 0.4))
                    scene.paste(sh, (sh_x, sh_y), sh)

                    ax = xi + int((cw - aura_draw.width) / 2)
                    ay = yi + int((chh - aura_draw.height) / 2)
                    pulse = 0.85 + 0.15 * math.sin(t_sec * 1.2 + idx)
                    if pulse < 0.99:
                        aa = np.array(aura_draw)
                        aa[:, :, 3] = (aa[:, :, 3] * pulse).astype(np.uint8)
                        aura_draw = Image.fromarray(aa, "RGBA")
                    scene.paste(aura_draw, (ax, ay), aura_draw)
                    scene.paste(spr_draw, (xi, yi), spr_draw)

                    # 人名不提前：仅清晰段（约 1/4–3/4）出现
                    vis = 0.0
                    if 0.22 <= local <= 0.80:
                        if local < 0.28:
                            vis = (local - 0.22) / 0.06
                        elif local > 0.74:
                            vis = max(0.0, (0.80 - local) / 0.06)
                        else:
                            vis = 1.0
                    if vis > 0.02:
                        ni = s["name_img"]
                        if vis < 0.99:
                            arrn = np.array(ni)
                            arrn[:, :, 3] = (arrn[:, :, 3] * vis).astype(np.uint8)
                            ni = Image.fromarray(arrn, "RGBA")
                        nx = xi + cw + 16
                        if nx + ni.width > W - 8:
                            nx = W - ni.width - 8
                        ny = yi + int(chh * 0.12)
                        scene.paste(ni, (nx, max(16, ny)), ni)
                frame = scene

            else:
                local = (fi - title_frames - parade_frames) / max(end_frames - 1, 1)
                # 前半展示文案，后半卷轴收起
                close_start = 0.42
                if local < close_start:
                    open_amt = 1.0
                else:
                    open_amt = ease_in_out(1.0 - (local - close_start) / max(1.0 - close_start, 1e-6))
                scene = apply_scroll_reveal(landscape, open_amt)

                if local < 0.12:
                    fade = ease_in_out(local / 0.12)
                elif local > 0.78:
                    fade = max(0.0, 1.0 - (local - 0.78) / 0.22)
                else:
                    fade = 1.0
                # 收起时文案先淡出
                if local > close_start:
                    fade *= max(0.0, 1.0 - (local - close_start) / 0.25)

                if fade > 0.02:
                    cx, cy = W // 2, H // 2
                    wash = Image.new("RGBA", (720, 480), (0, 0, 0, 0))
                    wd = ImageDraw.Draw(wash)
                    wd.ellipse((30, 30, 690, 450), fill=(16, 18, 20, int(95 * fade)))
                    wash = wash.filter(ImageFilter.GaussianBlur(36))
                    scene.paste(wash, (cx - 360, cy - 240), wash)

                    logo_h = 260
                    logo = callig.resize((int(callig.width * logo_h / callig.height), logo_h), Image.Resampling.LANCZOS)
                    la = np.array(logo)
                    la[:, :, 3] = (la[:, :, 3] * fade).astype(np.uint8)
                    logo = Image.fromarray(la, "RGBA")
                    lx = cx - logo.width // 2
                    ly = cy - logo.height // 2
                    scene.paste(logo, (lx, ly), logo)

                    # 片尾只保留「剑来」+「水长东」；印章右侧留空隙
                    if seal is not None:
                        sa = np.array(seal)
                        sa[:, :, 3] = (sa[:, :, 3] * fade).astype(np.uint8)
                        seal_s = Image.fromarray(sa, "RGBA")
                        seal_h = 160
                        seal_s = seal_s.resize(
                            (max(24, int(seal_s.width * seal_h / max(seal_s.height, 1))), seal_h),
                            Image.Resampling.LANCZOS,
                        )
                        sx = lx + logo.width + 48
                        sy = ly + logo.height - seal_s.height + 20
                        scene.paste(seal_s, (int(sx), int(sy)), seal_s)
                    # 无副标题文案

                if local > 0.88:
                    black_a = int(255 * ((local - 0.88) / 0.12))
                    fade_img = Image.new("RGBA", (W, H), (6, 8, 10, black_a))
                    scene.paste(fade_img, (0, 0), fade_img)
                frame = scene

            writer.append_data(np.array(frame.convert("RGB")))
            if fi % 48 == 0 or fi == total_frames - 1:
                print(f"  frame {fi}/{total_frames} ({fi*100//max(total_frames-1,1)}%) phase={phase}", flush=True)
    finally:
        writer.close()
    print(f"done -> {out_path} size={out_path.stat().st_size}")


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    # usage:
    #   preview [n] [out.mp4]
    #   full [out.mp4]
    # optional env-like overrides via flags after mode:
    #   --src DIR --out PATH --font TTF
    def take_flag(name, default=None):
        if name in argv:
            i = argv.index(name)
            val = argv[i + 1]
            del argv[i : i + 2]
            return val
        return default

    src = take_flag("--src")
    font = take_flag("--font")
    out_flag = take_flag("--out")

    global SRC_DIR
    if src:
        SRC_DIR = Path(src)
    if font:
        FONT_NAME_CANDIDATES.insert(0, Path(font))

    mode = argv[0] if argv else "preview"
    if mode == "preview":
        limit = int(argv[1]) if len(argv) > 1 else 5
        out = Path(argv[2]) if len(argv) > 2 else Path(out_flag or (PREVIEW_DIR / "剑来_角色巡礼_样片.mp4"))
        files = load_ordered_characters()[:limit]
        print(f"[preview] src={SRC_DIR} characters={len(files)} -> {out}")
        _render(files, out, title_sec=3.2, end_sec=2.6)
    elif mode == "full":
        out = Path(argv[1]) if len(argv) > 1 else Path(out_flag or (OUT_DIR / "剑来_角色巡礼片尾_卷轴水墨.mp4"))
        files = load_ordered_characters()
        print(f"[full] src={SRC_DIR} characters={len(files)} -> {out}")
        _render(files, out, title_sec=3.4, end_sec=3.6)
    else:
        raise SystemExit("usage: preview [n] [out.mp4] | full [out.mp4]  [--src DIR] [--font TTF] [--out PATH]")


if __name__ == "__main__":
    main()
