# Evidence — W1-B-01-TM-LEAVE

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-TM-LEAVE` |
| **from_role** | technical-manager |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **reviewed** | `docs/qa/evidence/team-claude-w1b-01-leave.md` |
| **slice** | `docs/program/slices/DOC-ENT-P0-HRM-LEAVE.md` |
| **verdict** | **REVIEW_ACCEPT** |
| **ack_status** | `PASS_TO_PM` |

---

## Executive technical assessment

Leave BE wave **ACCEPT** for OS **28** display-ready + SOLID **25** (BE boundary). Contract §4 gaps cited in Dev evidence (pending lock / settle / release / sick≥3 attach / display labels) are closed in code + jest **33/33**. Residual **R-MASTER-KEYS** is **elevated P0** (workspace Nest graph) — separate WI; does **not** force leave REWORK.

---

## OS 28 checklist (TM)

| § | Check | Result |
|---|--------|--------|
| 3.1 Display-ready | FE can bind list/create/approve/reject without catalog join for labels | **PASS** — `status_label`, `leave_type_label`, `employee_display_name`, `total_days_number` + existing `employee_name`/`department`/`position` |
| 2.2 BE owns transform | Status/type labels + balance lock/settle/release in service | **PASS** — `toLeaveDisplayRow` / `lockPendingLeaveBalance` / `settleApprovedLeaveBalance` / `releasePendingLeaveBalance` |
| AP-05 entity dump | Raw-only responses | **PASS** (mitigated) — mapper wraps all mutate/list paths cited |
| AP-06 double BR | FE not in wave | **N/A** (BE-only) |
| 6.2 Jest UC/BR | Display-ready + settle + sick attach | **PASS** — evidence jest 2 suites / 33 tests |
| 6.2 Error codes | Stable `HRM-LEAVE-*` | **PASS** — must_keep verified |
| 8.1 CODE-MEMORY | APPEND CHANGE W1-B-01 + new blocks | **PASS** — leave-requests / leave-balance / leave-workflow.bridge |
| Grey | Hardcoded `LEAVE_TYPE_LABELS_VI` vs catalog `name` | **P2 polish** — acceptable baseline; prefer catalog label when Settings healthy (not REWORK) |

**Not blocking ACCEPT:** soft WF bridge (`R-LEAVE-WF-FULL` P2); browser U65 (`R-QA-BROWSER` — QA lane already dispatched).

---

## SOLID 25 checklist (TM)

| Item | Result |
|------|--------|
| S — Leave vs Attendance records; bridge separated | **PASS** |
| O — Display mapper additive; balance ops ADD | **PASS** |
| I — Narrow `LeaveSettingsCatalogPort` / `LeaveCatalogSyncPort` | **PASS** |
| D — ModuleRef + lazy `require` for settings/catalog-sync | **CONDITIONAL** — intentional DIP smell until R-MASTER-KEYS restored; then restore constructor DI |
| CODE-MEMORY + SOLID field VI | **PASS** |
| `solid_convention_ack` in Dev evidence | **FAIL process P1** — block absent in `team-claude-w1b-01-leave.md` (OS 25 §4) |

### solid_convention_ack (TM fill — verified on code)

```markdown
## solid_convention_ack
- [x] Đã đọc `_vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md`
- [x] Logic BR nằm ở service (leave-requests / leave-balance) — không page
- [x] File sửa có @CODE-MEMORY + field SOLID (tiếng Việt)
- [x] leave-requests.service.ts lớn (pre-existing) — W1-B ADD mapper/balance helpers; không god-new-file
- [x] Port seam: LeaveSettingsCatalogPort / LeaveCatalogSyncPort (+ ModuleRef interim)
- [x] Test map FR-UC-H03 / API_CONTRACT §4 (display-ready, settle, sick≥3)
- [x] Không duplicate công thức payroll/insurance
- [x] convention: no new `any`; stable error codes
### FE–BE boundary
- [x] fe_boundary: wave BE-only — không FE join
- [x] be_boundary: BR + balance + scope list; response display-ready
- [x] display_ready_ack: status_label · leave_type_label · employee_display_name · total_days_number ← toLeaveDisplayRow / balance leave_type_label
- [x] soc_ref: `_vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md`
```

**Process residual:** Dev handoff thiếu ack → P1 process (`R-SOLID-ACK`). TM verified above — **không** INVALID product lane; next leave-adjacent Dev handoff must include ack in evidence.

---

## Slice / path hygiene

| Check | Result |
|-------|--------|
| Diff ⊆ leave + leave-* | **PASS** core attendance leave files |
| Extra `app.module.ts` | **OK** — register `LeaveWorkflowBridge` (slice allows ≤2 extras); documented |
| U65 no seed | **PASS** |
| must_keep scope / soft balance / error codes | **PASS** (spot-check code + evidence) |

---

## Triage — R-MASTER-KEYS

| Field | Value |
|-------|--------|
| **ID** | `R-MASTER-KEYS` |
| **Severity (TM)** | **P0** (elevate from Dev P1) |
| **Problem** | `apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts` **ABSENT** (not in tree, not in `HEAD`). `dist/.../hrm-settings-master-keys.js` **EXISTS** with full family map + exports. |
| **Blast** | `AppModule` hard-provides `SettingsCatalogsService`, `CatalogSyncService`, `DecisionsService` — all **static-import** master-keys → Nest/TS load of those modules **blocked** on clean rebuild; leave ModuleRef workaround only keeps leave service unit-testable, **does not** heal AppModule graph. |
| **Risk** | Settings / CatalogSync / Decisions / catalog-pull leave-types path unavailable; local `start:dev` fragile; leave catalog assert may soft-skip when ports unresolved. |
| **Owner** | `dev-be` |
| **must_keep** | Export surface parity with dist: `HRM_SC_POS_KEYS`, `HRM_SC_LEAVE_KEY`, `HRM_SC_DEC_*`, `HRM_SC_PAY_KEYS`, `HRM_E1B_MASTER_SURFACE_KEYS`, `normalizeMasterCatalogKey`, `resolveCatalogFamily`, `catalogAliasTryList`, `isE1bMasterCatalogKey`, `isPosCatalogKey`, `isDecCatalogKey` + `CATALOG_FAMILIES` aliases/storageKey; leave `HRM_SC_LEAVE_KEY = 'leave_types'`; no seed; no rewrite Settings BR. |
| **After restore** | Revert leave ModuleRef lazy-require → constructor inject Settings/CatalogSync (remove DIP smell). |

### next_dispatch_prompt (R-MASTER-KEYS — P0)

```text
work_item_id: W1-B-01-BE-MASTER-KEYS
to_role: dev-be
priority: P0
entry_criteria:
  - Confirm ABSENT: apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts
  - Reconstruct ONLY from apps/api/hrm-api/dist/settings-catalogs/hrm-settings-master-keys.js (+ .d.ts)
  - Read importers: settings-catalogs.service.ts · catalog-sync.service.ts · decisions.service.ts
