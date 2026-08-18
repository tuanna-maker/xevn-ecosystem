# Evidence rollup — PO-UC-TC-W4-QA-B2-HRM-MD

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B2-HRM-MD` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | true |
| **persona** | `ceo@xe.vn` holding (`companyId=main`) · AU `du-lich.ceo@xe.vn` |
| **portal** | `http://127.0.0.1:5173` |
| **commit** | `dc930c5` |
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b2-hrm-md-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-b2-hrm-md/` |
| **script** | `scripts/qa/_tmp-po-uc-tc-w4-qa-b2-hrm-md-browser.mjs` |
| **seat_verdict** | **FAIL** (MD-02 UI_PASS · MD-01 P0 FE submit · MD-03/04 HP BLOCKED U65 · AU ADR §5 PASS) |

> **Domain:** by-uc `HRM-MD-01..04` = **employee metadata change-request** queue (`/hr/employee-metadata` · UF-HRM-11 · UC-HRM-26), **không** phải settings-catalog pull. Leave L2 **not invented**. Phase1 / UAT DONE **not claimed**.

---

## L0 + fe-be-health

| Probe | Result |
|-------|--------|
| `qc:dev-stack` hrm/xbos/portal | **200** (Windows exit noise after green health lines OK) |
| `qc:fe-be-health` | **ALL PASS** |
| Seed | **không** chạy `pnpm seed:*` |

---

## HDSD inventory (U76)

1. Login holding `ceo@xe.vn` / `Xevn@2026`
2. Deep-link **Hàng chờ metadata** → `/hr/employee-metadata?portal=1&companyId=main` (UF-HRM-11)
3. **Gửi yêu cầu metadata mới** — Mã trường + Giá trị đề nghị → **Gửi yêu cầu** (MD-01)
4. List pending GET `…/change-requests` (MD-02)
5. **Duyệt** / **Từ chối** (MD-03/04) — HP requires FE-origin pending
6. AU: member `du-lich.ceo` + `company_id=main`

---

## must_keep (untouched this seat)

| Lock | Touched? |
|------|----------|
| AT-12 L1 approve CLOSED | **no** |
| CREATE-CATALOG CLOSED | **no** |
| CI01 iframe CLOSED | **no** |
| BR-WF-04 self-FD CLOSED | **no** |
| IM-01/02/04 UI_PASS | **no** |
| Leave L2 | **not invented / not PASS** |

---

## UC verdicts (browser P0)

| UC | Verdict | P0 evidence |
|----|---------|-------------|
| **HRM-MD-02** | 🟢 **UI_PASS** | OPEN land «Hàng chờ metadata» · GET `…/change-requests` **200** `HRM-META-200` · no Sync ERROR |
| **HRM-MD-01** | 🔴 **FAIL** | Empty FD: **Gửi yêu cầu** disabled **PASS**. HP: FE POST create → **400** `HRM-VAL-001` `current_value must be a json string` · no row · F5 empty. Plain placeholder text also 400 (scalar `@IsJSON`) |
| **HRM-MD-03** | 🟡 **BLOCKED** | HP blocked (U65 no seed after create FAIL). Empty-inbox FD honest when no CTA. OBS on prior pending: POST approve → **`HRM-META-202`** (wire OK; **not** HP) |
| **HRM-MD-04** | 🟡 **BLOCKED** | HP blocked same. OBS reject → **`HRM-META-203`** (wire OK; **not** HP) |

### Root cause (MD-01 P0)

`submitEmployeeMetadataChangeRequest` always sets:

```ts
current_value: serializeMetadataJsonValue(payload.current_value ?? null) // → 'null'
```

BE DTO `@IsOptional() @IsJSON() current_value` + `validator.isJSON` rejects JSON `null` (`!!null === false`) → **400** on every UI submit.

API probe control (no `current_value` + object JSON) → **201** `HRM-META-201` (proves BE create path alive).

Secondary: plain string `requested_value` → `'"text"'` also fails `@IsJSON` (requires object).

### Sample Network (no secrets)

```text
GET  /api/hrm/employee-metadata/change-requests?company_id=main&status=pending → 200 HRM-META-200
POST /api/hrm/employee-metadata/change-requests → 400 HRM-VAL-001 (FE UI — current_value:"null")
# API probe (control, not U65 HP): omit current_value + {"code":"…"} → 201 HRM-META-201
POST …/change-requests/{id}/approve → HRM-META-202  (OBS non-FE-origin row)
POST …/change-requests/{id}/reject  → HRM-META-203  (OBS non-FE-origin row)
# AU corrected (ADR §5 · same as IM03 retest):
# AU-1 holding + xe-du-lich → 409 SCOPE_CONTEXT_MISMATCH
# AU-2 main + xevn → 409 SCOPE_CONTEXT_MISMATCH
# AU-3 main + xe-du-lich → 200 HRM-META-200 total=2 (own bucket; not group leak)
```

### Screens

`docs/qa/evidence/screens/po-uc-tc-w4-qa-b2-hrm-md/` — `01-md02-open` · `02-md01-fd-empty` · `02b-md01-plain-text` · `03-md01-submit` · `05-md03-obs-approve` · `08-md04-obs-reject`

---

## by-uc honesty stamp

Updated `docs/qa/professional/by-uc/{HRM-MD-01,HRM-MD-02,HRM-MD-03,HRM-MD-04}.md`:

| UC | execution | uat_done |
|----|-----------|----------|
| MD-01 | FAIL | **false** |
| MD-02 | UI_PASS | **false** |
| MD-03 | BLOCKED | **false** |
| MD-04 | BLOCKED | **false** |

---

### AU (ADR §5 — corrected)

| Case | Actual | Verdict |
|------|--------|---------|
| Member → holding / xe-du-lich | **409** `SCOPE_CONTEXT_MISMATCH` | 🟢 |
| Member → main / xevn | **409** `SCOPE_CONTEXT_MISMATCH` | 🟢 |
| Member → main / xe-du-lich | **200** `HRM-META-200` | 🟢 (own bucket; not 403) |

Initial harness wrongly expected 403/409 on AU-3 — **superseded** by IM03 ADR-WAIVER retest pattern. **No AU residual.**

---

## Residual → PM dispatch

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-B2-MD01-SUBMIT-ISJSON** | **P0** | **dev-fe** | Omit `current_value` when null; accept/wrap plain scalar `requested_value` for placeholder «Chuyên viên QA». Retest: UI Gửi → **201** `HRM-META-201` + F5 row. Then QA retest MD-03/04 HP from FE-origin pending. |
| Leave L2 | — | — | **not touched** |
| Phase1 / UAT DONE | — | — | **not claimed** |

---

### R1 supersession (2026-08-04)

Retest **`PO-UC-TC-W4-QA-B2-HRM-MD-R1`** → seat **PASS** · `R-W4-B2-MD01-SUBMIT-ISJSON` **CLOSED** · evidence: `docs/qa/evidence/po-uc-tc-w4-qa-b2-hrm-md-r1.md`

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-B2-HRM-MD
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b2-hrm-md-rollup.md
next_owner: pm
uat_done: false
seat_verdict: FAIL
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-DEV-FE-B2-MD01-SUBMIT-ISJSON
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
u65_zero_seed: true

## CONTEXT
QA W4-B2 HRM-MD FAIL. FE metadata submit always 400 HRM-VAL-001.
evidence: docs/qa/evidence/po-uc-tc-w4-qa-b2-hrm-md-rollup.md
must_keep: AT-12 L1 · CREATE-CATALOG · CI01 · BR-WF-04 · IM-01/02/04 UI_PASS · Leave L2 SPEC_GAP

## ROOT CAUSE
apps/web/hrm/src/integrations/hrmApi.ts submitEmployeeMetadataChangeRequest:
- always sends current_value: serializeMetadataJsonValue(null) → 'null'
- BE @IsJSON rejects JSON null (validator.isJSON)
- plain scalar requested_value → '"text"' also fails @IsJSON (needs object)
API control without current_value + object JSON → 201 HRM-META-201

## FIX
1) Omit current_value when null/undefined (do not send 'null' string)
2) Wrap plain string requested_value as JSON object (or align BE DTO) so placeholder «Chuyên viên QA» works
3) Unit/regression on serialize + submit payload
4) READY_FOR_QA — browser: Gửi yêu cầu → 201 HRM-META-201 + F5 row; then Duyệt 202 + Từ chối 203 FE-origin

## CẤM
seed · invent Leave L2 · apps/api unless dual-lane with PM · Phase1 DONE
```
