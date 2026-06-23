# QA evidence — P1-PHASE1-QA-STACK-L0-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-STACK-L0-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-04 |
| **entry_evidence** | `docs/ops/evidence/p1-phase1-do-stack-stability-20260604.md` |
| **L0 doc** | `docs/ops/LOCAL_DEV_STACK_L0.md` |
| **account (nip.io probe)** | `ceo@xe.vn` / `Xevn@2026` (matrix standard; no secrets in logs) |

---

## Executive verdict

| Layer | Requirement | Verdict |
|-------|-------------|---------|
| **L0 local** | `dev:hrm-api` + `dev:xbos-api` up → `pnpm run qc:dev-stack` exit **0** | **PASS** |
| **L1** | `pnpm run test:system:uat` exit **0** | **PASS** (37/37, verdict PASS) |
| **L0 pilot stability** | `pnpm run probe:stack-stability` — zero **502** on nip.io login | **PASS** (20/20 × **201**, f502=0) |

**Overall:** **PASS_TO_PM** — stack stability handoff from DevOps verified on QA workstation (local L0+L1) and pilot login path.

---

## Local API startup (L0 doc)

| Service | Command used | Health URL | Result |
|---------|--------------|------------|--------|
| xbos-api | `pnpm run dev:xbos-api` (repo root) | `http://127.0.0.1:28002/api/xbos` | **200** |
| hrm-api | `pnpm run start:dev` in `apps/api/hrm-api` | `http://127.0.0.1:28001/api/hrm` | **200** |

**Note:** `pnpm run dev:hrm-api` (`turbo run dev --filter=hrm-api`) exited with *"No tasks were executed"* — `hrm-api/package.json` has `start:dev` but no `dev` script. QA used `start:dev` per L0 intent. **Residual → devops:** align `dev:hrm-api` with xbos (add `dev` script or fix turbo pipeline).

web-portal optional check on `:5173` failed (not started) — **does not block** L0 per `qc-dev-stack.mjs` (hrm + xbos required only).

---

## Commands executed

| # | Command | Exit | Verdict |
|---|---------|------|---------|
| 1 | `pnpm run qc:dev-stack` (local defaults `127.0.0.1:28001/28002`) | **0** | **PASS** — hrm-api + xbos-api **200** |
| 2 | `pnpm run test:system:uat` | **0** | **PASS** — 37 PASS, 0 FAIL |
| 3 | `pnpm run probe:stack-stability` | **0** | **PASS** — `https://14-225-217-232.nip.io`, 20/20 login **201**, f502=0 |

### L1 report artifact

`docs/qa/evidence/system-integration-uat-report.json` — `verdict: PASS`, generated same run as command #2.

### Stack stability probe output (excerpt)

```json
{
  "portal": "https://14-225-217-232.nip.io",
  "samples": 20,
  "ok": 20,
  "f502": 0,
  "counts": { "201": 20 }
}
```

---

## Cross-reference to DevOps entry

| DevOps claim | QA independent result |
|--------------|----------------------|
| Post-deploy probe 30/30 login **201** | **PASS** at 20 samples (script default); zero **502** |
| Pilot `qc:dev-stack` with nip.io env override | Not re-run this wave — local L0 is authoritative for workstation L1 |
| nginx warmup + healthchecks | Informational — login stability **PASS** at retest time |

---

## Residual / not promoted

| ID | Item | Owner | Notes |
|----|------|-------|-------|
| R1 | `dev:hrm-api` turbo no-op | devops | Use `start:dev` or add `dev` script — doc says `dev:hrm-api` |
| R2 | web-portal `:5173` off | QA optional | L2/L2.5 not in scope for this work_item |
| R3 | Historical VPS 502 count | informational | DevOps R2 — new deploys rely on warmup + probe |

**L2 / L2.5 / QC:** Out of scope for `P1-PHASE1-QA-STACK-L0-01` — PM may dispatch matrix/J-* waves separately.

