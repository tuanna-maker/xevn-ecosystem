# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01` Option B **CONFIRMED** · Nest absent |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **date** | 2026-08-08 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · DENIED invent module EMP UAT · **`C-SLICE-≠-MODULE`** · U65 |
| **BE gate** | **HOLD** until parallel **BA-01 CONFIRMED** (DATA alone ≠ unlock BE) |
| **re_dispatch** | Prior seat INVALID-HANDOFF (ZERO files) — both deliverables written this seat |

---

## 1. spec_read_ack

| Artifact | Sections used |
|----------|---------------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md` | Option B LOCK · L-EMP-ST-01..14 · F-EMP-CAT-ST/STR/EFF · F-EMP-ST-CNS-* · KEY `HRM-EMP-STATUS-KEY` / `HRM-EMP-STATUS-REASON-KEY` · physical pointer §6 · AC draft |
| `po-hrm-dynamic-config-platform-emp-status-catalog-sa-01.md` | AS-IS hardcode + closed CHECK · unlock ba-data · BE HOLD |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md` | Structure peer — UQ partial · dual SoT · EFF IX · VAL matrices · BE HOLD until BA |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md` / `ATT-DATA-01` | Peer open key · soft-delete · ICatalogRow · DOC/ET **RETAIN** |
| DB_DESIGN §3.0a–b · §3.1 | EMP catalogs + `hrm_employee.status` EXPAND target |
| AS-IS Nest (read-only cite) | **no** `emp_employment_status` / `emp_status_reason` · `chk_employees_status IN (active,inactive)` |

**no_prompt_echo:** Client DOC-DELTA uses Vietnamese enterprise wording only — no chat/prompt paste.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md) | **CONFIRMED** physical ADD `emp_employment_status` + `emp_status_reason` · dual SoT REF · DROP closed CHECK · VAL-EMP-ST/STR-* · F-EMP-CAT-ST/STR/EFF |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **DOC-DELTA CONFIRMED** §3.0c/d · §3.1 EXPAND `status` · §3.0b peer pointer · footer stamp |
| This evidence | Verdict · quality gates · handoff |

**Không đụng:** `apps/**` · seed · wipe §3.0a–b DOC/ET · EMP-CUSTOM/EXT · ATT/SI/CTR · mega-EAV · fold into ET/custom · honesty flip · invent EMP UAT.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Physical ADD | **`public.emp_employment_status`** + **`public.emp_status_reason`** — ABSENT AS-IS |
| Open catalog | UQ `(company_id, lower(status_key|reason_key))` partial · format CHK only |
| DOC-DELTA CHECK | **DROP/REPLACE** closed `chk_employees_status` — open catalog keys (soft FK text) |
| FORBIDDEN OUT | Mega-EAV · fold into ET/custom · wipe EMP-CUSTOM/EXT · seed · flip ready |
| Soft-delete | `archived_at` + `status=retired` — history intact |
| ICatalogRow | keys / `name_vi` / row status / `company_id` + typed ST flags / applies_to |
| Dual SoT | Settings `employee_statuses` / `employment_statuses` = **REF** **≠** sole producer — **tenant wins** |
| Consumer EXPAND | `employees.status` ∈ EFF when >0 → **`HRM-EMP-STATUS-KEY`**; reason → **`HRM-EMP-STATUS-REASON-KEY`** |
| Caps | **F-EMP-CAT-ST-01..04/EFF-01** · **F-EMP-CAT-STR-*/EFF** · **F-EMP-ST-CNS-01/02** |
| Cap→column | §2.6 / §3.4 map in DATA spec |
| must_keep | Peer DOC/ET · EMP-CUSTOM CNS · EXT · soft-delete · transition-graph residual OK |
| Closes | **R-PLT-DATA-04** EMP **status/reason** catalog slice |
| Honesty | personnel / e2e / printable **false** · `C-SLICE-≠-MODULE` |
| BE | **HOLD** — unlock only when **BA-01 + DATA-01** both CONFIRMED |

---

## 4. Quality gates (ba-data)

