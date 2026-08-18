# SPEC-GAP-HRM-DEC-01-OPENAPI - Dev-BE evidence (2026-07-17)

| Field | Value |
|-------|-------|
| **work_item_id** | `SPEC-GAP-HRM-DEC-01-OPENAPI` |
| **from_role** | `dev-be` |
| **to_role** | `pm` |
| **entry_criteria** | `docs/qa/evidence/spec-gap-hrm-dec-01-20260717.md`; `docs/qa/evidence/spec-gap-hrm-dec-01-techspec-20260717.md` |
| **ack_status** | `PASS_TO_PM` |

## Scope

Checked `docs/api/openapi/hrm-api.yaml` against runtime:

- `apps/api/hrm-api/src/decisions/decisions.controller.ts`
- `apps/api/hrm-api/src/decisions/decisions.service.ts`
- `apps/api/hrm-api/src/decisions/dto/*.ts`

## Change Summary

- Added `Decisions` OpenAPI tag.
- Added reusable schemas: `HrDecision`, `HrDecisionList`, `CreateDecisionRequest`, `UpdateDecisionRequest`.
- Added runtime CRUD paths under server base `/api/hrm`:
  - `GET /decisions` -> `HRM-DEC-200`
  - `POST /decisions` -> `HRM-DEC-201`
  - `GET /decisions/{decisionId}` -> `HRM-DEC-200`
  - `PATCH /decisions/{decisionId}` -> `HRM-DEC-200`
  - `DELETE /decisions/{decisionId}` -> `HRM-DEC-200`
- Kept the OpenAPI contract runtime-focused. The density / NOT DONE governance gate remains in SRS, TECHSPEC, and QA evidence, not in `hrm-api.yaml`.

## Verification

```text
node -e "const fs=require('fs'); const p='docs/api/openapi/hrm-api.yaml'; let YAML; try { YAML=require('yaml'); } catch (e) { console.error('yaml package unavailable'); process.exit(2); } const doc=YAML.parse(fs.readFileSync(p,'utf8')); const required=['/decisions','/decisions/{decisionId}']; for (const key of required) { if (!doc.paths?.[key]) { throw new Error('missing '+key); } } console.log('openapi yaml parse ok'); console.log(Object.keys(doc.paths['/decisions']).join(',')); console.log(Object.keys(doc.paths['/decisions/{decisionId}']).join(','));"

openapi yaml parse ok
get,post
get,patch,delete
```

```text
rg "NOT DONE|AC-DEC-DENSITY|density" docs/api/openapi/hrm-api.yaml

No matches found
```

```text
rg "HRM-DEC-200|HRM-DEC-201|/decisions|HrDecision" docs/api/openapi/hrm-api.yaml

HrDecision schemas and /decisions CRUD paths present.
```

## Notes

- No backend runtime code was changed.
- `POST /decisions` is documented as HTTP `201`, matching Nest default `@Post()` response status and envelope code `HRM-DEC-201`.
- `PATCH /decisions/{decisionId}` request schema is partial, matching `UpdateDecisionDto extends PartialType(CreateDecisionDto)`.

## Handoff

- **completion_report:** Closed `SPEC-GAP-HRM-DEC-01-OPENAPI` by documenting the live decisions CRUD contract in `docs/api/openapi/hrm-api.yaml`; validated YAML parsing and confirmed density / NOT DONE gate wording is absent from OpenAPI.
- **residual:** UC-HRM-27 remains Implemented-empty / not DONE until AC-DEC-DENSITY and AC-DEC-04 browser evidence pass; no OpenAPI residual.
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/spec-gap-hrm-dec-01-openapi-20260717.md`
- **ack_status:** `PASS_TO_PM`
- **next_dispatch_prompt:**

```text
work_item_id: SPEC-GAP-HRM-DEC-01-OPENAPI-QA
from_role: pm
to_role: qa
entry_criteria: Dev-BE PASS_TO_PM evidence docs/qa/evidence/spec-gap-hrm-dec-01-openapi-20260717.md; OpenAPI runtime decisions paths documented in docs/api/openapi/hrm-api.yaml.
task: Verify docs/api/openapi/hrm-api.yaml exposes GET/POST /decisions and GET/PATCH/DELETE /decisions/{decisionId} with HRM-DEC-200/201, and confirm no density / NOT DONE governance gate wording is present in OpenAPI.
exit_criteria: PASS_TO_PM with evidence path; do not claim UC-HRM-27 DONE; U65 browser CRUD/density remains separate future QA when requested.
evidence_path: docs/qa/evidence/spec-gap-hrm-dec-01-openapi-qa-20260717.md
```
