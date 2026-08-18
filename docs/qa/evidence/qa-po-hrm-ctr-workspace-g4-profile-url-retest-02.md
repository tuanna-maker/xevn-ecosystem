# Evidence — PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-02` |
| **parent** | `PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-02` |
| **role** | `qa` |
| **runner_stamp** | **`CTRG4URL-MSO7HQ08`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **defects** | `DEF-CTR-G4-PROFILE-EMBED-P0` → **CLOSED** · `DEF-CTR-G4-PROFILE-URL-P2` → **CLOSED** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `UI-HRM-CTR-PROFILE-DEEP-LINK.md` |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-profile-url-retest-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-profile-url-retest-02.json` |
| **prior FE evidence** | `docs/qa/evidence/po-hrm-ctr-workspace-g4-profile-url-fe-02.md` |
| **prior QA** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-01.md` (FAIL P0 embed) |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | `pnpm run qc:dev-stack` — hrm-api + xbos-api + portal **200** |
| L0 FE↔BE | `pnpm run qc:fe-be-health` — **ALL PASS** (exit 0) |
| **L2 embed module** | **PASS** — `PortalEmbedRouterSync.tsx` HTTP **200** |
| **L2 embed mount** | **PASS** — `employee-profile-page` visible · no module 500 |

## U65 prereq (no seed)

```json
{
  "status": 200,
  "count": 3,
  "first": {
    "id": "33333333-3333-4333-8333-333333333333",
    "employee_code": "NV101",
    "full_name": "Le Van C"
  }
}
```

## Steps attempted

- Navigate profile `/employees/33333333-3333-4333-8333-333333333333?tab=contract`
- Click `profile-tab-contract`
- Click `ec-open-contract-workspace-create`
- Assert parent URL workspace params + Step1 + UV hidden (strict click-path)
- F5 reload observed (carry — not exit criteria)

## Matrix WS-G4-12 (strict — not PASS_WITH_HOLD)

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-12** | **PASS** | Parent URL `workspace=create` · `employee_id=33333333-…` · `lock_subject_employee=1` · `ctr-create-step-1` visible · UV tab hidden · employee locked |
| **WS-G4-12-F5** | **CARRY P3** | F5 strips workspace params on `/command-center/hrm/contracts?tab=contract` — **out of WI exit criteria**; logged as residual |

**Parent URL after «Thêm HĐ»:**

`http://127.0.0.1:5173/command-center/hrm/contracts?tab=contract&workspace=create&employee_id=33333333-3333-4333-8333-333333333333&subject_type=employee&lock_subject_employee=1`

| Assert | Result |
|--------|--------|
| `workspace=create` | ✅ |
| `employee_id` = NV101 UUID | ✅ |
| `lock_subject_employee=1` | ✅ |
| `ctr-create-step-1` visible | ✅ |
| UV tab (`ctr-create-subject-tab-candidate`) hidden | ✅ |
| `ctr-create-subject-employee-locked` or lock param | ✅ |

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-PROFILE-01** | **PASS** | Profile embed mounts → tab HĐ → Thêm HĐ → workspace create Step1; no blank iframe; no module 500 |

## UF block — WS-G4-12

- **Persona / URL:** `ceo@xe.vn` → profile NV101 tab HĐ
- **Trước mutate:** `employee-profile-page` visible in embed
- **Action:** `profile-tab-contract` → `ec-open-contract-workspace-create`
- **Network:** no `PortalEmbedRouterSync.tsx` 500
- **FE sau click:** `ctr-create-step-1` visible · UV tab hidden · NV locked
- **Parent URL assert:** `workspace=create` + `employee_id` + `lock_subject_employee=1` — **PASS**
- **Verdict:** 🟢 **PASS**

## Defects

| ID | Sev | Mô tả | Status |
|----|-----|--------|--------|
| **DEF-CTR-G4-PROFILE-EMBED-P0** | P0 | Malformed JSDoc → Vite 500 → blank embed | **CLOSED** (FE-02) |
| **DEF-CTR-G4-PROFILE-URL-P2** | P2 | Parent URL workspace sync after profile «Thêm HĐ» | **CLOSED** (strict click-path) |
| **DEF-CTR-G4-PROFILE-URL-F5-P3** | P3 | F5 reload drops workspace query on contracts parent URL | **OPEN** carry — not in QA-02 exit |

## Promoted / not promoted

**Promoted:**

- WS-G4-12 strict (click-path — replaces prior PASS_WITH_HOLD on URL)
- J-HRM-CTR-PROFILE-01
- L2 embed regression fix verified
- `contracts_printable_ready=false` retained

**Not promoted / carry:**

- WS-G4-12-F5 URL persistence after reload (P3)
- WS-G4-13/14 REC hire BLOCKED U65 (out of scope)

## Screenshots

- `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-profile-url-retest-02/00-profile-loaded.png`
- `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-profile-url-retest-02/01-profile-add-contract.png`
- `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-profile-url-retest-02/02-after-f5.png`

## completion_report

**Closed:** Post FE-02 JSDoc fix — L0 PASS; L2 embed mounts (module HTTP 200, no blank iframe); WS-G4-12 **strict PASS** on click: parent CC URL has `workspace=create&employee_id&lock_subject_employee=1`; Step1 visible; UV tab hidden; J-HRM-CTR-PROFILE-01 PASS. `DEF-CTR-G4-PROFILE-EMBED-P0` and `DEF-CTR-G4-PROFILE-URL-P2` **CLOSED**.

**Residual:** F5 reload on contracts parent route drops workspace params (`DEF-CTR-G4-PROFILE-URL-F5-P3` P3 carry — not in exit criteria). WS-G4-13/14 out of scope.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01
role: pm
read_first: docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md
entry_criteria: QA PASS_TO_PM WS-G4-12 strict PASS; DEF-CTR-G4-PROFILE-EMBED-P0 + DEF-CTR-G4-PROFILE-URL-P2 CLOSED
exit_criteria: update seal carry table — profile URL row strict PASS (replaces PASS_WITH_HOLD); optional QC narrow stamp; carry DEF-CTR-G4-PROFILE-URL-F5-P3 P3
ack_status: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md`  
**ack_status:** **PASS_TO_PM**
