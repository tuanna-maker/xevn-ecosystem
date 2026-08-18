# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **PAY-CATALOG slice gate** (browser UF + contract probes · not payroll module UAT) |
| **priority** | P0 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **prior** | QA R2 `PASS_TO_PM` · BE-02 `READY_FOR_QA` |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` |
| **Verdict** | **GO WITH CONDITIONS** — PAY-CATALOG UF + formula_sot / GET-by-id / draft FK ACCEPT |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-pay-catalog-qa-01.md`](po-hrm-dynamic-config-platform-pay-catalog-qa-01.md) stamp **`PAYCATQA-R2-MSILIVE`** |
| **be_ref** | [`po-hrm-dynamic-config-platform-pay-catalog-be-02.md`](po-hrm-dynamic-config-platform-pay-catalog-be-02.md) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-pay-catalog-qa-01.json`](_tmp-po-hrm-dynamic-config-platform-pay-catalog-qa-01.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-pay-catalog-qa-01/` (`01`…`06`) |
| **U65** | zero-seed · browser UF · no `pnpm seed:*` · QC observe-only |
| **OS honesty** | `C-SLICE-≠-MODULE` — seat GWC ≠ payroll e2e / module UAT / Phase1 DONE / J-HRM-07 flip |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Module UAT / formula LIVE** | **DENIED** | Catalog UF ≠ process payslip / formula LIVE |
| **J-HRM-07 flip** | **DENIED** | Not retested this seat; historical map PASS retained — **no new GO claim** |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | QA honesty `seed_used=false` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT platform PAY-CATALOG slice after BE-02 + QA R2: browser UF `CUSTOM_TP_09` create → POST **201** → FE row → **F5** persist → soft **DELETE** hide + `include_archived`; live `formula_sot=deprecated` on list/GET-by-id; draft formula FK bind **422** `HRM-PAY-COMP-FORMULA-412` via **`/payroll/formulas`** (not `pay-formulas`); `pay_types/items` **total≥1**. Defects **D-PAY-CAT-QA-01..04 CLOSED**. No P0/P1 product residual on this seat. Pack verify QA MD **8/8** exit 0. Spot-check screens `04`/`05`/`06` confirm create toast + F5 row + delete toast / row gone. **CONDITION retained:** `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` · DENY module UAT / J-HRM-07 process flip / Phase1 DONE.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| UF create `CUSTOM_TP_09` → 201 → FE row | QA §2 · JSON `UF-MUTATE-POST-2XX` · screen `04` | 🟢 **ACCEPT** |
| F5 persist | QA §2 · `UF-F5-PERSIST` · screen `05` | 🟢 **ACCEPT** |
| DELETE soft-archive + include_archived | QA §2 · DELETE 200 · screen `06` · `API-INCLUDE-ARCHIVED` | 🟢 **ACCEPT** |
| `formula_sot=deprecated` list + GET-by-id | QA §3 · JSON sample + scope parity id `13b7668b-…` | 🟢 **ACCEPT** |
| Draft FK 422 via `/payroll/formulas` | QA §3 · `HRM-PAY-COMP-FORMULA-412` · draft id `61786a8d-…` | 🟢 **ACCEPT** |
| `pay-formulas` 404 honesty | QA §3 · JSON `API-ROUTE-NOT-PAY-FORMULAS` | 🟢 **ACCEPT** |
| `pay_types` ≥1 | total=7 · BE-02 bootstrap/Settings path | 🟢 **ACCEPT** |
| D-PAY-CAT-QA-01..04 | QA §0 / §4 CLOSED | 🟢 **CLOSED** |
| P0 residual | none technical | 🟢 |
| `C-SLICE-≠-MODULE` / ready=false | honesty locks | 🟡 **CONDITION RETAIN** |
| J-HRM-07 / module UAT / Phase1 | Explicit DENIED | 🟢 |

**Cấm:** invent `payroll_e2e_ready=true` · claim payroll e2e DONE · flip J-HRM-07 from this seat · seed · Phase1 DONE.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim payroll module UAT / J-HRM-07 new GO from this gate? | **NO** |
| Why | `C-SLICE-≠-MODULE` · catalog UF ≠ process payslip / formula LIVE · J-HRM-07 not retested |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-02 | `po-hrm-dynamic-config-platform-pay-catalog-be-02.md` | READY_FOR_QA | **ACCEPT** · build + live formula_sot + pay_types bootstrap |
| QA R2 | `po-hrm-dynamic-config-platform-pay-catalog-qa-01.md` | PASS_TO_PM | **ACCEPT** stamp `PAYCATQA-R2-MSILIVE` |
| Machine | `_tmp-po-hrm-dynamic-config-platform-pay-catalog-qa-01.json` | overall PASS | **ACCEPT** |
| Pack verify | `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-qa-01.md` | exit **0** · **8/8** | 🟢 **PASS** |

### Classification

