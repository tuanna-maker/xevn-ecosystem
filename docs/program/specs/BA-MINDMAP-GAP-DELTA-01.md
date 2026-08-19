# BA-MINDMAP-GAP-DELTA-01 — Mindmap 27 lá → SRS UC · trạng thái repo

| Meta | Value |
|------|--------|
| **work_item_id** | `BA-MINDMAP-GAP-DELTA-01` |
| **lane** | governance · ADD-only · không `apps/**` |
| **date** | 2026-08-10 |
| **sources** | `docs/brand-new-documents-20270801/HRM_CUSTOMER_CAPABILITY_MINDMAP.md` · `docs/qa/evidence/doc-ent-hrm-mmap-01.md` (27/27) · `docs/hrm/SRS.md` · `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · `docs/program/dispatch/CLAUDE-PARALLEL-DOC-PACK-WAVE-01.md` |
| **mmap_status** (nội bộ) | IN_GĐ1 / PARTIAL / MISSING từ DOC-ENT-HRM-MMAP-01 — **không** promote vào BRD khách |

## Quy ước cột `repo status`

| Giá trị | Nghĩa (điều phối Dev/Claude) |
|---------|------------------------------|
| **implemented** | Có UC/FR neo trong `docs/hrm/SRS.md` + matrix `e2e_pass` (hoặc spine API/menu live); AC nghiệp vụ có thể còn PARTIAL |
| **planned** | Có UC/FR nhưng matrix `planned` / fidelity wave mở / PARTIAL cần delta AC hoặc WI đang chạy |
| **MISSING** | Không UC/FR đủ trong catalog Phase 1 — **mặc định GĐ2/mong muốn**; cấm code như GĐ1 trừ sponsor CR |

**Cờ sai hướng (notes):** `⚠ P0-MAP` = nếu không map, Dev có thể implement sai phạm vi GĐ1 hoặc đè SoT (ưu tiên đọc trước khi code song song).

---

## Bảng delta — 27 lá (gap_id cố định)

| gap_id | Lá mindmap (module) | SRS UC / FR ref (SoT repo) | repo status | owner WI suggestion | notes |
|--------|---------------------|----------------------------|-------------|---------------------|-------|
| MM-GAP-01 | Quản lý Yêu cầu (Tuyển dụng) | UC-HRM-22 · UC-HRM-30 · HRM-RC-01/02 · FR-HRM-RC-01 · UC-HRM-INT-01 | implemented | `PO-HRM-MVP-GD1-REC-*` · `PO-HRM-REC-UV-YCTD-DB-01` | YCTD create/list GĐ1; residual WF inbox U65 · density — không claim FR full DONE |
| MM-GAP-02 | Pipeline & CV Ứng viên | HRM-RC-03/04 · UC-H05 · UC-HRM-30 | planned | `PO-HRM-MVP-GD1-REC-04-CLUSTER-*` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01` | **⚠ P0-MAP:** GĐ1 = pipeline **5-state cố định**; «13-step dynamic» = **không** GĐ1 — cấm refactor funnel theo mindmap đầy đủ |
| MM-GAP-03 | Lịch hẹn Phỏng vấn | HRM-RC-05/06 · FR-HRM-RC-05 · UC-HRM-30 · `PO-HRM-REC-INTERVIEW-ONE-ACTIVE-SPEC-01` | planned | `PO-HRM-MVP-GD1-REC-06/07/08-CLUSTER-*` | API `recruitment_interviews` có; L2.5 list→detail mỏng; **⚠ P0-MAP:** cấm catalog twin làm SoT |
| MM-GAP-04 | Offer & Onboarding | UC-HRM-INT-01 · FR-HRM-INT-01 (HIRED→NV) | planned | `PO-HRM-E2E-LINK-EMP-SPEC-01` · `DOC-ENT-HRM-MMAP-SRS-01` (sau sponsor) | HIRED→`employee_id` có; Offer letter / checklist onboarding **chưa** UC riêng — **⚠ P0-MAP:** không build full onboarding WF như mindmap |
| MM-GAP-05 | Sơ đồ Tổ chức (Hồ sơ) | UC-XBOS-ORG-01/02 · UC-B04 (danh mục) — **không** FR org-chart HRM | planned | `D-HRM-ORG-CHART-FE-01` (defer) · SA scope | Dữ liệu cây XBOS **implemented**; chart UI HRM **chưa** FR lean — **⚠ P0-MAP:** không nhầm WF canvas XBOS = sơ đồ NV |
| MM-GAP-06 | Hồ sơ Cá nhân Master | UC-H01 · FR-UC-H01 · UC-HRM-21 · BR-HRM-LINK-01 | implemented | `PO-HRM-MVP-GD1-CORE-*` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-*` | 4 tab + scope; residual picker MD / U72 labels / J-* L2.5 |
| MM-GAP-07 | Hợp đồng Lao động | UC-HRM-25 · FR-UC-HRM-25 · HRM-CI-* | implemented | `PO-HRM-CTR-CREATE-*` · `HRM-CTR-U65-TPL-UV-FE-PATH-01` | HĐ GĐ1; BH list chuyên biệt vẫn waiver/partial — không kéo HĐ → MISSING |
| MM-GAP-08 | GPS/FaceID (Chấm công) | UC-H02 geofence · UC-HRM-MOB-04 · SRS mobile GPS | implemented (GPS) / MISSING (FaceID) | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-*` | **⚠ P0-MAP:** chỉ **GPS/geofence** GĐ1; FaceID/thiết bị cứng = GĐ2 — cấm scope creep BE/ mobile |
| MM-GAP-09 | Phân ca & Lịch trình | FR-HRM-SC-SHIFT-01 · `shifts` catalog · G-DB-05 shift TX | planned | `PO-HRM-MVP-GD1-ATT-03D-*` · SA dual `work_shifts` | Danh mục ca có; roster/lịch phân ca UI mỏng — không nghiệm thu «phân ca đầy đủ» |
| MM-GAP-10 | Giải trình & Chốt công | UC-HRM-09 · UC-HRM-23/32 · HRM-AT-14 · AC-ATT-SHEET-01..06 | implemented | `PO-HRM-MVP-GD1-ATT-11/12-CLUSTER-*` | Empty/storm honesty (sponsor 2026-07-21); chốt kỳ + bảng công IN_GĐ1 |
| MM-GAP-11 | Cấu hình Quỹ phép | UC-H03 balance · FR-HRM-SC-LEAVE-01 · `leave_types` | planned | `PO-HRM-ATT-LEAVE-LADDER-N-01` · `PO-HRM-SETTINGS-SRS-FIDELITY` (LVT) | Số dư + loại nghỉ có; admin quỹ/rollover — **⚠ P0-MAP:** dual SoT ATT LVT vs master-data |
| MM-GAP-12 | Nộp & Duyệt phép | FR-UC-H03 · UC-HRM-10 · UC-HRM-MOB-06/08 | implemented | `PO-HRM-MVP-GD1-ATT-04B-*` · `FR-HRM-AT-WF-01` | Web + mobile + inbox; residual manager-hat J-MOB |
| MM-GAP-13 | OT Đăng ký & Phê duyệt | FR-HRM-OT-01 (leftover ref) · orphan DDL G-DB-05 — **không** UC OT riêng GĐ1 | MISSING | `DOC-ENT-HRM-MMAP-SRS-01` (chờ Q1 sponsor) | **⚠ P0-MAP:** cấm implement module OT như GĐ1; chỉ tham chiếu «bù» trong phép |
| MM-GAP-14 | Quy đổi Hệ số OT | — | MISSING | defer GĐ2 · `FR-HRM-OT-01` nếu CR | **⚠ P0-MAP:** cấm suy ×1.5/×2 từ công thức lương cố định |
| MM-GAP-15 | Kế hoạch Khóa học (Đào tạo) | — | MISSING | GĐ2 · không WI execution | **⚠ P0-MAP:** cấm menu/DDL đào tạo trong wave Claude P0 |
| MM-GAP-16 | Khảo sát & Đánh giá (Đào tạo) | — | MISSING | GĐ2 | Không gộp vào HRM-PF |
| MM-GAP-17 | Gán chỉ tiêu & Trọng số (KPI/OKR) | HRM-PF-01..04 · FR-HRM-PF-01 · `kpi_library` | planned | `PO-HRM-MVP-GD1-CORE-09B-*` · BA_ERP_E3 | KPI chu kỳ có; **OKR + trọng số bắt buộc** chưa AC — **⚠ P0-MAP:** không embed P-CC KPI rollup thay PF |
| MM-GAP-18 | Cập nhật Tiến độ (KPI/OKR) | performance eval SM (E3) | planned | `PO-HRM-MVP-GD1-CORE-09D-*` | Eval state PARTIAL; OKR check-in % = GĐ2 |
| MM-GAP-19 | Tạo đợt Đánh giá (Review) | HRM-PF-01/02 · FR-HRM-PF-01 | implemented | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01` (sealed slice) | API chu kỳ có; AC-FID-13 / embed — ≠ business UAT đủ |
| MM-GAP-20 | 360 / Self-review | HRM-PF-03/04 · AC-PERF-* | planned | E3 delta sau sponsor Q4 | Self/manager hướng có; **360 multi-rater** = GĐ2 — **⚠ P0-MAP:** cấm UI «360 đủ» |
| MM-GAP-21 | Đề xuất Điều chuyển | UC-HRM-27 · FR-UC-HRM-27 · AC-DEC-01..04 | planned | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01` · DEC vertical | **⚠ P0-MAP:** matrix `waived`/live-empty — **cấm** DONE đến AC-DEC-DENSITY + create U65 |
| MM-GAP-22 | Timeline Công tác | UC-HRM-29 · Work History E1-A | planned | `PO-HRM-E2E-LINK-EMP-DOCS-01` · WH bind | Timeline app PARTIAL; deep-FR chưa lean |
| MM-GAP-23 | Quyết định Khen thưởng | UC-HRM-27 · `hr_decisions` · FR-HRM-SC-DEC-01 | planned | cùng DEC wave MM-GAP-21 | Subtype QSĐ — không module KT riêng |
| MM-GAP-24 | Vi phạm / Kỷ luật (log) | UC-HRM-27 (kỷ luật subtype) | planned | `DOC-ENT-HRM-MMAP-SRS-01` | Log vi phạm chuyên biệt **MISSING** ngoài QSĐ — GĐ2 hoặc delta DEC |
| MM-GAP-25 | Cấu hình Công thức Lương | FR-UC-H04 · FR-HRM-SC-PAY-01 · `salary_components` | planned | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-*` · `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01` | **⚠ P0-MAP:** tham số/thành phần cố định GĐ1 — **cấm** formula builder như mindmap |
| MM-GAP-26 | Tính toán & Phê duyệt lương | UC-HRM-24/31 · HRM-PR-01..04 · BR-PAY-LOCK | implemented | `PO-HRM-MVP-GD1-PAY-06..09-CLUSTER-*` | Chạy đợt + khóa kỳ GĐ1; giữ PAY01→PAY08 order (QC sealed) |
| MM-GAP-27 | Payslip Mật | UC-HRM-MOB-04/09 · HRM-PR-05 · AC blur mobile | implemented | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-*` | Hiển thị + blur GĐ1; PDF encrypt nâng cao = residual AC |

