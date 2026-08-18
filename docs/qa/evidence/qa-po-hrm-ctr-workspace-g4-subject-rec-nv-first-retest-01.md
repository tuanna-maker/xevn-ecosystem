# Evidence — PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-QA-01` |
| **role** | `qa` |
| **runner_stamp** | **`CTRG4NVFR-MSO3QNLZ`** |
| **upstream_be** | `docs/qa/evidence/po-hrm-ctr-workspace-be-subject-rec-nv-first-01.md` |
| **prior_fail** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-create-start-date-retest-01.md` § DEF-CTR-G4-SUBJECT-REC-400 |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (NV-first CREATE chain **CLOSED** · `contracts_printable_ready=false`) |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-g4-nv-first-retest-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-g4-nv-first-retest-01.json` |
| **commit** | `dc930c5` |
| **honesty** | `contracts_printable_ready=false` |

---

## Gates

| Gate | Command | Result |
|------|---------|--------|
| **L0 stack** | `pnpm run qc:dev-stack` | **PASS** — hrm-api `:28001` **200** · xbos **200** · portal **200** (Windows UV exit quirk) |
| **L0 FE↔BE** | `pnpm run qc:fe-be-health` | **exit 0** |
| **BE unit** | `jest po-hrm-ctr-workspace-g4-subject-rec-nv-first-01` + related | **13/13 PASS** |

---

## DEF-CTR-G4-SUBJECT-REC-400 — retest verdict

| Check | Before fix | After fix (this run) |
|-------|------------|----------------------|
| NV-first Tiếp POST | **400** `HRM-CTR-SUBJECT-REC-400` | **201** `HRM-CON-201` |
| `employee_id` | NV101 UUID | `33333333-3333-4333-8333-333333333333` |
| `candidate_id` on pilot NV | `null` (no REC trace) | unchanged — **allowed** per BA-03 |
| Step2 opens | **no** | **yes** (`ctr-create-step-2` visible) |

**DEF-CTR-G4-SUBJECT-REC-400 → CLOSED**

---

## Matrix (in-scope rows)

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-02** | **PASS** | NV pick **Le Van C — NV101** · POST **201** · Step2 **open** · no `HRM-CTR-SUBJECT-REC-400` |
| **WS-G4-06** | **PASS** | DnD palette→canvas · `canvasAfter=1` · **0** DnD storms · nút **Gỡ** visible |
| **WS-G4-07** | **PASS_WITH_HOLD** | Mandatory gỡ — spot check only (confirm dialog not exercised) |
| **WS-G4-04** | **PASS** | F5 list row `QG4NVO3QNLZ` **visible** after Lưu |

---

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-CREATE-01** | **PASS** | Step1 NV-first → Tiếp → POST 2xx → Step2 opens |
| **J-HRM-CTR-CREATE-02** | **PASS** | DnD clause on Step2 · no `@hello-pangea/dnd` storm |

**L2 + L2.5 CREATE chain PASS** for NV-first NV101 slice.

---

## UF block (browser — NV-first CREATE)

| Step | Verdict | Evidence |
|------|---------|----------|
| Login → CC contracts | **PASS** | URL `command-center/hrm/contracts` |
| Tạo HĐ → NV-first Step1 | **PASS** | tab **Nhân viên** default · picker visible |
| NV pick **NV101** → **Tiếp** | **PASS** | POST **201** · Step2 open |
| **FE sau POST** | **PASS** | `ctr-create-step-2` visible · toast success path |
| DnD Step2 | **PASS** | 1 clause on canvas · Gỡ visible |
| Lưu → F5 | **PASS** | row `QG4NVO3QNLZ` on list |

### Click path

`ceo@xe.vn` login → Command Center → HRM **Hợp đồng** → **Tạo HĐ** → tab **Nhân viên** → chọn **Le Van C — NV101** → mẫu **XEVN_FT_12M_DRIVER** · ngày ký · Hình thức · tỉ lệ 100% · trích yếu → **Tiếp** → Step2 DnD → **Lưu** → F5.

### Network (mutate)

