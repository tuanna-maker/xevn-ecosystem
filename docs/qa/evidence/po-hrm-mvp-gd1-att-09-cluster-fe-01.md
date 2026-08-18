# Evidence — PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-27 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-09` · `FR-UC-BP-ATT-09` · `J-HRM-ATT-09-01..06` |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA O1–O12 · `ATT08QC1-MSLSL36C` preview RETAIN · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 · Dev-BE HOLD invent |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · soft≠ATT-09 DONE · ≠ ATT-08=ATT-09 DONE · client-days≠ATT-08 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false RETAIN · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY · C-SLICE · U65 |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-09 Diễn biến #0a–#6 + Thành công · BR-BP-LV-06
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md
  F-ATT-LEAVE-02 POST /attendance/leave-requests → lockPending
  F-ATT-LEAVE-03 POST …/approve|reject|cancel → settle / release 100%
  GET leave-balance · leave-balance/panel · display-ready pending·available·used·held·statusLabelVi
  peer F-ATT-LEAVE-01 preview must_keep ATT08QC1-MSLSL36C
- data: docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md HOLD · pending_days=held · DENY att_leave_hold
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md O1–O12 · J-HRM-ATT-09-01..06
- must_keep: ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06
- sponsor_confirm: API-01 CONFIRMED RETAIN · unlock FE+QA · Dev-BE HOLD
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind submit → `POST /api/hrm/attendance/leave-requests` 2xx · invalidate balance panel · pending↑ available↓ | **PASS** |
| Approve settle used XOR reject/cancel release 100% · invalidate panel | **PASS** |
| Display-ready pending·available·used·held(=pending)·statusLabelVi | **PASS** |
| TYPE-BLOCK when pending (FE guard prefer) | **PASS** |
| Nest `/core` leave-hold SoT = 0 | **PASS** (source lock) |
| must_keep ATT-08 preview path intact (`AttLeavePreviewDeductionPanel` · FE-02 stamps) | **PASS** |
| Honesty ≠ soft/ATT-08=ATT-09 DONE · client-days≠ATT-08 DONE · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY `att_leave_hold` | **PASS** |
| No seed · no invent PAY/printable · Dev-BE HOLD | **PASS** |
| CODE-MEMORY APPEND | **PASS** |
| vitest | **6 files · 45 PASS** (ATT-09 + peer ATT-08 retain) |

### Files touched

- `apps/web/hrm/src/lib/attLeave09Ring.ts` (+ test) — path · held alias · statusLabelVi · TYPE-BLOCK · honesty
- `apps/web/hrm/src/lib/poHrmMvpGd1Att09ClusterFe01.source.test.ts` — Nest `/core` 0 · DENY att_leave_hold · ATT-08 RETAIN
- `apps/web/hrm/src/lib/leaveBalance.ts` (+ test) — `resolveLeaveBalanceHeldDays`
- `apps/web/hrm/src/hooks/useLeaveRequests.ts` (+ test) — statusLabelVi · invalidate balance create/approve/reject · type-block
- `apps/web/hrm/src/integrations/hrmApi.ts` — HrmLeaveRequest status_label* · CODE-MEMORY APPEND
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx` — panel used/held · honesty · type-block · statusLabelVi · refetch after settle/release

### Network assert path (QA)

```text
1) Chấm công → Nghỉ phép → Tạo yêu cầu (tracked balance)
   → (peer) POST …/preview-deduction (ATT-08 must_keep · ≠ ATT-09 DONE)
   → POST /api/hrm/attendance/leave-requests 2xx
   → GET …/leave-balance/panel · pending↑ · available↓ · held=pending_days · Nest /core = 0
2) QL Duyệt → POST …/approve · pending→used · Nest /core = 0
   XOR Từ chối → POST …/reject · release 100% · available hoàn
