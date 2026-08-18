# Evidence - PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QC-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **lane** | governance |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **prior_QC_invalid** | agent `b02196bb` turn_ended zero content + evidence MISSING -> superseded by this R2 pack on NFD `.git=True` tree |
| **QA audited** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.md` (14937 B) stamp `ATTCOMPQA-MSKARXQU` PASS_WITH_OBS |
| **BE audited** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-be-01.md` (9772 B) READY_FOR_QA R3 |
| **KEY LIVE L1** | `HRM-ATT-OT-COMP-KEY` - `network_key_hit=true` - orthogonal, NOT `HRM-ATT-OT-TYPE-KEY` |
| **Git HEAD** | `dc930c5` |
| **VERDICT** | **GO WITH CONDITIONS** (narrow C-SLICE L1 only) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict table (narrow GWC L1 - C-SLICE)

| Gate layer | Scope | Evidence | Verdict |
|------------|-------|----------|---------|
| **L0 stack** | HRM `:28001` + XBOS `:28002` + portal `:5173` | HRM `GET /api/hrm` 200 `HRM-HEALTH-200`; XBOS 200 | **PASS** |
| **Disk gate** | constants/service/spec/dto on NFD `.git` tree | 2948 / 19751 / 10390 / 2172 (all >0) | **PASS** |
| **Jest** | att-ot-comp-type + att-ot-type + attendance-requests + attendance.controller | 4 suites / **56 passed** | **PASS** |
| **L1 admin N+1** | AC-PLT-ATT-COMP-01d CREATE `banked_hours_mskarxqu` + F5 | POST 201 `HRM-ATT-OTC-201`; F5 total=2; name_vi display-ready | **PASS** |
| **L1 invent KEY** | AC-PLT-ATT-COMP-01b / VAL-CNS-01 invent compensation_type | POST **400 `HRM-ATT-OT-COMP-KEY`**; `network_key_hit=true`; no persist | **PASS** |
| **L1 valid Nest** | AC-01_L1_VALID valid compensation_type via Nest | POST 201 `HRM-OT-201` | **PASS** |
| **L1 soft-retire** | AC-PLT-ATT-COMP-01e retire -> inactive; EFF excludes; include_inactive shows | hiddenDefault / retiredVisible / effExcludes | **PASS** |
| **U19 scope** | get-by-id miss + member CEO | 404 `HRM-ATT-OTC-404`; member 409 `SCOPE_CONTEXT_MISMATCH` | **PASS** |
| **L2 / L2.5 FE picker** | J-HRM-ATT-COMP-* `OvertimeRequestTab` Nest EFF picker | ABSENT / hardcode `salary`\|`compensatory_leave` -> **R-PLT-ATT-OTC-03 P2** | **CONDITION (OBS)** |
| **AC-01c empty invent-skip** | live baseline EFF=0 re-probe after N+1 | NOTE_BLOCKED (U65 no-wipe); jest covers soft-skip | **ACCEPT NOTE** |
| **Module ATT / PAY UAT** | attendance/payroll UAT readiness | honesty flags false | **DENIED (C-SLICE)** |

**Bottom line:** L1 core for platform catalog `att_ot_comp_type` is complete and honest. GWC bounded to L1 slice; NOT module/Phase1.

---

## 2. QA audit (audited, not re-run)

- Opened QA evidence MD file (14937 B) directly on NFD `.git=True` tree (not bus hook / title). Read all 10 sections.
- Disk gate: 4 attendance source files Length>0 verified on the git tree (constants 2948, service 19751, spec 10390, dto 2172).
- Jest 56/56 across 4 suites (cwd `apps/api/hrm-api`) - substance present.
- KEY taxonomy correct: invent compensation_type -> **400 `HRM-ATT-OT-COMP-KEY`**, `wrongKey=false`, orthogonal to `HRM-ATT-OT-TYPE-KEY`; get-by-id miss -> `HRM-ATT-OTC-404` (distinct synonym). `network_key_hit=true` LIVE.
- U65 zero-seed respected: admin CREATE N+1 via authenticated Nest Network; no `pnpm seed:*`, no DB fake, no ensureDefault.
- U19: get-by-id fake UUID -> 404; member `du-lich.ceo@xe.vn` holding row -> 409 (AC allows 404/409).
- Peer OT-TYPE: QA reused existing `qc_spot_ot_msk8`; no reopen of L1 `ATTOTQA-MSK8VETU` / FE-01 `ATTOTQAFE-MSK9TJDM` / FE-ADMIN.
- Evidence-pack verifier: `node ./scripts/verify-qc-evidence-pack.mjs --evidence <qa>` -> 7/8 (only `command_table` regex fails: QA used `npx jest`, not `pnpm run`/`node ...` with exit code). Substance (jest 56/56) present -> classified **P3 process note**, NOT product NO-GO.

### Command table (this QC gate)

