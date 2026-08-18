# P1-HRM-MENU-QA-CONTRACTS — Hợp đồng exclusive menu (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-CONTRACTS` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **env** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **URL** | `/command-center/hrm/contracts` |
| **spec_ref** | P-CC-04 · J-HRM-03 · UF-HRM-02 · `HRM_MENU_DATA_LINKAGE_MATRIX` §2.1 contracts |
| **primary API** | `GET /api/hrm/contracts-insurance/contracts` |
| **U65** | zero-seed · browser-only (session Bearer read/PATCH only; **no** `pnpm seed:*`) |
| **ack_status** | **FAIL_TO_PM** |

---

## Verdict

**FAIL_TO_PM** — List load + J-HRM-03 detail + UF mutate PATCH **passed** on first pass; **F5 / reload blocked by `RATE-429`** leaving UI empty («Không có dữ liệu» + toast «Too many requests»). Contracts menu full-pagination storm (≈12× contracts + ≈12× employees + settings-catalogs ×2) is a **P1 perf/reliability** residual for NFR/scale lane.

| Gate | Result | Notes |
|------|--------|-------|
| L0 CC shell + embed iframe | **PASS** | iframe `/hr/contracts?portal=1&…&companyId=main` |
| L2 list data | **PASS** (pre-429) | chip **Tất cả 1104** · «Hiển thị 1 - 10 trong số 1104 bản ghi» |
| Console P0 | **PASS** (capture window) | 0 `console.error`; fiber keys **10/10 unique** on page |
| Network primary API | **PASS** then **FAIL** | First load `HRM-CON-200`; post-F5 **`RATE-429`** |
| L2.5 J-HRM-03 detail | **PASS** | Eye «Chi tiết hợp đồng» → dialog TCN-0954-HD; `GET …/contracts/{id}` **200** `HRM-CON-200` (~2408 ms) |
| UF-HRM-02 mutate | **PARTIAL** | Pencil → «Chỉnh sửa hợp đồng» → **Cập nhật** → `PATCH` **200** + toast «Cập nhật hợp đồng thành công»; **F5 FAIL** (429 empty) |
| Type filter chips | **P2 residual** | HĐ 1 năm/3 năm/… all show **0** while Tất cả=1104 |

---

## Environment / session

| Item | Value |
|------|-------|
| Portal | `http://14.225.217.232:8088/command-center/hrm/contracts` |
| Direct HRM (L2.5) | `http://14.225.217.232:8088/hr/contracts?portal=1&tenantId=xevn&companyId=main` |
| Auth | `xevn.portal.accessToken` present (JWT) |
| U65 | no seed |

---

## L0 / L2 — list load (P-CC-04)

### Click path
1. Login `ceo@xe.vn`
2. Navigate `/command-center/hrm/contracts`
3. Observe embed iframe contracts list

### FE after load
- Labels: Mã HĐ · Tên nhân sự · Phòng ban · Loại hợp đồng · Ngày hiệu lực · Ngày hết hạn · Tình trạng **Có hiệu lực**
- Chip **Tất cả 1104**; pagination **1–10 / 1104**; page size 10 · 111 pages
- Sample rows: `HLD-0006-HD` (Huỳnh Văn An — name polluted with UF03/QA tags), `TCN-0954-HD` (Đặng Xuân Hà)
- No ERROR banner / no `54321` / no scope **409** on first load

### Network (iframe Performance resource timing — first load)

| Endpoint | Observed | Duration (ms) |
|----------|----------|---------------|
| `GET …/contracts-insurance/contracts?company_id=main&page=1..12&page_size=100` | **2xx** (resource timing) | ~1124–1603 / page |
| `GET …/employees?company_id=main&page=1..12&page_size=100` | **2xx** | ~406–1300 / page |
| `GET …/settings-catalogs` | **2xx** ×**2** | ~1155 / ~2375 |

**P1:** Single menu open ≈ **24+ list fetches** (full contracts + full employees pagination) — trips rate limit under concurrent QA / reload.

### Session probe (Bearer, pre-429)
- `GET /api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=100` → **200** `HRM-CON-200` · ~1541 ms · page 100/100 unique ids

---

## Console / fiber

| Check | Result |
|-------|--------|
| `console.error` during post-load capture | **0** |
| Visible table React fiber keys | **10 rows / 10 unique** (UUID keys; not contract_code) |
| Duplicate `contract_code` display | Many `HLD-0006-HD` rows — **data** density issue; keys still unique |

---

## L2.5 — J-HRM-03 (contract detail)

| Step | Result |
|------|--------|
| Click path | List → Eye **Chi tiết hợp đồng** on `TCN-0954-HD` / Đặng Xuân Hà |
| Dialog | Heading **Chi tiết hợp đồng** · Mã `TCN-0954-HD` · NV Đặng Xuân Hà · Phòng ban Vận hành · `fixed_term` · 01/06/2026–31/05/2027 · **Có hiệu lực** |
| Final URL | stays `/hr/contracts?portal=1&…` (modal, not route change) |
| Detail API | `GET /api/hrm/contracts-insurance/contracts/22e47c48-948f-4885-a8b5-198ead06b770?company_id=main` → **200** `HRM-CON-200` · ~2408 ms |
| Console | no 404/409 on detail |

