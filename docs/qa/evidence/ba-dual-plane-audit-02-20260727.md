# BA-DUAL-PLANE-AUDIT-02 — Dual-plane residual audit (outside Company headcount)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-DUAL-PLANE-AUDIT-02` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance · reclaim Claude LANE B |
| **date** | 2026-07-27 (ICT) |
| **change_mode** | ADD |
| **no_prompt_echo** | true |
| **ack_status** | **PASS_TO_PM** |
| **U65** | No seed · no `apps/**` · no Phase1 claim |
| **must_keep** | CO-HC / Company NV GWC **CLOSED** — do not reopen |

---

## 0. Scope & read_first ack

| Artifact | Use |
|----------|-----|
| `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` | Control SoT — **§6 ADD** this wave |
| CO-HC evidence / GWC (`*hrm-co-emp*`, `*u71-hrm-co-hc*`) | Closed — cited only as boundary |
| `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` | `main`↔`holding` · five-slug rollup |
| `ADR-HRM-RBAC-SCOPE-LADDER.md` §4 | slug vs holding vs `company_uuid` |
| `docs/hrm/DB_DESIGN_*` + `docs/xbos/DB_DESIGN_*` / API_DESIGN | Physical key planes |
| `HRM_XBOS_PRODUCT_INTEGRITY_PROGRAM.md` G-INT-03 | 4 LE vs 5 slug residual |

**Out of scope:** Reopen Company headcount / industry GWC · seed · Phase1 DONE · product code.

---

## 1. Normative planes (summary)

| Plane | Key | Workforce COUNT? |
|-------|-----|------------------|
| **A** LE UUID | `xbos_legal_entity.id` | **No** |
| **B** OU slug | `holding`…`services` (+ JWT `main` rollup) | **Yes** (TEXT spine) |
| **B′** Pilot UUID | `HRM_COMPANY_UUID_BY_SLUG` | Only via map (mobile / OP / MD) |
| **C** Alias | `main`↔`holding` helpers | Catalog/KPI/legal-read only |

---

## 2. Residual risk matrix (OUTSIDE CO-HC)

| # | Screen / API | Key plane used | Risk | Severity | Owner |
|---|--------------|----------------|------|----------|-------|
| 1 | HRM Operations + OP-04 summary | B′ UUID persist; wire B; aggregate cites TEXT modules | LE UUID ≠ map UUID → empty/0; silent undercount | **P1** | dev-be |
| 2 | HRM Metadata `employee_metadata_*` | B′ UUID + slug→UUID (`G-MD-PLANE-01`) | LE UUID mutate/list miss | **P1** | dev-be |
| 3 | BR-INT-05 / G-INT-03 Plane A | A (4 member LE) ↔ B (5 slugs) | Interim name-order; PROD drift | **P1** | sa |
| 4 | Mobile attendance `company_uuid` | B′ body + JWT | LE as body → 409; portal without claim | **P1** | qa (+ mobile if FAIL) |
| 5 | XBOS Infra `appliesToCompanyIds` | Often A entity id | Scope ≠ operating → wrong field visibility | **P1** | sa → dev-fe |
| 6 | Employees company column / OU filter | Display A via B bridge | Local AC-EMP-COL PASS; :8088 HOLD | **Info** | devops (unlock) |
| 7 | Dashboard charts `G-INT-02` | B labels | Khối* residual | **P2** | dev-fe |
| 8 | Fleet (TEXT) vs Operations (UUID) | B vs B′ | Copy-paste wrong helper | **P2** | tm / on-touch |
| 9 | XBOS RACI path `{companyId}` | A or B → resolve TEXT | FE regress → 409 | **Info** | qa on-touch |
| 10 | WF / Catalog / KPI companyId | B / holding — MUST NOT LE | Documented anti-pattern | **Info** | — |
| 11 | G-SCOPE-01 list↔get | module | Standing P0 on-touch (not new) | **P0 standing** | program |

**Closed (boundary):** Company Management NV / `by_company` slug-only · industry dictionary.

---

## 3. Prioritized Dev / SA backlog

| Priority | work_item_id | Role | Exit (one line) |
|----------|--------------|------|-----------------|
| P1 | `D-HRM-OP-DUAL-PLANE-GUARD-01` | dev-be | Anti-join LE UUID on OP persist/list; OP-04 plane-mix documented + jest |
| P1 | `D-HRM-MD-DUAL-PLANE-GUARD-01` | dev-be | Same anti-LE for metadata; CODE-MEMORY G-MD-PLANE-01 |
| P1 | `SA-G-INT-03-PLANE-A-BRIDGE-01` | sa | PROD lock 4 LE↔5 slug (or explicit 5th); replace interim name-order |
| P1 | `QA-HRM-MOB-UUID-PLANE-01` | qa | Body UUID = JWT `company_uuid` ≠ LE; LE → 409 |
| P1 | `SA-XBOS-INF-SCOPE-KEY-PLANE-01` | sa | Normative plane for foundation scope keys + FE AC |
| P2 | `D-HRM-G-INT-02-CHART-LABEL-01` | dev-fe | Chart LE/ĐVTV labels; 0 Khối* |
| P2 | `G-OP-PLANE-01` / `G-MD-PLANE-01` | dev-be | Optional UUID→TEXT migrate — defer |

