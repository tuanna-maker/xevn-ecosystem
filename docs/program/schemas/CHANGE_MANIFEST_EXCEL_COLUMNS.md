# Change Manifest — cột Excel ↔ JSON (pilot XeVN)

| Mục | Nội dung |
|-----|----------|
| **Mã** | `PO-BIZ-CHANGE-COMPILER-BA-01` |
| **Schema SoT** | `change-manifest.schema.json` **v0.1.1** (SA ADR + BA-DATA align) |
| **Ví dụ hợp lệ** | `change-manifest.example.json` → `samples[]` (ATT · EMP · REC) · gold `docs/program/examples/change-manifest.sample.json` |
| **ADR** | `docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md` Option **C Hybrid** |
| **Validation** | `CHANGE_MANIFEST_VALIDATION_MATRIX.md` (Plane D = Dispatch Manifest) |
| **Chính sách** | U77 · Phase A pilot `xevn-ecosystem` · **cấm** `apps/**` |
| **Nguồn cột vàng** | `SPONSOR_CHOT_FILL*.xlsx` · `SPONSOR_CHOT_REMAINING.xlsx` · gap matrix |
| **Audience** | Nội bộ PM/SA/BA/QA — **không** gửi khách nguyên văn |

---

## 1. Mục đích

| Plane | Artifact | Vai trò |
|-------|----------|---------|
| **Human** | Excel / phiếu chốt sponsor | Nơi điền quyết định (cột vàng) |
| **Machine (Plane D)** | Change Manifest JSON (1 object / wave) | SoT máy cho PM dispatch + gate Spec-first |
| **Batch (Plane B)** | Ledger nhiều dòng chốt (tuỳ chọn) | Inventory → compile thành ≥1 Plane D — **không** đưa thẳng vào ajv Plane D |

**Một wave dispatch** = **một** Manifest Plane D khớp schema (`work_item_id`, `uc_ids`, `ac[]`, `slice_id`, …).  
Workbook nhiều dòng chốt → **N** Manifest (hoặc một Manifest gom nhiều `uc_ids` cùng slice).

File `change-manifest.example.json` là **bundle**: `samples[]` chứa 3 Manifest Plane D; **ajv từng phần tử**, không ajv cả bundle.

Compiler Phase A = emit JSON thủ công / export; Phase A3+ = script. Khi lệch sheet ↔ JSON → **Manifest thắng** (ADR §8).

---

## 2. Sheet Excel khuyến nghị (pilot)

| Sheet | Vai trò |
|-------|---------|
| `00_Manifest_Meta` | `manifest_version`, `work_item_id` đề xuất, `source_workbook`, ngày emit |
| `01_Changes` | SoT cột §3 — mỗi dòng góp 1 UC/decision vào wave hoặc tách wave |
| `Huong_dan` | Cách điền (không parse) |

Workbook hiện có (`00_Chot_Sponsor`, `01_Con_can_chot`, `02_18_MISSING`, `03_UC_Lich_EXPAND`) **map vào** `01_Changes` qua `decision_id` / `surface_id` / `uc_id` — không bắt buộc gộp file vật lý ngay.

---

## 3. Bảng cột `01_Changes` → Manifest v0.1.1

