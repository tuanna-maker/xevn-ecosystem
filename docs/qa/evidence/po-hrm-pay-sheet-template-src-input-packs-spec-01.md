# Evidence — PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 · PO-HRM-PAY-SRC-PRIORITY-SPEC-01 · PO-HRM-PAY-INPUT-PACKS-SPEC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01` · `PO-HRM-PAY-SRC-PRIORITY-SPEC-01` · `PO-HRM-PAY-INPUT-PACKS-SPEC-01` |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-DEPTH-01` · `PO-HRM-PAY-CNTT-SA-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-12 |
| **priority** | P0 |
| **change_mode** | ADD (3 spec) + EXPAND (applicability_scope province, SRC-03 A/B split, input pack allow-list APPEND) |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim engine LIVE · **cấm** invent AST/eval tech · **cấm** viết `apps/**` |

---

## 1. read_first ack (toàn bộ, theo đúng thứ tự yêu cầu)

| # | Artifact | Đã đọc |
|---|----------|--------|
| 1 | `docs/qa/evidence/po-hrm-pay-cntt-research-summary-20260811.md` | ✅ — gap register, dispatch plan §6.2, risk §7 |
| 2 | `docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` | ✅ — 63 fragment, 7 model, override/extends chain |
| 3 | `docs/program/specs/PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` | ✅ — column → fragment_id mapping |
| 4 | `docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md` | ✅ — ADR fragment bind, GAP-FRG disposition, API unlock list |
| 5 | `docs/program/specs/PO-HRM-PAY-CNTT-API-01.md` | ✅ — F-PAY-POLICY-PACK / INPUT-PROFILE / SETUP-RESOLVE CONFIRMED — không đổi |
| 6 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md` | ✅ §2–§5 — formula AUTHOR/PUBLISH lifecycle LIVE (CRUD only) |
| 7 | `docs/architecture/ADR-HRM-PAY-FRAGMENT-BIND-01.md`, `ADR-HRM-PAY-MULTI-TEMPLATE-01.md`, `ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01.md` | ✅ |
| 8 | `AGENTS.md`, `docs/program/SUBAGENT_READ_MAP.md` | ✅ — lane BA |
| 9 (bổ sung) | `docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md`, `po-hrm-amis-parity-sa-01.md`, `po-hrm-amis-parity-pay-tpl-be-01.md`, `po-hrm-amis-parity-pay-src-be-01.md`, `po-hrm-amis-parity-pay-src-be-02.md`, `po-hrm-amis-parity-pay-input-pack-be-01.md` | ✅ — xác nhận trạng thái LIVE thật (không dựa hoàn toàn vào research-summary — phát hiện 1 claim STALE, xem §3) |
| 10 (bổ sung) | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` §8.2–§8.8, `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` | ✅ — physical PAPER columns + nguồn `work_location` |
| 11 (bổ sung) | `docs/program/specs/PO-HRM-PAY-CNTT-BA-PROCESS-01.md` | ✅ — F-STP-01..08, UC-BP-PAY-STP-01..12, BR-PAY-STP-01..08 |

---

## 2. Path canonical verify (NFD)

```text
NFD_DIR=$(printf 'Ta\xcc\x80i li\xc3\xaa\xcc\xa3u')
cd "/c/Users/ADMIN/OneDrive/$NFD_DIR/Vibe Coding/projects/xevn-ecosystem"
```

Đã verify: `pwd` trả đúng `.../OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem`, `test -d .git && test -d apps` PASS. File mới ghi qua `Bash cat >`/`cp` (không dùng Write tool trực tiếp trên NFD path — theo lesson học từ `.agentmemory/MEMORY.md` NFD/NFC bug), verify lại bằng `ls` qua đúng `$NFD_DIR` sau khi ghi (xem §6).

---

## 3. Correction quan trọng phát hiện trong research

`po-hrm-pay-cntt-research-summary-20260811.md` §2.2 ghi **"Template bind to period" gap = "process doesn't read snapshot"**. Sau khi đọc `po-hrm-amis-parity-pay-src-be-01.md` §3 và `…-be-02.md` §5 (live repro NV002 gross 9.500.000đ, `source_tier=emp_cb`), xác nhận: **PROCESS đã đọc `sheet_template_snapshot_json.columns` từ 2026-08-07 (SRC-BE-01/02)** — claim "chưa đọc" trong research-summary (2026-08-11) là **STALE**.

