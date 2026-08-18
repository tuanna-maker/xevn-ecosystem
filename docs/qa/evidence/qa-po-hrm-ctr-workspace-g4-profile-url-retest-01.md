# Evidence — PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-01` |
| **role** | `qa` |
| **runner_stamp** | **`CTRG4URL-MSO6W1QB`** |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** |
| **defect** | `DEF-CTR-G4-PROFILE-URL-P2` → **OPEN** (unverified) |
| **blocker** | `DEF-CTR-G4-PROFILE-EMBED-P0` — HRM embed **500** on `PortalEmbedRouterSync.tsx` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `UI-HRM-CTR-PROFILE-DEEP-LINK.md` |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-profile-url-retest-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-profile-url-retest-01.json` |
| **prior FE evidence** | `docs/qa/evidence/po-hrm-ctr-workspace-fe-profile-url-01.md` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | `pnpm run qc:dev-stack` — hrm-api + xbos-api + portal **200** |
| L0 FE↔BE | `pnpm run qc:fe-be-health` — **ALL PASS** (exit 0) |
| **L2 embed** | **FAIL** — HRM iframe blank; module load **HTTP 500** |

## Root cause (P0 — blocks WS-G4-12)

Profile URL sync cannot be exercised because the HRM embed fails to mount:

| Probe | Result |
|-------|--------|
| Parent URL | `http://127.0.0.1:5173/command-center/hrm/employees/33333333-…?tab=contract` |
| Iframe src | `http://127.0.0.1:5173/hr/employees/33333333-…` (loads) |
| Failed resource | **`GET /hr/src/components/layout/PortalEmbedRouterSync.tsx` → HTTP 500** |
| UI symptom | Blank embed pane; no `employee-profile-page` / `ec-open-contract-workspace-create` in any frame (30s wait) |

**Code defect:** `apps/web/hrm/src/components/layout/PortalEmbedRouterSync.tsx` lines 18–24 — JSDoc closed at line 18 (`*/`) then stray `*` / second `@CODE-MEMORY-CHANGE` block outside valid comment → Vite transform error. Introduced in `PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-01` edit.

FE handoff claimed `pnpm exec tsc --noEmit` exit 0 but **did not catch Vite runtime module 500**.

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
- Wait 6s + retry navigate (profile page never mounted)
- Network capture: `PortalEmbedRouterSync.tsx` **500**
- 30s iframe poll: zero testIds (`employee-profile-page`, `ec-open-contract-workspace-create`)

## Matrix WS-G4-12 (strict — not PASS_WITH_HOLD)

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-12** | **FAIL** | Embed blocked — `ec-open-contract-workspace-create` not visible; parent URL workspace params **not assertable** |

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-PROFILE-01** | **FAIL** | HRM iframe blank (module 500) — cannot execute profile → Thêm HĐ click path |

## UF block — WS-G4-12

- **Persona / URL:** `ceo@xe.vn` → profile NV101 tab HĐ
- **Click path:** `profile-tab-contract` → `ec-open-contract-workspace-create` — **not reached**
- **FE sau click:** N/A — workspace never opened
- **Parent URL assert:** `workspace=create` + `employee_id` + `lock_subject_employee=1` — **not tested**
- **Verdict:** 🔴 **FAIL** (L2 embed regression P0)

## Defects

| ID | Sev | Mô tả | Owner | Status |
|----|-----|--------|-------|--------|
| **DEF-CTR-G4-PROFILE-EMBED-P0** | **P0** | Malformed JSDoc in `PortalEmbedRouterSync.tsx` → Vite 500 → blank HRM embed | dev-fe | **OPEN** |
| **DEF-CTR-G4-PROFILE-URL-P2** | P2 | Parent URL workspace sync after profile «Thêm HĐ» | dev-fe | **OPEN** (unverified) |

## Screenshots

- `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-profile-url-retest-01/01-profile-no-add-btn.png` — blank embed

## Promoted / not promoted

**Not promoted:**

- WS-G4-12 strict PASS (exit criteria requires parent URL params — not met)
- DEF-CTR-G4-PROFILE-URL-P2 closure
- J-HRM-CTR-PROFILE-01

**Regression vs prior QA (`qa-po-hrm-ctr-workspace-g4-profile-rec-01.md`):** prior run opened workspace Step1 (PASS_WITH_HOLD on URL only). Current run **cannot load embed** — **P0 regression**.

## completion_report

**Closed:** L0 API PASS; U65 zero-seed probe OK; browser WS-G4-12 **FAIL** — HRM embed does not mount due to `PortalEmbedRouterSync.tsx` HTTP 500 (malformed JSDoc from FE-01 patch). Parent URL workspace sync **not verified**.

**Residual:** Fix P0 syntax → retest WS-G4-12 strict PASS; then confirm `workspace=create&employee_id&lock_subject_employee=1` on parent URL + Step1 + UV hidden. WS-G4-13/14 out of scope.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-02
role: dev-fe
read_first:
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-01.md
  - apps/web/hrm/src/components/layout/PortalEmbedRouterSync.tsx (lines 8–24)
entry_criteria: QA FAIL_TO_PM — DEF-CTR-G4-PROFILE-EMBED-P0 Vite 500 on PortalEmbedRouterSync.tsx blocks embed
exit_criteria:
  - Fix malformed JSDoc (merge CODE-MEMORY blocks into single valid block)
  - Vite serves PortalEmbedRouterSync.tsx HTTP 200; HRM profile embed loads
  - Profile «Thêm HĐ» → parent URL has workspace=create&employee_id&lock_subject_employee=1
  - pnpm test contractWorkspace exit 0; READY_FOR_QA
must_keep: applyIframeWorkspaceParamsToParent write path; NV-first UV tab hidden
ack_status: READY_FOR_QA
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-01.md`  
**ack_status:** **FAIL_TO_PM**
