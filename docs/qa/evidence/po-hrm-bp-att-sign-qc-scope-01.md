# Evidence — PO-HRM-BP-ATT-SIGN-QC-SCOPE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QC-SCOPE-01` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | L3 gate — **API scope_parity / TR-CM-16 only** (UC-BP-ATT-11 sign sheet) |
| **entry** | QA [`po-hrm-bp-att-sign-qa-01.md`](po-hrm-bp-att-sign-qa-01.md) **PASS_WITH_OBS** · BE [`po-hrm-bp-att-sign-be-01.md`](po-hrm-bp-att-sign-be-01.md) **READY_FOR_QA** |
| **spec_ref** | FR-UC-BP-ATT-11 · TechSpec §6.4 · TR-CM-16 · F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02 · ADR-HRM-RBAC-SCOPE-LADDER |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **scope_stamp** | `traceability.scope_parity_ack` **authorized true** (API L1 only) |

---

## Forbidden claims (QC hard lock)

| Claim | Status |
|-------|--------|
| **product GO** / product UAT DONE / Phase 1 DONE | **NOT claimed** |
| **Attendance CLOSED** | **NOT claimed** (`Attendance CLOSED: false`) |
| **UF-HRM-ATT-SIGN PASS** / AC-ATT-SIGN-UF-01..07 🟢 | **NOT claimed** |
| **J-HRM-06c L2.5 PASS** | **NOT claimed** |
| **AC-ATT-SIGN-04 Manifest browser PASS** | **NOT claimed** / **NO-GO** until UF browser |
| **remaster DONE** / remaster_program_done | **NOT claimed** (`false`) |
| **QC GO** (full product / module) | **NOT claimed** — this seat is **GWC scope_parity only** |

---

## 1. Executive verdict

**GO WITH CONDITIONS** — bounded to **API list↔get-by-id / signatures / sign scope parity** (TR-CM-16 · SP-ATT-SIGN-01..04).

| Layer | QA | QC stamp |
|-------|-----|----------|
| L0 stack | PASS (`qc:dev-stack` + `qc:fe-be-health`) | **ACCEPT** (supporting) |
| L1 SP-ATT-SIGN-01..04 | PASS — jest 5/5 exit 0 | **ACCEPT → GWC basis** |
| L2 / L2.5 UF · J-HRM-06c | BLOCKED (U65 · 0 `submitted` · FE panel unwired) | **CONDITION** — not demote API GWC; **not** UF PASS |
| AC-ATT-SIGN-04 browser | not promoted | **NO-GO product** until FE + U65 chain |

**Không** nâng GWC này thành product GO / Attendance CLOSED / remaster DONE.

---

## 2. Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-hrm-bp-att-sign-be-01.md` | READY_FOR_QA · shared `assertAttendanceSheetHeaderInScope` · SP-ATT-SIGN + controller PASS | **ACCEPT** (BE delivery) |
| `po-hrm-bp-att-sign-qa-01.md` | **PASS_WITH_OBS** · L1 PASS · UF BLOCKED · honesty flags | **ACCEPT** |
| U65 probe (QA §4) | 2 sheets `draft`/`draft` · `submitted`=0 · read-only GET | **ACCEPT** — prerequisite only; **≠** UF 🟢 |
| FE static (QA §5) | Panel Ký chốt / signatures wire **absent** | **ACCEPT** residual → FE wave |

Honesty flags on QA evidence (`Attendance CLOSED` / `product_go` / `remaster_program_done` = false; QC stamp not invented by QA) — **PASS** process.

---

## 3. Independent audit — L1 scope_parity (in-scope)

**Source of truth (runtime):** QA re-run

```bash
cd apps/api/hrm-api
pnpm exec jest src/attendance/attendance-sheet-scope-parity.spec.ts --no-cache
```