| Check | Result |
|-------|--------|
| Physical columns match SA Option B pointer + peer EMP/ATT/SI pattern | **PASS** |
| UQ active partial + lower(key) on both tables | **PASS** |
| FORBIDDEN closed enum CHECK + DROP `chk_employees_status` documented | **PASS** |
| Dual SoT Settings REF + tenant wins (not sole producer) | **PASS** |
| Invent KEY cite SA: `HRM-EMP-STATUS-KEY` · `HRM-EMP-STATUS-REASON-KEY` | **PASS** |
| Explicit OUT mega-EAV / fold ET·custom / wipe EMP-CUSTOM/EXT / seed / flip ready | **PASS** |
| EXPAND employees.status soft-key notes | **PASS** |
| Peer EMP-DATA-01 DOC/ET RETAIN / no wipe §3.0a–b | **PASS** |
| VAL-EMP-ST/STR-CAT/CNS/ALS/SCP | **PASS** |
| Map F-EMP-CAT-ST/STR/EFF + CNS → columns | **PASS** |
| scope_parity U19 noted | **PASS** |
| Seals RETAIN · honesty false | **PASS** |
| No apps/** / no seed / no migrate execute | **PASS** |
| DOC-DELTA DB no_prompt_echo ADD-only | **PASS** |
| BE unlock note: wait BA CONFIRMED | **PASS** |
| Both files on disk (spec + evidence) | **PASS** |

---

## 5. completion_report

**Closed:** Physicalized ADD `public.emp_employment_status` + companion `public.emp_status_reason` per SA Option B (Nest absent) — open keys (format CHK; UQ on `lower(key)` partial active), soft-delete via `archived_at`/`status`, platform `ICatalogRow` + typed status flags (`is_workforce_active` / `is_terminal` / `requires_reason` / `counts_toward_headcount`) + reason `applies_to_status_keys_json`, dual SoT Settings `employee_statuses`/`employment_statuses` REF vs tenant writer (tenant wins — Settings **not** sole producer), F-EMP-CAT-ST/STR/EFF resolution + effective IX, invent KEY **`HRM-EMP-STATUS-KEY`** / **`HRM-EMP-STATUS-REASON-KEY`** (cite SA), VAL-EMP-ST/STR-CAT/CNS/ALS/SCP matrices, EXPAND notes on `employees.status` (open soft keys; history may hold retired; **DROP/REPLACE** closed `chk_employees_status`), DOC-DELTA CONFIRMED on client DB_DESIGN §3.0c/d / §3.1 / §3.0b peer pointer; closes R-PLT-DATA-04 EMP **status/reason** slice; **FORBIDDEN** mega-EAV · fold into ET/custom · wipe EMP-CUSTOM/EXT · seed; peer DOC/ET + EMP-CUSTOM/EXT/ATT/SI/CTR seals **RETAIN**; no `apps/**`; no seed (U65); honesty personnel/e2e/printable **false**; **`C-SLICE-≠-MODULE`**; **BE unlock HOLD** until parallel **BA-01 also CONFIRMED**.

**Residual:** Wait **ba-process** EMP-STATUS-CATALOG-BA-01 CONFIRMED → then **dev-be** EMP-STATUS-CATALOG-BE-01; ba-docs API DOC-DELTA; FE/Mobile EFF rebind; QA U65 after BE+FE.

**Forbidden claims:** Module EMP UAT · personnel/e2e/printable ready · reopen EMP-CUSTOM/EXT/DOC-ET/ATT/SI/CTR · seed as UF evidence · wipe §3.0a–b · Phase1 DONE · BE start before BA CONFIRMED.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** — do **not** unlock **dev-be** until `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01` **CONFIRMED**; then dispatch BE below.

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01
prior: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01 CONFIRMED · EMP-STATUS-CATALOG-SA-01 Option B CONFIRMED · EMP-STATUS-CATALOG-BA-01 CONFIRMED (entry gate — BOTH required)
change_mode: ADD
priority: P1

## entry_criteria
- DATA-01 CONFIRMED (docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md)
- BA-01 CONFIRMED AC-PLT-EMP-STATUS-01* pack
- Peer EMP DOC/ET + EMP-CUSTOM CNS L1 + MergeToken EXT RETAIN — FORBIDDEN reopen / fold status into ET/custom
- U65 zero-seed · no flip personnel/e2e/printable · C-SLICE-≠-MODULE

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md (§2–§3 physical · §2.4 dual SoT · §2.6/§3.4 cap map · §4 CHECK DROP · §6 VAL-*)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md §5–§6 F-EMP-CAT-ST/STR · F-EMP-ST-CNS · L-EMP-ST-* · KEY codes
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md (AC/VAL consumer surfaces)
4. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.0c/d · §3.1 · §3.0a–b peer
5. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-data-01.md
6. Peer ensureSchema: emp_document_type / emp_employment_type / att_leave_type / si_insurer (RETAIN peers)

## task
- ensureSchema ADD public.emp_employment_status + public.emp_status_reason + partial UQ lower(key) + format/row-status CHK + effective IX
- DROP/REPLACE closed chk_employees_status — keep employees.status TEXT open catalog key (soft FK text consumers)
- Nest F-EMP-CAT-ST-01..04 + F-EMP-CAT-ST-EFF-01 + F-EMP-CAT-STR-* + F-EMP-CAT-STR-EFF-01 under employees/employment-statuses* · status-reasons*
- Dual SoT: Settings employee_statuses/employment_statuses REF merge-read; tenant wins
- Consumer assert F-EMP-ST-CNS-01/02 → HRM-EMP-STATUS-KEY / HRM-EMP-STATUS-REASON-KEY when EFF>0; empty skip+CTA no seed
- Display-ready status_label from catalog when known
- jest VAL-EMP-ST/STR-CAT/CNS/ALS/SCP
- FORBIDDEN: touch/wipe emp_document_type/emp_employment_type · EMP-CUSTOM/EXT · mega-EAV · seed · flip honesty · reopen ATT/SI/CTR

## exit_criteria
- READY_FOR_QA · evidence_path docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-be-01.md
- honesty flags false · C-SLICE-≠-MODULE · peer DOC/ET + EMP-CUSTOM/EXT seals RETAIN
```

**If BA still in flight:** PM intake DATA CONFIRMED only; keep BE HOLD; no second DATA seat; do not invent BA AC pack.

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | See §5 — CONFIRMED physical ADD status+reason catalogs · DROP closed CHECK · dual SoT REF · KEY invent codes · BE HOLD until BA · seals RETAIN · honesty false |
| **next_owner** | **pm** (then **dev-be** only after BA also CONFIRMED) |
| **next_dispatch_prompt** | See §6 copy-ready BE prompt (gate on BA CONFIRMED) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-data-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **pm_dispatch_hint** | Unlock `EMP-STATUS-CATALOG-BE-01` only after BA-01 CONFIRMED; DATA-01 already CONFIRMED |
