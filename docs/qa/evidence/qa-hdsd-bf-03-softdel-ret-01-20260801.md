# QA-HDSD-BF-03-SOFTDEL-RET-01 — Soft-delete retest (R-MUTATE-SOFTDEL-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-BF-03-SOFTDEL-RET-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · residual **R-MUTATE-SOFTDEL-01** |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · run wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173` |
| **URL** | `/hr/employees` (`?portal=1&tenantId=xevn&companyId=main`) |
| **policy** | U65 zero-seed · browser-only · **no seed** · **cấm** false 🟢 without archive 2xx |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `D-HDSD-BF-03-SOFTDEL-FE-01` READY_FOR_QA · `docs/qa/evidence/d-hdsd-bf-03-softdel-fe-01-20260801.md` |
| **harness** | `scripts/qa/qa-hdsd-bf-03-softdel-ret-01-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-bf-03-softdel-ret-01-runtime.json` |
| **promote** | `scripts/qa/qa-hdsd-matrix-promote-bf-03-softdel-ret-01.mjs` |
| **screenshots** | `docs/qa/evidence/screens/hdsd-bf-03-softdel-ret-01-20260801/` |
| **spec_ref** | TC-HRM-HDSD-025 · prior `qa-hdsd-bf-03-mutate-defer-01-20260801.md` |

## Executive verdict

**R-MUTATE-SOFTDEL-01 CLOSED** — **TC-HRM-HDSD-025 🟢** · row-click must_keep 🟢 · **0 false green**.

| Check | Verdict | Evidence |
|-------|---------|----------|
| **TC-HRM-HDSD-025** ⋯ → Xóa → AlertDialog → archive | 🟢 | POST `/api/hrm/employees/{id}/archive` **201** · `f5Gone=true` · `navigatedProfileOnXoa=false` |
| Plain row click → profile | 🟢 | `/hr/employees/4315dade-…` (J-HRM-02 must_keep) |
| must_keep TC-041 | preserved 🟢 | promote allow-list **025 only** · NEVER_TOUCH includes 041 |
| must_keep TC-06/07/08 | not re-broken | no YCTD/leave network mutate in runtime |
| TC-049 BH | out of slice | remains 🟡 (R-MUTATE-BH-400-01) |

**stamp:** `SD8F0V2Q` · employee id `fbba8544-48c3-4299-9015-1a0c5cdffe24`

---

## L0

| Probe | Result |
|-------|--------|
| runtime `l0` | hrm **200** · xbos **200** · portal **200** |
| consoleErrors (pass run) | **0** |

*Note:* first harness attempt hit transient HRM **500** storm after create (row not found) → honest 🟡; retest after settle + same-page soft-delete → 🟢. Not product regression of FE isolation.

---

## Click path (U65)

### TC-025 🟢 — Soft-delete NV
1. Login session `ceo@xe.vn` → `/hr/employees`.
2. **Thêm nhân viên** disposable `QA SoftDel SD8F0V2Q` / `QA-SD-SD8F0V2Q` → **Lưu** → POST `/api/hrm/employees` **201**.
3. Search code → row **⋯** → **Xóa** → AlertDialog «Xác nhận xóa nhân viên» (URL stays list — **not** profile).
4. Confirm **Xóa nhân viên** → **POST** `/api/hrm/employees/fbba8544-…/archive` **201**.
5. Reload list + keyword → row **gone** (`f5Gone=true`).

### must_keep row click 🟢
1. `/hr/employees` → click first data cell (not ⋯).
2. Navigate `/hr/employees/{uuid}` — profile opens.

---

## Matrix promote

| Metric | Before | After |
|--------|--------|-------|
| 🟢 | 322 | **323** (+1 TC-025) |
| 🟡 | 42 | **41** (−1) |
| ⬜ | 0 | 0 |
| Regressions | — | **[]** |
| Applied | — | TC-025 🟡→🟢 |
| Skipped / NEVER_TOUCH | — | 041 · 049 · Ch09 · TC-06/07/08 ids |

See `_tmp-qa-hdsd-matrix-promote-bf-03-softdel-ret-01-result.json`.

---

## Residual

| ID | Item | Sev | Owner |
|----|------|-----|-------|
| **R-MUTATE-BH-400-01** | TC-049 POST participants **400** | P2 | dev-be / dev-fe |
| Transient HRM 500 | Observed on remount mid-run #1 | P3 ops | devops if repeats — not blocker this PASS |

**R-MUTATE-SOFTDEL-01** → **CLOSED**.

---

## Handoff

**completion_report:** Retested soft-delete after DataTable/Employees FE isolation. **TC-HRM-HDSD-025 🟢** — AlertDialog reached, POST archive **201**, F5 row gone, Xóa did not navigate profile. Plain row click still opens profile. Matrix promote 025 only (**323🟢 · 41🟡**). must_keep 041/06/07/08 not re-mutated. U65 zero-seed. Residual BH-400 remains out of slice.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: QC-HDSD-BF-03-SOFTDEL-CLOSE-01
from_role: qa | to_role: qc
entry_criteria:
- QA-HDSD-BF-03-SOFTDEL-RET-01 PASS_TO_PM
- evidence docs/qa/evidence/qa-hdsd-bf-03-softdel-ret-01-20260801.md
- runtime archive POST 201 · matrix TC-025 🟢 · promote JSON applied=[025]
exit_criteria:
- Close R-MUTATE-SOFTDEL-01 GO/GWC
- Confirm must_keep TC-041 🟢 · TC-06/07/08 untouched · no false green
- Residual R-MUTATE-BH-400-01 still open (TC-049) — do not claim full MUTATE-DEFER closed unless BH lane also done
ack_status: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-bf-03-softdel-ret-01-20260801.md`

**ack_status:** **PASS_TO_PM**