| Test ID | QA | QC |
|---------|-----|-----|
| **SP-ATT-SIGN-01** | PASS — list-scope id → GET sheet + GET signatures 200 | **ACCEPT** |
| **SP-ATT-SIGN-02** | PASS — out-of-scope → HRM-AS-409 (no 200 leak) | **ACCEPT** |
| **SP-ATT-SIGN-03** | PASS — member resolved scope sign 200; slug mismatch 409 | **ACCEPT** |
| **SP-ATT-SIGN-04** | PASS — `company_id=xevn` + JWT `main` → SCOPE_CONTEXT_MISMATCH; sign not called | **ACCEPT** |
| unit rollup | PASS — `assertAttendanceSheetHeaderInScope` holding + `main` | **ACCEPT** |

**TR-CM-16 runtime:** **PASS** — QC **stamps** `scope_parity_ack` for Manifest / Gold Plane D **API lane only**.

### Residual OBS (does not demote GWC API)

| Item | Class | Note |
|------|-------|------|
| `attendance.controller.spec.ts` sign routes | PROCESS P3 | QA did not re-run this seat (hook); BE claimed 22 passed — optional PM smoke; **not** blocker for scope_parity GWC |
| Prisma migration sign-step table | ENV / slice | Runtime DDL per BE — **BLOCKED-MIGRATION** residual; out of this stamp |
| Portal `:8088` unreachable | ENV | L0 used `:5173` — Dev8088 matrix retest when up; **not** API scope FAIL |

---

## 4. Conditions (must remain open)

| ID | Condition | Owner | Close when |
|----|-----------|-------|------------|
| **C-ATT-SIGN-UF** | UF-HRM-ATT-SIGN AC-ATT-SIGN-UF-01..07 browser BLOCKED (U65: no `submitted` sheet; cấm seed) | PM → FE chain UF-HRM-16 / J-HRM-06b → QA retest | Browser evidence FE-only · FE sau 2xx + F5 |
| **C-ATT-SIGN-FE** | Panel **Ký chốt** / GET\|POST signatures / close **chưa wire** FE | `dev-fe` `PO-HRM-BP-ATT-SIGN-FE-01` | READY_FOR_QA + QA UF |
| **C-ATT-SIGN-06c** | J-HRM-06c L2.5 | QA after FE + submitted chain | Journey map ❌/🟡 until then |
| **C-ATT-SIGN-04-BR** | AC-ATT-SIGN-04 Manifest browser | QC product seat later | **NO-GO** until UF PASS |
| **C-ATT-SIGN-MIG** | Prisma migration unlock (OBS) | PM / devops when slice allows | Not required for this GWC |

---

## 5. Manifest stamp (QC authorization)

QC **authorizes** (API scope_parity only):

```json
"traceability": {
  "scope_parity_ack": true,
  "scope_parity_evidence": "docs/qa/evidence/po-hrm-bp-att-sign-qa-01.md · SP-ATT-SIGN-01..04 · QC: docs/qa/evidence/po-hrm-bp-att-sign-qc-scope-01.md"
},
"pipeline_stage": "ready_for_dev"
```

| Item | QC decision |
|------|-------------|
| `scope_parity_ack` | **true** — stamped this evidence |
| `scope_parity_evidence` | Prefer **QA** path (+ this QC path); sample currently cites BE-only — PM/SA may refresh cite without inventing product GO |
| `pipeline_stage: ready_for_dev` | **OK for BE/parity lane** — does **not** close UF product or Attendance |
| AC-ATT-SIGN-04 | Remains **open** (browser) — Manifest must **not** treat as closed |

Sample on disk (`docs/program/examples/change-manifest.sample.json`) already has `scope_parity_ack: true` — QC **confirms** runtime evidence supports ack; **does not** treat sample as product GO.

---

## 6. Matrix / journey (not promoted)

