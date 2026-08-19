# BA AC pack — Wave-30 ATT cluster · UC-BP-ATT-01 (Quy tắc ca theo bộ phận / nhóm · RETAIN LIVE catalog + gap phân ca)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-30 seat **#32**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (ADD residual only if closable gap for assignment / schedule SoT) · sa API residual unlock after DATA · **DENY** claim catalog alone = ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** CFG=ATT-02 DONE · **printable false RETAIN** · **PAY OUT invent DONE** · **DENY invent `att_leave_hold` dual** · **DENY invent CSUM/INBOX/`lines[]` DONE** · **R-ATT-11-WF/CSUM HOLD RETAIN** · **R-ATT-10-DISP P2 HOLD RETAIN** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** invent `att_leave_hold` · **no** wipe ATT-11 sign/close · **no** wipe ATT-10 AGG/submit · **no** wipe ATT-09 hold · **no** wipe ATT-08 preview · **no** wipe ATT-02/PLT/CORE · **no** soft=CORE-06 DONE · **no** invent PAY/printable/Word/CSUM/INBOX/`lines[]` DONE · **no** claim catalog alone = FR-01 DONE · **no** invent full roster grid GĐ1 DONE) |
| **uc_ids** | `UC-BP-ATT-01` · `FR-UC-BP-ATT-01` |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-11 **`ATT11QC1-MSLXTH9P`** (signatures\|close\|reopen · Nest `/core` sign 0 · **≠ LIVE=ATT-11 DONE** · **R-ATT-11-WF/CSUM/INBOX/EMIT HOLD** · ≠ ATT UAT) · QA **`ATT11QA2-MSLXOKS3`** · must_keep ATT-10 **`ATT10QC1-MSLWGUYH`** (AGG+submit · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT) · ATT-09 **`ATT09QC1-MSLUTL9D`** (hold/settle · `pending_days` · DENY `att_leave_hold`) · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** (printable **false**) · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · **≠ ATT UAT** · PAY invent DONE **OUT** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-01** · Diễn biến **#1–#2 + Thành công** · **BR-BP-SHF-01** · **BR-PLT-02/04/05/06** · partner **TIME-001** · DOC-DELTA **0.36** |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` §6 ATT A1 · F-ATT-SHIFT / F-ATT-RULE cite |
| **ref_api_paper** | **F-ATT-CAT-SHIFT-01/02** · **F-ATT-CAT-SHIFT-EFF-01** · **F-ATT-SHIFT-CNS-01** · **F-ATT-SHIFT-02** (residual) · **F-ATT-SHIFT-01** (alias→CAT) · peer **F-ATT-RULE-01** (ATT-02 · CFG≠DONE) · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `public.work_shifts` · LIVE `public.shift_change_requests` · LIVE `public.attendance_rules` + `public.att_attendance_rule` (ATT-02 peer) · paper `att_shift_assignment` / `att_work_schedule` · Nest `@Controller('core')` **ABSENT** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/work-shifts*` (+ residual `shift-assignments*` same family) · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual · ADR D1 `work_shifts` wins vs XBOS `shifts` REF |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim catalog alone = ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word/CSUM/INBOX/`lines[]` DONE · **DENY** CFG=ATT-02 DONE · **DENY** claim PLT/CORE DONE |
| **Cấm** | Nest `/core` dual · invent `att_leave_hold` dual · wipe ATT-11 sign/close · wipe ATT-10 AGG/submit · wipe ATT-09 hold · wipe ATT-08 preview · wipe ATT-02/PLT/CORE · soft=CORE-06 DONE · invent PAY/printable/Word/CSUM/INBOX/`lines[]` DONE · invent full roster grid GĐ1 DONE without BA lock · claim catalog alone = FR-01 DONE · claim LIVE alone = ATT-11 DONE · claim AGG alone = ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-30 seat #32 — **gap-only RETAIN** LIVE Nest ca catalog + CNS + ATT-02 peer + **residual phân ca / resolve**:

1. **Catalog SoT** = LIVE Nest `GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts*` + `GET …/effective` → `work_shifts` — Settings/`shifts` **REF only** — **≠** ATT-01 DONE from catalog alone.
2. **Phân ca residual** = prefer physical `PUT|POST /api/hrm/attendance/shift-assignments*` (**F-ATT-SHIFT-02**) · map paper `att_shift_assignment` · dept/group/NV · **BR-BP-SHF-01** — FE **Lịch phân ca** remains **GĐ2-HOLD** until residual wired (**≠** invent full roster DONE).
3. **Schedule grain** = thin GĐ1 assignment-by-range **XOR** explicit **OUT** full tuần/tháng grid GĐ2 (match SRS «lưới đầy đủ có thể giai đoạn sau» + FE HOLD).
4. **Resolve** = điểm danh / phạt / giờ chuẩn đọc **ca đang gán** — **không** company-hardcode · kiêm nhiệm = OU chấm active — FAIL: rule A applied to OU B.
5. **CNS Đổi ca** = RETAIN `shift-change-requests` + invent-ban **`HRM-ATT-SHIFT-KEY`** when active>0 · empty → CTA admin · **no seed** · residual FE picker fidelity.
6. **ATT-02 peer** = must_keep `ATT02QC1-MSLQZUK7` · **CFG≠ATT-02 DONE** · penalty mode residual **≠** this seat invent DONE.
7. **Display-ready** = shift + assignment labels (`statusLabelVi`, dept/group/employee, effective range).
8. **Mint** `J-HRM-ATT-01-01..06` DRAFT — catalog CRUD → gán bộ phận/nhóm (residual) → resolve · CNS invent-ban · Nest `/core` 0 · U65 zero-seed · **narrow ≠** ATT/PAY module UAT.
9. **must_keep** ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Nhân sự chấm công (HCNS) | CRUD danh mục ca Nest · gán phân ca bộ phận/nhóm (residual) · soft-retire |
| Quản lý bộ phận | Đọc quy tắc / phân ca đơn vị · không invent mã ca khi đổi ca |
| Nhân viên (NV) | Consumer Đổi ca — chọn Nest khi active>0 |
| Hệ thống (Nest) | Catalog SoT · invent-ban · resolve ca đang gán · scope U19 |
| Group CEO | Scope rollup `main` — U19 list = get = assign = mutate |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT / CORE / PAY | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-ATT-01 Diễn biến #1–#2 + Thành công + BR-BP-SHF-01 + BR-PLT-02/04/05/06 → AC-ATT-01-* · residuals ASSIGN/SCHED/RESOLVE/SCOPE/CNS-FE/DISP/≠DONE · J-HRM-ATT-01-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/attendance/work-shifts*` (+ residual `shift-assignments*`) · paper `/att` + `/core` alias | Nest `/core/…` shift SoT dual · invent second `work_shifts` table · invent `att_leave_hold` |
| Explicit ≠ ATT-01 DONE from catalog alone · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · printable false · C-SLICE · PAY OUT | Claim Option/catalog alone = FR-01 DONE · invent PAY/printable/Word/CSUM/INBOX/`lines[]` DONE · invent full roster GĐ1 DONE |
| Honesty footer · ATT-11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 DONE | Flip ready flags · reopen sealed J-* |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Ca SoT catalog | **YES** — LIVE Nest `work_shifts*` + `/effective` · Settings/`shifts` REF only · paper F-ATT-CAT-SHIFT alias · **≠** ATT-01 DONE from catalog alone · mint **J-HRM-ATT-01-*** — **AC-ATT-01-CAT** · **AC-ATT-01-≠-CAT-DONE** |
| **O2** | Phân ca dept/group | **YES residual** — prefer **F-ATT-SHIFT-02** physical under `/attendance/shift-assignments*` (same Nest family) · map paper `att_shift_assignment` · AC dept/group/NV · BR-BP-SHF-01 — **AC-ATT-01-ASSIGN** · residual **R-ATT-01-ASSIGN** |
| **O3** | Lịch lưới | **YES thin GĐ1 XOR OUT full grid GĐ2** — assignment-by-range GĐ1 closable · full tuần/tháng grid **OUT GĐ2** (FE Lịch phân ca HOLD RETAIN until wired) — **AC-ATT-01-SCHED** · residual **R-ATT-01-SCHED** |
| **O4** | Resolve ca đang gán | **YES** — punch/penalty/hours read **assigned** ca · not company-hardcode · kiêm nhiệm = OU chấm active · FAIL rule A→OU B — **AC-ATT-01-RESOLVE** · residual **R-ATT-01-RESOLVE** |
| **O5** | Consumer Đổi ca | **YES** — RETAIN CNS + `HRM-ATT-SHIFT-KEY` when active>0 · empty CTA · no seed · FE picker fidelity residual — **AC-ATT-01-CNS** · **AC-ATT-01-INVENT-BAN** · residual **R-ATT-01-CNS-FE** |
| **O6** | ATT-02 peer | **YES** — must_keep `ATT02QC1-MSLQZUK7` · **CFG≠ATT-02 DONE** · penalty residual ≠ this seat invent DONE · ≠ reopen ATT-02 as ATT-01 — **AC-ATT-01-MK-ATT02** |
| **O7** | Paper `/core` + `/att` | **YES** — **alias only** — Nest `@Controller('core')` SoT = **FAIL** — **AC-ATT-01-PATH** |
| **O8** | ATT-11/10/09/08/PLT/CORE | **YES** — must_keep stamps **intact** · **≠ LIVE=ATT-11 DONE** · **≠ AGG=ATT-10 DONE** · **R-ATT-11-WF/CSUM HOLD** · **R-ATT-10-DISP HOLD** · **DENY** `att_leave_hold` · **≠** reopen — **AC-ATT-01-MK-*** |
| **O9** | Soft-retire ca | **YES** — `status=inactive` ẩn picker mặc định · history còn · soft ≠ hard-delete default — **AC-ATT-01-SOFT** |
| **O10** | Scope U19 | **YES** — list = get = assign = mutate same `resolveHrmListScope` · Scope **409** AC — **AC-ATT-01-SCOPE** · residual **R-ATT-01-SCOPE** |
| **O11** | PAY / printable / CSUM / INBOX | **YES OUT invent** — printable **false** · CSUM/INBOX/`lines[]` invent DONE **OUT** · PAY QUEUED — **AC-ATT-01-PAY-OUT** · **AC-ATT-01-≠-PRINTABLE** |
| **O12** | Honesty / journeys | **YES false** — all ready flags false · **`attendance_uat_ready=false`** · C-SLICE · Mint **`J-HRM-ATT-01-01..06` DRAFT** (catalog → assign residual → resolve · CNS invent · Nest `/core` 0) — **narrow** · **≠** ATT module UAT · U65 zero-seed — **AC-ATT-01-H** |

