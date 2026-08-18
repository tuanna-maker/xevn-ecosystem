# BM-FE-ROLE-SWITCH-01 — Compact embed role + ĐVTV (Dev-FE)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-FE-ROLE-SWITCH-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-07-22 |
| **ack_status** | **READY_FOR_QA** |
| **parent** | `BM-EXP-FE-ROLE-SWITCH-01` · program `P1-BMINUTES-CUST-RETEST-01` |
| **U65** | zero-seed · no annotation strip restore · no Phase1/PROD claim |

---

## spec_read_ack

| Key | Value |
|-----|--------|
| **srs** | `docs/program/deltas/BMINUTES_AC_MATRIX.md` **BM-AC-02-01**..**04** · prior `AC-CD-F3-01`..`06` |
| **tech_spec / ADR** | `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` §3 / §5.3 |
| **inventory** | `docs/qa/evidence/bm-exp-fe-role-switch-01-20260722.md` |
| **must_keep sponsor** | `docs/qa/evidence/cd-fb-06-remove-scope-annotations-20260720.md` — no Ngữ cảnh / JWT companyId / AC-CD-F3 chrome |
| **change_mode** | **ADD** (compact chip on existing OU bar; do not restore deleted `PortalEmbedScopeBar` / `HrmEmbedScopeBar`) |
| **sponsor_confirm** | PM dispatch `BM-FE-ROLE-SWITCH-01` (2026-07-22) |

### spec says / code does

| AC | Spec | Code |
|----|------|------|
| **BM-AC-02-01** | Chip/banner: ĐVTV + role VI (not UUID) on HRM embed | **DONE** — `hrm-embed-role-chip` on OU bar; member `hrm-embed-working-context` = ĐVTV · role |
| **BM-AC-02-02** | OU → slug refetch; JWT `main` stable | **must_keep** — `setSelectedSlug` / invalidate only; no select-membership |
| **BM-AC-02-03** | Member: no group OU rollup | **must_keep** — `showFilter` false → static chip, no Select |
| **BM-AC-02-04** | select-membership remount | **untouched** — portal `TopHeader` + `HrmWorkspaceRoute` |

---

## Closed

1. HRM `formatRoleCodeVi` parity (`scopeRoleLabels.ts`) incl. `subsidiary_ceo` → «TGĐ công ty thành viên».
2. Pure `resolveEmbedWorkingContext` — ĐVTV human label + role; UUID → «Công ty thành viên»; forbidden annotation snippets asserted.
3. `HrmOperatingUnitFilter` (portal embed only):
   - Group CEO: existing OU Select + «Đang xem» + **role VI** (`data-testid=hrm-embed-role-chip`).
   - Member / filter-hidden: compact `ĐVTV · role` (`hrm-embed-working-context`) — **no** OU rollup Select.
4. Did **not** restore `PortalEmbedScopeBar` / `HrmEmbedScopeBar` / Ngữ cảnh / JWT / AC hint strip.
5. TopHeader portal membership behavior unchanged.

---

## Tests run

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/lib/scopeRoleLabels.test.ts \
  src/lib/embedWorkingContext.test.ts \
  src/lib/hrmSpreadsheetScope.test.ts \
  src/components/hrm/__tests__/hrmOperatingUnitFilterRoleChip.test.ts
→ 4 files / 14 tests PASS

pnpm --filter web-portal exec vitest run src/integrations/scopeRoleLabels.test.ts
→ 4 tests PASS (TopHeader must_keep regression)
```

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/scopeRoleLabels.ts` | NEW — role VI map |
| `apps/web/hrm/src/lib/scopeRoleLabels.test.ts` | NEW |
| `apps/web/hrm/src/lib/embedWorkingContext.ts` | NEW — ĐVTV + role helpers |
| `apps/web/hrm/src/lib/embedWorkingContext.test.ts` | NEW |
| `apps/web/hrm/src/components/hrm/HrmOperatingUnitFilter.tsx` | Compact role (+ member static context) |
| `apps/web/hrm/src/components/hrm/__tests__/hrmOperatingUnitFilterRoleChip.test.ts` | Source contract |
| `apps/web/hrm/src/components/layout/AppLayout.tsx` | CODE-MEMORY-CHANGE only |

---

## QA smoke (U65 browser — copy-ready)

| Persona | Path | Expect |
|---------|------|--------|
| `ceo@xe.vn` | CC → HRM any tab | OU filter + `hrm-embed-role-chip` = «Tổng giám đốc tập đoàn»; **no** Ngữ cảnh/JWT/AC strip |
| `ceo@xe.vn` | OU → `trsport` | «Đang xem: …» + role still visible; Network refetch; token `companyId=main` |
| `du-lich.ceo@xe.vn` | HRM embed | `hrm-embed-working-context` = «Công ty Du lịch XeVN · TGĐ công ty thành viên»; **no** group OU Select |
| Portal | TopHeader | Membership chip unchanged (`portal-membership-*`) |

**J-*:** `J-HRM-INT-05` · matrix BM-AC-02-01..03 (02-04 N/A if single-hat).

---

## Residual

- Multi-hat `BM-AC-02-04` persona still **C-CD-FB-06-01** N/A — no seed.
- Browser :8088 customer retest = QA (`BM-QA-ROLE-SWITCH-8088-01`).

---

## completion_report

Closed BM-AC-02-01 FE gap: compact ĐVTV + role VI inside HRM embed without restoring annotation strip; OU filter + TopHeader select-membership must_keep. Vitest 14+4 PASS. Residual = QA browser U65 on :8088.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: BM-QA-ROLE-SWITCH-8088-01
from_role: pm
to_role: qa
lane: execution
priority: P1
entry_criteria: docs/qa/evidence/bm-fe-role-switch-01-20260722.md READY_FOR_QA; U65 zero-seed
exit_criteria: Browser BM-AC-02-01..03 on :8088 (ceo + du-lich.ceo); assert hrm-embed-role-chip / hrm-embed-working-context; no Ngữ cảnh/JWT/AC strip; OU JWT-stable; TopHeader intact; PASS_TO_PM
evidence_path: docs/qa/evidence/bm-qa-role-switch-8088-01-20260722.md
cấm: seed · probe-only PASS · Phase1/PROD
accounts: ceo@xe.vn / Xevn@2026 · du-lich.ceo@xe.vn / Xevn@2026
```
