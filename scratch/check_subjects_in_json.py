import json

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\public\questions.json", "r", encoding="utf-8") as f:
    data = json.load(f)

questions = data.get("questions", [])
subjects = set()
for q in questions:
    sources = q.get("sources", [])
    if sources:
        subjects.add(sources[0].get("subject"))
    else:
        subjects.add("None")

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\scratch\subjects.txt", "w", encoding="utf-8") as out:
    out.write("Subjects in questions.json:\n")
    for sub in sorted(subjects):
        out.write(f"{repr(sub)}\n")
