# -*- coding: utf-8 -*-
"""将背景音乐合入片尾巡礼视频。默认曲目：国风堂《知我》。

用法:
  python mux_credits_music.py
  python mux_credits_music.py --video <in.mp4> --music <track.mp3> --out <out.mp4>

音乐文件优先在 data/music/ 下查找（知我.mp3 / 知我.wav / 国风堂-知我.mp3 等）。
找不到时退出并提示放置路径；不会从网络抓取受版权保护的音源。
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

PROJ = Path(r"C:\Users\Administrator\Desktop\jianlai")
FFMPEG = PROJ / "tools" / "_rembg_venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe"
MUSIC_DIRS = [PROJ / "data" / "music"]
VIDEO_DEFAULT = PROJ / "video" / "output" / "剑来_角色巡礼片尾_卷轴水墨.mp4"
OUT_DEFAULT = PROJ / "video" / "output" / "剑来_角色巡礼片尾_卷轴水墨_配乐.mp4"

CANDIDATE_NAMES = [
    "知我.mp3",
    "知我.wav",
    "知我.m4a",
    "知我.flac",
    "国风堂-知我.mp3",
    "国风堂_知我.mp3",
    "国风堂《知我》.mp3",
    "zhiwo.mp3",
]


def find_music() -> Path | None:
    for d in MUSIC_DIRS:
        if not d.exists():
            continue
        for name in CANDIDATE_NAMES:
            p = d / name
            if p.exists():
                return p
        hits = list(d.glob("*知我*")) + list(d.glob("*国风堂*"))
        hits = [h for h in hits if h.suffix.lower() in {".mp3", ".wav", ".m4a", ".flac", ".aac"}]
        if hits:
            return hits[0]
    return None


def mux(video: Path, music: Path, out: Path) -> None:
    if not video.exists():
        raise SystemExit(f"video not found: {video}")
    if not FFMPEG.exists():
        raise SystemExit(f"ffmpeg not found: {FFMPEG}")
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        str(FFMPEG),
        "-y",
        "-i",
        str(video),
        "-i",
        str(music),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "256k",
        "-shortest",
        "-movflags",
        "+faststart",
        str(out),
    ]
    print(" ".join(cmd))
    subprocess.run(cmd, check=True)
    print(f"done -> {out} ({out.stat().st_size} bytes)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", type=Path, default=VIDEO_DEFAULT)
    ap.add_argument("--music", type=Path, default=None)
    ap.add_argument("--out", type=Path, default=OUT_DEFAULT)
    args = ap.parse_args()
    music = args.music or find_music()
    if music is None:
        place = MUSIC_DIRS[0]
        place.mkdir(parents=True, exist_ok=True)
        raise SystemExit(
            "未找到《知我》音频。请将正版音源放到:\n"
            f"  {place}\\知我.mp3\n"
            "然后重跑本脚本。不会从网络抓取受版权保护的歌曲。"
        )
    print(f"music: {music}")
    print(f"video: {args.video}")
    mux(args.video, music, args.out)


if __name__ == "__main__":
    main()