| # | Nhãn Excel (VI) | `key` (header máy) | Bắt buộc | Kiểu / enum | Ví dụ | Map JSON path |
|---|-----------------|---------------------|----------|-------------|-------|---------------|
| 1 | Mã wave / work item | `work_item_id` | **Có** | `PO-*` / `W-*` | `PO-HRM-BP-ATT-SIGN-TS-01` | `work_item_id` |
| 2 | Phiên bản manifest | `manifest_version` | **Có** | `0.1.x` | `0.1.1` | `manifest_version` |
| 3 | Tiêu đề ngắn | `title` | Khuyến nghị | text ≤200 | `Ký chốt bảng công — TechSpec` | `title` |
| 4 | Tóm tắt | `summary` | Khuyến nghị | text | `NV→QL→HCNS; WF XBOS theo tenant` | `summary` |
| 5 | Mã UC / FR | `uc_id` | **Có** (≥1) | `UC-*` / `FR-*` | `UC-BP-ATT-11` | `uc_ids[]` |
| 6 | Mã BR | `br_ids` | Khuyến nghị | `;` phân tách `BR-*` | `BR-ATT-SIGN-01` | `br_ids[]` |
| 7 | Mã quyết định chốt | `decision_id` | Khuyến nghị | `Q-*` · `R-*` · `D7-*` | `Q-ATT-SIGN` | `summary` / `source_artifacts[].note` |
| 8 | Mã bề mặt product | `surface_id` | Không | `S01`–`S90` · … | `S76` | note nguồn |
| 9 | Chế độ sửa | `change_mode` | **Có** | `ADD` · `UPGRADE` · `FIX` | `UPGRADE` | `change_mode` |
| 10 | REPLACE/REMOVE (override) | `change_mode_extended` | Chỉ khi sponsor ghi rõ | `REPLACE` · `REMOVE` · `ALIGN` | — | `sponsor_override.*` |
| 11 | Mã slice | `slice_id` | **Có** | Story id | `HRM-ATT-SIGN-01` | `slice_id` |
| 12 | Trạng thái chốt sponsor | `sponsor_status` | **Có** | `PENDING` · `CONFIRMED` · `WAIVED_HOTFIX_P0` · `REJECTED` | `CONFIRMED` | `sponsor_confirm.status` |
| 13 | Ngày chốt | `sponsor_date` | **Bắt buộc nếu CONFIRMED** | Excel `dd/MM/yyyy` → JSON ISO | `05/08/2026` | `sponsor_confirm.date` |
| 14 | Wave id chốt | `sponsor_wave_id` | Không | text | `PO-HRM-BP-SRS-CHOT-01` | `sponsor_confirm.wave_id` |
| 15 | Evidence chốt | `sponsor_evidence` | Không | path | gap matrix | `sponsor_confirm.evidence_ref` |
| 16 | Pha pipeline | `pipeline_stage` | Khuyến nghị | `intake`…`closed` | `techspec` | `pipeline_stage` |
| 17 | Đường cho phép | `allowed_paths` | **Có** | `;` phân tách | `docs/**` | `allowed_paths[]` |
| 18 | Đường cấm | `forbidden_paths` | **Có** (Phase A) | `;` phân tách | `apps/**;packages/**` | `forbidden_paths[]` |
| 19 | Phải giữ | `must_keep` | Khuyến nghị | `;` phân tách | soft-delete; scope parity | `must_keep[]` |
| 20 | Neo tags | `neo_tags` | **Có** | `;` — enum ADR §6.4 | `DOC-DELTA;CONTRACT-MEMORY` | `neo_tags[]` |
| 21 | SRS path | `srs_ref` | Khi đụng SRS | path + § / UC | `…/SRS_HRM_ENTERPRISE.md §3` | `spec_targets.srs` + `traceability.srs_refs` |
| 22 | TechSpec path | `tech_spec_ref` | Khi đụng TS | path hoặc `HOLD` | `HOLD` | `spec_targets.tech_spec` |
| 23 | DB_DESIGN path | `db_design_ref` | Khi đụng DB | path | — | `spec_targets.db_design` |
| 24 | API_DESIGN path | `api_design_ref` | Khi đụng API | path | — | `spec_targets.api_design` |
| 25 | Trace SRS refs | `trace_srs` | Khuyến nghị v0.1.1 | `;` path§ | FR-UC-… | `traceability.srs_refs[]` |
| 26 | Journey UF/J | `journey_ids` | Khi có UI | `;` `UF-*`/`J-*` | `UF-HRM-ATT-SIGN` | `traceability.journey_ids[]` |
| 27 | Đọc trước (thứ tự) | `read_first` | Khuyến nghị | `;` path | ADR; schema; SRS | `read_first[]` |
| 28 | AC id | `ac_id` | **Có** (≥1) | `AC-*` | `AC-ATT-SIGN-01` | `ac[].id` |
| 29 | AC nội dung | `ac_statement` | **Có** | tiếng Việt đo được | … | `ac[].statement` |
| 30 | AC verify | `ac_verify` | **Có** | `browser` · `api` · `jest` · `doc_review` · `gate_script` | `doc_review` | `ac[].verify` |
| 31 | AC pass when | `ac_pass_when` | **Có** | outcome quan sát được | … | `ac[].pass_when` |
| 32 | UF / J | `ac_uf_or_j` | **Bắt buộc nếu browser** | `UF-*` / `J-*` | — | `ac[].uf_or_j` |
| 33 | Owner PM…QC | `role_pm` … | ≥1 role | label / work_item | `pm` | `role_owners.<role>` |
| 34 | Memory pre-task | `pre_task_memory` | Không | `Y`/`N` | `Y` | `compound_hooks.pre_task_memory_loadout` |
| 35 | Memory post-task | `post_task_memory` | Không | `Y`/`N` | `Y` | `compound_hooks.post_task_memory_update` |
| 36 | Promote OS | `promote_os` | Không | `Y`/`N` | `N` (Phase A) | `promote_os.required` · chapter cố định `34-BUSINESS-CHANGE-COMPILER.md` |
| 37 | Nguồn sheet | `source_sheet` | Khuyến nghị | tên sheet | `00_Chot_Sponsor` | `source_artifacts[].sheet` |
| 38 | Nguồn path | `source_path` | Khuyến nghị | path workbook | `…/SPONSOR_CHOT_FILL_v1.1.xlsx` | `source_artifacts[].path` |
| 39 | Ghi chú | `notes` | Không | text | — | `summary` / `sponsor_confirm.notes` |

