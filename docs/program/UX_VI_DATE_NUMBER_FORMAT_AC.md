# UX project-wide — Date & number format (vi-VN) — AC delta

| Field | Value |
|-------|-------|
| **work_item_id** | `BA-UX-VI-FORMAT-AC-01` |
| **from_role** | ba-process |
| **to_role** | pm → dev-fe / qa |
| **lane** | governance |
| **sponsor_lock** | 2026-07-20 — date `dd/MM/yyyy`; money/qty thousand-group while typing; numeric on submit |
| **ack_status** | **PASS_TO_PM** |
| **generated** | 2026-07-20 |
| **scope** | XBOS Command Center + HRM embed (web) + HRM mobile ESS (parity) |
| **non_goals** | Không rewrite full SRS/TechSpec; không Phase1 DONE; không seed |

**Pointers:** [USER_FLOW §2b](../qa/USER_FLOW_OPERABILITY_MATRIX.md) · rule `.cursor/rules/uiux-quality-accessibility.mdc` · evidence [`docs/qa/evidence/ba-ux-vi-format-ac-01-20260720.md`](../qa/evidence/ba-ux-vi-format-ac-01-20260720.md)

---

## 1. Process objective

Chuẩn hóa **hiển thị và nhập** ngày / số tiền–số lượng trên toàn sản phẩm XeVN theo locale **vi-VN**, để user Việt Nam đọc và gõ đúng thói quen, đồng thời API/DB vẫn nhận **giá trị số thuần** (không chuỗi có dấu phân cách).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| End user (CEO / HR / NV) | Nhập / đọc ngày và số trên form, list, detail, dialog |
| Dev-FE / Dev-Mobile | Shared formatter + input mask; wire MUST fields; leave EXEMPT alone |
| QA | Checklist §5 — browser typing + Network payload numeric + F5 display |
| BA-Process | AC/BR SoT (doc này) — không implement |

---

## 2. As-is vs to-be

| Aspect | As-is (tóm tắt) | To-be (sponsor lock) |
|--------|-----------------|----------------------|
| Date display | Nhiều chỗ đã `dd/MM/yyyy` / `formatDisplayDate`; còn ISO-Z / locale lệch | **Mọi** date user-facing = `dd/MM/yyyy`; datetime = `dd/MM/yyyy HH:mm` |
| Date entry | DatePicker / native / free-text lẫn lộn | Input/picker hiển thị & xác nhận theo `dd/MM/yyyy` (và `HH:mm` khi có giờ) |
| Money / qty entry | Nhiều `type="number"` raw (vd. lương `20000000`) — khó đọc khi gõ | **Auto thousand grouping vi-VN khi đang gõ**; blur/submit = số thuần |
| Money / qty display | Một phần đã `Intl.NumberFormat('vi-VN')` | List/detail/KPI card MUST fields đồng nhất grouping |
| API body | Đã numeric ở hầu hết path | **Giữ nguyên** — payload **không** gửi `"20.000.000"` string |

---

## 3. Business rules

### BR-UX-DATE-01 — Date display

| Condition | Action | Outcome |
|-----------|--------|---------|
| Field là **calendar date** (sinh nhật, hiệu lực HĐ, deadline TD, ngày chấm công, …) | Format `dd/MM/yyyy` | User không thấy `yyyy-MM-dd` / ISO-Z |
| Field là **datetime** (created_at inbox, interview slot, audit stamp user-facing) | Format `dd/MM/yyyy HH:mm` | Có giờ khi nghiệp vụ cần |
| Value null / invalid | Hiển thị `—` (hoặc empty theo pattern màn) | **Không** crash RangeError; **không** `01/01/1970` từ epoch 0 |
| `period_label` kiểu `MM/yyyy` / `yyyy-MM` (kỳ lương) | Giữ semantic kỳ — không ép thành ngày 01 | Đúng nghĩa «tháng/năm» |

### BR-UX-DATE-02 — Date entry

| Condition | Action | Outcome |
|-----------|--------|---------|
| User chọn/nhập ngày trên form | CẤM dùng `<Input type="date" />` native. **BẮT BUỘC** dùng `<ViDatePickerField />` từ thư viện UI của XeVN | Sau Lưu + F5 vẫn `dd/MM/yyyy`, UI đồng nhất với màn hình Tuyển dụng |
| API lưu ISO date | FE map ISO ↔ display; Network có thể gửi `YYYY-MM-DD` / ISO | Spec API không đổi; chỉ UX layer |

### BR-UX-NUM-01 — Thousand grouping (MUST)