**Architecture SoT:** RETAIN LIVE `/attendance/work-shifts*` + EFF + CNS (`HRM-ATT-SHIFT-KEY`) + peer ATT-02 `rules*`/`att_attendance_rule` (CFG≠DONE) + FE Danh sách ca LIVE · Lịch phân ca GĐ2-HOLD · unlock ASSIGN/SCHED/RESOLVE/SCOPE/CNS-FE/DISP/≠DONE · paper F-ATT-SHIFT-02 + F-ATT-CAT-SHIFT + `/core` alias only · U19 list↔get↔assign · ATT-11/10/09/08/02/PLT/CORE **must_keep**.

### Primary API surface (BA lock — O1/O2/O5/O7)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List / GET ca (RETAIN) | **`GET /api/hrm/attendance/work-shifts`** · `GET …/:shiftId` | `/att/…` · `/core/…` **alias only** |
| Admin CRUD ca (RETAIN) | **`POST/PATCH/DELETE …/work-shifts*`** | paper alias |
| Effective picker (RETAIN) | **`GET …/work-shifts/effective`** | paper alias |
| Consumer Đổi ca (RETAIN) | **`POST/PATCH …/shift-change-requests*`** | paper alias |
| Phân ca (residual) | Prefer **`PUT\|POST /api/hrm/attendance/shift-assignments*`** | `PUT /api/hrm/att/shift-assignments` + `/core` **alias only** |
| ATT-02 peer rules | `GET/PATCH /attendance/rules*` | must_keep · **CFG≠ATT-02 DONE** · **≠** invent = ATT-01 DONE |

