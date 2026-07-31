# D-HDSD-BF-03-BH-POL-DTO-01 — Insurance policy create/SM DTO payload FIX

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-BF-03-BH-POL-DTO-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · residual after TC-049 PASS |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **change_mode** | **FIX** |
| **preserve_default** | true |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QA residual | `docs/qa/evidence/qa-hdsd-bf-03-bh-ret-02-20260801.md` · R-INS-POL-CREATE-LABEL-01 · R-INS-POL-SM-COMPANYID-01 |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_ERP_E3.md` §7 Create · §9 PATCH |
| Create DTO | `CreateInsurancePolicyDto` — `company_id`, codes, dates, `notes?`, `status?` — **no** `insurer_label` (BE snapshots from catalog) |
| Update DTO | `UpdateInsurancePolicyDto` — fields + `status?` — **no** `company_id` (query/`x-company-id`) |
| Prior FE | `docs/qa/evidence/d-hdsd-bf-03-bh-fe-picker-01-20260801.md` · TC-049 enroll picker must_keep |

## Root cause (FE)

| Residual | Observed | Spec / DTO |
|----------|----------|------------|
| R-INS-POL-CREATE-LABEL-01 | POST body included `insurer_label` → **400 `HRM-VAL-001`** | Create DTO whitelist; BE inserts `insurer!.label` server-side |
| R-INS-POL-SM-COMPANYID-01 | PATCH `{ company_id, status }` → **400**; `{ status }` → **200** | Update DTO no `company_id`; controller `@Query('company_id')` |

## Fix (FIX · preserve)

| Surface | Change |
|---------|--------|
| `insurancePolicyPayload.ts` | Pure builders: create (omit `insurer_label`), update (no `company_id`), SM status-only |
| `InsurancePolicyMasterPanel` | saveMutation / statusMutation use builders |
| `hrmApi.updateInsurancePolicy` | Signature `(policyId, companyId, body)` — `company_id` on **query**; body = Update DTO only |
| `hrmApi.createInsurancePolicy` | Type drops `insurer_label` |

### Files

- `apps/web/hrm/src/lib/insurancePolicyPayload.ts` (+ CODE-MEMORY)
- `apps/web/hrm/src/lib/insurancePolicyPayload.test.ts`
- `apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx` (APPEND CHANGE)
- `apps/web/hrm/src/integrations/hrmApi.ts` (create/update signatures)

## Happy path (U65 FE-only — QA)

1. `/hr/insurance` → **Tạo chính sách** → Network POST `/api/hrm/contracts-insurance/insurance-policies` → expect **201** `HRM-INS-POL-201` · body **no** `insurer_label`.
2. Row SM **→ Hiệu lực** → PATCH `…/insurance-policies/{id}?company_id=…` body `{ "status": "active" }` only → expect **200** `HRM-INS-POL-200`.
3. Regression TC-049: **Thêm bảo hiểm** → picker + Lưu → POST participants **201** (must_keep).

## Verification

| Check | Result |
|-------|--------|
| `vitest run src/lib/insurancePolicyPayload.test.ts` (+ form schema) | **6/6 PASS** (4 payload + 2 schema) |
| `tsc --noEmit` (apps/web/hrm) | **0** |
| Seed | **none** (U65) |
| SoftDel / TC-025 / TC-041 / AddInsuranceDialog | **not touched** |
| BE soft-resolve | **must_keep** (no BE change) |

## must_keep

| Item | Status |
|------|--------|
| TC-049 enroll path / picker | preserved (dialog untouched) |
| SoftDel DataTable | untouched |
| TC-025 / TC-041 | untouched |
| BE soft-resolve | no API change |
| U65 no seed · no Claude | PASS |

## Handoff

**completion_report:** Closed R-INS-POL-CREATE-LABEL-01 (omit `insurer_label` on create) and R-INS-POL-SM-COMPANYID-01 (SM/update PATCH status/fields only; `company_id` query). Vitest 6/6 · tsc 0. TC-049 enroll / SoftDel / BE soft-resolve untouched.

**next_owner:** `qa`

**next_dispatch_prompt:**

```text
work_item_id: QA-HDSD-BF-03-BH-POL-DTO-RET-01
from_role: pm | to_role: qa
program: P-HDSD-ECOSYSTEM-03 · after D-HDSD-BF-03-BH-POL-DTO-01
entry_criteria:
- D-HDSD-BF-03-BH-POL-DTO-01 READY_FOR_QA
- evidence docs/qa/evidence/d-hdsd-bf-03-bh-pol-dto-01-20260801.md
- U65 browser-only · zero-seed · cấm demote TC-049
exit_criteria:
- POST insurance-policies 201 · body no insurer_label
- PATCH status-only (query company_id) draft→active 200
- Regression TC-049 enroll 201 still 🟢
- SoftDel TC-025 / TC-041 untouched
- evidence docs/qa/evidence/qa-hdsd-bf-03-bh-pol-dto-ret-01-20260801.md
```

**evidence_path:** `docs/qa/evidence/d-hdsd-bf-03-bh-pol-dto-01-20260801.md`

**ack_status:** **READY_FOR_QA**
