# PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01 — Option/F.1 · FE residual **R-PLT-EMP-ST-FE-01** (consumer Nest EFF rebind)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01` |
| **dispatch_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01-R2` |
| **r2_note** | Prior SA `ae297c91` **INVALID-HANDOFF** (turn_ended empty · 0 files) — this seat **re-wrote** Option/F.1 on NFD `.git`+`apps` True via WriteAllText |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QC-01` **GWC** L1 `EMPSTQA-MSK20G7H` · DOCS **ACCEPT** CH06e · residual **R-PLT-EMP-ST-FE-01** P2 HOLD |
| **U88 context** | EMP-STATUS L1 SEAL + DOCS ACCEPT · continuous residual FE Nest EFF picker · peer **ATT-CODE FE-SA Option A UNLOCK** class preferred |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **narrow FE HOLD disposition only** |
| **change_mode** | **ADD** Option/F.1 for **R-PLT-EMP-ST-FE-01** · **NO CODE** `apps/**` · **no seed** · **no wipe** EMP-STATUS L1 · EMP-CUSTOM · EXT · DOC/ET · ATT seals · LVRULE HOLD |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **A** **LOCKED** · **UNLOCK FE consumer Nest EFF status/reason rebind** · ba-process **HOLD** (AC-PLT-EMP-STATUS-01* already locked) · next = **dev-fe** |
| **prior_seals** | EMP-STATUS L1 `EMPSTQA-MSK20G7H` · DOCS CH06e / SRS v0.32 · EMP-CUSTOM CNS `EMPCFQA-MSK14LUH` · MergeToken EXT `EMPTOKEXTQA-MSJ57PE1` · DOC/ET · ATT/SI/CTR · LVRULE FE-01g ACCEPT_AS_IS HOLD — **SEAL / HOLD RETAIN** |
| **prior_sa** | [`EMP-STATUS-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md) Option **B** Nest `emp_employment_status` + `emp_status_reason` — this seat **≠** reopen catalog SoT |
| **prior_ba** | [`EMP-STATUS-CATALOG-BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md) **AC-PLT-EMP-STATUS-01 / 01b / 01c / 01d / 01H** · VAL-EMP-ST-CNS-02 · VAL-EMP-STR-CNS-* already locked — **RETAIN** |
| **peer_cite_unlock** | [`ATT-CODE-FE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01.md) Option **A** · OT-TYPE/COMP/SHIFT FE Nest EFF consumer rebind — **cite ≠ invent admin** |
| **peer_cite_hold** | [`ATT-LVRULE-FE-01G-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md) ACCEPT_AS_IS_P2 · OT/OTC **FE-ADMIN** HOLD — **cite ≠ copy onto consumer residual** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module EMP UAT · seed · reopen L1 / EMP-CUSTOM / EXT / DOC-ET / ATT / LVRULE |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | Disposition for **R-PLT-EMP-ST-FE-01** (P2) — unlock Nest EFF consumer rebind vs ACCEPT_AS_IS HOLD vs invent admin / reopen |
| **Requestor** | pm · U88 continuous after EMP-STATUS L1 GWC + DOCS ACCEPT · R2 after INVALID empty handoff |
| **Decision owner** | sa |
| **Related** | AC-PLT-EMP-STATUS-01 / 01b / 01c / 01d / 01H · VAL-EMP-ST-CNS-01/02/03/07 · VAL-EMP-STR-CNS-01 · BR-PLT-EMP-ST-02/04/05/06 · F-EMP-CAT-ST-EFF / F-EMP-CAT-STR-EFF · F-EMP-ST-CNS-01/02/03 · L-EMP-ST-01/05/06 |

### 1.1 Problem — what FE surface is HOLD (AS-IS evidence)

QC-01 sealed EMP-STATUS **L1** (invent KEY pair + CHK DROP + admin N+1 + GET ST/STR effective). Remaining product Condition:

