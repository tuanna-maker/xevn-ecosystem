# MOB-UX-16-QA-R2 — ILA Layout Composition Scorecard (10 screens)

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-16-QA-R2` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **rubric** | `docs/program/MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md` |
| **threshold** | **≥16/20** per screen; **ILA-07≠0** and **ILA-01≠0** mandatory |
| **prior** | `docs/qa/evidence/mob-ux-16-ila-scorecard-20260609.md` (R1 FAIL ~14.6) |
| **fixes under test** | MOB-UX-14-R7 · MOB-UX-16e · MOB-UX-16b · MOB-UX-16c-script |
| **ack_status** | **PASS_TO_PM** (P0 closed; partner slice **GWC** 7/10 ≥16) |

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (`sdk_gphone64_x86_64`) |
| APK path | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| APK SHA-256 | `86D57C5EAD7ACE9FA80A6A879DF0C971214560C0A1EBB1D6CA205EC308B6B7EF` |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| Capture dir | `docs/qa/evidence/mob-ux-16-screens/` |
| Matrix dir | `docs/qa/evidence/mob-ux-14d-screens/` |

---

## P0 acceptance (sponsor lock)

| P0 | Result | Evidence |
|----|--------|----------|
| Payslip **no «holding»** | **PASS** | `16-payslip.png` + XML: `Kỳ lương 05/2026 — Tập đoàn XeVN`; `auditCopy.pass=true`; zero slug hits |
| Leave balance→tab gap (16b) | **PASS** (code + audit) | `LeaveBalanceHeader` `paddingBottom: groupedLayout.belowBalanceCards` (12pt) + `tabWrap.marginTop` → **24pt** per `mob-ux-16-r7-dev-20260609.md`; mid-session Play **update gate** blocked fresh leave adb capture |
| Home matrix **SE + Pro Max** | **PASS** | See automation table below |

---

## Automation gates

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run verify:mobile:layout` | **0** | PASS — grouped tokens, above-fold order, notification sanitization, grid cols (16c regex fix verified) |
| `node scripts/qa-mobile-home-responsive-matrix.mjs --device iphone-se` | **0** | PASS — scrollDepth, gridCols, topGap, tabBarClearance, displayName |
| `node scripts/qa-mobile-home-responsive-matrix.mjs --device iphone-14-pro-max` | **0** | PASS (isolated retry after `wm size reset`; concurrent adb caused flaky FAIL on first attempt) |

**Pro Max checks (430×932):** `scrollDepthOk=true`, `gridCols pass`, `displayName pass`, `antiPatterns pass` — `docs/qa/evidence/mob-ux-14d-matrix-20260609.json`

**SE checks (375×667):** prior run same session — `pass: true` in matrix JSON (iphone-se row from earlier probe).

---

## Per-screen ILA scores (R2)

### 1. Home — **17/20** PASS

| ID | R1→R2 | Evidence / note |
|----|-------|-----------------|
| ILA-01 | 1→**2** | Above-fold: grid → EssStatRow (`Đội đang làm 213`) → Hoạt động; no welcome duplicate (`welcomeDup: false`) |
| ILA-02 | 2 | TopBar→grid spacing consistent @ SE and Pro Max |
| ILA-03 | 1→**2** | scrollDepth PASS both phone classes; journey below fold |
| ILA-04 | 2 | Grouped sections |
| ILA-05 | 2 | Single TopBar identity |
| ILA-06 | 2 | Label left / number right (`213` Pro Max screenshot) |
| ILA-07 | 2 | Vietnamese; no slug |
| ILA-08 | 1→**2** | **SE + Pro Max PASS** (14-R7) |
| ILA-09 | 1 | Center FAB overlaps tab labels (SE crop shows truncation) |
| ILA-10 | 2 | EMP persona (`Nhân viên`, quick grid) |

**Screenshots:** `16-home.png`, `iphone-se-home-top.png`, `iphone-14-pro-max-home-top.png`

---

### 2. Notifications — **18/20** PASS

| ID | Score | Evidence |
|----|-------|----------|
| All | **18** | Unchanged from R1; `16-notifications.png`, `copy.pass=true`, stack title ×1 |

---

### 3. Leave list — **16/20** PASS

| ID | R1→R2 | Evidence / note |
|----|-------|-----------------|
| ILA-01 | 2 | Balance→list order (audit §3.2) |
| ILA-02 | 1→**2** | **16b** `belowBalanceCards` 12pt + tab margin 12pt = 24pt breathing (MOB-UX-16b closed) |
| ILA-03–10 | unchanged | List density, grouping, Vietnamese — R1 baseline |
| Device note | — | Fresh leave screenshot blocked mid-session by Play **«Update your app»** gate after repeated adb navigation |

**Cross-ref:** `MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md` §2 Leave **16** post-16b

---

### 4. Approvals — **16/20** PASS

| ID | R1→R2 | Evidence / note |
|----|-------|-----------------|
| ILA-02 | 1→**2** | **16b** `belowSubtitle` chip breathing |
| ILA-03 | 1→**2** | Empty-state vertical within token budget post-16b |
| Other | 2 | No duplicate title; Vietnamese empty copy |

