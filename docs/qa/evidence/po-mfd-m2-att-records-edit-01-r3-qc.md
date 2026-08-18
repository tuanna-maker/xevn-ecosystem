# Evidence — `PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 Attendance **matrix #13 edit** (HRM-AT-03 status PATCH) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **journey_l25** | **J-HRM-06** mutate (records edit) · **PASS** this seat |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-records-edit-01-r3-qa.md`](po-mfd-m2-att-records-edit-01-r3-qa.md) PASS_TO_PM |
| **runtime** | [`_tmp-po-mfd-m2-att-records-edit-01-r3-browser.json`](_tmp-po-mfd-m2-att-records-edit-01-r3-browser.json) verdict **PASS** · PATCH **200** `HRM-ATT-202` · `xCompanyId=trsport` · `uat_done: false` · `attendance_closed: false` · `face_live: false` |
| **fe_fix** | [`po-mfd-m2-att-records-edit-01-r3-fe.md`](po-mfd-m2-att-records-edit-01-r3-fe.md) READY_FOR_QA (PATCH mutate scope) |
| **prior_fail** | [`po-mfd-m2-att-records-edit-01-r2-qa.md`](po-mfd-m2-att-records-edit-01-r2-qa.md) PATCH **409** `x-company-id=main` → **CLOSED** on R3 |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/` (01..06) |
| **spec_ref** | HRM-AT-03 · matrix #13 edit · **J-HRM-06** |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · Face LIVE · `uat_done` remains **false** |
| **do_not_reopen** | CLOCK · SHEETS · LEAVE · OT (without new defect) |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice: Attendance matrix **#13 list+edit LIVE** after QA R3 browser U65. Prior **`R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE` CLOSED**: **Lưu** → PATCH `/api/hrm/attendance/records/:id/status` **200** `HRM-ATT-202` with **`x-company-id=trsport`** (NOT `main`). FE after 2xx shows «Chờ duyệt»; F5 persists; dialog date `04/08/2026`; `pageErrors=[]`. DATE-CRASH remains CLOSED from R2. OBS DATE-FORMAT + LABEL-DRIFT (+ employee N/A display) non-blocking. **NOT** Phase 1 / UAT DONE · Attendance **not** CLOSED · Face **not** LIVE · CLOCK/SHEETS/LEAVE/OT **untouched**.

**Conditions:** Bound to #13 edit / AT-03 mutate seat only · OBS polish not NO-GO · FE pack process gap 2/8 not product NO-GO · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qa.md` | PASS_TO_PM; PATCH 200 HRM-ATT-202 · x-company-id=trsport; F5 «Chờ duyệt»; #13 LIVE list+edit; uat_done false; U65 | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-records-edit-01-r3-browser.json` | verdict PASS; criteria.patch_x_company_id_trsport=true; patch_not_x_company_id_main=true; f5.statusPersisted=true; pageErrors=[]; uat_done false; attendance_closed false; face_live false | **ACCEPT** Network SoT |
| `docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-fe.md` | READY_FOR_QA; resolveHrmMutateCompanyScope; vitest 17/17 | **ACCEPT** FE root-cause chain |
| `docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-qa.md` | FAIL PATCH 409 x-company-id=main | **ACCEPT** prior residual CLOSED by R3 |
| Screens (6) | list · kebab · dialog date · status change · toast after PATCH · F5 persist | **ACCEPT** visual spot |
| Matrix fidelity #13 | **LIVE** list+edit (`PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-QA`) | **ACCEPT** honesty stamp |

---

## Gate AC audit (narrow M2 RECORDS-EDIT R3)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | L0 `qc:fe-be-health` PASS entry+exit | QA cites PASS; JSON l0 hrm/xbos/portal **200** | 🟢 **PASS** |
| 2 | Login NV → attendance trsport | login http **201** · companyId=trsport · portal_url companyId=trsport | 🟢 **PASS** |
| 3 | List GET 200 HRM-ATT-200 | listGets **200** `HRM-ATT-200` · rowCount=3 · PNG `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/01-records-list.png` | 🟢 **PASS** |
| 4 | Row kebab → Chỉnh sửa → dialog | dialogAfterEdit=true · testids dialog/status/save/date · PNG `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/03-edit-dialog.png` | 🟢 **PASS** |
| 5 | Date dd/MM/yyyy · pageErrors=[] | dateDisplay=`04/08/2026` · pageErrors=[] · DATE-CRASH CLOSED | 🟢 **PASS** |
| 6 | Status → Lưu → PATCH 2xx · x-company-id=trsport NOT main | PATCH **200** `HRM-ATT-202` · bodyStatus=pending · **xCompanyId=trsport** · criteria.patch_not_x_company_id_main | 🟢 **PASS** · prior 409 CLOSED |
| 7 | FE after 2xx + F5 persist | statusAfterFe «Chờ duyệt» · statusAfterF5 «Chờ duyệt» · PNG `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/05-after-patch.png` · `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/06-after-f5.png` | 🟢 **PASS** |
| 8 | Matrix #13 LIVE list+edit honesty | matrix stamp MATCH QA · not invent Attendance CLOSED | 🟢 **PASS** |
| 9 | Forbidden: seed · Delete cheat · Face/Attendance invent | QA Forbidden checks No · JSON face_live/attendance_closed false | 🟢 **PASS** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| **J-HRM-06** Chấm công → bản ghi edit mutate | **In-scope** this gate (menu → Dữ liệu chấm công → Chỉnh sửa → Lưu → F5) | **PASS** (Network PATCH 200 + PNG after-patch/F5) |
| **J-HRM-06b** Bảng chấm công | Prior SHEETS GWC | **untouched** |
| CLOCK / LEAVE / OT / REQUESTS | Prior seats | **untouched** — not invent FAIL |
| Attendance CLOSED / Face LIVE | Forbidden | **not claimed** |

