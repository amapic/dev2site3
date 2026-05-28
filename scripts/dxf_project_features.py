from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import ezdxf
import numpy as np

from dxf_to_terrain_obj import build_grid_points, idw_interpolate, pick_contour_layer, read_contours


def sample_polyline_xy(points: list[tuple[float, float]], spacing: float, closed: bool) -> list[tuple[float, float]]:
    if len(points) < 2:
        return points[:]

    chain = points[:]
    if closed and points[0] != points[-1]:
        chain.append(points[0])

    sampled: list[tuple[float, float]] = []
    for (ax, ay), (bx, by) in zip(chain[:-1], chain[1:]):
        seg_len = math.hypot(bx - ax, by - ay)
        steps = max(1, int(seg_len / max(spacing, 0.01)))
        for i in range(steps):
            t = i / steps
            x = ax + (bx - ax) * t
            y = ay + (by - ay) * t
            sampled.append((x, y))

    sampled.append(chain[-1])
    return sampled


def terrain_z(xy: np.ndarray, source_xy: np.ndarray, source_z: np.ndarray, k: int, power: float) -> np.ndarray:
    return idw_interpolate(source_xy=source_xy, source_z=source_z, query_xy=xy, k=k, power=power)


def write_obj(path: Path, vertices: list[tuple[float, float, float]], faces: list[tuple[int, int, int]], name: str) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as f:
        f.write("# Projected features generated from DXF\n")
        f.write(f"o {name}\n")
        for x, y, z in vertices:
            f.write(f"v {x:.6f} {y:.6f} {z:.6f}\n")
        for a, b, c in faces:
            f.write(f"f {a} {b} {c}\n")


def build_buildings_obj(
    doc: ezdxf.document.Drawing,
    source_xy: np.ndarray,
    source_z: np.ndarray,
    output_obj: Path,
    layer: str,
    building_height: float,
    base_offset: float,
    k: int,
    power: float,
) -> tuple[int, int, int]:
    msp = doc.modelspace()
    polylines = list(msp.query(f'LWPOLYLINE[layer=="{layer}"]'))

    vertices: list[tuple[float, float, float]] = []
    faces: list[tuple[int, int, int]] = []
    building_count = 0

    for pl in polylines:
        pts = [(float(x), float(y)) for x, y in pl.get_points("xy")]
        if len(pts) < 3:
            continue

        if pts[0] == pts[-1]:
            pts = pts[:-1]
        if len(pts) < 3:
            continue

        footprint = np.array(pts, dtype=np.float64)
        ground = terrain_z(footprint, source_xy, source_z, k=k, power=power) + base_offset
        top = ground + building_height

        base_idx = len(vertices) + 1

        for (x, y), z in zip(pts, ground):
            vertices.append((x, y, float(z)))
        for (x, y), z in zip(pts, top):
            vertices.append((x, y, float(z)))

        n = len(pts)

        # Roof triangulation as a fan.
        for i in range(1, n - 1):
            faces.append((base_idx + n, base_idx + n + i, base_idx + n + i + 1))

        # Walls.
        for i in range(n):
            j = (i + 1) % n
            b1 = base_idx + i
            b2 = base_idx + j
            t1 = base_idx + n + i
            t2 = base_idx + n + j
            faces.append((b1, b2, t2))
            faces.append((b1, t2, t1))

        building_count += 1

    output_obj.parent.mkdir(parents=True, exist_ok=True)
    write_obj(output_obj, vertices, faces, name="buildings")
    return building_count, len(vertices), len(faces)


