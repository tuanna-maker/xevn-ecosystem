# QA matrix — PO-HRM-CTR-WORKSPACE-WAVE-G4 (Phase A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-WAVE-G4` |
| **phase** | **A** — matrix + L0 (browser **BLOCKED** pending G3) |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **stamp** | **`CTRWSG4M1-MSNWKSPC`** |
| **ack_status** | **`PASS_TO_PM`** (matrix published · L0 PASS · Phase B BLOCKED on G3) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **URL (mandatory)** | `http://127.0.0.1:5173/command-center/hrm/contracts` (pilot `:8088/...` same path) |
| **U65** | zero-seed · **cấm** `pnpm seed:*` · mutate chỉ từ FE |
| **honesty** | `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** · **cấm** claim UF-HRM-10 full / module CTR UAT |
| **commit** | `dc930c5` |
| **read_first** | `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md` · `docs/qa/evidence/po-hrm-ctr-create-redesign-qa-04.md` |
| **upstream** | G1 ba-process (NV-first · hire CTA) · G2 sa (ContractWorkspace ADR) · **G3 dev-fe** (workspace merge · print spine view/edit) |
| **phase_b_evidence** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-01.md` (after G3 `READY_FOR_QA`) |

---

## 1. Phase plan

| Phase | Scope | Entry | Exit | Status |
|-------|--------|-------|------|--------|
| **A (this seat)** | Publish browser matrix + L0 stack | PM dispatch G4 | Matrix rows + L0 trace · G3 gate noted | **DONE** |
| **B** | U65 browser execute matrix | **G3** `PO-HRM-CTR-WORKSPACE-WAVE-G3` **`READY_FOR_QA`** | Evidence `qa-po-hrm-ctr-workspace-g4-01.md` · per-row 🟢/🔴 | **BLOCKED** |

**G3 blocker:** `TEAM_WORKING_NOW.md` — G3 `dev-fe` still **DISPATCHED** (gộp workspace · print spine view/edit). Phase B **cấm** claim UF slice PASS until G3 handoff + L0 re-run same session.

---

## 2. L0 gates (executed 2026-08-11)

| Gate | Command | Result | Notes |
|------|---------|--------|-------|
| **L0 stack** | `pnpm run qc:dev-stack` | **PASS** (services) | hrm-api `:28001` **200** · xbos-api `:28002` **200** · portal `:5173` **200** · Windows Node UV exit assertion noise (same as qa-04) |
| **L0 FE↔BE** | `pnpm run qc:fe-be-health` | **exit 0** | `hrm-employees-direct` **200** · `hrm-catalog-sync-direct` **200** · portal proxy HRM **200** · login token OK |

---

## 3. Matrix — five G4 themes

> **Chuẩn chung Phase B:** Login CC → menu Nhân sự → **Hợp đồng** · URL **must** contain `command-center/hrm/contracts` · sau mutate: Network **2xx** · quan sát FE · **F5** · probe/API alone ≠ 🟢.

### 3.1 NV-first CREATE + F5

| Row | AC / J | Click path (HDSD) | Pass when | Fail when | Phase A | Carry (prior QA) |
|-----|--------|-------------------|-----------|-----------|---------|------------------|
| **WS-G4-01** | **AC-CTR-SUBJECT-01** · **J-HRM-CTR-CREATE-01** (bước 1) | Thêm HĐ → tab **Ứng viên** (default) · `ctr-create-candidate-picker-search` · chọn UV (tên+mã, không UUID trigger) | Toggle UV\|NV · search inline · trigger label tên/mã | UUID trên trigger · không search | **PLANNED** | qa-04 **PASS** SUBJECT-01 |
| **WS-G4-02** | **AC-CTR-SUBJECT-02** · **J-HRM-CTR-CREATE-01** (mutate) | Điền mẫu · ngày ký · hình thức LV · tỉ lệ % · trích yếu → chọn UV → **Tiếp** / **Lưu** | `POST/PATCH` draft **2xx** · `candidate_id` bind · list/detail label UV | Không POST · chặn tại picker · bắt buộc `employee_id` khi chưa NV | **BLOCKED** | qa-04 **BLOCKED** DEF-CTR-PICKER-INLINE-PORTAL-P1 · retest-dnd **BLOCKED** (0 UV / 0 template) |
| **WS-G4-03** | **AC-CTR-FIELD-01..05** · **FIELD-04** | Bước 1: mã+loại → Tên HĐ read-only · ngày ký bắt buộc · LV catalog + % · card C&B read-only · textarea Trích yếu | FIELD rules per BA-02 §4 | Thiếu field · editable Tên HĐ · «+ Thêm» phụ cấp | **PLANNED** | qa-04 FIELD-01..04 **PASS** (pre-UV-pick) |
| **WS-G4-04** | **J-HRM-CTR-CREATE-01** · **F5** | Lưu sổ (hoặc registry path O8) → đóng dialog → **F5** list CC | Row HĐ còn · party/label khớp POST body | Mất sau F5 · list trống sau 2xx | **BLOCKED** | Phụ thuộc WS-G4-02 mutate |

