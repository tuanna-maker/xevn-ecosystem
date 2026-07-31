# QC Gate — SoftDel + BH Dev8088 (`QC-HDSD-MUTATE-SOFTDEL-BH-8088-GATE-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-HDSD-MUTATE-SOFTDEL-BH-8088-GATE-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · `R-8088-FE-SOFTDEL-EMP-FORM-MAP-01` CLOSED SoftDel · TC-049 must_keep |
| **gate_type** | L3 QC — **narrow SoftDel + BH Dev8088 only** |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **auditor** | QC |
| **date** | 2026-08-01 |
| **portal_url** | `http://14.225.217.232:8088` |
| **VPS HEAD** | `ba2ad5f` (ops REDEPLOY-03B) |
| **policy** | U65 zero-seed · browser-only · **cấm** probe-only GO · **cấm** demote TC-049 · **cấm** reopen Recruitment · **cấm** Phase2/PROD claim |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**GO WITH CONDITIONS** — SoftDel Dev8088 slice **CLOSED**; BH/ViMoney **must_keep 🟢 not demoted**.

| TC / check | Prior | QA RET2 / SMOKE-03 | QC audit |
|------------|-------|--------------------|----------|
| **TC-HRM-HDSD-025** SoftDel archive | 🔴 EmpForm `departments.map` (SMOKE-03 / 03A-RET) | 🟢 POST archive **201** · `f5Gone=true` · stamp `SD8N1STG` · harness exit **0** | ✅ **CLOSED** on `:8088` @ `ba2ad5f` |
| Plain row → profile (J-HRM-02) | 🔴 0 rows | 🟢 `/hr/employees/4315dade-…` · GET by id **200** | ✅ must_keep PASS |
| EmpForm mount guard | crash | Vite body: `departmentOptionsFromCatalog(catalogs ?? [])` · **no** live `departments.map` | ✅ CLOSED |
| **TC-HRM-HDSD-049** BH + ViMoney | 🟢 SMOKE-03 enroll | RET2 spot dialog OK · **not** re-enroll · **not demoted** | ✅ must_keep **🟢** |
| Probe-only PASS | — | ❌ rejected — browser SoftDel mutate required | ✅ no probe-only GO |
| U65 seed | — | none · disposable FE create stamp | ✅ |

**NOT claimed:** Phase 2 DONE · PROD · full mutate program bag · Recruitment / jobRequisitionUi / HDSD 01A-C / S2 Inbox · re-open SoftDel lane after this GWC.

---

## Evidence polled (intake)

| Artifact | Pack / check | QC audit |
|----------|--------------|----------|
| `qa-hdsd-mutate-softdel-8088-smoke-03a-ret2-20260801.md` | `verify:qc:evidence-pack` **exit 1** · **1/8** missing `command_table` | ✅ Product PASS independent — archive 201 · F5 · row→profile · U65 · residual ViDateField named |
| `qa-hdsd-mutate-softdel-bh-8088-smoke-03-20260801.md` | pack **1/8** `command_table` (has § Command table but no `pnpm`/`node`+exit pattern) | ✅ TC-049 **🟢** enroll POST **201** `HRM-INS-P-201` · `base_salary: 15000000` · F5 no Sync ERROR · SoftDel was 🔴 then (honest) |
| `do-hdsd-mutate-softdel-emp-form-redeploy-03b-20260801.md` | ops READY_FOR_QA | ✅ HEAD **`ba2ad5f`** · EmpForm guard + ViDateField drop to `Input type="date"` · ViMoney intact |
| `_tmp-qa-hdsd-mutate-softdel-8088-smoke-03a-ret2-runtime.json` | — | ✅ TC-025 🟢 · ROWCLICK 🟢 · POST employees **201** · POST `…/archive` **201** · `f5Gone` · `navigatedProfileOnXoa=false` · pageErrors **[]** · consoleErrors **[]** · `u65: zero-seed` |
| `_tmp-…-ret2-vite-probe.json` | adjunct only | ✅ EmpForm 200 module · `hasDepartmentOptionsFromCatalog` · `liveDepartmentsMap=false` · ViMoney 200 · **not** sole PASS |
| `_tmp-…-ret2-bh-spot.json` | optional | ✅ `dialogVisible=true` · pageErrors [] · `SPOT_OK_MUST_KEEP_049` |
| `_tmp-…-smoke-03-bh-vimoney-runtime.json` | prior BH green | ✅ enroll POST **201** · code `HRM-INS-P-201` · ViMoney filled · dialog closed · no resolve fail |
| `screens/hdsd-softdel-8088-smoke-03a-ret2-20260801/` | 6 PNG | ✅ **03** AlertDialog «Xác nhận xóa nhân viên» + stamp `QA-SD-SD8N1STG` · **05** F5 search empty + «Đã xóa (2)» · **06** profile shell (back + skeleton after row click; URL/network corroborate) |

