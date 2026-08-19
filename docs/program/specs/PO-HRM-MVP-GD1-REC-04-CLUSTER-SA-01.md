# PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01 — Option/F.1 · Quét kho CV nội bộ trước kênh ngoài

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → TechSpec/DB/API residual → Dev |
| **depends_on** | QC-01 GWC Wave-5 UC-BP-REC-00 **SEALED** — stamp `REC00QC1-MSL0JMUT` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qc-01.md` |
| **uc_ids** | `UC-BP-REC-04` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#8** WAVE-6 after REC-00 |
| **ref_sa_spine** | [`PO-HRM-REC-UV-YCTD-API-01.md`](./PO-HRM-REC-UV-YCTD-API-01.md) · [`PO-HRM-REC-UV-YCTD-DB-01.md`](./PO-HRM-REC-UV-YCTD-DB-01.md) · peer [`…-REC-00/01/02/08/06A-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md) — **reuse · DENY reopen seals** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** RETAIN (`R-PLT-JD-DYNAMIC-DONE-01`) · 16 program honesty flags **false** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-04** · **BR-BP-CV-01** · Diễn biến #1–#2 · Thành công |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · **WBS-REC-03** (Kho CV) · partner **REQ_REC_002** |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-04 · BR-BP-CV-01 |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §2.4 `rec_candidate` · §2.5 `rec_candidate_application` = **logical alias** of LIVE pool + N–N |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` F-REC-APP-* · F-REC-UV-YCTD-* · F-REC-CMP-* — **no wipe**; ADD family **F-REC-CV-SCAN-*** (this seat disposition) |
| **OUT** | **UC-BP-REC-03** Campaign / tin đăng SoT · Nest `/rec` dual · second CV person SoT · invent greenfield `rec_cv_scan_log` as **only** SoT · seed · honesty flip |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-6 architecture unlock: **Quét kho CV nội bộ trước kênh ngoài** vs AS-IS candidates pool / applications / YCTD spine |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after REC-00 QC-01 GWC |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-REC-04 · BR-BP-CV-01 · BR-BP-CV-03 (N–N UV↔YCTD peer) · F-REC-UV-YCTD-* · F-REC-CMP-* · YCTD `open_for_hire` + `pipeline_flags` · U19 scope_parity |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **Person kho (Lane B):** `public.candidates` via Nest **`/api/hrm/recruitment/candidates-pool*`** (list/get/create/patch/delete + `start-pipeline`). **YCTD-bound spine (Lane A):** `public.recruitment_candidates` via **`/candidates*`** when `requisition_id` present (FR-RC-03 / F-REC-UV-YCTD-03). **N–N attach:** `candidate-applications*` + `GET applications` + `GET compare` (F-REC-CMP-01/02). **YCTD gate spine (SEALED W2):** `job_requisitions.status` incl. `open_for_hire` + **`pipeline_flags_json`** keys `{posted, has_cv, interview_started, cv_intake_allowed, *_at}` — **no** `internal_scan_*` keys yet. **External channel:** REC-03 / `job_postings` = **OUT GĐ1** (Lane B leftover ≠ tin ngoài SoT). Paper `rec_candidate` / `/rec/candidates*` = naming alias. UV-YCTD contracts **CONFIRMED** (API/DB) — create UV requires YCTD; position derived. |
| **Paper target** | FR-UC-BP-REC-04: trước mở kênh ngoài, quét kho nội bộ theo **chức danh + kỹ năng** (không chỉ hành chính); gắn UV khớp vào pipeline YCTD **hoặc** skip có lý do + quyền; 0 kết quả vẫn «đã quét»; skip không lý do → chặn; trạng thái UV luôn gắn YCTD (N–N). BR-BP-CV-01: mở tin ngoài chưa quét → chặn hoặc bắt skip. |
| **Gap class** | **impl_gap residual on LIVE spine** — **not** greenfield: (1) **no explicit scan step** / audit on YCTD before `posted` / external readiness; (2) search UX may be pool-list only without skill/title criteria tied to YCTD; (3) risk of inventing second CV SoT or Nest `/rec/candidates` dual; (4) risk of reopening REC-03 as «kênh ngoài» SoT; (5) conflating UV-YCTD create (05a) with FR-04 scan gate. |
| **Constraints** | U89 continuous · **preserve** REC-00/01/02/08/06a seals · UV-YCTD ONE soft FK · C-SLICE · DENY REC-03 reopen · DENY seed · DENY flip `recruitment_uat_ready` / `jd_dynamic_done` · DENY Nest `/rec` dual · DENY second CV SoT · **cấm code until Option CONFIRMED** (this seat) |
| **Failure impact if unresolved** | Board #8 stalls; BA cannot AC FR-04; Dev invents `rec_cv_scan*` / Nest `/rec` dual; opens Campaign as gate SoT; honesty flip; regression UV↔YCTD / open_for_hire |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-REC-02 (SEALED)                     UC-BP-REC-05a / UV-YCTD (RETAIN contracts)
  job_requisitions                          recruitment_candidates + applications N–N
    status = open_for_hire                    soft FK requisition_id only
    pipeline_flags_json ──────────────────►   position derived from YCTD
         │
         │  ADD residual keys (Option A default):
         │    internal_scan_done | internal_scan_skipped
         │    internal_scan_at | internal_scan_skip_reason
         │    (gate before pipeline_flags.posted = true)
         ▼
  «Kho CV nội bộ» SoT person ─── Lane B public.candidates
       GET /api/hrm/recruitment/candidates-pool*     (scan search surface)
       criteria: position_code / skill family / experience (BA depth)
                │
                │  attach khớp → Lane A / N–N (RETAIN F-REC-UV-YCTD-03/04)
                ▼
  POST /candidates (+ requisition_id)  OR  POST candidate-applications
  GET  /applications?requisition_id=…  · GET /compare (RETAIN CMP)
                │
                │  complete / skip scan (NEW disposition F-REC-CV-SCAN-*)
                ▼
  PATCH …/requisitions/:id/pipeline-flags   OR  POST …/requisitions/:id/internal-scan
       → stamp internal_scan_* · 0 hits still «đã quét»
       → DENY posted=true until scan done | skip valid
                │
                │  paper alias ONLY: /api/hrm/rec/candidates* · /rec/…/internal-scan*
                ▼
  REC-03 Campaign / job_postings  = OUT GĐ1 — NOT SoT for scan or «kênh ngoài»
