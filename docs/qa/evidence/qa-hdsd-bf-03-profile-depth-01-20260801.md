# QA-HDSD-BF-03-PROFILE-DEPTH-01 — Profile tab depth TC-028..034

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-BF-03-PROFILE-DEPTH-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · `C-P2-YELLOW-PROMOTE` · residual **C-BF03-PROFILE-01** |
| **from_role** | `pm` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · run wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **URL** | `http://127.0.0.1:5173` · HRM embed `/hr/employees/:id` |
| **policy** | U65 zero-seed · browser-only · **no seed** · **no re-mutate** TC-06/07/08 |
| **ack_status** | **PASS_TO_PM** |
| **harness** | `scripts/qa/qa-hdsd-bf-03-profile-depth-01-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-bf-03-profile-depth-01-runtime.json` |
| **promote** | `scripts/qa/qa-hdsd-matrix-promote-bf-03-profile-depth-01.mjs` → `_tmp-qa-hdsd-matrix-promote-bf-03-profile-depth-01-result.json` |
| **screenshots** | `docs/qa/evidence/screens/hdsd-bf-03-profile-depth-01-20260801/` |
| **spec_ref** | `HDSD_XEVN_CH05_HRM_NHAN_SU.md` §5.4 · matrix TC-028..034 · QC R5 residual C-BF03-PROFILE-01 |

## Executive verdict

**C-BF03-PROFILE-01 CLOSED** — browser depth on employee profile **7/7 🟢** · matrix **+7🟢 −7🟡** · **0 regression** · must_keep Ch09 096/097 + mutate TC-06/07/08 untouched.

| Layer | Verdict | Notes |
|-------|---------|-------|
| L0 stack | 🟢 | HRM/XBOS/portal **200** |
| FE↔BE | 🟢 | `qc:fe-be-health` **8/8 PASS** |
| J-HRM-02 list→profile | 🟢 | row-click → `/hr/employees/{id}` · GET detail **200** · `employee-profile-page` |
| TC-028..034 | 🟢 | **7/7** depth |
| must_keep | 🟢 | 096/097 matrix rows not rewritten · no mutate run |
| Seed | 🟢 | none |

**Overall:** **PASS_TO_PM** — ready QC close residual C-BF03-PROFILE-01 / optional yellow-promote wave remaining.

---

## L0

| Probe | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | hrm **200** · xbos **200** · portal **200** |
| `pnpm run qc:fe-be-health` | **8/8 PASS** (login + employees + catalog + proxy) |

---

## Click path (U65 FE)

1. Inject portal session `ceo@xe.vn` (API login → localStorage) — **no seed**.
2. Open `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main`.
3. **J-HRM-02:** click first data row → `/hr/employees/36e2b988-8188-426d-b111-eb799f697c5b`.
4. Assert `data-testid=employee-profile-page` + GET `/api/hrm/employees/{id}` **200**.
5. Depth: core tabs → group popovers (Career → KPI) → general blocks → salary sensitive → status badge → bad UUID not-found.

---

## TC results

| TC | HDSD §5.4 | Evidence | Verdict |
|----|-----------|----------|---------|
| **TC-HRM-HDSD-028** | Header | name + **Chỉnh sửa** visible | 🟢 |
| **TC-HRM-HDSD-029** | Dải tab Cốt lõi | `profile-tab-groups` + general/work/contract/salary | 🟢 |
| **TC-HRM-HDSD-030** | Nhóm tab mở rộng | hr/career/personal + panel career + nested **kpi** | 🟢 |
| **TC-HRM-HDSD-031** | Tab Thông tin chung | personal + address + emergency + work + finance/BH + status | 🟢 |
| **TC-HRM-HDSD-032** | Phân quyền nhạy cảm | CEO portal: salary content, no blank, fallback not forced | 🟢 |
| **TC-HRM-HDSD-033** | Trạng thái hồ sơ | badge **Đang làm việc** | 🟢 |
| **TC-HRM-HDSD-034** | Lỗi thường gặp | bad UUID → «Không tìm thấy…» + Quay lại · GET **404** · no 500 banner | 🟢 |

### Journey

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-02** | 🟢 | row-click · profile page · GET **200** · id `36e2b988-8188-426d-b111-eb799f697c5b` |

---

## Matrix promote

| Metric | Before | After |
|--------|--------|-------|
| 🟢 | 310 | **317** (+7) |
| 🟡 | 54 | **47** (−7) |
| ⬜ | 0 | 0 |
| regressions | — | **0** |

Header + Coverage summary refreshed to **317🟢 · 47🟡 · 0⬜**.

---

## must_keep

| Item | Status |
|------|--------|
| BF-03 mutate TC-06/07/08 | **not re-mutated** this WI |
| Ch09 TC-HRM-HDSD-096 / 097 | **🟢 preserved** (promote allow-list excludes them) |
| Prior 🟢 rows | **0** downgrade |

---

## Residual (honest)

| ID | Item | Sev | Owner | Blocks? |
|----|------|-----|-------|---------|
| **R-PROFILE-DENY-01** | TC-032 deny-path for role **without** `view_salary` not executed this WI (CEO positive path only) | P3 | qa optional | **No** — HDSD AC for Group CEO satisfied |
| **C-BF03-MOB-DEPTH-01** | MOB-020..022/030 | P2 | qa-device | No — out of scope |
| **C-BF03-MUTATE-DEFER-01** | soft-delete/BH dialog | P2 | qa | No — out of scope |
| **C-HOLD-DEPLOY** | Evidence local `:5173` only | Info | devops | No |

**C-BF03-PROFILE-01** → **CLOSED** (7/7 🟢).

---

## Screenshots

`docs/qa/evidence/screens/hdsd-bf-03-profile-depth-01-20260801/`

- `01-employees-list.png`
- `02-profile-landing.png`
- `03-header.png`
- `04-core-tabs.png`
- `05-group-popover.png`
- `06-general-blocks.png`
- `07-salary-sensitive.png`
- `08-not-found.png`
- `09-recovery-list.png` (if back clicked)

---

## completion_report

**Closed:** C-BF03-PROFILE-01 · TC-HRM-HDSD-028..034 browser depth · matrix promote +7🟢 · J-HRM-02 🟢.

**Open residual:** R-PROFILE-DENY-01 (optional non-CEO deny) · other BF-03 yellow buckets unchanged (mobile / mutate defer).

## next_owner

`qc` (close C-BF03-PROFILE-01 on P2 gate) **or** `pm` (dispatch next C-P2-YELLOW-PROMOTE slice).

## next_dispatch_prompt

```text
work_item_id: QC-HDSD-BF-03-PROFILE-CLOSE-01
from_role: pm | to_role: qc
program: P-HDSD-ECOSYSTEM-03 · C-P2-YELLOW-PROMOTE
entry_criteria:
- QA-HDSD-BF-03-PROFILE-DEPTH-01 PASS_TO_PM
- evidence docs/qa/evidence/qa-hdsd-bf-03-profile-depth-01-20260801.md
- matrix TC-028..034 🟢 · must_keep 096/097 + mutate TC-06/07/08 preserved
exit_criteria:
- Audit C-BF03-PROFILE-01 CLOSED or GWC with R-PROFILE-DENY-01 P3 only
- No false 🟢 · U65 zero-seed ack
- evidence docs/qa/evidence/qc-hdsd-bf-03-profile-close-01-20260801.md
ack_status: PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
