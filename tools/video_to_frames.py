#!/usr/bin/env python3
"""Turn an AI-made unzip video into the frames the homepage intro scrubs through on scroll.

    python3 tools/video_to_frames.py path/to/unzip.mp4

Writes images/ai/unzip/0001.webp, 0002.webp ... (about 90 frames, 1600 px wide). Rebuild the
homepage afterwards: when that folder has frames, shot 1 of the intro plays them instead of the
photo zoom. Needs OpenCV (pip install opencv-python) and Pillow."""
import os, sys
import cv2
from PIL import Image

FRAMES, WIDTH, QUALITY = 90, 1600, 74
src = sys.argv[1]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'images', 'ai', 'unzip')
os.makedirs(out, exist_ok=True)
for f in os.listdir(out):
    if f.endswith('.webp'): os.remove(os.path.join(out, f))

cap = cv2.VideoCapture(src)
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
if total < 2: sys.exit(f'Could not read frames from {src}')
picks = [round(i * (total - 1) / (FRAMES - 1)) for i in range(FRAMES)]
size = 0
for n, k in enumerate(picks, 1):
    cap.set(cv2.CAP_PROP_POS_FRAMES, k)
    ok, frame = cap.read()
    if not ok: break
    im = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if im.width > WIDTH: im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
    path = os.path.join(out, f'{n:04d}.webp')
    im.save(path, 'WEBP', quality=QUALITY, method=5)
    size += os.path.getsize(path)
print(f'{n} frames from {total} ({size / 1e6:.1f} MB) in images/ai/unzip/')
