# Evidence — `PO-HRM-AMIS-PARITY-PAY-ESS-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-ESS-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution — browser ESS payslip confirm UI → L1 me/payslips* |
| **date** | 2026-08-07 |
| **priority** | P2 |
| **parent** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-ESS-QC-01` L1 **GWC** |
| **closes** | FE residual **ESS payslip confirm UI** after Step6 L1 — **not** AMIS DONE / module UAT / J-HRM-07 |
| **ack_status** | **`READY_FOR_QA`** |
| **qc_ref** | [`po-hrm-amis-parity-pay-ess-qc-01.md`](po-hrm-amis-parity-pay-ess-qc-01.md) GWC |
| **be_ref** | [`po-hrm-amis-parity-pay-ess-be-01.md`](po-hrm-amis-parity-pay-ess-be-01.md) |
| **spec_ref** | API_DESIGN **F-PAY-PAYSLIP-01** · SRS **FR-UC-BP-PAY-08** · AMIS Step6 GĐ1 |
| **portal_url** | HRM embed `/hr/payroll` (portal `:5173` / `:5175` / `:8088` per env) |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** flip — FE ESS ≠ module UAT |
| **AMIS Step6 DONE** | **DENIED** | Slice FE bind only |
| **J-HRM-07 DONE** | **DENIED** | Not claimed |
| **Seed** | **DENIED** | U65 zero-seed |
| **FE formula invent** | **DENIED** | Display-ready amounts from BE |

---

## Mission closed

Wire HRM Payroll top tab **Phiếu của tôi** to sealed L1 ESS APIs:

| METHOD | Path | FE |
|--------|------|-----|
| GET | `/api/hrm/payroll/me/payslips` | List own rows |
| GET | `/api/hrm/payroll/me/payslips/:id` | Detail + `ess_confirmed` + lines/components |
| POST | `/api/hrm/payroll/me/payslips/:id/confirm` | Confirm CTA → 2xx `HRM-PAY-204-ESS` (Nest may **201** OBS) |

L1 API spine **SEALED** — no BE rewrite.

---

## Files changed

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/essPayslipUi.ts` | NEW — confirm gate + money/stamp display helpers |
| `apps/web/hrm/src/lib/essPayslipUi.test.ts` | NEW — 4 vitest |
| `apps/web/hrm/src/hooks/useMyEssPayslips.ts` | NEW — list / get / confirm |
| `apps/web/hrm/src/components/payroll/EssPayslipsPanel.tsx` | NEW — list → detail → Xác nhận phiếu |
| `apps/web/hrm/src/integrations/hrmApi.ts` | ADD `listMyPayslips` · `getMyPayslipById` · `confirmMyPayslip` + types |
| `apps/web/hrm/src/pages/Payroll.tsx` | ADD top tab `ess` (`hdsd-pay-ess-tab`) |
| `apps/web/hrm/src/lib/apiError.ts` | ADD `HRM-PAY-403-ESS` · `HRM-PAY-409-ESS` |
| `apps/web/hrm/src/i18n/locales/vi.json` | ESS copy |
| `apps/web/hrm/src/i18n/locales/en.json` | ESS copy |

### must_keep verified

- Own-only / CEO without `employee_id` → banner + **403** `HRM-PAY-403-ESS` (no invent list)
- F5 after confirm — list/detail rebind `ess_confirmed` + `employee_confirmed_at`
- No FE net/gross formula — `formatEssMoney` display-only
- Admin payslip tab (`PayrollPayslipsApiTab` /reports) unchanged
- `payroll_e2e_ready=false`

---

## Click path (HDSD-aligned · U65)

**Persona (happy):** `uat.nv0001@xe.vn` / `xevn-uat-2026` (mobile login / employee-bound JWT with `employee_id`)  
**URL:** portal → HRM embed → **Tiền lương** → top tab **Phiếu của tôi** (`hdsd-pay-ess-tab`)

