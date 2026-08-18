# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` → **`qc`** |
| **lane** | execution · **L1 phụ** (≠ UF 🟢) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `EMP-DEPT-CATALOG-BA-01` **CONFIRMED** · Option **A** Settings/XBOS `departments` · **R-EMP-POS-DEPT-01** |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` · mutate `holding` |
| **Stamp** | **`EMPDEPTQA-MSK3VVXX`** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · no invent density wipe · L1 probe only — **DENIED** UF 🟢 / module EMP UAT / Phase1 |
| **Retain** | **`EMPPOSQA2-MSK3CDH1`** · **`EMPSTQA-MSK20G7H`** · **`EMPCFQA-MSK14LUH`** · **`EMPTOKEXTQA-MSJ57PE1`** · DOC/ET · ATT/SI/CTR |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` **LOCKED** · **`C-SLICE-≠-MODULE`** |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 hrm `:28001` `/api/hrm` | **200** |
| L0 xbos `:28002` `/api/xbos` | **200** |
| L0 portal `:5173` | **200** |
| Login | `POST` portal `/api/xbos/auth/login` → **201** · `ceo@xe.vn` |
| Git HEAD | (see machine JSON `git_head`) |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.json` |
| BA AC | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01.md` |
| SA Option A | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md` **LOCKED** |
| Peer invent KEY | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.md` · stamp **`EMPPOSQA2-MSK3CDH1`** |

**Seed:** none. **Flip honesty / module EMP UAT / Phase1 / Nest `emp_department` / Nest `emp_position`:** none. **Reopen EMP-POSITION / EMP-STATUS / EMP-CUSTOM / EXT / DOC-ET / ATT / SI / CTR:** none.

---

## 2. Source / dist / Nest deny gate (01H)

| Artifact | Result |
|----------|--------|
| `employee-profile.service.ts` · `HRM-WH-DEPT-KEY` + `assertWhDepartmentKey` · `catalogKey: 'departments'` | **PRESENT** |
| Platform string `HRM-EMP-DEPT-KEY` in WH service | **ABSENT** (BA maps ≡ **`HRM-WH-DEPT-KEY`** — **PASS retain**) |
| Nest `emp_department` catalog table/route/service | **ABSENT** |
| Nest `emp_position` catalog table/route/service | **ABSENT** (RETAIN position Option A) |
| Nest `public.departments` org-tree | **Retain hierarchy surface** · **≠** invent SoT |
| Live `GET /emp-department` | **404** |
| Live `GET /emp-position` | **404** |

**Verdict:** **PASS** — Option A Settings/XBOS SoT; Nest catalog DENY holds.

---

## 3. AC matrix (U65 L1)

### 3.1 SoT + admin N+1 (01 / 01d)

| Signal | Result |
|--------|--------|
| GET `/api/hrm/settings-catalogs/departments/items?company_id=holding` | **200** · active EFF baseline **4** (XBOS `DEPT_01`…`DEPT_04`) |
| Admin `POST /settings-catalogs/items` `category_key=departments` `hr_dept_msk3vvxx` | **201** `HRM-SET-201` |
| EFF after CREATE | active **5** · open key **visible** |
| WH valid create `department_key=dept_01` ∈ EFF | **201** `HRM-EMP-PROFILE-201` · GET list persisted · cleaned |

### 3.2 Invent KEY (01b · VAL-CNS-01)

```text
Login ceo@xe.vn
→ GET departments/items holding → EFF active ≥4
→ GET employees holding → UAT-0100
→ POST /employees/{id}/work-timeline invent department_key=zz_invent_emp_dept_msk3vvxx
→ GET work-timeline (no invent row)
```

| Expect | Actual | Verdict |
|--------|--------|---------|
| **4xx** `HRM-EMP-DEPT-KEY` ≡ `HRM-WH-DEPT-KEY` | **400** **`HRM-WH-DEPT-KEY`** | **PASS** (≡ class · BA R-EMP-DEPT-CNS-01 PASS retain) |
| Invent **not** persisted | no WH row with invent key | **PASS** |

Message: `department_key 'zz_invent_emp_dept_msk3vvxx' is not in departments catalog`.

### 3.3 Empty EFF (01c · VAL-CNS-02)

| Check | Result |
|-------|--------|
| Forced EFF=0 without seed | **NOT reachable** (wipe FORBIDDEN U65) |
| Note | **NOTE_BLOCKED** honestly — empty CTA / `HRM-EMP-DEPT-EMPTY-CATALOG` not claimed 🟢 from L1 |

### 3.4 Soft-retire (01e · VAL-CNS-04)

| Step | Result |
|------|--------|
| `PATCH /settings-catalogs/items` open key → `status=draft` | **200** |
| WH invent retired open key | **400** `HRM-WH-DEPT-KEY` |
| Verdict | **PASS** (retired excluded from active EFF assert) |

### 3.5 CTR spot (VAL-CNS-05)

| Step | Result |
|------|--------|
| PATCH contract invent `department_key` | **400** `HRM-CON-POS-KEY` (peer KEY class · RETAIN assert) |
| Verdict | **PASS** spot |

### 3.6 Honesty / seals (01H)

| Lock | Status |
|------|--------|
| EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 | **SEAL RETAIN** (cite-only) |
| DOC/ET · ATT/SI/CTR | **RETAIN** |
| personnel / e2e / printable | **false LOCKED** |
| Module EMP UAT / Phase1 / UF 🟢 from L1 | **DENIED** |
| Nest emp_department / emp_position / fold / seed | **DENIED** |

