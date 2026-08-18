# Evidence — PO-MFD-M2-ATT-OPENAPI-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-OPENAPI-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 (M2 backlog **P2-6** / enterprise map **G-API-STUB** + **G-OPENAPI**) |
| **verdict** | **A) ACCEPTED_AS_IS_P1** — Nest `hrm-api` `/attendance/*` = **runtime + execution SoT**; client pack stubs = **OBS documentation gap** (not product FR) |
| **sponsor_confirm** | **None invented** — no claim customer OpenAPI pack is complete for Attendance |
| **dev_coding** | **Not opened** — no Nest alias rewrite; no full OpenAPI invent |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **must_keep** | Attendance TXN/CFG GWC seats already closed · matrix LIVE surfaces · **not** Attendance CLOSED · `uat_done: false` · U65 zero-seed |
| **u65_zero_seed** | true |

---

## 1. Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| `HRM-ATTENDANCE_ENTERPRISE_API_MAP.md` §2 | **G-API-STUB**: `API_CONTRACT_VN.md` / `TECH_SPEC_VN.md` do not document Nest `/attendance/*` (only generic check-in/out). Owner ba-data + sa. **G-OPENAPI**: no exported OpenAPI for hrm-api attendance in client pack — P1, sa + ba-data. |
| Same map §3 inventory | AS-BUILT path table already marks almost every Nest route **In API_CONTRACT_VN = No** (leave Partial with **path mismatch**). |
| Same map §0–C7 | UI/API fidelity for C1–C7 already governed by Nest + `docs/hrm/TECHSPEC.md`; client stub called out as **high-level only → SPEC_GAP vs Nest** (doc class, not missing Nest surface). |
| `docs/brand-new-documents-20270801/API_CONTRACT_VN.md` §3 Attendance | **Only 3 lines:** `POST /hrm/attendance/check-in`, `POST /hrm/attendance/check-out`, `GET /hrm/attendance`. Base pack URL `/api/v1` — **not** Nest `/api/hrm`. |
| Same file §3 Leave | `POST/GET /hrm/leave-requests` + approve — **prefix mismatch** vs Nest `/api/hrm/attendance/leave-requests`. |
| `TECH_SPEC_VN.md` (brand-new pack) | **No** attendance path matrix / F.1 depth (grep empty for attendance/check-in). |
| `docs/hrm/TECHSPEC.md` §12.1+ | **Execution contract depth** for sheets/records already Nest-aligned (`/api/hrm/attendance/attendance-sheets`, records, BR-ATT-SHEET). Internal SoT for Dev/QA. |
| Nest `attendance.controller.ts` + `leave-workflow.controller.ts` | Full surface: overview, records, sheets, update-requests, leave (+balance), OT/BT/LE/SC requests, **rules**, **work-sites**, work-shifts, WF resolver/terminal. **No** `check-in` / `check-out` / bare `GET /attendance` routes. |
| Repo OpenAPI artifacts | `scripts/generate-openapi*.mjs` / `verify-openapi*.mjs` exist for other waves; **no** checked-in `openapi*.yml` attendance module for client pack. Grep openapi*attendance = empty. |
| Prior SA seats | CFG persist ADR, device-rules ACCEPTED_AS_IS, enterprise map M1 — all treat **Nest AS-BUILT** as truth; client pack never promoted to runtime SoT. |

---

## 2. Stub vs Nest surface matrix (compare — not rewrite)

### 2.1 Client pack (G-API-STUB) — exhaustive for Attendance section

| Client pack path | Nest AS-BUILT equivalent | Verdict |
|------------------|--------------------------|---------|
| `POST /hrm/attendance/check-in` | **No route** — clock-in = `POST /api/hrm/attendance/records` (+ GPS/geofence BR) | **OBS mismatch** — do **not** implement check-in alias for pack parity |
| `POST /hrm/attendance/check-out` | **No route** — same records / status / auto-checkout GĐ2 | **OBS mismatch** — do **not** invent check-out endpoint Phase-1 |
| `GET /hrm/attendance` | **No bare list** — use `GET …/overview`, `…/records`, `…/attendance-sheets` | **OBS under-specified** |
| `POST/GET /hrm/leave-requests` (+ approve) | `…/attendance/leave-requests` (+ approve/reject) + `leave-balance` | **OBS path prefix** — Nest nested under attendance |

