# BA-Process — Xác nhận luồng khởi tạo C&B lần đầu khi tạo hợp đồng (đối chiếu PM audit)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CTR-CB-INIT-FLOW-SPEC-01` |
| **parent** | `PM-AUDIT-CTR-CB-SALARY-NOT-FILLABLE-01` |
| **lane** | governance · ba-process |
| **change_mode** | **VERIFY-ONLY** — không tạo quyết định mới trùng lặp; đối chiếu độc lập + bổ sung bằng chứng cho quyết định **đã LOCKED** ở chain khác cùng ngày |
| **status** | **PASS_TO_PM — CONFIRMATORY, không phải quyết định gốc** |
| **Date** | 2026-08-12 |
| **honesty** | `contracts_printable_ready=false` · C-SLICE ≠ module · **cấm** claim CTR printable/UAT DONE |
| **must_keep** | CORE-02 `employee_compensation_packages\|lines\|history` ONE SoT (`CORE02QC1-MSL80DU6`) · `HRM-CORE-CB-403`/`HRM-CORE-CB-AUTHZ-403` · AC-CTR-FIELD-04 (không «+ Thêm» phụ cấp GĐ1) |
| **cấm** | `apps/**` · seed · tự quyết câu hỏi thiếu bằng chứng (ghi OPEN QUESTION) · đề xuất field lương SoT thứ 2 trên `employee_contracts` |
| **evidence_in** | `docs/qa/evidence/pm-audit-contract-cb-salary-not-fillable-01.md` · Excel `docs/từ khách hàng/2026.08.07. Hợp đồng mẫu X.E.xlsx` (quét lại toàn bộ 3902 dòng, không chỉ 500) · `ContractCbReadOnlyCard.tsx` (bản hiện tại, đã sửa) · `contract-legal-print.service.ts` · `employee-compensation.service.ts` (`apps/api/hrm-api/src/contracts-insurance/`) |

---

## 0. PHÁT HIỆN QUAN TRỌNG NHẤT — đọc trước khi dùng file này

**Tại thời điểm ba-process nhận việc, 3 câu hỏi trong `pm-audit-contract-cb-salary-not-fillable-01.md` §4 ĐÃ được một chain BA→SA→Dev-BE→Dev-FE→QA khác trả lời và LOCK cùng ngày 2026-08-12, đi xa hơn phạm vi audit gốc:**

| Work item | Trạng thái quan sát được | File |
|-----------|---------------------------|------|
| `BA-CTR-INSURANCE-SALARY-SOURCE-01` | PASS_TO_PM — SoT + phương án bootstrap + ma trận 8 mẫu | `docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md` |
| `SA-CTR-INSURANCE-SALARY-SOURCE-01` | **LOCKED Option A** — API design đầy đủ, error map, `effective_from` priority | `docs/program/specs/SA-CTR-INSURANCE-SALARY-SOURCE-01.md` |
| `D-BE-CTR-CB-BOOT-01` | READY_FOR_QA — jest 28/28 PASS | `docs/qa/evidence/d-be-ctr-cb-boot-01.md` |
| `D-FE-CTR-CB-BOOT-01` | READY_FOR_QA — `ContractCbReadOnlyCard.tsx` đã có 3 trạng thái `ro\|bootstrap\|masked` trong code hiện tại (`@CODE-MEMORY-CHANGE 2026-08-12 D-FE-CTR-CB-BOOT-01`) | `docs/qa/evidence/d-fe-ctr-cb-boot-01.md` |
| `QA-D-BE-CTR-CB-BOOT-01` | **PASS_TO_PM** — L1 API live: POST bootstrap 201, `base≠si_base` xác nhận độc lập, VAL-400, OVERLAP-409, AuthZ-403 | `docs/qa/evidence/qa-d-be-ctr-cb-boot-01.md` (stamp `CTRCBOOTQA-MSPXI6MA`) |
| `QA-CTR-CB-BOOT-01` (browser) | Dispatch thấy trên bus (`docs/program/AGENT_MESSAGE_BUS.md`, dispatched rồi resumed 19:43) — chưa thấy verdict cuối tại thời điểm ba-process đọc | `docs/program/AGENT_MESSAGE_BUS.md` |

**Kết luận cho PM:** file này không nên bị coi là quyết định nghiệp vụ mới. Nó đóng vai xác nhận độc lập (second opinion) đúng như PM yêu cầu ở §4 audit gốc, và tình cờ khớp gần như tuyệt đối với quyết định đã LOCKED ở chain `BA/SA-CTR-INSURANCE-SALARY-SOURCE-01`. Khuyến nghị PM kiểm tra trạng thái mới nhất của `QA-CTR-CB-BOOT-01` trên bus trước khi dispatch bất kỳ dev nào thêm cho work item này — tránh double-writer / dispatch trùng.

