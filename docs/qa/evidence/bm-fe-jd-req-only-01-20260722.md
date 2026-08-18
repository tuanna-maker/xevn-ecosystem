# BM-FE-JD-REQ-ONLY-01 — YCTD create requires JD from library

**Date:** 2026-07-22  
**Role:** dev-fe  
**Program:** P1-BMINUTES-CUST-RETEST-01  
**ack_status:** READY_FOR_QA  
**U65:** no seed

## spec_read_ack

| Field | Value |
|-------|--------|
| srs | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.7 **FR-HRM-RC-01** (headcount + JD fields) · delta **AC-CD-F6-02** / **UC-HRM-RC-08** |
| tech_spec | `docs/hrm/TECHSPEC.md` §14.7 — `job_template_id` + JD/requirements snapshot; **G-RC-01** headcount must_keep |
| ba_ac | `docs/program/deltas/BMINUTES_AC_MATRIX.md` **BM-AC-05-02** · `CUSTOMER_DEMO_HRM_DELTA_20260620.md` **BR-CD-F6-02** / **AC-CD-F6-02** |
| sponsor | «lúc tuyển dụng chỉ chọn JD thôi» — closes FAIL in `bm-exp-fe-jd-pos-wf-01-20260722.md` (optional template + free-text) |
| change_mode | ADD (JD-required gate + CTA); no wipe G-RC-01 / WF LOCK |
| must_keep | G-RC-01 headcount · `job_template_id` snapshot · U65 · J-HRM-05 detail · UF-HRM-12 |

### spec says / code does (before → after)

| Spec / sponsor | Before | After |
|----------------|--------|-------|
| BM-AC-05-02 / AC-CD-F6-02: create YCTD selecting JD; JD prefilled | Template Select optional (`__none__` «Không dùng template»); free-text JD always | **JD Select required**; no `__none__`; submit blocked without `job_template_id` |
| BR-CD-F6-02 snapshot (editable copy OK) | Free-text from empty | JD/requirements **disabled until** template applied; then snapshot from JD (editable copy) |
| Empty library | Soft hint | Amber box + CTA **«Mở Thư viện JD»** → parent tab `jd-library` |

## Changes

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Required `job_template_id` zod; remove `__none__`; gate textareas; CTA; CODE-MEMORY; POST always sends `job_template_id` |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | `isRequisitionJobTemplateSelected` + VI constants |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | Helper + source-contract tests |
| `apps/web/hrm/src/pages/Recruitment.tsx` | `onOpenJdLibrary={() => setActiveTab('jd-library')}` |

## Verify

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/jobRequisitionUi.test.ts
```

**Result:** 11 passed (exit 0) — 2026-07-22

## QA retest (UF / J-*)

| ID | Click path | PASS when |
|----|------------|-----------|
| **BM-AC-05-02** / **UF-HRM-12** | Login → Tuyển dụng → Yêu cầu tuyển dụng → Thêm | JD * required; no «Không dùng template»; Lưu without JD → validation VI |
| Snapshot | Chọn JD → mô tả/yêu cầu filled; may edit copy → Lưu | POST body has `job_template_id` + snapshot; Network **201/2xx**; list row; **F5** còn |
| Empty library | Scope with 0 JD → Thêm | CTA «Mở Thư viện JD» → tab Thư viện JD |
| **J-HRM-05** | List → Chi tiết | GET by id; headcount + snapshot still OK |
| **must_keep G-RC-01** | Create with headcount ≥1 | Still required; no regression |

**cấm:** seed · API-only PASS · wipe Phase1/PROD claim

## Residual

- BE DTO vẫn optional `job_template_id` (TechSpec §14.7) — FE enforces JD-only; BA/SA may later harden BE NOT NULL if product lock persists.
- Edit dialog still status+headcount only (out of scope).

## Handoff

- `completion_report`: JD-only create YCTD closed; vitest 11 PASS; evidence this file.
- `next_owner`: qa
- `ack_status`: READY_FOR_QA
