import json
import struct
from pathlib import Path
import numpy as np

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


def read_accessor_raw(gltf: dict, data: bytes, accessor_idx: int):
    acc = gltf["accessors"][accessor_idx]
    bv_idx = acc["bufferView"]
    bv = gltf["bufferViews"][bv_idx]
    byte_offset = acc.get("byteOffset", 0) + bv.get("byteOffset", 0)
    count = acc["count"]
    component_type = acc["componentType"]
    type_ = acc["type"]

    type_dims = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}
    dim = type_dims[type_]

    fmt_map = {
        5120: ("b", 1),
        5121: ("B", 1),
        5122: ("h", 2),
        5123: ("H", 2),
        5125: ("I", 4),
        5126: ("f", 4),
    }
    fmt_char, comp_size = fmt_map[component_type]
    total_size = dim * comp_size

    buffers = gltf.get("buffers", [])
    buffer_offset = 0
    for i in range(bv["buffer"]):
        if "uri" not in buffers[i]:
            buffer_offset += buffers[i]["byteLength"]

    vals = []
    for i in range(count):
        start = buffer_offset + byte_offset + i * total_size
        v = struct.unpack("<" + fmt_char * dim, data[start:start + total_size])
        vals.append(v)
    return np.array(vals)


def inspect_weights(path: Path):
    data = path.read_bytes()
    gltf = extract_gltf_json(path)
    nodes = gltf.get("nodes", [])
    skins = gltf.get("skins", [])
    meshes = gltf.get("meshes", [])

    print(f"\n=== {path.name} ===")

    for skin_idx, skin in enumerate(skins):
        joint_names = [nodes[j].get("name", f"node_{j}") for j in skin.get("joints", [])]
        print(f"  skin[{skin_idx}] joints: {joint_names}")

    for mesh_idx, mesh in enumerate(meshes):
        print(f"\n  mesh[{mesh_idx}] {mesh.get('name', '?')}:")
        for prim_idx, prim in enumerate(mesh.get("primitives", [])):
            attrs = prim.get("attributes", {})
            has_joints = "JOINTS_0" in attrs
            has_weights = "WEIGHTS_0" in attrs
            print(f"    prim[{prim_idx}] has JOINTS_0={has_joints} WEIGHTS_0={has_weights}")
            if not has_joints or not has_weights:
                continue

            joints = read_accessor_raw(gltf, data, attrs["JOINTS_0"])
            weights = read_accessor_raw(gltf, data, attrs["WEIGHTS_0"])

            # Pour chaque joint, somme des weights et nombre de vertices influencés
            skin_idx = prim.get("skin", 0)
            skin = skins[skin_idx]
            joint_indices = skin.get("joints", [])
            num_joints = len(joint_indices)

            per_joint_weight_sum = np.zeros(num_joints)
            per_joint_vertex_count = np.zeros(num_joints, dtype=int)

            # joints et weights sont des tableaux N x 4
            for j_idx in range(4):
                joint_ids = joints[:, j_idx].astype(int)
                w = weights[:, j_idx]
                for local_joint_idx in range(num_joints):
                    mask = joint_ids == local_joint_idx
                    per_joint_weight_sum[local_joint_idx] += w[mask].sum()
                    per_joint_vertex_count[local_joint_idx] += mask.sum()

            print(f"      poids par joint (somme / vertices influencés):")
            for local_idx, global_idx in enumerate(joint_indices):
                name = nodes[global_idx].get("name", f"node_{global_idx}")
                total_w = per_joint_weight_sum[local_idx]
                count = per_joint_vertex_count[local_idx]
                avg = total_w / count if count > 0 else 0
                print(f"        {name}: sum={total_w:.4f}, vertices={count}, avg={avg:.4f}")


def main():
    model_dir = Path("public/model")
    for path in sorted(model_dir.glob("PlantOrchid*.glb")):
        try:
            inspect_weights(path)
        except Exception as e:
            print(f"\nERREUR {path.name}: {e}")


if __name__ == "__main__":
    main()