**Invariant ATT-01-PATH:** Catalog / assign / CNS Network **MUST** hit physical `/api/hrm/attendance/*` — Nest dual `/core` SoT = **FAIL O7**.

**Invariant ATT-01-≠-CAT-DONE:** Claim Danh sách ca CRUD alone = FR-UC-BP-ATT-01 / ATT-01 DONE = **FAIL O1/O12**.

**Invariant ATT-01-ASSIGN:** Company-wide single rule replaces dept/group assignment = **FAIL O2/O4** (BR-BP-SHF-01).

**Invariant ATT-01-RESOLVE:** Punch/penalty uses company-hardcode / wrong OU when assignment exists = **FAIL O4**.

**Invariant ATT-01-INVENT-BAN:** Active>0 + invent shift key/code persist 2xx = **FAIL O5** (must **`HRM-ATT-SHIFT-KEY`**).

**Invariant ATT-01-SCHED-OUT:** Claim full tuần/tháng roster grid = GĐ1 DONE without BA unlock = **FAIL O3**.

**Invariant ATT-01-≠-LIVE-11:** Claim LIVE sign/close alone = ATT-11 DONE = **FAIL O8**.

**Invariant ATT-01-≠-AGG-10:** Claim AGG alone = ATT-10 DONE = **FAIL O8**.

**Invariant ATT-01-≠-09-DONE:** Claim soft/ATT-08 = ATT-09 DONE = **FAIL O8**.

**Invariant ATT-01-≠-UAT:** Claim ATT module UAT / flip `attendance_uat_ready` = **FAIL O12**.

**Invariant ATT-01-≠-PRINTABLE:** Claim printable / Word DONE / flip `contracts_printable_ready` = **FAIL O11/O12**.

**Invariant ATT-01-PAY-OUT:** Invent PAY DONE / claim payroll UAT = **FAIL O11**.

**Invariant ATT-01-CFG≠02:** Claim CFG = ATT-02 DONE / reopen ATT-02 seals = **FAIL O6/O8**.

**Invariant ATT-01-≠-DUAL-HOLD:** Invent `att_leave_hold` = **FAIL O8/O12**.

**Wire codes (RETAIN + residual assert):** `HRM-ATT-SHIFT-KEY` · `HRM-WS-VAL` · `HRM-WS-404` · `HRM-WS-409` · `HRM-VAL-400` · `HRM-SCOPE-409` · sealed ATT-11/10/09/08/02/PLT/CORE codes · **DENY** invent Nest `/core` error family as SoT.

