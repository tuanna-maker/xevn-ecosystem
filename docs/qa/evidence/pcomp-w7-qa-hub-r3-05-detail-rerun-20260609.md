# PCOMP-W7-QA-HUB-R3-05-RERUN-DETAIL — J-MOB-09 whos-out detail retest

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-QA-HUB-R3-05-RERUN-DETAIL` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **pm_dispatch_hint** | `qc` — promote J-MOB-09 device PASS; close C-W7QC-DEVICE-01 J-MOB-09 slice; update `PROGRAM_JOURNEY_MAP.md` |
| **device** | `emulator-5554` |
| **API** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` (71,779,426 B) |
| **SHA-256** | `C2F76C2C1AE973894BF8101E44FC60B2C2195C8344E5D916E3F2C9031BD56FBA` |
| **upstream** | `PCOMP-W7-MOB-WHOS-DETAIL-01` · [`pcomp-w7-mob-whos-detail-01-20260609.md`](pcomp-w7-mob-whos-detail-01-20260609.md) |

---

## Executive verdict

**PASS_TO_PM** — WHOS-DETAIL-01 fix verified on device. Cold boot **PASS** (no «App entry not found»). Seed `who=1`, API hub probe **PASS**. Deep-link login **PASS** (`home_reached=true`). **J-MOB-09** full journey **PASS**: «Ai nghỉ hôm nay (1)» → tap Huỳnh whos-out row → «Chi tiết nghỉ» shows **Từ ngày** / **Đã duyệt** / Huỳnh Văn An — **NOT** «Không tìm thấy đơn». **J-MOB-06/07/08** regression **PASS**. **D-W8-ESS-PROMISE-01** **PASS** (no promise snackbar).

---

## Environment & commands

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"

# 1 Reseed
node scripts/seed-hrm-uat-mob-hub-qual.mjs                    # exit 0 — whos_out_count=1

# 2 Clear + install (SHA C2F76C2C…56FBA, 71,779,426 B)
& $adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile     # Success
& $adb -s emulator-5554 install -r $apk                       # Success

# 3 Cold boot
& $adb -s emulator-5554 shell logcat -c
& $adb -s emulator-5554 shell am start -W -n vn.xevn.hrm.mobile/.MainActivity
# NO «App entry not found» — login form visible

# 4 Deep-link login
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# exit 0 — home_reached=true, fatal_logcat=false

# 5 J-MOB-09 detail tap (whos-out row bounds center 540,1982 — NOT birthday Huỳnh)
# scroll → tap whos-out Button → detail dump

