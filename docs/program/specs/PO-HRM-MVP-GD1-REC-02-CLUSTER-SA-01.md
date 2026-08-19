# PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01 — Option/F.1 · YCTD trong/ngoài ĐB + BOD fork

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → TechSpec/DB/API → Dev |
| **depends_on** | QC-02 GWC REC-01/01b sealed — `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qc-02.md` |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **ref_sa_spine** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md) **Option A** — **reuse · do not fork SoT** |
| **ref_api_spine** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md) · [`…-DATA-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md) (`headcount_mode` / `headcount_cell_id` already ADD) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-02** · **FR-UC-BP-REC-02b** |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · **WBS-REC-02** · **WBS-REC-02b** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-YCTD-01..04** (+ JD overlay F-YCTD-JD-*) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §2.3 `rec_recruitment_request` = **logical alias** of `job_requisitions` |
| **ref_decision** | **Q-REC-HEADCOUNT** = Cho ngoài ĐB + duyệt BOD; WF **XBOS theo tenant** — **RETAIN · do not re-litigate** · **Q-REC-HC-2** = TP + HR |
| **OUT** | **UC-BP-REC-03** campaign / hub đa kênh · `job_postings` làm SoT YCTD/JD · dual `rec_headcount_*` |
| **Honesty** | `recruitment_uat_ready=false` · 16 program honesty flags **false** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-2 architecture unlock: YCTD **trong** ĐB (rút gọn) × YCTD **ngoài** ĐB (dài + BOD) + chặn mở tin đến khi duyệt |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-REC-02 · FR-UC-BP-REC-02b · BR-BP-HC-05 · BR-BP-HC-06 · BR-BP-JD-01 · BR-YCTD-JD-REF-01/02 · Q-REC-HEADCOUNT · Q-REC-HC-2 |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | YCTD = `public.job_requisitions` + JD soft FK (`job_template_id`) + XBOS bridge `hrm_requisition_approval` / `WF_BUSINESS_TYPE_HRM_REQUISITION`. REC-01 already **ADD** `headcount_cell_id` · `headcount_mode` (`in_plan`\|`out_of_plan`) · `target_month` + spawn UQ. **Create path** (`createJobRequisition`) still inserts `status='open'` **without** requiring `headcount_mode` / `hire_reason` / cell gate / out-of-plan reason / BOD receivable gate. Tab `headcount_proposals` = leftover «đề xuất ngoài ĐB» — **≠** YCTD SoT (REC-01 HOLD). |
| **Paper target** | Một entity YCTD; cờ `in_plan`\|`out_of_plan` + lý do tuyển `new`\|`replace` là **điều kiện ma trận** XBOS (không bắt buộc hai quy trình sản phẩm rời). Trong ĐB: gắn ô Cần tuyển đã duyệt; luồng rút gọn (TP/HR tối thiểu; BOD chỉ nếu tenant CFG bắt). Ngoài ĐB: lý do vượt/phát sinh; nhánh dài + BOD; **mặc định chặn** nhận hồ sơ / «mở tin» đến khi BOD duyệt. |
| **Gap class** | Mode fork + hire_reason + out_of_plan_reason **ABSENT** on create; receivable gate weak (`open` immediate); matrix snapshot / BOD step enforce incomplete; proposals dual-path risk; paper `/rec/recruitment-requests` ≠ Nest physical. |
| **Constraints** | U89 continuous · preserve_default · **reuse REC-01 Option A spine** · C-SLICE · DENY invent ngoài SRS · DENY REC-03 · DENY seed · DENY flip `recruitment_uat_ready` · **Q-REC-HEADCOUNT / Q-REC-HC-2 RETAIN** (no re-litigate) |
| **Failure impact if unresolved** | Wave-2 idle / Dev invent second YCTD table or second WF product / open tin trước BOD / regression spawn+JD+requisition WF |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-REC-01/01b (SEALED Option A)
        │  recruitment_plans cells + spawn → job_requisitions
        │  headcount_mode=in_plan · headcount_cell_id (RETAIN)
        ▼
  Manual / edit YCTD ──► POST/PATCH /api/hrm/recruitment/requisitions*
        │                 (physical SoT — paper /rec/recruitment-requests = alias)
        │
        ├─ headcount_mode=in_plan ──► require approved need_hire cell
        │     hire_reason new|replace · JD Hiệu lực · matrix SHORT (tenant XBOS)
        │     BR-BP-HC-05 — cấm dùng nhánh ngoài ĐB
        │
        └─ headcount_mode=out_of_plan ──► require out_of_plan_reason
              hire_reason new|replace · JD Hiệu lực · matrix LONG (+ BOD)
              BR-BP-HC-06 — cấm matrix rút gọn
              DEFAULT GATE: block open_for_hire / accept CV until BOD approve
                    │
                    ▼
              XBOS WF hrm_requisition_approval (RETAIN one business_type;
                    matrix conditions = mode + hire_reason + tenant CFG)
                    │
                    ▼
              approved → open_for_hire (receivable on YCTD)
              rejected → không mở tin · draft/rejected giữ JD soft FK
                    │
                    ▼
              F-REC-YCTD-04 pipeline flags on YCTD (posted/has_cv/…)
              ── REC-03 Campaign OUT ──
```

**Label lock:** «mở tin» MVP = trạng thái / flag trên **YCTD** (không entity Campaign).  
**Spine lock:** `job_requisitions` = sole physical YCTD SoT (paper `rec_recruitment_request` alias only).

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS/DB/API) | AS-IS LIVE | Verdict |
|------------|--------------------|------------|---------|
| YCTD CRUD + list/get | F-REC-YCTD-01/02 · §2.3 | `job_requisitions` + Nest `/recruitment/requisitions*` | **LIVE — UPGRADE** mode/reason/gates |
| JD bind Hiệu lực | BR-YCTD-JD-REF · F-YCTD-JD-* | soft FK `job_template_id` + require on create | **RETAIN** must_keep |
| `headcount_mode` / cell link | in_plan ⇒ cell; out_of_plan | Columns **ADD** (REC-01); create **does not set/validate** | **GAP P0** wire + CHK enforce |
| Hire reason new/replace | `hire_reason` + replace employee | **ABSENT** columns on create path | **GAP P0 ADD** |
| Out-of-plan reason | `out_of_plan_reason` required | **ABSENT** | **GAP P0 ADD** |
| Short vs long matrix | BR-HC-05/06 · tenant XBOS | One WF code `hrm_requisition_approval` — **no** mode condition payload depth | **GAP** — pass conditions to XBOS / snapshot `approval_matrix_key` |
| BOD missing → no open | FR-02b #3–#4 | Create → `open` immediate | **GAP P0** receivable gate |
| Approve / reject transition | F-REC-YCTD-03 | XBOS callback + status CHK (draft/pending/approved/rejected/…) | **RETAIN bridge** + **UNLOCK** semantics `open_for_hire` |
| Pipeline flags on YCTD | F-REC-YCTD-04 | Partial / weak vs paper JSON keys | **UNLOCK ADD** (no Campaign) |
| Spawn in_plan YCTD | F-REC-HC-05 | LIVE post REC-01 | **RETAIN** must_keep · REC-02 create must not break UQ/cell |
| `headcount_proposals` tab | ngoài ĐB proposal | LIVE leftover catalog twin | **≠ SoT** — **HOLD migrate UX** → out_of_plan YCTD; **DENY** dual write as YCTD |
| Campaign / job_postings SoT | REC-03 OUT | non-primary catalog | **OUT / DENY** |
| Scope parity U19 | list=get=mutate | recruitment module `resolveHrmListScope` | **RETAIN** enforce on all YCTD paths |

