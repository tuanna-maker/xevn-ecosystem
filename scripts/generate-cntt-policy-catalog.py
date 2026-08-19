"""Generate PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md from curated fragments."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "program" / "specs" / "PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md"
EVIDENCE = ROOT / "docs" / "qa" / "evidence" / "po-hrm-pay-cntt-ba-policy-decompose-01.md"
OCR_INDEX = ROOT / "docs" / "qa" / "evidence" / "_tmp-po-hrm-pay-cntt-pdf-ocr" / "index.json"

# fmt: off
FRAGMENTS: list[dict] = [
    # === CHUNG ===
    {"doc_id":"POL-CHUNG-20260102-2A","scope":"CHUNG","effective_from":"01/01/2026","supersedes":"—","fragment_id":"FRG-CHUNG-2A-01","fragment_type":"THANG_LUONG","rule_text_vi":"Ban hành hệ thống thang lương, bảng lương toàn Công ty; mức LTT vùng 5.310.000đ/tháng","parameters":"LTT=5_310_000 VND/tháng; hiệu lực 01/01/2026","inputs_required":"job_grade_key · job_title_key · bậc III–IX","outputs":"Lương cơ bản (P1) · thang bậc theo chức danh","system_home":"settings_catalog · policy_rule","amis_neo":"1 Thiết lập","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-CHUNG-20260102-2A","scope":"CHUNG","effective_from":"01/01/2026","supersedes":"—","fragment_id":"FRG-CHUNG-2A-02","fragment_type":"THANG_LUONG","rule_text_vi":"Bảng lương Lãnh đạo (D1–D3): CEO 11.1M–21.4M theo bậc","parameters":"D1 Chairman 13.1M–26M; D2 CEO; D3 CFO/CCO/COO…","inputs_required":"chức danh · bậc lương","outputs":"Mức lương CB leadership","system_home":"settings_catalog","amis_neo":"1","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-CHUNG-20260102-2A","scope":"CHUNG","effective_from":"01/01/2026","supersedes":"—","fragment_id":"FRG-CHUNG-2A-03","fragment_type":"THANG_LUONG","rule_text_vi":"Bảng lương quản lý M1–M2 và L1–L2 (Trưởng phòng → Trưởng BP)","parameters":"M1 8.3M–17.1M; L1 6.4M–11.7M (bậc III–VIII)","inputs_required":"chức danh · bậc","outputs":"Lương CB quản lý","system_home":"settings_catalog","amis_neo":"1","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-CHUNG-20260102-2A","scope":"CHUNG","effective_from":"01/01/2026","supersedes":"—","fragment_id":"FRG-CHUNG-2A-04","fragment_type":"THANG_LUONG","rule_text_vi":"Bảng lương NV E1–E2: NV nghiệp vụ 5.7M–9.4M; thừa hành từ 5.31M","parameters":"E1/E2 theo bậc III–IX","inputs_required":"chức danh · bậc","outputs":"Lương CB nhân viên","system_home":"settings_catalog","amis_neo":"1","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-CHUNG-20250601-127A","scope":"CHUNG","effective_from":"01/06/2025","supersedes":"PL-01/02 QĐ 17/2025 (bản cũ)","fragment_id":"FRG-CHUNG-127A-01","fragment_type":"PHU_CAP","rule_text_vi":"Phụ lục 01 — Định mức thu nhập bổ sung (TNBS) theo chức danh Mức 1/2","parameters":"VD: GĐ Mức1 TNBS=30.05M (xăng 1.5M, đi lại 4M, nhà ở 10.5M…)","inputs_required":"job_title_key · mức 1|2","outputs":"TNBS (P2) · các khoản PC trong TNBS","system_home":"policy_rule · salary_component","amis_neo":"1–2","xevn_today":"MISSING","overrides":"—","extends":"QĐ 17/2025"},
    {"doc_id":"POL-CHUNG-20250601-127A","scope":"CHUNG","effective_from":"01/06/2025","supersedes":"PL-02 cũ","fragment_id":"FRG-CHUNG-127A-02","fragment_type":"THUONG","rule_text_vi":"Phụ lục 02 — Thưởng hiệu quả công việc (KPD/KPI)","parameters":"Theo PL02 đính kèm (OCR partial)","inputs_required":"KPI điểm · chức danh","outputs":"Thưởng HQCV (P3/P4)","system_home":"policy_rule","amis_neo":"2","xevn_today":"MISSING","overrides":"—","extends":"QĐ 17/2025"},
    # === ĐPHH ===
    {"doc_id":"POL-DPHH-20220401-001","scope":"RIÊNG-ĐPHH","effective_from":"01/04/2022","supersedes":"—","fragment_id":"FRG-DPHH-BASE-01","fragment_type":"KHAC","rule_text_vi":"Tổng lương ĐPHH = KPI + Doanh thu + Thưởng + PC + OT − giảm trừ","parameters":"—","inputs_required":"BCC · DT hàng gửi/nhận · KPI","outputs":"Tổng thu nhập ĐPHH","system_home":"policy_rule","amis_neo":"4–5","xevn_today":"MISSING","overrides":"CHUNG thang (local scale ĐPHH)","extends":"—"},
    {"doc_id":"POL-DPHH-20220401-001","scope":"RIÊNG-ĐPHH","effective_from":"01/04/2022","supersedes":"—","fragment_id":"FRG-DPHH-KPI-01","fragment_type":"KPI","rule_text_vi":"Lương KPI = KPI × Quỹ KPI khu vực / Ncc","parameters":"HN Quỹ KPI=4_000_000; Tỉnh=3_000_000 VND","inputs_required":"KPI điểm · Ncc · khu vực VP","outputs":"Lương KPI","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-DPHH-20220401-001","scope":"RIÊNG-ĐPHH","effective_from":"01/04/2022","supersedes":"—","fragment_id":"FRG-DPHH-DT-HG-01","fragment_type":"DOANH_THU","rule_text_vi":"Lương DT hàng gửi: %HH bậc thang DT + Đơn giá DTHG × T","parameters":"DT<150M:6%; 150–250M:7%; >250M:8%","inputs_required":"DTHG · T giờ công NV · T tổng VP","outputs":"Lương doanh thu hàng gửi","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-DPHH-DT-HG-02 (2024.10)","extends":"—"},
    {"doc_id":"POL-DPHH-20220401-001","scope":"RIÊNG-ĐPHH","effective_from":"01/04/2022","supersedes":"—","fragment_id":"FRG-DPHH-DT-HN-01","fragment_type":"DOANH_THU","rule_text_vi":"Lương DT hàng nhận: 1% × Đơn giá DTHN × T","parameters":"1% trên DTHN (bản gốc)","inputs_required":"DTHN · giờ công","outputs":"Lương DT hàng nhận","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-DPHH-DT-HN-02","extends":"—"},
    {"doc_id":"POL-DPHH-20220401-001","scope":"RIÊNG-ĐPHH","effective_from":"01/04/2022","supersedes":"—","fragment_id":"FRG-DPHH-THUONG-DT-01","fragment_type":"THUONG","rule_text_vi":"Thưởng vượt mốc DTHG: vượt 15% mốc VP → thưởng 20% phần chênh (lặp mốc)","parameters":"Mốc VP theo bảng (80M–265M tùy VP)","inputs_required":"DTHG VP · mốc thưởng","outputs":"Thưởng doanh thu","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-DPHH-20220401-001","scope":"RIÊNG-ĐPHH","effective_from":"01/04/2022","supersedes":"—","fragment_id":"FRG-DPHH-THANG-01","fragment_type":"THANG_LUONG","rule_text_vi":"Thang bậc ĐPHH local (hệ số 1.00–2.35; mức 4.8M–11.28M triệu)","parameters":"10 bậc · hệ số","inputs_required":"bậc ĐPHH","outputs":"Lương cơ bản ĐPHH","system_home":"template_override","amis_neo":"1","xevn_today":"MISSING","overrides":"FRG-CHUNG-2A-04 (local)","extends":"—"},
    {"doc_id":"POL-DPHH-20220401-001","scope":"RIÊNG-ĐPHH","effective_from":"01/04/2022","supersedes":"—","fragment_id":"FRG-DPHH-TV-01","fragment_type":"THU_VIEC","rule_text_vi":"Thử việc tính như CT, hưởng 85% tổng thu nhập (bản QC 2022)","parameters":"TV=85%","inputs_required":"flag thử việc","outputs":"Hệ số TV","system_home":"policy_rule","amis_neo":"1","xevn_today":"MISSING","overrides":"FRG-DPHH-TV-02","extends":"—"},
    {"doc_id":"POL-DPHH-20240422-044","scope":"RIÊNG-ĐPHH","effective_from":"22/04/2024","supersedes":"CS lương ship cũ","fragment_id":"FRG-DPHH-SHIP-01","fragment_type":"THUONG","rule_text_vi":"Thưởng DT giao hàng = Thưởng giao hàng + Thưởng nỗ lực − giảm trừ","parameters":"Tỷ lệ thưởng giao hàng ~25% DT thực","inputs_required":"DT ship · DT bưu cục","outputs":"PL Hưởng doanh thu","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-DPHH-20240422-044","scope":"RIÊNG-ĐPHH","effective_from":"22/04/2024","supersedes":"—","fragment_id":"FRG-DPHH-SHIP-02","fragment_type":"THUONG","rule_text_vi":"Thưởng nỗ lực team theo DT bưu cục (4M–16M)","parameters":"DT BC <25M:4M … ≥100M:16M","inputs_required":"DT bưu cục · DT cá nhân","outputs":"Thưởng nỗ lực","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-DPHH-20240710-DX","scope":"RIÊNG-ĐPHH","effective_from":"01/07/2024","supersedes":"—","fragment_id":"FRG-DPHH-SHIP-03","fragment_type":"DOANH_THU","rule_text_vi":"VP tỉnh NB/ND/TB: ship giao-nhận 50% tổng cước, không tính DT/thưởng khác","parameters":"50% cước ship","inputs_required":"cước ship · VP (NB,ND,TB)","outputs":"Hưởng ship VP tỉnh","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-DPHH-SHIP-01","extends":"—"},
    {"doc_id":"POL-DPHH-20241003-4034","scope":"RIÊNG-ĐPHH","effective_from":"01/10/2024","supersedes":"FRG-DPHH-DT-HG-01/HN-01","fragment_id":"FRG-DPHH-DT-HG-02","fragment_type":"DOANH_THU","rule_text_vi":"Điều chỉnh % hoa hồng hàng gửi","parameters":"<150M:7%; 150–<200:7.5%; 200–<300:8.5%; ≥300:9.5%; >300 tier:10.5%","inputs_required":"DTHG","outputs":"% hưởng HG","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-DPHH-DT-HG-01","extends":"—"},
    {"doc_id":"POL-DPHH-20241003-4034","scope":"RIÊNG-ĐPHH","effective_from":"01/10/2024","supersedes":"FRG-DPHH-DT-HN-01","fragment_id":"FRG-DPHH-DT-HN-02","fragment_type":"DOANH_THU","rule_text_vi":"Điều chỉnh % hoa hồng hàng nhận","parameters":"<300M:2%; ≥300M:3%","inputs_required":"DTHN","outputs":"% hưởng HN","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-DPHH-DT-HN-01","extends":"—"},
    {"doc_id":"POL-DPHH-20250218-TV","scope":"RIÊNG-ĐPHH","effective_from":"01/12/2024","supersedes":"FRG-DPHH-TV-01","fragment_id":"FRG-DPHH-TV-02","fragment_type":"THU_VIEC","rule_text_vi":"TV ĐPHH: không lương cứng; hưởng 85% chính sách Lương Doanh thu","parameters":"TV=85% DT policy","inputs_required":"flag TV","outputs":"Lương TV ĐPHH","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-DPHH-TV-01","extends":"—"},
    {"doc_id":"POL-DPHH-20250404-TDN","scope":"RIÊNG-ĐPHH","effective_from":"04/04/2025","supersedes":"—","fragment_id":"FRG-DPHH-VP-TDN-01","fragment_type":"KHAC","rule_text_vi":"Điều chỉnh thời gian làm việc và mức lương VP Trần Đại Nghĩa","parameters":"(OCR: điều chỉnh VP cụ thể)","inputs_required":"VP TDN · giờ làm","outputs":"Lương/PC VP TDN","system_home":"template_override","amis_neo":"1","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-DPHH-20250822-SHIP","scope":"RIÊNG-ĐPHH","effective_from":"22/08/2025","supersedes":"FRG-DPHH-SHIP-01","fragment_id":"FRG-DPHH-SHIP-04","fragment_type":"DOANH_THU","rule_text_vi":"Điều chỉnh cách tính lương ship điều phối","parameters":"(chi tiết phụ lục OCR)","inputs_required":"DT ship","outputs":"Lương ship","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-DPHH-SHIP-01","extends":"—"},
    # === TĐHK ===
    {"doc_id":"POL-TDHK-20240619-1500","scope":"RIÊNG-TĐHK","effective_from":"01/07/2024","supersedes":"—","fragment_id":"FRG-TDHK-BASE-01","fragment_type":"KHAC","rule_text_vi":"Tổng lương TĐ = Cuộc nghe + HĐ + TG + Top + Hạn chế nhỡ + Phép + PC","parameters":"—","inputs_required":"KPI 1500/1731 · BCC · PCCV","outputs":"Tổng thu nhập TĐ","system_home":"policy_rule","amis_neo":"4–5","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-TDHK-20240619-1500","scope":"RIÊNG-TĐHK","effective_from":"01/07/2024","supersedes":"—","fragment_id":"FRG-TDHK-CUOC-01","fragment_type":"KPI","rule_text_vi":"Lương cuộc nghe = Đơn giá/cuộc × Số cuộc","parameters":"Quỹ CS / tổng cuộc; LCB=5_000_000; nghỉ 4 ngày/tháng","inputs_required":"số cuộc nghe · BCC","outputs":"Lương cuộc nghe","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-TDHK-20240619-1500","scope":"RIÊNG-TĐHK","effective_from":"01/07/2024","supersedes":"—","fragment_id":"FRG-TDHK-HD-01","fragment_type":"DOANH_THU","rule_text_vi":"Lương HĐ = Số HĐ × Đơn giá HĐ","parameters":"Ca sáng thưởng HĐ=600k; ca chiều=800k; <50% công→50% thưởng","inputs_required":"số HĐ · ca","outputs":"Lương hợp đồng","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-TDHK-20240619-1500","scope":"RIÊNG-TĐHK","effective_from":"01/07/2024","supersedes":"—","fragment_id":"FRG-TDHK-TG-01","fragment_type":"KPI","rule_text_vi":"Lương thời gian = Giờ TT × Đơn giá TG","parameters":"Ca sáng 700k; ca chiều 1.5M/tháng","inputs_required":"BCC giờ","outputs":"Lương thời gian","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-TDHK-20240619-1500","scope":"RIÊNG-TĐHK","effective_from":"01/07/2024","supersedes":"—","fragment_id":"FRG-TDHK-TOP-01","fragment_type":"THUONG","rule_text_vi":"Thưởng Top theo CLDV và số cuộc","parameters":"CLDV≥9.5→105%; 9–<9.5→100%; <9 không xét; Top 1M/500k","inputs_required":"điểm CLDV · cuộc nghe","outputs":"Thưởng Top","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-TDHK-20240619-1500","scope":"RIÊNG-TĐHK","effective_from":"01/07/2024","supersedes":"—","fragment_id":"FRG-TDHK-MISS-01","fragment_type":"THUONG","rule_text_vi":"Thưởng hạn chế gọi nhỡ","parameters":"Quỹ 500k/tháng; hệ số theo % nhỡ (≤2%→1.1 … >8%→0)","inputs_required":"tỷ lệ gọi nhỡ","outputs":"Thưởng hạn chế nhỡ","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-TDHK-20250918-TV","scope":"RIÊNG-TĐHK","effective_from":"01/09/2025","supersedes":"—","fragment_id":"FRG-TDHK-TV-01","fragment_type":"THU_VIEC","rule_text_vi":"Mức lương TV tổng đài: ca sáng 6M; ca chiều 6.8M (từ 5.5M)","parameters":"TV sáng=6_000_000; TV chiều=6_800_000","inputs_required":"ca làm · flag TV","outputs":"Lương TV TĐ","system_home":"policy_rule","amis_neo":"1","xevn_today":"MISSING","overrides":"CHUNG TV default","extends":"—"},
    {"doc_id":"POL-TDHK-20251128-752","scope":"RIÊNG-TĐHK","effective_from":"28/11/2025","supersedes":"—","fragment_id":"FRG-TDHK-PC-01","fragment_type":"PHU_CAP","rule_text_vi":"QĐ 752 — chi phụ cấp nhân viên tổng đài hành khách","parameters":"(OCR: PC cụ thể theo PL)","inputs_required":"vị trí TĐ","outputs":"Phụ cấp TĐ","system_home":"policy_rule","amis_neo":"2","xevn_today":"MISSING","overrides":"—","extends":"—"},
    # === LX-T (representative + deltas) ===
    {"doc_id":"POL-LXT-20200901-ND","scope":"RIÊNG-LX-T","effective_from":"01/09/2020","supersedes":"—","fragment_id":"FRG-LXT-BASE-01","fragment_type":"KHAC","rule_text_vi":"Tổng lương LX tuyến = Lượt + CLDV + CPN + Khăn nước + HĐ − giảm trừ","parameters":"—","inputs_required":"BCC · lượt · DT · CLDV · CPSC","outputs":"Tổng lương LX","system_home":"policy_rule","amis_neo":"4–5","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXT-20200901-ND","scope":"RIÊNG-LX-T","effective_from":"01/09/2020","supersedes":"—","fragment_id":"FRG-LXT-LUOT-01","fragment_type":"DOANH_THU","rule_text_vi":"Lương lượt = Số lượt × Đơn giá (bậc 1–100:45k; >100:55k Nam Định mẫu)","parameters":"45_000/55_000 VND/lượt (ND 2020)","inputs_required":"số lượt · tỉnh","outputs":"Lương lượt","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-LXT-QD439-*","extends":"—"},
    {"doc_id":"POL-LXT-20200901-ND","scope":"RIÊNG-LX-T","effective_from":"01/09/2020","supersedes":"—","fragment_id":"FRG-LXT-DT-01","fragment_type":"DOANH_THU","rule_text_vi":"Quỹ lương DT: ≤100M×4%; >100M×8% (cá nhân, trừ HĐ tour)","parameters":"Bậc 100M · 4%/8%","inputs_required":"DT cá nhân","outputs":"Quỹ DT → CLDV","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXT-20200901-ND","scope":"RIÊNG-LX-T","effective_from":"01/09/2020","supersedes":"—","fragment_id":"FRG-LXT-CLDV-01","fragment_type":"KPI","rule_text_vi":"Lương CLDV = Quỹ DT × hệ số C (9.0–10 điểm)","parameters":"9.0–9.4:100%; 9.5–9.9:105%; ≥10:110%","inputs_required":"điểm CLDV","outputs":"Lương CLDV","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXT-20200901-ND","scope":"RIÊNG-LX-T","effective_from":"01/09/2020","supersedes":"—","fragment_id":"FRG-LXT-CPN-01","fragment_type":"DOANH_THU","rule_text_vi":"Lương CPN = 10% DT CPN cá nhân","parameters":"10% DT CPN","inputs_required":"DT CPN","outputs":"Lương CPN","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXT-20200901-ND","scope":"RIÊNG-LX-T","effective_from":"01/09/2020","supersedes":"—","fragment_id":"FRG-LXT-HD-01","fragment_type":"DOANH_THU","rule_text_vi":"Lương HĐ khác tỉnh / ngoại giao / Nội Bài","parameters":"400–600k/ngày +4% DT; NB 100–200k/lượt","inputs_required":"loại HĐ · ngày · lượt","outputs":"Lương hợp đồng","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-LXT-HD-02","extends":"—"},
    {"doc_id":"POL-LXT-20200901-ND","scope":"RIÊNG-LX-T","effective_from":"01/09/2020","supersedes":"—","fragment_id":"FRG-LXT-GT-01","fragment_type":"KHOAN","rule_text_vi":"Giảm trừ chung sửa chữa BD (GTC) chia tổ","parameters":"GTC1= A/B×10% (Ford 5%; khác 10%)","inputs_required":"chi phí SC · số lái tổ","outputs":"Khấu trừ GTC","system_home":"policy_rule","amis_neo":"5","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXT-20200901-NB","scope":"RIÊNG-LX-T","effective_from":"01/09/2020","supersedes":"—","fragment_id":"FRG-LXT-LUOT-NB","fragment_type":"DOANH_THU","rule_text_vi":"Quy chế Ninh Bình — đơn giá lượt (tương tự ND, khác biên)","parameters":"Bậc lượt theo QC tỉnh","inputs_required":"lượt · tỉnh=NB","outputs":"Lương lượt","system_home":"template_override","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-LXT-LUOT-01","extends":"—"},
    {"doc_id":"POL-LXT-20200901-TB","scope":"RIÊNG-LX-T","effective_from":"01/10/2020","supersedes":"—","fragment_id":"FRG-LXT-LUOT-TB","fragment_type":"DOANH_THU","rule_text_vi":"Quy chế Thái Bình — đơn giá lượt","parameters":"QC Thái Bình","inputs_required":"lượt · tỉnh=TB","outputs":"Lương lượt","system_home":"template_override","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-LXT-LUOT-01","extends":"—"},
    {"doc_id":"POL-LXT-20231001-PT","scope":"RIÊNG-LX-T","effective_from":"01/10/2023","supersedes":"QC tỉnh PT cũ","fragment_id":"FRG-LXT-LUOT-PT","fragment_type":"DOANH_THU","rule_text_vi":"Quy chế lương tuyến Tỉnh Phú Thọ (ban hành 01.10.2023)","parameters":"QC Phú Thọ 6 trang","inputs_required":"lượt · tỉnh=PT","outputs":"Lương lượt/CLDV…","system_home":"template_override","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-LXT-LUOT-01","extends":"—"},
    {"doc_id":"POL-LXT-20230828-HD","scope":"RIÊNG-LX-T","effective_from":"28/08/2023","supersedes":"FRG-LXT-HD-01","fragment_id":"FRG-LXT-HD-02","fragment_type":"DOANH_THU","rule_text_vi":"QĐ điều chỉnh lương HĐ khác tỉnh & ngoại giao","parameters":"(PL QĐ 280823)","inputs_required":"loại HĐ","outputs":"Lương HĐ","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-LXT-HD-01","extends":"—"},
    {"doc_id":"POL-LXT-20250905-VTP","scope":"RIÊNG-LX-T","effective_from":"01/07/2025","supersedes":"—","fragment_id":"FRG-LXT-LUOT-VTP","fragment_type":"DOANH_THU","rule_text_vi":"Đề xuất đơn giá lượt Việt Trì, Phú Thọ","parameters":"Từ 01/07/2025","inputs_required":"lượt · VT/PT","outputs":"Đơn giá lượt","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-LXT-LUOT-PT","extends":"—"},
    {"doc_id":"POL-LXT-20251029-439","scope":"RIÊNG-LX-T","effective_from":"01/09/2025","supersedes":"QĐ 1023/2024","fragment_id":"FRG-LXT-QD439-LUOT","fragment_type":"DOANH_THU","rule_text_vi":"QĐ 439 — điều chỉnh đơn giá lượt theo tuyến/tỉnh","parameters":"VD ND≤100:65k; >100:70k; NB 55/65k; TB 70/75k; VT/BC 65/75k; PT 70/80k; YB 95/115k","inputs_required":"lượt · tuyến · tỉnh","outputs":"Lương lượt","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-LXT-LUOT-*","extends":"—"},
    {"doc_id":"POL-LXT-20251029-439","scope":"RIÊNG-LX-T","effective_from":"01/09/2025","supersedes":"—","fragment_id":"FRG-LXT-QD439-ANCA","fragment_type":"PHU_CAP","rule_text_vi":"Tiền ăn ca Chủ nhật","parameters":"ND/TB/NB 22k; VT/PT/YB 25k/ngày","inputs_required":"CN làm việc · chi nhánh","outputs":"Tiền ăn ca CN","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXT-20251128-753","scope":"RIÊNG-LX-T","effective_from":"28/11/2025","supersedes":"—","fragment_id":"FRG-LXT-PC-753","fragment_type":"PHU_CAP","rule_text_vi":"QĐ 753 — chi phụ cấp hỗ trợ NV lái xe tuyến","parameters":"(PL OCR)","inputs_required":"vị trí LX","outputs":"Phụ cấp LX","system_home":"policy_rule","amis_neo":"2","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXT-20251213-816","scope":"RIÊNG-LX-T","effective_from":"13/12/2025","supersedes":"—","fragment_id":"FRG-LXT-816","fragment_type":"KHAC","rule_text_vi":"QĐ 816 — điều chỉnh CS lương LX tuyến VTHK","parameters":"(PL 2 trang)","inputs_required":"—","outputs":"Điều chỉnh cơ chế","system_home":"policy_rule","amis_neo":"1","xevn_today":"MISSING","overrides":"partial FRG-LXT-*","extends":"—"},
    {"doc_id":"POL-LXT-20251223-837","scope":"RIÊNG-LX-T","effective_from":"23/12/2025","supersedes":"—","fragment_id":"FRG-LXT-NB-837","fragment_type":"DOANH_THU","rule_text_vi":"QĐ 837 — cách tính lương lượt tuyến Nội Bài","parameters":"100–200k/lượt + 4% DT","inputs_required":"lượt NB","outputs":"Lương lượt NB","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-LXT-HD-02","extends":"—"},
    {"doc_id":"POL-LXT-20251230-NB","scope":"RIÊNG-LX-T","effective_from":"30/12/2025","supersedes":"—","fragment_id":"FRG-LXT-DCNB","fragment_type":"KHAC","rule_text_vi":"LX điều chuyển sang Ninh Bình — chính sách lương riêng","parameters":"(OCR)","inputs_required":"điều chuyển · tỉnh đích","outputs":"Mẫu lương NB","system_home":"template_override","amis_neo":"3","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXT-20260326-169","scope":"RIÊNG-LX-T","effective_from":"01/04/2026","supersedes":"—","fragment_id":"FRG-LXT-CC-169","fragment_type":"CHUYEN_CAN","rule_text_vi":"Thưởng chuyên cần LX: ≥24 ngày công, không nghỉ T6–CN","parameters":"1_000_000 VND/người/tháng; đến 31/05/2026","inputs_required":"BCC ngày · nghỉ T6–CN","outputs":"Thưởng chuyên cần","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXT-DX-YB","scope":"RIÊNG-LX-T","effective_from":"—","supersedes":"—","fragment_id":"FRG-LXT-YB-DX","fragment_type":"KHAC","rule_text_vi":"Đề xuất chuyển đổi hình thức trả lương Tăng cường Yên Bái dài ngày","parameters":"(đề xuất — chưa QĐ)","inputs_required":"lượt TC YB","outputs":"Cơ chế trả lương YB","system_home":"MANUAL","amis_neo":"—","xevn_today":"MISSING","overrides":"—","extends":"—"},
    # === LX-TR ===
    {"doc_id":"POL-LXTR-20260401-206","scope":"RIÊNG-LX-TR","effective_from":"01/04/2026","supersedes":"QĐ 758C/2025","fragment_id":"FRG-LXTR-BASE-01","fragment_type":"KHAC","rule_text_vi":"TTN LX tải = Lương cứng + Lương QLPT + Thưởng DT + PC đặc thù + KPI(CPN) − GT","parameters":"—","inputs_required":"DT · BCC · tải trọng xe · XDTN","outputs":"Tổng thu nhập LX tải","system_home":"policy_rule","amis_neo":"4–5","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXTR-20260401-206","scope":"RIÊNG-LX-TR","effective_from":"01/04/2026","supersedes":"—","fragment_id":"FRG-LXTR-CUNG-01","fragment_type":"HE_SO","rule_text_vi":"Lương cứng theo vị trí & tải trọng xe (PL1)","parameters":"Theo PL1 QĐ 206","inputs_required":"loại xe · ngày công","outputs":"Lương cứng","system_home":"policy_rule","amis_neo":"2","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXTR-20260401-206","scope":"RIÊNG-LX-TR","effective_from":"01/04/2026","supersedes":"—","fragment_id":"FRG-LXTR-QLPT-01","fragment_type":"PHU_CAP","rule_text_vi":"Lương trách nhiệm QLPT","parameters":"PL1+PL2 giảm trừ QLPT","inputs_required":"ngày QL xe","outputs":"Lương QLPT","system_home":"policy_rule","amis_neo":"2","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXTR-20260401-206","scope":"RIÊNG-LX-TR","effective_from":"01/04/2026","supersedes":"—","fragment_id":"FRG-LXTR-DT-01","fragment_type":"THUONG","rule_text_vi":"Thưởng doanh thu theo DT thực & bậc (6.3)","parameters":"Mức DT hỗ trợ vs mục tiêu; tỷ lệ thưởng bảng","inputs_required":"DT tháng · loại xe","outputs":"Thưởng DT","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXTR-20260401-206","scope":"RIÊNG-LX-TR","effective_from":"01/04/2026","supersedes":"—","fragment_id":"FRG-LXTR-KPI-01","fragment_type":"KPI","rule_text_vi":"Lương KPI — chỉ lái tải trung chuyển CPN","parameters":"Đánh giá HTCV tháng","inputs_required":"KPI CPN","outputs":"Lương KPI","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXTR-20260401-206","scope":"RIÊNG-LX-TR","effective_from":"01/04/2026","supersedes":"—","fragment_id":"FRG-LXTR-TV-01","fragment_type":"THU_VIEC","rule_text_vi":"TV LX tải: 85% lương cứng + QLPT; các khoản khác như CT","parameters":"TV=85% cứng+QLPT","inputs_required":"flag TV","outputs":"Hệ số TV","system_home":"policy_rule","amis_neo":"1","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXTR-20260401-206","scope":"RIÊNG-LX-TR","effective_from":"01/04/2026","supersedes":"—","fragment_id":"FRG-LXTR-PC-01","fragment_type":"PHU_CAP","rule_text_vi":"PC giao hàng phân phối & PC khác (XDTN, đi đường)","parameters":"Theo phát sinh","inputs_required":"DT phân phối · km","outputs":"PC đặc thù","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-LXTR-20260401-NL","scope":"RIÊNG-LX-TR","effective_from":"01/04/2026","supersedes":"—","fragment_id":"FRG-LXTR-NL-01","fragment_type":"KHOAN","rule_text_vi":"Thông báo thay đổi mức khoán nhiên liệu theo dòng xe","parameters":"(bảng NL 2 trang OCR)","inputs_required":"dòng xe · km","outputs":"Khoán NL","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    # === VP-T ===
    {"doc_id":"POL-VPT-20201001-ND","scope":"RIÊNG-VP-T","effective_from":"01/10/2020","supersedes":"—","fragment_id":"FRG-VPT-BASE-01","fragment_type":"KHAC","rule_text_vi":"Quỹ lương CN = (A) NV + (B) tổng + (C) chi phí − (D) TV","parameters":"A=phân bổ quỹ; B=7k/khách+500k/xe; C=CP VP","inputs_required":"số khách · số xe · CP · BCC","outputs":"Quỹ lương VP","system_home":"policy_rule","amis_neo":"4–5","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-VPT-20201001-ND","scope":"RIÊNG-VP-T","effective_from":"01/10/2020","supersedes":"—","fragment_id":"FRG-VPT-HS-01","fragment_type":"HE_SO","rule_text_vi":"Hệ số lương theo chức vụ CN (TCN=20 … KT=12)","parameters":"TCN 20; ĐH 17; LXTC 16; KT 12","inputs_required":"chức vụ · giờ công","outputs":"Hệ số hưởng","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-VPT-20201001-ND","scope":"RIÊNG-VP-T","effective_from":"01/10/2020","supersedes":"—","fragment_id":"FRG-VPT-CONG-01","fragment_type":"KHAC","rule_text_vi":"Giờ công TT 220–290h/tháng; quy đổi hệ số → đơn giá → tổng lương","parameters":"HSQĐ = tổng HS / tổng giờ; TL = HS hưởng × đơn giá","inputs_required":"BCC máy · giờ OT","outputs":"Lương VP","system_home":"policy_rule","amis_neo":"4","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-VPT-20201001-ND","scope":"RIÊNG-VP-T","effective_from":"01/10/2020","supersedes":"—","fragment_id":"FRG-VPT-TV-01","fragment_type":"THU_VIEC","rule_text_vi":"TV VP: lương cứng/ngày × ngày TT","parameters":"TCN 10M; ĐH 8M; LXTC 8M; KT 5.5M/tháng chuẩn","inputs_required":"flag TV · ngày công","outputs":"Lương TV","system_home":"policy_rule","amis_neo":"1","xevn_today":"MISSING","overrides":"—","extends":"—"},
    {"doc_id":"POL-VPT-20201001-NB","scope":"RIÊNG-VP-T","effective_from":"01/10/2020","supersedes":"—","fragment_id":"FRG-VPT-NB-01","fragment_type":"KHAC","rule_text_vi":"Quy chế VP Ninh Bình — cùng khung QT-XeVN, biên CN NB","parameters":"Tương tự ND; áp CN Ninh Bình","inputs_required":"CN=NB","outputs":"Lương VP NB","system_home":"template_override","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-VPT-BASE-01","extends":"—"},
    {"doc_id":"POL-VPT-20201001-TB","scope":"RIÊNG-VP-T","effective_from":"01/10/2020","supersedes":"—","fragment_id":"FRG-VPT-TB-01","fragment_type":"KHAC","rule_text_vi":"Quy chế VP Thái Bình — cùng khung QT-XeVN","parameters":"CN Thái Bình","inputs_required":"CN=TB","outputs":"Lương VP TB","system_home":"template_override","amis_neo":"4","xevn_today":"MISSING","overrides":"FRG-VPT-BASE-01","extends":"—"},
]
# fmt: on

DOCS = [
    # (doc_id, scope, rel_path_under_pack, effective_from, supersedes, pages)
    ("POL-CHUNG-20260102-2A", "CHUNG", "Chính sách chung/2026.01.02 QĐ 2A vv ban hành hệ thống thang lương, bảng lương.pdf", "01/01/2026", "—", 3),
    ("POL-CHUNG-20250601-127A", "CHUNG", "Chính sách chung/2025.06.01 QĐ 127A vv điều chỉnh Phụ lục Quy chế lương số 17.2025.QĐ-X.E.pdf", "01/06/2025", "PL QĐ 17/2025", 5),
    ("POL-DPHH-20220401-001", "RIÊNG-ĐPHH", "1. Điều phối hàng hóa/.../2022.04.01 Quy chế lương điều phối.pdf", "01/04/2022", "—", 5),
    ("POL-DPHH-20240422-044", "RIÊNG-ĐPHH", ".../2024.04.22 Chính sách thưởng doanh thu giao hàng...", "22/04/2024", "CS ship cũ", 3),
    ("POL-DPHH-20240710-DX", "RIÊNG-ĐPHH", ".../2024.07.10 Điều chỉnh tỷ lệ hưởng DT giao hàng...", "01/07/2024", "—", 1),
    ("POL-DPHH-20241003-4034", "RIÊNG-ĐPHH", ".../2024.10.03 Điều chỉnh tỷ lệ hưởng HH DT hàng gửi,nhận.pdf", "01/10/2024", "QC ĐPHH §DT", 2),
    ("POL-DPHH-20250218-TV", "RIÊNG-ĐPHH", ".../2025.02.18 Điều chỉnh cách tính lương ĐPHH thử việc.pdf", "01/12/2024", "FRG-DPHH-TV-01", 1),
    ("POL-DPHH-20250404-TDN", "RIÊNG-ĐPHH", ".../2025.04.04 Điều chỉnh thời gian LV và mức lương VP TDN.pdf", "04/04/2025", "—", 1),
    ("POL-DPHH-20250822-SHIP", "RIÊNG-ĐPHH", ".../2025.08.22 Điều chỉnh cách tính lương ship ĐPHH.pdf", "22/08/2025", "FRG-DPHH-SHIP-01", 1),
    ("POL-TDHK-20240619-1500", "RIÊNG-TĐHK", ".../2024.06.19 QĐ Quy chế tinh lương kpi tổng đài 1500.pdf", "01/07/2024", "—", 5),
    ("POL-TDHK-20250918-TV", "RIÊNG-TĐHK", ".../2025.09.18 Điều chỉnh mức lương thử việc tổng đài.pdf", "01/09/2025", "—", 1),
    ("POL-TDHK-20251128-752", "RIÊNG-TĐHK", ".../2025.11.28 QĐ 752 chi phụ cấp tổng đài.pdf", "28/11/2025", "—", 1),
    ("POL-LXT-20200901-ND", "RIÊNG-LX-T", ".../2020.09.01 XEVN_Nam Định_Quy chế lương lái tuyến.pdf", "01/09/2020", "—", 6),
    ("POL-LXT-20200901-NB", "RIÊNG-LX-T", ".../2020.09.01 XEVN_Ninh Bình_Quy chế...", "01/09/2020", "—", 6),
    ("POL-LXT-20200901-TB", "RIÊNG-LX-T", ".../2020.10.01 X.EVN_Thái Bình_Quy chế...", "01/10/2020", "—", 6),
    ("POL-LXT-20230828-HD", "RIÊNG-LX-T", ".../2023.08.28 QĐ điều chỉnh lương HĐ khác tỉnh...", "28/08/2023", "FRG-LXT-HD-01", 1),
    ("POL-LXT-20231001-PT", "RIÊNG-LX-T", ".../2023.10.01 QC Quy chế lương tuyến Phú Thọ...", "01/10/2023", "QC tỉnh cũ", 6),
    ("POL-LXT-20250905-VTP", "RIÊNG-LX-T", ".../2025.09.05 Đề xuất đơn giá lượt VT, PT...", "01/07/2025", "—", 1),
    ("POL-LXT-20251029-439", "RIÊNG-LX-T", ".../2025.10.29 QĐ 439 điều chỉnh cơ chế LX tuyến.pdf", "01/09/2025", "QĐ 1023/2024", 2),
    ("POL-LXT-20251128-753", "RIÊNG-LX-T", ".../2025.11.28 QĐ 753 chi phụ cấp LX tuyến.pdf", "28/11/2025", "—", 1),
    ("POL-LXT-20251213-816", "RIÊNG-LX-T", ".../2025.12.13 QĐ 816 điều chỉnh CS LX tuyến.pdf", "13/12/2025", "—", 2),
    ("POL-LXT-20251223-837", "RIÊNG-LX-T", ".../2025.12.23 QĐ 837 lương lượt tuyến Nội Bài.pdf", "23/12/2025", "—", 1),
    ("POL-LXT-20251230-NB", "RIÊNG-LX-T", ".../2025.12.30 CS LX điều chuyển sang Ninh Bình.pdf", "30/12/2025", "—", 1),
    ("POL-LXT-20260326-169", "RIÊNG-LX-T", ".../2026.03.26 QĐ 169 thưởng chuyên cần LX.pdf", "01/04/2026", "—", 1),
    ("POL-LXT-DX-YB", "RIÊNG-LX-T", ".../Đề xuất chuyển đổi trả lương TC Yên Bái dài ngày.pdf", "—", "—", 1),
    ("POL-LXTR-20260401-206", "RIÊNG-LX-TR", ".../2026.04.01 QĐ 206 sửa đổi CS lương LX tải.pdf", "01/04/2026", "QĐ 758C/2025", 8),
    ("POL-LXTR-20260401-NL", "RIÊNG-LX-TR", ".../2026.04.01 Thông báo khoán NL xe tải.pdf", "01/04/2026", "—", 2),
    ("POL-VPT-20201001-ND", "RIÊNG-VP-T", ".../2020.10.01 X.EVN_Nam Định_Quy chế lương văn phòng.pdf", "01/10/2020", "—", 7),
    ("POL-VPT-20201001-NB", "RIÊNG-VP-T", ".../2020.10.01 X.EVN_Ninh Bình_Quy chế VP.pdf", "01/10/2020", "—", 7),
    ("POL-VPT-20201001-TB", "RIÊNG-VP-T", ".../2020.10.01 XEVN_Thái Bình_Quy chế VP.pdf", "01/10/2020", "—", 7),
]

DOC_OCR_HINT: dict[str, str] = {
    "POL-CHUNG-20260102-2A": "2026.01.02 QĐ 2A",
    "POL-CHUNG-20250601-127A": "2025.06.01 QĐ 127A",
    "POL-DPHH-20220401-001": "2022.04.01 Quy chế lương điều phối",
    "POL-DPHH-20240422-044": "2024.04.22 Chính sách thưởng doanh thu",
    "POL-DPHH-20240710-DX": "2024.07.10 Điều chỉnh tỷ lệ",
    "POL-DPHH-20241003-4034": "2024.10.03 Điều chỉnh tỷ lệ hưởng hoa hồng",
    "POL-DPHH-20250218-TV": "2025.02.18 Điều chỉnh cách tính lương Điều phối",
    "POL-DPHH-20250404-TDN": "2025.04.04 Điều chỉnh thời gian",
    "POL-DPHH-20250822-SHIP": "2025.08.22 Điều chỉnh cách tính lương ship",
    "POL-TDHK-20240619-1500": "2024.06.19 QĐ_Quy chế tinh lương kpi",
    "POL-TDHK-20250918-TV": "2025.09.18 Điều chỉnh mức lương thử việc",
    "POL-TDHK-20251128-752": "2025.11.28 QĐ 752",
    "POL-LXT-20200901-ND": "XEVN_Nam Định_Quy chế lương lái tuyến",
    "POL-LXT-20200901-NB": "XEVN_Ninh Bình_Quy chế lương lái tuyến",
    "POL-LXT-20200901-TB": "X.EVN_Thái Bình_Quy chế lương lái tuyến",
    "POL-LXT-20230828-HD": "2023.08.28 Quyết định 280823",
    "POL-LXT-20231001-PT": "2023.10.01 QC_Quy chế lương tuyến Tỉnh Phú Thọ",
    "POL-LXT-20250905-VTP": "2025.09.05 Đề xuất đơn giá lượt",
    "POL-LXT-20251029-439": "2025.10.29 QĐ 439",
    "POL-LXT-20251128-753": "2025.11.28 QĐ 753",
    "POL-LXT-20251213-816": "2025.12.13 QĐ 816",
    "POL-LXT-20251223-837": "2025.12.23 QĐ 837",
    "POL-LXT-20251230-NB": "2025.12.30 Chính sách lương cho lái xe tuyến",
    "POL-LXT-20260326-169": "2026.03.26. QĐ 169",
    "POL-LXT-DX-YB": "Đề xuất chuyển đổi hình thức trả lương Tăng cường Yên Bái",
    "POL-LXTR-20260401-206": "2026.04.01 QĐ 206",
    "POL-LXTR-20260401-NL": "mức khoán nhiên liệu",
    "POL-VPT-20201001-ND": "X.EVN_Nam Định_Quy chế lương văn phòng",
    "POL-VPT-20201001-NB": "X.EVN_Ninh Bình_Quy chế lương văn phòng",
    "POL-VPT-20201001-TB": "XEVN_Thái Bình_Quy chế lương văn phòng",
}


def find_ocr_row(doc_id: str, rel_path: str, ocr_list: list[dict]) -> dict | None:
    for r in ocr_list:
        if r["rel"] == rel_path:
            return r
    hint = DOC_OCR_HINT.get(doc_id, "")
    if hint:
        for r in ocr_list:
            if hint in r["rel"]:
                return r
    return None

XLSX_HINTS = {
    "RIÊNG-ĐPHH": ["Phiếu lương ĐP", "PL Hưởng doanh thu", "DLL CPN"],
    "RIÊNG-TĐHK": ["Lương thời gian", "Lương KPI", "Điểm KPI", "P1+P2", "P3", "P4", "OT 150%", "OT 200%"],
    "RIÊNG-LX-T": ["Lương lượt", "Lương CLDV", "CPSC", "Lương hợp đồng", "Chuyển phát nhanh", "Đơn giá lượt"],
    "RIÊNG-LX-TR": ["Lương cứng", "QLPT", "Doanh thu", "Phụ cấp XDTN", "Phụ cấp đi đường", "Tạm ứng"],
    "RIÊNG-VP-T": ["Lương VP", "Quỹ lương VP", "Trợ lương", "Chi phí VP"],
    "CHUNG": ["Mức lương CB (P1)", "TNBS (P2)", "Lương KPI (P3)", "P4", "BHXH", "Thuế TNCN"],
}


def row(cells: list[str]) -> str:
    return "| " + " | ".join(cells) + " |"


def main() -> None:
    ocr = json.loads(OCR_INDEX.read_text(encoding="utf-8"))
    lines: list[str] = [
        "# PO-HRM-PAY-CNTT — Policy Fragment Catalog (Master SoT)",
        "",
        "| Meta | Value |",
        "|------|--------|",
        "| **work_item_id** | `PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01` |",
        "| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |",
        "| **method** | `PO-HRM-PAY-CNTT-POLICY-READ-METHOD.md` |",
        "| **date** | 2026-08-11 |",
        "| **pdf_count** | 30/30 (EasyOCR scanned pack) |",
        "| **fragment_count** | " + str(len(FRAGMENTS)) + " |",
        "| **honesty** | `payroll_e2e_ready=false` · governance catalog ≠ UAT |",
        "",
        "## 1. CHUNG vs RIÊNG (phân định mô hình)",
        "",
        row(["Mã mô hình", "Scope", "PDF pack", "Ghi chú"]),
        row(["---", "---", "---", "---"]),
        row(["**CHUNG**", "CHUNG", "2", "QĐ 2A thang/bảng lương · QĐ 127A TNBS/KPD"]),
        row(["**ĐPHH**", "RIÊNG-ĐPHH", "7", "KPI+DT+ship; override thang local"]),
        row(["**TĐHK**", "RIÊNG-TĐHK", "3", "KPI 1500/1731 · cuộc/HĐ/TG/Top"]),
        row(["**TG**", "(không PDF riêng)", "0", "Dùng CHUNG + mẫu VP Hà Nội xlsx"]),
        row(["**LX-T**", "RIÊNG-LX-T", "13", "QC theo tỉnh + QĐ 439/816/837…"]),
        row(["**LX-TR**", "RIÊNG-LX-TR", "2", "QĐ 206 + khoán NL"]),
        row(["**VP-T**", "RIÊNG-VP-T", "3", "QC chấm công+quỹ CN (ND/NB/TB)"]),
        "",
        "## 2. Chuỗi thay thế (supersedes)",
        "",
        "```mermaid",
        "flowchart TD",
        "  CHUNG2A[QĐ 2A 2026] --> ALL[Baseline CB toàn group]",
        "  CHUNG127A[QĐ 127A 2025] --> TNBS[TNBS/KPD PL]",
        "  DPHH22[QC ĐPHH 2022] --> DPHH24[CS ship 2024]",
        "  DPHH22 --> DPHH2410[QĐ 4034 HH 2024]",
        "  DPHH24 --> DPHH2508[Ship 2025]",
        "  DPHH22 --> DPHHTV25[TV ĐPHH 2025]",
        "  LXT20[QC tỉnh 2020] --> LXT439[QĐ 439 2025]",
        "  LXT439 --> LXT816[QĐ 816 2025]",
        "  LXTR758[QĐ 758C/2025] --> LXTR206[QĐ 206 2026]",
        "```",
        "",
        "## 3. Document inventory (30 PDF)",
        "",
        row(["doc_id", "scope", "effective_from", "supersedes", "pages", "ocr_chars"]),
        row(["---"] * 6),
    ]
    ocr_by_rel = {r["rel"]: r for r in ocr}
    for doc_id, scope, rel_path, eff, sup, pages in DOCS:
        ocr_row = find_ocr_row(doc_id, rel_path, ocr)
        if ocr_row:
            chars = str(ocr_row["chars"])
            pages = str(ocr_row.get("pages", pages))
        else:
            chars = "—"
        lines.append(row([doc_id, scope, eff, sup, str(pages), chars]))
    lines += [
        "",
        "## 4. Master fragment catalog",
        "",
        row([
            "fragment_id", "doc_id", "scope", "effective_from", "fragment_type",
            "rule_text_vi", "parameters", "inputs_required", "outputs",
            "system_home", "amis_neo", "xevn_today", "overrides", "extends",
        ]),
        row(["---"] * 14),
    ]
    for f in FRAGMENTS:
        lines.append(row([
            f["fragment_id"], f["doc_id"], f["scope"], f["effective_from"], f["fragment_type"],
            f["rule_text_vi"][:120], f["parameters"][:80], f["inputs_required"][:60],
            f["outputs"][:50], f["system_home"], f["amis_neo"], f["xevn_today"],
            f["overrides"], f["extends"],
        ]))
    lines += [
        "",
        "## 5. Override vs extend CHUNG",
        "",
        row(["fragment_id", "Quan hệ", "CHUNG bị ảnh hưởng", "Ghi chú"]),
        row(["---", "---", "---", "---"]),
        row(["FRG-DPHH-THANG-01", "**override**", "FRG-CHUNG-2A-04", "Thang bậc ĐPHH local"]),
        row(["FRG-DPHH-TV-02", "**override**", "TV % CHUNG", "TV chỉ hưởng 85% DT"]),
        row(["FRG-DPHH-DT-HG-02", "**override**", "FRG-DPHH-DT-HG-01", "QĐ 4034"]),
        row(["FRG-LXT-QD439-LUOT", "**override**", "FRG-LXT-LUOT-*", "Đơn giá lượt tập trung"]),
        row(["FRG-TDHK-*", "**extend**", "CHUNG P1–P4", "Thêm cuộc/HĐ/Top"]),
        row(["FRG-LXT-*", "**extend**", "CHUNG", "Lượt/CLDV/CPSC — không thay thang"]),
        row(["FRG-VPT-BASE-01", "**extend**", "CHUNG", "Quỹ CN — khác công thức TG"]),
        row(["FRG-LXTR-*", "**extend**", "CHUNG", "DT-driven; không OT/phép Tết"]),
        "",
        "## 6. Gợi ý map cột XLSX → fragment_id (handoff ba-data)",
        "",
    ]
    for scope, cols in XLSX_HINTS.items():
        lines.append(f"### {scope}")
        lines.append("")
        for col in cols:
            frag = next((f["fragment_id"] for f in FRAGMENTS if scope in f["scope"] or scope == "CHUNG"), "TBD")
            lines.append(f"- `{col}` → `{frag}` (ba-data xác nhận cột chính xác)")
        lines.append("")
    lines += [
        "## 7. Rủi ro / residual",
        "",
        "| # | Rủi ro | Owner |",
        "|---|--------|-------|",
        "| R1 | PDF scan — OCR lỗi ký tự số (%/VND) | ba-data verify vs PDF gốc |",
        "| R2 | TG không có PDF — chỉ xlsx VP HN | ba-process: inherit CHUNG |",
        "| R3 | 6 tỉnh VP xlsx nhưng 3 PDF QC — gap PT/VT/YB | SA multi-template |",
        "| R4 | Product chưa policy_pack metadata | SA `PO-HRM-PAY-CNTT-SA-01` |",
        "",
        "**ack_status:** PASS_TO_PM",
    ]
    OUT.write_text("\n".join(lines), encoding="utf-8")

    evidence = f"""# Evidence — PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01` |
