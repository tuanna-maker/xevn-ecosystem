# Evidence — PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` · **U89** Wave-33 seat **#36** |
| **date** | 2026-08-10 |
| **uc_ids** | `UC-BP-ATT-04b` · `FR-UC-BP-ATT-04b` · `BR-BP-LV-07` · `J-HRM-ATT-04B-01..06` |
| **depends_on** | API-01 CONFIRMED RETAIN+GAP · BA-01 O1–O12 · must_keep **ATT04QC1-MSM22G4W** · **ATT09QC1-MSLUTL9D** · **ATT03DQC1-MSM1CR19** |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** RETAIN slice + conditional GAP UX · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · **≠ ATT-04b / FR-04b DONE** · **≠ ATT-04 DONE** · **≠ ATT UAT** · C-SLICE · U65 · DENY `att_leave_hold` · PAY OUT · printable false |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md
  FR-UC-BP-ATT-04b Diễn biến #1 · #2 · BR-BP-LV-07
- api: docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md
  F-ATT-CAT-LVT allowsAdvance RETAIN · F-ATT-LEAVE-BAL panel advance/unpaid RETAIN ·
  F-ATT-LEAVE-02 HRM-LEAVE-VAL-BALANCE RETAIN · GAP cap/advanced/branch · HOLD F-ATT-LEAVE-04
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md
  AC-ATT-04B-* · J-HRM-ATT-04B-01..06
- must_keep: ATT04QC1-MSM22G4W · ATT09QC1 pending_days · ATT03DQC1 · Nest /core DENY ·
  physical /api/hrm/attendance/* only · DENY att_leave_hold · ≠ reject-only = FR-04b DONE
- sponsor_confirm: API-01 CONFIRMED 2026-08-10 · FE-01 dispatch
```

---

## 2. Closed scope (RETAIN J-01..03)

| Item | Status |
|------|--------|
| J-01 `allows_advance` on AttLeaveTypeSettingsPanel → `upsertAttLeaveType` | **PASS** (RETAIN + testid `hdsd-att-leave-type-allows-advance`) |
| J-02 Panel bucket labels `advance` / `unpaid` via `deriveAtt04bPanelBucketLabelVi` | **PASS** |
| J-02 Optional column `advanced_days` when BE sends field | **PASS** (parse in `leaveBalance.ts`) |
| J-03 POST over available → parse `HRM-LEAVE-VAL-BALANCE` + banner `att-04b-balance-reject` | **PASS** |
| Physical paths `/api/hrm/attendance/*` · Nest `/core` 0 in LeaveTab | **PASS** |
| CODE-MEMORY APPEND · no `*/` inside block comments | **PASS** |
| vitest + `pnpm run build` (apps/web/hrm) | **PASS** |

### Files touched

- `apps/web/hrm/src/lib/attLeave04bRing.ts` (+ `attLeave04bRing.test.ts`)
- `apps/web/hrm/src/lib/poHrmMvpGd1Att04bClusterFe01.source.test.ts`
- `apps/web/hrm/src/lib/leaveBalance.ts` — `advanced_days` parse
- `apps/web/hrm/src/lib/attLeaveTypeCatalog.ts` — category `unpaid`
- `apps/web/hrm/src/hooks/useLeaveRequests.ts` — balance reject outcome + `balance_resolution` stub
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx` — panel · honesty · gate UX · HOLD J-04
- `apps/web/hrm/src/components/settings/AttLeaveTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/AttLeaveAccrualPolicySettingsPanel.tsx` — cap HOLD/LIVE detect
- `apps/web/hrm/src/integrations/hrmApi.ts` — optional `advanceMaxDays` / `advanceCapPercent` on policy DTO

---

## 3. Conditional / HOLD (J-04 · J-05 — not browser PASS until BE)

