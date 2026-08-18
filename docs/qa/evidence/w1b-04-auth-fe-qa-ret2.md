# Evidence — W1-B-04-AUTH-FE-QA-RET2

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-04-AUTH-FE-QA-RET2` |
| **parent** | `W1-B-04-AUTH-FE-VITE-01` READY_FOR_QA · prior FAIL `w1b-04-auth-fe-qa-ret.md` |
| **role** | qa |
| **date** | 2026-08-03 |
| **spec_ref** | FR-UC-M01 · API_CONTRACT §8.1–8.3 · slice `DOC-ENT-P0-AUTH-M01` |
| **UF / hdsd_align** | Portal login → fail msg → membership labels → select → F5 · **hdsd_align: true** |
| **U65** | zero-seed · no `pnpm seed:*` · **cấm** invent UF 🟢 from vitest · **cấm** idle-viewport-only |
| **URL** | `http://127.0.0.1:5173/login` |
| **Persona** | Case A/B: `ceo@xe.vn` · Case B select fallback: `admin@xe.vn` / `Xevn@2026` |
| **Harness** | `scripts/qa/w1b-04-auth-fe-qa-ret2-cases-browser.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret2-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret2/` |
| **ack_status** | **FAIL** |

## Environment / L0 (post-reboot poll)

| Probe | Result | at |
|-------|--------|-----|
| `http://127.0.0.1:28001/api/hrm` | **200** | run start |
| `http://127.0.0.1:28002/api/xbos` | **200** | (started via `tsc` + `node dist/main.js` — nest watch wipes dist) |
| `http://127.0.0.1:5173/login` | **200** | |
| `http://127.0.0.1:5173/src/App.tsx` | **200** | Inbox restore holds |
| `…/CommandCenterInboxPage.tsx` | **200** | R-AUTH-FE-VITE-INBOX **CLOSED** for App bootstrap |
| `…/CommandCenterPage.tsx` | **500** | **NEW blocker** |

## Idle / viewport guard

| Check | Result |
|-------|--------|
| clickCount | **14** (≥4) |
| Network auth calls | **5** (login×3 + me×2) |
| Screens with actions | login form · wrong-pwd · after-login overlay · F5 |
| `QA-IDLE-VIEWPORT` | **not** triggered — evidence has clicks + Network |

## Click path + timestamps (SoT)

| at (UTC) | step | detail |
|----------|------|--------|
| 2026-08-03T13:22:20.541Z | assert-login-form-visible | `/login` |
| 2026-08-03T13:22:22.171Z | goto-login-clear | Case A |
| 2026-08-03T13:22:24.955Z | fill-email | `ceo@xe.vn` |
| 2026-08-03T13:22:25.047Z | fill-password | wrong pwd len=25 |
| 2026-08-03T13:22:25.103Z | click-submit-login | Case A |
| 2026-08-03T13:22:28.136Z | goto-login-clear | Case B ceo |
| 2026-08-03T13:22:28.892Z | fill-email | `ceo@xe.vn` |
| 2026-08-03T13:22:28.963Z | fill-password | correct |
| 2026-08-03T13:22:29.013Z | click-submit-login | Case B |
| 2026-08-03T13:22:45.201Z | goto-login-clear | Case B admin fallback |
| 2026-08-03T13:22:45.910Z | fill-email | `admin@xe.vn` |
| 2026-08-03T13:22:46.017Z | fill-password | correct |
| 2026-08-03T13:22:46.175Z | click-submit-login | admin |
| 2026-08-03T13:23:02.365Z | reload-F5 | Case C |

## Network (auth)

| at (UTC) | Method | Status | URL | code |
|----------|--------|--------|-----|------|
| 2026-08-03T13:22:25.246Z | POST | **401** | `/api/xbos/auth/login` | `XBOS-AUTH-401` |
| 2026-08-03T13:22:29.088Z | POST | **201** | `/api/xbos/auth/login` | `XBOS-AUTH-200` |
| 2026-08-03T13:22:46.231Z | POST | **201** | `/api/xbos/auth/login` | `XBOS-AUTH-200` |
| 2026-08-03T13:23:02.691Z | GET | **200** | `/api/xbos/auth/me` | `XBOS-AUTH-200` |
| 2026-08-03T13:23:03.315Z | GET | **200** | `/api/xbos/auth/me` | `XBOS-AUTH-200` |

**No** `POST /auth/select-membership` observed — membership switcher UI unreachable (Vite overlay).

### Login 201 memberships (BE display-ready — Network only, not UF 🟢)

`ceo@xe.vn` memberships[0]:

- `tenant_label` = Tập đoàn XeVN
- `company_label` = Công ty chính
- `role_label` = CEO Tập đoàn
- `roleCode` = group_ceo (present in payload; **must not** drive UI raw)
- `membershipId` = `9db4e67b-4840-42fd-8c88-b528cb278ac9` → JWT + sessionStorage after login

