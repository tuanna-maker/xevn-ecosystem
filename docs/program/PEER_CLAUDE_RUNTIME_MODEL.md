# Peer Claude — Runtime model (sponsor lock 2026-07-29)

**Program:** Cursor-PM chủ trì · Claude = **phó + cố vấn** · thông điệp sponsor **chỉ qua Cursor** → peer SoT.

---

## 1. Hai mặt Claude (không nhầm)

| Surface | Tooling | Vai trò đúng |
|---------|---------|--------------|
| **Claude trong VS Code / conversation panel** | Planning, audit, peer APPEND — Edit tool **dễ fail** khi payload dài | **CLAUDE-PM**: tư duy 30yr, spec, coordination, góp ý U74 — **không** claim «code DONE» khi không sửa được file |
| **Claude Code CLI** (`claude` trong terminal @ `C:\xevn-ecosystem`) | Edit/Write/Bash đầy đủ → edit `.ts`/`.tsx`, `pnpm` test, git | **CLAUDE execution team**: tự điều phối members / tự code theo WI Cursor giao qua peer |

```powershell
cd C:\xevn-ecosystem
claude --dangerously-skip-permissions
```

---

## 2. Luồng thông điệp (sponsor → Claude)

```text
Sponsor chat Cursor / Telegram
  → CURSOR-PM intake
  → APPEND PEER_PM_COLLAB §5 + peer-pm.jsonl (to CLAUDE-PM)
  → Claude (panel) đọc → góp ý / tự điều phối CLI team
  → Claude APPEND kết quả + evidence
  → Cursor tổng hợp → sponsor / Telegram
```

**Cấm:** Sponsor phải mở Claude panel để «nhắc làm lại». Cursor chịu trách nhiệm relay.

---

## 3. Khi Cursor đẩy việc cho Claude

Cursor **bắt buộc** đẩy (không ôm) khi:

1. Quota / không tạo thêm Task subagent được  
2. Wave docs/audit/spec nặng cần tư duy Claude  
3. Cohort execution Claude CLI đã nhận lane (không trùng file Cursor Dev)  
4. Sponsor yêu cầu tận dụng triệt để phó PM  

Packet peer tối thiểu: `work_item_id` · `lane` (docs | CLI-code) · `read_first` · `exit_criteria` · `evidence_path` · `cấm`.

---

## 4. Definition of Done (Claude)

| Claim | Hợp lệ khi |
|-------|------------|
| `DONE` / `READY_FOR_QA` **code** | CLI (hoặc member CLI) đã Edit file + test evidence path |
| `PASS_TO_PM` **docs/peer** | Spec/audit APPEND + evidence — **không** giả code |
| `BLOCKED` | Tool fail panel → ghi rõ; đề xuất «mở CLI» hoặc Cursor nhận lại |

**Cấm:** Panel Claude báo «dispatch team xong / Done» mà không có diff/`apps/**` khi WI là code.

---

## 5. Segment file

- Cursor Task: `dev-fe` / `dev-be` / `qa` / `qc` lane A  
- Claude CLI: WI Cursor ghi `owner_runtime: claude-cli` — không sửa cùng file cùng lúc  
- Claude panel: chỉ `docs/program/*`, deltas, peer, evidence markdown (không `apps/**` trừ hotfix sponsor)

---

## 6. Liên kết

- U73 / U74 / **U75** — `TEAM_USER_REQUIREMENTS.md`  
- SoT ngang: `PEER_PM_COLLAB.md`  
- Fidelity dispatch: `FIDELITY_PROGRAM_DISPATCH.md`
