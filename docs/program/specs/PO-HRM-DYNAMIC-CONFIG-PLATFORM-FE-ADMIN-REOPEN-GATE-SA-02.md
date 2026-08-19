# PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-SA-02 — Option/F.1 · CTR QC-03 GWC vs FE-ADMIN reopen-gate (ADD-only)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-SA-02` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **lane** | governance · docs-only · **NO** `apps/**` |
| **priority** | P1 |
| **date** | 2026-08-09 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QC-03` **GWC** · stamp **`CLQA4-KMZ54C`** · EV 20500 · AC-02/03 **CLOSED** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 continuous |
| **change_mode** | **ADD-only** Option/F.1 disposition — **RETAIN** BA-01..05 inventory · **no rewrite** · **no Nest invent** |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD continues** · reopen triggers **unchanged** |
| **U65** | zero-seed · this seat does not unlock execution |
| **Honesty (RETAIN all false)** | `contracts_printable_ready=false` · `payroll_e2e_ready=false` · `hrm_personnel_uat_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · remaster/face/attendance_closed/product_go **false** · companion three **false** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | **PASS_TO_PM** |

> **HARD EXIT:** NFD WriteAllText · Length ≥ 8KB evidence (+ this SPEC). Empty / invent Nest / flip printable = INVALID.

---

## 0. Mission boundary (what this seat is / is not)

### 0.1 IS

