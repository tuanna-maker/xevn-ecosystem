# Evidence — `PO-MFD-M2-ATT-QA-RUNTIME-01-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-QA-RUNTIME-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — M2 Attendance **fidelity runtime stamp honesty** (U65 read-only refresh) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-qa-runtime-01.md`](po-mfd-m2-att-qa-runtime-01.md) PASS_TO_PM |
| **runtime** | [`_tmp-po-mfd-m2-att-qa-runtime-01-browser.json`](_tmp-po-mfd-m2-att-qa-runtime-01-browser.json) · `uat_done: false` · `attendance_closed: false` · rollup LIVE=28 · PARTIAL=1 · GĐ2-HOLD=1 · STUB_UI=12 · networkOkTotal=379 · unexpectedMutates=0 |
| **artifacts** | `HRM-ATTENDANCE_RUNTIME_LOG.md` · `HRM-ATTENDANCE_FIDELITY_MATRIX.md` · `HRM-ATTENDANCE_M2_BACKLOG.md` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-qa-runtime-01/rules-stub-37.png` · `rules-stub-39.png` |
| **spec_ref** | fidelity matrix C1–C7 #1–46 · U87 M2 runtime · U65 zero-seed · U76 HDSD Chấm công |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · 0 mutate |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · Face LIVE · `uat_done=true` |
| **do_not_reopen** | OVERVIEW / WEEKLY / SETTINGS-EMP / RECORDS-EDIT / REQUESTS / REPORTS / CLOCK / LEAVE / OT GWC · CFG-COLUMNS / DEVICE / AUTO / QR **ACCEPTED_AS_IS_P1** — without new FAIL |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded gate: Attendance fidelity **runtime stamp honesty** after QA `PO-MFD-M2-ATT-QA-RUNTIME-01`. Machine JSON + RUNTIME_LOG + matrix overlay corroborate **UNKNOWN=0**, **379 GET 2xx**, **0 ≥400**, **0 unexpected mutates**, Face **#9 GĐ2-HOLD**, STUB_UI **#17–18 / #37–46**, PARTIAL **#8** (probe) with matrix PARTIAL **#30 / #33** kept ACCEPTED_AS_IS (export not clicked). Stale M1 BROKEN/PARTIAL rows (#13 edit list, #20/#22/#24, #31) reclassified LIVE with Network GETs — prior mutate GWC **not** reopened for invent FAIL. **uat_done false** · Attendance **not** CLOSED · **NOT** Phase 1 DONE.

**Conditions:** QA pack process gap (timestamp) · matrix summary STUB count arithmetic OBS · PNG #37/#39 filename vs device-tab visual OBS · stub cluster / Face HOLD / PARTIAL ACCEPTED remain open residuals · **NOT** invent Attendance CLOSED.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-mfd-m2-att-qa-runtime-01.md` | PASS_TO_PM; UNKNOWN=0; 379 GET; 0 mutate; Face GĐ2-HOLD; STUB #17–18/#37–46; PARTIAL #8/#30/#33; uat_done false; NOT CLOSED | **ACCEPT** claims |
| `_tmp-po-mfd-m2-att-qa-runtime-01-browser.json` | rollup LIVE28/PARTIAL1/GĐ2-HOLD1/STUB12; networkOkTotal=379; networkBadTotal=0; unexpectedMutates=0; uat_done false; attendance_closed false | **ACCEPT** Network SoT |
| `HRM-ATTENDANCE_RUNTIME_LOG.md` | work_item RUNTIME-01; stamps match rollup; 379/0/0; date 2026-08-04 | **ACCEPT** |
| `HRM-ATTENDANCE_FIDELITY_MATRIX.md` | UNKNOWN=0; overlay #1–46; #17–18 STUB_UI; #9 GĐ2-HOLD; uat_done false | **ACCEPT** (OBS STUB count text 11 vs 12) |
| `HRM-ATTENDANCE_M2_BACKLOG.md` | P1 table COMPLETE; RUNTIME PASS_TO_PM; not Attendance CLOSED | **ACCEPT** |
| Screens stub-37 / stub-39 | Named for #37/#39; UI shows **Máy chấm công** (#35 LIVE REF) | **OBS process** — do not demote STUB stamps (JSON `forceRuntime: STUB_UI`) |

---

## Gate AC audit (RUNTIME-01 honesty)

