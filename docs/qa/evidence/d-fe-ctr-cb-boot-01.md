# Evidence — D-FE-CTR-CB-BOOT-01 (Bootstrap C&B từ ContractWorkspace · FE)

| Meta | Value |
|------|-------|
| **work_item_id** | `D-FE-CTR-CB-BOOT-01` |
| **role** | dev-fe · execution |
| **parent** | `SA-CTR-INSURANCE-SALARY-SOURCE-01` · `BA-CTR-INSURANCE-SALARY-SOURCE-01` |
| **change_mode** | ADD (AMEND hẹp O10 empty-bootstrap) |
| **date** | 2026-08-12 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `contracts_printable_ready=false` · C-SLICE ≠ module · KHÔNG claim CTR printable/UAT |

## spec_read_ack

- **srs/ba:** `docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md` §3–§6 · BR-CTR-CB-BOOT-01..05 · AC-CTR-CB-RO/BOOT/MASK/LINK · Diễn biến §6.1 #3–#6
- **sa:** `docs/program/specs/SA-CTR-INSURANCE-SALARY-SOURCE-01.md` §3.3 (canonical body) · §3.4 (orchestration order) · §4 (effective_from EF-BOOT-01..05) · §5 (error map) · §7 Q-S1/Q-S2/Q-S4 defaults · §8.2 allowed_paths
- **api_design:** `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §14.1 (POST compensation-packages CONSUME) · §14.2 (create-context REFRESH) · §14.3 DENY dual salary column
- **sponsor_confirm (BA §10b, 2026-08-12):** 2 ô tiền riêng (không auto-copy) · đã có gói → RO + CTA «Mở C&B» · registry-only bỏ qua bootstrap · hiện ô nhập theo AuthZ (không ẩn theo phòng ban)

## Scope closed

### 1. `ContractCbReadOnlyCard.tsx` — 3 trạng thái
- `ro`: 3 ô read-only (lương cơ bản · lương đóng BH · tỉ lệ hưởng lương) + **CTA «Mở C&B»** (`ctr-create-cb-open-link`) khi có số (AC-CTR-CB-RO-01 · AC-CTR-CB-LINK-01).
- `bootstrap`: **2 ô tiền vi-VN riêng** `ViMoneyInput` (`ctr-create-cb-base-input`, `ctr-create-cb-insurance-input`) — tự tách nghìn khi gõ, `onValueChange` trả số thuần; không auto-copy (sponsor §10b · Q-S2 default).
- `masked`: banner «Không đủ quyền…» (`ctr-create-cb-masked-banner`), không lộ số, không input (AC-CTR-CB-MASK-01).
- **must_keep:** không có nút «+ Thêm» phụ cấp (AC-CTR-FIELD-04); testid gốc `ctr-create-cb-card` giữ nguyên mọi state.

### 2. `contractCreateApi.ts` — helpers (ADD, cuối file)
- `resolveContractCbBootstrapEffectiveFrom(effective, signing)` → SA §4 priority: **HĐ hiệu lực → ngày ký → hôm nay** (ISO yyyy-MM-dd, local, không min()).
- `validateContractCbBootstrapDraft(draft)` → chặn trống/≤0 từng ô riêng (BR-CTR-CB-BOOT-03).
- `isContractCbBootstrapState({subjectType, employeeId, snapshot})` → true chỉ khi NV + có employee_id + snapshot đã tải + không masked + snapshot rỗng (BR-CTR-CB-BOOT-01/05).
- `buildContractCbBootstrapPayload(...)` → canonical SA §3.3: `change_reason=ctr_workspace_bootstrap`, `currency=VND`, lines `base{component_code:base}` + `allowance{allowance_code:si_base, component_code:si_base}`; soft-link `contract_id`+`link_to_contract` chỉ khi HĐ đã có id.
- `bootstrapContractCompensationPackage(...)` → **REUSE** `createCompensationPackage` (POST `/api/hrm/contracts-insurance/compensation-packages`) — không endpoint mới.
- `mapContractCbBootstrapError(err)` → SA §5: overlap 409 (`HRM-COMP-409-OVERLAP`/`HRM-CORE-CB-OVERLAP-409`) = `treatAsExisting` (gói đã có → refresh RO, cho lưu); AUTHZ-403 / VAL-400 = chặn.
- **DENY:** không PATCH lương BH làm SoT trên `employee_contracts` (không đụng payload registry).

### 3. `ContractCreateWizardDialog.tsx` — orchestration
- State `cbBootstrap` (reset khi đổi NV/công ty).
- `maybeBootstrapCb()`: nếu `isContractCbBootstrapState` → validate → POST packages (effective_from map §4, soft-link `sessionContractId` nếu có) → **GET contract-create-context refresh** (`setContextSnapshot`) → card về RO → return true. Overlap → refresh + proceed. AUTHZ/VAL → toast + return false (chặn).
- **Nút Tiếp** (`goStep2`) và **nút Lưu bước 1** (non registry-only) gọi `maybeBootstrapCb()` **trước** `persistRegistry(false)` — đúng thứ tự SA §3.4 (packages → refresh → contract).
- **Registry-only** (`onRegistryOnly → persistRegistry(true)`) **bỏ qua** bootstrap (Q-S4 default).

### 4. `ContractCreateStep1GeneralGrid.tsx`
- Truyền props card: `cbMasked`, `bootstrapEligible` (qua `isContractCbBootstrapState`), `bootstrap`, `onBootstrapChange`, `openCbHref` (`/employees/:id?tab=salary` + embed scope khi RO có số).
- **searchPlacement điều kiện `getHrmPortalMode` GIỮ NGUYÊN** (inline khi portal-embed, popover standalone) — không xóa mode inline.

## Cảnh báo `catalogSearchPlacement` — kiểm chứng
Đã inspect `ContractCreateStep1GeneralGrid.tsx`: `catalogSearchPlacement` được guard `typeof window !== 'undefined' && getHrmPortalMode(...)`. **Không thấy lỗi runtime thật** (không truy cập window/undefined chưa guard). Giữ nguyên logic điều kiện; không sửa. Nếu QA reproduce crash browser thật → cần thêm stack trace cụ thể.

## Tests (authored)
- `src/components/contracts/ContractCb.boot.test.ts` — unit các helper: effective_from priority (3 case), validate (trống/1 ô/âm/hợp lệ), payload canonical (2 lines + soft-link), eligibility (6 case), error map (overlap/authz/val).
- `src/lib/contractCreateWizard.source.test.ts` — thêm block `D-FE-CTR-CB-BOOT-01` source-lock: card 3 testid + ViMoneyInput + no «+ Thêm»; api helpers + `ctr_workspace_bootstrap` + `allowance_code:'si_base'`; wizard `maybeBootstrapCb` + `persistRegistry(true)` registry-only.

## Static verification
- **IDE diagnostics (TS/ESLint): 0 lỗi** trên cả 6 file chạm (contractCreateApi.ts, ContractCbReadOnlyCard.tsx, ContractCreateStep1GeneralGrid.tsx, ContractCreateWizardDialog.tsx, ContractCb.boot.test.ts, contractCreateWizard.source.test.ts).

## Blocker môi trường (không phải lỗi code)
- Không chạy được `vitest` trong phiên này: mọi lệnh spawn Node (`npx vitest`, `node -e`, local `.bin/vitest.cmd`, `cmd /c npx`) trả **no exit status** / background báo `spawn ...powershell.exe ENOENT`, trong khi `echo` chạy bình thường. → Nested process spawn của harness đang lỗi.
- **Cần chạy trên stable dev stack:** `pnpm --filter vite_react_shadcn_ts test -- src/components/contracts/ContractCb.boot.test.ts src/lib/contractCreateWizard.source.test.ts` (QA/CI).

## Click path — J-HRM-CTR-CB-BOOT-01 (U65 browser, QA thực thi)
1. Login `ceo@xe.vn` / `Xevn@2026` → HRM → **Hợp đồng** → **Thêm**.
2. Tab **Nhân viên** → chọn NV **chưa có gói C&B** → card C&B hiện trạng thái **bootstrap** (2 ô nhập).
3. Nhập **Lương cơ bản** + **Lương đóng BH** (khác nhau) — quan sát tách nghìn vi-VN khi gõ.
4. Chọn mẫu in → **Tiếp** → Network: `POST /api/hrm/contracts-insurance/compensation-packages` **201** → tiếp `GET …/contract-create-context` → card chuyển **read-only** đúng 2 số → rồi POST/PATCH hợp đồng (KHÔNG có field lương BH trên body HĐ).
5. **F5** / mở lại hồ sơ NV → tab Lương: cùng mức BH (AC-CTR-CB-BOOT-02).
6. Fail case: để trống/0 → **Tiếp** bị chặn + lỗi VI (AC-CTR-CB-BOOT-03).
7. NV **đã có** gói: card **read-only** + CTA **«Mở C&B»** → `/employees/:id?tab=salary` (AC-CTR-CB-RO/LINK).
8. **Chỉ lưu sổ đăng ký**: KHÔNG bị chặn bởi C&B (AC-CTR-TPL-DYN-03 / Q-S4).

## Handoff

- **completion_report:** FE bootstrap C&B hoàn tất — card 3 trạng thái (RO|bootstrap|masked), 2 ô tiền vi-VN riêng, orchestration POST packages → refresh context → lưu HĐ (không dual-SoT lương trên contracts), registry-only skip, CTA «Mở C&B». Static clean. **Residual:** chạy vitest trên stable stack (blocker môi trường phiên này); QA browser J-HRM-CTR-CB-BOOT-01 (U65 zero-seed); phụ thuộc `D-BE-CTR-CB-BOOT-01` để create-context trả `insurance_salary_vnd` từ `si_base` sau create.
- **next_owner:** qa
- **next_dispatch_prompt:**
```text
work_item_id: QA-CTR-CB-BOOT-01
role: qa
lane: execution
parent: SA-CTR-INSURANCE-SALARY-SOURCE-01
entry_criteria: D-FE-CTR-CB-BOOT-01 READY_FOR_QA + D-BE-CTR-CB-BOOT-01 READY_FOR_QA; HRM :28001 + web :5175 up (qc:fe-be-health exit 0)
read_first:
  - docs/qa/evidence/d-fe-ctr-cb-boot-01.md
  - docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md §5 (AC) · §5.1 (journeys)
