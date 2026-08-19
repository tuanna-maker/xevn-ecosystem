# Ecosystem Test Case Packs (depth)

| Meta | Value |
|------|--------|
| **Program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` |
| **Template** | `_TEMPLATE_MENU_TC_PACK.md` |
| **Roster** | `roster/ECOSYSTEM_MENU_ROSTER.md` |
| **Rollup report** | `docs/qa/reports/PO_SPEC_TEST_REPORT.md` §6 (Wave A) · §7 (Wave B) · §9 (Wave B-DELTA) · §10 (Wave C) · §11 (Wave C-DELTA) |
| **Spine catalog** | `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` (53 TC — unchanged) |
| **Lock** | U83 — đủ field · screen · popup · function · toàn ecosystem |

## Cách viết

1. Copy template → `xbos/` | `hrm-web/` | `hrm-mobile/` theo `menu_id`.
2. Inventory từ **code + HDSD + SRS** (không đoán).
3. Coverage check §4 bắt buộc đủ trước `READY_FOR_SYNTH`.
4. Wave A → **SYNTHED** (`PO-ECO-TC-SYNTH-WAVE-A-01`); Wave B batch-1 → **SYNTHED** (`PO-ECO-TC-SYNTH-WAVE-B-01`); Wave B-DELTA → **SYNTHED** (`PO-ECO-TC-SYNTH-WAVE-B-DELTA-01`); Wave C batch-1 → **SYNTHED** (`PO-ECO-TC-SYNTH-WAVE-C-01`); Wave C-DELTA stubs → **SYNTHED** (`PO-ECO-TC-SYNTH-WAVE-C-DELTA-01`).

## Index packs — Wave A (SYNTHED 2026-08-03)

| pack_path | TCs | Screens | Fields | Functions | status | evidence |
|-----------|----:|--------:|-------:|----------:|--------|----------|
| `hrm-web/HRM-EMPLOYEES.md` | 156 | 40 | 118 | 72 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-hrm-employees-01.md` |
| `hrm-web/HRM-RECRUITMENT.md` | 118 | 38 | 94 | 62 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-hrm-recruitment-01.md` |
| `hrm-web/HRM-ATTENDANCE.md` | 82 | 41 | 87 | 58 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-hrm-attendance-01.md` |
| `xbos/XBOS-ORG-SHARE.md` | 38 | 12 | 44 | 19 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-xbos-org-share-01.md` |
| `xbos/XBOS-INBOX-CAT.md` | 32 | 12 | 28 | 18 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-xbos-inbox-cat-01.md` |
| `hrm-mobile/MOB-LEAVE-APPR.md` | 39 | 15 | 34 | 25 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-mob-leave-appr-01.md` |
| **Wave A total** | **465** | **158** | **405** | **254** | — | `docs/qa/evidence/po-eco-tc-synth-wave-a-01.md` |

## Index packs — Wave B batch-1 (SYNTHED 2026-08-03)

| pack_path | TCs | Screens | Fields | Functions | status | evidence |
|-----------|----:|--------:|-------:|----------:|--------|----------|
| `hrm-web/HRM-CONTRACTS.md` | 96 | 28 | 52 | 43 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-hrm-contracts-01.md` |
| `hrm-web/HRM-PAYROLL.md` | 96 | 38 | 78 | 52 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-hrm-payroll-01.md` |
| `hrm-web/HRM-DECISIONS.md` | 59 | 15 | 38 | 27 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-hrm-decisions-01.md` |
| `xbos/XBOS-RACI.md` | 32 | 10 | 51 | 13 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-xbos-raci-01.md` |
| `xbos/XBOS-RBAC-MATRIX.md` | 38 | 8 | 65 | 13 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-xbos-rbac-01.md` |
| `hrm-mobile/MOB-HOME.md` | 34 | 18 | 32 | 19 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-mob-home-01.md` |
| `hrm-mobile/MOB-ATTENDANCE.md` | 39 | 14 | 38 | 24 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-mob-attendance-01.md` |
| **Wave B batch-1 total** | **394** | **131** | **354** | **191** | — | `docs/qa/evidence/po-eco-tc-synth-wave-b-01.md` |

## Index packs — Wave B-DELTA (SYNTHED 2026-08-03)

