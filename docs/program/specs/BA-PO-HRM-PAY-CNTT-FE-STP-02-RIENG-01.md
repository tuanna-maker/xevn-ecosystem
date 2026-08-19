# BA AC Pack — RIÊNG Policy Pack (STP-02)

| Meta | Giá trị |
|------|---------|
| **work_item_id** | `BA-PO-HRM-PAY-CNTT-FE-STP-02-RIENG-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` → `sa` |
| **lane** | governance · U88 vertical kế sau CHUNG POLICY-PACK-01 |
| **date** | 2026-08-12 |
| **parent_qc** | `QC-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01` · stamp **`PAYPPQC1-MSPXZL1GQC1`** · residual **`R-PAY-STP-RIENG`** |
| **srs_neo** | [`PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md`](./PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md) · **UC-BP-PAY-STP-02** |
| **ui_neo** | `docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md` §3–§4 |
| **tech_neo** | [`PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md`](./PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md) · `pay_policy_pack.scope` / `business_line_tag` |
| **no_prompt_echo** | true |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Mục đích wave

Khóa **gói chấp nhận (AC)** cho vertical **RIÊNG** trên màn Gói chính sách (`STP-POLICY-PACK`) — CRUD gói `scope=RIENG` theo nhãn BP, tách biệt tab/form với CHUNG đã GWC.

Wave này **không** mở hub 5 mục placeholder (Danh mục TP / Mẫu bảng / Profile nhập / Nhóm lương / Gợi ý) và **không** đóng STP-05 (geo/tuyến) hay STP-06 (VP allowance/cost) như DoD.

---

## 2. Ranh giới so với CHUNG (đã seal)

| | **CHUNG · POLICY-PACK-01** | **RIÊNG · STP-02 (wave này)** |
|--|---------------------------|-------------------------------|
| Stamp | **`PAYPPQC1-MSPXZL1GQC1`** · **`PAYPPQAR2-MSPXZL1G`** | Chưa có — chờ SA → Dev → QA |
| Scope API | `scope=CHUNG` | `scope=RIENG` + `businessLineTag` bắt buộc khi tạo |
| Tab/filter UI | `pay-policy-pack-scope-chung` | `pay-policy-pack-scope-rieng` + `pay-policy-pack-bp-filter` |
| Actor chính | C&B tập đoàn | C&B OU/BP (và C&B tập đoàn xem/tạo RIÊNG theo quyền) |
| Form | **Cấm** gộp CHUNG+RIÊNG một form | Hai tab / hai entity — giữ nguyên |
| AC đã đóng | 01-01/02/03/05 · 03-01 · 04-01 | **Không** tái mở / regression claim CHUNG |
| Honesty | `payroll_e2e_ready=false` | **Giữ LOCK** — không flip |

**Cấm:** reopen POLICY-PACK-01 · claim CHUNG FAIL · đè path lock `policy-pack/**` không `Touch only if` · flip honesty flags.

---

## 3. Journey & UF đề xuất

| ID | Đề xuất | Persona | Click path (U65) | Gắn AC |
|----|---------|---------|------------------|--------|
| **J-HRM-PAY-STP-02** | **Đăng ký mới** trên `PROGRAM_JOURNEY_MAP.md` (chưa có hàng STP) | `ceo@xe.vn` (tập đoàn) · OU C&B khi có account pilot | Portal `/hr/payroll/setup?…&section=policy-pack` **hoặc** standalone `:8080` → hub **Gói chính sách** → tab **RIÊNG** → lọc BP → Thêm/Sửa/Ngưng → Network 2xx → **F5** còn đúng tab | AC-PAY-STP-02-01 · 02-04 · 02-A..C · GLOBAL-01/02 |
| Surrogate CHUNG (đã QA) | `J-HRM-PAY-STP-01-CHUNG` | — | Đã PASS narrow · **CARRY** đăng ký map (không thuộc DoD wave này) | POLICY-PACK-01 CLOSED |
| **J-HRM-07** | **NOT PROMOTED** | — | Phiếu lương ≠ setup RIÊNG | — |
| **UF-HRM-10** | **NOT PROMOTED** | — | Settings catalogs · DENIED | — |
| **UF-HRM-MENU-08** / **UF-HRM-06** | Chỉ **smoke load** nếu QA cần neo menu Lương | Group CEO | Vào `/payroll` rồi deep-link setup — **không** = UAT module lương | optional L2 |