| Residual ID | Severity | Surface inventory | Proven already (RETAIN) |
|-------------|----------|-------------------|-------------------------|
| **R-PLT-EMP-ST-FE-01** | **P2 HOLD → unlock candidate** | **Consumer** `EmployeeFormDialog` — status Select binds Settings keys `employee_statuses`/`employment_statuses` then **hardcode fallback** `active\|probation\|inactive` when MD empty; **no** Nest `GET …/employment-statuses/effective` hook · **no** reason Select for `requires_reason` · list filter `Employees.tsx` hardcode three statuses · `StatusBadge` i18n/hardcode | Nest `emp_employment_status` + `emp_status_reason` L1 · invent **400 `HRM-EMP-STATUS-KEY`** + **400 `HRM-EMP-STATUS-REASON-KEY`** · EFF admin N+1 · CHK DROP · DOCS CH06e |
| **R-PLT-EMP-ST-FE-ADMIN** (named NOTE) | **P2 HOLD RETAIN** | Settings/HRM CFG «Trạng thái NV / Lý do» **admin FE ABSENT or REF-only** (L1 proven via Network API) | Peer ATT-CODE / OT FE-ADMIN HOLD class — **FORBIDDEN invent this seat** |

**Code facts (read-only audit — no apps edit this seat):**

| Layer | Fact | Gap vs AC-01 / VAL-CNS-02 |
|-------|------|---------------------------|
| BE `GET …/employees/employment-statuses/effective` | LIVE F-EMP-CAT-ST-EFF-01 (controller) · QA ST total≥1 baseline | **SEALED** L1 — consumer FE unbound to Nest |
| BE `GET …/status-reasons/effective` | LIVE F-EMP-CAT-STR-EFF-01 | **SEALED** — FE reason picker **ABSENT** |
| BE invent KEY | create/update employee `status` ∈ EFF when count>0 → `HRM-EMP-STATUS-KEY`; reason → `HRM-EMP-STATUS-REASON-KEY` | **SEALED** — FE Settings/hardcode can POST closed-3 only; admin-created open keys **unreachable** from Nest-aware Select |
| FE `EmployeeFormDialog.tsx` ~L534–544 | Settings MD catalog + hardcode fallback 3 | **FAIL class** AC-PLT-EMP-STATUS-01 / VAL-EMP-ST-CNS-02 when Nest EFF>0 |
| FE `Employees.tsx` filter ~L514–523 | Hardcode `active\|probation\|inactive` SelectItem | Filter not Nest EFF when EFF>0 |
| FE hooks | Grep `employment-statuses` / `useEmp*Status*Effective` → **ABSENT** (only form MD path) | Gap = consumer rebind + optional reason companion |
| FE admin status catalog CRUD | Grep Settings «Trạng thái NV» Nest admin → **ABSENT / not this unlock** | FE-ADMIN HOLD — **not** unlock scope |
| FE `status_reason` / `requires_reason` | Grep `apps/web/hrm` → **0 matches** | Companion ADD when selected status requires reason (BA R4) — **in** consumer FE-01, **not** FE-ADMIN |

**Class discrimination (critical):**

| Class | Example | Disposition |
|-------|---------|-------------|
| **Consumer Nest EFF rebind** (surface LIVE + Nest EFF LIVE + AC picker locked) | ATT-CODE FE-01 · OT-TYPE/COMP/SHIFT FE-01 · **THIS residual** | **UNLOCK** Option A |
| **FE-ADMIN / deepen ABSENT panel** (Network L1 OK · product admin FE OUT) | LVRULE FE-01g · OT FE-ADMIN · OTC FE-ADMIN | **ACCEPT_AS_IS_P2 HOLD** — **not** this residual's primary class |
| **Invent / reopen / flip** | Invent admin «while at it» · reopen L1 · invent LVRULE · flip personnel | **REJECT** Option C |

**Failure if unresolved badly:** KEEP forever HOLD while EFF>0 → admin CREATE N+1 green but hồ sơ NV Select still Settings-MD/hardcode-3 sole SoT (VAL-EMP-ST-CNS-02 FAIL-if-claimed) · OR invent Settings admin FE + LVRULE 01g in one Task · OR flip `hrm_personnel_uat_ready` because FE Select rebound · OR claim module EMP UAT.

