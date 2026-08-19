# Process×Company Instance TC Pack — `HRM-WF-INSTANCE-MATRIX` · Submit + approve (web/mobile)

| Meta | Value |
|------|--------|
| **pack_id** | `HRM-WF-INSTANCE-MATRIX` |
| **surface** | `hrm-web` + `hrm-mobile` (+ approve via `xbos-cc` inbox when bridge AS-IS) |
| **route(s)** | `/hr/recruitment*` · `/hr/attendance*` · `/hr/settings*` · Mobile Leave/ManagerApprovals · CC `/command-center/inbox` |
| **HDSD** | HRM CH tuyển dụng / chấm công · Mobile ESS Ch09–12 · CC CH04 Inbox · `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` UF-XBOS-08/09/15 · UF-HRM-08/12 |
| **Program SoT** | `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §5–§7 · U84 DoD §7.2 |
| **Taxonomy** | `docs/program/matrices/PO_WF_PROCESS_TAXONOMY.md` |
| **Company matrix** | `docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md` **§2** |
| **Def side (XREF only)** | **`docs/qa/testcases/xbos/XBOS-WF-PROCESS-MATRIX.md`** — TC-WFM-* · **không** copy designer chrome |
| **Inbox approve (XREF)** | **`docs/qa/testcases/xbos/XBOS-INBOX-CAT.md`** — TC-XIC-WF-* / TC-XIC-CG-* / TC-XIC-EXT-* |
| **Leave mobile (XREF)** | **`docs/qa/testcases/hrm-mobile/MOB-LEAVE-APPR.md`** — TC-MOB-LV-* |
| **Rec / Att depth (XREF)** | `HRM-RECRUITMENT.md` · `HRM-ATTENDANCE.md` · `MOB-ATTENDANCE.md` |
| **SRS / UC** | UC-XBOS-13..15 · FR-UC-H03 · UC-HRM-MOB-06/08 · leave/recruit bridges TechSpec §16–18 |
| **author** | qa · `PO-ECO-TC-HRM-WF-INSTANCE-MATRIX-01` |
| **date** | 2026-08-03 · exec stamp **2026-08-04** `U84-PRIMARY-EXEC-ROLLUP-01` |
| **ack_status** | **SYNTHED** · `PO-ECO-TC-SYNTH-WF-CAT-01` · Primary exec rollup below |
| **code_lock** | `PO_WF_CANDIDATE_CODE_LOCK.md` §3–§6 — LOCK_CODE inventory = **GOVERNANCE_LOCK**; SPEC_GAP = no spawn assert |
| **depth_gate** | Primary cell map ☑ · Instance+approve XREF ☑ · Spot samples ☑ · Leave L2 SPEC_GAP ☑ · CANDIDATE inventory ☑ · Trace ☑ |
| **Locks** | **U65** FE-only precond (Gửi đơn / Gửi duyệt QT / Extension / YC chỉnh CC) — **cấm** seed inbox · **cấm** invent `workflowCode` · **cấm** claim leave L2 / T_L1 PASS · Status **PLANNED** · `uat_done: false` |

> Chuẩn: IEEE 829 / ISO 29119 lean · Mỗi ô **Primary** AS-IS §2 = ≥1 TC **instance (submit)** + 1 dòng **approve XREF** · Designer/canvas = pack WFM only.

---

## 0. Spec read ack

| Source | Path | Use |
|--------|------|-----|
| Taxonomy | `PO_WF_PROCESS_TAXONOMY.md` | AS-IS vs CANDIDATE · actors · leave L1→L2 SPEC_GAP |
| Company×process | `PO_WF_CATALOG_COMPANY_MATRIX.md` §2 | Primary / Spot / Template |
| Program | `PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §5–§7 | DoD instance matrix |
| Def matrix | `XBOS-WF-PROCESS-MATRIX.md` | TC-WFM-* precond def @ CO-HOLD |
| Inbox | `XBOS-INBOX-CAT.md` | TC-XIC-* approve/reject |
| Mobile leave | `MOB-LEAVE-APPR.md` | TC-MOB-LV-CR / MGR |
| Rec pack | `HRM-RECRUITMENT.md` | FN-*-SUBMIT-WF · TC-REC-* |
| Att pack | `HRM-ATTENDANCE.md` · `MOB-ATTENDANCE.md` | leave + update-requests + OT |

---

## 1. Dual-surface index (không nhân bản chrome)

| Concern | Pack SoT | This pack does |
|---------|----------|----------------|
| WF designer create+save @ HOLD | `XBOS-WF-PROCESS-MATRIX` TC-WFM-* · `XBOS-WF-DESIGNER` | **XREF** precond only |
| Inbox card / drawer / gov approve | `XBOS-INBOX-CAT` TC-XIC-* | **XREF** approve path |
| Leave wizard + ManagerApprovals | `MOB-LEAVE-APPR` TC-MOB-LV-* | **XREF** + matrix row `co_key` |
| Rec plan/req/cand chrome | `HRM-RECRUITMENT` | **XREF** FN + matrix `co_key` persona |
| Att sheets / OT / update-req chrome | `HRM-ATTENDANCE` · `MOB-ATTENDANCE` | **XREF** + matrix Primary ATT |
| Catalog extension UI | `XBOS-INBOX-CAT` EXT · CAT-MEMBER apply | Instance @ CO-DL + gov AP |

