# Evidence — `PO-HRM-E2E-LINK-PAY-HIRE-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-HIRE-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 gate — narrow **UF-HRM-06** hire-to-pay linkage (create → eligibility → enroll → ATT-412 API) |
| **priority** | P0 scope parity + P1 enroll UX |
| **portal_url** | `http://127.0.0.1:5175/hr/payroll?companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** — hire-to-pay **linkage slice only** |
| **ack_status** | `PASS_TO_PM` |
| **parent** | [`po-hrm-e2e-link-pay-hire-qa-05.md`](po-hrm-e2e-link-pay-hire-qa-05.md) PASS_TO_PM |
| **be_ref** | [`po-hrm-e2e-link-pay-hire-be-03.md`](po-hrm-e2e-link-pay-hire-be-03.md) |
| **fe_ref** | [`po-hrm-e2e-link-pay-hire-fe-04.md`](po-hrm-e2e-link-pay-hire-fe-04.md) |
| **machine** | [`_tmp-po-hrm-e2e-link-pay-hire-qa-05-browser.json`](_tmp-po-hrm-e2e-link-pay-hire-qa-05-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-qa-05/` |
| **spec_ref** | `docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md` · FR-HRM-PR-05 · ADR group CEO `main`→holding rollup |
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

**GO WITH CONDITIONS** — ACCEPT seal for **hire-to-pay linkage slice** under U65:

1. **P0 CLOSED:** `R-PAY-HIRE-PERIOD-404-SCOPE` — create `company_id=main` → list includes period → GET eligibility **200** → POST enroll **not 404** (400 `HRM-PAY-ENROLL-EMPTY` acceptable under U65).
2. **FE-04 regressions hold:** month Select iframe portal · auto detail after create · enroll body without `company_id`.
3. **Browser L2.5 (payroll batches):** login → Tiền lương → Tính lương → Lập bảng lương → Thêm NV → eligibility badges + enroll POST captured.
4. **ATT-412:** POST `/process` → **412** `HRM-PAY-ATT-412` via API probe (attendance gate reachable — not 404).
5. **BE jest:** scope parity suite **66/66 PASS** (BE-03).

**Conditions (explicit NON-CERTIFIED):**

- **NOT** `payroll_e2e_ready=true` — requires attendance close from FE + enroll 2xx + F5 + browser Khóa/412 path.
- **NOT** AC-PAY-HIRE-04/05 full chain — **WAIVED-U65** (`R-PAY-HIRE-NO-ELIGIBLE-U65`: 53/53 NV `NO_CLOSED_SHEET`).
- **NOT** payroll module UAT-ready or Phase 1 DONE.
- **P1 OPEN:** `R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH` — FE-05 in flight (8 enabled checkboxes vs BE 0 eligible).
- **P2 OPEN:** `R-PAY-HIRE-ATT-412-BROWSER` — Khóa button not visible on empty draft detail; API-only proof.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Dev-BE BE-03 | `po-hrm-e2e-link-pay-hire-be-03.md` | READY_FOR_QA | **ACCEPT** — scope parity create/list/eligibility/enroll/process; jest 66/66 |
| Dev-FE FE-04 | `po-hrm-e2e-link-pay-hire-fe-04.md` | READY_FOR_QA | **ACCEPT** — iframe Select · enroll whitelist · auto detail |
| QA browser QA-05 | `po-hrm-e2e-link-pay-hire-qa-05.md` | PASS_TO_PM | **ACCEPT** product counts · browser path · machine JSON |
| PM parallel | FE-05 DISPATCHED | in flight | **ACK** — ELIG-UI fail-closed fix expected before enroll UX seal |

### Machine JSON (QA spot)

| Signal | Value | QC |
|--------|-------|-----|
| `l0.hrm/xbos/portal` | 200 | **PASS** |
| POST periods | 201 `HRM-PAY-201` | **PASS** |
| GET eligibility | 200 `HRM-PAY-200` | **PASS** |
| POST enroll | 400 `HRM-PAY-ENROLL-EMPTY` | **PASS** (U65 business code — not 404) |
| `enrollBodies[].hasCompanyId` | false | **PASS** |
| `honesty.payroll_e2e_ready` | false | **PASS** honesty |
| Period id | `dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8` · persist `holding` | **PASS** scope parity |

