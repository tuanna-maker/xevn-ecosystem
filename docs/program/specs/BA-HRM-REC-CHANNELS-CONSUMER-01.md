# BA-HRM-REC-CHANNELS-CONSUMER-01 — `recruitment_channels` consumer delta

**work_item_id:** `BA-HRM-REC-CHANNELS-CONSUMER-01`  
**lane:** governance (ba-data)  
**date:** 2026-08-11  
**parent:** `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` §6.2 · audit `po-hrm-settings-catalog-consumer-audit-fe-01.md`  
**must_keep:** `DEPTCONREG1` sealed · consumer slices đã 🟢 (Contracts dept/type) — **cấm reopen**

---

## 1. Kết luận ngắn (sponsor-facing)

| Câu hỏi | Trả lời |
|---------|---------|
| Catalog **bắt buộc** trên màn REC nào? | **Chỉ luồng ứng viên (pool):** tab **Ứng viên** → `CandidateFormDialog` trường **`source` (Nguồn)**; lọc nguồn + hiển thị list/detail/stats **cùng code SoT** khi catalog EFF > 0. |
| Màn **không** bắt buộc `recruitment_channels` | YCTD · Tin tuyển dụng · Mẫu JD · Kế hoạch TD · Kanban stage (dùng `recruitment_pipeline_stages` Nest) · Phỏng vấn — **OUT** cho WI consumer này. |
| Owner chính | **`dev-fe`** — thiếu `recruitmentChannelOptionsFromCatalog` + bind (pattern `departmentOptionsFromCatalog`). |
| Owner phụ (integrity) | **`dev-be`** — validate `source` ∈ effective khi catalog có item (P0 data contract; không thay picker). |
| OUT OF SCOPE | Đổi schema `candidates.source`; JD dynamic `select` kênh (đã allowlist riêng `PO-HRM-JD-DYNAMIC-DATA-01`); Settings CRUD/sync bucket (E1-B đã có). |

**Không** OUT OF SCOPE toàn FR-HRM-SC-CH-01 — consumer gap là **IN SCOPE** P0 allow-list SRS §16.7 (`recruitment_channels`).

---

## 2. SoT spec / data

| Artifact | Điều khoản |
|----------|------------|
| `docs/hrm/SRS.md` | P0 allow-list gồm `recruitment_channels` |
| `docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md` §3.4 | **FR-HRM-SC-CH-01** · **AC-SC-CH-03** — Candidates source picker = **code** catalog; cấm `getSourceConfig` hardcode làm SoT khi catalog có items |
| `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` §6 | `Candidate.source` → ∈ effective `recruitment_channels` |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | Module `recruitment` · DM §39 |
| AS-IS FE | `CandidateFormDialog` → `getSourceOptions()` hardcode (LinkedIn, Website, …); `CandidatesTab` → `getSourceConfig()`; **không** gọi `useSettingsCatalogsOverview` cho kênh |
| AS-IS BE | `recruitment_candidates` / pool `source` TEXT; **không** assert catalog (chỉ lưu trim) |

Aliases catalog: `recruitment_channels` \| `candidate_sources` \| `channels` (`hrm-settings-master-keys.ts` · `catalogSearchPicker.ts`).

---

## 3. Màn hình & AC (delta)

### 3.1 IN SCOPE — consumer bind

| Screen / surface | Route / component | Field | Bắt buộc? | AC-ID |
|------------------|-------------------|-------|-----------|-------|
| Tạo/sửa ứng viên | `CandidateFormDialog` | `source` | **Không** (optional) · nếu chọn → **code** catalog khi EFF>0 | **AC-SET-CONSUMER-CH-REC-01** |
| Danh sách ứng viên — lọc nguồn | `CandidatesTab` toolbar | `sourceFilter` | Nên dùng cùng option set | **AC-SET-CONSUMER-CH-REC-02** |
| Chip/badge nguồn | `CandidatesTab` · `CandidateDetailView` | hiển thị | Label = `resolveRecruitmentChannelLabel(code)` | **AC-SET-CONSUMER-CH-REC-03** |
| Thống kê nguồn | `CandidateSourceStats` | aggregate `source` | Cùng label map; không invent bucket | **AC-SET-CONSUMER-CH-REC-04** (P1 — cùng wave FE nếu đụng file) |

**UF / J:** `UF-HRM-10` (consumer matrix) · embed `UC-HRM-22` / `UC-HRM-30` tab Ứng viên — **không** claim full UF-HRM-10 DONE khi chỉ đóng hàng kênh.

### 3.2 OUT OF SCOPE (explicit)

| Item | Rationale |
|------|-----------|
| `JobRequisitionsTab` / `JobPostingsTab` / `HeadcountProposalTab` | Audit FE: không có trường `source` UV; chỉ `job_titles` / `departments` |
| `recruitment_pipeline_stages` | Đã PASS Nest `useRecPipelineStagesEffective` — slice khác |
| Chuyển toàn bộ legacy DB values sang code | Migration/data hygiene — **không** trong consumer WI; hiển thị legacy: label raw hoặc «—» + cho sửa về code |

---

## 4. BR & validation

