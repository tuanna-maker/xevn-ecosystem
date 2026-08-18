# R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05 — J-MOB-05 Option A (device)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **startedAt** | `2026-08-03T15:46:04.184Z` |
| **finishedAt** | `2026-08-03T15:53:48.577Z` |
| **ack_status** | **FAIL_TO_PM** |
| **spec_ref** | FR-UC-H03 · J-MOB-05 · BA `r-spine-mgr-hier-01.md` Option A |
| **entry** | Browser PASS [`r-spine-mgr-hier-01-qa-browser.md`](r-spine-mgr-hier-01-qa-browser.md) · manager_id UAT-0003→HLD-0001 |
| **U65** | **honored** — no `pnpm seed:*` · no DB `manager_id` write · no inbox seed · no Option C · **not** `ceo@xe.vn` as L1 |
| **U76** | `hdsd_align: true` — inventory below |
| **U78** | [`r-spine-mgr-hier-01-qa-device-jmob05-test-log.md`](r-spine-mgr-hier-01-qa-device-jmob05-test-log.md) · [`.json`](r-spine-mgr-hier-01-qa-device-jmob05-test-log.json) |
| **device** | `emulator-5554` · `vn.xevn.hrm.mobile` 1.0.0 |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` · 71,602,307 B · SHA256 `AB93DA36B9B44776764268F994873FFB2E77A1E1F2B9C1701610C5A65433F5AB` |
| **API** | Host `http://127.0.0.1:28001` · Emulator `http://10.0.2.2:28001` |
| **screens** | `docs/qa/evidence/screens/r-spine-mgr-hier-01-qa-device-jmob05/` |
| **runtime** | `_preflight.json` · `_run.json` · `_retry.json` |
| **AT-01** | **not reopened** (QC GWC CLOSED) |

---

## Executive verdict

**🔴 FAIL_TO_PM** — Option A hierarchy + FE submit **PASS**; ManagerApprovals **Duyệt** **FAIL** (not mounted).

| AC | Result |
|----|--------|
| AC-1 Submitter FE leave (`uat.nv0003`) | 🟢 unpaid pending `ac9db485-5d4f-4d77-9d25-114b157f70cf` · UI «Đơn nghỉ phép đã được gửi thành công» |
| AC-2 Approver `uat.nv0001` → ManagerApprovals Nghỉ phép ≥1 | 🔴 tile «Việc» → **Thông báo** (inbox) · FAB/Profile no approvals entry |
| AC-3 Duyệt 2xx | ⬜ not reached |
| AC-4 F5 queue clear | ⬜ not reached |
| AC-5 Holding UUID (not `main`) | 🟢 `10000000-0000-4000-8000-000000000001` |
| AC-6 U65 / no ceo L1 / no Option C | 🟢 |

**Root cause (device):** HLD-0001 (`uat.nv0001`) JWT `roles=["employee"]`, `is_manager=false` because `employees.custom_fields.mobile_persona="emp"` + `is_manager="false"` **locks** EMP persona — `resolveRolesForEmployee` skips direct-report promotion (`personaLocksEmployee`). Home/summary `viewer.is_manager=false` → dashboard `showManagerApprovalsPath=false` → approve tile routes to **Thông báo**, not ManagerApprovals.

**Not** a hierarchy gap: `manager_id` edge + mgr leave filter already return the UAT-0003 đơn (total pending for mgr **2**, including submitter leave).

---

## Persona lock (honored)

| Role | Account | Employee |
|------|---------|----------|
| Submitter | `uat.nv0003@xe.vn` / `xevn-uat-2026` | UAT-0003 · `2680f15f-02b6-44e1-8b42-92a6aaeb7bfb` · `manager_id=3796d949-4513-45c0-88fa-33030a062b17` |
| Approver L1 | `uat.nv0001@xe.vn` / `xevn-uat-2026` | HLD-0001 · `3796d949-4513-45c0-88fa-33030a062b17` |
| **Cấm** | `ceo@xe.vn` as L1 | Option C not used |

---

## Preflight (read-only)

| Probe | Result |
|-------|--------|
| L0 `:28001/api/hrm` | **200** |
| UAT-0003 `manager_id` | **= HLD-0001** (`hierarchy_ok`) |
| Holding reports of HLD-0001 | UAT-0003 · UAT-0005 · UAT-0020 |
| `GET leave-requests?status=pending&manager_employee_id=HLD-0001&company_id=holding` | **total≥1** (after submit **2**; from UAT-0003 **1**) |
| Login `uat.nv0001` roles / is_manager | `["employee"]` / **false** |
| Home summary `viewer.is_manager` | **false** · `manager_pending.total_count=0` (JWT role gate) |
| `custom_fields` HLD-0001 | `mobile_persona=emp` · `is_manager=false` |

---

## Click path (HDSD)

### Submitter — UAT-0003