| # | AC | Runtime / artifact | QC |
|---|-----|--------------------|-----|
| 1 | L0 entry+exit PASS | QA cites `pnpm run qc:fe-be-health` PASS ×2 · JSON `l0` hrm/xbos/portal **200** | 🟢 **PASS** |
| 2 | UNKNOWN=0 across matrix #1–46 | Matrix Summary UNKNOWN **0** · overlay complete · backlog P1 COMPLETE | 🟢 **PASS** |
| 3 | Probe rollup honesty vs Network | JSON rollup LIVE28 / PARTIAL1 / GĐ2-HOLD1 / STUB12 · networkOkTotal **379** · bad **0** · mutates **0** | 🟢 **PASS** |
| 4 | Face #9 GĐ2-HOLD (not LIVE) | JSON `clock-face` runtime GĐ2-HOLD · gd2Hold=true · stub=true · face model console noise expected · 0 POST | 🟢 **PASS** honesty |
| 5 | STUB_UI #17–18 SHIFTS-02 | JSON `shifts-schedule` / `shifts-overtime` STUB_UI · stub+gd2Hold · note honesty · work-shifts GET may still fire on shell | 🟢 **PASS** |
| 6 | STUB_UI #37–46 cluster | JSON forceRuntime STUB_UI tablet/proxy/auto + sidebar stubs · matrix overlay 37–46 STUB_UI | 🟢 **PASS** (PNG OBS separate) |
| 7 | PARTIAL #8 / #30 / #33 kept | #8 JSON PARTIAL QR shell · #30 export not clicked PARTIAL · #33 columns ACCEPTED_AS_IS · not invent LIVE | 🟢 **PASS** |
| 8 | must_keep prior GWC / ACCEPTED_AS_IS | QA + JSON 0 mutate · no reopen SETTINGS/RECORDS/REQUESTS/REPORTS/CLOCK/LEAVE/OT/OVERVIEW/WEEKLY | 🟢 **PASS** |
| 9 | NOT invent Attendance CLOSED / uat_done / Phase1 DONE | JSON + QA + RUNTIME_LOG + matrix + backlog all **false** / not CLOSED | 🟢 **PASS** honesty |

---

## Stamp honesty vs Network (spot)

| Matrix / probe | Stamp claimed | Network / signal sample | QC |
|----------------|---------------|-------------------------|-----|
| #1–5 overview | LIVE | GET `/attendance/overview?year=2026` **200** | **MATCH** |
| #8 QR | PARTIAL | shell spot · work-sites/overview/records GET 200 · ACCEPTED_AS_IS_P1 | **MATCH** |
| #9 Face | GĐ2-HOLD | stub + gd2Hold · face model JSON errors · **0** POST | **MATCH** |
| #13 records | LIVE list | records GET 200 · edit mutate GWC kept (not re-mutated) | **MATCH** |
| #17–18 shifts schedule/OT | STUB_UI | featureInDev + GĐ2 · NO_API roster honesty | **MATCH** |
| #20/#22/#24 requests | LIVE | late-early / trip / shift-change GET 200 · prior storm PARTIAL superseded | **MATCH** |
| #29/#30 reports | LIVE / PARTIAL | fan-in 200 · export **not** clicked | **MATCH** |
| #31 settings emp | LIVE | employees GET 200 · SETTINGS-EMP R2 GWC kept | **MATCH** |
| #37–39 rules stubs | STUB_UI | forceRuntime STUB_UI · i18n reprobe note | **MATCH** (PNG OBS) |

Probe grain (42 surfaces) ≠ matrix row grain (46): overview 1–5 collapsed; settings stubs collapsed — **not** honesty FAIL.

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this gate | QC |
|---------|-------------------|-----|
| Fidelity matrix #1–46 runtime stamps | **In-scope** (U65 read-only refresh) | **PASS** honesty |
| **J-HRM-06** list records RO | Spot only; edit mutate **must_keep** GWC R3 | **PASS RO** · mutate **untouched** |
| **UF-HRM-05** reports load | Spot fan-in LIVE · export #30 not clicked | **PASS spot** · export PARTIAL kept |
| Leave / REQUESTS mutate J-* | **Out of scope** this seat (must_keep LEAVE-WF / REQUESTS GWC) | **deferred** — not FAIL |
| Attendance CLOSED / Face LIVE | Forbidden | **not claimed** |

Mandatory in-scope for this gate = stamp honesty + UNKNOWN=0 + Network rollup. Full mutate L2.5 journeys remain under prior GWC evidence — **not** reopened.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Runtime stamps honest vs Network; UNKNOWN=0; Face GĐ2-HOLD; STUB_UI #17–18/#37–46; PARTIAL #8 kept; 0 mutate; BROKEN=0 |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **1/8** missing `YYYY-MM-DD` timestamp — process-only · matrix Summary STUB_UI text **11** vs probe **12** arithmetic OBS · PNG stub-37/39 show device tab (#35) not tablet/auto content |
| **ENV** | L0 `qc:fe-be-health` PASS; JSON l0 200×3 |
| **OUT-OF-SCOPE / must_keep** | Prior M2 P1 GWC mutate tabs · ACCEPTED_AS_IS_P1 (CFG-COLUMNS / DEVICE / AUTO / QR) · invent Attendance CLOSED / uat_done / Phase1 DONE · Face LIVE |

