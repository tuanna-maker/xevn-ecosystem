# Evidence — PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-FE-01` |
| **role** | `dev-fe` |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `contracts_printable_ready=false` |

---

## spec_read_ack

| Artifact | Path / section |
|----------|----------------|
| **srs** | `docs/program/specs/PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md` §4 **BR-CTR-CREATE-08** |
| **tech_spec** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` §4.1 Banner REC khi NV thiếu UV |
| **api_design** | `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` — NV-first POST không gate REC |
| **upstream_be** | `docs/qa/evidence/po-hrm-ctr-workspace-be-subject-rec-nv-first-01.md` |
| **sponsor_confirm** | BA-03 G1 NV-first · 2026-08-11 |

---

## Change summary

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/contractEmployeeRecBanner.ts` | **ADD** — `shouldShowEmployeeRecruitmentBanner` predicate + testids |
| `apps/web/hrm/src/lib/contractEmployeeRecBanner.test.ts` | **ADD** — unit tests BR-CTR-CREATE-08 |
| `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx` | Banner khi `employee.candidate_id` null; link «Mở tuyển dụng»; **không** chặn Tiếp |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `HrmEmployeeRecord.candidate_id` optional |
| `apps/web/hrm/src/lib/contractWorkspace.source.test.ts` | Source lock G4 banner |

**must_keep:** NV-first POST 2xx; `goStep2` / `ctr-create-next-btn` không gate `candidate_id`; không REC gate trên create.

---

## UI behavior (BR-CTR-CREATE-08)

| Điều kiện | Hành vi |
|-----------|---------|
| Tab **Nhân viên** + chọn NV có `candidate_id: null` | Banner amber `ctr-create-employee-rec-hint` + link `ctr-create-employee-rec-link` «Mở tuyển dụng» → `/command-center/hrm/recruitment` |
| NV có `candidate_id` UUID | Banner **ẩn** |
| Tab **Ứng viên** / edit mode | Banner **ẩn** |
| Nút **Tiếp** | **Luôn** enabled khi đủ mẫu + validation GĐ1 (không phụ thuộc banner) |

---

## Verification

| Command | Result |
|---------|--------|
| `pnpm exec vitest run src/lib/contractEmployeeRecBanner.test.ts src/lib/contractWorkspace.source.test.ts` | **16/16 PASS** |
| `pnpm exec tsc --noEmit` (hrm package) | **exit 0** |

---

## QA handoff (browser U65)

- Persona `ceo@xe.vn` · CC `…/command-center/hrm/contracts`
- Thêm HĐ → tab **Nhân viên** → chọn **Le Van C — NV101** (`candidate_id: null`)
- **Expect:** banner «Mở tuyển dụng» visible; **Tiếp** vẫn bấm được → POST 2xx (WS-G4-02)
- Chọn NV có trace REC (`candidate_id` set) → banner biến mất
- Rows: **J-HRM-CTR-CREATE-01** · residual QC P2 BR-CTR-CREATE-08 → **CLOSED** on FE

---

## completion_report

**Closed:** BR-CTR-CREATE-08 non-blocking REC banner wired on ContractWorkspace Step1 employee picker using `employee.candidate_id`; vitest + source lock; tsc clean.

**Residual:** `contracts_printable_ready=false`; full WS-G4-07 mandatory confirm QA matrix; edit deep-link P1 carry orthogonal.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-FE-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-ctr-workspace-fe-br-ctr-create-08-banner-01.md
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-subject-rec-nv-first-retest-01.md
entry_criteria: dev-fe READY_FOR_QA; L0 stack up; NV101 pilot available
exit_criteria: U65 CC contracts create — tab NV → NV101 → banner «Mở tuyển dụng» visible (ctr-create-employee-rec-hint); Tiếp POST 2xx; banner absent when NV has candidate_id; J-HRM-CTR-CREATE-01; F5 after full save
cấm: seed; probe-only PASS
evidence_path: docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md
ack_status: PASS_TO_PM | FAIL_TO_PM
```
