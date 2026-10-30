from __future__ import annotations

import argparse
import math
import re
from dataclasses import dataclass
from pathlib import Path

import ezdxf
import numpy as np


@dataclass
class Contour:
    points_xy: list[tuple[float, float]]
    elevation: float


def parse_float(text: str) -> float | None:
    cleaned = text.strip().replace(",", ".")
    match = re.search(r"[-+]?\d*\.?\d+", cleaned)
    if not match:
        return None
    try:
        return float(match.group(0))
    except ValueError:
        return None


def sample_polyline(points_xy: list[tuple[float, float]], elevation: float, spacing: float, closed: bool) -> list[tuple[float, float, float]]:
    if len(points_xy) < 2:
        return []

    chain = points_xy[:]
    if closed and points_xy[0] != points_xy[-1]:
        chain.append(points_xy[0])

    sampled: list[tuple[float, float, float]] = []
    for (ax, ay), (bx, by) in zip(chain[:-1], chain[1:]):
        seg_len = math.hypot(bx - ax, by - ay)
        steps = max(1, int(seg_len / max(spacing, 0.01)))
        for i in range(steps):
            t = i / steps
            x = ax + (bx - ax) * t
            y = ay + (by - ay) * t
            sampled.append((x, y, elevation))

    sampled.append((chain[-1][0], chain[-1][1], elevation))
    return sampled


def pick_contour_layer(doc: ezdxf.document.Drawing) -> str:
    candidates: dict[str, int] = {}
    for entity in doc.modelspace().query("LWPOLYLINE"):
        layer = entity.dxf.layer
        upper = layer.upper()
        if "COURBES_NIVEAU" in upper and "TEXTE" not in upper:
            candidates[layer] = candidates.get(layer, 0) + 1

    if not candidates:
        raise RuntimeError("No contour layer containing 'COURBES_NIVEAU' found in LWPOLYLINE entities.")

    return sorted(candidates.items(), key=lambda item: item[1], reverse=True)[0][0]


def read_contours(doc: ezdxf.document.Drawing, contour_layer: str) -> list[Contour]:
    msp = doc.modelspace()
    polylines = list(msp.query(f'LWPOLYLINE[layer=="{contour_layer}"]'))
    if not polylines:
        raise RuntimeError(f"No LWPOLYLINE entities found in layer {contour_layer!r}.")

    contours: list[Contour] = []
    for pl in polylines:
        points_xy = [(float(x), float(y)) for x, y in pl.get_points("xy")]
        elevation = float(getattr(pl.dxf, "elevation", 0.0) or 0.0)
        contours.append(Contour(points_xy=points_xy, elevation=elevation))

    # Some exports store labels as TEXT and keep polyline elevation flat/near-flat.
    z_values = np.array([c.elevation for c in contours], dtype=np.float64)
    z_span = float(z_values.max() - z_values.min()) if len(z_values) else 0.0
    use_text_labels = z_span < 1.0

    if use_text_labels:
        label_layer = f"{contour_layer}_TEXTE"
        labels: list[tuple[float, float, float]] = []
        for txt in msp.query(f'TEXT[layer=="{label_layer}"]'):
            z = parse_float(str(txt.dxf.text))
            if z is None:
                continue
            ip = txt.dxf.insert
            labels.append((float(ip.x), float(ip.y), float(z)))

        if labels:
            label_xy = np.array([(x, y) for x, y, _ in labels], dtype=np.float64)
            label_z = np.array([z for _, _, z in labels], dtype=np.float64)
            for contour in contours:
                cx = sum(p[0] for p in contour.points_xy) / len(contour.points_xy)
                cy = sum(p[1] for p in contour.points_xy) / len(contour.points_xy)
                d2 = np.sum((label_xy - np.array([cx, cy])) ** 2, axis=1)
                contour.elevation = float(label_z[int(np.argmin(d2))])

    return contours


def build_grid_points(contours: list[Contour], spacing: float) -> np.ndarray:
    sampled: list[tuple[float, float, float]] = []
    for contour in contours:
        sampled.extend(sample_polyline(contour.points_xy, contour.elevation, spacing=spacing, closed=False))

    if len(sampled) < 10:
        raise RuntimeError("Not enough sampled contour points to build a terrain mesh.")

    return np.array(sampled, dtype=np.float64)


