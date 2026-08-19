# SA — Option/F.1 · Bootstrap C&B từ ContractWorkspace (lương đóng BH)

| Meta | Value |
|------|--------|
| **work_item_id** | `SA-CTR-INSURANCE-SALARY-SOURCE-01` |
| **lane** | governance · sa |
| **parent** | `BA-CTR-INSURANCE-SALARY-SOURCE-01` |
| **change_mode** | **ADD** — AMEND hẹp O10 empty-bootstrap; **RETAIN** CORE-02 packages ONE SoT · G4 seals · BA-02 O10 no «+ Thêm» |
| **status** | **LOCKED** (default BA khi Q-S1..Q-S5 chưa trả lời) · **PASS_TO_PM** |
| **Date** | 2026-08-12 |
| **honesty** | `contracts_printable_ready=false` · **C-SLICE ≠ module** · **cấm** claim CTR printable/UAT · **cấm** coi G4 GWC = mở lại DONE |
| **must_keep** | `employee_compensation_packages\|lines\|history` ONE SoT · `HRM-CORE-CB-403` / `HRM-CORE-CB-AUTHZ-403` · **DENY** cột lương BH SoT trên `employee_contracts` · no `apps/**` this seat · no seed |
| **ref_ba** | [`BA-CTR-INSURANCE-SALARY-SOURCE-01.md`](./BA-CTR-INSURANCE-SALARY-SOURCE-01.md) §2–§5 · §11 |
| **ref_core02** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) · [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md) **F-CORE-EMP-02** |
| **ref_ba02** | [`PO-HRM-CTR-CREATE-REDESIGN-BA-02.md`](./PO-HRM-CTR-CREATE-REDESIGN-BA-02.md) **O10 / Q9 / AC-CTR-FIELD-04** |
| **ref_audit** | [`docs/qa/evidence/pm-audit-contract-cb-salary-not-fillable-01.md`](../../qa/evidence/pm-audit-contract-cb-salary-not-fillable-01.md) |
| **api_design_delta** | [`docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md`](../../hrm/API_DESIGN_HRM_CONTRACTS_INS.md) **§14** |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **Option A LOCKED** (P-A bootstrap)

| Decision | Stamp |
|----------|--------|
| SoT «Lương đóng BH» | `employee_compensation_lines.component_code ∈ {si_base, insurance_base}` — **RETAIN** CORE-02 |
| SoT «Lương cơ bản» | `line_type=base` (+ derive `component_code=base`) |
| Bootstrap path | **REUSE** `POST /api/hrm/contracts-insurance/compensation-packages` — **DENY** endpoint mới · **DENY** Nest `/core` dual |
| Snapshot consume | **REUSE** `GET …/employees/{employeeId}/contract-create-context` → `compensation_snapshot` — refresh sau POST 2xx |
| Contract table | **DENY** persist `insurance_salary` / `bhxh_amount` / custom_fields lương BH làm SoT |
| UI O10 | **RETAIN** RO khi đã có active package **hoặc** `cb_masked` · **ADD** bootstrap editable **chỉ** khi snapshot rỗng + `employee_id` + AuthZ C&B mutate |
| UV pre-hire | **DENY** bootstrap (`employee_id` null) — **RETAIN** BA-03 |
| Registry-only | **DENY** bắt bootstrap (default Q-S4) — **RETAIN** AC-CTR-XEVN-08 / AC-CTR-TPL-DYN-03 |
| `salary_ratio_percent` | **DOC residual riêng** (§6) — **không** gộp lane lương BH |
| Unlock | `D-BE-CTR-CB-BOOT-01` + `D-FE-CTR-CB-BOOT-01` — allowed_paths **hẹp** |

```text
  ContractWorkspace / Create wizard (NV-first)
        │  GET contract-create-context
        ├─► có package / cb_masked → Card RO (O10 RETAIN)
        └─► snapshot rỗng + AuthZ C&B → bootstrap 2 ô (default Q-S2)
                    │
                    ▼ Tiếp/Lưu (không registry-only)
        POST /api/hrm/contracts-insurance/compensation-packages
          lines: base + si_base · effective_from (map §4)
          AuthZ → HRM-CORE-CB-AUTHZ-403 | VAL-400 | OVERLAP-409
                    │
                    ▼ 201 HRM-COMP-201
        GET contract-create-context (refresh)
          → insurance_salary_vnd + base_salary_vnd · card → RO
                    │
                    ▼
        POST/PATCH employee_contracts  (KHÔNG gửi SoT lương BH)
```

