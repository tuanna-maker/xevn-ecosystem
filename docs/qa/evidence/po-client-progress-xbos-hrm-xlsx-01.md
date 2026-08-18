# Evidence — PO-CLIENT-PROGRESS-XBOS-HRM-XLSX-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-CLIENT-PROGRESS-XBOS-HRM-XLSX-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **ack_status** | **PASS_TO_PM** |

---

## completion_report

Đã tạo **2 file Excel khách** (schema đồng nhất 3 sheet) + generator tái tạo được.

| File | Path |
|------|------|
| XBOS | `docs/client-delivery/progress/BAO_CAO_TIEN_DO_XBOS_2026-08-05.xlsx` |
| HRM | `docs/client-delivery/progress/BAO_CAO_TIEN_DO_HRM_2026-08-05.xlsx` |
| Team README | `docs/client-delivery/progress/README_PROGRESS_2026-08-05.md` |
| Generator | `scripts/client-delivery/build-progress-xlsx.mjs` |
| Rebuild | `pnpm docs:progress:xlsx` |

### Sheet schema (cả 2 file)

1. `Tong_quan` — Module · Số UC · Hoàn thành · Đang làm · Chưa làm / Chờ · % hoàn thành · Ghi chú  
2. `Chi_tiet_UC` — STT · Module · Mã UC · Tên · SRS ref · Ưu tiên · Trạng thái · % UC · Ghi chú  
3. `Chu_thich` — quy ước trạng thái + ngày `2026-08-05` + disclaimer khóa claim  

Trạng thái chỉ dùng: `Hoàn thành` · `Đang làm` · `Chưa làm` · `Chấp nhận tạm (P1)` · `Chờ quyết định`.

### Số liệu tổng hợp

| Sản phẩm | Tổng UC | Hoàn thành | Đang làm* | Chưa/Chờ | % hoàn thành |
|----------|--------:|-----------:|----------:|---------:|-------------:|
| **XBOS** | 126 | 54 | 72 | 0 | **42.9%** |
| **HRM** | 167 | 43 | 100 | 24 | **25.7%** |

\*Cột Đang làm trên `Tong_quan` = `Đang làm` + `Chấp nhận tạm (P1)` để 3 cột đếm = Số UC. Chi tiết P1 xem `Chi_tiet_UC` / README team.

**Parse SoT:** Phase1 matrix **246** dòng · XBOS khối A+B **126** · HRM Phase1 **120** · Blueprint UC-BP **47** · HRM chi tiết gộp **167**.

### Module — XBOS (% = Hoàn thành / Số UC)

| Module | Done/Total | % |
|--------|----------:|--:|
| Auth / Cổng Portal | 7/9 | 77.8 |
| Tổ chức / Pháp nhân | 11/20 | 55.0 |
| Danh mục (Catalog) | 10/45 | 22.2 |
| Danh mục Logistic | 0/22 | 0 |
| Quy trình (Workflow) | 10/11 | 90.9 |
| KPI / Command Center | 8/10 | 80.0 |
| RACI / Phân quyền | 8/8 | 100 |
| Cấu hình / Hệ thống | 0/1 | 0 |

### Module — HRM

| Module | Done/Total | % |
|--------|----------:|--:|
| Nhân sự | 19/35 | 54.3 |
| Chấm công | 5/18 | 27.8 |
| Nghỉ phép | 0/12 | 0 |
| Lương | 2/16 | 12.5 |
| Tuyển dụng | 5/18 | 27.8 |
| Mobile | 0/15 | 0 |
| Metadata / Đồng bộ danh mục | 12/33 | 36.4 |
| Quyết định / Khác | 0/20 | 0 |

### SoT đã đọc (không đoán)

- `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md`
- `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` (UF-XBOS-* 🟢; UF-HRM web 🟢)
- `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md` (47 UC-BP)
- `docs/program/SERVICE_READINESS_UAT_PRODUCTION.md` (UAT GWC · không PROD-READY)
- ATT-SIGN QC R2 GO lane UF only — `po-hrm-bp-att-sign-qc-01-r2.md`
- M2 ATT / M3 EMP honesty GWC · W4 MOB-A GWC · `face_live=false` · `remaster_program_done=false`

### Locks (Excel `Chu_thich` + team)

- Không claim Phase 1 DONE  
- Không claim remaster_program_done  
- Không claim Face LIVE  
- Không claim Attendance module CLOSED  

### no_prompt_echo

Excel khách: tiếng Việt; không work_item / seed / sponsor lock / path agent trong cột tên UC. SRS ref được phép path docs ngắn.

### Spot-check

- 2 file `.xlsx` tồn tại; sheet names đúng 3; tập trạng thái hợp lệ trên `Chi_tiet_UC`.  
- Tong_quan: `done + wip + todoHold = total` (XBOS 126, HRM 167).

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-CLIENT-PROGRESS-XBOS-HRM-XLSX-QC-01
role: qc
entry: Excel khách đã gen — docs/client-delivery/progress/BAO_CAO_TIEN_DO_*_2026-08-05.xlsx
exit: spot-check schema 3 sheet; trạng thái ∈ 5 giá trị chuẩn; disclaimer Chu_thich có khóa Phase1/remaster/face/ATT CLOSED; không meta team trong Excel; GO/GWC hoặc FAIL list
evidence_path: docs/qa/evidence/po-client-progress-xbos-hrm-xlsx-qc-01.md
cấm: claim Phase1 DONE · remaster DONE · face_live · Attendance CLOSED
```

## ack_status

**PASS_TO_PM**
