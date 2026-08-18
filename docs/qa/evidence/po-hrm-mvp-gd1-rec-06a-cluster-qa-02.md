# Evidence — PO-HRM-MVP-GD1-REC-06A-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-4) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-06a` |
| **depends_on** | BE-02 READY_FOR_QA · `po-hrm-mvp-gd1-rec-06a-cluster-be-02.md` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed · browser-primary · **no** `pnpm seed:*` |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE** · DENY module REC UAT |
| **stamp** | `REC06AQA2-MSKZ58NH` |
| **ack_status** | **PASS_TO_PM** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| API-01 | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md` F-REC-IV-02/03/04 · R-A PATCH · status PATCH |
| BA-01 | AC-REC-IV-03..06 · R01/R04/R05 · J-HRM-REC-IV-03..06 |
| BE-02 | Projection `active_interview_id` nested+flat · R-REC-IV-PROJ-ID CLOSED L1 |
| QA-01 | Prior FAIL manage missing id · J-01/02/07 RETAIN |
| FE-01 | ManageActiveInterviewDialog cancel / no_show / R-A |

---

## L0 stack

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** |

### Entry LIVE projection (ceo@ · company_id=main)

| Row | nested `active_interview_id` | flat | status |
|-----|------------------------------|------|--------|
| Tuấn `tuanna@unicomhub.com` | `71cab875-faac-48bd-aeb8-93f4cf3d9e82` | same | `scheduled` |

→ **R-REC-IV-PROJ-ID CLOSED** confirmed at entry (BE-02 seal).

**OBS:** L1 past-datetime POST returned `400 HRM-VAL-001` (not `HRM-REC-IV-400-PAST-DATETIME`) while ACTIVE present — orthogonal to residual J-03..06; prior QA-01 sealed PAST after rebuild. Not hard-fail this seat.

---

## Browser U65 — J-HRM-REC-IV-03..06

**Harness:** `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-06a-cluster-qa-02.mjs`  
**Machine log:** `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-06a-cluster-qa-02.json`  
**Screenshots:** `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qa-02/01–08`  
**URL:** `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates`  
**Click path:** Login CEO → Tuyển dụng → Ứng viên → Tất cả → row **Tuấn** (`tuanna@unicomhub.com`)

### UF / J-HRM-REC-IV-06 — Open ACTIVE manage with id

- Persona / URL / click: badge «Đã có lịch» → `manage-active-interview-dialog`
- **FE:** `manage-interview-id-missing` **ABSENT** · cancel/no_show/Đổi lịch **enabled**
- Path: `badge` · `missingId=false` · schedule dialog **not** SoT
- Verdict: 🟢 **PASS**

### UF / J-HRM-REC-IV-05 — R-A Đổi lịch

- Action: Manage → **Đổi lịch** → pick time ≠ current → **Lưu đổi lịch**
- Network: `PATCH /api/hrm/recruitment/interviews/71cab875-…?company_id=main` → **200** `HRM-REC-204` · **same id** · `scheduled_at=2026-08-11T01:00:00.000Z`
- **0** POST create during R-A
- **FE sau 2xx:** badge time changed
- F5: badge «Đã có lịch» persists
- Verdict: 🟢 **PASS**

### UF / J-HRM-REC-IV-03 — Cancel → round 2

- Action: Manage → **Hủy lịch** → Xác nhận hủy (reason optional O6)
- Network: `PATCH …/interviews/71cab875-…/status?company_id=main` → **200** `HRM-REC-204`
- **FE sau 2xx:** badge cleared («—» / no «Đã có lịch»)
- Round 2: calendar schedule → `POST /api/hrm/recruitment/interviews` → **201** `HRM-REC-203` id=`2dbc7029-…`
- F5: badge «Đã có lịch» on new ACTIVE
- Verdict: 🟢 **PASS**

### UF / J-HRM-REC-IV-04 — no_show → round 2

- Action: Manage → **Không đến**
- Network: `PATCH …/interviews/2dbc7029-…/status?company_id=main` → **200** `HRM-REC-204`
- **FE sau 2xx:** badge cleared (TERMINAL)
- Round 2: `POST /api/hrm/recruitment/interviews` → **201** `HRM-REC-203` id=`68e82c88-…`
- F5: badge «Đã có lịch»
- Verdict: 🟢 **PASS**

### UF / J-HRM-REC-IV-01 / 02 / 07 — RETAIN

- Verdict: 🟢 **PASS_RETAIN** (prior QA-01 GWC create/409/soft-gate; not re-mutated as P0 this seat)

---

## Journey / AC matrix

| ID | Verdict | Note |
|----|---------|------|
| J-HRM-REC-IV-01 | 🟢 PASS_RETAIN | create/badge |
| J-HRM-REC-IV-02 | 🟢 PASS_RETAIN | 409 / FE gate |
| J-HRM-REC-IV-03 | 🟢 PASS | cancel PATCH + round2 POST + F5 |
| J-HRM-REC-IV-04 | 🟢 PASS | no_show PATCH + round2 POST + F5 |
| J-HRM-REC-IV-05 | 🟢 PASS | R-A PATCH same id · no POST · F5 |
| J-HRM-REC-IV-06 | 🟢 PASS | manage with projection id |
| J-HRM-REC-IV-07 | 🟢 PASS_RETAIN | soft-gate ≠ 409 |
| AC-REC-IV-03 | 🟢 PASS | |
| AC-REC-IV-04 | 🟢 PASS | |
| AC-REC-IV-05 | 🟢 PASS | |
| AC-REC-IV-06 | 🟢 PASS | |
| O1 Lane A path | 🟢 PASS | only `/recruitment/interviews*` |
| Nest `/rec` dual | 🟢 DENY held | 0 hits |
| R-REC-IV-PROJ-ID | 🟢 CLOSED | entry LIVE nested=flat UUID |
| Honesty / C-SLICE | 🟢 | **no** flip `recruitment_uat_ready` |
| Seed / Lane B / W1–W3 | 🟢 DENY held | |

---

## Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| *(none P0 for J-03..06)* | — | — | Browser residual closed |
| ERR-PAST OBS | P3 | optional BE | PAST mint vs `HRM-VAL-001` when ACTIVE — not blocking this seat |
| Honesty / module UAT | — | QC | **DENY** flip · C-SLICE ≠ module GO |

---

## Honesty footer

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
J-03..06 PASS + prior IV GWC RETAIN ≠ module UAT
U65 zero-seed
REC-03 OUT · Lane B ≠ SoT · Nest /rec dual DENY
R-REC-IV-PROJ-ID CLOSED (BE-02) · browser Manage PATCH sealed
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qa-02.md` |
| **next_owner** | **qc** |
| **completion_report** | Browser L2.5 residual UC-BP-REC-06a **PASS**: Manage opens with `active_interview_id` (BE-02); J-06 manage id; J-05 R-A PATCH 200 same id + F5; J-03 cancel→round2; J-04 no_show→round2; Lane A only; RETAIN J-01/02/07. Honesty false · U65 · C-SLICE. Residual P0 empty. |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-QC-02
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-4)
uc_ids: UC-BP-REC-06a
depends_on: QA-02 PASS_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qa-02.md · stamp REC06AQA2-MSKZ58NH
entry_criteria: L0 optional recheck; read QA-02 UF blocks J-03..06 + BE-02 projection CLOSED; U65 zero-seed evidence
MISSION: Gate slice REC-06a residual cancel/no_show/R-A/manage-id. GWC or GO WITH CONDITIONS only on slice; RETAIN prior create/409/badge; DENY flip recruitment_uat_ready · Nest /rec dual · Lane B SoT · seed · reopen W1–W3 · claim module REC UAT. Seal R-REC-IV-PROJ-ID CLOSED.
exit_criteria: QC evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qc-02.md · ack PASS_TO_PM · honesty false · next_dispatch U88 continuous (sa/ba peer vertical)
```
