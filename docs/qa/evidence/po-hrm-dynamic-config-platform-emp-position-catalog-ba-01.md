# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **lane** | governance |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01` **CONFIRMED** Option **A** · U88 after EMP-STATUS QC GWC L1 |
| **Date** | 2026-08-08 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md) Option A · L-EMP-POS-* · F.1 · §7 |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-emp-position-catalog-sa-01.md`](po-hrm-dynamic-config-platform-emp-position-catalog-sa-01.md) |
| **ref_platform** | PLATFORM-BA-01 §2.1 **Chức danh / phòng ban** · **AC-PLT-EMP-01** · **BR-PLT-02/04/05/06** |
| **ref_peer_emp_custom** | EMP-CUSTOM-FIELD-BA-01 Option A admin≠consumer — **cite pattern** · stamp **`EMPCFQA-MSK14LUH`** **RETAIN** |
| **ref_peer_emp_status** | EMP-STATUS Option B Nest — **cite ≠ copy** · stamp **`EMPSTQA-MSK20G7H`** **RETAIN** · FE invent **HOLD** |
| **ref_peer_ext** | EXT stamp **`EMPTOKEXTQA-MSJ57PE1`** **RETAIN** · **≠** position SoT |
| **U65** | zero-seed · no `apps/**` · ba-data **HOLD** · **DENIED** Nest `emp_position` · **DENIED** reopen EMP-STATUS/CUSTOM/EXT |

### Honesty locks (mandatory)

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** LOCKED |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `contracts_printable_ready` | **false** LOCKED |
| EMP-STATUS L1 · `EMPSTQA-MSK20G7H` | **SEAL RETAIN** — **cấm reopen** · **cấm invent FE** |
| EMP-CUSTOM · `EMPCFQA-MSK14LUH` | **SEAL RETAIN** — **cấm fold position** |
| MergeToken EMP EXT · `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** — **cấm reopen** |
| DOC/ET · ATT · SI · CTR · enrollment | **SEAL RETAIN** |
| Module EMP UAT / Phase1 | **DENIED** |
| Nest `emp_position` / mega-EAV | **DENIED** |
| Primary dept AC | **OUT** follow-on |
| `C-SLICE-≠-MODULE` | retained |
| ba-data EXPAND Nest | **HOLD / FORBIDDEN** |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | EMP-POSITION-CATALOG-SA-01 | Option **A LOCKED** · L-EMP-POS-01..14 · F.1 · AC draft §7 · ba-data HOLD · BE HOLD until BA · dept OUT |
| 2 | EMP-POSITION-CATALOG-SA-01 evidence | CONFIRMED · unlock ba-process · REJECT Nest `emp_position` / Option C |
| 3 | PLATFORM-BA-01 §2.1 | **AC-PLT-EMP-01** WH picker · WH free-text **F** · **BR-PLT-02/04/05/06** |
| 4 | EMP-CUSTOM-FIELD-BA-01 | Option A admin open ≠ consumer invent — **cite pattern** (Settings LIVE deepen) · **≠** Nest EMP-STATUS BA |
| 5 | EMP-STATUS BA/QC | Nest Option B class — **cite ≠ copy** · stamp **`EMPSTQA-MSK20G7H`** RETAIN · FE HOLD |
| 6 | AS-IS code pointers (read-only) | WH `HRM-WH-PICK-REQUIRED` / `HRM-WH-PICK-EMPTY-CATALOG` · EMP `assertJobTitleKeyInCatalog` · Nest `emp_position` ABSENT |

**no_prompt_echo:** team-internal AC pack — không dán chat Sponsor vào tài liệu khách.

**RETAIN seals stamped:** EMP-STATUS L1 · EMP-CUSTOM · MergeToken EMP EXT · DOC/ET · ATT · SI · CTR — **not reopened**.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| Spec | AC-PLT-EMP-01 / 01b / 01c / 01d / 01e / 01H · UC-PLT-EMP-POS-* · BR-PLT-EMP-POS-01..12 · VAL-EMP-POS-CNS-01..07 · surfaces · sequenceDiagram · OUT matrix · unlock gates · dept OUT |
| This evidence | CONFIRMED stamp · handoff · honesty · gap residual |

**Không đụng:** `apps/**` · seed · Nest `emp_position` physical · reopen EMP-STATUS/CUSTOM/EXT/ATT/SI/CTR · flip personnel · invent EMP-STATUS FE · invent module EMP UAT · Phase1 DONE · primary dept AC.

---

## 3. AC stamp summary (CONFIRMED)

| ID | Intent | Cite |
|----|--------|------|
| **AC-PLT-EMP-01** | WH create: position = catalog picker ∈ EFF `job_titles`; reject free-text SoT (close WH **F**) | BR-PLT-02 · L-EMP-POS-01 · platform BA-01 |
| **AC-PLT-EMP-01b** | EFF>0 · invent unknown `position_key` / `job_title_key` → **`HRM-EMP-POSITION-KEY`** (≡ **`HRM-WH-PICK-REQUIRED`**) | BR-PLT-02 · L-EMP-POS-04 · F-EMP-POS-CNS-01 |
| **AC-PLT-EMP-01c** | EFF=0 · CTA Settings · **`HRM-WH-PICK-EMPTY-CATALOG`** · no seed · free-text FORBIDDEN | L-EMP-POS-05 · F-EMP-POS-CNS-04 |
| **AC-PLT-EMP-01d** | Admin CREATE/sync `job_titles` N+1 → 2xx → F5 → picker includes row | BR-PLT-05/06 · L-EMP-POS-03 · F-EMP-CAT-POS-02 |
| **AC-PLT-EMP-01e** | Soft-retire / inactive → picker hide · history WH/CTR OK | BR-PLT-04 · L-EMP-POS-10 |
| **AC-PLT-EMP-01H** | Honesty false · seals retain · Nest DENY · fold DENY · reopen DENY · personnel DENY · EMP-STATUS FE invent DENY · C-SLICE | SA §8 · L-EMP-POS-07..14 |

### VAL-EMP-POS-CNS-* (summary)

| VAL | Expect | Gap stamp |
|-----|--------|-----------|
| **CNS-01** | WH invent → POSITION-KEY ≡ WH-PICK-REQUIRED when EFF>0 | AS-IS WH-PICK **LIVE** → expect **PASS retain**; BE unlock only if FAIL |
| **CNS-02** | Empty → EMPTY-CATALOG · CTA · no seed | RETAIN empty LIVE; FE CTA verify |
| **CNS-03** | EMP `job_title_key` invent KEY class | BE GAP if missing |
| **CNS-04** | Soft-retire hide / KEY on retired | Deepen if picker leaks |
| **CNS-05** | CTR/DEC invent KEY | RETAIN deepen if FAIL |
| **CNS-06** | Scope parity | RETAIN deepen if FAIL |
| **CNS-07** | Free-text alone rejected when EFF>0 | **FE/BE GAP** if WH UI still free-text SoT (**F**) |
| **ADM-01** | Admin CREATE/sync N+1 open | RETAIN Settings/XBOS — deepen if closed-enum |

### Click path (copy for QA)

```text
Login → Settings / XBOS → job_titles catalog
  → (01d) CREATE/sync N+1 (code + label vi, active) → Lưu/sync → FE after 2xx → F5 row còn
  → (01) Employees → Work history create → chọn position_key ∈ EFF → Lưu 2xx → F5 · cấm free-text SoT
  → (01b) EFF>0 → Lưu invent unknown position_key → 4xx HRM-EMP-POSITION-KEY (hoặc HRM-WH-PICK-REQUIRED ≡)
  → (01c) EFF=0 → soft empty + CTA Settings · EMPTY-CATALOG · no seed · free-text FORBIDDEN
  → (01e) Soft-retire / inactive row → picker hide · history WH/CTR OK
Negatives RETAIN: EMP-STATUS L1 · EMP-CUSTOM · EXT · DOC/ET · ATT · SI · CTR — cấm reopen
OUT: Nest emp_position · fold custom/status · invent EMP-STATUS FE · personnel flip · module EMP UAT · seed · primary dept AC
```

---

## 4. Quality gates (ba-process)

| Check | Result |
|-------|--------|
| Align SA Option A · no Nest `emp_position` | **PASS** |
| Cite BR-PLT-02/04/05/06 · AC-PLT-EMP-01 platform | **PASS** |
| Admin open N+1 ≠ consumer invent KEY | **PASS** |
| Peer EMP-CUSTOM A cite · EMP-STATUS B cite ≠ copy | **PASS** |
| Empty EFF + soft-retire + honesty 01H | **PASS** |
| Explicit OUT (Nest / fold / seals / UAT / seed / dept / EMP-STATUS FE) | **PASS** |
| U65 browser click paths measurable | **PASS** |
| ba-data HOLD (no Nest EXPAND) | **PASS** |
| BE unlock = CNS only if GAP | **PASS** |
| No apps/** · no seed · honesty false | **PASS** |
| EMP-STATUS / CUSTOM / EXT / DOC-ET / ATT / SI / CTR retain | **PASS** |
| Dept AC OUT follow-on | **PASS** |

**Verdict:** **CONFIRMED** (not HOLD-WITH-RATIONALE) — SA Option A + platform BA-01 + LIVE Settings/XBOS producer provide complete AC surface; residual = implementation GAP probe (FE free-text F / KEY alias) only — **not** Nest DEFINE.

---

## 5. Unlock / next posture

| Gate | After this BA |
|------|----------------|
| ba-data | **HOLD** — FORBIDDEN Nest `emp_position` |
| BE | **HOLD** default · **UNLOCK** F-EMP-POS-CNS-* / KEY alias **only if** VAL FAIL |
| FE | Unlock if WH free-text **F** still on UI (CNS-07) after QA |
| QA | **Recommended next** — U65 AC-PLT-EMP-01* + VAL probe plan (zero-seed) |
| QC | After QA narrow · honesty false · C-SLICE |
| Dept | Follow-on WI note only — same Option A · no Nest `emp_department` |

---

## 6. Handoff

### completion_report

Closed: governance **CONFIRMED** AC pack **AC-PLT-EMP-01 / 01b / 01c / 01d / 01e / 01H** + **VAL-EMP-POS-CNS-*** for EMP **position** catalog Option **A** — SoT = Settings/XBOS **`job_titles`** effective; admin CREATE/sync N+1 ≠ consumer invent **`HRM-EMP-POSITION-KEY`** (≡ **`HRM-WH-PICK-REQUIRED`**); empty CTA / **`HRM-WH-PICK-EMPTY-CATALOG`** · no seed · free-text FORBIDDEN; soft-retire hide · history OK; honesty 01H DENY Nest `emp_position` · fold custom/status · reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · personnel flip · invent EMP-STATUS FE · module EMP UAT / Phase1 / seed; dept **OUT** follow-on; ba-data **HOLD**; BE CNS **only if GAP**; peer EMP-CUSTOM A cite · EMP-STATUS B cite ≠ copy; no `apps/**`.

Residual: QA U65 plan + VAL probe; **dev-be** only if CNS FAIL; **dev-fe** if WH free-text F remains; dept follow-on WI later.

### next_owner

`pm` → **`qa`** (preferred — BE asserts LIVE retain) · else **`dev-be`/`dev-fe`** if GAP proven

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: EMP-POSITION-CATALOG-BA-01 CONFIRMED · Option A Settings/XBOS job_titles

## entry_criteria
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md (AC-PLT-EMP-01* CONFIRMED)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-ba-01.md
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md Option A LOCK
- RETAIN: EMP-STATUS EMPSTQA-MSK20G7H · EMP-CUSTOM EMPCFQA-MSK14LUH · EXT EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR
- Honesty false · C-SLICE-≠-MODULE · U65 zero-seed · browser-only for UF

## task
L1 + U65 plan/execute AC-PLT-EMP-01 / 01b / 01c / 01d / 01e / 01H + VAL-EMP-POS-CNS-*:
- SoT = Settings/XBOS job_titles EFF (Option A)
- 01d admin CREATE/sync N+1 open
- 01 WH picker ∈ EFF · reject free-text SoT (close F)
- 01b invent → HRM-EMP-POSITION-KEY ≡ HRM-WH-PICK-REQUIRED when EFF>0
- 01c empty → CTA · HRM-WH-PICK-EMPTY-CATALOG · no seed
- 01e soft-retire hide · history OK
- 01H honesty · DENY Nest emp_position · fold · reopen seals · personnel · invent EMP-STATUS FE
- If VAL FAIL → pm_dispatch_hint BE/FE GAP-only (cấm Nest emp_position)
- If VAL PASS LIVE retain → PASS_TO_PM for QC narrow; note dept follow-on OUT

## deliverables
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-01.md
- Stamp + command_table · residual BE/FE if any · honesty false

## cấm
seed · Nest emp_position · reopen EMP-STATUS/CUSTOM/EXT · flip personnel · module EMP UAT · Phase1 DONE · invent EMP-STATUS FE · UF 🟢 from probe alone

## exit
PASS_TO_PM · full handoff · next_dispatch_prompt (qc if PASS · OR dev-be/dev-fe if GAP)
```

**Dept follow-on note (not this QA):** architecture Option A locked for `departments` — open `…-EMP-DEPT-CATALOG-SA/BA-*` later; **FORBIDDEN** Nest `emp_department` in position seat.

### ack_status

`PASS_TO_PM`

---

## 7. Files touched (governance only)

| Path | Action |
|------|--------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md` | ADD |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-ba-01.md` | ADD |
| `apps/**` | **NONE** |
| seed | **NONE** |
