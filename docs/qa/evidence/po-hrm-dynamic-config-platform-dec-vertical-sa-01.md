# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **change_mode** | ADD / EXPAND · DOC-DELTA · **no** `apps/**` · **no** seed |
| **Honesty** | All ready flags **false** · no invent module UAT · no wipe EMP L1 SEAL · no absorb `contract_types` |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md` | L-EMP-CAT-06 OUT → this seat; R-PLT-EMP-05 QSĐ residual |
| 2 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` §2 | Dual SoT REF vs tenant writer · ICatalogRow · F.1 depth |
| 3 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` | System outcome flags pattern · soft-delete · AC U65 |
| 4 | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` | Option B · L1–L7 · §7 Employees/NS (no separate Decisions row yet → R-PLT-DEC-03) |
| 5 | `po-hrm-dynamic-config-platform-emp-vertical-sa-01.md` | Residual QSĐ / `hr_decision_types` GĐ1.5 |
| 6 | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-01a | QSĐ hiệu lực → WH · loại cấu hình tenant |
| 7 | `DB_DESIGN_HRM_ENTERPRISE.md` §3.11 | `hr_decisions.decision_type` text · catalog `decision_types` pointer · no physical type table |
| 8 | `PO-HRM-E2E-LINK-EMP-SA-01.md` | F-CORE-DEC-01/02 must_keep |
| 9 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` §2.1 | Loại QSĐ Catalog + Schema (Schema OUT GĐ1) |
| 10 | AS-IS Nest | `HRM_SC_DEC_*` · settings dual-read · hardcoded PERSON_BOUND / WH neo Sets |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md) | **CONFIRMED** DEC vertical API F.1 — F-DEC-CAT-TYP/EFF · AC-PLT-DEC-01..06 · DOC-DELTA §7 · unlock DEC-DATA-01 |

**Không đụng:** `apps/**` · EMP DOC/ET SEAL wipe · ATT/REC sealed · CTR `contract_types` absorb · seed · UAT flip · FormSchema/Merge print invent.

---

## 3. Architecture stamps (summary)

| Topic | Stamp |
|-------|--------|
| Platform roll | Option **B** Catalog (`ICatalogRow`) on **Decisions / QSĐ** GĐ1 **decision types** |
| Primary catalog | **`hr_decision_type`** (`decision_type_key`) — open keys · starter/HRD_* ≠ ceiling |
| Dual SoT | settings-catalogs `hr_decision_types` / aliases `decision_types` group REF vs DEC tenant writer — **tenant wins** |
| System flags | `is_person_bound` · `writes_work_history` · `wh_event_type` · `requires_position_key` — replace hardcoded Sets after BE |
| Consumer | F-CORE-DEC-01/02 ∈ effective (**BR-PLT-02**) — WH spine must_keep |
| OUT | CTR `contract_types` · FormSchema GĐ1.5 · Merge print GĐ2 · EMP/ATT/REC mutate |
| Closed residual | **R-PLT-EMP-05** / L-EMP-CAT-06 → owned by DEC cascade |
| Open catalog | **FORBIDDEN** closed enum CHECK / reject Nth |
| Physical coverage | **NOT** in prior DATA waves → **UNLOCK** DEC-DATA-01 |
| Honesty | All ready **false** |

---

## 4. Quality gates (sa DEC vertical F.1)

| Check | Result |
|-------|--------|
| ICatalogRow map + physical pointer §2 | **PASS** |
| F-DEC-CAT-TYP/EFF full F.1 blocks | **PASS** |
| Dual SoT hr_decision_types clarity | **PASS** |
| Soft-delete · scope_parity U19 | **PASS** |
| Decisions spine must_keep | **PASS** |
| EMP/ATT/REC sealed · CTR types OUT | **PASS** |
| AC-PLT-DEC-01..06 measurable U65 | **PASS** |
| DOC-DELTA client API/DB §7 | **PASS** |
| No apps/** · no UAT flip · no seed | **PASS** |
| ba-data unlock (not already covered) | **PASS** — unlock DEC-DATA-01 |
| All ready flags false | **PASS** |

---

## 5. completion_report

**Closed:** Rolled Platform Option B to **Decisions / QSĐ** vertical — API_DESIGN F.1 for open **decision-type** catalog (`F-DEC-CAT-TYP-*` · `F-DEC-CAT-EFF-01`); dual SoT settings `hr_decision_types` REF vs tenant `hr_decision_type`; typed flags for person-bound / WH neo (supersede hardcoded Sets after BE); must_keep F-CORE-DEC/WH + EMP L1 SEAL + ATT/REC sealed + CTR types OUT; AC-PLT-DEC-01..06; DOC-DELTA pointers; unlocks **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01`; closes EMP residual **R-PLT-EMP-05**.

**Open:** ba-data physical · DEC-BA-01 AC/BR align · ba-docs DOC-DELTA · dev-be after DATA · dev-fe pickers · QA AC-PLT-DEC U65 · R-PLT-DEC-01..06 (FormSchema / Merge / ADR §7 row).

**Forbidden claims:** any `*_uat_ready=true` / `*_e2e_ready=true` · Phase1 DONE · seed UF · wipe EMP SEAL · absorb contract_types.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **ba-data** DEC physical (parallel **ba-process** DEC-BA-01 · **ba-docs** DOC-DELTA)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD
prior: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01 CONFIRMED

## Mission
Physicalize `public.hr_decision_type` per DEC-VERTICAL-SA-01 §2 — open `decision_type_key`; soft-delete; UQ active; typed flags `is_person_bound` / `writes_work_history` / `wh_event_type` / `requires_position_key`; dual SoT note vs settings `hr_decision_types` REF (tenant wins). EXPAND DOC note on `hr_decisions.decision_type`. Align with DEC-BA-01 AC/BR if parallel. Unlock DEC-BE only after CONFIRMED.

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md §2–§3
2. docs/qa/evidence/po-hrm-dynamic-config-platform-dec-vertical-sa-01.md
3. EMP-DATA-01 / ATT-DATA-01 / REC-DATA-01 pattern peers
4. DB_DESIGN §3.11 hr_decisions — must_keep TXN
5. PO-HRM-E2E-LINK-EMP-DB-01 WH decision_id — must_keep

## Deliverables
- Spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-data-01.md
- FORBIDDEN closed CHECK IN on keys · hard-delete · absorb contract_types · wipe EMP/ATT/REC · apps/**
- Honesty: all ready flags false

## exit
CONFIRMED / PASS_TO_PM · next_dispatch → DEC-BE-01 HOLD until DATA · or DEC-BA-01 if BA not done · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status

## cấm
apps/** · seed · invent module UAT · wipe EMP L1 SEAL · absorb contract_types into DEC · reopen hardcoded enum as SoT
```

**Parallel (if DEC-BA-01 still open):**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01
from_role: pm
to_role: ba-process
lane: governance
align_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md
mission: AC/BR Loại QSĐ open catalog · map AC-PLT-DEC-01..06 · cấm reclose enum · cấm absorb contract_types · FormSchema = residual GĐ1.5 only · honesty false · no apps/**
```

---

## 7. Handoff packet

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **entry_criteria** | EMP residual QSĐ GĐ1.5 · ATT/REC/EMP F.1 patterns · Option B ADR |
| **exit_criteria** | Spec CONFIRMED · evidence · unlock DEC-DATA-01 · honesty false · no apps/** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-vertical-sa-01.md` |
| **needed_by** | same program day W8 |
| **ack_status** | **PASS_TO_PM** |
| **completion_report** | See §5 |
| **next_owner** | pm → ba-data DEC-DATA-01 |
| **next_dispatch_prompt** | See §6 |
