from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
metadata = json.loads((ROOT / 'public' / 'topoexport' / 'curis-terrain-metadata.json').read_text(encoding='utf-8'))
bbox = metadata['bbox']
south = bbox['minLat']
west = bbox['minLon']
north = bbox['maxLat']
east = bbox['maxLon']

query = f'''
[out:json][timeout:60];
(
  node["natural"="tree"]({south},{west},{north},{east});
  way["landuse"="forest"]({south},{west},{north},{east});
  way["natural"="wood"]({south},{west},{north},{east});
  node["leisure"="swimming_pool"]({south},{west},{north},{east});
  way["leisure"="swimming_pool"]({south},{west},{north},{east});
  relation["leisure"="swimming_pool"]({south},{west},{north},{east});
);
(._;>;);
out body;
'''.strip()

url = 'https://overpass-api.de/api/interpreter?' + urllib.parse.urlencode({'data': query})
req = urllib.request.Request(url, headers={'User-Agent': 'GitHub-Copilot-GeoPF-Prototype/1.0'})
with urllib.request.urlopen(req, timeout=120) as response:
    payload = json.loads(response.read().decode('utf-8'))

counts = {
    'trees': 0,
    'forests_or_woods': 0,
    'swimming_pools': 0,
}
examples = {
    'trees': [],
    'swimming_pools': [],
}

for el in payload.get('elements', []):
    tags = el.get('tags', {})
    if tags.get('natural') == 'tree' and el.get('type') == 'node':
        counts['trees'] += 1
        if len(examples['trees']) < 10:
            examples['trees'].append({'id': el['id'], 'name': tags.get('name', ''), 'species': tags.get('species', '')})
    if (tags.get('landuse') == 'forest' or tags.get('natural') == 'wood') and el.get('type') in {'way', 'relation'}:
        counts['forests_or_woods'] += 1
    if tags.get('leisure') == 'swimming_pool' and el.get('type') in {'node', 'way', 'relation'}:
        counts['swimming_pools'] += 1
        if len(examples['swimming_pools']) < 10:
            examples['swimming_pools'].append({'id': el['id'], 'type': el.get('type'), 'name': tags.get('name', '')})

print(json.dumps({'counts': counts, 'examples': examples}, ensure_ascii=True, indent=2))
