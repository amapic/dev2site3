import zipfile, pathlib, re

path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\cv_Amaury_PICHAT_MES.docx')
with zipfile.ZipFile(path, 'r') as z:
    data = z.read('word/document.xml').decode('utf-8', 'ignore')
    print('document.xml shape count', data.count('<v:shape'))
    print('document.xml textbox count', data.lower().count('textbox'))
    # show first 20 v:textbox contexts
    idx = 0
    for i in range(20):
        idx = data.lower().find('<v:textbox', idx)
        if idx == -1:
            break
        start = data.rfind('<', 0, idx)
        end = data.find('>', idx)
        print('--- v:textbox', i+1, 'context:', data[start:end+1].replace('\n',' '))
        idx = end + 1
    # show shape-type declarations
    for m in re.finditer(r'<v:shapetype[^>]*>', data, re.S):
        print('shapetype', m.group(0)[:200].replace('\n',' '))
    # show all shape ids/names within document
    for m in re.finditer(r'<v:shape[^>]*>', data, re.S):
        print('shape', m.group(0)[:300].replace('\n',' '))
