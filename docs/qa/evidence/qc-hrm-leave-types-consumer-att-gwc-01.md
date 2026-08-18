# Evidence — QC-HRM-LEAVE-TYPES-CONSUMER-ATT-GWC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-LEAVE-TYPES-CONSUMER-ATT-GWC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **narrow C-SLICE** · **AC-SET-CONSUMER-LV-ATT-01** (`leave_types` TXN consumer → F-ATT-CAT-EFF-01) |
| **qa_ref** | [`qa-hrm-leave-types-consumer-att-01.md`](qa-hrm-leave-types-consumer-att-01.md) · stamp **`ATTLVTCON1-MSNO8B9F`** |
| **dev_ref** | [`po-hrm-leave-types-consumer-att-fe-01.md`](po-hrm-leave-types-consumer-att-fe-01.md) |
| **ba_ref** | [`docs/program/specs/BA-HRM-LEAVE-TYPES-CONSUMER-ATT-01.md`](../program/specs/BA-HRM-LEAVE-TYPES-CONSUMER-ATT-01.md) |
| **att_lvt_parent** | [`qc-hrm-settings-att-lvt-sot-gwc-01.md`](qc-hrm-settings-att-lvt-sot-gwc-01.md) · **`ATTLVTSOTQC1-MSNGQC01`** — **RETAIN · not reopened** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`ATTLVTCONQC1-MSNO8BQC1`** · annotates **`ATTLVTCON1-MSNO8B9F`** |
| **portal_url** | `http://127.0.0.1:5173` · attendance `hr/attendance?portal=1&companyId=main` · hrm-api `:28001` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed · browser narrow · no `pnpm seed:*` |
| **OS honesty** | `settings_catalog_e2e_ready=false` · **DENY** UF-HRM-10 full · `C-SLICE-≠-MODULE` |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** QA stamp **`ATTLVTCON1-MSNO8B9F`** on **narrow consumer slice only**:

1. **VAL-LV-ATT-FE-01** — vitest **2/2** · `HrmApiReminders` → `useAttLeaveTypesEffective` · no `leaveTypeOptionsFromCatalog` on TXN path.
2. **LeaveTab picker parity** — browser **12/12** `catalog-picker-option-*` codes = `GET …/leave-types/effective` EFF keys (`bad=0`).
3. **ATTLVTSOTQC1 must_keep** — ATT LVT settings smoke path **not** mutated; dual SoT parent seal **RETAINED**.

**NOT** full UF-HRM-10 PASS · **NOT** `settings_catalog_e2e_ready` · **NOT** full leave mutate U65 (holiday gate) · **NOT** Phase 1 DONE.

