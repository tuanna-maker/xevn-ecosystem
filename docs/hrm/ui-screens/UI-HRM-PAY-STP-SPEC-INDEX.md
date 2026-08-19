# UI-HRM-PAY-STP-SPEC-INDEX — Master index · Thiết lập lương (L1–L6)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-UI-SCREEN-01` |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **sponsor_confirm** | 2026-08-11 — ADD-only `UC-BP-PAY-STP-01..12` |
| **honesty** | `payroll_e2e_ready=false` · Thiết lập ≠ UAT lập kỳ · **C-SLICE-≠-MODULE** |
| **ref_guide** | `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md` |
| **ref_pipeline** | `docs/program/PM_PO_DELIVERY_PIPELINE_UIUX.md` |
| **ref_sa** | `docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md` §2 L1–L6 |
| **ref_api** | `docs/program/specs/PO-HRM-PAY-CNTT-API-01.md` · `docs/hrm/API_DESIGN_HRM_PAYROLL.md` CNTT APPEND |
| **no_prompt_echo** | true |

---

## 1. Mục đích index

Bản đồ **layer L1–L6 → màn → UC STP → API → component FE → journey** để Dev-FE implement Thiết lập lương không đoán; QA bind matrix browser U65 (Lưu 2xx → FE → F5).

**Menu (VI):** Lương → **Thiết lập lương** (cluster mới — tách **Lập bảng lương** runtime FR-UC-BP-PAY-06).

---

## 2. Layer map L1–L6

| Layer | Entity / API | UC STP | Screen ID | UI spec |
|-------|--------------|--------|-----------|---------|
| **L1** | `salary_components` · F-PLT-PAY-COMP-* | STP-07 · STP-08 | **STP-COMP-CATALOG** | [`UI-HRM-PAY-STP-COMP-CATALOG.md`](./UI-HRM-PAY-STP-COMP-CATALOG.md) |
| **L2** | `pay_formula_definitions` · F-PAY-FORMULA-* | — (eval **HOLD**) | — | Hub cross-link only — **không** mutate spec GĐ1 |
| **L3** | `pay_sheet_templates` · F-PAY-SHEET-TPL-* | STP-10 · STP-11 | **STP-SHEET-TEMPLATE** | [`UI-HRM-PAY-STP-SHEET-TEMPLATE.md`](./UI-HRM-PAY-STP-SHEET-TEMPLATE.md) |
| **L4** | `pay_policy_pack` · F-PAY-POLICY-PACK-* | STP-01..06 | **STP-POLICY-PACK** | [`UI-HRM-PAY-STP-POLICY-PACK.md`](./UI-HRM-PAY-STP-POLICY-PACK.md) |
| **L5** | `pay_input_pack_profile` · F-PAY-INPUT-PROFILE-* | STP-12 | **STP-INPUT-PROFILE** | [`UI-HRM-PAY-STP-INPUT-PROFILE.md`](./UI-HRM-PAY-STP-INPUT-PROFILE.md) |
| **L6** | Template FK + resolve | STP-02 · 10 · 11 · 12 | **STP-SHEET-TEMPLATE** · **STP-SETUP-RESOLVE** | Sheet §4.4 bind · [`UI-HRM-PAY-STP-SETUP-RESOLVE.md`](./UI-HRM-PAY-STP-SETUP-RESOLVE.md) |
| **Hub** | Navigation + honesty | STP-01..12 spine | **STP-HUB** | [`UI-HRM-PAY-STP-HUB.md`](./UI-HRM-PAY-STP-HUB.md) |
| **Runtime setup** | `payroll_groups` (Thiết lập UI) | STP-09 | **STP-GROUP** | [`UI-HRM-PAY-STP-GROUP.md`](./UI-HRM-PAY-STP-GROUP.md) |

---

## 3. Ma trận màn hình (runtime Thiết lập)