**Pre-req (U65, không seed):** ≥1 UV scope (`GET recruitment/candidates`) · ≥1 mẫu HĐ **active** (`GET contract-templates?status=active`) — tạo từ FE Settings/tuyển dụng trước khi matrix row 🟢.

---

### 3.2 DnD bước 2 (Command Center URL)

| Row | AC / J | Click path | Pass when | Fail when | Phase A | Carry |
|-----|--------|------------|-----------|-----------|---------|-------|
| **WS-G4-05** | **AC-CTR-UX-07** | Mọi thao tác DnD/preview trên URL `…/command-center/hrm/contracts` | Evidence ghi đúng CC path | PASS chỉ `/hr/contracts?portal=1` | **PLANNED** | qa-04 UX-07 **PASS** |
| **WS-G4-06** | **AC-CTR-DND-01** · **J-HRM-CTR-CREATE-02** | Bước 2: palette → canvas DnD ≥2 clause · **Gỡ** 1 dòng optional | `ctr-create-clause-dnd-ready` · canvas ≥1 · không storm `Unable to find drag handle` | canvas=0 · 13× DnD storm (QA-03 pattern) | **BLOCKED** | qa-04 DND **BLOCKED** · FE-04 parent-portal unverified post-pick |
| **WS-G4-07** | **AC-CTR-DND-02** | Gỡ clause **mandatory** → confirm VI · Hủy giữ · Đồng ý gỡ | Confirm dialog · canvas cập nhật | Gỡ im lặng mandatory | **BLOCKED** | Cùng WS-G4-06 |
| **WS-G4-08** | **AC-CTR-UX-06** | Dialog bbox ~≥85% viewport · overlay che sidebar CC | w/h ratio ≥0.85 (screenshot) | ~66% iframe dialog (audit FAIL) | **PLANNED** | qa-04 UX-06 **PASS** 0.9×0.9 parent-portal |

**G3 linkage:** workspace merge + print spine — retest DnD sau G3 nếu clause panel / canvas mount đổi shell.

---

### 3.3 View clause + PDF (workspace print spine)

| Row | AC / J | Click path | Pass when | Fail when | Phase A | Carry |
|-----|--------|------------|-----------|-----------|---------|-------|
| **WS-G4-09** | **AC-CTR-WS-VIEW-01** (G3) · **J-HRM-03** | List → Eye **Chi tiết** · `hdsd-contracts-view-*` | `GET …/contracts/{id}?company_id=main` **2xx** · party/dept/ngày ký/trích yếu khớp GET (không stale list row) · dialog ~90vw parent portal | `max-w-lg` stale · dept `—` khi list có · không GET-by-id | **BLOCKED** | `D-PO-HRM-CTR-VIEW-SYNC-01` READY_FOR_QA — chưa browser promote |
| **WS-G4-10** | **AC-CTR-WS-VIEW-02** (G3) | Workspace **view** mode: danh sách điều khoản / section preview từ issued hoặc draft preview API | Clause titles + body snippet từ API preview (`POST …/preview` hoặc GET detail) — **không** hardcode FE body | Empty clause list khi preview 2xx có sections · mojibake | **BLOCKED** | G3 print spine view/edit |
| **WS-G4-11** | **AC-CTR-WS-PDF-01** (G3) | Xem trước / phiên bản in (nếu UI expose) · không claim printable UAT | Preview/issue path **2xx** · UI render title VI · `contracts_printable_ready` vẫn **false** | Claim module PDF UAT · seed VER | **BLOCKED** | CLQA3-KMJRGF issue spine partial · AC-PLT-CTR-CL-02/03 FAIL carry |

