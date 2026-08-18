# Evidence — PO-MFD-M2-ATT-RBAC-SETTINGS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RBAC-SETTINGS-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 (matrix #44–45 — not Attendance CLOSED) |
| **verdict** | **A) ACCEPTED_AS_IS_P1** — honest STUB_UI + pointer to IAM / `ADR-HRM-RBAC-SCOPE-LADDER` (+ HRM Settings roles surface) |
| **sponsor_confirm** | **None invented** — no claim Attendance-local user/role admin is LIVE or Phase-1 FR |
| **dev_coding** | **Not opened** (FR_NEEDED rejected; no apps/**) |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **must_keep** | M2 P1 COMPLETE · RUNTIME GWC · EXPORT/CHARTS/LEAVE-SUMMARY ACCEPTED_AS_IS · Face #9 GĐ2-HOLD · **not** Attendance CLOSED · `uat_done: false` · U65 zero-seed |

## Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| Fidelity matrix **#44** | Cài đặt→**Người dùng** `users`. Intent: «Phân quyền chấm công module». Spec pointer `ADR-HRM-RBAC`. TechSpec **SPEC_GAP**. API **NO_API**. Runtime **STUB_UI**. UC **UNMAPPED**. Owner **sa** · P1. |
| Fidelity matrix **#45** | Cài đặt→**Vai trò** `roles`. Intent: «Role attendance admin». Spec **SPEC_GAP**. API **NO_API**. Runtime **STUB_UI**. UC **UNMAPPED**. Owner **sa** · P2. |
| M2 backlog **P2-4** | This WI — Settings users/roles STUB → IAM pointer · not ATT CLOSED. |
| RUNTIME_LOG / QA-RUNTIME | Settings stubs #40–46 STUB_UI (`featureInDev`); residual `R-MFD-ATT-SETTINGS-STUB-CLUSTER`. |
| `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` | **Accepted**. Membership / JWT scope ladder SoT = **XBOS** + portal/mobile select-membership. §6: tenant registry + user membership = XBOS; `position-rbac` = XBOS; HRM owns **employees / attendance / leave / payroll TXN** — **not** IAM admin UI inside Attendance CFG. Rung-3 Target = org_unit filters + position-rbac alignment — **not** a duplicate Attendance «Users/Roles» CRUD. |
| `ADR-HRM-ATTENDANCE-CFG-PERSIST` **D4** | Stub sidebars (OT / leave-rules / late-early / request-rules) redirect to Settings catalog — **not** fake Save. Users/roles were **not** listed as CFG SoT; same honesty class applies. |
| FE `Attendance.tsx` sidebar | `users` / `roles` in `getSidebarMenuItems`. Render path = generic placeholder (`attPage.featureInDev`) — **not** in `d4StubSidebarIds` redirect set. **No** Nest users/roles Network from this surface. |
| FE `RolesPermissionsTab.tsx` (HRM Settings) | Separate surface under Settings — `useSystemRoles` / permission matrix including module key `attendance`. This is the **nearest existing IAM UI**, outside Attendance Cài đặt sidebar. |
| Nest `hrm-api` attendance | **No** `/attendance/users` or `/attendance/roles` (or module-local RBAC admin) routes found. Authz remains JWT `roleCode` / scope ladder. |
| `docs/hrm/SRS.md` | **No overwrite** this seat. No confirmed Diễn biến FR for Attendance-local user/role admin. |
| Enterprise blueprint SRS | RBAC rings / C&B visibility — platform concerns; **not** Attendance Settings→Người dùng/Vai trò FR. |

## As-is vs to-be (Phase-1 / M2 #44–45)

| Aspect | As-is | Phase-1 to-be (this delta) |
|--------|-------|----------------------------|
| #44–45 UI | STUB_UI `featureInDev` placeholder | **Accepted** honest stub — no fake Save / no claim LIVE RBAC admin |
| Nest Attendance RBAC admin API | None | **Not required** Phase-1 |
| Platform IAM / membership | XBOS membership + JWT (`ADR-HRM-RBAC-SCOPE-LADDER`) | **SoT remains IAM** — out of Attendance module CFG |
| HRM Settings → Vai trò | Existing `RolesPermissionsTab` (permissions incl. `attendance` module) | **Pointer target** for operators — not Attendance sidebar clone |
| Attendance-scoped «admin role» FR | Unspecified | **Not invented** Phase-1; future = IAM / position-rbac wave, not ATT CLOSED unlock |

## Decision options (trade-off)

| Criteria | Weight | A ACCEPTED_AS_IS_P1 + IAM pointer | B FR_NEEDED Phase-1 | C GĐ2-HOLD / IAM-only stamp |
|----------|-------:|:---------------------------------:|:-------------------:|:---------------------------:|
| Boundary vs ADR-RBAC | 5 | High — preserves XBOS IAM SoT | Low — invents ATT-local FR | High — same ownership |
| Honesty vs RUNTIME STUB | 4 | High — keep STUB_UI | Medium — would reopen Dev | Medium — may reclass Face-like HOLD |
| Phase-1 cost / blast | 4 | Low — docs-only | High — BA+Dev+QA | Low — docs stamp only |
| Avoid duplicate IAM UI | 5 | High | Low — dual admin risk | High |
| Attendance CLOSED risk | 5 | Safe — not CLOSED | Unsafe scope creep | Safe if not ATT build |

### A) ACCEPTED_AS_IS_P1 — **SELECTED**

Close governance residual for matrix **#44–45** / M2 **P2-4** without Dev:

1. Surfaces are **honest STUB_UI** (`featureInDev`) with **NO_API** — matches RUNTIME GWC honesty.
2. Platform RBAC / membership already governed by **`ADR-HRM-RBAC-SCOPE-LADDER`** (§3 ladder · §5 membership · §6 XBOS IAM vs HRM ops). Building Attendance-local Users/Roles admin would **duplicate IAM** and violate module boundary.
3. Operator pointer: configure roles/permissions at **HRM Cài đặt → Vai trò** (`RolesPermissionsTab`) + portal membership / JWT; Attendance Cài đặt `#44–45` remain non-persist stubs.
4. **IAM-only ownership** (spirit of option C) is recorded as **architecture invariant under A** — not as a GĐ2 Attendance build backlog item.

### B) FR_NEEDED Phase-1 — **REJECTED**

Would invent ADD-only FR for Attendance-module user/role admin without sponsor Diễn biến and against ADR §6 (membership SoT = XBOS). Violates spec-before-code + preserve boundary. Inactive candidate note below only if sponsor later opens **platform IAM** FR — still **not** Attendance CLOSED.

### C) GĐ2-HOLD / IAM-only as sole primary stamp — **REJECTED as primary label**

Reclassifying #44–45 as Face-class **GĐ2-HOLD** implies a future Attendance implementation wave. Correct ownership is **IAM-only forever (or until platform IAM program)**, not «build inside Attendance in GĐ2». Stamp stays **STUB_UI + ACCEPTED_AS_IS_P1**; ownership = out-of-module IAM.

## Phase-1 accepted AC (measurable)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-RBAC-SET-01** | Settings→**Người dùng** / **Vai trò** show honest non-persist UI (`featureInDev` or equivalent stub) | Placeholder / stub visible; no Save claiming persist | Fake «đã lưu quyền» without IAM API 2xx |
| **AC-ATT-RBAC-SET-02** | No Nest `/attendance/users` or `/attendance/roles` (or equivalent ATT-local RBAC admin) required to close P2-4 | Close without ATT RBAC endpoint | QA FAIL only because ATT users API missing |
| **AC-ATT-RBAC-SET-03** | Authz SoT remains JWT membership / `roleCode` + scope ladder per `ADR-HRM-RBAC-SCOPE-LADDER` | Cite ADR; no ATT CFG SoT claim | Attendance sidebar presented as RBAC SoT |
| **AC-ATT-RBAC-SET-04** | Operator guidance points to platform IAM / HRM Settings roles (not invent ATT clone) | Evidence/matrix note has IAM pointer | Silent stub forever with no pointer when PM stamps |
| **AC-ATT-RBAC-SET-05** | must_keep: RUNTIME GWC · Face #9 HOLD · P1 GWC · EXPORT/CHARTS/LEAVE AS-IS — **orthogonal** | No regression | Reopen LIVE mutate tabs for invent RBAC FAIL |
| **AC-ATT-RBAC-SET-06** | U65: no seed membership/roles to green #44–45 | Browser honesty only | Seed users/roles for PASS |
| **AC-ATT-RBAC-SET-07** | **Not** Attendance CLOSED · `uat_done` remains false | Explicit in stamp | Claim ATT CLOSED from this WI |

## Residual disposition

| ID | Status | Note |
|----|--------|------|
| M2 backlog **P2-4** / matrix #44–45 | **CLOSED — ACCEPTED_AS_IS_P1** | AC-ATT-RBAC-SET-01..07 · no Dev |
| Matrix #44–45 runtime | **Keep STUB_UI** | Honesty AS-IS; UNMAPPED UC OK Phase-1 |
| IAM / membership / position-rbac depth | **Out of Attendance module** | Follow `ADR-HRM-RBAC-SCOPE-LADDER` + platform IAM program |
| Optional FE polish: D4-style Alert + link `/settings` (roles) | **Non-blocking P2** | Not required to close P2-4 |
| Face #9 | **GĐ2-HOLD** | Unchanged — out of seat |
| Attendance CLOSED | **Still open** | This WI does not close module |

## Deferred candidate (IF sponsor later opens **platform IAM** FR — do not invent confirm)

> **Not Phase-1 Attendance.** Do **not** dispatch Attendance Dev. Do **not** overwrite `docs/hrm/SRS.md` in this seat.

| Candidate | Intent | Owner plane |
|-----------|--------|-------------|
| IAM-USERS-ADMIN | Portal/XBOS membership admin UX depth | XBOS / IAM |
| IAM-ROLES-MATRIX | Harden Settings `RolesPermissionsTab` + BE permission SoT | HRM Settings + BE authz |
| IAM-RUNG3-NARROW | Manager org_unit row filters (ADR Target §3.3) | BE list APIs — not ATT Settings sidebar |
| ATT-LOCAL-RBAC-UI | Clone Users/Roles under Attendance Cài đặt | **Forbidden by default** — reject unless sponsor explicitly overrides ADR boundary |

## Architecture diagram (boundary)

```text
[Portal login / membership] ──JWT roleCode+scope──► [HRM APIs attendance TXN/CFG]
         │                                              ▲
         │ SoT IAM                                      │ authorize only
         ▼                                              │ (no ATT users CRUD)
[XBOS membership · position-rbac]                 [Attendance.tsx #44–45 STUB]
         │                                              │
         └──── pointer ────► [HRM Settings RolesPermissionsTab]
```

## Impacted systems

| System | Impact |
|--------|--------|
| Attendance FE sidebar #44–45 | Docs stamp only — keep stub honesty |
| `ADR-HRM-RBAC-SCOPE-LADDER` | Cited — no rewrite |
| HRM Settings roles | Pointer target — no change this seat |
| Nest attendance | No new endpoints |
| Face / P1 GWC | must_keep — untouched |

## Rollout / validation

1. PM stamps matrix #44–45 + M2 backlog P2-4 **ACCEPTED_AS_IS_P1** + IAM pointer note.
2. No Dev / no QA invent FAIL for missing ATT RBAC API.
3. Optional later: FE Alert+link polish (separate WI) — non-blocking.
4. Success: P2-4 CLOSED governance · STUB_UI retained · Attendance **not** CLOSED · Face HOLD intact.

## Handoff packet

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RBAC-SETTINGS-01` |
| **from_role** | sa |
| **to_role** | pm |
| **entry_criteria** | Matrix #44–45 STUB · ADR-RBAC present · M2 P2-4 DISPATCHED |
| **exit_criteria** | Verdict A + AC table + bus PASS_TO_PM · no apps/** · not ATT CLOSED |
| **evidence_path** | `docs/qa/evidence/po-mfd-m2-att-rbac-settings-01-spec.md` |
| **ack_status** | **PASS_TO_PM** |
| **completion_report** | See below |
| **next_owner** | pm |
| **next_dispatch_prompt** | See below |

### completion_report

Closed **PO-MFD-M2-ATT-RBAC-SETTINGS-01** (governance, docs-only). **Selected A) ACCEPTED_AS_IS_P1** for Attendance Settings→Người dùng / Vai trò (#44–45): keep honest **STUB_UI** / `featureInDev`, **NO_API**, pointer to **`ADR-HRM-RBAC-SCOPE-LADDER`** + HRM Settings roles IAM surface. **Rejected B** FR_NEEDED Phase-1 (would invent ATT-local RBAC against ADR §6). **Rejected C as primary** GĐ2-HOLD stamp (IAM-only is ownership invariant under A — not a future Attendance build). AC-ATT-RBAC-SET-01..07. **Residual:** optional D4-style `/settings` link polish (non-blocking); Face #9 HOLD; **Attendance not CLOSED**; `uat_done` false.

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-RBAC-SETTINGS-SPEC-CLOSE-01
from_role: pm
to_role: pm (self) then optional devops P2-5
lane: governance
priority: P2
u65_zero_seed: true

Stamp only (no apps/**, no Dev for #44–45):
1) HRM-ATTENDANCE_FIDELITY_MATRIX.md rows #44–45 → ACCEPTED_AS_IS_P1 · keep STUB_UI · note IAM pointer ADR-HRM-RBAC-SCOPE-LADDER + Settings Roles
2) HRM-ATTENDANCE_M2_BACKLOG.md P2-4 → CLOSED ACCEPTED_AS_IS_P1 · not ATT CLOSED
3) Bus pm -> ALL CLOSED PO-MFD-M2-ATT-RBAC-SETTINGS-01
4) Continue open P2: P2-5 SYSTEM-01 (devops #46) and/or await OPENAPI-01 SA; Face #9 remains GĐ2-HOLD
evidence: docs/qa/evidence/po-mfd-m2-att-rbac-settings-01-spec.md
cấm: Attendance CLOSED · Face LIVE · invent ATT /attendance/users|/roles · overwrite docs/hrm/SRS.md
```
