from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPO_DIR = ROOT / 'public' / 'topoexport'
metadata = json.loads((TOPO_DIR / 'curis-terrain-metadata.json').read_text(encoding='utf-8'))

bbox = metadata['bbox']
south = bbox['minLat']
west = bbox['minLon']
north = bbox['maxLat']
east = bbox['maxLon']

query = f'''
[out:json][timeout:90];
(
  way["landuse"="forest"]({south},{west},{north},{east});
  relation["landuse"="forest"]({south},{west},{north},{east});
  way["natural"="wood"]({south},{west},{north},{east});
  relation["natural"="wood"]({south},{west},{north},{east});
);
(._;>;);
out body;
'''.strip()

url = 'https://overpass-api.de/api/interpreter?' + urllib.parse.urlencode({'data': query})
req = urllib.request.Request(url, headers={'User-Agent': 'GitHub-Copilot-GeoPF-Prototype/1.0'})
with urllib.request.urlopen(req, timeout=180) as response:
    payload = json.loads(response.read().decode('utf-8'))

nodes: dict[int, tuple[float, float]] = {}
ways: dict[int, dict] = {}
relations: list[dict] = []

for el in payload.get('elements', []):
    el_type = el.get('type')
    if el_type == 'node':
      nodes[el['id']] = (float(el['lon']), float(el['lat']))
    elif el_type == 'way':
      ways[el['id']] = el
    elif el_type == 'relation':
      relations.append(el)


def normalize_ring(coords: list[list[float]]) -> list[list[float]]:
    if len(coords) < 3:
        return []
    if coords[0] != coords[-1]:
        coords.append(coords[0])
    return coords


def way_to_ring(way: dict) -> list[list[float]]:
    ring: list[list[float]] = []
    for node_id in way.get('nodes', []):
        lon_lat = nodes.get(node_id)
        if lon_lat is None:
            return []
        lon, lat = lon_lat
        ring.append([lon, lat])
    return normalize_ring(ring)


features: list[dict] = []
way_count = 0
relation_count = 0

for way in ways.values():
    tags = way.get('tags', {})
    is_forest = tags.get('landuse') == 'forest' or tags.get('natural') == 'wood'
    if not is_forest:
        continue

    ring = way_to_ring(way)
    if len(ring) < 4:
        continue

    features.append(
        {
            'type': 'Feature',
            'properties': {
                'kind': 'forest',
                'source': 'osm',
                'osmType': 'way',
                'osmId': way['id'],
                'name': tags.get('name', ''),
                'landuse': tags.get('landuse', ''),
                'natural': tags.get('natural', ''),
            },
            'geometry': {'type': 'Polygon', 'coordinates': [ring]},
        }
    )
    way_count += 1

for rel in relations:
    tags = rel.get('tags', {})
    is_forest = tags.get('landuse') == 'forest' or tags.get('natural') == 'wood'
    if not is_forest:
        continue

    outers: list[list[list[float]]] = []
    holes: list[list[list[float]]] = []

    for member in rel.get('members', []):
        if member.get('type') != 'way':
            continue
        member_way = ways.get(member.get('ref'))
        if member_way is None:
            continue
        ring = way_to_ring(member_way)
        if len(ring) < 4:
            continue

        role = member.get('role', '')
        if role == 'inner':
            holes.append(ring)
        else:
            outers.append(ring)

    if not outers:
        continue

    if len(outers) == 1:
        coords = [outers[0], *holes]
        geom = {'type': 'Polygon', 'coordinates': coords}
    else:
        multipoly_coords = []
        for outer in outers:
            multipoly_coords.append([outer])
        geom = {'type': 'MultiPolygon', 'coordinates': multipoly_coords}

    features.append(
        {
            'type': 'Feature',
            'properties': {
                'kind': 'forest',
                'source': 'osm',
                'osmType': 'relation',
                'osmId': rel['id'],
                'name': tags.get('name', ''),
                'landuse': tags.get('landuse', ''),
                'natural': tags.get('natural', ''),
            },
            'geometry': geom,
        }
    )
    relation_count += 1

out_path = TOPO_DIR / 'curis-forest-features.geojson'
out_path.write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, ensure_ascii=True), encoding='utf-8')

print(json.dumps({'forests_written': len(features), 'ways': way_count, 'relations': relation_count, 'output': str(out_path)}, ensure_ascii=True, indent=2))
