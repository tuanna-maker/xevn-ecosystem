# Evidence — `PO-UC-TC-W4-QA-E2-HRM-AT-R5b-AT12-CREATE-CATALOG`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E2-HRM-AT-R5b-AT12-CREATE-CATALOG` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **seat_verdict** | **PASS** (leave type picker ≥1 · FE sync `pulledKeys=74` incl `leave_types`) |
| **U65** | honored — zero-seed · no DB insert leave_types · no invent Leave L2 PASS |
| **U76** | `hdsd_align: true` |
| **prior FAIL R5** | [`po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.md`](po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.md) (`pulledKeys=[]`) |
| **prior BE** | [`po-uc-tc-w4-be-at12-l1-create-catalog-pull-01.md`](po-uc-tc-w4-be-at12-l1-create-catalog-pull-01.md) `READY_FOR_QA` |
| **must_keep** | AT-12 L1 approve **CLOSED** · Leave L2 **SPEC_GAP** · ceo@ EXPECTED_NO_CTA · not reopened |
| **raw** | [`_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-browser.json`](_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-browser.json) |
| **sync raw** | [`_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-settings-sync.json`](_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-settings-sync.json) |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.mjs` · settings sync `_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-settings-sync.mjs` |
| **env** | portal `:5173` · hrm `:28001` · xbos `:28002` · L1 `uat.nv0002@xe.vn` / `trsport` |
| **commit** | `dc930c5` |
| **uat_done** | **false** |

---

## Executive verdict

| Gate | Result |
|------|--------|
| L0 `qc:dev-stack` + `qc:fe-be-health` | **PASS** (hrm/xbos/portal 200; fe-be ALL PASS) |
| Persona (not `ceo@`) | **Honored** — `uat.nv0002@xe.vn` manager · `company=trsport` |
| URL `/hr/attendance?portal=1&companyId=trsport` | **PASS** |
| Tab **Nghỉ phép** → **Tạo yêu cầu nghỉ** | **PASS** |
| Leave type picker ≥1 | **PASS** — 4 options: `LVT_01 Phép năm`, `LVT_02 Ốm`, `LVT_03 Thai sản`, `LVT_04 Không lương` |
| Empty CTA `hdsd-leave-sync-catalog` | **N/A this run** — picker already populated (mission allows) · no emptyHint · `authoritativeEmpty=false` |
| GET `/api/hrm/settings-catalogs` scope | **PASS** — `x-company-id=trsport` (**not** `main`) |
| FE sync corroboration (Settings **Đồng bộ từ XBOS**) | **PASS** — POST **201** `HRM-SET-201` · `x-company-id=trsport` · **`pulledKeys=74`** · **`leave_types` included** |
| After Settings sync: picker still ≥1 | **PASS** — same 4 LVT_* |
| Optional U65 create leave-requests | **PASS (optional)** — POST **201** `HRM-LEAVE-201` id=`f465e7f3-fed3-46eb-862d-6f186ad01bb7` · **not** Leave L2 claim |
| Optional create header note | `x-company-id=main` on create POST — **observation only** · **not** invent Leave L2 · **not** reopen AT-12 L1 approve |
| Leave L2 ladder | **SPEC_GAP** — **not PASS** |
| AT-12 L1 approve | **CLOSED** — not reopened |
| ceo@ Duyệt | **not wired / not used** |
| Residual `R-W4-AT12-L1-CREATE-CATALOG-BE-PULL` | **CLOSED** |

**promoted:** BE holding→OU pull fix verified in browser UF (picker ≥1 + FE sync `pulledKeys>0` incl `leave_types`)  
**not promoted:** Leave L2 · full UAT DONE · optional create scope polish (`x-company-id=main` note)  
**Residual closed:** `R-W4-AT12-L1-CREATE-CATALOG-BE-PULL`

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/attendance?portal=1&companyId=trsport` | Yes | mount |
| 2 | Tab **Nghỉ phép** | Yes | create path |
| 3 | `+ Tạo yêu cầu nghỉ` | Yes | dialog |
| 4 | Leave type picker (CatalogSearchPicker) | Yes | ≥4 options |
| 5 | Empty CTA `hdsd-leave-sync-catalog` | N/A | picker already filled |
| 6 | Settings catalogs **Đồng bộ từ XBOS** | Yes | sync corroboration |
| 7 | AT-12 L1 Duyệt | N/A | **CLOSED — not reopened** |
| 8 | Leave L2 ladder | N/A | **SPEC_GAP** |

---

## Click path (manager trsport)

### A — Leave create (primary UF)

