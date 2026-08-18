# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P2 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-01-R2` **READY_FOR_QA** agent `b1c142df-db3f-4005-8705-e8b66a9692fd` |
| **ref_sa** | SA Option **A LOCKED** · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-FE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-FE-SA-01.md) |
| **ref_fe** | [`po-hrm-dynamic-config-platform-emp-position-catalog-fe-01.md`](po-hrm-dynamic-config-platform-emp-position-catalog-fe-01.md) EV_LEN≥8914 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · `:5173` |
| **Stamp** | **`EMPPOSQAFE-MSKEVN7E`** |
| **stamp_l1 RETAIN** | **`EMPPOSQA2-MSK3CDH1`** · invent → **400 `HRM-EMP-POSITION-KEY`** LIVE |
| **U65** | zero-seed · **browser** FE click path · invent API spot ≠ UF 🟢 alone · **no wipe** EFF |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-STATUS FE CLOSED RETAIN · EMP-CUSTOM / ATT / LVRULE HOLD · Nest emp_position DENY · **`C-SLICE-≠-MODULE`** |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** — **R-PLT-EMP-POS-FE-01 OPEN** |
| **condition_verify** | **R-PLT-EMP-POS-FE-01** → **OPEN** · Edit+Create position CatalogSearchPicker **ABSENT** (`hasBasicField('position')` false) · cannot AC-01 Lưu `job_title_key` ∈ EFF |
| **change_mode** | ADD verify · no `apps/**` product edit · no seed · no ready flip · **FORBIDDEN** reopen EMP-STATUS FE CLOSED · Nest emp_position · invent LVRULE/EMP-ST FE-ADMIN · module EMP UAT |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Vitest | `empPositionCatalog.test.ts` **7/7** exit **0** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-01-browser.json` |
| Form diag | `docs/qa/evidence/_tmp-po-hrm-emp-position-form-diag.json` · `scripts/qa/_tmp-po-hrm-emp-position-form-diag.mjs` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-01/` |
| FE parent | FE-01-R2 READY_FOR_QA |
| L1 QA | stamp **`EMPPOSQA2-MSK3CDH1`** RETAIN |

**spec_ref:** AC-PLT-EMP-01 / 01b / 01c · VAL-EMP-POS-CNS-* · HDSD CH06f · R-PLT-EMP-POS-FE-01 · KEY `HRM-EMP-POSITION-KEY` ≡ `HRM-WH-PICK-REQUIRED`

**Seed:** none · **ensureDefault:** none · **Nest emp_position:** DENIED.

**Target employee:** `0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` · `Nguyễn Văn QA M3 987275` · `job_title_key=(none)`  
**STAFF OBS row:** `0500220b-…` · `job_title_key=STAFF`

---

## 2. Click path (U65 · HDSD CH06f)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | Settings `job_titles` EFF | **total=8** codes=`CEO,CHRO,DRIVER_LEAD,OPS_MANAGER,POS_01..04` · **200** (L1 LIVE · no seed) |
| 2 | Invent API spot | PATCH invent `job_title_key=zz_invent_emp_pos_mskevn7e` → **400 `HRM-EMP-POSITION-KEY`** · no persist · L1 **RETAIN** |
| 3 | Nest emp_position DENY | GET `/employees/emp-positions*` → **400/404** · src route file **ABSENT** |
| 4 | Seals smoke | attendance-codes **200**/1 · ot-types **200**/1 · emp-st **200**/4 · EMP-STATUS FE **CLOSED RETAIN** |
| 5 | **HRM → Nhân sự / Employees** | `/hr/employees?portal=1&companyId=main` · no Sync ERROR |
| 6 | Row ⋯ → **Sửa** Edit dialog | `hdsd-employee-form-dialog` opened |
| 7 | Position CatalogSearchPicker | **ABSENT** — labels only `Mã NV *` · `Họ và tên *` · `Quản lý trực tiếp` · `Trạng thái` (+ custom CF) · **no** `Vị trí` / job_titles picker · combobox count=2 (manager + status) |
| 8 | **Thêm** Create dialog | same ABSENT — no position combobox · **FAIL** AC-01 Create |
| 9 | STAFF OBS invent | PATCH STAFF emp invent → **400 `HRM-EMP-POSITION-KEY`** · EMP-STATUS FE **not** reopened |
| 10 | EFF=0 branch | **NOTE_BLOCKED** — EFF=8; unit cite empty CTA `HRM-WH-PICK-EMPTY-CATALOG` |
| 11 | WH picker spot | surface soft OBS — primary form ABSENT blocks AC-01 |

