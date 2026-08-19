# Program — Business Change Compiler (U77)

| Mục | Nội dung |
|-----|----------|
| **Program id** | `PO-BIZ-CHANGE-COMPILER` |
| **Khóa** | `TEAM_USER_REQUIREMENTS.md` §U77 |
| **Pilot** | `xevn-ecosystem` (Phase A) → promote `_vibe-team-os` (Phase B) |
| **Cấm** | `apps/**` trong wave schema; claim remaster / product GO từ compiler |

---

## 1. Mục tiêu

Chuẩn hóa đường: **Excel / docs chốt nghiệp vụ → Change Manifest JSON → Spec-first → squad Dev/QA → Compound/Memory**, để mọi PM/PO sau đọc được SoT máy thay vì đoán từ chat.

---

## 2. Phase

| Phase | Việc | SoT chính |
|-------|------|-----------|
| **A — Pilot XeVN** | Schema cột Excel↔JSON · example · checklist memory · outline promote OS | `docs/program/schemas/` · checklist · promote packet |
| **B — OS promote** | Chapter + templates vào `_vibe-team-os` + PM-START / JOIN kit | `BIZ_COMPILER_OS_PROMOTE_PACKET.md` |

---

## 3. Artifact Phase A (sau BA-01 — 2026-08-05)

| # | Path | Owner | Status |
|---|------|-------|--------|
| 1 | `docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md` | SA | **DONE** Accepted Option C |
| 2 | `docs/program/schemas/change-manifest.schema.json` | SA / ba-data | **DONE** v0.1.1 |
| 3 | `docs/program/schemas/CHANGE_MANIFEST_EXCEL_COLUMNS.md` | BA | **DONE** BA-01 |
| 4 | `docs/program/schemas/change-manifest.example.json` | BA / ba-process | **DONE** — bundle `samples[3]` v0.1.1 + `traceability` / browser `uf_or_j` |
| 4b | `docs/program/examples/change-manifest.sample.json` | ba-process | **DONE** — gold Plane D ATT (`PO-BIZ-CHANGE-COMPILER-BA-PROC-01`) |
| 5 | `docs/program/schemas/CHANGE_MANIFEST_VALIDATION_MATRIX.md` | ba-data | **DONE** |
| 6 | `docs/program/COMPOUND_MEMORY_INTEGRATION_CHECKLIST.md` | PM vận hành | **DONE** BA-01 |
| 7 | `docs/program/BIZ_COMPILER_OS_PROMOTE_PACKET.md` | PM/SA Phase B | **DONE** (+ §8 draft ch.34) |
| 8 | Evidence BA | `po-biz-change-compiler-ba-01.md` · `po-biz-change-compiler-ba-proc-01.md` | **PASS_TO_PM** |

---

## 4. Wave kế

1. ~~SA ADR + schema~~ — **DONE**  
2. ~~BA Excel map + 3 HRM samples~~ — **DONE** BA-01  
3. ~~BA-PROC align samples v0.1.1~~ — **DONE** BA-PROC-01 (gold + bundle)  
4. **PM** → dispatch Phase B `PO-BIZ-CHANGE-COMPILER-OS-PROMOTE-01` (packet §5) **hoặc** gắn `change_manifest_path` = gold sample vào wave ATT-SIGN  
5. **QA spot** (optional) — đối chiếu 3 samples vs phiếu/gap (`PO-BIZ-CHANGE-COMPILER-QA-SPOT-01`)  
6. Phase A3 compile script — devops/sa sau promote  

---

## 5. Liên kết nguồn chốt pilot HRM

- `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_CHOT_FILL_SHEET.md`
- `SPONSOR_CHOT_FILL*.xlsx` · `SPONSOR_CHOT_REMAINING.xlsx`
- `UC_MEETING_PRODUCT_GAP_MATRIX.md` · `UC_INVENTORY.md`
