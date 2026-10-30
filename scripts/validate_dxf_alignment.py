"""
Validate that DXF buildings GeoJSON aligns with Curis-au-Mont-d'Or WGS84 bbox.
"""

import json
from pathlib import Path

dxf_buildings = json.loads(Path('public/topoexport/curis-dxf-buildings.geojson').read_text())
metadata = json.loads(Path('public/topoexport/curis-terrain-metadata.json').read_text())

# Expected Curis bbox
expected_bbox = metadata['bbox']
print("=== Expected Curis bbox ===")
print(f"  Lon: {expected_bbox['minLon']} to {expected_bbox['maxLon']}")
print(f"  Lat: {expected_bbox['minLat']} to {expected_bbox['maxLat']}")

# Actual DXF buildings bbox
all_lons = []
all_lats = []
for feature in dxf_buildings.get('features', []):
    coords = feature['geometry']['coordinates'][0]
    for lon, lat in coords:
        all_lons.append(lon)
        all_lats.append(lat)

if all_lons:
    print("\n=== DXF buildings bbox ===")
    print(f"  Lon: {min(all_lons):.6f} to {max(all_lons):.6f}")
    print(f"  Lat: {min(all_lats):.6f} to {max(all_lats):.6f}")
    
    print("\n=== Alignment check ===")
    lon_margin = (expected_bbox['maxLon'] - expected_bbox['minLon']) * 0.05
    lat_margin = (expected_bbox['maxLat'] - expected_bbox['minLat']) * 0.05
    
    if min(all_lons) >= expected_bbox['minLon'] - lon_margin and max(all_lons) <= expected_bbox['maxLon'] + lon_margin:
        print(f"  ✓ Longitude: OK (DXF buildings within Curis bbox ±5%)")
    else:
        print(f"  ⚠ Longitude: WARNING (DXF buildings extend beyond Curis bbox)")
    
    if min(all_lats) >= expected_bbox['minLat'] - lat_margin and max(all_lats) <= expected_bbox['maxLat'] + lat_margin:
        print(f"  ✓ Latitude: OK (DXF buildings within Curis bbox ±5%)")
    else:
        print(f"  ⚠ Latitude: WARNING (DXF buildings extend beyond Curis bbox)")

print(f"\n=== Summary ===")
print(f"  DXF buildings: {len(dxf_buildings.get('features', []))}")
print(f"  Source: BDTOPO (DXF local coordinates mapped to WGS84)")
print(f"  Height: Fixed 12.0 m per building (from DXF projection script default)")
print(f"  File: public/topoexport/curis-dxf-buildings.geojson")
print(f"  Used in: curis-topographie-3d.html")
