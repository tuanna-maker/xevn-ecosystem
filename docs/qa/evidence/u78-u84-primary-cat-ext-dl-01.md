# Evidence — U78-U84-PRIMARY-CAT-EXT-DL-01

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-PRIMARY-CAT-EXT-DL-01` |
| **prior** | `U78-U84-PRIMARY-REC-PIPE-TMDV-01` (**EVIDENCED**) |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** Primary cell P-CAT-EXT @ **CO-DL** (HP) + **CO-HOLD** (AP) |
| **cell** | P-CAT-EXT @ **CO-DL** · tenant `xe-du-lich` · chip «X.E Du lịch VN» → holding gov approve |
| **U65** | honored — no seed / no inbox seed / no DB fake |
| **U76** | `hdsd_align: true` |
| **U78** | [`u78-u84-primary-cat-ext-dl-01-test-log.md`](u78-u84-primary-cat-ext-dl-01-test-log.md) · [`.json`](u78-u84-primary-cat-ext-dl-01-test-log.json) |
| **raw** | [`_tmp-u78-u84-primary-cat-ext-dl-01-browser.json`](_tmp-u78-u84-primary-cat-ext-dl-01-browser.json) · [`_tmp-u78-u84-primary-cat-ext-dl-01-r1-browser.json`](_tmp-u78-u84-primary-cat-ext-dl-01-r1-browser.json) |
| **screens** | `docs/qa/evidence/screens/u78-u84-primary-cat-ext-dl-01/` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` |
| **commit** | `dc930c5` |
| **L0** | `qc:dev-stack` HRM+XBOS+portal **200** · `qc:fe-be-health` **ALL PASS** |

---

## Executive verdict

**PASS_TO_PM** — U78 browser execute Primary cell **P-CAT-EXT @ CO-DL** FE-only after PIPE EVIDENCED:

| Layer | Result |
|-------|--------|
| **Precond TC-WFM-CAT-HP-001** | 🟢 FE CC **Thêm quy trình mới** → POST **201** `wf_hrm_catalog_extension_xe_du_lich` active (`3cb08a22-…`) |
| **Member unit** | 🟢 `xe-du-lich` visible · R1 selected chip **X.E Du lịch VN** (not Visun) |
| **TC-HIM-CAT-DL-HP-001** | 🟢 **EVIDENCED** — `company_group_hr` → Cấu hình chi tiết → **Xác nhận (áp dụng)** → POST extension-items **201** `HRM-SET-209` + `workflowInstanceId` → F5 |
| **TC-HIM-CAT-HOLD-AP-001** | 🟢 **EVIDENCED** — gov inbox matching WI → **Phê duyệt** confirm → POST **201** `XBOS-CAT-201` → F5 task gone |
| **Custom stamp label in dialog** | 🟡 PARTIAL — `Thêm field` stamp not observed in list (apply still 201+wi on catalog buckets); residual P2 |
| **UAT / Phase1 / whole U84** | **not claimed** |

**promoted TC-IDs:** `TC-HIM-CAT-DL-HP-001` · `TC-HIM-CAT-HOLD-AP-001`  
**XREF observe:** `TC-XIC-EXT-HP-001` → `TC-XIC-CG-HP-001` path exercised (not separate XIC pack retest claim).  
**supporting:** `TC-WFM-CAT-HP-001` FE designer create this wave.

---

## Persona / scope

| Field | Value |
|-------|--------|
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope HP | Group CEO · `?settings=company_group_hr` · chip **X.E Du lịch VN** (`xe-du-lich`) |
| Scope AP | Holding · `?settings=hrm_catalog_governance` · master context |
| JWT sync note | Group CEO `resolveGroupHrHrmCatalogScope` → `xevn`/`main` headers (product); bridge still starts catalog WF |

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | CC **Cấu hình → Hệ thống quy trình** · **Thêm quy trình mới** · Lưu | Yes | Precond `wf_hrm_catalog_extension_xe_du_lich` |
| 2 | CC **`?settings=company_group_hr`** · chip CT Du lịch | Yes | HP select CO-DL |
| 3 | **Cấu hình chi tiết** · khối **Công việc** · **Thêm field custom** · **Xác nhận (áp dụng)** | Yes | HP mutate |
| 4 | CC **`?settings=hrm_catalog_governance`** · **Làm mới** · **Phê duyệt** confirm | Yes | AP |

---

## IDs (R1 promote run)

| Field | Value |
|-------|--------|
| STAMP | `DL-CAT-DJFXEV` |
| wfDefId | `3cb08a22-8fb3-4b1a-ae64-0663de807ac9` (`wf_hrm_catalog_extension_xe_du_lich` active) |
| batchId (approved) | `204636b6-4528-458e-907c-fbc1a03f5aed` (`hrm_employee_contact_fields`) |
| workflowInstanceId | `6dc22eb9-8710-4fba-94ae-10d48645c93b` |
| AP task | `b233c5b8-7147-4d97-9177-d07f7eadab80` · **201** `XBOS-CAT-201` |
| Field label attempted | `QA-DL-CAT-DJFXEV-tour-xe-du-lich` (dialog stamp PARTIAL) |

