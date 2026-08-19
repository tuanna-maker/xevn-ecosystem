# PO — Bộ Test Case · Unit Test Plan · Test Report (bám Spec)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-SPEC-TEST-SUITE-01` |
| **Date** | 2026-08-03 |
| **Owner** | PM + PO |
| **Sponsor signal** | Có SRS + TechSpec + API → **phải** có testcase + unit scenarios + test report để bắt lỗi code |
| **Status** | OPEN program — T1–T3 artifacts **CLOSED**; T4 IMPL in-flight (không thay U78 wave log) |

## 1. AS-IS (honest)

| Có sẵn | Thiếu (gap P0 process) |
|--------|-------------------------|
| Wave evidence + U78 `*-test-log.md/.json` theo WI | **Master Test Case catalog** (TC-ID ↔ UC/FR ↔ API ↔ expected) |
| `po-e2e-ba-case-matrix-01.md` (3 spine E2E) | **Unit Test Plan** theo từng endpoint/BR trong API_CONTRACT |
| Jest/vitest rải rác theo module | Ma trận **coverage unit vs API** (đã có spec / chưa có test) |
| QC GWC theo slice | **Test Report tổng** (rollup PASS/FAIL/BLOCKED theo TC-ID, không chỉ 1 wave) |

OS gate (`13` §3.4.11): `DB_DESIGN + API_DESIGN confirm` → **unit test plan** → Dev. Chương trình này **vá gap** cho pack `docs/brand-new-documents-20270801/` + spine PO-E2E.

**Doctrine cách viết (PM/PO học):** shared `_vibe-team-os/33-TESTCASE-VS-REPORT-VS-UNIT.md` · dispatch training `templates/PM_DETAILED_DISPATCH.md` · lock **U85**.

## 2. SoT artifacts (bắt buộc tạo)

| # | Artifact | Path | Owner |
|---|----------|------|-------|
| 1 | **Test Case Catalog** | `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` | qa (+ ba-process cite) |
| 2 | **Unit Test Plan** | `docs/qa/PO_SPEC_UNIT_TEST_PLAN.md` | qa + dev-be lead cite |
| 3 | **Test Report (live)** | `docs/qa/reports/PO_SPEC_TEST_REPORT.md` | qa (cập nhật mỗi wave) |
| 4 | Index program | file này | PM+PO |

### 2.1 Test Case Catalog — cột tối thiểu mỗi TC

| Cột | Ý nghĩa |
|-----|---------|
| `TC-ID` | vd. `TC-LEAVE-ATT-03` |
| `UC / FR` | SRS_VN / SRS_NEW § |
| `TechSpec` | TECH_SPEC_VN § / BR |
| `API` | METHOD path + mã lỗi (API_CONTRACT_VN) |
| `Layer` | UNIT · API · UI-browser · MOBILE |
| `Type` | Happy · Fail-deep · Boundary · Auth/scope |
| `Precondition` | Persona · data (U65 — không seed giả) |
| `Steps` | Ngắn, HDSD-aligned nếu UI |
| `Expected` | HTTP/code + FE/F5 |
| `Automate` | jest path / vitest / manual |
| `Status` | PLANNED · AUTOMATED · EVIDENCED · BLOCKED |

### 2.2 Unit Test Plan — theo API

Mỗi endpoint spine / mutate P0:

| Endpoint | BR / bước SRS | Cases unit (input → expect) | Spec file hiện có | Gap |
|----------|---------------|----------------------------|-------------------|-----|
| … | … | … | `*.spec.ts` | COVERED / MISSING |

Ưu tiên P0: leave VAL-ATT · leave approve · candidates create whitelist · employee `manager_id` · recruitment workflow stamp.

### 2.3 Test Report

Rollup từ catalog + evidence paths:

- % TC PLANNED → EVIDENCED  
- Unit gaps MISSING (block Dev claim READY nếu P0)  
- Link U78 logs theo TC-ID  
- **Cấm** claim UAT DONE khi catalog P0 còn PLANNED không evidence

## 3. Spec sources (read_first)

1. `docs/brand-new-documents-20270801/SRS_VN.md` (hoặc `SRS_NEW.md` nếu cùng SoT)  
2. `TECH_SPEC_VN.md` / `TECH_SPEC_NEW.md`  
3. `API_CONTRACT_VN.md` / `API_CONTRACT_NEW.md`  
4. `DB_DESIGN_VN.md`  
5. `docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md`  
6. `docs/qa/evidence/po-e2e-ba-case-matrix-01.md`  
7. U78 template: `docs/qa/WORLD_STANDARD_TEST_LOG.md`

## 4. Waves

| Wave | Owner | Exit | Status (2026-08-03) |
|------|-------|------|---------------------|
| **T0** | PM | Publish program (file này) + bus | **DONE** |
| **T1** | qa | Catalog TC cho SPINE-01/02/03 (+ leave attach/approve, candidates, manager_id) ≥ 40 TC có `TC-ID` | **DONE** — 53 TC · `PO_SPEC_TEST_CASE_CATALOG.md` |
| **T2** | qa (+ grep jest) | Unit Test Plan + gap MISSING list P0 | **DONE** — `PO_SPEC_UNIT_TEST_PLAN.md` · `po-spec-unit-test-plan-01.md` |
| **T3** | qa | Test Report live rollup từ evidence (map TC ↔ log) | **DONE** — `reports/PO_SPEC_TEST_REPORT.md` v1 · `po-spec-test-report-t3-01.md` |
| **T4** | dev-be | Chỉ khi T2 ghi MISSING P0 — viết jest theo plan (Task riêng) | **IN-FLIGHT** — `PO-SPEC-UNIT-TEST-IMPL-01` (**cấm** re-dispatch UNIT-TEST-PLAN) |

## 5. Policy

- U65 · U76 · U78 vẫn bắt buộc trên browser evidence.  
- Catalog **không** thay browser UF; catalog **neo** UF/unit vào spec.  
- LV-02 ladder HOLD — TC ladder đánh dấu BLOCKED/SPEC_GAP đến khi sponsor `T_L1`.  
- Không pretend parity full SRS mọi UC trong T1 — ưu tiên **spine P0** trước.

---

*PO-SPEC-TEST-SUITE-01*
