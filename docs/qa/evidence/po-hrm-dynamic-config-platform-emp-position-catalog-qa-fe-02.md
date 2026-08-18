# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-FE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-FE-02` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P2 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-02` **READY_FOR_QA** agent `bc7a4ade-e35a-42cb-800f-82d2a8f94c14` |
| **prior_fail** | `EMPPOSQAFE-MSKEVN7E` @ [`qa-fe-01.md`](po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-01.md) |
| **ref_fe** | [`po-hrm-dynamic-config-platform-emp-position-catalog-fe-02.md`](po-hrm-dynamic-config-platform-emp-position-catalog-fe-02.md) Length≥4115 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · `:5173` |
| **Stamp** | **`EMPPOSQAFE2-MSKF8UFY`** |
| **stamp_l1 RETAIN** | **`EMPPOSQA2-MSK3CDH1`** · invent → **400 `HRM-EMP-POSITION-KEY`** LIVE |
| **U65** | zero-seed · **browser** FE click path · invent API spot ≠ UF 🟢 alone · **no wipe** EFF |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-STATUS FE CLOSED RETAIN · EMP-CUSTOM / ATT / LVRULE HOLD · Nest emp_position DENY · **`C-SLICE-≠-MODULE`** · DENY QC-close this seat |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_OBS** — **R-PLT-EMP-POS-FE-01 CLOSABLE** |
| **condition_verify** | **R-PLT-EMP-POS-FE-01** → **CLOSABLE** · Edit+Create position CatalogSearchPicker **PRESENT** ∈ job_titles EFF · Lưu `job_title_key=CEO` **200 HRM-EMP-202** · F5 exact · emp-employment-status-select **PRESENT** (no EMP-STATUS FE regress) |
| **change_mode** | ADD verify · no `apps/**` product edit · no seed · no ready flip · **FORBIDDEN** reopen EMP-STATUS FE CLOSED · Nest emp_position · invent LVRULE · module EMP UAT · QC-close |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Vitest mount-guard | `EmployeeFormDialog.mount-guard.test.ts` **8/8** exit **0** (R-PLT-EMP-POS-FE-02 + EMP-STATUS retain) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-02.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-02-browser.json` (26 673 B) |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-02/` (10 PNG) |
| FE parent | FE-02 READY_FOR_QA — force `'position'` into required basic fields |
| L1 QA | stamp **`EMPPOSQA2-MSK3CDH1`** RETAIN · KEY LIVE |
| EMP-STATUS FE | stamp **`EMPSTQAFE2-MSKE3NV1` CLOSED RETAIN** — not reopened |

**spec_ref:** AC-PLT-EMP-01 / 01b · VAL-EMP-POS-CNS-* · HDSD CH06f · R-PLT-EMP-POS-FE-01 · KEY `HRM-EMP-POSITION-KEY`

**Seed:** none · **ensureDefault:** none · **Nest emp_position:** DENIED.

**Target employee:** `0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` · `Nguyễn Văn QA M3 987275` · before `job_title_key=(none)` · after F5 `CEO`  
**STAFF OBS row:** `0500220b-…` · invent still **400 KEY** · EMP-STATUS FE not reopened

---

## 2. Click path (U65 · HDSD CH06f)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | Settings `job_titles` EFF | **total=8** codes=`CEO,CHRO,DRIVER_LEAD,OPS_MANAGER,POS_01..04` · **200** (L1 LIVE · no seed) |
| 2 | Invent API spot | PATCH invent `job_title_key=zz_invent_emp_pos_mskf8ufy` → **400 `HRM-EMP-POSITION-KEY`** · no persist · L1 **RETAIN** |
| 3 | Nest emp_position DENY | GET `/employees/emp-positions*` → **400/404** · src route file **ABSENT** |
| 4 | Seals smoke | attendance-codes **200**/1 · ot-types **200**/1 · emp-st **200**/4 · EMP-STATUS FE **CLOSED RETAIN** |
| 5 | **HRM → Nhân sự / Employees** | `/hr/employees?portal=1&companyId=main` · no Sync ERROR |
| 6 | Row ⋯ → **Sửa** Edit dialog | `hdsd-employee-form-dialog` opened via=`row_menu` |
| 7 | Position CatalogSearchPicker | **PRESENT** — options **8** · effHits=**8** (CEO…POS_04) · CatalogSearchPicker search |
| 8 | emp-employment-status-select | **PRESENT** — EMP-STATUS FE CLOSED RETAIN (no regress) |
| 9 | Pick `CEO` → **Lưu** | PATCH **200 `HRM-EMP-202`** body `{ job_title_key:"CEO", status:"active", full_name:… }` |
| 10 | F5 / GET | `job_title_key=CEO` **exact=true** · reopen picker shows CEO |
| 11 | **Thêm** Create dialog | position combobox **PRESENT** · effHits=**8** · status select **PRESENT** |
| 12 | STAFF OBS | invent STAFF emp → **400 KEY** · EMP-STATUS FE reopen=false |
| 13 | EFF=0 branch | **NOTE_BLOCKED** — EFF=8; unit cite empty CTA `HRM-WH-PICK-EMPTY-CATALOG` |
| 14 | WH picker spot | soft OBS (form AC-01 primary) — not UF blocker |