| Condition | Action | Outcome |
|-----------|--------|---------|
| Field thuộc **MUST group** (§4) | Khi gõ: hiển thị grouping `vi-VN` (vd. `20.000.000`); dấu thập phân `,` nếu có phần lẻ | User đọc được ngay khi typing |
| Submit / blur → state / API | Parse về `number` (hoặc string số thuần không separator) | Network body **numeric**; không `"20.000.000"` |
| Display read-only (list/detail) | `Intl.NumberFormat('vi-VN')` (currency VND optional theo màn) | Đồng nhất với input |

### BR-UX-NUM-02 — EXEMPT (cấm grouping)

| Condition | Action | Outcome |
|-----------|--------|---------|
| Field thuộc **EXEMPT** (§4) | **Không** apply thousand mask / grouping khi gõ | Tránh `1.000` cho page size / năm / OTP |
| Score / % 0–100 | Nhập số thuần; có thể 1–2 chữ số thập phân theo spec | Không nhầm % với tiền |

### BR-UX-NUM-03 — Fail-closed parse

| Condition | Action | Outcome |
|-----------|--------|---------|
| User xóa hết / nhập không parse được | Empty → null/undefined theo DTO; invalid → validation message | Không submit NaN im lặng |
| Paste `"20,000,000"` (en) hoặc `"20.000.000"` (vi) | Parser chấp nhận cả hai → cùng số | UX thân thiện; API vẫn số |

---

## 4. Field classification (MUST vs EXEMPT)

### 4.1 MUST group — money / quantity / scale amounts

Áp dụng khi field là **giá trị tiền** hoặc **số lượng nghiệp vụ lớn** (user kỳ vọng đọc có dấu chấm nghìn).

| Domain | Field examples (không exhaustive — FE inventory bổ sung) | Notes |
|--------|----------------------------------------------------------|-------|
| **XBOS org / shareholder** | `charterCapital` (vốn điều lệ), `contributedValue` / `contributed_value` (vốn góp) | UF-XBOS-03..05 |
| **HRM employee / contract** | Lương cơ bản / thỏa thuận, phụ cấp tiền, thưởng / phạt tiền | UF-HRM-02/03 · EmployeeForm salary |
| **HRM insurance** | Mức đóng / tiền BH / base_salary participant | UF-HRM-04 |
| **HRM payroll** | Template amount, bonus amount, tax bracket money fields, payslip line amounts | UF-HRM-06 |
| **HRM recruitment** | Ngân sách vị trí / salary range min–max (VND), chi phí campaign nếu là tiền | UF-HRM-12 |
| **HRM headcount budget** | `headcount` **khi** là ngân sách định biên lớn (hàng trăm+) **và** product đã chọn money-style qty — **mặc định:** headcount **integer qty MUST group** từ ≥ 1000; dưới 1000 vẫn MAY group cho đồng nhất UX | HeadcountProposal |
| **KPI reward/penalty** | Số tiền thưởng / phạt (VND) | CC KPI |
| **Expense / tariff money** | Mức phí, hạn mức chi phí (VND) | Settings expense / tariff |
| **Mobile ESS** | Payslip amounts, leave **không** áp tiền trừ khi field là tiền | Parity web |

**Quy tắc nhận diện nhanh (Dev):** semantic = VND / money / capital / allowance / penalty_amount / contributed / charter / budget_amount → **MUST**.

### 4.2 EXEMPT — không thousand-group khi typing

| Class | Examples | Rationale |
|-------|----------|-----------|
| **Pagination** | `page`, `page_size`, page size selector | Luôn ≤ 100–200; grouping gây nhầm |
| **Year / month index** | Năm tài chính, năm sinh (nếu tách năm), tháng 1–12 | Không phải tiền |
| **Score / rating** | 0–5, 0–10, 0–100 KPI score, candidate rating | Scale nhỏ |
| **Percent** | `ratio_percent` cổ đông 0–100, thuế %, progress % | Đã có BR độc lập; **không** group |
| **Chart axis / domain** | Recharts `domain={[0,100]}`, tick values | Không phải form input user |
| **OTP / PIN / code** | OTP 6 số, mã xác minh | Grouping phá UX bảo mật |
| **IDs / codes numeric-looking** | Mã nội bộ, số CMND nếu mask riêng | Format khác (không thousand) |
| **Duration small ints** | Số ngày nghỉ ≤ 365 (thường), số giờ OT trong ngày | MAY plain; **không** bắt buộc group |
| **Coordinates / zoom** | Map lat/lng, UI zoom % | Không phải tiền |

**Conflict resolve:** Nếu field vừa là % vừa có nhãn «tiền» → ưu tiên semantic tiền = MUST; nếu chỉ `%` / `ratio` = EXEMPT.

---

## 5. Acceptance criteria (measurable)

### AC-UX-DATE-01 — Display

- **PASS:** Trên sample UF (XBOS legal entity dates, HRM contract effective/expiry, recruitment deadline, attendance filter date): mọi date user-facing khớp regex `\d{2}/\d{2}/\d{4}`; datetime có thêm ` HH:mm` khi màn có giờ.
- **FAIL:** Còn ISO `2026-07-20T…Z` hoặc `yyyy-MM-dd` trên UI user-facing (trừ raw DevTools).

