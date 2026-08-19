# BA-Process — SoT «Lương đóng BH» + dynamic 6/8 mẫu HĐ (ADD-only)

| Meta | Value |
|------|--------|
| **work_item_id** | `BA-CTR-INSURANCE-SALARY-SOURCE-01` |
| **lane** | governance · ba-process |
| **change_mode** | **ADD** — không wipe AC BA-01/02/03 đã confirm; **AMEND hẹp** O10/Q9 chỉ cho trường hợp snapshot C&B **rỗng** |
| **status** | **DRAFT for sponsor Q** + **PASS_TO_PM** (SoT + phương án đề xuất đã khóa đủ để SA/Dev thiết kế; vài policy còn hỏi) |
| **honesty** | `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** · **cấm** đè seal CTR create/workspace G4 GWC · **cấm** claim printable/module CTR UAT |
| **must_keep** | CORE-02 `employee_compensation_packages\|lines\|history` ONE SoT · `HRM-CORE-CB-403` / `HRM-CORE-CB-AUTHZ-403` · BA-02 **AC-CTR-FIELD-04** (không «+ Thêm» phụ cấp GĐ1) · BA-03 clause `body_vi` SoT Settings · open catalog 8 starter ≠ ceiling |
| **cấm** | `apps/**` · seed · cột lương BH SoT thứ 2 trên `employee_contracts` · FE tự tính BH từ % |
| **evidence_in** | `docs/qa/evidence/pm-audit-contract-cb-salary-not-fillable-01.md` · Excel `docs/từ khách hàng/2026.08.07. Hợp đồng mẫu X.E.xlsx` · code `ContractCbReadOnlyCard` · `buildCompensationSnapshotFromPackage` · CORE-02 DATA/BA |

---

## 0. Mục tiêu & ranh giới

### 0.1 Mục tiêu

Chốt **một nguồn sự thật** cho «Lương đóng BH» / «Mức BHXH» khi tạo HĐ; giải quyết bế tắc NV mới chưa có gói C&B; và khóa ánh xạ **mẫu Excel → `template_code` → khối field/điều khoản dynamic** — **không** tạo dual-SoT lương.

### 0.2 In / Out

| In | Out |
|----|-----|
| SoT + quyền ghi/đọc «Lương đóng BH» | Impl `apps/**` / migration |
| BR + AC editable vs read-only | Flip `contracts_printable_ready` |
| Luồng NV mới (bootstrap C&B) | PAY run / SI enrollment lifecycle (CORE-10) mutate |
| Ma trận 8 starter mẫu × VP/LX + delta điều khoản Excel | Hardcode `body_vi` trên FE create |
| Câu hỏi sponsor còn mở | Đè seal G4 create/workspace |

---

## 1. Căn cứ đã đọc (không đoán)

### 1.1 File khách Excel (18 sheet)

| Sheet (canonical) | Vai trò |
|-------------------|---------|
| **`Mã NV`** | Bảng chủ NS — cột **Y = «Mức BHXH»**, cột **AK = «Mức lương»** (tách cột) |
| **`HĐTV (Khối VP)`** | Mẫu thử việc VP |
| **`HĐLĐ 12T (Khối VP)`** | HĐLĐ 12 tháng VP |
| **`HĐLĐ 24T( Khối VP)`** | HĐLĐ 24 tháng VP |
| **`HĐLĐ KXĐTH`** | HĐLĐ không xác định thời hạn (VP) |
| **`HĐTV (Khối LX)`** | Thử việc LX |
| **`HĐLĐ 12T (Khối LX)`** / **`. `** | HĐLĐ 12T LX |
| **`HĐLĐ 24T ( Khối LX)`** | HĐLĐ 24T LX |
| **`HĐLĐ KXĐTH (lx-…)` / `HĐKXĐ` / `HĐ KXĐ`** | Biến thể KXĐ LX (+ bản sao dư) |

**Đối chiếu điều khoản (cùng Khối VP):**

| Nội dung | HĐTV VP | HĐLĐ 12T VP |
|----------|---------|------------|
| Tiêu đề | HỢP ĐỒNG THỬ VIỆC | HĐLĐ (không tiêu đề TV) |
| «Bồi thường chi phí đào tạo… đơn phương chấm dứt» | **Không** có | **Có** (Điều 3) |
| Cơ cấu Điều 1–5 | Có (TV wording) | Có (HĐLĐ wording) |

→ Sponsor đúng: mẫu **khác điều khoản thật**, không chỉ khác label thời hạn.

**Mức BHXH vs Mức lương:** cột tách trên sheet `Mã NV` là căn cứ «field độc lập về mặt cấu trúc». Quét dữ liệu số trên cột Y/AK **không đủ** để kết luận hai số có luôn bằng nhau hay không (hầu hết dòng trống; không dùng làm chứng minh nghiệp vụ độc lập số học). → **Câu hỏi sponsor Q-S2**.

### 1.2 Code AS-IS

| Artifact | Hành vi |
|----------|---------|
| `ContractCbReadOnlyCard.tsx` | 3 ô **read-only**: Lương cơ bản · **Lương đóng BH** · Tỉ lệ hưởng lương từ `compensation_snapshot` |
| `contracts-insurance.service.ts` `buildCompensationSnapshotFromPackage` | `insurance_salary_vnd` ← line `component_code ∈ {si_base, insurance_base}` **else fallback base line** |
| `getContractCreateContext` | Đọc `EmployeeCompensationService.getActivePackage` — thiếu quyền → `cb_masked` |
| `employee_compensation_*` + `createPackage` | SoT ghi versioned (CORE-02 sealed `CORE02QC1-MSL80DU6`) |
| Print | `compensation_snapshot_json` trên print version = **snapshot lúc issue** (đóng băng in) — **không** SoT vận hành lương |

### 1.3 Spec đã confirm (RETAIN)

| Spec | Quyết định liên quan |
|------|----------------------|
| CORE-02 BA/DATA | ONE SoT packages/lines; mutate chỉ `/compensation-packages*` (+ SI enrollment riêng); public EMP **cấm** lộ C&B |
| BA-02 Q9 / **O10** / **AC-CTR-FIELD-04** | GĐ1: **một card C&B read-only**; **không** sub-grid «+ Thêm» phụ cấp |
| BA-01 / XEVN-TPL | 8 starter `XEVN_*` (4 loại × OFFICE/DRIVER); catalog **mở**; `body_vi` SoT Settings; create chỉ `clause_ids` |
| BA-03 | NV-first; UV offer pre-hire only; workspace modes; **không** sửa `body_vi` trên HĐ |

---

## 2. Quyết định SoT — «Lương đóng BH»

### 2.1 SoT vận hành (khóa)

| Vai trò | Entity / field | Ai ghi | Ai đọc |
|---------|----------------|--------|--------|
| **SoT ghi & sửa** | `employee_compensation_packages` + `employee_compensation_lines` | Role C&B / HCNS đủ **AuthZ C&B mutate** qua `POST/…/compensation-packages` (+ `…/revise`) | — |
| **Line «Lương đóng BH»** | Line có **`component_code = si_base`** (alias chấp nhận `insurance_base` khi đọc) | Cùng C&B mutate | PAY / SI ceiling / CTR snapshot |
| **Line «Lương cơ bản»** | `line_type = base` (và/hoặc `component_code=base`) | Cùng C&B mutate | CTR card · preview |
| **HĐ create/edit UI** | `compensation_snapshot` từ `GET …/contract-create-context` | **Không** ghi lương vào bảng HĐ | HCNS đủ quyền xem C&B |
| **Bản in đã issue** | `print_versions.compensation_snapshot_json` | Hệ thống lúc **issue** (đóng băng) | In/PDF — **không** sửa ngược SoT C&B |

**DENY (dual-SoT):**

- Cột `insurance_salary` / `bhxh_amount` bền vững trên `employee_contracts` làm SoT song song.
- FE/HĐ form PATCH lưu lương BH **chỉ** vào registry HĐ rồi bỏ qua packages.
- Public `/employees*` body chứa C&B keys (RETAIN `HRM-CORE-CB-403`).

### 2.2 Quan hệ HĐ ↔ C&B

- Soft link đã có: package có thể gắn `contract_id` (RETAIN CORE-02).
- HĐ **consume** gói **active** theo `employee_id` + ngày hiệu lực — không tự là SoT số tiền.

---

## 3. Phương án luồng NV mới (chưa có gói C&B)

### 3.1 So sánh

| | **P-A — Bootstrap trên màn HĐ** (đề xuất) | **P-B — Bắt tạo C&B trước** |
|--|-------------------------------------------|------------------------------|
| **Mô tả** | Khi snapshot rỗng + có quyền C&B: card chuyển **bootstrap editable** (lương CB + lương đóng BH bắt buộc). **Lưu/Tiếp** gọi **POST compensation-packages** (lines base + `si_base`) **trước hoặc cùng transaction** tạo/cập nhật HĐ; sau 2xx card về **read-only**. | Card luôn RO; thiếu snapshot → **chặn Tiếp/Lưu** + CTA mở Hồ sơ NV → C&B (`EmployeeCompensationPanel`); chỉ cho tiếp khi `getActivePackage` có số. |
| **Ưu** | Khớp Excel (nhập Mức BHXH cùng lúc hồ sơ/HĐ); 1 chỗ thao tác; không dual-SoT nếu ghi đúng packages | Ranh giới UI sạch; RETAIN nguyên chữ «read-only» Q9; dễ AuthZ |
| **Nhược** | Cần AMEND hẹp O10 (RO **trừ** empty bootstrap); BE orchestration create package + contract; UV pre-hire **không** có `employee_id` → không bootstrap | Thêm bước / rời context; lệch thói quen Excel; dễ bỏ dở HĐ |
| **Rủi ro lệch dữ liệu** | Thấp **nếu** cấm persist trên HĐ | Thấp |

### 3.2 Phương án đề xuất: **P-A (bootstrap → ghi SoT C&B)**

**AMEND hẹp O10 / AC-CTR-FIELD-04 (không wipe):**

> Card C&B GĐ1 vẫn **không** có «+ Thêm» phụ cấp.  
> **RETAIN** read-only khi đã có active package (hoặc `cb_masked`).  
> **ADD** trạng thái **bootstrap** chỉ khi: mode create/edit · có `employee_id` · `compensation_snapshot` không có `base_salary_vnd` **và** không có `insurance_salary_vnd` hữu hiệu · user **có** quyền C&B mutate.

**UV pre-hire (BA-03):** không bootstrap C&B trên HĐ UV — chỉ sau khi có `employee_id` (hire / NV-first). Registry-only / offer path: xem Q-S4.

---

## 4. Business rules (ADD)

| ID | Điều kiện | Hành động | Outcome |
|----|-----------|-----------|---------|
| **BR-CTR-CB-SOT-01** | Mọi số «Lương đóng BH» vận hành | Ghi/sửa **chỉ** qua `employee_compensation_lines` (`si_base` / `insurance_base`) | HĐ không phải SoT số |
| **BR-CTR-CB-SOT-02** | Issue / Lưu phiên bản in | Copy snapshot vào `compensation_snapshot_json` | Đóng băng in; sửa lương sau = revise C&B + issue lại (ngoài slice printable) |
| **BR-CTR-CB-RO-01** | Active package tồn tại **hoặc** `cb_masked=true` | Card C&B **read-only** (RETAIN O10) | Không edit inline trên HĐ |
| **BR-CTR-CB-BOOT-01** | Snapshot rỗng + có `employee_id` + AuthZ C&B mutate | Hiện bootstrap: **Lương cơ bản** + **Lương đóng BH** bắt buộc (vi-VN grouping) | User nhập được khi NV mới |
| **BR-CTR-CB-BOOT-02** | User bấm Tiếp/Lưu khi đang bootstrap | BE **POST** `compensation-packages` với ≥2 lines: `base` + `si_base` (amount > 0); `effective_from` ≥ ngày ký / ngày HĐ có hiệu lực (SA chốt field) | Gói v1 tồn tại; context re-fetch → RO |
| **BR-CTR-CB-BOOT-03** | Bootstrap thiếu / ≤0 / không parse được | Chặn Tiếp/Lưu; message VI | Không tạo HĐ «treo» lương |
| **BR-CTR-CB-BOOT-04** | `cb_masked` hoặc thiếu AuthZ C&B | Không hiện input; banner «Không đủ quyền xem/nhập C&B» + không lộ số | RETAIN CB-403 family |
| **BR-CTR-CB-BOOT-05** | Subject = UV pre-hire (`employee_id` null) | Không bootstrap C&B trên HĐ | Tránh ghi packages không có NV |
| **BR-CTR-CB-EDIT-01** | Đã có package, user muốn đổi lương BH | **Không** edit trên HĐ; link «Mở hồ sơ C&B» → revise package (CORE-02) | Một cửa sửa |
| **BR-CTR-TPL-DYN-01** | Đổi `template_code` | Re-bind default `clause_ids` từ Settings template (confirm nếu canvas dirty — RETAIN BR-CTR-CREATE-02) | Preview/điều khoản theo mẫu |
| **BR-CTR-TPL-DYN-02** | `*_PROBATION_*` vs `*_FT_*` / `*_INDEF_*` | Default clause set **khác** (Excel: TV **không** có bồi thường chi phí đào tạo HĐLĐ) — SoT = bind Settings, **không** hardcode body FE | Dynamic đúng mẫu khách |
| **BR-CTR-TPL-DYN-03** | `*_OFFICE` vs `*_DRIVER` | Field GPLX + pack IT_OFFICE/DRIVER (RETAIN O4/O11) | Khối VP/LX |

---

## 5. Acceptance criteria (ADD · U65 browser)

| AC ID | Đạt khi | Không đạt khi |
|-------|---------|----------------|
| **AC-CTR-CB-SOT-01** | Network mutate lương BH = `POST/revise …/compensation-packages` **2xx**; **không** có field lương BH bền trên body create HĐ như SoT | Lương chỉ nằm trên `employee_contracts` / custom_fields |
| **AC-CTR-CB-RO-01** | NV đã có gói C&B: card hiển thị số RO khớp active package; không input | Input editable khi đã có package |
| **AC-CTR-CB-BOOT-01** | NV mới (0 package): bootstrap 2 ô bắt buộc; nhập → Tiếp → POST packages **201/200** rồi context có `insurance_salary_vnd` | Snapshot `—` mãi; không cách nhập |
| **AC-CTR-CB-BOOT-02** | Sau bootstrap 2xx + **F5** mở lại HĐ/NV: C&B panel / context vẫn có cùng mức BH | Mất sau F5; chỉ RAM FE |
| **AC-CTR-CB-BOOT-03** | Bỏ trống / 0 đồng → chặn + lỗi VI rõ | Lưu được với BH trống |
| **AC-CTR-CB-MASK-01** | User không quyền C&B: masked / banner; không lộ số | Lộ lương khi 403 |
| **AC-CTR-CB-LINK-01** | Khi RO có số: có CTA «Mở C&B» (profile) — không bắt buộc đổi số trên HĐ | Sửa lương chỉ trong dialog HĐ khi đã có package |
| **AC-CTR-TPL-DYN-01** | Chọn `XEVN_PROBATION_OFFICE` vs `XEVN_FT_12M_OFFICE`: Bước 2 default clause / preview **khác** theo bind Settings (ít nhất khác mặt điều khoản đào tạo / title TV) | Hai mẫu cùng clause set cứng FE |
| **AC-CTR-TPL-DYN-02** | `XEVN_FT_12M_OFFICE` vs `XEVN_FT_12M_DRIVER`: GPLX block on/off (RETAIN) | VP≡LX field |
| **AC-CTR-TPL-DYN-03** | Regression: «Chỉ lưu sổ» AC-CTR-XEVN-08 **không** bắt bootstrap C&B (trừ sponsor trả lời Q-S4 khác) | Registry-only bị chặn vì thiếu BH |

**RETAIN regression:** AC-CTR-FIELD-04 (không «+ Thêm» PC) · AC-CTR-CATALOG-01 · J-HRM-CTR-CREATE-01..08 · G4 NV-first seals.

### 5.1 Journey mint (DRAFT)

| Journey | Click path | AC |
|---------|------------|-----|
| **J-HRM-CTR-CB-BOOT-01** | NV mới → Thêm HĐ → bootstrap lương CB+BH → Tiếp → F5 | BOOT-01/02 |
| **J-HRM-CTR-CB-RO-01** | NV có C&B → Thêm/Sửa HĐ → card RO khớp | RO-01 |
| **J-HRM-CTR-TPL-DYN-01** | PROBATION_OFFICE vs FT_12M_OFFICE → Bước 2/preview khác | TPL-DYN-01 |

---

## 6. Sequence — phương án đề xuất P-A (tiếng Việt)

```mermaid
sequenceDiagram
  actor HCNS as HCNS / C&B
  participant FE as ContractWorkspace
  participant CTX as GET contract-create-context
  participant CB as POST compensation-packages
  participant HD as POST/PATCH hợp đồng

  HCNS->>FE: Chọn Nhân viên + mẫu HĐ
  FE->>CTX: Lấy snapshot C&B + Bên B
  alt Đã có gói active hoặc bị che quyền
    CTX-->>FE: compensation_snapshot / cb_masked
    FE-->>HCNS: Card lương đọc-only (hoặc banner không quyền)
  else Snapshot rỗng và đủ quyền C&B
    CTX-->>FE: base/BH = null
    FE-->>HCNS: Bootstrap — nhập Lương cơ bản + Lương đóng BH
    HCNS->>FE: Tiếp / Lưu
    FE->>CB: Tạo gói v1 (base + si_base)
    CB-->>FE: 2xx + package_id
    FE->>CTX: Refresh snapshot
    FE->>HD: Lưu HĐ (không gửi SoT lương riêng)
    HD-->>FE: 2xx
    FE-->>HCNS: Card chuyển đọc-only; F5 vẫn còn số trên C&B
  end
```

### 6.1 Diễn biến (bảng)

| # | Actor | Bước | Kết quả quan sát |
|---|-------|------|------------------|
| 1 | HCNS | Login → Hợp đồng → Thêm → chọn NV mới | Bước 1 mở |
| 2 | Hệ thống | GET create-context | Snapshot rỗng |
| 3 | HCNS | Nhập Lương cơ bản + Lương đóng BH (vi-VN) | Input hợp lệ |
| 4 | HCNS | Tiếp | POST packages 2xx; không dual cột HĐ |
| 5 | HCNS | F5 / mở C&B NV | Cùng mức BH |
| 6 | HCNS (fail) | Để trống BH → Tiếp | Chặn + lỗi VI |

---

## 7. Ma trận mẫu Excel → `template_code` → dynamic

> Sponsor nói «6 mẫu»; Excel + product starter = **8** (4 loại × VP/LX). Bản sao sheet không tính. → **Q-S3**.

| Excel sheet (canonical) | `template_code` starter | `pack_code` | Term UI | Field hiển thị thêm | Khối điều khoản (SoT Settings bind) — delta khách |
|-------------------------|-------------------------|-------------|---------|---------------------|-----------------------------------------------------|
| HĐTV (Khối VP) | `XEVN_PROBATION_OFFICE` | IT_OFFICE | TV · `effective_to` bắt buộc (~60 ngày gợi ý) | — | Title TV; **không** bắt buộc có ĐK «bồi thường chi phí đào tạo» kiểu HĐLĐ |
| HĐLĐ 12T (Khối VP) | `XEVN_FT_12M_OFFICE` | IT_OFFICE | +12 tháng | — | HĐLĐ; **có** ĐK bồi thường chi phí đào tạo (Excel Điều 3) |
| HĐLĐ 24T (Khối VP) | `XEVN_FT_24M_OFFICE` | IT_OFFICE | +24 tháng | — | Tương tự 12T (cùng họ ĐK HĐLĐ; khác hạn) |
| HĐLĐ KXĐTH | `XEVN_INDEF_OFFICE` | IT_OFFICE | Ẩn/không bắt `effective_to` | — | HĐLĐ KXĐ + ĐK bồi thường đào tạo (Excel) |
| HĐTV (Khối LX) | `XEVN_PROBATION_DRIVER` | DRIVER | TV | **GPLX** ×4 | TV + wording LX (bồi thường vật chất / thông báo TV) |
| HĐLĐ 12T (Khối LX) | `XEVN_FT_12M_DRIVER` | DRIVER | +12 | GPLX | HĐLĐ + ĐK bồi thường đào tạo + LX |
| HĐLĐ 24T (Khối LX) | `XEVN_FT_24M_DRIVER` | DRIVER | +24 | GPLX | Như trên |
| HĐ KXĐ / KXĐTH LX | `XEVN_INDEF_DRIVER` | DRIVER | KXĐ | GPLX | HĐLĐ KXĐ LX |

**Cơ chế dynamic (RETAIN + siết AC):**

1. **Field form:** theo `template_code` / `pack_code` / `term_type` (đã có O4–O5, O11).  
2. **Điều khoản:** `GET template → default clause_ids` từ Settings composer — **nội dung** khác nhau nhờ thư viện clause đã soạn theo mẫu Excel; FE **không** nhúng đoạn «bồi thường đào tạo».  
3. **Gap vận hành (không bịa):** nếu starter template chưa bind đủ clause khác biệt TV vs 12T → residual **Settings content** (HCNS/composer), không phải invent FE body. SA/Dev chỉ đảm bảo **re-bind khi đổi mẫu** + QA AC-CTR-TPL-DYN-01.

---

## 8. Map AC cũ (RETAIN vs AMEND)

| AC / O cũ | Trạng thái |
|-----------|------------|
| AC-CTR-FIELD-04 / O10 / Q9-C | **AMEND hẹp** — RO mặc định; **bootstrap** khi empty (BR-CTR-CB-BOOT-*) |
| AC-CTR-FIELD-03 (tỉ lệ % trên form) | **RETAIN** — tách với `salary_ratio_percent` hardcode 100 trên snapshot BE (residual SA align — không đổi SoT BH) |
| AC-CTR-XEVN-08 registry-only | **RETAIN** + Q-S4 |
| CORE-02 AC-CORE-CB-* / AuthZ | **RETAIN must_keep** |
| BA-03 workspace / NV-first / clause_ids | **RETAIN** — không đè G4 |

---

## 9. Handoff SA / Dev / QA

### 9.1 SA

- Khóa API: bootstrap = **reuse** `POST …/compensation-packages` (lines `base` + `si_base`); optional orchestration «create context refresh»; **cấm** ADD cột lương SoT trên contracts.
- Chốt `effective_from` bootstrap (= ngày ký HĐ hay `effective_from` HĐ).
- Align `salary_ratio_percent` form (Q5) vs snapshot (hiện 100) — DOC/API riêng nếu cần, **không** gộp vào dual lương BH.

### 9.2 Dev-BE / Dev-FE (sau sponsor Q tối thiểu Q-S1/S2 nếu block)

- FE: trạng thái card RO | bootstrap | masked; validate vi-VN; CTA C&B.  
- BE: đảm bảo `si_base` line tạo được; context trả đúng sau create; overlap-409 khi đã có package.  
- **Không** sửa seal G4 ngoài path card/bootstrap.

### 9.3 QA

- U65: J-HRM-CTR-CB-BOOT-01 · RO-01 · TPL-DYN-01; zero-seed; F5; **cấm** seed C&B để «có số».

---

## 10. Câu hỏi sponsor (tách riêng — không tự bịa)

| ID | Câu hỏi | Vì sao cần | Ảnh hưởng nếu chưa trả lời |
|----|---------|------------|----------------------------|
| **Q-S1** | Khi NV **đã có** gói C&B, có được phép sửa «Lương đóng BH» ngay trên màn HĐ không, hay **bắt buộc** vào Hồ sơ → C&B (revise)? | BA đề xuất **chỉ RO + link C&B** (BR-CTR-CB-EDIT-01) | Có thể mở rộng editable→revise từ HĐ |
| **Q-S2** | «Mức BHXH» **có thể khác** «Mức lương / lương cơ bản» trên cùng NV không (tình huống VN phổ biến)? | Excel có 2 cột nhưng **thiếu dòng số** để chứng minh | Nếu **luôn bằng**: bootstrap có thể 1 ô + copy sang `si_base`; nếu **có thể khác**: bắt buộc 2 ô (đề xuất hiện tại) |
| **Q-S3** | «6 mẫu» là đủ, hay cần đủ **8** starter (TV/12/24/KXĐ × VP/LX) như Excel + catalog X.E? | Lệch đếm sponsor vs matrix sản phẩm | Scope bind clause / QA matrix |
| **Q-S4** | «Chỉ lưu sổ đăng ký» (không mẫu in) có **bắt buộc** đã có lương đóng BH / gói C&B không? | BA đề xuất **không bắt** (AC-CTR-TPL-DYN-03) | Gate Lưu registry |
| **Q-S5** | Ai được nhập mức BHXH lần đầu: chỉ C&B, hay HCNS tạo HĐ cũng được nếu có membership C&B? | AuthZ gate đã có — cần policy tổ chức | Banner / chặn bootstrap |

---

## 11. completion / ack

| Field | Value |
|-------|--------|
| **completion_report** | Đã khóa SoT = `employee_compensation_packages/lines` (`si_base`); HĐ chỉ đọc snapshot (+ freeze in). Đề xuất **P-A bootstrap** trên HĐ khi snapshot rỗng → POST C&B (AMEND hẹp O10). BR/AC/sequence + ma trận 8 mẫu Excel↔`XEVN_*` + delta điều khoản TV≠12T. 5 câu hỏi sponsor. Không sửa `apps/**`. |
| **residual** | Chờ Q-S1..S5; Settings content bind clause đủ khác biệt mẫu; align tỉ lệ % Q5 vs snapshot |
| **next_owner** | **pm** → sau (hoặc song song nếu chấp nhận default P-A): **sa** rồi **dev-be** + **dev-fe** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: SA-CTR-INSURANCE-SALARY-SOURCE-01
role: sa
lane: governance
read_first:
  - docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md (O10/Q9)
  - docs/qa/evidence/pm-audit-contract-cb-salary-not-fillable-01.md
change_mode: ADD
must_keep: employee_compensation_* ONE SoT; contracts_printable_ready=false; no dual salary on employee_contracts; no apps/**; no reopen G4 seals as DONE
task:
  1) Option/F.1 API: bootstrap empty C&B from ContractWorkspace = POST /api/hrm/contracts-insurance/compensation-packages
     with lines base + si_base; refresh GET contract-create-context; DENY contract-table SoT.
  2) Map effective_from bootstrap; error codes (VAL-400 / overlap-409 / CB-AUTHZ-403).
  3) Note salary_ratio_percent Q5 vs snapshot=100 residual (doc only unless sponsor asks).
  4) Unlock D-BE-CTR-CB-BOOT-01 + D-FE-CTR-CB-BOOT-01 with allowed_paths narrow to
     ContractCbReadOnlyCard / create context / compensation create — not full CTR rewrite.
exit_criteria: API_DESIGN delta path + next_dispatch_prompt for dev-be/dev-fe; PASS_TO_PM
honesty: contracts_printable_ready=false · C-SLICE
```

**Parallel FE/BE prompts (sau SA LOCK hoặc sponsor chốt Q-S2 mặc định 2 ô):**

```text
work_item_id: D-FE-CTR-CB-BOOT-01
role: dev-fe
entry: SA-CTR-INSURANCE-SALARY-SOURCE-01 LOCKED · BA-CTR-INSURANCE-SALARY-SOURCE-01 §3–§5
must_keep: AC-CTR-FIELD-04 no allowance «+ Thêm»; printable=false; G4 workspace shell
task: ContractCbReadOnlyCard states RO|bootstrap|masked; vi-VN money; CTA C&B; wire POST packages then refresh context; template change still BR-CTR-CREATE-02
exit: READY_FOR_QA · evidence docs/qa/evidence/d-fe-ctr-cb-boot-01.md · J-HRM-CTR-CB-BOOT-01
```

```text
work_item_id: D-BE-CTR-CB-BOOT-01
role: dev-be
entry: same SA LOCK
must_keep: CORE-02 packages SoT; CB AuthZ; no employee_contracts insurance salary column as SoT
task: Ensure createPackage accepts si_base line; create-context returns insurance_salary_vnd; optional contract_id soft-link on bootstrap; tests jest; DENY Nest /core dual
exit: READY_FOR_QA · evidence docs/qa/evidence/d-be-ctr-cb-boot-01.md
```
