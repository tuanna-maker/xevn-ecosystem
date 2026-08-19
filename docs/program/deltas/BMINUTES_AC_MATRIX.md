# B-Minutes Customer Retest — AC Matrix (BM-02..BM-07)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-BA-AC-MATRIX-01` |
| **program_id** | `P1-BMINUTES-CUST-RETEST-01` |
| **from_role** | ba-process |
| **to_role** | pm → explore / sa / ba-data / qa (by gap) |
| **lane** | governance |
| **opened** | 2026-07-22 |
| **U65** | Zero-seed · browser FE→BE only |
| **change_mode** | **ADD** AC packaging for customer retest — **cấm** REPLACE UF 🟢 / claim Phase1/PROD / claim ecosystem SRS complete |

**Sources:** `BMINUTES_CUSTOMER_RETEST_PROGRAM.md` · PDF biên bản HRM · `CUSTOMER_DEMO_HRM_DELTA_20260620.md` (F3–F6) · `XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · `docs/client-delivery/hrm/BRD_HRM_KHACH.md` · `SRS_HRM_KHACH.md` · `docs/hrm/TECHSPEC.md` · `ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md`

**BM-01** Connect / template danh mục = **DEFER sponsor (T8)** — không AC trong matrix này.

**Column `code_does`:** luôn **UNKNOWN** cho đến khi `BM-EXP-FE-*` / `BM-EXP-BE-*` / QA browser trả evidence — BA **không** invent code truth.

---

## Legend

| Token | Meaning |
|-------|---------|
| **PASS when** | Post-mutation FE visible + Network 2xx (or documented alternate) + F5/navigate còn |
| **spec_says** | Normative from BRD YC / SRS FR / TechSpec § / delta AC |
| **code_does** | `UNKNOWN` until explore/QA |
| **must_keep** | UF/J already 🟢 — regression only; no overwrite |

---

## BM-02 — Role / company context rõ (F3)

| AC-ID | Given / When / Then | spec_ref | Persona | Click path FE | PASS when | Maps | spec_says / code_does |
|-------|---------------------|----------|---------|---------------|-----------|------|------------------------|
| **BM-AC-02-01** | **G:** Group CEO logged in, HRM embed open. **W:** View any HRM tab. **T:** Chip/banner shows ĐVTV context + role label (not raw UUID). | BRD **Yêu cầu-01** · SRS **FR-HRM-SCOPE-01/03** · Delta **AC-CD-F3-01** · TechSpec scope / ADR-HRM-RBAC §3 | `ceo@xe.vn` | Portal → Nhân sự embed → bất kỳ P-CC tab | Chip visible on load; no UUID-only label | **J-HRM-INT-05** · UF-HRM-09 (member contrast) | **spec_says:** context chip required · **code_does:** UNKNOWN |
| **BM-AC-02-02** | **G:** Group CEO, JWT `companyId=main`. **W:** Switch OU filter to member slug (vd. `trsport`). **T:** List refetch ≤2s for that slug only; JWT still `main`. | BRD Yêu cầu-01 · SRS FR-HRM-SCOPE-03 · **AC-CD-F3-02/03** · BR-CD-F3-03 · TechSpec embed scope | `ceo@xe.vn` | Embed OU filter → chọn ĐVTV → observe list + JWT | ≥1 GET mới; rows = slug; JWT `main` unchanged; F5 same | J-HRM-INT-05 · P-CC-* | **spec_says:** filter ≠ JWT mutate · **code_does:** UNKNOWN |
| **BM-AC-02-03** | **G:** Member CEO single tenant. **W:** Open HRM. **T:** No group rollup; switcher hidden/disabled single value. | BRD Yêu cầu-01 · SRS **FR-HRM-SCOPE-02** · **AC-CD-F3-06** · BR-CD-F3-05 | `du-lich.ceo@xe.vn` | Login → HRM embed | 0 holding rollup rows; no silent multi-company | UF-HRM-13 · UF-HRM-09 | **spec_says:** member isolation · **code_does:** UNKNOWN |
| **BM-AC-02-04** | **G:** User with `memberships.length > 1` (when persona exists, **no seed**). **W:** Select other membership. **T:** `POST …/select-membership` 2xx → JWT re-issue → HRM remount tenant B. | Delta **UC-HRM-SCOPE-04** · **AC-CD-F3-04** · ADR-HRM-RBAC §5.3 · TechSpec auth select-membership | Multi-hat (target) | Portal membership switcher → chọn → wait remount | Network select-membership 2xx; data = tenant B; F5; **no** 409 stale | Condition **C-CD-FB-06-01** if N/A | **spec_says:** JWT re-issue · **code_does:** UNKNOWN (prior QC N/A single-hat) |

**Prior art:** CD-FB-06 GWC — do not reopen closed label condition; retest BM-AC-02-* on :8088 as customer retest.

---

## BM-03 — Workflow động (chức danh / cấp trên / song song) (F4)

| AC-ID | Given / When / Then | spec_ref | Persona | Click path FE | PASS when | Maps | spec_says / code_does |
|-------|---------------------|----------|---------|---------------|-----------|------|------------------------|
| **BM-AC-03-01** | **G:** XBOS Admin. **W:** Canvas save step with `resolver_type` ∈ {`direct_manager`,`position_template`,`parallel_group`} (+ config). **T:** Reload definition still has resolver payload (not only `assigneeUserId`). | Delta **AC-CD-F4-06/07** · ADR-WORKFLOW-RESOLVER-DYNAMIC §5 · UC-XBOS-13 · BRD XBOS §14.3 | Admin XBOS | XBOS → Workflow canvas → edit step resolver → Lưu → reload | Persist resolver; Network save 2xx; F5 | **J-REC-WF-01** (canvas pattern) · leave F4 demo | **spec_says:** ≥3 resolver types · **code_does:** UNKNOWN |
| **BM-AC-03-02** | **G:** Definition leave `hrm_leave_approval` active with `direct_manager`. **W:** NV create leave from FE. **T:** Inbox task assignee = manager of submitter (not hardcoded `ceo@xe.vn` / `GROUP_APPROVER_USER`). | Delta **AC-CD-F4-01/02** · BR-CD-F4-01/02 · SRS FR-HRM-AT-10 · TechSpec leave + WF bridge | NV + Manager | HRM Leave → Tạo đơn → Lưu → Approver mở Inbox | Spawn/inbox 2xx path; assignee correct; F5 leave pending | UF leave path · **not** seed inbox | **spec_says:** dynamic manager · **code_does:** UNKNOWN |
| **BM-AC-03-03** | **G:** Step `position_template` + `position_code`. **W:** Submit business needing that step. **T:** Assignee = active position assignment user; empty → escalate per BR-CD-F4-04. | ADR §5 `position_template` · **AC-CD-F4-03** · BR-CD-F4-04 | Admin + assignee | Canvas config → FE submit → Inbox | Correct assignee or escalation log; no silent drop | BM-07 position catalog dependency | **spec_says:** position resolve · **code_does:** UNKNOWN |
| **BM-AC-03-04** | **G:** `parallel_group` policy `all`, 2 child resolvers. **W:** One approver completes. **T:** Step still pending until both complete. | ADR §7 · **AC-CD-F4-04** · BR-CD-F4-03 | 2 approvers | Inbox A Duyệt → check B still pending → B Duyệt → advance | No early advance; Network complete 2xx; F5 | — | **spec_says:** parallel all · **code_does:** UNKNOWN |
| **BM-AC-03-05** | **G:** Active instance. **W:** Approver Từ chối + lý do. **T:** Entity rejected; notify; instance terminal; no orphan. | **AC-CD-F4-05** · FR-HRM-AT-13 pattern | Approver | Inbox → Từ chối → confirm | Status rejected + reason; F5; notify visible | Maps reject pattern **J-REC-WF-06** | **spec_says:** reject closed · **code_does:** UNKNOWN |

**Out of BM-03 mutate scope:** inventing new business codes beyond leave pilot + recruitment bridge (BM-06) without SA ADR.

---

## BM-04 — HĐLĐ: lương thử việc, phụ cấp tách, lịch sử (F5)

| AC-ID | Given / When / Then | spec_ref | Persona | Click path FE | PASS when | Maps | spec_says / code_does |
|-------|---------------------|----------|---------|---------------|-----------|------|------------------------|
| **BM-AC-04-01** | **G:** Employee in scope. **W:** Create HĐ (type + dates) without forcing single salary-on-contract field. **T:** Contract row saved; compensation optional separate tab/package. | BRD **Yêu cầu-15** · SRS **FR-HRM-CI-01** · Delta **AC-CD-F5-01** · BR-CD-F5-01 · TechSpec §14.2 / §17.1 `employee_contracts` + compensation soft | HCNS / Group CEO | Hợp đồng → Thêm HĐ → Lưu (không bắt buộc lương đơn) | POST/PUT contracts **2xx** → row on list → **F5** | **UF-HRM-02** · J-HRM-03 · **must_keep** | **spec_says:** HĐ ≠ bắt buộc salary field · **code_does:** PASS (`bm-qa-contract-comp-retest-01-20260722`) |
| **BM-AC-04-02** | **G:** NV status probation. **W:** Save compensation with `probation` + `base` lines. **T:** Both amounts visible; API persists both. | Delta **UC-HRM-CI-09** · **AC-CD-F5-02** · BR-CD-F5-02 · TechSpec compensation-packages §17.1 | HCNS | NV → Lương/Phụ cấp or HĐ compensation tab → nhập lương thử việc + cơ bản → Lưu | POST package/lines **2xx** → FE shows both → F5 | UF-HRM-MENU-02b · UF-HRM-06 related | **spec_says:** probation line · **code_does:** PASS create+history · residual revise `HRM-COMP-002` (`bm-qa-contract-comp-retest-01-20260722`) |
| **BM-AC-04-03** | **G:** Catalog «Loại phụ cấp» synced. **W:** Add ≥2 allowance lines different codes. **T:** Lines persist distinct; vi-VN thousand group on entry. | Delta **AC-CD-F5-03** · BR-CD-F5-03 · DANH_MUC §33 · UX_VI format AC | HCNS | Thêm phụ cấp ×2 mã khác → Lưu | 2xx → rows → F5; amounts grouped | UF-HRM-02 deep / salary dialog | **spec_says:** multi allowance · **code_does:** PASS core · soft static catalog G-BM-04-02 |
| **BM-AC-04-04** | **G:** Existing package. **W:** Change base salary twice. **T:** History shows ≥2 versions (append-only); no destructive overwrite. | **AC-CD-F5-04** · BR-CD-F5-05 · TechSpec `employee_compensation_history` | HCNS | Sửa lương → Lưu → sửa lại → mở Lịch sử | Each save 2xx; timeline ≥2; F5 history còn | — | **spec_says:** version history · **code_does:** PASS history≥3 F5 (`bm-qa-contract-comp-retest-01-20260722`) |
| **BM-AC-04-05** | **G:** Contract list embed. **W:** Open employee → compensation. **T:** Cross-nav works; no 409/500 cold. | **AC-CD-F5-05** · FR-HRM-INT-02 · BR-CD-F5-06 | Group CEO | P-CC contracts → NV → compensation | Detail loads; GET package 2xx | J-HRM-01 · J-HRM-03 | **spec_says:** embed parity · **code_does:** PASS `/hr` · COND P-CC Vite presets missing |

---

## BM-05 — Thư viện JD + dashboard trạng thái UV (F6)

| AC-ID | Given / When / Then | spec_ref | Persona | Click path FE | PASS when | Maps | spec_says / code_does |
|-------|---------------------|----------|---------|---------------|-----------|------|------------------------|
| **BM-AC-05-01** | **G:** HCNS in scope. **W:** CRUD job template (title, mô tả, yêu cầu). **T:** List shows template; F5 còn. | BRD **Yêu cầu-14** · Delta **UC-HRM-RC-07** · **AC-CD-F6-01** · BR-CD-F6-01 · TechSpec leftover `job_templates` (§17.6 Lane B — **not** FR-RC primary) · SRS RC family | Group CEO / HCNS | Tuyển dụng → tab/thư viện JD → Thêm → Lưu | POST **2xx** → row → F5 | UF-HRM-MENU-06 · prior art JobTemplatesTab | **spec_says:** JD CRUD · **code_does:** UNKNOWN |
| **BM-AC-05-02** | **G:** ≥1 JD template. **W:** Create requisition selecting JD. **T:** JD fields prefilled; save requisition. | **AC-CD-F6-02** · UC-HRM-RC-08 · SRS **FR-HRM-RC-01** · TechSpec §14.7 `job_template_id` optional | HCNS | YCTD → chọn JD → Lưu | POST requisition **201/2xx** → JD filled → F5 | **UF-HRM-12** · **J-HRM-05** **must_keep** | **spec_says:** link template · **code_does:** UNKNOWN |
| **BM-AC-05-03** | **G:** Candidates in stages. **W:** Open recruitment dashboard. **T:** 6-column funnel counts = live aggregate API (no mock). | **AC-CD-F6-03/04** · UC-HRM-RC-09 · BR-CD-F6-06 · BR-DQ-01 · FR-HRM-SCOPE-01 rollup | `ceo@xe.vn` | P-CC-06 / HRM recruitment dashboard | GET aggregate **200**; UI = API; filter ĐVTV subset | **J-REC-WF-05** · J-HRM-05 | **spec_says:** live funnel · **code_does:** UNKNOWN |
| **BM-AC-05-04** | **G:** Candidate in list. **W:** Click row. **T:** Detail loads (stage chip visible). | **AC-CD-F6-05** · FR-HRM-RC-03 | HCNS | List UV → click | GET by id **200**; no 404 scope | **J-HRM-05** | **spec_says:** list→detail · **code_does:** UNKNOWN |

---

## BM-06 — XBOS cấu hình TD → áp dụng ĐVTV → HRM chạy WF gán (bridge)

| AC-ID | Given / When / Then | spec_ref | Persona | Click path FE | PASS when | Maps | spec_says / code_does |
|-------|---------------------|----------|---------|---------------|-----------|------|------------------------|
| **BM-AC-06-01** | **G:** Admin XBOS. **W:** Save active definition `hrm_recruitment_*` (plan/requisition/pipeline). **T:** Reload resolver còn. | Bridge delta **AC-REC-WF-01** · UC-HRM-REC-WF-01 · DANH_MUC ownership XBOS WF | Admin XBOS | Canvas → Lưu QT tuyển dụng → reload | Save 2xx; definition active; F5 | **J-REC-WF-01** | **spec_says:** canvas SoT · **code_does:** UNKNOWN |
| **BM-AC-06-02** | **G:** Definition active **or** missing. **W:** HCNS submit plan/requisition from FE. **T:** Spawn 2xx + `workflow_instance_id` **or** banner `SPAWN-MISSING` + pending (no silent approve). | **AC-REC-WF-02** · BR-REC-WF-01/02 · TechSpec requisitions submit-workflow | HCNS | HRM TD → Gửi duyệt | Network start 2xx **or** banner; F5 pending | **J-REC-WF-02** · UF-HRM-12 | **spec_says:** spawn or honest fail · **code_does:** UNKNOWN |
| **BM-AC-06-03** | **G:** Inbox task from FE chain (no seed). **W:** Approver Duyệt. **T:** HRM plan/req status approved/open; F5. | **AC-REC-WF-03** · UC-HRM-REC-WF-03 · BR-REC-WF-03 | Approver | XBOS Inbox → Duyệt → open HRM | Callback sync; FE status; F5 | **J-REC-WF-03** · J-XBOS-01 pattern | **spec_says:** inbox→HRM · **code_does:** UNKNOWN |
| **BM-AC-06-04** | **G:** Candidate pipeline instance. **W:** Step complete with mapped `task_type`. **T:** `candidate.stage` = F6 map; roadmap chip updates. | **AC-REC-WF-04** · BR-REC-WF-04 · UC-HRM-REC-WF-04 | Engine + HCNS | After inbox step → candidate detail | Stage correct; unmapped = fail-closed (no silent guess) | **J-REC-WF-04** · J-HRM-05 | **spec_says:** stage map · **code_does:** UNKNOWN |
| **BM-AC-06-05** | **G:** Post-sync stages. **W:** Open dashboard. **T:** Funnel = aggregate after WF sync; Group CEO `main` rollup. | **AC-REC-WF-05** · BR-REC-WF-11 · AC-CD-F6-03 | `ceo@xe.vn` | P-CC-06 dashboard | Counts match API; F5 | **J-REC-WF-05** | **spec_says:** post-sync funnel · **code_does:** UNKNOWN |
| **BM-AC-06-06** | **G:** Active pipeline. **W:** Reject + reason. **T:** rejected + notify; **no** hired downgrade. | **AC-REC-WF-06** · UC-HRM-REC-WF-06 · BR-REC-WF-06 | Approver | Inbox Từ chối | Status rejected; F5; hired protected | **J-REC-WF-06** | **spec_says:** reject safe · **code_does:** UNKNOWN |
| **BM-AC-06-07** | **G:** Entity has active `workflow_instance_id`. **W:** FE/API PATCH stage bypass. **T:** **409** `HRM-REC-WF-LOCKED` (or UI disable). | **AC-REC-WF-07** · BR-REC-WF-08 | HCNS | Attempt direct stage change | Bypass blocked | — | **spec_says:** lock · **code_does:** UNKNOWN |
| **BM-AC-06-08** | **G:** No active WF instance. **W:** Requisition CRUD. **T:** UF-HRM-12 + J-HRM-05 still PASS. | **AC-REC-WF-08** · must_keep | Group CEO | UF-HRM-12 path | 201/200 + F5 | **UF-HRM-12** · **J-HRM-05** | **spec_says:** CRUD regression green · **code_does:** UNKNOWN |

**Member apply:** catalog/process configured at XBOS + applied to ĐVTV scope before HRM mutate — SA SoT in `BM-SA-XBOS-HRM-REC-TRACE-01`; BA AC assumes publish/sync path **FR-HRM-06/08** + J-XBOS-02/08 when catalog involved.

---

## BM-07 — Chức vụ trong Setting; chọn NV hiện chức vụ

| AC-ID | Given / When / Then | spec_ref | Persona | Click path FE | PASS when | Maps | spec_says / code_does |
|-------|---------------------|----------|---------|---------------|-----------|------|------------------------|
| **BM-AC-07-01** | **G:** Group CEO. **W:** Settings catalogs sync/list chức danh (position) from XBOS SoT. **T:** Overview shows effective items; sync stamp human-readable. | BRD **Yêu cầu-05/17/29** · SRS **FR-HRM-SC-01** · **FR-HRM-06/08** · TechSpec §14.8 settings-catalogs · DANH_MUC chức danh | `ceo@xe.vn` | Settings → Danh mục → Sync/xem chức danh | GET/sync **2xx** → list → F5 | **UF-HRM-10** · UF-HRM-MENU-17 | **spec_says:** XBOS SoT catalog · **code_does:** UNKNOWN |
| **BM-AC-07-02** | **G:** Position/chức danh items exist in effective catalog. **W:** Create/edit employee; select chức vụ/chức danh. **T:** Saved value from catalog; profile shows label (not dead code). | BRD **Yêu cầu-06** · SRS **FR-HRM-EM-01** Quy tắc-2 · TechSpec CreateEmployee `job_title_key` + catalog | HCNS | Nhân sự → Thêm/Sửa NV → chọn chức vụ → Lưu | POST/PATCH **2xx** → profile shows chức vụ → F5 | **UF-HRM-03** · UF-HRM-01 | **spec_says:** pick from synced catalog · **code_does:** UNKNOWN |
| **BM-AC-07-03** | **G:** Position used in WF resolver (BM-03). **W:** Assignment exists for `position_code`. **T:** Resolver can resolve (cross-check BM-AC-03-03). | ADR position_template · BR-CD-F4-03 · XBOS position-assignment | Admin + HCNS | XBOS position assignment + HRM/Settings consistency | Resolve non-empty **or** documented escalate | BM-03 · BM-06 | **spec_says:** assignment feeds resolver · **code_does:** UNKNOWN |

**Note:** BM-07 ≠ G-DB-04 dual recruitment catalog (TechSpec §17.6). G-DB-04 is recruitment spine/catalog twin — do not conflate with «chức vụ» employee position.

---

## Journey / UF crosswalk (summary)

| BM | Primary J-* / UF | Secondary |
|----|------------------|-----------|
| BM-02 | J-HRM-INT-05 | UF-HRM-09/13 · AC-CD-F3-* |
| BM-03 | (leave F4) + J-REC-WF-01 pattern | AC-CD-F4-* |
| BM-04 | UF-HRM-02 · J-HRM-03 | UF-HRM-MENU-02b · AC-CD-F5-* |
| BM-05 | UF-HRM-12 · J-HRM-05 · J-REC-WF-05 | AC-CD-F6-* |
| BM-06 | **J-REC-WF-01..06** | UF-HRM-12 · J-HRM-05 · AC-REC-WF-* |
| BM-07 | UF-HRM-10 · UF-HRM-03 | FR-HRM-SC/EM · BM-03 resolver dep |

---

## Gap classes → next owners (no code claim)

| Gap class | BM AC | Owner | Why |
|-----------|-------|-------|-----|
| FE existence / wire | 02, 04, 05, 07 UI | `BM-EXP-FE-JD-POS-WF-01` then **dev-fe** if FAIL | Inventory first |
| BE bridge / resolver / compensation API | 03, 04, 06 | `BM-EXP-BE-WF-BRIDGE-01` then **dev-be** if FAIL | UNKNOWN until probe |
| Publish XBOS→member→HRM sequence | 06 | **sa** `BM-SA-XBOS-HRM-REC-TRACE-01` | SoT map |
| Position data contract | 07 | **ba-data** (narrow) | Catalog key ↔ employee field |
| Browser U65 E2E | 05+06 P0 | **qa** `BM-QA-REC-E2E-8088-01` | After explore/SA |

---

## Cấm

- Seed / API-only PASS · overwrite UF 🟢 · Phase1/PROD claim · «SRS ecosystem complete» · invent `code_does` PASS/FAIL