### 1.2 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** invent LVRULE FE 01g · invent ATT-CODE FE-ADMIN · invent EMP-STATUS FE-ADMIN as mandatory
- **DENY** reopen EMP-STATUS L1 · EMP-CUSTOM CNS · MergeToken EXT · DOC/ET · ATT/SI/CTR
- **DENY** flip personnel / e2e / printable · module EMP UAT · Phase1 · seed
- BA-01 **AC-01*** already exist — this seat is **disposition unlock**, not redefine Nest Option B
- must_keep: **ST/STR KEY** · **EMP-CUSTOM** · **ATT seals** · **LVRULE HOLD**

### 1.3 Decision heuristic

| Rule | Application |
|------|-------------|
| Nest L1 KEY LIVE + consumer FE surface LIVE + AC picker locked → unlock consumer FE | Prefer **A** (peer ATT-CODE / OT/COMP/SHIFT) |
| QC «do not invent FE as L1 mandatory» ≠ forever FE-ADMIN HOLD | L1 seal time deferred Condition; U88 now may unlock **consumer** only |
| ACCEPT_AS_IS HOLD reserved for ABSENT admin / MVP deepen without consumer picker FAIL | LVRULE 01g class — **reject as default here** (consumer form LIVE) |
| REJECT invent admin / reopen seals / flip UAT | **C** |

---

## 2. Options

### Option A — Unlock FE consumer Nest EFF rebind (peer ATT-CODE / OT / COMP / SHIFT) — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Treat **R-PLT-EMP-ST-FE-01** as **named Condition closable** via `dev-fe` ADD-only: add `useEmpEmploymentStatusesEffective` (+ hrmApi `listEffectiveEmploymentStatuses`) and `useEmpStatusReasonsEffective` (+ `listEffectiveStatusReasons`) peer ATT-CODE/OT hooks; rebind `EmployeeFormDialog` status Select (+ list filter on `Employees.tsx` when in-scope) to Nest EFF when **EFF>0**; Settings MD / hardcode-3 **only** when EFF=0; when selected status `requires_reason` (or reason EFF>0 on terminal), show reason Select from Nest STR EFF; surface invent toast on **400 `HRM-EMP-STATUS-KEY`** / **400 `HRM-EMP-STATUS-REASON-KEY`**; empty EFF → CTA Settings / CH06e · **no seed**. Prefer BE `status_label` on list/badge (OS 28). **KEEP** **R-PLT-EMP-ST-FE-ADMIN** as separate **HOLD NOTE** (DENY invent Nest admin CRUD UI). |
| **Benefits** | Closes VAL-EMP-ST-CNS-02 / AC-01 / 01b companion; admin N+1 status/reason become selectable; aligns peer ATT-CODE Option A; HDSD CH06e consumer path matches shipped FE; clears board FE HOLD without inventing admin. |
| **Costs** | One FE Task + QA-FE + QC-FE Condition close; vitest + browser U65. |
| **Risks** | Scope creep into FE-ADMIN or LVRULE invent → mitigate with allowed_paths + DENY list. Reason UX invent beyond form → keep companion Select only. |
| **Gate** | L1 EMPSTQA-MSK20G7H RETAIN · Nest ST/STR EFF LIVE · ba AC RETAIN · honesty false. |

### Option B — ACCEPT_AS_IS_P2 HOLD RETAIN until sponsor opens FE wave

| | |
|--|--|
| **Description** | Keep Condition **R-PLT-EMP-ST-FE-01** as **P2 HOLD / NOTE** forever-until-sponsor (peer LVRULE FE-01g). Do not dispatch `dev-fe`. |
| **Benefits** | Bandwidth for other verticals; zero FE churn. |
| **Costs** | When EFF>0, consumer Select remains Settings-MD/hardcode-3 sole SoT → **documented FAIL-if-claimed** on AC-01 / VAL-CNS-02; CH06e consumer path unproven on FE; board residual stalls after Nest L1+KEY LIVE — same class ATT-CODE already unlocked. |
| **Risks** | Misread HOLD as «AC-01 waived» or as FE-ADMIN class forever · sponsor sees admin CREATE green but hồ sơ cannot pick Nest codes. |
| **Gate** | **Reject as default** — unlike LVRULE, consumer surface + Nest EFF + AC picker already exist; QC HOLD was L1-mandatory deferral, not FE-ADMIN ABSENT. Retain B only if sponsor **explicitly** says defer EMP-STATUS FE. |

