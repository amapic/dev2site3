#!/usr/bin/env python3
"""Generate responsive AVIF/WebP variants for key images."""
import os
from pathlib import Path
from PIL import Image
import pillow_avif  # noqa: F401 — registers AVIF support in Pillow

ROOT = Path(__file__).resolve().parent.parent / "public"
OUT = ROOT  # write variants next to originals

# (source, basename, widths, quality_avif, quality_webp, sizes_hint)
TASKS = [
    ("fond.png", "fond", [200, 400, 800, 1200, 1920], 75, 85, "100vw"),
    ("fond jaune 2.png", "fond-jaune-2", [400, 800, 1200, 1600], 75, 85, "100vw"),
    ("carroussel/image (1).png", "carroussel/image-1", [400, 800], 78, 85, "(max-width: 768px) 100vw, 50vw"),
    ("logo/insta.png", "logo/insta", [34, 68], 80, 85, "34px"),
]


def save_variant(img: Image.Image, out_path: Path, fmt: str, quality: int) -> None:
    kwargs = {"quality": quality}
    if fmt == "AVIF":
        kwargs["method"] = "avm"

    has_alpha = img.mode in ("RGBA", "LA", "PA") or (img.mode == "P" and "transparency" in img.info)
    if has_alpha:
        # Preserve alpha for both AVIF and WebP
        rgba = img.convert("RGBA") if img.mode != "RGBA" else img
        rgba.save(out_path, fmt, **kwargs)
    else:
        rgb = img.convert("RGB") if img.mode in ("RGBA", "P", "LA") else img
        rgb.save(out_path, fmt, **kwargs)


def process(src_name: str, basename: str, widths: list[int], q_avif: int, q_webp: int, _sizes_hint: str) -> None:
    src = ROOT / src_name
    if not src.exists():
        print(f"SKIP: {src} not found")
        return

    img = Image.open(src)
    original_w, original_h = img.size
    print(f"Processing {src_name} ({original_w}x{original_h})")

    for w in widths:
        if w >= original_w:
            resized = img
            suffix_w = original_w
        else:
            ratio = w / original_w
            h = max(1, round(original_h * ratio))
            resized = img.resize((w, h), Image.LANCZOS)
            suffix_w = w

        # For original size we omit the width suffix
        suffix = "" if suffix_w == original_w else f"-{suffix_w}"
        out_avif = OUT / f"{basename}{suffix}.avif"
        out_webp = OUT / f"{basename}{suffix}.webp"

        save_variant(resized.copy(), out_avif, "AVIF", q_avif)
        save_variant(resized.copy(), out_webp, "WEBP", q_webp)
        print(f"  -> {out_avif.name} ({out_avif.stat().st_size // 1024} KiB), {out_webp.name} ({out_webp.stat().st_size // 1024} KiB)")


if __name__ == "__main__":
    for task in TASKS:
        process(*task)
    print("Done.")