1. Mobile login `uat.nv0002@xe.vn` → JWT `company_id=trsport` · roles `employee,manager`
2. GOTO `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`
3. Tab **Nghỉ phép**
4. **Tạo yêu cầu nghỉ**
5. Open **Chọn loại nghỉ** → **4** real options (LVT_01..04); emptyHint **absent**; sync CTA **not** shown (expected when catalog filled)
6. Network: `GET /api/hrm/settings-catalogs` → **200** · `x-company-id=trsport`
7. Optional: fill + **Gửi yêu cầu** → POST `/api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201` (report only; Leave L2 **SPEC_GAP**)

Screens: `01-attendance.png` · `02-leave-tab.png` · `03-create-dialog.png` · `04-pre-sync-picker.png` · `07-optional-create.png`

### B — Settings sync corroboration (FE pull after BE fix)

1. Same persona → `/hr/settings-catalogs?portal=1&companyId=trsport`
2. Click **Đồng bộ từ XBOS**
3. Network: `POST /api/hrm/settings-catalogs/sync-from-xbos` → **201** `HRM-SET-201` · `x-company-id=trsport` · **`pulledKeys.length=74`** · includes **`leave_types`**
4. Return Leave create → picker still **4** options

Screens: `08-settings-catalogs.png` · `09-settings-after-sync.png` · `10-leave-picker-after-settings-sync.png`

---

## Diff vs R5 FAIL

| Check | R5 | R5b |
|-------|----|-----|
| Sync POST status | 201 | 201 |
| `x-company-id` | trsport | trsport |
| `pulledKeys` | **[]** | **74** (incl `leave_types`) |
| Picker options | **0** (emptyHint+CTA) | **4** LVT_* |
| Seat | **FAIL** | **PASS** |

---

## Claims / non-claims

| Claim | Status |
|-------|--------|
| FE member catalog GET `x-company-id=trsport` | **Yes** |
| FE sync POST 201 + `pulledKeys>0` + `leave_types` | **Yes** (Settings path) |
| leave_types picker ≥1 | **Yes** |
| Leave L2 PASS | **No** — SPEC_GAP |
| AT-12 L1 approve reopened | **No** |
| Seed used | **No** |
| UAT DONE | **false** |
| `R-W4-AT12-L1-CREATE-CATALOG-BE-PULL` | **CLOSED** |

---

## Residuals → PM

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-AT12-L1-CREATE-CATALOG-BE-PULL** | — | — | **CLOSED** this wave |
| Leave L2 | — | — | **SPEC_GAP HOLD** |
| AT-12 L1 approve | — | — | **CLOSED** (R4) |
| OBS-create-x-company-main | P3 info | pm/dev-fe backlog | optional create POST used `x-company-id=main` while catalog GET/sync use `trsport` — **not** blocking CREATE-CATALOG seat; **not** Leave L2; **not** reopen approve |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R5b-AT12-CREATE-CATALOG
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.md
next_owner: pm
seat_verdict: PASS
be_pull: CLOSED (FE sync pulledKeys=74 incl leave_types · picker=4)
l2: SPEC_GAP
at12_l1_approve: CLOSED
uat_done: false
completion_report: |
  R5b PASS after BE holding→OU pull: uat.nv0002@trsport Leave create picker
  shows 4 leave_types (LVT_01..04); GET catalogs x-company-id=trsport.
  Settings FE Đồng bộ → POST 201 HRM-SET-201 pulledKeys=74 incl leave_types.
  Optional create 201 HRM-LEAVE-201 (not Leave L2). R-W4-AT12-L1-CREATE-CATALOG-BE-PULL CLOSED.
  must_keep: AT-12 L1 approve CLOSED · Leave L2 SPEC_GAP · ceo@ EXPECTED_NO_CTA · U65 no seed.
next_dispatch_prompt: |
  work_item_id: PO-UC-TC-W4-QC-E2-HRM-AT-R5b-AT12-CREATE-CATALOG
  from_role: pm
  to_role: qc
  ack_status_target: PASS_TO_PM
  u65_zero_seed: true
  entry: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.md
  Gate: audit R5b PASS — picker≥1 + FE sync pulledKeys>0 (leave_types) closes
    R-W4-AT12-L1-CREATE-CATALOG-BE-PULL; FE R5 path remains CLOSED; AT-12 L1 approve CLOSED;
    Leave L2 SPEC_GAP; ceo@ EXPECTED_NO_CTA; U65 no seed.
  Do not invent Leave L2 PASS. Optional note OBS-create-x-company-main (P3) not GWC blocker
    unless QC policy requires.
  evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-qc.md
```
