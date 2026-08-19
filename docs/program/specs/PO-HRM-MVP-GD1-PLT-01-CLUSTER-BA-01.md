# BA AC pack — Wave-24 PLT cluster · UC-BP-PLT-01 (Nền tảng cấu hình động · catalog · schema · merge · RETAIN LIVE three-layer)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-24 seat **#26**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (LIVE Catalog + FormSchema instances + `hrm_merge_tokens` RETAIN — **no** schema invent · **no** mega-EAV) · sa API residual unlock **only if** BA proves closable wire gap · **DENY** claim peer catalog alone = PLT-01 DONE · **DENY** claim merge-tokens LIVE alone = platform UAT · **DENY** claim catalog/CRUD/LIVE = CORE-10 DONE · **printable false RETAIN** · **PAY/ATT OUT invent DONE** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** mega-EAV / Nest `emp_custom_field` · **no** wipe CORE-10/09/07 · **no** wipe CORE-06 soft≠DONE · **no** wipe CORE-05/03/02b/09d..01 · **no** invent PAY/ATT DONE · **no** invent printable/Word DONE · **no** claim CORE-10/09/07 DONE) |
| **uc_ids** | `UC-BP-PLT-01` · `FR-UC-BP-PLT-01` |
| **depends_on** | `PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01` **Option A LOCKED** · peer QC **`CORE10QC1-MSLP0EJB`** · QA **`CORE10QA1-MSLOTSWO`** · catalog/CRUD/LIVE≠CORE-10 DONE · BH≠CORE-07 · PAY-06 OUT · **≠** CORE-10 DONE · must_keep CORE-09 **`CORE09QC1-MSLNBA89`** (printable **false** · ≠ CORE-09 DONE) · CORE-07 **`CORE07QC1-KZJTSHNT`** (GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE) · soft≠DONE **`CORE06QC1-MSLID363`** · peers CORE-05/03/02b/09d..01 · EMP DOC/ET · TOK · EMP-CF · SI/ATT/PAY/DEC/REC/CTR catalog peers **RETAIN cite** · Nest `/core` DENY · ADR Option **B** |
| **ref_sa** | `PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-09-CLUSTER-BA-01.md` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PLT-01** · Mục đích · Luồng **#1–#5** · Diễn biến **#1–#5 + Thành công** · **BR-PLT-01..06** · AC principle **AC-PLT-SET/CAT/REC/PAY/EMP*/ATT*/CTR*** · peers CORE-09d/02b/03 · REC-00 JD · ATT/PAY OUT invent DONE this seat |
| **ref_api_paper** | **F-PLT-TOK-01..03** · **F-EMP-TOK-*** · **F-EMP-CF-*** · **F-EMP-CAT-*** · **F-SI-CAT-*** · **F-ATT-CAT-*** · **F-PLT-PAY-COMP-*** · **F-REC-CAT-*** · **F-CORE-CTR-TPL/PREV/VER** · settings-catalogs physical · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `hrm_merge_tokens` · `hrm_catalog_extension_items` · domain Nest catalogs (DOC/ET · SI · ATT · PAY · DEC · REC · CTR TPL…) · XBOS sync via catalog-sync / settings-catalogs · Nest `@Controller('core')` **ABSENT** · **DENY** invent Nest `/core` dual · **DENY** mega-EAV |
| **ref_adr** | ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option **B** · Catalog + FormSchema + MergeToken · Nest physical prefer · paper `/core` alias only · U19 scope parity · soft-delete · open catalog BR-PLT-05 · **DENY** mega-EAV |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · ATT/PAY/EMP/REC/CTR/PLT module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim peer catalog alone = PLT-01 DONE · **DENY** claim merge LIVE = platform UAT · **DENY** claim catalog/CRUD/LIVE = CORE-10 DONE · **DENY** claim CORE-10/09/07 DONE · **DENY** invent PAY/ATT/printable/Word DONE |
| **Cấm** | Nest `/core` dual · mega-EAV / Nest `emp_custom_field` · wipe CORE-10/09/07 · wipe CORE-06 soft≠DONE · wipe CORE-05/03/02b/09d..01 · invent PAY/ATT DONE · invent printable/Word DONE · claim peer seals = PLT DONE · claim catalog/CRUD/LIVE = CORE-10 DONE · claim CORE-10/09/07 DONE · honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-24 seat #26 — **gap-only RETAIN** LIVE three-layer platform (ADR Option B):

