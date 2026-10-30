"""
Extrait des images depuis une vidéo tous les X secondes.

Usage:
    python extract_frames.py <video> <intervalle_secondes> [dossier_sortie]

Exemples:
    python extract_frames.py ma_video.mp4 5
    python extract_frames.py ma_video.mp4 2.5 frames_output
"""

import cv2
import os
import sys
import argparse
from pathlib import Path


def extract_frames(video_path: str, interval: float, output_dir: str | None = None) -> None:
    video_path = Path(video_path)
    if not video_path.exists():
        print(f"Erreur : fichier introuvable : {video_path}")
        sys.exit(1)

    if output_dir is None:
        output_dir = video_path.stem + "_frames"
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"Erreur : impossible d'ouvrir la vidéo : {video_path}")
        sys.exit(1)

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0

    print(f"Vidéo    : {video_path.name}")
    print(f"FPS      : {fps:.2f}")
    print(f"Durée    : {duration:.1f}s  ({total_frames} frames)")
    print(f"Intervalle : {interval}s")
    print(f"Sortie   : {output_dir.resolve()}")
    print()

    frame_interval = fps * interval  # nombre de frames entre chaque capture
    saved = 0
    frame_index = 0
    next_capture = 0.0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_index >= next_capture:
            timestamp = frame_index / fps
            filename = output_dir / f"frame_{saved:04d}_{timestamp:.2f}s.jpg"
            cv2.imwrite(str(filename), frame)
            print(f"  Sauvegardé : {filename.name}  (t={timestamp:.2f}s)")
            saved += 1
            next_capture += frame_interval

        frame_index += 1

    cap.release()
    print(f"\nTerminé : {saved} image(s) extraite(s) dans '{output_dir.resolve()}'")


def main():
    parser = argparse.ArgumentParser(
        description="Extrait des frames d'une vidéo tous les X secondes."
    )
    parser.add_argument("video", help="Chemin vers la vidéo source")
    parser.add_argument(
        "interval",
        type=float,
        help="Intervalle en secondes entre chaque capture (ex: 2 ou 0.5)",
    )
    parser.add_argument(
        "output",
        nargs="?",
        default=None,
        help="Dossier de sortie (optionnel, par défaut : <nom_video>_frames/)",
    )
    args = parser.parse_args()

    if args.interval <= 0:
        print("Erreur : l'intervalle doit être supérieur à 0.")
        sys.exit(1)

    extract_frames(args.video, args.interval, args.output)


if __name__ == "__main__":
    main()