task:
  1) Chạy vitest: pnpm --filter vite_react_shadcn_ts test -- src/components/contracts/ContractCb.boot.test.ts src/lib/contractCreateWizard.source.test.ts (dev đã bị chặn spawn trong phiên code).
  2) U65 browser J-HRM-CTR-CB-BOOT-01: NV mới → bootstrap 2 ô → Tiếp → Network POST compensation-packages 201 → GET create-context → card RO → F5 còn số. Xác nhận KHÔNG có field lương BH trên body POST/PATCH contracts.
  3) J-HRM-CTR-CB-RO-01: NV có gói → card RO + CTA «Mở C&B» điều hướng /employees/:id?tab=salary.
  4) Fail: trống/0 → chặn Tiếp + lỗi VI (AC-CTR-CB-BOOT-03). Masked: user thiếu quyền C&B → banner, không lộ số.
  5) Registry-only «Chỉ lưu sổ» → KHÔNG bị chặn bởi C&B (AC-CTR-TPL-DYN-03).
exit_criteria: evidence docs/qa/evidence/qa-ctr-cb-boot-01.md với Network + screenshot + F5; verdict per AC; không seed
honesty: contracts_printable_ready=false · C-SLICE
```
- **evidence_path:** `docs/qa/evidence/d-fe-ctr-cb-boot-01.md`
- **ack_status:** READY_FOR_QA
