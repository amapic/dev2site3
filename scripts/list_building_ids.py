from __future__ import annotations

import json
from pathlib import Path

import ezdxf


doc = ezdxf.readfile(r"public/topoexport/topoexport_2D_vectorial.dxf")
msp = doc.modelspace()

items = []
for i, ent in enumerate(msp.query('LWPOLYLINE[layer=="TPX_BATIMENTS"]'), start=1):
    points = list(ent.get_points("xy"))
    if len(points) < 3:
        continue

    items.append(
        {
            "index": i,
            "id": f"bat_{i:03d}",
            "handle": ent.dxf.handle,
            "layer": ent.dxf.layer,
            "closed": bool(ent.closed),
            "vertex_count": len(points),
        }
    )

out_path = Path("public/topoexport/topoexport_buildings_index.json")
out_path.write_text(json.dumps({"count": len(items), "buildings": items}, ensure_ascii=True, indent=2), encoding="utf-8")

print("count", len(items))
print("first10", json.dumps(items[:10], ensure_ascii=True))
print("index_file", out_path)
