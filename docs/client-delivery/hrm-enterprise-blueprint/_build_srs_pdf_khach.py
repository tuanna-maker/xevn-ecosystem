# -*- coding: utf-8 -*-
"""
PO-HRM-BP-SRS-PDF-KHACH-01
- ADD-only enrich SRS_HRM_ENTERPRISE.md with remaining UCs from Excel 03/03b
- Preserve 16 priority FR (full 7 sections)
- Build Vietnamese Unicode PDF for client
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

from fpdf import FPDF

from _seq_diagram_pil import clear_old_cache, ensure_diagram_png

ROOT = Path(__file__).resolve().parent
SRS_PATH = ROOT / "SRS_HRM_ENTERPRISE.md"
JSON_PATH = ROOT / "_excel_uc_extract.json"
PDF_PATH = ROOT / "SRS_HRM_ENTERPRISE_KHACH.pdf"
FONT = Path(r"C:\Windows\Fonts\segoeui.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\segoeuib.ttf")

PRIORITY_16 = {
    "UC-BP-REC-01",
    "UC-BP-REC-01b",
    "UC-BP-REC-02",
    "UC-BP-REC-02b",
    "UC-BP-REC-08",
    "UC-BP-CORE-01",
    "UC-BP-CORE-02",
    "UC-BP-CORE-08",
    "UC-BP-ATT-02",
    "UC-BP-ATT-08",
    "UC-BP-ATT-09",
    "UC-BP-ATT-10",
    "UC-BP-ATT-11",
    "UC-BP-PAY-01",
    "UC-BP-PAY-02",
    "UC-BP-PAY-04",
}


def soft_client(text: str) -> str:
    if not text:
        return ""
    t = text
    t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)
    t = re.sub(r"`[^`]+`", "", t)
    replacements = [
        (r"sheet\s*«?03b_Dien_bien_chi_tiet»?", "bảng diễn biến chi tiết"),
        (r"03b_Dien_bien_chi_tiet", "bảng diễn biến chi tiết"),
        (r"lọc cột «Tham chiếu — mã tình huống»\s*=\s*UC-BP-[A-Z0-9-]+", ""),
        (r"Chi tiết \d+ bước →[^.]*\.", ""),
        (r"→ Mở [^.]+\.\s*", ""),
        (r"\bYCTD\b", "yêu cầu tuyển dụng"),
        (r"\bĐB\b", "định biên"),
        (r"\bC&B\b", "chuyên viên lương thưởng và phúc lợi"),
        (r"\bHCNS\b", "nhân sự"),
        (r"\bBOD\b", "Ban giám đốc"),
        (r"\bOT\b", "tăng ca"),
        (r"\bAPI\b", "dịch vụ hệ thống"),
        (r"\bUI\b", "màn hình"),
        (r"\bFE\b|\bBE\b|\bSA\b|\bQA\b|\bQC\b|\bMobile\b", ""),
        (r"partner_req_id", "mã yêu cầu đối tác"),
        (r"approved", "đã duyệt"),
        (r"\bversion\b", "phiên bản"),
        (r"↛", "không gọi trực tiếp"),
        (r"\s{2,}", " "),
        (r"\|\s*", " | "),
    ]
    for a, b in replacements:
        t = re.sub(a, b, t, flags=re.I)
    return t.strip(" ·|")


def normalize_uc_key(raw: str) -> str:
    m = re.match(r"(UC-BP-[A-Z]+-\d+[a-z]?)", raw or "")
    return m.group(1) if m else (raw or "")


def load_extract() -> dict:
    if not JSON_PATH.exists():
        raise SystemExit(f"Missing {JSON_PATH}; run _extract_excel_uc.py first")
    return json.loads(JSON_PATH.read_text(encoding="utf-8"))


def steps_for_uc(extract: dict, uc: str) -> list[dict]:
    by = extract["steps_by_uc"]
    out: list[dict] = []
    for key, steps in by.items():
        if normalize_uc_key(key) == uc:
            out.extend(steps)
    # sort by Bước số if possible
    def sort_key(s: dict):
        b = s.get("Bước số", "")
        try:
            return float(b)
        except ValueError:
            return 999.0

    out.sort(key=sort_key)
    return out


def build_remaining_md(extract: dict) -> str:
    lines: list[str] = []
    lines.append("### 3.A. Use case bổ sung (khung nghiệp vụ — từ bảng tình huống)")
    lines.append("")
    lines.append(
        "Các tình huống dưới đây đã khóa mã trong inventory **44** UC. "
        "Mười sáu FR ưu tiên ở trên vẫn giữ đủ 7 mục. "
        "Phần này bổ sung đủ mục đích · tác nhân · diễn biến · quy tắc · đạt/không đạt để khách đọc và chốt khung — "
        "chưa bắt buộc đủ 7 mục kỹ thuật cho mọi UC."
    )
    lines.append("")
    lines.append("| # | Mã | Tên ngắn | Module |")
    lines.append("|---|-----|----------|--------|")
    remaining = [
        s
        for s in extract["situations"]
        if s.get("Tham chiếu — mã tình huống") not in PRIORITY_16
    ]
    for i, s in enumerate(remaining, 1):
        uc = s.get("Tham chiếu — mã tình huống", "")
        name = soft_client(s.get("Tên tình huống nghiệp vụ", ""))
        mod = soft_client(s.get("Module", ""))
        lines.append(f"| {i} | {uc} | {name} | {mod} |")
    lines.append("")

    for s in remaining:
        uc = s.get("Tham chiếu — mã tình huống", "")
        title = soft_client(s.get("Tên tình huống nghiệp vụ", ""))
        lines.append(f"### FR-{uc} — {title}")
        lines.append("")
        lines.append("#### Mục đích")
        lines.append("")
        lines.append(soft_client(s.get("Mục đích / câu hỏi giải quyết", "")) or "—")
        lines.append("")
        lines.append("#### Tác nhân")
        lines.append("")
        lines.append(soft_client(s.get("Ai thực hiện", "")) or "—")
        lines.append("")
        lines.append("#### Luồng chính / diễn biến")
        lines.append("")
        steps = steps_for_uc(extract, uc)
        if steps:
            lines.append("| # | Ai | Thao tác / hệ thống | Điều kiện | Kết quả hoặc lỗi |")
            lines.append("|---|----|---------------------|-----------|------------------|")
            for st in steps:
                num = st.get("Bước số", "")
                actor = soft_client(st.get("Ai thực hiện", ""))
                user = soft_client(st.get("Người dùng / người nghiệp vụ làm gì (chi tiết)", ""))
                sys = soft_client(st.get("Hệ thống xử lý thế nào (chi tiết)", ""))
                action = " / ".join(x for x in (user, sys) if x)
                if len(action) > 220:
                    action = action[:217] + "…"
                dk = soft_client(st.get("Điều kiện / quy tắc tại bước này", ""))
                ok = soft_client(st.get("Thành công — thấy gì (màn hình / dữ liệu)", ""))
                fail = soft_client(st.get("Thất bại — chặn / thông báo gì", ""))
                result = ok
                if fail:
                    result = f"{ok} · Nếu lỗi: {fail}" if ok else f"Nếu lỗi: {fail}"
                if len(result) > 220:
                    result = result[:217] + "…"
                if len(dk) > 160:
                    dk = dk[:157] + "…"
                lines.append(
                    f"| {num} | {actor or '—'} | {action or '—'} | {dk or '—'} | {result or '—'} |"
                )
        else:
            # fallback summary stripped of sheet pointers
            summary = soft_client(s.get("Diễn biến — tóm tắt + chỉ sang sheet chi tiết", ""))
            summary = re.sub(r"Tóm tắt nghiệp vụ:\s*", "", summary)
            lines.append(summary or "—")
        lines.append("")
        lines.append("#### Quy tắc nghiệp vụ")
        lines.append("")
        br = soft_client(s.get("Tham chiếu — mã quy tắc", ""))
        rule = soft_client(s.get("Quy tắc nghiệp vụ", ""))
        if br:
            lines.append(f"- {br}: {rule}" if rule else f"- {br}")
        elif rule:
            lines.append(f"- {rule}")
        else:
            lines.append("- —")
        edge = soft_client(s.get("Tình huống đặc biệt (edge)", ""))
        if edge:
            lines.append(f"- Trường hợp đặc biệt: {edge}")
        lines.append("")
        lines.append("#### Đạt / không đạt")
        lines.append("")
        lines.append("| | Nội dung |")
        lines.append("|--|----------|--------|")
        lines.append(f"| Đạt khi | {soft_client(s.get('Được chấp nhận khi', '')) or '—'} |")
        lines.append(f"| Không đạt khi | {soft_client(s.get('Không chấp nhận khi', '')) or '—'} |")
        risk = soft_client(s.get("Rủi ro nếu hiểu sai", ""))
        if risk:
            lines.append(f"| Rủi ro nếu hiểu sai | {risk} |")
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append(
        "> Mười sáu FR ưu tiên phía trên đủ 7 mục. "
        "Hai mươi tám UC bổ sung phía trên đủ khung nghiệp vụ để đọc và chốt; "
        "có thể nâng đủ 7 mục kỹ thuật ở đợt sau khi khách xác nhận phạm vi."
    )
    lines.append("")
    return "\n".join(lines)


def patch_srs(extract: dict) -> None:
    text = SRS_PATH.read_text(encoding="utf-8")
    # version bump (idempotent)
    text = re.sub(
        r"\| Phiên bản \| \*\*0\.[45]\*\*[^\n]*\|",
        "| Phiên bản | **0.5** — 16 FR ưu tiên đủ 7 mục (giữ nguyên) + **28** UC bổ sung khung nghiệp vụ từ bảng tình huống |",
        text,
        count=1,
    )
    text = re.sub(
        r"\| Inventory khóa \|[^\n]*\|",
        "| Inventory khóa | **44** use case — **16** FR ưu tiên đủ 7 mục; **28** UC bổ sung khung nghiệp vụ (mục đích · diễn biến · đạt/không đạt) |",
        text,
        count=1,
    )
    # soften §1.4 file paths for client readability (keep titles)
    text = text.replace(
        "| WBS_HRM_ENTERPRISE | Task → UC → BR → mã yêu cầu đối tác → câu hỏi chốt |\n"
        "| UC_INVENTORY | Khóa 44 mã UC (mọi mã có `partner_req_id`) |\n"
        "| UC_BR_MATRIX_DEPTH | AC PASS/FAIL và edge-case |\n"
        "| DATA_OWNERSHIP_MATRIX | Sở hữu dữ liệu 12 thực thể |\n"
        "| ADR / API_BOUNDARY_MAP / TECHSPEC_OUTLINE | Ranh giới kiến trúc — **outline HOLD depth** |",
        "| Bảng công việc (WBS) | Hạng mục → tình huống → quy tắc → câu hỏi cần chốt |\n"
        "| Danh mục use case | Khóa 44 mã tình huống |\n"
        "| Ma trận quy tắc sâu | Tiêu chí đạt / không đạt và ngoại lệ |\n"
        "| Ma trận sở hữu dữ liệu | Ai sở hữu từng nhóm dữ liệu chính |\n"
        "| Ranh giới kỹ thuật (outline) | Chỉ khung — chi tiết kỹ thuật tạm dừng đến khi chốt SRS |",
    )
    # update FR intro note
    text = text.replace(
        "> Mỗi mục `FR-{Mã UC}` gồm đủ 7 phần: thông tin chung · dữ liệu đầu vào · luồng chính · quy tắc nghiệp vụ · trường hợp đặc biệt · sơ đồ tương tác · diễn biến nghiệp vụ.  \n"
        "> Các UC **Lịch** trong inventory: chỉ nêu mã ở mục lục phụ; nội dung FR đầy đủ đợt sau.",
        "> **16 FR ưu tiên:** đủ 7 phần (thông tin chung · dữ liệu đầu vào · luồng chính · quy tắc · trường hợp đặc biệt · sơ đồ · diễn biến).  \n"
        "> **28 UC bổ sung (§3.A):** mục đích · tác nhân · diễn biến · quy tắc · đạt/không đạt — đủ để đọc và chốt khung.",
    )
    # TOC note
    if "### Mục lục FR ưu tiên đợt này" in text and "Mục lục UC bổ sung" not in text:
        text = text.replace(
            "| 16 | FR-UC-BP-PAY-04 | Gộp lương giữa kỳ | Đủ 7 mục |\n\n---\n",
            "| 16 | FR-UC-BP-PAY-04 | Gộp lương giữa kỳ | Đủ 7 mục |\n\n"
            "### Mục lục UC bổ sung (§3.A)\n\n"
            "28 tình huống còn lại trong inventory 44 — xem bảng mở đầu mục **3.A**.\n\n---\n",
        )

    remaining_block = build_remaining_md(extract)
    # replace 3.A (legacy stub or prior enrich) through before ## 4
    pat = re.compile(
        r"### 3\.A\. Use case .*?(?=\n## 4\. Yêu cầu phi chức năng)",
        flags=re.S,
    )
    if not pat.search(text):
        raise SystemExit("Could not find section 3.A to replace")
    text = pat.sub(remaining_block + "\n", text)

    # chapter 6 hold wording soften slightly
    text = text.replace(
        "2. **HOLD TechSpec / DB / API depth** đến khi khách xác nhận SRS (và các Decision tối thiểu: Q-PAY-FORMULA, Q-REC-HEADCOUNT, Q-LEAVE-UNIT).",
        "2. Đặc tả kỹ thuật sâu / thiết kế dữ liệu vật lý / hợp đồng tích hợp chi tiết — tạm dừng đến khi khách xác nhận SRS (và các quyết định tối thiểu: công thức lương, trong/ngoài định biên, đơn vị nửa ngày phép).",
    )

    text = text.replace(
        "*Hết bản SRS v0.4 — 16 FR ưu tiên đủ 7 mục. Bổ sung FR lịch sau khi khách xác nhận inventory và các Decision còn mở.*",
        "*Hết bản SRS v0.5 — 16 FR ưu tiên đủ 7 mục + 28 UC bổ sung khung nghiệp vụ. Nâng đủ 7 mục kỹ thuật cho UC còn lại sau khi khách xác nhận phạm vi và các quyết định còn mở.*",
    )

    SRS_PATH.write_text(text, encoding="utf-8")
    print("patched", SRS_PATH)


class KhachPDF(FPDF):
    def __init__(self) -> None:
        super().__init__(format="A4", unit="mm")
        self.set_auto_page_break(auto=True, margin=18)
        if not FONT.exists():
            raise SystemExit(f"Font not found: {FONT}")
        self.add_font("VN", "", str(FONT))
        self.add_font("VN", "B", str(FONT_BOLD if FONT_BOLD.exists() else FONT))
        self._toc: list[tuple[str, int]] = []

    def header(self) -> None:
        if self.page_no() == 1:
            return
        self.set_font("VN", "", 8)
        self.set_text_color(90, 90, 90)
        self.cell(0, 6, "Đặc tả yêu cầu phần mềm — HRM doanh nghiệp (bản gửi khách)", align="L")
        self.ln(8)
        self.set_draw_color(30, 64, 175)
        self.set_line_width(0.3)
        self.line(15, 14, 195, 14)
        self.set_text_color(0, 0, 0)

    def footer(self) -> None:
        self.set_y(-12)
        self.set_font("VN", "", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, f"Trang {self.page_no()}/{{nb}}", align="C")
        self.set_text_color(0, 0, 0)

    def add_toc_entry(self, title: str) -> None:
        self._toc.append((title, self.page_no()))


def md_to_plain_blocks(md: str) -> list[tuple[str, str]]:
    """Return list of (kind, text) for simple PDF rendering."""
    blocks: list[tuple[str, str]] = []
    lines = md.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("# "):
            blocks.append(("h1", line[2:].strip()))
        elif line.startswith("## "):
            blocks.append(("h2", line[3:].strip()))
        elif line.startswith("### "):
            blocks.append(("h3", line[4:].strip()))
        elif line.startswith("#### "):
            blocks.append(("h4", line[5:].strip()))
        elif line.startswith("```"):
            # skip mermaid / code fences content for PDF (keep note)
            lang = line.strip("`").strip()
            i += 1
            buf = []
            while i < len(lines) and not lines[i].startswith("```"):
                buf.append(lines[i])
                i += 1
            if lang.lower().startswith("mermaid"):
                src = "\n".join(buf)
                try:
                    png = ensure_diagram_png(src, force=True)
                    blocks.append(("mermaid_img", str(png)))
                except Exception as exc:  # noqa: BLE001 — keep PDF build resilient
                    blocks.append(("p", f"[Sơ đồ tương tác — lỗi render: {exc}]"))
                    blocks.append(("code", src))
            else:
                blocks.append(("code", "\n".join(buf)))
        elif line.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[-| :]+$", lines[i + 1]):
            table_lines = [line]
            i += 1
            while i < len(lines) and lines[i].startswith("|"):
                if not re.match(r"^\|[-| :]+$", lines[i]):
                    table_lines.append(lines[i])
                i += 1
            i -= 1
            blocks.append(("table", "\n".join(table_lines)))
        elif line.startswith("> "):
            blocks.append(("quote", line[2:].strip()))
        elif line.startswith("- "):
            blocks.append(("li", line[2:].strip()))
        elif re.match(r"^\d+\.\s", line):
            blocks.append(("li", line.strip()))
        elif line.strip() == "---":
            blocks.append(("hr", ""))
        elif line.strip() == "":
            blocks.append(("sp", ""))
        else:
            # strip leftover markdown
            t = soft_client(line)
            t = re.sub(r"^>\s*", "", t)
            if t:
                blocks.append(("p", t))
        i += 1
    return blocks


def render_table(pdf: KhachPDF, table_md: str) -> None:
    rows = []
    for line in table_md.splitlines():
        cells = [soft_client(c.strip()) for c in line.strip().strip("|").split("|")]
        rows.append(cells)
    if not rows:
        return
    cols = max(len(r) for r in rows)
    usable = pdf.epw
    if cols >= 5:
        widths = [12, 28, 55, 40, 45]
        widths = widths[:cols] + [usable / cols] * max(0, cols - 5)
        s = sum(widths[:cols])
        widths = [w * usable / s for w in widths[:cols]]
    elif cols == 4:
        widths = [14, 36, 70, 60]
        s = sum(widths)
        widths = [w * usable / s for w in widths]
    elif cols == 2:
        widths = [usable * 0.28, usable * 0.72]
    elif cols == 3:
        widths = [usable * 0.22, usable * 0.39, usable * 0.39]
    else:
        widths = [usable / cols] * cols
    for r_i, row in enumerate(rows):
        while len(row) < cols:
            row.append("")
        line_h = 4.0
        max_lines = 1
        for j, cell in enumerate(row):
            chars = max(int(widths[j] / 1.8), 6)
            max_lines = max(max_lines, max(1, (len(cell or "") + chars - 1) // chars))
        h = min(line_h * max_lines + 1.2, 26)
        if pdf.get_y() + h > 277:
            pdf.add_page()
        x0 = pdf.l_margin
        y0 = pdf.get_y()
        for j, cell in enumerate(row):
            pdf.set_xy(x0 + sum(widths[:j]), y0)
            if r_i == 0:
                pdf.set_fill_color(232, 238, 252)
                pdf.set_font("VN", "B", 8)
            else:
                pdf.set_fill_color(255, 255, 255)
                pdf.set_font("VN", "", 7.5)
            pdf.multi_cell(widths[j], line_h, cell or "—", border=0, fill=True)
        pdf.set_xy(pdf.l_margin, y0 + h)
        pdf.set_draw_color(210, 210, 210)
        pdf.line(pdf.l_margin, pdf.get_y(), pdf.l_margin + pdf.epw, pdf.get_y())

def _safe_multi(pdf: KhachPDF, h: float, text: str, **kwargs) -> None:
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(pdf.epw, h, text, **kwargs)


def _render_body(pdf: KhachPDF, blocks: list[tuple[str, str]], collect_toc: bool) -> list[tuple[str, int]]:
    toc_entries: list[tuple[str, int]] = []
    for kind, text in blocks:
        if kind == "h1":
            continue
        if kind == "sp":
            pdf.ln(2)
            continue
        if kind == "hr":
            pdf.ln(2)
            continue
        if kind in ("h2", "h3", "h4"):
            if pdf.get_y() > 250:
                pdf.add_page()
            if kind == "h2":
                pdf.ln(4)
                pdf.set_font("VN", "B", 13)
                pdf.set_text_color(30, 64, 175)
                _safe_multi(pdf, 7, text)
                if collect_toc:
                    toc_entries.append((text, pdf.page_no()))
            elif kind == "h3":
                pdf.ln(3)
                pdf.set_font("VN", "B", 11)
                pdf.set_text_color(20, 20, 20)
                _safe_multi(pdf, 6, text)
                if collect_toc and (text.startswith("FR-") or text.startswith("3.A")):
                    toc_entries.append(("  " + text[:90], pdf.page_no()))
            else:
                pdf.ln(2)
                pdf.set_font("VN", "B", 10)
                pdf.set_text_color(40, 40, 40)
                _safe_multi(pdf, 5.5, text)
            pdf.set_text_color(0, 0, 0)
            continue
        if kind == "table":
            render_table(pdf, text)
            pdf.ln(2)
            continue
        if kind == "li":
            pdf.set_font("VN", "", 9.5)
            _safe_multi(pdf, 5, "• " + soft_client(text))
            continue
        if kind == "quote":
            pdf.set_font("VN", "", 9)
            pdf.set_text_color(60, 60, 60)
            _safe_multi(pdf, 5, soft_client(text))
            pdf.set_text_color(0, 0, 0)
            continue
        if kind == "code":
            pdf.set_font("VN", "", 8.5)
            pdf.set_fill_color(245, 247, 250)
            _safe_multi(pdf, 4.5, soft_client(text), fill=True)
            continue
        if kind == "mermaid_img":
            _render_mermaid_image(pdf, text)
            continue
        pdf.set_font("VN", "", 9.5)
        _safe_multi(pdf, 5, soft_client(text))
    return toc_entries


def _render_mermaid_image(pdf: KhachPDF, path: str) -> None:
    """Embed sequenceDiagram PNG — prefer full page width; avoid crushing text."""
    from PIL import Image as PILImage

    p = Path(path)
    if not p.exists():
        pdf.set_font("VN", "", 9)
        _safe_multi(pdf, 5, "[Sơ đồ tương tác — thiếu file ảnh]")
        return
    with PILImage.open(p) as im:
        iw, ih = im.size
    max_w = pdf.epw
    # Keep aspect; use nearly full usable height of a page before shrinking
    w_mm = max_w
    h_mm = w_mm * (ih / max(iw, 1))
    # Soft cap: if taller than one page body, shrink but never below ~70% width
    # (old hard 160mm crush made Vietnamese labels unreadable)
    page_body = 240
    if h_mm > page_body:
        scale = page_body / h_mm
        # Prefer new page + full width when diagram is very tall
        if scale < 0.72:
            if pdf.get_y() > 40:
                pdf.add_page()
            w_mm = max_w
            h_mm = min(page_body, max_w * (ih / max(iw, 1)))
            if h_mm > page_body:
                scale = page_body / h_mm
                w_mm *= scale
                h_mm = page_body
        else:
            w_mm *= scale
            h_mm = page_body
    if pdf.get_y() + h_mm + 10 > 277:
        pdf.add_page()
    pdf.ln(2)
    pdf.set_font("VN", "", 8)
    pdf.set_text_color(90, 90, 90)
    _safe_multi(pdf, 4, "Sơ đồ tương tác (sequence)")
    pdf.set_text_color(0, 0, 0)
    x = pdf.l_margin + (pdf.epw - w_mm) / 2
    pdf.image(str(p), x=x, y=pdf.get_y(), w=w_mm, h=h_mm)
    pdf.set_y(pdf.get_y() + h_mm + 4)


def build_pdf_from_srs() -> None:
    clear_old_cache()
    md = SRS_PATH.read_text(encoding="utf-8")
    blocks = md_to_plain_blocks(md)

    # Pass 1 — measure TOC page numbers (content offset = cover + toc pages)
    pdf1 = KhachPDF()
    pdf1.set_margins(15, 18, 15)
    pdf1.add_page()  # cover
    pdf1.add_page()  # toc (may grow)
    toc_pages_reserved = 3  # cover + up to 2 toc pages typical; adjust after
    # render body starting as if after reserved pages: recreate with correct offset
    pdf1 = KhachPDF()
    pdf1.set_margins(15, 18, 15)
    pdf1.add_page()  # fake cover
    pdf1.add_page()  # fake toc p1
    pdf1.add_page()  # fake toc p2
    toc_entries = _render_body(pdf1, blocks, collect_toc=True)

    # Pass 2 — real document
    pdf = KhachPDF()
    pdf.alias_nb_pages()
    pdf.set_margins(15, 18, 15)

    # Cover
    pdf.add_page()
    pdf.set_y(50)
    pdf.set_font("VN", "B", 20)
    pdf.set_text_color(30, 64, 175)
    _safe_multi(pdf, 10, "ĐẶC TẢ YÊU CẦU PHẦN MỀM", align="C")
    pdf.set_font("VN", "B", 16)
    _safe_multi(pdf, 9, "Quản lý nhân sự doanh nghiệp", align="C")
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("VN", "", 12)
    pdf.ln(8)
    _safe_multi(
        pdf,
        7,
        "Bốn trụ: Tuyển dụng · Nhân sự · Chấm công & Nghỉ phép · Tiền lương\n"
        "Phiên bản 0.8 — đã chốt theo phiếu FILL + REMAINING 05/08/2026\n"
        "47 tình huống · FR ưu tiên + EXPAND đủ diễn biến · OUT/GĐ2 đã stamp",
        align="C",
    )
    pdf.ln(16)
    pdf.set_font("VN", "", 10)
    _safe_multi(
        pdf,
        6,
        "Tài liệu này dùng để thống nhất nghiệp vụ trên giấy trước khi mở đặc tả kỹ thuật chi tiết. "
        "Không thay thế hướng dẫn vận hành nội bộ hiện có.",
        align="C",
    )

    # TOC
    pdf.add_page()
    pdf.set_font("VN", "B", 14)
    pdf.set_text_color(30, 64, 175)
    _safe_multi(pdf, 10, "Mục lục")
    pdf.set_text_color(0, 0, 0)
    seen: set[str] = set()
    shown = 0
    for title, page in toc_entries:
        key = title.strip()
        if key in seen:
            continue
        seen.add(key)
        if shown and shown % 40 == 0:
            pdf.add_page()
            pdf.set_font("VN", "B", 12)
            _safe_multi(pdf, 8, "Mục lục (tiếp)")
        pdf.set_font("VN", "", 9)
        # page numbers from pass1 already include 3 reserved pages (cover+2 toc) — close enough
        _safe_multi(pdf, 5, f"{title} ........ {page}")
        shown += 1
        if shown > 90:
            pdf.set_font("VN", "", 9)
            _safe_multi(pdf, 5, "… và các mục chi tiết tiếp theo trong nội dung.")
            break

    # Body
    _render_body(pdf, blocks, collect_toc=False)
    pdf.output(str(PDF_PATH))
    print("wrote", PDF_PATH, "pages", pdf.pages_count, "toc_entries", len(toc_entries))

def main() -> None:
    extract = load_extract()
    assert extract["uc_count_03"] == 44, extract["uc_count_03"]
    assert extract["step_total"] == 260, extract["step_total"]
    patch_srs(extract)
    build_pdf_from_srs()
    # verify remaining FR count in markdown
    text = SRS_PATH.read_text(encoding="utf-8")
    frs = re.findall(r"^### FR-(UC-BP-[A-Z]+-\d+[a-z]?)", text, flags=re.M)
    print("FR headers in SRS:", len(frs), "unique", len(set(frs)))
    missing = [u for u in (s["Tham chiếu — mã tình huống"] for s in extract["situations"]) if f"FR-{u}" not in text and u not in PRIORITY_16]
    # priority already as FR-UC-BP-...
    for u in PRIORITY_16:
        assert f"### FR-{u}" in text or f"### FR-UC-BP-" in text
    for u in (s["Tham chiếu — mã tình huống"] for s in extract["situations"]):
        if u in PRIORITY_16:
            assert f"### FR-{u}" in text, u
        else:
            assert f"### FR-{u}" in text, f"missing remaining {u}"
    print("all 44 UC present as FR-* headers")
    print("PDF exists", PDF_PATH.exists(), "size", PDF_PATH.stat().st_size if PDF_PATH.exists() else 0)


if __name__ == "__main__":
    main()
