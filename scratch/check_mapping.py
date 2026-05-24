import json
import re

# Load questions.json to get actual subjects
with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\public\questions.json", "r", encoding="utf-8") as f:
    q_data = json.load(f)
actual_subjects = set()
for q in q_data.get("questions", []):
    sources = q.get("sources", [])
    if sources:
        actual_subjects.add(sources[0].get("subject"))

# Load main.jsx
with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\src\main.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find STUDY_PLAN_DATA weeks chapters
weeks_chapters = re.findall(r'chapter:\s*"([^"]+)"', content)

# Extract milestones chapters
milestones_match = re.search(r'milestones:\s*\[(.*?)(?:\]\s*\})', content, re.DOTALL)
milestone_chapters = []
if milestones_match:
    milestone_chapters = re.findall(r'"(第 #[^"]+)"', milestones_match.group(1))

# Extract mapConfigToSubject function body and its mapping
map_func_match = re.search(r'function mapConfigToSubject\(configName\)\s*\{(.*?)\}', content, re.DOTALL)
mapping = {}
if map_func_match:
    map_func_body = map_func_match.group(1)
    mapping_match = re.search(r'const mapping = \{(.*?)\};', map_func_body, re.DOTALL)
    if mapping_match:
        for line in mapping_match.group(1).split("\n"):
            line = line.strip()
            if ":" in line:
                parts = line.split(":")
                key = parts[0].strip().strip('"').strip("'")
                val = parts[1].strip().strip(',').strip('"').strip("'")
                mapping[key] = val

all_chapters = sorted(set(weeks_chapters + milestone_chapters))

output_lines = []
output_lines.append("Chapters in STUDY_PLAN_DATA:")
for c in sorted(set(weeks_chapters)):
    output_lines.append(f"  {repr(c)}")

output_lines.append("\nChapters in Milestones:")
for c in sorted(set(milestone_chapters)):
    output_lines.append(f"  {repr(c)}")

output_lines.append("\nmapConfigToSubject Mapping:")
for key, val in sorted(mapping.items()):
    output_lines.append(f"  {repr(key)} -> {repr(val)}")

output_lines.append("\nValidation:")
for c in all_chapters:
    if c == "all":
        continue
    mapped = mapping.get(c.strip())
    if not mapped:
        output_lines.append(f"ERR: Chapter {repr(c)} is NOT found in mapping keys!")
    elif mapped not in actual_subjects:
        output_lines.append(f"ERR: Chapter {repr(c)} maps to {repr(mapped)} which is NOT in questions.json subjects!")
    else:
        output_lines.append(f"OK: Chapter {repr(c)} maps to {repr(mapped)} (valid)")

# Write validation results to a text file in UTF-8
with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\scratch\mapping_report.txt", "w", encoding="utf-8") as out:
    out.write("\n".join(output_lines))

print("Completed checking. Report written to scratch/mapping_report.txt")
