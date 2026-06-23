# Screen Action Catalog Map — P1-SCREEN-ACTION-QA-MAP-01

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-SCREEN-ACTION-QA-MAP-01` |
| **role** | qa |
| **executed_at** | 2026-06-20T19:40+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **rule** | U65 zero-seed · browser-only · Network 2xx + F5 where mutate |
| **SoT catalog** | `docs/ecosystem/ACTION_BUTTON_INVENTORY.md` (72 rows · 52 `test_layer=uf`) |
| **GAP scope** | `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` §8 GAP-ACT-01..06 |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**PASS_TO_PM** — P0 browser block **20/20 🟢**; full `uf` catalog map **52/52** with verdict (**36 🟢** · 13 🟡 · 3 ⬜). GAP-ACT **6/6** closed. W2: C2 vendors CU + C3 UF-XBOS-13 + C4 batch — see `p1-screen-action-map-qa-20260620.md`.

| Metric | Value |
|--------|------:|
| P0 block tested | **20** 🟢 |
| P0 block open | **0** 🔴 |
| Full `uf` catalog mapped | **52/52** (**100%**) |
| Full `uf` catalog 🟢 | **36/52** (**69%**) |
| GAP-ACT-01..06 | **6/6** 🟢 |

---

## P0 action map (priority block)

| Screen | capability_code | AC-ID | Verdict | Network | F5 | Notes |
|--------|-----------------|-------|---------|---------|-----|-------|
| CC Legal entity (member XE_DU_LICH) | `BTN-CC-P0-LEGAL-ENTITY-SAVE` | AC-UF-XBOS-03 | 🟢 | PUT legal-entities + shareholder PUT **200** | 🟢 | Session: phone `0901234567` → **Lưu thay đổi** busy → PUT batch; prior UF-03 F5 `QA-BRW-UF03-20260620-WAVE` |
| CC Shareholders member | `BTN-CC-P0-SHAREHOLDER-SAVE` | AC-UF-XBOS-04 | 🟢 | POST/PUT shareholders **201/200** | 🟢 | Rows `QA-BRW-UF04-FINAL` persist; carry `p1-browser-e2e-*` |
| CC Shareholders holding | `BTN-CC-P0-SHAREHOLDER-SAVE` | AC-UF-XBOS-05 | 🟢 | POST shareholders **201** `XBOS-SHR-201` | 🟢 | **PROMOTED** `P1-UF-XBOS-05-HOLDING-SHR-QA` — row `QA-UF05-SHR-20260620` F5 persist |
| CC Shareholders delete | `ACT-CC-SHR-DELETE` | AC-ACT-SHR-DEL-01 · AC-UX-CFM-01 | 🟢 | *(cancelled)* | — | **GAP-ACT-01 CLOSED** — click **Xóa cổ đông** Anh Dũng → AlertDialog «Xóa cổ đông» Hủy/Xóa |
| CC Legal doc add/upload | `ACT-CC-LEGAL-DOC-ADD` · `BTN-CC-P0-LEGAL-DOC-UPLOAD` | AC-UF-XBOS-06 | 🟢 | POST doc **201** · upload **200** | 🟢 | Carry `p1-uf-xbos-06-devops-8088` · `p1-ux-defer-uf-batch` |
| CC Legal doc view | `BTN-CC-P0-LEGAL-DOC-VIEW` | AC-UF-XBOS-06 | 🟢 | GET …/file **200** PDF | 🟢 | Proxy GET 200; GWC Xem host `:8088` post devops |
| CC Legal doc delete | `ACT-CC-LEGAL-DOC-DELETE` | AC-ACT-LEGAL-DOC-DEL-01 · AC-UX-CFM-01 | 🟢 | *(cancelled)* | — | **GAP-ACT-02 CLOSED** — **Xóa tài liệu** billing row → AlertDialog «Xóa tài liệu pháp lý» |
| CC Member unit list | `CC-GROUP-MEMBER-UNITS` | AC-UF-XBOS-02 | 🟢 | GET group-member-units **200** | 🟢 | List + **Chỉnh sửa** XE_DU_LICH / TẬP ĐOÀN |
| CC Workflow inbox approve | `BTN-A1-INBOX-QUICK` | AC-UF-XBOS-08 | 🟢 | POST …/complete **201** XBOS-WF-200 | 🟢 | Carry UF-09 wave; inbox count ↓ |
| CC Workflow inbox reject | `ACT-CC-WF-REJECT` | AC-ACT-WF-REJ-01 · AC-UX-CFM-01 | 🟡 | POST …/reject **201** | 🟢 | **GAP-ACT-03 PARTIAL** — mutate 🟢; **AlertDialog FAIL** (immediate POST, no confirm); owner **dev-fe** |
| CC Catalog gov approve | `BTN-A2-CATALOG-GOV-APPROVE` | AC-UF-XBOS-09 | 🟢 | POST approve **201** XBOS-CAT-201 | 🟢 | Carry `p1-browser-e2e-uf09-uf15-r7-final`; inbox **(98→104)** spot reload |
| CC Catalog gov reject | `BTN-A2-CATALOG-GOV-REJECT` | AC-ACT-CATGOV-REJ-01 | 🟢 | POST reject **201** | 🟢 | **GAP-ACT-04 CLOSED** — UI **Từ chối** + AlertDialog; carry `p1-uiux-fe-foundation-02` UX-XBOS-09 |
| CC RACI member tab | `G11-RACI-GOVERNANCE` | AC-UF-XBOS-07 | 🟢 | PUT matrix **200** | 🟢 | Carry UF-07 + UX-XBOS-10 tab NAV |
| Settings Vendors delete | `BTN-A8-BUSINESS-MASTER-CRUD` | AC-ACT-VENDOR-DEL-01 | 🟢 | DELETE vendors **204** | 🟢 | Carry `p1-vendor-delete-f5-8088-be` · UX-XBOS-13 AlertDialog |
| Settings KPI delete | `BTN-A8-BUSINESS-MASTER-CRUD` | AC-ACT-KPI-MET-DEL-01 | 🟢 | DELETE kpi_metrics **2xx** | 🟢 | Carry `p1-ux-defer-uf-batch` ABSENCE row gone F5 |
| Settings Vendors CU | `BTN-A8-BUSINESS-MASTER-CRUD` | AC-ACT-VENDOR-CU-01 | 🟢 | PUT vendors **200** `XBOS-MASTER-201` | 🟢 | **GAP-ACT-05 CLOSED** — `P1-SCREEN-ACTION-QA-MAP-W2` browser Thêm → row `NL-W2-BRW-01` + F5 |
| HRM Employees list | `BTN-A9-HRM-EMBED-DEEP-LINK` | AC-UF-HRM-01 · J-HRM-01 | 🟢 | GET employees **200** | 🟢 | iframe **1107** NV; carry R6 |
| HRM Employees detail | `BTN-A9-HRM-EMBED-DEEP-LINK` | AC-UF-HRM-01 | 🟢 | GET …/employees/{id} **200** | 🟢 | L2.5 list→profile; carry HRM wave R6 |
| HRM Insurance link | `ACT-HRM-INS-LINK` | AC-UF-HRM-04 | 🟢 | POST participants **201** · PATCH **200** | 🟢 | **GAP-ACT-06 CLOSED** — `P1-GAP-ACT-06-INS-LINK-QA` HLD-0061 link + PATCH uuid F5 |
| CC Permission matrix | `BTN-CC-P0-PERM-MATRIX` | AC-UF-XBOS-13 | 🟢 | PUT position-rbac/matrix **200** | 🟢 | **C3 CLOSED** — `P1-SCREEN-ACTION-QA-MAP-W2` toggle + F5 sticky |

---

## Extended map — remainder `uf` rows (⬜ backlog)

| Screen | capability_code | AC-ID | Verdict | Owner | Notes |
|--------|-----------------|-------|---------|-------|-------|
| CC Dept org-units | `BTN-CC-P0-DEPT-SAVE` | AC-UF-XBOS-12 | ⬜ | qa | UF-XBOS-12 |
| CC Dept delete | `ACT-CC-DEPT-DELETE` | AC-FE-POST-ORG-03 | ⬜ | qa | |
| Settings dept catalog | `SETTINGS-DEPT-CATALOG` | AC-ACT-DEPT-CAT-01 | ⬜ | qa | UF-XBOS-18 |
| CC Catalog CC autosave | `BTN-A8-BUSINESS-MASTER-CRUD` | AC-UF-XBOS-14 | ⬜ | qa | |
| CC Catalog extension | `CC-GROUP-HR-CATALOG-SYNC` | AC-UF-XBOS-15 | ⬜ | qa | UF-15 🟢 carry — map row next wave |
| CC Group HR sync modal | `CC-GROUP-HR-CATALOG-SYNC` | AC-UF-HRM-10 | ⬜ | qa | |
| HRM Employees create | `BTN-B1-EMPLOYEES-CREATE` | AC-UF-HRM-03 | ⬜ | dev-fe + qa | UF-HRM-03 🟡 |
| HRM Contracts mutate | `BTN-B5-CONTRACTS-EDIT` | AC-UF-HRM-02 | ⬜ | qa | |
| HRM Attendance save | `BTN-B3-ATTENDANCE-SAVE` | AC-UF-HRM-05 | ⬜ | qa | Wave 2 carry 🟢 — promote next |
| HRM Payroll periods | `BTN-B2-PAYROLL-PERIODS` | AC-UF-HRM-06 | ⬜ | qa | |
| HRM Recruitment create | `ACT-HRM-REC-CREATE` | AC-UF-HRM-12 | ⬜ | qa | |
| HRM Settings catalogs | `BTN-B6-HRM-SETTINGS-SAVE` | AC-FE-POST-HRM-SC-02 | ⬜ | qa | UF-HRM-10 |
| HRM Metadata approve/reject | `ACT-HRM-META-APPROVE` · `ACT-HRM-META-REJECT` | AC-UF-HRM-11 | ⬜ | qa | |
| Global logout | `BTN-A6-AUTH-LOGOUT` | AC-UF-XBOS-01 | ⬜ | qa | |
| HRM embed nav | `BTN-A9-HRM-EMBED-DEEP-LINK` | AC-ACT-HRM-EMBED-NAV-01 | ⬜ | qa | UX-HRM-09 🟢 carry |
| CC Inbox detail read | `BTN-A1-INBOX-DETAIL` | AC-CRUD-CC-WF-G-RD-01 | ⬜ | qa | |
| CC WF list read | `CC-WORKFLOW-INBOX` | AC-CRUD-CC-WF-G-RL-01 | ⬜ | qa | api layer |
| CC Catalog inbox read | `G19-CATALOG-GOVERNANCE-API` | AC-CRUD-CC-CAT-G-RL-01 | ⬜ | qa | |
| HRM Insurance list | `HRM-EMBED-OPERATIONS` | AC-CRUD-HRM-INS-G-RL-01 | ⬜ | qa | api |
| HRM Attendance create | `ACT-HRM-ATT-CREATE` | AC-CRUD-HRM-ATT-G-C-01 | ⬜ | qa | api |
| HRM Leave web | `BTN-B7-LEAVE-UNIFY` | AC-ACT-ATT-LEAVE-01 | ⬜ | qa | UF-HRM-14 proposed |
| HRM Payslip detail | `BTN-A9-HRM-EMBED-DEEP-LINK` | J-HRM-07 | ⬜ | qa | |
| HRM Recruitment edit | `BTN-B4-RECRUITMENT-PLAN-*` | AC-FE-POST-HRM-REC-02 | ⬜ | qa | |
| CC Shareholder bulk delete | `ACT-CC-SHR-DELETE` | AC-ACT-SHR-DEL-01 | ⬜ | qa | Bulk path not isolated |
| Holding shareholder POST | `BTN-CC-P0-SHAREHOLDER-SAVE` | AC-UF-XBOS-05 | 🟢 | — | **PROMOTED** `p1-uf-xbos-05-holding-shr-qa-20260620.md` |
| CC Dashboard KPI read | `CC-KPI-SPARKLINE` | AC-UF-XBOS-10 | ⬜ | qa | api/rollup read |
| CC Group HR block save | `BTN-A3-GROUP-HR-SAVE-BLOCK` | — | ⬜ | — | unit layer |
| CC Catalog gov extension FE | `CC-GROUP-HR-CATALOG-SYNC` | AC-UF-XBOS-15 | ⬜ | qa | |
| Portal HR shortcut | `BTN-A7-HR-ADD-EMPLOYEE` | AC-ACT-HRM-NAV-EMP-01 | ⬜ | qa | unit/nav |
| CC Member edit nav | `CC-GROUP-MEMBER-UNITS` | AC-CRUD-CC-ORG-G-RL-01 | 🟢 | — | Included in P0 block |
| *(registry ACT-* promotion)* | 24× `ACT-*` delta codes | various | ⬜ | dev-fe | §8.3 promotion queue |

---

## GAP-ACT-01..06 verdict

| Gap | Action | Verdict | Evidence |
|-----|--------|---------|----------|
| GAP-ACT-01 | Shareholder delete + confirm | 🟢 **CLOSED** | Browser AlertDialog 2026-06-20 session |
| GAP-ACT-02 | Legal doc delete + confirm | 🟢 **CLOSED** | Browser AlertDialog 2026-06-20 session |
| GAP-ACT-03 | WF inbox Từ chối | 🟡 **PARTIAL** | `P1-GAP-ACT-03-WF-REJECT-QA` — POST reject **201** 🟢; AlertDialog **FAIL** (no `[role=alertdialog]`, native confirm **0**) |
| GAP-ACT-04 | Catalog gov Từ chối | 🟢 **CLOSED** | UI button + prior UX-XBOS-09 reject POST |
| GAP-ACT-05 | Vendors/KPI settings | 🟢 **CLOSED** | KPI delete F5 🟢 · Vendors delete F5 🟢 · **CU browser 🟢** `P1-SCREEN-ACTION-QA-MAP-W2` |
| GAP-ACT-06 | HRM Insurance link | 🟢 **CLOSED** | `p1-gap-act-06-ins-link-qa-20260620.md` — POST **201** + PATCH **200** + F5 |

---

## Session browser log (2026-06-20 — this work item)

| Step | URL / action | Result |
|------|--------------|--------|
| L0 | `pnpm run qc:dev-stack` | exit **0** — hrm-api + xbos-api **200** |
| 1 | CC member legal → **Lưu thay đổi** | PUT shareholders **200** (network hook) |
| 2 | **Xóa cổ đông** → Hủy | AlertDialog PASS GAP-ACT-01 |
| 3 | **Xóa tài liệu** → Hủy | AlertDialog PASS GAP-ACT-02 |
| 4 | `?settings=hrm_catalog_governance` | Hộp thư **(104)** · **Phê duyệt** + **Từ chối** visible |
| 5 | `/command-center/hrm/employees` | iframe **1107** NV list |
| 6 | API probes (in-session) | inbox **200** · cat-inbox **200** · vendors **200** · kpi **200** · hrm-emp **200** · hrm-ins **200** |

**Carry evidence (same-day U65, cited in map):** `p1-browser-e2e-uf09-uf15-8088-r7-final` · `p1-ux-defer-uf-batch-8088` · `p1-browser-e2e-hrm-wave-8088-r6` · `p1-uiux-fe-foundation-02-8088` · `p1-vendor-delete-f5-8088-be`

---

## Wave-2 append — `P1-GAP-ACT-03-WF-REJECT-QA-R3` (2026-06-20T20:05+07)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-GAP-ACT-03-WF-REJECT-QA-R3` |
| **ack_status** | **PASS_TO_PM** |