### 2.2 Nest AS-BUILT clusters (SoT) — client pack coverage

| Nest cluster (map C#) | Representative paths | In `API_CONTRACT_VN` |
|-----------------------|----------------------|----------------------|
| C1 Overview | `GET /overview` | **No** |
| C2 Records / sheets / update-requests | `GET/POST /records`, `PATCH …/status`, sheets CRUD, update-requests CRUD+approve | **No** (generic Partial at best) |
| C3 Work shifts | work-shifts CRUD | **No** |
| C4 Requests | OT / BT / late-early / shift-change | **No** |
| C5 Leave + balance | leave-requests + `leave-balance` | **Partial** wrong prefix |
| C6 Reports | No dedicated `/reports` — client RPT aggregate | N/A (by design GĐ1) |
| C7 CFG | `GET/PATCH /rules`, work-sites CRUD | **No** (map §3 table also incomplete — hygiene OBS only) |
| Internal WF | `workflow-resolver/manager`, `leave-workflow/terminal` | **No** (by design not portal) |

**Count signal (governance, not rewrite):** Nest attendance surface ≈ **40+** method/path pairs; client pack documents **3** attendance stubs + **3** leave stubs — none match Nest path shape.

### 2.3 OpenAPI machine export (G-OPENAPI)

| Question | Answer |
|----------|--------|
| Is there an exported OpenAPI attendance module in client pack? | **No** |
| Does Phase-1 execution depend on that export? | **No** — FE/Mobile/QA use Nest + `docs/hrm/TECHSPEC.md` + enterprise map |
| Full OpenAPI invent in this seat? | **Forbidden** by dispatch («Do NOT invent full OpenAPI rewrite») |

---

## 3. Options — trade-off

| Option | Meaning | Pros | Cons | Cost / ops |
|--------|---------|------|------|------------|
| **A ACCEPTED_AS_IS_P1** | Nest (+ internal TECHSPEC/map) = SoT; client pack gap = **OBS** | Unblocks QC from false FAIL on pack; no Dev thrash; matches prior M2 AS-IS pattern | Client HTML pack stays stale until GĐ2 doc sync | Governance stamp only |
| **B FR_NEEDED / contract delta Phase-1** | Force ba-data F.1 sync of entire Nest matrix into client pack **now** | Pack looks complete for customer | = **full contract rewrite** job forbids; distracts from remaining M2 fidelity; risk inventing check-in aliases | Large ba-data wave; high churn |
| **C Defer OpenAPI sync GĐ2 (sole)** | Only park G-OPENAPI; leave G-API-STUB ambiguous | Saves doc work | QC/BA may still treat pack stubs as SoT → wrong Dev (check-in/out) | Residual process risk |

### Selected: **A**

Rationale:

1. **Runtime truth** is Nest under `/api/hrm/attendance/*` — proven by controller + M1/M2 GWC seats.
2. Client pack stubs are **aspirational / high-level** (`/api/v1`, check-in/out) — **documentation OBS**, not missing product capability requiring FR_NEEDED.
3. Opening **B** would compel a Phase-1 pack rewrite of the whole attendance matrix — violates «no invent full OpenAPI rewrite» and U65 (doc churn ≠ FE acceptance).
4. **C alone** is insufficient: without A, G-API-STUB remains an open «SPEC» severity that invites wrong Dev. Under A, **G-OPENAPI full machine export** is recorded as **DEFERRED_GĐ2_CANDIDATE** (C as residual, not primary verdict).

### Rejected: **B**

No Phase-1 FR / ba-data mandatory contract delta for Attendance pack parity. Optional later ADD-only doc sync (GĐ2 or dedicated doc wave) must **map Nest → pack**, never Nest←pack invent aliases.

### Rejected as primary: **C**

Deferring «OpenAPI sync» without closing SoT ownership leaves G-API-STUB actionable against wrong SoT. A closes ownership; OpenAPI export stays deferred residual.

---

## 4. Architecture decision (authoritative)

```text
Client pack API_CONTRACT_VN / TECH_SPEC_VN  ≠  Phase-1 Attendance SoT
SoT (execution / QA / QC)               =  Nest hrm-api + docs/hrm/TECHSPEC.md
                                         + HRM-ATTENDANCE_ENTERPRISE_API_MAP.md
Client pack attendance/leave stubs      =  OBS (G-API-STUB) — do not drive Dev
Machine OpenAPI export for attendance   =  DEFERRED_GĐ2_CANDIDATE (G-OPENAPI)
```

**Invariants:**

| ID | Rule |
|----|------|
| **INV-ATT-OAPI-01** | QC/QA **must not** FAIL a Nest LIVE surface solely because it is absent from `API_CONTRACT_VN.md`. |
| **INV-ATT-OAPI-02** | Dev **must not** add `check-in` / `check-out` / bare `GET /attendance` solely to satisfy client pack stubs. |
| **INV-ATT-OAPI-03** | Leave portal paths remain under `/api/hrm/attendance/leave-requests` (existing Nest) — pack `/hrm/leave-requests` is OBS prefix only. |
| **INV-ATT-OAPI-04** | Full OpenAPI / pack F.1 rewrite = out of this P2 seat; open only via explicit PM doc wave or GĐ2. |

---

## 5. Phase-1 accepted AC (measurable — governance)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-OAPI-01** | Execution SoT for Attendance APIs = Nest `/api/hrm/attendance/*` (+ leave-workflow controller) | Evidence cites controller / TECHSPEC / map | Treat `API_CONTRACT_VN` 3-line stub as SoT |
| **AC-ATT-OAPI-02** | G-API-STUB stamped **OBS / ACCEPTED_AS_IS_P1** — not open P0 Dev | Stamp on backlog P2-6 CLOSED governance | Dispatch Dev to invent check-in/out |
| **AC-ATT-OAPI-03** | G-OPENAPI full export = **DEFERRED_GĐ2_CANDIDATE** — not Phase-1 blocker | No QC NO-GO for missing openapi.yml attendance | Block Attendance UAT solely on missing OpenAPI file |
| **AC-ATT-OAPI-04** | QA browser U65 continues against Nest paths used by FE hooks | FE Network `/api/hrm/attendance/…` | Require pack path `/api/v1/hrm/attendance/check-in` |
| **AC-ATT-OAPI-05** | No Attendance CLOSED / `uat_done=true` invented by this seat | Explicit residual open | Claim module CLOSED via doc seat |
| **AC-ATT-OAPI-06** | Optional future pack sync = **Nest→doc ADD-only**; preserve existing Nest contracts | ADD rows mapping Nest | REPLACE Nest to match check-in stubs |

---

## 6. Residual disposition

| ID | Status | Note |
|----|--------|------|
| M2 **P2-6** / **G-API-STUB** | **CLOSED — ACCEPTED_AS_IS_P1** | Nest SoT; pack OBS |
| **G-OPENAPI** machine export | **DEFERRED_GĐ2_CANDIDATE** | No invent rewrite this seat |
| Map §3 missing rules/work-sites rows | **OBS hygiene** | Non-blocking; C7 already documents; optional DOC-DELTA later |
| Client pack leave path prefix | **OBS** | Nest nested path remains SoT |
| check-in / check-out pack names | **OBS ≠ Nest** | Map to `POST /records` semantics in any future doc sync |
| Attendance CLOSED / uat_done | **Still false** | Orthogonal M2 seats remain |

### Deferred GĐ2 / doc-wave candidate (inactive)

| Candidate | Intent |
|-----------|--------|
| **DOC-ATT-OAPI-SYNC-01** | ADD-only: generate or hand-curate OpenAPI/paths from Nest controller → client pack or internal `docs/hrm/` OpenAPI slice — **Nest→doc**, never invent check-in aliases first |
| **DOC-ATT-PACK-F1-01** | Optional ba-data F.1 for payroll-critical subset (sheets/records/rules) only — scoped wave, not full rewrite in P2-6 |

**Do not** open Dev for these without PM doc-wave DISPATCHED.

---

## 7. Actors / RACI (this seat)

| Role | Responsibility |
|------|----------------|
| sa | Verdict A + AC + defer G-OPENAPI; no apps/** |
| pm | Stamp P2-6 CLOSED; do **not** open Dev for pack parity; continue other M2 |
| ba-data | Idle on mandatory Phase-1 pack rewrite; optional later DOC-ATT-* only if PM opens |
| qa/qc | Test Nest FE paths; do not NO-GO for missing client OpenAPI / check-in stub |
| dev-be / dev-fe | **Idle** for this WI |

## Forbidden honesty

- No invent full OpenAPI rewrite
- No apps/** · no seed
- No invent Attendance CLOSED / Phase1 DONE / `uat_done=true`
- No Nest `check-in`/`check-out` alias for pack cosmetics
- No overwrite `docs/hrm/SRS.md` / customer pack wipe

## Matrix / backlog stamp (for PM)

| Artifact | Stamp |
|----------|-------|
| M2 backlog **P2-6** | **CLOSED** ACCEPTED_AS_IS_P1 · Nest SoT · pack OBS · not ATT CLOSED |
| Enterprise map **G-API-STUB** | **OBS / ACCEPTED_AS_IS_P1** (severity SPEC → closed as doc OBS) |
| Enterprise map **G-OPENAPI** | **DEFERRED_GĐ2_CANDIDATE** (not Phase-1 blocker) |

---

## completion_report

**Closed:** SA governance for **PO-MFD-M2-ATT-OPENAPI-01** (M2 **P2-6** / **G-API-STUB** vs Nest attendance matrix). Verdict **A) ACCEPTED_AS_IS_P1**: Nest `hrm-api` `/api/hrm/attendance/*` (+ leave-workflow) is Phase-1 SoT; `API_CONTRACT_VN.md` 3-line check-in/out stubs + leave prefix mismatch = **OBS documentation gap**, not FR_NEEDED. **B rejected** (would force forbidden full contract rewrite). **C rejected as sole** — OpenAPI machine export recorded as **DEFERRED_GĐ2_CANDIDATE** under A. AC-ATT-OAPI-01..06. **No Dev · no apps/** · **not** Attendance CLOSED / `uat_done`.

**Open:** Optional later DOC-ATT-OAPI-SYNC-01 / scoped F.1 — only if PM opens doc wave; map §3 rules/work-sites row hygiene OBS.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-OPENAPI-SPEC-CLOSE-01
from_role: sa
to_role: pm
ack_status: PASS_TO_PM
verdict: ACCEPTED_AS_IS_P1
evidence_path: docs/qa/evidence/po-mfd-m2-att-openapi-01-spec.md

Action:
1) Bus INTAKE: close M2 P2-6 / G-API-STUB as ACCEPTED_AS_IS_P1 — Nest attendance surface = SoT; client pack stubs = OBS.
2) Stamp enterprise map: G-API-STUB → OBS closed; G-OPENAPI → DEFERRED_GĐ2_CANDIDATE (not Phase-1 blocker).
3) Do NOT dispatch dev-be/dev-fe to invent POST check-in/check-out or bare GET /attendance for pack parity.
4) Do NOT dispatch ba-data full OpenAPI/API_CONTRACT_VN rewrite in this wave (forbidden invent). Optional DOC-ATT-OAPI-SYNC-01 only as later scoped Nest→doc ADD-only if backlog capacity.
5) Do NOT invent Attendance CLOSED / uat_done=true. Continue remaining open M2 seats only.
6) QA/QC coaching: FAIL only Nest/FE contract breaks — never FAIL solely because path missing from API_CONTRACT_VN.md.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-openapi-01-spec.md`

## ack_status

**PASS_TO_PM**
