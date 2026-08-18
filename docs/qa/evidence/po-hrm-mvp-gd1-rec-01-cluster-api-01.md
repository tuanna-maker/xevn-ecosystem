# Evidence — PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01` |
| **role** | sa · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **change_mode** | Docs + client DOC-DELTA pointer · **NO** `apps/**` · **no seed** |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | DATA-01 CONFIRMED | Physical SoT `recruitment_plans` spine · cell projection · YCTD ADD cols · O1 · DENY dual table |
| 2 | SA-01 §8–§9 | F.1 disposition · HC-S1..S7 · D1–D4 sealed |
| 3 | BA-01 AC/VAL · Diễn biến | O1–O5 · FE mutate · spawn AC |
| 4 | Evidence data-01 | Align Option A · residual R-REC-HC-API = this seat |
| 5 | Paper API F-REC-HC-* | Logical alias only — stamped physical prefer |
| 6 | Nest AS-IS | `recruitment.controller.ts` plans list/create/delete/status/submit-workflow · **no** get-by-id · **no** PUT upsert · **no** spawn-requests |

---

## 2. F.1 physical lock summary

| F-id | Physical METHOD/path | Status |
|------|----------------------|--------|
| **F-REC-HC-01** | `GET/POST /recruitment/recruitment-plans` · **ADD** `GET/:planId` · **ADD** `PUT/:planId` | UPGRADE + ADD |
| **F-REC-HC-02** | `POST …/:planId/submit-workflow` | LIVE RETAIN |
| **F-REC-HC-03** | WF callback + `PATCH …/status` (+ optional approve/reject aliases) | UPGRADE semantics |
| **F-REC-HC-05** | **ADD** `POST …/:planId/spawn-requests` | UNLOCK ADD |
| Paper `/rec/headcount-plans*` | — | **alias only** · DENY Nest invent |

---

## 3. DTO ↔ column (cite DATA-01)

| API DTO | DB |
|---------|-----|
| `need_hire` | `months_data[].headcount_need_hire` |
| `headcount_current` | `months_data[].headcount_current` |
| `cell_id` | `months_data[].cell_id` → YCTD `headcount_cell_id` |
| `cell_status` / `lifecycle_status` | same JSON fields |
| `department_key` / `position_key` | dept/pos tables |
| YCTD `headcount` | `job_requisitions.headcount` |
| `headcount_mode=in_plan` | `job_requisitions.headcount_mode` |

**O1:** migrate `dx→need_hire` · `ns→current` · **FORBIDDEN** dual editors post-wave (`HRM-HC-LEGACY-DUAL`).

---

## 4. HC-S1..S7 + errors

| Lock | Stamp |
|------|-------|
| HC-S1..S7 | Spec §7 normative |
| `HRM-HC-VAL-400` · `KEY-UNKNOWN` · `LEGACY-DUAL` · `CELL-LOCKED` · `SPAWN-*` · `ACTIVATION-CFG` | Spec §8 |
| U19 scope_parity | list = get = mutate = spawn |
| BA O2 | CFG unset ⇒ `on_approve` |

---

## 5. DENY / must_keep audit

| Lock | Stamp |
|------|-------|
| Option A | **CONFIRMED** |
| XBOS WF `submit-workflow` | **RETAIN** |
| YCTD / JD / UF-HRM-12🟢 / J-HRM-05 | **must_keep** |
| REC-03 Campaign | **OUT** |
| Dual `rec_headcount_*` / Nest `/rec/headcount-plans` | **DENY** |
| Seed | **DENY** |
| `recruitment_uat_ready` | **false** |
| preserve_default | **true** |

---

## 6. Client API_DESIGN pointer

| Action | Path |
|--------|------|
| EXPAND F-REC-HC-01..03/05 physical stamp | `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` |
| Registry DOC-DELTA | same · `PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01` |
| Team SoT primary | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md` |

---

## 7. Honesty footer

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
U65 zero-seed
no apps/** this seat
```

---

## 8. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **next_owner** | **pm** → unlock **dev-be** + **dev-fe** same session |
| **completion_report** | F.1 PHYSICAL Option A locked: recruitment-plans* + ADD spawn-requests; need_hire↔headcount_need_hire; HC-S1..S7; HRM-HC-*; U19; cite DATA-01; DENY dual SoT/path/REC-03/seed/honesty flip. |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01
lane: execution · dev-be
depends_on: DATA-01 + API-01 CONFIRMED
MISSION: ensureSchema + normalize months + GET by id + PUT upsert + cell lock + POST spawn-requests (HC-S1..S7) + scope_parity jest
must_keep: XBOS WF · YCTD/JD · UF-HRM-12 · DENY /rec/headcount-plans · DENY dual table · no seed · honesty false
exit: READY_FOR_QA · evidence …-be-01.md

PARALLEL FE:
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01
MISSION: single Cần tuyển column · Định biên label · wire PUT/spawn · post-2xx F5 · U65
exit: READY_FOR_QA · evidence …-fe-01.md
```
