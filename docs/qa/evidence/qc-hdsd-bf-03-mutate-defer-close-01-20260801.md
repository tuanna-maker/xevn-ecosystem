# QC Close — HDSD BF-03 mutate-defer (`QC-HDSD-BF-03-MUTATE-DEFER-CLOSE-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-HDSD-BF-03-MUTATE-DEFER-CLOSE-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · **C-BF03-MUTATE-DEFER-01** · Cursor sole |
| **gate_type** | L3 QC — bounded close after `QA-HDSD-BF-03-MUTATE-DEFER-01` |
| **prior_gates** | `qc-hdsd-bf-03-full-gate-01-20260801.md` (MUTATE-DEFER OPEN P2) · `qc-hdsd-bf-03-profile-close-01-20260801.md` · `qc-hdsd-bf-03-gate-01-20260801.md` (Đ2 mutate GWC) |
| **auditor** | QC |
| **date** | 2026-08-01 |
| **policy** | U65 zero-seed · browser-only · no seed · **must_keep** TC-06/07/08 · no false-promote 025/049 · **cấm Claude** · HOLD_DEPLOY |
| **portal_url** | `http://127.0.0.1:5173` · `PORTAL_DEV_URL` · `/hr/employees` · `/hr/contracts` · `/hr/insurance` |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**GO WITH CONDITIONS** — **C-BF03-MUTATE-DEFER-01 BOUNDED CLOSE** (defer wave audited; not all-green):

| TC | Matrix | Runtime | QC |
|----|--------|---------|-----|
| **TC-HRM-HDSD-041** Xóa HĐ | **🟢** | create POST **201** · DELETE **200** · F5 list OK | ✅ **CLOSED** |
| **TC-HRM-HDSD-025** soft-delete NV | **🟡** | create **201** · archive **none** · AlertDialog miss (row→profile) | ✅ **honest 🟡** — **no false 🟢** |
| **TC-HRM-HDSD-049** Dialog BH | **🟡** | dialog open · POST participants **400** · F5 no Sync ERROR | ✅ **honest 🟡** — **no false 🟢** |

- **Matrix** — promote JSON **321→322🟢 · 43→42🟡** · applied **only TC-041** · skipped 025/049 unchanged 🟡 · `regressions: []`
- **Matrix body** — TC-025 **🟡** · TC-041 **🟢** · TC-049 **🟡** · summary **322🟢 · 42🟡 · 0⬜**
- **must_keep** — TC-HDSD-06/07/08 + Ch09 096/097 in `must_keep_untouched` · no YCTD/leave POST in runtime network · HĐ path disposable create→delete only
- **Parallel** — `D-HDSD-BF-03-SOFTDEL-FE-01` already dispatched for **R-MUTATE-SOFTDEL-01** (does not block this GWC)

**NOT in this gate:** Phase 1 DONE · PROD · `:8088` · false-promote 025/049 · MOB depth · PROFILE reopen · Claude lane.

---

## Evidence polled (QA intake)

| Artifact | Pack verify | QC audit |
|----------|-------------|----------|
| `qa-hdsd-bf-03-mutate-defer-01-20260801.md` | **1/8 FAIL** (`journey_l25` — no explicit `J-*` token) | ✅ Product PASS — 1🟢/2🟡 honest · U65 · residual owners · must_keep |
| `_tmp-qa-hdsd-bf-03-mutate-defer-01-runtime.json` | — | ✅ L0 200×3 · tc[] 025🟡/041🟢/049🟡 · DELETE contracts **200** · POST participants **400** · `u65: zero-seed` · `journeys: []` (pack gap) |
| `_tmp-qa-hdsd-matrix-promote-bf-03-mutate-defer-01-result.json` | — | ✅ applied=[041] · skipped=[025,049] · regressions=[] · must_keep_untouched includes 06/07/08 + 096/097 |
| `screens/hdsd-bf-03-mutate-defer-01-20260801/` | — | ✅ **12 PNG** (NV create/menu · HĐ form/delete/F5 · BH dialog/F5) · note: `03-soft-delete-confirm.png` **filename ≠** AlertDialog proof (runtime `alertdialog miss`) |
| `HDSD_SRS_TESTCASE_MATRIX.md` | — | ✅ 025🟡 · 041🟢 · 049🟡 · **no false green** |
| `qc-hdsd-bf-03-full-gate-01-20260801.md` | prior | ✅ MUTATE-DEFER was OPEN P2 — this WI bounds it |

