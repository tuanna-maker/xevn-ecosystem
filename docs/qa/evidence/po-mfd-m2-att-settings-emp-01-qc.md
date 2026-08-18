# Evidence — `PO-MFD-M2-ATT-SETTINGS-EMP-01-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SETTINGS-EMP-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 Attendance **Thiết lập → Nhân viên** fidelity (matrix **#31 PARTIAL**) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-settings-emp-01-qa.md`](po-mfd-m2-att-settings-emp-01-qa.md) PASS_TO_PM |
| **runtime** | [`_tmp-po-mfd-m2-att-settings-emp-01-browser.json`](_tmp-po-mfd-m2-att-settings-emp-01-browser.json) verdict **PASS** · `matrix_stamp.31=PARTIAL` · `uat_done: false` · `attendance_closed: false` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/01-attendance-shell.png` · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/03-settings-employees-loaded.png` · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/04-after-refresh-click.png` · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/05-after-import-click.png` |
| **spec_ref** | ATT-C7 · matrix #31 · `HRM-ATTENDANCE_FIDELITY_MATRIX.md` · `useEmployees` · SPEC_GAP Import/Refresh |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · matrix **#31 LIVE** · Import/Refresh wired · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice: Attendance **Thiết lập → Nhân viên** (matrix #31) after QA `PO-MFD-M2-ATT-SETTINGS-EMP-01`. Browser + runtime prove (1) HDSD nav **Thiết lập** → sidebar **Nhân viên**, (2) list `GET …/employees` **200** `HRM-EMP-200` total/rowCount **59** · errorBanner=false · idle GET employees **0**/5s · idle all HRM GET **0**, (3) CTAs **Lấy lại dữ liệu** + **Nhập khẩu** clicked once with **0** network / no file dialog → **SPEC_GAP unwired**. Stamp remains **#31 PARTIAL** (list LIVE; Import/Refresh not LIVE). CONDITION: `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` → **dev-fe** (PM already DISPATCHED `PO-MFD-M2-ATT-SETTINGS-EMP-01-FE` in parallel). OBS mapping mã chấm công / leave days non-blocking. **NOT** Phase 1 / UAT DONE · Attendance **not** CLOSED. Did **not** reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK GWC.

**Conditions:** Import/Refresh wire CONDITION (P1 FE) · #31 stays PARTIAL until wire retest · OBS mapping SPEC_GAP · QA pack process 2/8 · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qa.md` | PASS_TO_PM; #31 PARTIAL; list 200 HRM-EMP-200 59 rows; idle0; Refresh/Import 0 network SPEC_GAP; uat_done false; U65 | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-settings-emp-01-browser.json` | verdict PASS; load idleGets=0 · refresh.wired=false · import.wired=false · matrix_stamp 31=PARTIAL · pageErrors=[] · uat_done false | **ACCEPT** Network SoT |
| Screens (4 key) | shell · employees loaded · after refresh · after import | **ACCEPT** visual spot — see command table PNG rows |
| Matrix fidelity #31 | **PARTIAL** (`HRM-ATTENDANCE_FIDELITY_MATRIX.md` SETTINGS-EMP-01) | **ACCEPT** MATCH — **do not invent LIVE** |
| Bus | `pm -> dev-fe \| DISPATCHED PO-MFD-M2-ATT-SETTINGS-EMP-01-FE` (parallel wire) | **ACCEPT** residual owner already in flight |

---

