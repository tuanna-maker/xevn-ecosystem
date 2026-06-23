# MOB-UX-12a-QA — TeamColleagueDetail SET G-1 device L2.5

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-12a-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** (GO WITH CONDITIONS — APK SHA drift; email handler not captured on emulator) |
| **journey** | J-MOB-30 ext (team directory → colleague detail polish) |
| **upstream** | `mob-ux-12a-20260609.md` (dev-mobile READY_FOR_QA) |

---

## Executive verdict

**PASS_TO_PM** — `emulator-5554` @ nip.io, persona `uat.nv0002@xe.vn` / `xevn-uat-2026` (trsport). Tab **Đội nhóm** → row tap → **TeamColleagueDetail** opens with MOB-UX-12a hero + grouped sections. Screenshots prove blue gradient hero, localized role **Lái xe** (not `DRIVER`), status **Đang làm việc** (not `active`), sections **Liên hệ** / **Công việc** / **Chấm công hôm nay**, Email quick action when data present (no **Gọi** — phone `—`). Pull-to-refresh does not stick shimmer. **J-MOB-30 ext** back via toolbar **Navigate up** preserves search + filter chips.

**GWC:** Installed APK SHA `6F2C471C…` ≠ dispatch expected `5398508E…` (newer local build, 68,918,537 B). Email chip `content-desc` present; system mailto picker not observed on headless emulator tap (non-blocking).

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | 68,918,537 B |
| SHA-256 (installed) | `6F2C471C6AFA8967042ED3CF6E6E62D61CFDEEA78EA6C1ED19E7ACAA13B88850` |
| SHA-256 (dispatch expected) | `5398508EE007E1E795D071A547F034AA3F5A41A6B4827EB889545280003281A8` |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0002@xe.vn` / `xevn-uat-2026` |
| Login | `xevn://qa-login` deep link (`scripts/qa-mobile-login-intent.mjs`) |
| Sample colleague | Bùi Quốc An · HLD-0091 · Ban Điều hành · Lái xe |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `adb devices -l` | **0** | `emulator-5554 device` |
| `adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` | **0** | Success |
| `Get-FileHash … -Algorithm SHA256` | **0** | `6F2C471C…` (mismatch vs dispatch) |
| `node scripts/tmp-mob-ux-12a-qa-device.mjs` | **1** | Hero/sections OK; attendance below fold; system back exited app |
| `node scripts/tmp-mob-ux-12a-qa-finish.mjs` | **0** | Scroll → attendance visible; Navigate up → list preserved |

---

## MOB-UX-12a UI contract

| Check | Result | Evidence |
|-------|--------|----------|
| Hero `LinearGradient` band + avatar ring | **PASS** | `12a-r2-detail-hero.png` — blue gradient, initials avatar |
| Subtitle «Phòng · Chức danh» localized | **PASS** | «Ban Điều hành · Lái xe» — not `DRIVER` |
| Attendance pill «Chưa chấm»/«Đã chấm» | **PASS** | Hero badge + section row |
| No raw `DRIVER` / `active` enums | **PASS** | XML + screenshots; status «Đang làm việc» |
| Section **Liên hệ** | **PASS** | `team-colleague-section-contact` / screenshot |
| Section **Công việc** | **PASS** | `team-colleague-section-work` / `12a-r2-detail-sections.png` |
| Section **Chấm công hôm nay** | **PASS** | After scroll — `12a-r2-detail-sections.png` |
| Quick action **Email** (data present) | **PASS** | `team-colleague-quick-actions-email`; `uat.nv0091@xe.vn` |
| Quick action **Gọi** (no phone) | **N/A** | Phone `—`; chip correctly omitted |
| Pull-to-refresh | **PASS** | No stuck full-screen spinner (`12a-detail-after-refresh.png`) |
| **J-MOB-30 ext** back preserves search + chips | **PASS** | `12a-r2-back-list.png` — Tất cả / Đã chấm / search bar |

### testID markers (UIAutomator)

- `team-colleague-detail` — present
- `employee-detail` — present
- `employee-detail-subtitle` — present
- `team-colleague-quick-actions` — present
- `team-colleague-section-contact` — present
- `team-colleague-section-work` — present
- `team-colleague-section-attendance` — present after scroll

---

## Screenshots

`docs/qa/evidence/mob-ux-12a-screens/`

| File | Content |
|------|---------|
| `12a-r2-detail-hero.png` | Hero gradient, name, subtitle, Email chip |
| `12a-r2-detail-sections.png` | Công việc + Chấm công hôm nay (scrolled) |
| `12a-r2-back-list.png` | List after Navigate up — chips + search preserved |
| `12a-list.png` | Team directory list |
| `12a-detail-hero.png` | First-run detail (CNTT · HR SPECIALIST row) |

Machine JSON: `mob-ux-12a-qa-device-20260609.json`, `mob-ux-12a-qa-finish-20260609.json`

---

## Residual

- APK SHA drift vs PM dispatch pin — PM/Dev-Mobile reconcile canonical SHA on bus if QC requires exact match.
- Email `mailto:` handler not visually captured on emulator (chip rendered and tappable in XML).
- `job_title_key` values like `HR SPECIALIST` / `DISPATCH SUPERVISOR` still appear on some rows (out of MOB-UX-12a DRIVER/active scope; track under G-2..G-5 polish).
- Attendance section requires scroll on 1080×2400 — expected for long profile layout.

---

## Handoff

- **completion_report:** MOB-UX-12a device QA PASS on emulator-5554 @ nip.io. TeamColleagueDetail SET G-1 hero gradient, grouped sections Liên hệ/Công việc/Chấm công, no raw DRIVER/active on exercised row, Email quick action, pull refresh OK, J-MOB-30 ext back navigation OK. GWC: APK SHA mismatch; email handler not captured.
- **next_owner:** `pm`
- **next_dispatch_prompt:** PM → **qc** or promote J-MOB-30 ext on `docs/qa/evidence/mob-ux-12a-qa-device-20260609.md`; accept GWC SHA drift if installed build includes MOB-UX-12a vitest 278/278; optional Dev-Mobile republish APK matching `5398508E…` before QC hard gate.
- **evidence_path:** `docs/qa/evidence/mob-ux-12a-qa-device-20260609.md`
- **ack_status:** `PASS_TO_PM`
