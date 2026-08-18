# Evidence — PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution · UC-BP-PAY-02 · FR-UC-BP-PAY-02 |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-38 seat #43) |
| **date** | 2026-08-10 |
| **depends_on** | API-01 CONFIRMED · BA-01 O1–O16 · must_keep `PAY01QC1-MSMBGWC1` |
| **ack_status** | **`READY_FOR_QA`** |
| **honesty** | **`payroll_e2e_ready=false`** · **C-SLICE** · **≠ PAY-02 / FR-UC-BP-PAY-02 module DONE** · **≠ PAY module UAT** |
| **U65** | zero-seed · browser FE only |
| **portal_url** | `http://127.0.0.1:5175/hr` embed hoặc CC `:8088` → Tiền lương |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-02 Diễn biến #0a–#3 · AC-PAY-COMP-01 · R-PAY-DD-01
- api: docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md §4.1–4.4 · §5 display-ready · §9 FE-01
- ba: docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md AC-PAY-02-* · J-HRM-PAY-02-01..08
- peer: docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md F-PAY-ATT-CLOSED-01 · PAY01QC1
- must_keep: PAY01QC1-MSMBGWC1 · ATT12QC1-MSMAIGWC1 · ATT11QC1-MSLXTH9P · payroll_e2e_ready=false
- sponsor_confirm: API-01 stamp 2026-08-10 · cluster FE-01 dispatch
```

**solid_convention_ack:** FE bind display-ready từ Nest; preview/process net chỉ từ BE `lines[]`; cấm DnD GĐ2; cấm `/api/hrm/core` formula SoT.

---

## 2. Closed scope (UPGRADE on GAP-FE-01 baseline)

| # | Exit (API-01 §9) | Status |
|---|------------------|--------|
| 1 | GĐ1 form author → POST/PUT draft 2xx + F5 (**J-HRM-PAY-02-02**) | **RETAIN** `PayFormulaAuthorPanel` |
| 2 | Dual publish U65: 403-DUAL · publisher 2xx active (**J-03**) | **RETAIN** toast + `hdsd-pay-formula-publish` |
| 3 | Preview POST 2xx · display `lines[]` only — no FE net math (**J-04**) | **ADD** `pay-formula-preview-lines-table` |
| 4 | COMP-01 picker-only when catalog non-empty (**J-06**) | **ADD** `assertComp01FormulaLines` block save |
| 5 | Catalog N+1 admin POST (**J-01**) | **RETAIN** `SalaryComponentsTab` open code CREATE |
| 6 | Physical `/api/hrm/payroll/formulas*` | **RETAIN** `hrmApi.ts` |

### Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/payroll/PayFormulaAuthorPanel.tsx` | COMP-01 hard block · preview lines table · CODE-MEMORY APPEND |
| `apps/web/hrm/src/lib/payFormulaCatalog.ts` | `normalizePayFormulaPreviewLines` |
| `apps/web/hrm/src/lib/salaryComponentCatalog.ts` | `collectAlienNestSalaryComponentCodes` · `comp01RejectMessageVi` |
| `apps/web/hrm/src/lib/apiError.ts` | `HRM-SC-COMP-KEY` friendly |
| `apps/web/hrm/src/pages/Payroll.tsx` | CODE-MEMORY APPEND |
| `apps/web/hrm/src/lib/poHrmMvpGd1Pay02ClusterFe01.source.test.ts` | source lock |
| `apps/web/hrm/src/lib/payFormulaCatalog.test.ts` | preview normalize test |
| `apps/web/hrm/src/lib/salaryComponentCatalog.test.ts` | COMP-01 test |

**Cấm / not done:** GĐ2 DnD · FE net SoT · seed · flip `payroll_e2e_ready` · claim PAY-02 DONE.

---

## 3. Route + click path (QA — U65)

| Step | Action |
|------|--------|
| 0 | `ceo@xe.vn` / `Xevn@2026` · scope `company_id=main` |
| 1 | Tiền lương → tab **Công thức lương** (`payroll-tab-formulas`) |
| 2 | Badge `pay-formula-honesty-badge` · `payroll_e2e_ready=false` |
| 3 | (J-01) Tab **Thành phần lương** → Thêm mã mới (open N+1) → POST `/api/hrm/payroll/salary-components` **2xx** |
| 4 | (J-02) Form: mã + nhãn + DV-18 + dòng TP từ **picker** → **Lưu bản nháp** → POST `/api/hrm/payroll/formulas` **2xx** · F5 list |
| 5 | (J-03) **Gửi phát hành** → `pending_publish` · cùng user **Phát hành** → **403** `HRM-PAY-FORMULA-403-DUAL` |
| 6 | (J-03) User khác (vd. `admin@xe.vn`) **Phát hành** → **2xx** `active` · immutable banner |
| 7 | (J-04) **Xem trước (Nest)** → POST `…/preview` **2xx** hoặc **412** honest · bảng `pay-formula-preview-lines-table` nếu có `lines[]` |
| 8 | (J-06) Khi catalog >0: đổi mã TP ngoài picker → **Lưu** bị chặn toast AC-PAY-COMP-01 (không POST) |
| 9 | Network: **0** calls `/api/hrm/core/*` cho formula/preview |

**HDSD inventory (U76):** `payroll-tab-formulas` · `hdsd-pay-formula-*` · `pay-formula-preview-lines-table` · `pay-formula-list-table`

**Regression (must_keep):** J-HRM-PAY-01-* sealed · không demote PAY01QC1.

---

## 4. Verify (agent)

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/payFormulaCatalog.test.ts \
  src/lib/salaryComponentCatalog.test.ts \
  src/lib/poHrmMvpGd1Pay02ClusterFe01.source.test.ts
```

---

## 5. completion_report

- **Closed:** PAY-02 cluster FE GAP on existing GĐ1 author panel — dual publish UX retained; preview `lines[]` vi-VN table; AC-PAY-COMP-01 FE block when Nest catalog >0; source lock + vitest; CODE-MEMORY APPEND; evidence path.
- **Residual:** QA U65 J-HRM-PAY-02-01..08 browser matrix; BE-01 COMP assert all surfaces; process AC J-05 after closed bind; **≠ PAY-02 DONE** · `payroll_e2e_ready=false`.

## 6. next_owner

`qa`

---

## Footer — honesty

> **honesty:** `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-02 / FR-UC-BP-PAY-02 module DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT**  
> must_keep **PAY01QC1-MSMBGWC1** · **F-PAY-ATT-CLOSED-01** · DENY FE net SoT · DENY GĐ1 DnD · no seed
