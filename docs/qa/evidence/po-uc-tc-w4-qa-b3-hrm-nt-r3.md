# Evidence — `PO-UC-TC-W4-QA-B3-HRM-NT-R3`

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B3-HRM-NT-R3` |
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
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r3-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-r3/` |
| **script** | `scripts/qa/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r3-browser.mjs` |
| **prior FE** | `docs/qa/evidence/po-uc-tc-w4-fe-nt01-inbox-scope-proxy-01.md` |
| **prior QA** | `docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r2.md` |
| **uat_done** | **false** |

---

## L0 + fe-be-health

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | hrm / xbos / portal **200** (Windows UV_HANDLE_CLOSING noise after green — same class as R2) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed | **none** |

---

## Precond (API · U65 · diagnostic only — not UF PASS)

| Check | Result |
|-------|--------|
| NV mobile login | **201** `HRM-AUTH-200` · `employee_id=b06422c0-f640-45d1-8cab-cb4a609848d6` · OU `trsport` |
| Inbox before browser | **GET** proxy inbox **200** `HRM-NOTIF-200` · **20 unread** · sample `6d586457-ea67-4c95-a861-10aebefeb5b4` |
| Fanout | Prior U65 FE fanout (no seed this seat) |
| Mix | Later probe: personal unread present + broadcast NULL rows (mark HP = personal only per BA §10) |

---

## Browser matrix (P0)

### UF-HRM-NT-01 — NV mark read (`uat.nv0007@xe.vn`)

| Step | Observation |
|------|-------------|
| Login | `/hr/login` → mobile credentials **OK** (`01-nv-after-login`) |
| Open | `/hr/notifications?portal=1&tenantId=xevn&companyId=trsport` |
| FE list | **List visible** · «Chưa đọc» badges · **no** requires-employee copy |
| Network GET | **GET** `/api/hrm/notifications/inbox?company_id=trsport&employee_id=b06422c0-…&limit=*` → **200** `HRM-NOTIF-200` (×3: header 8 / reminders 15 / page 50) |
| Action | Click «Đánh dấu đã đọc» (`inbox-mark-read-*`) → **visible + clicked** (`03-nv-after-mark-read`) |
| Network PATCH | **PATCH** `/api/hrm/notifications/inbox/{id}/read?company_id=trsport` → **400** `HRM-VAL-001` |
| F5 | List still loads GET **200**; mark not persisted (`04-nv-after-f5`) |
| Verdict | **FAIL** · AC-NT01-MARK-01 not met (no `HRM-NOTIF-202`) |

**Closed from R2:** `R-W4-B3-NT01-INBOX-SCOPE-PROXY` — `isHrmNestApiReachable()` enables inbox on portal `/api/hrm` proxy **without** `VITE_HRM_API_ORIGIN`. GET + list **PASS**.

**QA root-cause (code + probe, not product patch):**

1. FE `markHrmInboxNotificationRead` sends query `company_id` = session slug `trsport` (`currentCompanyId`).
2. BE `MarkInboxReadQueryDto` uses `@IsUUID()` → slug rejected → **`company_id must be a UUID`** / `HRM-VAL-001`.
3. List DTO accepts `@IsString()` slug and resolves via `resolveHrmListScope` — **mark path lacks slug→UUID parity**.
4. Diagnostic (API only, not browser UF): personal row + UUID company_id → **200** `HRM-NOTIF-202`; broadcast NULL → `HRM-INBOX-404` (BA **SPEC_GAP** / AC-NT01-MARK-01 personal-only).
5. UI shows «Đánh dấu đã đọc» on **all** unread (incl. broadcast) — first click path hits slug VAL-001 before personal semantics.

### AC-NT01-CEO-01 — Group CEO spot

| Step | Observation |
|------|-------------|
| Persona | `ceo@xe.vn` · membership **`employee_id` null** |
| Open | `/hr/notifications?portal=1&companyId=main` |
| FE | «Thông báo HRM cần tài khoản gắn mã nhân viên trên công ty đang chọn.» — **no** fake unread (`05-ceo-notifications`) |
| Verdict | **EXPECTED_NO_INBOX** · **PASS** (not product FAIL) |

---

## by-uc stamp (`HRM-NT-01`)

