# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01 — Physical DB — OT compensation_type open catalog

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01` **Option B CONFIRMED** — Nest **ABSENT** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `public.att_ot_comp_type` (DEFINE) · **DOC-DELTA** client DB (OT compensation catalog note) · **KEEP** `overtime_requests.compensation_type` TEXT soft key · **NO CODE** `apps/**` · **no migrate execute** · **no seed** · **no wipe** OT-TYPE / CTR / ATT L1 seals · **no** fold compensation into `att_ot_type` / `work_shifts` / leave / day-code / worksite · **no** rewrite aggregate / payroll formula |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — physical ADD per SA Option B §4→§6 · F-ATT-CAT-OTC-* |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01` **CONFIRMED Option B LOCKED** · parallel `…-ATT-COMP-TYPE-CATALOG-BA-01` **in flight / UNLOCK** (BE unlock **HOLD** until BA **also** CONFIRMED) |
| **peer_retain** | `OT-TYPE-CATALOG-DATA-01` `att_ot_type` **RETAIN** (KEY LIVE) · `ATT-CODE-CATALOG-DATA-01` **RETAIN** · `ATT-DATA-01` `att_leave_type` **RETAIN** · `ATT-WORKSITE` / SHIFT **RETAIN** · CTR KEY **RETAIN** — **FORBIDDEN** fold compensation into any of these |
| **ref_sa** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md` Option B · L-ATT-OTC-01..16 · F-ATT-CAT-OTC-01/02 · AC-PLT-ATT-COMP-01* · invent **`HRM-ATT-OT-COMP-KEY`** |
| **ref_peer_ot_type** | `OT-TYPE-CATALOG-DATA-01` — closest structural peer (DEFINE Nest OT catalog + open `code` + soft-delete + ICatalogRow) — **orthogonal OWN** · **cite ≠ copy** · compensation ≠ OT type |
| **ref_peer_att_code** | `ATT-CODE-CATALOG-DATA-01` — open day-code catalog pattern — **separate** table |
| **ref_platform** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` `ICatalogRow` · R-PLT-DATA-04 |
| **ref_adr** | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM` Option B · L1 Catalog · L6 soft-delete · Q-PLT-03 mega-EAV DENY · `ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804` **D4** OT sidebar stub (REF only) |
| **ref_db_client** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.5 `overtime_requests` — ADD §4.5c OT compensation-type catalog note |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · **DENIED** invent module ATT/PAY UAT · **DENIED** claim compensation catalog = payroll formula LIVE · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | `overtime_requests.compensation_type` TEXT column (soft key storage) · `overtime_requests` TXN LIVE (create/approve/delete) · `overtime_type` + `att_ot_type` KEY LIVE · `att_attendance_code` · `att_leave_type` · `attendance_work_sites` · `work_shifts` ops · soft-delete class · scope TEXT slug · open catalog (no closed salary\|compensatory_leave enum ceiling) · display-ready `name_vi` · `att-timesheet-line-aggregate` + payroll LIST-TOTALS G≥1 sealed · CTR KEY / ATT L1 / FE LVRULE 01g HOLD RETAIN |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical table | **CONFIRMED ADD** `public.att_ot_comp_type` — **ABSENT AS-IS** Nest (SA §4.3 probe + 2026-08-08 grep: zero CREATE / zero service; only TXN `overtime_requests.compensation_type` TEXT free string + FE closed-2 hardcode) |
| Synonym stamp | **ONE** table name locked = **`att_ot_comp_type`** — synonym `att_overtime_comp_type` **REJECTED** for this seat (avoid dual-table invent) |
| Platform pattern | Option B **`ICatalogRow`** on domain table — **not** mega-EAV — **not** fold into `att_ot_type` / `att_attendance_code` / `att_leave_type` / `attendance_work_sites` / `work_shifts` — **not** Settings sole SoT |
| Open catalog | **`code`** format-only CHK — **FORBIDDEN** closed enum CHECK / DTO `@IsIn(['salary','compensatory_leave'])` product ceiling (starter two = bootstrap ≠ ceiling — **BR-PLT-05**) |
| Free-TEXT RETAIN | Column **`overtime_requests.compensation_type` TEXT KEEP** as storage soft key — **REJECT** free-TEXT as **product SoT** when EFF>0 (membership SoT = Nest catalog) |
| Dual SoT | Future Settings/XBOS compensation MD = group **REF** merge-read only — tenant Nest writer **wins** (**BR-PLT-06** · L-ATT-OTC-03) — Settings **≠** sole producer |
| Soft-delete | `status='inactive'` + `archived_at` — history `overtime_requests` may keep retired compensation codes (**BR-PLT-04** · L-ATT-OTC-07) |
| Consumer column | **KEEP** `overtime_requests.compensation_type` **text** soft key; drop closed FE hardcode-2 as sole SoT when EFF>0; validate → EFF when active count>0 → **`HRM-ATT-OT-COMP-KEY`** (400) |
| Invent KEY | **`HRM-ATT-OT-COMP-KEY`** — **≠** `HRM-ATT-OT-TYPE-KEY` · **≠** SHIFT/LEAVE/CTR/CODE KEY taxonomy (**L-ATT-OTC-16**) |
| Peer catalogs | OT-type / attendance-code / leave / work-sites / shifts / CTR **RETAIN** — **FORBIDDEN** wipe / reopen / fold |
| Seals | OT-TYPE KEY LIVE · CTR template/clause KEY · ATT leave-balance / LVRULE 01g HOLD · ATT-CODE / WS / SHIFT / leave L1 · EMP / SI / PAY / DEC / MergeToken **RETAIN** |
| Dev this seat | **NO** `apps/**` · **NO** migrate execute · **NO** seed UF |
| Closes | **R-PLT-DATA-04** ATT **OT-compensation-type** catalog slice (OT-type / leave / work-sites / attendance-code slices remain CLOSED separately) |
| Honesty | **remain false** — attendance / payroll / module ATT-PAY UAT **not** flipped · formula **HOLD** |
| BE unlock | **HOLD** — this DATA **CONFIRMED** · parallel **BA-01** must also **CONFIRMED** before PM unlocks BE |

---

## 2. ADD `public.att_ot_comp_type`

### 2.1 Columns (`ICatalogRow` + compensation display metadata)

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — same `resolveHrmListScope` (**U19**) |
| `code` | text | NO | | Open catalog compensation key — format `^[a-z][a-z0-9_]*$`; assert normalize `lower(code)`; stores consumer `overtime_requests.compensation_type` value (starter `salary` / `compensatory_leave`, open N+1 e.g. `banked_hours`, `mixed_pay_leave`) |
| `name_vi` | text | NO | | UI label (display-ready) e.g. "Trả lương" / "Nghỉ bù" |
| `name_en` | text | YES | NULL | Optional English label — display only |
| `sort_order` | int | NO | 100 | Picker / Settings tab order |
| `color` | text | YES | NULL | Optional badge/UI hint (hex or token) — not SoT |
| `metadata_json` | jsonb | YES | NULL | Optional hints (e.g. future leave-funnel cite) — **not** mega-EAV SoT — **not** replace typed columns — **not** auto leave-funnel LIVE |
| `status` | text | NO | `'active'` | Row lifecycle `active` \| `inactive` (**≠** compensation `code`) |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

**Note GĐ1:** **No** payroll formula / amount engine columns required. Optional future flags (e.g. `banks_leave`, `pays_cash`) stay **OUT** unless BA stamps — do **not** invent formula columns this seat. Compensatory leave **may later cite** leave-type for accrual funnel — **OUT** this seat (no leave-type reopen; no auto-funnel LIVE claim — SA §4.4 / §8).

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(code)) WHERE archived_at IS NULL` — one active compensation type per (company, code) |
| **IX list** | `(company_id, status)` · `(company_id, sort_order)` |
| **IX effective** | `(company_id) WHERE archived_at IS NULL AND status = 'active'` — **F-ATT-CAT-OTC-01** effective resolution |
| **CHK `chk_att_ot_comp_type_code_format`** | `code ~ '^[a-z][a-z0-9_]*$'` — **format only** |
| **CHK `chk_att_ot_comp_type_name_vi`** | `char_length(trim(name_vi)) BETWEEN 1 AND 128` — display label |
| **CHK `chk_att_ot_comp_type_row_status`** | `status IN ('active','inactive')` |
| **FORBIDDEN** | `CHECK (code IN ('salary','compensatory_leave'))` / restore Nest DTO `@IsIn(2)` as product ceiling · hard-delete when `overtime_requests` history references code · mega-EAV · fold into `att_ot_type` / `att_attendance_code` / `att_leave_type` / `attendance_work_sites` / `work_shifts` · hard FK on TXN column · UNIQUE on `name_vi` alone |

### 2.3 Orthogonality — OT type ≠ compensation (physical)

```text
  overtime_type     ──► public.att_ot_type        (when/class of OT day)
  compensation_type ──► public.att_ot_comp_type   (how OT is settled)

  FORBIDDEN: ADD compensation_code as mandatory child column of att_ot_type replacing this catalog
  FORBIDDEN: encode compensation as overtime_type slug
  FORBIDDEN: reopen OT-TYPE L1 / ensureSchema on att_ot_type to «fix» compensation hardcode
  FORBIDDEN: fold into leave category `ot_comp` on att_leave_type (leave category ≠ compensation catalog)
```

| Aspect | `att_ot_type` (RETAIN) | `att_ot_comp_type` (THIS ADD) |
|--------|----------------------|------------------------------|
| Consumer column | `overtime_requests.overtime_type` | `overtime_requests.compensation_type` |
| Invent KEY | `HRM-ATT-OT-TYPE-KEY` | **`HRM-ATT-OT-COMP-KEY`** |
| Caps | F-ATT-CAT-OT-* | **F-ATT-CAT-OTC-*** |
| Formula | `default_coeff` display-ready HOLD | **no** coeff required GĐ1 · formula HOLD |

### 2.4 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `code` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | `name_en` + `sort_order` + `color` (+ optional `metadata_json`) |
| `catalog_kind` | `att_ot_comp_type` (adapter constant) |

### 2.5 Dual SoT — effective OT compensation catalog (read model)

```text
  (future) Settings/XBOS compensation MD  --> group REF merge-read only (Option A REJECT as sole)
           |
  F-ATT-CAT-OTC CRUD --> public.att_ot_comp_type (code SoT)  [ADD physical DEFINE]
           |
           v
  F-ATT-CAT-OTC-01 list / effective --> picker code / name_vi
           |  (ATT tenant row wins on same code)
           v
  Consumers (when active EFF count > 0):
    createOvertimeRequest + OvertimeRequestTab create/mutate --> overtime_requests.compensation_type in catalog
           |
  invent compensation_type --> HRM-ATT-OT-COMP-KEY (400)
  empty EFF (0) --> soft skip invent + CTA admin CREATE --> no seed --> hardcode two fallback only
  att_ot_type / day-code / leave / worksite / shifts / CTR / FE LVRULE / payroll formula --> OUT
```

### 2.6 Builtin bootstrap keys (optional ensure — NOT seed, NOT UF evidence)

| `code` | `name_vi` | Note |
|--------|-----------|------|
| `salary` | Trả lương | Bootstrap example — matches AS-IS DEFAULT + FE SelectItem — admin may edit/retire |
| `compensatory_leave` | Nghỉ bù | Bootstrap example — FE i18n `overtime.compensationTimeOff` — **≠** slug `time_off` / `time-off` — **≠** leave-type fold |

**Clarify:** starter two = bootstrap fallback (`BR-PLT-05`) khi EFF=0 — **≠** ceiling. Không dùng làm UF density evidence (U65). Admin CREATE N+1 mở (`banked_hours`, `mixed_pay_leave`, …). Detail badge **FORBIDDEN** binary `salary ? Salary : TimeOff` invent when Nest `name_vi` exists (**L-ATT-OTC-12**).

---

## 3. Consumer surface — `overtime_requests.compensation_type`

| Item | Rule |
|------|------|
| Column | **KEEP** `overtime_requests.compensation_type` TEXT (must_keep) — soft key stores catalog `code` — **no** hard FK |
| Default | Keep TEXT default `'salary'` for bootstrap; **FORBIDDEN** restore closed `@IsIn(['salary','compensatory_leave'])` DTO as product ceiling |
| Assert | Create/update `compensation_type` → Nest EFF when active count>0 → invent → **`HRM-ATT-OT-COMP-KEY`** (400) |
| Empty EFF | count=0 → skip invent assert + CTA admin CREATE + hardcode two fallback OK — **no seed** |
| Display | List/EFF expose `code`/`name_vi` — FE **cấm** invent labels when BE provides; detail must not binary-map non-salary → TimeOff when Nest label exists |
| History | Retired (`inactive`/`archived_at`) code still displays on historical TXN (label fallback) — no crash (**BR-PLT-04**) |
| Leave funnel | `compensatory_leave` code **may later cite** leave accrual — **OUT** this seat — **FORBIDDEN** reopen leave L1 / claim funnel LIVE |

---

## 4. F-ATT-CAT-OTC-* capability → physical map (SA §6)

| Cap | API (SA confirmed intent) | Physical touch |
|-----|---------------------------|----------------|
| **F-ATT-CAT-OTC-01** list / effective | `GET /api/hrm/attendance/ot-comp-types` (+ optional `/effective`) — display-ready — default active filter — **cấm** ensureDefault on U65 | §2 read + IX list/effective |
| **F-ATT-CAT-OTC-02** admin create | `POST /api/hrm/attendance/ot-comp-types` — N+1 `code`/`name_vi` | §2 insert + partial UQ |
| **F-ATT-CAT-OTC-02** admin update/retire | `PATCH …/:id` — inactive / soft archive | `status`/`archived_at` |
| Consumer invent | **`createOvertimeRequest`** when EFF>0 → **`HRM-ATT-OT-COMP-KEY`** | assert vs EFF read model §2.5 |
| Settings REF | MD compensation — read only | REF merge-read (no write) |

**DTO map (stub for BE — no apps this seat):**

| Cap | Request (hint) | Response / row fields |
|-----|----------------|----------------------|
| **F-ATT-CAT-OTC-01** | `companyId?`, `include_inactive?` | `id`, `company_id`, `code`, `name_vi`, `name_en?`, `sort_order`, `status`, `archived_at?`, `created_at`, `updated_at` |
| **F-ATT-CAT-OTC-02** POST | `code`, `name_vi`, `name_en?`, `sort_order?` | same row |
| **F-ATT-CAT-OTC-02** PATCH | partial + `status` / soft archive | same row |
| Consumer | `compensation_type: string` on OT create DTO | assert ∈ EFF when count>0 |

**Error map (BA may stamp final):**

| Condition | Code |
|-----------|------|
| EFF>0 → `compensation_type` not in scoped Nest catalog | **`HRM-ATT-OT-COMP-KEY`** (400) |
| OOS get / mutate catalog | **`HRM-ATT-OTC-404`** / scope **`HRM-ATT-OTC-409`** |
| Admin validation (empty code/name, bad format) | **`HRM-ATT-OTC-VAL`** (400) |
| Taxonomy ≠ KEY | 404 / CODE-INVALID / VAL / **`HRM-ATT-OT-TYPE-KEY`** **≠** invent **COMP** KEY |

---

## 5. Validation matrix

### 5.1 Catalog — VAL-ATT-OTC-CAT-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-OTC-CAT-01** | Admin CREATE N+1 open `code` (e.g. `banked_hours`) | L-ATT-OTC-04 · BR-PLT-05 | **2xx** — row visible F5 — **not** closed enum reject |
| **VAL-ATT-OTC-CAT-02** | Duplicate active `(company_id, lower(code))` | Partial UQ | **409** conflict |
| **VAL-ATT-OTC-CAT-03** | `code` bad format (uppercase/space/`time-off`) | Format CHK | **400** `HRM-ATT-OTC-VAL` |
| **VAL-ATT-OTC-CAT-04** | Soft-retire → hide default picker | `status='inactive'`/`archived_at` | inactive hidden — historical TXN refs OK |
| **VAL-ATT-OTC-CAT-05** | Hard-delete with history refs | Forbidden | **4xx/405** — no hard delete |
| **VAL-ATT-OTC-CAT-06** | List vs get-by-id OOS slug | scope_parity U19 | 404/403 — not empty mask — **L-ATT-OTC-11** |
| **VAL-ATT-OTC-CAT-07** | Mutate group REF via OT-comp catalog API | Writer lock | **FORBIDDEN** |
| **VAL-ATT-OTC-CAT-08** | Empty `name_vi` | Name CHK | **400** `HRM-ATT-OTC-VAL` |
| **VAL-ATT-OTC-CAT-09** | Effective active =0 | Empty EFF | **200** `[]` — invent skip + CTA — **no seed** — **AC-PLT-ATT-COMP-01c** |
| **VAL-ATT-OTC-CAT-10** | Closed `@IsIn(2)`/CHECK still present after ensure | DOC-DELTA | jest / migrate assert **FAIL** until DROP/REPLACE |
| **VAL-ATT-OTC-CAT-11** | `metadata_json` only as SoT | Typed columns first | `code`/`name_vi` columns win — meta not SoT |
| **VAL-ATT-OTC-CAT-12** | Synonym second table `att_overtime_comp_type` created | ONE table lock | **FAIL** process — use `att_ot_comp_type` only |

### 5.2 Consumer — VAL-ATT-OTC-CNS-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-OTC-CNS-01** | OT request invent `compensation_type` when catalog >0 | **BR-PLT-02** · **AC-PLT-ATT-COMP-01b** | **400** `HRM-ATT-OT-COMP-KEY` |
| **VAL-ATT-OTC-CNS-02** | List picker scope ≠ assert scope | scope_parity | jest **FAIL** |
| **VAL-ATT-OTC-CNS-03** | Historical TXN with retired type | **BR-PLT-04** | Display label fallback — no crash |
| **VAL-ATT-OTC-CNS-04** | Format-valid code not in effective | Membership required | **4xx** KEY — format ≠ membership |
| **VAL-ATT-OTC-CNS-05** | Detail binary invent non-salary → TimeOff when Nest label exists | **L-ATT-OTC-12** | **FAIL** UX — must use `name_vi` |
| **VAL-ATT-OTC-CNS-06** | Confuse OT-type / day-code / leave-type / shift with compensation | Separate SoTs | Invent other catalog key not pass COMP assert |
| **VAL-ATT-OTC-CNS-07** | Admin CREATE N+1 treated as invent | L-ATT-OTC-01 | Admin **2xx**; invent only on consumer |
| **VAL-ATT-OTC-CNS-08** | Wrong KEY taxonomy (`HRM-ATT-OT-TYPE-KEY` for compensation invent) | L-ATT-OTC-16 | **FAIL** — must be **`HRM-ATT-OT-COMP-KEY`** |

### 5.3 Dual SoT / scope / formula / fold lock

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-OTC-ALS-01** | Group REF + ATT same `code` | effective read | ATT tenant row wins — **BR-PLT-06** |
| **VAL-ATT-OTC-ALS-02** | Settings alone as sole picker SoT | Option A | **REJECT** — Nest EFF required when live |
| **VAL-ATT-OTC-SCP-01** | list → get-by-id → consumer assert | Scope parity U19 | Member **409**/404 on foreign company |
| **VAL-ATT-OTC-FRM-01** | Wave claims payroll OT amount LIVE from compensation catalog | L-ATT-OTC-10 | **FAIL** process — formula HOLD |
| **VAL-ATT-OTC-FLD-01** | Wave folds compensation into `att_ot_type` / shifts / code / leave / worksite | L-ATT-OTC-08 | **FAIL** process — orthogonal OWN |
| **VAL-ATT-OTC-FLD-02** | Wave reopens OT-TYPE KEY / CTR / ATT L1 to «fix» compensation | L-ATT-OTC-09 | **FAIL** process — seals RETAIN |