**Verdict J-HRM-03:** 🟢 **PASS**

---

## UF-HRM-02 — sửa HĐ → Lưu → F5

### Mutate (PASS)
| Step | Evidence |
|------|----------|
| Action | Pencil on `TCN-0954-HD` → dialog **Chỉnh sửa hợp đồng** |
| Fields visible | Mã hợp đồng · Tên nhân sự (other fields gated by `hasContractField` — only these two rendered) |
| Save | **Cập nhật** (no field change — save-path exercise) |
| Network | `PATCH /api/hrm/contracts-insurance/contracts/22e47c48-948f-4885-a8b5-198ead06b770` → **200** (~856 ms) |
| FE after 2xx | Toast **«Cập nhật hợp đồng thành công»**; list refetch GET page1 **200** |
| Dialog close | **P2:** dialog **remained open** after success (code intends `handleCloseDialog`) |

### F5 (FAIL)
| Step | Evidence |
|------|----------|
| Action | `location.reload()` after successful PATCH |
| FE | Toast **«Too many requests»** · chip Tất cả **0** · «Không có dữ liệu» · «Hiển thị 0 - 0 trong số 0 bản ghi» |
| API | `GET …/contracts?…page_size=20` → **429** `RATE-429` «Too many requests» (reproduced after 45s wait and after re-login + reload) |
| Persistence of mutate | **Not verifiable** under 429 (PATCH had already succeeded) |

**Verdict UF-HRM-02:** 🔴 **FAIL** on F5 AC (rate limit / empty UI)

---

## Residuals (PM dispatch)

| ID | Severity | Owner | Description |
|----|----------|-------|-------------|
| **D-HRM-CON-RATE-01** | **P1** (user-visible empty after F5) | `dev-be` (+ `devops` rate-limit config) | `RATE-429` on contracts list after full-menu pagination / reload; UI shows empty without retry |
| **D-HRM-CON-PERF-01** | **P1** | `dev-fe` (+ SA NFR `P1-HRM-NFR-1000-SA`) | Contracts page fetches **all** contract pages + **all** employee pages + catalogs ×2 on mount |
| **D-HRM-CON-FILTER-01** | P2 | `dev-fe` | Type chips HĐ 1 năm/3 năm/… all **0** while Tất cả=1104 |
| **D-HRM-CON-DIALOG-01** | P2 | `dev-fe` | Edit dialog stays open after successful PATCH |
| **D-HRM-CON-NAME-01** | P2 data | `dev-be` / data hygiene | Employee display name polluted with UF03/QA mutation suffixes (Huỳnh Văn An) |

---

## Traceability

| Spec | Status |
|------|--------|
| P-CC-04 | List load PASS pre-429; reload FAIL 429 |
| J-HRM-03 | **PASS** |
| UF-HRM-02 | Mutate PATCH PASS · **F5 FAIL** |
| Matrix §2.1 contracts | API + FK path exercised; density chips mismatch noted |

---

## Handoff packet

```yaml
work_item_id: P1-HRM-MENU-QA-CONTRACTS
from_role: qa
to_role: pm
entry_criteria: exclusive menu Hợp đồng on :8088; U65 browser; P-CC-04 / J-HRM-03 / UF-HRM-02
exit_criteria: evidence with L0/L2/console/network/L2.5/mutate; ack FAIL or PASS
evidence_path: docs/qa/evidence/p1-hrm-menu-contracts-20260717.md
ack_status: FAIL_TO_PM
needed_by: same-day program wave-1
completion_report: |
  Closed browser QA for contracts menu: first-load L2 1104 rows PASS; J-HRM-03 detail PASS;
  UF mutate PATCH 200 + success toast PASS; F5 blocked by RATE-429 empty UI FAIL.
  Residual P1: full pagination storm + rate limit; P2 filter chips / dialog close / name pollution.
next_owner: pm
next_dispatch_prompt: |
  PM: FAIL_TO_PM P1-HRM-MENU-QA-CONTRACTS — dispatch in parallel:
  1) Task dev-fe P1-HRM-CON-PERF-01 — stop full N-page contracts+employees fetch on mount;
     server-side pagination / RQ page-only; evidence docs/qa/evidence/p1-hrm-menu-contracts-20260717.md
  2) Task dev-be P1-HRM-CON-RATE-01 — review RATE-429 window for HRM list under ceo@xe.vn;
     UX should not render permanent empty on 429 (retry/backoff toast)
  3) After READY_FOR_QA → Task qa retest F5 UF-HRM-02 + J-HRM-03 on :8088
pm_dispatch_hint: P1-HRM-CON-PERF-01 + P1-HRM-CON-RATE-01 (P1)
```

---

*QA Lead · 2026-07-17 · U65 browser-only*
