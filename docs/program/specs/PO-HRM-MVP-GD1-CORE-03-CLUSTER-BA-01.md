# BA AC pack — Wave-18 CORE cluster · UC-BP-CORE-03 (Checklist giấy tờ động · DOC/ET/TOK RETAIN + R-PLT-EMP-01)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-18 seat **#20**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data REQUIRED** for checklist-instance physical (§3.5 gap **PROVEN**) · catalog DOC/ET/TOK **RETAIN** · sa API **HOLD** until DATA stamp |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** wipe CORE-02b EMP-CF · **no** Nest `/core` dual · **no** Nest `emp_custom_field` · **no** closed DOC enum · **no** Nest `emp_position` · **no** claim EMP DOC L1 = CORE-03 / personnel DONE · **no** reopen CORE-02b/09d..01) |
| **uc_ids** | `UC-BP-CORE-03` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-SA-01` **Option A LOCKED** · peer QC **`CORE02BQC1-MSLEFQC1`** / `CORE09DQC1-MSLDR8I3` / `CORE09CQC1-MSLBXMUT` / `CORE09BQC1-MSLB05DZ` / `CORE09AQC1-MSLA4LX9` / `CORE08QC1-MSL9BFFE` / `CORE02QC1-MSL80DU6` / `CORE01QC1-MSL6WMS7` · EMP DOC L1 **`EMPPLATQA-MSIZXHIM`** · TOK **`EMPTOKQA-MSJ290VB`** · EMPCF **`EMPCFQA-MSK14LUH`** · EXT **`EMPTOKEXTQA-MSJ57PE1`** · **`R-PLT-EMP-CF-FE-01` P2 HOLD RETAIN** |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-SA-01.md` |
| **ref_emp_doc** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md` — **AC-PLT-EMP-02..06** · **R-PLT-EMP-01** RETAIN |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-03** · Diễn biến **#1–#2 + Thành công** · **Bổ sung cấu hình** · **AC-PLT-EMP-TOK-01..03** · **AC-PLT-EMP-01*** · **AC-PLT-EMP-02..06** · **BR-BP-DOC-01** · **BR-PLT-01/02/04/05** · peers CORE-02b..01 **must_keep** · CORE-04 OCR **OUT** · CORE-07 activate = peer (**≠** this seat DONE) |
| **ref_api_paper** | **F-EMP-CAT-DOC-01/02** · **F-EMP-CAT-ET-01/02** · **F-EMP-CAT-EFF-01** · **F-EMP-TOK-01/02** · residual **F-CORE-CHK-01** · cite **F-CORE-ACT-01** peer · must_keep **F-EMP-CF-*** / **F-EMP-TOK-03** · CTR TPL/VER/PDF/PACK/PREV/CL · CORE-08/02/01 |
| **ref_db** | LIVE `emp_document_type` · `emp_employment_type` · `hrm_merge_tokens` (`emp.doc.*` / `emp.et.*`) · paper **`hrm_document_checklist_item` §3.5** — Nest route/table **ABSENT** (grep 2026-08-09) · position/dept = XBOS settings-catalogs (**DENY** Nest `emp_position`) |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim EMP DOC L1 = CORE-03 / personnel DONE · **DENY** claim CORE-02b = EMPCF / personnel DONE · **DENY** claim CORE-09d printable / closed-8 DONE |
| **Cấm** | Nest `/core` dual · wipe CORE-02b EMP-CF · Nest `emp_custom_field` / mega-EAV · closed DOC enum · Nest `emp_position` · honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01 · claim module UAT |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-18 seat #20 — **gap-only RETAIN** trên spine EMP DOC/ET/TOK đã seal + disposition residual instance:

1. **DOC catalog SoT** = LIVE `emp_document_type` trên **`/api/hrm/employees/document-types*`** — open slug + flags `requiredByDefault` / `requiresExpiry` / `blocksActivation` — **RETAIN** cite `EMPPLATQA-MSIZXHIM`.
2. **ET catalog SoT** = LIVE `emp_employment_type` trên **`/employees/employment-types*`** — open catalog · dual SoT REF∪tenant.
3. **TOK register-on-save** = **F-EMP-TOK-01/02** `emp.doc.*` / `emp.et.*` — **RETAIN smoke** cite `EMPTOKQA-MSJ290VB` · **orthogonal** CORE-02b `custom.emp.*` EXT.
4. **Position / dept** = XBOS settings-catalogs (**AC-PLT-EMP-01***) — **DENY** Nest `emp_position`.
5. **Checklist instances** = residual **`R-PLT-EMP-01` IN-SCOPE** — Nest route/table **ABSENT** (physical gap **PROVEN** vs paper §3.5) → unlock **ba-data REQUIRED** then sa API **F-CORE-CHK-01**.
6. **Mint** `J-HRM-CORE-03-01..05` DRAFT · map **AC-PLT-EMP-02..06** / **AC-PLT-EMP-TOK-*** · **DENY** reopen sealed CORE-02b/09d..01.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS / Settings admin | CREATE / soft-retire DOC/ET trên Cấu hình HRM · flags bắt buộc/tùy chọn |
| HCNS hồ sơ | Mở checklist · xác nhận / yêu cầu nộp lại (khi instance live) |
| Nhân viên | Nộp tệp / trạng thái submitted (khi instance live) |
| Group CEO | Scope rollup `main` — U19 DOC list = assert consumer |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng `resolveHrmListScope` |
| Hệ thống | F-EMP-TOK-01/02 same-TX · assert EFF>0 → `HRM-EMP-DOC-TYPE-UNKNOWN` · **không** Nest `/core` dual · **không** wipe EMP-CF |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map Diễn biến #1–#2 + Bổ sung cấu hình → AC-PLT-EMP-02..05 / TOK / CORE-03 deepen · R-PLT-EMP-01 disposition · J-HRM-CORE-03-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/employees/document-types*` · `/employment-types*` · (residual) `/employees/:id/document-checklist*` | Nest `/core/…` SoT · Nest `emp_position` · Nest `emp_custom_field` |
| Catalog RETAIN + instance residual AC | Claim catalog L1 alone = full FR-03 Diễn biến DONE |
| Honesty footer · C-SLICE · EMP DOC L1 ≠ CORE-03 DONE · CORE-02b ≠ personnel · CORE-09d ≠ printable | Flip ready flags · reopen J-CORE-02B/09D..01 |
| must_keep CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 | Claim CORE-07 activate DONE · CORE-04 OCR · closed-8 / printable DONE |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path DOC/ET | **YES** — Settings DOC/ET Network **chỉ** physical **`GET/POST/PUT/PATCH …/api/hrm/employees/document-types*`** · **`…/employment-types*`** (+ `/effective` · `…/:id/retire`) · paper `/api/hrm/core/…` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second DOC/checklist SoT |
| **O2** | Required / optional | **YES** — Catalog flags **`requiredByDefault`** / **`blocksActivation`** / **`requiresExpiry`** = SoT defaults cho dòng checklist mới — **DENY** FE hardcode starter set — map FR «Bắt buộc?» → flags + instance `required` — **AC-CORE-03-02** |
| **O3** | Open catalog | **YES** — N+1 slug format-only · **DENY** closed `document_type_key IN (…)` / reject «not in starter» — **AC-PLT-EMP-02** · **BR-PLT-05** · cite `EMPPLATQA-MSIZXHIM` |
| **O4** | Token register | **YES** — Same save DOC/ET → `emp.doc.*` / `emp.et.*` via **F-EMP-TOK-01/02** — **RETAIN smoke** cite **`EMPTOKQA-MSJ290VB`** — **FORBIDDEN** reopen as wipe · **orthogonal** CORE-02b EXT `custom.emp.*` — **AC-PLT-EMP-TOK-01/02** |
| **O5** | Position / dept | **YES** — XBOS settings-catalogs REF only (**AC-PLT-EMP-01***) — **DENY** Nest `emp_position` / free-text SoT — **AC-CORE-03-05** |
| **O6** | Checklist instances | **YES IN-SCOPE residual `R-PLT-EMP-01`** — prefer **`GET/POST/PATCH /api/hrm/employees/:id/document-checklist*`** · statuses `missing\|submitted\|approved` · wire **`assertDocumentTypeInEffectiveCatalog`** when EFF>0 → **`HRM-EMP-DOC-TYPE-UNKNOWN`** · history retired keys OK · **DENY** Nest `/core` dual · **DENY** claim catalog-only = Diễn biến #1–#2 DONE — **physical gap PROVEN** (Nest route+table ABSENT vs paper §3.5) → **ba-data REQUIRED** (not HOLD forever) — **AC-CORE-03-06..08** |
| **O7** | Soft-retire DOC | **YES** — Soft hide picker + soft TOK · history checklist OK — **DENY** hard-delete — **AC-PLT-EMP-03** |
| **O8** | CORE-02b must_keep | **YES** — Four catalogs + invent KEY + soft-draft + TOK-03 + **`R-PLT-EMP-CF-FE-01` P2 HOLD** — **FORBIDDEN** wipe / reopen **J-HRM-CORE-02B-01..04** · cite **`CORE02BQC1-MSLEFQC1`** · EMPCF/EXT — **AC-CORE-03-MK-02B** |
| **O9** | CORE-07 / OCR | **YES OUT invent DONE** — Activate gate = peer **F-CORE-ACT-01** residual · OCR CORE-04 **OUT** — **≠** this seat DONE — map **AC-PLT-EMP-06** as **cite peer only** — **AC-CORE-03-09-OUT** |
| **O10** | Honesty / peers OUT | **YES false** — all ready flags false · C-SLICE · **DENY** flip personnel/printable/recruitment/jd · **DENY** claim EMP DOC L1 = CORE-03/personnel DONE · **DENY** claim CORE-02b = EMPCF/personnel DONE · **DENY** claim CORE-09d printable/closed-8 DONE · **must_keep** CORE-02b..01 · Nest DENY — **AC-CORE-03-H** |
| **O11** | Display-ready | **YES** — DOC DTO: `documentTypeKey` · `nameVi` · `sortOrder` · flags · `status` · `source` · `catalogKind` · optional `token_key` display — FE bind Settings + checklist picker — **cấm** FE invent DOC SoT |
| **O12** | Journeys | **YES** — Mint **`J-HRM-CORE-03-01..05` DRAFT** (Settings DOC N+1 → F5 → TOK emp.doc.* → ET spot · invent unknown KEY when EFF>0 · retire hide · instance submit/confirm when O6 unlocked) · **DENY** reopen sealed J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01 |

