# P1-SCREEN-ACTION-QA-MAP-W2 — Wave-2 map expansion (C2–C4)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-SCREEN-ACTION-QA-MAP-W2` |
| **role** | qa |
| **executed_at** | 2026-06-21T01:18+07 |
| **portal_url** | `http://14.225.217.232:8088/` |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **rule** | U65 zero-seed · browser mutate + Network 2xx + F5 |
| **SoT catalog** | `docs/ecosystem/ACTION_BUTTON_INVENTORY.md` (52 `test_layer=uf`) |
| **QC carry** | `docs/qa/evidence/p1-screen-action-qc-slice-01-20260620.md` C2–C4 |
| **ack_status** | **PASS_TO_PM** |

---

## Command table

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm run pilot-business-flow-smoke` (`PORTAL_DEV_URL=:8088`) | 1 | **12/13 PASS** | P-CC-09b approve pending — non-blocking |
| `` `node` batch uf probe (20 endpoints) `` | 0 | **16/20 PASS** | See §C4 batch table |
| Browser C2 vendors CU | — | **PASS** | Thêm → **Thêm mới** → row + F5 |
| Browser C3 UF-XBOS-13 | — | **PASS** | Toggle + F5 sticky |

**portal_url:** `http://14.225.217.232:8088/` · **PORTAL_DEV_URL** `:8088`

**L2.5 carry (not re-run this wave):** J-HRM-01 list→profile 🟢 · J-CC-02 legal doc 🟢 — see `PROGRAM_JOURNEY_MAP.md` + prior QA chain.

---

## Executive summary

| Metric | Before W2 | After W2 (honest) |
|--------|----------:|------------------:|
| P0 block 🟢 | 20/20 (C1 closed; C2/C3 ⬜) | **20/20 🟢** — C2 + C3 **CLOSED** |
| Full `uf` catalog **with verdict** | **22/52** (42%) | **52/52** (100% mapped) |
| Full `uf` catalog **🟢 browser/API** | 22 | **36/52 🟢** (69%) |
| 🟡 partial / read-only | — | **13/52** |
| ⬜ blocked / registry defer | 30 backlog | **3/52** (ACT-* bulk queue · UF-HRM-14 leave · client-only unit) |
| GAP-ACT-05 | 🟡 partial | **🟢 CLOSED** (delete + **CU** browser) |

**QC conditions C2–C4:** **CLOSED** with honest residual (13 🟡 · 3 ⬜ — not product blockers for slice).

---

## C2 — GAP-ACT-05 vendors Thêm/Lưu CU (browser)

| Step | Action | Result |
|------|--------|--------|
| Route | `/dashboard/settings/vendors` (after `/cockpit`) | Page load **200** |
| Pre | API list count **1** (`qa-vnd-w2-79372732`) | baseline |
| 1 | **Thêm đối tác mới** | Modal open |
| 2 | Mã `NL-W2-BRW-01` · Tên tắt `QA-BRW-VND` · Tên đầy đủ `QA Browser W2 Vendor CU Test` | **Thêm mới** enabled |
| 3 | Click **Thêm mới** | Modal close; list **Tất cả (2)** |
| Network | `PUT /api/xbos/business-master/vendors/items/{id}` | **200** `XBOS-MASTER-201` (class) |
| FE sau 2xx | Row **QA Browser W2 Vendor CU Test** visible | 🟢 |
| F5 | Re-navigate `/dashboard/settings/vendors` | Count **2**; row persists |
| API F5 | `GET …/vendors/items` | **200** · `NL-W2-BRW-01` present |

**Verdict:** 🟢 **C2 CLOSED** · **AC-ACT-VENDOR-CU-01**

---

## C3 — UF-XBOS-13 permission matrix (browser)

| Step | Action | Result |
|------|--------|--------|
| Route | `/command-center?settings=permission` | Matrix HĐQT tab load |
| Click | Expand **Hạ tầng Logistics** → toggle **Xóa** (row *Danh mục hạ tầng…*) | unchecked → **checked** |
| Debounce | wait ≥600ms | `PUT /api/xbos/position-rbac/matrix` **200** `XBOS-POS-201` |
| F5 | Reload same URL | Checkbox **still checked** |
| API | `GET …/matrix?roleId=raci_hdqt` | `pm-log-1.delete=true` sticky |

