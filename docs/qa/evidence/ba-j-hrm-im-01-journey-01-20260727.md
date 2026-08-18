# BA — J-HRM-IM-01 journey map ADD (`BA-J-HRM-IM-01-JOURNEY-01`)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-J-HRM-IM-01-JOURNEY-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **lane** | governance · journey map (non-blocking soft from QC IM-01) |
| **execution_date** | `2026-07-27` |
| **trigger** | QC-HRM-IM-01-PREVIEW-AC-01 **GWC** condition **C-IM01-JMAP-01** |
| **qc_evidence** | `docs/qa/evidence/qc-hrm-im-01-preview-ac-01-20260727.md` |
| **qa_evidence** | `docs/qa/evidence/qa-hrm-im-01-preview-ac-01-20260727.md` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed honored (no seed in this WI) |
| **HOLD_DEPLOY** | **YES** — local PASS only |
| **Phase1 / PROD / :8088** | **NONE** — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** :8088 |
| **IM-02** | **OUT** — not invented · not claimed |

---

## 1. Closed scope

| Deliverable | Result |
|-------------|--------|
| ADD **J-HRM-IM-01** to `docs/program/PROGRAM_JOURNEY_MAP.md` | **DONE** (row after J-HRM-CO-01; incident log entry) |
| PILOT matrix pointer | **DONE** — `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` L2.5 table |
| BA trace pointer (U19) | **DONE** — `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` §10 UX + §19 |
| Host **J-HRM-02** | **must_keep** — not wiped / status unchanged |
| Local PASS cite QC | **DONE** — status cites QC GWC + QA preview AC |

---

## 2. Journey definition (SoT)

| Field | Content |
|-------|---------|
| **J-ID** | **J-HRM-IM-01** |
| **Journey** | Nhân sự → Import Excel preview (non-persist) |
| **Persona** | Group CEO `ceo@xe.vn` · `company_id=main` |
| **Click path** | P-CC-03 **Employees** → **Import Excel** → upload sheet → **preview** table → **Cancel** → **F5** |
| **Host** | **J-HRM-02** (employees list) — list→detail parity unchanged |
| **spec_ref** | **FR-HRM-IM-01** · UC HRM-IM-01 Diễn biến preview · AC-IM-01-SCOPE/SESSION/VAL |
| **Network AC** | `POST /api/hrm/spreadsheet/import/preview` → **HTTP 200** + envelope **`SHEET-200`** · `dryRun` |
| **Persist AC** | **Zero persist** — no employee INSERT; no commit path; headcount stable across Cancel/F5 |
| **U65** | FE-only browser chain; **cấm** seed |
| **OUT** | HRM-IM-02 commit (`SHEET-201`) · export IM-03 · staging invent |

### Acceptance (measurable — cite QC)

| # | Criterion | Pass/Fail evidence |
|---|-----------|-------------------|
| AC-J-IM-01-01 | Click path completes without crash; preview dialog shows rows | QC §4.3 screenshots · QA runtime |
| AC-J-IM-01-02 | Network preview **HTTP 200** + **`SHEET-200`** | QC §4.2 · runtime `httpExact200` |
| AC-J-IM-01-03 | Cancel + F5 → dialog closed; employee total unchanged (zero persist) | QC AC-IM-01-SCOPE-01/SESSION-02 · totals 1109→1109 |
| AC-J-IM-01-04 | No commit / no IM-02 claim | QC `commitCalls=[]` · condition C-IM01-IM02-OUT |
| AC-J-IM-01-05 | Map row local PASS · **HOLD_DEPLOY** / **NOT :8088** | This evidence + journey map Status column |

**Verdict:** ✅ **PASS local** (governance map sync; product already GWC under QC-HRM-IM-01-PREVIEW-AC-01).

---

## 3. Explicit non-claims

- **NOT** invent IM-02 journey or AC.
- **NOT** touch `apps/**`.
- **NOT** seed.
- **NOT** Phase 1 DONE / PROD-READY / Dev8088 promote.
- **NOT** overwrite **J-HRM-02** PASS/GWC history.

---

## 4. Condition closure

| ID | Prior | After this WI |
|----|-------|---------------|
| **C-IM01-JMAP-01** | OPEN (soft) — optional BA add J-HRM-IM-01 | **CLOSED** (map + matrix + BA trace) |
| **C-IM01-LOCAL-01** | HOLD_DEPLOY | **Still OPEN** (PM/sponsor promote) |
| **C-IM01-IM02-OUT** | OUT | **Still OUT** |

---

## Residual

| ID | Sev | Status | Note |
|----|-----|--------|------|
| HOLD_DEPLOY / :8088 | — | OPEN | Local-only; promote = separate WI |
| IM-02 commit journey | — | OUT | Do not invent until sponsor opens |
| Product P0/P1 | — | None | No Dev reopen |

---

## completion_report

- **Closed:** Soft QC condition **C-IM01-JMAP-01** — added **J-HRM-IM-01** to journey map + PILOT matrix pointer + BA trace; click path + FR-HRM-IM-01 + Network 200/`SHEET-200` + zero persist + U65 documented; local PASS cites QC GWC; HOLD_DEPLOY / NOT :8088; host **J-HRM-02** preserved.
- **Residual:** HOLD_DEPLOY / IM-02 OUT / NOT Phase1-PROD-:8088 (unchanged product conditions).

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-BA-J-HRM-IM-01-JOURNEY-01
from_role: ba-process
to_role: pm
entry: BA-J-HRM-IM-01-JOURNEY-01 PASS_TO_PM — docs/qa/evidence/ba-j-hrm-im-01-journey-01-20260727.md
actions:
1) Bus INTAKE — mark C-IM01-JMAP-01 CLOSED (soft journey map)
2) Confirm PROGRAM_JOURNEY_MAP has J-HRM-IM-01 local PASS · HOLD_DEPLOY · NOT :8088
3) Do NOT open IM-02; do NOT promote :8088 / Phase1 / PROD from this WI
4) must_keep J-HRM-02 · FR-HRM-IM-01 preview GWC already recorded
5) Continue pm:idle:check — next open WI unrelated unless sponsor opens commit wave
ack_status: PASS_TO_PM
```

### evidence_path

`docs/qa/evidence/ba-j-hrm-im-01-journey-01-20260727.md`

### ack_status

**PASS_TO_PM**
