import zipfile, pathlib, shutil, re

path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\mon_document_clean5.docx')
backup = path.with_name(path.stem + '_backup_textbox_modernes.docx')
if not backup.exists():
    shutil.copy2(path, backup)
    print('Backup created at', backup)
else:
    print('Backup exists at', backup)

with zipfile.ZipFile(path, 'r') as z:
    files = {name: z.read(name) for name in z.namelist()}

doc = files['word/document.xml'].decode('utf-8', 'ignore')
pattern = re.compile(r'(<v:(?:rect|shape)[^>]*>)(.*?)</v:(?:rect|shape)>', re.S)

shapes = []
for m in pattern.finditer(doc):
    shapes.append((m.start(), m.end(), m.group(0)))

print('total shapes found:', len(shapes))
# Remove ordinal positions 2 to 13 (1-based)
to_remove = set(range(2, 14))
remaining = []
removed = []
for idx, (start, end, text) in enumerate(shapes, start=1):
    if idx in to_remove:
        removed.append((idx, start, end, text[:80].replace('\n', ' ')))
    else:
        remaining.append((start, end, text))

if not removed:
    print('No shapes removed.')
else:
    print('Removing shapes at indexes:', [r[0] for r in removed])
    new_doc = ''
    last = 0
    for idx, (start, end, text) in enumerate(shapes, start=1):
        if idx in to_remove:
            new_doc += doc[last:start]
            last = end
    new_doc += doc[last:]
    files['word/document.xml'] = new_doc.encode('utf-8')
    with zipfile.ZipFile(path, 'w', compression=zipfile.ZIP_DEFLATED) as out:
        for name, data in files.items():
            out.writestr(name, data)
    print('Done. Removed', len(removed), 'shapes.')
