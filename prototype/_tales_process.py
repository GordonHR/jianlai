# -*- coding: utf-8 -*-
"""
戏里戏外配图处理管线
用法：把 ImageGen 生成图按故事 id 放进
      prototype/assets/tales/_gen/<id>.png（或 .jpg）
      运行：python _tales_process.py
输出：
  prototype/assets/tales/<id>.jpg          # PC 端高清 q88
  weapp/packageTales/assets/tales/<id>.jpg # 小程序端压缩（目标 ≤40KB，宽 750）
水印：右下角 AI 生成标用左下暗边覆盖（与 _fulu_process.py 同法）
"""
from PIL import Image
import os

BASE = os.path.dirname(os.path.abspath(__file__))
PC_GEN = os.path.join(BASE, 'assets', 'tales', '_gen')
PC_OUT = os.path.join(BASE, 'assets', 'tales')
WX_OUT = os.path.join(BASE, 'weapp', 'packageTales', 'assets', 'tales')

WX_WIDTH = 750
WX_QUALITY_START = 72
WX_MAX_BYTES = 40 * 1024


def stamp_patch(img):
    W, H = img.size
    pw, ph = max(1, int(W * 0.22)), max(1, int(H * 0.10))
    patch = img.crop((0, H - ph, pw, H))
    img = img.copy()
    img.paste(patch, (W - pw, H - ph))
    return img


def save_weapp(img_rgb, out_path):
    """宽 750，质量递减压到 ≤40KB"""
    im = img_rgb.copy()
    w, h = im.size
    if w > WX_WIDTH:
        nh = int(h * WX_WIDTH / w)
        im = im.resize((WX_WIDTH, nh), Image.LANCZOS)
    for q in (WX_QUALITY_START, 65, 58, 52, 46, 40):
        im.save(out_path, 'JPEG', quality=q, optimize=True)
        if os.path.getsize(out_path) <= WX_MAX_BYTES:
            return os.path.getsize(out_path), q
    return os.path.getsize(out_path), 40


def process(path):
    name = os.path.splitext(os.path.basename(path))[0]
    img = Image.open(path).convert('RGB')
    img = stamp_patch(img)
    W, H = img.size
    pc_path = os.path.join(PC_OUT, f'{name}.jpg')
    img.save(pc_path, 'JPEG', quality=88, optimize=True)
    os.makedirs(WX_OUT, exist_ok=True)
    wx_path = os.path.join(WX_OUT, f'{name}.jpg')
    wx_size, q = save_weapp(img, wx_path)
    print(f'{name}: gen {W}x{H} | pc {os.path.getsize(pc_path)}B | wx {wx_size}B q{q}')


def main():
    if not os.path.isdir(PC_GEN):
        print('missing', PC_GEN)
        return
    files = []
    for f in sorted(os.listdir(PC_GEN)):
        if f.lower().endswith(('.png', '.jpg', '.jpeg')):
            files.append(os.path.join(PC_GEN, f))
    if not files:
        print('no gen files')
        return
    for p in files:
        process(p)
    print('done', len(files))


if __name__ == '__main__':
    main()
