import zipfile, pathlib, shutil, re

path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\cv_Amaury_PICHAT_MES.docx')
backup = path.with_name(path.stem + '_backup.docx')
if not backup.exists():
    shutil.copy2(path, backup)
    print('Backup created at', backup)
else:
    print('Backup already exists at', backup)

ids_to_remove = [f'_x0000_s{num}' for num in range(1028, 1045)]
print('Removing IDs:', ids_to_remove)

with zipfile.ZipFile(path, 'r') as z:
    files = {name: z.read(name) for name in z.namelist()}
    doc = files['word/document.xml'].decode('utf-8', 'ignore')

removed = {}
for id_val in ids_to_remove:
    for tag in ['v:rect', 'v:shape']:
        pattern = re.compile(
            rf'<{tag}[^>]*\b(?:id|o:spid)="{re.escape(id_val)}"[^>]*>.*?</{tag}>',
            re.S
        )
        doc, n = pattern.subn('', doc)
        if n:
            removed.setdefault(id_val, []).append((tag, n))

files['word/document.xml'] = doc.encode('utf-8')

output_path = path
with zipfile.ZipFile(output_path, 'w', compression=zipfile.ZIP_DEFLATED) as out:
    for name, data in files.items():
        out.writestr(name, data)

print('Removed entries:')
for id_val, entries in removed.items():
    print(id_val, entries)
print('Done. Document saved to', output_path)