Audited: QA MD · dev FE handoff · BA AC matrix · parent ATT LVT GWC · QC spot vitest · Classification · U19 journey carry.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **UF-HRM-10 full matrix / Settings catalog UAT** | **DENIED** | narrow consumer legs only |
| **`settings_catalog_e2e_ready`** | **`false`** | **DENIED** flip |
| **Claim leave module / ATT UAT DONE** | **DENIED** | picker + vitest slice |
| **Phase 1 DONE** | **DENIED** | narrow GWC |
| **Reopen `ATTLVTSOTQC1-MSNGQC01` ATT LVT dual SoT** | **DENIED** | independent consumer slice |
| **Seed** | **DENIED** (U65) | env EFF=12 on pilot |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | narrow GWC |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM claim **UF-HRM-10** full 🟢? | **NO** |
| May PM set `settings_catalog_e2e_ready=true`? | **NO** |
| May PM annotate **`ATTLVTCONQC1-MSNO8BQC1`** on **AC-SET-CONSUMER-LV-ATT-01** row? | **YES** |
| May PM treat LeaveTab **12/12 EFF parity** + **VAL-LV-ATT-FE-01** as **CLOSED** this slice? | **YES** — this GWC |
| May PM promote Dashboard Reminders live label parity without pending rows? | **NO** — **carry 🟡** until U65 pending feasible |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| LeaveTab picker ⊆ effective API (12=12) | PRODUCT L2.5 | **ACCEPT** |
| VAL-LV-ATT-FE-01 vitest source lock | PRODUCT L1 | **ACCEPT** · QC spot **2/2** |
| Dashboard Reminders pending label (live row) | PRODUCT L2 | **CARRY 🟡** · `pendingLeaves=0` · widget hidden |
| Optional mutate Duyệt / POST leave | PRODUCT | **OUT OF SLICE** · `HRM-LEAVE-HOL-MISSING` env gate |
| QA evidence pack `verify:qc:evidence-pack` on QA MD | PROCESS | **4/8 at intake** · remediated in **QC SoT** § Pack consolidation |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-leave-types-consumer-att-01.md` | exit **1** · **4/8** (portal_url · journey_l25 · crud_or_matrix · residual_section missing on QA MD) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-leave-types-consumer-att-gwc-01.md` | exit **0** · **8/8 PASS** |
| QA L0 `pnpm run qc:fe-be-health` (cite QA) | **PASS** exit **0** |
| QA vitest `po-hrm-leave-types-consumer-att-fe-01.test.ts` (cite QA) | **2/2** PASS |
| QC spot `pnpm exec vitest run src/lib/po-hrm-leave-types-consumer-att-fe-01.test.ts` (`apps/web/hrm`) | **2/2** PASS · exit **0** |
| QA GET effective `company_id=main` (cite QA) | **200** · total **12** |
| Git HEAD (cite QA) | `dc930c5` |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:28001` |
| 5 | journey_l25 | ✅ § J-* / UF below |
| 6 | crud_or_matrix | ✅ AC-SET-CONSUMER-LV-ATT-01 matrix |
| 7 | residual_section | ✅ § Residual |
| 8 | timestamp | ✅ 2026-08-11 |

---

## AC matrix (in-scope — CLOSED this seat)

| AC / check | Verdict | Notes |
|------------|---------|-------|
| **AC-SET-CONSUMER-LV-ATT-01** LeaveTab picker ⊆ EFF | **PASS** | 12 picker · 12 eff · bad=0 |
| **VAL-LV-ATT-FE-01** | **PASS** | vitest 2/2 · Reminders hook |
| **ATTLVTSOTQC1** retain | **PASS** | no LVT tab mutate · parent seal |
| Dashboard ↔ LeaveTab label (live pending row) | **CARRY 🟡** | 0 pending · retest when U65 pending exists |
| Optional mutate Duyệt | **NOT IN SLICE** | submit disabled · HOL-MISSING |

---

## J-* / UF (U19)

| ID | Verdict | Notes |
|----|---------|-------|
| **UF-HRM-10** (narrow — leave_types consumer) | **PASS** | Chấm công → Nghỉ phép → picker EFF |
| **UF-HRM-10** (full matrix) | **NOT PROMOTED** | ≠ full PASS per honesty |
| **UF-LEAVE-CONSUMER-EFFECTIVE** (from ATT LVT parent) | **REINFORCED** | same effective SoT on Reminders wiring |
| **Leave create → effective GET** (L2.5 spine) | **PASS** | Network `HRM-ATT-LVT-200` |
| **Dashboard Reminders pending label** | **CARRY 🟡** | vitest lock only until pending row visible |
| **PROGRAM_JOURNEY_MAP** full Settings mandatory J-* | **NOT PROMOTED** | C-SLICE |

---

## Conditions (GWC)

1. **Honesty:** `settings_catalog_e2e_ready=false` · **DENY** UF-HRM-10 full · **DENY** Phase 1 · U65 seed.
2. **Parent RETAIN:** **`ATTLVTSOTQC1-MSNGQC01`** · **`SETFIDQC1`** · **`SETW3QC1`** — not reopened.
3. **CLOSED (this seat):** **AC-SET-CONSUMER-LV-ATT-01** — LeaveTab **12/12 EFF** + **VAL-LV-ATT-FE-01** after **`ATTLVTCON1-MSNO8B9F`**.
4. **CARRY:** Dashboard **Nhắc việc** pending-leave **live label parity** — retest when `pendingLeaves>0` under U65 (no seed).
5. **must_keep:** `GET …/leave-types/effective` · `useAttLeaveTypesEffective` on TXN surfaces · `HRM-LEAVE-TYPE-UNKNOWN` regression (dev-be residual if uncovered).
6. **Process:** QA should append **8/8** sections to `qa-hrm-leave-types-consumer-att-01.md` on next touch (portal_url · J-* · matrix · Residual) — non-blocking for this GWC stamp.

---

## Residual / not promoted

| Item | Severity | Owner |
|------|----------|-------|
| Dashboard Reminders live row label parity | P1 carry 🟡 | `qa` when U65 pending leave feasible |
| `BR-SET-CONSUMER-MATRIX-01` other P0 keys | Program | PM / governance NEXT waves |
| `HRM-LEAVE-TYPE-UNKNOWN` BE regression assert | P2 | `dev-be` if not in jest |
| QA evidence pack 8/8 on QA MD | Process | `qa` hygiene |
| Full UF-HRM-10 · `settings_catalog_e2e_ready` | Honesty | **DENY** |
| UC matrix annotate consumer row | Program | PM post-GWC |

---

## completion_report

**Closed:** QC **GO WITH CONDITIONS** on narrow **leave_types ATT consumer** slice — audited QA **`ATTLVTCON1-MSNO8B9F`**, dev FE handoff, BA **AC-SET-CONSUMER-LV-ATT-01**, parent **`ATTLVTSOTQC1`** retained, spot vitest **2/2**, honesty locks per exit criteria.

**Residual:** Live Dashboard Reminders label **🟡 carry**; QA MD pack **4/8** at intake (consolidated in QC SoT); full UF-HRM-10 and `settings_catalog_e2e_ready` **DENIED**.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/qc-hrm-leave-types-consumer-att-gwc-01.md` |
| **next_dispatch_prompt** | PM: bus seal **`ATTLVTCONQC1-MSNO8BQC1`** on consumer matrix row **AC-SET-CONSUMER-LV-ATT-01** 🟢 **C-SLICE only** — **do not** set `settings_catalog_e2e_ready` or UF-HRM-10 full. U88: dispatch **`ba-process`** or **`sa`** for **`BR-SET-CONSUMER-MATRIX-01`** next P0 key (`pay_types` / `job_grades` per SETFID residual) **or** queue **`qa`** carry **`Dashboard Reminders` live label** when sponsor can complete U65 pending leave without seed. Optional: **`dev-be`** narrow `HRM-LEAVE-TYPE-UNKNOWN` regression if jest gap. **must_keep:** **`ATTLVTSOTQC1-MSNGQC01`**. |
