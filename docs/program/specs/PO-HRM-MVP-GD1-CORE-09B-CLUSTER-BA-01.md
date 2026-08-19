# BA AC pack — Wave-14 CORE cluster · UC-BP-CORE-09b (Chọn gói nghề + xem trước HĐLĐ)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-14 seat **#16**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (tables LIVE) · sa API-01 **HOLD** unless residual wire gap proven |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR-CORE-09b · **no** reopen W13 CORE-09a / W12 CORE-08 / W11 CORE-02 / W10 CORE-01 / W1–W9 REC · **no** invent Nest `/core` dual / 09c VER-PDF / 09d TPL as this WI DONE) |
| **uc_ids** | `UC-BP-CORE-09b` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01` **Option A LOCKED** · peer QC Wave-13 **`CORE09AQC1-MSLA4LX9`** · QA `CORE09AQA-MSLA1C9L` |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09b** · Diễn biến **#1–#5** · **BR-CTR-CL-02** · **BR-CTR-CL-04** · **AC-CTR-PRINT-01..03 · 06..08** · peers **09a must_keep** · **09c / 09d OUT invent** |
| **ref_spec** | `PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` **E.2** |
| **ref_api_paper** | **F-CORE-CTR-PACK-01** · **F-CORE-CTR-PREV-01** RETAIN · **F-CORE-CTR-CL-01..04** must_keep · peers **F-CORE-CTR-VER/PDF/TPL** **OUT invent** as DONE |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **`C-SLICE-≠-MODULE`** · DENY flip · **DENY** claim CORE-09a = printable DONE · **DENY** claim CORE-08 = CORE pillar DONE |
| **Cấm** | Nest `/core` dual pack/preview SoT · FE hardcode legal body · invent 09c VER/PDF persist · invent 09d TPL catalog as this WI DONE · claim CORE-09a=printable DONE · claim printable UAT · reopen sealed J-HRM-CORE-09A-01..04 / J-CORE-08/02/01 / REC without regression · seed · honesty flip · apps/** |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-14 seat #16:

1. **UC-BP-CORE-09b** — (1) mở HĐ nháp/tạo → gợi ý gói nghề; (2) chọn/đổi gói MVP + xem trước văn bản HĐLĐ; (3) merge field + điều khoản ACTIVE theo gói (consume CORE-09a); (4) C&B mask khi thiếu quyền; (5) thiếu bắt buộc → `can_issue=false` + liệt kê; (6) đổi IT↔DRIVER đổi nhóm ĐK; (7) sổ đăng ký CRUD F5 **không** bị phá; (8) preview **ephemeral** — **không** INSERT print version.
2. **Option A** — ACCEPT_AS_IS_RETAIN trên LIVE **`GET …/pack-resolve`** + **`POST …/contracts/:id/preview`**; paper `/core/…` = **alias only**.
3. **Không** claim module CORE/CTR UAT / flip `contracts_printable_ready`; **không** reopen J-HRM-CORE-09A/08/02/01; **không** coi CORE-09a GWC = printable DONE; **không** invent 09c/09d engine as this WI DONE.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS (đủ quyền HĐ) | Mở HĐ · chọn/đổi gói · xem trước · sửa registry |
| C&B | Xem lương/MST trên preview khi `can_view_cb` |
| Non-C&B HCNS | Preview với `cb_masked` — không lộ lương/MST/phụ cấp |
| Group CEO | Scope rollup `main` — U19 pack-resolve = contract get = preview |
| Member CEO / HRBP | Chỉ pháp nhân / membership · cùng `resolveHrmListScope` |
| Hệ thống (Nest) | Pack suggest · ephemeral merge · mandatory gate · C&B ACL · **không** Nest `/core` dual · **không** VER INSERT |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-CTR-PRINT deepen · AC-CORE-09B-* · VAL-CORE-PREV-* · Diễn biến FE U65 · J-HRM-CORE-09B-* DRAFT | Impl `apps/**` / migration / seed |
| Physical pack-resolve + preview on `/contracts-insurance/contracts*` | Greenfield Nest `/core/…/preview` SoT |
| Pack MVP GENERAL · IT_OFFICE · DRIVER · LOGISTICS optional | Invent 09c VER/PDF persist · 09d TPL catalog DONE |
| C&B mask · mandatory/`can_issue` · pack switch clause diff · registry must_keep | DOCX · DnD layout reorder |
| Honesty footer · C-SLICE · CORE-09a ≠ printable DONE · printable false | Flip `contracts_printable_ready` / recruitment / jd / Phase1 DONE |
| | Reopen sealed J-CORE-09A / J-CORE-08 / J-CORE-02 / J-CORE-01 / REC rewrite |
| | ATT · CORE-02b · PAY |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — HĐ preview spine Network **chỉ** physical **`GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=`** + **`POST /api/hrm/contracts-insurance/contracts/:id/preview`** · paper `/api/hrm/core/…` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second pack/preview SoT |
| **O2** | Pack matrix | **YES** — MVP packs **`GENERAL` · `IT_OFFICE` · `DRIVER`** (labels VI: Chung · IT/văn phòng · Lái xe); **`LOGISTICS`** optional / **not** mandatory GĐ1 AC; suggestion from job_family / `hrm_contract_pack_rules` → `suggested_pack` · `allowed_packs[]` · `reason`; HCNS **may override** before issue |
| **O3** | Preview vs issue | **YES** — Preview **ephemeral** — **no** INSERT `hrm_contract_print_versions` issued row; response has sections/clauses/merged_fields/`can_issue`/`missing_*`/`cb_masked`; **`can_issue`** gates peer **09c** save/PDF — **DENY** invent 09c as this WI DONE |
| **O4** | C&B ACL | **YES** — Non-C&B → `cb_masked=true` (salary · MST · allowance hidden on preview); C&B sees merge — **RETAIN** CORE-02 **`HRM-CORE-CB-403`** · **`HRM-CORE-CB-AUTHZ-403`** — maps **AC-CTR-PRINT-07** |
| **O5** | Mandatory gate | **YES** — Missing Đ.21 field **or** mandatory clause → `can_issue=false` + `missing_fields[]` + `missing_clauses[]` listed on FE; **0** active template → **`HRM-CTR-TPL-NONE`** / CTA config — **AC-CTR-PRINT-01/06** · **BR-CTR-CL-02/04** |
| **O6** | Pack switch | **YES** — Switch **`IT_OFFICE` ↔ `DRIVER`** changes clause set (`apply_to_packs` / template pack) **and** pack-specific fields (DRIVER GPLX/plate when configured) — **AC-CTR-PRINT-03** · **FAIL** if same body set for both packs |
| **O7** | Registry must_keep | **YES** — Create/edit/**F5** sổ đăng ký `employee_contracts` (UF-HRM-02 / CORE-09) **PASS** — preview is **ADD overlay only** — **AC-CTR-PRINT-08** |
| **O8** | Peers OUT | **YES** — UC-BP-CORE-**09c** VER/PDF persist · **09d** TPL catalog invent as this WI DONE · DOCX · DnD · ATT · CORE-02b — **peer** seats only |
| **O9** | must_keep CORE-09a / 08 / 02 / 01 | **YES** — RETAIN F-CORE-CTR-CL-01..04 physical `/contract-clauses*` · snapshot freeze · RD `/rewards*`+`/discipline*` + payroll_link · packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · public strip · Nest `/core` DENY · stamps **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-09A-01..04 · J-CORE-08/02/01 **PASS RETAIN** · **DENY** claim CORE-09a = printable DONE · **DENY** CORE-08 = pillar DONE · **DENY** reopen sealed J-* without regression |
| **O10** | Honesty | **YES false** — `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR module UAT **false** · **C-SLICE** · GWC slice ≠ module UAT · **≠** claim CORE-09a = printable DONE |
| **O11** | Display-ready | **YES** — Preview DTO display-ready (pack label VI · clause titles · missing lists VI · `can_issue` · `cb_masked`) — **cấm** FE invent PDF Net / hardcode long legal body |
| **O12** | Journeys | **YES** — DRAFT **`J-HRM-CORE-09B-01..04`** (open+pack suggest · preview text layout · pack switch + C&B mask · mandatory block + Nest `/core` 0 + CORE-09a/08/02/01 regression + registry F5) · U19 Group CEO rollup stated |

**Architecture SoT:** ONE LIVE pack-resolve + PREV SoT on `/contracts-insurance/*` · paper `/core` alias only · clauses from CORE-09a library (no FE hardcode) · preview ephemeral · U19 pack-resolve = contract get = preview · soft-delete doctrine RETAIN · CORE-09a/08/02/01 **must_keep**.

### Primary API surface (BA lock — O1 / O3 / O5)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Pack resolve | **`GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=`** | `/core/…` alias only |
| Merge preview | **`POST /api/hrm/contracts-insurance/contracts/:id/preview`** | alias |
| Pack rules admin | **`GET/PUT …/pack-rules`** (Settings residual) | — |
| Clause library | **RETAIN SEALED** `/contracts-insurance/contract-clauses*` | `/core/…/clauses` alias |
| Registry CRUD | **RETAIN** `/contracts-insurance/contracts*` | — |
| Print version / PDF | Peer **F-CORE-CTR-VER / PDF** | **OUT invent** this seat |
| Template catalog invent DONE | Peer **F-CORE-CTR-TPL** / 09d | **OUT invent DONE** — preview **may** resolve existing active template |
| CORE-08 RD | **RETAIN SEALED** `/employees/:id/rewards*` + `/discipline*` | `/core/reward-discipline` alias |
| CORE-02 C&B | **RETAIN SEALED** compensation-packages* | `/core/…/compensation` alias |
| CORE-01 public | **RETAIN SEALED** `/api/hrm/employees*` | `/core/employees` alias |

**Invariant CORE-PREV-PATH:** Pack/preview Network **MUST** hit `/contracts-insurance/contracts*` · Nest dual `/core` pack/preview SoT = **FAIL O1**.

**Invariant CORE-PREV-EPHEMERAL:** Preview **MUST NOT** INSERT issued print-version row = **PASS O3** · insert = **FAIL O3/O8** (09c invent).

**Invariant CORE-PREV-CONSUME:** Clause bodies from CORE-09a library / template attach — FE hardcode long legal = **FAIL O9 / BR-CTR-CL-03**.

**Invariant CORE-PREV-GATE:** `can_issue=true` with non-empty mandatory missings = **FAIL O5**.

**Invariant CORE-PREV-PACK-DIFF:** IT↔DRIVER same clause body set = **FAIL O6**.

**Invariant CORE-PREV-≠-09A-PRINTABLE:** CORE-09a GWC **≠** printable DONE · claim = **FAIL O9/O10**.

**Invariant CORE-PREV-NEST-DENY:** Nest `/api/hrm/core/**` pack/preview SoT = **FAIL O1**.

**Wire codes (RETAIN — no invent rewrite):** `HRM-CTR-PREV-200` · `HRM-CTR-PACK-200` · `HRM-CTR-TPL-NONE` · `HRM-CTR-PACK-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-TERM-INVALID` · `HRM-CTR-DRIVER-REQUIRED` · `HRM-CTR-UNIT-SCOPE` · `HRM-SCOPE-409` · RETAIN CORE-09a `HRM-CTR-CL-*` · CORE-08/02/01 codes.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-14 · Option A) |
|---|----------------------|---------------------------|
| Pack path | LIVE `GET …/pack-resolve` | **RETAIN SoT** (**O1/O2**) |
| Preview path | LIVE `POST …/preview` | **RETAIN** + U65 FE fidelity (**O1/O3/O11**) |
| Paper `/core/…` | Not Nest SoT | **Alias / DOC-DELTA only** (**O1**) |
| Pack MVP | Enum + LOGISTICS | **LOCK** 3 MVP · LOGISTICS optional (**O2**) |
| C&B mask | `cb_masked` LIVE | **RETAIN** + AC-CTR-PRINT-07 (**O4**) |
| Mandatory gate | `missing_*` · `can_issue` | **RETAIN** + U65 list (**O5**) |
| Pack switch | resolveClausesForPack | **RETAIN** + journey AC (**O6**) |
| Registry | UF-HRM-02 CRUD LIVE | **must_keep** (**O7**) |
| Clause library | CORE-09a SEALED | **must_keep · no reopen rewrite** (**O9**) |
| VER/PDF/TPL | Peer LIVE / stubs | **OUT invent** as DONE (**O8**) |
| Honesty | C-SLICE · printable false | **false** (**O10**) |
| Schema | LIVE pack_rules · templates · clauses · contracts | **ba-data HOLD** |

### 1.1 ba-data disposition

| Decision | Rule |
|----------|------|
| **HOLD default** | Tables LIVE: `hrm_contract_pack_rules` · templates · clauses · contracts · keyword/registry — **no** ADD schema this seat |
| Conditional UNLOCK | **Only if** BA/QA proves physical column gap for preview display fields — **this seat: gap NOT proven** → **HOLD** |
| DENY | Nest `/core` table invent · mega-EAV · second preview persist store · VER invent as 09b |

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-CTR-CL-02** | Pack missing mandatory clause / Đ.21 field | Block save/print peer + list missing; preview `can_issue=false` | Silent `can_issue=true` = **FAIL O5** |
| **BR-CTR-CL-04** | 0 effective template | Guide config only — no fake printable preview | Fake printable = **FAIL AC-CTR-PRINT-01** |
| **BR-CTR-CL-03** | Preview surfaces | Resolve body from library or snapshot only | FE hardcode long legal = **FAIL O9/O11** |
| **BR-CORE-PREV-PATH** | FR-CORE-09b API | Physical pack-resolve + preview | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-PREV-EPHEMERAL** | Preview call | No VER INSERT | Persist issued = **FAIL O3/O8** |
| **BR-CORE-PREV-PACK** | Suggest + override | Rules → suggested; HCNS override before issue | Locked post-issue invent = peer 09c |
| **BR-CORE-PREV-SWITCH** | IT ↔ DRIVER | Clause set + pack fields change | Same body = **FAIL O6** |
| **BR-CORE-PREV-CB** | Non-C&B role | `cb_masked` hide salary/MST/allowance | Leak = **FAIL O4** |
| **BR-CORE-PREV-REGISTRY** | After preview ADD | Registry create/edit/F5 still works | Break CRUD = **FAIL O7** |
| **BR-CORE-PREV-SCOPE** | pack-resolve = get = preview | `resolveHrmListScope` | Cross-CT leak = **FAIL** U19 |
| **BR-CORE-PREV-≠-09A-PRINT** | CORE-09a GWC | ≠ printable DONE | Claim = **FAIL O9/O10** |
| **BR-CORE-PREV-≠-PILLAR** | CORE-08 GWC | ≠ pillar DONE | Claim = **FAIL O9** |
| **BR-CORE-PREV-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-CORE-PREV-PEER-OUT** | 09c/09d engines | Peer seats | Pull into this WI = **FAIL O8** |
| **BR-CORE-PREV-DISPLAY** | FE bind | BE display-ready | FE invent PDF Net = **FAIL O11** |

### Error taxonomy (BA / QA assert — RETAIN; no invent rewrite)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| **`HRM-CTR-PACK-200`** | 200 | Gợi ý gói thành công | — |
| **`HRM-CTR-PREV-200`** | 200 | Preview merge OK (may still `can_issue=false`) | — |
| **`HRM-CTR-TPL-NONE`** | 4xx | Chưa có mẫu hiệu lực — hướng dẫn cấu hình | Fake printable |
| **`HRM-CTR-PACK-INVALID`** | 400 | Gói không hợp lệ / ngoài allowed | Scope |
| **`HRM-CTR-TPL-PACK-MISMATCH`** | 4xx | Mẫu ≠ gói | — |
| **`HRM-CTR-DRIVER-REQUIRED`** | 400 | Thiếu GPLX/biển số khi gói Lái xe | — |
| **`HRM-CTR-TERM-INVALID`** | 400 | Thời hạn/loại HĐ không hợp lệ | — |
| `HRM-SCOPE-409` / `HRM-CTR-UNIT-SCOPE` | 409 | Ngoài phạm vi pháp nhân | Pack invalid |
| Sealed `HRM-CTR-CL-*` / `HRM-CORE-RD-*` / `HRM-CORE-CB-*` | — | **DENY** rewrite · must_keep regression | — |

---

## 3. UC-BP-CORE-09b — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS right | Pack suggest + preview in rollup | Cross-CT preview without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | pack-resolve/get/preview khác resolver |
| **C&B** | Preview unmasked lương/MST | Mask incorrectly when entitled |
| **Non-C&B HCNS** | Preview `cb_masked` | Leak salary/MST |
| **No HĐ right** | Deny open/preview | Silent 2xx |

**Invariant CORE-PREV-SCOPE:** pack-resolve employee load **=** contract get-by-id **=** preview **same** contracts-insurance / hrm list-scope family.

**Prerequisite:** Employee in scope · draft/active contract · ACTIVE template **or** TPL-NONE path · CORE-09a clauses available for pack · **không** seed · CORE-09a/08/02/01 seals RETAIN · printable flag false.

### 3.1 Happy path (Diễn biến #1–#5 + Thành công) — U65 FE

| AC-ID | SRS / SPEC | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|------------|-------|------|-------------------------------------|----------|
| **AC-CORE-09B-01** | #1 · O1/O2 · PACK-01 | HCNS in scope · NV có hồ sơ | Mở tạo HĐ / mở nháp | Form lõi registry còn; Network **GET** `…/pack-resolve?employee_id=` **200** `HRM-CTR-PACK-200`; FE shows `suggested_pack` + `allowed_packs` (GENERAL/IT_OFFICE/DRIVER); **no** Nest `/api/hrm/core/**` | Browser · U65 · O1/O2 |
| **AC-CORE-09B-02** | #2–#3 · AC-CTR-PRINT-02 · O3/O11 | Có mẫu active + đủ Đ.21 tối thiểu | Chọn gói (hoặc giữ suggest) → **Xem trước** | Network **POST** `…/contracts/:id/preview` **200** `HRM-CTR-PREV-200`; FE text layout: bên A/B · công việc · thời hạn · ≥1 điều khoản; **≠** form registry thuần; **no** print-version INSERT | Browser · L1 no VER row · O3 |
| **AC-CORE-09B-03** | #5 · AC-CTR-PRINT-03 · O6 | Preview on IT_OFFICE | Đổi gói → **DRIVER** → preview lại | Clause set / titles **differs** from IT_OFFICE (pack-specific); DRIVER pack fields (GPLX/plate) appear when configured; Network still physical preview path | Browser · O6 |
| **AC-CORE-09B-04** | AC-CTR-PRINT-07 · O4 | Non-C&B persona | Preview cùng HĐ có C&B data | Response/UI `cb_masked=true`; lương/MST/phụ cấp **hidden**; C&B persona same HĐ sees unmasked | Browser role probe · O4 |
| **AC-CORE-09B-05** | #4 · AC-CTR-PRINT-06 · BR-CTR-CL-02 · O5 | Missing mandatory field **or** mandatory clause | Preview / attempt proceed | `can_issue=false`; FE lists `missing_fields[]` **and/or** `missing_clauses[]` (mã/tiêu đề); **không** silent proceed to save/print peer | Browser · O5 |
| **AC-CORE-09B-06** | AC-CTR-PRINT-01 · BR-CTR-CL-04 · O5 | 0 active template | Open preview path | **`HRM-CTR-TPL-NONE`** (or peer fail-closed) + CTA cấu hình mẫu; **không** fake printable body as issued | Browser · O5 |
| **AC-CORE-09B-07** | AC-CTR-PRINT-08 · O7 | After preview overlay used | Tạo/sửa sổ đăng ký HĐ → **Lưu** → **F5** | Registry CRUD **2xx** + F5 còn; preview **không** replace registry SoT | Browser · O7 · UF-HRM-02 |
| **AC-CORE-09B-08** | O9 · BR-CTR-CL-03 · O11 | Preview with clauses | Inspect Network body / FE source | Clause text resolved from library/template — **no** long hardcoded legal SoT on FE | Browser / lint · O9 |
| **AC-CORE-09B-09** | O9 · O1 · O10 | After preview journeys | Nest `/core` probes + seal smokes | Nest `/api/hrm/core/**` pack/preview **0**; CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public still PASS; **no** claim CORE-09a=printable / CORE-08=pillar / printable ready / 09c·09d DONE | L1 + browser · O9/O10 |

### 3.2 Exception / alternate

| AC-ID | Given | When | Then | Maps |
|-------|-------|------|------|------|
| **EX-CORE-09B-01** | Invalid / OOS pack_code | Preview with bad pack | **400** `HRM-CTR-PACK-INVALID` (or peer) | O2 |
| **EX-CORE-09B-02** | Template ≠ pack | Preview mismatch | **`HRM-CTR-TPL-PACK-MISMATCH`** | O2/O5 |
| **EX-CORE-09B-03** | DRIVER missing GPLX/plate (configured required) | Preview | **`HRM-CTR-DRIVER-REQUIRED`** · `can_issue=false` | O5/O6 |
| **EX-CORE-09B-04** | Outside company scope | pack-resolve / preview other CT | **404/409** scope family | U19 |
| **EX-CORE-09B-05** | Preview claims insert VER | Assert DB/API after preview | **0** new issued print-version | O3 · FAIL if insert |
| **EX-CORE-09B-06** | FE invent Nest `/core` pack/preview | Mutate/Network | **FAIL O1** | O1 |
| **EX-CORE-09B-07** | Seed to create HĐ/clauses for U65 | QA evidence | **FAIL U65** | O10 |
| **EX-CORE-09B-08** | Claim CORE-09a=printable / printable true / 09c·09d DONE | Evidence footer | **FAIL O8/O9/O10** | Honesty |
| **EX-CORE-09B-09** | Reopen rewrite CORE-09a library / sealed J-* | Scope | **FAIL O9** | must_keep |
| **EX-CORE-09B-10** | FE invent PDF download as CORE-09b DONE | Scope | **FAIL O8/O11** | Peer 09c |

### 3.3 SRS AC crosswalk (normative deepen — no wipe)

| SRS / SPEC AC | BA deepen | J-* |
|---------------|-----------|-----|
| **AC-CTR-PRINT-01** | AC-CORE-09B-06 · EX note | J-09B-04 |
| **AC-CTR-PRINT-02** | AC-CORE-09B-02 | J-09B-02 |
| **AC-CTR-PRINT-03** | AC-CORE-09B-03 | J-09B-03 |
| **AC-CTR-PRINT-06** | AC-CORE-09B-05 | J-09B-04 |
| **AC-CTR-PRINT-07** | AC-CORE-09B-04 | J-09B-03 |
| **AC-CTR-PRINT-08** | AC-CORE-09B-07 | J-09B-04 |
| **AC-CTR-PRINT-04/05** | **OUT** invent as 09b DONE — peer **09c** | — |
| SPEC-01 **E.2** #1–#4 (+ SRS #5 pack đổi) | AC-CORE-09B-01..05 | J-09B-01..04 |

### 3.4 VAL matrix (measurable)

| VAL-ID | Rule | Pass | Fail |
|--------|------|------|------|
| **VAL-CORE-PREV-01** | Network path physical contracts-insurance | pack-resolve + preview hit `/contracts-insurance/contracts*` | Nest `/core` hit |
| **VAL-CORE-PREV-02** | Pack suggest 200 | GET pack-resolve → suggested + allowed | Empty mandatory without reason / dual path |
| **VAL-CORE-PREV-03** | Pack MVP labels | GENERAL/IT_OFFICE/DRIVER selectable VI | Closed invent / wipe enum |
| **VAL-CORE-PREV-04** | Preview text layout | A/B · job · term · ≥1 clause | Registry-only form as «preview» |
| **VAL-CORE-PREV-05** | Ephemeral | No VER INSERT after preview | Issued row created |
| **VAL-CORE-PREV-06** | Pack switch diff | IT↔DRIVER clause sets differ | Identical bodies |
| **VAL-CORE-PREV-07** | C&B mask | Non-C&B `cb_masked` | Salary/MST leak |
| **VAL-CORE-PREV-08** | Mandatory gate | missing → `can_issue=false` + list | Silent true |
| **VAL-CORE-PREV-09** | 0 template | TPL-NONE + CTA | Fake printable |
| **VAL-CORE-PREV-10** | Registry F5 | Create/edit/F5 PASS | CRUD broken |
| **VAL-CORE-PREV-11** | Consume library | Body from CORE-09a / template | FE hardcode legal SoT |
| **VAL-CORE-PREV-12** | Nest `/core` 0 | Zero pack/preview SoT calls | Dual controller |
| **VAL-CORE-PREV-13** | CORE-09a must_keep | CL Settings smoke / seal PASS | CL regression / reopen rewrite |
| **VAL-CORE-PREV-14** | CORE-08 must_keep | RD+payroll_link smoke PASS | RD regression |
| **VAL-CORE-PREV-15** | CORE-02 must_keep | packages AuthZ/CB-403 PASS | CB regression |
| **VAL-CORE-PREV-16** | CORE-01 must_keep | public strip PASS | Public leak |
| **VAL-CORE-PREV-17** | Honesty footer | printable/recruitment/jd/CORE UAT false | Flip ready |
| **VAL-CORE-PREV-18** | No seed | FE-only chain | Seed in evidence |
| **VAL-CORE-PREV-19** | Scope parity U19 | pack-resolve=get=preview | Cross-CT |
| **VAL-CORE-PREV-20** | Display-ready | Labels VI + missing lists | FE invent PDF Net |
| **VAL-CORE-PREV-21** | Peer OUT | No 09c/09d DONE claim | Engine invent |
| **VAL-CORE-PREV-22** | ≠ 09a printable | No CORE-09a=printable DONE | False DONE |
| **VAL-CORE-PREV-23** | ≠ pillar | No CORE-08=pillar DONE | False DONE |
| **VAL-CORE-PREV-24** | C-SLICE | Slice GWC ≠ module CTR UAT | Module UAT claim |

---

## 4. Diễn biến FE (U65) — click path normative

```text
Login ceo@xe.vn (HCNS) · U65 zero-seed
 → Nhân sự (/hr) → Hợp đồng / Contracts (registry)
 → [J-01] Mở tạo HĐ hoặc bản nháp (NV in scope)
      → GET …/pack-resolve?employee_id= 200 · thấy gợi ý gói
 → [J-02] Chọn gói (hoặc giữ suggest) → Xem trước
      → POST …/contracts/:id/preview 200
      → UI: bên A/B · công việc · thời hạn · ≥1 ĐK · ≠ form thuần
      → Assert: không tạo print-version issued
 → [J-03] Đổi IT_OFFICE ↔ DRIVER → preview lại · ĐK đổi
      → (persona non-C&B) cb_masked · không lộ lương/MST
 → [J-04] Case thiếu bắt buộc → can_issue=false + list thiếu
      → (optional) 0 template → TPL-NONE + CTA
      → Sửa/tạo sổ đăng ký → Lưu → F5 còn
      → Nest /core 0 · smoke CORE-09a/08/02/01 · no printable flip
```

**cấm:** `pnpm seed:*` · API seed HĐ/clause · DB fake VER · PASS chỉ curl · claim printable UAT · invent PDF as 09b DONE.

---

## 5. Journeys DRAFT (O12) — mint

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CORE-09B-01** | **Open draft + pack suggest** | Login → Hợp đồng → mở nháp/tạo → GET pack-resolve 200 → suggested_pack + allowed_packs VI | AC-CORE-09B-01 · FR-09b #1 · O1/O2 · U65 · ≠ Nest `/core` dual |
| **J-HRM-CORE-09B-02** | **Preview text layout** | Chọn gói → POST preview 200 → A/B · job · term · ≥1 clause · no VER INSERT | AC-CORE-09B-02/08 · AC-CTR-PRINT-02 · O3/O11 · U65 |
| **J-HRM-CORE-09B-03** | **Pack switch + C&B mask** | IT_OFFICE ↔ DRIVER clause diff; non-C&B `cb_masked` | AC-CORE-09B-03/04 · AC-CTR-PRINT-03/07 · O4/O6 · U65 |
| **J-HRM-CORE-09B-04** | **Mandatory block + Nest /core 0 + seals** | missing → `can_issue=false` + list; TPL-NONE path; registry F5; Nest `/core` 0; CORE-09a/08/02/01 smoke; no claim CORE-09a=printable / CORE-08=pillar / printable / 09c·09d DONE | AC-CORE-09B-05/06/07/09 · AC-CTR-PRINT-01/06/08 · O5/O7/O9/O10 · U19 |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-CORE-09A-01..04** | must_keep · stamp **`CORE09AQC1-MSLA4LX9`** · **DENY** reopen rewrite · **≠** printable DONE |
| **J-HRM-CORE-08-01..04** | must_keep · stamp **`CORE08QC1-MSL9BFFE`** · **≠** pillar DONE · note **≠** FR-08 DONE |
| **J-HRM-CORE-02-01..04** | must_keep · stamp **`CORE02QC1-MSL80DU6`** · AuthZ/CB-403 |
| **J-HRM-CORE-01-01..04** | must_keep · stamp **`CORE01QC1-MSL6WMS7`** · public strip |
| Sealed W1–W9 UF/J | must_keep · **không** reopen |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| `contracts_printable_ready` | **false** · **DENY** flip |
| Personnel / CORE / CTR module UAT | **false** |
| Claim CORE-09a clause library = printable DONE | **DENIED** |
| Claim CORE-08 RD = CORE pillar DONE | **DENIED** |
| Claim 09c VER/PDF or 09d TPL = CORE-09b DONE | **DENIED** |
| C-SLICE | GWC CORE-09b slice ≠ module CORE/personnel/CTR UAT ≠ Phase1 DONE ≠ printable ready |
| must_keep W13 | CORE-09a `/contract-clauses*` · snapshot freeze · stamp **`CORE09AQC1-MSLA4LX9`** · J-HRM-CORE-09A-* · **≠** printable DONE |
| must_keep W12 | CORE-08 rewards/discipline + payroll_link · stamp **`CORE08QC1-MSL9BFFE`** · J-HRM-CORE-08-* |
| must_keep W11 | CORE-02 packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · stamp **`CORE02QC1-MSL80DU6`** |
| must_keep W10 | CORE-01 public strip · Nest `/core` DENY · stamp **`CORE01QC1-MSL6WMS7`** |
| must_keep pack+prev | LIVE `GET …/pack-resolve` · `POST …/preview` · `can_issue`/`missing_*`/`cb_masked` · pack_rules · registry CRUD · soft-delete · U19 |
| must_keep W1–W9 | REC seals · HTP-05 · hire soft-link |
| DENY | Nest `/core` dual · FE hardcode body · 09c/09d invent as DONE · claim CORE-09a=printable · claim CORE-08=pillar · printable flip · seed · honesty flip · apps/** · reopen sealed J-CORE-09A/08/02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (tables LIVE · O5 SA) · stamp HOLD CONFIRMED · unlock sa API-01 **only if** wire residual proven · else API RETAIN cite → FE fidelity |
| **ba-data** | **HOLD** (SA default · BA confirms physical gap **not** proven) |
| **sa API-01** | **HOLD** default — F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 **RETAIN cite** · unlock only if BA/QA prove residual wire gap |
| **Dev** | **HOLD** until DATA HOLD stamped + API cite RETAIN (then FE pack+preview U65 residual only) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-ba-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09b
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md · peer CORE-09a SEALED CORE09AQC1-MSLA4LX9
spec_ref: DB pack_rules · templates · clauses · contracts LIVE · F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 · must_keep F-CORE-CTR-CL-01..04 · SA/BA HOLD

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no ADD schema / mega-EAV / second preview-persist store / Nest /core table; RETAIN LIVE hrm_contract_pack_rules + templates + clauses + contracts
2) Cite physical columns already LIVE for pack-resolve + ephemeral preview (no VER invent as 09b)
3) Conditional UNLOCK ONLY if BA/QA proves preview field column gap — default = NOT unlock
4) RETAIN CORE-09a clause body SoT + snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest /core DENY
5) DENY invent 09c VER/PDF · 09d TPL as CORE-09b DONE · claim CORE-09a=printable · contracts_printable_ready · reopen J-HRM-CORE-09A/08/02/01 · seed · honesty flip · apps/**
6) Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API RETAIN or Dev-FE preview fidelity
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-09b against SA Option A: physical `pack-resolve` + `POST …/preview` · pack MVP GENERAL/IT_OFFICE/DRIVER · ephemeral preview (no VER insert) · C&B `cb_masked` · mandatory `can_issue` + missing lists · IT↔DRIVER clause diff · registry must_keep · **ba-data HOLD** · J-HRM-CORE-09B-01..04 DRAFT · must_keep CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · DENY invent 09c VER/PDF · 09d TPL as this WI DONE · claim CORE-09a=printable DONE · `contracts_printable_ready` · reopen sealed J-HRM-CORE-09A/08/02/01 · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (HOLD) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 HOLD stamp · API F.1 RETAIN cite (no invent) · FE pack+preview fidelity residual after contracts · journeys DRAFT until QA · 09c/09d peer seats |
