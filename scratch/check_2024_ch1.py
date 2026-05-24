import json

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\public\questions.json", "r", encoding="utf-8") as f:
    q_data = json.load(f)

count = 0
for q in q_data.get("questions", []):
    sources = q.get("sources", [])
    if sources and sources[0].get("subject") == "上午题 #1 计算机系统题目":
        if "2024" in q.get("years", []):
            count += 1

print(f"Number of 2024 questions in '上午题 #1 计算机系统题目': {count}")