---

## 3. Options

### Option A — UPGRADE AS-IS `job_requisitions` + one XBOS requisition WF · mode as matrix condition (RECOMMENDED)

| | |
|--|--|
| **Description** | Giữ physical Nest `/api/hrm/recruitment/requisitions*` + XBOS `hrm_requisition_approval`. **ADD/EXPAND** (docs→Dev): (1) enforce `headcount_mode` on create/submit; (2) `in_plan` ⇒ `headcount_cell_id` trỏ ô `need_hire_approved` + qty gate (vượt ô → reject **or** force `out_of_plan` per BA CFG — **no invent silent**); (3) `hire_reason` `new`\|`replace` (+ `replace_employee_id` when replace); (4) `out_of_plan` ⇒ `out_of_plan_reason` bắt buộc; (5) submit → `pending_approval` (cấm nhảy `open`); (6) matrix SHORT/LONG selected by mode (+ hire_reason) via **XBOS tenant definition** — snapshot `approval_matrix_key`; (7) **DEFAULT** out_of_plan: **block** receivable (`open_for_hire` / accept CV / posted flag) until BOD step complete; (8) in_plan: SHORT matrix — BOD only if tenant CFG demands (Q-REC-HEADCOUNT RETAIN); (9) F-REC-YCTD-04 pipeline flags on YCTD; (10) paper `/rec/recruitment-requests*` = **logical alias only**. Spawn REC-01 path **RETAIN**. `headcount_proposals` **not** promoted to SoT. |
| **Benefits** | Zero dual YCTD SoT; fastest U89; preserves JD/UV/WF/spawn; matches SRS «điều kiện ma trận · không hai quy trình rời»; Q-REC-HEADCOUNT honored without re-litigation |
| **Costs** | Create/status remaster; XBOS matrix condition wiring; BA AC for vượt-ô CFG; FE form forks; ba-data column ADD for hire/out reasons |
| **Risks** | Legacy rows `status=open` without mode — **mitigate:** backfill `headcount_mode=NULL` = grandfather read-only **or** force classify on next edit (BA CONFIRM). Proposals tab confusion — **mitigate:** FE CTA deprecate / redirect OUT-of-plan YCTD (no dual persist). |

