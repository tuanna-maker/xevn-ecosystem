# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | **ADD** |
| **sponsor_confirm** | Option B · DATA-01 · API-01 CONFIRMED 2026-08-07 |
| **honesty** | `contracts_printable_ready=false` — **no** UAT flip · no Phase1 DONE |
| **must_keep** | UF-HRM-02 · print-spine · soft-delete · XBOS legal-body · U65 · DYNAMIC-LOCK |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| DATA-01 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` §3 `hrm_merge_tokens` · **§5.2 resolve** |
| API-01 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md` F-PLT-TOK-01..03 · §4 PREV/VER deepen |
| ADR | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` L1–L7 · Option B |
| XEVN-TPL CORR | omit closed `CHK code IN (8)` / API reject 9th — **not reintroduced** |
| API evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-api-01.md` |

---

## 2. Deliverable (apps)

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/merge-tokens/merge-token.constants.ts` | CHK sets · HRM-PLT-* · builtins (starter ≠ ceiling) |
| `apps/api/hrm-api/src/merge-tokens/merge-token.resolver.ts` | Shared **IMergeToken** resolve §5.2 |
| `apps/api/hrm-api/src/merge-tokens/merge-tokens.service.ts` | ensureSchema + F-PLT-TOK CRUD/retire/resolve-preview |
| `apps/api/hrm-api/src/merge-tokens/merge-tokens.controller.ts` | `/api/hrm/merge-tokens` |
| `apps/api/hrm-api/src/merge-tokens/dto/merge-tokens.dto.ts` | F.1 DTOs |
| `apps/api/hrm-api/src/merge-tokens/*.spec.ts` | resolve order + scope_parity |
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts` | PREV/VER wire shared resolver |
| `apps/api/hrm-api/src/app.module.ts` | Register controller + provider |

**Cấm / not done:** seed for UF evidence · hard-delete · closed `token_key IN (N)` · reintroduce `chk_hrm_ctr_tpl_xevn_code` · flip printable.

---

## 3. Schema (DATA §3)

- `CREATE TABLE IF NOT EXISTS public.hrm_merge_tokens` (+ UQ partial active · IX domain/status/ring/origin · CHK ring/status/origin/domain/key_format)
- **FORBIDDEN** verified in jest: no `token_key IN (` · no XEVN closed code CHECK in this ensureSchema

---

## 4. API surface

| F-id | METHOD / path |
|------|----------------|
| F-PLT-TOK-01 | `GET /api/hrm/merge-tokens` · `GET …/:tokenId` |
| F-PLT-TOK-02 | `POST` · `PUT` upsert · `PATCH …/:tokenId` · `POST …/:tokenId/retire` |
| F-PLT-TOK-03 | `POST /api/hrm/merge-tokens/resolve-preview` |
| F-CORE-CTR-PREV/VER | Same paths; merge step → `resolveMergeTokens` (registry wins / empty→keyword_map) |

---

## 5. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns=merge-token --no-coverage
→ Test Suites: 2 passed · Tests: 12 passed

pnpm --filter hrm-api exec jest --testPathPatterns=contract-legal-print.service.spec --no-coverage
→ Test Suites: 1 passed · Tests: 17 passed (print-spine regression)
```

Coverage includes:
- VAL-PLT-TOK-01 registry wins
- VAL-PLT-TOK-02 empty registry → keyword_map
- VAL-PLT-TOK-03 brace normalize
- VAL-PLT-TOK-04 `#token#` reject
- VAL-PLT-TOK-05 cb mask
- issued snapshot short-circuit
- U19 list↔get scope_parity (group CEO main→holding)
- ensureSchema open catalog (no closed enum)
- resolvePreview empty registry path

---

## 6. Honesty

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| U65 seed in evidence | **none** |
| Phase1 / module UAT flip | **none** |

---

## 7. completion_report

**Closed:** ensureSchema `hrm_merge_tokens` + Nest F-PLT-TOK-01..03 under `/api/hrm/merge-tokens`; shared `resolveMergeTokens` §5.2; PREV/VER wired (empty registry → keyword_map); soft-delete retire; jest resolve + scope_parity 12 PASS; print-spine 17 PASS; FORBIDDEN closed XEVN/token enum; `@CODE-MEMORY`; honesty false.

**Residual:** EMP extension-item → TOK-02 same-txn hook (R-PLT-API-01); FE token picker for AC-PLT-CTR-05 browser; holding publish tokens GĐ1.5.

**next_owner:** **qa** — AC-PLT-CTR-05 smoke (browser after FE) or BE-only L1 probe secondary.

---

## 8. next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
entry_criteria: BE-01 READY_FOR_QA · U65 zero-seed · browser-only preferred
read_first:
  - docs/qa/evidence/po-hrm-dynamic-config-platform-be-01.md
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md F-PLT-TOK · AC-PLT-CTR-05
task:
  - If FE token picker not ready: L1 secondary only — GET /api/hrm/merge-tokens?company_id=main empty 200; POST resolve-preview with template keyword_map (no seed claim UF)
  - When FE ready: AC-PLT-CTR-05 browser — register/upsert token → F5 list → PREV uses registry when present
  - Confirm no closed 9th template reject regression (DYNAMIC-LOCK)
  - Honesty: contracts_printable_ready=false
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-qa-01.md
must_keep: UF-HRM-02 · print-spine · soft-delete · U65 · DYNAMIC-LOCK
```

---

## 9. ack_status

**READY_FOR_QA**
