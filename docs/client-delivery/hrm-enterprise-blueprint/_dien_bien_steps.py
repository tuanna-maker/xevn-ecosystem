# -*- coding: utf-8 -*-
"""Diễn biến từng bước — đủ chi tiết để khách chốt + SA/FE/BE/Mobile/QA/QC triển khai."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

MODULE_VI = {
    "REC": "Tuyển dụng",
    "CORE": "Nhân sự",
    "ATT": "Chấm công & Nghỉ phép",
    "PAY": "Tiền lương & Phúc lợi",
}

# Gợi ý lane kỹ thuật theo loại bước (cột cuối sheet — đội ngũ đọc)
LANE_HINT = {
    "Tien_quyet": "SA xác nhận tiên quyết · BE kiểm tra quyền/phạm vi · QA lập precondition",
    "Nhap_lieu": "FE form + validate UX · BE DTO/validation · QA nhập đúng/sai",
    "Kiem_tra": "BE rule nghiệp vụ · FE thông báo lỗi rõ · QA case FAIL",
    "Luu_gui": "FE Lưu/Gửi + toast · BE ghi trạng thái · QA Network 2xx + F5 còn dữ liệu",
    "Duyet": "FE inbox/duyệt · BE đổi trạng thái + quyền cấp · QA duyệt/từ chối",
    "He_thong": "BE job/event · SA ranh giới module · QA chờ kết quả tự động",
    "Ket_thuc": "QA AC thành công · QC đối chiếu SRS · SA khóa mang sang UC kế",
    "Ngoai_le": "BE nhánh ngoại lệ · FE banner · QA edge-case đối tác",
}


def soft(text: str) -> str:
    if not text:
        return ""
    t = text
    for a, b in [
        (r"`[^`]+`", ""),
        (r"\bC&B\b", "chuyên viên lương thưởng và phúc lợi"),
        (r"\bYCTD\b", "yêu cầu tuyển dụng"),
        (r"\bĐB\b", "định biên"),
        (r"\bHCNS\b", "nhân sự"),
        (r"\bBOD\b", "Ban giám đốc"),
        (r"\bOT\b", "tăng ca"),
        (r"\bAPI\b", "dịch vụ hệ thống"),
        (r"\bUI\b", "màn hình"),
        (r"\s{2,}", " "),
    ]:
        t = re.sub(a, b, t)
    return t.strip()


def parse_srs_dien_bien(srs_path: Path) -> dict[str, list[dict[str, str]]]:
    """Trả {UC: [{num, tuong_tac, dieu_kien, ket_qua}, ...]} từ SRS."""
    text = srs_path.read_text(encoding="utf-8")
    out: dict[str, list[dict[str, str]]] = {}
    # Split by FR headers
    uc_pat = r"UC-BP-[A-Z]+-\d+[a-z]?"
    headers = list(re.finditer(rf"^### FR-({uc_pat})\b", text, flags=re.M))
    for i, hm in enumerate(headers):
        uc = hm.group(1)
        start = hm.start()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(text)
        chunk = text[start:end]
        tm = re.search(
            r"#### Diễn biến nghiệp vụ\s*\n\n\|[^\n]+\n\|[-| :]+\n((?:\|[^\n]+\n)+)",
            chunk,
        )
        if not tm:
            continue
        steps = []
        for line in tm.group(1).strip().splitlines():
            parts = [p.strip() for p in line.strip().strip("|").split("|")]
            if len(parts) < 4:
                continue
            num, tuong, dk, kq = parts[0], parts[1], parts[2], parts[3]
            if num.lower().startswith("thành"):
                steps.append({
                    "num": "T",
                    "loai": "Ket_thuc",
                    "tuong_tac": "Kết thúc thành công",
                    "dieu_kien": soft(dk) if dk != "—" else "Đủ điều kiện các bước trước",
                    "ket_qua": soft(kq),
                })
            else:
                steps.append({
                    "num": num,
                    "loai": _guess_loai(tuong),
                    "tuong_tac": soft(tuong),
                    "dieu_kien": soft(dk),
                    "ket_qua": soft(kq),
                })
        if steps:
            out[uc] = steps
    return out


def _guess_loai(tuong: str) -> str:
    t = tuong.lower()
    if any(x in t for x in ("duyệt", "từ chối", "phê duyệt", "ký")):
        return "Duyet"
    if any(x in t for x in ("hệ thống", "tự", "quét", "sinh", "tính", "giữ chỗ", "hold")):
        return "He_thong"
    if any(x in t for x in ("lỗi", "chặn", "thiếu", "chưa", "ngoài", "vượt")):
        return "Ngoai_le"
    if any(x in t for x in ("mở", "chọn", "nhập", "gán", "điền", "tạo", "cấu hình", "upload")):
        return "Nhap_lieu"
    if any(x in t for x in ("gửi", "lưu", "xác nhận", "chạy", "submit")):
        return "Luu_gui"
    if any(x in t for x in ("kiểm", "preview", "xem trước")):
        return "Kiem_tra"
    return "Nhap_lieu"


def expand_srs_step(uc: str, ten: str, step: dict[str, str], actor_default: str) -> dict[str, str]:
    """Mở rộng 1 dòng SRS thành đủ cột đọc hiểu cho làm việc."""
    loai = step.get("loai", "Nhap_lieu")
    tuong = step["tuong_tac"]
    dk = step["dieu_kien"]
    kq = step["ket_qua"]
    ai = actor_default
    if loai == "He_thong":
        ai = "Hệ thống"
    elif loai == "Duyet":
        ai = "Người có quyền duyệt (theo chính sách pháp nhân)"
    elif "nhân viên" in tuong.lower():
        ai = "Nhân viên"
    elif any(x in tuong.lower() for x in ("hcns", "nhân sự", "tuyển", "c&b", "chuyên viên lương")):
        ai = "Nhân sự / chuyên viên lương thưởng (đúng quyền)"

    user_do = (
        f"Thực hiện thao tác: «{tuong}». "
        f"Chỉ làm khi: {dk}. "
        f"Không bỏ qua bước kiểm tra trên màn hình trước khi sang bước sau."
    )
    if loai == "He_thong":
        user_do = (
            f"Người dùng không bấm tay bước này (hoặc chỉ theo dõi kết quả). "
            f"Sự kiện kích hoạt: {tuong}. Điều kiện chạy: {dk}."
        )
    if loai == "Ket_thuc":
        user_do = (
            f"Đối chiếu kết quả cuối: {kq}. "
            f"Ghi nhận khóa mang sang tình huống tiếp theo (nếu có trong mô tả)."
        )

    sys_do = (
        f"Hệ thống áp dụng điều kiện «{dk}». "
        f"Nếu đạt: {kq}. "
        f"Nếu không đạt: chặn hoặc trả về chỉnh sửa kèm lý do rõ (không im lặng)."
    )
    if loai == "Ket_thuc":
        sys_do = (
            f"Trạng thái nghiệp vụ đã ổn định. Dữ liệu hiển thị khớp kết quả: {kq}. "
            f"Các bước sau chỉ đọc trạng thái này, không tự đảo ngược trừ khi có quy trình hủy có quyền."
        )

    ok = kq if loai != "Ngoai_le" else f"Nhánh ngoại lệ xử lý đúng: {kq}"
    fail = (
        "Thao tác bị từ chối hoặc giữ nguyên trạng thái trước đó; "
        "màn hình nêu rõ lý do (thiếu quyền, thiếu điều kiện, trùng, vượt quỹ…)."
    )
    if "lỗi" in kq.lower() or "không" in kq.lower()[:12]:
        fail = kq
        ok = "Không đi tiếp nhánh thành công khi điều kiện này xảy ra."

    return {
        "buoc": step["num"],
        "loai": loai,
        "ai": ai,
        "user_do": user_do,
        "sys_do": sys_do,
        "dieu_kien": dk,
        "thanh_cong": ok,
        "that_bai": fail,
        "buoc_ke": f"Sang bước tiếp theo của {ten}" if step["num"] not in ("T", "Kết thúc") else "Khóa mang / UC kế theo cột thành công",
        "lane": LANE_HINT.get(loai, LANE_HINT["Nhap_lieu"]),
        "nguon": "SRS — Diễn biến nghiệp vụ (đã diễn giải mở rộng)",
    }


# Bổ sung tay các UC chưa có FR đủ / cần sâu hơn cho đội kỹ thuật
HAND_STEPS: dict[str, list[dict[str, str]]] = {
    "UC-BP-ATT-08": [
        {
            "buoc": "0", "loai": "Tien_quyet", "ai": "Nhân sự chấm công / cấu hình",
            "user_do": "Đảm bảo đã có lịch làm việc và lịch nghỉ lễ (dương + ngày âm đã cấu hình) của đúng pháp nhân cho năm đang xét.",
            "sys_do": "Hệ thống lấy cùng một bộ lịch cho phép và bảng công — không dùng hai lịch khác nhau.",
            "dieu_kien": "Lịch pháp nhân đã cấu hình năm hiện tại",
            "thanh_cong": "Khi xem trước đơn phép, lịch lễ hiển thị đúng ngày không làm việc",
            "that_bai": "Thiếu lịch → cảnh báo cấu hình; không tự bịa ngày lễ",
            "buoc_ke": "Nhân viên hoặc quản lý tạo đơn nghỉ",
            "lane": LANE_HINT["Tien_quyet"], "nguon": "Ma trận BR-BP-LV-05 + bổ sung chi tiết",
        },
        {
            "buoc": "1", "loai": "Nhap_lieu", "ai": "Nhân viên hoặc quản lý hộ",
            "user_do": "Chọn loại phép trừ quỹ, chọn khoảng nghỉ ví dụ từ Thứ sáu đến Thứ ba tuần sau; chọn đơn vị nửa ngày hoặc theo giờ nếu loại phép cho phép.",
            "sys_do": "Mở form đơn; gắn loại phép với quy tắc trừ quỹ và đơn vị tính đã cấu hình.",
            "dieu_kien": "Loại phép hợp lệ; nhân viên thuộc phạm vi công ty đang thao tác",
            "thanh_cong": "Form nhận đủ ngày bắt đầu/kết thúc và loại phép",
            "that_bai": "Thiếu loại phép / ngày → không cho gửi",
            "buoc_ke": "Xem trước số ngày trừ",
            "lane": LANE_HINT["Nhap_lieu"], "nguon": "Ma trận BR-BP-LV-05",
        },
        {
            "buoc": "2", "loai": "Kiem_tra", "ai": "Hệ thống",
            "user_do": "Nhìn phần xem trước số ngày sẽ trừ quỹ trước khi gửi đơn.",
            "sys_do": "Đếm chỉ ngày làm việc trong khoảng: bỏ Thứ bảy, Chủ nhật, ngày lễ theo lịch pháp nhân. Ví dụ chuẩn T6→T2 = trừ 2 ngày (không phải 4 ngày lịch).",
            "dieu_kien": "BR trừ ngày làm việc; đơn vị tối thiểu nửa ngày hoặc 1 giờ theo cấu hình loại phép",
            "thanh_cong": "Số xem trước = 2 (ví dụ chuẩn) hoặc đúng số ngày làm việc thực tế",
            "that_bai": "Nếu hệ thống trừ theo ngày lịch → sai nghiệp vụ (phải sửa trước khi phát hành)",
            "buoc_ke": "Gửi đơn (sang tình huống giữ chỗ quỹ)",
            "lane": "BE công thức ngày làm · FE hiển thị preview · QA case T6–T2 = 2",
            "nguon": "Ma trận BR-BP-LV-05 (edge P0)",
        },
        {
            "buoc": "3", "loai": "Ngoai_le", "ai": "Hệ thống",
            "user_do": "Thử khoảng nghỉ dài có nhiều ngày lễ — đối chiếu preview.",
            "sys_do": "Chỉ cộng ngày làm việc; lễ trong khoảng = 0 trừ quỹ.",
            "dieu_kien": "Lịch lễ đã gắn pháp nhân",
            "thanh_cong": "Preview giảm đúng số ngày lễ",
            "that_bai": "Trừ cả ngày lễ → FAIL",
            "buoc_ke": "UC-BP-ATT-09 giữ chỗ quỹ khi gửi",
            "lane": LANE_HINT["Ngoai_le"], "nguon": "Ma trận edge-case",
        },
        {
            "buoc": "T", "loai": "Ket_thuc", "ai": "QA / người chốt logic",
            "user_do": "Xác nhận ví dụ chuẩn và đơn vị nửa ngày / 1 giờ đã thống nhất với quyết định Q-LEAVE-UNIT (nếu còn mở thì ghi «chờ chốt»).",
            "sys_do": "Số ngày trừ dùng cho giữ chỗ và trừ thật ở bước duyệt sau này.",
            "dieu_kien": "Preview khớp quy tắc",
            "thanh_cong": "Khóa mang = số ngày làm việc sẽ trừ; UC kế = nộp & duyệt phép",
            "that_bai": "—",
            "buoc_ke": "UC-BP-ATT-09",
            "lane": LANE_HINT["Ket_thuc"], "nguon": "SRS/matrix",
        },
    ],
    "UC-BP-ATT-09": [
        {
            "buoc": "1", "loai": "Nhap_lieu", "ai": "Nhân viên",
            "user_do": "Sau khi xem trước số ngày trừ, bấm Gửi đơn nghỉ.",
            "sys_do": "Nhận đơn ở trạng thái chờ duyệt; tính số ngày giữ chỗ = số ngày làm việc preview.",
            "dieu_kien": "Đủ quyền nộp; không chồng ngày với đơn khác đang giữ chỗ/đã duyệt",
            "thanh_cong": "Đơn ở trạng thái chờ; số phép còn dùng giảm đúng phần giữ chỗ",
            "that_bai": "Chồng ngày → chặn gửi kèm lý do",
            "buoc_ke": "Quản lý duyệt hoặc từ chối",
            "lane": LANE_HINT["Luu_gui"], "nguon": "BR-BP-LV-06",
        },
        {
            "buoc": "2", "loai": "He_thong", "ai": "Hệ thống",
            "user_do": "Kiểm tra số dư phép: còn dùng được = trước gửi − đang giữ chỗ.",
            "sys_do": "Giữ chỗ quỹ (hold): không trừ thật vào «đã trừ» cho đến khi duyệt; đơn thứ hai cùng ngày bị chặn.",
            "dieu_kien": "Submit = giữ chỗ",
            "thanh_cong": "Hai người đọc cùng thấy số giữ chỗ; không âm quỹ giả",
            "that_bai": "Gửi không giữ chỗ → cho phép double-book → sai",
            "buoc_ke": "Duyệt / Từ chối",
            "lane": "BE ledger phép · FE số dư · QA double submit",
            "nguon": "BR-BP-LV-06",
        },
        {
            "buoc": "3", "loai": "Duyet", "ai": "Quản lý / nhân sự có quyền",
            "user_do": "Mở đơn chờ → Duyệt hoặc Từ chối (có lý do khi từ chối).",
            "sys_do": "Duyệt: chuyển giữ chỗ → đã trừ đúng số ngày làm việc. Từ chối: hoàn 100% giữ chỗ về số còn dùng.",
            "dieu_kien": "Đúng cấp duyệt theo quy trình",
            "thanh_cong": "Duyệt: quỹ đã trừ khớp preview; Từ chối: số dư trở lại như trước gửi",
            "that_bai": "Từ chối không hoàn giữ chỗ → FAIL",
            "buoc_ke": "Đổi loại phép (nếu cho phép) → tính lại giữ chỗ",
            "lane": LANE_HINT["Duyet"], "nguon": "BR-BP-LV-06",
        },
        {
            "buoc": "4", "loai": "Ngoai_le", "ai": "Nhân viên / hệ thống",
            "user_do": "Đổi loại nghỉ trên đơn chưa duyệt (nếu nghiệp vụ cho phép).",
            "sys_do": "Tính lại số ngày trừ và điều chỉnh giữ chỗ theo số mới; không để giữ chỗ cũ + mới chồng.",
            "dieu_kien": "Đơn còn chờ duyệt",
            "thanh_cong": "Giữ chỗ khớp loại mới",
            "that_bai": "Giữ chỗ lệch sau đổi loại → FAIL",
            "buoc_ke": "Bảng công / báo cáo phép phản ánh đúng",
            "lane": LANE_HINT["Ngoai_le"], "nguon": "Ma trận edge",
        },
        {
            "buoc": "T", "loai": "Ket_thuc", "ai": "QA",
            "user_do": "Xác nhận chuỗi: gửi → số dư giảm (hold) → duyệt trừ thật / từ chối hoàn; F5 vẫn đúng.",
            "sys_do": "Sổ quỹ phép nhất quán; không âm im lặng.",
            "dieu_kien": "Đủ nhánh duyệt và từ chối đã thử",
            "thanh_cong": "AC hold đạt; sẵn sàng vào tổng hợp bảng công",
            "that_bai": "—",
            "buoc_ke": "UC-BP-ATT-10",
            "lane": LANE_HINT["Ket_thuc"], "nguon": "BR-BP-LV-06",
        },
    ],
    "UC-BP-PAY-01": [
        {
            "buoc": "0", "loai": "Tien_quyet", "ai": "Nhân sự chấm công + chuyên viên lương",
            "user_do": "Chỉ mở chạy lương khi bảng công kỳ đã ký chốt đủ chữ ký bắt buộc.",
            "sys_do": "Module tiền lương đọc duy nhất nguồn «giờ công tính lương» từ bảng công chốt.",
            "dieu_kien": "Bảng công trạng thái đã chốt",
            "thanh_cong": "Màn chạy lương thấy kỳ có bảng chốt",
            "that_bai": "Bảng còn nháp → không cho chạy lương",
            "buoc_ke": "Lắp công thức / chạy kỳ",
            "lane": "SA ranh giới ATT→PAY · BE cấm đọc thẳng tăng ca/phép · QA thử chạy khi chưa chốt",
            "nguon": "BR-BP-TS-03",
        },
        {
            "buoc": "1", "loai": "Kiem_tra", "ai": "Hệ thống",
            "user_do": "Không thao tác «lấy giờ từ đơn tăng ca / đơn phép» trên màn lương.",
            "sys_do": "Cấm phụ thuộc trực tiếp vào dữ liệu tăng ca hoặc phép để tính lương; mọi giờ đã nằm trong bảng công chốt (tăng ca đã nhân hệ số trong phễu công).",
            "dieu_kien": "Ranh giới bốn khối",
            "thanh_cong": "Số giờ trên phiếu khớp bảng công chốt",
            "that_bai": "Lương tự cộng thêm giờ từ phép/tăng ca ngoài bảng → CONFLICT — phải sửa",
            "buoc_ke": "UC-BP-PAY-02 / PAY-06",
            "lane": LANE_HINT["Kiem_tra"], "nguon": "BR-BP-TS-03",
        },
        {
            "buoc": "2", "loai": "Ngoai_le", "ai": "Nhân sự chấm công",
            "user_do": "Nếu cần sửa phép sau khi đã chốt bảng công: mở lại bảng công có quyền + lý do, hoặc điều chỉnh kỳ sau — không sửa âm thầm phiếu lương đã khóa.",
            "sys_do": "Phiếu lương đã khóa không đổi chỉ vì sửa phép; phải mở lại bảng công rồi chạy lại theo quy trình.",
            "dieu_kien": "Có quyền hủy chốt / điều chỉnh kỳ",
            "thanh_cong": "Có nhật ký mở lại; lương chỉ đổi sau chạy lại hợp lệ",
            "that_bai": "Sửa phép làm lệch lương đã phát → sai kiểm soát",
            "buoc_ke": "Giữ một nguồn số",
            "lane": LANE_HINT["Ngoai_le"], "nguon": "BR-BP-TS-03 edge",
        },
        {
            "buoc": "T", "loai": "Ket_thuc", "ai": "SA / QC",
            "user_do": "Xác nhận nguyên tắc «một nguồn giờ công» trước khi mở đặc tả kỹ thuật lương.",
            "sys_do": "Mọi kỳ lương sau này bám nguyên tắc này.",
            "dieu_kien": "Đã chốt logic giấy",
            "thanh_cong": "Ranh giới ATT→PAY rõ; UC kế = công thức / chạy kỳ",
            "that_bai": "—",
            "buoc_ke": "UC-BP-PAY-02",
            "lane": LANE_HINT["Ket_thuc"], "nguon": "BR-BP-TS-03",
        },
    ],
    "UC-BP-PAY-04": [
        {
            "buoc": "1", "loai": "Tien_quyet", "ai": "Chuyên viên lương thưởng",
            "user_do": "Xác định trong kỳ có đổi lương cơ bản / hết thử việc / thăng chức với ngày hiệu lực nằm giữa kỳ.",
            "sys_do": "Đánh dấu kỳ cần gộp hai đoạn theo ngày hiệu lực trên hồ sơ/hợp đồng.",
            "dieu_kien": "Ngày hiệu lực nằm trong kỳ lương",
            "thanh_cong": "Hệ thống bật cờ gộp giữa tháng",
            "that_bai": "Không có ngày hiệu lực → không tách đoạn giả",
            "buoc_ke": "Tính đoạn 1 và đoạn 2",
            "lane": LANE_HINT["Tien_quyet"], "nguon": "BR-BP-SPL-01",
        },
        {
            "buoc": "2", "loai": "He_thong", "ai": "Hệ thống",
            "user_do": "Theo dõi kết quả xem trước phiếu: chỉ một số thực nhận.",
            "sys_do": "Tính đoạn trước và sau ngày cắt: cộng dồn giờ/thu nhập/phụ cấp theo ngày; giảm trừ gia cảnh, thuế, trần bảo hiểm tính một lần trên tổng hợp — không trừ hai lần.",
            "dieu_kien": "Hai đoạn → một phiếu thực nhận",
            "thanh_cong": "Một phiếu; giảm trừ gia cảnh không nhân đôi",
            "that_bai": "Hai phiếu hoặc trừ gia cảnh hai lần → FAIL P0",
            "buoc_ke": "Xác nhận phiếu",
            "lane": "BE engine split · FE preview một phiếu · QA case thăng chức giữa tháng",
            "nguon": "BR-BP-SPL-01",
        },
        {
            "buoc": "3", "loai": "Ngoai_le", "ai": "Chuyên viên lương thưởng",
            "user_do": "Chốt mốc cắt theo ngày hiệu lực nhân sự (không mặc định cứng ngày 15 trừ khi cấu hình kỳ yêu cầu).",
            "sys_do": "Mốc cắt đọc từ hiệu lực hồ sơ/hợp đồng đã ban hành.",
            "dieu_kien": "Chính sách mốc cắt đã thống nhất",
            "thanh_cong": "Đoạn 1/2 khớp ngày hiệu lực",
            "that_bai": "Cắt sai ngày → lệch thu nhập",
            "buoc_ke": "Trần bảo hiểm một lần (UC-BP-PAY-05)",
            "lane": LANE_HINT["Ngoai_le"], "nguon": "BR-BP-SPL-01",
        },
        {
            "buoc": "T", "loai": "Ket_thuc", "ai": "QA / QC",
            "user_do": "Đối chiếu: một thực nhận; không khấu trừ kép; trần bảo hiểm không áp hai lần từng đoạn.",
            "sys_do": "Kết quả khóa vào phiếu kỳ.",
            "dieu_kien": "Đủ case đổi lương giữa kỳ",
            "thanh_cong": "AC gộp giữa tháng đạt",
            "that_bai": "—",
            "buoc_ke": "UC-BP-PAY-08 phiếu lương",
            "lane": LANE_HINT["Ket_thuc"], "nguon": "BR-BP-SPL-01",
        },
    ],
}


def synthesize_from_matrix(
    uc: str,
    ten: str,
    mod: str,
    dien_bien: str,
    br: str,
    pass_txt: str,
    fail_txt: str,
    edge: str,
    actor: str,
) -> list[dict[str, str]]:
    """Sinh diễn biến chi tiết khi chưa có FR SRS / hand steps."""
    steps = [
        {
            "buoc": "0", "loai": "Tien_quyet", "ai": actor,
            "user_do": (
                f"Trước khi làm «{ten}»: đăng nhập đúng vai trò, chọn đúng công ty/pháp nhân trong phạm vi được phép. "
                f"Đọc mục đích: {dien_bien[:220]}{'…' if len(dien_bien) > 220 else ''}."
            ),
            "sys_do": "Chỉ tải dữ liệu trong phạm vi quyền; từ chối thao tác ngoài phạm vi kèm thông báo rõ.",
            "dieu_kien": "Đã đăng nhập; đúng phạm vi công ty",
            "thanh_cong": "Màn hình tình huống mở được, không báo lỗi tải",
            "that_bai": "Sai phạm vi / hết phiên → không vào được hoặc không thấy dữ liệu người khác",
            "buoc_ke": "Nhập liệu / thao tác chính",
            "lane": LANE_HINT["Tien_quyet"], "nguon": "Sinh từ ma trận UC/BR",
        },
        {
            "buoc": "1", "loai": "Nhap_lieu", "ai": actor,
            "user_do": (
                f"Thực hiện luồng chính của tình huống «{ten}». "
                f"Nhập hoặc chọn đủ trường bắt buộc theo quy tắc {br}. "
                f"Không bỏ trống trường hệ thống đánh dấu bắt buộc."
            ),
            "sys_do": f"Hiển thị form/danh sách gắn quy tắc {br}; gợi ý hoặc chặn sớm các giá trị không hợp lệ trên màn hình.",
            "dieu_kien": soft(dien_bien)[:180] or "Đủ dữ liệu đầu vào",
            "thanh_cong": "Form nhận dữ liệu; nút Lưu/Gửi/Duyệt sẵn sàng khi đủ trường",
            "that_bai": "Thiếu trường bắt buộc → không cho sang bước xác nhận",
            "buoc_ke": "Kiểm tra nghiệp vụ",
            "lane": LANE_HINT["Nhap_lieu"], "nguon": "Sinh từ ma trận UC/BR",
        },
        {
            "buoc": "2", "loai": "Kiem_tra", "ai": "Hệ thống (+ người dùng đọc thông báo)",
            "user_do": "Đọc thông báo / xem trước kết quả trước khi xác nhận cuối.",
            "sys_do": (
                f"Áp dụng quy tắc {br}. "
                f"Tiêu chí đạt: {pass_txt}. "
                f"Tiêu chí không đạt: {fail_txt}."
            ),
            "dieu_kien": f"Quy tắc {br}",
            "thanh_cong": pass_txt or "Qua kiểm tra nghiệp vụ",
            "that_bai": fail_txt or "Bị chặn kèm lý do",
            "buoc_ke": "Lưu / gửi / duyệt",
            "lane": LANE_HINT["Kiem_tra"], "nguon": "AC PASS/FAIL ma trận",
        },
        {
            "buoc": "3", "loai": "Luu_gui", "ai": actor,
            "user_do": "Bấm Lưu hoặc Gửi (hoặc thao tác tương đương trên màn hình). Chờ phản hồi thành công rồi mới rời màn.",
            "sys_do": "Ghi nhận bản ghi/trạng thái mới; trả về thông báo thành công; danh sách hoặc chi tiết cập nhật ngay trên màn hình.",
            "dieu_kien": "Đã qua kiểm tra bước 2",
            "thanh_cong": "Thấy bản ghi/trạng thái mới; tải lại trang vẫn còn (không mất dữ liệu)",
            "that_bai": "Lỗi hệ thống hoặc nghiệp vụ → giữ form, không báo thành công giả",
            "buoc_ke": "Duyệt (nếu có) hoặc kết thúc",
            "lane": LANE_HINT["Luu_gui"], "nguon": "Chuẩn nghiệm thu thao tác màn hình",
        },
        {
            "buoc": "4", "loai": "Ngoai_le", "ai": actor + " / Hệ thống",
            "user_do": f"Thử tình huống đặc biệt: {edge}" if edge else "Thử nhánh thiếu quyền hoặc dữ liệu biên (rỗng, trùng, vượt hạn mức).",
            "sys_do": "Xử lý nhánh ngoại lệ có thông báo; không để dữ liệu lệch im lặng.",
            "dieu_kien": edge or "Nhánh ngoại lệ đã liệt kê trong ma trận",
            "thanh_cong": "Hành vi khớp mô tả đặc biệt; không phá dữ liệu gốc",
            "that_bai": "Im lặng sai số / sai trạng thái → FAIL",
            "buoc_ke": "Ghi nhận residual nếu khách chưa chốt",
            "lane": LANE_HINT["Ngoai_le"], "nguon": "Edge-case ma trận",
        },
        {
            "buoc": "T", "loai": "Ket_thuc", "ai": "QA / người nghiệp vụ chốt",
            "user_do": (
                f"Đối chiếu thành công: {pass_txt}. "
                f"Ghi rõ dữ liệu mang sang bước/tình huống sau (mã bản ghi, trạng thái, tháng/kỳ…)."
            ),
            "sys_do": "Trạng thái ổn định; sẵn sàng cho tình huống phụ thuộc tiếp theo trong xương sống end-to-end.",
            "dieu_kien": "Happy path + ít nhất một nhánh FAIL đã kiểm",
            "thanh_cong": pass_txt,
            "that_bai": "—",
            "buoc_ke": "Xem sheet liên kết khối / UC kế trong inventory",
            "lane": LANE_HINT["Ket_thuc"], "nguon": "Sinh từ ma trận UC/BR",
        },
    ]
    return steps


def build_all_steps(
    uc_order: list[str],
    uc_ten: dict[str, str],
    wbs_for_uc: dict[str, str],
    by_uc: dict[str, dict[str, str]],
    actors: dict[str, str],
) -> list[dict[str, str]]:
    srs_map = parse_srs_dien_bien(ROOT / "SRS_HRM_ENTERPRISE.md")
    rows: list[dict[str, str]] = []
    stt = 0
    for uc in uc_order:
        meta = by_uc.get(uc)
        if not meta:
            continue
        mod = meta["mod"]
        ten = uc_ten.get(uc, uc)
        actor = actors.get(mod, "")
        wbs = wbs_for_uc.get(uc, "")

        if uc in HAND_STEPS:
            steps = HAND_STEPS[uc]
            # If SRS also exists, prefer HAND for these deep ones
        elif uc in srs_map:
            steps = [
                expand_srs_step(uc, ten, s, actor)
                for s in srs_map[uc]
            ]
        else:
            steps = synthesize_from_matrix(
                uc, ten, mod,
                meta.get("dien_bien", ""),
                meta.get("br", ""),
                meta.get("pass", ""),
                meta.get("fail", ""),
                meta.get("edge", ""),
                actor,
            )

        # Merge: if SRS exists AND hand exists, hand wins (already). 
        # If SRS exists and we want both depth: for non-hand, expanded SRS is enough.
        # Enrich SRS-only with leading tiên quyết if missing step 0
        if uc in srs_map and uc not in HAND_STEPS:
            if not any(str(s.get("buoc")) == "0" for s in steps):
                steps = [{
                    "buoc": "0", "loai": "Tien_quyet", "ai": actor,
                    "user_do": f"Chuẩn bị dữ liệu và quyền để thực hiện «{ten}» theo đặc tả đã chốt.",
                    "sys_do": "Kiểm tra phiên đăng nhập và phạm vi pháp nhân trước khi mở chức năng.",
                    "dieu_kien": "Đúng vai trò và phạm vi",
                    "thanh_cong": "Vào được màn hình chức năng",
                    "that_bai": "Không đủ quyền → không mở",
                    "buoc_ke": "Bước 1 của diễn biến",
                    "lane": LANE_HINT["Tien_quyet"],
                    "nguon": "Bổ sung tiên quyết cho FR SRS",
                }] + steps

        for s in steps:
            stt += 1
            loai_vi = {
                "Tien_quyet": "0. Tiên quyết",
                "Nhap_lieu": "1. Nhập liệu / thao tác",
                "Kiem_tra": "2. Kiểm tra nghiệp vụ",
                "Luu_gui": "3. Lưu / Gửi",
                "Duyet": "4. Duyệt / Từ chối",
                "He_thong": "5. Hệ thống tự xử lý",
                "Ket_thuc": "9. Kết thúc thành công",
                "Ngoai_le": "8. Ngoại lệ / biên",
            }.get(s.get("loai", ""), s.get("loai", ""))
            rows.append({
                "stt": str(stt),
                "module": MODULE_VI.get(mod, mod),
                "wbs": wbs,
                "ten": ten,
                "buoc": str(s.get("buoc", "")),
                "loai": loai_vi,
                "ai": s.get("ai", actor),
                "user_do": s.get("user_do", ""),
                "sys_do": s.get("sys_do", ""),
                "dieu_kien": s.get("dieu_kien", ""),
                "thanh_cong": s.get("thanh_cong", ""),
                "that_bai": s.get("that_bai", ""),
                "buoc_ke": s.get("buoc_ke", ""),
                "lane": s.get("lane", ""),
                "uc": uc,
                "br": meta.get("br", ""),
                "nguon": s.get("nguon", ""),
            })
    return rows


def summary_for_uc(uc: str, steps_rows: list[dict[str, str]]) -> str:
    mine = [r for r in steps_rows if r["uc"] == uc]
    if not mine:
        return "Chưa có diễn biến — xem sheet Diễn biến chi tiết sau khi bổ sung."
    bits = []
    for r in mine[:8]:
        if r["buoc"] in ("T",):
            continue
        bits.append(f"{r['buoc']}. {r['user_do'][:80]}…")
    return (
        f"Chi tiết {len(mine)} bước → sheet «03b_Dien_bien_chi_tiet» (lọc theo mã tình huống). "
        + " | ".join(bits[:4])
    )
