# Evidence — PO-HRM-MVP-GD1-REC-01-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · qa |
| **Date** | 2026-08-09 |
| **depends_on** | BE-01 READY_FOR_QA (jest 50/50) · FE-01 READY_FOR_QA (vitest 10/10) |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · portal `:5173` |
| **stamp** | `RECQA-MSKSFV8Z` · O4 `O4SHJWO` · L1 clean-spawn `2833cbf3-56d9-4f62-9971-8eacbf0d2bf6` |
| **ack_status** | **FAIL_TO_PM** |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed · **DENY** claim module REC UAT |

---

## Verdict

**FAIL_TO_PM** — U65 Định biên / spawn journeys largely **PASS**, L1 happy-path + idempotent spawn **PASS**, invent Nest paths **DENY PASS**, but **P0** `R-REC-HC-PUT-LOCKED-WIPE`: after approve, PUT without override returns `409 HRM-HC-CELL-LOCKED` **and** wipes nested positions (DELETE-before-assert in `replacePlanDepartments`), leaving spawn-eligible empty. Blocks safe lock semantics (AC-REC-HC-01-EX-04 / BR-REC-01-LOCK).

**C-SLICE:** this seat does **not** flip `recruitment_uat_ready` or claim module REC UAT.

---

## L0 stack