1. **L1 Catalog** = domain Nest + `settings-catalogs` + `catalog-sync` — admin N+1 OK · consumer KEY when EFF>0 · soft-retire BR-PLT-04 · **≠ PLT-01 DONE** alone · **≠ CORE-10 DONE** alone.
2. **L2 FormSchema** = specialized instances (JD `rec_jd_*` · EMP-CF allow-list groups · CTR clause/canvas) — shared **interfaces** only · **DENY** mega-EAV · `jd_dynamic_done=false` RETAIN.
3. **L3 MergeToken** = physical **`/api/hrm/merge-tokens*`** · SoT `hrm_merge_tokens` · F-PLT-TOK-01..03 · EMP side-effect DOC/ET/CF · resolve order registry>keyword_map · paper `/core` = **alias only**.
4. **Freeze cite** = BR-PLT-03 via CORE-09 VER snapshot — **≠ printable DONE**.
5. **Mint** `J-HRM-PLT-01-01..06` DRAFT spanning L1/L2/L3 — **narrow** · **not** full ATT/PAY module.
6. **must_keep** CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest `/core` DENY.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Quản trị cấu hình / HCNS | Cài đặt catalog / schema / token · Lưu → F5 |
| Consumer phân hệ | Chọn từ EFF catalog · không chữ tự do SoT |
| Group CEO | Scope rollup `main` — U19 list = get = mutate |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| Hệ thống (Nest) | Catalog + FormSchema instances + MergeToken · Nest `/core` **0** |
| CORE-10 / 09 / 07 / PAY / ATT | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-PLT Diễn biến #1–#5 + BR-PLT-01..06 → AC-PLT-* deepen · residuals L1/L2/L3/≠DONE · J-HRM-PLT-01-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/merge-tokens*` + settings-catalogs + domain Nest · paper `/core` alias | Nest `/core/…` platform SoT dual · mega-EAV |
| Explicit ≠ PLT-01 DONE · ≠ catalog/CRUD/LIVE = CORE-10 DONE · ≠ CORE-09/07 DONE · printable false · C-SLICE | Claim peer seal = FR-PLT DONE · invent PAY/ATT/printable/Word |
| Honesty footer · CORE-10/09/07 RETAIN · soft≠CORE-06 DONE | Flip ready flags · reopen sealed J-* · claim CORE-10/09/07 DONE |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Catalog SoT | **YES** — Domain Nest + `settings-catalogs` + `catalog-sync` ONE admin spine — **admin N+1 ≠ consumer invent KEY** when EFF>0 — cite peers EMP/SI/ATT/PAY/DEC/REC/CTR — **≠ PLT-01 DONE** alone — **AC-PLT-01-CAT** · **AC-PLT-CAT-01** |
| **O2** | FormSchema | **YES** — JD + EMP-CF + CTR instances RETAIN — shared interfaces — **DENY** mega-EAV / Nest `emp_custom_field` — schema AC journeys **without** claiming `jd_dynamic_done` — **AC-PLT-01-SCHEMA** · **AC-PLT-REC-01** / **AC-PLT-EMP-CUSTOM-01*** cite |
| **O3** | MergeToken | **YES** — F-PLT-TOK physical **`/api/hrm/merge-tokens*`** ONE SoT · list F5 + register side-effect + resolve-preview — **AC-PLT-01-TOK** · **AC-PLT-EMP-TOK-01..03** · **AC-PLT-CTR-05** cite |
| **O4** | Paper `/core` | **YES** — paper `/api/hrm/core/…` catalog/schema/token = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second SoT — **AC-PLT-01-PATH** |
| **O5** | Freeze BR-PLT-03 | **YES** — Cite CORE-09 VER `merged_fields` snapshot freeze — **≠ printable DONE** · **≠** claim CORE-09 DONE — **AC-PLT-01-FREEZE** |
| **O6** | Soft-retire | **YES** — BR-PLT-04 patterns RETAIN (`archived_at` / status inactive) — **no** hard-delete AC — picker hide · history OK — **AC-PLT-01-RETIRE** |
| **O7** | CORE-10/09/07 | **YES** — must_keep stamps **intact** — **≠** reopen · **≠** claim CORE-10/09/07 DONE · catalog/CRUD/LIVE≠CORE-10 DONE · printable false · GATE/ACT-400/Nest DENY · checklist≠DONE · free PATCH≠DONE — **AC-PLT-01-MK-*** |
| **O8** | PAY/ATT | **YES OUT invent** — AC-PLT-PAY / AC-PLT-ATT-* = **trace-only** · QUEUED seats — **DENY** invent PAY/ATT module DONE — footer every evidence — **AC-PLT-01-PAY-ATT-OUT** |
| **O9** | Honesty | **YES false** — all ready flags false · C-SLICE · **printable false RETAIN** · **DENY** flip personnel/printable/recruitment/jd · **DENY** claim PLT/platform UAT · merge LIVE = UAT · peer seal = PLT DONE — **AC-PLT-01-H** |
| **O10** | Seed | **YES U65** — zero-seed · empty catalog = soft-allow CTA / hướng dẫn Cài đặt · **no** seed fake rows — **AC-PLT-01-NO-SEED** |
| **O11** | Journey mint | **YES** — Mint **`J-HRM-PLT-01-01..06` DRAFT** spanning L1/L2/L3 — **narrow** · **not** full ATT/PAY module · **DENY** reopen sealed J-HRM-CORE-10/09/07/06/05/03/02B/09D..01 |
| **O12** | Closable gap | **YES HOLD** — **ba-data HOLD default** · API RETAIN cite F-PLT-TOK + peers — **only** wire-only if BA/QA proves closable gap — **no** invent tables |

**Architecture SoT:** THREE-LAYER LIVE = Catalog + FormSchema instances + MergeToken (`/merge-tokens*`) · paper `/core` alias only · peer catalog ≠ PLT DONE · merge LIVE ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE · U19 list↔get↔mutate · CORE-10/09/07..01 **must_keep**.

### Primary API surface (BA lock — O3/O4)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| MergeToken list/get | **`GET /api/hrm/merge-tokens*`** | `/core/…/merge*` alias only |
| MergeToken upsert/retire | **`POST/PUT/PATCH /merge-tokens*`** · **`POST …/retire`** | alias |
| Resolve preview | **`POST /merge-tokens/resolve-preview`** | alias |
| Catalog admin | **`/settings-catalogs*`** · domain Nest catalogs · `catalog-sync` | alias — **≠** PLT DONE alone |
| EMP-CF schema | settings-catalogs extension-items | alias — CORE-02b cite · **≠** PLT DONE |
| DOC/ET + TOK side-effect | DOC/ET Nest + F-EMP-TOK | alias — CORE-03 cite |
| CTR freeze peer | `/contracts-insurance*` PREV/VER | must_keep · printable false |
| SI / ATT / PAY catalogs | Domain Nest peers | **OUT invent DONE** · trace-only |
| CORE-10 SI actions | `/employee-insurances*` + actions | must_keep · **≠** CORE-10 DONE |
| CORE-07 activate | `POST /employees/:id/activate` | must_keep · **≠** CORE-07 DONE |

**Invariant PLT-01-PATH:** Platform Network **MUST** hit physical `/merge-tokens*` + settings-catalogs/domain Nest — Nest dual `/core` SoT = **FAIL O4**.