**Display-ready (normative for FE bind):** `{ shift_id, code, name, start_time, end_time, break_minutes?, work_factor?, status, statusLabelVi, department_id?, group_id?, employee_id?, effective_from?, effective_to?, sourceFlags? }` — BA deepen VI labels OK; map paper assignment → LIVE residual table name after ba-data.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-01 DONE** · catalog alone ≠ FR-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · CSUM/INBOX/`lines[]` invent DONE OUT · R-ATT-11-WF/CSUM HOLD · R-ATT-10-DISP P2 HOLD · must_keep ATT-11 `ATT11QC1-MSLXTH9P` · ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · DENY invent `att_leave_hold` · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-30 · Option A) |
|---|----------------------|---------------------------|
| Catalog `work_shifts*` | CRUD + EFF PRESENT | **RETAIN cite** + ≠CAT-DONE AC (**O1**) |
| Settings/`shifts` | REF only | **RETAIN** · DENY dual-write (**O1**) |
| Phân ca dept/group | Nest `shift-assignments` ABSENT · FE Lịch GĐ2-HOLD | **RESIDUAL** ASSIGN (**O2**) · ≠ invent full grid DONE |
| Lịch tuần/tháng | Full grid ABSENT | thin GĐ1 **XOR** OUT GĐ2 (**O3**) |
| Resolve ca gán | PARTIAL (catalog + ATT-02) · assignment resolve ABSENT | **RESIDUAL** RESOLVE (**O4**) |
| Đổi ca CNS | PRESENT + `HRM-ATT-SHIFT-KEY` | **RETAIN cite** + CNS-FE residual (**O5**) |
| ATT-02 rules | SEALED CFG≠DONE | **must_keep peer** (**O6**) |
| Paper `/att` + `/core` | Nest `/core` ABSENT | **Alias only** (**O7**) |
| ATT-11 sign/close | SEALED `ATT11QC1-MSLXTH9P` · WF/CSUM HOLD | **must_keep RETAIN** (**O8**) · ≠ LIVE=DONE |
| ATT-10 AGG | SEALED `ATT10QC1-MSLWGUYH` · DISP HOLD | **must_keep RETAIN** (**O8**) · ≠ AGG=DONE |
| ATT-09/08 | SEALED stamps | **must_keep RETAIN** (**O8**) · DENY `att_leave_hold` |
| Soft-retire | `status=inactive` PRESENT | **RETAIN cite** + AC (**O9**) |
| Scope U19 | list/get catalog | **parity assign/mutate** (**O10**) |
| PAY / printable / CSUM / INBOX | QUEUED / OUT | **OUT invent DONE** (**O11**) |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O12**) |

### 1.1 Disposition **R-ATT-01-ASSIGN**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-01-ASSIGN` |
| **Scope** | **IN-SCOPE residual** — F-ATT-SHIFT-02 dept/group/employee assignment SoT |
| **PASS** | Upsert assignment by OU/group/NV + `shift_id` + date range · F5 còn · scope parity · **không** company-wide rule thay assignment |
| **OUT** | Invent Nest `/core` · invent second shifts catalog · claim catalog alone = FR-01 DONE |
| **Rationale** | SRS Diễn biến #2 · BR-BP-SHF-01 · TIME-001 · SA O2 |
| **ba-data** | **HOLD default** — ADD only if closable col/writer for assignment SoT proven |
| **DENY** | Claim FE Lịch HOLD alone = ATT-01 FAIL without residual footer · invent full roster as GĐ1 DONE |

### 1.2 Disposition **R-ATT-01-SCHED**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-01-SCHED` |
| **Scope** | **IN-SCOPE grain lock** — thin GĐ1 assignment-by-range **XOR** **OUT** full tuần/tháng grid GĐ2 |
| **Footer** | Full grid = **GĐ2 OUT** until BA unlock · FE Lịch phân ca HOLD **RETAIN** until ASSIGN wire |
| **Rationale** | SRS «lưới đầy đủ có thể giai đoạn sau» · SA O3 |
| **ba-data** | **HOLD** — ADD schedule table only if thin GĐ1 closable (prefer assignment range on same spine) |
| **DENY** | Claim mega calendar GĐ1 DONE · invent `att_work_schedule` as ATT-01 DONE without wire |

### 1.3 Disposition **R-ATT-01-RESOLVE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-01-RESOLVE` |
| **Scope** | **IN-SCOPE AC** — punch/penalty/hours read **assigned** ca |
| **PASS** | OU A rule/ca ≠ OU B · kiêm nhiệm uses active OU · mid-period change: before keeps old · after uses new (SRS đặc biệt) |
| **FAIL** | Rule A applied to OU B · company-hardcode overrides assignment |
| **Rationale** | Diễn biến #2 · BR-BP-SHF-01 · SA O4 |
| **ba-data** | **HOLD** — resolve reads LIVE assignment residual when ADD |
| **DENY** | Invent PAY/ATT-03b DONE from resolve AC |

