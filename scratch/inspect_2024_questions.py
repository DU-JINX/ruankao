import json

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\public\questions.json", "r", encoding="utf-8") as f:
    data = json.load(f)

lines = []
for q in data.get("questions", []):
    if q.get("year") == "2024" or "2024" in q.get("years", []):
        subject = "None"
        sources = q.get("sources", [])
        if sources:
            subject = sources[0].get("subject")
        lines.append(f"ID: {q.get('id')} | Subject: {subject} | Stem: {q.get('stem')}")

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\scratch\report_2024.txt", "w", encoding="utf-8") as out:
    out.write("\n".join(lines))

print("Done. Wrote to report_2024.txt")
