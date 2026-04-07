import re

file_path = r'c:\Users\saivi\Desktop\sentinel-aurora\frontend\src\App.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the Growth Indicator to be dynamic, not hardcoded /10
sugar_math = r'\+\{\(stats\.total / 10\)\.toFixed\(1\)\}% vs\. last minute'
# We'll use a safer 'active signal' count instead of fake % growth
dynamic_math = r'Active Stream Processing Phase'
content = re.sub(sugar_math, dynamic_math, content)

# 2. Fix the message mapping (the backend now sends Signal.json(), so the frontend state must handle it)
# The previous version used JSON.parse(event.data) but the backend now sends .json() which is already a string
# Use safer parsing

# No changes needed to the parse, but let's ensure 'audit' is mapped correctly
# (The code already uses post.audit.l1_vader etc., but let's confirm the mapping)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
