# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **lane** | governance |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01` **CONFIRMED** Option **A** |
| **Date** | 2026-08-08 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md) Option A · L-EMP-CF-* · §7 |
| **ref_ext** | EXT-BA AC-PLT-EMP-TOK-04* **CONFIRMED** · EXT-QC stamp **`EMPTOKEXTQA-MSJ57PE1`** · **`R-EMP-TOK-EXT` SEALED** — **RETAIN / cite only** |
| **ref_platform** | PLATFORM-BA-01 **BR-PLT-01/02/04/05** · EMP §2.1 · CORE-02b · Q-PLT-05 |
| **U65** | zero-seed · no `apps/**` · ba-data **HOLD** · **DENIED** Nest field-def · **DENIED** reopen EXT |

### Honesty locks (mandatory)

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** LOCKED |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `contracts_printable_ready` | **false** LOCKED |
| MergeToken EMP EXT · `R-EMP-TOK-EXT` | **SEAL RETAIN** — **cấm reopen** |
| ATT worksite GWC · ATT-LEAVE · SI · CTR · enrollment · DOC/ET | **SEAL RETAIN** |
| Module EMP UAT / Phase1 | **DENIED** |
| Nest `emp_custom_field` / mega-EAV | **DENIED** |
| `C-SLICE-≠-MODULE` | retained |
| ba-data EXPAND | **HOLD / FORBIDDEN** |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | EMP-CUSTOM-FIELD-SA-01 | Option **A LOCKED** · L-EMP-CF-01..13 · F.1 · AC draft §7 · ba-data HOLD · BE CNS HOLD until BA |
| 2 | EMP-CUSTOM-FIELD-SA-01 evidence | CONFIRMED · unlock ba-process · REJECT Nest field-def / mega-EAV |
| 3 | MERGE-TOKEN-EMP-EXT-BA-01 | AC-PLT-EMP-TOK-04/04b/04c CONFIRMED · allow-list · value≠register |
| 4 | MERGE-TOKEN-EMP-EXT-QC-01 | GWC **`EMPTOKEXTQA-MSJ57PE1`** · **`R-EMP-TOK-EXT` SEALED** — retain smoke for **01b** |
| 5 | PLATFORM-BA-01 | **BR-PLT-01** auto-register · **BR-PLT-02** picker when EFF>0 · **BR-PLT-04** soft-delete · **BR-PLT-05** open N+1 · Q-PLT-05 EMP after PAY |
| 6 | Peer ATT-WORKSITE / PAY / SI BA packs | admin open ≠ consumer invent pattern — EMP SoT = Settings extension (≠ Nest SC) |

**no_prompt_echo:** team-internal AC pack — không dán chat Sponsor vào tài liệu khách.

**RETAIN seals stamped:** MergeToken EMP EXT · ATT worksite GWC · ATT-LEAVE · SI · CTR · enrollment · DOC/ET — **not reopened**.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| Spec | AC-PLT-EMP-CUSTOM-01 / 01b / 01c / 01d / 01e / 01H · UC-PLT-EMP-CF-* · BR-PLT-EMP-CF-01..12 · VAL-EMP-CF-CNS-01..07 · allow-list · surfaces · sequenceDiagram · OUT matrix · unlock gates |
| This evidence | CONFIRMED stamp · handoff · honesty · gap residual |

**Không đụng:** `apps/**` · seed · Nest field-def physical · reopen EXT/ATT/SI/CTR · flip personnel · invent module EMP UAT · Phase1 DONE.

---

## 3. AC stamp summary (CONFIRMED)