**Note:** PDF/issue = **C-SLICE** only; matrix row 🟢 ≠ UF-HRM-10.

---

### 3.4 Hire → HĐ CTA (G1)

| Row | AC / J | Click path | Pass when | Fail when | Phase A | Carry |
|-----|--------|------------|-----------|-----------|---------|-------|
| **WS-G4-12** | **AC-REC-07-04** · **J-HRM-REC-07-03** | Sau hire (REC U65) → mở hồ sơ NV → tab Hợp đồng · `hdsd-hire-readiness-banner` | Blocker `HRM-HTP-NO-ACTIVE-CONTRACT` khi chưa HĐ · banner/CTA rõ (link tạo HĐ hoặc mở CC contracts) | Im lặng · seed HĐ · crash | **PLANNED** | REC-07 QA **PASS** API blocker · FE CTA P2 OBS |
| **WS-G4-13** | **AC-CTR-WS-HIRE-CTA-01** (G1) | Từ banner/CTA hire → navigate CC contracts → **Thêm HĐ** prefill NV (tab Nhân viên) hoặc deep link | CTA mở đúng CC URL · NV đã chọn / search sẵn · không auto-sync UV giả | CTA 404 · prefill UUID · bịa `employee_id` | **BLOCKED** | G1 ba-process AMEND chưa evidence |
| **WS-G4-14** | **AC-HTP-05** · **J-HRM-REC-07-03** (after HĐ) | Sau tạo HĐ active cùng CT (WS-G4-04) → F5 hire-readiness | Blocker cleared · payroll gate honesty unchanged | Blocker còn sau HĐ 2xx+F5 | **BLOCKED** | Phụ thuộc WS-G4-04 |

---

### 3.5 Clause body Settings SoT (Nest RETAIN — not XBOS dual)

| Row | AC / J | Click path | Pass when | Fail when | Phase A | Carry |
|-----|--------|------------|-----------|-----------|---------|-------|
| **WS-G4-15** | **AC-PLT-CTR-CL-01** | Settings → Thư viện điều khoản HĐ · tạo/sửa `body_vi` draft | `POST/PATCH` clause **2xx** · body lưu `hrm_contract_clauses` | Dual-write Settings+XBOS · FE hardcode body | **PLANNED** | SA-01 Option B LOCK · CLQA2 sealed AC-01 |
| **WS-G4-16** | **AC-PLT-CTR-CL-02** | Sửa body clause **đã referenced bởi issued** version | **409** `HRM-CTR-CL-CODE-CONFLICT` (version bump path) | Silent **200** without bump | **PLANNED** | CLQA3 **FAIL** PATCH 200 — residual P1 |
| **WS-G4-17** | **AC-PLT-CTR-CL-03** | Sau issue: sửa clause draft → mở lại issued version UI | Snapshot body **frozen** (`clauses_snapshot_json`) | Issued body đổi theo edit | **PLANNED** | CLQA3 **FAIL** immutability |
| **WS-G4-18** | **AC-CTR-WS-CL-SOT-01** (G4) | Workspace **view** clause text = merge từ Nest SoT preview — **không** invent paragraph `ctr-*-honesty` | Preview sections match API `body_vi` / merged_fields | Settings-only body without Nest row · honesty paragraph | **BLOCKED** | G3 workspace + BR-CTR-CL-03 |

