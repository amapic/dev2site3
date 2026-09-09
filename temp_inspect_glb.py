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
    json_data = None
    while offset < total_length:
        chunk_length, chunk_type = struct.unpack("<II", data[offset:offset + 8])
        chunk_data = data[offset + 8:offset + 8 + chunk_length]
        if chunk_type == 0x4E4F534A:
            json_data = json.loads(chunk_data)
            break
        offset += 8 + chunk_length
    if json_data is None:
        raise ValueError("JSON chunk non trouvé")
    return json_data


def inspect_glb(path: Path):
    gltf = extract_gltf_json(path)
    nodes = gltf.get("nodes", [])
    meshes = gltf.get("meshes", [])
    skins = gltf.get("skins", [])
    animations = gltf.get("animations", [])
    accessors = gltf.get("accessors", [])

    print(f"\n=== {path.name} ===")
    print(f"  nodes: {len(nodes)}")
    print(f"  meshes: {len(meshes)}")
    print(f"  skins: {len(skins)}")
    print(f"  animations: {len(animations)}")

    if animations:
        for anim in animations:
            name = anim.get("name", "<noname>")
            samplers = anim.get("samplers", [])
            channels = anim.get("channels", [])
            print(f"    anim '{name}': samplers={len(samplers)}, channels={len(channels)}")
            for ch in channels:
                target = ch.get("target", {})
                node_idx = target.get("node")
                path = target.get("path")
                node_name = nodes[node_idx].get("name", f"node_{node_idx}") if node_idx is not None else "?"
                print(f"      channel: node={node_name} path={path}")

    if skins:
        for skin in skins:
            joints = skin.get("joints", [])
            print(f"    skin '{skin.get('name', '<noname>')}': joints={len(joints)}")
            for j in joints:
                n = nodes[j]
                print(f"      joint: {n.get('name', '?')} matrix/trs?={'matrix' in n} rotation={'rotation' in n} translation={'translation' in n}")

    # nodes ayant un skin ou une mesh
    for i, node in enumerate(nodes):
        if "skin" in node or "mesh" in node:
            extras = []
            if "skin" in node:
                extras.append(f"skin={node['skin']}")
            if "mesh" in node:
                extras.append(f"mesh={node['mesh']}")
            print(f"    node[{i}] {node.get('name','?')}: {', '.join(extras)}")


def main():
    model_dir = Path("public/model")
    for path in sorted(model_dir.glob("PlantOrchid*.glb")):
        try:
            inspect_glb(path)
        except Exception as e:
            print(f"\nERREUR {path.name}: {e}")


if __name__ == "__main__":
    main()
