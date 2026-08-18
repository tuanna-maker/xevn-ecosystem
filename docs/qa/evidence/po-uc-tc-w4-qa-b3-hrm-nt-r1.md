# Evidence — `PO-UC-TC-W4-QA-B3-HRM-NT-R1`

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B3-HRM-NT-R1` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **FAIL** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | UC-HRM-12 · HRM-NT-01 · `/hr/notifications` + bell |
| **persona HP** | `uat.nv0007@xe.vn` / `xevn-uat-2026` · `trsport` · `employee_id` present |
| **persona AU** | `ceo@xe.vn` / `Xevn@2026` · **EXPECTED_NO_INBOX** |
| **portal** | `http://127.0.0.1:5173` |
| **commit** | `dc930c5` |
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r1-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-r1/` |
| **script** | `scripts/qa/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r1-browser.mjs` |
| **uat_done** | **false** |

---

## L0 + fe-be-health

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows async assert noise after green — same as prior W4) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed | **none** |

---

## Precond (API · U65)

| Check | Result |
|-------|--------|
| NV mobile login | **201** `HRM-AUTH-200` · `employee_id=b06422c0-f640-45d1-8cab-cb4a609848d6` · OU `trsport` |
| Inbox before browser | **GET** proxy inbox **200** `HRM-NOTIF-200` · **20 unread** (sample id `b169828f-88ff-4962-a119-1f92ab5e6879`) |
| Fanout source this seat | **Not created new** — unread from **prior U65 FE business fanout** (acceptable precond per AC-NT01-U65-01) |

---

## Browser matrix (P0)

### UF-HRM-NT-01 — NV mark read (`uat.nv0007@xe.vn`)

| Step | Observation |
|------|-------------|
| Login | HRM `/hr/login` → mobile credentials **OK** (screenshot `01-nv-after-login`) |
| Open | `/hr/notifications?portal=1&tenantId=xevn&companyId=trsport` |
| FE | Message **«Thông báo HRM cần tài khoản gắn mã nhân viên trên công ty đang chọn.»** — **no** list · **no** «Đánh dấu đã đọc» |
| Network | **0** `GET …/notifications/inbox` · **0** `PATCH …/read` from browser |
| Root cause (QA) | Portal embed `AuthContext` forces `portalMembership(companyId)` with **`employee_id: null`** when `portal=1`, **after** mobile `signIn` had populated `employee_id` — `useHrmInboxNotifications.enabled=false` |
| Verdict | **FAIL** · AC-NT01-MARK-01 not exercised in UI despite API precond |

### AC-NT01-CEO-01 — Group CEO spot

| Step | Observation |
|------|-------------|
| Persona | `ceo@xe.vn` · JWT membership **`employee_id` null** |
| Open | `/hr/notifications?portal=1&companyId=main` |
| FE | Same honest **requires employee** copy (not fake unread) |
| Verdict | **EXPECTED_NO_INBOX** · **not** product FAIL |

---

## by-uc stamp (`HRM-NT-01`)

| Field | Value |
|-------|--------|
| **execution** | **FAIL** (embed blocks NV inbox despite FE wire) |
| **uat_done** | **false** |
| **AC-NT01-CEO-01** | **PASS** (EXPECTED_NO_INBOX) |
| **AC-NT01-PERSONA-01** | NV persona valid at API layer |
| **AC-NT01-MARK-01** | **FAIL** (no PATCH from FE) |

---

## Residual → PM

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-B3-NT01-PORTAL-EMBED-EMPLOYEE-ID** | **P0** | **dev-fe** | Preserve `employee_id` on portal embed memberships (decode mobile JWT / hydrate from mobile login) so `/notifications?portal=1` enables inbox + mark-read; retest R1 |
| Leave L2 | — | — | **not touched** |
| HRM-NT-02 mobile | — | qa-device | **out of scope** this seat |
| Phase1 / UAT DONE | — | — | **not claimed** |

---

## Handoff

```
ack_status: FAIL
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT-R1
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r1.md
uat_done: false
completion_report: L0+fe-be PASS; NV API 20 unread + employee_id OK; browser FAIL — portal=1 embed nulls employee_id so inbox UI disabled (0 GET/PATCH); ceo@ EXPECTED_NO_INBOX PASS; FE mark-read path not reachable in embed until AuthContext fix.
next_owner: pm → dev-fe
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W4-FE-NT01-PORTAL-EMBED-EMPLOYEE-ID-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
read_first: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r1.md · apps/web/hrm/src/contexts/AuthContext.tsx (portalMembership) · apps/web/hrm/src/hooks/useHrmInboxNotifications.ts
entry_criteria: PO-UC-TC-W4-QA-B3-HRM-NT-R1 FAIL R-W4-B3-NT01-PORTAL-EMBED-EMPLOYEE-ID; mobile signIn + portal=1 must keep employee_id for NV
exit_criteria: uat.nv0007@xe.vn — /hr/login → /hr/notifications?portal=1&companyId=trsport loads inbox GET 200; «Đánh dấu đã đọc» → PATCH HRM-NOTIF-202; FE + F5; jest if touched; ack_status READY_FOR_QA; evidence docs/qa/evidence/po-uc-tc-w4-fe-nt01-portal-embed-employee-id-01.md
allowed_paths: apps/web/hrm/src/contexts/AuthContext.tsx · apps/web/hrm/src/lib/portalAuthBridge.ts · apps/web/hrm/src/hooks/useHrmInboxNotifications.ts (minimal)
forbidden_paths: apps/api/** · seed
Then QA retest PO-UC-TC-W4-QA-B3-HRM-NT-R2 (same browser AC as R1).
```
