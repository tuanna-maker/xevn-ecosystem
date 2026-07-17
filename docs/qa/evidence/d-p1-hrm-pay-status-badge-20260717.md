# D-P1-HRM-PAY-STATUS-BADGE-01 — Dev-FE evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `D-P1-HRM-PAY-STATUS-BADGE-01` |
| **date** | 2026-07-17 |
| **owner** | dev-fe |
| **from** | QA residual `docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-20260717.md` item 5 — header PASS; cells raw `processed` |
| **prior** | `docs/qa/evidence/d-p1-hrm-pay-i18n-status-20260717.md` (header leaf only) |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed · no API mutate · unit evidence only |

---

## Symptom (QA)

Payroll payslip list / detail `StatusBadge` showed raw English API value **`processed`** while column header «Trạng thái» was already fixed.

## Root cause

`StatusBadge` had no `processed` (or `locked`) entry → fallback `{ label: status }` rendered the English code. Payslip enum (`draft` \| `processed` \| `paid`) was not covered by `common.status.*` leaves.

## Fix (minimal delta)

| File | Change |
|------|--------|
| `apps/web/hrm/src/i18n/locales/vi.json` | `common.status` + `draft` / `processed` / `paid` / `locked` / `closed` / `rejected` (string leaves) |
| `apps/web/hrm/src/i18n/locales/en.json` | Same keys (EN) |
| `apps/web/hrm/src/components/common/StatusBadge.tsx` | Resolve payroll/approval codes via `t('common.status.{code}')`; keep employee `active`/`inactive`/`probation` hardcoded («Đang làm việc» ≠ company «Đang hiệu lực») |
| `apps/web/hrm/src/components/common/status-badge.test.ts` | 4 unit tests |

**VN mapping (payslip / period):**

| API code | `common.status.*` (vi) |
|----------|-------------------------|
| `draft` | Nháp |
| `processed` | Đã xử lý |
| `paid` | Đã thanh toán |
| `locked` | Đã khóa |
| `closed` | Đã đóng |

## Verification

```text
pnpm exec vitest run src/components/common/status-badge.test.ts
→ 4/4 PASS
```

- Assert `vi.common.status.processed === 'Đã xử lý'`
- Render `StatusBadge status="processed"` → **Đã xử lý**, not `processed`
- Employee `active` still **Đang làm việc** (no regression vs company leaf)

**U65:** no seed; no browser mutate in this wave (unit + locale leaf).

## QA retest (copy-ready)

1. Login `ceo@xe.vn` · `companyId=main` → `/command-center/hrm/payroll` (iframe `/hr/payroll`)
2. Payslip list: column **Trạng thái** header OK; cell badges show **Đã xử lý** (or Nháp / Đã thanh toán) — **not** raw `processed`
3. Open detail (eye): badge in dialog also VN
4. Regression: Nhân sự list employee status still «Đang làm việc» / «Thử việc» / «Đã nghỉ việc»

## Residual

| Item | Notes |
|------|-------|
| Other locale packs (zh/lo/km/my) | Not updated — fallback VN hardcoded for payroll codes if leaf missing; vi/en SoT for UAT |
| Overview turnover 1041 vs 1107 | Unrelated P2 from resume evidence |

---

## Handoff packet

- `work_item_id:` `D-P1-HRM-PAY-STATUS-BADGE-01`
- `from_role:` `dev-fe`
- `to_role:` `qa`
- `ack_status:` `READY_FOR_QA`
- `evidence_path:` `docs/qa/evidence/d-p1-hrm-pay-status-badge-20260717.md`
- `next_owner:` `qa`
- `completion_report:` Mapped payslip/period status codes to `common.status.*` leaves; StatusBadge uses i18n for those codes so cells show «Đã xử lý» instead of raw `processed`. Vitest 4/4 PASS. Employee active label unchanged.
- `next_dispatch_prompt:` Retest D-P1-HRM-PAY-STATUS-BADGE-01 on `:8088` payroll payslip list (ceo@xe.vn, companyId=main, U65 browser-only): StatusBadge cells must show Vietnamese («Đã xử lý» / «Nháp» / «Đã thanh toán»), not raw English `processed`. Header «Trạng thái» still PASS. Evidence: docs/qa/evidence/d-p1-hrm-pay-status-badge-20260717.md. Regression: employee directory StatusBadge still «Đang làm việc».