**Invariant PLT-01-≠-CAT-DONE:** Claim any single peer catalog seal = FR-UC-BP-PLT-01 / PLT-01 DONE = **FAIL O1/O9**.

**Invariant PLT-01-≠-TOK-UAT:** Claim merge-tokens LIVE alone = platform / PLT module UAT DONE = **FAIL O3/O9**.

**Invariant PLT-01-≠-CORE10-DONE:** Claim catalog/CRUD/LIVE = CORE-10 DONE from this seat = **FAIL O7**.

**Invariant PLT-01-≠-PRINTABLE:** Claim printable / closed-8 DONE / flip `contracts_printable_ready` = **FAIL O5/O9**.

**Invariant PLT-01-PAY-ATT-OUT:** Invent PAY/ATT DONE / claim AC-PLT-PAY/ATT as this seat DONE = **FAIL O8**.

**Invariant PLT-01-NO-EAV:** Invent mega-EAV / Nest `emp_custom_field` = **FAIL O2**.

**Wire codes (RETAIN — no invent rewrite):** `HRM-PLT-CAT-CODE-INVALID` (format only) · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-PLT-TOKEN-UNKNOWN` · `HRM-PLT-SCHEMA-INVALID` · `HRM-SCOPE-409` · sealed CORE-10/09/07 codes · **DENY** closed enum reject N+1 · **DENY** hard-delete.

---

## Footer — honesty (every section)

> **honesty:** `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · ATT/PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ PLT-01 DONE** · peer catalog ≠ PLT DONE · merge LIVE ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE · ≠ CORE-09/07 DONE · PAY/ATT OUT invent DONE · must_keep CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-24 · Option A) |
|---|----------------------|---------------------------|
| L1 Catalog | Domain Nest + settings-catalogs + sync | **RETAIN cite peers** · admin≠consumer · **≠** PLT DONE (**O1**) |
| Soft-retire | archived_at / inactive | **RETAIN must_keep** (**O6**) |
| L2 FormSchema | JD + EMP-CF + CTR canvas | **RETAIN instances** · DENY mega-EAV (**O2**) |
| L3 MergeToken | `/merge-tokens*` · `hrm_merge_tokens` | **RETAIN must_keep** + U65 (**O3**) |
| EMP TOK side-effect | DOC/ET/CF → F-PLT-TOK-02 | **RETAIN cite** (**O3**) |
| Freeze on issue | CORE-09 VER snapshot | **RETAIN peer cite** · ≠ printable (**O5**) |
| Paper `/core` | Nest `@Controller('core')` ABSENT | **Alias only** (**O4**) |
| CORE-10 SI | SEALED `CORE10QC1-MSLP0EJB` · catalog≠DONE | **must_keep RETAIN** · **≠** claim DONE (**O7**) |
| CORE-09 fill | SEALED `CORE09QC1-MSLNBA89` · printable false | **must_keep RETAIN** · **≠** reopen / claim DONE |
| CORE-07 activate | SEALED `CORE07QC1-KZJTSHNT` | **must_keep RETAIN** · **≠** claim DONE |
| PAY/ATT deepen | QUEUED board #27+ | **OUT invent DONE** (**O8**) |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O9**) |

### 1.1 Disposition **R-PLT-01-L1-CAT**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-PLT-01-L1-CAT` |
| **Scope** | **IN-SCOPE residual fidelity** — U65 admin N+1 · consumer KEY when EFF>0 · AC-PLT-CAT / EMP-* cite · BR-PLT-02/05 |
| **OUT of residual** | Claim any peer catalog seal = PLT-01 DONE · invent PAY/ATT DONE · Nest `/core` dual |
| **Rationale** | FR-PLT Diễn biến #1/#2/#4 · SA O1/O11; LIVE catalogs PRESENT — residual = U65 AC + explicit ≠DONE locks |
| **Physical gap vs paper** | Path **PRESENT** — fidelity / journey residual (not greenfield) |
| **ba-data** | **HOLD** — LIVE domain catalogs + settings-catalogs RETAIN · **no** invent Nest `emp_department` / `emp_position` / second SoT |
| **sa API** | RETAIN cite F-EMP-CAT / F-SI-CAT / F-ATT-CAT / F-PLT-PAY · residual wire **only if** closable gap |
| **DENY** | Claim CAT LIVE = FR-PLT DONE · Nest `/core` dual · closed enum N+1 |

### 1.2 Disposition **R-PLT-01-L2-SCHEMA**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-PLT-01-L2-SCHEMA` |
| **Scope** | **IN-SCOPE residual** — JD / EMP-CF / CTR schema instances · AC-PLT-REC / EMP-CUSTOM cite · Diễn biến #2 |
| **OUT** | Mega-EAV invent · claim `jd_dynamic_done=true` · Nest `emp_custom_field` |
| **Rationale** | ADR Option B FormSchema = specialized UIs + shared interfaces · SA O2 |
| **ba-data** | **HOLD** — RETAIN `rec_jd_*` · `hrm_catalog_extension_items` · CTR clause/layout |
| **DENY** | Mega-EAV · claim schema instance alone = PLT module DONE |

### 1.3 Disposition **R-PLT-01-L3-TOK**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-PLT-01-L3-TOK` |
| **Scope** | **IN-SCOPE residual fidelity** — F-PLT-TOK-01..03 · BR-PLT-01 register · resolve-preview · AC-PLT-EMP-TOK / CTR-05 |
| **OUT** | Claim merge LIVE = platform UAT · invent Nest `/core` merge SoT |
| **Rationale** | FR-PLT Diễn biến #3 · SA O3; LIVE `/merge-tokens` PRESENT |
| **ba-data** | **HOLD** — LIVE `hrm_merge_tokens` RETAIN — **no** invent second registry |
| **sa API** | RETAIN cite F-PLT-TOK-01/02/03 · paper `/core` alias · wire **only if** gap |
| **DENY** | Claim TOK LIVE = PLT/platform UAT · Nest dual |

