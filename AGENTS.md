# AGENTS.md — xevn-ecosystem

Bạn là agent trong repo **XeVN Ecosystem** (XBOS + HRM + portal + mobile). Đọc file này **trước** mọi thay đổi.

## Vai trò mặc định

| Ai | Làm gì |
|----|--------|
| **Composer / Claude lead = PM** | Điều phối Task — **không** sửa `apps/**` trừ sponsor nói *tự sửa* |
| **dev-fe** | Portal / HRM web FE only |
| **dev-mobile** | React Native only |
| **dev-be** | Nest API + Prisma/DB only |
| **qa / qc / ba / sa / devops** | Theo `_vibe-team-os/roles/*.md` |

Phân lane chi tiết: `_vibe-team-os/26-DEV-LANES-WEB-MOBILE-BE.md`  
SOLID/convention: `_vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md`

## Đọc bắt buộc (không đọc hết OS)

1. `AGENTS.md` (file này)  
2. `docs/program/SUBAGENT_READ_MAP.md` ← **map theo role/lane**  
3. `docs/program/AGENT_MESSAGE_BUS.md` (tail ~80 dòng)  
4. `docs/program/TEAM_WORKING_NOW.md`  
5. Role card: `_vibe-team-os/roles/<role>.md`  
6. Spec theo map (SRS / TechSpec / DB_DESIGN / API_DESIGN)

**PM mới chưa thuộc OS:** chỉ thêm `_vibe-team-os/PM-START-HERE.md` (đọc theo tình huống).

## Path canonical (Windows)

```
C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem
```

NFD `Tài liệu` — **cấm** ghi vào `Tài liệu` (NFC) hoặc `Tai lieu` (ASCII).  
Xem `docs/program/PATH_CANONICAL_LOCK.md`.

## Locks sponsor (XeVN)

- **U65:** nghiệm thu từ FE, zero-seed  
- Soft-delete only; multi-tenant scope parity list↔get-by-id  
- Spec trước code: SRS → TechSpec → DB_DESIGN → API_DESIGN  

## Claude Code

- `CLAUDE.md` — overview + ports + entry  
- `.claude/skills/` — `enterprise-docs`, `code-reviewer`  
- `.claude/commands/` — `/review`, `/read-map` (skeleton từ OS `templates/claude-init`)  
- `.claude/rules/` — path + lanes  
- **Inventory đầy đủ (Cursor vs Claude vs OS vs SmartClinic/YTEXA):** `_vibe-team-os/27-CURSOR-CLAUDE-INIT-INVENTORY.md`  
- Không thay thế `SUBAGENT_READ_MAP`

## Stack nhanh

| Surface | Path / port |
|---------|-------------|
| Portal | `apps/web` · `:8088` / `:5175` |
| HRM FE | embed `/hr` |
| HRM API | `apps/api/hrm-api` · `:28001` / `:3001` |
| XBOS API | `apps/api/xbos-api` · `:28002` |
| Mobile | `apps/mobile` (Expo) |

## Cấm

- `git add .` mù  
- Seed để pass QA  
- Một Task full-stack khi cần tách FE/BE (`26`)  
- Đọc toàn bộ `_vibe-team-os` “cho chắc”
