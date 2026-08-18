# Evidence — PO-HRM-BP-ATT-SIGN-QA-04

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QA-04` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | execution · UF-HRM-ATT-SIGN · J-HRM-06c · post `PO-HRM-BP-ATT-SIGN-BE-RUNTIME-01` |
| **prior** | `po-hrm-bp-att-sign-be-runtime-01.md` READY_FOR_QA · `po-hrm-bp-att-sign-qa-03.md` FAIL (submit **404**) |
| **ack_status** | **PASS_WITH_OBS** |
| **verdict** | L0 **PASS** · submit/sign routes **not 404** 🟢 · browser sign ladder **🟢** · **POST close 500** (schema) · FE **Gửi chờ ký** click **not re-run** (no draft row) |
| **u65_zero_seed** | true — no `pnpm seed:*` |
| **attendance_closed** | **false** |
| **product_go** | **false** |
| **remaster_program_done** | **false** |
| **hdsd_align** | HRM embed → **Chấm công** → **Bảng chấm công** → kỳ → panel ký → chốt |
| **runtime_commit** | `dc930c5` |

---

## L0 — stack / FE↔BE

| Check | Result | Notes |
|-------|--------|--------|
| `pnpm run qc:dev-stack` | **PASS (checks)** | hrm-api :28001 · xbos-api :28002 · portal :5173 **HTTP 200** |
| Node exit on Windows | **OBS-L0-UV-EXIT** | exit **3221226505** / `UV_HANDLE_CLOSING` after summary (same class as QA-03) |
| `pnpm run qc:fe-be-health` | **PASS** | exit **0** · login · employees · catalog-sync · proxy |

Seed: **none**

---

## U65 browser — submit · sign · close

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`  
**Repro:** `node scripts/qa/_tmp-po-hrm-bp-att-sign-qa-04.mjs`  
**Draft hint:** `3934591a-50ec-452b-940f-7f29ede50272` (both list rows **`submitted`** at run time)

### Data state (API list, no seed)

| id | status | name |
|----|--------|------|
| `642a4713-b0ee-4802-a1d9-2fe650cbc17f` | submitted | QA-SHEET-MFD-M2 01/07/2026–31/07/2026 |
| `3934591a-50ec-452b-940f-7f29ede50272` | submitted | QA-SHEET-MFD-M2 01/07/2026-31/07/2026 |

**QA note:** Prior BE smoke (QA-03 / BE-RUNTIME-01) consumed draft → **Gửi chờ ký** (`att-sheet-submit`) **not visible** on either row this run. Submit route regression checked via **proxy/API** (not 404).

### Click path (executed)

| Step | Result |
|------|--------|
| S0 Login + **Chấm công** → **Bảng chấm công** | 🟢 `att-sheets-precision` · `GET …/attendance-sheets?company_id=main` **200** |
| S1 Open row (index 0 — submitted) | 🟢 **`att-sign-panel`** visible · no `att-sign-panel-hold-draft` |
| S2 **Gửi chờ ký** (`att-sheet-submit`) | 🟡 **skipped** — `submitBtnVisible=false` (both sheets already **submitted**) |
| S3 FE panel + signatures | 🟢 `GET …/642a4713-…/signatures` **200** (proxy) |
| S4 F5 + reopen row | 🟢 `att-sign-panel` persists · `apiSheetStatusAfter=submitted` |
| S5 Sign ladder NV→QL→HCNS | 🟢 **3×** `POST …/signatures` **201** · `att-sign-confirm-employee` · `direct_manager` · `hr_admin` |
| S6 **Chốt** (`att-sign-close-sheet`) | 🔴 **`POST …/close` → 500** · UI enabled (`canCloseHint=true`) |
| S7 F5 closed | ⬜ not reached — header still **submitted** |

**Console:** `pageErrors=[]`

### Network highlights (proxy :5173)

| Call | HTTP |
|------|------|
| `GET …/attendance-sheets?company_id=main` | **200** |
| `GET …/642a4713-…/signatures?company_id=main` | **200** |
| `POST …/642a4713-…/signatures?company_id=main` | **201** (×3) |
| `POST …/642a4713-…/close?company_id=main` | **500** |

**No** submit/close **404** in this run (QA-03 P0 regression **closed** on route registration).

### Direct API probe (post-browser, no seed)

| Call | Result |
|------|--------|
| `POST …/642a4713-…/close?company_id=main` | **500** `HRM-SYS-001` — `column "closed_at" of relation "attendance_sheets" does not exist` |
| `GET …/642a4713-…/signatures` | **200** · `can_close=true` · all mandatory steps **approved** |
| `POST …/3934591a-…/submit` · `POST …/642a4713-…/submit` | **201** `HRM-AS-200` · **not 404** |

