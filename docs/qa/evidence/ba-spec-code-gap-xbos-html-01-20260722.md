# BA-SPEC-CODE-GAP-XBOS-HTML-01 — Sample audit SRS FR vs OS §3.4.2

| Field | Value |
|-------|--------|
| work_item_id | **BA-SPEC-CODE-GAP-XBOS-HTML-01** |
| role | ba-docs (research) |
| date | 2026-07-22 |
| deploy | **Cấm** — không deploy |
| ack_status | **PASS_TO_PM** |

## 1. Scope & SoT đọc

| Artifact | Path | Ghi chú |
|----------|------|---------|
| SRS khách XBOS (sample) | `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` | **16 FR** (W1+W2); SoT khách MD |
| HTML ecosystem (tham chiếu) | `docs/client-delivery/02_SRS_XeVN_OS.html` | 373 FR generator — **không** phải bản XBOS slice |
| Chuẩn dự án | `docs/standards/BRD_SRS_WRITING_STANDARDS.md` | Drift UNICOM vs shell XeVN |
| Shell HTML thực tế | `scripts/lib/doc-tscair-shell.mjs` | Footer `XeVN Group`; logo alt XeVN; mã `XEVN/BRD-*` / `XEVN/SRS-*` |
| OS gate | `_vibe-team-os/13-…` §3.4.2 + KB `client-delivery-brd-srs` | Diễn biến: **auth ≤2**; **happy ≥40%**; **fail domain ≥30%** (tham chiếu bảng ~10 dòng) |
| Register | `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` §5 | Append G-SPEC-XBOS-* |

**HTML XBOS riêng:** chưa có `docs/client-delivery/xbos/*.html` — audit áp dụng **MD khách** (đúng SoT W1/W2). Gap packaging HTML = residual P2 (không chặn research này).

## 2. Phương pháp chấm §3.4.2

Trên bảng **Diễn biến nghiệp vụ** mỗi FR:

| Nhãn | Định nghĩa vận hành |
|------|---------------------|
| **AUTH** | Hết phiên / thiếu đăng nhập / «không đủ quyền cấu hình» thuần auth — **gom ≤2 dòng** |
| **HAPPY** | Bước thành công luồng chính (mở form, lưu OK, tải lại còn, khóa kết quả…) |
| **FAIL_DOMAIN** | Thất bại nghiệp vụ sâu: thiếu trường, trùng cấm, thiếu bước canvas, ràng buộc xóa, hộp thư trống sau tạo, ký tự RACI lạ, định dạng ô… — **không** chỉ «hết phiên» |
| **PASS FR** | auth≤2 **và** happy≥40% **và** fail_domain≥30% |
| **BORDER** | fail_domain 25–29% hoặc happy sát ngưỡng |
| **FAIL** | auth>2 **hoặc** fail_domain≪30% **hoặc** happy≪40% |

UC đăng nhập (AUTH-01): fail credential/khóa tài khoản = FAIL_DOMAIN của chính UC đó (không phạt «auth-heavy» kiểu UC nghiệp vụ khác).

## 3. Bảng sample 16/16 FR

