# U74 SYNTHESIS — UX remaining (sau C1) — Claude proposal UX-UI-ERP-REMAINING

| Field | Value |
|-------|-------|
| **Date** | 2026-07-28 |
| **Status** | **ACTIVE — sponsor chốt 2026-07-28** |
| **Claude ping** | UX-UI-ERP-REMAINING |
| **Locks** | U65 · HOLD_DEPLOY · không đè C1 🟢 (Clock-In / tax floating null-guard) |

## 1. Owner lock (đã chốt)

| WI | Owner | Phase |
|----|-------|-------|
| **D1** DataTable audit + plan | **Claude** | R0 docs-only |
| **UX-03** search debounce 300ms | **Claude** | R1 (sau R0) |
| **D5** Zod Payroll tax settlement | **Claude** | R1 (sau R0; tránh đè `taxSettlementFloatingUi.ts`) |
| **UX-09** Shifts bulk toolbar | **Cursor** | R2 (**sau** Claude UX-03 — cùng vùng Shifts) |
| **P0-c** Payroll useReducer | **Cursor** | R3 (**sau** Claude D5) |
| **WCAG 2.4.12** 4 mobile screens | **Cursor** | R3 — **song song ngay** với R0 |

## 2. Thứ tự execution (chốt)

```text
R0  Claude: D1-DATATABLE-AUDIT.md (cấm apps/web/hrm)
R3m Cursor: WCAG 2.4.12 mobile sample (song song R0)
R1  Claude: UX-03 → rồi D5 (ping READY từng WI)
R2  Cursor: UX-09 bulk (sau UX-03 CLOSED)
R3p Cursor: P0-c useReducer Payroll (sau D5 CLOSED)
```

## 3. Cấm

- Claude không làm lại P0-b / P0-a Clock-In  
- Không đụng chung `Attendance.tsx` Shifts khi WI kia OPEN  
- Seed / Phase1 DONE / deploy claim

### Status update 2026-07-28T14:11:25+07:00
- **R3m WCAG mobile:** CLOSED PASS (qa-device)
- **Open:** D5 t-scope fix → UX-03 retest → UX-09 → P0-c



### Status update 2026-07-28T14:56:21+07:00
- **UX-09 Shifts bulk:** CLOSED PASS (qa-ux-ux09-01-20260728.md)
- **Open:** P0-c Payroll useReducer · Profile C2 QA · remaster gap raffle (Claude)

- **P0-c Payroll useReducer:** CLOSED PASS (qa-ux-p0c-01-20260728.md) — 2026-07-28T15:02:17+07:00


### Status update 2026-07-28T15:03:16+07:00 — Cursor execution cohort CLOSED
| WI | Status | Evidence |
|----|--------|----------|
| UX-03 / D5 / UX-09 / WCAG R3m / A-TOKEN | CLOSED PASS | prior |
| P0-c Payroll useReducer | CLOSED PASS | qa-ux-p0c-01-20260728.md |
| Profile C2 tabs | CLOSED PASS | qa-ux-profile-c2-01-20260728.md |
| PEER-UX-GAP-RAFFLE-01 | Claude propose INTAKE | PEER_PM_COLLAB §5 |
| Remaster full / Wave B lib | **U74 chờ sponsor chốt** | EmptyState · PermissionFallback · i18n — Claude docs |

**Cursor delta vs Claude table (14:56):** Wave1–3 + C2 Profile = **DONE** (không còn in-flight). Wave B = mở khi sponsor chốt.


### Status update 2026-07-28T15:05:47+07:00 — P0-c REOPEN
- **P0-c:** FAIL DEF-P0C-ADV-01 (AdvanceRequestsTab cancel→reopen) — SUPERSEDE prior PASS
- **Open:** D-UX-P0C-ADVANCE-LIVE-WIRE-01 (dev-fe)

### Status update 2026-07-28T15:12:48+07:00 — P0-c R2 QA PASS
- DEF-P0C-ADV-01 CLOSED (qa-ux-p0c-01-r2) · QC re-gate DISPATCHED

### Status update 2026-07-28T15:14:57+07:00 — Wave CLOSED GWC
- QC-UX-WAVE-CLOSED-01-R2 **GO WITH CONDITIONS**
- CLOSED: UX-09 · P0-c · Profile C2
- Open (U74): Wave B docs / remaster code — chờ sponsor chốt
- Conditions non-block: R-C2-01 P3 · orphan Advance Dialog P2

### Status update 2026-07-28T15:50:06+07:00 — SPONSOR U74 CHỐT Wave B remaster
- **Status:** ACTIVE EXECUTION (không còn chờ chốt)
- **Unlocked:** Wave B EmptyState · PermissionFallback · i18n
- **Locks giữ:** U65 · HOLD_DEPLOY · must_keep C1/D5/P0-c/Profile
- **Sync:** mọi milestone → Cursor chat + Telegram @xevn_project_bot
"@

Add-Content docs/program/PEER_PM_COLLAB.md -Encoding utf8 -Value @"

### 2026-07-28T15:50:06+07:00 | CURSOR-PM → CLAUDE-PM | OPEN | PEER-UX-WAVE-B-EXEC-01
- **Sponsor CHỐT U74** (chat Cursor 2026-07-28): remaster Wave B — làm đi
- Claude: SoT docs EmptyState / PermissionFallback / i18n + peer AC (có thể draft component plan)
- Cursor FE: wire HRM EmptyState + PermissionFallback (Task song song)
- Báo cáo xong wave: Cursor + Telegram
- reply_via: APPEND §5 + peer-pm.jsonl

### Status update 2026-07-28T16:05:31+07:00 — Wave B GWC
- QC-UX-WAVE-B-01 **GO WITH CONDITIONS**
- CLOSED: EmptyState FE/QA · PermissionFallback FE/QA
- Conditions: R-C2-01 P3 · R-ES-BLAND-LIST P2 · HOLD_DEPLOY
- Optional backlog (not blocking): D-UX-EMPTY-BLAND-LIST-01 · D-UX-I18N-HARDCODE-01
