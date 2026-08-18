# CD-FB-07-WF-CANVAS-QA — AC-CD-F4-06 browser (resolver_type + Lưu + F5)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-WF-CANVAS-QA` |
| **Date** | 2026-07-19 |
| **Role** | `qa` |
| **Lane** | execution |
| **Maps to** | QC **C-CD-FB-07-02** / **AC-CD-F4-06** |
| **Parent** | `docs/qa/evidence/cd-fb-07-wf-dynamic-qc-20260719.md` · FE READY `cd-fb-07-wf-canvas-01-20260719.md` |
| **spec_ref** | ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620 §5 · delta F4 AC-CD-F4-06 · UC-XBOS-13 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` |
| **Environment** | portal `:5173` · hrm `:28001` · xbos `:28002` |
| **U65** | Zero-seed · no reopen TEXT/uuid P0 · no leave-picker CLOSED reopen |
| **ack_status** | **PASS_TO_PM** |

---

## Executive verdict

**PASS** — AC-CD-F4-06 canvas/graph `resolver_type` edit → **Lưu** → **F5** persist.

Recommend **QC close C-CD-FB-07-02**.

---

## L0 stack

| Check | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** |
| xbos-api `:28002` | HTTP **200** |
| web-portal `:5173` | HTTP **200** |
| `qc:dev-stack` exit | Windows UV assert after healthy print = **ENV flake** (known) — treat L0 **PASS** |

---

## Fixture note (U65)

| Item | Observation |
|------|-------------|
| `hrm_leave_approval` in FE list / GET definitions | **Absent** (11 product defs; QA/DO codes only) |
| Seed to create leave def | **Cấm** (U65) — not done |
| Fixture used for AC-CD-F4-06 | Existing product def **`DO-INBOX-1781934428730`** `id=cd795bd2-e0f3-4a88-a2ed-56122c3fce86` |

AC-CD-F4-06 is **canvas persist** of `resolver_type` / config — validated on live catalog definition without seed. Leave-code-specific live spawn remains **C-CD-FB-07-03** (out of this wave).

---

## Click path (browser)

1. Login session already active as `ceo@xe.vn` (JWT in `xevn.portal.accessToken`).
2. Command Center → **CÀI ĐẶT HỆ THỐNG** → **Hệ thống quy trình**.
3. Deep link / **Chỉnh sửa** on `DO-INBOX-1781934428730`.
4. Tab **Cấu hình bước & luồng** → step 1 **Loại resolver động**: Legacy → **`position_template`**.
5. Fill **`position_code`=`TRUONG_PHONG`**, `company_id` slug=`main`.
6. Tab **Sơ đồ luồng** → step card badge shows **`position_template`**.
7. **Lưu quy trình**.
8. Hard reload deep link `?settings=workflow&wfId=cd795bd2-…` (F5 equivalent).
9. Re-open editor → step 1 still **`position_template`** + `TRUONG_PHONG` + canvas badge.

### UF evidence block

### UF-CD-FB-07-F4-06 — Canvas resolver persist
- Persona / URL / click path: `ceo@xe.vn` · `/command-center?settings=workflow&wfId=cd795bd2-e0f3-4a88-a2ed-56122c3fce86` · edit resolver → Lưu → reload
- Trước mutate: step1 resolver = Legacy (empty)
- Action: set `position_template` + `TRUONG_PHONG` → **Lưu quy trình**
- Network: **PUT** `/api/xbos/workflow-engine/definitions/cd795bd2-e0f3-4a88-a2ed-56122c3fce86` → **200** `XBOS-WF-201`
- Payload step1: `"resolver_type":"position_template"`, `"resolver_config":{"position_code":"TRUONG_PHONG","company_id":"main"}`
- **FE sau 2xx:** toast «Đã lưu quy trình lên workflow-engine (DB).»; canvas badge `position_template`
- F5 / reload: graph select **Chức danh (position_template)**; `position_code=TRUONG_PHONG`; list GET step1 `resolver_type=position_template`
- Verdict: 🟢
- spec_ref: AC-CD-F4-06 · C-CD-FB-07-02
- spec_gap: none for persist AC

---

## Journey / L2.5

| Journey | Status |
|---------|--------|
| **J-XBOS-01** pattern (settings → WF definition edit → save → reload) | **PASS** |
| Leave inbox / TEXT uuid / leave-picker | **Not reopened** (out of scope) |

---

## command_table

| Command | Exit / result |
|---------|----------------|
| `pnpm run qc:dev-stack` | Healthy 200×3; Windows UV assert after print (ENV flake) |
| Browser PUT definitions/:id | **200** `XBOS-WF-201` |
| Browser GET definitions list → step1 | `resolver_type=position_template`, `position_code=TRUONG_PHONG` |

---

## Must-not-reopen

| Item | Status |
|------|--------|
| TEXT / `::uuid` P0 (`D-CD-FB-07-RESOLVER-COMPANY-TEXT`) | **Not reopened** |
| Leave-picker CLOSED (`C-CD-FB-07-01`) | **Not reopened** |
| Phase1 / PROD claim | **None** |

---

## Residual

| ID | Note |
|----|------|
| **C-CD-FB-07-03** | Live position/parallel on **leave** path / `hrm_leave_approval` catalog row — still open under U65 (def not in list) |
| DO-INBOX mutated | Step1 left as `position_template`/`TRUONG_PHONG` for evidence; optional revert not required for C-02 close |

---

## completion_report

### Closed
- Browser AC-CD-F4-06: edit `resolver_type` + config → Lưu PUT 200 → F5 UI + API persist
- Graph fields + canvas badge both show persisted type
- U65: no seed; TEXT/uuid + leave-picker untouched

### Open
- C-CD-FB-07-03 (live leave position/parallel) — not this wave
- Standing no Phase1/PROD

---

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: CD-FB-07-WF-CANVAS-QC
from_role: pm
to_role: qc
lane: governance
entry: QA PASS AC-CD-F4-06 — docs/qa/evidence/cd-fb-07-wf-canvas-qa-20260719.md PASS_TO_PM
exit: close C-CD-FB-07-02 if evidence OK; do not reopen TEXT/uuid or leave-picker; no Phase1/PROD
evidence: docs/qa/evidence/cd-fb-07-wf-canvas-qc-YYYYMMDD.md (or amend parent GWC)
```

**ack_status:** **PASS_TO_PM**  
**evidence_path:** `docs/qa/evidence/cd-fb-07-wf-canvas-qa-20260719.md`  
**pm_dispatch_hint:** `CD-FB-07-WF-CANVAS-QC` — close C-CD-FB-07-02
