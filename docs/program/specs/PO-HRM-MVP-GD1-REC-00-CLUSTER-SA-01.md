# PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01 — Option/F.1 · Thư viện JD master (MVP)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → TechSpec/DB/API residual → Dev |
| **depends_on** | QC-02 GWC Wave-4 UC-BP-REC-06a **SEALED** — stamp `REC06AQC2-MSKZAM58` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qc-02.md` · **R-REC-IV-PROJ-ID CLOSED** |
| **uc_ids** | `UC-BP-REC-00` *(spine master; 00a/00b/00c = CFG/DnD/form peers RETAIN — không reopen dual SoT)* |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#7** WAVE-5 after REC-06a |
| **ref_sa_spine** | [`PO-HRM-JD-DYNAMIC-ARCH-02.md`](./PO-HRM-JD-DYNAMIC-ARCH-02.md) Option A · [`PO-HRM-JD-YCTD-REF-*`](./PO-HRM-JD-YCTD-REF-API-01.md) · peer [`…-REC-01/02/08/06A-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md) — **reuse · DENY reopen seals** |
| **ref_honesty** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-JD-DYNAMIC-DONE-HOLD-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-JD-DYNAMIC-DONE-HOLD-SA-01.md) — **`jd_dynamic_done=false` RETAIN** (`R-PLT-JD-DYNAMIC-DONE-01`) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-00** (+ cross-ref 00a·00b·00c · BR-BP-JD-01 · YCTD Diễn biến #3) |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · **WBS-REC-00** · partner `REQ_REC_003` |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-JD-01** = **logical alias** · physical F-JD-01..04 / F-YCTD-JD-* |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §2.1 `rec_job_description` = **logical alias** of `job_description_templates` |
| **OUT** | **UC-BP-REC-03** campaign / `job_postings` JD SoT · Nest `/rec/job-descriptions` dual · second JD master table · seed · honesty flip |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · 16 program honesty flags **false** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-5 architecture unlock: **Thư viện mô tả công việc (JD master) MVP** vs AS-IS Nest `job-templates` / `jd-dynamic` spine |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after REC-06a QC-02 GWC |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-REC-00 · BR-BP-JD-01 · BR-YCTD-JD-REF-01/02 · WBS-REC-00 · F-JD-* · F-YCTD-JD-* · U19 scope_parity · JD-DYNAMIC Option A LOCKED |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **Physical JD master** = `public.job_description_templates` via Nest **`/api/hrm/recruitment/job-templates*`** (list/create/patch/delete + **GET by id** F-JD-03). **CFG spine** = `rec_jd_field_def` / `rec_jd_form_layout*` / pack resolve (`JdDynamicService`) — Settings catalog + Thư viện DnD/canvas (UC-00a/b/c L3 GWC). **YCTD bind** = soft FK `job_requisitions.job_template_id` + bindable list/preview STATUS gate (F-YCTD-JD-01..05 LIVE). Status bridge: **Hiệu lực** ≈ `is_active=true`; Nháp/Ngừng ≈ `is_active=false` (YCTD-REF TECHSPEC). **`job_postings`** = Lane B leftover ≠ JD SoT. Paper `rec_job_description` / `/rec/job-descriptions` = naming only. |
| **Paper target** | FR-UC-BP-REC-00: thư viện theo pháp nhân; tạo/cập nhật theo bố cục; Nháp → Hiệu lực; YCTD chọn JD Hiệu lực gắn mã; Ngừng không xóa lịch sử YCTD; không trộn CT. 00a/00b/00c mở rộng CFG — **không** thay vai trò master. |
| **Gap class** | **impl_gap residual on LIVE spine** — **not** greenfield: (1) SRS **3 trạng thái** Nháp/Hiệu lực/Ngừng vs AS-IS **boolean** `is_active` (Nháp ≠ Ngừng undifferentiated for library UX); (2) explicit **publish** transition (Nháp→Hiệu lực) + required-on-layout gate may be shallow vs FR Diễn biến #2; (3) paper **F-REC-JD-01** `/rec/job-descriptions` still readable as invent path; (4) risk of conflating L3 JD-DYNAMIC GWC / YCTD-REF with **`jd_dynamic_done=true`** or REC module UAT. |
| **Constraints** | U89 continuous · **preserve** JD-DYNAMIC Option A + YCTD-REF + W1–W4 seals · C-SLICE · DENY REC-03 · DENY seed · DENY flip `recruitment_uat_ready` / `jd_dynamic_done` · DENY Nest `/rec` dual · DENY second JD SoT table · **cấm code until Option CONFIRMED** (this seat) |
| **Failure impact if unresolved** | Board #7 stalls; BA cannot AC FR-00; Dev invents `rec_job_description` beside templates or Nest `/rec/job-descriptions` dual; honesty flip from L3; regression soft FK / bindable |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-REC-00a/00b (CFG — RETAIN JD-DYNAMIC Option A)
       rec_jd_field_def · rec_jd_form_layout(+items) · pack rules
                │
                ▼
  job_description_templates  ◄──── Sole JD master SoT (paper rec_job_description = alias)
       values_json + layout_snapshot_json (Q6 L1+snapshot RETAIN)
       code UQ / company_id · position_code ∈ job_titles
       status bridge: Nháp|Hiệu lực|Ngừng  ↔  is_active (+ residual 3-state if BA locks)
                │
                │  resolveHrmListScope (U19 — list = get = mutate)
                ▼
  GET/POST/PATCH/DELETE  /api/hrm/recruitment/job-templates*
  GET                    /api/hrm/recruitment/job-templates/:id     (F-JD-03 RETAIN)
  GET/POST/PATCH…        /api/hrm/recruitment/jd-field-defs* …     (F-JD-DEF/LAY RETAIN)
                │
                │  paper alias ONLY: /api/hrm/rec/job-descriptions*  (F-REC-JD-01)
                ▼
  YCTD job_requisitions.job_template_id  (ONE soft FK — RETAIN YCTD-REF)
       bindable=true | for=yctd → Hiệu lực only
       Ngừng → history OK · bind mới 400 HRM-JD-YCTD-STATUS
                │
                └── job_postings / Lane B  ≠  FR-00 SoT — DENY dual-write
```

**Label lock:** «Thư viện mô tả công việc» / «JD master» / paper `rec_job_description` = **same** physical `job_description_templates`.  
**Spine lock:** Nest physical `/recruitment/job-templates*` — **DENY** greenfield Nest `/rec/job-descriptions` SoT.  
**Honesty lock:** L3 JD-DYNAMIC GWC + this cluster GWC later **≠** `jd_dynamic_done=true` · **≠** `recruitment_uat_ready=true`.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / DB / API) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| JD master CRUD + list/get | F-REC-JD-01 · §2.1 | `job_description_templates` + `/recruitment/job-templates*` | **LIVE — UPGRADE residual** status/publish UX |
| Dynamic field catalog | FR-00a · F-JD-DEF-* | `rec_jd_field_def` + Settings | **RETAIN** must_keep (00a peer) |
| Layout DnD + snapshot | FR-00b · F-JD-LAY-* · Q6 | `rec_jd_form_layout*` + `layout_snapshot_json` | **RETAIN** must_keep (00b peer) |
| Dynamic form + hierarchy view | FR-00c · F-JD-02/03/04 | JobTemplatesTab + values_json + GET by id | **RETAIN** must_keep (00c / L3 GWC) |
| Status Nháp / Hiệu lực / Ngừng | FR-00 input · DB draft\|active\|retired | **`is_active` boolean bridge** | **GAP residual** — BA lock 3-state vs ACCEPT bridge |
| Publish Nháp→Hiệu lực | Diễn biến #2 | Create often `is_active=true`; weak draft path | **UNLOCK residual** AC + optional transition |
| Code UQ Hiệu lực / pháp nhân | FR-00 | UQ `(company_id, code)` AS-IS | **RETAIN** + AC depth |
| YCTD bind Hiệu lực only | Diễn biến #3 · BR-BP-JD-01 | F-YCTD-JD-* bindable + STATUS | **RETAIN** must_keep (W2) |
| Ngừng giữ lịch sử YCTD | BR-BP-JD-01 | soft FK · no CASCADE | **RETAIN** |
| Scope parity U19 | special | `resolveHrmListScope` on list/get/mutate | **RETAIN** |
| Position catalog | HRM-REC-JD-POS | `position_code` ∈ job_titles | **RETAIN** |
| Paper `/rec/job-descriptions` | F-REC-JD-01 | Prefer physical job-templates | **Alias only — DENY dual Nest** |
| `job_postings` as JD SoT | REC-03 OUT | Lane B leftover | **OUT / DENY** |
| `jd_dynamic_done` | companion honesty | **false** HOLD | **DENY flip** this seat |
| Module REC UAT | honesty | W1–W4 C-SLICE only | **DENY flip** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_UPGRADE on LIVE `job_description_templates` + jd-dynamic (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** physical Nest `/api/hrm/recruitment/job-templates*` + `job_description_templates` + `rec_jd_*` CFG (JD-DYNAMIC Option A LOCKED). Treat paper `rec_job_description` / **F-REC-JD-01** `/rec/job-descriptions*` as **logical alias only**. **RETAIN** YCTD soft FK + bindable/STATUS gates (W2 must_keep). **UPGRADE residual only** for FR-UC-BP-REC-00 spine: (1) BA AC for library list/create/edit/F5 + publish semantics; (2) status model — either **ACCEPT** `is_active` bridge with mapped labels **or** ADD explicit `status` `draft\|active\|retired` (ba-data) without second table; (3) required-on-layout gate on publish; (4) DENY Lane B / Nest dual. **00a/00b/00c** = peers RETAIN — this cluster AC focuses FR-00 Diễn biến #1–#3 + BR-BP-JD-01; do not reopen L3 as rewrite. |
| **Benefits** | Zero dual JD SoT; fastest U89 #7; preserves soft FK / bindable / DnD / L3 GWC; matches prior REC Option A pattern (physical prefer); unlocks BA without invent |
| **Costs** | BA must discriminate Nháp vs Ngừng if sponsor needs 3-state UX; optional ba-data status column; FE library UF residual |
| **Risks** | Dev invents `/rec/job-descriptions` controller — **mitigate:** DENY + paper alias. Flip `jd_dynamic_done` from slice — **mitigate:** HOLD cite. Conflate 00a–00c rewrite — **mitigate:** must_keep L3. |

### Option B — Greenfield `rec_job_description` + Nest `/rec/job-descriptions` (second SoT)

| | |
|--|--|
| **Description** | Implement paper table/routes as new SoT; dual-run or migrate off `job_description_templates`; re-wire YCTD FK / jd-dynamic values. |
| **Benefits** | Clean paper name fidelity |
| **Costs** | Dual SoT migration; rewrite FE Thư viện + Settings; re-bind F-YCTD-JD; break W2 JD soft FK seals; high blast |
| **Risks** | Regression bindable/STATUS · C-SLICE violation · U89 delay — **REJECT** |

### Option C — HOLD / claim L3 = FR-00 DONE / flip honesty

| | |
|--|--|
| **Description** | Treat JD-DYNAMIC L3 QC-01 GWC or YCTD-REF as FR-UC-BP-REC-00 complete; or HOLD Option; or flip `jd_dynamic_done` / `recruitment_uat_ready`. |
| **Benefits** | Short-term idle |
| **Costs** | Board #7 stuck or false DONE; status 3-state / publish residual paper-only; violates U89 continuous + honesty HOLD |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-00 + BR-BP-JD-01) | 25 | **9** | 8 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **9** | 2 | 8 |
| Security / scope_parity U19 + STATUS gate | 15 | **9** | 4 | 5 |
| Reliability (one JD SoT + soft FK) | 15 | **9** | 3 | 4 |
| Maintainability (preserve L3 + YCTD-REF) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **9.0** | **3.6** | **3.4** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Dev creates Nest `/rec/job-descriptions` beside job-templates | Grep routes | **DENY** dual Nest; paper F-REC-JD-01 = alias only |
| A | Greenfield `rec_job_description` table | Diff / ba-data | **DENY** second physical JD SoT; alias only |
| A | Dual-write `job_postings` as master | Code review | **DENY** Lane B SoT · REC-03 OUT |
| A | Flip `jd_dynamic_done` because FR-00 AC opened | Bus / QC | Cite HOLD-SA-01 · **DENY** |
| A | Flip `recruitment_uat_ready` after REC-00 GWC | QC honesty | **DENY** · C-SLICE |
| A | Reopen W1–W4 seals for «JD depends on YCTD/IV» | Bus | **DENY**; soft FK RETAIN |
| A | Nháp treated as Hiệu lực in bindable | QA F-YCTD-JD-01 | RETAIN `is_active=true` only for bindable |
| A | Ngừng CASCADE clears YCTD FK | Integration | Soft-retire only · no CASCADE |
| A | Seed templates for U65 evidence | QA evidence | **DENY** seed |
| B | Dual SoT + FK break | Integration | Reject B |
| C | Board idle / false DONE | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_UPGRADE** on LIVE `job_description_templates` + jd-dynamic CFG; paper F-REC-JD-01 / `rec_job_description` = **alias only** |
| **Why selected** | Spine + dynamic CFG + YCTD soft FK already LIVE/sealed; implements FR-00 without dual SoT; preserves W1–W4 must_keep; unlocks U89 #7 BA; matches Option A pattern on REC-01/02/06a/08 |
| **Assumptions** | JD-DYNAMIC Option A (in-HRM builder · Q1 Settings/Library · Q6 L1+snapshot) **RETAIN**. YCTD-REF ONE soft FK **RETAIN**. REC-03 remains OUT. `jd_dynamic_done=false` until sponsor named DONE wave. Prior L3 GWC ≠ FR-00 module DONE. |
| **Rejected** | **B** — second JD SoT / Nest `/rec` dual · **C** — HOLD / honesty flip / false DONE |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | `/api/hrm/recruitment/job-templates*` only; `/rec/job-descriptions*` alias | Cite in AC Network |
| **O2** | Status model | Prefer **map** SRS Nháp/Hiệu lực/Ngừng → `is_active` (+ labels) for MVP **or** ADD `status` column `draft\|active\|retired` without new table | Pick one; if 3-state column → ba-data DOC-DELTA |
| **O3** | Publish gate | Publish/Hiệu lực requires required fields on **effective layout** (00a/00b); empty layout publish → 4xx family `HRM-JD-*` | AC Diễn biến #2 |
| **O4** | Code UQ | UQ per `company_id` among non-archived; conflict → 409 | AC |
| **O5** | YCTD bind | Hiệu lực only; Ngừng history OK; **no** reopen F-YCTD-JD contracts | must_keep cite |
| **O6** | Peers 00a/00b/00c | RETAIN L3; FR-00 AC may reference but **not** redefine CFG SoT | Scope note |
| **O7** | Honesty | All flags false · C-SLICE | Footer every evidence |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | `job_description_templates` JD master · Nest `/recruitment/job-templates*` · `rec_jd_*` CFG · values/layout snapshot · F-JD-03 get-by-id · `HRM-REC-JD-POS` · soft FK `job_template_id` · F-YCTD-JD bindable/STATUS · W1 REC-01 cell/spawn · W2 YCTD mode/BOD/open_for_hire · W3 dashboard physical · W4 IV one-active · `resolveHrmListScope` · soft-delete/retire · honesty false |
| **DENY invent** | Second JD table · Nest `/rec/job-descriptions` dual SoT · `job_postings` as JD master · seed for evidence · flip `jd_dynamic_done` / `recruitment_uat_ready` / program honesty · claim module REC UAT / Phase1 DONE · reopen W1–W4 sealed Conditions as rewrite pretext |
| **OUT** | UC-BP-REC-03 · Campaign / tin đăng GĐ1 |
| **HOLD peer** | `R-PLT-JD-DYNAMIC-DONE-01` — L3 GWC ≠ program DONE |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1 REC-01/01b | HCELL / spawn UQ | RETAIN |
| W2 REC-02/02b | TARGET-MONTH · BOD · JD soft FK | RETAIN |
| W3 REC-08 | dashboard physical | RETAIN |
| W4 REC-06a | `REC06AQC2-MSKZAM58` · R-REC-IV-PROJ-ID CLOSED | RETAIN |
| JD-DYNAMIC L3 | QC-01 GWC | RETAIN · ≠ `jd_dynamic_done` |
| YCTD-REF | API/DB/QA | RETAIN ONE soft FK |

---

## 7. Implementation and Validation Plan

### 7.1 Rollout steps (governance → execution)

1. **BA-process** — AC pack FR-UC-BP-REC-00 (O1–O7 · VAL · Diễn biến FE · J-* DRAFT) against this Option A; cite BR-BP-JD-01; **depends_on** this CONFIRMED; **cấm invent** beyond SRS; unlock residual library publish/status only.
2. **ba-data / SA API** — DOC-DELTA only if O2 chooses explicit `status` column or DTO alias depth; else F.1 disposition = physical job-templates RETAIN + residual codes.
3. **Dev-BE / Dev-FE** — after AC + contracts CONFIRMED — residual only (no greenfield Nest `/rec`).
4. **QA** — U65 browser: Thư viện list → create/edit → publish/Hiệu lực → F5 → YCTD picker bindable; Network physical paths; **no seed**.
5. **QC** — GWC C-SLICE; honesty false; DENY module UAT.

### 7.2 Rollback

- Docs Option stamp only until Dev; if Dev regresses soft FK → revert residual commit; seals W1–W4 untouched.

### 7.3 Validation checkpoints

| Gate | PASS when |
|------|-----------|
| SA | This file CONFIRMED Option A |
| BA | AC pack cites O1–O7 · no Nest dual · no honesty invent |
| API/DATA | Physical prefer job-templates · alias paper |
| QA | UF FR-00 Diễn biến #1–#3 browser + F5 + Network 2xx |
| QC | GWC · C-SLICE · `jd_dynamic_done=false` · `recruitment_uat_ready=false` |

### 7.4 Success criteria

- One JD master SoT; YCTD soft FK intact; paper `/rec` not implemented as second Nest controller; BA unlocked; no honesty flip.

---

## 8. F.1 API matrix (disposition — physical prefer Option A)

> Full request/response column contracts = **next** TechSpec/API seat after BA AC if residual columns. This seat **locks** SoT + path + which F-ids RETAIN vs residual unlock.

| F-id | Mục đích | SRS bước | Physical path (Option A) | Paper alias | Status |
|------|----------|----------|---------------------------|-------------|--------|
| **F-JD-01** | List JD library | FR-00 #1 | `GET /api/hrm/recruitment/job-templates` | `/api/hrm/rec/job-descriptions` | **LIVE RETAIN** + AC depth |
| **F-JD-02** | Create JD + snapshot | FR-00 #2 | `POST …/job-templates` | `POST …/job-descriptions` | **LIVE RETAIN** + publish residual |
| **F-JD-03** | Get by id | FR-00 #1–#2 | `GET …/job-templates/:id` | `GET …/job-descriptions/{id}` | **LIVE RETAIN** |
| **F-JD-04** | Patch / retire | FR-00 #2 · Ngừng | `PATCH …/job-templates/:id` | `PATCH …/job-descriptions/{id}` | **LIVE RETAIN** + status residual |
| **F-REC-JD-01** | Paper upsert name | meeting R2 | **Alias of F-JD-02/04** | `/rec/job-descriptions*` | **Alias only — DENY Nest dual** |
| **F-JD-DEF-*** | Field catalog | FR-00a | `/recruitment/jd-field-defs*` | — | **RETAIN peer** |
| **F-JD-LAY-*** | Layout | FR-00b | `/recruitment/jd-form-layouts*` | — | **RETAIN peer** |
| **F-YCTD-JD-01..05** | Bind / preview / STATUS | FR-00 #3 · FR-02 | job-templates bindable + requisitions soft FK | — | **RETAIN must_keep** |

### 8.1 Scope parity (U19)

List templates / get-by-id / create / patch / bindable list / YCTD create with `job_template_id` — **same** `resolveHrmListScope` + company persist rules as existing recruitment JD module.

### 8.2 Error family (RETAIN + residual)

| Code family | Use |
|-------------|-----|
| `HRM-REC-JD-*` | Library CRUD envelope (RETAIN) |
| `HRM-REC-JD-POS` | Position catalog assert (RETAIN) |
| `HRM-JD-YCTD-*` | Bind STATUS / REQUIRED / NOT-FOUND (RETAIN) |
| `HRM-JD-LAYOUT-*` / field VAL | Dynamic CFG (RETAIN peers) |
| Residual publish/status | Mint in API seat if O2/O3 need new codes — **no invent** in BA without SA/API |

---

## 9. Exit / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · Option **A** CONFIRMED |
| **next_owner** | **ba-process** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-sa-01.md` |
| **Unlocks** | BA AC pack `PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01` against Option A |
| **Does not unlock** | Dev code · honesty flips · REC-03 · Nest `/rec` dual · reopen W1–W4 · `jd_dynamic_done=true` |

---

## completion_report

- **Closed:** Option A/B/C + trade-off + F.1 disposition; LIVE vs gap vs FR-UC-BP-REC-00; paper alias lock; must_keep W1–W4 + JD-DYNAMIC + YCTD-REF; DENY second SoT / Nest dual / seed / honesty flip; O1–O7 for BA; unlock BA AC.
- **Residual:** BA AC (status 3-state vs `is_active` bridge; publish gate); optional ba-data/API DOC-DELTA; Dev after contracts — **cấm code until CONFIRMED** (satisfied by this seat).
