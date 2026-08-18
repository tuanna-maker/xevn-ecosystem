# Evidence — DOC-ENT-HRM-MMAP-BRD-02

| Mục | Giá trị |
|-----|---------|
| work_item_id | DOC-ENT-HRM-MMAP-BRD-02 |
| role | ba-docs |
| date | 2026-08-03 |
| change_mode | ADD / UPDATE (§6.1 only) |
| source_matrix | `docs/qa/evidence/doc-ent-hrm-mmap-01.md` §2 · §3 · §4 |
| ack_status | **PASS_TO_PM** |
| next_owner | pm → optional **DOC-ENT-HRM-MMAP-SRS-01** (PARTIAL GĐ1 only) |

## completion_report

### Đã đóng
- Nâng `BRD_NEW.md` **1.3 → 1.4** (changelog + header + footer).
- Đồng bộ **§6.1** (chú thích cột + tổng quan 11 module + bảng 27 lá) theo buckets matrix:
  - Bỏ toàn bộ nhãn **«Chờ chốt»** trên body §6.1 (chỉ còn nhắc trong changelog 1.4).
  - **OT ×2** · **Đào tạo ×2** → **Sau GĐ1** (không GĐ1 AC).
  - FaceID · phân ca roster đầy đủ · 360 đa rater · formula builder · OKR tiến độ liên tục · offer/checklist đầy đủ → **Sau GĐ1** hoặc ghi chú hoàn thiện trung thực.
  - IN_GĐ1 → **GĐ1**; PARTIAL → **Một phần** (khớp matrix).
- Giữ link hình `assets/hrm-capability-mindmap-sponsor-20260803.png`.
- **§9 giữ nguyên** (không wipe / không rewrite).

### Mapping nhanh (lá đã đổi từ v1.3)

| Lá | v1.3 | v1.4 (theo matrix) |
|----|------|---------------------|
| Lịch hẹn PV | Chờ chốt | Một phần |
| Sơ đồ tổ chức | GĐ1 | Một phần |
| Phân ca & lịch | Chờ chốt | Một phần (+ roster đầy đủ Sau GĐ1) |
| Quỹ phép | GĐ1 | Một phần |
| OT đăng ký · hệ số | Chờ chốt / Một phần | Sau GĐ1 ×2 |
| KPI gán · tiến độ | Sau GĐ1 | Một phần (OKR liên tục: Sau GĐ1) |
| Tạo đợt đánh giá | Sau GĐ1 | GĐ1 |
| 360 / Self | Sau GĐ1 | Một phần (360: Sau GĐ1) |
| Công thức lương | GĐ1 / Chờ chốt | Một phần (builder: Sau GĐ1) |

### Residual
- SRS delta **PARTIAL GĐ1** (pipeline/CV, lịch PV E2E, quỹ phép, org-chart UI, timeline, DEC density…) → wave riêng `DOC-ENT-HRM-MMAP-SRS-01` — **không** trong WI này.
- Sponsor vẫn có thể CR kéo OT/Đào tạo vào GĐ1 — BRD hiện giữ ngoài nghiệm thu.

### no_prompt_echo
- Body BRD: không `PARTIAL`/`MISSING`/`IN_GĐ1`/`work_item`/`docs/qa`; dùng GĐ1 / Một phần / Sau GĐ1.

## Files touched
| Path | Action |
|------|--------|
| `docs/brand-new-documents-20270801/BRD_NEW.md` | UPDATE §6.1 · version 1.4 |
| `docs/qa/evidence/doc-ent-hrm-mmap-brd-02.md` | CREATE (file này) |

## Spot-check
- [x] Không còn «Chờ chốt» trong §6.1 body (grep: chỉ changelog 1.4)
- [x] Image path + §13 trỏ ảnh giữ nguyên
- [x] §9 heading + bảng hoàn thiện vẫn đủ 7 dòng
- [x] OT / Đào tạo = Sau GĐ1 trên cả module overview và leaf table
- [x] Forbidden paths không đụng (SRS/TechSpec/DB/API/apps)

## next_dispatch_prompt

```text
work_item_id: DOC-ENT-HRM-MMAP-SRS-01
role: ba-process | ba-docs
lane: governance
read_first:
  - docs/qa/evidence/doc-ent-hrm-mmap-01.md (§2 PARTIAL + §4.2)
  - docs/brand-new-documents-20270801/BRD_NEW.md §6.1 v1.4
  - docs/brand-new-documents-20270801/SRS_NEW.md
entry_criteria: BRD §6.1 đã sync matrix; chỉ delta PARTIAL GĐ1
exit_criteria:
  - SRS_NEW ADD-only FR/AC/inventory cho lá «Một phần» trong GĐ1
  - Không đưa OT / Đào tạo / FaceID / 360 đầy đủ / formula builder vào AC GĐ1
  - evidence: docs/qa/evidence/doc-ent-hrm-mmap-srs-01.md
forbidden: wipe SRS · invent e2e_pass · apps/**
ack_status target: PASS_TO_PM
```

## Handoff
| Field | Value |
|-------|--------|
| from_role | ba-docs |
| to_role | pm |
| ack_status | PASS_TO_PM |
| evidence_path | docs/qa/evidence/doc-ent-hrm-mmap-brd-02.md |
| next_owner | pm |
| completion_report | BRD_NEW v1.4 §6.1 synced to mmap-01 buckets; «Chờ chốt» removed; §9 preserved; image kept |
