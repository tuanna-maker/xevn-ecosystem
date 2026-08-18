# TM-CODE-MEMORY-COVERAGE-01 — CODE-MEMORY coverage gate

| Field | Value |
|-------|--------|
| **work_item_id** | `TM-CODE-MEMORY-COVERAGE-01` |
| **from_role** | technical-manager |
| **to_role** | pm |
| **Date** | 2026-07-22 |
| **Deploy** | **CẤM** — measurement / governance only |
| **ack_status** | **PASS_TO_PM** |
| **Verdict** | **GO WITH CONDITIONS** (coverage gap + preflight missing — not product GO) |

---

## 1. Method

**Valid block** = file contains `@CODE-MEMORY` **and** first ~45 lines include labeled fields:

- `* UC:`
- `* SRS:`
- `* TechSpec:`

**Diễn biến step refs** = body contains `Diễn biến` **or** `SRS bước` (OS / W1 spine convention).

**Scopes measured (Node UTF-8 walk, exclude `*.spec.*` / `*.test.*` / `node_modules`):**

| Scope | Glob |
|-------|------|
| hrm-api | `apps/api/hrm-api/src/**/*.service.ts` + `*.controller.ts` |
| web critical | `apps/web/web-portal/src/**/*Page.tsx` + `apps/web/hrm/src/pages/*.tsx` |
| hrm-mobile | `apps/mobile/hrm-mobile/src/features/**/*.{ts,tsx}` |

Method: one-shot Node UTF-8 walk (ephemeral). Raw JSON: `docs/qa/evidence/_tmp-cm-coverage-20260722.json`.

**Reference good block:** `apps/api/hrm-api/src/recruitment/hire-employee-link.ts` — UC + SRS + TechSpec + `SRS bước: Diễn biến #…`.

---

## 2. Coverage results

| Scope | Total | with `@CODE-MEMORY` | **valid** UC+SRS+TechSpec | with Diễn biến / SRS bước |
|-------|------:|--------------------:|--------------------------:|--------------------------:|
| **hrm-api** svc+ctrl | 67 | 18 (**26.9%**) | 18 (**26.9%**) | 15 (**22.4%**; **83.3%** of CM files) |
| **web** critical pages | 52 | 11 (**21.2%**) | 7 (**13.5%**) | 0 (**0%**) |
| **hrm-mobile** features | 23 | 7 (**30.4%**) | 6 (**26.1%**) | 0 (**0%**) |
| **Weighted (3 scopes)** | **142** | **36 (25.4%)** | **31 (21.8%)** | **15 (10.6%)** |
| apps `*.ts`/`*.tsx` business (context) | 1105 | 190 (**17.2%**) | — | — |

### Interpretation

1. **Policy ALIGNED** (rule `code-memory-journal-full.mdc` + OS `04-CODE-MEMORY-JOURNAL.md`) — **enforcement FAIL**.
2. HRM API W1 spine (employees / attendance / payroll / recruitment / contracts / settings) carries most **valid + Diễn biến** coverage; long-tail modules (catalog-sync, home, fleet, decisions, auth mobile, notifications…) largely **NO_CM**.
3. Web + mobile: some `@CODE-MEMORY` / CHANGE stamps exist, but **almost zero Diễn biến step refs**; several high-traffic pages have stub/incomplete blocks (UC only or CHANGE-only).

---

## 3. Sample — 10 high-traffic files WITHOUT valid CM or without Diễn biến

