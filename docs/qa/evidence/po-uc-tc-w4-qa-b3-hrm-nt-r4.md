# Evidence — `PO-UC-TC-W4-QA-B3-HRM-NT-R4`

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B3-HRM-NT-R4` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | UC-HRM-12 · HRM-NT-01 §10 · `/hr/notifications` |
| **persona HP** | `uat.nv0007@xe.vn` / `xevn-uat-2026` · `trsport` |
| **persona AU** | `ceo@xe.vn` / `Xevn@2026` · **EXPECTED_NO_INBOX** |
| **portal** | `http://127.0.0.1:5173` |
| **commit** | `dc930c5` |
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r4-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-r4/` |
| **script** | `scripts/qa/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r4-browser.mjs` |
| **prior FE** | `docs/qa/evidence/po-uc-tc-w4-fe-nt01-mark-company-uuid-01.md` |
| **prior QA** | `docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r3.md` |
| **uat_done** | **false** |

---

## L0 + fe-be-health

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | hrm / xbos / portal **200** (Windows UV_HANDLE_CLOSING noise after green — same class as R3) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed | **none** |
| FE load | Hard reload + cache-bust query on `/hr/notifications` |

---

## Precond (API · U65 · diagnostic only — not UF PASS)

| Check | Result |
|-------|--------|
| NV mobile login | **201** `HRM-AUTH-200` · `employee_id=b06422c0-f640-45d1-8cab-cb4a609848d6` · OU `trsport` |
| Inbox before browser | **GET** proxy inbox **200** `HRM-NOTIF-200` · **45 unread** · **13 personal** · **32 broadcast NULL** |
| Personal sample | `958f0121-842e-4375-954a-4311d67153b6` · `company_id=10000000-0000-4000-8000-000000000002` |
| Fanout | Prior U65 FE fanout (no seed this seat) |

---

## Browser matrix (P0)

### UF-HRM-NT-01 — NV mark read (`uat.nv0007@xe.vn`)

| Step | Observation |
|------|-------------|
| Login | `/hr/login` → mobile credentials **OK** (`01-nv-after-login`) |
| Open | `/hr/notifications?portal=1&tenantId=xevn&companyId=trsport` (+ hard reload) |
| FE list | **List visible** · «Chưa đọc» badges · **no** requires-employee copy |
| Network GET | **GET** `/api/hrm/notifications/inbox?company_id=trsport&employee_id=b06422c0-…&limit=*` → **200** `HRM-NOTIF-200` |
| Broadcast CTA | `inbox-mark-read-{broadcastId}` **not visible** · mark testids **13** (= personal unread only) · `PASS_NO_CTA_ON_BROADCAST` |
| Action | Click «Đánh dấu đã đọc» on personal `958f0121-…` (`03-nv-after-mark-read`) |
| Network PATCH | **PATCH** `…/inbox/958f0121-…/read?company_id=10000000-0000-4000-8000-000000000002` → **200** `HRM-NOTIF-202` |
| Query UUID | `company_id` = **UUID** · **not** slug `trsport` |
| FE after 2xx | Mark CTA for that row gone (`markedRowGoneUnread=true`) |
| F5 | List reloads GET **200**; marked personal row stays without mark CTA (`04-nv-after-f5`) |
| Verdict | **PASS** · AC-NT01-MARK-01 + LIST-01 |

**Closed from R3:**

| Residual | Status |
|----------|--------|
| `R-W4-B3-NT01-MARK-COMPANY-UUID` | **CLOSED** — PATCH uses UUID |
| `R-W4-B3-NT01-MARK-BROADCAST-CTA` | **CLOSED** — no mark CTA on broadcast NULL |

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
| **execution** | **PASS** (R4 after FE mark company UUID) |
| **uat_done** | **false** |
| **AC-NT01-CEO-01** | **PASS** (EXPECTED_NO_INBOX) |
| **AC-NT01-PERSONA-01** | NV valid at API + browser list |
| **AC-NT01-LIST-01** | **PASS** (GET 200 + list visible) |
| **AC-NT01-MARK-01** | **PASS** (PATCH 200 `HRM-NOTIF-202` + UUID query + personal-only CTA) |
| **AC-NT01-U65-01** | Precond unread from prior FE fanout; no seed |

---

## Residual → PM

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| Mark UUID / broadcast CTA | — | — | **CLOSED** this seat |
| Leave L2 | — | — | **not touched** |
| HRM-NT-02 mobile | — | qa-device | **out of scope** |
| Phase1 / UAT DONE | — | — | **not claimed** (`uat_done: false`) |

---

## Screenshots notes

| File | Note |
|------|------|
| `01-nv-after-login.png` | NV login OK |
| `02-nv-notifications-embed.png` | Inbox list + Chưa đọc |
| `03-nv-after-mark-read.png` | After personal mark → HRM-NOTIF-202 |
| `04-nv-after-f5.png` | F5 persist |
| `05-ceo-notifications.png` | CEO requires-employee honest empty |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT-R4
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r4.md
uat_done: false
completion_report: L0+fe-be PASS; R3 residuals CLOSED — uat.nv0007 embed GET inbox 200 + list; personal mark PATCH HRM-NOTIF-202 with company_id UUID (not trsport); broadcast NULL no mark CTA; FE after 2xx + F5; ceo@ EXPECTED_NO_INBOX PASS; uat_done false.
next_owner: qc
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W4-QC-B3-HRM-NT-R4
from_role: pm
to_role: qc
lane: governance
priority: P0
u65_zero_seed: true
hdsd_align: UC-HRM-12 · HRM-NT-01 §10 · /hr/notifications
read_first: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r4.md · docs/qa/evidence/po-uc-tc-w4-fe-nt01-mark-company-uuid-01.md · docs/qa/professional/by-uc/HRM-NT-01.md §9–§10 · docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r3.md
entry_criteria: QA R4 PASS_TO_PM — browser U65; personal mark PATCH 200 HRM-NOTIF-202 with UUID company_id; broadcast CTA hidden; ceo@ EXPECTED_NO_INBOX; uat_done false
exit_criteria: QC GO or GO WITH CONDITIONS for NT-01 mark-read wave (R-W4-B3-NT01-MARK-COMPANY-UUID + MARK-BROADCAST-CTA CLOSED); do not promote Phase1 UAT DONE; evidence docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-r4.md; ack_status PASS_TO_PM
cấm: seed · claim uat_done true · PASS only curl
```
