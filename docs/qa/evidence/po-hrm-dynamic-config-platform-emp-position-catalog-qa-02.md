# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-02` |
| **from_role** | `qa` |
| **to_role** | `pm` → **`qc`** |
| **lane** | execution · **L1 phụ retest** (≠ UF 🟢) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BE-01` **READY_FOR_QA** · closes **R-PLT-EMP-POS-BE-01** |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` · employees mutate `holding` |
| **Stamp** | **`EMPPOSQA2-MSK3CDH1`** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · no invent density · L1 probe only — **DENIED** UF 🟢 / module EMP UAT / Phase1 |
| **Retain** | EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR · **HRM-CON-POS-KEY** peers |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` **LOCKED** · **`C-SLICE-≠-MODULE`** |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 hrm `:28001` | **200** |
| L0 xbos `:28002` | **200** |
| L0 portal `:5173` | **200** |
| Login | `POST` portal `/api/xbos/auth/login` → **201** · `ceo@xe.vn` |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.json` |
| BE evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-be-01.md` |
| BA AC | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md` · **AC-PLT-EMP-01b** |
| Prior FAIL | invent `job_title_key` PATCH → **200** (DI `@Optional()` no-op) — **must now 4xx** |

**Seed:** none. **Flip honesty / module EMP UAT / Phase1 / Nest `emp_position`:** none. **Reopen EMP-STATUS FE / EMP-CUSTOM / EXT / DOC-ET / ATT / SI / CTR:** none.

> **Note:** Prior seat file `…-emp-position-catalog-qa-01.md` was **missing** on disk — this **QA-02** seat still produces evidence (per PM dispatch).

---

## 2. Source / dist / Nest deny gate

| Artifact | Result |
|----------|--------|
| `employees.service.ts` · `HRM-EMP-POSITION-KEY` + `assertJobTitleKeyInCatalog` | **PRESENT** |
| WH alias `HRM-WH-PICK-REQUIRED` (≡ class) | **PRESENT** |
| `EmployeesModule` imports `SettingsCatalogsModule` | **PRESENT** (closes R-PLT-EMP-POS-BE-01) |
| `dist/employees/employees.service.js` KEY | **PRESENT** |
| Nest `emp_position` table/service/controller | **ABSENT** (Option A RETAIN) |
| Live `GET /emp-position` | **404** `HRM-DATA-404` |
| Live `GET /employees/emp-positions` | **500** `HRM-SYS-001` (UUID parse on `:id` — **not** Nest position SoT) |

**Verdict:** **PASS** — no Nest `emp_position` invented.

---

## 3. AC-PLT-EMP-01b retest (closes R-PLT-EMP-POS-BE-01)

### 3.1 EFF baseline (no seed wipe)

| Signal | Result |
|--------|--------|
| GET `/api/hrm/settings-catalogs/job_titles/items?company_id=holding` | **200** `HRM-SET-200` |
| Active EFF count | **8** (total rows 9) |
| Sample codes | `ceo`, `chro`, `driver_lead`, `ops_manager`, `pos_01`… |

Admin CREATE / seed wipe **not** used — live EFF already **>0**.

### 3.2 PATCH invent free-text `job_title_key`

```text
Login ceo@xe.vn
→ GET /api/hrm/employees?company_id=holding&page_size=5
  → employee id=0500220b-f289-40df-b07e-86316285439b code=UAT-0100 · job_title_key=STAFF
→ PATCH /api/hrm/employees/{id}?company_id=holding
  body={ "job_title_key": "zz_invent_emp_pos_msk3cdh1" }
  x-company-id=holding
→ GET /api/hrm/employees/{id}?company_id=holding
```

| Expect (BA AC-01b · prior FAIL) | Actual | Verdict |
|---------------------------------|--------|---------|
| **4xx** `HRM-EMP-POSITION-KEY` (≡ `HRM-WH-PICK-REQUIRED` class) | **400** `HRM-EMP-POSITION-KEY` | **PASS** |
| Not **200** invent accept (prior wiring gap) | Not 200 | **PASS** (closes **R-PLT-EMP-POS-BE-01**) |
| Invent **not** persisted after GET/F5 | `job_title_key` remains **`STAFF`** · `persisted=false` | **PASS** |

Message (excerpt): `job_title_key 'zz_invent_emp_pos_msk3cdh1' is not in job_titles catalog (free-text SoT forbidden)`.

### 3.3 Spot CREATE invent

