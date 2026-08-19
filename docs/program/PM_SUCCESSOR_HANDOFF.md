# PM Successor Handoff — xevn-ecosystem

> **Mục đích:** PM / Agent Composer **mới** (conversation mới hoặc người kế nhiệm) đọc file này **trước** rồi mới mở bus/matrix. Không phụ thuộc chat Cursor dài.

| Field | Value |
|-------|-------|
| **SoT** | `docs/program/PM_SUCCESSOR_HANDOFF.md` (file này) |
| **Cập nhật** | 2026-07-28T16:16+07:00 |
| **Owner cập nhật** | CURSOR-PM sau mỗi QC GWC / milestone |
| **Locks** | U65 zero-seed · **HOLD_DEPLOY** · không claim Phase1/PROD DONE |

---

## 0. Đọc ngay (≤5 phút)

| # | Artifact |
|---|----------|
| 1 | **File này** |
| 2 | `docs/program/TEAM_WORKING_NOW.md` |
| 3 | `docs/program/AGENT_MESSAGE_BUS.md` (80 dòng cuối) |
| 4 | `docs/program/UX-UI-ERP-REMAINING-SYNTHESIS.md` |
| 5 | `docs/program/TELEGRAM_PM_BRIDGE.md` + `pnpm run pm:telegram` (1 process) |
| 6 | OS: `_vibe-team-os/PM-START-HERE.md` · `23-TELEGRAM-PM-BRIDGE.md` · `19-PEER-PM-COLLAB.md` |

---

## 1. Trạng thái sản phẩm (honest)

| Khối | Verdict | Evidence |
|------|---------|----------|
| C1 Clock-In + tax floating null-guard | CLOSED | prior C1 / must_keep |
| A-TOKEN XBOS | CLOSED PASS | `qa-ux-a-token-01-*` |
| UX-03 debounce · D5 Zod · UX-09 Shifts bulk | CLOSED PASS | QA evidence 20260728 |
| P0-c Payroll useReducer + Advance UX-06 live-wire | CLOSED (R2) | `qa-ux-p0c-01-r2` · `qc-ux-wave-closed-01-r2` **GWC** |
| Profile C2 tabs | CLOSED PASS | `qa-ux-profile-c2-01` |
| Wave B EmptyState (Dashboard+Contracts) | CLOSED | `qa-ux-empty-state-01` · `qc-ux-wave-b-01` **GWC** |
| Wave B PermissionFallback | CLOSED | `qa-ux-permission-fallback-01` · cùng QC Wave B **GWC** |

**Chưa = «code xong hết»:** bland-list EmptyState P2 · i18n hardcode scan · remaster Attendance/Payroll IA sâu hơn C1 · mobile parity đầy đủ · **deploy** (HOLD).

---

## 2. Conditions đang mở (GWC — không chặn Wave B)

| ID | Severity | Ý nghĩa |
|----|----------|---------|
| R-C2-01 | P3 | Deny-persona live DOM BLOCKED-ENV (portal JWT bypass) — **cấm** gỡ bypass |
| R-ES-BLAND-LIST | P2 | List khác còn empty bland DataTable |
| HOLD_DEPLOY | lock | Không deploy / không Phase1·PROD DONE |

---

## 3. must_keep (cấm regression)

- Clock-In C1 wizard  
- `taxSettlementFloatingUi` C1  
- SalaryComponentsTab D5 Zod+RHF  
- P0-c Advance live cancel→reopen empty  
- Profile C2 Core + group popovers  
- EmptyState moods trên Dashboard/Contracts  
- PermissionFallback SoT + compact CMND  

---

## 4. Telegram (kênh liên tục — auto)

Mở project → **tự** chạy (`sessionStart` + `.vscode/tasks.json` folderOpen). Sponsor **không** chạy `pnpm` tay.

| Chiều | Việc xảy ra |
|-------|-------------|
| PM xong → Tele | afterAgentResponse mirror |
| Tele → PM | channel toast + `TELEGRAM_ACTIVE_INTAKE.md` + hook |
| Mode | `PM_ORCHESTRATION_MODE=RUN` |

---

## 5. Peer Claude

- SoT ngang: `docs/program/PEER_PM_COLLAB.md`  
- Gap raffle 30yr: `PEER-UX-GAP-RAFFLE-01` (Claude propose đã intake)  
- Wave B docs Claude kick từng fail session — FE Cursor đã đóng EmptyState/PermissionFallback; Claude docs SoT vẫn optional follow-up  

---

## 6. Việc kế (P2 / không P0 Wave B)

1. `D-UX-EMPTY-BLAND-LIST-01` — migrate empty bland lists (P2)  
2. `D-UX-I18N-HARDCODE-01` — scan hardcode → `t()` (Claude docs + Cursor FE)  
3. Remaster sâu Attendance/Payroll IA (U74 waves riêng — chưa chốt chi tiết sau Wave B)  
4. Khi sponsor **bỏ HOLD_DEPLOY** → DevOps deploy slice  

---

## 7. Conversation mới

Khi chat Cursor quá dài / PM mới:

1. Mở Agent mới trong repo `xevn-ecosystem`  
2. Prompt đầu: *Đọc `docs/program/PM_SUCCESSOR_HANDOFF.md` rồi tiếp tục từ §6*  
3. Chạy `pnpm run pm:telegram` nếu sponsor dùng Telegram  
4. Không đoán — đối chiếu evidence path trong §1  

---

## 8. Lịch sử cập nhật

| Khi | Ai | Thay đổi |
|-----|-----|----------|
| 2026-07-28T16:16 | CURSOR-PM | Tạo file sau QC Wave B GWC + sponsor hỏi «xcode xong hết?» |

### Status update 2026-07-28T16:41:00+07:00 — P-CC-01-jwt CLOSED
- QC GWC: dual expiresInSec+jwt_delta=86400 · nip.io · evidence p1-ex-qc-https-p-cc-01-jwt-01-20260728.md
- HOLD_DEPLOY / NOT Phase1 / NOT PROD still standing

## Update 2026-07-28T16:59:38+07:00 — nip.io REMOVE wave
- Status: **CLOSED GWC** FE+OPS+MOB (HOLD_DEPLOY)
- Evidence: qc-fe / qc-ops / qc-mob-remove-nipio-01-20260728.md
- Do NOT re-dispatch JWT nip.io probe; DEV = http://14.225.217.232:8088 · HRM API :3001 · local :5173

## Update 2026-07-29T00:54:54+07:00 — U75 Claude runtime
- Panel Claude = deputy/advisor only; CLI = code. Relay sponsor→Claude via peer. Push work when Cursor quota tight.
- SoT: docs/program/PEER_CLAUDE_RUNTIME_MODEL.md
