# R-SPINE-MGR-HIER-01 — Manager hierarchy for J-MOB-05 / SPINE-02 LV-01

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-MGR-HIER-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **source_qa** | `docs/qa/evidence/po-e2e-spine-02-03-mob-qa-w1.md` § residuals |
| **program** | `docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md` § E2E-SPINE-02 (LV-01) |
| **locks** | **U65** zero-seed · **cấm** `apps/**` (this wave) · **cấm** seed inbox/DB để pass QA |

---

## 1. Root cause (confirmed)

| Layer | Fact | Evidence |
|-------|------|----------|
| **Symptom** | `ceo@xe.vn` → ManagerApprovals → **Nghỉ phép (0)** / «Không có đơn nghỉ phép chờ duyệt» after `uat.nv0001` FE-submitted leave `403a68d3-…` `pending` | `po-e2e-spine-02-03-mob-qa-w1.md` § J-MOB-05 · `_late-mgr-log.json` |
| **API filter (AS-IS)** | `GET /attendance/leave-requests?status=pending&manager_employee_id=<mgr_emp>` → SQL `lr.employee_id IN (SELECT e.id FROM employees e WHERE e.manager_id = :manager AND e.archived_at IS NULL)` | `leave-requests.service.ts` `listLeaveRequests` · QA probe: filtered **total=0**, unfiltered pending **27** |
| **WF / SRS L1** | L1 = **QL trực tiếp** (`resolver_type: direct_manager` → `employees.manager_id`); bridge `resolveManagerForWorkflow` JOIN `e.manager_id` | FR-UC-H03 · TECH_SPEC_NEW §4.4 · `leave-workflow.bridge.ts` · BR-CD-F4-02 |
| **Persona mismatch** | Wave used **submitter** `uat.nv0001@xe.vn` (HLD-0001, holding) + **approver** `ceo@xe.vn` (LDR / «Quản lý nhân sự» UI). HLD-0001 is **not** a direct report of the CEO employee id used in `manager_employee_id` → empty queue. Inbox notification ≠ ManagerApprovals list. | QA residual + MOBILE_PERSONA: EMP=`uat.nv0001`, LDR=`ceo@xe.vn` |
| **Self-report invariant** | ManagerApprovals lists **reports’** leave, never the manager’s own leave. Approving HLD-0001’s own đơn via the same employee as “manager” would also violate **BR-WF-04** (no self-approve). | FR-UC-H03 · BR-WF-04 · list SQL |
| **Not a seed gap** | Pending leave already exists from FE submit. Empty queue is **org/persona**, not missing data. U65 forbids seeding `manager_id` / inbox to force PASS. | U65 · QA U65 honored on LV-01 submit |

**Verdict root cause:** Product filter is correct for L1 `direct_manager`. QA used the wrong approver persona (group CEO LDR) for a leave submitted by HLD-0001, who is not under that manager_employee_id edge.

---

## 2. Option A — Document real manager persona (U65-safe, no product change)

### 2.1 Wrong vs correct LV-01 pair

| | Wrong (this wave) | Correct for ManagerApprovals L1 |
|--|-------------------|----------------------------------|
| Submit leave | `uat.nv0001@xe.vn` | Holding **direct report** of HLD-0001 (NV `uat.nv####` whose `employees.manager_id` = HLD-0001 `employees.id`) |
| Approve (mobile Phê duyệt) | `ceo@xe.vn` | **`uat.nv0001@xe.vn`** / `xevn-uat-2026` (holding MGR hat — prior device SoT) |
| Spec | — | SPINE-02 LV-01 · FR-UC-H03 L1 · J-MOB-05 · BA matrix LV-01 «QL trực tiếp» |

**Do not** use `ceo@xe.vn` as L1 approver for HLD-0001’s own leave. `ceo@xe.vn` is LDR / portal Group CEO (`PILOT_TEST_ACCOUNTS` · MOBILE_PERSONA LDR), not the `direct_manager` edge for that row.

**Do not** use `uat.nv0002@xe.vn` for holding leave: persona matrix MGR is **trsport / TRS-0002** — different company scope than holding HLD-0001.

### 2.2 Approver account (locked for retest)

| Field | Value |
|-------|--------|
| **Login (mobile)** | `uat.nv0001@xe.vn` |
| **Password** | `xevn-uat-2026` |
| **Employee** | HLD-0001 · holding UUID company `10000000-0000-4000-8000-000000000001` |
| **Role in LV-01** | **Approver L1 only** (ManagerApprovals / «Cần duyệt») — **not** submitter of the same đơn |
| **Citation** | `MOBILE_PERSONA_UX_MATRIX.md` EMP/MGR dual · prior J-MOB-05/37 waves · `po-e2e-ba-case-matrix-01.md` LV-01 |

### 2.3 Submitter account — discovery (read-only; cấm seed)

Live login email of HLD-0001’s manager **for approving HLD-0001’s own leave** is only valid if `employees.manager_id` on HLD-0001 points to another employee with mobile login. For SPINE-02 LV-01 under U65, BA recommends the **flip** in §2.1 (subordinate submits → HLD-0001 approves), which matches ManagerApprovals SQL.

