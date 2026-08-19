# BA AC pack — Wave-17 CORE cluster · UC-BP-CORE-02b (Nhóm field hồ sơ / metadata · EMP-CF RETAIN)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-17 seat **#19**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (`profile_groups_json` gap **NOT** proven) · sa API **HOLD** unless wire residual proven |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** wipe EMP-CUSTOM AC · **no** invent Nest `emp_custom_field` / mega-EAV / Nest `/core` · **no** invent `profile_groups_json` primary · **no** claim EMPCF = CORE-02b / personnel DONE · **no** reopen CORE-09d..01) |
| **uc_ids** | `UC-BP-CORE-02b` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-SA-01` **Option A LOCKED** · prior EMP-CUSTOM BA/QA/QC **RETAIN** (`EMPCFQA-MSK14LUH` · `EMPTOKEXTQA-MSJ57PE1`) · peer QC **`CORE09DQC1-MSLDR8I3`** / `CORE09CQC1-MSLBXMUT` / `CORE09BQC1-MSLB05DZ` / `CORE09AQC1-MSLA4LX9` / `CORE08QC1-MSL9BFFE` / `CORE02QC1-MSL80DU6` / `CORE01QC1-MSL6WMS7` |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-SA-01.md` |
| **ref_emp_cf_ba** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md` — **AC-PLT-EMP-CUSTOM-01*** · **VAL-EMP-CF-*** **CONFIRMED RETAIN** |
| **ref_emp_cf_fe_sa** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-FE-SA-01.md` — **`R-PLT-EMP-CF-FE-01`** Option **B** ACCEPT_AS_IS_P2 **HOLD RETAIN** |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-02b** · Diễn biến **#1–#4 + Thành công** · **AC-PLT-EMP-CUSTOM-01*** · **FR-UC-BP-PLT-01** · **BR-PLT-01/02/04/05** · **BR-BP-MD-01** · peers CORE-09d..01 **must_keep** |
| **ref_api_paper** | **F-EMP-CF-01..03** · **F-EMP-CF-CNS-01/02** · **F-EMP-TOK-03** · must_keep **F-CORE-CTR-TPL-01/02** (+ PUT clauses) · VER/PDF · PACK+PREV ephemeral · CL · CORE-08/02/01 |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim EMPCF L1 = CORE-02b / personnel DONE · **DENY** claim CORE-09d printable / closed-8 DONE |
| **Cấm** | Nest `emp_custom_field` · mega-EAV · Nest `/core` dual · invent `profile_groups_json` primary · honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-09D/09C/09B/09A/08/02/01 · claim EMPCF = module DONE |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-17 seat #19 — **gap-only RETAIN** trên spine EMP-CUSTOM đã seal:

