# Evidence — DOC-ENT-HRM-MMAP-SRS-01

| Mục | Giá trị |
|-----|---------|
| work_item_id | DOC-ENT-HRM-MMAP-SRS-01 |
| role | ba-process |
| date | 2026-08-03 |
| change_mode | ADD-only |
| sources | `doc-ent-hrm-mmap-01.md` §2 PARTIAL + §4.2 · BRD_NEW §6.1 v1.4 (`doc-ent-hrm-mmap-brd-02.md`) · `SRS_NEW.md` v1.1→1.2 |
| ack_status | **PASS_TO_PM** |
| next_owner | pm → optional **sa** (TechSpec `ref_srs` AC-MMAP-*) / **ba-data** API/DB nếu cần |

## completion_report

### Đã đóng
- Nâng `SRS_NEW.md` **1.1 → 1.2** (header + nhật ký phiên bản + footer).
- Căn cứ BRD **v1.4**; §1.2 OUT rõ: OT · Đào tạo · FaceID · 360 · formula builder = **Sau GĐ1**.
- ADD **§3.7** inventory / AC stub hoàn thiện GĐ1:
  - §3.7.1 lá đã khóa hướng (giữ FR hiện có)
  - §3.7.2 **AC-MMAP-*** cho lá «Một phần»: RC-01/02/03, ORG-01, ATT-GPS, SHIFT-01 (phân ca ngoài «đầy đủ»), LV-FUND, PF-01, WH-01, DEC-KT, DEC-TR, PR-FORM, PAY-01
  - §3.7.3 bảng Sau GĐ1 — **không** FR sâu
- Inventory §3.1.2 / §3.5: GPS≠FaceID; HIRED→hồ sơ; quỹ phép pointer; phiếu mật.
- §6.1 ADD Q-ORG-01 / Q-LV-FUND / Q-SHIFT / Q-OT-TR; §6.2 xác nhận **vẫn 11 FR sâu**.

### Giữ nguyên (must_keep)
| Artifact | Status |
|----------|--------|
| 11 FR sâu P0 | Intact (B03, B04, H01, H03, H04, HRM-21, HRM-25, HRM-27, M01, M03, M06) |
| AC-HRM-EMBED-01..05 + AC-U18-* | Intact §3.3 |
| AC-HRM-MOB-* | Intact §3.4 |

### no_prompt_echo (client SRS body)
- Không `PARTIAL`/`MISSING`/`IN_GĐ1`/`work_item`/`docs/qa`
- Dùng GĐ1 / Một phần / Sau GĐ1 (khớp BRD §6.1)
- «pipeline» chỉ nghĩa nghiệp vụ tuyển dụng

### Spot-check
- [x] Không mở FR OT / Đào tạo / FaceID / 360 / formula builder
- [x] Offer formal / checklist đầy đủ = Fail/ngoài claim trên AC-MMAP-RC-01
- [x] Phân ca đầy đủ = ngoài nghiệm thu (AC-MMAP-SHIFT-01)
- [x] KT–KL honesty qua UC-HRM-27 (AC-MMAP-DEC-KT)
- [x] Forbidden paths: chỉ SRS_NEW + evidence này

## Residual (wave sau — không trong WI này)
| Residual | Owner gợi ý |
|----------|-------------|
| TECH_SPEC_NEW `ref_srs` → AC-MMAP-* / §3.7 | sa |
| API_CONTRACT / DB_DESIGN delta nếu SA yêu cầu cột/endpoint mới cho quỹ phép admin / org-chart UI | ba-data + sa |
| Sponsor CR kéo OT/Đào tạo vào GĐ1 | pm / sponsor — hiện giữ Sau GĐ1 |

## Files touched
| Path | Action |
|------|--------|
| `docs/brand-new-documents-20270801/SRS_NEW.md` | UPDATE v1.2 · §1.2 · inventory · §3.7 · §6.1/6.2 |
| `docs/qa/evidence/doc-ent-hrm-mmap-srs-01.md` | CREATE (file này) |

## Handoff
| Field | Value |
|-------|--------|
| from_role | ba-process |
| to_role | pm |
| ack_status | PASS_TO_PM |
| evidence_path | docs/qa/evidence/doc-ent-hrm-mmap-srs-01.md |
| next_owner | pm |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: DOC-ENT-HRM-MMAP-TS-01
role: sa
lane: governance
read_first:
  - docs/qa/evidence/doc-ent-hrm-mmap-srs-01.md
  - docs/brand-new-documents-20270801/SRS_NEW.md §3.7 (AC-MMAP-*)
  - docs/brand-new-documents-20270801/TECH_SPEC_NEW.md
  - docs/brand-new-documents-20270801/BRD_NEW.md §6.1 v1.4
entry_criteria: SRS v1.2 ADD-only PASS; 11 FR sâu không đổi
exit_criteria:
  - TECH_SPEC ADD-only ref_srs trỏ AC-MMAP-* / §3.7 (không FR sâu OT/Đào tạo/FaceID/360/builder)
  - Ghi residual API/DB nếu cần wave ba-data riêng
  - evidence: docs/qa/evidence/doc-ent-hrm-mmap-ts-01.md (hoặc path SA chọn)
forbidden: wipe TechSpec · apps/** · invent e2e_pass · expand GĐ2 FR
ack_status target: PASS_TO_PM
```

---

*DOC-ENT-HRM-MMAP-SRS-01 — ba-process — 2026-08-03*