| Step | UI | Expect Network / FE |
|------|-----|---------------------|
| 1 | Tab **Phiếu của tôi** | **GET** `…/payroll/me/payslips?company_id=…` → **200** `HRM-PAY-200` · own rows only |
| 2 | Click mắt / open (`hdsd-pay-ess-open-{id}`) | **GET** `…/me/payslips/{id}` → **200** · `ess_confirmed` present |
| 3 | If pending: click **Xác nhận phiếu** (`hdsd-pay-ess-confirm`) | **POST** `…/me/payslips/{id}/confirm` → **2xx** `HRM-PAY-204-ESS` (may be **201** Nest OBS) |
| 4 | FE sau 2xx | Toast success · badge **Đã xác nhận** · `employee_confirmed_at` set |
| 5 | **F5** → tab Phiếu của tôi → open same id | Still `ess_confirmed=true` · confirm CTA hidden |
| 6 | (Gate) Login `ceo@xe.vn` → same tab | **GET** me/payslips → **403** `HRM-PAY-403-ESS` · honest banner (no fake rows) |

### Preconditions / honesty for QA

- Need ≥1 **processed** (or paid) payslip owned by `uat.nv0001` already on env (U65: **no seed**). If list empty → **BLOCKED** env / create via FE process path first — still no seed.
- Confirm CTA only when status `processed`\|`paid` and not yet confirmed; draft → no CTA (BE would 409).
- Empty lines array = OBS OK (not AC fail) — confirm still allowed when status ready.

### Network contract notes

| Call | Scope | Body |
|------|-------|------|
| List / Get | Query `company_id` | — |
| Confirm | Query `company_id` | `{}` (empty JSON) |

---

## Unit evidence

```text
pnpm exec vitest run src/lib/essPayslipUi.test.ts
→ Test Files: 1 passed · Tests: 4 passed
```

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| Browser UF ESS confirm U65 | P2 | `qa` | **OPEN** | This handoff |
| Native mobile ESS rebind (`dev-mobile`) | P2 | backlog | **OUT** | Web panel closed this seat; mobile still uses admin list API |
| `OBS-NEST-POST-201` | P3 | optional BE | **CONDITION OK** | FE accepts 2xx |
| `payroll_e2e_ready` | honesty | `pm` | **LOCKED false** | |
| AMIS DONE / J-HRM-07 / module UAT | — | — | **DENIED** | |

---

## completion_report

### Closed

1. FE ESS payslip list / detail / confirm wired to L1 `me/payslips*` (SEAL).  
2. Payroll tab **Phiếu của tôi** + HDSD testids for QA.  
3. Honesty: `payroll_e2e_ready=false` · no seed · no FE formula · CEO 403 messaging.  
4. Vitest **4/4 PASS** on display helpers.

### Residual

- QA U65 browser with `uat.nv0001` + CEO 403 gate.  
- Mobile native ESS path still OUT (optional later `dev-mobile`).

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-ess-fe-01.md` |
| **ack_status** | **`READY_FOR_QA`** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-ESS-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P2
parent: PO-HRM-CONTINUOUS-W7-20260807
prior: PO-HRM-AMIS-PARITY-PAY-ESS-FE-01 READY_FOR_QA

## Mission
U65 browser-only ESS payslip confirm (zero-seed · no API-only PASS):

Persona happy: uat.nv0001@xe.vn / xevn-uat-2026 (employee JWT)
URL: portal → HRM → Tiền lương → tab Phiếu của tôi (hdsd-pay-ess-tab)

AC1 GET me/payslips 200 own-only · list shows rows
AC2 open detail GET me/payslips/:id 200 · ess_confirmed present
AC3 POST confirm (hdsd-pay-ess-confirm) 2xx HRM-PAY-204-ESS · FE badge Đã xác nhận
AC4 F5 → still confirmed · CTA hidden
AC5 ceo@xe.vn same tab → GET 403 HRM-PAY-403-ESS · honest banner (no invent rows)

entry_criteria: FE evidence READY; L0 stack; U65; payroll_e2e_ready=false
exit_criteria: evidence MD + click path; ack PASS_TO_PM or FAIL_TO_PM
cấm: seed · flip payroll_e2e_ready · claim AMIS DONE / J-HRM-07 / module UAT
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-02.md
```
