import json
from pathlib import Path
from collections import defaultdict

app_dir = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app")
json_path = app_dir / "public" / "questions.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

questions = data.get("questions", [])

# Map blank number (1-75) -> subject -> count
blank_subject_counts = defaultdict(lambda: defaultdict(int))

for q in questions:
    years = q.get("years", [])
    # Exclude 2022-2024 since they are generically mapped to "综合知识"
    if any(y in years for y in ["2022", "2023", "2024"]):
        continue
    blank = q.get("blank", "")
    if blank.isdigit():
        subject = q.get("sources", [{}])[0].get("subject", "")
        if "#" in subject:
            blank_subject_counts[int(blank)][subject] += 1

# For each blank number, find the dominant subject
mapping = {}
for b in sorted(blank_subject_counts.keys()):
    counts = blank_subject_counts[b]
    dominant_subject = max(counts, key=counts.get)
    print(f"Q{b}: {dominant_subject} ({counts[dominant_subject]} occurrences, distribution: {dict(counts)})")
    mapping[b] = dominant_subject