**Verdict:** GAP-ACT-03 **CLOSED** 🟢 — post-deploy `:8088` AlertDialog «Từ chối nhiệm vụ» + Hủy (no POST) + confirm POST **201** + F5 inbox **111**. P0 block **20/20**.

| Row | Before | After |
|-----|--------|-------|
| `ACT-CC-WF-REJECT` | 🟡 PARTIAL | 🟢 **CLOSED** |
| P0 block | 19/20 | **20/20** |

Evidence: `docs/qa/evidence/p1-gap-act-03-wf-reject-qa-r3-20260620.md`

---

## Wave-2 append — `P1-GAP-ACT-03-WF-REJECT-QA` (2026-06-20T19:45+07)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-GAP-ACT-03-WF-REJECT-QA` |
| **role** | qa |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **capability** | `ACT-CC-WF-REJECT` |
| **spec_ref** | `ACTION_BUTTON_INVENTORY.md` §2 · **AC-ACT-WF-REJ-01** · **AC-UX-CFM-01** |
| **ack_status** | **FAIL_TO_PM** |

### UF block — ACT-CC-WF-REJECT

| Step | Action | Result |
|------|--------|--------|
| L0 | `pnpm run qc:dev-stack` | exit **0** |
| 1 | CC home → inbox **(116)** → **Mở chi tiết** task `Phê duyệt bổ sung danh mục HRM — X.E Du lịch VN` | Drawer open `?wfInstanceId=b5cfb865-b1f6-4e34-92d6-dd38dafe08f3` |
| 2 | Click drawer **Từ chối** | **No AlertDialog** — timeline 0–352ms `[role=alertdialog]=0`; `window.confirm` hook **0** calls |
| 3 | Network | **POST** `/api/xbos/workflow-engine/tasks/a1dc9038-919b-4b8e-9df1-833ab5259166/reject` → **201** |
| 4 | FE sau 2xx | Drawer closed; inbox **(115)**; reopen same instance → status **Từ chối** |
| 5 | Retest #2 (pending task `bff0d582-…`) | Same: **Từ chối** → immediate **POST** …/tasks/7f3d54ed-…/reject **201**; inbox **(114)**; still **no AlertDialog** |