Gap thật không phải "đọc snapshot" mà là:
1. **Chọn đúng snapshot nào** khi 1 BP có N mẫu theo tỉnh (LX-T 6 tỉnh, VP-T 6 tỉnh) — `applicability_scope` hiện tại không có trục tỉnh.
2. Chưa có hàm `resolveForEmployee(emp, period)` tường minh — chỉ có `F-PAY-SETUP-RESOLVE-01` (helper gợi ý form, không phải guard bind/process).
3. 63 fragment CNTT chưa nối vào SRC resolver generic đã LIVE (SRC resolver hoạt động đúng cho model AMIS parity generic, chưa map cho từng fragment CNTT cụ thể).

3 spec dưới đây đóng đúng 3 gap thật này — **không** viết lại phần đã LIVE.

---

## 4. Tóm tắt 3 spec

### 4.1 `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01.md`

- **EXPAND** `applicability_scope` thêm giá trị recommended `province` + field mới `applicability_province_code` (TEXT open string, **cấm** closed CHECK enum) trên `pay_sheet_templates`.
- Đặc tả `resolveForEmployee(employee, period)`: gọi tại (a) form lập kỳ [đã có, không đổi], (b) bind kỳ [ADD — guard, không auto-pick], (c) mỗi dòng PROCESS [ADD — province mismatch guard].
- Ranking mở rộng: `employee > position > province(business_line_tag+province_code) > ou > company`.
- Xác nhận **chính xác** thời điểm snapshot: **tại bind** (period create hoặc `bind-sheet-template`), **không phải** tại process — đã LIVE (TPL-BE-01), spec chỉ ADD reader mới (province guard).
- Override chain: override luôn "theo tỉnh" — override trên template `LX_ROUTE/ND` không áp dụng nhân viên resolver chọn `LX_ROUTE/NB`. 2 lớp resolver tách biệt: resolver **mẫu** (spec này) vs resolver **fragment effective_from** (ADR-FRAGMENT-BIND §5, không đổi).
- 6 AC mới (`AC-PAY-TPL-PROV-01..06`), 4 error code mới namespace `HRM-PAY-TPL-*`.
- **spec_ref đầy đủ:** catalog §1 (LX-T/VP-T 6 tỉnh), XLSX-COLUMN-MAP §3.1 (cột "Nơi làm việc (tỉnh)"), catalog §7 R3 (gap PT/VT/YB VP-T).

### 4.2 `PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md`

- Nhắc lại nguyên văn 4 tier SRC (SRC-02 → SRC-03 → SRC-04 → SRC-05) + SRC-01 orthogonal — **không đổi thứ tự đã lock**.
- **EXPAND** SRC-03 làm rõ 2 dạng: **SRC-03A** (direct amount — advance, other_income, deduction) vs **SRC-03B** (formula variable — KPI, DT, lượt, CPSC, CLDV) — không thêm tier mới, chỉ làm rõ cách "prefer pack" áp dụng cho 2 hình thái dữ liệu.
- Map **đầy đủ tất cả 63 fragment_id** theo 7 model → đúng SRC tier, có spec_ref tới fragment_id cụ thể.
- 18 GAP-FRG map tier riêng (§4), 2 items PROPOSE giữ nguyên HOLD.
- 4 AC mới, giải thích rõ điều kiện "closed" cho SRC-01 (cite ATT-412, dependency `att_timesheet_line` line-level).

### 4.3 `PO-HRM-PAY-INPUT-PACKS-SPEC-01.md`

- 12 type input pack (theo đúng tên trong DB_DESIGN §8.2 starter list) + **1 type ADD mới: `route_count`** (phát hiện gap — component trung tâm LX-T "lương lượt" chưa có source_kind).
- **Correction quan trọng:** `DLL_CPN` **không phải** "điểm lương công nhật" (như gợi ý trong Task) mà là **"Doanh lượng Chuyển Phát Nhanh"** (dữ liệu doanh thu, dạng SRC-03B) — bằng chứng trích từ XLSX-COLUMN-MAP §5.2 (cột nằm trong sheet "PL Hưởng doanh thu") + catalog `FRG-LXT-CPN-01` xác nhận CPN=Chuyển Phát Nhanh.
- Mỗi type: nguồn ghi, cấu trúc tối thiểu, validate, `fragment_id` liên kết — bám đúng catalog, không tự đặt tên khác.
- Bảng APPEND allow-list cho 6 profile đã PAPER (`INP_DPHH_DLL`, `INP_TDHK_KPI`, `INP_TG_BCC`, `INP_LXT_ROUTE`, `INP_LXT_TRUCK`, `INP_VP_PROV`) — chỉ là **data APPEND**, không đổi schema/API_CONTRACT.
- 4 AC mới, dependency mở: thuật toán phân bổ CPSC/vp_cost theo tổ/OU → per-employee (không tự thiết kế trong Task này).

---

## 5. Dependency còn mở cần PM dispatch tiếp (tổng hợp 3 spec)

