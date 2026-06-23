# MOB-UX-16-QA — ILA Layout Composition Scorecard (10 screens)

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-16-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **rubric** | `docs/program/MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md` |
| **threshold** | **≥16/20** per screen; **ILA-07≠0** and **ILA-01≠0** mandatory |
| **ack_status** | **FAIL** (partner slice avg **~14.6/20** — below 16) |

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` |
| APK SHA-256 | `2C62C82F1D45B3917A639006C4995A6D7415CEC3E9A0B08A351F5A4F18626C2F` (MOB-UX-14-R6 unified) |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| Capture dir | `docs/qa/evidence/mob-ux-16-screens/` |

---

## Automation gates

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run verify:mobile:layout` | **1** | Script regex misparses `HomeSectionKey[]` before array literal — **false FAIL**; source `HOME_ABOVE_FOLD_RENDER_ORDER` in `dashboardPersonaLayout.ts` is correct (`action_grid → above_fold_stats → activity_hub`). Track **MOB-UX-16c** script fix. |
| `node scripts/qa-mobile-home-responsive-matrix.mjs` | **1** | SE PASS; Pro Max + 4a FAIL — feeds Home **ILA-08** |
| `node scripts/tmp-mob-ux-16-ila-qa-device.mjs` | **0** | 6/10 screens captured on R6; tab-bar FAB overlap blocked team/profile/settings adb taps (cross-ref 12a/12b/15c) |

---

## Per-screen ILA scores

### 1. Home — **16/20** PASS (borderline)

| ID | Score | Evidence / note |
|----|-------|-----------------|
| ILA-01 | **1** | Grid→stats→activity above fold ✅; welcome carousel (`Xin chào, Nguyễn Văn An`) still below fold — secondary before journey when scrolling |
| ILA-02 | **2** | TopBar→grid gap ~126dp; `groupedLayout` tokens present |
| ILA-03 | **1** | Above-fold task-complete; journey/Hành trình requires scroll |
| ILA-04 | **2** | Grid / EssStatRow / activity trigger grouped |
| ILA-05 | **2** | Single TopBar identity — no duplicate stack title |
| ILA-06 | **2** | Stat rows: label left (`Đội đang làm` x=85), number right (`213` x=831) |
| ILA-07 | **2** | Vietnamese copy; no UUID/slug in home tree |
| ILA-08 | **1** | 14d: SE+412 PASS; Pro Max+393 FAIL → 1 viewport FAIL (GWC) |
| ILA-09 | **1** | `check-in-fab` overlaps tab bar center — thumb zone tight |
| ILA-10 | **2** | EMP persona layout (`Nhân viên`, quick grid) |

**Screenshots:** `docs/qa/evidence/mob-ux-16-screens/16-home.png`, `docs/qa/evidence/mob-ux-14d-screens/iphone-se-home-top.png`, `docs/qa/evidence/mob-ux-14d-screens/pixel-7-home-top.png`

---

### 2. Notifications — **18/20** PASS

| ID | Score | Evidence / note |
|----|-------|-----------------|
| ILA-01 | **2** | Inbox list task-first |
| ILA-02 | **2** | Header→first card ~84dp inset |
| ILA-03 | **2** | Dense list; no excess empty |
| ILA-04 | **2** | Row cards grouped |
| ILA-05 | **2** | Single «Thông báo» stack title |
| ILA-06 | **2** | Badge right-aligned |
| ILA-07 | **2** | Vietnamese titles; no `event_type` slug (MOB-UX-15a ✅) |
| ILA-08 | **2** | Readable @ 1080×2400 native |
| ILA-09 | **2** | Rows tappable above tab bar |
| ILA-10 | **2** | NV inbox copy |

**Screenshot:** `docs/qa/evidence/mob-ux-16-screens/16-notifications.png`

---

### 3. Leave list — **14/20** FAIL

| ID | Score | Evidence / note |
|----|-------|-----------------|
| ILA-01 | **2** | Balance→list order (audit + prior 13d) |
| ILA-02 | **1** | Balance cards→segmented tab gap still tight on device (sponsor screenshot class) |
| ILA-03 | **2** | List density OK |
| ILA-04 | **2** | Balance + list sections |
| ILA-05 | **2** | Single stack title |
| ILA-06 | **2** | Balance numbers right-aligned |
| ILA-07 | **2** | Vietnamese |
| ILA-08 | **1** | Not re-probed all 4 classes this session |
| ILA-09 | **2** | CTA above tab bar |
| ILA-10 | **2** | NV leave slice |

**Screenshot:** `docs/qa/evidence/mob-ux-16-screens/16-leave2.png` (partial load — full list cross-ref `MOB-UX-13d` evidence)

---

### 4. Approvals — **14/20** FAIL

