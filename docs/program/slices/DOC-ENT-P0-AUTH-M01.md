# Slice — DOC-ENT-P0-AUTH-M01

| Field | Value |
| --- | --- |
| **Story** | DOC-ENT-P0-AUTH-M01 |
| **Epic / lane** | DOC-ENT P0 spine · foundation auth |
| **Owner** | W1-B: Team Claude draft → Cursor `dev-be`/`dev-fe`/`dev-mobile` review |
| **UC / FR** | **FR-UC-M01** · UC-M01 |
| **AC** | Diễn biến #1–5 · mobile login + select-membership |
| **Flow test** | UF login portal + mobile membership before any HRM mutate |
| **change_mode** | UPGRADE (align to SRS/API/DB v1.1) |
| **work_item_id** | OS-STD-W1-A-SLICE-01 → W1-B open after C-OS-29-NAME-01 CLOSED |
| **status** | DRAFT (slice map only — no apps/** yet) |
| **W1-B priority** | **P0-1** (prerequisite mọi slice nghiệp vụ) |

## spec_read_ack

```markdown
## spec_read_ack
- srs: docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01 · Diễn biến #1–5
- tech_spec: docs/brand-new-documents-20270801/TECH_SPEC_NEW.md v1.1 · ref_srs FR-UC-M01
- db_design: docs/brand-new-documents-20270801/DB_DESIGN_NEW.md v1.1 §3.1–3.3 — tables: xbos_tenant_registry, xbos_portal_user, xbos_user_tenant_membership
- api_design: docs/brand-new-documents-20270801/API_CONTRACT_NEW.md v1.1 §8 — endpoints below
- slice: docs/program/slices/DOC-ENT-P0-AUTH-M01.md
- change_mode: UPGRADE
- sponsor_confirm: DOC-ENT pack GWC · W0 OS-STD
```

## A. Spec / docs

| Path | Delta | Neo |
| --- | --- | --- |
| `docs/brand-new-documents-20270801/SRS_NEW.md` | READ-only SoT | version 1.1 |
| `docs/brand-new-documents-20270801/API_CONTRACT_NEW.md` §8 | READ-only | F.1 |
| `docs/brand-new-documents-20270801/DB_DESIGN_NEW.md` §3.1–3.3 | READ-only | physical |
| This slice | ADD W1-A | DOC-DELTA 2026-08-03 |

## B. Code paths (proposed — monorepo reality)

| Layer | Path | Neo tag | must_keep (1 dòng) | Owner |
| --- | --- | --- | --- | --- |
| BE XBOS auth | `apps/api/xbos-api/src/auth/**` | @CODE-MEMORY | login + select-membership + me; JWT RS256 path | dev-be |
| BE HRM mobile auth | `apps/api/hrm-api/src/auth/**` | @CODE-MEMORY | mobile login / select-membership / refresh | dev-be |
| DB ensure | `apps/api/xbos-api/src/db/**` (tenant/user/membership tables only) | @DB-MEMORY | soft conventions; no invent lockout columns without residual close | dev-be |
| FE portal login | `apps/web/web-portal/src/pages/auth/**` · `…/integrations/authSession.ts` | @CODE-MEMORY | membership select trước API nghiệp vụ | dev-fe |
| Mobile auth | `apps/mobile/hrm-mobile/src/features/auth/**` | @CODE-MEMORY | LoginScreen + ScopeScreen | dev-mobile |
| Test | auth controller/service specs under same modules | @TEST-MEMORY | lockout / inactive membership | QA later |

### API endpoints (API_CONTRACT §8)

| Method | Path |
| --- | --- |
| POST | `/api/xbos/auth/login` |
| POST | `/api/xbos/auth/select-membership` |
| GET | `/api/xbos/auth/me` |
| POST | `/api/hrm/auth/mobile/login` |
| POST | `/api/hrm/auth/mobile/select-membership` |
| POST | `/api/hrm/auth/mobile/refresh` |

### Tables (DB_DESIGN)

`xbos_tenant_registry` · `xbos_portal_user` · `xbos_user_tenant_membership`

## C. Ops / config

| Path | Neo | Note |
| --- | --- | --- |
| JWT / env examples only (no secret commit) | @ENV-REGISTRY | path_canonical NFD |

## D. Forbidden

- `apps/**` outside paths in B (W1-A: **all** apps/** forbidden until W1-B)
- Hard-delete users / memberships
- Seed để pass QA (U65)
- Rewrite BRD/SRS/TS/DB/API NEW bodies
- Shared deploy / production workflows

## E. Residual

| id | Mô tả | File neo | ack |
| --- | --- | --- | --- |
| R-M01-LOCKOUT-COL | `locked_until` chưa cột DB — NFR app-level | DB_DESIGN §3.2 Gap | OPEN |
| C-OS-29-NAME-01 | `29` → `28-FE-BE-SEPARATION-DISPLAY-READY.md` | `_vibe-team-os/29` | **CLOSED** |

## F. Verify (W1-B)

- [ ] `git diff --name-only` ⊆ A+B+C
- [ ] Login → select-membership → JWT có tenantId/membershipId
- [ ] Mobile tương đương trước leave/payroll
- [ ] Evidence browser/mobile U65
- [ ] Bus READY_FOR_QA only after Cursor `REVIEW_ACCEPT`

## Team Claude note (draft OK after REVIEW)

```text
Packet W1-B: slice_path=docs/program/slices/DOC-ENT-P0-AUTH-M01.md
read_first: 28-FE-BE-SEPARATION-DISPLAY-READY.md (C-OS-29-NAME-01 CLOSED).
Draft only in allowed_paths; DRAFT_READY_FOR_REVIEW ≠ READY_FOR_QA.
fe_be_soc: display-ready — membership list labels from BE, no FE invent tenants.
```
