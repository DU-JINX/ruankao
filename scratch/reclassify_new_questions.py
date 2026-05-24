import json
from pathlib import Path
from collections import Counter

app_dir = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app")
json_path = app_dir / "public" / "questions.json"

def get_subject_by_blank(blank_str):
    if not blank_str or not blank_str.isdigit():
        return "综合知识"
    b = int(blank_str)
    if 1 <= b <= 6:
        return "上午题 #1 计算机系统题目"
    elif 7 <= b <= 9:
        return "上午题 #14 信息安全题目"
    elif 10 <= b <= 14:
        return "上午题 #5 知识产权题目"
    elif 15 <= b <= 16:
        return "上午题 #11 结构化开发题目"
    elif 17 <= b <= 19:
        return "上午题 #12、13 软件工程 上、下 题目"
    elif 20 <= b <= 22:
        return "上午题 #2 程序设计语言题目"
    elif 23 <= b <= 28:
        return "上午题 #10 操作系统题目"
    elif 29 <= b <= 36:
        return "上午题 #12、13 软件工程 上、下 题目"
    elif 37 <= b <= 39:
        return "上午题 #7 面向对象题目"
    elif 40 <= b <= 43:
        return "上午题 #8 UML题目"
    elif 44 <= b <= 47:
        return "上午题 #9 设计模式题目"
    elif 48 <= b <= 50:
        return "上午题 #2 程序设计语言题目"
    elif 51 <= b <= 56:
        return "上午题 #6 数据库题目"
    elif 57 <= b <= 62:
        return "上午题 #3、4 数据结构 上、下 题目"
    elif 63 <= b <= 65:
        return "上午题 #16 算法题目"
    elif 66 <= b <= 75:
        return "上午题 #15 计算机网络题目"
    return "综合知识"

def main():
    if not json_path.exists():
        print(f"Database not found at {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        db = json.load(f)

    questions = db.get("questions", [])
    mapped_count = 0

    print("Reclassifying 2022-2024 questions...")
    for q in questions:
        years = q.get("years", [])
        is_new_year = any(y in years for y in ["2022", "2023", "2024"])
        if not is_new_year:
            continue
            
        blank = q.get("blank", "")
        new_subject = get_subject_by_blank(blank)
        
        # Update in sources
        if q.get("sources"):
            old_subject = q["sources"][0].get("subject", "")
            if old_subject != new_subject:
                q["sources"][0]["subject"] = new_subject
                mapped_count += 1

    print(f"Updated subjects for {mapped_count} questions.")

    # Re-calculate metadata statistics
    by_subject = Counter(q["sources"][0]["subject"] for q in questions if q.get("sources"))
    by_chapter = Counter(q["sources"][0]["chapter"] for q in questions if q.get("sources"))
    by_year = Counter(year for q in questions for year in q.get("years", []))
    
    db["meta"]["subjects"] = by_subject
    db["meta"]["chapters"] = by_chapter
    db["meta"]["years"] = dict(sorted(by_year.items(), reverse=True))

    # Save database
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    print("Database metadata successfully updated and saved.")

if __name__ == "__main__":
    main()