Mandatory in-scope for this gate: J-HRM-06 **records edit mutate** **PASS**. Full Attendance module / full J-HRM-06 program re-gate **not** claimed CLOSED.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | #13 edit LIVE · PATCH **200** `HRM-ATT-202` · `x-company-id=trsport` · FE+F5 «Chờ duyệt» · DATE-CRASH CLOSED · PATCH-SCOPE CLOSED |
| **PROCESS** | FE evidence pack `verify:qc:evidence-pack` **2/8** (missing command_table · portal_url) — **process-only**; QA pack **8/8 PASS** |
| **ENV** | L0 hrm/xbos/portal 200 in runtime JSON; QA L0 entry+exit PASS |
| **OBS (optional)** | DATE-FORMAT list DTO non-ISO (FE survives) · LABEL-DRIFT «Bản ghi» vs «Dữ liệu chấm công» · employee display N/A |
| **OUT-OF-SCOPE** | Full Attendance CLOSED · Phase1/UAT DONE · Face LIVE · reopen CLOCK/SHEETS/LEAVE/OT · invent uat_done |

ENV does not drive verdict. Process FE pack gap + OBS do **not** demote R3 edit close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this GWC? |
|----|--------|-----|-------|------------------|
| `R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH` | **CLOSED** | — | — | No |
| `R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE` | **CLOSED** | — | — | No |
| `R-MFD-M2-ATT-RECORDS-EDIT-STUB` | **CLOSED** (superseded by R3 LIVE) | — | — | No — prior RECORDS-01 CONDITION closed by this seat |
| `R-MFD-M2-ATT-RECORDS-DATE-FORMAT` | OPEN OBS | P1 OBS | **dev-be** | **No** — FE hardened; dialog date OK |
| `R-MFD-M2-ATT-RECORDS-LABEL-DRIFT` | OPEN OBS | P3 | ba / dev-fe | **No** |
| Employee N/A display on list/modal | OPEN OBS | P3 | ba / dev-fe | **No** — does not block AT-03 mutate AC |
| `C-RECORDS-EDIT-R3-FE-PACK-FMT` | OPEN process | P3 | qa/dev-fe | No — FE MD add portal_url + command_table next wave |
| Full Attendance / Phase1 / UAT DONE / Face LIVE | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0/P1 FAIL** open for the **#13 edit / AT-03 mutate** slice. OBS only.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. Do **not** claim full **Attendance** module CLOSED.
3. **uat_done** remains **false**.
4. Do **not** invent Face LIVE.
5. OBS DATE-FORMAT / LABEL-DRIFT / employee N/A = **optional** polish — not invent FAIL on AT-03 mutate AC.
6. U65: **no seed** in acceptance path.
7. CLOCK / SHEETS / LEAVE / OT prior GWC remain valid — **not reopened** without new defect.
8. Bound scope = matrix **#13 list+edit** only (not invent #10/#11–12/#19–24 reopen).

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qa.md
→ PASS exit 0 (8/8)
```

### FE pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-fe.md
→ FAIL 2/8 — missing command_table, portal_url
```