**Đăng ký journey map (PM/BA cùng phiên sau SA Option):** thêm 1 hàng `J-HRM-PAY-STP-02` trạng thái ⬜ DRAFT → QA promote sau browser PASS.

---

## 4. Catalog nhãn BP (lock đề xuất — SA xác nhận F.1)

Nguồn TechSpec (không hardcode Nest enum tỉnh):

| Mã API `businessLineTag` | Nhãn VI trên filter | Ghi chú wave STP-02 |
|--------------------------|---------------------|---------------------|
| `DPHH` | ĐPHH | AC-PAY-STP-02-01 (happy path tạo) |
| `TDHK` | TĐHK | Filter + list parity |
| `LX_ROUTE` | LX (tuyến) | Filter list; **không** bắt buộc nhập geo keys ở wave này |
| `PROV_OFFICE` | VP | Filter list; **không** bắt buộc nhập `vp_*` ở wave này |

Filter «Tất cả» = mọi pack `scope=RIENG` trong scope JWT — **không** lẫn `scope=CHUNG`.

---

## 5. AC pack RIÊNG (DoD wave)

Mỗi AC: browser U65 · FE sau 2xx · F5 · không seed.

### 5.1 Core UC-BP-PAY-STP-02

| AC id | PASS (đo được) | FAIL | Pri | testid / Network |
|-------|----------------|------|-----|------------------|
| **AC-PAY-STP-02-01** | Tab RIÊNG → chọn BP `DPHH` → Thêm gói → mã/tên hợp lệ → Lưu → `POST …/pay-policy-packs` **201** body `scope=RIENG` + `businessLineTag=DPHH` → row trên list RIÊNG có tag ĐPHH → **F5** còn; tab CHUNG **không** hiện row | Row xuất hiện tab CHUNG · thiếu tag · F5 mất · POST không gửi `RIENG` | P0 | `pay-policy-pack-scope-rieng` · `pay-policy-pack-save` · row testid theo `code` |
| **AC-PAY-STP-02-04** | Dropdown BP → chọn `LX_ROUTE` → list chỉ pack RIÊNG `business_line_tag` khớp prefix/filter LX; chọn Tất cả → đủ RIÊNG; **0** row CHUNG | Filter không đổi list · lộ pack CHUNG · thiếu option catalog §4 | P0 | `pay-policy-pack-bp-filter` |
| **AC-PAY-STP-02-A** (parity archive) | Trên row RIÊNG active → Ngưng → `POST …/archive` **201** → ẩn khỏi list mặc định RIÊNG → F5 giữ ẩn (soft) | Hard-delete · vẫn active sau F5 · archive nhầm pack CHUNG | P0 | `pay-policy-pack-archive` |
| **AC-PAY-STP-02-B** (parity trùng mã) | Tạo RIÊNG mã trùng gói RIÊNG active cùng company → `HRM-PAY-POL-409-CODE` · banner VI · **giữ form** · không toast success giả | Ghi đè im lặng · xóa form | P0 | `pay-policy-pack-save` |
| **AC-PAY-STP-02-C** (parity hiệu lực) | `effectiveTo` &lt; `effectiveFrom` trên form RIÊNG → **không** gửi request · viền đỏ + message VI «Hiệu lực đến phải sau hiệu lực từ» | Vẫn POST/PATCH · message không VI | P0 | client validate · giống CHUNG 01-05 |
| **AC-PAY-STP-GLOBAL-01** | Mọi mutate RIÊNG ở trên: 2xx → list cập nhật → F5 row đúng scope | Mất row / nhảy tab sai sau F5 | P0 | `pay-policy-pack-list` |
| **AC-PAY-STP-GLOBAL-02** | Persona OU (khi có JWT BP hẹp): list RIÊNG chỉ pack cùng `business_line_tag` được phép — không leak BP khác | Leak cross-BP | P0 | filter + JWT scope |

