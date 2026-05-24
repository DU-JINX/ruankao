with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\src\main.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "filter" in line or "filtered" in line or "subject" in line or "setSubject" in line:
        if len(line.strip()) < 120:
            print(f"Line {i+1}: {line.strip()}")