1. **Profile groups SoT** = four allow-list Settings catalogs (`hrm_employee_{basic|personal|work|finance}_fields` + aliases) — **DENY** Nest `employee_profile_groups`.
2. **Field-def SoT** = `hrm_catalog_extension_items` (**F-EMP-CF-01..03**) — **DENY** Nest `emp_custom_field` / mega-EAV.
3. **TOK + CNS RETAIN** — **F-EMP-TOK-03** cite `EMPTOKEXTQA-MSJ57PE1` · invent **`HRM-EMP-CUSTOM-FIELD-KEY`** cite `EMPCFQA-MSK14LUH`.
4. **`profile_groups_json`** — **HOLD invent / OUT primary** (O5 gap **NOT** proven — four catalogs + `sort_order` đủ).
5. **FE `R-PLT-EMP-CF-FE-01`** — **KEEP P2 HOLD** (không promote CTA banner thành AC bắt buộc GĐ1).
6. **Mint** `J-HRM-CORE-02B-01..04` DRAFT · map peer `AC-PLT-EMP-CUSTOM-01*` / `VAL-EMP-CF-*` · **DENY** reopen sealed CORE-09d..01.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS / Settings admin | CREATE / soft-retire extension-item trên allow-list nhóm trường NS |
| HCNS hồ sơ | Form NV bind / lưu `custom_fields` ∈ EFF |
| ESS (narrow) | Self-PATCH chỉ key ESS — **cấm** widen |
| Group CEO | Scope rollup `main` — U19 Settings list = employee invent assert |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng `resolveHrmListScope` |
| Hệ thống | F-EMP-TOK-03 same-TX · CNS KEY when EFF>0 · **không** Nest field-def / Nest `/core` dual |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map Diễn biến #1–#4 → AC-PLT-EMP-CUSTOM-01* + VAL-EMP-CF-* · AC-CORE-02B-* deepen cite · J-HRM-CORE-02B-01..04 DRAFT · O5 OUT · O9 P2 HOLD | Impl `apps/**` / migration / seed |
| Physical `settings-catalogs*` + `employees*` custom_fields | Greenfield Nest `emp_custom_field*` · Nest `/core/…` SoT |
| Four catalogs = groups · `sort_order` display | Invent `profile_groups_json` primary engine |
| Honesty footer · C-SLICE · EMPCF ≠ personnel UAT · CORE-09d ≠ printable | Flip ready flags · reopen J-CORE-09D..01 |
| must_keep CORE-09d TPL+clause · 09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · EMPCF/EXT | Claim closed-8 / printable DONE · claim EMPCF = CORE-02b module DONE |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — Settings + Employee Network **chỉ** physical **`GET/POST …/settings-catalogs*`** (+ `:catalogKey/extension-items`) · consumer **`POST/PUT/PATCH /api/hrm/employees*`** `custom_fields` · paper `/api/hrm/core/…` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second EMP-CF SoT · **FAIL** Nest `emp_custom_field*` routes |
| **O2** | Groups SoT | **YES** — FR-02b «CRUD nhóm» = four allow-list catalog keys (basic/personal/work/finance + aliases) — **DENY** invent Nest `employee_profile_groups` / parallel group table — **AC-CORE-02B-01** |
| **O3** | Field-def SoT | **YES** — **RETAIN** `hrm_catalog_extension_items` only · admin CREATE open N+1 · **DENY** closed enum · **DENY** Nest field-def — **AC-PLT-EMP-CUSTOM-01** / **01H** · **VAL-EMP-CF-ADM-01** |
| **O4** | Token register | **YES** — Same save → `custom.emp.*` via **F-EMP-TOK-03** — **RETAIN smoke** cite EXT **`EMPTOKEXTQA-MSJ57PE1`** — **FORBIDDEN** reopen EXT suite — **AC-PLT-EMP-CUSTOM-01b** · **VAL-EMP-CF-ADM-02** |
| **O5** | `profile_groups_json` | **YES OUT primary · HOLD invent GĐ1** — order/visibility = catalog key + extension **`sort_order`** LIVE **sufficient**; closable UX gap for JSON column/layout engine **NOT proven** → **ba-data HOLD** · **DENY** Dev invent column as primary SoT — **AC-CORE-02B-05** |
| **O6** | Consumer invent | **YES** — EFF>0 invent → **`HRM-EMP-CUSTOM-FIELD-KEY`** · EFF=0 skip + soft-empty · **no seed** — **RETAIN** **`EMPCFQA-MSK14LUH`** — **AC-PLT-EMP-CUSTOM-01c/01d** · **VAL-EMP-CF-CNS-01/02** |
| **O7** | Soft-retire | **YES** — Soft hide picker + token · history values OK — **DENY** hard-delete wipe — **AC-PLT-EMP-CUSTOM-01e** · **VAL-EMP-CF-CNS-03** |
| **O8** | C&B / public | **YES** — Finance group / money keys **must_keep** CORE-02 CB-403 · CORE-01 public strip — **DENY** leak C&B on public form — cite stamps **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** — **AC-CORE-02B-08** |
| **O9** | FE residual | **YES KEEP P2 HOLD** — **`R-PLT-EMP-CF-FE-01`** empty CTA banner = **P2 HOLD cite** (FE-SA Option B) — soft-empty omit section when EFF=0 **PASS** **AC-01d**; **DENY** promote CTA banner as mandatory GĐ1 AC · **DENY** invent Nest field-def UI — **AC-CORE-02B-FE-HOLD** |
| **O10** | Honesty / peers OUT | **YES false** — all ready flags false · C-SLICE · **DENY** flip personnel/printable/recruitment/jd · **DENY** claim EMPCF=module DONE · **DENY** claim CORE-09d printable / closed-8 DONE · **must_keep** CORE-09d..01 · Nest DENY — **AC-PLT-EMP-CUSTOM-01H** · **AC-CORE-02B-H** |
| **O11** | Display-ready | **YES** — Extension DTO: `code` · `label` VI · unit/meta · `sort_order` · `status` · `catalogKey` · optional `token_key` — FE bind · **cấm** FE invent field-def SoT |
| **O12** | Journeys | **YES** — Mint **`J-HRM-CORE-02B-01..04` DRAFT** (Settings N+1 → F5 → form mount → invent KEY · retire + seals) · map peer **J-HRM-EMP-CF-CAT-*** proposed · **DENY** reopen sealed J-HRM-CORE-09D/09C/09B/09A/08/02/01 |

