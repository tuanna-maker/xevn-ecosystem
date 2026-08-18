# Evidence — `PO-MFD-M2-ATT-SETTINGS-EMP-01-R2-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SETTINGS-EMP-01-R2-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 re-gate — M2 Attendance **Thiết lập → Nhân viên** fidelity (matrix **#31 LIVE** upgrade) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **journey_l25** | Matrix **#31** Settings→Nhân viên (no dedicated J-* settings-emp) · **J-HRM-06** prior ✅ untouched |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **uat_done** | **false** |
| **attendance_closed** | **false** |
| **entry** | QA [`po-mfd-m2-att-settings-emp-01-r2-qa.md`](po-mfd-m2-att-settings-emp-01-r2-qa.md) PASS_TO_PM · FE [`po-mfd-m2-att-settings-emp-01-fe.md`](po-mfd-m2-att-settings-emp-01-fe.md) · prior QC GWC PARTIAL [`po-mfd-m2-att-settings-emp-01-qc.md`](po-mfd-m2-att-settings-emp-01-qc.md) · runtime [`_tmp-po-mfd-m2-att-settings-emp-01-r2-browser.json`](_tmp-po-mfd-m2-att-settings-emp-01-r2-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/01-attendance-shell.png` · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/03-settings-employees-loaded.png` · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/04-after-refresh-click.png` · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/05-after-import-click.png` · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/07-settings-emp-final.png` |
| **spec_ref** | ATT-C7 · matrix #31 · HRM-IM-01 · FR-HRM-IM-01 · `HRM-ATTENDANCE_FIDELITY_MATRIX.md` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · Import dialog open only (no file commit) |
| **supersedes** | Prior QC GWC **#31 PARTIAL** (`po-mfd-m2-att-settings-emp-01-qc.md`) — CONDITION Import/Refresh unwired **CLOSED** this R2 |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · invent FAIL REPORTS/REQUESTS/LEAVE/OT/CLOCK · Import preview/commit mutate AC |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 SETTINGS-EMP slice only. R2 U65 browser + runtime prove honest matrix **#31 LIVE** upgrade: (1) HDSD **Thiết lập → Nhân viên**, (2) list `GET …/employees` **200** `HRM-EMP-200` total/rowCount **59** · idle GET **0** · no ERROR, (3) **Lấy lại dữ liệu** → GET employees **200** `HRM-EMP-200` (`refresh.wired=true`), (4) **Nhập khẩu** → `EmployeeImportDialog` visible + file input (`import.wired=true` · dialogVisible=true). Residual `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` **CLOSED**. Prior QC PARTIAL CONDITION superseded. OBS mapping mã chấm công / leave days remains **OBS** (non-blocking). **uat_done=false**. Attendance **not** CLOSED. Did **not** reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK.

**Conditions:** NOT Phase1/UAT DONE · NOT Attendance CLOSED · OBS mapping SPEC_GAP · Import preview/commit not exercised this seat · **NOT** invent full Attendance menu CLOSED.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-mfd-m2-att-settings-emp-01-qc.md` | GWC #31 **PARTIAL** · Import/Refresh unwired CONDITION | **ACCEPT** prior — superseded for LIVE upgrade only |
| `po-mfd-m2-att-settings-emp-01-fe.md` | FE FIX Refresh→refetch · Import→EmployeeImportDialog · vitest 5/5 · READY_FOR_QA | **ACCEPT** root-cause wire |
| `po-mfd-m2-att-settings-emp-01-r2-qa.md` | PASS_TO_PM · #31 LIVE · Refresh GET 200 · Import dialog · residual CLOSED · uat_done false | **ACCEPT** product |
| `_tmp-po-mfd-m2-att-settings-emp-01-r2-browser.json` | verdict PASS · refresh.wired=true · import.wired=true · dialogVisible=true · matrix_stamp.31=LIVE · uat_done false · attendance_closed false | **ACCEPT** Network SoT |
| Matrix `#31` `HRM-ATTENDANCE_FIDELITY_MATRIX.md` | **LIVE** (`SETTINGS-EMP-01-R2`) | **ACCEPT** MATCH QA stamp |
| Screens R2 (5) | shell · loaded · after refresh · import dialog · final | **ACCEPT** visual spot |

---

## Gate AC audit (narrow M2 SETTINGS-EMP-01-R2)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | L0 qc:fe-be-health entry+exit | QA L0 PASS · JSON l0 hrm/xbos/portal **200** | 🟢 **PASS** |
| 2 | HDSD Thiết lập → Nhân viên (#31) | steps nav_settings + nav_employees_sidebar PASS · inventory 31 🟢 · PNG loaded | 🟢 **PASS** |
| 3 | List GET 200 HRM-EMP-200 · idle0 · no ERROR | total=59 · rowCount=59 · idleGets=0 · idleAllHrmGets=0 · errorBanner=false · pageErrors=[] | 🟢 **PASS** |
| 4 | Refresh → GET employees 200 | refresh.clicked=true · employeesGets=1 · has200=true · code=HRM-EMP-200 · wired=true · PNG `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/04-after-refresh-click.png` | 🟢 **PASS** |
| 5 | Import → dialog / file UI | import.clicked=true · dialogVisible=true · fileInput=true · wired=true · PNG `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/05-after-import-click.png` (Import nhân viên từ Excel) | 🟢 **PASS** |
| 6 | Stamp #31 LIVE honesty | JSON matrix_stamp.31=LIVE · matrix file LIVE · prior PARTIAL superseded with Network+dialog proof | 🟢 **PASS** (**LIVE** confirmed) |
| 7 | No invent Attendance CLOSED / uat_done | JSON + QA `uat_done: false` · `attendance_closed: false` | 🟢 **PASS** (honesty) |
| 8 | OBS mapping mã chấm công / leave days | leave_days=`—` · attendance_code=employee_code UNMAPPED | 🟡 **OBS only** (not NO-GO) |

---

## Independent spot-check (QC)

### EC1 — Refresh Network wire CLOSED

| Check | Result |
|-------|--------|
| Click Refresh | `refresh.clicked=true` |
| GET after click | `employeesGets=1` · status **200** · code **`HRM-EMP-200`** · total=59 · `xCompanyId=main` · at `2026-08-04T07:49:05.426Z` |
| Prior R1 contrast | PARTIAL QC: `refresh.wired=false` · empGets=0 |
| R2 | `refresh.wired=true` |

**PASS** — Refresh CTA wire proven.

### EC2 — Import dialog wire CLOSED

| Check | Result |
|-------|--------|
| Click Import | `import.clicked=true` |
| Dialog | `dialogVisible=true` · `fileInput=true` · `importTitle=true` · title UI **Import nhân viên từ Excel** (PNG 05) |
| Mutate | `mutates=0` · no file select/commit (U65) |
| Prior R1 contrast | PARTIAL QC: `import.wired=false` · no dialog |
| R2 | `import.wired=true` |

**PASS** — Import UI wire proven (preview/commit optional — not claimed this seat).

### EC3 — List + idle + PNG

| Check | Result |
|-------|--------|
| List | GET **200** `HRM-EMP-200` · 59 rows · no ERROR banner |
| Idle | emp=0 · allHrm=0 / 5s |
| PNG 03 | `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/03-settings-employees-loaded.png` · Thiết lập · Nhân viên · CTAs · table |
| PNG 04 | `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/04-after-refresh-click.png` · After Refresh — panel intact |
| PNG 05 | `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/05-after-import-click.png` · EmployeeImportDialog open |

**PASS**

### EC4 — Matrix #31 LIVE consistency

| Source | Stamp | QC |
|--------|-------|-----|
| Prior QC GWC | **PARTIAL** | superseded |
| QA R2 | **LIVE** | MATCH |
| Browser JSON | `matrix_stamp.31=LIVE` | MATCH |
| `HRM-ATTENDANCE_FIDELITY_MATRIX.md` #31 | **LIVE** (`SETTINGS-EMP-01-R2`) | MATCH |

**PASS** — LIVE upgrade honest (Refresh Network + Import dialog). Do **not** invent Attendance CLOSED.

### EC5 — Forbidden honesty / prior GWC

| Check | Result |
|-------|--------|
| Seed | **None** (U65) |
| Full Attendance CLOSED | **not claimed** |
| uat_done | **false** |
| Phase1 / UAT DONE | **not claimed** |
| REPORTS / REQUESTS / LEAVE / OT / CLOCK | **not reopened** |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| Matrix **#31** Thiết lập → Nhân viên list + Refresh + Import dialog | **In-scope** this re-gate | **PASS** (Network + PNG) — stamp **LIVE** |
| **J-HRM-06** Chấm công → bản ghi / yêu cầu | Related shell; not re-certified | **prior ✅** · **untouched** |
| **J-HRM-06b** Bảng chấm công | Out of this seat | **prior ✅** · **untouched** |
| Attendance CLOSED / full STUB cluster | Forbidden | **not claimed** |

Mandatory in-scope: #31 LIVE with Refresh GET 200 + Import dialog. No invent Attendance CLOSED. No reopen REPORTS/REQUESTS/LEAVE/OT/CLOCK.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | #31 LIVE — list 200 · 59 · idle0 · Refresh GET 200 · Import dialog wired · residual Import/Refresh **CLOSED** |
| **PROCESS** | QA R2 pack `verify:qc:evidence-pack` **8/8 PASS** (portal_url + journey_l25 present — prior `C-SETTINGSEMP01-QA-PACK-FMT-01` closed for R2) |
| **ENV** | L0 hrm/xbos/portal **200**; QA entry+exit fe-be-health PASS |
| **OBS** | Mapping mã chấm công / leave days UNMAPPED · Import preview/commit not exercised |
| **OUT-OF-SCOPE** | Phase1/UAT DONE · Attendance CLOSED · REPORTS/REQUESTS/LEAVE/OT/CLOCK invent FAIL |

ENV does not drive verdict. OBS does **not** demote SETTINGS-EMP R2 LIVE close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this GWC? |
|----|--------|-----|-------|------------------|
| #31 list + idle0 + no ERROR | **CLOSED** (prior + R2) | — | — | No |
| `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` | **CLOSED** this R2 | — | — | No — supersedes prior CONDITION |
| `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` | OPEN OBS | P2 | ba-process | **No** — UNMAPPED; non-blocking LIVE |
| Import preview/commit mutate (optional) | not exercised | — | — | No — dialog wire sufficient for #31 LIVE per AC |
| REPORTS / REQUESTS / LEAVE / OT / CLOCK prior GWC | **untouched** | — | — | No |
| Phase1 / UAT DONE / Attendance CLOSED | — | — | — | No — **not claimed** |

**No residual product P0/P1** open for SETTINGS-EMP Refresh+Import LIVE upgrade.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
3. Matrix **#31 LIVE** is SETTINGS-EMP slice only (list + Refresh Network + Import dialog) — **not** full Attendance CLOSED.
4. OBS `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` stays **OBS** — optional BA; not LIVE NO-GO.
5. Import spreadsheet preview/commit mutate path **not** claimed CLOSED by this seat (dialog proven only).
6. **Do not** reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK GWC without new FAIL evidence.
7. U65: **no seed** in acceptance path.
8. Prior QC PARTIAL GWC **superseded** for #31 stamp only — honesty chain retained (uat_done false).

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qa.md
→ PASS exit 0 (8/8)
```

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qc.md
→ PASS exit 0 (8/8) [post-write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qc.md --check-assets
→ PASS exit 0 · PNG refs OK [post-write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qa.md` | **PASS** exit **0** · **8/8** |
| Disk check PNG under `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/` | **PASS** · 01 / 03 / 04 / 05 / 07 present |
| Runtime cross-check `_tmp-po-mfd-m2-att-settings-emp-01-r2-browser.json` | **PASS** · verdict PASS · HRM-EMP-200 59 · idleGets=0 · refresh.wired=true · import.wired=true · dialogVisible=true · matrix 31=LIVE · pageErrors=[] · uat_done false |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/03-settings-employees-loaded.png` | **PASS** · Thiết lập · Nhân viên · CTAs · table · no ERROR |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/04-after-refresh-click.png` | **PASS** · panel after Refresh |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/05-after-import-click.png` | **PASS** · EmployeeImportDialog **Import nhân viên từ Excel** open |
| Matrix #31 vs `HRM-ATTENDANCE_FIDELITY_MATRIX.md` | **PASS** · #31 **LIVE** MATCH — supersedes PARTIAL |
| Open FE MD wire ack | **PASS** · Refresh/Import onClick + vitest 5/5 |
| Open prior QC PARTIAL | **PASS** · CONDITION closed by R2 proof |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qc.md` | **PASS** exit **0** (8/8) [post-write] |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qc.md --check-assets` | **PASS** exit **0** [post-write] |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | browser JSON l0 200 · QA fe-be-health |
| **LOGIN** | `ceo@xe.vn` company_id=main | **PASS** | login http 201 |
| **READ** #31 employees list | LIVE · GET 200 HRM-EMP-200 · 59 · idle0 | **PASS** | `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/03-settings-employees-loaded.png` + JSON |
| **CTA** Refresh «Lấy lại dữ liệu» | wire → refetch GET 200 | **PASS** / **LIVE** | refresh.wired=true · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/04-after-refresh-click.png` |
| **CTA** Import «Nhập khẩu» | wire → dialog | **PASS** / **LIVE** | dialogVisible=true · `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/05-after-import-click.png` |
| Matrix #31 L2.5-equivalent | tab→sidebar→list+CTA | **PASS** (stamp LIVE) | this seat |
| **J-HRM-06** | related shell | **prior ✅** | untouched |
| Attendance CLOSED / uat_done | Forbidden invent | **not claimed** | uat_done false · stamp LIVE slice only |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Attendance CLOSED
- Did not invent Import preview/commit mutate PASS
- Did not reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK GWC
- Did not NO-GO solely on OBS mapping
- Did not GO without opening QA MD + runtime JSON + PNG spot-check
- #31 LIVE only after Refresh GET 200 **and** Import dialog proven (honest upgrade from PARTIAL)

---

## completion_report

**Closed:** QC L3 re-gate **PO-MFD-M2-ATT-SETTINGS-EMP-01-R2-QC** → **GO WITH CONDITIONS**. Matrix **#31 LIVE** upgrade honest (list GET **200** `HRM-EMP-200` · 59 · idle0 · Refresh GET **200** · Import `EmployeeImportDialog` visible). Residual `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` **CLOSED**. Prior QC PARTIAL GWC **superseded** for stamp. OBS mapping SPEC_GAP non-blocking. **uat_done false**. Attendance **not** CLOSED. U65 zero-seed. REPORTS/REQUESTS/LEAVE/OT/CLOCK **not** reopened. QA pack 8/8.

**Open / residual owners:** `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` (ba-process OBS). Optional Import preview/commit mutate not in this seat. **No invent Attendance CLOSED / uat_done**.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-SETTINGS-EMP-01-R2-CLOSE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS — docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qc.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-SETTINGS-EMP-01-R2-QC as GWC #31 LIVE slice only (Refresh GET 200 + Import dialog); supersede prior PARTIAL GWC; residual Import/Refresh CLOSED; uat_done false; NOT Phase1/UAT DONE; NOT Attendance CLOSED.
2) OBS R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP stays OBS (ba-process) — non-blocking; optional later.
3) Do NOT reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK GWC without new FAIL.
4) Do NOT claim Attendance CLOSED / uat_done from this GWC.
5) Continue M2 fidelity backlog for remaining open seats only — SETTINGS-EMP #31 LIVE closed this wave.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qc.md`

## ack_status

**PASS_TO_PM**
