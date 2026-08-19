# Phase 1 — UC closure backlog (U0 inventory)

| Meta | Value |
|------|--------|
| **work_item_id** | `BA-PHASE1-UC-CLOSURE-INVENTORY-01` |
| **Generated** | 2026-08-10 |
| **Gate** | `pnpm phase1:gate` exit **0** → `docs/qa/PHASE1_GATE_REPORT.md` |
| **Matrix SoT** | `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` |
| **Program** | `docs/program/PHASE1_UC_CLOSURE_PARALLEL_PROGRAM.md` |
| **ack_status** | `PASS_TO_PM` |

---

## 1. Methodology

| Bước | Nguồn | Kết quả |
|------|--------|---------|
| Gate | `node scripts/phase1-gate-check.mjs` | `impl_status`: **244** `e2e_pass` · **1** `waived` · **1** `planned` · **245** rows |
| Quét `planned` / `be` / `partial` | `rg` cột `impl_status` trên matrix | Chỉ **1** `planned` · **0** `be` · **0** `partial` |
| P0 sponsor (song song SOLID) | `PHASE1_UC_CLOSURE_PARALLEL_PROGRAM.md` §3–4 · `PROGRAM_JOURNEY_MAP.md` (⬜ DRAFT) · specs BA Settings/CTR/PAY | Hàng **fidelity** — matrix vẫn `e2e_pass` nhưng AC SRS / J-* chưa PASS (honesty flags) |
| Cấm bịa UC | Chỉ mã có trong matrix hoặc SRS (`docs/hrm/SRS.md` · `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md`) | Không thêm mã ngoài catalog |

**Đọc lại snapshot cũ:** `PHASE1_UC_CLOSURE_PARALLEL_PROGRAM.md` ghi «~63+ planned» — **lệch** so với matrix regenerate 2026-08-10. SoT đóng UC theo **matrix + gate**, không theo snapshot program cũ.

**Định nghĩa cột `status`:**

| Giá trị | Ý nghĩa |
|---------|---------|
| `planned` | Matrix `impl_status` — chưa `e2e_pass` |
| `waived` | Matrix `waived` — PM/QC owner+expiry |
| `e2e_pass · fidelity_P0` | Matrix pass jest/capability; chương trình sponsor vẫn mở (Settings/CTR/PAY/J-*) |

---

## 2. Matrix — hàng chưa `e2e_pass`

| UC id | Module | status | spec_ref (SRS / TS) | Wave | Owner lane | Blocker | next work_item hint |
|-------|--------|--------|---------------------|------|------------|---------|---------------------|
| `UC-HRM-CO-01` | HRM embed — Quản lý công ty | **planned** (headcount **UAT slice 🟢** `COHCQA1-MSNFXBJS`) | `docs/hrm/SRS.md` UC-HRM-CO-01 · FR-HRM-CO-HC-01 · FR-HRM-CO-IND-01 · AC-CO-EMP-* · AC-CO-IND-* | **U2** | dev-fe + qa | **Residual:** industry `business_lines` / dictionary · matrix `planned` until PM promote + industry QA | Headcount closed: `QA-HRM-CO-01-HEADCOUNT-01` · open: `D-HRM-CO-01-INDUSTRY-FE-01` QA if needed |
| `UC-HRM-27` | HRM embed — Quyết định & báo cáo | **waived** | `docs/hrm/SRS.md` (embed backlog) · TECHSPEC_HE §9.3 pattern | **U6** | pm + fe | **spec** — backlog scope; không burn trừ PM mở waiver | Giữ waiver; không dispatch Dev |

---

## 3. P0 — Settings fidelity (matrix anchor + SRS §16)

