# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — docs-only Option/F.1 · **NO** `apps/**` · **NO** seed |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | EMP-POSITION-CATALOG-QC-01 **GWC L1** · stamp **`EMPPOSQA2-MSK3CDH1`** · **R-EMP-POS-DEPT-01** OUT Condition · U88 · BA-01 §2.1 phòng ban companion |
| **Verdict** | **CONFIRMED** — Option **A LOCKED** (Settings/XBOS `departments` effective = open department catalog SoT · Nest `emp_department` DENY · Nest `emp_position` DENY · peer position Option A cite class) |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md) |
| **ref_ba_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 position/dept · BR-PLT-02/04/05/06 |
| **ref_qc_prior** | [`emp-position-catalog-qc-01`](po-hrm-dynamic-config-platform-emp-position-catalog-qc-01.md) GWC · `EMPPOSQA2-MSK3CDH1` · R-EMP-POS-DEPT-01 OUT · EMP-STATUS `EMPSTQA-MSK20G7H` · EMP-CUSTOM `EMPCFQA-MSK14LUH` · EXT `EMPTOKEXTQA-MSJ57PE1` **RETAIN** |
| **ref_peer_sa** | [`EMP-POSITION-CATALOG-SA-01`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md) Option **A** `job_titles` — **cite class** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · printable **false** · **`C-SLICE-≠-MODULE`** |

---

## 1. Entry criteria audit

| Criterion | Result |
|-----------|--------|
| Read position QC-01 dept OUT Condition (R-EMP-POS-DEPT-01) | ✅ CONDITION/OUT follow-on · same Option A architecture note |
| Read EMP-POSITION-CATALOG-SA-01 Option A (`job_titles`) | ✅ cite class — LIVE Settings/XBOS producer → deepen A · Nest DENY |
| Read BA-01 §2.1 phòng ban / position-dept row | ✅ P0 Catalog picker · empty → CTA Settings · BR-PLT-02/04/05/06 |
| AS-IS org units / departments Settings or XBOS LIVE vs Nest absent | ✅ Settings/XBOS `departments` **LIVE**; Nest `emp_department` catalog **ABSENT**; Nest `public.departments` org-tree **exists** but **≠** invent SoT |
| Honesty false · C-SLICE-≠-MODULE · U65 | ✅ stamped |
| RETAIN EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR | ✅ **no reopen** |
| No `apps/**` · no seed · no flip ready · no invent EMP UAT · no EMP-STATUS FE · no Nest emp_position | ✅ |

---

## 2. AS-IS facts (repo evidence)

| Layer | Fact |
|-------|------|
| Catalog SoT | Settings-catalogs family **`org_depts`** · storageKey **`departments`** (aliases `department_catalog` / `org_departments`) · XBOS sync + HRM extension merge **LIVE** |
| XBOS producer | `config-sync` / `business-master` allow-list **`departments`** publish/pull **LIVE** (peer `job_titles`) |
| WH | `employee-profile.service` `assertWhDepartmentKey` → `departments` · code **`HRM-WH-DEPT-KEY`** |
| CTR / DEC / REC / PERF | `department_key` assert ∈ `departments` catalog |
| Nest `emp_department` catalog | **ABSENT** — EMP VERTICAL **L-EMP-CAT-05** intentional XBOS REF |
| Nest `public.departments` | Org-tree CRUD (`parent_id`, name, code) **exists** — hierarchy ops surface · **≠** `department_key` invent SoT |
| Nest `emp_position` | **ABSENT** · EMP-POSITION Option A **RETAIN deny** |
| BA residual | R-EMP-POS-DEPT-01 OUT · named AC-PLT-EMP-DEPT-01* deepen bind/AC, not Nest DEFINE |
| Orthogonal LIVE | EMP-POSITION L1 · EMP-STATUS Nest L1 · EMP-CUSTOM Option A · MergeToken EXT · DOC/ET — **must_keep** |

---

## 3. Option evaluation (summary)

| Option | Verdict |
|--------|---------|
| **A** Settings/XBOS `departments` = open dept catalog SoT · admin N+1 · consumer invent **`HRM-EMP-DEPT-KEY`** | **LOCK / CONFIRMED** — producer LIVE · peer EMP-POSITION A / EMP-CUSTOM A class · EMP VERTICAL must_keep |
| **B** Nest `emp_department` DEFINE / Nest org-tree sole invent SoT · Settings REF | **REJECT** — producer not absent · dual master vs XBOS · L-EMP-CAT-05 |
| **C** Hybrid / mega-EAV / fold into Nest position·custom·status / UAT invent / reopen seals | **REJECT** |

**Weighted:** **A 116** · B 36 · C 8 (see spec §3).

**Why not EMP-STATUS Option B here:** status had Nest absent + hardcode/CHECK; department has LIVE Settings/XBOS producer and Nest invent is **forbidden** — cite Option B pattern only for admin≠consumer split, **not** Nest DEFINE.

**Org-tree note:** Nest `public.departments` retained as hierarchy surface — **FORBIDDEN** as sole invent SoT / dual writer.

---

## 4. F.1 / unlock

