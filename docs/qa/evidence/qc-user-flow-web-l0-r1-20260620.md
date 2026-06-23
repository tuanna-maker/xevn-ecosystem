# QC gate — P1-USER-FLOW-WEB-QC-L0-R1 (local web — C1–C3 closure)

| Field | Value |
|-------|-------|
| work_item_id | `P1-USER-FLOW-WEB-QC-L0-R1` |
| from_role | pm |
| to_role | qc |
| date | 2026-06-20 |
| prior_gate | `docs/qa/evidence/qc-user-flow-web-l0-20260620.md` (GWC C1–C6) |
| wave | `docs/program/WEB_UAT_DEV8088_WAVE.md` W2 R1 |
| matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3–§4 |
| portal | `http://127.0.0.1:5173` |
| ack_status | **PASS_TO_PM** |

---

## 1. Entry criteria audit (C1–C3)

| ID | UF-ID | QA evidence | Pack verify | Matrix Local | Product verdict |
|----|-------|-------------|-------------|--------------|-----------------|
| **C1** | UF-XBOS-05 | `docs/qa/evidence/p1-xbos-holding-shr-fix-20260620-qa.md` | **FAIL 2/8** (process) | **🟢** | **CLOSED** — browser CC → TẬP ĐOÀN → Thêm cổ đông → POST **201** on holding UUID `bad45b73-…` + F5 persist `QA-UF05-F5-20260620`; L0 exit 0 |
| **C2** | UF-HRM-02 | `docs/qa/evidence/p1-hrm-con-notes-persist-20260620-qa.md` | **PASS 8/8** | **🟢** | **CLOSED** — POST/PATCH `notes` + GET-by-id F5 surrogate; defect `D-UF-WEB-HRM-02-01` closed; J-HRM-03 |
| **C3** | UF-HRM-09 | `docs/qa/evidence/p1-hrm-hrbp-emp-patch-20260620-qa.md` | **PASS 8/8** | **🟢** | **CLOSED** — `du-lich.hr@xe.vn` PATCH **200** `HRM-EMP-202`; negative employee peer **403**; jest 11/11; defect `D-UF-WEB-HRM-09-01` closed |

**Prior GWC conditions C1–C3:** **CLOSED** on product evidence + matrix promotion.

---

## 2. Evidence pack audit (Layer B)

| Evidence file | `verify:qc:evidence-pack` | Notes |
|---------------|---------------------------|-------|
| `p1-xbos-holding-shr-fix-20260620-qa.md` | **FAIL 2/8** | Missing machine `ack_status:` line + J-* id — **process only**; product browser trace sufficient for C1 |
| `p1-hrm-con-notes-persist-20260620-qa.md` | **PASS 8/8** | Authoritative for C2 |
| `p1-hrm-hrbp-emp-patch-20260620-qa.md` | **PASS 8/8** | Authoritative for C3 |
| `qc-user-flow-web-l0-20260620.md` | N/A (QC) | Superseded for C1–C3 disposition |

**Process finding (C5 carry):** QA should add `ack_status: PASS_TO_PM` + `J-CC-02` (or `J-HRM-*`) to C1 pack before next READY_FOR_QC — does **not** reopen UF-XBOS-05 product status.

---

## 3. Scope statement (bounded)

**In scope (local `:5173` web):** UF-XBOS-03..09; UF-HRM-01..06; UF-HRM-09; UF-HRM-13 (member CEO).

**Out of scope (do not block this gate):** UF-HRM-07/08 mobile; `:8088` Dev8088 column (W4); Phase 1 program closure; PROD cutover.

---

## 4. UF operability verdict (Local column — post R1)

### XBOS (UF-XBOS-03..09)

