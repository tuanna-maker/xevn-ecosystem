# QA-HDSD-BF-03-MUTATE-DEFER-01 — Soft-delete / HĐ delete / BH dialog

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-BF-03-MUTATE-DEFER-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · residual **C-BF03-MUTATE-DEFER-01** |
| **from_role** | `pm` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · run wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173` · `PORTAL_DEV_URL` |
| **URL** | `/hr/employees` · `/hr/contracts` · `/hr/insurance` (`?portal=1&tenantId=xevn&companyId=main`) |
| **policy** | U65 zero-seed · browser-only · **no seed** · **must_keep** TC-HDSD-06/07/08 not re-mutated |
| **ack_status** | **PASS_TO_PM** |
| **harness** | `scripts/qa/qa-hdsd-bf-03-mutate-defer-01-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-bf-03-mutate-defer-01-runtime.json` |
| **promote** | `scripts/qa/qa-hdsd-matrix-promote-bf-03-mutate-defer-01.mjs` |
| **screenshots** | `docs/qa/evidence/screens/hdsd-bf-03-mutate-defer-01-20260801/` |
| **spec_ref** | `HDSD_BF_TC_MAP_DELTA.md` §6 · TC-025/041/049 · QC full-gate residual MUTATE-DEFER |

## Executive verdict

**C-BF03-MUTATE-DEFER-01 PARTIAL CLOSE** — **1/3 🟢 · 2/3 honest 🟡 · 0🔴 · 0 false green**.

| TC | Verdict | FE→API | F5 |
|----|---------|--------|-----|
| **TC-HRM-HDSD-025** soft-delete NV | 🟡 | create POST **201**; archive confirm **not reached** (menu Xóa → profile nav) | n/a |
| **TC-HRM-HDSD-041** Xóa HĐ | 🟢 | create POST **201** · DELETE contract **200** | list reload OK |
| **TC-HRM-HDSD-049** Dialog BH | 🟡 | dialog open · POST participants **400** | no ERROR banner |

**must_keep:** TC-HDSD-06/07/08 spines **not** exercised (no YCTD/leave POST; HĐ delete used disposable create→delete, not Đ2 GWC assert).

---

## L0

| Probe | Result |
|-------|--------|
| runtime `l0` | hrm **200** · xbos **200** · portal **200** |
| `pnpm run qc:fe-be-health` | **8/8 PASS** (pre-run) |

---

## Click paths (U65)

### TC-041 🟢 — Xóa hợp đồng
1. Login session `ceo@xe.vn` → `/hr/contracts`.
2. Thêm hợp đồng → form ready → Lưu → POST contracts **201**.
3. Trash → confirm **Xóa** → **DELETE** `/api/hrm/contracts-insurance/contracts/{id}` **200**.
4. F5 / reload list — no ERROR banner.

### TC-025 🟡 — Xóa mềm NV (honest defer)
1. Thêm NV disposable (`QA SoftDel {stamp}`) → POST `/api/hrm/employees` **201**.
2. Search code → open row **⋯** menu — screenshots show **Xem / Chỉnh sửa / Xóa**.
3. Activating **Xóa** (Playwright `menuitem` exact / keyboard / mouse bbox) consistently navigates to `/hr/employees/{id}` (View) — **AlertDialog «Xác nhận xóa nhân viên» never mounts** · no `POST …/archive`.
4. **Hypothesis (product):** `DataTable` `onRowClick → navigate(profile)` races/steals interaction with row action menu (code: `Employees.tsx` + `DataTable.tsx`). Soft-delete **UI+API exist** (`softDeleteEmployee` → `POST …/archive`) but confirm path not closed in this harness without FE event isolation.
5. **Not promoted 🟢** — no archive 2xx evidence.

### TC-049 🟡 — Dialog BH Thêm/Sửa
1. `/hr/insurance` → **Thêm bảo hiểm** → dialog open.
2. Employee typeahead + catalog pick attempts → **Lưu**.
3. Network: **POST** `/api/hrm/insurance-policy-participants` **400** · dialog remains open · F5 list no Sync ERROR.
4. **Honest 🟡** — mutate attempted U65; AC «Lưu + F5 persist» not met (API validation / policy-participant linkage), not false green.

---

## Matrix promote

| Metric | Before | After |
|--------|--------|-------|
| 🟢 | 321 | **322** (+1 TC-041) |
| 🟡 | 43 | **42** (−1) |
| ⬜ | 0 | 0 |
| Regressions | — | **[]** |
| Applied | — | TC-041 🟡→🟢 |
| Skipped | — | TC-025/049 unchanged 🟡 |

See `_tmp-qa-hdsd-matrix-promote-bf-03-mutate-defer-01-result.json`.

---

## Residual

| ID | Item | Sev | Owner | Blocks MUTATE-DEFER close? |
|----|------|-----|-------|----------------------------|
| **R-MUTATE-SOFTDEL-01** | TC-025 — row menu Xóa → profile nav; AlertDialog/archive not reached | P2 | **dev-fe** (stopPropagation / ignore button clicks in `DataTable` onRowClick) + qa retest | **Yes** for full residual close · **No** false green |
| **R-MUTATE-BH-400-01** | TC-049 POST participants **400** after FE Lưu | P2 | **dev-be** / **dev-fe** (insurer/type/employee_id + policy link AC) | Yes for BH 🟢 |
| **C-BF03-MOB-DEPTH-01** | MOB-020..022/030 | P2 | qa-device | Out of slice |
| **must_keep** | TC-06/07/08 | — | — | Preserved |

**QC hint:** Can GWC-close MUTATE-DEFER as **bounded** (041 done · 025/049 documented yellow) **or** dispatch Dev-FE R-MUTATE-SOFTDEL-01 before claiming residual CLOSED.

---

## must_keep regression

| Item | Check |
|------|-------|
| TC-HDSD-06/07/08 | No YCTD/leave mutate in runtime network; HĐ path was disposable create→delete only |
| U65 | zero-seed · no `pnpm seed:*` |
| Prior 🟢 | promote allow-list excludes Ch09 096/097 |

---

## Handoff

**completion_report:** Executed deferred mutate TC-025/041/049 U65 browser-only @ `:5173`. **TC-041 🟢** DELETE contract **200** + F5. **TC-025 🟡** create **201** + delete menu visible but AlertDialog/archive blocked (row→profile). **TC-049 🟡** dialog + POST **400**. Matrix promote 041 only. must_keep YCTD/HĐ/leave spines not re-broken. C-BF03-MUTATE-DEFER-01 **partial** — residual FE soft-delete + BH 400.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: QC-HDSD-BF-03-MUTATE-DEFER-CLOSE-01
from_role: qa | to_role: qc
entry_criteria:
- QA-HDSD-BF-03-MUTATE-DEFER-01 PASS_TO_PM
- evidence docs/qa/evidence/qa-hdsd-bf-03-mutate-defer-01-20260801.md
- runtime + promote JSON · TC-041 🟢 · TC-025/049 🟡 honest
exit_criteria:
- GWC or NO-GO on C-BF03-MUTATE-DEFER-01
- If GWC: list R-MUTATE-SOFTDEL-01 → dev-fe · R-MUTATE-BH-400-01 → dev-be/fe
- must_keep TC-06/07/08 · no false 🟢 on 025/049
ack_status: PASS_TO_PM
```

**Alternate residual_auto_fix (if PM wants close to 🟢 first):**

```text
work_item_id: D-HDSD-BF-03-SOFTDEL-FE-01
from_role: pm | to_role: dev-fe
entry_criteria: R-MUTATE-SOFTDEL-01 — DataTable onRowClick steals row-action menu
exit_criteria: Xóa → AlertDialog → POST /employees/{id}/archive 2xx · QA retest TC-025
allowed_paths: apps/web/hrm/src/components/common/DataTable.tsx · apps/web/hrm/src/pages/Employees.tsx
must_keep: navigate profile on true row click · softDelete archive API
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-bf-03-mutate-defer-01-20260801.md`

**ack_status:** **PASS_TO_PM**