**Discovery protocol (QA before retest — read-only):**

1. Login mobile `uat.nv0001@xe.vn` → **Đội nhóm** (or portal HRM Nhân sự) — pick an active holding NV who is not HLD-0001.
2. Optional L1 probe (not UF evidence): `GET /attendance/leave-requests?status=pending&manager_employee_id=<HLD-0001 employee uuid>` — if total≥0 after subordinate FE submit, pair is valid.
3. Confirm subordinate mobile login: `uat.nv####@xe.vn` / `xevn-uat-2026`.
4. Record in test-log: submitter email + approver `uat.nv0001@xe.vn` + leave id.

**If discovery finds 0 direct reports under HLD-0001:** Option A **BLOCKED** for this environment → go **Option B** (no seed of `manager_id`).

### 2.4 Alternate (only if HLD-0001 must remain submitter)

| Step | Action |
|------|--------|
| 1 | HCNS/portal read-only: open hồ sơ HLD-0001 → read `manager_id` / manager email (if UI shows) or GET employee detail |
| 2 | Approver login email = **manager row’s `email`** (must be mobile-capable) |
| 3 | If `manager_id` **null** → L1 mobile ManagerApprovals **cannot** show this đơn by design; WF fallback `hrbp` is **web Inbox / WF**, not CEO ManagerApprovals expand — do **not** invent Option C |

---

## 3. Option B — Product FE path to set `manager_id` (UC/SRS cite)

### 3.1 Spec says

| Artifact | Says |
|----------|------|
| **FR-UC-H01 / UC-H01** | HCNS tạo/sửa hồ sơ NV (tab Cá nhân / **Vị trí** / HĐ-Lương / Tài liệu) → Lưu → FE sau 2xx + F5 |
| **DB_DESIGN_NEW** `employees.manager_id` | UUID nullable self-ref — SoT vật lý cho QL trực tiếp |
| **FR-UC-H03 / TECH_SPEC §4.4** | L1 duyệt = `direct_manager` từ `manager_id` |
| **UF-HRM-01 / UF-HRM-03** | List→hồ sơ; tạo/sửa NV (group CEO) |

### 3.2 Code does (gap)

| Surface | AS-IS |
|---------|--------|
| `EmployeeFormDialog` | **No** manager picker / `manager_id` field (dept/position catalog only) |
| `CreateEmployeeDto` / `UpdateEmployeeDto` | **No** `manager_id` property |
| List/detail payload | Returns `manager_id` (read) but PATCH/create cannot set it via public DTO |

**Conclusion:** There is **no** U65-complete FE path today for HCNS to assign QL trực tiếp. Option B = **product delivery** (not QA workaround):

1. **ba-data / SA** (narrow, if needed): API_DESIGN F.1 for PATCH/POST `manager_id` + validation (same company, no cycle, ≠ self).
2. **dev-be:** ADD `manager_id` to create/update DTO + service write; jest scope + cycle guard.
3. **dev-fe:** ADD «Quản lý trực tiếp» picker on hồ sơ NV (UC-H01 tab Vị trí) → Lưu → F5; display-ready manager name (U72).
4. **QA browser U65:** `ceo@xe.vn` → HRM Nhân sự → mở NV (submitter) → set QL = HLD-0001 / uat.nv0001 → Lưu → F5 → then qa-device J-MOB-05.

**must_keep:** Leave list filter `manager_id`; BR-WF-04; soft-delete; scope parity list↔get↔patch.

---

## 4. Option C — BE scope expand (SA flag only)

| Proposal | Expand ManagerApprovals / `manager_employee_id` filter so `ceo@xe.vn` (group CEO / LDR) sees **all** company pending leave |
|----------|--------------------------------------------------------------------------------------------------------------------------|
| **SRS allow?** | **No** for L1. FR-UC-H03 L1 = QL trực tiếp; TECH_SPEC resolver `direct_manager` (+ `hrbp` **fallback when manager missing**, not “CEO sees all”). |
| **Risks** | Breaks BR-WF-04 self-approve edges; conflates L2/GĐ with L1; regresses J-MOB-05 semantics already promoted under direct-report filter |
| **When to open SA** | Only if Sponsor explicitly wants a **new** FR (e.g. «Hộp thư lãnh đạo tập đoàn — rollup chờ duyệt») separate from L1 ManagerApprovals — **out of scope** for closing R-SPINE-MGR-HIER-01 |

**BA recommendation:** **Reject Option C** for this residual. Do not dispatch `dev-be` scope expand.

---

## 5. Recommended option + dispatch

| Priority | Option | When |
|----------|--------|------|
| **P0 now** | **A — persona correction** | Prefer: subordinate FE-submits leave → approve as `uat.nv0001@xe.vn`. No `apps/**`, no seed. |
| **P0 if A blocked** | **B — product manager assign** | 0 direct reports / null hierarchy → dev-be + dev-fe per §3 → QA browser then qa-device |
| **Reject** | **C** | Unless Sponsor+SA new FR |

