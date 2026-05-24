import json

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\public\questions.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for q in data.get("questions", []):
    years = q.get("years", [])
    if any(y in years for y in ["2022", "2023", "2024"]):
        continue
    stem = q.get("stem", "")
    if "I/O控制" in stem or "I/O 控制" in stem or "输入输出方式" in stem or "DMA" in stem:
        sub = q.get("sources", [{}])[0].get("subject")
        print(f"Old Q: {stem[:45]} -> Subject: {sub}")