**Architecture SoT:** ONE LIVE DOC/ET catalog spine + TOK · paper `/core` alias only · checklist **instance** = residual unlock · U19 DOC list↔get↔mutate↔assert · soft-delete doctrine RETAIN · CORE-02b EMP-CF + CORE-09d..01 **must_keep**.

### Primary API surface (BA lock — O1)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List/get/effective DOC | **`GET /api/hrm/employees/document-types`** · `…/:id` · `…/effective` | `/core/…` alias only |
| CRUD + soft-retire DOC | **`POST/PUT/PATCH …/document-types*`** · **`POST …/:id/retire`** | alias |
| List/get/effective ET | **`GET/POST/PUT/PATCH …/employment-types*`** · retire | alias |
| Token side-effect | **F-EMP-TOK-01/02** same TX in DOC-02 / ET-02 | — |
| Checklist instance (residual) | Prefer **`GET/POST/PATCH /api/hrm/employees/:id/document-checklist*`** | `/core/…/document-checklist` alias only — **DENY** Nest `/core` primary |
| Assert helper | **`assertDocumentTypeInEffectiveCatalog`** (LIVE · wire residual) | — |
| Activate gate | **F-CORE-ACT-01** peer CORE-07 | **OUT invent DONE** |
| Position / dept | XBOS **settings-catalogs** | **DENY** Nest emp_position |
| CORE-02b EMP-CF | **must_keep** `/settings-catalogs*` + employees `custom_fields` | alias |
| CORE-09d TPL+clause | **must_keep** `/contracts-insurance/contract-templates*` | alias |
| CORE-09c VER/PDF | **must_keep** print-versions* / pdf | alias — **≠** printable UAT |
| CORE-09b PREV | **must_keep** pack-resolve + preview **ephemeral** | alias |
| CORE-09a CL | **must_keep** contract-clauses* | alias |
| CORE-08 / 02 / 01 | **must_keep** rewards/discipline · packages · public employees | alias |

