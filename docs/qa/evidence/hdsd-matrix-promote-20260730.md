# HDSD Matrix Verdict Promotion — W0–W4

| Field | Value |
|-------|-------|
| **work_item_id** | QA-HDSD-MATRIX-PROMOTE-01 |
| **program** | HDSD-P2-FULL-01 |
| **from_role** | qc |
| **to_role** | qa → pm |
| **date** | 2026-07-30 |
| **policy** | U65 zero-seed · browser evidence only |
| **ack_status** | PASS_TO_PM |

## Source evidence (5 wave files + QC gate)

| Wave | Evidence | Spot TC |
|------|----------|---------|
| W0 | `hdsd-uat-eco-20260730.md` | 4 |
| W1 | `hdsd-uat-xbos-20260730.md` | 10 |
| W2a | `hdsd-uat-hrm-standalone-20260730.md` | 8 |
| W2b | `hdsd-uat-hrm-embed-20260730.md` | 9 |
| W4 | `hdsd-uat-integration-20260730.md` | 3 |
| Runtime | `_tmp-qa-hdsd-full-w0-w4-runtime.json` | 34 checks → **26 unique matrix rows** |
| QC gate | `qc-hdsd-full-w0-w4-20260730.md` | GWC 30🟢 4🟡 0🔴 |

## Legacy → matrix v2.0 ID map

| Legacy / runtime ID | Matrix v2.0 ID | Verdict | Wave | Notes |
|---------------------|----------------|---------|------|-------|
| TC-ECO-01 | TC-ECO-002 | 🟢 | W0 | Login POST 201 → `/command-center` |
| TC-ECO-02 | TC-ECO-006 | 🟡 | W0 | Rail labels visible; **NHÂN SỰ click** URL stayed CC (C-S01) |
| TC-ECO-03 | TC-ECO-006 | 🟡 | W0 | Same row — automation soft; W2b embed routes 🟢 |
| TC-ECO-04 | TC-ECO-005 | 🟢 | W0 | `/dashboard/organization` GET 200 |
| TC-XBOS-HDSD-01-01 | TC-XBOS-HDSD-001 | 🟢 | W1 | CC load, no ERROR banner |
| TC-XBOS-HDSD-01-02 | TC-XBOS-HDSD-003 | 🟢 | W1 | CC KPI rollup GET 200 |
| TC-XBOS-HDSD-02-01 | TC-XBOS-HDSD-064 | 🟢 | W1 | ĐVTV list visible |
| TC-XBOS-HDSD-02-05 | TC-XBOS-HDSD-087 | 🟡 | W1 | Phòng ban tab render; dept GET not in 2.5s (C-S02) |
| TC-XBOS-HDSD-02-06 | TC-XBOS-HDSD-099 | 🟢 | W1 | RBAC matrix GET 200 |
| TC-XBOS-HDSD-03-01 | TC-XBOS-HDSD-123 | 🟢 | W1 | RACI GET 200 |
| TC-XBOS-HDSD-03-02 | TC-XBOS-HDSD-108 | 🟢 | W1 | Workflow inbox load |
| TC-XBOS-HDSD-03-03 | TC-XBOS-HDSD-132 | 🟢 | W1 | Catalog governance GET 200 |
| TC-XBOS-HDSD-04-01 | TC-XBOS-HDSD-011 | 🟢 | W1 | Cockpit load |
| TC-XBOS-HDSD-04-02 | TC-XBOS-HDSD-016 | 🟢 | W1 | Dashboard Tổ chức load |
| TC-ECO-03-standalone | TC-HRM-HDSD-004 | 🟢 | W2a | `:8080/hr/` login OK |
| TC-HRM-HDSD-01-01 | TC-HRM-HDSD-006 | 🟢 | W2a/W2b | Employees list GET 200 |
| TC-HRM-HDSD-01-02 | TC-HRM-HDSD-007 | 🟢 | W2a/W2b | J-HRM-01 list→detail GET 200 |
| TC-HRM-HDSD-02-01 | TC-HRM-HDSD-037 | 🟢 | W2a/W2b | Contracts list GET 200 |
| TC-HRM-HDSD-03-01 | TC-HRM-HDSD-055 | 🟢 | W2b | Recruitment GET 200 |
| TC-HRM-HDSD-04-01 | TC-HRM-HDSD-074 | 🟢 | W2a/W2b | Attendance GET 200 |
| TC-HRM-HDSD-05-01 | TC-HRM-HDSD-096 | 🟢 | W2a/W2b | Payroll GET 200 |
| TC-HRM-HDSD-06-01 | TC-HRM-HDSD-106 | 🟢 | W2a/W2b | Headcount GET 200 |
| TC-HRM-HDSD-07-01 | TC-HRM-HDSD-154 | 🟢 | W2a/W2b | Settings/catalog GET 200; W2b catalogSync 200 |
| TC-HRM-HDSD-07-02 | TC-HRM-HDSD-168 | 🟢 | W2b | Reports route GET 200 (embed) |
| TC-HRM-HDSD-embed | TC-HRM-HDSD-002 | 🟢 | W2b | Embed sidebar / proxy routes |
| TC-ECO-05 | TC-ECO-INT-01 | 🟡 | W4 | Catalog sync API not captured on settings tab (C-S03) |
| TC-HRM-HDSD-07-01-INT | TC-ECO-INT-01 | 🟡 | W4 | Functional PASS via W1+W2b+L0; automation timing soft |
| TC-HRM-HDSD-06-01-INT | TC-ECO-INT-02 | 🟢 | W4 | Headcount integration API 200 |

