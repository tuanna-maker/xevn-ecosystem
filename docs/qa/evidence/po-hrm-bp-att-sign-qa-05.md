# Evidence — PO-HRM-BP-ATT-SIGN-QA-05

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QA-05` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | execution · UF-HRM-ATT-SIGN · J-HRM-06c · post `PO-HRM-BP-ATT-SIGN-BE-CLOSE-SCHEMA-01` |
| **prior** | `po-hrm-bp-att-sign-be-close-schema-01.md` READY_FOR_QA · `po-hrm-bp-att-sign-qa-04.md` PASS_WITH_OBS |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | L0 **PASS** · **POST close 201** (not 500) 🟢 · FE **Đã chốt** + F5 **`closed`** 🟢 · sign ladder 🟢 · **Gửi chờ ký** FE **not run** (no draft) |
| **u65_zero_seed** | true — no `pnpm seed:*` |
| **attendance_closed** | **false** (product GO not claimed) |
| **product_go** | **false** |
| **remaster_program_done** | **false** |
| **hdsd_align** | HRM embed → **Chấm công** → **Bảng chấm công** → kỳ → panel ký → **Chốt** |
| **runtime_commit** | `dc930c5` |

---

## L0 — stack / FE↔BE

| Check | Result | Notes |
|-------|--------|--------|
| `pnpm run qc:dev-stack` | **PASS (checks)** | hrm-api :28001 · xbos-api :28002 · portal :5173 **HTTP 200** |
| Node exit on Windows | **OBS-L0-UV-EXIT** | exit **3221226505** after summary (unchanged) |
| `pnpm run qc:fe-be-health` | **PASS** | exit **0** · login · employees · catalog-sync · proxy |

Seed: **none**

---

## U65 browser — sign ladder + close + F5

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`  
**Repro:** `node scripts/qa/_tmp-po-hrm-bp-att-sign-qa-05.mjs`  
**Target sheet:** `3934591a-50ec-452b-940f-7f29ede50272` (avoid closed `642a4713-…`)

### Data state (API list, no seed)

| id | status (before run) | status (after run) |
|----|---------------------|-------------------|
| `3934591a-50ec-452b-940f-7f29ede50272` | submitted | **closed** |
| `642a4713-b0ee-4802-a1d9-2fe650cbc17f` | closed (prior BE smoke) | closed |

### Click path (executed)

| Step | Result |
|------|--------|
| S0 Login + **Chấm công** → **Bảng chấm công** | 🟢 `att-sheets-precision` · `GET …/attendance-sheets?company_id=main` **200** |
| S1 Open row `3934591a-…` (submitted) | 🟢 **`att-sign-panel`** visible |
| S2 **Gửi chờ ký** (`att-sheet-submit`) | 🟡 **skipped** — `submitBtnVisible=false` (no draft row) |
| S3 Sign ladder NV→QL→HCNS | 🟢 **3×** `POST …/signatures` **201** · `att-sign-confirm-employee` · `direct_manager` · `hr_admin` |
| S4 **Chốt** (`att-sign-close-sheet`) | 🟢 **`POST …/close` → 201** · `canCloseHint=true` |
| S5 F5 + reopen row | 🟢 badge **`Đã chốt`** · `apiSheetStatusClosed=closed` |

**Console:** `pageErrors=[]`

### Network highlights (proxy :5173)

| Call | HTTP |
|------|------|
| `GET …/attendance-sheets?company_id=main` | **200** |
| `GET …/3934591a-…/signatures?company_id=main` | **200** |
| `POST …/3934591a-…/signatures?company_id=main` | **201** (×3) |
| `POST …/3934591a-…/close?company_id=main` | **201** (not **500**) |

### FE post-mutation (close)

- **Close (S4):** after POST **201**, panel refreshed via GET signatures **200**.
- **FE after 2xx:** `data-testid=att-sign-sheet-status-badge` text **`Đã chốt`**.
- **F5 (S5):** reopen same row → badge persists · API GET sheet **`status=closed`**.