**PROCESS** — not product NO-GO (QA browser + runtime independently verified).

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qc.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qc.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qa.md` | **PASS** exit **0** · **8/8** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-fe.md` | **FAIL** exit **1** · **2/8** missing command_table / portal_url (process) |
| Disk check 6 PNG under `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/` | **PASS** · 01..06 present (66812…73530 bytes) |
| Runtime cross-check `_tmp-po-mfd-m2-att-records-edit-01-r3-browser.json` | **PASS** · PATCH 200 HRM-ATT-202 · xCompanyId=trsport · F5 persist · pageErrors=[] · failReasons=[] · uat_done false |
| Open QA MD `po-mfd-m2-att-records-edit-01-r3-qa.md` | **PASS** · U65 · residuals PATCH-SCOPE+DATE-CRASH CLOSED · no Attendance invent |
| Open FE MD `po-mfd-m2-att-records-edit-01-r3-fe.md` | **PASS** · mutate scope FIX · vitest cited |
| Open prior FAIL `po-mfd-m2-att-records-edit-01-r2-qa.md` | **ACCEPT** · 409 main superseded CLOSED |
| Matrix #13 LIVE list+edit stamp | **ACCEPT** · matches QA Network SoT |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/03-edit-dialog.png` | **PASS** · Chỉnh sửa · date **04/08/2026** · status Có mặt |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/05-after-patch.png` | **PASS** · toast Thành công · row1 «Chờ duyệt» |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/06-after-f5.png` | **PASS** · status still «Chờ duyệt» after F5 |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qc.md` | **PASS** exit **0** (8/8) [post-write] |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qc.md --check-assets` | **PASS** exit **0** [post-write] |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** | stack health entry+exit | **PASS** | QA L0 + runtime l0 200 |
| **LOGIN** | `uat.nv0007@xe.vn` company_id=trsport | **PASS** | browser login 201 |
| **READ** #13 list | GET 200 HRM-ATT-200 · 3 rows | **PASS** | listGets + PNG 01 |
| **UPDATE** AT-03 status | PATCH 200 HRM-ATT-202 · x-company-id=trsport | **PASS** | recordsPatches + criteria |
| **READ** F5 after update | status «Chờ duyệt» persists | **PASS** | f5.statusPersisted + PNG 06 |
| **Matrix #13** | LIVE list+edit stamp | **PASS** | fidelity matrix + QA |
| **J-HRM-06** mutate | records edit click path | **PASS** | Network + PNG |
| Delete→absent as AT-03 | Forbidden | **not used** | honesty |
| CLOCK / SHEETS / LEAVE / OT | prior GWC | **untouched** | honesty |
| Full Attendance CLOSED | program | **NOT CLAIMED** | uat_done false |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent full Attendance CLOSED
- Did not invent Face LIVE / uat_done true
- Did not reopen CLOCK / SHEETS / LEAVE / OT as invent FAIL
- Did not treat Delete→absent as AT-03 PASS
- Did not NO-GO solely on FE pack format gap or OBS date/label
- Did not GO without opening QA MD + FE MD + R2 FAIL + browser JSON + matrix + PNG spot

---

## completion_report

**Closed:** L3 QC gate `PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-QC` for matrix **#13 edit / HRM-AT-03**. Residuals **DATE-CRASH** + **PATCH-SCOPE** **CLOSED** (PATCH **200** `HRM-ATT-202` · `x-company-id=trsport` · FE+F5 «Chờ duyệt»). Prior RECORDS-01 CONDITION `R-MFD-M2-ATT-RECORDS-EDIT-STUB` superseded CLOSED. Matrix #13 **LIVE** list+edit consistent with QA. J-HRM-06 mutate slice **PASS**. U65 zero-seed. OBS DATE-FORMAT / LABEL-DRIFT / N/A employee optional only.

**Residual / conditions:** DATE-FORMAT OBS (dev-be); LABEL-DRIFT + N/A display OBS (ba/dev-fe); FE pack format P3; **uat_done=false**; **NOT** Attendance CLOSED · **NOT** Face LIVE · **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-PM-CLOSE
from_role: qc
to_role: pm
lane: execution
priority: P0
entry_criteria:
  - docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE CLOSED (PATCH 200 HRM-ATT-202 · x-company-id=trsport · F5 «Chờ duyệt»)
  - R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH CLOSED
  - Matrix #13 LIVE list+edit · J-HRM-06 mutate PASS this seat
  - OBS only: DATE-FORMAT · LABEL-DRIFT · employee N/A (non-blocking)
exit_criteria:
  1) Bus CLOSED PO-MFD-M2-ATT-RECORDS-EDIT-01-R3 (GWC) · update TEAM_WORKING_NOW / backlog
  2) Do NOT stamp Attendance CLOSED / Face LIVE / uat_done true
  3) Do NOT reopen CLOCK/SHEETS/LEAVE/OT without new defect
  4) Optional later: dispatch OBS DATE-FORMAT (dev-be) / LABEL-DRIFT (ba) as P2/P3 — not P0 blocker
  5) Continue M2 backlog next open seat (e.g. SETTINGS-EMP if still OPEN) per PM_OPEN_BACKLOG
cấm: invent Attendance CLOSED · invent Face LIVE · invent uat_done · seed
```