| pack_path | TCs | Screens | Fields | Functions | status | evidence |
|-----------|----:|--------:|-------:|----------:|--------|----------|
| `hrm-web/HRM-INSURANCE.md` | 87 | 13 | 62 | 39 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-hrm-insurance-01.md` |
| `hrm-web/HRM-SETTINGS.md` | 76 | 33 | 86 | 56 | **SYNTHED** · BUILD_GAP-MD-PANEL-01 | `docs/qa/evidence/po-eco-tc-hrm-settings-01.md` |
| `hrm-web/HRM-PERFORMANCE.md` | 58 | 13 | 28 | 15 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-hrm-performance-01.md` |
| `xbos/XBOS-CC-HOME-KPI.md` | 36 | 12 | 38 | 16 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-xbos-kpi-rail-01.md` |
| `xbos/XBOS-WF-DESIGNER.md` | 30 | 7 | 22 | 12 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-xbos-wf-01.md` |
| `xbos/XBOS-CATALOG-CC.md` | 28 | 6 | 28 | 13 | **SYNTHED** · supersedes `TC-XIC-CC-*` | `docs/qa/evidence/po-eco-tc-xbos-catalog-cc-01.md` |
| `hrm-mobile/MOB-PROFILE.md` | 36 | 14 | 42 | 30 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-mob-profile-01.md` |
| `hrm-mobile/MOB-SETTINGS.md` | 30 | 14 | 36 | 18 | **SYNTHED** · gộp MOB-SCOPE | `docs/qa/evidence/po-eco-tc-mob-settings-01.md` |
| **Wave B-DELTA total** | **381** | **112** | **302** | **189** | — | `docs/qa/evidence/po-eco-tc-synth-wave-b-delta-01.md` |

**Cumulative A + B batch-1 + B-DELTA + Wave C + C-DELTA (claimed TC rows):** **1494** · **1375** globally unique depth TC-IDs · **9** documented cross-pack overlaps (supersede/split — not spine collisions).

## Index packs — Wave C batch-1 (SYNTHED 2026-08-03)

| pack_path | TCs | Screens | Fields | Functions | status | evidence |
|-----------|----:|--------:|-------:|----------:|--------|----------|
| `hrm-web/HRM-DASHBOARD.md` | 54 | 19 | 42 | 18 | **SYNTHED** | `docs/qa/evidence/po-eco-tc-hrm-dashboard-01.md` |
| `xbos/XBOS-LOGIN.md` | 28 | 8 | 18 | 12 | **SYNTHED** · dedupe vs `TC-CC-HP-001` | `docs/qa/evidence/po-eco-tc-xbos-login-01.md` |
| `hrm-mobile/MOB-TEAM.md` | 32 | 16 | 35 | 14 | **SYNTHED** · xref HOME/PROF/ATT | `docs/qa/evidence/po-eco-tc-mob-team-01.md` |
| `hrm-web/HRM-GUIDE.md` | 42 | 12 | 22 | 18 | **SYNTHED** · thin_ui STUB | `docs/qa/evidence/po-eco-tc-hrm-guide-01.md` |
| **Wave C batch-1 total** | **156** | **55** | **117** | **62** | — | `docs/qa/evidence/po-eco-tc-synth-wave-c-01.md` |

## Index packs — Wave C-DELTA (SYNTHED 2026-08-03)

| pack_path | TCs | Screens | Fields | Functions | status | evidence |
|-----------|----:|--------:|-------:|----------:|--------|----------|
| `xbos/XBOS-RAIL-STUBS.md` | 28 | 17 | 45 | 14 | **SYNTHED** · STUB/OOS | `docs/qa/evidence/po-eco-tc-xbos-rail-stubs-01.md` |
| `hrm-mobile/MOB-OPERATIONS.md` | 32 | 14 | 24 | 13 | **SYNTHED** · xref SET/HOME | `docs/qa/evidence/po-eco-tc-mob-operations-01.md` |
| `hrm-mobile/MOB-JOURNEY.md` | 38 | 12 | 28 | 17 | **SYNTHED** · MOB-UX-13g | `docs/qa/evidence/po-eco-tc-mob-journey-01.md` |
| **Wave C-DELTA total** | **98** | **43** | **97** | **44** | — | `docs/qa/evidence/po-eco-tc-synth-wave-c-delta-01.md` |

## Index — remaining PLANNED (not yet SYNTH)

| pack_path | status | notes |
|-----------|--------|-------|
| *(full leaf list)* | — | `roster/ECOSYSTEM_MENU_ROSTER.md` (e.g. XBOS-MEMBER-SCOPE · MOB-PAYSLIP) |

## Coverage % (rough)

| Surface | SYNTHED packs | Roster leaf rows | Notes |
|---------|-------------:|-----------------:|-------|
| HRM Web | 11 (A:3 + B:3 + Δ:3 + C:2) | 22 | DASH · GUIDE synth |
| XBOS/CC | 9 (A:2 + B:2 + Δ:3 + C:1 + Δ:1) | 52 | LOGIN · RAIL-STUBS synth |
| Mobile | 8 (A:1 + B:2 + Δ:2 + C:1 + Δ:2) | 28 | MOB-TEAM · OPS · JRN synth |

*Percent = pack files authored/SYNTHED vs target — **not** UAT execution.*

Xem roster đầy đủ: `roster/ECOSYSTEM_MENU_ROSTER.md`.
