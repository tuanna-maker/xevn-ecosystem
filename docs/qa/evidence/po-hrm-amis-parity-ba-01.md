# Evidence — PO-HRM-AMIS-PARITY-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-BA-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim AMIS parity DONE · **cấm** invent module UAT · no `apps/**` · no_prompt_echo client docs |
| **next_owner** | sa / pm |

---

## 0. Read ack (ordered)

| # | Artifact | Used |
|---|----------|------|
| 1 | `PO_HRM_AMIS_PARITY_RESEARCH_01.md` §2–§4 | Domain map + PAY spine 7 bước + priority nguồn |
| 2 | AMIS public help (principles only — no product copy) | Cite §0.1 |
| 3 | `po-hrm-payroll-formula-run-gap-ba-01` · `qa-01` · `sa-01` · `data-01` (shared lesson) | Formula engine absent · enroll slice ≠ run · Option A ANSWERED · live ≠ paper |
| 4 | `PO_HRM_DYNAMIC_CONFIG_PLATFORM_01` + ADR Option **B** + BA matrix | Catalog + FormSchema + MergeToken · PAY vertical after CTR |
| 5 | Enterprise SRS FR-UC-BP-PAY-02/06 · PAY-01 · CORE-01/02 · ATT-10/11 · REC high-level | Spec says / gap class |
| 6 | E2E EMP/REC/ATT/PAY-CFG + CTR CORR lessons | Status stamps OK/BETTER/GAP/PARTIAL |

### 0.1 Public help anchors (principles only)

| Topic | URL | Principle extracted (no UI clone) |
|-------|-----|-----------------------------------|
| PAY spine 1–7 | https://helpamis.misa.vn/amis-tien-luong/kb/huong-dan-chung-luong-nghiep-vu-tinh-luong-tong-quan-tren-amis-tien-luong/ | Setup → components → sheet template → input packs → run sheet → ESS confirm → pay-out |
| Thành phần lương | https://helpamis.misa.vn/amis-tien-luong/kb/quan-ly-khoan-muc-luong/ | Open catalog + starter system rows; nature (income/deduct/other); type drives which input pack; formula/cap on component; Excel-like functions |
| Mẫu bảng lương | https://helpamis.misa.vn/amis-tien-luong/kb/mau-bang-luong/ | Template by OU/position/employee; pick components; DnD column order; **override formula per template**; preview layout |
| HRM cross-app | https://helpamis.misa.vn/amis-thong-tin-nhan-su/kb/tong-quan-luong-nghiep-vu-ket-noi-giua-cac-ung-dung-trong-bo-misa-amis-hrm/ | REC→EMP hire; EMP sync to ATT/PAY/INS; ATT aggregate → PAY; RD reward/discipline → other income/deduct; PAY→accounting/tax apps |
| Chấm công hub | https://helpamis.misa.vn/amis-cham-cong/ | Rules · shifts · leave · aggregate · confirm · **chuyển tính lương**; Face/GPS marketing = separate product surface |
| PC/KT catalog | https://helpamis.misa.vn/amis-thong-tin-nhan-su/kb/danh-muc-khoan-phu-cap-khau-tru/ | Allowance/deduction catalog with tax nature + value/cap; feeds profile, contract merge, payroll sync |

**Sponsor lock applied:** Gap vs AMIS → backlog; XeVN OK/BETTER → **không đè**; AI AVA / FaceID demos → Non-goals GĐ2+ unless SRS already in.

---

## 1. Full HR matrix — Domain × AMIS capability × XeVN status

**Status legend**

| Code | Meaning |
|------|---------|
| **OK** | XeVN principle/spec+partial product matches AMIS intent enough to keep |
| **BETTER** | XeVN exceeds AMIS on this axis (keep; do not regress) |
| **PARTIAL** | Spec and/or some product; spine incomplete vs AMIS |
| **GAP** | AMIS has clear capability; XeVN missing or hardcode/stub blocks customer-ready |
| **OOS** | Out of GĐ1 / marketing-adjacent / other product — do not invent into Phase1 |

