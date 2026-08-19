# Process-family TC Pack — `XBOS-WF-PROCESS-MATRIX` · Quy trình HRM enterprise @ CO-HOLD

| Meta | Value |
|------|--------|
| **pack_id** | `XBOS-WF-PROCESS-MATRIX` |
| **surface** | `xbos-cc` — **CO-HOLD** (`ceo@xe.vn` · scope `main` / holding) |
| **route** | `/command-center?settings=workflow` |
| **HDSD** | CH04 §4.2 · `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` UF-XBOS-08 **Bước 1** |
| **Program SoT** | `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §3 taxonomy · §4 `co_key` |
| **Chrome / canvas SoT** | **`docs/qa/testcases/xbos/XBOS-WF-DESIGNER.md`** — screens, fields, FN-WF-*; **không copy** §1–3 |
| **Inbox / approve SoT** | **`docs/qa/testcases/xbos/XBOS-INBOX-CAT.md`** — **XREF INBOX-CAT** only |
| **SRS / UC** | UC-XBOS-13 · UC-XBOS-WF-01/02 · FR-XBOS-WF-01 · UF-XBOS-08 |
| **Code map (read-only)** | `apps/api/xbos-api/src/workflow-engine/workflow-catalog.constants.ts` |
| **author** | qa · `PO-ECO-TC-XBOS-WF-MATRIX-01` |
| **date** | 2026-08-03 |
| **ack_status** | **SYNTHED** · `PO-ECO-TC-SYNTH-WF-CAT-01` |
| **code_lock** | `PO_WF_CANDIDATE_CODE_LOCK.md` §3–§6 — LOCK_CODE = **GOVERNANCE_LOCK** · SPEC_GAP inventory only |
| **depth_gate** | Process taxonomy ☑ · P0 HP+FD per family ☑ · Inbox XREF ☑ · CANDIDATE SPEC_GAP ☑ · Trace ☑ |
| **Locks** | **U65** — downstream inbox TCs require FE spawn (WF Lưu active · HRM Gửi duyệt · leave submit · extension apply); **cấm** seed inbox · **cấm** UAT DONE · Status **PLANNED** (design pack) |

> Chuẩn: IEEE 829 / ISO 29119 lean · Mỗi **process family P0** = ≥1 HP **tạo + Lưu định nghĩa** @ **CO-HOLD** · ≥1 FD · 1 dòng **XREF INBOX-CAT** cho chuỗi UF-XBOS-08 bước 2.

---

## 0. Spec read ack

| Source | Path | Use |
|--------|------|-----|
| Enterprise matrix program | `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` | §3 P0 `process_id` · §5 company Primary (design note) |
| Designer chrome | `docs/qa/testcases/xbos/XBOS-WF-DESIGNER.md` | SCR-WF-* · FN-WF-SAVE · TC-WFD-* pattern |
| Inbox chain | `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md` | TC-XIC-WF-* · TC-XIC-CG-* · TC-XIC-EXT-* |
| WF catalog constants | `workflow-catalog.constants.ts` | AS-IS `workflowCode` · `businessType` |
| UF | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | UF-XBOS-08 |
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` | DoD §2 |

---

## 1. AS-IS workflow code map (holding designer)

| process_id | Tên VI | `workflowCode` (AS-IS) | `businessType` / conditions | Priority | Designer entry |
|------------|--------|------------------------|----------------------------|----------|----------------|
| **P-REC-PLAN** | Duyệt kế hoạch tuyển | `hrm_recruitment_plan_approval` | `hrm_recruitment_plan` | P0 | Preset bridge / manual |
| **P-REC-REQ** | Duyệt YCTD | `hrm_requisition_approval` | `hrm_requisition` | P0 | Preset bridge / manual |
| **P-REC-PIPE** | Pipeline ứng viên / offer | `hrm_candidate_pipeline` | `hrm_candidate` | P0 | Preset bridge / manual |
| **P-LEAVE** | Duyệt nghỉ phép | `hrm_leave_approval` | `hrm_leave` | P0 | Preset / manual · L1/L2 ladder SPEC_GAP note |
| **P-ATT-ADJ** | Điều chỉnh CC / đi muộn | `hrm_attendance_adjustment_approval` · **GOVERNANCE_LOCK** (not in product constants) | `hrm_attendance_adjustment` | P0 | Manual **Thêm mới** — `code_status: GOVERNANCE_LOCK`; exec **BLOCKED** until bridge/constants |
| **P-CAT-EXT** | Duyệt mở rộng DM member | `wf_hrm_catalog_extension_xe_du_lich` | `hrm_catalog_extension` + member tenant | P0 | Manual / template · member CO-DL context |

