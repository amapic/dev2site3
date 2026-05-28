import zipfile, pathlib, re
path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\cv_Amaury_PICHAT_MES.docx')
with zipfile.ZipFile(path, 'r') as z:
    d = z.read('word/document.xml').decode('utf-8', 'ignore')
    ids = [m.group(1) for m in re.finditer(r'id="(_x0000_s[0-9]+)"', d)]
    print('count ids', len(ids))
    for i, idv in enumerate(ids, 1):
        print(f'{i}: {idv}')
    print('--- unique ---')
    for idv in sorted(set(ids)):
        print(idv)