| Domain | AMIS capability (principle) | XeVN neo / FR | Status | Pri | Notes |
|--------|----------------------------|---------------|--------|-----|-------|
| **EMP** | Master hồ sơ NV; sync list sang ATT/PAY/INS | CORE-01 · catalog-sync · hire-link | **PARTIAL** | P1 | Spine hire→EMP exists; free-text position / C&B-on-public residuals (E2E-EMP) |
| **EMP** | Lịch sử lương / mức BH / phụ thuộc trên NV | CORE-02 C&B · PAY-001 | **GAP** | **P0** | AMIS Step1 “Nhân viên” as formula input SoT; XeVN C&B surface incomplete vs salary-history→PAY |
| **EMP** | Danh mục PC/KT + gán theo vị trí / NV | Settings allowance catalog | **GAP** | **P0** | AMIS catalog + position policy; XeVN mix / not dual-bound to PAY components |
| **EMP** | Custom fields NS → merge HĐ / PAY vars | Platform MergeToken + CORE custom | **PARTIAL** | P1 | Platform Option B in flight (CTR first); EMP custom field register residual |
| **EMP** | Blacklist NV nghỉ → cảnh báo REC | — | **OOS** | P3 | Not in Enterprise MVP REC spine; backlog GĐ2 |
| **EMP** | MXH nội bộ thông báo sự kiện NS | — | **OOS** | P3 | Outside HRM product boundary |
| **EMP** | Multi-company / OU scope | ADR scope ladder · JWT memberships | **BETTER** | — | Keep; AMIS OU filters ≠ XeVN group CEO rollup |
| **REC** | Ứng viên → tạo hồ sơ NV | hire-employee-link · REC→EMP | **PARTIAL** | P1 | Link exists; UAT/module honesty `recruitment_uat_ready=false` |
| **REC** | Pipeline stages động | REC-05 · stages | **PARTIAL** | P2 | Stages partial enum; catalog-ize after JD |
| **REC** | JD / mô tả động theo pháp nhân | REC-00a..h JD-DYNAMIC · packs | **OK** / **BETTER** | — | Catalog+layout+packs = reference vertical #2; keep; soft OBS ≠ module UAT |
| **REC** | YCTD + định biên | REC-01/02 | **OK** | — | Spec depth strong; keep; free-text SoT forbidden (impl residual) |
| **REC** | So sánh UV / 1 lịch ACTIVE | REC-06a/06b | **PARTIAL** | P1 | Spec ADD; product gaps documented |
| **REC** | Campaign / job board sync | REC-03 | **OOS** | — | GĐ2 OUT MVP |
| **ATT** | Quy định muộn/OT/ca / danh mục | ATT-02 · config · work sites | **PARTIAL** | P1 | Config service present; device/Face stubs honesty |
| **ATT** | Đơn phép + quỹ + hold | ATT-08/09 · WF | **PARTIAL** | P1 | Ladder/WF residual; leave WAIVE stamps |
| **ATT** | Tổng hợp bảng công | ATT-10 | **PARTIAL** | **P0** | Aggregate exists; line-level vars for PAY (`att_timesheet_line`) residual per DATA lesson |
| **ATT** | Xác nhận / ký / **chốt** → chuyển lương | ATT-11 · J-HRM-06c | **PARTIAL** | **P0** | Close→PAY enroll gate **PASS slice**; module ATT ≠ UAT-ready; AMIS “chuyển tính lương” pack UX still shallow |
| **ATT** | FaceID / GPS / máy chấm marketing | Mobile Face · web stubs | **OOS** | — | Non-goal GĐ2+ unless SRS mobile Face already scoped (MOB Face ≠ invent web LIVE) |
| **ATT** | AVA AI chấm công | — | **OOS** | — | Non-goal AI |
| **PAY** | Step1 Thiết lập thuế/BH/thông số + lịch sử NV | Settings + CORE-02 | **PARTIAL** | **P0** | Partial Settings; salary-history depth GAP |
| **PAY** | Step2 Thành phần + công thức trên TP | `salary_components` · PAY-02 | **GAP** | **P0** | Catalog orphan/free-text; `formula` TEXT ≠ dual-control engine; starter≠closed enum OK direction |
| **PAY** | Step3 Mẫu bảng lương + override CT theo mẫu/OU | Period UI · templates | **GAP** | **P0** | No `pay_sheet_template` bind; SalaryTemplateBuilder ≠ AMIS mẫu+override |
| **PAY** | Priority nguồn: LS lương > dữ liệu kỳ > mẫu > danh mục | Q-PAY-F-3 + BA BR below | **GAP** | **P0** | Spec vars closed-sheet; **no** documented runtime merge priority matching AMIS |
| **PAY** | Step4 Dữ liệu: công chốt + thu nhập khác + tạm ứng | ATT close · enroll · advances | **PARTIAL** | **P0** | Closed sheet gate OK; other-income / advance packs **GAP/shallow** |
| **PAY** | Step5 Lập bảng → auto calc lines | PAY-06 process | **GAP** | **P0** | Create/enroll PASS slice; process → **0₫** · no lines (QA OBS) |
| **PAY** | Step6 Gửi phiếu ESS xác nhận | Payslip ESS | **PARTIAL** | P2 | Partial payslip read; confirm workflow shallow |
| **PAY** | Step7 Chi trả / payment batch | Payment APIs | **PARTIAL** | P2 | APIs exist; wire AC later |
| **PAY** | Dual-control soạn→phát hành CT | Q-PAY-FORMULA Option A | **BETTER** (paper) | **P0** | Governance stronger than typical HR self-edit; **product FAIL** until engine ships |
| **PAY** | FE không tính net | OS FE–BE separation | **BETTER** | — | Keep; must_keep on evaluate |
| **PAY** | AI AVA sinh/kiểm công thức | — | **OOS** | — | Non-goal GĐ2+ |
| **PAY** | Phân bổ lương → kế toán / TNCN app | XBOS / tax | **OOS** / **PARTIAL** | P3 | Cross-app accounting OOS GĐ1; TNCN deep GĐ2 unless SRS forces |
| **CTR** | Mẫu HĐ mở + merge fields | FR-09/09d · CORR open catalog | **OK** / **BETTER** | — | Open catalog + print-spine freeze; **BETTER** vs closed demos; printable flag still false |
| **CTR** | Clause library + layout DnD | print-spine · clause | **OK** | — | Keep; slice ≠ `contracts_printable_ready` |
| **CTR** | PC/KT merge vào mẫu HĐ | MergeToken + allowance | **PARTIAL** | P1 | AMIS has allowance merge tokens; XeVN MergeToken platform rolling |
| **INS** | BHXH process sync ↔ hồ sơ | employee-insurances · CORE | **PARTIAL** | P2 | Enrollment/bridge partial; AMIS BHXH app depth OOS full clone |
| **INS** | Tăng/giảm lao động timeline | SI timeline | **GAP** | P1 | E2E-EMP D5 residual |
| **Settings** | Catalog master mở · soft-delete | Platform Option B | **PARTIAL** | **P0** | Pattern locked; verticals uneven |
| **Settings** | Thông số mặc định thuế/BH/PC theo vị trí | company settings + policies | **GAP** | P1 | AMIS “Thông số mặc định\Phụ cấp”; XeVN incomplete |
| **Settings** | Document/email template types by subsystem | Merge + templates | **PARTIAL** | P2 | CTR first; mail templates REC GĐ2 |
| **Cross** | Không hardcode tenant policy trong Nest | ADR · AC-PAY-FORMULA-08 | **PARTIAL** | **P0** | Intent locked; process still zero-stub |
| **Cross** | Soft-delete only · multi-tenant | ADR + soft-delete | **BETTER** | — | Keep |