### 1.4 Disposition **R-ATT-01-SCOPE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-01-SCOPE` |
| **Scope** | **IN-SCOPE AC** — U19 list↔get↔assign↔mutate same resolver |
| **PASS** | OOS → **409** `HRM-SCOPE-409` (or sealed scope code) · Group CEO `main` rollup documented |
| **Rationale** | SA O10 · U19 |
| **ba-data** | **HOLD** |
| **DENY** | Different scope on get-by-id vs assign |

### 1.5 Disposition **R-ATT-01-CNS-FE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-01-CNS-FE` |
| **Scope** | **IN-SCOPE residual FE** — Đổi ca picker Nest fidelity when active>0 |
| **PASS** | Picker ∈ EFF Nest · invent → **`HRM-ATT-SHIFT-KEY`** · empty → CTA · no seed · F5 không giữ mã lạ |
| **Footer** | Hardcoded five-shift list = bootstrap **only** when EFF=0 — **≠** SoT when Nest active>0 |
| **Rationale** | F-ATT-SHIFT-CNS-01 · AC-PLT-ATT-SHIFT-01* · SA O5 |
| **ba-data** | **HOLD** — LIVE `shift_change_requests` RETAIN |
| **DENY** | Seed catalog to pass QA · claim CNS alone = ATT-01 DONE |

### 1.6 Disposition **R-ATT-01-DISP**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-01-DISP` |
| **Scope** | **IN-SCOPE residual** — display-ready shift + assignment labels |
| **PASS** | `statusLabelVi` · times · dept/group/NV labels present on list/detail after 2xx |
| **OUT** | Invent PAY/`lines[]` DONE from display fields |
| **ba-data** | **HOLD** |
| **DENY** | Claim DISP alone = FR-01 DONE |

### 1.7 Disposition **R-ATT-01-≠DONE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-01-≠DONE` |
| **Scope** | **IN-SCOPE footer** — catalog alone ≠ FR-01 · ≠ ATT UAT · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 |
| **PASS** | Every evidence footer carries ≠DONE locks |
| **Rationale** | SA O1/O8/O12 · C-SLICE |
| **ba-data** | **HOLD** |
| **DENY** | Honesty flip · claim Option alone = module UAT |

---

## 2. Use-case AC pack (measurable)

### Happy path AC

| AC-ID | Criterion | Pass evidence | Map |
|-------|-----------|---------------|-----|
| **AC-ATT-01-CAT** | Admin CRUD Nest ca (mã·tên·giờ·hệ số) → 2xx → list + F5 còn | Network `…/work-shifts*` · FE Danh sách ca | O1 · Diễn biến #1 · F-ATT-CAT-SHIFT-02 |
| **AC-ATT-01-EFF** | `GET …/effective` / list active = picker SoT when active>0 | EFF response · FE picker | O1/O5 · F-ATT-CAT-SHIFT-EFF-01 |
| **AC-ATT-01-ASSIGN** | Gán ca theo bộ phận/nhóm/NV + range → 2xx → F5 còn (residual wire) | Network `…/shift-assignments*` · FE after 2xx | O2 · Diễn biến #2–#4 · F-ATT-SHIFT-02 |
| **AC-ATT-01-RESOLVE** | Điểm danh/phạt đọc ca đang gán đúng OU | Probe/FE: OU A ≠ OU B hours/penalty | O4 · Diễn biến #2 · BR-BP-SHF-01 |
| **AC-ATT-01-CNS** | Đổi ca chọn Nest khi active>0 · F5 còn | POST shift-change 2xx · picker Nest | O5 · F-ATT-SHIFT-CNS-01 |
| **AC-ATT-01-SOFT** | Soft-retire `inactive` → ẩn picker · history còn | List default excludes inactive | O9 · BR-PLT-04 |
| **AC-ATT-01-F5** | Sau mutate catalog/assign/CNS → F5 dữ liệu còn | Browser F5 | O12 · U65 |
| **AC-ATT-01-DISP** | Display-ready labels VI trên list/detail | FE bind fields | O12 · R-ATT-01-DISP |

### Fail / exception AC

