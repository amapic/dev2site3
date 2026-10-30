import subprocess
import os

video1 = "runwayml1.mp4"
video2 = "runwayml2.mp4"
output = "fusion.mp4"

# Création du fichier de liste pour ffmpeg
with open("concat.txt", "w", encoding="utf-8") as f:
    f.write(f"file '{os.path.abspath(video1)}'\n")
    f.write(f"file '{os.path.abspath(video2)}'\n")

# Concaténation
subprocess.run([
    "ffmpeg",
    "-f", "concat",
    "-safe", "0",
    "-i", "concat.txt",
    "-c", "copy",
    output
], check=True)

print(f"Vidéo créée : {output}")