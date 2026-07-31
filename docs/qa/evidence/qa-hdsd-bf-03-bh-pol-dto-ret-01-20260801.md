# QA-HDSD-BF-03-BH-POL-DTO-RET-01 — Master policy create/SM DTO retest

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-BF-03-BH-POL-DTO-RET-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · **R-INS-POL-CREATE-LABEL-01** + **R-INS-POL-SM-COMPANYID-01** |
| **from_role** | `pm` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · run wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173` |
| **URL** | `/hr/insurance?portal=1&tenantId=xevn&companyId=main` |
| **policy** | U65 zero-seed · browser-only · **no seed** · **no Claude** · **no demote** TC-049/025/041 |
| **prior** | `D-HDSD-BF-03-BH-POL-DTO-01` READY_FOR_QA · QC BH GWC CLOSED (enroll) |
| **harness** | `scripts/qa/qa-hdsd-bf-03-bh-pol-dto-ret-01-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-bf-03-bh-pol-dto-ret-01-runtime.json` |
| **screenshots** | `docs/qa/evidence/screens/hdsd-bf-03-bh-pol-dto-ret-01-20260801/` |
| **ack_status** | **PASS_TO_PM** |

## Executive verdict

**PASS** — Master create + SM DTO residuals **CLOSED**. POST policies **201** `HRM-INS-POL-201` with body **without** `insurer_label`. PATCH draft→active **200** `HRM-INS-POL-200` with body `{ "status": "active" }` only and `company_id=main` on query. TC-049 dialog picker smoke **🟢** (must_keep matrix 🟢). SoftDel TC-025 / TC-041 **untouched**.

| Check | Result |
|-------|--------|
| L0 hrm/xbos/portal | **200** |
| `qc:fe-be-health` | **8/8 PASS** (pre-wave) |
| POST `/api/hrm/contracts-insurance/insurance-policies` | **201** `HRM-INS-POL-201` |
| Request body keys | `company_id`, `policy_code`, `policy_name`, `insurer_key`, `insurance_type`, `effective_date` |
| `insurer_label` in POST body | **absent** (`has_insurer_label=false`) |
| PATCH `…/insurance-policies/{id}?company_id=main` | **200** `HRM-INS-POL-200` |
| PATCH body | `{ "status": "active" }` only · **no** `company_id` |
| Policy created | `QA-DTO-DTO8GFR4R` · id `71efb104-468b-4bcf-855c-562920cca8f9` → **active** |
| TC-049 smoke | dialog open · `ins-participant-policy-picker` **visible** · Lưu enabled |
| SoftDel / archive POST | **0** |
| Contract DELETE | **0** |
| Matrix TC-049 / 025 / 041 | **🟢 preserved** (no demote · no promote needed) |

---

## Click path (U65 FE-only)

1. Login `ceo@xe.vn` → Settings **Danh mục nghiệp vụ** → upsert insurer + insurance type (FE MD, not seed).
2. `/hr/insurance` → master panel → fill mã/tên → pick Nhà BH + Loại BH → Hiệu lực từ → **Tạo chính sách**.
3. Network: **POST** `/api/hrm/contracts-insurance/insurance-policies` → **201** · body **no** `insurer_label`.
4. Row stamp → **→ Đang hiệu lực** (`ins-policy-sm-active`).
5. Network: **PATCH** `…/insurance-policies/{id}?company_id=main` body `{ "status": "active" }` → **200**.
6. **Thêm bảo hiểm** → policy picker visible (TC-049 smoke).
7. Assert **0** `/archive` POST · **0** contract DELETE.

---

## Spec says / code does

| Residual | Spec / DoD | Observed |
|----------|------------|----------|
| **R-INS-POL-CREATE-LABEL-01** | Create DTO whitelist — omit `insurer_label` → 201 | **PASS** — keys whitelist · 201 `HRM-INS-POL-201` |
| **R-INS-POL-SM-COMPANYID-01** | PATCH status-only · `company_id` query | **PASS** — bodyKeys=`["status"]` · query `main` · 200 |
| TC-049 must_keep | Picker / enroll path not broken | **PASS** — picker visible · matrix stays 🟢 |
| SoftDel TC-025 / TC-041 | Untouched | **PASS** — 0 archive · 0 HĐ DELETE |

---

## Residual closure

| ID | Prior | Now |
|----|-------|-----|
| ~~**R-INS-POL-CREATE-LABEL-01**~~ | OPEN (QC GWC) | **CLOSED** |
| ~~**R-INS-POL-SM-COMPANYID-01**~~ | OPEN (QC GWC) | **CLOSED** |
| TC-049 enroll full POST 201 | Already 🟢 RET-02 / QC close | **must_keep** — smoke picker this wave (enroll mutate not re-run to 201; save enabled, no orphan requirement) |
| SoftDel / TC-041 | must_keep 🟢 | **preserved** |

**J-HRM-04:** 🟢 master create → SM active → dialog picker.

---

## Matrix

| Action | Result |
|--------|--------|
| Promote | **none** — residuals are master-panel GWC, not new TC rows |
| TC-049 / 025 / 041 | **🟢** spot-check · **not demoted** |
| False 🟢 | **none** |

---

## Command table

| Command / check | Exit / result |
|-----------------|---------------|
| `pnpm run qc:dev-stack` | hrm/xbos/portal **200** |
| `pnpm run qc:fe-be-health` | **8/8 PASS** |
| `node scripts/qa/qa-hdsd-bf-03-bh-pol-dto-ret-01-browser.mjs` | exit **0** · VERDICT **PASS** |
| SoftDel / archive network | **0** POST archive |
| Screenshots | `screens/hdsd-bf-03-bh-pol-dto-ret-01-20260801/` (00–07) |

---

## Handoff

**completion_report:** Retested after D-HDSD-BF-03-BH-POL-DTO-01. Master create POST **201** without `insurer_label`; SM draft→active PATCH **200** status-only with `company_id` on query. **R-INS-POL-CREATE-LABEL-01** and **R-INS-POL-SM-COMPANYID-01** **CLOSED**. TC-049 picker smoke 🟢; SoftDel TC-025 / TC-041 untouched. Matrix no demote. U65 zero-seed.

**next_owner:** `pm` → optional **qc** re-gate GWC residual close (master DTO)

**next_dispatch_prompt:**

```text
work_item_id: QC-HDSD-BF-03-BH-POL-DTO-CLOSE-01
from_role: pm | to_role: qc
program: P-HDSD-ECOSYSTEM-03 · close R-INS-POL-CREATE-LABEL-01 + R-INS-POL-SM-COMPANYID-01
entry_criteria:
- QA-HDSD-BF-03-BH-POL-DTO-RET-01 PASS_TO_PM
- evidence docs/qa/evidence/qa-hdsd-bf-03-bh-pol-dto-ret-01-20260801.md
- runtime docs/qa/evidence/_tmp-qa-hdsd-bf-03-bh-pol-dto-ret-01-runtime.json
exit_criteria:
- Audit POST 201 no insurer_label · PATCH 200 status-only + company_id query
- Confirm residuals CLOSED · must_keep TC-049/025/041 🟢
- GWC conditions on master panel closed (or document remaining)
- cấm demote SoftDel / TC-049 · cấm Phase2 DONE
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-bf-03-bh-pol-dto-ret-01-20260801.md`

**ack_status:** **PASS_TO_PM**