---

## L2.5 journey (U19 — QC independent map)

| Journey | Slice mapping | Verdict | Evidence |
|---------|---------------|---------|----------|
| **J-HRM-02** SoftDel mutate | ⋯ → Xóa → AlertDialog → POST archive → F5 | **PASS** | runtime archive **201** · `f5Gone=true` · PNG 03/05 · stamp `SD8N1STG` · portal `:8088` |
| **J-HRM-02** row-click must_keep | plain td → profile | **PASS** | runtime journey 🟢 · GET employee by id **200** · URL `…/employees/4315dade-…` · PNG 06 (shell) |
| **J-HRM-04** BH enroll | TC-049 full Lưu | **PASS (prior)** · RET2 spot only | SMOKE-03 vimoney runtime **201** · RET2 spot must_keep · **not demoted** |

**Out of scope (deferred / separate lane):** Recruitment · J-REC-WF · HDSD 01A-C · S2 Inbox.

---

## must_keep regression

| Item | Check | QC |
|------|-------|-----|
| **TC-049 / ViMoney** | SMOKE-03 enroll 🟢 preserved · RET2 spot dialog · Vite ViMoneyInput 200 | ✅ **not demoted** |
| SoftDel AlertDialog path | reachable after EmpForm guard | ✅ |
| Catalog / metadata SoftDel export | `resolveHrmCompanySlugForDisplay` Vite 200 | ✅ intact |
| Local `:5173` SoftDel/BH greens | cited must_keep · no demote | ✅ |
| U65 | runtime `u65: zero-seed` · FE create disposable · no seed command | ✅ |
| Recruitment | not opened | ✅ |

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS (slice)** | SoftDel Dev8088 TC-025 CLOSED · archive POST 201 · AlertDialog · F5 gone · row→profile · EmpForm MAP residual CLOSED · BH TC-049 must_keep 🟢 |
| **PROCESS GWC** | QA RET2 (+ BH SMOKE-03) pack **1/8** — missing verifier `command_table` pattern (`pnpm`/`node` + exit) · **does not demote** product close (this QC pack targets 8/8) |
| **CONDITION OPEN (GWC)** | **C-VIDATEFIELD-DEFER** — dialog uses `Input type="date"`; real `ViDateField` vi-VN later · **not** SoftDel blocker |
| **ENV noise (non-blocking)** | runtime L0 `hrm: TypeError: fetch failed` on direct probe — SoftDel browser path still used portal APIs **200** |
| **PROGRAM** | NOT Phase 2 DONE · NOT PROD · **no** SoftDel reopen |

---

## Residual (mandatory audit)

| ID | Item | Sev | Class | Owner | Blocks SoftDel/BH gate? | Trigger |
|----|------|-----|-------|-------|-------------------------|---------|
| ~~**R-8088-FE-SOFTDEL-EMP-FORM-MAP-01**~~ | EmpForm `departments.map` / SoftDel unreachable | P0 | product FE | — | — | ✅ **CLOSED** this gate |
| ~~**R-8088-FE-BH-VIMONEY-01**~~ | ViMoney resolve fail | P0 | product FE | — | — | ✅ **CLOSED** prior SMOKE-03 (must_keep) |
| **C-VIDATEFIELD-DEFER** | Ship real `ViDateField` (dd/MM/yyyy) | P3 | product FE polish | **dev-fe** (later) | **No** | Optional D-FE after this GWC · **do not reopen SoftDel** |
| **C-SOFTDEL8088-PACK-CMDTBL-01** | QA SoftDel/BH MD pack 1/8 `command_table` | P3 process | pack format | qa | No | Next harness note `node …` exit 0 in MD |
| **C-PROGRAM** | Phase2 / PROD | — | program | PM | No | program gate |

**QC ruling:** SoftDel + BH Dev8088 narrow gate **GO WITH CONDITIONS**. Confirm **no false 🟢** from Vite probe alone. TC-049 **not demoted**. No seed. **Do not reopen SoftDel** after this verdict.

---

## Command table (QC audit)

