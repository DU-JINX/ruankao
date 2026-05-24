import os
import tarfile
from pathlib import Path

ROOT = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)")
APP_DIR = ROOT / "ruankao-quiz-app"
PUBLIC_DIR = APP_DIR / "public"
IMG_DIR = PUBLIC_DIR / "docx_images"
tar_path = APP_DIR / "new_assets.tar.gz"

print("Packaging new assets (questions.json + 40 PDF page images)...")

files_to_add = [
    ("public/questions.json", "public/questions.json")
]

# Add the 40 new PNG images
new_hashes = ["de93006782ecd4d5", "b62b4eb6711bce4f", "58ea51ec031202b8"]
for h in new_hashes:
    for png in IMG_DIR.glob(f"{h}_page_*.png"):
        rel_path = png.relative_to(PUBLIC_DIR.parent)
        files_to_add.append((str(rel_path), str(rel_path)))

print(f"Total files to package: {len(files_to_add)}")

with tarfile.open(tar_path, "w:gz") as tar:
    for local_rel, arcname in files_to_add:
        full_path = APP_DIR / local_rel
        if full_path.exists():
            tar.add(full_path, arcname=arcname)
        else:
            print(f"Warning: {local_rel} does not exist!")

print(f"Archive completed successfully.")
print(f"Tarball path: {tar_path}")
print(f"File size: {tar_path.stat().st_size / (1024 * 1024):.2f} MB")