`admin@xe.vn`: **5** memberships with `*_label` each (xe-tmdv / visun / xe-du-lich / xe-vietnam + holding).

## Case matrix (mission AC)

| Case | AC | Verdict | Evidence |
|------|-----|---------|----------|
| Form | Login page shows email+password | 🟢 | body «Đăng nhập» · screen `00-login-form.png` · App.tsx 200 |
| **A** | Empty/wrong password fail message | 🟢 | POST login **401** `XBOS-AUTH-401` · UI «Email hoặc mật khẩu không đúng» · stay `/login` · `A-wrong-password.png` |
| **B1** | login 2xx → picker BE `tenant_label`/`company_label`/`role_label` | 🔴 | Network labels OK · **UI mode=missing** · `vite-error-overlay=true` · chip not rendered |
| **B2** | select-membership → membershipId | 🟡/🔴 | Session/JWT mid after login **present**; **select UI click not possible**; no select Network |
| **C** | F5 labels persist | 🔴 | mid persists in storage · UI labels **missing** · overlay still up |
| AC4 | no Vite 500 / white screen | 🔴 | `GET …/CommandCenterPage.tsx` **500** ×3 · pageError dynamic import fail |

### Post-login blocker (root cause)

Vite import-analysis on default route `/command-center`:

```text
Failed to resolve import "../../data/hrm-recruitment-workflow-presets"
  from "src/pages/command-center/CommandCenterPage.tsx"
HTTP 500 /src/pages/command-center/CommandCenterPage.tsx
```

Screenshot: `B-ceo-after-login.png` (Vite overlay). File `apps/web/web-portal/src/data/hrm-recruitment-workflow-presets*` **missing** on disk.

**R-AUTH-FE-VITE-INBOX** (missing Inbox page) = **CLOSED** — login form reachable.  
**R-AUTH-FE-VITE-CC-PAGE** (CommandCenterPage missing data module) = **OPEN P0** — blocks TopHeader membership chip after redirect.

## What was not claimed

- Network `*_label` alone ≠ UF 🟢 for AC picker
- Session `membershipId` alone ≠ select-membership AC
- Prior vitest authSession — not reused as browser PASS
- Idle screenshot without clicks — rejected (this run has 14 clicks)

## Residual

| ID | Sev | Note | Owner |
|----|-----|------|-------|
| **R-AUTH-FE-VITE-CC-PAGE** | **P0** | Restore/fix `CommandCenterPage` deps (`hrm-recruitment-workflow-presets` + any chained missing `data/*`) so `/command-center` loads without Vite 500/overlay; membership chip visible | **dev-fe** |
| R-AUTH-FE-BROWSER | P0 UF | Re-run Cases B/C after Vite fix — labels UI + select click + F5 | qa |
| R-AUTH-FE-CEO-SINGLE-MEM | P2 | ceo=1 mem — use admin for select click once UI up | qa |
| R-AUTH-FE-VITE-INBOX | — | **CLOSED** this wave | — |
| R-M01-LOCKOUT-COL | P2 | unchanged | BA/SA |

## U65 / interrupt compliance

- Browser Cases A/B/C executed with timestamps + Network
- No seed
- Honest **FAIL** (not QA-IDLE-VIEWPORT)
- Login form + Case A PASS proven; Case B/C blocked by post-login Vite graph

## completion_report

Closed interrupt re-exec of **W1-B-04-AUTH-FE-QA-RET2** with **FAIL** (not idle). L0 `:28001/:28002/:5173` 200; login form 🟢; Case A wrong password 🟢 (401 + UI message). Case B/C 🔴: after login SPA hits Vite **500** on `CommandCenterPage.tsx` missing `../../data/hrm-recruitment-workflow-presets` → overlay; membership picker/static not in DOM; select-membership Network absent; F5 keeps JWT mid but not labels. Inbox restore holds. Residual **R-AUTH-FE-VITE-CC-PAGE** → dev-fe then QA RET3.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-FE-VITE-02
role: dev-fe
priority: P0
mission: Unblock post-login Command Center at http://127.0.0.1:5173 — CommandCenterPage.tsx Vite 500: Failed to resolve import "../../data/hrm-recruitment-workflow-presets" (file missing). Restore or remove dead imports so /command-center loads without overlay; TopHeader portal-membership-* visible. must_keep authSession *_label + TopHeader membership display. U65 no seed.
entry: docs/qa/evidence/w1b-04-auth-fe-qa-ret2.md FAIL · screen B-ceo-after-login.png
exit: GET /src/pages/command-center/CommandCenterPage.tsx 200; browser after ceo login shows membership chip with BE labels; READY_FOR_QA W1-B-04-AUTH-FE-QA-RET3
cấm: invent REST of portal; strip auth display-ready wiring
```

## ack_status

**FAIL**