**LOCK_CODE / SPEC_GAP (P1/P2):** §6 inventory only — create-def HP với tên LOCK chỉ khi `code_status: GOVERNANCE_LOCK`; **cấm** assert spawn bằng draft SPEC_GAP.

---

## 2. Shared precond (CO-HOLD · U65)

| Item | Value |
|------|--------|
| Persona | `ceo@xe.vn` / `Xevn@2026` |
| `co_key` | **CO-HOLD** (tập đoàn · publish template) |
| URL | `:8088/command-center?settings=workflow` (hoặc `:5173` — ghi build trong evidence) |
| Scope | JWT + `companyId=main` / holding — **cấm** `x-company-id: holding` mismatch (TC-WFD-CRT-FD-003) |
| Designer steps (neo HDSD) | **Thêm quy trình mới** **hoặc** mẫu HRM bridge → fill **Mã** = `workflowCode` → **Tên** → ≥1 bước (L1…) → **Lưu quy trình** → F5 |
| Cross-ref mutate detail | FN-WF-SAVE · F-WF-CODE · F-WF-NAME → **`XBOS-WF-DESIGNER.md` §2–3** |

---

## 3. P0 process matrix (summary)

| process_id | TC-WFM HP (create+save @ CO-HOLD) | TC-WFM FD | XREF INBOX-CAT (UF-08 step 2 · U65) | HRM / FE spawn consumer |
|------------|-----------------------------------|-----------|--------------------------------------|-------------------------|
| P-REC-PLAN | TC-WFM-REC-PLAN-HP-001 | TC-WFM-REC-PLAN-FD-001 | **TC-XIC-WF-HP-002** → **TC-XIC-WF-HP-003** | HRM Tuyển dụng · kế hoạch tuyển **Gửi duyệt** |
| P-REC-REQ | TC-WFM-REC-REQ-HP-001 | TC-WFM-REC-REQ-FD-001 | **TC-XIC-WF-HP-002** → **TC-XIC-WF-HP-003** | HRM YCTD **Gửi duyệt** · J-REC-WF-03 |
| P-REC-PIPE | TC-WFM-REC-PIPE-HP-001 | TC-WFM-REC-PIPE-FD-001 | **TC-XIC-WF-HP-002** (offer step) → **TC-XIC-WF-HP-003** | HRM ứng viên · stage advance FE |
| P-LEAVE | TC-WFM-LEAVE-HP-001 | TC-WFM-LEAVE-FD-001 | **TC-XIC-WF-HP-004** → **TC-XIC-WF-HP-003** | HRM/Mobile đơn nghỉ **Gửi duyệt** · `hrm_leave` |
| P-ATT-ADJ | TC-WFM-ATT-HP-001 · **SPEC_GAP exec** | TC-WFM-ATT-FD-001 | **TC-XIC-WF-HP-003** *(when spawn wired)* | HRM Chấm công · điều chỉnh CC FE |
| P-CAT-EXT | TC-WFM-CAT-HP-001 | TC-WFM-CAT-FD-001 | **TC-XIC-EXT-HP-001** → **TC-XIC-CG-HP-001** | UF-15 extension → gov inbox UF-09 |

---

## 4. Test cases — P0 families

**Quy ước TC-ID:** `TC-WFM-<PROC>-<type>-<nnn>` · **Type:** HP · FD  
**Layer:** UI (+ API observe on save) · **Auto:** MANUAL / PW · **Status:** PLANNED

### 4.1 P-REC-PLAN — Duyệt kế hoạch tuyển

