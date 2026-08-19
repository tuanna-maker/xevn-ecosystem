# FIDELITY PROGRAM DISPATCH — P-HRM-ERP-DATA-FIDELITY-01

## Header Block

| Field | Value |
|-------|-------|
| **Program ID** | `P-HRM-ERP-DATA-FIDELITY-01` |
| **Status** | `ACTIVE` — sponsor chốt 2026-07-28 |
| **Effective date** | 2026-07-28 |
| **Sponsor lock date** | 2026-07-28 |
| **Mindset** | Product Owner / ERP-class HRM standard — không scope-lock vào "Vị trí" (Position = ví dụ triệu chứng) |
| **Locks đang hiệu lực** | **U65** zero-seed · **U71** SRS→TechSpec→DB_DESIGN→API_DESIGN trước Dev · **U72** cấm raw key/enum/slug/UUID lộ UI · **U74** Claude↔Cursor peer debate; chỉ execute sau sponsor chốt + synthesis lock · **HOLD_DEPLOY** cấm Phase1/PROD claim |
| **Segment** | Claude = docs/audit/peer review; Cursor = FE/QA/QC; không claim cùng file đồng thời |
| **Prev program** | Supersede `P-HRM-MD-PICKER-01` (hẹp scope Position) |
| **Source of Truth** | `HRM_ERP_DATA_FIDELITY_PROGRAM.md` · `HRM_ERP_FIDELITY_PEER_SYNTHESIS.md` · `HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md` · `UX-UI-ERP-ANALYSIS.md` · `UX-UI-ERP-REMAINING-SYNTHESIS.md` · `D1-DATATABLE-AUDIT.md` + evidence `ba-hrm-erp-domain-crud-01-20260728.md` + `ba-hrm-erp-settings-consumer-01-20260728.md` + `sa-hrm-erp-world-benchmark-01-20260728.md` + `qa-hrm-erp-fidelity-spot-01-20260728.md` |
| **Governing rule** | Mỗi cohort qua U74 pipeline: Claude góp ý → Cursor synthesis → sponsor chốt → execute → QA → QC gate |

---

---

### Cohort 1 — E1-A: E-MD-BIND Catalog Live Consumer Bind

**Cohort ID + alias:** E1-A · alias: MD-BIND-LAYER-A

**Business problem tóm tắt:** Hệ thống HRM có Settings catalog CRUD hoạt động, nhưng ~10 form trên HRM vẫn dùng free-text/hardcode thay vì Select picker từ catalog — dữ liệu master bị nhiễm, không ràng buộc FK/unique/required, và UI lộ raw key (U72 violation).

**Deliverable thực tế:**
- Audit toàn bộ FREE_TEXT/HARDCODE master-data consumer trong HRM FE (WorkHistory position, Decisions position, JobPostings headcount, Payroll component_type, Contracts type, …)
- Từng form đổi Input free-text → CatalogSearchPicker bind *_key
- Consumer gửi catalog code (không phải label string) qua API
- BE assert FK + required + unique + scope cho mỗi master mutate

**Evidence SoT đã có:**
- docs/program/HRM_ERP_DATA_FIDELITY_PROGRAM.md — Program scope + PO questions
- docs/program/HRM_ERP_FIDELITY_PEER_SYNTHESIS.md — Cohort proposal E-MD-BIND / E-PAY-CLEAN / E-MD-CRUD
- docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md — G0 findings: FREE_TEXT cluster WorkHistory/Decisions/JobPostings/EmployeeContracts/Payroll component_type
- docs/qa/evidence/ba-hrm-erp-settings-consumer-01-20260728.md — 32 catalog families matrix; OK~8 / FREE_TEXT~10 / HARDCODE~8 / PARTIAL~10
- docs/qa/evidence/qa-hrm-erp-fidelity-spot-01-20260728.md — Spot ≥5 domains: FAIL cluster FREE_TEXT position × 4; Payroll component_type HARDCODE; Decisions decision_type key MISS

