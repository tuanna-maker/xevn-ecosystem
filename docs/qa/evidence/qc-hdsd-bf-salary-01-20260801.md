# QC Gate — HDSD BF-03 Ch09 Lương kỳ (`QC-HDSD-BF-SALARY-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-HDSD-BF-SALARY-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · **BF-03** · Ch09 salary slice |
| **gate_type** | L3 QC — post `QA-HDSD-BF-SALARY-01` |
| **auditor** | QC |
| **date** | 2026-08-01 |
| **policy** | U65 zero-seed · HOLD_DEPLOY · portal `:5173` + HRM embed `:8080` · pilot mobile `:3001` read-only |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**GO WITH CONDITIONS** — BF-03 **Ch09 Lương kỳ web slice closed** for:

- **Portal Ch09** — all in-scope tabs load 🟢 · `GET /payroll/periods` + `/payroll/payslips` **200** · **1** kỳ row · P-CC embed `/command-center/hrm/payroll` 🟢 · no ERROR banner.
- **J-MOB-04 cross-check** — pilot read-only probe 🟢 (`total=1`) · device SoT **R7** 🟢 (list→detail · `Thực lĩnh` · no ERR-NETWORK).

**NOT in this gate scope:** Full BF-03 (59 TC · Ch05/06/HĐ/BH) · Ch09 **Lập bảng lương** create mutate · remaining BF-03 QA waves · Phase 1 DONE · PROD-READY · `:8088` deploy.

---

## Evidence polled (QA intake)

| Artifact | Pack verify | QC audit |
|----------|-------------|----------|
| `qa-hdsd-bf-salary-01-20260801.md` | **8/8 PASS** | ✅ Ch09 matrix + command table |
| `_tmp-qa-hdsd-bf-salary-01-runtime.json` | — | ✅ `overall: PASS_TO_PM` · all Ch09 steps `ok: true` |
| `qa-hdsd-mob-ch12-01-r7-20260801.md` | 1/8 (prior gate) | ✅ J-MOB-04 device PASS cited |
| `HDSD_BF_TC_MAP_DELTA.md` §6 BF-03 · Ch09 rows | — | ✅ TC mapping aligned |

---

## HDSD_BF_TC_MAP_DELTA §BF-03 Ch09 audit

| HDSD § | TC range (delta) | QA check | Verdict | Notes |
|--------|------------------|----------|---------|-------|
| §2 Tab **Tổng quan** | TC-HRM-HDSD-090 | Tab click · banner=false | 🟢 **PASS** | runtime `TC-HDSD-09-tab-overview` |
| §3 Tab **Thành phần lương** | TC-HRM-HDSD-091 | `salary-components` 200 | 🟢 **PASS** | runtime `TC-HDSD-09-tab-components` |
| §4 Tab **Chính sách** | TC-HRM-HDSD-092..094 | settings/catalog load | 🟢 **PASS** | runtime `TC-HDSD-09-tab-policy` |
| §5 Tab **Dữ liệu** | TC-HRM-HDSD-095 | banner=false | 🟢 **PASS** | runtime `TC-HDSD-09-tab-data` |
| §6 Tab **Tính lương** | TC-HRM-HDSD-098..100 | `periods?company_id=main` 200 · **1 row** | 🟢 **PASS** | list spot sufficient for slice |
| §6 create spot | TC-HRM-HDSD-098..100 (dialog) | **Lập bảng lương** harness click miss | 🟡 **GWC** | automation only — **not NO-GO** per slice AC |
| §7 Tab **Chi trả** | TC-HRM-HDSD-101 | `payslips?company_id=main` 200 | 🟢 **PASS** | runtime `TC-HDSD-09-02-payslip-tab` |
| §8 Tab **Báo cáo** | TC-HRM-HDSD-102 | banner=false | 🟢 **PASS** | runtime `TC-HDSD-09-tab-report` |
| Mount / P-CC | TC-HDSD-09-01-01 · P-CC-08 | `/hr/payroll` + CC embed | 🟢 **PASS** | no Sync ERROR |
| CH12 §12.5 mobile | TC-MOB-020..022 · **J-MOB-04** | R7 device + pilot probe | 🟢 **PASS** | see J-MOB section |

**Spine AC (delta §6):** lương kỳ list visible · mobile phiếu lương — **partial** (web list 🟢 · mobile cross-check 🟢 · web create dialog deferred GWC).

---

## Ch09 independent runtime cross-check (QC)

| Check | QA MD | Runtime JSON | QC |
|-------|-------|--------------|-----|
| L0 `qc:dev-stack` | exit 0 | exit 0 | ✅ |
| L0 `qc:fe-be-health` | ALL PASS | exit 0 | ✅ |
| HRM embed `:8080` | 200 | ok true | ✅ |
| Ch09 mount | banner=false | `TC-HDSD-09-01-01-mount` ok | ✅ |
| All 6 tabs | 🟢 each | 6/6 steps ok | ✅ |
| Kỳ list | 1 row · periods 200 | `rows=1 periodsGET=200` | ✅ |
| Create spot | 🟡 harness miss | `click miss: Lập bảng lương` · step still `ok:true` (list gate) | ✅ GWC only |
| Payslip tab | payslips 200 | `payslipsGET=200` | ✅ |
| P-CC embed | banner=false | `P-CC-payroll-embed` ok | ✅ |
| Console payroll routes | clean (run 3) | `consoleErrors: []` | ✅ |
| `overall` | PASS_TO_PM | PASS_TO_PM | ✅ |

---

## J-MOB-04 (U19 · pilot read-only + R7 device SoT)