**Architecture SoT:** ONE LIVE EMP-CF spine = Settings allow-list catalogs (groups) + extension-items (defs) + TOK + CNS · paper `/core` alias only · `profile_groups_json` OUT primary · U19 Settings ↔ employees invent · soft-delete doctrine RETAIN · CORE-09d..01 **must_keep**.

### Primary API surface (BA lock — O1)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List group / defs | **`GET /api/hrm/settings-catalogs/:catalogKey`** (+ extension / effective) | `/core/…` alias only |
| Admin CREATE N+1 | **`POST …/settings-catalogs/:catalogKey/extension-items`** | alias |
| Soft-retire def | Soft-retire extension-item (LIVE path) | alias |
| Token side-effect | **F-EMP-TOK-03** same TX in CF-02/03 | — |
| Consumer invent | **`POST/PUT/PATCH /api/hrm/employees*`** `custom_fields` | `/core/employees` alias |
| ESS narrow | Self-PATCH · **F-EMP-CF-CNS-02** | — |
| CORE-09d TPL+clause | **must_keep** `/contracts-insurance/contract-templates*` | alias |
| CORE-09c VER/PDF | **must_keep** print-versions* / pdf | alias — **≠** printable UAT |
| CORE-09b PREV | **must_keep** pack-resolve + preview **ephemeral** | alias |
| CORE-09a CL | **must_keep** contract-clauses* | alias |
| CORE-08 / 02 / 01 | **must_keep** rewards/discipline · packages · public employees | alias |

**Invariant CORE-02B-PATH:** Settings/Employee Network **MUST** hit `/settings-catalogs*` + `/employees*` · Nest dual `/core` EMP-CF SoT = **FAIL O1**.

**Invariant CORE-02B-GROUPS:** Groups SoT ≠ four catalogs (or invent Nest group table) = **FAIL O2**.

**Invariant CORE-02B-DEF:** Nest `emp_custom_field` / mega-EAV / MD-alone SoT = **FAIL O3**.

**Invariant CORE-02B-JSON:** Treat `profile_groups_json` as primary layout SoT without BA+ba-data gap = **FAIL O5**.

**Invariant CORE-02B-≠-EMPCF-DONE:** Claim EMPCF L1 / FE mount = CORE-02b / personnel module UAT = **FAIL O10**.

**Invariant CORE-02B-≠-09D-PRINTABLE:** Claim CORE-09d = printable / closed-8 DONE = **FAIL O10**.

**Wire codes (RETAIN — no invent rewrite):** `HRM-EMP-CUSTOM-FIELD-KEY` · admin format/UQ VAL · `HRM-SCOPE-409` · ESS 403 class · sealed CORE-09d..01 / CB-403 codes · **DENY** 2xx invent when EFF>0.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-17 · Option A) |
|---|----------------------|---------------------------|
| Groups | Four allow-list catalog keys LIVE | **RETAIN** = FR-02b nhóm (**O2**) |
| Field-def | `hrm_catalog_extension_items` LIVE | **RETAIN** EMP-CUSTOM Option A (**O3**) |
| TOK | F-EMP-TOK-03 · EXT seal | **RETAIN smoke** (**O4**) |
| CNS invent | 422 KEY · `EMPCFQA-MSK14LUH` | **RETAIN** (**O6**) |
| Empty EFF | Soft omit + P2 CTA HOLD | **RETAIN** · CTA **P2 HOLD** (**O9**) |
| Soft-retire | Soft item + token | **RETAIN** (**O7**) |
| Display order | `sort_order` LIVE | **RETAIN sufficient** (**O5**) |
| `profile_groups_json` | ABSENT ensureSchema | **HOLD invent · OUT primary** (**O5**) |
| Nest emp_custom_field | ABSENT | **RETAIN ABSENT · DENY invent** |
| Paper `/core/…` | Not Nest SoT | **Alias only** (**O1**) |
| CORE-09d..01 | SEALED stamps | **must_keep · DENY reopen** (**O10**) |
| Honesty | C-SLICE · personnel/printable false | **false** (**O10**) |
| Schema | LIVE extension + tokens + custom_fields | **ba-data HOLD** |

