# Phụ lục Named Field (MOD-CON) — tóm tắt làm việc trong repo

| Meta | Giá trị |
|------|---------|
| **Vai trò** | **Tham khảo** mô hình field có tên cố định cho in/preview hợp đồng — **không** thay SRS/TechSpec/API_DESIGN |
| **Bản đầy đủ (sponsor Desktop)** | `PHU_LUC_NAMED_FIELD_SCHEMA_MOD_CON.md` — xem index `README-UI-UX-REFERENCE-SPONSOR.md` |
| **work_item_id** | `BA-UI-SPEC-SRS-FIRST-SYNC-01` |
| **Ngày** | 10/08/2026 |

---

## 1. Mục đích nghiệp vụ (rút gọn)

Module **Hợp đồng (MOD-CON)** cần gắn **trường có khóa ổn định** (`field_key` / merge token) vào:

- Nội dung điều khoản và mẫu hợp đồng (Settings + tạo/sửa HĐ).
- Luồng **preview / in** — giá trị lấy từ DTO hợp đồng + nhân sự + cấu hình đã khai trong API, không từ schema JSON generic tự phát trên FE.

**Nguyên tắc bind:** Một token trên UI = một nguồn dữ liệu đã mô tả trong **API_DESIGN** (cột/DTO + bước Diễn biến SRS). FE chỉ render control/placeholder theo catalog token; **cấm** thêm key ngoài SoT.

---

## 2. Phạm vi màn hình (map repo)

| Mã tham khảo (enterprise) | Artifact repo | Ghi chú |
|--------------------------|---------------|---------|
| SCR-CON-03 (wizard tạo/xem HĐ) | UF-HRM-02 · `Contracts.tsx` create/view | Bước mẫu + điều khoản + preview — `PO-HRM-CTR-CREATE-REDESIGN-BA-02` |
| Settings mẫu HĐ | `UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md` | Meta + palette DnD; junction `clause_ids` |
| Settings token merge | Tab `merge-tokens` · FR-PLT-TOK | Danh mục token in — PAT catalog |
| Preview runtime | `POST …/contracts/{id}/preview` | Thứ tự clause + merge body |

Mobile **MOB-10** chỉ đọc HĐ/BH — **không** admin template; Named Field admin thuộc web Settings + HRM embed.

---

## 3. Khác với `field_schema` generic

| Khía cạnh | Generic `field_schema` (cấm làm SoT MOD-CON) | Named Field (target) |
|-----------|-----------------------------------------------|----------------------|
| Định danh | Type + label tự do | `field_key` / token code cố định |
| Nguồn giá trị | FE suy diễn | BE resolve theo contract/employee/catalog |
| Thay đổi | Thêm cột UI tùy ý | Delta SRS → DB_DESIGN → API_DESIGN → UI_SCREEN_SPEC |
| QA | Khó trace | Network khớp DTO; preview/in đối chiếu token |

---

## 4. Liên kết contract API (SoT)

| Hạng mục | Path |
|----------|------|
| **API pack HĐ/BH** | `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` — map endpoint · **F-CORE-CTR-PREV-01** preview · overlay clause |
| **DB vật lý** | `docs/hrm/DB_DESIGN_HRM_CONTRACTS_INS.md` |
| **TechSpec module** | `docs/hrm/TECHSPEC.md` §14 (Contracts/Insurance) |
| **SRS** | `docs/hrm/SRS.md` — FR-UC-BP-CORE-09a/09b/09d · UF-HRM-02 · UC-HRM-25 |
| **Mẫu API function** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **UI_SCREEN_SPEC liên quan** | `docs/hrm/ui-screens/UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md` · `UI-SETTINGS-CTR-CLAUSES.md` · `PAT-CTR-TEMPLATE-COMPOSER-01` (guide §3) |

OpenAPI: `docs/api/openapi/hrm-api.yaml` — prefix `/api/hrm/contracts-insurance`.

---

## 5. AC tối thiểu (khi đụng Named Field trên UI)

| # | Điều kiện | PASS |
|---|-----------|------|
| NF-01 | Token hiển thị trên preview/in | Giá trị khớp GET contract / preview response, không hardcode demo |
| NF-02 | Thêm/sửa token catalog (Settings) | POST/PUT 2xx → F5 → row còn; consumer preview nhận token mới chỉ sau khi API khai |
| NF-03 | Thiếu key trong API | `[NEEDS CLARIFICATION]` — không dev tự mint key |
| NF-04 | U65 | Không seed để «có token»; tạo từ FE Settings hoặc luồng SRS |

---

## 6. Out of scope tài liệu này

- Danh sách đầy đủ từng `field_key` (lấy từ DB_DESIGN + API khi wave khai).
- JD dynamic field (`jd-field-defs`) — domain REC/JD, không gộp MOD-CON.
- Payroll named header cols — wave PAY riêng (`PO-HRM-MVP-GD1-PAY-*`).

*Chỉ tóm tắt phục vụ SRS-first sync; chi tiết enterprise nằm bản phụ lục sponsor (Desktop).*