---

## 2. Primary cell coverage map (§2 AS-IS P0)

Legend: **INST** = submit from FE · **AP** = approve path (XBOS inbox **or** HRM/Mobile manager) · Map from taxonomy.  
**exec_status (U84-PRIMARY-EXEC-ROLLUP-01 · 2026-08-04):** `EVIDENCED` = HP+AP browser FE path · `BLOCKED-EXTERNAL` = env/bootstrap (not product FAIL invent) · `OPEN` = in-flight / not stamped.

| process_id | Map | `workflowCode` / note | Primary `co_key` | INST TC | Approve XREF | Channel | `hdsd_align` | **exec_status** | Evidence |
|------------|-----|----------------------|------------------|---------|--------------|---------|--------------|-----------------|----------|
| **P-REC-PLAN** | AS-IS | `hrm_recruitment_plan_approval` | **CO-TMDV** | TC-HIM-REC-PLAN-TMDV-HP-001 | TC-HIM-REC-PLAN-TMDV-AP-001 → **TC-XIC-WF-HP-002/003** | web | HDSD Tuyển dụng · Gửi duyệt QT KH | **EVIDENCED** | `docs/qa/evidence/u78-u84-primary-rec-plan-tmdv-01.md` |
| **P-REC-REQ** | AS-IS | `hrm_requisition_approval` | **CO-TMDV** (tài xế) | TC-HIM-REC-REQ-TMDV-HP-001 | TC-HIM-REC-REQ-TMDV-AP-001 → **TC-XIC-WF-HP-003** | web | `hdsd-requisition-submit-wf` | **EVIDENCED** | `docs/qa/evidence/u78-u84-primary-rec-req-tmdv-01-r1.md` |
| **P-REC-REQ** | AS-IS | same | **CO-VISUN** (HDV) | TC-HIM-REC-REQ-VISUN-HP-001 | TC-HIM-REC-REQ-VISUN-AP-001 → **TC-XIC-WF-HP-003** | web | same · job_title HDV | **EVIDENCED** | `docs/qa/evidence/u78-u84-primary-rec-req-visun-01.md` |
| **P-REC-PIPE** | AS-IS | `hrm_candidate_pipeline` | **CO-TMDV** | TC-HIM-REC-PIPE-TMDV-HP-001 | TC-HIM-REC-PIPE-TMDV-AP-001 → **TC-XIC-WF-HP-002/003** | web | Candidate roadmap · Offer | **EVIDENCED** | `docs/qa/evidence/u78-u84-primary-rec-pipe-tmdv-01.md` |
| **P-LEAVE** | AS-IS | `hrm_leave_approval` / `hrm_leave` | **CO-DL** | TC-HIM-LEAVE-DL-HP-001 | TC-HIM-LEAVE-DL-AP-001 → **TC-MOB-LV-MGR-HP-001** **or** **TC-XIC-WF-HP-004** | web+mobile | ESS create · QL Duyệt | **BLOCKED-EXTERNAL** | `docs/qa/evidence/r-u84-leave-dl-persona-scope-01.md` · prior `u78-u84-primary-leave-dl-01.md` |
| **P-ATT-ADJ** | AS-IS HRM · XBOS **GOVERNANCE_LOCK** | HRM path OK · XBOS `hrm_attendance_adjustment_approval` **not in constants** | **CO-TMDV** | TC-HIM-ATT-TMDV-HP-001 | TC-HIM-ATT-TMDV-AP-001 → **MOB Mgr / HRM att approve** · **TC-XIC BLOCKED** until bridge | web+mobile | YC chỉnh CC · QL ca | **EVIDENCED** | `docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r2.md` |
| **P-CAT-EXT** | AS-IS | `wf_hrm_catalog_extension_xe_du_lich` | **CO-DL** Extension FE | TC-HIM-CAT-DL-HP-001 | TC-HIM-CAT-HOLD-AP-001 → **TC-XIC-EXT-HP-001** → **TC-XIC-CG-HP-001** | web | UF-15 → UF-09 | **EVIDENCED** | `docs/qa/evidence/u78-u84-primary-cat-ext-dl-01.md` |

**Primary exec tally (post VISUN):** **EVIDENCED 6/7** · **BLOCKED-EXTERNAL 1/7** (P-LEAVE@CO-DL) · **OPEN 0/7**. Design SYNTH ≠ UAT DONE. VISUN evidence: `docs/qa/evidence/u78-u84-primary-rec-req-visun-01.md` · prior rollup: `docs/qa/evidence/u84-primary-exec-rollup-01.md`.