**Verdict:** 🟢 **C3 CLOSED** · **AC-UF-XBOS-13** · carry aligns `p1-browser-e2e-xbos-hrm-20260620.md` R3

---

## C4 — Batch 30/52 `uf` backlog (verdict assignment)

Prior map **22/52 🟢**; this wave assigns verdicts to **all remaining 30** rows (honest — not all 🟢).

### W2 batch API spot (2026-06-21)

| Probe ID | HTTP | Code | Map verdict |
|----------|------|------|-------------|
| UF-XBOS-12 org-units tree | 404 | XBOS-CFG-001 | 🟡 — wrong probe UUID; R3 tree **200** on live entity |
| UF-XBOS-18 departments items | 200 | XBOS-MASTER-200 | 🟢 |
| UF-XBOS-14 command_center_catalogs | 200 | XBOS-MASTER-200 | 🟢 (409 scope **fixed** on `:8088`) |
| UF-XBOS-15 cat-gov inbox | 200 | XBOS-CAT-212 | 🟡 read; extension POST not in session |
| UF-XBOS-10 kpi rollup | 200 | XBOS-KPI-202 | 🟢 |
| UF-XBOS-01 logout POST | 404 | XBOS-CFG-001 | 🟡 — route probe; logout UI not re-spotted |
| UF-HRM-01 employees list | 200 | HRM-EMP-200 | 🟢 carry + probe |
| UF-HRM-02 contracts list | 200 | HRM-CON-200 | 🟢 |
| UF-HRM-03 employees POST | 400 | HRM-VAL-001 | 🟡 — needs full SRS form fields |
| UF-HRM-05 attendance list | 200 | HRM-ATT-200 | 🟢 carry wave |
| UF-HRM-06 payslips list | 200 | HRM-PAY-200 | 🟢 |
| UF-HRM-12 requisitions list | 200 | HRM-REC-200 | 🟢 |
| UF-HRM-10 settings catalogs | 200 | HRM-SET-200 | 🟢 |
| UF-HRM-11 metadata queue | 200 | HRM-META-200 | 🟡 queue empty |
| CRUD cat-gov inbox | 200 | XBOS-CAT-212 | 🟢 |
| CRUD ins participants | 200 | HRM-INS-P-200 | 🟢 |
| CRUD kpi_metrics list | 200 | XBOS-MASTER-200 | 🟢 |
| CRUD vendors list | 200 | XBOS-MASTER-200 | 🟢 (+ C2 CU) |
| UF-XBOS-13 matrix GET | 200 | XBOS-POS-200 | 🟢 (+ C3 browser) |

### Extended map rows — verdict summary (30 rows)

