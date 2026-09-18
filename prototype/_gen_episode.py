# -*- coding: utf-8 -*-
"""叙事插图：ImageGen 大图 → 裁水印 → PC/微信双端 JPG。

用法：
  python _gen_episode.py <in.png|jpg> <slug> [module]
  module: longque | shenci_end | shujianhu  (默认 longque)

裁切：右下 AI 生成水印 + 可选顶部 prompt 残留。
输出：
  PC  assets/<module-dir>/<slug>.jpg     1280 宽 q82
  WX  weapp/packageMedia/assets/<dir>/<slug>.jpg  600 宽 ≤20KB
  shenci_end 微信落在 weapp/packageShui/assets/shenci/end_<slug>.jpg
"""
import sys, os
from PIL import Image

BASE = os.path.dirname(os.path.abspath(__file__))

MOD = {
    'longque': {
        'pc': os.path.join(BASE, 'assets', 'longque'),
        'wx': os.path.join(BASE, 'weapp', 'packageMedia', 'assets', 'longque'),
        'wx_prefix': '',
    },
    'shenci_end': {
        'pc': os.path.join(BASE, 'assets', 'shenci'),
        'wx': os.path.join(BASE, 'weapp', 'packageShui', 'assets', 'shenci'),
        'wx_prefix': 'end_',
    },
    'shujianhu': {
        'pc': os.path.join(BASE, 'assets', 'shujianhu'),
        'wx': os.path.join(BASE, 'weapp', 'packageMedia', 'assets', 'shujianhu'),
        'wx_prefix': '',
    },
}

def strip_watermark(im):
    """裁掉右下 AI 水印；若顶部有 prompt 残留条也裁掉。返回新图。"""
    w, h = im.size
    # 右下水印：约 18% 宽 × 8% 高，从底边起
    crop_r = max(160, int(w * 0.16))
    crop_b = max(64, int(h * 0.08))
    # 顶部有时有生成服务文字条，保守裁 0；ImageGen 当前默认无顶条
    crop_t = 0
    # 试探测：若右下角区域极亮（水印白底）则加强裁切
    probe = im.crop((max(0, w - crop_r), max(0, h - crop_b), w, h)).convert('L')
    pixels = list(probe.getdata())
    if pixels:
        mean = sum(pixels) / len(pixels)
        if mean > 180:  # 明显偏亮，疑似白底水印
            crop_r = max(crop_r, int(w * 0.20))
            crop_b = max(crop_b, int(h * 0.10))
    return im.crop((0, crop_t, w - crop_r, h - crop_b))

def save_pair(im, slug, module):
    cfg = MOD[module]
    os.makedirs(cfg['pc'], exist_ok=True)
    os.makedirs(cfg['wx'], exist_ok=True)

    pc = im.resize((1280, max(1, round(1280 * im.height / im.width))), Image.LANCZOS)
    pc_path = os.path.join(cfg['pc'], slug + '.jpg')
    pc.save(pc_path, 'JPEG', quality=82, optimize=True)
    pc_sz = os.path.getsize(pc_path)

    wx_name = cfg['wx_prefix'] + slug + '.jpg'
    wx_path = os.path.join(cfg['wx'], wx_name)
    wx = im.resize((600, max(1, round(600 * im.height / im.width))), Image.LANCZOS)
    q = 60
    while True:
        wx.save(wx_path, 'JPEG', quality=q, optimize=True)
        wx_sz = os.path.getsize(wx_path)
        if wx_sz <= 20480 or q <= 35:
            break
        q -= 5
    print(f'{module}/{slug}: {im.size} → PC {pc_sz//1024}KB  WX {wx_sz//1024}KB q{q}')
    return pc_path, wx_path

def main():
    if len(sys.argv) < 3:
        print('usage: _gen_episode.py <in> <slug> [longque|shenci_end|shujianhu]')
        sys.exit(1)
    src, slug = sys.argv[1], sys.argv[2]
    module = sys.argv[3] if len(sys.argv) > 3 else 'longque'
    im = Image.open(src).convert('RGB')
    im = strip_watermark(im)
    save_pair(im, slug, module)

if __name__ == '__main__':
    main()