| AC-ID | Criterion | Pass evidence | Map |
|-------|-----------|---------------|-----|
| **AC-ATT-01-INVENT-BAN** | Active>0 + invent mã → **`HRM-ATT-SHIFT-KEY`** · không persist | Network 4xx code · F5 không còn mã lạ | O5 |
| **AC-ATT-01-EMPTY** | EFF=0 → CTA admin · no seed · hardcode tạm ≠ SoT claim | Empty 200[] + CTA · no seed script | O5 · SRS đặc biệt |
| **AC-ATT-01-FAIL-RESOLVE** | Rule A áp OU B = FAIL | Evidence shows wrong OU blocked/corrected | O4 |
| **AC-ATT-01-SCOPE** | OOS assign/get → scope **409** | Network `HRM-SCOPE-409` | O10 |
| **AC-ATT-01-PATH** | Nest `/core` SoT for shifts/assign = FAIL | Nest `@Controller('core')` **0** | O7 |
| **AC-ATT-01-≠-CAT-DONE** | Catalog alone ≠ ATT-01 DONE | Footer ≠DONE | O1/O12 |
| **AC-ATT-01-≠-LIVE-11** | ≠ LIVE=ATT-11 DONE | Footer cite `ATT11QC1-MSLXTH9P` | O8 |
| **AC-ATT-01-≠-AGG-10** | ≠ AGG=ATT-10 DONE | Footer cite `ATT10QC1-MSLWGUYH` | O8 |
| **AC-ATT-01-≠-09** | ≠ soft/ATT-08=ATT-09 DONE · DENY `att_leave_hold` | Footer | O8 |
| **AC-ATT-01-≠-UAT** | ≠ ATT module UAT · no honesty flip | Ready flags false | O12 |
| **AC-ATT-01-PAY-OUT** | PAY/printable/CSUM/INBOX invent DONE OUT | Footer OUT | O11 |
| **AC-ATT-01-≠-PRINTABLE** | printable false RETAIN | `contracts_printable_ready=false` | O11 |
| **AC-ATT-01-MK-ATT02** | CFG≠ATT-02 DONE · peer RETAIN | Cite `ATT02QC1-MSLQZUK7` | O6 |
| **AC-ATT-01-SCHED-OUT** | Full grid GĐ1 invent DONE = FAIL | Footer GĐ2 OUT | O3 |
| **AC-ATT-01-H** | C-SLICE · U65 zero-seed · J-* DRAFT only | Journey mint + honesty | O12 |

### Business rule table

| Condition | Action | Outcome |
|-----------|--------|---------|
| Admin CREATE N+1 ca Nest | Persist `work_shifts` | List/EFF cập nhật · **≠** FR-01 DONE alone |
| Settings/`shifts` REF | Read-only merge | Nest wins · DENY dual-write |
| Assignment dept A ≠ dept B | Persist separate assignments | Resolve reads assigned ca (BR-BP-SHF-01) |
| Active shifts >0 + invent code on Đổi ca | Reject | **`HRM-ATT-SHIFT-KEY`** · no persist |
| Active =0 | Soft skip invent + CTA | No seed · hardcode tạm ≠ SoT |
| Soft-retire inactive | Hide from default picker | History retained |
| Kiêm nhiệm multi-OU | Rule/ca theo OU chấm active | No company-hardcode |
| Mid-period đổi gán | Before = ca cũ · after = ca mới | SRS đặc biệt |
| Nest `/core` as SoT | DENY | FAIL PATH |
| Catalog CRUD only | Footer ≠DONE | ≠ ATT-01 / ≠ ATT UAT |

---

## 3. Journeys minted (DRAFT · U65)

| J-ID | Intent (browser FE) | AC map |
|------|---------------------|--------|
| **J-HRM-ATT-01-01** | Login → Cài đặt chấm công / Danh sách ca → CRUD Nest ca → Lưu → F5 còn · Nest `/core` 0 · no seed · ≠ CAT=DONE | AC-ATT-01-CAT/EFF/F5/PATH/≠-CAT-DONE · O1/O7/O9 · **DRAFT** |
| **J-HRM-ATT-01-02** | Gán ca theo bộ phận/nhóm (residual ASSIGN) → Lưu → F5 còn · Nest `/core` 0 · ≠ invent full grid DONE | AC-ATT-01-ASSIGN/SCHED-OUT/SCOPE · O2/O3/O10 · **DRAFT** |
| **J-HRM-ATT-01-03** | Resolve: OU A vs OU B — giờ/phạt theo ca đang gán · Nest `/core` 0 · ≠ company-hardcode | AC-ATT-01-RESOLVE/FAIL-RESOLVE · O4 · **DRAFT** |
| **J-HRM-ATT-01-04** | Đổi ca: active>0 invent → **`HRM-ATT-SHIFT-KEY`** · F5 không giữ mã lạ · Nest `/core` 0 · no seed | AC-ATT-01-CNS/INVENT-BAN · O5 · **DRAFT** |
| **J-HRM-ATT-01-05** | Soft-retire ca · empty EFF CTA · Nest `/core` 0 · no seed | AC-ATT-01-SOFT/EMPTY · O5/O9 · **DRAFT** |
| **J-HRM-ATT-01-06** | F5 · Nest `/core` 0 · ≠ ATT-01 DONE · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · peer≠PLT · merge≠UAT · printable false · PAY OUT · CSUM/INBOX/`lines[]` OUT · DENY invent `att_leave_hold` · ATT-11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 · R-ATT-11-WF/CSUM HOLD · R-ATT-10-DISP HOLD · no reopen seals · ≠ invent PAY/Word | AC-ATT-01-F5/≠-*/H/MK-* · O6/O8/O11/O12 · U19 · **DRAFT** |

**Trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§53** · **DRAFT** only — **not** UF 🟢 · **not** PROGRAM_JOURNEY_MAP reopen of sealed peers.

---

## 4. Residual unlock map (for DATA / API / Dev)

