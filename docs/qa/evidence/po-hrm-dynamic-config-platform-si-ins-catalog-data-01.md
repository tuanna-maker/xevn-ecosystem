# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01` Option B **CONFIRMED** · Nest absent |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **date** | 2026-08-08 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `payroll_e2e_ready=false` · DENIED invent SI/CTR module UAT · **`C-SLICE-≠-MODULE`** · U65 |

---

## 1. spec_read_ack

| Artifact | Sections used |
|----------|---------------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md` | Option B LOCK · L-SI-INS-01..10 · F-SI-CAT-TYP/EFF · AC-PLT-SI-INS-01* · physical pointer §6 |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md` | Peer open key · partial UQ · soft-delete · typed flags · ICatalogRow |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md` | Peer dual SoT · lower(key) UQ · VAL-CAT/CNS · DOC-DELTA pattern |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` | Peer leave_types REF vs Nest writer · EFF resolution |
| `PO-HRM-E2E-LINK-EMP-DB-01.md` / DB_DESIGN §3.6 | Enrollment ONE SoT `employee_insurances` must_keep |
| `PO-HRM-SETTINGS-DEFAULTS-DATA-01.md` | `pay_insurance_rate_cfg.insurance_type_key` consumer |
| AS-IS Nest (read-only) | `assertInsuranceTypeKey` MD `insurance_types` · enrollment free-text `type` · **no** `si_insurance_type` table |

