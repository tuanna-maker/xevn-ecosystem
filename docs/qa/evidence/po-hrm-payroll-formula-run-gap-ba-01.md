# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BA-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` (program SoT) · **cấm** claim formula LIVE · **cấm** invent module UAT |
| **no apps/** | PASS — docs/evidence only |

---

## 0. Read ack (ordered)

| # | Artifact | Used |
|---|----------|------|
| 1 | `DECISION_PACKET_Q_PAY_FORMULA.md` | **ANSWERED** — 2 bước soạn→phát hành · **R-PAY-DD-01** Form GĐ1 + kéo-thả GĐ2 · **Q-PAY-F-3** chỉ bảng công chốt |
| 2 | `SRS_HRM_ENTERPRISE` FR-UC-BP-PAY-02 · PAY-01 · PAY-06 (+ AC-PAY-COMP-01 · AC-PAY-HIRE-01..05) | Spec says author/publish/evaluate + Hire→kỳ→phiếu |
| 3 | ADR 4-pillar §10 Option A | Dual-control metadata engine; cấm hardcode tenant formula |
| 4 | `po-hrm-bp-adr-q-pay-formula-01.md` | SA Recommended (pre-ANSWERED); API/apps HOLD |
| 5 | `po-hrm-bp-synth-pay-tech-01.md` · `po-hrm-e2e-link-pay-*` | F-PAY-FORMULA-* HOLD; enroll slice GWC; process stub |
| 6 | `PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md` + BA PAY row | Catalog `salary_components` · formula form = Schema; vertical PAY chưa ship |
| 7 | Partner `REQ_L_002` / PAY-001 | IT thiết lập CT trên DB ↔ PPT engine — hòa bằng Option A |

**Unlock signal (governance):** Sponsor packet **ANSWERED** supersedes ADR/API wording «chờ khách confirm» — residual = **DOC-DELTA unlock F-PAY-FORMULA-*** + physical expression schema (ba-data), **không** = claim product LIVE.

---

## 1. Spec says / product does

| Capability | Spec says (SoT) | Product does (code + evidence) | Gap class | Verdict |
|------------|-----------------|--------------------------------|-----------|---------|
| **Formula author GĐ1 form** | PAY-02: C&B mở **biểu mẫu** lắp biến; R-PAY-DD-01 Form GĐ1 (kéo-thả = GĐ2); ADR Option A metadata `expression_json` | FE có `FormulaInput` + `SalaryTemplateBuilder` (chuỗi Excel-like `=…` trên template/TP) — **không** SoT `pay_formula_definition` versioned; không preview dry-run qua API evaluate | **FE missing** (đúng contract) + **formula engine absent** + **paper-only** (SRS Diễn biến ≠ runtime) | **FAIL** |
| **Dual-control publish** | Q-PAY-FORMULA: soạn (C&B) → phát hành (Technical Publisher / dual-sign); draft ≠ active; immutable version sau bind kỳ | Không API AUTHOR/PUBLISH; không RBAC author≠publish; template CRUD lưu thẳng — không pending_publish | **API HOLD** + **FE missing** | **FAIL** |
| **Evaluate on process** | PAY-02 #3 · PAY-06 bước 5 · F-PAY-PROCESS-01: runtime **evaluate** bản active đã bind; FE **không** tự tính net | `processPayrollPeriod`: ATT-412 gate OK; enroll/auto-upsert payslip với **gross/deduction/net = 0** (hoặc giữ số cũ); **không** đọc/evaluate formula definition; **không** sinh `pay_payslip_line` | **formula engine absent** | **FAIL** |
| **Variables from closed timesheet only** | PAY-01 · Q-PAY-F-3 · BR: giờ/OT/phép **chỉ** từ bảng công **đã chốt**; cấm đọc OT/phép trực tiếp | Eligibility + process precheck: `require_closed_timesheet` → `NO_CLOSED_SHEET` / `HRM-PAY-ATT-412` — **đúng hướng**. Biến giờ **chưa** nạp vào engine (vì engine chưa có) | **ATT precondition** (gate PASS hẹp) · evaluate vars = **UNTESTED**/engine absent | Gate **PASS** (slice) · vars→formula **FAIL** |
| **Create payroll period** | PAY-06 Diễn biến #2 · AC-PAY-HIRE-03: tạo kỳ nháp đúng pháp nhân; không chồng kỳ | Browser: Lập bảng lương → POST period **201**; list/scope parity waves (hire QA-05 / att-close) | Partial product | **PASS** (create/list) · overlap policy **UNTESTED** sâu |
| **Enroll** | PAY-06 · AC-PAY-HIRE-01/02/04/05: đưa NV đủ điều kiện → phiếu draft; FE sau 2xx + F5 | Enroll API + FE Thêm NV; att-close QA-03: POST **201** · row UAT-0100 · F5; QC GWC **slice** enroll | Partial product | **PASS** (narrow slice) · **≠** formula/module UAT |
| **Payslip lines** | PAY-08 + F-PAY-PAYSLIP-01: dòng thành phần từ engine / dual SoT `salary_components` | Payslip header amounts (thường 0 sau process stub); **không** chứng minh line items từ formula version; TP form vẫn free-text mã vs catalog (AC-PAY-COMP-01 residual) | **formula engine absent** + **FE missing** (COMP picker) | **FAIL** |

