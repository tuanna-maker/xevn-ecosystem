# PO-E2E-SPINE-02-03-MOB-QA-W1 — Mobile leave + late spine (device)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-02-03-MOB-QA-W1` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **program** | `PO_E2E_BUSINESS_SPINE_PROGRAM.md` § SPINE-02 / SPINE-03 |
| **device** | `emulator-5554` (API 14 / sdk_gphone64_x86_64) |
| **package** | `vn.xevn.hrm.mobile` (installed qa-device APK; prior AUTH-MOB build) |
| **API** | Host `http://127.0.0.1:28001` · Emulator `http://10.0.2.2:28001` |
| **NV persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` · company `holding` · UUID `10000000-0000-4000-8000-000000000001` (**not** `main`) |
| **Mgr persona** | `ceo@xe.vn` / `Xevn@2026` · role «Quản lý nhân sự» · same holding UUID |
| **U65** | **honored** — no seed / no DB fake; create leave from FE mobile only |
| **hdsd_align** | FAB «Thao tác nhanh» → «Tạo đơn nghỉ»; Manager tile «Phê duyệt»; HDSD inventory below |
| **test_log** | [`po-e2e-spine-02-03-mob-qa-w1-test-log.md`](po-e2e-spine-02-03-mob-qa-w1-test-log.md) · [`.json`](po-e2e-spine-02-03-mob-qa-w1-test-log.json) |
| **screens** | `docs/qa/evidence/screens/po-e2e-spine-02-03-mob-qa-w1/` |

---

## Executive verdict

**PASS_TO_PM** — SPINE-02 **LV-01 submit** closed on device (wizard → confirm balance warn → **«Đã gửi đơn»**). **J-MOB-03** list→detail earlier same wave showed **Chờ duyệt**. **Manager approve (J-MOB-05)** and **AT-01 late/adjust** are **🟡 BLOCKED** on product/org/nav gaps (not seed). **LV-02** capped **🟡 SPEC_GAP** per PO (no L1/L2 day ladder in BA matrix). **No UAT DONE / Phase 1 DONE claim.**

| Case | Channel | Verdict | Notes |
|------|---------|---------|-------|
| **LV-01** submit | Mobile NV | 🟢 | FAB → Tạo đơn nghỉ → 4 bước → Gửi đơn; toast success; leave `403a68d3-…` `pending` (API probe during run) |
| **LV-01** QL approve | Mobile mgr | 🟡 BLOCKED | `ceo@xe.vn` ManagerApprovals **Nghỉ phép (0)**; BE filter `manager_employee_id` → `employees.manager_id`; HLD-0001 not under CEO emp; inbox shows leave notification but approve list empty |
| **LV-02** L2 ladder | — | 🟡 SPEC_GAP | PO: SRS FR-UC-H03 two-level without day cut; BA matrix file absent |
| **AT-01** late/adjust | Mobile NV | 🟡 BLOCKED | `CreateUpdateRequest` exists in code; **no** HDSD entry from Home/Profile/Settings for employee; FAB only check-in + leave; hub «Đi muộn» is stat not create |
| **Fail deep** leave | Mobile | 🟢 | Step0 `leave-create-next` disabled until date range; balance warn «vượt/không còn số dư» on confirm |

---

## HDSD inventory (U76)

| # | HDSD surface | Found on device | Used |
|---|--------------|-----------------|------|
| 1 | Trang chủ | Yes | Login home |
| 2 | FAB «Thao tác nhanh» | Yes (`check-in-fab`) | LV-01 |
| 3 | «Tạo đơn nghỉ» | Yes | LV-01 |
| 4 | Wizard Bước 1–4 / «Gửi đơn nghỉ» | Yes | LV-01 |
| 5 | «Nghỉ phép» tile → list/detail | Yes | J-MOB-03 |
| 6 | Manager «Phê duyệt» / «Cần duyệt» | Yes (`home-action-tile-approve`) | J-MOB-05 attempt |
| 7 | «Đơn công» / tạo đi muộn | **Not in employee nav** | AT-01 blocked |
| 8 | Settings quick nav | Lương/HĐ/Hồ sơ/Thông báo — **no Đơn công** | AT-01 |

---

## Click path — LV-01 (🟢 submit)

1. Deep-link login `uat.nv0001@xe.vn` → home (`Trang chủ`) — `01-home` / `61-home`
2. Tap FAB `check-in-fab` → sheet «Thao tác nhanh» — `62-fab-sheet`
3. Tap «Tạo đơn nghỉ» — `63-create-step0` (Bước 1 · 03/08/2026 · Tiếp tục initially disabled = fail-deep)
4. Date field → Tiếp tục → Bước 2 «Nghỉ phép năm» (balance chip **Còn lại: 0 / 0**) — `66-step1`
5. Tiếp tục → Bước 3/4 → «Gửi đơn nghỉ» — `69-step3`
6. Confirm modal balance warn → tap **«Gửi đơn»** — `75-confirm` / `76-post-confirm`
7. Alert: **«Đã gửi đơn»** / «Đơn nghỉ phép đã được gửi thành công.» → OK

**API (during run, U65 FE-origin):** leave id `403a68d3-c926-43d8-9ffe-cffb1ce0f18e` · `status=pending` · `leave_type=annual` · reason «Xin nghỉ từ mobile» · `company_uuid` holding · `x-company-id` UUID.

Machine logs: `_lv-create-log.json`, confirm tap script exit 0.

---

## Click path — J-MOB-05 approve (🟡)

1. Login `ceo@xe.vn` → home
2. Tap `home-action-tile-approve` → ManagerApprovals
3. Observed: **Tất cả (0) / Nghỉ phép (0)** · empty copy «Không có đơn nghỉ phép chờ duyệt» — `103-approvals.xml` / `_late-mgr-log.json`
4. Probe: `GET /attendance/leave-requests?status=pending&manager_employee_id=<ceo_emp>` → **total=0**; same without manager filter → **27** pending (incl. LV-01 row)
5. Root cause: list SQL filters `lr.employee_id IN (SELECT e.id FROM employees e WHERE e.manager_id = :manager)`. HLD-0001 not reporting to CEO employee id → UI empty. **Not** fixed by seed (U65). Need org manager link **or** approver persona that owns `manager_id` for NV — BA/Dev residual.

---

## Click path — AT-01 (🟡 BLOCKED)

Attempted: Profile scroll, Chấm công tile, FAB, hub «Đi muộn», Settings «Điều hướng nhanh».  
**Result:** no «Đơn công» / `CreateUpdateRequest` surface. Screens: `111-profile`, `116-update-list`, `145-settings`, `_at-hub-log.json` / `_at-mgr-finish.json`.  
Home shows stat **«Đi muộn» 0** but tap does not open create form.

---

## LV-02

🟡 **SPEC_GAP** — PO A0 BA matrix `po-e2e-ba-case-matrix-01.md` **absent**; FR-UC-H03 two-level without day threshold. No device ladder L2 executed.

---

## Residuals (PM dispatch)

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **R-SPINE-MGR-HIER-01** | P0 | ba-process + dev-be | Wire `employees.manager_id` for UAT NV→QL **or** document approve persona; retest J-MOB-05 on device without seed |
| **R-SPINE-AT-NAV-01** | P1 | dev-mobile | HDSD entry to `UpdateRequests`/`CreateUpdateRequest` for employee (tile/settings/hub) |
| **R-SPINE-LV02-BA-01** | P1 | ba-process | Publish day→level ladder; then QA LV-02 |
| **R-SPINE-02-WEB** | P1 | qa | Wave A3 web LV-03/04 |

---

## completion_report

Closed: device login dual-base (`127.0.0.1` fetch / `10.0.2.2` app); **LV-01 FE submit** success; leave list/detail pending; fail-deep step0; company UUID header scope; U78 logs.  
Open: manager approve empty under hierarchy filter; AT-01 create surface missing from employee IA; LV-02 SPEC_GAP; API flapped EADDRINUSE mid-wave (recovered).

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/po-e2e-spine-02-03-mob-qa-w1.md`

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-02-WEB-QA-W1
role: qa
priority: P0
entry: SPINE-02 web LV-03/04 + menu attendance; U65 zero-seed; U78
parallel residual: Task ba-process R-SPINE-LV02-BA-01 + R-SPINE-MGR-HIER-01 (manager_id for uat.nv0001)
after hierarchy fix: Task qa-device retest J-MOB-05 Duyệt on emulator-5554
cấm: seed inbox · claim UAT DONE
evidence: docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md
```
