# COND-PF-PORTAL-01 — Portal HRM performance registry

| Field | Value |
|-------|-------|
| **work_item_id** | `COND-PF-PORTAL-01` |
| **date** | 2026-07-17 |
| **owner** | dev-fe |
| **from** | `docs/qa/evidence/p1-hrm-menu-performance-20260717.md` GWC |
| **spec_ref** | HRM-PF-01..04 · portal registry/sidebar parity with HRM app `/performance` |
| **U65** | zero-seed · no mutate claim |
| **ack_status** | **READY_FOR_QA** |

---

## Problem (QA GWC)

`/command-center/hrm/performance` was **not** in portal `HrmWorkspaceMenuKey` / `HRM_ALL_VIEWS` → `HrmWorkspaceRoute` treated view as invalid → `<Navigate>` to dashboard. HRM direct `/hr/performance?portal=1&companyId=main` already worked (14 cycles / 300 evals).

## Fix (closed)

| Area | Change |
|------|--------|
| `types.ts` | Add `'performance'` to `HrmWorkspaceMenuKey` |
| `registry.ts` | Add `performance` to `HRM_ALL_VIEWS` → `isHrmWorkspaceView` true |
| `paths.ts` | `HRM_VIEW_PATH_MAP.performance = '/performance'` |
| `HrmSidebar.tsx` | Menu item **Đánh giá** after Tiền lương |
| `Sidebar.tsx` | Child `hrm-performance` → `/command-center/hrm/performance` |
| `HrmWorkspacePanel.tsx` | Title + open-HRM CTA for panel completeness |
| HRM `vi.json` / `en.json` | `nav.performance` = «Đánh giá» / «Performance» (iframe sidebar label) |

### Expected embed URL

`hrmProxyPathFromSuffix('performance', { portal: true, tenantId: 'xevn', companyId: 'main' })`  
→ `/hr/performance?portal=1&tenantId=xevn&companyId=main`

Deep-link `/command-center/hrm/performance` no longer redirects to dashboard; portal + HRM sidebar can highlight **Đánh giá**.

## Tests

```bash
pnpm --filter web-portal exec vitest run src/modules/hrm/paths.test.ts src/modules/hrm/registry.test.ts
```

**Result:** 16/16 PASS (incl. `COND-PF-PORTAL-01` registry + path mapping cases).

## Explicitly NOT done (residual for QA / DevOps)

- **Mutate HRM-PF-01/03** — do **not** claim DONE; prior wave `POST …/performance/cycles` → `RATE-429`. Retest only after DevOps clears rate limit.
- Browser L2/L2.5 on `:8088` / local portal — QA ownership.

## QA retest checklist (U65 browser-only)

1. Login `ceo@xe.vn` → open `/command-center/hrm/performance` (or sidebar **Đánh giá**).
2. **PASS when:** URL stays `…/hrm/performance` (no silent Navigate to dashboard); iframe loads `/hr/performance?portal=1&…&companyId=main`; portal sidebar highlights **Đánh giá**; lists load (cycles/evals) without Sync ERROR.
3. Mutate «Tạo chu kỳ» — only if RATE-429 cleared; else mark BLOCKED-ENV, not FE fail.

---

## Handoff

- `completion_report`: Portal registry/path/sidebar gap for performance closed; unit tests PASS. Mutate still blocked by RATE-429 (not FE).
- `next_owner`: **qa**
- `ack_status`: **READY_FOR_QA**
- `evidence_path`: `docs/qa/evidence/cond-pf-portal-01-20260717.md`

### next_dispatch_prompt

```text
work_item_id: COND-PF-PORTAL-01
from_role: pm
to_role: qa
entry_criteria: docs/qa/evidence/cond-pf-portal-01-20260717.md READY_FOR_QA; U65 zero-seed
spec_ref: HRM-PF-02/04 list + portal deep-link; HRM-PF-01/03 mutate only if RATE-429 cleared
exit_criteria: PASS_TO_PM with browser evidence — /command-center/hrm/performance stays on performance (no dashboard redirect), iframe /hr/performance?portal=1&companyId=main, sidebar highlight Đánh giá, list 2xx; do not FAIL FE if mutate still RATE-429 (note BLOCKED-ENV)
evidence_path: docs/qa/evidence/cond-pf-portal-01-qa-20260717.md
```