**HDSD / testids:** `hdsd-employees-create-btn` · `hdsd-employee-form-dialog` · `hdsd-employee-form-submit` · `emp-employment-status-select` PRESENT · **position CatalogSearchPicker ABSENT** (no dedicated testid when field gated off)

**Screens:** `01-employees-list` · `02-edit-dialog` · `05-after-save` · `06-f5-list` · `08-staff-obs-edit` · `09-work-timeline` · `10-create-dialog`

---

## 3. UF matrix (dispatch)

| UF | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **1 L0 + vitest 7** | stack 200 · 7 tests | 200/200/200 · **7/7** | 🟢 |
| **2 AC-PLT-EMP-01 picker ∈ EFF** | Edit CatalogSearchPicker options ∩ job_titles EFF | **ABSENT** — `hasBasicField('position')` false | 🔴 |
| **3 AC-PLT-EMP-01 Lưu + FE+F5** | PATCH `job_title_key` ∈ EFF 2xx · F5 retain | blocked — no picker; PATCH body lacked job_title_key | 🔴 |
| **4 AC-PLT-EMP-01 Create** | Create picker mounts | Create labels omit Vị trí | 🔴 |
| **5 AC-PLT-EMP-01b invent KEY** | 400 POSITION-KEY + no persist (+ VI toast when picker path) | API **400 KEY** · no persist · UI toast N/A (field ABSENT) · Select-only OBS | 🟡 API / 🔴 FE path |
| **6 AC-PLT-EMP-01c EFF=0** | empty CTA CH06f | NOTE_BLOCKED (EFF=8) · unit cite | 🟡 |
| **7 STAFF OBS closable** | KEY owned here · no reopen EMP-STATUS FE | invent **400 KEY** · EMP-STATUS FE CLOSED RETAIN | 🟢 |
| **8 Nest emp_position DENY** | 404/absent | 400/404 · no src route | 🟢 |

---

## 4. Root cause (FAIL)

**Class:** same gate as prior EMP-STATUS QA-FE-01 (`hasBasicField` omit) — peer FE-02 forced required set.

`EmployeeFormDialog` uses:

```text
buildActiveFieldSet(basicFieldsCatalog, DEFAULT_BASIC_FIELDS, ['employee_code', 'full_name', 'status'])
```

Because `required` always adds ≥3 keys, `configured.size > 0` is always true → **DEFAULT_BASIC_FIELDS (incl. `position` / `department`) never apply** when Settings `hrm_employee_basic_fields` is empty/omits `position`.

**Live DOM (Edit + Create):** labels = Mã NV · Họ và tên · Quản lý · Trạng thái · EMP-CUSTOM fields — **no Vị trí CatalogSearchPicker**.

FE-01-R2 correctly added KEY toast + `job_title_key` SoT helpers (**vitest 7 PASS**), but **consumer picker does not mount** → AC-PLT-EMP-01 cannot close.

**spec says / code does:**

- *spec says:* EFF>0 → EmployeeFormDialog + WH position picker ∈ Settings job_titles EFF → Lưu → 2xx → F5.
- *code does:* helpers LIVE · L1 KEY LIVE · **form field gated off** by basic_fields required short-circuit → picker ABSENT.

---

## 5. Spot AC / network stamps

```text
GET  /api/hrm/settings-catalogs/job_titles/items?company_id=main
  → 200  active=8  CEO,CHRO,DRIVER_LEAD,OPS_MANAGER,POS_01..04

PATCH /api/hrm/employees/0f6e1369-…
  body: { "job_title_key": "zz_invent_emp_pos_mskevn7e" }
  → 400 HRM-EMP-POSITION-KEY
  GET after → job_title_key=(none)  persisted=false
  (L1 EMPPOSQA2-MSK3CDH1 RETAIN)

GET  /api/hrm/employees/emp-positions* → 400/404 (Nest DENY)
GET  /api/hrm/attendance/attendance-codes/effective → 200 total=1
GET  /api/hrm/employees/employment-statuses/effective → 200 total=4

Browser FE Lưu (no position field):
  PATCH … body { status, full_name } → 200 HRM-EMP-202  (no job_title_key)
```

