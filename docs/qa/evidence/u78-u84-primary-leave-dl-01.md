# Evidence — U78-U84-PRIMARY-LEAVE-DL-01

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-PRIMARY-LEAVE-DL-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **BLOCKED** Primary cell CO-DL · supporting **L1 holding PASS** |
| **cell** | P-LEAVE @ **CO-DL** · L1 only |
| **U65** | honored — no seed / no inbox seed / no DB fake |
| **U76** | `hdsd_align: true` |
| **U78** | [`u78-u84-primary-leave-dl-01-test-log.md`](u78-u84-primary-leave-dl-01-test-log.md) · [`.json`](u78-u84-primary-leave-dl-01-test-log.json) |
| **raw** | [`_tmp-u78-u84-primary-leave-dl-01-browser.json`](_tmp-u78-u84-primary-leave-dl-01-browser.json) |
| **screens** | `docs/qa/evidence/screens/u78-u84-primary-leave-dl-01/` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · emulator-5554 · `vn.xevn.hrm.mobile` |
| **commit** | `dc930c5` |
| **L0** | `qc:dev-stack` HRM+XBOS+portal **200** (Node UV assert noise on exit ignored) |

---

## Executive verdict

**PASS_TO_PM** — U78 execution of Primary cell **P-LEAVE @ CO-DL** completed with honest co_key result:

| Layer | Result |
|-------|--------|
| **TC-HIM-LEAVE-DL-HP-001 / AP-001** | **BLOCKED (env)** — HRM `company_id=finance` and `xe-du-lich`/`main` have **0 employees**; preferred mobile personas live on **holding** |
| **L1 product chain** (locked personas) | 🟢 **PASS** on holding — `uat.nv0003` submit → `uat.nv0001` ManagerApprovals **Duyệt** → submitter **Đã duyệt** (F5/API) |
| **L2 / T_L1** | **not claimed** — SPEC_GAP HOLD (FORBIDDEN this WI) |
| **UAT / Phase1 / whole U84 EVIDENCED** | **not claimed** |

**promoted TC-IDs:** *(none)* — cấm invent EVIDENCED for CO-DL while co_key empty.  
**supporting XREF (holding only):** TC-MOB-LV-CR-HP-001 · TC-MOB-LV-MGR-HP-001/003 — not HIM-DL promotion.

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | Portal web `/hr/attendance` · tab **Nghỉ phép** @ CO-DL | Yes (`#root=4`) | Phase A probe |
| 2 | **Tạo yêu cầu nghỉ** (web) | Button visible @ finance / xe-du-lich | Not mutate — 0 employees |
| 3 | Mobile FAB **Thao tác nhanh** → **Tạo đơn nghỉ** | Yes | Phase B HP |
| 4 | Wizard Bước 1–4 · **Gửi đơn** | Yes | Phase B HP |
| 5 | Manager **Phê duyệt** / `home-action-tile-approve` | Yes | Phase B AP |
| 6 | Filter **Nghỉ phép** · **Duyệt** | Yes | Phase B AP |
| 7 | Submitter list tab **Đã duyệt** | Yes | Phase B F5 |
| 8 | L2 ladder / T_L1 | N/A HOLD | **not executed** |

---

## Phase A — CO-DL browser (Primary co_key)

**Persona:** `du-lich.ceo@xe.vn` / `Xevn@2026` · tenant `xe-du-lich` · company `main` · Plane B slug `finance`.

| Probe | Result |
|-------|--------|
| `GET /employees?company_id=finance` | **200** `HRM-EMP-200` · **total=0** |
| `GET /employees?company_id=10000000-…0004` (CO-DL UUID) | **total=0** |
| `GET /employees?company_id=main` as du-lich.ceo | **total=0** |
| Web `/hr/attendance?…&companyId=finance` | Mount OK · leave KPI **0** · banner «Không thể tải danh sách đơn nghỉ phép» on finance URL · create CTA present |
| Web `tenantId=xe-du-lich&companyId=main` | Mount OK · Chờ duyệt **(0)** |

**Root cause (env, not product leave engine):** no staff rows under CO-DL scope → cannot FE-submit a CO-DL instance without inventing data (U65 forbids seed).  
Screens: `01-co-dl-finance.png` · `01-co-dl-xe-du-lich-main.png`.

---

## Phase B — L1 chain locked personas (holding · supporting)

| Role | Account | Scope |
|------|---------|-------|
| Submitter | `uat.nv0003@xe.vn` / `xevn-uat-2026` | holding UUID `10000000-…0001` · emp `2680f15f-…` |
| L1 approver | `uat.nv0001@xe.vn` / `xevn-uat-2026` | same holding · emp `3796d949-…` · `is_manager=true` · **not** `ceo@xe.vn` |

