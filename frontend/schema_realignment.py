import re

file_path = r'c:\Users\saivi\Desktop\sentinel-aurora\frontend\src\App.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Realignment: Schema Alignment with Engine v2.2
content = content.replace('post.audit.l1_vader', 'post.audit.l1_vader_baseline')
content = content.replace('post.audit.l2_roberta', 'post.audit.l2_roberta_pulse')
content = content.replace('post.audit.l3_ollama', 'post.audit.l3_ollama_audit')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