| TC-ID | Type | Covers | Steps @ CO-HOLD | Expected | XREF |
|-------|------|--------|-----------------|----------|------|
| TC-WFM-REC-PLAN-HP-001 | HP | P-REC-PLAN · FN-WF-SAVE | CC → **Hệ thống quy trình** → mẫu bridge **hoặc** **Thêm mới** → **Mã** `hrm_recruitment_plan_approval` · **Tên** «Phê duyệt kế hoạch tuyển dụng HRM» · bước «Phê duyệt kế hoạch» · **Trạng thái** active → **Lưu** → F5 | POST/PUT **2xx** `XBOS-WF-201`; row **Mã** còn; canvas ≥1 bước | TC-WFD-PST-HP-* · **TC-XIC-WF-HP-002** precond |
| TC-WFM-REC-PLAN-FD-001 | FD | F-WF-CODE · BR-WF-01 | Edit def → xóa **Tên bước** / 0 bước → **Lưu** | **400** BR-WF-01; không toast success giả | TC-WFD-CRT-FD-002 |

### 4.2 P-REC-REQ — Duyệt yêu cầu tuyển (YCTD)

| TC-ID | Type | Covers | Steps @ CO-HOLD | Expected | XREF |
|-------|------|--------|-----------------|----------|------|
| TC-WFM-REC-REQ-HP-001 | HP | P-REC-REQ · UF-08 §1 | **Mã** `hrm_requisition_approval` · **Tên** «Phê duyệt yêu cầu tuyển dụng HRM» · bước «Phê duyệt yêu cầu tuyển» · **Lưu** → F5 | **2xx**; list sync (J-XBOS-10 optional observe) | **TC-XIC-WF-HP-002** · J-REC-WF-01 |
| TC-WFM-REC-REQ-FD-001 | FD | F-WF-CODE · F-WF-NAME | Clear **Mã** hoặc **Tên** → **Lưu** | **400** `workflowCode and name required` | TC-WFD-CRT-FD-001 |

### 4.3 P-REC-PIPE — Pipeline ứng viên / offer

| TC-ID | Type | Covers | Steps @ CO-HOLD | Expected | XREF |
|-------|------|--------|-----------------|----------|------|
| TC-WFM-REC-PIPE-HP-001 | HP | P-REC-PIPE · multi-step | **Mã** `hrm_candidate_pipeline` · **Tên** «Roadmap ứng viên HRM» · thêm bước **Tiếp nhận → Sàng lọc → Phỏng vấn → Đề nghị** (≥4) → **Lưu** → tab **Sơ đồ luồng** | **2xx**; canvas nối **Bắt đầu**→4 node→**Hoàn thành** | TC-WFD-GRF-HP-001 |
| TC-WFM-REC-PIPE-FD-001 | FD | F-WF-STEP-ADD · save | New def · chỉ scaffold **Bước 1** trống tên → **Lưu** | **400** hoặc inline hint; không persist step rỗng | TC-WFD-CRT-FD-002 |

### 4.4 P-LEAVE — Duyệt nghỉ phép (L1→L2)

| TC-ID | Type | Covers | Steps @ CO-HOLD | Expected | XREF |
|-------|------|--------|-----------------|----------|------|
| TC-WFM-LEAVE-HP-001 | HP | P-LEAVE · `hrm_leave_approval` | **Mã** `hrm_leave_approval` · **Tên** «Phê duyệt đơn nghỉ phép HRM» · bước «Quản lý trực tiếp phê duyệt» · **Cho phép từ chối** ON → **Lưu** → F5 | **2xx**; `businessType` spawn path `hrm_leave` | **TC-XIC-WF-HP-004** · **TC-XIC-WF-HP-003** |
| TC-WFM-LEAVE-FD-001 | FD | L2 ladder SPEC_GAP | Chỉnh sửa def → thêm **Bước 2** «HRBP / L2» (pilot ladder) → **Lưu** | **2xx** if SRS allows; else document **SPEC_GAP** T_L1 vs L2 in evidence — **không** fail product nếu single-step AS-IS | TC-WFD-EDT-HP-002 · `po-e2e-leave-ladder-sa-01` |

### 4.5 P-ATT-ADJ — Điều chỉnh chấm công