**Invariant CTR-CB-SOT-01:** Mọi số «Lương đóng BH» vận hành chỉ qua packages/lines.

**Invariant CTR-CB-BOOT-PATH:** Network bootstrap **MUST** chứa `/contracts-insurance/compensation-packages` — FAIL nếu chỉ PATCH contracts.

**Invariant CTR-CB-NO-DUAL:** Cột/body HĐ lương BH bền = FAIL architecture.

**Invariant CTR-CB-O10-AMEND:** Không «+ Thêm» phụ cấp GĐ1 — bootstrap ≠ allowance sub-grid.

---

## 2. Options considered

| | **A — REUSE POST packages (LOCKED)** | **B — Orchestrated `POST …/contracts/bootstrap-cb`** | **C — P-B only (CTA hồ sơ, no bootstrap)** |
|--|--------------------------------------|-----------------------------------------------------|---------------------------------------------|
| Scope | FE card + thin createPackage wire | New Nest endpoint wrapping createPackage | FE CTA only |
| Dual-SoT risk | Thấp (cùng SoT) | Trung bình (thêm façade) | Thấp |
| UX Excel | Khớp P-A BA | Khớp | Lệch Excel |
| Cost | Thấp | Cao hơn + OpenAPI | Thấp nhưng sponsor pain |
| **Recommend** | **A** | DENY GĐ1 | Fallback nếu sponsor đổi Q-S1 sang P-B only |

---

## 3. F.1 API — bootstrap contract (ADD)

### 3.1 F-CORE-EMP-02 — **RETAIN + CONSUME** (bootstrap)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/contracts-insurance/compensation-packages`** |
| **Mục đích** | Tạo **gói C&B v1** từ màn HĐ khi NV chưa có snapshot — ghi SoT lương CB + lương đóng BH **trước** (hoặc ngay trước) lưu registry HĐ. |
| **Nghiệp vụ xử lý** | (1) `assertCompensationCbAccess(mutate)` → thiếu → **403** `HRM-CORE-CB-AUTHZ-403`. (2) Validate `effective_from` (§4) · lines ≥2 bootstrap shape · amount **> 0** trên base + si_base (FE bắt buộc; BE khuyến nghị VAL-400 nếu ≤0 khi `change_reason=ctr_workspace_bootstrap`). (3) Persist packages + lines + history — **RETAIN** CORE-02. (4) Overlap segment → **409** `HRM-COMP-409-OVERLAP` / alias `HRM-CORE-CB-OVERLAP-409`. (5) `contract_id?` optional — chỉ khi HĐ đã tồn tại; `link_to_contract?` soft-link. (6) **cấm** ghi lương vào `employee_contracts` SoT. (7) Catalog: khi Nest `salary_components` active >0 → `base` + `si_base` ∈ catalog **hoặc** whitelist system codes `{base, si_base, insurance_base}` (BE residual — **không** seed UF). |
| **Tham chiếu bước SRS** | **BA-CTR** Diễn biến §6 #3–#4 · **BR-CTR-CB-BOOT-01..04** · **AC-CTR-CB-BOOT-01/02/03** · **FR-UC-BP-CORE-02** #1–#4 (mutate C&B) · **BR-BP-SEC-02** |
| **Request (bootstrap canonical)** | xem §3.3 |
| **Response** | **201** `HRM-COMP-201` + package DTO (lines có `component_code`) |
| **Lỗi** | bảng §5 |

