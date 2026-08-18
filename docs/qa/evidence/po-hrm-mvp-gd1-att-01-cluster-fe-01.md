# Evidence — PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-30 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-01` · `FR-UC-BP-ATT-01` · `J-HRM-ATT-01-01..06` |
| **depends_on** | API-01 CONFIRMED RETAIN · DATA-01 HOLD · BA O1–O12 · must_keep ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · catalog alone ≠ ATT-01 DONE · R-ATT-01-ASSIGN **open** · Lịch GĐ2-HOLD · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · CFG≠ATT-02 · printable false · PAY OUT · Nest `/core` DENY · C-SLICE · U65 |
| **U65** | zero-seed — browser FE only · empty CTA · no bootstrap seed |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-01 Diễn biến #1–#2 · BR-BP-SHF-01 · BR-PLT-02/04/05/06
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md
  F-ATT-CAT-SHIFT-01/02/EFF RETAIN · F-ATT-SHIFT-CNS-01 RETAIN · F-ATT-SHIFT-02 ASSIGN HOLD
- data: docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01.md HOLD RETAIN work_shifts + shift_change_requests
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md J-HRM-ATT-01-01..06 DRAFT
- must_keep: ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C ·
  ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
  CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · DENY att_leave_hold · R-ATT-01-ASSIGN open
- sponsor_confirm: API-01 CONFIRMED RETAIN · prefer FE+QA CAT/CNS · Dev-BE HOLD invent ASSIGN
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind Danh sách ca → GET/POST/PATCH/DELETE `/api/hrm/attendance/work-shifts*` + EFF invalidate | **PASS** |
| `statusLabelVi` FE-derive on list (wire wins) | **PASS** |
| Bind Đổi ca CNS → `shift-change-requests*` · submit Nest `code` · **HRM-ATT-SHIFT-KEY** toast | **PASS** |
| Empty EFF → CTA admin (no bootstrap seed) | **PASS** |
| Nest `/core` = 0 (source lock) | **PASS** |
| Lịch phân ca GĐ2-HOLD RETAIN · DENY invent shift-assignments DONE | **PASS** |
| Honesty ≠ ATT-01 DONE · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · CFG≠ATT-02 · PAY OUT | **PASS** |
| CODE-MEMORY APPEND · no `*/` inside block comments | **PASS** |
| vitest | **3 files · 15 PASS** |

### Files touched

- `apps/web/hrm/src/lib/attShift01Ring.ts` (+ test) — path · statusLabelVi · empty CTA · invent-ban · honesty
- `apps/web/hrm/src/lib/poHrmMvpGd1Att01ClusterFe01.source.test.ts` — Nest `/core` 0 · CAT/CNS stamps
- `apps/web/hrm/src/hooks/useWorkShifts.ts` — map statusLabelVi · invalidate EFF after CRUD
- `apps/web/hrm/src/hooks/useWorkShiftsEffective.ts` · `useShiftChangeRequests.ts` — empty CTA doc · KEY toast
- `apps/web/hrm/src/lib/workShiftCatalog.ts` — deprecate bootstrap as CNS SoT
- `apps/web/hrm/src/components/attendance/ShiftChangeRequestTab.tsx` — empty CTA · honesty · no bootstrap
- `apps/web/hrm/src/pages/Attendance.tsx` — statusLabelVi · honesty footer · GĐ2-HOLD RETAIN
- `apps/web/hrm/src/lib/apiError.ts` — `HRM-ATT-SHIFT-KEY` · `HRM-WS-VAL/404/409`

### Network assert path (QA)

```text
1) Chấm công → Ca làm việc → Danh sách ca
   → GET /api/hrm/attendance/work-shifts  (contains /attendance/ · Nest /core = 0)
   → statusLabelVi · CRUD POST/PATCH/DELETE …/work-shifts* · F5 còn
   → Footer att-01-honesty: catalog≠ATT-01 DONE · ASSIGN open · GĐ2-HOLD · seals RETAIN
2) Soft-retire inactive → GET …/work-shifts/effective ẩn ca · CNS picker không còn mã đó
3) Đơn từ → Đổi ca
   → GET …/shift-change-requests · GET …/work-shifts/effective
   → active>0: picker Nest code · invent → HRM-ATT-SHIFT-KEY · F5 không giữ mã lạ
   → active=0: att-01-cns-empty-cta · không bootstrap · no seed
4) Lịch phân ca submenu = GĐ2-HOLD (không invent roster / shift-assignments)
5) Network: 0 Nest /core/* as shift SoT
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attShift01Ring.test.ts \
  src/lib/poHrmMvpGd1Att01ClusterFe01.source.test.ts \
  src/hooks/useShiftChangeRequests.test.ts
# → exit 0 · 3 files · 15 tests PASS
```

