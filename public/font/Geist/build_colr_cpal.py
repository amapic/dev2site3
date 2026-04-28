"""
Construit une font COLR/CPAL a partir de {char}_modified.svg pour le glyphe {char}.

Usage:
    py build_colr_cpal.py <caractere>

Exemples:
    py build_colr_cpal.py o
    py build_colr_cpal.py i
"""

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from fontTools.colorLib.builder import buildCOLR, buildCPAL
from fontTools.svgLib.path import SVGPath
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

BASE_DIR = Path(__file__).resolve().parent

FONT_IN = BASE_DIR / "static/Geist-Regular.ttf"
FONT_OUT = BASE_DIR / "Geist-Regular-COLR.ttf"

# Palette index special 0xFFFF = currentColor (couleur CSS du texte)
FOREGROUND_COLOR_INDEX = 0xFFFF

# Convention SVG sur chaque <path>:
# - data-color-mode="fixed|current"  (current = suit CSS color, defaut si absent)
# - fill="#RRGGBB|#RGB|rgb(...)|nom" (utilise si mode=fixed)

NAMED_COLORS = {
    "black": (0, 0, 0),
    "white": (255, 255, 255),
    "red": (255, 0, 0),
    "yellow": (255, 255, 0),
    "blue": (0, 0, 255),
    "green": (0, 128, 0),
    "cyan": (0, 255, 255),
    "magenta": (255, 0, 255),
    "orange": (255, 165, 0),
}

SUPPORTED_SVG_SHAPES = {"path", "circle", "ellipse", "rect", "polygon", "polyline", "line"}


def local_tag_name(tag: str) -> str:
    return tag.split("}", 1)[-1]


def combine_transforms(parent_transform: str, child_transform: str) -> str:
    parent = parent_transform.strip()
    child = child_transform.strip()
    if parent and child:
        return f"{parent} {child}"
    return parent or child


def collect_paths_with_effective_transform(
    node: ET.Element,
    inherited_transform: str = "",
) -> list[dict[str, object]]:
    node_transform = node.get("transform") or ""
    effective_transform = combine_transforms(inherited_transform, node_transform)
    found: list[dict[str, object]] = []

    tag_name = local_tag_name(node.tag)
    if tag_name in SUPPORTED_SVG_SHAPES:
        if tag_name != "path" or node.get("d"):
            found.append({"element": node, "transform": effective_transform})

    for child in list(node):
        found.extend(collect_paths_with_effective_transform(child, effective_transform))

    return found


def draw_svg_element_with_transform(pen, element_svg: str, transform: str | None = None) -> None:
    t = (transform or "").strip()
    if t:
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg">'
            f'<g transform="{t}">{element_svg}</g>'
            "</svg>"
        )
    else:
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg">'
            f"{element_svg}"
            "</svg>"
        )

    SVGPath.fromstring(svg).draw(pen)


def compute_paths_bounds(layers: list[dict[str, object]]) -> tuple[float, float, float, float]:
    pen = BoundsPen(None)
    for layer in layers:
        element_svg = str(layer["element_svg"])
        path_transform = str(layer.get("transform") or "")
        draw_svg_element_with_transform(pen, element_svg, path_transform)

    if pen.bounds is None:
        raise ValueError("Impossible de calculer les bornes des paths SVG")

    return pen.bounds


def glyph_from_svg_element(element_svg: str, transform: str, path_transform: str, glyph_set):
    pen = TTGlyphPen(glyph_set)
    local_transform = path_transform.strip()
    if local_transform:
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg">'
            f'<g transform="{transform}"><g transform="{local_transform}">{element_svg}</g></g>'
            "</svg>"
        )
    else:
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg">'
            f'<g transform="{transform}">{element_svg}</g>'
            "</svg>"
        )

    SVGPath.fromstring(svg).draw(pen)
    return pen.glyph()


def parse_svg_color_to_rgba(fill_value: str | None) -> tuple[float, float, float, float]:
    if not fill_value:
        raise ValueError("Couleur fixe sans attribut fill")

    value = fill_value.strip().lower()
    if value == "none":
        raise ValueError("fill='none' non supporte pour une couche COLR")

    if value.startswith("#"):
        if len(value) == 4:
            r = int(value[1] * 2, 16)
            g = int(value[2] * 2, 16)
            b = int(value[3] * 2, 16)
            return (r / 255.0, g / 255.0, b / 255.0, 1.0)
        if len(value) == 7:
            r = int(value[1:3], 16)
            g = int(value[3:5], 16)
            b = int(value[5:7], 16)
            return (r / 255.0, g / 255.0, b / 255.0, 1.0)
        raise ValueError(f"Hex couleur invalide: {fill_value}")

    rgb_match = re.fullmatch(r"rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)", value)
    if rgb_match:
        r, g, b = (int(rgb_match.group(i)) for i in (1, 2, 3))
        if any(c < 0 or c > 255 for c in (r, g, b)):
            raise ValueError(f"rgb() hors plage 0..255: {fill_value}")
        return (r / 255.0, g / 255.0, b / 255.0, 1.0)

    if value in NAMED_COLORS:
        r, g, b = NAMED_COLORS[value]
        return (r / 255.0, g / 255.0, b / 255.0, 1.0)

    raise ValueError(
        f"Couleur fill non supportee: {fill_value}. Utilise #RRGGBB, #RGB, rgb(...) ou un nom simple."
    )