### Honesty stamp conflict (ghi rõ — không resolve bằng invent)

| Stamp | Source | BA stance for this program |
|-------|--------|----------------------------|
| `payroll_e2e_ready=true` (narrow) | att-close QA-03 + QC-01 — **only** AC-PAY-HIRE-04∧05 enroll | **ACCEPT as slice history**; **không** promote sang formula/run engine |
| `payroll_e2e_ready=false` | `PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md` | **SoT program** — formula + process evaluate + lines còn mở |
| Module payroll UAT / formula LIVE | — | **DENIED** |

---

## 2. Traceability — FR/UC/AC → evidence

| ID | Intent | Evidence pointer | Status |
|----|--------|------------------|--------|
| **Q-PAY-FORMULA** | Dual-control + metadata engine | Decision packet ANSWERED · ADR §10 | **PASS** (paper) |
| **R-PAY-DD-01** | Form GĐ1 · DnD GĐ2 | Decision packet · SRS PAY-02 | **PASS** (paper) · product form≠engine **FAIL** |
| **Q-PAY-F-3** | Vars chỉ bảng công chốt | Eligibility + ATT-412 | **PASS** (gate) · evaluate bind **UNTESTED** |
| **FR-UC-BP-PAY-01** | Lương chỉ đọc sheet chốt | Hire/att-close evidence | **PASS** (precheck) |
| **FR-UC-BP-PAY-02** | Động cơ công thức 7 mục | SRS paper · API F-PAY-FORMULA-* HOLD · FE FormulaInput ≠ Option A | **FAIL** product |
| **AC-PAY-COMP-01** | Mã TP từ catalog khi còn items | CFG SPEC · SalaryComponents free-text code | **FAIL** / residual |
| **AC-PLT-PAY-01** | Platform catalog bind PAY | Dynamic-config BA matrix | **UNTESTED** product |
| **FR-UC-BP-PAY-06** | Hire→kỳ→enroll→process→phiếu | Enroll slice GWC · process stub | **PARTIAL** |
| **AC-PAY-HIRE-01** | Empty có lý do / có NV sau đợt | Eligibility reasons UI | **PASS** (reasons) · full happy **PARTIAL** |
| **AC-PAY-HIRE-02** | Không toast giả | Hire FE waves | **PASS** (slice) |
| **AC-PAY-HIRE-03** | Không chồng kỳ / khóa | Create period | **UNTESTED** (overlap deep) |
| **AC-PAY-HIRE-04** | FE sau enroll 2xx | `po-hrm-e2e-link-pay-att-close-qa-03` | **PASS** |
| **AC-PAY-HIRE-05** | F5 còn phiếu | cùng QA-03 | **PASS** |
| **F-PAY-FORMULA-*** | Author/publish F.1 | API_DESIGN HOLD | **HOLD** → unlock after ANSWERED |
| **F-PAY-PROCESS-01** | Evaluate + write lines | Nest process zero-amounts | **FAIL** vs DRAFT API intent |
| **F-PAY-PERIOD-01** | Period CRUD | Live periods API | **PASS** (draft create) |
| **REQ_L_002** | TP + CT linh hoạt DB | Partner catalog | **PASS** paper · product **FAIL** |
| **PAY-001** | Lịch sử C&B / cờ PC TNCN·BH·ngày công | Partner + PAY-02 input groups | **UNTESTED** / partial catalog fields |
| **J-HRM-06c** | Att close precondition | QA-02 + UAT ATT seats | **PASS** (slice; module ATT still GWC≠ready) |
| **UF-HRM-06 / J-HRM-07** | Màn Lương / phiếu | Enroll + payslip list read | **PARTIAL** |
| Formula LIVE / `payroll_e2e_ready` module | — | Program SoT | **HOLD** / **false** |

