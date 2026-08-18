# BE Spec Audit - PAY-CNTT

Ngay: 2026-08-12
Vai: dev-be lane HRM CNTT
Scope READ_ONLY: docs/**, apps/api/hrm-api/src/payroll/**

---

## 1. READINESS TRUOC DOC CHI TIET

BE_READY: PARTIAL

3 spec PAY-CNTT chinh dang DRAFT (chua CONFIRMED):
- PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 - gap G-TPL-01/02/03
- PO-HRM-PAY-SRC-PRIORITY-SPEC-01 - chua contract 63 fragment
- PO-HRM-PAY-INPUT-PACKS-SPEC-01 - chua APPEND allowed_source_kinds_json

BE pipeline hien co payroll CRUD + SRC resolver + input pack CRUD + advance bridge.
Khong co: applicability_province_code, route_count, warnings[] province mismatch, void reason audit.

---

## 2. SRS Coverage

| UC-BP-PAY | Covered | Note |
|-----------|---------|------|
| UC-H04 s4.4 Payroll | PARTIAL | Master SRS chi neu generic (batch 25 hang thang, Net = Gross - BHXH 8% - BHYT 1.5% - BHTN 1% - PIT progressive, 6-step approval chain). 3 spec PAY-CNTT cung cap chi tiet fragment 63 - chua roll up SRS master. |
| UC-B05 Audit Log | LIVE | PAYROLL_LOCKED event da dispatch qua EventBus; thay trong payroll-catalog.service.ts |
| UC-B04 Catalog Gov | PARTIAL | pay_sheet_templates scope tenantId OK. policy_pack_id + input_pack_profile_id FK chua co; applicability_scope enum chua mo province. |
| UC-M04 Mobile Payslip | PAPER | PDF encrypt + screenshot audit - chua co trong src/payroll/. |

GAP SRS: SRS_NEW s3.5 catalog payment_status khong co phan biet payroll_group status.
Master SRS khong de cap fragment_id, formula_override_definition_id, sheet_template_snapshot_json.

---

## 3. TECH_SPEC

| Section | Status | Note |
|---------|--------|------|
| s1 NestJS runtime | MATCH | controller -> service -> repository pattern dung |
| s3 Catalog Cache | PARTIAL | Redis key catalog:{tenantId}:v{version} dung cho SalaryComponent + PolicyPack. Khong co invalidate trong updateSalaryComponent() - stale risk. |
| s4 Jobs | PARTIAL | Payroll batch cron ok. PROCESS khong idle-guard concurrency race. |
| s7 Error envelope | MATCH | {code, message, details?, requestId} dung moi response. |
| s9 Mobile | PAPER | FCM/APNs + screenshot audit chua trong payroll. PAYROLL_LOCKED chua bound notification channel. |

GAP: PAYROLL_LOCKED event hrm-api khong subscribe CATALOG_UPDATED - batch chay cu policy.

---

## 4. API Contract (endpoint list)

| Method | Path | Status |
|--------|------|--------|
| GET | /pay-sheet-templates | LIVE |
| POST | /pay-sheet-templates | LIVE |
| PATCH | /pay-sheet-templates/:id | LIVE |
| GET | /pay-sheet-template-lines | LIVE |
| POST | /pay-sheet-template-lines | LIVE |
| PATCH | /pay-sheet-template-lines/:id | LIVE |
| GET | /pay-setup/resolve | LIVE - chua NO_CANDIDATE path |
| POST | /periods | LIVE - snapshot bind ok |
| POST | /periods/:id/bind-sheet-template | LIVE - chua lock concurrent bind |
| PATCH | /periods/:id | LIVE |
| POST | /periods/:id/process | LIVE - chua propagate warnings[] |
| GET | /payroll-periods | LIVE |
| PATCH | /payroll-periods/:id | LIVE |
| POST | /payroll-groups | LIVE |
| PATCH | /payroll-groups/:id | LIVE |
| POST | /payroll-groups/:id/enroll | LIVE |
| GET | /payroll-payslips | LIVE |
| PATCH | /payroll-payslips/:id/payment-status | LIVE |
| POST | /payroll-payslips/:id/void | LIVE - chua audit reason_vi + lock guard |
| POST | /payroll-payslips/:id/issue | LIVE |
| POST | /payroll-payslips/:id/lock | LIVE |
| POST | /pay-period-input-lines | LIVE |
| POST | /pay-period-input-lines/batch | LIVE |
| GET | /pay-period-input-packs | LIVE |
| POST | /pay-input-pack-profiles | LIVE |
| PATCH | /pay-input-pack-profiles/:id | LIVE - chua persist route_count |
| POST | /advance-requests | LIVE |
| PATCH | /advance-requests/:id/decide | LIVE - lock period check MISSING |
| POST | /salary-components | LIVE |
| PATCH | /salary-components/:id | LIVE - cache invalidate MISSING |
| POST | /salary-component-rules | LIVE |
| POST | /policy-packs | LIVE |
| PATCH | /policy-packs/:id | LIVE |
| POST | /payroll-group-members | LIVE |

GAP API: payslips DTO khong co warnings[]. advance-requests decide khong back-check period LOCKED. salary-components update khong invalidate cache.

---

## 5. DB Design (relevant tables)

| Table | Status | Note |
|-------|--------|------|
| pay_sheet_templates | PAPER | applicability_scope enum chua co province. applicability_province_code column chua persist. policy_pack_id + input_pack_profile_id FK chua co. Chay ensureSchema. |
| pay_sheet_template_lines | LIVE+EXPAND | fragment_id + fragment_bind_mode + formula_definition_id co. override_* column cho 18 dong ADR-FRAGMENT-BIND chua adapter. |
| pay_periods | LIVE | sheet_template_snapshot_json co - snapshot chinh xac tai bind-time. |
| pay_period_input_lines | LIVE | source_kind open string OK. APPEND route_count + cac kind can insert - tao hole bao mat neu de trong. |
| pay_input_pack_profiles | PAPER | allowed_source_kinds_json open string OK. APPEND la data op khong DDL. |
| payroll_groups | LIVE | CREATE+LIST+enroll OK. |
| payslips | LIVE | DTO thieu warnings[]. |
| advance_requests | LIVE | bridge co; lock period check chua chan. |
| pay_component_definitions | PAPER | fragment_bind_mode enum can gia tri moi. |

GAP DB: pay_periods processed_at = client-side write - race concurrent.
pay_sheet_template_lines khong co deleted_at - template xoa thi line mo coi.
payroll_groups thieu lockedAt field.

---

## 6. CODE Inventory (matching spec)

| Capability | File | Spec Match |
|------------|------|------------|
| Snapshot template tai bind | pay-sheet-template.service.ts bindPeriod() | TPL-BE-01 s7.5 |
| SRC-02 fixed CB | pay-src-resolver.ts loadEmployeeFixedAmount | SRC-BE-01/02 |
| SRC-03A direct amount | pay-period-input-pack.service.ts | SRC-BE-01 |
| SRC-04 override formula | pay-src-resolver.ts resolveFormulaForComponent | SRC-BE-02 |
| SRC-05 catalog default | pay-src-resolver.ts resolveCatalogDefault + DB hydrate | SRC-BE-02 |
| Advance bridge | pay-advance-bridge.service.ts | INPUT-PACK-BE-01 |
| Payslip split | pay-payslip-split.service.ts | graph split |
| Termination | pay-termination.service.ts | THU_VIEC |

LIVE: L1 snapshot bind, L2 SRC-02/03A/04, L3 advance bridge, L4 payroll-group, L5 payslip status machine.

---

## 7. GAPS - phai xu ly truoc BE claim

| # | Gap | Layer | Status |
|---|-----|-------|--------|
| G1 | applicability_province_code column + ensureSchema | DB | HOLD - spec CONFIRM |
| G2 | resolveForEmployee() ADD tier 3 province ranking + NO_CANDIDATE/AMBIGUOUS | BE | ADD - spec CONFIRM |
| G3 | PROCESS guard province mismatch - warnings[] propagate | BE | ADD - need DTO + spec |
| G4 | void reason vi audit + lock period guard | BE | BUG live |
| G5 | APPEND route_count + dll_cpn + cac kind vao allowed_source_kinds_json | DATA | HOLD - spec CONFIRM |
| G6 | advance-request decide kiem tra period locked | BE | BUG live |
| G7 | formula evaluator 63 fragment register + inputs_required validate | BE | HOLD - gd1_eval_v1 lift |
| G8 | salary-components update khong invalidate cache | BE | ADD |
| G9 | payroll_groups thieu lockedAt + concurrent process race | DB+BE | ADD |

---

## 8. BA Confirm Checklist

| Spec | BE Impact | Can deploy? |
|------|-----------|-------------|
| SHEET-TEMPLATE-SPEC s2 | applicability_province_code DDL | NO - chua CONFIRM |
| SHEET-TEMPLATE-SPEC s3.2 | resolveForEmployee tier 3 | NO |
| SHEET-TEMPLATE-SPEC s4.3 | PROCESS warnings[] | NO |
| SRC-PRIORITY-SPEC s2 | SRC-03A vs 03B branch | NO |
| INPUT-PACKS-SPEC s4 | APPEND route_count data | NO |

---

## 9. BE_READY: PARTIAL

Co 5 live capability (L1-L5).
Con 7 gap FIRMWARE (G1-G7) + 2 live bug (G4, G6) + 2 ADD (G8, G9).
Tat ca deu can spec BA confirm + SA API contract truoc khi BE viết code.
Chay o branch dev-feature/pay-cntt, khong merge vao main cho toi khi SA + BA CONFIRMED.
