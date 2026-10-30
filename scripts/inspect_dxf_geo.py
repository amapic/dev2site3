import ezdxf
from pathlib import Path

doc = ezdxf.readfile(r'public/topoexport/topoexport_2D_vectorial.dxf')
print("=== DXF Header Info ===")
print(f"Version: {doc.dxfversion}")
print(f"Units: {doc.header.get('$INSUNITS', '?')}")

# Check for any geo info
h = doc.header
for var in ['$PEDALIGN', '$PDMODE', '$UNITS', '$DIMUNIT', '$AUNITS']:
    if var in h:
        print(f"{var}: {h[var]}")

print("\n=== Extent of buildings ===")
msp = doc.modelspace()
buildings = list(msp.query('LWPOLYLINE[layer=="TPX_BATIMENTS"]'))
all_x = []
all_y = []
for ent in buildings:
    for x, y in ent.get_points('xy'):
        all_x.append(x)
        all_y.append(y)

if all_x:
    print(f"X: {min(all_x):.2f} to {max(all_x):.2f}, span={max(all_x)-min(all_x):.2f}")
    print(f"Y: {min(all_y):.2f} to {max(all_y):.2f}, span={max(all_y)-min(all_y):.2f}")
    
# Check if there's any comments or text with geo info
texts = list(msp.query('TEXT'))
print(f"\nText entities: {len(texts)}")
if texts:
    for txt in texts[:5]:
        print(f"  {txt.dxf.text}")
