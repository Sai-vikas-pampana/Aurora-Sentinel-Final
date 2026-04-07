import re

file_path = r'c:\Users\saivi\Desktop\sentinel-aurora\frontend\src\App.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the malformed tag crash
# The previous search-replace hit the <ExternalLink /> tag instead of just the import.
content = content.replace('<ExternalLink, Trash2', '<ExternalLink')

# 2. Fix the Momentum Window logic (50 -> 15)
# Re-aligning the momentum logic to the kinetic 15-post window.
content = content.replace('posts.slice(0, 50)', 'posts.slice(0, 15)')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
logger_msg = "Frontend Syntax Hotfix & Momentum Realignment Applied."
print(logger_msg)
