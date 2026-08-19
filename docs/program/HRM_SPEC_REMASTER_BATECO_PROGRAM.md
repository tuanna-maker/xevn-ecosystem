# HRM Spec Remaster — Bateco / `_vibe-team-os` §13

**program_id:** `HRM-SPEC-REMASTER-BATECO-01`  
**sponsor_lock:** 2026-07-21 — chuẩn hóa BRD→SRS trước; rồi TechSpec; rồi code↔spec + coding convention  
**SoT quality:** `_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` · `14-TRACEABILITY-SRS-TECHSPEC-CODE.md` · skill `client-delivery-brd-srs`  
**Prior audit:** `docs/qa/evidence/ba-hrm-spec-quality-audit-01-20260721.md` (skeleton **FAIL**)

## Exit criteria (program)

| Gate | PASS khi |
|------|----------|
| W1 BRD | Yêu cầu-N + Quy tắc khóa; map inventory 1→≥1 UC |
| W1 SRS | Skeleton Ch.1–6 body; E2E spine; stub menu = 0; FR 7 mục + Kết quả trả về trên UC spine |
| W2 SRS batch | Catalog HRM-AT / PR / EMP / CI / RC remaster ADD-only theo inventory freeze |
| W3 TechSpec | Mọi UC spine có `ref_srs`; OpenAPI/DTO khớp AC; không mâu thuẫn SRS |
| W4 Code | TM/Dev: `spec_read_ack` sample + CODE-MEMORY + convention; gap → Task Dev |
| W5 QC | Skeleton + inventory + sample FR gate GO/GWC — **không** claim Phase1/PROD |

## Waves

| Wave | Owner | work_item_id |
|------|-------|--------------|
| W1a | ba-docs | `BA-HRM-BRD-SRS-BATECO-W1-01` |
| W1b | ba-process | `BA-HRM-BRD-YEUCAU-INVENTORY-01` |
| W2 | ba-docs | `BA-HRM-SRS-BATECO-W2-CATALOG-01` (sau W1 PASS) |
| W3 | sa | `SA-HRM-TECHSPEC-ALIGN-W3-01` (sau W1 tối thiểu) |
| W4 | technical-manager | `TM-HRM-CODE-SPEC-CONVENTION-01` (sau W3) |
| W5 | qc | `QC-HRM-SPEC-REMASTER-GATE-01` |

## ADD-only / cấm

- Cấm wipe UC/AC đã 🟢 (vd. AC-ATT-SHEET-01..06, UF-HRM-16)
- Cấm prompt-echo / Sponsor meta trong body khách
- Cấm Phase1/PROD claim từ remaster docs alone
- Team internal tech notes: giữ hoặc tách `docs/hrm/team/` — không trộn HTTP thô vào SRS khách

## Deliverable paths (W1)

- **Khách (SoT W1a):** `docs/client-delivery/hrm/BRD_HRM_KHACH.md` · `docs/client-delivery/hrm/SRS_HRM_KHACH.md`
- **Team annex:** `docs/hrm/BRD.md` (§7.1 Yêu cầu-01..30) · `docs/hrm/SRS.md` (giữ AC-ATT-SHEET)
- `docs/hrm/UC_INVENTORY_BRD_SRS.md` (freeze trước W2)
- Evidence W1a: `docs/qa/evidence/ba-hrm-brd-srs-bateco-w1-01-20260721.md` · W1b: `docs/qa/evidence/ba-hrm-brd-yeucau-inventory-01-20260721.md`
