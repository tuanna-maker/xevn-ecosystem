# PCOMP-W7-MOB-UX-04b — Smart Hub celebrations + Who's out (J-MOB-08/09)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-MOB-UX-04b` |
| **from_role** | dev-mobile |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **generated** | 2026-06-07 |
| **spec_ref** | `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.2 · `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` §3.4 · `docs/program/MOBILE_HOME_HUB_AC_DELTA.md` §4.3–4.4 |

---

## Scope closed

| Deliverable | Path | AC |
|-------------|------|-----|
| Hub celebration helpers | `utils/dashboardHubCelebrate.ts` | BR-BDAY-01..04, BR-WHO-01..03, J-MOB-08/09 |
| Home summary integration + compose fallback | `integrations/hrmHomeSummary.ts` | GET `/home/summary?include=celebrations,whos_out` + approved leave / employees fallback |
| Horizontal avatar row (U49) | `components/ui/HomeCelebrationRow.tsx` | AC-MOB-HUB-08-02 — 56pt avatars, horizontal scroll, max 10 + «Xem thêm» |
| Dashboard sections | `features/dashboard/DashboardScreen.tsx` | Birthday banner, «Sinh nhật hôm nay», «Ai nghỉ hôm nay (n)» after Sắp tới per §7 |
| Unit tests | `utils/__tests__/dashboardHubCelebrate.test.ts` (10 cases) | Privacy, TZ, approved overlap, section visibility |

**API path:** Primary `GET /api/hrm/home/summary?include=celebrations,whos_out`. When BE stubs return empty (04a), client compose fallback: paginated `GET /employees` DOB filter + `GET /attendance/leave-requests?status=approved` today overlap.

---

## Section order (§7 extension)

| Persona | 04b blocks (after Sắp tới) |
|---------|---------------------------|
| NV / Manager | (optional) Birthday banner → Sinh nhật hôm nay → Ai nghỉ hôm nay (n) |

Sections **hidden** when `total_count === 0` (AC-MOB-HUB-08-03, AC-MOB-HUB-09-04).

---

## AC mapping

| AC-ID | Implementation |
|-------|----------------|
| AC-MOB-HUB-08-01 | `viewer.is_birthday_today` → banner «Chúc mừng sinh nhật, {tên}!» — no year |
| AC-MOB-HUB-08-02 | `HomeCelebrationRow` horizontal avatars + names; `limitCelebrationPreview` max 10 |
| AC-MOB-HUB-08-03 | `shouldShowCelebrationsSection` — no empty card |
| AC-MOB-HUB-08-04 | `sanitizeCelebrationItem` rejects `birth_year` / ISO DOB on `month_day` |
| AC-MOB-HUB-08-05 | `composeCelebrationsFromEmployees` skips inactive / `archived_at` |
| AC-MOB-HUB-09-01 | `whos_out` from summary or `filterApprovedLeaveCoveringToday` + i18n label |
| AC-MOB-HUB-09-02 | Only `status=approved` in filter / parse |
| AC-MOB-HUB-09-03 | Row tap → `LeaveRequestDetail` by `leave_request_id` |
| AC-MOB-HUB-09-04 | Section hidden when empty |
| AC-MOB-HUB-09-05 | ListRow subtitle = leave type label only — no `reason` |

---

## Verification (agent-run)

```text
cd apps/mobile/hrm-mobile
pnpm test   → 23 files, 134 tests PASS, exit 0
pnpm build  → tsc --noEmit PASS, exit 0
```

---

## QA device matrix

| Journey | Persona | Steps |
|---------|---------|-------|
| J-MOB-08 | NV UAT with seeded DOB = today | Home → banner if self birthday → horizontal «Sinh nhật hôm nay» → no year in UI; API log no `birth_year` |
| J-MOB-09 | NV same company | Home → «Ai nghỉ hôm nay (n)» when approved leave overlaps today → tap row → LeaveRequestDetail read-only |

**Seed note (R-HUB-01):** Qual hook — set ≥2 employees `custom_fields.date_of_birth` MM-DD = today before J-MOB-08 device pass.

**Compare:** `GET /home/summary?include=celebrations,whos_out` response vs Home UI when BE 04b population lands.

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| BE `celebrations`/`whos_out` SQL populate | dev-be | Mobile ready; fallback until BE non-empty |
| «Xem thêm» sinh nhật >10 | dev-mobile W7-5 | Directory screen J-MOB-16 — chip is visual-only |
| Offline cache for 04b sections | dev-mobile | `ASYNC_CACHE.DASHBOARD_V1` not yet extended for celebrations/whos_out |
| J-MOB-10 quick-action pin | MOB-UX-04c | DEFERRED |

---

## Handoff

```yaml
completion_report: |
  Wired Dashboard Home MOB-UX-04b: GET /home/summary celebrations+whos_out with client compose fallback,
  birthday banner (viewer.is_birthday_today), horizontal avatar row (U49), «Ai nghỉ hôm nay (n)» with
  LeaveRequestDetail deep link. Vitest 134/134 PASS; tsc PASS. Residual: BE populate celebrations SQL;
  directory for «Xem thêm» >10; offline cache extension.

next_owner: qa

next_dispatch_prompt: |
  work_item_id: PCOMP-W7-QA-HUB-04b
  Retest MOB-UX-04b mobile per docs/qa/evidence/pcomp-w7-mob-ux-04b-20260607.md — J-MOB-08/09 on device/emulator
  with uat.nv0001@xe.vn / xevn-uat-2026. Preconditions: hrm-api :28001 up; seed ≥1 approved leave covering today
  and ≥2 employees DOB MM-DD = today (Asia/Ho_Chi_Minh). Verify: birthday banner no year; horizontal avatars;
  whos_out tap → LeaveRequestDetail; section hidden when empty. Compare GET /home/summary include=celebrations,whos_out
  when BE populated. evidence_path: docs/qa/evidence/pcomp-w7-mob-hub-jmob08-09-YYYYMMDD.md
  ack_status: PASS_TO_PM or FAIL with pm_dispatch_hint.

evidence_path: docs/qa/evidence/pcomp-w7-mob-ux-04b-20260607.md
ack_status: READY_FOR_QA
```
