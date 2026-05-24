import json
import hashlib
import re
from pathlib import Path
import fitz

ROOT = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)")
APP_DIR = ROOT / "ruankao-quiz-app"
IMG_DIR = APP_DIR / "public" / "docx_images"
DB_PATH = APP_DIR / "public" / "questions.json"

IMG_DIR.mkdir(parents=True, exist_ok=True)

# Map relative paths in database to actual PDF files in local filesystem
PDF_MAPPING = {
    "历年真题/2022年/2022年上午试卷.pdf": ROOT / "希赛李阿妹" / "03 2009-2024年真题及答案解析" / "2009-2023年真题答案解析" / "2022年11月软件设计师上午真题及答案解析---闲鱼卖家云晨之行.pdf",
    "历年真题/2023年/2023年上午试卷.pdf": ROOT / "希赛李阿妹" / "03 2009-2024年真题及答案解析" / "2009-2023年真题（官方卷）" / "2023年上半年上午试卷.pdf",
    "历年真题/2024年/2024年上午试卷.pdf": ROOT / "其他资料" / "02.历年真题+解析" / "2020-2024年真题＋解析" / "2024年上半年软件设计师上午真题及答案.pdf"
}

def get_hash(rel_path):
    return hashlib.md5(str(rel_path).encode("utf-8")).hexdigest()[:16]

def clean_text(text):
    return re.sub(r"[\s\u3000\uff08\uff09()（）]", "", text)

def main():
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        return

    with open(DB_PATH, "r", encoding="utf-8") as f:
        db = json.load(f)

    questions = db.get("questions", [])
    
    # 1. Render all candidate PDF files to images and extract text
    pdf_text_cache = {}
    
    print("=== Step 1: Rendering PDF Pages ===")
    for rel_file, full_path in PDF_MAPPING.items():
        if not full_path.exists():
            print(f"Error: PDF not found at {full_path}")
            continue
            
        h = get_hash(rel_file)
        print(f"Processing PDF: {rel_file} -> {full_path.name} (hash: {h})")
        
        try:
            pdf_doc = fitz.open(str(full_path))
            pages_text = []
            matrix = fitz.Matrix(2.0, 2.0) # 144 DPI for readability
            
            for page_idx in range(len(pdf_doc)):
                page = pdf_doc[page_idx]
                png_name = f"{h}_page_{page_idx + 1}.png"
                png_path = IMG_DIR / png_name
                
                # Render to PNG if not exists
                if not png_path.exists():
                    pix = page.get_pixmap(matrix=matrix)
                    pix.save(str(png_path))
                    print(f"  Rendered page {page_idx + 1}")
                
                pages_text.append(page.get_text("text"))
                
            pdf_doc.close()
            pdf_text_cache[h] = pages_text
            print(f"Successfully processed {rel_file}: {len(pages_text)} pages rendered.")
        except Exception as e:
            print(f"Error processing PDF {rel_file}: {e}")

    # 2. Map questions to page images
    print("\n=== Step 2: Mapping Questions to Page Images ===")
    mapped_count = 0
    
    for q in questions:
        # Check if question is from 2022, 2023, 2024
        years = q.get("years", [])
        is_new_year = any(y in years for y in ["2022", "2023", "2024"])
        if not is_new_year:
            continue
            
        q_src = q.get("sources", [{}])[0]
        rel_file = q_src.get("file")
        if not rel_file:
            continue
            
        h = get_hash(rel_file)
        pages_text = pdf_text_cache.get(h, [])
        if not pages_text:
            continue
            
        # Clean stem and find match
        stem = q.get("stem", "")
        options = [o.get("text", "") for o in q.get("options", [])]
        clean_stem = clean_text(stem)
        
        # Remove trailing (Year真题) suffix for text matching
        clean_stem_match = re.sub(r"\d{4}\u5e74\u771f\u9898", "", clean_stem)
        
        matching_pages = []
        if clean_stem_match:
            prefix = clean_stem_match[:15] # shorter prefix is safer
            for page_idx, p_text in enumerate(pages_text):
                clean_p_text = clean_text(p_text)
                if prefix in clean_p_text:
                    matching_pages.append(page_idx + 1)
                    
        # Fallback to option matching
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
                    
        # Fallback to standard index mapping if still not found
        if not matching_pages:
            blank = q.get("blank", "1")
            try:
                # Approximate page based on question index (approx. 5 questions per page)
                blank_val = int(blank)
                approx_page = min(len(pages_text), max(1, int(blank_val / 5) + 1))
                matching_pages = [approx_page]
            except:
                matching_pages = [1]
                
        # Save to question object
        q["page_images"] = [f"{h}_page_{p}.png" for p in matching_pages]
        q["pages"] = matching_pages
        q["total_pages"] = len(pages_text)
        
        # Highlighted HTML fallback in questions
        if not q.get("rawHtml"):
            q["rawHtml"] = [stem] + [f"{o['key']}. {o['text']}" for o in q.get("options", [])]
            
        mapped_count += 1

    # 3. Save database
    print(f"\n=== Step 3: Saving Updated questions.json ===")
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully mapped {mapped_count} new questions.")

if __name__ == "__main__":
    main()
