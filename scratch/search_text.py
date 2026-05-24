import os

root_dir = r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)"
for dirpath, dirnames, filenames in os.walk(root_dir):
    if "node_modules" in dirpath or ".git" in dirpath:
        continue
    for filename in filenames:
        if filename.endswith((".js", ".jsx", ".html", ".css", ".json")):
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                if "原反补移" in content:
                    print(f"Found in {filepath}")
            except Exception:
                pass
