# -*- coding: utf-8 -*-
"""
PO-HRM-BP-SPONSOR-UC-FLOW-PDF-01
PDF gói chốt: luồng nghiệp vụ từng UC (45 mã) — đọc cùng SPONSOR_CHOT_REMAINING sheet 03.
- 16 UC Ưu tiên: diễn biến đầy đủ từ SRS FR 7 mục
- 29 UC Lịch: khung ngắn, gắn nhãn «khung — cần EXPAND»
Không đụng SRS; không invent câu trả lời Q-*.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parent
INV_PATH = ROOT / "UC_INVENTORY.md"
SRS_PATH = ROOT / "SRS_HRM_ENTERPRISE.md"
PDF_PATH = ROOT / "SPONSOR_UC_FLOW_CHOT.pdf"
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

UC_RE = re.compile(r"UC-BP-[A-Z]+-\d+[a-z]?")


def soft_client(text: str) -> str:
    if not text:
        return ""
    t = text
    t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)
    t = re.sub(r"`[^`]+`", "", t)
    replacements = [
        (r"\bYCTD\b", "yêu cầu tuyển dụng"),
        (r"\bĐB\b", "định biên"),
        (r"\bC&B\b", "chuyên viên lương thưởng và phúc lợi"),
        (r"\bHCNS\b", "nhân sự"),
        (r"\bBOD\b", "Ban giám đốc"),
        (r"\bOT\b", "tăng ca"),
        (r"\bAPI\b", "dịch vụ hệ thống"),
        (r"\bUI\b", "màn hình"),
        (r"\bMVP\b", "giai đoạn 1"),
        (r"\bGĐ2\b", "giai đoạn 2"),
        (r"partner_req_id", "mã yêu cầu đối tác"),
        (r"approved", "đã duyệt"),
        (r"\bBR-BP-[A-Z0-9-]+\b", ""),
        (r"\s{2,}", " "),
        (r"\|\s*", " | "),
    ]
    for a, b in replacements:
        t = re.sub(a, b, t, flags=re.I)
    # Truncate ellipsis junk from auto skeleton
    if "…" in t and len(t) > 180:
        t = t.split("…")[0].rstrip(" .") + "."
    return t.strip(" ·|")


@dataclass
class Step:
    num: str
    tuong_tac: str
    dieu_kien: str
    ket_qua: str


@dataclass
class UcFlow:
    code: str
    name: str
    module: str
    tier: str  # Ưu tiên | Lịch
    purpose: str = ""
    steps: list[Step] = field(default_factory=list)
    success: str = ""
    note: str = ""


def parse_inventory(path: Path) -> list[UcFlow]:
    text = path.read_text(encoding="utf-8")
    rows: list[UcFlow] = []
    for line in text.splitlines():
        if not line.startswith("| UC-BP-"):
            continue
        parts = [p.strip() for p in line.strip().strip("|").split("|")]
        if len(parts) < 4:
            continue
        code = parts[0]
        if not UC_RE.fullmatch(code):
            continue
        name = soft_client(re.sub(r"\*\*", "", parts[1]))
        # FR column
        fr_raw = parts[3]
        if "Ưu tiên" in fr_raw:
            tier = "Ưu tiên"
        elif "Lịch" in fr_raw:
            tier = "Lịch"
        else:
            tier = "Lịch"
        if "GĐ2" in fr_raw or "GĐ2" in parts[1]:
            note_extra = "Giai đoạn 2 / ngoài giai đoạn 1"
        else:
            note_extra = ""
        mod = "—"
        if "-REC-" in code:
            mod = "Tuyển dụng"
        elif "-CORE-" in code:
            mod = "Nhân sự"
        elif "-ATT-" in code:
            mod = "Chấm công & Nghỉ phép"
        elif "-PAY-" in code:
            mod = "Tiền lương"
        rows.append(UcFlow(code=code, name=name, module=mod, tier=tier, note=note_extra))
    # stable order as inventory
    return rows


def split_fr_chunks(srs: str) -> dict[str, str]:
    headers = list(re.finditer(rf"^### FR-({UC_RE.pattern})\b[^\n]*", srs, flags=re.M))
    out: dict[str, str] = {}
    for i, hm in enumerate(headers):
        uc = hm.group(1)
        start = hm.start()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(srs)
        out[uc] = srs[start:end]
    return out


def _table_rows(chunk: str, heading: str) -> list[list[str]]:
    tm = re.search(
        rf"#### {re.escape(heading)}\s*\n\n\|[^\n]+\n\|[-| :]+\n((?:\|[^\n]+\n)+)",
        chunk,
    )
    if not tm:
        return []
    rows = []
    for line in tm.group(1).strip().splitlines():
        parts = [soft_client(p.strip()) for p in line.strip().strip("|").split("|")]
        rows.append(parts)
    return rows


def _section_para(chunk: str, heading: str) -> str:
    m = re.search(
        rf"#### {re.escape(heading)}\s*\n\n(.+?)(?=\n#### |\n### |\n---\n|\Z)",
        chunk,
        flags=re.S,
    )
    if not m:
        return ""
    body = m.group(1).strip()
    # first non-table paragraph
    paras = []
    for block in re.split(r"\n\n+", body):
        if block.strip().startswith("|"):
            continue
        if block.strip().startswith("```"):
            continue
        t = soft_client(block.replace("\n", " "))
        if t:
            paras.append(t)
    return paras[0] if paras else ""


def _luong_chinh_numbered(chunk: str) -> list[Step]:
    m = re.search(
        r"#### Luồng chính\s*\n\n((?:(?:\d+\.|- ).+\n?)+)",
        chunk,
    )
    if not m:
        return []
    steps: list[Step] = []
    for line in m.group(1).strip().splitlines():
        lm = re.match(r"^(\d+)\.\s+(.+)$", line.strip())
        if not lm:
            continue
        steps.append(
            Step(
                num=lm.group(1),
                tuong_tac=soft_client(lm.group(2)),
                dieu_kien="—",
                ket_qua="—",
            )
        )
    return steps


def enrich_from_srs(ucs: list[UcFlow], srs_path: Path) -> None:
    srs = srs_path.read_text(encoding="utf-8")
    chunks = split_fr_chunks(srs)
    by_code = {u.code: u for u in ucs}
    for code, chunk in chunks.items():
        u = by_code.get(code)
        if not u:
            continue
        title_m = re.match(rf"### FR-{re.escape(code)}\s*—\s*(.+)", chunk)
        if title_m and not u.name:
            u.name = soft_client(title_m.group(1))

        # Purpose
        purpose = _section_para(chunk, "Mục đích")
        if not purpose:
            # Hậu điều kiện from thông tin chung table
            for row in _table_rows(chunk, "Thông tin chung") or []:
                if len(row) >= 2 and "Hậu" in row[0]:
                    purpose = f"Sau khi hoàn tất: {row[1]}"
                    break
            if not purpose and title_m:
                purpose = soft_client(title_m.group(1))
        u.purpose = purpose or u.name

        # Steps — priority: Diễn biến nghiệp vụ; else Luồng chính / diễn biến; else Luồng chính
        rows = _table_rows(chunk, "Diễn biến nghiệp vụ")
        if not rows:
            rows = _table_rows(chunk, "Luồng chính / diễn biến")
        steps: list[Step] = []
        success = ""
        for r in rows:
            if len(r) >= 4 and r[0].lower().startswith("thành"):
                success = soft_client(r[-1] if r[-1] != "—" else " | ".join(x for x in r[1:] if x and x != "—"))
                continue
            if len(r) >= 5:
                # # | Ai | Thao tác | Điều kiện | Kết quả
                num, _ai, thao, dk, kq = r[0], r[1], r[2], r[3], r[4]
                if str(num).upper() in ("T", "THÀNH CÔNG") or str(num).lower().startswith("t"):
                    if str(num).upper() == "T" or "chốt" in (thao or "").lower():
                        success = success or soft_client(kq)
                        continue
                steps.append(
                    Step(
                        num=str(num),
                        tuong_tac=soft_client(f"{_ai}: {thao}" if _ai else thao),
                        dieu_kien=soft_client(dk),
                        ket_qua=soft_client(kq),
                    )
                )
            elif len(r) >= 4:
                num, tuong, dk, kq = r[0], r[1], r[2], r[3]
                steps.append(
                    Step(
                        num=str(num),
                        tuong_tac=soft_client(tuong),
                        dieu_kien=soft_client(dk),
                        ket_qua=soft_client(kq),
                    )
                )
        if not steps:
            steps = _luong_chinh_numbered(chunk)

        # Cap steps for readability
        if u.tier == "Lịch" and len(steps) > 6:
            steps = steps[:5] + [
                Step("…", "Các bước chi tiết còn lại — cần EXPAND khi chốt", "—", "—")
            ]
        elif u.tier == "Ưu tiên" and len(steps) > 10:
            steps = steps[:10]

        u.steps = steps

        if not success:
            # Đạt / không đạt table
            for row in _table_rows(chunk, "Đạt / không đạt") or []:
                if len(row) >= 2 and "Đạt" in row[0]:
                    success = soft_client(row[1] if len(row) == 2 else row[-1])
                    break
            if not success:
                for row in _table_rows(chunk, "Thông tin chung") or []:
                    if len(row) >= 2 and "Hậu" in row[0]:
                        success = soft_client(row[1])
                        break
        u.success = success or "Người dùng hoàn tất luồng; dữ liệu lưu đúng phạm vi; sẵn sàng UC kế trên xương sống nghiệp vụ."

        if u.tier == "Lịch":
            base = "Khung — cần EXPAND (điền sheet 03: EXPAND / giai đoạn 2 / ngoài phạm vi / tạm chấp nhận khung mỏng)."
            if u.note:
                u.note = f"{base} {u.note}."
            else:
                u.note = base
        else:
            u.note = "FR Ưu tiên — đủ 7 mục trong SRS gửi chốt; dùng để đối chiếu khi nghi ngờ phạm vi."


class FlowPDF(FPDF):
    def __init__(self) -> None:
        super().__init__(format="A4", unit="mm")
        self.set_auto_page_break(auto=True, margin=16)
        if not FONT.exists():
            raise SystemExit(f"Font not found: {FONT}")
        self.add_font("VN", "", str(FONT))
        self.add_font("VN", "B", str(FONT_BOLD if FONT_BOLD.exists() else FONT))

    def header(self) -> None:
        if self.page_no() <= 1:
            return
        self.set_font("VN", "", 8)
        self.set_text_color(90, 90, 90)
        self.cell(0, 6, "Luồng nghiệp vụ từng UC — gói chốt HRM doanh nghiệp", align="L")
        self.ln(7)
        self.set_draw_color(30, 64, 175)
        self.set_line_width(0.3)
        self.line(15, 13, 195, 13)
        self.set_text_color(0, 0, 0)

    def footer(self) -> None:
        self.set_y(-11)
        self.set_font("VN", "", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, f"Trang {self.page_no()}/{{nb}}", align="C")
        self.set_text_color(0, 0, 0)


def _ensure_space(pdf: FlowPDF, h: float) -> None:
    if pdf.get_y() + h > 275:
        pdf.add_page()


def _h(pdf: FlowPDF, text: str, size: int = 12) -> None:
    _ensure_space(pdf, 12)
    pdf.set_font("VN", "B", size)
    pdf.set_text_color(30, 64, 175)
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(pdf.epw, 7, text)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(1)


def _p(pdf: FlowPDF, text: str, size: float = 9.5, bold: bool = False) -> None:
    pdf.set_font("VN", "B" if bold else "", size)
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(pdf.epw, 5, text)


def _label_value(pdf: FlowPDF, label: str, value: str) -> None:
    _ensure_space(pdf, 10)
    pdf.set_font("VN", "B", 9)
    pdf.set_x(pdf.l_margin)
    pdf.cell(28, 5, label)
    pdf.set_font("VN", "", 9)
    pdf.multi_cell(pdf.epw - 28, 5, value or "—")


def render_table(pdf: FlowPDF, headers: list[str], rows: list[list[str]], col_w: list[float] | None = None) -> None:
    usable = pdf.epw
    cols = len(headers)
    if col_w is None:
        if cols == 4:
            col_w = [12, 55, 50, 53]
        elif cols == 3:
            col_w = [usable * 0.22, usable * 0.39, usable * 0.39]
        else:
            col_w = [usable / cols] * cols
    s = sum(col_w)
    widths = [w * usable / s for w in col_w]

    def draw_row(cells: list[str], header: bool = False) -> None:
        while len(cells) < cols:
            cells.append("")
        line_h = 4.0
        max_lines = 1
        for j, cell in enumerate(cells[:cols]):
            chars = max(int(widths[j] / 1.9), 5)
            max_lines = max(max_lines, max(1, (len(cell or "") + chars - 1) // chars))
        h = min(line_h * max_lines + 0.8, 28)
        _ensure_space(pdf, h + 2)
        x0 = pdf.l_margin
        y0 = pdf.get_y()
        for j, cell in enumerate(cells[:cols]):
            pdf.set_xy(x0 + sum(widths[:j]), y0)
            if header:
                pdf.set_fill_color(232, 238, 252)
                pdf.set_font("VN", "B", 7.5)
            else:
                pdf.set_fill_color(255, 255, 255)
                pdf.set_font("VN", "", 7.5)
            pdf.multi_cell(widths[j], line_h, cell or "—", border=0, fill=True)
        pdf.set_xy(pdf.l_margin, y0 + h)
        pdf.set_draw_color(210, 210, 210)
        pdf.line(pdf.l_margin, pdf.get_y(), pdf.l_margin + pdf.epw, pdf.get_y())

    draw_row(headers, header=True)
    for r in rows:
        draw_row(list(r))


def cover(pdf: FlowPDF, ucs: list[UcFlow]) -> None:
    pdf.add_page()
    pdf.set_font("VN", "B", 18)
    pdf.set_text_color(30, 64, 175)
    pdf.ln(20)
    pdf.multi_cell(pdf.epw, 10, "Luồng nghiệp vụ từng use case\nHRM doanh nghiệp — gói chốt", align="C")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(6)
    pdf.set_font("VN", "", 11)
    pdf.multi_cell(pdf.epw, 6, "Bản dùng cùng phiếu Excel còn cần chốt (sheet 03 — UC còn «Lịch»).", align="C")
    pdf.ln(10)

    _h(pdf, "1. Mục đích tài liệu này", 12)
    _p(
        pdf,
        "Giúp người chốt đọc nhanh từng tình huống nghiệp vụ (mã UC): mục đích, các bước chính, "
        "kết quả khi thành công — trước khi đánh dấu trên Excel sheet 03: viết sâu / giai đoạn 2 / "
        "ngoài phạm vi / tạm chấp nhận khung mỏng.",
    )
    pdf.ln(2)
    _p(
        pdf,
        "Tài liệu này không hỏi lại các quyết định đã điền trên phiếu chốt trước. "
        "Không thay thế bản đặc tả yêu cầu đầy đủ; chỉ là gói luồng ngắn để chốt phạm vi.",
    )

    _h(pdf, "2. Cách đọc với Excel sheet 03", 12)
    bullets = [
        "Mở file phiếu còn cần chốt → sheet 03 (UC «Lịch»).",
        "Với mỗi mã UC-BP-* trên sheet: mở đúng mục cùng mã trong PDF này.",
        "Đọc mục đích + diễn biến + kết quả thành công.",
        "Đánh dấu trên Excel: EXPAND · giai đoạn 2 · ngoài phạm vi · tạm chấp nhận khung mỏng (WAIVER).",
        "Mười sáu UC «Ưu tiên» đã đủ luồng chi tiết — sheet 03 chủ yếu cho 29 UC «Lịch».",
        "UC ghi giai đoạn 2: chỉ triển khai sau giai đoạn 1; không bắt buộc viết sâu ngay.",
    ]
    for b in bullets:
        _p(pdf, f"• {b}")

    _h(pdf, "3. Phân tầng trong gói", 12)
    n_pri = sum(1 for u in ucs if u.tier == "Ưu tiên")
    n_lich = sum(1 for u in ucs if u.tier == "Lịch")
    render_table(
        pdf,
        ["Tầng", "Số UC", "Cách trình bày trong PDF"],
        [
            ["Ưu tiên", str(n_pri), "Luồng đầy đủ (bảng diễn biến từ đặc tả đã chốt)"],
            ["Lịch", str(n_lich), "Khung ngắn — gắn nhãn «khung — cần EXPAND»"],
            ["Tổng", str(len(ucs)), "Đủ 45 mã inventory — không bỏ sót mã"],
        ],
        [40, 25, 115],
    )
    pdf.ln(4)
    _p(
        pdf,
        "Thứ tự UC theo xương sống nghiệp vụ: Tuyển dụng → Nhân sự → Chấm công & phép → Tiền lương.",
        bold=False,
    )


def index_pages(pdf: FlowPDF, ucs: list[UcFlow], page_map: dict[str, int]) -> None:
    pdf.add_page()
    _h(pdf, "Mục lục — đủ 45 mã UC", 13)
    _p(pdf, "Cột «Trang» trỏ tới phần mô tả luồng trong PDF này.")
    pdf.ln(2)
    rows = []
    for u in ucs:
        rows.append(
            [
                u.code,
                u.name[:48] + ("…" if len(u.name) > 48 else ""),
                u.tier,
                str(page_map.get(u.code, "—")),
            ]
        )
    render_table(pdf, ["Mã", "Tên", "Tầng FR", "Trang"], rows, [38, 85, 28, 20])


def render_uc_full(pdf: FlowPDF, u: UcFlow) -> None:
    pdf.add_page()
    badge = "ƯU TIÊN" if u.tier == "Ưu tiên" else "LỊCH — KHUNG"
    if u.tier == "Ưu tiên":
        pdf.set_fill_color(30, 64, 175)
    else:
        pdf.set_fill_color(180, 120, 40)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("VN", "B", 8)
    pdf.cell(36, 6, badge, fill=True)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(8)

    pdf.set_font("VN", "B", 12)
    pdf.set_text_color(30, 64, 175)
    pdf.multi_cell(pdf.epw, 6, f"{u.code} — {u.name}")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(1)
    _label_value(pdf, "Module", u.module)
    _label_value(pdf, "Tầng FR", u.tier)
    _label_value(pdf, "Mục đích", u.purpose)
    pdf.ln(1)

    pdf.set_font("VN", "B", 10)
    pdf.multi_cell(pdf.epw, 5, "Diễn biến bước")
    pdf.ln(1)
    if u.steps:
        rows = [[s.num, s.tuong_tac, s.dieu_kien, s.ket_qua] for s in u.steps]
        render_table(pdf, ["#", "Tương tác", "Điều kiện / quy tắc", "Kết quả hoặc lỗi"], rows)
    else:
        _p(pdf, "(Chưa có bảng diễn biến trong đặc tả — cần EXPAND.)")
    pdf.ln(2)
    _label_value(pdf, "Thành công", u.success)
    _label_value(pdf, "Ghi chú", u.note)


def render_lich_compact(pdf: FlowPDF, batch: list[UcFlow]) -> None:
    """Several Lịch UCs per page — skeleton table."""
    for u in batch:
        need = 42 + 6 * max(len(u.steps), 2)
        _ensure_space(pdf, need)
        if pdf.get_y() > 40 and pdf.get_y() + need > 270:
            pdf.add_page()
        pdf.set_fill_color(255, 244, 220)
        pdf.set_font("VN", "B", 9)
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(pdf.epw, 5.5, f"{u.code} — {u.name}", fill=True)
        pdf.set_font("VN", "", 8)
        pdf.set_text_color(140, 90, 20)
        pdf.multi_cell(pdf.epw, 4, "«khung — cần EXPAND» · " + u.module)
        pdf.set_text_color(0, 0, 0)
        _p(pdf, f"Mục đích: {u.purpose}", size=8.5)
        if u.steps:
            # numbered short
            for s in u.steps[:5]:
                line = f"{s.num}. {s.tuong_tac}"
                if s.ket_qua and s.ket_qua != "—":
                    line += f" → {s.ket_qua}"
                if len(line) > 220:
                    line = line[:217] + "…"
                _p(pdf, line, size=8)
        else:
            _p(pdf, "1. Mở màn đúng vai trò · 2. Nhập/duyệt theo quy tắc · 3. Lưu — dữ liệu còn sau tải lại.", size=8)
        _p(pdf, f"Thành công: {u.success[:280]}{'…' if len(u.success) > 280 else ''}", size=8)
        if u.note:
            _p(pdf, f"Ghi chú: {u.note}", size=8)
        pdf.ln(3)


def build() -> tuple[Path, int]:
    ucs = parse_inventory(INV_PATH)
    if len(ucs) != 45:
        raise SystemExit(f"Expected 45 UC from inventory, got {len(ucs)}")
    enrich_from_srs(ucs, SRS_PATH)

    # Force tier from PRIORITY_16 for consistency
    for u in ucs:
        if u.code in PRIORITY_16:
            u.tier = "Ưu tiên"
            if not u.note.startswith("FR Ưu tiên"):
                u.note = "FR Ưu tiên — đủ 7 mục trong SRS gửi chốt; dùng để đối chiếu khi nghi ngờ phạm vi."
        else:
            u.tier = "Lịch"
            if "khung — cần EXPAND" not in u.note.lower() and "Khung — cần EXPAND" not in u.note:
                extra = u.note
                u.note = (
                    "Khung — cần EXPAND (điền sheet 03: EXPAND / giai đoạn 2 / ngoài phạm vi / tạm chấp nhận khung mỏng)."
                    + (f" {extra}" if extra else "")
                )

    pdf = FlowPDF()
    pdf.alias_nb_pages()
    cover(pdf, ucs)

    # Placeholder for index — rebuild after knowing pages: two-pass
    # Pass 1: render content tracking pages, then rebuild with index
    # Simpler: index without page numbers first, then content; second pass with pages.

    # Content pass to collect page numbers
    tmp = FlowPDF()
    tmp.alias_nb_pages()
    cover(tmp, ucs)
    # skip index in temp — start content after cover+index estimate
    tmp.add_page()  # fake index page(s) — will measure real below
    page_map: dict[str, int] = {}

    priority = [u for u in ucs if u.tier == "Ưu tiên"]
    lich = [u for u in ucs if u.tier == "Lịch"]

    # Real build
    pdf = FlowPDF()
    pdf.alias_nb_pages()
    cover(pdf, ucs)

    # Reserve index: render after we know pages — do content first into page_map via dry...
    # Practical approach: render index with "—" then content; print page_map; re-run with map.
    # One-shot: content first (cover + section headers), index at end OR index without page then appendix.

    # Preferred UX: index after cover with page numbers → two-pass build.
    def render_all(target: FlowPDF, pmap: dict[str, int] | None) -> dict[str, int]:
        cover(target, ucs)
        # Index
        target.add_page()
        _h(target, "Mục lục — đủ 45 mã UC", 13)
        _p(
            target,
            "Cột «Trang» trỏ tới phần mô tả luồng. Sheet 03 Excel: đối chiếu các dòng «Lịch».",
        )
        target.ln(1)
        rows = []
        for u in ucs:
            pg = str(pmap[u.code]) if pmap and u.code in pmap else "…"
            rows.append(
                [
                    u.code,
                    (u.name[:46] + "…") if len(u.name) > 46 else u.name,
                    u.tier,
                    pg,
                ]
            )
        render_table(target, ["Mã", "Tên", "Tầng FR", "Trang"], rows, [38, 85, 28, 20])

        out_map: dict[str, int] = {}
        target.add_page()
        _h(target, "Phần A — 16 UC Ưu tiên (luồng đầy đủ)", 13)
        _p(
            target,
            "Nguồn: diễn biến / luồng chính trong đặc tả yêu cầu đã gửi chốt. Không invent thêm nhánh ngoài đặc tả.",
        )

        for u in priority:
            out_map[u.code] = target.page_no() + 1  # next page will hold UC
            render_uc_full(target, u)
            out_map[u.code] = target.page_no()

        target.add_page()
        section_b_page = target.page_no()
        _h(target, "Phần B — 29 UC Lịch (khung — cần EXPAND)", 13)
        _p(
            target,
            "Mỗi khối dưới là khung ngắn để chốt trên sheet 03. "
            "Chọn EXPAND nếu cần viết đủ diễn biến; chọn giai đoạn 2 / ngoài phạm vi / tạm chấp nhận khung mỏng nếu không viết sâu ngay.",
        )
        target.ln(2)

        # batch 2–3 per visual block; track page at start of each UC
        for u in lich:
            out_map[u.code] = target.page_no()
            y_before = target.get_y()
            render_lich_compact(target, [u])
            # if page advanced at start of render_lich when space tight, page_no already correct
            if target.page_no() != out_map[u.code] and y_before > 250:
                out_map[u.code] = target.page_no()

        # Ensure all codes present
        for u in ucs:
            out_map.setdefault(u.code, section_b_page)
        return out_map

    # Pass 1
    p1 = FlowPDF()
    p1.alias_nb_pages()
    pmap = render_all(p1, None)

    # Pass 2 with page numbers
    pdf = FlowPDF()
    pdf.alias_nb_pages()
    render_all(pdf, pmap)
    pdf.output(str(PDF_PATH))
    pages = pdf.page_no()
    print(f"Wrote {PDF_PATH} pages={pages} uc={len(ucs)} priority={len(priority)} lich={len(lich)}")
    return PDF_PATH, pages


if __name__ == "__main__":
    build()
