# Evidence — `PO-MFD-M2-ATT-RECORDS-01-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RECORDS-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 Attendance **Bản ghi / Dữ liệu chấm công** list fidelity (matrix #13 list only) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-records-01-qa.md`](po-mfd-m2-att-records-01-qa.md) PASS_TO_PM |
| **runtime** | [`_tmp-po-mfd-m2-att-records-01-browser.json`](_tmp-po-mfd-m2-att-records-01-browser.json) verdict **PASS** · `uat_done: false` · `attendance_closed: false` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-records-01/01-records-list.png` · `docs/qa/evidence/screens/po-mfd-m2-att-records-01/02-row-menu.png` · `docs/qa/evidence/screens/po-mfd-m2-att-records-01/03-after-edit-click.png` · `docs/qa/evidence/screens/po-mfd-m2-att-records-01/04-no-patch-cta.png` |
| **spec_ref** | HRM-AT-02 · HRM-AT-03 · matrix #13 · **J-HRM-06** (list slice) · TC-HRM-AT-02-LIST-* · M2 backlog records |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · AT-03 PATCH status LIVE · edit modal LIVE · Face LIVE · `uat_done` remains **false** |
| **do_not_reopen** | CLOCK-01 R2 GWC · SHEETS-01 GWC |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice: Attendance matrix **#13 list** after QA `PO-MFD-M2-ATT-RECORDS-01`. Browser + runtime prove (1) list **LIVE** (title «Dữ liệu chấm công» + GET `/api/hrm/attendance/records` **200** `HRM-ATT-200` · `rowCount=3` · storm records GET **0**/10s · no Sync ERROR · `pageErrors=[]`), (2) edit modal / PATCH status **STUB honesty** (`dialogAfterEdit=false` · `patchesFired=0` · menuitem «Chỉnh sửa» present without wiring). **Do not invent AT-03 PASS.** Residual `R-MFD-M2-ATT-RECORDS-EDIT-STUB` → **dev-fe**. Label drift + `status.present` i18n = OBS only. **NOT** Phase 1 / UAT DONE · Attendance **not** CLOSED · CLOCK/SHEETS **untouched**.

**Conditions:** Edit/PATCH AT-03 remains OPEN CONDITION · QA pack process gap (2/8) does not demote product list close · label/i18n/N/A display OBS · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-records-01-qa.md` | PASS_TO_PM; #13 list LIVE · edit STUB; GET 200 HRM-ATT-200 · storm0 · patchesFired=0; uat_done false; U65 | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-records-01-browser.json` | verdict PASS; listGets 200 HRM-ATT-200 rowCount=3; storm10s.recordsGets=0; modal.runtime=STUB; row13_patch.patchesFired=0; recordsPatches=[]; pageErrors=[]; uat_done false; attendance_closed false | **ACCEPT** Network SoT |
| Screens (4) | list · kebab Sửa/Xóa · after Edit no modal · STUB honesty | **ACCEPT** visual spot — see command table PNG rows |
| Matrix fidelity #13 | stamped LIVE list · **STUB** edit/PATCH (`HRM-ATTENDANCE_FIDELITY_MATRIX.md`) | **ACCEPT** (honest split stamp — not Attendance CLOSED) |

---

## Gate AC audit (narrow M2 RECORDS-01 list seat)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | #13 list LIVE · GET 200 `HRM-ATT-200` · no Sync ERROR · no GET storm | `surfaces.row13_list.runtime=LIVE` · GET **200** `HRM-ATT-200` · `dataRowCount=3` · `syncError=false` · `storm10s.recordsGets=0` · `pageErrors=[]` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-records-01/01-records-list.png` | 🟢 **PASS** |
| 2 | Rows honesty (empty OR rows; U65) | `emptyCopy=false` · 3 rows · summary cards 3/3 · not seed this seat | 🟢 **PASS** |
| 3 | Row → Sửa modal LIVE | `modal.runtime=STUB` · `dialogAfterEdit=false` · `editModalLive=false` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-records-01/02-row-menu.png` (Chỉnh sửa visible) · `docs/qa/evidence/screens/po-mfd-m2-att-records-01/03-after-edit-click.png` (no dialog) | 🟡 **STUB / CONDITION** — **not** invent LIVE |
| 4 | PATCH `/records/:id/status` from UI (AT-03) | `patchesFired=0` · `recordsPatches=[]` · `patchCtaKind=STUB_EDIT` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-records-01/04-no-patch-cta.png` | 🟡 **STUB / CONDITION** — **not** invent AT-03 PASS · **not** Delete→absent cheat |
| 5 | Matrix #13 stamp honesty | LIVE list · STUB edit/PATCH | 🟢 **PASS** (honest) |
| 6 | No invent Attendance CLOSED / Face LIVE / uat_done | JSON + QA `uat_done: false` · `attendance_closed: false` | 🟢 **PASS** (honesty) |
| 7 | Do not reopen CLOCK / SHEETS | QA + this gate scope list seat only | 🟢 **PASS** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| **J-HRM-06** Chấm công → bản ghi / yêu cầu | **In-scope list slice** this gate (menu → records list LIVE) | **PASS** (list load + Network SoT) · mutate/detail **CONDITION** (edit STUB) |
| **J-HRM-06b** Bảng chấm công | Prior SHEETS GWC — **do not reopen** | **untouched** |
| AT-03 PATCH status UX | Residual FE wire — not this seat PASS | **CONDITION** `R-MFD-M2-ATT-RECORDS-EDIT-STUB` |
| Attendance CLOSED / Face LIVE | Forbidden | **not claimed** |

