from __future__ import annotations

import json
import math
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public" / "topoexport"
COMMUNE_GEOJSON = PUBLIC_DIR / "curis-au-mont-dor.geojson"
DEM_FILE = PUBLIC_DIR / "curis-terrain-dem.bil"
SHADOW_FILE = PUBLIC_DIR / "curis-terrain-shadow.png"
CONTOUR_FILE = PUBLIC_DIR / "curis-terrain-contours.png"
METADATA_FILE = PUBLIC_DIR / "curis-terrain-metadata.json"

WIDTH = 512
HEIGHT = 768
PADDING_DEG = 0.008
DEM_LAYER = "ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES"
SHADOW_LAYER = "IGNF_LIDAR-HD_MNT_ELEVATION.ELEVATIONGRIDCOVERAGE.SHADOW"
CONTOUR_LAYER = "ELEVATION.CONTOUR.LINE"
WMS_URL = "https://data.geopf.fr/wms-r"


def load_boundary() -> list[list[float]]:
    data = json.loads(COMMUNE_GEOJSON.read_text(encoding="utf-8"))
    coords = data["geometry"]["coordinates"][0]
    return [[float(lon), float(lat)] for lon, lat in coords]


def boundary_bbox(coords: list[list[float]]) -> tuple[float, float, float, float]:
    lons = [pt[0] for pt in coords]
    lats = [pt[1] for pt in coords]
    return (
        min(lons) - PADDING_DEG,
        min(lats) - PADDING_DEG,
        max(lons) + PADDING_DEG,
        max(lats) + PADDING_DEG,
    )


def fetch_wms(layer: str, file_path: Path, bbox: tuple[float, float, float, float], file_format: str, styles: str = "normal", transparent: bool = False) -> None:
    min_lon, min_lat, max_lon, max_lat = bbox
    params = {
        "SERVICE": "WMS",
        "REQUEST": "GetMap",
        "VERSION": "1.3.0",
        "LAYERS": layer,
        "CRS": "EPSG:4326",
        "BBOX": f"{min_lat},{min_lon},{max_lat},{max_lon}",
        "WIDTH": str(WIDTH),
        "HEIGHT": str(HEIGHT),
        "FORMAT": file_format,
        "STYLES": styles,
    }
    if transparent:
        params["TRANSPARENT"] = "TRUE"

    url = WMS_URL + "?" + urllib.parse.urlencode(params, safe=",;=:/")
    with urllib.request.urlopen(url) as response:
        file_path.write_bytes(response.read())


def bil_stats(path: Path) -> dict[str, float]:
    arr = np.fromfile(path, dtype="<f4")
    if arr.size != WIDTH * HEIGHT:
        raise RuntimeError(f"Unexpected DEM sample count: {arr.size}")

    finite = arr[np.isfinite(arr)]
    if finite.size == 0:
        raise RuntimeError("DEM contains no finite elevation values")

    return {
        "min": float(finite.min()),
        "max": float(finite.max()),
        "mean": float(finite.mean()),
    }


def main() -> None:
    boundary = load_boundary()
    bbox = boundary_bbox(boundary)

    fetch_wms(DEM_LAYER, DEM_FILE, bbox, "image/x-bil;bits=32", styles="")
    fetch_wms(SHADOW_LAYER, SHADOW_FILE, bbox, "image/png")
    fetch_wms(CONTOUR_LAYER, CONTOUR_FILE, bbox, "image/png", transparent=True)

    min_lon, min_lat, max_lon, max_lat = bbox
    center_lat = (min_lat + max_lat) * 0.5
    meters_per_deg_lat = 111_320.0
    meters_per_deg_lon = 111_320.0 * math.cos(math.radians(center_lat))

    stats = bil_stats(DEM_FILE)
    metadata = {
        "width": WIDTH,
        "height": HEIGHT,
        "bbox": {
            "minLon": min_lon,
            "minLat": min_lat,
            "maxLon": max_lon,
            "maxLat": max_lat,
        },
        "metersPerDegree": {
            "lon": meters_per_deg_lon,
            "lat": meters_per_deg_lat,
        },
        "demFile": DEM_FILE.name,
        "shadowFile": SHADOW_FILE.name,
        "contourFile": CONTOUR_FILE.name,
        "boundary": boundary,
        "elevation": stats,
    }
    METADATA_FILE.write_text(json.dumps(metadata, ensure_ascii=True, indent=2), encoding="utf-8")

    print("DEM:", DEM_FILE)
    print("Shadow:", SHADOW_FILE)
    print("Contours:", CONTOUR_FILE)
    print("Metadata:", METADATA_FILE)
    print("Elevation range:", stats)


if __name__ == "__main__":
    main()