**no_prompt_echo:** Client DOC-DELTA uses Vietnamese enterprise wording only — no chat/prompt paste.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md) | **CONFIRMED** physical ADD `si_insurance_type` · dual SoT · VAL-SI-CAT/CNS · F-SI-CAT-TYP/EFF |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **DOC-DELTA CONFIRMED** §3.6a · §3.6 EXPAND · footer stamp |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` | R-PLT-DATA-04 — SI insurance-type slice **CLOSED** |

**Không đụng:** `apps/**` · seed · wipe enrollment / CTR legal-print · insurers mega-fold · second policy catalog · honesty flip.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Physical ADD | **`public.si_insurance_type`** — ABSENT AS-IS |
| Open catalog | UQ `(company_id, lower(insurance_type_key))` partial · format CHK allows `BHXH` style |
| FORBIDDEN | Closed enum CHECK · insurers fold · second mega catalog · enrollment rewrite |
| Soft-delete | `archived_at` + `status=retired` — history intact |
| Typed flags | `is_statutory` · `eligible_for_rate_cfg` · `requires_policy` |
| Dual SoT | settings-catalogs `insurance_types` REF **≠** SI writer — **tenant wins** |
| Consumer EXPAND | policy `insurance_type` · enrollment `type` · rate-cfg `insurance_type_key` · ∈ EFF when >0 |
| Caps | **F-SI-CAT-TYP-01/02** · **F-SI-CAT-EFF-01** (+ effective IX) |
| must_keep | Enrollment ONE SoT · F-CORE-SI-02/03 · CTR/SI seals RETAIN |
| Closes | **R-PLT-DATA-04** SI insurance-type catalog slice |
| Honesty | printable / personnel / payroll **false** · `C-SLICE-≠-MODULE` |
| BE | **UNLOCK** — BA-01 **CONFIRMED** + this DATA **CONFIRMED** |

---

## 4. Quality gates (ba-data)

| Check | Result |
|-------|--------|
| Physical columns match SA Option B pointer + peer EMP/DEC/ATT | **PASS** |
| UQ active partial + lower(key) | **PASS** |
| FORBIDDEN closed enum CHECK documented | **PASS** |
| Dual SoT insurance_types REF + tenant wins | **PASS** |
| No insurers mega-fold / no second catalog | **PASS** |
| EXPAND policy/enrollment/rate-cfg soft-key notes | **PASS** |
| Enrollment ONE SoT must_keep / no schema rewrite | **PASS** |
| VAL-SI-CAT-* / CNS-* / ALS / SCP | **PASS** |
| Cite F-SI-CAT-TYP/EFF | **PASS** |
| scope_parity U19 noted | **PASS** |
| CTR/SI seals RETAIN · honesty false | **PASS** |
| No apps/** / no seed / no wipe | **PASS** |
| DOC-DELTA DB no_prompt_echo | **PASS** |

---

## 5. completion_report

**Closed:** Physicalized ADD `public.si_insurance_type` per SA Option B (Nest absent) — open `insurance_type_key` (format CHK allowing BHXH style; UQ on `lower(key)` partial active), soft-delete via `archived_at`/`status`, typed flags `is_statutory` / `eligible_for_rate_cfg` / `requires_policy` (+ optional legacy aliases), platform `ICatalogRow` binding, dual SoT Settings `insurance_types` REF vs tenant writer (tenant wins), F-SI-CAT-TYP/EFF resolution + effective IX, VAL-SI-CAT/CNS/ALS/SCP matrices, EXPAND notes on policy `insurance_type` · enrollment `type` · `pay_insurance_rate_cfg.insurance_type_key` (open soft keys; history may hold retired; FORBIDDEN closed CHECK), DOC-DELTA CONFIRMED on client DB_DESIGN §3.6a / §3.6; closes R-PLT-DATA-04 SI slice; **FORBIDDEN** insurers mega-fold · second catalog · enrollment rewrite; CTR legal-print + SI enrollment seals **RETAIN**; no `apps/**`; no seed (U65); honesty `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false`; **`C-SLICE-≠-MODULE`**; BE unlock gate **CLEAR** (BA-01 + DATA-01 both CONFIRMED).

**Residual:** **dev-be** SI-INS-CATALOG-BE-01 ensureSchema + F-SI-CAT-* + consumer assert (BA-01 already CONFIRMED); ba-docs API DOC-DELTA; FE EFF rebind; insurers OUT; QA U65 after BE+FE.

**Forbidden claims:** SI/CTR module UAT · printable/personnel ready · reopen CTR legal-print · seed as UF evidence · wipe enrollment SoT · Phase1 DONE.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01` (BA-01 + DATA-01 both **CONFIRMED** — BE unlock gate clear).

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01
prior: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01 CONFIRMED · SI-INS-CATALOG-SA-01 Option B CONFIRMED · SI-INS-CATALOG-BA-01 CONFIRMED (entry gate)
change_mode: ADD
priority: P1

## entry_criteria
- DATA-01 CONFIRMED (docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md)
- BA-01 CONFIRMED AC-PLT-SI-INS-01* pack
- U65 zero-seed · no flip printable/personnel

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md (§2 physical · §2.4 dual SoT · §5 VAL-*)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md §5–§6 F-SI-CAT-TYP/EFF · L-SI-INS-*
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md (AC/VAL consumer surfaces)
4. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.6a · §3.6
5. docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-data-01.md
6. Peer ensureSchema: emp_document_type / hr_decision_type / att_leave_type
7. AS-IS: contracts-insurance.service.ts assertInsuranceTypeKey (MD) · employee-insurances.service.ts free-text type

## task
ensureSchema ADD public.si_insurance_type per DATA-01:
- open insurance_type_key — FORBIDDEN closed enum CHECK (BHXH/social ≠ ceiling)
- partial UQ (company_id, lower(insurance_type_key)) WHERE archived_at IS NULL
- soft-delete archived_at + status retired
- typed flags: is_statutory, eligible_for_rate_cfg, requires_policy
- Nest F-SI-CAT-TYP-01/02 · F-SI-CAT-EFF-01 under /api/hrm/contracts-insurance/insurance-types* (FORBIDDEN invent /platform/si mega)
- Wire consumers when EFF>0: policy insurance_type · enrollment type · rate-cfg insurance_type_key → HRM-INS-TYPE-KEY (retain E3)
- dual SoT: merge settings insurance_types REF; tenant wins; FORBIDDEN mutate REF via SI catalog API
- scope_parity U19 list=get=mutate=assert
- optional ensure upsert starter keys — NOT UF evidence (U65)
- must_keep: employee_insurances ONE SoT · F-CORE-SI-02/03 · CTR legal-print/library seals · insurers OUT
- cấm: seed UF · hard-delete · insurers mega-fold · second catalog · enrollment SM rewrite · flip contracts_printable_ready / hrm_personnel_uat_ready · C-SLICE-≠-MODULE claim

## exit_criteria
- ensureSchema + jest catalog CRUD + VAL-SI-CAT/CNS class
- READY_FOR_QA with evidence path
- honesty: printable/personnel remain false
- completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-01.md
```

---

## 7. Handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | See §5 |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01` |
| **next_dispatch_prompt** | See §6 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-data-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