---

## 1. Câu hỏi 1 — Luồng khởi tạo C&B lần đầu: bắt buộc tạo gói trước hay bootstrap trong dialog?

### Bằng chứng độc lập (đọc code hiện tại, không đọc BA/SA trước)

`apps/web/hrm/src/components/contracts/ContractCbReadOnlyCard.tsx` (đọc trực tiếp, bản đang có trên disk) đã triển khai đúng phương án B đề xuất trong PM audit — "cho nhập lương ngay trong dialog và hệ thống tự tạo gói đầu tiên":

- 3 trạng thái: `ro` (đã có gói, read-only + CTA «Mở C&B»), `bootstrap` (snapshot rỗng + đủ quyền → 2 ô nhập Lương cơ bản + Lương đóng BH, không auto-copy), `masked` (thiếu quyền → banner, không lộ số).
- Comment `@CODE-MEMORY-CHANGE 2026-08-12 D-FE-CTR-CB-BOOT-01` xác nhận đây là thay đổi cùng ngày, khớp `sponsor §10b`.
- `must_keep` giữ nguyên AC-CTR-FIELD-04 (không «+ Thêm» phụ cấp) — không phá ràng buộc GĐ1.

Đối chiếu `docs/qa/evidence/qa-d-be-ctr-cb-boot-01.md`: BE đã verify sống — `POST /api/hrm/contracts-insurance/compensation-packages` (không phải endpoint mới, reuse endpoint tạo gói C&B đã có) nhận 2 line `base` + `si_base`, trả 201, sau đó `GET contract-create-context` trả `insurance_salary_vnd` đúng từ `si_base` (≠ base khi test với 2 số khác nhau: 15.500.000 vs 12.300.000) — không ghi lương vào bảng `employee_contracts`.

### Trả lời

**Phương án đã chọn (và đã có code + QA L1 PASS): bootstrap trong dialog hợp đồng, ghi thẳng vào SoT `employee_compensation_packages/lines` qua endpoint tạo gói C&B đã có sẵn — không tạo bảng/endpoint mới, không dual-SoT.**

Căn cứ chọn (khớp độc lập với lý do BA đã nêu):
1. Khớp thói quen dữ liệu khách thật — sheet `Mã NV` có cột "Mức BHXH" nằm cùng hàng với hồ sơ nhân sự, ngụ ý khách nhập cùng lúc, không phải qua màn hình riêng.
2. Không phá SoT — bootstrap reuse đúng API tạo gói C&B (`createCompensationPackage`), không thêm cột lương trên `employee_contracts`.
3. Giảm ma sát thao tác — HR không phải rời dialog hợp đồng để sang hồ sơ nhân viên tạo gói trước rồi quay lại.

**Rủi ro đã được BA/SA xử lý (không phải gap mới):** UV pre-hire (`employee_id` null) → không bootstrap (đúng, vì packages cần `employee_id` thật); "Chỉ lưu sổ đăng ký" (registry-only) → không bắt buộc bootstrap (`AC-CTR-TPL-DYN-03`); khi đã có gói active → luôn read-only + CTA «Mở C&B», không cho sửa lương ngay trên dialog hợp đồng (tránh 2 nơi sửa cùng SoT).

---

## 2. Câu hỏi 2 — "Mức BHXH" có luôn = "Mức lương" không?

### Quét lại TOÀN BỘ sheet `Mã NV` (3902 dòng, không dừng ở 500 như PM audit)

Dùng `openpyxl` (`data_only=True`) quét toàn bộ hàng 1–3902, cột Y (25) = "Mức BHXH" và cột AK (37) = "Mức lương" — xác nhận header đúng vị trí bằng cách đọc trực tiếp `ws.cell(row=1, column=25).value == "Mức BHXH"` và `ws.cell(row=1, column=37).value == "Mức lương"`.

**Kết quả — kết luận mạnh hơn PM audit gốc, không chỉ "trống ở 500 dòng đầu":**

| Đo | Giá trị |
|----|---------|
| Tổng số dòng có dữ liệu ở bất kỳ cột nào trong sheet `Mã NV` (hàng 4–3902) | **0** — toàn bộ 3899 dòng dữ liệu đều rỗng ở mọi cột (kể cả tên, mã NV) |
| Dòng có employee code thật trong toàn bộ sheet (hàng 1–3902) | **Chỉ 1 dòng** — hàng 3, mã `XE00018`, tên "Lê Văn Vũ" |
| Cột Y ("Mức BHXH") tại hàng 3 (dòng NV thật duy nhất) | `None` (rỗng) |
| Cột AK ("Mức lương") tại hàng 3 (dòng NV thật duy nhất) | `None` (rỗng) |
| Số dòng có cả 2 cột cùng có số để so sánh bằng/khác | **0** trên toàn bộ file |

