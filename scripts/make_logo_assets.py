"""Build EcoPulse brand assets from the original logo (white background).
Usage: python scripts/make_logo_assets.py <logo-file> <project-root>
Pure Pillow, no numpy. Original colours are kept; only the white background is removed."""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, root = sys.argv[1], sys.argv[2]
PUB, ASSETS, DOCS = (os.path.join(root, p) for p in ("public", os.path.join("src", "assets"), "docs"))
for d in (PUB, ASSETS, DOCS):
    os.makedirs(d, exist_ok=True)

img = Image.open(src).convert("RGB")
w, h = img.size
# Logo colour = most common dark pixel (flat green)
counts = {}
for y in range(0, h, 4):
    for x in range(0, w, 4):
        p = img.getpixel((x, y))
        if p[0] < 120:
            counts[p] = counts.get(p, 0) + 1
RC, GC, BC = max(counts, key=counts.get)
print("logo colour:", (RC, GC, BC))

# Alpha from how far the red channel is from white; colour stays flat -> clean edges on any background
red = img.split()[0]
alpha = red.point(lambda v: max(0, min(255, round((250 - v) * 255 / (250 - RC)))))
logo = Image.new("RGBA", img.size, (RC, GC, BC, 0))
logo.putalpha(alpha)

# Tight crop + square canvas with small padding
box = alpha.point(lambda v: 255 if v > 24 else 0).getbbox()
logo = logo.crop(box)
side = max(logo.size)

def square(pad):
    canvas = Image.new("RGBA", (round(side * (1 + 2 * pad)),) * 2, (0, 0, 0, 0))
    canvas.paste(logo, ((canvas.width - logo.width) // 2, (canvas.height - logo.height) // 2), logo)
    return canvas

def fit(im, size):
    return im.resize((size, size), Image.LANCZOS)

def on_bg(im, size, bg, pad):
    base = Image.new("RGBA", (size, size), bg)
    inner = fit(square(pad), size)
    base.alpha_composite(inner)
    return base

MINT = (230, 244, 234, 255)
tight, padded = square(0.03), square(0.10)
fit(padded, 1024).save(os.path.join(DOCS, "logo-1024.png"))
fit(padded, 512).save(os.path.join(ASSETS, "ecopulse-logo.webp"), quality=95, method=6)
fit(padded, 512).save(os.path.join(DOCS, "logo.png"))
# Favicons (transparent, tight so the mark is as large as possible in a tab)
f = [fit(tight, s) for s in (16, 32, 48)]
f[2].save(os.path.join(PUB, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)], append_images=[f[0], f[1]])
fit(tight, 32).save(os.path.join(PUB, "favicon-32.png"))
fit(tight, 16).save(os.path.join(PUB, "favicon-16.png"))
# Home-screen / PWA style icons
on_bg(logo, 180, MINT, 0.16).convert("RGB").save(os.path.join(PUB, "apple-touch-icon.png"))
fit(square(0.10), 192).save(os.path.join(PUB, "icon-192.png"))
fit(square(0.10), 512).save(os.path.join(PUB, "icon-512.png"))
on_bg(logo, 512, MINT, 0.28).convert("RGB").save(os.path.join(PUB, "icon-maskable-512.png"))

# Social preview cards: leaf background + frosted panel + logo + wordmark
def font(size):
    for name in ("segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()

def card(W, H, out):
    bg = Image.new("RGB", (W, H), (236, 247, 240))
    leaf = os.path.join(ASSETS, "leaf-bg.webp")
    if os.path.exists(leaf):
        lb = Image.open(leaf).convert("RGB")
        k = max(W / lb.width, H / lb.height)
        lb = lb.resize((round(lb.width * k), round(lb.height * k)), Image.LANCZOS)
        bg = lb.crop(((lb.width - W) // 2, (lb.height - H) // 2, (lb.width + W) // 2, (lb.height + H) // 2))
    bg = bg.convert("RGBA")
    pw, ph = round(W * 0.78), round(H * 0.62)
    x0, y0 = (W - pw) // 2, (H - ph) // 2
    panel = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(panel).rounded_rectangle((x0, y0, x0 + pw, y0 + ph), radius=36, fill=(255, 255, 255, 215), outline=(255, 255, 255, 255), width=2)
    bg.alpha_composite(panel)
    lg = fit(padded, round(ph * 0.72))
    bg.alpha_composite(lg, (x0 + round(pw * 0.07), y0 + (ph - lg.height) // 2))
    d = ImageDraw.Draw(bg)
    tx = x0 + round(pw * 0.07) + lg.width + round(pw * 0.04)
    room = x0 + pw - round(pw * 0.05) - tx
    def fitted(text, size):
        while size > 10 and d.textlength(text, font=font(size)) > room:
            size -= 2
        return font(size)
    d.text((tx, y0 + ph * 0.27), "EcoPulse", font=fitted("EcoPulse", round(ph * 0.24)), fill=(18, 61, 41, 255))
    d.text((tx, y0 + ph * 0.58), "Smart Energy Saving Reminder", font=fitted("Smart Energy Saving Reminder", round(ph * 0.095)), fill=(63, 93, 75, 255))
    bg.convert("RGB").save(out, quality=92)

card(1200, 630, os.path.join(PUB, "og-image.png"))
card(1280, 640, os.path.join(DOCS, "social-preview.png"))
print("done")
