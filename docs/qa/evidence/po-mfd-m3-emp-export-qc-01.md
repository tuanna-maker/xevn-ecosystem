# Evidence — `PO-MFD-M3-EMP-EXPORT-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-EXPORT-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — M3 Employees **Xuất** honesty seat only (matrix **#9 PARTIAL + SPEC_GAP**) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| **journey_l25** | **J-HRM-IM-01** export slice · HDSD CH06 §5.2 · matrix **#9** DLG-EXPORT · must_keep **J-HRM-02** → #19 Training |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **uat_done** | **false** |
| **employees_closed** | **false** |
| **attendance_closed** | **false** |
| **entry** | QA [`po-mfd-m3-emp-export-01.md`](po-mfd-m3-emp-export-01.md) PASS_TO_PM · runtime [`_tmp-po-mfd-m3-emp-export-01-browser.json`](_tmp-po-mfd-m3-emp-export-01-browser.json) · matrix [`HRM-EMPLOYEES_FIDELITY_MATRIX.md`](../professional/menu-fidelity/HRM-EMPLOYEES_FIDELITY_MATRIX.md) #9 · prior TRAINING-QC GWC CLOSED |
| **screens** | `docs/qa/evidence/screens/po-mfd-m3-emp-export-01/01-list-baseline.png` · `02-export-dialog.png` · `03-after-client-export.png` · `04-training-spot.png` |
| **spec_ref** | HDSD CH06 §5.2 · TC-EMP-X-HP-008+ · matrix #9 DLG-EXPORT |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · **0** emp mutates in QA runtime |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · **Employees menu CLOSED** · Attendance CLOSED · **#9 LIVE** · Nest wire/depth CLOSED |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded honesty seat for matrix **#9 Xuất**. QA U65 browser proves FE client export **LIVE** (dialog columns 17 · xlsx/csv · download `danh_sach_nhan_vien_2026-08-04.xlsx` · count **60**) while FE makes **0** `POST /spreadsheet/export` calls. Nest API-only probe returns **201** `text/csv` **header-only** (`lineCount=1` · `byteLength=60` · **0** data rows vs FE list **60**) — SPEC_GAP wire + empty/depth documented, **not** promoted to LIVE. must_keep **#19 Training LIVE** reconfirmed (GET training **200** · `pageErrors=0` · summary cards zeros · empty honesty). **Employees NOT CLOSED**. **Attendance NOT CLOSED**. **uat_done=false**. **NOT Phase 1 DONE**.

**QC recommendation:** **Defer** product wire (`EXPORT-WIRE-01` / `EXPORT-NEST-01`) behind **UC-GAP program W3** (`PO-HRM-BP-UC-GAP-01`) unless sponsor elevates to P0 — client Xuất satisfies HDSD UX; Nest SoT undecided until gap synth; D7 pause code for non-P0.

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| FE Xuất dialog + client download | PRODUCT — PASS honesty | LIVE client path |
| FE never calls Nest export | PRODUCT — SPEC_GAP OPEN | not product FAIL for this honesty seat |
| Nest 201 header-only on `company_id=main` | PRODUCT — SPEC_GAP OPEN | depth/empty residual; not UF LIVE claim |
| QA evidence-pack verify 4/8 | PROCESS — OBS | missing command_table / portal_url / journey_l25 / Residual headers on QA MD — does **not** demote product GWC (QC pack completes 8/8) |
| L0 hrm/xbos/portal 200 | ENV — PASS | stack up |
| Seed / emp mutate | — | **0** · U65 held |

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-mfd-m3-emp-export-01.md` | PASS_TO_PM · #9 PARTIAL+SPEC_GAP · client LIVE · Nest OPEN · #19 LIVE · Employees CLOSED false | **ACCEPT** honesty |
| `_tmp-po-mfd-m3-emp-export-01-browser.json` | verdict PASS · nest_probe 201 lineCount=1 · nestExportCallsFromBrowser=0 · stamp #9 PARTIAL · employees_closed=false | **ACCEPT** Network SoT |
| Matrix `#9` | PARTIAL + SPEC_GAP · owners dev-fe+dev-be · LIVE=26 · PARTIAL=#9+#18 · BROKEN=0 | **ACCEPT** MATCH |
| Prior `po-mfd-m3-emp-training-qc-01.md` | GWC #19 LIVE CLOSED | **ACCEPT** must_keep baseline |
| Screens (4) | list · dialog · after export · training | **ACCEPT** visual spot |

