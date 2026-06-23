# MOB-W7-5-DIRECTORY-PAGESIZE-FIX — directory page_size cap + visible API errors

| Field | Value |
|-------|-------|
| work_item_id | MOB-W7-5-DIRECTORY-PAGESIZE-FIX |
| date | 2026-06-09 |
| owner | dev-mobile |
| ack_status | **READY_FOR_QA** |
| device | emulator-5554 |
| apk_path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| apk_bytes | 65,980,945 |
| apk_sha256 | `72F5C6B962C2FC6A4906437C2212142E261FFAB567852441314BFADF64940DFB` |
| api_base | https://14-225-217-232.nip.io |
| persona | uat.nv0002@xe.vn / xevn-uat-2026 |
| company_slug | trsport |
| company_uuid | 32a3cdcb-c534-4e47-80f9-d2f156e65094 |

---

## Summary

**Root cause closed:** `hrmTeamDirectory.ts` sent `page_size=200` → nip.io **HRM-VAL-001** (max 100). Client previously swallowed errors as empty list.

**Fix:** `DIRECTORY_PAGE_SIZE=100`, paginate up to 20 pages via `readListTotal`, propagate `formatHrmError` on failed envelope. TeamDirectoryScreen already shows `result.message` on `team-directory-error`.

---

## Code changes

| File | Change |
|------|--------|
| `apps/mobile/hrm-mobile/src/integrations/hrmTeamDirectory.ts` | `page_size` 200→100; multi-page fetch; API error → `{ ok: false, message }` |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/hrmTeamDirectory.test.ts` | +3 tests: page_size cap, HRM-VAL-001 visible, pagination |

---

## Automated verification

| Check | Result |
|-------|--------|
| `pnpm test:hrm-mobile` | **PASS** 239/239 |
| `pnpm exec tsc --noEmit` (hrm-mobile) | **PASS** |
| Vitest `hrmTeamDirectory.test.ts` | **PASS** 4/4 |

---

## API probe (uat.nv0002 @ trsport)

```bash
HRM_MOBILE_EMAIL=uat.nv0002@xe.vn node scripts/tmp-mob-w7-5-directory-probe.mjs
# exit 0 — total=207, HRM-EMP-DIR-200, detail HRM-EMP-200
```

| Param | HTTP | Code |
|-------|------|------|
| `page_size=10&view=directory` | 200 | HRM-EMP-DIR-200 (total=207) |
| `page_size=200&view=directory` | 400 | HRM-VAL-001 (still rejected — mobile no longer sends this) |

---

## Device smoke (post-fix APK)

```bash
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
node scripts/tmp-mob-w7-5-directory-qa-device.mjs
```

| Check | Before fix | After fix |
|-------|------------|-----------|
| Đội nhóm rows | **0** (`Tất cả (0)`) | **≥1** (ui dump `rowCount=14`, badges=7) |
| `team-directory-empty` | present | **absent** |
| `team-directory-error` scope empty | present | **absent** |
| API probe total | 207 | 207 |
| Login uat.nv0002 | PASS | PASS |
| Scope header | UUID (not `main`) | PASS |

**Note:** QA script `DIR-DETAIL` still FAIL (`no row to tap`) — `TeamDirectoryRow` is display-only (no `onPress` / navigation). Out of scope for pagesize fix; qa-device may retest list+badges under MOB-W7-5-DIRECTORY-QA-DEVICE with new APK SHA.

**Note:** Script `L0-SHA` compares against pre-fix SHA `A0D5510B…` — expected FAIL until qa-device updates expected hash to `72F5C6B9…`.

---

## Build

```bash
# junction path (OneDrive Unicode safe)
cd C:\xevn-ecosystem\apps\mobile\hrm-mobile
$env:GRADLE_USE_SUBST='1'
pnpm run android:apk:qa-device
# BUILD SUCCESSFUL — dist/hrm-mobile-qa-device.apk (62.92 MB)
```

---

## Handoff

- **completion_report:** Capped directory `page_size` at 100 with pagination (supports trsport total=207). API validation/network failures now return visible `formatHrmError` message instead of silent empty. Vitest 239/239 + tsc PASS. qa-device APK rebuilt (SHA `72F5C6B9…`). Emulator smoke: non-empty Đội nhóm list (14 visible rows, 7 attendance badges) for uat.nv0002@xe.vn. Residual: row→detail tap not implemented on directory rows; qa script SHA expectation stale.
- **next_owner:** qa-device
- **next_dispatch_prompt:** work_item_id MOB-W7-5-DIRECTORY-QA-DEVICE — install `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` SHA `72F5C6B962C2FC6A4906437C2212142E261FFAB567852441314BFADF64940DFB`; retest GWC-DIR-ROWS-01 on emulator-5554 @ nip.io with uat.nv0002@xe.vn: expect ≥1 directory row + attendance badges + chip counts >0; confirm no HRM-VAL-001 in logcat; update expected SHA in probe script; DIR-DETAIL optional unless PM scopes navigation.
- **evidence_path:** docs/qa/evidence/mob-w7-5-directory-pagesize-fix-20260609.md
- **ack_status:** **READY_FOR_QA**