---

## 2. PAY depth (P0) — AMIS steps 1–7 → XeVN FR/AC → gap class

### 2.1 Spine map

| AMIS step | AMIS behavior (principle) | XeVN FR / AC | Product today | Gap class | Pri |
|-----------|---------------------------|--------------|---------------|-----------|-----|
| **1 Thiết lập** | Thuế/BH/thông số; **lịch sử lương NV**; dependents | CORE-02 · PAY-001 · Settings | Partial Settings; C&B/history incomplete | **paper-only** + **FE missing** + **data depth** | P0 |
| **2 Thành phần lương** | Open catalog + starter; nature/type; **formula/cap on component**; activate from system list | PAY-02 · AC-PAY-COMP-01 · AC-PLT-PAY-01 · AC-PAY-FORMULA-07 | Catalog exists; free-text TX; formula TEXT on component ≠ versioned publish | **orphan catalog** + **formula engine absent** | P0 |
| **3 Mẫu bảng lương** | Pick components; DnD columns; **override formula per mẫu/OU**; preview; default identity columns | PAY-09 (when opened) · Platform PAY template | Period/batch UI; template builder chrome ≠ bindable `pay_sheet_template` | **API/FE missing** template layer | P0 |
| **4 Dữ liệu tính lương** | Closed/chuyển công + **thu nhập khác** + **tạm ứng** as selected packs | PAY-01 · Q-PAY-F-3 · ATT-11 · advances | Closed-sheet gate PASS; other-income/advance packs shallow | **ATT precondition OK (slice)** · **input packs GAP** | P0 |
| **5 Lập bảng lương** | Create from **mẫu**; select input packs; **auto-calc lines** | PAY-06 · AC-PAY-HIRE-* · AC-PAY-RUN-06/07 | Create+enroll PASS; process **0₫** no lines | **formula engine absent** + **process stub** | P0 |
| **6 Gửi phiếu** | ESS confirm | Payslip ESS AC (later) | Partial list/detail | **FE missing** confirm | P2 |
| **7 Chi trả** | Payment batch / thực trả | Payment APIs | Partial | Wire AC | P2 |

