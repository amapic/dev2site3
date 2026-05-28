from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public" / "topoexport"
METADATA_PATH = PUBLIC_DIR / "curis-terrain-metadata.json"
OUT_PATH = PUBLIC_DIR / "curis-map-features.geojson"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

ROAD_TAGS = [
    "motorway",
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "unclassified",
    "residential",
    "living_street",
    "service",
]


def overpass_query(bbox: tuple[float, float, float, float]) -> str:
    south, west, north, east = bbox
    roads = "|".join(ROAD_TAGS)
    return f"""
[out:json][timeout:50];
(
  way["building"]({south},{west},{north},{east});
  way["highway"~"^{roads}$"]({south},{west},{north},{east});
);
(._;>;);
out body;
""".strip()


def parse_elements(data: dict) -> dict[int, dict]:
    return {element["id"]: element for element in data.get("elements", []) if "id" in element}


def coords_for_way(way: dict, nodes_by_id: dict[int, dict]) -> list[list[float]]:
    coords: list[list[float]] = []
    for node_id in way.get("nodes", []):
        node = nodes_by_id.get(node_id)
        if not node:
            continue
        coords.append([float(node["lon"]), float(node["lat"])])
    return coords


def building_height(tags: dict[str, str]) -> float:
    if "height" in tags:
        raw = tags["height"].replace("m", "").replace(",", ".").strip()
        try:
            return max(4.0, float(raw))
        except ValueError:
            pass
    if "building:levels" in tags:
        raw = tags["building:levels"].replace(",", ".").strip()
        try:
            return max(4.0, float(raw) * 3.0)
        except ValueError:
            pass
    kind = tags.get("building", "")
    if kind in {"apartments", "residential", "terrace"}:
        return 9.0
    if kind in {"industrial", "warehouse", "commercial", "retail"}:
        return 12.0
    return 7.5


def road_width(tags: dict[str, str]) -> float:
    road_type = tags.get("highway", "")
    if road_type in {"motorway", "trunk"}:
        return 12.0
    if road_type in {"primary", "secondary"}:
        return 9.0
    if road_type in {"tertiary", "residential", "unclassified"}:
        return 6.0
    return 4.0


def main() -> None:
    metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    bbox = metadata["bbox"]
    south = bbox["minLat"]
    west = bbox["minLon"]
    north = bbox["maxLat"]
    east = bbox["maxLon"]

    query = overpass_query((south, west, north, east))
    request_url = OVERPASS_URL + "?" + urllib.parse.urlencode({"data": query})
    request = urllib.request.Request(
        request_url,
        headers={"User-Agent": "GitHub-Copilot-GeoPF-Prototype/1.0"},
        method="GET",
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        payload = json.loads(response.read().decode("utf-8"))

    elements_by_id = parse_elements(payload)
    nodes_by_id = {key: value for key, value in elements_by_id.items() if value.get("type") == "node"}

    features = []
    building_count = 0
    road_count = 0

    for element in payload.get("elements", []):
        if element.get("type") != "way":
            continue
        tags = element.get("tags", {})
        coords = coords_for_way(element, nodes_by_id)
        if len(coords) < 2:
            continue

        if "building" in tags and len(coords) >= 3:
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            features.append(
                {
                    "type": "Feature",
                    "properties": {
                        "kind": "building",
                        "source": "osm",
                        "osmId": element["id"],
                        "height": building_height(tags),
                        "building": tags.get("building", "yes"),
                        "name": tags.get("name", ""),
                    },
                    "geometry": {"type": "Polygon", "coordinates": [coords]},
                }
            )
            building_count += 1
            continue

        highway = tags.get("highway")
        if highway:
            features.append(
                {
                    "type": "Feature",
                    "properties": {
                        "kind": "road",
                        "source": "osm",
                        "osmId": element["id"],
                        "highway": highway,
                        "width": road_width(tags),
                        "name": tags.get("name", ""),
                    },
                    "geometry": {"type": "LineString", "coordinates": coords},
                }
            )
            road_count += 1

    geojson = {"type": "FeatureCollection", "features": features}
    OUT_PATH.write_text(json.dumps(geojson, ensure_ascii=True), encoding="utf-8")

    print("features", len(features))
    print("buildings", building_count)
    print("roads", road_count)
    print("output", OUT_PATH)


if __name__ == "__main__":
    main()
