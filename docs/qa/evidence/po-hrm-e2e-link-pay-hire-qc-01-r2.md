# Evidence — `PO-HRM-E2E-LINK-PAY-HIRE-QC-01-R2`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-HIRE-QC-01-R2` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 re-gate — **UF-HRM-06** / **J-HRM-07** hire-to-pay linkage slice (post FE-05-QA) |
| **priority** | P0 scope parity held · P1 enroll UX closed · cross-module attendance deferred |
| **portal_url** | `http://127.0.0.1:5175/hr/payroll?companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** — hire-to-pay **linkage slice only** (ELIG-UI condition **CLOSED**) |
| **ack_status** | `PASS_TO_PM` |
| **supersedes** | [`po-hrm-e2e-link-pay-hire-qc-01.md`](po-hrm-e2e-link-pay-hire-qc-01.md) (R1 GWC) |
| **qa_ref** | [`po-hrm-e2e-link-pay-hire-fe-05-qa.md`](po-hrm-e2e-link-pay-hire-fe-05-qa.md) PASS_TO_PM |
| **qa_baseline** | [`po-hrm-e2e-link-pay-hire-qa-05.md`](po-hrm-e2e-link-pay-hire-qa-05.md) |
| **machine** | [`_tmp-po-hrm-e2e-link-pay-hire-fe-05-qa-browser.json`](_tmp-po-hrm-e2e-link-pay-hire-fe-05-qa-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-fe-05-qa/` |
| **spec_ref** | `docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md` · FR-HRM-PR-05 · AC-PAY-HIRE-01..05 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — slice GWC ≠ payroll module UAT |

### Honesty locks (mandatory — all false / denied)

| Flag | Value |
|------|-------|
| **payroll_e2e_ready** | **false** |
| **product_go** | **false** |
| **Phase 1 DONE** | **false** / **NOT claimed** |
| **Payroll module UAT** | **NOT certified** — hire-to-pay spine partial only |
| **AC-PAY-HIRE-04/05 full browser chain** | **NOT promoted** — WAIVED-U65 + attendance prerequisite |

---

## Verdict summary

**GO WITH CONDITIONS** — **re-gate ACCEPT** for **UF-HRM-06 / J-HRM-07 hire-to-pay linkage slice** under U65. Delta vs R1 (`qc-01`):

| Change | R1 | R2 |
|--------|----|----|
| `R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH` | P1 OPEN (8 enabled vs 0 eligible) | **CLOSED** — FE-05-QA fail-closed **0 enabled / 61 disabled** when `eligible_count=0` |
| `R-PAY-HIRE-NO-ELIGIBLE-U65` | WAIVED-U65 | **KEEP** — attendance close in flight (cross-module) |
| `R-PAY-HIRE-ATT-412-BROWSER` | P2 OPEN | **KEEP** — API-only proof; Khóa btn not browser-tested |
| AC-PAY-HIRE-04/05 | NOT PROMOTED | **NOT PROMOTED** |
| `payroll_e2e_ready` | false | **false** (unchanged) |

**Retained PASS (R1 + FE-05 regression hold):**

1. **P0 CLOSED:** `R-PAY-HIRE-PERIOD-404-SCOPE` — create `company_id=main` → list → GET eligibility **200** → POST enroll **not 404**.
2. **FE-04 regressions:** month Select iframe · auto detail after create · enroll body without `company_id`.
3. **FE-05 fail-closed:** Thêm NV dialog — **zero** enabled checkboxes when BE `eligible_count=0`; badges `NO_CLOSED_SHEET` / `NOT_FOUND`.
4. **ATT-412 API:** POST `/process` → **412** `HRM-PAY-ATT-412` (QA-05 baseline — not re-run this seat).
5. **BE jest:** scope parity **66/66 PASS** (BE-03 — cited, not re-run).

**Conditions (explicit NON-CERTIFIED):**

- **NOT** `payroll_e2e_ready=true` — requires attendance close from FE + enroll 2xx + F5 + browser Khóa/412 path.
- **NOT** AC-PAY-HIRE-04/05 full chain — **WAIVED-U65** (`R-PAY-HIRE-NO-ELIGIBLE-U65`: 53/53 NV `NO_CLOSED_SHEET`).
- **NOT** payroll module UAT-ready or Phase 1 DONE.
- **P2 OPEN:** `R-PAY-HIRE-ATT-412-BROWSER` — Khóa button not visible on empty draft detail; API-only proof.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC R2 |
|------|----------|-----|-------|
| Dev-BE BE-03 | `po-hrm-e2e-link-pay-hire-be-03.md` | READY_FOR_QA | **ACCEPT** (held from R1) |
| Dev-FE FE-04 | `po-hrm-e2e-link-pay-hire-fe-04.md` | READY_FOR_QA | **ACCEPT** (held from R1) |
| Dev-FE FE-05 | `po-hrm-e2e-link-pay-hire-fe-04.md` parent | READY_FOR_QA | **ACCEPT** — fail-closed checkbox gate |
| QA browser QA-05 | `po-hrm-e2e-link-pay-hire-qa-05.md` | PASS_TO_PM | **ACCEPT** — scope parity baseline |
| QA FE-05 retest | `po-hrm-e2e-link-pay-hire-fe-05-qa.md` | PASS_TO_PM | **ACCEPT** — closes ELIG-UI mismatch |