---

## Phase A — WF precond + HP (CO-DL extension → F5)

1. L0 PASS · API: `xe-du-lich` in `group-member-units` · catalog WF **MISSING** at start  
2. Login → `/command-center?settings=workflow` · **Thêm quy trình mới** → mã/tên CAT-EXT → **Lưu quy trình** → POST **201** · F5 list  
3. `/command-center?settings=company_group_hr` · select **X.E Du lịch VN**  
4. **Cấu hình chi tiết** → khối Công việc → attempt **Thêm field custom** → **Xác nhận (áp dụng)**  
5. Network: ×6 POST `…/extension-items` **201** `HRM-SET-209` with non-null `workflowInstanceId` (parallel buckets)  
6. F5 reopen dialog — custom stamp **not** listed (PARTIAL); apply chain still AC-complete  

Screens: `00-wf-*` … `r1-06-f5.png`.

---

## Phase B — AP (holding gov Phê duyệt → F5)

| Check | Result |
|-------|--------|
| Inbox after HP | **12** pending (includes matching WI) |
| Select batch | Mã lô / instance `6dc22eb9-…` |
| Action | **Phê duyệt** → confirm dialog → **Phê duyệt** |
| Network | POST `/api/xbos/catalog-governance/tasks/b233c5b8-…/approve` → **201** `XBOS-CAT-201` |
| F5 | approved task **gone** (`taskGone=true`) |

Screens: `r1-07-inbox` … `r1-11-f5`.

---

## Case matrix (this WI)

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | member missing / 409 | 🟢 N/A this run | xe-du-lich visible; no 409 |
| B success HDSD | HP+AP | 🟢 PASS | CO-DL apply + HOLD approve |
| C logic BR | custom stamp persist | 🟡 PARTIAL | Thêm field stamp not in dialog after apply (P2) |

---

## Promoted / not_promoted

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-HIM-CAT-DL-HP-001 | **EVIDENCED** | 201 `HRM-SET-209` + `workflowInstanceId` @ CO-DL FE |
| TC-HIM-CAT-HOLD-AP-001 | **EVIDENCED** | gov **Phê duyệt** **201** `XBOS-CAT-201` + F5 |
| TC-WFM-CAT-HP-001 | supporting PASS | FE designer create this wave |
| TC-XIC-EXT-HP-001 / TC-XIC-CG-HP-001 | XREF observe | path exercised; not full XIC pack claim |
| TC-HIM-CAT-DL-FD-001 | **not** EVIDENCED | HRM-down FD not in scope |
| Whole U84 / Phase1 | **not** DONE | |

---

## Residuals

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **R-U84-CAT-EXT-DL-CUSTOM-STAMP** | **P2** | dev-fe | Thêm field custom stamp not visible in dialog after apply (apply buckets 201 OK) — align TC-XIC-EXT-BD-001 / R-UF15-BATCH-ROW class |
| **R-U84-ATT-ADJ-TMDV-*** | **P0** (prior) | **dev-fe** / **dev-be** | ATT-ADJ F5/scope + mgr 409 — in-flight headers WI |
| CO-DL leave Primary | P0 prior | devops/ba-data | still BLOCKED-EXTERNAL |

---

## completion_report

**Closed:** U78 Primary P-CAT-EXT @ CO-DL FE chain (U65) — WF def FE create + company_group_hr apply **201** `HRM-SET-209`+wi + holding gov approve **201** `XBOS-CAT-201`+F5; IEEE/ISO test-log pair; HP+AP **EVIDENCED**.  
**Open:** custom stamp dialog PARTIAL P2; ATT-ADJ prior FAIL; Leave@DL BLOCKED-EXTERNAL; UAT/Phase1 not claimed.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/u78-u84-primary-cat-ext-dl-01.md`

### next_dispatch_prompt

```text
work_item_id: U78-U84-PRIMARY-ATT-ADJ-TMDV-R2
from_role: pm
to_role: qa
ack_status_target: PASS_TO_PM
priority: P0
u65_zero_seed: true
hdsd_align: true
test_log_required: true

MISSION: Retest Primary P-ATT-ADJ @ CO-TMDV after FE company-header + BE scope parity (prior R1: create 201 ISO OK; F5 CEO list 0; mgr Duyệt 409).
entry: D-U84 ATT-ADJ FE/BE READY_FOR_QA · evidence u78-u84-primary-att-adj-tmdv-01-r1.md · headers WI U78-U84-ATT-ADJ-TMDV-AP-COMPANY-HEADER-01.
Persona: ceo@xe.vn create @ trsport → F5 list; mgr uat.nv0002 Duyệt → F5; XBOS inbox N/A.
exit: TC-HIM-ATT-TMDV-HP/AP EVIDENCED or honest FAIL/BLOCKED + U78 test-log.
cấm: seed · invent EVIDENCED · reopen CAT-EXT layout
ALTERNATE if ATT-ADJ still in-flight: spot TC-HIM-CAT-TMDV-SP-001 observe pull after HOLD approve (consumer) — optional.
```
