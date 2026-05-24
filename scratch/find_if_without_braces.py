import re

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\src\main.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Match "if (...)" without "{"
    # Simple regex to check for if
    match = re.search(r'\bif\s*\(.*?\)', line)
    if match:
        # Check if the line contains '{' or if the next line contains '{'
        has_brace = '{' in line
        if not has_brace and i + 1 < len(lines):
            has_brace = '{' in lines[i+1]
        if not has_brace:
            print(f"Line {i+1}: {line.strip()}")
