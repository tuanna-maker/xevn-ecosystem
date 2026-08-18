# P1-HRM-MENU-QA-INSURANCE — Bảo hiểm menu QA (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-INSURANCE` |
| **from_role** | qa |
| **to_role** | pm |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **date** | 2026-07-17 |
| **env** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · BOD |
| **spec_ref** | P-CC-05 · J-HRM-04 · UF-HRM-04 |
| **U65** | zero-seed · browser login → menu Bảo hiểm → Network/console → employee drill |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GWC → empty-mask CLOSED 2026-07-17** (see `gwc-hrm-ins-empty-mask-retest-20260717.md`); happy path + J-HRM-04 still 🟢 |

---

## Verdict summary

| Gate | Result | Notes |
|------|--------|-------|
| L0 tab load / no 409 / no 54321 / no Sync ERROR banner | **PASS** | First load + J-HRM-04 profile |
| L2 data present (happy path) | **PASS** | Tab **Tất cả = 1043**; table rows + summary money |
| L2 empty vs error masking | **PASS (retest)** | Induced 429 → **Lỗi tải dữ liệu** + **Thử lại** + **Không tải được** / tabs **—** — see `gwc-hrm-ins-empty-mask-retest-20260717.md` |
| Console P0 (dup key / red app error on happy path) | **PASS** | No Sync ERROR; no duplicate-key observed on insurance table |
| Network primary API 2xx (happy path) | **PASS** | `GET …/contracts-insurance/insurance` **200** `HRM-CON-200` |
| Network perf | **P1 residual** | **11** sequential pages `page_size=100`; several pages **>3s** (max ~3.2s first wave; later wave up to **~10s** under load) |
| L2.5 **J-HRM-04** employee link | **PASS** | Click **Trần Quốc Chi** → profile **200**; no 404/409 |
| **R-FID-01** list API gap | **CLOSED on :8088 runtime** | Dedicated list `GET /contracts-insurance/insurance` returns **total=1043** (matrix text still says gap — docs stale) |

**Overall:** Happy path + J-HRM-04 **PASS**; empty-mask **CLOSED** (`gwc-hrm-ins-empty-mask-retest-20260717.md`). Optional P2: sequential page fan-out under load / DOC-R-FID-01-STALE.

---

## Environment / click path

1. Login `ceo@xe.vn` → Command Center  
2. HRM sidebar → **Bảo hiểm**  
3. URL: `http://14.225.217.232:8088/command-center/hrm/insurance`  
4. Iframe: `/hr/insurance?portal=1&tenantId=xevn&companyId=main&…`  
5. J-HRM-04: click employee name in table → `/hr/employees/{id}?portal=1&…&companyId=main`

Screenshots (agent capture):

- Profile drill: `page-2026-07-17T01-58-58-845Z.png` (Trần Quốc Chi / VTH-0402 / COO)  
- Empty-mask state after 429: `page-2026-07-17T02-02-22-261Z.png` (summary `-`, tabs 0)

---

## L0 / L2 — first successful load (happy path)

| Check | Observation |
|-------|-------------|
| Banner ERROR / Sync ERROR | **None** |
| Scope 409 | **None** |
| `:54321` | **None** |
| Summary cards | **Tổng BHXH** `1.440.000 ₫` (and BHYT/BHTN populated — not `-`) |
| Tab counts | **Tất cả 1043** |
| Expiring alert | **97 khẩn cấp** (BHYT ≤30 ngày) |
| Table | 10 rows/page; employee name links present |
| Footer | Pagination after load (not stuck on «Đang tải…») |

### Transient load UX (not FAIL)

While waterfall pagination runs (~9s), UI briefly shows tabs **0** and summary **`-`** with «Đang tải…». After settle → **1043**. Distinguish from post-error empty (below).

---

## Network (happy path)

| Endpoint | Status | Timing / size notes |
|----------|--------|---------------------|
| `GET /api/hrm/contracts-insurance/insurance?company_id=main&page=1..11&page_size=100` | **200** | **11** calls; ~67KB/page; durations ~1.3–3.2s (first wave) |
| `GET /api/hrm/contracts-insurance/insurance/expiring?company_id=main&days=30` | **200** | **97** rows (API probe) |
| `GET /api/hrm/employees?company_id=main&page_size=100` | **200** | Companion fetch |
| `GET /api/hrm/insurance-policy-participants?company_id=main` | **200** | Secondary (~4.6KB) |
| `GET /api/hrm/operating-units` | **200** | Scope bar |
| `GET /api/hrm/company-subscription?company_id=main` | **200** | |

### API probe (Bearer, read-only, U65-safe)

| Path | HTTP | Code | Payload |
|------|------|------|---------|
| `/api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=50` | **200** | `HRM-CON-200` | **total=1043**, sample `employee_id` present |
| `/api/hrm/contracts-insurance/insurance/expiring?company_id=main&days=90` | **200** | `HRM-CON-200` | **124** items |
| `/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` | total **1104** |
| `/api/hrm/employees/{id}?company_id=main` (J-HRM-04) | **200** | `HRM-EMP-200` | `Trần Quốc Chi` |

**R-FID-01 note:** Program/dispatch still cites «list API gap / contracts proxy + expiring». On Dev8088 **2026-07-17**, full list route **exists and is used by FE** (`useInsuranceList` → `contracts-insurance/insurance`). Treat matrix **R-FID-01** as **runtime CLOSED**; BA/docs refresh recommended.

