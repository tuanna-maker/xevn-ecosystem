# PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01 — Physical DB — OT-type (loại tăng ca) open catalog

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01` **Option B CONFIRMED** — Nest **ABSENT** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `public.att_ot_type` (DEFINE) · **DOC-DELTA** client DB (OT-type catalog note) · **NO CODE** `apps/**` · **no migrate execute** · **no seed** · **no wipe** ATT leave / work-sites / attendance-code / work_shifts · **no** fold OT into shifts/code/leave/worksite · **no** rewrite `att-timesheet-line-aggregate` / payroll formula |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — physical ADD per SA Option B §4→§6 · F-ATT-CAT-OT-* |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01` **CONFIRMED Option B LOCKED** · parallel `…-OT-TYPE-CATALOG-BA-01` **in flight** (BE unlock **HOLD** until BA **also** CONFIRMED) |
| **peer_retain** | `ATT-CODE-CATALOG-DATA-01` `att_attendance_code` **RETAIN** · `ATT-WORKSITE-CATALOG-DATA-01` **RETAIN** · `ATT-DATA-01` `att_leave_type` **RETAIN** · **FORBIDDEN** fold OT type into leave / work-sites / day-code / shifts |
| **ref_sa** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md` Option B · L-ATT-OT-01..15 · F-ATT-CAT-OT-01/02 · AC-PLT-ATT-OT-01* · `HRM-ATT-OT-TYPE-KEY` |
| **ref_peer_att_code** | `ATT-CODE-CATALOG-DATA-01` — closest structural peer (DEFINE new Nest attendance catalog + open `code` + soft-delete + ICatalogRow) — **separate** table |
| **ref_peer_emp_status** | `EMP-STATUS-CATALOG-DATA-01` — Nest-ABSENT DEFINE pattern (typed flags stay catalog metadata; semantics stay code) |
| **ref_platform** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` `ICatalogRow` · R-PLT-DATA-04 |
| **ref_adr** | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM` Option B · L1 Catalog · L6 soft-delete · Q-PLT-03 mega-EAV DENY · `ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804` **D4** OT-type sidebar stub |
| **ref_db_client** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.5/§4.5b `overtime_requests` — OT-type catalog note ADD |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · **DENIED** invent module ATT/PAY UAT · **DENIED** claim `default_coeff` = payroll formula LIVE · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | `overtime_requests.overtime_type` TEXT column (soft key) · `overtime_requests` TXN LIVE (create/approve/delete) · `att_attendance_code` · `att_leave_type` · `attendance_work_sites` · `work_shifts` ops · soft-delete class · scope TEXT slug · open catalog (no closed weekday/weekend/holiday enum ceiling) · display-ready `name_vi`/`default_coeff` · `att-timesheet-line-aggregate` + payroll LIST-TOTALS counting code G≥1 sealed · CTR KEY / ATT L1 / FE LVRULE 01g HOLD RETAIN |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical table | **CONFIRMED ADD** `public.att_ot_type` — **ABSENT AS-IS** Nest (SA §4.3 probe: no CREATE / no service / no admin CRUD; only TXN `overtime-requests`) |
| Platform pattern | Option B **`ICatalogRow`** on domain table — **not** mega-EAV — **not** fold into `att_attendance_code` / `att_leave_type` / `attendance_work_sites` / `work_shifts` — **not** Settings/D4 stub sole SoT |
| Open catalog | **`code`** format-only CHK — **FORBIDDEN** closed enum CHECK / DTO `@IsIn(['weekday','weekend','holiday'])` product ceiling (starter three = bootstrap ≠ ceiling — **BR-PLT-05**) |
| `default_coeff` | Physical numeric column **display-ready default only** — FE may prefill, TXN may override — **FORBIDDEN** claim = payroll formula engine LIVE (**L-ATT-OT-10**) |
| Dual SoT | Future Settings/XBOS OT codes / D4 sidebar stub = group **REF** merge-read only — tenant Nest writer **wins** (**BR-PLT-06** · L-ATT-OT-03) — Settings **≠** sole producer |
| Soft-delete | `status='inactive'` + `archived_at` — history `overtime_requests` may keep retired types (**BR-PLT-04** · L-ATT-OT-07) |
| Consumer column | **KEEP** `overtime_requests.overtime_type` **text** soft key; drop closed FE hardcode-3 as sole SoT when EFF>0; validate → EFF when active count>0 → **`HRM-ATT-OT-TYPE-KEY`** (400) |
| Peer catalogs | attendance-code / leave / work-sites / shifts **RETAIN** — **FORBIDDEN** wipe / reopen / fold |
| Seals | CTR template/clause KEY · ATT leave-balance / LVRULE 01g HOLD · ATT-CODE / WS / SHIFT / leave L1 · EMP / SI / PAY / DEC / MergeToken **RETAIN** |
| Dev this seat | **NO** `apps/**` · **NO** migrate execute · **NO** seed UF |
| Closes | **R-PLT-DATA-04** ATT **OT-type** catalog slice (leave / work-sites / attendance-code slices remain CLOSED separately) |
| Honesty | **remain false** — attendance / payroll / module ATT-PAY UAT **not** flipped · formula **HOLD** |
| BE unlock | **HOLD** — this DATA **CONFIRMED** · parallel **BA-01** must also **CONFIRMED** before PM unlocks BE |

---

## 2. ADD `public.att_ot_type`

### 2.1 Columns (`ICatalogRow` + OT default-coeff metadata)

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — same `resolveHrmListScope` (**U19**) |
| `code` | text | NO | | Open catalog OT-type key — format `^[a-z][a-z0-9_]*$`; assert normalize `lower(code)`; stores consumer `overtime_requests.overtime_type` value (starter `weekday`/`weekend`/`holiday`, open N+1 e.g. `night`, `comp_time`) |
| `name_vi` | text | NO | | UI label (display-ready) e.g. "Tăng ca ngày thường" / "Tăng ca ngày lễ" |
| `name_en` | text | YES | NULL | Optional English label — display only |
| `default_coeff` | numeric(6,2) | NO | 1 | **Display-ready default hệ số** (≥0) — FE prefill, TXN override optional — **≠ payroll formula LIVE** (see §2.3 · L-ATT-OT-10) |
| `sort_order` | int | NO | 100 | Picker / Settings tab order |
| `color` | text | YES | NULL | Optional badge/UI hint (hex or token) — not SoT |
| `metadata_json` | jsonb | YES | NULL | Optional hints — **not** mega-EAV SoT — **not** replace typed columns |
| `status` | text | NO | `'active'` | Row lifecycle `active` \| `inactive` (**≠** OT-type `code`) |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

**Note:** `default_coeff` là **catalog metadata** cho prefill hiển thị + wiring G≥2 (payroll formula). **FORBIDDEN** claim seat DATA này wire payroll amount engine LIVE hoặc flip `payroll_e2e_ready` (**L-ATT-OT-10**). Công thức tính lương tăng ca vẫn **HOLD** — sealed code G≥1.

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(code)) WHERE archived_at IS NULL` — one active OT-type per (company, code) |
| **IX list** | `(company_id, status)` · `(company_id, sort_order)` |
| **IX effective** | `(company_id) WHERE archived_at IS NULL AND status = 'active'` — **F-ATT-CAT-OT-01** effective resolution |
| **CHK `chk_att_ot_type_code_format`** | `code ~ '^[a-z][a-z0-9_]*$'` — **format only** |
| **CHK `chk_att_ot_type_name_vi`** | `char_length(trim(name_vi)) BETWEEN 1 AND 128` — display label |
| **CHK `chk_att_ot_type_default_coeff`** | `default_coeff >= 0` — range guard; BA may widen/cap later — **not** formula assertion |
| **CHK `chk_att_ot_type_row_status`** | `status IN ('active','inactive')` |
| **FORBIDDEN** | `CHECK (code IN ('weekday','weekend','holiday'))` / restore Nest DTO `@IsIn(3)` as product ceiling · hard-delete when `overtime_requests` history references type · mega-EAV · fold into `att_attendance_code` / `att_leave_type` / `attendance_work_sites` / `work_shifts` · UNIQUE `default_coeff` (coeff not a key) |

### 2.3 `default_coeff` — display-ready default, NOT formula (cite ≠ formula)

| Aspect | Rule this seat |
|--------|----------------|
| Nghĩa | Hệ số mặc định gợi ý cho từng loại OT (bootstrap `weekday`≈1.5, `weekend`≈2.0, `holiday`≈3.0 — **ví dụ**, không phải trần) |
| FE dùng | Prefill `coefficient` field khi tạo OT request từ catalog — **override được** trên TXN |
| Payroll | Formula engine tính tiền OT **HOLD** — có thể tham chiếu `default_coeff` sau (G≥2) — **FORBIDDEN** claim LIVE / flip `payroll_e2e_ready` seat này |
| Lock | **L-ATT-OT-10** — `default_coeff` là catalog metadata display-ready; **DENIED** = payroll formula LIVE |

### 2.4 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `code` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | `default_coeff` + `name_en` + `sort_order` + `color` (+ optional `metadata_json`) |
| `catalog_kind` | `att_ot_type` (adapter constant) |

### 2.5 Dual SoT — effective OT-type catalog (read model)

```text
  (future) Settings/XBOS OT codes + D4 "Tăng ca" sidebar stub  --> group REF merge-read only (Option A REJECT as sole)
           |
  F-ATT-CAT-OT CRUD --> public.att_ot_type (code SoT)  [ADD physical DEFINE]
           |
           v
  F-ATT-CAT-OT-01 list / effective --> picker code / name_vi / default_coeff
           |  (ATT tenant row wins on same code)
           v
  Consumers (when active EFF count > 0):
    OvertimeRequestTab create + BA-listed OT mutate --> overtime_requests.overtime_type in catalog
           |
  invent overtime_type --> HRM-ATT-OT-TYPE-KEY (400)
  empty EFF (0) --> soft skip invent + CTA admin CREATE --> no seed --> hardcode three fallback only
  work_shifts / day-code / leave / worksite / CTR / FE LVRULE / payroll formula --> OUT
```

### 2.6 Builtin bootstrap keys (optional ensure — NOT seed, NOT UF evidence)

| `code` | `name_vi` | `default_coeff` (ví dụ) | Note |
|--------|-----------|-------------------------|------|
| `weekday` | Tăng ca ngày thường | 1.5 | Bootstrap example — admin may edit/retire |
| `weekend` | Tăng ca ngày nghỉ | 2.0 | Bootstrap example |
| `holiday` | Tăng ca ngày lễ | 3.0 | Bootstrap example |

**Clarify:** starter three = bootstrap fallback (`BR-PLT-05`) khi EFF=0 — **≠** ceiling. Không dùng làm UF density evidence (U65). Admin CREATE N+1 mở (`night`, `comp_time`, …).

---

## 3. Consumer surface — `overtime_requests.overtime_type`

| Item | Rule |
|------|------|
| Column | **KEEP** `overtime_requests.overtime_type` TEXT NOT NULL (must_keep) — soft key stores catalog `code` |
| Default | Keep TEXT default `'weekday'` for bootstrap; **FORBIDDEN** restore closed `@IsIn(['weekday','weekend','holiday'])` DTO as product ceiling |
| Assert | Create/update `overtime_type` → Nest EFF when active count>0 → invent → **`HRM-ATT-OT-TYPE-KEY`** (400) |
| Empty EFF | count=0 → skip invent assert + CTA admin CREATE + hardcode three fallback OK — **no seed** |
| Coefficient | TXN `coefficient` field may prefill from catalog `default_coeff`; override allowed; **not** formula LIVE |
| History | Retired (`inactive`/`archived_at`) type still displays on historical TXN (label/coeff fallback) — no crash (**BR-PLT-04**) |

---

## 4. F-ATT-CAT-OT-* capability → physical map (SA §6)

| Cap | API (SA confirmed intent) | Physical touch |
|-----|---------------------------|----------------|
| **F-ATT-CAT-OT-01** list / effective | `GET /api/hrm/attendance/ot-types` (+ optional `/effective`) — display-ready — default active filter — **cấm** ensureDefault on U65 | §2 read + IX list/effective |
| **F-ATT-CAT-OT-02** admin create | `POST /api/hrm/attendance/ot-types` — N+1 `code`/`name_vi`/`default_coeff` | §2 insert + partial UQ |
| **F-ATT-CAT-OT-02** admin update/retire | `PATCH …/:id` — inactive / soft archive | `status`/`archived_at` |
| Consumer invent | OT create/update `overtime_type` when EFF>0 → **`HRM-ATT-OT-TYPE-KEY`** | assert vs EFF read model §2.5 |
| Settings REF | D4 stub / MD OT codes read only | REF merge-read (no write) |

**Error map (BA may stamp final):**

| Condition | Code |
|-----------|------|
| EFF>0 → `overtime_type` not in scoped Nest catalog | **`HRM-ATT-OT-TYPE-KEY`** (400) |
| OOS get / mutate catalog | **`HRM-ATT-OT-404`** / scope **`HRM-ATT-OT-409`** |
| Admin validation (empty code/name, bad coeff/format) | **`HRM-ATT-OT-VAL`** (400) |

---

## 5. Validation matrix

### 5.1 Catalog — VAL-ATT-OT-CAT-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-OT-CAT-01** | Admin CREATE N+1 open `code` (e.g. `comp_time`) | L-ATT-OT-04 · BR-PLT-05 | **2xx** — row visible F5 — **not** closed enum reject |
| **VAL-ATT-OT-CAT-02** | Duplicate active `(company_id, lower(code))` | Partial UQ | **409** conflict |
| **VAL-ATT-OT-CAT-03** | `code` bad format (uppercase/space) | Format CHK | **400** `HRM-ATT-OT-VAL` |
| **VAL-ATT-OT-CAT-04** | Soft-retire → hide default picker | `status='inactive'`/`archived_at` | inactive hidden — historical TXN refs OK |
| **VAL-ATT-OT-CAT-05** | Hard-delete with history refs | Forbidden | **4xx/405** — no hard delete |
| **VAL-ATT-OT-CAT-06** | List vs get-by-id OOS slug | scope_parity U19 | 404/403 — not empty mask — **L-ATT-OT-11** |
| **VAL-ATT-OT-CAT-07** | Mutate group REF via OT catalog API | Writer lock | **FORBIDDEN** |
| **VAL-ATT-OT-CAT-08** | `default_coeff` < 0 | Range CHK | **400** |
| **VAL-ATT-OT-CAT-09** | Effective active =0 | Empty EFF | **200** `[]` — invent skip + CTA — **no seed** — **AC-PLT-ATT-OT-01c** |
| **VAL-ATT-OT-CAT-10** | Closed `@IsIn(3)`/CHECK still present after ensure | DOC-DELTA | jest / migrate assert **FAIL** until DROP/REPLACE |
| **VAL-ATT-OT-CAT-11** | `metadata_json` only as SoT | Typed columns first | `default_coeff`/`code` columns win — meta not SoT |

### 5.2 Consumer — VAL-ATT-OT-CNS-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-OT-CNS-01** | OT request invent `overtime_type` when catalog >0 | **BR-PLT-02** · **AC-PLT-ATT-OT-01b** | **400** `HRM-ATT-OT-TYPE-KEY` |
| **VAL-ATT-OT-CNS-02** | List picker scope ≠ assert scope | scope_parity | jest **FAIL** |
| **VAL-ATT-OT-CNS-03** | Historical TXN with retired type | **BR-PLT-04** | Display label/coeff fallback — no crash |
| **VAL-ATT-OT-CNS-04** | Format-valid code not in effective | Membership required | **4xx** KEY — format ≠ membership |
| **VAL-ATT-OT-CNS-05** | Prefill `coefficient` from `default_coeff`, then override | Display-ready | **2xx** — TXN override stored — no formula claim |
| **VAL-ATT-OT-CNS-06** | Confuse day-code / leave-type / shift with OT-type | Separate SoTs | Invent other catalog key not pass OT-type assert |
| **VAL-ATT-OT-CNS-07** | Admin CREATE N+1 treated as invent | L-ATT-OT-01 | Admin **2xx**; invent only on consumer |

### 5.3 Dual SoT / scope / formula lock

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-OT-ALS-01** | Group REF + ATT same `code` | effective read | ATT tenant row wins — **BR-PLT-06** |
| **VAL-ATT-OT-ALS-02** | Settings/D4 stub alone as sole picker SoT | Option A | **REJECT** — Nest EFF required when live |
| **VAL-ATT-OT-SCP-01** | list → get-by-id → consumer assert | Scope parity U19 | Member **409**/404 on foreign company |
| **VAL-ATT-OT-FRM-01** | Wave claims payroll OT amount LIVE from `default_coeff` | L-ATT-OT-10 | **FAIL** process — formula HOLD / G≥2 residual only |
| **VAL-ATT-OT-FLD-01** | Wave folds OT type into shifts/code/leave/worksite | L-ATT-OT-08 | **FAIL** process — orthogonal OWN |