| UF-ID | Matrix | QC concurrence | Classification |
|-------|--------|----------------|----------------|
| UF-XBOS-03 | 🟢 | **PASS** | PRODUCT |
| UF-XBOS-04 | 🟢 | **PASS** | PRODUCT |
| UF-XBOS-05 | 🟢 | **PASS** | PRODUCT — C1 closed; browser + API holding UUID |
| UF-XBOS-06 | 🟢 | **PASS** | PRODUCT |
| UF-XBOS-07 | 🟢 | **PASS** | PRODUCT |
| UF-XBOS-08 | 🟢 | **PASS** | PRODUCT |
| UF-XBOS-09 | 🟢 | **PASS** | PRODUCT |

### ECS / HRM web

| UF-ID | Matrix | QC concurrence | Classification |
|-------|--------|----------------|----------------|
| UF-HRM-01 | 🟢 | **PASS** | PRODUCT — J-HRM-01/02 list→detail |
| UF-HRM-02 | 🟢 | **PASS** | PRODUCT — C2 closed; API F5 surrogate |
| UF-HRM-03 | 🟢 | **PASS** | PRODUCT |
| UF-HRM-04 | 🟢 | **PASS** | PRODUCT |
| UF-HRM-05 | 🟢 | **PASS** | PRODUCT |
| UF-HRM-06 | 🟢 | **PASS** | PRODUCT |
| UF-HRM-07 | ⚪ | **N/A** | Mobile — out of web wave |
| UF-HRM-08 | ⚪ | **N/A** | Mobile — out of web wave |
| UF-HRM-09 | 🟢 | **PASS** | PRODUCT — C3 closed; HRBP scoped PATCH |
| UF-HRM-13 | ⬜ | **UNTESTED** | Process gap — member CEO UI mutate |

**Slice score (in-scope web):** **14 🟢 · 0 🔴/🟡 P1 · 1 ⬜** (UF-HRM-13)

---

## 5. L2.5 / journey coverage

| Journey | Web relevance | R1 evidence | QC audit |
|---------|---------------|-------------|----------|
| J-CC-01..03 | CC login / units / KPI | UF-XBOS-01,02,10 🟢 (W1) | Concurred |
| J-CC-02 | Settings → member/holding units | UF-XBOS-05 browser R1 | **PASS** — C1 |
| J-HRM-03 | Contract create/edit + F5 | UF-HRM-02 API R1 | **PASS** — C2 (API surrogate) |
| J-HRM-01..07 | HRM embed | UF-HRM-01..06 🟢 | **GWC** — iframe click not automated; API parity PASS |
| J-MOB-01..05 | Mobile | ⚪ N/A | Not gated |

L2.5 browser click for HRM iframe and member CEO UI remain **API-surrogate acceptable** for **local :5173 GWC**; **not** sufficient for sponsor `:8088` demo sign-off without W4 browser retest.

---

## 6. Classification (ENV vs PRODUCT)

| Item | Class | Disposition |
|------|-------|-------------|
| UF-XBOS-05 holding shareholder | PRODUCT | **CLOSED** C1 |
| UF-HRM-02 contract `notes` | PRODUCT | **CLOSED** C2 |
| UF-HRM-09 HRBP PATCH 403 | PRODUCT | **CLOSED** C3 |
| UF-HRM-13 member CEO UI | PRODUCT (deferred) | **Open** C4 — not P0 for W3 deploy |
| C1 QA pack verify FAIL | PROCESS | **Open** C5 — normalize template |
| `:8088` Dev8088 column | ENV/deploy | **Open** C6 — W4 after W3 |
| UF-HRM-02 browser iframe F5 | PRODUCT P2 | Deferred — API F5 sufficient for local |
| xbos-api dev startup (ts-node) | ENV P2 | Tracked `P1-DEVOPS-XBOS-NEST-DEV-01`; L0 PASS in QA |

---

## 7. QC verdict

### **GO WITH CONDITIONS (local web :5173 — W2 R1 uplift)**

**Promoted:**