| ID | Intent | Cite |
|----|--------|------|
| **AC-PLT-EMP-CUSTOM-01** | Settings allow-list EMP field catalogs → admin CREATE extension-item N+1 → Lưu 2xx → F5 field visible / schema bind | BR-PLT-05 · L-EMP-CF-01/03 · F-EMP-CF-02 |
| **AC-PLT-EMP-CUSTOM-01b** | Same save → F5 merge-tokens `custom.emp.<code>` `origin=extension_field` — **RETAIN smoke** cite **AC-PLT-EMP-TOK-04** · stamp `EMPTOKEXTQA-MSJ57PE1` · **cấm reopen EXT suite** | BR-PLT-01 · F-EMP-TOK-03 · EXT QC GWC |
| **AC-PLT-EMP-CUSTOM-01c** | EFF>0 · consumer invent unknown extension code → **`HRM-EMP-CUSTOM-FIELD-KEY`** | BR-PLT-02 · L-EMP-CF-05 · F-EMP-CF-CNS-01 |
| **AC-PLT-EMP-CUSTOM-01d** | EFF=0 · invent assert skip · CTA Settings · **no seed** · admin still CREATE | L-EMP-CF-06 · peer empty-catalog |
| **AC-PLT-EMP-CUSTOM-01e** | Soft-retire field → picker hide + token retired · history OK | BR-PLT-04 · EXT-04-RETIRE RETAIN |
| **AC-PLT-EMP-CUSTOM-01H** | Honesty false · seals retain · C-SLICE-≠-MODULE · DENY Nest field-def / mega-EAV / personnel / module EMP UAT | SA §8 · EXT QC |

### VAL-EMP-CF-CNS-* (summary)

| VAL | Expect | Gap stamp |
|-----|--------|-----------|
| **CNS-01** | Invent → KEY when EFF>0 | **BE GAP if missing** — unlock only if FAIL |
| **CNS-02** | Empty skip + CTA no seed | FE CTA verify |
| **CNS-03** | Soft-retire hide / KEY on retired | RETAIN + deepen if picker leaks |
| **CNS-04** | Non-allow-list no token | **EXT-04b RETAIN** |
| **CNS-05** | Value PATCH alone no token | **EXT-04c RETAIN** |
| **CNS-06** | Scope parity | RETAIN deepen if FAIL |
| **CNS-07** | ESS narrow | GAP only if ESS writes extension keys |

### Click path (01 — copy for QA)

```text
Login → Settings → EMP field catalog ∈ {hrm_employee_basic_fields|personal|work|finance (+aliases)}
  → Append extension-item (code + label vi, active) → Lưu → FE after 2xx → F5 field còn
  → (01b RETAIN smoke) F5 / GET /api/hrm/merge-tokens?domain=EMP → custom.emp.<code> origin=extension_field
  → (01c) Employees form EFF>0 → Lưu invent unknown extension code → 4xx HRM-EMP-CUSTOM-FIELD-KEY
  → (01d) EFF=0 → soft empty + CTA · no invent fail · no seed
  → (01e) Retire item → picker hide + token retired · history OK
Negatives RETAIN: EXT-04b non-allow-list · EXT-04c value PATCH alone → no token
OUT: Nest emp_custom_field · mega-EAV · personnel flip · reopen EXT/ATT/SI/CTR · module EMP UAT · seed
```

---

## 4. Quality gates (ba-process)