**DoD cụ thể (pass criteria):**
- [ ] grep "FREE_TEXT.*position" apps/web/hrm/src = 0 instance còn nguyên (đã refactor hết)
- [ ] Mọi consumer master-data form bind catalog_select → API gửi *_key (không gửi label string)
- [ ] grep "job_titles.*hardcode|componentTypes.*hardcode" apps/web/hrm/src = 0
- [ ] QA browser: mỗi domain đã bind → tạo mới + F5 reload → data vẫn bind đúng catalog code
- [ ] BE assert helper ssertCodeInEffectiveCatalog gọi cho mọi master mutate path
- [ ] U72: không còn raw key lộ UI — tất cả display label qua getLabel() hoặc equivalent

**Phụ thuộc cohort trước:** Không — có thể song song E1-B

**Suggested team:**
- Lead: Cursor-PM (Task Cursor Task)
- FE: dev-fe → đổi Input → CatalogSearchPicker + bind *_key
- BE: dev-be → thêm assertCodeInEffectiveCatalog vào controller mutate
- BA: ba-data → verify mỗi form FE gửi đúng field + key
- QA: qa → browser spot ≥5 domain bind; verify F5 persistence
- Peer: Claude-PM → docs audit + U72 label scan + peer review




### Cohort 2 — E1-B: E-SET-UI Expand Settings Master Data Panel

**Cohort ID + alias:** `E1-B · alias: SETTINGS-UI-EXPAND`

**Business problem tóm tắt:** Settings Master Data panel HRM hiện chỉ có 4 bucket (Chức danh, Phòng ban, Loại nghỉ, Loại quyết định), thiếu 6+ catalog quan trọng (pay_types, shifts, grades, channels, contract_types, employment_type), buộc HR/BA phải edit BE/DB trực tiếp hoặc dùng hardcode trong FE.

**Deliverable thực tế:**
- MasterDataSettingsPanel expand từ 4 bucket → 10+ bucket theo catalog families đang live
- Mỗi bucket có CRUD UI: Create / Read / Update / Delete + search + filter
- Alias key mapping cho key không khớp (vd: decision_types ↔ hr_decision_types)
- Settings UI → XBOS sync → HRM consumer pipeline end-to-end cho mỗi bucket mới

**Evidence SoT đã có:**
- `docs/program/HRM_ERP_DATA_FIDELITY_PROGRAM.md` — §2 Settings UI coverage gap
- `docs/program/HRM_ERP_FIDELITY_PEER_SYNTHESIS.md` — E-SET-UI cohort proposal
- `docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md` — MISS Settings UI ~6 families
- `docs/qa/evidence/ba-hrm-erp-settings-consumer-01-20260728.md` — Matrix: Pay/contract/shifts/channels/grades/employment_type lack MD UI
- `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` — DB schema settings catalogs
- `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` — API endpoints hiện có

**DoD cụ thể (pass criteria):**
- [ ] MasterDataSettingsPanel render ≥10 bucket tabs (không chỉ 4)
- [ ] Mỗi bucket mới có CRUD functional: create → list → edit → delete
- [ ] Alias key hr_decision_types hiển thị đúng trong FE (không MISS)
- [ ] XBOS sync approve/reject cho bucket mới hoạt động end-to-end
- [ ] QA: tạo 1 item mỗi bucket mới → sync XBOS → consumer form hiển thị đúng
- [ ] U72: bucket label VI đúng; key code lộ backend-only

**Phụ thuộc cohort trước:** Không — có thể song song E1-A

**Suggested team:**
- Lead: Cursor-PM (Task Cursor Task)
- FE: dev-fe → expand MasterDataSettingsPanel tabs + CRUD dialogs
- BE: dev-be → XBOS sync approve/reject + catalog API
- BA: ba-data → verify alias mapping + consumer bind downstream
- QA: qa → browser CRUD ≥3 bucket mới + XBOS sync verify
- Peer: Claude-PM → docs spec delta + alias key audit (U72)


---

### Cohort 3 — E2: E-PAY-CLEAN Payroll/Contract Clean + Constraint Depth

**Cohort ID + alias:** `E2 · alias: PAY-CONTRACT-CONSTRAINT`