**HDSD / testids:** `hdsd-employees-create-btn` · `hdsd-employee-form-dialog` · `hdsd-employee-form-submit` · `emp-employment-status-select` **PRESENT** · position CatalogSearchPicker **PRESENT** (eff-probe)

**Screens:** `01-employees-list` · `02-edit-dialog` · `03-position-picker-options` · `04-position-selected` · `05-after-save` · `06-f5-list` · `07-f5-edit-picker` · `08-staff-obs-edit` · `09-work-timeline` · `10-create-dialog`

---

## 3. UF matrix (dispatch CLOSABLE)

| UF | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **1 L0 + vitest 8** | stack 200 · mount-guard 8 | 200/200/200 · **8/8** | 🟢 |
| **2 Edit picker ∈ EFF** | CatalogSearchPicker options ∩ job_titles EFF | **PRESENT** · opts=8 · effHits=8 | 🟢 |
| **3 Create picker mounts** | Create same picker | **PRESENT** · effHits=8 | 🟢 |
| **4 AC-PLT-EMP-01 Lưu + FE+F5** | PATCH `job_title_key` ∈ EFF 2xx · F5 retain | **200 HRM-EMP-202** · F5 `CEO` exact | 🟢 |
| **5 AC-PLT-EMP-01b invent KEY** | 400 POSITION-KEY + no persist | API **400 KEY** · no persist · Select-only OBS | 🟢 / 🟡 UI |
| **6 emp-employment-status-select** | PRESENT Edit+Create · no EMP-STATUS FE regress | Edit+Create **PRESENT** | 🟢 |
| **7 Nest emp_position DENY** | 404/absent | 400/404 · no src route | 🟢 |

---

## 4. Diff vs prior FAIL (EMPPOSQAFE-MSKEVN7E)

| Item | QA-FE-01 (`EMPPOSQAFE-MSKEVN7E`) | QA-FE-02 (`EMPPOSQAFE2-MSKF8UFY`) |
|------|----------------------------------|-------------------------------------|
| Root cause | `buildActiveFieldSet` required=`[code,name,status]` short-circuits → `position` omitted | FE-02 adds `'position'` to required set (peer EMP-STATUS FE-02) |
| Edit picker | **ABSENT** | **PRESENT** ∈ EFF (8/8) |
| Create picker | **ABSENT** | **PRESENT** ∈ EFF (8/8) |
| Lưu job_title_key | blocked (no field) | **200** `job_title_key=CEO` |
| F5 | blocked | **exact CEO** |
| emp-employment-status-select | PRESENT (status retain) | **PRESENT** RETAIN |
| Condition | **OPEN** | **CLOSABLE** |

**spec says / code does (now aligned):**

- *spec says:* EFF>0 → EmployeeFormDialog Vị trí CatalogSearchPicker ∈ Settings job_titles EFF → Lưu → 2xx → F5.
- *code does (FE-02):* `position` forced into required basic fields → picker mounts · Network PATCH carries Nest `job_title_key` · F5 retains.

---

## 5. Key network stamps

```text
GET  /api/hrm/settings-catalogs/job_titles/items?company_id=main
  → 200  active=8  CEO,CHRO,DRIVER_LEAD,OPS_MANAGER,POS_01..04

PATCH /api/hrm/employees/0f6e1369-…
  body: { "job_title_key": "zz_invent_emp_pos_mskf8ufy" }
  → 400 HRM-EMP-POSITION-KEY
  GET after → job_title_key=(none)  persisted=false
  (L1 EMPPOSQA2-MSK3CDH1 RETAIN)

GET  /api/hrm/employees/emp-positions* → 400/404 (Nest DENY)

Browser FE Lưu (Edit):
  PATCH … body { job_title_key:"CEO", status:"active", full_name:"Nguyễn Văn QA M3 987275" }
  → 200 HRM-EMP-202
  F5 GET → job_title_key=CEO exact=true

pageErrors=0 · bad5xx=0 · console=0
```

