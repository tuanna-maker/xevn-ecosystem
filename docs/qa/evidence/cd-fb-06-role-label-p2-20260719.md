# CD-FB-06-ROLE-LABEL-P2 — subsidiary_ceo VI chip — 2026-07-19

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-06-ROLE-LABEL-P2` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **change_mode** | UPGRADE |
| **spec_ref** | AC-CD-F3-01 · residual `R-CD-FB-06-01` from `docs/qa/evidence/cd-fb-06-role-switch-qa-20260719.md` |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim · no broad F3 refactor |
| **ack_status** | **READY_FOR_QA** (narrow — unit + smoke chip VI) |
| **date** | 2026-07-19 |

---

## spec_read_ack

- **qa residual:** R-CD-FB-06-01 — member CEO chip showed English `subsidiary ceo` (fallback)
- **root cause:** Pilot JWT SoT uses `subsidiary_ceo` (`PILOT_PORTAL_USERS` / xbos auth); map only had `member_ceo`
- **change_mode:** UPGRADE (alias only)
- **must_keep:** Existing F3 VI labels (`group_ceo`, `ceo`, `hrbp_manager`, `member_ceo`) unchanged
- **forbidden:** Broad refactor of scope bars / membership switch

---

## Summary

Added `subsidiary_ceo` → **TGĐ công ty thành viên** (same string as `member_ceo`) in:

1. `apps/web/web-portal/src/integrations/scopeRoleLabels.ts` — portal parent chips / TopHeader
2. `apps/web/hrm/src/components/hrm/PortalEmbedScopeBar.tsx` — iframe chip parity

Vitest covers case-insensitive `SUBSIDIARY_CEO` and regression that prior F3 labels stay Vietnamese (not underscore English).

---

## Tests run

```bash
pnpm -C apps/web/web-portal exec vitest run src/integrations/scopeRoleLabels.test.ts
pnpm -C apps/web/hrm exec vitest run src/components/hrm/__tests__/portalEmbedScopeBar.test.ts
```

Expected: all PASS (see shell evidence in this wave).

### Results (2026-07-19)

| Suite | Result |
|-------|--------|
| `web-portal` `scopeRoleLabels.test.ts` | **4 passed** |
| `hrm` `portalEmbedScopeBar.test.ts` | **3 passed** |

---

## QA narrow (U65 browser)

1. Login `du-lich.ceo@xe.vn` / `Xevn@2026` → `/command-center/hrm/employees`
2. Assert role chip = **TGĐ công ty thành viên** (not `subsidiary ceo`)
3. Regression smoke: `ceo@xe.vn` chip still **Tổng giám đốc tập đoàn**
4. No seed

---

## completion_report

Closed R-CD-FB-06-01: `subsidiary_ceo` mapped VI on portal + HRM iframe helpers; vitest updated; F3 prior labels preserved. Residual: browser smoke for QA only (unit cannot prove chip render).

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: CD-FB-06-ROLE-LABEL-P2
from_role: pm
to_role: qa
entry_criteria: docs/qa/evidence/cd-fb-06-role-label-p2-20260719.md READY_FOR_QA; R-CD-FB-06-01
exit_criteria: Browser — du-lich.ceo role chip VI «TGĐ công ty thành viên»; ceo@xe.vn group_ceo chip unchanged; no seed
evidence_path: docs/qa/evidence/cd-fb-06-role-label-p2-qa-20260719.md
ack_status: PASS_TO_PM
cấm: reopen AC-CD-F3-02..06 already PASS without regression evidence
```

## ack_status

**READY_FOR_QA**