---

## 3. Gap classes (rollup)

| Class | What is missing | Blocking? |
|-------|-----------------|-----------|
| **paper-only** | PAY-02 Diễn biến author→publish→evaluate đã chốt giấy; Decision ANSWERED; ADR Option A | Unlocks governance — **not** product |
| **API HOLD** | `F-PAY-FORMULA-*` AUTHOR/PUBLISH/PREVIEW/EVALUATE F.1 đầy đủ; API text còn «chờ confirm» **stale** vs ANSWERED | **P0** unlock SA |
| **FE missing** | Màn GĐ1 form đúng SoT version+dual-control+preview API; picker `salary_components` (AC-PAY-COMP-01); DnD GĐ2 OUT | **P0** after API |
| **ATT precondition** | Sheet **đúng tháng/pháp nhân** phải closed trước eligible/process — gate có; UAT ATT module còn CONDITIONS | **P0** for full run UAT; enroll slice đã chứng minh khi sheet Jan closed |
| **formula engine absent** | Không `pay_formula_definition` live ensureSchema+evaluate; process không sinh lines; FE FormulaInput chỉ validate chuỗi client | **P0** customer-ready blocker |

**Non-gaps (must_keep):** soft-delete · JWT scope · FE enroll body không `company_id` · ATT-412 · cấm FE net · U65 zero-seed · CTR MergeToken ≠ xong lương.

---

## 4. Proposed AC pack GĐ1 (U65 — no seed)

### AC-PAY-FORMULA-01..N

| AC | Pass (measurable) | Fail |
|----|-------------------|------|
| **AC-PAY-FORMULA-01** | Login C&B → Settings/Lương → mở form **soạn** công thức (GĐ1) → lưu **bản nháp** 2xx → F5 còn nháp; list hiện version + trạng thái nháp | Chỉ có ô công thức trên TP/template không version; mất sau F5 |
| **AC-PAY-FORMULA-02** | User chỉ quyền author **không** tự Phát hành: nút publish ẩn/deny 403; audit không có active mới | Author tự active ngay khi Save |
| **AC-PAY-FORMULA-03** | Technical Publisher (hoặc dual-sign) **Phát hành** → status active theo pháp nhân + ngày hiệu lực; bản cũ retired/immutable | Publish không phân role; sửa đè active không version |
| **AC-PAY-FORMULA-04** | **Xem trước** (dry-run): gọi API evaluate với kỳ mẫu + NV mẫu → FE hiện gross/net/dòng từ **BE**; Network evaluate 2xx; FE không POST net tự tính | Preview chỉ client-side FormulaInput; hoặc không có preview |
| **AC-PAY-FORMULA-05** | Publish khi thiếu biến bắt buộc (sheet vars / C&B) → chặn + message VI | Cho publish thiếu biến |
| **AC-PAY-FORMULA-06** | Kỳ đã process/bind `formula_version_id`: sửa nháp mới **không** đổi số kỳ đã chạy | Draft sửa làm đổi payslip kỳ cũ |
| **AC-PAY-FORMULA-07** | AC-PAY-COMP-01: khi catalog `salary_components` còn item hiệu lực → form CT/TP **chọn mã catalog** (không Input mã SoT tự do) → 2xx + F5 | Free-text mã là SoT |
| **AC-PAY-FORMULA-08** | Grep/CI / golden: path process **không** chứa hệ số tenant hardcode (150%/200% OT…); OT từ sheet chốt | Hardcode % trong Nest calculate |

### AC-PAY-RUN-01..N

