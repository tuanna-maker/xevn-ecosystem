# PCOMP-W4-QA-MUX-03b — J-MOB-05 manager inbox thumb-zone (device)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-QA-MUX-03b` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **ack_status** | **PASS_TO_PM** (GWC — UI PASS, write 409 residual) |
| **entry** | `PCOMP-W4-MOB-UX-03b` READY_FOR_QA — `pcomp-w4-mob-ux-03b-20260607.md` |
| **device** | `emulator-5554` · AVD `xevn_hrm_api33` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release-mux03b.apk` (bundle inject + sign; Gradle native MAX_PATH blocked) |
| **API base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Verdict

**PASS_TO_PM (GWC)** — **MUX-03b UI** per `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §5.1 **PASS**: unified inbox filter chips with counts, row-select → sticky **Duyệt / Từ chối** in thumb zone (y1≈2095 ≥ 1404), reject modal **Lý do từ chối**. **J-MOB-05 write path FAIL**: **Duyệt** and **Từ chối → Gửi** return **`HRM-ATT-REQ-409`** (*Resource company_id is outside token scope*) — mobile sends `x-company-id: holding` while API requires legal UUID (`6efaa5d6-…4013`). No raw **HRM-ATT-REQ-203** in UI dialogs.

Machine JSON: `docs/qa/evidence/pcomp-w4-qa-mux-03b-20260607.json`

---

## 1. Preconditions

| Step | Command | Exit |
|------|---------|------|
| Emulator | `adb devices` | **0** — `emulator-5554 device` |
| Pilot pending (pre-seed) | `HRM_API_BASE_URL=https://14-225-217-232.nip.io` `node scripts/tmp-p1-resid-c03-probe.mjs` | **1** — `pending=0` |
| Qual seed | `pnpm run seed:hrm:uat-mob-pilot-qual` | **0** — `pending_update_requests=1` |
| APK rebuild | `node scripts/build-apk.cjs` | **1** — CMake MAX_PATH (pnpm path >260) |
| Bundle inject | `jar uf` + `zipalign` + `apksigner` → `hrm-mobile-release-mux03b.apk` | **0** |
| Install | `adb install -r dist/hrm-mobile-release-mux03b.apk` | **0** |
| PM clear | `adb shell pm clear vn.xevn.hrm.mobile` | **0** |

---

## 2. Device L2.5 — J-MOB-05 (adb strict, no CDP)

| Step | Command | Exit |
|------|---------|------|
| Automation | `JMOB_EMAIL=uat.nv0001@xe.vn node scripts/tmp-pcomp-w4-qa-mux-03b-device.mjs` | **1** — UI checks PASS; write 409 |

| Check | Requirement | Result | Evidence |
|-------|-------------|--------|----------|
| **More → Phê duyệt** | Manager inbox loads | **PASS** | `mux03b-approvals-inbox.png` / `.xml` |
| **Filter chips** | Tất cả / Chỉnh sửa CC / Nghỉ phép + counts | **PASS** | `Tất cả (1)`, `Chỉnh sửa CC (1)`, `Nghỉ phép (0)` — `mux03b-filter-att.png` |
| **Row tap → footer** | Duyệt/Từ chối bottom 40% | **PASS** | `mux03b-row-selected.png` — footer y1=2095 |
| **Duyệt** | Thành công, no raw 203 | **FAIL** | `mux03b-after-approve.png` — **HRM-ATT-REQ-409** dialog |
| **Từ chối** | Modal → success | **FAIL (UI modal PASS)** | `mux03b-reject-modal.png` modal OK; `mux03b-after-reject.png` — **409** |

### Scope / header audit

| Check | Result |
|-------|--------|
| API probe `x-company-id: holding` on POST approve | **409** `HRM-ATT-REQ-409` |
| API probe `x-company-id: 6efaa5d6-…4013` on POST approve | **201** `HRM-ATT-REQ-203` (UI must map — not tested) |
| `x-company-id: main` in logcat | **Not detected** |
| Raw `HRM-ATT-REQ-203` in approve alert | **None** (409 shown instead) |

Screens/XML: `docs/qa/evidence/pcomp-w4-qa-mux-03b-screens/`

---

## 3. Residual / conditions

| Item | Severity | Owner | Notes |
|------|----------|-------|-------|
| **C-MUX03B-WRITE-01** | **P0** | `dev-mobile` | `resolveHrmCompanyHeaderId` sends slug `holding` on approve/reject POST; BE requires UUID → 409 |
| Gradle APK rebuild MAX_PATH | P2 | `dev-mobile` / DevOps | Full `assembleRelease` fails on Windows pnpm path; bundle inject workaround used |
| Pilot `pending` drifts after failed approve | P2 | `devops` / QA | Re-run `seed:hrm:uat-mob-pilot-qual` before retest |

---

## 4. Promoted / not promoted

| Item | Status |
|------|--------|
| MUX-03b filter chips + unified inbox UI | **Promoted** |
| MUX-03b sticky footer thumb-zone §5.1 | **Promoted** |
| MUX-03b reject modal UX | **Promoted** |
| J-MOB-05 Duyệt/Từ chối write success | **Not promoted** — 409 header |
| J-MOB-05 journey map row | **GWC** — UI ready, write blocked |

---

## completion_report

- Rebuilt APK artifact via fresh Metro bundle + `jar uf` inject (Gradle native compile blocked MAX_PATH).
- Seeded pilot qual (`pending=1`), installed MUX-03b APK on `emulator-5554`, ran strict adb automation @ nip.io.
- **PASS** filter chips with counts, row-select sticky footer in thumb zone, reject reason modal.
- **FAIL** approve/reject POST: **HRM-ATT-REQ-409** — `holding` slug header vs UUID scope (API probe confirms UUID → 201).
- Evidence: screenshots + uiautomator XML per §5.1 in `pcomp-w4-qa-mux-03b-screens/`.

## next_owner

`pm` → dispatch `dev-mobile` for header fix, then `qa-device` retest write path

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-MOB-HEADER-03b
Role: dev-mobile
Entry: QA MUX-03b GWC — approve/reject POST returns HRM-ATT-REQ-409 on nip.io; API probe holding→409 UUID→201
Task: Fix x-company-id on manager write paths (approveAtt/approveLeave/reject) — use resolveWireCompanyId UUID not slug holding in hrmRequest header for uat.nv0001@xe.vn
Files: apps/mobile/hrm-mobile/src/integrations/hrmApiClient.ts (resolveHrmCompanyHeaderId), ManagerApprovalsScreen.tsx
Exit: READY_FOR_QA — qa-device retest J-MOB-05 Duyệt→Thành công + Từ chối→Thành công without 409
Evidence: docs/qa/evidence/pcomp-w4-qa-mux-03b-20260607.md
```

## evidence_path

`docs/qa/evidence/pcomp-w4-qa-mux-03b-20260607.md`

## pm_dispatch_hint

`PCOMP-W4-MOB-HEADER-03b` — P0 mobile `x-company-id` holding vs UUID on manager approve/reject @ nip.io (409).