### Option C — Hybrid invent admin / invent LVRULE / reopen L1 / flip personnel

| | |
|--|--|
| **Description** | Invent Settings «Trạng thái NV» admin FE + LVRULE 01g + ATT-CODE FE-ADMIN «while at it»; or reopen EMP-STATUS L1 / EMP-CUSTOM; or flip `hrm_personnel_uat_ready` / claim module EMP UAT / seed density. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Seal churn · C-SLICE violation · sponsor trust. |
| **Risks** | **REJECT** — DENY invent FE-ADMIN · DENY invent LVRULE 01g · DENY reopen L1/EMP-CUSTOM/EXT · DENY ready flip · DENY seed · DENY module EMP UAT. |

---

## 3. Trade-off matrix

| Criteria | Weight | **A Unlock consumer FE** | B ACCEPT HOLD P2 | C Invent/reopen/flip |
|----------|-------:|-------------------------:|-----------------:|---------------------:|
| AC-01 / VAL-CNS-02 honesty | 5 | **5** | 1 | 0 |
| Peer ATT-CODE / OT/COMP class fit | 5 | **5** | 2 | 0 |
| Seal safety (ST L1·EMP-CUSTOM·EXT·ATT·LVRULE) | 5 | **5** | **5** | 0 |
| Deny invent FE-ADMIN / LVRULE 01g | 5 | **5** | **5** | 0 |
| Business value (admin N+1 usable on hồ sơ) | 4 | **5** | 1 | 1 |
| Blast radius / complexity | 4 | 4 | **5** | 0 |
| U88 continuous (close named residual) | 4 | **5** | 2 | 0 |
| **Weighted** | | **154** | 91 | 4 |

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| **A** | FE invents admin catalog panel + consumer in one Task | Diff Settings Nest ST/STR CRUD | **FORBIDDEN** · allowed_paths = form + list filter + hooks + hrmApi EFF only · FE-ADMIN HOLD RETAIN |
| **A** | Touches LVRULE / ATT-CODE FE-ADMIN / EMP-CUSTOM | Diff LeaveTab / AttendanceRecordsTable admin / extension | DENY paths · cite LVRULE HOLD + EMP-CUSTOM SEAL |
| **A** | Claims module EMP UAT after Select rebind | Honesty matrix | **L-EMP-ST-FE-08** C-SLICE · personnel=false |
| **A** | Keeps Settings MD as sole SoT when Nest EFF>0 | QA VAL-CNS-02 | Rebind Nest EFF; Settings = REF only when EFF>0 |
| **A** | Omits KEY toast / reason when required | QA 01b / STR-CNS-01 | Exit criteria invent toast ST + STR |
| B | HOLD forever while EFF>0 | Board stall + VAL-CNS-02 | Prefer A; B only sponsor-explicit defer |
| C | Ready flip / seal reopen | Honesty / stamp | DENY · NO-GO process |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option A** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Disposition** | **UNLOCK** Condition **R-PLT-EMP-ST-FE-01** → **dev-fe** Nest EFF consumer rebind |
| **Why A** | Nest L1 KEY + ST/STR EFF LIVE; consumer `EmployeeFormDialog` LIVE with Settings-MD/hardcode-3 sole Select; BA AC-01 / VAL-CNS-02 require Nest picker when EFF>0; peer **ATT-CODE FE-SA Option A** already proved same class; QC FE HOLD was «not L1-mandatory invent», not FE-ADMIN ABSENT class (contrast LVRULE 01g — panel MVP + admin FE ABSENT). |
| **Rejected** | **B** as default ACCEPT_AS_IS (wrong class) · **C** invent admin / reopen / flip |
| **Assumptions** | Sponsor/PM U88 asks disposition now (this message R2) · EMP-STATUS L1 stays SEALED · EMP-CUSTOM/EXT stay SEAL · LVRULE 01g stays ACCEPT_AS_IS HOLD · FE-ADMIN EMP-STATUS stays HOLD |