| FR | Rows | AUTH | HAPPY% | FAIL_DOM% | Verdict §3.4.2 | Ghi chú ngắn |
|----|------|------|--------|-----------|----------------|--------------|
| FR-XBOS-AUTH-01 | 8 | 0–1* | ~50% | ~38% | **PASS** (UC auth) | Fail = thiếu field / sai MK / khóa TK |
| FR-XBOS-TENANT-01 | 7 | 1 | 57% | 29% | **BORDER** | Empty + tư cách lạ; thiếu fail «đổi tư cách giữa mutate» |
| FR-ECO-SCOPE-02 | 7 | 1 | 57% | 29% | **BORDER** | Scope fail là domain; thiếu case «đổi im lặng» / 409 UX |
| FR-XBOS-ORG-01 | 8 | 1 | 75% | **13%** | **FAIL** | Gần chỉ empty + id lạ; thiếu fail lọc/phân trang/deep-link |
| FR-XBOS-ORG-03 | 9 | 1 | 67% | **22%** | **FAIL** | Có upload lỗi; thiếu MST trùng / vốn âm / PDF corrupt chi tiết |
| FR-CC-P0-01 | 7 | 1 | 57% | 29% | **BORDER** | Thiếu tổng tỷ lệ >100%, cổ đông trùng tên chính sách |
| FR-XBOS-ORG-02 | 7 | 1 | 57% | 29% | **BORDER** | Có xóa ràng buộc; thiếu vòng lặp cha–con / trùng tên |
| FR-XBOS-WF-01 | 7 | 1 | 57% | 29% | **BORDER** | Thiếu nhánh reject dashed / vòng lặp nối |
| FR-XBOS-WF-03 | 6 | 1 | 50% | **33%** | **PASS** | Hộp thư trống sau tạo = deep fail tốt |
| FR-XBOS-WF-04 | 7 | 1 | 57% | 29% | **BORDER** | Từ chối bước = «đợt sau» — **unclear** |
| FR-XBOS-CAT-02 | 7 | 1 | 43% | **43%** | **PASS** | Trùng + thiếu quy trình duyệt = deep tốt |
| FR-XBOS-CAT-05 | 8 | 1 | 63% | 25% | **BORDER** | Có tiêu thụ HR; thiếu reject bước / bán duyệt |
| FR-XBOS-RACI-02 | 8 | 2 | 63% | **13%** | **FAIL** | Chỉ 1 fail ký tự lạ; thiếu lan sang pháp nhân B như dòng fail đo được |
| FR-CC-P0-04 | 7 | **2** | 71% | **0%** | **FAIL** | **Auth-heavy / shallow** — không fail domain (xung đột quyền, mất checkbox) |
| FR-CC-P0-05 | 7 | 2 | 57% | **14%** | **FAIL** | Một fail định dạng; thiếu race autosave / mất phiên bản |
| FR-XBOS-KPI-03 | 7 | 1 | 57% | 29% | **BORDER** | Member rollup = domain; thiếu kỳ lọc sai / storm reload |

\*AUTH-01: không đếm credential fail vào quota «auth ≤2» của UC nghiệp vụ khác.

### Tóm tắt tỷ lệ

| Verdict | Số FR | % sample |
|---------|-------|----------|
| PASS | 3 | 19% |
| BORDER | 8 | 50% |
| FAIL | 5 | 31% |

**Kết luận mẫu:** XBOS spine **có cấu trúc 7 mục FR** (PASS skeleton Bateco) nhưng **chưa đạt gate cân bằng Diễn biến §3.4.2** trên đa số FR mutate/read — pattern lặp: dòng #1 `(Auth)` + 1–2 validation nhẹ + happy/F5, **thiếu ≥30% fail nghiệp vụ sâu**.

## 4. FR unclear / mơ hồ (list)

| ID | FR | Vấn đề unclear | Severity |
|----|-----|----------------|----------|
| U-01 | **FR-CC-P0-04** | Diễn biến không có fail domain; «theo chính sách hệ thống» không đo được; không mô tả xung đột checkbox / ghi đè nhầm chức danh như nhánh lỗi | P0 |
| U-02 | **FR-XBOS-ORG-01** | «Chọn id lạ» không gắn thao tác UI thực (deep link? gõ URL?); fail_domain quá mỏng | P1 |
| U-03 | **FR-XBOS-RACI-02** | Quy tắc «không lan pháp nhân B» chỉ ở prose — **không** thành dòng Diễn biến fail/assert đo được | P1 |
| U-04 | **FR-XBOS-WF-04** | Nhánh từ chối bước = «đợt sau» — AC/Diễn biến thiếu | P1 |
| U-05 | **FR-CC-P0-01** | «Mở khóa tiếp… ngoài W1 chi tiết» — mơ hồ khóa nghiệp vụ sau lưu cổ đông | P2 |
| U-06 | **FR-CC-P0-05** | Autosave vs «phát hành phiên bản» — ranh giới AC còn mơ hồ cho QA (khi nào không được dùng nút phát hành) | P1 |
| U-07 | Nhiều FR | Dòng `(Auth/phạm vi)` **gom** hết phiên + ngoài đơn vị → khó đếm auth≤2 vs scope domain | P2 process |
| U-08 | Packaging | Không có HTML XBOS slice; risk lệch khi chỉ gửi `02_SRS_XeVN_OS.html` 373 FR (generator) thay MD W1/W2 | P2 |

