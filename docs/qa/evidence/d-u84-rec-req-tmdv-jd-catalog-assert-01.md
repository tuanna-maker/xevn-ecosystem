# Evidence — D-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **U65** | honored — no seed; live create + soft-delete cleanup only |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **QA root cause** | `docs/qa/evidence/u78-u84-primary-rec-req-tmdv-01.md` — picker holding vs assert `trsport` → `HRM-REC-JD-POS` |
| **CODE-MEMORY** | `recruitment-catalog.service.ts` FR-HRM-RC-JD-01 / AC-SET-FS-03 · `hrm-list-scope.ts` ADR-GROUP-CEO-MAIN-HOLDING-SCOPE catalog partition |
| **SRS** | FR-HRM-RC-JD-01 — position from `job_titles` catalog (not free text) |
| **TechSpec / FE U39** | Settings picker Group CEO anchors `main`→`holding` (`resolveHrmSpreadsheetScope`) while JD row persists member slug |

**spec says:** codes visible in settings `job_titles` picker are valid for JD create.  
**code did (bug):** assert used persist `company_id=trsport` while picker read holding SoT.  
**code does (fix):** assert uses `resolveHrmSettingsCatalogCompanyId(+auth)` → Group CEO + member OU → **holding**; persist row stays `trsport`.

---

## Root cause / fix

| Layer | Before | After |
|-------|--------|-------|
| FE picker | `GET settings-catalogs` via U39 → `main`→**holding** | unchanged |
| JD assert | `assertCodeInEffectiveCatalog(trsport)` | `resolveHrmSettingsCatalogCompanyId` → **holding** for Group CEO + `trsport`/`logistics`/… |
| JD persist | `resolveHrmPersistCompanyIdText` → `trsport` | unchanged (member OU library) |
| Holding SoT | invent-only still 400 | must_keep — jest invent reject |

### Files

- `apps/api/hrm-api/src/common/hrm-list-scope.ts` — expand catalog resolver + CODE-MEMORY APPEND
- `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` — assert uses catalog partition + auth
- `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts` — Group CEO trsport→holding; member JWT stays trsport
- `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.spec.ts` — create assert `companyId=holding` + invent reject

---

## Verification

| Check | Result |
|-------|--------|
| Jest `hrm-list-scope.spec` + `recruitment-catalog.service.spec` | **34/34 PASS** |
| Live POST `job-templates` `company_id=trsport` + `DRIVER_LEAD` (ceo@xe.vn) | **201** `HRM-REC-JD-201` · `id=b91f96d3-…` · persist `company_id=trsport` |
| GET `job-templates?company_id=trsport` | listed **true** total=1 |
| Cleanup DELETE | **200** (U65 — no leftover seed) |
| Rebuild | `tsc -p tsconfig.build.json` + restart `:28001` `node dist/main.js` |

Live stamp: `D-U84-dii8hu` (row soft-deleted after assert).

---

## Residuals

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| R1 browser UF | P1 | **qa** | Retest U78-U84-PRIMARY-REC-REQ-TMDV-01 HP+AP FE-only after BE deploy |
| REC-PLAN path | — | — | must_keep — not touched |

---

## completion_report

**Closed:** Catalog assert/picker partition parity for Group CEO member OU — POST JD @ trsport + DRIVER_LEAD → 201; jest regression; CODE-MEMORY APPEND; live smoke + cleanup.  
**Open:** Browser Primary P-REC-REQ @ CO-TMDV (YCTD HP/AP) — QA retest.

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/d-u84-rec-req-tmdv-jd-catalog-assert-01.md`

### next_dispatch_prompt

```text
work_item_id: U78-U84-PRIMARY-REC-REQ-TMDV-01-R1
from_role: pm
to_role: qa
ack_status_target: PASS_TO_PM
priority: P0
u65_zero_seed: true
hdsd_align: true

MISSION: Browser retest Primary P-REC-REQ @ CO-TMDV after D-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT-01.
entry: BE READY_FOR_QA docs/qa/evidence/d-u84-rec-req-tmdv-jd-catalog-assert-01.md — live POST trsport+DRIVER_LEAD 201; hrm-api rebuilt on :28001.
Persona: ceo@xe.vn / Xevn@2026 · companyId=trsport · OU TM-DV
Steps: login → /hr/recruitment?tab=jd-library&companyId=trsport → Thêm JD (Lái xe / DRIVER_LEAD) → Lưu → expect POST 201 + row → F5 → Thêm YCTD HP → Gửi duyệt → Inbox AP (U65 no seed).
exit: TC-HIM-REC-REQ-TMDV-HP-001 + AP promoted or honest BLOCKED with residual; U78 test-log; matrix update.
cấm: seed job titles / seed inbox
evidence_path: docs/qa/evidence/u78-u84-primary-rec-req-tmdv-01-r1.md
```
