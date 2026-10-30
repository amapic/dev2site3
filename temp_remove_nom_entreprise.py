import zipfile, pathlib, shutil, re

path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\mon_document_clean6.docx')
backup = path.with_name(path.stem + '_backup_nom_entreprise.docx')
if not backup.exists():
    shutil.copy2(path, backup)
    print('Backup created at', backup)
else:
    print('Backup exists at', backup)

needle = 'nom de l’entreprise'
needle_norm = needle.lower()
xml_pattern = re.compile(r'<w:p\b[^>]*>.*?</w:p>', re.S)
shape_pattern = re.compile(r'<v:(?:rect|shape)\b[^>]*>.*?</v:(?:rect|shape)>', re.S)

with zipfile.ZipFile(path, 'r') as z:
    files = {name: z.read(name) for name in z.namelist()}

changed = False
for name, data in list(files.items()):
    if not name.endswith('.xml'):
        continue
    text = data.decode('utf-8', 'ignore')
    original = text
    # remove shapes containing the target
    def remove_shape(match):
        block = match.group(0)
        if needle_norm in block.lower():
            return ''
        return block
    text = shape_pattern.sub(remove_shape, text)
    # remove paragraphs containing the target in concatenated w:t text
    def remove_para(match):
        block = match.group(0)
        tokens = re.findall(r'<w:t[^>]*>(.*?)</w:t>', block, re.S)
        plain = ''.join(tokens).lower()
        if needle_norm in plain:
            return ''
        return block
    text = xml_pattern.sub(remove_para, text)
    if text != original:
        files[name] = text.encode('utf-8')
        changed = True
        print('Cleaned', name)

if not changed:
    print('No matching content found in any XML file.')
else:
    with zipfile.ZipFile(path, 'w', compression=zipfile.ZIP_DEFLATED) as out:
        for name, data in files.items():
            out.writestr(name, data)
    print('Done. Saved', path)