### Option B — Greenfield `rec_recruitment_request` + Nest `/rec/recruitment-requests` (+ optional second WF product)

| | |
|--|--|
| **Description** | Implement paper table/routes as new SoT; dual-run or deprecate `job_requisitions`; possibly split short/long into two XBOS business types. |
| **Benefits** | Clean paper name fidelity |
| **Costs** | Dual SoT migration; rewrite FE UF-HRM-12; re-wire JD/UV/spawn FK; high blast radius; breaks REC-01 sealed spine |
| **Risks** | Regression spawn UQ + JD bind + requisition WF; C-SLICE violation; sponsor path split |

### Option C — HOLD / ACCEPT_AS_IS_P2 (docs only · no unlock)

| | |
|--|--|
| **Description** | Stamp gap inventory; leave create→`open` and proposals leftover; no BA/Dev unlock. |
| **Benefits** | Zero churn |
| **Costs** | Blocks U89 continuous after REC-01 seal |
| **Risks** | Open tin trước BOD continues; sponsor idle — **violates U89** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (SRS FR-02/02b + Q-REC-HEADCOUNT) | 25 | **9** | 9 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 3 | 1 |
| Complexity / blast radius | 15 | **7** | 2 | 9 |
| Security / scope_parity U19 + BOD gate | 10 | **9** | 6 | 3 |
| Reliability (one SoT + WF + spawn) | 15 | **9** | 4 | 3 |
| Maintainability (matrix conditions vs dual WF) | 15 | **9** | 3 | 4 |
| **Weighted (≈)** | 100 | **8.7** | **4.6** | **3.3** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Dev invents `rec_recruitment_request` table beside `job_requisitions` | Diff / ba-data | **DENY** dual physical YCTD SoT; alias only |
| A | Two Nest controllers (`/rec/...` + `/recruitment/requisitions`) | Grep routes | **DENY** greenfield Nest path; paper alias only |
| A | out_of_plan opens receivable before BOD | QA FR-02b #3 | Gate: status≠`open_for_hire` + CV create 409 until BOD |
| A | in_plan uses long matrix always / skips TP+HR | QA BR-HC-05 | SHORT default; Q-REC-HC-2 TP+HR minimum |
| A | Create bypasses `headcount_mode` (null→open) | Jest + API VAL | **400** missing mode on submit; spawn path still sets `in_plan` |
| A | Vượt ô silently stays in_plan | QA qty gate | BA CFG: reject **or** force out_of_plan — **no silent** |
| A | Dual-write `headcount_proposals` as YCTD | Code review | **DENY**; proposals ≠ SoT |
| A | Flip `recruitment_uat_ready` after slice GWC | QC honesty footer | **DENY**; C-SLICE |
| B | Dual SoT + spawn break | Integration | Reject Option B |
| C | Wave-2 stalls | Board OPEN forever | Reject Option C under U89 |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — UPGRADE AS-IS `job_requisitions` + **one** XBOS requisition WF; `headcount_mode` + `hire_reason` as **matrix conditions**; default **block** open-tin until BOD for `out_of_plan` |
| **Why selected** | Reuses sealed REC-01 spine (cell/mode/spawn); preserves JD/UV/WF; implements FR-02/02b without dual SoT or dual product WF; honors Q-REC-HEADCOUNT RETAIN; unlocks U89 continuous |
| **Assumptions** | Q-REC-HEADCOUNT remains: ngoài ĐB + BOD + XBOS tenant matrix — **not** re-litigated. Q-REC-HC-2 TP+HR SoT for in-plan minimum. «Warn cho qua» vượt HC = **OUT** until sponsor re-opens Decision (SRS special: chỉ sau Decision đóng). REC-03 remains OUT. |
| **Rejected** | **B** — dual SoT / rewrite · **C** — blocks U89 |