def idw_interpolate(
    source_xy: np.ndarray,
    source_z: np.ndarray,
    query_xy: np.ndarray,
    k: int,
    power: float,
    chunk_size: int = 256,
) -> np.ndarray:
    n_source = source_xy.shape[0]
    k = max(1, min(k, n_source))
    out = np.zeros(query_xy.shape[0], dtype=np.float64)

    for start in range(0, query_xy.shape[0], chunk_size):
        end = min(start + chunk_size, query_xy.shape[0])
        q = query_xy[start:end]

        d2 = np.sum((q[:, None, :] - source_xy[None, :, :]) ** 2, axis=2)
        idx = np.argpartition(d2, kth=k - 1, axis=1)[:, :k]

        d2_sel = np.take_along_axis(d2, idx, axis=1)
        d = np.sqrt(d2_sel) + 1e-9
        w = 1.0 / np.power(d, power)
        z_sel = source_z[idx]
        out[start:end] = np.sum(w * z_sel, axis=1) / np.sum(w, axis=1)

    return out


def smooth_heightfield(z: np.ndarray, nx: int, ny: int, iterations: int, alpha: float) -> np.ndarray:
    if iterations <= 0 or alpha <= 0:
        return z

    grid = z.reshape(ny, nx).copy()
    a = float(max(0.0, min(alpha, 0.24)))

    for _ in range(iterations):
        center = grid
        left = np.roll(center, 1, axis=1)
        right = np.roll(center, -1, axis=1)
        up = np.roll(center, -1, axis=0)
        down = np.roll(center, 1, axis=0)

        # Enforce non-periodic boundaries by copying edge neighbors.
        left[:, 0] = center[:, 0]
        right[:, -1] = center[:, -1]
        up[-1, :] = center[-1, :]
        down[0, :] = center[0, :]

        laplacian = left + right + up + down - 4.0 * center
        grid = center + a * laplacian

    return grid.reshape(-1)


def write_obj(path: Path, vertices: np.ndarray, nx: int, ny: int) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as f:
        f.write("# Generated from contour DXF\n")
        f.write("o terrain\n")

        for x, y, z in vertices:
            f.write(f"v {x:.6f} {y:.6f} {z:.6f}\n")

        for j in range(ny - 1):
            for i in range(nx - 1):
                v1 = j * nx + i + 1
                v2 = v1 + 1
                v3 = v1 + nx + 1
                v4 = v1 + nx
                f.write(f"f {v1} {v2} {v3}\n")
                f.write(f"f {v1} {v3} {v4}\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate an OBJ terrain mesh from contour lines in a DXF.")
    parser.add_argument("--input", required=True, type=Path, help="Path to input DXF file")
    parser.add_argument("--output", required=True, type=Path, help="Path to output OBJ file")
    parser.add_argument("--grid", type=int, default=180, help="Grid resolution per axis (default: 180)")
    parser.add_argument("--sample-spacing", type=float, default=4.0, help="Contour sampling spacing in source units")
    parser.add_argument("--idw-k", type=int, default=8, help="Nearest samples used for interpolation")
    parser.add_argument("--idw-power", type=float, default=2.0, help="IDW power parameter")
    parser.add_argument("--z-scale", type=float, default=1.0, help="Vertical scale factor")
    parser.add_argument("--level-step", type=float, default=0.0, help="Height leveling step in source units (0 disables leveling)")
    parser.add_argument("--smooth-iterations", type=int, default=0, help="XY smoothing iterations using second derivatives")
    parser.add_argument("--smooth-alpha", type=float, default=0.12, help="XY smoothing strength per iteration (recommended <= 0.24)")
    parser.add_argument("--max-samples", type=int, default=12000, help="Maximum contour samples used for interpolation")
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

    min_xy = sampled[:, :2].min(axis=0)
    max_xy = sampled[:, :2].max(axis=0)

    nx = max(16, int(args.grid))
    ny = max(16, int(args.grid))
    xs = np.linspace(min_xy[0], max_xy[0], nx)
    ys = np.linspace(min_xy[1], max_xy[1], ny)
    gx, gy = np.meshgrid(xs, ys)
    query = np.column_stack((gx.ravel(), gy.ravel()))

    z = idw_interpolate(
        source_xy=sampled[:, :2],
        source_z=sampled[:, 2],
        query_xy=query,
        k=args.idw_k,
        power=args.idw_power,
    )

    if args.level_step > 0:
        step = float(args.level_step)
        z = np.round(z / step) * step

    z = smooth_heightfield(
        z=z,
        nx=nx,
        ny=ny,
        iterations=max(0, int(args.smooth_iterations)),
        alpha=float(args.smooth_alpha),
    )

    z *= args.z_scale

    vertices = np.column_stack((query[:, 0], query[:, 1], z))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    write_obj(args.output, vertices, nx=nx, ny=ny)

    print("Contour layer:", contour_layer)
    print("Contours:", len(contours))
    print("Sample points:", sampled.shape[0])
    print("Mesh vertices:", vertices.shape[0])
    print("Mesh faces:", (nx - 1) * (ny - 1) * 2)
    print("Output:", args.output)


if __name__ == "__main__":
    main()
