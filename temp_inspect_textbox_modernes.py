import zipfile, pathlib, re

path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\mon_document_clean5.docx')
with zipfile.ZipFile(path, 'r') as z:
    data = z.read('word/document.xml').decode('utf-8', 'ignore')
    shapes = re.findall(r'<v:(?:shape|rect)[^>]*>', data)
    print('shape count', len(shapes))
    for i, shape in enumerate(shapes, 1):
        if 'textbox' in shape.lower() or 'text-box' in shape.lower() or 'id="_x0000_s' in shape or 'id="Rectangle' in shape or 'name="Rectangle' in shape or 'type="_x0000_t' in shape:
            print('--- shape', i)
            print(shape)
    print('--- full names')
    for m in re.finditer(r'name="([^"]+)"', data):
        name = m.group(1)
        if 'TextBox' in name or 'Textbox' in name or 'text' in name.lower() or 'Rectangle' in name:
            print(name)
