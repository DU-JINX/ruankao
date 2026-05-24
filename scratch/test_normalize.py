import unicodedata

kangxi_chars = ['\u2f64', '\u2f00', '\u2f06', '\u2f8f', '\u2f26', '\u2fae', '\u2f42']
with open(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app\scratch\normalize_out.txt", "w", encoding="utf-8") as out:
    for char in kangxi_chars:
        norm = unicodedata.normalize('NFKC', char)
        out.write(f"Char: {repr(char)} -> Normalized: {repr(norm)}\n")
print("Done. Wrote to scratch/normalize_out.txt")