| TC-ID | Type | Covers | Steps @ CO-HOLD | Expected | XREF |
|-------|------|--------|-----------------|----------|------|
| TC-WFM-ATT-HP-001 | HP | P-ATT-ADJ · **GOVERNANCE_LOCK** | CO-HOLD → **Thêm mới** → **Mã** `hrm_attendance_adjustment_approval` · **Tên** «Phê duyệt điều chỉnh chấm công» · bước QL duyệt → **Lưu** → F5 | **2xx** only after product constants+bridge; until then **BLOCKED** (`code_status: GOVERNANCE_LOCK` — **không** invent constants) | **TC-XIC-WF-HP-003** *(XBOS inbox BLOCKED until bridge)* |
| TC-WFM-ATT-FD-001 | FD | FN-WF-SAVE scope | Probe save with member-only scope header on group code | **409** `SCOPE_CONTEXT_MISMATCH` | TC-WFD-CRT-FD-003 |

### 4.6 P-CAT-EXT — Duyệt mở rộng danh mục (member)

| TC-ID | Type | Covers | Steps @ CO-HOLD | Expected | XREF |
|-------|------|--------|-----------------|----------|------|
| TC-WFM-CAT-HP-001 | HP | P-CAT-EXT · catalog WF | **Mã** `wf_hrm_catalog_extension_xe_du_lich` · **Tên** «Phê duyệt bổ sung danh mục HRM — X.E Du lịch VN» · bước «Tập đoàn phê duyệt danh mục» (`group_ceo`) · **Lưu** → F5 | **2xx**; conditions member tenant `xe-du-lich` in payload meta (observe network) | **TC-XIC-EXT-HP-001** → **TC-XIC-CG-HP-001** |
| TC-WFM-CAT-FD-001 | FD | reject path neo | Edit def → **Cho phép từ chối** OFF on approval step → **Lưu** → spawn extension FE → inbox | Reject UI absent or blocked per BR — align **TC-XIC-CG-FD-001** / drawer reject | TC-XIC-WF-FD-001 |

---

## 5. UF-XBOS-08 chain pointers (deduped)

| process_id | Designer (this pack) | Inbox execute (INBOX-CAT) | PO catalog neo |
|------------|----------------------|---------------------------|----------------|
| P-REC-REQ | TC-WFM-REC-REQ-HP-001 | TC-XIC-WF-HP-003 | TC-HP-03 |
| P-LEAVE | TC-WFM-LEAVE-HP-001 | TC-XIC-WF-HP-004 | TC-HP-03 leave variant |
| P-CAT-EXT | TC-WFM-CAT-HP-001 | TC-XIC-CG-HP-001 | TC-HP-13 · UF-09 |
| All P0 | *step 1* | TC-XIC-WF-BD-001 if no FE spawn | U65 BLOCKED |

Full approve/reject matrix: **`XBOS-INBOX-CAT.md` §4.1–4.4** only.

---

## 6. LOCK_CODE / SPEC_GAP inventory (UI only — SA lock §3)

> SoT: `PO_WF_CANDIDATE_CODE_LOCK.md`. **GOVERNANCE_LOCK** = tên khóa cho TC/TechSpec — **chưa** trong `workflow-catalog.constants.ts`. **SPEC_GAP** = **cấm** assert spawn / create-def như product code.

