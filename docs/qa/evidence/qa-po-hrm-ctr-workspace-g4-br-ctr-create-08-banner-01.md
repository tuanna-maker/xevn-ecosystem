# Evidence — PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-QA-01` |
| **role** | `qa` |
| **runner_stamp** | **`CTRG4BR08-MSO6CG6X`** |
| **upstream_fe** | `docs/qa/evidence/po-hrm-ctr-workspace-fe-br-ctr-create-08-banner-01.md` |
| **prior_create** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-subject-rec-nv-first-retest-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (BR-CTR-CREATE-08 banner **CLOSED** · `contracts_printable_ready=false`) |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` §4.1 |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-g4-br-ctr-create-08-banner-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-g4-br-ctr-create-08-banner-qa-01.json` |
| **commit** | `dc930c5` |
| **honesty** | `contracts_printable_ready=false` · `seed_used=false` |

---

## Gates

| Gate | Command | Result |
|------|---------|--------|
| **L0 stack** | `pnpm run qc:dev-stack` | **PASS** — hrm-api **200** · xbos **200** · portal **200** (Windows UV exit quirk) |
| **L0 FE↔BE** | `pnpm run qc:fe-be-health` | **exit 0** |
| **FE unit** | `vitest contractEmployeeRecBanner.test.ts` + `contractWorkspace.source.test.ts` | **16/16 PASS** |

---

## Matrix (BR-CTR-CREATE-08)

| Row | Verdict | Detail |
|-----|---------|--------|
| **BR-CTR-CREATE-08-banner** | **PASS** | Tab **Nhân viên** + **Le Van C — NV101** → `ctr-create-employee-rec-hint` visible · link `ctr-create-employee-rec-link` «Mở tuyển dụng» → `/command-center/hrm/recruitment` |
| **BR-CTR-CREATE-08-post-not-blocked** | **PASS** | **Tiếp** enabled with banner visible · POST **201** `HRM-CON-201` · Step2 open |
| **BR-CTR-CREATE-08-banner-absent-with-candidate** | **PASS_WITH_HOLD** | No pilot NV with `candidate_id` set in scope (API list empty for rollup) — negative branch not exercised live |

---

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-CREATE-01** | **PASS** | NV-first Step1 → banner present → **Tiếp** → POST **201** → `ctr-create-step-2` visible |

---

## UF block (browser — BR-CTR-CREATE-08)

| Step | Verdict | Evidence |
|------|---------|----------|
| Login → CC contracts | **PASS** | URL `command-center/hrm/contracts` |
| **Tạo HĐ** → tab **Nhân viên** | **PASS** | `ctr-create-subject-tab-employee` active |
| Chọn **Le Van C — NV101** | **PASS** | picker label match · API `candidate_id: null` |
| Banner REC hint | **PASS** | `ctr-create-employee-rec-hint` + «Mở tuyển dụng» link visible |
| **Tiếp** (banner visible) | **PASS** | POST **201** · Step2 open — **not** blocked by banner |
| **FE sau POST** | **PASS** | `ctr-create-step-2` visible · no `HRM-CTR-SUBJECT-REC-400` |

### Click path

`ceo@xe.vn` login → Command Center → HRM **Hợp đồng** → **Tạo HĐ** → tab **Nhân viên** → chọn **Le Van C — NV101** → observe banner «Mở tuyển dụng» → điền mẫu **XEVN_FT** · ngày ký · Hình thức · tỉ lệ 100% · trích yếu → **Tiếp** → Step2 opens.

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

U65: zero-seed; pilot NV101 `candidate_id: null` confirmed via GET `/employees/{id}`.

---

## Console

| Check | Value |
|-------|-------|
| console errors (blocking) | **none** on banner + CREATE path |

---

## Screenshots

| Path | Row |
|------|-----|
| `docs/qa/evidence/screens/po-hrm-ctr-g4-br-ctr-create-08-banner-qa-01/01-nv101-banner.png` | NV101 + banner visible |
| `docs/qa/evidence/screens/po-hrm-ctr-g4-br-ctr-create-08-banner-qa-01/02-after-tiep-step2.png` | After **Tiếp** — Step2 |

---

## Promoted / not promoted

**Promoted:**

- **BR-CTR-CREATE-08** FE non-blocking REC banner on NV without `candidate_id`
- **J-HRM-CTR-CREATE-01** regression with banner present
- Residual P2 from `qa-po-hrm-ctr-workspace-g4-subject-rec-nv-first-retest-01.md` § not promoted → **CLOSED**

**Not promoted (carry):**

- `contracts_printable_ready=false` — cấm UF-HRM-10 full claim
- Negative branch «banner absent when NV has candidate_id» — **PASS_WITH_HOLD** (no pilot row with `candidate_id` in `company_id=main` list)
- WS-G4-07 mandatory gỡ confirm — orthogonal HOLD from prior slice
- `DEF-CTR-G4-DOM-NESTING-P2` — orthogonal P2 carry

---

## Defects

| ID | Sev | Mô tả | Owner | Status |
|----|-----|--------|-------|--------|
| — | — | No new defects this run | — | — |

---

## completion_report

**Closed:** U65 browser BR-CTR-CREATE-08 — tab **Nhân viên** → **NV101** → amber banner `ctr-create-employee-rec-hint` + link «Mở tuyển dụng» visible; **Tiếp** POST **201** with banner present (not blocked); J-HRM-CTR-CREATE-01 PASS; L0 + vitest 16/16 PASS.

**Residual:** `contracts_printable_ready=false`; banner-absent negative branch not live-tested (no pilot NV with `candidate_id` in scope); QC narrow re-gate recommended to seal BR-CTR-CREATE-08 on G4 C-SLICE.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-QC-01
role: qc
read_first:
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md
  - docs/qa/evidence/po-hrm-ctr-workspace-fe-br-ctr-create-08-banner-01.md
entry_criteria: QA PASS_TO_PM BR-CTR-CREATE-08 banner; L0 PASS; J-HRM-CTR-CREATE-01 regression PASS
exit_criteria: GWC narrow — promote BR-CTR-CREATE-08; honesty contracts_printable_ready=false; note PASS_WITH_HOLD on candidate_id negative (no pilot row); cấm UF-HRM-10; carry DOM-nesting P2 orthogonal
evidence_path: docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md
ack_status: GO_WITH_CONDITIONS | NO-GO
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md`  
**ack_status:** **PASS_TO_PM**
