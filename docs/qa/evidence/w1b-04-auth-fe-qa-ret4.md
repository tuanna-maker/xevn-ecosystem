# Evidence — W1-B-04-AUTH-FE-QA-RET4

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-04-AUTH-FE-QA-RET4` |
| **parent** | `W1-B-04-AUTH-FE-CC-CHIP-01` READY_FOR_QA · prior FAIL `w1b-04-auth-fe-qa-ret3.md` |
| **role** | qa |
| **date** | 2026-08-03 |
| **spec_ref** | FR-UC-M01 · API_CONTRACT §8.1–8.3 · slice `DOC-ENT-P0-AUTH-M01` |
| **UF / hdsd_align** | Portal login → fail msg → CC membership labels → select → F5 · **hdsd_align: true** |
| **case_matrix** | fail_deep (spot A) + success_hdsd + logic_br |
| **U65** | zero-seed · no `pnpm seed:*` · **cấm** invent UF 🟢 from vitest · **cấm** idle-viewport-only |
| **URL** | `http://127.0.0.1:5173/login` → `/command-center` |
| **Persona** | Case A/B1: `ceo@xe.vn` · Case B2 select: `admin@xe.vn` / `Xevn@2026` |
| **Harness** | `scripts/qa/w1b-04-auth-fe-qa-ret4-cases-browser.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret4-runtime.json` |
| **Test log (human)** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret4-test-log.md` |
| **Test log (machine)** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret4-test-log.json` |
| **Screens** | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/` |
| **ack_status** | **PASS_TO_PM** |

## Environment / L0

| Probe | Result |
|-------|--------|
| `http://127.0.0.1:28001/api/hrm` | **200** |
| `http://127.0.0.1:28002/api/xbos` | **200** |
| `http://127.0.0.1:5173/login` | **200** |
| `…/src/App.tsx` | **200** |
| `…/CommandCenterPage.tsx` | **200** |
| `…/TopHeader.tsx` | **200** |
| `…/ExecutiveDashboardLayout.tsx` | **200** |

## Idle / viewport guard

| Check | Result |
|-------|--------|
| clickCount | **16** (≥4) |
| Network auth calls | **6** (login×3 + select-membership×1 + me×2) |
| Screens with actions | login · wrong-pwd · ceo CC · admin CC · picker · after-select · F5 |
| `QA-IDLE-VIEWPORT` | **not** triggered |
| Vite overlay | **false** (ceo + admin post-login + F5) |
| failedSrc (≥500 `/src/`) | **0** |

## Click path + timestamps (SoT)

| at (UTC) | step | detail |
|----------|------|--------|
| 2026-08-03T13:56:45.448Z | assert-login-form-visible | `/login` |
| 2026-08-03T13:56:46.394Z | goto-login-clear | Case A |
| 2026-08-03T13:56:47.023Z | fill-email | `ceo@xe.vn` |
| 2026-08-03T13:56:47.097Z | fill-password | wrong pwd len=25 |
| 2026-08-03T13:56:47.125Z | click-submit-login | Case A |
| 2026-08-03T13:56:50.034Z | goto-login-clear | Case B ceo |
| 2026-08-03T13:56:50.673Z | fill-email | `ceo@xe.vn` |
| 2026-08-03T13:56:50.716Z | fill-password | correct |
| 2026-08-03T13:56:50.752Z | click-submit-login | Case B |
| 2026-08-03T13:56:54.886Z | goto-login-clear | Case B admin multi-mem |
| 2026-08-03T13:56:55.540Z | fill-email | `admin@xe.vn` |
| 2026-08-03T13:56:55.601Z | fill-password | correct |
| 2026-08-03T13:56:55.636Z | click-submit-login | admin |
| 2026-08-03T13:56:59.757Z | open-membership-switcher | CC shell |
| 2026-08-03T13:57:00.401Z | click-other-membership | xe-tmdv |
| 2026-08-03T13:57:03.011Z | reload-F5 | Case C |

## Network (auth)

| at (UTC) | Method | Status | URL | code |
|----------|--------|--------|-----|------|
| 2026-08-03T13:56:47.171Z | POST | **401** | `/api/xbos/auth/login` | `XBOS-AUTH-401` |
| 2026-08-03T13:56:50.814Z | POST | **201** | `/api/xbos/auth/login` | `XBOS-AUTH-200` |
| 2026-08-03T13:56:55.686Z | POST | **201** | `/api/xbos/auth/login` | `XBOS-AUTH-200` |
| 2026-08-03T13:57:00.420Z | POST | **201** | `/api/xbos/auth/select-membership` | `XBOS-AUTH-201` |
| 2026-08-03T13:57:03.092Z | GET | **200** | `/api/xbos/auth/me` | `XBOS-AUTH-200` |
| 2026-08-03T13:57:03.108Z | GET | **200** | `/api/xbos/auth/me` | `XBOS-AUTH-200` |

