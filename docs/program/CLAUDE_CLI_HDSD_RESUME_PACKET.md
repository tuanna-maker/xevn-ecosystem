# Claude Code CLI — HDSD Resume Packet (2026-07-31)

**Sponsor lock:** *«Dùng Claude Code terminal, giao việc cho team Claude dev — transfer kỹ yêu cầu.»*  
**From:** CURSOR-PM · **To:** CLAUDE-PM + **CLAUDE-CLI**  
**Root (bắt buộc):** `C:\xevn-ecosystem` (junction — **cấm** OneDrive stub path)

---

## 0. Bootstrap terminal

### 0.1 Sponsor mở session (một lần — **ngoài** chat Claude)

```powershell
cd C:\xevn-ecosystem
claude --dangerously-skip-permissions
```

Flag trên chỉ dùng khi **khởi động** Claude Code — **không** phải lệnh Claude tự chạy từ bên trong session.

### 0.2 Đã thấy prompt `❯` trong terminal = **bạn đang ở trong CLI**

| Tình huống | Làm gì |
|------------|--------|
| Đã gõ `claude` / `claude --dangerously-skip-permissions` | **Bỏ qua** «Chạy claude …» trong §9 — dùng **Bash / Edit / Write** trực tiếp |
| Thấy `accept edits on` (Shift+Tab) | Edit đã bật — cứ sửa file |
| Muốn auto-approve mọi tool | **Thoát** session → mở lại bằng lệnh §0.1 |
| Đang ở **VS Code panel** (không phải terminal `claude`) | Mở terminal §0.1 — panel **không** thay CLI execution |

Paste prompt §9 (bản **không** có dòng «Chạy claude») hoặc: *«Đọc §0.2 — bạn đã trong CLI; thực thi LANE B.»*

### 0.3 Permission trong repo (optional)

File `.claude/settings.local.json` — pattern `Default` + `Bash(...)` đã allow. Sponsor full permission = startup flag §0.1 **hoặc** chấp nhận prompt tool khi Claude hỏi.

---

## 1. Yêu cầu sponsor (bắt buộc mọi WI)

### U65 — Zero-seed · nghiệm thu FE

| Bắt buộc | Cấm |
|----------|-----|
| Login → menu SRS → click → nhập → **Lưu/Gửi/Duyệt** trên UI | `pnpm seed:*`, workflow seed, DB fake state |
| Quan sát **FE sau API 2xx** + **F5** / navigate lại | PASS chỉ vì curl/probe JSON |
| Evidence có URL, account, click path, Network 2xx | Dùng `ceo@xe.vn` thay `uat.nv*` cho mobile promote |

### Gate L0 → L2.5 → L3

1. **L0** — `pnpm run qc:dev-stack` exit **0**
2. **L2** — route/tab load, không banner ERROR, không 409 scope
3. **L2.5** — J-* / UF: list→detail, save→F5→data còn
4. **L3** — QC GO/GWC có evidence path

**HTTP 200 alone ≠ PASS.**

### Môi trường UAT

| Service | URL / port |
|---------|------------|
| Portal | `http://127.0.0.1:5173` |
| hrm-api | `:28001` — `pnpm run dev:hrm-api` hoặc `node dist/main.js` |
| xbos-api | `:28002` |
| Pilot HRM | `http://14.225.217.232:3001` (mobile auth đã deploy) |

| Persona | Account |
|---------|---------|
| Tập đoàn / CC | `ceo@xe.vn` / `Xevn@2026` |
| Mobile UAT | `uat.nv0001@xe.vn`, `uat.nv0002@xe.vn` / `xevn-uat-2026` |

### Cấm khác

- **HOLD_DEPLOY** — không Phase1/PROD claim · không push deploy workflow
- Không sửa vùng matrix 🟢 không regression
- Spec gate U71: code nghiệp vụ mới cần DB_DESIGN + API_DESIGN + SRS bước Diễn biến
- `@CODE-MEMORY` tiếng Việt khi sửa `apps/**` business

---

## 2. Phân lane (v1.2 — 2026-08-01 sponsor parallel + full permission)

