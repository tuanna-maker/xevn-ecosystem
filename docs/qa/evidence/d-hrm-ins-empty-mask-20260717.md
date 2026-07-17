# D-HRM-INS-EMPTY-MASK-01 (+ D-HRM-INS-PERF-01 · D-P1-HRM-INTSVC-429-SILENT-EMPTY-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-HRM-INS-EMPTY-MASK-01` |
| **also_closed** | `D-HRM-INS-PERF-01` · `D-P1-HRM-INTSVC-429-SILENT-EMPTY-01` (same empty-mask pattern) |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-07-17 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed · no seed in this wave |
| **spec_ref** | P-CC-05 · UF-HRM-04 · J-HRM-04 · HRM-SV-02 · QA GWC `p1-hrm-menu-insurance-20260717.md` · `p1-hrm-menu-internal_services-20260717.md` |

---

## Defects addressed

| ID | Symptom (QA) | Fix |
|----|--------------|-----|
| **D-HRM-INS-EMPTY-MASK-01** | RATE-429 → «Không có dữ liệu» / 0 / `-` without banner | `fetchError` + `HrmListLoadBanner` + retry; table/summary never coerce fail → empty |
| **D-HRM-INS-PERF-01** | 11× sequential `page_size=100` before first paint | Progressive: `listInsuranceRecords` page 1 → paint → append remaining |
| **D-P1-HRM-INTSVC-429-SILENT-EMPTY-01** | F5 under 429 → stats **0** silent on Dịch vụ nội bộ | Same shared helper + banner/retry on `InternalServices` / `useServiceRequests` |

---

## Shared helper (insurance + intsvc)

- `apps/web/hrm/src/lib/hrmListLoadFailure.ts`
  - `isListFetchFailureEmpty(fetchError, itemCount)`
  - `isRateLimitApiError(error)`
  - `HRM_LIST_LOAD_FAILED_SHORT` = `Không tải được` (never `0` / `-`)
- `apps/web/hrm/src/lib/apiError.ts` — friendly `RATE-429` message

---

## Insurance changes

| File | Change |
|------|--------|
| `hooks/useInsuranceList.ts` | `loadInsuranceListProgressive` — first page paint; companions soft-fail; `fetchError` on primary non-2xx |
| `pages/Insurance.tsx` | Banner + Thử lại; error cell ≠ `insurance.noData`; summary/tabs use load-failed label |
| `hooks/useInsuranceList.test.ts` | Progressive + RATE-429 first-page throw + soft employee 429 |

---

## Internal services changes

| File | Change |
|------|--------|
| `hooks/useServiceRequests.ts` | Expose `fetchError` via `toErrorMessage`; no retry hammer on 429 |
| `pages/InternalServices.tsx` | `HrmListLoadBanner` + retry; stats/tabs never show happy **0** on fail; list empty copy only when !loadFailedEmpty |
| Bonus | `useEmployees(..., { enabled: dialogOpen })` — defer emp fan-out until create/edit (`D-P1-HRM-INTSVC-EMP-FANOUT-01` mitigation) |

---

## Unit evidence

```text
cd apps/web/hrm
npm test -- src/hooks/useInsuranceList.test.ts src/lib/hrmListLoadFailure.test.ts src/lib/insuranceSummary.test.ts
→ 3 files / 21 tests PASS
```

---

## QA retest (browser · U65 · :8088 or local)

### Bảo hiểm (`D-HRM-INS-EMPTY-MASK-01` · `D-HRM-INS-PERF-01`)

1. Login `ceo@xe.vn` → HRM → **Bảo hiểm**
2. Happy path: first Network call `GET .../insurance?page=1&page_size=100` returns **200** → table paints before remaining pages finish; tab **Tất cả** may show API `total` early
3. Simulate / observe **429**: must see **Lỗi tải dữ liệu** banner + **Thử lại**; must **not** show «Không có dữ liệu» / summary `-` / tabs **0** as success empty
4. J-HRM-04: click employee name → profile still works after happy load

### Dịch vụ nội bộ (`D-P1-HRM-INTSVC-429-SILENT-EMPTY-01`)

1. Login → **Dịch vụ nội bộ**
2. Happy path: list + tabs hydrate (meal/vehicle/supply)
3. F5 under rate-limit (or force 429): banner + Thử lại; stats show **Không tải được** — **not** silent **0** / «Chưa có yêu cầu nào»
4. Confirm create dialog can still open; employees load when dialog opens (not on page mount)

---

## Handoff packet

- **work_item_id:** `D-HRM-INS-EMPTY-MASK-01`
- **from_role:** dev-fe
- **to_role:** qa
- **entry_criteria:** FE changes above; L0 stack up; U65 browser; cite both insurance + intsvc QA evidence parents
- **exit_criteria:** Retest empty-mask PASS on Bảo hiểm + Dịch vụ nội bộ; Network first-page paint for insurance; no silent 0 on 429
- **evidence_path:** `docs/qa/evidence/d-hrm-ins-empty-mask-20260717.md`
- **ack_status:** **READY_FOR_QA**
- **completion_report:** Closed empty-mask for insurance (banner/retry + progressive page-1 paint) and folded intsvc silent-empty on 429 via shared `hrmListLoadFailure`. Deferred intsvc `useEmployees` until dialog. Unit 21 PASS. Residual for QA: browser 429 retest on :8088; emp fan-out full coalesce still optional.
- **next_owner:** qa
- **next_dispatch_prompt:** |
  Retest `D-HRM-INS-EMPTY-MASK-01` + `D-HRM-INS-PERF-01` on Bảo hiểm and `D-P1-HRM-INTSVC-429-SILENT-EMPTY-01` on Dịch vụ nội bộ per `docs/qa/evidence/d-hrm-ins-empty-mask-20260717.md`. U65 browser-only. PASS when non-2xx shows ERROR banner + Thử lại (never empty/0/-), insurance first paint after page=1, J-HRM-04 still green on happy path. Update parent menu evidence files; PASS_TO_PM or FAIL with Network screenshots.
