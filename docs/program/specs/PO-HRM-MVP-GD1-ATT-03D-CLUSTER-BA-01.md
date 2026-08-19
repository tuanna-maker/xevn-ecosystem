# BA AC pack — Wave-32 ATT cluster · UC-BP-ATT-03d (Danh mục điểm GPS · vùng hợp lệ · RETAIN Nest work-sites + punch)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-32 seat **#34**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (prefer **NO** second geofence table) · sa API residual unlock after DATA · **DENY** claim PLT WS GWC / CNS-05 alone = ATT-03d DONE · **DENY** claim residual/thin=ATT-03b DONE · **DENY** claim catalog=ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim ATT module UAT · **printable false RETAIN** · **PAY OUT invent DONE** · **DENY invent ASSIGN DONE** · **DENY invent `att_leave_hold`** · **DENY** Settings/`gps_locations` sole SoT · **DENY** `ensureDefaultWorkSite` |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** wipe ATT-03b/01/11/10/09/08/02/PLT/CORE · **no** wipe soft≠CORE-06 DONE · **no** invent PAY/printable/Word DONE · **no** claim PLT WS alone = FR-03d DONE) |
| **uc_ids** | `UC-BP-ATT-03d` · `FR-UC-BP-ATT-03d` · **BR-BP-GPS-01** |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-03b **`ATT03BQC1-MSM0891H`** (≠ residual/thin=ATT-03b DONE) · must_keep ATT-01 **`ATT01QC1-MSLZ3KIM`** (≠ catalog=DONE · **R-ATT-01-ASSIGN open**) · ATT-11 **`ATT11QC1-MSLXTH9P`** (≠ LIVE=DONE) · ATT-10 **`ATT10QC1-MSLWGUYH`** (≠ AGG=DONE) · ATT-09 **`ATT09QC1-MSLUTL9D`** · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** (printable **false**) · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · peer PLT WS **`ATTWSQA-MSJC3IN9`** · CNS-05 **`ATTWSQA2-MSJCG47P`** (**≠** claim = ATT-03d DONE) · PAY invent DONE **OUT** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-03d** · Diễn biến **#1–#6 + Thành công** · **BR-BP-GPS-01** · peer Face mobile-only |
| **ref_api_paper** | **F-ATT-CAT-WS-01/02** · **F-ATT-PUNCH-01** · errors **`HRM-ATT-GEO-001`** · **`HRM-ATT-GEO-REQ`** · **`HRM-ATT-SITE-VAL`** · **`HRM-ATT-SITE-404`** · **`HRM-ATT-SITE-UNKNOWN` HOLD** · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `public.attendance_work_sites` · ATT-WORKSITE-CATALOG-DATA-01 **HOLD no second table** · Nest `@Controller('core')` **ABSENT** |
| **ref_adr** | [`ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D3** · Nest physical prefer `/api/hrm/attendance/work-sites*` + punch `/records` · paper `/att/*` + `/core` **alias only** · U19 · soft-delete · **DENY** Nest `/core` dual · **DENY** `gps_locations` sole SoT · **DENY** `ensureDefaultWorkSite` |
| **ref_hdsd** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md` (U76) |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim PLT WS / CNS-05 = ATT-03d DONE · **DENY** claim residual/thin=ATT-03b DONE · **DENY** claim catalog=ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** invent ASSIGN DONE · **DENY** invent `att_leave_hold` |
| **Cấm** | Nest `/core` dual · wipe ATT-03b/01/11/10/09/08/02/PLT/CORE · soft=CORE-06 DONE · invent PAY/printable/Word DONE · invent ASSIGN DONE · invent `att_leave_hold` · Settings/`gps_locations` sole SoT · second geofence table · `ensureDefaultWorkSite` · claim PLT WS GWC = FR-03d DONE · claim residual/thin=ATT-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-03B / ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-32 seat #34 — **gap-only RETAIN** LIVE Nest geofence catalog + punch peer + PLT WS seals cite:

1. **Geofence SoT** = LIVE Nest `GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*` → `attendance_work_sites` (**F-ATT-CAT-WS-01/02** · ADR **D3**) — **explicit ≠** ATT-03d DONE from PLT WS GWC / CNS-05 / thin CRUD alone.
2. **Admin CRUD N+1** = FE Settings GPS Nest bind · HDSD CH05b · tên · lat · lon · bán kính · hiệu lực — U65 Lưu/F5.
3. **Soft-retire** = ưu tiên `active=false` · ẩn khỏi geofence / list mặc định · lịch sử punch intact.
4. **Punch CNS** = `POST …/attendance/records` · in-radius OK · OOS → **`HRM-ATT-GEO-001`** · thiếu lat/lon GPS khi enforce → **`HRM-ATT-GEO-REQ`** (cấm im lặng 2xx) · cite CNS-05 CLOSED deepen ONLY if gap.
5. **Empty active** = skip assert + CTA thêm điểm · **DENY** `ensureDefaultWorkSite` / seed.
6. **`gps_enabled` gate** = rules flag RETAIN · peer ATT-02 CFG≠DONE · **≠** claim CFG=ATT-02 DONE.
7. **OVERLAP warn** = **HOLD GĐ1** (SRS optional) unless closable later.
8. **SITE-UNKNOWN / site_code** = **HOLD** · DENY invent FAIL as GĐ1 DONE.
9. **MOB** = cite OOS XOR GĐ1 web-first · **≠** invent Face/mobile GPS = GPS SoT DONE.
10. **Mint** `J-HRM-ATT-03D-01..06` DRAFT — admin · soft · in-radius · GEO-001 · GEO-REQ · empty+seals — **narrow** · **≠** ATT module UAT.
11. **must_keep** ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS / Quản trị chấm công | CRUD điểm GPS · soft-retire · CTA empty |
| Nhân viên (web) | Chấm GPS consumer — in/out radius · GEO-REQ |
| Nhân viên (mobile) | Cite OOS XOR web-first GĐ1 · Face mobile peer OUT invent DONE |
| Group CEO | Scope rollup `main` — U19 list = get = mutate |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| Hệ thống (Nest) | work-sites SoT · `assertWithinWorkSite` · Nest `/core` **0** |
| ATT-03b/01/11/10/09/08/02 / PLT / CORE / PAY / PLT WS | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-ATT-03d Diễn biến #1–#6 + BR-BP-GPS-01 → AC-ATT-03D-* · residuals ADMIN/CNS/SOFT/EMPTY/GATE/DISP/≠DONE · OVERLAP/SITE/MOB **HOLD** · J-HRM-ATT-03D-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/attendance/work-sites*` + `/records` · paper `/att` + `/core` alias | Nest `/core/…` geofence SoT dual |
| Explicit ≠ ATT-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ PLT WS alone=ATT-03d DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT · DENY invent ASSIGN · DENY invent `att_leave_hold` · DENY `gps_locations` sole SoT · DENY `ensureDefaultWorkSite` | Claim Option/PLT WS alone = FR-03d DONE · invent PAY/printable/Word · invent SITE-UNKNOWN FAIL DONE · invent Face=GPS SoT |
| Honesty footer · ATT-03b..CORE RETAIN · soft≠CORE-06 DONE · PLT WS cite ≠ DONE | Flip ready flags · reopen sealed J-* · wipe peers |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Geofence SoT | **YES RETAIN** — LIVE Nest `work-sites*` → `attendance_work_sites` (**F-ATT-CAT-WS-01/02** · ADR **D3**) · paper `/att`+`/core` alias · **explicit ≠** ATT-03d DONE from PLT WS GWC / CNS-05 / thin CRUD alone · mint **J-HRM-ATT-03D-*** — **AC-ATT-03D-SOT** · **AC-ATT-03D-PATH** · **AC-ATT-03D-≠-PLT-DONE** |
| **O2** | Admin CRUD | **YES** — FE Settings GPS Nest bind · HDSD CH05b · Diễn biến #1–#2 · admin N+1 OK · Lưu **2xx** · F5 còn — **AC-ATT-03D-ADMIN** · **AC-ATT-03D-F5** |
| **O3** | Soft-retire | **YES** — Prefer `active=false` hide geofence · history punches intact · hard DELETE residual only — **AC-ATT-03D-SOFT** |
| **O4** | Punch CNS | **YES RETAIN cite** — in-radius OK · OOS **`HRM-ATT-GEO-001`** · thiếu lat/lon **`HRM-ATT-GEO-REQ`** · silent 2xx = **FAIL** · cite CNS-05 · **≠** invent SITE-UNKNOWN FAIL — **AC-ATT-03D-CNS-IN** · **AC-ATT-03D-GEO-001** · **AC-ATT-03D-GEO-REQ** |
| **O5** | Empty active | **YES** — Skip assert + CTA · **DENY** `ensureDefaultWorkSite` / seed — **AC-ATT-03D-EMPTY** · **AC-ATT-03D-NO-SEED** |
| **O6** | `gps_enabled` gate | **YES cite** — Rules flag RETAIN · peer ATT-02 CFG≠DONE · **≠** claim CFG=ATT-02 DONE — **AC-ATT-03D-GATE** · **AC-ATT-03D-≠-CFG02** |
| **O7** | Overlap warn | **HOLD GĐ1** — SRS optional · **no** block create solely for nearness · footer HOLD — **AC-ATT-03D-OVERLAP-HOLD** |
| **O8** | SITE-UNKNOWN / site_code | **HOLD** — SRS «gắn mã điểm» tạm · **DENY** invent as GĐ1 DONE — **AC-ATT-03D-SITE-HOLD** |
| **O9** | Paper `/core` + `/att` | **YES** — **alias only** — Nest `@Controller('core')` SoT = **FAIL** — **AC-ATT-03D-PATH** |
| **O10** | ATT-03b/01/11/10/09/08/PLT/CORE | **YES** — must_keep stamps **intact** · **≠ residual/thin=ATT-03b DONE** · **≠ catalog=ATT-01 DONE** · **R-ATT-01-ASSIGN open** · **DENY invent ASSIGN DONE** · **≠ LIVE=ATT-11 DONE** · **≠ AGG=ATT-10 DONE** · **DENY `att_leave_hold`** · **≠** reopen · printable false — **AC-ATT-03D-MK-*** |
| **O11** | PAY / printable / mobile | **YES OUT invent** — PAY QUEUED · printable **false RETAIN** · MOB cite OOS XOR web-first · **≠** invent Face=GPS SoT — **AC-ATT-03D-PAY-OUT** · **AC-ATT-03D-PRINTABLE** · **AC-ATT-03D-MOB-HOLD** |
| **O12** | Honesty / journeys | **YES false** — all ready flags false · **`attendance_uat_ready=false`** · C-SLICE · mint **`J-HRM-ATT-03D-01..06` DRAFT** — **≠** ATT-03d DONE · **≠** ATT module UAT · U65 zero-seed — **AC-ATT-03D-H** |

**Architecture SoT:** RETAIN LIVE Nest `work-sites*` + punch geofence + FE GPS Nest bind + PLT WS seals cite · unlock ADMIN/CNS/SOFT/EMPTY/GATE/DISP/≠DONE · OVERLAP/SITE/MOB **HOLD** · paper F-ATT-CAT-WS / F-ATT-PUNCH + `/core` alias only · U19 list↔get↔mutate · ATT-03b..CORE **must_keep**.

### Primary API surface (BA lock — O1/O9)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List / GET work-sites (RETAIN) | **`GET /api/hrm/attendance/work-sites`** · `GET …/:siteId` | `/att/work-sites` · `/core/…` **alias only** |
| Create / patch / soft-retire (RETAIN) | **`POST/PATCH/DELETE …/work-sites*`** | paper alias · soft prefer `active=false` |
| Punch geofence (peer RETAIN) | **`POST …/attendance/records`** | paper alias · **≠** ATT-03d DONE alone |
| Rules `gps_enabled` (peer cite) | **`GET/PATCH …/attendance/rules`** | paper alias · **≠** ATT-02 DONE |
| ATT-03b HOL / ATT-01 CAT / ATT-11 sign / ATT-10 AGG / PLT / CORE | peers | must_keep · **≠** claim DONE · DENY invent ASSIGN |

**Invariant ATT-03D-PATH:** Geofence Network **MUST** hit physical `/api/hrm/attendance/*` — Nest dual `/core` SoT = **FAIL O9**.

**Invariant ATT-03D-≠-PLT:** Claim PLT WS GWC / CNS-05 / thin work-sites CRUD alone = FR-UC-BP-ATT-03d DONE = **FAIL O1/O12**.

**Invariant ATT-03D-≠-UAT:** Claim ATT module UAT / flip `attendance_uat_ready` from this seat = **FAIL O12**.

**Invariant ATT-03D-≠-03B:** Claim residual/thin = ATT-03b DONE = **FAIL O10**.

**Invariant ATT-03D-≠-CAT01:** Claim catalog = ATT-01 DONE = **FAIL O10**.

**Invariant ATT-03D-≠-LIVE11:** Claim LIVE sign/close = ATT-11 DONE = **FAIL O10**.

**Invariant ATT-03D-≠-AGG10:** Claim AGG = ATT-10 DONE = **FAIL O10**.

**Invariant ATT-03D-≠-PRINTABLE:** Claim printable / Word DONE / flip `contracts_printable_ready` = **FAIL O11/O12**.

**Invariant ATT-03D-PAY-OUT:** Invent PAY DONE = **FAIL O11**.

**Invariant ATT-03D-ASSIGN:** Invent ASSIGN DONE / close R-ATT-01-ASSIGN = **FAIL O10**.

**Invariant ATT-03D-HOLD:** Invent `att_leave_hold` dual = **FAIL O10**.

**Invariant ATT-03D-GPS-JSON:** Settings/`gps_locations` sole SoT write = **FAIL O1** (ADR D3).

**Invariant ATT-03D-NO-SEED:** `ensureDefaultWorkSite` / seed default site in U65 = **FAIL O5/O12**.

**Wire codes (RETAIN + residual assert):** `HRM-ATT-GEO-001` · `HRM-ATT-GEO-REQ` · `HRM-ATT-SITE-VAL` · `HRM-ATT-SITE-404` · `HRM-SCOPE-409` · **`HRM-ATT-SITE-UNKNOWN` HOLD** (DENY invent FAIL GĐ1) · sealed peer codes · **DENY** invent Nest `/core` error family as SoT.

**Display-ready (normative for FE bind — O DISP):** `{ id, companyId, name, address?, latitude, longitude, radiusMeters, active, statusLabelVi?, createdAt, updatedAt? }` — BA VI labels; **no** `site_code` invent unless O8 opens HOLD.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-03d DONE** · PLT WS / CNS-05 ≠ FR-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · ≠ soft/ATT-08=ATT-09 DONE · ≠ CFG=ATT-02 DONE · PAY OUT invent DONE · DENY invent ASSIGN · DENY invent `att_leave_hold` · DENY `gps_locations` sole SoT · DENY `ensureDefaultWorkSite` · must_keep ATT-03b `ATT03BQC1-MSM0891H` · ATT-01 `ATT01QC1-MSLZ3KIM` · ATT-11 `ATT11QC1-MSLXTH9P` · ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-32 · Option A) |
|---|----------------------|---------------------------|
| Geofence SoT | Nest `work-sites*` → `attendance_work_sites` PRESENT | **RETAIN cite** (**O1**) · **≠** FR-03d DONE alone |
| Admin CRUD N+1 | FE Settings GPS Nest bind PRESENT | **RETAIN + AC** (**O2**) |
| Soft-retire | `active=false` PRESENT | **RETAIN + AC** (**O3**) |
| Punch GEO-001 / GEO-REQ | PRESENT · CNS-05 CLOSED | **RETAIN cite** (**O4**) · ≠ invent DONE alone |
| Empty active skip + CTA | PRESENT · no seed default | **RETAIN + AC** (**O5**) · DENY ensureDefault |
| `gps_enabled` | Rules PRESENT · ATT-02 CFG≠DONE | **RETAIN cite** (**O6**) · ≠ CFG=DONE |
| Overlap warn | ABSENT | **HOLD GĐ1** (**O7**) |
| SITE-UNKNOWN | HOLD | **HOLD** (**O8**) · DENY invent FAIL |
| Display-ready VI | Partial | **RESIDUAL** R-ATT-03D-DISP |
| Mobile GPS | Peer J-MOB OOS / web proven | **HOLD cite** (**O11**) |
| `gps_locations` JSON | Deprecated ADR D3 · may embed read-only | **DENY sole SoT** |
| Paper F-ATT-CAT-WS / PUNCH / `/core` | Nest named PRESENT · `@Controller('core')` ABSENT | **Alias only** (**O9**) |
| ATT-03b..CORE / PLT WS | SEALED stamps | **must_keep RETAIN** (**O10**) · PLT WS ≠ ATT-03d DONE |
| PAY / printable | QUEUED / false | **OUT invent DONE** (**O11**) |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O12**) |

### 1.1 Disposition **R-ATT-03D-ADMIN**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-03D-ADMIN` |
| **Scope** | **IN-SCOPE** — U65 admin CRUD AC + HDSD CH05b · Diễn biến #1–#2 · N+1 OK |
| **OUT** | Claim PLT WS GWC alone = admin DONE · invent Nest `/core` UI · Settings JSON SoT write |
| **Rationale** | FR Diễn biến #1–#2 · SA O2 · LIVE PRESENT deepen AC |
| **ba-data** | **HOLD** — prefer NO new table |
| **DENY** | Seed site · `gps_locations` sole SoT · claim thin=FR-03d DONE |

### 1.2 Disposition **R-ATT-03D-SOFT**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-03D-SOFT` |
| **Scope** | **IN-SCOPE** — soft-retire hide from geofence · history punches intact |
| **OUT** | Hard-delete default · wipe punch history |
| **Rationale** | Diễn biến #2 · F-ATT-CAT-WS-02 · SA O3 |
| **ba-data** | **HOLD** — LIVE `active` col RETAIN |
| **DENY** | Nest `/core` · second table |

### 1.3 Disposition **R-ATT-03D-CNS**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-03D-CNS` |
| **Scope** | **IN-SCOPE cite** — punch in-radius · GEO-001 · GEO-REQ · deepen ONLY if gap vs CNS-05 CLOSED |
| **OUT** | Invent SITE-UNKNOWN FAIL as GĐ1 DONE · claim CNS-05 alone = FR-03d DONE |
| **Rationale** | Diễn biến #3–#5 · F-ATT-PUNCH-01 · SA O4 |
| **ba-data** | **HOLD** |
| **DENY** | Silent 2xx on GEO-REQ · invent SITE-UNKNOWN DONE |

### 1.4 Disposition **R-ATT-03D-EMPTY**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-03D-EMPTY` |
| **Scope** | **IN-SCOPE** — empty active skip + CTA · DENY ensureDefault / seed |
| **OUT** | Fake default site · seed density |
| **Rationale** | Diễn biến #6 · ADR D3 · SA O5 · U65 |
| **ba-data** | **HOLD** |
| **DENY** | `ensureDefaultWorkSite` · seed |

### 1.5 Disposition **R-ATT-03D-GATE** / **OVERLAP** / **SITE** / **DISP** / **MOB** / **≠DONE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-03D-GATE` · `R-ATT-03D-OVERLAP` · `R-ATT-03D-SITE` · `R-ATT-03D-DISP` · `R-ATT-03D-MOB` · `R-ATT-03D-≠DONE` · `R-ATT-03D-PAY-OUT` · `R-ATT-03D-HONESTY` |
| **Scope** | gps_enabled cite · OVERLAP **HOLD** · SITE **HOLD** · display-ready · MOB HOLD · honesty locks |
| **Rule** | PLT WS ≠ FR-03d DONE · ≠ residual/thin=ATT-03b · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ ATT UAT · PAY/printable **OUT invent DONE** · all ready flags **false** · printable **false RETAIN** |
| **DENY** | Claim DONE / honesty flip / invent PAY·printable·ASSIGN·`att_leave_hold` · reopen seals · Nest dual · gps_locations sole SoT |

### 1.6 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| `attendance_work_sites` LIVE | **HOLD · RETAIN** | ≠ FR-03d DONE alone · ADR D3 SoT |
| Second geofence / `att_gps_point*` | **DENY** | no second table |
| Soft-retire `active` | **HOLD · RETAIN** | LIVE col |
| Display DTO / statusLabelVi | **HOLD** · deepen AFTER API if gap | no schema invent unless ABSENT closable |
| OVERLAP / SITE-UNKNOWN cols | **HOLD GĐ1** | DENY invent FAIL DONE |
| Nest `/core` | **DENY** | alias only |
| ATT-03b..CORE / soft≠06 / PLT WS | **DENY wipe** | must_keep · printable false · DENY invent ASSIGN · DENY `att_leave_hold` · PLT WS ≠ ATT-03d DONE |
| PAY | **OUT invent DONE** | cite only |
| `gps_locations` / ensureDefault | **DENY sole SoT / seed** | ADR D3 |

**Unlock next:** **ba-data HOLD** stamp (prefer **NO** second table · ADD residual ONLY if BA proves closable display col ABSENT) → **sa API** F.1 F-ATT-CAT-WS-01/02 + F-ATT-PUNCH-01 physical `/attendance/*`.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03d DONE** · Nest `/core` DENY · C-SLICE · `attendance_uat_ready=false`

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-GPS-01** | Danh mục điểm GPS + chấm GPS | SoT Nest work-sites · enforce khi active>0 + GPS bật | Admin N+1 OK · consumer OOS/GEO-REQ từ chối · empty skip · **≠** module ATT UAT |
| **BR-ATT-03D-SOT** | Geofence SoT | Physical `/attendance/work-sites*` | RETAIN · **≠** FR-03d DONE alone · **≠** PLT WS alone DONE |
| **BR-ATT-03D-PATH** | Geofence / punch API | Physical `/attendance/*` | Nest `/core` dual = **FAIL O9** |
| **BR-ATT-03D-ADMIN** | Quyền HCNS | CRUD điểm Nest bind | Lưu 2xx · F5 còn · Nest `/core` 0 · N+1 OK |
| **BR-ATT-03D-SOFT** | Soft-retire | `active=false` | Ẩn geofence · history intact |
| **BR-ATT-03D-CNS-IN** | GPS bật · active>0 · lat/lon ∈ bán kính | Accept punch | Record 2xx · F5 còn |
| **BR-ATT-03D-GEO-001** | GPS bật · active>0 · lat/lon ngoài mọi bán kính | Reject | **`HRM-ATT-GEO-001`** · không đủ công vùng |
| **BR-ATT-03D-GEO-REQ** | GPS method · enforce · thiếu lat/lon | Reject | **`HRM-ATT-GEO-REQ`** · cấm im lặng 2xx |
| **BR-ATT-03D-EMPTY** | active=0 | Skip geofence | CTA thêm điểm · **no** seed default |
| **BR-ATT-03D-GATE** | `gps_enabled=false` | May skip assert | Cite rules · **≠** CFG=ATT-02 DONE |
| **BR-ATT-03D-OVERLAP-HOLD** | Trùng/chồng vùng | HOLD GĐ1 | Không chặn tạo chỉ vì gần · warn optional later |
| **BR-ATT-03D-SITE-HOLD** | Gắn mã điểm consumer | HOLD | DENY invent SITE-UNKNOWN FAIL DONE |
| **BR-ATT-03D-SCOPE-U19** | list = get = mutate | Same scope resolver | Cross-CT leak = **FAIL U19** |
| **BR-ATT-03D-≠-PLT** | PLT WS / CNS-05 PASS alone | ≠ FR-03d / ATT-03d DONE | Claim DONE = **FAIL O1/O12** |
| **BR-ATT-03D-≠-03B** | Any ATT-03d evidence | ≠ residual/thin=ATT-03b DONE | Claim = **FAIL O10** |
| **BR-ATT-03D-≠-CAT01** | Any ATT-03d evidence | ≠ catalog=ATT-01 DONE | Claim = **FAIL O10** · R-ATT-01-ASSIGN open |
| **BR-ATT-03D-≠-LIVE11** | Any ATT-03d evidence | ≠ LIVE=ATT-11 DONE | Claim = **FAIL O10** |
| **BR-ATT-03D-≠-AGG10** | Any ATT-03d evidence | ≠ AGG=ATT-10 DONE | Claim = **FAIL O10** |
| **BR-ATT-03D-≠-UAT** | Slice PASS | ≠ ATT module UAT | Flip `attendance_uat_ready` = **FAIL O12** |
| **BR-ATT-03D-PAY-OUT** | Any cite | PAY QUEUED | Invent PAY DONE = **FAIL O11** |
| **BR-ATT-03D-PRINTABLE** | Honesty | `contracts_printable_ready=false` | Flip = **FAIL O11/O12** |
| **BR-ATT-03D-NO-SEED** | Nghiệm thu | FE only | Seed / ensureDefault = **FAIL U65** |
| **BR-ATT-03D-GPS-JSON** | Enforcement SoT | Nest work-sites only | `gps_locations` sole SoT write = **FAIL O1** |
| **BR-ATT-03D-ASSIGN** | R-ATT-01-ASSIGN | **open RETAIN** | Invent ASSIGN DONE = **FAIL O10** |
| **BR-ATT-03D-HOLD** | Leave hold | pending_days only | Invent `att_leave_hold` = **FAIL O10** |
| **BR-ATT-03D-MK** | Any ATT-03d evidence | Diff ATT-03b..CORE + PLT WS seals | Wipe/reopen/claim DONE = **FAIL O10** |

### Error taxonomy (RETAIN + residual assert)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| `HRM-ATT-GEO-001` | 4xx | Chấm GPS ngoài vùng cho phép | Soft OK OOS · claim ATT-03d DONE alone |
| `HRM-ATT-GEO-REQ` | 4xx | Thiếu vị trí trên phương thức GPS | Im lặng 2xx |
| `HRM-ATT-SITE-VAL` | 4xx | Tọa độ/bán kính không hợp lệ (admin) | Soft OK invalid coords |
| `HRM-ATT-SITE-404` | 404 | Điểm ngoài phạm vi / không tồn tại | Soft OK |
| `HRM-ATT-SITE-UNKNOWN` | 4xx | **HOLD** — chưa mở gắn mã điểm | Invent FAIL as GĐ1 DONE |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Soft OK |
| Sealed ATT-03b | — | ≠ residual/thin=DONE | Claim residual/thin=ATT-03b DONE |
| Sealed ATT-01 | — | ≠ catalog=DONE · ASSIGN open | Invent ASSIGN DONE |
| Sealed ATT-11 | — | ≠ LIVE=DONE | Claim LIVE=ATT-11 DONE |
| Sealed ATT-10 | — | ≠ AGG=DONE | Claim AGG=ATT-10 DONE |
| Sealed ATT-09/08 | — | pending_days · DENY `att_leave_hold` | Dual hold ledger |
| Sealed ATT-02 | — | CFG≠DONE · ≠ ATT UAT | Claim CFG=ATT-02 DONE |
| Sealed PLT WS | — | ATTWSQA · CNS-05 ≠ ATT-03d DONE | Claim PLT WS = FR-03d DONE |
| Sealed PLT/CORE | — | peer≠DONE · printable false | Flip printable / claim CORE DONE |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03d DONE** · Nest `/core` DENY · C-SLICE

---

## 3. Diễn biến FR-UC-BP-ATT-03d → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Diễn biến #1** | Quản trị thêm/sửa điểm | **AC-ATT-03D-ADMIN** · **AC-ATT-03D-SOT** | **J-HRM-ATT-03D-01** | `POST/PATCH …/work-sites*` · Nest `/core` **0** |
| **Diễn biến #2** | Soft-retire | **AC-ATT-03D-SOFT** | **J-HRM-ATT-03D-02** | `PATCH/DELETE …/work-sites*` soft `active=false` |
| **Diễn biến #3** | Chấm trong vùng | **AC-ATT-03D-CNS-IN** | **J-HRM-ATT-03D-03** | `POST …/records` **2xx** |
| **Diễn biến #4** | Chấm ngoài vùng | **AC-ATT-03D-GEO-001** | **J-HRM-ATT-03D-04** | **`HRM-ATT-GEO-001`** |
| **Diễn biến #5** | Thiếu tọa độ GPS | **AC-ATT-03D-GEO-REQ** | **J-HRM-ATT-03D-05** | **`HRM-ATT-GEO-REQ`** · cấm silent 2xx |
| **Diễn biến #6** | Empty active | **AC-ATT-03D-EMPTY** · **NO-SEED** | **J-HRM-ATT-03D-06** | Skip assert + CTA · no ensureDefault |
| **Thành công** | Vùng dùng được · ≠ module UAT | **AC-ATT-03D-F5** · **≠-PLT** · **H** | **J-06** | F5 còn · seals footer |
| **O7–O12** | HOLD + seals | **AC-ATT-03D-OVERLAP-HOLD** · **SITE-HOLD** · **MK-*** | **J-06** | ATT-03b..CORE RETAIN · PAY OUT |

### 3.1 AC-ATT-03D pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-03D-PATH** | Geofence / punch API | CRUD work-sites · punch | Network hits **only** physical `/api/hrm/attendance/*` · Nest `/api/hrm/core/**` SoT **0** · paper `/att`+/`/core` alias only | U65 · O1/O9 · **R-ATT-03D** |
| **AC-ATT-03D-SOT** | ADR D3 · quyền HCNS | Mở danh mục điểm | SoT = Nest `attendance_work_sites` · **not** Settings/`gps_locations` sole write · Nest `/core` 0 · no seed · **≠** ATT-03d DONE alone | Diễn biến #1 · J-01 · O1 |
| **AC-ATT-03D-ADMIN** | FE Settings GPS / HDSD CH05b | Thêm/sửa tên·lat·lon·bán kính · Lưu | **2xx** · list cập nhật · N+1 OK · Nest `/core` 0 | O2 · J-01 |
| **AC-ATT-03D-SOFT** | Điểm active | Soft-retire / ngừng | `active=false` · ẩn list mặc định / geofence · punch history intact · Nest `/core` 0 | O3 · Diễn biến #2 · J-02 |
| **AC-ATT-03D-CNS-IN** | active>0 · GPS bật · tọa độ ∈ bán kính | Chấm GPS | Record **2xx** · F5 còn · Nest `/core` 0 | O4 · Diễn biến #3 · J-03 |
| **AC-ATT-03D-GEO-001** | active>0 · GPS bật · tọa độ ngoài mọi bán kính | Chấm GPS | **`HRM-ATT-GEO-001`** · không ghi nhận đủ công vùng · Nest `/core` 0 | O4 · Diễn biến #4 · J-04 |
| **AC-ATT-03D-GEO-REQ** | Phương thức GPS · enforce · thiếu lat/lon | Chấm GPS | **`HRM-ATT-GEO-REQ`** · **FAIL** nếu im lặng 2xx · Nest `/core` 0 | O4 · Diễn biến #5 · J-05 |
| **AC-ATT-03D-EMPTY** | active=0 | Chấm GPS / mở admin | Skip assert · CTA thêm điểm · **no** `ensureDefaultWorkSite` · Nest `/core` 0 | O5 · Diễn biến #6 · J-06 |
| **AC-ATT-03D-GATE** | Rules `gps_enabled` | Punch path | Gate cite RETAIN · **≠** claim CFG=ATT-02 DONE | O6 · J-06 |
| **AC-ATT-03D-OVERLAP-HOLD** | Điểm gần nhau | Tạo điểm hợp lệ | **HOLD** warn GĐ1 · không chặn create chỉ vì gần · footer HOLD | O7 |
| **AC-ATT-03D-SITE-HOLD** | Consumer gắn mã điểm | Punch with site_code | **HOLD** · DENY invent `HRM-ATT-SITE-UNKNOWN` FAIL as GĐ1 DONE | O8 |
| **AC-ATT-03D-MOB-HOLD** | Mobile GPS / Face | Journey mobile | Cite OOS XOR GĐ1 web-first · **≠** invent Face=GPS SoT DONE | O11 |
| **AC-ATT-03D-SCOPE** | list/get/mutate | Cross-CT attempt | Same scope resolver · **409** out-of-scope | O10 · U19 · J-06 |
| **AC-ATT-03D-DISP** | Response site | After GET/POST/PATCH | Display-ready `{ id, name, latitude, longitude, radiusMeters, active, statusLabelVi? }` · no invent site_code | O DISP · J-01 |
| **AC-ATT-03D-F5** | Sau Lưu 2xx | F5 / navigate lại | Điểm còn · Nest `/core` 0 | U65 · J-06 |
| **AC-ATT-03D-≠-PLT-DONE** | PLT WS / CNS-05 PASS alone | Claim FR-03d / ATT-03d DONE | **FAIL** — footer **PLT WS ≠ ATT-03d DONE** · cite `ATTWSQA-MSJC3IN9` · `ATTWSQA2-MSJCG47P` | O1/O12 |
| **AC-ATT-03D-≠-03B** | Any evidence | Claim residual/thin = ATT-03b DONE | **FAIL** · must_keep `ATT03BQC1-MSM0891H` | O10 |
| **AC-ATT-03D-≠-CAT01** | Any evidence | Claim catalog = ATT-01 DONE | **FAIL** · R-ATT-01-ASSIGN **open** · DENY invent ASSIGN | O10 |
| **AC-ATT-03D-≠-LIVE11** | Any evidence | Claim LIVE = ATT-11 DONE | **FAIL** | O10 |
| **AC-ATT-03D-≠-AGG10** | Any evidence | Claim AGG = ATT-10 DONE | **FAIL** | O10 |
| **AC-ATT-03D-≠-UAT** | Slice GWC later | Claim ATT module UAT / flip `attendance_uat_ready` | **FAIL** | O12 · C-SLICE |
| **AC-ATT-03D-≠-09** | Any evidence | Claim soft/ATT-08 = ATT-09 DONE | **FAIL** · DENY `att_leave_hold` | O10 |
| **AC-ATT-03D-≠-CFG02** | Any evidence | Claim CFG = ATT-02 DONE | **FAIL** | O6/O10 |
| **AC-ATT-03D-≠-PLT-MODULE** | Any evidence | Claim PLT-01 / platform UAT DONE | **FAIL** | O10 |
| **AC-ATT-03D-≠-CORE10-DONE** | Any evidence | Claim CORE-10 DONE | **FAIL** | O10 |
| **AC-ATT-03D-≠-09-DONE** | Any evidence | Claim CORE-09 DONE / printable flip | **FAIL** | O10/O11 |
| **AC-ATT-03D-≠-07-DONE** | Any evidence | Claim CORE-07 DONE | **FAIL** | O10 |
| **AC-ATT-03D-PAY-OUT** | Any cite | This seat | **OUT invent** — claim PAY DONE = **FAIL** | O11 |
| **AC-ATT-03D-PRINTABLE** | Honesty | Any seal | printable **false RETAIN** · flip = **FAIL** | O11/O12 |
| **AC-ATT-03D-NO-SEED** | Empty / density | UF evidence | CTA · **no** seed · **no** ensureDefault | O5/O12 · U65 |
| **AC-ATT-03D-GPS-JSON** | Enforcement | Write path | **DENY** Settings/`gps_locations` sole SoT · FE bind Nest work-sites | O1 · ADR D3 |
| **AC-ATT-03D-MK-ATT03B** | Any evidence | Diff ATT-03b | HOL residual RETAIN · ≠ residual/thin=DONE · **no** reopen J-HRM-ATT-03B · **≠** claim ATT-03b DONE | O10 · `ATT03BQC1-MSM0891H` |
| **AC-ATT-03D-MK-ATT01** | Any evidence | Diff ATT-01 | CAT/CNS RETAIN · Nest `/core` 0 · ≠ catalog=DONE · R-ATT-01-ASSIGN **open** · **DENY invent ASSIGN** · **no** reopen J-HRM-ATT-01 · **≠** claim ATT-01 DONE | O10 · `ATT01QC1-MSLZ3KIM` |
| **AC-ATT-03D-MK-ATT11** | Any evidence | Diff ATT-11 | signatures\|close\|reopen RETAIN · ≠ LIVE=DONE · R-ATT-11-WF/CSUM HOLD · **no** reopen J-HRM-ATT-11 · **≠** claim ATT-11 DONE | O10 · `ATT11QC1-MSLXTH9P` |
| **AC-ATT-03D-MK-ATT10** | Any evidence | Diff ATT-10 | AGG+submit RETAIN · ≠ AGG=DONE · HOL/MEAL OUT · R-ATT-10-DISP HOLD · **no** reopen J-HRM-ATT-10 · **≠** claim ATT-10 DONE | O10 · `ATT10QC1-MSLWGUYH` |
| **AC-ATT-03D-MK-ATT09** | Any evidence | Diff ATT-09 | hold/settle · pending_days · DENY `att_leave_hold` · **no** reopen J-HRM-ATT-09 · **≠** claim ATT-09 DONE | O10 · `ATT09QC1-MSLUTL9D` |
| **AC-ATT-03D-MK-ATT08** | Any evidence | Diff ATT-08 | preview · T6→T2=2 · HOL-MISS · ALIGN · **no** reopen J-HRM-ATT-08 · **≠** claim ATT-08 DONE | O10 · `ATT08QC1-MSLSL36C` |
| **AC-ATT-03D-MK-ATT02** | Any evidence | Diff ATT-02 | CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 · **no** reopen J-HRM-ATT-02 · **≠** claim ATT-02 DONE | O10 · `ATT02QC1-MSLQZUK7` |
| **AC-ATT-03D-MK-PLT** | Any evidence | Diff PLT-01 | peer≠PLT DONE · merge≠platform UAT · **no** reopen J-HRM-PLT-01 · **≠** claim PLT DONE | O10 · `PLT01QC1-MSLPUQIU` |
| **AC-ATT-03D-MK-WS** | Any evidence | Diff PLT WS seals | `ATTWSQA-MSJC3IN9` · CNS-05 `ATTWSQA2-MSJCG47P` **RETAIN cite** · **≠** invent = ATT-03d DONE | O1/O10 |
| **AC-ATT-03D-MK-10** | Any evidence | Diff CORE-10 | catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT · **no** reopen J-HRM-CORE-10 · **≠** claim CORE-10 DONE | O10 · `CORE10QC1-MSLP0EJB` |
| **AC-ATT-03D-MK-09** | Any evidence | Diff CORE-09 | printable **false** · 09a–d≠DONE · registry≠DONE · **no** reopen J-HRM-CORE-09 · **≠** claim CORE-09 DONE · **≠** Word invent | O10 · `CORE09QC1-MSLNBA89` |
| **AC-ATT-03D-MK-07** | Any evidence | Diff CORE-07 | GATE **409** · ACT-**400** · Nest `/core` **0** · checklist≠DONE · free PATCH≠DONE · **no** reopen J-HRM-CORE-07 · **≠** claim CORE-07 DONE | O10 · `CORE07QC1-KZJTSHNT` |
| **AC-ATT-03D-MK-06** | Any evidence | Diff CORE-06 | soft≠DONE · Nest `/core` 0 · **≠** claim soft=CORE-06 DONE | O10 |
| **AC-ATT-03D-H** | Evidence footer | Any seal | attendance/personnel/printable/recruitment/jd **false** · C-SLICE · **printable false RETAIN** · **DENY** PLT WS=ATT-03d DONE · residual/thin=ATT-03b · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT UAT · invent ASSIGN · invent `att_leave_hold` · PAY/printable/Word DONE · Nest DENY · gps_locations sole SoT · ensureDefault · no reopen seals | O10/O11/O12 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS | Work-sites CRUD across rollup membership | Cross-CT mutate without membership |
| **Member CEO / HRBP / HCNS** | Chỉ pháp nhân membership | list ≠ get ≠ mutate resolver |
| **No GPS admin right** | Deny mutate work-sites | Silent 2xx |

**Invariant ATT-03D-SCOPE-U19:** work-sites list **=** get-by-id **=** create/patch/soft **same** hrm list-scope family as punch records.

**Prerequisite:** ATT-03b seal RETAIN (`ATT03BQC1-MSM0891H` · ≠ residual/thin=DONE) · ATT-01 (`ATT01QC1-MSLZ3KIM` · ≠ catalog=DONE · R-ATT-01-ASSIGN open) · ATT-11 (`ATT11QC1-MSLXTH9P` · ≠ LIVE=DONE) · ATT-10 (`ATT10QC1-MSLWGUYH` · ≠ AGG=DONE) · ATT-09 (`ATT09QC1-MSLUTL9D` · DENY `att_leave_hold`) · ATT-08 (`ATT08QC1-MSLSL36C`) · ATT-02 (`ATT02QC1-MSLQZUK7` · CFG≠DONE) · PLT-01 · CORE-10/09/07 · soft≠CORE-06 · PLT WS `ATTWSQA-MSJC3IN9` · CNS-05 `ATTWSQA2-MSJCG47P` · **không** seed · honesty flags false.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03d DONE** · Nest `/core` DENY · C-SLICE

---

## 4. Diễn biến FE U65 (browser matrix — narrow ATT-03d)

```text
Login (ceo@xe.vn / member HCNS)
  → /hr Nhân sự → Cài đặt chấm công / Điểm GPS (HDSD CH05b)
  → (Pos ADMIN) Thêm điểm mới: tên · lat · lon · bán kính → Lưu
       → Assert Network POST …/attendance/work-sites **2xx** · Nest /core = 0 · no seed
       → Assert FE list cập nhật · PLT WS alone ≠ ATT-03d DONE
  → (Pos SOFT) Ngừng điểm → active=false · ẩn khỏi list mặc định / geofence · history punch còn
  → (Pos IN) Còn điểm active · GPS bật · chấm trong bán kính → records **2xx** · F5 còn
  → (Neg GEO-001) Chấm ngoài mọi bán kính → HRM-ATT-GEO-001 · không đủ công vùng
  → (Neg GEO-REQ) Phương thức GPS thiếu lat/lon → HRM-ATT-GEO-REQ · FAIL nếu silent 2xx
  → (Pos EMPTY) Soft-retire hết / active=0 → skip assert · CTA thêm điểm · DENY ensureDefault/seed
  → F5 → điểm còn · Nest /core 0
  → Footer: ≠ ATT-03d DONE
       · PLT WS ATTWSQA-MSJC3IN9 / CNS-05 ATTWSQA2-MSJCG47P ≠ FR-03d DONE
       · ≠ residual/thin=ATT-03b DONE · ATT03BQC1-MSM0891H
       · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN
       · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE
       · ≠ soft/ATT-08=ATT-09 DONE · DENY invent att_leave_hold
       · ≠ ATT module UAT · attendance_uat_ready=false
       · CFG≠ATT-02 DONE · printable false RETAIN · PAY OUT invent DONE
       · DENY gps_locations sole SoT · DENY ensureDefaultWorkSite · DENY Nest /core
       · OVERLAP/SITE/MOB HOLD · must_keep ATT-01/11/10/09/08/02/PLT/CORE
       · soft≠CORE-06 DONE · honesty false · no reopen seals
```

**cấm:** `pnpm seed:*` · API seed work-site · DB fake · PASS chỉ curl · Nest `/core` dual · wipe ATT-03b/01/11/10/09/08 · claim PLT WS=FR-03d DONE · claim residual/thin=ATT-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · invent ASSIGN DONE · invent `att_leave_hold` · invent PAY/printable/Word · invent SITE-UNKNOWN FAIL DONE · claim ATT module UAT · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-ATT-03D-01** | Admin CRUD · Lưu/F5 · Nest `/core` 0 · no seed · ≠ PLT=DONE | AC-ATT-03D-SOT/ADMIN/F5/PATH/≠-PLT · O1/O2/O9 |
| **VAL-ATT-03D-02** | Soft-retire hide geofence · history intact | AC-ATT-03D-SOFT · O3 |
| **VAL-ATT-03D-03** | In-radius punch 2xx · F5 | AC-ATT-03D-CNS-IN · O4 |
| **VAL-ATT-03D-04** | OOS → GEO-001 | AC-ATT-03D-GEO-001 · O4 |
| **VAL-ATT-03D-05** | Missing lat/lon → GEO-REQ · FAIL silent 2xx | AC-ATT-03D-GEO-REQ · O4 |
| **VAL-ATT-03D-06** | Empty skip+CTA · seals · ≠DONE · printable false · PAY OUT · DENY ASSIGN/`att_leave_hold`/gps_locations/ensureDefault · honesty | AC-ATT-03D-EMPTY/NO-SEED/≠-*/H/MK-* · O5/O10/O11/O12 |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03d DONE** · Nest `/core` DENY · C-SLICE

---

## 5. Journeys DRAFT (O12)

| J-ID | Layer | Title | Click path (draft) | Pass when |
|------|-------|-------|--------------------|-----------|
| **J-HRM-ATT-03D-01** | **admin** | **CRUD điểm GPS N+1** | Login → Cài đặt chấm công / Điểm GPS → thêm tên·lat·lon·bán kính → Lưu · F5 · Nest `/core` 0 · no seed · ≠ PLT WS = ATT-03d DONE | AC-ATT-03D-SOT/ADMIN/F5/PATH/≠-PLT · O1/O2/O9 · U65 · **DRAFT** |
| **J-HRM-ATT-03D-02** | **soft** | **Soft-retire ẩn geofence** | Ngừng điểm → `active=false` · ẩn list mặc định · punch history còn · Nest `/core` 0 | AC-ATT-03D-SOFT · O3 · U65 · **DRAFT** |
| **J-HRM-ATT-03D-03** | **consumer** | **Chấm GPS trong vùng** | active>0 · GPS bật · tọa độ ∈ bán kính → records **2xx** · F5 còn · Nest `/core` 0 | AC-ATT-03D-CNS-IN · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-03D-04** | **consumer** | **Ngoài vùng → GEO-001** | Tọa độ ngoài mọi bán kính → **`HRM-ATT-GEO-001`** · Nest `/core` 0 | AC-ATT-03D-GEO-001 · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-03D-05** | **consumer** | **Thiếu tọa độ → GEO-REQ** | Phương thức GPS thiếu lat/lon → **`HRM-ATT-GEO-REQ`** · FAIL silent 2xx · Nest `/core` 0 | AC-ATT-03D-GEO-REQ · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-03D-06** | **cross** | **Empty skip+CTA · seals · ≠DONE** | active=0 → skip + CTA · DENY ensureDefault/seed · F5 · Nest `/core` 0 · ≠ ATT-03d DONE · PLT WS ≠ FR-03d · ≠ residual/thin=ATT-03b · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · peer≠PLT · merge≠UAT · printable false · PAY OUT · DENY invent ASSIGN · DENY invent `att_leave_hold` · DENY gps_locations sole SoT · OVERLAP/SITE/MOB HOLD · ATT-03b `ATT03BQC1-MSM0891H` · ATT-01 `ATT01QC1-MSLZ3KIM` · ATT-11 `ATT11QC1-MSLXTH9P` · ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 GATE/ACT-400/Nest DENY · soft≠CORE-06 DONE · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P · no reopen J-ATT-03B/01/11/10/09/08/02/PLT/CORE-10/09/07/06/05/03/02B/09D..01 · ≠ invent PAY/Word | AC-ATT-03D-EMPTY/F5/≠-*/H/MK-* · O5/O10/O11/O12 · U19 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `attendance_uat_ready` · **≠** `hrm_personnel_uat_ready` · **≠** `contracts_printable_ready` · **≠** claim PLT WS = ATT-03d DONE · **≠** claim residual/thin=ATT-03b DONE · **≠** claim catalog=ATT-01 DONE · **≠** claim LIVE=ATT-11 DONE · **≠** claim AGG=ATT-10 DONE · **≠** claim ATT module UAT · **≠** invent PAY DONE · **narrow ≠ full ATT/PAY module**.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-ATT-03B-01..06** / `ATT03BQC1-MSM0891H` | must_keep ≠ residual/thin=DONE · **≠** claim ATT-03b DONE |
| **J-HRM-ATT-01-01..06** / `ATT01QC1-MSLZ3KIM` | must_keep ≠ catalog=DONE · R-ATT-01-ASSIGN **open** · DENY invent ASSIGN · Nest `/core` 0 · **≠** claim ATT-01 DONE |
| **J-HRM-ATT-11-01..06** / `ATT11QC1-MSLXTH9P` | must_keep ≠ LIVE=DONE · R-ATT-11-WF/CSUM HOLD · **≠** claim ATT-11 DONE |
| **J-HRM-ATT-10-01..06** / `ATT10QC1-MSLWGUYH` | must_keep ≠ AGG=DONE · HOL/MEAL OUT · R-ATT-10-DISP HOLD · **≠** claim ATT-10 DONE |
| **J-HRM-ATT-09-01..06** / `ATT09QC1-MSLUTL9D` | must_keep pending_days · DENY `att_leave_hold` · **≠** claim ATT-09 DONE |
| **J-HRM-ATT-08-01..06** / `ATT08QC1-MSLSL36C` | must_keep HOL-MISS · **≠** claim ATT-08 DONE |
| **J-HRM-ATT-02-01..06** / `ATT02QC1-MSLQZUK7` | must_keep CFG≠DONE · ≠ ATT UAT · **≠** claim ATT-02 DONE |
| **J-HRM-PLT-01-01..06** / `PLT01QC1-MSLPUQIU` | must_keep peer≠PLT DONE · merge≠platform UAT |
| **PLT WS** `ATTWSQA-MSJC3IN9` · CNS-05 `ATTWSQA2-MSJCG47P` | **RETAIN cite** · **≠** ATT-03d DONE alone |
| **J-HRM-CORE-10/09/07/06…** | must_keep · printable **false** · soft≠DONE · Nest `/core` DENY |
| Nest work-sites LIVE / punch GEO | **RETAIN cite** · **≠** ATT-03d DONE alone · PAY **OUT invent DONE** |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03d DONE** · Nest `/core` DENY · C-SLICE · `attendance_uat_ready=false`

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `attendance_uat_ready` | **false** · **DENY** flip |
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** · **DENY** flip |
| `contracts_printable_ready` | **false RETAIN** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim PLT WS / CNS-05 / thin work-sites alone = ATT-03d / FR-03d DONE | **DENIED** (O1/O12) |
| Claim residual/thin = ATT-03b DONE | **DENIED** (O10) |
| Claim catalog = ATT-01 DONE | **DENIED** (O10) · R-ATT-01-ASSIGN **open** |
| Claim LIVE sign/close = ATT-11 DONE | **DENIED** (O10) |
| Claim AGG = ATT-10 DONE | **DENIED** (O10) |
| Claim soft/ATT-08 = ATT-09 DONE | **DENIED** · DENY invent `att_leave_hold` |
| Claim ATT module UAT | **DENIED** (O12) · C-SLICE |
| Claim CFG = ATT-02 DONE | **DENIED** (O6/O10) |
| Claim PLT-01 / platform UAT DONE | **DENIED** |
| Claim CORE-10/09/07 DONE / printable flip | **DENIED** |
| Claim soft = CORE-06 DONE | **DENIED** |
| Invent ASSIGN DONE | **DENIED** · R-ATT-01-ASSIGN **open** |
| Invent `att_leave_hold` | **DENIED** |
| Claim PAY DONE | **DENIED** · **OUT invent** |
| Nest `/core` dual | **DENIED** |
| Settings/`gps_locations` sole SoT | **DENIED** |
| `ensureDefaultWorkSite` / seed | **DENIED** |
| Second geofence table | **DENIED** |
| Invent SITE-UNKNOWN FAIL / OVERLAP warn as GĐ1 DONE | **DENIED** · HOLD |
| Wipe ATT-03b/01/11/10/09/08/02/PLT/CORE | **DENIED** |
| C-SLICE | GWC later ≠ module ATT/PLT/CORE/PAY/personnel UAT ≠ Phase1 |
| must_keep W31 | ATT-03b `ATT03BQC1-MSM0891H` · ≠ residual/thin=DONE |
| must_keep W30 | ATT-01 `ATT01QC1-MSLZ3KIM` · ≠ catalog=DONE · ASSIGN open · Nest `/core` 0 |
| must_keep W29 | ATT-11 `ATT11QC1-MSLXTH9P` · ≠ LIVE=DONE |
| must_keep W28 | ATT-10 `ATT10QC1-MSLWGUYH` · ≠ AGG=DONE · HOL/MEAL OUT · DISP HOLD |
| must_keep W27 | ATT-09 `ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold` |
| must_keep W26 | ATT-08 `ATT08QC1-MSLSL36C` · HOL-MISS |
| must_keep W25 | ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| must_keep W24..W10 | PLT-01 · CORE-10/09/07 · soft≠CORE-06 · CORE-05/03/02b/09d..01 |
| must_keep PLT WS | `ATTWSQA-MSJC3IN9` · `ATTWSQA2-MSJCG47P` · ≠ ATT-03d DONE |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-03B/01/11/10/09/08/02/PLT/CORE-* |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (prefer **NO** second geofence table · ADD residual ONLY if proves closable display/col gap on LIVE `attendance_work_sites`) · then **sa API** F.1 F-ATT-CAT-WS-01/02 + F-ATT-PUNCH-01 physical `/attendance/*` |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md` |
| **ba_trace** | `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` §55 |
| **completion_report** | See §7.1 |
| **next_dispatch_prompt** | See §7.2 |

### 7.1 completion_report

**Closed:** BA AC pack O1–O12 **CONFIRMED** for UC-BP-ATT-03d / FR-UC-BP-ATT-03d against SA Option A: RETAIN LIVE Nest `GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*` + punch `POST …/records` (GEO-001/GEO-REQ · empty skip) + FE Settings GPS Nest bind + PLT WS seals cite; unlock residuals ADMIN/CNS/SOFT/EMPTY/GATE/DISP/≠DONE; OVERLAP/SITE/MOB **HOLD**; AC-ATT-03D-* + VAL-ATT-03D-01..06; mint **J-HRM-ATT-03D-01..06 DRAFT** (U65); ba-data **HOLD default** (no second table); explicit **≠ ATT-03d DONE** · **≠ PLT WS alone=ATT-03d DONE** · **≠ residual/thin=ATT-03b DONE** · **≠ catalog=ATT-01 DONE** · **≠ LIVE=ATT-11 DONE** · **≠ AGG=ATT-10 DONE** · **≠ ATT module UAT** · printable **false** · **C-SLICE** · **PAY OUT** · DENY invent ASSIGN · DENY invent `att_leave_hold` · DENY `gps_locations` sole SoT · DENY `ensureDefaultWorkSite` · Nest `/core` DENY · must_keep ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT/CORE · soft≠CORE-06 · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P · apps/** untouched · no seed.

**Residual (open — not this seat):** ba-data HOLD prove no second table · sa API F.1 deepen cite · Dev wire ONLY if closable DISP gap · QA U65 J-* · QC GWC C-SLICE · OVERLAP/SITE/MOB HOLD · R-ATT-01-ASSIGN still **open** · ATT module UAT **false**.

### 7.2 next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01
role: ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-32 seat #34)
entry_criteria: BA-01 O1–O12 CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md · SA-01 Option A LOCKED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md · depends ATT03BQC1-MSM0891H (≠ residual/thin=ATT-03b DONE) · must_keep ATT01QC1-MSLZ3KIM (≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN DONE · Nest /core 0) · ATT11QC1-MSLXTH9P (≠ LIVE=ATT-11 DONE) · ATT10QC1-MSLWGUYH (≠ AGG=ATT-10 DONE) · ATT09QC1-MSLUTL9D (pending_days · DENY att_leave_hold) · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P (≠ claim = ATT-03d DONE) · ≠ ATT UAT · PAY invent DONE OUT · printable false
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md (O1–O12 · R-ATT-03D-* · ba-data HOLD default · AC-ATT-03D-* · J-HRM-ATT-03D-*)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md (Option A · LIVE F-ATT-CAT-WS + F-ATT-PUNCH · residuals)
  - docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md (D3 · attendance_work_sites SoT · DENY gps_locations sole · DENY ensureDefaultWorkSite)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.4c attendance_work_sites
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-CAT-WS-01/02 · F-ATT-PUNCH-01
  - apps/api/hrm-api (LIVE work-sites + assertWithinWorkSite — read-only cite · ≠ ATT-03d DONE)
exit_criteria:
  - ba-data HOLD default stamp (prefer NO second geofence table · ADD residual ONLY if proves closable typed/display gap on LIVE attendance_work_sites — DENY att_gps_point* mega-table · DENY Nest /core · DENY gps_locations sole SoT · DENY ensureDefaultWorkSite)
  - Explicit ≠ ATT-03d DONE · ≠ PLT WS alone=ATT-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT · DENY invent att_leave_hold · DENY invent ASSIGN DONE · OVERLAP/SITE/MOB HOLD cite
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-DATA-01.md
  - ack_status PASS_TO_PM · next_owner=sa (API-01 F.1 RETAIN cite F-ATT-CAT-WS-01/02 + F-ATT-PUNCH-01 physical /attendance/* · wire residual ONLY if DATA proved closable)
cấm: apps/** · seed · Nest /core invent · invent att_leave_hold dual · invent ASSIGN DONE · wipe ATT-03b/01/11/10/09/08/02/PLT/CORE · honesty flip · claim PLT WS=ATT-03d DONE · claim residual/thin=ATT-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · invent PAY/printable DONE · invent second geofence SoT · gps_locations sole SoT · ensureDefaultWorkSite
```

---

## Explicit locks (footer)

**≠ ATT-03d DONE · ≠ ATT module UAT · ≠ PLT WS alone=ATT-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · printable false · C-SLICE · PAY OUT · R-ATT-01-ASSIGN open · DENY invent ASSIGN · DENY invent `att_leave_hold` · DENY Nest `/core` · DENY `gps_locations` sole SoT · DENY `ensureDefaultWorkSite` · DENY second geofence table · OVERLAP/SITE/MOB HOLD · soft≠CORE-06 · CFG≠ATT-02 · apps/** cấm this seat.**
