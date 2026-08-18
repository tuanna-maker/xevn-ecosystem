# QA — QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01` |
| **parent** | `PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-12 |
| **ack_status** | **`FAIL_TO_PM`** |
| **stamp** | **`PAYPPQA-MSPX1M4T`** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **commit** | `5ccb26e` (workspace HEAD at run; FE POLICY-PACK slice uncommitted vs claim) |
| **u65** | zero-seed · browser-only · **no** `pnpm seed:*` · **no** DB write |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · **≠** UF-HRM-10 · **≠** RIÊNG/STP-02/05/06 DONE |

---

## L0 / unit

| Gate | Result |
|------|--------|
| `pnpm run qc:fe-be-health` | **exit 0** (portal `:5173` · hrm-api `:28001` · xbos `:28002`) |
| Portal `:5173` / HRM FE `:8080` | both **HTTP 200** |
| vitest PolicyPack + Hub (re-run QA) | **7 failed / 13 passed (20)** — FE handoff «20 passed» **INVALID** vs current `PolicyPackSetupScreen.tsx` |

---

## Modes (U65)

| Mode | URL | Hub + list | Verdict |
|------|-----|------------|---------|
| **portal embed** | `http://127.0.0.1:5173/hr/payroll/setup?portal=1&tenantId=xevn&companyId=main&section=policy-pack` | `pay-stp-hub-root` + `pay-policy-pack-list` · honesty banner | **NAV PASS** · AC mutate **FAIL** |
| **standalone** | `http://127.0.0.1:8080/hr/payroll/setup?section=policy-pack&companyId=main&tenantId=xevn` | same | **NAV PASS** · AC mutate **FAIL** |

Click path (both): Login inject ceo@ → `/hr/payroll/setup` → nav **Gói chính sách** (`pay-stp-nav-policy-pack`) → `pay-policy-pack-list`.

---

## AC matrix (exit criteria)

| AC | Click path | Network | FE sau 2xx | F5 | Verdict |
|----|------------|---------|------------|-----|---------|
| **AC-PAY-STP-01-01** tạo CHUNG | `+ Thêm gói` | **NONE** (no POST) | dashed empty: «Chọn một gói…» — **không mở form tạo** | N/A | 🔴 **FAIL** |
| **AC-PAY-STP-01-02** PATCH KPI+BCC | row → edit → Cập nhật | **no PATCH** observed | form open but wire broken (see defects) | kpi empty after attempt | 🔴 **FAIL** |
| **AC-PAY-STP-01-03** Archive | row → `pay-policy-pack-archive` | **POST …/archive → 201** (portal + standalone) | row ẩn list mặc định | còn ẩn | 🟢 **PASS** (narrow — trên pack **đã có**) |
| **AC-PAY-STP-01-05** ngày sai thứ tự | fill from/to → Cập nhật | **NONE** | **không** message «Hiệu lực đến phải sau hiệu lực từ» | N/A | 🔴 **FAIL** |
| **AC-PAY-STP-03-01** KPI=150 | KPI → Cập nhật | **NONE** | **không** viền đỏ + message VI | N/A | 🔴 **FAIL** |
| **AC-PAY-STP-04-01** BCC 5000000 | BCC → Cập nhật | **no PATCH** / body N/A | display **không** `5.000.000` · testid `pay-params-bcc-std` **ABSENT** | N/A | 🔴 **FAIL** |

### testid registry

| testid | Live |
|--------|------|
| `pay-policy-pack-list` | 🟢 present |
| `pay-policy-pack-save` | 🟡 only on **edit** form (not create) |
| `pay-policy-pack-archive` | 🟢 works (archive 201) |
| `pay-params-kpi-threshold` | 🟢 present on edit |
| `pay-params-bcc-std` | 🔴 **missing** (label BCC_STD only) |
| `pay-policy-pack-row-{code}` | 🔴 live = `pay-policy-pack-row` (no code suffix) |

---

## Defects (root cause — code vs AC)