**Business problem tóm tắt:** Payroll có mock islands (tax/insurance policy participants), component_type hardcode, và form thiếu Zod validation; Contracts module parity gap giữa Contracts page và EmployeeContracts tab — dữ liệu payroll/contract có thể invalid lọt vào DB, rủi ro tuân thủ BHXH/thuế.

**Deliverable thực tế:**
- Payroll: xóa mock blocks trong Payroll.tsx → thay bằng real API call
- Payroll: component_type hardcode → catalog picker (salary_components)
- Payroll form: thêm Zod schema + RHF cho tax settlement + salary components
- Contracts: parity gap EmployeeContracts position/signer → catalog bind (nếu chưa làm trong E1-A)
- BE: thêm required/FK/unique constraint cho payroll mutate path
- QA: spot ≥3 payroll form + contract create; verify Zod reject invalid input

**Evidence SoT đã có:**
- `docs/program/HRM_ERP_DATA_FIDELITY_PROGRAM.md` — §2 Payroll mock + constraint gap
- `docs/program/HRM_ERP_FIDELITY_PEER_SYNTHESIS.md` — E-PAY-CLEAN cohort proposal
- `docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md` — Payroll mock islands + component_type hardcode + Insurance thin
- `docs/qa/evidence/ba-hrm-erp-domain-crud-01-20260728.md` — Payroll PARTIAL: mock tax/insurance; component_type hardcoded
- `docs/qa/evidence/qa-hrm-erp-fidelity-spot-01-20260728.md` — Payroll componentTypes HARDCODE; no salary_components key

**DoD cụ thể (pass criteria):**
- [ ] `grep "mock.*tax\|mock.*insurance\|TODO.*mock" apps/web/hrm/src` = 0 residual mock block
- [ ] Payroll form Zod schema: required fields (employee, period, components) + FK assert
- [ ] `grep "componentTypes.*=\s*\[" apps/web/hrm/src` = 0 (hết hardcode)
- [ ] QA browser: payroll period create → invalid input → Zod reject; valid input → save success
- [ ] BE: payroll mutate controller gọi assert + unique check
- [ ] Contracts: EmployeeContracts position bind catalog (nếu chưa E1-A cover)

**Phụ thuộc cohort trước:** E1-A (MD-BIND) — E2 chờ CatalogSearchPicker + BE assert sẵn sàng

**Suggested team:**
- Lead: Cursor-PM (Task Cursor Task)
- FE: dev-fe → xóa mock + wire real API + Zod form Payroll/Contracts
- BE: dev-be → payroll mutate constraint + salary_components catalog assert
- BA: ba-data → verify Zod field parity vs SRS + contract type bind
- QA: qa → browser spot ≥3 payroll form + contract create
- Peer: Claude-PM → docs constraint spec delta + mock cleanup audit


---

### Cohort 4 — E3: E-CONSTRAINT + E-PERF-SM Status Machine + Validation Depth

**Cohort ID + alias:** `E3 · alias: CONSTRAINT-PERF-SM`

**Business problem tóm tắt:** Performance module chỉ có create cycle/eval (không có PATCH/DELETE), status machine mỏng; Insurance module policy depth mỏng hơn Contracts; nhiều form thiếu Zod required/FK/unique — hệ thống thiếu ràng buộc nghiệp vụ ERP-class để chặn data quality issues.

**Deliverable thực tế:**
- Performance: thêm PATCH/DELETE cycle + evaluation status machine (draft → submitted → approved → completed)
- Performance: KPI library bind depth — KPI definition link đến job_grade + department
- Insurance: full policy CRUD + insurer catalog bind + participant FK assert
- BE: thêm status machine validator cho tất cả domain có workflow (Leave, Performance, Insurance, Recruitment)
- Form: audit Zod schema coverage tất cả domain; bổ required + FK + unique cho những form thiếu

**Evidence SoT đã có:**
- `docs/program/HRM_ERP_DATA_FIDELITY_PROGRAM.md` — §2 constraint/FK/status machine gap
- `docs/program/HRM_ERP_FIDELITY_PEER_SYNTHESIS.md` — E-CONSTRAINT cohort proposal
- `docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md` — Performance WEAK/PARTIAL; Insurance PARTIAL; constraint thin
- `docs/qa/evidence/ba-hrm-erp-domain-crud-01-20260728.md` — Performance create-only; Insurance thin; constraint mỏng
- `docs/hrm/SRS.md` — AC-PERF-* / AC-INS-* status + constraint spec (PENDING_SYNTH nếu thiếu)

