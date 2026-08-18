# DOC-ENT-HRM-MMAP-01 — Gap matrix: mindmap khách ↔ pack lean + legacy SRS

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-ENT-HRM-MMAP-01` |
| **role** | ba-process |
| **date** | 2026-08-03 |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `ba-docs` |
| **sources** | `HRM_CUSTOMER_CAPABILITY_MINDMAP.md` (+ `assets/hrm-capability-mindmap-sponsor-20260803.png`) · `BRD_NEW.md` v1.2 · `SRS_NEW.md` v1.1 · `docs/hrm/SRS.md` (skim RC/AT/PR/PF/DEC) · `hrm-business-completeness-audit-20260524.md` · skim ENTERPRISE_HRM / FLOWS reports |
| **forbidden_ack** | Không rewrite BRD/SRS đầy đủ · không claim Phase 1 DONE · không invent e2e_pass |

---

## 1. Mục tiêu & quy ước trạng thái

Mindmap = **nhu cầu mong muốn khách** (sponsor 2026-08-03), **chưa** khóa phạm vi GĐ1. Matrix map từng **lá** → pack lean (`BRD_NEW` / `SRS_NEW`) + legacy (`docs/hrm/SRS.md` · catalog 119 UC · audit 2026-05-24).

| Status | Nghĩa vận hành (BA) |
|--------|---------------------|
| **IN_GĐ1** | Đã nằm trong phạm vi GĐ1 đã công bố (BRD §4 / spine SRS) **và** có UC/FR neo được — **không** đồng nghĩa E2E/DONE |
| **PARTIAL** | Có neo UC/API/menu nhưng **thiếu** nhánh lá mindmap / AC đo được / mật độ / stub honesty |
| **MISSING** | Không có UC/FR đủ trong pack lean **và** không map rõ trong catalog 119 (hoặc chỉ orphan DDL không `ref_srs`) |
| **GĐ2_CANDIDATE** | Nên ghi BRD như «mong muốn / giai đoạn sau» — **không** đưa vào nghiệm thu GĐ1 như chức năng sống |

> Audit honesty: `impl_status=be` / load tab ≠ business complete; UC-HRM-27 live-empty ≠ DONE (`AC-DEC-DENSITY`); FaceID / đào tạo / hệ số OT / 360 đầy đủ / Offer formal — không được tuyên bố đã có.

---

## 2. Gap matrix — đủ 27 lá mindmap

| Module | Leaf capability | Status | Existing UC/FR/ref | Notes (AC gap / stub) |
|--------|-----------------|--------|--------------------|------------------------|
| Tuyển dụng | Quản lý Yêu cầu | IN_GĐ1 | HRM-RC-01/02 · UC-HRM-22 · FR-HRM-RC-01 · BRD §6 HRM-RC · SRS_NEW UC-H05/UC-HRM-22 | Requisition create/list trong GĐ1; residual: submit→inbox WF (U65), density ~1% (audit), dual catalog twin — **không** claim FR full DONE |
| Tuyển dụng | Pipeline & CV Ứng viên | PARTIAL | HRM-RC-03/04 · UC-H05 · UC-HRM-30 · SRS_NEW «pipeline cố định» · OUT dynamic P2 | Pipeline 5-state cố định IN_GĐ1; CV/upload sâu + funnel display catalog **PARTIAL**; BRD/SRS drift «13-step dynamic» = **không** GĐ1 (ENTERPRISE report) |
| Tuyển dụng | Lịch hẹn Phỏng vấn | PARTIAL | HRM-RC-05/06 · FR-HRM-RC-05 · UC-HRM-30 | Schedule + cập nhật kết quả có API spine `recruitment_interviews`; AC browser list→detail mỏng; cấm bind catalog twin làm SoT |
| Tuyển dụng | Offer & Onboarding | PARTIAL | UC-H05 HIRED→hồ sơ · FR-HRM-INT-01 (spine) · SRS_NEW §2.3 #6 | **HIRED → tạo NV** có; **Offer letter / checklist onboarding hậu HIRED** thiếu UC riêng → promote BRD «mong muốn» hoặc SRS delta hẹp; ENTERPRISE: không onboarding workflow |
| Hồ sơ Nhân sự | Sơ đồ Tổ chức | PARTIAL | XBOS org / departments · UC-B04 danh mục · BRD pháp nhân & tổ chức · không FR «org-chart» trong SRS_NEW | Cây phòng ban/XBOS **IN_GĐ1** dữ liệu; **sơ đồ trực quan HRM** (chart UI) chưa FR lean → AC gap; không nhầm WF canvas XBOS |
| Hồ sơ Nhân sự | Hồ sơ Cá nhân Master | IN_GĐ1 | UC-H01 · FR-UC-H01 · UC-HRM-21 · FR-UC-HRM-21 · BR-HRM-LINK-01 | 4 tab + soft-delete + scope; residual L2.5 / picker MD / label U72 — không đổi status lá |
| Hồ sơ Nhân sự | Hợp đồng Lao động | IN_GĐ1 | UC-HRM-25 · FR-UC-HRM-25 · HRM-CI-* · AC-HRM-EMBED-03 | HĐ trong GĐ1; **BH list chuyên biệt** vẫn gap/waiver (EG-01 / Q-INS-01) — ghi PARTIAL ở AC BH, không kéo HĐ ra MISSING |
| Chấm công | Tích hợp Thiết bị GPS/FaceID | PARTIAL | UC-H02 GPS/geofence · UC-M02 · SRS_NEW inventory H02 · BRD di động chấm công | **GPS/geofence IN_GĐ1**; **FaceID / thiết bị cứng** không có UC khóa → **GĐ2_CANDIDATE** phần FaceID (ghi Notes; status lá = PARTIAL) |
| Chấm công | Phân ca & Lịch trình | PARTIAL | `shifts` catalog · FR-HRM-SC-SHIFT-01 (HOLD dual) · DM shifts | Danh mục ca có; **lịch phân ca / roster UI** mỏng / orphan shift TX (G-DB-05) → không nghiệm thu «phân ca đầy đủ» GĐ1 |
| Chấm công | Giải trình & Chốt công | IN_GĐ1 | UC-HRM-09 update-requests · HRM-AT-14 / AC-ATT-SHEET-01..06 · UC-HRM-23/32 | Giải trình + bảng công/chốt kỳ bảng **IN_GĐ1**; density ~6% + storm/empty AC phải giữ honesty (sponsor 2026-07-21) |
| Nghỉ phép | Cấu hình Quỹ phép | PARTIAL | UC-H03 số dư · `leave_types` · `GET leave-balance` · XBOS-DM leave | Số dư + loại nghỉ có; **cấu hình quỹ / rollover năm / UI admin quỹ** thiếu AC đo được (ENTERPRISE leave rollover gap) |
| Nghỉ phép | Nộp & Duyệt phép | IN_GĐ1 | FR-UC-H03 · UC-HRM-10 · UC-M03 · BR-WF-SELF · AC-HRM-MOB-J* | Web + mobile + hộp thư; residual manager-hat / J-MOB approve — không đổi IN_GĐ1 |
| Tăng ca OT | Đăng ký & Phê duyệt | MISSING | Orphan overtime DDL/API note G-DB-05 · UC-H03 loại «Bù» tham chiếu OT đã duyệt | **Không** UC OT riêng trong SRS_NEW / catalog 119 rõ; chỉ hệ quả phép bù — **GĐ2_CANDIDATE** trừ khi sponsor kéo vào GĐ1 bằng delta |
| Tăng ca OT | Quy đổi Hệ số OT | MISSING | — (không FR hệ số OT trong lean pack) | Hệ số ×1.5/×2… **MISSING** → BRD mong muốn / GĐ2; cấm suy diễn từ công thức lương cố định |
| Đào tạo | Kế hoạch Khóa học | MISSING | — (không HRM-TR-* trong 119 UC) | Ngoài pack lean + matrix Phase 1 → **GĐ2_CANDIDATE** |
| Đào tạo | Khảo sát & Đánh giá | MISSING | — | Survey/course eval **MISSING** → **GĐ2_CANDIDATE**; không gộp vào HRM-PF |
| KPIs & OKRs | Gán chỉ tiêu & Trọng số | PARTIAL | HRM-PF-01..04 · `kpi_library` · BA_ERP_E3 · FR-HRM-PF-01 | KPI gắn chu kỳ/eval **có**; **OKR framework + trọng số bắt buộc** chưa AC đầy đủ; không embed P-CC (TR-09) |
| KPIs & OKRs | Cập nhật Tiến độ | PARTIAL | performance evaluations SM (E3) | Cập nhật trạng thái phiếu/eval **PARTIAL**; tiến độ OKR liên tục (check-in %) **GĐ2_CANDIDATE** |
| Review Đánh giá | Tạo đợt Đánh giá | IN_GĐ1 | HRM-PF-01/02 · FR-HRM-PF-01 · audit domain PF | Tạo/xem chu kỳ IN_GĐ1 API; AC-FID-13 / menu embed mở — **không** e2e_pass nghiệp vụ |
| Review Đánh giá | Thực hiện 360/Self-review | PARTIAL | HRM-PF-03/04 · eval SM draft→…→completed · AC-PERF-* (E3 delta) | Self/manager path có hướng; **360 đa người đánh giá** chưa FR lean → phần 360 = **GĐ2_CANDIDATE** |
| Lịch sử Thuyên chuyển | Tạo đề xuất Điều chuyển | PARTIAL | UC-HRM-27 / FR-UC-HRM-27 · `decision_types` (thuyên chuyển) · AC-DEC-01..04 | Quyết định gồm loại thuyên chuyển; **workflow đề xuất riêng** mỏng; **cấm** DONE đến AC-DEC-DENSITY + create U65 |
| Lịch sử Thuyên chuyển | Tra cứu Timeline Công tác | PARTIAL | UC-HRM-29 · Work History / Timeline (E1-A MD bind) · không FR sâu SRS_NEW | Timeline/WH trên app HRM **PARTIAL**; lean pack chưa deep-FR — SRS delta nếu đưa vào nghiệm thu GĐ1 |
| Khen thưởng Kỷ luật | Quyết định Khen thưởng | PARTIAL | UC-HRM-27 · `hr_decisions` · decision_types | KT là subtype quyết định — không module KT riêng; CRUD/density mở (audit STUB→live-empty) |
| Khen thưởng Kỷ luật | Ghi nhận Vi phạm/Kỷ luật | PARTIAL | UC-HRM-27 (kỷ luật) | Ghi nhận vi phạm chuyên biệt (log/lũy kế) **MISSING** ngoài QSĐ generic → Notes GĐ2 hoặc delta DEC |
| Bảng lương | Cấu hình Công thức Lương | PARTIAL | FR-UC-H04 công thức tham chiếu cố định · `salary_components` / `payroll_templates` DM | Thành phần lương + template catalog **PARTIAL**; **builder công thức cấu hình được** = **GĐ2_CANDIDATE** |
| Bảng lương | Tính toán & Phê duyệt | IN_GĐ1 | FR-UC-H04 · HRM-PR-01..04 · UC-HRM-24/31 · BR-PAY-LOCK | Chạy đợt + khóa kỳ GĐ1; chuỗi 6 bước / process AC còn PARTIAL verify (G-PR-03) |
| Bảng lương | Phát hành Payslip Mật | IN_GĐ1 | UC-M04 · AC-HRM-MOB-J04 · HRM-PR-05 · NFR blur SRS mobile | Xem phiếu + blur/bảo mật hiển thị IN_GĐ1 hướng; PDF encrypt/key mgmt gap (ENTERPRISE) = AC residual, không MISSING lá |

**Đếm lá:** Tuyển dụng 4 · Hồ sơ 3 · Chấm công 3 · Nghỉ 2 · OT 2 · Đào tạo 2 · KPI 2 · Review 2 · Thuyên chuyển 2 · KT-KL 2 · Lương 3 = **27/27**.

---

## 3. Rollup theo module (cho BRD wording)

| Module | IN_GĐ1 | PARTIAL | MISSING | GĐ2 tín hiệu chính |
|--------|-------:|--------:|--------:|--------------------|
| Tuyển dụng | 1 | 3 | 0 | Offer formal · dynamic 13-step · CV sâu |
| Hồ sơ | 2 | 1 | 0 | Org-chart UI |
| Chấm công | 1 | 2 | 0 | FaceID · roster đầy đủ |
| Nghỉ phép | 1 | 1 | 0 | Cấu hình quỹ/rollover |
| OT | 0 | 0 | 2 | Cả hai lá → mong muốn GĐ2 (hoặc CR GĐ1) |
| Đào tạo | 0 | 0 | 2 | Cả module GĐ2 |
| KPIs & OKRs | 0 | 2 | 0 | OKR tiến độ liên tục |
| Review | 1 | 1 | 0 | 360 đa rater |
| Thuyên chuyển | 0 | 2 | 0 | Đề xuất WF + Timeline deep-FR |
| KT-KL | 0 | 2 | 0 | Tách log vi phạm vs QSĐ |
| Bảng lương | 2 | 1 | 0 | Formula builder |

---

## 4. Recommended BRD wording buckets

### 4.1 Đã thuộc GĐ1 — giữ / làm rõ trong §4–§6 / §9 (không downgrade)

Dùng ngôn ngữ **đã công bố**, bổ sung honesty «đủ liên kết / không stub giả»:

- Hồ sơ cá nhân master · hợp đồng (BH: tách hoặc waiver có chủ)
- Chấm công GPS + giải trình/chốt bảng công · nghỉ nộp/duyệt · lương tính/khóa kỳ · payslip (kèm bảo mật hiển thị)
- Tuyển dụng: yêu cầu tuyển · pipeline cố định · (lịch PV ở mức có API)
- Nhúng 8 màn · di động chấm/nghỉ/phiếu lương
- Quyết định nhân sự: **có API / live-empty hợp lệ** — **không** tuyên bố vận hành đầy đủ mật độ (BRD §4.2 đã có dòng tương tự UC-HRM-27)

### 4.2 GĐ1 nhưng PARTIAL — BRD §9 «hoàn thiện» / không claim nghiệm thu đủ lá

Ghi là nhu cầu hoàn thiện **trong** GĐ1 (đã có hướng UC), **chưa** đủ để «xong»:

- Pipeline/CV độ sâu · lịch PV E2E · HIRED→onboard tối thiểu
- Sơ đồ tổ chức (dữ liệu XBOS vs UI chart)
- Phân ca (catalog vs lịch)
- Quỹ phép cấu hình
- KPI/chu kỳ đánh giá (không OKR đầy đủ)
- Thuyên chuyển / KT-KL qua quyết định (CRUD + density)
- Công thức lương = tham số/thành phần, không builder

### 4.3 Mong muốn khách / GĐ2 (hoặc CR tường minh) — **không** nhét nghiệm thu GĐ1

Khuyến nghị câu BRD kiểu: *«Nhu cầu bổ sung từ bản đồ năng lực khách (08/2026); **ngoài** nghiệm thu Giai đoạn 1 trừ khi có quyết định mở rộng phạm vi.»*

| Bucket BRD | Lá / nhóm |
|------------|-----------|
| **GĐ2 / mong muốn** | Đào tạo (kế hoạch khóa · khảo sát) |
| **GĐ2 / mong muốn** | OT đăng ký–duyệt · quy đổi hệ số OT |
| **GĐ2 / mong muốn** | FaceID / thiết bị chấm công cứng (giữ GPS GĐ1) |
| **GĐ2 / mong muốn** | 360 đa rater · OKR cập nhật tiến độ liên tục |
| **GĐ2 / mong muốn** | Offer formal + onboarding checklist đầy đủ |
| **GĐ2 / mong muốn** | Formula builder lương · PDF payslip mã hóa nâng cao |
| **GĐ2 / mong muốn** | Nhật ký vi phạm chuyên biệt (nếu tách khỏi QSĐ) |

### 4.4 Cấm khi promote BRD

- Không copy path `docs/` · work_item · «PARTIAL/MISSING» vào body khách.
- Không đổi màu mindmap thành P0/P1.
- Không tuyên bố 27/27 lá đã vận hành vì có menu.

---

## 5. Ảnh hưởng pack lean (không sửa trong wave này)

| Artifact | Hành động đề xuất (wave sau) |
|----------|------------------------------|
| `BRD_NEW.md` | ADD § ngắn «Bản đồ năng lực HRM mong muốn» + bảng GĐ1 vs mong muốn/GĐ2 — **DOC-ENT-HRM-MMAP-BRD-01** |
| `SRS_NEW.md` | Chỉ delta ADD khi sponsor chốt bucket; ưu tiên PARTIAL GĐ1 (onboard tối thiểu, OT nếu kéo vào, Timeline FR) — **DOC-ENT-HRM-MMAP-SRS-01** |
| Legacy `docs/hrm/SRS.md` | Giữ SoT sâu; lean pack trỏ inventory — không wipe |

---

## 6. Assumptions / open questions (cho PM)

| # | Câu hỏi | Owner gợi ý |
|---|---------|-------------|
| Q1 | OT + hệ số: kéo vào GĐ1 (CR) hay giữ GĐ2? | Sponsor / PM |
| Q2 | Đào tạo: GĐ2 chắc chắn hay pilot mỏng GĐ1? | Sponsor |
| Q3 | «Sơ đồ tổ chức» = cây XBOS đủ hay bắt buộc chart UI HRM? | BA-docs + SA |
| Q4 | 360: self+manager đủ GĐ1 hay bắt buộc multi-rater? | Sponsor |
| Q5 | Offer/Onboarding: bước tối thiểu post-HIRED trong GĐ1 là gì? | ba-process delta sau chốt |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Đã map **27/27** lá mindmap → IN_GĐ1 / PARTIAL / MISSING (+ tín hiệu GĐ2). Rollup + BRD wording buckets sẵn cho ba-docs. Không rewrite BRD/SRS; không claim DONE/e2e_pass. |
| **residual** | Sponsor chưa chốt Q1–Q5; SRS delta chờ sau BRD wording confirm |
| **next_owner** | ba-docs |
| **evidence_path** | `docs/qa/evidence/doc-ent-hrm-mmap-01.md` |
| **ack_status** | `PASS_TO_PM` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: DOC-ENT-HRM-MMAP-BRD-01
role: ba-docs
lane: governance
read_first:
  - docs/qa/evidence/doc-ent-hrm-mmap-01.md (§2 matrix + §4 BRD buckets)
  - docs/brand-new-documents-20270801/HRM_CUSTOMER_CAPABILITY_MINDMAP.md
  - docs/brand-new-documents-20270801/BRD_NEW.md (v1.2 — ADD-only)
entry_criteria: Gap matrix PASS_TO_PM; không wipe BRD; no_prompt_echo trên body khách
exit_criteria:
  - ADD vào BRD_NEW: mục «Bản đồ năng lực HRM (mong muốn khách)» — phân tách rõ (a) đã GĐ1 (b) hoàn thiện trong GĐ1 (c) mong muốn/GĐ2
  - Không nhét FaceID/OT/Đào tạo/360 đầy đủ vào tiêu chí nghiệm thu GĐ1
  - Giữ honesty UC-HRM-27 / stub; không claim Phase 1 DONE
  - evidence: docs/qa/evidence/doc-ent-hrm-mmap-brd-01.md
forbidden: apps/** · rewrite full SRS · invent e2e_pass
after_pass: PM may dispatch DOC-ENT-HRM-MMAP-SRS-01 (ba-process|ba-docs) chỉ cho PARTIAL GĐ1 sponsor đã chốt — không full FR rewrite
ack_status target: PASS_TO_PM
```

---

*DOC-ENT-HRM-MMAP-01 — ba-process — 2026-08-03*
