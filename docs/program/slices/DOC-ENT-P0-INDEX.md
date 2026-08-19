# DOC-ENT P0 — Feature Slice Index (W1-A)

| Meta | Value |
|------|--------|
| **work_item** | OS-STD-W1-A-SLICE-01 |
| **Date** | 2026-08-03 |
| **SoT specs** | `SRS_NEW.md` / `API_CONTRACT_NEW.md` / `DB_DESIGN_NEW.md` **v1.1** |
| **Doctrine** | `_vibe-team-os/22-ARTIFACT-NEO-AND-FEATURE-SLICE.md` · `28` · `29` |
| **Coding gate** | **C-OS-29-NAME-01 CLOSED** (29 cites `28-FE-BE-SEPARATION-DISPLAY-READY.md`) — PM may open W1-B on first slice |
| **Status** | Slice maps DRAFT — **no** `apps/**` in this wave |

## Coverage (11 P0 FR → 9 slices)

| FR | Slice StoryID | File |
|----|---------------|------|
| FR-UC-M01 | DOC-ENT-P0-AUTH-M01 | `DOC-ENT-P0-AUTH-M01.md` |
| FR-UC-B04 | DOC-ENT-P0-XBOS-CAT | `DOC-ENT-P0-XBOS-CAT.md` |
| FR-UC-H01 + FR-UC-HRM-21 | DOC-ENT-P0-HRM-EMP | `DOC-ENT-P0-HRM-EMP.md` |
| FR-UC-B03 | DOC-ENT-P0-XBOS-WF | `DOC-ENT-P0-XBOS-WF.md` |
| FR-UC-H03 + FR-UC-M03 | DOC-ENT-P0-HRM-LEAVE | `DOC-ENT-P0-HRM-LEAVE.md` |
| FR-UC-M06 | DOC-ENT-P0-MOB-M06 | `DOC-ENT-P0-MOB-M06.md` |
| FR-UC-HRM-25 | DOC-ENT-P0-HRM-CON | `DOC-ENT-P0-HRM-CON.md` |
| FR-UC-H04 | DOC-ENT-P0-HRM-PAY | `DOC-ENT-P0-HRM-PAY.md` |
| FR-UC-HRM-27 | DOC-ENT-P0-HRM-DEC | `DOC-ENT-P0-HRM-DEC.md` |

## W1-B priority order (recommended)

Aligned with `OS_STD_AND_CODING_ACTION_PLAN.md` + dependency graph:

| # | StoryID | Why this order |
|---|---------|----------------|
| 1 | **DOC-ENT-P0-AUTH-M01** | Membership JWT trước mọi API nghiệp vụ |
| 2 | **DOC-ENT-P0-XBOS-CAT** | Catalog publish/pull trước picker HRM |
| 3 | **DOC-ENT-P0-HRM-EMP** | BE display-ready employees + embed AC-01 (spine) |
| 4 | **DOC-ENT-P0-XBOS-WF** | Engine trước/cùng leave approve bridge |
| 5 | **DOC-ENT-P0-HRM-LEAVE** | H03 web + M03 mobile (sau EMP+WF) |
| 6 | **DOC-ENT-P0-MOB-M06** | Idempotency trên leave POST offline |
| 7 | **DOC-ENT-P0-HRM-CON** | Contracts/Insurance embed AC-03 |
| 8 | **DOC-ENT-P0-HRM-PAY** | Periods/payslips 3-status honesty |
| 9 | **DOC-ENT-P0-HRM-DEC** | Decisions honesty / no mock; không claim DONE |

**Lane tip mỗi Story:** BE display-ready → FE wire → Mobile (nếu có) → Cursor `REVIEW_ACCEPT` → QA U65 → QC.

## Cross-cutting locks (every W1-B packet)

| Lock | Source |
|------|--------|
| `fe_be_soc: display-ready` | `_vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md` |
| Team Claude draft ≠ merge | `_vibe-team-os/29` · `DRAFT_READY_FOR_REVIEW` |
| U65 zero-seed · FE-only UF | sponsor lock |
| scope_parity list≡get-by-id | DB_DESIGN §1.2 · ADR scope ladder |
| Soft-delete only | DB_DESIGN §1.1 |
| path_canonical NFD | `PATH_CANONICAL_LOCK.md` |
| `solid_convention_ack` | OS `25` |

## First slice to open when W1-B unlocks

**DOC-ENT-P0-AUTH-M01** then **DOC-ENT-P0-HRM-EMP** (parallel BE OK after auth smoke) — or PM may start EMP if auth already green on stack.

## Evidence

`docs/qa/evidence/os-std-w1-a-slice-01.md`
