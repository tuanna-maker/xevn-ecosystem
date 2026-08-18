# SA-U71-TECHSPEC-INDEX-REFRESH-01 — Tech-spec index refresh (XBOS P0)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-TECHSPEC-INDEX-REFRESH-01` |
| **lane** | governance · U71 |
| **date** | 2026-07-27 |
| **change_mode** | ADD/UPGRADE index + pointers only |
| **forbidden** | Wipe of design content / `apps/**` (honored) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Spec read ack

| Layer | Path |
|-------|------|
| Index (before) | `docs/tech-spec/README.md` — §2 = 4 HRM COMPLETE; §3 backlog included XBOS org/SHR P0 |
| Org legal evidence | `docs/qa/evidence/sa-u71-xbos-org-legal-design-01-20260727.md` · WI `SA-U71-XBOS-ORG-LEGAL-DESIGN-01` |
| Shareholders evidence | `docs/qa/evidence/sa-u71-xbos-shareholder-design-01-20260727.md` · WI `SA-U71-XBOS-SHAREHOLDER-DESIGN-01` |
| Canonical DB/API | `docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md` · `API_DESIGN_XBOS_ORG_LEGAL.md` · `DB_DESIGN_XBOS_SHAREHOLDERS.md` · `API_DESIGN_XBOS_SHAREHOLDERS.md` |
| Gate | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `13` §3.4.11.F/F.1 |

---

## 2. Deliverables

| Artifact | Action | Notes |
|----------|--------|-------|
| `docs/tech-spec/README.md` | **UPGRADE** | XBOS org-legal + shareholders → §2 **COMPLETE** F.1; counts **6** pairs / **12** pointers; §3 P0 rows removed; P1 backlog kept; G-RULE-11 note |
| `docs/tech-spec/DB_DESIGN_XBOS_ORG_LEGAL.md` | **ADD** pointer | → `docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md` |
| `docs/tech-spec/API_DESIGN_XBOS_ORG_LEGAL.md` | **ADD** pointer | → `docs/xbos/API_DESIGN_XBOS_ORG_LEGAL.md` |
| `docs/tech-spec/DB_DESIGN_XBOS_SHAREHOLDERS.md` | **ADD** pointer | → `docs/xbos/DB_DESIGN_XBOS_SHAREHOLDERS.md` |
| `docs/tech-spec/API_DESIGN_XBOS_SHAREHOLDERS.md` | **ADD** pointer | → `docs/xbos/API_DESIGN_XBOS_SHAREHOLDERS.md` |
| Gap register G-RULE-11 / K / G-SPEC-OS-02 | **UPGRADE** wording | Reflect 6 pairs + P0 spine COMPLETE; still PARTIAL for P1 |

**Not touched:** canonical design bodies under `docs/xbos/` · `docs/hrm/` (no wipe).

---

## 3. Exit criteria check

| Criterion | Result |
|-----------|--------|
| §2 lists **6** COMPLETE pairs | ✅ |
| Thin pointers for XBOS org-legal + SHR exist under `docs/tech-spec/` | ✅ (4 files) |
| §3 backlog no longer lists those two P0 rows | ✅ |
| Counts updated (6 pairs · 12 pointers) | ✅ |
| G-RULE-11 coverage note (path + XBOS P0 spine) | ✅ README §2 + gap register |

---

## 4. Residual

| Item | Owner | Priority |
|------|-------|----------|
| HRM attendance / employees / contracts-ins physical pairs | SA (when PM opens P1) | P1 |
| XBOS catalog gov / WF / RACI physical pairs | SA | P1 |
| G-RULE-11 full CLOSE | SA after P1 coverage target | P1 — keep PARTIAL |

---

## 5. Handoff

### completion_report

**Closed:** Index refresh after XBOS P0 designs — §2 now **6 COMPLETE** F.1 pairs (HRM×4 + XBOS org-legal + shareholders); 4 thin pointers ADD under `docs/tech-spec/`; §3 P0 rows removed; G-RULE-11 note improved (path CLOSED · P0 spine COMPLETE · P1 residual); gap register K/G-RULE-11/G-SPEC-OS-02 wording synced. No design content wiped.

**Residual:** P1 backlog rows in README §3; G-RULE-11 remains PARTIAL until P1.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-U71-P0-SPINE-CLOSE-CHECK-01
lane: governance
from: sa
ack_prior: SA-U71-TECHSPEC-INDEX-REFRESH-01 PASS_TO_PM
read_first:
  - docs/tech-spec/README.md §2 (6 COMPLETE)
  - docs/qa/evidence/sa-u71-techspec-index-refresh-01-20260727.md
Task: Confirm U71 P0 physical DB/API spine closed for HRM+XBOS listed pairs; either (a) dispatch next P1 SA design WI from README §3 top row, or (b) open execution Dev only where product change needed (UF-XBOS-04/05 already 🟢 — no Dev for SHR unless change wave). Update TEAM_WORKING_NOW / bus. Do not re-open org-legal/SHR design.
exit_criteria: bus DISPATCHED next WI or idle reason recorded; no re-index churn
```

### ack_status

**PASS_TO_PM**
