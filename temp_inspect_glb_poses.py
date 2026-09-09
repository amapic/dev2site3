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


def read_accessor(gltf: dict, data: bytes, accessor_idx: int):
    """Lit un accessor et retourne une liste de valeurs selon le type et componentType."""
    acc = gltf["accessors"][accessor_idx]
    bv_idx = acc["bufferView"]
    bv = gltf["bufferViews"][bv_idx]
    byte_offset = acc.get("byteOffset", 0) + bv.get("byteOffset", 0)
    count = acc["count"]
    component_type = acc["componentType"]
    type_ = acc["type"]

    type_dims = {
        "SCALAR": 1,
        "VEC2": 2,
        "VEC3": 3,
        "VEC4": 4,
        "MAT2": 4,
        "MAT3": 9,
        "MAT4": 16,
    }
    dim = type_dims[type_]

    fmt_map = {
        5120: ("b", 1),   # BYTE
        5121: ("B", 1),   # UNSIGNED_BYTE
        5122: ("h", 2),   # SHORT
        5123: ("H", 2),   # UNSIGNED_SHORT
        5125: ("I", 4),   # UNSIGNED_INT
        5126: ("f", 4),   # FLOAT
    }
    fmt_char, comp_size = fmt_map[component_type]
    total_size = dim * comp_size

    # Trouver le buffer
    buffer_idx = bv["buffer"]
    buffers = gltf.get("buffers", [])
    if "uri" in buffers[buffer_idx]:
        # on ne gère pas les buffers externes ici
        return None
    buffer_offset = 0
    for i in range(buffer_idx):
        b = buffers[i]
        if "uri" not in b:
            buffer_offset += b["byteLength"]

    values = []
    for i in range(count):
        start = buffer_offset + byte_offset + i * total_size
        vals = struct.unpack("<" + fmt_char * dim, data[start:start + total_size])
        values.append(vals)
    return values


def get_joint_pose(gltf: dict, data: bytes, node_idx: int):
    node = gltf["nodes"][node_idx]
    rot = node.get("rotation")
    trans = node.get("translation")
    # Parfois les poses sont stockées via des animations (mais on a vu qu'il n'y en a pas)
    # ou via des matrices
    if "matrix" in node:
        return {"name": node.get("name"), "matrix": node["matrix"], "rotation": None, "translation": None}
    return {"name": node.get("name"), "rotation": rot, "translation": trans}


def inspect_joints(path: Path):
    data = path.read_bytes()
    gltf = extract_gltf_json(path)
    nodes = gltf.get("nodes", [])
    skins = gltf.get("skins", [])

    print(f"\n=== {path.name} ===")
    for skin_idx, skin in enumerate(skins):
        print(f"  skin[{skin_idx}] {skin.get('name', '?')}:")
        for j in skin.get("joints", []):
            node = nodes[j]
            name = node.get("name", f"node_{j}")
            rot = node.get("rotation")
            trans = node.get("translation")
            scale = node.get("scale")
            print(f"    {name}: t={format_vec(trans)} r={format_quat(rot)} s={format_vec(scale)}")


def format_vec(v):
    if v is None:
        return "None"
    return "(" + ", ".join(f"{x:+.4f}" for x in v) + ")"


def format_quat(q):
    if q is None:
        return "None"
    return "(" + ", ".join(f"{x:+.4f}" for x in q) + ")"


def main():
    model_dir = Path("public/model")
    paths = sorted(model_dir.glob("PlantOrchid*.glb"))
    for path in paths:
        try:
            inspect_joints(path)
        except Exception as e:
            print(f"\nERREUR {path.name}: {e}")


if __name__ == "__main__":
    main()