| ID | Score | Evidence / note |
|----|-------|-----------------|
| ILA-01 | **2** | Subtitle→chips→content order |
| ILA-02 | **1** | Subtitle (y=370) → chips (y=433) OK; empty illustration vertical ~94dp — slightly loose |
| ILA-03 | **1** | Empty state occupies ~400dp — breathing room high for zero rows |
| ILA-04 | **2** | Filter chips grouped |
| ILA-05 | **2** | «Phê duyệt» once in stack — no AppScreenLayout duplicate |
| ILA-06 | **2** | Chip counts in labels |
| ILA-07 | **2** | Vietnamese empty copy |
| ILA-08 | **2** | Native res OK |
| ILA-09 | **2** | Chips above tab bar |
| ILA-10 | **2** | Manager slice for nv0001 |

**Screenshot:** `docs/qa/evidence/mob-ux-16-screens/16-approvals.png`

---

### 5. CheckIn — **15/20** FAIL (cross-ref MOB-UX-13a)

| ID | Score | Evidence / note |
|----|-------|-----------------|
| ILA-01 | **2** | Identity hero before fields |
| ILA-02 | **2** | Grouped form spacing |
| ILA-03 | **2** | Compact hero post-13a |
| ILA-04 | **2** | Read-only identity section |
| ILA-05 | **2** | Single title |
| ILA-06 | **2** | Row alignment |
| ILA-07 | **2** | No UUID in UI (13a ✅) |
| ILA-08 | **1** | Not matrix-probed |
| ILA-09 | **1** | Sticky CTA present; FAB competition on navigate path |
| ILA-10 | **2** | NV check-in |

**Note:** R6 session adb tap launched launcher (FAB/tab collision). Layout scored from **MOB-UX-13a** device PASS + code gate. Re-capture: `MOB-UX-16b` follow-up.

---

### 6. Team directory — **16/20** PASS (cross-ref MOB-UX-12b)

| ID | Score | Evidence / note |
|----|-------|-----------------|
| ILA-01 | **2** | Search→sections→rows |
| ILA-02 | **2** | Section headers spaced |
| ILA-03 | **2** | SectionList density |
| ILA-04 | **2** | Dept headers + rows |
| ILA-05 | **2** | Single title |
| ILA-06 | **2** | Row metadata alignment |
| ILA-07 | **1** | Some raw job keys (`CEO`, `DISPATCH SUPERVISOR`) on scroll — GWC |
| ILA-08 | **1** | Partial responsive |
| ILA-09 | **2** | Rows in thumb zone |
| ILA-10 | **2** | Team persona |

**Screenshots:** `docs/qa/evidence/mob-ux-12b-qa-screens/12b-team-list.png` (persona `uat.nv0002@xe.vn` — layout class representative)

---

### 7. Colleague detail — **17/20** PASS (cross-ref MOB-UX-12a)

| ID | Score | Evidence / note |
|----|-------|-----------------|
| ILA-01 | **2** | Hero→sections task order |
| ILA-02 | **2** | Grouped inset |
| ILA-03 | **2** | Hero + 3 sections fit viewport |
| ILA-04 | **2** | Liên hệ / Công việc / Chấm công sections |
| ILA-05 | **2** | Toolbar title only |
| ILA-06 | **2** | Row labels |
| ILA-07 | **2** | «Lái xe» not `DRIVER` |
| ILA-08 | **2** | Native res |
| ILA-09 | **2** | Actions reachable |
| ILA-10 | **2** | Colleague context |

**Screenshot:** `docs/qa/evidence/mob-ux-12a-screens/12a-detail-hero.png`

---

### 8. Profile — **15/20** FAIL

| ID | Score | Evidence / note |
|----|-------|-----------------|
| ILA-01 | **2** | Hero→tabs→content |
| ILA-02 | **1** | Tab strip density tight (F-3 partial) |
| ILA-03 | **2** | Grid cards 2×3 |
| ILA-04 | **2** | ProfileSectionCard groups |
| ILA-05 | **2** | Single identity block |
| ILA-06 | **2** | Stat/grid alignment |
| ILA-07 | **2** | Vietnamese |
| ILA-08 | **1** | Not matrix-probed |
| ILA-09 | **2** | Tab bar clearance |
| ILA-10 | **2** | NV profile |

**Note:** Hồ sơ tab adb-blocked on nv0001 (FAB). Cross-ref `mob-ux-12d-qa-r2` profile tab evidence.

---

### 9. Payslip — **13/20** FAIL

| ID | Score | Evidence / note |
|----|-------|-----------------|
| ILA-01 | **2** | Summary→list |
| ILA-02 | **2** | Section gaps OK |
| ILA-03 | **1** | Hero + rows — row density could tighten |
| ILA-04 | **2** | Period cards grouped |
| ILA-05 | **2** | «Phiếu lương» tab title |
| ILA-06 | **2** | Amount right (`82.340.000 ₫`) |
| ILA-07 | **1** | **`Kỳ lương 05/2026 — holding`** slug visible — GWC (not 0) |
| ILA-08 | **2** | Native res |
| ILA-09 | **2** | List above tab bar |
| ILA-10 | **2** | NV payslip |