---

## Liên kết wave Claude P0 (không block — chỉ guard)

| Claude WI (pack 01) | gap_id liên quan | Guard |
|---------------------|------------------|--------|
| `D-HRM-CO-01-SUMMARY-BE-01` | (ngoài 27 lá — company headcount) | Plane B slug COUNT; không LE UUID — xem UC-HRM-CO-01 `planned` |
| `PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01` | MM-GAP-25..27 | Không payslip lifecycle PATCH; không hardcode 4 nhóm — BA PAY-09 pack |
| `PO-HRM-SETTINGS-CATALOG-CONSUMER-FE-01` | MM-GAP-02,11,17,25 | Consumer picker SoT Settings — không free-text |
| `HRM-CTR-U65-TPL-UV-FE-PATH-01` | MM-GAP-07 | Template path U65; ≠ printable UAT |

---

## Rollup (tham chiếu BRD — nội bộ)

| Module | implemented | planned | MISSING |
|--------|------------:|--------:|--------:|
| Tuyển dụng | 1 | 3 | 0 |
| Hồ sơ | 2 | 1 | 0 |
| Chấm công | 1 | 2 | 0 |
| Nghỉ phép | 1 | 1 | 0 |
| OT | 0 | 0 | 2 |
| Đào tạo | 0 | 0 | 2 |
| KPI/OKR | 0 | 2 | 0 |
| Review | 1 | 1 | 0 |
| Thuyên chuyển | 0 | 2 | 0 |
| KT-KL | 0 | 2 | 0 |
| Bảng lương | 2 | 1 | 0 |