**P-OT** Primary @ CO-TMDV = **CANDIDATE** → §7 SPEC_GAP inventory only (no INST HP claiming XBOS spawn).

**Leave L2 / T_L1:** TC-HIM-LEAVE-DL-SG-L2-001 — **SPEC_GAP** · **không** claim ladder PASS (taxonomy R-PO-WF-01 · GAP-LEAVE-LADDER-01).

---

## 3. Shared precond (U65)

| Item | Value |
|------|--------|
| Def precond (AS-IS bridge) | TC-WFM-* HP @ **CO-HOLD** đã Lưu active **hoặc** preset bridge có sẵn trên env — tạo từ FE designer, **không** seed |
| Instance | Login đúng persona/`co_key` → menu SRS → nhập → **Gửi / Gửi duyệt / Xác nhận** trên UI |
| Approve | Task phải xuất hiện sau instance FE; inbox trống = **BLOCKED** — **cấm** `pnpm seed:workflow:inbox` |
| Scope | Plane A org `companyId` + Plane B HRM slug per matrix §1 — ghi cả hai trong evidence khi execute |
| Spot | ≥1 sample/company recommended (§6) — không thay Primary |

### 3.1 Persona / scope cheat-sheet

| `co_key` | Web persona (pilot) | HRM op slug | Notes |
|----------|---------------------|-------------|-------|
| CO-HOLD | `ceo@xe.vn` | `holding` | Gov approve P-CAT-EXT · inbox rollup |
| CO-TMDV | Group CEO apply/embed **or** member ops TBD | `trsport` | Primary REC/ATT/OT logistics |
| CO-VISUN | Group CEO embed target | `logistics` | Primary YCTD HDV |
| CO-DL | `du-lich.ceo@xe.vn` · leave ladder Primary | `finance` | Leave Primary · Extension FE |
| CO-VN | Group CEO embed | `services` | Spot REC/LEAVE · CANDIDATE Primary office |
| Mobile leave | Submit `uat.nv0003@xe.vn` · Appr `uat.nv0001@xe.vn` | UUID scope | **cấm** ceo@ làm L1 leave |

---

## 4. Screen / function inventory (instance slice — XREF depth packs)

### 4.1 Screens (instance + approve entry only)

| screen_id | Surface | Route / trigger | Pack chrome SoT |
|-----------|---------|-----------------|-----------------|
| SCR-REC-PLAN-DET | web | `/hr/recruitment` tab plans → detail | HRM-RECRUITMENT SCR-PLAN-* |
| SCR-REC-REQ-DET | web | tab requisitions → detail | SCR-REQ-* |
| SCR-REC-CAND-DET | web | candidates → detail / pipeline | SCR-CAND-* |
| SCR-ATT-LEAVE | web | `/hr/attendance` tab Nghỉ phép | HRM-ATTENDANCE |
| SCR-ATT-UPD | web | Yêu cầu ▾ điều chỉnh CC | HRM-ATTENDANCE SCR-REQ-UPDATE |
| SCR-MOB-LEAVE-CR | mobile | FAB Tạo đơn nghỉ | MOB-LEAVE-APPR |
| SCR-MOB-MGR | mobile | ManagerApprovals | MOB-LEAVE-APPR |
| SCR-CC-INBOX | xbos | `/command-center/inbox` | XBOS-INBOX-CAT |
| SCR-CAT-EXT | xbos | `?settings=company_group_hr` | XBOS-INBOX-CAT EXT |
| SCR-CAT-GOV | xbos | `?settings=hrm_catalog_governance` | XBOS-INBOX-CAT CG |

**Đếm (this pack):** pages/entry=10 · dialogs = XREF depth packs

### 4.2 Key fields (matrix-relevant)

| field_id | UI label | screen_id | notes |
|----------|----------|-----------|-------|
| F-PLAN-WF-SUBMIT | Gửi duyệt QT | SCR-REC-PLAN-DET | spawn `hrm_recruitment_plan` |
| F-REQ-HEADCOUNT | Số lượng | SCR-REC-REQ-DET | ≥1 |
| F-REQ-JOB | Vị trí / chức danh | SCR-REC-REQ-DET | tài xế vs HDV per `co_key` |
| F-REQ-WF-SUBMIT | Gửi duyệt QT | SCR-REC-REQ-DET | `hdsd-requisition-submit-wf` |
| F-CAND-STAGE | Giai đoạn | SCR-REC-CAND-DET | pipeline → offer |
| F-CAND-PIPE | Gửi pipeline QT | SCR-REC-CAND-DET | `hrm_candidate` |
| F-LV-TYPE / F-LV-DATES | Loại / Từ–Đến | SCR-ATT-LEAVE · SCR-MOB-LEAVE-CR | dd/MM/yyyy |
| F-ATT-REASON | Lý do chỉnh CC | SCR-ATT-UPD · mobile att | BR-PO-ATT-LGX-01 |
| F-EXT-LABEL | Nhãn field custom | SCR-CAT-EXT | UF-15 |
| F-INBOX-BTYPE | Loại nghiệp vụ | SCR-CC-INBOX | `hrm_leave` / recruitment |

