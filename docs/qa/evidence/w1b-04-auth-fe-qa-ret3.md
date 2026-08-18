# Evidence — W1-B-04-AUTH-FE-QA-RET3

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-04-AUTH-FE-QA-RET3` |
| **parent** | `W1-B-04-AUTH-FE-VITE-02` READY_FOR_QA · prior FAIL `w1b-04-auth-fe-qa-ret2.md` |
| **role** | qa |
| **date** | 2026-08-03 |
| **spec_ref** | FR-UC-M01 · API_CONTRACT §8.1–8.3 · slice `DOC-ENT-P0-AUTH-M01` |
| **UF / hdsd_align** | Portal login → fail msg → membership labels → select → F5 · **hdsd_align: true** |
| **case_matrix** | fail_deep + success_hdsd + logic_br |
| **U65** | zero-seed · no `pnpm seed:*` · **cấm** invent UF 🟢 from vitest · **cấm** idle-viewport-only |
| **URL** | `http://127.0.0.1:5173/login` |
| **Persona** | Case A/B: `ceo@xe.vn` · Case B select fallback: `admin@xe.vn` / `Xevn@2026` |
| **Harness** | `scripts/qa/w1b-04-auth-fe-qa-ret3-cases-browser.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret3-runtime.json` |
| **Test log (human)** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret3-test-log.md` |
| **Test log (machine)** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret3-test-log.json` |
| **Screens** | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret3/` |
| **ack_status** | **FAIL** |

## Environment / L0

| Probe | Result | at |
|-------|--------|-----|
| `http://127.0.0.1:28001/api/hrm` | **200** | run start |
| `http://127.0.0.1:28002/api/xbos` | **200** | |
| `http://127.0.0.1:5173/login` | **200** | |
| `http://127.0.0.1:5173/src/App.tsx` | **200** | |
| `…/CommandCenterPage.tsx` | **200** | R-AUTH-FE-VITE-CC-PAGE **CLOSED** |
| `…/CommandCenterInboxPage.tsx` | **200** | holds |
| `…/TopHeader.tsx` | **200** | module exists; **not mounted** on `/command-center` |

## Idle / viewport guard

| Check | Result |
|-------|--------|
| clickCount | **14** (≥4) |
| Network auth calls | **5** (login×3 + me×2) |
| Screens with actions | login form · wrong-pwd · after-login CC · admin CC · F5 |
| `QA-IDLE-VIEWPORT` | **not** triggered |
| Vite overlay | **false** (both ceo + admin post-login) |
| failedSrc (≥500 `/src/`) | **0** |

## Click path + timestamps (SoT)

| at (UTC) | step | detail |
|----------|------|--------|
| 2026-08-03T13:48:07.911Z | assert-login-form-visible | `/login` |
| 2026-08-03T13:48:08.887Z | goto-login-clear | Case A |
| 2026-08-03T13:48:09.520Z | fill-email | `ceo@xe.vn` |
| 2026-08-03T13:48:09.582Z | fill-password | wrong pwd len=25 |
| 2026-08-03T13:48:09.617Z | click-submit-login | Case A |
| 2026-08-03T13:48:12.518Z | goto-login-clear | Case B ceo |
| 2026-08-03T13:48:13.147Z | fill-email | `ceo@xe.vn` |
| 2026-08-03T13:48:13.192Z | fill-password | correct |
| 2026-08-03T13:48:13.232Z | click-submit-login | Case B |
| 2026-08-03T13:48:29.374Z | goto-login-clear | Case B admin fallback |
| 2026-08-03T13:48:30.025Z | fill-email | `admin@xe.vn` |
| 2026-08-03T13:48:30.082Z | fill-password | correct |
| 2026-08-03T13:48:30.120Z | click-submit-login | admin |
| 2026-08-03T13:48:46.250Z | reload-F5 | Case C |

## Network (auth)

| at (UTC) | Method | Status | URL | code |
|----------|--------|--------|-----|------|
| 2026-08-03T13:48:09.661Z | POST | **401** | `/api/xbos/auth/login` | `XBOS-AUTH-401` |
| 2026-08-03T13:48:13.291Z | POST | **201** | `/api/xbos/auth/login` | `XBOS-AUTH-200` |
| 2026-08-03T13:48:30.171Z | POST | **201** | `/api/xbos/auth/login` | `XBOS-AUTH-200` |
| 2026-08-03T13:48:46.337Z | GET | **200** | `/api/xbos/auth/me` | `XBOS-AUTH-200` |
| 2026-08-03T13:48:46.350Z | GET | **200** | `/api/xbos/auth/me` | `XBOS-AUTH-200` |

**No** `POST /auth/select-membership` observed — membership switcher not in DOM on Command Center shell.

### Login 201 memberships (BE display-ready — Network only, not UF 🟢)

`ceo@xe.vn` memberships[0]:

- `tenant_label` = Tập đoàn XeVN
- `company_label` = Công ty chính
- `role_label` = CEO Tập đoàn
- `roleCode` = group_ceo (present in payload; **must not** drive UI raw)
- `membershipId` = `9db4e67b-4840-42fd-8c88-b528cb278ac9`

`admin@xe.vn`: **5** memberships with `*_label` each (holding + xe-tmdv / visun / xe-du-lich / xe-vietnam).

## Case matrix (mission AC)

