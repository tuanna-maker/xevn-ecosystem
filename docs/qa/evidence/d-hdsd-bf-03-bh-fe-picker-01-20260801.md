# D-HDSD-BF-03-BH-FE-PICKER-01 — AddInsuranceDialog policy picker / CTA

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-BF-03-BH-FE-PICKER-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · residual **R-MUTATE-BH-400-01** |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **change_mode** | **ADD** |
| **preserve_default** | true |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QA FAIL | `docs/qa/evidence/qa-hdsd-bf-03-bh-ret-01-20260801.md` · POST 400 `HRM-INS-POL-404` · 0 active policies |
| BE contract | `docs/qa/evidence/d-hdsd-bf-03-bh-400-01-20260801.md` · soft-resolve 0→404 / 1→201 / >1→AMBIG |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_ERP_E3.md` §13 AC-E3-INS-PART + DOC-DELTA soft-resolve |
| FE paths | `AddInsuranceDialog.tsx` · `insuranceParticipantLink.ts` · `InsurancePolicyMasterPanel.tsx` (anchor CTA only) |

## Root cause (FE)

```text
Thêm BH → buildInsuranceParticipantApiPayload (no policy_id)
  → POST /insurance-policy-participants
  → UAT main: 0 active hrm_insurance_policies
  → BE soft-resolve → 400 HRM-INS-POL-404
```

Dialog had no policy picker / create CTA; user could Lưu orphan omit.

## Fix (ADD)

| Behavior | FE |
|----------|-----|
| List active policies when dialog open | `listInsurancePolicies` + `resolveInsurancePolicyPickerOptions` (prefer `insurer_key`) |
| **0** active | Banner + CTA **«Tạo chính sách BH»** → close dialog → scroll `#insurance-policy-master-e3`; **Lưu disabled** (cấm POST orphan) |
| **≥1** active | Select picker; auto-select when exactly 1; Zod require `policy_id` |
| **>1** (AMBIG) | Hint + require explicit pick |
| Payload | `buildInsuranceParticipantApiPayload` includes `policy_id` when set; **omits** key when blank (no null orphan) |

### Files

- `apps/web/hrm/src/lib/insuranceParticipantLink.ts` (+ CODE-MEMORY)
- `apps/web/hrm/src/lib/insuranceParticipantLink.test.ts`
- `apps/web/hrm/src/components/insurance/AddInsuranceDialog.tsx`
- `apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx` — `id="insurance-policy-master-e3"` only

## Happy path (U65 FE-only — QA)

1. `/hr/insurance` → panel **Chính sách BH** → **Tạo chính sách** → SM **→ Hiệu lực** (`active`).
2. **Thêm bảo hiểm** → chọn NV + catalog + **chính sách** (auto nếu 1) → **Lưu**.
3. Network: POST `/api/hrm/insurance-policy-participants` → expect **201** `HRM-INS-P-201` · body has `policy_id`.
4. Dialog close · F5 persist · no Sync ERROR.

Empty path: Thêm BH với 0 active → CTA visible · Lưu disabled · no orphan POST.

## Verification

| Check | Result |
|-------|--------|
| `vitest run src/lib/insuranceParticipantLink.test.ts` | **7/7 PASS** |
| `tsc --noEmit` (apps/web/hrm) | **0** |
| Seed | **none** (U65) |
| SoftDel / Employees / TC-041 | **not touched** |
| BE soft-resolve | **must_keep** (omit path still valid when exactly 1 if FE omits — FE now prefers explicit) |

## must_keep

| Item | Status |
|------|--------|
| BE soft-resolve | preserved (no BE change) |
| Insurance GET | untouched |
| SoftDel DataTable / TC-041 | untouched |
| U65 no seed | PASS |
| Cấm orphan `policy_id` NULL | PASS — omit blank; block submit when 0 |

## Handoff

**completion_report:** Closed FE residual for TC-049: AddInsuranceDialog loads active policies, shows picker or CTA «Tạo chính sách BH» when 0, includes `policy_id` in POST payload when selected, blocks Lưu on empty (no orphan). Master panel got scroll anchor only. Vitest 7/7 · tsc 0. SoftDel/BE untouched. Ready for browser retest after FE-create ≥1 **active** policy.

**next_owner:** `qa`

**next_dispatch_prompt:**

```text
work_item_id: QA-HDSD-BF-03-BH-RET-02
from_role: pm | to_role: qa
program: P-HDSD-ECOSYSTEM-03 · R-MUTATE-BH-400-01
entry_criteria:
- D-HDSD-BF-03-BH-FE-PICKER-01 READY_FOR_QA
- evidence docs/qa/evidence/d-hdsd-bf-03-bh-fe-picker-01-20260801.md
- L0 qc:dev-stack · U65 zero-seed · persona ceo@xe.vn companyId=main
exit_criteria:
- Preflight: if 0 active policies → Thêm BH shows CTA «Tạo chính sách BH» + Lưu disabled (no POST orphan)
- FE-only: create policy on InsurancePolicyMasterPanel → SM → Hiệu lực (active)
- Thêm BH → chọn NV + catalog + policy → Lưu
- Network POST /api/hrm/insurance-policy-participants → 201 HRM-INS-P-201 with policy_id
- Dialog close · F5 no Sync ERROR · insurance GET 200
- must_keep: SoftDel · TC-041 · no seed
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hdsd-bf-03-bh-ret-02-20260801.md
```

**evidence_path:** `docs/qa/evidence/d-hdsd-bf-03-bh-fe-picker-01-20260801.md`

**ack_status:** **READY_FOR_QA**