| UC id | Module | status | spec_ref (SRS / TS) | Wave | Owner lane | Blocker | next work_item hint |
|-------|--------|--------|---------------------|------|------------|---------|---------------------|
| `HRM-SC-02` | Settings — đồng bộ catalog XBOS | e2e_pass · fidelity_P0 | SRS §16 · UF-HRM-10 · `API_DESIGN_HRM_SETTINGS_CATALOG.md` · delta `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` tab `catalogs` | **U1** | dev-fe + ba-data | **FE/spine** — consumer matrix O4; `settings_catalog_e2e_ready=false` | `PO-HRM-SETTINGS-CATALOG-CONSUMER-FE-01` |
| `HRM-SC-03` | Settings — W3 P0 mutate | e2e_pass · **C-SLICE 🟢** `SETW3MUTQC1-MSNHB5QC1` | W3 P0 8 tabs | **U1** | pm | 18-tab sweep · console-500 P2 | seal `PM-PO-HRM-SETTINGS-W3-MUTATE-SEAL-01.md` |
| *(SRS)* `FR-UC-BP-REC-00` | Settings — thư viện JD master (orphan tab) | e2e_pass · fidelity_P0 | `docs/hrm/SRS.md` FR-UC-BP-REC-00 · FR-HRM-SC-JT-01 · delta C-ORPHAN `jd-master-list` | **U1** | dev-fe | **FE/spec** — không có tab trong `settingsNavigation.ts` | `PO-HRM-SETTINGS-JD-MASTER-LIST-FE-01` |
| *(SRS)* `FR-UC-BP-CORE-09d` | Settings — mẫu HĐ + composer | e2e_pass · fidelity_P0 | SRS FR-09d · PAT-CTR-TEMPLATE-COMPOSER-01 · `UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md` | **U1** | dev-fe | **FE** — dialog rỗng; DnD tách khỏi dialog | `PO-HRM-SETTINGS-CTR-TPL-COMPOSER-FE-01` |
| `HRM-SC-01` | Settings — ATT LVT dual SoT | e2e_pass · **C-SLICE 🟢** `ATTLVTSOTQC1-MSNGQC01` | FR-HRM-SC-SET-UI-01 dual SoT | **U1** | pm | Full Settings UAT / portal tabs **open** | SETFID / W3 sweep · `PO-HRM-SETTINGS-PORTAL-TABS-FE-02` defer |
| `HRM-SC-01` | Settings — portal tabs mock | e2e_pass · fidelity_P0 | SRS §16 account/branding/security/system | **U1** | dev-fe | **FE** — C-SPEC-SHALLOW (no API) | `PO-HRM-SETTINGS-PORTAL-TABS-FE-02` (defer sau P0 contract/JD) |

---

## 4. P0 — CTR create / CORE-09 (matrix + journey)

| UC id | Module | status | spec_ref (SRS / TS) | Wave | Owner lane | Blocker | next work_item hint |
|-------|--------|--------|---------------------|------|------------|---------|---------------------|
| `HRM-CI-01` | Tạo hợp đồng LĐ | e2e_pass · fidelity_P0 | `PO-HRM-CTR-CREATE-REDESIGN-BA-02` · AC-CTR-UX-01..07 · J-HRM-CTR-CREATE-01..08 DRAFT · `contracts_printable_ready=false` | **U2** | dev-fe + dev-be | **FE/QA** — CC viewport; UV picker; 2-step; DnD Gỡ; scope parity | `HRM-CTR-CREATE-REDESIGN-FE-BE-02` |
| `HRM-CI-01` | Inline UV picker (portal) | e2e_pass · fidelity_P0 | BA-02 SUBJECT-01..03 · G-CTR-SUBJ-01 | **U2** | dev-fe → **qa** | **QA/U65** — thiếu TPL+UV từ FE path | `HRM-CTR-PICKER-INLINE-PORTAL-01` · `HRM-CTR-PICKER-INLINE-PORTAL-01-RETEST-DND` |
| `UC-HRM-25` | Embed HĐ & BH | e2e_pass · fidelity_P0 | J-HRM-CTR-04..07 · J-HRM-CORE-09D-01..04 ⬜ DRAFT · FR-UC-BP-CORE-09d | **U2** | dev-fe + qa | **QA** — template matrix / preview ≠ printable UAT | `QA-HRM-CTR-CORE-09D-SLICE-01` (sau FE-02) |

