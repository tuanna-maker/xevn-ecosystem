# PCOMP-W7-MOB-DIRECTORY-01 — Employee directory (W7-5)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-DIRECTORY-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa` / `qa-device` |
| **date** | 2026-07-28 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD \| FIX |
| **U65** | zero-seed — no `pnpm seed:*` |
| **HOLD_DEPLOY** | yes — no APK rebuild this wave (source + unit only) |
| **journeys** | **J-MOB-16** · **J-MOB-30** |
| **UC** | UC-HRM-MOB-16 |
| **prior** | `pcomp-w7-mob-directory-20260719.md` · search PASS `pcomp-w7-mob-directory-search-01-qa-20260719.md` |

---

## spec_read_ack

| Artifact | Sections / ack |
|----------|----------------|
| **srs** | `docs/hrm/MOBILE_W7_SRS_DELTA.md` **§4.4 UC-HRM-MOB-16** — R1–R6, BR-DIR-01/02/03, AC-DIR-01/02/03 |
| **tech_spec** | `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` **§3.7** · **§4.2** EmployeeDirectoryScreen/Detail · NFR-W7-04 debounce 300ms |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` — consumers mobile directory; soft FK manager |
| **api_design** | `docs/hrm/API_DESIGN_HRM_EMPLOYEES.md` **§1** `GET /employees` · `view=directory` · `HRM-EMP-DIR-200` · Plane B slug `company_id` · bước UC-HRM-21 / FR-EM-01 #8 |
| **data** | `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` **§5** · VAL-W7-DIR-01/02/03 |
| **uc_ids** | UC-HRM-MOB-16 |
| **sponsor_confirm** | W7 pack BA-SRS (`MOBILE_W7_SRS_DELTA`) · dual-plane GWC must_keep |

**Route SoT:** `GET /api/hrm/employees?view=directory` (+ detail `?view=directory`) — **not** invent `/employees/directory` (TechSpec §3.7 alternate / Data contracts).

**spec says / code does (this wave):**

| Spec | Before (gap) | After |
|------|--------------|-------|
| API_DESIGN Plane B `company_id` TEXT slug / `main` rollup | List used `resolveHrmCompanyHeaderId` → LE UUID when `companyId=main` | `resolveDirectoryQueryCompanyId` → `main` / `holding` / member slug |
| VAL-W7-DIR-01 list↔detail same scope | Detail also used header helper | Same Plane B resolver on detail |
| TechSpec page_size default 30 | `DIRECTORY_PAGE_SIZE=50` | **30** (still ≤50 BR-DIR-03; paginate) |
| API honest empty | Empty scope → `ok:false` error string | `ok:true` + UI «Không tìm thấy nhân viên» |
| AC-DIR-01/R2 client fold | Already PASS device 2026-07-19 | **must_keep** unchanged |

---

## Scope closed

1. **List/search** — Tab Đội nhóm `TeamDirectoryScreen`: debounce 300ms, `q` ≥2, client accent-fold, chips, dept sections, empty R2 copy.
2. **Plane B FIX** — `resolveDirectoryQueryCompanyId` in `companyWireScope.ts`; wired list + detail; membership recover when SecureStore holds UUID.
3. **Detail** — tap row → `TeamColleagueDetail` / `GET /employees/:id?view=directory`.
4. **Home entry** — Dashboard `team` / `active_team` → `TeamDirectory` (existing).
5. **@CODE-MEMORY** APPEND on screen / integrations (2026-07-28).
6. **Tests** — 57/57 PASS scoped (directory + companyWireScope + employeeDetailUx).

**must_keep (untouched):** leave-doc/bal, auth/login, dual-plane attendance write UUID (header/body paths), J-MOB-12 profile.

---

## Verification

```text
pnpm --filter hrm-mobile exec vitest run \
  src/utils/__tests__/teamDirectory.test.ts \
  src/components/ui/__tests__/teamDirectoryUx.test.ts \
  src/integrations/__tests__/hrmTeamDirectory.test.ts \
  src/integrations/__tests__/hrmEmployeeDirectory.test.ts \
  src/integrations/__tests__/companyWireScope.test.ts \
  src/utils/__tests__/teamDirectoryDetail.test.ts \
  src/components/ui/__tests__/employeeDetailUx.test.ts
→ 7 files / 57 tests PASS
```

---

## Files touched

| Path | Change |
|------|--------|
| `apps/mobile/hrm-mobile/src/integrations/companyWireScope.ts` | ADD `resolveDirectoryQueryCompanyId` |
| `apps/mobile/hrm-mobile/src/features/team/TeamDirectoryScreen.tsx` | FIX Plane B listCompanyId |
| `apps/mobile/hrm-mobile/src/integrations/hrmTeamDirectory.ts` | page_size 30; honest empty; Plane B fallback |
| `apps/mobile/hrm-mobile/src/integrations/hrmEmployeeDirectory.ts` | detail query Plane B |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/companyWireScope.test.ts` | 3 directory scope cases |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/hrmTeamDirectory.test.ts` | empty + page_size=30 |
| `apps/mobile/hrm-mobile/src/components/ui/__tests__/teamDirectoryUx.test.ts` | wire assert |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/hrmEmployeeDirectory.test.ts` | drop unused header mock |

---

## QA device matrix (U65 zero-seed)

| # | Persona | Path | Expect |
|---|---------|------|--------|
| 1 | `uat.nv0001@xe.vn` / `xevn-uat-2026` | Tab **Đội nhóm** | List ≥1 row; Network `company_id=` **slug** (`holding`/`trsport`/…) not LE UUID |
| 2 | same | Search «Nguyễn» / `Nguyen` ≥2 chars | Chip/total changes; ≥1 row (AC-DIR-01) |
| 3 | same | 1 char only | Default list (R1 — no `q` on wire) |
| 4 | same | Tap row | Detail same `employee_id` (AC-DIR-02 / J-MOB-16) |
| 5 | same | Nonsense search | «Không tìm thấy nhân viên» (R2) |
| 6 | same | Avatar | URL or initials (AC-DIR-03) |
| 7 | Group CEO if available | Scope `main` | List query `company_id=main`; no scope 409 storm |

**Network:** `GET …/employees?view=directory&status=active&page_size=30` → **200** `HRM-EMP-DIR-200`.

**APK:** HOLD_DEPLOY — use last qa-device APK only if Hermes already includes 2026-07-28 source; else rebuild before device gate (PM/devops). Prior search SHA `D1E095F3…E201` does **not** include Plane B FIX.

---

## Residual

- Device L2.5 on binary with this FIX — **required** before TODO `[x]`.
- Dedicated `/employees/directory` route — not invent.
- Toggle «Hiện đã nghỉ» (R3 P2) — out of W7-5.
- No Phase1 / PROD claim.

---

## Handoff

- **completion_report:** W7-5 directory list/search complete + Plane B query FIX; vitest 57/57; READY_FOR_QA.
- **next_owner:** `qa-device`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/pcomp-w7-mob-directory-01-20260728.md`