**Đếm fields (matrix slice):** 10 · full dict → depth packs

### 4.3 Functions (matrix)

| fn_id | UI | API (observe) | success FE+F5 | XREF depth FN |
|-------|-----|---------------|---------------|---------------|
| FN-HIM-PLAN-SUBMIT | Gửi duyệt QT KH | POST …/recruitment-plans/:id/submit-workflow | plan WF id · inbox card | FN-PLAN-SUBMIT-WF |
| FN-HIM-REQ-SUBMIT | Gửi duyệt QT YCTD | POST …/requisitions/:id/submit-workflow | inbox stamp | FN-REQ-SUBMIT-WF |
| FN-HIM-PIPE-START | Gửi pipeline / advance | POST start-pipeline / stage | inbox step | FN-CAND-PIPELINE |
| FN-HIM-LEAVE-SUBMIT | Gửi đơn nghỉ | POST leave-requests | pending list | FN-LV-SUBMIT · FN-CREATE-SUBMIT |
| FN-HIM-LEAVE-APPR | Duyệt nghỉ | POST approve **or** WF complete | terminal · F5 | FN-MGR-APPROVE · FN-INBOX-* |
| FN-HIM-ATT-SUBMIT | Gửi YC chỉnh CC | POST attendance update-requests | pending | FN-REQ-UPD-CRUD |
| FN-HIM-ATT-APPR | Duyệt chỉnh CC | POST …/approve (HRM) | record updated | MOB Mgr chip CC |
| FN-HIM-EXT-APPLY | Xác nhận áp dụng DM | POST extension-items **201** | `workflowInstanceId` | FN-EXT-* |
| FN-HIM-CAT-GOV-APPR | Phê duyệt lô | POST catalog-gov approve | inbox n−1 | FN-CG-APPROVE |

**Đếm functions:** 9

---

## 5. Test case matrix — Primary INST + AP

**Quy ước TC-ID:** `TC-HIM-<PROC>-<CO>-<role>-<nnn>`  
`role`: **HP** instance · **AP** approve pointer · **FD** fail-deep · **SG** SPEC_GAP · **SP** spot  
**Status:** PLANNED · **Layer:** UI (+ API observe) · **Auto:** MANUAL / PW / DEVICE

### 5.1 P-REC-PLAN · Primary CO-TMDV

| TC-ID | Type | process_id | co_key | Persona | Channel | hdsd_align | Steps (FE-only) | Expected | XREF |
|-------|------|------------|--------|---------|---------|------------|-----------------|----------|------|
| TC-HIM-REC-PLAN-TMDV-HP-001 | HP | P-REC-PLAN | CO-TMDV | Group CEO embed `trsport` **or** ops HR | web | Menu **Tuyển dụng** → **Kế hoạch** | Precond TC-WFM-REC-PLAN-HP-001 · Create/open plan logistics hiring → **Gửi duyệt QT** → Network 2xx → F5 row shows WF pending | Instance id set · **no** seed | TC-REC-PLAN-HP-004 · FN-PLAN-SUBMIT-WF |
| TC-HIM-REC-PLAN-TMDV-AP-001 | AP | P-REC-PLAN | CO-HOLD inbox | `ceo@xe.vn` | web CC | CH04 Inbox | After HP-001 → `/command-center/inbox` → card recruitment plan → **Duyệt** → F5 | `XBOS-WF-200` · card gone · plan terminal | **TC-XIC-WF-HP-002** → **TC-XIC-WF-HP-003** |
| TC-HIM-REC-PLAN-TMDV-FD-001 | FD | P-REC-PLAN | CO-TMDV | same | web | | Submit khi plan thiếu headcount/period (per REC pack BR) | 4xx/inline · **no** inbox spawn | TC-REC-* FD |

### 5.2 P-REC-REQ · Primary CO-TMDV (tài xế) + CO-VISUN (HDV)

> **U78 R1 (2026-08-04):** `TC-HIM-REC-REQ-TMDV-HP-001` + `TC-HIM-REC-REQ-TMDV-AP-001` → **EVIDENCED** — `docs/qa/evidence/u78-u84-primary-rec-req-tmdv-01-r1.md` (after D-U84 JD catalog assert).  
> **U78 VISUN (2026-08-04):** `TC-HIM-REC-REQ-VISUN-HP-001` + `TC-HIM-REC-REQ-VISUN-AP-001` → **EVIDENCED** — `docs/qa/evidence/u78-u84-primary-rec-req-visun-01.md` (OPS_MANAGER proxy for HDV; stamp ≠ tài xế).