---

## L2.5 journey (U19 — QC independent map)

QA pack omitted `J-*` labels (`journeys: []`) → **process GWC**; QC maps from click paths + Network:

| Journey | Slice mapping | Verdict | Evidence |
|---------|---------------|---------|----------|
| **J-HRM-03** | TC-041 contracts trash → confirm Xóa → F5 | **PASS** | DELETE `/api/hrm/contracts-insurance/contracts/{id}` **200** · list reload · PNGs 07–10 |
| **J-HRM-02** (soft-delete mutate) | TC-025 menu Xóa → archive | **FAIL / BLOCKED honest** | no `POST …/archive` · navigates profile · **not promoted 🟢** |
| **J-HRM-04** (BH dialog mutate) | TC-049 Thêm BH → Lưu → F5 | **FAIL / BLOCKED honest** | POST `/insurance-policy-participants` **400** · dialog stays · **not promoted 🟢** |

Prior Đ2 spine J-HRM-02 create / J-HRM-03 create / J-HRM-05 / J-HRM-06 **must_keep** — not re-exercised this wave.

---

## must_keep regression

| Item | Check | QC |
|------|-------|-----|
| **TC-HDSD-06-02-01** HĐ create spine | promote `must_keep_untouched` · runtime note disposable delete only | ✅ not re-broken |
| **TC-HDSD-07-02-01** YCTD | no requisition POST in network | ✅ |
| **TC-HDSD-08-02-01** leave | no leave POST in network | ✅ |
| **Ch09 TC-096/097** | in `must_keep_untouched` | ✅ |
| **Prior 🟢** | `regressions: []` · only 041 🟡→🟢 | ✅ |
| **U65** | runtime `u65: zero-seed` · QA policy | ✅ no seed |

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS (bounded)** | TC-041 🟢 CLOSED · 025/049 honest 🟡 · 0 false green · 0🔴 · must_keep intact |
| **PROCESS GWC** | QA intake pack **1/8** — missing `journey_l25` / `J-*` token · **does not block** product GWC (QC maps J-HRM-03/02/04 above · URL in metadata + `env.PORTAL`) · this QC evidence includes J-* |
| **CONDITION CLOSED** | ~~TC-041 / HĐ delete defer~~ · **C-BF03-MUTATE-DEFER-01** defer-wave audit **BOUNDED CLOSED** (1/3 green done; 2/3 conditions named) |
| **CONDITION OPEN (GWC)** | **R-MUTATE-SOFTDEL-01** P2 · **R-MUTATE-BH-400-01** P2 |
| **IN FLIGHT** | `D-HDSD-BF-03-SOFTDEL-FE-01` (dev-fe) for soft-delete |
| **PROGRAM** | NOT Phase 1 DONE · NOT PROD · **C-HOLD-DEPLOY** local `:5173` only |

---

## Residual (mandatory audit)

| ID | Item | Sev | Class | Owner | Blocks bounded MUTATE-DEFER close? | Trigger |
|----|------|-----|-------|-------|--------------------------------------|---------|
| **R-MUTATE-SOFTDEL-01** | TC-025 — DataTable `onRowClick` steals menu Xóa; AlertDialog/archive not reached | P2 | product FE | **dev-fe** (`D-HDSD-BF-03-SOFTDEL-FE-01`) → qa retest | **No** for bounded GWC · **Yes** for TC-025 🟢 | FE stopPropagation / ignore action btn · QA TC-025 archive 2xx |
| **R-MUTATE-BH-400-01** | TC-049 POST participants **400** after Lưu | P2 | product BE/FE | **dev-be** (+ **dev-fe** if field wire) → qa | **No** for bounded GWC · **Yes** for TC-049 🟢 | Fix validation/policy link · QA Lưu+F5 2xx |
| **C-BF03-PACK-J25-01** | QA mutate-defer MD pack 1/8 `journey_l25` | P3 process | pack format | qa | No | Next harness fill `J-HRM-*` in MD + runtime |
| **C-HOLD-DEPLOY** | Local `:5173` only | Info | env | devops | No | sponsor deploy |
| **C-PROGRAM** | NOT Phase 1 / PROD | P0 program | program | PM | No | program gate |

**QC ruling:** **C-BF03-MUTATE-DEFER-01 BOUNDED GWC CLOSE**. Confirm **no false 🟢** on TC-025/049. TC-041 closed. Open conditions have owners (SOFTDEL already dispatched). No Claude. No product P0/P1 blocking this bounded slice.