**SoT lock:** `hrm_contract_clauses.body_vi` (Nest) — **REJECT** Settings/XBOS dual body (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01`).

---

## 4. Journey rollup (L2.5)

| Journey | Maps to rows | Phase B | Prior |
|---------|--------------|---------|-------|
| **J-HRM-CTR-CREATE-01** | WS-G4-01..04 | BLOCKED (mutate) | qa-04 FAIL step2 |
| **J-HRM-CTR-CREATE-02** | WS-G4-05..08 | BLOCKED | qa-04 BLOCKED DND |
| **J-HRM-03** (list → view) | WS-G4-09 | BLOCKED | view-sync READY_FOR_QA |
| **J-HRM-REC-07-03** | WS-G4-12..14 | PLANNED / BLOCKED | REC-07 sealed API |
| **J-HRM-CTR-CL-ISSUE** (narrow) | WS-G4-11 · 15..18 | BLOCKED | CLQA3 partial |

**L2.5 rule:** L2 tab load **không đủ** — cần click path + detail API parity (U19).

---

## 5. Automation / harness (Phase B prep)

| Asset | Purpose | Status |
|-------|---------|--------|
| `scripts/qa/_tmp-po-hrm-ctr-create-redesign-qa-04.mjs` | CREATE regression baseline | Reuse · extend for G4 stamp |
| `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-01.mjs` | **TBD** Phase B unified runner | Not created (Phase B) |
| HDSD testids | `ctr-create-*` · `hdsd-contracts-view-*` · `hdsd-hire-readiness-banner` | Inventory in Phase B evidence |

**Phase B entry probe (no mutate):** document `active_templates` count · `candidates` count · banner state before claiming BLOCKED vs FAIL.

---

## 6. Defect carry-forward

| ID | Sev | Rows | Owner | Note |
|----|-----|------|-------|------|
| **DEF-CTR-PICKER-INLINE-PORTAL-P1** | P1 | WS-G4-02 | dev-fe | UV pick on parent-portal (qa-04) |
| **DEF-CTR-DND-PARENT-P0** | P0 unverified | WS-G4-06..07 | dev-fe | QA-03 DnD storm · FE-04 fix unverified |
| **DEF-CTR-U65-DATA-PREREQ** | P0 test | WS-G4-02..07 | product/U65 | 0 template/0 UV env — không seed |
| **R-CTR-CL-ISSUE-SPINE** | P1 | WS-G4-16..17 | dev-be | CLQA3 AC-02/03 FAIL |

---

## 7. completion_report

**Closed (Phase A):** Published G4 browser matrix **`CTRWSG4M1-MSNWKSPC`** — 18 rows across NV-first CREATE+F5 · DnD Step2 CC · view clause+PDF · hire→HĐ CTA · clause body SoT; mapped to BA-02 AC-CTR-* · J-CREATE · REC-07 · PLT-CTR-CL; L0 **`qc:dev-stack`** + **`qc:fe-be-health`** PASS (`hrm-api :28001`); carry-forward defects from qa-04 / CLQA3 / view-sync handoff.

**Open / BLOCKED:** **Phase B** U65 browser (`qa-po-hrm-ctr-workspace-g4-01.md`) **BLOCKED** until **`PO-HRM-CTR-WORKSPACE-WAVE-G3`** `READY_FOR_QA`; rows WS-G4-02..07 · 09..11 · 13..14 · 18 require G3 +/or successful CREATE mutate; **≠ UF-HRM-10** · `contracts_printable_ready=false`.

## next_owner

`pm` → re-dispatch **`qa`** Phase B when G3 `READY_FOR_QA`; parallel **`dev-fe`** close DEF-CTR-PICKER / DND if still open.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B
role: qa
read_first:
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-matrix-01.md
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md §4 §6
  - docs/qa/evidence/po-hrm-ctr-create-redesign-qa-04.md
entry_criteria: PO-HRM-CTR-WORKSPACE-WAVE-G3 dev-fe READY_FOR_QA; L0 qc:dev-stack + qc:fe-be-health exit 0; matrix CTRWSG4M1-MSNWKSPC published
exit_criteria: Execute rows WS-G4-01..18 U65 browser on http://127.0.0.1:5173/command-center/hrm/contracts · ceo@xe.vn · zero-seed · per-row 🟢/🔴 blocks (URL · click · Network 2xx · FE after mutate · F5) · stamp in docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-01.md · contracts_printable_ready=false · cấm UF-HRM-10 full claim
cấm: pnpm seed:* · API-only PASS · DnD PASS off CC URL
evidence_path: docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-01.md
ack_status: PASS_TO_PM or FAIL_TO_PM with defect ids
```

## evidence_path

`docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-matrix-01.md`

**ack_status:** **`PASS_TO_PM`**
