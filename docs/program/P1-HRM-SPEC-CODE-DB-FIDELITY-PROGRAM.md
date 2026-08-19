# Program — Spec ↔ Code ↔ DB business fidelity (sponsor 2026-07-22)

| | |
|--|--|
| **Program** | `P1-HRM-SPEC-CODE-DB-FIDELITY` |
| **Trigger** | Sponsor: date picker không mở / submit «không hợp lệ»; form công ty trống; nghi nghiệp vụ FE–BE–DB chưa khớp SRS/TechSpec; yêu cầu SA rà từng domain + CODE-MEMORY tiếng Việt |
| **Pilot** | `http://14.225.217.232:8088/` · `ceo@xe.vn` |
| **Status** | EXECUTION — P0 date + Company/Attendance SA first |
| **NOT** | Phase1 DONE · PROD · seed U65 |

## 1. Sponsor locks

| ID | Lock |
|----|------|
| **L-DATE** | Date UI = `dd/MM/yyyy` (AC `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md`); picker phải mở được; parse/submit không báo invalid khi user nhập đúng vi-VN |
| **L-TRACE** | Mỗi domain: SRS § / TechSpec § / OpenAPI / Prisma-table / FE handler — bảng «spec says / code does / DB stores» |
| **L-COMMENT** | Dev append `@CODE-MEMORY` / `@CODE-MEMORY-CHANGE` **tiếng Việt** (UC/BR/SRS/TechSpec/must_keep) trước khi READY_FOR_QA |
| **L-SA** | **1 SA review / domain** trước claim UAT-ready menu đó; sai nghiệp vụ → sửa theo SRS (hoặc BA delta nếu spec gap) |
| **L-LINK** | Data linkage theo `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` + `HRM_DATA_LINKAGE_SRS_TRACE.md` |

## 2. P0 incident (screenshot sponsor)

| ID | Surface | Symptom |
|----|---------|---------|
| **INC-DATE-ATT-SHEET** | HRM Chấm công → Thêm bảng chấm công | Picker không mở; tay nhập được; Lưu → không hợp lệ; format lệch `01/01/2026` vs `1/1/2026` |
| **INC-DATE-CO-FOUND** | Phòng/Ban & Công ty → Chi tiết Tập đoàn | «Ngày thành lập» trống / không chọn được dễ; MST/email/phone «—» — check field bind + API |

## 3. Wave plan (squad)

| Wave | Owners | Outcome |
|------|--------|---------|
| **W0-P0** | ba-process + ba-data + sa + dev-fe (+dev-be nếu DTO) | Date picker + parse/submit ATT sheet + company founded |
| **W1-SA-ATT** | sa | Trace FR-HRM-AT-14 / UC-32 sheets ↔ API ↔ DB |
| **W1-SA-CO** | sa | Trace company/OU founded_date + member list ↔ API ↔ DB |
| **W2+** | sa per domain | EMP / CTR / INS / PAY / REC / DEC / WF — inventory từ matrix |
| **W-QA** | qa | Browser U65 retest P0 + domain J-* |
| **W-QC** | qc | GWC per closed domain — not Phase1 |

## 4. Work items (active)

| ID | Role | Status |
|----|------|--------|
| `FID-P0-BA-DATE-01` | ba-process | DISPATCH |
| `FID-P0-BA-DATA-01` | ba-data | DISPATCH |
| `FID-P0-SA-DATE-01` | sa | **PASS_TO_PM** — evidence `fid-p0-sa-date-01-20260722.md` · ADR date wire |
| `FID-P0-FE-DATE-01` | dev-fe | DISPATCH (after/with SA packet) |
| `FID-SA-ATT-01` | sa | After P0 packet |
| `FID-SA-CO-01` | sa | After P0 packet |

## 5. Exit (program)

- [ ] P0 date picker + submit PASS browser on :8088 (U65)
- [ ] Mỗi domain P0 có SA evidence «spec/code/DB» + Dev CODE-MEMORY VI
- [ ] Linkage matrix rows touched = ALIGNED hoặc defect owner
- [ ] **NOT** claim khách dùng full / Phase1 DONE khi còn P0 date hoặc SA FAIL mở