### 5.1 Unlock gates (what Option A opens / does not)

| Question | Answer |
|----------|--------|
| Unlock ba-process new AC pack? | **HOLD** — AC-01* already in BA-01 · **no** duplicate BA seat |
| Unlock ba-data / BE L1 reopen? | **FORBIDDEN** — L1 EMPSTQA-MSK20G7H **RETAIN** · cấm reopen invent KEY |
| Unlock FE consumer Nest EFF? | **YES** — `dev-fe` FE-01 |
| Unlock FE-ADMIN Settings Nest ST/STR CRUD? | **HOLD / FORBIDDEN invent** this seat (`R-PLT-EMP-ST-FE-ADMIN`) |
| Unlock LVRULE FE 01g / ATT-CODE FE-ADMIN? | **FORBIDDEN** |
| May PM flip personnel / e2e / printable / claim module EMP UAT? | **NO** |
| May PM remove L1 seal / EMP-CUSTOM seal? | **NO** |

### 5.2 FE bind contract (copy for dev-fe)

```text
EFF status >0:
  - EmployeeFormDialog status Select options = GET /employees/employment-statuses/effective
    (status_key + name_vi display-ready; sort_order; flags requires_reason / is_terminal as display hints only)
  - Submit create/update status = Nest status_key (BE KEY assert live)
  - List filter Employees.tsx prefer Nest EFF codes when EFF>0 (bootstrap 3 only EFF=0)
  - Badge/label prefer BE status_label; no invent join Settings when EFF>0
  - When requires_reason or (reason EFF>0 on transition): reason Select = GET …/status-reasons/effective
    (filter applies_to if API returns); submit reason_key
EFF status =0:
  - Bootstrap active|probation|inactive (+ hint CTA Settings / CH06e)
  - invent assert soft-skip (BE) · no seed · no hardcode-as-SoT claim
Negative:
  - invent status when EFF>0 → Network 400 HRM-EMP-STATUS-KEY + VI toast
  - invent reason when required / reason EFF>0 → Network 400 HRM-EMP-STATUS-REASON-KEY + VI toast
must_keep:
  - ST/STR KEY constants · EMP-CUSTOM CNS · EXT · DOC/ET · ATT seals · LVRULE HOLD
  - no FE-ADMIN invent · no L1 reopen · no personnel flip
honesty: hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false · contracts_printable_ready=false · C-SLICE
```

### 5.3 allowed_paths (UNLOCK FE-01)

```text
allowed_paths:
  - apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx
  - apps/web/hrm/src/pages/Employees.tsx (status filter only)
  - apps/web/hrm/src/components/common/StatusBadge.tsx (prefer status_label / catalog label — optional narrow)
  - apps/web/hrm/src/hooks/useEmpEmploymentStatusesEffective.ts (+ .test.ts)
  - apps/web/hrm/src/hooks/useEmpStatusReasonsEffective.ts (+ .test.ts)
  - apps/web/hrm/src/integrations/hrmApi.ts (listEffectiveEmploymentStatuses + listEffectiveStatusReasons only)
  - apps/web/hrm/src/lib/empEmploymentStatusCatalog.ts (+ .test.ts) optional helper
forbidden_paths:
  - apps/api/** · Settings admin Nest ST/STR invent CRUD · LeaveTab LVRULE · AttendanceRecordsTable FE-ADMIN
  - EMP-CUSTOM extension · MergeToken EXT · seed scripts · mobile (OUT this FE-01 unless sponsor expands)
```

---

## 6. Locks (L-EMP-ST-FE-*)