### 2.2 Thành phần lương + formula

| Requirement | Spec / AMIS | XeVN | Verdict |
|-------------|-------------|------|---------|
| Open catalog + starter rows ≠ closed enum | AMIS system list + tenant add; Platform Option B | `salary_components` direction OK; consumer free-text residual | **PARTIAL** → bind picker P0 |
| Formula on component (Giá trị/Định mức) | AMIS Excel-like functions | FE FormulaInput string · Nest `formula` TEXT · **no** `pay_formula_definition` dual-control LIVE | **GAP** |
| Dual-control author→publish | Q-PAY-FORMULA Option A · AC-PAY-FORMULA-01..06 | Paper ANSWERED; API F-PAY-FORMULA-* HOLD until DATA+API | **paper BETTER** · product **FAIL** |
| GĐ1 form / GĐ2 DnD | R-PAY-DD-01 | Locked; cấm invent GĐ1 DnD | Keep |
| Evaluate BE-only | PAY-02 · no FE net | Process does not evaluate | **GAP** |

### 2.3 Mẫu bảng lương + override công thức theo mẫu

| Requirement | AMIS | XeVN target | Status |
|-------------|------|-------------|--------|
| Template scoped OU / position / employee | Yes | `pay_sheet_template` (+ OU bind) | **GAP** |
| Columns = selected `salary_components` | Yes | Lines from catalog codes | **GAP** |
| Override formula on template column | Yes (mẫu wins over component default when set) | Template-layer expression override in priority chain | **GAP** |
| DnD column order / group headers | Yes | GĐ2 UI OK after structure SoT | **PARTIAL** (chrome) / structure **GAP** |
| Default identity + totals columns | AMIS auto columns | Platform defaults + totals from engine | **PARTIAL** |

### 2.4 Priority nguồn (AMIS → XeVN BR)

**AMIS principle (help + program §3):** when resolving a component value for a run:

1. **Lịch sử lương / C&B nhân viên** (fixed PC per employee/position policy)  
2. **Dữ liệu kỳ** (closed timesheet vars · thu nhập khác · tạm ứng packs)  
3. **Mẫu bảng lương** formula override  
4. **Danh mục thành phần** default formula/value  

| BR id (proposed) | Rule | Fail if |
|------------------|------|---------|
| **BR-AMIS-PAY-SRC-01** | Closed timesheet snapshot is **only** source for hour/OT/leave vars (align Q-PAY-F-3) | Live Leave/OT HTTP or open sheet |
| **BR-AMIS-PAY-SRC-02** | Employee salary-history / C&B amount for a component **wins** over template/catalog when history present for effective date | Catalog/template overwrites employee fixed PC silently |
| **BR-AMIS-PAY-SRC-03** | Period input pack (other income / advance) **wins** for components typed as period-variable when pack row exists | Ignore pack; leave 0 without reason |
| **BR-AMIS-PAY-SRC-04** | Template formula override **wins** catalog default when template cell has override | Always catalog-only |
| **BR-AMIS-PAY-SRC-05** | Catalog default used only if 1–4 empty | Hardcoded Nest % fallback |

**Gap class:** priority chain **not implemented** → **GAP P0** (document in PAY depth wave + engine design).