### Machine JSON spot (FE-05-QA)

| Signal | Value | QC |
|--------|-------|-----|
| `l0.hrm/xbos/portal` | 200 | **PASS** |
| `steps.eligibilityApi.eligible_count` | 0 | **PASS** |
| `steps.failClosedAudit.enabledCount` | **0** | **PASS** — closes R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH |
| `steps.failClosedAudit.disabledCount` | 61 | **PASS** |
| `steps.failClosedAudit.noClosedBadge` | 53 | **PASS** |
| GET eligibility | 200 `HRM-PAY-200` | **PASS** |
| `enrollBodies[]` | empty (no erroneous enroll) | **PASS** |
| `honesty.payroll_e2e_ready` | false | **PASS** honesty |
| FE-04 month Select | 1137ms PASS | **PASS** regression |
| FE-04 auto detail | true | **PASS** regression |

**Regression note:** QA-05 had `enabledCount` implicit 8 enabled — FE-05-QA machine JSON confirms **0 enabled** after fix. No product demote on linkage slice.

---

## Gate AC audit (PM checklist)

| # | AC / Check | Runtime / evidence | R1 | R2 |
|---|------------|-------------------|----|----|
| 1 | Create draft → list includes new period | QA-05 POST **201** | 🟢 | 🟢 **held** |
| 2 | GET eligibility → NOT 404 | FE-05-QA GET **200** · 0 eligible | 🟢 | 🟢 **held** |
| 3 | POST enroll → NOT 404 | QA-05 **400** `HRM-PAY-ENROLL-EMPTY` | 🟢 | 🟢 **held** |
| 4 | AC-PAY-HIRE-04 enroll 2xx → list updates | 0 eligible — **WAIVED-U65** | 🟡 | 🟡 **NOT PROMOTED** |
| 5 | AC-PAY-HIRE-05 F5 persistence | blocked by AC-04 | 🟡 | 🟡 **NOT PROMOTED** |
| 6 | Eligibility UI badges + fail-closed | QA-05 badges · FE-05 **0 enabled** | 🟡 P1 | 🟢 **PASS** |
| 7 | HRM-PAY-ATT-412 process | API **412** (QA-05) | 🟢 API · 🟡 browser | 🟢 API · 🟡 **P2 browser** |
| 8 | FE-04 month Select + auto detail + enroll body | FE-05-QA criteria 4a–4c | 🟢 | 🟢 **held** |
| 9 | U65 zero-seed | no seed in flow | 🟢 | 🟢 **held** |
| 10 | `payroll_e2e_ready=true` forbidden | absent | 🟢 | 🟢 **held** |

**Score:** 8/8 in-scope linkage AC **PASS or held** · 2 AC **WAIVED/NOT PROMOTED** · 1 residual **P2 CONDITION** · 1 cross-module **WAIVED-U65**.

---

## L2.5 J-* audit (U19 — hire-to-pay slice)

| Journey / UF | Scope vs this seal | R2 QC |
|--------------|-------------------|-------|
| **UF-HRM-06** / **J-HRM-07** hire-to-pay linkage | Create batch → list/detail → Thêm NV → eligibility 200 → fail-closed UI → enroll not 404 → ATT-412 API | **PASS** (**linkage slice only**) |
| **J-HRM-07** payslip list→detail (prior W5B) | Prior ✅ host journey | **untouched** · prior GWC retained |
| **J-HRM-06c** attendance sheet close/sign | Prerequisite for eligible NV | **UNTESTED** · blocks full enroll chain |
| Enroll 2xx → F5 → Khóa browser | Out of U65 without attendance close | **deferred** |

Mandatory for this gate: payroll batches cross-nav + scope parity + fail-closed eligibility UI + ATT-412 API. **Not** invent PASS on full hire-to-pay module UAT or matrix 🟢 promotion beyond linkage slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Scope parity P0 held; fail-closed ELIG-UI **CLOSED**; FE-04/FE-05 regressions; ATT-412 API 412; eligibility badges render |
| **PRODUCT (OPEN)** | `R-PAY-HIRE-ATT-412-BROWSER` P2 only |
| **PROCESS** | FE-05-QA seat `verify:qc:evidence-pack` **FAIL 2/8** (`ack_status:` prefix + command table) — **OBS only**; R2 QC pack consolidates |
| **ENV** | L0 PASS (QC spot `qc:dev-stack` HRM/XBOS **200**; portal 5173 **200**; node UV assertion on exit — **not blocking**) |
| **OUT-OF-SCOPE / WAIVED** | `R-PAY-HIRE-NO-ELIGIBLE-U65` — cross-module attendance close under U65; AC-04/05 full chain; `payroll_e2e_ready`; Phase 1 DONE |

