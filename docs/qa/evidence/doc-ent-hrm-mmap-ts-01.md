# Evidence — DOC-ENT-HRM-MMAP-TS-01

| Mục | Giá trị |
|-----|---------|
| work_item_id | DOC-ENT-HRM-MMAP-TS-01 |
| role | sa |
| lane | governance |
| date | 2026-08-03 |
| change_mode | ADD-only |
| deliverable | `docs/brand-new-documents-20270801/TECH_SPEC_NEW.md` **v1.1 → v1.2** |
| sources | `doc-ent-hrm-mmap-srs-01.md` · SRS_NEW v1.2 §3.7 AC-MMAP-* · BRD_NEW §6.1 v1.4 · OS `13` §3.4.11 ref_srs |
| ack_status | **PASS_TO_PM** |
| next_owner | pm → optional **ba-data** (API/DB delta chỉ residual vật lý) / **qc** docs spot |

## completion_report

### Đã đóng
- Nâng `TECH_SPEC_NEW.md` **1.1 → 1.2** (header `ref_srs` → SRS **v1.2** §3.7; nhật ký; footer).
- ADD hàng `ref_srs` §1: AC-MMAP-RC/ORG/ATT/SHIFT/PF/WH + neo AC-MMAP vào H03/H04/HRM-27.
- ADD **§4.12** stub kỹ thuật: map từng AC-MMAP-* → mô-đun TS hiện có / endpoint logic phân hệ (không FR sâu mới).
- ADD **§4.12.1 OUT/GĐ2**: OT · Đào tạo · FaceID · 360 · formula builder (+ offer formal / roster đầy đủ) — cấm FR/DDL NEW pack.
- §5 conceptual: Candidate / WorkHistoryLine inventory pointers (không cột vật lý).
- §8 residual R-MMAP-* cho wave ba-data/sa — **không invent DDL** tại TechSpec.
- §4.1–§4.11 (11 FR sâu P0) **giữ nguyên** nội dung Diễn biến.

### must_keep (spot-check)
| Artifact | Status |
|----------|--------|
| §4.1–§4.11 eleven deep FR maps | Intact |
| Scope ladder §2.2 / ownership §3 | Intact |
| No apps/** | Confirmed |
| No e2e_pass invent | Confirmed |
| No GĐ2 expanded as GĐ1 FR | Confirmed §4.12.1 + R-MMAP-OUT |

### Residual (không đóng trong WI này)
| ID | Nội dung | Owner gợi ý |
|----|----------|-------------|
| R-MMAP-API-RC | Recruitment / lịch PV F.1 tối thiểu trên API_CONTRACT (hiện pointer phân hệ) | ba-data + sa — chỉ Pass AC-MMAP-RC-* |
| R-MMAP-DB-LV | Admin quỹ / rollover nếu product kéo vào GĐ1 | ba-data — mặc định không claim |
| R-MMAP-API-ORG | Chart UI sơ đồ Nhân sự | Ngoài Pass cây XBOS — không DDL bắt buộc |
| R-MMAP-PF | Performance inventory depth | Pointer; cấm DDL 360/OKR |
| R-MMAP-OUT | OT / Đào tạo / FaceID / 360 / builder | Giữ OUT tới CR sponsor |

### Files touched
| Path | Action |
|------|--------|
| `docs/brand-new-documents-20270801/TECH_SPEC_NEW.md` | UPDATE v1.2 ADD-only |
| `docs/qa/evidence/doc-ent-hrm-mmap-ts-01.md` | CREATE (file này) |

### Forbidden respected
- Không wipe TechSpec · không apps/** · không invent e2e_pass · không mở FR OT/Đào tạo/FaceID/360/builder · không wipe BRD/SRS

## Handoff

| Field | Value |
|-------|--------|
| from_role | sa |
| to_role | pm |
| ack_status | PASS_TO_PM |
| evidence_path | docs/qa/evidence/doc-ent-hrm-mmap-ts-01.md |
| next_owner | pm |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: DOC-ENT-HRM-MMAP-API-DB-01
role: ba-data
lane: governance
read_first:
  - docs/qa/evidence/doc-ent-hrm-mmap-ts-01.md
  - docs/brand-new-documents-20270801/TECH_SPEC_NEW.md §4.12 · §8 R-MMAP-*
  - docs/brand-new-documents-20270801/SRS_NEW.md §3.7 AC-MMAP-*
  - docs/brand-new-documents-20270801/API_CONTRACT_NEW.md (recruitment/performance pointers)
  - docs/brand-new-documents-20270801/DB_DESIGN_NEW.md
entry_criteria: TECH_SPEC v1.2 ADD-only PASS; 11 FR sâu không đổi; OUT GĐ2 khóa
exit_criteria:
  - Chỉ ADD delta API_CONTRACT / DB_DESIGN nếu gap vật lý chặn Pass AC-MMAP-RC-* / LV-FUND (số dư) / WH-01
  - Cấm DDL/FR cho OT · Đào tạo · FaceID · 360 · formula builder · offer formal · roster đầy đủ
  - evidence: docs/qa/evidence/doc-ent-hrm-mmap-api-db-01.md (completion_report + PASS_TO_PM)
  - Nếu không có gap vật lý bắt buộc → evidence "no delta" + PASS_TO_PM (qc docs optional)
forbidden: invent DDL GĐ2 · wipe API/DB spine 11 FR · apps/**
ack_status target: PASS_TO_PM
```

---

*DOC-ENT-HRM-MMAP-TS-01 — sa — 2026-08-03*
