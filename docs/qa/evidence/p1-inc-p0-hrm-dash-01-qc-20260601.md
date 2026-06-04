# P1-INC-P0-HRM-DASH-01-QC-01 — HRM dashboard P0 incident gate (nip.io)

| Field | Value |
|-------|-------|
| **work_item_id** | P1-INC-P0-HRM-DASH-01-QC-01 |
| **parent** | P1-INC-P0-HRM-DASH-01 |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-06-01 |
| **environment** | `https://14-225-217-232.nip.io` (pilot HTTPS) |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **route** | `/command-center/hrm/dashboard` |
| **entry_qa** | `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-r3-20260601.md` (PASS_TO_PM GWC) |
| **entry_do** | `docs/ops/evidence/p1-inc-p0-hrm-dash-01-do-deploy-20260601.md` |
| **ack_status** | **PASS_TO_PM** |

## Gate decision

**GO WITH CONDITIONS** — **P0 incident slice CLOSED** on pilot for group CEO HRM dashboard embed.

**Not in scope for this gate:** Phase 1 Program sign-off, Production GO, full J-HRM 7/7 program sweep, unconditional UAT-READY for all personas.

---

## Evidence chain audited

| Artifact | Role | QC finding |
|----------|------|------------|
| `p1-inc-p0-hrm-dash-01-dev-20260601.md` | dev-fe | ReferenceError fix documented; vitest 116/116 |
| `p1-inc-p0-hrm-dash-01-qa-20260601.md` | qa R1 | P0 FE crash closed; workspace-meta epoch open |
| `p1-inc-p0-hrm-dash-01-be-meta-20260601.md` | dev-be | `resolveWorkspaceAsOf` + rollup; jest 10/10 |
| `p1-inc-p0-hrm-dash-01-qa-r2-20260601.md` | qa R2 | **FAIL** live epoch — deploy gap |
| `p1-inc-p0-hrm-dash-01-do-deploy-20260601.md` | devops | Hot-deploy + restart; API `asOf` 2026 |
| `p1-inc-p0-hrm-dash-01-qa-r3-20260601.md` | qa R3 | **PASS** P0 + GWC banner |

Handoff packet: **complete** (`work_item_id`, evidence paths, R2→R3 delta, residual owners).

---

## Instant-fail criteria (`business-flow-zero-defect-gate.mdc`)

| Criterion | QA R3 | QC adjudication |
|-----------|-------|-----------------|
| UI **01/01/1970** / epoch timestamp | **PASS** — «11:42 25/05/2026» | **CLOSED** |
| `workspace-meta` API epoch `asOf` | **PASS** — `2026-05-25T04:42:24.224Z` | **CLOSED** |
| Console Uncaught / ReferenceError | **PASS** — `qaErrors: []` | **CLOSED** (P0 FE crash) |
| HTTP **409** scope on load | **PASS** | **CLOSED** |
| `ERR_CONNECTION_REFUSED` **54321** | **PASS** | **CLOSED** |
| HRM embed white-screen crash | **PASS** — shell + menu | **CLOSED** |

---

## L0 / API (QC reproduced)

Command: `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-inc-p0-hrm-dash-01-qa-r2-probe.mjs`  
QC run: `2026-06-01T04:18:21.641Z` — exit **0**

```json
{
  "workspace_meta": {
    "status": 200,
    "asOf": "2026-05-25T04:42:24.224Z",
    "epoch_fail": false,
    "year": 2026,
    "pass": true
  },
  "verdict_api": true
}
```

Aligns with QA R3 (`04:15:25Z`) and DevOps deploy smoke (`04:14:15Z`).

---

## L2.5 / U19 journey audit

