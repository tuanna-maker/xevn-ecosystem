# D-HRM-CO-INDUSTRY-SA-01 — Company «Ngành nghề» DB/API design (U71)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-CO-INDUSTRY-SA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **change_mode** | ADD |
| **date** | 2026-07-27 (ICT) |
| **ack_status** | **PASS_TO_PM** |
| **U65** | No seed · **no `apps/**`** |
| **U71** | TechSpec + **DB_DESIGN** + **API_DESIGN** slices delivered |

## Defect (confirmed)

| Layer | Finding |
|-------|---------|
| Symptom | UI «Ngành nghề» shows raw `subsidiary` |
| Root | Prior FE map `industry ← member.entity_type` (tenant-scope mapper) |
| Correct SoT | `xbos_legal_entity.business_lines` (+ `payload.companyForm.industry` fallback) |
| Orthogonal | `entity_type` = loại ĐVTV only (`holding` / `subsidiary`) + VI dictionary if shown separately |

## Inputs read

| Artifact | Use |
|----------|-----|
| `docs/hrm/SRS.md` UC-HRM-CO-01 | List + profile Data Interaction · sequence group-member-units |
| `docs/hrm/TECHSPEC.md` §19 | Plane A/B pattern (reuse; do not mix with industry) |
| `apps/api/xbos-api` `listGroupMemberUnits` / upsert LE | SELECT thin vs `business_lines` column exists |
| `apps/web/hrm` `tenantScopeApi.ts` + `CompanyManagement` | Defect + parallel FE helpers / catalog keys |
| `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` | U71 / dual-plane discipline |
| `.cursor/rules/spec-db-api-design-gate.mdc` | Mục đích · Nghiệp vụ · Bước SRS |

## Delivered

| # | Path | Content |
|---|------|---------|
| 1 | `docs/hrm/TECHSPEC.md` **§20** | Field mapping UI←API←DB; catalog VI; entity_type dict; FE bind **cấm** industry←entity_type; BE residual |
| 2 | `docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md` | `xbos_legal_entity` columns: `entity_type`, `business_lines`, meaning, `ref_srs` |
| 3 | `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md` | `group-member-units` + `legal-entities`: Mục đích · Nghiệp vụ · Bước SRS · label rules · FE MUST/MUST NOT |
| 4 | This evidence | Handoff |

## Architecture decision

| Option | Verdict |
|--------|---------|
| **A** — SoT industry = `business_lines` (+ form fallback); entity_type separate | **SELECT** |
| B — Derive industry from `entity_type` | **Reject** — root cause of defect |
| C — New industry catalog table now | Defer — FE/i18n keys sufficient for Phase1 |

**List paint:** Prefer BE ADD `business_lines` on `listGroupMemberUnits` **or** mandatory legal-entities enrich (API_DESIGN §1 residual).

## Verification (docs)

- [x] TECHSPEC §20 mapping table present
- [x] DB_DESIGN slice with `ref_srs` on `entity_type` + `business_lines`
- [x] API_DESIGN each endpoint has Mục đích + Nghiệp vụ + Bước SRS
- [x] Explicit FE rule: industry ← business_lines; cấm ← entity_type
- [x] No `apps/**` edits

## Residual → PM dispatch

| Item | Owner | Note |
|------|-------|------|
| FE bind fix / regression test (if not already merged) | `dev-fe` | `industry ↚ entity_type`; VI catalog; blocklist |
| Optional BE: SELECT `business_lines` on group-member-units | `dev-be` | Close thin-list gap (Option A) |
| QA UF-HRM-CO-IND browser | `qa` | Evidence template in API_DESIGN §5; U65 |
| BA optional: AC-CO-IND row in SRS Data Interaction | `ba-process` | Explicit «Ngành nghề» AC if sponsor wants matrix row |

## Handoff

```yaml
work_item_id: D-HRM-CO-INDUSTRY-SA-01
from_role: sa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/sa-hrm-co-industry-design-01-20260727.md
completion_report: |
  Closed: ADD TECHSPEC §20 + DB_DESIGN_HRM_COMPANY_DISPLAY + API_DESIGN_HRM_COMPANY_LIST.
  Locked: UI «Ngành nghề» ← business_lines (VI label); entity_type = loại ĐVTV only.
  Residual: FE/BE execution + QA UF; optional BA AC-CO-IND.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: D-HRM-CO-INDUSTRY-FE-01 (or retest if FE already landed)
  from_role: pm
  to_role: dev-fe
  read_first:
    - docs/hrm/TECHSPEC.md §20
    - docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md
    - docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md
    - docs/qa/evidence/sa-hrm-co-industry-design-01-20260727.md
  entry_criteria: U71 design PASS; U65 zero-seed
  exit_criteria: |
    CompanyManagement «Ngành nghề» never shows subsidiary/holding;
    industry from business_lines / companyForm with VI map;
    vitest covers resolveIndustryDisplay + mapper regression;
    READY_FOR_QA UF-HRM-CO-IND
  evidence_path: docs/qa/evidence/fe-hrm-co-industry-01-20260727.md
  parallel_optional: D-HRM-CO-INDUSTRY-BE-01 — ADD le.business_lines to listGroupMemberUnits SELECT
```
