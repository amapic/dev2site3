from __future__ import annotations

import re
from collections import Counter

import ezdxf


def parse_num(text: str):
    m = re.search(r"[-+]?\d+[\.,]?\d*", text)
    if not m:
        return None
    return float(m.group(0).replace(",", "."))


doc = ezdxf.readfile(r"public/topoexport/topoexport_2D_vectorial.dxf")
msp = doc.modelspace()

pls = list(msp.query('LWPOLYLINE[layer=="TPX_RELIEF_COURBES_NIVEAU"]'))
print("polylines", len(pls))
zs = [float(getattr(pl.dxf, "elevation", 0.0) or 0.0) for pl in pls]
print("poly elevation unique", len(set(round(z, 6) for z in zs)), "min", min(zs), "max", max(zs))

texts = list(msp.query('TEXT[layer=="TPX_RELIEF_COURBES_NIVEAU_TEXTE"]'))
print("texts", len(texts))
vals = []
samples = []
for t in texts:
    raw = str(t.dxf.text)
    v = parse_num(raw)
    if v is not None:
        vals.append(v)
    if len(samples) < 30:
        samples.append(raw)

print("sample raw text:")
for s in samples:
    print("  ", repr(s))

if vals:
    c = Counter(round(v, 2) for v in vals)
    print("numeric count", len(vals), "unique", len(c), "min", min(vals), "max", max(vals))
    print("top values", c.most_common(20))
else:
    print("no numeric values parsed from contour texts")
