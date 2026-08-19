# Claude team — onboarding & training (xevn-ecosystem)

| Meta | Value |
|------|--------|
| **Audience** | Claude Code CLI members + CLAUDE-PM panel |
| **Maintainer** | Cursor-PM |
| **Updated** | 2026-08-10 |

---

## 1. Vai trò trong dự án

| Bạn | Làm | Không làm |
|-----|-----|-----------|
| **Claude CLI** | `apps/**` · `pnpm test` · evidence `docs/qa/evidence/` | Đổi SRS khách không qua BA · seed UAT |
| **Claude panel** | Peer góp ý · spec delta · audit | Claim code DONE khi Edit fail |
| **Cursor Task** | QA/QC chính thức sau CLI `READY_FOR_QA` | — |

SoT runtime: `docs/program/PEER_CLAUDE_RUNTIME_MODEL.md`

---

## 2. Nghiệp vụ vs tài liệu UI

```text
SRS → TechSpec → DB_DESIGN + API_DESIGN  = LAW
UI_SCREEN_SPEC / PAT-* (repo)             = bind màn hình
Desktop UI_UX_SPEC_v2 / Named Field phụ lục = REFERENCE ONLY
```

OS: `_vibe-team-os/37-UI-SCREEN-SPEC-SRS-FIRST-AND-REFERENCE.md`

---

## 3. Quy trình một work item

1. Đọc `read_first` trong dispatch (`docs/program/dispatch/CLAUDE-PARALLEL-UC-CLOSURE-WAVE-01.md`).
2. `spec_read_ack` (ghi trong evidence): path SRS § + API bước Diễn biến.
3. Code trong `allowed_paths` · `@CODE-MEMORY` tiếng Việt.
4. Test: package jest/vitest + `pnpm run qc:fe-be-health` nếu đụng portal/API.
5. Evidence markdown: lệnh + exit code + file paths.
6. `TEAM_CLAUDE_STATUS.md` + `PEER_PM_COLLAB.md` APPEND DONE.

---

## 4. U65 (bắt buộc QA)

- Login `ceo@xe.vn` / `Xevn@2026` · CC `:5173/command-center/hrm/...`
- Tạo dữ liệu **chỉ** qua UI (Tạo → Lưu → F5).
- Cấm `pnpm seed:*` làm bằng chứng nghiệm thu.

---

## 5. SOLID & OS

- `_vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md`
- `_vibe-team-os/26-DEV-LANES-WEB-MOBILE-BE.md`
- `_vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md`
- FE không aggregate payroll/insurance; BE display-ready.

---

## 6. Path (Windows)

**Chỉ** canonical NFD:

`C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem`

Verify: `CLAUDE.md` dòng 1 = `hello claude abc abc abc`

Nếu sponsor dùng junction `C:\xevn-ecosystem` → phải trỏ **cùng** git root (không shadow NFC/ASCII).

---

## 7. Chương trình hiện tại (Phase 1 UC closure)

- Matrix: **244** `e2e_pass` · **1** `planned` (`UC-HRM-CO-01`) · backlog `PHASE1_UC_CLOSURE_BACKLOG.md`
- Settings W3 narrow: F5 **4/4** sau FE-07 (QC `SETW3QC1-MSN9KGQC1`)
- Payroll cluster BE: QC GWC `PAY09QC1-MSN8L7QC1` · FE browser HOLD → Claude P0

---

## 8. Escalation

| Tình huống | Hành động |
|------------|-----------|
| Thiếu SRS/API | PARK → peer BA delta; không đoán nghiệp vụ |
| Trùng file Cursor | PARK → peer PM re-roster |
| Tool 429 / fail | Ghi peer BLOCKED; Cursor retry hoặc sponsor đợi |
