# PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE attendance_work_sites GPS SoT (Option A · ba-data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-32 seat **#34**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.attendance_work_sites` geofence SoT · **NO** residual ADD schema this seat (display `statusLabelVi` = **wire-derive** from `active` · **no** typed col invent) · **DENY** second geofence / `att_gps_point*` · **DENY** `gps_locations` sole SoT · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** `ensureDefaultWorkSite` · **DENY** invent ASSIGN DONE · **NO** wipe ATT-03b/01/11/10/09/08/02/PLT/CORE · **NO** wipe soft≠CORE-06 DONE · **NO** invent PAY / printable / Word DONE · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — LIVE Nest `work-sites*` → `attendance_work_sites` (**F-ATT-CAT-WS-01/02** · ADR **D3**) **RETAIN** · punch peer **F-ATT-PUNCH-01** RETAIN cite · OVERLAP/SITE/MOB **HOLD** · unlock **sa API-01** F.1 **F-ATT-CAT-WS-01/02** + **F-ATT-PUNCH-01** physical `/api/hrm/attendance/*` — residual wire **ONLY if** closable DISP · **PAY OUT invent DONE** · **printable false RETAIN** · **≠ ATT-03d DONE** · **≠ PLT WS alone=ATT-03d DONE** · **≠ residual/thin=ATT-03b DONE** · **≠ catalog=ATT-01 DONE** · **≠ LIVE=ATT-11 DONE** · **≠ AGG=ATT-10 DONE** · **≠ ATT module UAT** · **CFG≠ATT-02 DONE** · **C-SLICE** · **R-ATT-01-ASSIGN open** |
| **uc_ids** | `UC-BP-ATT-03d` · `FR-UC-BP-ATT-03d` · **BR-BP-GPS-01** |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md) · ADR **D3** · QC ATT-03b **`ATT03BQC1-MSM0891H`** (≠ residual/thin=DONE) · must_keep ATT-01 **`ATT01QC1-MSLZ3KIM`** (≠ catalog=DONE · **R-ATT-01-ASSIGN open** · DENY invent ASSIGN) · ATT-11 **`ATT11QC1-MSLXTH9P`** (≠ LIVE=DONE) · ATT-10 **`ATT10QC1-MSLWGUYH`** (≠ AGG=DONE) · ATT-09 **`ATT09QC1-MSLUTL9D`** (pending_days · DENY `att_leave_hold`) · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** CFG≠DONE · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** printable false · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · peer PLT WS **`ATTWSQA-MSJC3IN9`** · CNS-05 **`ATTWSQA2-MSJCG47P`** (**≠** claim = ATT-03d DONE) · PAY invent DONE **OUT** |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-03D-* · R-ATT-03D-* |
| **ref_att03b_data** | [`PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01.md) — stamp `ATT03BQC1-MSM0891H` · ≠ residual/thin=DONE |
| **ref_att01_data** | [`PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01.md) — stamp `ATT01QC1-MSLZ3KIM` · ≠ catalog=DONE · R-ATT-01-ASSIGN **open** |
| **ref_att11_data** | [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md) — stamp `ATT11QC1-MSLXTH9P` · ≠ LIVE=ATT-11 DONE |
| **ref_att10_data** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md) — stamp `ATT10QC1-MSLWGUYH` · ≠ AGG=DONE |
| **ref_att09_data** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md) — stamp `ATT09QC1-MSLUTL9D` · DENY `att_leave_hold` |
| **ref_att08_data** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md) — stamp `ATT08QC1-MSLSL36C` |
| **ref_att02_data** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| **ref_plt_data** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md) — stamp `PLT01QC1-MSLPUQIU` |
| **ref_core10_data** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) — stamp `CORE10QC1-MSLP0EJB` |
| **ref_core09_data** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — GATE/ACT · Nest `/core` DENY |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.4c** `attendance_work_sites` LIVE · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** · ATT-WORKSITE-CATALOG-DATA-01 HOLD no second table |
| **ref_paper_api** | **F-ATT-CAT-WS-01/02** · **F-ATT-PUNCH-01** · errors **`HRM-ATT-GEO-001`** · **`HRM-ATT-GEO-REQ`** · **`HRM-ATT-SITE-VAL`** · **`HRM-ATT-SITE-404`** · **`HRM-ATT-SITE-UNKNOWN` HOLD** · Nest `@Controller('core')` **ABSENT** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-03d** · Diễn biến **#1–#6 + Thành công** · **BR-BP-GPS-01** |
| **ref_adr** | [`ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D3** · Nest physical prefer `/api/hrm/attendance/work-sites*` + punch `/records` · paper `/att/*` + `/core` **alias only** · U19 · soft-delete · **DENY** Nest `/core` dual · **DENY** `gps_locations` sole SoT · **DENY** `ensureDefaultWorkSite` |
| **ref_code_cite** | `attendance-config.service.ts` `ensureWorkSitesSchema` + `mapWorkSite` · `attendance.service.ts` `assertWithinWorkSite` · **removed** `ensureDefaultWorkSite` · Nest `@Controller('core')` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim PLT WS / CNS-05 / thin work-sites = ATT-03d DONE · **DENY** claim residual/thin=ATT-03b DONE · **DENY** claim catalog=ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** invent ASSIGN DONE · **DENY** invent `att_leave_hold` · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD** (no residual ADD schema)

| Decision | Stamp |
|----------|--------|
| **Geofence SoT** | **HOLD RETAIN** — LIVE Nest **`GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*`** → **`public.attendance_work_sites`** (**F-ATT-CAT-WS-01/02** · ADR **D3**) — **DENY** second geofence / `att_gps_point*` · **DENY** Nest `/core` dual · **DENY** Settings/`gps_locations` sole SoT · **explicit ≠** FR-03d / ATT-03d DONE from PLT WS GWC / CNS-05 / thin CRUD alone |
| **Soft-retire** | **HOLD RETAIN** — LIVE `active=false` hide geofence / list mặc định · history punches intact · hard DELETE residual only |
| **Punch peer** | **HOLD RETAIN cite** — `assertWithinWorkSite` · **`HRM-ATT-GEO-001`** · **`HRM-ATT-GEO-REQ`** · empty active=0 skip · **DENY** `ensureDefaultWorkSite` · stamp CNS-05 **`ATTWSQA2-MSJCG47P`** · **≠** invent = ATT-03d DONE |
| **R-ATT-03D-DISP** | **HOLD wire-only** — `statusLabelVi?` **ABSENT** on `mapWorkSite` · **closable derive** from LIVE `active` (`true`→*Đang hiệu lực* · `false`→*Ngừng*) — **NO** typed col invent · **NO** migrate this seat · **≠** claim DISP alone = FR-03d DONE |
| **R-ATT-03D-OVERLAP** | **HOLD GĐ1** — no overlap-warn col/table invent · cite BA O7 |
| **R-ATT-03D-SITE** | **HOLD** — `site_code` / **`HRM-ATT-SITE-UNKNOWN`** — DENY invent FAIL as GĐ1 DONE · paper §4.4c HOLD |
| **R-ATT-03D-MOB** | **HOLD cite** — OOS XOR web-first · **≠** invent Face/mobile GPS = GPS SoT DONE |
| **`archived_at` / `updated_at`** | **HOLD** — not required GĐ1 · `created_at` PRESENT · omit optional `updatedAt` until wire needs · **DENY** invent as ATT-03d DONE |
| Display-ready DTO | **Cite** §4 — work-sites + punch geofence peer |
| Nest path | Physical `/api/hrm/attendance/work-sites*` + `/records` · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| ATT-03b HOL | **must_keep** · stamp **`ATT03BQC1-MSM0891H`** · ≠ residual/thin=DONE |
| ATT-01 CAT/CNS | **must_keep** · stamp **`ATT01QC1-MSLZ3KIM`** · ≠ catalog=DONE · **R-ATT-01-ASSIGN open** · **DENY invent ASSIGN** · Nest `/core` 0 |
| ATT-11 sign/close | **must_keep** · stamp **`ATT11QC1-MSLXTH9P`** · ≠ LIVE=ATT-11 DONE |
| ATT-10 AGG/submit | **must_keep** · stamp **`ATT10QC1-MSLWGUYH`** · ≠ AGG=DONE |
| ATT-09 hold/settle | **must_keep** · stamp **`ATT09QC1-MSLUTL9D`** · held=`pending_days` · **DENY** `att_leave_hold` |
| ATT-08 preview | **must_keep** · stamp **`ATT08QC1-MSLSL36C`** |
| ATT-02 CFG | **must_keep** · stamp **`ATT02QC1-MSLQZUK7`** · **CFG≠ATT-02 DONE** · ≠ ATT UAT |
| PLT-01 | **must_keep** · stamp **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE · merge≠platform UAT |
| PLT WS / CNS-05 | **must_keep cite** · **`ATTWSQA-MSJC3IN9`** · **`ATTWSQA2-MSJCG47P`** · **≠** ATT-03d DONE |
| CORE-10 | **must_keep** · stamp **`CORE10QC1-MSLP0EJB`** · ≠ CORE-10 DONE |
| CORE-09 printable | **must_keep** · stamp **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · stamp **`CORE07QC1-KZJTSHNT`** · Nest DENY · soft≠CORE-06 DONE |
| PAY / printable / Word | **OUT invent DONE** · printable **false RETAIN** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim PLT WS=ATT-03d DONE · residual/thin=ATT-03b · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT UAT · soft/ATT-08=ATT-09 · CFG=ATT-02 · invent ASSIGN / `att_leave_hold` / `ensureDefaultWorkSite` |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| F-ATT-CAT-WS-01/02 · `attendance_work_sites` | LIVE **`public.attendance_work_sites`** · **`/api/hrm/attendance/work-sites*`** | **HOLD RETAIN** · **≠** ATT-03d DONE alone · **≠** PLT WS alone DONE |
| Soft-retire | LIVE **`active`** BOOLEAN | **HOLD RETAIN** |
| List default active | LIVE filter `active=TRUE` unless `include_inactive` | **HOLD RETAIN** |
| F-ATT-PUNCH-01 geofence | LIVE `assertWithinWorkSite` on **`attendance_work_sites` active** | **HOLD RETAIN cite** · peer ≠ ATT-03d DONE |
| `gps_locations` JSON | `attendance_rules.gps_locations` deprecated ADR D3 | **DENY sole SoT** · embed read-only OK |
| `site_code` / SITE-UNKNOWN | — | **HOLD** · DENY invent FAIL GĐ1 |
| Overlap warn | — | **HOLD GĐ1** |
| `statusLabelVi` | Derive from LIVE `active` | **HOLD wire-only** · no col invent |
| Second geofence / `att_gps_point*` | — | **DENY invent** |
| Nest `/core` work-sites | — | **DENY invent** |
| Paper `/core` / `/att` | Alias only | **DENY** Nest dual SoT |
| `ensureDefaultWorkSite` | Removed from LIVE punch path (U65) | **DENY** reintroduce / seed |
| Paper held / `att_leave_hold` | LIVE **`employee_leave_balances.pending_days`** (ATT-09) | **must_keep** · **DENY invent dual** |
| ATT-03b/01/11/10/09/08/02/PLT/CORE peers | seals | **must_keep** · ≠ claim DONE · DENY invent ASSIGN |

```text
  public.attendance_work_sites (LIVE — HOLD RETAIN · ONE GPS SoT · ADR D3 · ≠ FR-03d DONE alone)
        RETAIN: id · company_id TEXT · name · address? · latitude · longitude ·
                radius_meters · active · created_at
        ABSENT (HOLD — no ADD this seat): site_code · archived_at · updated_at
        DENY: second geofence table · Nest /core dual · gps_locations sole SoT ·
              ensureDefaultWorkSite · att_leave_hold
                │
                │ Physical API (HOLD RETAIN)
                ▼
  GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*
  Paper /att/work-sites + /core/… = ALIAS ONLY

  Punch peer (HOLD RETAIN cite · ≠ ATT-03d DONE alone):
  POST /api/hrm/attendance/records · assertWithinWorkSite
        → HRM-ATT-GEO-001 · HRM-ATT-GEO-REQ · empty active skip
        DENY ensureDefaultWorkSite / seed

  Display-ready work-site DTO (cite · wire deepen statusLabelVi):
        id · companyId · name · address? · latitude · longitude ·
        radiusMeters · active · statusLabelVi? (derive) · createdAt · updatedAt?
        labels VI: *Điểm GPS* / *Đang hiệu lực* / *Ngừng* / *Bán kính (m)*

  Display-ready punch geofence peer (cite response — not invent DONE):
        record_id · late_minutes? · status? · geo ok|GEO-001|GEO-REQ

  ATT03BQC1-MSM0891H ≠ residual/thin=DONE
  ATT01QC1-MSLZ3KIM ≠ catalog=DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN
  ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D DENY att_leave_hold
  ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE
  PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false
  CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY
  ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Wipe LIVE attendance_work_sites · Nest /core dual · second geofence SoT
        gps_locations sole SoT write · ensureDefaultWorkSite / seed
        Invent att_leave_hold · invent ASSIGN DONE · invent PAY/printable/Word DONE
        Invent site_code / SITE-UNKNOWN FAIL / OVERLAP as GĐ1 DONE
        Claim PLT WS / CNS-05 / thin CRUD = ATT-03d / FR-03d DONE
        Claim residual/thin=ATT-03b · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT UAT
        Claim soft/ATT-08=ATT-09 · CFG=ATT-02 · PLT/CORE DONE
        Honesty flip · reopen sealed J-* · seed · apps/**
```

**Label lock:** Board «Danh mục điểm GPS (vùng hợp lệ)» GĐ1 = **LIVE `attendance_work_sites` RETAIN** + punch peer cite + DISP wire-only — **not** Nest `/core` dual · **not** PLT WS alone = FR-03d DONE · **not** ATT module UAT.  
**Spine lock:** Physical `/api/hrm/attendance/work-sites*` + `/records` — **DENY** Nest `/core` second SoT · paper `/att`+`/core` alias only · **DENY** `gps_locations` sole · **DENY** `ensureDefaultWorkSite`.  
**Gap lock:** OVERLAP/SITE/MOB **HOLD** · DISP = wire-derive `statusLabelVi` · **NO** residual ADD schema · **NO** migrate this seat.  
**Honesty lock:** `attendance_uat_ready=false` · printable false · C-SLICE · PAY OUT · ≠ ATT-03d DONE · R-ATT-01-ASSIGN **open**.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-03d DONE** · PLT WS / CNS-05 ≠ FR-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · ≠ soft/ATT-08=ATT-09 DONE · ≠ CFG=ATT-02 DONE · PAY OUT invent DONE · DENY invent ASSIGN · DENY invent `att_leave_hold` · DENY `gps_locations` sole SoT · DENY `ensureDefaultWorkSite` · must_keep ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest `/core` DENY · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P · no seed · no apps/**

---

## 3. LIVE prove — PRESENT / ABSENT (read-only cite)

| Object | LIVE prove (2026-08-09) | Verdict |
|--------|-------------------------|---------|
| `attendance_work_sites` | `ensureWorkSitesSchema` CREATE: `id`·`company_id TEXT`·`name`·`address`·`latitude`·`longitude`·`radius_meters`·`active`·`created_at` | **PRESENT** · **HOLD RETAIN** · ONE GPS SoT |
| `GET/POST/PATCH/DELETE …/work-sites*` | Nest attendance-config CRUD + list active filter + soft-retire | **PRESENT** · **≠** ATT-03d DONE alone |
| `mapWorkSite` | `{ id, company_id, name, address, latitude, longitude, radius, radius_meters, active, created_at }` | **PRESENT** spine · `statusLabelVi` **ABSENT** → wire-derive HOLD |
| `assertWithinWorkSite` | Query active sites · GEO-001 / GEO-REQ | **PRESENT** · **HOLD RETAIN cite** |
| `ensureDefaultWorkSite` | Removed from `attendance.service.ts` (comment must_keep) | **ABSENT LIVE path** · **DENY** reintroduce |
| Nest `@Controller('core')` | ABSENT in attendance geofence SoT | **DENY invent** |
| Second geofence / `att_gps_point*` | — | **DENY invent** |
| `gps_locations` sole write | Deprecated ADR D3 · rules may embed read-only | **DENY sole SoT** |
| `site_code` / `archived_at` / `updated_at` | **0** cols in ensureWorkSitesSchema | **HOLD** — no ADD GĐ1 |
| Overlap warn storage | ABSENT | **HOLD GĐ1** |
| `att_leave_hold` | — | **DENY invent** (ATT-09 pending_days) |
| PLT WS seals | `ATTWSQA-MSJC3IN9` · CNS-05 `ATTWSQA2-MSJCG47P` | **RETAIN cite** · **≠** ATT-03d DONE |

**Paper §4.4c map → LIVE (prefer RETAIN · no second table):**

| Paper col | LIVE target | ba-data |
|-----------|-------------|---------|
| `id`·`company_id`·`name`·`address`·lat/lon·`radius_meters`·`active`·`created_at` | LIVE AS-IS | **HOLD RETAIN** |
| Soft-retire | LIVE `active=false` | **HOLD RETAIN** |
| `ICatalogRow.status` | derive from `active` | **HOLD wire** |
| `site_code` | — | **HOLD GĐ1.5** · no invent |
| `archived_at` | — | **HOLD** not required GĐ1 |
| Soft-archive alternate | prefer `active` | **RETAIN** product retire SoT |

---

## 4. Display-ready DTO (work-sites + punch peer — normative cite)

### 4.1 Work-site (F-ATT-CAT-WS)

| Field | Source | GĐ1 note |
|-------|--------|----------|
| `id` | LIVE id | RETAIN |
| `companyId` | LIVE company_id TEXT | U19 same resolver list=get=mutate |
| `name` | LIVE name | RETAIN |
| `address?` | LIVE address | RETAIN |
| `latitude` / `longitude` | LIVE | RETAIN |
| `radiusMeters` | LIVE radius_meters | RETAIN (`radius` alias OK) |
| `active` | LIVE active | RETAIN soft-retire SoT |
| `statusLabelVi?` | **wire-derive** from `active` | HOLD deepen API · **no** col invent |
| `createdAt` | LIVE created_at | RETAIN |
| `updatedAt?` | optional | HOLD omit until wire · **no** invent col as DONE |

**DENY invent:** `site_code` in response as GĐ1 DONE · claim DISP alone = FR-03d DONE.

### 4.2 Punch geofence peer (F-ATT-PUNCH-01)

| Field / outcome | Source | GĐ1 note |
|-----------------|--------|----------|
| Record **2xx** in-radius | LIVE assert | RETAIN cite · ≠ ATT-03d DONE alone |
| **`HRM-ATT-GEO-001`** | OOS | RETAIN cite |
| **`HRM-ATT-GEO-REQ`** | missing lat/lon | RETAIN cite · FAIL silent 2xx |
| Empty active skip | LIVE | RETAIN · DENY ensureDefault |
| Response `{ record_id, late_minutes?, status?, … }` | paper F-ATT-PUNCH-01 | peer cite only |

---

## 5. Validation / error mapping (RETAIN + HOLD)

| Condition | Rule | Expected |
|-----------|------|----------|
| Invalid coords/radius (admin) | LIVE validate | **`HRM-ATT-SITE-VAL`** |
| Site OOS / missing | LIVE scope | **`HRM-ATT-SITE-404`** |
| Punch OOS | assert active radii | **`HRM-ATT-GEO-001`** |
| GPS method missing lat/lon + enforce | assert | **`HRM-ATT-GEO-REQ`** · FAIL silent 2xx |
| Empty active | skip assert + CTA | **no** seed / ensureDefault |
| Out-of-scope company | U19 list=get=mutate | **`HRM-SCOPE-409`** |
| Consumer site_code invent | O8 HOLD | **`HRM-ATT-SITE-UNKNOWN` HOLD** · DENY invent FAIL GĐ1 |
| Nest `/core/**` as geofence SoT | O9 | **FAIL** |
| `gps_locations` sole SoT write | ADR D3 · O1 | **FAIL** |
| PLT WS / CNS-05 PASS alone = ATT-03d DONE | O1/O12 | **FAIL** |
| Invent `att_leave_hold` / ASSIGN DONE | O10 | **FAIL** |
| Invent PAY/printable DONE | O11 | **FAIL** |

---

## 6. Scope parity (U19)

| Surface | Filter |
|---------|--------|
| List work-sites | `resolveHrmListScope` / expand TEXT company keys · default `active=TRUE` |
| GET by id | `assertResourceInHrmScope` same family |
| Create / patch / soft-retire | same persist company_id TEXT |
| Punch assert | active sites under same company scope family |

**Invariant ATT-03D-SCOPE-U19:** work-sites list **=** get-by-id **=** create/patch/soft **same** hrm list-scope family as punch records — **scope_parity** FAIL if list returns id but detail 404 under group CEO `main`.

**Journey cite (DRAFT):** **J-HRM-ATT-03D-01..06** — admin · soft · in-radius · GEO-001 · GEO-REQ · empty+seals — **≠** ATT module UAT.

---

## 7. must_keep / DENY checklist

| Lock | Rule |
|------|------|
| **ATT03BQC1-MSM0891H** | RETAIN · ≠ residual/thin=ATT-03b DONE · **no** reopen J-HRM-ATT-03B |
| **ATT01QC1-MSLZ3KIM** | RETAIN · ≠ catalog=ATT-01 DONE · **R-ATT-01-ASSIGN open** · **DENY invent ASSIGN** · Nest `/core` 0 |
| **ATT11QC1-MSLXTH9P** | RETAIN · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD |
| **ATT10QC1-MSLWGUYH** | RETAIN · ≠ AGG=ATT-10 DONE · HOL/MEAL OUT · R-ATT-10-DISP HOLD |
| **ATT09QC1-MSLUTL9D** | RETAIN · pending_days · **DENY** `att_leave_hold` |
| **ATT08QC1-MSLSL36C** | RETAIN · HOL-MISS |
| **ATT02QC1-MSLQZUK7** | RETAIN · **CFG≠ATT-02 DONE** · ≠ ATT UAT |
| **PLT01QC1-MSLPUQIU** | RETAIN · peer≠PLT DONE · merge≠platform UAT |
| **ATTWSQA-MSJC3IN9** · **ATTWSQA2-MSJCG47P** | RETAIN cite · **≠** ATT-03d DONE |
| **CORE10QC1-MSLP0EJB** | RETAIN · ≠ CORE-10 DONE |
| **CORE09QC1-MSLNBA89** | RETAIN · printable **false** · ≠ CORE-09 DONE |
| **CORE07QC1-KZJTSHNT** | RETAIN · GATE 409 · ACT-400 · Nest DENY |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual |
| Second geofence table | **DENY** |
| `gps_locations` sole SoT | **DENY** |
| `ensureDefaultWorkSite` | **DENY** |
| Thin/PLT WS alone | **≠** ATT-03d DONE · **≠** ATT UAT |
| PAY / printable | **OUT invent DONE** · printable false |
| apps/** / seed | **CẤM** this seat |
| Honesty | **DENY** flip · **C-SLICE** |

---

## 8. Traceability (BRD/SRS → API → DB → FE → Test)

| Requirement | API | DB | FE | Test expect |
|-------------|-----|----|----|-------------|
| FR-UC-BP-ATT-03d Diễn biến #1 | F-ATT-CAT-WS-01/02 physical work-sites* | LIVE `attendance_work_sites` RETAIN | Settings GPS Nest bind HDSD CH05b | J-HRM-ATT-03D-01 DRAFT · Nest `/core` 0 · ≠ PLT=DONE |
| Soft-retire #2 | PATCH/DELETE soft `active=false` | LIVE `active` | Hide list/geofence | J-02 |
| In-radius #3 | F-ATT-PUNCH-01 | assert active radii | Punch 2xx · F5 | J-03 · ≠ ATT-03d DONE alone |
| OOS #4 | GEO-001 | same | Reject | J-04 |
| Missing lat/lon #5 | GEO-REQ | same | FAIL silent 2xx | J-05 |
| Empty #6 | skip + CTA | active=0 | DENY ensureDefault/seed | J-06 |
| OVERLAP/SITE/MOB | HOLD | no invent | footer HOLD | O7–O11 |
| DISP | wire statusLabelVi | derive `active` | VI labels | J-01 · no col invent |
| U19 scope | same resolver | company_id TEXT | — | J-06 · 409 |
| ≠DONE / seals | — | must_keep | Footer honesty | J-06 · VAL-ATT-03D-06 |

---

## 9. Data quality risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` geofence SoT | O9 DENY · QC Nest SoT 0 |
| Second geofence / `att_gps_point*` | Prefer LIVE only · DENY dual |
| Claim PLT WS / CNS-05 = ATT-03d DONE | Footer ≠DONE · C-SLICE · stamps ATTWSQA* |
| FE writes `gps_locations` as SoT | ADR D3 · DENY sole SoT |
| Reintroduce `ensureDefaultWorkSite` / seed | U65 · O5 DENY · empty skip |
| Invent SITE-UNKNOWN / OVERLAP DONE | HOLD cite · DENY invent FAIL |
| Invent ASSIGN / `att_leave_hold` | O10 DENY · R-ATT-01-ASSIGN open |
| Wipe ATT-03b..CORE seals | must_keep stamps |
| Claim thin CRUD = FR-03d DONE | ≠DONE footer · C-SLICE |
| Migrate / ADD schema this DATA seat | **NO** — HOLD only · wire DISP after API |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED HOLD** |
| **next_owner** | **sa** — API-01 F.1 **F-ATT-CAT-WS-01/02** + **F-ATT-PUNCH-01** RETAIN cite physical `/attendance/work-sites*` + `/records` · residual wire **ONLY if** closable DISP (`statusLabelVi` derive) · OVERLAP/SITE/MOB remain HOLD |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01.md` |
| **completion_report** | See §10.1 |
| **next_dispatch_prompt** | See §10.2 |

### 10.1 completion_report

**Closed:** ba-data Wave-32 ATT-03d **CONFIRMED HOLD** — RETAIN LIVE `public.attendance_work_sites` as **ONE GPS SoT** (ADR **D3**) + Nest `GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*` (**F-ATT-CAT-WS-01/02**) + punch peer `assertWithinWorkSite` (**F-ATT-PUNCH-01** · GEO-001/GEO-REQ · empty skip); soft-retire LIVE `active`; **DENY** second geofence table · **DENY** Nest `/core` dual · **DENY** `gps_locations` sole SoT · **DENY** `ensureDefaultWorkSite` · **DENY** invent `att_leave_hold` · **DENY** invent ASSIGN DONE; **NO residual ADD schema** (DISP = wire-derive `statusLabelVi` from `active`); OVERLAP/SITE/MOB **HOLD**; display-ready work-site + punch peer DTO cited; must_keep ATT03BQC1-MSM0891H (≠ residual/thin=DONE) · ATT01QC1-MSLZ3KIM (≠ catalog=DONE · R-ATT-01-ASSIGN open) · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT/CORE · soft≠CORE-06 · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P · printable **false** · **C-SLICE** · **PAY OUT** · apps/** untouched · no seed.

**Residual (open — not ADD schema this seat):** sa API F.1 deepen cite · optional wire `statusLabelVi` · OVERLAP/SITE/MOB HOLD · R-ATT-01-ASSIGN still **open** · ATT module UAT **false**.

**Explicit ≠:** ATT-03d DONE · PLT WS alone=ATT-03d DONE · residual/thin=ATT-03b DONE · catalog=ATT-01 DONE · LIVE=ATT-11 DONE · AGG=ATT-10 DONE · ATT module UAT · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 DONE · invent PAY/printable/Word DONE.

**Unlock next:** **sa API-01** F.1 F-ATT-CAT-WS-01/02 + F-ATT-PUNCH-01 RETAIN (+ wire residual ONLY if closable).

### 10.2 next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01
role: sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-32 seat #34)
entry_criteria: DATA-01 CONFIRMED HOLD @ docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01.md · BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · LIVE attendance_work_sites ONE GPS SoT RETAIN (ADR D3) · NO residual ADD schema · DISP wire-derive statusLabelVi ONLY · OVERLAP/SITE/MOB HOLD · must_keep ATT03BQC1-MSM0891H (≠ residual/thin=ATT-03b DONE) · ATT01QC1-MSLZ3KIM (≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN · Nest /core 0) · ATT11QC1-MSLXTH9P (≠ LIVE=ATT-11 DONE) · ATT10QC1-MSLWGUYH (≠ AGG=ATT-10 DONE) · ATT09QC1-MSLUTL9D (pending_days · DENY att_leave_hold) · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P (≠ claim = ATT-03d DONE) · ≠ ATT UAT · PAY invent DONE OUT · printable false
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01.md (HOLD RETAIN attendance_work_sites · DENY second geofence · DENY gps_locations sole · DENY ensureDefaultWorkSite · DENY Nest /core · DENY att_leave_hold · DENY invent ASSIGN · display-ready DTO · OVERLAP/SITE/MOB HOLD)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md (O1–O12 · AC-ATT-03D-* · J-HRM-ATT-03D-*)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md (Option A · F.1 outline)
  - docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md (D3)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-CAT-WS-01/02 · F-ATT-PUNCH-01
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.4c
  - apps/api/hrm-api/src/attendance/attendance-config.service.ts + attendance.service.ts (LIVE work-sites + assertWithinWorkSite — read-only cite · ≠ ATT-03d DONE)
exit_criteria:
  - sa API-01 F.1 deepen RETAIN cite F-ATT-CAT-WS-01/02 physical GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites* + F-ATT-PUNCH-01 POST …/records — paper /att + /core alias only
  - Residual wire contract ONLY for closable DISP statusLabelVi derive from active (DATA HOLD — no schema invent) — DENY invent Nest /core dual · DENY second geofence · DENY gps_locations sole SoT · DENY ensureDefaultWorkSite · DENY invent att_leave_hold · DENY invent ASSIGN DONE · DENY invent SITE-UNKNOWN FAIL / OVERLAP as GĐ1 DONE
  - Cite display-ready work-site DTO + punch geofence peer · U19 list=get=mutate scope_parity · empty skip RETAIN
  - Explicit ≠ ATT-03d DONE · ≠ PLT WS alone=ATT-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01.md
  - ack_status PASS_TO_PM · next_owner=dev-be/dev-fe residual ONLY after API (or QA if wire-only cite) — not invent DONE
cấm: apps/** this seat · seed · Nest /core invent · invent att_leave_hold dual · invent ASSIGN DONE · wipe ATT-03b/01/11/10/09/08/02/PLT/CORE · honesty flip · claim PLT WS=ATT-03d DONE · claim residual/thin=ATT-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · invent PAY/printable DONE · invent second geofence SoT · gps_locations sole SoT · ensureDefaultWorkSite
```

---

## Explicit locks (footer)

**≠ ATT-03d DONE · ≠ ATT module UAT · ≠ PLT WS alone=ATT-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · printable false · C-SLICE · PAY OUT · R-ATT-01-ASSIGN open · DENY invent ASSIGN · DENY invent `att_leave_hold` · DENY Nest `/core` · DENY `gps_locations` sole SoT · DENY `ensureDefaultWorkSite` · DENY second geofence table · OVERLAP/SITE/MOB HOLD · soft≠CORE-06 · CFG≠ATT-02 · NO residual ADD schema · NO migrate this seat · apps/** cấm this seat.**