def build_projected_lines(
    doc: ezdxf.document.Drawing,
    source_xy: np.ndarray,
    source_z: np.ndarray,
    output_json: Path,
    line_layers: dict[str, str],
    sample_spacing: float,
    z_offset: float,
    k: int,
    power: float,
) -> tuple[int, int]:
    msp = doc.modelspace()
    features = []
    layer_feature_count = 0

    for layer, color in line_layers.items():
        entities = list(msp.query(f'LWPOLYLINE[layer=="{layer}"]'))
        for ent in entities:
            pts = [(float(x), float(y)) for x, y in ent.get_points("xy")]
            if len(pts) < 2:
                continue

            sampled_xy = sample_polyline_xy(pts, spacing=sample_spacing, closed=False)
            arr_xy = np.array(sampled_xy, dtype=np.float64)
            z = terrain_z(arr_xy, source_xy, source_z, k=k, power=power) + z_offset
            points = [[float(x), float(y), float(zz)] for (x, y), zz in zip(sampled_xy, z)]
            features.append({"layer": layer, "color": color, "points": points})
            layer_feature_count += 1

    output_json.parent.mkdir(parents=True, exist_ok=True)
    with output_json.open("w", encoding="utf-8", newline="\n") as f:
        json.dump({"features": features}, f, ensure_ascii=True)

    return layer_feature_count, len(features)


def main() -> None:
    parser = argparse.ArgumentParser(description="Project DXF layers onto the generated terrain surface.")
    parser.add_argument("--input", required=True, type=Path, help="Path to source DXF")
    parser.add_argument("--buildings-output", required=True, type=Path, help="Path to output buildings OBJ")
    parser.add_argument("--lines-output", required=True, type=Path, help="Path to output projected lines JSON")
    parser.add_argument("--building-layer", default="TPX_BATIMENTS", help="Layer name for building footprints")
    parser.add_argument("--building-height", type=float, default=12.0, help="Extrusion height for buildings")
    parser.add_argument("--building-base-offset", type=float, default=0.4, help="Offset above terrain to avoid z-fighting")
    parser.add_argument("--line-spacing", type=float, default=8.0, help="Resampling spacing for projected lines")
    parser.add_argument("--line-z-offset", type=float, default=0.35, help="Vertical offset for projected lines")
    parser.add_argument("--sample-spacing", type=float, default=3.0, help="Contour sampling spacing")
    parser.add_argument("--max-samples", type=int, default=12000, help="Maximum contour points for interpolation")
    parser.add_argument("--idw-k", type=int, default=10, help="Nearest contour points used for interpolation")
    parser.add_argument("--idw-power", type=float, default=2.0, help="IDW power")
    args = parser.parse_args()

    if not args.input.exists():
        raise FileNotFoundError(f"Input DXF not found: {args.input}")

    doc = ezdxf.readfile(args.input)
    contour_layer = pick_contour_layer(doc)
    contours = read_contours(doc, contour_layer)
    sampled = build_grid_points(contours, spacing=args.sample_spacing)

    if sampled.shape[0] > args.max_samples:
        rng = np.random.default_rng(42)
        idx = rng.choice(sampled.shape[0], size=args.max_samples, replace=False)
        sampled = sampled[idx]

    source_xy = sampled[:, :2]
    source_z = sampled[:, 2]

    building_count, building_vertices, building_faces = build_buildings_obj(
        doc=doc,
        source_xy=source_xy,
        source_z=source_z,
        output_obj=args.buildings_output,
        layer=args.building_layer,
        building_height=args.building_height,
        base_offset=args.building_base_offset,
        k=args.idw_k,
        power=args.idw_power,
    )

    line_layers = {
        "TPX_ROUTES_AXES": "#7c5f3d",
        "TPX_ROUTES_CONTOURS": "#a37b4c",
        "TPX_HYDROGRAPHIE": "#2e78b5",
        "TPX_VEGETATION_ESPACES_VERTS": "#3b8d3f",
        "TPX_CADASTRES": "#6f5a7f",
    }
    projected_count, _ = build_projected_lines(
        doc=doc,
        source_xy=source_xy,
        source_z=source_z,
        output_json=args.lines_output,
        line_layers=line_layers,
        sample_spacing=args.line_spacing,
        z_offset=args.line_z_offset,
        k=args.idw_k,
        power=args.idw_power,
    )

    print("Contour layer:", contour_layer)
    print("Contour samples:", sampled.shape[0])
    print("Buildings projected:", building_count)
    print("Building OBJ vertices:", building_vertices)
    print("Building OBJ faces:", building_faces)
    print("Projected polylines:", projected_count)
    print("Buildings OBJ:", args.buildings_output)
    print("Lines JSON:", args.lines_output)


if __name__ == "__main__":
    main()