| Journey | Scope this gate | QA | QC |
|---------|-----------------|-----|-----|
| **J-HRM-DASH** (incident) | Load `/command-center/hrm/dashboard`; sidebar/menu; no 409/54321; in-session `workspace-meta` **200** | **PASS** | **CONCUR** — sufficient for **P0 incident closure** (not full CC↔HRM cross-nav program matrix) |
| J-HRM-01..07 (program 7/7) | Out of slice | n/a | **Not required** for this work_item |
| `PROGRAM_JOURNEY_MAP.md` row | J-HRM-DASH referenced in dev/qa; formal map row still **proposed** (QA R1) | — | **GWC** — PM dispatch **ba-process** + **qa** to add `P-CC-HRM-DASH-01` |

**U19:** QA did not claim program L2.5-only PASS; browser retest on exact route with CDP body scan + in-session fetch satisfies incident exit. **NO-GO** would apply only if epoch/1970/console P0 still failed — they do not.

---

## Conditions (mandatory carry)

| ID | Item | Owner | Priority | Blocks |
|----|------|-------|----------|--------|
| **C-DASHQC-01** | Stale blue «Không tải workspace-meta» while API returns **200** + valid `asOf` | **dev-fe** | P2 | Partner demo polish only — **not** P0 |
| **C-DASHQC-02** | BE-META on pilot via **VPS hot-patch**; `command-center.service.ts` **modified locally**, `origin/main` at `5106a0c` without merge | **dev-be** + **PM** | P1 governance | Next `git pull` / image rebuild **reverts** epoch fix without commit+push |
| **C-DASHQC-03** | Add `P-CC-HRM-DASH-01` to `PILOT_BUSINESS_FLOW_MATRIX.md` + journey map sync | **ba-process** + **qa** | P2 | Recurrence prevention |

---

## Closed vs open

| ID | Status |
|----|--------|
| P1-INC-P0-HRM-DASH-01 (ReferenceError / white screen) | **CLOSED** |
| P1-INC-P0-HRM-DASH-01-BE-META (live epoch) | **CLOSED** on nip.io |
| P1-INC-P0-HRM-DASH-01-DO-DEPLOY | **CLOSED** |
| P0 epoch / 1970 user-visible defect | **CLOSED** |
| C-DASHQC-01..03 | **OPEN** (GWC) |

---

## Sponsor-facing line (PM → user)

Pilot **`/command-center/hrm/dashboard`** for **`ceo@xe.vn`** no longer crashes, shows **no 01/01/1970**, and **`workspace-meta`** returns a **2026** freshness date. A **misleading blue workspace-meta banner** may still appear (cosmetic P2). **Commit BE-META to `main`** before the next full deploy.

---

## Handoff

- **completion_report:** QC **GO WITH CONDITIONS** for **P1-INC-P0-HRM-DASH-01** incident on nip.io. Audited Dev→QA R1→BE→QA R2 FAIL→DO deploy→QA R3 PASS. QC reproduced API probe exit **0** (`asOf` 2026-05-25). P0 instant-fail gates **closed**. **Residual:** P2 stale banner (dev-fe), **P1 git parity** (dev-be), matrix row (ba/qa).
- **next_owner:** `pm`
- **next_dispatch_prompt:** `work_item_id: P1-INC-P0-HRM-DASH-01-PM-CLOSE — QC GWC 2026-06-01: P0 HRM dashboard epoch/ReferenceError CLOSED on nip.io (evidence docs/qa/evidence/p1-inc-p0-hrm-dash-01-qc-20260601.md). Dispatch dev-be P1: commit+push BE-META (command-center.service.ts) to main before next VPS image deploy. Optional dev-fe P2: clear stale workspace-meta blue banner after API 200. Optional ba-process: add P-CC-HRM-DASH-01 to PILOT_BUSINESS_FLOW_MATRIX.md. Update TEAM_WORKING_NOW / USER_SERVICE_STATUS for dashboard slice. Do NOT claim Program DONE or PROD.`
- **evidence_path:** `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qc-20260601.md`
- **ack_status:** **PASS_TO_PM**
