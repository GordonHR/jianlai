# -*- coding: utf-8 -*-
"""
符箓配图处理管线
用法：把 ImageGen 逐张生成的 PNG 放进 assets/fulu/_gen/<id>.png（子目录亦可），
      然后运行 python _fulu_process.py
      输出：assets/fulu/<id>.jpg（q88，右下角 AI生成 WORKBUDDY 水印用左下暗边覆盖）
"""
from PIL import Image
import os, glob

BASE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE, 'assets', 'fulu')
GEN_DIR = os.path.join(OUT_DIR, '_gen')

def process(path):
    name = os.path.splitext(os.path.basename(path))[0]
    img = Image.open(path).convert('RGB')
    W, H = img.size
    # 水印在右下角暗边，复制左下等尺寸干净暗边覆盖
    pw, ph = max(1, int(W * 0.22)), max(1, int(H * 0.10))
    patch = img.crop((0, H - ph, pw, H))
    img.paste(patch, (W - pw, H - ph))
    out = os.path.join(OUT_DIR, f'{name}.jpg')
    img.save(out, 'JPEG', quality=88, optimize=True)
    print('saved', out, f'{W}x{H}', f'{os.path.getsize(out)}B')

def main():
    for root, dirs, files in os.walk(GEN_DIR):
        for f in files:
            if f.lower().endswith('.png'):
                process(os.path.join(root, f))

if __name__ == '__main__':
    main()
