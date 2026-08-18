# PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-04 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-04` |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `attendance_uat_ready=false` · **C-SLICE** · **≠ ATT-06 / FR-06 DONE** |
| **qa_prior** | `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qa-01.md` stamp **ATT06QA1-MSM79FOI** · **D-ATT-06-QA-APPROVE-CHAIN** |

## Root cause (FE)

| Defect | Cause | Fix |
|--------|--------|-----|
| **D-ATT-06-QA-APPROVE-CHAIN** | Playwright `row.locator('button').first()` hit Radix **checkbox** (role=button), not Eye → detail «Duyệt» never opened. Refetch also hid table (`isLoading` full-page). | `data-testid` `att-ot-row-view` · `att-ot-approve-submit` · `att-ot-row-pending`; keep table on refetch (`showInitialLoading`); `fetchRequests()` after create 201. |
| **D-ATT-06-QA-J07-SEALS** | J-07 read `att-06-policy-honesty` on stale policy frame after navigate OT; banner text lacked explicit ATT05 peer seal. | Read seals **before** policy OFF in QA script; banner + `data-att-06-seal-*` on policy panel. |

## Files

- `apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx`
- `apps/web/hrm/src/lib/attLeave06Ring.ts`
- `apps/web/hrm/src/components/settings/AttOtCompLeavePolicySettingsPanel.tsx`
- `apps/web/hrm/src/lib/poHrmMvpGd1Att06ClusterFe04.source.test.ts`
- `scripts/qa/_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.mjs` (harness align)

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/attLeave06Ring.test.ts src/lib/poHrmMvpGd1Att06ClusterFe02.source.test.ts src/lib/poHrmMvpGd1Att06ClusterFe03.source.test.ts src/lib/poHrmMvpGd1Att06ClusterFe04.source.test.ts --no-cache
```

**Result:** 4 files · 17 tests · **PASS** (2026-08-10)

## QA retest (U65 · no seed)

Persona: `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · holding OU

| Journey | Expect |
|---------|--------|
| **J-HRM-ATT-06-03** | Pending row → `att-ot-row-view` → `att-ot-approve-submit` → **POST** `overtime-requests/*/approve` **2xx** |
| **J-HRM-ATT-06-04** | `credited_days>0` when policy ON · compensatory entitled ↑ · F5 persist |
| **J-HRM-ATT-06-07** | Policy OFF → approve 2xx · no accrual · honesty seals read on policy panel |

## completion_report

**Closed:** P0 approve chain (testids + list mount on refetch + post-create refetch); J-07 honesty text/seals + QA harness approve + seal read order; vitest FE-04 source lock.

**Open:** Browser J-03/04/07 confirmation; ≠ ATT-06 / FR-06 DONE.

**next_owner:** **qa**

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-fe-04.md`

**ack_status:** **READY_FOR_QA**

---

*End FE-04 · READY_FOR_QA · C-SLICE · ≠ ATT-06 DONE*
