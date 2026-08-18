# Evidence — PO-HRM-MVP-GD1-REC-01-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · qa |
| **Date** | 2026-08-09 |
| **depends_on** | BE-02 `READY_FOR_QA` (fix `R-REC-HC-PUT-LOCKED-WIPE`) · parent QA-01 `FAIL_TO_PM` stamp `RECQA-MSKSFV8Z` |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · portal `:5173` |
| **stamp** | `RECQA2-MSKT56EP` · O4 `O4T6PIE` · L1 plan `3f302f4d-82a1-4e41-adbf-7e1fab6a0fc4` · cell `2822b499-6b36-4055-96a2-e2eb9e751a97` |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed · **DENY** claim module REC UAT |

---

## Verdict

**PASS_TO_PM** — P0 `R-REC-HC-PUT-LOCKED-WIPE` **CLOSED** on live `:28001` dist: approve → PUT without `allow_override` returns **409 `HRM-HC-CELL-LOCKED`** and GET-by-id keeps full grid (`positions=1`, same `cell_id`, `need_hire=7`, `lifecycle_status=need_hire_approved`); POST spawn after 409 → **created:1**; re-spawn → **skipped_duplicate:1**. `allow_override=true` → **200** write (BA O3). U65 browser J-HRM-REC-HC-01/01b PASS (single CT, Lưu+F5, submit-workflow, O4 warn-allow, UI after 409 not blank, J-HRM-05). Regression U19 + invent deny + submit-workflow PASS.

**C-SLICE:** this seat does **not** flip `recruitment_uat_ready` or claim module REC UAT.

---

## L0 stack

| Check | Result |
|-------|--------|
| `qc:fe-be-health` | **ALL PASS** (hrm `:28001` 200 · xbos `:28002` 200 · portal `:5173` 200 · proxy employees/catalog 200) |
| Runner L0 | hrm 200 · portal 200 · xbos 200 |

---

## L1 API — P0 retest + O3 + spawn

**spec_ref:** API-01 F-REC-HC-01 bước (7) · BA AC-REC-HC-01-EX-04 · BR-REC-01-LOCK · O3 · BR-BP-HC-04 · U19

**Artifact:** `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-01-cluster-qa-02-l1.json`

| Case | Before → Action → Network → After | Verdict |
|------|-------------------------------------|---------|
| **U19 list↔get** | List `main` includes sample → GET by id **200** `HRM-REC-PLAN-200` same id | 🟢 |
| **U19 rollup** | Member `trsport` row → GET `?company_id=main` **200** idMatch | 🟢 |
| **CREATE** | POST plan title `QA ĐB RECQA2-MSKT56EP` CT m8=5 → **201** `HRM-REC-PLAN-201` | 🟢 |
| **PUT draft** | need_hire 5→7 → **200** | 🟢 |
| **Spawn non-approved** | POST spawn → **409** `HRM-HC-SPAWN-PLAN-NOT-APPROVED` | 🟢 |
| **Approve → lock** | PATCH approved **200** → cell `lifecycle=need_hire_approved` · `need_hire=7` · `positions=1` | 🟢 |
| **PUT locked (code)** | PUT bump without `allow_override` → **409** `HRM-HC-CELL-LOCKED` | 🟢 |
| **PUT locked (data / P0)** | GET immediately after 409: `depts=1` · `positions=1` · **same** `cell_id=2822b499-…` · `need_hire=7` · `lifecycle=need_hire_approved` — **no wipe** | 🟢 **P0 CLOSED** |
| **Spawn after 409** | POST spawn → **201** `created:1` · YCTD `headcount_cell_id` = locked cell | 🟢 |
| **Re-spawn** | POST again → `created:0` · `skipped_duplicate:1` (BR-BP-HC-04) | 🟢 |
| **allow_override O3** | Separate approved plan → PUT `allow_override=true` need 3→9 → **200** · cell_id retained when sent | 🟢 |
| **Invent deny** | `/rec/headcount-plans` · `/rec_headcount_plans` → **404** | 🟢 |
| **submit-workflow** | Fresh draft → POST submit-workflow → **201** `HRM-REC-PLAN-WF-200` | 🟢 |

### P0 defect status

| | |
|--|--|
| **ID** | `R-REC-HC-PUT-LOCKED-WIPE` |
| **Prior** | QA-01 P0 OPEN — DELETE-before-assert wiped positions |
| **This seat** | **CLOSED** — 409 + grid intact + spawn eligible |
| **spec_ref** | AC-REC-HC-01-EX-04 · BR-REC-01-LOCK · API F-REC-HC-01 (7) |

---

## U65 browser — J-HRM-REC-HC-01

**URL:** `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=plans`  
**cấm seed:** respected · no `pnpm seed:*` · no DB fake  
**Runner:** `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-01-cluster-qa-02.mjs` · O4 `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-01-o4.mjs`

### UF block — single «Cần tuyển» / Lưu / F5

| Step | Evidence |
|------|----------|
| Before | Định biên tab · `rec-hc-plan-title` present |
| UI audit ALT-03 | `needHireInputs=12` · `ns=0` · `dx=0` |
| Action | Title `QA O4 RECQA2-MSKT56EP` · CT tháng 8 = 5 → **Tạo định biên** |
| Network | POST `/api/hrm/recruitment/recruitment-plans` → **201** |
| FE after 2xx | List row title count=1 |
| F5 | Title count=1 persist |
| Verdict | 🟢 |

