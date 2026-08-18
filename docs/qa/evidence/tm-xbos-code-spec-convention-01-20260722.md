# TM-XBOS-CODE-SPEC-CONVENTION-01 — XBOS §15 convention + G-OA backlog

| Field | Value |
|-------|-------|
| **work_item_id** | `TM-XBOS-CODE-SPEC-CONVENTION-01` |
| **from_role** | pm |
| **to_role** | technical-manager |
| **lane** | governance |
| **priority** | P2 |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** (convention packet locked; OpenAPI P1 backlog open) |
| **change_mode** | Docs-only ADD — **cấm** wipe UF-XBOS 🟢 · Phase1/PROD · claim 373 · `apps/**` rewrite · seed |
| **entry** | `docs/xbos/TECHSPEC.md` §14 · `SA-XBOS-TECHSPEC-REF-SRS-01` · `SRS_XBOS_KHACH.md` v1.0-W1-SPINE |
| **reuse** | `docs/hrm/TECHSPEC.md` §15 (`TM-HRM-CODE-SPEC-CONVENTION-01`) |

---

## 1. Executive technical assessment

W1 spine (§14, 12 FR) is **usable as Dev SoT**. TM published **§15** coding-convention packet for XBOS — **reuse HRM §15** with delta (envelope prefix, OpenAPI SoT, `ratioPercent` money exempt, scope helpers).

**G-OA-02..04** confirmed **OPEN P1 BE backlog**: runtime paths exist (`SelectMembershipDto`, CC P0 shareholders/documents); **`docs/api/openapi/xbos-api.yaml` has zero matches** for `select-membership` / `shareholders` / `/documents`.

**Not claimed:** Phase 1 DONE · PROD-READY · 373 FR · UF 🟢 wipe.

---

## 2. Micro-checklist

| # | Item | Status |
|---|------|--------|
| 1 | Short XBOS coding-convention packet (DTO/envelope/dates/scope/empty honesty) — reuse HRM §15 + delta | **DONE** — `docs/xbos/TECHSPEC.md` **§15** |
| 2 | Flag G-OA-02..04 as BE backlog with owners | **DONE** — §14.13 owner column + §3 below |
| 3 | Sample `spec_read_ack` for next Dev wave | **DONE** — §15.5 + §5 below |
| 4 | Evidence this file | **DONE** |
| 5 | PASS_TO_PM — NOT Phase1/PROD | **DONE** |

---

## 3. G-OA-02..04 — BE OpenAPI backlog (owners)

| Gap ID | FR | Problem | work_item_id | Owner | Exit criteria |
|--------|-----|---------|--------------|-------|---------------|
| **G-OA-02** | FR-XBOS-TENANT-01 | OpenAPI thiếu `POST /api/xbos/auth/select-membership` + `SelectMembership` schema | `BE-XBOS-OA-SELECT-MEMBERSHIP-01` | **dev-be** | Path + requestBody (`tenantId`) in `xbos-api.yaml`; `pnpm verify:openapi-m01` exit 0; G-DTO-01 gộp cùng PR |
| **G-OA-03** | FR-XBOS-ORG-03 | OpenAPI thiếu legal-entity documents + upload | `BE-XBOS-OA-LEGAL-DOCS-01` | **dev-be** | Operations mirror CC P0 runtime; components DTO (G-DTO-02); **must_keep** UF-XBOS-03/06 🟢; verify openapi-m01 |
| **G-OA-04** | FR-CC-P0-01 | OpenAPI thiếu shareholders CRUD | `BE-XBOS-OA-SHAREHOLDERS-01` | **dev-be** | GET/POST/PUT/DELETE shareholders + `XBOS-SHR-*` codes; **must_keep** UF-XBOS-04/05 🟢; verify openapi-m01 |

**Options:**  
A) Block Dev until all G-OA closed before any XBOS touch → over-blocks BM/WF lanes.  
B) **SELECT** — convention GO; dispatch OpenAPI sync as dedicated BE tickets (docs-only preferred; no product rewrite).  
C) Claim contract DONE without yaml → **reject**.

**Risk:** FE/contract consumers trust OpenAPI → silent drift on membership select / shareholder money fields. Mitigation = close G-OA before claiming M01 Org/Tenant contract complete.

**Spot-check (read-only):**

| Artifact | Observation |
|----------|-------------|
| `apps/api/xbos-api/src/auth/dto/select-membership.dto.ts` | class-validator `tenantId` — runtime OK |
| `auth.controller.ts` | `ok(..., 'XBOS-AUTH-200')` envelope pattern |
| `common/api-response.ts` + `http-exception.filter.ts` | `ok()` + `x-api-code` — aligns §5 / §15.1 |
| `docs/api/openapi/xbos-api.yaml` | **no** `select-membership` / `shareholders` / documents — G-OA open |

---

## 4. §15.1 boundary rules (summary)

