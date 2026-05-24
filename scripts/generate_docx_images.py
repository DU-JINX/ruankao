import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path
import fitz
import win32com.client

APP_DIR = Path(__file__).resolve().parents[1]
ROOT = APP_DIR.parent
DATA_DIR = APP_DIR / "data"
PUBLIC_DIR = APP_DIR / "public"
IMG_DIR = PUBLIC_DIR / "docx_images"
DB_PATH = PUBLIC_DIR / "questions.json"
CACHE_PATH = DATA_DIR / "docx_text_cache.json"
TEMP_PDF_DIR = DATA_DIR / "temp_pdf"

# Ensure directories exist
IMG_DIR.mkdir(parents=True, exist_ok=True)
TEMP_PDF_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_hash(rel_path):
    return hashlib.md5(str(rel_path).encode("utf-8")).hexdigest()[:16]


def clean_text(text):
    return re.sub(r"[\s\u3000\uff08\uff09()（）]", "", text)


def main():
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}. Run extract_questions.py first!")
        return

    with open(DB_PATH, "r", encoding="utf-8") as f:
        db = json.load(f)

    questions = db.get("questions", [])
    unique_files = {}
    for q in questions:
        for src in q.get("sources", []):
            rel_file = src.get("file")
            if rel_file and rel_file not in unique_files:
                unique_files[rel_file] = ROOT / rel_file

    print(f"Total questions: {len(questions)}")
    print(f"Unique docx files: {len(unique_files)}")

    # Load text cache if exists
    cache = {}
    if CACHE_PATH.exists():
        try:
            with open(CACHE_PATH, "r", encoding="utf-8") as f:
                cache = json.load(f)
            print(f"Loaded text cache with {len(cache)} files.")
        except Exception as e:
            print(f"Error loading cache: {e}")

    # Initialize Word
    print("Initializing Word COM Application...")
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False

    # Filter files that need processing
    to_process = []
    for rel_file, full_path in unique_files.items():
        h = get_hash(rel_file)
        first_page = IMG_DIR / f"{h}_page_1.png"
        has_cache = h in cache
        has_images = first_page.exists()
        if not has_cache or not has_images:
            to_process.append((rel_file, full_path, h))

    print(f"Need to render/cache {len(to_process)} docx files.")

    # Batch process
    start_time = time.time()
    success_count = 0
    error_count = 0

    for idx, (rel_file, full_path, h) in enumerate(to_process):
        print(f"[{idx+1}/{len(to_process)}] Processing: {rel_file} (hash: {h})")
        temp_pdf = TEMP_PDF_DIR / f"{h}.pdf"

        # 1. Convert to PDF
        try:
            doc = word.Documents.Open(str(full_path))
            doc.SaveAs(str(temp_pdf), FileFormat=17)  # wdFormatPDF
            doc.Close()
        except Exception as e:
            print(f"Error converting to PDF {rel_file}: {e}")
            error_count += 1
            continue

        # 2. Render to PNG and Extract Text
        try:
            pdf_doc = fitz.open(temp_pdf)
            pages_text = []
            matrix = fitz.Matrix(2.0, 2.0)  # 144 DPI for readability
            for page_idx, page in enumerate(pdf_doc):
                # Render PNG
                png_name = f"{h}_page_{page_idx + 1}.png"
                png_path = IMG_DIR / png_name
                if not png_path.exists():
                    pix = page.get_pixmap(matrix=matrix)
                    pix.save(str(png_path))

                # Extract text
                pages_text.append(page.get_text("text"))

            pdf_doc.close()

            # Cache text
            cache[h] = pages_text
            success_count += 1
        except Exception as e:
            print(f"Error rendering PDF {temp_pdf}: {e}")
            error_count += 1
        finally:
            # Clean temp PDF
            if temp_pdf.exists():
                try:
                    os.remove(temp_pdf)
                except:
                    pass

        # Periodically save cache in case of interruption
        if idx % 10 == 0:
            with open(CACHE_PATH, "w", encoding="utf-8") as f:
                json.dump(cache, f, ensure_ascii=False, indent=2)

    # Save cache final
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    print(f"Finished batch rendering. Success: {success_count}, Error: {error_count}.")
    print(f"Time elapsed: {time.time() - start_time:.2f}s")

    try:
        word.Quit()
    except:
        pass

    # Now map questions to page images
    print("Mapping questions to page images...")
    mapped_count = 0
    for q in questions:
        q_src = q.get("sources", [{}])[0]
        rel_file = q_src.get("file")
        if not rel_file:
            continue

        h = get_hash(rel_file)
        pages_text = cache.get(h, [])
        if not pages_text:
            continue

        # Match stem
        stem = q.get("stem", "")
        options = [o.get("text", "") for o in q.get("options", [])]
        clean_stem = clean_text(stem)

        matching_pages = []
        if clean_stem:
            prefix = clean_stem[:25]
            for page_idx, p_text in enumerate(pages_text):
                clean_p_text = clean_text(p_text)
                if prefix in clean_p_text:
                    matching_pages.append(page_idx + 1)

        # Fallback to option-based matching if no match
        if not matching_pages and options:
            for page_idx, p_text in enumerate(pages_text):
                clean_p_text = clean_text(p_text)
                matches_opts = 0
                for opt in options:
                    clean_opt = clean_text(opt)
                    if clean_opt and len(clean_opt) >= 4 and clean_opt in clean_p_text:
                        matches_opts += 1
                if matches_opts >= 2:
                    matching_pages.append(page_idx + 1)

        # Fallback to page 1
        if not matching_pages:
            matching_pages = [1]

        # Save to question object
        q["page_images"] = [f"{h}_page_{p}.png" for p in matching_pages]
        # Keep absolute page number list for reference
        q["pages"] = matching_pages
        # Also save the total page count for file
        q["total_pages"] = len(pages_text)
        mapped_count += 1

    # Save database
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    print(f"Successfully mapped {mapped_count} questions.")


if __name__ == "__main__":
    main()
