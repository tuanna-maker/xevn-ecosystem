# Evidence — `PO-UC-TC-W4-FE-AT12-L1-CREATE-CATALOG-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-FE-AT12-L1-CREATE-CATALOG-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX |
| **u65_zero_seed** | true |
| **prior** | QC GWC [`po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md`](po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md) · condition `R-W4-AT12-L1-CREATE-CATALOG` |
| **spec_ref** | HRM-AT-12 create precond · UF-HRM-10 sync-from-xbos · BE `resolveHrmSettingsCatalogCompanyId` member→OU |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QC condition | `R-W4-AT12-L1-CREATE-CATALOG` — trsport `leave_types` empty blocks U65 FE create |
| QA R3/R4 | create dialog *Chưa có mục trong danh mục* · PNG `09-mgr-f5.png` |
| BE partition | `hrm-list-scope.spec.ts` — member JWT + `trsport` → catalog company **`trsport`** (not holding); Group CEO `main`→`holding` |
| Settings sync | `POST /api/hrm/settings-catalogs/sync-from-xbos` · pull ≠ apply-to-members ≠ clone |
| must_keep | AT-12 L1 approve CLOSED · AT-07 · ceo@ EXPECTED_NO_CTA · Leave L2 SPEC_GAP · U65 no seed |

---

## Root cause (FE)

| Layer | Finding |
|-------|---------|
| Leave create picker | `useSettingsCatalogsOverview` → **`resolveHrmSpreadsheetScope`** |
| Spreadsheet helper | Portal + master tenant **always** `x-company-id=main` (must_keep for import / Group CEO) |
| Member JWT (uat.nv0002 / trsport) | BE `resolveHrmSettingsCatalogCompanyId(member, xevn, main)` → partition **`main`** (empty) — **not** widened to holding |
| Leave create assert | `body.company_id=trsport` → catalog assert on **`trsport`** |
| Mismatch | Picker/sync read **`main`** empty; create needs **`trsport`** `leave_types` → empty UI; Settings «Đồng bộ» also pulled wrong partition |
| Not | Seed gap · Leave L2 · AT-12 L1 approve (stays CLOSED) |

---

## Fix (preserve_default)

1. **`resolveHrmSettingsCatalogScope`** (+ `getPortalJwtCatalogCompanyId`) — member/holding JWT → OU `x-company-id` (`trsport` / `holding`); Group CEO `main` unchanged via spreadsheet fallback (BE→holding).
2. **`useSettingsCatalogsOverview`** — uses catalog scope helper for GET + sync consumers (Settings / Master Data / Leave / Contracts / Employee form).
3. **`LeaveTab` empty-state** — CTA **Đồng bộ từ XBOS** (`data-testid=hdsd-leave-sync-catalog`) → `syncSettingsCatalogsFromXbos(catalogsScope)` + invalidate RQ; keep link to Cài đặt.
4. Vitest + CODE-MEMORY APPEND on touched modules.

### must_keep verified

| Invariant | Status |
|-----------|--------|
| AT-12 L1 approve mutate scope | **untouched** |
| `resolveHrmSpreadsheetScope` early-return `main` | **kept** (spreadsheet / Group CEO) |
| pull ≠ apply / ≠ clone | sync-from-xbos only |
| ceo@ Duyệt | **not wired** |
| Leave L2 | **not invented** |
| U65 seed | **not run** |

---

## Verification

| Check | Result |
|-------|--------|
| `vitest` `hrmSpreadsheetScope.test.ts` + `hdsdMutateTestIds.test.ts` | **10/10 PASS** |
| Seed / DB insert leave_types | **not** run |
| Live browser create after sync | **deferred to QA** (stack health not asserted this seat) |

### Sample assertions (unit)

```text
JWT companyId=trsport + portal session
  resolveHrmSpreadsheetScope → main          (must_keep)
  resolveHrmSettingsCatalogScope → trsport   (CREATE-CATALOG fix)
JWT companyId=main (Group CEO)
  resolveHrmSettingsCatalogScope → main      (BE→holding)
```

---

## Files

- `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts`
- `apps/web/hrm/src/lib/hrmSpreadsheetScope.test.ts`
- `apps/web/hrm/src/hooks/useSettingsCatalogsOverview.ts`
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx`
- `apps/web/hrm/src/lib/hdsdMutateTestIds.ts`
- `apps/web/hrm/src/lib/hdsdMutateTestIds.test.ts`

---

## Residual / QA branch

| Id | If | Owner |
|----|-----|-------|
| FE path | Sync CTA + GET use `x-company-id=trsport` for member JWT | **this WI** |
| **R-W4-AT12-L1-CREATE-CATALOG-BE-PULL** | After FE sync **201** + invalidate, `leave_types.effectiveItems` still **[]** on trsport (XBOS has no member key / pull skips) | **dev-be** — member pull from holding SoT or publish path; **cấm seed**; **cấm** invent apply/clone as leave fix unless product CR |

---

## Handoff

```
ack_status: READY_FOR_QA
work_item_id: PO-UC-TC-W4-FE-AT12-L1-CREATE-CATALOG-01
evidence_path: docs/qa/evidence/po-uc-tc-w4-fe-at12-l1-create-catalog-01.md
next_owner: qa
completion_report: |
  Closed: FE partition parity for settings-catalog GET/sync on member JWT (trsport)
  + Leave create empty-state Đồng bộ từ XBOS (hdsd-leave-sync-catalog).
  Spreadsheet main early-return preserved. AT-12 L1 approve / AT-07 / Leave L2 untouched. U65 no seed.
  Residual: if sync 201 but leave_types still empty → BE pull gap (not seed).
next_dispatch_prompt: |
  work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R5-AT12-CREATE-CATALOG
  from_role: pm
  to_role: qa
  ack_status_target: PASS_TO_PM
  u65_zero_seed: true
  entry: docs/qa/evidence/po-uc-tc-w4-fe-at12-l1-create-catalog-01.md READY_FOR_QA
  Persona: uat.nv0002@xe.vn (manager, trsport) — NOT ceo@
  URL: /hr/attendance?portal=1&tenantId=xevn&companyId=trsport
  Steps:
    1) Nghỉ phép → Tạo yêu cầu nghỉ
    2) Assert empty leave_types → CTA hdsd-leave-sync-catalog visible
    3) Click Đồng bộ từ XBOS → POST …/settings-catalogs/sync-from-xbos **2xx** with **x-company-id=trsport** (not main)
    4) After invalidate: leave type picker has ≥1 option
    5) Optional U65 create for report → POST leave-requests 2xx (do not claim Leave L2)
  Fail→BE: sync 2xx but leave_types still empty → residual R-W4-AT12-L1-CREATE-CATALOG-BE-PULL to dev-be
  cấm: pnpm seed:* · DB insert leave_types · invent Leave L2 PASS · reopen AT-12 L1 approve · wire ceo@ Duyệt
  evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.md
```