## Gate AC audit (narrow M2 SETTINGS-EMP-01)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | Navigate HDSD Thiết lập → Nhân viên + inventory | `steps.nav_settings` + `nav_employees_sidebar` PASS · inventory surface 31 🟢 · PNG loaded Thiết lập + Nhân viên | 🟢 **PASS** |
| 2 | Page load no ERROR; list honest | `errorBanner=false` · GET employees **200** `HRM-EMP-200` total=59 · tableRows=59 · PNG `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/03-settings-employees-loaded.png` | 🟢 **PASS** |
| 3 | Import/Refresh CTA exercise → 2xx **or** SPEC_GAP | refresh clicked · empGets=0 · wired=false · import clicked · fileChooser=false · wired=false · PNG `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/04-after-refresh-click.png` · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/05-after-import-click.png` | 🟢 **PASS** (documented SPEC_GAP — not invent LIVE) |
| 4 | No GET storm; F5 if mutate | idleGets=0 · idleAllHrmGets=0 · F5 SKIP (no mutate) | 🟢 **PASS** |
| 5 | Screenshot + click path + URL | 4–5 PNG + portal_url above | 🟢 **PASS** |
| 6 | Matrix #31 PARTIAL honesty | matrix file + JSON stamp **PARTIAL** MATCH · list LIVE ≠ full seat LIVE | 🟢 **PASS** (**PARTIAL** confirmed) |
| 7 | No invent Attendance CLOSED / uat_done | JSON + QA `uat_done: false` · `attendance_closed: false` | 🟢 **PASS** (honesty) |
| 8 | OBS mapping mã chấm công / leave days | honesty leave_days=— · attendance_code=employee_code · UNMAPPED | 🟡 **OBS only** (not NO-GO) |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| Matrix **#31** Thiết lập → Nhân viên list + CTA honesty | **In-scope** this gate (fidelity SoT; no dedicated J-* settings-emp row) | **PASS** (browser Network + PNG) — stamp **PARTIAL** |
| **J-HRM-06** Chấm công → bản ghi / yêu cầu | Related attendance shell; not re-certified this seat | **prior ✅** on `PROGRAM_JOURNEY_MAP.md` · **untouched** |
| **J-HRM-06b** Bảng chấm công | Out of this seat | **prior ✅** · **untouched** |
| Attendance CLOSED / full STUB cluster | Forbidden | **not claimed** |

Mandatory in-scope for this gate: matrix #31 Settings→Nhân viên AC with honest PARTIAL. No invent PASS on Import/Refresh wire. No invent LIVE. No reopen REPORTS/REQUESTS/LEAVE/OT/CLOCK.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | #31 list LIVE — GET employees 200 · 59 rows · no ERROR · idle0 · CTA Import/Refresh **unwired** (SPEC_GAP P1 CONDITION) |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing `portal_url`, `journey_l25`) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA L0 entry+exit `qc:fe-be-health` PASS; browser JSON l0 hrm/xbos/portal **200** |
| **OUT-OF-SCOPE / OBS** | Mapping mã chấm công / leave-balance wire (OBS BA) · Phase1/UAT DONE · Attendance CLOSED · REPORTS/REQUESTS/LEAVE/OT/CLOCK prior GWC · invent #31 LIVE |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote SETTINGS-EMP-01 close. Import/Refresh unwired is **CONDITION** (not NO-GO of list seat) when honesty stamps PARTIAL.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 GWC? |
|----|--------|-----|-------|---------------------|
| #31 list load + idle0 + no ERROR | **CLOSED** this seat (list LIVE) | — | — | No |
| `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` | **OPEN CONDITION** | **P1** | **dev-fe** (DISPATCHED `PO-MFD-M2-ATT-SETTINGS-EMP-01-FE`) | **Yes as CONDITION** — keeps #31 PARTIAL; wire then QA retest for LIVE upgrade |
| `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` | OPEN OBS | P2 | ba-process | No — UNMAPPED; non-blocking PARTIAL |
| `C-SETTINGSEMP01-QA-PACK-FMT-01` | OPEN process | P3 | qa | No — add portal_url + J-* on next QA MD |
| REPORTS / REQUESTS / LEAVE / OT / CLOCK prior GWC | **untouched** | — | — | No — not reopened |
| Phase1 / UAT DONE / Attendance CLOSED / #31 LIVE | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0 FAIL** that reverses list AC. P1 CONDITION = Import/Refresh wire (already DISPATCHED FE).

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
3. **Do not** invent matrix **#31 LIVE** — remains **PARTIAL** until Import («Nhập khẩu») + Refresh («Lấy lại dữ liệu») wired under U65 and QA retest PASS.
4. **CONDITION:** `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` → complete `PO-MFD-M2-ATT-SETTINGS-EMP-01-FE` → QA retest → optional QC re-gate for LIVE upgrade.
5. OBS mapping SPEC_GAP stays **OBS** — optional BA; not list NO-GO.
6. **Do not** reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK GWC without new FAIL evidence.
7. U65: **no seed** in acceptance path.
8. QA pack format 2/8 remains **CONDITION (process)** — not product NO-GO.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qa.md
→ FAIL 2/8 — missing portal_url, journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P1 SETTINGS-EMP-01 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qc.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qc.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qa.md` | **FAIL** exit **1** · **2/8** missing portal_url, journey_l25 (process) |
| Disk check PNG under `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/` | **PASS** · 01 / 03 / 04 / 05 / 07 present |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-settings-emp-01-browser.json` | **PASS** · verdict PASS · HRM-EMP-200 59 · idleGets=0 · refresh/import wired=false · matrix 31=PARTIAL · pageErrors=[] · uat_done false |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/01-attendance-shell.png` | **PASS** · attendance shell |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/03-settings-employees-loaded.png` | **PASS** · Thiết lập · Nhân viên · Lấy lại dữ liệu · Nhập khẩu · table rows · no ERROR |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/04-after-refresh-click.png` | **PASS** · UI unchanged after Refresh (no refetch spin) |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/05-after-import-click.png` | **PASS** · no import dialog |
| Matrix #31 vs `HRM-ATTENDANCE_FIDELITY_MATRIX.md` | **PASS** · #31 **PARTIAL** MATCH — not invent LIVE |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qc.md` | **PASS** exit **0** (8/8) [post-write] |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qc.md --check-assets` | **PASS** exit **0** [post-write] |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | browser JSON l0 hrm/xbos/portal 200 |
| **LOGIN** | `ceo@xe.vn` company_id=main | **PASS** | browser login http 201 |
| **READ** #31 employees list | LIVE · GET 200 HRM-EMP-200 · 59 rows · no ERROR · idle0 | **PASS** | `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/03-settings-employees-loaded.png` |
| **CTA** Refresh «Lấy lại dữ liệu» | wire → refetch **or** SPEC_GAP | **PARTIAL** / SPEC_GAP | refresh.wired=false · empGets=0 · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/04-after-refresh-click.png` |
| **CTA** Import «Nhập khẩu» | wire → dialog/API **or** SPEC_GAP | **PARTIAL** / SPEC_GAP | import.wired=false · fileChooser=false · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/05-after-import-click.png` |
| Matrix #31 L2.5-equivalent | tab→sidebar→list honesty | **PASS** (stamp PARTIAL) | this seat |
| **J-HRM-06** | related shell | **prior ✅** | untouched this seat |
| Attendance CLOSED / uat_done / #31 LIVE | Forbidden invent | **not claimed** | uat_done false · stamp PARTIAL |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Attendance CLOSED
- Did not invent matrix **#31 LIVE**
- Did not invent Import/Refresh wired
- Did not reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK GWC
- Did not NO-GO solely on OBS mapping or QA pack format gap
- Did not GO without opening QA MD + runtime JSON + PNG spot-check

---

## completion_report

**Closed:** QC L3 narrow gate **PO-MFD-M2-ATT-SETTINGS-EMP-01-QC** → **GO WITH CONDITIONS**. Matrix **#31 PARTIAL** confirmed (list GET **200** `HRM-EMP-200` · 59 rows · idle GET 0 · no ERROR · Import/Refresh CTAs exercised = **0** network SPEC_GAP). CONDITION `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` → dev-fe (already DISPATCHED). OBS mapping SPEC_GAP non-blocking. **uat_done false**. Attendance **not** CLOSED. U65 zero-seed. REPORTS/REQUESTS/LEAVE/OT/CLOCK **not** reopened.

**Open / residual owners:** `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` (dev-fe P1 CONDITION); `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` (ba-process OBS); QA pack portal_url/J-* (`qa` P3). **No invent #31 LIVE**.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-SETTINGS-EMP-01-CLOSE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS — docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qc.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-SETTINGS-EMP-01 / QA / QC as GWC #31 PARTIAL slice only (list LIVE; Import/Refresh unwired CONDITION); uat_done false; NOT Phase1/UAT DONE; NOT Attendance CLOSED; do NOT invent #31 LIVE.
2) Keep parallel FE in flight: PO-MFD-M2-ATT-SETTINGS-EMP-01-FE (R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED). On FE READY_FOR_QA → Task qa retest U65 browser for Refresh refetch + Import dialog/API → only then consider #31 LIVE upgrade + optional QC re-gate.
3) OBS R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP stays OBS (ba-process) — non-blocking.
4) Do NOT reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK GWC without new FAIL.
5) Optional P3: remind QA to include portal_url + J-* on next evidence MD (C-SETTINGSEMP01-QA-PACK-FMT-01).
6) Do NOT claim Attendance CLOSED / uat_done from this GWC.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qc.md`

## ack_status

**PASS_TO_PM**
