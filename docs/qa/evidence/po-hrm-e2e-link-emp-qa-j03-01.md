# Evidence — PO-HRM-E2E-LINK-EMP-QA-J03-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-QA-J03-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution · U65 zero-seed · browser-only |
| **parent** | `PO-HRM-E2E-LINK-EMP-FE-J03-01` READY_FOR_QA |
| **residual** | **R-J03-DIALOG** → **CLOSED** |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `hrm_personnel_uat_ready=false` · **DENIED** personnel UAT / full EMP matrix |

---

## Scope

| In | Out |
|----|-----|
| **J-HRM-03 ONLY** — list → Eye (`hdsd-contracts-view-btn`) → view dialog/latch → populated detail | Full EMP D1/D5 matrix |
| must_keep spot UF-HRM-02 create + pencil | Seed / API-only PASS |
| Prefer testid over `role=dialog` | Claim personnel UAT-ready |

**spec_ref:** `PROGRAM_JOURNEY_MAP.md` J-HRM-03 · FE evidence `po-hrm-e2e-link-emp-fe-j03-01.md` · QC GWC CONDITION R-J03-DIALOG

---

## Environment

| Probe | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm **200** · xbos **200** · portal **200** (`:5173`) |
| hrm-api start | watch **TS fail** (`contract-legal-print.service.ts` custom_fields) → ran **`pnpm --filter hrm-api run start:prod`** (dist) |
| Portal / HRM FE | `dev:web-only` Vite up |
| Seed | **none** |

Machine JSON: `docs/qa/evidence/_tmp-po-hrm-e2e-link-emp-qa-j03-01.FINAL.json`  
Harness: `scripts/qa/_tmp-po-hrm-e2e-link-emp-qa-j03-01.mjs`  
Screens: `docs/qa/evidence/screens/po-hrm-e2e-link-emp-qa-j03-01/`

---

## Click path (J-HRM-03)

1. Login UI `ceo@xe.vn` → Command Center  
2. Hard refresh ` /command-center/hrm/contracts?portal=1&tenantId=xevn&companyId=main`  
3. Assert list rows (iframe)  
4. Click `[data-testid=hdsd-contracts-view-btn]` **in iframe**  
5. Assert open: parent `[data-testid=hdsd-contracts-view-dialog]` **OR** iframe latch `hdsd-contracts-view-dialog-open`  
6. Assert content: title **Chi tiết hợp đồng** · `hdsd-contracts-view-code` non-empty  
7. Spot must_keep: `hdsd-contracts-create-btn` + row pencil icons still present  

---

## Verdicts

| Check | Verdict | Evidence |
|-------|---------|----------|
| LOGIN | 🟢 PASS | POST auth/login **201** · URL `/command-center` |
| LIST | 🟢 PASS | rows=10 · GET contracts `HRM-CON-200` ×2 (load + hard refresh) |
| CLICK_VIEW_BTN | 🟢 PASS | surface=`iframe-testid` |
| Dialog open (testid) | 🟢 PASS | `parentCount=1` · `latchCountIframe=1` · `parentVisible=true` |
| Content populated | 🟢 PASS | code=`HD-QVQ6L` · bodyCount=1 · titleHit=true |
| **J-HRM-03** | 🟢 **PASS** | open + populated (not empty shell) |
| must_keep UF-HRM-02 | 🟢 PASS | createBtn=1 · pencil icons in Thao tác (screenshot) · createAfter=1 |
| role=dialog | OBS only | `roleDlg=true` (not used as primary gate) |

### Screenshot `03-view-dialog.png`

- Modal title **Chi tiết hợp đồng**  
- Mã HĐ **HD-QVQ6L** · NV UAT NV 0100 · loại học việc · status Có hiệu lực  
- Background: **+ Thêm hợp đồng** + Eye / Pencil / Trash row actions  

---

## Residual

| ID | Sev | Status | Note |
|----|-----|--------|------|
| **R-J03-DIALOG** | P2 | **CLOSED** | Eye → parent portal dialog + iframe latch; content populated |
| Watch TS hrm-api | P2 OBS | OPEN (ops) | `contract-legal-print.service.ts` TS2345 blocks `nest --watch`; L0 used dist `start:prod` — **not** J03 product fail |
| personnel UAT | — | **DENIED** | honesty false |
| EMP matrix expand | — | **out of scope** | J03-only wave |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | **J-HRM-03 PASS** · R-J03-DIALOG **CLOSED**. Browser U65: iframe Eye testid → parent `hdsd-contracts-view-dialog` + latch · code `HD-QVQ6L` · must_keep create/pencil present. No seed. **Not** personnel UAT-ready. OBS: hrm watch TS compile fail (dist used). |
| **next_owner** | **pm** (optional **qc** narrow close EMP GWC condition) |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-j03-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-QC-J03-01 (optional narrow)
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-E2E-LINK-EMP-QA-J03-01 PASS_TO_PM
residual closed: R-J03-DIALOG
u65: zero-seed · honesty hrm_personnel_uat_ready=false

entry: docs/qa/evidence/po-hrm-e2e-link-emp-qa-j03-01.md
task: Narrow QC — confirm J-HRM-03 PASS closes EMP GWC CONDITION R-J03-DIALOG; do not reopen D1/D5; do not promote personnel UAT. Optional note OBS hrm-api watch TS2345 (start:prod).
exit: PASS_TO_PM · update qc residual board OR PM intake EMP condition closed without QC if PM elects
```