| Artifact | QC instruction |
|----------|----------------|
| `USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-ATT-SIGN | Keep **🟡/⬜** — browser BLOCKED |
| `PROGRAM_JOURNEY_MAP.md` J-HRM-06c | Keep **❌/🟡** |
| Attendance module CLOSED | **false** |

---

## 7. Classification

| Class | Items |
|-------|-------|
| **PRODUCT (in-scope this WI)** | API scope_parity TR-CM-16 · SP-ATT-SIGN-01..04 |
| **CONDITION / OPEN** | UF browser · FE wire · J-HRM-06c · AC-ATT-SIGN-04 browser |
| **PROCESS OBS** | Controller jest optional re-run; Manifest evidence path refresh |
| **ENV OBS** | `:8088` down; migration unlock |
| **FORBIDDEN** | product GO · Attendance CLOSED · UF PASS · remaster DONE |

---

## 8. completion_report

**Closed:** QC seat `PO-HRM-BP-ATT-SIGN-QC-SCOPE-01` — audited QA PASS_WITH_OBS; **GO WITH CONDITIONS** for **API scope_parity only**; `scope_parity_ack` authorized with evidence paths; forbidden claims locked.

**Open / CONDITIONS:** C-ATT-SIGN-UF · C-ATT-SIGN-FE · C-ATT-SIGN-06c · C-ATT-SIGN-04-BR · C-ATT-SIGN-MIG (OBS).

**not promoted:** product GO · Attendance CLOSED · UF-HRM-ATT-SIGN 🟢 · J-HRM-06c ✅ · remaster DONE · full QC GO.

---

## 9. next_owner / next_dispatch_prompt

| Field | Value |
|-------|--------|
| **next_owner** | **pm** |
| **pm_dispatch_hint** | (1) FE wire `PO-HRM-BP-ATT-SIGN-FE-01`; (2) sponsor/U65 chain UF-HRM-16 → `submitted` then QA UF retest; (3) optional Manifest evidence-path refresh; **không** stamp product GO |

### next_dispatch_prompt — pm (primary)

```text
work_item_id: PO-HRM-BP-ATT-SIGN-FE-01
role: dev-fe
read_first: docs/qa/evidence/po-hrm-bp-att-sign-qc-scope-01.md · po-hrm-bp-att-sign-qa-01.md · po-hrm-bp-att-sign-uf-ba-01.md
entry_criteria: QC GWC API scope_parity stamped; BE routes live; att-sheets-precision list exists
exit_criteria: Attendance detail — panel Ký chốt; GET/POST …/signatures + POST close wired; VI labels; post-mutation FE AC-ATT-SIGN-UF-01..05; data-testid for QA
forbidden: seed · claim Attendance CLOSED · claim product GO · remaster DONE
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-fe-01.md
```

### next_dispatch_prompt — qa (after FE + submitted chain)

```text
work_item_id: PO-HRM-BP-ATT-SIGN-QA-UF-01
role: qa
entry_criteria: FE READY_FOR_QA; U65 sheet status=submitted from FE UF-HRM-16 / J-HRM-06b (zero-seed)
exit_criteria: AC-ATT-SIGN-UF-01..07 + J-HRM-06c browser evidence; FE sau 2xx + F5; cấm invent PASS without submitted
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-qa-uf-01.md
```

---

## 10. Handoff contract

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QC-SCOPE-01` |
| **from_role** | qc |
| **to_role** | pm |
| **entry_criteria** | QA PASS_WITH_OBS · SP-ATT-SIGN jest PASS · UF BLOCKED documented |
| **exit_criteria** | GWC API scope_parity · scope_parity_ack stamped · forbidden claims locked · PASS_TO_PM |
| **evidence_path** | `docs/qa/evidence/po-hrm-bp-att-sign-qc-scope-01.md` |
| **needed_by** | same-session PM intake |
| **ack_status** | **PASS_TO_PM** |
| **residual_auto_fix** | true — FE + UF chain (not product GO) |

**Verdict:** **GO WITH CONDITIONS** (API `scope_parity` / TR-CM-16 only).

**PASS_TO_PM**

---

*End evidence PO-HRM-BP-ATT-SIGN-QC-SCOPE-01 · ack_status: **PASS_TO_PM***
