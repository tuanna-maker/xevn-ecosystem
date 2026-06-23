# PCOMP-W7-MOB-WHOS-OUT-01 — whos_out section render fix (J-MOB-09)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-MOB-WHOS-OUT-01` |
| **from_role** | dev-mobile |
| **to_role** | qa-device |
| **date** | 2026-06-08 |
| **ack_status** | `READY_FOR_QA` |
| **upstream** | QA FAIL [`pcomp-w7-qa-hub-r3-02-r2-20260608.md`](pcomp-w7-qa-hub-r3-02-r2-20260608.md) — API `who_total=1` @ nip.io holding; device hub04b never showed «Ai nghỉ hôm nay» |

---

## Root cause

`loadHomeCelebrateSections` sent **`company_id=<legal UUID>`** (from `getAttendanceCompanyId()` / `resolveWireCompanyId`) on `GET /home/summary`. BE workforce rollup for **whos_out** requires scope slug **`holding`** (D-W7-HOME-WHOS-SLUG-01) — same pattern as payroll query split (PCOMP-W7-MOB-PAY-01).

**Sinh nhật hôm nay** still PASS on device because celebrations populated via **compose fallback** (`GET /employees` with slug header), masking the aggregate gap.

---

## Fix

| File | Change |
|------|--------|
| `integrations/companyWireScope.ts` | `resolveHomeSummaryQueryCompanyId()` — rollup slugs `main` / `holding` |
| `integrations/hrmHomeSummary.ts` | home/summary + compose fallbacks use summary slug, not wire UUID |
| `utils/dashboardHubCelebrate.ts` | `parseWhosOutItems` accepts `employee_name` alias + raw array; defensive sanitize |
| `features/dashboard/DashboardScreen.tsx` | `testID="home-whos-out-section"` for device automation |
| `components/primitives/SkeletonLine.tsx` | Moti `Skeleton` props tsc fix (wrapper View) — unblocks `type-check` |

**J-MOB-06/07/08:** unchanged — manager/tasks/celebrations paths untouched; only home/summary query scope corrected.

---

## Verification (agent-run)

```text
cd apps/mobile/hrm-mobile
pnpm test        → 32 files, 174 tests PASS, exit 0
pnpm type-check  → exit 0
```

**New tests:**

- `integrations/__tests__/hrmHomeSummary.test.ts` — asserts `/home/summary?company_id=holding` when membership slug is holding
- `integrations/__tests__/companyWireScope.test.ts` — `resolveHomeSummaryQueryCompanyId` holding/main/UUID cases
- `utils/__tests__/dashboardHubCelebrate.test.ts` — `employee_name` alias + raw array parse

---

## QA device matrix (retest)

| Journey | Persona | Steps | Expected |
|---------|---------|-------|----------|
| **J-MOB-09** | `uat.nv0001@xe.vn` @ nip.io | Login (ADBKeyboard on hub04b) → Home scroll past «Sinh nhật hôm nay» → «Ai nghỉ hôm nay (1)» visible → tap row | `LeaveRequestDetail` opens for `leave_request_id` |
| **J-MOB-06** | same | «Việc cần làm» count + rows | regression PASS |
| **J-MOB-07** | same (manager) | «Cần duyệt (n)» matches API mgr_total | regression PASS |
| **J-MOB-08** | same | «Sinh nhật hôm nay» horizontal row | regression PASS |

**Probe parity:** `GET /home/summary?company_id=holding&include=celebrations,whos_out` → `whos_out.total_count ≥ 1` per [`pcomp-w7-qa-hub-04b-probe.json`](pcomp-w7-qa-hub-04b-probe.json).

**Note:** Fresh APK bundle required for device retest (hub04b pre-fix JS). Rebuild or Metro inject before R3-03.

---

## completion_report

- **Closed:** whos_out empty on device despite API aggregate — home/summary now uses `holding` slug for workforce rollup; parse hardening; section `testID`; 174 vitest + tsc PASS.
- **Open:** device confirmation on nip.io (needs APK refresh); J-AVT-02 out of scope (D-W7-AVT-DEVICE-NAV-01).

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-QA-HUB-R3-03
from_role: pm
to_role: qa-device
entry_criteria: dev-mobile PCOMP-W7-MOB-WHOS-OUT-01 READY_FOR_QA — whos_out uses holding slug on /home/summary; evidence docs/qa/evidence/pcomp-w7-mob-whos-out-01-20260608.md
exit_criteria: Rebuild/refresh hub APK bundle → emulator-5554 @ nip.io uat.nv0001; J-MOB-09 «Ai nghỉ hôm nay (n≥1)» visible after scroll + tap→LeaveRequestDetail; J-MOB-06/07/08 regression PASS; ADBKeyboard login SoT
evidence_path: docs/qa/evidence/pcomp-w7-qa-hub-r3-03-20260608.md
ack_status: PASS_TO_PM or FAIL with layer
```

## evidence_path

`docs/qa/evidence/pcomp-w7-mob-whos-out-01-20260608.md`
