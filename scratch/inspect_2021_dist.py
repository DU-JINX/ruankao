import json
from pathlib import Path

app_dir = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app")
json_path = app_dir / "public" / "questions.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

questions = data.get("questions", [])

# Find all 2021 morning exam questions and sort them by blank number
q_2021 = []
for q in questions:
    if "2021" in q.get("years", []) and q.get("blank", "").isdigit():
        q_2021.append(q)

q_2021.sort(key=lambda x: int(x["blank"]))

print("2021 Morning Exam Question Distribution:")
for q in q_2021:
    subject = q.get("sources", [{}])[0].get("subject", "")
    print(f"Q{q['blank']}: {subject}")
