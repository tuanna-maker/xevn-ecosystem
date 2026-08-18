# QA-OPS-REMOVE-NIPIO-01 — Retest nip.io purge (HOLD_DEPLOY · U65)

**Date:** 2026-07-28  
**work_item_id:** QA-OPS-REMOVE-NIPIO-01  
**from_role:** qa  
**to_role:** pm  
**ack_status:** PASS_TO_PM  
**Upstream:** D-OPS-REMOVE-NIPIO-01 · `docs/qa/evidence/d-ops-remove-nipio-01-20260728.md`  
**cấm respected:** no seed · no nginx reload · no Phase1/PROD claim

## Environment

| Item | Value |
|------|-------|
| DEV portal SoT | `http://14.225.217.232:8088` |
| Local portal | `http://127.0.0.1:5173` |
| HOLD_DEPLOY | yes (live VPS nginx not reloaded) |

## Exit criteria matrix

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | `rg -n "nip\.io\|14-225-217-232" apps scripts deploy` → zero | **PASS with residual** | Hyphen host `14-225-217-232`: **0** matches. `nip.io`: **1** match only — intentional reject guard in `scripts/tmp-p1-ex-qa-https-01-probe.mjs:10` (error string). `apps/` + `deploy/` + `*.env.example*`: **0**. |
| 2 | Probe default `PORTAL_DEV_URL=http://14.225.217.232:8088`; nip.io env → exit **2** | **PASS** | Literal default confirmed; `PORTAL_DEV_URL=http://ceo.14-225-217-232.nip.io:8088` → `FAIL … must not use nip.io` · **EXIT=2** |
| 3 | Smoke DEV `:8088` or local `:5173` — no nip.io in runtime defaults | **PASS** | DEV `/` **200**, `/command-center` **200**, login **201** + token; local `:5173` **200**, body has no `nip.io` |
| 4 | This evidence path | **PASS** | this file |
| 5 | ack | **PASS_TO_PM** | below |

## Grep detail (QA independent)

```text
rg -n "14-225-217-232" apps scripts deploy
# → no matches (exit 1)

rg -n "nip\.io" apps scripts deploy
# → scripts/tmp-p1-ex-qa-https-01-probe.mjs:10  (reject console.error only)

rg -n "nip\.io|14-225-217-232" apps deploy
# → no matches

rg -n "nip\.io|14-225-217-232" -g "*.env.example*" .
# → no matches
```

**Note vs DevOps claim:** upstream said `GREP_ZERO_PASS`; QA found **1** intentional `nip.io` string in the probe reject path. Not a runtime/config hostname. Optional cleanup: reword error to “forbidden temporary DNS” if PM wants literal rg-zero.

## Probe default + reject

| Check | Result |
|-------|--------|
| Source literal `\|\| 'http://14.225.217.232:8088'` | PASS |
| Unset env → default SoT IP `:8088` | PASS (when `PORTAL_DEV_URL` cleared) |
| `PORTAL_DEV_URL` containing `nip.io` | EXIT **2** PASS |

## Smoke (U65 · no seed)

| Check | Result |
|-------|--------|
| `GET http://14.225.217.232:8088/` | **200** (len 757) |
| `GET http://14.225.217.232:8088/command-center` | **200** |
| `POST …/api/xbos/auth/login` (`ceo@xe.vn`) | **201** + access token |
| `GET http://127.0.0.1:5173/` | **200**; Content ≉ `nip.io` |

## Residual

| ID | Sev | Note |
|----|-----|------|
| R-OPS-NIPIO-GUARD-01 | P3 | Probe reject message still contains literal `nip.io` (defense string). Optional D-OPS reword for rg-literal-zero. |
| R-OPS-NIPIO-VPS-LIVE | Info | HOLD_DEPLOY — live VPS nginx may still serve old DNS cert/vhost until future reload (out of this wave). |

## Verdict

**PASS_TO_PM** — active source/config purge of nip.io / hyphen DNS accepted; probe SoT + reject + smoke PASS. Not Phase1/PROD.

## completion_report

- Closed: QA-OPS-REMOVE-NIPIO-01 retest of D-OPS-REMOVE-NIPIO-01 under U65 + HOLD_DEPLOY.
- Residual: R-OPS-NIPIO-GUARD-01 P3 (optional); live nginx Info under HOLD_DEPLOY.

## next_owner

pm (optional: qc spot-check if needed; or devops optional reword)

## next_dispatch_prompt

```text
work_item_id: QC-OPS-REMOVE-NIPIO-01 (optional) OR close wave on bus
role: qc | pm
entry: docs/qa/evidence/qa-ops-remove-nipio-01-20260728.md PASS_TO_PM; U65; HOLD_DEPLOY
exit: confirm apps+deploy+.env.example zero nip.io; probe default :8088 + exit 2 on nip.io env; residual R-OPS-NIPIO-GUARD-01 P3 optional only
cấm: seed; nginx reload; Phase1/PROD claim
```