---

## 4. VAL stamp rollup

| ID | Expect | Actual | Verdict |
|----|--------|--------|---------|
| **AC-PLT-EMP-DEPT-01** SoT EFF>0 + WH valid | picker ∈ EFF 2xx | EFF≥4 · WH **201** `dept_01` | **PASS** |
| **AC-PLT-EMP-DEPT-01b** invent | 4xx KEY ≡ WH-DEPT | **400** `HRM-WH-DEPT-KEY` · no persist | **PASS** |
| **AC-PLT-EMP-DEPT-01c** empty | CTA / EMPTY | NOTE_BLOCKED_NO_WIPE | **NOTE** |
| **AC-PLT-EMP-DEPT-01d** admin N+1 | 2xx + EFF | **201** + open in EFF | **PASS** |
| **AC-PLT-EMP-DEPT-01e** soft-retire | hide / KEY | draft + invent **400** KEY | **PASS** |
| **AC-PLT-EMP-DEPT-01H** Nest + seals | DENY + RETAIN | Nest 404 · seals cite | **PASS** |
| **VAL-EMP-DEPT-CNS-01** | WH invent KEY | **400** WH-DEPT-KEY | **PASS** |
| **VAL-EMP-DEPT-CNS-02** | empty | NOTE_BLOCKED | **NOTE** |
| **VAL-EMP-DEPT-CNS-05** | CTR invent | **400** CON-POS-KEY class | **PASS** |
| **VAL-EMP-DEPT-ADM-01** | admin open | **201** | **PASS** |

---

## 5. Network codes (rollup)

| Call | Status | Code |
|------|--------|------|
| Login | **201** | — |
| GET `departments/items` holding | **200** | — |
| **POST** settings-catalogs/items admin N+1 | **201** | `HRM-SET-201` |
| GET employees list | **200** | — |
| **POST** WH invent `department_key` | **400** | **`HRM-WH-DEPT-KEY`** |
| GET WH after invent | **200** | invent absent |
| **POST** WH valid `dept_01` | **201** | `HRM-EMP-PROFILE-201` |
| PATCH soft-retire open key | **200** | — |
| POST WH invent retired key | **400** | `HRM-WH-DEPT-KEY` |
| PATCH CTR invent | **400** | `HRM-CON-POS-KEY` |
| GET `/emp-department` | **404** | — |
| GET `/emp-position` | **404** | — |

---

## 6. Overall verdict

| Gate | Result |
|------|--------|
| L0 | **PASS** |
| SoT Settings/XBOS `departments` | **PASS** |
| 01d admin CREATE N+1 | **PASS** |
| 01 WH valid ∈ EFF | **PASS** |
| 01b invent KEY ≡ WH-DEPT · no persist | **PASS** |
| 01c empty | **NOTE_BLOCKED** (honest · no seed) |
| 01e soft-retire | **PASS** |
| 01H Nest DENY + seals | **PASS** |
| **Overall** | **PASS** |
| **C-SLICE-≠-MODULE** | L1 dept catalog ≠ module EMP UAT |

### Residuals

| ID | Sev | Note | Owner |
|----|-----|------|-------|
| **R-EMP-DEPT-CNS-01-ALIAS-OBSERVE** | P3 | LIVE uses **`HRM-WH-DEPT-KEY`** (BA ≡ **`HRM-EMP-DEPT-KEY`**) — **PASS retain**; no BE unlock unless QC requires unified code string | pm HOLD |
| **01c empty CTA** | — | Not forced without wipe — FE empty CTA **not** claimed from L1 | HOLD / FE only if product forces empty |

**No P0/P1 GAP** for invent KEY / admin N+1 / Nest deny. **DENIED** unlock Nest `emp_department` / reopen seals / flip personnel.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Closed L1 U65 **AC-PLT-EMP-DEPT-01/01b/01d/01e/01H** + VAL-CNS-01/05/ADM: Settings/XBOS `departments` EFF active **4→5**; admin CREATE **201**; WH invent → **400 `HRM-WH-DEPT-KEY`** (≡ EMP-DEPT-KEY) · **not** persisted; WH valid `dept_01` → **201** + cleanup; soft-retire invent **400** KEY; CTR invent spot **400** peer KEY; Nest `emp_department`/`emp_position` **ABSENT**/404; seals + honesty false **RETAIN**; 01c **NOTE_BLOCKED** no wipe; stamp **`EMPDEPTQA-MSK3VVXX`**. L1 ≠ UF 🟢 / module EMP UAT. Residual P3 alias observe only. |
| **next_owner** | `qc` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.json` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-01 PASS_TO_PM · stamp EMPDEPTQA-MSK3VVXX

## entry_criteria
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.md
- Read: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.json
- Read: BA-01 CONFIRMED + SA-01 Option A LOCK
- RETAIN: EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR
- Honesty false · C-SLICE-≠-MODULE · U65 zero-seed

## task
Narrow QC GWC L1:
- Confirm SoT Settings/XBOS departments · admin N+1 201 · invent → 400 HRM-WH-DEPT-KEY ≡ EMP-DEPT-KEY · no persist
- Confirm Nest emp_department / emp_position DENY · seals RETAIN
- Confirm 01c NOTE_BLOCKED honest · P3 alias observe HOLD (no BE unlock unless require unified string)
- DENY flip personnel / module EMP UAT / Phase1 / reopen seals / Nest invent
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qc-01.md

## exit
GO WITH CONDITIONS (L1 only) or NO-GO with residual owner
```
