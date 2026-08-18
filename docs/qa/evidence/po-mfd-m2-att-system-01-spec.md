# Evidence — PO-MFD-M2-ATT-SYSTEM-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SYSTEM-01` |
| **from_role** | devops |
| **to_role** | pm |
| **lane** | governance / ops note (no production mutate) |
| **priority** | P2 (matrix #46 — last open M2 P2 seat after P2-1..4 / P2-6 ACCEPTED_AS_IS) |
| **verdict** | **A) ACCEPTED_AS_IS_P1** — honest STUB_UI / `featureInDev`; **no ops action** |
| **sponsor_confirm** | **None invented** — no Attendance CLOSED · no UAT DONE · no PROD-READY |
| **dev_coding / deploy** | **Not opened** — no `apps/**` · no VPS restart/redeploy · U65 zero-seed |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **must_keep** | M2 P1 COMPLETE · RUNTIME GWC · P2-1..4 / P2-6 ACCEPTED_AS_IS · Face #9 GĐ2-HOLD · **not** Attendance CLOSED · `uat_done: false` |

## Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| Fidelity matrix **#46** | Cài đặt→**Hệ thống** `system`. Intent: «Tham số hệ thống module». Spec **SPEC_GAP**. API **NO_API**. Class **CFG**. Runtime **STUB_UI**. UC **UNMAPPED**. Owner **devops** · P2. |
| M2 backlog **P2-5** | This WI — Settings system stub honesty · not ATT CLOSED. |
| QA-RUNTIME JSON `#46` | `forceRuntime` / `runtime` = **STUB_UI**; `signals.stub=true`; `gd2Hold=false`; no `networkBad`; body short placeholder. Evidence: `_tmp-po-mfd-m2-att-qa-runtime-01-browser.json` id `settings-Hệ-thống`. |
| FE `Attendance.tsx` | Sidebar id `system` in `getSidebarMenuItems`. **Not** in `d4StubSidebarIds` (overtime/leave-rules/late-early/request-rules). Falls through generic placeholder: label + `t('attPage.featureInDev')`. **No** Save / persist CFG. |
| ENTERPRISE_API_MAP C7 | Sidebar **… users, roles, system** → honest stub / Settings pointer (ADR D4 class). |
| DATA_CLASS §2.12 | Settings→Người dùng / Vai trò / **Hệ thống** = **MISSING_CFG_UI** stub panels. |
| HRM `Settings.tsx` tab `system` | **Separate** surface: language / timezone / date format / currency prefs — **not** Attendance module CFG SoT; **not** gated by ATT sidebar `#46`. |
| Ops SoT (`PRODUCTION_ENABLE_RUNBOOK` / `DEPLOY_GUIDE`) | Platform params (`NODE_ENV`, secrets, CORS, TLS, obs) live in **deploy `.env` / compose** — **not** behind Attendance Settings→Hệ thống UI. Closing #46 does **not** require env mutate. |
| Sister seat P2-4 | `po-mfd-m2-att-rbac-settings-01-spec.md` — same honesty class for #44–45; pattern reused. |

## As-is vs to-be (Phase-1 / M2 #46)

| Aspect | As-is | Phase-1 to-be (this delta) |
|--------|-------|----------------------------|
| #46 UI | STUB_UI `featureInDev` placeholder | **Accepted** honest stub — no fake Save / no LIVE system CFG claim |
| Nest Attendance «system params» API | None | **Not required** Phase-1 |
| Platform ops env | Deploy `.env` / runbook | **SoT remains ops** — out of Attendance CFG |
| HRM Settings → Hệ thống | Locale/currency prefs UI | Optional **operator pointer** — not ATT sidebar clone |
| Attendance-local system FR | Unspecified SPEC_GAP | **Not invented** Phase-1; future = platform settings / ops program |

## Decision options (trade-off)

| Criteria | Weight | A ACCEPTED_AS_IS_P1 | B Needs env/config ops (doc only) | C GĐ2-HOLD |
|----------|-------:|:-------------------:|:---------------------------------:|:---------:|
| Honesty vs RUNTIME STUB | 5 | High — keep STUB_UI | Medium — implies missing ops knob | Medium — Face-class HOLD misuse |
| Boundary vs ops SoT | 5 | High — env stays runbook | Low — blurs UI↔`.env` | Medium |
| Phase-1 cost / blast | 4 | Low — docs-only | Low — docs, but wrong framing | Low |
| Avoid fake LIVE CFG | 5 | High | High if no mutate | Risk of inventing GĐ2 ATT system admin |
| Attendance CLOSED risk | 5 | Safe | Safe if doc-only | Safe if not ATT build |

### A) ACCEPTED_AS_IS_P1 — **SELECTED**

Close governance residual for matrix **#46** / M2 **P2-5** without Dev or ops mutate:

