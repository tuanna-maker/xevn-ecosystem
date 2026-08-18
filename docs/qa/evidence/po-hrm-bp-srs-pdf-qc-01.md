# QC Gate — PO-HRM-BP-SRS-PDF-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-SRS-PDF-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **lane** | governance · **docs spot only** (không browser product) |
| **date** | 2026-08-04 |
| **prior_ba** | `docs/qa/evidence/po-hrm-bp-srs-pdf-khach-01.md` (PASS_TO_PM) |
| **prior_qc** | `po-hrm-bp-docs-qc-02.md` — R-QC-01 / R-QC-02 **CLOSED** |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** (docs) |
| **no_prompt_echo** | true (audit rule) |

**Không claim:** SRS đã confirm khách · Q-PAY / Q-* đã chốt · TechSpec/DB/API mở · Dev coding · Phase 1 / UAT / implement DONE · 28 UC đủ 7 mục kỹ thuật.

---

## Classification

| Class | Finding |
|-------|---------|
| **Process / docs hygiene** | PDF KHACH tồn tại · Unicode VI đọc được · Mục lục / 6 chương · body khách không `work_item` / `PO-HRM-*` / pipeline meta |
| **SRS structure v0.5** | **16** FR ưu tiên đủ 7 mục + `sequenceDiagram`; **28** UC §3.A đủ khung (mục đích · diễn biến · quy tắc · đạt/không đạt); tổng **44/44** header unique |
| **Decision integrity** | Q-* vẫn «chờ chốt» / README «chưa xác nhận» — **không** invent closed |
| **Product / implement** | N/A — docs only |
| **ENV / stack** | N/A |

---

## Deliverables verified

