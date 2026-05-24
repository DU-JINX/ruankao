import json
from pathlib import Path

app_dir = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app")
json_path = app_dir / "public" / "questions.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

questions = data.get("questions", [])

subjects = set()
for q in questions:
    if q.get("sources"):
        subjects.add(q["sources"][0].get("subject", ""))

print("Unicode Hex of subjects:")
for sub in sorted(subjects):
    hex_str = " ".join(f"{ord(c):04X}" for c in sub)
    print(f"Sub: {repr(sub)}")
    print(f"Hex: {hex_str}\n")