| Case | AC | Verdict | Evidence |
|------|-----|---------|----------|
| Form | Login page shows email+password | 🟢 | body «Đăng nhập» · `00-login-form.png` |
| **A** | Wrong password → 401 + UI message | 🟢 | POST **401** `XBOS-AUTH-401` · UI «Email hoặc mật khẩu không đúng» · stay `/login` · `A-wrong-password.png` |
| **B1** | login 2xx → `/command-center` NO Vite overlay; TopHeader BE `*_label` | 🔴 | Overlay **gone** · CC body loads · **UI mode=missing** (`portal-membership-switcher` / `portal-membership-static` absent) · header shows BOD / Quản lý / Nhân viên (persona tabs ≠ BE `tenant_label`/`company_label`/`role_label`) · `B-ceo-after-login.png` |
| **B2** | select-membership when multi → membershipId | 🟡/🔴 | admin 5 mem in Network; switcher **unreachable**; **no** select Network |
| **C** | F5 labels persist | 🔴 | mid/JWT persist (`4382b3d5-…`) · UI labels still missing · `C-after-f5.png` |
| AC4 Vite | no Vite 500 / white screen on CC | 🟢 | `CommandCenterPage.tsx` **200** · failedSrc=0 · overlay=false |

### Root cause (Cases B/C after Vite fix)

Vite graph for Command Center is **unblocked** (closes `R-AUTH-FE-VITE-CC-PAGE`).

Post-login default route `/command-center` is under `ExecutiveDashboardLayout` (`App.tsx`) which is **outlet-only** — **does not mount** `MainLayout` → **`TopHeader` never renders**. Membership BE labels live only in `TopHeader` (`data-testid="portal-membership-*"`). Command Center page header is a separate hero with persona pills (BOD / Quản lý / Nhân viên), not membership scope.

**Network `*_label` alone ≠ UF 🟢** for TopHeader AC.

## What was not claimed

- Vite transform 200 / vitest presets ≠ browser membership UF PASS
- Session `membershipId` alone ≠ select-membership AC
- BOD persona pills ≠ BE `role_label` / `tenant_label`
- Idle screenshot without clicks — rejected (this run has 14 clicks + Network)

## Residual

| ID | Sev | Note | Owner |
|----|-----|------|-------|
| **R-AUTH-FE-CC-MEMBERSHIP-CHIP** | **P0** | Mount TopHeader membership chip (or equivalent `portal-membership-*` bound to BE `*_label`) on `/command-center` shell so Cases B/C pass; enable multi-mem select → `POST /auth/select-membership` | **dev-fe** |
| R-AUTH-FE-SELECT-MEMBERSHIP-UI | P0 | Blocked by missing switcher on CC shell | dev-fe (same WI) |
| R-AUTH-FE-VITE-CC-PAGE | — | **CLOSED** this wave (CC 200, no overlay) | — |
| R-AUTH-FE-VITE-INBOX | — | CLOSED prior wave | — |
| R-AUTH-FE-CEO-SINGLE-MEM | P2 | ceo=1 mem — use admin for select once chip up | qa |
| R-M01-LOCKOUT-COL | P2 | unchanged | BA/SA |

## U65 / interrupt compliance

- Browser Cases A/B/C executed with timestamps + Network
- No seed
- Honest **FAIL** (not QA-IDLE-VIEWPORT; not invent from vitest)
- World-standard test-log **md + json** present
- Login form + Case A + Vite CC unblock proven; membership TopHeader AC still open

## completion_report

Closed **W1-B-04-AUTH-FE-QA-RET3** browser U65 retest after Vite-02 with **FAIL**. L0 + CommandCenterPage Vite **200**; login form 🟢; Case A wrong password 🟢 (401 + VI message). Post-login `/command-center` **no Vite overlay** (prior P0 CLOSED) but Cases B/C 🔴: `ExecutiveDashboardLayout` does not mount `TopHeader` → `portal-membership-*` absent; CC hero shows BOD/Quản lý/Nhân viên (not BE `*_label`); admin multi-mem cannot select (no select Network); F5 keeps JWT mid without label UI. Residual **R-AUTH-FE-CC-MEMBERSHIP-CHIP** → `dev-fe` then QA RET4.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-FE-CC-CHIP-01
role: dev-fe
priority: P0
mission: On http://127.0.0.1:5173/command-center after ceo@xe.vn login, mount membership chip with BE tenant_label/company_label/role_label (data-testid portal-membership-switcher or portal-membership-static). Root cause: App.tsx routes /command-center under ExecutiveDashboardLayout (no TopHeader); MainLayout TopHeader only on /dashboard/*. Wire TopHeader (or extract shared MembershipScopeChip) into CC shell without inventing scopeRoleLabels. Multi-mem admin must open switcher → POST /auth/select-membership; F5 must keep labels. must_keep authSession *_label helpers. U65 no seed.
entry: docs/qa/evidence/w1b-04-auth-fe-qa-ret3.md FAIL · R-AUTH-FE-CC-MEMBERSHIP-CHIP · screens B-ceo-after-login.png
exit: READY_FOR_QA W1-B-04-AUTH-FE-QA-RET4 — browser Cases B/C 🟢 (chip labels + select + F5); Vite overlay remains closed
cấm: invent UF from vitest; strip auth display-ready; restore scopeRoleLabels map
```

## ack_status

**FAIL**
