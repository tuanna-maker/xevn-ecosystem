# Evidence — W1-B-04-AUTH-FE-CC-CHIP-01

| Field | Value |
| --- | --- |
| **work_item_id** | `W1-B-04-AUTH-FE-CC-CHIP-01` |
| **role** | dev-fe |
| **date** | 2026-08-03 |
| **parent FAIL** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret3.md` · residual `R-AUTH-FE-CC-MEMBERSHIP-CHIP` |
| **slice** | `docs/program/slices/DOC-ENT-P0-AUTH-M01.md` |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

```markdown
## spec_read_ack
- srs: docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01 · Diễn biến #1–5
- tech_spec: docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-MOB-AUTH · ref_srs FR-UC-M01
- db_design: docs/brand-new-documents-20270801/DB_DESIGN_NEW.md v1.1 §3.1–3.3 — membership tables READ
- api_design: docs/brand-new-documents-20270801/API_CONTRACT_NEW.md v1.1 §8.1–8.3 — login · select-membership · me
- os: 28-FE-BE-SEPARATION-DISPLAY-READY — FE bind *_label; no invent slug→label
- qa_root_cause: ExecutiveDashboardLayout outlet-only → TopHeader never on /command-center
- slice: docs/program/slices/DOC-ENT-P0-AUTH-M01.md
- change_mode: ADD (shell mount) · FIX (page height under TopHeader)
- sponsor_confirm: DOC-ENT pack · W1-B P0-1 · U65 zero-seed
```

## Root cause (confirmed)

`/command-center` routes under `ExecutiveDashboardLayout` (App.tsx) — **no** `MainLayout` → **no** `TopHeader`. Membership chip (`portal-membership-switcher` / `portal-membership-static`) lived only on `/dashboard/*`. CC page hero persona pills (BOD / Quản lý / Nhân viên) ≠ BE `tenant_label` / `company_label` / `role_label`.

## Closed

| Area | Change |
| --- | --- |
| `ExecutiveDashboardLayout.tsx` | Mount `TopHeader` when `isCommandCenterShellPath` (`/command-center` + nested); main `flex-1 min-h-0` |
| `TopHeader.tsx` | CODE-MEMORY APPEND — caller CC shell |
| `CommandCenterPage.tsx` | Root `h-dvh` → `h-full min-h-0` under shell+header; CODE-MEMORY APPEND |
| `CommandCenterInboxPage.tsx` | Same height fit; CODE-MEMORY APPEND |
| Tests | `ExecutiveDashboardLayout.test.tsx` — path helper + mount/no-mount |

## must_keep (held)

- `authSession` `*_label` helpers — **no** invent `scopeRoleLabels` slug→label map
- Inbox page · CommandCenterPage Vite transform **200**
- U65 no seed
- CODE-MEMORY APPEND (not wipe)

## Verify

```text
pnpm --filter web-portal exec vitest run \
  src/components/layout/ExecutiveDashboardLayout.test.tsx \
  src/integrations/authSession.test.ts --reporter=dot
→ Test Files: 2 passed · Tests: 14 passed

Vite probe (127.0.0.1:5173):
  ExecutiveDashboardLayout.tsx → 200
  TopHeader.tsx → 200
  CommandCenterPage.tsx → 200
  CommandCenterInboxPage.tsx → 200
  /command-center → 200
```

Note: transient CC Vite 500 during edit (invalid JSX sibling comment) — **fixed** before handoff; final probe 200.

## solid_convention_ack / fe_be_soc

- Shell mounts existing TopHeader — binds BE display-ready labels only
- Persona filter pills on CC page remain separate from membership scope chrome
- No FE invent of BOD/Quản lý as `role_label`

## Paths touched

- `apps/web/web-portal/src/components/layout/ExecutiveDashboardLayout.tsx`
- `apps/web/web-portal/src/components/layout/ExecutiveDashboardLayout.test.tsx`
- `apps/web/web-portal/src/components/layout/TopHeader.tsx` (CODE-MEMORY only)
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` (height + CODE-MEMORY)
- `apps/web/web-portal/src/pages/command-center/CommandCenterInboxPage.tsx` (height + CODE-MEMORY)
- `docs/qa/evidence/w1b-04-auth-fe-cc-chip-01.md`

## Residual / next

| id | Note | Owner |
| --- | --- | --- |
| **W1-B-04-AUTH-FE-QA-RET4** | Browser Cases B/C + test_log md+json + hdsd_align + anti_idle; assert chip BE labels; admin multi-mem → POST select-membership; F5; Vite overlay closed | **qa** |

## completion_report

Closed `R-AUTH-FE-CC-MEMBERSHIP-CHIP`: Command Center shell now mounts `TopHeader` membership chip (`portal-membership-*`) bound to BE `*_label` via existing authSession helpers. UnifiedShell `/` unchanged (no double chrome). CC/Inbox height fit under sticky header. Vitest 14/14; Vite transforms 200. Browser UF left to QA RET4 (U65 — no invent UF from vitest).

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-FE-QA-RET4
role: qa
priority: P0
entry: docs/qa/evidence/w1b-04-auth-fe-cc-chip-01.md READY_FOR_QA
parent_fail: docs/qa/evidence/w1b-04-auth-fe-qa-ret3.md
URL: http://127.0.0.1:5173/login → /command-center
Persona Case B: ceo@xe.vn / Xevn@2026
Persona Case B2 select: admin@xe.vn / Xevn@2026 (multi-mem)
U65: zero-seed · browser-only · cấm invent UF from vitest
hdsd_align: true · case_matrix fail_deep + success_hdsd + logic_br · anti_idle
AC:
1. After ceo login, /command-center shows portal-membership-switcher OR portal-membership-static with BE tenant_label / company_label / role_label (not BOD/Quản lý invent)
2. Multi-mem admin: open switcher → select other membership → POST /api/xbos/auth/select-membership 2xx + membershipId
3. F5 keeps BE labels
4. Vite overlay remains closed (CommandCenterPage/Inbox/ExecutiveDashboardLayout 200)
exit: docs/qa/evidence/w1b-04-auth-fe-qa-ret4.md + test_log md+json + screens/
ack_status: PASS_TO_PM | FAIL_TO_PM
```

## ack_status

**READY_FOR_QA**
