# Evidence — PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-RETEST-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-RETEST-01` |
| **role** | `qa` |
| **runner_stamp** | **`CTRG4SDRT-MSO3491G`** |
| **upstream_be** | `docs/qa/evidence/po-hrm-ctr-workspace-be-create-start-date-01.md` |
| **prior_fail** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-retest-01.md` § DEF-CTR-G4-CREATE-START-DATE-400 |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** (start_date **CLOSED** · CREATE chain blocked by REC subject) |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-01.mjs` (WS-G4-02/06/07 slice) |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-01.json` · stamp `CTRWSG4B-MSO3491G` |
| **commit** | `dc930c5` |
| **honesty** | `contracts_printable_ready=false` |

---

## Gates

| Gate | Command | Result |
|------|---------|--------|
| **L0 stack** | `pnpm run qc:dev-stack` | **PASS** — hrm-api `:28001` **200** · xbos **200** · portal **200** |
| **L0 FE↔BE** | `pnpm run qc:fe-be-health` | **exit 0** |
| **BE unit** | `jest po-hrm-ctr-workspace-g4-create-start-date-fix-01` | **2/2 PASS** |

---

## DEF-CTR-G4-CREATE-START-DATE-400 — retest verdict

| Check | Before fix | After fix (this run) |
|-------|------------|----------------------|
| POST body `start_date` | missing/invalid → **HRM-VAL-001** | **`2026-08-11`** (ISO `yyyy-MM-dd`) |
| API omit/empty `start_date` | **HRM-VAL-001** | **No** VAL-001 — defaults to service layer |
| Browser Tiếp POST code | `HRM-VAL-001` | **`HRM-CTR-SUBJECT-REC-400`** (different layer) |

**DEF-CTR-G4-CREATE-START-DATE-400 → CLOSED** (P0 start_date validation no longer blocks wizard draft).

---

## Matrix (in-scope rows)

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-02** | **FAIL** | NV pick `Le Van C — NV101` OK · POST **400** **`HRM-CTR-SUBJECT-REC-400`** · Step2 **not** open |
| **WS-G4-06** | **BLOCKED** | Step2 not open |
| **WS-G4-07** | **BLOCKED** | Mandatory gỡ — depends Step2 |
| **WS-G4-04** | **BLOCKED** | F5 row `QG4NVO3491G` absent — no successful mutate |

---

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-CREATE-01** | **FAIL** | Step2 blocked — POST 400 REC subject (not start_date) |
| **J-HRM-CTR-CREATE-02** | **BLOCKED** | DnD — depends CREATE mutate |

**L2 PASS + L2.5 CREATE FAIL = overall QA FAIL** (U19).

---

## UF block (browser — NV-first CREATE)

| Step | Verdict | Evidence |
|------|---------|----------|
| Login → CC contracts | **PASS** | URL `command-center/hrm/contracts` |
| Tạo HĐ → NV-first Step1 | **PASS** | `ctr-create-subject-tab-employee` default · picker visible |
| NV pick → **Tiếp** | **FAIL** | POST **400** · Step2 closed |
| **FE sau POST** | **FAIL** | Toast/error path; no `ctr-create-step-2` |
| F5 after save | **BLOCKED** | No row persisted |

### Click path

`ceo@xe.vn` login → Command Center → HRM **Hợp đồng** → **Tạo HĐ** → tab **Nhân viên** → chọn **Le Van C — NV101** → điền mẫu/ngày ký/Hình thức/tỉ lệ/trích yếu → **Tiếp**.

### Network (mutate)

```json
{
  "employee_post": {
    "status": 400,
    "employee_id": "33333333-3333-4333-8333-333333333333",
    "start_date": "2026-08-11",
    "contract_type": "HDHV",
    "code": "HRM-CTR-SUBJECT-REC-400",
    "message": "Nhân viên chưa có liên kết tuyển dụng (REC→EMP). Tạo/chốt ứng viên trước khi tạo HĐ theo nhân viên."
  }
}
```

**U65 prereq:** all 3 employees in scope have `candidate_id: null` (NV101/NV002/NV001) — REC→EMP trace absent by data, not seed.

---

## Console (non-blocking)

- **2×** `400 Bad Request` on CREATE POST (REC-400)
- `validateDOMNesting` Badge in `<p>` — P2 carry `DEF-CTR-G4-DOM-NESTING-P2`
- **DnD storms:** **0**

---

## Screenshots

| Path | Row |
|------|-----|
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-01/01-create-dialog.png` | Step1 NV-first |
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-01/03-f5-list.png` | F5 — no new row |
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-01/04-view-workspace.png` | J-HRM-03 view (orthogonal) |
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-01/05-edit-deeplink.png` | WS-G4-03-EDIT PASS (carry) |

---

## Promoted / not promoted

**Promoted (narrow — start_date fix):**

- `DEF-CTR-G4-CREATE-START-DATE-400` **CLOSED**
- POST includes valid ISO `start_date`; no `HRM-VAL-001` on omit/empty (API probe + browser)
- BE jest `po-hrm-ctr-workspace-g4-create-start-date-fix-01` **PASS**

**Not promoted:**

- WS-G4-02/06/07 CREATE mutate chain (new blocker **HRM-CTR-SUBJECT-REC-400**)
- J-HRM-CTR-CREATE-01/02
- UF-HRM-10 · `contracts_printable_ready=false`

---

## Defects

| ID | Sev | Mô tả | Owner | Status |
|----|-----|--------|-------|--------|
| **DEF-CTR-G4-CREATE-START-DATE-400** | P0 | `start_date` HRM-VAL-001 on Tiếp | dev-be | **CLOSED** |
| **DEF-CTR-G4-SUBJECT-REC-400** | **P0** | NV-first Tiếp → **400** `HRM-CTR-SUBJECT-REC-400` when `employee.candidate_id` null — blocks Step2/DnD/F5 | **dev-be** / **ba-process** | **OPEN** |
| **DEF-CTR-G4-EDIT-DEEPLINK-P1** | P1 | edit deep-link — carry | dev-fe | OPEN (orthogonal; WS-G4-03-EDIT **PASS** this run) |

**spec_ref:** `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md` **BR-CTR-CREATE-08** · `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` § errors `HRM-CTR-SUBJECT-REC-400`

---

## completion_report

**Closed:** Retest confirms BE start_date fix — wizard POST carries `start_date: 2026-08-11`; API accepts omit/empty `start_date` without `HRM-VAL-001`; jest 2/2 PASS; L0 PASS; U65 browser NV-first Step1 OK.

**Open:** WS-G4-02/06/07 and J-HRM-CTR-CREATE-01/02 still **FAIL/BLOCKED** — POST **400** `HRM-CTR-SUBJECT-REC-400` (pilot employees lack REC→EMP `candidate_id`). DnD/F5 not reached. ≠ UF-HRM-10.

## next_owner

`dev-be` (+ `ba-process` if BR-CTR-CREATE-08 policy vs NV-first legacy NV needs delta)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-01
role: dev-be
read_first:
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-create-start-date-retest-01.md § DEF-CTR-G4-SUBJECT-REC-400
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md BR-CTR-CREATE-08
  - apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts (HRM_CTR_SUBJECT_REC_400)
entry_criteria: start_date fix CLOSED; NV-first Tiếp still 400 HRM-CTR-SUBJECT-REC-400 on ceo@ pilot NV (candidate_id null)
exit_criteria: NV-first CREATE Step1→Tiếp POST 2xx OR documented policy exception for legacy NV without REC trace; QA retest WS-G4-02/06/07; U65 FE path only
must_keep: contracts_printable_ready=false · G-CI-01 · start_date default HCM
evidence_path: docs/qa/evidence/po-hrm-ctr-workspace-be-subject-rec-nv-first-01.md
ack_status: READY_FOR_QA
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-create-start-date-retest-01.md`  
**ack_status:** **FAIL_TO_PM**