| Residual | BA status | ba-data | Next |
|----------|-----------|---------|------|
| **R-ATT-01-ASSIGN** | IN-SCOPE · closable if physical writer | **HOLD** → ADD only if closable | sa API F-ATT-SHIFT-02 deepen |
| **R-ATT-01-SCHED** | thin GĐ1 XOR OUT full GĐ2 | **HOLD** | Prefer assignment range · DENY mega grid DONE |
| **R-ATT-01-RESOLVE** | IN-SCOPE AC after ASSIGN | **HOLD** | Dev wire after API |
| **R-ATT-01-SCOPE** | IN-SCOPE AC | **HOLD** | parity tests |
| **R-ATT-01-CNS-FE** | FE residual · LIVE CNS RETAIN | **HOLD** | Dev-FE picker fidelity |
| **R-ATT-01-DISP** | Display-ready | **HOLD** | FE bind |
| **R-ATT-01-≠DONE** | Footer locks | N/A | Every seat |
| Peer **R-ATT-11-WF/CSUM** | HOLD RETAIN | N/A | ≠ invent DONE |
| Peer **R-ATT-10-DISP** | P2 HOLD RETAIN | N/A | ≠ invent DONE |

**ba-data default:** **HOLD** — LIVE `work_shifts` + `shift_change_requests` + ATT-02 rules RETAIN = catalog/CNS SoT. **ADD residual ONLY** if BA/DATA proves closable assignment/schedule physical cols/writer under `/attendance/*` family. **DENY** invent Nest `/core` · second shifts table · `att_leave_hold` · PAY/printable/CSUM/INBOX.

---

## 5. must_keep checklist (copy)

| Lock | Rule |
|------|------|
| must_keep W29 | ATT-11 `ATT11QC1-MSLXTH9P` · signatures\|close\|reopen · Nest `/core` sign 0 · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM/INBOX/EMIT HOLD · ≠ ATT UAT |
| must_keep W28 | ATT-10 `ATT10QC1-MSLWGUYH` · AGG+submit · Nest `/core` AGG 0 · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · ≠ ATT UAT |
| must_keep W27 | ATT-09 `ATT09QC1-MSLUTL9D` · hold/settle · pending_days · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT |
| must_keep W26 | ATT-08 `ATT08QC1-MSLSL36C` · preview · T6→T2=2 · HOL-MISS · ALIGN · client-days≠DONE · ≠ ATT UAT |
| must_keep W25 | ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 |
| must_keep W24 | PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| must_keep W23 | CORE-10 `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE |
| must_keep W22 | CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE |
| must_keep W21 | CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE |
| must_keep W20..W10 | soft≠CORE-06 DONE · CORE-05 · CORE-03 · CORE-02b · CORE-09d..01 · 08 · 02 · 01 |
| Catalog LIVE | RETAIN `work_shifts*` + EFF + CNS · **≠** ATT-01 DONE alone |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (ADD residual only if closable gap for assignment / schedule SoT on LIVE spine) · then **sa API** F.1 F-ATT-CAT-SHIFT-* + F-ATT-SHIFT-CNS (+ wire F-ATT-SHIFT-02 residual ONLY if closable) |
| **ba-data** | **HOLD** (default) — LIVE `work_shifts` + `shift_change_requests` + ATT-02 rules RETAIN · FE Lịch GĐ2-HOLD · full grid OUT GĐ2 · **DENY** invent Nest `/core` · **DENY** invent `att_leave_hold` · **DENY** invent PAY/printable/CSUM/INBOX · reopen **ADD/REQUIRED** only if DATA proves closable assignment/schedule gap |
| **sa API-01** | After HOLD stamp — F.1 deepen F-ATT-CAT-SHIFT-01/02/EFF + F-ATT-SHIFT-CNS-01 · wire F-ATT-SHIFT-02 residual ONLY if closable · RETAIN physical `/attendance/…` · paper `/att`+`/core` alias only · **DENY** Nest dual · **DENY** invent `att_leave_hold` · **DENY** invent PAY · **DENY** claim catalog=ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** wipe ATT-11/10/09/08/02/PLT/CORE · **DENY** invent PAY/printable/Word/CSUM/INBOX/`lines[]` · **DENY** invent full roster GĐ1 DONE · **DENY** claim catalog = ATT-01 DONE · **DENY** claim ATT UAT |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-30 seat #32)
uc_ids: UC-BP-ATT-01 · FR-UC-BP-ATT-01
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md · SA Option A · R-ATT-01-ASSIGN/SCHED/RESOLVE/SCOPE/CNS-FE/DISP/≠DONE · thin GĐ1 XOR OUT full grid GĐ2 · printable false · ATT11QC1-MSLXTH9P sign/close RETAIN (≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM/INBOX/EMIT HOLD · Nest /core sign 0) · ATT10QC1-MSLWGUYH AGG/submit RETAIN (≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · Nest /core AGG 0) · ATT09QC1-MSLUTL9D hold/settle RETAIN (pending_days · DENY att_leave_hold · Nest /core leave 0 · ≠ soft/ATT-08=ATT-09 DONE) · ATT08QC1-MSLSL36C preview RETAIN · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU peer≠PLT · merge≠UAT · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ ATT UAT · PAY OUT · ≠ catalog alone = ATT-01 DONE
spec_ref: F-ATT-CAT-SHIFT-01/02/EFF · F-ATT-SHIFT-CNS-01 · F-ATT-SHIFT-02 residual prefer /api/hrm/attendance/shift-assignments* · paper /att + /core alias only · LIVE work_shifts + shift_change_requests · BR-BP-SHF-01 · TIME-001 · ≠ ATT-01 DONE from catalog alone · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — LIVE work_shifts + shift_change_requests + ATT-02 att_attendance_rule RETAIN = catalog/CNS/peer SoT — DENY invent second shifts table · DENY invent att_leave_hold dual · DENY Nest /core dual
2) CONFIRM HOLD — FE Lịch phân ca GĐ2-HOLD · full tuần/tháng grid OUT GĐ2 — thin assignment-by-range GĐ1 ONLY if closable — ≠ invent full roster DONE · ≠ FR-01 DONE from catalog alone
3) ADD residual ONLY if proves closable physical writer/cols for F-ATT-SHIFT-02 assignment (dept/group/NV + date range) under /attendance/* family (prefer map paper att_shift_assignment → LIVE name) — else footer HOLD + residual R-ATT-01-ASSIGN open — DENY Nest /core · DENY invent silent cols
4) Cite display-ready DTO: shift_id · code · name · start_time · end_time · break_minutes? · work_factor? · status · statusLabelVi · department_id? · group_id? · employee_id? · effective_from? · effective_to? · sourceFlags?
5) RETAIN ATT-11 ATT11QC1-MSLXTH9P sign/close · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD · ATT-10 ATT10QC1-MSLWGUYH AGG/submit · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · ATT-09 ATT09QC1-MSLUTL9D hold/settle pending_days · DENY att_leave_hold · ATT-08 ATT08QC1-MSLSL36C preview · ATT-02 ATT02QC1-MSLQZUK7 CFG≠DONE · PLT-01 PLT01QC1-MSLPUQIU · CORE-10 CORE10QC1-MSLP0EJB · CORE-09 printable false · CORE-07 GATE 409 · ACT-400 · Nest /core DENY · soft≠CORE-06 DONE
6) DENY wipe ATT-11/10/09/08/02/PLT/CORE · invent att_leave_hold dual · invent PAY/printable/Word/CSUM/INBOX/lines[] DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · honesty flip · reopen sealed J-HRM-ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · apps/**
7) Unlock next: sa API F.1 F-ATT-CAT-SHIFT-* + F-ATT-SHIFT-CNS (+ wire F-ATT-SHIFT-02 residual ONLY if closable) — physical /attendance/* — paper /att + /core alias only — residual wire ONLY after DATA stamp — PAY remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (F.1 · wire-only after HOLD/ADD)
cấm: apps/** · seed · Nest /core dual invent · invent att_leave_hold dual · wipe ATT-11/10/09/08/02/PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable/Word/CSUM/INBOX/lines[] DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · invent full roster grid GĐ1 DONE
```