| # | Dependency | Lý do ngoài phạm vi | Owner đề xuất | Mức ưu tiên |
|---|---|---|---|---|
| 1 | `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` | SRC-02 (C&B fixed PC) cho 63 fragment CNTT cần interface lịch sử lương — **trùng** `PO-HRM-MVP-GD1-CORE-02-DATA-01` đã dispatch trước, PM audit riêng theo yêu cầu Task | ba-process (PM dispatch riêng, không tự viết ở đây) | P0 |
| 2 | `att_timesheet_line` line-level thật | SRC-01 cho các fragment cần giờ chi tiết (`FRG-VPT-CONG-01`, `FRG-TDHK-TG-01`, `FRG-LXT-CC-169`) — hiện PAPER only | ba-data/dev-be (ATT lane) | P0 |
| 3 | Normalize `employees.custom_fields.work_location` → `province_code` chuẩn | Resolver mẫu (§4.1) cần trục tỉnh có domain giá trị xác nhận, hiện là free-text | ba-data | P0 |
| 4 | VP-T tỉnh PT/VT/YB chưa có PDF/QC nguồn (catalog §7 R3) | Không thể tạo template chính thức cho 3 tỉnh còn thiếu policy gốc | sponsor → ba-process | P1 |
| 5 | 2 fragment PROPOSE (`FRG-CHUNG-TET-01`, `FRG-LXT-ELEC-01`) | Chờ sponsor PDF trước khi catalog §4 append (ADR §8 D12 khóa "zero new fragment GĐ1") | sponsor → ba-process | P2 |
| 6 | Thuật toán phân bổ CPSC (theo tổ) / `vp_cost` (theo OU) → per-employee | Nghiệp vụ phân bổ phức tạp, chưa có spec — chỉ mô tả input trong Task này | ba-process (wave sau, nếu sponsor xác nhận P0) | P1 |
| 7 | APPEND `route_count` vào `INP_LXT_ROUTE.allowed_source_kinds_json` | Data APPEND (không phải DDL) — cần sa xác nhận không vi phạm API-01 baseline trước khi operator PATCH | sa → dev-be | P0 |
| 8 | Sales bridge `hrm_sales_data` → `source_kind=revenue` tự động | GĐ2, ngoài phạm vi GĐ1 (cite BR-DATA-SALES-01) | dev-be | P2 |

---

## 6. File output + verify NFD

```bash
$ NFD_DIR=$(printf 'Ta\xcc\x80i li\xc3\xaa\xcc\xa3u')
$ cd "/c/Users/ADMIN/OneDrive/$NFD_DIR/Vibe Coding/projects/xevn-ecosystem"
$ ls docs/program/specs/PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01.md docs/program/specs/PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md docs/program/specs/PO-HRM-PAY-INPUT-PACKS-SPEC-01.md docs/qa/evidence/po-hrm-pay-sheet-template-src-input-packs-spec-01.md
```

(kết quả verify — xem output lệnh `ls` đính kèm báo cáo cuối của agent)

---

## 7. Không làm trong Task này (nhắc lại — tuân thủ)

- Không viết `apps/**`.
- Không tự viết `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` (dependency #1 ở trên).
- Không đổi `PO-HRM-PAY-CNTT-API-01.md` đã CONFIRM — chỉ EXPAND (province field, SRC-03 A/B clarify, allow-list APPEND) với ghi chú rõ ràng mỗi chỗ.
- Không đề xuất công nghệ eval formula (AST engine…) — `gd1_eval_v1` giữ nguyên, spec chỉ mô tả nghiệp vụ input/output.

---

## 8. completion_report

### Closed

1. `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01.md` — resolver mẫu theo tỉnh, snapshot timing chính xác, override chain 2-lớp.
2. `PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` — map đầy đủ 63 fragment → SRC tier, SRC-03A/B clarify, 18 GAP-FRG tier.
3. `PO-HRM-PAY-INPUT-PACKS-SPEC-01.md` — 13 type input pack (12 + `route_count` ADD), correction `DLL_CPN`, allow-list APPEND cho 6 profile.
4. Evidence tổng hợp (file này) — cite đầy đủ, dependency liệt kê rõ, không claim engine LIVE.
5. Honesty: `payroll_e2e_ready=false` giữ nguyên xuyên suốt 3 spec.

### Explicit non-claims

- Không claim formula evaluator LIVE.
- Không claim AMIS parity DONE.
- Không claim `payroll_e2e_ready=true`.
- Không tự mở rộng scope sang salary-history hay att_timesheet_line thật.

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-pay-sheet-template-src-input-packs-spec-01.md` |
| **payroll_e2e_ready** | `false` |