1. Surface is **honest STUB_UI** (`featureInDev`) with **NO_API** — matches RUNTIME GWC.
2. Real platform knobs (`NODE_ENV`, CORS, secrets, TLS) are **deploy/runbook SoT** — not Attendance CFG. No env/config ops action is required to close this seat.
3. Operator pointer (optional, non-blocking): locale/timezone/currency at **HRM Cài đặt → Hệ thống** (`Settings.tsx`); production enable at `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md`. Attendance sidebar `#46` remains non-persist stub.
4. Same honesty class as P2-4 (#44–45) and ADR D4 sidebar stubs.

### B) Needs env/config ops (document only) — **REJECTED as primary**

Would imply #46 is blocked on missing env wiring. **False:** no Attendance system UI binds deploy env; ops SoT already documented elsewhere. Optional pointer to runbook / HRM Settings is recorded **under A**, not as a B ops work item.

### C) GĐ2-HOLD — **REJECTED as primary stamp**

Reclassifying #46 as Face-class **GĐ2-HOLD** implies a future Attendance «system admin» wave. Correct ownership is **platform settings + ops forever (or until sponsor opens platform FR)** — not «build inside Attendance in GĐ2». Stamp stays **STUB_UI + ACCEPTED_AS_IS_P1**.

## Phase-1 accepted AC (measurable)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-SYS-SET-01** | Settings→**Hệ thống** shows honest non-persist UI (`featureInDev` or equivalent stub) | Placeholder / stub visible; no Save claiming persist | Fake «đã lưu tham số hệ thống» without platform API 2xx |
| **AC-ATT-SYS-SET-02** | No Nest `/attendance/system` (or ATT-local system-params CRUD) required to close P2-5 | Close without ATT system endpoint | QA FAIL only because ATT system API missing |
| **AC-ATT-SYS-SET-03** | Platform ops SoT remains deploy `.env` / PRODUCTION_ENABLE_RUNBOOK — not ATT CFG | Cite ops docs; no ATT sidebar SoT claim | ATT #46 presented as production env SoT |
| **AC-ATT-SYS-SET-04** | Optional pointer: HRM Settings→Hệ thống (locale) and/or ops runbook — not invent ATT clone | Evidence has pointer note | Silent claim that ATT #46 is LIVE CFG |
| **AC-ATT-SYS-SET-05** | No VPS restart/redeploy/env mutate for this WI | Docs-only close | Redeploy «to green» stub |
| **AC-ATT-SYS-SET-06** | U65: no seed to green #46 | Browser honesty only | Seed/config fake for PASS |
| **AC-ATT-SYS-SET-07** | **Not** Attendance CLOSED · `uat_done` remains false · **not** PROD-READY from this WI | Explicit in stamp | Claim ATT CLOSED / UAT DONE / PROD-READY |

## Residual disposition

| ID | Status | Note |
|----|--------|------|
| M2 backlog **P2-5** / matrix #46 | **CLOSED — ACCEPTED_AS_IS_P1** | AC-ATT-SYS-SET-01..07 · no Dev · no ops mutate |
| Matrix #46 runtime | **Keep STUB_UI** | Honesty AS-IS; UNMAPPED UC OK Phase-1 |
| Platform env / prod enable | **Out of Attendance module** | Follow PRODUCTION_ENABLE_RUNBOOK when PM opens prod wave |
| Optional FE polish: D4-style Alert + link `/settings?tab=system` | **Non-blocking P2** | Not required to close P2-5 |
| Face #9 | **GĐ2-HOLD** | Unchanged — out of seat |
| Attendance CLOSED / UAT DONE / PROD-READY | **Still open / false** | This WI does not close module |

## Deferred candidate (IF sponsor later opens **platform system settings** FR — do not invent confirm)

> **Not Phase-1 Attendance.** Do **not** dispatch Attendance Dev. Do **not** invent PROD-READY.

| Candidate | Intent | Owner plane |
|-----------|--------|-------------|
| PLAT-SYS-PREFS | Persist language/timezone/date/currency tenant prefs | HRM Settings + BE |
| OPS-PROD-ENABLE | NODE_ENV / secrets / CORS / TLS / obs | DevOps runbook (existing) |
| ATT-LOCAL-SYSTEM-UI | Clone system admin under Attendance Cài đặt | **Forbidden by default** — reject unless sponsor overrides module boundary |

## Boundary diagram

```text
[deploy .env · PRODUCTION_ENABLE_RUNBOOK] ──SoT ops──► [Nest/runtime]
         │
         │  (not wired to ATT #46)
         ▼
[Attendance.tsx #46 STUB featureInDev] ──pointer optional──► [HRM Settings tab system]
                                                                  (locale prefs UI)
```

## Impacted systems

| System | Impact |
|--------|--------|
| Attendance FE sidebar #46 | Docs stamp only — keep stub honesty |
| hrm-api attendance | None |
| VPS / compose / `.env` | **None** this WI |
| PROD-READY claims | **Forbidden** from this seat |

## Ops gates (this WI)

| Gate | Result | Note |
|------|--------|------|
| Production mutate / redeploy | **SKIPPED (by design)** | Governance honesty only |
| L0 health for evidence read | **Not required** | Evidence from existing QA-RUNTIME + FE/source read |
| `verify-production-env` | **N/A** | Not a prod-enable wave |

## Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/po-mfd-m2-att-system-01-spec.md`
- **next_dispatch_prompt:** see completion packet below