---

## 6. Traceability

| Requirement | DB | API (SA confirmed) | FE (later) | Test |
|-------------|-----|-------------------|------------|------|
| **AC-PLT-ATT-COMP-01** picker EFF | §2 ADD | **F-ATT-CAT-OTC-01** | OvertimeRequestTab compensation picker | U65 browser |
| **AC-PLT-ATT-COMP-01b** invent | effective keys | consumer assert on `createOvertimeRequest` | OT create form | VAL-ATT-OTC-CNS-01 |
| **AC-PLT-ATT-COMP-01c** empty | §2.5 empty | EFF `[]` | empty + CTA | VAL-ATT-OTC-CAT-09 · U65 |
| **AC-PLT-ATT-COMP-01d** admin N+1 | §2 ADD | **F-ATT-CAT-OTC-02** | Settings / Nest list | VAL-ATT-OTC-CAT-01 |
| **AC-PLT-ATT-COMP-01e** soft-retire | `archived_at` | PATCH inactive | picker hide | VAL-ATT-OTC-CAT-04 |
| **AC-PLT-ATT-COMP-01f** display Nest `name_vi` | `name_vi` | list/EFF | detail/list no binary invent | VAL-ATT-OTC-CNS-05 |
| **AC-PLT-ATT-COMP-01H** honesty | — | — | — | flags false · seals retain |
| **F-ATT-CAT-OTC-01** list/EFF | §2 + IX effective | `GET …/ot-comp-types(/effective)` | picker | VAL-ATT-OTC-ALS-* |
| **F-ATT-CAT-OTC-02** mutate | §2 insert/patch | `POST/PATCH …/ot-comp-types` | Settings admin | VAL-ATT-OTC-CAT-01/04 |
| **BR-PLT-02** consumer FK | consumer keys | EFF assert | — | VAL-ATT-OTC-CNS-* |
| **BR-PLT-04** soft-delete | `archived_at` | retire | — | VAL-ATT-OTC-CAT-04 |
| **BR-PLT-05** open catalog | no enum CHECK | slug format only · DROP closed IsIn | — | VAL-ATT-OTC-CAT-01 · CAT-10 |
| **BR-PLT-06** dual SoT | dual read | EFF-01 | — | VAL-ATT-OTC-ALS-01 |
| scope_parity U19 | `company_id` TEXT | list=get=mutate=assert | deep link J-* (BA enumerates) | VAL-ATT-OTC-SCP-01 · CAT-06 |
| Peer OT-type / code / leave / worksite / shift | RETAIN | own catalogs | — | **FORBIDDEN** reopen · VAL-ATT-OTC-FLD-01/02 |
| Formula seal | no formula columns | display-ready catalog only | — | VAL-ATT-OTC-FRM-01 |
| Invent KEY stamp | — | **`HRM-ATT-OT-COMP-KEY`** | — | VAL-ATT-OTC-CNS-08 |