`max_row=3902` chỉ là định dạng/khung kéo dài xuống của Excel (formatting artifact), không phải 3900 nhân viên có dữ liệu — thực tế file chỉ có đúng 1 dòng nhân viên có dữ liệu (không đầy đủ), và dòng đó cũng không có số ở cả 2 cột cần so sánh.

**Kiểm tra chéo qua 6 sheet mẫu hợp đồng in** (không có trong yêu cầu gốc, tự bổ sung để tìm bằng chứng gián tiếp): quét toàn bộ text 200 dòng đầu mỗi sheet mẫu tìm "BHXH", "bảo hiểm", "lương" — phát hiện: điều khoản in ("Điều 3 — Nghĩa vụ và quyền lợi") chỉ có 1 field lương tường minh: "Mức lương chính hoặc tiền công" (ô trống chờ điền, đơn vị "đồng/tháng"). Đoạn "Bảo hiểm Xã hội, Bảo hiểm Y tế, Bảo hiểm thất nghiệp" chỉ là văn bản pháp lý cố định ("Được thực hiện theo quy định của Luật BHXH...") — không phải một field số riêng trên bản in hợp đồng. Điều này gợi ý «Mức BHXH» trong sheet `Mã NV` là field quản trị nội bộ HR/BHXH (dùng cho khai báo cơ quan bảo hiểm), tách khỏi văn bản hợp đồng in — nhưng đây là suy luận gián tiếp, không phải bằng chứng số học khẳng định 2 field độc lập hay luôn bằng nhau.

### Trả lời

**OPEN QUESTION — không đủ căn cứ kết luận, giữ nguyên như PM audit đã ghi, với bằng chứng mạnh hơn (quét 100% thay vì 500/3902 dòng) cho cùng kết luận "không thể verify từ dữ liệu này".**

Thực tế nghiệp vụ VN phổ biến: "lương đóng BHXH" có thể thấp hơn lương thực nhận (đặc biệt khối lái xe có phụ cấp/thưởng ngoài lương cơ bản) — đây là hiểu biết nghiệp vụ chung, không phải bằng chứng trích từ file khách. Chỉ sponsor mới xác nhận được thực tế công ty X.E.

**Đối chiếu quyết định đã LOCKED (an toàn, không cần đợi câu trả lời để code):** `SA-CTR-INSURANCE-SALARY-SOURCE-01.md` §7 Q-S2 đã chọn default an toàn nhất — 2 ô nhập độc lập (`base` + `si_base`), không auto-copy, không giả định bằng nhau. Nếu sau này sponsor xác nhận "luôn bằng nhau", chỉ cần đổi FE thành 1 ô + copy giá trị sang 2 lines khi POST — không đổi SoT, không đổi API. Đây là lựa chọn đúng hướng vì tránh phải sửa ngược nếu câu trả lời sponsor là "có thể khác nhau" (rủi ro cao hơn nếu lỡ code 1-ô-copy trước).

**→ Giữ nguyên câu hỏi sponsor `Q-S2` đã có trong `BA-CTR-INSURANCE-SALARY-SOURCE-01.md` §10 — không tạo câu hỏi trùng lặp mới.**

---

## 3. Câu hỏi 3 — Catalog "loại hợp đồng" đã map đủ 6/8 mẫu theo loại×khối chưa?

### Đối chiếu Excel (đọc trực tiếp 18 sheet, không chỉ đếm tên)

Sheet trong file Excel (loại bỏ bản sao/nháp — `Trang tính102/103`, `Bản sao của…`, `Thẻ nghiệp vụ`):

| # | Sheet Excel (canonical) | Khối | Loại HĐ |
|---|--------------------------|------|---------|
| 1 | `HĐTV (Khối VP)` | VP | Thử việc |
| 2 | `HĐLĐ 12T (Khối VP)` | VP | 12 tháng |
| 3 | `HĐLĐ 24T( Khối VP)` | VP | 24 tháng |
| 4 | `HĐLĐ KXĐTH` | VP | Không xác định thời hạn |
| 5 | `HĐTV (Khối LX)` | LX | Thử việc |
| 6 | `HĐLĐ 12T (Khối LX)` | LX | 12 tháng |
| 7 | `HĐLĐ 24T ( Khối LX)` | LX | 24 tháng |
| 8 | `HĐLĐ KXĐTH (lx-…)` / `HĐKXĐ (Khối LX)` / `HĐ KXĐ (Khối LX)` | LX | Không xác định thời hạn (3 biến thể trùng nội dung, tính 1) |

