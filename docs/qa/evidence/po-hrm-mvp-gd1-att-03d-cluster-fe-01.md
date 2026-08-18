# Evidence — PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-32 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-03d` · `FR-UC-BP-ATT-03d` · `J-HRM-ATT-03D-01..06` |
| **depends_on** | API-01 CONFIRMED RETAIN · DATA-01 HOLD · BA O1–O12 · ADR D3 · must_keep ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11/10/09/08/02/PLT/CORE · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE · Dev-BE HOLD · OVERLAP/SITE/MOB HOLD |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** Settings GPS + punch · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · **≠ ATT-03d DONE** · PLT WS / CNS-05 ≠ FR-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · CFG≠ATT-02 · printable false · PAY OUT · Nest `/core` DENY · C-SLICE · U65 · R-ATT-01-ASSIGN **open** · DENY `att_leave_hold` · DENY `gps_locations` sole · DENY `ensureDefaultWorkSite` |
| **U65** | zero-seed — browser FE only · empty CTA · no bootstrap / ensureDefault |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-03d Diễn biến #1–#6 · BR-BP-GPS-01
- hdsd: docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01.md
  F-ATT-CAT-WS-01/02 RETAIN GET/POST/PATCH/DELETE …/work-sites*
  F-ATT-PUNCH-01 RETAIN POST …/records · HRM-ATT-GEO-001 / HRM-ATT-GEO-REQ
  statusLabelVi FE-derive from active · Nest /core DENY
- data: docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01.md HOLD RETAIN attendance_work_sites
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md J-HRM-ATT-03D-01..06
- adr: ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md D3
- must_keep: ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM R-ATT-01-ASSIGN open · ATT11QC1-MSLXTH9P ·
  ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT/CORE ·
  ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE · Nest /core DENY · DENY att_leave_hold ·
  PAY OUT · printable false · OVERLAP/SITE/MOB HOLD · Dev-BE HOLD
- sponsor_confirm: API RETAIN unlock FE+QA · Dev-BE HOLD invent
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind Settings GPS admin → LIVE Nest `work-sites*` CRUD | **PASS** |
| Soft-retire prefer PATCH `active=false` (DELETE soft fallback) | **PASS** |
| Punch path lat/lon + `check_in_method=gps` · GEO-001 / GEO-REQ toast map | **PASS** |
| Empty active → skip + CTA admin / punch banner · DENY ensureDefault / seed | **PASS** |
| `statusLabelVi` FE-derive from `active` | **PASS** |
| Nest `/core` = 0 · DENY `gps_locations` sole SoT write | **PASS** |
| Honesty ≠ ATT-03d DONE · ≠ PLT WS alone · seals RETAIN · PAY OUT | **PASS** |
| CODE-MEMORY APPEND · no `*/` inside block comments | **PASS** |
| vitest | **3 files · 24 PASS** (ring 6 + source 6 + records 12) |

### Files touched

- `apps/web/hrm/src/lib/attWorkSite03dRing.ts` (+ test) — path · statusLabelVi · empty CTA · GEO · honesty
- `apps/web/hrm/src/lib/poHrmMvpGd1Att03dClusterFe01.source.test.ts` — Nest `/core` 0 · seals
- `apps/web/hrm/src/hooks/useAttendanceRules.ts` — parseAtt03d · soft-retire PATCH · CODE-MEMORY
- `apps/web/hrm/src/pages/Attendance.tsx` — empty CTA · statusLabelVi · retire · honesty footer
- `apps/web/hrm/src/components/attendance/GPSAttendance.tsx` — empty punch CTA · work-sites count
- `apps/web/hrm/src/integrations/hrmApi.ts` — HrmWorkSiteRow `active` / `statusLabelVi`
- `apps/web/hrm/src/lib/apiError.ts` — GEO-001 · GEO-REQ · SITE-VAL/404

### Network assert path (QA)