### HP — submit (FE mobile)

1. Deep-link login → **Trang chủ**
2. FAB → **Tạo đơn nghỉ**
3. Optional fail-deep: `leave-create-next` **disabled** until date (`nextDisabled=true`)
4. Date → loại **Phép năm** → **Gửi đơn nghỉ** → confirm **Gửi đơn**
5. UI: **Đã gửi đơn** path · pending visible to manager

| Field | Value |
|-------|--------|
| leave_id | `476c48bc-d557-463f-8cd8-213475d91ce0` |
| status | `pending` · `status_label=Chờ duyệt` |
| leave_type | `annual` · `leave_type_label=Phép năm` |
| total_days | 1 |
| Network (API assert during FE run) | `GET …/leave-requests?status=pending&manager_employee_id=…` → **200** `HRM-LEAVE-200` · row present |

### AP — L1 Duyệt (ManagerApprovals)

1. Login `uat.nv0001` → tile **Duyệt**
2. **Nghỉ phép (2)** → **Duyệt** on UAT NV 0003 row
3. Confirm → UI **«Đã duyệt đơn nghỉ phép»** · count **Nghỉ phép (1)**
4. Pull-refresh F5 · API pending for submitter leave **cleared** (`fromSub=[]`, total 2→1)
5. Re-login submitter → approved list / API `status=approved` · `status_label=Đã duyệt` for `476c48bc-…`

**FE after 2xx + F5:** submitter sees **Đã duyệt** for the FE-created leave.  
Screens: `mobile/10-sub-home.png` … `32-sub-f5.png`.

---

## Case matrix (this WI)

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | step0 next disabled | 🟢 optional PASS | mobile |
| B success L1 | HP+AP | 🟢 holding · 🟡 BLOCKED CO-DL co_key | Primary cell not EVIDENCED |
| C logic L2 / T_L1 | SG | ⬜ FORBIDDEN | SPEC_GAP HOLD |

---

## Promoted / not_promoted

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-HIM-LEAVE-DL-HP-001 | **BLOCKED** | co_key CO-DL empty |
| TC-HIM-LEAVE-DL-AP-001 | **BLOCKED** | same |
| TC-HIM-LEAVE-DL-SG-L2-001 | **SPEC_GAP** | not executed |
| TC-HIM-LEAVE-DL-FD-001 | OPTIONAL_SKIP | fail-deep optional |
| *(none promoted to EVIDENCED)* | — | catalog ≠ UAT honesty OS 33 |

---

## Residuals

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **R-U84-LEAVE-DL-PERSONA-SCOPE-01** | P0 | devops/ba-data + sponsor bootstrap | Map UAT NV **or** create DL staff under `finance`/`xe-du-lich` **outside** QA seed path; then QA retest TC-HIM-LEAVE-DL-HP/AP on true co_key |

---

## completion_report

**Closed:** U78 browser+device execution of Primary P-LEAVE cell attempt; IEEE/ISO test-log pair; CO-DL env BLOCK documented; holding L1 FE chain proven with locked personas (not ceo@ L1); L2/T_L1 explicitly not claimed; zero seed.  
**Open:** CO-DL persona/data mapping residual — TC-HIM-LEAVE-DL-* stay BLOCKED until staff exist under Primary co_key.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/u78-u84-primary-leave-dl-01.md`

### next_dispatch_prompt

```text
work_item_id: R-U84-LEAVE-DL-PERSONA-SCOPE-01
role: devops (or ba-data triage) — NOT more catalog stubs
priority: P0
entry: U78 evidence docs/qa/evidence/u78-u84-primary-leave-dl-01.md · finance/xe-du-lich employees total=0 · uat.nv0003/0001 on holding
mission: Sponsor-authorized bootstrap OR remap UAT personas into CO-DL (Plane B finance / org xe-du-lich) so Primary leave cell has ≥1 submitter + manager_id L1; U65 — do not use seed as UAT evidence
exit: employees total≥1 @ finance or xe-du-lich/main · manager edge for L1 · READY_FOR_QA
then: Task qa U78-U84-PRIMARY-LEAVE-DL-01-R1 retest TC-HIM-LEAVE-DL-HP-001 + AP-001 on true co_key
alternate next Primary (if defer DL): U78-U84-PRIMARY-REC-PLAN-TMDV-01 — P-REC-PLAN @ CO-TMDV L1 browser
cấm: invent EVIDENCED for HIM-LEAVE-DL · claim L2 ladder · seed for QA PASS
```