**DoD cụ thể (pass criteria):**
- [ ] Performance: PATCH cycle + DELETE eval functional; status SM: draft → submitted → approved → completed
- [ ] Insurance: full policy CRUD + insurer catalog bind + participant FK assert
- [ ] All HRM form Zod schema: required fields ≥ 90% coverage (audit baseline qua grep)
- [ ] Status machine validator: Leave approve/reject + Performance + Insurance + Recruitment stage transitions
- [ ] QA: performance cycle end-to-end + insurance policy create + form validation reject invalid
- [ ] U72: status label VI đúng; không lộ SM enum code ra UI

**Phụ thuộc cohort trước:** E1-A (catalog bind cần trước Performance KPI bind) + E1-B (Insurer catalog cần Settings UI)

**Suggested team:**
- Lead: Cursor-PM (Task Cursor Task)
- FE: dev-fe → Performance PATCH/DELETE + status SM UI + form Zod bổ sung
- BE: dev-be → status machine validator + Performance/Insurance mutate constraint
- BA: ba-process → KPI bind depth spec + Insurance policy CRUD delta
- SA: sa → constraint pattern review (ERP-class)
- QA: qa → browser E2E Performance cycle + Insurance + validation reject
- Peer: Claude-PM → docs constraint spec + status machine audit (U72 labels)


---

### Cohort 5 — E-XBOS-CTRL-SPEC: XBOS Control Plane Expansion (Spec Only, No Dev)

**Cohort ID + alias:** `E-XBOS-CTRL-SPEC · alias: XBOS-POLICY-SPEC`

**Business problem tóm tắt:** XBOS hiện control HRM qua apply-to-members allow-list ~3 keys (job_titles, leave_types, departments), nhưng DANH_MUC XBOS có 72 STT catalog — HRM chưa consume đầy đủ. Extend policy schema + orchestration + HRM consume là risk cao (schema change + ACL/scope review), cần TechSpec kỹ trước khi Dev.

**Deliverable thực tế:**
- TechSpec: expand apply-to-members schema từ 3 keys → danh sách cho phép đầy đủ (departments, leave_types, job_grades, recruitment_channels, contract_types, …)
- TechSpec: HRM consume pattern — pull/publish XBOS policy → HRM consumer bind
- DB_DESIGN: XBOS policy table schema mới (nếu cần thêm field)
- API_DESIGN: XBOS → HRM policy push/pull endpoints
- SRS delta: BR-HRM-XBOS-CTRL-* + AC-XBOS-CTRL-*
- PENDING_SYNTH: nếu TechSpec/DB/API chưa có → mark PENDING_SYNTH, chờ SA + BA bổ

**Evidence SoT đã có:**
- `docs/program/HRM_ERP_DATA_FIDELITY_PROGRAM.md` — §2 XBOS control HRM PARTIAL
- `docs/program/HRM_ERP_FIDELITY_PEER_SYNTHESIS.md` — E-XBOS-CTRL cohort proposal (split SPEC / G1 / G2)
- `docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md` — XBOS control PARTIAL; apply-to-members hẹp
- `docs/qa/evidence/sa-hrm-erp-world-benchmark-01-20260728.md` — XBOS control PARTIAL; enough for job_titles only
- `docs/qa/evidence/ba-hrm-erp-domain-crud-01-20260728.md` — Settings/Processes XBOS ownership correct
- `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` — 72 STT catalog inventory + XBOS-DM-HRM-01..15
- `docs/ecosystem/HRM_API_MIGRATION_MAP.md` — API migration path (PENDING_SYNTH nếu chưa có)
- `docs/tech-spec/DB_DESIGN_HRM_ADMIN.md` — Admin DB schema (reference)
- `docs/tech-spec/API_DESIGN_HRM_ADMIN.md` — Admin API design (reference)

