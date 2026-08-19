# Claude doc pack — đọc kèm khi code (song song Cursor-PM)

| Meta | Value |
|------|--------|
| **work_item_id** | `CLAUDE-PARALLEL-DOC-PACK-WAVE-01` |
| **date** | 2026-08-10 |
| **owner** | Cursor-PM (docs lane) · Claude CLI (execution) |
| **policy** | SRS/API/DB = SoT · UI_SCREEN_SPEC = bind AC UI · Desktop reference = structure only (`OS 37`) |

---

## 1. Map WI → read_first (bắt buộc trước Edit)

| Priority | work_item_id | Spec execution | UI_SCREEN_SPEC (mới) |
|----------|--------------|----------------|----------------------|
| P0 | `D-HRM-CO-01-SUMMARY-BE-01` | `API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` · TECHSPEC §19 · `DB_DESIGN_HRM_CO_HC.md` | `docs/hrm/ui-screens/UI-CO-COMPANY-HEADCOUNT.md` |
| P0 | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01` | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01.md` · BA-01 · QC PAY09QC1 | `docs/hrm/ui-screens/UI-PAYROLL-CLUSTER-EMBED.md` |
| P1 | `PO-HRM-SETTINGS-CATALOG-CONSUMER-FE-01` | `API_DESIGN_HRM_SETTINGS_CATALOG.md` · `HRM_MENU_DATA_LINKAGE_MATRIX.md` | `docs/hrm/ui-screens/UI-CATALOG-CONSUMER-EMP-REC.md` |
| P1 | `HRM-CTR-U65-TPL-UV-FE-PATH-01` | `UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md` · PAT full viewport | `docs/hrm/ui-screens/UI-CTR-CREATE-U65-TEMPLATE-PATH.md` |

---

## 2. Settings W3 (đã seal — chỉ đọc, hạn chế sửa)

| Tab / PAT | File |
|-----------|------|
| Catalog sync overview | `UI-SETTINGS-CATALOGS-SYNC.md` |
| Loại phép compact | `UI-SETTINGS-ATT-LEAVE-TYPES.md` |
| JD master | `UI-SETTINGS-JD-MASTER-LIST.md` |
| Mẫu / điều khoản HĐ | `UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md` · `UI-SETTINGS-CTR-CLAUSES.md` |
| Modal CC | `PAT-DIALOG-FULL-VIEWPORT-CC-01.md` |

**QC seal:** SETW3QC1 — **PARK** nếu diff đụng `settingsCatalogFocusStore` / focus W3.

---

## 3. Handoff sau mỗi WI

```text
1. Code + test exit 0
2. evidence_path (qa template UF block)
3. PEER_PM_COLLAB §5 DONE + work_item_id
4. TEAM_CLAUDE_STATUS.md — next WI
5. ack_status: READY_FOR_QA → Cursor dispatch qa
```

---

## 4. Wave tiếp (docs Cursor đang soạn)

| work_item_id | Output dự kiến |
|--------------|----------------|
| **`BA-MINDMAP-GAP-DELTA-01`** | **DONE** → `docs/program/specs/BA-MINDMAP-GAP-DELTA-01.md` (27 lá + **⚠ P0-MAP** guards) |
| **`DOC-ENT-HRM-MMAP-BRD-01`** | **DONE** → `docs/client-delivery/hrm/BRD_HRM_KHACH.md` §10 · evidence `doc-ent-hrm-mmap-brd-01.md` |
| `DOC-ENT-HRM-MMAP-SRS-01` | **defer** — sau sponsor Q1–Q5 (`DOC-ENT-HRM-MMAP-BRD-01_team.md`) |
| `BA-PO-HRM-SETTINGS-SRS-FIDELITY-01` | Delta AC JD mutate + consumer matrix |
| Web UI backlog | `PHASE1_UC_CLOSURE_BACKLOG.md` — thêm `UI-*.md` theo menu còn 🟡 |

**Claude:** đọc § «Liên kết wave Claude P0» + các dòng `⚠ P0-MAP` trong delta trước khi mở REC/PAY/DEC scope.

---

## 5. Paste prompt (Claude CLI)

Đọc thêm file này **ngay sau** `CLAUDE-PARALLEL-UC-CLOSURE-WAVE-01.md` khi bắt đầu phiên.
