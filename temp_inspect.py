import zipfile, pathlib, re
path=pathlib.Path(r'C:\Users\\amo\\Documents\\recehrce emploi\\MES\\cv_Amaury_PICHAT_MES.docx')
with zipfile.ZipFile(path,'r') as z:
    data=z.read('word/document.xml').decode('utf-8','ignore')
    shapes=re.findall(r'<v:shape[^>]*>', data)
    print('shape count', len(shapes))
    for s in shapes[:50]:
        m=re.search(r'id=\"([^\"]+)\"', s)
        n=re.search(r'name=\"([^\"]+)\"', s)
        cls = re.search(r'class=\"([^\"]+)\"', s)
        print('id=', m.group(1) if m else None, 'name=', n.group(1) if n else None, 'class=', cls.group(1) if cls else None)