**DoD cụ thể (pass criteria):**
- [x] SRS delta: BR-HRM-XBOS-CTRL-01..N + AC-XBOS-CTRL-01..N written — `BA_ERP_XBOS_CTRL_SPEC_01_20260728.md` (2026-07-28)
- [x] TechSpec: apply-to-members schema expand + HRM consume pattern documented — `docs/xbos/TECHSPEC_XBOS_APPLY_TO_MEMBERS_EXPAND.md` (`SA-ERP-XBOS-CTRL-SPEC-01`)
- [x] DB_DESIGN: XBOS policy schema + migration path — **no DDL G1** · `docs/xbos/DB_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md`
- [x] API_DESIGN: apply-to-members F.1 + auth scope (reuse HRM pull) — `docs/xbos/API_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md`
- [x] PENDING_SYNTH check: SRS + TechSpec/DB/API **landed** — residual = **sponsor chốt** only
- [x] U71: SRS → TechSpec → DB_DESIGN → API_DESIGN sequence đúng trước khi Dev — **SPEC complete; Dev HOLD**
- [ ] Sponsor chốt E-XBOS-CTRL-SPEC → mới mở E-XBOS-CTRL-G1 (Dev XBOS) + E-XBOS-CTRL-G2 (Dev HRM) · **Dev HOLD**

**Phụ thuộc cohort trước:** Không bắt buộc, nhưng nên chạy sau E1-A + E1-B (HRM catalog bind đã ổn trước khi XBOS expand policy)

**Suggested team:**
- Lead: Cursor-PM + Claude-PM (peer review vì risk schema cao)
- SA: sa → TechSpec + API_DESIGN + DB_DESIGN XBOS policy schema
- BA: ba-data → SRS delta + AC + XBOS-HRM consume pattern
- FE: dev-fe (XBOS) → XBOS policy engine wire (chỉ sau SPEC lock)
- BE: dev-be (XBOS) → XBOS policy push/pull endpoints
- Peer: Claude-PM → peer review TechSpec + DB/API design + U72 label audit


---

### Cohort 6 — WAVE-B: Component Library / EmptyState / PermissionFallback / i18n + Residual Gaps

**Cohort ID + alias:** `WAVE-B · alias: LIB-RESIDUAL`

**Business problem tóm tắt:** Nhiều màn HRM không có EmptyState/ErrorState/Loading skeleton chuẩn → user thấy blank screen khi lỗi hoặc không có data; Permission null im lặng → user hiểu nhầm mất dữ liệu; hardcode JSX chắn mở rộng ngôn ngữ. Wave B đã sponsor chốt U74; Tools/Talent backlog giữ HOLD.

**Deliverable thực tế:**
- Component library: XTable (DataTable wrapper), EmptyState (3 moods: none/error/permission), PermissionFallback VI, XDialog confirm destructive
- HRM FE: wire EmptyState vào >=5 man (Dashboard, Attendance, Payroll, Recruitment, Decisions)
- HRM FE: wire PermissionFallback vào moi vung co PermissionGate + null display
- i18n: scan hardcode JSX -> t() pipeline (P2, khong block Wave B)
- Moi component co __examples__/ story de QA visual regression
- Tools/Talent: HOLD — khong schedule E-wave den khi sponsor mo scope

**Evidence SoT đã có:**
- `docs/program/HRM_ERP_DATA_FIDELITY_PROGRAM.md` — §2 UX minimum standards + component inventory gap
- `docs/program/UX-UI-ERP-ANALYSIS.md` — §9 Component inventory (5 components); §3 UX minimum standards
- `docs/program/UX-UI-ERP-REMAINING-SYNTHESIS.md` — Wave B CLOSED GWC sponsor chốt 2026-07-28
- `docs/program/UX-UI-ERP-FIX-DIVISION-SYNTHESIS.md` — Fix-4 component brief (Claude owner)
- `docs/program/D1-DATATABLE-AUDIT.md` — DataTable audit: plain table -> XTable plan
- `docs/qa/evidence/qc-ux-wave-closed-01-r2-20260728.md` — QC GWC Wave 1 Closed; Wave B docs con mo