### 1.4 Disposition **R-PLT-01-FREEZE** / **R-PLT-01-RETIRE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-PLT-01-FREEZE` · `R-PLT-01-RETIRE` |
| **Scope** | **IN-SCOPE residual cite** — BR-PLT-03 freeze via CORE-09 VER · BR-PLT-04 soft-retire |
| **Rule** | Freeze cite ≠ printable DONE · soft-retire ≠ hard-delete |
| **DENY** | Flip `contracts_printable_ready` · hard-delete catalog/token |

### 1.5 Disposition **R-PLT-01-≠-DONE** / **R-PLT-01-PAY-ATT** / **R-PLT-01-HONESTY**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-PLT-01-≠-DONE` · `R-PLT-01-≠-CAT-DONE` · `R-PLT-01-≠-TOK-UAT` · `R-PLT-01-≠-CORE10-DONE` · `R-PLT-01-PAY-ATT-OUT` · `R-PLT-01-HONESTY` · `R-PLT-01-PRINTABLE` |
| **Scope** | **INFO honesty locks** — every evidence footer |
| **Rule** | Peer catalog ≠ PLT DONE · merge LIVE ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE · ≠ CORE-09/07 DONE · PAY/ATT **OUT invent DONE** · all ready flags **false** · printable **false RETAIN** |
| **DENY** | Claim DONE / honesty flip / invent PAY·ATT·printable·Word |

### 1.6 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| `hrm_merge_tokens` | **HOLD** | LIVE RETAIN — **no** greenfield wipe / second registry |
| `hrm_catalog_extension_items` / settings-catalogs | **HOLD** | LIVE RETAIN — EMP-CF cite |
| Domain Nest catalogs (DOC/ET/SI/ATT/PAY/…) | **HOLD · cite peer** | **≠** PLT DONE alone · **DENY wipe** |
| FormSchema instances (JD/CTR) | **HOLD** | **DENY** mega-EAV invent |
| Nest `/core` | **DENY** | alias only |
| CORE-10 / 09 / 07 / 06 / 05 / 03 / 02b | **DENY wipe** | must_keep · printable false · soft≠CORE-06 DONE |
| PAY / ATT deepen tables | **OUT invent DONE** | AC-PLT-PAY/ATT cite only |

**Unlock next:** **ba-data HOLD** stamp → **sa API** RETAIN cite F-PLT-TOK-01..03 — residual wire **ONLY if** closable gap proven.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ PLT-01 DONE** · peer catalog ≠ PLT DONE · merge ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE · ≠ CORE-09/07 DONE · PAY/ATT OUT · Nest `/core` DENY · C-SLICE

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-01** | Lưu trường mở rộng / DOC / ET hiệu lực | Đăng ký / làm mới MergeToken | Token thiếu sau F5 = **FAIL** |
| **BR-PLT-02** | Catalog còn EFF | Consumer chọn từ catalog | Chữ tự do SoT = **FAIL** |
| **BR-PLT-03** | Ban hành / VER / công bố | Đóng băng ảnh chụp | Sửa sau đổi bản đã ban hành = **FAIL** · ≠ printable DONE |
| **BR-PLT-04** | Ngừng dùng | Soft-retire | Hard-delete / mất lịch sử = **FAIL** |
| **BR-PLT-05** | Dòng khởi tạo | N+1 OK | Chặn «chỉ starter» = **FAIL** |
| **BR-PLT-06** | Khung tập đoàn | Sync/publish-pull | Khóa cứng trên màn thay sync = **FAIL** |
| **BR-PLT-01-PATH** | API platform | Physical `/merge-tokens*` + catalogs | Nest `/core` dual = **FAIL O4** |
| **BR-PLT-01-ADMIN≠CNS** | Admin N+1 | Consumer KEY when EFF>0 | Consumer invent KEY = **FAIL O1** |
| **BR-PLT-01-≠-CAT-DONE** | Peer catalog alone | ≠ FR-PLT DONE | Claim DONE = **FAIL O1/O9** |
| **BR-PLT-01-≠-TOK-UAT** | Merge LIVE alone | ≠ platform UAT | Claim DONE = **FAIL O3/O9** |
| **BR-PLT-01-≠-CORE10** | Catalog/CRUD/LIVE | ≠ CORE-10 DONE | Claim DONE = **FAIL O7** |
| **BR-PLT-01-≠-09/07** | CORE-09/07 seals | printable false · GATE/ACT | Claim DONE = **FAIL O7** |
| **BR-PLT-01-PAY-ATT-OUT** | PAY/ATT AC | Peer QUEUED | Invent DONE = **FAIL O8** |
| **BR-PLT-01-NO-EAV** | FormSchema | Interfaces + domain tables | Mega-EAV = **FAIL O2** |
| **BR-PLT-01-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-PLT-01-PRINTABLE** | Honesty | `contracts_printable_ready=false` | Flip = **FAIL O5/O9** |
| **BR-PLT-01-SCOPE** | list = get = mutate | Same scope resolver | Cross-CT leak = **FAIL U19** |

### Error taxonomy (RETAIN + residual assert)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| `HRM-PLT-CAT-CODE-INVALID` | 400 | Mã sai định dạng (format only) | Closed enum «not in starter N» |
| `HRM-PLT-CAT-CODE-CONFLICT` | 409 | Trùng mã active | Silent overwrite |
| `HRM-PLT-TOKEN-UNKNOWN` | 4xx/warn | Token thiếu theo policy | Fake builtin seed rows |
| `HRM-PLT-SCHEMA-INVALID` | 400 | Dual `#x#` / schema invalid GĐ1 | Accept dual syntax |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Soft OK |
| Sealed CORE-10 SI | — | catalog/CRUD/LIVE≠DONE · BH≠CORE-07 | Claim CORE-10 DONE |
| Sealed CORE-09 CTR | — | printable false must_keep | Reopen / flip printable |
| Sealed CORE-07 GATE/ACT | — | GATE 409 · ACT-400 · Nest 0 | Claim CORE-07 DONE |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ PLT-01 DONE** · Nest `/core` DENY · C-SLICE

