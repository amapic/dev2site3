import zipfile, pathlib, shutil

path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\cv_Amaury_PICHAT_MES.docx')
backup = path.with_name(path.stem + '_backup.docx')
if not backup.exists():
    shutil.copy2(path, backup)
    print('Backup saved to', backup)
else:
    print('Backup already exists:', backup)

with zipfile.ZipFile(path, 'r') as z:
    files = {name: z.read(name) for name in z.namelist()}
    doc = files['word/document.xml'].decode('utf-8', 'ignore')
    start = doc.find('id="_x0000_s1033"')
    if start == -1:
        raise SystemExit('Shape id _x0000_s1033 not found in document.xml')
    rect_start = doc.rfind('<v:rect', 0, start)
    rect_end = doc.find('</v:rect>', start)
    if rect_start == -1 or rect_end == -1:
        raise SystemExit('Could not locate <v:rect> block boundaries')
    rect_end += len('</v:rect>')
    new_doc = doc[:rect_start] + doc[rect_end:]
    files['word/document.xml'] = new_doc.encode('utf-8')

output_path = path
with zipfile.ZipFile(output_path, 'w', compression=zipfile.ZIP_DEFLATED) as out:
    for name, data in files.items():
        out.writestr(name, data)

print('Removed TextBox VML #8 and saved to', output_path)
print('Backup saved to', backup)
