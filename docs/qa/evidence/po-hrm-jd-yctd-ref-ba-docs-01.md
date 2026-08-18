# Evidence — PO-HRM-JD-YCTD-REF-BA-DOCS-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-JD-YCTD-REF-BA-DOCS-01` |
| role | ba-docs |
| lane | governance |
| change_mode | ADD-only · NO CODE `apps/**` |
| date | 2026-08-06 |
| source_delta | `docs/program/specs/PO-HRM-JD-YCTD-REF-SPEC-01.md` §C |
| SoT khách | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` |
| version | **0.9 → 0.10** (DOC-DELTA header + §6.2) |
| ack_status | **PASS_TO_PM** |

---

## 1. Sections touched

| Section | Action |
|---------|--------|
| Header table · Phiên bản | Bump **0.10** + DOC-DELTA note (YCTD ↔ Thư viện JD trên REC-02/02b) |
| `### FR-UC-BP-REC-02` | ADD-only enrich: Dữ liệu «Tham chiếu JD master»; Luồng chính; BR; Trường hợp đặc biệt; sequenceDiagram; Diễn biến 1a–1d + Thành công FE |
| `### FR-UC-BP-REC-02b` | Cùng depth JD (1a–1d, empty/Ngừng/preview/sau lưu); giữ nhánh duyệt ngoài ĐB / BGĐ |
| §6.2 Nhật ký phiên bản | ADD rows **0.9** (backfill) + **0.10**; footer → v0.10 |
| `### FR-UC-BP-REC-03` | **Không mở** — vẫn OUT/GĐ2 |

---

## 2. Before / after cite

### 2.1 FR-UC-BP-REC-02 — Diễn biến (before)

| # | Tương tác | … |
|---|-----------|---|
| 1 | Chọn ô Cần tuyển | Form YCTD trong kế hoạch |
| 2 | Gửi duyệt | Ma trận rút gọn |
| 3–5 | Duyệt / Từ chối / Policy BGĐ | … |
| Thành công | — | YCTD sẵn sàng nhận hồ sơ |

**Gap:** không có empty thư viện · chặn JD Ngừng · preview · AC FE sau lưu.

### 2.2 FR-UC-BP-REC-02 — Diễn biến (after · ADD)

| # | Tương tác | Kết quả chính |
|---|-----------|---------------|
| 1 | Chọn ô Cần tuyển | Form trong kế hoạch *(giữ)* |
| **1a** | Mở danh sách JD | Chỉ JD **Hiệu lực** |
| **1b** | Thư viện trống | Empty + hướng mở Thư viện; không lưu thiếu tham chiếu |
| **1c** | Chọn JD | Gắn mã + **xem trước** mô tả |
| **1d** | Thử JD Ngừng | Chặn (BR-BP-JD-01) |
| 2–5 | Gửi / duyệt / từ chối / BGĐ | *(giữ + bổ sung JD khi bắt buộc)* |
| Thành công | — | List kèm tham chiếu JD; **tải lại còn** |

### 2.3 FR-UC-BP-REC-02b

- **Before:** Diễn biến 1–5 tập trung ngoài ĐB / BGĐ; trường JD chỉ «Thư viện mô tả công việc».
- **After:** Cùng hàng **1a–1d** + empty/Ngừng/preview/sau lưu; sequenceDiagram thêm Thư viện JD; BR pointer BR-BP-JD-01 · BR-YCTD-JD-REF-01/02.

### 2.4 Version

- Header: `**0.9**` → `**0.10**` + DOC-DELTA YCTD tham chiếu JD.
- §6.2: thêm 0.9 (catalog JD) + 0.10 (YCTD ref).

---

## 3. Quality locks

| Lock | Status |
|------|--------|
| no wipe stub REC-02/02b/00* | PASS — chỉ mở rộng mục hiện có |
| no_prompt_echo | PASS — không work_item / chat slang / path code trong thân FR |
| REC-03 / tin đăng / job_postings SoT MVP | PASS — không mở; ghi OUT trong nhật ký 0.10 |
| Failure-first balance | PASS — happy ≥40% (1,1a,1c,2,3/4,Thành công); fail sâu ≥30% (1b,1d,4/5 + bảng đặc biệt); không thêm nhánh auth |
| `apps/**` | PASS — không đụng |

---

## 4. Completion / handoff

| Field | Value |
|-------|--------|
| completion_report | Merged SPEC-01 §C ADD into enterprise SRS v0.10 trên FR-UC-BP-REC-02 · 02b. REC-03 untouched OUT. No apps/**. |
| next_owner | **sa** |
| next_dispatch_prompt | (xem §5) |
| ack_status | **PASS_TO_PM** |

---

## 5. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-YCTD-REF-TECHSPEC-01
role: sa
lane: governance
change_mode: ADD · NO CODE apps/**

entry_criteria:
- SRS khách v0.10: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md
  FR-UC-BP-REC-02 · 02b Diễn biến 1a–1d (empty library · JD Ngừng · preview · FE sau lưu)
- Arch lock F-YCTD-JD: soft FK job_template_id; FORBIDDEN dual-write job_postings
- evidence ba-docs: docs/qa/evidence/po-hrm-jd-yctd-ref-ba-docs-01.md

task:
1. TechSpec depth F-YCTD-JD — map bước Diễn biến 1a–1d
2. Status gate: chỉ JD Hiệu lực khi bind YCTD mới; mã lỗi ổn định khi Ngừng
3. Preview: contract đọc tiêu đề + mô tả ngắn từ template/snapshot (không biến YCTD thành SoT động values_json)
4. must_keep soft FK; REC-03 / job_postings vẫn OUT MVP
5. Cascade plan: TechSpec → DB_DESIGN → API_DESIGN trước mọi Dev apps/**
6. evidence_path + PASS_TO_PM

cấm: Dev apps/** · claim jd_dynamic_done · mở tin đăng GĐ2
```