```text
1) Chấm công → Cài đặt → Điểm GPS
   → GET /api/hrm/attendance/work-sites
   → Thêm điểm (tên·lat·lon·bán kính) → POST …/work-sites **2xx**
   → FE sau 2xx: row + statusLabelVi «Đang hiệu lực» · Nest /core = 0
2) Ngừng theo dõi → PATCH …/work-sites/:id { active:false } **2xx**
   → list mặc định ẩn · Nest /core = 0
3) Clock-In GPS · active>0 · trong bán kính → POST …/records **2xx** · F5 còn
4) Ngoài bán kính → HRM-ATT-GEO-001 · không silent 2xx
5) method=gps thiếu lat/lon → HRM-ATT-GEO-REQ · FAIL silent 2xx
6) active=0 → punch skip banner CTA · Settings empty CTA · no seed · no ensureDefault
7) Footer att-03d-honesty: PLT WS ≠ ATT-03d DONE · seals RETAIN · PAY OUT
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attWorkSite03dRing.test.ts \
  src/lib/poHrmMvpGd1Att03dClusterFe01.source.test.ts \
  src/hooks/useAttendanceRecords.test.ts
# → exit 0 · 3 files · 24 tests PASS
```

---

## 4. U65 browser plan (QA-01)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-03D-01** | Login → Cài đặt → Điểm GPS → Thêm tên·lat·lon·bán kính → Lưu → F5 · Nest `/core` **0** · no seed · ≠ PLT WS = ATT-03d DONE | AC-ATT-03D-SOT/ADMIN/F5/PATH/≠-PLT |
| **J-HRM-ATT-03D-02** | Ngừng theo dõi → `active=false` · ẩn list mặc định · punch history còn · Nest `/core` **0** | AC-ATT-03D-SOFT |
| **J-HRM-ATT-03D-03** | active>0 · GPS bật · tọa độ ∈ bán kính → records **2xx** · F5 còn · Nest `/core` **0** | AC-ATT-03D-CNS-IN |
| **J-HRM-ATT-03D-04** | Tọa độ ngoài mọi bán kính → **`HRM-ATT-GEO-001`** · Nest `/core` **0** | AC-ATT-03D-GEO-001 |
| **J-HRM-ATT-03D-05** | method=gps thiếu lat/lon → **`HRM-ATT-GEO-REQ`** · FAIL silent 2xx · Nest `/core` **0** | AC-ATT-03D-GEO-REQ |
| **J-HRM-ATT-03D-06** | active=0 → skip + CTA · DENY ensureDefault/seed · F5 · Nest `/core` **0** · ≠ ATT-03d DONE · PLT WS ≠ FR-03d · ≠ residual/thin=ATT-03b · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY invent ASSIGN · DENY `att_leave_hold` · DENY `gps_locations` sole · OVERLAP/SITE/MOB HOLD · seals ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P | AC-ATT-03D-EMPTY/≠-*/H/MK-* |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công → Cài đặt / Clock-In GPS  
**Cấm:** seed · ensureDefaultWorkSite · Nest `/core` geofence SoT · claim PLT WS = ATT-03d DONE · claim ATT module UAT

---

## 5. Residual / honesty

| Residual | Status |
|----------|--------|
| OVERLAP warn GĐ1 | **HOLD** |
| SITE-UNKNOWN / site_code | **HOLD** |
| MOB Face/mobile GPS = SoT | **HOLD** |
| R-ATT-01-ASSIGN | **open** (must_keep) |
| Dev-BE invent | **HOLD** |
| ATT-03d module DONE / UAT | **false** — C-SLICE |

---

## 6. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-fe-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QA-01
role: qa
entry_criteria: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-fe-01.md · L0 stack · U65 zero-seed · browser-only
exit_criteria: J-HRM-ATT-03D-01..06 evidence blocks (Network work-sites* + records · Nest /core = 0 · GEO-001/GEO-REQ · empty CTA · soft-retire · honesty ≠ ATT-03d DONE · seals RETAIN) · matrix update · PASS_TO_PM hoặc FAIL residual
cấm: seed · ensureDefaultWorkSite · Nest /core SoT · claim PLT WS = ATT-03d DONE · invent ASSIGN / att_leave_hold / PAY/printable DONE
persona: ceo@xe.vn / Xevn@2026
read_first: HDSD_XEVN_CH05b · BA-01 J-HRM-ATT-03D-* · FE evidence fe-01
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qa-01.md
```

---

## completion_report

**Closed:** ATT-03d FE bind — Settings GPS LIVE `work-sites*` CRUD + soft-retire `active=false` · punch GEO-001/GEO-REQ path · empty skip+CTA · `statusLabelVi` FE-derive · Nest `/core` 0 · honesty C-SLICE · vitest 24 PASS.

**Residual:** OVERLAP/SITE/MOB HOLD · R-ATT-01-ASSIGN open · ≠ ATT-03d DONE · Dev-BE HOLD · ATT UAT false · PAY OUT · printable false.

**Honesty stamps retained:** ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT/CORE · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE.
