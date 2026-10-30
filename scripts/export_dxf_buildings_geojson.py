"""
Export DXF building footprints to GeoJSON with WGS84 coordinates.
Maps local DXF coordinates to Curis-au-Mont-d'Or WGS84 bbox.
"""

from __future__ import annotations

import json
from pathlib import Path

import ezdxf


def read_obj_extent(path: Path) -> tuple[float, float, float, float]:
    min_x = None
    max_x = None
    min_y = None
    max_y = None

    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("v "):
            continue
        _, xs, ys, _ = line.split()
        x = float(xs)
        y = float(ys)
        min_x = x if min_x is None else min(min_x, x)
        max_x = x if max_x is None else max(max_x, x)
        min_y = y if min_y is None else min(min_y, y)
        max_y = y if max_y is None else max(max_y, y)

    if min_x is None or min_y is None or max_x is None or max_y is None:
        raise ValueError(f"No vertices found in OBJ: {path}")

    return min_x, max_x, min_y, max_y


def main() -> None:
    # DXF/OBJ coordinate bounds (local meters, from terrain OBJ)
    terrain_obj = Path("public/topoexport/topoexport_terrain.obj")
    dxf_min_x, dxf_max_x, dxf_min_y, dxf_max_y = read_obj_extent(terrain_obj)

    # Terrain-viewer WGS84 bounds (NW + SE corners)
    curis_min_lon = 4.808055
    curis_max_lon = 4.820774
    curis_min_lat = 45.869968
    curis_max_lat = 45.875916

    # Linear mapping functions
    def map_x(dxf_x: float) -> float:
        """Map DXF X to Curis longitude."""
        t = (dxf_x - dxf_min_x) / (dxf_max_x - dxf_min_x)
        return curis_min_lon + t * (curis_max_lon - curis_min_lon)

    def map_y(dxf_y: float) -> float:
        """Map DXF Y to Curis latitude (inverted Y axis)."""
        t = (dxf_y - dxf_min_y) / (dxf_max_y - dxf_min_y)
        return curis_min_lat + t * (curis_max_lat - curis_min_lat)

    # Read DXF and extract buildings
    doc = ezdxf.readfile(r"public/topoexport/topoexport_2D_vectorial.dxf")
    msp = doc.modelspace()

    features = []
    buildings_processed = 0
    
    for i, ent in enumerate(msp.query('LWPOLYLINE[layer=="TPX_BATIMENTS"]'), start=1):
        pts_local = list(ent.get_points("xy"))
        if len(pts_local) < 3:
            continue

        # Map coordinates to WGS84
        coords = []
        for x, y in pts_local:
            lon = map_x(x)
            lat = map_y(y)
            coords.append([lon, lat])

        # Close the polygon if not already closed
        if coords[0] != coords[-1]:
            coords.append(coords[0])

        feature = {
            "type": "Feature",
            "properties": {
                "kind": "building",
                "source": "dxf_bdtopo",
                "dxfId": f"bat_{i:03d}",
                "height": 12.0,  # Default height from dxf_project_features.py
                "building": "yes",
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords],
            },
        }
        features.append(feature)
        buildings_processed += 1

    # Write GeoJSON
    output_path = Path("public/topoexport/curis-dxf-buildings.geojson")
    geojson_output = {
        "type": "FeatureCollection",
        "features": features,
    }
    
    output_path.write_text(
        json.dumps(geojson_output, ensure_ascii=True, indent=2),
        encoding="utf-8",
    )

    print(f"Exported {buildings_processed} buildings from DXF to GeoJSON")
    print(f"Output: {output_path}")
    print(f"Coordinate mapping:")
    print(f"  DXF X: {dxf_min_x:.2f} to {dxf_max_x:.2f} → Curis lon: {curis_min_lon} to {curis_max_lon}")
    print(f"  DXF Y: {dxf_min_y:.2f} to {dxf_max_y:.2f} → Curis lat: {curis_min_lat} to {curis_max_lat}")


if __name__ == "__main__":
    main()