**Invariant CORE-03-PATH:** Settings DOC/ET Network **MUST** hit `/employees/document-types*` · `/employment-types*` · Nest dual `/core` DOC/checklist SoT = **FAIL O1**.

**Invariant CORE-03-OPEN:** Closed `document_type_key IN (…)` / reject N+1 starter = **FAIL O3**.

**Invariant CORE-03-≠-L1-DONE:** Claim EMP DOC L1 / TOK seal = CORE-03 / personnel module UAT = **FAIL O10**.

**Invariant CORE-03-≠-02B-DONE:** Claim CORE-02b = EMPCF / personnel DONE = **FAIL O10**.

**Invariant CORE-03-≠-09D-PRINTABLE:** Claim CORE-09d = printable / closed-8 DONE = **FAIL O10**.

**Invariant CORE-03-INSTANCE:** Claim catalog-only Settings DOC = Diễn biến #1–#2 DONE without O6 AC disposition = **FAIL O6**.

**Wire codes (RETAIN — no invent rewrite):** `HRM-PLT-CAT-CODE-INVALID` (format) · `HRM-PLT-CAT-CODE-CONFLICT` · **`HRM-EMP-DOC-TYPE-UNKNOWN`** · `HRM-SCOPE-409` · sealed CORE-*/CB-* · **DENY** 2xx invent when EFF>0.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-18 · Option A) |
|---|----------------------|---------------------------|
| DOC catalog | `emp_document_type` · `/document-types*` · flags LIVE | **RETAIN** (**O1/O2/O3**) · cite `EMPPLATQA-MSIZXHIM` |
| ET catalog | `emp_employment_type` · `/employment-types*` | **RETAIN** (**O1/O3**) |
| TOK | F-EMP-TOK-01/02 · `EMPTOKQA-MSJ290VB` | **RETAIN smoke** (**O4**) |
| Position/dept | XBOS settings-catalogs | **RETAIN** · DENY Nest emp_position (**O5**) |
| Soft-retire DOC | retire + archived_at | **RETAIN** (**O7**) |
| Assert helper | LIVE unwired | **RETAIN helper** · **wire residual** (**O6**) |
| Checklist Nest route | **ABSENT** | Prefer `/employees/:id/document-checklist*` residual (**O6**) |
| Checklist table Nest | **ABSENT** (grep `apps/`) | Paper §3.5 · **ba-data REQUIRED** |
| CORE-02b EMP-CF | SEALED `CORE02BQC1-MSLEFQC1` | **must_keep RETAIN** (**O8**) · FE P2 HOLD |
| CORE-09d..01 | SEALED stamps | **must_keep · DENY reopen** (**O10**) |
| CORE-07 / OCR | Peer / OUT | **OUT invent DONE** (**O9**) |
| Nest `/core` | CoreModule = DB only | **DENY** dual (**O1**) |
| Honesty | C-SLICE · personnel/printable false | **false** (**O10**) |

