import cv2
import numpy as np
from moviepy import VideoFileClip, ImageSequenceClip

def flood_fill_transparent(frame, x, y, tolerance=50):
    # Convertir en BGR (3 canaux) pour le flood fill
    frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    h, w = frame_bgr.shape[:2]

    # Créer un masque pour le flood fill
    mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
    # Récupérer la couleur du pixel de référence
    target_color = frame_bgr[y, x]

    # Appliquer le flood fill sur une copie (pour éviter de modifier l'original)
    flood_fill_img = frame_bgr.copy()
    cv2.floodFill(flood_fill_img, mask, (x, y), (0, 0, 0), loDiff=tolerance, upDiff=tolerance)

    # Créer un masque binaire : 1 où le flood fill a agi, 0 ailleurs
    mask = mask[1:-1, 1:-1].astype(bool)
    # Convertir l'image originale en RGBA
    frame_rgba = cv2.cvtColor(frame, cv2.COLOR_RGB2RGBA)
    # Rendre transparent les pixels correspondants
    frame_rgba[mask, 3] = 0

    return frame_rgba

def process_video(input_path, output_path, tolerance=30):
    clip = VideoFileClip(input_path)
    fps = clip.fps
    duration = clip.duration
    frames = []

    for t in np.arange(0, duration, 1/fps):
        frame = clip.get_frame(t)
        x, y = 9, 9
        frame_rgba = flood_fill_transparent(frame, x, y, tolerance)
        frames.append(frame_rgba)

    output_clip = ImageSequenceClip(frames, fps=fps)
    output_clip.write_videofile(
        output_path,
        codec='vp9',
        audio=False,
        bitrate='2000k',
        ffmpeg_params=['-auto-alt-ref', '0']
    )
    clip.close()

if __name__ == "__main__":
    input_video = input("Chemin de la vidéo MP4 : ")
    output_video = input("Chemin de sortie (ex: output.webm) : ")
    process_video(input_video, output_video)