| Screen ID | Route / entry | UI spec | UC / FR | API chính | Component FE target | Journey |
|-----------|---------------|---------|---------|-----------|---------------------|---------|
| **STP-HUB** | `/hr/payroll/setup` · embed `?portal=1&companyId=main` | HUB | Spine STP-01..12 | — (nav only) | `PayrollSetupHub` | J-HRM-PAY-STP-NAV-01 |
| **STP-POLICY-PACK** | Hub → «Gói chính sách» | POLICY-PACK | STP-01..06 | `GET/POST/PATCH /pay-policy-packs` · archive | `PayPolicyPackList` · `PayPolicyPackDetail` | J-HRM-PAY-STP-01..06 |
| **STP-COMP-CATALOG** | Hub → «Danh mục TP» | COMP-CATALOG | STP-07 · STP-08 | F-PLT-PAY-COMP-* · fragment map read | `PayComponentCatalogPanel` · `PayFragmentMapDrawer` | J-HRM-PAY-STP-07..08 |
| **STP-GROUP** | Hub → «Nhóm lương» | GROUP | STP-09 · FR-UC-BP-PAY-09 | Payroll group CRUD (cite cluster API) | `PayrollSetupGroupPanel` | J-HRM-PAY-STP-09 |
| **STP-SHEET-TEMPLATE** | Hub → «Mẫu bảng lương» | SHEET-TEMPLATE | STP-10 · STP-11 | `/pay-sheet-templates*` · lines PUT | `PaySheetTemplateList` · `PaySheetTemplateEditor` | J-HRM-PAY-STP-10..11 |
| **STP-INPUT-PROFILE** | Hub → «Profile nhập liệu» | INPUT-PROFILE | STP-12 | `/pay-input-pack-profiles*` | `PayInputPackProfileList` · `PayInputPackProfileForm` | J-HRM-PAY-STP-12 |
| **STP-SETUP-RESOLVE** | Hub panel · period form helper | SETUP-RESOLVE | STP-10/11 · AC-CNTT-SETUP-* | `GET /pay-setup/resolve` | `PaySetupResolvePanel` (read-only) | J-HRM-PAY-STP-RESOLVE-01 |

**Cấm:** hardcode `if (bp==='DPHH')` trên UI — picker metadata (`AC-PAY-STP-GLOBAL-03`).

---

## 4. Trace matrix — STP-01..12 → screen → endpoint

| STP | UC-ID | Screen ID | Primary API (METHOD path) | SRS AC (U65) |
|-----|-------|-----------|---------------------------|--------------|
| **01** | UC-BP-PAY-STP-01 | STP-POLICY-PACK | `POST/PATCH /api/hrm/payroll/pay-policy-packs` (`scope=CHUNG`) | AC-PAY-STP-01 · AC-PAY-STP-GLOBAL-01 |
| **02** | UC-BP-PAY-STP-02 | STP-POLICY-PACK | `POST/PATCH /pay-policy-packs` (`scope=RIENG`) | AC-PAY-STP-02 · AC-PAY-STP-GLOBAL-02 |
| **03** | UC-BP-PAY-STP-03 | STP-POLICY-PACK | `PATCH …/pay-policy-packs/:id` (`rateParams`) | AC-PAY-STP-GLOBAL-01 |
| **04** | UC-BP-PAY-STP-04 | STP-POLICY-PACK | `PATCH …/pay-policy-packs/:id` (`rateParams` BCC_STD) | AC-PAY-STP-GLOBAL-01 |
| **05** | UC-BP-PAY-STP-05 | STP-POLICY-PACK | `PATCH …/pay-policy-packs/:id` (geo/tuyến in `rateParams`) | AC-PAY-STP-GLOBAL-02 |
| **06** | UC-BP-PAY-STP-06 | STP-POLICY-PACK | `PATCH …/pay-policy-packs/:id` (VP allowance/cost) | AC-PAY-STP-GLOBAL-01 |
| **07** | UC-BP-PAY-STP-07 | STP-COMP-CATALOG | F-PLT-PAY-COMP-* `/salary-components*` | AC-PAY-COMP-01 |
| **08** | UC-BP-PAY-STP-08 | STP-COMP-CATALOG | Fragment map → `POST` component (confirm) | BR-PAY-STP-04 |
| **09** | UC-BP-PAY-STP-09 | STP-GROUP | Payroll group catalog CRUD | BR-BP-PAY-GRP-01 |
| **10** | UC-BP-PAY-STP-10 | STP-SHEET-TEMPLATE | `POST/PATCH /pay-sheet-templates` · `PUT …/lines` | AC-PAY-TPL-01..03 · AC-PAY-STP-03 |
| **11** | UC-BP-PAY-STP-11 | STP-SHEET-TEMPLATE | Multi header + `businessLineTag` applicability | AC-PAY-STP-05 |
| **12** | UC-BP-PAY-STP-12 | STP-INPUT-PROFILE | `POST/PATCH /pay-input-pack-profiles` | AC-PAY-STP-04 · AC-CNTT-SETUP-04 |

**L6 bind (cross-screen):** STP-SHEET-TEMPLATE §4.4 — `policyPackId` · `inputPackProfileId` · `businessLineTag` on `PATCH /pay-sheet-templates/:id`.

---

## 5. Component map (SOLID — Dev-FE target)