Mandatory in-scope for this gate: J-HRM-06 **list** portion **PASS**. Edit/PATCH mutate **not** claimed PASS. No untested mandatory J-* invented as full journey CLOSED.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | #13 list LIVE + storm-free GET 200 HRM-ATT-200 · edit/PATCH honest STUB (EXPECTED_NO_CTA mutate) |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing `portal_url`, `journey_l25`) — **process-only**; product list PASS independent; this QC pack targets **8/8** |
| **ENV** | QA L0 entry+exit `qc:fe-be-health` PASS; browser JSON l0 hrm/xbos/portal **200** |
| **OUT-OF-SCOPE / CONDITION** | AT-03 edit modal + PATCH status wire (`R-MFD-M2-ATT-RECORDS-EDIT-STUB` → dev-fe) · label_drift P3 · `status.present` i18n OBS · employee N/A display OBS · Phase1/UAT DONE · Attendance CLOSED · CLOCK/SHEETS reopen · Face LIVE |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote RECORDS-01 list close. STUB edit is **CONDITION**, not product NO-GO for the **list seat** PM scoped.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 list GWC? |
|----|--------|-----|-------|--------------------------|
| #13 list LIVE (GET 200 · storm0) | **CLOSED** this seat | — | — | No |
| `R-MFD-M2-ATT-RECORDS-EDIT-STUB` | **OPEN CONDITION** | **P1** | **dev-fe** | No for **list** GWC — **yes** for AT-03 / edit seat next |
| `R-MFD-M2-ATT-RECORDS-LABEL-DRIFT` | OPEN OBS | P3 | ba / dev-fe | No |
| `status.present` raw i18n · employee N/A | OBS | P3 | dev-fe | No — display polish; list AC PASS |
| `C-RECORDS01-QA-PACK-FMT-01` | OPEN process | P3 | qa | No — add portal_url + J-* on next QA MD |
| Phase1 / UAT DONE / Attendance CLOSED / Face LIVE | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0** open for this **list-only** fidelity slice. **P1 edit wire** remains CONDITION for next dispatch.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
3. **Do not** invent AT-03 / edit modal LIVE / PATCH status PASS — residual `R-MFD-M2-ATT-RECORDS-EDIT-STUB` → **dev-fe**.
4. **Do not** treat Delete → `status=absent` as AT-03 status UX PASS.
5. **Do not** reopen CLOCK-01 R2 / SHEETS-01 GWC from this seat.
6. **Do not** invent Face LIVE.
7. U65: **no seed** in acceptance path.
8. QA pack format 2/8 remains **CONDITION (process)** — not product NO-GO.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-01-qa.md
→ FAIL 2/8 — missing portal_url, journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P1 RECORDS-01 list close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-01-qc.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-01-qc.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-01-qa.md` | **FAIL** exit **1** · **2/8** missing portal_url, journey_l25 (process) |
| Disk check 4 PNG under `docs/qa/evidence/screens/po-mfd-m2-att-records-01/` | **PASS** · 01..04 present (69198…73229 bytes) |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-records-01-browser.json` | **PASS** · verdict PASS · GET 200 HRM-ATT-200 · storm0 · patchesFired=0 · modal STUB · pageErrors=[] · uat_done false |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-records-01/01-records-list.png | **PASS** · LIVE list title + 3 rows + summary 3/3 |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-records-01/02-row-menu.png | **PASS** · kebab · Chỉnh sửa / Xóa |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-records-01/03-after-edit-click.png | **PASS** · after Sửa · **no** modal/dialog |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-records-01/04-no-patch-cta.png | **PASS** · STUB honesty (no PATCH CTA LIVE) |
| Matrix #13 stamp | **ACCEPT** LIVE list · STUB edit/PATCH |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-01-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-records-01-qc.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | browser JSON l0 hrm/xbos/portal 200 |
| **LOGIN** | `uat.nv0007@xe.vn` company_id=trsport | **PASS** | browser login http 201 · hrm-mobile |
| **READ** #13 records list | LIVE · GET 200 · no storm | **PASS** | HRM-ATT-200 · storm0 · `docs/qa/evidence/screens/po-mfd-m2-att-records-01/01-records-list.png` |
| **UPDATE** AT-03 status / edit modal | LIVE mutate + F5 | **CONDITION / STUB** | patchesFired=0 · dialogAfterEdit=false · residual EDIT-STUB |
| **DELETE→absent** as AT-03 cheat | Forbidden invent PASS | **not used** | QA honesty |
| **J-HRM-06** L2.5 list slice | menu → records list | **PASS** (list) | this seat Network + PNG |
| **J-HRM-06** edit/detail mutate | modal + PATCH | **CONDITION** | R-MFD-M2-ATT-RECORDS-EDIT-STUB |
| Attendance CLOSED / Face / uat_done | Forbidden | **not claimed** | uat_done false |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Attendance CLOSED / Face LIVE
- Did not invent edit modal LIVE / AT-03 PATCH PASS
- Did not invent PATCH via Delete→absent
- Did not reopen CLOCK / SHEETS
- Did not NO-GO solely on QA pack format gap or STUB edit when PM scoped **list seat**
- Did not GO without opening QA MD + runtime JSON + PNG spot-check