---

## 3. Diễn biến FR-UC-BP-PLT-01 → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Diễn biến #1** · Luồng #1 | Mở Cài đặt phân hệ | **AC-PLT-01-LOAD** · **AC-PLT-SET-01** cite | **J-HRM-PLT-01-01** | settings-catalogs / domain Nest · Nest `/core` **0** |
| **Diễn biến #2** · Luồng #1–#2 | Thêm / sửa catalog N+1 | **AC-PLT-01-CAT** · **AC-PLT-CAT-01** · BR-PLT-05 | **J-HRM-PLT-01-01** | Admin save 2xx · F5 còn · consumer KEY when EFF>0 |
| **Diễn biến #2** · Luồng #2 | Schema / bố cục lưu | **AC-PLT-01-SCHEMA** · **AC-PLT-REC-01** / EMP-CUSTOM cite | **J-HRM-PLT-01-03** | JD/EMP-CF/CTR instance · **no** mega-EAV · jd_dynamic false |
| **Diễn biến #3** · **BR-PLT-01** | Lưu DOC/ET/CF → token | **AC-PLT-01-TOK-REG** · **AC-PLT-EMP-TOK-01..03** | **J-HRM-PLT-01-05** | F-PLT-TOK-02 upsert · F5 list token |
| **Diễn biến #3/#4** · F-PLT-TOK-01 | List / picker token | **AC-PLT-01-TOK-LIST** · **AC-PLT-CTR-05** cite | **J-HRM-PLT-01-04** | `GET /merge-tokens` · Nest `/core` 0 |
| **Diễn biến #4** · **BR-PLT-02** | Consumer chọn EFF | **AC-PLT-01-CNS** | **J-HRM-PLT-01-01** | Reject free-text SoT when EFF>0 |
| **BR-PLT-04** | Soft-retire | **AC-PLT-01-RETIRE** | **J-HRM-PLT-01-02** | Retire → picker hide · history OK |
| **Diễn biến #5** · **BR-PLT-03** | Freeze VER cite | **AC-PLT-01-FREEZE** | **J-HRM-PLT-01-06** | CORE-09 VER snapshot · ≠ printable |
| **O7–O10** | Seals + ≠DONE | **AC-PLT-01-≠-*** · **H** · **MK-*** | **J-06** | CORE-10/09/07 RETAIN · PAY/ATT OUT |

### 3.1 AC-PLT principle deepen (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PLT-01-PATH** | Platform API call | List/mutate catalog/schema/token | Network hits **only** physical `/merge-tokens*` + settings-catalogs/domain Nest · Nest `/api/hrm/core/**` SoT **0** | U65 · O4 · **R-PLT-01-L3-TOK** |
| **AC-PLT-01-LOAD** | Quyền Cài đặt đúng scope | Mở Settings phân hệ | List cấu hình theo phạm vi · Nest `/core` 0 · no seed | Diễn biến #1 · J-01 |
| **AC-PLT-01-CAT** / **AC-PLT-CAT-01** | Admin catalog | Thêm mã N+1 → Lưu → F5 | 2xx · row còn · consumer picker có mã mới khi EFF · **≠** PLT DONE alone | O1 · BR-PLT-05 · J-01 |
| **AC-PLT-01-CNS** / **BR-PLT-02** | EFF>0 | Consumer lưu mã lạ / chữ tự do SoT | Từ chối KEY · F5 không giữ mã lạ · admin vẫn thêm được | O1 · J-01 |
| **AC-PLT-01-RETIRE** / **BR-PLT-04** | Row active | Soft-retire | Picker ẩn · lịch sử đọc được · **no** hard-delete | O6 · J-02 |
| **AC-PLT-01-SCHEMA** | Schema instance (EMP-CF/JD/CTR) | Lưu bố cục / field → F5 | Còn cấu hình · **no** mega-EAV · `jd_dynamic_done=false` | O2 · J-03 |
| **AC-PLT-01-TOK-LIST** / F-PLT-TOK-01 | Scope OK | GET merge-tokens | 200 · `labelVi`+`tokenKey` display-ready · empty `[]` OK · Nest `/core` 0 | O3 · J-04 |
| **AC-PLT-01-TOK-REG** / **BR-PLT-01** | DOC/ET/CF save active | Lưu → F5 token list | Token tương ứng xuất hiện / refresh · **≠** claim platform UAT | O3 · J-05 |
| **AC-PLT-01-TOK-PREV** / F-PLT-TOK-03 | Preview context | resolve-preview | Registry wins over keyword_map · cite CORE-09 PREV · printable false | O3/O5 |
| **AC-PLT-01-FREEZE** / **BR-PLT-03** | Issued VER | Sửa config sau | Snapshot không đổi · **≠** printable DONE · **≠** CORE-09 DONE | O5 · J-06 |
| **AC-PLT-01-≠-CAT-DONE** | Peer catalog PASS alone | Claim FR-PLT / PLT DONE | **FAIL** — footer **peer catalog ≠ PLT-01 DONE** | O1/O9 |
| **AC-PLT-01-≠-TOK-UAT** | Merge LIVE present without U65 J-* | Claim platform/PLT UAT | **FAIL** — need J-* pack | O3/O9 |
| **AC-PLT-01-≠-CORE10-DONE** | Any PLT evidence | Claim catalog/CRUD/LIVE = CORE-10 DONE | **FAIL** — CORE-10 seal RETAIN ≠ DONE | O7 |
| **AC-PLT-01-≠-09-DONE** | Any PLT evidence | Claim CORE-09 DONE / printable flip | **FAIL** | O7 |
| **AC-PLT-01-≠-07-DONE** | Any PLT evidence | Claim CORE-07 DONE | **FAIL** | O7 |
| **AC-PLT-01-PAY-ATT-OUT** | AC-PLT-PAY / ATT cite | This seat | **OUT invent** — claim PAY/ATT DONE = **FAIL** | O8 |
| **AC-PLT-01-NO-SEED** | Empty catalog | UF evidence | CTA / hướng dẫn · **no** seed | O10 |
| **AC-PLT-01-NO-EAV** | Schema deepen | Design/API | Mega-EAV / Nest emp_custom_field = **FAIL** | O2 |
| **AC-PLT-01-DISP** | Token / catalog render | Show labels | `labelVi` · no raw key as sole label | O3 |
| **AC-PLT-01-MK-10** | Any PLT evidence | Diff CORE-10 | SI LIVE · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT **intact** · **no** reopen J-HRM-CORE-10-01..06 · **≠** claim CORE-10 DONE | O7 · `CORE10QC1-MSLP0EJB` |
| **AC-PLT-01-MK-09** | Any PLT evidence | Diff CORE-09 | Fill+registry · PREV · VER · printable **false** · 09a–d≠DONE · registry≠DONE **intact** · **no** reopen J-HRM-CORE-09-01..06 · **≠** claim CORE-09 DONE · **≠** Word invent | O7 · `CORE09QC1-MSLNBA89` |
| **AC-PLT-01-MK-07** | Any PLT evidence | Diff CORE-07 | Physical activate · GATE **409** · ACT-**400** · Nest `/core` **0** · checklist≠DONE · free PATCH≠DONE **intact** · **no** reopen J-HRM-CORE-07-01..05 · **≠** claim CORE-07 DONE | O7 · `CORE07QC1-KZJTSHNT` |
| **AC-PLT-01-MK-06** | Any PLT evidence | Diff CORE-06 | soft≠DONE · Nest `/core` 0 **intact** · **≠** claim soft=CORE-06 DONE | O7 · soft≠CORE-06 DONE |
| **AC-PLT-01-H** | Evidence footer | Any seal | personnel/printable/recruitment/jd **false** · C-SLICE · **printable false RETAIN** · **DENY** peer catalog=PLT DONE · merge=platform UAT · catalog/CRUD/LIVE=CORE-10 DONE · CORE-10/09/07 DONE · PAY/ATT/printable/Word DONE · Nest DENY · no reopen seals | O7/O8/O9 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + Cài đặt | Catalog/token across rollup membership | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | list ≠ get ≠ mutate resolver |
| **No Settings right** | Deny mutate catalog/token | Silent 2xx |

