from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path

xml_path = Path.home() / "AppData/Local/Temp/geopf_wmts.xml"
root = ET.parse(xml_path).getroot()

ns = {
    "wmts": "http://www.opengis.net/wmts/1.0",
    "ows": "http://www.opengis.net/ows/1.1",
}

for layer in root.findall('.//wmts:Layer', ns):
    identifier = layer.findtext('ows:Identifier', namespaces=ns)
    if not identifier:
        continue
    if 'LIDAR' not in identifier and 'ELEVATION' not in identifier and 'PLANIGNV2' not in identifier:
        continue

    styles = [el.findtext('ows:Identifier', namespaces=ns) for el in layer.findall('wmts:Style', ns)]
    formats = [el.text for el in layer.findall('wmts:Format', ns)]
    matrix_sets = [el.findtext('wmts:TileMatrixSet', namespaces=ns) for el in layer.findall('.//wmts:TileMatrixSetLink', ns)]
    resource_urls = [
        {
            'format': el.attrib.get('format'),
            'template': el.attrib.get('template'),
            'type': el.attrib.get('resourceType'),
        }
        for el in layer.findall('wmts:ResourceURL', ns)
    ]

    print('LAYER', identifier)
    print('  styles', styles)
    print('  formats', formats)
    print('  matrix_sets', matrix_sets)
    for item in resource_urls[:3]:
        print('  resource', item)
