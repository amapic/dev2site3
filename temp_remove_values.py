import zipfile, pathlib, shutil, re

path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\mon_document_clean5.docx')
backup = path.with_name(path.stem + '_backup_values.docx')
if not backup.exists():
    shutil.copy2(path, backup)
    print('backup saved to', backup)

values = ['Poste occupé', 'NOM DE L’ENTREPRISE', 'Fjfjgj']
regex_tokens = [re.escape(v) for v in values]

with zipfile.ZipFile(path, 'r') as z:
    files = {name: z.read(name) for name in z.namelist()}

updated = {}
for name, data in files.items():
    if not name.endswith('.xml'):
        continue
    text = data.decode('utf-8', 'ignore')
    original = text
    for token in regex_tokens:
        text = re.sub(rf'<v:rect[^>]*>.*?{token}.*?</v:rect>', '', text, flags=re.I | re.S)
        text = re.sub(rf'<v:shape[^>]*>.*?{token}.*?</v:shape>', '', text, flags=re.I | re.S)
        text = re.sub(rf'<w:p[^>]*>.*?{token}.*?</w:p>', '', text, flags=re.I | re.S)
    if text != original:
        updated[name] = True
        files[name] = text.encode('utf-8')
        print('cleaned', name)

if not updated:
    print('no matching content found to remove')

with zipfile.ZipFile(path, 'w', compression=zipfile.ZIP_DEFLATED) as out:
    for name, data in files.items():
        out.writestr(name, data)

print('done')
