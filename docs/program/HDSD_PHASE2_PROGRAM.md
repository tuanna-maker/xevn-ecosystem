# HDSD Phase 2 — Full execution program

**Program:** `P-HDSD-P2-FULL-01`  
**Sponsor:** 2026-07-30 — làm đủ Phase 2 + mở rộng TC + QA/QC toàn hệ sinh thái

## Deliverables (Definition of Done)

| # | Deliverable | Path | Owner |
|---|-------------|------|-------|
| P2-1 | PNG mỗi `[Hình …]` inline trong MD | `docs/client-delivery/hdsd/assets/**` | dev-fe |
| P2-2 | MD cập nhật `![caption](assets/...)` thay placeholder | `hdsd/{ecosystem,xbos,hrm}/` | dev-fe + ba-docs |
| P2-3 | HTML self-contained A4 | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` | ba-docs |
| P2-4 | PDF A4 | `.../HDSD_XEVN_ECOSYSTEM_v1.pdf` | ba-docs |
| P2-5 | TC matrix ≥1 TC/màn inventory | `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md` | ba-process |
| P2-6 | QA evidence W0–W4 (XBOS + HRM×2 + mobile) | `docs/qa/evidence/hdsd-uat-*` | qa + qa-device |
| P2-7 | QC GO/GWC Phase 2 | `docs/qa/evidence/qc-hdsd-p2-gate-*.md` | qc |

## L0 (verified)

- hrm-api :28001 · xbos-api :28002 · portal :5173 — PASS
- Cần thêm: HRM standalone :5175 cho W2a screenshots/UAT

## Parallel dispatch (same session)

1. `DEVOPS-HDSD-P2-STACK-01` — devops  
2. `HDSD-P2-SCREEN-01` — dev-fe (Playwright capture + inject MD)  
3. `HDSD-P2-HTML-PDF-01` — ba-docs  
4. `HDSD-P2-TC-MATRIX-01` — ba-process  
5. `HDSD-BA-XBOS-DASH-01` — ba-docs (finish Ch.4 if still stub)  
6. `QA-HDSD-FULL-W0-W4-01` — qa  
7. `QA-HDSD-MOB-CH12-01` — qa-device  
8. `QC-HDSD-P2-GATE-01` — qc (after P2-6 evidence)

## Rules

- U65 zero-seed · screenshots phải đúng màn (ceo@xe.vn full quyền)
- Ảnh **inline** từng mục HDSD — cấm phụ lục cuối chương
- XBOS vs HRM tách bộ — test cả standalone + embed HRM
