import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from docx import Document


APP_DIR = Path(__file__).resolve().parents[1]
ROOT = APP_DIR.parent
OUT = APP_DIR / "public" / "questions.json"
JIE_XI = "\u89e3\u6790"
YEAR_PATTERN = re.compile(
    r"(?<!\d)((?:20[0-2]\d|19\d{2}))\u5e74"
    r"(?:\u4e0a\u534a\u5e74|\u4e0b\u534a\u5e74|\d{1,2}\u6708)?"
)
VALID_YEAR_START = 2009
VALID_YEAR_END = 2026


def normalize_text_and_marks(raw_text, raw_marks):
    """
    对文本和标记进行同步的空白字符规整和首尾去除
    """
    normalized_chars = []
    normalized_marks = []
    start_idx = 0
    while start_idx < len(raw_text) and (raw_text[start_idx].isspace() or raw_text[start_idx] == '\u3000'):
        start_idx += 1
    end_idx = len(raw_text) - 1
    while end_idx >= start_idx and (raw_text[end_idx].isspace() or raw_text[end_idx] == '\u3000'):
        end_idx -= 1
    in_whitespace = False
    for i in range(start_idx, end_idx + 1):
        char = raw_text[i]
        mark = raw_marks[i]
        if char.isspace() or char == '\u3000':
            if not in_whitespace:
                normalized_chars.append(' ')
                normalized_marks.append(mark)
                in_whitespace = True
        else:
            normalized_chars.append(char)
            normalized_marks.append(mark)
            in_whitespace = False
    return "".join(normalized_chars), normalized_marks


def runs_to_html(text, marks):
    """
    将带有样式标记的文本转为带有 mark 标签的 HTML 字符串
    """
    html_parts = []
    current_run = []
    current_mark = False
    for char, mark in zip(text, marks):
        if mark != current_mark:
            if current_run:
                run_text = "".join(current_run)
                if current_mark:
                    html_parts.append(f"<mark>{run_text}</mark>")
                else:
                    html_parts.append(run_text)
                current_run = []
            current_mark = mark
        current_run.append(char)
    if current_run:
        run_text = "".join(current_run)
        if current_mark:
            html_parts.append(f"<mark>{run_text}</mark>")
        else:
            html_parts.append(run_text)
    return "".join(html_parts)


def paragraph_runs(para):
    """
    获取段落文本和对应的样式标记
    """
    text = ""
    marks = []
    for run in para.runs:
        value = run.text or ""
        highlighted = run.font.highlight_color is not None
        color = None
        if run.font.color and run.font.color.rgb:
            color = str(run.font.color.rgb).upper()
        emphasized = highlighted or color in {"FF0000", "C00000", "E36C0A"}
        text += value
        marks.extend([emphasized] * len(value))
    norm_text, norm_marks = normalize_text_and_marks(text, marks)
    return {"text": norm_text, "marks": norm_marks}


def normalize_space(text):
    """
    清除多余空白字符
    """
    return re.sub(r"\s+", " ", text.replace("\u3000", " ")).strip()


def extract_years(text):
    years = []
    for match in YEAR_PATTERN.finditer(text or ""):
        year = int(match.group(1))
        if VALID_YEAR_START <= year <= VALID_YEAR_END:
            years.append(str(year))
    return sorted(set(years), reverse=True)


def clean_option(text):
    return normalize_space(text.strip(" \t\r\n:：;；"))


def is_option_line(text):
    value = text.strip()
    if re.match(r"^[\uff08(]\d+[\uff09)]\s*[ABCD]\s*[.．、]", value):
        return True
    return bool(re.match(r"^[ABCD]\s*[.．、]", value))


def looks_like_question(text):
    value = text.strip()
    if not value or is_option_line(value):
        return False
    if re.search(r"[\uff08(]\d+[\uff09)]", value):
        return len(value) >= 10
    return False


def parse_option_line(line):
    text = line["text"]
    marks = line["marks"]
    group = None
    lead = re.match(r"^\s*[\uff08(](\d+)[\uff09)]", text)
    if lead:
        group = lead.group(1)

    matches = list(re.finditer(r"(?<![A-Za-z])([ABCD])\s*[.．、]", text))
    if not matches:
        return None

    options = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        letter = match.group(1)
        option_text = clean_option(text[match.end() : end])
        if not option_text:
            continue
        highlighted = any(marks[start:end]) if marks else False
        options.append({"key": letter, "text": option_text, "marked": highlighted})
    return {"group": group, "options": options}


def source_meta(path):
    rel = path.relative_to(ROOT)
    parts = list(rel.parts)
    subject = ""
    chapter = ""
    topic = path.stem
    if "07 " in str(rel):
        for part in parts:
            if part.startswith("\u4e0a\u5348\u9898") or part.startswith("\u4e0b\u5348\u9898"):
                subject = part
                break
        chapter = parts[-2] if len(parts) >= 2 else ""
    return {
        "file": str(rel),
        "subject": subject or parts[0],
        "chapter": chapter,
        "topic": topic.replace(JIE_XI, "").replace("+", " ").strip(),
        "has_answer_style": JIE_XI in path.name,
    }


def finalize(items, current, meta):
    """
    将当前题目存入题库列表，并提取年份与解析
    """
    if not current:
        return
    if len(current["options"]) < 2:
        return
    answers = [option["key"] for option in current["options"] if option.get("marked")]
    if answers:
        current["answer"] = "".join(dict.fromkeys(answers))
    elif not current.get("answer"):
        current["answer"] = ""
    current["years"] = extract_years(current.get("stem", ""))
    current["year"] = current["years"][0] if len(current["years"]) == 1 else ""
    current["source"] = meta
    items.append(current)