| Field | Value |
|-------|--------|
| **execution** | **FAIL** (R3 after FE inbox scope proxy — GET OK, PATCH VAL-001) |
| **uat_done** | **false** |
| **AC-NT01-CEO-01** | **PASS** (EXPECTED_NO_INBOX) |
| **AC-NT01-PERSONA-01** | NV valid at API + browser list |
| **AC-NT01-LIST-01** | **PASS** (GET 200 + list visible) |
| **AC-NT01-MARK-01** | **FAIL** (PATCH 400 `HRM-VAL-001`, not 202) |
| **AC-NT01-U65-01** | Precond unread from prior FE fanout; no seed |

---

## Residual → PM

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-B3-NT01-MARK-COMPANY-UUID** | **P0** | **dev-fe** (+ **dev-be** parity) | PATCH query `company_id` must be UUID (use `row.company_id` from list) **or** BE accept slug like `ListInboxQueryDto` + resolve in `markRead`; browser must get **HRM-NOTIF-202** |
| **R-W4-B3-NT01-MARK-BROADCAST-CTA** | P1 | **dev-fe** | Hide/disable mark on `recipient_employee_id IS NULL` until SPEC_GAP closed (BA AC-NT01-MARK-01 personal-only) |
| **R-W4-B3-NT01-INBOX-SCOPE-PROXY** | — | — | **CLOSED** this seat (GET/list) |
| **R-W4-B3-NT01-PORTAL-EMBED-EMPLOYEE-ID** | — | — | **CLOSED** in browser (employee_id present on GET) |
| Leave L2 | — | — | **not touched** |
| HRM-NT-02 mobile | — | qa-device | **out of scope** |
| Phase1 / UAT DONE | — | — | **not claimed** |

---

## Screenshots notes

| File | Note |
|------|------|
| `01-nv-after-login.png` | NV login OK |
| `02-nv-notifications-embed.png` | Inbox list + Chưa đọc (scope proxy fixed) |
| `03-nv-after-mark-read.png` | After click — still unread (PATCH 400) |
| `04-nv-after-f5.png` | F5 list still unread |
| `05-ceo-notifications.png` | CEO requires-employee honest empty |

---

## Handoff

```
ack_status: FAIL
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT-R3
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r3.md
uat_done: false
completion_report: L0+fe-be PASS; R2 residual INBOX-SCOPE-PROXY CLOSED — GET inbox 200 + list visible for uat.nv0007 embed; ceo@ EXPECTED_NO_INBOX PASS; MARK FAIL — PATCH company_id=trsport → 400 HRM-VAL-001 (MarkInboxReadQueryDto @IsUUID); no HRM-NOTIF-202 in browser.
next_owner: pm → dev-fe (primary) · optional dev-be slug parity
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W4-FE-NT01-MARK-COMPANY-UUID-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
u65_zero_seed: true
read_first: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r3.md · apps/web/hrm/src/integrations/hrmApi.ts markHrmInboxNotificationRead · apps/web/hrm/src/hooks/useHrmInboxNotifications.ts · apps/api/hrm-api/src/notifications/dto/mark-inbox-read.query.dto.ts · docs/qa/professional/by-uc/HRM-NT-01.md §10
entry_criteria: PO-UC-TC-W4-QA-B3-HRM-NT-R3 FAIL — portal embed GET inbox 200 OK after scope proxy; PATCH …/read?company_id=trsport → 400 HRM-VAL-001 «company_id must be a UUID»; BE MarkInboxReadQueryDto @IsUUID while list accepts slug; BA mark HP = personal recipient only
exit_criteria: uat.nv0007@xe.vn → /hr/notifications?portal=1&companyId=trsport → GET 200; «Đánh dấu đã đọc» on personal row → PATCH HRM-NOTIF-202; FE after 2xx + F5; hide/disable mark on broadcast NULL (AC-NT01-MARK-01); vitest update; ack_status READY_FOR_QA; evidence docs/qa/evidence/po-uc-tc-w4-fe-nt01-mark-company-uuid-01.md
allowed_paths: apps/web/hrm/src/integrations/hrmApi.ts · apps/web/hrm/src/hooks/useHrmInboxNotifications.ts · apps/web/hrm/src/pages/InboxNotifications.tsx · apps/web/hrm/src/components/layout/AppHeader.tsx · apps/web/hrm/src/integrations/hrmApi.markInboxRead.test.ts · optional BE apps/api/hrm-api/src/notifications/dto/mark-inbox-read.query.dto.ts + hrm-inbox.service.ts slug resolve (if PM splits to dev-be)
forbidden_paths: seed · pnpm seed:*
Then QA retest PO-UC-TC-W4-QA-B3-HRM-NT-R4 (same browser AC).
```
