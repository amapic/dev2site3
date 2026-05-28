import json

data = json.loads(open('public/topoexport/curis-dxf-buildings.geojson').read())
features = data['features'][:3]
for i, f in enumerate(features):
    print(f'Building {i}:')
    print(f'  kind: {f["properties"]["kind"]}')
    print(f'  type: {f["geometry"]["type"]}')
    coords = f['geometry']['coordinates'][0]
    print(f'  points: {len(coords)}')
    print(f'  first coord: {coords[0]}')
    print()
