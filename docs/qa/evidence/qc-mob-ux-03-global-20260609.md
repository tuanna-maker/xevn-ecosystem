# MOB-UX-03-GLOBAL-QC — Global typography 5-screen device gate @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-03-GLOBAL-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **MOB-UX-03-GLOBAL** typography polish **device promotable** @ nip.io emulator |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — MOB-UX-03-GLOBAL typography slice)

| In scope | Out of scope |
|----------|--------------|
| Five-screen typography audit: LeaveRequestDetail, ManagerApprovals, Profile, CheckIn, PayslipDetail | Phase 1 DONE / `verify:product:completion` program exit |
| Sentence-case VI labels; no dev strings (`employeeId`, visible `companyId header`) | PROD cutover / store release |
| Regression: **MOB-UX-11a** cold login gradient, **J-MOB-34** payslip hero, **J-MOB-35** timeline pills, **FAB** sheet | Full AC-DS-01..10 re-audit (covered prior `pcomp-w4-qa-mux-03`) |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` @ nip.io · `emulator-5554` | Physical device matrix beyond emulator |
| UUID scope `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`; `hasMainHeader=false` | **J-MOB-32** MOB-UX-10a QC gate (QA PASS, QC pending) |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Dev-mobile | `pcomp-w4-mob-ux-03-20260607.md` + MOB-UX-03-GLOBAL wave | Typography tokens applied globally |
| QA-device | [`mob-ux-03-global-qa-device-20260609.md`](mob-ux-03-global-qa-device-20260609.md) | PASS_TO_PM — L2.5 device @ nip.io |
| Machine JSON | [`mob-ux-03-global-qa-device-20260609.json`](mob-ux-03-global-qa-device-20260609.json) | `fiveScreenPass=true` `regPass=true` |
| UI dumps | [`mob-ux-03-global-screens/`](mob-ux-03-global-screens/) | 28 XML artifacts — QC spot-audit |
| Spec | `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §1 typography | AC aligned |

**APK lineage:** `hrm-mobile-qa-device.apk` · **72,331,007 B** · SHA-256 `CD3D49B07B86F4813370102C6BFFE6CCDCA9FF886B70571E47FCC21AF1EE826B`

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-ux-03-global-qa-device-20260609.md
# exit 1 — 4/8 checks (2026-06-09 QC audit)
# FAIL: work_item_id, command_table, portal_url, crud_or_matrix
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Same mobile-device slice class as [`qc-mob-ux-10d-20260609.md`](qc-mob-ux-10d-20260609.md):

| Failed check | QC ruling |
|--------------|-----------|
| `work_item_id` | **Format** — table uses `**work_item_id**` not `work_item_id:` colon form |
| `command_table` | **Format** — adb/node scripts + exit table present; verifier expects `pnpm run` prefix |
| `portal_url` | **N/A mobile device** — `api_base` `https://14-225-217-232.nip.io` documented |
| `crud_or_matrix` | **N/A read-only slice** — typography/display polish; no C/R/U/D in wave |