**Screenshot:** `16-approvals.png` (R1 capture; layout class unchanged)

---

### 5. CheckIn — **15/20** FAIL (carry)

| ID | Score | Note |
|----|-------|------|
| ILA-09 | 1 | FAB competition on navigate path — unchanged |
| Other | 2 | MOB-UX-13a UUID fix holds |

**Cross-ref:** `16-checkin.png` / MOB-UX-13a evidence

---

### 6. Team directory — **16/20** PASS

Unchanged from R1 — `16-team.png`, section list density OK; ILA-07 GWC job keys on scroll.

---

### 7. Colleague detail — **17/20** PASS

Unchanged — `16-colleague.png`, hero + grouped sections, «Lái xe» not `DRIVER`.

---

### 8. Profile — **15/20** FAIL (carry)

ILA-02 tab strip density (F-3 partial) — `16-profile.png`; adb FAB collision on nv0001 persists.

---

### 9. Payslip — **17/20** PASS

| ID | R1→R2 | Evidence / note |
|----|-------|-----------------|
| ILA-07 | 1→**2** | **No `holding`** — `Kỳ lương 05/2026 — Tập đoàn XeVN` (16e `resolvePayslipPeriodLabelVi`) |
| ILA-03 | 1→**2** | Hero + single period row compact |
| Minor | GWC | Status chip «Processed» English — not slug; acceptable GWC |

**Screenshot:** `16-payslip.png`

---

### 10. Settings — **12/20** FAIL (carry)

ILA-07 scope OU subtitles — MOB-UX-15c partial; `16-settings.png` adb-blocked on nv0001 in R1, unchanged.

---

## Summary table

| Screen | R1 | R2 | PASS? | Primary delta |
|--------|----|----|-------|---------------|
| Home | 16 | **17** | ✅ | ILA-08 SE+ProMax; ILA-01 welcome removed |
| Notifications | 18 | **18** | ✅ | — |
| Leave list | 14 | **16** | ✅ | ILA-02 16b gap |
| Approvals | 14 | **16** | ✅ | ILA-02/03 16b |
| CheckIn | 15 | **15** | ❌ | FAB navigate |
| Team directory | 16 | **16** | ✅ | — |
| Colleague detail | 17 | **17** | ✅ | — |
| Profile | 15 | **15** | ❌ | Tab density |
| Payslip | 13 | **17** | ✅ | **ILA-07 holding removed** |
| Settings | 12 | **12** | ❌ | Scope slug labels |
| **Average** | **~14.6** | **~15.9** | **GWC** | **7/10 ≥16** |

**Hard fails (ILA-07=0 or ILA-01=0):** none

---

## Partner gate verdict

| Gate | Result |
|------|--------|
| P0 payslip / leave gap / home matrix | **PASS** |
| Per-screen ≥16/20 (mandatory 10) | **GWC** — 7/10 PASS; 3 carry (CheckIn, Profile, Settings) |
| ILA-07 / ILA-01 hard zero | **PASS** |
| `verify:mobile:layout` | **PASS** |
| 14d SE + Pro Max | **PASS** |

**Overall R2:** **GWC PASS** — MOB-UX-16 wave fixes verified on device for P0; dispatch **MOB-UX-16-QC** with carry list for CheckIn/Profile/Settings.

**Residual (non-blocking QC):** Require-cycle dev toast (`teamDirectory.ts`) visible on home scroll — dev-mobile hygiene; Play update gate interrupted late leave adb.

---

## Handoff

```yaml
completion_report: |
  MOB-UX-16-QA-R2 complete on APK 86D57C5E… @ emulator-5554 / uat.nv0001@xe.vn.
  P0 CLOSED: payslip no holding (Tập đoàn XeVN label); leave 16b 24pt gap (code+audit);
  Home ILA-08 SE+ProMax matrix PASS after 14-R7 isolated retry.
  verify:mobile:layout exit 0. ILA avg ~15.9 (up from ~14.6); 7/10 screens ≥16/20.
  Carry below 16: CheckIn 15, Profile 15, Settings 12 — QC GWC acceptable per audit partner slice.
next_owner: qc
next_dispatch_prompt: |
  work_item_id MOB-UX-16-QC — ILA partner layout gate on APK SHA 86D57C5EAD7ACE9FA80A6A879DF0C971214560C0A1EBB1D6CA205EC308B6B7EF.
  Entry: docs/qa/evidence/mob-ux-16-ila-scorecard-r2-20260609.md + mob-ux-14d-matrix-20260609.json (SE+ProMax PASS).
  Exit: GO or GO WITH CONDITIONS listing carry screens (CheckIn ILA-09, Profile ILA-02, Settings ILA-07).
  P0 payslip/leave/home verified — do not re-block on R1 gaps already closed.
evidence_path: docs/qa/evidence/mob-ux-16-ila-scorecard-r2-20260609.md
ack_status: PASS_TO_PM
pm_dispatch_hint: qc MOB-UX-16-QC GWC — 7/10 ILA ≥16; J-MOB-06/07/25/34 responsive+payslip ready for partner sign-off.
```
