# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **date** | 2026-08-07 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **honesty** | Decisions UAT **false** · `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `contracts_printable_ready=false` · no Phase1 DONE · U65 |

---

## 1. spec_read_ack

| Artifact | Sections used |
|----------|---------------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md` | §2 physical · L-DEC-CAT-* · F-DEC-CAT-* · AC-PLT-DEC-01..06 |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01.md` | AC-PLT-DEC-01..06 · BR-PLT-02/04/05/06 · BR-PLT-DEC-* · VAL-DEC-* |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` / EMP-DATA-01 | Peer open key · partial UQ · soft-delete · dual SoT |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §3.11 `hr_decisions.decision_type` (pre-EXPAND) |
| `po-hrm-dynamic-config-platform-dec-vertical-sa-01.md` | SA unlock ba-data |
| `po-hrm-dynamic-config-platform-dec-ba-01.md` | BA PASS prior |
| AS-IS Nest (read-only) | `HRM_SC_DEC_*` · `PERSON_BOUND_*` / `WORK_HISTORY_NEO_*` Sets → flag replace after BE |

**no_prompt_echo:** Client DOC-DELTA uses Vietnamese enterprise wording only — no chat/prompt paste.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md) | **CONFIRMED** physical ADD `hr_decision_type` · dual SoT · VAL-DEC-CAT/CNS · traceability |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **DOC-DELTA CONFIRMED** §3.11a · §3.11 EXPAND · §1.1 ER · footer stamp |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` | R-PLT-DATA-04 — DEC slice CLOSED |

**Không đụng:** `apps/**` · seed · wipe `hr_decisions` / WH / EMP DOC-ET / ATT leave / REC stages / CTR · honesty flip.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Physical ADD | **`public.hr_decision_type`** — ABSENT AS-IS |
| Open catalog | UQ `(company_id, lower(decision_type_key))` partial · format CHK allows `HRD_01` style |
| FORBIDDEN | Closed enum CHECK on starter/HRD_* · closed CHECK on `hr_decisions.decision_type` |
| Soft-delete | `archived_at` + `status=retired` — QSĐ history intact |
| Typed flags | `is_person_bound` · `writes_work_history` · `wh_event_type` · `requires_position_key` |
| Dual SoT | settings-catalogs `hr_decision_types` REF **≠** DEC writer — **tenant wins** |
| Consumer EXPAND | `hr_decisions.decision_type` text key · ∈ effective when catalog >0 |
| must_keep | Create/approve/effective → WH `decision_id` spine |
| Closes | **R-PLT-DATA-04** DEC / QSĐ types slice |
| Honesty | All listed ready flags **false** |

---

## 4. Quality gates (ba-data)

| Check | Result |
|-------|--------|
| Physical columns match SA §2.1 | **PASS** |
| UQ active partial + lower(key) | **PASS** |
| FORBIDDEN closed enum CHECK documented | **PASS** |
| Typed DEC flags (not free JSON SoT) | **PASS** |
| Dual SoT hr_decision_types REF + tenant wins | **PASS** |
| EXPAND hr_decisions.decision_type note | **PASS** |
| VAL-DEC-CAT-* / CNS-* / ALS / SCP | **PASS** |
| Align BA AC-PLT-DEC-01..06 | **PASS** |
| Decisions create/approve/WH must_keep | **PASS** |
| No wipe EMP/ATT/REC / CTR OUT | **PASS** |
| scope_parity U19 noted | **PASS** |
| No apps/** / no seed / no wipe | **PASS** |
| DOC-DELTA DB no_prompt_echo | **PASS** |
| Honesty flags stamped false | **PASS** |

---

## 5. completion_report

**Closed:** Physicalized ADD `public.hr_decision_type` per DEC vertical SA §2 + BA AC-PLT-DEC-01..06 — open `decision_type_key` (format CHK allowing HRD_* style; UQ on `lower(key)` partial active), soft-delete via `archived_at`/`status`, typed flags `is_person_bound` / `writes_work_history` / `wh_event_type` / `requires_position_key` (+ optional legacy aliases), platform `ICatalogRow` binding, dual SoT settings `hr_decision_types` REF vs tenant writer (tenant wins), VAL-DEC-CAT/CNS/ALS/SCP matrices, EXPAND note on `hr_decisions.decision_type` (open key; history may hold retired; FORBIDDEN closed CHECK), DOC-DELTA CONFIRMED on client DB_DESIGN §3.11a / §3.11 / ER; closes R-PLT-DATA-04 DEC slice; unlocks **DEC-BE-01**; no `apps/**`; no seed (U65); honesty all ready flags remain **false**.

**Residual:** dev-be ensureSchema + F-DEC-CAT-* + wire F-CORE-DEC to EFF / retire hardcoded Sets (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01`); ba-docs API DOC-DELTA (R-PLT-DEC-02); FormSchema GĐ1.5 / Merge GĐ2; QA AC-PLT-DEC U65 after FE/BE.

**Forbidden claims:** decisions module UAT · `hrm_personnel_uat_ready=true` · PAY/ATT/REC ready · Phase1 DONE · seed as UF evidence · wipe sealed EMP/ATT/REC.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **dev-be** (DEC-BE-01 unlocked; SA F.1 + DATA CONFIRMED)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01
prior: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01 CONFIRMED · DEC-VERTICAL-SA-01 CONFIRMED · DEC-BA-01 PASS
change_mode: ADD
priority: P1

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md (§2 physical · §2.4 dual SoT · §5 VAL-*)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md §3 F-DEC-CAT-TYP/EFF · §4 consumer deepen
3. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.11a · §3.11
4. docs/qa/evidence/po-hrm-dynamic-config-platform-dec-data-01.md
5. Peer pattern: emp_document_type / att_leave_type ensureSchema if present
6. AS-IS: apps/api/hrm-api/src/decisions/decisions.service.ts PERSON_BOUND_* / WORK_HISTORY_NEO_* → replace with catalog flags

## task
ensureSchema ADD public.hr_decision_type per DEC-DATA-01:
- open decision_type_key — FORBIDDEN closed enum CHECK (starter/HRD_* ≠ ceiling)
- partial UQ (company_id, lower(decision_type_key)) WHERE archived_at IS NULL
- soft-delete archived_at + status retired
- typed flags: is_person_bound, writes_work_history, wh_event_type, requires_position_key
- CHK: writes_work_history ⇒ is_person_bound + wh_event_type NOT NULL
- Nest F-DEC-CAT-TYP-01/02 · F-DEC-CAT-EFF-01 per SA §3
- Wire F-CORE-DEC-01/02: assert ∈ effective when catalog >0; person-bound/WH from flags (retire hardcoded Sets)
- dual SoT: merge settings hr_decision_types REF; tenant wins; FORBIDDEN mutate REF via DEC API
- scope_parity U19 list=get=mutate
- optional ensure upsert starter keys — NOT UF evidence (U65)
- must_keep: create/approve/effective → WH decision_id spine · EMP DOC/ET SEAL · ATT leave · REC stages · CTR contract_types OUT
- cấm: seed UF · hard-delete · closed CHECK on hr_decisions.decision_type · wipe WH · flip honesty ready flags

## exit_criteria
- ensureSchema + jest for catalog CRUD + VAL-DEC-CAT/CNS class
- READY_FOR_QA with evidence path
- honesty: all *_ready remain false
- completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-dec-be-01.md
```

---

## 7. Handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | See §5 |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01` |
| **next_dispatch_prompt** | See §6 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-data-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
