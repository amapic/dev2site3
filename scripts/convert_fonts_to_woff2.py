#!/usr/bin/env python3
"""Convert local TTF fonts to WOFF2 to reduce transfer size."""
import os
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent / "public" / "font"

FILES = [
    "Geist/static/Geist-Regular.ttf",
    "PlayfairDisplay-Bold avec deco.ttf",
]

for rel in FILES:
    src = ROOT / rel
    if not src.exists():
        print(f"SKIP: {src} not found")
        continue
    out = src.with_suffix(".woff2")
    font = TTFont(str(src))
    font.flavor = "woff2"
    font.save(str(out))
    original = src.stat().st_size // 1024
    saved = out.stat().st_size // 1024
    print(f"{src.name}: {original} KiB -> {out.name}: {saved} KiB")