1. Deep-link login → **Trang chủ** (`r-home-uat.nv0003.png`)
2. FAB → **Tạo đơn nghỉ** (`r11-fab.png`)
3. Bước 1 ngày mặc định → Tiếp tục
4. Bước 2 chọn **Nghỉ không lương** (annual balance UI showed 0/0) → Tiếp tục
5. Bước 3–4 → **Gửi đơn nghỉ** → confirm **Gửi đơn**
6. FE: «Đơn nghỉ phép đã được gửi thành công.» (`r18-after.png`)
7. API: pending leave id `ac9db485-…` · type `unpaid` · `employee_id`=UAT-0003 · visible under mgr filter

### Approver — HLD-0001 (FAIL)

1. Deep-link login → **Trang chủ** · tile label **«Việc»** + `home-action-tile-approve` (`r-home-uat.nv0001.png` / `30-mgr-home.png`)
2. Path A: tap approve tile → **Thông báo** unread «Đơn nghỉ phép mới» (`r30-pathA.png`) — **not** ManagerApprovals
3. Path B: FAB — **no** `fab-action-manager-approvals` (`fabHasApprovals=false`)
4. Path C: Profile — **no** `profile-approvals-entry` / `profile-quick-approvals` (`auth.isManager=false`)
5. Duyệt / F5 — **not executed**

---

## hdsd_inventory (U76)

| # | Surface | Found | Used | Verdict |
|---|---------|-------|------|---------|
| 1 | Trang chủ submitter | Yes | Login | 🟢 |
| 2 | FAB → Tạo đơn nghỉ | Yes | Submit | 🟢 |
| 3 | Leave wizard 4 bước | Yes | Unpaid | 🟢 |
| 4 | Confirm Gửi đơn | Yes | After balance soft-warn path | 🟢 |
| 5 | Trang chủ approver | Yes | L1 | 🟢 home |
| 6 | ManagerApprovals / Nghỉ phép (n) | **No** | — | 🔴 |
| 7 | Duyệt CTA | Not reached | — | 🔴 |
| 8 | ceo as L1 | Not used | — | 🟢 |

---

## case_matrix

| Case | Intent | Verdict | Note |
|------|--------|---------|------|
| **A fail deep** | Approve tile without manager persona | 🟢 reproduced | → Thông báo inbox |
| **B success HDSD** | FE submit → ManagerApprovals Duyệt → F5 | 🔴 | Submit 🟢 · Duyệt blocked |
| **C logic BR** | L1 = direct_manager edge; not ceo; U65 | 🟢 | Filter lists UAT-0003 leave; persona lock blocks UI |

---

## Defects / residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-SPINE-MGR-HIER-01-PERSONA-LOCK** | **P0** | `dev-be` | HLD-0001 has 3 reports + pending leave under mgr filter, but `mobile_persona=emp` locks JWT to employee → ManagerApprovals unreachable. Product fix: when `countDirectReports>0`, do not lock EMP (or promote manager role / `is_manager` for home summary from reports). **Cấm** seed/DB fake for QA PASS. Prefer FE/HCNS path to clear persona lock if exists; else BE rule. |
| Leave balance 0/0 annual | P2 | `dev-be` / data | UAT-0003 annual showed 0/0 — unpaid path used for FE submit (still valid leave) |

**AT-01 nav QC GWC:** not touched.

---

## completion_report

Closed device Option A retest after browser set `manager_id`. **FE-submit leave as `uat.nv0003` PASS** (unpaid pending under HLD-0001 filter). **`uat.nv0001` ManagerApprovals Duyệt FAIL** — EMP persona lock (`mobile_persona=emp`) prevents manager UI despite hierarchy + pending≥1. Holding UUID verified. U65/Option C/ceo-L1 honored. No UAT/Phase1 DONE claim.

## next_owner

`pm` → dispatch **`dev-be`** (`R-SPINE-MGR-HIER-01-PERSONA-LOCK`) then **qa-device** retest J-MOB-05 Duyệt.

## next_dispatch_prompt

```text
work_item_id: R-SPINE-MGR-HIER-01-PERSONA-LOCK
from_role: pm
to_role: dev-be
lane: execution
priority: P0
entry: docs/qa/evidence/r-spine-mgr-hier-01-qa-device-jmob05.md FAIL_TO_PM
spec_ref: FR-UC-H03 · J-MOB-05 · mobile-auth resolveRolesForEmployee · home/summary is_manager
problem: uat.nv0001 (HLD-0001) has ≥3 direct reports + pending leave via manager_employee_id filter, but custom_fields.mobile_persona=emp + is_manager=false locks JWT roles=[employee] → ManagerApprovals never mounts (tile→Thông báo).
fix: product rule so L1 with reports gets is_manager/manager role for mobile (ignore emp lock when directReports>0, or align home/summary is_manager with reports). U65: no QA seed of custom_fields.
must_keep: leave manager_id filter; BR-WF-04; AT-01 closed; no Option C ceo-sees-all.
exit: login uat.nv0001 → roles include manager OR home viewer.is_manager=true when reports>0; jest coverage; READY_FOR_QA
evidence_path: docs/qa/evidence/r-spine-mgr-hier-01-persona-lock-be.md
then: Task qa-device R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2 — Duyệt leave ac9db485… (or fresh FE submit) → 2xx → F5 clear
```

## ack_status

**FAIL_TO_PM**
