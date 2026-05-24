import json

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\public\questions.json", "r", encoding="utf-8") as f:
    data = json.load(f)

kangxi_chars = {}
for q in data.get("questions", []):
    for field in [q.get("stem", "")] + [o.get("text", "") for o in q.get("options", [])]:
        for char in field:
            if '\u2f00' <= char <= '\u2fdf':
                kangxi_chars[char] = kangxi_chars.get(char, 0) + 1

# Standard equivalents mapping
mapping_names = {
    '\u2f26': '二',
    '\u2f96': '行',
    '\u2f18': '入',
    '\u2f3b': '比',
    '\u2f8e': '非',
    '\u2f64': '目',
    '\u2f49': '支',
    '\u2f08': '人',
    '\u2f4c': '无',
    '\u2f8f': '齿',
    '\u2f7c': '言',
    '\u2f28': '入',
    '\u2f2f': '口',
    '\u2f5b': '片',
    '\u2f9d': '里',
    '\u2f1e': '又',
    '\u2f61': '氏',
    '\u2f66': '矢',
    '\u2f8c': '隶',
    '\u2f73': '网',
    '\u2f52': '木',
}

with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\scratch\kangxi_report.txt", "w", encoding="utf-8") as out:
    out.write("Kangxi Radicals found:\n")
    for char, count in sorted(kangxi_chars.items(), key=lambda x: x[1], reverse=True):
        std_char = mapping_names.get(char, "UNKNOWN")
        out.write(f"Char: {repr(char)} (\\u{ord(char):04x}), Count: {count}, Standard: {std_char}\n")

print("Done. Wrote to scratch/kangxi_report.txt")