def parse_style_fill(style_value: str | None) -> str | None:
    if not style_value:
        return None

    for chunk in style_value.split(";"):
        part = chunk.strip()
        if not part or ":" not in part:
            continue
        key, value = part.split(":", 1)
        if key.strip().lower() == "fill":
            fill_value = value.strip()
            return fill_value or None

    return None


def parse_svg_layers(path_entries: list[dict[str, object]]) -> list[dict[str, object]]:
    layers: list[dict[str, object]] = []

    for index, entry in enumerate(path_entries):
        path = entry["element"]
        tag_name = local_tag_name(path.tag)
        if tag_name not in SUPPORTED_SVG_SHAPES:
            continue

        if tag_name == "path" and not path.get("d"):
            continue

        element_svg = ET.tostring(path, encoding="unicode")
        if not element_svg:
            continue

        fill_value = path.get("fill") or parse_style_fill(path.get("style"))

        raw_color_mode = (path.get("data-color-mode") or "").strip().lower()

        if raw_color_mode in {"fixed", "current"}:
            color_mode = raw_color_mode
        else:
            color_mode = "fixed" if fill_value else "current"

        layer: dict[str, object] = {
            "index": index,
            "element_svg": element_svg,
            "transform": str(entry.get("transform") or ""),
            "color_mode": color_mode,
            "fill": fill_value,
        }

        layers.append(layer)

    if not layers:
        raise ValueError("Le SVG doit contenir au moins 1 forme SVG supportee")

    return layers


def apply_colr_for_glyph(
    font: TTFont,
    base_glyph_name: str,
    layers: list[dict[str, object]],
    src_bounds: tuple[float, float, float, float],
) -> list[tuple[str, int]]:
    advance_width, lsb = font["hmtx"][base_glyph_name]
    base_glyph = font["glyf"][base_glyph_name]
    x_min, y_min, x_max, y_max = base_glyph.xMin, base_glyph.yMin, base_glyph.xMax, base_glyph.yMax
    target_w = x_max - x_min
    target_h = y_max - y_min

    src_x_min, src_y_min, src_x_max, src_y_max = src_bounds
    src_w = src_x_max - src_x_min
    src_h = src_y_max - src_y_min
    if src_w == 0 or src_h == 0:
        raise ValueError("Bornes SVG invalides: largeur/hauteur nulles")

    sx = target_w / src_w
    sy = target_h / src_h

    transform = (
        f"translate({x_min} {y_max}) "
        f"scale({sx} {-sy}) "
        f"translate({-src_x_min} {-src_y_min})"
    )

    glyph_set = font.getGlyphSet()
    layer_records: list[tuple[str, int]] = []

    glyph_order = font.getGlyphOrder()
    for layer in layers:
        index = int(layer["index"])
        element_svg = str(layer["element_svg"])
        path_transform = str(layer.get("transform") or "")
        color_mode = str(layer["color_mode"])
        fill = layer.get("fill")

        layer_glyph = glyph_from_svg_element(element_svg, transform, path_transform, glyph_set)
        layer_name = f"{base_glyph_name}.colr.{index}"

        font["glyf"][layer_name] = layer_glyph
        font["glyf"][layer_name].recalcBounds(font["glyf"])
        font["hmtx"][layer_name] = (advance_width, lsb)

        if layer_name not in glyph_order:
            glyph_order.append(layer_name)

        if color_mode == "current":
            palette_index = FOREGROUND_COLOR_INDEX
        else:
            rgba = parse_svg_color_to_rgba(str(fill) if fill is not None else None)
            if rgba not in palette_colors:
                palette_colors.append(rgba)
            palette_index = palette_colors.index(rgba)

        layer_records.append((layer_name, palette_index))

    font.setGlyphOrder(glyph_order)
    return layer_records


palette_colors: list[tuple[float, float, float, float]] = []


def main() -> None:
    if len(sys.argv) < 2 or len(sys.argv[1]) != 1:
        print("Usage: py build_colr_cpal.py <caractere>  (ex: o, i, a...)")
        sys.exit(1)

    char = sys.argv[1].lower()
    svg_file = BASE_DIR / f"{char}_modified.svg"

    if not svg_file.exists():
        print(f"Erreur: fichier SVG introuvable -> {svg_file}")
        sys.exit(1)

    font = TTFont(FONT_IN)

    # Parse SVG et recupere les paths
    tree = ET.parse(svg_file)
    root = tree.getroot()
    path_entries = collect_paths_with_effective_transform(root)
    layers = parse_svg_layers(path_entries)
    src_x_min, src_y_min, src_x_max, src_y_max = compute_paths_bounds(layers)
    src_bounds = (src_x_min, src_y_min, src_x_max, src_y_max)

    palette_colors.clear()
    records = apply_colr_for_glyph(font, char, layers, src_bounds)

    # Au moins une couleur fixe est requise pour la table CPAL.
    if not palette_colors:
        palette_colors.append((0.0, 0.0, 0.0, 1.0))

    font["CPAL"] = buildCPAL([palette_colors])

    font["COLR"] = buildCOLR(
        {
            char: records,
        },
        version=0,
        glyphMap=font.getReverseGlyphMap(),
    )

    font.save(FONT_OUT)
    print(f"OK: font COLR/CPAL sauvegardee -> {FONT_OUT}")


if __name__ == "__main__":
    main()