| Step | Result |
|------|--------|
| `POST /api/hrm/employees` invent `job_title_key` | **400** `HRM-EMP-POSITION-KEY` |
| No create persist | **PASS** |

### 3.4 AC-PLT-EMP-01c EFF=0 soft path

| Check | Result |
|-------|--------|
| Forced EFF=0 without seed | **NOT reachable** (wipe FORBIDDEN U65) |
| Note | Soft skip retained in BE evidence / jest — live authoritative path is EFF>0 invent KEY |

### 3.5 VAL stamp

| ID | Expect | Actual | Verdict |
|----|--------|--------|---------|
| **AC-PLT-EMP-01b EFF>0** | picker SoT live | EFF active **8** | **PASS** |
| **AC-PLT-EMP-01b invent PATCH** | 4xx POSITION-KEY | **400** KEY · no persist | **PASS** |
| **VAL-EMP-POS-CNS-03 create spot** | invent create 4xx KEY | **400** KEY | **PASS** |
| **AC-PLT-EMP-01c EFF=0** | soft · no seed | NOTE_NO_WIPE | **NOTE** |
| **DENY Nest emp_position** | absent | src/dist + route probe | **PASS** |

---

## 4. Seals / honesty (cấm reopen / flip)

| Lock | Status |
|------|--------|
| EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 | **SEAL RETAIN** (cite-only) |
| DOC/ET · ATT/SI/CTR · HRM-CON-POS-KEY | **RETAIN** |
| `hrm_personnel_uat_ready` / e2e / printable | **false LOCKED** |
| Module EMP UAT / Phase1 / UF 🟢 from L1 | **DENIED** |
| Invent EMP-STATUS FE | **DENIED** |
| Seed | **none** |

---

## 5. Network codes (rollup)

| Call | Status | Code |
|------|--------|------|
| Login | **201** | — |
| GET `job_titles/items` holding | **200** | `HRM-SET-200` |
| GET employees list | **200** | `HRM-EMP-200` |
| GET employee before | **200** | `HRM-EMP-200` |
| **PATCH invent `job_title_key`** | **400** | **`HRM-EMP-POSITION-KEY`** |
| GET employee after | **200** | — · key still `STAFF` |
| **POST create invent** | **400** | **`HRM-EMP-POSITION-KEY`** |
| GET `/emp-position` | **404** | `HRM-DATA-404` |

---

## 6. Overall verdict

| Gate | Result |
|------|--------|
| L0 | **PASS** |
| AC-PLT-EMP-01b invent PATCH | **PASS** |
| No invent persist | **PASS** |
| Create invent spot | **PASS** |
| Nest `emp_position` deny | **PASS** |
| Honesty / seals | **PASS** (retain · no flip) |
| **Overall** | **PASS** |
| **C-SLICE-≠-MODULE** | L1 CNS invent KEY ≠ module EMP UAT |

**Residual:** none P0/P1 for this seat. FE WH picker deepen / empty CTA (if any) remain HOLD outside this L1 seat — **DENIED** invent FE / UF 🟢.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Closed **R-PLT-EMP-POS-BE-01**: LIVE U65 `ceo@xe.vn` — EFF `job_titles` active **8**; invent PATCH `job_title_key` → **400 `HRM-EMP-POSITION-KEY`** (not 200); invent **not** persisted (`STAFF` retained); create invent spot **400** same KEY; no Nest `emp_position`; seals + honesty false RETAIN; stamp **`EMPPOSQA2-MSK3CDH1`**. Prior QA-01 file missing — QA-02 evidence written. L1 ≠ UF 🟢 / module EMP UAT. |
| **next_owner** | `qc` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.json` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QC-01
from_role: pm
to_role: qc
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-02 PASS_TO_PM · stamp EMPPOSQA2-MSK3CDH1
entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.md
  - Read BE-01 + BA AC-PLT-EMP-01b · SA Option A LOCK
  - U65 zero-seed · honesty false · C-SLICE-≠-MODULE
  - RETAIN EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR
task:
  - Narrow QC: invent job_title_key → 400 HRM-EMP-POSITION-KEY · no persist · no Nest emp_position
  - Confirm R-PLT-EMP-POS-BE-01 CLOSED · seals RETAIN · DENY flip personnel / module EMP UAT / Phase1
  - Do NOT invent EMP-STATUS FE · no seed · no reopen peer seals
exit: GO WITH CONDITIONS (L1 only) or NO-GO with residual owner
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qc-01.md
```