### 1.1 ba-data disposition (O5)

| Decision | Rule |
|----------|------|
| **HOLD default** | LIVE: `hrm_catalog_extension_items` · `hrm_merge_tokens` · `employees.custom_fields` · four catalogs — **no** ADD `profile_groups_json` / Nest field-def |
| **Gap proof result** | Four catalogs + `sort_order` cover FR-02b nhóm + thứ tự hiển thị — **no** closable residual requiring JSON layout column |
| Conditional UNLOCK | **Only if** future BA/QA proves UX gap that catalogs+`sort_order` cannot cover — **this seat: NOT unlock** |
| DENY | Nest `emp_custom_field` table · mega-EAV · Nest `/core` table · wipe Settings extension SoT · invent `profile_groups_json` as primary |

---

## 2. Business rules (normative — SRS + SA + EMP-CF BA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-01** | Extension def saved active on allow-list | Same-TX **F-EMP-TOK-03** | `custom.emp.<code>` · origin=`extension_field` |
| **BR-PLT-02** | EFF active defs >0 | Consumer codes ∈ EFF | Invent → **`HRM-EMP-CUSTOM-FIELD-KEY`** |
| **BR-PLT-04** | Soft-retire def | Soft item + matching token | Hide picker; history OK |
| **BR-PLT-05** | Admin CREATE | Open N+1 slug · format only | Closed enum = **FAIL O3** |
| **BR-BP-MD-01** | Metadata tenant CRUD | No hardcode fixed field set | Hardcode-only = **FAIL** |
| **BR-CORE-02B-GROUPS** | «Nhóm» FR-02b | = catalog key allow-list | Nest group dual = **FAIL O2** |
| **BR-CORE-02B-ORDER** | Display order | extension `sort_order` | Invent JSON primary without gap = **FAIL O5** |
| **BR-CORE-02B-PATH** | API | Physical settings-catalogs* + employees* | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-02B-CB** | Finance / money | CORE-02/01 strip | Public leak = **FAIL O8** |
| **BR-CORE-02B-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-CORE-02B-≠-DONE** | EMPCF L1 / FE mount | ≠ module / personnel UAT | Claim DONE = **FAIL O10** |
| **BR-PLT-EMP-CF-01..12** | EMP-CUSTOM BA §3 | **RETAIN cite** | Wipe / reopen EXT = **FAIL** |

### Error taxonomy (RETAIN)

| Code | HTTP | UX intent (VI) | ≠ |
|------|------|----------------|--|
| **`HRM-EMP-CUSTOM-FIELD-KEY`** | 4xx | Mã mở rộng lạ khi còn mục hiệu lực | Admin CREATE · soft empty |
| Admin format / UQ | 4xx | Mã sai định dạng / trùng | Consumer invent synonym |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Invent KEY |
| ESS 403 class | 403/4xx | ESS ngoài allow | Widen full catalog |
| Sealed CORE-*/CB-* | — | **DENY** rewrite · must_keep regression | — |

---

## 3. Diễn biến #1–#4 → AC / VAL map (normative)

