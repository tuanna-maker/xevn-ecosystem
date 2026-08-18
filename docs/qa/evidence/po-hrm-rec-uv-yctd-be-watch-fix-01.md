# Evidence — PO-HRM-REC-UV-YCTD-BE-WATCH-FIX-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-BE-WATCH-FIX-01` |
| **from_role** | dev-be |
| **to_role** | qa / pm |
| **lane** | execution |
| **change_mode** | FIX · preserve_default · code_memory APPEND |
| **date** | 2026-08-06 |
| **parent** | `PO-HRM-REC-UV-YCTD-QA-02` PASS_WITH_CONDITIONS · residual **R-HRM-API-WATCH-TS** |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `recruitment_uat_ready=false` · U65 zero-seed · **DENIED** seed / claim module UAT |
| **u65** | zero-seed · no mutate seed · live probe only |

---

## spec_read_ack (brief)

| Artifact | Cite |
|----------|------|
| **qa residual** | `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-02.md` · **R-HRM-API-WATCH-TS** |
| **be parent** | `docs/qa/evidence/po-hrm-rec-uv-yctd-be-01.md` · F-REC-CMP-01/02 · UV gates must_keep |
| **srs** | `SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-REC-06b** (compare) · UF-HRM-12 / WF submit (LOCK `workflow_instance_id`) |
| **tech/api** | UV/YCTD BE-01 contracts — **no business delta** this wave (compile-type FIX only) |

**must_keep verified unchanged:** BE-01 UV/compare gates · receivable · MAX-N/MIX · no silent Lane B · `workflow_instance_id` LOCK · U65 no seed.

---

## Root cause

`mapRequisitionDisplay` cast `JobRequisitionRow` → `Record<string, unknown>` for `toRequisitionJdDisplayReady`, then rebuilt the object from that spread. TypeScript dropped `company_id` / `workflow_instance_id` from the inferred return → **TS2339** in `submitJobRequisitionForApproval` (~794–800) → `nest start --watch` failed compile → compare routes only served via stale/`dist/main`.

## Fix (narrow)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | `mapRequisitionDisplay` spreads `...row` first, overlays JD display-ready fields; `@CODE-MEMORY-CHANGE` APPEND |

**Forbidden not touched:** UV create gates · compare MAX-N/MIX logic · seed · `job_postings` SoT · FE.

---

## Verification

### Compile / watch

| Check | Result |
|-------|--------|
| `npx tsc --noEmit -p tsconfig.build.json` | **exit 0** (0 errors) |
| `pnpm run start:dev` (`nest start --watch`) | **Found 0 errors** · Nest successfully started on `:28001` |
| Process | watch (not `node dist/main.js` recovery) |

### Live CMP under watch (ceo@xe.vn · company_id=main · U65 zero-seed)

| Probe | HTTP | code |
|-------|------|------|
| `GET /api/hrm/recruitment/applications?requisition_id=…&include=evals` | **200** | **HRM-REC-CMP-200** |
| `GET /api/hrm/recruitment/compare?requisition_id=…&candidate_ids=1` | **200** | **HRM-REC-CMP-200** |
| compare 5 ids | **400** | **HRM-REC-CMP-MAX-N** |
| compare foreign candidate | **400** | **HRM-REC-CMP-YCTD-MIX** |

Sample YCTD/UV ids from prior QA-02 natural data (no seed this seat).

### Jest

| Suite | Result |
|-------|--------|
| `po-hrm-rec-uv-yctd-be-01` | **17/17 PASS** |
| `p1-phase1-be-rec-patch` + `recruitment.service.spec` | **15/15 PASS** |

Note: `p1-phase1-be-crud-rd-parity` attendance `ensureWorkSitesSchema` failures observed when co-run — **out of scope** / pre-existing; not caused by this FIX.

---

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| `R-CMP-FE-MAX-N-BROWSER` | P2 | FE >N still needs ≥5 UV via FE (from QA-02) | qa after FE-02 |
| `R-JOURNEY-MAP-CMP` | P2 | `J-HRM-REC-CMP-01` journey map row | pm / ba-process |
| — | — | **R-HRM-API-WATCH-TS** closed this wave | — |

**honesty:** `recruitment_uat_ready=false` — do **not** promote module UAT.

---

## completion_report

Closed **R-HRM-API-WATCH-TS**: nest watch compiles clean; GET applications/compare return CMP codes under watch; UV/CMP jest regression PASS; CODE-MEMORY APPEND. Residual: FE max-N browser + journey-map (not BE). No commit.

## next_owner

**qa** (optional narrow re-probe under watch before QC compare slice) **or** **pm** intake → wait FE-02 → QA-01 retest / QC compare GWC.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-UV-YCTD-QA-WATCH-REPROBE-01 (optional) or continue FE-02→QA pipeline
from_role: pm
to_role: qa
entry: docs/qa/evidence/po-hrm-rec-uv-yctd-be-watch-fix-01.md READY_FOR_QA; nest watch :28001 Found 0 errors
task: Confirm GET applications+compare HRM-REC-CMP-* under watch (not dist-only); do not claim recruitment_uat_ready; U65 zero-seed
exit: PASS_TO_PM · residual R-HRM-API-WATCH-TS closed
```

## ack_status

**READY_FOR_QA**
