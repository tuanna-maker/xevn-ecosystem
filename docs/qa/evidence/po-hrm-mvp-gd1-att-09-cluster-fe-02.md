# Evidence — PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-02` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-27 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-09` · `J-HRM-ATT-09-05` (TYPE-BLOCK narrow) |
| **depends_on** | FE-01 · QC **`ATT09QC1-MSLUTL9D`** GWC · QA **`ATT09QA2-MSLUKI9U`** · residual **`R-ATT-09-TYPE-BLOCK-UI`** |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · soft≠ATT-09 DONE · ≠ ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY · C-SLICE · U65 |

---

## Closed scope

| Item | Status |
|------|--------|
| R-ATT-09-TYPE-BLOCK-UI — visible banner `att-09-type-block` on create overlap (proactive + post-409) | **PASS** |
| List pending row hint `att-09-type-block-hint` + detail `leave-detail-type-readonly` RETAIN | **PASS** |
| CTA `att-09-type-block-open-detail` → list→detail TYPE-BLOCK | **PASS** |
| FE-01 hold/settle/release invalidate panel RETAIN | **PASS** |
| `LeaveCreateOutcome` on overlap 409 · parse `conflicting_id` | **PASS** |
| Honesty seals RETAIN · ≠ ATT-09 module UAT | **PASS** |
| vitest | **5 files · 34 PASS** (ATT-09 cluster + useLeaveRequests) |

### Files touched

- `apps/web/hrm/src/lib/attLeave09Ring.ts` (+ test) — overlap detect · 409 parse · banner message
- `apps/web/hrm/src/lib/poHrmMvpGd1Att09ClusterFe02.source.test.ts` — source lock
- `apps/web/hrm/src/hooks/useLeaveRequests.ts` — `LeaveCreateOutcome` on create fail
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx` — create banner · list hint · open detail

---

## Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attLeave09Ring.test.ts \
  src/lib/poHrmMvpGd1Att09ClusterFe02.source.test.ts \
  src/lib/poHrmMvpGd1Att09ClusterFe01.source.test.ts \
  src/hooks/useLeaveRequests.test.ts \
  src/lib/leaveBalance.test.ts
# → exit 0 · 5 files · 34 tests PASS
```

---

## QA narrow plan (J-05 only)

| Step | Pass when |
|------|-----------|
| After overlap **409** or pick overlapping dates | Create dialog shows **`data-testid="att-09-type-block"`** with VI message (≠ toast-only) |
| List row **pending** | **`att-09-type-block-hint`** visible |
| Click **Xem đơn chờ duyệt** or list→detail pending | Detail shows **`att-09-type-block`** + **`leave-detail-type-readonly`** |

**Persona:** `ceo@xe.vn` · Nghỉ phép · U65 zero-seed  
**Cấm:** claim ATT-09 module UAT · flip honesty · seed · invent `att_leave_hold`

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-fe-02.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-03-TYPEBLOCK
role: qa
entry_criteria: FE-02 READY_FOR_QA · L0 stack · browser-only U65 zero-seed
exit_criteria: J-HRM-ATT-09-05 ONLY — att-09-type-block on create overlap + list hint + list→detail TYPE-BLOCK · PASS_TO_PM or FAIL with screenshot
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qa-03-typeblock.md
read_first: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-fe-02.md
persona: ceo@xe.vn / Xevn@2026 · /hr/attendance → Nghỉ phép
must_keep: ATT09QC1-MSLUTL9D GWC · ATT08QC1-MSLSL36C · ATT02/PLT/CORE · honesty false · printable false · PAY OUT · DENY att_leave_hold · ≠ reopen ATT-09 DONE · ≠ ATT UAT
cấm: pnpm seed:* · claim module UAT
```

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · **≠ ATT-09 module UAT** · **≠ FR-09 DONE** · C-SLICE · printable false · PAY OUT · DENY invent `att_leave_hold` · must_keep ATT08/02/PLT/CORE seals
