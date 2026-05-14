"""
Compose a screenshot onto a portfolio card canvas (~21:11).

Scales the source with a uniform "contain" fit inside padded inner bounds so the full
interface stays visible (no aggressive crop). Adds rounded corners, soft shadow,
and a dark vignette-style background consistent across portfolio previews.

Requires Pillow.

Usage:
  python scripts/compose-portfolio-preview.py <raw_capture.png> <out.png>

Optional env:
  VERTICAL_BIAS=float in [-1, 1]  — shift content vertically when letterboxing (-1 top, +1 bottom)
"""
from __future__ import annotations

import os
import pathlib
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

CANVAS_W, CANVAS_H = 1200, 628
PAD = 26
CORNER_RADIUS = 18
SHADOW_BLUR = 13
SHADOW_OFFSET = (5, 10)
SHADOW_STRENGTH = 0.36
SUBTLE_BORDER = (255, 255, 255, 22)


def lerp_rgb(t: float, a: tuple[int, int, int], b: tuple[int, int, int]) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_background() -> Image.Image:
    top = (16, 18, 40)
    bottom = (6, 8, 18)
    im = Image.new("RGB", (CANVAS_W, CANVAS_H))
    pix = im.load()
    for y in range(CANVAS_H):
        ty = y / max(1, CANVAS_H - 1)
        rgb = lerp_rgb(ty, top, bottom)
        for x in range(CANVAS_W):
            dx = abs(x - CANVAS_W / 2) / (CANVAS_W / 2)
            dy = abs(y - CANVAS_H / 2) / (CANVAS_H / 2)
            vig = min(1.0, dx * dx * 0.2 + dy * dy * 0.12)
            r, g, b = rgb
            r = max(0, int(r * (1 - vig * 0.22)))
            g = max(0, int(g * (1 - vig * 0.2)))
            b = max(0, int(b * (1 - vig * 0.28)))
            pix[x, y] = (r, g, b)
    return im


def rounded_rectangle_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def biased_offset(free_px: float, bias: float) -> int:
    """Map bias in [-1,1] to offset within [0, free_px]."""
    b = max(-1.0, min(1.0, bias))
    # positive bias pushes content down slightly (useful when subject sits low)
    t = (b + 1) / 2
    return max(0, min(int(round(free_px * t)), max(0, int(free_px))))


def main() -> None:
    bias_str = os.environ.get("VERTICAL_BIAS", "0").strip()
    try:
        vertical_bias = float(bias_str)
    except ValueError:
        vertical_bias = 0.0

    if len(sys.argv) < 3:
        root = pathlib.Path(__file__).resolve().parent.parent
        print("usage: python scripts/compose-portfolio-preview.py <in.png> <out.png>")
        print("cwd root:", root)
        sys.exit(1)

    raw_path = pathlib.Path(sys.argv[1])
    out_path = pathlib.Path(sys.argv[2])

    if not raw_path.is_file():
        print("missing", raw_path)
        sys.exit(1)

    ui = Image.open(raw_path).convert("RGBA")
    cw_inner = CANVAS_W - 2 * PAD
    ch_inner = CANVAS_H - 2 * PAD
    uw, uh = ui.size

    scale = min(cw_inner / uw, ch_inner / uh)
    nw = max(1, int(round(uw * scale)))
    nh = max(1, int(round(uh * scale)))
    fg = ui.resize((nw, nh), Image.Resampling.LANCZOS).convert("RGBA")

    free_x = cw_inner - nw
    free_y = ch_inner - nh
    off_x = free_x // 2
    off_y = biased_offset(float(free_y), vertical_bias) if free_y > 0 else 0

    sheet = Image.new("RGBA", (cw_inner, ch_inner), (0, 0, 0, 0))
    sheet.alpha_composite(fg, (off_x, off_y))

    corner_mask = rounded_rectangle_mask((cw_inner, ch_inner), CORNER_RADIUS)
    r, g, b, alpha = sheet.split()
    sheet = Image.merge(
        "RGBA",
        (r, g, b, ImageChops.multiply(alpha, corner_mask)),
    )

    draw = ImageDraw.Draw(sheet)
    draw.rounded_rectangle(
        (0, 0, cw_inner - 1, ch_inner - 1),
        radius=CORNER_RADIUS,
        outline=(SUBTLE_BORDER[0], SUBTLE_BORDER[1], SUBTLE_BORDER[2]),
        width=1,
    )

    blur_pad = SHADOW_BLUR * 4
    sh_canvas_w = cw_inner + blur_pad * 2
    sh_canvas_h = ch_inner + blur_pad * 2
    shadow_canvas = Image.new("RGBA", (sh_canvas_w, sh_canvas_h), (0, 0, 0, 0))
    sh_blob = Image.new(
        "RGBA",
        (cw_inner, ch_inner),
        (0, 0, 0, int(255 * SHADOW_STRENGTH)),
    )
    sh_blob.putalpha(corner_mask)
    shadow_canvas.paste(sh_blob, (blur_pad, blur_pad), sh_blob)
    shadow_rgba = shadow_canvas.filter(ImageFilter.GaussianBlur(SHADOW_BLUR))

    base = make_background().convert("RGBA")

    fg_x = PAD
    fg_y = PAD
    sh_x = fg_x - blur_pad + SHADOW_OFFSET[0]
    sh_y = fg_y - blur_pad + SHADOW_OFFSET[1]
    base.alpha_composite(shadow_rgba, (sh_x, sh_y))
    base.alpha_composite(sheet, (fg_x, fg_y))

    base.convert("RGB").save(out_path, quality=93, optimize=True)
    print(
        "wrote",
        out_path,
        f"contain {nw}x{nh} in {cw_inner}x{ch_inner}, raw {uw}x{uh}, bias_y={vertical_bias}",
    )


if __name__ == "__main__":
    main()