### Bootstrap (bắt buộc)

**Sponsor** mở terminal một lần: `cd C:\xevn-ecosystem` → `claude --dangerously-skip-permissions`  
**Claude (đã trong session):** **không** tự gọi lại lệnh trên — xem §0.2.

**Sponsor lock:** Claude CLI **được sửa code, edit file, chạy test, QA/QC** — dùng Bash/Edit. Heartbeat mỗi 15 phút.

### LANE A — CURSOR (mobile + dispatch không trùng)

| WI | Owner | Ghi chú |
|----|-------|---------|
| `QA-HDSD-MOB-CH12-01-R7` | qa-device | BF-02 mobile · APK |
| `QA-HDSD-MUTATE-RET-03-HRM-R3` | qa | BF-03 mutate |
| `QA-HDSD-BF-02-CC-INT03-01` | qa | BF-02 portal CC inbox |
| `QA-HDSD-BF-01-CANVAS-01` | qa | BF-01 canvas prep |

### LANE B — CLAUDE-CLI (**QA + QC + dev fix — song song Cursor**)

| WI | Loại | Scope |
|----|------|-------|
| **`CLAUDE-CLI-HDSD-PARALLEL-01`** | parent | Packet này §2B |
| `CLAUDE-CLI-BF-01-QA-01` | qa | BF-01: Canvas QT → YCTD → inbox spot · U65 browser `:5173` |
| `CLAUDE-CLI-BF-03-QA-FIX-01` | qa+dev-fe | BF-03: mutate TC 06/07/08 · **fix FE nếu R3 FAIL** · vitest |
| `CLAUDE-CLI-BF-03-QC-SPOT-01` | qc | Gate spot BF-03 evidence khi QA PASS |
| `CLAUDE-CLI-BF-SWEEP-01` | qa | TC ⬜ Ch11/XBOS dashboard batch (matrix) |
| `CLAUDE-CLI-GOV-AUTH-COMMIT-01` | git | Stage auth+SHR · no push |
| `CLAUDE-CLI-HDSD-P2-REBUILD-01` | docs | **Sau** QC P2-R4 GWC |

**Claude team tự chia sub-agent trong CLI** (parallel khi không trùng file).

**Cấm trùng file với Cursor in-flight:** xem §8 · poll `TEAM_WORKING_NOW.md` trước Edit.

**Cấm:** seed · deploy prod · `qa-device`/emulator (Cursor giữ mobile APK)

### LANE A cũ (obsolete)

~~B1 QA queue~~ → CLOSED on Cursor. ~~Poll L0~~ → CLOSED `D-OPS-RESUME-L0-01`. ~~B4 dev fix~~ → Cursor dev-fe/dev-be BF-ORCH.

#### B2 — GOV-AUTH-COMMIT (Claude only)

- Stage auth slice: `uat-mobile-auth-ensure*`, `mobile-auth.service*`, `hrm-list-scope.ts` (nếu chưa on main)
- Stage shareholder FE: `shareholderListSync.ts`, `CommandCenterPage.tsx` (SHR-F5)
- **Commit** feature branch · **không push** trừ sponsor yêu cầu
- Evidence: `docs/qa/evidence/claude-gov-auth-commit-01-20260801.md`

#### B3 — HDSD-P2-REBUILD (Claude only — sau QC P2-R4 GWC)

- Input: 8× `docs/client-delivery/hdsd/assets/hrm/hrm-12-N.png`
- Rebuild HDSD HTML/PDF · verify PNG inline
- Evidence: `docs/qa/evidence/claude-hdsd-p2-rebuild-01-20260801.md`

---

## 3. read_first (thứ tự)

1. `docs/program/TEAM_WORKING_NOW.md`
2. `docs/program/PM_RESUME_AFTER_REBOOT.md`
3. `docs/program/AGENT_MESSAGE_BUS.md` (tail ~100 dòng)
4. `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md`
5. `docs/program/PROGRAM_JOURNEY_MAP.md` — J-MOB-03/04/05, J-* portal
6. `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md`
7. Evidence mở:
   - `d-ops-mob-auth-pilot-deploy-01-20260730.md`
   - `d-hdsd-mutate-shr-f5-01-20260730.md`
   - `d-hdsd-wf-inbox-fe-01-20260730.md`
   - `qa-hrm-embed-network-audit-20260730.md`