Material pack present: five-screen matrix, J-MOB regression table, pill counts, API cross-check JSON, 28 XML dumps, `## Residual` section, valid handoff — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + qa-device APK | ENV | **PASS** |
| `adb pm clear` + install + SHA verify | ENV / L2.5 | **PASS** |
| Deep-link login `J-MOB-01` home | ENV / L2.5 | **PASS** |
| nip.io pilot API session UUID scope | ENV | **PASS** — `hasMainHeader=false` |
| **LeaveRequestDetail** hero + `Lý do` body (J-MOB-03) | PRODUCT / typography | **PASS** — `ux03-leave-detail.xml` |
| **ManagerApprovals** title `Duyệt đơn` (J-MOB-05) | PRODUCT / typography | **PASS** — `ux03-manager-approvals.xml` |
| **Profile** grouped fields (J-AVT-02) | PRODUCT / typography | **PASS** — `ux03-profile.xml` |
| **CheckIn** title `Chấm công` + CTA `Chấm công vào` (J-MOB-02) | PRODUCT / typography | **PASS** — `ux03-checkin.xml` |
| **PayslipDetail** `Tổng gross` / `Thực lĩnh` rows (J-MOB-04) | PRODUCT / typography | **PASS** — `ux03-payslip-detail.xml` |
| **MOB-UX-11a** `branded-login-card` cold login | PRODUCT / regression | **PASS** — `ux03-cold-login.xml` (`companyId` testID only — not visible label) |
| **J-MOB-34** payslip hero → detail | PRODUCT / regression | **PASS** — `ux03-j34-list.xml`, `ux03-j34-detail.xml` |
| **J-MOB-35** pills Đúng giờ(8) / Đi muộn(1) / Vắng mặt(1) | PRODUCT / regression | **PASS** — `ux03-j35-history-initial.xml`, `ux03-j35-scroll-1.xml`; API `records=12` |
| **REG-FAB** `check-in-fab` → Thao tác nhanh | PRODUCT / regression | **PASS** — `ux03-fab-sheet.xml` |
| No `employeeId` visible dev strings | PRODUCT | **PASS** — grep 28 XML dumps |

**Product NO-GO avoided:** All five typography screens device-readable with VI sentence-case; regressions intact.

---

## L2.5 — Journey audit (device @ nip.io emulator)

### Primary — MOB-UX-03-GLOBAL wave (typography)

| Screen | J-ID | QA | XML / evidence | QC verdict |
|--------|------|-----|----------------|------------|
| LeaveRequestDetail | **J-MOB-03** | PASS | `ux03-leave-detail.xml` | **PASS — typography reaffirmed** |
| PayslipDetail | **J-MOB-04** | PASS | `ux03-payslip-detail.xml` | **PASS — typography reaffirmed** |
| ManagerApprovals | **J-MOB-05** | PASS | `ux03-manager-approvals.xml` | **PASS — typography reaffirmed** |
| CheckIn | **J-MOB-02** | PASS | `ux03-checkin.xml` | **PASS — typography reaffirmed** |
| Profile | **J-AVT-02** | PASS | `ux03-profile.xml` | **PASS — typography reaffirmed** |

### Regression spot (unified APK)

| ID | Journey | QA | QC ruling |
|----|---------|-----|-----------|
| **MOB-UX-11a** | Cold login gradient / branded card | PASS | **PASS — reaffirmed** |
| **J-MOB-34** | Lương tile → hero → PayslipDetail | PASS | **PASS — prior CLOSED** [`qc-mob-ux-11a-10c-20260609.md`](qc-mob-ux-11a-10c-20260609.md) |
| **J-MOB-35** | Chấm công → Lịch sử → colored pills | PASS | **PASS — prior CLOSED** [`qc-mob-ux-10d-20260609.md`](qc-mob-ux-10d-20260609.md) |
| **REG-FAB** | FAB → Thao tác nhanh | PASS | **PASS — prior CLOSED** [`qc-mob-ux-10-p0-20260609.md`](qc-mob-ux-10-p0-20260609.md) |
| **J-MOB-32** | Action carousel | N/A this wave | **DEFERRED QC** — MOB-UX-10a QA PASS, QC gate pending |

---

## Defect / condition adjudication

| ID | Severity | Class | QC ruling |
|----|----------|-------|-----------|
| **GWC-MGR-FILTER-01** | P2 | UX by design | **ACCEPTED** — filter chips hidden when `pending=0` empty inbox |
| **GWC-PROFILE-CODE-01** | P2 | Data display | **ACCEPTED** — `HLD-0001` / `CEO` seed meta, not label casing defect |
| **C-W8QC-PACK-02** | Process | Format | **CARRY** — normalized `pnpm run` command table in device packs |
| **D-W8-ESS-PROMISE-01** | P1 UX | PRODUCT | **CARRY** — unrelated promise snackbar/font; expiry 2026-06-14 |
| **MOB-UX-10a-QC** | Process | Gate | **CARRY** — J-MOB-32 carousel QC pending |

