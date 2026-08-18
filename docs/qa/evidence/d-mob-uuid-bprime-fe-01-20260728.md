# D-MOB-UUID-BPRIME-FE-01 — FE Plane B′ display polish (2026-07-28)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-MOB-UUID-BPRIME-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution · U65 · HOLD_DEPLOY |
| **change_mode** | FIX · preserve_default |
| **date** | `2026-07-28` (ICT) |
| **entry** | QC-HRM-MOB-UUID-PLANE-01 GWC · P2 FE hash fixtures / display residual |
| **ack_status** | **READY_FOR_QA** |
| **deploy** | **HOLD_DEPLOY** · NOT `:8088` |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |

---

## 1. Spec / gap (read_first)

| Artifact | Finding |
|----------|---------|
| `qc-hrm-mob-uuid-plane-01-20260727.md` | GWC; P2 OPEN — FE hash fixtures `6efaa5d6-…` + optional display align |
| `be-hrm-mob-uuid-bprime-01-20260727.md` §6 | Client fixtures must expect `HRM_COMPANY_UUID_BY_SLUG` (`…0001` / `…0005`) |
| `qa-hrm-mob-uuid-plane-01-r2-20260727.md` | Live JWT B′ PASS; FE fixture residual → this WI |

**must_keep verified (not reopened):** G-INT-03 Option A · OP/MD plane guards · INF appliesToCompanyIds Plane A FE GWC · dual-plane BE guards untouched · U65 · HOLD_DEPLOY.

---

## 2. Root cause (display)

| Surface | Before | After |
|---------|--------|-------|
| HRM embed `resolveEmployeeCompanyColumnLabel` / `resolveHrmCompanyIdDisplay` | OU map keyed by slug — Plane B′ UUID miss → `—` even for known holding | `resolveHrmCompanySlugForDisplay` maps B′ → slug → VI label |
| Mobile `resolveCompanyDisplayVi` | B′ UUID treated as unknown → «Chưa chọn công ty» | B′ → registry VI label; unknown LE UUID → `—` (never print UUID) |
| Mobile vitest fixtures | Expected SHA256 hash `6efaa5d6-…` | Plane B′ `10000000-…0001` |

---

## 3. Fix (display / fixtures only)

### Web (HRM embed)

- `apps/web/hrm/src/lib/hrmMetadataCompany.ts` — `resolveHrmCompanySlugForDisplay` (B′ UUID → slug; LE UUID → `null`)
- `apps/web/hrm/src/lib/employeeCompanyDisplayName.ts` — lookup via display slug helper
- CODE-MEMORY APPEND on helpers + `labelMaps.ts` note

### Mobile (facing FE + residual fixtures)

- `apps/mobile/hrm-mobile/src/utils/companyDisplayVi.ts` — `resolveOperatingSlugForDisplay` + B′ map; unknown UUID → `—`
- Align fixtures: `p1-phase1-mob-p5-jwt.test.ts`, `qaLoginDeepLink` SAMPLE_JWT, `companyWireScope` / `hrmApiClient` / leave-balance / home-summary / file-upload tests — hash → `…0001`

**Not touched:** BE dual-plane guards · attendance wire echo JWT · OP/MD/INF GWC paths · seed.

---

## 4. Tests

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/employeeCompanyDisplayName.test.ts src/lib/hrmMetadataCompany.test.ts
→ Test Files 2 passed · Tests 17 passed · EXIT 0

cd apps/mobile/hrm-mobile
pnpm exec vitest run src/utils/__tests__/companyDisplayVi.test.ts \
  src/integrations/__tests__/p1-phase1-mob-p5-jwt.test.ts \
  src/integrations/__tests__/qaLoginDeepLink.test.ts \
  src/integrations/__tests__/hrmApiClient.test.ts \
  src/integrations/__tests__/companyWireScope.test.ts \
  src/integrations/__tests__/hrmLeaveBalance.test.ts \
  src/integrations/__tests__/hrmHomeSummary.test.ts \
  src/integrations/__tests__/hrmFileUpload.test.ts
→ Test Files 8 passed · Tests 63 passed · EXIT 0
```

---

## 5. Exit criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Grep FE — no display of raw LE/hash as company name on touched resolvers | **PASS** — B′→label; LE→`—` |
| 2 | Prefer label/slug; fallback `—` never crash | **PASS** |
| 3 | Vitest mappers + P5 JWT fixtures green | **PASS** 17 + 63 |
| 4 | Evidence + READY_FOR_QA | **PASS** |
| 5 | Dual-plane BE / must_keep not reopened | **PASS** |

---

## 6. Residual

| ID | Sev | Note | Owner |
|----|-----|------|-------|
| Device J-MOB visual | Info | Not in this WI — L1/GWC already deferred device UF | qa-device if PM opens |
| Historical ATT hash rows | Info | Display N/A; list may still rely on slug normalize | defer |
| Runtime screens beyond resolvers | Info | Spot-check Scope/Home/Settings + HRM company column if UUID-shaped `company_id` appears | QA |

---

## Handoff

### completion_report

**Closed:** P2 FE Plane B′ display polish — HRM embed company column / `resolveHrmCompanyIdDisplay` maps B′ UUID→VI label; mobile `resolveCompanyDisplayVi` same; unknown LE UUID → `—`; mobile hash fixtures (incl. `p1-phase1-mob-p5-jwt`) aligned to `HRM_COMPANY_UUID_BY_SLUG`; vitest **17+63** PASS; BE dual-plane / OP/MD/INF untouched; HOLD_DEPLOY; NOT Phase1/PROD.

**Open:** Device visual deferred; QA spot-check display labels.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-MOB-UUID-BPRIME-FE-01
from_role: pm
to_role: qa
lane: execution · U65 zero-seed · HOLD_DEPLOY
entry_criteria: D-MOB-UUID-BPRIME-FE-01 READY_FOR_QA — docs/qa/evidence/d-mob-uuid-bprime-fe-01-20260728.md
read_first:
  - docs/qa/evidence/d-mob-uuid-bprime-fe-01-20260728.md
  - docs/qa/evidence/qc-hrm-mob-uuid-plane-01-20260727.md (P2 condition)
must_keep: OP/MD/INF dual-plane GWC · LE body 409 · no seed · no BE reopen · NOT Phase1/PROD
exit_criteria:
  1) Spot-check: company display never shows raw UUID (Plane B′ holding → «Tập đoàn XeVN» or OU VI label; unknown LE → «—»)
  2) Vitest cite or re-run: web employeeCompanyDisplayName + hrmMetadataCompany; mobile companyDisplayVi + p1-phase1-mob-p5-jwt (expect …0001 not 6efaa5d6)
  3) Confirm dual-plane BE not regressed (no BE code in this WI) — PASS_TO_PM or FAIL with residual
  4) Evidence docs/qa/evidence/qa-mob-uuid-bprime-fe-01-20260728.md
cấm: seed · device UF claim without adb · reopen CO-HC/OP/MD · Phase1/PROD/:8088
ack_status target: PASS_TO_PM
```

### evidence_path

`docs/qa/evidence/d-mob-uuid-bprime-fe-01-20260728.md`

### ack_status

**READY_FOR_QA**
