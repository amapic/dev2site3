from moviepy import VideoFileClip
from moviepy.video.fx.Crop import Crop

INPUT = "./outputfhfjfj.webm"
OUTPUT = "./outputcrop.mp4"
BAND = 100  # pixels à retirer sur chaque côté

video = VideoFileClip(INPUT)

# dimensions origine
w, h = video.size

# nouvelle taille après retrait égal de BAND sur chaque côté
new_w = max(1, int(w - 2 * BAND))
new_h = max(1, int(h - 2 * BAND))

# centre (float OK)
midpoint_x = w / 2
midpoint_y = h / 2

print(f"Orig: {w}x{h}, band {BAND}px -> new {new_w}x{new_h}, center ({midpoint_x},{midpoint_y})")

# Crop en utilisant la même API que ton exemple
video = video.with_effects([
    Crop(
        x_center=midpoint_x,
        y_center=midpoint_y,
        width=new_w,
        height=new_h
    )
])

video.write_videofile(
    OUTPUT,
    codec="libx264",
    audio_codec="aac"
)