| Artifact | Path | QC |
|----------|------|-----|
| PDF gửi khách | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE_KHACH.pdf` | **PASS** — tồn tại · **62** trang · ~273 KB · extract `pypdf` OK |
| SRS markdown | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | **PASS** — stamp **v0.5** · 44 FR-UC headers |
| README | `docs/client-delivery/hrm-enterprise-blueprint/README_SPONSOR_REVIEW.md` | **PASS** — mục **#0** = PDF; **#1** = `WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx` |
| Excel MOI | `docs/client-delivery/hrm-enterprise-blueprint/WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx` | **PASS** — tồn tại (README trỏ đúng) |

---

## Audit checklist

| # | Tiêu chí | Kết quả | Evidence |
|---|----------|---------|----------|
| 1 | PDF mở / extract được; Unicode Việt sample | **PASS** | Trang 1: «ĐẶC TẢ YÊU CẦU…», «Tuyển dụng», «Chấm công», «Phiên bản 0.5»; giữa file: «Mục đích» / «Diễn biến»; cuối: «Đạt / không đạt», «4. Yêu cầu phi chức năng» |
| 2 | Mục lục / cấu trúc gửi khách (6 chương) | **PASS** | Extract có «Mục lục»; markers chương 1…6; PDF ghi 44 tình huống · 16 đầy đủ · 28 khung |
| 3 | Không meta work_item / PO-HRM / pipeline team trong body khách | **PASS** | Grep SRS md + README: `work_item` / `PO-HRM-BP` / `PASS_TO_PM` / `DISPATCHED` / `ba-docs` / `ack_status` = **0**. PDF extract: cùng banned set = **0** |
| 4 | 16 FR ưu tiên đủ sequenceDiagram + Diễn biến (7 mục) | **PASS** | `sequenceDiagram` trong khối ưu tiên = **16**; mỗi FR có: Thông tin chung · Dữ liệu đầu vào · Luồng chính · Quy tắc · Trường hợp đặc biệt · sequenceDiagram · Diễn biến nghiệp vụ |
| 5 | 28 UC lịch — mục đích / diễn biến / quy tắc / đạt tối thiểu (ADD-only) | **PASS** | 28/28 §3.A có Mục đích · Luồng chính/diễn biến · Quy tắc · Đạt/không đạt; không wipe 16 FR |
| 6 | Không invent Q-* closed / SRS customer-confirm / TechSpec mở | **PASS** | SRS: «không khẳng định khách đã ký»; Q-* «chờ chốt» (nhiều chỗ); README: Q-PAY «chưa xác nhận khách»; HOLD TechSpec/DB/API |
| 7 | README trỏ PDF + Excel MOI | **PASS** | #0 PDF · #1 MOI.xlsx (+ fallback KHACH.xlsx) · stamp v0.5 / 44 / 16 / 28 |
| 8 | Prior R-QC-01 / R-QC-02 | **CLOSED** (inherited) | `po-hrm-bp-docs-qc-02.md` |

---

## Spot-check (docs)

| Sample | Kết quả |
|--------|---------|
| PDF p.1 cover VI | **PASS** — dấu đầy đủ (ĐẶC TẢ, Nghỉ phép, Tiền lương) |
| PDF mid FR-UC-BP-REC-07 | **PASS** — Mục đích / Tác nhân / Diễn biến bảng |
| PDF near-end PAY-09 + §4 | **PASS** — Đạt/không đạt; chuyển chương 4 NFR |
| FR ưu tiên REC-01 / PAY-01 | **PASS** — đủ 7 mục (đọc MD) |
| UC §3.A REC-03 / PAY-09 | **PASS** — khung tối thiểu đủ |
| Q-PAY-FORMULA wording | **PASS** — đề xuất / chờ chốt; không «đã xác nhận khách» |

---

## Residual / Conditions

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PDF-OBS-01** | P2 OBS | ba-docs | **OPEN (non-blocking)** | `FR-UC-BP-REC-05` **Mục đích** trùng nguyên văn `REC-04` (copy-paste); thân diễn biến/BR của REC-05 vẫn đúng chủ đề lịch sử trạng thái — sửa polish trước wave docs kế / không chặn gửi PDF v0.5 |
| **R-QC-03** | P2 OBS | ba-docs | **OPEN (non-blocking)** | Thuật ngữ EN sót («pipeline» nghiệp vụ tuyển trên dashboard) — polish workshop; không meta team |
| **28 UC ≠ 7 mục** | by design | — | **Accepted** | Wave này chỉ khung; nâng đủ 7 mục sau khi khách chốt phạm vi |
| **Q-*** decisions | P0 business | partner / Ban dự án | **OPEN (by design)** | Không invent closed |
| **HOLD TechSpec/DB/API** | P0 process | — | **HOLD** | Đúng scope |

**Condition còn lại cho GWC (docs):** phạm vi GO = **gói PDF+README+Excel MOI sẵn sàng gửi review**; **không** = SRS confirmed · **không** = mở TechSpec/Dev · **không** = Phase 1 DONE.

---

## Verdict

**GO WITH CONDITIONS** (docs) — scope: SRS PDF KHACH v0.5 + markdown 16+28=44 + README #0/#1.

| Được | Không được |
|------|------------|
| PM gửi partner: PDF + Excel MOI (+ cover ghi Q-* chờ ký · HOLD kỹ thuật) | Claim khách đã ký SRS / Q-PAY |
| Đóng gate PDF spot QC-01 | Mở TechSpec / DB_DESIGN / API_DESIGN / `apps/**` |
| Optional ba-docs polish R-PDF-OBS-01 (REC-05 mục đích) | Claim UAT / implement DONE |

**L2.5 / UAT journey:** N/A — docs governance only.

---

## Evidence pack note

Gate = docs hygiene + PDF Unicode + FR/UC structure. Không chạy `verify:qc:evidence-pack` browser assets (không UF). Evidence path này là SoT QC-01 PDF.

---

## completion_report

- **Đóng:** Spot QC PDF 62 trang Unicode + Mục lục; SRS v0.5 = 16 FR đủ 7 mục + 28 UC khung (44 unique); banned meta 0 trên md/PDF/README; README trỏ PDF #0 + Excel MOI; Q-* / HOLD không invent closed; prior R-QC-01/02 vẫn CLOSED.
- **Mở (OBS):** R-PDF-OBS-01 REC-05 mục đích trùng REC-04; R-QC-03 EN polish; Q-* chờ partner.
- **Verdict:** **GO WITH CONDITIONS** (docs) — sẵn sàng `PO-HRM-BP-DOCS-SPONSOR-SEND-01`.

## next_owner

`pm` → **PO-HRM-BP-DOCS-SPONSOR-SEND-01** (cover + gửi PDF/Excel MOI).

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-DOCS-SPONSOR-SEND-01
from_role: pm
to_role: pm (sponsor cover)
lane: governance
priority: P1
no_prompt_echo: true
entry_criteria: QC GO WITH CONDITIONS docs — docs/qa/evidence/po-hrm-bp-srs-pdf-qc-01.md · PDF SRS_HRM_ENTERPRISE_KHACH.pdf v0.5
action:
  1) Gửi partner: README_SPONSOR_REVIEW v0.5 + SRS_HRM_ENTERPRISE_KHACH.pdf (#0) + WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx (#1)
  2) Cover ghi rõ: 44 UC · 16 FR đủ 7 mục · 28 UC khung · Decision Q-* chờ chữ ký · HOLD TechSpec/DB/API · chưa triển khai code · chưa confirm SRS
  3) Optional parallel ba-docs polish: sửa Mục đích FR-UC-BP-REC-05 (R-PDF-OBS-01) — không block gửi
cấm: invent Q-PAY closed · invent SRS customer confirm · mở TechSpec depth · apps/** · seed
evidence_path: docs/qa/evidence/po-hrm-bp-docs-sponsor-send-01.md (sau khi gửi)
ack_status target: PASS_TO_PM
```
