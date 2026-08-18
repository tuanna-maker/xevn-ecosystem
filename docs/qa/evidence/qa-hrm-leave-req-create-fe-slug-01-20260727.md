# QA-HRM-LEAVE-REQ-CREATE-FE-SLUG-01 — Leave create POST `company_id` TEXT slug

| Field | Value |
|-------|--------|
| **Date** | 2026-07-27 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-LEAVE-REQ-CREATE-FE-SLUG-01` |
| **Prior FE** | `docs/qa/evidence/fe-hrm-leave-req-create-01-20260727.md` (`READY_FOR_QA`) |
| **Prior UF** | `docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md` §7 — POST **201** (UUID body, superseded for slug AC) |
| **Env** | Portal `:5173` · hrm-api `:28001` · xbos `:28002` · `ceo@xe.vn` |
| **Runner** | `scripts/qa/qa-hrm-leave-req-create-fe-slug-01.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-qa-hrm-leave-req-create-fe-slug-01-runtime.json` |
| **Screenshot** | `docs/qa/evidence/_tmp-qa-hrm-leave-req-create-fe-slug-01-f5.png` |
| **Constraints** | **U65 zero-seed** · **HOLD_DEPLOY** · **NOT** `:8088` · **NOT** Settings MD |
| **Overall** | **PASS** |

---

## 0. L0 / stack

| Check | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** (qc:dev-stack) |
| `GET :28002/api/xbos` | **200** |
| Portal `:5173` | **200** |
| Seed | **not used** |
| Settings MD | **not opened** |

---

## 1. AC matrix (light smoke)

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | `ceo@xe.vn` → `:5173` → Attendance → Nghỉ phép → Tạo → `LVT_01` → Gửi | **PASS** | URL `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` · picker `LVT_01` Phép năm · **Gửi yêu cầu** |
| 2 | Network POST `company_id` === TEXT slug `holding` (NOT holding UUID) · status **201** | **PASS** | Request `"company_id":"holding"` · **201** `HRM-LEAVE-201` · id `45efd625-610f-4921-b283-49f5b17dbe2a` |
| 3 | F5 list row still present | **PASS** | Danh sách yêu cầu · UI emp + Phép năm · API list hit by `createdId` |
| 4 | U65 · HOLD_DEPLOY · NOT `:8088` · no seed · no Settings MD | **PASS** | Constraints held |

---

## 2. UF block (browser)

- **Persona / URL / click path:** `ceo@xe.vn` → `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` → tab **Nghỉ phép** → **Tạo yêu cầu nghỉ** → Employee `PORTAL-GCEO` · Leave type `LVT_01` · dates `23/01/2027` → **Gửi yêu cầu** → F5 → **Danh sách yêu cầu**
- **Trước mutate:** Catalog picker SoT includes `LVT_01`; employee API sample `company_id=holding` (TEXT)
- **Action:** Fill + **Gửi yêu cầu** · marker `QA-LEAVE-SLUG-MS2N3D77`
- **Network:** `POST /api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201`
- **FE sau 2xx:** Submit ok; list persist after reload
- **F5:** Row present (CEO / Phép năm / Chờ duyệt); API hit `id=45efd625-…`
- **Verdict:** 🟢
- **spec_ref:** TechSpec §14.5 FR-HRM-AT-10 / UC-HRM-10 · §14.9 **G-AT10-01** TEXT · FE `resolveHrmLeaveCreateCompanyId`

---

## 3. POST body snapshot (authoritative — slug gate)

**Request (browser Network):**

```json
{
  "company_id": "holding",
  "employee_id": "678b9cb2-c59a-4b1e-b257-ce93033ba2f3",
  "employee_code": "PORTAL-GCEO",
  "employee_name": "CEO Tập đoàn",
  "department": "CEO",
  "position": "CEO",
  "leave_type": "LVT_01",
  "start_date": "2027-01-23",
  "end_date": "2027-01-23",
  "total_days": 1,
  "handover_tasks": "QA-LEAVE-SLUG-MS2N3D77"
}
```

| Assert | Expected | Actual | Verdict |
|--------|----------|--------|---------|
| `company_id` type | TEXT slug | `"holding"` | **PASS** |
| Not holding UUID | ≠ `10000000-0000-4000-8000-000000000001` | not UUID | **PASS** |
| HTTP status | **201** | **201** | **PASS** |
| Response code | `HRM-LEAVE-201` | `HRM-LEAVE-201` | **PASS** |

**Contrast (prior §7):** same UF posted holding **UUID** `10000000-…-0001` → BE mapped to `holding`. This WI closes FE slug preference.

---

## 4. L2.5

| J-* | Result |
|-----|--------|
| Create mutate only (light smoke) | **PASS** create→201→F5; full J-HRM-06 list→detail **not** in scope this WI |

---

## 5. Residuals

| Residual | Sev | Owner | Status |
|----------|-----|--------|--------|
| FE POST `company_id` UUID vs slug | P1 | **dev-fe** | **CLOSED** — body is `holding` |
| HOLD_DEPLOY · NOT `:8088` | — | pm | unchanged |
| Settings MD / full matrix | — | out of scope | not touched |

---

## 6. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qa-hrm-leave-req-create-fe-slug-01-20260727.md`

### completion_report

**Closed:** Light smoke after `D-HRM-LEAVE-REQ-CREATE-FE-01` — portal `:5173` leave create with `LVT_01` → POST **201** `HRM-LEAVE-201`; Network request `company_id` is TEXT slug **`holding`** (not holding UUID); F5 list row + API persist by id. Prior P1 FE slug residual **CLOSED**. U65 zero-seed. HOLD_DEPLOY. Settings MD not opened. NOT `:8088`.

**Open:** none product for this WI.

### next_dispatch_prompt

```
work_item_id: QA-HRM-LEAVE-REQ-CREATE-FE-SLUG-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence: docs/qa/evidence/qa-hrm-leave-req-create-fe-slug-01-20260727.md
summary: Light smoke PASS — POST leave-requests company_id="holding" (TEXT slug, not UUID) · 201 HRM-LEAVE-201 · F5 list persist id=45efd625-… · portal :5173 · U65 · HOLD_DEPLOY.
optional_next: QC GWC only if leave-create slug is in current gate pack; else close residual P1 FE slug on matrix.
cấm: seed · Settings MD reopen · :8088 without sponsor
```