| Residual | FE state | QA note |
|----------|----------|---------|
| **R-ATT-04B-OVER-BAL** | `ATT_04B_BALANCE_RESOLUTION_API_LIVE=false` · footer `att-04b-over-bal-hold` · dialog wired behind flag | J-04 **HOLD** in U65 until BE-01 flips flag + cap |
| **R-ATT-04B-CAP-CRUD** | `att-04b-cap-hold` until policy rows expose `advanceMaxDays`/`advanceCapPercent` | J-05 **HOLD** |
| **R-ATT-04B-ADVANCED-WIRE** | Panel column when `advanced_days>0` only | Conditional with BE panel GET |
| **F-ATT-LEAVE-04 offset** | Honesty footer only | **HOLD** ENGINE |
| **F-PAY-ADV-BRIDGE** | Not in ATT slice | **OUT** |

---

## 4. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attLeave04bRing.test.ts \
  src/lib/poHrmMvpGd1Att04bClusterFe01.source.test.ts
# → exit 0 · 2 files · 8 tests PASS

pnpm --dir apps/web/hrm run build
# → exit 0
```

---

## 5. U65 browser plan (QA-01)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-04B-01** | Cài đặt / Loại phép ATT → bật **Cho phép ứng phép** → Lưu → F5 · Network `…/leave-types*` 2xx | AC-ATT-04B-CAT-ADV |
| **J-HRM-ATT-04B-02** | Nghỉ phép → Tạo đơn → panel có nhãn **Ứng phép** cho bucket `advance` | AC-ATT-04B-PANEL |
| **J-HRM-ATT-04B-03** | Loại **không** ứng · ngày vượt khả dụng → Gửi → **400** `HRM-LEAVE-VAL-BALANCE` · `att-04b-balance-reject` · không row mới | AC-ATT-04B-GATE-REJECT · U65 |
| **J-HRM-ATT-04B-04** | **HOLD** until `ATT_04B_BALANCE_RESOLUTION_API_LIVE` + cap — else footer only | AC-ATT-04B-OVER-BAL conditional |
| **J-HRM-ATT-04B-05** | **HOLD** until policy API returns cap fields — else `att-04b-cap-hold` | AC-ATT-04B-CAP-HOLD |
| **J-HRM-ATT-04B-06** | `att-04b-honesty` seals · Nest `/core` 0 · ≠ ATT-04b DONE | AC-ATT-04B-H |

**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**Cấm:** seed · claim flag+panel=FR-04b DONE · invent `att_leave_hold` · Nest `/core` SoT

---

## 6. Explicit ≠ DONE

- RETAIN catalog + panel + 400 gate **≠** ATT-04b / FR-04b module DONE
- Reject-only path **≠** Diễn biến #1 DONE (over-balance branch HOLD)
- **≠** ATT-04 DONE · **≠** ATT UAT · C-SLICE only

---

## 7. Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-fe-01.md
completion_report: |
  RETAIN J-01..03: allows_advance admin testid · panel advance/unpaid labels ·
  HRM-LEAVE-VAL-BALANCE UX (banner + hook outcome) · advanced_days panel column when BE sends.
  Conditional HOLD: J-04 over-bal dialog behind ATT_04B_BALANCE_RESOLUTION_API_LIVE=false;
  J-05 cap CRUD UI gated on policy row cap fields. attLeave04bRing + source lock + vitest 8 PASS;
  apps/web/hrm build PASS. ≠ FR-04b/ATT-04b/ATT UAT DONE.
next_owner: qa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-QA-01
  role: qa
  entry_criteria: FE-01 READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-fe-01.md;
    stack L0; browser-only U65; ceo@xe.vn
  exit_criteria: |
    J-HRM-ATT-04B-01..03 mandatory PASS with Network /api/hrm/attendance/*;
    J-04/J-05 document HOLD footer if BE cap/branch not LIVE;
    J-06 honesty; no seed; ack_status PASS_TO_PM
  read_first: docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-fe-01.md §5
  cấm: seed · Nest /core · claim ATT-04b DONE
```