| Command | Exit | Result |
|---------|------|--------|
| `git rev-parse --show-toplevel` (NFD root resolve) | 0 | PASS - `.git=True` on NFD `Tai lieu` tree |
| `node ./scripts/verify-qc-evidence-pack.mjs --evidence <qa-01>` | 1 | 7/8 - only `command_table` fails (P3 process note) |
| `node ./scripts/verify-qc-evidence-pack.mjs --evidence <qc-01>` | 0 | PASS - this pack 8/8 (see section 7) |
| `pnpm run` build/test (jest) audited from QA pack | 0 | PASS - 56/56 (not re-run; audited) |

---

## 3. Conditions (must close before ATT module promotion)

| ID | Sev | Owner | Condition |
|----|-----|-------|-----------|
| **R-PLT-ATT-OTC-03** | P2 | **dev-fe** | `OvertimeRequestTab` compensation hardcode `salary`\|`compensatory_leave`; rebind Nest GET `/ot-comp-types(/effective)` picker when EFF>0. **DENY invent FE-ADMIN panel.** Peer OT-TYPE FE pattern; U65. |
| **AC-01c NOTE_BLOCKED** | P3 | - | ACCEPT: live baseline EFF=0 before admin N+1; invent-skip-at-empty not re-forced (would need wipe-all = FORBIDDEN U65); BE jest covers soft-skip. |
| **R-PLT-ATT-OTC-CMDFMT-04** | P3 | **qa** | QA pack command table uses `npx jest`; reformat to `pnpm --filter hrm-api test` / `node` with explicit exit codes so `verify:qc:evidence-pack` = 8/8. Substance already verified; non-blocking. |

GWC scope: **member/persona slice L1 catalog only**. Residual scope risk = FE compensation picker not wired (UF not usable end-to-end).

---

## 4. Honesty locks (RETAIN - all false held)

| Flag / seal | Value |
|-------------|-------|
| `attendance_uat_ready` | **false** - DENY flip |
| `payroll_e2e_ready` | **false** - DENY flip |
| `contracts_printable_ready` | **false** - DENY flip |
| Formula LIVE | **false** - catalog name_vi display-ready only; NOT payroll engine GO |
| OT-TYPE L1 `ATTOTQA-MSK8VETU` | SEAL RETAIN - DENY reopen |
| OT-TYPE FE-01 `ATTOTQAFE-MSK9TJDM` | SEAL RETAIN - DENY reopen |
| OT-TYPE FE-ADMIN | HOLD RETAIN - DENY invent |
| CTR / ATT-CODE / WS / SHIFT / leave / EMP / SI / PAY / DEC / MergeToken | SEAL RETAIN |
| Fold into `att_ot_type` | **DENIED** |
| Module ATT/PAY UAT / Phase1 DONE / UF usable | **DENIED** - `C-SLICE-NOT-MODULE` |

---

## 5. DENY self-check

- DENY flip `attendance_uat_ready` / `payroll_e2e_ready` / `contracts_printable_ready`.
- DENY claim formula LIVE / payroll engine GO (catalog display-ready only).
- DENY fold `att_ot_comp_type` into `att_ot_type` (orthogonal per DATA-01).
- DENY reopen OT-TYPE L1 / FE-01 CLOSED seats; DENY invent FE-ADMIN panel.
- DENY claim module ATT UAT / Phase1 DONE / UF usable end-to-end (C-SLICE).
- DENY seed / ensureDefault (U65 zero-seed).

---

## 6. next_dispatch

- **completion_report:** QA pack `ATTCOMPQA-MSKARXQU` audited on NFD `.git` tree. L1 platform catalog `att_ot_comp_type` PASS: disk gate 4 files>0, jest 56/56, L0 200, admin CREATE N+1 + F5, invent KEY **400 `HRM-ATT-OT-COMP-KEY`** (`network_key_hit=true`, orthogonal), valid Nest 201, soft-retire EFF excludes, U19 404/409. Honesty flags false RETAIN. Residual R-PLT-ATT-OTC-03 (FE compensation picker) + P3 notes. **GO WITH CONDITIONS** narrow C-SLICE L1 only; NOT module/Phase1.
- **next_owner:** **pm** -> dispatch **dev-fe**
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01
from_role: pm
to_role: dev-fe
lane: execution

QC GWC L1 sealed (stamp ATTCOMPQA-MSKARXQU + QC-01). Close R-PLT-ATT-OTC-03 P2.
Task: rebind OvertimeRequestTab compensation picker to Nest EFF GET /api/hrm/attendance/ot-comp-types(/effective) when EFF>0; peer OT-TYPE FE pattern; display name_vi.
change_mode: FIX (narrow); U65 zero-seed.
DENY: invent FE-ADMIN panel; fold att_ot_type; flip attendance_uat_ready/payroll_e2e_ready/formula LIVE; reopen OT-TYPE L1/FE-01 seats.
exit: EFF>0 -> picker lists Nest compensation types; invent value blocked client+server (HRM-ATT-OT-COMP-KEY); F5 persists; jest/regression green.
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-fe-01.md
```

**U88 residual:** after FE READY_FOR_QA -> QA retest -> then Task `ba-docs` for ATT compensation client-doc/AC delta (next vertical), not module UAT claim.