# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-QA-01 (R2 retest)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-QA-01` |
| **round** | **R2** (supersedes R1 `FAIL_TO_PM`) |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed · browser UF · no seed scripts |
| **Honesty** | `payroll_e2e_ready=false` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **stamp** | `PAYCATQA-R2-MSILIVE` |
| **entry** | BE-02 READY · `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-be-02.md` |

---

## 0. Supersede note (R1 → R2)

| R1 defect | R2 status |
|-----------|-----------|
| **D-PAY-CAT-QA-01** stale `:28001` (no `formula_sot` / GET-by-id 404) | **CLOSED** — live list+GET `formula_sot=deprecated` · GET-by-id **200** |
| **D-PAY-CAT-QA-02** build FAIL | **CLOSED** (BE-02) |
| **D-PAY-CAT-QA-03** `pay_types` empty | **CLOSED** — `pay_types/items` **total=7** (bootstrap + catalog) |
| **D-PAY-CAT-QA-04** UF create blocked | **CLOSED** — browser POST **201** `CUSTOM_TP_09` → F5 → DELETE |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `hrm-api` `:28001` | **200** |
| L0 portal `:5173` | **200** (`pnpm run dev:web-only` during session) |
| Git commit | `dc930c5` |
| Browser runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-pay-catalog-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-pay-catalog-qa-01.json` |
| Screenshots | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-pay-catalog-qa-01/` (`01`…`06`) |

---

## 2. UF browser — Lương → Thành phần lương → CUSTOM_TP_09

**HDSD path:** `/hr/payroll` → tab **Thành phần lương** → **+ Thêm mới** → code `CUSTOM_TP_09` + pay_type `luong` → Lưu/Thêm → F5 → Xóa

| Step | Expected | Actual | Verdict |
|------|----------|--------|---------|
| Payroll tab load | No ERROR banner | No banner | 🟢 L2-PAYROLL-LOAD |
| Open Thành phần lương | Tab active | Opened | 🟢 |
| Add dialog | Code + pay_types picker | Free-text code filled; empty-catalog banner **not** shown | 🟢 |
| POST `salary-components` | **2xx** | **201** `CUSTOM_TP_09` · `formula_sot=deprecated` | 🟢 UF-MUTATE-POST-2XX |
| FE row after 2xx | Row visible | Network GET list refreshed | 🟢 |
| F5 persist | Row still visible | `CUSTOM_TP_09` in table | 🟢 UF-F5-PERSIST |
| DELETE soft-archive | Row hidden from default list | DELETE **200**; row gone | 🟢 UF-DELETE-HIDE |
| `include_archived=true` | Archived row visible `is_active=false` | Found archived row | 🟢 API-INCLUDE-ARCHIVED |
| Console | No Uncaught | Clean | 🟢 CONSOLE-GATE |

**POST body (browser Network):** `component_type=luong`, `code=CUSTOM_TP_09`, `company_id=main`.

**Screens:** `03-add-dialog.png` · `04-after-save.png` · `05-f5-persist.png` · `06-after-delete.png`.

---

## 3. API contract probes (supplementary to UF)

| AC / check | Expected | Actual | Verdict |
|------------|----------|--------|---------|
| `pay_types/items` | total ≥ 1 | **200** · **total=7** | 🟢 |
| GET list | 200 + `formula_sot=deprecated` | **200** · 11 rows · all `deprecated` | 🟢 |
| list id → GET by id | 200 same id | id `13b7668b-…` → **200** · `formula_sot=deprecated` | 🟢 |
| `GET /payroll/pay-formulas` | **404** | **404** | 🟢 |
| `GET /payroll/formulas` | **200** | **200** | 🟢 |
| Bind draft formula FK | **422** `HRM-PAY-COMP-FORMULA-412` | draft id from `/formulas` list → POST component **422** `HRM-PAY-COMP-FORMULA-412` | 🟢 |

**Route honesty:** formula SoT path is **`/api/hrm/payroll/formulas`** — not `pay-formulas`.

---

## 4. Defect register (R2)

| ID | Status |
|----|--------|
| D-PAY-CAT-QA-01..04 | **CLOSED** |

No new P0/P1 opened this round.

---

## 5. Residual / not promoted

- `payroll_e2e_ready` remains **false** (honesty lock — DENIED flip)
- Module UAT / J-HRM-07 / formula LIVE / Phase1 DONE — **not promoted**
- Slice PASS ≠ payroll end-to-end process UAT

---

## 6. completion_report

**Closed:** R2 retest after BE-02 — all exit_criteria PASS: browser UF create `CUSTOM_TP_09` → 201 → F5 → soft DELETE → `include_archived`; live `formula_sot=deprecated` + GET-by-id scope parity; draft formula bind **422** via `/payroll/formulas`; `pay_types` ≥1; `pay-formulas` 404.

**Residual:** honesty `payroll_e2e_ready=false` only (no technical residual for this slice).

---

## 7. Handoff

- **next_owner:** `pm` → dispatch **qc** gate for PAY-CATALOG platform slice (narrow GWC; retain honesty)
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-qa-01.md`
- **machine:** `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-pay-catalog-qa-01.json`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
priority: P0

entry_criteria:
- QA R2 PASS_TO_PM: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-qa-01.md
- machine JSON: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-pay-catalog-qa-01.json
- BE-02: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-be-02.md

exit_criteria:
- Audit UF CUSTOM_TP_09 create→F5→DELETE + formula_sot + GET-by-id + draft FK 422 via /payroll/formulas
- Confirm D-PAY-CAT-QA-01..04 CLOSED; no P0 residual
- Retain C-SLICE-≠-MODULE · payroll_e2e_ready=false · DENY module UAT / J-HRM-07 flip
- evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-qc-01.md
- ack_status GO | GO WITH CONDITIONS | NO-GO

honesty: payroll_e2e_ready=false
cấm: seed · claim payroll e2e DONE · flip ready
```