| Check | Result |
|-------|--------|
| Align SA Option A · no Nest field-def | **PASS** |
| Cite BR-PLT-01/02/04/05 · F-EMP-TOK-03 · EXT AC-04 SEALED | **PASS** |
| Admin open N+1 ≠ consumer invent KEY | **PASS** |
| 01b = retain smoke · **no reopen EXT suite** | **PASS** |
| Empty EFF + soft-retire + honesty 01H | **PASS** |
| Explicit OUT matrix (Nest / mega-EAV / seals / UAT / seed) | **PASS** |
| U65 browser click paths measurable | **PASS** |
| ba-data HOLD (no EXPAND) | **PASS** |
| BE unlock = CNS only if GAP | **PASS** |
| No apps/** · no seed · honesty false | **PASS** |
| ATT / SI / CTR / enrollment / DOC/ET retain | **PASS** |

**Verdict:** **CONFIRMED** (not HOLD-WITH-RATIONALE) — SA Option A + sealed EXT provide complete AC surface; residual = implementation GAP probe only.

---

## 5. completion_report

**Closed:** CONFIRMED BA AC pack for EMP custom-field open catalog Option A — **AC-PLT-EMP-CUSTOM-01 / 01b / 01c / 01d / 01e / 01H** + **VAL-EMP-CF-CNS-01..07**, allow-list surfaces, BR-PLT-EMP-CF-*, U65 click paths, **01b RETAIN smoke** citing sealed **AC-PLT-EMP-TOK-04*** (`EMPTOKEXTQA-MSJ57PE1` / `R-EMP-TOK-EXT` CLOSED), invent KEY class, empty/soft-retire, OUT Nest field-def / mega-EAV / reopen seals / personnel / module EMP UAT / seed, ba-data HOLD, BE CNS unlock-only-if-GAP.

**Residual / open:** PM probe **R-EMP-CF-CNS-01** (Employees invent assert present?) → if GAP **dev-be** F-EMP-CF-CNS-* only (cấm reopen EXT BE); **dev-fe** bind/CTA; then QA U65 → QC narrow. **Not closed:** personnel UAT · printable · Phase1 · module EMP DONE · Nest field-def.

**Forbidden claims:** reopen MergeToken EXT · flip ready · seed · `C-SLICE=MODULE` · invent Nest `emp_custom_field`.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → gap probe → **`dev-be`** (CNS only if GAP) and/or **`dev-fe`** → **`qa`**

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-CNS-GAP-01
from_role: pm
to_role: qa
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01 CONFIRMED · SA-01 Option A LOCKED

## entry_criteria
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md (AC pack CONFIRMED)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-ba-01.md
- Read retain: MERGE-TOKEN-EMP-EXT QC stamp EMPTOKEXTQA-MSJ57PE1 — cấm reopen EXT suite
- Honesty false · C-SLICE-≠-MODULE · U65 zero-seed
- RETAIN: MergeToken EMP EXT · ATT worksite · ATT-LEAVE · SI · CTR · enrollment · DOC/ET

## task
Probe GAP for VAL-EMP-CF-CNS-01 only (L1 phụ OK for gap triage — not UF 🟢):
1) When EFF active EMP extension defs >0, does Employees create/update reject invent extension code with 4xx HRM-EMP-CUSTOM-FIELD-KEY?
2) Stamp PASS (no BE unlock) or FAIL_GAP → PM dispatch PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01 (F-EMP-CF-CNS-* only · must_keep F-EMP-TOK-03 · cấm reopen EXT BE · cấm Nest emp_custom_field)
3) Spot FE: empty EFF CTA + picker bind (note FE GAP if missing — do not invent FE without PM)
4) Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-cns-gap-01.md

## cấm
apps/** invent without BE seat · seed · flip personnel · reopen EXT/ATT/SI/CTR · Nest field-def · module EMP UAT · Phase1 DONE · claim AC-04 reopen

## exit
PASS_TO_PM with GAP verdict · next_dispatch_prompt for BE or FE or QA full U65 AC-PLT-EMP-CUSTOM-01*
```

**Alternate if GAP already known FAIL (skip probe):**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01 CONFIRMED · Option A
program: PO-HRM-CONTINUOUS-W8-20260807

## task
Implement F-EMP-CF-CNS-01 invent KEY only when EFF>0 (HRM-EMP-CUSTOM-FIELD-KEY); empty EFF skip; soft-retire align; must_keep F-EMP-TOK-03 / Settings extension-items admin CREATE; jest VAL-EMP-CF-CNS-01/02/03/06; cấm reopen EXT BE · cấm Nest emp_custom_field · cấm seed · READY_FOR_QA

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-be-01.md
```

---

## 7. evidence_path / ack_status

| Field | Value |
|-------|--------|
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-ba-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
