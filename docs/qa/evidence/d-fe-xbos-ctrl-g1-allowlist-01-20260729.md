# D-FE-XBOS-CTRL-G1-ALLOWLIST-01 — Portal FE apply-to-members allow-list P0+P1

| Field | Value |
|-------|--------|
| **work_item_id** | `D-FE-XBOS-CTRL-G1-ALLOWLIST-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution `E-XBOS-CTRL-G1` |
| **date** | 2026-07-29 |
| **change_mode** | ADD |
| **ack_status** | **READY_FOR_QA** |
| **HOLD_DEPLOY** | yes · U65 zero-seed |
| **paired_BE** | `D-BE-XBOS-CTRL-G1-ALLOWLIST-01` |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| `docs/qa/evidence/d-be-xbos-ctrl-g1-allowlist-01-20260729.md` | BE allow-list = P0∪P1 (10) + DEC writeKey |
| `docs/program/HRM_ERP_XBOS_CTRL_SPEC_SYNTH.md` | P0 G1 + P1 optional unlocked |
| `docs/xbos/API_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md` | F.1 · alias · writeKey = source L0 |
| `docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md` | §2.1 P0 · §2.2 P1 · §2.4 aliases |

---

## 2. Closed scope

| Change | Detail |
|--------|--------|
| Allow-list | `APPLY_TO_MEMBERS_CATALOG_KEYS` = P0 ∪ P1 (**10 keys**) |
| P0 | `job_titles`, `recruitment_channels`, `job_grades`, `departments`, `leave_types` |
| P1 | `contract_types`, `employment_types`, `pay_types`, `shifts`, `decision_types` |
| Alias | `APPLY_TO_MEMBERS_CATALOG_ALIASES` + `resolveApplyToMembersCanonicalKey` (mirror BE) |
| DEC UX | GET try-list `hr_decision_types` → `decision_types`; apply `writeKey` = `source.catalogKey` via `resolveApplyWriteKey` |
| Labels | VI only (U72) — no paren slug |
| CODE-MEMORY | APPEND on `configSyncApplyMembers.ts` + `ApplyCatalogToMembersPanel.tsx` |
| P2 / Tier C | **Not** in dropdown (`salary_components`, `cost_centers`) |

**Runtime files:**

- `apps/web/web-portal/src/integrations/configSyncApplyMembers.ts`
- `apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.tsx`
- tests: `configSyncApplyMembers.test.ts` · `ApplyCatalogToMembersPanel.test.ts`

---

## 3. Verification

```text
pnpm exec vitest run src/integrations/configSyncApplyMembers.test.ts \
  src/pages/command-center/ApplyCatalogToMembersPanel.test.ts --reporter=dot
→ Test Files: 2 passed · Tests: 16 passed
```

| Case | Expect |
|------|--------|
| Allow-list length | 10 = P0∪P1 |
| `departments` / `leave_types` | `isApplyToMembersCatalogKey` true |
| `hr_decision_types` | canonical `decision_types`; accepted for apply path |
| `resolveApplyWriteKey('decision_types','hr_decision_types')` | `hr_decision_types` |
| `cost_centers` / `salary_components` | false (not in FE allow-list) |
| Panel | passes `writeKey: source?.catalogKey` to apply helper |

**tsc:** pre-existing unrelated error `HrmWorkspacePanel.tsx` missing `fleet` — not introduced by this WI.

---

## 4. Residual / not in this WI

| ID | Item | Owner |
|----|------|-------|
| R-QA | Browser U65: publish → apply departments/leave_types + one DEC → XBOS-CFG-204 | `QA-XBOS-CTRL-G1-01` |
| R-P2 | salary_components / insurers / kpi — still out of allow-list | later cohort |
| HOLD_DEPLOY | no perimeter/prod push | devops |

---

## 5. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/d-fe-xbos-ctrl-g1-allowlist-01-20260729.md`
- **next_dispatch_prompt:** (shared wave OK with BE)

```text
work_item_id: QA-XBOS-CTRL-G1-01
from_role: pm
to_role: qa
entry_criteria: D-BE-XBOS-CTRL-G1-ALLOWLIST-01 + D-FE-XBOS-CTRL-G1-ALLOWLIST-01 READY_FOR_QA; L0 stack; U65 zero-seed browser-only
exit_criteria: Portal dropdown shows P0+P1 (≥ departments, leave_types, decision_types); apply departments + leave_types → XBOS-CFG-204; DEC apply writeKey = source L0 (hr_decision_types if live); Tier C / P2 not in dropdown + CFG-005 if forced; matrix evidence; PASS_TO_PM
cấm: seed · invent L0 · Phase1 claim · HOLD_DEPLOY
evidence_path: docs/qa/evidence/qa-xbos-ctrl-g1-01-20260729.md
J-*: J-XBOS-CTRL-01 · J-XBOS-CTRL-02
URL: Command Center → Cài đặt → Áp dụng danh mục HRM
account: ceo@xe.vn / Xevn@2026
```