### 1.1 Disposition **R-PLT-EMP-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-PLT-EMP-01` |
| **Scope** | **IN-SCOPE residual** for UC-BP-CORE-03 Diễn biến **#1–#2** (nộp / xác nhận) + BR-PLT-02 assert wire + cite peer ACT (**≠** claim CORE-07 DONE) |
| **OUT of residual** | DOC/ET catalog CRUD · TOK register · open slug · soft-retire catalog — already **RETAIN LIVE** (not reopened as greenfield) · CORE-04 OCR · Nest `/core` dual · wipe EMP-CF |
| **Rationale IN-SCOPE** | SRS Diễn biến #1–#2 + Thành công require instance mutate + đủ bắt buộc → CORE-07; SA O6 + paper **F-CORE-CHK-01** / §3.5; LIVE Nest **no** `document-checklist` controller/service/table (`apps/api/hrm-api` + `apps/` grep **0** matches `document-checklist` / `hrm_document_checklist`) while helper **`assertDocumentTypeInEffectiveCatalog`** exists **unwired** |
| **Physical gap vs §3.5** | **PROVEN** — paper columns (`employee_id` · `document_type_key` text · `required` · `status` missing\|submitted\|approved · `file_ref`) **not** present as Nest ensureSchema SoT |
| **ba-data** | **REQUIRED** (unlock) — stamp ADD Nest physical for `hrm_document_checklist_item` (or proven LIVE alias map) · **DENY** Nest `/core` table dual · **DENY** hard FK GĐ1 · catalog DOC/ET tables **HOLD** (already LIVE) |
| **sa API** | After DATA: **F-CORE-CHK-01** prefer `/employees/:id/document-checklist*` + wire assert — **not** wire-only this seat (table ABSENT ⇒ not wire-only) |
| **ACT / AC-PLT-EMP-06** | **Cite peer** CORE-07 / F-CORE-ACT-01 — **OUT invent DONE** this seat |
| **DENY** | Claim EMP DOC L1 = R-PLT-EMP-01 CLOSED · claim catalog Settings = checklist DONE · seed density for UF |

### 1.2 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| DOC/ET catalog | **HOLD** | LIVE `emp_document_type` / `emp_employment_type` + TOK — **no** schema invent |
| Checklist instance §3.5 | **REQUIRED** | Gap **PROVEN** — ADD Nest physical map (soft-delete · text `document_type_key` · status enum · no closed key CHECK · no hard FK) |
| Position Nest | **DENY** | AC-PLT-EMP-01 XBOS REF |
| EMP-CF / mega-EAV | **DENY** | must_keep CORE-02b |
| Nest `/core` | **DENY** | alias only |

---

## 2. Business rules (normative — SRS + SA + EMP vertical; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-DOC-01** | Checklist theo tenant | Required/optional + nộp/xác nhận | Thiếu bắt buộc → không Hoạt động (peer ACT) |
| **BR-PLT-01** | DOC/ET saved active | Same-TX **F-EMP-TOK-01/02** | `emp.doc.<key>` / `emp.et.<key>` · origin=`emp_catalog` |
| **BR-PLT-02** | EFF DOC >0 | Instance / consumer key ∈ EFF | Invent → **`HRM-EMP-DOC-TYPE-UNKNOWN`** |
| **BR-PLT-04** | Soft-retire DOC | Soft item + matching token | Hide picker; history checklist OK |
| **BR-PLT-05** | Admin CREATE DOC | Open N+1 slug · format only | Closed enum = **FAIL O3** |
| **BR-PLT-06** | ET dual SoT | REF∪tenant effective | Tenant wins on key collision (cite ET) |
| **BR-CORE-03-PATH** | API | Physical `/employees/document-types*` · `/employment-types*` · residual checklist under `/employees/:id/…` | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-03-FLAGS** | Required/optional | Catalog typed flags SoT | FE starter closed list = **FAIL O2** |
| **BR-CORE-03-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-CORE-03-≠-DONE** | EMP DOC L1 / TOK / Settings panel | ≠ CORE-03 / personnel UAT | Claim DONE = **FAIL O10** |
| **BR-CORE-03-INSTANCE** | Diễn biến #1–#2 | Need instance CRUD when residual live | Catalog-only claim = **FAIL O6** |