| Component / hook | Trách nhiệm | Layer | Spec § |
|------------------|-------------|-------|--------|
| `PayrollSetupHub` | Nav L1–L6 · honesty banner · company scope | Hub | HUB §3 |
| `PayPolicyPackList` | List + filter CHUNG/RIÊNG/BP tag | L4 | POLICY §4.1 |
| `PayPolicyPackDetail` | Form pack + `rateParams` grid + doc refs | L4 | POLICY §4.2 |
| `PayComponentCatalogPanel` | Catalog TP CRUD picker SoT | L1 | COMP §4.1 |
| `PayFragmentMapDrawer` | Fragment → đề xuất mã (STP-08) | L1 | COMP §4.2 |
| `PaySheetTemplateList` | List mẫu + filter tag/FK | L3 | TEMPLATE §4.1 |
| `PaySheetTemplateEditor` | Header + lines grid + FK bind | L3+L6 | TEMPLATE §4.2–4.4 |
| `PayInputPackProfileList` | Profile list | L5 | INPUT §4.1 |
| `PayInputPackProfileForm` | `allowedSourceKinds` + required codes | L5 | INPUT §4.2 |
| `PaySetupResolvePanel` | Read-only resolve preview | L6 | RESOLVE §4 |
| `PayrollSetupGroupPanel` | Nhóm lương Thiết lập (≠ runtime only) | STP-09 | GROUP §4 |
| `usePaySetupResolve` | Hook `GET /pay-setup/resolve` | L6 | RESOLVE §5 |

**Cấm:** FE formula eval · FE nested write DTO · mock chart SoT (`28-FE-BE-SEPARATION`).

---

## 6. Testid registry (Thiết lập P0)

| testid | Vùng | Screen |
|--------|------|--------|
| `pay-stp-hub-root` | Hub shell | STP-HUB |
| `pay-stp-nav-policy` | Nav item | STP-HUB |
| `pay-stp-nav-components` | Nav item | STP-HUB |
| `pay-stp-nav-templates` | Nav item | STP-HUB |
| `pay-stp-nav-input-profile` | Nav item | STP-HUB |
| `pay-stp-nav-groups` | Nav item | STP-HUB |
| `pay-stp-honesty-banner` | `payroll_e2e_ready=false` | STP-HUB |
| `pay-policy-pack-list` | Bảng pack | STP-POLICY-PACK |
| `pay-policy-pack-scope-chung` | Filter/tab CHUNG | STP-POLICY-PACK |
| `pay-policy-pack-scope-rieng` | Filter/tab RIÊNG | STP-POLICY-PACK |
| `pay-policy-pack-save` | Lưu pack | STP-POLICY-PACK |
| `pay-comp-catalog-list` | Bảng TP | STP-COMP-CATALOG |
| `pay-comp-add-btn` | Thêm TP | STP-COMP-CATALOG |
| `pay-fragment-map-drawer` | STP-08 drawer | STP-COMP-CATALOG |
| `pay-sheet-tpl-list` | Bảng mẫu | STP-SHEET-TEMPLATE |
| `pay-sheet-tpl-editor` | Editor shell | STP-SHEET-TEMPLATE |
| `pay-sheet-tpl-col-picker` | Picker `component_code` | STP-SHEET-TEMPLATE |
| `pay-sheet-tpl-bind-policy` | Select policy pack | STP-SHEET-TEMPLATE |
| `pay-sheet-tpl-bind-profile` | Select input profile | STP-SHEET-TEMPLATE |
| `pay-input-profile-list` | Bảng profile | STP-INPUT-PROFILE |
| `pay-input-profile-kinds` | Multi-select kinds | STP-INPUT-PROFILE |
| `pay-setup-resolve-panel` | Resolve preview | STP-SETUP-RESOLVE |
| `pay-stp-group-list` | Nhóm lương | STP-GROUP |

**Locale:** ngày `dd/MM/yyyy` · tiền thousand group `vi-VN` · KPI/% exempt thousand group.

---

## 7. Handoff

| Role | Đọc trước code | Exit |
|------|----------------|------|
| **dev-fe** | INDEX + screen specs theo slice dispatch | `PO-HRM-PAY-CNTT-FE-STP-01` (post BE READY_FOR_QA) |
| **qa** | AC §7 mỗi spec + matrix §4 | UF STP browser U65 · `AC-PAY-STP-*` |
| **sa** | Layer §2 · L6 FK parity | Exception PAT nếu dialog nặng CC |

---

## 8. Honesty stamp

`payroll_e2e_ready=false` — Thiết lập paper+SRS ≠ chạy kỳ U65; formula evaluator **HOLD** (L2); PROCESS amounts **không** LIVE; **không** claim module Lương UAT DONE.
