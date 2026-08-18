# Evidence — PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` · **U89** Wave-33 seat **#37** |
| **date** | 2026-08-10 |
| **uc_ids** | `UC-BP-ATT-05` · `FR-UC-BP-ATT-05` · `BR-BP-LV-02` · `J-HRM-ATT-05-01..06` |
| **depends_on** | API-01 CONFIRMED RETAIN · BA-01 O1–O15 · must_keep **ATT04QC1-MSM22G4W** · **ATT04BQC1-MSM3S8QC1** · **ATT09QC1-MSLUTL9D** · **ATT03DQC1-MSM1CR19** |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** RETAIN carry spine · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · **≠ ATT-05 / FR-05 DONE** · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · C-SLICE · U65 · DENY `att_leave_hold` · DENY merge carry into annual · PAY OUT · printable false |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md
  FR-UC-BP-ATT-05 Diễn biến #1 · #2 · BR-BP-LV-02 · peer FR-UC-BP-ATT-05b panel
- api: docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01.md §4.1–4.4 · §8.2
  F-ATT-CAT-LVT allowsCarryOver · category carry_over RETAIN ·
  F-ATT-LVRULE carryOverExpireRule · carryCapDays RETAIN ·
  F-ATT-LEAVE-BAL panel carry_over · ledger leave_type=carry_over ·
  PUT tracked-entitlement · STUB F-ATT-FY-01 · HOLD F-ATT-LEAVE-04 rollover/expire · GAP R-ATT-05-DEDUCT
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md
  AC-ATT-05-* · J-HRM-ATT-05-01..06 DRAFT
- must_keep: ATT04QC1 · ATT04BQC1 · ATT09 pending_days · ATT03D · Nest /core DENY ·
  physical /api/hrm/attendance/* only · DENY att_leave_hold · DENY merge carry into annual UI ·
  ≠ panel+policy alone = FR-05 DONE
- sponsor_confirm: API-01 PASS_TO_PM RETAIN 2026-08-10 · FE-01 dispatch
```

---

## 2. Closed scope (RETAIN J-01..04)

| Journey | Status |
|---------|--------|
| **J-05-01** `allowsCarryOver` + category `carry_over` on AttLeaveTypeSettingsPanel | **PASS** (`hdsd-att-leave-type-allows-carry-over` · table column) |
| **J-05-02** Panel bucket «Phép chuyển kỳ» (`carry_over`) | **PASS** (`deriveAtt05PanelBucketLabelVi` · GET panel wire retained) |
| **J-05-03** LVRULE `carryOverExpireRule` / `carryCapDays` admin | **PASS** (form + table · POST payload · `att-05-fy-hold` ENGINE footer) |
| **J-05-04** Separate ledger row + HR grant on `carry_over` | **PASS** (`att-05-ledger-sep` · grant select `hdsd-att-grant-leave-type-carry-over`) |
| **J-05-05** FY admin | **HOLD footer** (`att-05-fy-hold` · F-ATT-FY-01 not LIVE) |
| Physical `/api/hrm/attendance/*` · Nest `/core` 0 in LeaveTab | **PASS** |
| vitest + `pnpm run build` (apps/web/hrm) | **PASS** |

### Files touched

- `apps/web/hrm/src/lib/attLeave05Ring.ts` (+ `attLeave05Ring.test.ts`)
- `apps/web/hrm/src/lib/poHrmMvpGd1Att05ClusterFe01.source.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — policy DTO carry fields
- `apps/web/hrm/src/components/settings/AttLeaveTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/AttLeaveAccrualPolicySettingsPanel.tsx`
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx`
- `apps/web/hrm/src/components/attendance/AttLeaveTrackedEntitlementGrantPanel.tsx`

---

## 3. HOLD / GAP (QA — not FR-05 DONE)

| Residual | FE state | QA note |
|----------|----------|---------|
| **R-ATT-05-FY** | `att-05-fy-hold` — no FY CRUD UI | **J-05-05 HOLD** until BE migrate + route |
| **R-ATT-05-FY-CAL** | calendar `balance_year` read-only | Footer on J-05/J-06 |
| **R-ATT-05-ROLLOVER** / **R-ATT-05-EXPIRE** | honesty only | **J-05-06 HOLD** — no year-end job U65 |
| **R-ATT-05-DEDUCT** | no dual-type deduct UI | **GAP** on leave-requests submit |
| **F-PAY-LEAVE-SETTLE** | not in slice | **OUT** |

---

## 4. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attLeave05Ring.test.ts \
  src/lib/poHrmMvpGd1Att05ClusterFe01.source.test.ts
# → exit 0 · 2 files · 7 tests PASS

pnpm --dir apps/web/hrm run build
# → exit 0
```

---

## 5. QA dispatch (next)

- **work_item_id:** `PO-HRM-MVP-GD1-ATT-05-CLUSTER-QA-01`
- **entry:** L0 stack · U65 zero-seed · `ceo@xe.vn` / `Xevn@2026`
- **UF:** J-HRM-ATT-05-01..04 browser · J-05-05/06 HOLD footers documented
- **exit:** evidence blocks per `qa-fe-outside-browser-gate.mdc` · matrix update · `PASS_TO_PM`

---

## completion_report

**Closed:** ATT-05 RETAIN FE wire for catalog carry flags, LVRULE carry metadata, panel label «Phép chuyển kỳ», ledger separation UX, HR grant on `carry_over`; honesty/HOLD footers for FY/engine/deduct; path lock retained.

**Residual:** FY CRUD, rollover/expire ENGINE, deduct order — BE/program; QA browser J-01..04.

**Explicit ≠:** ATT-05 / FR-05 DONE · ATT UAT · panel+policy cols alone = DONE.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05-CLUSTER-QA-01
role: qa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 #37)
entry_criteria: dev-fe READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-fe-01.md · L0 PASS · U65 zero-seed · ceo@xe.vn
exit_criteria: J-HRM-ATT-05-01 Settings allowsCarryOver+category carry_over → Lưu 2xx → F5 · J-05-02 LeaveTab panel row «Phép chuyển kỳ» · J-05-03 LVRULE carry rule+cap → Lưu 2xx · J-05-04 grant carry_over entitled separate from annual · J-05-05/06 HOLD footers PASS as documented · Network /api/hrm/attendance/* only · evidence po-hrm-mvp-gd1-att-05-cluster-qa-01.md · PASS_TO_PM
read_first: docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-fe-01.md · PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md J-* · must_keep ATT04QC1 · ATT04BQC1 · ATT09
```