### 6.1 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | `job_requisitions` YCTD spine · XBOS `hrm_requisition_approval` bridge · JD soft FK · UV↔YCTD · IV one-active · REC pipeline stage catalog · REC-01 spawn (`headcount_cell_id` / UQ / HC-S1..S7) · soft-delete · scope_parity list↔get↔mutate · plan WF bridge |
| **DENY invent** | REC-03 campaign · `job_postings` as YCTD/JD SoT · second YCTD table · Nest `/rec/recruitment-requests` dual path · dual `rec_headcount_*` · seed for QA · flip `recruitment_uat_ready` / program honesty · claim module REC UAT from this cluster alone · re-litigate Q-REC-HEADCOUNT / invent «warn cho qua» as default |
| **OUT** | UC-BP-REC-03 · Campaign CRUD GĐ1 |
| **HOLD peer** | `headcount_proposals` — leftover UI; **not** YCTD SoT; migrate CTA later **without** dual persist |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.2 Sponsor locks (RETAIN — no re-litigate)

| Decision | Stamp |
|----------|--------|
| **Q-REC-HEADCOUNT** | Cho ngoài ĐB + duyệt BOD; quy trình cấu hình từ **XBOS theo tenant** |
| **Q-REC-HC-2** | Trưởng phòng + HR |
| **Default out_of_plan gate** | **Chặn** mở tin / nhận hồ sơ đến khi BOD duyệt (SRS FR-02b) |
| **Matrix model** | Một WF product + **điều kiện** (mode + hire_reason) — không bắt buộc hai quy trình rời |

---

## 7. Implementation and Validation Plan

### 7.1 Rollout steps (governance → execution)

1. **BA-process** — AC pack REC-02/02b (O* · VAL · Diễn biến FE · J-* DRAFT) against this Option A.
2. **ba-data / SA API** — Physical DOC-DELTA: hire_reason / out_of_plan_reason / replace_employee_id / approval_matrix_key / pipeline_flags / status receivable token · F.1 YCTD-01..04 depth.
3. **Dev-BE** — create/submit gates · XBOS condition payload · BOD receivable · scope_parity tests · spawn regression.
4. **Dev-FE** — form forks in/out · lý do tuyển · FE sau 2xx + F5 · block UI khi thiếu BOD.
5. **QA** — browser U65 UF/J-* cluster only · **no seed**.
6. **QC** — GWC C-SLICE · honesty footer false · **no** recruitment_uat_ready flip.

### 7.2 Rollback

- Feature-flag mode-gate off → prior create behavior only if needed for emergency; **prefer** forward-fix.
- No drop of `job_requisitions` / XBOS bridge / REC-01 columns.

### 7.3 Validation checkpoints

