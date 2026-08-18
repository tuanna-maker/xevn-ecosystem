# Evidence — PO-HRM-REC-E2E-LINKAGE-DOCS-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-REC-E2E-LINKAGE-DOCS-01` |
| from_role | ba-docs |
| to_role | pm |
| lane | governance |
| change_mode | ADD-only |
| date | 2026-08-06 |
| SoT merged | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` |
| source drafts | `docs/program/specs/PO-HRM-REC-E2E-LINKAGE-SPEC-01.md` §3.1–§3.3 |
| ack_status | **PASS_TO_PM** |

## Honesty locks

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| FORBIDDEN dual-write `job_postings` as JD / compare / UV SoT | **true** (prose client: tin đăng / chiến dịch = OUT MVP; REC-03 stub giữ) |
| U65 zero-seed | **true** (docs only — no seed) |
| Touched `apps/**` | **false** |

## Before → After (§ refs)

| Delta SPEC | Before (v0.10) | After (v0.11) |
|------------|----------------|---------------|
| §3.1 Thêm UV / YCTD bắt buộc · vị trí derived | MVP nói «UV gắn bắt buộc YCTD» nhưng **không** có FR 7-mục tạo UV; REC-05 chỉ pipeline sau khi đã gắn | **ADD** `FR-UC-BP-REC-05a` (sau REC-05): picker YCTD bắt buộc · vị trí derived · empty 0 YCTD · AC-REC-UV-01..04 · sequence + Diễn biến |
| §3.2 So sánh theo YCTD | Không FR matrix; REC-06 = thư + đánh giá từng UV | **ADD** `FR-UC-BP-REC-06b` (sau REC-06): SoT = YCTD · empty 0 YCTD / 0 UV · max N · AC-REC-CMP-01..05 · cấm lọc tin đăng MVP |
| §3.3 «Kế hoạch tuyển» ↔ định biên | REC-01 đủ FR nhưng thiếu ánh xạ nhãn UI | DOC-DELTA: §1.3 thuật ngữ mới · callout trên `FR-UC-BP-REC-01` · vị trí/đơn vị = danh mục · chỉ **Cần tuyển** |
| Inventory | **50** UC | **52** UC (+ `UC-BP-REC-05a` · `UC-BP-REC-06b` trong bảng §3.A) |
| REC-03 | OUT / GĐ2 stub | **Giữ nguyên** — không mở GĐ1 |

## must_keep checklist

- [x] REC-03 / tin đăng standalone OUT (GĐ2) — stub không wipe
- [x] no wipe stubs REC-04…07 (chỉ ADD + cross-ref một dòng)
- [x] no_prompt_echo trên prose khách (không work_item / sponsor chat / path code trong FR)
- [x] FORBIDDEN tin đăng làm SoT so sánh / tạo UV ở MVP
- [x] NO `apps/**`

## Version / changelog

- Header phiên bản → **0.11**
- §6.2 nhật ký: hàng **0.11** 2026-08-06
- Footer: *Hết bản SRS v0.11…* — không claim nghiệm thu vận hành tuyển dụng

## Spot-check FR 7 mục

| FR | Thông tin chung | Đầu vào | Luồng chính | Quy tắc | Đặc biệt | sequenceDiagram | Diễn biến |
|----|-----------------|---------|-------------|---------|----------|-----------------|-----------|
| FR-UC-BP-REC-05a | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (+ bảng AC) |
| FR-UC-BP-REC-06b | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (+ bảng AC) |

## Residual (không đóng bởi docs)

| Residual | Owner next |
|----------|------------|
| TechSpec F.1 + DB/API cho create UV (`requisition` bắt buộc MVP) + compare YCTD | **sa** (`PO-HRM-REC-UV-YCTD-TECH-01` cascade) |
| FE free-text position / compare stub / plan UI lệch định biên | **dev-fe/be** sau TechSpec — ngoài wave docs |
| Console dialog / DnD JD | lane FE riêng — `jd_dynamic_done=false` |

## Completion contract

- `completion_report`: Merged SPEC §3.1–§3.3 ADD-only into enterprise SRS **v0.11**; inventory 52; REC-03 OUT kept; honesty `recruitment_uat_ready=false`.
- `next_owner`: **sa** (UV/compare TechSpec cascade) — hoặc **pm** synth + giữ P0 FE console song song.
- `next_dispatch_prompt`: copy-ready bên dưới.
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/po-hrm-rec-e2e-linkage-docs-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-REC-UV-YCTD-TECH-01
from_role: pm
to_role: sa
lane: governance
change_mode: ADD
ack_target: PASS_TO_PM

read_first:
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.11 — FR-UC-BP-REC-05a · 06b · REC-01 terminology
  - docs/program/specs/PO-HRM-REC-E2E-LINKAGE-SPEC-01.md §4 cascade
  - docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md (REC map)

task:
  - ADD TechSpec F.1 + matrix rows for Thêm UV (YCTD bắt buộc, position_key / derived) và So sánh theo YCTD
  - Trace Diễn biến 05a / 06b → API mục đích + bước SRS
  - FORBIDDEN dual-write job_postings as JD/compare/UV SoT; REC-03 OUT
  - honesty: recruitment_uat_ready=false · jd_dynamic_done=false
  - NO apps/**

evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-tech-01.md
exit: completion_report + next_dispatch_prompt (DB/API or ba-data) + PASS_TO_PM
```