---

## completion_report

Closed: (1) local HRM+XBOS healthy per `LOCAL_DEV_STACK_L0.md`, `qc:dev-stack` exit **0**; (2) `test:system:uat` exit **0**, 37/37 PASS; (3) nip.io `probe:stack-stability` exit **0**, zero **502**. Open: `dev:hrm-api` script/turbo gap; portal optional down.

## next_owner

**pm**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QC-STACK-L0-01
from_role: pm
to_role: qc
entry_criteria: QA PASS_TO_PM docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md — local qc:dev-stack exit 0, test:system:uat 37/37 PASS, probe:stack-stability 20/20 zero 502 on nip.io.
exit_criteria: Audit L0/L1 evidence paths and exit codes; confirm no open P0 on stack flap (502); record GO or GO WITH CONDITIONS for stack-stability slice in docs/qa/evidence/p1-phase1-qc-stack-l0-20260604.md (or append to PHASE1_GATE_REPORT.md). Flag R1 dev:hrm-api turbo gap to devops if not waived.
ack_status: PASS_TO_PM or NO-GO
evidence_path: docs/qa/evidence/p1-phase1-qc-stack-l0-20260604.md
```

## evidence_path

`docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md`

## ack_status

**PASS_TO_PM**

---

## R1 retest — P1-PHASE1-QA-STACK-R1-VERIFY-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-STACK-R1-VERIFY-01` |
| **entry_evidence** | `docs/ops/evidence/p1-phase1-do-stack-r1-dev-hrm-api-20260604.md` (DevOps **READY_FOR_QA**) |
| **ack_status** | **PASS_TO_PM** |

### Verdict

| Check | Result |
|-------|--------|
| `pnpm exec turbo run dev --filter=hrm-api --dry-run` | **PASS** — `hrm-api#dev` → `nest start --watch` (not empty scope) |
| `pnpm run dev:hrm-api` live | **PASS** — turbo *Running dev in 1 packages*; `hrm-api:dev` → `nest start --watch`; compile **0 errors**; Nest reached `listen` (EADDRINUSE **:28001** only because prior `start:dev` instance already healthy) |
| `pnpm run qc:dev-stack` | **PASS** — exit **0**; hrm **200**, xbos **200**; portal **5173** optional fail (non-blocking) |

### Condition closure

| ID | Status | Note |
|----|--------|------|
| **C-STACKQC-01** | **CLOSED** | `apps/api/hrm-api/package.json` `"dev": "nest start --watch"` — `dev:hrm-api` no longer turbo no-op |
| R1 (prior residual) | **CLOSED** | Same as **C-STACKQC-01** |

### Commands (this wave)

| # | Command | Exit |
|---|---------|------|
| 1 | `pnpm exec turbo run dev --filter=hrm-api --dry-run` | **0** |
| 2 | `pnpm run dev:hrm-api` (boot capture; port occupied) | turbo+Nest **executed** |
| 3 | `pnpm run qc:dev-stack` | **0** |

### completion_report (R1)

Closed: **C-STACKQC-01** / R1 — `dev:hrm-api` runs Nest via turbo; L0 `qc:dev-stack` exit **0** on QA workstation. Open: none for stack R1 slice.

### next_owner

**pm**

### next_dispatch_prompt (R1)

```
work_item_id: P1-PHASE1-QC-STACK-R1-VERIFY-01
from_role: pm
to_role: qc
entry_criteria: QA PASS_TO_PM — docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md § R1 retest; C-STACKQC-01 CLOSED; qc:dev-stack exit 0.
exit_criteria: QC concurs C-STACKQC-01 closed in docs/qa/evidence/p1-phase1-qc-stack-l0-20260604.md; no reopen R1 unless dev:hrm-api regresses to turbo no-op.
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-phase1-qc-stack-l0-20260604.md
```

### evidence_path (R1)

`docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md` (this section)

### ack_status (R1)

**PASS_TO_PM**