| # | Path | Traffic rationale | Finding |
|---|------|-------------------|---------|
| 1 | `apps/web/hrm/src/pages/Dashboard.tsx` | HRM home | **NO_CM** |
| 2 | `apps/web/hrm/src/pages/Employees.tsx` | J-HRM-02 list | CM present; **missing SRS + TechSpec**; **no Diễn biến** |
| 3 | `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | CC shell (~495KB) | CHANGE-only stamps; **no UC/SRS/TechSpec header**; **no Diễn biến** |
| 4 | `apps/web/web-portal/src/pages/auth/LoginPage.tsx` | Auth entry | **NO_CM** |
| 5 | `apps/api/hrm-api/src/attendance/attendance-requests.service.ts` | Update-request ESS | **NO_CM** |
| 6 | `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts` | XBOS→HRM catalog | **NO_CM** |
| 7 | `apps/api/hrm-api/src/home/home.service.ts` | Home/KPI tiles | **NO_CM** |
| 8 | `apps/api/hrm-api/src/employees/employee-profile.service.ts` | Profile get/patch | **NO_CM** |
| 9 | `apps/mobile/hrm-mobile/src/features/attendance/CheckInScreen.tsx` | J-MOB check-in | **NO_CM** |
| 10 | `apps/mobile/hrm-mobile/src/features/dashboard/DashboardScreen.tsx` | Mobile home | **NO_CM** |

**Positive contrast (not in gap sample):** `hire-employee-link.ts`, W1 `employees.service.ts` / `attendance.service.ts` / `payroll.service.ts` — have Diễn biến mapping (prior QA-HRM-CODE-MEMORY-SRS-STEP-01).

---

## 4. Preflight `check-code-memory` — existence & enforcement

| Check | Result |
|-------|--------|
| OS SoT requires gate | **YES** — `_vibe-team-os/04-CODE-MEMORY-JOURNAL.md` → `npm run preflight` → `check-code-memory.mjs`; bootstrap template lists `scripts/preflight/check-code-memory.mjs` |
| `scripts/preflight/` in xevn-ecosystem | **MISSING** |
| `package.json` script `preflight` / `check-code-memory` | **MISSING** (no matches) |
| Husky / lefthook | **MISSING** |
| `.github/workflows/*` CODE-MEMORY job | **MISSING** — `hrm-quality-gate.yml` = lint/test/build only |
| Global Cursor rule | **PRESENT** (`code-memory-journal-full.mdc`) — advisory only |

**G-CM-03 verdict:** `check-code-memory` is **documented in OS but NOT implemented / NOT enforced** in this repo. CI will **not** fail a business file missing `@CODE-MEMORY`.

---

## 5. Conditions / remediation (owners)

| ID | Condition | Owner | Priority | Acceptance |
|----|-----------|-------|----------|------------|
| **C-CM-01** | Bootstrap `scripts/preflight/check-code-memory.mjs` + `pnpm preflight` (mirror OS); wire to `hrm-quality-gate` or pre-commit | devops + TM | **P0** | Changed business paths without valid block → exit ≠ 0 |
| **C-CM-02** | Backfill valid CM + Diễn biến on sample #1–#10 (and catalog-sync / home / profile) | dev-be / dev-fe / dev-mobile | **P1** | 10/10 sample → valid + ≥1 Diễn biến # |
| **C-CM-03** | Web/mobile: require `SRS bước:` on touch of UF/J-* pages | TM convention + Dev | **P1** | New FE/MOB touch includes Diễn biến # |
| **C-CM-04** | Re-measure after wave → register §3 refresh | TM | P2 | Weighted valid ≥ 60% on same scopes (interim target) |

**must_keep:** Do not regress W1 spine CM / Diễn biến already QA’d; do not claim Phase1/PROD from this measurement.

---

## 6. Register merge

Appended `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` **§3.3–§3.5** with metrics + sample + G-CM-03 CLOSED-as-gap (preflight absent).

---

## completion_report

**Closed:** Measured CODE-MEMORY coverage (3 scopes); sampled 10 high-traffic gaps; confirmed OS preflight script **not present / not enforced** in xevn-ecosystem; evidence + gap register §3 updated.

**Residual:** C-CM-01..04 open; weighted valid **21.8%**; web/mobile Diễn biến **0%**; no product code changed; **no deploy**.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: DEVOPS-CODE-MEMORY-PREFLIGHT-01
role: devops (+ TM review)
entry: TM-CODE-MEMORY-COVERAGE-01 PASS_TO_PM; evidence docs/qa/evidence/tm-code-memory-coverage-01-20260722.md; OS SoT _vibe-team-os/04-CODE-MEMORY-JOURNAL.md
task: ADD scripts/preflight/check-code-memory.mjs + pnpm preflight; fail on changed business files missing @CODE-MEMORY with UC+SRS+TechSpec; wire to hrm-quality-gate.yml (or documented waiver). CẤM deploy.
exit: script exit 0 on clean; intentional missing-CM fixture fails; evidence docs/qa/evidence/devops-code-memory-preflight-01-YYYYMMDD.md
parallel (after or with): BE/FE/MOB backfill C-CM-02 on the 10-file sample — work_items BE-CM-BACKFILL-HT-01 / FE-CM-BACKFILL-HT-01 / MOB-CM-BACKFILL-HT-01
```

## evidence_path

`docs/qa/evidence/tm-code-memory-coverage-01-20260722.md`

## ack_status

**PASS_TO_PM**