## 5. Standards MD — UNICOM drift

| Vị trí `BRD_SRS_WRITING_STANDARDS.md` | Nội dung cũ (drift) | Sự thật shell/build |
|--------------------------------------|---------------------|---------------------|
| §2 Cover footer | `UNICOM TECHNOLOGY SOLUTIONS CO., LTD` | `XeVN Group` (`doc-tscair-shell.mjs`) |
| §9 checklist | «logo UNICOM», mã `UNICOM/BRD-*` / `UNICOM/SRS-*` | Logo `docs/client-delivery/assets/xevn-logo.png`; mã `XEVN/BRD-XEVN-OS-001` / `XEVN/SRS-XEVN-OS-001` |
| §2 logo-wrap | Đã ghi `xevn-logo.png` (đúng) | Đồng bộ với shell |

**Fix đã làm (docs-only, optional wave):** cập nhật footer + checklist §9 → XeVN / `XEVN/*` / logo XeVN. Không rebuild HTML trong work item này.

## 6. Register §5 — rows append

| ID | Artifact | § / FR | Vấn đề | Severity |
|----|----------|--------|--------|----------|
| **G-SPEC-XBOS-01** | `SRS_XBOS_KHACH.md` | FR-CC-P0-04 Diễn biến | Auth-heavy / **0% fail domain** — FAIL §3.4.2 | P0 |
| **G-SPEC-XBOS-02** | same | FR-XBOS-ORG-01, FR-XBOS-RACI-02, FR-CC-P0-05, FR-XBOS-ORG-03 | FAIL_DOM ≪30% (shallow) | P1 |
| **G-SPEC-XBOS-03** | same | 8 FR BORDER (~29%) | Cần thêm ≥1 deep fail đo được / FR | P1 |
| **G-SPEC-XBOS-04** | `BRD_SRS_WRITING_STANDARDS.md` | Cover/checklist | UNICOM footer & doc-code drift vs XeVN shell | P2 *(patched 2026-07-22)* |
| **G-SPEC-XBOS-05** | client-delivery XBOS | HTML slice | Chưa có HTML XBOS từ MD W1/W2 | P2 |

## 7. Handoff

```yaml
work_item_id: BA-SPEC-CODE-GAP-XBOS-HTML-01
from_role: ba-docs
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-spec-code-gap-xbos-html-01-20260722.md
completion_report: >
  Sample 16/16 FR XBOS khách vs OS §3.4.2: PASS 3 / BORDER 8 / FAIL 5.
  Unclear list U-01..U-08; register G-SPEC-XBOS-01..05.
  Standards UNICOM→XeVN logo/footer/doc-code patched (docs only). No deploy. No HTML rebuild.
next_owner: pm
next_dispatch_prompt: >
  ba-process BA-XBOS-DIENBIEN-DEEPFAIL-01 — remaster Diễn biến FAIL/BORDER FRs
  (ưu tiên FR-CC-P0-04, ORG-01, RACI-02, CC-P0-05): auth≤2, happy≥40%, fail_domain≥30%;
  tách dòng Auth vs phạm vi; bổ sung nhánh từ chối WF-04.
  Optional ba-docs: generator HTML XBOS slice từ SRS_XBOS_KHACH.md (P2).
pm_dispatch_hint: G-SPEC-XBOS-01 P0 → ba-process remaster FR-CC-P0-04 first
```

**Cấm:** seed · deploy · claim Phase 1 / PROD · sửa `apps/**`.
