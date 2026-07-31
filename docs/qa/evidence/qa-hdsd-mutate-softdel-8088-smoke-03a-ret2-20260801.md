# QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET2 — SoftDel Dev8088 retest (EmpForm mount guard)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET2` |
| **program** | `P-HDSD-ECOSYSTEM-03` · `R-8088-FE-SOFTDEL-EMP-FORM-MAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://14.225.217.232:8088` |
| **hrm_embed** | `http://14.225.217.232:8080` (+ portal `/hr/*`) |
| **entry** | `DO-HDSD-MUTATE-SOFTDEL-EMP-FORM-REDEPLOY-03B` READY_FOR_QA · VPS HEAD **`ba2ad5f`** · `docs/ops/evidence/do-hdsd-mutate-softdel-emp-form-redeploy-03b-20260801.md` |
| **prior SoftDel FAIL** | `docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-ret-20260801.md` |
| **prior combined** | `docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-03-20260801.md` — **TC-049 already 🟢** (must_keep; not demoted) |
| **policy** | U65 zero-seed · browser-only · U76 SoftDel HDSD · **no seed** · **no** probe-only PASS · **cấm** demote TC-049 · BH optional spot only |
| **ack_status** | **PASS_TO_PM** |
| **harness** | `scripts/qa/qa-hdsd-bf-03-softdel-ret-01-browser.mjs` · `PORTAL_DEV_URL=http://14.225.217.232:8088` · exit **0** · stamp `SD8N1STG` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-8088-smoke-03a-ret2-runtime.json` |
| **vite_probe** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-8088-smoke-03a-ret2-vite-probe.json` |
| **bh_spot** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-8088-smoke-03a-ret2-bh-spot.json` (optional · must_keep) |
| **screens** | `docs/qa/evidence/screens/hdsd-softdel-8088-smoke-03a-ret2-20260801/` |
| **local greens** | TC-025 on `:5173` — **not demoted** |
| **BH / TC-049** | **must_keep 🟢** — optional spot only; **not** FAIL criterion for this WI |

## Executive verdict

**PASS_TO_PM** — After REDEPLOY-03B (`ba2ad5f` EmpForm mount guard + ViDateField hotfix), SoftDel on Dev8088 is **reachable and green**. Prior blocker `departments.map` / ViDateField resolve **CLOSED**. TC-025 archive **201** + F5 row gone; plain row → profile **PASS**. pageErrors **[]**. TC-049 **not demoted**.

| Exit criterion | Result |
|----------------|--------|
| Employees mounts rows>0 · **no** pageError `departments.map` / ViDateField resolve | 🟢 **PASS** |
| TC-025: ⋯ → Xóa → AlertDialog → POST archive **2xx** → FE + F5 | 🟢 **PASS** · POST **201** · `f5Gone=true` · stamp `SD8N1STG` |
| Plain row click → profile (must_keep) | 🟢 **PASS** · `/hr/employees/4315dade-…` |
| BH/ViMoney must_keep · optional spot · **do not demote TC-049** | 🟢 spot dialog open · pageErrors [] · TC-049 **unchanged 🟢** |
| Probe-only PASS | ❌ not used — browser SoftDel mutate evidence required |

---

## Entry criteria check

| Check | Result |
|-------|--------|
| DO REDEPLOY-03B READY_FOR_QA | ✅ `docs/ops/evidence/do-hdsd-mutate-softdel-emp-form-redeploy-03b-20260801.md` |
| VPS HEAD ≥ `ba2ad5f` | ✅ claimed in ops evidence |
| U65 zero-seed browser | ✅ harness SoftDel + optional BH spot |
| TC-049 not demoted | ✅ must_keep |

### Vite / module body probes (workstation → VPS)

| URL | HTTP | HTML shell? | Body assert | Verdict |
|-----|------|-------------|-------------|---------|
| `:8088/` | **200** | yes | SPA | L0 OK |
| `:8088/hr/src/components/employee/EmployeeFormDialog.tsx` | **200** | **false** | `departmentOptionsFromCatalog(catalogs ?? [])` · **no** live `departments.map((d)` · **no** `ViDateField` import | **PASS** |
| `:8088/hr/src/pages/Employees.tsx` | **200** | **false** | transform OK | **PASS** |
| `:8088/hr/src/lib/hrmMetadataCompany.ts` | **200** | **false** | `resolveHrmCompanySlugForDisplay` present | **PASS** (prior residual still closed) |
| `:8088/hr/src/components/ui/ViMoneyInput.tsx` | **200** | **false** | intact | **PASS** (must_keep BH) |

---

## U76 HDSD coverage inventory (SoftDel scope)

| HDSD menu / màn | Nút / function | Click path | Verdict |
|-----------------|----------------|------------|---------|
| HRM · Nhân viên | List loads rows>0 | Login → `/hr/employees?portal=1&tenantId=xevn&companyId=main` | 🟢 GET employees **200** · no pageError |
| HRM · Nhân viên | Thêm nhân viên (disposable) | CTA → form → Lưu | 🟢 POST employees **201** |
| HRM · Nhân viên | ⋯ → Xóa → AlertDialog → archive | SoftDel TC-025 | 🟢 POST …/archive **201** · F5 gone |
| HRM · Nhân viên | Plain row → hồ sơ | J-HRM-02 must_keep | 🟢 |
| HRM · Bảo hiểm | Open dialog (spot only) | `/hr/insurance` → Thêm bảo hiểm | ⚪ spot OK · TC-049 must_keep (not re-run enroll) |

---

## Browser SoftDel click path (U65 · U76)

1. Login API `POST /api/xbos/auth/login` → **201** · inject portal token · navigate Employees.
2. **Mount:** `#root` live · `GET /api/hrm/employees?company_id=main&page=1&page_size=50` → **200** · **0** pageErrors · **0** consoleErrors.
3. **Row→profile (must_keep first):** click first `td` → `http://14.225.217.232:8088/hr/employees/4315dade-ef5a-4db2-99ee-f724896ffa09` · GET by id **200**.
4. **Create disposable:** stamp `SD8N1STG` · «Thêm nhân viên» → fill → Lưu → POST `/api/hrm/employees` **201**.
5. **SoftDel:** search code → row ⋯ → menu **Xóa** → AlertDialog visible → reason → **Xóa nhân viên** → POST `/api/hrm/employees/29302115-e720-436a-ae03-ba9a12530ca5/archive` **201**.
6. **F5 / navigate list:** search stamp → row **gone** (`f5Gone=true`) · did **not** navigate to profile on Xóa.

**Harness exit:** **0** · TC-HRM-HDSD-025 🟢 · TC-HRM-HDSD-025-ROWCLICK 🟢.

---

## Spec says / code does (Dev8088 @ `ba2ad5f`)

| Layer | Spec / DoD | Observed |
|-------|------------|----------|
| EmpForm mount | `departmentOptionsFromCatalog(catalogs ?? [])` · never bare `departments.map` | **PASS** on VPS module body |
| ViDateField | no resolve fail blocking Employees | **PASS** — Input type=date; no ViDateField import |
| SoftDel FE | ⋯ → Xóa → AlertDialog → POST archive 2xx → F5 | **PASS** archive **201** + F5 |
| Row click | plain td → profile | **PASS** |
| TC-049 | must_keep from SMOKE-03 | **preserved** · spot dialog OK |
| Local SoftDel | already 🟢 on `:5173` | **unchanged** |

**Closed residual:** `R-8088-FE-SOFTDEL-EMP-FORM-MAP-01` on Dev8088 SoftDel path.

---

## BH optional spot (must_keep — not WI fail)

| Check | Result |
|-------|--------|
| `/hr/insurance` load | CTA «Thêm bảo hiểm» visible · rows≥1 |
| Dialog open | `dialogVisible=true` · pageErrors **[]** |
| Enroll / POST participants | **not** re-run (TC-049 already 🟢 on SMOKE-03) |
| Demote TC-049? | **No** |

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| `R-8088-FE-SOFTDEL-EMP-FORM-MAP-01` SoftDel Dev8088 | — | **CLOSED** this WI |
| Ship real `ViDateField` (vi-VN dd/MM/yyyy) | `dev-fe` (later) | Dialog uses `Input type="date"` per DO-03B — not SoftDel blocker |
| QC SoftDel/BH Dev8088 narrow gate | `qc` | After this PASS |

---

## Explicit non-claims

- Did **not** demote TC-049 / ViMoney greens.
- Did **not** re-run full BH enroll mutate (spot only).
- Did **not** claim SoftDel PASS from Vite probe alone.
- Did **not** seed / API-only archive as PASS substitute.
- Did **not** expand into Recruitment / HDSD scope creep.

---

## Handoff

```yaml
work_item_id: QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET2
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-ret2-20260801.md
pm_dispatch_hint: QC SoftDel/BH Dev8088 narrow gate — TC-025 SoftDel 🟢 + TC-049 must_keep 🟢 on :8088 @ ba2ad5f
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-HDSD-MUTATE-SOFTDEL-BH-8088-GATE-01
from_role: pm | to_role: qc
program: P-HDSD-ECOSYSTEM-03 · R-8088-FE-SOFTDEL-EMP-FORM-MAP-01 (CLOSED SoftDel) · TC-049 must_keep
priority: P0
entry_criteria:
- QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET2 PASS_TO_PM
- evidence: docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-ret2-20260801.md
- prior BH green: docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-03-20260801.md (TC-049 🟢)
- VPS HEAD ≥ ba2ad5f · ops: docs/ops/evidence/do-hdsd-mutate-softdel-emp-form-redeploy-03b-20260801.md
scope: narrow SoftDel + BH Dev8088 gate only (no Recruitment)
exit_criteria:
- Audit browser evidence SoftDel TC-025 archive 201 + F5 + row→profile
- Confirm TC-049 not demoted; ViMoney path must_keep
- GO or GO WITH CONDITIONS with residual list; evidence docs/qa/evidence/qc-hdsd-mutate-softdel-bh-8088-gate-01-20260801.md
cấm: seed · demote TC-049 · reopen Recruitment · probe-only GO
```