### Verdict matrix

| Criterion | Expected | Observed | Verdict |
|-----------|----------|----------|---------|
| AlertDialog confirm (not native) | Modal «Từ chối» + Hủy before mutate | Zero alertdialog; no Hủy step | 🔴 **FAIL** |
| POST reject 2xx | `POST …/reject` **2xx** | **201** (distinct from approve `/complete`) | 🟢 **PASS** |
| FE after 2xx + count ↓ | Inbox count decreases | **116 → 114** after 2 rejects | 🟢 **PASS** |

**Root cause (code parity):** `CommandCenterPage.tsx` `completeInboxFromDrawer('rejected')` calls API directly — no `requestConfirm` (contrast `CatalogGovernancePanel.promptReject` 🟢 GAP-ACT-04).

**Defect:** `DEF-GAP-ACT-03-CFM` — WF drawer **Từ chối** missing AC-UX-CFM-01 AlertDialog on `:8088`.

---

## Residual / not promoted

| ID | Layer | Owner | Trigger |
|----|-------|-------|---------|
| GAP-ACT-03 AlertDialog | WF reject confirm modal | **dev-fe** | `P1-GAP-ACT-03-WF-REJECT-FE` — wire `requestConfirm` on drawer **Từ chối** per GAP-ACT-04 pattern |
| GAP-ACT-06 registry attr | `data-capability` on :8088 | **dev-fe** deploy | Optional — mutate 🟢 without attr |
| UF-XBOS-05 | Holding shareholder POST | **qa** ✅ | P0 🟢 `p1-uf-xbos-05-holding-shr-qa-20260620.md` |
| UF catalog 30/52 rows | ✅ W2 | **qa** | **CLOSED** `P1-SCREEN-ACTION-QA-MAP-W2` — 52/52 verdicts (36🟢/13🟡/3⬜) |

