with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\src\styles.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "rawHtml" in line or "Image" in line or "image" in line or "Panel" in line:
        print(f"Line {i+1}: {line.strip()}")
