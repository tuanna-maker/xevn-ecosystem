# Evidence — `PO-UC-TC-W4-QA-E2-HRM-AT-R5-AT12-CREATE-CATALOG`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E2-HRM-AT-R5-AT12-CREATE-CATALOG` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **seat_verdict** | **FAIL** (FE OU sync path OK · post-sync `leave_types` still empty) |
| **U65** | honored — zero-seed · no DB insert leave_types · no invent Leave L2 PASS |
| **U76** | `hdsd_align: true` |
| **prior FE** | [`po-uc-tc-w4-fe-at12-l1-create-catalog-01.md`](po-uc-tc-w4-fe-at12-l1-create-catalog-01.md) `READY_FOR_QA` |
| **must_keep** | AT-12 L1 approve **CLOSED** · Leave L2 **SPEC_GAP** · ceo@ EXPECTED_NO_CTA · not reopened |
| **raw** | [`_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog-browser.json`](_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog/` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.mjs` |
| **env** | portal `:5173` · hrm `:28001` · xbos `:28002` · L1 `uat.nv0002@xe.vn` / `trsport` |
| **commit** | `dc930c5` |
| **uat_done** | **false** |

---

## Executive verdict

| Gate | Result |
|------|--------|
| L0 `qc:dev-stack` + `qc:fe-be-health` | **PASS** (hrm/xbos/portal 200; fe-be ALL PASS) |
| Persona (not `ceo@`) | **Honored** — `uat.nv0002@xe.vn` manager · `company=trsport` |
| URL `/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` | **PASS** |
| Tab **Nghỉ phép** → **Tạo yêu cầu nghỉ** | **PASS** |
| Empty `leave_types` + CTA `hdsd-leave-sync-catalog` | **PASS** (yellow emptyHint + **Đồng bộ từ XBOS**) |
| GET `/api/hrm/settings-catalogs` scope | **PASS** — `x-company-id=trsport` (**not** `main`) |
| Click sync → POST `…/settings-catalogs/sync-from-xbos` | **PASS transport** — **201** `HRM-SET-201` · `x-company-id=trsport` |
| Sync payload usefulness | **FAIL** — `pulledKeys=[]` · toast «Đã kéo **0** danh mục vào HRM» |
| After invalidate: leave type picker ≥1 | **FAIL** — emptyHint + CTA still visible (`04`/`05`/`06` screens) |
| Optional U65 create leave-requests | **SKIP/PARTIAL** — blocked by empty picker (not Leave L2 claim) |
| Leave L2 ladder | **SPEC_GAP** — **not PASS** |
| AT-12 L1 approve | **CLOSED** — not reopened |
| ceo@ Duyệt | **not wired / not used** |

**promoted:** FE OU catalog scope for Leave create GET/sync (`trsport` not `main`) + empty-state CTA wire  
**not promoted:** post-sync `leave_types` population · U65 create · Leave L2 · full UAT DONE  
**Residual open:** `R-W4-AT12-L1-CREATE-CATALOG-BE-PULL` → **dev-be**

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/attendance?portal=1&companyId=trsport` | Yes | mount |
| 2 | Tab **Nghỉ phép** | Yes | create path |
| 3 | `+ Tạo yêu cầu nghỉ` | Yes | dialog |
| 4 | Empty leave type + `hdsd-leave-sync-catalog` | Yes | click Đồng bộ từ XBOS |
| 5 | Settings link «Danh mục nghiệp vụ / Loại nghỉ» | Yes | visible (not required click) |
| 6 | AT-12 L1 Duyệt | N/A | **CLOSED — not reopened** |
| 7 | Leave L2 ladder | N/A | **SPEC_GAP** |

---

## Click path (manager trsport)

1. Mobile login `uat.nv0002@xe.vn` → JWT `company_id=trsport` · roles `employee,manager`
2. GOTO `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`
3. Tab **Nghỉ phép**
4. **Tạo yêu cầu nghỉ**
5. Assert **Chọn loại nghỉ** empty: *«Chưa có mục trong danh mục…»* + CTA **Đồng bộ từ XBOS** (`data-testid=hdsd-leave-sync-catalog`)
6. Network (pre): `GET /api/hrm/settings-catalogs` → **200** · `x-company-id=trsport`
7. Click **Đồng bộ từ XBOS**
8. Network: `POST /api/hrm/settings-catalogs/sync-from-xbos` → **201** `HRM-SET-201` · `x-company-id=trsport` · **`pulledKeys=[]`**
9. Toast: **Đã kéo 0 danh mục vào HRM**
10. After invalidate GET catalogs again `x-company-id=trsport` — picker still empty (CTA remains)
11. Optional create — **not** submitted (picker empty); **do not** claim Leave L2

Screens: `03-create-dialog.png` · `04-pre-sync-picker.png` · `05-after-sync-click.png` (toast 0) · `06-post-sync-picker.png`

---

## Probe corroboration (read-only — not UF claim)

| Check | Result |
|-------|--------|
| `GET /api/hrm/settings-catalogs` + `x-company-id=trsport` (mgr JWT) | **200** · `catalogs` array **count=0** · **no** `leave_types` row |
| Seed / DB insert | **not** run |

---

## Harness note (honesty)

Initial harness `leaveTypeOptionCount=4` was a **false positive** (global `role=option` leak while emptyHint/CTA visible). Screenshot + toast `pulledKeys=0` are authoritative → seat **FAIL**, not PASS.

---

## Claims / non-claims

| Claim | Status |
|-------|--------|
| FE member catalog scope `trsport` (GET + sync) | **Yes** |
| Sync CTA visible on empty leave_types | **Yes** |
| Sync POST 2xx + `x-company-id=trsport` | **Yes** |
| leave_types picker ≥1 after sync | **No** |
| Leave L2 PASS | **No** — SPEC_GAP |
| AT-12 L1 approve reopened | **No** |
| UAT DONE | **false** |

---

## Residuals → PM

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-AT12-L1-CREATE-CATALOG** (FE scope/CTA) | — | — | **CLOSED** this wave (OU GET/sync + CTA) |
| **R-W4-AT12-L1-CREATE-CATALOG-BE-PULL** | **P1** | **dev-be** | sync **201** + `x-company-id=trsport` but `pulledKeys=[]` / `leave_types` still empty — member pull from holding SoT or publish path; **cấm seed**; **cấm** invent apply/clone as leave fix unless product CR |
| Leave L2 | — | — | **SPEC_GAP HOLD** |
| AT-12 L1 approve | — | — | **CLOSED** (R4) |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R5-AT12-CREATE-CATALOG
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.md
next_owner: pm
seat_verdict: FAIL
fe_path: PASS (GET/sync x-company-id=trsport · CTA hdsd-leave-sync-catalog)
be_pull: FAIL (201 HRM-SET-201 pulledKeys=0 · picker still empty)
l2: SPEC_GAP
at12_l1_approve: CLOSED
uat_done: false
completion_report: |
  Closed FE CREATE-CATALOG scope/CTA for uat.nv0002@trsport: catalogs GET +
  sync-from-xbos use x-company-id=trsport (not main); empty-state Đồng bộ CTA visible.
  Open: after sync 201, pulledKeys=[] and leave_types still empty → BE-PULL residual.
  Leave L2 SPEC_GAP; AT-12 L1 approve not reopened; U65 no seed; optional create blocked.
next_dispatch_prompt: |
  work_item_id: PO-UC-TC-W4-BE-AT12-L1-CREATE-CATALOG-PULL
  from_role: pm
  to_role: dev-be
  ack_status_target: READY_FOR_QA
  u65_zero_seed: true
  residual: R-W4-AT12-L1-CREATE-CATALOG-BE-PULL
  entry: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.md
  Problem: member JWT trsport POST …/settings-catalogs/sync-from-xbos → 201 HRM-SET-201
    x-company-id=trsport but pulledKeys=[] · GET catalogs catalogs=[] · Leave picker empty.
  Expect: after FE sync CTA, leave_types.effectiveItems ≥1 on trsport (from holding/XBOS SoT)
    without seed / without invent apply-to-members/clone unless product CR.
  must_keep: AT-12 L1 approve CLOSED · Leave L2 SPEC_GAP · ceo@ EXPECTED_NO_CTA · U65
  evidence_path: docs/qa/evidence/po-uc-tc-w4-be-at12-l1-create-catalog-pull-01.md
  exit: READY_FOR_QA → retest PO-UC-TC-W4-QA-E2-HRM-AT-R5b (same browser steps; picker ≥1)
```