---

## 4. DATA_LINKAGE update

| Path | Change |
|------|--------|
| `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` | **ADD §6** — planes table · residual matrix · backlog · QA checklist |

---

## 5. Traceability (sample rows)

| Concern | Spec / ADR | DB / API | FE / journey | Test expectation |
|---------|------------|----------|--------------|------------------|
| OP company key | TECHSPEC OP · `DB_DESIGN_HRM_OPERATIONS` | UUID + `resolveHrmOperationsPersistCompanyId` | Operations list/summary | LE UUID ∉ map → not fake 0 success |
| Metadata company key | `DB_DESIGN_HRM_W2_SLICE` C | UUID + `resolveHrmCompanyUuidForSlug` | Metadata queue | Same anti-LE |
| Mobile attendance | ADR ladder §4 · VAL-SCOPE-05/06 | `companyScopeMatches` | J-MOB / M-02 | UUID body = claim |
| Bridge cardinality | BR-INT-05 · G-INT-03 | `company_slug_map` | Company/Employees labels | Documented 4≠5 until SA lock |
| Infra foundation scope | UC-XBOS-INF-01/03 · META matrix | `appliesToCompanyIds` | Foundation wizard | Key plane explicit in AC |
| CO-HC (closed) | UC-HRM-CO-01 · §19 | `employees/summary.by_company` | J-HRM-CO-01 | **Do not retest as open** |

---

## 6. Verdict

| Item | Result |
|------|--------|
| Exit criteria 1 — residual matrix outside CO-HC | **PASS** (§2) |
| Exit criteria 2 — DATA_LINKAGE / linked matrix | **PASS** (§6 ADD) |
| Exit criteria 3 — prioritized work_item_ids | **PASS** (§3 — P1 present) |
| Exit criteria 4 — this evidence → PASS_TO_PM | **PASS** |
| New P0 product defect found | **No** (only standing G-SCOPE-01 on-touch) |
| Top dispatch | **P1** `D-HRM-OP-DUAL-PLANE-GUARD-01` |

---

## completion_report

**Closed:** Dual-plane audit outside Company headcount — planes A/B/B′/C locked; residual matrix 11 rows; DATA_LINKAGE §6 ADD; P1 backlog IDs for OP/MD guards, SA bridge, mobile UUID QA, infra scope keys; CO-HC GWC not reopened; no seed/apps.

**Residual:** P1 Dev/SA/QA WIs above; P2 chart + optional UUID→TEXT migrate; G-SCOPE-01 standing program gap; EMP-COL :8088 HOLD Info.

### next_owner

`pm` → Task **`dev-be`** `D-HRM-OP-DUAL-PLANE-GUARD-01` (top P1)

### next_dispatch_prompt

```text
work_item_id: D-HRM-OP-DUAL-PLANE-GUARD-01
role: dev-be
lane: execution
change_mode: ADD
entry_criteria: BA-DUAL-PLANE-AUDIT-02 PASS_TO_PM — read docs/qa/evidence/ba-dual-plane-audit-02-20260727.md §2#1 + docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md §6; docs/hrm/DB_DESIGN_HRM_OPERATIONS.md; API_DESIGN_HRM_OPERATIONS; ADR-HRM-RBAC-SCOPE-LADDER §4 company_uuid vs LE.
read_first:
  - docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md §6
  - docs/hrm/DB_DESIGN_HRM_OPERATIONS.md (B′ UUID plane)
  - docs/qa/evidence/ba-dual-plane-audit-02-20260727.md
must_keep: CO-HC summary/by_company GWC; Fleet TEXT company_id; resolveHrmListScope TEXT siblings; U65 no seed
forbidden_paths: apps outside operations/tasks + service_requests + shared company UUID map helpers; reopen Company headcount FE
exit_criteria:
  1) Persist/list reject or fail-closed when company_id is XBOS LE UUID not in HRM_COMPANY_UUID_BY_SLUG
  2) Slug → map UUID path unchanged for happy path
  3) OP-04 summary documents UUID vs TEXT module mix in CODE-MEMORY; no silent fake 0 from LE
  4) Jest anti-join LE UUID + happy slug; evidence docs/qa/evidence/be-hrm-op-dual-plane-guard-01-20260727.md READY_FOR_QA
  5) spec_read_ack + CODE-MEMORY APPEND
parallel_ok_after: D-HRM-MD-DUAL-PLANE-GUARD-01 (metadata same pattern) · SA-G-INT-03-PLANE-A-BRIDGE-01 (governance)
```

### evidence_path

`docs/qa/evidence/ba-dual-plane-audit-02-20260727.md`

### ack_status

**PASS_TO_PM**