→ Đếm được 8 tổ hợp loại×khối riêng biệt về nội dung (4 loại × 2 khối), không phải 6 như sponsor nói qua audit gốc.

**Xác nhận điều khoản khác nhau thật (đọc trực tiếp Điều 3 mỗi sheet, không suy diễn):** so `HĐTV (Khối VP)` vs `HĐLĐ 12T (Khối VP)` cùng khối VP — HĐTV không có điều khoản "bồi thường chi phí đào tạo khi đơn phương chấm dứt" mà HĐLĐ 12T có. Tiêu đề in cũng khác ("HỢP ĐỒNG THỬ VIỆC" vs không có tiêu đề TV). → xác nhận yêu cầu "dynamic theo loại hợp đồng" của sponsor có cơ sở thật, đúng như PM audit đã nêu.

### Trả lời (chỉ note gap, không code theo đúng phạm vi được giao)

- Sponsor nói "6 mẫu" nhưng dữ liệu Excel + catalog sản phẩm hiện có (`XEVN_*` 8 starter đã liệt kê ở `BA-CTR-INSURANCE-SALARY-SOURCE-01.md` §7) là 8 tổ hợp (4 loại × VP/LX) — lệch đếm giữa sponsor và ma trận thật. Đây không phải lỗi hệ thống — cần hỏi lại sponsor xem "6" có tính gộp 2 biến thể KXĐTH LX làm 1, hay có ý định thu gọn xuống 6 tổ hợp thật (vd. bỏ phân biệt VP/LX cho 1 loại nào đó).
- Ma trận ánh xạ Excel → `template_code` starter đã có sẵn ở `BA-CTR-INSURANCE-SALARY-SOURCE-01.md` §7 (8 dòng, đủ cột `template_code`, `pack_code`, field hiển thị thêm GPLX cho khối LX, khối điều khoản delta) — không lặp lại bảng đó ở đây, chỉ xác nhận độc lập là ma trận này khớp với Excel khi đối chiếu trực tiếp.
- **Gap còn treo (không code):** BA §7 mục 3 tự nhận "residual" — nếu starter template composer trên Settings chưa bind đủ clause khác biệt TV vs 12T (đặc biệt điều khoản bồi thường đào tạo) thì đây là gap nội dung Settings, không phải gap code composer. Ba-process không thể verify trạng thái bind hiện tại của Settings composer trong phạm vi công việc này (đọc code, không phải browser live check) — cần QA browser xác nhận riêng, nằm trong journey `J-HRM-CTR-TPL-DYN-01` đã được BA §5.1 định nghĩa.

**→ Giữ nguyên câu hỏi sponsor `Q-S3` đã có trong `BA-CTR-INSURANCE-SALARY-SOURCE-01.md` §10 — không tạo câu hỏi trùng lặp.**

---

## 4. Business Rules / Acceptance Criteria — RETAIN, không tạo mới

File này không phát sinh BR/AC mới. Toàn bộ BR-CTR-CB-BOOT-01..05 và AC-CTR-CB-SOT-01 / RO-01 / BOOT-01..03 / MASK-01 / LINK-01 đã LOCKED tại `SA-CTR-INSURANCE-SALARY-SOURCE-01.md` §1, §7 và đã có dev evidence + QA L1 PASS (`qa-d-be-ctr-cb-boot-01.md`). Đối chiếu độc lập ở §1–§3 phía trên xác nhận không phát hiện mâu thuẫn giữa quyết định đó và bằng chứng đọc trực tiếp code + Excel của ba-process.

| Nguồn BR/AC | Trạng thái theo đối chiếu độc lập |
|--------------|-------------------------------------|
| BR-CTR-CB-BOOT-01 (bootstrap khi snapshot rỗng + AuthZ) | Khớp code hiện tại `ContractCbReadOnlyCard.tsx` |
| BR-CTR-CB-BOOT-02 (POST packages 2 lines base+si_base) | Khớp QA L1 `qa-d-be-ctr-cb-boot-01.md` — 201, base≠si_base xác nhận |
| BR-CTR-CB-BOOT-05 (UV pre-hire không bootstrap) | Chưa tự verify được (ngoài phạm vi đọc code — cần browser); không phát hiện mâu thuẫn trong code đã đọc |
| AC-CTR-FIELD-04 (không «+ Thêm» phụ cấp) | RETAIN xác nhận — code hiện tại không có nút thêm dòng |

