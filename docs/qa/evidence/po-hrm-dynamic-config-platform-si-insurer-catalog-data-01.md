# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01` Option B **CONFIRMED** · Nest absent |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **date** | 2026-08-08 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `payroll_e2e_ready=false` · DENIED invent SI/CTR module UAT · **`C-SLICE-≠-MODULE`** · U65 |
| **BE gate** | **HOLD** until parallel **BA-01 CONFIRMED** (DATA alone ≠ unlock BE) |

---

## 1. spec_read_ack

| Artifact | Sections used |
|----------|---------------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md` | Option B LOCK · L-SI-INR-01..10 · F-SI-CAT-INS/EFF · AC-PLT-SI-INSURER-01* · physical pointer §6 · DOC-DELTA §3.6b |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md` | Peer §3.6a pattern — **RETAIN** · UQ partial · dual SoT · EFF IX · VAL matrices |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md` / `DEC-DATA-01` / `ATT-DATA-01` | Peer open key · soft-delete · ICatalogRow |
| `PO-HRM-E2E-LINK-EMP-DB-01.md` / DB_DESIGN §3.6 | Enrollment ONE SoT must_keep |
| AS-IS Nest (read-only) | `assertInsurerKey` MD `insurers` · `hrm_insurance_policies.insurer_key` · **no** `si_insurer` table |

**no_prompt_echo:** Client DOC-DELTA uses Vietnamese enterprise wording only — no chat/prompt paste.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md) | **CONFIRMED** physical ADD `si_insurer` · dual SoT · VAL-SI-INR-* · F-SI-CAT-INS/EFF |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **DOC-DELTA CONFIRMED** §3.6b · §3.6 EXPAND `insurer_key` · §3.6a peer pointer · footer stamp |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` | R-PLT-DATA-04 — SI **insurers** slice **CLOSED** |

**Không đụng:** `apps/**` · seed · wipe §3.6a type · enrollment / CTR legal-print · mega-EAV · fold into `si_insurance_type` · honesty flip · reopen SI type L1.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Physical ADD | **`public.si_insurer`** — ABSENT AS-IS |
| Open catalog | UQ `(company_id, lower(insurer_key))` partial · format CHK only |
| FORBIDDEN OUT | Mega-EAV · fold into `si_insurance_type` · reopen type L1 · seed · wipe §3.6a |
| Soft-delete | `archived_at` + `status=retired` — history intact |
| ICatalogRow | `insurer_key` / `name_vi` / `status` / `company_id` + optional alias/meta JSON |
| Dual SoT | settings-catalogs `insurers` REF **≠** SI writer — **tenant wins** |
| Consumer EXPAND | policy `insurer_key` · optional records · ∈ EFF when >0 |
| Caps | **F-SI-CAT-INS-01/02** · **F-SI-CAT-INS-EFF-01** (+ effective IX) |
| Cap→column | §2.6 map in DATA spec |
| must_keep | Peer type §3.6a · Enrollment ONE SoT · CTR/SI seals RETAIN |
| Closes | **R-PLT-DATA-04** SI **insurers** catalog slice |
| Honesty | printable / personnel / payroll **false** · `C-SLICE-≠-MODULE` |
| BE | **HOLD** — unlock only when **BA-01 + DATA-01** both CONFIRMED |

---

## 4. Quality gates (ba-data)

