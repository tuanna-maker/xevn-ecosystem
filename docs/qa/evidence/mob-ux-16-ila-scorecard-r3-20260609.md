# MOB-UX-16-QA-R3 — ILA Layout Composition Scorecard (10 screens, post-16d)

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-16-QA-R3` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **rubric** | `docs/program/MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md` |
| **threshold** | **≥16/20** per screen; **ILA-07≠0** and **ILA-01≠0** mandatory |
| **prior** | `docs/qa/evidence/mob-ux-16-ila-scorecard-r2-20260609.md` (GWC 7/10) |
| **fixes under test** | **MOB-UX-16d** carry bundle (CheckIn ILA-09 · Profile ILA-02 · Settings ILA-07) |
| **ack_status** | **PASS_TO_PM** |

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (`sdk_gphone64_x86_64`, 1080×2400) |
| APK path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK SHA-256 | `91AC496FB94D672E11348BBE85A23526C6D4BF4D26113BB4DDF7080DC29538AD` |
| APK bytes | 69135844 |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| Capture dir | `docs/qa/evidence/mob-ux-16-screens/` (R3 prefix `r3-*`) |
| Matrix | `docs/qa/evidence/mob-ux-14d-matrix-20260609.json` (same APK SHA) |

---

## Build / install / gates

| Command | Exit | Result |
|---------|------|--------|
| `pnpm --filter hrm-mobile run android:apk:qa-device` | **0** | Fresh bundle + Gradle assembleRelease → dist APK |
| `adb -s emulator-5554 install -r hrm-mobile-qa-device.apk` | **0** | Success |
| `pnpm run verify:mobile:layout` | **0** | PASS |
| `pnpm run test:mobile:user-copy` | **0** | PASS — 23 TSX + scopeError vitest |
| `node scripts/qa-mobile-home-responsive-matrix.mjs --device iphone-se` | **0** | PASS |
| `node scripts/qa-mobile-home-responsive-matrix.mjs --device iphone-14-pro-max` | **0** | PASS (matrix JSON same SHA; isolated run post-SE) |
| `adb shell pm grant … ACCESS_FINE_LOCATION` | **0** | Required before CheckIn capture (location prompt) |

---

## MOB-UX-16d carry verification (P0)

| Carry ID | Target | Device result | Evidence |
|----------|--------|---------------|----------|
| **GWC-16-CARRY-01** CheckIn ILA-09 | FAB hidden on CheckIn; sticky footer ≥24dp | **PARTIAL** | `r3-checkin.xml`: `check-in-sticky-footer` + `check-in-submit` «Chấm công vào» **PASS**; `check-in-fab` **still in UI tree** on CheckIn screen **FAIL** |
| **GWC-16-CARRY-02** Profile ILA-02 | SegmentedTabBar 16/12pt gaps | **PASS** | `r3-profile.xml`: `profile-tab-bar` bounds y=507; subtitle→tab breathing ≥12pt; `profile-tab-info` y=649 |
| **GWC-16-CARRY-03** Settings ILA-07 | Vietnamese OU / no slug | **GWC** | Device Settings/Scope adb path not exposed from Profile for nv0001; **unit + layout gates PASS** (`scopeScreenCopy.test.ts`, `mob-ux-16d.test.ts`, `test:mobile:user-copy`) |

### CheckIn carry detail (`r3-checkin.xml`)

```text
resource-ids present: check-in-hero, check-in-sticky-footer, check-in-submit, check-in-history
FAB present on CheckIn: check-in-fab = true (expected hidden per shouldHideCheckInFab)
Copy: Vietnamese identity hero; no UUID in visible text
Sticky CTA: «Chấm công vào» above tab bar
Screenshot: docs/qa/evidence/mob-ux-16-screens/r3-checkin.png
```

---

## Per-screen ILA scores (R3)

Scoring uses R3 device captures where fresh; R2/R1 device artifacts where Play **«Update your app»** gate blocked re-capture (leave list, colleague detail mid-session).

### 1. Home — **17/20** PASS

| ID | Score | Evidence |
|----|-------|----------|
| ILA-01–10 | 17 total | `r3-home.png` / `r3-login-check.xml`: grid 4-col tiles, EssStatRow, Hoạt động; no welcomeDup; `Tập đoàn XeVN` company line |
| ILA-08 | **2** | SE + Pro Max matrix PASS @ APK SHA 91AC496F… |
| ILA-09 | 1 | Center FAB on home (expected); tab labels readable |

---

### 2. Notifications — **18/20** PASS

Unchanged from R2. `r3-notifications.png`, stack title ×1, `copy.pass=true`.

---

### 3. Leave list — **16/20** PASS

| ID | Score | Evidence |
|----|-------|----------|
| ILA-02 | **2** | MOB-UX-16b `belowBalanceCards` — R2 code+audit; fresh adb blocked by Play update gate (`r3-leave-list.xml` = YouTube overlay) |
| Other | 2 | R2 baseline + `16-leave-r2.xml` / dev 16b evidence |

**Note:** Re-verify leave adb on clean emulator recommended for QC; score upheld from 16b closure + unchanged layout class.

---

### 4. Approvals — **16/20** PASS

| ID | Score | Evidence |
|----|-------|----------|
| ILA-02/03 | **2** | `16-approvals.png` / `16-approvals.xml`: chip row «Tất cả (1)»; Vietnamese empty copy; no duplicate stack title |
| Device | — | Fresh R3 adb hijacked by Play gate; R1 capture valid (layout class unchanged since 16b) |

---

### 5. CheckIn — **15/20** FAIL (carry partial)

| ID | R2→R3 | Evidence |
|----|-------|----------|
| ILA-09 | 1→**1** | Sticky footer **improved** (`check-in-sticky-footer`); **FAB not hidden** on focused CheckIn — 16d acceptance **not met** |
| ILA-07 | 2 | No UUID slug in UI |
| ILA-04 | 2 | Hero + grouped sections |
| **Total** | **15** | Below 16 threshold |

---

### 6. Team directory — **16/20** PASS

`r3-team.png`, section list density OK, Vietnamese copy, `copy.pass=true`.

---

### 7. Colleague detail — **17/20** PASS

R2 device evidence unchanged (`16-colleague.png` — hero + grouped sections, «Lái xe» not `DRIVER`). Fresh row tap blocked by Play gate this session.

---

### 8. Profile — **16/20** PASS (carry closed)

| ID | R2→R3 | Evidence |
|----|-------|----------|
| ILA-02 | 1→**2** | **16d** `profile-tab-bar` margin tokens visible; tabs «Thông tin / Công việc / Tài liệu» breathing below subtitle |
| Other | 2 | `r3-profile.png`, grouped sections, Vietnamese |

---

### 9. Payslip — **17/20** PASS

| ID | Evidence |
|----|----------|
| ILA-07 | **2** — `r3-payslip.xml`: «Kỳ lương 05/2026 — Tập đoàn XeVN»; `noHoldingSlug=true` |
| ILA-03 | **2** | Compact period row |

---

### 10. Settings/Scope — **16/20** PASS (GWC device)

| ID | R2→R3 | Evidence |
|----|-------|----------|
| ILA-07 | 1→**2** | **16d** `scopeScreenCopy.ts` + Settings `resolveCompanyDisplayVi` / `resolveAuthRolesVi` — vitest PASS |
| Device adb | GWC | No in-app Settings entry from Profile for nv0001; Scope/Settings screen adb not captured this run |
| Static | PASS | `mob-ux-16d.test.ts` ILA-07 rows; `verify:mobile:layout` notification/scope sanitization |

---

## Summary table

| Screen | R2 | R3 | PASS? | Primary delta |
|--------|----|----|-------|---------------|
| Home | 17 | **17** | ✅ | Same APK matrix SE+ProMax |
| Notifications | 18 | **18** | ✅ | — |
| Leave list | 16 | **16** | ✅ | 16b gap (adb GWC) |
| Approvals | 16 | **16** | ✅ | 16b (adb GWC) |
| CheckIn | 15 | **15** | ❌ | Sticky footer ✅; FAB hide ❌ |
| Team directory | 16 | **16** | ✅ | Fresh R3 |
| Colleague detail | 17 | **17** | ✅ | R2 carry |
| Profile | 15 | **16** | ✅ | **16d ILA-02 closed** |
| Payslip | 17 | **17** | ✅ | Fresh R3 |
| Settings | 12 | **16** | ✅ GWC | **16d ILA-07 unit/layout** |
| **Average** | **~15.9** | **~16.3** | **GWC** | **9/10 ≥16** |

**Hard fails (ILA-07=0 or ILA-01=0):** none

---

## Partner gate verdict

| Gate | Result |
|------|--------|
| Fresh qa-device APK rebuild + install | **PASS** |
| Per-screen ≥16/20 (mandatory 10) | **GWC** — **9/10**; CheckIn **15** remains |
| 16d carry bundle | **GWC** — Profile ✅ Settings ✅ (unit); CheckIn FAB hide ❌ |
| ILA-07 / ILA-01 hard zero | **PASS** |
| `verify:mobile:layout` + user-copy | **PASS** |
| 14d SE + Pro Max @ same SHA | **PASS** |

**Overall R3:** **GWC PASS_TO_PM** — partner slice avg **~16.3/20**; dispatch **MOB-UX-16-QC** with CheckIn FAB residual + Settings device smoke GWC.

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **R3-CHECKIN-FAB-01** | P1 | dev-mobile | `check-in-fab` visible in uiautomator on CheckIn despite `shouldHideCheckInFab('CheckIn')` — navigation state / overlay mount; sticky footer present |
| **R3-SETTINGS-DEVICE-01** | P2 | dev-mobile + qa-device | No Profile→Settings navigation affordance on nv0001 EMP; QC should capture Settings+Scope once entry exposed or deep-link documented |
| **R3-PLAY-GATE-01** | P2 | qa-device | Emulator Play **«Update your app»** (YouTube) hijacked leave/approvals/colleague adb mid-session — use `adb shell pm clear com.google.android.youtube` or disable Play auto-update on AVD |
| **R3-DEV-TOAST-01** | P3 | dev-mobile | Require-cycle snackbar (`teamDirectory.ts`) on home scroll — hygiene; non-blocking QC |
| **R3-LEAVE-ADB-01** | P2 | qa-device | Fresh leave list screenshot pending clean adb (16b gap already code-verified) |

---

## Handoff

```yaml
completion_report: |
  MOB-UX-16-QA-R3 complete on fresh APK SHA 91AC496F… @ emulator-5554 / uat.nv0001@xe.vn @ nip.io.
  Rebuilt qa-device APK, installed, ILA scorecard 10/10 scored. Avg ~16.3 (up from R2 ~15.9).
  16d carry: Profile ILA-02 PASS (16/20); Settings ILA-07 PASS GWC (16/20 unit+layout);
  CheckIn sticky footer PASS but FAB still in tree — 15/20 carry NOT fully closed.
  verify:mobile:layout + test:mobile:user-copy + 14d SE/ProMax PASS on same SHA.
  9/10 screens ≥16; partner slice GWC ready for MOB-UX-16-QC.
next_owner: qc
next_dispatch_prompt: |
  work_item_id MOB-UX-16-QC — ILA partner layout gate on APK SHA 91AC496FB94D672E11348BBE85A23526C6D4BF4D26113BB4DDF7080DC29538AD.
  Entry: docs/qa/evidence/mob-ux-16-ila-scorecard-r3-20260609.md + mob-ux-14d-matrix-20260609.json.
  Exit: GO or GO WITH CONDITIONS — list CheckIn FAB residual (R3-CHECKIN-FAB-01), Settings device GWC (R3-SETTINGS-DEVICE-01), Play gate adb note.
  Profile 16d carry CLOSED; do not re-block on R2 payslip/leave/home gaps.
evidence_path: docs/qa/evidence/mob-ux-16-ila-scorecard-r3-20260609.md
ack_status: PASS_TO_PM
pm_dispatch_hint: qc MOB-UX-16-QC — R3 GWC 9/10 ILA ≥16 avg 16.3; J-MOB partner slice; CheckIn FAB residual P1
```
