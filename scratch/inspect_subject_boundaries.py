import json
import re
from pathlib import Path
from collections import defaultdict

app_dir = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app")
json_path = app_dir / "public" / "questions.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

questions = data.get("questions", [])

# Let's collect old questions that belong to "#X" chapters and see what their blank numbers are
subject_blanks = defaultdict(list)
for q in questions:
    subject = q.get("sources", [{}])[0].get("subject", "")
    blank = q.get("blank", "")
    if "#" in subject and blank.isdigit():
        subject_blanks[subject].append(int(blank))

# Print statistics for each subject
print("Subject boundaries in old questions:")
for sub in sorted(subject_blanks.keys(), key=lambda s: int(re.search(r'#(\d+)', s).group(1)) if re.search(r'#(\d+)', s) else 0):
    blanks = sorted(subject_blanks[sub])
    if blanks:
        print(f" - {sub}: min={blanks[0]}, max={blanks[-1]}, count={len(blanks)}")
