import json
data = json.loads(open('public/topoexport/curis-dxf-buildings.geojson').read())
features = data.get('features', [])
print(f'Total: {len(features)}')
print()
# Check geometry validity
for i, f in enumerate(features[:5]):
    coords = f['geometry']['coordinates'][0]
    height = f['properties']['height']
    print(f'Building {i}: {len(coords)} points, height={height}')
    # Check if closed
    is_closed = coords[0] == coords[-1]
    print(f'  Closed: {is_closed}')
    # Check bounds
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    print(f'  Lon range: {min(lons):.6f} to {max(lons):.6f}')
    print(f'  Lat range: {min(lats):.6f} to {max(lats):.6f}')
    print()