| Gate | PASS when |
|------|-----------|
| Spec | This Option A CONFIRMED + BA AC CONFIRMED |
| Physical | ba-data/API F.1 cite physical `/recruitment/requisitions*` + DTO↔column |
| L0–L2.5 | Stack up; browser FE path; F5 retains mode/reasons/JD; out_of_plan blocked until BOD |
| Honesty | Evidence stamps `recruitment_uat_ready=false` |

### 7.4 Success criteria (architecture)

- One YCTD SoT = `job_requisitions`.
- `in_plan` always linked to approved cell (manual create + spawn).
- `out_of_plan` cannot become receivable without BOD when tenant CFG requires (default = require).
- XBOS single business_type retained; conditions carry mode/hire_reason.
- No REC-03 / dual SoT / honesty flip.

---

## 8. F.1 API matrix (disposition — physical prefer Option A)

> Full request/response column contracts = **next** TechSpec/API seat after BA AC. This seat **locks** which F-ids unlock.

| F-id | Mục đích | SRS bước | Physical path (Option A) | Paper alias | Status |
|------|----------|----------|---------------------------|-------------|--------|
| **F-REC-YCTD-01** | Create/submit YCTD **in_plan** | FR-02 #1–#2 · 1a–1d | `POST/PATCH /api/hrm/recruitment/requisitions*` | `/api/hrm/rec/recruitment-requests` | **UNLOCK UPGRADE** |
| **F-REC-YCTD-02** | Create/submit YCTD **out_of_plan** | FR-02b #1–#2 · 1a–1d | **same** POST + `headcount_mode=out_of_plan` | same | **UNLOCK ADD semantics** |
| **F-REC-YCTD-03** | Approve/reject → receivable | FR-02 #3–#4 · FR-02b #2–#5 | XBOS callback **RETAIN** ± `POST …/requisitions/:id/transitions` if needed | `…/transitions` | **UNLOCK semantics** |
| **F-REC-YCTD-04** | Pipeline flags posted/CV/PV | FR-02 success «mở tin» MVP | `PATCH …/requisitions/:id/pipeline-flags` **ADD** | paper path | **UNLOCK ADD** |
| **F-YCTD-JD-01..05** | Picker/preview/re-bind/display | FR-02/02b 1a–1d | existing job-templates + requisitions | — | **RETAIN** must_keep |
| **F-REC-HC-05** | Spawn in_plan | FR-01b | `POST …/recruitment-plans/:id/spawn-requests` | — | **RETAIN** (peer sealed) |
| **F-REC-CAMPAIGN-*** | Campaign hub | FR-03 | — | — | **OUT / DENY** |

### 8.1 Domain invariants (architecture lock)

| ID | Invariant |
|----|-----------|
| **Y-S1** | Sole physical YCTD = `job_requisitions` · paper `rec_recruitment_request` = alias |
| **Y-S2** | Submit requires `headcount_mode` ∈ {`in_plan`,`out_of_plan`} — **400** if missing |
| **Y-S3** | `in_plan` ⇒ `headcount_cell_id` NOT NULL · cell lifecycle `need_hire_approved` · plan approved — else **409** `HRM-YCTD-CELL-*` |
| **Y-S4** | `in_plan` qty vs cell: không vượt (thay thế đúng vị trí vẫn in_plan) — vượt ⇒ **409** hoặc chuyển `out_of_plan` **chỉ** khi BA CFG explicit |
| **Y-S5** | `out_of_plan` ⇒ `out_of_plan_reason` required — else **400** |
| **Y-S6** | `hire_reason` ∈ {`new`,`replace`} required on submit; `replace` ⇒ `replace_employee_id` — else **400** |
| **Y-S7** | Submit sets `pending_approval` + starts XBOS — **cấm** create→`open` bypass |
| **Y-S8** | Matrix: `in_plan` → SHORT (TP+HR min per Q-REC-HC-2); `out_of_plan` → LONG (+ BOD). Tenant CFG may add BOD to in_plan — **cấm** hardcode «luôn bỏ BOD» |
| **Y-S9** | **DEFAULT** `out_of_plan`: receivable (`open_for_hire` / accept CV / set `posted`) **blocked** until BOD approve — **409** `HRM-YCTD-BOD-REQUIRED` / `HRM-YCTD-NOT-RECEIVABLE` |
| **Y-S10** | BR-BP-HC-05/06: in_plan **cấm** long-only path; out_of_plan **cấm** short-only path |
| **Y-S11** | Spawned rows remain `in_plan` + cell UQ — manual create must not violate `uq_job_requisitions_spawn_cell` |
| **Y-S12** | JD bind rules RETAIN (Hiệu lực only; REQUIRED when position mandates) |
| **Y-S13** | Pipeline «mở tin» = flags on YCTD — **not** Campaign entity |

