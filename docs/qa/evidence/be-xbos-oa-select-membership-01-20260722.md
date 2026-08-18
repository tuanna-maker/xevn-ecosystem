# BE-XBOS-OA-SELECT-MEMBERSHIP-01 — OpenAPI G-OA-02 (+ G-DTO-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-XBOS-OA-SELECT-MEMBERSHIP-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **gap closed** | **G-OA-02** (path) + **G-DTO-01** (components schema) |
| **scope** | OpenAPI yaml **ONLY** — no runtime / FE rewrite |

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| tech_spec | `docs/xbos/TECHSPEC.md` **§14.2** FR-XBOS-TENANT-01 · **§14.13** G-OA-02 / G-DTO-01 · **§15** coding convention (yaml sync) |
| TM packet | `docs/qa/evidence/tm-xbos-code-spec-convention-01-20260722.md` §3 G-OA-02 |
| SA trace | `docs/qa/evidence/sa-xbos-techspec-ref-srs-01-20260722.md` FR-XBOS-TENANT-01 PARTIAL (OA) |
| runtime SoT (read-only) | `apps/api/xbos-api/src/auth/auth.controller.ts` `POST select-membership` · `dto/select-membership.dto.ts` · `auth.service.ts` `selectMembership` |
| OpenAPI SoT | `docs/api/openapi/xbos-api.yaml` |

**change_mode:** ADD (contract documentation)  
**must_keep:** UF-XBOS 🟢 — no product behavior change; OA-03/04 **out of scope** this Task.

---

## 2. Micro-checklist

| # | Item | Status |
|---|------|--------|
| 1 | `spec_read_ack` in evidence | **DONE** (§1) |
| 2 | ADD operation + components to `xbos-api.yaml` | **DONE** |
| 3 | `pnpm verify:openapi-m01` exit 0 | **DONE** (see §4) |
| 4 | Evidence this path | **DONE** |
| 5 | READY_FOR_QA; fold G-DTO-01 | **DONE** (tiny — folded) |

---

## 3. OpenAPI delta (ADD)

### Path

`POST /api/xbos/auth/select-membership`  
- **operationId:** `xbosAuthSelectMembership`  
- **tag:** `M01-Tenant`  
- **security:** `bearerAuth`  
- **requestBody:** `#/components/schemas/SelectMembershipRequest` (`tenantId` required, minLength 1)  
- **responses:** `201` / `400` / `401` / `403`  
- **envelope success code:** `XBOS-AUTH-201` (matches Nest controller `ok(..., 'XBOS-AUTH-201', ...)`)

### Components (G-DTO-01 folded)

| Schema | Maps to |
|--------|---------|
| `SelectMembershipRequest` | `SelectMembershipDto.tenantId` |
| `AccessibleTenantMembership` | `AccessibleTenant` (`tenant-scope.service.ts`) |
| `SelectMembershipData` | return of `AuthService.selectMembership` |

### Version bump

`info.version`: `1.2.0-p1-s2` → `1.2.1-p1-s2` (+ G-OA-02 note in description).

### Files touched

| Path | Change |
|------|--------|
| `docs/api/openapi/xbos-api.yaml` | ADD path + 3 schemas + version note |
| `docs/qa/evidence/be-xbos-oa-select-membership-01-20260722.md` | this evidence |

**Not touched:** `apps/**`, seed, OA-03 shareholders, OA-04 documents, portal FE.

---

## 4. Verify

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 docs/api/openapi/xbos-api.yaml
exit 0
```

Grep confirmation (yaml):

- `operationId: xbosAuthSelectMembership`
- `/auth/select-membership`
- `SelectMembershipRequest` / `SelectMembershipData` / `AccessibleTenantMembership`

---

## 5. Residual

| Gap | Status | Follow-up |
|-----|--------|-----------|
| **G-OA-03** shareholders OpenAPI | OPEN | `BE-XBOS-OA-SHAREHOLDERS-01` (separate) |
| **G-OA-04** documents OpenAPI | OPEN | `BE-XBOS-OA-DOCUMENTS-01` (separate) |
| TechSpec §14.2 PARTIAL → CLOSED wording | optional SA/TM doc delta | not required for this yaml Task |
| G-DTO-02 (other CC DTOs) | defer | with OA-03/04 |

---

## 6. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/be-xbos-oa-select-membership-01-20260722.md`

### next_dispatch_prompt

```text
work_item_id: QA-XBOS-OA-SELECT-MEMBERSHIP-01
from_role: pm
to_role: qa
lane: execution
priority: P1

entry_criteria:
- BE-XBOS-OA-SELECT-MEMBERSHIP-01 READY_FOR_QA
- evidence: docs/qa/evidence/be-xbos-oa-select-membership-01-20260722.md
- OpenAPI: docs/api/openapi/xbos-api.yaml has POST /auth/select-membership + SelectMembership*

exit_criteria:
1. Confirm yaml contains operationId xbosAuthSelectMembership + SelectMembershipRequest/Data
2. pnpm verify:openapi-m01 exit 0
3. Spot-check runtime parity (read-only): auth.controller POST select-membership body tenantId; envelope XBOS-AUTH-201; 403 XBOS-AUTH-403 — no FE mutate, U65 no seed
4. must_keep UF-XBOS 🟢 — do not regress portal membership UX
5. Evidence docs/qa/evidence/qa-xbos-oa-select-membership-01-20260722.md → PASS_TO_PM
cấm: OA-03/04 scope creep · seed · claim Phase1/PROD · apps rewrite
```