### Error taxonomy (RETAIN)

| Code | HTTP | UX intent (VI) | ≠ |
|------|------|----------------|--|
| **`HRM-EMP-DOC-TYPE-UNKNOWN`** | 4xx | Mã giấy tờ lạ khi còn catalog hiệu lực | Admin CREATE · soft empty EFF=0 |
| `HRM-PLT-CAT-CODE-INVALID` | 4xx | Mã sai định dạng | Closed-enum synonym |
| `HRM-PLT-CAT-CODE-CONFLICT` | 4xx | Trùng mã đang hiệu lực | Retire |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Invent KEY |
| Sealed CORE-*/CB-* | — | **DENY** rewrite · must_keep regression | — |

---

## 3. Diễn biến + Bổ sung cấu hình → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | CORE-03 deepen | J-* | LIVE Network (cite) |
|------------|-----------|---------|----------------|-----|---------------------|
| **Bổ sung cấu hình** · AC-02 | CRUD DOC mở + flags | **AC-PLT-EMP-02** | **AC-CORE-03-01** · **03-02** | **J-HRM-CORE-03-01** | `POST/PUT/PATCH /api/hrm/employees/document-types*` · `GET …/effective` |
| **Bổ sung** · TOK | Đăng ký trường trộn DOC | **AC-PLT-EMP-TOK-01** | **AC-CORE-03-03** | **J-HRM-CORE-03-02** | same TX DOC-02 → merge-tokens `emp.doc.*` |
| **Bổ sung** · ET | CRUD ET mở | **AC-PLT-EMP-04** | **AC-CORE-03-04** | spot **03-01/02** | `/api/hrm/employees/employment-types*` |
| **Bổ sung** · TOK ET | Token ET | **AC-PLT-EMP-TOK-02** | **AC-CORE-03-03** | **J-HRM-CORE-03-02** | same TX ET → `emp.et.*` |
| **Bổ sung** · position/dept | Picker REF | **AC-PLT-EMP-01*** | **AC-CORE-03-05** | spot | XBOS settings-catalogs — **no** Nest emp_position |
| **Diễn biến #1** | Nộp giấy tờ | **AC-CORE-03-06** (residual) | O6 | **J-HRM-CORE-03-04** | Prefer `…/employees/:id/document-checklist*` (**ABSENT AS-IS**) |
| **Diễn biến #2** | Xác nhận | **AC-CORE-03-07** (residual) | O6 | **J-HRM-CORE-03-04** | PATCH status → approved / re-submit |
| Invent KEY | Mã lạ khi EFF>0 | **AC-CORE-03-08** | O6 · BR-PLT-02 | **J-HRM-CORE-03-03** | assert → **`HRM-EMP-DOC-TYPE-UNKNOWN`** |
| Retire | Ngừng DOC | **AC-PLT-EMP-03** | **AC-CORE-03-07b** | **J-HRM-CORE-03-05** | `POST …/document-types/:id/retire` |
| **Thành công** | Đủ điều kiện CORE-07 | **AC-PLT-EMP-06** **cite peer** | **AC-CORE-03-09-OUT** | seal spot | F-CORE-ACT-01 — **≠** this seat DONE |
| OCR | CORE-04 | — | **OUT** | — | — |
| Honesty | Footer | **AC-CORE-03-H** | O10 | **J-HRM-CORE-03-05** | Nest `/core` **0** |