---

## Empty vs error masking (P1) — **FAIL axis**

| Step | Result |
|------|--------|
| Reload / concurrent menu QA load | Primary insurance + employees + participants returned **`429 RATE-429`** |
| FE after 429 | Tabs **0**, summary **`-`**, table **«Không có dữ liệu»**, footer **0–0 / 0** |
| Error banner / toast | **Absent** |
| Console `error` (hooked) | **None** captured for 429 |
| True empty vs fail | **Masked** — looks like empty dataset though API failed |

**Defect:** `D-HRM-INS-EMPTY-MASK-01` (P1)  
**Owner:** `dev-fe` (surface error / retry on non-2xx; do not coerce fail → empty)  
**Related:** concurrent full-menu QA may amplify **RATE-429** — DevOps/NFR rate-limit + FE coalescing also in scope of `P1-HRM-NFR-1000-SA`.

---

## Console

| Class | Finding |
|-------|---------|
| P0 duplicate React key | **Not observed** on insurance list (happy path) |
| P0 Sync ERROR / connection refused | **None** |
| Noise | Vite/HRM HMR script loads in embed (dev) — non-gating |
| 429 path | Silent — no console.error → worsens empty-mask |

---

## L2.5 J-HRM-04 — employee link drill

| Step | Result |
|------|--------|
| Click path | Insurance table → name **Trần Quốc Chi** |
| Iframe URL | `/hr/employees/177f9058-631b-43c1-860c-a73f9f705bb0?portal=1&tenantId=xevn&companyId=main` |
| Parent URL | Remained `/command-center/hrm/insurance` (sidebar **Bảo hiểm** active) |
| Profile UI | **VTH-0402**, COO, **Đang làm việc**, email `uat.nv0402@xe.vn` |
| `GET /api/hrm/employees/{id}?company_id=main` | **200** `HRM-EMP-200` (~1.1s / remount ~3.8s) |
| 404 / 409 / Sync ERROR | **None** |
| **Verdict** | **PASS** |

---

## UF-HRM-04 / matrix

| ID | Prior Dev8088 | This run |
|----|---------------|----------|
| UF-HRM-04 | 🟢 R4 (insurance **5** records — stale count) | Drill **PASS**; list density now **1043** @ main |
| P-CC-05 | PASS (historical) | Happy path **PASS**; GWC on masking |
| J-HRM-04 | PASS | **PASS** reconfirmed |

Recommend matrix note update: UF-HRM-04 evidence → this file; count **1043** not **5**.

---

## Residuals / defects

| ID | Sev | Owner | Description |
|----|-----|-------|-------------|
| **D-HRM-INS-EMPTY-MASK-01** | P1 | — | **CLOSED** 2026-07-17 retest — ERROR+Thử lại on induced 429 |
| **D-HRM-INS-PERF-01** | P2 | SA NFR (optional) | Progressive page-1 paint **PASS** on retest; residual = 11 pages still sequential under load |
| **DOC-R-FID-01-STALE** | P2 | ba-data / pm | Linkage matrix still claims no `GET /insurance` list — runtime **CLOSED** |
| RATE-429 under parallel menu QA | P2 | devops / NFR | Shared `:8088` rate limit; amplifies empty-mask |

---

## Handoff packet

- **work_item_id:** `P1-HRM-MENU-QA-INSURANCE`
- **from_role:** qa
- **to_role:** pm
- **entry_criteria:** Exclusive Bảo hiểm menu on `:8088`; persona Group CEO; U65 browser
- **exit_criteria:** L0/L2/console/Network + J-HRM-04 evidence filed; empty-vs-error noted
- **evidence_path:** `docs/qa/evidence/p1-hrm-menu-insurance-20260717.md`
- **ack_status:** **PASS_TO_PM**
- **needed_by:** Same-day menu program wave-1 close + FE residual dispatch
- **completion_report:** Exclusive insurance QA + empty-mask retest. Happy path **P-CC-05 PASS** (1043). **J-HRM-04 PASS**. **D-HRM-INS-EMPTY-MASK-01 CLOSED**. Progressive paint PASS. Optional P2: page fan-out under load; DOC-R-FID-01-STALE.
- **next_owner:** pm
- **next_dispatch_prompt:** |
  Close GWC-HRM-INS-EMPTY-MASK-01 on QC ledger. Optional BA refresh R-FID-01 docs. Do not re-open empty-mask without new FAIL evidence.
- **pm_dispatch_hint:** GWC-HRM-INS-EMPTY-MASK-01 CLOSED — see gwc-hrm-ins-empty-mask-retest-20260717.md
- **retest_ref:** `docs/qa/evidence/gwc-hrm-ins-empty-mask-retest-20260717.md` (2026-07-17)

---

**UF-HRM-04 evidence block (U63 sample)**

### UF-HRM-04 — Bảo hiểm → link NV
- Persona / URL / click path: `ceo@xe.vn` → `/command-center/hrm/insurance` → click **Trần Quốc Chi**
- Trước: list **1043** (happy path)
- Action: employee name link
- Network: `GET /api/hrm/employees/177f9058-…?company_id=main` → **200** `HRM-EMP-200`
- FE sau 2xx: profile header VTH-0402 / COO / Đang làm việc
- F5: not required for read drill
- Verdict: 🟢 (drill) · menu overall **GWC** (empty-mask P1)
- spec_ref: P-CC-05 · J-HRM-04 · UF-HRM-04
