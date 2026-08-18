# BM-EXP-FE-ROLE-SWITCH-01 — Inventory (portal / HRM role·company switch)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-EXP-FE-ROLE-SWITCH-01` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **from_role** | explore |
| **to_role** | pm → qa / ba-process / `BM-FE-ROLE-SWITCH-01` (if FAIL) |
| **lane** | execution (inventory ONLY) |
| **date** | 2026-07-22 |
| **thoroughness** | medium |
| **U65** | No seed · no browser mutate · **cấm** edit `apps/**` |
| **spec_ref** | `docs/program/deltas/BMINUTES_AC_MATRIX.md` BM-02 · `BM-AC-02-01`..`04` · prior `AC-CD-F3-*` / CD-FB-06 |

**Job:** Clear role/company switch UI — avoid mixed data. Inventory membership / OU switcher / role clarity vs BM-AC-02-*.

**Method:** Static code + prior QA/QC evidence cross-read (no live browser this wave).

---

## Executive verdict

| Overall | Detail |
|---------|--------|
| **Inventory** | **PARTIAL FAIL** on **BM-AC-02-01** clarity (role chip **not** inside HRM embed after sponsor strip removal) |
| **Wire core** | OU filter + portal membership switcher + `select-membership` + JWT-stable OU path **EXIST** |
| **BM-AC-02-02 / 03** | **EXISTS** (code + prior QC PASS) |
| **BM-AC-02-04** | **EXISTS** UI+API; persona multi-hat still **N/A** (`C-CD-FB-06-01`) |

→ Dispatch **`BM-FE-ROLE-SWITCH-01`** (copy-ready below) for compact **non-annotation** context (ĐVTV + role VI) on HRM embed surface — or BA waive that portal `TopHeader` alone satisfies BM-AC-02-01.

---

## Artifact map (where UI lives)

| Surface | Path | Role |
|---------|------|------|
| Portal membership / role chip | `apps/web/web-portal/src/components/layout/TopHeader.tsx` | Switch JWT tenant when `tenants.length > 1`; else static chip |
| Role VI map | `apps/web/web-portal/src/integrations/scopeRoleLabels.ts` | `formatRoleCodeVi` (incl. `subsidiary_ceo`) |
| Membership API client | `apps/web/web-portal/src/integrations/authSession.ts` → `POST /api/xbos/auth/select-membership` | JWT re-issue |
| Auth wire | `apps/web/web-portal/src/contexts/AuthContext.tsx` → `selectMembership` | Persist new token |
| Iframe remount on membership | `apps/web/web-portal/src/modules/hrm/HrmWorkspaceRoute.tsx` | `key={embedScopeKey}` / `scopeRevision` |
| HRM OU filter UI | `apps/web/hrm/src/components/hrm/HrmOperatingUnitFilter.tsx` | Group CEO embed only |
| OU filter state | `apps/web/hrm/src/contexts/HrmOperatingUnitFilterContext.tsx` | Query slug + RQ invalidate; **does not** call select-membership |
| Embed chrome | `apps/web/hrm/src/components/layout/AppLayout.tsx` | Renders OU filter; **no** scope/role bar |
| **Deleted (2026-07-20)** | `HrmEmbedScopeBar.tsx` / `PortalEmbedScopeBar.tsx` | Sponsor: remove annotation strip |

**testids:** `portal-membership-switcher` · `portal-membership-static` · `hrm-operating-unit-viewing-banner`

---

## BM-AC-02 matrix — EXISTS / MISSING

| AC-ID | Expect (matrix) | Inventory | Evidence / notes |
|-------|-----------------|-----------|------------------|
| **BM-AC-02-01** | Chip/banner: ĐVTV context + **role** label (not UUID) on HRM tab | **PARTIAL** | **EXISTS:** portal `TopHeader` shows `name` + `shortName · {roleLabel}` via `formatRoleCodeVi` (not UUID). **MISSING in embed:** role chip deleted with `PortalEmbedScopeBar` / `HrmEmbedScopeBar` (`CD-FB-06-REMOVE-SCOPE-ANNOTATIONS`). Embed keeps OU banner «Đang xem: {display_name_vi}» only — **no role**. Clarity risk vs minutes «role/company switch rõ». |
| **BM-AC-02-02** | OU → member slug; list refetch; JWT stays `main` | **EXISTS** | `HrmOperatingUnitFilter` + `setSelectedSlug` → `resolveHrmOperatingUnitQueryCompanyId` + `queryClient.invalidateQueries()`; comments + prior QC: JWT `companyId=main` stable (filter ≠ select-membership). `setCurrentCompanyId` = **client storage only**, not JWT mutate. |
| **BM-AC-02-03** | Member CEO: no group rollup; switcher hidden/static | **EXISTS** | OU `showFilter` only if `portalEmbed && JWT tenant === xevn`; member → filter `null`. TopHeader: `showMembershipSwitcher = tenants.length > 1` else `portal-membership-static`. Prior QC: `du-lich.ceo@xe.vn` isolation PASS. |
| **BM-AC-02-04** | Multi-hat → `POST …/select-membership` 2xx → JWT → HRM remount | **EXISTS (code) / N/A (persona)** | Client + TopHeader dropdown + `HrmWorkspaceRoute` remount on scope. Pilot `ceo@xe.vn` / `du-lich.ceo@xe.vn` single-hat → condition **C-CD-FB-06-01** still open. U65: do not seed multi-hat. |

---

## Clarity / mixed-data risk (BM-02 intent)

