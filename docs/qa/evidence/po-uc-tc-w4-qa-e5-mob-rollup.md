# PO-UC-TC-W4-QA-E5-MOB — Mobile P0 device smoke rollup

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E5-MOB` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **lane** | execution |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **U65** | honored — no `pnpm seed:*` · no DB fake · UI login + FE mutate |
| **u65_zero_seed** | true |
| **device** | `emulator-5554` · AVD `xevn_api34` · API 34 |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` · 71,602,307 B · SHA256 `AB93DA36B9B44776764268F994873FFB2E77A1E1F2B9C1701610C5A65433F5AB` · `vn.xevn.hrm.mobile` 1.0.0 |
| **persona** | `uat.nv0003@xe.vn` / `xevn-uat-2026` |
| **API** | L0 probe `http://127.0.0.1:28001` **200** · UI login used baked pilot `http://14.225.217.232:3001` (**200**) |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/` |
| **device logs** | `po-uc-tc-w4-qa-e5-mob-device-log.json` · `-r2.json` · `-r3.json` · `-r3c.json` · `-leave.json` |
| **by-uc** | `UC-HRM-MOB-01` · `02` · `04` · `06` |
| **J-*** | J-MOB-01 (login/home) · J-MOB-02 (check-in GPS) · leave create L1 (J-MOB-23/25 adjacent) |

---

## Executive verdict

**PASS_TO_PM** — Device/emulator smoke **ran** (not BLOCKED-EXTERNAL). P0 HP paths for login, single-CT home, check-in (`HRM-ATT-201`), ATT update-request create (`HRM-ATT-REQ-201`), leave list + 4-step wizard **observed**. Leave/att **L2** kept **SPEC_GAP** (no invent PASS). Leave **submit** mutate deferred (balance 0 warning on wizard). **Not** UAT DONE / Phase 1 DONE.

| UC | Seat verdict | Notes |
|----|--------------|-------|
| **UC-HRM-MOB-01** | **PASS** (P0 smoke) | UI login HP + FD; API FD 401 |
| **UC-HRM-MOB-02** | **PARTIAL** | Single-membership auto **PASS**; multi-CT confirm **N/A** (1 mem); UUID ≠ `main` **PASS** |
| **UC-HRM-MOB-04** | **PASS** (P0 smoke) | Check-in screen + submit → **HRM-ATT-201**; GPS optional path (no location permission → message; still check-in) |
| **UC-HRM-MOB-06** | **PARTIAL** + **SPEC_GAP L2** | ATT create **PASS** (`HRM-ATT-REQ-201`); leave nav **PASS**; leave wizard L1 **PARTIAL** (open, no submit); L2 SG **SPEC_GAP** |

---

## Environment / steps tried

| Step | Result |
|------|--------|
| `adb devices` (start) | empty → start AVD `xevn_api34` |
| Emulator boot | `emulator-5554` `sys.boot_completed=1` |
| `adb install -r` qa-device APK | **Success** |
| L0 `GET :28001/api/hrm` | **200** |
| Pilot `GET :3001/api/hrm` | **200** (APK default base) |
| Physical device | **none** attached — used emulator (honest) |

---

## Case matrix (P0 focus)

### UC-HRM-MOB-01

| TC-ID | Verdict | Evidence |
|-------|---------|----------|
| TC-HRM-MOB-01-LOGIN-HP-001 | **PASS** | UI → Home `01-home.png` · UAT NV 0003 · Tập đoàn X.E |
| TC-HRM-MOB-01-LOGIN-FD-001 | **PASS** | UI `HRM-AUTH-401` · `01-fd-after.png` · API status 401 |
| TC-HRM-MOB-01-LOGIN-AU-001 | **NOT_RUN** | smoke scope — header mismatch deferred |
| TC-HRM-MOB-01-REFRESH-HP-002 | **NOT_RUN** | kill-reopen deferred |

### UC-HRM-MOB-02

| TC-ID | Verdict | Evidence |
|-------|---------|----------|
| TC-HRM-MOB-02-SINGLE-HP-002 | **PASS** | `mems=1` · Home company **Tập đoàn X.E** · UUID `10000000-0000-4000-8000-000000000001` |
| TC-HRM-MOB-02-CONFIRM-HP-001 | **N/A** | persona 1 membership — multi-CT picker not exercised |
| TC-HRM-MOB-02-CONFIRM-FD-001 | **N/A** | requires forced multi-CT confirm |
| TC-HRM-MOB-02-MISMATCH-AU-001 | **PASS** (API scope) | active `company_uuid` ≠ slug `main` |

### UC-HRM-MOB-04

| TC-ID | Verdict | Evidence |
|-------|---------|----------|
| TC-HRM-MOB-04-OPEN-HP-003 | **PASS** | tile `home-action-tile-checkin` → `04-checkin.png` |
| TC-HRM-MOB-04-CHECKIN-HP-001 | **PASS** | dialog **Thành công / HRM-ATT-201** · `r2-home.png` |
| TC-HRM-MOB-04-GPS-HP-002 | **PASS** (optional path) | message *Chưa có quyền truy cập vị trí… vẫn có thể chấm công* · `r2-04-checkin.png` |
| TC-HRM-MOB-04-GPS-FD-001 | **PARTIAL** | deny/permission message observed; dedicated deny-dialog path not re-run |
| TC-HRM-MOB-04-DUP-FD-002 | **NOT_RUN** | — |
| TC-HRM-MOB-04-CHECKIN-AU-001 | **NOT_RUN** | — |

### UC-HRM-MOB-06

| TC-ID | Verdict | Evidence |
|-------|---------|----------|
| TC-HRM-MOB-06-ATT-NAV-HP-003 | **PASS** | FAB **Thao tác nhanh** · `r3c-fab.png` |
| TC-HRM-MOB-06-ATT-CREATE-HP-001 | **PASS** | form prefilled + **Gửi đơn** → **HRM-ATT-REQ-201** · `r3c-att.png` / `r3c-att-fd.png` |
| TC-HRM-MOB-06-LV-NAV-HP-004 | **PASS** | `home-action-tile-time_off` → *Nghỉ phép của tôi* · `r3-06-leave.png` / `r3-06-wizard.png` (list) |
| TC-HRM-MOB-06-LV-CREATE-HP-002 | **PARTIAL** | 4-step wizard open · `r3-06-wizard-final.png` · balance 0 warning · **submit not completed** (U65 smoke — avoid orphan leave) |
| TC-HRM-MOB-06-VAL-FD-001 | **NOT_RUN** | ATT form ships defaults (`adjust_check_in` + reason) — empty-field FD not isolatable without clear |
| TC-HRM-MOB-06-L2-SG-001 | **SPEC_GAP** | inventory only — **không invent PASS** |
| TC-HRM-MOB-06-L2-SG-002 | **SPEC_GAP** | inventory only — **không invent PASS** |

---

## hdsd_inventory (U76)

| # | Surface | Found | Used | Verdict |
|---|---------|-------|------|---------|
| 1 | Login email/password | Yes | UC-01 HP/FD | 🟢 |
| 2 | Home shell / company label | Yes | UC-02 | 🟢 |
| 3 | Tile Chấm công | Yes | UC-04 | 🟢 |
| 4 | Tile Nghỉ phép | Yes | UC-06 LV | 🟢 |
| 5 | FAB Thao tác nhanh → Đơn công / Đơn nghỉ | Yes | UC-06 ATT | 🟢 |
| 6 | Leave 4-step wizard | Yes | UC-06 LV create | 🟢 nav |
| 7 | Leave L2 ladder | No product path | SPEC_GAP | ⚪ honest |

---

## Residuals / pm_dispatch_hint

| ID | Severity | Hint |
|----|----------|------|
| **R-E5-MOB-LEAVE-SUBMIT** | P2 | Optional: complete leave wizard submit when balance >0 (persona with remaining days) — U65 FE only |
| **R-E5-MOB-MULTI-CT** | P2 | UC-02 CONFIRM-HP needs multi-membership persona (not `uat.nv0003`) |
| **R-E5-MOB-ATT-FD-EMPTY** | P2 | Form defaults prevent empty FD — product/BA confirm if defaults OK vs require user-entered reason |
| **R-E5-MOB-L2** | SPEC_GAP | Keep inventory; do **not** claim Leave L2 PASS |

**Not claimed:** UAT DONE · Phase 1 DONE · invent Leave L2 PASS · seed.

---

## Handoff

```
work_item_id: PO-UC-TC-W4-QA-E5-MOB
from_role: qa-device
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-rollup.md
completion_report: Emulator smoke closed for UC-HRM-MOB-01/02/04/06 P0. Login+check-in+ATT create PASS; leave wizard PARTIAL; L2 SPEC_GAP honest. Not UAT DONE.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: PO-UC-TC-W4-QA-E5-INTAKE
  from_role: pm
  to_role: pm (intake) → optional qa/dev-mobile
  entry_criteria: read po-uc-tc-w4-qa-e5-mob-rollup.md
  exit_criteria: update by-uc execution notes; chain W4-B or residual R-E5-MOB-* if sponsor wants leave submit / multi-CT
  cấm: invent L2 PASS · seed
```
