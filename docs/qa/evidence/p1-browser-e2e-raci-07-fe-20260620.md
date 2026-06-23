# P1-BROWSER-E2E-RACI-07-01 — UF-XBOS-07 RACI cell PUT persist (dev-fe)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-RACI-07-01` |
| **role** | dev-fe |
| **executed_at** | 2026-06-20 |
| **UF** | UF-XBOS-07 |
| **spec_ref** | UC-RACI-02 / UC-CC-RACI · SRS `docs/xbos/RACI_GOVERNANCE_SRS.md` § UC-RACI-02 |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause (spec says / code did)

| Layer | Before | After |
|-------|--------|-------|
| **SRS UC-RACI-02** | Sửa ô → `PUT cell` → reload giữ giá trị | Same |
| **FE (R4 fail)** | Uncontrolled `defaultValue` + **blur-only** save; QA `browser_type` + adjacent click → **no PUT** in Network; F5 revert | Controlled cell + **600ms debounced PUT** on change + **flush on blur**; persisted snapshot vs server baseline |

**Hypothesis:** Blur-only path on uncontrolled inputs was unreliable under browser automation (value visible in DOM but save skipped or compared against stale matrix row). Permission matrix (UF-13 🟢) already uses debounced PUT — RACI aligned to same pattern.

---

## Changes

| File | Change |
|------|--------|
| `apps/web/web-portal/src/integrations/raciMatrixCellPersist.ts` | Cell key, sanitize, persist skip, snapshot helpers; `RACI_MATRIX_CELL_SAVE_DEBOUNCE_MS = 600` |
| `apps/web/web-portal/src/integrations/raciMatrixCellPersist.test.ts` | Vitest 4 cases |
| `apps/web/web-portal/src/pages/command-center/CompanyRaciPanel.tsx` | Controlled inputs; debounced + blur-flush `saveRaciMatrixCell`; `persistedCellsRef` on matrix load |

**API contract:** unchanged — `PUT /api/xbos/raci-governance/companies/{legalEntityUuid}/matrix/cell` body `{ activity_id, org_column_id, raci_letters }`.

---

## Verification (local)

```text
pnpm exec vitest run src/integrations/raciMatrixCellPersist.test.ts src/integrations/raciGovernanceHelpers.test.ts
→ 9/9 PASS

pnpm run build (web-portal)
→ tsc + vite build exit 0
```

---

## QA retest script (U63/U65 — no seed)

1. Login `ceo@xe.vn` / `Xevn@2026` on `:8088` (after portal-fe deploy).
2. `?settings=company_member_units` → XE_DU_LICH → **Chỉnh sửa** → tab **Nhiệm vụ & RACI** → **Ma trận RACI**.
3. Cell **BDH-001 × HĐQT**: clear → type **R** (or toggle letters).
4. **Network:** within ~600ms (or immediately on blur) expect **PUT 200/201** `…/raci-governance/companies/{uuid}/matrix/cell` code `XBOS-RACI-201`.
5. **F5** → re-open same RACI tab → cell still **R**.
6. **FE post-mutation:** no rose error banner; optional `aria-busy` ring while saving.

**Persona:** Group CEO · **J-CC-02** member legal entity RACI override path.

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-RACI-07-DEPLOY | Rebuild/redeploy `web-portal` on VPS `:8088` before QA browser retest | devops |
| R-RACI-07-QA | Browser U63 block + matrix UF-XBOS-07 🟢 | qa |

---

## completion_report

- **Closed:** RACI matrix cell autosave — debounced PUT + blur flush + controlled inputs; vitest 9/9; web-portal build PASS.
- **Open:** VPS `:8088` deploy + QA browser F5 proof (UF-XBOS-07).

## next_owner

`qa`

## next_dispatch_prompt

```
Role: qa
work_item_id: P1-BROWSER-E2E-RACI-07-01
from_role: dev-fe
to_role: qa
priority: P0
entry_criteria: dev-fe READY_FOR_QA — RACI debounced PUT in CompanyRaciPanel; evidence docs/qa/evidence/p1-browser-e2e-raci-07-fe-20260620.md; portal-fe deployed :8088
exit_criteria: UF-XBOS-07 browser U63 on :8088 — toggle BDH-001 HĐQT cell → Network PUT 2xx → F5 cell sticky; update USER_FLOW_OPERABILITY_MATRIX Dev8088 🟢; ack_status PASS_TO_PM
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md §R4 UF-07 retest
cấm: seed
ack_status: PASS_TO_PM
pm_dispatch_hint: After UF-07 🟢 — resume Wave 1 closeout (UF-14 deploy, UF-08/09 inbox chain)
```
