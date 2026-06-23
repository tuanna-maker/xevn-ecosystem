# P1-S1-FE-02 — Workflow canvas instances API

**work_item_id:** P1-S1-FE-02  
**role:** dev-fe  
**date:** 2026-05-23  
**commit:** none (per PM dispatch)

## Scope

- Reduce local graph/RACI mock seed when `VITE_ALLOW_MOCK_FALLBACK` is false.
- Wire `GET /workflow-engine/instances` + `GET …/instances/:id/detail` into Command Center workflow settings (list counts + canvas runtime overlay).
- Vitest mapper coverage; web-portal build.

## Changes

| Area | File |
|------|------|
| Instance mappers | `apps/web/web-portal/src/integrations/workflowInstanceMapper.ts` |
| API typing | `apps/web/web-portal/src/integrations/workflowEngineApi.ts` |
| Canvas runtime badges | `apps/web/web-portal/src/pages/command-center/WorkflowCanvas.tsx` |
| CC workflow UI | `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` |

## Verification

```text
cd apps/web/web-portal
pnpm test   → 35/35 PASS (8 files, +6 workflowInstanceMapper)
pnpm build  → PASS (tsc + vite)
```

## QA hints

1. Login Command Center → Cài đặt → **Hệ thống quy trình**.
2. List: column **Phiên chạy** from API (0 if none).
3. Edit definition → tab **Sơ đồ luồng** → dropdown **Phiên bản chạy** loads instances for `definition_id`; steps show runtime badge when `step_key` matches graph step id / `step-{order}`.
4. Strict mode: without mock flag, empty DB shows empty list (no RACI prototype seed).

## Residual

- Step highlight depends on `step_key` alignment between runtime tasks and graph `step.id` (order fallback only).
- New workflow (`workflowEditId === 'new'`) has no instance preview (expected).
