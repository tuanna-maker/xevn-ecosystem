# 14 — Traceability SRS ↔ TechSpec ↔ Code (+ comment tiếng Việt)

**Ban hành:** 2026-07-20  
**Bổ sung cho:** `02-SPEC-FIRST-GATE.md` · `04-CODE-MEMORY-JOURNAL.md` · `11-FEATURE-UPGRADE-NO-OVERWRITE.md` · `13-BRD-SRS-TECHSPEC-QUALITY.md`  
**Không thay thế** các file trên — siết **mã tham chiếu** + **comment 100% tiếng Việt** + **đọc trước khi sửa**.

**Nguồn Sponsor (YTEXA 2026-07-20):**  
SRS↔TechSpec phải có mã tham chiếu đàng hoàng; code FE/BE/DB comment theo cùng mã; nâng cấp = đọc SRS → TechSpec → CODE-MEMORY rồi mới sửa; **không xóa** nghiệp vụ đang chạy đúng; comment xử lý gì / để làm gì bằng **tiếng Việt**.

---

## 1. Chuỗi khóa phạm vi (mọi dự án)

```
SRS (UC / FR / BR) ──ref──► TechSpec (TS-ID / §) ──ref──► Artifacts (@CODE-MEMORY / @STYLE-… / slice map)
        ▲                                                      │
        └──────── nâng cấp / hotfix: đọc ngược chuỗi này trước ┘
```

**Bổ sung 2026-07-28:** “Artifacts” = **mọi file** của feature (route, CSS, contract, env, CI, docs team…), không chỉ 1 file TS. Doctrine: `22-ARTIFACT-NEO-AND-FEATURE-SLICE.md`.

| Bước | Ai | Bắt buộc |
| --- | --- | --- |
| 1 | BA | SRS có `UC-…` / `FR-…` / `BR-…` ổn định |
| 2 | SA | Mọi mục TechSpec ghi **`ref_srs:`** (một hoặc nhiều FR/UC) |
| 3 | Dev | Trước code: đọc SRS § → TechSpec § → `@CODE-MEMORY` trong file |
| 4 | Dev | Viết/sửa: block CODE-MEMORY + comment tiếng Việt tại chỗ xử lý then chốt |
| 5 | QA/QC | Reject nếu thiếu `spec_read_ack` hoặc CODE-MEMORY lệch SRS/TechSpec |

**Cấm:** Sửa code “cho nhanh” rồi mới vá SRS/TechSpec.  
**Cấm:** Xóa / viết đè luồng đang 🟢 để “làm gọn” khi chỉ cần hoàn thiện (dùng `ADD` / `UPGRADE` + `must_keep`).

### Bổ sung 2026-07-21 — SRS «Kết quả trả về» → TechSpec

Trước khi viết API/DB, SA **bắt buộc** đọc mục **Kết quả trả về khi thành công** trên SRS (§3.4.6):

| SRS | TechSpec |
| --- | --- |
| Bản ghi tạo/cập nhật | Prisma / aggregate |
| Khóa mang bước sau | Zod response (`packages/shared`) |
| Người dùng thấy | FE bind |
| UC mở khóa tiếp | API + guard bước sau |

Chi tiết: `templates/SRS-TO-TECHSPEC-HANDOFF.md`. Thiếu bảng Kết quả trả về trên SRS → **dừng**, báo ba-docs — không bịa contract.

---

## 2. Mã tham chiếu chuẩn

| Lớp | Mã | Ví dụ |
| --- | --- | --- |
| Nghiệp vụ UC | `UC-{NHÓM}-{nn}` | `UC-QUE-03` |
| Yêu cầu chức năng | `FR-UC-{…}` hoặc `FR-{…}` | `FR-UC-QUE-03` |
| Quy tắc | `BR-…` / `BRule-…` | `BR-21` |
| TechSpec | `TS-{MODULE}-{nn}` **hoặc** `§x.y` + bắt buộc `ref_srs` | `TS-QUEUE-02` · `ref_srs: FR-UC-QUE-03` |
| Work item | `W-…` | `W-DEVFE-QUEUE-01` |

### 2.1 Trong TechSpec (mọi mục thiết kế)

Mỗi đoạn/bảng/API/DB block **phải** có dòng:

```markdown
**ref_srs:** FR-UC-QUE-03, FR-UC-QUE-05 · **UC:** UC-QUE-03 · **BR:** BR-QUEUE-01
**ref_ts:** TS-QUEUE-02 (self-id nếu dùng mã TS)
```

Không có `ref_srs` → QC TechSpec **NO-GO**.

### 2.2 Trong SRS (phụ lục / FR)

- Phụ lục trace: BR ↔ UC ↔ (gợi ý module)  
- Khi có TechSpec đã confirm: cột **`ref_ts`** (điền ở wave sync, không bắt buộc ngày viết SRS đầu nếu TechSpec chưa có)

### 2.3 Trong code

`@CODE-MEMORY` bắt buộc đủ:

```
SRS: <path> §… · FR-… / UC-…
TechSpec: <path> §… · TS-… (nếu có)
```