| TC-ID | process_id | code_status | proposed `workflowCode` | Priority | Steps (inventory) | Status |
|-------|------------|-------------|-------------------------|----------|-------------------|--------|
| TC-WFM-SG-INV-P-CONTRACT | P-CONTRACT | **GOVERNANCE_LOCK** | `hrm_contract_approval` | P1 · CO-VN | Open **SCR-WF-LIST** → **Thêm mới** visible · document Mã LOCK · **Không** claim constants | **PLANNED** · GOVERNANCE_LOCK |
| TC-WFM-SG-INV-P-PROBATION | P-PROBATION | **GOVERNANCE_LOCK** | `hrm_probation_approval` | P1 · CO-VN | same | **PLANNED** · GOVERNANCE_LOCK |
| TC-WFM-SG-INV-P-TRANSFER | P-TRANSFER | **GOVERNANCE_LOCK** | `hrm_transfer_approval` | P1 · CO-VN | same · scope_parity note | **PLANNED** · GOVERNANCE_LOCK |
| TC-WFM-SG-INV-P-EXIT | P-EXIT | **GOVERNANCE_LOCK** | `hrm_exit_approval` | P1 · CO-VN | same | **PLANNED** · GOVERNANCE_LOCK |
| TC-WFM-SG-INV-P-OT | P-OT | **SPEC_GAP** | — *(draft not locked)* | P1 · CO-TMDV | UI entry only · **cấm** POST def / spawn assert | **SPEC_GAP** |
| TC-WFM-SG-INV-P-TRAIN | P-TRAIN | **SPEC_GAP** | — *(draft not locked)* | P1 · CO-TMDV | same | **SPEC_GAP** |
| TC-WFM-SG-INV-P-DISCIPLINE | P-DISCIPLINE | **SPEC_GAP** | — | P2 | same | **SPEC_GAP** |
| TC-WFM-SG-INV-P-PAY-EX | P-PAY-EX | **SPEC_GAP** | — | P2 | same | **SPEC_GAP** |

**P-ATT-ADJ** create-def = **TC-WFM-ATT-HP-001** (§4.5) · **GOVERNANCE_LOCK** · XBOS inbox XREF BLOCKED until bridge.

---

## 7. Coverage check (DoD WI)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| P0 `process_id` count §3 | 6 | 6 | 0 |
| Each P0 ≥1 HP create+save @ CO-HOLD | 6 | 6 | 0 |
| Each P0 ≥1 FD | 6 | 6 | 0 |
| Each P0 inbox XREF INBOX-CAT | 6 | 6 | 0 |
| LOCK_CODE inventory GOVERNANCE_LOCK (4) + SPEC_GAP (4) | 8 | 8 §6 | 0 · ATT-ADJ in §4.5 |
| Duplicate inbox matrix | 0 full copies | XREF table §5 | 0 |
| Chrome duplicated from WFD | 0 | cross-ref §0–2 | 0 |
| UAT DONE claimed | 0 | — | 0 |

**TC count (executable P0):** 12 (6 HP + 6 FD) · **SPEC_GAP inventory:** 8 SG rows · **Total documented:** 20

---

## 8. Traceability

| TC-ID | process_id | SRS / UC | workflowCode | UF / J-* |
|-------|------------|----------|--------------|----------|
| TC-WFM-REC-REQ-HP-001 | P-REC-REQ | UC-XBOS-13 · FR-XBOS-WF-01 | `hrm_requisition_approval` | UF-XBOS-08 §1 · J-REC-WF-01 |
| TC-WFM-LEAVE-HP-001 | P-LEAVE | UC-XBOS-WF bridge | `hrm_leave_approval` | UF-XBOS-08 · J-HRM-06 |
| TC-WFM-CAT-HP-001 | P-CAT-EXT | UC-XBOS-CAT extension | `wf_hrm_catalog_extension_xe_du_lich` | UF-15→09 · J-XBOS-02 |
| TC-WFM-ATT-HP-001 | P-ATT-ADJ | — | `hrm_attendance_adjustment_approval` **GOVERNANCE_LOCK** | UF-XBOS-08 inbox BLOCKED until bridge |

---

## 9. Handoff

```
ack_status: SYNTHED
synth_wi: PO-ECO-TC-SYNTH-WF-CAT-01
evidence_path: docs/qa/evidence/po-eco-tc-synth-wf-cat-01.md
author_evidence: docs/qa/evidence/po-eco-tc-xbos-wf-matrix-01.md
cross_ref: XBOS-WF-DESIGNER.md (chrome) · XBOS-INBOX-CAT.md (inbox)
program_ref: PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md §3 · PO_WF_CANDIDATE_CODE_LOCK.md §3
counts: p0_families=6 tcs_p0=12 lock_sg_inv=8 total=20
residual: P-ATT-ADJ product bridge · P-LEAVE L2 ladder · SPEC_GAP OT/TRAIN/DISCIPLINE/PAY-EX
uat_done: false
```

---

*PO-ECO-TC-XBOS-WF-MATRIX-01 · XBOS-WF-PROCESS-MATRIX*