---

## AC-ATT-SIGN-UF-01..07

| AC-ID | Verdict | Evidence |
|-------|---------|----------|
| **UF-01** | 🟢 | List/detail · **submitted** sheet opens **`att-sign-panel`** · GET signatures **200** |
| **UF-02** | 🟢 | NV POST **201** · `att-sign-confirm-employee` |
| **UF-03** | 🟢 | QL POST **201** · `att-sign-confirm-direct_manager` |
| **UF-04** | 🟢 | HCNS POST **201** · `canCloseHint=true` · `can_close=true` |
| **UF-05** | 🟢 | Close click → **201** · **Đã chốt** (schema fix verified) |
| **UF-06** | 🟢 | F5 **`closed`** persists (badge + API) |
| **UF-07** | 🟡 | Happy path only — «chốt thiếu NV» negative **not run** (ladder completed) |

### J-HRM-06c

| Step | Verdict |
|------|---------|
| List → detail (L2.5) | 🟢 |
| Submit → sign → close → F5 | 🟢 **close leg promoted** · FE **Gửi chờ ký** not re-clicked (no draft) |

**not promoted:** Attendance **CLOSED** product flag · **product GO** · **remaster DONE** · QC full UF browser GO (dispatch QC next)

---

## Residual / OBS

| ID | Owner | Priority | Notes |
|----|-------|----------|--------|
| **OBS-NO-DRAFT-FE-SUBMIT** | qa / pm | P1 | Both pilot sheets **submitted/closed**; retest **att-sheet-submit** FE click needs new draft via SRS UF-HRM-16 FE chain |
| **OBS-UF-07-NEGATIVE** | qa | P2 | Block close before NV step not executed this run |
| **OBS-L0-UV-EXIT** | devops | P2 | Windows node abort after `qc:dev-stack` |
| **OBS-BOTH-SHEETS-CLOSED** | pm | P2 | Env has no **submitted** sheet left for repeat close without reopen/new period |

---

## Artifacts

| Type | Path |
|------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-05-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-05/` (`01`–`05`) |
| Probe script | `scripts/qa/_tmp-po-hrm-bp-att-sign-qa-05.mjs` |
| UF map | `docs/qa/evidence/po-hrm-bp-att-sign-uf-ba-01.md` |

---

## completion_report

**Closed:** P0 **POST close 500** regression from QA-04 — browser **Chốt** on `3934591a-…` returns **201**, FE shows **Đã chốt**, F5 persists **`closed`**. Full **NV→QL→HCNS** ladder on U65 path. L0 fe-be-health **PASS**.

**Open:** Optional FE **Gửi chờ ký** when draft exists; UF-07 negative; QC gate for full UF GO/GWC.

---

## next_owner

**pm** → **qc** (full UF AC-ATT-SIGN-UF-01..07 browser audit; waive or schedule UF-07 negative + draft submit OBS)

## next_dispatch_prompt

```text
ROLE: qc · work_item_id: PO-HRM-BP-ATT-SIGN-QC-01 (or program QC slice)
from_role: pm
priority: P1
INTAKE: QA PO-HRM-BP-ATT-SIGN-QA-05 PASS_TO_PM — close 201 + F5 closed on 3934591a; UF-05/06 green; J-HRM-06c green; OBS draft submit + UF-07 negative.
read_first: docs/qa/evidence/po-hrm-bp-att-sign-qa-05.md · po-hrm-bp-att-sign-uf-ba-01.md
entry_criteria: qc:dev-stack + fe-be-health PASS; evidence paths exist
exit_criteria: GO or GWC with explicit UF-07 / draft-submit waiver or follow-up qa item; cấm claim Attendance CLOSED product / remaster DONE
u65_zero_seed: true
```

---

*End evidence PO-HRM-BP-ATT-SIGN-QA-05 · ack_status: **PASS_TO_PM***
