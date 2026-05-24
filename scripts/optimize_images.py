import json
import os
from pathlib import Path
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

APP_DIR = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app")
PUBLIC_DIR = APP_DIR / "public"
IMG_DIR = PUBLIC_DIR / "docx_images"
DB_PATH = PUBLIC_DIR / "questions.json"

if not DB_PATH.exists():
    print(f"Database not found at {DB_PATH}")
    sys.exit(1)

with open(DB_PATH, "r", encoding="utf-8") as f:
    db = json.load(f)

questions = db.get("questions", [])
print(f"Total questions to update: {len(questions)}")

# Convert all PNG files in docx_images to JPG (75% size, quality=75)
png_files = list(IMG_DIR.glob("*.png"))
print(f"Found {len(png_files)} PNG files to optimize.")

start_time = os.times().elapsed
optimized_count = 0
error_count = 0

for idx, png_path in enumerate(png_files):
    if png_path.name == "test_page_1.png":
        # Skip test file or delete it
        try:
            png_path.unlink()
        except:
            pass
        continue
        
    jpg_path = png_path.with_suffix(".jpg")
    
    # Only convert if jpg doesn't exist yet
    if not jpg_path.exists():
        try:
            img = Image.open(png_path)
            w, h = img.size
            # Resize to 75% of original (144 DPI -> ~108 DPI)
            new_size = (int(w * 0.75), int(h * 0.75))
            img_resized = img.resize(new_size, Image.Resampling.LANCZOS)
            img_resized.convert("RGB").save(jpg_path, "JPEG", quality=75)
            optimized_count += 1
        except Exception as e:
            print(f"Error optimizing {png_path.name}: {e}")
            error_count += 1
            continue
            
    # Delete original PNG
    try:
        png_path.unlink()
    except Exception as e:
        print(f"Failed to delete {png_path.name}: {e}")

print(f"Image optimization completed in {os.times().elapsed - start_time:.2f}s.")
print(f"Optimized: {optimized_count}, Errors: {error_count}")

# Update references in questions.json
updated_count = 0
for q in questions:
    if "page_images" in q:
        new_images = []
        for img_name in q["page_images"]:
            if img_name.endswith(".png"):
                new_images.append(img_name.replace(".png", ".jpg"))
            else:
                new_images.append(img_name)
        q["page_images"] = new_images
        updated_count += 1

with open(DB_PATH, "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"Updated references for {updated_count} questions in questions.json.")