### 3.1 Quy tắc gộp dòng

- Nhiều dòng cùng `work_item_id` → **một** Manifest: gộp `uc_ids`, `br_ids`, `ac[]`, `allowed_paths`.
- `change_mode` xung đột trên cùng wave → FAIL compile (tách wave).
- Phase A docs-only: `forbidden_paths` **bắt buộc** có `apps/**`.
- `sponsor_confirm.status=CONFIRMED` → bắt buộc `sponsor_date` (schema v0.1.1).
- `ac_verify=browser` → bắt buộc `ac_uf_or_j`.

### 3.2 Y/N và ngày

- Excel `Y`/`N` → JSON boolean. Ô trống cột bắt buộc = **FAIL**.
- Ngày Excel `dd/MM/yyyy` → JSON `YYYY-MM-DD`. Từ chối epoch / `01/01/1970`.

---

## 4. Enum khóa (khớp ADR + schema)

### 4.1 `change_mode`

`ADD` · `UPGRADE` · `FIX` — mặc định.  
`REPLACE` / `REMOVE` chỉ qua `sponsor_override` khi sponsor ghi rõ + `rationale`.

### 4.2 Gợi ý loại quyết định nguồn (không phải field schema)

`RULE_LOCK` · `SCOPE` · `ADD_UC` · `EXPAND` · `CONFIG_CRUD` · `PRODUCT_GAP` · `INTEGRATION` · `UI_BRAND` · `NFR`.

### 4.3 `neo_tags`

`CODE-MEMORY` · `UI-MEMORY` · `STYLE-MEMORY` · `ROUTE-MEMORY` · `CONTRACT-MEMORY` · `DB-MEMORY` · `TEST-MEMORY` · `ENV-REGISTRY` · `CONFIG-MEMORY` · `DEPLOY-MEMORY` · `SCRIPT-MEMORY` · `DOC-DELTA`

### 4.4 `role_owners` keys

`pm` · `sa` · `ba_process` · `ba_data` · `ba_docs` · `dev_fe` · `dev_be` · `dev_mobile` · `qa` · `qc` · `devops` · `technical_manager`

---

