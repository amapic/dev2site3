import json
import struct
from pathlib import Path

GLB_MAGIC = b"glTF"


def extract_gltf_json(path: Path) -> dict:
    data = path.read_bytes()
    if data[:4] != GLB_MAGIC:
        raise ValueError(f"{path} n'est pas un GLB")
    version, total_length = struct.unpack("<II", data[4:12])
    offset = 12
    while offset < total_length:
        chunk_length, chunk_type = struct.unpack("<II", data[offset:offset + 8])
        chunk_data = data[offset + 8:offset + 8 + chunk_length]
        if chunk_type == 0x4E4F534A:
            return json.loads(chunk_data)
        offset += 8 + chunk_length
    raise ValueError("JSON chunk non trouvé")


def inspect(path: Path):
    gltf = extract_gltf_json(path)
    nodes = gltf.get("nodes", [])
    skins = gltf.get("skins", [])
    meshes = gltf.get("meshes", [])

    print(f"\n=== {path.name} ===")
    print(f"nodes: {len(nodes)}")
    print(f"meshes: {len(meshes)}")
    print(f"skins: {len(skins)}")

    for skin_idx, skin in enumerate(skins):
        joints = skin.get("joints", [])
        print(f"\n  skin[{skin_idx}] {skin.get('name', '?')} joints={len(joints)}")
        for j in joints:
            n = nodes[j]
            name = n.get("name", f"node_{j}")
            rot = n.get("rotation")
            trans = n.get("translation")
            print(f"    {name}: t={trans} r={rot}")

    print("\n  nodes avec mesh/skin:")
    for i, node in enumerate(nodes):
        if "mesh" in node or "skin" in node:
            print(f"    [{i}] {node.get('name', '?')} mesh={node.get('mesh')} skin={node.get('skin')}")


def main():
    inspect(Path("public/model/PlantOrchid001_Blender_Cyclestuteur1.glb"))


if __name__ == "__main__":
    main()
