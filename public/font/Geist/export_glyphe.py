from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

font = TTFont(BASE_DIR / "Geist-Regular.ttf")
glyphSet = font.getGlyphSet()

GLYPH = "o"
glyph = glyphSet[GLYPH]

pen = SVGPathPen(glyphSet)
glyph.draw(pen)

path_data = pen.getCommands()

# Metrics
glyph_obj = font["glyf"][GLYPH]
glyph_obj.recalcBounds(font["glyf"])

xMin, yMin, xMax, yMax = (
    glyph_obj.xMin,
    glyph_obj.yMin,
    glyph_obj.xMax,
    glyph_obj.yMax,
)

width, height = xMax - xMin, yMax - yMin

# Très important : inclure les offsets
svg = f'''<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="{xMin} {yMin} {width} {height}">
  <path d="{path_data}" fill="black"/>
</svg>'''

with open(BASE_DIR / "glyph_o.svg", "w", encoding="utf-8") as f:
    f.write(svg)

print("✅ SVG exporté proprement")