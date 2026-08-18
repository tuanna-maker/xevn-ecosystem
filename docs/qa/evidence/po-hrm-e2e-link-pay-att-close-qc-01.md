# Evidence — `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 gate — **att close → eligibility → period nav → enroll → F5** slice only |
| **priority** | P0 enroll chain closed · module UAT denied · prior hire GWC retained |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll` (entry `:5175` down — ENV OBS) |
| **Verdict** | **GO WITH CONDITIONS** — slice only (`C-SLICE-≠-MODULE`) |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03` PASS_TO_PM |
| **qa_ref** | [`po-hrm-e2e-link-pay-att-close-qa-03.md`](po-hrm-e2e-link-pay-att-close-qa-03.md) |
| **fe_ref** | [`po-hrm-e2e-link-pay-att-close-fe-02.md`](po-hrm-e2e-link-pay-att-close-fe-02.md) |
| **precondition** | [`po-hrm-e2e-link-pay-att-close-qa-02.md`](po-hrm-e2e-link-pay-att-close-qa-02.md) — **J-HRM-06c** att close + eligibility 53 |
| **prior_hire_gwc** | [`po-hrm-e2e-link-pay-hire-qc-01-r2.md`](po-hrm-e2e-link-pay-hire-qc-01-r2.md) — **NOT overwritten** |
| **machine** | [`_tmp-po-hrm-e2e-link-pay-att-close-qa-03-browser.json`](_tmp-po-hrm-e2e-link-pay-att-close-qa-03-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-close-qa-03/` |
| **spec_ref** | FR-HRM-PR-05 · AC-PAY-HIRE-04/05 · J-HRM-06c · UF-HRM-06 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — slice GWC ≠ payroll module UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **payroll_e2e_ready** | **true** (narrow) | **ACCEPT** — justified **only** by AC-PAY-HIRE-04 ∧ AC-PAY-HIRE-05 browser evidence this wave |
| **payroll module UAT** | **DENIED** | Not certified |
| **recruitment_uat_ready** | **false** / untouched | **Cấm promote** |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Prior hire GWC (R2)** | **Retained** | Do not overwrite ELIG-UI / scope seals; ATT-412-BROWSER remains OPEN |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT for **att-close → pay eligibility → period deep-link nav → enroll → F5** under U65.

| Chain link | Evidence | QC |
|------------|----------|-----|
| **J-HRM-06c** Jan att close | QA-02: submit 201 → 3× sign 201 → close 201 → F5 closed | **ACCEPT** (prior; not re-run this seat) |
| BE eligibility after close | QA-02 + QA-03: `dffbb1fe…` → **eligible_count=53** | **ACCEPT** |
| FE-02 Path A deep-link | QA-03: month=1/year=2026/batch=dffbb1fe… → detail + `pay-batch-add-emp-btn` | **ACCEPT** — closes **R-PAY-PERIOD-ROW-NAV** |
| **AC-PAY-HIRE-04** enroll | POST enroll **201** · body `{mode, employee_ids}` only · no `company_id` | **ACCEPT** |
| **AC-PAY-HIRE-05** F5 | Row **UAT-0100** · count=1 persists | **ACCEPT** (PNG 08) |
| Path B filter+row | NOT RUN | **CONDITION** soft OBS — Path A sufficient for slice |
| ATT-412 / Khóa browser | Khóa btn **visible** after enroll (PNG 06/08) — **click not executed** | **CONDITION** — keep `R-PAY-HIRE-ATT-412-BROWSER` OPEN |

**Cấm:** module payroll UAT · recruitment_uat_ready · production GO · Phase 1 DONE · overwrite hire-qc-01-r2.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QA-02 att+elig | `po-hrm-e2e-link-pay-att-close-qa-02.md` | FAIL_TO_PM (nav block) | **ACCEPT** J-HRM-06c + eligible=53; nav residual closed by FE-02 |
| FE-02 period nav | `po-hrm-e2e-link-pay-att-close-fe-02.md` | READY_FOR_QA | **ACCEPT** R-PAY-PERIOD-ROW-NAV fix |
| QA-03 enroll+F5 | `po-hrm-e2e-link-pay-att-close-qa-03.md` | PASS_TO_PM | **ACCEPT** Path A + AC-04/05 |
| Hire GWC R2 | `po-hrm-e2e-link-pay-hire-qc-01-r2.md` | PASS_TO_PM GWC | **RETAIN** — not superseded as module seal |

### Machine JSON spot (QA-03)

| Signal | Value | QC |
|--------|-------|-----|
| `l0.hrm/xbos/portal` | 200 | **PASS** |
| `path.used` | **A** | **PASS** |
| `path.A.addEmpVisible` | true | **PASS** |
| `pay.eligibilityApi.eligible_count` | **53** | **PASS** |
| `pay.enabledCheckboxCount` | 53 | **PASS** |
| enroll POST | **201** | **PASS** |
| `enrollBody.keys` | `mode`, `employee_ids` | **PASS** whitelist |
| `enrollBody.hasCompanyId` | false | **PASS** |
| `enroll.f5Persist` | true · `rowCount=1` | **PASS** |
| `honesty.payroll_e2e_ready` | true | **ACCEPT narrow** (AC-04∧05 only) |
| `consoleErrors` / `pageErrors` | `[]` | **PASS** |
| `criteria.*` | all PASS | **PASS** |
| U65 seed | none in click path | **PASS** |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `01-path-a-landing.png` | Draft `01/2026` · 0 NV · empty table · **+ Thêm nhân viên** visible |
| `06-after-enroll-click.png` | Toast «Đã thêm…» · **UAT-0100** · Số NV=1 · Khóa visible |
| `08-after-f5.png` | Same draft · **UAT-0100** still present · count=1 — F5 OK |

---

## Gate AC audit

| # | AC / Check | Evidence | QC |
|---|------------|----------|-----|
| 1 | L0 stack | QA-03 + QC `qc:dev-stack` HRM/XBOS/5173 **200** | 🟢 |
| 2 | J-HRM-06c att close precondition | QA-02 browser | 🟢 (prior) |
| 3 | eligible_count≥1 after close | **53** | 🟢 |
| 4 | Path A deep-link → add-emp | QA-03 Path A | 🟢 |
| 5 | Path B filter+row | NOT RUN | 🟡 CONDITION OBS |
| 6 | **AC-PAY-HIRE-04** enroll 201 + body whitelist | Machine + MD | 🟢 **PROMOTED** (closes hire WAIVE for this AC) |
| 7 | **AC-PAY-HIRE-05** F5 | Machine + PNG 08 | 🟢 **PROMOTED** |
| 8 | U65 zero-seed | claimed + no seed in flow | 🟢 |
| 9 | `payroll_e2e_ready=true` honesty | AC-04∧05 only · module DENIED | 🟢 honesty |
| 10 | Module UAT / prod GO | Explicit DENIED | 🟢 denied |
| 11 | Prior hire GWC not overwritten | R2 retained | 🟢 |

---

## L2.5 J-* audit (U19)

| Journey / UF | Scope vs this seal | QC |
|--------------|-------------------|-----|
| **J-HRM-06c** att sign→close | Precondition — QA-02 PASS | **PASS** (prior seat) |
| **UF-HRM-06** / Path A period nav → Thêm NV → enroll → F5 | In-scope slice | **PASS** |
| Path B list filter + row | Deferred | **OBS** |
| **J-HRM-07** payslip list→detail | Untouched | prior host |
| Khóa / ATT-412 browser | Residual from hire program | **OPEN** CONDITION |
| Journey map row J-HRM-06c | Still ⬜ UNTESTED in `PROGRAM_JOURNEY_MAP.md` | **PROCESS OBS** — PM update map (QA-02 evidence exists) |

Mandatory for this gate: att-close precondition + eligibility + Path A enroll + F5. **Not** invent PASS on full payroll module UAT.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Path A deep-link; enroll 201 whitelist; F5 UAT-0100; eligible=53; R-PAY-PERIOD-ROW-NAV **CLOSED** |
| **PRODUCT (OPEN)** | `R-PAY-HIRE-ATT-412-BROWSER` P2 — Khóa visible but not clicked this seat |
| **PROCESS** | QA-03 `verify:qc:evidence-pack` **FAIL 2/8** (`ack_status:` line + command_table) — **OBS only**; QC pack consolidates. Journey map J-HRM-06c still ⬜ vs QA-02 PASS — PM hygiene |
| **ENV** | Portal entry `:5175` down; live `:5173` L0 **200** — **OBS not auto NO-GO** (per PM entry). `qc:dev-stack` healthy then Windows UV assert crash on exit — ENV OBS |
| **OUT-OF-SCOPE / DENIED** | Payroll module UAT · recruitment_uat_ready · production GO · Phase 1 DONE · overwrite hire-qc-01-r2 |

ENV does not drive product NO-GO. Process pack miss is OBS, not product demote.

---

## Residual / Conditions

| Id | Status | Sev | Owner | work_item_hint | Blocks slice GWC? |
|----|--------|-----|-------|----------------|-------------------|
| **R-PAY-PERIOD-ROW-NAV** | **CLOSED** (FE-02 + QA-03) | — | — | — | No |
| **R-PAY-HIRE-NO-ELIGIBLE-U65** | **CLOSED** for enroll chain | — | — | att close + eligible 53 proven | No |
| **AC-PAY-HIRE-04/05** | **PROMOTED** 🟢 | — | — | — | No |
| **R-PAY-HIRE-ATT-412-BROWSER** | **OPEN** | P2 | qa (after this GWC) | `PO-HRM-E2E-LINK-PAY-ATT-412-QA-01` — click **Khóa bảng lương** → expect 412/2xx per AC | **No** for this slice |
| Path B filter+row | **DEFERRED** | P3 | qa optional | smoke Path B on next pay seat | No |
| QA-03 pack format | PROCESS OBS | P3 | qa | next seat: `ack_status:` + command table | No |
| Journey map J-HRM-06c ⬜ | PROCESS OBS | P3 | pm | stamp QA-02 PASS on map | No |
| Portal `:5175` vs `:5173` | ENV OBS | P3 | devops | optional align default portal port | No |

**No product P0 FAIL** on in-scope slice → **GWC** (not clean GO) due to ATT-412-BROWSER + Path B OBS + denials.

---

## not promoted (explicit)

| Item | Reason |
|------|--------|
| Payroll **module** UAT-ready | `C-SLICE-≠-MODULE` |
| `recruitment_uat_ready` | Untouched / cấm promote |
| Production GO / product GO | Out of scope |
| Phase 1 DONE | Program gates open |
| Path B period filter UX certification | NOT RUN |
| ATT-412 Khóa browser | Not executed (btn visible only) |
| Overwrite `po-hrm-e2e-link-pay-hire-qc-01-r2` | Prior GWC retained; this seal **adds** AC-04/05 promote only |
| Full hire-to-pay «complete» matrix stamp | Slice seal only |

**Promoted (narrow):**

| Item | Status |
|------|--------|
| FE-02 Path A period deep-link | 🟢 |
| AC-PAY-HIRE-04 browser enroll | 🟢 |
| AC-PAY-HIRE-05 F5 | 🟢 |
| `payroll_e2e_ready=true` | 🟢 **narrow** (AC-04∧05) — **≠** module UAT |

---

## Relationship to prior hire GWC (R2)

| Topic | Hire QC R2 | This QC-01 |
|-------|------------|------------|
| Scope parity / ELIG-UI fail-closed | GWC held | **Untouched / retained** |
| AC-04/05 | WAIVED-U65 / NOT PROMOTED | **PROMOTED** (att close unblocked) |
| `payroll_e2e_ready` | false | **true (narrow AC-04∧05)** |
| ATT-412 browser | OPEN P2 | **Still OPEN** |
| Module UAT | Denied | **Denied** |

---

## Gate commands (QC)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-03.md
→ FAIL process 2/8 · ack_status: prefix + command_table — PROCESS OBS only

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qc-01.md
→ (sealed this file)

pnpm run qc:dev-stack
→ HRM 200 · XBOS 200 · portal :5173 200 · (Windows UV assert on process exit — ENV OBS)
```

| Check | Result |
|-------|--------|
| QA-03 evidence completeness | ✅ click path · Network 201 · FE after 2xx · F5 · AC table |
| Machine JSON vs MD | ✅ aligned |
| Screenshot visual | ✅ 01 / 06 / 08 |
| `payroll_e2e_ready` honesty | ✅ true only via AC-04∧05 · module DENIED |
| U65 | ✅ |
| Prior hire GWC overwrite | ❌ not done — retained |

---

## completion_report

- **Closed:** Slice GWC for att close (QA-02) → eligibility 53 → Path A period nav (FE-02/QA-03) → enroll POST 201 whitelist → F5 UAT-0100. **R-PAY-PERIOD-ROW-NAV CLOSED**. **AC-PAY-HIRE-04/05 PROMOTED**. Narrow `payroll_e2e_ready=true` **ACCEPT**.
- **Conditions / residual:** `R-PAY-HIRE-ATT-412-BROWSER` P2 OPEN; Path B deferred OBS; QA-03 pack format P3 OBS; journey map J-HRM-06c hygiene OBS; portal port ENV OBS.
- **NOT claimed / cấm:** payroll module UAT · recruitment_uat_ready · production GO · Phase 1 DONE · overwrite hire-qc-01-r2.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QC-01 → INTAKE
role: pm
ack: PASS_TO_PM
verdict: GO WITH CONDITIONS — att→pay enroll slice ONLY (AC-04∧05 + Path A)
evidence: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qc-01.md
facts:
  - Path A deep-link Jan draft dffbb1fe… PASS; eligible_count=53
  - enroll POST 201 body {mode, employee_ids} only; F5 keeps UAT-0100
  - payroll_e2e_ready=true NARROW (AC-04∧05) · NOT module UAT · NOT production GO
  - prior hire GWC R2 RETAINED (not overwritten)
  - R-PAY-HIRE-ATT-412-BROWSER still OPEN — Khóa visible after enroll, click not tested
cấm: recruitment_uat_ready · full payroll module UAT · production GO
next_wave (priority):
  1) qa: PO-HRM-E2E-LINK-PAY-ATT-412-QA-01 — U65 click Khóa bảng lương on enrolled draft → assert ATT-412/process AC
  2) pm: stamp PROGRAM_JOURNEY_MAP J-HRM-06c from QA-02 PASS (hygiene)
  3) optional: Path B filter smoke; QA pack ack_status:/command_table on next seat
```

## ack_status

**PASS_TO_PM**