---

## Gate AC audit (PM checklist)

| # | AC / Check | Runtime / evidence | QC |
|---|------------|-------------------|-----|
| 1 | Create draft → list includes new period | POST **201** · list `company_id=main` includes period | 🟢 **PASS** |
| 2 | GET eligibility same period → NOT 404 | GET **200** · 0 eligible / 53 ineligible · `NO_CLOSED_SHEET` | 🟢 **PASS** |
| 3 | POST enroll → NOT 404 | POST **400** `HRM-PAY-ENROLL-EMPTY` (U65 OK) | 🟢 **PASS** |
| 4 | AC-PAY-HIRE-04 enroll 2xx → list updates | 0 eligible — **WAIVED-U65** | 🟡 **WAIVED** |
| 5 | AC-PAY-HIRE-05 F5 persistence | **NOT RUN** — blocked by AC-04 | 🟡 **NOT PROMOTED** |
| 6 | Eligibility UI badges `NO_CLOSED_SHEET` | 53 disabled + reason badges | 🟢 **PASS** |
| 7 | HRM-PAY-ATT-412 process without closed sheet | API POST `/process` → **412** | 🟢 **PASS** (API) · 🟡 browser P2 |
| 8 | FE-04 month Select + auto detail + enroll body | QA-05 regression rows PASS | 🟢 **PASS** |
| 9 | U65 zero-seed | no seed in flow | 🟢 **PASS** |
| 10 | `payroll_e2e_ready=true` forbidden | absent in QA/FE/BE | 🟢 **PASS** honesty |

**Score:** 7/7 in-scope linkage AC **PASS** · 2 AC **WAIVED/NOT PROMOTED** · 2 residuals **CONDITION**.

---

## L2.5 J-* audit (U19 — hire-to-pay slice)

| Journey / UF | Scope vs this seal | QC |
|--------------|-------------------|-----|
| **UF-HRM-06** / **J-HRM-07** hire-to-pay linkage | Create batch → list/detail → Thêm NV → eligibility 200 → enroll not 404 → ATT-412 API | **PASS** (**linkage slice only**) |
| **J-HRM-07** payslip list→detail (prior W5B) | Prior ✅ host journey | **untouched** · prior GWC retained |
| **J-HRM-06c** attendance sheet close/sign | Prerequisite for eligible NV | **UNTESTED** · blocks full enroll chain |
| Enroll 2xx → F5 → Khóa browser | Out of U65 without attendance close | **deferred** |

Mandatory for this gate: payroll batches cross-nav + scope parity + ATT-412 API. **Not** invent PASS on full hire-to-pay module UAT or matrix 🟢 promotion beyond linkage slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Scope parity P0 CLOSED; create/eligibility/enroll resolve under `main`; FE-04 regressions; ATT-412 API 412; eligibility badges render |
| **PRODUCT (OPEN)** | `R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH` P1 — 8 enabled vs 0 eligible (FE-05); `R-PAY-HIRE-ATT-412-BROWSER` P2 |
| **PROCESS** | QA seat `verify:qc:evidence-pack` **FAIL 2/8** (`ack_status` table format + `command_table`) — **OBS only**; this QC pack consolidates J-* + AC matrix |
| **ENV** | L0 PASS (QA + QC spot `qc:dev-stack` HRM/XBOS **200**); stale :28001 EADDRINUSE resolved by QA restart — **not blocking** |
| **OUT-OF-SCOPE / WAIVED** | `R-PAY-HIRE-NO-ELIGIBLE-U65` — cross-module attendance close under U65; AC-04/05 full chain; `payroll_e2e_ready`; Phase 1 DONE |

ENV does not drive NO-GO. U65 waiver for AC-04/05 is **documented and ACCEPT** for this slice — not product demote.

---

## Residual

