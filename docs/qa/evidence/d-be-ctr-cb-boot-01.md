# D-BE-CTR-CB-BOOT-01 — C&B bootstrap backend

## spec_read_ack

- SRS/BA: `docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md` §3–§5; sponsor lock §10b theo dispatch ngày 12/08/2026 — base và si_base độc lập; package hiện hữu read-only; registry-only không bắt C&B; HCNS chỉ mutate khi có quyền C&B.
- SA: `docs/program/specs/SA-CTR-INSURANCE-SALARY-SOURCE-01.md` §3–§5, §8.1 — Option A dùng physical packages ONE SoT.
- API_DESIGN: `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §14 — POST compensation-packages rồi refresh contract-create-context.
- TechSpec/API physical: `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md` §5.1 — AuthZ, overlap, VAL và Nest `/core` DENY.
- change_mode: ADD.
- must_keep: `employee_compensation_packages|lines|history` ONE SoT; không thêm cột lương BH trên `employee_contracts`; `contracts_printable_ready=false`; G4 seals không đổi.

## Implementation evidence

- `employee-compensation.service.ts`: bootstrap `change_reason=ctr_workspace_bootstrap` bắt canonical `base` + allowance `si_base`, mọi amount > 0; lỗi `HRM-CORE-CB-VAL-400`.
- `employee-compensation.service.ts`: whitelist mã hệ thống `base`, `si_base`, `insurance_base`; không seed catalog và vẫn giữ KEY gate cho mã phụ cấp khác.
- `compensation-cb-authz.ts`: HCNS/HRBP/payroll không được cấp quyền theo role/phòng ban/chức danh; mutate cần claim/membership C&B. Platform owner entitlement giữ tương thích; deny dùng `HRM-CORE-CB-AUTHZ-403`.
- `contracts-insurance.service.ts`: create-context ưu tiên `si_base`, rồi `insurance_base`, cuối cùng mới fallback base; so khớp code không phân biệt hoa/thường.
- `d-be-ctr-cb-boot-01.cb-boot.spec.ts`: khóa 403, VAL-400, overlap-409, whitelist zero-seed và snapshot si_base khác base.

## Verification

```text
pnpm --filter hrm-api run test -- --runInBand d-be-ctr-cb-boot-01.cb-boot.spec.ts employee-compensation.service.spec.ts po-hrm-mvp-gd1-core-02-cluster-be-01.spec.ts
PASS — 3 suites, 28 tests

pnpm --filter hrm-api run build
PASS — nest build + verify-dist

pnpm --filter hrm-api exec eslint src/contracts-insurance/compensation-cb-authz.ts src/contracts-insurance/d-be-ctr-cb-boot-01.cb-boot.spec.ts
PASS
```

## Handoff

- Network contract: mutate chỉ `POST /api/hrm/contracts-insurance/compensation-packages`; snapshot read-back qua `GET .../contract-create-context`.
- Chưa promote UF: browser QA phải login → Hợp đồng → tạo bootstrap → POST 2xx → refresh context → F5, zero-seed.
- Honesty: `contracts_printable_ready=false`; C-SLICE ≠ module UAT.
- ack_status: `READY_FOR_QA`
- next_owner: `qa`
- next_dispatch_prompt: Retest D-BE-CTR-CB-BOOT-01 trên browser theo J-HRM-CTR-CB-BOOT-01, dùng tài khoản có và không có membership C&B; zero-seed; xác nhận POST compensation-packages 201, base và si_base khác nhau, create-context trả insurance_salary_vnd từ si_base, F5 còn dữ liệu; kiểm tra 403/400/409 và không có mutate Nest /core hoặc field lương BH trên body hợp đồng.
