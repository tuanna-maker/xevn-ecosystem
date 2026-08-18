# Evidence — PO-HRM-AMIS-PARITY-PAY-SRC-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-SRC-QA-01` |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-SRC-BE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — browser UF (U65) + post-process GET verify |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · scope `holding` (+ `main` for Settings mẫu) |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **stamp** | `PAYSRCQA1-IRGZO8` (primary browser) · `PAYSRCSUP-*` (supplement) |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-src-qa-01.mjs` |
| **machine JSON** | [`_tmp-po-hrm-amis-parity-pay-src-qa-01.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-src-qa-01.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-src-qa-01/` |
| **verdict** | **FAIL** — P0 SRC process path blocked on live stack |
| **ack_status** | **`FAIL_TO_PM`** |
| **honesty** | **`payroll_e2e_ready=false`** · **DENIED** AMIS parity DONE |

### Honesty locks

| Flag | Value |
|------|--------|
| **`payroll_e2e_ready`** | **`false`** |
| **Seed** | **DENIED** (U65) — product-path C&B POST only when package absent |
| **API-only UF** | **DENIED** as sole claim — browser template UF proven; process blocked before payslip lines |
| **J-HRM-07 e2e** | **NOT claimed** |

---

## 1. L0 / health

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM **200** after `pnpm run dev:hrm-api` restart (was down mid-run) |
| Portal / XBOS | **200** |
| Seed | **none** |

---

## 2. HDSD / click path (browser UF)

| Step | Path | Network |
|------|------|---------|
| Settings mẫu | `/hr/settings` → `settings-tab-pay-sheet-tpl` → create `qa_src_*` | **POST** `/pay-sheet-templates` → **201** `HRM-PAY-TPL-201` |
| Lines OV-C | API PUT `/pay-sheet-templates/{id}/lines` (overlay blocked save-lines click) | **200** `HRM-PAY-TPL-200` |
| Tạo kỳ | `/hr/payroll` → Tính lương → Lập bảng (API fallback when FE submit no POST) | overlap **409** on holding July |

---

## 3. AC matrix

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-PAY-TPL-03** | 🟢 **PASS** | Browser create mẫu + bind `LUONG_CO_BAN` line · templateId `500f43df-…` / `1e061719-…` · linesOk |
| **AC-PAY-TPL-04** | 🟡 **BLOCKED** | Preview **412** `HRM-PAY-FORMULA-412-PREVIEW-STUB` — ATT var bag incomplete even with `base_salary` override; override formula `55fe7efb-…` not previewable on stack |
| **AC-PAY-SRC-01** | 🔴 **FAIL** | NV002 / HLD-0001: **active C&B** `9500000` (`084a6c66-…`) · enroll **201** · process **412** `HRM-PAY-FORMULA-412` *«No SRC amount for component BASE»* — **emp_cb not applied** (defect) |
| **AC-PAY-SRC-02** | ⬜ **NOT RUN** | Blocked by SRC-01/process failure · template OV-C FK set on mẫu |
| **AC-PAY-SRC-03** | ⬜ **DEFER** | Period input pack HTTP CRUD out of scope this wave (depth doc P0-or-P1) |
| **AC-PAY-SRC-04** | 🟢 **PASS** | **POST** process period `2035-06` (no closed sheet) → **412** `HRM-PAY-ATT-412` · supplement `2035-08` → **412** `HRM-PAY-ATT-412` |
| **AC-PAY-SRC-05** | 🟢 **PASS** | Process without resolvable SRC → **412** `HRM-PAY-FORMULA-412` VI · **not** silent 0₫ (draft payslip gross=0 but explicit deny) |
| **AC-PAY-SRC-06** / **AC-PAY-RUN-06** | 🔴 **FAIL** | No **processed** payslip with **≥1 line** + `source_tier` after SRC process on stack |
| **AC-PAY-SRC-GET-TIER** | 🔴 **FAIL** | Existing processed slip `8ca0679c-…` lines have `source_ref` only — **no** `source_tier` (pre-SRC process) · fresh process did not produce lines |

### L2.5

| Journey | Status |
|---------|--------|
| Settings mẫu → kỳ bind | 🟡 partial (mẫu OK · kỳ overlap holding) |
| **J-HRM-07** process → phiếu + dòng | 🔴 **FAIL** — blocked at FORMULA-412 despite C&B |

---

## 4. UF blocks (representative)

### AC-PAY-SRC-04 — ATT-412

- **Action:** Create period `2035-06-01..30` → **POST** `/periods/{id}/process`
- **Network:** **412** `HRM-PAY-ATT-412` · *Attendance sheet must be closed before processing payroll*
- **Verdict:** 🟢 **PASS**

### AC-PAY-SRC-05 — FORMULA-412 (not silent 0)

- **Action:** Enroll NV on draft kỳ `d92d3bbb-…` (no template snapshot / no SRC tier) → process
- **Network:** **412** `HRM-PAY-FORMULA-412` · *No SRC amount for component BASE — refuse silent zero (BR-AMIS-PAY-SRC-05)*
- **FE:** No fake success toast · payslip remains draft gross 0
- **Verdict:** 🟢 **PASS** (explicit deny)

### AC-PAY-SRC-01 — emp_cb expected (FAIL)

- **Trước mutate:** `GET …/compensation-packages/active` → package `084a6c66-…` · base **9_500_000**
- **Action:** enroll **201** → process
- **Expected:** line `source_tier=emp_cb` amount 9.5M
- **Actual:** **412** FORMULA-412 — SRC resolver did not short-circuit emp_cb
- **Verdict:** 🔴 **FAIL** → **dev-be** · tag `scope_parity` / `SRC-02-regression`

---

## 5. Defects

| ID | Sev | Summary | Owner |
|----|-----|---------|-------|
| **D-PAY-SRC-01** | P0 | Active C&B package present but PROCESS returns FORMULA-412 for `BASE`/`LUONG_CO_BAN` — emp_cb tier not winning | **dev-be** |
| **D-PAY-SRC-02** | P1 | July holding kỳ overlap **409** blocks new browser kỳ UF with template bind | **dev-be** / **dev-fe** |
| **D-PAY-SRC-03** | P2 | Settings save-lines click blocked by overlay (`html intercepts pointer`) — PUT API workaround OK | **dev-fe** |
| **D-PAY-SRC-04** | P2 | Formula preview **412-PREVIEW-STUB** blocks AC-PAY-TPL-04 on stack | **dev-be** |

---

## 6. Residual / not promoted

| Item | Note |
|------|------|
| `payroll_e2e_ready` | **LOCKED false** |
| AMIS parity DONE | **DENIED** |
| SRC-03 period input | Deferred per depth doc |
| BE Jest 61/61 | Cited from [`po-hrm-amis-parity-pay-src-be-01.md`](./po-hrm-amis-parity-pay-src-be-01.md) — **not** re-opened L1 |

---

## 7. completion_report

**Closed:** L0 PASS · browser AC-PAY-TPL-03 (Settings mẫu + lines via API) · AC-PAY-SRC-04 ATT-412 · AC-PAY-SRC-05 FORMULA-412 explicit deny · UF console clean.

**Failed:** AC-PAY-SRC-01 emp_cb on live stack · AC-PAY-SRC-06/RUN-06 payslip lines + `source_tier` · AC-PAY-TPL-04 preview · AC-PAY-SRC-GET-TIER on fresh process.

**Residual:** SRC-03 deferred · holding kỳ overlap · PM honesty `payroll_e2e_ready=false`.

---

## 8. next_owner

**dev-be** (P0 D-PAY-SRC-01) → **qa** retest → **qc**

---

## 9. next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-SRC-BE-02
from_role: pm
to_role: dev-be
lane: execution
priority: P0
parent: PO-HRM-AMIS-PARITY-PAY-SRC-BE-01

## entry_criteria
- QA FAIL docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-01.md · D-PAY-SRC-01
- Repro: holding · period d92d3bbb or fresh July draft · NV002 active C&B 9.5M · enroll 201 · process → expect emp_cb not FORMULA-412

## Mission
Fix loadEmployeeFixedAmountForComponent / template snapshot component_code (BASE vs LUONG_CO_BAN) so SRC-02 emp_cb wins on PROCESS.
Regression: pay-src-resolver.spec + payroll.service.spec + live repro enroll→process→GET lines source_tier=emp_cb.

## exit_criteria
- QA rerun PO-HRM-AMIS-PARITY-PAY-SRC-QA-01 AC-PAY-SRC-01/06 PASS
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-src-be-02.md
- ack_status: READY_FOR_QA
- payroll_e2e_ready=false
```

---

## 10. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §7 |
| **next_owner** | **dev-be** |
| **next_dispatch_prompt** | §9 |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-01.md` |
| **ack_status** | **`FAIL_TO_PM`** |
