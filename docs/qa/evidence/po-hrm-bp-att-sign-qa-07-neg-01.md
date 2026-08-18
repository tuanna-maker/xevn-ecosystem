# Evidence — PO-HRM-BP-ATT-SIGN-QA-07-NEG-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QA-07-NEG-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | L2 negative · **AC-ATT-SIGN-UF-07** · **C-UF-07-NEG** |
| **entry** | [`po-hrm-bp-att-sign-qc-01.md`](po-hrm-bp-att-sign-qc-01.md) GWC · [`po-hrm-bp-att-sign-uf-ba-01.md`](po-hrm-bp-att-sign-uf-ba-01.md) AC-07 |
| **U65** | zero-seed · FE panel + authenticated API (no `pnpm seed:*`) |
| **attendance_closed** | **false** |
| **product_go** | **false** |
| **remaster_program_done** | **false** |
| **runtime_commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | UF-07 🟢 · close blocked FE + **409** BE · sheet stays **submitted** |

---

## Forbidden claims

| Claim | Status |
|-------|--------|
| Attendance CLOSED / product GO / remaster DONE | **NOT claimed** |

---

## 1. Objective

Close **C-UF-07-NEG**: «Chốt thiếu NV / incomplete ladder» → business error (**409** `HRM-ATT-SIGN-INCOMPLETE`), FE must not bypass to **closed**. Do **not** regress QA-05 happy **201** close on complete ladder (not re-run this seat).

---

## 2. Environment prep (documented — not seed)

Pilot had both sheets **closed** after [`po-hrm-bp-att-sign-qa-05.md`](po-hrm-bp-att-sign-qa-05.md) (OBS-BOTH-SHEETS-CLOSED).

| Step | Action | Result |
|------|--------|--------|
| Discover | `GET …/attendance-sheets` · sheet `3934591a-50ec-452b-940f-7f29ede50272` | **closed** |
| Reopen | `POST …/3934591a-…/reopen` (F-ATT-SHEET-03) · reason QA UF-07 | **201** · `status=submitted` |
| After reopen | `GET …/signatures` | `can_close=false` · `missing_mandatory_roles`: employee, direct_manager, hr_admin |

**Note:** Reopen archives prior sign steps (BE) — legitimate SRS mutate, not seed. **No FE «Hủy chốt»** control in build; prep via authenticated POST same persona as portal.

**L0:** `pnpm run qc:fe-be-health` exit **0** (pre-run).

---

## 3. U65 browser execution

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`  
**Sheet:** `3934591a-50ec-452b-940f-7f29ede50272`  
**Repro:** `node scripts/qa/_tmp-po-hrm-bp-att-sign-qa-07-neg-01.mjs`  
**Artifact:** [`_tmp-po-hrm-bp-att-sign-qa-07-neg-01-browser.json`](_tmp-po-hrm-bp-att-sign-qa-07-neg-01-browser.json)  
**Screens:** `docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-07-neg-01/`

### Click path

| Step | Result |
|------|--------|
| Login + **Chấm công** → **Bảng chấm công** | 🟢 `att-sheets-precision` · GET list **200** |
| Open row `3934591a-…` (submitted, incomplete signs) | 🟢 **`att-sign-panel`** · GET signatures **200** |
| Observe ladder | 🟢 NV/QL/HCNS **Chờ xác nhận** · no **Đủ điều kiện chốt** hint |
| **Chốt bảng công** (`att-sign-close-sheet`) | 🟢 **disabled** (`can_close=false`) · force-click → **no** POST `/close` on proxy |
| Business API attempt (same auth as user) | 🟢 POST `/close` → **409** `HRM-ATT-SIGN-INCOMPLETE` · message *Mandatory sign steps incomplete or rejected* |
| After attempt | 🟢 GET sheet **`status=submitted`** (not closed) |

**Console:** `pageErrors=[]`

### Network (proxy :5173)

| Call | HTTP |
|------|------|
| `GET …/attendance-sheets?company_id=main` | **200** |
| `GET …/3934591a-…/signatures?company_id=main` | **200** |
| `POST …/close` via UI | **none** (button disabled — expected) |

---

## 4. AC-ATT-SIGN-UF-07

| AC-ID | Verdict | Evidence |
|-------|---------|----------|
| **UF-07** | 🟢 | FE **`att-sign-close-sheet` disabled** when incomplete · BE **409** on close · sheet **submitted** · not **500** |

**Interpretation (BA AC):** Primary guard = FE must not enable one-click Chốt when thiếu NV (`must_keep` in sign panel). Secondary = BE **409** if client calls close anyway. Toast on disabled click N/A (Playwright force-click did not emit proxy close).

---

## 5. Regression (QA-05 happy path)

| Check | Verdict |
|-------|---------|
| Complete ladder close **201** on same sheet | ⬜ **not re-run** this seat (reopen reset ladder; QA-05 chain still authoritative for UF-05/06) |

---

## 6. Residual / PM dispatch

| ID | Status | Owner |
|----|--------|-------|
| **C-UF-07-NEG** | **CLOSED** on this evidence | — |
| **C-DRAFT-SUBMIT-FE** | Open (unchanged) | qa |
| **OBS-REOPEN-FE** | No UI reopen — prep used API F-ATT-SHEET-03 | pm / dev-fe (optional) |

---

## 7. Handoff

```yaml
completion_report: |
  UF-07 negative executed after documented reopen of closed pilot sheet.
  Incomplete ladder: close button disabled; POST close returns 409 HRM-ATT-SIGN-INCOMPLETE; sheet remains submitted.
next_owner: pm
next_dispatch_prompt: |
  PM intake PASS_TO_PM PO-HRM-BP-ATT-SIGN-QA-07-NEG-01 — close C-UF-07-NEG on QC-01 GWC;
  optional QC re-stamp UF-07; do not claim attendance_closed/product_go.
  Residual C-DRAFT-SUBMIT-FE still P1 for qa.
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-qa-07-neg-01.md
ack_status: PASS_TO_PM
pm_dispatch_hint: PO-HRM-BP-ATT-SIGN-QC-01 — refresh GWC condition C-UF-07-NEG
```
