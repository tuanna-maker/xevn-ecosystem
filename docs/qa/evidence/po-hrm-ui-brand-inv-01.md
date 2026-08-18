# Evidence — PO-HRM-UI-BRAND-INV-01 (RE-KICK)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-INV-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **program** | `PO-HRM-UI-BRAND-REMASTER-01` · Wave W1 |
| **date** | 2026-08-05 |
| **mode** | **RE-KICK** — prior stall / inventory coverage MISS → closed |
| **ack_status** | **PASS_TO_PM** |

---

## entry_criteria (met)

- [x] Read `docs/program/HRM_UI_BRAND_REMASTER_PROGRAM.md`
- [x] Read `ATT_SURFACE_INVENTORY_DEEP.md` S01–S90
- [x] Read `HRM-EMPLOYEES_FIDELITY_MATRIX.md` (EMP fidelity 28)
- [x] Applied OUT locks: **PROP-03e** QR · **REC-03** campaign · **CORE-04** OCR
- [x] Included Face **Mobile MVP** batch **MOB** (W4-MOB-A)
- [x] **Cấm** honored: no `apps/**` write · no remaster-done claim · no seed

---

## Prior MISS (why RE-KICK)

| Defect | Fix in RE-KICK |
|--------|----------------|
| ATT slice **W3-ATT-G** claimed ≤15 but listed **24** surfaces | Split → **G1 (13) + G2 (10)** |
| S47 leave-delete missing from slices | Added to **W3-ATT-C** |
| S43 duplicated ATT-C + ATT-F | Owned only by **W3-ATT-C** |
| CORE-04 OCR not stamped SKIP | Lock + §7 + EMP note |
| Evidence closed without coverage proof | Machine audit below |

---

## exit_criteria (met)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` with squad batches | **PASS** |
| 2 | Columns: surface_id · module · route/menu · type · priority · squad_batch · notes | **PASS** |
| 3 | Cover ATT deep + EMP + REC/PAY + portal + MOB Face | **PASS** |
| 4 | SKIP OUT: PROP-03e · REC-03 · CORE-04 (+ DEAD/S71) | **PASS** |
| 5 | Squad slices ≤15 each · ATT coverage 83/83 | **PASS** |
| 6 | Evidence + PASS_TO_PM | **PASS** (this file) |

---

## Coverage audit (machine)

```text
ATT SKIP = S15,S16,S71,S86,S87,S88,S89 (7)
ATT in-scope = 83
W3-ATT-A..G2 union = 83 unique · 0 dup · 0 miss
EMP E01–E28 = 28 · slices A11+B11+C6 = 28
OUT stamps = PROP-03e · REC-03(R07) · CORE-04 · S71 · DEAD
MOB Face = W4-MOB-A {MOB-01,03,04,04b,05,13}
```

---

## Deliverable summary

| Metric | Value |
|--------|------:|
| Surfaces inventoried | **178** (incl. MOB-04b) |
| Surface SKIP | **8** (S15–16, S71, S86–89, R07) |
| Stamp-only OUT | **CORE-04 OCR** |
| Remaster in-scope | **170** |
| Squad batches | FE-PORTAL · FE-ATT · FE-EMP · FE-REC · FE-PAY · **MOB** |
| ATT slices | W3-ATT-A…**G2** (≤15) |
| EMP slices | W3-EMP-A…C |
| REC slices | W3-REC-A…B (R07 skipped) |
| PAY slices | W3-PAY-A…B |
| MOB slices | W4-MOB-A…C (**Face in A**) |

### OUT / SKIP stamped

| ID | Reason |
|----|--------|
| S15–S16 | **PROP-03e OUT** — QR employee card |
| R07 | **REC-03 OUT** — campaign hub |
| CORE-04 | **OCR OUT** — no surface; cấm invent chrome |
| S71 | Gap matrix OUT |
| S86–S89 | DEAD orphan modals |
| S17–S19 web Face | Honesty chrome only; product = **MOB-04 / MOB-04b** |

---

## completion_report

```yaml
work_item_id: PO-HRM-UI-BRAND-INV-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
completion_report: |
  RE-KICK CLOSED W1 inventory coverage MISS.
  SoT: docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md — 178 rows;
  ATT slice audit 83/83 (G1+G2); EMP 28/28; MOB-04b Face enroll added.
  OUT SKIP: PROP-03e S15-16 · REC-03 R07 · CORE-04 OCR stamp · DEAD · S71.
  Face Mobile MVP → W4-MOB-A; web Face = honesty FE-ATT-G1.
  Squad slices ≤15; next = ADR-01 then Dev-FE foundation then W3 squads.
  No apps/** · no remaster claim · no seed.
residual:
  - SA ADR tokens (W0) still required before FE foundation remaster
  - Sponsor §3 Open Questions may override A1–A5
  - Nested REC/PAY micro-dialogs may expand at squad kickoff
evidence_path: docs/qa/evidence/po-hrm-ui-brand-inv-01.md
next_owner: sa
```

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-ADR-01
from_role: pm
to_role: sa
lane: governance
priority: P0
program: PO-HRM-UI-BRAND-REMASTER-01 · Wave W0
entry_criteria: |
  Inventory CLOSED (RE-KICK): docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md
  Coverage: ATT 83/83 · EMP 28/28 · OUT PROP-03e · REC-03 · CORE-04 · Face=W4-MOB-A
  Program A1–A5: docs/program/HRM_UI_BRAND_REMASTER_PROGRAM.md
  Open Q: docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_UI_BRAND_OPEN_QUESTIONS.md §3–§4
  Skill: ~/.cursor/skills/xevn-precision-motion-theme/SKILL.md
exit_criteria: |
  ADR brand tokens (CSS vars · primary · text sharp · modal chrome · embed vs portal)
  Cite inventory squad_batch; Face web honesty vs MOB MVP; SKIP OUT list unchanged.
  PASS_TO_PM → next Dev-FE foundation W2.
  Cấm: apps/** remaster; claim UI ship; seed; invent OCR/Campaign/QR-card chrome.
evidence_path: docs/qa/evidence/po-hrm-ui-brand-adr-01.md
```

**After ADR PASS — Dev-FE foundation:**

```text
work_item_id: PO-HRM-UI-BRAND-FE-FOUND-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
program: PO-HRM-UI-BRAND-REMASTER-01 · Wave W2
entry_criteria: |
  ADR-01 cited; inventory SoT RE-KICK; U65 no seed
  skill xevn-precision-motion-theme; pale-text gate plan
exit_criteria: |
  Theme foundation: CSS vars + shadcn token wire + pale-text grep gate PASS
  No full-screen remaster yet; screenshot shell/login sample only
  READY_FOR_QA foundation smoke → PM dispatch W3-PORT-A + W3-ATT-A + W3-EMP-A
  Cấm: remaster all in one Task; API; hide stub honesty; remaster S15–16/R07/OCR
evidence_path: docs/qa/evidence/po-hrm-ui-brand-fe-found-01.md
read_first:
  - docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md
  - docs/program/HRM_UI_BRAND_REMASTER_PROGRAM.md
  - ADR from PO-HRM-UI-BRAND-ADR-01
```

---

## pm_dispatch_hint

`PO-HRM-UI-BRAND-ADR-01` (sa) → `PO-HRM-UI-BRAND-FE-FOUND-01` (dev-fe) → squads `W3-PORT-A` + `W3-ATT-A` + `W3-EMP-A` · Face `W4-MOB-A` after web foundation.

---

*PO-HRM-UI-BRAND-INV-01 · ba-process · RE-KICK · PASS_TO_PM*