---

## 4. U65 browser plan (QA-01)

**Priority first:** J-HRM-ATT-01-01 / 04 / 05 / 06  
**Residual (ASSIGN/RESOLVE):** J-HRM-ATT-01-02 / 03 — expect HOLD / BLOCKED until Nest `shift-assignments*` closable (Dev-BE HOLD)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-01-01** | Login → Ca làm việc → Danh sách ca → CRUD Nest ca → Lưu → F5 · Nest `/core` **0** · no seed · ≠ CAT=DONE | AC-ATT-01-CAT/EFF/F5/PATH/≠-CAT-DONE |
| **J-HRM-ATT-01-04** | Đổi ca: active>0 invent mã → **HRM-ATT-SHIFT-KEY** · F5 không giữ · Nest `/core` **0** · no seed | AC-ATT-01-CNS/INVENT-BAN |
| **J-HRM-ATT-01-05** | Soft-retire ca · empty EFF → CTA · Nest `/core` **0** · no seed | AC-ATT-01-SOFT/EMPTY |
| **J-HRM-ATT-01-06** | F5 · Nest `/core` **0** · ≠ ATT-01 DONE · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · seals RETAIN · DENY att_leave_hold | AC-ATT-01-F5/≠-*/H/MK-* |
| **J-HRM-ATT-01-02** | Gán ca dept/group | **RESIDUAL** R-ATT-01-ASSIGN — Nest ABSENT · expect HOLD/BLOCKED |
| **J-HRM-ATT-01-03** | Resolve ca đang gán | **RESIDUAL** R-ATT-01-RESOLVE — after ASSIGN |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công  
**Cấm:** `pnpm seed:*` · Nest `/core` shift SoT · claim catalog = ATT-01 DONE · invent ASSIGN/roster DONE · claim LIVE=ATT-11 · AGG=ATT-10 · soft/ATT-08=ATT-09 · ATT UAT · CFG=ATT-02 · invent PAY/printable · honesty flip · reopen sealed J-*

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-ATT-01-ASSIGN** | Nest `shift-assignments*` ABSENT · Dev-BE HOLD invent · J-02 residual | Dev-BE / PM |
| **R-ATT-01-SCHED** | Full grid OUT GĐ2 · FE Lịch GĐ2-HOLD RETAIN | PM / BA |
| **R-ATT-01-RESOLVE** | After ASSIGN wire | Dev-BE |
| **R-ATT-01-CNS-FE** | Narrowed this seat (empty CTA + KEY) · QA verify invent-ban live | QA |
| Honesty | printable=false · C-SLICE · ≠ ATT UAT · seals RETAIN | QC |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-01-CLUSTER-QA-01
role: qa
entry_criteria: FE-01 READY_FOR_QA · L0 stack up · browser-only U65 zero-seed · API-01 RETAIN
exit_criteria: Evidence docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-qa-01.md
  — J-HRM-ATT-01-01/04/05/06 first (PASS/FAIL with Network paths)
  — J-HRM-ATT-01-02/03 residual HOLD/BLOCKED (ASSIGN ABSENT) documented
  — Nest /core shift SoT = 0 · no seed · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10
  — seals ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 RETAIN
  — ack_status PASS_TO_PM or FAIL_TO_PM
persona: ceo@xe.vn / Xevn@2026
click_path: Chấm công → Ca làm việc → Danh sách ca; Đơn từ → Đổi ca
cấm: pnpm seed:* · Nest /core SoT · claim ATT module UAT · invent ASSIGN DONE · reopen sealed peers
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md (J-HRM-ATT-01-*)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md
```

---

## completion_report

**Closed:** FE bind LIVE Nest `work-shifts*` (CRUD + EFF invalidate) + `statusLabelVi` FE-derive; CNS Đổi ca on `shift-change-requests*` with invent-ban **HRM-ATT-SHIFT-KEY** toast + empty EFF CTA (no bootstrap seed); Nest `/core` 0 source lock; Lịch phân ca GĐ2-HOLD RETAIN; honesty footers ≠ ATT-01 DONE / ≠ LIVE=ATT-11 / ≠ AGG=ATT-10 / CFG≠ATT-02 / PAY OUT / seals RETAIN; vitest 15 PASS.

**Open residual:** R-ATT-01-ASSIGN/SCHED/RESOLVE (J-02/03) — Dev-BE HOLD invent ASSIGN; FE does not invent roster.

**ack_status:** READY_FOR_QA  
**next_owner:** qa