| ID | Verdict |
|----|---------|
| L0 | 🟢 |
| Vitest mount-guard 8 | 🟢 |
| EFF job_titles>0 | 🟢 |
| Invent KEY + no persist | 🟢 |
| Nest DENY | 🟢 |
| Seals / EMP-STATUS FE CLOSED | 🟢 |
| AC-01 Edit picker ∈ EFF | 🟢 PRESENT |
| AC-01 Submit job_title_key | 🟢 200 |
| AC-01 F5 | 🟢 exact |
| AC-01 Create picker | 🟢 PRESENT |
| emp-employment-status-select Edit+Create | 🟢 |
| AC-01b UI invent path | 🟡 Select-only OBS · API KEY 🟢 |
| AC-01c EFF=0 | 🟡 NOTE_BLOCKED |
| WH picker | 🟡 soft OBS |
| Console / 5xx | 🟢 |

---

## 6. Honesty locks (mandatory)

| Lock | Status |
|------|--------|
| `hrm_personnel_uat_ready` | **false** LOCKED — DENY flip |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `contracts_printable_ready` | **false** LOCKED |
| Seed / ensureDefault | **none** |
| Nest `emp_position` | **DENY** RETAIN |
| EMP-STATUS FE CLOSED | **RETAIN** — select PRESENT · not reopened |
| EMP-CUSTOM / ATT / LVRULE | **HOLD / seal RETAIN** — not touched |
| `C-SLICE-≠-MODULE` | true — Condition CLOSABLE ≠ module EMP UAT |
| QC-close this seat | **DENY** — QA hands to QC only |

---

## 7. Residual / OBS (non-blocking)

1. **EFF=0 empty CTA** — NOTE_BLOCKED (live EFF=8 · no wipe U65) · unit cite `HRM-WH-PICK-EMPTY-CATALOG`.
2. **Invent UI** — CatalogSearchPicker Select-only · free-text invent N/A · API KEY proven.
3. **WorkTimeline picker** — soft OBS (form AC-01 primary closed this seat).

**must_keep verified:** POSITION KEY · EMP-STATUS FE CLOSED · EMP-CUSTOM · ATT · LVRULE · Nest DENY.

---

## 8. Verdict + handoff

| Field | Value |
|-------|--------|
| **overall** | **PASS_WITH_OBS** |
| **Condition** | **R-PLT-EMP-POS-FE-01 CLOSABLE** |
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **stamp** | **`EMPPOSQAFE2-MSKF8UFY`** |

### completion_report

Closed: FE-02 retest U65 browser — prior FAIL picker ABSENT fixed; Edit+Create Vị trí CatalogSearchPicker PRESENT ∈ job_titles EFF (8); Lưu `job_title_key=CEO` → 200 HRM-EMP-202 + F5 exact; invent KEY 400 RETAIN; Nest emp_position DENY; emp-employment-status-select PRESENT (EMP-STATUS FE CLOSED no regress); L0 200; vitest mount-guard 8/8. Residual OBS only (EFF=0 NOTE_BLOCKED · Select-only invent · WH soft). Honesty locks intact. Condition **CLOSABLE** for QC. DENY module EMP UAT / ready flip / this-seat QC-close by QA.

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QC-FE-01
from_role: pm
to_role: qc
lane: governance
priority: P2
entry: QA-FE-02 PASS_WITH_OBS stamp EMPPOSQAFE2-MSKF8UFY @ docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-02.md
close: R-PLT-EMP-POS-FE-01 (prior OPEN EMPPOSQAFE-MSKEVN7E → CLOSABLE)
L1 RETAIN EMPPOSQA2-MSK3CDH1 · KEY LIVE · EMP-STATUS FE CLOSED RETAIN EMPSTQAFE2-MSKE3NV1
ACCEPT OBS: EFF=0 NOTE_BLOCKED · invent Select-only · WH soft
DENY: flip ready · seed · Nest emp_position · invent LVRULE · reopen EMP-STATUS FE · module EMP UAT · Phase1 · UF 🟢 alone
exit: GWC narrow · Condition CLOSED · C-SLICE-≠-MODULE · honesty personnel/e2e=false LOCKED
must_keep: POSITION KEY · EMP-STATUS FE CLOSED · EMP-CUSTOM · ATT · LVRULE · Nest DENY
```

### ack_status

**PASS_TO_PM**