**scope_parity (U19):** catalog list ↔ get-by-id ↔ mutate ↔ `createOvertimeRequest` assert **must** share `resolveHrmListScope`. Flag `scope_parity` defect when list returns id but detail 404 under group CEO `main`.

---

## 7. DOC-DELTA — client `DB_DESIGN_HRM_ENTERPRISE.md` (ADD-only · no_prompt_echo)

| Action | Content |
|--------|---------|
| **ADD** | §4.5c `att_ot_comp_type` physical — open `code` · `name_vi` · partial UQ `lower(code)` · soft-delete `archived_at` · dual SoT REF — **FORBIDDEN** closed key CHECK — orthogonal to `att_ot_type` |
| **EXPAND** | §4.5 `overtime_requests.compensation_type` — open catalog soft key — validate → EFF when >0 — history may hold retired — **DROP/REPLACE** closed Nest DTO `@IsIn(2)` ceiling if introduced — **KEEP** TEXT column |
| **EXPAND** | §1.1 ER — OT compensation catalog validates OT request compensation |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01` |
| **Cấm** | Wipe OT-type / attendance-code / leave / work-sites / shifts · claim payroll formula LIVE · prompt-echo chat into client prose · fold compensation into `att_ot_type` |

API_DESIGN F-ATT-CAT-OTC-* append = **ba-docs** residual after BA — not blocking DATA CONFIRMED; **BE HOLD** until BA AC pack CONFIRMED.

---

## 8. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-ATT-OTC-01 | AC pack consumer UF/J-* · OvertimeRequestTab enumerate · display-ready wording · formula stays HOLD | **ba-process** BA-01 (parallel UNLOCK) |
| R-PLT-ATT-OTC-02 | ensureSchema ADD `att_ot_comp_type` + Nest F-ATT-CAT-OTC + consumer KEY `HRM-ATT-OT-COMP-KEY` on `createOvertimeRequest` | **dev-be** after **BA+DATA** both CONFIRMED |
| R-PLT-ATT-OTC-03 | FE picker rebind Nest EFF · deprecate hardcode-2 sole SoT when EFF>0 · Nest `name_vi` on detail | **dev-fe** after BE |
| R-PLT-ATT-OTC-04 | Client API DOC-DELTA F-ATT-CAT-OTC/EFF | **ba-docs** |
| R-PLT-ATT-OTC-05 | G≥2 leave-funnel cite from `compensatory_leave` / payroll amount from compensation flags | **separate wave** — **FORBIDDEN** this seat |
| R-PLT-ATT-OTC-06 | Formula LIVE never unlocked by this vertical alone | **HOLD** — peer PAY |

---

## 9. Migration / Dev notes (not this seat)

| Item | Note |
|------|------|
| ensureSchema | ADD `att_ot_comp_type` + partial UQ `lower(code)` + format/name/row-status CHKs + list/effective IX — **omit** closed `code IN ('salary','compensatory_leave')` CHECK — **omit** hard FK on `compensation_type` — **omit** touching `att_ot_type` / leave / code / worksite / shift / aggregate DDL — **omit** second synonym table |
| Feature flag | Catalog empty (0): invent assert **skip** + CTA + hardcode-2 bootstrap OK — when **>0**: Nest EFF mandatory (**BR-PLT-02**) — FE **FORBIDDEN** hardcode sole SoT |
| Builtin ensure | Optional upsert starter keys §2.6 — **not** UF evidence (U65) |
| Nest paths | Under attendance module: `GET/POST/PATCH/retire` `/api/hrm/attendance/ot-comp-types*` + EFF helper — **FORBIDDEN** invent mega `/api/hrm/platform/att/*` EAV |
| Assert | OT request create/update `compensation_type` → Nest EFF when count>0 → **`HRM-ATT-OT-COMP-KEY`** |
| Peer pattern | Mirror `att_ot_type` / `att_attendance_code` ensureSchema style — **separate** table · **do not** ALTER `att_ot_type` for compensation |
| Aggregate / formula | **Do not** change `att-timesheet-line-aggregate.ts` / payroll formula this BE wave |
| Unlock gate | **BA CONFIRMED + this DATA CONFIRMED** → PM may unlock BE — DATA alone **≠** BE start |

---

## 10. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| `payroll_e2e_ready` | **false** — **DENIED** flip |
| `contracts_printable_ready` | **false** — **DENIED** flip |
| Module ATT/PAY UAT / Phase1 | **DENIED** invent — **`C-SLICE-≠-MODULE`** |
| Payroll OT formula LIVE | **DENIED** — compensation catalog ≠ formula engine |
| OT-TYPE KEY LIVE (`att_ot_type`) | **RETAIN** — cấm reopen / fold |
| ATT attendance-code / leave / work-sites / shifts | **RETAIN** — cấm reopen / fold |
| ATT leave-balance / FE LVRULE 01g | **HOLD RETAIN** — DENY invent FE |
| CTR template/clause KEY · EMP / SI / PAY / DEC / MergeToken | **RETAIN** |
| `att-timesheet-line-aggregate` / LIST-TOTALS counting code | **RETAIN** sealed G≥1 |
| Seed | **DENIED** (U65) |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-data-01.md` |
| **next_owner** | **pm** — hold **dev-be** until parallel **BA-01 CONFIRMED**; then unlock `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01` |
| **completion_report** | CONFIRMED physical ADD `public.att_ot_comp_type` (open `code`, `name_vi`, partial UQ `lower(code)`, soft-delete `archived_at`, ICatalogRow, F-ATT-CAT-OTC-01/02 + effective IX, invent KEY `HRM-ATT-OT-COMP-KEY`, VAL-ATT-OTC-CAT/CNS/ALS/SCP/FRM/FLD); KEEP `overtime_requests.compensation_type` TEXT soft-key; FORBIDDEN mega-EAV / fold into `att_ot_type`/work_shifts/leave/day-code / rewrite aggregate/payroll formula / wipe OT-TYPE·CTR·ATT L1 seals / seed / flip ready; DOC-DELTA DB §4.5c + §4.5; closes R-PLT-DATA-04 OT-compensation slice; honesty false; seals RETAIN; no apps/**; BE unlock HOLD until BA also CONFIRMED. |
| **next_dispatch_prompt** | `Task pm — after BA also CONFIRMED on PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01: Task dev-be work_item_id PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01. Read DATA-01 §2→§4 + SA L-ATT-OTC-01..16 + BA AC-PLT-ATT-COMP-01*. ensureSchema ADD public.att_ot_comp_type (ICatalogRow + partial UQ lower(code) + format/name/row-status CHKs + list/effective IX); KEEP overtime_requests.compensation_type TEXT soft key; Nest F-ATT-CAT-OTC-01/02 + EFF + consumer invent KEY HRM-ATT-OT-COMP-KEY on createOvertimeRequest when EFF>0; soft-delete inactive/archived_at; scope_parity U19; empty EFF soft skip + no seed. FORBIDDEN: fold into att_ot_type/work_shifts/att_leave_type/att_attendance_code/attendance_work_sites; reopen OT-TYPE KEY / CTR / ATT L1; payroll formula LIVE / flip payroll_e2e_ready; rewrite att-timesheet-line-aggregate; mega-EAV; seed. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-be-01.md. U65. If BA not yet CONFIRMED: HOLD BE — do not dispatch.` |