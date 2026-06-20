import cv2
from skimage.metrics import structural_similarity as ssim

reference = cv2.imread("frame_depart video2.jpg")
reference = cv2.cvtColor(reference, cv2.COLOR_BGR2GRAY)

video = cv2.VideoCapture("runwayml1.mp4")

fps = video.get(cv2.CAP_PROP_FPS)

best_score = -1
best_frame = -1

frame_id = 0

while True:
    ret, frame = video.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    if gray.shape != reference.shape:
        gray = cv2.resize(gray, (reference.shape[1], reference.shape[0]))

    score, _ = ssim(reference, gray, full=True)

    if score > best_score:
        best_score = score
        best_frame = frame_id

    frame_id += 1

video.release()

timestamp = best_frame / fps

minutes = int(timestamp // 60)
secondes = int(timestamp % 60)
millisecondes = int((timestamp % 1) * 1000)

print(f"Meilleure frame : {best_frame}")
print(f"Score SSIM : {best_score:.6f}")
print(f"Timestamp : {minutes:02d}:{secondes:02d}.{millisecondes:03d}")
print(f"Temps en secondes : {timestamp:.3f}")