---

## 7. completion_report

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-ATT-01 / FR-UC-BP-ATT-01: map BR-BP-SHF-01 + BR-PLT-02/04/05/06 + TIME-001 to LIVE Nest `GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts*` + `/effective` + `shift-change-requests`/`HRM-ATT-SHIFT-KEY` + peer ATT-02 rules/`att_attendance_rule` (CFG≠DONE) + FE Danh sách ca LIVE (Lịch phân ca GĐ2-HOLD); residuals R-ATT-01-ASSIGN/SCHED/RESOLVE/SCOPE/CNS-FE/DISP/≠DONE for F-ATT-SHIFT-02 phân ca bộ phận/nhóm + resolve ca đang gán + thin GĐ1 XOR OUT full grid GĐ2; paper F-ATT-CAT-SHIFT + F-ATT-SHIFT-02 + `/att`+`/core` alias only; **must_keep** ATT-11 sign/close (`ATT11QC1-MSLXTH9P` · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD) · ATT-10 AGG (`ATT10QC1-MSLWGUYH` · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP HOLD) · ATT-09 hold (`ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold`) · ATT-08 preview (`ATT08QC1-MSLSL36C`) · ATT-02/PLT/CORE; minted **J-HRM-ATT-01-01..06 DRAFT** (U65 narrow · ≠ catalog alone = ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · C-SLICE · PAY OUT · DENY CSUM/INBOX/`lines[]` DONE); ba-data **HOLD default** (ADD only assignment/schedule closable); DENY Nest `/core` dual · invent `att_leave_hold` · invent PAY/printable/Word · honesty flip · seed · apps/**; honesty footer **false**. |
| **next_owner** | `ba-data` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md` |

---

*End BA-01 · O1–O12 CONFIRMED · 2026-08-09*