---

## Gate AC audit (honesty seat — not #9 LIVE)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | L0 fe-be health entry+exit | JSON l0 hrm/xbos/portal **200** | 🟢 **PASS** |
| 2 | Xuất dialog HDSD §5.2 | opened · title · filters · count 60 · PNG 02 | 🟢 **PASS** |
| 3 | Columns + xlsx/csv | checkboxCount=17 · hasXlsx · hasCsv | 🟢 **PASS** |
| 4 | Client export download | download.got · filename xlsx · PNG 03 | 🟢 **PASS** |
| 5 | Honesty: FE ≠ Nest wire | nestExportCallsFromBrowser=**0** | 🟢 **PASS** (documented) |
| 6 | Nest API exists (probe) | POST export **201** csv | 🟢 **PASS** (exists) |
| 7 | Nest row parity vs FE | lineCount=1 vs FE 60 | 🔴 **SPEC_GAP OPEN** (expected residual) |
| 8 | must_keep #19 Training | train200 · pageErrors=0 · PNG 04 | 🟢 **PASS** |
| 9 | U65 · 0 emp mutates | empMutates=0 · no seed | 🟢 **PASS** |
| 10 | NOT invent #9 LIVE / Employees CLOSED | stamp PARTIAL · employees_closed=false | 🟢 **PASS** |

---

## Independent spot-check (QC)

### EC1 — FE client export LIVE (not Nest)

| Check | Result |
|-------|--------|
| Dialog | PNG `02-export-dialog.png` — «Xuất danh sách nhân viên» · 9/17 cols · Excel selected · «Số nhân viên sẽ xuất: 60» |
| Download | JSON `client_export.download.got=true` · `danh_sach_nhan_vien_2026-08-04.xlsx` |
| Nest from browser | **0** calls |
| Disk | 01–04 present (188858 / 195996 / 191062 / 65061 bytes) |

**PASS** — client Xuất LIVE under PARTIAL stamp.

### EC2 — Nest empty/depth SPEC_GAP (do not promote LIVE)

| Check | Result |
|-------|--------|
| Probe | HTTP **201** · header `employee_code,email,full_name,job_title_key,status,hired_at` |
| Body | lineCount=**1** · byteLength=**60** · sampleRow empty |
| FE list | total **60** |
| Format/cols/depth | Nest csv-only · 6 fixed cols · page_size 100 vs FE 17 cols + xlsx |

**PASS as honesty residual** — **cấm** stamp #9 LIVE without Nest wire + row parity.

### EC3 — must_keep #19 Training LIVE

| Check | Result |
|-------|--------|
| PNG `04-training-spot.png` | Tab Đào tạo · cards 0/0/0h/0₫ · empty «Chưa có chương trình đào tạo» · no crash banner |
| Network | GET `…/training?company_id=main` **200** |
| pageErrors | **0** |

**PASS** — TRAINING-QC GWC must_keep held.

### EC4 — Matrix #9 consistency

| Source | Stamp | QC |
|--------|-------|-----|
| QA MD | PARTIAL + SPEC_GAP | MATCH |
| JSON stamp.#9.after | PARTIAL | MATCH |
| Matrix row #9 | PARTIAL + SPEC_GAP | MATCH |
| LIVE invent | none | **PASS** — not promoted |

---

## Commands executed (QC)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m3-emp-export-01.md` | **1** | QA pack **4/8** PROCESS OBS (command_table · portal_url · journey_l25 · Residual) — product evidence still strong via JSON+screens |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m3-emp-export-qc-01.md` | **0** | QC pack **8/8** (re-run after this file) |
| Disk list screens `po-mfd-m3-emp-export-01/` | **0** | 4 PNG present |
| Spot-read PNG 02 + 04 | n/a | Dialog LIVE · Training LIVE |

---

## J-* / L2.5 coverage