### FE post-mutation (sign + close)

- **Sign (S5):** after each POST **201**, panel refreshed via GET signatures **200**; three confirm buttons clicked in order.
- **Close (S6):** click **Chốt** → POST close **500** → no **Đã chốt** badge · `apiSheetStatusClosed=submitted`.
- **F5 after close:** not applicable (close failed).

---

## AC-ATT-SIGN-UF-01..07

| AC-ID | Verdict | Evidence |
|-------|---------|----------|
| **UF-01** | 🟢 | List/detail load; **submitted** sheet opens **`att-sign-panel`**; GET signatures **200**; no Sync ERROR / 404 submit-sign |
| **UF-02** | 🟢 | NV step POST **201** · `att-sign-confirm-employee` |
| **UF-03** | 🟢 | QL step POST **201** · `att-sign-confirm-direct_manager` |
| **UF-04** | 🟢 | HCNS POST **201** · `canCloseHint=true` |
| **UF-05** | 🔴 | Close click → **500** (DB column missing) — not **Đã chốt** |
| **UF-06** | 🔴 | F5 **closed** not demonstrated |
| **UF-07** | 🟡 | Close **enabled** after full ladder (expected for happy path); negative «chốt thiếu NV» **not run** (ladder completed) |

### J-HRM-06c

| Step | Verdict |
|------|---------|
| List → detail (L2.5) | 🟢 |
| Submit → sign → close → F5 | 🟡 **partial** — sign 🟢 · close 🔴 · FE **Gửi chờ ký** not re-clicked (no draft) |

**not promoted:** Attendance **CLOSED** · QC full UF browser 🟢 · product GO · remaster DONE

---

## Residual / OBS

| ID | Owner | Priority | Notes |
|----|-------|----------|--------|
| **P0-CLOSE-500-SCHEMA** | dev-be | P0 | `closeAttendanceSheet` UPDATE uses `closed_at` / `closed_by` — column missing on `attendance_sheets` |
| **OBS-NO-DRAFT-FE-SUBMIT** | qa / pm | P1 | Both pilot sheets **submitted**; retest **att-sheet-submit** FE click needs new draft via SRS UF-HRM-16 (FE chain), not seed |
| **OBS-L0-UV-EXIT** | devops | P2 | Windows node abort after `qc:dev-stack` |
| **OBS-LINE-COUNT-MVP** | dev-be | P2 | Unchanged from QA-03 |

---

## Artifacts

| Type | Path |
|------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-04-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-04/` (`01`–`05` partial) |
| Probe script | `scripts/qa/_tmp-po-hrm-bp-att-sign-qa-04.mjs` |

---

## completion_report

**Closed:** QA-04 evidence. L0 fe-be-health **PASS**. **QA-03 submit/sign 404 regression fixed** — proxy GET signatures **200**, POST signatures **201**, submit API **201** (not 404). U65 browser: full **NV→QL→HCNS** ladder on sheet `642a4713-…` with **`att-sign-panel`** + F5 **submitted** persist.

**Open:** **POST close 500** (`closed_at` missing) → UF-05/06 🔴; FE **Gửi chờ ký** click not re-executed (no draft row). QC must **not** full UF GO until close + optional fresh draft submit click.

---

## next_owner

**pm** → **dev-be** (migration / schema `closed_at`, `closed_by` on `attendance_sheets`) → **qa** retest close + draft submit FE when sheet available.

## next_dispatch_prompt

```text
ROLE: dev-be · work_item_id: PO-HRM-BP-ATT-SIGN-BE-CLOSE-SCHEMA-01
from_role: pm
priority: P0
INTAKE: QA PASS_WITH_OBS PO-HRM-BP-ATT-SIGN-QA-04 — POST …/close returns 500 HRM-SYS-001: column "closed_at" of relation "attendance_sheets" does not exist; sign ladder complete can_close=true.
read_first: docs/qa/evidence/po-hrm-bp-att-sign-qa-04.md · attendance-sheet-sign.service.ts closeAttendanceSheet
entry_criteria: reproduce 500 on sheet 642a4713-b0ee-4802-a1d9-2fe650cbc17f ceo@xe.vn
exit_criteria: migration or aligned UPDATE; POST close → 200 closed; jest regression; READY_FOR_QA PO-HRM-BP-ATT-SIGN-QA-05 close+F5
must_keep: U65 · evaluateCanClose · no seed
cấm: claim Attendance CLOSED / product GO

QC: Full UF browser GO only when AC-ATT-SIGN-UF-01..07 green including close F5 — not on QA-04 alone.
```

---

*End evidence PO-HRM-BP-ATT-SIGN-QA-04 · ack_status: **PASS_WITH_OBS***
