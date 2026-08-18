# Evidence — PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-FE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **dev-fe** |
| **Date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **parent** | REC-02 QC-01 GWC — remaining open AC rows (non-blocking) |
| **change_mode** | UPGRADE · preserve_default · code_memory APPEND |
| **Honesty** | `recruitment_uat_ready=false` · C-SLICE · U65 zero-seed |
| **depends_on** | QC-01 GWC · FE-01 sealed · API-01 transitions DTO |

---

## spec_read_ack

| Artifact | Path · sections |
|----------|-----------------|
| **qc remain** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qc-01.md` § Remain open — **AC-02d · 02b-05 · ALT-01/02 · CELL-PICKER** |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md` AC-REC-YCTD-02d · 02b-05 · ALT-01/02 · VAL-06/17 |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md` F-REC-YCTD-03 transitions · matrix SHORT/LONG · bod_complete |
| **fe prior** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-fe-01.md` — forks/O4/O5/transitions baseline **RETAIN** |
| **rec-01 SoT** | `listRecruitmentPlans` + `parseMonthsData` / `need_hire_approved` (sealed REC-01) |
| **sponsor_confirm** | QC GWC remain rows · API-01 CONFIRMED · BA O1–O5 |
| **uc_ids** | UC-BP-REC-02 · UC-BP-REC-02b |
| **change_mode** | UPGRADE |

**spec says / code does (delta this seat):**

| Spec | Before (FE-01) | After (this seat) |
|------|----------------|-------------------|
| AC-02d / 02b-05 chain | Transitions CTA shallow; always `bod_complete` on out_of_plan | Detail **chuỗi duyệt** SHORT/LONG · next hint · TP/HR then **BOD** (`bod_complete` only on BOD step) |
| out_of_plan CV block | pipeline blocked hint | Explicit **YCTD_BOD_BLOCKED_CV_VI** until `open_for_hire` |
| ALT-01 reject | reason field + toast | Detail **rejected_reason** panel + F5 via GET detail |
| ALT-02 replace | form picker only | Detail shows **replace_employee_id** label |
| CELL-PICKER | raw `Input` cell_id | **CatalogSearchPicker** from approved Định biên cells + deep-link keep |

---

## What shipped vs deferred

### Shipped

1. **Approval chain UI** (`data-testid=yctd-approval-chain`) — matrix label/key · step badges · next-approver hint · BOD blocked CV copy.
2. **Transitions wire deepen** — SHORT approve → `open_for_hire`; LONG pending → TP/HR (`bod_complete` omit) → `approved`; LONG approved → BOD (`bod_complete=true`) → `open_for_hire`; reject + reason required.
3. **ALT reject/replace visibility** — `yctd-detail-rejected-reason` · `yctd-detail-replace-employee`.
4. **CELL-PICKER (validated selector)** — options from `listRecruitmentPlans` → `need_hire_approved` cells (REC-01 SoT); human-readable label; mono id under picker; deep-link/spawn cell kept via `ensureHeadcountCellOptionPresent`; create + edit.

### Deferred (explicit — not this seat)

| Item | Note |
|------|------|
| **AC-REC-YCTD-02-ALT-03** | CFG BOD on **in_plan** — no tenant CFG signal on FE; in_plan `approved` still has approve CTA |
| **Full XBOS inbox multi-actor persona chain** | U65 no seed — FE transitions secondary path; inbox actors not simulated |
| **AC-02f / 02b-06** list→detail depth | Partial prior; not expanded beyond chain panel |
| **Rich employee name on replace without opening detail load** | Loads employees when replace visible |
| **Campaign / Nest `/rec`** | DENY |

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/jobRequisitionYctdWave2.ts` | ADD approval-chain + cell-option + replace display helpers |
| `apps/web/hrm/src/lib/jobRequisitionYctdWave2.test.ts` | ADD 3 cases (75 total suite cluster) |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Chain panel · transition bod_complete · cell picker · replace/reject detail |

**must_keep RETAIN:** L1 tokens · O4 banner · O5 redirect · UF-HRM-12 · J-HRM-JD-YCTD-01 · REC-01 Định biên SoT · honesty false · C-SLICE

**DENY:** seed · warn-cho-qua without BOD · second headcount SoT · Campaign invent · honesty flip

---

## Vitest evidence

```text
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/jobRequisitionYctdWave2.test.ts \
  src/lib/recruitmentWorkflowUi.test.ts \
  src/lib/jobRequisitionUi.test.ts \
  src/lib/candidateUvYctdUi.test.ts

Test Files  4 passed (4)
Tests:      75 passed (75)
```

(Wave2 file alone: **16** PASS — +3 vs FE-01 baseline 13.)

---

## U65 browser plan (QA — zero-seed)

| AC / J-* | Persona | Click path | FE after 2xx + F5 |
|----------|---------|------------|-------------------|
| **AC-02d** | Approver / CEO | YCTD in_plan → Gửi → Chi tiết → thấy SHORT chain → **Duyệt → mở nhận hồ sơ** | status `open_for_hire`; pipeline flags unlocked; F5 còn |
| **AC-02b-05** | Approver | out_of_plan pending → Chi tiết → LONG steps + BOD block → **Duyệt (TP/HR)** | status `approved`; **vẫn** chặn CV; F5 còn block |
| **AC-02b-05 BOD** | BOD | Chi tiết `approved` out → **BOD duyệt → mở nhận hồ sơ** | `open_for_hire`; F5; flags OK |
| **ALT-01** | Approver | pending → Từ chối + lý do | rejected + lý do panel; F5 còn reason |
| **ALT-02** | HR | create/edit `hire_reason=replace` + NV → Lưu → Chi tiết | `yctd-detail-replace-employee` visible; F5 |
| **CELL-PICKER** | HR | Thêm in_plan → chọn ô từ picker (không gõ UUID) | cell label + id; deep-link spawn vẫn preset |
| must_keep | — | O4/O5/UF-12/JD | no regression |

**cấm:** `pnpm seed:*` · API fake inbox · SQL flip open_for_hire · honesty flip

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-REC-02-BOD-QA | Browser AC-02d / 02b-05 / ALT-01/02 / CELL-PICKER U65 | **qa** |
| R-REC-02-ALT-03 | CFG BOD on in_plan | defer / BA+CFG |
| Honesty | `recruitment_uat_ready` stays **false** | PM/QC |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-fe-01.md` |
| **completion_report** | FE BOD chain LIVE: SHORT/LONG steps + staged TP/HR→BOD transitions; reject reason + replace_employee on detail; cell CatalogSearchPicker from REC-01 approved cells (deep-link keep); vitest 75 PASS; honesty false; no seed; sealed FE-01/O4/O5/L1 retained. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: FE BOD-CHAIN-FE-01 READY_FOR_QA
entry_criteria: L0 stack; browser-only U65 zero-seed; evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-fe-01.md
MISSION — close QC remain rows:
1) AC-02d: in_plan pending → Chi tiết SHORT chain → Duyệt → open_for_hire + F5
2) AC-02b-05: out_of_plan pending → TP/HR Duyệt → approved + CV still blocked + F5; then BOD Duyệt → open_for_hire + F5
3) ALT-01: Từ chối + lý do → detail shows reason + F5
4) ALT-02: hire_reason=replace → detail shows replace_employee + F5
5) CELL-PICKER: in_plan form uses picker label (not raw-only Input); deep-link cell still works
6) must_keep: O4 banner · O5 redirect · UF-HRM-12 · JD soft FK · REC-01 SoT · no Campaign
cấm: seed · API fake inbox · honesty flip · Nest /rec dual
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qa-01.md
```
