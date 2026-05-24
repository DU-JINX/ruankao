import json

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\public\questions.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("Total questions:", len(data.get("questions", [])))

count = 0
for q in data.get("questions", []):
    stem = q.get("stem", "")
    if "森林" in stem or "叶子" in stem or "二叉树" in stem:
        print(f"ID: {q.get('id')} | Year: {q.get('year')} | Subject: {q.get('sources', [{}])[0].get('subject')} | Stem: {stem[:40]}")
        count += 1
        if count >= 30:
            break
