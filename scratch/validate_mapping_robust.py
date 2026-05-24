import json

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\public\questions.json", "r", encoding="utf-8") as f:
    q_data = json.load(f)
actual_subjects = set()
for q in q_data.get("questions", []):
    sources = q.get("sources", [])
    if sources:
        actual_subjects.add(sources[0].get("subject"))

mapping = {
    "第 #1 章 计算机系统题目": "上午题 #1 计算机系统题目",
    "第 #10 章 计算机系统题目": "上午题 #10 操作系统题目",
    "第 #2 章 程序语言题目": "上午题 #2 程序设计语言题目",
    "第 #3、4 章 数据结构与算法题目": "上午题 #3、4 数据结构 上、下 题目",
    "第 #5 章 知识产权与标准化题目": "上午题 #5 知识产权题目",
    "第 #6 章 数据库题目": "上午题 #6 数据库题目",
    "第 #7 章 面向对象与设计模式题目": "上午题 #7 面向对象题目",
    "第 #8 章 UML题目": "上午题 #8 UML题目",
    "第 #9 章 设计模式题目": "上午题 #9 设计模式题目",
    "第 #10 章 操作系统题目": "上午题 #10 操作系统题目",
    "第 #11 章 编译原理题目": "上午题 #2 程序设计语言题目",
    "第 #15 章 软件工程题目": "上午题 #12、13 软件工程 上、下 题目",
    "第 #12、13 章 网络与多媒体题目": "上午题 #15 计算机网络题目",
    "第 #14 章 信息安全题目": "上午题 #14 信息安全题目",
    "all": "all"
}

# Avoid non-ASCII prints to terminal to prevent encoding crashes
print("Actual subjects in questions.json (hex representations):")
for s in sorted(actual_subjects):
    print("  ", s.encode('raw_unicode_escape').decode('ascii'))

print("\nValidating mapping:")
for key, val in mapping.items():
    if val == "all":
        continue
    k_str = key.encode('raw_unicode_escape').decode('ascii')
    v_str = val.encode('raw_unicode_escape').decode('ascii')
    if val in actual_subjects:
        print("[OK] ", k_str, " -> ", v_str)
    else:
        print("[ERR]", k_str, " -> ", v_str, " (NOT FOUND)")
