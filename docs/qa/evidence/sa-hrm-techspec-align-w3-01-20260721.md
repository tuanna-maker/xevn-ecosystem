# SA-HRM-TECHSPEC-ALIGN-W3-01 — W1 spine TechSpec dual-ref align

| Field | Value |
|-------|-------|
| **work_item_id** | `SA-HRM-TECHSPEC-ALIGN-W3-01` |
| **from_role** | pm |
| **to_role** | sa |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-07-21 |
| **ack_status** | **PASS_TO_PM** |
| **change_mode** | ADD-only (no SRS wipe · no `apps/**` · no Phase1 DONE) |
| **khách SoT** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` v3.0-W1 (8 FR) |
| **team annex** | `docs/hrm/SRS.md` (must_keep AC-ATT-SHEET-01..06) |
| **techspec** | `docs/hrm/TECHSPEC.md` §12.1 dual-ref · **§14** · **§15** |
| **prior** | `docs/qa/evidence/sa-hrm-att-sheet-techspec-01-20260721.md` |
| **OS** | `_vibe-team-os/14-TRACEABILITY-SRS-TECHSPEC-CODE.md` · `templates/SRS-TO-TECHSPEC-HANDOFF.md` |

---

## 1. Entry artifacts read

| Artifact | Role |
|----------|------|
| `docs/client-delivery/hrm/SRS_HRM_KHACH.md` | 8 FR spine + Kết quả trả về + AC-ATT-SHEET |
| `docs/hrm/SRS.md` | Team UC dual (UC-HRM-10/21..25/32, AC-ATT-SHEET) |
| `docs/hrm/TECHSPEC.md` (pre) | §5 envelope · §11–13 ATT sheets |
| Controllers/DTOs | employees · contracts-insurance · attendance · payroll · recruitment · settings-catalogs |
| Prior SA ATT evidence | Header≠roster · RQ singleflight locked |

---

## 2. ADD-only TechSpec deltas

| Section | Content |
|---------|---------|
| §12.1 / §13 `ref_srs` | Dual: khách **FR-HRM-AT-14** + team UC-HRM-23 / HRM-AT-14 |
| **§14.0** | Trace matrix 8 FR → HTTP / code / table / SA status |
| **§14.1–14.8** | Per-FR `ref_srs` + endpoint/DTO/DB + FE Kết quả trả về + gaps |
| **§14.9** | Dev gap backlog prioritized |
| **§15** | Coding-convention expectations for **TM-HRM-CODE-SPEC-CONVENTION-01** |

**cấm tuân thủ:** không wipe SRS · không sửa `apps/**` · không claim Phase1 DONE.

---

## 3. SA status per W1 FR

| FR | Status | P0/P1 residual |
|----|--------|----------------|
| FR-HRM-EM-01 | PARTIAL | G-EM-01 code required; G-EM-02..04 field parity |
| FR-HRM-CI-01 | PARTIAL | G-CI-01 `end_date` always required |
| FR-HRM-CI-02 | ALIGNED | — |
| FR-HRM-AT-14 | ALIGNED | must_keep AC-ATT-SHEET (prior SA) |
| FR-HRM-AT-10 | PARTIAL | G-AT10-01 `company_id` UUID vs slug; G-AT10-02 overlap/balance audit |
| FR-HRM-PR-05 | ALIGNED | read slice |
| FR-HRM-RC-01 | **GAP** | **G-RC-01 missing headcount/quantity** |
| FR-HRM-SC-01 | ALIGNED | overview |

---

## 4. Architecture notes (short)

| Option | Verdict |
|--------|---------|
| A — Document dual-ref + gap list only (this wave) | **SELECT** — unlocks TM then Dev without product churn in SA lane |
| B — SA invents new aggregate APIs | Reject — out of scope; SRS maps to existing Nest modules |
| C — Wipe TechSpec rewrite | **cấm** |

**Invariant:** scope parity list/get/mutate; empty 200 honesty; U65 no-seed.

---

## 5. Coding convention packet (§15) — TM gate

Fail TM if W1 touched paths violate: no `any`, DTO class-validator at edge, envelope §5, ISO wire / vi-VN UI dates & money, scope 404/409, empty honesty, CODE-MEMORY, anti-seed.

P0 product gap **G-RC-01** is **not** a TM convention fail — it is Dev-BE backlog after TM documents convention PASS/GWC.

---

## 6. completion_report

**Closed:** All 8 W1 khách FR have TechSpec sections with `ref_srs` (khách FR/UC + team UC dual where applicable); endpoint/DTO/DB mapped; gaps listed; ATT AC must_keep preserved; TM coding-convention §15 ready; evidence this file.

**Residual:**
1. P0 **G-RC-01** headcount on requisition — Dev-BE after TM.
2. P0/P1 leave `company_id` type + overlap/balance audit.
3. P1 contract optional `end_date`; employee optional code.
4. TM wave not yet run.

**Not claimed:** Phase 1 DONE / PROD-READY / UF 🟢 closure.

---

## 7. Handoff

- **next_owner:** `pm` → dispatch **`technical-manager`**
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/sa-hrm-techspec-align-w3-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: TM-HRM-CODE-SPEC-CONVENTION-01
from_role: pm
to_role: technical-manager
lane: governance
priority: P0

## Entry
SA W1 TechSpec align PASS: docs/qa/evidence/sa-hrm-techspec-align-w3-01-20260721.md
TechSpec: docs/hrm/TECHSPEC.md §14 (FR map+gaps) · §15 (coding convention)
Khách SRS: docs/client-delivery/hrm/SRS_HRM_KHACH.md (8 FR)
Team: docs/hrm/SRS.md — must_keep AC-ATT-SHEET-01..06
cấm: wipe SRS · Phase1 DONE · implement apps (unless TM finds P0 convention violation needing Dev — then PASS_TO_PM with work_item, do not patch yourself)

## Job
1. Audit boundary hygiene on W1 modules vs TECHSPEC §15.1 (no any, DTO, envelope, dates/money, scope, empty honesty, CODE-MEMORY)
2. Spot-check DTOs listed in §15.3
3. Confirm gap backlog §14.9 still accurate (especially G-RC-01 P0 headcount)
4. Evidence: docs/qa/evidence/tm-hrm-code-spec-convention-01-20260721.md
5. Verdict GO / GWC / NO-GO → PASS_TO_PM
6. next_dispatch_prompt: if GWC/GO with product gaps → Dev-BE top P0 G-RC-01 (+ G-AT10-01); if convention NO-GO → Dev fix paths cited

entry_criteria: SA evidence + TECHSPEC §14/§15 present
exit_criteria: TM evidence with checklist results; residual gap owners; ack_status PASS_TO_PM
```