### 2.5 Dữ liệu tính lương (công chốt · thu nhập khác · tạm ứng)

| Input pack | AMIS | XeVN | Status |
|------------|------|------|--------|
| Bảng công đã chốt / chuyển | ATT→PAY transfer | ATT close + ATT-412 + enroll eligibility | **PARTIAL** (gate OK; “chuyển” UX/pack shallow) |
| Thu nhập khác (lễ/tết, công tác, thưởng từ NS) | Period tables + EMP→PAY reward transfer | RD→PAY link shallow / missing packs | **GAP** P1 (P0 if blocks demo policy) |
| Tạm ứng | Advance subsystem | Advance APIs / soft OBS | **PARTIAL** P2 |
| Variable bag for engine | Derived from packs + C&B | Engine absent → bag unused | **GAP** P0 |

### 2.6 Lập bảng → auto calc lines (not 0₫)

| AC (reuse / extend) | Pass | Current |
|---------------------|------|---------|
| AC-PAY-RUN-01 | Create period 2xx + F5 | **PASS** slice |
| AC-PAY-RUN-02/03 | No closed sheet → block; closed → eligible | **PASS** slice |
| AC-PAY-RUN-04/05 | Enroll FE + F5 | **PASS** slice |
| AC-PAY-RUN-06 | Process → **≥1 line** · amounts match evaluate (not all 0 unless formula true 0) | **FAIL** (0₫ OBS) |
| AC-PAY-RUN-07 | Payslip detail shows component lines + formula version | **FAIL** |
| AC-PAY-RUN-09 | No active formula → explicit VI reason | **FAIL** / silent 0 |
| **AC-AMIS-PAY-TPL-01** (new) | Period created **from** active `pay_sheet_template` for OU | **UNTESTED** / absent |
| **AC-AMIS-PAY-TPL-02** (new) | Template override formula visible on preview evaluate | **UNTESTED** |
| **AC-AMIS-PAY-SRC-01** (new) | Fixed PC from salary history appears on lines without retyping | **UNTESTED** |

**Honesty:** enroll/process lifecycle seals ≠ customer-ready formula/run. Keep `payroll_e2e_ready=false`.

---

## 3. Customer-ready — tenant configures vs platform

| Tenant / pháp nhân configures (no Nest fork) | Platform ships once (XeVN) |
|----------------------------------------------|----------------------------|
| Activate/add **thành phần lương** from starter + custom codes | Open catalog engine + soft-delete + XBOS sync when group SoT |
| Nature flags (TNCN · BH · theo công) | Validation + tax/SI hooks |
| **Công thức** versions (form GĐ1) + dual publish | Metadata engine Option A · evaluator BE · AuthZ author≠publish |
| **Mẫu bảng lương** per OU/position (components, column labels, formula overrides) | `pay_sheet_template` SoT + bind on period |
| Employee **lịch sử lương / PC cố định** | CORE C&B timeline APIs |
| Period **thu nhập khác / tạm ứng** rows | Input pack APIs + ATT closed bind |
| Chốt bảng công tháng/pháp nhân | ATT sheet SM + PAY precheck |
| Run period → view lines / payslip | Process evaluate + payslip lines persist |
| HĐ templates / clauses / merge (CTR lane) | Catalog + clause + MergeToken Option B |
| JD fields/packs (REC) | JD-DYNAMIC platform pattern |
| **Cannot:** hardcode % in Nest; FE net; seed to fake payslip; closed enum ceiling on components/templates | CI golden · GW deny FE net · U65 |

**Rollout khách mới (target after GĐ1 product PASS):**  
(1) Pull/activate component catalog → (2) Author+publish formulas → (3) Build pay sheet templates → (4) Load C&B/history → (5) Close ATT → (6) Enter other-income/advance if any → (7) Create period from template → enroll → process → lines → (8 optional) ESS/pay-out.  

**Today:** (5)+(7 enroll) narrow evidence; (1) partial; (2)(3)(4)(6)(7 evaluate) **not customer-ready**.

---

## 4. Non-goals (GĐ2+ unless SRS already in)