- Disposition **FE-ADMIN reopen-gate residuals** after CTR clause **AC-02/03** slice GWC.
- Answer explicitly: what CTR QC-03 GWC **does** / **does NOT** unlock for FE-ADMIN Nest notes surfaces.
- Produce Option A/B/C + F.1 matrix · recommend next_owner.
- **RETAIN** BA-05 inventory counts (#1–#28 rollup) · ADD-only delta **only if** AC-02/03 closure changes a reopen trigger.

### 0.2 IS NOT

| Forbidden | Why |
|-----------|-----|
| Nest invent unlock | QC-03 sealed issue soft-block + freeze — **not** FE-ADMIN ABSENT deepen |
| Rewrite BA-01..05 | Inventory CONFIRMED · seals must_keep |
| Reopen sealed ATT-SHIFT SA | U88 forbid · QC-03 DENY |
| Flip `contracts_printable_ready` | PRINTABLE-HOLD-SA-01 · BA-02 #15 / BA-03 #21 HOLD |
| Claim module CTR UAT / Phase1 / J-map 🟢 | **C-SLICE-≠-MODULE** |
| Seed / `apps/**` | U65 · governance lane |

### 0.3 Parent facts (QC-03 — RETAIN)

| Fact | Value |
|------|-------|
| Verdict | **GO WITH CONDITIONS** |
| AC-PLT-CTR-CL-02 | **SEAL ACCEPT** — PATCH **409** `HRM-CTR-CL-CODE-CONFLICT` + FE soft-block |
| AC-PLT-CTR-CL-03 | **SEAL ACCEPT** — issued snapshot immutable |
| Issue spine | **CLOSED** `R-CTR-CL-ISSUE-SPINE-U65` · `printVersionId` proven |
| Snapshot bind | **CLOSED** `R-CTR-CL-SNAPSHOT-BIND` for stamp `CLQA4-KMZ54C` |
| AC-01 / CLQA2 | **RETAIN** — cấm reopen P0 company_id |
| P2 OPEN ACCEPT | `R-CTR-CL-ACTIVATE-UI` · toast OBS · DnD 404 OBS |
| Printable | **`contracts_printable_ready=false` LOCKED** |
| U88 hint | sa FE-ADMIN reopen disposition (this seat) |

---

## 1. Decision context (ADR)

| | |
|--|--|
| **Decision title** | Does CTR clause AC-02/03 GWC change FE-ADMIN reopen-gate triggers or unlock Nest FE-ADMIN notes surfaces? |
| **Decision owner** | sa |
| **Requestor** | pm · U88 after CTR-CLAUSE-QC-03 GWC |
| **Related** | BA-01 #11/#12 · BA-02 #15 · BA-03 #21 · CTR-CLAUSE-FE-SA-01 Option B HOLD · CTR-PRINTABLE-HOLD-SA-01 · FE-ADMIN-PACK-SYNTH-SA-01 |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` + OS F.1 (mục đích · nghiệp vụ · bước SRS) |

### 1.1 Problem statement

After QC seals **issued soft-block + snapshot freeze** (C-SLICE), PM risk is over-promote:

1. Treat GWC as unlock for **`R-PLT-CTR-CL-FE-01`** polish or Nest dual SoT.
2. Treat GWC as flip **`contracts_printable_ready`**.
3. Treat GWC as pretext to reopen **ATT-SHIFT** / other FE-ADMIN HOLDs.
4. Dispatch **ba-process BA-06** rewrite inventory without trigger delta.

**F.1 question:** Does any BA-01..05 **reopen trigger** change because AC-02/03 is now CLOSED?

### 1.2 AS-IS audit (read-only — governance artifacts)

#### A. FE-ADMIN reopen inventory RETAIN (BA-05 latest)

| Layer | Rows | Class | Status |
|-------|------|-------|--------|
| BA-01 | #1–#13 | FE-ADMIN / FE residual synth | **HOLD** all · **RETAIN counts** |
| BA-02 | #14–#16 | LIVE twin leave · printable cite · LVRULE engine | **HOLD** |
| BA-03 | #17–#21 | Module honesty five flags **false** | **HOLD** |
| BA-04 | #22–#24 | Companion honesty three **false** | **HOLD** |
| BA-05 | #25–#28 | Program honesty four **false** | **HOLD** |
| **Total** | **28** inventory slots (with #15/#21 same residual_id dual-cite) | — | **no wipe** |

#### B. CTR-adjacent residuals (focus)

| # | residual_id | Class | Sponsor gate (unchanged) | Post QC-03? |
|---|-------------|-------|--------------------------|-------------|
| 11 | `R-PLT-CTR-CL-FE-01` | LIVE admin + consumer polish HOLD | «mở FE wave CTR clause polish» / body_vi | **HOLD continues** — GWC ≠ polish unlock |
| 12 | `R-PLT-CTR-TPL-FE-01` | LIVE admin + consumer polish HOLD | «mở FE wave CTR template polish» | **HOLD continues** |
| 15 / 21 | `R-PLT-CTR-PRINTABLE-01` | Honesty / module gate | «mở wave printable UAT HĐ» + UF/J-* | **HOLD continues** — printable=false |
| — | `R-CTR-CL-ACTIVATE-UI` | P2 product OBS (QC-03) | optional narrow **dev-fe** | **Orthogonal** to FE-ADMIN reopen inventory — **not** a BA-01..05 row |

#### C. Prior CTR FE-ADMIN disposition (must_keep)

[`CTR-CLAUSE-FE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-SA-01.md) Option **B** LOCKED:

- FE-ADMIN `ContractLegalPrintSettingsPanel` **LIVE** (not ABSENT).
- Consumer print spine / PDF resolve **LIVE**.
- Closable deepen GAP = **NO** → ACCEPT_AS_IS_P2 HOLD on `R-PLT-CTR-CL-FE-01`.
- Soft-block `HRM-CTR-CL-CODE-CONFLICT` was already **architecture LIVE**; QC-03 sealed **browser U65 proof** of AC-02/03 — does **not** mint Nest invent work.

#### D. Closable GAP checklist (post QC-03)

| Precondition for unlock FE-ADMIN Nest notes | Met by QC-03? |
|---------------------------------------------|---------------|
| New Nest-admin-ABSENT surface for clauses? | **NO** — panel already LIVE |
| New dual SoT / Settings-MD body writer needed? | **NO** — DENY |
| Mount/persist gap on clause admin? | **NO** — not claimed by QC |
| Printable module UF matrix complete? | **NO** — honesty false RETAIN |
| Sponsor polish phrase in same message? | **NO** |
| **Closable FE-ADMIN reopen trigger change?** | **NO** |

**Heuristic:** Prefer unlock only if LIVE + AC locked + **closable gap**. Gap for FE-ADMIN reopen = **false** → **Option A HOLD continues**.

---

## 2. F.1 matrix — what CTR QC-03 GWC does / does NOT unlock

### 2.1 Mục đích (Purpose)

Khóa ranh giới kiến trúc: **GWC AC-02/03** chứng minh soft-block + snapshot freeze trên spine in HĐ (C-SLICE) — **không** mở cổ FE-ADMIN Nest notes, **không** flip printable, **không** Nest invent.

### 2.2 Nghiệp vụ xử lý (Business handling)

| Signal from QC-03 | Architecture class | FE-ADMIN reopen effect |
|-------------------|--------------------|------------------------|
| AC-02 PATCH 409 CONFLICT | Product **spine** guard LIVE+proven | **None** — already assumed by CTR-CLAUSE-FE-SA-01 HOLD |
| AC-03 snapshot freeze | Product **spine** guard LIVE+proven | **None** — issued freeze must_keep; polish DENY reopen body SoT |
| Issue spine CLOSED | C-SLICE journey seal | **None** — ≠ printable module GO |
| Snapshot bind CLOSED | Stamp integrity | **None** — ≠ Nest dual |
| ACTIVATE-UI P2 OPEN | Optional UX polish on activate path | **Not** BA reopen row; optional **dev-fe** P2 — **DENY** as Nest invent |
| printable=false LOCKED | Honesty module gate | **RETAIN** BA-02 #15 / BA-03 #21 HOLD |
| DENY ATT-SHIFT reopen | Peer seal | **RETAIN** BA-01 #8 HOLD forever-until-sponsor |

### 2.3 Tham chiếu bước SRS / AC (Trace)

| AC / Journey | QC-03 | Maps to FE-ADMIN inventory? |
|--------------|-------|------------------------------|
| AC-PLT-CTR-CL-02 · J-HRM-CTR-CL-02 | SEAL | **No unlock** of #11 polish gate |
| AC-PLT-CTR-CL-03 · J-HRM-CTR-CL-03 | SEAL | **No unlock** of printable #15/#21 |
| J-HRM-CTR-CL-ISSUE | SEAL C-SLICE | **No** PROGRAM_JOURNEY_MAP module 🟢 |
| AC-PLT-CTR-CL-H | ACCEPT | Honesty false RETAIN |
| BA-01 §5.11 polish UF | unchanged | Sponsor phrase still required |

### 2.4 Unlock / DENY matrix (authoritative)

| Surface / residual | Unlocked by QC-03 GWC? | Disposition |
|--------------------|------------------------|-------------|
| Nest `hrm_contract_clauses` SoT | Already LIVE — **not** invent | RETAIN Option B Nest |
| FE-ADMIN clause panel (#11) | **NO** | HOLD polish until sponsor |
| FE-ADMIN template (#12) | **NO** | HOLD polish until sponsor |
| Printable module (#15/#21) | **NO** | HOLD · printable=false |
| Nest-admin-ABSENT EMP ST/STR (#1) | **NO** | HOLD |
| Nest-admin-ABSENT ATT CODE/OT/COMP (#2) | **NO** | HOLD |
| SI/PAY/REC/DEC/SHIFT/WS LIVE polish (#3–#9) | **NO** | HOLD |
| SITE-UNKNOWN deferred (#10) | **NO** | HOLD |
| LVRULE 01g (#13) / engine (#16) | **NO** | HOLD |
| Leave-type LIVE twin (#14) | **NO** | HOLD |
| Module honesty #17–#21 | **NO** | flags false |
| Companion #22–#24 | **NO** | flags false |
| Program #25–#28 | **NO** | flags false |
| ATT-SHIFT sealed SA | **DENY reopen** | must_keep |
| Nest FE-ADMIN dual SoT | **DENY invent** | must_keep |
| Seed / flip ready / module CTR UAT | **DENY** | C-SLICE |

### 2.5 ADD-only delta to BA inventory triggers

| Question | Answer |
|----------|--------|
| Does AC-02/03 closure change any BA-01..05 sponsor phrase? | **NO** |
| Does AC-02/03 closure change any residual class? | **NO** |
| rows_added this seat to BA inventory? | **0** |
| BA-06 required? | **NO** — HOLD continues · observe |
| Recommended inventory action | **RETAIN BA-05 counts** · cite this SA-02 as post-QC-03 disposition stamp |

---

## 3. Options (ADR §3)

### Option A — ACCEPT_AS_IS_P2 HOLD continues · observe — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Declare CTR QC-03 GWC **orthogonal** to FE-ADMIN reopen-gate. All BA-01..05 rows **HOLD RETAIN**. No ba-process rewrite. No Nest invent. Optional P2 ACTIVATE-UI stays **outside** reopen inventory (QC residual only). Unlock FE-ADMIN polish / printable / Nest ABSENT **only** via existing sponsor phrases unchanged. |
| **Benefits** | Seal integrity · honesty · U88 clarity · zero inventory churn |
| **Costs** | Deferred polish / printable module remain OPEN as HOLD (intentional) |
| **Risks** | Misread GWC as printable unlock — mitigated by §2.4 DENY table |
| **Gate** | QC-03 GWC + BA-05 CONFIRMED + CTR-CLAUSE-FE-SA-01 Option B RETAIN |

### Option B — ba-process ADD delta BA-06 (inventory refresh)

| | |
|--|--|
| **Description** | Dispatch ba-process to ADD a cite row noting «AC-02/03 SEALED» under #11 or printable. |
| **Benefits** | Extra traceability stamp in BA chain |
| **Costs** | Doc churn without trigger change · risk of misread as unlock |
| **Risks** | Accidental rewrite of BA seals · sponsor-phrase drift |
| **Gate** | **REJECT default** — mission says ADD-only **if** trigger changes; trigger **unchanged** → B unnecessary |

### Option C — REJECT invent / reopen / flip / Nest unlock

| | |
|--|--|
| **Description** | Treat GWC as unlock Nest FE-ADMIN dual SoT · reopen ATT-SHIFT SA · flip printable · claim module CTR UAT · rewrite BA-01..05 · seed · apps/**. |
| **Benefits** | None |
| **Costs** | Seal loss · honesty breach · C-SLICE violation |
| **Risks** | **DENY** all mission forbidden lines |

---

## 4. Trade-off matrix

| Criteria | Weight | A HOLD observe | B BA-06 ADD | C invent |
|---|--:|--:|--:|--:|
| Seal integrity (QC-03 · BA-05 · ATT-SHIFT) | 5 | **5** | 3 | 0 |
| Honesty / printable=false / C-SLICE | 5 | **5** | 4 | 0 |
| Trigger accuracy (no false unlock) | 5 | **5** | 2 | 0 |
| PM clarity (U88 next) | 4 | **5** | 3 | 0 |
| Trace stamp density | 2 | 3 | **5** | 1 |
| Delivery cost / churn | 4 | **5** | 2 | 0 |
| **Weighted tendency** | | **Dominates** | Optional reject | Reject |

---

## 5. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | PM dispatches Nest invent after GWC | Bus invent KEY / dual admin | Cite §2.4 DENY · CTR-CLAUSE-FE-SA-01 |
| A | PM flips printable from AC-02/03 | honesty JSON true | PRINTABLE-HOLD · BA-03 #21 |
| A | PM reopens ATT-SHIFT SA | Task ATT-SHIFT | QC-03 DENY · this seat DENY |
| A | HOLD misread as «CTR FE-ADMIN absent» | User expects no panel | Cite panel LIVE · Option B FE-SA |
| B | BA-06 changes sponsor phrase | Diff BA files | Reject B · retain A |
| C | Module UAT claim | PROGRAM_JOURNEY_MAP 🟢 | NO-GO · C-SLICE |

---

## 6. Decision (ADR §6)

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_P2 HOLD continues** · **observe HOLD** |
| **Why** | QC-03 sealed **spine** AC-02/03 only. FE-ADMIN Nest notes surfaces already classified LIVE HOLD (#11/#12) or honesty HOLD (#15/#21). **No closable reopen-trigger delta.** Option B adds churn without semantic change. Option C violates DENY list. |
| **Assumptions** | Sponsor did not open CTR clause polish / printable UAT / Nest ABSENT phrases in this message. |
| **Rejected** | Option B default BA-06 · Option C invent/reopen/flip |

### 6.1 Unlock gates (Option A does not open)

| Question | Answer |
|----------|--------|
| Unlock Nest FE-ADMIN invent? | **NO** |
| Unlock #11 polish wave? | **NO** — needs sponsor phrase |
| Unlock printable module? | **NO** — printable=false |
| Unlock ba-process BA-06? | **NO** — no trigger delta |
| Unlock ba-data physical? | **NO** — Nest physical RETAIN |
| Allow optional P2 ACTIVATE-UI? | **YES observe** — QC residual · **≠** reopen-gate unlock |
| Reopen ATT-SHIFT SA? | **DENY** |

### 6.2 next_owner recommendation

| Candidate | Verdict |
|-----------|---------|
| **ba-process** | **HOLD / not required** — no inventory ADD |
| **ba-data** | **HOLD** — no physical delta |
| **observe HOLD** | **YES — recommended** |
| **pm** | Seal this SA-02 · U88 continue **non-CTR** vertical or idle-ok seat · optional P2 ACTIVATE-UI later |

**next_owner:** **pm** (observe HOLD seal) — **not** ba-process / ba-data mandatory.

---

## 7. Architecture diagram logic (text)

```text
CTR-CLAUSE-QC-03 GWC (AC-02/03 + ISSUE spine)
        |
        +-- LIVE spine proofs (C-SLICE)
        |     AC-02 soft-block · AC-03 freeze · bind CLOSED
        |     --> RETAIN Nest SoT · RETAIN FE panel LIVE
        |     --> DOES NOT change BA-01..05 reopen triggers
        |
        +-- Honesty LOCK
        |     contracts_printable_ready=false
        |     C-SLICE-≠-MODULE · DENY module CTR UAT
        |
        +-- DENY edges
        |     ATT-SHIFT SA reopen · Nest dual invent · seed · flip ready
        |
        +-- Orthogonal P2 (QC residual only)
              R-CTR-CL-ACTIVATE-UI --> optional dev-fe (not BA reopen row)

FE-ADMIN-REOPEN-GATE (BA-01..05) ---- HOLD continues (Option A)
```

---

## 8. Impacted systems and dependencies

| System | Impact |
|--------|--------|
| hrm-api ContractLegalPrintService | **None** this seat — already LIVE soft-block |
| ContractLegalPrintSettingsPanel | **None** — HOLD polish |
| Print spine / PDF | **None** — C-SLICE seal ≠ printable GO |
| BA reopen inventory | **RETAIN** counts · 0 ADD rows |
| Honesty registry | **false** all 16 program/module/companion flags RETAIN |
| Peer ATT/EMP/SI/DEC seals | **RETAIN** · ATT-SHIFT **DENY reopen** |

---

## 9. Rollout / checkpoint

| Checkpoint | Owner | PASS when |
|------------|-------|-----------|
| SA-02 Option A LOCKED | sa | This SPEC CONFIRMED |
| Evidence ≥8KB NFD | sa | evidence path written |
| PM seal bus | pm | PASS_TO_PM intake |
| ba-process BA-06 | — | **SKIP** (no trigger delta) |
| Optional ACTIVATE-UI | pm → dev-fe | Only if bandwidth · P2 |

---

## 10. Validation / acceptance evidence plan

| Evidence | Required |
|----------|----------|
| Cite QC-03 GWC stamp `CLQA4-KMZ54C` | YES |
| Cite BA-05 RETAIN inventory | YES |
| Explicit DENY table §2.4 | YES |
| Option A LOCK + next_owner observe | YES |
| No apps/** / no seed | YES |
| Honesty flags false listed | YES |

---

## 11. Explicit DENY (mission lock — reprint)

1. **DENY** reopen sealed **ATT-SHIFT SA**.
2. **DENY** invent Nest FE-ADMIN dual SoT for clauses/templates.
3. **DENY** seed (`pnpm seed:*` / fake inbox).
4. **DENY** flip `contracts_printable_ready` or any of 16 honesty flags.
5. **DENY** claim module CTR UAT / Phase1 DONE / PROGRAM_JOURNEY_MAP module 🟢 from slice GWC.
6. **DENY** rewrite BA-01..05.
7. **DENY** treat `R-CTR-CL-ACTIVATE-UI` as FE-ADMIN Nest invent unlock.
8. **DENY** reopen CLQA2 PATCH P0 / CTR-TPL KEY seal as clause polish pretext.

---

## 12. completion_report (spec)

**Closed:** Option **A LOCKED** · F.1 matrix · unlock/DENY table · BA inventory **0 ADD** · next_owner **pm observe HOLD**.

**Residual open (unchanged HOLD):** `#11` CTR-CL FE polish · `#12` CTR-TPL polish · `#15/#21` printable · Nest ABSENT #1/#2 · all honesty false · P2 ACTIVATE-UI OBS.

**NOT claimed:** Nest invent · printable true · module CTR UAT · BA rewrite · ATT-SHIFT reopen.

---

## 13. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-SA-02-PM-SEAL-01
from_role: pm
to_role: pm
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-SA-02 Option A LOCKED
entry_criteria:
  - Read docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-SA-02.md (CONFIRMED Option A)
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-fe-admin-reopen-gate-sa-02.md
  - RETAIN BA-01..05 inventory counts · honesty all false · C-SLICE
  - DENY Nest invent · ATT-SHIFT reopen · flip printable · module CTR UAT
task:
  1) Seal bus SA-02 = PASS_TO_PM · Option A HOLD continues · 0 BA ADD rows
  2) Do NOT dispatch ba-process BA-06 (no reopen-trigger delta)
  3) Do NOT dispatch ba-data
  4) U88: continue non-CTR vertical OR idle-ok seat OR optional P2 ACTIVATE-UI later (QC residual — not FE-ADMIN invent)
exit: bus SEALED · TEAM_WORKING_NOW updated · observe HOLD
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-fe-admin-reopen-gate-sa-02.md
ack_status_target: PASS_TO_PM
```

---

## 14. Handoff packet

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-SA-02` |
| from_role | sa |
| to_role | pm |
| selected_option | **Option A** ACCEPT_AS_IS_P2 HOLD continues |
| next_owner | **pm** (observe HOLD) |
| ba-process | **HOLD — not required** |
| ba-data | **HOLD — not required** |
| evidence_path | `docs/qa/evidence/po-hrm-dynamic-config-platform-fe-admin-reopen-gate-sa-02.md` |
| ack_status | **PASS_TO_PM** |

---

*End of SA-02 — ADD-only Option/F.1 · CTR QC-03 GWC ≠ FE-ADMIN Nest unlock · BA-05 RETAIN · Option A LOCKED · PASS_TO_PM*