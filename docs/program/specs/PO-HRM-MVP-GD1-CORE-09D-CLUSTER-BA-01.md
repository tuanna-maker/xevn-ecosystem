# BA AC pack — Wave-16 CORE cluster · UC-BP-CORE-09d (Catalog mẫu HĐ mở · loại × khối · clause bind)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-16 seat **#18**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (tables LIVE `hrm_contract_templates` + `hrm_contract_template_clauses`) · sa API-01 **HOLD** unless residual wire gap proven |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR-CORE-09d · **no** reopen W15 CORE-09c / W14 CORE-09b / W13 CORE-09a / W12 CORE-08 / W11 CORE-02 / W10 CORE-01 / W1–W9 REC · **no** invent Nest `/core` dual · **no** reinstate closed enum / «reject 9th» · **no** claim CORE-09c VER/PDF = printable UAT · **no** invent printable DONE) |
| **uc_ids** | `UC-BP-CORE-09d` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01` **Option A LOCKED** · peer QC Wave-15 **`CORE09CQC1-MSLBXMUT`** · QA `CORE09CQA-MSLBR3YX` · must_keep Wave-14 **`CORE09BQC1-MSLB05DZ`** |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09d** · Diễn biến **#1–#11** · **AC-CTR-XEVN-01..11** · **AC-PLT-CTR-01..06** · **AC-PLT-CTR-TPL-01..07+H** · **BR-CTR-TPL-01..07** · **BR-CTR-TPL-DYN-01..04** · **CORR-01** · **DYNAMIC-LOCK** · peers CORE-09c / 09b / 09a **must_keep** |
| **ref_corr** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md` · `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md` |
| **ref_api_paper** | **F-CORE-CTR-TPL-01** · **F-CORE-CTR-TPL-02** (+ `PUT …/clauses`) · **F-CORE-CTR-CFG-01** RETAIN · **must_keep** **F-CORE-CTR-VER-01/02** · **F-CORE-CTR-PDF-01** · **F-CORE-CTR-PACK-01** · **F-CORE-CTR-PREV-01** ephemeral · **F-CORE-CTR-CL-01..04** |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **`C-SLICE-≠-MODULE`** · DENY flip · **DENY** claim CORE-09c VER/PDF = printable DONE · **DENY** invent printable DONE · **DENY** claim closed-8 TPL DONE |
| **OBS disposition** | **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** → **IN-SCOPE** this seat (TPL `clause_ids` junction bind) — **AC-CORE-09D-OBS-01** · **DENY** seed · **DENY** invent closed-8 as “fix” · **DENY** claim OBS close = printable DONE |
| **Cấm** | Nest `/core` dual TPL SoT · closed enum / `CHK code IN (8)` / API·FE «reject 9th» · claim CORE-09c VER/PDF = printable UAT · invent printable DONE · claim closed-8 TPL DONE · flip `contracts_printable_ready` · reopen sealed J-HRM-CORE-09C/09B/09A/08/02/01 without regression · seed · honesty flip · apps/** · DnD/DOCX as this FR DONE |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-16 seat #18:

1. **UC-BP-CORE-09d** — (1) picker = **catalog mở** (starter 8 = ví dụ · **không** trần); (2) Settings **Tạo mẫu 9+** → F5 → picker HĐ → PREV; (3) matrix loại×khối (OFFICE vs DRIVER · 12M vs 24M · thử việc vs HĐLĐ · KXĐ); (4) registry CRUD **không** bắt buộc mẫu; (5) **OBS** bind `clause_ids` qua junction so IT↔DRIVER preview clauses **non-empty + distinct** when library has active clauses; (6) Nest `/core` **0**; (7) seals CORE-09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 **must_keep**.
2. **Option A** — ACCEPT_AS_IS_RETAIN trên LIVE **`GET/POST/PATCH …/contract-templates*`** + **`PUT …/:id/clauses`** + **`POST …/activate`**; paper `/core/…` = **alias only**.
3. **Không** claim module CORE/CTR UAT / flip `contracts_printable_ready`; **không** claim CORE-09c = printable DONE; **không** claim closed-8 TPL DONE; **không** reopen J-HRM-CORE-09C/09B/09A/08/02/01.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Quản trị cấu hình / HCNS Settings | Tạo/sửa/activate/retire mẫu · bind `clause_ids` · soft warn starter |
| HCNS (đủ quyền HĐ) | Chọn mẫu trên form HĐ · PREV matrix · registry without template |
| C&B | Consume PREV/VER with ACL (must_keep CORE-09b/09c) — **không** rewrite |
| Group CEO | Scope rollup `main` — U19 list = get = create = put-clauses = picker/PREV |
| Member CEO / HRBP | Chỉ pháp nhân / membership · cùng `resolveHrmListScope` |
| Hệ thống (Nest) | Open catalog · format-only CODE-INVALID · matrix pack neo · junction bind · **không** Nest `/core` dual · **không** closed-8 reject |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-CTR-XEVN-01..11 deepen · AC-PLT-CTR-01/06 · AC-PLT-CTR-TPL-01..07+H · AC-CORE-09D-* · VAL-CORE-TPL-* · Diễn biến FE U65 · J-HRM-CTR-04/07 map + J-HRM-CORE-09D-01..04 DRAFT | Impl `apps/**` / migration / seed |
| Physical GET/POST/PATCH contract-templates* + PUT …/clauses + activate | Greenfield Nest `/core/…/templates` SoT |
| OBS clause_ids bind (junction SoT) · matrix type×pack · Settings 9+ | DnD reorder · DOCX as FR DONE · invent printable UAT |
| CORR-01 / DYNAMIC-LOCK open catalog · CODE-INVALID format-only | Reinstate closed enum / reject 9th |
| Honesty footer · C-SLICE · CORE-09c ≠ printable DONE · closed-8 ≠ DONE | Flip `contracts_printable_ready` / recruitment / jd / Phase1 DONE |
| must_keep CORE-09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 | Reopen sealed J-CORE-09C/09B/09A/08/02/01 rewrite |
| | ATT · CORE-02b · PAY · FR-PLT-01 full platform DONE |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — Settings + HĐ picker Network **chỉ** physical **`GET/POST/PATCH /api/hrm/contracts-insurance/contract-templates*`** · **`GET …/:templateId`** · **`PUT …/:id/clauses`** · **`POST …/:id/activate`** · paper `/api/hrm/core/…` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second TPL SoT |
| **O2** | Open catalog | **YES** — Default list = all **active**; starter 8 `XEVN_*` **may** appear; after AC-11 PASS catalog **>8**; soft warn missing starter **must not** block create — **AC-CTR-XEVN-01** · **AC-PLT-CTR-06** · **BR-CTR-TPL-DYN-01/02** · **DENY** hardcode picker = 8 only |
| **O3** | Create 9+ / CODE-INVALID | **YES** — Accept HR code + pack ∈ configured; **`HRM-CTR-TPL-CODE-INVALID`** = **format/slug only** — **DENY** «not in starter 8»; invent free-text on draft when EFF>0 → **`HRM-CTR-TPL-KEY`** class — **AC-CTR-XEVN-11** · **AC-PLT-CTR-TPL-01/04** · **BR-CTR-TPL-DYN-03** · **BR-PLT-02** |
| **O4** | Matrix type×pack | **YES** — Starter neo `*_OFFICE`↔`IT_OFFICE` · `*_DRIVER`↔`DRIVER`; term/duration/title defaults; OFFICE **no** GPLX · DRIVER **GPLX required** for issue/PDF path — **AC-CTR-XEVN-02..06/09** · **BR-CTR-TPL-03/04** |
| **O5** | OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` | **YES IN-SCOPE** — Settings bind `clause_ids` via **`PUT …/clauses`** (junction **`hrm_contract_template_clauses`** SoT prefer) so IT_OFFICE vs DRIVER preview clause sets **differ and non-empty** when library has **active** clauses; empty **only** if library empty + CTA — **DENY** seed · **DENY** invent closed-8 as fix · **DENY** claim OBS close = printable DONE — **AC-CORE-09D-OBS-01** |
| **O6** | FE after 2xx | **YES** — Settings create 9th → list + **F5 còn** → HĐ picker chọn được → PREV bind pack/title/term → F5 còn `template_code` if attached — **AC-CTR-XEVN-11** · U65 |
| **O7** | Registry must_keep | **YES** — Create/edit/F5 sổ HĐ **without** template still PASS — **AC-CTR-XEVN-08** · **AC-PLT-CTR-TPL-06** |
| **O8** | Peers OUT / must_keep | **YES** — DnD reorder / DOCX **OUT** this FR; CORE-02b / ATT / PAY **OUT**; **must_keep** CORE-09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest DENY — **AC-PLT-CTR-TPL-H** · **DENY** claim CORE-09c = printable UAT |
| **O9** | CORE-09c printable boundary | **YES** — **DENY** claim Wave-15 VER+PDF = printable module UAT · **DENY** invent printable DONE · freeze `template_code` on issued VER still **must_keep** (AC-PLT-CTR-TPL-03) — stamp **`CORE09CQC1-MSLBXMUT`** |
| **O10** | Honesty | **YES false** — `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR module UAT **false** · **C-SLICE** · **DENY** claim closed-8 TPL DONE · printable flag only after named QA/QC printable U65 — **not** auto from this BA |
| **O11** | Display-ready | **YES** — TPL DTO display-ready: `code`/`template_code` · pack label VI · term · duration · `title_print_vi` · `matrix_family` · status · `clause_ids[]` — **cấm** FE invent legal body / closed-8-only picker |
| **O12** | Journeys | **YES** — Map paper **`J-HRM-CTR-04`** · **`J-HRM-CTR-07`** (+ optional **`J-HRM-CTR-05/06`**) · mint aliases **`J-HRM-CORE-09D-01..04`** — picker matrix · Settings 9+ → picker → PREV · OBS clause bind · Nest `/core` 0 · seals regression · U19 Group CEO rollup stated |

**Architecture SoT:** ONE LIVE open TPL SoT on `/contracts-insurance/contract-templates*` · paper `/core` alias only · CORR-01 starter ≠ ceiling · CODE-INVALID format-only · junction bind for OBS · U19 list = get = create = put-clauses · soft-delete doctrine RETAIN · CORE-09c/09b/09a/08/02/01 **must_keep**.

### Primary API surface (BA lock — O1 / O2 / O3 / O5)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List/get templates | **`GET /api/hrm/contracts-insurance/contract-templates`** · **`GET …/:templateId`** | `/core/…` alias only |
| Upsert/activate | **`POST/PATCH …/contract-templates`** · **`POST …/:id/activate`** | alias |
| Bind clauses on TPL | **`PUT …/contract-templates/:id/clauses`** | alias |
| Org suffix CFG | **RETAIN** F-CORE-CTR-CFG-01 when LIVE | alias |
| Pack resolve | **RETAIN SEALED** `GET …/contracts/pack-resolve` | alias |
| Merge preview | **RETAIN SEALED ephemeral** `POST …/contracts/:id/preview` | alias — **DENY** INSERT VER |
| Save print version / PDF | **RETAIN SEALED** print-versions* + pdf | alias — **≠** printable UAT claim |
| Clause library | **RETAIN SEALED** `/contracts-insurance/contract-clauses*` | `/core/…/clauses` alias |
| Registry CRUD | **RETAIN** `/contracts-insurance/contracts*` | — |
| CORE-08 RD | **RETAIN SEALED** `/employees/:id/rewards*` + `/discipline*` | `/core/reward-discipline` alias |
| CORE-02 C&B | **RETAIN SEALED** compensation-packages* | `/core/…/compensation` alias |
| CORE-01 public | **RETAIN SEALED** `/api/hrm/employees*` | `/core/employees` alias |

**Invariant CORE-TPL-PATH:** Settings/picker Network **MUST** hit `/contracts-insurance/contract-templates*` · Nest dual `/core` TPL SoT = **FAIL O1**.

**Invariant CORE-TPL-OPEN:** Picker/list hardcode = starter 8 only · OR API reject 9th as «not in 8» = **FAIL O2/O3**.

**Invariant CORE-TPL-CODE:** `CODE-INVALID` used for «not in starter 8» (not format) = **FAIL O3**.

**Invariant CORE-TPL-OBS:** Active library + IT/DRIVER templates with empty junction after Settings bind path = **FAIL O5** (when library has active clauses).

**Invariant CORE-TPL-≠-09C-PRINTABLE:** Claim CORE-09c VER/PDF = printable module UAT = **FAIL O9/O10**.

**Invariant CORE-TPL-≠-CLOSED8-DONE:** Claim closed-8 TPL DONE / FR-09d DONE solely because starter helpers exist = **FAIL O2/O10**.

**Invariant CORE-TPL-NEST-DENY:** Nest `/api/hrm/core/**` TPL SoT = **FAIL O1**.

**Wire codes (RETAIN — no invent rewrite):** `HRM-CTR-TPL-200/201` · `HRM-CTR-TPL-CODE-INVALID` (format only) · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-TPL-KEY` · `HRM-CTR-TPL-NONE` · `HRM-CTR-TPL-404` · `HRM-CTR-CL-404` · RETAIN PREV/PACK/VER/PDF/CL/CORE-08/02/01 codes · `HRM-CTR-DRIVER-REQUIRED` · `HRM-CTR-ISSUE-BLOCKED` · `HRM-SCOPE-409`.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-16 · Option A) |
|---|----------------------|---------------------------|
| Open catalog | LIVE GET templates · no CHK IN(8) | **RETAIN SoT** + U65 FE catalog fidelity (**O1/O2**) |
| Create 9+ | LIVE POST accepts custom | **RETAIN** + AC-CTR-XEVN-11 U65 (**O3/O6**) |
| CODE-INVALID | format/slug only | **must_keep CORR** (**O3**) |
| Clause bind | PUT …/clauses · junction | **RETAIN** + OBS fidelity (**O5**) |
| Matrix OFFICE/DRIVER | starter neo + PREV consume | **RETAIN** + AC-CTR-XEVN-02..06/09 (**O4**) |
| Paper `/core/…` | Not Nest SoT | **Alias / DOC-DELTA only** (**O1**) |
| VER/PDF | CORE-09c SEALED | **must_keep · ≠ printable UAT** (**O8/O9**) |
| PREV | CORE-09b SEALED ephemeral | **must_keep · no reopen rewrite** (**O8**) |
| CL library | CORE-09a SEALED | **must_keep** (**O8**) |
| Registry | UF-HRM-02 CRUD LIVE | **must_keep** (**O7**) |
| Honesty | C-SLICE · printable false | **false** (**O10**) |
| Schema | LIVE templates + junction | **ba-data HOLD** |

### 1.1 ba-data disposition

| Decision | Rule |
|----------|------|
| **HOLD default** | Tables LIVE: `hrm_contract_templates` + `hrm_contract_template_clauses` (+ XEVN cols / matrix_family / duration / title) — **no** ADD schema this seat |
| Conditional UNLOCK | **Only if** BA/QA proves physical column gap for TPL matrix/bind fields — **this seat: gap NOT proven** → **HOLD** |
| DENY | Nest `/core` table invent · mega-EAV · second TPL store · wipe open catalog · reinstate `CHK code IN (8)` |

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-CTR-TPL-DYN-01** | Catalog | Open — add/edit/retire; no ceiling = starter 8 | Closed enum / reject 9th = **FAIL O2/O3** |
| **BR-CTR-TPL-DYN-02** | Starter 8 | Examples only | Claim closed-8 DONE = **FAIL O10** |
| **BR-CTR-TPL-DYN-03** | Create new code | Format + UQ + pack ∈ configured — **not** «in starter 8» | Reject 9th as not-in-8 = **FAIL O3** |
| **BR-CTR-TPL-DYN-04** | Template pack | Must ∈ configured packs | PACK-MISMATCH = **FAIL** |
| **BR-CTR-TPL-01** | One registry type | May bind many template codes | Print SoT = `template_code` |
| **BR-CTR-TPL-02** | Change template on draft | Recompute pack/label/term defaults | Issued → amend/new VER (must_keep 09c) |
| **BR-CTR-TPL-03** | Indefinite type | No end-date required for issue gate | Force end-date = **FAIL AC-06** |
| **BR-CTR-TPL-04** | OFFICE vs DRIVER | OFFICE no GPLX; DRIVER GPLX required | OFFICE≡DRIVER / issue without GPLX = **FAIL AC-02/03/09** |
| **BR-CTR-TPL-05/06/07** | Org suffix / unit remesh | CFG orgSuffix · scope remesh Bên A | Header leak / lost template after F5 = **FAIL AC-07** |
| **BR-PLT-02** | EFF>0 draft attach | Select from catalog — no free-text SoT | Free-text accepted = **FAIL TPL-04** |
| **BR-PLT-03** | After VER issue | Freeze template_code + frame | Issued drifts = **FAIL TPL-03** (must_keep 09c) |
| **BR-PLT-04** | Soft-retire | Hide from default picker; history OK | Hard-delete history loss = **FAIL TPL-05** |
| **BR-PLT-05** | Soft warn missing starter | Must not block create | Soft warn blocks create = **FAIL AC-06 / TPL-02** |
| **BR-CORE-TPL-PATH** | FR-CORE-09d API | Physical contract-templates* | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-TPL-OBS** | Library has active clauses | Bind junction so IT≠DRIVER clauses non-empty | Empty both after bind = **FAIL O5** |
| **BR-CORE-TPL-REGISTRY** | After TPL overlay | Registry create/edit/F5 without template | Force template always = **FAIL O7** |
| **BR-CORE-TPL-SCOPE** | list = get = create = put-clauses | Same `resolveHrmListScope` family | Cross-CT leak = **FAIL** U19 |
| **BR-CORE-TPL-≠-09C-PRINT** | CORE-09c GWC | ≠ printable DONE | Claim = **FAIL O9/O10** |
| **BR-CORE-TPL-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-CORE-TPL-DISPLAY** | FE bind | BE display-ready TPL + clause_ids | FE invent closed-8-only / legal hardcode = **FAIL O11** |

### Error taxonomy (BA / QA assert — RETAIN; no invent rewrite)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| **`HRM-CTR-TPL-201`** | 201 | Tạo mẫu thành công | — |
| **`HRM-CTR-TPL-200`** | 200 | List/get/patch/activate/put-clauses OK | — |
| **`HRM-CTR-TPL-CODE-INVALID`** | 400 | Mã sai **định dạng/slug** | «Không thuộc tám mã» |
| **`HRM-CTR-TPL-KEY`** | 4xx | Gắn mã không thuộc catalog khi EFF>0 | 404 not-found · TPL-NONE |
| **`HRM-CTR-TPL-NONE`** | 4xx | Catalog trống — CTA cấu hình | Fake preview/issue |
| **`HRM-CTR-TPL-PACK-MISMATCH`** | 4xx | Gói mẫu lệch cấu hình / gói HĐ | — |
| **`HRM-CTR-TPL-404`** | 404 | Không tìm thấy mẫu theo id (scope) | TPL-KEY class |
| **`HRM-CTR-CL-404`** | 404 | clause_id bind không tồn tại / ngoài scope | — |
| **`HRM-CTR-DRIVER-REQUIRED`** | 400 | Thiếu GPLX (DRIVER) — issue/PDF path | — |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | — |
| Sealed `HRM-CTR-PREV-200` / `HRM-CTR-VER-*` / `HRM-CTR-CL-*` / `HRM-CORE-*` | — | **DENY** rewrite · must_keep regression | — |

---

## 3. UC-BP-CORE-09d — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS/admin right | Open catalog + create 9+ + bind clauses + picker/PREV in rollup | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | list ≠ get ≠ create ≠ put-clauses resolver |
| **No Settings right** | Deny create/bind | Silent 2xx |
| **No HĐ right** | Deny picker mutate / PREV consume as write | Silent 2xx |

**Invariant CORE-TPL-SCOPE:** template list **=** get-by-id **=** create/activate **=** put-clauses **=** picker/PREV consume **same** contracts-insurance / hrm list-scope family as pack-resolve + preview + print-versions.

**Prerequisite:** Employee in scope · draft contract available for picker tests · clause library **may** be empty (CTA) or have active clauses (OBS bind) · **không** seed · CORE-09c/09b/09a/08/02/01 seals RETAIN · printable flag false · CORR-01 open catalog RETAIN.

### 3.1 Happy path (Diễn biến #1–#11 + Thành công) — U65 FE

| AC-ID | SRS / SPEC | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|------------|-------|------|-------------------------------------|----------|
| **AC-CORE-09D-01** | #1 · O1/O2 · XEVN-01 · TPL-01 | Settings/HĐ open | Load picker / GET templates | Network **GET** `…/contract-templates` **200**; list = **open active** catalog (starter may appear; **not** locked to 8); **no** Nest `/api/hrm/core/**` | Browser · L1 · O1/O2 |
| **AC-CORE-09D-02** | #2–#4 · O4 · XEVN-02/03 | Same employee · OFFICE + DRIVER templates available | Chọn `*_FT_12M_OFFICE` rồi `*_FT_12M_DRIVER` → PREV | OFFICE: title HĐLĐ · term label · end date · **no** GPLX block; DRIVER: **has** GPLX/hạng (+ driver clauses if bound) — **distinct** vs OFFICE | Browser · O4 · J-CTR-04/05 |
| **AC-CORE-09D-03** | #2 · O4 · XEVN-04/05/06 | Probation / 12M / 24M / INDEF OFFICE available | Switch templates → PREV | Probation vs 12M: **different** title/type label; 12M vs 24M: default span **12 vs 24**; INDEF: **no** mandatory end-date for issue gate | Browser · O4 · J-CTR-06 |
| **AC-CORE-09D-04** | #8 · O3/O6 · XEVN-11 · PLT-01 · TPL-01 | Settings admin | **Tạo mẫu** mã HR thứ 9+ + pack hợp lệ → Lưu | Network **POST** `…/contract-templates` **201** `HRM-CTR-TPL-201` (**not** reject «not in 8»); list has row → **F5 còn** → HĐ picker **chọn được** → PREV binds pack/title/term | Browser · U65 · O3/O6 |
| **AC-CORE-09D-05** | O2 · XEVN-01 · PLT-06 · TPL-02 | After AC-CORE-09D-04 | Recount catalog | Catalog **>8**; soft warn missing starter (if any) **does not** disable Tạo mẫu | Browser · O2 |
| **AC-CORE-09D-06** | #1/#8 · O7 · XEVN-08 · TPL-06 | Registry form | Tạo/sửa sổ HĐ **without** template → Lưu → **F5** | Registry **2xx** + F5 còn; **no** force-select template | Browser · O7 · UF-HRM-02 |
| **AC-CORE-09D-07** | O5 · OBS | Library has ≥1 active clause · IT + DRIVER templates | Settings bind **distinct** clause sets via **PUT …/clauses** → F5 → PREV IT↔DRIVER | Preview `clauses[]` **non-empty** and **distinct** between IT_OFFICE and DRIVER; Network PUT **200**; junction SoT preferred over empty `layout_json.clause_ids` alone | Browser · L1 · O5 · **closes OBS when PASS** |
| **AC-CORE-09D-08** | #10 · O8/O9 · TPL-03 | Issued VER with `template_code` (must_keep 09c) | Edit template metadata after issue → reload issued VER | Issued VER keeps frozen `template_code` + frame; draft PREV follows current template — **≠** claim printable module UAT | Browser · must_keep 09c |
| **AC-CORE-09D-09** | O8/O9/O10 · O1 | After TPL journeys | Nest `/core` probes + seal smokes | Nest `/api/hrm/core/**` TPL **0**; CORE-09c VER/PDF · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public still PASS; **no** claim CORE-09c=printable / closed-8 DONE / printable ready / module CTR UAT | L1 + browser · O8/O9/O10 |

### 3.2 Exception / alternate

| AC-ID | Given | When | Then | Maps |
|-------|-------|------|------|------|
| **EX-CORE-09D-01** | Bad slug/format code | POST create | **400** `HRM-CTR-TPL-CODE-INVALID` — **not** «not in starter 8» | O3 |
| **EX-CORE-09D-02** | EFF>0 · free-text invent on draft attach | Attach invent code | **`HRM-CTR-TPL-KEY`** class — ≠ 404 · ≠ TPL-NONE · no silent coerce to starter | O3 · TPL-04 · BR-PLT-02 |
| **EX-CORE-09D-03** | 0 active templates | Picker / issue path | **`HRM-CTR-TPL-NONE`** + CTA — **no** fake preview/issue | O2 · XEVN / PRINT-01 pointer |
| **EX-CORE-09D-04** | Pack ∉ configured | Create/update template | **`HRM-CTR-TPL-PACK-MISMATCH`** (or equivalent) | O3 · DYN-04 |
| **EX-CORE-09D-05** | DRIVER template · missing GPLX | Issue/PDF (must_keep 09c path) | **`HRM-CTR-DRIVER-REQUIRED`** / ISSUE-BLOCKED + list — **no** issued | O4 · XEVN-09 |
| **EX-CORE-09D-06** | Soft-retire template | Hide from default picker | History/issued VER still readable; F5 keeps retired status | TPL-05 · BR-PLT-04 |
| **EX-CORE-09D-07** | Outside company scope | GET/POST/PUT other CT | **404/409** scope family | U19 · TPL-07 |
| **EX-CORE-09D-08** | FE invent Nest `/core` TPL | Mutate/Network | **FAIL O1** | O1 |
| **EX-CORE-09D-09** | Seed to fill templates/clause_ids for U65 | QA evidence | **FAIL U65** | O5/O10 |
| **EX-CORE-09D-10** | Claim CORE-09c=printable / printable true / closed-8 DONE | Evidence footer | **FAIL O9/O10** | Honesty |
| **EX-CORE-09D-11** | Reopen rewrite VER/PDF · PREV→INSERT · CL · sealed J-* | Scope | **FAIL O8/O9** | must_keep |
| **EX-CORE-09D-12** | Library empty | PREV clauses empty | Soft empty + CTA **PASS** — **not** force seed | O5 alternate |
| **EX-CORE-09D-13** | DnD / DOCX claimed as FR-09d DONE | Scope | **FAIL O8** · OUT | TPL-H |

### 3.3 SRS AC crosswalk (normative deepen — no wipe)

| SRS / PLT AC | BA deepen | J-* |
|--------------|-----------|-----|
| **AC-CTR-XEVN-01** | AC-CORE-09D-01/05 | J-CTR-04 · J-09D-01 |
| **AC-CTR-XEVN-02/03** | AC-CORE-09D-02 · (+ OBS-07) | J-CTR-04/05 · J-09D-01/03 |
| **AC-CTR-XEVN-04/05/06** | AC-CORE-09D-03 | J-CTR-06 · J-09D-01 |
| **AC-CTR-XEVN-07** | CFG remesh residual (F-CORE-CTR-CFG-01) — cite when LIVE | optional smoke · O4/CFG |
| **AC-CTR-XEVN-08** | AC-CORE-09D-06 | J-09D-04 · J-CTR-07 companion |
| **AC-CTR-XEVN-09** | EX-CORE-09D-05 | J-CTR-05 |
| **AC-CTR-XEVN-10** | must_keep CORR — no auto-duplicate alias starter | L1 / regression |
| **AC-CTR-XEVN-11** / **AC-PLT-CTR-01** | AC-CORE-09D-04/05 | **J-CTR-07** · J-09D-02 |
| **AC-PLT-CTR-06** / **TPL-02** | AC-CORE-09D-05 | J-09D-02 |
| **AC-PLT-CTR-TPL-03** / **04** | AC-CORE-09D-08 · EX-02 | J-09D-04 · must_keep 09c |
| **AC-PLT-CTR-TPL-05** | EX-06 | soft-retire |
| **AC-PLT-CTR-TPL-06** | AC-CORE-09D-06 | J-09D-04 |
| **AC-PLT-CTR-TPL-07** | EX-07 · U19 | all J-* |
| **AC-PLT-CTR-TPL-H** | AC-CORE-09D-09 · O10 | honesty footer |
| **AC-PLT-CTR-02** | **must_keep CORE-09a** (clause body) — not re-prove as 09d DONE | sealed J-09A |
| **AC-PLT-CTR-03** | **OUT** DnD this FR | EX-13 |
| **AC-PLT-CTR-04** | must_keep freeze via 09c + TPL-03 | J-09D-04 |
| **AC-PLT-CTR-05** | Peer merge-token (OUT invent as 09d DONE) | sealed PLT QA |
| **OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY** | **AC-CORE-09D-07** / EX-12 | **J-09D-03** |

### 3.4 VAL matrix (measurable)

| VAL-ID | Rule | Pass | Fail |
|--------|------|------|------|
| **VAL-CORE-TPL-01** | Network path physical contracts-insurance | GET/POST/PATCH templates* + PUT clauses hit `/contracts-insurance/*` | Nest `/core` hit |
| **VAL-CORE-TPL-02** | Open catalog | List not locked to 8 | Hardcoded 8-only picker |
| **VAL-CORE-TPL-03** | Create 9th 201 | POST → 201 + F5 + picker | Reject «not in 8» |
| **VAL-CORE-TPL-04** | CODE-INVALID format-only | Bad slug → CODE-INVALID | Used as not-in-8 |
| **VAL-CORE-TPL-05** | Catalog >8 after create | Count >8 | Soft warn blocks create |
| **VAL-CORE-TPL-06** | OFFICE vs DRIVER PREV | Distinct GPLX/clauses | OFFICE≡DRIVER |
| **VAL-CORE-TPL-07** | Term matrix | Probation≠12M title; 12≠24 span; INDEF no end req | Same labels/spans |
| **VAL-CORE-TPL-08** | Registry without TPL | Create/edit/F5 PASS | Force template |
| **VAL-CORE-TPL-09** | OBS clause bind | IT↔DRIVER clauses non-empty+distinct when library active | Both empty after bind |
| **VAL-CORE-TPL-10** | Junction SoT | PUT clauses writes `hrm_contract_template_clauses` | Bind only empty layout_json without junction |
| **VAL-CORE-TPL-11** | Nest `/core` 0 | Zero TPL SoT calls | Dual controller |
| **VAL-CORE-TPL-12** | CORE-09c must_keep | VER/PDF smoke PASS · ≠ printable claim | VER regression / printable claim |
| **VAL-CORE-TPL-13** | CORE-09b must_keep | PACK+PREV ephemeral PASS | PREV rewrite INSERT |
| **VAL-CORE-TPL-14** | CORE-09a must_keep | CL Settings smoke PASS | CL regression |
| **VAL-CORE-TPL-15** | CORE-08 must_keep | RD+payroll_link PASS | RD regression |
| **VAL-CORE-TPL-16** | CORE-02 must_keep | packages AuthZ/CB-403 PASS | CB regression |
| **VAL-CORE-TPL-17** | CORE-01 must_keep | public strip PASS | Public leak |
| **VAL-CORE-TPL-18** | Honesty footer | printable/recruitment/jd/CORE UAT false · closed-8 ≠ DONE | Flip ready / closed-8 DONE |
| **VAL-CORE-TPL-19** | No seed | FE-only chain | Seed in evidence |
| **VAL-CORE-TPL-20** | Scope parity U19 | list=get=create=put-clauses | Cross-CT |
| **VAL-CORE-TPL-21** | Display-ready | code · pack VI · term · title · clause_ids | FE invent Net legal |
| **VAL-CORE-TPL-22** | TPL-KEY ≠ 404 ≠ NONE | Invent attach → KEY class | Silent coerce / wrong class |
| **VAL-CORE-TPL-23** | C-SLICE | Slice GWC ≠ module CTR UAT | Module UAT claim |
| **VAL-CORE-TPL-24** | Freeze on issued | Edit template ≠ change issued VER template_code | Issued drifts |

---

## 4. Diễn biến FE (U65) — click path normative

```text
Login ceo@xe.vn (HCNS / Settings) · U65 zero-seed
 → Nhân sự (/hr) → Cài đặt → tab Hợp đồng / contract-legal (re-goto tab after bare F5 if needed)
 → [J-02 / CTR-07] Tạo mẫu thứ 9+ (mã HR + gói IT_OFFICE hoặc DRIVER)
      → POST …/contract-templates 201 HRM-CTR-TPL-201
      → list có row → F5 còn
 → (OBS / J-03) Gắn clause_ids khác nhau cho mẫu IT vs DRIVER
      → PUT …/contract-templates/:id/clauses 200
      → F5 còn bind
 → Hợp đồng / Contracts (registry)
 → [J-04] Tạo/sửa sổ **không** chọn mẫu → Lưu → F5 còn
 → Mở HĐ nháp · picker catalog mở
 → [J-01 / CTR-04] Chọn OFFICE 12M → PREV (no GPLX) → chọn DRIVER 12M → PREV (GPLX + clauses distinct if bound)
 → (optional CTR-06) Probation vs 12M vs 24M vs INDEF — title/term diffs
 → Nest /core 0 · seals CORE-09c/09b/09a/08/02/01 · no printable / closed-8 DONE claim
```

**cấm:** `pnpm seed:*` · API seed templates/clauses · DB fake junction · PASS chỉ curl · claim printable UAT · claim CORE-09c=printable · claim closed-8 DONE · Nest `/core` dual · reopen sealed J-*.

---

## 5. Journeys DRAFT (O12) — mint / map

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CTR-04** *(paper · mapped)* | **Chọn mẫu catalog mở → PREV khác nhau** | Login → Hợp đồng → chọn starter/HR template → PREV matrix (OFFICE/DRIVER · term families) | AC-CTR-XEVN-01..06 · AC-CORE-09D-01..03 · O1/O2/O4 · U65 · ≠ Nest `/core` · ≠ printable UAT |
| **J-HRM-CTR-05** *(paper · mapped optional)* | **OFFICE vs DRIVER GPLX** | Same NV: `*_OFFICE` vs `*_DRIVER` → PREV GPLX + driver clauses | AC-CTR-XEVN-02/03/09 · EX-05 · O4 |
| **J-HRM-CTR-06** *(paper · mapped optional)* | **HĐTV vs 12T vs 24T vs KXĐ** | Switch family → title/term/end-date rules | AC-CTR-XEVN-04/05/06 · O4 |
| **J-HRM-CTR-07** *(paper · mapped)* | **Settings tạo mẫu 9+ → picker → PREV** | Settings → Tạo mẫu → 2xx + F5 → HĐ chọn mã 9 → PREV | AC-CTR-XEVN-11 · AC-PLT-CTR-01 · AC-CORE-09D-04/05 · O3/O6 · U65 |
| **J-HRM-CORE-09D-01** | **Picker matrix OFFICE/DRIVER/term** | Alias deepen of CTR-04 (+05/06 as needed) on LIVE physical APIs | AC-CORE-09D-01..03 · VAL-06/07 · U65 |
| **J-HRM-CORE-09D-02** | **Settings 9+ → F5 → picker → PREV** | Alias deepen of CTR-07 | AC-CORE-09D-04/05 · EX-01 · U65 |
| **J-HRM-CORE-09D-03** | **OBS clause bind IT↔DRIVER** | Settings PUT clauses → PREV IT vs DRIVER non-empty distinct (when library active) · Nest `/core` 0 | AC-CORE-09D-07 · VAL-09/10 · **closes OBS when PASS** · U65 zero-seed |
| **J-HRM-CORE-09D-04** | **Registry without TPL · seals · honesty** | Registry F5 no template; Nest `/core` 0; CORE-09c/09b/09a/08/02/01 smoke; freeze TPL-03; no printable / closed-8 DONE | AC-CORE-09D-06/08/09 · O7/O8/O9/O10 · U19 |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-CORE-09C-01..04** | must_keep · stamp **`CORE09CQC1-MSLBXMUT`** · QA `CORE09CQA-MSLBR3YX` · **DENY** reopen rewrite · VER/PDF **≠** printable module UAT |
| **J-HRM-CORE-09B-01..04** | must_keep · stamp **`CORE09BQC1-MSLB05DZ`** · PREV ephemeral · **≠** printable DONE · OBS **IN-SCOPE here** |
| **J-HRM-CORE-09A-01..04** | must_keep · stamp **`CORE09AQC1-MSLA4LX9`** · **DENY** reopen rewrite · **≠** printable DONE |
| **J-HRM-CORE-08-01..04** | must_keep · stamp **`CORE08QC1-MSL9BFFE`** · **≠** pillar DONE |
| **J-HRM-CORE-02-01..04** | must_keep · stamp **`CORE02QC1-MSL80DU6`** · AuthZ/CB-403 |
| **J-HRM-CORE-01-01..04** | must_keep · stamp **`CORE01QC1-MSL6WMS7`** · public strip |
| Sealed W1–W9 UF/J | must_keep · **không** reopen |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| `contracts_printable_ready` | **false** · **DENY** flip this BA seat |
| Personnel / CORE / CTR module UAT | **false** |
| Claim CORE-09c VER/PDF = printable DONE | **DENIED** |
| Invent printable DONE | **DENIED** |
| Claim closed-8 TPL DONE | **DENIED** |
| OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` | **IN-SCOPE** · close via AC-CORE-09D-07 / J-09D-03 · **≠** printable DONE |
| C-SLICE | GWC CORE-09d slice ≠ module CORE/personnel/CTR UAT ≠ Phase1 DONE ≠ printable ready |
| must_keep W15 | CORE-09c VER/PDF · stamp **`CORE09CQC1-MSLBXMUT`** · J-HRM-CORE-09C-* · **≠** printable UAT |
| must_keep W14 | CORE-09b PACK+PREV ephemeral · stamp **`CORE09BQC1-MSLB05DZ`** · J-HRM-CORE-09B-* |
| must_keep W13 | CORE-09a `/contract-clauses*` · stamp **`CORE09AQC1-MSLA4LX9`** · J-HRM-CORE-09A-* |
| must_keep W12 | CORE-08 rewards/discipline + payroll_link · stamp **`CORE08QC1-MSL9BFFE`** |
| must_keep W11 | CORE-02 packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · stamp **`CORE02QC1-MSL80DU6`** |
| must_keep W10 | CORE-01 public strip · Nest `/core` DENY · stamp **`CORE01QC1-MSL6WMS7`** |
| must_keep TPL | LIVE `…/contract-templates*` open catalog · `PUT …/clauses` · activate · CORR-01 / DYNAMIC-LOCK · CODE-INVALID format-only · registry nullable template · soft-delete · U19 |
| must_keep W1–W9 | REC seals · HTP-05 · hire soft-link |
| DENY | Nest `/core` dual · closed enum / reject 9th · claim CORE-09c=printable · invent printable DONE · closed-8 DONE · printable flip · seed · honesty flip · apps/** · reopen sealed J-CORE-09C/09B/09A/08/02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (tables LIVE · SA §8) · stamp HOLD CONFIRMED · unlock sa API-01 **only if** wire residual proven · else API RETAIN cite → FE Settings/picker + clause bind fidelity |
| **ba-data** | **HOLD** (SA default · BA confirms physical gap **not** proven) |
| **sa API-01** | **HOLD** default — F-CORE-CTR-TPL-01/02 (+ CFG-01) **RETAIN cite** · unlock only if BA/QA prove residual wire gap |
| **Dev** | **HOLD** until DATA HOLD stamped + API cite RETAIN (then FE Settings/picker + OBS bind U65 residual only · BE HOLD unless residual) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-ba-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09d
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md · peer CORE-09c SEALED CORE09CQC1-MSLBXMUT · must_keep CORE09BQC1-MSLB05DZ
spec_ref: DB hrm_contract_templates + hrm_contract_template_clauses LIVE · CORR-01 open catalog · F-CORE-CTR-TPL-01/02 · F-CORE-CTR-CFG-01 · OBS clause_ids junction · must_keep F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 · F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · SA/BA HOLD

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no ADD schema / mega-EAV / second TPL store / Nest /core table / wipe open catalog / reinstate CHK code IN (8); RETAIN LIVE hrm_contract_templates + hrm_contract_template_clauses
2) Cite physical columns already LIVE for open catalog + matrix (code · pack · duration · title_print_vi · matrix_family · status) + junction clause_ids bind
3) Conditional UNLOCK ONLY if BA/QA proves TPL matrix/bind column gap — default = NOT unlock
4) RETAIN CORE-09c VER/PDF · CORE-09b PACK+PREV ephemeral · CORE-09a clause body SoT · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest /core DENY · CORR-01/DYNAMIC-LOCK
5) DENY closed enum · claim CORE-09c VER/PDF = printable UAT · invent printable DONE · claim closed-8 TPL DONE · contracts_printable_ready · reopen J-HRM-CORE-09C/09B/09A/08/02/01 · seed · honesty flip · apps/**
6) OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY disposition RETAIN junction SoT (no seed)
7) Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-TPL-01/02 (+ CFG-01) — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API RETAIN or Dev-FE Settings/picker + clause bind fidelity
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-09d against SA Option A: physical `GET/POST/PATCH …/contract-templates*` + `PUT …/clauses` · open catalog · Settings 9+ · CODE-INVALID format-only · matrix type×pack · **OBS** `R-QA-CORE-09B-CLAUSE-FP-EMPTY` IN-SCOPE via junction bind · **ba-data HOLD** · map **J-HRM-CTR-04/07** + mint **J-HRM-CORE-09D-01..04** DRAFT · must_keep CORE-09c VER/PDF (**DENY** = printable UAT) · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · Nest `/core` DENY · DENY closed enum / reject 9th · invent printable DONE · claim closed-8 TPL DONE · `contracts_printable_ready` · reopen sealed J-HRM-CORE-09C/09B/09A/08/02/01 · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (HOLD) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 HOLD stamp · API F.1 RETAIN cite (no invent) · FE Settings/picker + OBS bind fidelity after contracts · journeys DRAFT until QA · printable flag HOLD · DnD/DOCX OUT |
