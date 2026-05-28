import json
data = json.loads(open('public/topoexport/curis-dxf-buildings.geojson').read())
features = data.get('features', [])
print(f'Buildings: {len(features)}')
if features:
    f = features[0]
    print(f'First building properties: {f["properties"]}')
    coords = f['geometry']['coordinates'][0]
    print(f'First building polygon points: {len(coords)}')
    print(f'Sample coords: {coords[:3]}')