**Invariant PLT-01-SCOPE:** merge-tokens / settings-catalogs list **=** get-by-id **=** mutate **same** hrm list-scope family.

**Prerequisite:** CORE-10 seal RETAIN (`CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · ≠ CORE-10 DONE) · CORE-09 (`CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE) · CORE-07 (`CORE07QC1-KZJTSHNT`) · soft≠CORE-06 DONE · peers CORE-05/03/02b/09d..01 · **không** seed · honesty flags false.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ PLT-01 DONE** · Nest `/core` DENY · C-SLICE

---

## 4. Diễn biến FE U65 (browser matrix — narrow three-layer)

```text
Login (ceo@xe.vn / member HCNS Settings)
  → /hr Nhân sự → Cài đặt (Settings) phân hệ hẹp (EMP DOC/ET hoặc EMP-CF hoặc CTR TPL cite)
  → (Pos L1 LOAD/CAT) Mở danh mục · thêm mã N+1 (hoặc assert EFF consumer KEY) → Lưu 2xx → F5 còn
       → Assert Nest /core = 0 · peer catalog ≠ PLT-01 DONE
  → (Pos L1 RETIRE) Soft-retire một dòng → picker ẩn · lịch sử OK · no hard-delete
  → (Pos L2 SCHEMA) Lưu schema instance hẹp (EMP-CF group / JD layout / CTR clause order) → F5 còn
       → Assert no mega-EAV · jd_dynamic_done=false
  → (Pos L3 TOK-LIST) GET /api/hrm/merge-tokens 200 · labelVi · Nest /core 0
  → (Pos L3 TOK-REG) Lưu DOC/ET hoặc EMP-CF active → F5 token list có/refresh token · BR-PLT-01
  → (Pos FREEZE cite) Cite CORE-09 VER snapshot freeze · ≠ printable DONE · ≠ CORE-09 DONE
  → Footer: ≠ PLT-01 DONE
       · peer catalog ≠ PLT DONE
       · merge LIVE ≠ platform UAT
       · catalog/CRUD/LIVE ≠ CORE-10 DONE
       · printable false RETAIN
       · PAY/ATT OUT invent DONE
       · must_keep CORE-10 CORE10QC1-MSLP0EJB · CORE-09 CORE09QC1-MSLNBA89 · CORE-07 GATE/ACT-400/Nest DENY
       · soft≠CORE-06 DONE · honesty false · no reopen seals
```

**cấm:** `pnpm seed:*` · API seed catalog/token · DB fake · PASS chỉ curl · Nest `/core` dual · mega-EAV · wipe CORE-10/09/07/06/05/03/02b/09d..01 · claim peer seals=FR-PLT DONE · claim catalog/CRUD/LIVE=CORE-10 DONE · claim CORE-10/09/07 DONE · invent PAY/ATT/printable/Word · claim module DONE · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-PLT-01** | Settings catalog load + Nest `/core` 0 · no seed | AC-PLT-01-LOAD/PATH · O4/O10 |
| **VAL-PLT-02** | Admin N+1 save + F5 · consumer KEY when EFF · ≠ PLT DONE | AC-PLT-01-CAT/CNS · O1 |
| **VAL-PLT-03** | Soft-retire · picker hide · history OK | AC-PLT-01-RETIRE · O6 |
| **VAL-PLT-04** | Schema instance save + F5 · no mega-EAV · jd_dynamic false | AC-PLT-01-SCHEMA · O2 |
| **VAL-PLT-05** | GET merge-tokens + BR-PLT-01 register F5 | AC-PLT-01-TOK-* · O3 |
| **VAL-PLT-06** | Freeze cite · seals · ≠DONE · printable false · PAY/ATT OUT · CORE-10/09/07 RETAIN · honesty | AC-PLT-01-FREEZE/≠-*/H/MK-* · O5/O7/O8/O9 |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ PLT-01 DONE** · Nest `/core` DENY · C-SLICE