| Journey | Scope this seat | Verdict |
|---------|-----------------|---------|
| **J-HRM-IM-01** (export slice) | List → Xuất dialog → client download | 🟢 **PASS** (client path) |
| Nest export wire as SoT | Deferred | ⬜ **OPEN SPEC_GAP** — not required for honesty GWC |
| **J-HRM-02** must_keep #19 | list→detail→Đào tạo | 🟢 **PASS** |
| Full Employees menu | out of scope | ⬜ NOT CLOSED |
| Attendance / Face | untouched | ⬜ NOT CLOSED |

---

## Residual

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| R-MFD-M3-EMP-EXPORT-NEST-WIRE | P1 | **defer** → UC-GAP W3 (or dev-fe if P0) | OPEN | FE client-only; Nest unused |
| R-MFD-M3-EMP-EXPORT-NEST-EMPTY | P1 | **defer** → UC-GAP W3 (or dev-be if P0) | OPEN | Nest 201 · 0 rows vs FE 60 |
| R-MFD-M3-EMP-EXPORT-NEST-DEPTH | P2 | defer / ba-process SoT | OPEN | page_size 100 · csv-only · fixed cols |
| #18 Job | P2 | ba-process | OPEN | out of seat |
| Employees CLOSED | — | — | **false** | do not invent |
| Attendance CLOSED | — | — | **false** | do not invent |
| QA pack headers | PROCESS | qa (optional polish) | OBS | 4/8 verify — non-blocking |

**Defer rationale:** `PO-HRM-BP-UC-GAP-01` W3 owns UC/product SoT before TechSpec/code expand; client export already HDSD-operable; Nest SoT undecided — wiring now risks overwrite after gap synth. Elevate only if sponsor marks export Nest SoT as P0.

---

## Conditions (bounded GWC)

1. **NOT** Phase 1 DONE / UAT DONE / PROD-READY.
2. **Employees menu NOT CLOSED** · **Attendance NOT CLOSED**.
3. Matrix **#9 remains PARTIAL + SPEC_GAP** — **do not promote LIVE** without Nest wire + row parity QA.
4. SPEC_GAP wire/empty/depth **OPEN** — recommended **defer** behind UC-GAP W3 (not immediate Dev dispatch unless P0).
5. must_keep **#19 LIVE** · prior TRAINING-QC GWC unchanged.
6. QA evidence-pack PROCESS OBS (4/8) — optional QA polish; not product NO-GO.

---

## completion_report

**Closed:** `PO-MFD-M3-EMP-EXPORT-QC-01` L3 spot-audit — honesty seat **GO WITH CONDITIONS**. Corroborated QA MD + browser JSON + 4 PNG + matrix #9 PARTIAL+SPEC_GAP. FE client Xuất LIVE; Nest wire/empty OPEN; #19 must_keep LIVE; Employees/Attendance NOT CLOSED; uat_done false; NOT Phase1 DONE. Recommend **defer** EXPORT-WIRE/NEST product work until UC-GAP W3 unless P0.

**Residual / not claimed:** #9 not LIVE; Nest wire+empty+depth OPEN (deferred); #18 Job; Employees CLOSED false.

## Handoff

- **next_owner:** pm
- **ack_status:** PASS_TO_PM
- **evidence_path:** `docs/qa/evidence/po-mfd-m3-emp-export-qc-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-EXPORT-DEFER-01
from_role: pm
to_role: all
lane: governance
priority: P1
u65_zero_seed: true

QC GWC on PO-MFD-M3-EMP-EXPORT-QC-01 (honesty seat).
#9 remains PARTIAL + SPEC_GAP — do NOT promote LIVE.
DEFER product wire: do NOT dispatch PO-MFD-M3-EMP-EXPORT-WIRE-01 / NEST-01 now.
Park residuals R-MFD-M3-EMP-EXPORT-NEST-WIRE / NEST-EMPTY / NEST-DEPTH behind PO-HRM-BP-UC-GAP-01 W3 (gap matrix + SoT: client XLSX vs Nest export).
Elevate to Dev only if sponsor marks Nest export SoT as P0.
must_keep #19 LIVE · Employees NOT CLOSED · Attendance NOT CLOSED · NOT Phase1 DONE.
evidence: docs/qa/evidence/po-mfd-m3-emp-export-qc-01.md
```
