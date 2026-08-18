# QA-HRM-OU-FILTER-01 — HRM Đơn vị thành viên filter (browser U65)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-27 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-OU-FILTER-01` |
| **Env** | Portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos `:28002` · `ceo@xe.vn` |
| **Runner** | `scripts/qa/qa-hrm-ou-filter-01.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-qa-hrm-ou-filter-01-runtime.json` |
| **Screenshots** | `_tmp-qa-hrm-ou-filter-01-dropdown.png` · `_tmp-qa-hrm-ou-filter-01-member.png` · `_tmp-qa-hrm-ou-filter-01-detail.png` |
| **Constraints** | **U65 zero-seed** · **HOLD_DEPLOY** · **NOT** `:8088` · no seed |
| **Overall** | **PASS** |

---

## 0. L0 / stack

| Check | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos/auth/login` | **200** (token for `ceo@xe.vn`) |
| Portal `:5173` | **200** |
| Seed | **not used** |

---

## 1. Sponsor question — answer

| Question | Answer |
|----------|--------|
| Chỉ thấy «Tất cả đơn vị (rollup)» — không chọn được? | **Không.** Select mở được; có **5 ĐVTV** + rollup. |
| Có filter nghiệp vụ theo công ty? | **Có.** Group CEO portal embed: chọn slug → `GET /api/hrm/employees?company_id=<slug>` + banner «Đang xem: …» + cột công ty khớp. |

**Scope note (AC6):** Đổi filter khi đang mở **detail** profile **không** auto-nav sang NV khác — chỉ đổi scope list/API. **PASS expected** (product SoT).

---

## 2. AC matrix

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Click Select — dropdown opens | **PASS** | Trigger `aria-label="Lọc đơn vị thành viên"` · screenshot dropdown |
| 2 | Options = holding + member names (not only «all») | **PASS** | 6 options: rollup + Tập đoàn XeVN + 4 members · `GET /operating-units` **200** `HRM-OPU-200` dataLen=5 |
| 3 | Select member (Visun) → banner updates | **PASS** | «Đang xem: Công ty TNHH Du lịch Visun · Tổng giám đốc tập đoàn» |
| 4 | Employees list scoped · Network companyId/slug match | **PASS** | `GET /api/hrm/employees?company_id=logistics&page=1&page_size=50` **200** · UI «220» · rows company = Visun · codes `LOG-*` |
| 5 | Switch back to rollup → list broader | **PASS** | Banner «Tất cả đơn vị (rollup)» · `company_id=main` · mixed company column |
| 6 | Detail: filter change keeps same employee | **PASS** | URL before/after same id `dbdbece0-6572-401a-b4eb-56781493a75f` |

---

## 3. UF block (browser)

- **Persona / URL / click path:** `ceo@xe.vn` → `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` → filter **Đơn vị thành viên** → open Select → chọn **Công ty TNHH Du lịch Visun** → list → open row detail → đổi filter lại (scope only)
- **Trước mutate:** Rollup banner; mixed company column (Tập đoàn / Visun / X.E VN…)
- **Action:** Select Visun → observe banner + Network employees · Select rollup · Open detail · change filter
- **Network:**
  - `GET /api/hrm/operating-units` → **200** `HRM-OPU-200` · slugs `holding,trsport,logistics,finance,services`
  - After Visun: `GET /api/hrm/employees?company_id=logistics` → **200**
  - After rollup: `GET /api/hrm/employees?company_id=main` → **200**
- **FE sau 2xx:** Banner + list company column match Visun; rollup restores mixed list
- **F5:** N/A (read-only filter scope; sessionStorage `hrm:operating-unit-filter`)
- **Verdict:** 🟢
- **spec_ref:** `HrmOperatingUnitFilter.tsx` · `HrmOperatingUnitFilterContext` · `Employees.tsx` `selectedSlug` → `companyIdForHook` · ADR scope ladder U39 · BM-AC-02

---

## 4. Network snapshots

### 4.1 operating-units

```json
{
  "success": true,
  "code": "HRM-OPU-200",
  "message": "Operating units listed",
  "data": [
    { "operating_slug": "holding", "display_name_vi": "Tập đoàn XeVN", "rollup_order": 1 },
    { "operating_slug": "trsport", "display_name_vi": "Công ty Cổ phần Thương mại và Dịch vụ X.E", "rollup_order": 2 },
    { "operating_slug": "logistics", "display_name_vi": "Công ty TNHH Du lịch Visun", "rollup_order": 3 },
    { "operating_slug": "finance", "display_name_vi": "Công ty TNHH Du lịch X.E Việt Nam", "rollup_order": 4 },
    { "operating_slug": "services", "display_name_vi": "Công ty TNHH X.E Việt Nam", "rollup_order": 5 }
  ]
}
```

### 4.2 employees list (scoped)

| Phase | Request | Status |
|-------|---------|--------|
| Member Visun | `/api/hrm/employees?company_id=logistics&page=1&page_size=50` | **200** |
| Rollup | `/api/hrm/employees?company_id=main&page=1&page_size=50` | **200** |

---

## 5. Screenshots

| File | Shows |
|------|--------|
| `_tmp-qa-hrm-ou-filter-01-dropdown.png` | Dropdown open: rollup + 5 ĐVTV |
| `_tmp-qa-hrm-ou-filter-01-member.png` | Visun selected · banner · list 220 · company col Visun only |
| `_tmp-qa-hrm-ou-filter-01-detail.png` | Detail profile after filter change (same employee URL) |

---

## 6. Residual

| Item | Severity | Owner |
|------|----------|-------|
| None product P0/P1 for this wave | — | — |
| HOLD_DEPLOY / NOT :8088 | process | pm |
| UX: sponsor may confuse default label «Tất cả đơn vị (rollup)» with «non-selectable» — filter **is** interactive | P3 note | pm / ba-docs optional copy |

---

## 7. Handoff

```yaml
work_item_id: QA-HRM-OU-FILTER-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hrm-ou-filter-01-20260727.md
completion_report: |
  Closed browser U65 AC1–6 on :5173 ceo@xe.vn.
  OU filter selectable; operating-units 200 (5 units); Visun → company_id=logistics + banner;
  rollup → company_id=main; detail filter keeps same employee (expected).
  Sponsor: YES can select; YES business filter-by-company exists (Group CEO embed).
next_owner: pm
next_dispatch_prompt: |
  work_item_id: PM-INTAKE-QA-HRM-OU-FILTER-01
  from_role: qa
  to_role: pm
  Intake PASS_TO_PM QA-HRM-OU-FILTER-01 — no Dev FAIL residual.
  Optional: brief sponsor that «Tất cả đơn vị (rollup)» is the default option, not a dead control;
  click opens holding + 4 ĐVTV; selecting Visun scopes Employees to company_id=logistics.
  Do NOT dispatch :8088; HOLD_DEPLOY remains.
```

---

## Command table

| # | Command | Result |
|---|---------|--------|
| 1 | Stack probe `:5173` / `:28001/api/hrm` | **200** |
| 2 | `node scripts/qa/qa-hrm-ou-filter-01.mjs` | exit **0** · OVERALL **PASS** · AC1–6 PASS |

## Journey L2.5

| J-* | Verdict | Note |
|-----|---------|------|
| Filter scope (list) | **PASS** | OU → employees `company_id` slug |
| List → detail keep | **PASS** | Same employee id after filter change |