| TC-ID | Type | process_id | co_key | Persona | Channel | hdsd_align | Steps | Expected | XREF |
|-------|------|------------|--------|---------|---------|------------|-------|----------|------|
| TC-HIM-REC-REQ-TMDV-HP-001 | HP | P-REC-REQ | CO-TMDV | HR/ops | web | `hdsd-requisition-submit-wf` | Precond TC-WFM-REC-REQ-HP-001 · YCTD vị trí **Lái xe/Vận hành** · headcount≥1 · **Gửi duyệt QT** → F5 | POST submit-workflow 2xx · `workflow_instance_id` | TC-REC-REQ-HP-003 · BR-PO-REC-LGX-01 |
| TC-HIM-REC-REQ-TMDV-AP-001 | AP | P-REC-REQ | CO-HOLD | `ceo@xe.vn` | web CC | Inbox Duyệt | Card YCTD → **Duyệt** → F5 · HRM YCTD status terminal | `XBOS-WF-200` | **TC-XIC-WF-HP-003** · J-REC-WF-03 |
| TC-HIM-REC-REQ-VISUN-HP-001 | HP | P-REC-REQ | CO-VISUN | HR/ops | web | same | YCTD vị trí **HDV / điều hành tour** · **Gửi duyệt QT** → F5 | 2xx · stamp title readable | TC-REC-REQ-HP-003 (persona variant) · **EVIDENCED** `u78-u84-primary-rec-req-visun-01.md` |
| TC-HIM-REC-REQ-VISUN-AP-001 | AP | P-REC-REQ | CO-HOLD | `ceo@xe.vn` | web CC | Inbox | Same as TMDV-AP · assert card subtitle/job context ≠ tài xế | Approve 2xx | **TC-XIC-WF-HP-003** · **EVIDENCED** `u78-u84-primary-rec-req-visun-01.md` |
| TC-HIM-REC-REQ-TMDV-FD-001 | FD | P-REC-REQ | CO-TMDV | | web | | Gửi duyệt khi status không eligible / thiếu headcount | Blocked UI hoặc 4xx · no task | TC-REC FD |

### 5.3 P-REC-PIPE · Primary CO-TMDV

| TC-ID | Type | process_id | co_key | Persona | Channel | hdsd_align | Steps | Expected | XREF |
|-------|------|------------|--------|---------|---------|------------|-------|----------|------|
| TC-HIM-REC-PIPE-TMDV-HP-001 | HP | P-REC-PIPE | CO-TMDV | HR | web | UV roadmap | Precond TC-WFM-REC-PIPE-HP-001 · Candidate tài xế → **Gửi pipeline QT** / advance tới bước cần duyệt → F5 | Spawn `hrm_candidate` · stage lock OK | FN-CAND-PIPELINE · TC-REC cand |
| TC-HIM-REC-PIPE-TMDV-AP-001 | AP | P-REC-PIPE | CO-HOLD | `ceo@xe.vn` | web CC | Inbox offer/step | Inbox task pipeline → **Duyệt** từng bước FE-visible → F5 stage | complete 2xx · stage advances | **TC-XIC-WF-HP-002/003** |
| TC-HIM-REC-PIPE-TMDV-FD-001 | FD | P-REC-PIPE | CO-TMDV | | web | BR-PO-REC-LGX-01 | Advance **Offer** thiếu GPLX/kinh nghiệm tuyến (nếu FE gate) | Blocked · no silent hire | taxonomy §5.1 |

### 5.4 P-LEAVE · Primary CO-DL (L1 only executable)

| TC-ID | Type | process_id | co_key | Persona | Channel | hdsd_align | Steps | Expected | XREF |
|-------|------|------------|--------|---------|---------|------------|-------|----------|------|
| TC-HIM-LEAVE-DL-HP-001 | HP | P-LEAVE | CO-DL | `du-lich.ceo` staff **or** mobile `uat.nv0003` mapped DL | **web** `/hr/attendance` **and/or** **mobile** | ESS Gửi đơn | Precond TC-WFM-LEAVE-HP-001 · Chọn loại nghỉ catalog `leave_types` · ngày dd/MM/yyyy · **Gửi** → F5 pending | POST **201** · pending row · spawn `hrm_leave` when bridge on | TC-ATT-LV-HP-001 · **TC-MOB-LV-CR-HP-001** |
| TC-HIM-LEAVE-DL-AP-001 | AP | P-LEAVE | CO-DL | Mobile L1 `uat.nv0001` **or** CC inbox assignee | **mobile** Mgr **or** **web** CC | QL Duyệt / Inbox **Duyệt** | After HP-001 (U65 chain) → ManagerApprovals **Nghỉ phép** **or** CC inbox `hrm_leave` → **Duyệt** → F5 submitter **Đã duyệt** | Approve 2xx · **không** claim L2 | **TC-MOB-LV-MGR-HP-001/003** · **TC-XIC-WF-HP-004** |
| TC-HIM-LEAVE-DL-FD-001 | FD | P-LEAVE | CO-DL | submitter | web/mobile | attach BR | Ốm ≥3d không file → Gửi | Block/4xx · no 201 | TC-ATT-LV-FD-001 · TC-MOB-LV-CR-FD-001 |
| TC-HIM-LEAVE-DL-SG-L2-001 | SG | P-LEAVE | CO-DL / HOLD | — | — | Ladder HDSD | Document: AS-IS graph **1 bước** `direct_manager` · **L2 / T_L1** = **SPEC_GAP** GAP-LEAVE-LADDER-01 HOLD sponsor | **Không** execute as PASS · Status **SPEC_GAP** | taxonomy §3 P-LEAVE · TC-ATT-LV-BLK-001 · TC-WFM-LEAVE-FD-001 |