| ID | Verdict |
|----|---------|
| L0 | 🟢 |
| Vitest 7 | 🟢 |
| EFF job_titles>0 | 🟢 |
| Invent KEY + no persist | 🟢 |
| Nest DENY | 🟢 |
| Seals / EMP-STATUS FE CLOSED | 🟢 |
| AC-01 Edit picker ∈ EFF | 🔴 ABSENT |
| AC-01 Submit job_title_key | 🔴 |
| AC-01 F5 | 🔴 |
| AC-01 Create picker | 🔴 |
| AC-01b UI toast path | 🟡 blocked by ABSENT · API KEY 🟢 |
| AC-01c EFF=0 | 🟡 NOTE_BLOCKED |
| STAFF OBS / no EMP-STATUS reopen | 🟢 |
| Console / 5xx | 🟢 pageErrors=0 bad5xx=0 |

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`hrm_personnel_uat_ready`** | **`false`** — **DENIED** flip |
| **`employees_e2e_linkage_ready`** | **`false`** — **DENIED** flip |
| L1 stamp `EMPPOSQA2-MSK3CDH1` | **RETAIN** · KEY LIVE |
| EMP-STATUS FE CLOSED | **CLOSED RETAIN** — STAFF OBS owned here · **not** reopened |
| EMP-CUSTOM / ATT / LVRULE | **SEAL / HOLD RETAIN** |
| Nest `emp_position` | **DENIED** |
| Module EMP UAT | **DENIED** |
| **C-SLICE-≠-MODULE** | locked — FAIL slice ≠ claim module UAT |

---

## 7. Verdict

| | |
|--|--|
| **overall** | **FAIL** |
| **Condition R-PLT-EMP-POS-FE-01** | **OPEN** — Edit+Create position picker ABSENT · AC-01 cannot Lưu ∈ EFF |
| **ack_status** | **FAIL_TO_PM** |
| **next_owner** | **dev-fe** |
| **OBS** | EFF=0 NOTE_BLOCKED · invent UI path blocked by ABSENT · WH soft |
| **DENY** | seed · Nest emp_position · reopen EMP-STATUS FE CLOSED · invent LVRULE/EMP-ST FE-ADMIN · flip personnel · claim module EMP UAT · QC-close |

### completion_report

**Closed this seat (partial):** L0 · Vitest 7 · job_titles EFF=8 · invent **400 `HRM-EMP-POSITION-KEY`** no persist (L1 RETAIN) · Nest emp_position DENY · STAFF OBS invent KEY without reopening EMP-STATUS FE CLOSED · seals ATT/EMP-ST RETAIN · honesty locks · browser evidence + diag.

**Still open (FAIL):** AC-PLT-EMP-01 / Create — `hasBasicField('position')` **ABSENT** on Edit+Create (basic_fields required short-circuit after EMP-STATUS FE-02 force list omits `position`). Condition **R-PLT-EMP-POS-FE-01 OPEN**. Need FE-02 gate force `position` (peer status) when Settings job_titles EFF>0 — then QA retest.

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-02
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
entry_criteria:
  - QA-FE-01 FAIL stamp EMPPOSQAFE-MSKEVN7E @ docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-01.md
  - Root cause: buildActiveFieldSet(..., required=['employee_code','full_name','status']) short-circuits DEFAULT_BASIC_FIELDS → hasBasicField('position') false on Edit+Create (peer EMP-STATUS FE-02 side-effect)
  - L1 EMPPOSQA2-MSK3CDH1 RETAIN · KEY HRM-EMP-POSITION-KEY LIVE · Settings job_titles EFF=8 · SA Option A LOCKED
  - U65 zero-seed · honesty personnel/e2e=false · EMP-STATUS FE CLOSED RETAIN · Nest emp_position DENY
exit_criteria:
  - Force/gate: when job_titles EFF>0 (or always peer status), ensure hasBasicField('position') true so CatalogSearchPicker mounts on Edit+Create
  - Prefer ADD to required set: include 'position' (and keep status) OR fix short-circuit so defaults apply when catalog omits position
  - Vitest/regression: mount-guard position PRESENT when EFF>0; do not regress emp-employment-status-select
  - must_keep: POSITION KEY · EMP-STATUS FE CLOSED · EMP-CUSTOM · ATT · LVRULE HOLD · Nest emp_position DENY · SoftDel · U65 · C-SLICE
  - READY_FOR_QA → retest QA-FE-01 AC-PLT-EMP-01 picker ∈ EFF → Lưu job_title_key 2xx → F5
cấm: seed · Nest emp_position · reopen EMP-STATUS FE CLOSED · invent LVRULE/EMP-ST FE-ADMIN · flip ready · module EMP UAT · Face
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-fe-02.md
ack_status_target: READY_FOR_QA
```

**next_owner:** `dev-fe`  
**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-01.md`  
**ack_status:** **FAIL_TO_PM**