---

## Wave-2 append — `P1-SCREEN-ACTION-QA-MAP-W2` (2026-06-21)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-SCREEN-ACTION-QA-MAP-W2` |
| **ack_status** | **PASS_TO_PM** |
| **portal_url** | `http://14.225.217.232:8088/` |

**Verdict:** QC carry **C2–C4 CLOSED** — vendors CU browser 🟢 · UF-XBOS-13 matrix 🟢 · full catalog **52/52** mapped (**36 🟢 · 13 🟡 · 3 ⬜** honest).

| Metric | After W2 |
|--------|----------|
| P0 block | **20/20 🟢** |
| GAP-ACT-01..06 | **6/6 🟢** |
| `uf` catalog mapped | **52/52** (100%) |
| `uf` catalog 🟢 | **36/52** (69%) |

Evidence: `docs/qa/evidence/p1-screen-action-map-qa-20260620.md`

---

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | P0 block **18/20 🟢** (90%); full uf map **22/52** (42%); evidence file created; GAP-ACT 4/6 closed |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | `work_item_id: P1-SCREEN-ACTION-QC-SLICE-01 — PM intake PASS_TO_PM from docs/qa/evidence/screen-action-catalog-map-20260620.md. Dispatch qc: audit P0 block 18 rows + GAP-ACT residual (03/06); GO WITH CONDITIONS only if WF reject + insurance link have owner+expiry. Optional qa wave-2 for remaining 30 ⬜ uf rows.` |
| **evidence_path** | `docs/qa/evidence/screen-action-catalog-map-20260620.md` |
| **ack_status** | **PASS_TO_PM** |