def extract_from_docx(path):
    meta = source_meta(path)
    doc = Document(str(path))
    lines = [paragraph_runs(p) for p in doc.paragraphs]
    lines = [line for line in lines if line["text"]]

    items = []
    section = ""
    stem = ""
    current = None
    last_option = None
    raw_paras = []

    for line in lines:
        text = line["text"]
        p_html = runs_to_html(text, line["marks"])

        if looks_like_question(text):
            if current:
                current["rawHtml"] = list(raw_paras)
                finalize(items, current, meta)
            current = None
            last_option = None
            stem = text
            raw_paras = [p_html]
            continue

        raw_paras.append(p_html)
        parsed = parse_option_line(line) if is_option_line(text) else None
        if parsed and stem:
            if parsed["group"] and current and len(current["options"]) >= 2:
                current["rawHtml"] = list(raw_paras)
                finalize(items, current, meta)
                current = None
                last_option = None
            if current is None:
                current = {
                    "stem": stem,
                    "blank": parsed["group"] or "",
                    "section": section,
                    "options": [],
                    "explanation": "",
                }
            elif parsed["group"] and not current.get("blank"):
                current["blank"] = parsed["group"]
            for option in parsed["options"]:
                existing = next((o for o in current["options"] if o["key"] == option["key"]), None)
                if existing:
                    existing["text"] = clean_option(existing["text"] + " " + option["text"])
                    existing["marked"] = existing.get("marked") or option.get("marked")
                    last_option = existing
                else:
                    current["options"].append(option)
                    last_option = current["options"][-1]
            continue

        # 解析答案行，提取所有选择字符并去除空格等分隔符
        answer_match = re.match(r"^(?:\u7b54\u6848|[\u3010\[]\u7b54\u6848[\u3011\]])\s*[:：]?\s*([ABCD\s,，、/]+)", text)
        if answer_match and current:
            cleaned_ans = "".join(re.findall(r"[ABCD]", answer_match.group(1).upper()))
            if cleaned_ans:
                current["answer"] = cleaned_ans
            explanation = text[answer_match.end() :].strip(" ，,。")
            if explanation:
                current["explanation"] = explanation
            continue

        if current and last_option and len(current["options"]) < 4 and not looks_like_question(text):
            last_option["text"] = clean_option(last_option["text"] + " " + text)
            continue

        if current and current.get("answer") and not current.get("explanation"):
            current["explanation"] = text
            continue

        if len(text) <= 32 and not re.search(r"https?://|[\uff08(]\d+[\uff09)]", text):
            section = text

    if current:
        current["rawHtml"] = list(raw_paras)
    finalize(items, current, meta)
    return items


def fingerprint(item):
    key = item["stem"] + "\n" + "\n".join(f"{o['key']}.{o['text']}" for o in item["options"])
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:16]


def merge_items(items):
    merged = {}
    for item in items:
        item["options"] = sorted(item["options"], key=lambda x: x["key"])
        item["id"] = fingerprint(item)
        existing = merged.get(item["id"])
        if not existing:
            item["sources"] = [item.pop("source")]
            merged[item["id"]] = item
            continue
        source = item.pop("source")
        existing["sources"].append(source)
        if not existing.get("answer") and item.get("answer"):
            existing["answer"] = item["answer"]
        if not existing.get("explanation") and item.get("explanation"):
            existing["explanation"] = item["explanation"]
        if not existing.get("section") and item.get("section"):
            existing["section"] = item["section"]
        if not existing.get("rawHtml") and item.get("rawHtml"):
            existing["rawHtml"] = item["rawHtml"]
        years = sorted(set(existing.get("years", []) + item.get("years", [])), reverse=True)
        existing["years"] = years
        existing["year"] = years[0] if len(years) == 1 else ""
    return list(merged.values())


def blank_count(stem):
    return len(re.findall(r"[\uff08(]\d+[\uff09)]", stem or ""))


def main():
    raw = []
    docx_files = []
    for path in ROOT.rglob("*.docx"):
        text_path = str(path)
        if "pdf-mobile-reader" in text_path or "ruankao-quiz-app" in text_path:
            continue
        if "07 " not in text_path:
            continue
        docx_files.append(path)

    for path in docx_files:
        try:
            raw.extend(extract_from_docx(path))
        except Exception as error:
            print(f"skip {path}: {error}")

    questions = merge_items(raw)
    suspicious_multi = 0
    clean_questions = []
    for item in questions:
        answer = item.get("answer", "")
        if len(item.get("options", [])) < 2 or not re.search(r"[ABCD]", answer):
            continue
        if len(answer) > 1 and blank_count(item.get("stem", "")) < len(answer):
            suspicious_multi += 1
            continue
        clean_questions.append(item)
    questions = clean_questions
    questions.sort(key=lambda item: (item["sources"][0]["subject"], item["sources"][0]["chapter"], item["stem"]))

    by_subject = Counter(item["sources"][0]["subject"] for item in questions)
    by_chapter = Counter(item["sources"][0]["chapter"] for item in questions)
    by_year = Counter(year for item in questions for year in item.get("years", []))
    unanswered_raw = sum(1 for item in raw if not item.get("answer"))
    payload = {
        "meta": {
            "title": "\u8f6f\u8003\u8f6f\u4ef6\u8bbe\u8ba1\u5e08\u9898\u5e93",
            "sourceRoot": str(ROOT),
            "sourceDocx": len(docx_files),
            "rawItems": len(raw),
            "questions": len(questions),
            "rawWithoutAnswer": unanswered_raw,
            "suspiciousMultiAnswerSkipped": suspicious_multi,
            "subjects": by_subject,
            "chapters": by_chapter,
            "years": dict(sorted(by_year.items(), reverse=True)),
        },
        "questions": questions,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(payload["meta"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
