import os
import zipfile
import xml.etree.ElementTree as ET
import json

def get_docx_text(path):
    document = zipfile.ZipFile(path)
    xml_content = document.read('word/document.xml')
    document.close()
    tree = ET.XML(xml_content)
    
    PARA_TAG = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'
    TEXT_TAG = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'
    
    paragraphs = []
    for paragraph in tree.iter(PARA_TAG):
        texts = [node.text for node in paragraph.iter(TEXT_TAG) if node.text]
        if texts:
            paragraphs.append(''.join(texts))
            
    return '\n'.join(paragraphs)

results = []
for filename in os.listdir('.'):
    if filename.endswith('.docx') and not filename.startswith('~$'):
        try:
            text = get_docx_text(filename)
            results.append({
                'filename': filename,
                'content': text
            })
        except Exception as e:
            print(f"Error reading {filename}: {e}")

with open('extracted_raw_problems.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("Extraction complete. Saved to extracted_raw_problems.json")