| SRS # | Tương tác | AC cite (RETAIN) | VAL cite | CORE-02B deepen | J-* |
|-------|-----------|------------------|----------|-----------------|-----|
| **#1** | CRUD nhóm / mục mở rộng | **AC-PLT-EMP-CUSTOM-01** · groups=**O2** | **VAL-EMP-CF-ADM-01** | **AC-CORE-02B-01** (nhóm=catalog) · **AC-CORE-02B-02** (CREATE N+1 F5) | **J-HRM-CORE-02B-01** |
| **#2** | Đăng ký trường trộn | **AC-PLT-EMP-CUSTOM-01b** | **VAL-EMP-CF-ADM-02** | **AC-CORE-02B-03** (TOK smoke RETAIN) | **J-HRM-CORE-02B-02** |
| **#3** | Áp dụng form hồ sơ | **AC-PLT-EMP-CUSTOM-01** (form bind) · **01d** empty | **VAL-EMP-CF-CNS-02** (skip) | **AC-CORE-02B-04** (mount EFF>0 · display-ready O11) | **J-HRM-CORE-02B-02** |
| **#4** | Lưu mã mở rộng lạ | **AC-PLT-EMP-CUSTOM-01c** | **VAL-EMP-CF-CNS-01** | **AC-CORE-02B-06** (KEY + F5 no persist) | **J-HRM-CORE-02B-03** |
| Special empty | EFF=0 | **AC-PLT-EMP-CUSTOM-01d** | **VAL-EMP-CF-CNS-02** | Soft-empty PASS · CTA **P2 HOLD** (**O9**) | spot on **02B-01/02** |
| Special retire | Ngừng mục | **AC-PLT-EMP-CUSTOM-01e** | **VAL-EMP-CF-CNS-03** | **AC-CORE-02B-07** | **J-HRM-CORE-02B-04** |
| Thành công | Metadata tenant sẵn sàng | **AC-PLT-EMP-CUSTOM-01H** | — | **AC-CORE-02B-H** · **≠** personnel UAT | **J-HRM-CORE-02B-04** |
| Value≠register | PATCH value alone | EXT-04c RETAIN | **VAL-EMP-CF-CNS-05** | must_keep | spot |
| C&B/public | Finance strip | CORE-02/01 | — | **AC-CORE-02B-08** | **J-HRM-CORE-02B-04** |

### 3.1 AC-CORE-02B deepen (ADD cite — không wipe EMP-CUSTOM)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-CORE-02B-01** | Settings NS | Open nhóm cơ bản/cá nhân/công việc/tài chính | UI/API catalogKey ∈ allow-list four; **no** Nest group CRUD | Browser · O2 |
| **AC-CORE-02B-02** | Allow-list catalog | CREATE extension mã mới → Lưu | Network **POST** `…/extension-items` **2xx** → list + **F5 còn**; **no** Nest `/core` · **no** closed enum | U65 · O1/O3 · AC-01 |
| **AC-CORE-02B-03** | Same save as 02 | Open merge-tokens EMP | `custom.emp.<code>` origin=`extension_field` — **RETAIN smoke** cite `EMPTOKEXTQA-MSJ57PE1` | O4 · AC-01b |
| **AC-CORE-02B-04** | EFF>0 | Open Employee form | Dynamic fields mount from EFF · sort_order · **F5** values path OK | O11 · #3 |
| **AC-CORE-02B-05** | Layout/order | Inspect SoT | Groups+`sort_order` sufficient · **`profile_groups_json` NOT required** · ba-data HOLD | O5 |
| **AC-CORE-02B-06** | EFF>0 | Lưu invent extension code | **4xx** `HRM-EMP-CUSTOM-FIELD-KEY` · F5 **không** giữ mã lạ — cite `EMPCFQA-MSK14LUH` | O6 · AC-01c · VAL-CNS-01 |
| **AC-CORE-02B-07** | Active item | Soft-retire → form | Hidden from picker · history OK · token soft | O7 · AC-01e |
| **AC-CORE-02B-08** | Finance / money | Public CORE-01 vs C&B | Public strip · CB-403 must_keep · finance catalog ≠ public leak | O8 |
| **AC-CORE-02B-FE-HOLD** | EFF=0 | Empty extension block | Soft omit **PASS** AC-01d · explicit Settings CTA banner remains **`R-PLT-EMP-CF-FE-01` P2 HOLD** — **≠** mount FAIL · **≠** unlock Nest UI | O9 |
| **AC-CORE-02B-H** | Evidence footer | Any seal | personnel/printable/recruitment/jd **false** · C-SLICE · **DENY** EMPCF=CORE-02b DONE · **DENY** CORE-09d printable/closed-8 · Nest DENY · no reopen J-09D..01 | O10 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS | Create extension + invent assert across rollup | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | Settings list ≠ employee invent resolver |
| **No Settings right** | Deny CREATE | Silent 2xx |
| **No HR mutate** | Deny consumer invent path | Silent 2xx invent |

**Invariant CORE-02B-SCOPE:** Settings catalog list/get/mutate **=** employees invent assert **same** `resolveHrmListScope` family.

**Prerequisite:** EMP-CUSTOM seals RETAIN · EXT seal RETAIN · CORE-09d..01 stamps RETAIN · **không** seed · honesty flags false.

---

## 4. Diễn biến FE U65 (browser matrix)