| AC | Pass (measurable) | Fail |
|----|-------------------|------|
| **AC-PAY-RUN-01** | C&B → Lương → **Lập bảng lương** tạo kỳ nháp đúng pháp nhân → list có kỳ → F5 còn | Tạo kỳ 4xx/5xx; mất sau F5 |
| **AC-PAY-RUN-02** | Chưa có bảng công chốt đúng overlap kỳ: eligibility `NO_CLOSED_SHEET` (hoặc tương đương VI); checkbox NV disabled + lý do; process → **412** ATT | Im lặng eligible; process thành công không sheet |
| **AC-PAY-RUN-03** | Sau J-HRM-06c close sheet đúng tháng/pháp nhân: `eligible_count≥1` trên cùng kỳ | Close tháng khác vẫn unblock; hoặc eligible=0 dù sheet closed đúng |
| **AC-PAY-RUN-04** | Thêm NV / enroll 2xx → lưới phiếu/dòng kỳ cập nhật mã NV **ngay**; không toast giả | AC-PAY-HIRE-04 regress |
| **AC-PAY-RUN-05** | F5 / mở lại cùng kỳ: phiếu còn đúng NV | AC-PAY-HIRE-05 regress |
| **AC-PAY-RUN-06** | **Process** khi đã enroll + sheet chốt + CT **active**: 2xx → payslip status processed; **≥1 payslip line** map thành phần; amounts khớp evaluate (không toàn 0 trừ CT thật =0) | Process chỉ flip status / amounts 0 mặc định; không lines |
| **AC-PAY-RUN-07** | Mở chi tiết phiếu: thấy dòng TP + tham chiếu `formula_version_id` (hoặc mã version hiển thị); F5 còn | Chỉ header net trống/0 không giải thích |
| **AC-PAY-RUN-08** | Kỳ processed/closed: từ chối sửa tính / enroll trái SM; message VI | Cho sửa sau khóa |
| **AC-PAY-RUN-09** | Không có CT active: process/enroll path từ chối hoặc empty **có lý do** «thiếu công thức» (không im lặng) | Tạo phiếu ẩn / 0 mãi không lý do |

**Journey map (ba-docs khi mở):** đề xuất `J-HRM-07c` formula author→publish→preview; `J-HRM-07d` att-close→enroll→process→lines (reuse UF-HRM-06 · J-HRM-06c).

---

## 5. Customer-ready note — tenant custom vs platform

| Tenant / pháp nhân **chỉ cấu hình** (không fork code) | **Platform** (XeVN ship một lần) |
|------------------------------------------------------|----------------------------------|
| Danh mục thành phần lương (mã/tên/cờ TNCN·BH·theo ngày công) trong khung catalog | Catalog engine + dual SoT `salary_components` / `pay_types` + sync XBOS khi SoT tập đoàn |
| Hệ số / biểu thức công thức (version) theo đơn vị | Metadata formula engine + `expression_json` schema + evaluator BE |
| Ngày hiệu lực / chọn bản active theo CT | Dual-control publish + RBAC author≠publisher + audit |
| Gán CT active cho kỳ / nhóm bảng lương (PAY-09 khi mở) | Period/enroll/process SM · ATT closed gate · payslip + lines persist |
| Preview trên dữ liệu mẫu của CT | API evaluate (FE display-only) |
| **Không** được: nhúng SQL/script mỗi kỳ; hardcode % trong Nest; FE tính net | **Cấm** Option B/C; GW deny FE net; U65 không seed để «có bảng lương» |

**Rollout khách mới (target khi GĐ1 product PASS AC trên):** (1) Pull/publish catalog TP · (2) Soạn+publish CT form · (3) Đóng bảng công · (4) Lập kỳ → enroll → process → phiếu có dòng. **Hiện tại:** chỉ (3)+(4 enroll) hẹp đã có bằng chứng; (1) partial; (2)+(evaluate lines) **chưa**.

---

## 6. Residual → next owners