```json
{
  "employee_post": {
    "status": 201,
    "employee_id": "33333333-3333-4333-8333-333333333333",
    "subject_type": "employee",
    "start_date": "2026-08-11",
    "code": "HRM-CON-201",
    "message": "Contract created"
  }
}
```

**No** `HRM-CTR-SUBJECT-REC-400`. U65: zero-seed; pilot NV101 `candidate_id: null`.

---

## Console / DnD

| Check | Value |
|-------|--------|
| DnD storms | **0** |
| console errors (blocking) | **none** on CREATE path |
| `validateDOMNesting` | not observed this run |

---

## Screenshots

| Path | Row |
|------|-----|
| `docs/qa/evidence/screens/po-hrm-ctr-g4-nv-first-retest-01/01-step1.png` | Step1 NV-first + NV101 |
| `docs/qa/evidence/screens/po-hrm-ctr-g4-nv-first-retest-01/02-step2.png` | Step2 clause canvas |
| `docs/qa/evidence/screens/po-hrm-ctr-g4-nv-first-retest-01/03-after-save.png` | After Lưu |
| `docs/qa/evidence/screens/po-hrm-ctr-g4-nv-first-retest-01/04-f5-list.png` | F5 — row persisted |

---

## Promoted / not promoted

**Promoted:**

- `DEF-CTR-G4-SUBJECT-REC-400` **CLOSED**
- WS-G4-02 / WS-G4-06 / WS-G4-07 / WS-G4-04 (NV-first slice)
- J-HRM-CTR-CREATE-01 / J-HRM-CTR-CREATE-02
- BA-03 NV-first policy: legacy NV without REC trace may CREATE

**Not promoted (carry):**

- `contracts_printable_ready=false` — **cấm** UF-HRM-10 full claim
- WS-G4-07 mandatory gỡ confirm — **PASS_WITH_HOLD** (spot only)
- `DEF-CTR-G4-EDIT-DEEPLINK-P1` — orthogonal P1 carry
- FE banner «Mở tuyển dụng» when `employee.candidate_id` null (BR-CTR-CREATE-08 UI) — not asserted this run

---

## Defects

| ID | Sev | Mô tả | Owner | Status |
|----|-----|--------|-------|--------|
| **DEF-CTR-G4-SUBJECT-REC-400** | P0 | NV-first Tiếp → REC-400 when `candidate_id` null | dev-be | **CLOSED** |
| **DEF-CTR-G4-CREATE-START-DATE-400** | P0 | start_date VAL-001 | dev-be | **CLOSED** (prior retest) |
| **DEF-CTR-G4-EDIT-DEEPLINK-P1** | P1 | edit deep-link carry | dev-fe | OPEN (orthogonal) |

---

## completion_report

**Closed:** U65 browser NV-first CREATE on NV101 — Step1→Tiếp POST **201** (not `HRM-CTR-SUBJECT-REC-400`); Step2 opens; DnD PASS; Lưu + F5 row PASS; WS-G4-02/06/07 + J-HRM-CTR-CREATE-01/02 PASS; L0 + BE jest 13/13 PASS.

**Residual:** `contracts_printable_ready=false`; WS-G4-07 mandatory confirm not fully exercised; BR-CTR-CREATE-08 FE banner for NV without UV link — dev-fe if not already wired; edit deep-link P1 carry.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-QC-01
role: qc
read_first:
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-subject-rec-nv-first-retest-01.md
  - docs/qa/evidence/po-hrm-ctr-workspace-be-subject-rec-nv-first-01.md
entry_criteria: QA PASS_TO_PM NV-first NV101 CREATE chain; L0 PASS; DEF-CTR-G4-SUBJECT-REC-400 CLOSED
exit_criteria: GWC narrow slice — honesty contracts_printable_ready=false; cấm UF-HRM-10; promote WS-G4-02/06/07 + J-HRM-CTR-CREATE-01/02; list not promoted carry
evidence_path: docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md
ack_status: GO_WITH_CONDITIONS | NO-GO
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-subject-rec-nv-first-retest-01.md`  
**ack_status:** **PASS_TO_PM**
