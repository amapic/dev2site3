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


def inspect_morphs(path: Path):
    gltf = extract_gltf_json(path)
    meshes = gltf.get("meshes", [])
    print(f"\n=== {path.name} ===")
    for mesh_idx, mesh in enumerate(meshes):
        print(f"  mesh[{mesh_idx}] {mesh.get('name', '?')}:")
        for prim_idx, prim in enumerate(mesh.get("primitives", [])):
            targets = prim.get("targets", [])
            print(f"    prim[{prim_idx}] morph targets: {len(targets)}")
            if targets and "targetNames" in prim.get("extras", {}):
                print(f"      names: {prim['extras']['targetNames']}")


def main():
    model_dir = Path("public/model")
    for path in sorted(model_dir.glob("PlantOrchid*.glb")):
        try:
            inspect_morphs(path)
        except Exception as e:
            print(f"\nERREUR {path.name}: {e}")


if __name__ == "__main__":
    main()