### 3.2 F-CORE-CTR-CREATE-CTX-01 — **RETAIN + REFRESH**

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/contracts-insurance/employees/{employeeId}/contract-create-context?company_id=`** |
| **Mục đích** | Sau bootstrap 2xx: FE **bắt buộc** refresh để card chuyển RO với `base_salary_vnd` + `insurance_salary_vnd`. |
| **Nghiệp vụ** | `getActivePackage` → `buildCompensationSnapshotFromPackage`: `insurance_salary_vnd` ← line `si_base` \| `insurance_base` \| fallback base (**RETAIN** AS-IS). AuthZ fail open → `cb_masked=true` (không lộ số). |
| **Bước SRS** | BA §6 #2 · #4 · AC-CTR-CB-RO-01 · AC-CTR-CB-BOOT-02 |
| **DENY change** | Không ADD field lương SoT trên contracts trong context response ngoài snapshot |

### 3.3 Canonical bootstrap body (FE → BE)

```json
{
  "company_id": "<slug|uuid text>",
  "employee_id": "<uuid>",
  "effective_from": "<ISO date — map §4>",
  "change_reason": "ctr_workspace_bootstrap",
  "contract_id": null,
  "link_to_contract": false,
  "currency": "VND",
  "lines": [
    {
      "line_type": "base",
      "amount": 12000000,
      "component_code": "base"
    },
    {
      "line_type": "allowance",
      "amount": 10000000,
      "allowance_code": "si_base",
      "component_code": "si_base"
    }
  ]
}
```

| Rule | Detail |
|------|--------|
| **Why allowance for si_base** | DTO LIVE chỉ `base\|probation\|allowance` — **không** ADD `line_type` mới GĐ1 |
| **Read path** | Snapshot đã ưu tiên `component_code=si_base` — khớp |
| **Alias read** | `insurance_base` chấp nhận khi đọc (RETAIN) — bootstrap **ghi** canonical `si_base` |
| **Q-S2 = luôn bằng** | FE vẫn POST **2 lines** với cùng amount (1 ô UI copy) — **không** bỏ line si_base |
| **Bank/MST** | Optional omit trên bootstrap HĐ — profile C&B có thể bổ sung sau (RETAIN CORE-02 O6) |
| **After contract create** | Optional follow-up: `revise` **không** bắt buộc; soft-link `contract_id` + `link_to_contract` khi đã có `contract.id` (BE residual hẹp — không rewrite CTR) |

### 3.4 Orchestration order (FE)

1. Validate bootstrap UI (2 amounts > 0, vi-VN parse) — BR-CTR-CB-BOOT-03.  
2. Resolve `effective_from` (§4) — nếu thiếu date bắt buộc → chặn Tiếp (không POST packages với date giả im lặng trừ rule §4.3).  
3. `POST compensation-packages` → 201.  
4. `GET contract-create-context` refresh.  
5. `POST/PATCH contracts` **không** kèm SoT lương BH.  
6. Card state → RO.

**DENY** single transactional Nest “create contract + package” endpoint GĐ1 (Option B).

---

## 4. `effective_from` bootstrap — **LOCKED default**

| Priority | Source | When |
|----------|--------|------|
| **1** | Wizard field **ngày hiệu lực HĐ** (`effective_from` / start date form) | Đã nhập |
| **2** | Wizard **ngày ký** (`signed_at` / signing_date) | #1 trống |
| **3** | **Calendar date hôm nay** (client local → ISO `yyyy-MM-dd`) | #1 và #2 trống **và** user đã nhập 2 mức lương hợp lệ |

| Rule ID | Rule |
|---------|------|
| **EF-BOOT-01** | `effective_from` packages **MUST** là ISO date string; missing → **400** `HRM-CORE-CB-VAL-400` |
| **EF-BOOT-02** | Nếu cả #1 và #2 có: dùng **#1** (ngày hiệu lực HĐ). Không lấy `min()` — tránh gói C&B sớm hơn hiệu lực HĐ khi ký trước |
| **EF-BOOT-03** | Không dùng `effective_to` HĐ làm `effective_from` packages |
| **EF-BOOT-04** | UV / `employee_id` null → **không** gọi POST packages |
| **EF-BOOT-05** | Overlap với gói đã có cùng đoạn ngày → **409** (FE lẽ ra không hiện bootstrap nếu snapshot đã có — race: toast VI + refresh context) |

**Sponsor / BA follow-up:** nếu sau này bắt `effective_from ≥ signed_at` chặt — ADD VAL message; không đổi SoT.

---

## 5. Error map → bước SRS / AC

| HTTP | Code | Condition | Bước / AC | FE UX |
|------|------|-----------|-----------|-------|
| **403** | `HRM-CORE-CB-AUTHZ-403` | Không membership C&B / view_salary khi POST packages | BR-CTR-CB-BOOT-04 · AC-CTR-CB-MASK-01 · FR-CORE-02 AuthZ | Banner «Không đủ quyền…»; **không** input bootstrap; **≠** `HRM-CORE-CB-403` (public EMP) |
| **400** | `HRM-CORE-CB-VAL-400` | Thiếu/invalid `effective_from` · amount không hợp lệ | BR-CTR-CB-BOOT-02/03 · EF-BOOT-01 | Message VI; chặn Tiếp |
| **400** | `HRM-COMP-001` | Thiếu base line | CORE-02 RETAIN | Không gửi body thiếu base |
| **400** | `HRM-COMP-003` | allowance thiếu `allowance_code` | DTO LIVE | Bootstrap **must** set `allowance_code=si_base` |
| **400/409** | `HRM-SC-COMP-KEY` | Catalog active >0 mà `si_base`/`base` OOS | CNS peer | Residual BE whitelist / catalog system codes |
| **409** | `HRM-COMP-409-OVERLAP` / `HRM-CORE-CB-OVERLAP-409` | Đã có package chồng đoạn | AC-CTR-CB-RO-01 race | Toast + GET context → RO |
| **404/409** | `HRM-CON-404` / scope | `employee_id` / `contract_id` ngoài scope | U19 | Standard CTR errors |
| **403** | `HRM-CORE-CB-403` | Public `/employees*` body C&B | must_keep CORE-01 | **Không** dùng path public cho bootstrap |

---

## 6. Residual — `salary_ratio_percent` (DOC-ONLY)

| Plane | Behavior AS-IS | Verdict |
|-------|----------------|---------|
| **Form / registry HĐ** | `salary_ratio_percent` trên POST/PATCH contracts (BA-02 Q5 · AC-CTR-FIELD-03 · API §12) | **RETAIN** — tỉ lệ hưởng lương **hợp đồng** |
| **compensation_snapshot** | `buildCompensationSnapshotFromPackage` hardcode **`salary_ratio_percent: 100`** | **DOC residual** — lệch UX card «Tỉ lệ hưởng lương» vs form |
| **Lane này** | **Không** sửa snapshot=100 · **không** gộp vào bootstrap BH | Tách WI sau nếu sponsor yêu cầu (vd. bind snapshot ← form ratio **hoặc** ẩn ô ratio trên card C&B) |

**Cấm:** dùng `salary_ratio_percent` để suy ra `si_base` / FE tự tính BH.

---

## 7. Q-S1..Q-S5 — default thiết kế & điểm đổi

| ID | **Default LOCKED (chưa có sponsor answer)** | **Nếu sponsor trả lời khác → đổi gì** |
|----|-----------------------------------------------|----------------------------------------|
| **Q-S1** | Đã có gói → **RO + CTA «Mở C&B»** (revise trên hồ sơ) — **không** edit inline HĐ | Cho phép edit trên HĐ → FE gọi **`POST …/revise`** (cùng SoT); mở rộng `ContractCbReadOnlyCard` state `revise`; **vẫn DENY** contract-table SoT |
| **Q-S2** | **2 ô riêng** base + si_base (bắt buộc) | «Luôn bằng» → **1 ô** UI + FE copy amount vào cả 2 lines POST; BE contract **không** đổi |
| **Q-S3** | **Ngoài slice** bootstrap (matrix 8 mẫu peer TPL-DYN) | Chỉ ảnh hưởng QA/bind clause — **không** đổi F.1 packages |
| **Q-S4** | Registry-only (**Chỉ lưu sổ**) **không** bắt bootstrap | Bắt C&B trước registry → FE gate AC-CTR-XEVN-08; BE vẫn cùng POST packages |
| **Q-S5** | Ai bootstrap = **cùng** AuthZ C&B mutate CORE-02 (`HRM-CORE-CB-AUTHZ-403`) | Nới role allow-list trong `compensation-cb-authz.ts` — **governance + BE AuthZ only**; không đổi path API |

---

## 8. Unlock execution (allowed_paths hẹp)

### 8.1 `D-BE-CTR-CB-BOOT-01`

| Field | Value |
|-------|--------|
| **entry** | SA LOCK + BA §3–§5 |
| **must_keep** | CORE-02 packages SoT · AuthZ codes · Nest `/core` DENY · no insurance salary column on contracts · G4 seals |
| **allowed_paths** | `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts` · `dto/create-compensation-package.dto.ts` · `compensation-cb-authz.ts` · `contracts-insurance.service.ts` (**chỉ** `buildCompensationSnapshotFromPackage` / create-context nếu cần assert si_base) · `*compensation*.spec.ts` · `*cb-boot*.spec.ts` |
| **forbidden** | Rewrite workspace G4 · print/issue · payroll process · public EMP · migration ADD cột lương BH trên `employee_contracts` |
| **task** | Đảm bảo createPackage nhận line `si_base` (allowance_code+component_code); amount>0 khi `change_reason=ctr_workspace_bootstrap` (optional VAL); catalog whitelist/`si_base` membership; create-context trả `insurance_salary_vnd` đúng sau create; jest overlap/authz/val; optional soft-link `contract_id` |
| **exit** | `READY_FOR_QA` · `docs/qa/evidence/d-be-ctr-cb-boot-01.md` |

### 8.2 `D-FE-CTR-CB-BOOT-01`

| Field | Value |
|-------|--------|
| **entry** | same SA LOCK |
| **must_keep** | AC-CTR-FIELD-04 no «+ Thêm» · printable=false · G4 shell · O10 RO khi có package |
| **allowed_paths** | `apps/web/hrm/src/components/contracts/ContractCbReadOnlyCard.tsx` · `ContractCreateStep1GeneralGrid.tsx` · `ContractCreateWizardDialog.tsx` (wire Tiếp/bootstrap only) · `lib/contractCreateApi.ts` · `integrations/hrmApi.ts` (**reuse** `createCompensationPackage`) · related `*.source.test.ts` / vitest hẹp |
| **forbidden** | Full CTR rewrite · clause DnD · template composer · EmployeeCompensationPanel rewrite (CTA link OK) · seed |
| **task** | States **RO \| bootstrap \| masked**; 2 ô vi-VN (default Q-S2); validate >0; POST packages → refresh context → rồi mới persist HĐ; registry-only skip bootstrap; CTA C&B khi RO |
| **exit** | `READY_FOR_QA` · `docs/qa/evidence/d-fe-ctr-cb-boot-01.md` · journey **J-HRM-CTR-CB-BOOT-01** |

---

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Catalog KEY chặn `si_base` | BE whitelist system codes hoặc đảm bảo CNS có `si_base`; QA assert code |
| Race: package tạo giữa GET context và Tiếp | OVERLAP-409 → refresh → RO |
| Dual-write lương lên contracts | QA Network forbid; code review DENY |
| Scope creep TPL 6 vs 8 | Q-S3 out-of-slice; peer BA TPL |
| Claim printable ready | honesty false stamp |

---

## 10. Validation / acceptance (architecture)

| Check | PASS |
|-------|------|
| API_DESIGN §14 exists with Mục đích · Nghiệp vụ · bước SRS | This WI |
| Bootstrap = POST packages only | Path assert |
| effective_from map documented | §4 |
| Errors VAL/OVERLAP/AUTHZ mapped | §5 |
| salary_ratio residual doc-only | §6 |
| Q-S defaults + delta points | §7 |
| Dev unlock narrow paths | §8 |
| Honesty | printable=false · C-SLICE |

---

## 11. completion / ack

| Field | Value |
|-------|--------|
| **completion_report** | **LOCKED Option A:** bootstrap empty C&B từ ContractWorkspace = **REUSE** `POST /api/hrm/contracts-insurance/compensation-packages` với lines `base` + `si_base` (allowance shape); refresh `GET contract-create-context`; **DENY** contract-table SoT. `effective_from` priority: HĐ effective → signed_at → today. Errors: `HRM-CORE-CB-VAL-400` · `HRM-COMP-409-OVERLAP`/`HRM-CORE-CB-OVERLAP-409` · `HRM-CORE-CB-AUTHZ-403` gắn BA Diễn biến/AC. Residual `salary_ratio_percent` form vs snapshot=100 = **doc-only**. Unlock **D-BE-CTR-CB-BOOT-01** + **D-FE-CTR-CB-BOOT-01** allowed_paths hẹp. Q-S1..S5 defaults + điểm đổi ghi §7. Không `apps/**`. |
| **residual** | Chờ sponsor Q-S*; CNS/`si_base` catalog membership; soft-link contract_id sau create; salary_ratio align WI riêng; TPL-DYN peer |
| **next_owner** | **pm** → song song **dev-be** + **dev-fe** (default BA đủ để code) |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/SA-CTR-INSURANCE-SALARY-SOURCE-01.md` · delta `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §14 |

### next_dispatch_prompt (copy-ready) — Dev-BE

```text
work_item_id: D-BE-CTR-CB-BOOT-01
role: dev-be
lane: execution
parent: SA-CTR-INSURANCE-SALARY-SOURCE-01
read_first:
  - docs/program/specs/SA-CTR-INSURANCE-SALARY-SOURCE-01.md (§3–§5, §8.1)
  - docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md §14
  - docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md §3–§5
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md §5.1
change_mode: ADD
must_keep: employee_compensation_* ONE SoT; HRM-CORE-CB-AUTHZ-403 / VAL-400 / OVERLAP-409; Nest /core DENY; no insurance salary column SoT on employee_contracts; G4 seals; contracts_printable_ready=false
allowed_paths:
  - apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts
  - apps/api/hrm-api/src/contracts-insurance/dto/create-compensation-package.dto.ts
  - apps/api/hrm-api/src/contracts-insurance/compensation-cb-authz.ts
  - apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts (snapshot/create-context only if needed)
  - apps/api/hrm-api/src/contracts-insurance/*compensation*.spec.ts
  - apps/api/hrm-api/src/contracts-insurance/*cb-boot*.spec.ts
forbidden_paths: workspace G4 rewrite; print/issue; payroll process; public EMP salary write; migration ADD bhxh/insurance_salary on employee_contracts
spec_read_ack_required: true
code_memory_required: true
task:
  1) Ensure createPackage accepts bootstrap lines: base + allowance{allowance_code:si_base, component_code:si_base}.
  2) Optional: when change_reason=ctr_workspace_bootstrap, amount must be >0 → HRM-CORE-CB-VAL-400.
  3) Catalog: whitelist or ensure si_base/base membership when Nest active >0 (no UF seed).
  4) create-context after create returns insurance_salary_vnd from si_base (not only fallback base).
  5) jest: authz 403, val 400, overlap 409, snapshot si_base.
exit_criteria: READY_FOR_QA · evidence docs/qa/evidence/d-be-ctr-cb-boot-01.md · Network path packages only
honesty: contracts_printable_ready=false · C-SLICE
```

### next_dispatch_prompt (copy-ready) — Dev-FE

```text
work_item_id: D-FE-CTR-CB-BOOT-01
role: dev-fe
lane: execution
parent: SA-CTR-INSURANCE-SALARY-SOURCE-01
read_first:
  - docs/program/specs/SA-CTR-INSURANCE-SALARY-SOURCE-01.md (§3–§4, §7–§8.2)
  - docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md §3–§6
  - docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md §14
change_mode: ADD
must_keep: AC-CTR-FIELD-04 no «+ Thêm» PC; O10 RO when package exists; printable=false; G4 shell; U65 zero-seed
allowed_paths:
  - apps/web/hrm/src/components/contracts/ContractCbReadOnlyCard.tsx
  - apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx
  - apps/web/hrm/src/components/contracts/ContractCreateWizardDialog.tsx
  - apps/web/hrm/src/lib/contractCreateApi.ts
  - apps/web/hrm/src/integrations/hrmApi.ts (reuse createCompensationPackage only)
  - apps/web/hrm/src/components/contracts/*Cb*boot*.test.*
  - apps/web/hrm/src/lib/contractCreateWizard.source.test.ts
forbidden_paths: full CTR rewrite; clause DnD redesign; template composer; seed; EmployeeCompensationPanel logic rewrite (CTA link OK)
spec_read_ack_required: true
code_memory_required: true
task:
  1) ContractCbReadOnlyCard states: RO | bootstrap | masked (cb_masked / AuthZ).
  2) Default Q-S2: two money inputs (base + si_base), vi-VN grouping; block Tiếp if empty/≤0.
  3) On Tiếp/Lưu (non registry-only): POST /api/hrm/contracts-insurance/compensation-packages with SA §3.3 body + effective_from map SA §4; then GET contract-create-context refresh; then persist contract WITHOUT salary SoT fields.
  4) Registry-only: skip bootstrap (Q-S4 default). UV employee_id null: no bootstrap.
  5) When RO with numbers: CTA «Mở C&B» profile link (Q-S1 default).
exit_criteria: READY_FOR_QA · evidence docs/qa/evidence/d-fe-ctr-cb-boot-01.md · J-HRM-CTR-CB-BOOT-01 click path
honesty: contracts_printable_ready=false · C-SLICE
```
