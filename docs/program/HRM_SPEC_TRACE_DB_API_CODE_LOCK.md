# HRM Spec Remaster — Trace lock (DB · API · CODE-MEMORY ↔ SRS)

**program_id:** `HRM-SPEC-REMASTER-BATECO-01`  
**delta:** 2026-07-21 sponsor — sau BRD/SRS/TechSpec: **thiết kế DB+API phải map TechSpec**; **mỗi hàm API/function đánh dấu bước SRS**; TechSpec **`ref_srs` + đoạn phục vụ nghiệp vụ nào**; liên kết dữ liệu chuẩn.

## SoT

- `_vibe-team-os/14-TRACEABILITY-SRS-TECHSPEC-CODE.md`
- `_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` §3.4.6
- Template: `_vibe-team-os/templates/CODE_MEMORY_BLOCK.md` (+ FE-Actions / BE-Chain)
- Khách: `docs/client-delivery/hrm/SRS_HRM_KHACH.md` (44 FR)
- Team TechSpec: `docs/hrm/TECHSPEC.md`

## Waves (tiếp)

| Wave | Owner | work_item_id | Exit |
|------|-------|--------------|------|
| W3-R2 | sa | `SA-HRM-TECHSPEC-ALIGN-W3-R2` | Mọi FR có `ref_srs` + mô tả đoạn TechSpec phục vụ FR nào |
| W3-DB | sa + ba-data | `SA-HRM-DB-API-MAP-W3-DB-01` | **DONE SA 2026-07-21** — TechSpec §17 + G-DB gap; evidence `docs/qa/evidence/sa-hrm-db-api-map-w3-db-01-20260721.md` (SQL ensureSchema SoT, not Prisma) |
| W4-CM | dev-be (+ fe) | `BE-HRM-CODE-MEMORY-SRS-STEP-01` | Controller/service method: `@CODE-MEMORY` + comment **bước Diễn biến SRS #n** |
| W4-DO | devops | `D-DO-SYNC-8088-G-RC-01` | Sync G-RC-01 (recover interrupt) |
| W5 | tm + qc | Gate trace sample GO/GWC |

## CODE-MEMORY bắt buộc thêm (sponsor)

Mỗi handler Nest / FE mutate chính:

```
SRS bước: Diễn biến #k · FR-… · «mô tả bước tiếng Việt»
TechSpec: §… · ref_srs FR-…
```

## Cấm

Phase1/PROD · wipe FR 🟢 · seed · claim 120 UC


## Status delta 2026-07-21/22 (resume)

| Gap | Status |
|-----|--------|
| G-RC-01 | QC GWC :8088 |
| G-DB-03 + G-AT10-01 | QC GWC |
| C-CONV-AS-01 | QC GWC |
| G-DB-01 | QC GWC |
| G-AT10-02 #5 | QC GWC (#6 SKIP) |
| G-DB-04 | SA in flight |

NOT Phase1/PROD.



## Status delta 2026-07-21/22 (resume)

| Gap | Status |
|-----|--------|
| G-RC-01 | QC GWC :8088 |
| G-DB-03 + G-AT10-01 | QC GWC |
| C-CONV-AS-01 | QC GWC |
| G-DB-01 | QC GWC |
| G-AT10-02 #5 | QC GWC (#6 SKIP) |
| G-DB-04 | SA in flight |

NOT Phase1/PROD.

