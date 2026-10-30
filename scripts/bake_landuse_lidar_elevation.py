from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
LANDUSE_IN = ROOT / "public" / "topoexport" / "curis-landuse-features.geojson"
LANDUSE_OUT = ROOT / "public" / "topoexport" / "curis-landuse-features-lidar10cm.geojson"
TERRAIN_META = ROOT / "public" / "topoexport" / "curis-terrain-metadata.json"
LIDAR_META = ROOT / "public" / "data_map" / "curis-lidar-1m-metadata.json"
LIDAR_BIL = ROOT / "public" / "data_map" / "curis-lidar-1m-dem.bil"

LIFT_METERS = 0.10
ROUND_Z = 3


def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def bilinear_elevation(data: np.ndarray, width: int, height: int, u: float, v: float) -> float:
    x = clamp(u * (width - 1), 0.0, width - 1)
    y = clamp(v * (height - 1), 0.0, height - 1)

    x0 = int(math.floor(x))
    x1 = min(width - 1, x0 + 1)
    y0 = int(math.floor(y))
    y1 = min(height - 1, y0 + 1)

    tx = x - x0
    ty = y - y0

    idx00 = y0 * width + x0
    idx10 = y0 * width + x1
    idx01 = y1 * width + x0
    idx11 = y1 * width + x1

    z00 = float(data[idx00])
    z10 = float(data[idx10])
    z01 = float(data[idx01])
    z11 = float(data[idx11])

    z0 = z00 * (1 - tx) + z10 * tx
    z1 = z01 * (1 - tx) + z11 * tx
    return z0 * (1 - ty) + z1 * ty


def lon_lat_to_uv(lon: float, lat: float, bbox: dict[str, float]) -> tuple[float, float]:
    u = (lon - bbox["minLon"]) / (bbox["maxLon"] - bbox["minLon"])
    v = 1 - (lat - bbox["minLat"]) / (bbox["maxLat"] - bbox["minLat"])
    return clamp(u, 0.0, 1.0), clamp(v, 0.0, 1.0)


def bake_ring(
    ring: list[list[float]],
    bbox: dict[str, float],
    data: np.ndarray,
    width: int,
    height: int,
    min_height: float,
) -> list[list[float]]:
    baked: list[list[float]] = []
    for coord in ring:
        if len(coord) < 2:
            continue
        lon = float(coord[0])
        lat = float(coord[1])
        u, v = lon_lat_to_uv(lon, lat, bbox)
        z = bilinear_elevation(data, width, height, u, v)
        if not math.isfinite(z):
            z = min_height
        z = z + LIFT_METERS
        baked.append([lon, lat, round(z, ROUND_Z)])
    return baked


def bake_geometry(geometry: dict, bbox: dict[str, float], data: np.ndarray, width: int, height: int, min_height: float) -> int:
    geom_type = geometry.get("type")
    coords = geometry.get("coordinates")
    if not coords or geom_type not in {"Polygon", "MultiPolygon"}:
        return 0

    points = 0
    if geom_type == "Polygon":
        new_coords = []
        for ring in coords:
            baked = bake_ring(ring, bbox, data, width, height, min_height)
            points += len(baked)
            new_coords.append(baked)
        geometry["coordinates"] = new_coords
        return points

    new_polygons = []
    for polygon in coords:
        new_rings = []
        for ring in polygon:
            baked = bake_ring(ring, bbox, data, width, height, min_height)
            points += len(baked)
            new_rings.append(baked)
        new_polygons.append(new_rings)
    geometry["coordinates"] = new_polygons
    return points


def main() -> None:
    if not LANDUSE_IN.exists():
        raise SystemExit(f"Missing landuse file: {LANDUSE_IN}")
    if not LIDAR_BIL.exists():
        raise SystemExit(f"Missing lidar BIL file: {LIDAR_BIL}")

    terrain = json.loads(TERRAIN_META.read_text(encoding="utf-8"))
    lidar_meta = json.loads(LIDAR_META.read_text(encoding="utf-8"))

    bbox = terrain["bbox"]
    width = int(lidar_meta["width"])
    height = int(lidar_meta["height"])
    min_height = float(lidar_meta["elevation"]["min"])

    data = np.fromfile(LIDAR_BIL, dtype="<f4")
    expected = width * height
    if data.size != expected:
        raise SystemExit(f"Unexpected BIL size: {data.size}, expected {expected}")

    landuse = json.loads(LANDUSE_IN.read_text(encoding="utf-8"))

    features = landuse.get("features", [])
    updated_points = 0
    updated_features = 0
    for feature in features:
        geometry = feature.get("geometry")
        if not geometry:
            continue
        points = bake_geometry(geometry, bbox, data, width, height, min_height)
        if points:
            updated_points += points
            updated_features += 1

    LANDUSE_OUT.write_text(
        json.dumps(landuse, ensure_ascii=True, separators=(",", ":")),
        encoding="utf-8",
    )

    print(f"Wrote: {LANDUSE_OUT}")
    print(f"Features updated: {updated_features}")
    print(f"Points updated: {updated_points}")


if __name__ == "__main__":
    main()