ENV does not drive verdict. QA timestamp gap + PNG labeling OBS do **not** demote product GWC. Must_keep prior GWC **not** reopened without FAIL.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 GO? |
|----|--------|-----|-------|--------------------|
| UNKNOWN=0 runtime refresh | **CLOSED** this seat | — | — | No |
| Face #9 GĐ2-HOLD | OPEN HOLD | GĐ2 | pm | No — honesty PASS |
| R-MFD-ATT-SETTINGS-STUB-CLUSTER (#37–46 + related) | OPEN | P2 | ba-data / sa | No |
| #17–18 STUB_UI roster | OPEN honesty | P0 menu / GĐ2 roster | ba-process | No — honesty OK |
| #8 / #30 / #33 PARTIAL | ACCEPTED_AS_IS_P1 / export P2 | P1–P2 | — / ba-process EXPORT-01 | No |
| `C-RUNTIME01-QA-PACK-TS-01` | OPEN process | P3 | qa | No — add `date: YYYY-MM-DD` on next QA MD |
| `OBS-MFD-ATT-MATRIX-STUB-COUNT` | OPEN OBS | P3 | ba-data | No — Summary says 11; probe/JSON/overlay = 12 |
| `OBS-MFD-ATT-PNG-37-39-LABEL` | OPEN OBS | P3 | qa | No — filenames stub-37/39; UI = device #35 |
| Prior M2 P1 GWC / ACCEPTED_AS_IS | **untouched** | — | — | No |
| Phase1 / UAT DONE / Attendance CLOSED / Face LIVE | — | — | — | No — **not claimed** |

**No residual product P0/P1 FAIL** for this RUNTIME-01 honesty gate.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
3. **Do not** invent Face LIVE or promote STUB_UI #17–18/#37–46 to LIVE without new Network mutate/API proof.
4. **Do not** reopen prior M2 P1 GWC / ACCEPTED_AS_IS_P1 without new FAIL evidence.
5. U65: **no seed** in acceptance path.
6. QA pack timestamp 1/8 + PNG label OBS + matrix STUB count OBS remain **CONDITION (process)** — not product NO-GO.
7. PM next: M3 next-menu fidelity **or** P2 export/stub governance — already parallel `PO-MFD-M2-ATT-EXPORT-01` on bus.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-qa-runtime-01.md
→ FAIL 1/8 — missing timestamp YYYY-MM-DD
```

Process-only (same pattern as WEEKLY/OVERVIEW GWC). Product honesty independent.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-qa-runtime-01-qc.md
```

Target **8/8** after this MD lands.

### Command table

| Command | Result | Notes |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-qa-runtime-01.md` | **FAIL** 1/8 | timestamp missing — PROCESS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-qa-runtime-01-qc.md` | **PASS** 8/8 | this pack |
| QA-cited `pnpm run qc:fe-be-health` | **PASS** entry+exit | ENV OK · not re-run full suite |
| Browser JSON rollup spot | LIVE28 · PARTIAL1 · GĐ2-HOLD1 · STUB12 · networkOk **379** · bad **0** · mutates **0** | Network SoT |
| PNG spot stub-37 / stub-39 | files present | OBS label vs #35 device UI |

---

## Read-only module table (U65)

| Module surface | AC | Verdict |
|----------------|-----|---------|
| Attendance fidelity #1–46 stamps | UNKNOWN→classified; Network honesty | **PASS** GWC |
| Mutate tabs (LEAVE/REQUESTS/RECORDS edit/CLOCK POST) | must_keep — not re-mutated | **PASS** (untouched) |
| Export #30 | not clicked · PARTIAL kept | **PASS** honesty |
| Face #9 | GĐ2-HOLD not LIVE | **PASS** honesty |

---

### completion_report

Closed **PO-MFD-M2-ATT-QA-RUNTIME-01-QC**: L3 honesty audit of M2 Attendance runtime stamps. **GO WITH CONDITIONS** — UNKNOWN=0 · 379 GET 2xx · 0 mutate · Face #9 GĐ2-HOLD · STUB_UI #17–18/#37–46 · PARTIAL #8/#30/#33 kept · RUNTIME_LOG + matrix overlay MATCH Network JSON. **uat_done false** · **Attendance not CLOSED** · **NOT** Phase 1 DONE. must_keep prior GWC / ACCEPTED_AS_IS **not** reopened. Residuals = Face HOLD + stub cluster P2 + process OBS (QA timestamp, STUB count text, PNG labels).

### next_owner

**pm**

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-QA-RUNTIME-01-INTAKE
from_role: pm
to_role: pm
lane: governance
priority: P1

entry_criteria: QC evidence docs/qa/evidence/po-mfd-m2-att-qa-runtime-01-qc.md GWC PASS_TO_PM; UNKNOWN=0 honesty ACCEPT; Face #9 HOLD; uat_done false
exit_criteria: bus INTAKE QC GWC; decide next = (a) M3 next menu Employees/Payroll fidelity OR (b) continue P2 EXPORT-01 / stub-cluster governance already DISPATCHED; do NOT invent Attendance CLOSED; do NOT reopen prior M2 P1 GWC without FAIL; optional P3: QA add date YYYY-MM-DD on runtime MD + fix PNG 37/39 labels + matrix STUB count 12
must_keep: all M2 P1 GWC + ACCEPTED_AS_IS_P1; U65
cấm: seed · claim Attendance CLOSED · invent Face LIVE · invent uat_done=true
```

### evidence_path

`docs/qa/evidence/po-mfd-m2-att-qa-runtime-01-qc.md`

### ack_status

**PASS_TO_PM**