## 5. Ánh xạ từ phiếu chốt hiện có

| Sheet nguồn | Cột vàng / mã | → Manifest |
|-------------|---------------|------------|
| `00_Chot_Sponsor` | `Mã` + `QUYẾT ĐỊNH` + `Ghi chú` + `Ngày` | `source_artifacts` · `summary` · `sponsor_confirm` |
| `01_Con_can_chot` | `Mã` + quyết định | thường `ADD`/`UPGRADE` + CONFIG |
| `02_18_MISSING` | surface + IN/GĐ2/OUT | SCOPE; OUT → không mở wave code |
| `03_UC_Lich_EXPAND` | UC Lịch + EXPAND/OUT | `uc_ids` + `pipeline_stage=srs` khi EXPAND |
| Gap matrix | `gap_class`, UC row | `read_first` + `spec_targets` / `traceability` |

### 5.1 Mẫu đã emit (`change-manifest.example.json` · BA-PROC-01)

| # | Module | `work_item_id` | UC | Nguồn chốt | v0.1.1 notes |
|---|--------|----------------|----|------------|--------------|
| 1 | **ATT** | `PO-HRM-BP-ATT-SIGN-TS-01` | `UC-BP-ATT-11` | `Q-ATT-SIGN` / `R-SIGN-01` · sheet `00_Chot_Sponsor` | `traceability` + browser `UF-HRM-ATT-SIGN` + CONFIRMED `date` |
| 2 | **EMP** | `PO-HRM-BP-EMP-CORE-02B-EXPAND-01` | `UC-BP-CORE-02b` | sheet `03_UC_Lich_EXPAND` · gap EXPAND | `traceability.srs_refs` + journeys |
| 3 | **REC** | `PO-HRM-BP-REC-07-OFFER-HIRE-01` | `UC-BP-REC-07` | sheet `03_UC_Lich_EXPAND` · REQ_REC_004 | `traceability.srs_refs` + journeys |

**Gold single-file (PM `change_manifest_path`):** `docs/program/examples/change-manifest.sample.json` (= ATT sample, ajv Plane D).

---

## 6. Gate compile (Phase A)

1. Mỗi instance Plane D thỏa `change-manifest.schema.json` (ajv hoặc checklist tay).  
2. `sponsor_confirm.status ∈ {CONFIRMED, WAIVED_HOTFIX_P0}` trước khi Dev code; docs-only wave có thể `CONFIRMED` ở tầng giấy.  
3. `change_mode` ngoài enum → bắt buộc `sponsor_override`.  
4. `ac` ≥1; mỗi AC có `pass_when` đo được; browser → `uf_or_j`.  
5. `uc_ids` khớp catalog / gap matrix — **cấm invent** UC.  
6. Cấm prompt-echo / path pipeline khách trong câu đưa sang HTML khách (`no_prompt_echo`).  
7. Dual-write: Manifest thắng khi lệch Excel.  
8. Không nhầm Plane B ledger với Plane D (`CM-VAL-008`).

---

## 7. Việc còn lại (không chặn BA-01)

- [ ] Generator đọc multi-workbook / sheet `01_Changes` chuẩn hóa (A3)  
- [ ] 1 decision → N surface = N Manifest hoặc N `uc_ids` + `must_keep` rõ lane  
- [ ] Slice files vật lý khi mở wave TechSpec (`docs/program/slices/<slice_id>.md`)

---

## 8. Liên kết

- U77: `docs/program/TEAM_USER_REQUIREMENTS.md`  
- Example: `docs/program/schemas/change-manifest.example.json`  
- Validation: `docs/program/schemas/CHANGE_MANIFEST_VALIDATION_MATRIX.md`  
- Checklist memory: `docs/program/COMPOUND_MEMORY_INTEGRATION_CHECKLIST.md`  
- OS promote packet: `docs/program/BIZ_COMPILER_OS_PROMOTE_PACKET.md`  
- Evidence: `docs/qa/evidence/po-biz-change-compiler-ba-01.md`
