# Evidence — PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-7 seat #9) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `REC05QA-MSL2GK3E` |
| **ack_status** | **FAIL_TO_PM** |
| **uc_ids** | `UC-BP-REC-05` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-01 READY_FOR_QA · BE-01 READY (claimed) · API-01 CONFIRMED |
| **env** | portal `:5173` · hrm-api `:28001` (**dist NOT sealable** — nest build TS2345) · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-05-cluster-qa-01.mjs` · L1 `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-05-l1-seal.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-05-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-05-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **FAIL** · `FAIL_TO_PM` |
| **L0** | hrm/xbos/portal **200** · `qc:fe-be-health` **ALL PASS** |
| **L1 seal** | EFF `GET …/pipeline-stages/effective` **200** `HRM-REC-STG-200` · **POST …/transitions Cannot POST** · **GET …/stage-history Cannot GET** · Nest `/rec` **404 DENY** |
| **nest build** | **FAIL** `TS2345` `listCandidateStageHistory` `query.company_id?: string` → `resolveHrmListScope(..., string)` @ `recruitment.service.ts:2501` — **cannot rebuild+restart LIVE** |
| **L2.5 J-*** | **J-01 PASS (FE picker)** · **J-02..04 BLOCKED** (BE routes not LIVE) |
| **DENY** | Nest `/rec` 0 browser hits · seed unused · honesty false retained · **no** pool-as-FR-05 claim · **no** reopen J-CV-04 · C-SLICE |

**Root cause:** BE-01 READY claimed with jest, but **production `nest build` fails** → running `dist` lacks F-REC-APP-02 / TL routes (`Cannot POST/GET`). Same stale-dist class as REC-00/04, plus **hard compile blocker**.

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| `qc:dev-stack` | hrm/xbos/portal **200** |
| `qc:fe-be-health` | **ALL PASS** |
| `GET …/pipeline-stages/effective?company_id=main` | **200** `HRM-REC-STG-200` · total=4 |
| `POST …/candidates/{fake}/transitions` | **404** `HRM-DATA-404` **Cannot POST** …/transitions |
| `GET …/candidates/{fake}/stage-history` | **404** `HRM-DATA-404` **Cannot GET** …/stage-history |
| Nest `POST/GET /api/hrm/rec/…` | **404** DENY dual SoT |
| `pnpm --filter hrm-api run build` | **exit 1** TS2345 line 2501 |

---

## Browser U65 — journeys

Persona: portal auth inject `xevn.portal.*` · URL `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates&companyId=main` · **zero-seed**.

**hdsd_align:** Tuyển dụng → Ứng viên → Đổi trạng thái pipeline (UV–YCTD) / Lịch sử trạng thái.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-REC-STG-05-01** | Ứng viên → Tất cả → click stage badge `data-lane=yctd-transitions` on YCTD-bound UV (`UV UAT REC UATREC-ICHFBD`) | Dialog **Đổi trạng thái pipeline (UV–YCTD)** opens · picker Select (no free-text) · session **GET** `/api/hrm/recruitment/pipeline-stages/effective` (React Query cache on tab; L1 **200**) · path `/recruitment/` | **PASS** (FE wire) |
| **J-HRM-REC-STG-05-02** | Chọn stage → Lưu → F5 → tab Lịch sử | **BLOCKED** — POST transitions **not mapped** on LIVE dist | **BLOCKED** |
| **J-HRM-REC-STG-05-03** | Reject + note / thiếu note / invent | **BLOCKED** — cannot assert REJECT-REASON / UNKNOWN on LIVE | **BLOCKED** |
| **J-HRM-REC-STG-05-04** | Reverse CFG · multi-YCTD · no Campaign | **BLOCKED** upstream · `nest_rec_hits=0` · DENY reopen J-CV-04 | **BLOCKED** |

Screens: `01-candidates.png` (auth fixed · list loaded) · `02-transition-dialog.png` (Lane A dialog).

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/rec/*` SoT dual | **DENY** — L1 404 · browser hits **0** |
| Campaign / REC-03 invent | **DENY** — not used as FR-05 SoT |
| Pool stage as FR-05 PASS | **DENY** — only Lane A `data-lane=yctd-transitions` asserted |
| `pnpm seed:*` / API fake history | **not used** |
| Flip `recruitment_uat_ready` / `jd_dynamic_done` | **false** retained |
| Reopen J-HRM-REC-CV-04-* | **DENY** — not executed |
| Module REC UAT / Phase1 DONE | **DENY** — **C-SLICE** |

---

## Defects (P0)

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **R-REC-05-BE-BUILD-TS2345** | **P0** | **dev-be** | `listCandidateStageHistory` passes `query.company_id?: string` into `resolveHrmListScope(..., requestedCompanyId: string)` → nest build FAIL. Fix: `query.company_id ?? ''` **or** require `company_id` on `ListCandidateStageHistoryQueryDto`. |
| **R-REC-05-BE-ROUTES-NOT-LIVE** | **P0** | **dev-be** | After fix: `pnpm --filter hrm-api run build` + restart `start:prod` · seal POST transitions + GET stage-history **not** `Cannot *` (404 resource OK; route mapped). |

**FE residual (non-blocking this seat):** J-01 PASS for dialog+EFF path; mutate journeys blocked solely by BE LIVE.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **FAIL_TO_PM** |
| **next_owner** | **dev-be** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-qa-01.md` |
| **completion_report** | U65 QA FAIL — BE nest build TS2345 blocks LIVE seal; POST transitions + GET stage-history Cannot *; J-01 FE dialog+EFF PASS; J-02..04 BLOCKED; DENY Nest/rec · seed · honesty · pool-as-FR-05 · J-CV-04 reopen; C-SLICE. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-02
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-05
depends_on: QA-01 FAIL · R-REC-05-BE-BUILD-TS2345 · R-REC-05-BE-ROUTES-NOT-LIVE
entry_criteria: fix TS2345 only; preserve_default; must_keep UV-YCTD · REC-04 · 06a · CAT EFF · honesty false
MISSION: Fix listCandidateStageHistory resolveHrmListScope(company_id) — query.company_id ?? '' OR require DTO company_id; pnpm --filter hrm-api run build exit 0; restart start:prod; L1 seal POST …/candidates/:id/transitions + GET …/stage-history NOT Cannot *; jest po-hrm-mvp-gd1-rec-05-cluster-be-01 PASS; DENY Nest /rec · seed · honesty flip · reopen J-CV-04
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-be-02.md · READY_FOR_QA · next qa QA-02 retest J-HRM-REC-STG-05-01..04
cấm: rewrite FR-05 · Nest /rec dual · pool as SoT · flip recruitment_uat_ready
```

---

## stamp

`REC05QA-MSL2GK3E` · 2026-08-09