| **from_role** | ba-process |
| **to_role** | pm → ba-data |
| **ack_status** | **PASS_TO_PM** |
| **pdf_read** | 30/30 via EasyOCR (`docs/qa/evidence/_tmp-po-hrm-pay-cntt-pdf-ocr/`) |
| **primary_sot** | `docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` |
| **fragments** | {len(FRAGMENTS)} rows |

## Method
1. OCR toàn bộ 30 PDF scan (pypdf text-empty → EasyOCR vi+en).
2. Phân lớp CHUNG vs RIÊNG theo folder + nội dung.
3. Trích parameters, inputs, outputs, supersedes, override/extend.
4. Đối chiếu header xlsx mẫu (`_tmp-po-hrm-pay-cntt-xlsx-scan/`).

## Closed
- Master fragment catalog SoT
- Supersedes graph + override matrix
- Per-model xlsx column hints for ba-data

## Residual
- OCR số liệu PL đầy đủ → ba-data double-check PDF gốc
- TG: không PDF — map từ xlsx VP HN + CHUNG
- `xevn_today`: all fragments MISSING/PARTIAL (engine absent)

## next_owner
`ba-data` — `PO-HRM-PAY-CNTT-BA-DATA-01`

## next_dispatch_prompt (copy-ready)

```
work_item_id: PO-HRM-PAY-CNTT-BA-DATA-01
role: ba-data
parent: PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01
read_first:
  - docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md (§4 fragment_id + §6 xlsx hints)
  - docs/từ khách hàng/Gửi P.CNTT/**/*.xlsx (done templates per model)
  - docs/qa/evidence/_tmp-po-hrm-pay-cntt-xlsx-scan/
task:
  1. Map every payroll xlsx column (all sheets) → fragment_id from catalog §4.
  2. Produce COLUMN_MAP matrix: model · sheet · column · fragment_id · data_type · source_system.
  3. Flag columns with no fragment (gap) vs CHUNG-only vs RIÊNG override.
  4. Cross-check numeric parameters in catalog vs OCR txt (R1 residual).
exit_criteria:
  - docs/program/specs/PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md
  - docs/qa/evidence/po-hrm-pay-cntt-ba-data-01.md
  - ack_status PASS_TO_PM → sa (PO-HRM-PAY-CNTT-SA-01 multi-template)
lane: governance · no apps/**
```
"""
    EVIDENCE.write_text(evidence, encoding="utf-8")
    print(f"Wrote {OUT} ({len(FRAGMENTS)} fragments)")
    print(f"Wrote {EVIDENCE}")


if __name__ == "__main__":
    main()
