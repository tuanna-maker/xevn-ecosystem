# Evidence rollup — PO-UC-TC-W4-QA-B3-HRM-NT

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B3-HRM-NT` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | true (SRS UC-HRM-12 / FR-HRM-12 · mobile NT-02 surface honesty) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` holding (`companyId=main`) |
| **portal** | `http://127.0.0.1:5173` |
| **commit** | `dc930c5` |
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt/` |
| **script** | `scripts/qa/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-browser.mjs` |
| **seat_verdict** | **PARTIAL** (NT-01 BLOCKED U65 · NT-02 BLOCKED mobile surface · L0 PASS) |

> **Domain:** `HRM-NT-01` = mark inbox read (`PATCH …/notifications/inbox/:id/read`). `HRM-NT-02` = mobile push token (`POST …/push-tokens`). Leave L2 **not invented**. Phase1 / UAT DONE **not claimed**.

---

## L0 + fe-be-health

| Probe | Result |
|-------|--------|
| `qc:dev-stack` hrm/xbos/portal | **200** (Windows async assert noise after green lines — same as prior W4 seats) |
| `qc:fe-be-health` | **ALL PASS** |
| Seed | **không** chạy `pnpm seed:*` |

---

## HDSD inventory (U76)

| Step | Path / contract |
|------|-----------------|
| 1 | Login holding `ceo@xe.vn` |
| 2 | HRM embed Dashboard ` /hr/?portal=1&companyId=main` (rollup «Tất cả đơn vị») |
| 3 | **Inbox read (NT-01):** SRS `GET/PATCH /api/hrm/notifications/inbox` — mobile `InAppNotificationsScreen` row tap → PATCH read; web **no** `markInbox` in `hrmApi.ts` · header bell = static mock in `AppHeader.tsx` |
| 4 | **Push token (NT-02):** mobile ESS only — not in portal browser seat |

**Note:** Dashboard shows **contract expiry** banner («Hợp đồng sắp hết hạn») — operational widget, **not** UC-HRM-12 inbox mark-read.

---

## must_keep (untouched)

| Lock | Touched? |
|------|----------|
| Leave L2 SPEC_GAP | **no** |
| IM-03 AU GWC CLOSED | **no** |
| AT-12 L1 / CREATE-CATALOG CLOSED | **no** |
| BR-WF-04 / CI01 CLOSED | **no** |
| Zero seed U65 | **yes — honored** |

---

## UC verdicts (browser P0)

| UC | Verdict | P0 evidence |
|----|---------|-------------|
| **HRM-NT-01** | 🟡 **BLOCKED** | Login **OK**. Membership for `ceo@` has **no `employee_id`** → cannot satisfy SRS inbox query (`company_id` + `employee_id`). `HrmApiReminders` disabled → **no** `GET …/notifications/inbox` in browser session. Dashboard embed loads (**59** NV rollup) · no Sync ERROR · bell/mark-read control **not** in embed chrome. **No** PATCH read from FE under U65 (no prior FE fanout row to mark). |
| **HRM-NT-02** | 🟡 **BLOCKED** | Surface **hrm-mobile** / `POST push-tokens` — outside browser P0 seat; requires **qa-device** or Expo runtime. |

### Product / spec findings (not PASS)

| Finding | Layer |
|---------|--------|
| Web embed lacks wired inbox list + mark-read (BE `HRM-NOTIF-202` exists; FE gap) | dev-fe |
| Group CEO persona lacks `employee_id` on JWT membership — inbox UC targets NV/QL with employee binding | ba-process / product |
| `AppHeader` notification dropdown = placeholder mock (badge «3», no API) | dev-fe |

### Sample probes (no secrets)

```text
POST /api/xbos/auth/login (ceo@) → token ok
GET  /api/hrm/notifications/inbox — SKIPPED (no employee_id on membership)
Browser: /hr/?portal=1&companyId=main → 200 UI (screenshot 01-hrm-dashboard)
PATCH …/inbox/:id/read from browser click → 0 calls (no CTA in embed)
```

### Screens

`docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt/` — `01-hrm-dashboard` · `04-after-f5`

---

## by-uc honesty stamp

Updated `docs/qa/professional/by-uc/HRM-NT-01.md` · `HRM-NT-02.md`:

| UC | execution | uat_done |
|----|-----------|----------|
| NT-01 | BLOCKED | **false** |
| NT-02 | BLOCKED | **false** |

---

## Residual → PM dispatch

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-B3-NT01-WEB-INBOX-MARK-READ-FE** | P1 | **dev-fe** | Add web inbox UI (embed) + `markInboxRead` in `hrmApi.ts` wired to `PATCH …/inbox/:id/read`; replace or gate mock `AppHeader` bell. Retest NT-01 with persona that has `employee_id` (e.g. `uat.nv####` or QL) after FE-origin fanout row exists. |
| **R-W4-B3-NT01-CEO-EMPLOYEE-ID-GAP** | P2 | **ba-process** | Clarify AC: holding CEO without `employee_id` — inbox empty by design vs rollup broadcast-only rows. |
| **R-W4-B3-NT02-MOBILE-PUSH-QA** | P1 | **qa-device** | `uat.nv####@xe.vn` — Settings/Notifications push registration → `POST push-tokens` 2xx on emulator. |
| Leave L2 | — | — | **not touched** |
| Phase1 / UAT DONE | — | — | **not claimed** |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-rollup.md
next_owner: pm
uat_done: false
seat_verdict: PARTIAL
completion_report: L0+fe-be PASS; HRM-NT-01 BLOCKED U65 (no employee_id + no web mark-read path); HRM-NT-02 BLOCKED mobile surface; by-uc stamped; residuals for dev-fe + qa-device.
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W4-FE-NT01-INBOX-MARK-READ-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
read_first: docs/hrm/SRS.md UC-HRM-12 · apps/mobile/hrm-mobile/src/features/notifications/InAppNotificationsScreen.tsx (reference) · apps/api/hrm-api/src/notifications/notifications.controller.ts
entry_criteria: PO-UC-TC-W4-QA-B3-HRM-NT rollup R-W4-B3-NT01-WEB-INBOX-MARK-READ-FE open; preserve U65
exit_criteria: Portal/HRM embed exposes SRS inbox list for logged-in user with employee_id; row action triggers PATCH …/inbox/:id/read → HRM-NOTIF-202; FE after 2xx + F5; jest/smoke if present; ack_status READY_FOR_QA with evidence path
allowed_paths: apps/web/hrm/src/integrations/hrmApi.ts · apps/web/hrm/src/components/**/AppHeader.tsx · new inbox component under apps/web/hrm/src/** (minimal)
forbidden_paths: apps/api/** (unless PM waives) · seed scripts
evidence_path: docs/qa/evidence/po-uc-tc-w4-fe-nt01-inbox-mark-read-01.md
Then QA retest PO-UC-TC-W4-QA-B3-HRM-NT-R1 with uat.nv#### persona after FE-origin leave/service fanout (no seed).
Parallel: dispatch qa-device PO-UC-TC-W4-QA-B3-HRM-NT-MOB-01 for HRM-NT-02 push-tokens on emulator.
```