exit_criteria:
  - Source file restored; export names/types match dist/.d.ts
  - pnpm --filter hrm-api exec tsc --noEmit (or package build) PASS for settings-catalogs import graph
  - Spot jest: settings-catalogs.service.spec and/or catalog-sync related suite green (no seed)
  - Evidence: docs/qa/evidence/w1b-01-be-master-keys.md with solid_convention_ack + CODE-MEMORY on restored file
  - Optional follow: leave-requests.service restore constructor DI (drop ModuleRef lazy require) — same WI if ≤2 files else separate FIX
must_keep:
  - CATALOG_FAMILIES alias/storageKey map (leave_types, job_titles, hr_decision_types, pay_*, insurers, …)
  - HRM_SC_LEAVE_KEY / DEC / POS / PAY constants
  - normalizeMasterCatalogKey · resolveCatalogFamily · catalogAliasTryList · isE1bMasterCatalogKey · isPosCatalogKey · isDecCatalogKey
  - U65 no seed; no Settings BR rewrite; leave must_keep G-AT10-* untouched
forbidden_paths:
  - apps/web/** · apps/mobile/** · seed scripts
  - docs/brand-new-documents-20270801/** (write)
ack_status target: READY_FOR_QA
evidence_path: docs/qa/evidence/w1b-01-be-master-keys.md
```

---

## Residual register (post-TM)

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| R-MASTER-KEYS | **P0** | dev-be `W1-B-01-BE-MASTER-KEYS` | Restore src from dist; unblock Settings/CatalogSync/Decisions |
| R-SOLID-ACK | P1 process | closed by TM ack above / Dev include on next handoff | Dev evidence thiếu solid_convention_ack |
| R-LEAVE-WF-FULL | P2 | dev-be follow-up | Soft bridge only |
| R-LEAVE-TYPE-CATALOG-LABEL | P2 | dev-be | Prefer catalog item name for `leave_type_label` when Settings up |
| R-QA-BROWSER | P0 gate UAT | qa (already DISPATCHED) | Browser U65 leave UF |

---

## completion_report

**Closed:** TM review W1-B-01 leave — **REVIEW_ACCEPT** vs OS 28 + SOLID 25; display-ready + balance settle/release + CODE-MEMORY + jest evidence verified; solid_convention_ack filled by TM; R-MASTER-KEYS triaged **P0** with copy-ready Task.

**Open / residual:** P0 master-keys restore; P2 soft WF + catalog label polish; QA browser gate (parallel).

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: W1-B-01-BE-MASTER-KEYS
to_role: dev-be
mission: Restore apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts from dist JS/DTS; keep export parity; green settings/catalog import graph; evidence docs/qa/evidence/w1b-01-be-master-keys.md
entry: W1-B-01-TM-LEAVE REVIEW_ACCEPT · R-MASTER-KEYS P0
exit: READY_FOR_QA · no seed · NFD path only · must_keep family map + HRM_SC_* constants
parallel_ok: W1-B-01-QA-LEAVE browser; W1-B-02 EMP (do not block on master-keys unless Nest boot FAIL on EMP path)
```

`ack_status: PASS_TO_PM`  
`verdict: REVIEW_ACCEPT`  
`evidence_path: docs/qa/evidence/w1b-01-tm-leave.md`