---

## 4. Handoff về Cursor (bắt buộc mỗi WI)

1. APPEND `docs/program/PEER_PM_COLLAB.md` §5
2. APPEND `.cursor/team/inbox/peer-pm.jsonl` one line OPEN/CLOSED
3. **Heartbeat** — ghi `.cursor/team/inbox/peer-claude-heartbeat.json` mỗi 15 phút hoặc sau bước lớn (`status`: IN_PROGRESS | DONE | BLOCKED)
4. APPEND `docs/program/AGENT_MESSAGE_BUS.md` nếu `PASS_TO_PM` / `READY_FOR_QA` / `FAIL_TO_PM`

Watchdog: `docs/program/PEER_CLAUDE_WATCHDOG.md` · `pnpm run pm:peer-claude:watch` — im >30m / stall >45m → Cursor **AUTO-RECLAIM**.

**completion_report** + **next_dispatch_prompt** + **next_owner** — invalid nếu thiếu.

---

## 5. HDSD P2 exit (sponsor intent)

| Mốc | Điều kiện |
|-----|-----------|
| Web CH01–11 | QC R3 GWC ✅ |
| Mobile CH12 | R4 J-MOB 🟢 + 8 PNG → rebuild → QC R4 |
| Mutate matrix | TC-HDSD-* 🟢 trên `:5173` |
| INT-03 inbox | TC-ECO-INT-03 🟢 |
| **Client-final** | QC final GO — **không** trước C-R2-02 |

---

## 6. Residual đã biết

- Auth deploy pilot = SCP one-off until commit on main
- dist-uat-w6 stale binary → phải `dist/main.js` (Cursor devops đang xử lý)
- `PM_ORCHESTRATION_MODE=STOP` — Cursor hook tắt; peer ping vẫn bắt buộc

---

## 7. Definition of Done (Claude)

| Claim | Hợp lệ khi |
|-------|------------|
| `READY_FOR_QA` code | File diff + test log trong evidence |
| `PASS_TO_PM` QA | Browser evidence blocks đủ U65 |
| `DONE` | Cursor intake + không residual P0 mở |

---

## 8. Cấm trùng file (hot)

- `apps/api/hrm-api/dist/**` — Cursor devops L0
- `apps/api/hrm-api/src/auth/**` — đã deploy; chỉ commit (B2) không rewrite logic trừ QA FAIL
- Mobile APK/emulator — Cursor qa-device R4

---

## 9. Copy-paste prompt Claude Code

**Dùng khi đã mở `claude` trong terminal (§0.2):**

```text
Bạn đã ở trong Claude Code CLI — KHÔNG chạy lại lệnh claude.
Sponsor full permission: dùng Bash/Edit/Write trực tiếp.

1) Đọc CLAUDE_CLI_HDSD_RESUME_PACKET.md §0.2 + v1.2 + TEAM_WORKING_NOW.md (tránh trùng Cursor IN FLIGHT)
2) Ghi heartbeat .cursor/team/inbox/peer-claude-heartbeat.json (updated_at ISO, status IN_PROGRESS)
3) L0: pnpm run qc:dev-stack @ C:\xevn-ecosystem
4) Lanes (chỉ phần Cursor chưa chiếm):
   - BF-01 QA canvas/YCTD nếu QA-HDSD-BF-01-CANVAS-01 chưa verdict
   - BF-03 QA+fix nếu mutate R3 FAIL
   - Sweep TC ⬜ nếu QA-HDSD-BF-SWEEP-01 chưa verdict
5) QA FAIL → fix apps/** + vitest · evidence docs/qa/evidence/claude-*.md
6) Heartbeat 15 phút · WI xong → PEER_PM_COLLAB §5 + peer-pm.jsonl

Cấm: seed · deploy · mobile emulator (Cursor qa-device)
```
