# Prompt — COPY FULL từ folder sai (NFC) → folder đúng (NFD)

**Sponsor 2026-08-03 (cập nhật):**  
Phải **bê hết** về canonical:

1. Toàn bộ tài liệu mới (`docs/brand-new-documents-20270801/**` + md mới liên quan)  
2. **CLAUDE.md** (bản ecosystem đầy đủ từ NFC)  
3. Hệ sinh thái Claude init: **`.claude/**`** (skills, settings, scheduled…), design/memory nếu có, **`.cursor/rules/**`** do Claude tạo ở folder sai  

**Không copy:** `AGENT_MESSAGE_BUS.md` / bus / unlock jsonl team (bus giữ bản NFD).

Path lock: sau khi copy `CLAUDE.md`, **APPEND** đoạn neo path vào cuối file (không xóa nội dung ecosystem).

---

## Khối dán Claude Code

```text
work_item_id: DO-CLAUDE-NFC-FULL-RECOVERY-02
Nhiệm vụ BẮT BUỘC: COPY / BÊ HẾT tài liệu + CLAUDE ecosystem từ folder SAI → folder ĐÚNG.
Không hỏi lại "cấm copy". Chỉ bỏ qua bus.

## DEST (đúng — NFD, có git)
C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem

Verify:
  cd "C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem"
  test -d .git && test -d apps && echo CANON_OK
  git rev-parse --show-toplevel

## SOURCE (sai — NFC, chỉ đọc)
C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem

ASCII chỉ dùng nếu file không có trên NFC:
C:\Users\ADMIN\OneDrive\Tai lieu\Vibe Coding\projects\xevn-ecosystem

## A) PHẢI COPY — tài liệu mới (hết)

Robocopy / Copy-Item đệ quy:

  SOURCE\docs\brand-new-documents-20270801\  →  DEST\docs\brand-new-documents-20270801\

Gồm mọi .md .py .txt đã viết (BRD/SRS/TECH_SPEC/DB_DESIGN/API_CONTRACT, *_VN, gen scripts, S7_KICKOFF, scratch…).

Thêm nếu có trên SOURCE:
  - mọi *.md ở ROOT SOURCE (trừ không đụng bus) → nếu là tài liệu brand-new thì đưa vào DEST\docs\brand-new-documents-20270801\
  - docs\journal\2026-08-03.md (và journal ngày Claude viết ở NFC)
  - docs\knowledge\** , docs\design\** nếu Claude tạo ở NFC

Overwrite DEST khi SOURCE mới hơn hoặc dài hơn (vd BRD stub).

## B) PHẢI COPY — CLAUDE.md + hệ sinh thái init

Copy nguyên cây / file:

  SOURCE\CLAUDE.md                    → DEST\CLAUDE.md
  SOURCE\.claude\**                   → DEST\.claude\**
      (skills/**, settings*.json, scheduled_tasks.lock, agents, hooks… — mọi thứ init Claude tạo)
  SOURCE\.cursor\rules\**             → DEST\.cursor\rules\**
      (chỉ rule Claude tạo ở NFC, vd display-label-no-raw-key.mdc — merge, không xóa rule NFD sẵn có)
  SOURCE\.cursor\skills\**            → DEST\.cursor\skills\**  (nếu có)
  SOURCE\.agentmemory\** hoặc MEMORY.md / .agents/** → DEST cùng relative path (nếu có trên NFC)

Sau khi copy CLAUDE.md, APPEND vào cuối DEST\CLAUDE.md (nếu chưa có) khối:

  ## Path lock (canonical NFD)
  Only work in: C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem
  Forbidden: OneDrive\Tài liệu\... (NFC) and OneDrive\Tai lieu\... (ASCII)
  Verify: test -d .git && test -d apps

## C) KHÔNG COPY (duy nhất — bus / team runtime)

  - **/*AGENT_MESSAGE_BUS*
  - .cursor/team/AGENT_MESSAGE_BUS.md
  - .cursor/team/UNLOCK_*.jsonl
  - docs/program/AGENT_MESSAGE_BUS.md từ NFC
  - apps/** packages/** node_modules/** .git/**

## D) Cách làm gợi ý (PowerShell)

  $src = 'C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem'
  $dst = 'C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem'

  # Tài liệu
  New-Item -ItemType Directory -Force -Path "$dst\docs\brand-new-documents-20270801" | Out-Null
  Copy-Item -Recurse -Force "$src\docs\brand-new-documents-20270801\*" "$dst\docs\brand-new-documents-20270801\"

  # CLAUDE.md + .claude
  Copy-Item -Force "$src\CLAUDE.md" "$dst\CLAUDE.md"
  if (Test-Path "$src\.claude") {
    New-Item -ItemType Directory -Force -Path "$dst\.claude" | Out-Null
    Copy-Item -Recurse -Force "$src\.claude\*" "$dst\.claude\"
  }

  # Rules Claude tạo
  if (Test-Path "$src\.cursor\rules") {
    New-Item -ItemType Directory -Force -Path "$dst\.cursor\rules" | Out-Null
    Copy-Item -Force "$src\.cursor\rules\*" "$dst\.cursor\rules\"
  }

  # Memory / design nếu có
  foreach ($p in @('.agentmemory','docs\knowledge','docs\design','.agents')) {
    if (Test-Path "$src\$p") {
      New-Item -ItemType Directory -Force -Path "$dst\$p" | Out-Null
      Copy-Item -Recurse -Force "$src\$p\*" "$dst\$p\"
    }
  }

  # Journal
  if (Test-Path "$src\docs\journal") {
    New-Item -ItemType Directory -Force -Path "$dst\docs\journal" | Out-Null
    Get-ChildItem "$src\docs\journal\*.md" | ForEach-Object {
      Copy-Item -Force $_.FullName "$dst\docs\journal\$($_.Name)"
    }
  }

## E) Chứng minh xong

  git status -sb
  Test-Path .claude\skills\code-reviewer\skill.md
  Test-Path .claude\skills\enterprise-docs\skill.md
  Test-Path .cursor\rules\display-label-no-raw-key.mdc
  (Get-Content CLAUDE.md | Measure-Object -Line).Lines
  (Get-Content docs\brand-new-documents-20270801\BRD_NEW.md | Measure-Object -Line).Lines

Evidence: docs/ops/evidence/do-claude-nfc-full-recovery-02-20260803.md
Bảng: path | copied Y/N | bytes SOURCE | bytes DEST
Liệt kê rõ đã copy: CLAUDE.md, .claude/**, rules, brand-new docs.

Không commit trừ sponsor bảo.
ack_status: PASS_TO_PM
NFC giữ nguyên backup — không xóa.
```
