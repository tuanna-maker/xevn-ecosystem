# PO-ECO-TC-XBOS-LOGIN-01 — QA evidence (TC pack authoring)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-ECO-TC-XBOS-LOGIN-01` |
| **from_role** | qa |
| **to_role** | qa-synth / pm |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **u65_zero_seed** | true (precond: credentials via UI only; no `pnpm seed:*` in execution) |
| **hdsd_align** | true (Steps cite P1 Wave1 UF-XBOS-01 · J-CC-01) |
| **uat_done** | **false** — TC pack only; no browser execution this task |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-LOGIN.md` |

---

## completion_report

**Closed**

- Inventoried **8 screens** (login form, session loading gate, CC shell entry, redirect query, membership dropdown/static, profile logout entry, 401 return).
- Documented **18 user-visible fields** — full login form (Email, Mật khẩu, error banner, submit states, brand chrome) plus post-login shell markers (`portal-brand-mark`, membership chip labels from BE).
- Cataloged **12 functions** with API mapping (`POST /api/xbos/auth/login`, `GET /auth/me`, `POST /auth/select-membership`, RequireAuth redirect, 401 stash, F5 persist).
- Published **28 TCs** (HP/FD/BD/AU/UX/REG/API/UNIT) covering **UF-XBOS-01** + **J-CC-01** with **10 fail-deep auth** rows (401 wrong creds, 403 no tenant, HTML5 required, email format, API down, busy double-submit, select-membership fail, 401 session expiry, unsafe redirect, member CEO pointer UF-11).
- **depth_gate** all ☑ on pack meta; coverage check §4 GAP=0.
- **Synth dedupe note:** overlaps `TC-CC-HP-001..003` in `XBOS-CC-HOME-KPI.md` — LOGIN pack owns auth surface; CC-HOME owns widgets/rail.

**Residual**

- Synth: merge `TC-LGN-*` vs `TC-CC-HP-001` / master `PO_SPEC_TEST_CASE_CATALOG.md`; update roster `XBOS-LOGIN` row → READY_FOR_SYNTH.
- Browser execution **not** in scope — all TC **PLANNED** until U78 test-log pair.
- Lockout NFR (`R-M01-LOCKOUT-COL`) documented OOS — no TC until DDL.

---

## Inventory summary (for synth)

### Login form (`LoginPage.tsx`)

| UI element | Notes |
|------------|-------|
| Brand | Logo · **XeVN Portal** · subtitle đăng nhập tập đoàn |
| **Email** | `type=email` · required · trim+lower on submit |
| **Mật khẩu** | `type=password` · required |
| Error | `role=alert` rose panel — BE message |
| CTA | **Đăng nhập** / **Đang đăng nhập…** when busy |
| Dev footer | `du-lich.ceo@xe.vn` hint (non-prod) |

### Auth API (read-only contract)

| Case | HTTP | Code |
|------|------|------|
| Success | **201** | `XBOS-AUTH-200` |
| Bad creds / inactive | **401** | `XBOS-AUTH-401` |
| No tenant | **403** | `XBOS-AUTH-403` |
| Select membership OK | **201** | `XBOS-AUTH-201` |
| Select invalid | **403** | `XBOS-AUTH-403` |

### CC shell success markers (UF-XBOS-01)

| testid / element | PASS when |
|------------------|-----------|
| `portal-brand-mark` | Visible on `/command-center` |
| `portal-membership-switcher` or `portal-membership-static` | Membership labels VI (BE `*_label`) |
| CC home | Rail or widgets mount — detail in CC-HOME pack |

---

## spec_ref

- UF-XBOS-01 · `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3
- J-CC-01 · `docs/program/PROGRAM_JOURNEY_MAP.md`
- FR-XBOS-AUTH-01 · FR-XBOS-TENANT-01 · `docs/xbos/TECHSPEC.md` §14.1–14.2
- `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` row 1
- `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` DoD §2
- `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` (execution deferred)

---

## depth_gate checklist

| Gate | PASS |
|------|------|
| All login form fields in §2 | ☑ |
| Fail-deep auth ≥5 distinct BR | ☑ (10 rows) |
| Success land CC shell TC | ☑ HP-001..002 |
| Redirect + RequireAuth guard | ☑ |
| UF-XBOS-11 pointer (no full dup) | ☑ TC-LGN-AU-003 |
| No `apps/**` change | ☑ |
| No browser / UAT DONE claim | ☑ |

---

## counts

| Metric | Value |
|--------|------:|
| screens | 8 |
| fields | 18 |
| functions | 12 |
| test cases | 28 |

---

## next_owner

**qa-synth** (or **pm** to dispatch synth Task)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-XBOS-LOGIN-01
from_role: pm
to_role: qa

Mission: SYNTH dedupe TC pack `docs/qa/testcases/xbos/XBOS-LOGIN.md` (28× TC-LGN-*) against `XBOS-CC-HOME-KPI.md` (TC-CC-HP-001 login overlap) + `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md`; set roster `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` row XBOS-LOGIN status READY_FOR_SYNTH → SYNTHED; append `docs/qa/reports/PO_SPEC_TEST_REPORT.md` Ecosystem depth § login counts.

read_first: XBOS-LOGIN.md · po-eco-tc-xbos-login-01.md · PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md §3 synth rule.

exit_criteria: synth evidence md in docs/qa/evidence/; no duplicate TC-ID; ack PASS_TO_PM. No browser run; no UAT DONE.
```

---

## Handoff contract

| Field | Value |
|-------|-------|
| completion_report | See § completion_report above |
| next_owner | qa-synth |
| next_dispatch_prompt | See block above |
| evidence_path | `docs/qa/evidence/po-eco-tc-xbos-login-01.md` |
| ack_status | **READY_FOR_SYNTH** |

---

*Authoring only · IEEE 829 test execution logs required when TCs move to EVIDENCED*
