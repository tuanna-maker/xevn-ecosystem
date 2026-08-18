# TM-HRM-CODE-SPEC-CONVENTION-W2D-01 — W2d boundary hygiene + Dev entry

| Field | Value |
|-------|-------|
| **work_item_id** | `TM-HRM-CODE-SPEC-CONVENTION-W2D-01` |
| **from_role** | pm |
| **to_role** | technical-manager |
| **lane** | governance |
| **priority** | P1 |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** |
| **change_mode** | Audit-only — **cấm** `apps/**` · wipe SRS/TechSpec · seed · Phase1/PROD · claim 120 UC |
| **code_allowed** | **false** until Sponsor confirm |
| **entry** | `docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-03-20260722.md` (GWC · 52 FR) |
| **sa_ref** | `docs/qa/evidence/sa-hrm-techspec-ref-srs-w2d-01-20260722.md` |
| **techspec** | `docs/hrm/TECHSPEC.md` §15 · §16.5 · §16.9 |
| **khách** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` v3.0-W2d (§3.45–3.52) |
| **must_keep** | AC-ATT-SHEET-01..06 · 44 Cao FR W1–W2c |

---

## 1. Executive technical assessment

W2d `ref_srs` (§16.5, 8 FR) is **usable as Dev backlog SoT**. Boundary hygiene on modules **operations / fleet / decisions / health / bootstrap** is **mostly PASS** against TechSpec §15.1 (typed DTOs at mutate edges, envelopes, scope resolvers, no prod `any` in those modules).

**Product P1 gaps are clear and owned** (not convention FAIL):

| Gap | Sev | Nature | TM confirm |
|-----|-----|--------|------------|
| **G-DEC-01** | P1 | Product density/fidelity (AC-DEC-DENSITY + create→list→F5 U65) | **OPEN — Dev entry READY** (gated `code_allowed`) |
| **G-BOOT-01** | P1 VERIFY | No hardcode tenant/company on business mutate; env SoT §6.1 | **OPEN — Dev entry READY** (VERIFY grep + env) |

**P2** G-OP-01/02/04 remain backlog (assignee/filters/FE summary) — do **not** block TM convention GWC.

**Not claimed:** Phase 1 DONE · PROD-READY · 120 UC body_ready · UF 🟢 bulk.

---

## 2. §15.1 Boundary hygiene — W2d modules

| Rule | Result | Evidence |
|------|--------|----------|
| **No `any` (prod)** | **PASS** | Grep `operations|fleet|decisions`: zero `: any` / `as any` in module `.ts` (specs may use `Record`/`expect.any`). |
| **DTO at edge** | **PASS** (W2d mutate) | `CreateTaskDto`, `UpdateTaskStatusDto`, `CreateDecisionDto` (+ list/update decision DTOs) — class-validator. List: `ListTasksQueryDto`. Fleet FR is GET-only (query params + scope). Health: no body. |
| **Product field PARTIAL ≠ missing DTO** | **Note** | G-OP-01/02 = missing optional fields/filters on DTO — **P2 product**, not C-CONV sheets-style untyped body. |
| **Envelope §5** | **PASS** | `HRM-OPS-201/200/202`, `HRM-FLEET-200`, `HRM-DEC-200/201`, `HRM-HEALTH-200` via `ok()` + auth `ApiException`. |
| **Scope** | **PASS pattern** | Fleet: `resolveScopeContext` + `resolveHrmListScope`. Operations/decisions: scope context + persist helpers. |
| **Empty honesty** | **PASS (must_keep)** | Decisions i18n `decisions.noData` = «Không có quyết định nào» (live-empty OK). AC-ATT-SHEET path **not reopened** — sheets already `CreateAttendanceSheetDto` (C-CONV-AS-01 closed in code). |
| **CODE-MEMORY** | **GWC Condition** | **No** `@CODE-MEMORY` / `ref_srs` in `operations|fleet|decisions` trees — **C-CONV-W2D-CM-01**: add/append when Dev touches file (after sponsor). |
| **Bootstrap env SoT** | **PASS** | `tenant-scope-env.ts`: `MASTER_TENANT_ID`/`DEFAULT_TENANT_ID` · `DEFAULT_COMPANY_ID`/`DEFAULT_COMPANY_HEADER_ID` — empty string if unset (no silent fake ĐV). Catalog-sync uses helpers. |
| **Anti-seed U65** | **PASS (policy)** | TM does not authorize seed for FR PASS. |

### 2.1 Module rollup vs §16.5

| Module | FR | Convention | Residual |
|--------|-----|------------|----------|
| **operations** | OP-01..04 | DTO+envelope PASS | G-OP-01/02 P2 fields; G-OP-04 FE P2 |
| **fleet** | FL-01 | List+scope PASS | G-FL-01 Info (no get-by-id — non-goal if list-only) |
| **decisions** | FR-27 | API CRUD+DTO PASS | **G-DEC-01 P1** density |
| **health** | FR-01 | `GET /api/hrm` → `HRM-HEALTH-200` ALIGNED | — |
| **bootstrap** | BOOT-01 | env helpers ALIGNED SoT | **G-BOOT-01 P1 VERIFY** hardcode residual |

---

## 3. Sample `spec_read_ack` (copy into Dev evidence before code)

### 3.1 operations (OP-01..04)

```markdown
## spec_read_ack
- srs: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.45–3.48 FR-HRM-OP-01..04
- tech_spec: docs/hrm/TECHSPEC.md §16.5 #45–#48 · §16.9 G-OP-01/02/04 · §15.1
- team: docs/hrm/SRS.md (ops menu) · envelope note HRM-OP-* ≠ HRM-OPS-*
- uc_ids: HRM-OP-01 · HRM-OP-02 · HRM-OP-03 · HRM-OP-04
- change_mode: ADD
- must_keep: AC-ATT-SHEET-01..06 · 44 Cao · U65 no-seed · empty 200 honesty
- forbidden_paths: wipe SRS/TechSpec · seed for UF evidence · Phase1/PROD claim
- sponsor_confirm: required before code_allowed=true
```

### 3.2 fleet (FL-01)

```markdown
## spec_read_ack
- srs: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.49 FR-HRM-FL-01
- tech_spec: docs/hrm/TECHSPEC.md §16.5 #49 · §16.9 G-FL-01 · §15.1
- uc_ids: HRM-FL-01
- change_mode: ADD
- must_keep: list/empty honesty · scope parity · no cross-ĐV leak · AC-ATT-SHEET untouched
- forbidden_paths: invent GET …/vehicles/:id unless FR updated (G-FL-01 Info non-goal)
- sponsor_confirm: required before code_allowed=true
```

### 3.3 decisions (FR-HRM-27 / UC-HRM-27)

```markdown
## spec_read_ack
- srs: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.50 FR-HRM-27
- team_srs: docs/hrm/SRS.md UC-HRM-27 · SPEC-GAP-HRM-DEC-01 · AC-DEC-DENSITY · AC-DEC-01..04
- tech_spec: docs/hrm/TECHSPEC.md §16.5 #50 · §16.9 G-DEC-01 · decisions Implemented-empty note
- uc_ids: UC-HRM-27 / FR-HRM-27
- change_mode: ADD (density/fidelity — API CRUD already present)
- must_keep: live-empty «Không có quyết định nào» · cấm copy «chưa triển khai» · AC-ATT-SHEET · 44 Cao
- forbidden_paths: seed decisions to fake density · claim UC DONE without AC-DEC-DENSITY
- sponsor_confirm: required before code_allowed=true
```

### 3.4 health (FR-HRM-01)

```markdown
## spec_read_ack
- srs: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.51 FR-HRM-01
- tech_spec: docs/hrm/TECHSPEC.md §16.5 #51 · AppController GET /api/hrm
- uc_ids: UC-HRM-01 / FR-HRM-01
- change_mode: ADD (verify-only unless regression)
- must_keep: HRM-HEALTH-200 envelope · no business mutate on health
- sponsor_confirm: N/A for read-only verify
```

### 3.5 bootstrap (FR-HRM-BOOT-01 / BR-HRM-08)

```markdown
## spec_read_ack
- srs: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.52 FR-HRM-BOOT-01
- tech_spec: docs/hrm/TECHSPEC.md §6.1 · §16.5 #52 · §16.9 G-BOOT-01
- code_sot: apps/api/hrm-api/src/common/tenant-scope-env.ts
- uc_ids / br: BR-HRM-08 / FR-HRM-BOOT-01
- change_mode: ADD (VERIFY — env SoT; remove/relocate hardcode if found on mutate path)
- must_keep: request JWT / x-tenant-id / x-company-id remain SoT for API · env only DDL/bootstrap defaults · U65 no-seed
- forbidden_paths: hardcode one ĐV in customer-facing mutate · wipe scope ladder ADR
- sponsor_confirm: required before code_allowed=true
```

---

## 4. Dev entry criteria — G-DEC-01 + G-BOOT-01 (TM confirm)

### 4.1 G-DEC-01 — **CLEAR P1** · owner `dev-fe` (+ QA after)

| Criterion | Status |
|-----------|--------|
| Skeleton GWC + §16.5 #50 | Met (QC gate-03 + SA W2d) |
| Spec says | Empty honesty OK; density/fidelity **not** DONE until AC-DEC-DENSITY + H-DEC-CREATE browser U65 |
| Code does | REST CRUD + DTO + RQ hook + empty «Không có quyết định nào» |
| Gap class | Product UX/density — **not** missing API |
| Entry artifacts | QC gate-03 · TechSpec §16.5/§16.9 · team SRS UC-27 · sample `spec_read_ack` §3.3 |
| Exit | create→list→F5 U65; no «chưa triển khai»; regression không đụng AT-14/AC-ATT-SHEET; `READY_FOR_QA` |
| **code_allowed** | **false** until Sponsor |

### 4.2 G-BOOT-01 — **CLEAR P1 VERIFY** · owner `dev-be` (+ TM spot)

| Criterion | Status |
|-----------|--------|
| Env SoT | `tenant-scope-env.ts` returns '' if unset — **PASS pattern** |
| Residual risk | `MASTER_TENANT_ID = 'xevn'` constant in `hrm-list-scope.ts` / `scope-context.ts` — pilot registry slug; VERIFY must prove **business mutate** does not ignore JWT/header and force a single company |
| Entry job | Grep mutate paths for literal tenant/company bypass of `resolveScopeContext` / persist helpers; document allow-list constants vs violations; fix only confirmed violations |
| Exit | Evidence table: path · literal · verdict (OK constant vs FAIL hardcode); jest/smoke if fix; `READY_FOR_QA` or `PASS_TO_PM` if VERIFY clean |
| **code_allowed** | **false** until Sponsor (VERIFY-only docs/grep may proceed as governance if PM asks; **no** product mutate without confirm) |

### 4.3 Dispatch decision (this wave)

| Option | Verdict |
|--------|---------|
| A — TM opens Dev now despite `code_allowed false` | **REJECT** |
| B — PASS_TO_PM with copy-ready Dev prompts; PM waits Sponsor then Task | **SELECT** |
| C — Also open P2 G-OP-* now | Defer — not P0/P1 clear priority for this packet |

**next_dispatch Dev:** **only after** Sponsor `code_allowed` (or explicit «bật Dev G-DEC/G-BOOT»). Gaps themselves are **clear** — no BA/SA blocker.

---

## 5. Risk register

| ID | Risk | Sev | Mitigation |
|----|------|-----|------------|
| G-DEC-01 | UC-27 claimed DONE on empty-only | P1 | Dev FE density + QA U65; BR-DEC-06 lock |
| G-BOOT-01 | Multi-ĐV mutate pinned to one unit | P1 VERIFY | Grep + fix violate paths; keep env SoT |
| C-CONV-W2D-CM-01 | W2d modules lack CODE-MEMORY | P2 convention | Mandatory on first Dev touch |
| G-OP-* | Assignee/filters/summary FE lag SRS | P2 | Backlog after P1 |
| C-SKEL-02 | Premature Phase1/120 claim | Standing | PM/QC standing condition |

---

## 6. Gate plan

| Gate | Decision |
|------|----------|
| TM convention W2d | **GO WITH CONDITIONS** |
| Phase 1 DONE | **NO** |
| PROD | **NO-GO** (out of scope) |
| 120 UC | **NOT** claimed |
| Dev code start | **Blocked** until Sponsor `code_allowed` |

### Conditions

| Cond | work_item_id | Owner | Exit |
|------|--------------|-------|------|
| C1 | `FE-HRM-G-DEC-01-DENSITY-01` | `dev-fe` → `qa` | AC-DEC-DENSITY + create→list→F5 U65; no «chưa triển khai» |
| C2 | `BE-HRM-G-BOOT-01-VERIFY-01` | `dev-be` (+ TM spot) | Grep mutate hardcode; env SoT §6.1; evidence table |
| C3 | `C-CONV-W2D-CM-01` | `dev-*` on touch | `@CODE-MEMORY` + `ref_srs` on first edit of operations/fleet/decisions |
| C4 | `C-SKEL-02` | `pm` | Standing — no Phase1/PROD/120 claim |

---

## 7. Micro-checklist

1. [x] Boundary hygiene + sample `spec_read_ack` for operations/fleet/decisions/health/bootstrap  
2. [x] Confirm Dev entry for **G-DEC-01** + **G-BOOT-01** (clear P1; gated sponsor)  
3. [x] Evidence this file  
4. [x] **PASS_TO_PM** — NOT Phase1/PROD/120  
5. [x] next_dispatch Dev prompts prepared — **execute only after** Sponsor `code_allowed`

---

## 8. completion_report

**Closed:** TM W2d convention audit vs §15.1/§16.5; sample `spec_read_ack` ×5 modules; Dev entry criteria confirmed for G-DEC-01 + G-BOOT-01; must_keep AC-ATT-SHEET + 44 Cao; no `apps/**` / seed / wipe.

**Residual:** C1–C4 above; G-OP-* P2 backlog; code_allowed=false until Sponsor.

**Not claimed:** Phase 1 DONE · PROD · 120 UC · convention 100% (CODE-MEMORY Condition).

---

## 9. Handoff

- **next_owner:** `pm` (Sponsor gate → then `dev-fe` / `dev-be`)
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/tm-hrm-code-spec-convention-w2d-01-20260722.md`

### next_dispatch_prompt (copy-ready) — after Sponsor code_allowed · G-DEC-01 first

```text
work_item_id: FE-HRM-G-DEC-01-DENSITY-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
residual_auto_fix: true
code_allowed: true (Sponsor confirmed)

## Entry
TM GWC: docs/qa/evidence/tm-hrm-code-spec-convention-w2d-01-20260722.md
QC: docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-03-20260722.md
TechSpec: docs/hrm/TECHSPEC.md §16.5 #50 · §16.9 G-DEC-01
Team SRS: docs/hrm/SRS.md UC-HRM-27 · AC-DEC-DENSITY · SPEC-GAP-HRM-DEC-01
Khách: docs/client-delivery/hrm/SRS_HRM_KHACH.md FR-HRM-27
Fill spec_read_ack from TM evidence §3.3 before code
cấm: seed · wipe AC-ATT-SHEET · «chưa triển khai» copy · Phase1/PROD · claim UC-27 DONE without density AC

## Job
1. Ensure create→list same session + F5 persists (H-DEC-CREATE)
2. Empty state stays live-empty honesty; never «chưa triển khai»
3. @CODE-MEMORY / CHANGE on touched FE files + ref_srs FR-HRM-27
4. Evidence: docs/qa/evidence/fe-hrm-g-dec-01-density-01-YYYYMMDD.md
5. ack_status READY_FOR_QA — U65 browser ceo@xe.vn /decisions

entry_criteria: TM W2d evidence + Sponsor code_allowed
exit_criteria: AC-DEC-DENSITY path green locally; handoff complete; READY_FOR_QA
```

### next_dispatch_prompt (copy-ready) — parallel/after · G-BOOT-01 VERIFY

```text
work_item_id: BE-HRM-G-BOOT-01-VERIFY-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
code_allowed: true (Sponsor confirmed)

## Entry
TM: docs/qa/evidence/tm-hrm-code-spec-convention-w2d-01-20260722.md §4.2
TechSpec §6.1 · §16.5 #52 · §16.9 G-BOOT-01
SoT: apps/api/hrm-api/src/common/tenant-scope-env.ts
Fill spec_read_ack TM §3.5
cấm: seed · wipe scope ADR · hardcode one ĐV on mutate · Phase1/PROD

## Job
1. Grep business mutate for literal tenant/company bypassing resolveScopeContext / persist helpers
2. Classify: OK pilot constant (MASTER_TENANT_ID registry) vs FAIL hardcode
3. Fix only FAIL paths; keep env SoT for DDL/bootstrap
4. @CODE-MEMORY CHANGE on touched files
5. Evidence: docs/qa/evidence/be-hrm-g-boot-01-verify-01-YYYYMMDD.md
6. READY_FOR_QA or PASS_TO_PM if VERIFY clean with zero FAIL

entry_criteria: TM W2d + Sponsor code_allowed
exit_criteria: evidence table complete; no FAIL hardcode residual OR fixed+tested
```

### pm_dispatch_hint

W2d convention **GWC**. Do **not** claim Phase1/PROD/120. Ask Sponsor for `code_allowed` then Task **FE-HRM-G-DEC-01-DENSITY-01** (+ optional parallel **BE-HRM-G-BOOT-01-VERIFY-01**). Defer G-OP-* P2.