### 8.2 Status token map (disposition)

| Phase | Normative status | Note |
|-------|------------------|------|
| Draft / edit | `draft` | RETAIN in CHK |
| Submitted | `pending_approval` | WF lock |
| Approved (not yet receivable if gate) | `approved` | Bridge may set |
| Receivable (nhận hồ sơ / mở tin MVP) | `open_for_hire` **or** `open` synonym | **UNLOCK** — BA/API seal exact token; AS-IS list already filters `open`\|`approved`\|`open_for_hire` |
| Rejected / cancelled | `rejected` \| `cancelled` | RETAIN |
| Closed / on_hold | `closed` \| `on_hold` | RETAIN operational |

> Exact receivable token + CHK ALTER = **ba-data/API** seat — SA locks **semantic**: no CV / no posted flag while BOD outstanding on out_of_plan.

### 8.3 Scope parity (U19)

List / get-by-id / create / patch / submit-workflow / transitions / pipeline-flags / list-by-cell — **same** `resolveHrmListScope` + persist company rules as existing recruitment requisitions module.

---

## 9. BA open decisions (for AC pack — SA disposition)

| # | Topic | SA LOCK (Option A) |
|---|-------|---------------------|
| **O1** | Physical path | **Physical prefer** `/api/hrm/recruitment/requisitions*` · paper `/rec/recruitment-requests*` = **alias only** |
| **O2** | Vượt số lượng ô in_plan | **No silent stay in_plan.** Default disposition for AC: **409 reject** create in_plan over cell qty; optional CFG `force_out_of_plan=true` may rewrite mode — **BA must CONFIRM** which is MVP default (SA recommends **reject** for clarity) |
| **O3** | Receivable token | Prefer promote `open_for_hire` after full approve; accept `open` as synonym in filters until FE remaster — **BA + API seal** |
| **O4** | Legacy `status=open` rows without mode | Grandfather list/read; **block** new CV attach until classified **or** allow until next edit — **BA CONFIRM** (SA recommends classify-on-edit + warn) |
| **O5** | `headcount_proposals` | **HOLD** as non-SoT; AC may note FE deprecation CTA — **cấm** require dual-write in this cluster |
| **O6** | XBOS matrix | One definition code family; conditions carry `headcount_mode` + `hire_reason` (+ company policy). Missing tenant WF → spawnMissing pattern RETAIN (peer plan) — **cấm** fake approve |
| **D-BOD** | Warn-cho-qua vượt HC | **OUT** this cluster — Decision not reopened; default = **block** |

---

## 10. Exit / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · Option **A** CONFIRMED |
| **next_owner** | **ba-process** — AC pack `PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-sa-01.md` |
| **Unlocks** | BA AC → physical DB/API F.1 → Dev-BE/FE |
| **Does not unlock** | Dev without BA+physical contracts · REC-03 · honesty flips · seed · dual SoT |

---

## completion_report

- **Closed:** Option A/B/C + trade-off + F.1 disposition YCTD-01..04; LIVE vs gap; Q-REC-HEADCOUNT + Q-REC-HC-2 RETAIN; REC-01 spine reuse; BOD block default; REC-03 OUT; honesty/C-SLICE.
- **Residual:** BA AC O1–O6; TechSpec/DB/API physical DOC-DELTA; Dev after contracts; parallel residual `R-REC-HC-OVERRIDE-CELLID` (out of this seat SoT — ba-process peer).
