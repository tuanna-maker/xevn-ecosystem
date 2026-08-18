# CD-FB-06-REMOVE-SCOPE-ANNOTATIONS — QA evidence

**work_item_id:** `CD-FB-06-REMOVE-SCOPE-ANNOTATIONS`  
**date:** 2026-07-20  
**from_role:** qa  
**to_role:** pm  
**ack_status:** PASS_TO_PM  
**U65:** zero-seed · browser FE path · no mutate seed  
**account:** `ceo@xe.vn` / `Xevn@2026`  
**L0:** `qc:dev-stack` — hrm-api :28001 200 · xbos-api :28002 200 · web-portal :5173 200  
**entry:** `docs/qa/evidence/cd-fb-06-remove-scope-annotations-20260720.md` (Dev-FE READY)

## Scope under test

Sponsor: remove annotation/context bars («Ngữ cảnh» / JWT companyId / AC-CD-F3 hints). Keep OU filter (AC-CD-F3-03) + TopHeader membership (AC-CD-F3-04).

## Verdict matrix

| # | Exit criteria | Result | Evidence |
|---|---------------|--------|----------|
| 1 | No «Ngữ cảnh» / JWT companyId / AC-CD-F3 annotation bars on HRM **embed** | **PASS** | Parent + iframe CDP `hasNguCanh/hasJwtAnnot/hasAc` = false; screenshot CC → HRM dashboard clean above OU filter |
| 2 | No annotation bars on HRM **standalone** (shared AppLayout) | **PASS** (code + login surface) | `PortalEmbedScopeBar.tsx` deleted; AppLayout only renders `HrmOperatingUnitFilter`; `:8080/hr/login` body has no Ngữ cảnh/AC/JWT annot (login blocked by pre-existing Sync 500 — out of CD-FB-06) |
| 3 | OU filter (ĐVTV) still works | **PASS** | Filter visible; switch `holding`→`trsport` → banner «Khối Vận tải X.E», `hrm_current_company_id=trsport`, NHÂN SỰ **1108→220**; reset → «Tất cả đơn vị (rollup)» |
| 4 | TopHeader membership switch still works | **PASS** (chip intact) | `/dashboard/organization` after cockpit unlock: `data-testid=portal-membership-static` shows «Tập đoàn XeVN · Tổng giám đốc tập đoàn» (`formatRoleCodeVi`); no annotation bleed. Multi-tenant switcher N/A — `GET /api/xbos/auth/me` returns **1** membership for ceo |

**Overall:** **PASS_TO_PM**

## Click / probe path (U65)

1. L0 `pnpm run qc:dev-stack` — PASS (HRM/XBOS/portal 200).
2. Browser already authenticated session → `http://127.0.0.1:5173/command-center/hrm/dashboard`.
3. CDP assert parent + iframe: no «Ngữ cảnh», no JWT `/main` annotation strip, no `AC-CD-F3`.
4. OU: Select `onValueChange('trsport')` (Radix synthetic click unreliable in iframe) → count + companyId change; reset `all`.
5. Cockpit unlock → `/dashboard/organization` → TopHeader static membership + role VI.
6. Optional standalone `:8080/hr/login` — no annotation strings; Sync ERROR 500 pre-existing (not FAIL for annotation removal).

## Code confirmation

| Artifact | Status |
|----------|--------|
| `apps/web/hrm/.../PortalEmbedScopeBar.tsx` | **deleted** |
| `apps/web/web-portal/.../HrmEmbedScopeBar.tsx` | **deleted** |
| `AppLayout.tsx` | still mounts `<HrmOperatingUnitFilter />` |
| `HrmWorkspaceRoute.tsx` | no `HrmEmbedScopeBar` render |
| `TopHeader` + `formatRoleCodeVi` | intact |

## Residual / not promoted

| Item | Severity | Note |
|------|----------|------|
| Standalone `:8080` HRM API Sync ERROR 500 on login | P2 out-of-scope | Does not reintroduce annotation bars; separate FE/BE health if sponsor needs standalone login |
| Multi-membership switcher UI | N/A | ceo session has single master membership → static chip path (by design) |
| Command Center BOD/Quản lý/Nhân viên | Out of scope | Persona tabs — **not** TopHeader membership |

## cấm compliance

- No `pnpm seed:*` · no DB fake · no PASS-only-because-annotation-gone without OU/TopHeader checks.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: CD-FB-06-REMOVE-SCOPE-ANNOTATIONS
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA PASS_TO_PM; evidence docs/qa/evidence/cd-fb-06-remove-scope-annotations-qa-20260720.md; U65
exit_criteria: QC GO or GWC for annotation-strip removal; confirm OU + TopHeader must_keep; no reopen Phase1/PROD
residual_note: standalone Sync 500 out-of-scope; ceo single membership → static TopHeader chip OK
```

## completion_report

Closed: CD-FB-06 browser smoke — annotation bars gone on embed; OU filter functional (1108→220 trsport); TopHeader role VI chip intact. Residual: standalone login Sync 500 (not CD-FB-06), multi-membership switcher N/A for ceo.
