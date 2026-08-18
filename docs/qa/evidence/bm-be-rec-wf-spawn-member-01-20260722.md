# BM-BE-REC-WF-SPAWN-MEMBER-01 — Group+member applyingEntity spawn

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-BE-REC-WF-SPAWN-MEMBER-01` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **dated** | 2026-07-22 (ICT) |
| **priority** | P0 |
| **U65** | no seed · no Phase1/PROD · dual-catalog F1–F10 untouched |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QA FAIL | `docs/qa/evidence/bm-qa-rec-e2e-8088-01-20260722.md` — SPAWN-MISSING after VISUN apply |
| SA gap | `docs/qa/evidence/bm-sa-xbos-hrm-rec-trace-01-20260722.md` **G-BM-REC-02** |
| Explore | `docs/qa/evidence/bm-exp-be-wf-bridge-01-20260722.md` |
| ADR | `docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` Option A HRM-spawn |
| Journey | **J-REC-WF-02** |
| must_keep | G-RC-01 · LeaveWorkflowBridge · CatalogWorkflowBridge · UF-HRM-12 · U65 |

## Problem (spec says / code did)

| | |
|--|--|
| **spec says** | After XBOS `hrm_requisition_approval` **Đơn vị áp dụng = member (VISUN)**, Group CEO «Gửi duyệt QT» must spawn instance (`workflow_instance_id` non-null) — BM-06 / G-BM-REC-02 |
| **code did** | `applyingEntityId` stored only in FE graph JSON; XBOS `startInstanceFromWorkflowCode` ignored it. Canvas re-save with member apply often left steps as misconfigured `fixed_user` (empty `user_id`) → XBOS-WF-400 → HRM mapped to **SPAWN-MISSING** |

## Fix (change_mode: ADD)

### Semantics (group + member apply)

| `graph.applyingEntityId` | Spawn allowed when |
|--------------------------|--------------------|
| empty / `holding` / `main` / group tokens | Always (Toàn tập đoàn) |
| Member legal-entity UUID or slug | **Group CEO** spawn company `holding`/`main` **OK**; or spawn/context matches member partition/tenant/slug |
| Other member company (unrelated) | **XBOS-WF-409** apply mismatch |

Member apply does **not** hide the active definition from Group CEO holding/main spawn (customer BM-06).

### Code

| Path | Change |
|------|--------|
| `apps/api/xbos-api/src/workflow-engine/workflow-apply-scope.ts` | **NEW** — apply-scope policy helpers |
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.ts` | `startInstanceFromWorkflowCode`: apply check · ensure `hrm_*` defs · recruitment resolver **soft-fallback** → `ceo@xe.vn` / `group_ceo` · stamp `applyingEntityId` on instance context |
| `…/workflow-apply-scope.spec.ts` + `workflow-engine.service.spec.ts` | Jest G-BM-REC-02 |
| `apps/api/hrm-api/.../recruitment-workflow.bridge.ts` | CODE-MEMORY note only (payload unchanged) |

**must_keep untouched:** Leave notify path · Catalog bridge · G-RC-01 headcount · dual-catalog F1–F10.

## Verification

```text
xbos-api: jest workflow-apply-scope|workflow-engine.service.spec → 16/16 PASS
hrm-api:  jest recruitment-workflow.bridge.spec|leave-workflow.bridge.spec (must_keep)
```

| Suite | Result |
|-------|--------|
| `workflow-apply-scope.spec.ts` + `workflow-engine.service.spec.ts` | **16/16 PASS** |
| Soft-fallback log | `XBOS-WF-SPAWN-RESOLVER-FALLBACK … applyingEntityId=dfb107a7-…` observed in test |

## QA retest (copy-ready)

1. XBOS → Hệ thống quy trình → `hrm_requisition_approval` → Đơn vị áp dụng = **VISUN** → Lưu (200).
2. HRM `ceo@xe.vn` → `/hr/recruitment?companyId=main` → YCTD (headcount ≥1) → **Gửi duyệt QT**.
3. Expect: `POST …/submit-workflow` **201** `HRM-REC-WF-200` · `spawnMissing:false` · `workflow_instance_id` **non-null** (not SPAWN-MISSING banner).
4. Optional: restore Đơn vị áp dụng → Toàn tập đoàn after evidence.
5. cấm seed inbox.

## Residual

| ID | Owner | Note |
|----|-------|------|
| `BM-QA-REC-WF-SPAWN-R2` | qa | Browser U65 J-REC-WF-02 on :8088 after deploy/sync |
| `BM-FE-REC-WF-SPAWN-MEMBER-01` | fe | Optional: confirm mutate `company_id` / banner copy (P1) |
| Catalog fan-out G-BM-REC-01 | separate | Not this work_item |

## completion_report

**Closed:** G-BM-REC-02 spawn after member applyingEntityId — group+member semantics documented in code; Group CEO holding start succeeds; recruitment resolver soft-fallback prevents SPAWN-MISSING when def active but step resolver misconfigured; jest **16/16**. Leave/Catalog/G-RC-01 untouched. No seed.

**Open:** Browser QA R2 on :8088 after FE/API sync.

## next_owner

`qa` → `BM-QA-REC-WF-SPAWN-R2`

## next_dispatch_prompt

```text
work_item_id: BM-QA-REC-WF-SPAWN-R2
from_role: pm
to_role: qa
priority: P0
program: P1-BMINUTES-CUST-RETEST-01
U65 browser-only · cite docs/qa/evidence/bm-be-rec-wf-spawn-member-01-20260722.md

entry: L0 stack; XBOS+HRM APIs with BM-BE-REC-WF-SPAWN-MEMBER-01 deployed/synced
job: Retest J-REC-WF-02 / BM-06:
  1) XBOS hrm_requisition_approval applyingEntityId=VISUN → Lưu 2xx + F5
  2) ceo@xe.vn HRM YCTD (company main/holding) → Gửi duyệt QT
  3) PASS when workflow_instance_id non-null + spawnMissing false (no SPAWN-MISSING banner)
  4) G-RC-01 headcount smoke on same path; cấm seed
exit: PASS_TO_PM · evidence docs/qa/evidence/bm-qa-rec-wf-spawn-r2-YYYYMMDD.md
must_keep: UF-HRM-12 · leave CREATE 🟢 zone · dual-catalog F1–F10
```

## ack_status

**READY_FOR_QA**
