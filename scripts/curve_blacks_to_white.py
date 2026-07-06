"""
curve_blacks_to_white.py
------------------------
Applique une courbe sur les canaux RGB d'une vidéo :
  noir (0)   → blanc (255)
  gris (128) → gris  (128)  [inchangé]
  blanc(255) → blanc (255)  [inchangé]

La transparence (canal alpha du webm VP9) est préservée.

Usage :
    python scripts/curve_blacks_to_white.py input.webm output.webm

Dépendances : pip install numpy imageio imageio-ffmpeg
"""

import sys
import subprocess
import tempfile
import os
import numpy as np

# ── LUT (lookup table) : valeurs 0-255 → valeurs 0-255 ─────────────────────
# Courbe linéaire en deux segments :
#   [0, 128]  : 0→255, 128→128  (les noirs deviennent blancs, les gris mi-ton restent)
#   [128,255] : 128→128, 255→255 (les hautes lumières restent inchangées)
lut = np.zeros(256, dtype=np.uint8)
for i in range(256):
    if i <= 128:
        lut[i] = round(255 - 127 * i / 128)
    else:
        lut[i] = i


def apply_lut(channel: np.ndarray) -> np.ndarray:
    """Applique la LUT sur un canal 2D uint8."""
    return lut[channel]


def process(input_path: str, output_path: str) -> None:
    import imageio.v3 as iio

    print(f"Lecture : {input_path}")

    # Lire toutes les frames en RGBA pour préserver l'alpha
    frames = list(iio.imiter(input_path, plugin="pyav", format_hint=".webm"))
    if not frames:
        raise RuntimeError("Aucune frame lue. Vérifiez le fichier source.")

    first = frames[0]
    has_alpha = first.ndim == 3 and first.shape[2] == 4
    print(f"  {len(frames)} frames, {'RGBA' if has_alpha else 'RGB'}, {first.shape[1]}×{first.shape[0]}")

    processed = []
    for frame in frames:
        arr = np.array(frame, dtype=np.uint8)
        if has_alpha:
            # Appliquer la courbe sur R, G, B — laisser A intact
            arr[:, :, 0] = apply_lut(arr[:, :, 0])
            arr[:, :, 1] = apply_lut(arr[:, :, 1])
            arr[:, :, 2] = apply_lut(arr[:, :, 2])
        else:
            arr[:, :, 0] = apply_lut(arr[:, :, 0])
            arr[:, :, 1] = apply_lut(arr[:, :, 1])
            arr[:, :, 2] = apply_lut(arr[:, :, 2])
        processed.append(arr)

    print(f"Écriture : {output_path}")
    # Écrire avec pyav pour conserver l'alpha (yuva420p / rgba)
    iio.imwrite(
        output_path,
        processed,
        plugin="pyav",
        codec="vp9",
        fps=30,             # adapte si besoin
        pixelformat="yuva420p" if has_alpha else "yuv420p",
    )
    print("Terminé.")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage : python scripts/curve_blacks_to_white.py <input.webm> <output.webm>")
        sys.exit(1)
    process(sys.argv[1], sys.argv[2])