**BA matrix note (governance delta, non-blocking):** `po-e2e-ba-case-matrix-01.md` §0 lists `uat.nv0001` as «QL trực tiếp» only — for LV-01 clarify **submitter ≠ approver**; approver = manager of submitter (`uat.nv0001` when submitter is a report). Optional follow-up `R-SPINE-LV02-BA-01` / matrix patch — not required to start Option A retest.

---

## 6. Business rules (testable)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-LEAVE-MGR-01** | `manager_employee_id` query present | Filter leave to employees with `manager_id =` that UUID | Empty if no reports / wrong persona |
| **BR-LEAVE-MGR-02** | LV-01 mobile approve | Approver must be **direct manager** of submitter | Pass only with hierarchy edge |
| **BR-WF-04** | Approver employee_id = submitter employee_id | Reject self-approve | 4xx / no APPROVED |
| **BR-U65-01** | QA/QC evidence | No seed of `manager_id`, inbox, or leave | Seed ⇒ reject PASS |

---

## 7. Acceptance criteria (Option A retest)

| # | AC | Pass |
|---|----|------|
| AC-1 | Submit leave from mobile as **report of HLD-0001** (FE wizard → «Đã gửi đơn») | Leave `pending` |
| AC-2 | Login `uat.nv0001@xe.vn` → Home **Phê duyệt** / Cần duyệt → tab Nghỉ phép | Count ≥ 1; row = AC-1 leave |
| AC-3 | Tap **Duyệt** → success VI; Network approve/complete **2xx** | Status approved; NV list/detail updates |
| AC-4 | F5 / re-open approvals | Row left pending queue |
| AC-5 | Evidence: U65 flag true; **no** `pnpm seed:*` / DB update | Test-log + screens |

---

## completion_report

**Closed:** Root cause confirmed (persona/hierarchy vs `manager_employee_id` filter — not seed). Option A documents correct L1 approver `uat.nv0001@xe.vn` + submitter = direct report. Option B cites UC-H01/FR-UC-H03/DB `manager_id` and AS-IS FE/DTO gap. Option C rejected vs SRS (SA only if new FR).

**Residual:** Live subordinate email TBD by QA discovery; if 0 reports → Option B execution wave.

**ack_status:** PASS_TO_PM  
**next_owner:** `qa-device` (Option A) · fallback `dev-be` then `dev-fe` (Option B)  
**evidence_path:** `docs/qa/evidence/r-spine-mgr-hier-01.md`

### next_dispatch_prompt

```text
work_item_id: R-SPINE-MGR-HIER-01-QA
role: qa-device
priority: P0
lane: execution
entry_criteria: R-SPINE-MGR-HIER-01 BA PASS_TO_PM · U65 zero-seed · emulator-5554 · hrm-api up
mission: Retest J-MOB-05 / SPINE-02 LV-01 with CORRECT persona pair (not ceo@xe.vn as L1 for HLD-0001 self-leave).
steps:
  1) Discovery read-only: login uat.nv0001@xe.vn / xevn-uat-2026 → Đội nhóm — pick holding subordinate with uat.nv#### login; if 0 reports → STOP BLOCKED → handoff Option B (dev-be+dev-fe manager_id on UC-H01) — cấm seed manager_id.
  2) Subordinate: FAB → Tạo đơn nghỉ → Gửi (U65 FE-only) → note leave id.
  3) Approver: uat.nv0001@xe.vn → home-action-tile-approve → Nghỉ phép ≥1 → Duyệt → 2xx + FE status + F5.
  4) cấm: ceo@xe.vn as L1 for this case · seed inbox · pnpm seed:* · claim UAT DONE.
exit_criteria: AC-1..5 in docs/qa/evidence/r-spine-mgr-hier-01.md §7; U78 test-log; screens under docs/qa/evidence/screens/r-spine-mgr-hier-01-qa/
evidence_path: docs/qa/evidence/r-spine-mgr-hier-01-qa.md
ack_status: PASS_TO_PM or FAIL_TO_PM (if 0 reports → pm_dispatch_hint Option B)
spec_ref: FR-UC-H03 · J-MOB-05 · PO SPINE-02 LV-01 · r-spine-mgr-hier-01.md
```

### next_dispatch_prompt (fallback if Option A BLOCKED)

```text
work_item_id: R-SPINE-MGR-HIER-01-BE-FE
role: dev-be
priority: P0
parallel_after_be: Task dev-fe
entry: Option A discovery 0 direct reports OR manager_id null on target NV · BA evidence docs/qa/evidence/r-spine-mgr-hier-01.md §3
mission: ADD manager_id on Create/Update Employee DTO+service (same company, no cycle, ≠ self); jest; CODE-MEMORY. Then dev-fe: UC-H01 picker «Quản lý trực tiếp» on EmployeeFormDialog → Lưu → F5. Cấm change leave list SQL semantics. Cấm seed.
exit: READY_FOR_QA browser UF-HRM-03 set manager → then qa-device J-MOB-05.
evidence: docs/qa/evidence/r-spine-mgr-hier-01-be.md · r-spine-mgr-hier-01-fe.md
spec_ref: FR-UC-H01 · FR-UC-H03 · DB_DESIGN_NEW employees.manager_id
```