| Check | Result |
|-------|--------|
| Physical columns match SA Option B pointer + peer SI type pattern | **PASS** |
| UQ active partial + lower(key) | **PASS** |
| FORBIDDEN closed enum CHECK documented | **PASS** |
| Dual SoT insurers REF + tenant wins | **PASS** |
| Explicit OUT mega-EAV / fold into type / reopen L1 / seed | **PASS** |
| EXPAND policy/records soft-key notes | **PASS** |
| Peer SI-INS-CATALOG-DATA-01 RETAIN / no wipe §3.6a | **PASS** |
| Enrollment ONE SoT must_keep / no schema rewrite | **PASS** |
| VAL-SI-INR-CAT/CNS/ALS/SCP | **PASS** |
| Map F-SI-CAT-INS-01/02/EFF-01 → columns | **PASS** |
| scope_parity U19 noted | **PASS** |
| CTR/SI type/enrollment seals RETAIN · honesty false | **PASS** |
| No apps/** / no seed / no migrate execute | **PASS** |
| DOC-DELTA DB no_prompt_echo | **PASS** |
| BE unlock note: wait BA CONFIRMED | **PASS** |

---

## 5. completion_report

**Closed:** Physicalized ADD `public.si_insurer` per SA Option B (Nest absent) — open `insurer_key` (format CHK; UQ on `lower(key)` partial active), soft-delete via `archived_at`/`status`, platform `ICatalogRow` binding (+ optional legacy aliases / metadata_json), dual SoT Settings `insurers` REF vs tenant writer (tenant wins), F-SI-CAT-INS-01/02/EFF-01 resolution + effective IX, VAL-SI-INR-CAT/CNS/ALS/SCP matrices, EXPAND notes on policy/records `insurer_key` (open soft keys; history may hold retired; FORBIDDEN closed CHECK), DOC-DELTA CONFIRMED on client DB_DESIGN §3.6b / §3.6 / §3.6a peer pointer; closes R-PLT-DATA-04 SI **insurers** slice; **FORBIDDEN** mega-EAV · fold into `si_insurance_type` · reopen type L1 · seed; peer SI type DATA + L1 GWC **RETAIN**; CTR legal-print + SI enrollment seals **RETAIN**; no `apps/**`; no seed (U65); honesty `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false`; **`C-SLICE-≠-MODULE`**; **BE unlock HOLD** until parallel **BA-01 also CONFIRMED**.

**Residual:** Wait **ba-process** SI-INSURER-CATALOG-BA-01 CONFIRMED → then **dev-be** SI-INSURER-CATALOG-BE-01; ba-docs API DOC-DELTA; FE EFF rebind; QA U65 after BE+FE.

**Forbidden claims:** SI/CTR module UAT · printable/personnel ready · reopen CTR / type L1 · seed as UF evidence · wipe §3.6a · Phase1 DONE · BE start before BA CONFIRMED.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** — do **not** unlock **dev-be** until `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01` **CONFIRMED**; then dispatch BE below.

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01
prior: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01 CONFIRMED · SI-INSURER-CATALOG-SA-01 Option B CONFIRMED · SI-INSURER-CATALOG-BA-01 CONFIRMED (entry gate — BOTH required)
change_mode: ADD
priority: P1

## entry_criteria
- DATA-01 CONFIRMED (docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md)
- BA-01 CONFIRMED AC-PLT-SI-INSURER-01* pack
- Peer SI-INS type L1 + DATA-01 RETAIN — FORBIDDEN reopen / fold into si_insurance_type
- U65 zero-seed · no flip printable/personnel

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md (§2 physical · §2.4 dual SoT · §2.6 cap map · §5 VAL-*)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md §5–§6 F-SI-CAT-INS/EFF · L-SI-INR-*
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md (AC/VAL consumer surfaces)
4. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.6b · §3.6 · §3.6a peer
5. docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-data-01.md
6. Peer ensureSchema: si_insurance_type (RETAIN) / emp_document_type / att_leave_type

## task
- ensureSchema ADD public.si_insurer + partial UQ lower(insurer_key) + format/status CHK + effective IX
- Nest F-SI-CAT-INS-01/02 + F-SI-CAT-INS-EFF-01 under contracts-insurance/insurers*
- Deepen assertInsurerKey → Nest EFF when count>0 (retain HRM-INS-INSURER-KEY)
- Dual SoT: Settings insurers REF merge-read; tenant wins
- jest VAL-SI-INR-CAT/CNS/ALS/SCP
- FORBIDDEN: touch/wipe si_insurance_type · mega-EAV · seed · flip honesty · reopen CTR

## exit_criteria
- READY_FOR_QA · evidence_path docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-be-01.md
- honesty flags false · C-SLICE-≠-MODULE · peer type seals RETAIN
```

**If BA still in flight:** PM intake DATA CONFIRMED only; keep BE HOLD; no second DATA seat.

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-data-01.md` |
| **next_owner** | **pm** (gate BA → then **dev-be**) |
| **pm_dispatch_hint** | Unlock `SI-INSURER-CATALOG-BE-01` only after BA-01 CONFIRMED; DATA-01 already CONFIRMED |