```text
Login (ceo@xe.vn / member HCNS)
  → /hr Cài đặt → Danh mục / catalogs → chọn nhóm NS (basic|personal|work|finance)
  → Thêm mục mở rộng (mã mới) → Lưu → Network POST …/extension-items 2xx
  → F5 còn mục · (spot) merge-tokens có custom.emp.<code>
  → Nhân sự → mở form NV → dynamic fields mount (EFF>0)
  → Lưu với mã lạ → 4xx HRM-EMP-CUSTOM-FIELD-KEY → F5 không giữ
  → Soft-retire mục → picker ẩn · Nest /api/hrm/core/** hits = 0
  → Footer honesty false · no claim EMPCF=personnel · no claim CORE-09d printable
```

**cấm:** `pnpm seed:*` · API seed extension density · DB fake defs · PASS chỉ curl · Nest `/core` dual · invent Nest field-def · claim module DONE · reopen sealed J-*.

### VAL pack cite (RETAIN — không mint VAL mới trừ map)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-EMP-CF-ADM-01** | CREATE N+1 2xx + F5 | #1 · AC-01 · 02B-02 |
| **VAL-EMP-CF-ADM-02** | Token origin=extension_field | #2 · AC-01b · 02B-03 |
| **VAL-EMP-CF-CNS-01** | Invent → KEY | #4 · AC-01c · 02B-06 · **SEALED** |
| **VAL-EMP-CF-CNS-02** | EFF=0 skip · CTA note **P2 HOLD** | #3 empty · AC-01d · O9 |
| **VAL-EMP-CF-CNS-03** | Retire hide | AC-01e · 02B-07 |
| **VAL-EMP-CF-CNS-04..07** | Non-allow / value≠reg / scope / ESS | RETAIN EMP-CUSTOM |
| **VAL-EMP-CF-CNS-01-VALID** | Valid code persist | RETAIN QA seal |

---

## 5. Journeys DRAFT (O12)

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CORE-02B-01** | **Settings CREATE N+1 on group catalog** | Login → Cài đặt catalogs → chọn nhóm allow-list → Thêm mục → POST extension-items 2xx → F5 còn · Nest `/core` 0 | AC-CORE-02B-01/02 · AC-PLT-EMP-CUSTOM-01 · VAL-ADM-01 · O1/O2/O3 · U65 · map **J-HRM-EMP-CF-CAT-01** |
| **J-HRM-CORE-02B-02** | **Token smoke + form mount** | Same save → merge-tokens `custom.emp.*` smoke cite EXT · Employee form mount EFF>0 · F5 | AC-CORE-02B-03/04 · AC-01b · VAL-ADM-02 · O4/O11 · U65 · map **J-HRM-EMP-CF-CAT-02** · **≠** reopen EXT suite |
| **J-HRM-CORE-02B-03** | **Invent KEY fail** | EFF>0 → Lưu mã lạ → **4xx** `HRM-EMP-CUSTOM-FIELD-KEY` → F5 không giữ — cite `EMPCFQA-MSK14LUH` | AC-CORE-02B-06 · AC-01c · VAL-CNS-01 · O6 · U65 · map **J-HRM-EMP-CF-CAT-03** |
| **J-HRM-CORE-02B-04** | **Retire · CB/public · seals · honesty** | Soft-retire hide · finance/public strip smoke · Nest `/core` 0 · CORE-09d..01 smoke · no EMPCF=personnel DONE · no CORE-09d printable/closed-8 · CTA P2 HOLD | AC-CORE-02B-07/08/FE-HOLD/H · AC-01e/01d/01H · O5/O7/O8/O9/O10 · U19 · map **J-HRM-EMP-CF-CAT-05** (+ CAT-04 empty spot) |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `hrm_personnel_uat_ready`.