| Item | State |
|------|-------|
| F-EMP-CAT-DEPT-01..03 / EFF-01 | DEFINED (docs) — cite LIVE Settings/XBOS · **no** Nest catalog table |
| F-EMP-DEPT-CNS-01..04 | DEFINED — BE after BA if GAP |
| Errors | **`HRM-EMP-DEPT-KEY`** ≡ **`HRM-WH-DEPT-KEY`** · empty → CTA / empty-catalog class (BA final code) |
| ba-process | **UNLOCK** `…-EMP-DEPT-CATALOG-BA-01` |
| ba-data | **HOLD** — no Nest ADD (Option A) |
| BE / FE | **HOLD** until BA · GAP-only · **cấm** Nest catalog · **cấm** reopen EMP-POSITION/STATUS · **cấm** EMP-STATUS FE invent |

---

## 5. Honesty / OUT

| Item | Rule |
|------|------|
| `hrm_personnel_uat_ready` / e2e / printable | **false LOCKED** |
| Nest `emp_department` / Nest org-tree sole invent SoT | **DENIED** |
| Nest `emp_position` | **DENIED** (RETAIN position A) |
| Reopen EMP-POSITION / EMP-STATUS / CUSTOM / EXT / DOC-ET / ATT / SI / CTR | **DENIED** |
| Invent FE EMP-STATUS HOLD | **DENIED** |
| Seed / module EMP UAT / Phase1 DONE | **DENIED** |
| **C-SLICE-≠-MODULE** | **LOCKED** |

---

## 6. Handoff

### completion_report

**Closed:** docs-only Option **A CONFIRMED LOCKED** for EMP **department** catalog companion — Settings/XBOS `departments` = SoT (peer position `job_titles` A); admin CREATE/sync N+1 ≠ consumer invent **`HRM-EMP-DEPT-KEY`** (≡ `HRM-WH-DEPT-KEY`); empty CTA / no seed; Nest `emp_department` / Nest org-tree sole invent SoT / Nest `emp_position` / Option B Nest / Option C fold·mega-EAV·reopen·UAT invent **REJECT**; EMP-POSITION L1 · EMP-STATUS · EMP-CUSTOM · EXT · DOC/ET · ATT/SI/CTR **RETAIN**; ba-data **HOLD**; ba-process **UNLOCK**; BE HOLD; honesty false · **C-SLICE-≠-MODULE**; architecture closes **R-EMP-POS-DEPT-01**; no `apps/**`.

**Residual:** BA AC pack AC-PLT-EMP-DEPT-01*; BE/FE only after BA if GAP; Nest org-tree hierarchy UX OUT / follow-on note only.

### next_owner

`ba-process`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: EMP-DEPT-CATALOG-SA-01 Option A LOCKED · U88 after EMP-POSITION QC GWC · R-EMP-POS-DEPT-01

## entry_criteria
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md (Option A LOCK · L-EMP-DEPT-* · F.1 · AC draft)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-sa-01.md
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md §2.1 phòng ban · BR-PLT-02/04/05/06
- Cite peer EMP-POSITION BA Option A (admin open ≠ consumer invent) — cite ≠ copy Nest EMP-STATUS BA
- Cite EMP VERTICAL L-EMP-CAT-05 — FORBIDDEN Nest emp_department dual master · FORBIDDEN Nest emp_position
- RETAIN: EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR
- Honesty false · C-SLICE-≠-MODULE · U65 · ba-data HOLD (Option A)

## task
CONFIRMED AC pack AC-PLT-EMP-DEPT-01 / 01b / 01c / 01d / 01e / 01H + VAL-EMP-DEPT-CNS-*:
1) Settings/XBOS departments EFF = SoT; admin CREATE/sync N+1 (01d)
2) invent → HRM-EMP-DEPT-KEY ≡ HRM-WH-DEPT-KEY when EFF>0 (01b)
3) empty CTA · EMPTY-CATALOG class · no seed (01c)
4) soft-retire hide · history OK (01e); honesty 01H
5) Explicit DENY Nest emp_department · Nest org-tree sole invent SoT · fold position/custom/status · reopen EMP-POSITION/STATUS/CUSTOM/EXT · invent EMP-STATUS FE · personnel flip · mega-EAV · module EMP UAT · seed
6) Evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01.md + docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-ba-01.md
7) ba-data HOLD; BE HOLD until BA (CNS unlock only if GAP)

## cấm
apps/** · seed · flip personnel/e2e/printable · reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent EMP-STATUS FE · Nest emp_department · Nest emp_position · module EMP UAT · Phase1 · empty completion

## exit
CONFIRMED · PASS_TO_PM · both files on disk · next_dispatch_prompt (BA→PM; BE only if GAP)
```

---

## evidence_path / ack_status

| Field | Value |
|-------|--------|
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-sa-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md` |
| **overall** | **CONFIRMED** Option **A LOCKED** |
| **ack_status** | **PASS_TO_PM** |
| **ba_data** | **HOLD** |
| **ba_process** | **UNLOCK** |
| **closes** | Architecture for **R-EMP-POS-DEPT-01** (AC pack next) |