---

## 5. P0 — Payroll cluster (SRS enterprise UC; matrix `HRM-PR-*`)

| UC id | Module | status | spec_ref (SRS / TS) | Wave | Owner lane | Blocker | next work_item hint |
|-------|--------|--------|---------------------|------|------------|---------|---------------------|
| `UC-BP-PAY-09` | Phân nhóm bảng lương (SRS) | e2e_pass · fidelity_P0 | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-PAY-09 · `PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01` · F-PAY-GROUP-01 GAP · matrix peer `HRM-PR-03` | **U2** | dev-be → qa | **BE/data** — `pay_payroll_group`; FAIL QA bus | `HRM-MVP-GD1-PAY-09-CLUSTER-01` · `PO-HRM-MVP-GD1-PAY-09-DATA-01` (ba-data) |
| `UC-BP-PAY-08` | Vòng đời phiếu lương | e2e_pass · fidelity_P0 | FR-UC-BP-PAY-08 · BA-01 sealed · `HRM-PR-05` | **U2** | dev-be + qa | **BE** — publish/void/ESS; `payroll_e2e_ready=false` | `HRM-MVP-GD1-PAY-08-CLUSTER-BE-01` (nếu QA residual mở) |
| `UC-BP-PAY-06` | Chạy kỳ + TNCN | e2e_pass · fidelity_P0 | FR-UC-BP-PAY-06 · `HRM-PR-03` | **U2** | qa | **QA** — J-HRM-PAY-06 DRAFT U65 | `HRM-MVP-GD1-PAY-06-CLUSTER-QA-01` |
| `HRM-PR-01`..`HRM-PR-06` | Payroll spine (matrix) | e2e_pass · fidelity_P0 | GD1 PAY-01..09 clusters · RETAIN PAY01QC1..PAY08QC1 order | **U2** | qa + qc | **QA** — C-SLICE ≠ module UAT | Burn theo cluster QC residual; không reorder pipeline |

---

## 6. P0 — HRM spine / journey ⬜ DRAFT (rút gọn — map UC matrix)

| UC id | Module | status | spec_ref (SRS / TS) | Wave | Owner lane | Blocker | next work_item hint |
|-------|--------|--------|---------------------|------|------------|---------|---------------------|
| `UC-HRM-22` | Embed — Tuyển dụng | e2e_pass · fidelity_P0 | J-HRM-REC-HC-01..02b · REC-JD-00-01..04 ⬜ · `recruitment_uat_ready=false` | **U2** | dev-be + dev-fe | **data/API** — Dev HOLD DATA | `PO-HRM-MVP-GD1-REC-01-BE-01` (sau DATA) |
| `UC-HRM-21` | Embed — Nhân sự | e2e_pass · fidelity_P0 | J-HRM-CORE-02-01..04 · CORE-08 · CORE-05 ⬜ DRAFT | **U2** | dev-be + ba-data | **spec/BE** — C&B AuthZ; Nest `/core` dual | `PO-HRM-MVP-GD1-CORE-02-DATA-01` |
| `UC-HRM-23` | Embed — Chấm công | e2e_pass · fidelity_P0 | ATT clusters sealed + consumer gaps | **U2** | qa | **QA** — L2.5 attendance UF | `QA-HRM-ATT-SPINE-REGRESS-01` |
| `UC-HRM-24` | Embed — Lương | e2e_pass · fidelity_P0 | PAY GD1 J-* DRAFT · §5 trên | **U2** | dev-be + qa | **BE/QA** | Xem §5 |
| `UC-HRM-MOB-03`..`05` | Mobile | e2e_pass · fidelity_P0 | `PROGRAM_JOURNEY_MAP.md` J-MOB-* FAIL history | **U4** | dev-mobile + qa-device | **FE/mobile** — header scope `main` | `P1-P100-W10-MOB-HEADER-02` |
| *(journey)* `J-HRM-MENU-SWEEP` | Full sidebar 17 leaf | e2e_pass · fidelity_P0 | UF-HRM-MENU-01..17 | **U2** | qa + qc | **QA** — Dev8088 ⬜ | `QA-HRM-MENU-SWEEP-R3-01` |

