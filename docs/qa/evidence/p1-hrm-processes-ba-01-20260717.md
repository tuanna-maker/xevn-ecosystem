# P1-HRM-PROCESSES-BA-01 — BA-Process scope lock (2026-07-17)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-PROCESSES-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **lane** | governance · `estimated_effort` 0.5d |
| **ack_status** | **PASS_TO_PM** |
| **entry** | PM: F-02 `spec_gap` on menu `processes` (QA GWC expected `p1-hrm-menu-processes-20260717.md` — **file not in repo** at BA start; prior GWC cited below) |
| **executed_at** | 2026-07-17 |

## Verdict (F-02 closed)

**HRM menu `processes` = read-only XBOS workflow/policy reference.**

| Question | Answer | Evidence |
|----------|--------|----------|
| Read-only XBOS workflow/policy ref? | **YES** — SoT | Matrix §2.1 (pre-existing) · `DANH_MUC_XBOS_CHO_HRM.md` §9 STT 55–58 «HRM chỉ tham chiếu» · **XBOS-DM-HRM-14** · BRD §5.3 `workflow_code` → XBOS |
| HRM own CRUD processes/policies? | **NO** | No HRM `/processes` REST in `apps/api`; no UC CRUD in SRS embed table; UC catalog owns assignment on **XBOS** |

**Dev-FE action locked:** **REMOVE** fake Add/Edit/Delete (`Processes.tsx` + `useProcesses` empty `mutationFn` + success toast) — **do not** wire a new HRM CRUD API for this menu.

## Spec says / code does

| Layer | Spec says | Code does (as-of BA) | Gap class |
|-------|-----------|----------------------|-----------|
| Matrix §2.1 | Workflow ref only · UI read-only OK | Same intent (strengthened AC-PROC-*) | F-02 was UI chrome vs AC ambiguity |
| BRD / DM | Định nghĩa quy trình trên XBOS | — | — |
| FE `useProcesses` | (implied RO) | `queryFn` returns `[]`; add/update/delete **no-op** + toast success | Fake mutate — anti-mock / honesty FAIL |
| FE `Processes.tsx` | — | Thêm / Sửa / Xóa / Upload stub | Implies HRM ownership |

## Delta applied (minimal)

| Artifact | Change |
|----------|--------|
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | §2.1/`processes` + §2.2/`/processes` AC wording; **AC-PROC-01..04**; **BR-PROC-01..03**; residual **R-FID-PROC-01**; coverage note |
| `docs/hrm/SRS.md` | §13 table note + **§13.1** processes read-only lock (no full rewrite; no new UC number) |

## Prior QA GWC (entry substitute)

- `docs/qa/evidence/p1-hrm-web-audit-20260606.md` — `processes` **GWC** (Workflow ref read-only)
- `docs/qa/evidence/p1-hrm-h12-journey-qa-20260606.md` — spot processes empty «Chưa có quy trình nào» **PASS GWC**
- `docs/qa/evidence/p1-hrm-web-retest-20260606.md` — processes **PASS GWC**

## Out of scope this delta

- Implementing FE remove (owned by `P1-HRM-PROCESSES-FE-01`)
- Opening CR for HRM document-vault / internal policy store under this menu (would need sponsor + BA new UC)
- XBOS workflow-engine admin UX
- TECHSPEC §11.2 backlog line for `processes` (optional SA tidy)

## Acceptance for Dev-FE / QA

| AC | Pass | Fail |
|----|------|------|
| AC-PROC-01 | Load không ERROR; no HRM mutate | Banner / fake rows |
| AC-PROC-02 | No Add/Edit/Delete (or disabled + XBOS copy) | Stub toast success |
| AC-PROC-03 | Empty honest | Mock fill |
| AC-PROC-04 | Ownership XBOS; no HRM CRUD wire | New HRM `company_processes` API «cho đủ nút» |

## Handoff packet

- **completion_report:** Closed F-02: processes = **XBOS read-only ref** (not HRM CRUD). Matrix AC-PROC/BR-PROC + SRS §13.1 locked so Dev-FE can remove fake mutate. Residual: FE execution `P1-HRM-PROCESSES-FE-01` + QA retest AC-PROC-*.
- **next_owner:** `pm` (route to `dev-fe` if FE-01 not already in flight; then `qa`)
- **evidence_path:** `docs/qa/evidence/p1-hrm-processes-ba-01-20260717.md`
- **ack_status:** `PASS_TO_PM`
- **next_dispatch_prompt:** see below

```text
work_item_id: P1-HRM-PROCESSES-BA-01-INTAKE
from_role: ba-process | to_role: pm
Intake PASS_TO_PM evidence docs/qa/evidence/p1-hrm-processes-ba-01-20260717.md.
Verdict: processes = XBOS read-only (XBOS-DM-HRM-14 / DM §55–58). HRM does NOT own CRUD.
1) Confirm / continue Task dev-fe P1-HRM-PROCESSES-FE-01: REMOVE fake Add/Edit/Delete in apps/web/hrm Processes.tsx + useProcesses.ts; optional View-only + copy «Quản trị trên XBOS»; wire list from catalog-sync/settings-catalogs if available else honest empty. CẤM new HRM CRUD API. AC-PROC-01..04. U65 zero-seed. evidence_path docs/qa/evidence/p1-hrm-processes-fe-01-20260717.md. READY_FOR_QA.
2) After READY_FOR_QA: Task qa retest AC-PROC-01..04 browser :8088 /command-center/hrm/processes — no Thêm/Sửa/Xóa success toast; empty OK; no ERROR banner.
```