---

## 5. Khuyến nghị cho PM

1. **Không dispatch dev-fe/dev-be mới cho work item này** — `D-BE-CTR-CB-BOOT-01` và `D-FE-CTR-CB-BOOT-01` đã READY_FOR_QA/PASS_TO_PM (L1). Việc còn thiếu là verdict browser của `QA-CTR-CB-BOOT-01` (journey `J-HRM-CTR-CB-BOOT-01`) — kiểm tra bus mới nhất trước khi hành động tiếp; nếu đã PASS/FAIL thì đóng luôn `PM-AUDIT-CTR-CB-SALARY-NOT-FILLABLE-01` bằng evidence đó thay vì mở lại.
2. **Nếu PM cần đóng `PM-AUDIT-CTR-CB-SALARY-NOT-FILLABLE-01` chính thức:** trỏ về chain `BA-CTR-INSURANCE-SALARY-SOURCE-01` → `SA-CTR-INSURANCE-SALARY-SOURCE-01` → `D-BE/D-FE-CTR-CB-BOOT-01` → `QA-D-BE-CTR-CB-BOOT-01` (PASS) làm nguồn quyết định chính; file này (`PO-HRM-CTR-CB-INIT-FLOW-SPEC-01`) đóng vai xác nhận chéo độc lập theo đúng yêu cầu ba-process ban đầu.
3. **2 câu hỏi sponsor còn mở thật** (không phải do ba-process tạo mới, đã có sẵn ở BA §10, xác nhận lại độc lập ở đây): `Q-S2` (Mức BHXH có luôn bằng Mức lương?) và `Q-S3` (6 hay 8 tổ hợp mẫu?). Không cần hỏi lại nếu sponsor đã trả lời qua kênh khác — kiểm tra `BA §10b` / bus trước khi hỏi lại để tránh làm phiền sponsor lần 2.

---

## 6. OPEN QUESTIONS (không tự quyết)

| ID | Câu hỏi | Vì sao không tự trả lời được | Tham chiếu |
|----|---------|-------------------------------|------------|
| **Q-S2** (cross-ref BA §10) | «Mức BHXH» có thể khác «Mức lương» trên cùng 1 NV thật không? | Quét 100% 3902 dòng sheet `Mã NV` — 0 dòng có đủ số liệu ở cả 2 cột để so sánh (file thực tế chỉ có 1 dòng NV, và dòng đó cũng rỗng ở cả 2 cột) | §2 phía trên |
| **Q-S3** (cross-ref BA §10) | "6 mẫu" sponsor nói có tính gộp bớt so với 8 tổ hợp loại×khối trong Excel/catalog không? | Đếm được 8 tổ hợp nội dung khác nhau thật trong Excel; sponsor có thể đang tính gộp theo cách khác (vd. không phân biệt VP/LX) — cần hỏi trực tiếp | §3 phía trên |

---

## 7. Completion / ack

| Field | Value |
|-------|--------|
| **completion_report** | Đối chiếu độc lập 3 câu hỏi PM audit: (1) luồng bootstrap trong dialog HĐ, ghi thẳng SoT `employee_compensation_packages/lines` qua reuse API tạo gói — đã có code + QA L1 PASS, khớp đề xuất P-A đã LOCKED ở `SA-CTR-INSURANCE-SALARY-SOURCE-01`; (2) Mức BHXH vs Mức lương — quét lại toàn bộ 3902 dòng (không chỉ 500), xác nhận 0 dòng đủ dữ liệu so sánh, vẫn là OPEN QUESTION, khớp default an toàn "2 ô độc lập" đã chọn; (3) catalog 6 vs 8 mẫu — xác nhận 8 tổ hợp loại×khối nội dung khác nhau thật trong Excel, lệch đếm với sponsor, giữ nguyên OPEN QUESTION Q-S3. Không phát hiện mâu thuẫn với chain BA/SA/Dev/QA đã LOCKED cùng ngày. Không sửa `apps/**`. |
| **residual** | Chờ sponsor Q-S2/Q-S3 (đã có sẵn ở BA §10, không tạo trùng); chờ verdict browser `QA-CTR-CB-BOOT-01` (đã dispatch/resume trên bus, chưa thấy kết quả cuối tại thời điểm đọc) |
| **next_owner** | **pm** — kiểm tra bus mới nhất cho `QA-CTR-CB-BOOT-01` trước khi dispatch thêm; nếu đã PASS → đóng `PM-AUDIT-CTR-CB-SALARY-NOT-FILLABLE-01` bằng chain đó + file này làm second opinion |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-ctr-cb-init-flow-spec-01.md` |