---

## 6. Traceability

| Requirement | DB | API (SA confirmed) | FE (later) | Test |
|-------------|-----|-------------------|------------|------|
| **AC-PLT-ATT-OT-01** picker EFF | §2 ADD | **F-ATT-CAT-OT-01** | OvertimeRequestTab type picker | U65 browser |
| **AC-PLT-ATT-OT-01b** invent | effective keys | consumer assert | OT create form | VAL-ATT-OT-CNS-01 |
| **AC-PLT-ATT-OT-01c** empty | §2.5 empty | EFF `[]` | empty + CTA | VAL-ATT-OT-CAT-09 · U65 |
| **AC-PLT-ATT-OT-01d** admin N+1 | §2 ADD | **F-ATT-CAT-OT-02** | Settings / Nest list | VAL-ATT-OT-CAT-01 |
| **AC-PLT-ATT-OT-01e** soft-retire | `archived_at` | PATCH inactive | picker hide | VAL-ATT-OT-CAT-04 |
| **AC-PLT-ATT-OT-01f** coeff prefill | `default_coeff` | list/EFF | prefill + override | VAL-ATT-OT-CNS-05 · FRM-01 |
| **AC-PLT-ATT-OT-01H** honesty | — | — | — | flags false · seals retain |
| **F-ATT-CAT-OT-01** list/EFF | §2 + IX effective | `GET …/ot-types(/effective)` | picker | VAL-ATT-OT-ALS-* |
| **F-ATT-CAT-OT-02** mutate | §2 insert/patch | `POST/PATCH …/ot-types` | Settings admin | VAL-ATT-OT-CAT-01/04 |
| **BR-PLT-02** consumer FK | consumer keys | EFF assert | — | VAL-ATT-OT-CNS-* |
| **BR-PLT-04** soft-delete | `archived_at` | retire | — | VAL-ATT-OT-CAT-04 |
| **BR-PLT-05** open catalog | no enum CHECK | slug format only · DROP closed IsIn | — | VAL-ATT-OT-CAT-01 · CAT-10 |
| **BR-PLT-06** dual SoT | dual read | EFF-01 | — | VAL-ATT-OT-ALS-01 |
| scope_parity U19 | `company_id` TEXT | list=get=mutate=assert | deep link J-* | VAL-ATT-OT-SCP-01 · CAT-06 |
| Peer code/leave/worksite/shift | RETAIN | own catalogs | — | **FORBIDDEN** reopen · VAL-ATT-OT-FLD-01 |
| Formula seal | `default_coeff` metadata only | display-ready | — | VAL-ATT-OT-FRM-01 |

