# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **lane** | governance |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01` **CONFIRMED** Option **A** · U88 after EMP-POSITION QC · **R-EMP-POS-DEPT-01** |
| **Date** | 2026-08-08 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01.md) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md) Option A · L-EMP-DEPT-* · F.1 · §7 |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-emp-dept-catalog-sa-01.md`](po-hrm-dynamic-config-platform-emp-dept-catalog-sa-01.md) |
| **ref_platform** | PLATFORM-BA-01 §2.1 **Chức danh / phòng ban** · **BR-PLT-02/04/05/06** |
| **ref_peer_emp_position** | EMP-POSITION-CATALOG-BA-01 Option A admin≠consumer — **cite pattern** · stamp **`EMPPOSQA2-MSK3CDH1`** **RETAIN** |
| **ref_peer_emp_custom** | EMP-CUSTOM-FIELD-BA-01 Option A — **cite pattern** · stamp **`EMPCFQA-MSK14LUH`** **RETAIN** |
| **ref_peer_emp_status** | EMP-STATUS Option B Nest — **cite ≠ copy** · stamp **`EMPSTQA-MSK20G7H`** **RETAIN** · FE invent **HOLD** |
| **ref_peer_ext** | EXT stamp **`EMPTOKEXTQA-MSJ57PE1`** **RETAIN** · **≠** dept SoT |
| **U65** | zero-seed · no `apps/**` · ba-data **HOLD** · **DENIED** Nest `emp_department` / Nest org-tree sole invent / Nest `emp_position` · **DENIED** reopen EMP-POSITION/STATUS/CUSTOM/EXT |

### Honesty locks (mandatory)

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** LOCKED |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `contracts_printable_ready` | **false** LOCKED |
| EMP-POSITION L1 · `EMPPOSQA2-MSK3CDH1` | **SEAL RETAIN** — **cấm reopen** · **cấm Nest emp_position** |
| EMP-STATUS L1 · `EMPSTQA-MSK20G7H` | **SEAL RETAIN** — **cấm reopen** · **cấm invent FE** |
| EMP-CUSTOM · `EMPCFQA-MSK14LUH` | **SEAL RETAIN** — **cấm fold dept** |
| MergeToken EMP EXT · `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** — **cấm reopen** |
| DOC/ET · ATT · SI · CTR · enrollment | **SEAL RETAIN** |
| Module EMP UAT / Phase1 | **DENIED** |
| Nest `emp_department` / Nest org-tree sole invent / Nest `emp_position` / mega-EAV | **DENIED** |
| `C-SLICE-≠-MODULE` | retained |
| ba-data EXPAND Nest | **HOLD / FORBIDDEN** |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | EMP-DEPT-CATALOG-SA-01 | Option **A LOCKED** · L-EMP-DEPT-01..15 · F.1 · AC draft §7 · ba-data HOLD · BE HOLD until BA |
| 2 | EMP-DEPT-CATALOG-SA-01 evidence | CONFIRMED · unlock ba-process · REJECT Nest `emp_department` / org-tree sole invent / Option C |
| 3 | PLATFORM-BA-01 §2.1 | phòng ban companion · **BR-PLT-02/04/05/06** · picker / empty CTA |
| 4 | EMP-POSITION-CATALOG-BA-01 | Option A admin open ≠ consumer invent — **cite pattern** (closest peer) · **≠** Nest EMP-STATUS BA · stamp **`EMPPOSQA2-MSK3CDH1`** RETAIN |
| 5 | EMP-STATUS BA/QC | Nest Option B class — **cite ≠ copy** · stamp **`EMPSTQA-MSK20G7H`** RETAIN · FE HOLD |
| 6 | EMP VERTICAL L-EMP-CAT-05 | **FORBIDDEN** Nest `emp_department` dual master · **FORBIDDEN** Nest `emp_position` |
| 7 | AS-IS code pointers (read-only) | WH `HRM-WH-DEPT-KEY` · `assertWhDepartmentKey` · CTR/DEC/REC `departments` asserts · Nest `emp_department` ABSENT · Nest `public.departments` org-tree ≠ invent SoT |

**no_prompt_echo:** team-internal AC pack — không dán chat Sponsor vào tài liệu khách.

**RETAIN seals stamped:** EMP-POSITION L1 · EMP-STATUS L1 · EMP-CUSTOM · MergeToken EMP EXT · DOC/ET · ATT · SI · CTR — **not reopened**.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| Spec | AC-PLT-EMP-DEPT-01 / 01b / 01c / 01d / 01e / 01H · UC-PLT-EMP-DEPT-* · BR-PLT-EMP-DEPT-01..13 · VAL-EMP-DEPT-CNS-01..07 + ADM/ORG · surfaces · sequenceDiagram · OUT matrix · unlock gates |
| This evidence | CONFIRMED stamp · handoff · honesty · gap residual |

**Không đụng:** `apps/**` · seed · Nest `emp_department` physical · Nest org-tree sole invent · Nest `emp_position` · reopen EMP-POSITION/STATUS/CUSTOM/EXT/ATT/SI/CTR · flip personnel · invent EMP-STATUS FE · invent module EMP UAT · Phase1 DONE.

---

## 3. AC stamp summary (CONFIRMED)

| ID | Intent | Cite |
|----|--------|------|
| **AC-PLT-EMP-DEPT-01** | WH create: department = catalog picker ∈ EFF `departments`; reject free-text SoT | BR-PLT-02 · L-EMP-DEPT-01 · platform BA-01 §2.1 |
| **AC-PLT-EMP-DEPT-01b** | EFF>0 · invent unknown `department_key` → **`HRM-EMP-DEPT-KEY`** (≡ **`HRM-WH-DEPT-KEY`**) | BR-PLT-02 · L-EMP-DEPT-04 · F-EMP-DEPT-CNS-01 |
| **AC-PLT-EMP-DEPT-01c** | EFF=0 · CTA Settings · **`HRM-EMP-DEPT-EMPTY-CATALOG`** (≡ peer WH EMPTY) · no seed · free-text FORBIDDEN | L-EMP-DEPT-05 · F-EMP-DEPT-CNS-04 |
| **AC-PLT-EMP-DEPT-01d** | Admin CREATE/sync `departments` N+1 → 2xx → F5 → picker includes row | BR-PLT-05/06 · L-EMP-DEPT-03 · F-EMP-CAT-DEPT-02 |
| **AC-PLT-EMP-DEPT-01e** | Soft-retire / inactive → picker hide · history WH/CTR OK | BR-PLT-04 · L-EMP-DEPT-10 |
| **AC-PLT-EMP-DEPT-01H** | Honesty false · seals retain · Nest DENY · org-tree sole invent DENY · fold DENY · reopen DENY · personnel DENY · EMP-STATUS FE invent DENY · C-SLICE | SA §8 · L-EMP-DEPT-06..15 |

### VAL-EMP-DEPT-CNS-* (summary)

| VAL | Expect | Gap stamp |
|-----|--------|-----------|
| **CNS-01** | WH invent → EMP-DEPT-KEY ≡ WH-DEPT-KEY when EFF>0 | AS-IS WH-DEPT **LIVE** → expect **PASS retain**; BE unlock only if FAIL |
| **CNS-02** | Empty → EMPTY-CATALOG · CTA · no seed | FE CTA / empty-code deepen if GAP |
| **CNS-03** | EMP `department_key` invent KEY class | BE GAP if missing |
| **CNS-04** | Soft-retire hide / KEY on retired | Deepen if picker leaks |
| **CNS-05** | CTR/DEC/REC/PERF invent KEY | RETAIN deepen if FAIL |
| **CNS-06** | Scope parity | RETAIN deepen if FAIL |
| **CNS-07** | Free-text alone rejected when EFF>0 | **FE/BE GAP** if UI still free-text SoT |
| **ADM-01** | Admin CREATE/sync N+1 open | RETAIN Settings/XBOS — deepen if closed-enum |
| **ORG-01** | Nest org-tree alone ≠ invent SoT | Negative spot — FAIL if dual master |

### Click path (copy for QA)

```text
Login → Settings / XBOS → departments catalog
  → (01d) CREATE/sync N+1 (code + label vi, active) → Lưu/sync → FE after 2xx → F5 row còn
  → (01) Employees → Work history create → chọn department_key ∈ EFF → Lưu 2xx → F5 · cấm free-text SoT
  → (01b) EFF>0 → Lưu invent unknown department_key → 4xx HRM-EMP-DEPT-KEY (hoặc HRM-WH-DEPT-KEY ≡)
  → (01c) EFF=0 → soft empty + CTA Settings · EMPTY-CATALOG · no seed · free-text FORBIDDEN
  → (01e) Soft-retire / inactive row → picker hide · history WH/CTR OK
Negatives RETAIN: EMP-POSITION L1 · EMP-STATUS L1 · EMP-CUSTOM · EXT · DOC/ET · ATT · SI · CTR — cấm reopen
OUT: Nest emp_department · Nest org-tree sole invent · Nest emp_position · fold position/custom/status · invent EMP-STATUS FE · personnel flip · module EMP UAT · seed
```

---

## 4. Quality gates (ba-process)

| Check | Result |
|-------|--------|
| Align SA Option A · no Nest `emp_department` · no org-tree sole invent | **PASS** |
| Cite BR-PLT-02/04/05/06 · BA-01 §2.1 phòng ban | **PASS** |
| Admin open N+1 ≠ consumer invent KEY | **PASS** |
| Peer EMP-POSITION A cite · EMP-STATUS B cite ≠ copy | **PASS** |
| Cite L-EMP-CAT-05 FORBIDDEN Nest dept/position | **PASS** |
| Empty EFF + soft-retire + honesty 01H | **PASS** |
| Explicit OUT (Nest / org-tree / fold / seals / UAT / seed / EMP-STATUS FE) | **PASS** |
| U65 browser click paths measurable | **PASS** |
| ba-data HOLD (no Nest EXPAND) | **PASS** |
| BE unlock = CNS only if GAP | **PASS** |
| No apps/** · no seed · honesty false | **PASS** |
| EMP-POSITION / STATUS / CUSTOM / EXT / DOC-ET / ATT / SI / CTR retain | **PASS** |
| Closes R-EMP-POS-DEPT-01 AC | **PASS** |

**Verdict:** **CONFIRMED** (not HOLD-WITH-RATIONALE) — SA Option A + platform BA-01 + LIVE Settings/XBOS producer + peer EMP-POSITION BA provide complete AC surface; residual = implementation GAP probe (KEY alias / empty CTA / free-text FE) only — **not** Nest DEFINE.

---

## 5. Unlock / next posture

| Gate | After this BA |
|------|----------------|
| ba-data | **HOLD** — FORBIDDEN Nest `emp_department` |
| BE | **HOLD** default · **UNLOCK** F-EMP-DEPT-CNS-* / KEY alias / empty deepen **only if** VAL FAIL |
| FE | Unlock if free-text dept SoT still on UI (CNS-07) after QA |
| QA | **Recommended next** — U65 AC-PLT-EMP-DEPT-01* + VAL probe plan (zero-seed) |
| QC | After QA narrow · honesty false · C-SLICE |
| Org-tree UX | OUT follow-on — retain surface · **cấm** sole invent SoT |

---

## 6. Handoff

### completion_report

Closed: governance **CONFIRMED** AC pack **AC-PLT-EMP-DEPT-01 / 01b / 01c / 01d / 01e / 01H** + **VAL-EMP-DEPT-CNS-*** for EMP **department** catalog Option **A** — SoT = Settings/XBOS **`departments`** effective; admin CREATE/sync N+1 ≠ consumer invent **`HRM-EMP-DEPT-KEY`** (≡ **`HRM-WH-DEPT-KEY`**); empty CTA / **`HRM-EMP-DEPT-EMPTY-CATALOG`** (≡ peer WH EMPTY) · no seed · free-text FORBIDDEN; soft-retire hide · history OK; honesty 01H DENY Nest `emp_department` · Nest org-tree sole invent · Nest `emp_position` · fold position/custom/status · reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · personnel flip · invent EMP-STATUS FE · module EMP UAT / Phase1 / seed; ba-data **HOLD**; BE CNS **only if GAP**; peer EMP-POSITION A cite · EMP-STATUS B cite ≠ copy; closes **R-EMP-POS-DEPT-01**; no `apps/**`.

Residual: QA U65 plan + VAL probe; **dev-be** only if CNS FAIL; **dev-fe** if free-text dept SoT remains; org-tree UX OUT follow-on.

### next_owner

`pm` → **`qa`** (preferred — BE asserts LIVE retain) · else **`dev-be`/`dev-fe`** if GAP proven

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: EMP-DEPT-CATALOG-BA-01 CONFIRMED · Option A Settings/XBOS departments · R-EMP-POS-DEPT-01

## entry_criteria
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01.md (AC-PLT-EMP-DEPT-01* CONFIRMED)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-ba-01.md
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md Option A LOCK
- RETAIN: EMP-POSITION EMPPOSQA2-MSK3CDH1 · EMP-STATUS EMPSTQA-MSK20G7H · EMP-CUSTOM EMPCFQA-MSK14LUH · EXT EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR
- Honesty false · C-SLICE-≠-MODULE · U65 zero-seed · browser-only for UF

## task
L1 + U65 plan/execute AC-PLT-EMP-DEPT-01 / 01b / 01c / 01d / 01e / 01H + VAL-EMP-DEPT-CNS-*:
- SoT = Settings/XBOS departments EFF (Option A)
- 01d admin CREATE/sync N+1 open
- 01 WH picker ∈ EFF · reject free-text SoT
- 01b invent → HRM-EMP-DEPT-KEY ≡ HRM-WH-DEPT-KEY when EFF>0
- 01c empty → CTA · HRM-EMP-DEPT-EMPTY-CATALOG (≡ WH EMPTY) · no seed
- 01e soft-retire hide · history OK
- 01H honesty · DENY Nest emp_department · Nest org-tree sole invent · Nest emp_position · fold · reopen seals · invent EMP-STATUS FE · personnel flip · module EMP UAT · seed
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.md
- BE/FE unlock only if VAL FAIL (GAP) — default PASS retain LIVE asserts

## cấm
apps/** invent · seed · flip personnel · reopen EMP-POSITION/STATUS/CUSTOM/EXT · Nest emp_department · Nest emp_position · module EMP UAT · Phase1 · claim UF 🟢 from probe alone

## exit
PASS_TO_PM · residual GAP list (BE/FE) or READY_FOR_QC if L1+U65 plan complete
```

---

## evidence_path / ack_status

| Field | Value |
|-------|--------|
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-ba-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01.md` |
| **overall** | **CONFIRMED** AC pack Option **A** |
| **ack_status** | **PASS_TO_PM** |
| **ba_data** | **HOLD** |
| **next_owner** | `pm` → **`qa`** (default) · **`dev-be`/`dev-fe`** only if GAP |
| **closes** | AC for **R-EMP-POS-DEPT-01** |
