# PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01 — Option/F.1 · Định biên × Auto YCTD (Wave-1 unlock)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · BA-01 AC **CONFIRMED** (aligned) · unlock TechSpec/DB/API → Dev |
| **ref_ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md` · Q-REC-HC-2 (TP+HR) |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **v0.8+** · **FR-UC-BP-REC-01** · **FR-UC-BP-REC-01b** |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · **WBS-REC-01** · **WBS-REC-01b** |
| **ref_lock** | `SPONSOR_SRS_CHOT_LOCK.md` · `UC_INVENTORY.md` rows REC-01/01b |
| **ref_decision** | **Q-REC-HEADCOUNT** = **Cho ngoài ĐB + duyệt BOD**; workflow **XBOS theo tenant** — **đã chốt** (SRS § Decision Log) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §2.2 `rec_headcount_plan` / `rec_headcount_plan_cell` · §2.3 `rec_recruitment_request` |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-HC-01..03** · **F-REC-HC-05** (spawn) · peer F-REC-YCTD-* (OUT of Dev this cluster except spawn→YCTD write) |
| **OUT** | **UC-BP-REC-03** campaign / hub đa kênh · `job_postings` làm SoT YCTD/JD |
| **Honesty** | `recruitment_uat_ready=false` · 16 program honesty flags **false** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-1 architecture unlock: định biên vị trí × 12 tháng + auto sinh YCTD theo ô «Cần tuyển» |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-REC-01 · FR-UC-BP-REC-01b · BR-BP-HC-01 · BR-BP-HC-02 · BR-BP-HC-04 · partner REQ_REC_003 · REQ_REC_005 · Q-REC-HEADCOUNT |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | Portal/HRM có màn «Kế hoạch tuyển» trên `recruitment_plans` + dept/pos + `months_data` JSON `{ns, dx}`; submit duyệt qua **XBOS** (`hrm_recruitment_plan_approval`). YCTD LIVE = `job_requisitions` (+ JD soft FK). Tab `headcount_proposals` = đề xuất **ngoài** lưới — **không** phải SoT FR-01. |
| **Paper target** | Lưới **định biên** phòng ban trình → duyệt → HCNS tổng hợp; mỗi ô tháng **một** trạng thái + **một** số **Cần tuyển**; sau duyệt auto spawn **đúng một** YCTD / ô (BR-BP-HC-04). |
| **Gap class** | Schema/API paper (`rec_headcount_*`, `/rec/headcount-plans/*`, `spawn-requests`) **chưa** physical trên Nest AS-IS; UI còn **hai cột số** ns/dx (trùng nghĩa kế hoạch/đề xuất — **FAIL** SRS đặc biệt); dept/pos **free-text name**; **không** `headcount_cell_id` trên YCTD; **không** idempotent spawn. |
| **Constraints** | U89 continuous · preserve_default · C-SLICE · DENY invent ngoài SRS · DENY REC-03 · DENY seed · DENY flip `recruitment_uat_ready` · Q-REC-HEADCOUNT đã chốt (ngoài ĐB + BOD + XBOS) |
| **Failure impact if unresolved** | Wave-1 idle / Dev invent dual SoT / BA AC lệch AS-IS → regression YCTD/JD/WF đã LIVE |

### 1.2 Architecture diagram (target — Option A)

```text
  Trưởng BP ──► Lưới định biên (OU × position × 12 tháng)
                    │  SoT physical AS-IS UPGRADE:
                    │  recruitment_plans + _departments + _positions
                    │  (+ cell projection / normalize months → need_hire)
                    ▼
              Submit / Approve ──► XBOS WF (RETAIN bridge
                    │               hrm_recruitment_plan_approval)
                    ▼
              Cells «Cần tuyển» approved ──► F-REC-HC-05 spawn
                    │                         (idempotent 1 YCTD / ô)
                    ▼
              job_requisitions (YCTD LIVE) ── headcount_mode=in_plan
                    │                         + headcount_cell_id (ADD)
                    ▼
              HCNS pipeline / REC-02* (QUEUED — not this Dev wave)
```

**Label lock:** UI «Kế hoạch tuyển» = **đồng nghĩa** định biên (SRS) — **không** entity SoT thứ hai.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS/DB/API) | AS-IS LIVE | Verdict |
|------------|--------------------|------------|---------|
| Plan header year + status + WF | `rec_headcount_plan` | `recruitment_plans` + `workflow_instance_id` + submit-workflow | **LIVE — UPGRADE** (alias logical name) |
| Dept × position grid | cells FK dept/position | `recruitment_plan_departments` / `_positions` | **LIVE skeleton — GAP** catalog keys + cell identity |
| Month cell SoT | `rec_headcount_plan_cell` UQ (plan, dept, pos, month) · `headcount_need_hire` | `months_data[]` `{ns, dx}` — **dual number** | **GAP P0** — normalize → single **Cần tuyển** + cell_status |
| Actor phòng ban trình / HCNS rollup | FR Diễn biến #1–#5 | Scope/OU ownership weak; HCNS có thể nhập hộ | **GAP** — scope_parity + role AC |
| Approve lock cells | F-REC-HC-03 | Status approve via WF/local — **no cell lock semantics** | **GAP** |
| Auto spawn YCTD | F-REC-HC-05 · BR-BP-HC-04 | **ABSENT** endpoint/service | **GAP P0** |
| YCTD in-plan link | `headcount_cell_id` + `headcount_mode` | `job_requisitions` **no** cell FK / mode | **GAP** (ADD columns / soft link) |
| YCTD CRUD + JD bind + UV | REC-02 / JD / UV seats | **LIVE** must_keep | **RETAIN** |
| XBOS approval | Q-REC-HEADCOUNT WF tenant | Plan + requisition bridges LIVE | **RETAIN** |
| `headcount_proposals` tab | ngoài ĐB proposal (peer REC-02b) | LIVE tab «đề xuất ngoài định biên» | **NOT** FR-01 SoT — **HOLD** reopen as REC-02b later |
| Campaign / job_postings SoT | REC-03 OUT | job_postings catalog twin non-primary | **OUT / DENY** invent |

---

## 3. Options

### Option A — UPGRADE AS-IS `recruitment_plans` → định biên SoT + ADD spawn (RECOMMENDED)

| | |
|--|--|
| **Description** | Giữ physical tables + Nest routes `/api/hrm/recruitment/recruitment-plans*` và XBOS bridge. DOC+Dev delta: (1) chuẩn hóa `months_data` → **một số `need_hire`** / tháng + `cell_status` ∈ {current \| need_hire \| projected}; (2) ADD identity ô (logical cell id hoặc UQ projection); (3) dept/position **catalog keys** (không free-text SoT); (4) approve → lock need_hire cells; (5) ADD `POST …/spawn-requests` (alias paper F-REC-HC-05) idempotent insert `job_requisitions` với `headcount_mode=in_plan` + soft FK cell; (6) UI nhãn đồng nghĩa «Định biên». Paper names `rec_headcount_*` = **logical alias** trong DB/API design — **cấm** tạo bảng song song cùng nghĩa. |
| **Benefits** | Preserve WF + FE plan surface; fastest U89 unlock; zero dual-SoT; aligns SRS label map |
| **Costs** | Migration `ns/dx` → single need_hire; FE grid remaster; ADD YCTD columns; ba-data physical contract |
| **Risks** | Data remap ambiguity ns vs dx — **mitigate:** BA AC + one-time map rule (prefer `dx` as legacy «đề xuất cần tuyển» **or** `max(ns,dx)` — **BA must CONFIRM**, SA forbids invent silent default in Dev) |

### Option B — Greenfield `rec_headcount_plan` / `_cell` + new Nest `/rec/headcount-plans`

| | |
|--|--|
| **Description** | Implement paper tables/routes as new SoT; deprecate or dual-run `recruitment_plans`. |
| **Benefits** | Clean paper fidelity |
| **Costs** | Dual SoT migration; rewrite FE; re-wire XBOS business_type; high blast radius |
| **Risks** | Regression plan WF + sponsor «Kế hoạch tuyển» path; C-SLICE violation if claimed UAT from new slice alone |

### Option C — HOLD / ACCEPT_AS_IS_P2 (docs only · no unlock)

| | |
|--|--|
| **Description** | Stamp gap inventory; no BA/Dev unlock. |
| **Benefits** | Zero churn |
| **Costs** | Blocks U89 Wave-1 continuous |
| **Risks** | Sponsor idle / phase-split temptation — **violates U89** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (SRS FR-01/01b) | 25 | **9** | 9 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 4 | 1 |
| Complexity / blast radius | 15 | **7** | 3 | 9 |
| Security / scope_parity U19 | 10 | **8** | 7 | 5 |
| Reliability (idempotent spawn + WF) | 15 | **8** | 6 | 3 |
| Maintainability (one SoT) | 15 | **9** | 4 | 4 |
| **Weighted (≈)** | 100 | **8.5** | **5.5** | **3.4** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Dev invents second `rec_headcount_*` table alongside plans | Diff review / ba-data | **DENY** dual physical SoT; logical alias only |
| A | Keep ns+dx dual columns in FE | QA SRS special-case | BA AC FAIL if two number columns remain |
| A | Spawn duplicates on reopen | Jest + unique key | UQ `(company_id, plan_version/cell_id)` or `(plan_id, dept_key, position_key, month)` |
| A | Spawn without plan approved | API 409 | F-REC-HC-05 gate |
| A | Flip recruitment_uat_ready after slice GWC | QC honesty footer | **DENY**; C-SLICE |
| B | Dual SoT plan vs headcount | Grep / QA | Reject Option B |
| C | Wave-1 stalls | Board seat OPEN forever | Reject Option C under U89 |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — UPGRADE AS-IS `recruitment_plans` spine → định biên SoT + ADD auto-spawn to `job_requisitions` |
| **Why selected** | Maximizes preserve_default on LIVE WF/YCTD/JD; closes BR-BP-HC-01/04 without greenfield dual SoT; matches SRS UI synonym lock; unlocks continuous Wave-1 |
| **Assumptions** | Q-REC-HEADCOUNT remains: ngoài ĐB + BOD + XBOS tenant matrix (peer REC-02/02b — **not** re-litigated here). Spawn default `headcount_mode=in_plan`. Activation schedule tenant-configurable (after approve **or** calendar month) — BA AC. |
| **Rejected** | **B** — dual SoT / rewrite cost · **C** — blocks U89 |

### 6.1 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | XBOS plan + requisition WF bridges · `job_requisitions` YCTD spine · JD soft FK · UV↔YCTD · IV one-active · REC pipeline stage catalog · soft-delete · scope_parity list↔get |
| **DENY invent** | REC-03 campaign · `job_postings` as YCTD/JD SoT · second headcount plan table · seed for QA · flip `recruitment_uat_ready` / program honesty · claim module REC UAT from this cluster alone |
| **OUT** | UC-BP-REC-03 |
| **HOLD peer** | `headcount_proposals` tab = REC-02b-ish — **not** mutate as FR-01 SoT this wave |
| **Honesty** | All flags **false** until named waves |

---

## 7. Implementation and Validation Plan

### 7.1 Rollout steps (governance → execution)

1. **BA-process** — AC pack **CONFIRMED** (`PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01`) — **DONE**.
2. **ba-data / SA API** — Physical DB + F.1 DOC-DELTA (Option A §8–§9 D1–D4).
3. **Dev-BE** — schema ADD + normalize + spawn idempotent + scope_parity tests.
4. **Dev-FE** — single Cần tuyển column; label Định biên synonym; post-2xx + F5 AC.
5. **QA** — browser U65 UF/J-* for cluster only · **no seed**.
6. **QC** — GWC C-SLICE · honesty footer false · **no** recruitment_uat_ready flip.

### 7.2 Rollback

- Feature-flag spawn off; retain prior plan CRUD/WF.
- No drop of `recruitment_plans` / `job_requisitions`.

### 7.3 Validation checkpoints

| Gate | PASS when |
|------|-----------|
| Spec | This Option A CONFIRMED + BA AC CONFIRMED |
| Physical | ba-data/API F.1 cite physical paths + DTO↔column |
| L0–L2.5 | Stack up; browser FE path; F5 retains cells + spawned YCTD |
| Honesty | Evidence stamps `recruitment_uat_ready=false` |

### 7.4 Success criteria (architecture)

- One SoT định biên = upgraded plan spine.
- Every approved need_hire cell → ≤1 YCTD (idempotent).
- XBOS WF retained for approvals.
- No REC-03 / dual SoT / honesty flip.

---

## 8. F.1 API matrix (disposition — physical prefer Option A)

> Full request/response column contracts = **next** TechSpec/API seat after BA AC. This seat **locks** which F-ids unlock and which physical base path.

| F-id | Mục đích | SRS bước | Physical path (Option A) | Paper alias | Status |
|------|----------|----------|---------------------------|-------------|--------|
| **F-REC-HC-01** | Get/upsert lưới định biên | FR-01 #1–#2 | `GET/PUT /api/hrm/recruitment/recruitment-plans*` (+ cells/months normalize) | `/api/hrm/rec/headcount-plans/{year}` | **UNLOCK upgrade** |
| **F-REC-HC-02** | Submit duyệt | FR-01 #3 | `POST …/recruitment-plans/:id/submit-workflow` (RETAIN) ± status | `…/submit` | **LIVE RETAIN** + AC depth |
| **F-REC-HC-03** | Approve/reject + lock cells | FR-01 #4–#5 | WF callback / status endpoints (RETAIN bridge) | `…/approve` `…/reject` | **UNLOCK semantics** (cell lock) |
| **F-REC-HC-05** | Auto spawn YCTD | FR-01b #1–#2 | **ADD** `POST …/recruitment-plans/:id/spawn-requests` | `…/headcount-plans/{planId}/spawn-requests` | **UNLOCK ADD** |
| **F-REC-YCTD-01** | Create YCTD in-plan (manual) | FR-02 | `POST /api/hrm/recruitment/requisitions` | `/rec/recruitment-requests` | **RETAIN** — peer QUEUED REC-02; spawn uses same write path |
| **F-REC-YCTD-02** | YCTD out-of-plan + BOD | FR-02b | same POST + `headcount_mode=out_of_plan` | — | **OUT this cluster** (Q-REC-HEADCOUNT retained for peer) |

### 8.1 Spawn contract invariants (BR-BP-HC-04)

| ID | Invariant |
|----|-----------|
| HC-S1 | Spawn only when plan status **approved** (post-WF) |
| HC-S2 | Source cells only `cell_status=need_hire` (or need_hire qty ≥ 1) — **never** projected/current alone |
| HC-S3 | Exactly **one** YCTD per `(plan_id, department_key, position_key, month)` for a given plan version |
| HC-S4 | Re-open / re-call spawn → `skipped_duplicate` · **no** second row |
| HC-S5 | Qty change after spawn → **D4 warn/drift** (`HRM-HC-SPAWN-QTY-DRIFT`); **no silent overwrite**; explicit YCTD PATCH only |
| HC-S6 | Missing tenant activation CFG → **block auto** + message (D3); `mode=on_approve` only when CFG explicit |
| HC-S7 | Spawned YCTD: `headcount_mode=in_plan` · soft `headcount_cell_id` · qty from cell · position/dept from catalog keys · optional JD bind if configured |

### 8.2 Scope parity (U19)

List plans / get plan / mutate cells / spawn / list requisitions by cell — **same** `resolveHrmListScope` + company persist rules as existing recruitment module.

---

## 9. BA D1–D4 seal (aligned with BA-01 CONFIRMED)

> BA-01 paper AC **CONFIRMED** 2026-08-09 — `depends_on` this Option A. SA seals open decisions:

| # | Topic | SA LOCK (Option A) |
|---|-------|---------------------|
| **D1** | Physical path / DTO columns | **Physical prefer:** `/api/hrm/recruitment/recruitment-plans*` + **ADD** `…/:id/spawn-requests`. Logical paper `/rec/headcount-plans*` = **alias only**. API field **`need_hire`** (SRS «Cần tuyển»); DB column prefer **`headcount_need_hire`** on cell projection (paper §2.2) — ba-data maps 1:1; **cấm** dual persist `ns`+`dx` post-wave. Legacy map: **`need_hire = dx` if dx>0 else ns`** (đề xuất/cần tuyển column was `dx` in FE warning color) — document in migrate note. |
| **D2** | Plan / cell status tokens | **Plan:** `draft` \| `pending_approval` \| `approved` \| `rejected` (RETAIN AS-IS WF set; map paper `submitted`↔`pending_approval`). **Cell semantic status:** `current` \| `need_hire` \| `projected` (SRS Hiện tại/Cần tuyển/Dự kiến). **Cell lifecycle after approve:** `open` → `need_hire_approved` → `fulfilled` \| `cancelled` (paper). Error codes: `HRM-HC-*` family (ba-data/API seat mint exact). |
| **D3** | Activation schedule | **Tenant CFG required** for auto job path; **thiếu CFG → chặn auto + thông báo** (SRS + AC-REC-HC-01b-EX). **Allowed MVP default:** spawn-on-approve **only when** CFG explicitly `mode=on_approve` — **cấm** silent default without CFG row. |
| **D4** | Qty change after spawn | **LOCK = warn/drift path (no silent overwrite):** API surfaces `HRM-HC-SPAWN-QTY-DRIFT`; FE cảnh báo lệch; YCTD qty **unchanged** until HCNS **explicit** PATCH YCTD (peer REC-02 path). **DENY** auto version entity invent in this cluster; versioning = **optional later ADD** if sponsor asks. |
| **D5** | Vượt HC trên lưới ĐB | **OUT seat** per BA — cite Q-REC-HEADCOUNT / REC-02b only; **cấm** invent warn/block policy on FR-01 grid beyond SRS specials already in AC |
| **Q-REC-HC-2** | TP + HR SoT | **RETAIN cite** — Option A scope_parity must enforce OU write = TP phòng; HCNS rollup read |

### 9.1 Legacy ns/dx (closed)

Dual columns **FAIL** SRS post-wave. Migrate rule D1 above. FE shows **one** Cần tuyển editor.

---

## 10. Exit / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · Option **A** CONFIRMED · BA D1–D4 **SEALED** |
| **next_owner** | **sa** TechSpec/DB/API DOC-DELTA **or** **ba-data** physical (`PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01` / `…-API-01`) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-sa-01.md` |
| **Unlocks** | Physical DB/API F.1 depth → Dev-BE/FE |
| **Does not unlock** | Dev without physical contracts · REC-02/02b · REC-03 · honesty flips · seed |

---

## completion_report

- **Closed:** Option A/B/C + trade-off + F.1 disposition; LIVE vs gap; Q-REC-HEADCOUNT + Q-REC-HC-2 retained; BA-01 D1–D4 sealed; REC-03 OUT; honesty/C-SLICE.
- **Residual:** TechSpec/DB/API physical DOC-DELTA (next seat); Dev after contracts.
