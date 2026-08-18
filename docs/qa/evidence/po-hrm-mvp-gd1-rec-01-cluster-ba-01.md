# Evidence — PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **from_role** | ba-process |
| **to_role** | pm → **ba-data** (+ sa TechSpec/API depth) |
| **Date** | 2026-08-09T02:20:00+07:00 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md` |
| **ref_sa** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md` **Option A LOCKED** |
| **lane** | governance |
| **no_prompt_echo** | true |

---

## 1. Scope closed

| Item | Result |
|------|--------|
| AC pack vs SRS FR-01/01b | **CONFIRMED** |
| Align SA **Option A** (UPGRADE `recruitment_plans` + ADD spawn) | **CONFIRMED** |
| **O1** ns/dx → need_hire | **CONFIRMED** — `dx→need_hire` · `ns→headcount_current` · dual FE **FAIL** |
| **O2** activation | **CONFIRMED** — CFG on_approve\|calendar_month · **default on_approve** if unset |
| **O3** qty drift | **CONFIRMED** — warn + version confirm · **no silent overwrite** |
| **O4** vượt grid | **CONFIRMED** — warn allow approve ĐB · BOD/ngoài ĐB = REC-02b |
| **O5** HCNS rollup | **CONFIRMED** — read aggregation ≠ write-all |
| FE after 2xx + F5 Diễn biến | **CONFIRMED** |
| VAL-REC-HC-01..16 · BR-BP-HC-04 idempotent | **CONFIRMED** |
| J-HRM-REC-HC-01 / 01b DRAFT U19 | **ADDED** journey map + BA TRACE §26 |
| DENY REC-03 · seed · honesty false · C-SLICE · dual physical table | **Locked** |

## 2. Residual

| ID | Residual | Owner |
|----|----------|-------|
| Physical columns / UQ / YCTD FK | Option A EXPAND | **ba-data** |
| API F.1 depth physical paths | DOC-DELTA | **sa** |
| Dev wire | After DATA+API | HOLD |

## 3. Honesty

```text
recruitment_uat_ready=false
C-SLICE ≠ module REC UAT
U65 zero-seed
UC-BP-REC-03 OUT
```

## 4. Spec size

| File | Bytes (approx) |
|------|----------------|
| BA spec | see filesystem |
| This evidence | rewritten Option A align |

## 5. completion_report

**Closed:** AC pack CONFIRMED against SA Option A; O1–O5 sealed; FE mutate Diễn biến; validation; trace; U19 journeys; honesty locks.

**Open:** ba-data physical · sa API F.1 depth · Dev HOLD · UF matrix rows DRAFT until FE.

## 6. next_owner / next_dispatch_prompt

**next_owner:** `ba-data`

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)

MISSION: Physical DB DOC-DELTA for SA Option A + BA O1–O5 CONFIRMED.
READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md (Option A · HC-S1..S7)
2. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md (O1–O5 · VAL)
3. DB_DESIGN §2.2/2.3 (logical alias only — DENY dual physical rec_headcount_*)
4. AS-IS recruitment_plans / _departments / _positions / job_requisitions

DELIVER:
- docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md
- evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-data-01.md
- Map: months_data normalize need_hire=dx · current=ns · cell identity/UQ · YCTD ADD headcount_cell_id + headcount_mode + target_month · spawn idempotent key
- DENY second headcount plan table · DENY REC-03 · no seed · honesty false

EXIT: PASS_TO_PM CONFIRMED · next_owner sa (API F.1 physical) or pm unlock Dev-BE after API
```

## 7. ack_status

**PASS_TO_PM CONFIRMED**