---

## 5. Journeys DRAFT (O11)

| J-ID | Layer | Title | Click path (draft) | Pass when |
|------|-------|-------|--------------------|-----------|
| **J-HRM-PLT-01-01** | **L1** | **Catalog admin≠consumer** | Login → Cài đặt → catalog hẹp (EMP DOC/ET hoặc peer cite) → N+1 Lưu 2xx → F5 · consumer KEY when EFF · Nest `/core` 0 · no seed · ≠ PLT DONE | AC-PLT-01-LOAD/CAT/CNS/PATH · O1/O4/O10 · U65 · **DRAFT** |
| **J-HRM-PLT-01-02** | **L1** | **Soft-retire** | Soft-retire dòng → picker ẩn · lịch sử OK · no hard-delete · Nest `/core` 0 | AC-PLT-01-RETIRE · O6 · U65 · **DRAFT** |
| **J-HRM-PLT-01-03** | **L2** | **FormSchema instance** | Lưu schema hẹp (EMP-CF / JD / CTR cite) → F5 còn · no mega-EAV · jd_dynamic_done=false · Nest `/core` 0 | AC-PLT-01-SCHEMA · O2 · U65 · **DRAFT** |
| **J-HRM-PLT-01-04** | **L3** | **MergeToken list** | GET `/api/hrm/merge-tokens` 200 · labelVi · Nest `/core` 0 · empty OK · ≠ platform UAT alone | AC-PLT-01-TOK-LIST · O3 · U65 · **DRAFT** |
| **J-HRM-PLT-01-05** | **L3** | **BR-PLT-01 register** | Lưu DOC/ET hoặc EMP-CF active → F5 token list có/refresh · Nest `/core` 0 | AC-PLT-01-TOK-REG · AC-PLT-EMP-TOK · O3 · U65 · **DRAFT** |
| **J-HRM-PLT-01-06** | **cross** | **Freeze + seals · ≠DONE** | Cite CORE-09 VER freeze · Nest `/core` 0 · ≠ PLT DONE · peer catalog≠PLT · merge≠UAT · catalog/CRUD/LIVE≠CORE-10 DONE · printable false · PAY/ATT OUT · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 GATE/ACT-400/Nest DENY/checklist≠DONE/free PATCH≠DONE · soft≠CORE-06 DONE · no reopen J-10/09/07/06/05/03/02B/09D..01 · ≠ invent PAY/ATT/Word | AC-PLT-01-FREEZE/≠-*/H/MK-* · O5/O7/O8/O9 · U19 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `hrm_personnel_uat_ready` · **≠** `contracts_printable_ready` · **≠** `jd_dynamic_done` · **≠** claim peer catalog = PLT-01 DONE · **≠** claim merge = platform UAT · **≠** claim catalog/CRUD/LIVE = CORE-10 DONE · **≠** claim CORE-10/09/07 DONE · **≠** invent PAY/ATT DONE · **narrow ≠ full ATT/PAY module**.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-CORE-10-01..06** / `CORE10QC1-MSLP0EJB` / `CORE10QA1-MSLOTSWO` | must_keep SI LIVE · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT · **≠** claim CORE-10 DONE |
| **J-HRM-CORE-09-01..06** / `CORE09QC1-MSLNBA89` / `CORE09QA1-MSLNTR5P` | must_keep fill+registry · printable **false** · 09a–d≠DONE · registry≠DONE · Word OUT · **≠** claim CORE-09 DONE |
| **J-HRM-CORE-07-01..05** / `CORE07QC1-KZJTSHNT` | must_keep activate · GATE 409 · ACT-400 · Nest `/core` 0 · checklist≠DONE · free PATCH≠DONE · **≠** claim CORE-07 DONE |
| **J-HRM-CORE-06-*** / soft≠DONE | must_keep soft≠DONE · **≠** claim soft=CORE-06 DONE |
| **J-HRM-CORE-05/03/02B/09D..01** | must_keep peer stamps · **≠** printable / closed-8 DONE |
| EMP/SI/ATT/PAY/DEC/REC/CTR catalog peers | **RETAIN cite** · **≠** PLT-01 DONE alone · ATT/PAY **OUT invent DONE** |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ PLT-01 DONE** · Nest `/core` DENY · C-SLICE

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** · **DENY** flip |
| `contracts_printable_ready` | **false RETAIN** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim peer catalog alone = PLT-01 / FR-PLT DONE | **DENIED** (O1/O9) — footer **peer catalog ≠ PLT-01 DONE** |
| Claim merge-tokens LIVE alone = platform UAT | **DENIED** (O3/O9) |
| Claim catalog/CRUD/LIVE = CORE-10 DONE | **DENIED** (O7) |
| Claim CORE-10 DONE | **DENIED** · stamp `CORE10QC1-MSLP0EJB` RETAIN ≠ DONE |
| Claim CORE-09 DONE / printable flip / Word invent | **DENIED** |
| Claim CORE-07 DONE / checklist=CORE-07 DONE / free PATCH=CORE-07 DONE | **DENIED** |
| Claim soft = CORE-06 DONE | **DENIED** · soft≠DONE **RETAIN** |
| Claim PAY DONE / ATT DONE | **DENIED** · **OUT invent** |
| Claim printable / closed-8 DONE | **DENIED** |
| Mega-EAV / Nest `emp_custom_field` / Nest `/core` dual | **DENIED** |
| Wipe CORE-10/09/07/06/05/03/02b/09d..01 | **DENIED** |
| C-SLICE | GWC later ≠ module PLT/CORE/CTR/ATT/PAY/personnel UAT ≠ Phase1 |
| must_keep W23 | CORE-10 `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE |
| must_keep W22 | CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE |
| must_keep W21 | CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE |
| must_keep W20..W10 | soft≠CORE-06 DONE · CORE-05 · CORE-03 · CORE-02b · CORE-09d..01 · 08 · 02 · 01 |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (no REQUIRED schema invent: LIVE `hrm_merge_tokens` · settings-catalogs / extension-items · domain Nest catalogs · FormSchema instances RETAIN cite) · then **sa API** RETAIN cite F-PLT-TOK-01..03 — residual wire **only if** closable gap proven |
| **ba-data** | **HOLD** (default) — reopen **REQUIRED** only if DATA proves typed col ABSENT for display-ready token/catalog |
| **sa API-01** | After HOLD stamp — RETAIN cite F-PLT-TOK-01 · F-PLT-TOK-02 · F-PLT-TOK-03 · paper `/core` alias only · **DENY** Nest dual · **DENY** mega-EAV · **DENY** invent PAY/ATT |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** mega-EAV · **DENY** wipe CORE-10/09/07.. · **DENY** invent PAY/ATT/printable/Word · **DENY** claim peer seals = PLT DONE · **DENY** claim CORE-10/09/07 DONE |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-24 seat #26)
uc_ids: UC-BP-PLT-01 · FR-UC-BP-PLT-01
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md · SA Option A · R-PLT-01-L1-CAT HOLD · R-PLT-01-L2-SCHEMA HOLD · R-PLT-01-L3-TOK HOLD · R-PLT-01-FREEZE/RETIRE cite · R-PLT-01-≠-DONE · R-PLT-01-PAY-ATT-OUT · printable false · CORE10QC1-MSLP0EJB catalog/CRUD/LIVE≠CORE-10 DONE · ≠ CORE-10 DONE · CORE09QC1-MSLNBA89 printable false · ≠ CORE-09 DONE · CORE07QC1-KZJTSHNT GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE · soft≠CORE-06 DONE · peers CORE-05/03/02b/09d..01
spec_ref: F-PLT-TOK-01..03 physical /api/hrm/merge-tokens* · LIVE hrm_merge_tokens · settings-catalogs + domain Nest catalogs RETAIN · FormSchema instances (JD/EMP-CF/CTR) RETAIN · Nest /core DENY · DENY mega-EAV · ≠ PLT-01 DONE · peer catalog ≠ PLT DONE · merge ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no invent/change on LIVE hrm_merge_tokens ONE SoT MergeToken
2) CONFIRM HOLD — settings-catalogs / hrm_catalog_extension_items / domain Nest catalogs RETAIN — ≠ PLT-01 DONE alone — DENY wipe
3) CONFIRM HOLD — FormSchema instances (rec_jd_* · EMP-CF extension · CTR clause/layout) RETAIN — DENY mega-EAV / Nest emp_custom_field invent
4) Cite display-ready DTO: tokenKey · labelVi · status · ring · domain · archivedAt · catalog code/label/status
5) RETAIN CORE-10 CORE10QC1-MSLP0EJB catalog/CRUD/LIVE≠DONE · CORE-09 printable false · CORE-07 GATE 409 · ACT-400 · Nest /core DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · Nest /core DENY
6) DENY wipe CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/ATT/printable/Word DONE · claim peer catalog = PLT DONE · claim merge = platform UAT · claim catalog/CRUD/LIVE = CORE-10 DONE · claim CORE-10/09/07 DONE · honesty flip · reopen sealed J-HRM-CORE-10/09/07/06/05/03/02B/09D..01 · seed · apps/**
7) Unlock next: sa API RETAIN cite F-PLT-TOK-01/02/03 — paper /core alias only — residual wire ONLY if closable gap proven — PAY/ATT remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (RETAIN cite · wire-only if gap)
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-PLT-01 against SA Option A: RETAIN LIVE **Catalog** + **FormSchema instances** + **MergeToken** (`/api/hrm/merge-tokens*` · `hrm_merge_tokens`) · paper `/core` = alias only · map FR-PLT Diễn biến #1–#5 + BR-PLT-01..06 → **AC-PLT-01-*** · residuals **R-PLT-01-L1/L2/L3/FREEZE/RETIRE/≠DONE/PAY-ATT/HONESTY** · **≠ PLT-01 DONE** · peer catalog ≠ PLT DONE · merge ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE · **printable false RETAIN** · **PAY/ATT OUT invent DONE** · **must_keep** CORE-10 (`CORE10QC1-MSLP0EJB`) · CORE-09 (`CORE09QC1-MSLNBA89`) · CORE-07 (`CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE) · soft≠CORE-06 DONE · Nest `/core` **DENIED** · mega-EAV **DENIED** · mint **J-HRM-PLT-01-01..06 DRAFT** (L1/L2/L3 narrow · not full ATT/PAY) · **ba-data HOLD default** · DENY invent PAY/ATT/printable/Word · wipe peers · reopen sealed J-* · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (HOLD stamp → then sa API RETAIN cite) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 HOLD · API F-PLT-TOK-01..03 cite · J-PLT-01-01..06 DRAFT until U65 · PAY/ATT OUT · personnel/printable/jd flags HOLD · ≠ PLT DONE · CORE-10/09/07 RETAIN ≠ DONE · soft≠CORE-06 DONE |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md` |

---

*End BA-01 · O1–O12 CONFIRMED · U89 Wave-24 · printable false RETAIN · ≠ PLT-01 DONE · peer catalog ≠ PLT DONE · merge ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE · PAY/ATT OUT · CORE-10/09/07 RETAIN · Nest /core DENY · mega-EAV DENY · no apps/** · no seed.*
