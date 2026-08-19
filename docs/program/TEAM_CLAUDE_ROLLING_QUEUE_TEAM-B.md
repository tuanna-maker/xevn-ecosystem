# Claude CLI — Team B (PARKED — sponsor 2026-08-10: **1 team only**)

> **Không dùng** trừ khi PM mở lại trên peer. Execution = **`TEAM_CLAUDE_ROLLING_QUEUE.md`** (Team A / terminal 27).

| Meta | Value |
|------|--------|
| **team_id** | `CLAUDE-TEAM-B` |
| **lane** | **dev-be** chủ yếu + FE **tách path** (không đụng Team A) |
| **Team A (terminal 27)** | Queue §3 `TEAM_CLAUDE_ROLLING_QUEUE.md` — consumer · CTR U65 · JD · composer · PAY stale |
| **Cấm trùng** | Cùng lúc sửa `apps/web/hrm/**/Settings*` focus W3 · `PayrollGroups*` nếu Team A đang PAY stale |

---

## 1. Việc còn (UC / fidelity) — Team B được nhận

| WI | Lane | UC / fidelity | Vì sao Team B |
|----|------|---------------|---------------|
| `PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01` | dev-be | HRM-SC-01 · ATT LVT dual SoT | `hrm-api` settings/att — **không** overlap Team A FE consumer |
| `PO-HRM-MVP-GD1-REC-01-BE-01` | dev-be | UC-HRM-22 · REC spine | Recruitment API — ⚠ mindmap pipeline **5-state** only |
| `D-HRM-CO-01-FE-HEADCOUNT-BIND-01` | dev-fe | **UC-HRM-CO-01** planned | Chỉ màn **Company** bind `GET /employees/summary` — **không** employee create forms (Team A) |
| `PO-HRM-SETTINGS-PORTAL-TABS-FE-02` | dev-fe | HRM-SC-01 portal tabs | Defer sau BE #1 · tab account/branding — path khác catalog consumer |

**Cursor (không Claude):** `QA-HRM-CO-01-HEADCOUNT-01` browser U65 · `PO-HRM-SETTINGS-FIDELITY-QA-02` sau W3.

**Không giao Team B:** `UC-HRM-27` (waived) · OT/đào tạo GĐ2 · mobile (team C riêng).

---

## 2. Queue Team B (cuốn chiếu — cập nhật status khi DONE)

| # | work_item_id | status | read_first |
|---|--------------|--------|------------|
| B1 | `PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01` | **QUEUED** | backlog §3 HRM-SC-01 · `DEV_SOLID` · DB/API settings ATT |
| B2 | `D-HRM-CO-01-FE-HEADCOUNT-BIND-01` | QUEUED | `UI-CO-COMPANY-HEADCOUNT.md` · `API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` |
| B3 | `PO-HRM-MVP-GD1-REC-01-BE-01` | QUEUED | `BA-MINDMAP-GAP-DELTA-01` MM-GAP-01 · SRS REC — **cấm** 13-step pipeline |
| B4 | `PO-HRM-SETTINGS-PORTAL-TABS-FE-02` | QUEUED | SRS §16 portal · defer shallow mock |

Sau mỗi WI: evidence → `TEAM_CLAUDE_STATUS.md` cột **Team B** → peer DONE → **Read bảng này → B# kế**.

---

## 3. Paste — mở terminal mới (Team B lead)

```text
Bạn là CLAUDE-TEAM-B lead @ canonical root (CLAUDE.md hello claude abc abc abc).
Đọc: docs/program/TEAM_CLAUDE_ROLLING_QUEUE_TEAM-B.md (cuốn chiếu Team B).
Đọc: docs/program/knowledge/CLAUDE_ONBOARDING_TRAINING_PACKET.md · SUBAGENT_READ_MAP lane dev-be/dev-fe.
Peer tail: TEAM A đang IN_PROGRESS consumer — CẤM sửa employee create + Settings catalog focus (SETW3QC1).
Optional: CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 → spawn 1 teammate dev-be (B1) + 1 dev-fe (B2) nếu path tách.

Bắt đầu B1 PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01 → READY_FOR_QA → cuốn chiếu B2.
U65 · no seed · CODE-MEMORY VI.
```

---

## 4. Team C (tùy chọn — terminal thứ 3)

Chỉ khi sponsor muốn **mobile** UC (`UC-HRM-MOB-*`, `apps/mobile/**`) — **không** mở trùng Team A/B web.

| WI | Lane |
|----|------|
| `P1-P100-W10-MOB-HEADER-02` | dev-mobile |

SoT: `PROGRAM_JOURNEY_MAP.md` J-MOB-*.

---

## 5. Tổng việc còn (sponsor view)

| Bucket | Ước lượng | Ai |
|--------|-----------|-----|
| Matrix `planned` | 1 UC (`CO-01`) | B2 FE bind + Cursor QA |
| Fidelity P0 backlog | ~15 nhóm | A (FE settings/CTR) + B (BE/company/REC) |
| QA / QC browser | J-* DRAFT | **Cursor** qa/qc |
| Waived | 1 | — |

**Mở thêm 1 terminal Team B = hợp lý.** Mở **2 team FE** cùng Settings/employee = dễ conflict — dùng **1 team FE (A) + 1 team BE (B)**.
