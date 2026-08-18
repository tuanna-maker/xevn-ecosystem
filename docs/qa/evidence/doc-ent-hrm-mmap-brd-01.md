# DOC-ENT-HRM-MMAP-BRD-01 — Evidence: BRD buckets «Bản đồ năng lực HRM»

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-ENT-HRM-MMAP-BRD-01` |
| **role** | ba-docs |
| **lane** | governance |
| **date** | 2026-08-10 |
| **entry_criteria** | `BA-MINDMAP-GAP-DELTA-01` PASS_TO_PM · `doc-ent-hrm-mmap-01.md` 27/27 |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `pm` |

---

## 1. Deliverables

| Artifact | Path | Mô tả |
|----------|------|--------|
| BRD khách (ADD) | `docs/client-delivery/hrm/BRD_HRM_KHACH.md` | Mục **10. Bản đồ năng lực HRM** — 3 bucket + mục 10.4; phiên bản **3.1**; mục 11 Tài liệu liên quan |
| Phụ lục slice | `docs/brand-new-documents-20270801/BRD_HRM_CAPABILITY_MINDMAP_SLICE.md` | Bản rút gọn khách (đồng bộ mục 10) |
| Team note | `docs/program/specs/DOC-ENT-HRM-MMAP-BRD-01_team.md` | Map gap_id → bucket; P0-MAP; Q1–Q5 |

## 2. Exit criteria checklist

| # | Tiêu chí | Kết quả |
|---|----------|---------|
| E1 | Ba bucket: Đang triển khai GĐ1 / Hoàn thiện GĐ1 / Mong muốn GĐ2 | PASS — mục 10.1–10.3 |
| E2 | Tiếng Việt chuyên nghiệp; không chat meta; không work_item trong body khách | PASS — spot-check slice + §10 |
| E3 | Không nhét OT / Đào tạo / FaceID / 360 đầy đủ vào nghiệm thu GĐ1 | PASS — chỉ cột 10.3 + ghi chú 10.2 |
| E4 | Honesty UC-HRM-27 / quyết định nhân sự | PASS — dòng quyết định trong 10.2 |
| E5 | Không sửa `apps/**` | PASS |
| E6 | no_prompt_echo | PASS |

## 3. QC spot-check (đề xuất)

- Ctrl+F body khách: `work_item`, `PARTIAL`, `MISSING`, `docs/program`, `pnpm`, `U65`, `e2e_pass` → **0** trên §10 và slice.
- Đối chiếu 27 lá: `DOC-ENT-HRM-MMAP-BRD-01_team.md` bảng gap_id.

## 4. Build / HTML

- Chưa chạy `pnpm docs:brd:html` cho phụ lục HRM (BRD tổng hợp OS tách file). **Residual PM:** quyết định merge HTML hoặc phụ lục PDF.

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Đã ADD mục 10 BRD HRM khách (3 bucket, 27 lá phủ qua bảng), phụ lục slice lean pack, team map gap_id. Không rewrite SRS; không claim Phase 1 DONE. |
| **residual** | Sponsor Q1–Q5; HTML promote; `DOC-ENT-HRM-MMAP-SRS-01` sau chốt bucket PARTIAL |
| **next_owner** | `pm` |
| **evidence_path** | `docs/qa/evidence/doc-ent-hrm-mmap-brd-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: DOC-ENT-HRM-MMAP-BRD-PM-01 (hoặc DOC-ENT-HRM-MMAP-SRS-01)
role: pm
lane: governance
read_first:
  - docs/qa/evidence/doc-ent-hrm-mmap-brd-01.md
  - docs/client-delivery/hrm/BRD_HRM_KHACH.md §10
  - docs/program/specs/DOC-ENT-HRM-MMAP-BRD-01_team.md
entry_criteria: DOC-ENT-HRM-MMAP-BRD-01 PASS_TO_PM
exit_criteria:
  - PM: sponsor review Q1–Q5 hoặc ghi defer; quyết định HTML (merge BRD OS vs phụ lục HRM)
  - Nếu SRS delta: dispatch DOC-ENT-HRM-MMAP-SRS-01 (ba-process|ba-docs) chỉ PARTIAL GĐ1 đã chốt — không full FR rewrite
  - Cập nhật bus DISPATCHED → verdict
ack_status target: PASS_TO_USER hoặc dispatch SRS wave
```

---

*DOC-ENT-HRM-MMAP-BRD-01 — ba-docs — 2026-08-10*
