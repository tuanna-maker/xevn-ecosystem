# Evidence — `PO-UC-TC-W4-QA-B3-HRM-NT-R2`

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B3-HRM-NT-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **FAIL** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | UC-HRM-12 · HRM-NT-01 §10 · `/hr/notifications` |
| **persona HP** | `uat.nv0007@xe.vn` / `xevn-uat-2026` · `trsport` |
| **persona AU** | `ceo@xe.vn` / `Xevn@2026` · **EXPECTED_NO_INBOX** |
| **portal** | `http://127.0.0.1:5173` |
| **commit** | `dc930c5` |
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r2-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-r2/` |
| **script** | `scripts/qa/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r2-browser.mjs` |
| **prior FE** | `docs/qa/evidence/po-uc-tc-w4-fe-nt01-portal-embed-employee-id-01.md` |
| **uat_done** | **false** |

---

## L0 + fe-be-health

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | hrm / xbos / portal **200** (script exit 3221226505 Windows UV_HANDLE_CLOSING noise **after** green — same as W4 R1) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed | **none** |

---

## Precond (API · U65)

| Check | Result |
|-------|--------|
| NV mobile login | **201** `HRM-AUTH-200` · `employee_id=b06422c0-f640-45d1-8cab-cb4a609848d6` · OU `trsport` |
| Inbox before browser | **GET** proxy inbox **200** `HRM-NOTIF-200` · **20 unread** · sample id `b169828f-88ff-4962-a119-1f92ab5e6879` |
| Fanout | Prior U65 FE fanout (no seed this seat) |

---

## Browser matrix (P0)

### UF-HRM-NT-01 — NV mark read (`uat.nv0007@xe.vn`)

| Step | Observation |
|------|-------------|
| Login | `/hr/login` → mobile credentials **OK** (`01-nv-after-login`) |
| Open | `/hr/notifications?portal=1&tenantId=xevn&companyId=trsport` |
| FE | **«Thông báo HRM cần tài khoản gắn mã nhân viên trên công ty đang chọn.»** — **no** list · **no** «Đánh dấu đã đọc» |
| Network | **0** `GET …/notifications/inbox` · **0** `PATCH …/read` from browser |
| Console | `401 (Unauthorized)` (1 line — no secrets) |
| Verdict | **FAIL** · AC-NT01-MARK-01 not exercised |

**QA root-cause (code read, not product patch):**

1. `InboxNotifications` renders requires-employee when `useHrmInboxNotifications.enabled === false` (`apps/web/hrm/src/pages/InboxNotifications.tsx`).
2. `useHrmInboxScope` sets `enabled = Boolean(VITE_HRM_API_ORIGIN && currentCompanyId && employeeId)` — **portal dev at `:5173` has no `VITE_HRM_API_ORIGIN` in `apps/web/web-portal/.env.local`**, while `hrmApi` already uses **`/api/hrm` proxy** when origin is empty.
3. FE employee_id embed fix (`getPortalEmbedEmployeeId`) is in tree but **cannot be proven in browser** until inbox scope enables on portal proxy runtime (same UX string for missing origin vs missing employee_id).

### AC-NT01-CEO-01 — Group CEO spot

| Step | Observation |
|------|-------------|
| Persona | `ceo@xe.vn` · membership **`employee_id` null** |
| Open | `/hr/notifications?portal=1&companyId=main` |
| FE | Honest requires-employee / rollup shell — **no** fake unread |
| Verdict | **EXPECTED_NO_INBOX** · **not** product FAIL |

---

## by-uc stamp (`HRM-NT-01`)

| Field | Value |
|-------|--------|
| **execution** | **FAIL** (R2 after FE portal employee_id — inbox still disabled in embed) |
| **uat_done** | **false** |
| **AC-NT01-CEO-01** | **PASS** (EXPECTED_NO_INBOX) |
| **AC-NT01-PERSONA-01** | NV valid at API |
| **AC-NT01-MARK-01** | **FAIL** (0 PATCH) |
| **AC-NT01-U65-01** | Precond unread present; mark path blocked in UI |

---

## Residual → PM

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-B3-NT01-INBOX-SCOPE-PROXY** | **P0** | **dev-fe** | Align `useHrmInboxScope.enabled` with portal proxy / `isHrmApiDataMode()` (enable when `/hr/*` + `employee_id`, not only when `VITE_HRM_API_ORIGIN` set); retest R2 |
| **R-W4-B3-NT01-PORTAL-EMBED-EMPLOYEE-ID** | P1 | dev-fe | Re-verify after scope fix — R1 item may be closed in code but unproven in browser |
| Leave L2 | — | — | **not touched** |
| HRM-NT-02 mobile | — | qa-device | **out of scope** |
| Phase1 / UAT DONE | — | — | **not claimed** |

---

## Handoff

```
ack_status: FAIL
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT-R2
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r2.md
uat_done: false
completion_report: L0+fe-be PASS; API 20 unread + employee_id OK; browser FAIL — inbox UI disabled (requires-employee copy), 0 GET/PATCH; ceo@ EXPECTED_NO_INBOX PASS; FE embed employee_id fix not sufficient — useHrmInboxScope gates on unset VITE_HRM_API_ORIGIN in portal :5173 proxy dev.
next_owner: pm → dev-fe
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W4-FE-NT01-INBOX-SCOPE-PROXY-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
u65_zero_seed: true
read_first: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r2.md · apps/web/hrm/src/hooks/useHrmInboxNotifications.ts · apps/web/hrm/src/lib/hrmDataMode.ts · docs/qa/evidence/po-uc-tc-w4-fe-nt01-portal-embed-employee-id-01.md
entry_criteria: PO-UC-TC-W4-QA-B3-HRM-NT-R2 FAIL — portal :5173 /hr/notifications?portal=1&companyId=trsport shows inboxRequiresEmployee despite API 20 unread; enabled=false because VITE_HRM_API_ORIGIN empty while hrmApi uses /api/hrm proxy
exit_criteria: uat.nv0007@xe.vn login → embed notifications GET inbox 200 list visible; «Đánh dấu đã đọc» → PATCH HRM-NOTIF-202; FE after 2xx + F5; jest if touched; ack_status READY_FOR_QA; evidence docs/qa/evidence/po-uc-tc-w4-fe-nt01-inbox-scope-proxy-01.md
allowed_paths: apps/web/hrm/src/hooks/useHrmInboxNotifications.ts · apps/web/hrm/src/components/layout/AppHeader.tsx (inboxApiEnabled parity if shared helper) · apps/web/hrm/src/lib/* (minimal scope helper)
forbidden_paths: apps/api/** · seed
Then QA retest PO-UC-TC-W4-QA-B3-HRM-NT-R3 (same browser AC as R1/R2).
```
