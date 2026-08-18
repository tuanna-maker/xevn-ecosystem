# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — docs-only Option/F.1 · **NO** `apps/**` · **NO** seed |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | EMP-STATUS-CATALOG-QC-01 **GWC L1** · stamp **`EMPSTQA-MSK20G7H`** · U88 · BA-01 §2.1 Chức danh/phòng ban P0 (WH free-text **F**) |
| **Verdict** | **CONFIRMED** — Option **A LOCKED** (Settings/XBOS `job_titles` effective = open position catalog SoT · Nest `emp_position` DENY · dept OUT follow-on) |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md) |
| **ref_ba_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 position/dept · **AC-PLT-EMP-01** · BR-PLT-02/04/05/06 |
| **ref_qc_prior** | [`emp-status-catalog-qc-01`](po-hrm-dynamic-config-platform-emp-status-catalog-qc-01.md) GWC L1 · `EMPSTQA-MSK20G7H` · EMP-CUSTOM `EMPCFQA-MSK14LUH` · EXT `EMPTOKEXTQA-MSJ57PE1` **RETAIN** |
| **ref_peer** | EMP-CUSTOM Option A (cite class) · EMP-STATUS Option B (cite ≠ copy) · EMP VERTICAL L-EMP-CAT-05 · DOC/ET · ATT/SI |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · printable **false** · **`C-SLICE-≠-MODULE`** |

---

## 1. Entry criteria audit

| Criterion | Result |
|-----------|--------|
| Read platform BA-01 §2.1 position/dept + BR-PLT-* | ✅ P0 WH free-text **F** · AC-PLT-EMP-01 · BR-PLT-02/04/05/06 |
| Read peer EMP-STATUS B · EMP DOC-ET · EMP-CUSTOM A | ✅ STATUS=Nest DEFINE; CUSTOM=Settings LIVE deepen; VERTICAL OUT Nest position |
| Read AS-IS WH free-text · picker · Nest presence/absence | ✅ asserts LIVE on `job_titles`; Nest `emp_position` **ABSENT** (intentional) |
| Honesty false · C-SLICE-≠-MODULE | ✅ stamped |
| RETAIN EMP-STATUS L1 · EMP-CUSTOM · EXT · DOC/ET · ATT/SI/CTR | ✅ **no reopen** |
| No `apps/**` · no seed · no flip ready · no invent EMP UAT · no EMP-STATUS FE | ✅ |

---

## 2. AS-IS facts (repo evidence)

| Layer | Fact |
|-------|------|
| Catalog SoT | Settings-catalogs storageKey **`job_titles`** (aliases `positions` / `employee_positions`) · XBOS sync + HRM extension merge **LIVE** |
| WH | `employee-profile.service` `assertWhPositionKey` → `job_titles` · codes **`HRM-WH-PICK-REQUIRED`** / **`HRM-WH-PICK-EMPTY-CATALOG`** · free-text alone forbidden |
| EMP | `employees.service` `assertJobTitleKeyInCatalog` ∈ `job_titles` |
| CTR / DEC | `position_key` / `signer_position_key` assert ∈ `job_titles` |
| Nest `emp_position` | **ABSENT** — EMP VERTICAL **L-EMP-CAT-05** + client DB/API **OUT** dual master |
| BA residual | AC-PLT-EMP-01 named pack + WH **F** stamp — deepen bind/AC, not Nest DEFINE |
| Orthogonal LIVE | EMP-STATUS Nest L1 · EMP-CUSTOM Option A · MergeToken EXT · DOC/ET — **must_keep** |

---

## 3. Option evaluation (summary)

| Option | Verdict |
|--------|---------|
| **A** Settings/XBOS `job_titles` = open position SoT · admin N+1 · consumer invent **`HRM-EMP-POSITION-KEY`** | **LOCK / CONFIRMED** — producer LIVE · peer EMP-CUSTOM A class · EMP VERTICAL must_keep |
| **B** Nest `emp_position` DEFINE · Settings REF | **REJECT** — dual master vs XBOS · L-EMP-CAT-05 |
| **C** Hybrid / mega-EAV / fold into custom·status / UAT invent / reopen seals / MD-alone-when-Nest-needed | **REJECT** |

**Weighted:** **A 116** · B 36 · C 8 (see spec §3).

**Why not EMP-STATUS Option B here:** status had Nest absent + hardcode/CHECK; position has LIVE Settings/XBOS producer and Nest invent is **forbidden** — cite Option B pattern only for admin≠consumer split, **not** Nest DEFINE.

**Dept:** same Option A architecture · **OUT** primary AC → follow-on WI.

---

