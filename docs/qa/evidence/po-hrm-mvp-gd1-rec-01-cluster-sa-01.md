# Evidence — PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01` |
| **role** | sa · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md` |
| **selected_option** | **A** — UPGRADE AS-IS `recruitment_plans` → định biên SoT + ADD spawn |
| **ack_status** | **PASS_TO_PM** CONFIRMED |
| **change_mode** | Docs-only · **NO** `apps/**` · **no seed** |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | `PO_HRM_MVP_GD1_CONTINUOUS.md` | Wave-1 OPEN · UC-BP-REC-01 + 01b |
| 2 | `SPONSOR_SRS_CHOT_LOCK.md` | SRS v0.8 paper lock · REC-03 OUT · product GO ≠ paper |
| 3 | `WBS_HRM_ENTERPRISE.md` WBS-REC-01 / 01b | BR-BP-HC-01 · BR-BP-HC-04 · Q-REC-HEADCOUNT cited |
| 4 | `SRS_HRM_ENTERPRISE.md` FR-01 / 01b | 7-mục FR · synonym «Kế hoạch tuyển»=định biên · single Cần tuyển |
| 5 | `UC_INVENTORY.md` | REC-01 / 01b Ưu tiên · REQ_REC_003/005 |
| 6 | AS-IS `apps/**` | See §2 |
| 7 | ADR Option template §§1–7 + F.1 | Applied in spec |

---

## 2. AS-IS probes (facts)

| Probe | Evidence |
|-------|----------|
| Plan tables | `recruitment-catalog.service.ts` `CREATE TABLE recruitment_plans` + `_departments` + `_positions` (`months_data` JSONB) |
| Month model FE | `useRecruitmentPlans.ts` / `Recruitment.tsx` — `{ns, dx}` dual editors (i18n `recruitment.ns` / `.dx`) |
| Plan WF | `recruitment-workflow.bridge.ts` · `WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE` · table `recruitment_plans` |
| YCTD | `job_requisitions` LIVE · JD soft FK · **no** `headcount_cell_id` / `headcount_mode` in Nest recruitment grep |
| Spawn | **ABSENT** — no `spawn-requests` / auto-spawn service in `apps/api/hrm-api/src/recruitment` |
| Paper API | `API_DESIGN` F-REC-HC-01..03 · F-REC-HC-05 present (logical `/rec/headcount-plans`) |
| Paper DB | `rec_headcount_plan` / `_cell` documented — **not** created as physical Nest ensure-schema |
| Q-REC-HEADCOUNT | SRS Decision Log **Đã chốt**: Ngoài ĐB + BOD; XBOS theo tenant |
| Parallel entity | `headcount_proposals` + `HeadcountProposalTab` = ngoài định biên proposals — **≠** FR-01 grid SoT |
| Honesty | `recruitment_uat_ready=false` must_keep on REC surfaces |

---

## 3. Disposition summary

| Item | Value |
|------|-------|
| Option A | UPGRADE plan spine + normalize single need_hire + ADD spawn → `job_requisitions` |
| Option B | Greenfield `rec_headcount_*` — **REJECTED** (dual SoT) |
| Option C | HOLD no unlock — **REJECTED** (U89) |
| F.1 unlock | F-REC-HC-01 upgrade · HC-02 RETAIN WF · HC-03 cell-lock semantics · **HC-05 ADD** |
| Peer RETAIN | YCTD/JD/UV/IV/stage catalog · XBOS bridges |
| DENY | REC-03 · dual SoT · seed · honesty flip · module UAT claim |

---

## 4. Honesty / C-SLICE footer

```text
recruitment_uat_ready=false
C-SLICE ≠ module REC UAT
U65 zero-seed
product_go=false (program)
UC-BP-REC-03 OUT
```

---

## 5. BA alignment

| Item | Result |
|------|--------|
| BA-01 | **CONFIRMED** (parallel) — AC-REC-HC-* · VAL-REC-HC-* · J-HRM-REC-HC-01/01b DRAFT |
| D1–D4 | **SEALED** in SA spec §9 (path upgrade · tokens · CFG activation · drift warn) |
| D5 / vượt grid | **OUT** — REC-02b / Q-REC-HEADCOUNT cite only |
| Q-REC-HC-2 | RETAIN TP+HR |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **ba-data** (physical DB) **+** **sa** API F.1 DOC-DELTA |
| **next_work_item** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01` / `PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01` |
| **ack_status** | **PASS_TO_PM** |

---

## 7. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-01 · UC-BP-REC-01b

MISSION: Physical DB_DESIGN DOC-DELTA for SA Option A LOCKED + BA-01 AC CONFIRMED.
Map recruitment_plans/_departments/_positions → cell projection (headcount_need_hire);
ADD job_requisitions.headcount_cell_id + headcount_mode + target_month;
UQ spawn key; migrate ns/dx → need_hire (dx prefer); DENY second rec_headcount_* SoT table.

READ: docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md §2 §6 §8 §9
      docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md
      DB_DESIGN §2.2–2.3 · evidence sa-01 + ba-01

DELIVER: docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md
         + evidence · client DB_DESIGN DOC-DELTA pointer
must_keep: Option A · XBOS WF · YCTD spine · REC-03 OUT · honesty false · U65
EXIT: PASS_TO_PM · next_owner sa API-01 F.1 physical paths then Dev
```

---

## completion_report

- **Closed:** Option A CONFIRMED; D1–D4 sealed vs BA-01; F.1 unlock; LIVE vs gap; handoff physical.
- **Open:** DATA-01 / API-01 seats; Dev after contracts.