- Local `:5173` web user-flow slice **14/15** in-scope UF **🟢** on Local column.
- Prior P1 blockers **UF-XBOS-05**, **UF-HRM-02**, **UF-HRM-09** closed.
- **W3 deploy APPROVED:** `P1-DEPLOY-8088-WEB-UAT-01` may proceed — stack smoke + portal `:8088` 200.

**NOT promoted:**

- **NOT** `:8088` sponsor demo GO (requires W4 QA + W5 QC-8088)
- **NOT** Phase 1 DONE / full UAT-READY HRM web mutate
- **NOT** member CEO web slice USER-OK until UF-HRM-13 executed

### Conditions (remaining before W5 demo GO)

| ID | Condition | Owner | Trigger |
|----|-----------|-------|---------|
| **C4** | UF-HRM-13 ⬜ — `du-lich.ceo@xe.vn` contract/employee mutate UI + F5 | **qa** | Before claiming full member web USER-OK |
| **C5** | C1 evidence pack passes `verify:qc:evidence-pack` (add `ack_status:` + J-CC-02) | **qa** | Next READY_FOR_QA normalization |
| **C6** | Dev8088 column — retest in-scope UF on `:8088` after W3 deploy | **qa** → **qc** | `P1-USER-FLOW-WEB-QA-8088` / W4 |

**Closed this gate:** C1, C2, C3 (from prior `qc-user-flow-web-l0-20260620.md`).

---

## 8. Command spot-check (QC read-only)

| Command | Exit | Notes |
|---------|------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-con-notes-persist-20260620-qa.md` | **0** | 8/8 PASS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-hrbp-emp-patch-20260620-qa.md` | **0** | 8/8 PASS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-xbos-holding-shr-fix-20260620-qa.md` | **1** | 2/8 FAIL — process; product OK |

Full `qc:dev-stack` not re-run this QC turn — C1–C3 QA files document L0 PASS exit 0.

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| UF-HRM-13 member CEO UI | qa | C4 — untested ⬜ |
| C1 QA pack format | qa | C5 — add `ack_status:` + J-* |
| Dev8088 column | qa → qc | C6 — W4 after W3 |
| UF-HRM-02 browser iframe F5 | qa | P2 — API surrogate sufficient local |
| xbos-api dev startup | devops | ENV P2 — L0 recovered |

---

## 9. Residual risk

1. **Demo script:** TẬP ĐOÀN shareholder + HRBP employee edit + contract notes — **cleared for local :5173**; re-verify on `:8088` after W3 (C6).
2. **Member CEO:** `du-lich.ceo@xe.vn` mutate paths untested (C4) — avoid demo narrative on member CEO edit until W4+.
3. **Program gates:** `phase1:gate`, G4/G5, 111 UC matrix — unchanged; wave-local only.

---

## Handoff

**completion_report:** Audited C1–C3 closure against matrix + QA evidence. C1/C2/C3 product **CLOSED** (UF-XBOS-05 🟢 browser, UF-HRM-02 🟢 notes F5, UF-HRM-09)
**next_owner:** pm

**next_dispatch_prompt:**

```
Role: devops
work_item_id: P1-DEPLOY-8088-WEB-UAT-01
from_role: qc
to_role: devops
entry_criteria: qc-user-flow-web-l0-r1-20260620.md GWC — W3 deploy APPROVED; local :5173 14/15 UF 🟢; C1–C3 closed
Tasks:
1) Deploy web portal + ensure hrm-api/xbos-api reachable from VPS :8088 per docs/program/WEB_UAT_DEV8088_WAVE.md W3
2) Smoke: portal HTTP 200, login ceo@xe.vn, APIs health
3) Evidence: docs/qa/evidence/p1-deploy-8088-web-uat-20260620.md — READY_FOR_QA
Exit: READY_FOR_QA
ack_status: READY_FOR_QA
```

**evidence_path:** `docs/qa/evidence/qc-user-flow-web-l0-r1-20260620.md`

**ack_status:** **PASS_TO_PM**