No P0/P1 product blockers for MOB-UX-03-GLOBAL promotion.

---

## Journey map sync (confirmed)

`PROGRAM_JOURNEY_MAP.md` rows **J-MOB-02..05** typography regate:

- **J-MOB-03** — leave detail typography **✅ reaffirmed** MOB-UX-03-GLOBAL — this QC file
- **J-MOB-04** — payslip detail typography **✅ reaffirmed** MOB-UX-03-GLOBAL — this QC file
- **J-MOB-05** — manager approvals typography **✅ reaffirmed** MOB-UX-03-GLOBAL — this QC file
- **J-MOB-02** — check-in screen typography **✅ reaffirmed** MOB-UX-03-GLOBAL — this QC file
- **J-AVT-02** — profile typography **✅ reaffirmed** MOB-UX-03-GLOBAL — this QC file

Prior J-MOB-34/35 CLOSED status unchanged (regression PASS only).

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | **MOB-UX-03-GLOBAL promotable** nip.io emulator |
| **GO (scoped)** | Five-screen typography polish **device CLOSED** |
| | J-MOB-03/04/05 + J-MOB-02 + J-AVT-02 typography slice reaffirmed |
| **CARRY** | **GWC-MGR-FILTER-01** · **GWC-PROFILE-CODE-01** · **C-W8QC-PACK-02** · **MOB-UX-10a-QC** · **D-W8-ESS-PROMISE-01** |
| | **NOT Phase 1 DONE** / **NOT PROD** |

---

## Residual (program — outside MOB-UX-03-GLOBAL wave)

| ID | Owner | Trigger |
|----|-------|---------|
| **C-W8QC-PACK-02** | qa-device | Next mobile wave — pack format normalization |
| **MOB-UX-10a-QC** | pm → qc | J-MOB-32 carousel QC gate when prioritized |
| **D-W8-ESS-PROMISE-01** | dev-mobile | Promise snackbar/font — expiry 2026-06-14 |
| **GWC-MGR-FILTER-01** | pm / ba | Document empty-inbox filter UX if sponsor questions |

---

## Handoff

**completion_report:** MOB-UX-03-GLOBAL-QC **GO WITH CONDITIONS (reduced)**. Audited QA-device chain + JSON + 28 XML dumps. Pack verify **4/8** process-only (mobile slice N/A). Spot-audit confirms five-screen VI typography (`Chấm công`, `Duyệt đơn`, `Tổng gross`/`Thực lĩnh`, leave detail body); no visible dev strings. Regressions MOB-UX-11a login, J-MOB-34 hero, J-MOB-35 pills (+ scroll), FAB intact. UUID scope clean. GWC only on empty-manager filter chips and seed employee-code display. No P0/P1 product blockers.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
PM intake MOB-UX-03-GLOBAL-QC PASS_TO_PM (GO WITH CONDITIONS reduced).

Closed: MOB-UX-03-GLOBAL five-screen typography device CLOSED @ nip.io — evidence docs/qa/evidence/qc-mob-ux-03-global-20260609.md.

Mark MOB-UX-03-GLOBAL [x] in sprint backlog / PHASE1_PRODUCT_COMPLETION_TODO if row exists.

Sync PROGRAM_JOURNEY_MAP J-MOB-02..05 typography regate cite to this QC file.

Next wave per pm:scan:backlog priority:
1) Dispatch qc MOB-UX-10a-QC — J-MOB-32 action carousel (QA PASS mob-ux-10a-qa-device-20260609.md).
2) Or next P0 from PM_OPEN_BACKLOG.json.

Carry: C-W8QC-PACK-02, D-W8-ESS-PROMISE-01, GWC-MGR-FILTER-01 (P2 accepted). NOT Phase 1 DONE / NOT PROD.
```

**evidence_path:** `docs/qa/evidence/qc-mob-ux-03-global-20260609.md`

**ack_status:** `PASS_TO_PM`