Lệch mã so với SRS/TechSpec đang confirm → Dev **dừng**, báo BA/SA — không tự đổi nghiệp vụ trong comment.

---

## 3. Comment code — 100% tiếng Việt

### 3.1 Quy tắc

| Được | Cấm |
| --- | --- |
| Toàn bộ nội dung diễn giải trong `@CODE-MEMORY` và comment chỗ xử lý bằng **tiếng Việt** | Comment Purpose/Impact bằng tiếng Anh |
| Giữ nguyên **mã** `UC-` `FR-` `BR-` `TS-` `W-` và tên file/hàm/RPC | Viết lại toàn bộ block bằng English “for consistency” |
| Comment ngắn tại nhánh if/else, validation, trừ kho, đổi trạng thái: **xử lý gì · để làm gì** | Comment vô nghĩa (`// fix`, `// temp`, `// handle`) |

### 3.2 Trước khi sửa file (checklist Dev — ghi evidence)

1. Mở SRS đúng FR/UC  
2. Mở TechSpec đúng `ref_srs` / §  
3. Đọc `@CODE-MEMORY` (+ mọi `@CODE-MEMORY-CHANGE`)  
4. So khớp: Purpose / must_keep **có còn đúng** SRS+TechSpec không?  
5. Nếu comment cũ **sai so với SRS mới đã confirm** → BA/SA amend trước hoặc `CODE-MEMORY-CHANGE` ghi rõ delta — **không** im lặng sửa code lệch spec  

### 3.3 Comment tại chỗ xử lý (ngoài block đầu file)

Với logic nghiệp vụ then chốt (đóng ca, trừ kho, gọi số, sync offline, validate XML…):

```ts
// Kiểm tra: phải có đúng một chẩn đoán chính trước khi đóng ca (FR-UC-CASE-07 / TS-EMR-…).
// Mục đích: tránh đóng ca thiếu ICD — lệch giám định BHYT.
if (!hasPrimaryDiagnosis) {
  // Thất bại: báo người dùng, không đổi trạng thái ca.
  ...
}
```

SQL:

```sql
-- @CODE-MEMORY (xem block đầy đủ phía trên migration)
-- Xử lý: cập nhật trạng thái ca → hoàn tất khi đủ điều kiện đóng ca (FR-UC-CASE-07).
-- Giữ: không xóa bản ghi cũ; chỉ đổi trạng thái + ghi phiên bản hồ sơ.
```

---

## 4. Nâng cấp / hoàn thiện feature (nhắc lại + siết)

Xem đủ: `11-FEATURE-UPGRADE-NO-OVERWRITE.md` · `03-ADDITIVE-ONLY.md`.

| Tình huống | Làm đúng |
| --- | --- |
| Hoàn thiện thêm rule | **ADD/UPGRADE** rule mới; giữ luồng cũ trong `must_keep` |
| Sửa bug | Spec delta nhỏ + test; không nhân tiện refactor đè |
| “Viết lại cho sạch” | **Cấm** nếu chưa sponsor REPLACE + must_keep + regression |

Mỗi UPGRADE: `@CODE-MEMORY-CHANGE` tiếng Việt + `ref_srs` / TechSpec § mới + liệt kê **giữ nguyên** gì.

---

## 5. PM dispatch — exit criteria mẫu

```text
spec_read_ack:
  srs: docs/srs/... §... (FR-UC-… / UC-…)
  tech_spec: docs/tech-spec/... §... (TS-… · ref_srs khớp)
change_mode: ADD | UPGRADE | REPLACE
must_keep: [...]
code_memory_required: true
code_memory_language: vi   # toàn bộ diễn giải tiếng Việt
exit_criteria:
  - Đã đọc SRS → TechSpec → @CODE-MEMORY trước khi sửa
  - CODE-MEMORY + comment chỗ xử lý 100% tiếng Việt (giữ mã UC/FR/TS)
  - ref_srs trên TechSpec khớp FR đang implement
  - Không xóa must_keep / không đè nghiệp vụ 🟢
```

---

## 6. Đã có sẵn trong OS (không xóa — chỉ bổ sung bởi file này)

| File | Đã cover | File 14 bổ sung |
| --- | --- | --- |
| `02-SPEC-FIRST-GATE` | Đọc SRS+TechSpec trước code | Mã `ref_srs` / kiểm CODE-MEMORY khớp |
| `04-CODE-MEMORY` | Block đủ field, append CHANGE | **100% Việt**; đọc comment trước sửa |
| `11-UPGRADE` | Không đè nghiệp vụ | Gắn chuỗi trace + comment VI |
| `13-BRD-SRS-TECHSPEC` | Chất lượng SRS/TechSpec/DB | Trace bắt buộc TechSpec→SRS |
| Rule `code-memory-journal-full` | Global Cursor | Mirror VI + read-before-edit |

---

## Lịch sử cập nhật file này

| Ngày | Thay đổi |
| --- | --- |
| 2026-07-20 | Ban hành lần đầu (YTEXA Sponsor) — trace SRS↔TS↔Code, comment tiếng Việt, siết UPGRADE |
