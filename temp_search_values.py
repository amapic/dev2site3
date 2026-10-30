import zipfile, pathlib, re
path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\mon_document_clean5.docx')
values = ['occupé', 'NOM DE L’ENTREPRISE']
with zipfile.ZipFile(path, 'r') as z:
    data = z.read('word/document.xml').decode('utf-8', 'ignore')
    lower = data.lower()
    for value in values:
        start = 0
        print('===', value, '===')
        while True:
            idx = lower.find(value.lower(), start)
            if idx == -1:
                break
            pstart = data.rfind('<w:p', 0, idx)
            if pstart == -1:
                print('NO WP at idx', idx)
                print(data[idx-50:idx+50].replace('\n',' '))
            pend = data.find('</w:p>', idx)
            if pend != -1:
                pend += len('</w:p>')
            print('idx', idx, 'start', pstart, 'end', pend)
            print('raw around start', data[max(0,pstart-20):pstart+20].replace('\n',' '))
            print('raw around idx', data[idx-80:idx+80].replace('\n',' '))
            print('raw around end', data[pend-20:pend].replace('\n',' '))
            print('---')
            start = idx + 1