| Item | Why out |
|------|---------|
| **AI AVA** formula author / check | Program §1 · sponsor lock · OOS |
| **FaceID / GPS / máy chấm** marketing demos as UAT of ATT module | Help hub marketing ≠ Enterprise ATT close spine; mobile Face only if already MOB-scoped |
| Full clone **AMIS Kế toán / Thuế TNCN / BHXH** standalone apps | Cross-app handoff OOS GĐ1; keep INS/tax depth per SRS only |
| **Blacklist → REC** auto-warn | Not in MVP REC spine |
| **MXH nội bộ** event posts | Outside product |
| **GĐ1 DnD** formula designer | R-PAY-DD-01 = GĐ2 |
| **DOCX-upload** as default HĐ authoring | Platform Q-PLT-02 GĐ2; clause-DnD-first keep |
| Claim **parity DONE** / payroll or module UAT from this research | Honesty lock |

---

## 5. Ranked backlog work_item suggestions (for PM)

| Rank | work_item_id (suggested) | Owner | Why |
|------|--------------------------|-------|-----|
| **1** | `PO-HRM-AMIS-PARITY-SA-01` | **sa** | Map Option B + PAY template/formula layers · unlock order · non-goals AI; synth this BA matrix |
| **2** | `PO-HRM-AMIS-PARITY-PAY-DEPTH-01` | ba-process + sa | Depth SoT for spine §2 → feed `PAYROLL-FORMULA-RUN-GAP` (template + SRC priority BR) |
| **3** | Continue `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01` → `…-API-01` | ba-data → sa | Physical expression + F.1 AUTHOR/PUBLISH/EVAL — blocks engine |
| **4** | `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01` | ba-process / ba-docs | FR/AC for mẫu bảng lương + override + OU bind (ADD-only under PAY-06/09) |
| **5** | `PO-HRM-PAY-SRC-PRIORITY-SPEC-01` | ba-process | Lock BR-AMIS-PAY-SRC-01..05 into Enterprise SRS DOC-DELTA |
| **6** | `PO-HRM-PAY-INPUT-PACKS-SPEC-01` | ba-process | Thu nhập khác + tạm ứng packs + RD→PAY transfer |
| **7** | `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` | ba-process | Lịch sử lương / PC cố định → PAY vars (EMP×PAY) |
| **8** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01` | ba-data / sa | PC/KT catalog ↔ `salary_components` dual SoT (AMIS sync principle) |
| **9** | After unlock: `PO-HRM-PAYROLL-FORMULA-EVAL-BE-01` → FE → QA | dev-be / fe / qa | Kill 0₫ stub; lines from evaluate |
| **10** | Platform PAY vertical after CTR | sa / pm | AC-PLT-PAY-01 picker + FormSchema formula form |
| **11** | ATT “chuyển tính lương” UX pack | ba-process / fe | Explicit transfer/bind after close (beyond ATT-412) — P1 |
| **12** | ESS confirm / payment wire | ba later | Steps 6–7 — P2 |
| **Defer** | AI AVA · Face marketing · blacklist · MXH · full tax app | — | Non-goals |

**Preserve (do not overwrite):** print-spine CTR · soft-delete · scope ladder · JD-DYNAMIC · ATT-412 closed-sheet gate · enroll AC-PAY-HIRE-04/05 seals · Q-PAY-FORMULA Option A · Platform Option B · U65 zero-seed.

---

## 6. Proposed AC pointers (AMIS parity — U65)

| AC | Domain | Pass (measurable) |
|----|--------|-------------------|
| AC-AMIS-PAY-TPL-01 | PAY | Settings/Lương: tạo mẫu bảng lương gắn ≥3 thành phần catalog → 2xx → F5 → tạo kỳ chọn mẫu đó |
| AC-AMIS-PAY-TPL-02 | PAY | Override công thức trên mẫu → preview evaluate BE shows override (not catalog default) |
| AC-AMIS-PAY-SRC-01 | PAY | NV có PC cố định trên lịch sử C&B → process line = history amount when no period override |
| AC-AMIS-PAY-PACK-01 | PAY | Kỳ chọn pack thu nhập khác → line non-zero for that component |
| AC-AMIS-ATT-XFER-01 | ATT→PAY | After sheet closed: PAY period lists/binds that sheet as input; missing bind → VI reason |
| Reuse AC-PAY-FORMULA-* / AC-PAY-RUN-* | PAY | From `po-hrm-payroll-formula-run-gap-ba-01` §4 — still authoritative for engine |

---

## 7. Assumptions · dependencies · open questions

| # | Item | Owner |
|---|------|-------|
| A1 | AMIS priority order interpreted from public help + program §3 — not proprietary internals | ba confirm with sa |
| A2 | Option B PAY vertical **after** CTR MergeToken remains recommended unless PM reorders with AC preserved | pm/sa |
| A3 | Partner REQ_L_002 / PAY-001 align with Option A — no re-workshop | locked |
| Q1 | Does GĐ1 require full “thu nhập khác” + “tạm ứng” packs before first customer UAT, or formula+closed-sheet+C&B only? | **pm/sponsor** (BA recommends: formula+template+C&B+closed sheet = P0; other-income/advance = P0 if demo policy needs; else P1) |
| Q2 | Single `pay_formula_definition` global vs per-template expression store — SA chooses storage; BA requires **override semantics** | sa |
| Q3 | Soft-delete vs “Ngừng theo dõi” label parity — cosmetic | fe later |

---

## completion_report

### Closed

1. **Full HR matrix** EMP/REC/ATT/PAY/CTR/INS/Settings × AMIS × XeVN status (OK|BETTER|GAP|PARTIAL|OOS) × P0–P3.  
2. **PAY depth P0:** steps 1–7 → FR/AC → gap class; components+formula; mẫu+override; **priority nguồn** BR-AMIS-PAY-SRC-01..05; input packs; lập bảng ≠ 0₫.  
3. **Customer-ready** tenant vs platform + rollout honesty.  
4. **Non-goals:** AI AVA, FaceID marketing, full clone accounting/tax apps, GĐ1 DnD, parity DONE claims.  
5. **Ranked backlog IDs** for PM dispatch after research.  
6. Cite public help URLs (principles only) · no `apps/**` · `payroll_e2e_ready=false`.

### Residual

- SA synth Option B + PAY layers (`PO-HRM-AMIS-PARITY-SA-01`).  
- PAY depth dual seat (`…-PAY-DEPTH-01`) + formula DATA/API unlock chain.  
- Sponsor Q1 on other-income/advance P0 vs P1.  
- No product LIVE / UAT claims.

### Explicit non-claims

- Not AMIS parity DONE.  
- Not payroll / EMP / ATT / REC module UAT-ready.  
- Not Phase 1 DONE.

---

## next_owner

**sa** (primary) · **pm** (dispatch)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-SA-01
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
priority: P0

## Goal
Synth AMIS parity BA matrix → architecture: Platform Option B + PAY template/formula layers; wave unlock; non-goals AI AVA / Face marketing. Cấm claim parity DONE / payroll UAT.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-ba-01.md
2. docs/program/PO_HRM_AMIS_PARITY_RESEARCH_01.md
3. docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md (Option B)
4. docs/qa/evidence/po-hrm-payroll-formula-run-gap-sa-01.md
5. ADR-HRM-4-PILLAR §10 Option A (ANSWERED — do not reopen)

## Deliverable
docs/qa/evidence/po-hrm-amis-parity-sa-01.md
- Map: salary_components · pay_sheet_template · pay_formula_definition · SRC priority · ATT bind
- Storage choice for template formula override vs global formula version
- Wave order vs CTR MergeToken + PAYROLL-FORMULA-RUN-GAP DATA/API
- Confirm non-goals: AI AVA, FaceID demos, GĐ1 DnD
- next_dispatch_prompt for PO-HRM-AMIS-PARITY-PAY-DEPTH-01 and/or formula DATA/API

## Exit
PASS_TO_PM · no apps/** · payroll_e2e_ready=false · no parity DONE claim
```

### Parallel (optional same session)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-DEPTH-01
from_role: pm
to_role: ba-process
lane: governance
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
priority: P0
co_read: sa evidence when available

## Goal
Depth SoT for AMIS Tiền lương spine → DOC-ready BR/AC pack feeding PAYROLL-FORMULA-RUN-GAP (template + SRC priority + input packs). Cite po-hrm-amis-parity-ba-01.md §2.

## Exit
PASS_TO_PM · evidence docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md · payroll_e2e_ready=false · no apps/**
```

---

## evidence_path

`docs/qa/evidence/po-hrm-amis-parity-ba-01.md`

## ack_status

**PASS_TO_PM**
