# PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01 — Option/F.1 · Danh mục điểm GPS (vùng hợp lệ) — RETAIN Nest work-sites + gap AC

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe ATT-03b HOL · **DENY** wipe ATT-01 CAT/CNS · **DENY** invent ASSIGN DONE · **DENY** wipe ATT-11/10/09/08/02/PLT/CORE · **DENY** invent `att_leave_hold` dual · **DENY** invent PAY/printable DONE · **DENY** honesty flip · **DENY** claim PLT worksite GWC alone = ATT-03d DONE · **DENY** claim ATT module UAT · **DENY** Settings/`gps_locations` sole SoT · **DENY** second geofence table · **C-SLICE** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD) → API/FE/BE residual only after contracts · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-31 UC-BP-ATT-03b **SEALED** — stamp **`ATT03BQC1-MSM0891H`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-qc-01.md` · QA **`ATT03BQA1-MSM0524Y`** · **≠ residual/thin=ATT-03b DONE** · **must_keep** `ATT01QC1-MSLZ3KIM` (**≠ catalog=ATT-01 DONE** · **R-ATT-01-ASSIGN open**) · `ATT11QC1-MSLXTH9P` (**≠ LIVE=ATT-11 DONE**) · `ATT10QC1-MSLWGUYH` (**≠ AGG=ATT-10 DONE**) · `ATT09QC1-MSLUTL9D` · `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` (**printable false**) · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 · Nest `/core` **ABSENT** · **≠ ATT UAT** · PAY invent DONE **OUT** · printable **false** · DENY invent `att_leave_hold` · peer PLT worksite seals **`ATTWSQA-MSJC3IN9`** · CNS-05 **`ATTWSQA2-MSJCG47P`** **RETAIN** (**≠** claim = ATT-03d DONE) |
| **uc_ids** | `UC-BP-ATT-03d` · `FR-UC-BP-ATT-03d` · **BR-BP-GPS-01** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#34** after ATT-03b (#33 SEALED GWC) · PAY remain **QUEUED** · PAY OUT invent DONE |
| **ref_sa_spine** | ATT-03b [`PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md) · peer PLT [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md) (Nest SoT Option B ≡ continuous Option A RETAIN) · ATT-01/11/10/09/08/02/PLT/CORE seals · honesty packs **RETAIN false** — **DENY reopen sealed J-HRM-ATT-03B / ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06 without regression** · **DENY reopen** PLT worksite QC-01/02 seals as invent ATT-03d DONE |
| **ref_honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR module UAT **false** · product_go **false** · **DENY claim PLT worksite / CNS-05 alone = ATT-03d DONE** · **DENY claim residual/thin=ATT-03b DONE** · **DENY claim catalog=ATT-01 DONE** · **DENY claim LIVE=ATT-11 DONE** · **DENY claim AGG=ATT-10 DONE** · **DENY invent PAY/printable DONE** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-03d** · Diễn biến **#1–#6 + Thành công** · **BR-BP-GPS-01** · peer punch / Face mobile-only |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` § ATT · matrix F-ATT-* · geofence cite work-sites |
| **ref_adr** | [`ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D3** geofence SoT = `attendance_work_sites` · Nest physical prefer `/api/hrm/attendance/work-sites*` + punch `/records` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual · **DENY** `gps_locations` JSON sole SoT · **DENY** `ensureDefaultWorkSite` seed |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-CAT-WS-01/02** · **F-ATT-PUNCH-01** · errors **`HRM-ATT-GEO-001`** · **`HRM-ATT-GEO-REQ`** · **`HRM-ATT-SITE-VAL`** · **`HRM-ATT-SITE-404`** · **`HRM-ATT-SITE-UNKNOWN` HOLD** · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `public.attendance_work_sites` (§4.4c DB_DESIGN · ATT-WORKSITE-CATALOG-DATA-01 HOLD no second table) · Nest `@Controller('core')` **ABSENT** |
| **ref_code** | `attendance-config.service` work-sites CRUD + list active filter + soft-retire · `attendance.service` `assertWithinWorkSite` · `attendance.controller` `work-sites*` · FE `useAttendanceRules` + Attendance GPS card · **read-only cite** · CoreModule = DB export only |
| **ref_hdsd** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md` (U76 inventory for BA/QA) |
| **OUT** | Nest `/core` dual · wipe ATT-03b/01/11/10/09/08/02/PLT/CORE · invent ASSIGN DONE · invent `att_leave_hold` · invent PAY/printable DONE · Settings/`gps_locations` sole SoT · second geofence mega-table · `ensureDefaultWorkSite` seed · claim PLT WS GWC = ATT-03d DONE · claim ATT module UAT · reopen sealed peers · honesty flip · apps/** this seat · invent SITE-UNKNOWN FAIL as GĐ1 DONE · invent mobile Face as GPS SoT |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-32 architecture unlock: **Danh mục điểm GPS chấm công (vùng hợp lệ)** (FR-UC-BP-ATT-03d · BR-BP-GPS-01) vs AS-IS LIVE Nest geofence catalog (**F-ATT-CAT-WS-01/02** + **F-ATT-PUNCH-01**) — **gap-only** under U89 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U89 after ATT-03b QC-01 GWC (`ATT03BQC1-MSM0891H`) · U88 continuous |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-03d · BR-BP-GPS-01 · F-ATT-CAT-WS-01/02 · F-ATT-PUNCH-01 · ADR D3 · peer AC-PLT-ATT-WORKSITE-01* seals · must_keep ATT-03b/01/11/10/09/08/02/PLT/CORE · Nest `/core` DENY · U19 · soft≠CORE-06 · PAY OUT · printable false · ≠ ATT UAT · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · R-ATT-01-ASSIGN open |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-03b SEALED (`ATT03BQC1-MSM0891H`):** holiday residual CRUD · midYear · HOL-MISS · Nest `/core` **0** · **≠ residual/thin=ATT-03b DONE** · must_keep ATT-01/11/10/09/08/02/PLT/CORE · R-ATT-01-ASSIGN **open** · ≠ ATT UAT · PAY OUT · printable **false**. **GPS / geofence spine AS-IS (PRESENT — RETAIN cite · ≠ ATT-03d DONE):** (1) Nest physical `GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*` → `public.attendance_work_sites` (**F-ATT-CAT-WS-01/02** · ADR **D3** SoT). (2) Punch `POST …/attendance/records` assert ∈ active radii → **`HRM-ATT-GEO-001`**; GPS method omit lat/lon + active>0 → **`HRM-ATT-GEO-REQ`**; active=0 → **skip** assert (no seed default site). (3) Soft-retire prefer `active=false`; list default active unless `include_inactive`. (4) FE Settings GPS card binds Nest work-sites (**not** PATCH `gps_locations` JSON as SoT). (5) Peer PLT seals **`ATTWSQA-MSJC3IN9`** + CNS-05 FE wire **`ATTWSQA2-MSJCG47P` CLOSED** — **RETAIN** · **≠** invent = FR-03d / ATT UAT DONE. Nest `@Controller('core')` **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-03d: CRUD điểm GPS (tên · lat · lon · bán kính · hiệu lực); admin mở N+1; khi còn điểm active thì chấm GPS chỉ hợp lệ trong vùng; ngừng → ẩn khỏi kiểm tra; empty active → bỏ qua kiểm vùng + CTA thêm điểm — **không** tự tạo điểm giả; thiếu tọa độ trên phương thức GPS khi enforce → từ chối; SoT = danh mục điểm chuẩn — **không** Settings/`gps_locations` thay thế khi Nest đã có phần tử. BR-BP-GPS-01. Thành công ≠ nghiệm thu toàn module ATT. |
| **Gap class** | **GĐ1 continuous AC pack + residual display/overlap/SITE-UNKNOWN/mobile cite** on LIVE Nest work-sites + punch geofence — **not** greenfield Nest `/core`; **not** claim PLT worksite GWC = FR-03d DONE; **not** wipe ATT-03b HOL; **not** invent PAY/printable/`att_leave_hold`/ASSIGN DONE; **not** reopen ATT-03b..CORE seals. |
| **Constraints** | U89 continuous · **preserve** ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · **DENY** honesty flip · **DENY** invent PAY/printable DONE · **DENY** claim ATT module UAT · **DENY** invent ASSIGN DONE · **DENY** invent `att_leave_hold` · **DENY** reopen PLT WS as ATT-03d DONE |
| **Failure impact if unresolved** | Board #34 stalls or Dev invents Nest `/core` / second geofence SoT / `gps_locations` sole SoT; false claim PLT WS GWC = ATT-03d DONE; wipe ATT-03b HOL; invent SITE-UNKNOWN/Face DONE; invent PAY early |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-ATT-03b + ATT-01 + ATT-11 + ATT-10 + ATT-09 + ATT-08 + ATT-02 + PLT + CORE-* (SEALED must_keep)
  Nest /core DENY · printable false · C-SLICE · honesty false · PAY OUT
  ATT-03b: HOL residual RETAIN · ≠ residual/thin=ATT-03b DONE
  ATT-01: CAT/CNS RETAIN · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open
  ATT-11: sign/close RETAIN · ≠ LIVE=ATT-11 DONE
  ATT-10: AGG RETAIN · ≠ AGG=ATT-10 DONE
  Peer PLT WS: ATTWSQA-MSJC3IN9 + CNS-05 ATTWSQA2-MSJCG47P RETAIN · ≠ ATT-03d DONE alone
       │
       │  must_keep RETAIN — DENY reopen J-HRM-ATT-03B / ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT / CORE-*
       │  must_keep ATT-09 pending_days · DENY att_leave_hold
       │  must_keep ATT-01 · DENY invent ASSIGN DONE
       ▼
  ┌────────────── FR-UC-BP-ATT-03d (this seat — gap-only RETAIN Nest WS + punch + AC residual) ─┐
  │                                                                                            │
  │  RETAIN LIVE (cite — ≠ ATT-03d DONE alone)                                                 │
  │    GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*                                   │
  │      → attendance_work_sites (F-ATT-CAT-WS-01/02 · ADR D3)                                 │
  │    POST …/attendance/records · assertWithinWorkSite                                        │
  │      → HRM-ATT-GEO-001 / HRM-ATT-GEO-REQ · empty active = skip                             │
  │    FE Settings GPS · useAttendanceRules Nest bind (no gps_locations SoT write)             │
  │    Soft-retire active=false · list default active · U19 resolveHrmListScope                │
  │                                                                                            │
  │  RESIDUAL unlock (BA → DATA/API — closable gap only)                                       │
  │    R-ATT-03D-ADMIN  : U65 admin CRUD AC + HDSD path (FR Diễn biến #1–#2)                   │
  │    R-ATT-03D-CNS    : punch geofence AC (cite LIVE + CNS-05 CLOSED — deepen ONLY if gap) │
  │    R-ATT-03D-SOFT   : soft-retire hide from geofence (cite LIVE deepen)                    │
  │    R-ATT-03D-EMPTY  : empty active skip + CTA · DENY ensureDefaultWorkSite                 │
  │    R-ATT-03D-GATE   : gps_enabled on rules gate (peer ATT-02 CFG≠DONE — cite XOR residual) │
  │    R-ATT-03D-OVERLAP: overlapping-radius warn (SRS optional) — HOLD GĐ1 unless BA opens    │
  │    R-ATT-03D-SITE   : site_code / HRM-ATT-SITE-UNKNOWN — HOLD (SRS «gắn mã điểm» tạm)      │
  │    R-ATT-03D-DISP   : display-ready id·name·lat·lon·radius·active·statusLabelVi            │
  │    R-ATT-03D-MOB    : mobile GPS punch — cite OOS XOR GĐ1 web-first explicit BA            │
  │    R-ATT-03D-≠DONE  : PLT WS GWC / CNS-05 alone ≠ FR-03d · ≠ ATT UAT                       │
  │    Prefer physical Nest under /api/hrm/attendance/*                                        │
  │    Paper F-ATT-CAT-WS / F-ATT-PUNCH /att + /core = ALIAS ONLY                              │
  │                                                                                            │
  │  PAY invent DONE = OUT · must_keep ATT-03b..CORE · Nest /core DENY · printable false       │
  └────────────────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  Nest /core dual ATT                        = DENY
  Wipe ATT-03b HOL / invent thin=ATT-03b DONE = DENY
  Wipe ATT-01 CAT/CNS / invent ASSIGN DONE   = DENY
  Wipe ATT-11 sign / ATT-10 AGG / ATT-09/08  = DENY
  Invent att_leave_hold second ledger        = DENY
  Invent PAY/printable DONE                  = DENY
  Settings / gps_locations sole SoT          = DENY
  Second geofence mega-table / seed default  = DENY
  Claim PLT WS GWC alone = ATT-03d DONE      = DENY
  Claim catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 DONE = DENY
  Claim Option alone = ATT module UAT        = DENY
  Flip personnel / printable / recruit       = DENY
  C-SLICE ≠ module ATT / PLT / CORE / PAY UAT

  Honesty: C-SLICE ≠ attendance_uat_ready · ≠ hrm_personnel_uat_ready
           ≠ contracts_printable_ready · ≠ product_go · ≠ invent PAY DONE
```

**Label lock:** Board «Danh mục điểm GPS chấm công (vùng hợp lệ) — ADD MVP» GĐ1 = **RETAIN cite LIVE Nest work-sites + punch geofence + FE GPS bind + PLT seals** + **gap AC / display / optional overlap / SITE-UNKNOWN HOLD** — **not** Nest `/core` dual; **not** PLT WS GWC alone = FR-03d DONE; **not** Option alone = ATT UAT.  
**Spine lock:** Physical prefer `/api/hrm/attendance/work-sites*` + `/records` · paper `/att/*` + `/core/…` = **alias only** — **DENY** Nest `/core` second SoT · **DENY** second geofence table · **DENY** `gps_locations` JSON sole SoT.  
**Honesty lock:** Slice GWC later **≠** auto-flip `attendance_uat_ready` · **≠** invent PAY/printable DONE · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Geofence SoT Nest | F-ATT-CAT-WS-01/02 · ADR D3 · `attendance_work_sites` | CRUD `work-sites*` **PRESENT** | **RETAIN cite** · **≠ ATT-03d DONE alone** |
| Admin CRUD N+1 | FR-03d Diễn biến #1–#2 · BR-PLT-05 | POST/PATCH + FE Settings GPS **PRESENT** | **RETAIN + residual AC** **R-ATT-03D-ADMIN** |
| Soft-retire hide | Diễn biến #2 · `active=false` | Soft DELETE path **PRESENT** (hard residual) | **RETAIN** **R-ATT-03D-SOFT** |
| Punch in-radius | Diễn biến #3 · F-ATT-PUNCH-01 | `assertWithinWorkSite` · GEO-001 **PRESENT** | **RETAIN cite** **R-ATT-03D-CNS** |
| Punch out-of-radius | Diễn biến #4 | **`HRM-ATT-GEO-001` PRESENT** | **RETAIN cite** |
| Punch missing lat/lon | Diễn biến #5 · GEO-REQ | **`HRM-ATT-GEO-REQ` PRESENT** · CNS-05 CLOSED | **RETAIN cite** · **≠** invent DONE alone |
| Empty active skip + CTA | Diễn biến #6 · ADR D3 | Skip assert + soft CTA **PRESENT** | **RETAIN** **R-ATT-03D-EMPTY** · DENY seed default |
| `gps_enabled` gate | SRS tiên quyết · rules | Rules `gps_enabled` **PRESENT** · ATT-02 CFG≠DONE peer | **RETAIN cite** **R-ATT-03D-GATE** · ≠ CFG=ATT-02 DONE |
| List default active | F-ATT-CAT-WS-01 | `include_inactive` deepen **PRESENT** | **RETAIN cite** |
| Overlap warning | SRS đặc biệt | **ABSENT** warn UI/API | **HOLD GĐ1** **R-ATT-03D-OVERLAP** unless BA opens |
| Site code / SITE-UNKNOWN | SRS «gắn mã điểm» tạm · API HOLD | **HOLD** | **HOLD** **R-ATT-03D-SITE** · DENY invent FAIL |
| Display-ready VI labels | program display-ready | Partial (name/coords) | **RESIDUAL** **R-ATT-03D-DISP** |
| Mobile GPS punch | SRS web/mobile | Peer J-MOB OOS / web proven CNS-05 | **RESIDUAL cite** **R-ATT-03D-MOB** (BA lock OOS XOR GĐ1 web-first) |
| `gps_locations` JSON | Deprecated ADR D3 | GET may embed · **no** SoT write | **DENY sole SoT** |
| Paper `/att` + `/core` | alias | Nest `@Controller('core')` **ABSENT** | **paper = alias only** |
| ATT-03b HOL | peer | SEALED `ATT03BQC1-MSM0891H` | **must_keep RETAIN** · ≠ residual/thin=DONE |
| ATT-01 CAT/CNS | peer | SEALED `ATT01QC1-MSLZ3KIM` · ASSIGN open | **must_keep RETAIN** · ≠ catalog=DONE · DENY invent ASSIGN DONE |
| ATT-11/10/09/08/02/PLT/CORE | peers | SEALED stamps | **must_keep RETAIN** · printable false · DENY `att_leave_hold` |
| PLT WS catalog GWC | peer AC-PLT-ATT-WORKSITE | `ATTWSQA-MSJC3IN9` + CNS-05 CLOSED | **RETAIN cite** · **≠ ATT-03d DONE** |
| PAY | OUT | QUEUED | **OUT invent DONE** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT-03d DONE** · **≠ ATT UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN Nest F-ATT-CAT-WS + F-ATT-PUNCH + gap AC (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE Nest `@Controller('attendance')` `work-sites*` → `attendance_work_sites` (**F-ATT-CAT-WS-01/02** · ADR **D3**), punch geofence (**F-ATT-PUNCH-01** · **`HRM-ATT-GEO-001`/`HRM-ATT-GEO-REQ`** · empty skip), FE Settings GPS Nest bind, soft-retire + list active filter, U19 scope. **RETAIN cite** peer PLT seals `ATTWSQA-MSJC3IN9` + CNS-05 `ATTWSQA2-MSJCG47P` — **≠** invent = ATT-03d DONE. Unlock BA residuals **R-ATT-03D-ADMIN/CNS/SOFT/EMPTY/GATE/OVERLAP(HOLD)/SITE(HOLD)/DISP/MOB/≠DONE** for FR-UC-BP-ATT-03d Diễn biến #1–#6 AC pack + mint **J-HRM-ATT-03D-***. Prefer physical Nest under `/api/hrm/attendance/*`; paper F-ATT-CAT-WS / F-ATT-PUNCH `/att` + `/core` = **alias only**. **must_keep** ATT03BQC1-MSM0891H (**≠ residual/thin=ATT-03b DONE**) · ATT01QC1-MSLZ3KIM (**≠ catalog=ATT-01 DONE** · **R-ATT-01-ASSIGN open** · DENY invent ASSIGN DONE) · ATT11QC1-MSLXTH9P (**≠ LIVE=ATT-11 DONE**) · ATT10QC1-MSLWGUYH (**≠ AGG=ATT-10 DONE**) · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT. PAY/printable **OUT invent DONE**. **DENY** invent `att_leave_hold` · Settings/`gps_locations` sole SoT · second geofence table · `ensureDefaultWorkSite` · claim PLT WS = ATT-03d DONE · claim ATT module UAT. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Low–medium (spine LIVE; residual = continuous UC AC + optional HOLD items) |
| **Risk** | Low if BA does not invent Nest dual / claim PLT=ATT-03d DONE / invent PAY / invent ASSIGN / reopen ATT-03b |
| **Cost / timeline** | BA → ba-data HOLD → sa API F.1 cite → Dev wire ONLY if closable gap · QA U65 |
| **Pros** | Matches preserve_default + ADR D3 + prior PLT WS Option B Nest SoT; unlocks board #34; avoids dual SoT; separates PLT seal ≠ FR-03d DONE |
| **Cons** | Not full ATT UAT; overlap/SITE-UNKNOWN/mobile may stay HOLD/OOS |
| **Failure modes** | BA over-scopes Nest `/core` · claims PLT GWC=FR-03d · invent PAY · wipe ATT-03b · invent ASSIGN · seed default site |
| **Mitigation** | O1–O12 locks · DENY invent · peers OUT · ≠DONE footers · C-SLICE |

### Option B — Nest `/core` dual / Settings `gps_locations` sole SoT / second geofence table (REJECT)

| | |
|--|--|
| **Summary** | Stand up Nest `@Controller('core')` as primary GPS SoT; **or** revert enforcement to `attendance_rules.gps_locations` JSON / Settings MD alone; **or** invent parallel `att_gps_point*` mega-table / dual-write |
| **Pros** | Paper `/core` literal · or «one JSON blob» nostalgia |
| **Cons** | Dual SoT · violates ADR D3 + U89 preserve · high blast · regression PLT WS seals + ATT-03b..CORE · U65 seed risk if ensureDefault |
| **Failure modes** | Dual-write · Nest `/core` non-404 SoT · honesty flip · wipe work-sites |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim PLT worksite GWC = ATT-03d DONE / honesty (REJECT)

| | |
|--|--|
| **Summary** | Declare seat DONE because `ATTWSQA-MSJC3IN9` / CNS-05 CLOSED / work-sites CRUD exists; flip `attendance_uat_ready`; invent PAY/printable DONE; invent ASSIGN DONE; reopen sealed ATT-03b..CORE peers |
| **Pros** | Fast chat claim |
| **Cons** | Violates board #34 continuous UC seat · C-SLICE · FR Thành công footer · prior CODE-MEMORY / QC honesty already ≠ module ATT UAT |
| **Failure modes** | False UAT · sponsor distrust · continuous program stall |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap AC) | B (Nest dual / JSON SoT) | C (HOLD/claim DONE) |
|-----------|-------:|------------------:|-------------------------:|--------------------:|
| Business value (FR-ATT-03d) | 5 | **5** | 1 | 0 |
| Time to deliver | 4 | **5** | 1 | Fake PASS |
| Complexity (lower=better) | 3 | **5** | 1 | — |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability | 4 | **5** | 1 | Spec lie |
| Fit ADR D3 + preserve | 5 | **5** | 0 | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE Nest `work-sites*` + punch geofence + FE GPS bind + PLT WS seals cite; unlock ADMIN/CNS/SOFT/EMPTY/GATE/DISP residuals (+ OVERLAP/SITE/MOB HOLD); paper F-ATT-CAT-WS / F-ATT-PUNCH + `/core` = alias only; **RETAIN** ATT-03b HOL (`ATT03BQC1-MSM0891H` · ≠ residual/thin=DONE) · ATT-01 CAT/CNS (`ATT01QC1-MSLZ3KIM` · ≠ catalog=DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN) · ATT-11/10/09/08/02/PLT/CORE · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE; **DENY** Nest dual · Settings/`gps_locations` sole SoT · second table · invent `att_leave_hold` · wipe peers · invent PAY/printable DONE · claim PLT WS = ATT-03d DONE · claim ATT module UAT · honesty flip · reopen seals · seed · apps/** |
| **Why selected** | AS-IS already owns Nest geofence SoT (ADR D3) + admin CRUD + punch GEO taxonomy + FE wire (PLT CNS-05 CLOSED); FR-03d gap is **continuous UC AC pack + honesty ≠DONE + optional HOLD residuals** — not greenfield Nest `/core`, not wipe ATT-03b HOL / ATT-01 CAT/CNS; preserves W10–W31 must_keep; unlocks board #34 |
| **Assumptions** | ATT-03b **`ATT03BQC1-MSM0891H` RETAIN** · ≠ residual/thin=ATT-03b DONE. ATT-01 **`ATT01QC1-MSLZ3KIM` RETAIN** · QA `ATT01QA1-MSLYZKGN` · ≠ catalog=ATT-01 DONE · **R-ATT-01-ASSIGN open**. ATT-11 **`ATT11QC1-MSLXTH9P` RETAIN** · ≠ LIVE=ATT-11 DONE. ATT-10 **`ATT10QC1-MSLWGUYH` RETAIN** · ≠ AGG=ATT-10 DONE. ATT-09 **`ATT09QC1-MSLUTL9D` RETAIN** · DENY `att_leave_hold`. ATT-08 **`ATT08QC1-MSLSL36C` RETAIN**. ATT-02 **`ATT02QC1-MSLQZUK7` RETAIN** · CFG≠DONE. PLT-01 **`PLT01QC1-MSLPUQIU` RETAIN**. CORE-10 **`CORE10QC1-MSLP0EJB` RETAIN**. CORE-09 **`CORE09QC1-MSLNBA89` RETAIN** · printable false. CORE-07 **`CORE07QC1-KZJTSHNT` RETAIN**. soft≠CORE-06 DONE **RETAIN**. Nest `@Controller('core')` **ABSENT**. Physical `work-sites*` + GEO assert **PRESENT**. PLT WS **`ATTWSQA-MSJC3IN9`** + CNS-05 **`ATTWSQA2-MSJCG47P` RETAIN**. `attendance_uat_ready=false` · printable false · product_go **false**. PAY **QUEUED**. |
| **Rejected** | **B** — Nest `/core` dual / `gps_locations` sole SoT / second table / seed default · **C** — HOLD / claim PLT WS = ATT-03d DONE / invent PAY·printable·ASSIGN / honesty flip / reopen sealed |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Geofence SoT | LIVE Nest `work-sites*` · F-ATT-CAT-WS · ADR D3 · paper alias only | ≠DONE from PLT WS GWC alone · mint **J-HRM-ATT-03D-*** |
| O2 | Admin CRUD | RETAIN FE Settings GPS Nest bind · U65 path HDSD CH05b | AC Diễn biến #1–#2 · F5 · admin N+1 OK |
| O3 | Soft-retire | Prefer `active=false` hide geofence · hard DELETE residual only | AC #2 · history punches intact |
| O4 | Punch CNS | RETAIN GEO-001 / GEO-REQ · cite CNS-05 CLOSED | AC #3–#5 · silent 2xx FAIL · ≠ invent SITE-UNKNOWN FAIL |
| O5 | Empty active | Skip assert + CTA · **DENY** `ensureDefaultWorkSite` / seed | AC #6 · no fake site |
| O6 | `gps_enabled` gate | Rules flag RETAIN · peer ATT-02 CFG≠DONE | Explicit gate AC · ≠ claim CFG=ATT-02 DONE |
| O7 | Overlap warn | **HOLD GĐ1** unless BA opens closable | Footer HOLD XOR AC |
| O8 | SITE-UNKNOWN / site_code | **HOLD** (SRS tạm) | DENY invent as GĐ1 DONE |
| O9 | Paper `/core` + `/att` | Alias only | DENY Nest dual in AC/evidence |
| O10 | ATT-03b/01/11/10/09/08/PLT/CORE | must_keep stamps · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · DENY `att_leave_hold` | ≠ reopen · ≠ claim DONE |
| O11 | PAY / printable / mobile | OUT invent PAY/printable DONE · printable false · MOB cite OOS XOR web-first | Trace-only · J-MOB not invent FAIL |
| O12 | Honesty / journeys | All false · C-SLICE · `attendance_uat_ready=false` · mint `J-HRM-ATT-03D-*` DRAFT | Footer ≠DONE · ≠ ATT module UAT · U65 zero-seed |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA (+ ba-data HOLD) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Paper alias | Mục đích (VI) | Bước SRS |
|-------------|-------------------------------|-------------|---------------|----------|
| **F-ATT-CAT-WS-01** (RETAIN) | `GET /api/hrm/attendance/work-sites` · `GET …/:siteId` | `/att/work-sites` · `/core/…` **alias only** | Danh sách điểm GPS hiệu lực theo pháp nhân | FR-UC-BP-ATT-03d Diễn biến **#1** |
| **F-ATT-CAT-WS-02** (RETAIN) | `POST/PATCH/DELETE …/work-sites*` | paper alias | Thêm/sửa/ngừng điểm (N+1 OK · soft-retire ưu tiên) | Diễn biến **#1–#2** |
| **F-ATT-PUNCH-01** (RETAIN peer) | `POST …/attendance/records` | paper alias | Chấm GPS · assert vùng · GEO-001/GEO-REQ | Diễn biến **#3–#6** · **≠** ATT-03d DONE alone |
| **F-ATT-RULE-01** (peer cite) | `GET/PATCH …/attendance/rules` | paper alias | `gps_enabled` gate · **≠** ATT-02 DONE | tiên quyết · O6 |

**DENY:** invent Nest `@Controller('core')` as primary SoT for F-ATT-CAT-WS / F-ATT-PUNCH.  
**DENY:** invent second geofence table / mega-EAV / Settings/`gps_locations` sole SoT.  
**DENY:** treat paper path alone as Nest dual invent requirement.  
**DENY:** claim PLT worksite GWC / CNS-05 / thin work-sites CRUD alone = FR-UC-BP-ATT-03d DONE.  
**DENY:** `ensureDefaultWorkSite` / seed default site for U65 density.

**Display-ready cite for BA/DATA:** `{ id, companyId, name, address?, latitude, longitude, radiusMeters, active, statusLabelVi?, createdAt, updatedAt? }` — BA may deepen VI labels; **no** `site_code` invent unless O8 opens HOLD.

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O12 + mint J-HRM-ATT-03D-* DRAFT
  → ba-data HOLD default (ADD residual ONLY if BA proves closable col — prefer NO new table)
  → sa API-01 F.1 deepen RETAIN cite F-ATT-CAT-WS-01/02 + F-ATT-PUNCH-01 (+ wire residual ONLY if closable)
  → Dev-BE / Dev-FE residual wire ONLY (gap-only · DENY invent ASSIGN / att_leave_hold / PAY / Nest dual)
  → QA U65 J-HRM-ATT-03D-* browser FE-after-2xx + F5 (admin CRUD · GEO-001 · GEO-REQ · empty skip · Nest /core 0)
  → QC GWC C-SLICE (≠ ATT-03d module UAT · ≠ ATT module UAT · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · printable false · PAY OUT)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC + mint J-HRM-ATT-03D-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default / ADD residual only if closable | ba-data | HOLD — **no** second sites table |
| 4. sa API F.1 cite RETAIN F-ATT-CAT-WS + F-ATT-PUNCH (+ wire residual ONLY if closable) | sa | API-01 delta |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-03D-* (admin · GEO · empty · Nest `/core` 0) | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip · ≠ wipe ATT-03b..CORE · ≠ invent PAY |

**Rollback:** Docs-only seat — supersede this Option if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · ATT-03b/01/11/10/09/08/02/PLT/CORE stamps untouched · Nest `/core` still DENY · honesty false · apps/** untouched · **≠** claim ATT-03d DONE · **≠** claim ATT UAT · **≠** claim residual/thin=ATT-03b DONE · **≠** claim catalog=ATT-01 DONE · **≠** claim LIVE=ATT-11 DONE · **≠** claim AGG=ATT-10 DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | BA claims PLT WS GWC = ATT-03d DONE | AC footer missing ≠DONE | O1/O12 · C-SLICE |
| A | Dev invents Nest `/core` dual | Nest `/core` non-404 SoT | DENY · paper alias only |
| A | FE writes `gps_locations` as SoT | Network PATCH rules with gps_locations | ADR D3 · DENY sole SoT |
| A | Seed default site for empty | `ensureDefaultWorkSite` / seed in evidence | U65 · O5 DENY |
| A | Reopen ATT-03b / invent ASSIGN / att_leave_hold / PAY | Evidence invent DONE | must_keep stamps · O10–O11 |
| B | Dual geofence SoT | Two writers | **REJECT B** |
| C | Honesty flip / false UAT | ready flags true | **REJECT C** |

---

## 8. Explicit honesty locks (mandatory)

| Claim | Verdict |
|-------|---------|
| **≠ ATT-03d / FR-03d DONE** from this Option alone | **LOCKED** |
| **≠ ATT module UAT** · `attendance_uat_ready=false` | **LOCKED** |
| **printable false** · `contracts_printable_ready=false` | **LOCKED** |
| **C-SLICE-≠-MODULE** | **LOCKED** |
| **PAY OUT** invent DONE | **LOCKED** |
| **≠ residual/thin = ATT-03b DONE** · must_keep `ATT03BQC1-MSM0891H` | **LOCKED** |
| **≠ catalog = ATT-01 DONE** · R-ATT-01-ASSIGN **open** · DENY invent ASSIGN DONE | **LOCKED** |
| **≠ LIVE = ATT-11 DONE** · **≠ AGG = ATT-10 DONE** | **LOCKED** |
| **DENY** invent `att_leave_hold` · Nest `/core` dual · Settings/`gps_locations` sole SoT · second geofence table · seed default | **LOCKED** |
| **DENY** reopen sealed ATT-03b/01/11/10/09/08/02/PLT/CORE · PLT WS QC as invent ATT-03d DONE | **LOCKED** |
| **cấm apps/** · **cấm code until CONFIRMED** (this seat docs-only CONFIRMED → unlock BA only) | **LOCKED** |

---

## 9. completion_report

| | |
|--|--|
| **Closed** | Option **A** CONFIRMED LOCK for `UC-BP-ATT-03d` / `FR-UC-BP-ATT-03d` · LIVE Nest work-sites + punch geofence + FE GPS + PLT seals **RETAIN cite** · residuals R-ATT-03D-* mapped · O1–O12 for BA · unlock_lane BA→DATA(HOLD)→API→FE/BE · Nest `/core` DENY · must_keep ATT-03b/01/11/10/09/08/02/PLT/CORE · printable false · PAY OUT · C-SLICE · **≠ ATT-03d DONE** · **≠ ATT UAT** · apps/** untouched |
| **Residual** | BA AC pack + mint J-HRM-ATT-03D-* · ba-data HOLD · API F.1 cite · Dev wire ONLY if closable · OVERLAP/SITE/MOB HOLD until BA opens · R-ATT-01-ASSIGN remains open (peer) |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-ATT-03d · FR-UC-BP-ATT-03d · BR-BP-GPS-01 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md (FR-UC-BP-ATT-03d)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (F-ATT-CAT-WS-01/02 · F-ATT-PUNCH-01)
  - docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md (D3)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-qc-01.md (ATT03BQC1-MSM0891H)
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md (peer PLT RETAIN ≠ ATT-03d DONE)
entry_criteria: SA Option A CONFIRMED · U65 zero-seed · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md
  - O1–O12 CONFIRM (SoT Nest work-sites · admin N+1 · soft-retire · GEO-001/GEO-REQ · empty skip · gps_enabled cite · OVERLAP/SITE HOLD · paper /core alias · must_keep peers · PAY/printable OUT · honesty)
  - mint J-HRM-ATT-03D-01..06 DRAFT (admin CRUD · soft-retire · in-radius · OOS GEO-001 · GEO-REQ · empty skip+CTA) · U65 FE-after-2xx+F5 · Nest /core 0
  - explicit ≠ ATT-03d DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE
  - DENY invent ASSIGN DONE · DENY invent att_leave_hold · DENY Settings/gps_locations sole SoT · DENY second geofence table · DENY ensureDefaultWorkSite · DENY Nest /core dual · DENY claim PLT WS GWC = ATT-03d DONE
  - must_keep: ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P
  - unlock next: ba-data HOLD (no second table)
  - ack_status PASS_TO_PM · next_owner ba-data
cấm: apps/** · seed · invent Nest /core · invent PAY/printable DONE · honesty flip · reopen sealed peers
```
