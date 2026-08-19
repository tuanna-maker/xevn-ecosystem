# PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01 — API F.1 · Lịch sử trạng thái UV gắn YCTD (Option A PHYSICAL)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-7 seat **#9**) |
| **lane** | governance · sa |
| **change_mode** | **UPGRADE / ADD** DOC-DELTA residual · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — F.1 physical Option A · unlock **dev-be** + **dev-fe** |
| **uc_ids** | `UC-BP-REC-05` |
| **depends_on** | DATA-01 **CONFIRMED** · BA-01 O1–O9 **CONFIRMED** · SA-01 Option **A LOCKED** · peer seal **`REC04QC1-MSL1LU4H`** |
| **ref_data** | [`PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01.md) — `public.rec_candidate_stage_history` · Lane A open-CHK |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md) · AC-REC-05-* · VAL-REC-STG-01..24 · O1–O9 |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01.md) Option A · F-REC-APP-02 residual |
| **ref_uv** | [`PO-HRM-REC-UV-YCTD-API-01.md`](./PO-HRM-REC-UV-YCTD-API-01.md) · F-REC-UV-YCTD-* · F-REC-CMP-* **RETAIN** |
| **ref_cat** | F-REC-CAT-STG/EFF-* · `HRM-REC-STAGE-UNKNOWN` **RETAIN** · `is_reject_outcome` / `is_hired_outcome` LIVE |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-05** Diễn biến **#0a–#2** · Thành công · special reverse / invent / empty EFF · **BR-BP-CV-02** · **BR-PLT-05** cite |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-APP-02** = **logical alias**; physical prefer `/recruitment/candidates*` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 |
| **ba-data** | **ALREADY CONFIRMED** (DATA-01) — this seat **does not** re-open schema invent |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical base | Nest `@Controller('recruitment')` — **`/api/hrm/recruitment/*` ONLY** |
| Transition primary | **`POST /api/hrm/recruitment/candidates/:id/transitions`** — **UPGRADE F-REC-APP-02** |
| Timeline | **`GET /api/hrm/recruitment/candidates/:id/stage-history`** — **ADD** |
| Stage home (O3) | Lane A `public.recruitment_candidates.status` (DTO `stage`) · soft FK `requisition_id` NOT NULL |
| History SoT | **ONE** `public.rec_candidate_stage_history` — atomic **UPDATE status + INSERT history** |
| EFF assert | When EFF>0: `to_stage` ∈ effective → else **`HRM-REC-STAGE-UNKNOWN`** (**RETAIN**) |
| Open catalog | Persist N+1 EFF keys — **RETAIN** DATA-01 open-CHK (no closed-six ceiling) |
| Reject | `is_reject_outcome` (or reject-key set) ⇒ `note` required → mint **`HRM-REC-STAGE-REJECT-REASON`** |
| Reverse | CFG `allow_reverse_stage` (default **true**) · deny → mint **`HRM-REC-STAGE-REVERSE-FORBIDDEN`** · allow ⇒ still APPEND |
| Display-ready DTO | Transition response + timeline rows: `from_stage`/`to_stage`/`note`/`changed_by`/`changed_at`/`desired_salary?` + current `stage` |
| U19 | list candidates **=** get-by-id **=** transition **=** stage-history **=** applications by YCTD — same `resolveHrmListScope` |
| Paper path | `POST /api/hrm/rec/applications/{id}/transitions` · `/rec/…/stage-history` = **logical alias only** — **DENY** Nest dual SoT |
| Non-SoT surfaces | Pool `PATCH …/candidates-pool/:id/stage` · Lane B `PATCH …/candidate-applications/:id/stage` (`job_posting_id`) — **≠** FR-05 timeline SoT |
| REC-03 / Campaign | **OUT / DENY** |
| Peers | **RETAIN** UV-YCTD · REC-04 scan/posted · 06a IV soft-gate · CAT STG/EFF · CMP · W1–W3 |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen REC-04 J-* |
| Unlock | **dev-be** + **dev-fe** (rule 26 split) after this CONFIRMED |

```text
  FE «Đổi trạng thái UV theo YCTD» + Timeline
        │  Network assert path contains /recruitment/
        ▼
  GET  /api/hrm/recruitment/pipeline-stages/effective                         (F-REC-CAT-EFF-01 RETAIN)
  GET  /api/hrm/recruitment/candidates/:id                                    (Lane A — RETAIN U19)
        │
        ▼
  POST /api/hrm/recruitment/candidates/:id/transitions                       (F-REC-APP-02 UPGRADE)
        │  assert to_stage ∈ EFF when EFF>0
        │  reject ⇒ note; reverse ⇒ CFG
        │  SAME TXN: UPDATE recruitment_candidates.status
        │           + INSERT rec_candidate_stage_history
        │  optional sync N–N application.stage when row exists
        ▼
  GET  /api/hrm/recruitment/candidates/:id/stage-history                     (F-REC-APP-02-TL ADD)
        │  display-ready from→to + note + changed_* (+ desired_salary?)
        ▼
  paper /api/hrm/rec/applications/{id}/transitions · /rec/…/stage-history = alias only
        │
        ▼
  Pool stage / posting-apps stage / REC-03 Campaign = OUT as FR-05 SoT
```

**Envelope RETAIN:** `{ code, message, data }` · success **`HRM-REC-200`** / **`HRM-REC-201`** (or existing Lane A envelope) · domain errors §8.

**Atomic invariant (O2 / VAL-24 / BR-BP-CV-02):** every transition **2xx** ⇒ (1) Lane A `status` updated **and** (2) ≥1 history INSERT same transaction · missing (2) = **FAIL** · persist history fail → rollback stage (**`HRM-REC-STAGE-HISTORY-FAIL`** optional mint).

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE (read-only cite) | Gap vs F.1 residual |
|---------|----------------------|---------------------|
| `GET …/pipeline-stages/effective` | Catalog EFF + flags (`is_reject_outcome`, `allows_interview_schedule`, …) | **RETAIN** picker SoT |
| `GET/POST/PATCH …/candidates*` | Lane A YCTD-bound · `status` closed CHK six · `resolveHrmListScope` | **UPGRADE** open status persist (DATA-01) + transition endpoint |
| `POST …/candidates/:id/transitions` | **ABSENT** | **ADD** primary F-REC-APP-02 |
| `GET …/candidates/:id/stage-history` | **ABSENT** | **ADD** timeline |
| `rec_candidate_stage_history` | **ABSENT** ensureSchema | **ADD** per DATA-01 (Dev implement) |
| `PATCH …/candidates-pool/:id/stage` | Person/INT-01 · EFF assert UNKNOWN | **RETAIN** · **≠** FR-05 timeline SoT |
| `PATCH …/candidate-applications/:id/stage` | Lane B posting apps · overwrite + EFF assert | **RETAIN leftover** · **≠** FR-05 SoT · **DENY** as DONE |
| `POST …/requisitions/:id/transitions` | YCTD WF approve/reject (W2) | **RETAIN** — **≠** UV stage timeline |
| Nest `/rec/*` | Paper naming | **Alias only — DENY** controller SoT |
| Reject / reverse mint | Weak / absent | **UNLOCK** REJECT-REASON · REVERSE-FORBIDDEN |
| REC-04 / 06a / UV | Sealed / LIVE | **RETAIN must_keep** |

**FORBIDDEN invent this seat:** Nest `/rec` dual · second history table · second catalog · REC-03 Campaign · seed · honesty flip · reopen REC-04 J-* / W1–W6 rewrite · redefine UV-YCTD/CMP/IV/scan · claim pool/posting PATCH = FR-05 DONE · claim 05a create = FR-05 DONE.

---

## 3. Path & alias lock (O1)

| Plane | Path |
|-------|------|
| **PHYSICAL (Nest GĐ1)** | `/api/hrm/recruitment/candidates/:id/transitions` · `/candidates/:id/stage-history` · `/candidates*` · `/pipeline-stages/effective` · `applications` / `compare` (**RETAIN**) |
| **LOGICAL (paper)** | `POST /api/hrm/rec/applications/{id}/transitions` · `GET /api/hrm/rec/…/stage-history` |
| Rule | Client/docs **may** keep paper names; Dev **implements physical only**. Gateway rewrite optional — **not** unlock-gate. |
| QA Network assert | Path **contains** `/recruitment/` — **FAIL O1** if FE mutates Nest `/rec/*` as SoT |

| Paper / logical | Physical | DB |
|-----------------|----------|-----|
| `rec_candidate_application` / application transition | Lane A `candidates/:id` | `recruitment_candidates` |
| `candidate_stage_history` / §2.6 | same history | `rec_candidate_stage_history` |
| current `stage` | DTO `stage` | `recruitment_candidates.status` |
| catalog | EFF-01 | `rec_pipeline_stage` |

---

## 4. CFG & reject/reverse dictionary (O5 / O6)

### 4.1 Reverse CFG (**Q-REC-STG-CFG-KEY** LOCKED)

| Key | Type | Default GĐ1 | Rule |
|-----|------|-------------|------|
| **`recruitment.allow_reverse_stage`** | boolean (company/tenant CFG) | **`true`** | `false` ⇒ any reverse attempt → **400** `HRM-REC-STAGE-REVERSE-FORBIDDEN` · history **not** written · stage unchanged |

**Reverse detection (normative):** transition is reverse when `to_stage` has **strictly lower** catalog `sort_order` (or equivalent EFF ordinal) than current `from_stage` **OR** body flag `is_reverse=true` when FE knows intent. Same-key no-op: **MVP allow** 2xx without new history **or** 400 no-op — prefer **no history row** if `to_stage === from_stage` (VAL: optional). Forward / equal ordinal with different key = normal transition (not reverse).

### 4.2 Reject class (O5)

| Predicate | Rule |
|-----------|------|
| Catalog row `is_reject_outcome=true` for `to_stage` | **Reject class** |
| Fallback key set when flag absent | `{ rejected, reject, withdrawn }` (case-sensitive keys as stored) |
| Required | `note` trim length > 0 |
| Missing note | **400** `HRM-REC-STAGE-REJECT-REASON` · no stage change · no history |

### 4.3 EFF empty (O4)

| Case | Behavior |
|------|----------|
| EFF=0 + FE opens picker | Empty + CTA admin — **UI** (no invent) |
| EFF=0 + POST with free-text `to_stage` | **400** `HRM-REC-STAGE-EMPTY-CATALOG` *(mint optional)* **or** treat as UNKNOWN family — **preferred mint** EMPTY-CATALOG ≠ invent when catalog non-empty |
| EFF>0 invent | **400** `HRM-REC-STAGE-UNKNOWN` (**RETAIN**) |

---

## 5. F.1 API functions (PHYSICAL)

> Mỗi function: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response → DB · Lỗi.

**Prefix:** `/api/hrm/recruitment`  
**Scope:** list/get candidates · transition · stage-history · applications by YCTD = **cùng** `resolveHrmListScope` + `assertResourceInHrmScope` (**U19** `scope_parity` · VAL-REC-STG-01/13 · STG-S-SCOPE).

---

### 5.1 F-REC-APP-02 — Đổi trạng thái UV–YCTD + append lịch sử (**UPGRADE**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/recruitment/candidates/:candidateId/transitions`** |
| **Mục đích** | Đổi giai đoạn pipeline trên **liên kết UV↔YCTD** (Lane A), ghi nhận **append-only** lịch sử (không ghi đè mất), bắt buộc lý do khi từ chối, tôn trọng CFG đảo chiều — phục vụ FR-UC-BP-REC-05 Diễn biến #1 / BR-BP-CV-02. |
| **Nghiệp vụ xử lý** | (1) JWT + `company_id` → `resolveHrmListScope`; load Lane A by `:candidateId` in-scope (`requisition_id` NOT NULL) — else **404/409** scope. (2) Read current `status` → `from_stage`. (3) Body `to_stage` required non-empty. (4) Load EFF catalog for company: if **EFF>0** and `to_stage` ∉ effective → **400** `HRM-REC-STAGE-UNKNOWN`; if **EFF=0** → **400** `HRM-REC-STAGE-EMPTY-CATALOG` (preferred) — **cấm** persist invent. (5) If reject class (`is_reject_outcome` or reject-key set) and `note` empty → **400** `HRM-REC-STAGE-REJECT-REASON`. (6) If reverse (§4.1) and CFG `recruitment.allow_reverse_stage=false` → **400** `HRM-REC-STAGE-REVERSE-FORBIDDEN`. (7) **Same transaction:** `UPDATE recruitment_candidates SET status=to_stage` (open CHK per DATA-01) **+** `INSERT rec_candidate_stage_history` (`company_id` denorm from Lane A, `recruitment_candidate_id`, optional `application_id` soft neo when N–N row exists, `from_stage`, `to_stage`, `note`, `desired_salary?`, `changed_by`, `changed_at=now()`). (8) If N–N application exists for same YCTD: sync `application.stage` **same txn** (BA ALT-05) — **DENY** posting-apps `job_posting_id` write as SoT. (9) History INSERT fail → rollback · **500/409** `HRM-REC-STAGE-HISTORY-FAIL`. (10) **cấm** Nest `/rec` dual · second history · CASCADE wipe · seed. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-05** Diễn biến **#1** · special reject / reverse / invent · Thành công · **BR-BP-CV-02** · **BR-PLT-05** · AC-REC-05-02/04/05 · ALT-02 · EX-01..03/06/10 · VAL-REC-STG-03/05/06/08/09/24 · **O1–O6**. |
| **Request** | Path `:candidateId` (UUID Lane A). Query/header scope: `company_id` as peer list. Body: `{ to_stage: string, note?: string, desired_salary?: number, is_reverse?: boolean }`. |
| **Request → DB** | `to_stage` → `recruitment_candidates.status` + history.`to_stage`; `note` → history.`note`; `desired_salary?` → history.`desired_salary`; actor → `changed_by`. |
| **Response** | Display-ready: `{ id, stage, requisition_id, company_id, history_id, history: { id, from_stage, to_stage, note, desired_salary, changed_by, changed_at } }` · **`HRM-REC-200`**. |
| **Lỗi** | `HRM-REC-STAGE-UNKNOWN` · `HRM-REC-STAGE-REJECT-REASON` · `HRM-REC-STAGE-REVERSE-FORBIDDEN` · `HRM-REC-STAGE-EMPTY-CATALOG` · `HRM-REC-STAGE-HISTORY-FAIL` · optional `HRM-REC-STAGE-WF-LOCKED` · scope 404/409. |

**Thin alternate (optional synonym — same atomic + VAL):** `PATCH /api/hrm/recruitment/candidates/:id` with `{ stage }` **only if** it delegates to the same transition service (append history + all VAL). Prefer FE call **POST transitions**.

**Paper alias:** `POST /api/hrm/rec/applications/{id}/transitions` — maps to Lane A `candidate_id` (paper application_id = logical alias of YCTD link per DATA-01).

**DENY as FR-05 SoT:** `PATCH …/candidates-pool/:id/stage` · `PATCH …/candidate-applications/:id/stage`.

---

### 5.2 F-REC-APP-02-TL — Timeline lịch sử trạng thái (**ADD**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/recruitment/candidates/:candidateId/stage-history`** |
| **Mục đích** | Trả về timeline append-only các lần đổi giai đoạn trên liên kết UV–YCTD để HR truy vết nguồn / từ chối / mức lương mong muốn theo thời gian (FR-05 #2 · BR-BP-CV-02) — **display-ready**, FE không tự dựng SoT. |
| **Nghiệp vụ xử lý** | (1) Scope assert on Lane A candidate (same resolver as get-by-id). (2) `SELECT` from `rec_candidate_stage_history` WHERE `recruitment_candidate_id=:id` ORDER BY `changed_at DESC` (optional `limit`/`cursor`). (3) Optional query `requisition_id` — Lane A already bound; if provided must match candidate.`requisition_id` else **400/404**. (4) Return rows display-ready; retired catalog keys **allowed** in `from_stage`/`to_stage` (ALT-06). (5) Empty timeline **200** `[]` hợp lệ (chưa transition). (6) **cấm** DELETE/UPDATE history on this path · **cấm** cascade hide on YCTD close. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-05** Diễn biến **#2** · AC-REC-05-03/08 · ALT-06 · EX-04/15 · VAL-REC-STG-06/07/17/21 · **O2**. |
| **Request** | Path `:candidateId`. Query: `company_id`; optional `limit`, `cursor`, `requisition_id`. |
| **Response → DB** | `data[]` ← `rec_candidate_stage_history` · fields §6. Success **`HRM-REC-200`**. |
| **Lỗi** | Scope 404/409 · empty **200** (not 404). |

**Paper alias:** `GET /api/hrm/rec/applications/{id}/stage-history` · `GET /api/hrm/rec/…/stage-history`.

---

### 5.3 F-REC-CAT-EFF-01 — Picker giai đoạn (**RETAIN** · cite only)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/pipeline-stages/effective` |
| **Mục đích** | Cấp danh sách mã hiệu lực cho ô Trạng thái — Diễn biến #0b. |
| **Nghiệp vụ** | **RETAIN** sealed CAT — **cấm** redefine STG-02 / invent-ban trên admin. |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-05 #0b/#0a · AC-REC-05-01/07 · O4/O7. |

---

### 5.4 Peers must_keep (cite — **không** redefine)

| F-id | Note |
|------|------|
| F-REC-UV-YCTD-* / CMP | Create/attach prerequisite · **≠** FR-05 DONE |
| F-REC-CV-SCAN-* / YCTD-04 | REC-04 sealed `REC04QC1-MSL1LU4H` · **DENY reopen J-CV-04** |
| F-REC-IV-* / SCHED-SOFT | 06a · DISALLOW **≠** UNKNOWN |
| F-REC-YCTD-03 transitions | Requisition WF — **≠** UV stage |

---

## 6. Display-ready DTO dictionary

### 6.1 Transition response

| Field | Source | Rule |
|-------|--------|------|
| `id` | Lane A PK | UUID |
| `stage` | `status` after UPDATE | Current key (open catalog) |
| `requisition_id` | Lane A | YCTD soft FK |
| `company_id` | Lane A | Scope |
| `history_id` | New history PK | Present on 2xx |
| `history.from_stage` | Prior status | Nullable if first write from nullish |
| `history.to_stage` | Body | NOT NULL |
| `history.note` | Body | Required when reject |
| `history.desired_salary` | Body optional | Snapshot |
| `history.changed_by` | Actor | Soft uuid |
| `history.changed_at` | Server now | ISO timestamptz |
| FE invent timeline | — | **FAIL** VAL-21 |

### 6.2 Stage-history row

```text
StageHistoryItemDto = {
  id: string;                 // uuid
  recruitment_candidate_id: string;
  application_id: string | null;
  company_id: string;
  from_stage: string | null;
  to_stage: string;
  note: string | null;
  desired_salary: number | null;
  changed_by: string | null;
  changed_at: string;         // ISO
};
```

### 6.3 Lane A get/list — display-ready stage

| Field | Source | Rule |
|-------|--------|------|
| `stage` (or `status`) | `recruitment_candidates.status` | Expose consistently; FE binds DTO `stage` |
| After transition F5 | Same field | Must equal last history.`to_stage` |

---

## 7. Error taxonomy (mint · BA/QA assert)

| Code | HTTP | When | UX intent (VI) |
|------|------|------|----------------|
| **`HRM-REC-STAGE-UNKNOWN`** | 400 | `to_stage` ngoài EFF khi EFF>0 | Mã giai đoạn không thuộc danh mục hiệu lực |
| **`HRM-REC-STAGE-REJECT-REASON`** *(mint)* | 400 | Reject class thiếu `note` | Nhập lý do từ chối |
| **`HRM-REC-STAGE-REVERSE-FORBIDDEN`** *(mint)* | 400 | Reverse khi CFG tắt | Không được đảo chiều giai đoạn |
| **`HRM-REC-STAGE-EMPTY-CATALOG`** *(mint · preferred)* | 400 | Transition khi EFF=0 | Chưa có danh mục — vào Cài đặt |
| **`HRM-REC-STAGE-HISTORY-FAIL`** *(mint · optional)* | 500/409 | INSERT history fail → rollback stage | Không lưu được lịch sử — thử lại |
| **`HRM-REC-STAGE-WF-LOCKED`** *(mint · optional)* | 409 | Transition bị khóa WF (nếu có) | Hồ sơ đang khóa quy trình |
| `HRM-REC-IV-400-STAGE-DISALLOW` | 400 | IV soft-gate (**RETAIN** · ≠ UNKNOWN) | — |
| `HRM-REC-UV-YCTD-*` / `HRM-REC-CV-SCAN-*` | 4xx | Peers (**RETAIN**) | ≠ stage transition |
| Scope | 409/404 | Ngoài phạm vi pháp nhân | — |

---

## 8. Scope parity (U19)

| Surface | Resolver |
|---------|----------|
| `GET /candidates` / `GET /candidates/:id` | `resolveHrmListScope` + company filter |
| `POST …/candidates/:id/transitions` | Same + `assertResourceInHrmScope` on Lane A |
| `GET …/candidates/:id/stage-history` | Same as get-by-id |
| `GET applications` / compare by YCTD | UV-YCTD RETAIN |
| `GET pipeline-stages/effective` | Company catalog scope RETAIN |

**Invariant STG-S-SCOPE:** list candidates **=** get-by-id **=** transition **=** stage-history **=** applications by YCTD.  
**FAIL** silent cross-tenant timeline / stage mutate.

**Persona:** Group CEO rollup in-scope only; Member CEO / HRBP membership narrow — same resolver.

---

## 9. ba-data — **ALREADY CONFIRMED** (pointer)

| Topic | Decision |
|-------|----------|
| History table | DATA-01 **ADD** `public.rec_candidate_stage_history` |
| Open CHK | DATA-01 **DROP** closed-six → open non-empty |
| This API seat | **Does not** invent alternate physical name / dual table |
| Dev-BE | Implement ensureSchema + migrate per DATA-01 **with** this F.1 |

---

## 10. Client API_DESIGN DOC-DELTA (pointer)

Append to `API_DESIGN_HRM_ENTERPRISE.md` (client) when ba-docs wave runs — **this file is SoT for Dev unlock**:

| F-id | Physical | SRS bước |
|------|----------|----------|
| **F-REC-APP-02** UPGRADE | `POST …/candidates/:id/transitions` | FR-05 Diễn biến **#1** |
| **F-REC-APP-02-TL** ADD | `GET …/candidates/:id/stage-history` | FR-05 Diễn biến **#2** |
| F-REC-CAT-EFF-01 | RETAIN | FR-05 #0b |

Paper `POST /rec/applications/{id}/transitions` remains **alias**.

---

## 11. Honesty & must_keep / DENY

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| C-SLICE | GWC REC-05 ≠ module REC UAT ≠ Phase1 DONE |
| must_keep W1–W3 | HC / YCTD / dashboard |
| must_keep W4 | IV one-active + soft-gate DISALLOW |
| must_keep W5 | JD `job-templates` |
| must_keep W6 | REC-04 scan/posted · stamp **`REC04QC1-MSL1LU4H`** · J-CV-04-* |
| must_keep | `rec_pipeline_stage` · Lane A `requisition_id` · UV-YCTD · CMP · U19 · soft-delete · UNKNOWN invent-ban |
| **DENY** | Nest `/rec` dual · second history/catalog · REC-03 · posting-apps / pool as FR-05 SoT · overwrite-only DONE · seed · honesty flip · invent beyond BA/SRS · apps/** this seat · reopen REC-04 J-* / W1–W6 without regression · claim 05a create = FR-05 DONE · Kanban required this seat (O9 P2 OUT) |

---

## 12. Dev unlock packet

### 12.1 Dev-BE (`PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01`)

1. ensureSchema **ADD** `rec_candidate_stage_history` per DATA-01 §4 · **DROP/REPLACE** Lane A closed-six CHK per DATA-01 §5.
2. **ADD** `POST …/candidates/:id/transitions` — EFF assert · reject note · reverse CFG · **atomic** UPDATE+INSERT · optional N–N stage sync.
3. **ADD** `GET …/candidates/:id/stage-history` — display-ready DTO · same scope as get.
4. Mint codes: `HRM-REC-STAGE-REJECT-REASON` · `REVERSE-FORBIDDEN` · preferred `EMPTY-CATALOG` · optional `HISTORY-FAIL` · **RETAIN** UNKNOWN.
5. CFG read `recruitment.allow_reverse_stage` default **true**.
6. U19 jest: list=get=transition=timeline; invent UNKNOWN; reject; reverse deny; atomic fail; regression UV-YCTD / CAT / IV DISALLOW / REC-04 flags / open CHK N+1.
7. **DENY** Nest `/rec` controller · second history · seed · honesty · reopen REC-04 rewrite.

### 12.2 Dev-FE (`PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01`)

1. UV detail theo YCTD → picker **GET effective** · **POST transitions** physical `/recruitment/` · Timeline **GET stage-history**.
2. Reject form: lý do bắt buộc; toast VI on REJECT-REASON / UNKNOWN / REVERSE-FORBIDDEN.
3. F5: stage + timeline còn; **no** Nest `/rec` SoT; **no** Campaign; **no** pool-stage as FR-05 sole.
4. Kanban drag **OUT** MVP this seat (O9 P2).

---

## 13. Validation plan (QA after Dev)

| Gate | PASS when |
|------|-----------|
| L0/L1 | Stack + transition/timeline 2xx/4xx codes |
| L2.5 | **J-HRM-REC-STG-05-01..04** browser U65 — no seed |
| Network | Path `/recruitment/` · mint codes on EX paths · history ≥1 after 2xx |
| Honesty | Flags remain false · C-SLICE · **DENY** reopen J-CV-04 rewrite |

---

## 14. Exit / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **next_owner** | **pm** → unlock **dev-be** + **dev-fe** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-api-01.md` |
| **Unlocks** | Execution residual transition + timeline + history persist |
| **Does not unlock** | Honesty flips · REC-03 · Nest `/rec` dual · module REC UAT · reopen REC-04 rewrite · Kanban MVP |

---

## completion_report

- **Closed:** F.1 physical Option A CONFIRMED — **UPGRADE F-REC-APP-02** `POST …/candidates/:id/transitions` (atomic Lane A status + APPEND `rec_candidate_stage_history`) · **ADD** `GET …/stage-history` · display-ready DTO · EFF assert UNKNOWN RETAIN · mint `HRM-REC-STAGE-REJECT-REASON` · `REVERSE-FORBIDDEN` (+ EMPTY-CATALOG / HISTORY-FAIL) · CFG `recruitment.allow_reverse_stage` default true · U19 STG-S-SCOPE · paper `/rec` alias · ba-data already CONFIRMED · DENY Nest dual / second history / REC-03 / pool-posting SoT / seed / honesty / reopen REC-04.
- **Residual:** Dev-BE/FE implement · QA U65 J-HRM-REC-STG-05-* · QC GWC C-SLICE.
- **O1/O3:** Physical `/recruitment/candidates/:id` only · Lane A `candidate_id` SoT.
