# Evidence — PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-02` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · U89 Wave-32 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-03d` · `J-HRM-ATT-03D-03` (status/CODE-KEY slice) |
| **depends_on** | QA-01 `ATT03DQA1-MSM1826M` residual `R-ATT-03D-CNS-STATUS-CODE` · FE-01 RETAIN |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **FIX** narrow · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · **≠ ATT-03d DONE** · **≠ ATT module UAT** · PLT WS / CNS-05 ≠ FR-03d DONE · seals RETAIN · printable false · PAY OUT · Nest `/core` DENY · U65 |

---

## Closed scope

| Item | Status |
|------|--------|
| GPS punch cấm sole `status=present` khi EFF>0 | **PASS** — picker Nest effective + POST `code` |
| `resolveCheckInRecordStatus` / default catalog | **PASS** |
| `CheckInData.status` + `buildAttendanceCheckInApiPayload` open key | **PASS** |
| GEO-001/GEO-REQ + work-sites bind | **RETAIN** (unchanged) |
| Honesty seals | **RETAIN** |
| vitest | **31 PASS** (4 files incl. FE-01 source lock) |

### Files touched

- `apps/web/hrm/src/hooks/useAttAttendanceCodesEffective.ts` — resolve helpers + CODE-MEMORY APPEND
- `apps/web/hrm/src/hooks/useAttendanceRecords.ts` — `CheckInData.status` · payload · checkIn explicit status
- `apps/web/hrm/src/components/attendance/GPSAttendance.tsx` — EFF picker `clock-in-gps-attendance-code` · POST resolved status
- `apps/web/hrm/src/i18n/locales/vi.json` · `en.json` — `gpsAttendance.selectAttendanceCode`
- `apps/web/hrm/src/lib/poHrmMvpGd1Att03dClusterFe02.test.ts` — status path vitest
- `apps/web/hrm/src/hooks/useAttendanceRecords.test.ts` — Nest key payload test

---

## Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/poHrmMvpGd1Att03dClusterFe02.test.ts \
  src/hooks/useAttendanceRecords.test.ts \
  src/lib/attWorkSite03dRing.test.ts \
  src/lib/poHrmMvpGd1Att03dClusterFe01.source.test.ts
# → exit 0 · 4 files · 31 tests PASS
```

---

## QA narrow retest (J-03 status only)

| Step | Pass when |
|------|-----------|
| EFF>0 · Clock-In GPS · trong bán kính | Dialog có **Mã chấm công** · chọn mã effective (≠ invent `present` nếu absent catalog) · **POST** `…/records` **201** · body `status` = Nest code · **không** `HRM-ATT-CODE-KEY` |
| EFF=0 (nếu repro empty catalog) | Không bắt picker · bootstrap present RETAIN |
| Regression | J-03 GEO/lat/lon/method=gps · J-04/05 GEO errors · Nest `/core` **0** |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · U65 zero-seed  
**Cấm:** claim ATT-03d module UAT · seed · ensureDefault

---

## completion_report

**Closed:** `R-ATT-03D-CNS-STATUS-CODE` FE — GPS bind effective attendance codes; stop hardcoded `present` on POST when EFF>0.

**Residual:** OVERLAP/SITE/MOB HOLD · R-ATT-01-ASSIGN open · manual/QR/Face check-in chưa bind picker (out of slice) · ≠ ATT-03d DONE.

**Honesty stamps retained:** ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11/10/09/08/02 · PLT/CORE · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P.

---

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QA-02
role: qa
entry_criteria: FE-02 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-fe-02.md · L0 stack · U65 zero-seed · browser-only
exit_criteria: Narrow retest J-HRM-ATT-03D-03 status/CODE-KEY only — EFF>0 GPS picker · POST status = Nest effective code · 201 without HRM-ATT-CODE-KEY · GEO/method/lat-lon regression J-04/05 PASS · Nest /core 0 · honesty ≠ ATT-03d DONE · seals RETAIN · PASS_TO_PM or FAIL residual
cấm: seed · ensureDefault · claim ATT-03d module UAT · reopen full J-01..06 unless regression
persona: ceo@xe.vn / Xevn@2026 · portal :5173
read_first: docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qa-01.md · fe-02 evidence
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qa-02.md
```

**ack_status:** `READY_FOR_QA`  
**next_owner:** `qa`
