# QA-HRM-W2A-STANDALONE-RBAC-01 — W2a standalone RBAC retest (post D-HRM-W2A-STANDALONE-RBAC-01)

**work_item_id:** `QA-HRM-W2A-STANDALONE-RBAC-01`  
**from_role:** qa → pm  
**date:** 2026-07-31  
**persona:** `ceo@xe.vn` / `Xevn@2026`  
**policy:** U65 zero-seed · browser-only (no seed)  
**dev handoff:** `docs/qa/evidence/d-hrm-w2a-standalone-rbac-01-20260731.md`  
**prior residual:** R-W2A-RBAC-01 from `docs/qa/evidence/qa-hdsd-w2a-scope-parity-01-r2-20260731.md`  
**spec_ref:** ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · J-HRM-01

---

## L0 stack

| Gate | Result | Notes |
|------|--------|-------|
| `pnpm run qc:dev-stack` | ✅ hrm 200 · xbos 200 · portal 200 | Windows UV abort exit 3221226505 after ✓ lines (known env class) |
| `pnpm run qc:fe-be-health` | ✅ exit 0 ALL PASS | Corroborating gate |

---

## Browser harness — W2a `:8080/hr/*` + W2b embed `:5173`

- Script: `scripts/qa/qa-hdsd-w2a-scope-parity-01.mjs` (RBAC slice — employees route + J-HRM-01 + W2b spot)
- Runtime: `docs/qa/evidence/_tmp-qa-hdsd-w2a-scope-parity-runtime.json` (QA-HRM-W2A run 2026-07-31)
- Screens: `docs/qa/evidence/screens/qa-hdsd-w2a-scope-parity-20260730/` (`w2a-employees-list`, `w2a-j-hrm-01-detail`, `w2b-employees-embed`)

### UF — W2a standalone employees list (R-W2A-RBAC-01 closure)

| Step | Result |
|------|--------|
| Click path | `/hr/login` → **Đăng nhập** → `/hr/employees` |
| POST `/api/hrm/auth/mobile/login` | **201** |
| FE storage | `xevn.portal.accessToken` ✅ · `hrm_current_company_id=main` ✅ |
| GET `/api/hrm/employees?company_id=main` | **200** (Network on route) |
| RBAC shell | **No** «Không có quyền truy cập» — sidebar + employee table render |
| Scope banner | **None** · `scope409Count=0` |
| Row data | ≥1 row (e.g. VTH-0007A Phan Văn An) |

**FE sau 2xx (SRS):** List table visible with employee rows; sync badge «Đã kết nối»; no permission-denied overlay.

### J-HRM-01 — list → detail (L2.5)

| Field | Value |
|-------|-------|
| Click path | `/hr/employees` → click first data row |
| Row clicked | VTH-0007A · Phan Văn An · `uat.nv0007@xe.vn` |
| GET detail | **200** `/api/hrm/employees/b06422c0-f640-45d1-8cab-cb4a609848d6?company_id=main` |
| GET work-timeline | **200** `/api/hrm/employees/.../work-timeline?company_id=main` |
| Final URL | `http://127.0.0.1:8080/hr/employees/b06422c0-f640-45d1-8cab-cb4a609848d6` |
| Scope banner on detail | **false** |
| Verdict | 🟢 **PASS** |

### W2b regression — embed `:5173`

| Signal | W2a | W2b embed |
|--------|-----|-----------|
| GET employees | **200** | **200** |
| scope409Count | **0** | **0** |
| Scope/sync banner | none | none |
| Parity vs prior 🟢 | unchanged | unchanged |

URL: `http://127.0.0.1:5173/command-center/hrm/employees?portal=1&tenantId=xevn&companyId=main`

---

## Verdict matrix

| Criterion | R2 (prior) | This run |
|-----------|------------|----------|
| Standalone list renders (no RBAC shell) | ❌ «Không có quyền truy cập» | ✅ **PASS** |
| GET employees 200 on `/hr/employees` | ⚪ not fired (RBAC block) | ✅ **200** |
| J-HRM-01 list→detail GET 2xx | 🟡 NO_ROWS | ✅ **🟢 PASS** |
| W2b embed employees unchanged | ✅ 200 | ✅ **200** parity |
| Zero-seed / no DB mutate | ✅ | ✅ |

**Console note:** Pre-login 401 on catalog-sync + static asset 404s — non-blocking; no 409/54321/500 on business APIs.

---

## Residual closure

| ID | Prior | This run |
|----|-------|----------|
| **R-W2A-RBAC-01** | P1 open — PermissionRoute blocked standalone JWT | **CLOSED** ✅ |
| R-HARNESS-RBAC | P2 optional harness enhancement | Open (non-blocking) |

Fine-grained Supabase permission stub deferred per dev handoff — JWT session bypass matches W2b embed policy.

---

## ack_status

**PASS_TO_PM**

W2a standalone RBAC fix verified: `ceo@xe.vn` on `:8080/hr/employees` renders employee list with GET **200**; no permission-denied shell; **J-HRM-01** list→detail **200**; W2b embed **unchanged 🟢**.

---

## completion_report

- **Closed:** QA-HRM-W2A-STANDALONE-RBAC-01 — L0 gates; browser U65 mobile login; employees list + Network 200; J-HRM-01 detail 200; W2b parity 200; residual **R-W2A-RBAC-01** closed.
- **Open:** R-HARNESS-RBAC (P2 optional — harness RBAC-denial assertion helper); fine-grained HRM permissions when BE RBAC API wired (deferred).

## next_owner

`pm` → optional `qc` slice audit or promote journey map W2a standalone note

## next_dispatch_prompt

```text
work_item_id: QC-HRM-W2A-RBAC-01
from_role: pm | to_role: qc
entry_criteria: QA-HRM-W2A-STANDALONE-RBAC-01 PASS_TO_PM — docs/qa/evidence/qa-hrm-w2a-standalone-rbac-01-20260731.md; R-W2A-RBAC-01 closed; J-HRM-01 🟢 on :8080/hr/employees
exit_criteria: Audit evidence L0–L2.5 for W2a RBAC slice; confirm no regression vs W2b embed 🟢; GO/GWC or residual list; evidence docs/qa/evidence/qc-hrm-w2a-standalone-rbac-01-YYYYMMDD.md
persona: ceo@xe.vn / Xevn@2026
J-*: J-HRM-01
cấm: seed
```