### 3.1 AC-CORE-03 deepen (ADD cite — không wipe AC-PLT-EMP-*)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-CORE-03-01** | Settings HRM · DOC tab | CREATE loại giấy tờ mã N+ → Lưu | Network **POST** `/api/hrm/employees/document-types` **2xx** → list + **F5 còn**; **no** Nest `/core`; **no** closed enum | U65 · O1/O3 · AC-PLT-EMP-02 · `EMPPLATQA-MSIZXHIM` |
| **AC-CORE-03-02** | Same create | Set `requiredByDefault` / `blocksActivation` / `requiresExpiry` | Flags persist display-ready · FE bind · **≠** hardcode starter | O2 · O11 |
| **AC-CORE-03-03** | Same save DOC/ET | Open merge-tokens EMP | `emp.doc.<key>` / `emp.et.<key>` origin=`emp_catalog` — **RETAIN smoke** cite `EMPTOKQA-MSJ290VB` · **≠** reopen EXT wipe | O4 · AC-PLT-EMP-TOK-01/02 |
| **AC-CORE-03-04** | Settings ET | CREATE loại hình thuê N+ → F5 | **POST** `/employment-types` **2xx** · picker nhận mã mới — cite AC-PLT-EMP-04 | O1/O3 |
| **AC-CORE-03-05** | Employee / org form | Chọn vị trí / phòng ban | SoT = XBOS settings-catalogs · **FAIL** nếu Nest `emp_position` hoặc free-text SoT | O5 · AC-PLT-EMP-01* |
| **AC-CORE-03-06** | Hồ sơ NV · residual unlocked | Nộp mục checklist (file/status → submitted) | Prefer Network **POST/PATCH** `/api/hrm/employees/:id/document-checklist*` **2xx** · FE cập nhật · **F5 còn** · Nest `/core` **0** | O6 · Diễn biến #1 · **BLOCKED until DATA+API** |
| **AC-CORE-03-07** | Mục submitted | HCNS xác nhận / yêu cầu nộp lại | Status → `approved` hoặc back `missing`/`submitted` · đủ/thiếu cập nhật | O6 · Diễn biến #2 · **BLOCKED until DATA+API** |
| **AC-CORE-03-07b** | Active DOC | Soft-retire → picker | Hidden from picker · TOK soft · history checklist OK — **DENY** hard-delete | O7 · AC-PLT-EMP-03 |
| **AC-CORE-03-08** | EFF DOC >0 | Submit invent `document_type_key` | **4xx** **`HRM-EMP-DOC-TYPE-UNKNOWN`** · F5 **không** giữ mã lạ · EFF=0 soft-allow documented | O6 · BR-PLT-02 |
| **AC-CORE-03-09-OUT** | Thiếu bắt buộc / blocks_activation | Activate employee | **Cite** peer F-CORE-ACT-01 / **AC-PLT-EMP-06** — **≠** PASS this WI as CORE-07 DONE · OCR **OUT** | O9 |
| **AC-CORE-03-MK-02B** | Any CORE-03 evidence | Diff EMP-CF Settings | Four catalogs + KEY + soft-draft + EXT + FE P2 HOLD **intact** · **no** reopen J-HRM-CORE-02B-01..04 | O8 · `CORE02BQC1-MSLEFQC1` |
| **AC-CORE-03-H** | Evidence footer | Any seal | personnel/printable/recruitment/jd **false** · C-SLICE · **DENY** EMP DOC L1=CORE-03 DONE · **DENY** CORE-02b=personnel/EMPCF DONE · **DENY** CORE-09d printable/closed-8 · Nest DENY · no reopen J-02B/09D..01 | O10 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS | Create DOC + assert invent across rollup | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | DOC list ≠ assert resolver |
| **No Settings right** | Deny CREATE DOC | Silent 2xx |
| **No HR mutate** | Deny checklist mutate | Silent 2xx |

**Invariant CORE-03-SCOPE:** DOC list/get/mutate/assert **=** same `resolveHrmListScope` family.

**Prerequisite:** EMP DOC/ET L1 + TOK seals RETAIN · CORE-02b EMP-CF RETAIN · CORE-09d..01 stamps RETAIN · **không** seed · honesty flags false.

---

## 4. Diễn biến FE U65 (browser matrix)

```text
Login (ceo@xe.vn / member HCNS)
  → /hr Cài đặt → Loại giấy tờ (emp-document-types)
  → Thêm mã N+ + flags bắt buộc/tùy chọn → Lưu
  → Network POST /api/hrm/employees/document-types 2xx → F5 còn
  → (spot) merge-tokens có emp.doc.<key> · cite EMPTOKQA-MSJ290VB
  → (spot) ET tab employment-types N+ · emp.et.*
  → Soft-retire DOC → picker ẩn
  → Khi residual live: Hồ sơ NV → checklist → nộp → xác nhận
       Network …/employees/:id/document-checklist* 2xx · Nest /core = 0
  → Invent mã lạ khi EFF>0 → 4xx HRM-EMP-DOC-TYPE-UNKNOWN
  → Footer honesty false · no claim EMP DOC L1 = CORE-03/personnel
       · no claim CORE-02b = EMPCF DONE · no claim CORE-09d printable
```

**cấm:** `pnpm seed:*` · API seed DOC density · DB fake checklist · PASS chỉ curl · Nest `/core` dual · wipe EMP-CF · closed enum · Nest emp_position · claim module DONE · reopen sealed J-*.

