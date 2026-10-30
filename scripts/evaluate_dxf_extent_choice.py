from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
meta = json.loads((ROOT / 'public' / 'topoexport' / 'curis-terrain-metadata.json').read_text(encoding='utf-8'))
osm = json.loads((ROOT / 'public' / 'topoexport' / 'curis-map-features.geojson').read_text(encoding='utf-8'))

bbox = meta['bbox']
min_lon = bbox['minLon']
max_lon = bbox['maxLon']
min_lat = bbox['minLat']
max_lat = bbox['maxLat']
meters_per_lon = meta['metersPerDegree']['lon']
meters_per_lat = meta['metersPerDegree']['lat']

# Building extent used by current script
building_min_x = 10.5069248488694
building_max_x = 1001.5752512571457
building_min_y = -7.757848759625412e-07
building_max_y = 682.9812405454063

# Terrain extent from OBJ
terrain_min_x = None
terrain_max_x = None
terrain_min_y = None
terrain_max_y = None
for line in (ROOT / 'public' / 'topoexport' / 'topoexport_terrain.obj').read_text(encoding='utf-8').splitlines():
    if not line.startswith('v '):
        continue
    _, xs, ys, _ = line.split()
    x = float(xs)
    y = float(ys)
    terrain_min_x = x if terrain_min_x is None else min(terrain_min_x, x)
    terrain_max_x = x if terrain_max_x is None else max(terrain_max_x, x)
    terrain_min_y = y if terrain_min_y is None else min(terrain_min_y, y)
    terrain_max_y = y if terrain_max_y is None else max(terrain_max_y, y)

# Read DXF-derived geojson buildings in local space from OBJ index approximation not needed: use existing transformed file later.
import ezdxf
doc = ezdxf.readfile(str(ROOT / 'public' / 'topoexport' / 'topoexport_2D_vectorial.dxf'))
msp = doc.modelspace()
centroids = []
for ent in msp.query('LWPOLYLINE[layer=="TPX_BATIMENTS"]'):
    pts = [(float(x), float(y)) for x, y in ent.get_points('xy')]
    if len(pts) < 3:
        continue
    cx = sum(x for x, _ in pts) / len(pts)
    cy = sum(y for _, y in pts) / len(pts)
    centroids.append((cx, cy))

osm_centroids = []
for feat in osm.get('features', []):
    if feat.get('properties', {}).get('kind') != 'building':
        continue
    if feat.get('geometry', {}).get('type') != 'Polygon':
        continue
    ring = feat['geometry']['coordinates'][0][:-1]
    if not ring:
        continue
    lon = sum(p[0] for p in ring) / len(ring)
    lat = sum(p[1] for p in ring) / len(ring)
    osm_centroids.append((lon, lat))


def map_range(value, src_min, src_max, dst_min, dst_max):
    t = (value - src_min) / (src_max - src_min)
    return dst_min + t * (dst_max - dst_min)


def metric_distance(a, b):
    dx = (a[0] - b[0]) * meters_per_lon
    dy = (a[1] - b[1]) * meters_per_lat
    return math.hypot(dx, dy)


def evaluate(src_min_x, src_max_x, src_min_y, src_max_y):
    transformed = []
    for cx, cy in centroids:
        lon = map_range(cx, src_min_x, src_max_x, min_lon, max_lon)
        lat = map_range(cy, src_min_y, src_max_y, min_lat, max_lat)
        transformed.append((lon, lat))
    distances = []
    for pt in transformed:
        best = min(metric_distance(pt, other) for other in osm_centroids)
        distances.append(best)
    distances.sort()
    return {
        'avg_m': sum(distances) / len(distances),
        'p50_m': distances[len(distances)//2],
        'p90_m': distances[int(len(distances)*0.9)],
    }

print(json.dumps({
    'building_extent': [building_min_x, building_max_x, building_min_y, building_max_y],
    'terrain_extent': [terrain_min_x, terrain_max_x, terrain_min_y, terrain_max_y],
    'with_building_extent': evaluate(building_min_x, building_max_x, building_min_y, building_max_y),
    'with_terrain_extent': evaluate(terrain_min_x, terrain_max_x, terrain_min_y, terrain_max_y),
}, indent=2))
