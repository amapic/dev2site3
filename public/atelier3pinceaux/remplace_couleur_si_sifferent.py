#!/usr/bin/env python3
"""
Traitement vidéo frame-by-frame :
Pour chaque frame, on parcourt les pixels par pas (STEP).
Si un pixel échantillon n'est proche d'AUCUNE couleur de référence,
on effectue un flood-fill et rend la région transparente.
Paramètres codés en dur.
"""
import os
import sys
from typing import List, Tuple
import cv2
import numpy as np
import imageio
from moviepy import VideoFileClip

# -------- PARAMÈTRES EN DUR --------
INPUT_VIDEO = "tmpu_cixqup.mp4"
OUTPUT_VIDEO = "outputfhfjfj.webm"  # .webm recommandé pour alpha (vp9)
REFS_STR = ["#050200", "#f6c446"]  # références (adaptable)
TOLERANCE = 30.0
STEP = 8
CONNECTIVITY = 4  # 4 ou 8
BITRATE = "2000k"
# -----------------------------------

def parse_color(s: str) -> Tuple[int,int,int]:
    s = s.strip()
    if s.startswith("#"):
        s = s[1:]
        if len(s) == 3:
            s = "".join([c*2 for c in s])
        r = int(s[0:2], 16); g = int(s[2:4], 16); b = int(s[4:6], 16)
        return (r,g,b)
    if "," in s:
        parts = [int(p.strip()) for p in s.split(",")]
        if len(parts) != 3:
            raise ValueError("Couleur doit être R,G,B")
        return (parts[0], parts[1], parts[2])
    raise ValueError("Format couleur invalide")

def color_distance_sq(c1: Tuple[int,int,int], c2: Tuple[int,int,int]) -> int:
    dr = c1[0]-c2[0]; dg = c1[1]-c2[1]; db = c1[2]-c2[2]
    return dr*dr + dg*dg + db*db

def is_close_to_any_ref(pixel_rgb: Tuple[int,int,int], refs: List[Tuple[int,int,int]], tol: float) -> bool:
    tol_sq = tol * tol
    for ref in refs:
        if color_distance_sq(pixel_rgb, ref) <= tol_sq:
            return True
    return False

def process_frame_floodfill(frame_rgb: np.ndarray, refs: List[Tuple[int,int,int]], tol: float, step: int, connectivity: int) -> np.ndarray:
    """
    frame_rgb : HxWx3 uint8 (RGB)
    Retourne HxWx4 uint8 (RGBA) with alpha=0 where filled.
    """
    h, w = frame_rgb.shape[:2]
    # Convertir en BGR pour OpenCV
    frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
    orig_bgr = frame_bgr.copy()
    work = frame_bgr.copy()
    img_bgra = cv2.cvtColor(orig_bgr, cv2.COLOR_BGR2BGRA)
    visited = np.zeros((h, w), dtype=bool)

    for y in range(0, h, max(1, step)):
        for x in range(0, w, max(1, step)):
            if visited[y, x]:
                continue

            b, g, r = work[y, x]
            pixel_rgb = (int(r), int(g), int(b))

            # Lancer floodFill SEULEMENT si pixel NON proche d'AUCUNE référence
            if is_close_to_any_ref(pixel_rgb, refs, tol):
                continue

            mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
            lo = (int(tol),) * 3
            up = (int(tol),) * 3
            newVal = (int(b), int(g), int(r))
            flags = connectivity

            try:
                cv2.floodFill(work, mask, (int(x), int(y)), newVal, loDiff=lo, upDiff=up, flags=flags)
            except Exception as e:
                print(f"warning: floodFill failed at ({x},{y}): {e}", file=sys.stderr)
                visited[y, x] = True
                continue

            filled = mask[1:-1, 1:-1].astype(bool)
            if not np.any(filled):
                visited[y, x] = True
                continue

            img_bgra[filled, 3] = 0
            visited[filled] = True

    # Convertir BGRA (OpenCV) -> RGBA (imageio expects RGB order)
    img_rgba = cv2.cvtColor(img_bgra, cv2.COLOR_BGRA2RGBA)
    return img_rgba

def video_process_stream(input_path: str, output_path: str, refs: List[Tuple[int,int,int]], tol: float, step: int, connectivity: int, bitrate: str):
    if not os.path.exists(input_path):
        raise FileNotFoundError(input_path)
    clip = VideoFileClip(input_path)
    fps = clip.fps

    # imageio writer: webm (vp9) with alpha
    writer = imageio.get_writer(
        output_path,
        fps=fps,
        codec='libvpx-vp9',
        bitrate=bitrate,
        ffmpeg_params=['-pix_fmt', 'yuva420p', '-auto-alt-ref', '0']
    )

    try:
        for frame in clip.iter_frames(dtype='uint8'):
            rgba = process_frame_floodfill(frame, refs, tol, step, connectivity)
            writer.append_data(rgba)
    finally:
        writer.close()
        clip.close()

if __name__ == "__main__":
    refs = [parse_color(s) for s in REFS_STR]
    video_process_stream(INPUT_VIDEO, OUTPUT_VIDEO, refs, TOLERANCE, STEP, CONNECTIVITY, BITRATE)
    print("Terminé :", OUTPUT_VIDEO)