| Lock | Rule |
|------|------|
| **L-EMP-ST-FE-01 Consumer ≠ Admin** | Unlock **consumer** Select only · **FORBIDDEN** invent Settings Nest admin FE this seat |
| **L-EMP-ST-FE-02 Nest EFF SoT when >0** | FORBIDDEN Settings-MD / hardcode-3 sole SoT when Nest EFF>0 (**L-EMP-ST-01** · VAL-CNS-02) |
| **L-EMP-ST-FE-03 Bootstrap EFF=0** | Hardcode / MD OK **only** EFF=0 · empty CTA · no seed (**AC-01c**) |
| **L-EMP-ST-FE-04 Invent KEY surface** | EFF>0 invent status → toast + Network **`HRM-EMP-STATUS-KEY`**; reason → **`HRM-EMP-STATUS-REASON-KEY`** (orthogonal · cấm gộp · ≠ ATT/OT KEY) |
| **L-EMP-ST-FE-05 Reason companion** | When `requires_reason` / reason EFF>0 → Nest STR picker; free-text SoT **FORBIDDEN** in that class |
| **L-EMP-ST-FE-06 Seals RETAIN** | EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR · DOCS CH06e · LVRULE 01g HOLD |
| **L-EMP-ST-FE-07 DENY invent peers** | **FORBIDDEN** invent LVRULE FE 01g · ATT-CODE FE-ADMIN · EMP-STATUS FE-ADMIN · reopen L1 |
| **L-EMP-ST-FE-08 Honesty / C-SLICE** | personnel/e2e/printable=false · FE unlock ≠ module EMP UAT · Phase1 |
| **L-EMP-ST-FE-09 Peer class** | Cite **ATT-CODE FE-SA Option A** consumer — **not** LVRULE ACCEPT_AS_IS class |
| **L-EMP-ST-FE-10 Path** | Writes only NFD tree `.git`+`apps` True · WriteAllText UTF-8 no BOM |

```text
  Nest emp_employment_status + emp_status_reason L1 + KEY + EFF  ──► SEALED (QC-01 · DOCS CH06e)
  EmployeeFormDialog status Select Settings/hardcode               ──► UNLOCK FE Nest EFF (this seat → dev-fe)
  Reason Select when requires_reason                               ──► ADD companion Nest STR EFF (consumer)
  Settings admin Nest ST/STR CRUD FE                               ──► ABSENT HOLD (FE-ADMIN NOTE)
  LVRULE FE-01g / ATT-CODE FE-ADMIN                                ──► HOLD RETAIN (FORBIDDEN invent)
  EMP-CUSTOM / EXT / DOC-ET / ATT/SI/CTR                           ──► SEAL RETAIN
  personnel_uat / e2e / printable                                  ──► false LOCKED
```

---

## 7. Impacted systems & non-goals

| In scope (docs disposition + unlock FE consumer) | OUT / FORBIDDEN |
|--------------------------------------------------|-----------------|
| Option A/B/C + LOCKED A · next_dispatch **dev-fe** | `apps/**` this SA seat · migration · seed |
| Cite BA AC-01* RETAIN · peer ATT-CODE FE pattern | Invent FE-ADMIN Settings Nest ST/STR |
| Name FE-ADMIN HOLD residual separately | Invent LVRULE 01g · invent ATT-CODE FE-ADMIN |
| Reason companion Select on form when required | Full status-machine rewrite · mobile mandatory this seat |
| U88 PM → FE → QA-FE → QC-FE Condition close | Flip ready · reopen L1/EMP-CUSTOM · module EMP UAT |

---

## 8. Validation / acceptance evidence plan

