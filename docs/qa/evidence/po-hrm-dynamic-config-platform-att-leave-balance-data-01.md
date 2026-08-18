# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01` |
| **from_role** | `ba-data` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **physical ADD** Nest `att_leave_accrual_policy` · **not** leave-type L1 reopen · **not** migrate/apps · **not** module ATT UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01` **CONFIRMED Option B** · ba-data **UNLOCK** |
| **Verdict** | **CONFIRMED** — physical ADD `public.att_leave_accrual_policy` (versioned / effective-dated rule SoT · soft FK `leave_type_key` → sealed `att_leave_type` · soft-retire · UQ/IX resolve · DTO stubs F-ATT-LVRULE-*) |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01.md) |
| **peer_cite** | ATT-DATA-01 `att_leave_type` **SEAL RETAIN** · SA Option B · peer Nest-absent DEFINE (EMP-STATUS/SI) **cite ≠ copy** · PAY engine HOLD **cite** |
| **U65** | zero-seed · docs-only · **no** `apps/**` · **no** migrate execute · **no** `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — rule schema physical ≠ attendance module UAT / Phase1 / flip ready / engine LIVE |

### Honesty locks (mandatory)

| Flag | Value | DATA note |
|------|-------|-----------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| ATT leave-type L1 | **SEAL RETAIN** | **cấm** ALTER invent / second leave-type table |
| ATT-CODE / WS / SHIFT L1 | **SEAL RETAIN** | **cấm** fold policy into day-code / worksite / shift |
| Ledger `employee_leave_balances` | **RETAIN** | alias map · optional EXPAND only |
| Accrue engine LIVE (F-ATT-LEAVE-04) | **HOLD / OUT** | schema ≠ engine GO |
| Module ATT UAT / Phase 1 DONE | **DENIED** | Slice ≠ module seal |
| Seed | **DENIED** (U65) | empty resolve OK |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | rule physical ≠ module ATT UAT |

---

## Verdict summary

**CONFIRMED physical** — Nest **`public.att_leave_accrual_policy`** ADD-plan locked for BE ensureSchema (docs only this seat):

| Physical deliverable | Stamp |
|----------------------|--------|
| Columns | `id`, `company_id`, `leave_type_key`, `version`, `effective_from`/`effective_to`, accrual fields (`accrual_mode`, `annual_days`, `unit`, `allow_negative`, `carry_over_expire_rule`, `carry_cap_days`, `max_balance_days`), optional `metadata_json`, `status`, `archived_at`, timestamps |
| Soft FK | TEXT `leave_type_key` → sealed EFF `att_leave_type` — **no** hard CASCADE |
| UQ / IX | UQ `(company_id, lower(leave_type_key), version)` partial · IX list · IX resolve effective for F-ATT-LVRULE-04 |
| Soft-retire | `status=retired` + `archived_at` — **FORBIDDEN** hard-delete product path |
| Ledger | EXPAND alias Nest `employee_leave_balances` ↔ logical `att_leave_balance`; optional ADD `carried_in`/`advanced`/`adjusted`/`policy_id` — **no** second ledger |
| DTO stubs | F-ATT-LVRULE-01..04 + CNS-01 map |
| FORBIDDEN | second leave-type · ATT-CODE fold · Settings dual-write SoT · mega-EAV · engine LIVE · seed · flip ready · reopen L1 |

**BE HOLD** until parallel **BA-01** also **CONFIRMED**.

Docs-only — **no** `apps/**` · **no** migration execute.

| Gate item | Evidence | DATA |
|-----------|----------|------|
| SA Option B UNLOCK ba-data | SA-01 §4.1 / §9 | 🟢 |
| Nest policy ABSENT | SA AS-IS · DB §4.4b name | 🟢 DEFINE |
| Leave-type L1 RETAIN | ATT-DATA-01 sealed | 🟢 no ALTER invent |
| Soft FK + version/effective | Spec §2.1–2.2 | 🟢 |
| Soft-retire no hard-delete | Spec §2.4 | 🟢 |
| Ledger alias + optional EXPAND | Spec §3 · Nest AS-IS entitled/used/pending | 🟢 |
| DTO↔column F-ATT-LVRULE-* | Spec §4 | 🟢 stubs |
| VAL matrix + scope_parity | Spec §5 | 🟢 |
| EXPAND note: no second type · no CODE fold · no Settings dual-write | Spec §1 / §8 | 🟢 |
| Honesty / C-SLICE | false · RETAIN | 🟢 |
| Spec + evidence non-empty | both files | 🟢 |
| No apps/** / no migrate / no seed | this seat | 🟢 |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · claim module ATT UAT / Phase1 · reopen ATT-LEAVE/CODE/WS/SHIFT L1 · fold into day-code · Settings sole rule SoT · mega-EAV · second leave-type · claim accrue engine LIVE · seed · execute migration.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM unlock BE F-ATT-LVRULE-* now? | **HOLD** until **BA-01** also **CONFIRMED** (gate BA+DATA) |
| May PM seal DATA physical Option B? | **YES** — this seat CONFIRMED |
| May PM reopen leave-type L1 / invent FE HOLDs? | **NO** |
| May PM claim accrue engine LIVE? | **NO** |
| Why | Nest-absent rule schema physicalized · type L1 retain · admin≠consumer KEY · engine HOLD · `C-SLICE-≠-MODULE` |
| Recommended flag state | keep **`attendance_uat_ready=false`** · **`payroll_e2e_ready=false`** |
| Forced residual dispatch | Await / intake **BA-01** → then **dev-be** ATT-LEAVE-BALANCE-BE-01 |

---

## Physical matrix (closed this seat)

| Artifact | Action | Detail |
|----------|--------|--------|
| `public.att_leave_accrual_policy` | **ADD** | Versioned rule SoT · soft FK type key |
| `employee_leave_balances` | **EXPAND note** | Alias map · optional carried_in/advanced |
| `att_leave_type` | **RETAIN** | No ALTER invent path |
| `att_attendance_code` / WS / SHIFT | **RETAIN** | No fold |
| Settings / `attendance_rules` | **REF/OUT** | Not rule SoT · no dual-write |
| `att_leave_hold` dedicated | **OUT/HOLD** | pending_days AS-IS sufficient GĐ1 |
| F-ATT-LEAVE-04 engine | **HOLD** | Not physicalized as LIVE |

### Invent KEY stamps (wire)

| Stamp | Use |
|-------|-----|
| **`HRM-ATT-LVRULE-KEY`** | Consumer invent policy_id / ad-hoc accrual params when active policy >0 |
| **`HRM-LEAVE-TYPE-UNKNOWN`** | Type invent — **RETAIN** (≠ this pack reopen) |

### Align FK (parallel ba-process)

- Policy rows bind **`leave_type_key`** ∈ sealed EFF `att_leave_type` — ba-process AC must cite same soft FK; **do not block** BA-01 on this DATA seat.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: docs-only CONFIRMED physical ADD `att_leave_accrual_policy` (columns version/effective/accrual/caps/status/soft-delete; UQ+IX resolve; soft FK to sealed leave type; ledger alias EXPAND; DTO stubs F-ATT-LVRULE-*; VAL-ATT-LVRULE-*; FORBIDDEN second type/CODE fold/Settings dual-write/engine LIVE/seed/flip). Residual: BA-01 CONFIRMED gate → BE ensureSchema; optional ledger EXPAND cols; engine LIVE OUT. Honesty false. No apps/**. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-data-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: ATT-LEAVE-BALANCE-SA-01 Option B · DATA-01 CONFIRMED physical (parallel — do not block)
change_mode: ADD
no_code: true

## entry_criteria
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01.md (physical CONFIRMED · soft FK leave_type_key · VAL-ATT-LVRULE-* · DTO stubs)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-data-01.md
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE · U65
- RETAIN: att_leave_type L1 · ATT-CODE/WS/SHIFT · FE HOLDs — cấm reopen L1

## task
Confirm AC pack AC-PLT-ATT-LEAVE-BAL-01/01b/01c/01d/01e/01f/01g/01H + VAL-ATT-LVRULE-CNS-* aligned to DATA soft FK + UQ/IX:
- Nest att_leave_accrual_policy = rule SoT
- Admin N+1 ≠ consumer invent HRM-ATT-LVRULE-KEY
- Type invent HRM-LEAVE-TYPE-UNKNOWN RETAIN
- Empty CTA no seed; soft-retire; engine LIVE HOLD
- Enumerate UF/J-*; align FK to att_leave_type (cite DATA §2)

## FORBIDDEN
apps/** · seed · flip ready · reopen L1 · invent FE HOLDs · Face · aggregate · mega-EAV · claim engine LIVE

## exit
CONFIRMED AC pack
spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-ba-01.md
ack_status PASS_TO_PM · next_owner pm → unlock BE after BA+DATA both CONFIRMED
```

**After BA-01 CONFIRMED (gate clear) — BE unlock copy-ready:**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: ATT-LEAVE-BALANCE-SA-01 Option B · BA-01 CONFIRMED · DATA-01 CONFIRMED
change_mode: ADD

## entry_criteria
- Read DATA-01 physical §2–§5 + SA F-ATT-LVRULE-* + BA AC pack
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · U65 · C-SLICE
- RETAIN: att_leave_type L1 · ledger employee_leave_balances · CODE/WS/SHIFT seals · FE HOLDs
- solid_convention_ack: display-ready list · scope_parity list↔get↔resolve

## task
ensureSchema public.att_leave_accrual_policy per DATA-01; implement F-ATT-LVRULE-01..04 + CNS-01 HRM-ATT-LVRULE-KEY; soft FK leave_type_key ∈ EFF; soft-retire; empty 200; FORBIDDEN hard-delete · Settings dual-write · reopen leave-type L1 · engine LIVE GO · seed · flip ready · aggregate rewrite.

## exit
READY_FOR_QA · evidence path · jest scope_parity + invent KEY · completion_report · next_dispatch_prompt qa
```