| Command / check | Exit / result |
|-----------------|---------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-ret2-20260801.md` | **exit 1** FAIL **1/8** — `command_table` (process-only) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-03-20260801.md` | **exit 1** FAIL **1/8** — `command_table` (process-only) |
| Read SoftDel RET2 runtime JSON | **PASS** — POST employees **201** · POST `…/archive` **201** · f5Gone · ROWCLICK 🟢 · pageErrors [] · u65 zero-seed |
| Read BH vimoney runtime (SMOKE-03) | **PASS** — POST participants **201** `HRM-INS-P-201` · `base_salary: 15000000` · dialog closed |
| Read RET2 vite + BH spot JSON | **PASS** — EmpForm guard markers · ViMoney intact · BH spot `SPOT_OK_MUST_KEEP_049` |
| Screenshots dir (6 PNG RET2) | **PASS** — AlertDialog confirm + F5 empty stamp + profile shell |
| Cross-read ops REDEPLOY-03B | **PASS** — HEAD `ba2ad5f` · no seed · ViDateField residual named |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hdsd-mutate-softdel-bh-8088-gate-01-20260801.md` | **exit 0** (this file) |

---

## Conditions (GWC — this slice)

| ID | Item | Sev | Status | Owner |
|----|------|-----|--------|-------|
| ~~**R-8088-FE-SOFTDEL-EMP-FORM-MAP-01**~~ | SoftDel EmpForm mount / TC-025 Dev8088 | P0 | **✅ CLOSED** | qc |
| **C-VIDATEFIELD-DEFER** | Real ViDateField later | P3 | ⏳ OPEN | dev-fe (optional later) |
| **C-SOFTDEL8088-PACK-CMDTBL-01** | QA pack command_table | P3 | ⏳ OPEN process | qa |
| **C-PROGRAM** | Phase2 / PROD | — | **NOT claimed** | pm |

---

## Explicit non-claims

- Did **not** demote TC-049 / ViMoney.
- Did **not** GO from Vite probe / API list 200 alone.
- Did **not** re-run full browser mutate (audit only; no contradiction found).
- Did **not** reopen Recruitment / HDSD 01A-C / S2 Inbox.
- Did **not** claim Phase 2 DONE / PROD / full mutate-defer bag.

---

## Handoff

**completion_report:** QC audited SoftDel RET2 + prior BH SMOKE-03 + ops REDEPLOY-03B on Dev8088 @ `ba2ad5f`. **R-8088-FE-SOFTDEL-EMP-FORM-MAP-01 CLOSED** — TC-025 archive POST **201**, AlertDialog, F5 row gone (`SD8N1STG`), J-HRM-02 row→profile PASS; U65 zero-seed; not probe-only. **TC-049 / ViMoney must_keep 🟢 not demoted** (SMOKE-03 enroll **201** + RET2 spot). GWC residuals: **C-VIDATEFIELD-DEFER** (optional D-FE later) · QA pack `command_table` P3 process · **NOT** Phase2/PROD. **Do not reopen SoftDel.** Verdict **GO WITH CONDITIONS**.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: D-HDSD-MUTATE-VIDATEFIELD-01 (optional · later · non-blocking)
from_role: pm | to_role: dev-fe
program: P-HDSD-ECOSYSTEM-03 · C-VIDATEFIELD-DEFER from QC-HDSD-MUTATE-SOFTDEL-BH-8088-GATE-01
priority: P3
entry_criteria:
- QC SoftDel+BH Dev8088 GWC PASS_TO_PM — SoftDel CLOSED; TC-049 must_keep
- evidence: docs/qa/evidence/qc-hdsd-mutate-softdel-bh-8088-gate-01-20260801.md
- EmpForm currently uses Input type="date" (hotfix ba2ad5f) — SoftDel must_keep
exit_criteria:
1. Ship ViDateField (vi-VN dd/MM/yyyy) for employee start/birth (or documented waive)
2. must_keep SoftDel TC-025 🟢 · TC-049 ViMoney 🟢 · EmpForm mount guard · no departments.map
3. READY_FOR_QA only if UI mutate path touched; else PASS_TO_PM polish
cấm: seed · demote SoftDel/BH · reopen Recruitment · rewrite SoftDel DataTable
NOTE: PM may defer indefinitely — SoftDel/BH Dev8088 gate already GWC; no SoftDel reopen required.
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-mutate-softdel-bh-8088-gate-01-20260801.md`

**ack_status:** **PASS_TO_PM**