### 5.5 P-ATT-ADJ · Primary CO-TMDV (HRM-only approve)

| TC-ID | Type | process_id | co_key | Persona | Channel | hdsd_align | Steps | Expected | XREF |
|-------|------|------------|--------|---------|---------|------------|-------|----------|------|
| TC-HIM-ATT-TMDV-HP-001 | HP | P-ATT-ADJ | CO-TMDV | NV/tài xế | web **or** mobile att | YC chỉnh CC / đi muộn | Precond: **không** yêu cầu XBOS def (HRM-only) · Tạo YC: mốc ca + lý do (+ ảnh optional) → **Gửi** → F5 pending | Row `attendance_update_requests` pending · **no** invent WF code | FN-REQ-UPD-CRUD · MOB-ATTENDANCE att cards · BR-PO-ATT-LGX-01 |
| TC-HIM-ATT-TMDV-AP-001 | AP | P-ATT-ADJ | CO-TMDV | QL ca / `uat.nv0001` Mgr | mobile **or** HRM web | Mgr chip **Chỉnh sửa CC** | Card pending → **Duyệt** → F5 attendance record updated | POST approve 2xx · **XBOS inbox N/A** until bridge | TC-MOB-LV-MGR filter CC · HRM-ATTENDANCE approve |
| TC-HIM-ATT-TMDV-FD-001 | FD | P-ATT-ADJ | CO-TMDV | | | | Gửi thiếu lý do/mốc ca | Validation · no pending | BR-PO-ATT-LGX-01 |
| TC-HIM-ATT-TMDV-SG-WF-001 | SG | P-ATT-ADJ | CO-HOLD | — | — | | XBOS designer / inbox path | **GOVERNANCE_LOCK** name `hrm_attendance_adjustment_approval` · XBOS inbox **BLOCKED** until bridge — **cấm** invent constants | TC-WFM-ATT-HP-001 · R-PO-WF-02 |

### 5.6 P-CAT-EXT · Extension FE CO-DL + Approve CO-HOLD

| TC-ID | Type | process_id | co_key | Persona | Channel | hdsd_align | Steps | Expected | XREF |
|-------|------|------------|--------|---------|---------|------------|-------|----------|------|
| TC-HIM-CAT-DL-HP-001 | HP | P-CAT-EXT | CO-DL | `ceo@xe.vn` member unit **xe-du-lich** visible | web CC | UF-15 | Precond TC-WFM-CAT-HP-001 · `company_group_hr` → CT Du lịch → **Thêm field custom** → **Xác nhận (áp dụng)** | **201** `HRM-SET-209` · `workflowInstanceId` | **TC-XIC-EXT-HP-001** |
| TC-HIM-CAT-HOLD-AP-001 | AP | P-CAT-EXT | CO-HOLD | `ceo@xe.vn` master | web CC | UF-09 | Gov inbox → **Phê duyệt** → F5 · HRM pull/settings label còn | **201** `XBOS-CAT-201` | **TC-XIC-EXT-HP-002** · **TC-XIC-CG-HP-001** |
| TC-HIM-CAT-DL-FD-001 | FD | P-CAT-EXT | CO-DL | | | | Apply khi HRM down | Error VI · no fake success | TC-XIC-EXT-FD-001 |

---

## 6. Spot samples (≥1 / company recommended)

| TC-ID | Type | process_id | co_key | Channel | Steps (short) | Expected | Notes |
|-------|------|------------|--------|---------|---------------|----------|-------|
| TC-HIM-LEAVE-HOLD-SP-001 | SP | P-LEAVE | CO-HOLD | web | Template observe only — def @ HOLD already TC-WFM; optional group leave submit if scope allows | Def XREF · instance optional | Template cell §2 |
| TC-HIM-LEAVE-TMDV-SP-001 | SP | P-LEAVE | CO-TMDV | mobile/web | 1× submit L1 leave @ `trsport` | 201 pending | Spot §2 |
| TC-HIM-LEAVE-VISUN-SP-001 | SP | P-LEAVE | CO-VISUN | web/mobile | 1× submit | 201 | Spot |
| TC-HIM-LEAVE-VN-SP-001 | SP | P-LEAVE | CO-VN | web | 1× submit @ `services` | 201 | Spot |
| TC-HIM-REC-PLAN-VN-SP-001 | SP | P-REC-PLAN | CO-VN | web | 1× plan submit-workflow | 2xx or empty-eligible BLOCKED honest | Spot §2 |
| TC-HIM-REC-REQ-DL-SP-001 | SP | P-REC-REQ | CO-DL | web | 1× YCTD submit | 2xx | Spot |
| TC-HIM-REC-REQ-VN-SP-001 | SP | P-REC-REQ | CO-VN | web | 1× YCTD | 2xx | Spot |
| TC-HIM-REC-PIPE-VISUN-SP-001 | SP | P-REC-PIPE | CO-VISUN | web | 1× pipeline start | 2xx | Spot §2 |
| TC-HIM-ATT-VISUN-SP-001 | SP | P-ATT-ADJ | CO-VISUN | web/mobile | 1× update-request | pending | Spot |
| TC-HIM-ATT-DL-SP-001 | SP | P-ATT-ADJ | CO-DL | web/mobile | 1× update-request | pending | Spot |
| TC-HIM-CAT-TMDV-SP-001 | SP | P-CAT-EXT | CO-TMDV | web | Apply/pull observe after HOLD approve (consumer) — **not** new extension code | Snapshot/label OK | Apply pull cell §2 |