### 5.2 Tách form / RBAC (nhắc lại BR)

| AC id | PASS | FAIL | Pri |
|-------|------|------|-----|
| **AC-PAY-STP-02-SEP** | Toolbar hai vùng CHUNG \| RIÊNG; form tạo RIÊNG **không** cho chọn `scope=CHUNG`; tạo CHUNG **không** bắt buộc BP tag | Một form gộp hai scope · radio ẩn gửi sai scope | P0 |
| **BR-PAY-STP-01** (retest smoke) | C&B OU mở thao tác CHUNG → **403** banner VI · không toast success · không auto-redirect sang RIÊNG | Toast success / redirect ẩn | P1 (nếu có persona OU) |

### 5.3 Rate params trong wave STP-02 (tối thiểu)

| AC id | PASS | Ghi chú |
|-------|------|---------|
| **AC-PAY-STP-02-RATE-MIN** | Sau tạo RIÊNG, có thể mở detail và **Lưu** chỉnh `kpi_threshold` / `bcc_std` theo control đã có CHUNG (reuse STP-03/04 UI) → PATCH **200** → F5 còn | **Không** yêu cầu section geo picker / VP fields sống — đó là STP-05/06 |
| **AC-PAY-STP-02-VP-ABSENT-DEFAULT** | Pack RIÊNG `DPHH` hoặc `TDHK` (không VP): **không** bắt buộc hiện `vp_allowance`/`vp_cost` để PASS wave | Section VP chỉ DoD ở STP-06 |

---

## 6. Mẫu evidence QA (U65)

```markdown
### AC-PAY-STP-02-01 — Tạo gói RIÊNG ĐPHH
- Persona / URL / click path: ceo@xe.vn → /hr/payroll/setup?section=policy-pack → tab RIÊNG → BP ĐPHH → Thêm
- Trước mutate: số dòng list RIÊNG filter ĐPHH = N
- Action: nhập mã/tên/hiệu lực → Lưu
- Network: POST /api/hrm/pay-policy-packs → 201 · body scope=RIENG · businessLineTag=DPHH
- FE sau 2xx: row N+1 · tag ĐPHH · không banner lỗi
- F5: row còn trên tab RIÊNG; tab CHUNG không có mã đó
- Verdict: 🟢 / 🟡 / 🔴
- spec_ref: UC-BP-PAY-STP-02 · BA-PO-HRM-PAY-CNTT-FE-STP-02-RIENG-01
- seed: none
```

---

## 7. Ngoài phạm vi (explicit)

| Hạng mục | Lý do |
|----------|--------|
| **Formula evaluator LIVE** | HOLD — FE pass-through `rateParams`; không eval override |
| **Flip `payroll_e2e_ready=true`** | LOCK QC GWC · setup ≠ kỳ lương E2E |
| **STP-05** (`AC-PAY-STP-05-01` / geo picker / `route_unit_price`) | Vertical riêng sau RIÊNG CRUD; SRS AC-02-02 **park** khỏi DoD wave này |
| **STP-06** (`AC-PAY-STP-06-01` / `vp_allowance` · `vp_cost`) | Vertical riêng; SRS AC-02-03 **park** |
| **Hub 5/6 placeholder** | Danh mục TP · Mẫu bảng · Profile nhập · Nhóm lương · Gợi ý — CARRY `TEAM_WORKING_NOW`; WI riêng (không gộp STP-02) |
| **Reopen POLICY-PACK-01 / CHUNG AC** | GWC sealed · path lock anti-overwrite |
| **UF-HRM-10 · J-HRM-07 full · Phase 1 DONE · payroll module UAT** | `C-SLICE-≠-MODULE` |
| **Seed / API inbox giả** | U65 |
| **Fragment bind / sheet template / input profile** | STP-07+ / 10–12 |

**Park map (SRS → wave sau):**