### VAL pack cite (RETAIN vertical + CORE deepen)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-EMP-DOC-04** | CREATE N+1 2xx + F5 | AC-PLT-EMP-02 · AC-CORE-03-01 |
| **VAL-EMP-DOC-05/06** | Retire soft · hard-delete FORBIDDEN | AC-PLT-EMP-03 · AC-CORE-03-07b |
| **AC-PLT-EMP-TOK-01/02** | Token smoke RETAIN | AC-CORE-03-03 · seal `EMPTOKQA-MSJ290VB` |
| **VAL-EMP-ET-04** | ET N+ | AC-PLT-EMP-04 · AC-CORE-03-04 |
| **VAL-CORE-CHK-*** *(mint after DATA)* | Instance submit/confirm · invent UNKNOWN | AC-CORE-03-06..08 · **HOLD mint until API** |

---

## 5. Journeys DRAFT (O12)

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CORE-03-01** | **Settings DOC CREATE N+1 + flags** | Login → Cài đặt DOC → Thêm mã + flags → POST document-types 2xx → F5 còn · Nest `/core` 0 | AC-CORE-03-01/02 · AC-PLT-EMP-02 · O1/O2/O3 · U65 · map peer EMP DOC L1 |
| **J-HRM-CORE-03-02** | **TOK smoke DOC/ET** | Same save → merge-tokens `emp.doc.*` / `emp.et.*` smoke cite `EMPTOKQA-MSJ290VB` · **≠** reopen EXT suite | AC-CORE-03-03 · AC-PLT-EMP-TOK-01/02 · O4 · U65 |
| **J-HRM-CORE-03-03** | **Invent KEY fail (when EFF>0)** | Consumer/checklist invent unknown key → **4xx** `HRM-EMP-DOC-TYPE-UNKNOWN` → F5 không giữ | AC-CORE-03-08 · O6 · U65 · **may wait residual wire** |
| **J-HRM-CORE-03-04** | **Instance nộp + xác nhận** | Hồ sơ → checklist → nộp → xác nhận · Network prefer `…/document-checklist*` 2xx · F5 · Nest `/core` 0 | AC-CORE-03-06/07 · Diễn biến #1–#2 · O6 · **DRAFT until DATA+API** |
| **J-HRM-CORE-03-05** | **Retire · seals · honesty** | Soft-retire hide · CORE-02b EMP-CF smoke · CORE-09d..01 smoke · no EMP DOC L1=CORE-03 DONE · no CORE-02b=personnel · no CORE-09d printable/closed-8 · OCR/ACT OUT | AC-CORE-03-07b/MK-02B/09-OUT/H · O7–O10 · U19 |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `hrm_personnel_uat_ready`.

| Sealed peer | Rule |
|-------------|------|
| **EMPPLATQA-MSIZXHIM** / EMP DOC L1 | **must_keep RETAIN** · **≠** CORE-03 / personnel DONE |
| **EMPTOKQA-MSJ290VB** / DOC-ET TOK | **must_keep RETAIN smoke** · **DENY** reopen as wipe |
| **EMPCFQA-MSK14LUH** / **EMPTOKEXTQA-MSJ57PE1** | **must_keep** CORE-02b EMP-CF / EXT · **orthogonal** |
| **`R-PLT-EMP-CF-FE-01`** | **P2 HOLD RETAIN** |
| **J-HRM-CORE-02B-01..04** | must_keep · stamp **`CORE02BQC1-MSLEFQC1`** · **DENY** reopen / wipe EMP-CF |
| **J-HRM-CORE-09D-01..04** | must_keep · **`CORE09DQC1-MSLDR8I3`** · **≠** printable / closed-8 DONE |
| **J-HRM-CORE-09C-01..04** | must_keep · **`CORE09CQC1-MSLBXMUT`** · VER/PDF **≠** printable |
| **J-HRM-CORE-09B-01..04** | must_keep · **`CORE09BQC1-MSLB05DZ`** · PREV ephemeral |
| **J-HRM-CORE-09A-01..04** | must_keep · **`CORE09AQC1-MSLA4LX9`** |
| **J-HRM-CORE-08-01..04** | must_keep · **`CORE08QC1-MSL9BFFE`** |
| **J-HRM-CORE-02-01..04** | must_keep · **`CORE02QC1-MSL80DU6`** · AuthZ/CB-403 |
| **J-HRM-CORE-01-01..04** | must_keep · **`CORE01QC1-MSL6WMS7`** · public strip |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim EMP DOC L1 / TOK / Settings DOC = CORE-03 / personnel UAT | **DENIED** |
| Claim CORE-02b = EMPCF / personnel DONE | **DENIED** |
| Claim CORE-09d TPL = printable / closed-8 DONE | **DENIED** |
| Claim CORE-09c = printable DONE | **DENIED** |
| Claim catalog-only = Diễn biến #1–#2 DONE | **DENIED** (O6) |
| Nest `/core` dual · Nest `emp_custom_field` · Nest `emp_position` · closed DOC enum | **DENIED** |
| Wipe CORE-02b EMP-CF / reopen J-02B | **DENIED** |
| CORE-04 OCR / CORE-07 activate DONE this seat | **OUT** |
| C-SLICE | GWC later ≠ module CORE/personnel/CTR UAT ≠ Phase1 |
| must_keep W17 | CORE-02b EMP-CF · **`CORE02BQC1-MSLEFQC1`** · EMPCF/EXT · FE P2 HOLD |
| must_keep W16..W10 | CORE-09d TPL+clause · 09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 stamps |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **REQUIRED** for `hrm_document_checklist_item` Nest physical (§3.5 gap **PROVEN**) · catalog DOC/ET **HOLD** · then sa API **F-CORE-CHK-01** prefer `/employees/:id/document-checklist*` |
| **ba-data** | **REQUIRED** (instance) · **HOLD** (DOC/ET catalog LIVE) |
| **sa API-01** | **HOLD** until DATA stamp — residual **F-CORE-CHK-01** + assert wire · RETAIN cite F-EMP-CAT-* / TOK |
| **Dev** | **HOLD** until DATA + API CONFIRMED · **DENY** Nest `/core` dual · **DENY** wipe EMP-CF · **DENY** closed enum · **DENY** Nest emp_position |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-ba-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-03
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md · SA Option A · R-PLT-EMP-01 IN-SCOPE · physical gap PROVEN (Nest checklist ABSENT) · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1-MSLDR8I3 must_keep
spec_ref: paper DB §3.5 hrm_document_checklist_item · LIVE emp_document_type / emp_employment_type / hrm_merge_tokens RETAIN · F-EMP-CAT-DOC/ET/EFF · F-EMP-TOK-01/02 · residual F-CORE-CHK-01 · Nest /core DENY · Nest emp_position DENY · Nest emp_custom_field DENY

