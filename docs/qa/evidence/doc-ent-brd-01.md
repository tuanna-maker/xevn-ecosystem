# Evidence — DOC-ENT-BRD-01

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-ENT-BRD-01` |
| **role** | ba-docs (governance) |
| **date** | 2026-08-03 |
| **deliverable** | `docs/brand-new-documents-20270801/BRD_NEW.md` v1.2 |
| **ack_status** | `PASS_TO_PM` |

---

## spec_read_ack

| # | Path | Sections used | Note |
|---|------|---------------|------|
| 1 | `docs/client-delivery/01_BRD_XeVN_OS.md` | — | **Không có file .md** trên disk; SoT khách HTML `01_BRD_XeVN_OS.html` (XEVN/BRD-XEVN-OS-001 v1.1). Nguồn markdown gốc dùng thay: `docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md` |
| 1b | `docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md` | §1–5, §7–8, §13–14, Phụ lục A (tham chiếu số 373/245/119) | ROOT SoT nghiệp vụ nâng cấp từ đây |
| 2 | `docs/brand-new-documents-20270801/BRD_NEW.md` | toàn bộ draft v1.0 | Bản Claude trùng lặp / tech-dump — remaster |
| 3 | `docs/program/governance/hrm-business-completeness-audit-20260524.md` | §1, §4 embed 8, §5 mobile, §7 TR-*, §8 AC backlog, UC-HRM-27 | Gap → nhu cầu §9 BRD (không nhét jargon QA vào body khách) |
| 4 | `docs/program/governance/PHASE1_UC_DELTA_AC_BR_20260524.md` | §1 cross-cut BR-SCOPE/MOCK/DATA/FID; §2.1 UC-HRM-20/21 | AC đo được → residual SRS |
| 5 | `docs/ENTERPRISE_HRM_BUSINESS_ANALYSIS_REPORT.md` | Module landscape, XBOS/HRM/Mobile gaps | Chỉ lấy nhu cầu nghiệp vụ; bỏ API/DB dump |
| 6 | `docs/HRM_BUSINESS_FLOWS_ANALYSIS_REPORT.md` | §3 luồng B/H/M | Xác nhận 5 luồng chính giữ từ gốc |
| 7 | `docs/standards/BRD_SRS_WRITING_STANDARDS.md` | §1 nguyên tắc BRD; §2 cấu trúc; Việt thuần; cấm lộ trình sprint trong BRD | Áp dụng lean (không full 9 chương + 373 dòng trong file NEW) |
| 8 | `_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` | §3.8–3.9 no_prompt_echo; dual-doc; BRD trước inventory SRS | Chất lượng khách |
| 9 | Skill `client-delivery-brd-srs` + `.claude/skills/enterprise-docs` | BRD khách = nghiệp vụ; không meta pipeline | Đã đọc |

---

## What kept from gốc (01_BRD / BRD_TONG_HOP)

- Mã tài liệu `XEVN/BRD-XEVN-OS-001`; quy mô **373 UC · 183 danh mục · 245 GĐ1 · 128 GĐ2**.
- Bốn thành phần: Cổng · XBOS · HRM · Logistic; XBOS = chuẩn, HRM/Logistic = giao dịch.
- Pain → impact (silo, chuẩn hóa, onboarding, chấm công/lương, audit, cách ly công ty).
- Phạm vi GĐ1/GĐ2 và ngoài phạm vi CRM/ERP/AI.
- Vai trò người dùng (tập đoàn → công ty → HR → QL → NV).
- Quy tắc BR-ECO-SCOPE / CAT; soft-delete; phê duyệt tập trung.
- Tiêu chí nghiệm thu catalog + cách ly + hộp thư duyệt.
- Một sequenceDiagram cấp cao XBOS↔HRM (rút gọn từ LUỒNG 6–9 gốc).

---

## What added from audit / research (business language in BRD §9)

| Gap (internal ID) | BRD client mapping | Không đưa vào prose khách |
|-------------------|--------------------|---------------------------|
| Embed 8 routes UC-HRM-20..27 | §6 capability + §9 hàng «Tám màn nhúng» | P-CC-*, L2, matrix `be`/`e2e_pass` |
| Fidelity / liên kết vệ tinh | §3 MT-05 · §8 BR-HRM-LINK-02 · §9 liên kết lực lượng lao động | AC-FID-*, seed, % density |
| Insurance list gap | §9 «Bảo hiểm… tách biệt hợp đồng» | `GET /insurance`, R-FID-01 |
| List→detail scope parity | §8 BR-HRM-LINK-01 · §9 điều hướng | J-HRM-*, 409 jargon |
| Mobile AC beyond login | §3 MT-06 · §9 di động | J-MOB-*, smoke-only |
| UC-HRM-27 stub | §4.2 ngoài nghiệm thu «đã vận hành» + §9 | `waived`, mock badge kỹ thuật |
| TR-01..10 traceability | §9 hàng truy vết + residual SRS dưới | Mã TR-* trên body khách |

---

## What cut as Claude fluff (draft v1.0)

- Trùng lặp mục 2/3 (hai khối «Bối cảnh» / «Mục tiêu» song song).
- Branding Unicom; English section titles (Pain Points, Document Control…).
- Tech dump: bcrypt cost, JWT TTL, HTTP error catalog làm xương sống BRD, port conflict 3001.
- Checklist AC kiểu API envelope / geofence HTTP — chuyển về residual SRS/TechSpec.
- Slogan / meta draft «Chờ phê duyệt Stakeholder trước khi chuyển sang SRS» kiểu chat.
- Không tạo gen script / file SoT phụ.

---

## Residual for SRS (next_owner)

| Residual | Owner đề xuất | Ghi chú |
|----------|---------------|---------|
| AC đo được cho UC-HRM-22..25 + cross-nav list→detail trong SRS § embed | ba-process | Audit: thiếu AC-U18-22..25; TR-07 |
| AC mobile per-UC (nghỉ, duyệt, payslip, offline idempotent) | ba-process | MG-01..06; không chỉ generic §9 |
| UC-HRM-27 — acceptance «chưa triển khai» rõ trên FR | ba-process | Khớp BRD §4.2 / §9 |
| Insurance list vs hợp đồng — FR/BR rõ | ba-process (+ sa nếu API) | EG-01 |
| Fidelity / liên kết vệ tinh — đưa AC nghiệp vụ vào SRS (không chỉ matrix nội bộ) | ba-process | AC-FID orphaned từ SRS §10 |
| Không claim Phase 1 HRM DONE trong SRS/HTML | mọi role | Khớp audit verdict |

**SRS status giả định:** còn mở (delta AC/BR) → **next_owner = ba-process**.

---

## Line count / quality check

| Check | Result |
|-------|--------|
| `BRD_NEW.md` lines | ~240 (bảng dày; tránh essay 300+) |
| no_prompt_echo | Không work_item/AS-IS-TO-BE/sponsor stamp/path repo trong body |
| Upgrade-not-replace | Giữ mã + phạm vi 373/245; không invent sản phẩm song song |
| allowed_paths only | `BRD_NEW.md` + evidence này |

---

## completion_report

Đã nâng cấp `BRD_NEW.md` → **v1.2** lean tiếng Việt: tóm tắt điều hành, bài toán, mục tiêu/KPI, phạm vi in-out, persona, bản đồ năng lực, luồng cấp cao (+1 Mermaid), BR cốt lõi, nhu cầu hoàn thiện HRM (§9), NFR, nghiệm thu, giả định. Giữ SoT từ BRD tổng hợp / HTML `01_BRD_XeVN_OS`; đóng gap audit ở mức nghiệp vụ; cắt fluff Claude. **Không** rewrite SRS/TechSpec/DB/API; **không** claim Phase 1 DONE.

## next_owner

`ba-process`

## next_dispatch_prompt

```text
work_item_id: DOC-ENT-SRS-01 (hoặc wave SRS delta HRM sau DOC-ENT-BRD-01)
role: ba-process
entry_criteria:
  - Đọc docs/brand-new-documents-20270801/BRD_NEW.md v1.2 §6–§9 + §11
  - Đọc docs/qa/evidence/doc-ent-brd-01.md (residual SRS)
  - Đọc docs/hrm/SRS.md §13 embed UC-HRM-20..27 + SRS mobile § AC
  - Đọc PHASE1_UC_DELTA_AC_BR_20260524.md + hrm-business-completeness-audit §4–§8
exit_criteria:
  - Delta AC/BR đo được cho: embed 8 (kể cross-nav), insurance vs hợp đồng, mobile J-journeys, UC-HRM-27 «chưa triển khai»
  - Không nhét P-CC/J-* vào HTML khách; mã AC nội bộ OK trong delta/matrix
  - evidence_path + PASS_TO_PM hoặc READY_FOR ba-docs nếu cần rebuild SRS HTML
forbidden: không sửa apps/**; không claim Phase 1 DONE
read_first: BRD_NEW.md v1.2 → audit HRM → delta AC → SRS HRM §13–14
```

## ack_status

`PASS_TO_PM`

## evidence_path

`docs/qa/evidence/doc-ent-brd-01.md`