## Four soft 🟡 (QC GWC C-S01..C-S03 + policy C-S04)

| ID | Matrix row | Class | Honest ruling |
|----|------------|-------|---------------|
| **C-S01** | TC-ECO-006 | Automation | Puppeteer rail NHÂN SỰ click — URL unchanged; direct `/hr/*` embed **🟢** in W2b |
| **C-S02** | TC-XBOS-HDSD-087 | Timing | Phòng ban UI OK; departments GET not captured in 2.5s — not 409/500 |
| **C-S03** | TC-ECO-INT-01 | Timing | W4 settings tab — catalog API not captured; **functional sync 🟢** via W1 TC-XBOS-HDSD-132 + W2b TC-HRM-HDSD-154 + L0 proxy |
| **C-S04** | *(policy)* | U65 mutate | **BLOCKED by design** — zero-seed; NV/HĐ/YCTD create mutate **not executed**, **not fake 🟢**; load+list→detail only |

## U65 mutate — rows intentionally ⬜

Mutate/dialog depth TC (Tạo NV, Lưu HĐ, YCTD, shareholder, WF create…) remain **⬜** — not promoted without FE mutate chain (U65). Không seed inbox/DB để pass.

## Body promotion summary

| Bộ | Rows promoted | 🟢 | 🟡 |
|----|---------------|----|----|
| Ecosystem A | 3 | 2 | 1 |
| XBOS B | 10 | 9 | 1 |
| HRM C | 11 | 11 | 0 |
| Integration E | 2 | 1 | 1 |
| **Unique total** | **26** | **23** | **3** |

*34 runtime spot checks dedupe to 26 matrix rows (W2a/W2b share menu TC).*

## Residual (not promoted)

| Item | Owner |
|------|-------|
| 334 matrix rows still ⬜ (mutate/dialog/W3 mobile/W5) | future waves |
| R-REPORTS-500 embed reports summary 500 in network log | dev-be P2 |
| Phase 2 PNG/PDF (prior QC NO-GO) | dev-fe + ba-docs |

## Handoff

**completion_report:** Promoted **26** matrix body Verdict cells from W0–W4 browser UAT (5 evidence MD + runtime JSON + QC GWC). **23🟢 · 3🟡** in body; **4 soft conditions** documented (3 matrix 🟡 + U65 mutate policy). U65 mutate rows left ⬜ — no fake PASS.

**next_owner:** PM

**next_dispatch_prompt:**
```
work_item_id: HDSD-P2-RECOVERY-01
program: HDSD-P2-FULL-01
from_role: pm | to_role: parallel execution

Context: QA-HDSD-MATRIX-PROMOTE-01 PASS — matrix body 26 rows promoted (23🟢 3🟡). W0–W4 load-path closed. Prior QC-HDSD-P2-GATE-01 NO-GO on PNG/PDF still open.

Parallel dispatch:
1) HDSD-P2-SCREEN-01 (dev-fe) — inject PNG inline 114/114
2) HDSD-P2-HTML-PDF-01 (ba-docs) — PDF A4 after PNG
3) QA-HDSD-MOB-CH12-01 (qa-device) — W3 mobile J-MOB-*
4) ba-process — HDSD Ch.0 W2a entry :8080/hr/

entry_criteria: docs/qa/evidence/hdsd-matrix-promote-20260730.md
exit_criteria: PNG≥Hình · PDF exists · mobile evidence · QC-HDSD-P2-GATE-01-R2 GO
evidence_path: docs/qa/evidence/hdsd-matrix-promote-20260730.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/hdsd-matrix-promote-20260730.md`

**ack_status:** PASS_TO_PM