| ID | Điều kiện | Quy tắc | Kết quả mong đợi |
|----|-----------|---------|------------------|
| **BR-REC-CH-SOT-01** | `effectiveItems.length > 0` cho family kênh | Picker chỉ options từ `mergeEffectiveItemsByKeys(..., recruitmentChannels keys)`; POST/PUT gửi `source` = **item.code** | Không gửi label tiếng Việt làm SoT |
| **BR-REC-CH-SOT-02** | `effectiveItems.length === 0` | Honest empty: CTA Đồng bộ MD / mở Settings `recruitmentChannels`; **được** giữ fallback `getSourceOptions` **chỉ khi EFF=0** (parity `AC-PLT-REC-02` stage) | Không claim catalog consumer PASS |
| **BR-REC-CH-SOT-03** | Catalog có data | **Cấm** `getSourceConfig` / `getSourceOptions` làm danh sách chọn duy nhất | Audit residual đóng |
| **VAL-REC-CH-FE-01** | User chọn nguồn · EFF>0 | Network POST/PATCH `source` khớp code đã chọn | QA U65 |
| **VAL-REC-CH-BE-01** | EFF>0 · `source` non-null trên write | ∈ active codes tenant/company | **400** `HRM-REC-SOURCE-KEY` (đề xuất; mirror `HRM-CON-TYPE-KEY`) |
| **VAL-REC-CH-BE-02** | EFF=0 | Cho phép null hoặc string legacy (không 400 chỉ vì chưa sync) | Tránh block U65 trước sync |

**scope_parity:** List/filter và get-by-id candidate cùng `company_id` scope — không đổi trong WI này; QA regression J-REC list→detail nếu đụng route.

---

## 5. Owner map (điều chỉnh §6.2 cũ «dev-be + qa»)

| Layer | Owner | Deliverable |
|-------|-------|-------------|
| FE picker + label resolve | **dev-fe** | `recruitmentChannelOptionsFromCatalog` + `resolveRecruitmentChannelLabel` trong `catalogSearchPicker.ts`; wire `CandidateFormDialog` (+ filter/display tối thiểu AC-01..03); vitest source lock |
| BE assert (optional same sprint) | **dev-be** | `VAL-REC-CH-BE-01` trên `candidates-pool` create/patch khi effective count > 0 |
| QA | **qa** | Chỉ sau FE `READY_FOR_QA`: U65 login → sync XBOS kênh TD → Tạo UV → chọn nguồn → 2xx → F5; **cấm** seed |

---

## 6. Traceability

| SRS / BR | API | DB | FE (target) | Test |
|----------|-----|----|-------------|------|
| FR-HRM-SC-CH-01 · AC-SC-CH-03 | `GET settings-catalogs` (cached overview) | `synced_catalogs` key `recruitment_channels` | `CandidateFormDialog.source` | AC-SET-CONSUMER-CH-REC-01..03 |
| BR-REC-CH-SOT-01 | `POST/PATCH …/candidates-pool` | `candidates.source` TEXT | CatalogSearchPicker hoặc Select từ catalog | VAL-REC-CH-FE-01 · VAL-REC-CH-BE-01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | **Closed:** xác định màn REC bắt buộc consumer (`CandidateFormDialog` + lọc/hiển thị UV); owner **dev-fe** primary, **dev-be** validation; OUT màn YCTD/TD; không reopen `DEPTCONREG1`. **Residual:** `CandidateSourceStats` P1; legacy source values migration. |
| **next_owner** | `pm` → dispatch **dev-fe** |
| **evidence_path** | `docs/program/specs/BA-HRM-REC-CHANNELS-CONSUMER-01.md` |
| **ack_status** | `PASS_TO_PM` |

### next_dispatch_prompt (PM → dev-fe)

```text
work_item_id: PO-HRM-REC-CHANNELS-CONSUMER-FE-01
role: dev-fe
read_first:
  - docs/program/specs/BA-HRM-REC-CHANNELS-CONSUMER-01.md
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2
  - docs/qa/evidence/po-hrm-settings-catalog-consumer-audit-fe-01.md (residual row)
  - apps/web/hrm/src/lib/catalogSearchPicker.ts (departmentOptionsFromCatalog pattern)
entry_criteria: BA-HRM-REC-CHANNELS-CONSUMER-01 PASS; must_keep DEPTCONREG1 sealed; U65; settings_catalog_e2e_ready=false
exit_criteria:
  - recruitmentChannelOptionsFromCatalog + resolveRecruitmentChannelLabel
  - CandidateFormDialog source binds catalog when EFF>0; honest empty+CTA when EFF=0 per BR-REC-CH-SOT-02
  - CandidatesTab source filter + list badge use resolve label (AC-REC-02/03)
  - vitest in catalogSearchPicker.test.ts + candidate form source test
  - evidence docs/qa/evidence/po-hrm-rec-channels-consumer-fe-01.md
  - ack_status READY_FOR_QA
allowed_paths: apps/web/hrm/src/lib/catalogSearchPicker.ts, apps/web/hrm/src/components/recruitment/CandidateFormDialog.tsx, apps/web/hrm/src/components/recruitment/CandidatesTab.tsx, apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx, related tests
cấm: reopen sealed consumer slices; seed; claim UF-HRM-10 full PASS
change_mode: ADD
must_keep: YCTD SELECT on UV create · pipeline stage catalog bind · G-DB-01 hire link
```