---

## Command table (QC audit)

| Command / check | Exit / result |
|-----------------|---------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hdsd-bf-03-mutate-defer-01-20260801.md` | **1** FAIL **1/8** — `journey_l25` (process-only) |
| Read promote JSON | PASS — applied 041 only · 025/049 skipped 🟡 · regressions [] |
| Read runtime JSON | PASS — DELETE 200 · archive none · POST BH 400 · L0 200 |
| Matrix spot 025/041/049 | PASS — 🟡/🟢/🟡 |
| Screenshots dir | PASS — 12 PNG |
| Cross-read full-gate | PASS — MUTATE-DEFER was OPEN residual |

---

## Conditions (GWC — this slice)

| ID | Item | Sev | Status | Owner |
|----|------|-----|--------|-------|
| ~~**TC-041 / HĐ delete**~~ | CREATE+DELETE+F5 U65 | P2 | **✅ CLOSED** | qa |
| ~~**C-BF03-MUTATE-DEFER-01 (defer audit)**~~ | Dedicated U65 wave executed · honest matrix | P2 | **✅ BOUNDED CLOSED** | qc |
| **R-MUTATE-SOFTDEL-01** | TC-025 archive path | P2 | ⏳ OPEN · **in flight** | dev-fe → qa |
| **R-MUTATE-BH-400-01** | TC-049 POST 400 | P2 | ⏳ OPEN | dev-be / dev-fe → qa |
| **C-BF03-PACK-J25-01** | QA pack journey_l25 | P3 | ⏳ OPEN | qa |
| **C-HOLD-DEPLOY** | Local only | Info | ⏳ OPEN | devops |
| **C-PROGRAM** | NOT Phase 1 DONE · NOT PROD | P0 program | ⏳ OPEN | PM |

---

## HDSD orchestration promotion

| WI | Status |
|----|--------|
| `QA-HDSD-BF-03-MUTATE-DEFER-01` | ☑ PASS_TO_PM · 1🟢/2🟡 |
| `QC-HDSD-BF-03-MUTATE-DEFER-CLOSE-01` | ☑ **GWC bounded close** |
| `D-HDSD-BF-03-SOFTDEL-FE-01` | ⏳ parallel (R-MUTATE-SOFTDEL-01) |

---

## Handoff

**completion_report:** L3 QC audit after `QA-HDSD-BF-03-MUTATE-DEFER-01`. Independent promote/runtime/matrix confirm **TC-041 🟢 CLOSED**; **TC-025/049 remain 🟡** with **zero false green**. must_keep TC-06/07/08 + Ch09 preserved. QA pack **1/8** journey_l25 = **process GWC** only — QC maps **J-HRM-03 PASS** · soft-delete/BH **honest FAIL**. **C-BF03-MUTATE-DEFER-01 BOUNDED GWC CLOSE.** Residual: SOFTDEL (dev-fe in flight) · BH-400 (dev-be/fe). NOT Phase1/PROD.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: PM-HDSD-BF-03-MUTATE-DEFER-INTAKE-01
from_role: qc | to_role: pm
entry_criteria:
- QC-HDSD-BF-03-MUTATE-DEFER-CLOSE-01 GWC — docs/qa/evidence/qc-hdsd-bf-03-mutate-defer-close-01-20260801.md
- C-BF03-MUTATE-DEFER-01 BOUNDED CLOSED · TC-041 🟢 · 025/049 🟡 honest · no false green
exit_criteria:
- Mark C-BF03-MUTATE-DEFER-01 ☑ bounded on HDSD orchestration / bus
- Ensure D-HDSD-BF-03-SOFTDEL-FE-01 continues → READY_FOR_QA → QA-HDSD-BF-03-SOFTDEL-RETEST-01 (TC-025 archive 2xx)
- Dispatch D-HDSD-BF-03-BH-400-01 (dev-be primary; dev-fe if field wire) for R-MUTATE-BH-400-01 · then QA TC-049
- Do NOT false-promote 025/049 · cấm Claude
ack_status: PASS_TO_PM
residual_auto_fix: R-MUTATE-SOFTDEL-01 → continue SoftDel FE · R-MUTATE-BH-400-01 → Task dev-be
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-bf-03-mutate-defer-close-01-20260801.md`

**ack_status:** **PASS_TO_PM**