**Company spot check:** CO-HOLD ✓ · CO-TMDV ✓ (Primary+leave spot) · CO-VISUN ✓ · CO-DL ✓ · CO-VN ✓

---

## 7. LOCK_CODE / SPEC_GAP inventory (SA lock §3)

> SoT: `PO_WF_CANDIDATE_CODE_LOCK.md`. **GOVERNANCE_LOCK** = tên khóa — **không** claim product constants · **không** POST XBOS spawn. **SPEC_GAP** = inventory/BLOCKED — **cấm** draft-name assert.

| TC-ID | process_id | Priority | Primary `co_key` | code_status | proposed code (lock only) | UI inventory | Status |
|-------|------------|----------|------------------|-------------|---------------------------|--------------|--------|
| TC-HIM-SG-CONTRACT-VN-001 | **P-CONTRACT** | P1 | **CO-VN** | **GOVERNANCE_LOCK** | `hrm_contract_approval` | `HRM-CONTRACTS.md` mutate (non-WF) | **PLANNED** · GOVERNANCE_LOCK |
| TC-HIM-SG-PROBATION-VN-001 | **P-PROBATION** | P1 | **CO-VN** | **GOVERNANCE_LOCK** | `hrm_probation_approval` | Decisions / employee TV UI if any | **PLANNED** · GOVERNANCE_LOCK |
| TC-HIM-SG-TRANSFER-VN-001 | **P-TRANSFER** | P1 | **CO-VN** | **GOVERNANCE_LOCK** | `hrm_transfer_approval` | Decisions / employee · scope_parity | **PLANNED** · GOVERNANCE_LOCK |
| TC-HIM-SG-EXIT-VN-001 | **P-EXIT** | P1 | **CO-VN** | **GOVERNANCE_LOCK** | `hrm_exit_approval` | Offboard UI if any | **PLANNED** · GOVERNANCE_LOCK |
| TC-HIM-SG-OT-TMDV-001 | **P-OT** | P1 | **CO-TMDV** | **SPEC_GAP** | — | HRM-ATTENDANCE SCR-REQ-OT · FN-REQ-OT-CRUD | **SPEC_GAP** |
| TC-HIM-SG-TRAIN-TMDV-001 | **P-TRAIN** | P1 | **CO-TMDV** | **SPEC_GAP** | — *(draft not locked)* | Training/cert UI stub | **SPEC_GAP** |
| TC-HIM-SG-DISCIPLINE-001 | **P-DISCIPLINE** | P2 | — | **SPEC_GAP** | — | — | **SPEC_GAP** |
| TC-HIM-SG-PAYEX-001 | **P-PAY-EX** | P2 | — | **SPEC_GAP** | — | Payroll ngoại lệ | **SPEC_GAP** |

**Steps for every row:** Open related HRM menu → confirm UI entry/stub · **Không** POST XBOS `instances/start` với draft name.

---

## 8. Coverage check (DoD WI + U84 §7.2)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| AS-IS P0 Primary cells ≥1 INST TC | P-REC-PLAN×1 · P-REC-REQ×2 · P-REC-PIPE×1 · P-LEAVE×1 · P-ATT-ADJ×1 · P-CAT-EXT×1 = **7** | 7 HP INST (§5) | 0 |
| Each Primary has approve XREF | 7 | 7 AP rows | 0 |
| Spot ≥1 per company | 5 co_key | §6 | 0 |
| Leave L2 / T_L1 = SPEC_GAP documented | 1 | TC-HIM-LEAVE-DL-SG-L2-001 | 0 |
| LOCK_CODE GOVERNANCE_LOCK (4) + SPEC_GAP (4) inventory | 8 | §7 | 0 · no invented spawn |
| Designer chrome duplicated | 0 | XREF §1 | 0 |
| Inbox approve matrix duplicated | 0 | XREF TC-XIC-* | 0 |
| U65 seed in precond | 0 | §3 | 0 |
| UAT DONE claimed | 0 | — | 0 |

