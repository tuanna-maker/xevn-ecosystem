# Evidence — PO-HRM-BP-ATT-SIGN-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-SA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | governance · Spec-first Manifest pilot |
| **change_manifest_path** | `docs/program/examples/change-manifest.sample.json` |
| **prior_evidence** | `docs/qa/evidence/po-hrm-bp-att-sign-db-api-01.md` (TR-CM-09/10 PASS) |
| **ack_status** | **PASS_TO_PM** |
| **stall_recovery** | **YES** — evidence re-sealed with on-disk anchors + AS-IS Nest readout (no `apps/**` edit) |
| **apps/** | **not touched** |
| **Attendance CLOSED / product GO / D7 signed / Face LIVE / remaster DONE** | **not claimed** |

---

## 1. Purpose

SA closure for ATT-SIGN **scope parity plan** (signatures + sheet get-by-id vs list sheets), **OpenAPI/Nest path alignment** notes, **TR-CM-16 readiness path**, and **UC boundary** confirmation (only **UC-BP-ATT-11** — no invented UC).

Does **not** advance Manifest to `ready_for_dev` or set `traceability.scope_parity_ack: true` until Dev-BE implements resolver + jest neo (see §6).

---

## 2. spec_read_ack

| Artifact | Path / § | Status |
|----------|----------|--------|
| **BA handoff** | `docs/qa/evidence/po-hrm-bp-att-sign-db-api-01.md` | READ · TR-CM-09/10 PASS |
| **SRS** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-11** · BR-BP-TS-02 · R-SIGN-01 | READ |
| **TechSpec** | `TECHSPEC_HRM_ENTERPRISE.md` **§6.4** · §6.4.3–6.4.4 | READ |
| **DB_DESIGN** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.6.1** `att_timesheet_sign_step` | READ |
| **API_DESIGN** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-WF-SIGN-01/02** · **F-ATT-SHEET-02/03/04** | READ |
| **Slice** | `docs/program/slices/HRM-ATT-SIGN-01.md` | READ · UPDATED DoD SA row |
| **ADR scope** | `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` · **§13** (APPEND) | READ · UPDATED |
| **ADR path** | `docs/architecture/ADR-HRM-ATT-SHEET-HTTP-PATH-20260805.md` | **ADD** |
| **Manifest** | `change-manifest.sample.json` · `pipeline_stage=db_api` | READ · traceability note only |

```markdown
## spec_read_ack (handoff)
- srs: `SRS_HRM_ENTERPRISE.md` FR-UC-BP-ATT-11 · Diễn biến #1–#3 · BR-BP-TS-02 · không UC ngoài ATT-11 cho wave ký
- tech_spec: `TECHSPEC_HRM_ENTERPRISE.md` §6.4 · F-ATT-WF-SIGN · TR-CM-16 defer Dev
- db_design: `DB_DESIGN_HRM_ENTERPRISE.md` §4.6.1 · FK header · scope via header.company_id
- api_design: `API_DESIGN_HRM_ENTERPRISE.md` F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/04 · path canonical § DOC-DELTA SA-01
- sponsor_confirm: CONFIRMED 2026-08-05 · PO-HRM-BP-SRS-CHOT-01
- change_mode: ADD (architecture/docs only)
```

---

## 3. UC boundary (no invent beyond UC-BP-ATT-11)

| ID | In wave? | Role |
|----|----------|------|
| **UC-BP-ATT-11** | **Yes** | SoT — ký chốt bảng công |
| FR-UC-BP-ATT-10 / F-ATT-SHEET-01 | Prerequisite only | Aggregate → `submitted`; **not** a new UC in Manifest `uc_ids` |
| FR-UC-BP-PAY-* | Consumer only | Reads closed sheet; out of ATT-SIGN dev slice |
| XBOS WF master | External SoT | ATT = consumer; §6.4.2 — **không** invent UC WF trong HRM |

**Verdict:** Wave remains **`uc_ids: ["UC-BP-ATT-11"]` only** — APIs F-ATT-SHEET-02/03 are terminal/reopen **within** ATT-11, not separate UC.

---

## 4. Scope parity plan (list ↔ get ↔ signatures)

### 4.1 Resolver chain (same as sheet list / mutate AS-IS)

Per **ADR-HRM-RBAC-SCOPE-LADDER** §7.3, §13 and **`AttendanceCatalogService`** (`apps/api/hrm-api/src/attendance/attendance-catalog.service.ts` — read-only SA audit):

**AS-IS (AT-14 sheet catalog — baseline for ATT-11 sign routes):**

```text
GET list (controller): assertBusinessAccess → resolveScopeContext(authorization, { tenantId, companyId })
GET list (service):    resolveHrmListScope(authorization, companyId) → pushCompanyIdFilter → SELECT attendance_sheets

PATCH/DELETE (controller): assertBusinessAccess only — no resolveScopeContext today
PATCH (service):           resolveHrmListScope(authorization, companyId)
                           → SELECT company_id BY id → assertResourceInHrmScope(row, scope, HRM-AS-404 / HRM-AS-409)
DELETE (service):          resolveHrmListScope + pushCompanyIdFilter on DELETE WHERE id
```

**Note:** Sheet list/mutate does **not** call `normalizePayrollListCompanyId` (unlike leave/OT/payroll modules). ATT-11 signatures **must** copy this **catalog** chain first so list ↔ get ↔ sign stay aligned; optional uplift to payroll-normalize on sheets is a **separate** AT-14 parity item — out of UC-BP-ATT-11 scope unless PM bundles it in `PO-HRM-BP-ATT-SIGN-BE-01`.

**TO-BE (Dev-BE — one header gate):**

```text
Controller (new routes): assertBusinessAccess → resolveScopeContext(authorization, { tenantId, companyId })
Service:                 assertAttendanceSheetHeaderInScope(sheetId, authorization, companyId)
                           = same resolveHrmListScope + peek row + assertResourceInHrmScope as updateAttendanceSheet
                           → return header row for sign/close/get-by-id
```

**List sheets (AS-IS):** `GET /api/hrm/attendance/attendance-sheets?company_id=` — scope on `attendance_sheets.company_id` (logical SoT post-migration: `att_timesheet_header.company_id`).

### 4.2 Endpoints — single header resolver (Dev-BE)

| F-id | Method / path (canonical HTTP — see §5) | Must use same resolver as list? |
|------|-------------------------------------------|----------------------------------|
| List (existing) | `GET …/attendance-sheets` | Baseline |
| **F-ATT-SHEET-04** | `GET …/attendance-sheets/{id}` | **Yes** — **GAP AS-IS** (no GET-by-id today) |
| **F-ATT-WF-SIGN-02** | `GET …/attendance-sheets/{id}/signatures` | **Yes** — same as F-ATT-SHEET-04 |
| **F-ATT-WF-SIGN-01** | `POST …/attendance-sheets/{id}/signatures` | **Yes** — same as PATCH sheet |
| **F-ATT-SHEET-02** | `POST …/attendance-sheets/{id}/close` | **Yes** |
| **F-ATT-SHEET-03** | `POST …/attendance-sheets/{id}/reopen` | **Yes** |
| PATCH/DELETE sheet (existing) | `PATCH|DELETE …/attendance-sheets/{sheetId}` | **Yes** — pattern to copy |

**Implementation seam (Dev-BE):** extract `assertAttendanceSheetHeaderInScope(sheetId, authorization, { tenantId, companyId })` in `attendance-catalog.service.ts` (or dedicated `attendance-sheet-scope.ts`) — **one function** invoked from get-by-id, signatures, close, reopen, patch, delete.

**Legal-entity / company:** Scope is **`company_id` TEXT slug + workforce rollup** on header row — **not** a separate legal-entity resolver for ATT-11. Group CEO rollup uses existing `expandHrmTextCompanyIds` / workforce filters where list already rolls member companies; signatures **must not** widen scope beyond list visibility for the same JWT + `company_id` query.

### 4.3 Parity test neo (TR-CM-16 runtime)

| Test id | Assert |
|---------|--------|
| SP-ATT-SIGN-01 | Id visible in list ⇒ GET `{id}` + GET `{id}/signatures` → **200** same `header_id` |
| SP-ATT-SIGN-02 | Id **outside** rollup scope ⇒ list omit + GET `{id}` → **404** (or **409** scope) — **never 200 leak** |
| SP-ATT-SIGN-03 | Member mgr JWT slug vs row stored slug — mutate sign matches **leave/OT approve** parity (PO-MFD-M2 pattern) |
| SP-ATT-SIGN-04 | `company_id=xevn` + JWT `main` → **409** before DB read on sign GET |

**Suggested file:** `apps/api/hrm-api/src/attendance/attendance-sheet-scope-parity.spec.ts` (Dev-BE — out of SA scope).

---

## 5. OpenAPI / Nest path alignment

| Layer | Path pattern | Notes |
|-------|--------------|--------|
| **API_DESIGN (logical)** | `/api/hrm/att/attendance-sheets/...` | Module tag `att` — **logical namespace** |
| **Nest AS-IS** | `/api/hrm/attendance/attendance-sheets/...` | `@Controller('attendance')` + global `api/hrm` |
| **Drift** | Segment `att` vs `attendance` | **Flagged** — not scope-related |

**Decision (ADR):** [`docs/architecture/ADR-HRM-ATT-SHEET-HTTP-PATH-20260805.md`](../../architecture/ADR-HRM-ATT-SHEET-HTTP-PATH-20260805.md) — **canonical HTTP** for GĐ1 implementation = **`/api/hrm/attendance/attendance-sheets`** (preserve AT-14 FE). API_DESIGN DOC-DELTA stamps physical path; optional future alias `/api/hrm/att/...` = **non-breaking** add-on only.

**OpenAPI export:** When Dev adds sign/close/get-by-id, register under **`attendance`** controller paths; map F-id in `@ApiTags('attendance-sheets')` — no new top-level `/att` controller until sponsor breaking-change wave.

**No Nest code change in this work item.**

---

## 6. TR-CM-16 / `scope_parity_ack` / `ready_for_dev`

| Gate | Status after SA |
|------|-----------------|
| TR-CM-09 / 10 | **PASS** (ba-data) |
| TR-CM-16 / VAL-CM-P-16 | **OPEN** — design ack **here**; runtime **false** until Dev tests |
| `traceability.scope_parity_ack` in Manifest | **Stay `false`** until `SP-ATT-SIGN-01..04` green |
| `pipeline_stage` | **Stay `db_api`** — advance to `ready_for_dev` only after PM dispatch Dev + `scope_parity_ack: true` |

**Path to green TR-CM-16:**

1. Dev-BE: shared header resolver + endpoints F-ATT-WF-SIGN-01/02, F-ATT-SHEET-02/04 (+ migration §4.6.1 when product wave opens).
2. Dev-BE: `attendance-sheet-scope-parity.spec.ts` + extend `attendance.controller.spec.ts` for new routes.
3. PM/QC: flip Manifest `scope_parity_ack: true` + `pipeline_stage: ready_for_dev` in same commit as spec PASS evidence.

**SA design ack:** Scope parity **plan approved** — criteria in §4.3; **not** runtime ack.

---

## 7. completion_report

**Closed:** Scope parity matrix list ↔ GET sheet ↔ GET/POST signatures; resolver aligned with ADR scope ladder + existing catalog PATCH/DELETE; HTTP path drift documented with ADR + API_DESIGN DOC-DELTA; UC-BP-ATT-11 boundary confirmed; slice DoD SA row; ADR §13 append.

**Open:** Dev-BE implementation; TR-CM-16 jest; Manifest `scope_parity_ack`; UF-HRM-ATT-SIGN browser (AC-ATT-SIGN-04); physical DB migration.

---

## 8. next_owner / next_dispatch_prompt

| Field | Value |
|-------|--------|
| **next_owner** | `dev-be` (primary) · `ba-process` (UF-HRM-ATT-SIGN journey AC text if needed before QA) |
| **ack_status target** | Dev `READY_FOR_QA` only after code + scope spec — not this wave |

**next_dispatch_prompt (copy-ready):**

```text
work_item_id: PO-HRM-BP-ATT-SIGN-BE-01
role: dev-be
read_first: docs/qa/evidence/po-hrm-bp-att-sign-sa-01.md · docs/qa/evidence/po-hrm-bp-att-sign-db-api-01.md · API_DESIGN F-ATT-WF-SIGN-01/02 · DB §4.6.1 · ADR-HRM-ATT-SHEET-HTTP-PATH-20260805.md · ADR-HRM-RBAC-SCOPE-LADDER §13
entry_criteria: pipeline_stage=db_api; SA scope plan ACK; forbidden until sponsor product wave for migrations per slice
exit_criteria: assertAttendanceSheetHeaderInScope shared; GET/POST …/signatures + GET …/{id} + POST …/close/reopen; attendance-sheet-scope-parity.spec.ts SP-ATT-SIGN-01..04 PASS; flip Manifest scope_parity_ack + ready_for_dev with evidence
allowed_paths: apps/api/hrm-api/src/attendance/** · prisma/migrations only when PM unlocks product wave
spec_read_ack: required · CODE-MEMORY UC-BP-ATT-11
forbidden: seed for UAT · claim Attendance CLOSED
```

Optional parallel (governance):

```text
work_item_id: PO-HRM-BP-ATT-SIGN-UF-BA-01
role: ba-process
read_first: SRS FR-UC-BP-ATT-11 · docs/qa/USER_FLOW_OPERABILITY_MATRIX.md UF-HRM-ATT-SIGN slot
exit_criteria: UF-HRM-ATT-SIGN click path + AC post-mutation FE rows for QA dispatch (no new UC)
```

---

## 9. pm_dispatch_hint

- SA **PASS_TO_PM** — safe to dispatch **Dev-BE** with §8 prompt; **do not** set `scope_parity_ack: true` or `ready_for_dev` on Manifest until jest evidence.
- ba-process UF row can run **parallel** to Dev spec work; QA AC-ATT-SIGN-04 remains **blocked** on product + U65.

---

## 10. On-disk verification (stall recovery anchors)

| Check | Path | Anchor |
|-------|------|--------|
| SA evidence | `docs/qa/evidence/po-hrm-bp-att-sign-sa-01.md` | This file · `ack_status: PASS_TO_PM` |
| Prior db/api | `docs/qa/evidence/po-hrm-bp-att-sign-db-api-01.md` | TR-CM-09/10 PASS |
| HTTP path ADR | `docs/architecture/ADR-HRM-ATT-SHEET-HTTP-PATH-20260805.md` | Canonical `attendance/attendance-sheets` |
| Scope ADR §13 | `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` | `## 13. ATT sheet scope parity` |
| API physical paths | `API_DESIGN_HRM_ENTERPRISE.md` | F-ATT-WF-SIGN-01/02 · `POST/GET …/attendance/attendance-sheets/{id}/signatures` |
| API DOC-DELTA | same header | `PO-HRM-BP-ATT-SIGN-SA-01` |
| Manifest | `change-manifest.sample.json` | `pipeline_stage=db_api` · `scope_parity_ack: false` |
| Slice DoD | `docs/program/slices/HRM-ATT-SIGN-01.md` | SA scope plan **[x]** |
| TR-CM-16 | `CHANGE_MANIFEST_VALIDATION_MATRIX.md` | OPEN until BE neo green |

**Contract drift:** Logical `/api/hrm/att/…` vs Nest `/api/hrm/attendance/…` — **documented** in ADR-HRM-ATT-SHEET-HTTP-PATH-20260805; **no** second ADR append required beyond §13 scope rules.

---

*End evidence PO-HRM-BP-ATT-SIGN-SA-01.*
