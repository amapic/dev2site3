import pathlib
import re
import shutil
import zipfile

DOCX_PATH = pathlib.Path(r"C:\Users\amo\Documents\recehrce emploi\MES\mon_document_clean6.docx")
BACKUP_PATH = DOCX_PATH.with_name(DOCX_PATH.stem + "_backup_1111_strict.docx")

def norm(s: str) -> str:
    s = s.replace("’", "'").replace("`", "'")
    s = re.sub(r"\s+", " ", s)
    return s.strip().lower()

TARGET = norm("1111")

if not BACKUP_PATH.exists():
    shutil.copy2(DOCX_PATH, BACKUP_PATH)
    print("Backup created:", BACKUP_PATH)
else:
    print("Backup already exists:", BACKUP_PATH)

with zipfile.ZipFile(DOCX_PATH, "r") as zf:
    files = {name: zf.read(name) for name in zf.namelist()}

changed_files = []
removed_counts = {"vml": 0, "w_p": 0, "a_p": 0, "raw": 0}

for name, data in list(files.items()):
    if not name.endswith(".xml"):
        continue

    text = data.decode("utf-8", errors="ignore")
    original = text

    def drop_vml(m: re.Match) -> str:
        block = m.group(0)
        if TARGET in norm(re.sub(r"<[^>]+>", "", block)) or TARGET in norm(block):
            removed_counts["vml"] += 1
            return ""
        return block

    text = re.sub(r"<v:(?:rect|shape)\b[^>]*>.*?</v:(?:rect|shape)>", drop_vml, text, flags=re.S)

    def drop_w_p(m: re.Match) -> str:
        block = m.group(0)
        tokens = re.findall(r"<w:t[^>]*>(.*?)</w:t>", block, flags=re.S)
        merged = norm("".join(tokens))
        if TARGET in merged:
            removed_counts["w_p"] += 1
            return ""
        return block

    text = re.sub(r"<w:p\b[^>]*>.*?</w:p>", drop_w_p, text, flags=re.S)

    def drop_a_p(m: re.Match) -> str:
        block = m.group(0)
        tokens = re.findall(r"<a:t[^>]*>(.*?)</a:t>", block, flags=re.S)
        merged = norm("".join(tokens))
        if TARGET in merged:
            removed_counts["a_p"] += 1
            return ""
        return block

    text = re.sub(r"<a:p\b[^>]*>.*?</a:p>", drop_a_p, text, flags=re.S)

    before = text
    text = text.replace("1111", "")
    if text != before:
        removed_counts["raw"] += 1

    if text != original:
        files[name] = text.encode("utf-8")
        changed_files.append(name)

with zipfile.ZipFile(DOCX_PATH, "w", compression=zipfile.ZIP_DEFLATED) as out:
    for name, data in files.items():
        out.writestr(name, data)

print("Changed XML files:", changed_files)
print("Removed counts:", removed_counts)

remaining_hits = []
with zipfile.ZipFile(DOCX_PATH, "r") as zf:
    for name in zf.namelist():
        if not name.endswith(".xml"):
            continue
        content = zf.read(name).decode("utf-8", errors="ignore")
        if TARGET in norm(content):
            remaining_hits.append(name)

if remaining_hits:
    print("Remaining hits in:", remaining_hits)
else:
    print("Verification OK: no remaining normalized occurrence.")