| Risk | Severity | Status |
|------|----------|--------|
| Two switchers: **Membership** (JWT) vs **Đơn vị thành viên** (OU query) | P2 UX | **Mitigated by labels** («Membership đang làm việc» vs «Đơn vị thành viên» / «Đang xem») — still easy to confuse if role not visible in iframe |
| Role only above iframe; deep scroll in embed loses role cue | P1 clarity vs BM-AC-02-01 | **GAP** — drives `BM-FE-ROLE-SWITCH-01` |
| OU writes `hrm_current_company_id=<slug>` while JWT `main` | P2 tech | **By design** (AC-CD-F3-03); list hooks use `currentCompanyId` / `listCompanyId` after filter update |
| OU hidden on `/settings`, `/company` | Info | Intentional (`FILTER_HIDDEN_PATH_PREFIXES`) — catalog stays JWT `main` rollup |

**Do not reopen** closed CD-FB-06 label condition (`subsidiary_ceo` VI — CLOSED). Multi-hat remains process condition, not FE missing wire.

---

## Prior art (do not invent browser PASS)

| Evidence | Relevance |
|----------|-----------|
| `docs/qa/evidence/cd-fb-06-role-switch-qc-20260719.md` | GWC — F3 chips/OU/member + J-HRM-INT-05 PASS; F3-04 N/A |
| `docs/qa/evidence/cd-fb-06-remove-scope-annotations-qa-20260720.md` | Annotation strip removed; OU + TopHeader must_keep PASS |
| `docs/qa/evidence/cd-fb-06-role-label-p2-qc-20260719.md` | Role VI alias CLOSED |

This explore wave **does not** promote BM-AC-02-* to `code_does: PASS` in the BA matrix — browser customer retest still required on `:8088`.

---

## Gaps → owners

| Gap | AC | Owner | Action |
|-----|-----|-------|--------|
| Embed lacks role+ĐVTV combined chip | BM-AC-02-01 | **dev-fe** `BM-FE-ROLE-SWITCH-01` **or** ba-process waive | Compact sticky context (company/OU + role VI) — **not** JWT/AC annotation dump |
| Multi-hat persona missing | BM-AC-02-04 | pm/qa when persona exists | Keep **C-CD-FB-06-01**; no seed |
| Customer retest browser | BM-AC-02-* | qa | After FE/BA decision |

---

## Copy-ready — `BM-FE-ROLE-SWITCH-01` (FAIL path)

```text
work_item_id: BM-FE-ROLE-SWITCH-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
program: P1-BMINUTES-CUST-RETEST-01
parent: BM-EXP-FE-ROLE-SWITCH-01
change_mode: ADD
U65: zero-seed

## Problem
BM-AC-02-01: after CD-FB-06-REMOVE-SCOPE-ANNOTATIONS, HRM embed has OU «Đang xem» only — no role label inside iframe. Portal TopHeader still shows role, but customer BM-02 needs clear role/company context on HRM surface to avoid mixed-data confusion.

## Allowed
- Compact sticky chip/banner in HRM embed AppLayout (portal mode): ĐVTV/OU label + role VI (`formatRoleCodeVi` / JWT roleCode) — human names, never UUID-only
- Reuse existing OU filter + TopHeader membership; do not duplicate JWT mutate on OU change
- Vitest for label map / visibility (group CEO vs member hide)

## Forbidden
- Restore deleted annotation strip (Ngữ cảnh / JWT companyId=main / AC-CD-F3 hint text)
- Mutate JWT on OU filter (must keep AC-CD-F3-03 / BM-AC-02-02)
- Seed multi-hat; overwrite UF 🟢 without regression
- Edit unrelated modules

## must_keep
- HrmOperatingUnitFilter (BM-AC-02-02)
- TopHeader select-membership (BM-AC-02-04)
- Member: no OU rollup filter (BM-AC-02-03)
- embedScopeKey soft-nav PERF

## entry_criteria
- read: docs/qa/evidence/bm-exp-fe-role-switch-01-20260722.md
- read: BMINUTES_AC_MATRIX.md BM-AC-02-01..04
- read: cd-fb-06-remove-scope-annotations-20260720.md (sponsor must_keep)
- spec_read_ack before code

## exit_criteria
- Embed shows ĐVTV/OU + role VI on HRM tabs (group CEO); member shows static company+role without multi switch
- Vitest PASS; READY_FOR_QA
- evidence_path: docs/qa/evidence/bm-fe-role-switch-01-YYYYMMDD.md

## next after READY_FOR_QA
qa BM-QA-ROLE-SWITCH-8088-01 — browser U65 BM-AC-02-01..03 (+ 02-04 if multi-hat persona)
```

**Alternate (governance):** If BA confirms TopHeader-only satisfies BM-AC-02-01 post sponsor strip removal → **waive FE**, update matrix `code_does` note + QA click path «assert TopHeader chip visible while on HRM tab» — no `BM-FE-ROLE-SWITCH-01`.

---

## Handoff

```yaml
work_item_id: BM-EXP-FE-ROLE-SWITCH-01
from_role: explore
to_role: pm
ack_status: PASS_TO_PM
completion_report: >
  Inventory BM-02: OU filter + portal membership/select-membership EXIST;
  BM-AC-02-02/03 EXISTS; BM-AC-02-04 code EXISTS / persona N/A;
  BM-AC-02-01 PARTIAL FAIL — role chip missing inside HRM embed after annotation removal.
  Copy-ready BM-FE-ROLE-SWITCH-01 included (or BA waive TopHeader-only).
next_owner: pm
evidence_path: docs/qa/evidence/bm-exp-fe-role-switch-01-20260722.md
next_dispatch_prompt: |
  Prefer: Task ba-process (narrow) — confirm BM-AC-02-01 SoT = TopHeader vs embed chip;
  if embed required → Task BM-FE-ROLE-SWITCH-01 (prompt above);
  then qa browser BM-AC-02-* on :8088 U65.
cấm: seed · Phase1/PROD · invent matrix PASS · edit apps/**
```
