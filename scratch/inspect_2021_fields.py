import json
from pathlib import Path

app_dir = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app")
json_path = app_dir / "public" / "questions.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Find questions from 2021
questions_2021 = [q for q in data.get("questions", []) if "2021" in q.get("years", [])]

print(f"Total 2021 questions: {len(questions_2021)}")
if questions_2021:
    q = questions_2021[0]
    print(f"Sample 2021 question:")
    print(f"ID: {q.get('id')}")
    print(f"Stem: {q.get('stem')[:100]}...")
    print(f"page_images: {q.get('page_images')}")
    print(f"pages: {q.get('pages')}")
    print(f"total_pages: {q.get('total_pages')}")
    print(f"rawHtml: {q.get('rawHtml') is not None}")
