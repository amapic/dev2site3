import zipfile, pathlib, re

path = pathlib.Path(r'C:\Users\amo\Documents\recehrce emploi\MES\cv_Amaury_PICHAT_MES.docx')
with zipfile.ZipFile(path, 'r') as z:
    data = z.read('word/document.xml').decode('utf-8', 'ignore')
    start = data.find('id="_x0000_s1033"')
    if start == -1:
        print('not found')
    else:
        rect_start = data.rfind('<v:rect', 0, start)
        rect_end = data.find('</v:rect>', start)
        if rect_end != -1:
            rect_end = rect_end + len('</v:rect>')
            print('before:', data[max(0, rect_start-200):rect_start].replace('\n',' '))
            print('removed block:')
            print(data[rect_start:rect_end])
            print('after:', data[rect_end:rect_end+200].replace('\n',' '))
        else:
            print('no closing rect found')
