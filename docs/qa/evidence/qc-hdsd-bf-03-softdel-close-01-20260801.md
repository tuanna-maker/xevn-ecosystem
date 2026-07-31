# QC Close — HDSD BF-03 soft-delete (`QC-HDSD-BF-03-SOFTDEL-CLOSE-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-HDSD-BF-03-SOFTDEL-CLOSE-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · residual **R-MUTATE-SOFTDEL-01** · Cursor sole |
| **gate_type** | L3 QC — close soft-delete after `QA-HDSD-BF-03-SOFTDEL-RET-01` |
| **prior_gates** | `qc-hdsd-bf-03-mutate-defer-close-01-20260801.md` (SOFTDEL OPEN P2) · FE `d-hdsd-bf-03-softdel-fe-01-20260801.md` |
| **auditor** | QC |
| **date** | 2026-08-01 |
| **policy** | U65 zero-seed · browser-only · no seed · **must_keep** TC-041 · TC-06/07/08 · **no false green** · **cấm** claim Phase2 DONE · **cấm** đóng BH lane trong gate này |
| **portal_url** | `http://127.0.0.1:5173` · `PORTAL_DEV_URL` · `/hr/employees` |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**GO WITH CONDITIONS** — **R-MUTATE-SOFTDEL-01 CLOSED**:

| TC / check | Matrix | Runtime / UI | QC |
|------------|--------|--------------|-----|
| **TC-HRM-HDSD-025** soft-delete NV | **🟢** | create POST **201** · AlertDialog «Xác nhận xóa nhân viên» · archive POST **201** · `f5Gone=true` · `navigatedProfileOnXoa=false` · Đã xóa **(1)** | ✅ **CLOSED** |
| Plain row click → profile | must_keep | `/hr/employees/{uuid}` · J-HRM-02 | ✅ preserved |
| **TC-HRM-HDSD-041** Xóa HĐ | **🟢** | promote NEVER_TOUCH · no HĐ mutate this wave | ✅ must_keep |
| **TC-HDSD-06/07/08** spines | untouched | network mutates = create+archive only | ✅ must_keep |
| **TC-HRM-HDSD-049** Dialog BH | **🟡** | out of slice | ✅ **still OPEN** — **no false 🟢** · **không đóng BH** |

- **Matrix** — promote **322→323🟢 · 42→41🟡** · applied **only TC-025** · `regressions: []` · `must_keep_untouched` includes 041 · 049 · 096/097 · TC-HDSD-06/07/08-02-01
- **Matrix body spot** — TC-025 **🟢** · TC-041 **🟢** · TC-049 **🟡** · summary **323🟢 · 41🟡 · 0⬜**
- **FE root cause closed** — DataTable row-action isolation + Employees menu stopPropagation (vitest 4/4 cited in FE evidence)

**NOT in this gate:** Phase 2 DONE · PROD · full **C-BF03-MUTATE-DEFER** all-green · **R-MUTATE-BH-400-01** close · Claude lane · seed.

---

## Evidence polled (QA + FE intake)

| Artifact | Pack / check | QC audit |
|----------|--------------|----------|
| `qa-hdsd-bf-03-softdel-ret-01-20260801.md` | verify **1/8 FAIL** (`command_table` only) | ✅ Product PASS — archive 201 · U65 · residual BH named · must_keep |
| `d-hdsd-bf-03-softdel-fe-01-20260801.md` | — | ✅ FIX DataTable + Employees · vitest 4/4 · READY_FOR_QA chain |
| `_tmp-qa-hdsd-bf-03-softdel-ret-01-runtime.json` | — | ✅ L0 200×3 · tc 025🟢 + rowclick🟢 · archiveUrl `/archive` **201** · journeys J-HRM-02 · console 0 · screens 6/6 exist |
| `_tmp-qa-hdsd-matrix-promote-bf-03-softdel-ret-01-result.json` | — | ✅ applied=[025] · regressions=[] · must_keep_untouched OK |
| `screens/hdsd-bf-03-softdel-ret-01-20260801/` | — | ✅ **6 PNG** — confirm dialog + F5 empty + Đã xóa(1) + profile row-click |
| `HDSD_SRS_TESTCASE_MATRIX.md` | — | ✅ 025🟢 · 041🟢 · 049🟡 · **no false green on BH** |

---

## L2.5 journey (U19 — QC independent map)

| Journey | Slice mapping | Verdict | Evidence |
|---------|---------------|---------|----------|
| **J-HRM-02** (soft-delete mutate) | ⋯ → Xóa → AlertDialog → POST archive → F5 | **PASS** | archive **201** · `navigatedProfileOnXoa=false` · PNG 03/05 · stamp `SD8F0V2Q` |
| **J-HRM-02** (row-click must_keep) | plain td → profile | **PASS** | runtime journey 🟢 · PNG 06 · URL `/hr/employees/4315dade-…` |
| **J-HRM-04** (BH) | TC-049 | **DEFERRED / OUT OF SLICE** | remains 🟡 — **R-MUTATE-BH-400-01** |

---

## must_keep regression