3) Detail pending → leave type readonly · att-09-type-block banner · no type change
4) F5 · statusLabelVi · honesty att-09-honesty · seals RETAIN · DENY att_leave_hold
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attLeave09Ring.test.ts \
  src/lib/poHrmMvpGd1Att09ClusterFe01.source.test.ts \
  src/lib/leaveBalance.test.ts \
  src/hooks/useLeaveRequests.test.ts \
  src/lib/attLeaveRing.test.ts \
  src/lib/poHrmMvpGd1Att08ClusterFe02.source.test.ts
# → exit 0 · 6 files · 45 tests PASS
```

Nest `/core` leave-hold = **0** (source lock). `att_leave_hold` only as DENY stamp in ring honesty (no dual SoT path).

---

## 4. U65 browser plan (QA-01 — J-HRM-ATT-09-01..06)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-09-01** | Login → Nghỉ phép → Gửi (tracked) · pending↑ available↓ · held=`pending_days` · Nest `/core` **0** · no seed | AC-ATT-09-LOAD/HOLD/HOLD-SOT/PANEL/PATH |
| **J-HRM-ATT-09-02** | After hold → QL Duyệt → pending→used · one QL · Nest `/core` **0** · ≠ multi-level | AC-ATT-09-SETTLE/GĐ1 |
| **J-HRM-ATT-09-03** | After hold → QL Từ chối (+ lý do) → hoàn 100% · Nest `/core` **0** | AC-ATT-09-RELEASE |
| **J-HRM-ATT-09-04** | Soft no-row create OK · footer ≠ soft=ATT-09 DONE · Nest `/core` **0** | AC-ATT-09-SOFT/≠-SOFT-DONE |
| **J-HRM-ATT-09-05** | Overlap chặn · TYPE-BLOCK pending · Nest `/core` **0** | AC-ATT-09-OVERLAP/TYPE-BLOCK |
| **J-HRM-ATT-09-06** | F5 + honesty · ≠DONE · printable false · PAY OUT · ATT-08/02/PLT/CORE RETAIN · DENY att_leave_hold | AC-ATT-09-F5/≠-*/H/MK-* |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công → Nghỉ phép  
**Cấm:** `pnpm seed:*` · Nest `/core` leave SoT · invent `att_leave_hold` · claim soft/ATT-08=ATT-09 DONE · claim client-days=ATT-08 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · invent PAY/printable/Word DONE · wipe ATT-08 preview · honesty flip · reopen sealed J-ATT-08/02/PLT/CORE-*

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| Browser U65 J-HRM-ATT-09-01..06 | **QA next** | qa |
| Soft/type schema | DATA HOLD · FE type-block prefer · no BE invent | qc |
| Honesty | printable=false · C-SLICE · ≠ ATT UAT · ≠ PLT/CORE DONE · PAY OUT · CFG≠ATT-02 · DENY att_leave_hold | qc |
| Peers | ATT-08/02/PLT/CORE seals must_keep · ≠ claim DONE from this seat | qc |
| Dev-BE | **HOLD** invent unless FE proves envelope/type-block gap | — |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-fe-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-01
role: qa
entry_criteria: FE-01 READY_FOR_QA · L0 stack · browser-only U65 zero-seed
exit_criteria: J-HRM-ATT-09-01..06 evidence · Nest /core 0 · held=pending_days · approve XOR reject · TYPE-BLOCK · honesty seals · PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qa-01.md
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md (J-01..06 · AC-ATT-09-*)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md
persona: ceo@xe.vn / Xevn@2026 · HRM embed → Chấm công → Nghỉ phép
cấm: pnpm seed:* · Nest /core leave SoT · invent att_leave_hold · claim soft/ATT-08=ATT-09 DONE · claim client-days=ATT-08 DONE · claim ATT UAT · claim CFG=ATT-02 DONE · invent PAY/printable · wipe ATT-08 preview · honesty flip
must_keep: ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06
```

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **≠ ATT-09 DONE** (slice FE bind only) · soft≠DONE · ≠ ATT-08 preview = ATT-09 DONE · client-days≠ATT-08 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false RETAIN · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY · must_keep ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06 · U65 no seed