| Id | Status | Sev | Owner | Blocks linkage GWC? |
|----|--------|-----|-------|---------------------|
| `R-PAY-HIRE-PERIOD-404-SCOPE` | **CLOSED** (BE-03 + QA-05) | — | — | No |
| `R-PAY-HIRE-NO-ELIGIBLE-U65` | **WAIVED-U65** | P1 cross-module | pm / attendance lane | **No** for slice — blocks `payroll_e2e_ready` |
| `R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH` | **OPEN** | P1 | **dev-fe** (`PO-HRM-E2E-LINK-PAY-HIRE-FE-05` in flight) | **Condition** — fail-closed disable all ineligible |
| `R-PAY-HIRE-ATT-412-BROWSER` | **OPEN** | P2 | dev-fe / qa | **No** — API proven; browser Khóa after enroll unblocked |
| AC-PAY-HIRE-04/05 full browser | **NOT PROMOTED** | — | qa after attendance close | **No** for this GWC |
| `payroll_e2e_ready=true` | **Denied** | — | — | N/A — honesty lock |
| QA pack format (`ack_status:` + command table) | OPEN process | P3 | qa next seat | **No** — OBS |

**No product P0 FAIL** on hire-to-pay linkage scope parity seat → **GWC idle-ok** for narrow lane. Full module seal remains blocked until attendance close + enroll 2xx + FE-05 + ATT-412 browser.

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
| UF-HRM-06 matrix 🟢 re-stamp as «hire-to-pay complete» | Linkage slice only — prior 🟢 payslip shell unchanged |

---

## Gate commands (QC)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-05.md
→ FAIL process 2/8 · ack_status table format + command_table — PROCESS OBS only

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-pay-hire-qc-01.md
→ PASS 8/8 (sealed 2026-08-06)

pnpm run qc:dev-stack
→ PASS · hrm-api 200 · xbos-api 200 · portal optional 200
```

| Check | Result |
|-------|--------|
| `verify:qc:evidence-pack` QA seat | **FAIL process** 2/8 — OBS |
| `verify:qc:evidence-pack` QC pack | **PASS** 8/8 |
| Browser path + machine JSON | ✅ |
| `payroll_e2e_ready` claim | ❌ absent — ACCEPT |
| BE jest 66/66 | ✅ cited BE-03 |

---

## completion_report

- **Closed:** GWC for UF-HRM-06 / J-HRM-07 **hire-to-pay linkage slice** — BE-03 scope parity P0 CLOSED; QA-05 browser PASS create→eligibility→enroll (not 404); FE-04 regressions hold; ATT-412 API 412; U65 waivers documented; `payroll_e2e_ready=false` stamped.
- **Open / conditions:** `R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH` (FE-05 in flight); `R-PAY-HIRE-ATT-412-BROWSER` P2; full AC-04/05 chain deferred until attendance close from FE; QA pack format P3 OBS.
- **NOT claimed:** payroll module UAT · `payroll_e2e_ready=true` · Phase 1 DONE · product GO.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QC-01 → INTAKE
role: pm
ack: PASS_TO_PM
verdict: GO WITH CONDITIONS — UF-HRM-06 hire-to-pay linkage slice ONLY
evidence: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qc-01.md
facts:
  - P0 R-PAY-HIRE-PERIOD-404-SCOPE CLOSED · eligibility 200 · enroll not 404 · ATT-412 API 412
  - payroll_e2e_ready=false · AC-04/05 WAIVED-U65 · NOT module UAT
  - FE-05 in flight for R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH (fail-closed checkboxes)
  - full enroll→F5→Khóa browser blocked until J-HRM-06c attendance close path (cross-module)
cấm: promote payroll_e2e_ready=true without attendance-close FE evidence
next_wave (priority):
  1) await PO-HRM-E2E-LINK-PAY-HIRE-FE-05 READY_FOR_QA → QA retest ELIG-UI mismatch
  2) parallel: attendance close/sign program (J-HRM-06c) to unblock eligible NV under U65
  3) optional P3: QA add ack_status: PASS_TO_PM + command table on next pay-hire seat pack
```

## ack_status

**PASS_TO_PM**