| Check | Result |
|-------|--------|
| `qc:dev-stack` / health | hrm-api `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| `qc:fe-be-health` | **ALL PASS** (earlier in session) |
| Ops note | Live `hrm-api` was serving **stale `dist`** (GET/PUT/spawn Nest **404 Cannot …**). QA rebuilt `pnpm --filter hrm-api run build` + restarted `dist/main` before L1. Routes mapped: GET/PUT `…/:planId`, POST `…/spawn-requests`. |

---

## L1 API (U19 + HC-S*)

**spec_ref:** API-01 F-REC-HC-01/03/05 · BA O1–O5 · BR-BP-HC-04 · VAL-REC-HC-*

| Case | Before → Action → Network → After | Verdict |
|------|-------------------------------------|---------|
| **List ↔ get-by-id** | List `company_id=main` includes plan → `GET …/recruitment-plans/:id?company_id=main` **200** `HRM-REC-PLAN-200` same id (U19 rollup `trsport` row also **200**) | 🟢 |
| **PUT upsert need_hire** | Draft plan → PUT cells `need_hire` 5→7 → **200** `HRM-REC-PLAN-200` | 🟢 |
| **Spawn non-approved** | Draft → POST spawn → **409** `HRM-HC-SPAWN-PLAN-NOT-APPROVED` | 🟢 |
| **Approve → cell lock** | PATCH status `approved` **200** → cell `lifecycle_status=need_hire_approved` | 🟢 |
| **PUT locked (code)** | PUT need_hire bump without `allow_override` → **409** `HRM-HC-CELL-LOCKED` | 🟢 code |
| **PUT locked (data)** | Same call: departments re-inserted **without positions** (wipe) → spawn eligible **0** | 🔴 **P0** |
| **Spawn create (clean)** | New plan approve (no locked PUT) → POST spawn **201** `created:1` | 🟢 |
| **Spawn re-POST** | Second spawn → `created:0` · `skipped_duplicate:1` (same `requisition_id`) **BR-BP-HC-04** | 🟢 |
| **Invent deny** | `GET /api/hrm/rec/headcount-plans` · `…/rec_headcount_plans` → **404** (no invent Nest) | 🟢 |

Artifacts: `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-01-cluster-qa-01-l1.json`

### P0 defect — R-REC-HC-PUT-LOCKED-WIPE

| | |
|--|--|
| **ID** | `R-REC-HC-PUT-LOCKED-WIPE` |
| **Severity** | **P0** |
| **Owner** | **dev-be** |
| **Root cause** | `replacePlanDepartments` runs `DELETE FROM recruitment_plan_departments` **before** `assertCellUnlockedForMutate`; lock throw leaves dept shell / **0 positions** |
| **spec_ref** | AC-REC-HC-01-EX-04 · BR-REC-01-LOCK · API F-REC-HC-01 step (7) CELL-LOCKED |
| **Repro** | Create+PUT need_hire → PATCH approved → PUT mutate need_hire without override → 409 + GET shows `positions.length=0` |

---

## U65 browser — J-HRM-REC-HC-01

**URL:** `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=plans`  
**cấm seed:** respected · no `pnpm seed:*` · no DB fake

### UF block — create / Lưu / F5

| Step | Evidence |
|------|----------|
| Before | Định biên tab title `rec-hc-plan-title`; empty/own list |
| Click path | Tuyển dụng → tab Định biên → **Tạo định biên** |
| UI audit ALT-03 | `needHireInputs=12` · `ns=0` · `dx=0` · header «Cần tuyển» / «một cột Cần tuyển» |
| Catalog | `CatalogSearchPicker` combobox ×2 present; keyboard pick draft options |
| Action | Title `QA ĐB RECQA-MSKSFV8Z` · CT tháng 8 = 5 → **Tạo định biên** |
| Network | POST `/api/hrm/recruitment/recruitment-plans` → **201** |
| FE after 2xx | List row title count=1 |
| F5 | Title count=1 persist |
| Verdict | 🟢 |

### UF block — Gửi duyệt

| Step | Evidence |
|------|----------|
| Action | Detail → **Gửi duyệt QT** |
| Network | POST `…/submit-workflow` → **201** |
| FE | Status chờ duyệt / WF path |
| Verdict | 🟢 |

### UF block — Approve O4 + cell lock (draft path, no prior submit)

| Step | Evidence |
|------|----------|
| Before | Separate plan `QA O4 WARN O4SHJWO` status draft · CT=5 > HT |
| Action | Detail → **Duyệt** (`rec-hc-approve-plan-btn`) |
| Network | PATCH `…/status` → **200** |
| FE after 2xx | Toast: *«Đã duyệt dù có ô vượt Hiện tại (O4 — warn, không chặn)»* · `over=true` · locked title els=1 · status approved |
| Verdict | 🟢 O4 |

*(Main stamp plan used Gửi duyệt first → FE approve hidden under `pending_approval`; O4 proven on draft approve path. XBOS inbox approve not forced — U65 no seed.)*

---

## U65 browser — J-HRM-REC-HC-01b

| Step | Evidence |
|------|----------|
| Bridge | After submit, API PATCH approve (OBS) then FE **Sinh YCTD từ Cần tuyển** |
| Spawn1 | POST `…/spawn-requests` → **201** |
| Spawn2 | POST again → **201** (idempotent path; L1 proved `skipped_duplicate`) |
| YCTD list / detail | Tab requisitions rows=16 · click row · no 404 · **J-HRM-05 must_keep** 🟢 |
| O3 qty_drift | NOTE_BLOCKED — approved edit locked on FE this run (optional) |
| Verdict | 🟢 with OBS on approve bridge |

Artifacts:  
- `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-01-cluster-qa-01-browser.json`  
- `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-01-cluster-qa-01-o4.json`  
- screens: `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-01-cluster-qa-01/`

---

## Journey rollup

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-HC-01** | 🟢 / OBS | Single CT column · Lưu 201+F5 · Gửi duyệt · O4 warn-allow · lock UI |
| **J-HRM-REC-HC-01b** | 🟢 / OBS | FE spawn 201×2 · YCTD detail must_keep · approve bridge OBS |
| **L1 API** | 🔴 P0 residual | Happy spawn+idempotent PASS; locked PUT wipe FAIL |

---

## Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-REC-HC-PUT-LOCKED-WIPE** | P0 | **dev-be** | Assert lock **before** DELETE/replace; transactional rollback on CELL-LOCKED |
| Honesty | — | qc | Keep `recruitment_uat_ready=false` |
| O3 qty_drift FE | P2 | — | Optional; NOTE_BLOCKED this seat |
| Stale dist ops | P2 | devops/dev-be | Ensure READY_FOR_QA implies rebuilt process on `:28001` |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **FAIL_TO_PM** |
| **next_owner** | **dev-be** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qa-01.md` |
| **completion_report** | L0 PASS. L1: scope parity + PUT need_hire + SPAWN-NOT-APPROVED + clean spawn create/skip PASS; invent deny PASS; **P0** locked PUT wipes positions. U65 J-HRM-REC-HC-01/01b browser PASS (single CT, Lưu+F5, submit, O4 warn-allow, spawn FE, J-HRM-05). Honesty false · C-SLICE. |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-02
lane: execution · dev-be
parent_defect: R-REC-HC-PUT-LOCKED-WIPE (P0)
entry_criteria: QA-01 FAIL_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qa-01.md
MISSION:
1) Fix replacePlanDepartments: assertCellUnlockedForMutate (and catalog asserts) BEFORE any DELETE of recruitment_plan_departments/positions; on HRM-HC-CELL-LOCKED leave grid intact (transaction / reorder).
2) Regression jest: approve plan → PUT without allow_override → 409 CELL-LOCKED AND getById still has positions + need_hire_approved cells; spawn still eligible.
3) Do not invent /rec/headcount-plans; no honesty flip; no seed.
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-02.md
then: PM → qa PO-HRM-MVP-GD1-REC-01-CLUSTER-QA-02 retest L1 locked PUT + U65 spawn residual
```