## 4. F.1 / unlock

| Item | State |
|------|-------|
| F-EMP-CAT-POS-01..03 / EFF-01 | DEFINED (docs) — cite LIVE Settings/XBOS · **no** Nest table |
| F-EMP-POS-CNS-01..04 | DEFINED — BE after BA if GAP |
| Errors | **`HRM-EMP-POSITION-KEY`** ≡ **`HRM-WH-PICK-REQUIRED`** · empty **`HRM-WH-PICK-EMPTY-CATALOG`** |
| ba-process | **UNLOCK** `…-EMP-POSITION-CATALOG-BA-01` |
| ba-data | **HOLD** — no Nest ADD |
| BE / FE | **HOLD** until BA · GAP-only · **cấm** Nest · **cấm** EMP-STATUS FE invent |

---

## 5. Honesty / OUT

| Item | Rule |
|------|------|
| `hrm_personnel_uat_ready` / e2e / printable | **false LOCKED** |
| Nest `emp_position` | **DENIED** |
| Reopen EMP-STATUS / CUSTOM / EXT / DOC-ET / ATT / SI / CTR | **DENIED** |
| Invent FE EMP-STATUS HOLD | **DENIED** |
| Seed / module EMP UAT / Phase1 DONE | **DENIED** |
| **C-SLICE-≠-MODULE** | **LOCKED** |

---

## 6. Handoff

### completion_report

Closed: docs-only Option **A CONFIRMED LOCKED** for EMP **position** catalog — Settings/XBOS `job_titles` = SoT; admin CREATE/sync N+1 ≠ consumer invent **`HRM-EMP-POSITION-KEY`**; empty CTA / no seed; Nest `emp_position` / Option B Nest / Option C fold·mega-EAV·reopen·UAT invent **REJECT**; dept companion architecture A **OUT** follow-on; EMP-STATUS L1 · EMP-CUSTOM · EXT · DOC/ET · ATT/SI/CTR **RETAIN**; ba-data **HOLD**; ba-process **UNLOCK**; BE HOLD; honesty false · **C-SLICE-≠-MODULE**; no `apps/**`.

Residual: BA AC pack AC-PLT-EMP-01*; BE/FE only after BA if GAP; dept follow-on WI.

### next_owner

`ba-process`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: EMP-POSITION-CATALOG-SA-01 Option A LOCKED · U88 after EMP-STATUS QC GWC L1

## entry_criteria
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md (Option A LOCK · L-EMP-POS-* · F.1 · AC draft)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-sa-01.md
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md §2.1 AC-PLT-EMP-01 · BR-PLT-02/04/05/06
- Cite peer EMP-CUSTOM BA Option A (admin open ≠ consumer invent) — cite ≠ copy Nest EMP-STATUS BA
- RETAIN: EMP-STATUS EMPSTQA-MSK20G7H · EMP-CUSTOM EMPCFQA-MSK14LUH · EXT EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR
- Honesty false · C-SLICE-≠-MODULE · U65 zero-seed

## task (governance — NO apps/** · no seed)
Confirm AC pack AC-PLT-EMP-01 / 01b / 01c / 01d / 01e / 01H + VAL-EMP-POS-CNS-*:
- SoT = Settings/XBOS job_titles effective (Option A)
- Admin CREATE/sync N+1 open (01d)
- Consumer invent → HRM-EMP-POSITION-KEY (≡ HRM-WH-PICK-REQUIRED class) when EFF>0 (01b)
- Empty EFF → CTA · HRM-WH-PICK-EMPTY-CATALOG · no seed · free-text FORBIDDEN (01c)
- Soft-retire picker hide · history OK (01e)
- Honesty 01H · DENY Nest emp_position · DENY fold custom/status · DENY reopen seals · DENY personnel flip · DENY invent EMP-STATUS FE
- Dept AC = OUT follow-on (same Option A architecture only)
- ba-data HOLD · BE HOLD until this BA CONFIRMED (then GAP-only)

## deliverables
- Spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-ba-01.md
- Verdict CONFIRMED · PASS_TO_PM · next_dispatch_prompt (BE if GAP else QA plan / dept follow-on note)

## cấm
apps/** · seed · Nest emp_position · reopen EMP-STATUS/CUSTOM/EXT · flip personnel · module EMP UAT · Phase1 DONE · invent EMP-STATUS FE

## exit
CONFIRMED AC pack · PASS_TO_PM · full handoff
```

### ack_status

`PASS_TO_PM`

---

## 7. Files touched (governance only)

| Path | Action |
|------|--------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md` | ADD |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-sa-01.md` | ADD |
| `apps/**` | **NONE** |
