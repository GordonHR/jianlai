import sys, os
sys.path.insert(0, r'C:/Users/Administrator/.workbuddy/_piplib')
from PIL import Image

IN = sys.argv[1]   # 输入 png 路径
ID = sys.argv[2]   # 事件 id，如 shui_fengping
PC_DIR = r'C:\Users\Administrator\Desktop\jianlai\prototype\assets\shenci'
WX_DIR = r'C:\Users\Administrator\Desktop\jianlai\prototype\weapp\assets\shenci'
os.makedirs(PC_DIR, exist_ok=True)
os.makedirs(WX_DIR, exist_ok=True)

CROP_T, CROP_R, CROP_B = 80, 220, 120  # 顶部裁掉 ImageGen prompt 文字残留，右下裁 AI 生成水印，留右上朱印
im = Image.open(IN).convert('RGB')
w, h = im.size
im = im.crop((0, CROP_T, w - CROP_R, h - CROP_B))  # 去顶部 prompt + 右下 AI 水印

# PC 大图：1280 宽 q82
pc = im.resize((1280, round(1280 * im.height / im.width)), Image.LANCZOS)
pc.save(os.path.join(PC_DIR, ID + '.jpg'), 'JPEG', quality=82, optimize=True)
pc_sz = os.path.getsize(os.path.join(PC_DIR, ID + '.jpg'))

# 手机端：540 宽，q 从 60 起，>18KB 则 -5 直到 <=18KB（下限 q=20）
wx = im.resize((540, round(540 * im.height / im.width)), Image.LANCZOS)
q = 60
out = os.path.join(WX_DIR, ID + '.jpg')
while True:
    wx.save(out, 'JPEG', quality=q, optimize=True)
    sz = os.path.getsize(out)
    if sz <= 18432 or q <= 20:
        break
    q -= 5

print(f'{ID}: PC={pc_sz}B  WX={sz}B q={q}')