MISSION — Physical DATA lock (docs-only · REQUIRED for instance):
1) CONFIRM ADD Nest physical map for hrm_document_checklist_item per paper §3.5 (employee_id · company_id · document_type_key TEXT open · required · status missing|submitted|approved · file_ref · soft-delete) — DENY hard FK GĐ1 · DENY closed key CHECK · DENY Nest /core table dual
2) HOLD — no invent/change on LIVE emp_document_type / emp_employment_type / emp.doc|et TOK spine (already LIVE)
3) Cite columns display-ready for instance list + required default from catalog flags
4) RETAIN CORE-02b EMP-CF · CORE-09d TPL+clause · CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · Nest /core DENY
5) DENY wipe EMP-CF · Nest emp_custom_field · Nest emp_position · closed DOC enum · claim EMP DOC L1 = CORE-03/personnel DONE · claim CORE-02b = EMPCF/personnel DONE · claim CORE-09d printable/closed-8 DONE · honesty flip · reopen J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01 · seed · apps/**
6) Unlock next: sa API-01 F-CORE-CHK-01 prefer GET/POST/PATCH /api/hrm/employees/:id/document-checklist* + wire assertDocumentTypeInEffectiveCatalog — paper /core alias only

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual CHK
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-03 against SA Option A: physical prefer `/employees/document-types*` · `/employment-types*` · open DOC+flags · ET open · TOK `emp.doc.*`/`emp.et.*` **RETAIN** (`EMPTOKQA-MSJ290VB` · `EMPPLATQA-MSIZXHIM`) · position/dept XBOS REF · **R-PLT-EMP-01 IN-SCOPE** (Nest checklist route/table ABSENT — physical gap **PROVEN** vs §3.5) · soft-retire RETAIN · CORE-02b EMP-CF **must_keep** (`CORE02BQC1-MSLEFQC1` · EMPCF/EXT · FE P2 HOLD) · CORE-07/OCR **OUT invent DONE** · honesty false · display-ready O11 · mint **J-HRM-CORE-03-01..05 DRAFT** · Diễn biến #1–#2 + Bổ sung cấu hình mapped to **AC-PLT-EMP-02..05/TOK** + **AC-CORE-03-*** · Nest `/core` **DENIED** · **ba-data REQUIRED** (instance) · catalog HOLD · DENY wipe EMP-CF · claim EMP DOC L1=CORE-03/personnel DONE · claim CORE-02b=EMPCF/personnel DONE · claim CORE-09d printable/closed-8 · reopen sealed J-02B/09D..01 · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (REQUIRED instance · HOLD catalog) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 ADD §3.5 Nest physical · API F-CORE-CHK-01 + assert wire · J-03-04 DRAFT until live · ACT/CORE-07 peer · personnel/printable flags HOLD |
