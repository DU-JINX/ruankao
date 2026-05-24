with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\scratch\normalized_reclassification_report.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_2024 = [line.strip() for line in lines if "Year: 2024" in line]

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\scratch\report_2024_new.txt", "w", encoding="utf-8") as out:
    out.write("\n".join(new_2024))

print("Done. Wrote to scratch/report_2024_new.txt")
