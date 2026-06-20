import cv2
import subprocess
import os

VIDEO1 = "runwayml1.mp4"
VIDEO2 = "runwayml2.mp4"
FRAME_CUT = 118  # frame où commence la correspondance
OUTPUT = "resultatY.mp4"

# Récupération du FPS
cap = cv2.VideoCapture(VIDEO1)
fps = cap.get(cv2.CAP_PROP_FPS)
cap.release()

timestamp = FRAME_CUT / fps

print(f"Découpe à {timestamp:.3f}s")

# Étape 1 : couper la première vidéo
subprocess.run([
    "ffmpeg",
    "-y",
    "-i", VIDEO1,
    "-t", str(timestamp),
    "-c", "copy",
    "part1.mp4"
], check=True)

# Étape 2 : concaténer
with open("concat.txt", "w", encoding="utf-8") as f:
    f.write(f"file '{os.path.abspath('part1.mp4')}'\n")
    f.write(f"file '{os.path.abspath(VIDEO2)}'\n")

subprocess.run([
    "ffmpeg",
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", "concat.txt",
    "-c", "copy",
    OUTPUT
], check=True)

print(f"Vidéo créée : {OUTPUT}")