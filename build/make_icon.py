"""Builds build/icon.ico (and icon.png) from the QCreate artwork.

It auto-detects the QR+pencil symbol (ignoring the "QCreate" wordmark at the
bottom), crops a padded square around it on the original dark background, and
exports a multi-resolution Windows .ico. Run: python build/make_icon.py
"""
from PIL import Image

SRC = "build/qcreate-source.png"

img = Image.open(SRC).convert("RGB")
W, H = img.size
px = img.load()

# Background color sampled from a corner.
bg = px[3, 3]


def is_symbol(p):
    # Non-background = clearly brighter than the near-black background.
    return max(p) > 45 and (abs(p[0] - bg[0]) + abs(p[1] - bg[1]) + abs(p[2] - bg[2])) > 60


# Scan only the top ~63% of the image so the wordmark text is excluded.
limit_y = int(H * 0.63)
minx, miny, maxx, maxy = W, H, 0, 0
for y in range(0, limit_y):
    for x in range(0, W):
        if is_symbol(px[x, y]):
            if x < minx:
                minx = x
            if x > maxx:
                maxx = x
            if y < miny:
                miny = y
            if y > maxy:
                maxy = y

if maxx <= minx or maxy <= miny:
    # Fallback: use the whole image if detection failed.
    minx, miny, maxx, maxy = 0, 0, W, H

bw = maxx - minx
bh = maxy - miny
cx = (minx + maxx) / 2
cy = (miny + maxy) / 2

# Square side with ~26% padding around the detected symbol.
side = int(max(bw, bh) * 1.26)
half = side // 2
left = int(cx - half)
top = int(cy - half)

# Compose onto a square canvas filled with the background so out-of-bounds
# crops are padded cleanly.
canvas = Image.new("RGB", (side, side), bg)
src_left = max(left, 0)
src_top = max(top, 0)
src_right = min(left + side, W)
src_bottom = min(top + side, H)
region = img.crop((src_left, src_top, src_right, src_bottom))
canvas.paste(region, (src_left - left, src_top - top))

icon = canvas.resize((1024, 1024), Image.LANCZOS)
icon.save("build/icon.png")
icon.save(
    "build/icon.ico",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
print(f"detected symbol bbox=({minx},{miny},{maxx},{maxy}) side={side}")
print("wrote build/icon.ico and build/icon.png")
