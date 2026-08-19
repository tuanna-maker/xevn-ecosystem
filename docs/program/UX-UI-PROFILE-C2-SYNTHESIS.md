# U74 — Profile tabs C2 (Claude handoff D-UX-PROFILE-TABS-01)

| Field | Value |
|-------|-------|
| **Status** | **C2a FE READY_FOR_QA — 2026-07-28** (`D-UX-PROFILE-TABS-01` → QA-UX-PROFILE-C2-01) |
| **Ping** | Claude HANDOFF → Cursor |
| **vs ACTIVE remaining** | R0–R3 **không** gồm Profile (D1/UX-03/D5/UX-09/P0-c/WCAG) |

## Scope Claude đề xuất
- `EmployeeProfile.tsx` — 15 tabs → 4 nhóm: Core / HR / Career / Personal
- Lazy non-Core · PermissionFallback salary (UX-07)
- DoD: click depth ≤2 · không regress pin localStorage

## Cursor đề xuất (khi bạn chốt)
| Phase | Owner | WI |
|-------|-------|-----|
| C2a | Cursor `dev-fe` | `D-UX-PROFILE-TABS-01` — 4 tab groups + lazy |
| C2b | Cursor `qa` | Browser UF Profile groups |

**Sequencing:** sau UX-03 QA PASS khuyến nghị; **không** song song D5/Payroll đang in-flight nếu cùng blast HRM lớn — Profile file tách (`EmployeeProfile.tsx`) có thể song song D5 nếu bạn chốt «làm Profile ngay».

## Xin một dòng
- **«Chốt Profile C2 — làm ngay»** → Cursor Task FE
- **«Profile sau UX-09/P0-c»** → giữ queue
- **«Hoãn Profile»** → SUPERSEDE
