# GWC-HRM-INS-EMPTY-MASK-01 — QA retest (Bảo hiểm)

| Field | Value |
|-------|-------|
| **work_item_id** | `GWC-HRM-INS-EMPTY-MASK-RETEST` (closes `GWC-HRM-INS-EMPTY-MASK-01` / `D-HRM-INS-EMPTY-MASK-01`) |
| **also_verified** | `D-HRM-INS-PERF-01` progressive page-1 paint · **J-HRM-04** |
| **from_role** | qa |
| **to_role** | pm |
| **parent** | `docs/qa/evidence/p1-hrm-menu-insurance-20260717.md` |
| **dev handoff** | `docs/qa/evidence/d-hrm-ins-empty-mask-20260717.md` |
| **date** | 2026-07-17 |
| **env** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` · BOD · `companyId=main` |
| **spec_ref** | P-CC-05 · UF-HRM-04 · J-HRM-04 |
| **U65** | zero-seed · browser · no seed; 429 path via **iframe fetch interceptor** (client-side) after happy path |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** — empty-mask CLOSED; happy path + J-HRM-04 still 🟢 |

---

## Verdict matrix

| AC | Result | Evidence |
|----|--------|----------|
| Happy path list paints with data | **PASS** | Tab **Tất cả = 1043**; BHYT expiring alert; employee name links |
| Progressive first paint (`D-HRM-INS-PERF-01`) | **PASS** | page=1 then pages 2..11 sequential; UI showed **«Đang tải thêm bản ghi bảo hiểm…»** while total already 1043 |
| Non-2xx → ERROR + **Thử lại** (never silent empty) | **PASS** | Induced **429** on `GET …/contracts-insurance/insurance?*` → banner **«Lỗi tải dữ liệu»** + RATE-429 copy + **Thử lại**; summary **«Không tải được»**; tabs **—** (not success **0**); table error cell ≠ «Không có dữ liệu» alone |
| Silent empty `0` / `-` without banner | **FAIL closed** | `hasSilentEmpty=false` |
| **J-HRM-04** list → employee profile | **PASS** | Click **Trần Quốc Chi** → profile VTH-0402 / COO; `GET /api/hrm/employees/{id}?company_id=main` present; no 404/409 |

---

## Environment / click path

1. Portal `/command-center/hrm/insurance`  
2. Iframe `/hr/insurance?portal=1&tenantId=xevn&companyId=main`  
3. Happy path observe Network + UI settle  
4. Induce 429: replace iframe `fetch` for primary insurance list → return `429 RATE-429` → remount iframe  
5. Assert banner/retry/summary labels  
6. Clean iframe reload → happy path restore  
7. J-HRM-04: click **Trần Quốc Chi** → `/command-center/hrm/employees/177f9058-…`

Screenshots:

- 429 ERROR path: `docs/qa/evidence/gwc-hrm-ins-empty-mask-retest-429-20260717.png`
- J-HRM-04 profile: `docs/qa/evidence/gwc-hrm-ins-j-hrm-04-retest-20260717.png`

---

## Happy path Network (excerpt)

| Call | Notes |
|------|-------|
| `GET /api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=100` | ~819ms — first paint driver |
| `…page=2..11` | Sequential append (~700–770ms each) |
| Expiring / companions | Present; no 409/54321 |

UI after settle: **1043** total; summary money populated (not `-`); no ERROR banner.

---

## Empty-mask retest (induced 429)

| Signal | Observed |
|--------|----------|
| Intercepted primary insurance GETs | **1+** (force 429 body `RATE-429`) |
| Banner | **Lỗi tải dữ liệu** |
| Copy | «Hệ thống đang giới hạn tần suất truy cập (429). … Thử lại.» |
| Button | **Thử lại** visible |
| Summary cards | **Không tải được** (× BHXH/BHYT/BHTN/Tổng) |
| Tabs | **—** (not painted as success empty **0**) |
| Table | Error message + **Thử lại** — **not** alone «Không có dữ liệu» |
| `hasSilentEmpty` | **false** |

**Note:** Pagination footer may still read `0 - 0 / 0` while error banner is up — acceptable because fail state is explicit (not silent success-empty). Tabs use **—** / summary **Không tải được** per FE fix.

---

## J-HRM-04

| Check | Result |
|-------|--------|
| Employee | Trần Quốc Chi / VTH-0402 / COO |
| Detail API | `GET /api/hrm/employees/177f9058-631b-43c1-860c-a73f9f705bb0?company_id=main` |
| Work timeline | companion GET present |
| 404/409 | **None** |
| Portal URL after drill | `/command-center/hrm/employees/177f9058-…` |

---

## Disposition vs QC condition

| ID | Prior | After this retest |
|----|-------|-------------------|
| **GWC-HRM-INS-EMPTY-MASK-01** | OPEN (dev-fe) | **CLOSED — PASS** |
| **D-HRM-INS-EMPTY-MASK-01** | READY_FOR_QA | **CLOSED** |
| **D-HRM-INS-PERF-01** | folded | **PASS** on browser (progressive + «Đang tải thêm…») |
| Parent insurance menu | GWC | Happy + empty-mask → promote empty-mask condition closed; waterfall perf residual optional P2 only if pages still >3s under load |

---

## Handoff

- **completion_report:** Insurance empty-mask retest **PASS**. Induced 429 shows ERROR+Thử lại+Không tải được/— (never silent empty). Happy path 1043 + progressive paint PASS. **J-HRM-04** Trần Quốc Chi profile PASS. Close GWC-HRM-INS-EMPTY-MASK-01.
- **next_owner:** pm (→ qc re-gate optional)
- **ack_status:** PASS_TO_PM
- **evidence_path:** `docs/qa/evidence/gwc-hrm-ins-empty-mask-retest-20260717.md` (+ tools sibling `p1-hrm-menu-tools_equipment-20260717.md`)
- **next_dispatch_prompt:** |
  Close GWC-HRM-INS-EMPTY-MASK-01 / D-HRM-INS-EMPTY-MASK-01 from QC conditions. Update insurance parent evidence / matrix note. Optional: Task qc re-gate full-menu with Tools ⚪ evidence + insurance empty-mask CLOSED. Residual Tools stub toast is P2 only.
- **pm_dispatch_hint:** GWC-HRM-INS-EMPTY-MASK-01 CLOSED — qc can drop condition