**TC count:** Primary INST+AP+FD = **22** · Spot = **11** · SPEC_GAP (leave L2 + att WF + 8 candidate) = **10** · **Total documented = 43**

---

## 9. Traceability

| TC-ID | process_id | co_key | SRS / UC | Def XREF | Approve / depth XREF | UF / J-* |
|-------|------------|--------|----------|----------|----------------------|----------|
| TC-HIM-REC-PLAN-TMDV-HP-001 | P-REC-PLAN | CO-TMDV | UC recruit plan | TC-WFM-REC-PLAN-HP-001 | TC-XIC-WF-HP-003 | UF-HRM-12 |
| TC-HIM-REC-REQ-TMDV-HP-001 | P-REC-REQ | CO-TMDV | YCTD | TC-WFM-REC-REQ-HP-001 | TC-XIC-WF-HP-003 | J-REC-WF-02/03 |
| TC-HIM-REC-REQ-VISUN-HP-001 | P-REC-REQ | CO-VISUN | YCTD HDV | same | TC-XIC-WF-HP-003 | J-REC-WF-* |
| TC-HIM-REC-PIPE-TMDV-HP-001 | P-REC-PIPE | CO-TMDV | candidate pipeline | TC-WFM-REC-PIPE-HP-001 | TC-XIC-WF-HP-002/003 | J-HRM-05 |
| TC-HIM-LEAVE-DL-HP-001 | P-LEAVE | CO-DL | FR-UC-H03 | TC-WFM-LEAVE-HP-001 | TC-MOB-LV-* · TC-XIC-WF-HP-004 | UF-HRM-08 · J-MOB-03/05 |
| TC-HIM-LEAVE-DL-SG-L2-001 | P-LEAVE | CO-DL | ladder | — | TC-ATT-LV-BLK-001 | **SPEC_GAP** |
| TC-HIM-ATT-TMDV-HP-001 | P-ATT-ADJ | CO-TMDV | UC-HRM-09 | TC-WFM-ATT (SG) | MOB Mgr CC | BR-PO-ATT-LGX-* |
| TC-HIM-CAT-DL-HP-001 | P-CAT-EXT | CO-DL | UF-15 | TC-WFM-CAT-HP-001 | TC-XIC-EXT/CG | UF-XBOS-15→09 · J-XBOS-02 |

---

## 10. Out of scope / residual

| Item | Reason | Status |
|------|--------|--------|
| WF designer step chrome | Pack WFM / WFD | OOS XREF |
| Full REC/ATT field dict | Depth packs | OOS XREF |
| Leave L2 ladder PASS | Sponsor HOLD T_L1 | **SPEC_GAP** |
| P-ATT-ADJ XBOS inbox unify | R-PO-WF-02 | **SPEC_GAP** |
| P-OT / TRAIN / DISCIPLINE / PAY-EX | SPEC_GAP SA lock | **SPEC_GAP** §7 |
| P-CONTRACT / PROBATION / TRANSFER / EXIT | GOVERNANCE_LOCK names | Inventory only · no constants |
| Browser execution this WI | Design pack only | PLANNED |
| Seed inbox / API cheat | U65 | **FORBIDDEN** |

---

## 11. Handoff

```
ack_status: SYNTHED
synth_wi: PO-ECO-TC-SYNTH-WF-CAT-01
evidence_path: docs/qa/evidence/po-eco-tc-synth-wf-cat-01.md
author_evidence: docs/qa/evidence/po-eco-tc-hrm-wf-instance-matrix-01.md
exec_rollup_wi: U84-PRIMARY-EXEC-ROLLUP-01
exec_rollup_evidence: docs/qa/evidence/u84-primary-exec-rollup-01.md
exec_rollup_r2: U84-PRIMARY-EXEC-ROLLUP-R2
exec_rollup_r2_evidence: docs/qa/evidence/u84-primary-exec-rollup-r2.md
exec_tally: EVIDENCED=6/7 BLOCKED-EXTERNAL=1/7 OPEN=0/7
cross_ref: XBOS-WF-PROCESS-MATRIX.md · XBOS-INBOX-CAT.md · MOB-LEAVE-APPR.md · HRM-RECRUITMENT.md · HRM-ATTENDANCE.md
program_ref: PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md §5–§7 · PO_WF_CANDIDATE_CODE_LOCK.md §3
counts: primary_inst_cells=7 tcs_primary_block=22 spot=11 sg=10 total=43 evidenced_primary_hp_ap=12
residual: leave L2 T_L1 · P-LEAVE@CO-DL EXTERNAL · R-U84-REC-REQ-VISUN-HDV-TITLE-PROXY P2 · P-ATT-ADJ XBOS inbox GOVERNANCE_LOCK · SPEC_GAP OT/TRAIN/DISCIPLINE/PAY-EX
uat_done: false
phase1_done: false
```


---

*PO-ECO-TC-HRM-WF-INSTANCE-MATRIX-01 · qa · 2026-08-03 · exec stamp 2026-08-04*
