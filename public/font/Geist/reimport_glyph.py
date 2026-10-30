"""
Réintègre un glyphe SVG modifié dans une font TTF.
Usage: python reimport_glyph.py

Prérequis: pip install fonttools
"""
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
import xml.etree.ElementTree as ET
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

FONT_IN  = BASE_DIR / "static/Geist-Regular.ttf"    # <- font originale (statique)
SVG_FILE = BASE_DIR / "O_modified.svg"       # <- ton SVG modifié
GLYPH    = "O"                    # <- le glyphe à remplacer
FONT_OUT = BASE_DIR / "Geist-Regular-Modified.ttf"   # <- font résultat

font     = TTFont(FONT_IN)
upm      = font["head"].unitsPerEm

# --- Lire le path SVG ---
tree = ET.parse(SVG_FILE)
root = tree.getroot()
ns   = {"svg": "http://www.w3.org/2000/svg"}

# Cherche les <path> dans le SVG (avec et sans namespace)
paths = root.findall(".//svg:path", ns)
if not paths:
    paths = root.findall(".//path")

if not paths:
    raise ValueError("Aucun <path d='...'> trouve dans le SVG")

# Si plusieurs paths existent, privilegie celui en evenodd (souvent anneau/forme externe)
path_el = next((p for p in paths if (p.get("fill-rule") or "").lower() == "evenodd"), paths[0])
path_data = path_el.get("d")

if not path_data:
    raise ValueError("Le <path> selectionne n'a pas d'attribut d")

# --- Convertir le path SVG en glyphe TTF ---
from fontTools.svgLib.path import SVGPath

pen        = TTGlyphPen(font.getGlyphSet())
svg_path   = SVGPath.fromstring(f'<svg xmlns="http://www.w3.org/2000/svg"><g transform="scale(1,-1) translate(0,-{upm})"><path d="{path_data}"/></g></svg>')
svg_path.draw(pen)

# Récupérer le nouveau glyphe
new_glyph  = pen.glyph()

# Remplacer dans la table glyf
font["glyf"][GLYPH]     = new_glyph

# Recalculer les bounds
font["glyf"][GLYPH].recalcBounds(font["glyf"])

font.save(FONT_OUT)
print(f"✅ Font sauvegardée : {FONT_OUT}")
print(f"   Installe-la sur Windows avec un double-clic → Installer")