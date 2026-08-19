# PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01 — API F.1 · F-ATT-CAT-WS-01/02 + F-ATT-PUNCH-01 RETAIN (Option A · DISP wire-only)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-32 seat **#34**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-ATT-CAT-WS-01/02** physical **`GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*`** · **F-ATT-PUNCH-01** physical **`POST …/attendance/records`** (**`HRM-ATT-GEO-001`** / **`HRM-ATT-GEO-REQ`**) · paper `/att/*` + `/core` **alias only** · Nest `@Controller('core')` **DENY** · residual wire **ONLY** for closable DISP **`statusLabelVi` FE-derive from `active`** (DATA **NO** ADD schema) · **DENY** second geofence · **DENY** `gps_locations` sole SoT · **DENY** `ensureDefaultWorkSite` · **DENY invent `att_leave_hold`** · **DENY invent ASSIGN DONE** · **DENY invent SITE-UNKNOWN/OVERLAP DONE** · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED RETAIN** — F.1 physical Option A · LIVE Nest `work-sites*` → `attendance_work_sites` (**ADR D3**) + punch `assertWithinWorkSite` **HOLD RETAIN** · closable BE for CAT+PUNCH **NOT required** (spine **LIVE PRESENT**) → unlock **prefer FE + QA** U65 **J-HRM-ATT-03D-01..06 DRAFT** · **Dev-BE HOLD** invent · optional thin BE **`statusLabelVi` ONLY if** FE proves DISP envelope gap · OVERLAP/SITE/MOB **HOLD** · **DENY** Nest `/core` · invent PAY/printable · claim PLT WS alone=ATT-03d DONE · residual/thin=ATT-03b DONE · catalog=ATT-01 DONE · LIVE=ATT-11 DONE · AGG=ATT-10 DONE · ATT module UAT · CFG=ATT-02 DONE |
| **uc_ids** | `UC-BP-ATT-03d` · `FR-UC-BP-ATT-03d` · **BR-BP-GPS-01** |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · **NO residual ADD schema** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · **R-ATT-03D-ADMIN/CNS/SOFT/EMPTY/GATE/DISP/≠DONE** · OVERLAP/SITE/MOB **HOLD** · printable **false** · QC ATT-03b **`ATT03BQC1-MSM0891H`** (≠ residual/thin=DONE) · must_keep ATT-01 **`ATT01QC1-MSLZ3KIM`** (≠ catalog=DONE · **R-ATT-01-ASSIGN open** · DENY invent ASSIGN) · ATT-11 **`ATT11QC1-MSLXTH9P`** (≠ LIVE=DONE) · ATT-10 **`ATT10QC1-MSLWGUYH`** (≠ AGG=DONE) · ATT-09 **`ATT09QC1-MSLUTL9D`** (pending_days · DENY `att_leave_hold`) · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** CFG≠DONE · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** printable false · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · peer PLT WS **`ATTWSQA-MSJC3IN9`** · CNS-05 **`ATTWSQA2-MSJCG47P`** (**≠** claim = ATT-03d DONE) · ≠ ATT UAT · PAY invent DONE **OUT** |
| **ref_data** | [`PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01.md) — HOLD RETAIN `attendance_work_sites` · NO ADD schema · DISP wire-derive · DENY Nest `/core` · DENY second geofence · DENY `gps_locations` sole · DENY `ensureDefaultWorkSite` · DENY `att_leave_hold` · DENY invent ASSIGN · OVERLAP/SITE/MOB HOLD |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-03D-* · J-HRM-ATT-03D-01..06 DRAFT |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md) Option A · BR-BP-GPS-01 · paper alias |
| **ref_att03b_api** | [`PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md) — stamp `ATT03BQC1-MSM0891H` · ≠ residual/thin=DONE |
| **ref_att01_api** | [`PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md) — stamp `ATT01QC1-MSLZ3KIM` · ≠ catalog=DONE · R-ATT-01-ASSIGN **open** |
| **ref_att11_api** | [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md) — stamp `ATT11QC1-MSLXTH9P` · ≠ LIVE=ATT-11 DONE |
| **ref_att10_api** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md) — stamp `ATT10QC1-MSLWGUYH` · ≠ AGG=DONE |
| **ref_att09_api** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md) — stamp `ATT09QC1-MSLUTL9D` · DENY `att_leave_hold` |
| **ref_att08_api** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md) — stamp `ATT08QC1-MSLSL36C` |
| **ref_att02_api** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| **ref_plt_api** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md) — `PLT01QC1-MSLPUQIU` |
| **ref_core10_api** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md) — `CORE10QC1-MSLP0EJB` |
| **ref_core09_api** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_api** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md) — GATE/ACT · Nest DENY |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-03d** · Diễn biến **#1–#6 + Thành công** · **BR-BP-GPS-01** |
| **ref_paper_api** | **F-ATT-CAT-WS-01/02** · **F-ATT-PUNCH-01** · peer **F-ATT-RULE-01** (`gps_enabled` · ≠ ATT-02 DONE) · Nest `@Controller('core')` **ABSENT** · paper `/att/*` + `/core` **alias only** · SoT cite `API_DESIGN_HRM_ENTERPRISE.md` § F-ATT-CAT-WS · F-ATT-PUNCH-01 |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.4c** `attendance_work_sites` LIVE |
| **ref_adr** | [`ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D3** · Nest physical prefer `/api/hrm/attendance/work-sites*` + punch `/records` · paper `/att` + `/core` alias only · U19 · soft-delete · **DENY** Nest `/core` dual · **DENY** `gps_locations` sole SoT · **DENY** `ensureDefaultWorkSite` |
| **ref_code_cite** | `attendance-config.service.ts` `ensureWorkSitesSchema` + `mapWorkSite` · `attendance.controller` `work-sites*` · `attendance.service.ts` `assertWithinWorkSite` · **removed** `ensureDefaultWorkSite` · Nest `@Controller('core')` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim PLT WS / CNS-05 / thin work-sites = ATT-03d DONE · **DENY** claim residual/thin=ATT-03b DONE · **DENY** claim catalog=ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** invent ASSIGN DONE · **DENY** invent `att_leave_hold` · honesty flip |
| **ba-data** | **ALREADY CONFIRMED HOLD** — this seat **does not** invent migrate / ADD schema · DISP = wire-derive · **DENY** Nest `/core` dual · **DENY** second geofence · **DENY** invent `att_leave_hold` |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN** |
| **unlock_lane** | **Prefer FE + QA** on **LIVE CAT + PUNCH** · **Dev-BE HOLD** invent · optional thin BE **`statusLabelVi` ONLY if** FE proves DISP gap · OVERLAP/SITE/MOB remain **HOLD** · **R-ATT-01-ASSIGN stays open** |

---

## 1. Verdict — **CONFIRMED RETAIN**

| Decision | Stamp |
|----------|--------|
| Geofence SoT | **ONE RETAIN** LIVE Nest **`GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*`** → **`public.attendance_work_sites`** (**F-ATT-CAT-WS-01/02** · ADR **D3**) — **DENY** second geofence / `att_gps_point*` · **DENY** Nest `/core` dual · **DENY** Settings/`gps_locations` sole SoT · **explicit ≠** FR-03d / ATT-03d DONE from PLT WS GWC / CNS-05 / thin CRUD alone |
| **F-ATT-CAT-WS-01** | **RETAIN cite** physical **`GET …/work-sites`** · `GET …/:siteId` · list default `active=true` · empty **200[]** · no seed |
| **F-ATT-CAT-WS-02** | **RETAIN cite** physical **`POST/PATCH/DELETE …/work-sites*`** · soft-retire prefer `active=false` · admin N+1 OK · **≠** invent-ban GEO on admin CREATE |
| Soft-retire | **RETAIN cite** LIVE `active=false` hide geofence / list mặc định · history punches intact |
| **F-ATT-PUNCH-01** | **RETAIN cite** physical **`POST …/attendance/records`** · `assertWithinWorkSite` · **`HRM-ATT-GEO-001`** · **`HRM-ATT-GEO-REQ`** · empty active skip · **DENY** `ensureDefaultWorkSite` · stamp CNS-05 **`ATTWSQA2-MSJCG47P`** · **≠** invent = ATT-03d DONE alone |
| **R-ATT-03D-DISP** | **Residual wire-only** — `statusLabelVi?` **ABSENT** on `mapWorkSite` · **closable FE-derive** from LIVE `active` (`true`→*Đang hiệu lực* · `false`→*Ngừng*) — **NO** typed col invent · optional thin BE enrich **ONLY if** FE proves gap · **≠** claim DISP alone = FR-03d DONE |
| **R-ATT-03D-OVERLAP** | **HOLD GĐ1** — DENY invent overlap-warn DONE |
| **R-ATT-03D-SITE** | **HOLD** — `site_code` / **`HRM-ATT-SITE-UNKNOWN`** — DENY invent FAIL as GĐ1 DONE |
| **R-ATT-03D-MOB** | **HOLD cite** — OOS XOR web-first · **≠** invent Face/mobile GPS = GPS SoT DONE |
| Display-ready DTO | Cite §5 — work-sites + punch geofence peer |
| Nest path | Physical `/api/hrm/attendance/work-sites*` + `/records` · Nest `@Controller('core')` **ABSENT** — **DENY invent** |
| Closable gap on LIVE CAT+PUNCH? | **NO** required BE for spine — **PRESENT** · residual = U65 journey + FE ADMIN/CNS/SOFT/EMPTY/DISP bind · optional thin GET enrich **only if** proven |
| Unlock | **Prefer Dev-FE + QA** on CAT+PUNCH · **Dev-BE HOLD** invent · optional thin BE **ONLY if** FE proves DISP envelope gap |
| ATT-03b/01/11/10/09/08/02/PLT/CORE | **must_keep** stamps · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN **open** · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · DENY `att_leave_hold` · CFG≠ATT-02 DONE · printable **false** · soft≠CORE-06 · Nest DENY · ATTWSQA* ≠ ATT-03d DONE |
| PAY / printable / Word | **OUT invent DONE** · printable **false RETAIN** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim PLT WS=ATT-03d DONE · residual/thin=ATT-03b · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT UAT · soft/ATT-08=ATT-09 · CFG=ATT-02 · invent ASSIGN / `att_leave_hold` / `ensureDefaultWorkSite` / SITE-UNKNOWN/OVERLAP DONE |

```text
  FE «Điểm GPS / Chấm GPS» (U65 residual · J-HRM-ATT-03D-01..06)
        │  Network MUST contain /api/hrm/attendance/work-sites*
        │                  + /api/hrm/attendance/records
        │  DENY Nest /core/* geofence SoT
        │  DENY gps_locations sole SoT write · ensureDefaultWorkSite · seed
        │  DENY second geofence · invent att_leave_hold · invent ASSIGN DONE
        │  DENY invent SITE-UNKNOWN/OVERLAP DONE · invent PAY/printable
        │  DENY claim PLT WS alone = ATT-03d DONE · residual/thin=ATT-03b DONE
        │  DENY claim catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT UAT
        ▼
  F-ATT-CAT-WS-01/02 (RETAIN)
        GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*
        Paper /att/work-sites + /core/… = ALIAS ONLY
        → Diễn biến #1–#2 · ≠ FR-03d DONE alone · ≠ PLT WS alone DONE
        │
  F-ATT-PUNCH-01 (RETAIN peer)
        POST /api/hrm/attendance/records · assertWithinWorkSite
        → GEO-001 / GEO-REQ · empty active skip
        → Diễn biến #3–#6 · ≠ ATT-03d DONE alone
        │
  Residual wire (prefer FE-derive — NO schema ADD)
        DISP    statusLabelVi? from active · optional thin BE ONLY if FE proves
        OVERLAP / SITE / MOB = HOLD
        │
  Display-ready (RETAIN cite)
        id · companyId · name · address? · latitude · longitude ·
        radiusMeters · active · statusLabelVi? (FE-derive) · createdAt · updatedAt?
        Punch peer: record_id · late_minutes? · status? · geo ok|GEO-001|GEO-REQ
        │
  Unlock (prefer FE+QA on LIVE CAT+PUNCH · Dev-BE HOLD)
        FE Settings GPS Nest bind · punch CNS · Nest /core 0 · F5 · U65
        │
        └─► must_keep ATT03BQC1-MSM0891H ≠ residual/thin=DONE ·
              ATT01QC1-MSLZ3KIM ≠ catalog=DONE · R-ATT-01-ASSIGN open ·
              ATT11QC1-MSLXTH9P ≠ LIVE=DONE · ATT10QC1-MSLWGUYH ≠ AGG=DONE ·
              ATT09QC1-MSLUTL9D DENY att_leave_hold · ATT08QC1-MSLSL36C ·
              ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU ·
              CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
              CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY ·
              ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE ·
              C-SLICE · honesty false · PAY OUT
```

**Invariant ATT-03D-PATH (O9):** Geofence / punch Network **MUST** hit physical `/api/hrm/attendance/*` — Nest dual `/core` SoT = **FAIL**.

**Invariant ATT-03D-≠-PLT (O1/O12):** Claim PLT WS GWC / CNS-05 / thin work-sites CRUD alone = FR-UC-BP-ATT-03d / ATT-03d DONE = **FAIL**.

**Invariant ATT-03D-SOT (O1 · ADR D3):** Settings/`gps_locations` sole SoT write = **FAIL** · second geofence table = **FAIL**.

**Invariant ATT-03D-GEO (O4):** Active>0 + GPS enforce + OOS → **`HRM-ATT-GEO-001`** · missing lat/lon → **`HRM-ATT-GEO-REQ`** · silent 2xx = **FAIL**.

**Invariant ATT-03D-EMPTY (O5):** active=0 without CTA / with `ensureDefaultWorkSite` or seed = **FAIL** U65.

**Invariant ATT-03D-≠-03B (O10):** Claim residual/thin = ATT-03b DONE = **FAIL**.

**Invariant ATT-03D-≠-CAT01 (O10):** Claim catalog = ATT-01 DONE · invent ASSIGN DONE = **FAIL** · R-ATT-01-ASSIGN **open**.

**Invariant ATT-03D-≠-LIVE11 (O10):** Claim LIVE sign/close = ATT-11 DONE = **FAIL**.

**Invariant ATT-03D-≠-AGG10 (O10):** Claim AGG = ATT-10 DONE = **FAIL**.

**Invariant ATT-03D-HOLD (O10):** Invent `att_leave_hold` dual = **FAIL**.

**Invariant ATT-03D-SITE/OVERLAP (O7/O8):** Invent SITE-UNKNOWN FAIL / OVERLAP warn as GĐ1 DONE = **FAIL**.

**Invariant ATT-03D-≠-UAT (O12):** Claim ATT module UAT / flip `attendance_uat_ready` = **FAIL**.

**Invariant ATT-03D-≠-PRINTABLE / PAY-OUT (O11):** Invent PAY/printable/Word DONE = **FAIL**.

**Invariant ATT-03D-U19:** work-sites list **=** get-by-id **=** create/patch/soft **same** `resolveHrmListScope` family as punch records — OOS → **`HRM-SCOPE-409`**.

**Invariant ATT-03D-DATA-HOLD:** LIVE spines **HOLD RETAIN** · **NO** residual ADD schema this wave · DISP = FE-derive · **DENY** Nest `/core` · **DENY** second geofence.

**Invariant ATT-03D-NO-SEED (O5/O12):** Seed / `ensureDefaultWorkSite` for UF = **FAIL** U65.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-03d DONE** · PLT WS / CNS-05 ≠ FR-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · R-ATT-01-ASSIGN **open** · DENY invent ASSIGN · DENY invent `att_leave_hold` · DENY Nest `/core` · DENY `gps_locations` sole SoT · DENY `ensureDefaultWorkSite` · DENY second geofence · OVERLAP/SITE/MOB HOLD · must_keep ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P · no seed · no apps/**

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE (read-only cite 2026-08-09) | Gap vs F.1 this seat |
|---------|----------------------------------|----------------------|
| `GET/POST/PATCH/DELETE …/work-sites*` | LIVE · `AttendanceConfigService` · CRUD + soft-retire | **RETAIN** · **≠** FR-03d DONE alone · **≠** PLT WS alone DONE |
| `attendance_work_sites` | `id`·`company_id TEXT`·`name`·`address`·lat/lon·`radius_meters`·`active`·`created_at` | **RETAIN** · `site_code`/`archived_at`/`updated_at` **ABSENT HOLD** — **NO ADD** |
| `mapWorkSite` | `{ id, company_id, name, address, latitude, longitude, radius, radius_meters, active, created_at }` | **RETAIN spine** · `statusLabelVi` **ABSENT** → **FE-derive HOLD** |
| `assertWithinWorkSite` | Query active · GEO-001 / GEO-REQ | **RETAIN cite** · ≠ ATT-03d DONE alone |
| `ensureDefaultWorkSite` | Removed from punch path | **ABSENT LIVE** · **DENY** reintroduce |
| Empty active skip | PRESENT | **RETAIN** · CTA FE residual |
| Soft-retire `active=false` | PRESENT | **RETAIN** |
| FE Settings GPS Nest bind | PRESENT (PLT CNS-05 cite) | **RETAIN + AC** · ≠ PLT=FR-03d DONE |
| Nest `@Controller('core')` | **ABSENT** · CoreModule = DB export only | **DENY invent** |
| Second geofence / `att_gps_point*` | **ABSENT** | **DENY invent** |
| `gps_locations` sole write | Deprecated ADR D3 | **DENY sole SoT** |
| Overlap warn / SITE-UNKNOWN | ABSENT / HOLD | **HOLD** · DENY invent DONE |
| `att_leave_hold` | **ABSENT** | **DENY invent** (ATT-09 pending_days) |
| PLT WS / CNS-05 | `ATTWSQA-MSJC3IN9` · `ATTWSQA2-MSJCG47P` | **RETAIN cite** · **≠** ATT-03d DONE |
| ATT-03b..CORE peers | SEALED stamps | **must_keep** · **DENY wipe** |
| Source cite | `attendance-config.service.ts` · `attendance.service.ts` · controller | Docs-only this seat |

**FORBIDDEN invent this seat (docs):** Nest `@Controller('core')` · second geofence table · `gps_locations` sole SoT · `ensureDefaultWorkSite` · invent `att_leave_hold` · invent ASSIGN DONE · invent SITE-UNKNOWN/OVERLAP DONE · invent PAY/printable/Word DONE · wipe LIVE work-sites / ATT-03b/01/11/10/09/08/02/PLT/CORE · claim PLT WS=ATT-03d DONE · claim residual/thin=ATT-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT UAT · claim CFG=ATT-02 DONE · claim soft/ATT-08=ATT-09 DONE · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-*.

---

## 3. Path & alias lock (O1/O9)

| Plane | Path |
|-------|------|
| **PHYSICAL LIST/GET (F-ATT-CAT-WS-01)** | **`GET /api/hrm/attendance/work-sites`** · **`GET …/work-sites/:siteId`** |
| **PHYSICAL MUTATE (F-ATT-CAT-WS-02)** | **`POST/PATCH/DELETE …/work-sites*`** (soft prefer `active=false`) |
| **PHYSICAL PUNCH (F-ATT-PUNCH-01)** | **`POST /api/hrm/attendance/records`** |
| **PHYSICAL peer GATE** | **`GET/PATCH …/attendance/rules`** (`gps_enabled` · ≠ ATT-02 DONE) |
| **LOGICAL (paper)** | `/api/hrm/att/work-sites*` · `/api/hrm/att/records` · `/api/hrm/core/…` — **alias only** |
| Rule | Client/docs **may** keep paper names; runtime **physical only**. |
| QA Network assert | Path **contains** `/attendance/work-sites` and/or `/attendance/records` — **FAIL O9** if FE hits Nest `/core/*` as geofence SoT |

| Paper / logical | Physical | DB (DATA-01) |
|-----------------|----------|--------------|
| F-ATT-CAT-WS-01/02 `/att/work-sites*` | **`…/attendance/work-sites*`** | LIVE `attendance_work_sites` RETAIN · **NO ADD** |
| F-ATT-PUNCH-01 `/att/records` | **`…/attendance/records`** | `assertWithinWorkSite` on active rows |
| Soft-retire | PATCH/DELETE soft | LIVE `active` |
| `statusLabelVi` | same response deepen? | **FE-derive** from `active` · no col |
| SITE-UNKNOWN / OVERLAP | — | **HOLD** |
| Nest `/core` | — | **DENY invent** |
| Paper held / `att_leave_hold` | LIVE **`pending_days`** (ATT-09) | **must_keep** · **DENY dual** |

**Prefer rule (normative):** Dev **MUST NOT** invent Nest `@Controller('core')`, second geofence table, `gps_locations` sole SoT, `ensureDefaultWorkSite`, `att_leave_hold`, or SITE-UNKNOWN/OVERLAP as GĐ1 DONE. Physical remain under **`@Controller('attendance')`**.

---

## 4. F.1 RETAIN cite — F-ATT-CAT-WS-01/02 · F-ATT-PUNCH-01

### 4.1 F-ATT-CAT-WS-01 — List / GET điểm GPS (RETAIN)

| | |
|--|--|
| **Function ID** | **F-ATT-CAT-WS-01** |
| **METHOD / path (physical)** | **`GET /api/hrm/attendance/work-sites`** · **`GET …/work-sites/:siteId`** |
| **Paper alias** | `GET /api/hrm/att/work-sites*` · `/api/hrm/core/…` **alias only** |
| **Mục đích** | Danh mục điểm GPS / vùng chấm Nest (Cài đặt chấm công · đối chiếu admin) — display-ready; **SoT** geofence khi còn điểm active. |
| **Nghiệp vụ xử lý** | `resolveHrmListScope` list↔get **parity** · mặc định `active=true` (ẩn đã ngừng trừ `include_inactive`) · empty **200[]** + CTA admin · **cấm** seed / `ensureDefaultWorkSite` · **cấm** `gps_locations` sole SoT · Nest `/core` SoT = **FAIL**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-03d** Diễn biến **#1** · **BR-BP-GPS-01** · AC-ATT-03D-SOT/PATH/ADMIN |
| **Request → DB** | Read LIVE `attendance_work_sites` |
| **Response (display-ready)** | See §5.1 — `statusLabelVi?` FE-derive OK |
| **Lỗi** | Scope **`HRM-SCOPE-409`** · **`HRM-ATT-SITE-404`** OOS · empty list **không** 404 |
| **≠ DONE** | Thin list alone ≠ ATT-03d / FR-03d DONE · PLT WS alone ≠ DONE |

### 4.2 F-ATT-CAT-WS-02 — Create / patch / soft-retire (RETAIN)

| | |
|--|--|
| **Function ID** | **F-ATT-CAT-WS-02** |
| **METHOD / path (physical)** | **`POST /api/hrm/attendance/work-sites`** · **`PATCH …/:siteId`** · **`DELETE …/:siteId`** (hard residual; **ưu tiên** soft) |
| **Paper alias** | paper `/att` + `/core` **alias only** |
| **Mục đích** | **Catalog admin — mở N+1:** HCNS thêm/sửa/ngừng điểm (tên · lat · lon · bán kính). **Khác** consumer geofence. |
| **Nghiệp vụ xử lý** | Validate coords/radius → **`HRM-ATT-SITE-VAL`** · tạo **201** · F5 còn · soft-retire **`active=false`** (ẩn geofence / list mặc định; lịch sử punch còn) · **cấm** áp **`HRM-ATT-GEO-001`** lên admin CREATE · Nest `/core` = **FAIL**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-03d** Diễn biến **#1–#2** · AC-ATT-03D-ADMIN/SOFT/F5 |
| **Request → DB** | → LIVE `attendance_work_sites` |
| **Lỗi** | `HRM-ATT-SITE-VAL` · `HRM-ATT-SITE-404` · `HRM-VAL-400` · scope |
| **≠ DONE** | Admin CRUD alone ≠ ATT-03d DONE · ≠ invent SITE-UNKNOWN DONE |

### 4.3 F-ATT-PUNCH-01 — Create attendance record · geofence (RETAIN peer)

| | |
|--|--|
| **Function ID** | **F-ATT-PUNCH-01** |
| **METHOD / path (physical)** | **`POST /api/hrm/attendance/records`** |
| **Paper alias** | `POST /api/hrm/att/records` · `/core/…` **alias only** |
| **Mục đích** | Thu nhận điểm danh — **consumer** danh mục điểm GPS Nest khi GPS enforce. |
| **Nghiệp vụ xử lý** | GPS bật **và** active≥1: phương thức GPS **phải** gửi lat/lon số · ∈ ≥1 bán kính active — OOS → **`HRM-ATT-GEO-001`** · thiếu lat/lon → **`HRM-ATT-GEO-REQ`** (**cấm** im lặng 2xx) · active=0 → **skip** assert · **cấm** `ensureDefaultWorkSite` / seed · SoT = **F-ATT-CAT-WS** — **cấm** `gps_locations` sole · Nest `/core` = **FAIL**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-03d** Diễn biến **#3–#6** · AC-ATT-03D-CNS-IN / GEO-001 / GEO-REQ / EMPTY · cite CNS-05 |
| **Request → DB** | → `attendance_records` (+ assert on `attendance_work_sites` active) |
| **Response** | `{ record_id, late_minutes?, status?, … }` — peer cite |
| **Lỗi** | **`HRM-ATT-GEO-001`** · **`HRM-ATT-GEO-REQ`** · (+ peer CODE-KEY / sheet-locked outside this seat) |
| **≠ DONE** | Punch GEO alone ≠ ATT-03d DONE · CNS-05 alone ≠ FR-03d DONE |

### 4.4 Residual DISP (wire-only · closable FE-first)

| Residual | Contract | Unlock |
|----------|----------|--------|
| **R-ATT-03D-DISP** | `statusLabelVi?` derive from `active` · labels VI *Đang hiệu lực* / *Ngừng* · **NO** col invent (DATA HOLD) | **Prefer FE-derive** · optional thin BE enrich **ONLY if** FE proves envelope gap → separate BE-01 |
| **R-ATT-03D-OVERLAP** | — | **HOLD** · DENY invent DONE |
| **R-ATT-03D-SITE** | `HRM-ATT-SITE-UNKNOWN` | **HOLD** · DENY invent FAIL GĐ1 |
| **R-ATT-03D-MOB** | Face/mobile GPS | **HOLD** cite · ≠ invent SoT DONE |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03d DONE** · Nest `/core` DENY · C-SLICE

---

## 5. Display-ready DTO (normative cite)

### 5.1 Work-site (F-ATT-CAT-WS)

| Field | Source | GĐ1 note |
|-------|--------|----------|
| `id` | LIVE id | RETAIN |
| `companyId` | LIVE company_id TEXT | U19 same resolver |
| `name` | LIVE name | RETAIN |
| `address?` | LIVE address | RETAIN |
| `latitude` / `longitude` | LIVE | RETAIN |
| `radiusMeters` | LIVE radius_meters | RETAIN (`radius` alias OK) |
| `active` | LIVE active | RETAIN soft-retire SoT |
| `statusLabelVi?` | **FE-derive** from `active` | HOLD deepen · **no** col invent · optional BE **ONLY if** proven |
| `createdAt` | LIVE created_at | RETAIN |
| `updatedAt?` | optional | HOLD omit · **no** invent col as DONE |

**DENY invent:** `site_code` in response as GĐ1 DONE · claim DISP alone = FR-03d DONE.

### 5.2 Punch geofence peer (F-ATT-PUNCH-01)

| Field / outcome | Source | GĐ1 note |
|-----------------|--------|----------|
| Record **2xx** in-radius | LIVE assert | RETAIN cite · ≠ ATT-03d DONE alone |
| **`HRM-ATT-GEO-001`** | OOS | RETAIN cite |
| **`HRM-ATT-GEO-REQ`** | missing lat/lon | RETAIN cite · FAIL silent 2xx |
| Empty active skip | LIVE | RETAIN · DENY ensureDefault |
| Response `{ record_id, late_minutes?, status?, … }` | paper F-ATT-PUNCH-01 | peer cite only |

---

## 6. Validation / error mapping (RETAIN + HOLD)

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

## 7. Scope parity (U19)

| Surface | Filter |
|---------|--------|
| List work-sites | `resolveHrmListScope` / expand TEXT company keys · default `active=TRUE` |
| GET by id | `assertResourceInHrmScope` same family |
| Create / patch / soft-retire | same persist company_id TEXT |
| Punch assert | active sites under same company scope family |

**Invariant ATT-03D-SCOPE-U19:** work-sites list **=** get-by-id **=** create/patch/soft **same** hrm list-scope family as punch records — **scope_parity** FAIL if list returns id but detail 404 under group CEO `main`.

**Journey cite (DRAFT):** **J-HRM-ATT-03D-01..06** — admin · soft · in-radius · GEO-001 · GEO-REQ · empty+seals — **≠** ATT module UAT.

---

## 8. unlock_lane (clear)

```text
DATA-01 CONFIRMED HOLD (NO ADD schema) · BA O1–O12 · SA Option A
  → THIS SEAT: sa API-01 F.1 RETAIN F-ATT-CAT-WS-01/02 + F-ATT-PUNCH-01 CONFIRMED
  → Prefer Dev-FE + QA on LIVE CAT + PUNCH (U65 J-HRM-ATT-03D-01..06 DRAFT)
  → Dev-BE HOLD invent (Nest /core · second geofence · ensureDefault · att_leave_hold · ASSIGN · SITE-UNKNOWN/OVERLAP DONE)
  → Optional thin BE statusLabelVi ONLY if FE proves DISP envelope gap (separate BE-01)
  → QC GWC C-SLICE later (≠ ATT-03d module UAT · ≠ PLT WS alone DONE · printable false · PAY OUT)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This F.1 CONFIRMED RETAIN | sa | Spec path + PASS_TO_PM |
| 2. FE bind Settings GPS + punch CNS on LIVE | dev-fe | READY_FOR_QA |
| 3. QA U65 J-HRM-ATT-03D-* browser | qa | PASS_TO_PM |
| 4. Optional thin BE DISP | dev-be | **ONLY if** FE proves gap · else **HOLD** |
| 5. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip |

**Closable BE for CAT+PUNCH?** **NO** — spine **LIVE PRESENT**.  
**Dev-BE invent?** **HOLD** unless closable thin DISP gap proven by FE.

---

## 9. must_keep / DENY checklist

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
| OVERLAP/SITE/MOB | **HOLD** · DENY invent DONE |
| PAY / printable | **OUT invent DONE** · printable false |
| apps/** / seed | **CẤM** this seat |
| Honesty | **DENY** flip · **C-SLICE** |

---

## 10. Traceability (BRD/SRS → API → DB → FE → Test)

| Requirement | API | DB | FE | Test expect |
|-------------|-----|----|----|-------------|
| FR-UC-BP-ATT-03d Diễn biến #1 | F-ATT-CAT-WS-01/02 physical work-sites* | LIVE `attendance_work_sites` RETAIN | Settings GPS Nest bind HDSD CH05b | J-HRM-ATT-03D-01 DRAFT · Nest `/core` 0 · ≠ PLT=DONE |
| Soft-retire #2 | PATCH/DELETE soft `active=false` | LIVE `active` | Hide list/geofence | J-02 |
| In-radius #3 | F-ATT-PUNCH-01 | assert active radii | Punch 2xx · F5 | J-03 · ≠ ATT-03d DONE alone |
| OOS #4 | GEO-001 | same | Reject | J-04 |
| Missing lat/lon #5 | GEO-REQ | same | FAIL silent 2xx | J-05 |
| Empty #6 | skip + CTA | active=0 | DENY ensureDefault/seed | J-06 |
| OVERLAP/SITE/MOB | HOLD | no invent | footer HOLD | O7–O11 |
| DISP | wire statusLabelVi | derive `active` | VI labels FE-first | J-01 · no col invent |
| U19 scope | same resolver | company_id TEXT | — | J-06 · 409 |
| ≠DONE / seals | — | must_keep | Footer honesty | J-06 · VAL-ATT-03D-06 |

---

## 11. completion_report

**Closed:** SA API F.1 **CONFIRMED RETAIN** for UC-BP-ATT-03d / FR-UC-BP-ATT-03d — cite **F-ATT-CAT-WS-01/02** physical `GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*` → LIVE `attendance_work_sites` (**ADR D3** ONE GPS SoT) · **F-ATT-PUNCH-01** physical `POST …/attendance/records` · **`HRM-ATT-GEO-001`** / **`HRM-ATT-GEO-REQ`** · empty active skip · soft-retire `active=false` · paper `/att`+`/core` **alias only** · Nest `@Controller('core')` **DENY** · **DENY** second geofence · **DENY** `gps_locations` sole SoT · **DENY** `ensureDefaultWorkSite` · **DENY** invent `att_leave_hold` · **DENY** invent ASSIGN DONE · **DENY** invent SITE-UNKNOWN/OVERLAP DONE; residual wire **ONLY** closable DISP `statusLabelVi` **FE-derive** from `active` (DATA **NO** ADD schema); display-ready work-site + punch peer DTO cited; U19 list=get=mutate; must_keep ATT03BQC1-MSM0891H (**≠ residual/thin=ATT-03b DONE**) · ATT01QC1-MSLZ3KIM (**≠ catalog=ATT-01 DONE** · **R-ATT-01-ASSIGN open**) · ATT11QC1-MSLXTH9P (**≠ LIVE=ATT-11 DONE**) · ATT10QC1-MSLWGUYH (**≠ AGG=ATT-10 DONE**) · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P (**≠ ATT-03d DONE**); closable BE for CAT+PUNCH **NOT required** (LIVE PRESENT) → unlock **prefer FE+QA**; **Dev-BE HOLD** invent · optional thin BE **ONLY if** FE proves DISP gap; **PAY OUT** · printable **false** · **C-SLICE** · apps/** untouched · no seed.

**Residual open (execution):** R-ATT-03D-ADMIN/CNS/SOFT/EMPTY/GATE/DISP via U65 **J-HRM-ATT-03D-01..06 DRAFT** — FE bind + QA browser on LIVE CAT+PUNCH · BE optional thin **ONLY if** FE proves envelope gap. OVERLAP/SITE/MOB remain **HOLD**. **R-ATT-01-ASSIGN** remains **open** (peer). Explicit **≠ ATT-03d DONE · ≠ PLT WS alone=ATT-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT · honesty false**.

**next_owner:** **dev-fe** (+ **qa** parallel) — **Dev-BE HOLD** unless FE proves closable DISP thin gap.

---

## 12. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01 (+ QA-01 parallel)
role: dev-fe (+ qa)
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-32 seat #34)
entry_criteria: API-01 CONFIRMED RETAIN @ docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01.md · DATA-01 HOLD (NO ADD schema · DISP FE-derive) · BA O1–O12 · SA Option A · unlock_lane FE+QA on LIVE CAT+PUNCH · Dev-BE HOLD invent · OVERLAP/SITE/MOB HOLD · must_keep ATT03BQC1-MSM0891H (≠ residual/thin=ATT-03b DONE) · ATT01QC1-MSLZ3KIM (≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN · Nest /core 0) · ATT11QC1-MSLXTH9P (≠ LIVE=ATT-11 DONE) · ATT10QC1-MSLWGUYH (≠ AGG=ATT-10 DONE) · ATT09QC1-MSLUTL9D (pending_days · DENY att_leave_hold) · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P (≠ claim = ATT-03d DONE) · ≠ ATT UAT · PAY OUT · printable false · ≠ PLT WS alone = ATT-03d DONE
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01.md (F.1 F-ATT-CAT-WS-01/02 · F-ATT-PUNCH-01 · DISP FE-derive · unlock FE+QA · Dev-BE HOLD)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md (AC-ATT-03D-* · J-HRM-ATT-03D-01..06 DRAFT · HDSD CH05b)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01.md (attendance_work_sites HOLD · NO ADD · DENY gps_locations sole · DENY ensureDefaultWorkSite)
  - docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md (D3)
  - docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md
exit_criteria:
  - FE: bind Settings GPS / Điểm GPS trên LIVE Nest — Network GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites* · punch POST …/attendance/records; display-ready id·name·lat·lon·radiusMeters·active·statusLabelVi(FE-derive from active); soft-retire active=false ẩn list/geofence; empty active → CTA · no ensureDefault/seed; Nest /core 0; DENY gps_locations sole SoT write
  - QA U65: J-HRM-ATT-03D-01..06 DRAFT browser (admin CRUD · soft · in-radius · GEO-001 · GEO-REQ · empty+seals · Nest /core 0 · F5 · zero-seed) — FAIL if Nest /core SoT · gps_locations sole · ensureDefault/seed · invent att_leave_hold · invent ASSIGN DONE · invent SITE-UNKNOWN/OVERLAP DONE · claim PLT WS alone = ATT-03d DONE · residual/thin=ATT-03b DONE · catalog=ATT-01 DONE · LIVE=ATT-11 DONE · AGG=ATT-10 DONE · invent PAY/printable DONE · claim ATT UAT · CFG=ATT-02 DONE
  - Explicit ≠ ATT-03d DONE · ≠ PLT WS alone=ATT-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT · R-ATT-01-ASSIGN open · OVERLAP/SITE/MOB HOLD
  - Dev-BE: HOLD invent Nest /core · second geofence · ensureDefault · att_leave_hold · ASSIGN · SITE-UNKNOWN/OVERLAP DONE — optional thin statusLabelVi ONLY if FE proves DISP envelope gap (then separate BE-01) — DENY claim PLT WS / thin CRUD = ATT-03d DONE
  - evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-fe-01.md (+ qa-01)
  - ack_status READY_FOR_QA / PASS_TO_PM
cấm: apps/** invent Nest /core · invent att_leave_hold dual · invent second geofence · gps_locations sole SoT · ensureDefaultWorkSite · invent ASSIGN DONE · invent SITE-UNKNOWN/OVERLAP DONE · invent PAY/printable/Word DONE · wipe ATT-03b/01/11/10/09/08/02/PLT/CORE · seed · honesty flip · claim PLT WS=ATT-03d DONE · claim residual/thin=ATT-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE
```

---

*End API-01 · CONFIRMED RETAIN · unlock FE+QA (CAT+PUNCH) · Dev-BE HOLD · ≠ ATT-03d DONE · 2026-08-09*
