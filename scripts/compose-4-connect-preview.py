"""
Compose a framed 4 Connect screenshot onto a portfolio-card canvas (~21:11).
Requires Pillow. Inputs: raw full-UI PNG path, output PNG path.
"""
from __future__ import annotations

import pathlib
import sys

from PIL import Image, ImageDraw, ImageFilter

CANVAS_W, CANVAS_H = 1200, 628
PAD = 52
CORNER_RADIUS = 22
SHADOW_BLUR = 16
SHADOW_OFFSET = (8, 18)
SHADOW_STRENGTH = 0.42


def lerp_rgb(t: float, a: tuple[int, int, int], b: tuple[int, int, int]) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_background() -> Image.Image:
    top = (20, 26, 52)
    bottom = (6, 9, 20)
    im = Image.new("RGB", (CANVAS_W, CANVAS_H))
    pix = im.load()
    for y in range(CANVAS_H):
        ty = y / max(1, CANVAS_H - 1)
        rgb = lerp_rgb(ty, top, bottom)
        for x in range(CANVAS_W):
            dx = abs(x - CANVAS_W / 2) / (CANVAS_W / 2)
            dy = abs(y - CANVAS_H / 2) / (CANVAS_H / 2)
            vig = min(1.0, dx * dx * 0.2 + dy * dy * 0.16)
            r, g, b = rgb
            r = max(0, int(r * (1 - vig * 0.22)))
            g = max(0, int(g * (1 - vig * 0.22)))
            b = max(0, int(b * (1 - vig * 0.32)))
            pix[x, y] = (r, g, b)
    return im


def rounded_rectangle_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def main() -> None:
    root = pathlib.Path(__file__).resolve().parent.parent
    raw_path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / "public" / "previews" / "_4-connect-raw.png"
    out_path = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else root / "public" / "previews" / "4-connect.png"

    if not raw_path.is_file():
        print("missing", raw_path)
        sys.exit(1)

    ui = Image.open(raw_path).convert("RGBA")

    cw, ch = CANVAS_W - 2 * PAD, CANVAS_H - 2 * PAD
    uw, uh = ui.size
    scale = min(cw / uw, ch / uh)
    nw = max(1, int(uw * scale))
    nh = max(1, int(uh * scale))

    fg = ui.resize((nw, nh), Image.Resampling.LANCZOS).convert("RGBA")
    mask = rounded_rectangle_mask((nw, nh), CORNER_RADIUS)
    fg.putalpha(mask)

    blur_pad = SHADOW_BLUR * 4
    sh_canvas_w = nw + blur_pad * 2
    sh_canvas_h = nh + blur_pad * 2
    shadow_canvas = Image.new("RGBA", (sh_canvas_w, sh_canvas_h), (0, 0, 0, 0))
    sh_blob = Image.new("RGBA", (nw, nh), (0, 0, 0, int(255 * SHADOW_STRENGTH)))
    sh_blob.putalpha(mask)
    shadow_canvas.paste(sh_blob, (blur_pad, blur_pad), sh_blob)
    shadow_rgba = shadow_canvas.filter(ImageFilter.GaussianBlur(SHADOW_BLUR))

    base = make_background().convert("RGBA")

    sh_x = (CANVAS_W - sh_canvas_w) // 2 + SHADOW_OFFSET[0]
    sh_y = (CANVAS_H - sh_canvas_h) // 2 + SHADOW_OFFSET[1]
    base.alpha_composite(shadow_rgba, (sh_x, sh_y))

    fx = (CANVAS_W - nw) // 2
    fy = (CANVAS_H - nh) // 2
    base.alpha_composite(fg, (fx, fy))

    base.convert("RGB").save(out_path, quality=93, optimize=True)
    print("wrote", out_path, f"device {nw}x{nh} on canvas {CANVAS_W}x{CANVAS_H}")


if __name__ == "__main__":
    main()