---

## completion_report

**Closed:** QC L3 narrow gate **PO-MFD-M2-ATT-RECORDS-01-QC** → **GO WITH CONDITIONS**. Matrix #13 **list LIVE** (GET **200** `HRM-ATT-200` · 3 rows · storm **0** · `patchesFired=0`). Edit modal / PATCH status **STUB** accepted as CONDITION `R-MFD-M2-ATT-RECORDS-EDIT-STUB` → **dev-fe** (do not invent AT-03 PASS). Label drift / `status.present` OBS P3. QA pack format 2/8 process-only. **uat_done false**. Attendance **not** CLOSED. CLOCK/SHEETS **not** reopened. U65 zero-seed.

**Open / residual owners:** `R-MFD-M2-ATT-RECORDS-EDIT-STUB` (**dev-fe** P1); label drift / i18n OBS (ba/dev-fe P3); QA pack portal_url/J-* (`qa` P3). **No product P0** on list seat.

## next_owner

**pm** (then **dev-fe** for edit wire)

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-RECORDS-EDIT-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
u65_zero_seed: true
residual_auto_fix: true

## Entry
QC GWC: docs/qa/evidence/po-mfd-m2-att-records-01-qc.md
Verdict: GO WITH CONDITIONS — matrix #13 list LIVE CLOSED; edit/PATCH STUB CONDITION.
Residual: R-MFD-M2-ATT-RECORDS-EDIT-STUB
QA: docs/qa/evidence/po-mfd-m2-att-records-01-qa.md
Runtime SoT: docs/qa/evidence/_tmp-po-mfd-m2-att-records-01-browser.json (patchesFired=0 · dialogAfterEdit=false)
spec_ref: HRM-AT-03 · matrix #13 edit · J-HRM-06 detail/mutate

## Scope
Wire «Sửa» / Chỉnh sửa on AttendanceRecordsTable → open edit modal → status select → updateRecord / PATCH /attendance/records/:id/status 2xx → FE after 2xx + F5.
Reuse existing openEditAttendanceModal / updateAttendanceStatus if dead code path exists — ADD/FIX only.

## Exit
1. Browser U65: login → Chấm công → Dữ liệu chấm công → row Sửa → modal LIVE → change status → PATCH 2xx → FE + F5
2. Evidence MD + Network SoT (no seed; no Delete→absent as AT-03 PASS)
3. READY_FOR_QA with residual id CLOSED note
4. Do NOT invent Attendance CLOSED / Face LIVE / uat_done; do NOT reopen CLOCK/SHEETS

## Forbidden
seed · invent list FAIL · Delete→absent as status UX · Attendance CLOSED
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-records-01-qc.md`
