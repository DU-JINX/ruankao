import json
import unicodedata
from pathlib import Path

app_dir = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app")
json_path = app_dir / "public" / "questions.json"

# Load the keywords_map from reclassify_by_keywords.py
# (Omitted here for brevity, let's copy the code logic)
from normalize_and_reclassify_db import keywords_map, classify

with open(json_path, "r", encoding="utf-8") as f:
    db = json.load(f)

questions = db.get("questions", [])
zero_score_questions = []

for q in questions:
    years = q.get("years", [])
    is_new_year = any(y in years for y in ["2022", "2023", "2024"])
    if not is_new_year:
        continue
    
    # Calculate scores manually to see if all are 0
    texts = [q.get("stem", "")] + [o.get("text", "") for o in q.get("options", [])] + q.get("rawHtml", [])
    combined = " ".join(texts).lower()
    
    scores = {}
    for subject, kws in keywords_map.items():
        score = 0
        for kw in kws:
            if kw.lower() in combined:
                score += len(kw)
        scores[subject] = score
        
    if max(scores.values()) == 0:
        zero_score_questions.append(q)

print("Number of zero-score questions:", len(zero_score_questions))
with open(app_dir / "scratch" / "zero_scores.txt", "w", encoding="utf-8") as zf:
    for q in zero_score_questions:
        zf.write(f"Year: {q.get('year')} | Blank: {q.get('blank')} | Stem: {q.get('stem')}\n")
