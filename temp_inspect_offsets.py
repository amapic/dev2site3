import zipfile, pathlib
path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\mon_document_clean5.docx')
with zipfile.ZipFile(path, 'r') as z:
    d = z.read('word/document.xml').decode('utf-8', 'ignore')
for value in ['occupé', 'NOM DE L’ENTREPRISE']:
    idx = d.lower().find(value.lower())
    print('VALUE', value, 'idx', idx)
    print(d[idx-200:idx+200].replace('\n',' '))
    print('last <w:p', d.rfind('<w:p',0,idx))
    print('last <w:pPr', d.rfind('<w:pPr',0,idx))
    print('last <w:r', d.rfind('<w:r',0,idx))
    print('last </w:p>', d.rfind('</w:p>',0,idx))
    print('---')
