# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-02` |
| **lane** | execution · dev-fe |
| **date** | 2026-08-06 |
| **change_mode** | FIX |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-01` FAIL · residual **R-CTR-PREVIEW-COMPANY-ID-BODY** P0 |
| **u65** | zero-seed · no seed used |
| **honesty** | `contracts_printable_ready=false` · **DENIED** printable UAT claim |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **qa residual** | `docs/qa/evidence/po-hrm-contract-legal-print-qa-01.md` § AC-CTR-PRINT-SPINE · R-CTR-PREVIEW-COMPANY-ID-BODY |
| **srs** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` §D · AC-CTR-PRINT-* |
| **tech_spec / dto** | `ContractPreviewDto` / `CreatePrintVersionDto` — whitelist pack_code · template_id · field_overrides · can_view_cb (**no** company_id) |
| **api** | POST `/contracts/:id/preview` · `/print-versions` — scope `@Query('company_id')` \| `x-company-id` |
| **sponsor_confirm** | parent wave 2026-08-06 |

---

## Root cause (spec says / code did)

| | |
|--|--|
| **spec / BE** | Body DTO forbidNonWhitelisted — `company_id` must not appear in JSON |
| **code did (FE-01)** | `previewContractPrint` / `createContractPrintVersion` spread payload into `JSON.stringify` **including** `company_id` |
| **symptom** | POST preview → **400** `HRM-VAL-001` `property company_id should not exist` |

---

## Closed scope

| Item | Change |
|------|--------|
| Builder | `apps/web/hrm/src/lib/contractPrintRequest.ts` — `buildContractPrintMutateRequest` |
| Client | `hrmApi.ts` — preview + print-versions POST: `?company_id=` + body **without** company_id |
| PDF | unchanged (already query-only GET) |
| Panel | callers unchanged (still pass `company_id` into API fn args) |
| must_keep | UF-HRM-02 · Settings CL/TPL DnD FE-01 · SI `buildInsuranceActionBody` (body **keeps** company_id) untouched |
| Honesty | no claim printable ready |

---

## Tests

```text
pnpm exec vitest run src/lib/contractPrintRequest.test.ts src/lib/contractClauseOrder.test.ts src/lib/jdDndSameNodeProps.test.ts
→ 3 files · 10 tests PASS
```

Assert: `JSON.stringify(body)` never contains `company_id`.

---

## CODE-MEMORY

- APPEND `contractPrintRequest.ts` (new)
- APPEND `hrmApi.ts` LEGAL-PRINT section FE-02
- APPEND `ContractPrintSpinePanel.tsx` FE-02

---

## Residual / honesty

| ID | Note |
|----|------|
| AC-CTR-PRINT-* mutate | Needs QA R2 browser — expect preview **2xx** then save version → PDF stub |
| `contracts_printable_ready` | remains **false** — do not promote printable UAT |
| Settings / UF-HRM-02 | smoke only on R2 (must_keep) |

---

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R2
from_role: pm
to_role: qa
lane: execution
u65: zero-seed
parent: PO-HRM-CONTRACT-LEGAL-PRINT-FE-02 READY_FOR_QA
evidence_in: docs/qa/evidence/po-hrm-contract-legal-print-fe-02.md
honesty: contracts_printable_ready=false — DENIED printable module GO

entry_criteria:
- FE-02 strips company_id from preview/print-version POST body; scope on ?company_id=
- Live stack L0; persona ceo@xe.vn company_id=main
- Prior QA-01: CL-01 + TPL-DND + UF-HRM-02 already 🟢 — re-smoke only

exit_criteria:
1) AC-CTR-PRINT-SPINE: Edit HĐ → spine → pick pack/template → Xem trước → POST …/preview?company_id=… **2xx** (not 400 HRM-VAL-001); body must NOT contain company_id
2) Lưu phiên bản in → POST …/print-versions?company_id=… **2xx**; F5 versions list >0
3) PDF HTML stub GET …/print-versions/:id/pdf → **2xx** (Q-CTR-02)
4) Smoke must_keep: Settings CL/TPL chrome + UF-HRM-02 list load OK (no DnD storm)
5) Honesty stamp still false; no seed; evidence docs/qa/evidence/po-hrm-contract-legal-print-qa-01.md APPEND R2

ack_status: PASS_TO_PM | FAIL_TO_PM
```

---

## completion_report

- **Closed:** R-CTR-PREVIEW-COMPANY-ID-BODY — preview/print-version clients send company scope on query only; vitest 10 PASS; CODE-MEMORY APPEND.
- **Open:** Browser retest QA-01 R2 for preview 2xx → version → PDF; printable UAT still denied.