### AC-UX-DATE-02 — Entry + F5

- **PASS:** User chọn ngày trên form → Lưu 2xx → F5 → vẫn `dd/MM/yyyy`.
- **FAIL:** Sau F5 hiện ISO hoặc Invalid Date.

### AC-UX-NUM-01 — Typing MUST

- **PASS:** Trên ≥1 money field MUST (vd. lương NV hoặc vốn điều lệ): gõ `20000000` → UI hiện `20.000.000` (hoặc tương đương vi-VN) **trước** submit.
- **FAIL:** Vẫn chỉ raw `type=number` không group trên MUST field đã wire trong wave.

### AC-UX-NUM-02 — Submit numeric

- **PASS:** DevTools Network POST/PUT body field = number (vd. `20000000`) hoặc string digits-only không separator; **không** `"20.000.000"`.
- **FAIL:** API 400 do string có dấu; hoặc BE nhận sai giá trị.

### AC-UX-NUM-03 — EXEMPT untouched

- **PASS:** `page_size`, score 0–100, `ratio_percent`, OTP (nếu có): **không** hiện `1.000` khi nhập `1000` page size / không group OTP.
- **FAIL:** EXEMPT bị apply mask.

### AC-UX-NUM-04 — Read-only parity

- **PASS:** List/detail cùng field MUST đã format vi-VN (đã có nhiều chỗ) — không regress về raw scientific / full digits không group trên money columns in-scope wave.
- **FAIL:** Input group nhưng cột list vẫn raw lệch hoàn toàn không format.

---

## 6. Use-case catalog (delta — không thay UC gốc)

| UC-ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-UX-DATE-01** | Xem ngày trên list/detail | Mở màn → date `dd/MM/yyyy` | Datetime → +`HH:mm` | Invalid → `—` |
| **UC-UX-DATE-02** | Nhập ngày trên form | Chọn date → Lưu → F5 còn đúng | Sửa ngày đã lưu | Bỏ trống nếu optional; required → validate |
| **UC-UX-NUM-01** | Nhập tiền/qty MUST | Gõ → group → Lưu → API number → F5 group | Paste en/vi separators | Invalid → message; không NaN |
| **UC-UX-NUM-02** | Nhập EXEMPT | Gõ số thuần không group | — | Out-of-range theo DTO cũ |

**UF mapping (smoke tối thiểu sau FE waves):** UF-XBOS-03/05 (charter/contributed) · UF-HRM-03 (salary) · UF-HRM-04 (insurance money) · UF-HRM-06 (payroll amounts) · UF-HRM-12 (salary range nếu có).

---

## 7. Handoff package

### SA / Dev-FE

| Expectation | Done when |
|-------------|-----------|
| Shared util: parse/format vi-VN number + date display helper | Một nguồn SoT FE (work `D-UX-VI-FORMAT-SHARED-01`) |
| Wire MUST fields theo inventory | Không đổi contract API |
| EXEMPT list trong CODE-MEMORY / util comment | QA không fail false-positive |

### Dev-Mobile

| Expectation | Done when |
|-------------|-----------|
| Parity ESS money + date display | Cùng BR; touch target không vỡ |

### QA (sau FE waves)

Dùng checklist copy-ready trong evidence `ba-ux-vi-format-ac-01-20260720.md` § QA checklist.  
**U65:** browser-only; cấm seed.

### Out of scope this BA pack

- Rewrite SRS modules
- BE schema change
- Phase1 / PROD claim

---

## 8. Open risks / assumptions

| # | Item | Owner |
|---|------|-------|
| A1 | Inventory FE `type=number` đầy đủ = work `D-UX-VI-FORMAT-INVENTORY-01` — AC này định **class**, không liệt kê mọi file | explore / FE |
| A2 | Headcount &lt; 1000: grouping optional; ≥ 1000 MUST — nếu sponsor muốn always-group mọi headcount → CR 1 dòng | PM |
| A3 | Decimal tiền VND thường 0 lẻ; nếu field có số lẻ → `,` thập phân vi-VN | FE |
| A4 | Chart libraries: chỉ EXEMPT axis — không đổi data pipeline | FE |

---

## 9. Traceability

| Artifact | Role |
|----------|------|
| Doc này | SoT AC/BR UX format |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §2b | Pointer QA |
| `.cursor/rules/uiux-quality-accessibility.mdc` | Always-on engineering reminder |
| Existing `formatDisplayDate` | Align date display — extend pattern, không đẻ song song lệch |
| Prior BR `ratio_percent` độc lập (`p1-cc-shr-ratio-ux-ba-delta`) | **Giữ** — % = EXEMPT; `contributed_value` = MUST money |
