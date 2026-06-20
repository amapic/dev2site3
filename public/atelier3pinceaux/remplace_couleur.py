import cv2
import numpy as np
from moviepy.editor import VideoFileClip, ImageSequenceClip
# f6c446
#050200
def flood_fill_transparent(frame, x, y, tolerance=10):
    # frame : RGB uint8 (moviepy)
    h, w = frame.shape[:2]
    frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
    seed = (int(x), int(y))
    flood_img = frame_bgr.copy()
    loDiff = (tolerance, tolerance, tolerance)
    upDiff = (tolerance, tolerance, tolerance)
    cv2.floodFill(flood_img, mask, seed, (0, 0, 0), loDiff=loDiff, upDiff=upDiff)
    filled = mask[1:-1, 1:-1] != 0
    frame_rgba = cv2.cvtColor(frame, cv2.COLOR_RGB2RGBA)
    frame_rgba[filled, 3] = 0
    return frame_rgba

def process_video(input_path, output_path, tolerance=100, seed=None):
    clip = VideoFileClip(input_path)
    fps = clip.fps
    if seed is None:
        seed = (0, 0)  # coin haut-gauche par défaut
    frames = []
    for frame in clip.iter_frames(fps=fps, dtype='uint8'):
        x = min(max(int(seed[0]), 0), frame.shape[1] - 1)
        y = min(max(int(seed[1]), 0), frame.shape[0] - 1)
        frames.append(flood_fill_transparent(frame, x, y, tolerance))
    output_clip = ImageSequenceClip(frames, fps=fps)
    output_clip.write_videofile(
        output_path,
        codec='libvpx-vp9',
        audio=False,
        bitrate='2000k',
        ffmpeg_params=['-auto-alt-ref', '0']
    )
    clip.close()

if __name__ == "__main__":
    process_video("tmpu_cixqup.mp4", "output.webm", tolerance=100)