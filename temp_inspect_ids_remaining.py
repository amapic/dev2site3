import zipfile, pathlib, re
path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\cv_Amaury_PICHAT_MES.docx')
with zipfile.ZipFile(path, 'r') as z:
    d = z.read('word/document.xml').decode('utf-8', 'ignore')
    for idv in ['_x0000_s1028', '_x0000_s1030']:
        idx = d.find(idv)
        print('ID', idv, 'count', d.count(idv))
        if idx != -1:
            s = max(0, idx-200)
            e = min(len(d), idx+200)
            print(d[s:e].replace('\n', ' '))
            print('---')
