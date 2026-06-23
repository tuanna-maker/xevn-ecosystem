# P1-GAP-ACT-06-INS-LINK-FE — ACT-HRM-INS-LINK wire

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-GAP-ACT-06-INS-LINK-FE` |
| **role** | dev-fe |
| **executed_at** | 2026-06-20 |
| **spec_ref** | `docs/ecosystem/ACTION_BUTTON_INVENTORY.md` §10 · `docs/hrm/TECHSPEC.md` contracts-insurance + catalog participants |
| **capability** | `ACT-HRM-INS-LINK` |
| **ack_status** | **READY_FOR_QA** |

---

## Problem (GAP-ACT-06)

Insurance embed list reads workforce rows (`GET /api/hrm/contracts-insurance/insurance`) but **Link/Lưu** must mutate `POST/PATCH /api/hrm/insurance-policy-participants` per ACTION_BUTTON_INVENTORY §10. FE used workforce row `id` on PATCH → **404** on participant table; create omitted `employee_id` (link NV).

---

## Fix summary

| Area | Change |
|------|--------|
| `insuranceParticipantLink.ts` | Participant id lookup by `employee_code`; mutate target create vs update; API payload builder; `ACT_HRM_INS_LINK_CAPABILITY` |
| `useInsuranceList.ts` | Attach `participant_id` from participants list alongside financial merge |
| `AddInsuranceDialog.tsx` | Single save mutation: POST link (201) or PATCH participation (200); send `employee_id`; `data-capability="ACT-HRM-INS-LINK"` on submit |
| `Insurance.tsx` | Add button `data-capability`; delete uses `participant_id` (not workforce id) |

---

## Root cause

```text
List id  = employee_insurance_records.id
Mutate id = hrm_insurance_policy_participants.id  ← mismatch caused blocked save/link in browser
```

---

## Verification (agent)

| Check | Result |
|-------|--------|
| `vitest run src/lib/insuranceParticipantLink.test.ts` | **5/5** PASS |
| `vitest run src/hooks/useInsuranceList.test.ts` | **6/6** PASS |
| `vitest run src/lib/insuranceSummary.test.ts` | **7/7** PASS |
| `pnpm run build` (hrm) | exit **0** |

---

## QA handoff (U65 browser — mandatory)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · URL `/command-center/hrm/insurance?portal=1&companyId=main`

### UF-HRM-04 / ACT-HRM-INS-LINK — Link NV

1. **Thêm bảo hiểm** → chọn NV từ dropdown → nhập BHXH → **Lưu**
2. Network: `POST /api/hrm/insurance-policy-participants` → **201** `HRM-INS-P-201`; body includes `employee_id`
3. FE: toast success; row visible (financials from participant merge)
4. **F5:** participation persists

### ACT-HRM-INS-LINK — Lưu sửa

1. Bấm **Sửa** (pencil) trên row có `participant_id`
2. Đổi `base_salary` hoặc số BHXH → **Lưu**
3. Network: `PATCH /api/hrm/insurance-policy-participants/{participant_uuid}?company_id=main` → **200** `HRM-INS-P-200`
4. **F5:** values retained

**Selector:** `[data-capability="ACT-HRM-INS-LINK"]` on add dialog submit + header add button.

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| Delete workforce-only row | No `participant_id` → toast «liên kết chính sách trước»; expected until link save | — |
| List vs participant count | List still BR-INS-01 workforce API; participant row enriches financials — not a regression | qa note |

---

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | Wired ACT-HRM-INS-LINK POST/PATCH to correct participant ids + employee_id link; 18 vitest PASS; hrm build PASS |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | Retest UF-HRM-04 / GAP-ACT-06 on :8088 browser-only (U65): login ceo@xe.vn → HRM Insurance → Link NV (POST 201 + employee_id) → edit row (PATCH 200 participant uuid) → F5 both steps. Evidence block per qa-fe-outside-browser-gate.mdc; promote screen-action-catalog-map GAP-ACT-06 🟢 if PASS. |
| **evidence_path** | `docs/qa/evidence/p1-gap-act-06-ins-link-fe-20260620.md` |
| **ack_status** | **READY_FOR_QA** |