**DoD cụ thể (pass criteria):**
- [ ] XTable, EmptyState, PermissionFallback moi component co __examples__/ story
- [ ] axe-core a11y scan = 0 violation cho moi component moi
- [ ] >=5 man HRM co EmptyState thay blank screen khi no-data/error
- [ ] PermissionFallback VI message + CTA "Lien he HR" hien thi khi null/permission deny
- [ ] i18n: grep hardcode string trong apps/web/hrm/src giam >=50% (P2, khong block)
- [ ] QA: visual regression Chromatic/Percy pass cho moi component
- [ ] U72: tat ca display label qua getLabel() hoặc equivalent; khong raw key

**Phụ thuộc cohort trước:** Wave A (tokens) — component library consume token package; D1 audit close

**Suggested team:**
- Lead: Cursor-PM (Task Cursor Task) + Claude-PM (component plan docs)
- FE: dev-fe -> wire EmptyState + PermissionFallback vao >=5 man; build XTable wrapper
- FE: dev-fe -> i18n scan + t() pipeline (P2 backlog)
- BA: ba-data -> verify component API props + label VI
- SA: sa -> component a11y review + design token consumption check
- QA: qa -> axe-core scan + visual regression + browser EmptyState/PermissionFallback verify
- Peer: Claude-PM -> docs component plan + i18n scan + U72 label audit


---

## Footer: Execution Rules + Status Reporting + Cohort Expansion

### Nguyen tac execute (non-negotiable)

1. **U74 pipeline:** Moi cohort/de-xuat chia viec phai qua: Claude goi y → Cursor synthesis → sponsor chot → execute → QA → QC gate. Khong bao gio skip sponsor chot.
2. **U71 spec gate:** Truoc Dev: SRS delta → TechSpec → DB_DESIGN → API_DESIGN. Khong code truoc spec lock.
3. **U72 display rule:** Cam raw key/enum/slug/UUUID lo UI. Tat ca display label qua `getLabel()` hoặc equivalent; BA phai dinh nghia label VI moi truong.
4. **U65 zero-seed:** QA khong seed data de pass. Test tren empty catalog la OK.
5. **HOLD_DEPLOY:** Cam claim Phase1/PROD done. Deploy chi mo khi sponsor unlock.
6. **Segment lock:** Claude = docs/audit/peer review (khong apps/** code); Cursor = FE/QA/QC (code execution). Khong claim cung file dong thoi.
7. **No Phase1/PROD claim:** Khong bao gio ghi "Phase 1 complete" hoac "PROD ready" tu document nay hoac cohort nay.
8. **Cohort sequence:** E1-A -> E1-B -> E2 -> E3 -> E-XBOS-CTRL-SPEC -> WAVE-B. Co the song song E1-A + E1-B; E2/E3/E-XBOS can E1-A catalog bind san sang.

### Cach bao cao status

- Moi WI done: owner append entry vao PEER_PM_COLLAB.md §5 (append-only log)
- Format: timestamp | from | to | work_item_id | ack_status | summary | evidence_path
- Claude: APPEND §5 + ping .cursor/team/inbox/peer-pm.jsonl
- Cursor: summary + Telegram @xevn_project_bot (neu sponsor yeu cau)
- Status values: OPEN | READY_FOR_QA | PASS_TO_PM | FAIL_TO_PM | CLOSED | SUPERSEDED | HOLD

### Cach mo rong cohort sau nay

1. **Them cohort moi:** Append block moi vao file nay (giu format 7 fields). Mark PENDING_SYNTH neu artifact chua co.
2. **Phu thuoc:** Rõ phụ thuộc cohort trước trong field #6; cohort khong phụ thuộc có thể song song.
3. **Evidence gap:** Neu SoT input chua co, mark `PENDING_SYNTH` + du kien owner + ETA. Khong de LOREM/TBD.
4. **Sponsor chốt:** Chi execute khi sponsor goi y ro rang. Jus-query = ko du dieu kien execute.
5. **Knowledge merge:** Moi cohort done -> APPEND evidence vao KNOWLEDGE_MERGE tuong ung (ERp-FIDELITY / UX-UI / MD-PICKER).