| Item | Check | QC |
|------|-------|-----|
| **TC-HRM-HDSD-041** | matrix 🟢 · promote untouched · no contract DELETE this wave | ✅ |
| **TC-HDSD-06/07/08** | promote `must_keep_untouched` · network = employee create+archive only | ✅ |
| **Ch09 096/097** | in `must_keep_untouched` | ✅ |
| **Prior 🟢** | `regressions: []` · only 025 🟡→🟢 | ✅ |
| **U65** | runtime `u65: zero-seed` · disposable stamp NV | ✅ no seed |
| **Row-click profile** | asserted after FE isolation fix | ✅ |

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS (slice)** | TC-025 🟢 CLOSED · archive POST 201 · AlertDialog reachable · F5 gone · 0 false green on 049 · must_keep intact |
| **PROCESS GWC** | QA intake pack **1/8** — missing `command_table` · **does not demote** product close (QC maps commands below · this QC pack targets 8/8) |
| **CONDITION CLOSED** | ~~**R-MUTATE-SOFTDEL-01**~~ · FE isolation + QA retest archive 2xx |
| **CONDITION OPEN (GWC sibling)** | **R-MUTATE-BH-400-01** / TC-049 🟡 — BH lane riêng · **không claim đóng cả mutate-defer** |
| **PROGRAM** | NOT Phase 2 DONE · NOT PROD · **C-HOLD-DEPLOY** local `:5173` only |

---

## Residual (mandatory audit)

| ID | Item | Sev | Class | Owner | Blocks SOFTDEL close? | Trigger |
|----|------|-----|-------|-------|------------------------|---------|
| ~~**R-MUTATE-SOFTDEL-01**~~ | TC-025 archive path | P2 | product FE | — | — | ✅ **CLOSED** this gate |
| **R-MUTATE-BH-400-01** | TC-049 POST participants **400** | P2 | product BE/FE | **dev-be** (+ **dev-fe** if wire) → qa | **No** for SOFTDEL · **Yes** for full mutate-defer all-green | Fix validation · QA Lưu+F5 2xx |
| **C-SOFTDEL-PACK-CMDTBL-01** | QA soft-del MD pack 1/8 `command_table` | P3 process | pack format | qa | No | Next harness add pnpm/node command + exit |
| **C-HOLD-DEPLOY** | Local `:5173` only | Info | env | devops | No | sponsor deploy |
| **C-PROGRAM** | NOT Phase 2 / PROD | P0 program | program | PM | No | program gate |

**QC ruling:** **R-MUTATE-SOFTDEL-01 CLOSED**. Confirm **no false 🟢** on TC-049. must_keep TC-041 + TC-06/07/08 intact. Sibling BH remains OPEN — **không đóng** mutate-defer program bag. No seed. No Phase2 DONE claim.

---

## Command table (QC audit)

| Command / check | Exit / result |
|-----------------|---------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hdsd-bf-03-softdel-ret-01-20260801.md` | **exit 1** FAIL **1/8** — `command_table` (process-only) |
| Read promote JSON | **PASS** — applied=[025] · 322→323🟢 · regressions [] · must_keep_untouched includes 041/049/06/07/08 |
| Read runtime JSON | **PASS** — L0 200 · POST employees **201** · POST `…/archive` **201** · f5Gone · navigatedProfileOnXoa=false · console 0 |
| Matrix spot 025/041/049 | **PASS** — 🟢/🟢/🟡 |
| Screenshots dir (6 PNG) | **PASS** — AlertDialog confirm + F5 empty + Đã xóa(1) + profile |
| Cross-read FE evidence | **PASS** — DataTable isolation + vitest 4/4 |
| Cross-read mutate-defer QC | **PASS** — prior GWC named SOFTDEL OPEN; this WI closes it |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hdsd-bf-03-softdel-close-01-20260801.md` | **exit 0** (this file) |

---

## Conditions (GWC — this slice)

| ID | Item | Sev | Status | Owner |
|----|------|-----|--------|-------|
| ~~**R-MUTATE-SOFTDEL-01**~~ | TC-025 ⋯→Xóa→archive 2xx→F5 | P2 | **✅ CLOSED** | qc |
| **R-MUTATE-BH-400-01** | TC-049 BH dialog Lưu 400 | P2 | ⏳ **OPEN** (sibling) | dev-be → qa |
| **C-SOFTDEL-PACK-CMDTBL-01** | QA pack command_table | P3 | ⏳ OPEN process | qa |
| **C-PROGRAM** | Phase2 / PROD | — | **NOT claimed** | pm |

---

## Handoff

**completion_report:** QC closed **R-MUTATE-SOFTDEL-01** after independent audit of QA retest + FE fix. TC-HRM-HDSD-025 **🟢** with POST archive **201**, AlertDialog reachable, F5 row gone, row-click profile must_keep PASS. Promote applied=[025] only (323🟢). must_keep TC-041 🟢 and TC-06/07/08 untouched. TC-049 / **R-MUTATE-BH-400-01** remains **OPEN** — no false green; **không** claim full mutate-defer closed. U65 zero-seed. NOT Phase2 DONE. Verdict **GO WITH CONDITIONS**.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: D-HDSD-BF-03-BH-400-01 (or QA-HDSD-BF-03-BH-RET-01 if BE already fixed)
from_role: pm | to_role: dev-be
program: P-HDSD-ECOSYSTEM-03 · R-MUTATE-BH-400-01 · Cursor sole
entry_criteria:
- QC-HDSD-BF-03-SOFTDEL-CLOSE-01 PASS_TO_PM · R-MUTATE-SOFTDEL-01 CLOSED
- evidence docs/qa/evidence/qc-hdsd-bf-03-softdel-close-01-20260801.md
- TC-049 still 🟡 · POST /insurance-policy-participants 400 (prior mutate-defer runtime)
exit_criteria:
- Fix BH participant create validation/wire so U65 FE Lưu → POST 2xx → F5
- must_keep TC-025 🟢 · TC-041 🟢 · TC-06/07/08 untouched · no false green
- evidence docs/qa/evidence/d-hdsd-bf-03-bh-400-be-01-20260801.md
- READY_FOR_QA → QA-HDSD-BF-03-BH-RET-01
cấm: seed · demote TC-025 · claim Phase2 DONE
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-bf-03-softdel-close-01-20260801.md`

**ack_status:** **PASS_TO_PM**