---

## 7. Wave rollup (U1–U6)

| Wave | Mở (từ backlog) | Exit gợi ý |
|------|-----------------|------------|
| **U0** | Inventory (file này) | PM dispatch top 8 WI |
| **U1** | Settings P0 (§3) | `PO-HRM-SETTINGS-FIDELITY-QA-02` PASS slice |
| **U2** | CO-01 · CTR · PAY · REC/CORE embed (§4–6) | J-* DRAFT → 🟢; `UC-HRM-CO-01` → `e2e_pass` |
| **U3** | (Matrix XBOS đã e2e_pass) | Chỉ regression + capability smoke |
| **U4** | MOB J-* | qa-device evidence |
| **U5** | Catalog 183 / fidelity data | FE path only (U65) |
| **U6** | `UC-HRM-27` waiver + QC Phase 1 | `phase1:gate --strict` khi PM bật |

---

## 8. Top 8 execution work items (PM dispatch — copy-ready)

| # | work_item_id | Lane | Entry ngắn |
|---|--------------|------|------------|
| 1 | `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` | dev-fe | P0 tabs ATT/EMP/SI catalog mutate · `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` · solid_convention_ack |
| 2 | `PO-HRM-SETTINGS-FIDELITY-QA-02` | qa | Sau #1 · UF-HRM-10 · JD + ctr tpl · U65 FE→2xx→F5 |
| 3 | `HRM-CTR-CREATE-REDESIGN-FE-BE-02` | dev-fe + dev-be | `HRM-CI-01` · BA-02 AC-CTR-UX-06/07 · scope parity · allowed_paths slice |
| 4 | `HRM-CTR-PICKER-INLINE-PORTAL-01-RETEST-DND` | qa | U65 · không seed · DND Gỡ confirm · evidence `po-hrm-ctr-create-*` |
| 5 | `HRM-MVP-GD1-PAY-09-CLUSTER-01` | dev-be | `UC-BP-PAY-09` · F-PAY-GROUP-01 · sau `PAY-09-DATA-01` nếu thiếu bảng |
| 6 | `PO-HRM-MVP-GD1-PAY-09-DATA-01` | ba-data | `pay_payroll_group` · DB_DESIGN §5.5 · unlock BE #5 |
| 7 | `D-HRM-CO-01-INDUSTRY-FE-01` | dev-fe | `UC-HRM-CO-01` planned · FR-HRM-CO-IND-01 · promote matrix |
| 8 | `PO-HRM-SETTINGS-CTR-TPL-COMPOSER-FE-01` | dev-fe | FR-09d · PAT-CTR-TEMPLATE-COMPOSER-01 · dialog composer P0 |

**Song song SOLID:** mọi Dev dispatch kèm `docs/program/knowledge/DEV_SOLID_AND_OS_CONVENTION_ENFORCEMENT.md` + `@CODE-MEMORY` APPEND.

---

## 9. Residual / PM notes

- Matrix **244/245** `e2e_pass` — closure sponsor shift sang **fidelity + J-*** + **1** UC `planned`.
- Regenerate matrix sau promote `UC-HRM-CO-01`: `pnpm docs:phase1:matrix`.
- Cập nhật `PHASE1_UC_CLOSURE_PARALLEL_PROGRAM.md` §1 snapshot (63 planned) → tránh PM scan sai.
- Không claim Phase 1 DONE / PROD — `PHASE1_PMP_PROJECT_PLAN.md` G1 + QC S5.

**evidence_path:** `docs/program/PHASE1_UC_CLOSURE_BACKLOG.md` · gate: `docs/qa/PHASE1_GATE_REPORT.md`
