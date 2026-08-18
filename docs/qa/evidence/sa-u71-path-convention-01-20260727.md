# SA-U71-PATH-CONVENTION-01 — `docs/tech-spec/` path bootstrap

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-PATH-CONVENTION-01` |
| **lane** | governance · U71 process |
| **date** | 2026-07-27 |
| **change_mode** | ADD |
| **gate** | `.cursor/rules/spec-db-api-design-gate.mdc` |
| **read_first** | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` § path convention |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Closed

| Deliverable | Path | Notes |
|-------------|------|-------|
| Directory | `docs/tech-spec/` | Created (was MISSING at scan) |
| Index README | `docs/tech-spec/README.md` | Normative path convention: slices **may** live in `docs/hrm/` + `docs/xbos/`; tech-spec = index + optional pointers |
| Thin pointers (×8) | `docs/tech-spec/DB_DESIGN_*` + `API_DESIGN_*` | Link only — no content wipe / duplication of canonical files |
| Control link | `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` | Header row → tech-spec index + CO-HC / industry pairs |
| Gap register | `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` | **G-RULE-11** / **G-SPEC-OS-02** → **PARTIAL** (path CLOSED); **P6** → DONE |
| SUBAGENT_READ_MAP | — | **Not present** in repo; skipped (no invent). Control doc updated instead. |

### Indexed U71 pairs (canonical under `docs/hrm/`)

| Slice | DB_DESIGN | API_DESIGN | F.1 |
|-------|-----------|------------|-----|
| Company industry | `DB_DESIGN_HRM_COMPANY_DISPLAY.md` | `API_DESIGN_HRM_COMPANY_LIST.md` | ✅ |
| Company headcount (CO-HC) | `DB_DESIGN_HRM_CO_HC.md` | `API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` | ✅ |
| Settings catalog | `DB_DESIGN_HRM_SETTINGS_CATALOG.md` | `API_DESIGN_HRM_SETTINGS_CATALOG.md` | ✅ |
| Leave | `DB_DESIGN_HRM_LEAVE.md` | `API_DESIGN_HRM_LEAVE.md` | ✅ |

---

## 2. Convention (summary)

1. Prefer module-root canonical files (`docs/hrm/`, `docs/xbos/`).
2. `docs/tech-spec/README.md` is the discoverability index for OS §3.4.11 F / G-RULE-11.
3. Pointers under `docs/tech-spec/` are optional thin links; PM `read_first` cites **canonical** paths.
4. TechSpec § matrices alone do **not** satisfy U71.

---

## 3. Residual

| Item | Owner | Note |
|------|-------|------|
| XBOS org legal + shareholders physical pairs | SA | `SA-U71-XBOS-ORG-LEGAL-DESIGN-01` · `SA-U71-XBOS-SHAREHOLDER-DESIGN-01` |
| HRM P1 slices (ATT, employees CRUD, contracts, …) | SA | scan backlog §2.1 |
| G-RULE-11 full CLOSED | SA/PM | Only when spine coverage policy met or waived; path bootstrap alone = PARTIAL |
| Optional `docs/program/SUBAGENT_READ_MAP.md` | PM/SA | Create later if program wants module→spec map; not required this wave |

---

## 4. Verify (facts)

| Check | Result |
|-------|--------|
| `docs/tech-spec/README.md` exists | ✅ |
| Pointer count | 8 |
| Canonical pairs still under `docs/hrm/` | ✅ (no wipe) |
| DATA_LINKAGE links index | ✅ |

---

## 5. Handoff

### completion_report

**Closed:** G-RULE-11 **path bootstrap** — `docs/tech-spec/` + README index of 4 existing U71 pairs + 8 thin pointers; DATA_LINKAGE + gap register updated (P6 DONE, G-RULE-11 PARTIAL).

**Residual:** Module coverage still open for XBOS org/SHR and HRM P1; full G-RULE-11 CLOSED deferred to write waves. No SUBAGENT_READ_MAP in repo.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-XBOS-ORG-LEGAL-DESIGN-01
role: sa (+ ba-data optional)
lane: governance · U71
read_first:
  - docs/tech-spec/README.md §3 backlog
  - docs/xbos/TECHSPEC.md §14.4–14.5 FR-ORG-01/03
  - docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md (Plane A cite — do not wipe)
  - docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md §4
  - _vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md
  - _vibe-team-os/templates/TECHSPEC_API_CONTRACT.md
deliver:
  - docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md
  - docs/xbos/API_DESIGN_XBOS_ORG_LEGAL.md (F.1 each endpoint + bước SRS)
  - ADD rows + optional pointers under docs/tech-spec/README.md
exit: F.1 complete; PASS_TO_PM
evidence_path: docs/qa/evidence/sa-u71-xbos-org-legal-design-01-YYYYMMDD.md
parallel_ok: SA-U71-XBOS-SHAREHOLDER-DESIGN-01
cấm: Dev feature without db_design + api_design in read_first
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-path-convention-01-20260727.md`

### pm_dispatch_hint

`SA-U71-XBOS-ORG-LEGAL-DESIGN-01` (+ `SA-U71-XBOS-SHAREHOLDER-DESIGN-01`) — next U71 physical writes after path convention.
