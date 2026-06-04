# Sprint S0 — Tổng kết (Sprint Review)

**Sprint:** S0 · Pilot zero-defect  
**Ngày review:** 2026-05-23  
**PM:** điều phối · **QC:** **GO WITH CONDITIONS** `P1-S0-QC-01` (2026-05-23)

## Mục tiêu sprint

Ổn định Command Center HRM embed P-CC-01..08; không lỗi load khi pilot `ceo@xe.vn`.

## Kết quả (user-facing)

| Chỉ số | Kết quả |
|--------|---------|
| L2 pilot smoke P-CC-01..08 | **11/11 PASS** |
| L1 system UAT | **37/37 PASS** (phiên trước) |
| L0 stack | **PASS** |
| Mobile regression | **PASS** |

**Sprint S0 — đạt mục tiêu pilot route** (QC **GO WITH CONDITIONS** — `docs/qa/evidence/qc-scrum-s0-hrm-embed-20260523.md`).

## Việc đã giao và hoàn thành

| ID | Role | Kết quả |
|----|------|---------|
| P1-S0-DO-01 | DevOps | L0 stack PASS |
| P1-S0-BA-P-01 | BA-Process | Acceptance P-CC-05..08 |
| P1-S0-BA-D-01 | BA-Data | Scope matrix |
| P1-S0-MOB-01 | Dev-Mobile | Smoke PASS |
| P1-S0-SA-01 | SA | ADR embed data mode |
| PM auto-fix | Dev-BE | `company_id=main` recruitment/attendance; payslips `page_size` |
| PM auto-fix | QA script | Mở rộng `test:pilot:flows` P-CC-05..08 |

## Tự sửa lỗi (nội bộ — không hiển thị user)

| Vấn đề | Xử lý | Evidence |
|--------|--------|----------|
| P-CC-06/07 HTTP 400 `company_id` UUID | DTO + DB TEXT + restart API | `test:pilot:flows` PASS |
| P-CC-08 `page_size` whitelist | Thêm field DTO payslips | PASS |
| API cũ trên port 28001 | PM restart `hrm-api` | L2 green |

## Còn lại (S0 hoặc S3)

| Hạng mục | Owner | Sprint |
|----------|-------|--------|
| `employee_work_history` Supabase P3 | Dev-FE | S3 |
| web-portal vitest config | Dev-FE | S0/S1 |
| QC formal GO 8 routes | QC | **Done** — GO WITH CONDITIONS |

## Sprint kế

**S1 — XBOS `planned` → `be`** (mở sau `P1-S0-PM-02` + QC GO).

## Retro (1 dòng)

PM phải **restart API sau BE fix** và **mở rộng L2 smoke** — tránh user thấy lỗi trên UI khi QA chưa retest proxy đủ route.
