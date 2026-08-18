# Evidence — W1-B-04-AUTH-FE-VITE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-04-AUTH-FE-VITE-01` |
| **parent residual** | `R-AUTH-FE-VITE-INBOX` ← `docs/qa/evidence/w1b-04-auth-fe-qa-ret.md` |
| **role** | dev-fe |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed · no `pnpm seed:*` · auth `*_label` wiring untouched |

## Root cause

`App.tsx` lazy-imports `./pages/command-center/CommandCenterInboxPage` (route `command-center/inbox`, introduced in commit `5ecb04e`) but the page file was **never committed to git**. Vite transform of `App.tsx` → **500** → entire SPA module graph fails → `/login` white screen.

## Fix

| Step | Action |
|------|--------|
| 1 | Located prior delivery `D-HDSD-WF-INBOX-FE-01` in agent transcript `177d3857-4679-4645-9523-eb41e95a0260` |
| 2 | Restored real `CommandCenterInboxPage.tsx` + unit test from that Write payload (not empty stub) |
| 3 | APPEND `@CODE-MEMORY-CHANGE` for `W1-B-04-AUTH-FE-VITE-01` |
| 4 | Test mocks `CapabilityActionButton` / `ApiLoadBanner` only to avoid unrelated `@xevn/ui` missing export in vitest graph |

**App.tsx:** no path change required — import already correct once file exists.

## must_keep verified

- No edits to `authSession` / TopHeader / GlobalFilter membership display helpers
- No leave/EMP rewrite
- Inbox page keeps U65 API-only fetch (`fetchCommandCenterInboxTasks`)

## Verification

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:5173/src/App.tsx` | **200** (was 500) |
| `GET …/CommandCenterInboxPage.tsx` | **200** |
| `GET …/LoginPage.tsx` | **200** |
| Browser `http://127.0.0.1:5173/login` | email+password inputs **visible**; body shows «Đăng nhập»; `failedSrcResponses=[]`; `consoleErrors=[]` |
| Screenshot | `docs/qa/evidence/screens/w1b-04-auth-fe-vite-01/login-form.png` |
| Runtime JSON | `docs/qa/evidence/_tmp-w1b-04-auth-fe-vite-01-runtime.json` |
| vitest `CommandCenterInboxPage.test.tsx` | **1/1 PASS** |

### Browser body preview (login)

```text
XeVN Portal
Đăng nhập tập đoàn / công ty thành viên
Email
Mật khẩu
Đăng nhập
```

## Residual (for QA)

| ID | Note | Owner |
|----|------|-------|
| **R-AUTH-FE-BROWSER** | FR-UC-M01 AC1–4 still open — run browser UF on :5173 | **qa** (`W1-B-04-AUTH-FE-QA-RET2`) |
| R-AUTH-FE-CEO-SINGLE-MEM | `ceo@xe.vn` may have 1 membership — use `admin@xe.vn` for select-membership click | qa |

## Files touched

- `apps/web/web-portal/src/pages/command-center/CommandCenterInboxPage.tsx` (**restored**)
- `apps/web/web-portal/src/pages/command-center/CommandCenterInboxPage.test.tsx` (**restored** + mock isolation)
- `docs/qa/evidence/w1b-04-auth-fe-vite-01.md` (this file)

## completion_report

Closed **R-AUTH-FE-VITE-INBOX**: restored real Command Center inbox page from D-HDSD-WF-INBOX-FE-01 transcript so Vite resolves lazy import; `/login` renders email+password; App.tsx module graph **200**. Auth display-ready wiring untouched. Ready for QA browser FR-UC-M01 AC1–4.

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-FE-QA-RET2
role: qa
priority: P0
entry: docs/qa/evidence/w1b-04-auth-fe-vite-01.md READY_FOR_QA · L0 :5173/:28001/:28002 · U65 zero-seed
mission: Browser FR-UC-M01 AC1–4 on http://127.0.0.1:5173 — login form visible; ceo@xe.vn / Xevn@2026 login → membership picker shows BE tenant_label/company_label/role_label (not raw roleCode); select-membership if multi (admin@xe.vn if ceo single-mem); F5 labels persist; click path + Network in evidence.
cấm: seed · invent UF 🟢 from vitest/API-only · claim PASS without browser form+Network
exit: PASS_TO_PM or FAIL with residual · evidence docs/qa/evidence/w1b-04-auth-fe-qa-ret2.md
must_keep: authSession *_label bind · TopHeader/GlobalFilter membership display
```
