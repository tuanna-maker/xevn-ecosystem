# Claude parallel lane — UC closure & fidelity (sponsor 2026-08-10)

| Meta | Value |
|------|--------|
| **work_item_id** | `CLAUDE-PARALLEL-UC-CLOSURE-WAVE-01` |
| **Owner runtime** | `claude-cli` (+ panel CLAUDE-PM advisory) |
| **Cursor-PM** | Giữ QA/QC/bus; **không** sửa cùng file với Claude cùng lúc |
| **Canonical root** | `docs/program/PATH_CANONICAL_LOCK.md` (NFD OneDrive) |

---

## 1. Sponsor intent

- Dùng **Claude Code CLI** code/test song song Cursor Task.
- **Nghiệp vụ:** chỉ SRS · TechSpec · API_DESIGN · DB_DESIGN — UI/UX spec enterprise **tham khảo** (`_vibe-team-os/37-UI-SCREEN-SPEC-SRS-FIRST-AND-REFERENCE.md`).
- **U65:** zero seed; mutate từ FE → Lưu → F5.
- **SOLID:** `_vibe-team-os/25` · `26` · `docs/program/knowledge/DEV_SOLID_AND_OS_CONVENTION_ENFORCEMENT.md` · `@CODE-MEMORY` tiếng Việt.

---

## 2. Onboarding — đọc trước (≤30 phút)

| # | Artifact |
|---|----------|
| 1 | `AGENTS.md` · `CLAUDE.md` |
| 2 | `docs/program/SUBAGENT_READ_MAP.md` |
| 3 | `docs/program/PHASE1_UC_CLOSURE_BACKLOG.md` |
| 4 | `docs/program/TEAM_WORKING_NOW.md` |
| 5 | `docs/program/knowledge/CLAUDE_ONBOARDING_TRAINING_PACKET.md` (training packet) |
| 6 | `docs/program/PEER_CLAUDE_RUNTIME_MODEL.md` |
| 7 | **`docs/program/dispatch/CLAUDE-PARALLEL-DOC-PACK-WAVE-01.md`** — UI_SCREEN_SPEC map từng WI |
| 8 | **`docs/program/specs/BA-MINDMAP-GAP-DELTA-01.md`** — guard `⚠ P0-MAP` (REC/PAY/OT/DEC) |

**Stack local:** `:5173` portal · `:28001` hrm-api · `:28002` xbos-api · `pnpm run qc:fe-be-health` exit 0 trước browser.

---

## 3. Lane Claude CLI (execution) — giao ngay

**Cấm** đụng file Cursor đang mở W3 F5 (`settingsCatalogFocusStore`, `Settings.tsx` focus) trừ khi peer ghi **DONE** trên WI.

| Priority | work_item_id | Lane | read_first | exit_criteria | evidence_path |
|----------|--------------|------|------------|---------------|---------------|
| **P0** | `D-HRM-CO-01-SUMMARY-BE-01` | dev-be | `docs/hrm/SRS.md` UC-HRM-CO-01 · API headcount/summary · ADR Plane B | Batch headcount enrich; scope parity list↔get; jest hrm-api | `docs/qa/evidence/d-hrm-co-01-summary-be-01.md` |
| **P0** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01` | dev-fe | QC `PAY09QC1-MSN8L7QC1` · J-09-01..04 HOLD | Browser U65 payroll embed; **payroll_e2e_ready=false** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-fe-01.md` |
| **P1** | `PO-HRM-SETTINGS-CATALOG-CONSUMER-FE-01` | dev-fe | `HRM_MENU_DATA_LINKAGE_MATRIX` · UF-HRM-10 | Employee + REC forms bind catalog; regression vitest | `docs/qa/evidence/po-hrm-settings-catalog-consumer-fe-02.md` |
| **P1** | `HRM-CTR-U65-TPL-UV-FE-PATH-01` | dev-fe + qa | `PO-HRM-CTR-CREATE-AUDIT-WAVE-01` · PAT full viewport | **Chỉ FE:** Settings tạo mẫu HĐ active + luồng UV → Contracts step2 DnD; không seed DB | `docs/qa/evidence/hrm-ctr-u65-tpl-uv-fe-path-01.md` |
| **P2** | `PO-HRM-SETTINGS-W3-CONSOLE-500-01` | dev-fe | QC `SETW3QC1` residual P2 | Network classify + fix settings load 500 if product bug | `docs/qa/evidence/po-hrm-settings-w3-console-500-01.md` |

Sau mỗi WI: `READY_FOR_QA` + ping peer `PEER_PM_COLLAB.md` §5 **DONE** + evidence path.

---

## 4. Lane Claude panel (governance — không `apps/**`)

| work_item_id | Role | Output |
|--------------|------|--------|
| `BA-PO-HRM-SETTINGS-SRS-FIDELITY-01` | ba-process | Delta AC JD mutate + catalog consumer matrix · `docs/program/specs/` |

---

## 5. Cursor giữ (tránh trùng file)

| work_item_id | Owner |
|--------------|--------|
| `QA-HRM-CO-01-INDUSTRY-01` | Cursor qa (FE-01 industry đã READY) |
| `QA-PO-HRM-SETTINGS-W3-FULL-SWEEP-01` | Cursor qa (18 tab — sau narrow GWC) |
| PM bus seal · QC program | Cursor pm / qc Task |

---

## 6. Handoff protocol

```text
Claude xong WI → APPEND PEER_PM_COLLAB §5 (DONE + evidence + commit hint)
              → cập nhật TEAM_CLAUDE_STATUS.md
              → Cursor-PM dispatch Cursor qa retest
```

**Conflict:** cùng `allowed_paths` → Claude **PARK** WI; Cursor PM re-roster trên peer.

---

## 7. DoD Claude (code)

- Edit `apps/**` + test exit 0
- `@CODE-MEMORY` / CHANGE append
- Không claim module UAT / Phase 1 DONE
- Không `pnpm seed:*` (U65)