| Residual | Owner | Note |
|----------|-------|------|
| R-PAY-FORMULA-API-UNLOCK | **sa** | DOC-DELTA: bỏ HOLD «chờ confirm»; F-PAY-FORMULA AUTHOR/PUBLISH/PREVIEW/EVALUATE F.1; align ADR §10 + ANSWERED |
| R-PAY-FORMULA-DATA | **ba-data** | Physical `pay_formula_definition` (+ publish audit) · expression schema tối thiểu GĐ1 · bind `formula_version_id` trên period/payslip · live vs alias |
| R-PAY-FORMULA-PLATFORM | **sa** / platform | Vertical PAY trên Option B: catalog TP + FormSchema formula form (sau CTR MergeToken) |
| R-PAY-COMP-PICKER | **dev-fe** (sau unlock) | AC-PAY-COMP-01 / AC-PLT-PAY-01 |
| R-PAY-ENGINE-PROCESS | **dev-be** (sau unlock) | Evaluate on process · lines · cấm zero-stub làm UAT PASS |
| R-PAY-QA-INVENTORY | **qa** | Inventory formula/run UNTESTED vs enroll PASS — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-01` |
| R-PAY-ATT-MODULE | ATT UAT CONDITIONS | Keep closed-sheet gate; module ATT ≠ deny payroll when sheet month matched |
| Honesty | **pm** | Giữ `payroll_e2e_ready=false` ở program formula until AC-PAY-FORMULA-* + AC-PAY-RUN-06/07 PASS |

---

## completion_report

### Closed

1. Gap matrix **spec says / product does** cho 7 capability: author form · dual-control · evaluate · closed-sheet vars · create period · enroll · payslip lines.
2. Traceability FR/UC/AC/F-* → PASS|FAIL|UNTESTED|HOLD|PARTIAL với evidence paths.
3. Gap classes: paper-only · API HOLD · FE missing · ATT precondition · formula engine absent.
4. AC pack GĐ1 **AC-PAY-FORMULA-01..08** + **AC-PAY-RUN-01..09** (U65, no seed).
5. Customer-ready: tenant config vs platform; rollout steps; honesty locks.
6. Không `apps/**` · không invent `payroll_e2e_ready=true` ở mức module/formula · không claim formula LIVE.

### Residual (open)

- SA unlock F-PAY-FORMULA-* + platform PAY vertical pointer.
- ba-data physical formula + bind columns.
- QA inventory seat (parallel W0).
- Dev chỉ sau W0+W1 unlock.

---

## next_owner

**pm** (dispatch parallel W0: sa + ba-data + qa)

## next_dispatch_prompt

### A — SA (P0)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-SA-01
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P0

## Goal
Unlock path F-PAY-FORMULA-* after sponsor Q-PAY-FORMULA ANSWERED; align Option A dual-control + platform PAY catalog vertical; cấm claim LIVE.

## read_first
1. docs/qa/evidence/po-hrm-payroll-formula-run-gap-ba-01.md
2. docs/program/PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md
3. DECISION_PACKET_Q_PAY_FORMULA.md (ANSWERED)
4. ADR-HRM-4-PILLAR-API-BOUNDARY.md §10
5. API_DESIGN_HRM_ENTERPRISE.md F-PAY-FORMULA-* HOLD + F-PAY-PROCESS-01
6. ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md (PAY catalog)

## Deliverable
docs/qa/evidence/po-hrm-payroll-formula-run-gap-sa-01.md
- DOC-DELTA: supersede «chờ confirm» → ANSWERED unlock criteria
- F.1 sketch AUTHOR/PUBLISH/PREVIEW/EVALUATE + error codes (FORMULA-412…)
- Process must call evaluator (reject silent zero-stub as UAT PASS)
- Platform PAY vertical order vs CTR
- GĐ1 form / GĐ2 DnD boundary
exit: PASS_TO_PM · no apps/** · payroll_e2e_ready=false
```

### B — ba-data (P0)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01
from_role: pm
to_role: ba-data
lane: governance
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P0

## Goal
Physical matrix: pay_formula_* · salary_components · period/payslip formula_version_id · payslip lines vs DB_DESIGN + live Nest ensureSchema.

## read_first
1. docs/qa/evidence/po-hrm-payroll-formula-run-gap-ba-01.md
2. DB_DESIGN_HRM_ENTERPRISE.md § pay_formula_definition
3. docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-DB-01.md
4. apps/api/hrm-api payroll ensureSchema (read-only compare)

## Deliverable
docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md
- AS-IS live tables vs alias pay_*
- expression_json minimal schema GĐ1 (opaque→typed fields)
- Bind columns; line table SoT
- Migration need YES/NO before Dev
exit: PASS_TO_PM · no apps/** · cấm invent payroll_e2e_ready
```

### C — QA inventory (P0 parallel)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P0

## Goal
Evidence inventory only (no promote): formula author/publish · lập bảng · ATT→enroll · process→lines — stamp UNTESTED|FAIL|PASS|HOLD vs AC-PAY-FORMULA-* / AC-PAY-RUN-*.

## read_first
1. docs/qa/evidence/po-hrm-payroll-formula-run-gap-ba-01.md §4 AC pack
2. po-hrm-e2e-link-pay-att-close-qa-03.md · qc-01 (enroll slice)
3. po-hrm-e2e-link-pay-hire-qa-05.md
4. Program honesty payroll_e2e_ready=false for formula

## Deliverable
docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-01.md
entry: L0 optional; browser spot only if stack up — cấm seed
exit: PASS_TO_PM inventory · cấm invent formula LIVE / module UAT
```

---

## evidence_path

`docs/qa/evidence/po-hrm-payroll-formula-run-gap-ba-01.md`