---

## 7. DOC-DELTA — client `DB_DESIGN_HRM_ENTERPRISE.md` (ADD-only · no_prompt_echo)

| Action | Content |
|--------|---------|
| **ADD** | §4.5b `att_ot_type` physical — open `code` · `name_vi` · `default_coeff` display-ready · partial UQ `lower(code)` · soft-delete `archived_at` · dual SoT REF — **FORBIDDEN** closed key CHECK |
| **EXPAND** | §4.5 `overtime_requests.overtime_type` — open catalog key — validate → EFF when >0 — history may hold retired — **DROP/REPLACE** closed Nest DTO `@IsIn` ceiling |
| **EXPAND** | §1.1 ER — OT-type catalog validates OT request type |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01` |
| **Cấm** | Wipe attendance-code / leave / work-sites / shifts · claim payroll formula LIVE · prompt-echo chat into client prose |

API_DESIGN F-ATT-CAT-OT-* append = **ba-docs** residual after BA — not blocking DATA CONFIRMED; **BE HOLD** until BA AC pack CONFIRMED.

---

## 8. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-ATT-OT-01 | AC pack consumer UF/J-* · OvertimeRequestTab enumerate · coeff prefill wording · formula stays HOLD | **ba-process** BA-01 (parallel in flight) |
| R-PLT-ATT-OT-02 | ensureSchema ADD `att_ot_type` + DROP closed `overtime_type` DTO `@IsIn` + Nest F-ATT-CAT-OT + consumer KEY `HRM-ATT-OT-TYPE-KEY` | **dev-be** after **BA+DATA** both CONFIRMED |
| R-PLT-ATT-OT-03 | FE picker rebind Nest EFF · deprecate hardcode-3 sole SoT when EFF>0 · prefill `default_coeff` | **dev-fe** after BE |
| R-PLT-ATT-OT-04 | Client API DOC-DELTA F-ATT-CAT-OT/EFF | **ba-docs** |
| R-PLT-ATT-OT-05 | G≥2 wire `default_coeff` into payroll OT amount / `att-timesheet-line-aggregate` | **separate wave** — **FORBIDDEN** this seat |

---

## 9. Migration / Dev notes (not this seat)

| Item | Note |
|------|------|
| ensureSchema | ADD `att_ot_type` + partial UQ `lower(code)` + format/name/coeff/row-status CHKs + effective IX — **omit** closed `code IN ('weekday','weekend','holiday')` CHECK — **DROP/REPLACE** closed `overtime_type` DTO `@IsIn` ceiling — **omit** hard FK on `overtime_type` — **omit** touching leave/code/worksite/shift/aggregate DDL |
| Feature flag | Catalog empty (0): invent assert **skip** + CTA + hardcode-3 bootstrap OK — when **>0**: Nest EFF mandatory (**BR-PLT-02**) — FE **FORBIDDEN** hardcode sole SoT |
| Builtin ensure | Optional upsert starter keys §2.6 — **not** UF evidence (U65) |
| Nest paths | Under attendance module: `GET/POST/PATCH/retire` `/api/hrm/attendance/ot-types*` + EFF helper — **FORBIDDEN** invent mega `/api/hrm/platform/att/*` EAV |
| Assert | OT request create/update `overtime_type` → Nest EFF when count>0 |
| Peer pattern | Mirror `att_attendance_code` / `emp_employment_status` ensureSchema style — **separate** table |
| Aggregate / formula | **Do not** change `att-timesheet-line-aggregate.ts` / payroll formula this BE wave unless separate G≥2 warrant |
| Unlock gate | **BA CONFIRMED + this DATA CONFIRMED** → PM may unlock BE — DATA alone **≠** BE start |

---

## 10. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| `payroll_e2e_ready` | **false** — **DENIED** flip |
| `contracts_printable_ready` | **false** — **DENIED** flip |
| Module ATT/PAY UAT / Phase1 | **DENIED** invent — **`C-SLICE-≠-MODULE`** |
| Payroll OT formula LIVE | **DENIED** — `default_coeff` = display-ready metadata only |
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
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-data-01.md` |
| **next_owner** | **pm** — hold **dev-be** until parallel **BA-01 CONFIRMED**; then unlock `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01` |
| **completion_report** | CONFIRMED physical ADD `public.att_ot_type` (open `code`, `name_vi`, `default_coeff` display-ready ≠ formula, partial UQ `lower(code)`, soft-delete `archived_at`, ICatalogRow, F-ATT-CAT-OT-01/02 + effective IX, invent KEY `HRM-ATT-OT-TYPE-KEY`, VAL-ATT-OT-CAT/CNS/ALS/SCP/FRM/FLD); KEEP `overtime_requests.overtime_type` soft-key + DROP/REPLACE closed DTO `@IsIn` ceiling; FORBIDDEN mega-EAV / fold OT into code/leave/worksite/shifts / rewrite aggregate/payroll formula / wipe EMP/ATT/SI/CTR seals / seed / flip ready; DOC-DELTA DB §4.5b + §4.5; closes R-PLT-DATA-04 OT-type slice; honesty false; seals RETAIN; no apps/**; BE unlock HOLD until BA also CONFIRMED. |
| **next_dispatch_prompt** | `Task pm — after BA also CONFIRMED on PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01: Task dev-be work_item_id PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01. Read DATA-01 §2→§4 + SA L-ATT-OT-01..15 + BA AC-PLT-ATT-OT-01*. ensureSchema ADD public.att_ot_type (ICatalogRow + default_coeff numeric + partial UQ lower(code) + format/name/coeff CHKs + effective IX); DROP/REPLACE closed overtime_requests.overtime_type DTO @IsIn ceiling; Nest F-ATT-CAT-OT-01/02 + EFF + consumer KEY HRM-ATT-OT-TYPE-KEY when EFF>0; soft-delete inactive/archived_at; scope_parity U19; empty EFF soft skip + no seed. FORBIDDEN: payroll OT formula LIVE / flip payroll_e2e_ready; fold OT into att_attendance_code/att_leave_type/attendance_work_sites/work_shifts; rewrite att-timesheet-line-aggregate; reopen EMP/SI/CTR/ATT L1 seals; mega-EAV. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-be-01.md. U65. If BA not yet CONFIRMED: HOLD BE — do not dispatch.` |