---

## Sponsor open (không chặn code P0)

| ID | Câu hỏi | Ảnh hưởng gap_id |
|----|---------|------------------|
| Q1 | OT vào GĐ1? | MM-GAP-13,14 |
| Q2 | Đào tạo pilot GĐ1? | MM-GAP-15,16 |
| Q3 | Org-chart = XBOS đủ hay UI HRM? | MM-GAP-05 |
| Q4 | 360 bắt buộc GĐ1? | MM-GAP-20 |
| Q5 | Post-HIRED tối thiểu GĐ1? | MM-GAP-04 |

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Đã mint `BA-MINDMAP-GAP-DELTA-01.md`: **27/27** gap_id → SRS UC/FR · repo status · WI gợi ý · **11** dòng `⚠ P0-MAP` cho song song Claude. Không sửa `apps/**`; không rewrite BRD/SRS khách. |
| **residual** | Sponsor Q1–Q5; `DOC-ENT-HRM-MMAP-BRD-01` / SRS delta sau chốt bucket |
| **next_owner** | `pm` → `ba-docs` (BRD buckets) · `dev-be`/`dev-fe` đọc guard khi chạm REC/PAY/DEC |
| **evidence_path** | `docs/program/specs/BA-MINDMAP-GAP-DELTA-01.md` |
| **ack_status** | `PASS_TO_PM` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: DOC-ENT-HRM-MMAP-BRD-01
role: ba-docs
lane: governance
read_first:
  - docs/program/specs/BA-MINDMAP-GAP-DELTA-01.md (bảng 27 + rollup)
  - docs/qa/evidence/doc-ent-hrm-mmap-01.md §4 BRD buckets
  - docs/brand-new-documents-20270801/HRM_CUSTOMER_CAPABILITY_MINDMAP.md
  - docs/brand-new-documents-20270801/BRD_VN.md hoặc BRD pack lean (ADD-only)
entry_criteria: BA-MINDMAP-GAP-DELTA-01 PASS_TO_PM; Claude P0 không bị block
exit_criteria:
  - ADD mục «Bản đồ năng lực HRM» — (a) GĐ1 spine (b) hoàn thiện GĐ1 (c) mong muốn/GĐ2 — no_prompt_echo body khách
  - Không đưa OT/Đào tạo/FaceID/360 đầy đủ vào tiêu chí nghiệm thu GĐ1
  - evidence: docs/qa/evidence/doc-ent-hrm-mmap-brd-01.md
forbidden: apps/** · invent e2e_pass
ack_status target: PASS_TO_PM
```

*BA-MINDMAP-GAP-DELTA-01 — ba-process — 2026-08-10*
