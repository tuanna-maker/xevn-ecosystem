# QC-OPS-REMOVE-NIPIO-01 — Gate OPS nip.io purge (HOLD_DEPLOY · U65)

**Date:** 2026-07-28  
**work_item_id:** QC-OPS-REMOVE-NIPIO-01  
**from_role:** qc  
**to_role:** pm  
**lane:** governance  
**ack_status:** PASS_TO_PM  
**Verdict:** **GO WITH CONDITIONS** (OPS slice only)

**Upstream:**
- QA: `docs/qa/evidence/qa-ops-remove-nipio-01-20260728.md` (`PASS_TO_PM`)
- DevOps: `docs/qa/evidence/d-ops-remove-nipio-01-20260728.md` (`READY_FOR_QA`)

**cấm respected:** no seed · no nginx reload · **NOT** Phase1 DONE · **NOT** PROD-READY

## Scope (bounded)

| In | Out |
|----|-----|
| Active source/config purge: `apps/` + `deploy/` + `*.env.example*` | Live VPS nginx reload |
| Probe SoT default `:8088` + nip.io env reject exit 2 | Product CRUD / J-* L2.5 matrix |
| HOLD_DEPLOY residual accepted | Phase1 / PROD claim |

## Classification

| Signal | Class | Action |
|--------|-------|--------|
| apps + deploy + `.env.example*` zero hyphen-dns / nip.io defaults | OPS/config PASS | Accept |
| `scripts/tmp-p1-ex-qa-https-01-probe.mjs:10` literal `nip.io` in reject message | OPS residual P3 (intentional guard) | GWC condition R-OPS-NIPIO-GUARD-01 |
| Live nginx may still serve old DNS until reload | ENV/ops Info under HOLD_DEPLOY | Not product NO-GO |
| `verify:qc:evidence-pack` 3/8 on QA MD | PROCESS expected for OPS (no J-*/CRUD tables) | Not PRODUCT NO-GO; not re-dispatch QA for minigate fields |

## Exit criteria audit

| # | Criterion | QC result | Independent evidence |
|---|-----------|-----------|----------------------|
| 1 | apps + deploy + `.env.example*` zero hyphen-dns / nip.io defaults | **PASS** (+ P3 guard residual in scripts) | `rg apps deploy` → no matches (exit 1). `rg -g "*.env.example*"` → no matches. Hyphen `14-225-217-232` across apps/scripts/deploy → **0**. Sole `nip.io` = probe reject string line 10 (`R-OPS-NIPIO-GUARD-01`). |
| 2 | Probe default `http://14.225.217.232:8088`; nip.io `PORTAL_DEV_URL` → exit 2 | **PASS** | Unset → `DEFAULT= http://14.225.217.232:8088`. `PORTAL_DEV_URL=http://ceo.14-225-217-232.nip.io:8088` → `FAIL … must not use nip.io` · **EXIT=2**. |
| 3 | GO or GWC OPS slice; HOLD_DEPLOY OK | **GWC** | See Conditions below. |
| 4 | This evidence path | **PASS** | this file |
| 5 | ack | **PASS_TO_PM** | below |

## QC independent spot-checks (2026-07-28)

```text
rg -n "14-225-217-232" apps scripts deploy
# → no matches (HYPHEN_EXIT=1)

rg -n "nip\.io" apps deploy
# → no matches (APPS_DEPLOY_NIP_EXIT=1)

rg -n "nip\.io|14-225-217-232" apps scripts deploy
# → scripts\tmp-p1-ex-qa-https-01-probe.mjs:10  (reject console.error only)

rg -n "nip\.io|14-225-217-232" -g "*.env.example*" .
# → no matches

node -e "…PORTAL default…"
# → DEFAULT= http://14.225.217.232:8088

PORTAL_DEV_URL=http://ceo.14-225-217-232.nip.io:8088 node scripts/tmp-p1-ex-qa-https-01-probe.mjs
# → FAIL … must not use nip.io · EXIT=2

GET http://14.225.217.232:8088/
# → 200 len=757
```

Source confirm: probe literal `|| 'http://14.225.217.232:8088'` at `scripts/tmp-p1-ex-qa-https-01-probe.mjs:8`.

## Evidence-pack note

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-ops-remove-nipio-01-20260728.md
# → FAIL 3/8: missing command_table, journey_l25, crud_or_matrix
```

**QC ruling:** OPS config-purge wave is **out of CRUD/J-* minigate shape** by PM dispatch. Incomplete pack fields are **PROCESS-expected**, not grounds to NO-GO product or re-open Dev. Gate evidence for this WI = QC independent rg + probe + smoke above (this file).

## Conditions (GWC)

| ID | Sev | Status | Note |
|----|-----|--------|------|
| R-OPS-NIPIO-GUARD-01 | P3 | OPEN (accepted) | Probe reject message still contains literal `nip.io` (defense string). Optional DevOps reword for rg-literal-zero across `scripts/`. Does **not** block OPS GWC. |
| R-OPS-NIPIO-VPS-LIVE | Info | OPEN (HOLD_DEPLOY) | Live VPS nginx may still serve old DNS cert/vhost until future reload — **out of this wave**; reload **cấm**. |

## Explicit non-claims

- **NOT** Phase 1 DONE  
- **NOT** PROD-READY / UAT-PASS program claim  
- **NOT** authorization to `nginx reload` / deploy apply  
- L2.5 J-* / CRUD matrix **out of scope** this WI

## Verdict

**GO WITH CONDITIONS** — OPS slice `D-OPS-REMOVE-NIPIO-01` / `QA-OPS-REMOVE-NIPIO-01` accepted for active `apps/` + `deploy/` + `.env.example*` purge and probe SoT + reject. Residuals P3 guard string + HOLD_DEPLOY Info only.

## completion_report

- **Closed:** QC-OPS-REMOVE-NIPIO-01 governance gate; QA PASS_TO_PM audited; QC independent rg/probe/smoke confirm apps+deploy+env.example zero defaults; probe default `:8088` + nip.io env exit 2.
- **Residual:** R-OPS-NIPIO-GUARD-01 P3 (optional reword); R-OPS-NIPIO-VPS-LIVE Info under HOLD_DEPLOY.
- **Non-claims:** no Phase1/PROD; no nginx reload.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: PM-OPS-REMOVE-NIPIO-CLOSE-01
role: pm
entry: docs/qa/evidence/qc-ops-remove-nipio-01-20260728.md — GO WITH CONDITIONS (OPS); PASS_TO_PM
action:
  1) Bus INTAKE QC GWC; close D-OPS / QA-OPS / QC-OPS wave on TEAM_WORKING_NOW / backlog
  2) Keep HOLD_DEPLOY — do NOT dispatch nginx reload
  3) Optional only: D-OPS-NIPIO-GUARD-REWORD-01 (P3) — reword probe reject to avoid literal "nip.io" for rg-zero across scripts/
  4) Continue other open P0/P1 from pm:idle:check — do not claim Phase1/PROD from this OPS GWC
cấm: seed; nginx reload; Phase1/PROD claim from this evidence
```

## ack_status

PASS_TO_PM
