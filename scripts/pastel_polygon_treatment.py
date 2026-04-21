from __future__ import annotations

import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps


PALETTE = [
    (255, 116, 88, 210),
    (255, 164, 54, 196),
    (255, 110, 168, 188),
    (255, 214, 70, 184),
    (104, 218, 255, 186),
    (255, 145, 104, 176),
]


def fit_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    src_w, src_h = image.size
    dst_w, dst_h = size
    scale = max(dst_w / src_w, dst_h / src_h)
    resized = image.resize((int(src_w * scale), int(src_h * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - dst_w) // 2
    top = (resized.height - dst_h) // 2
    return resized.crop((left, top, left + dst_w, top + dst_h))


def build_subject_mask(size: tuple[int, int]) -> Image.Image:
    width, height = size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((width * 0.18, height * 0.16, width * 0.82, height * 0.9), fill=190)
    draw.rectangle((width * 0.14, height * 0.32, width * 0.86, height * 0.74), fill=205)
    draw.ellipse((width * 0.08, height * 0.28, width * 0.34, height * 0.72), fill=156)
    draw.ellipse((width * 0.66, height * 0.26, width * 0.94, height * 0.74), fill=122)
    return mask.filter(ImageFilter.GaussianBlur(28))


def add_polygons(base: Image.Image, rng: random.Random, focus_box: tuple[int, int, int, int]) -> Image.Image:
    width, height = base.size
    overlay = Image.new("RGBA", base.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    x0, y0, x1, y1 = focus_box

    for _ in range(210):
        cx = rng.uniform(x0, x1)
        cy = rng.uniform(y0, y1)
        radius = rng.uniform(width * 0.035, width * 0.13)
        angle = rng.uniform(0, math.pi * 2)
        points = []
        for index in range(3):
            theta = angle + index * (math.pi * 2 / 3) + rng.uniform(-0.3, 0.3)
            local_radius = radius * rng.uniform(0.6, 1.15)
            px = cx + math.cos(theta) * local_radius
            py = cy + math.sin(theta) * local_radius
            points.append((px, py))
        draw.polygon(points, fill=rng.choice(PALETTE))

    for _ in range(26):
        cx = rng.uniform(width * 0.08, width * 0.92)
        cy = rng.uniform(height * 0.2, height * 0.78)
        radius = rng.uniform(width * 0.02, width * 0.05)
        points = []
        for index in range(3):
            theta = rng.uniform(0, math.pi * 2) + index * 2.1
            points.append((cx + math.cos(theta) * radius, cy + math.sin(theta) * radius))
        draw.polygon(points, fill=rng.choice(PALETTE[:-1]))

    return overlay.filter(ImageFilter.GaussianBlur(1.2))


def shrink_subject(source: Image.Image, canvas_size: tuple[int, int]) -> Image.Image:
    width, height = canvas_size
    focus_crop = source.crop((120, 10, 650, 495))
    subject_w = int(width * 0.4)
    subject_h = int(height * 0.56)

    fitted = fit_cover(focus_crop, (subject_w, subject_h))
    fitted = ImageEnhance.Color(fitted).enhance(0.9)
    fitted = ImageEnhance.Contrast(fitted).enhance(0.68)
    fitted = ImageEnhance.Brightness(fitted).enhance(1.12)
    fitted = fitted.filter(ImageFilter.GaussianBlur(1.6))

    canvas = Image.new("RGBA", canvas_size, (255, 255, 255, 0))
    left = (width - subject_w) // 2
    top = int(height * 0.2)

    mask = Image.new("L", (subject_w, subject_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((8, 4, subject_w - 8, subject_h - 10), fill=220)
    mask_draw.polygon(
        [
            (subject_w * 0.1, subject_h * 0.7),
            (subject_w * 0.24, subject_h * 0.12),
            (subject_w * 0.78, subject_h * 0.08),
            (subject_w * 0.92, subject_h * 0.62),
            (subject_w * 0.74, subject_h * 0.94),
            (subject_w * 0.2, subject_h * 0.9),
        ],
        fill=232,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(18))

    layer = Image.new("RGBA", (subject_w, subject_h), (255, 255, 255, 0))
    layer.paste(fitted.convert("RGBA"), (0, 0))
    alpha_canvas = Image.new("L", canvas_size, 0)
    alpha_canvas.paste(mask, (left, top))
    canvas.alpha_composite(layer, (left, top))
    canvas.putalpha(alpha_canvas)
    return canvas


def build_subject_island_mask(size: tuple[int, int]) -> Image.Image:
    width, height = size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(
        [
            (300, 130),
            (420, 110),
            (585, 120),
            (710, 154),
            (756, 238),
            (714, 336),
            (568, 384),
            (396, 360),
            (282, 300),
            (238, 208),
        ],
        fill=230,
    )
    draw.ellipse((252, 118, 744, 392), fill=184)
    return mask.filter(ImageFilter.GaussianBlur(34))


def add_edge_polygons(size: tuple[int, int], rng: random.Random) -> Image.Image:
    width, height = size
    overlay = Image.new("RGBA", size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")

    clusters = [
        (0.16, 0.48, 16),
        (0.32, 0.34, 14),
        (0.67, 0.35, 14),
        (0.84, 0.48, 16),
        (0.5, 0.68, 14),
    ]

    for cx_ratio, cy_ratio, count in clusters:
        cx = width * cx_ratio
        cy = height * cy_ratio
        for _ in range(count):
            radius = rng.uniform(width * 0.05, width * 0.11)
            local_cx = cx + rng.uniform(-width * 0.08, width * 0.08)
            local_cy = cy + rng.uniform(-height * 0.1, height * 0.1)
            angle = rng.uniform(0, math.pi * 2)
            points = []
            for index in range(3):
                theta = angle + index * (math.pi * 2 / 3) + rng.uniform(-0.16, 0.16)
                points.append(
                    (
                        local_cx + math.cos(theta) * radius * rng.uniform(0.9, 1.15),
                        local_cy + math.sin(theta) * radius * rng.uniform(0.9, 1.15),
                    )
                )
            draw.polygon(points, fill=rng.choice(PALETTE))

    return overlay.filter(ImageFilter.GaussianBlur(0.8))


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: python scripts/pastel_polygon_treatment.py <input> <output> [seed]")
        return 1

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    seed = int(sys.argv[3]) if len(sys.argv) > 3 else 17
    rng = random.Random(seed)

    canvas_size = (1024, 512)
    source = Image.open(input_path).convert("RGB")
    source = fit_cover(source, canvas_size)

    softened = ImageEnhance.Color(source).enhance(0.88)
    softened = ImageEnhance.Contrast(softened).enhance(0.76)
    softened = ImageEnhance.Brightness(softened).enhance(1.06)

    white_bg = Image.new("RGB", canvas_size, (248, 245, 240))
    subject_layer = shrink_subject(softened, canvas_size)
    island_mask = build_subject_island_mask(canvas_size)

    merged = Image.new("RGBA", canvas_size, (252, 249, 244, 255))
    merged.alpha_composite(subject_layer)

    haze = Image.new("RGBA", canvas_size, (255, 255, 255, 0))
    haze_draw = ImageDraw.Draw(haze, "RGBA")
    haze_draw.ellipse((-120, -60, 480, 420), fill=(255, 174, 88, 34))
    haze_draw.ellipse((580, -40, 1140, 420), fill=(255, 156, 74, 30))
    haze_draw.ellipse((260, 60, 850, 500), fill=(255, 124, 184, 26))
    haze_draw.ellipse((140, -40, 980, 360), fill=(104, 218, 255, 24))
    haze = haze.filter(ImageFilter.GaussianBlur(30))

    polygons = add_polygons(merged.convert("RGBA"), rng, (212, 96, 808, 406))
    edge_polygons = add_edge_polygons(canvas_size, rng)

    ribbon_mask = Image.new("L", canvas_size, 0)
    ribbon_draw = ImageDraw.Draw(ribbon_mask)
    ribbon_draw.polygon(
        [
            (85, 245),
            (240, 146),
            (545, 112),
            (845, 170),
            (948, 245),
            (860, 338),
            (530, 394),
            (205, 352),
        ],
        fill=255,
    )
    ribbon_mask = ribbon_mask.filter(ImageFilter.GaussianBlur(28))

    polygon_band = Image.composite(polygons, Image.new("RGBA", canvas_size, (255, 255, 255, 0)), ribbon_mask)
    edge_band = Image.composite(edge_polygons, Image.new("RGBA", canvas_size, (255, 255, 255, 0)), ImageChops.lighter(ribbon_mask, ImageOps.invert(island_mask)))

    result = Image.alpha_composite(merged.convert("RGBA"), haze)
    result = Image.alpha_composite(result, edge_band)
    result = Image.alpha_composite(result, polygon_band)

    ghost_subject = subject_layer.copy()
    ghost_subject.putalpha(subject_layer.getchannel("A").point(lambda value: int(value * 0.62)))
    result = Image.alpha_composite(result, ghost_subject)

    bloom = result.filter(ImageFilter.GaussianBlur(16))
    result = Image.blend(result, bloom, 0.16)

    fade_mask = Image.new("L", canvas_size, 0)
    fade_draw = ImageDraw.Draw(fade_mask)
    fade_draw.ellipse((145, 100, 880, 410), fill=110)
    fade_draw.polygon([(58, 256), (236, 122), (800, 118), (970, 256), (808, 392), (220, 388)], fill=96)
    fade_mask = fade_mask.filter(ImageFilter.GaussianBlur(82))
    result = Image.composite(result, Image.new("RGBA", canvas_size, (248, 245, 240, 255)), fade_mask)

    veil = Image.new("RGBA", canvas_size, (255, 248, 240, 18))
    result = Image.alpha_composite(result, veil)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.convert("RGB").save(output_path, quality=96)
    print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())