**Screenshot:** `docs/qa/evidence/mob-ux-16-screens/16-payslip.png`

---

### 10. Settings — **12/20** FAIL

| ID | Score | Evidence / note |
|----|-------|-----------------|
| ILA-01 | **2** | Read card→actions |
| ILA-02 | **2** | Grouped inset |
| ILA-03 | **2** | Compact |
| ILA-04 | **2** | Section cards |
| ILA-05 | **2** | Single title |
| ILA-06 | **2** | Row layout |
| ILA-07 | **1** | MOB-UX-15c improved labels; Scope OU subtitles may still show slug (GWC) |
| ILA-08 | **1** | Not probed |
| ILA-09 | **2** | Settings rows reachable |
| ILA-10 | **1** | Dev-login gating differs qa-device vs release |

**Cross-ref:** `docs/qa/evidence/mob-ux-15c-20260609.md` (adb capture blocked — score from 15c QA scope + audit §2)

---

## Summary table

| Screen | ILA /20 | PASS? | Primary gap | Screenshot |
|--------|---------|-------|-------------|------------|
| Home | **16** | ✅ | ILA-08 Pro Max/4a; ILA-09 FAB | `16-home.png` |
| Notifications | **18** | ✅ | — | `16-notifications.png` |
| Leave list | **14** | ❌ | ILA-02 tab gap | `16-leave2.png` |
| Approvals | **14** | ❌ | ILA-03 empty breathing | `16-approvals.png` |
| CheckIn | **15** | ❌ | ILA-09 navigate | 13a cross-ref |
| Team directory | **16** | ✅ | ILA-07 job keys GWC | `12b-team-list.png` |
| Colleague detail | **17** | ✅ | — | `12a-detail-hero.png` |
| Profile | **15** | ❌ | ILA-02 tab density | 12d cross-ref |
| Payslip | **13** | ❌ | **ILA-07 `holding`** | `16-payslip.png` |
| Settings | **12** | ❌ | ILA-07 slug subtitles | 15c cross-ref |
| **Average** | **~14.6** | **FAIL** | Partner threshold 16 | — |

**Mandatory screens ≥16:** 4/10 (Home, Notifications, Team, Colleague)

**Hard fails (ILA-07=0 or ILA-01=0):** none

---

## Partner gate verdict

| Gate | Result |
|------|--------|
| Per-screen ≥16/20 | **FAIL** (6/10 below threshold) |
| ILA-07 / ILA-01 hard zero | **PASS** (no zeros) |
| `verify:mobile:layout` | **FAIL** (script bug — dev-mobile MOB-UX-16c) |
| 14d responsive (R6) | **FAIL** (Pro Max + Pixel 4a) |

**Overall:** **FAIL** — dispatch **dev-mobile** for MOB-UX-16a/b/e + payslip `holding` copy + 14-R7 resize before **MOB-UX-16-QC**.

---

## Handoff

```yaml
completion_report: |
  MOB-UX-16-QA ILA scorecard complete on R6 APK 2C62C82F… @ emulator-5554 / uat.nv0001@xe.vn.
  4/10 screens PASS ≥16/20 (Home borderline 16, Notifications 18, Team 16, Colleague 17).
  Partner avg ~14.6 FAIL. R6 14d: SE scrollDepth PASS; Pro Max+4a FAIL. verify:mobile:layout false FAIL (regex).
  Payslip ILA-07 GWC: «holding» slug in period label. Tab-bar FAB blocked adb team/profile/settings on nv0001.
next_owner: dev-mobile
next_dispatch_prompt: |
  work_item_id MOB-UX-16a — Home ILA-08: MOB-UX-14-R7 Pro Max/4a scrollDepth after wm resize;
  MOB-UX-16b — Leave+Approvals ILA-02/03 device gaps; MOB-UX-16e — Payslip resolveCompanyDisplayVi
  (remove «holding» from Kỳ lương row); MOB-UX-16c — fix verify-mobile-layout-composition.mjs regex for
  HomeSectionKey[]; re-dispatch qa-device MOB-UX-16-QA-R2 + qc MOB-UX-16-QC after avg ≥16.
evidence_path: docs/qa/evidence/mob-ux-16-ila-scorecard-20260609.md
ack_status: PASS_TO_PM
pm_dispatch_hint: dev-mobile P0 — Payslip holding ILA-07 + 14-R7 ProMax ILA-08; qc blocked until MOB-UX-16-QA-R2 PASS.
```
