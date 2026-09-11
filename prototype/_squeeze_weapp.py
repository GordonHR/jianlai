"""微信端叙事插图重压（用户 2026-09-04 14:11 最终方案）。

策略：每张独立判断——过糊的图走 600w q60 → 540w q60 → 540w q40 三档，
不糊的图跳过重压。目标是 59 张总和 ≤ 1.55MB（总包留 450KB 给代码，
当前代码 ~1.3MB + 资源 ≤1.55MB = ~1.85MB，总包 ≤2MB）。
"""
import sys, os, glob
sys.path.insert(0, r'C:/Users/Administrator/.workbuddy/_piplib')
from PIL import Image

ROOT = r'C:/Users/Administrator/Desktop/jianlai/prototype/weapp/assets'
DIRS = ['shujianhu', 'sect', 'shenci']
SOFT_TARGET = 15360  # 15 KB 软上限（大部分图到这里）
HARD_TARGET = 16384  # 16 KB 硬上限（任何图不能超）
TOTAL_BEFORE = 0
TOTAL_AFTER = 0
TOUCHED = 0

# 分级：尽量高分辨率+高质，但更克制（避免单张超 14KB）
STAGES = [(540, 56), (540, 50), (540, 44), (540, 38), (480, 38), (480, 34), (420, 34), (420, 30)]

def reencode(jpg_path):
    """已 ≤15KB 不动；>15KB 重压到 ≤16KB 但尽量接近 15KB"""
    size = os.path.getsize(jpg_path)
    if size <= SOFT_TARGET:
        return True, size, size, 'skip (≤15KB)'
    im = Image.open(jpg_path).convert('RGB')
    best = None
    for w_target, q in STAGES:
        scale = w_target / im.width
        new_w = w_target
        new_h = max(1, int(im.height * scale))
        out = im.resize((new_w, new_h), Image.LANCZOS)
        out.save(jpg_path, 'JPEG', quality=q, optimize=True, progressive=True, subsampling='4:2:0')
        sz = os.path.getsize(jpg_path)
        best = (w_target, q, sz)
        if sz <= HARD_TARGET:
            return True, size, sz, f'{w_target}w q{q}'
    return False, size, best[2], f'{best[0]}w q{best[1]} (still >16KB)'

for d in DIRS:
    full = os.path.join(ROOT, d)
    files = sorted(glob.glob(os.path.join(full, '*.jpg')))
    print(f'=== {d} ({len(files)} 张) ===')
    for f in files:
        before = os.path.getsize(f)
        TOTAL_BEFORE += before
        ok, b, a, method = reencode(f)
        TOTAL_AFTER += a
        if b != a:
            TOUCHED += 1
        mark = 'OK' if ok else 'OVER'
        print(f'  [{mark:4s} {method:14s}] {os.path.basename(f):30s} {b/1024:5.1f}KB -> {a/1024:5.1f}KB')

print()
print(f'=== 汇总 ===')
print(f'原大小：{TOTAL_BEFORE/1024:.1f}KB  压后：{TOTAL_AFTER/1024:.1f}KB')
print(f'增量：{(TOTAL_AFTER-TOTAL_BEFORE)/1024:.1f}KB  压缩比：{(1-TOTAL_AFTER/TOTAL_BEFORE)*100:.1f}%')
print(f'重压：{TOUCHED} 张')
over = [os.path.basename(f) for d in DIRS
        for f in glob.glob(os.path.join(ROOT, d, '*.jpg'))
        if os.path.getsize(f) > HARD_TARGET]
if over:
    print(f'!! 未达标 {len(over)} 张：', over)
else:
    print(f'!! 全部 ≤16KB，达标。')