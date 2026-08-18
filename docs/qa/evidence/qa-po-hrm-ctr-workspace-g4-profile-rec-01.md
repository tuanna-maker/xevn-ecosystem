# Evidence — PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QA-01` |
| **role** | `qa` |
| **runner_stamp** | **`CTRG4PR-MSO684W1`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_HOLD** · `contracts_printable_ready=false` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/employees/{id}` · REC `/recruitment` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `UI-HRM-CTR-PROFILE-DEEP-LINK.md` · `UI-HRM-CTR-HIRE-CTA.md` |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-profile-rec-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-profile-rec-qa-01.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | `pnpm run qc:dev-stack` — hrm + xbos + portal **200** |
| L0 FE↔BE | `pnpm run qc:fe-be-health` — **exit 0** |

## U65 prereq (no seed)

```json
{
  "employees": {
    "status": 200,
    "count": 3,
    "first": {
      "id": "33333333-3333-4333-8333-333333333333",
      "company_id": "trsport",
      "company_uuid": "10000000-0000-4000-8000-000000000002",
      "company_display_name": "Công ty Cổ phần Thương mại và Dịch vụ X.E",
      "employee_code": "NV101",
      "email": "ops.manager@xe.vn",
      "full_name": "Le Van C",
      "display_name": "Le Van C",
      "job_title_key": "OPS_MANAGER",
      "job_title_label": null,
      "department": null,
      "phone_number": null,
      "manager_id": null,
      "status": "active",
      "status_label": "Đang làm việc",
      "statusLabelVi": "Đang làm việc",
      "hired_at": "2026-02-10T17:00:00.000Z",
      "archived_at": null,
      "avatar_url": null,
      "candidate_id": null,
      "custom_fields": {},
      "created_at": "2026-08-10T05:37:17.564Z",
      "updated_at": "2026-08-10T05:37:17.564Z",
      "checklist_complete": null,
      "blocking_items": null,
      "can_activate": null,
      "activated_at": null
    },
    "with_employee_id": [],
    "without_employee_id": [
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "company_id": "trsport",
        "company_uuid": "10000000-0000-4000-8000-000000000002",
        "company_display_name": "Công ty Cổ phần Thương mại và Dịch vụ X.E",
        "employee_code": "NV101",
        "email": "ops.manager@xe.vn",
        "full_name": "Le Van C",
        "display_name": "Le Van C",
        "job_title_key": "OPS_MANAGER",
        "job_title_label": null,
        "department": null,
        "phone_number": null,
        "manager_id": null,
        "status": "active",
        "status_label": "Đang làm việc",
        "statusLabelVi": "Đang làm việc",
        "hired_at": "2026-02-10T17:00:00.000Z",
        "archived_at": null,
        "avatar_url": null,
        "candidate_id": null,
        "custom_fields": {},
        "created_at": "2026-08-10T05:37:17.564Z",
        "updated_at": "2026-08
```

## Steps attempted

- Navigate profile /employees/33333333-3333-4333-8333-333333333333?tab=contract
- Clicked profile-tab-contract
- Click ec-open-contract-workspace-create
- No pilot candidate with employee_id — attempted REC list browse

## Matrix WS-G4-12..14

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-12** | PASS_WITH_HOLD | {"verdict":"PASS_WITH_HOLD","url":"http://127.0.0.1:5173/command-center/hrm/contracts?tab=contract","hasWorkspace":false,"hasEmp":false,"hasLock":false,"step1":true,"empTab":false,"uvTabHidden":true,"empId":"33333333-3333-4333-8333-333333333333"} |
| **WS-G4-13** | BLOCKED | {"verdict":"BLOCKED","reason":"cần nguồn từ FE hire trước — no pilot candidate with employee_id","candidates_count":5,"with_employee_id":0,"steps":["API GET recruitment/candidates — none with employee_id","U65 cấm seed — không tạo hire trong session","Cần: Login → Tuyển dụng → Ch |
| **WS-G4-14** | BLOCKED | {"verdict":"BLOCKED","reason":"phụ thuộc WS-G4-04 mutate + hire-readiness F5 — không chạy full chain profile/REC trong slice này","note":"cần nguồn từ FE hire trước nếu chưa có HĐ active cho NV mới hire"} |

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-PROFILE-01** | PASS | {"verdict":"PASS","clickPath":"profile → tab HĐ → Thêm HĐ → workspace create"} |
| **J-HRM-CTR-HIRE-01** | BLOCKED | {"verdict":"BLOCKED","u65":true} |
| **J-HRM-REC-07-03** | BLOCKED | {"verdict":"BLOCKED","carry":"hire-readiness banner after HĐ"} |

## Screenshots

- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-profile-rec-01/01-profile-add-contract.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-profile-rec-01/02-rec-list-no-hired-uv.png`

## UF blocks (browser)

### UF-WS-G4-12 — Profile tab HĐ → workspace create

- **Persona / URL:** `ceo@xe.vn` → `http://127.0.0.1:5173/command-center/hrm/employees/33333333-3333-4333-8333-333333333333?tab=contract`
- **Click path:** Hồ sơ NV101 → `profile-tab-contract` → `ec-open-contract-workspace-create`
- **FE sau click:** `ctr-create-step-1` **visible** · UV tab **hidden** (`uvTabHidden: true`)
- **URL parent:** `…/hrm/contracts?tab=contract` — **không** thấy `workspace=create` / `lock_subject_employee=1` trên parent (embed merge — residual P2 URL evidence)
- **Verdict:** 🟡 **PASS_WITH_HOLD** (workspace mở; query lock trên parent URL chưa assert được)

### UF-WS-G4-13 — REC «Tạo HĐ» CTA

- **Prereq probe:** `GET …/recruitment/candidates` → **5** UV · **0** có `employee_id`
- **Steps attempted:** Mở REC tab ứng viên — không có UV hired để hiện `rec-hire-cta-create-contract`
- **U65:** Cấm seed — **không** chạy accept-offer mutate trong session QA này
- **Verdict:** 🟡 **BLOCKED** — *cần nguồn từ FE hire trước* (Login → Tuyển dụng → Chấp nhận offer → CTA «Tạo HĐ»)

### UF-WS-G4-14 — Hire-readiness sau HĐ

- **Verdict:** 🟡 **BLOCKED** — phụ thuộc full chain hire → HĐ → F5 hire-readiness

---

## Promoted / not promoted

**Promoted:**

- **J-HRM-CTR-PROFILE-01** — profile → Thêm HĐ → workspace Step1 (in-scope G3 launcher)
- **WS-G4-12** — PASS_WITH_HOLD (workspace opens; URL lock params residual)

**Not promoted:**

- **WS-G4-13** / **J-HRM-CTR-HIRE-01** — BLOCKED U65 (no hired UV in pilot)
- **WS-G4-14** / **J-HRM-REC-07-03** — BLOCKED (downstream hire-readiness)
- `contracts_printable_ready=false` retained

---

## Defects / residual

| ID | Sev | Mô tả | Owner | Status |
|----|-----|--------|-------|--------|
| **DEF-CTR-G4-PROFILE-URL-P2** | P2 | Profile «Thêm HĐ» mở Step1 nhưng parent URL thiếu `workspace`/`lock_subject_employee` query | dev-fe | **OPEN** (cosmetic evidence) |
| **REC-HIRE-CTA-U65** | INFO | Không UV `employee_id` trong pilot — WS-G4-13 BLOCKED hợp lệ U65 | product | **carry** |

---

## completion_report

**Closed:** L0 PASS; U65 browser WS-G4-12 profile launcher (`profile-tab-contract` + `ec-open-contract-workspace-create`) → workspace Step1 opens; UV tab hidden; screenshots captured.

**Residual (explicit):** WS-G4-13 REC «Tạo HĐ» **BLOCKED** — 0/5 candidates có `employee_id`; cần full FE hire chain (accept-offer) trước khi retest CTA. WS-G4-14 hire-readiness BLOCKED. Parent URL lock query not visible (P2). `contracts_printable_ready=false` unchanged.

## next_owner

`pm` → narrow QC seal carry; optional `qa` REC-07 FE hire chain when product unblocks U65 hire path without seed

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QC-01
role: qc
read_first:
- docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-rec-01.md
- docs/program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md
entry_criteria: QA PASS_TO_PM WS-G4-12 PASS_WITH_HOLD; WS-G4-13/14 BLOCKED U65 documented; L0 PASS
exit_criteria: GWC narrow — promote J-HRM-CTR-PROFILE-01; carry WS-G4-13/14 BLOCKED; honesty contracts_printable_ready=false; do not claim UF-HRM-10
evidence_path: docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-profile-rec-01.md
ack_status: GO_WITH_CONDITIONS
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-rec-01.md`  
**ack_status:** **PASS_TO_PM**