| SRS id gốc | Wave sở hữu DoD |
|------------|-----------------|
| AC-PAY-STP-02-01 · 02-04 · GLOBAL-01/02 | **STP-02 RIÊNG (này)** |
| AC-PAY-STP-02-02 | **STP-05** (geo) |
| AC-PAY-STP-02-03 | **STP-06** (VP) |
| AC-PAY-STP-06-01 (CHUNG không render VP) | STP-06 + regression CHUNG |

---

## 8. Phụ thuộc trước Dev

| Gate | Owner | Ghi chú |
|------|-------|---------|
| API `POST/PATCH/GET/archive` đã nhận `scope=RIENG` + `businessLineTag` | BE parent **`CNTTBEQC1-MSO8HVERQC1`** RETAIN — SA xác nhận contract F.1 đủ bước SRS STP-02 | Không reopen stamp; chỉ **delta** API_DESIGN nếu thiếu mục đích/bước RIÊNG |
| Tab RIÊNG + BP filter chưa có trên FE CHUNG-only | `dev-fe` sau SA | Cleanup evidence: screen hiện CHUNG-only |
| Persona OU cho GLOBAL-02 | PM/QA | Nếu thiếu account → GLOBAL-02 = 🟡 BLOCKED-EXTERNAL / defer có owner — không FAIL product nếu tập đoàn filter BP vẫn PASS 02-04 |

---

## 9. Câu hỏi sponsor (chỉ khi underdetermined)

**Không có câu hỏi chặn wave.** Catalog mã BP khóa theo TechSpec § bảng tag (`DPHH` / `TDHK` / `LX_ROUTE` / `PROV_OFFICE`).

| # | Câu hỏi (tùy chọn — không block SA) | Mặc định nếu im lặng |
|---|-------------------------------------|----------------------|
| Q1 | Có cần persona C&B OU riêng trong cùng wave QA không? | Wave 1: `ceo@xe.vn` + filter BP; GLOBAL-02 OU = CARRY khi có account |

---

## 10. Handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | AC pack RIÊNG STP-02 khóa: tách CHUNG (sealed `PAYPPQC1-MSPXZL1GQC1`) vs RIÊNG CRUD+filter+parity archive/dup/date + GLOBAL-01/02; đề xuất **`J-HRM-PAY-STP-02`**; park STP-05/06 + hub 5/6 + formula HOLD + `payroll_e2e_ready=false`; không reopen POLICY-PACK-01. |
| **next_owner** | **pm → sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/BA-PO-HRM-PAY-CNTT-FE-STP-02-RIENG-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: SA-PO-HRM-PAY-CNTT-FE-STP-02-RIENG-01
role: sa
lane: governance
parent: BA-PO-HRM-PAY-CNTT-FE-STP-02-RIENG-01
U88: after BA AC pack RIÊNG — Option/F.1 API delta hẹp trước Dev
read_first:
  - docs/program/specs/BA-PO-HRM-PAY-CNTT-FE-STP-02-RIENG-01.md
  - docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md  # UC-BP-PAY-STP-02
  - docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md
  - docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-API-01.md
  - docs/qa/evidence/qc-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md  # must_keep CHUNG GWC
entry_criteria: BA AC pack PASS_TO_PM; POLICY-PACK-01 CHUNG GWC sealed; payroll_e2e_ready=false LOCK
exit_criteria:
  - Option A/B (reuse CHUNG screen + tab RIÊNG vs split component) + khuyến nghị
  - API_DESIGN delta F.1: POST/PATCH/GET list?scope=RIENG&business_line_tag= · archive — Mục đích + Nghiệp vụ + bước SRS UC-BP-PAY-STP-02 Diễn biến
  - Khóa enum/filter businessLineTag khớp BA §4
  - must_keep: PAYPPQC1-MSPXZL1GQC1 · CNTTBEQC1-MSO8HVERQC1 · formula HOLD · cấm flip payroll_e2e_ready · cấm STP-05/06 DoD trong cùng WI Dev
forbidden: apps/** · reopen CHUNG POLICY-PACK-01 · hub 5/6 implementation scope creep
evidence_path: docs/program/specs/SA-PO-HRM-PAY-CNTT-FE-STP-02-RIENG-01.md
ack_status target: PASS_TO_PM (pm → dev-fe + optional dev-be delta)
```