```

**Label lock:** «Kho CV nội bộ» = person pool (`candidates` / paper `rec_candidate`) — **not** a second table beside LIVE.  
**Spine lock:** Nest physical `/recruitment/*` — **DENY** greenfield Nest `/rec/*` SoT.  
**Gate lock:** Scan audit lives on **YCTD** (`pipeline_flags` UPGRADE or thin transition) — **DENY** invent standalone scan SoT that bypasses YCTD.  
**Honesty lock:** Slice GWC later **≠** `recruitment_uat_ready=true` · **≠** `jd_dynamic_done=true`.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / DB / API) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Kho UV person | §2.4 `rec_candidate` | `public.candidates` + `/candidates-pool*` | **LIVE — UPGRADE** as scan search surface |
| UV↔YCTD N–N | §2.5 application | Lane A `recruitment_candidates` + `candidate-applications*` | **RETAIN** must_keep (UV-YCTD) |
| Create UV + YCTD | F-REC-UV-YCTD-03 | `POST /candidates` + required `requisition_id` | **RETAIN** |
| Compare / list apps | F-REC-CMP-01/02 | `GET applications` · `GET compare` | **RETAIN** |
| YCTD receivable | `open_for_hire` | W2 sealed transitions + flags | **RETAIN** must_keep |
| Pipeline flags | posted / has_cv / … | `pipeline_flags_json` LIVE — **no scan keys** | **UNLOCK residual** ADD `internal_scan_*` |
| Quét theo skill/title | FR-04 Diễn biến #1 | Pool filter shallow / free-text risk | **GAP residual** — BA criteria AC |
| Skip có lý do + quyền | FR-04 #2 · BR-BP-CV-01 | Absent | **UNLOCK residual** |
| 0 kết quả = đã quét | FR-04 special | Absent audit | **UNLOCK residual** |
| Chặn kênh ngoài trước quét | BR-BP-CV-01 | `posted` exists but ungated by scan | **UNLOCK residual** — gate `posted` |
| External channel UI | REC-03 tin đăng | OUT GĐ1 · `job_postings` leftover | **OUT / DENY** reopen as SoT |
| Paper `/rec/candidates` | F-REC-APP / UV overlay | Prefer physical `/recruitment/*` | **Alias only — DENY dual Nest** |
| Scope parity U19 | special | `resolveHrmListScope` on pool/candidates/YCTD | **RETAIN** |
| Module REC UAT / honesty | program | W1–W5 C-SLICE only | **DENY flip** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_UPGRADE on LIVE pool + applications + YCTD flags (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** physical Nest `/api/hrm/recruitment/candidates-pool*` (kho person) + Lane A `/candidates*` + `candidate-applications*` / `applications` / `compare` + YCTD `job_requisitions` (`open_for_hire`, `pipeline_flags_json`). Treat paper `rec_candidate` / `/rec/candidates*` as **logical alias only**. **RETAIN** UV-YCTD ONE soft FK `requisition_id`, receivable gate, CMP, stage catalog soft-gate peers. **UPGRADE residual only** for FR-UC-BP-REC-04: (1) scan search against kho (title/`position_code` + skill/experience criteria — BA depth); (2) attach matches via existing UV/application paths; (3) stamp scan complete / skip on YCTD via **ADD keys** on `pipeline_flags_json` (default) **or** thin `POST …/internal-scan` that writes the same flags; (4) **DENY** `posted=true` (kênh ngoài readiness) until `internal_scan_done` **or** valid skip (reason + permission); (5) 0 hits still stamps «đã quét». **REC-03 remains OUT** — GĐ1 does **not** implement Campaign; gate prepares for GĐ2 / any future external post surface without inventing postings SoT. |
| **Benefits** | Zero second CV SoT; reuses UV-YCTD + YCTD flags sealed pattern; fastest U89 #8; matches REC Option A physical-prefer; unlocks BA without invent Nest `/rec` |
| **Costs** | BA must lock criteria depth (skill family vs exact title); optional ba-data if columns preferred over JSON keys; FE YCTD «Quét kho» step residual |
| **Risks** | Dev invents `/rec/candidates` or `rec_cv_scan_log` as sole SoT — **mitigate:** DENY + alias. Reopens REC-03 — **mitigate:** OUT. Treats 05a create as FR-04 DONE — **mitigate:** O6 must_keep. Flip honesty — **mitigate:** HOLD cite. |

### Option B — Greenfield `rec_candidate` + Nest `/rec/candidates` + dedicated scan SoT table

| | |
|--|--|
| **Description** | Implement paper tables/routes as new SoT; dual-run or migrate off `candidates` / `recruitment_candidates`; new `rec_cv_scan_event` as only audit; re-wire UV/application FK. |
| **Benefits** | Clean paper name fidelity |
| **Costs** | Dual SoT migration; rewrite FE Ứng viên + YCTD; break UV-YCTD / CMP seals; high blast |
| **Risks** | Regression open_for_hire / N–N · C-SLICE · U89 delay — **REJECT** |

### Option C — HOLD / claim UV-YCTD = FR-04 DONE / flip honesty

| | |
|--|--|
| **Description** | Treat UV-YCTD create/compare or pool list as FR-UC-BP-REC-04 complete; or HOLD Option; or flip `recruitment_uat_ready` / `jd_dynamic_done`. |
| **Benefits** | Short-term idle |
| **Costs** | No scan gate / skip audit; BR-BP-CV-01 unenforced; board #8 false DONE or stuck; violates U89 continuous + honesty HOLD |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-04 + BR-BP-CV-01) | 25 | **9** | 8 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **9** | 2 | 8 |
| Security / scope_parity U19 + CT isolation | 15 | **9** | 4 | 5 |
| Reliability (one CV person SoT + YCTD gate) | 15 | **9** | 3 | 4 |
| Maintainability (preserve UV-YCTD + W1–W5) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **9.0** | **3.6** | **3.4** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Dev creates Nest `/rec/candidates` beside recruitment | Grep routes | **DENY** dual Nest; paper = alias only |
| A | Greenfield second CV person table | Diff / ba-data | **DENY** second physical SoT; alias `rec_candidate` |
| A | Invent `rec_cv_scan_log` as **only** SoT bypassing YCTD | Schema review | Prefer flags on YCTD; event table optional **append** only if BA needs audit depth — never sole SoT |
| A | Reopen REC-03 / `job_postings` as kênh ngoài SoT | Code review | **DENY** · OUT GĐ1 |
| A | Set `posted=true` without scan/skip | QA BR-BP-CV-01 | Gate in PATCH flags / scan transition |
| A | Skip without reason | API VAL | **400** family `HRM-REC-CV-SCAN-*` |
| A | Cross-company pool leak | U19 tests | Same `resolveHrmListScope` as pool list |
| A | Flip `recruitment_uat_ready` / `jd_dynamic_done` | QC honesty | **DENY** · C-SLICE |
| A | Reopen sealed REC-00 JD / W1–W4 as rewrite | Bus | **DENY**; regression only |
| A | Seed pool for U65 evidence | QA evidence | **DENY** seed |
| B | Dual SoT + FK break | Integration | Reject B |
| C | Board idle / false DONE | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_UPGRADE** on LIVE candidates-pool + Lane A/applications + YCTD `pipeline_flags`; paper `rec_candidate` / `/rec/*` = **alias only** |
| **Why selected** | Kho + UV↔YCTD + YCTD flags already LIVE/sealed; implements FR-04 without dual SoT; preserves W1–W5 + UV-YCTD must_keep; unlocks U89 #8 BA; matches Option A pattern on REC-00/01/02/06a/08 |
| **Assumptions** | UV-YCTD soft FK ONE physical `requisition_id` **RETAIN**. REC-03 remains OUT. External «đăng ngoài» GĐ1 = readiness via `posted` / future GĐ2 — **not** Campaign SoT. `jd_dynamic_done=false` · `recruitment_uat_ready=false` until named waves. Prior UV create ≠ FR-04 scan gate. |
| **Rejected** | **B** — second CV SoT / Nest `/rec` dual / scan-only greenfield · **C** — HOLD / honesty flip / false DONE |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | `/api/hrm/recruitment/*` only; `/rec/*` alias | Cite in AC Network |
| **O2** | Scan audit persist | Prefer **ADD** `pipeline_flags` keys `internal_scan_done` · `internal_scan_skipped` · `internal_scan_at` · `internal_scan_skip_reason` (+ optional thin `POST …/internal-scan`); dedicated event table **only if** audit depth required — **append**, not second SoT | Pick flags vs columns vs append-event; ba-data **only if** new physical columns/table |
| **O3** | Kho search SoT | **candidates-pool** (Lane B person) as primary scan list; attach via UV/application; Lane A list alone ≠ «kho» | AC Diễn biến #1 surface |
| **O4** | Match criteria | MVP: `position_code` / job_titles family + optional skill/experience filters (not admin-only fields); exact-title-only = FAIL risk (UC_BR_MATRIX) | AC criteria + empty 0 hits |
| **O5** | External gate | **DENY** `pipeline_flags.posted=true` until scan done \| skip valid; REC-03 OUT — no Campaign reopen | AC BR-BP-CV-01 |
| **O6** | Peers UV-YCTD / REC-05 / CMP | RETAIN F-REC-UV-YCTD-* · F-REC-CMP-* · stage catalog; FR-04 AC may cite attach but **not** redefine 05a create SoT | Scope note |
| **O7** | Skip permission | Skip requires reason + role (HR / TP — BA name) | VAL + 403/400 |
| **O8** | Honesty | All flags false · C-SLICE | Footer every evidence |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | Lane B `candidates` + `/candidates-pool*` · Lane A `recruitment_candidates` + `/candidates*` · `candidate-applications*` / `applications` / `compare` · UV-YCTD ONE `requisition_id` · receivable `open_for_hire` · `pipeline_flags` BOD/posted family (extend, don't wipe) · W1 REC-01 cell/spawn · W2 YCTD mode/BOD/CELL-QTY · W3 dashboard physical · W4 IV one-active · W5 JD `job-templates` + soft FK · `resolveHrmListScope` · soft-delete · honesty false |
| **DENY invent** | Second CV person table · Nest `/rec` dual SoT · `job_postings` / Campaign as scan or kênh ngoài SoT · scan event as **sole** SoT bypassing YCTD · seed for evidence · flip `jd_dynamic_done` / `recruitment_uat_ready` / program honesty · claim module REC UAT / Phase1 DONE · reopen sealed REC-00 J-HRM-REC-JD-00-01..04 / W1–W4 without regression |
| **OUT** | UC-BP-REC-03 · Campaign / tin đăng GĐ1 |
| **HOLD peer** | `R-PLT-JD-DYNAMIC-DONE-01` — L3/REC-00 GWC ≠ program DONE |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1 REC-01/01b | HCELL / spawn UQ | RETAIN |
| W2 REC-02/02b | TARGET-MONTH · BOD · open_for_hire · flags · JD soft FK | RETAIN — **extend** flags only |
| W3 REC-08 | dashboard physical | RETAIN |
| W4 REC-06a | `REC06AQC2-MSKZAM58` · R-REC-IV-PROJ-ID CLOSED | RETAIN |
| W5 REC-00 | `REC00QC1-MSL0JMUT` · J-HRM-REC-JD-00-01..04 | RETAIN — **DENY reopen without regression** |
| UV-YCTD | API/DB CONFIRMED | RETAIN ONE soft FK |
| JD-DYNAMIC | HOLD `jd_dynamic_done=false` | RETAIN |

---

## 7. Implementation and Validation Plan

### 7.1 Rollout steps (governance → execution)

1. **BA-process** — AC pack FR-UC-BP-REC-04 (O1–O8 · VAL · Diễn biến FE · J-* DRAFT) against this Option A; cite BR-BP-CV-01; **depends_on** this CONFIRMED; **cấm invent** beyond SRS; unlock residual scan gate only.
2. **ba-data / SA API** — DOC-DELTA only if O2 chooses new columns/event table; else F.1 = physical pool + flags UPGRADE + F-REC-CV-SCAN-* disposition.
3. **Dev-BE / Dev-FE** — after AC + contracts CONFIRMED — residual only (no greenfield Nest `/rec`).
4. **QA** — U65 browser: YCTD open_for_hire → Quét kho → criteria → 0/N hits → attach or skip+reason → F5 flags persist → attempt posted without scan → blocked; Network physical paths; **no seed**.
5. **QC** — GWC C-SLICE; honesty false; DENY module UAT.

### 7.2 Rollback

- Docs Option stamp only until Dev; if Dev regresses UV-YCTD / open_for_hire → revert residual; seals W1–W5 untouched.

### 7.3 Validation checkpoints

| Gate | PASS when |
|------|-----------|
| SA | This file CONFIRMED Option A |
| BA | AC pack cites O1–O8 · no Nest dual · no honesty invent · no REC-03 |
| API/DATA | Physical prefer pool + flags · alias paper |
| QA | UF FR-04 Diễn biến #1–#2 browser + F5 + Network 2xx + BR-BP-CV-01 block |
| QC | GWC · C-SLICE · `jd_dynamic_done=false` · `recruitment_uat_ready=false` |

### 7.4 Success criteria

- One CV person SoT; YCTD scan audit; `posted` gated; paper `/rec` not second Nest controller; BA unlocked; no honesty flip; REC-03 OUT.

---

## 8. F.1 API matrix (disposition — physical prefer Option A)

> Full request/response column contracts = **next** TechSpec/API seat after BA AC. This seat **locks** SoT + path + which F-ids RETAIN vs residual unlock.

| F-id | Mục đích | SRS bước | Physical path (Option A) | Paper alias | Status |
|------|----------|----------|---------------------------|-------------|--------|
| **F-REC-CV-SCAN-01** | Quét / list kho theo tiêu chí gắn YCTD | FR-04 #1 | `GET /api/hrm/recruitment/candidates-pool?…` (+ YCTD context query) **or** thin `GET …/requisitions/:id/internal-scan/candidates` wrapping pool | `/api/hrm/rec/candidates*` · `/rec/recruitment-requests/{id}/internal-scan/candidates` | **UNLOCK residual** on LIVE pool |
| **F-REC-CV-SCAN-02** | Ghi nhận đã quét (kể cả 0 hits) + optional attach ids | FR-04 #2 · Thành công | `POST …/requisitions/:id/internal-scan` **or** `PATCH …/pipeline-flags` with `internal_scan_done` | `/rec/…/internal-scan` | **UNLOCK residual** |
| **F-REC-CV-SCAN-03** | Skip quét có lý do + quyền | FR-04 #2 · special skip | same transition family + `internal_scan_skipped` + reason | same alias | **UNLOCK residual** |
| **F-REC-UV-YCTD-03/04** | Gắn UV khớp vào YCTD / N–N | FR-04 #2 attach · 05a peer | `POST /candidates` · `POST candidate-applications` | `/rec/candidates*` | **RETAIN must_keep** |
| **F-REC-UV-YCTD-01/02/05** | Receivable picker · position · list | peer | `/requisitions?receivable=true` · `/candidates*` | `/rec/…` | **RETAIN** |
| **F-REC-CMP-01/02** | Apps + compare by YCTD | peer / later REC-05/06b | `GET applications` · `GET compare` | `/rec/applications` · `/rec/compare` | **RETAIN** |
| **F-REC-YCTD-04** | Pipeline flags / transitions | W2 · gate posted | `PATCH …/pipeline-flags` · `POST …/transitions` | `/rec/recruitment-requests*` | **RETAIN** + scan keys residual |
| **F-REC-APP-*** | Paper person/app names | meeting | Alias of pool + applications | `/rec/candidates*` | **Alias only — DENY Nest dual** |

### 8.1 Scope parity (U19)

List pool / get-by-id / scan wrapper / YCTD get / patch flags / attach application — **same** `resolveHrmListScope` + company persist rules as existing recruitment module. **DENY** cross-CT CV leak.

### 8.2 Error family (RETAIN + residual mint)

| Code family | Use |
|-------------|-----|
| `HRM-REC-UV-YCTD-*` | Attach / receivable / position (RETAIN) |
| `HRM-YCTD-*` | YCTD mode/BOD/flags (RETAIN) |
| `HRM-REC-CMP-*` | Compare MAX-N / mix (RETAIN) |
| **`HRM-REC-CV-SCAN-*`** (residual) | Scan required · skip reason missing · skip forbidden · already scanned · posted blocked | Mint in API seat after BA — **no invent** in BA without SA/API |

---

## 9. Exit / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · Option **A** CONFIRMED |
| **next_owner** | **ba-process** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-sa-01.md` |
| **Unlocks** | BA AC pack `PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01` against Option A |
| **Does not unlock** | Dev code · honesty flips · REC-03 · Nest `/rec` dual · reopen W1–W5 · `jd_dynamic_done=true` · `recruitment_uat_ready=true` |

---

## completion_report

- **Closed:** Option A/B/C + trade-off + F.1 disposition; LIVE vs gap vs FR-UC-BP-REC-04 / BR-BP-CV-01; paper alias lock; must_keep REC-00/01/02/08/06a + UV-YCTD; DENY second CV SoT / Nest dual / REC-03 / seed / honesty flip; O1–O8 for BA; unlock BA AC; **cấm code** until contracts.
- **Residual:** BA AC (criteria depth; flags vs columns; skip role; posted gate); optional ba-data/API DOC-DELTA; Dev after contracts.
