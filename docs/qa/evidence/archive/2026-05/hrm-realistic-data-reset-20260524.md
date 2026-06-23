# HRM Realistic Data Reset — evidence

**work_item_id:** `HRM-REALISTIC-DATA-RESET`  
**date:** 2026-05-24  
**owner:** DevOps / PM

## Commands

```bash
pnpm run seed:hrm:reset-realistic -- --skip-bootstrap
# or chain: purge → seed:hrm:1000-uat → seed:hrm:fidelity → gates
```

## Results

| Gate | Result |
|------|--------|
| `verify:hrm:menu-density` | **7/7 PASS** |
| `verify:hrm:realistic-quality` | **4/4 PASS** |
| Workforce tag | `realistic-v2` — **1000** employees, **0** `UAT Nguyen` |
| Contracts | **1045** rows, professional types (BLLĐ VN labels) |
| API probe `ceo@xe.vn` | **1044** contracts with `employee_name` populated |

## Sample API (contracts)

- `Lý Thị Hùng` — Hợp đồng lao động xác định thời hạn 36 tháng  
- Loại HĐ không còn chuỗi `(fidelity)`

## Notes

- XBOS `bootstrap:xbos` blocked on Windows path Unicode — catalog via `pnpm run seed:hrm:group-employee-catalog` when needed.
- User refresh UI — out of scope for this evidence.
