import json

# Check OSM building structure
osm = json.loads(open('public/topoexport/curis-map-features.geojson').read())
osm_blds = [f for f in osm['features'] if f.get('properties',{}).get('kind')=='building']

# Check DXF building structure  
dxf = json.loads(open('public/topoexport/curis-dxf-buildings.geojson').read())
dxf_blds = dxf['features']

print("=== OSM Building (first) ===")
if osm_blds:
    osm_first = osm_blds[0]
    coords = osm_first['geometry']['coordinates'][0]
    print(f"Points: {len(coords)}")
    print(f"First 3 coords: {coords[:3]}")
    print(f"Closed: {coords[0] == coords[-1]}")

print("\n=== DXF Building (first) ===")
if dxf_blds:
    dxf_first = dxf_blds[0]
    coords = dxf_first['geometry']['coordinates'][0]
    print(f"Points: {len(coords)}")
    print(f"First 3 coords: {coords[:3]}")
    print(f"Closed: {coords[0] == coords[-1]}")

print("\n=== Structure comparison ===")
print(f"OSM building type: {osm_blds[0]['geometry']['type'] if osm_blds else '?'}")
print(f"DXF building type: {dxf_blds[0]['geometry']['type'] if dxf_blds else '?'}")
print(f"Both have same structure: {osm_blds[0]['geometry']['type'] == dxf_blds[0]['geometry']['type'] if osm_blds and dxf_blds else '?'}")

# Check if problem is coordinate order (lat/lon vs lon/lat)
print("\n=== Coordinate order test ===")
print(f"OSM first lon: {osm_blds[0]['geometry']['coordinates'][0][0][0] if osm_blds else '?'}")
print(f"DXF first lon: {dxf_blds[0]['geometry']['coordinates'][0][0][0] if dxf_blds else '?'}")
print(f"Expected Curis lon range: 4.799 to 4.841")

# Check buildings that should be visible
print("\n=== Buildings in full bbox ===")
bbox = {'minLon': 4.799322, 'maxLon': 4.840893, 'minLat': 45.846618, 'maxLat': 45.889713}
dxf_in_bbox = 0
for f in dxf_blds:
    coords = f['geometry']['coordinates'][0]
    for lon, lat in coords:
        if bbox['minLon'] <= lon <= bbox['maxLon'] and bbox['minLat'] <= lat <= bbox['maxLat']:
            dxf_in_bbox += 1
            break

print(f"DXF buildings in bbox: {dxf_in_bbox}/{len(dxf_blds)}")