ENV does not drive NO-GO. U65 waiver for AC-04/05 is **documented and ACCEPT** for this slice — not product demote.

---

## Residual

| Id | Status | Sev | Owner | Blocks linkage GWC? |
|----|--------|-----|-------|---------------------|
| `R-PAY-HIRE-PERIOD-404-SCOPE` | **CLOSED** (BE-03 + QA-05) | — | — | No |
| `R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH` | **CLOSED** (FE-05 + FE-05-QA) | — | — | **No** — was R1 condition, now closed |
| `R-PAY-HIRE-NO-ELIGIBLE-U65` | **WAIVED-U65** | P1 cross-module | pm / attendance lane | **No** for slice — blocks `payroll_e2e_ready` |
| `R-PAY-HIRE-ATT-412-BROWSER` | **OPEN** | P2 | dev-fe / qa | **No** — API proven; browser Khóa after enroll unblocked |
| AC-PAY-HIRE-04/05 full browser | **NOT PROMOTED** | — | qa after attendance close | **No** for this GWC |
| `payroll_e2e_ready=true` | **Denied** | — | — | N/A — honesty lock |
| FE-05-QA pack format | OPEN process | P3 | qa next seat | **No** — OBS |

**No product P0 FAIL** on hire-to-pay linkage scope → **GWC idle-ok** for narrow lane. Full module seal remains blocked until **J-HRM-06c** attendance close + enroll 2xx + ATT-412 browser.

---

## not promoted (explicit)

| Item | Reason |
|------|--------|
| `payroll_e2e_ready=true` | Forbidden without attendance-close FE evidence + enroll 2xx + F5 |
| AC-PAY-HIRE-04 enroll 2xx → list updates | WAIVED-U65 — 0 eligible NV |
| AC-PAY-HIRE-05 F5 after enroll | NOT RUN — depends on AC-04 |
| ATT-412 browser Khóa button | P2 — API-only proof this seat |
| Payroll module UAT-ready | `C-SLICE-≠-MODULE` |
| Phase 1 DONE / product GO | Out of scope |
| UF-HRM-06 matrix 🟢 re-stamp as «hire-to-pay complete» | Linkage slice only |

---

## Gate commands (QC)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-05-qa.md
→ FAIL process 2/8 · ack_status: prefix + command_table — PROCESS OBS only

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-pay-hire-qc-01-r2.md
→ PASS 8/8 (sealed 2026-08-06)

pnpm run qc:dev-stack
→ PASS · hrm-api 200 · xbos-api 200 · portal optional 200
```

| Check | Result |
|-------|--------|
| `verify:qc:evidence-pack` FE-05-QA seat | **FAIL process** 2/8 — OBS |
| `verify:qc:evidence-pack` QC R2 pack | **PASS** 8/8 |
| Browser path + machine JSON | ✅ FE-05-QA |
| `payroll_e2e_ready` claim | ❌ absent — ACCEPT |
| ELIG-UI fail-closed | ✅ 0 enabled / 61 disabled |

---

## completion_report

- **Closed (R2 delta):** `R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH` — FE-05-QA browser PASS fail-closed (0 enabled when `eligible_count=0`); FE-04 regressions hold on same seat.
- **Held from R1:** GWC for UF-HRM-06 / J-HRM-07 **hire-to-pay linkage slice** — scope parity P0; ATT-412 API; U65 waivers documented; `payroll_e2e_ready=false`.
- **Open / conditions:** `R-PAY-HIRE-NO-ELIGIBLE-U65` WAIVED-U65 (attendance close in flight); `R-PAY-HIRE-ATT-412-BROWSER` P2; AC-04/05 NOT PROMOTED; FE-05-QA pack format P3 OBS.
- **NOT claimed:** payroll module UAT · `payroll_e2e_ready=true` · Phase 1 DONE · product GO.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QC-01-R2 → INTAKE
role: pm
ack: PASS_TO_PM
verdict: GO WITH CONDITIONS — UF-HRM-06 hire-to-pay linkage slice ONLY (ELIG-UI CLOSED)
evidence: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qc-01-r2.md
facts:
  - R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH CLOSED (FE-05-QA: 0 enabled / 61 disabled)
  - R-PAY-HIRE-NO-ELIGIBLE-U65 KEEP WAIVED-U65 — attendance close (J-HRM-06c) in flight
  - R-PAY-HIRE-ATT-412-BROWSER P2 OPEN — API 412 only
  - payroll_e2e_ready=false · AC-04/05 NOT PROMOTED · NOT module UAT
cấm: promote payroll_e2e_ready=true without attendance-close FE evidence
next_wave (priority):
  1) attendance close/sign program (J-HRM-06c) to unblock eligible NV under U65
  2) after eligible NV exists: QA retest AC-PAY-HIRE-04/05 browser + ATT-412 Khóa btn
  3) optional P3: QA add ack_status: PASS_TO_PM + command table on next pay-hire seat pack
```

## ack_status

**PASS_TO_PM**