| Checkpoint | PASS when |
|------------|-----------|
| Spec Length ≥4000 on NFD `.git` toplevel | This file |
| Evidence Length ≥3000 | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-sa-01.md` |
| Option LOCKED | **A** UNLOCK FE consumer Nest EFF |
| next_dispatch | **dev-fe** `…-EMP-STATUS-CATALOG-FE-01` (not HOLD-only; not FE-ADMIN) |
| Honesty | personnel/e2e/printable=false · C-SLICE · DENY LVRULE/ATT FE-ADMIN invent · ST/STR KEY + EMP-CUSTOM + ATT seals RETAIN |

---

## 9. completion_report

**Closed:** Narrow SA Option/F.1 for **R-PLT-EMP-ST-FE-01** (R2 after INVALID empty) — inventory consumer Settings/hardcode Select vs Nest ST/STR EFF LIVE · class = peer **ATT-CODE FE Option A** consumer rebind (**≠** LVRULE ACCEPT_AS_IS) · Option **A/B/C** · trade-off · **Option A LOCKED UNLOCK FE** · FE-ADMIN EMP-STATUS **HOLD RETAIN** · DENY invent LVRULE 01g / ATT-CODE FE-ADMIN · DENY reopen L1/EMP-CUSTOM/EXT · honesty false · C-SLICE · no `apps/**`.

**Open / residual:** Condition **R-PLT-EMP-ST-FE-01** → **dev-fe** execution; **R-PLT-EMP-ST-FE-ADMIN** remains HOLD NOTE; LVRULE 01g ACCEPT_AS_IS HOLD RETAIN; ready flags false.

**next_owner:** **pm** → Task **dev-fe**

**ack_status:** **PASS_TO_PM** · **CONFIRMED**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-sa-01.md`

### next_dispatch_prompt (copy-ready — UNLOCK FE)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
change_mode: ADD
entry_criteria:
  - EMP-STATUS L1 SEAL RETAIN EMPSTQA-MSK20G7H · DOCS CH06e ACCEPT
  - SA FE Option A LOCKED — docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md
  - Nest GET …/employment-statuses/effective + …/status-reasons/effective LIVE
  - peer pattern: ATT-CODE / OT-TYPE / OT-COMP FE Nest EFF hooks
  - U65 zero-seed · browser-only later QA
exit_criteria:
  - EmployeeFormDialog status Select binds Nest ST EFF when EFF>0 (status_key+name_vi)
  - EFF=0 bootstrap active|probation|inactive + empty CTA · no seed
  - reason Select when requires_reason / reason EFF>0 from Nest STR EFF
  - submit Nest keys; invent → toast 400 HRM-EMP-STATUS-KEY / HRM-EMP-STATUS-REASON-KEY
  - Employees.tsx status filter prefer Nest EFF when EFF>0
  - prefer BE status_label on badge/list
  - vitest hook+bind PASS · eslint/build touched paths PASS
  - CODE-MEMORY APPEND · solid_convention_ack display-ready
  - DENY invent FE-ADMIN Nest ST/STR · DENY invent LVRULE 01g · DENY invent ATT-CODE FE-ADMIN
  - DENY reopen EMP-STATUS L1 / EMP-CUSTOM / EXT · DENY flip personnel/e2e/printable · DENY module EMP UAT
allowed_paths:
  - apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx
  - apps/web/hrm/src/pages/Employees.tsx (status filter only)
  - apps/web/hrm/src/components/common/StatusBadge.tsx (optional narrow)
  - apps/web/hrm/src/hooks/useEmpEmploymentStatusesEffective.ts (+test)
  - apps/web/hrm/src/hooks/useEmpStatusReasonsEffective.ts (+test)
  - apps/web/hrm/src/integrations/hrmApi.ts (EFF list only)
  - apps/web/hrm/src/lib/empEmploymentStatusCatalog.ts (+test) optional
forbidden_paths:
  - apps/api/** · Settings admin Nest ST/STR invent · LeaveTab LVRULE · ATT FE-ADMIN · EMP-CUSTOM/EXT · seed
must_keep:
  - HRM-EMP-STATUS-KEY · HRM-EMP-STATUS-REASON-KEY · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT seals · LVRULE HOLD
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-fe-01.md
ack_status_target: READY_FOR_QA
spec_ref:
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md (Option A LOCKED)
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md AC-PLT-EMP-STATUS-01*
read_first: SA FE-01 · BA-01 AC-01* · peer att-code-fe-sa-01 · qc-01 residual R-PLT-EMP-ST-FE-01
```

**DENY alternate:** invent `…-EMP-STATUS FE-ADMIN` · invent LVRULE FE-01g · invent ATT-CODE FE-ADMIN · reopen L1 · flip `hrm_personnel_uat_ready` · claim module EMP UAT from FE Select alone.