| Signal | Class | QC |
|--------|-------|-----|
| R1 stale dist / GET-by-id 404 | PRODUCT (closed BE-02) | 🟢 CLOSED |
| Empty pay_types blocker | PRODUCT (closed bootstrap) | 🟢 CLOSED |
| Draft FK 422 | PRODUCT expected | 🟢 PASS |
| Stack L0 200 | ENV OK | 🟢 |
| No seed | U65 OK | 🟢 |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `honesty.payroll_e2e_ready` / `seed_used` | **false** / **false** | 🟢 |
| `api.payTypes.total` | **7** | 🟢 |
| `api.getById.status` | **200** | 🟢 |
| `api.bindDraft` | **422** `HRM-PAY-COMP-FORMULA-412` | 🟢 |
| `api.browserPost` | **201** `CUSTOM_TP_09` · `formula_sot=deprecated` | 🟢 |
| `api.browserDelete` | **200** | 🟢 |
| All `ac.*` | **PASS** | 🟢 |
| `overall` / `ack_status` | PASS / PASS_TO_PM | 🟢 |
| `consoleErrors` / `pageErrors` | `[]` | 🟢 |

### Screenshot spot-check (QC)

| Screen | Observed | QC |
|--------|----------|-----|
| `04-after-save.png` | Modal `CUSTOM_TP_09` · toast «Thêm thành phần lương thành công» · row in table (12) | 🟢 |
| `05-f5-persist.png` | Row `#01` `CUSTOM_TP_09` still active after reload | 🟢 |
| `06-after-delete.png` | `CUSTOM_TP_09` absent · total **11** · toast «Xóa thành phần lương thành công» | 🟢 |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA R2 | QC |
|-----------------|-------|-------|-----|
| **PAY-CATALOG UF** create→F5→DELETE (in-scope) | BE-02 READY | 🟢 PASS | 🟢 **PASS / ACCEPT** |
| Contract: formula_sot · GET-by-id · draft FK | BE-02 live | 🟢 PASS | 🟢 **PASS / ACCEPT** |
| **J-HRM-07** Lương → phiếu lương | Historical ✅ PASS (W5B / H1–H7) | **not retested** | ⬜ **DEFERRED** — **DENY flip** from catalog seat |
| Payroll process / formula LIVE / payslip e2e | staged | not claimed | ⬜ **DEFERRED** — honesty |

**U19 note:** This gate certifies the **PAY-CATALOG platform slice** named in dispatch — **not** a claim that **J-HRM-07** or payroll module UAT is newly GO. Missing process L2.5 does **not** NO-GO catalog UF; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE`) and keeps `payroll_e2e_ready=false`.

---

## Defect register (QC)

| ID | Status | Note |
|----|--------|------|
| D-PAY-CAT-QA-01 | **CLOSED** | Live formula_sot + GET-by-id 200 |
| D-PAY-CAT-QA-02 | **CLOSED** | Build green (BE-02) |
| D-PAY-CAT-QA-03 | **CLOSED** | pay_types total≥1 |
| D-PAY-CAT-QA-04 | **CLOSED** | Browser create UF PASS |
| New P0/P1 | **none** | — |

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **C-SLICE-≠-MODULE** | CONDITION | **RETAIN** | PM honesty |
| `payroll_e2e_ready=false` | honesty | **RETAIN** | PM — DENY flip |
| J-HRM-07 / module UAT | out-of-scope | **DEFERRED** | separate wave if sponsor asks |

**Idle-ok:** no forced technical residual for PAY-CATALOG seat after this GWC.

---

## completion_report

**Closed:** QC gate on PAY-CATALOG platform slice — UF `CUSTOM_TP_09` create→F5→DELETE ACCEPT; formula_sot + GET-by-id + draft FK 422 via `/payroll/formulas` ACCEPT; D-PAY-CAT-QA-01..04 CLOSED; pack 8/8; screens spot-check PASS.

**Residual:** honesty only — `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` · DENY module UAT / J-HRM-07 flip / Phase1 DONE. No P0 product residual.

**Verdict:** **GO WITH CONDITIONS**

---

## Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-qc-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
from_role: pm
to_role: pm
lane: governance
priority: P1

entry_criteria:
- QC GWC: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-qc-01.md
- PAY-CATALOG seat CLOSED (UF + formula_sot + GET-by-id + draft FK)
- honesty: payroll_e2e_ready=false · C-SLICE-≠-MODULE retained

action:
1. Bus INTAKE QC GWC — stamp PAY-CATALOG slice ACCEPT; do NOT flip payroll_e2e_ready / J-HRM-07 / module UAT
2. Scan parent PO-HRM-DYNAMIC-CONFIG-PLATFORM-01 for next open seat (other catalogs / config depth) via pm:idle:check
3. Dispatch next execution/governance seat from parent roadmap — idle-ok on PAY-CATALOG residual (honesty only)

cấm: invent payroll_e2e_ready=true · claim payroll e2e DONE · reopen D-PAY-CAT-QA-01..04 without new FAIL evidence
```