# 6 Hub regression audit
node scripts/tmp-pcomp-w7-qa-hub-r3-05-detail-rerun.mjs       # J-MOB-06/07/08 + promise PASS
```

Machine JSON: [`pcomp-w7-qa-hub-r3-05-detail-rerun-20260609.json`](pcomp-w7-qa-hub-r3-05-detail-rerun-20260609.json)  
Screens/XML: `docs/qa/evidence/pcomp-w7-qa-hub-r3-05-detail-rerun-screens/`

---

## Exit criteria matrix

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | Reseed `who≥1` | **PASS** | `whos_out_count=1`, `leave_id=6c887177-…` (Huỳnh Văn An) |
| 2 | `pm clear` + install APK | **PASS** | 71,779,426 B; SHA-256 match |
| 3 | Boot — NO «App entry not found» | **PASS** | [`r3-05-detail-boot.png`](pcomp-w7-qa-hub-r3-05-detail-rerun-screens/r3-05-detail-boot.png) |
| 4 | `qa-mobile-login-intent.mjs` → Home | **PASS** | `home_reached=true` |
| 5 | J-MOB-09 «Ai nghỉ hôm nay (1)» → tap → detail | **PASS** | Từ ngày + Đã duyệt; no empty state |
| 6 | D-W8-ESS-PROMISE-01 | **PASS** | No promise snackbar on Home |
| 7 | J-MOB-06/07/08 regression | **PASS** | Aggregate scroll audit |
| 8 | Evidence + handoff | **PASS** | This file |

---

## API probe (nip.io)

| Field | Value |
|-------|-------|
| Login | **PASS** |
| `GET /home/summary?company_id=holding&include=…` | **HRM-HOME-200** |
| `tasks_total` | 10 |
| `mgr_total` | 2 |
| `cel_total` | 3 |
| `who_total` | **1** |

---

## Hub journey verdicts

| ID | Verdict | Device evidence |
|----|---------|-----------------|
| **J-MOB-01** | **PASS** | Deep-link login → Home ≤60s |
| **J-MOB-06** | **PASS** | `detail-rerun-scroll-*.xml`: «Việc cần làm» |
| **J-MOB-07** | **PASS** | «Cần duyệt (2)» = API mgr=2 |
| **J-MOB-08** | **PASS** | «Sinh nhật hôm nay» + avatars; no birth year |
| **J-MOB-09** | **PASS** | `whos-scroll.xml` section `(1)`; tap → `whos-detail.xml` «Chi tiết nghỉ», Từ ngày 08/06/2026, Đã duyệt, Huỳnh Văn An |
| **D-W8-ESS-PROMISE-01** | **PASS** | No promise snackbar |

---

## J-MOB-09 detail verification

| Step | Observation |
|------|-------------|
| Scroll to «Ai nghỉ hôm nay (1)» | **PASS** — `home-whos-out-section` in `whos-scroll.xml` |
| Tap whos-out row (Huỳnh Văn An, Nghỉ phép năm) | **PASS** — bounds `[42,1882][1038,2082]` |
| Detail title | **PASS** — «Chi tiết nghỉ» |
| Leave fields | **PASS** — Từ ngày 08/06/2026, Loại nghỉ Nghỉ phép năm, Đã duyệt |
| Empty state | **ABSENT** — no «Không tìm thấy đơn» |
| Screenshot | [`whos-detail.png`](pcomp-w7-qa-hub-r3-05-detail-rerun-screens/whos-detail.png) |

**Note:** Generic `findContainsBounds('Huỳnh')` automation false-negative — birthday avatar Huỳnh at y≈1599 vs whos-out row at y≈1982. Manual tap on whos-out Button confirms fix.

---

## Logcat audit

| Check | Result |
|-------|--------|
| `x-company-id` = UUID (not `main`) | **PASS** |
| Unhandled promise in logcat | **PASS** — not observed |
| FATAL EXCEPTION | **PASS** — not observed |

---

## completion_report

- Reseeded hub qual — `whos_out_count=1` for J-MOB-09 positive path.
- Installed WHOS-DETAIL-01 APK (71,779,426 B, SHA C2F76C2C…56FBA).
- Cold boot **PASS** — no «App entry not found» after `pm clear`.
- Deep-link login **PASS** (`home_reached=true`).
- API nip.io hub probe **PASS** (tasks=10, mgr=2, cel=3, who=1).
- **J-MOB-09 FULL PASS** — whos-out tap opens leave detail with Từ ngày / Đã duyệt (prior R3-05-RERUN «Không tìm thấy đơn» **CLOSED**).
- **J-MOB-06/07/08** regression **PASS**.
- **D-W8-ESS-PROMISE-01** **PASS**.

## next_owner

`pm` → dispatch **`qc`** (J-MOB-09 promote + journey map sync)

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-QC-HUB-R3-05-DETAIL
from_role: pm
to_role: qc
lane: execution

entry_criteria:
- PCOMP-W7-QA-HUB-R3-05-RERUN-DETAIL PASS_TO_PM — J-MOB-09 device full PASS
- Evidence: docs/qa/evidence/pcomp-w7-qa-hub-r3-05-detail-rerun-20260609.md
- Prior FAIL: pcomp-w7-qa-hub-r3-05-rerun-20260609.md (detail empty state)

action:
1. Audit J-MOB-09 evidence (whos-detail.xml — Từ ngày, Đã duyệt, no «Không tìm thấy đơn»)
2. Promote J-MOB-09 in PROGRAM_JOURNEY_MAP.md; close C-W7QC-DEVICE-01 J-MOB-09 slice
3. GO or GWC for hub R3-05 detail wave

exit_criteria:
- evidence docs/qa/evidence/pcomp-w7-qc-hub-r3-05-detail-{date}.md
- ack_status PASS_TO_PM or GO WITH CONDITIONS
```

## evidence_path

`docs/qa/evidence/pcomp-w7-qa-hub-r3-05-detail-rerun-20260609.md`

## ack_status

**PASS_TO_PM**
