with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\src\main.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "STUDY_PLAN_DATA" in line or "handleJump" in line or "mapConfigToSubject" in line or "刷题" in line or "jump" in line or "WeeklyTimelineCard" in line:
        print(f"Line {i+1}: {line.strip()}")
