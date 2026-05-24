import json

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\public\questions.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for q in data.get("questions", []):
    if q.get("id") == "57b3c1171696ce01":
        with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\scratch\q30_out.txt", "w", encoding="utf-8") as out:
            out.write("Stem: " + q.get("stem") + "\n")
            out.write("Options: " + str([o.get("text") for o in q.get("options", [])]) + "\n")
            out.write("RawHtml: " + str(q.get("rawHtml")) + "\n")

print("Done")
