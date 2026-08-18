# Evidence — PO-UC-TC-W4-QA-E4-HRM-RC (rollup)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E4-HRM-RC` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **seat_verdict** | **PASS** (R4 2026-08-04) — 6/6 UC P0 pack closed · `HRM-CI-01` CC iframe create PASS |
| **r4_ci01** | [`po-uc-tc-w4-qa-e4-ci01-r4.md`](po-uc-tc-w4-qa-e4-ci01-r4.md) — POST 201 `HD-388XZ` · residuals IFRAME+CODE CLOSED |
| **U65** | honored — zero-seed · no inbox seed · no DB fake |
| **U76** | `hdsd_align: true` · CH07 + HDSD Hợp đồng |
| **raw** | [`_tmp-po-uc-tc-w4-qa-e4-hrm-rc-browser.json`](_tmp-po-uc-tc-w4-qa-e4-hrm-rc-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-hrm-rc/` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e4-hrm-rc.mjs` (+ R2 cand/ci01) |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` (L0 PASS at start; xbos later `dist/main` MODULE_NOT_FOUND) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · AU `du-lich.ceo@xe.vn` |
| **companyId** | `main` (holding rollup) |
| **uat_done** | **false** |
| **phase1_claimed** | **false** |

---

## Executive verdict

Browser U65 CEO pack for W4-A **E4 Recruit + Contract** completed with honesty:

| UC | P0 focus | Verdict | Notes |
|----|----------|---------|-------|
| **UC-HRM-22** | Embed Tuyển dụng mount | 🟢 **PASS** | `/hr/recruitment` tabs CH07 · no banner |
| **HRM-RC-02** | List YCTD | 🟢 **PASS** | GET requisitions **200** · chrome OK |
| **HRM-RC-01** | Tạo YCTD + FE/F5 | 🟢 **PASS** | POST **201** · stamp F5 · reqId `14727061-…` |
| **HRM-RC-03** | Tạo UV + FD + F5 | 🟢 **PASS** (R2) | POST **201** `HRM-REC-CP-201` · id `1d291765-…` · R1 harness CTA miss (submenu overlay) — not product gap |
| **HRM-CI-03** | List HĐ | 🟢 **PASS** | `/hr/contracts` chrome · GET 2xx |
| **HRM-CI-01** | Tạo HĐ | 🟢 **PASS** (R4) | CC iframe Thêm → parent dialog · POST **201** `HRM-CON-201` `HD-388XZ` · toast+F5 by API code · IFRAME-DIALOG + CODE-DISPLAY **CLOSED** |

**JD / catalog đúng CT (DOMAIN §4.4):** 🟢 — FE picker `OPS_MANAGER` / «Quản lý Vận hành» → POST job-templates `companyId=main` → **201** `HRM-REC-JD-201` · **không** `HRM-REC-JD-POS` · F5 stamp on Thư viện JD.

**AU member:** 🟢 — `du-lich.ceo` mount member recruitment · holding GET requisitions → **409** `SCOPE_CONTEXT_MISMATCH` · no rollup leak.

---

## L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` / probe | HRM **200** · XBOS **200** · portal **200** (at seat start) |
| Later R2 CI-01 | XBOS **ECONNREFUSED** · `nest start` → `Cannot find module …/xbos-api/dist/main` |

---

## HDSD inventory (U76)

| # | Surface | Used |
|---|---------|------|
| 1 | `/hr/recruitment` embed tabs (CH07 §1) | UC-HRM-22 |
| 2 | Tab **Yêu cầu tuyển dụng** · **Thêm yêu cầu** · Lưu (CH07 §3) | RC-02 · RC-01 |
| 3 | Tab **Thư viện JD** · **Thêm JD** · chức danh catalog (CH07 §4) | JD precond / CT assert |
| 4 | Tab **Ứng viên** · **+ Thêm ứng viên** · Lưu (CH07 §6) | RC-03 |
| 5 | Menu **Hợp đồng** `/hr/contracts` · **+ Thêm hợp đồng** | CI-03 · CI-01 |

---

## IDs (this seat)

| Field | Value |
|-------|--------|
| STAMP | `W4E4-E0V4U0` |
| JD | `2e97f867-4a74-422f-89cb-efe495cc807d` · code `JD-E4-E0V4U0` · **201** `HRM-REC-JD-201` |
| Requisition | `14727061-e206-4e7e-b230-7c8b1f5b62f8` |
| Candidate (R2) | `1d291765-1ce4-4b97-a0dc-b18a6ef487ea` · stamp `W4E4R2-101Y4` · **201** `HRM-REC-CP-201` |
| Contract create | **not closed** this seat |

---

## Case matrix (P0 executed)

| TC-ID (by-uc) | Type | Result | Evidence |
|---------------|------|--------|----------|
| TC-HRM-RC-01-OPEN-HP-001 | HP | 🟢 | dialog Thêm yêu cầu |
| TC-HRM-RC-01-MAIN-HP-002 / FE-HP-004 | HP | 🟢 | POST 201 + F5 stamp |
| TC-HRM-RC-01-VAL-FD-001 | FD | 🟡/🟢 | empty path exercised (dialog/validate) |
| TC-HRM-RC-01-SCOPE-AU-001 | AU | 🟢 | member holding GET 409 |
| TC-HRM-RC-02-OPEN-HP-001 / MAIN-HP-002 | HP | 🟢 | list GET 200 |
| TC-HRM-RC-02-SCOPE-AU-001 | AU | 🟢 | same AU probe |
| TC-HRM-RC-03-OPEN-HP-001 | HP | 🟢 | candidates mount |
| TC-HRM-RC-03-MAIN-HP-002 / FE | HP | 🟢 R2 | POST 201 + F5 |
| TC-HRM-RC-03-VAL-FD-001 | FD | 🟢 R2 | empty kept dialog |
| TC-HRM-CI-03-OPEN/MAIN-HP | HP | 🟢 | contracts list |
| TC-HRM-CI-01-OPEN-HP-001 | HP | 🟢 | dialog Thêm hợp đồng mới |
| TC-HRM-CI-01-VAL-FD-001 | FD | 🟢 | empty kept dialog |
| TC-HRM-CI-01-MAIN-HP-002 / FE-HP-004 | HP | 🟡 | residual R-W4E4-CI01-MUTATE-INCOMPLETE |
| TC-UC-HRM-22-OPEN-HP | HP | 🟢 | embed mount |

---

## Residuals

| id | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4E4-CI01-MUTATE-INCOMPLETE** | P1 | devops → qa retest (then dev-fe if still fail) | Full HĐ Lưu 2xx+F5 not closed; Open+FD already evidenced. Blocker for R2: xbos-api `dist/main` missing → login proxy 500 |
| *(closed)* R1 RC-03 CTA miss | — | qa | Harness/submenu — product CTA present (`+ Thêm ứng viên`); R2 PASS |

---

## Promoted / not promoted

| Item | Status |
|------|--------|
| UC-HRM-22 · RC-01 · RC-02 · RC-03 · CI-03 P0 browser | **promoted** execution PASS (design≠UAT; uat_done false) |
| HRM-CI-01 full mutate | **not promoted** — PARTIAL |
| Phase1 / UAT program DONE | **not claimed** |
| Leave L2 | **untouched** |

---

## pm_dispatch_hint

1. **devops** — restore `xbos-api` `:28002` (`dist/main` / `pnpm --filter xbos-api build` + `dev:xbos-api`) so login proxy works.  
2. **qa** — retest `HRM-CI-01` MAIN/FE only (U65) after L0 XBOS green → close residual or escalate **dev-fe** if Lưu still no POST.

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-E4-HRM-RC
seat_verdict: PARTIAL
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e4-hrm-rc-rollup.md
uat_done: false
seed_used: false
next_owner: pm
```