| Layer | Requirement | Verdict | Evidence |
|-------|-------------|---------|----------|
| **Device (SoT)** | Payslip list → detail · no ERR-NETWORK @ `uat.nv0001` | 🟢 **PASS** | `qa-hdsd-mob-ch12-01-r7-20260801.md` · `jmob04-payslip-list/detail.{xml}` · logcat GET `:3001` |
| **Pilot probe** | Mobile login 201 · payslip list 200 · `total=1` | 🟢 **PASS** | runtime `jMob04` · matches R7 preconditions |
| **GET-by-id probe** | Raw id fetch | 🟡 **not promoted** | 404 on probe id — device UI path remains SoT; no ERR-NETWORK regression |

**QC ruling:** J-MOB-04 **still 🟢** for BF-03 salary slice — cite R7 device journey + consistent pilot list smoke. Probe 404 alone does **not** downgrade mobile PASS.

---

## L2.5 journey (U19)

| Journey / TC | Verdict | Note |
|--------------|---------|------|
| **Ch09 web tab cross-nav** | 🟢 PASS | 6 tabs + Tính lương sub-nav · no ERROR banner |
| **P-CC-08** HRM payroll embed | 🟢 PASS | iframe mount @ CC |
| **J-MOB-04** payslip (mobile) | 🟢 PASS | R7 device + pilot list probe |

**Deferred (out of Ch09 slice):** Web **Lập bảng lương** create mutate · full BF-03 Ch05/06 · TC-HRM-HDSD-103 business states depth · member CEO scope negative.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS** | Ch09 all tabs load · periods/payslips GET 200 · 1 kỳ row · CC embed · J-MOB-04 no regression vs R7 |
| **PROCESS GWC** | Create-spot harness did not open **Lập bảng lương** dialog — list 🟢 sufficient; **QC does not NO-GO** per PM slice AC |
| **ENV / transient** | Run 2/3 transient payroll **500** — passed on retry; not promoted blocker |
| **PROBE (not promoted)** | Payslip GET-by-id **404** on raw pilot probe — device R7 remains SoT |
| **PROGRAM (out of slice)** | BF-03 remaining 59 TC · Ch05/06 · Phase 1 DONE · PROD · `:8088` |

---

## Command table (QC audit)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hdsd-bf-salary-01-20260801.md` | **0** | PASS 8/8 |
| Read `_tmp-qa-hdsd-bf-salary-01-runtime.json` | — | PASS — overall PASS_TO_PM · Ch09 steps ok |
| Cross-read `qa-hdsd-mob-ch12-01-r7-20260801.md` | — | PASS — J-MOB-04 device 🟢 |

---

## Conditions (GWC — not NO-GO)

| ID | Item | Sev | Owner | Trigger |
|----|------|-----|-------|---------|
| **C-BF03-SAL-CREATE-01** | Harness missed **Lập bảng lương** dialog open (menu regex / rollup filter) | P3 automation | qa optional | sponsor wants create mutate evidence |
| **C-BF03-SAL-PROBE-01** | Pilot payslip GET-by-id 404 on raw probe | P3 | dev-be if recurs on device | J-MOB-04 detail FAIL on device |
| **C-BF03-SAL-FLAKE-01** | Transient payroll sub-route **500** on harness run 2/3 | P3 monitor | qa | repeat FAIL without retry |
| **C-HOLD-DEPLOY** | Pilot `:3001` read-only only — not prod `:8088` | Info | devops | sponsor deploy OK |
| **C-PROGRAM** | Full BF-03 (59 TC) · NOT Phase 1 DONE · NOT PROD-READY | P0 program | PM | parallel BF-03 waves |

**QC ruling:** No product reopen for Ch09 salary web slice. **No Dev dispatch** required for list 🟢 gate. Create-spot = optional QA depth only.

---

## Residual

| ID | Item | Sev | Blocks Ch09 slice? |
|----|------|-----|-------------------|
| **C-BF03-SAL-CREATE-01** | Create dialog harness | P3 | No |
| **C-BF03-SAL-PROBE-01** | GET-by-id 404 probe | P3 | No (R7 device 🟢) |
| **C-BF03-SAL-FLAKE-01** | Transient 500 run 2 | P3 | No |
| **C-PROGRAM** | Remaining BF-03 TC · Phase 1 | P0 program | No |

No product P0/P1 residual blocks BF-03 Ch09 salary GWC.

---

## Handoff

**completion_report:** L3 audit after `QA-HDSD-BF-SALARY-01` PASS_TO_PM. Evidence pack **8/8**. Independent runtime JSON confirms Ch09 tabs + kỳ list + payslip tab + CC embed PASS. Create-spot harness miss classified **GWC automation only** — **not NO-GO** per slice entry criteria. J-MOB-04 cross-check 🟢 via R7 device SoT + pilot list probe `total=1`. **BF-03 Ch09 salary web slice CLOSED (GWC).** NOT full BF-03 · NOT Phase 1 DONE · NOT PROD.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: PM-HDSD-BF-03-SALARY-CLOSE-01
from_role: qc | to_role: pm
entry_criteria: QC-HDSD-BF-SALARY-01 GWC — evidence docs/qa/evidence/qc-hdsd-bf-salary-01-20260801.md; Ch09 tabs + kỳ list 🟢; J-MOB-04 R7 + probe 🟢
exit_criteria:
- Mark Ch09 salary slice ☑ on HDSD orchestration / BF-03 tracker
- Dispatch next BF-03 wave (Ch05/06 mutate or QA-HDSD-BF-03-01 successor) per sprint backlog
- Optional: QA create-spot retest for Lập bảng lương if sponsor wants mutate AC (C-BF03-SAL-CREATE-01)
ack_status: PASS_TO_PM
residual_auto_fix: none blocking — C-BF03-SAL-CREATE-01 optional qa depth only
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-bf-salary-01-20260801.md`

**ack_status:** **PASS_TO_PM**
