import os
from PIL import Image

def get_image_info(image_path):
    with Image.open(image_path) as img:
        width, height = img.size
        try:
            dpi = img.info.get('dpi', (0, 0))
            dpi_str = f"{dpi[0]}x{dpi[1]}" if dpi != (0, 0) else "Non disponible"
        except:
            dpi_str = "Non disponible"
        ratio = width / height if height != 0 else 0
        return width, height, dpi_str, ratio

def process_images_in_folder(folder_path):
    image_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp')
    results = []

    for filename in os.listdir(folder_path):
        if filename.lower().endswith(image_extensions):
            image_path = os.path.join(folder_path, filename)
            try:
                width, height, dpi, ratio = get_image_info(image_path)
                results.append({
                    "Fichier": filename,
                    "Dimensions": f"{width}x{height}",
                    "Résolution (DPI)": dpi,
                    "Rapport (L/H)": f"{ratio:.2f}"
                })
            except Exception as e:
                results.append({
                    "Fichier": filename,
                    "Erreur": str(e)
                })
    return results

if __name__ == "__main__":
    dossier = input("Entrez le chemin du dossier contenant les images : ")
    if os.path.isdir(dossier):
        infos = process_images_in_folder(dossier)
        for info in infos:
            print(f"Fichier: {info['Fichier']}")
            print(f"Dimensions: {info.get('Dimensions', 'N/A')}")
            print(f"Résolution: {info.get('Résolution (DPI)', 'N/A')}")
            print(f"Rapport: {info.get('Rapport (L/H)', 'N/A')}")
            print("---")
    else:
        print("Le dossier spécifié n'existe pas.")