### BE display-ready vs UI (AC1)

`ceo@xe.vn` login memberships[0]:

| Field | BE | UI chip (`portal-membership-static`) |
|-------|-----|--------------------------------------|
| `tenant_label` | Tập đoàn XeVN | ✅ present |
| `company_label` | Công ty chính | ✅ present |
| `role_label` | CEO Tập đoàn | ✅ present |
| `roleCode` | group_ceo | **not** shown raw |

URL after login: `http://127.0.0.1:5173/command-center` · mode=**static** (single mem) · viteOverlay=**false**.

### Multi-mem select (AC2)

`admin@xe.vn` → switcher on CC → 5 picker items (BE labels, no raw roleCode) → selected **Công ty Cổ phần Thương mại và Dịch vụ X.E** → POST select-membership **201** `XBOS-AUTH-201` · JWT/session mid=`0b7f492e-6a34-458b-b46c-7f1ac2f9e664`.

### F5 (AC3)

After reload: still `/command-center` · mode=**switcher** · chip shows selected tenant **Công ty Cổ phần Thương mại và Dịch vụ X.E** + role **CEO công ty thành viên** · mid persists · overlay=false.

## Case matrix (mission AC)

| Case | AC | Verdict | Evidence |
|------|-----|---------|----------|
| Form | Login page email+password | 🟢 | `00-login-form.png` |
| **A** (spot) | Wrong password → 401 + UI message | 🟢 | POST **401** · «Email hoặc mật khẩu không đúng» · `A-wrong-password.png` |
| **B1** | `/command-center` chip BE `*_label` | 🟢 | `portal-membership-static` · tenant+company+role · `B-ceo-after-login.png` |
| **B2** | Multi-mem → POST select-membership 2xx | 🟢 | POST **201** `XBOS-AUTH-201` · mid update · `B-admin-picker.png` / `B-admin-after-select.png` |
| **C** | F5 labels persist | 🟢 | mid + selected labels · `C-after-f5.png` |
| AC4 Vite | overlay closed | 🟢 | overlay=false · failedSrc=0 · transforms 200 |

## Closed residuals (from RET3)

| ID | Result |
|----|--------|
| **R-AUTH-FE-CC-MEMBERSHIP-CHIP** | **CLOSED** — TopHeader mounted on CC shell; chip binds BE `*_label` |
| **R-AUTH-FE-SELECT-MEMBERSHIP-UI** | **CLOSED** — admin switcher → POST select-membership 201 |

## Out-of-scope observations (not AUTH AC fail)

| Note | Sev | Owner |
|------|-----|-------|
| Console: `catalog-governance/inbox` **409** tenantId vs token scope (ceo@ on CC load) | P2 | separate WI if CC inbox UF in scope |
| R-M01-LOCKOUT-COL | P2 | BA/SA unchanged |

## U65 / compliance

- Browser Cases A/B/C with timestamps + Network
- No seed
- No invent UF from vitest
- World-standard test-log **md + json** present
- Anti-idle: 16 clicks · 6 auth Network · 7 screens

## completion_report

Closed **W1-B-04-AUTH-FE-QA-RET4** browser U65 retest after CC-CHIP-01 with **PASS_TO_PM**. L0 + TopHeader/ExecLayout/CommandCenterPage Vite **200**. Spot Case A 🟢. Case B: ceo on `/command-center` shows `portal-membership-static` with BE tenant/company/role labels (not invent, not persona-only); admin multi-mem switcher → POST `/api/xbos/auth/select-membership` **201** + mid. Case C F5 keeps selected labels + mid. Vite overlay remains closed. Residuals R-AUTH-FE-CC-MEMBERSHIP-CHIP + SELECT-UI **CLOSED**. Out-of-scope: catalog-governance inbox 409 console noise.

## next_owner

`pm` (or `qc` if AUTH-M01 wave gate)

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-FE-QC-01 (or next open AUTH/P0 from backlog)
role: qc
priority: P1
mission: Gate FR-UC-M01 portal auth after QA RET4 PASS — audit evidence w1b-04-auth-fe-qa-ret4.md + test-log md/json; confirm R-AUTH-FE-CC-MEMBERSHIP-CHIP CLOSED; do not reopen Vite/chip residuals without regression. Note P2 catalog-governance inbox 409 out of AUTH AC.
entry: docs/qa/evidence/w1b-04-auth-fe-qa-ret4.md PASS_TO_PM
exit: GO | GO WITH CONDITIONS · evidence qc path
```

## ack_status

**PASS_TO_PM**