### UF block — Gửi duyệt

| Step | Evidence |
|------|----------|
| Action | Detail → **Gửi duyệt QT** |
| Network | POST `…/submit-workflow` → **201** |
| Verdict | 🟢 |

### UF block — Approve O4 warn-allow

| Step | Evidence |
|------|----------|
| Path | Separate draft plan stamp `O4T6PIE` (approve btn present — not pending_approval) |
| Action | Detail → **Duyệt** |
| Network | PATCH `…/status` → **200** |
| FE | Toast: *«Đã duyệt dù có ô vượt Hiện tại (O4 — warn, không chặn)»* · `over=true` · locked els=1 · status approved |
| Verdict | 🟢 O4 |

### UF block — after 409 UI must not blank (P0 user perspective)

| Step | Evidence |
|------|----------|
| Setup | Open L1 approved plan `QA ĐB RECQA2-MSKT56EP` on FE |
| Action | Browser-context PUT bump without override (same auth as portal) |
| Network | **409** `HRM-HC-CELL-LOCKED` |
| FE after | Reload detail · grid still present (`gridAfter=1` · `hasPos=true` · `blank=false`) — not white / 0 positions |
| Verdict | 🟢 |

---

## U65 browser — J-HRM-REC-HC-01b

| Step | Evidence |
|------|----------|
| Spawn create | **L1** after 409: POST spawn **201** `created:1` (YCTD `38d92b38-…` · cell `2822b499-…`) |
| Re-spawn | **L1** `created:0` · `skipped_duplicate:1` |
| FE spawn btn | NOTE_BLOCKED on L1 plan detail this run (btn ABSENT after reload) — spawn proven on L1 + must_keep |
| YCTD list → detail | Tab requisitions rows=17 · click row · **no 404** · **J-HRM-05** 🟢 |
| Verdict | 🟢 with OBS on FE spawn button visibility |

**Artifacts:**  
- `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-01-cluster-qa-02.json`  
- `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-01-cluster-qa-02-l1.json`  
- screens: `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-01-cluster-qa-02/`

---

## Journey rollup

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-HC-01** | 🟢 | Single CT · Lưu 201+F5 · submit · O4 warn-allow · UI after 409 not blank |
| **J-HRM-REC-HC-01b** | 🟢 / OBS | L1 spawn create+skip PASS · FE spawn btn OBS · J-HRM-05 PASS |
| **L1 API P0** | 🟢 | Locked PUT no wipe · spawn eligible · override O3 |

---

## Residual (record only — do NOT fix this seat)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-REC-HC-OVERRIDE-CELLID** | P2 | ba-process / dev-be | **CONFIRMED** this seat: `allow_override` PUT **without** `cell_id` minted new id (`30ae64e4-…` → `f447d354-…`). Possible orphan YCTD `headcount_cell_id`. Needs BA AC (FE always send `cell_id` vs BE keep by natural key). |
| **R-ATT-CRUD-RD-PARITY-SPEC** | P2 | dev-be (attendance) | Pre-existing `p1-phase1-be-crud-rd-parity.spec.ts` `AttendanceService.getRecordById` fails — **outside** REC-01 BE-02 diff |
| Honesty | — | qc | Keep `recruitment_uat_ready=false` · C-SLICE |
| O3 qty_drift FE AlertDialog | P2 | — | Optional; NOTE_BLOCKED (approved edit locked on FE) |
| FE spawn btn visibility | OBS | — | L1 spawn proven; FE btn ABSENT on already-spawned plan detail this run |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qa-02.md` |
| **completion_report** | L0 PASS. L1 P0 CLOSED: 409 CELL-LOCKED leaves grid+cell+spawn eligible; allow_override 200; spawn create/skip; U19; invent deny; submit-workflow 201. U65 J-HRM-REC-HC-01/01b PASS (single CT, Lưu+F5, submit, O4, UI no-blank after 409, J-HRM-05). Residuals recorded: OVERRIDE-CELLID (confirmed mint), ATT parity P2 outside diff. Honesty false · C-SLICE · no seed · no module REC UAT claim. |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-QC-02
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
depends_on: QA-02 PASS_TO_PM stamp RECQA2-MSKT56EP
entry_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qa-02.md · parent BE-02 READY · QA-01 FAIL closed
READ: qa-02.md · be-02.md · BA-01 AC-REC-HC-01-EX-04 · API-01 §5 F-REC-HC-01 (7)
MISSION (narrow GWC — C-SLICE):
1) Audit P0 R-REC-HC-PUT-LOCKED-WIPE CLOSED: 409 + GET intact + spawn after 409 created:1 — evidence stamp RECQA2-MSKT56EP / plan 3f302f4d-…
2) Confirm allow_override O3 200 · U65 J-HRM-REC-HC-01/01b browser blocks · U19 · submit-workflow must_keep
3) DENY flip recruitment_uat_ready · DENY claim module REC UAT (C-SLICE-≠-MODULE)
4) Carry residual R-REC-HC-OVERRIDE-CELLID (P2 ba-process AC) · R-ATT-CRUD-RD-PARITY-SPEC (P2 attendance, out of slice)
exit: GO WITH CONDITIONS or GO · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qc-02.md · PASS_TO_PM
cấm: seed · honesty flip · promote module REC UAT
```