| ID | Sev | Finding |
|----|-----|---------|
| **DEF-PAY-STP-CREATE-FORM-MISSING** | **P0** | `PolicyPackSetupScreen` renders detail **only when `editingId`** — `+ Thêm gói` / `startCreate` sets `editingId=null` → dashed empty. **Không thể POST tạo** từ FE. Screenshot: `portal-02-after-add.png`. |
| **DEF-PAY-STP-DATE-ONCHANGE** | **P0** | `ViDateField` / `ViDateInput` require **`onValueChange`**; screen passes **`onChange`**. Date edits không commit ISO → AC-01-05 không fire validation. Console: `allowEmpty` DOM warning. |
| **DEF-PAY-STP-BCC-ONCHANGE** | **P0** | `ViMoneyInput` require **`onValueChange`**; screen passes **`onChange`** (overwrites internal handler via rest spread). BCC không nhóm nghìn / không bind number. |
| **DEF-PAY-STP-BCC-TESTID-MISSING** | **P1** | Missing `data-testid="pay-params-bcc-std"`. |
| **DEF-PAY-STP-KPI-TYPE** | **P0** | KPI `Input type=number` writes **Number** into form; `validatePolicyPackForm` calls `.trim()` on string → submit path breaks → AC-03-01 message không hiện. |
| **DEF-PAY-STP-STATUS-LABEL** | **P1** | UI uses `statusLabelVi[s]` but export is a **function** — status dropdown blank on screenshot. Should use `POLICY_PACK_STATUS_LABEL_VI`. |
| **DEF-PAY-STP-VITEST-STALE** | **P1** | Screen tests expect always-on create form / `Lưu gói chính sách` / `pay-policy-pack-row-POL_CHUNG_2A` — **7 FAIL** vs live UI. FE READY_FOR_QA «vitest 20 PASS» not reproducible. |

---

## Side effect note (honesty)

Archive PASS exercised **existing** CHUNG rows (create blocked):

- Portal: `POST …/8b92a488-…/archive` **201**
- Standalone: `POST …/ac6adc61-…/archive` **201**

Không seed. Không claim pack mới tạo. PM/Dev retest nên dùng pack smoke còn lại hoặc restore archived nếu cần density.

---

## Artifacts

| Artifact | Path |
|----------|------|
| Evidence (this) | `docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md` |
| Runtime JSON | `docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.json` |
| Screens | `docs/qa/evidence/screens/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01/` |
| Harness | `scripts/qa/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.mjs` |
| FE handoff | `docs/qa/evidence/po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md` |
| BE GWC (ref) | `docs/qa/evidence/qc-po-hrm-pay-cntt-be-01.md` · CNTTBEQC1-MSO8HVERQC1 |

---

## Verdict

**FAIL_TO_PM** — Nav hub + list + archive narrow PASS; **create / PATCH / KPI / date / BCC locale FAIL** on both portal + standalone. Residual FE RIÊNG/STP-02/05/06 **not claimed**. `payroll_e2e_ready=false` retained.

---

## completion_report

**Closed:** L0 PASS; U65 browser both modes; NAV hub→Gói chính sách; AC-PAY-STP-01-03 archive POST 201 + F5 hide; defect pack with code-level root causes; vitest recheck 7 FAIL exposed.

**Open / residual:** P0 create form + date/money `onValueChange` wire + KPI type; P1 BCC testid + status labels + vitest sync; RIÊNG/STP-02/05/06 untouched; formula HOLD; ≠ UF-HRM-10.

## next_owner

`pm` → **`dev-fe`** fix POLICY-PACK-01 then re-dispatch **QA** same work_item.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-FIX-01
role: dev-fe
lane: execution
read_first:
  - docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md
  - apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetupScreen.tsx
  - apps/web/hrm/src/lib/payPolicyPackForm.ts
  - docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md
entry_criteria: QA FAIL_TO_PM stamp PAYPPQA-MSPX1M4T; U65; BE GWC CNTTBEQC1-MSO8HVERQC1 retained
exit_criteria:
- Fix DEF-PAY-STP-CREATE-FORM-MISSING: create mode form when + Thêm gói (POST pay-policy-packs)
- ViDateField + ViMoneyInput: onValueChange (not onChange); BCC data-testid=pay-params-bcc-std
- KPI keep string 0–100; validate trim-safe; red border + MSG_KPI_RANGE on 150
- statusLabelVi → POLICY_PACK_STATUS_LABEL_VI for select options
- Align PolicyPackSetupScreen.test.ts with live UI; vitest PASS
- READY_FOR_QA → retest QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
cấm: seed; claim RIÊNG/STP-02/05/06; flip payroll_e2e_ready; formula eval; apps/api/**
must_keep: pay-stp-hub-root honesty banner; archive POST path; CHUNG-only
evidence_path: docs/qa/evidence/po-hrm-pay-cntt-fe-stp-01-policy-pack-01-fix-01.md
ack_status: READY_FOR_QA
```
