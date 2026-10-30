from __future__ import annotations

import json
import math
from pathlib import Path

import ezdxf

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

doc = ezdxf.readfile(str(ROOT / 'public' / 'topoexport' / 'topoexport_2D_vectorial.dxf'))
msp = doc.modelspace()

buildings = []
all_x = []
all_y = []
for ent in msp.query('LWPOLYLINE[layer=="TPX_BATIMENTS"]'):
    pts = [(float(x), float(y)) for x, y in ent.get_points('xy')]
    if len(pts) < 3:
        continue
    buildings.append(pts)
    for x, y in pts:
        all_x.append(x)
        all_y.append(y)

min_x = min(all_x)
max_x = max(all_x)
min_y = min(all_y)
max_y = max(all_y)

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


def centroid(pts):
    return (sum(x for x, _ in pts) / len(pts), sum(y for _, y in pts) / len(pts))


def metric_distance(a, b):
    dx = (a[0] - b[0]) * meters_per_lon
    dy = (a[1] - b[1]) * meters_per_lat
    return math.hypot(dx, dy)


def map_range(value, src_min, src_max, dst_min, dst_max, invert=False):
    t = (value - src_min) / (src_max - src_min)
    if invert:
        t = 1.0 - t
    return dst_min + t * (dst_max - dst_min)

cases = []
for lon_axis in ('x', 'y'):
    lat_axis = 'y' if lon_axis == 'x' else 'x'
    for inv_lon in (False, True):
        for inv_lat in (False, True):
            transformed = []
            for pts in buildings:
                cx, cy = centroid(pts)
                if lon_axis == 'x':
                    lon = map_range(cx, min_x, max_x, min_lon, max_lon, invert=inv_lon)
                    lat = map_range(cy, min_y, max_y, min_lat, max_lat, invert=inv_lat)
                else:
                    lon = map_range(cy, min_y, max_y, min_lon, max_lon, invert=inv_lon)
                    lat = map_range(cx, min_x, max_x, min_lat, max_lat, invert=inv_lat)
                transformed.append((lon, lat))

            distances = []
            for pt in transformed:
                best = min(metric_distance(pt, osm_pt) for osm_pt in osm_centroids)
                distances.append(best)
            avg = sum(distances) / len(distances)
            p50 = sorted(distances)[len(distances) // 2]
            p90 = sorted(distances)[int(len(distances) * 0.9)]
            cases.append({
                'lon_axis': lon_axis,
                'lat_axis': lat_axis,
                'invert_lon': inv_lon,
                'invert_lat': inv_lat,
                'avg_m': avg,
                'p50_m': p50,
                'p90_m': p90,
            })

cases.sort(key=lambda item: item['avg_m'])
print(json.dumps({'dxf_span': {'x': max_x - min_x, 'y': max_y - min_y}, 'scene_span_m': {'x': (max_lon - min_lon) * meters_per_lon, 'z': (max_lat - min_lat) * meters_per_lat}, 'best_cases': cases[:8]}, indent=2))
