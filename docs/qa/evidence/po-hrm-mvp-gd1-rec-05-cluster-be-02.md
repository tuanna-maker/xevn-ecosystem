# Evidence — PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-7) |
| **lane** | execution · **dev-be** |
| **Date** | 2026-08-09 |
| **stamp** | `REC05BE02-MSL2MDWT` |
| **uc_ids** | `UC-BP-REC-05` |
| **depends_on** | QA-01 FAIL · `R-REC-05-BE-BUILD-TS2345` · `R-REC-05-BE-ROUTES-NOT-LIVE` |
| **change_mode** | **FIX** · `preserve_default: true` · `code_memory_mode: APPEND` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 zero-seed |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **defect** | QA-01 `R-REC-05-BE-BUILD-TS2345` @ `recruitment.service.ts:2501` |
| **api** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md` F-REC-APP-02 / TL · U19 |
| **peers RETAIN** | UV-YCTD · REC-04 · REC-06a · CAT EFF · Lane A SoT |
| **srs** | FR-UC-BP-REC-05 (no rewrite) |

**spec says / code does:**

| Item | Before (QA-01) | After (BE-02) |
|------|----------------|---------------|
| `resolveHrmListScope(…, query.company_id)` | TS2345 `string \| undefined` | `query.company_id ?? ''` |
| `pnpm --filter hrm-api run build` | exit **1** | exit **0** |
| LIVE POST `…/candidates/:id/transitions` | `Cannot POST` / `HRM-DATA-404` | **mapped** · fake → `HRM-REC-404` Candidate not found |
| LIVE GET `…/candidates/:id/stage-history` | `Cannot GET` / `HRM-DATA-404` | **mapped** · fake → `HRM-REC-404` |
| Nest `/rec/*` | DENY | DENY RETAIN |
| jest `po-hrm-mvp-gd1-rec-05-cluster-be-01` | (prior PASS) | **13/13 PASS** |

---

## Diff (minimal)

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | FIX `listCandidateStageHistory` → `resolveHrmListScope(authorization, query.company_id ?? '', scopeContext)` + `@CODE-MEMORY-CHANGE` BE-02 |
| `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-05-l1-seal.mjs` | Probe: resource `HRM-REC-404` (no `Cannot *`) = route LIVE (false-negative fix for QA-02) |

**must_keep / DENY:** UV-YCTD · REC-04 · 06a · CAT EFF · honesty **false** · Nest `/rec` dual · pool as FR-05 SoT · seed · reopen J-CV-04 · FR-05 rewrite · flip `recruitment_uat_ready`

---

## Verify

| Check | Result |
|-------|--------|
| `pnpm --filter hrm-api run build` | **exit 0** (+ postbuild `verify-dist`) |
| `pnpm exec jest --testPathPatterns=po-hrm-mvp-gd1-rec-05-cluster-be-01` | **13 passed** |
| `start:prod` restart | Nest up `:28001` (new dist) |
| L1 seal `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-05-l1-seal.mjs` | **exit 0** `L1_ROUTES_LIVE` · stamp `REC05L1-MSL2MDWT` |
| EFF | **200** `HRM-REC-STG-200` |
| POST transitions (fake UUID) | **404** `HRM-REC-404` · **not** `Cannot POST` |
| GET stage-history (fake UUID) | **404** `HRM-REC-404` · **not** `Cannot GET` |
| Nest `/rec/…` | **404** `HRM-DATA-404` Cannot * · DENY dual |
| Seed | **not used** |
| Honesty flip | **DENY** — still false |

Raw L1 JSON: `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-05-l1-seal.json`

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-be-02.md` |
| **completion_report** | Closed R-REC-05-BE-BUILD-TS2345 + R-REC-05-BE-ROUTES-NOT-LIVE. nest build 0; start:prod LIVE; L1 POST transitions + GET stage-history mapped (HRM-REC-404 resource OK); jest 13 PASS; honesty false; DENY Nest/rec · seed · FR-05 rewrite · pool SoT · J-CV-04 reopen. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-02
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-05
depends_on: BE-02 READY_FOR_QA · L1_ROUTES_LIVE REC05L1-MSL2MDWT · nest build exit 0
entry_criteria: browser-only U65 zero-seed; portal :5173; hrm-api :28001 start:prod; persona ceo@xe.vn; companyId=main
MISSION: Retest J-HRM-REC-STG-05-01..04 — dialog picker EFF · POST transitions Lưu→F5 · reject/note/invent · reverse CFG; assert Network 2xx/4xx business (not Cannot *); Nest /rec 0 hits; L1 seal exit 0; honesty false; C-SLICE
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-qa-02.md · PASS_TO_PM or FAIL with residual
cấm: seed · flip recruitment_uat_ready · pool as FR-05 PASS · reopen J-CV-04 · claim module UAT DONE
```

---

## stamp

`REC05BE02-MSL2MDWT` · 2026-08-09