| Sealed peer | Rule |
|-------------|------|
| **EMPCFQA-MSK14LUH** / EMP-CUSTOM CNS | **must_keep RETAIN** · **DENY** reopen as CORE-02b unlock pretext for Nest field-def |
| **EMPTOKEXTQA-MSJ57PE1** / EXT | **must_keep RETAIN smoke** · **DENY** reopen EXT suite |
| **`R-PLT-EMP-CF-FE-01`** | **P2 HOLD RETAIN** · **DENY** promote as Nest UI unlock |
| **J-HRM-CORE-09D-01..04** | must_keep · stamp **`CORE09DQC1-MSLDR8I3`** · **≠** printable / closed-8 DONE · **DENY** reopen |
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
| Claim EMPCF L1 / FE mount = CORE-02b / personnel UAT | **DENIED** |
| Claim CORE-09d TPL = printable / closed-8 DONE | **DENIED** |
| Claim CORE-09c = printable DONE | **DENIED** |
| `profile_groups_json` primary | **DENIED** invent GĐ1 (**O5 OUT**) |
| Nest `emp_custom_field` / mega-EAV / Nest `/core` | **DENIED** |
| `R-PLT-EMP-CF-FE-01` | **P2 HOLD** — **DENIED** Nest field-def UI unlock |
| C-SLICE | GWC later ≠ module CORE/personnel/CTR UAT ≠ Phase1 |
| must_keep W16 | CORE-09d TPL+clause · **`CORE09DQC1-MSLDR8I3`** |
| must_keep W15..W10 | 09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 stamps |
| must_keep EMPCF/EXT | `EMPCFQA-MSK14LUH` · `EMPTOKEXTQA-MSJ57PE1` |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-09D/09C/09B/09A/08/02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (O5 gap **NOT** proven · `profile_groups_json` OUT) · stamp HOLD CONFIRMED · then sa API RETAIN cite F-EMP-CF-* **only if** wire gap · else FE residual only (P2 CTA HOLD) |
| **ba-data** | **HOLD** |
| **sa API-01** | **HOLD** default — F-EMP-CF-01..03 / CNS / TOK **RETAIN cite** · unlock only if residual wire gap proven |
| **Dev** | **HOLD** until DATA HOLD stamped · **DENY** Nest emp_custom_field · **DENY** mega-EAV · **DENY** Nest `/core` · **DENY** invent JSON primary |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-ba-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02b
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01.md · SA Option A · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · peer CORE09DQC1-MSLDR8I3 must_keep
spec_ref: LIVE hrm_catalog_extension_items + hrm_merge_tokens + employees.custom_fields · four allow-list catalogs = groups · sort_order · profile_groups_json HOLD invent/OUT primary · F-EMP-CF-01..03 · F-EMP-TOK-03 · F-EMP-CF-CNS-01/02 · Nest emp_custom_field DENY · Nest /core DENY

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no ADD profile_groups_json / Nest emp_custom_field / mega-EAV / Nest /core table / wipe Settings extension SoT; RETAIN LIVE extension-items + merge_tokens + custom_fields + four catalogs
2) Cite physical columns already LIVE for defs (code·label·sort_order·status·catalogKey) + token origin=extension_field + custom_fields values
3) Conditional UNLOCK ONLY if BA O5 gap proven — BA-01 result = gap NOT proven → NOT unlock profile_groups_json
4) RETAIN CORE-09d TPL+clause · CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · Nest /core DENY · EMPCF/EXT seals
5) DENY invent Nest emp_custom_field · claim EMPCF = CORE-02b / personnel UAT · claim CORE-09d printable / closed-8 DONE · honesty flip · reopen J-HRM-CORE-09D/09C/09B/09A/08/02/01 · seed · apps/**
6) Unlock next: sa API-01 HOLD/RETAIN cite F-EMP-CF-* / CNS / TOK — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API RETAIN or FE P2 HOLD only
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-02b against SA Option A: groups = four allow-list catalogs · field-def = `hrm_catalog_extension_items` (**F-EMP-CF-01..03**) · TOK+CNS **RETAIN** (`EMPTOKEXTQA-MSJ57PE1` · `EMPCFQA-MSK14LUH`) · **`profile_groups_json` HOLD invent / OUT primary** (O5 gap **NOT** proven) · Nest `emp_custom_field` / mega-EAV / Nest `/core` **DENIED** · FE **`R-PLT-EMP-CF-FE-01` P2 HOLD** (not promoted) · Diễn biến #1–#4 mapped to **AC-PLT-EMP-CUSTOM-01*** + **VAL-EMP-CF-*** · mint **J-HRM-CORE-02B-01..04 DRAFT** · **ba-data HOLD** · must_keep CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · DENY honesty flip · claim EMPCF=module DONE · claim CORE-09d printable/closed-8 · reopen sealed J-* · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (HOLD) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 HOLD stamp · API F.1 RETAIN cite (no invent) · FE CTA remains P2 HOLD · journeys DRAFT until QA · personnel/printable flags HOLD |