| Rule | XBOS expectation |
|------|------------------|
| No `any` | W1 touch paths typed |
| DTO at edge | class-validator on mutate |
| Envelope | `XBOS-*` + `x-api-code` |
| Dates / money | ISO wire · vi-VN UI · plain money · exempt `ratioPercent` |
| Scope | list/get/mutate parity · 403/409 |
| Empty honesty | 200 empty ≠ ERROR |
| CODE-MEMORY | VI + `ref_srs` |
| U65 | no seed for UF |
| OpenAPI parity | runtime path ⇒ yaml operation |

Delta vs HRM: see TechSpec **§15.3**.

---

## 5. Sample `spec_read_ack` (copy-ready for Dev)

```markdown
## spec_read_ack
- srs: docs/client-delivery/xbos/SRS_XBOS_KHACH.md §3.2|§3.5|§3.6 · FR-XBOS-TENANT-01 | FR-XBOS-ORG-03 | FR-CC-P0-01 · v1.0-W1-SPINE
- tech_spec: docs/xbos/TECHSPEC.md §14.2|§14.5|§14.6 · §14.13 G-OA-02..04 · §15.1 · CC P0 docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md §2–4
- openapi_sot: docs/api/openapi/xbos-api.yaml
- uc_ids: UC-XBOS-TENANT-01 · UC-XBOS-ORG-03 · UC-CC-P0-01
- change_mode: ADD
- must_keep: UF-XBOS-03/04/05/06 🟢 · empty honesty · U65 no-seed · OpenAPI sync only (no behavior rewrite unless product gap ticket)
- forbidden_paths: seed scripts · wipe USER_FLOW_OPERABILITY_MATRIX · claim 373 / Phase1 / PROD
- sponsor_confirm: SA-XBOS-TECHSPEC-REF-SRS-01 · TM-XBOS-CODE-SPEC-CONVENTION-01
```

---

## 6. Gate plan

| Gate | Decision |
|------|----------|
| TM convention packet (§15) | **GO** |
| G-OA-02..04 contract complete | **NO** — Conditions / BE backlog |
| Phase 1 DONE | **NO** |
| PROD | **NO-GO** (out of scope) |
| Dev may sync OpenAPI | **Yes** under §15 + `spec_read_ack` |

### Conditions (fail-closed)

| Cond | work_item | Owner | Notes |
|------|-----------|-------|-------|
| C1 | `BE-XBOS-OA-SELECT-MEMBERSHIP-01` | dev-be | G-OA-02 + G-DTO-01 |
| C2 | `BE-XBOS-OA-LEGAL-DOCS-01` | dev-be | G-OA-03 + G-DTO-02 |
| C3 | `BE-XBOS-OA-SHAREHOLDERS-01` | dev-be | G-OA-04 |

Optional parallel: 1 Task gộp C1+C2+C3 nếu single OpenAPI PR (U69: prefer split if >20m).

---

## 7. Completion contract

### completion_report

**Closed:** XBOS TechSpec **§15** coding-convention packet (reuse HRM §15 + delta); §14.13 owners for G-OA-02..04; sample `spec_read_ack`; evidence this path.  
**Residual:** G-OA-02..04 OpenAPI P1 open (runtime OK); G-DTO-01/02 fold into OA tickets; G-SCOPE-01 on-touch; W2 reject FR defer BA.  
**Explicit non-claims:** NOT Phase1 DONE · NOT PROD · NOT 373 FR · no UF 🟢 wipe · no `apps/**` rewrite this wave.

### next_owner

`pm` → dispatch **`dev-be`** (OpenAPI sync wave)

### next_dispatch_prompt

```text
work_item_id: BE-XBOS-OA-SELECT-MEMBERSHIP-01
(parallel optional: BE-XBOS-OA-LEGAL-DOCS-01 · BE-XBOS-OA-SHAREHOLDERS-01)
from_role: pm
to_role: dev-be
lane: execution
priority: P1

entry_criteria:
- docs/xbos/TECHSPEC.md §14.13 G-OA-02..04 · §15.1 · §15.5 spec_read_ack
- docs/qa/evidence/tm-xbos-code-spec-convention-01-20260722.md
- docs/qa/evidence/sa-xbos-techspec-ref-srs-01-20260722.md
- runtime already has select-membership / shareholders / documents (CC P0)
- U65 no-seed · must_keep UF-XBOS-03..06 🟢

exit_criteria:
- Fill spec_read_ack before edit
- ADD operations + components to docs/api/openapi/xbos-api.yaml (no product behavior rewrite)
- G-DTO-01 gộp OA-02; G-DTO-02 gộp OA-03
- pnpm verify:openapi-m01 exit 0
- CODE-MEMORY CHANGE on touched Nest files only if code touch required for schema export — prefer yaml-only
- evidence_path: docs/qa/evidence/be-xbos-oa-select-membership-01-20260722.md (or combined be-xbos-oa-g-oa-02-04-20260722.md)
- ack_status: READY_FOR_QA (contract smoke) or PASS_TO_PM if docs-only verify
- cấm: wipe UF 🟢 · seed · claim Phase1/PROD/373 · broad apps/web rewrite
```

### evidence_path

`docs/qa/evidence/tm-xbos-code-spec-convention-01-20260722.md`

### ack_status

**PASS_TO_PM**
