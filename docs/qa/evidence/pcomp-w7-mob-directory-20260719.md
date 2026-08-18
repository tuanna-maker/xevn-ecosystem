# PCOMP-W7-MOB-DIRECTORY — Employee directory (W7-5)

| Field | Value |
|-------|-------|
| work_item_id | PCOMP-W7-MOB-DIRECTORY |
| role | dev-mobile |
| date | 2026-07-19 |
| ack_status | **READY_FOR_QA** |
| journeys | **J-MOB-16** (SRS) · device path **J-MOB-30** (PROGRAM_JOURNEY_MAP) |
| UC | UC-HRM-MOB-16 |
| prior | MOB-W7-5 directory API/device (`mob-w7-5-directory-*`, `qc-mob-w7-5-directory-final-20260609.md`) |

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| SRS | `docs/hrm/MOBILE_W7_SRS_DELTA.md` **§4.4 UC-HRM-MOB-16** — R1–R6, BR-DIR-01/02/03, AC-DIR-01/02/03 |
| TechSpec | `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` **§3.7** directory · **§4.2** EmployeeDirectoryScreen/Detail · **NFR-W7-04** debounce 300ms |
| Data | `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` **§5** `view=directory` · VAL-W7-DIR-01/02/03 |

**Route SoT:** Data contracts + BE thin path `GET /employees?view=directory` (+ `q` / `keyword`) — not invent `/employees/directory` until OpenAPI adds alias. TechSpec §3.7 alternative approved.

**spec says / code does (before → after):**

| Spec | Before | After |
|------|--------|-------|
| NFR-W7-04 debounce 300ms + cancel stale | Client-only filter; no debounce | `DIRECTORY_SEARCH_DEBOUNCE_MS=300` + loadGen cancel |
| R1 `q` &lt; 2 → default A–Z | Client filtered on 1 char | `normalizeDirectorySearchQuery` — no `q` on wire if &lt;2 |
| Server search AC-DIR-01 | Client-only `filterTeamDirectoryBySearch` | API `q=` via `loadTeamDirectoryWithAttendance({ search })` |
| BR-DIR-03 `page_size` max 50 | `DIRECTORY_PAGE_SIZE=100` | **50** (paginate) |
| R2 empty «Không tìm thấy nhân viên» | «Không có kết quả…» / scope error string | SRS copy + search miss = ok empty |
| AC-DIR-02 row → detail | Already wired | Kept `TeamColleagueDetail` + `view=directory` |
| @CODE-MEMORY | Missing on W7-5 files | Added on screen/integration/row/detail |

## Scope closed

1. **List** — Tab Đội nhóm `TeamDirectoryScreen`: `view=directory`, `status=active`, dept sections, attendance chips, avatar/job/dept rows ≥44px.
2. **Search** — debounce 300ms; API `q` when ≥2 chars; stale load discarded.
3. **Detail** — tap row → `TeamColleagueDetailScreen` / `GET /employees/:id?view=directory`.
4. **Home entry** — existing `team` / `active_team` → `TeamDirectory` (Dashboard).
5. **Tests** — 36/36 PASS (hrmTeamDirectory, teamDirectory, teamDirectoryUx, hrmEmployeeDirectory, employeeDetailUx, teamDirectoryDetail).

## Verification

```bash
pnpm test:hrm-mobile -- hrmTeamDirectory teamDirectory teamDirectoryUx hrmEmployeeDirectory employeeDetailUx
# Test Files  6 passed | Tests  36 passed
```

## Files

- `apps/mobile/hrm-mobile/src/features/team/TeamDirectoryScreen.tsx`
- `apps/mobile/hrm-mobile/src/features/team/TeamColleagueDetailScreen.tsx`
- `apps/mobile/hrm-mobile/src/integrations/hrmTeamDirectory.ts`
- `apps/mobile/hrm-mobile/src/integrations/hrmEmployeeDirectory.ts`
- `apps/mobile/hrm-mobile/src/utils/teamDirectory.ts`
- `apps/mobile/hrm-mobile/src/components/team/TeamDirectoryRow.tsx`
- `apps/mobile/hrm-mobile/src/integrations/__tests__/hrmTeamDirectory.test.ts`
- `apps/mobile/hrm-mobile/src/utils/__tests__/teamDirectory.test.ts`
- `apps/mobile/hrm-mobile/src/components/ui/__tests__/teamDirectoryUx.test.ts`

## QA device matrix (U65 zero-seed)

| # | Persona | Path | Expect |
|---|---------|------|--------|
| 1 | `uat.nv0001@xe.vn` or `uat.nv0002@xe.vn` | Tab **Đội nhóm** | List ≥1 row, dept sections, no ERROR |
| 2 | same | Search «Nguyễn» (≥2 chars, wait 300ms) | ≥1 row (AC-DIR-01) |
| 3 | same | Type 1 char only | Still full/default list (R1) |
| 4 | same | Tap row | Detail same `employee_id` — contact/work (AC-DIR-02) |
| 5 | same | Empty search nonsense | «Không tìm thấy nhân viên» (R2) |
| 6 | same | Avatar when URL present | Image or initials (AC-DIR-03) |

**Network:** `GET …/employees?view=directory&status=active&page_size=50` → **200** `HRM-EMP-DIR-200`; detail → **200** `HRM-EMP-200`.

## Residual

- Dedicated `/employees/directory` route — **not invent**; BE thin `view=directory` SoT.
- Toggle «Hiện đã nghỉ» (R3 P2) — out of W7-5 default.
- APK rebuild — qa-device may use existing device APK if bundle includes this wave; else rebuild after promote.

## Handoff

- **next_owner:** qa-device
- **ack_status:** READY_FOR_QA
- **pm_dispatch_hint:** Device J-MOB-16/30 matrix above; U65 no seed; evidence `docs/qa/evidence/pcomp-w7-mob-directory-qa-YYYYMMDD.md`