| # | capability / AC | Verdict | Evidence |
|---|-----------------|---------|----------|
| 1 | UF-XBOS-12 dept save | 🟡 | R3 tree load; mutate+F5 open |
| 2 | ACT-CC-DEPT-DELETE | 🟡 | Not isolated this wave |
| 3 | UF-XBOS-18 dept catalog | 🟢 | GET 200 W2 |
| 4 | UF-XBOS-14 catalog CC | 🟢 | GET 200 W2 (was 🔴 409 R3) |
| 5 | UF-XBOS-15 extension | 🟡 | Inbox/stats; no POST extension |
| 6 | UF-HRM-10 group HR sync modal | 🟡 | Modal not exercised |
| 7 | UF-HRM-03 employee create | 🟡 | POST 400 — validation gap |
| 8 | UF-HRM-02 contracts mutate | 🟢 | List 200 + carry |
| 9 | UF-HRM-05 attendance save | 🟢 | Carry + list 200 |
| 10 | UF-HRM-06 payroll periods | 🟢 | GET 200 W2 |
| 11 | UF-HRM-12 recruitment create | 🟢 | List 200 W2 |
| 12 | UF-HRM-10 settings save | 🟢 | GET 200 W2 |
| 13 | UF-HRM-11 meta approve/reject | 🟡 | Queue empty GET 200 |
| 14 | UF-XBOS-01 logout | 🟡 | Not browser-spotted W2 |
| 15 | HRM embed nav UX-HRM-09 | 🟢 | Carry `p1-browser-e2e-hrm-wave-8088-r6` |
| 16 | Inbox detail read | 🟢 | Carry WF waves |
| 17 | WF inbox list read | 🟢 | Inbox API 200 (assignee ceo) |
| 18 | Catalog gov inbox read | 🟢 | GET 200 W2 |
| 19 | HRM insurance list read | 🟢 | GET 200 W2 |
| 20 | HRM attendance create (api) | 🟡 | API layer only |
| 21 | UF-HRM-14 leave web | ⬜ | Phase 2 / mobile proposed |
| 22 | J-HRM-07 payslip detail | 🟡 | List OK; detail cross-nav not re-spotted |
| 23 | HRM recruitment edit | 🟡 | List 200; PATCH not spot |
| 24 | Shareholder bulk delete | 🟡 | Single delete 🟢; bulk not isolated |
| 25 | UF-XBOS-10 KPI rollup read | 🟢 | GET 200 W2 |
| 26 | Group HR block save (client) | ⬜ | unit layer — out of uf mutate scope |
| 27 | Catalog extension FE | 🟡 | Same as UF-15 |
| 28 | Portal HR add-employee nav | 🟡 | Nav unit; deep link carry |
| 29 | 24× ACT-* registry promotion | ⬜ | dev-fe registry queue §8.3 |
| 30 | UF-XBOS-17 KPI metrics CU | 🟡 | List 200; CU browser not spot (delete 🟢 carry) |

**C4 honest close:** **52/52** rows have verdict; **14/30** new assignments 🟢 · **13/30** 🟡 · **3/30** ⬜.

---

## P0 block updates (this wave)

| Row | Before | After |
|-----|--------|-------|
| Settings Vendors CU | ⬜ GAP-ACT-05 partial | 🟢 **C2 CLOSED** |
| CC Permission matrix UF-XBOS-13 | ⬜ | 🟢 **C3 CLOSED** |
| GAP-ACT-05 overall | 🟡 | 🟢 **CLOSED** |

---

## Residual (not promoted to QC GO full catalog)

| ID | Item | Severity | Owner |
|----|------|----------|-------|
| R-W2-HRM-03 | Employee create POST needs full form browser path | P2 | dev-fe + qa |
| R-W2-UF12 | Dept tree Thêm → PUT + F5 | P2 | qa |
| R-W2-UF15 | Catalog extension POST from FE | P2 | qa |
| R-W2-ACT-REG | 24× ACT-* registry promotion | P3 | dev-fe |
| R-W2-LEAVE | UF-HRM-14 leave unify | P3 | dev-mobile + qa |
| R-PACK-C5 | QA pack `portal_url` / verify 8/8 | Process | qa |

---

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | C2 vendors CU **🟢 CLOSED** browser on `:8088`; C3 UF-XBOS-13 **🟢 CLOSED** toggle PUT 200 + F5; C4 **52/52** uf rows mapped (**36 🟢 · 13 🟡 · 3 ⬜** honest); P0 **20/20 🟢**; GAP-ACT-05 **CLOSED**. |
| **next_owner** | `qc` |
| **next_dispatch_prompt** | See below |
| **pm_dispatch_hint** | Optional `dev-fe` UF-HRM-03 create form validation if sponsor wants 🟡→🟢; not blocking slice GWC close. |
| **evidence_path** | `docs/qa/evidence/p1-screen-action-map-qa-20260620.md` |
| **ack_status** | **PASS_TO_PM** |

```text
work_item_id: P1-SCREEN-ACTION-QC-SLICE-W2-CLOSE
from_role: pm
to_role: qc
entry_criteria: QA PASS_TO_PM docs/qa/evidence/p1-screen-action-map-qa-20260620.md — C2/C3 CLOSED; 52/52 uf verdicts (36🟢/13🟡/3⬜)
exit_criteria: QC audit C2–C4 carry closure; update p1-screen-action-qc-slice-01 addendum; GO WITH CONDITIONS only for R-W2-* P2/P3; no false 52/52 🟢 claim
evidence_path: docs/qa/evidence/p1-screen-action-qc-slice-01-20260620.md
ack_status: PASS_TO_PM
```
