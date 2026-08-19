# PO — Ma trận quy trình + danh mục XBOS→HRM (enterprise logistics)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-WF-CAT-MATRIX-01` |
| **Date** | 2026-08-03 |
| **Owner** | PM + PO |
| **Sponsor ask** | Viết đủ TC: tạo quy trình XBOS · bộ quy trình HRM enterprise · khai ở XBOS · danh mục chuẩn tập đoàn + áp từng CT thành viên · chia case theo công ty XeVN · nghiên cứu logistics |
| **Status** | Design matrix **SYNTHED** (`PO-ECO-TC-SYNTH-WF-CAT-01`) — taxonomy + company + LOCK + 3 TC packs; **browser U78 / UAT chưa** |
| **Locks** | U65 · U76 · U83 · **U84** (matrix này) |

---

## 1. AS-IS (đã viết TC catalog — chưa = nghiệm thu UAT)

| Pack | Nội dung | TC | Gap vs sponsor |
|------|----------|---:|----------------|
| `XBOS-WF-DESIGNER.md` | Tạo/sửa/lưu canvas WF (UF-XBOS-08 Bước 1) | 30 | **Chưa** phủ từng loại nghiệp vụ logistics × từng CT |
| `XBOS-INBOX-CAT.md` | Inbox duyệt + catalog gov + extension | 32 | Duyệt generic; **chưa** matrix process-type |
| `XBOS-CATALOG-CC.md` | Autosave doc/measure/price @ holding | 28 | **Không** = danh mục nhân sự HRM (chức danh/PB/loại nghỉ…) |
| HRM-SETTINGS (+ catalogs) | Sync/pull phía HRM | 76 | **Chưa** ma trận apply-to-members × CT |
| Spine leave/recruit bridges | `hrm_leave_*` · `hrm_recruitment_*` | trong spine 53 | Có code bridge; TC depth **chưa** phân bổ đa CT |

**Kết luận thẳng:** Đã có TC **cách tạo/duyệt** WF + **một phần** catalog — **chưa** đủ «1 HRM enterprise = bao nhiêu quy trình» và «chia đều cho từng công ty trong dữ liệu XeVN».

---

## 2. Cách tạo quy trình (SoT — FE XBOS)

```text
Login Group CEO → Command Center → Cài đặt → Hệ thống quy trình
 → Tạo / chọn template → thiết kế bước (L1/L2…) → Lưu định nghĩa
 → (nghiệp vụ) phát sinh task từ FE HRM/Mobile
 → Inbox XBOS / ManagerApprovals → Duyệt/Từ chối
```

| Bước | Actor | Surface | Spec |
|------|-------|---------|------|
| Định nghĩa WF | Group / config | `?settings=workflow` | UC-XBOS-13 · FR-XBOS-WF-01 · pack `XBOS-WF-DESIGNER` |
| Publish catalog / apply member | Group | `hrm_catalog_governance` · `hrm_catalog_apply_members` | UC-XBOS-09/15 · FR-XBOS-CTRL-* |
| Pull / dùng catalog | HRM tenant | Settings catalogs | UC-HRM-06..08 |
| Chạy instance | NV / QL | HRM web · Mobile · Inbox | Leave/Rec bridges · UF-XBOS-08 |

**U65:** Instance inbox phải đến từ FE (Tạo WF / gửi đơn), **không** seed inbox để PASS.

---

## 3. Bộ quy trình HRM enterprise (logistics) — taxonomy P0

Nghiên cứu đối chiếu MISA / Workday-lite / vận hành logistics VN (tuyển tài xế–kho–văn phòng, nghỉ ca, điều chuyển, thử việc, nghỉ việc):

| `process_id` | Tên VI | Domain | XBOS WF code (hiện/có) | Priority |
|--------------|--------|--------|------------------------|----------|
| **P-REC-PLAN** | Duyệt kế hoạch tuyển | Tuyển dụng | `hrm_recruitment_plan_approval` | P0 |
| **P-REC-REQ** | Duyệt yêu cầu tuyển (YCTD) | Tuyển dụng | `hrm_requisition_approval` | P0 |
| **P-REC-PIPE** | Pipeline ứng viên / offer | Tuyển dụng | `hrm_candidate_pipeline` | P0 |
| **P-LEAVE** | Duyệt nghỉ phép (L1→L2) | Chấm công | `hrm_leave_approval` / `hrm_leave` | P0 |
| **P-ATT-ADJ** | Điều chỉnh CC / đi muộn | Chấm công | *(bridge att-req — confirm code)* | P0 |
| **P-OT** | Duyệt tăng ca | Chấm công | **CANDIDATE** (gap nếu chưa def) | P1 |
| **P-CONTRACT** | Gia hạn / ký HĐ | Hợp đồng | **CANDIDATE** | P1 |
| **P-PROBATION** | Công nhận hết thử việc | Nhân sự | **CANDIDATE** | P1 |
| **P-TRANSFER** | Điều chuyển / kiêm nhiệm | Nhân sự | **CANDIDATE** | P1 |
| **P-DISCIPLINE** | Kỷ luật | Nhân sự | **CANDIDATE** | P2 |
| **P-TRAIN** | Đào tạo / chứng chỉ lái | Logistics | **CANDIDATE** | P1 |
| **P-EXIT** | Nghỉ việc / offboarding | Nhân sự | **CANDIDATE** | P1 |
| **P-PAY-EX** | Ngoại lệ lương / tạm ứng | Lương | **CANDIDATE** | P2 |
| **P-CAT-EXT** | Duyệt mở rộng danh mục member | Catalog | `wf_hrm_catalog_extension_*` | P0 |

**Enterprise count (P0+P1 tối thiểu nghiệm thu matrix):** **14** process families · mỗi family ≥ **create-def (XBOS)** + **instance (HRM/Mobile)** + **approve** TC.

---

## 4. Công ty trong dữ liệu XeVN (gán case)

| `co_key` | Tên | Tenant / slug | Vai trò trong matrix |
|----------|-----|---------------|----------------------|
| **CO-HOLD** | Tập đoàn XeVN | `xevn` / `holding` | SoT catalog + WF template tập đoàn |
| **CO-TMDV** | CP TM-DV X.E | `xe-tmdv` · op `trsport` | Tuyển **tài xế / vận hành** nặng (P-REC-* · P-TRAIN · P-OT) |
| **CO-VISUN** | Du lịch Visun | `visun` · op `logistics` | Tuyển **HDV / điều hành tour** · P-LEAVE đa loại |
| **CO-DL** | Du lịch X.E VN | `xe-du-lich` | P-LEAVE ladder + catalog extension member (đã có seed path lịch sử — U65 FE) |
| **CO-VN** | X.E Việt Nam | `xe-vietnam` | P-CONTRACT · P-PROBATION · P-TRANSFER văn phòng |

SoT scope: `docs/qa/PILOT_SCOPE_DATA_MATRIX.md` · `hrm-company-slug-map.mjs`.

---

## 5. Ma trận gán (để «nhiều case nhất»)

| process_id | CO-HOLD | CO-TMDV | CO-VISUN | CO-DL | CO-VN | Ghi chú coverage |
|------------|---------|---------|----------|-------|-------|------------------|
| P-REC-PLAN | Template publish | **Primary execute** | Secondary | — | Spot | Logistics hiring plan |
| P-REC-REQ | Template | **Primary** (tài xế) | **Primary** (HDV) | Spot | Spot | 2 persona tuyển khác nhau |
| P-REC-PIPE | — | Primary | Spot | — | — | Offer/hire link |
| P-LEAVE | Template L1/L2 | Spot | Spot | **Primary L1→L2** | Spot | Ladder HOLD T_L1 ghi SPEC_GAP |
| P-ATT-ADJ | Template | **Primary** | Spot | Spot | — | Ca / đi muộn |
| P-OT | Template | **Primary** | — | — | Spot | Logistics OT |
| P-CONTRACT | Template | Spot | — | — | **Primary** | HĐ văn phòng |
| P-PROBATION | Template | Spot | Spot | — | **Primary** | |
| P-TRANSFER | Template | Spot | — | Spot | **Primary** | Kiêm nhiệm |
| P-TRAIN | Template | **Primary** (GPLX/chứng chỉ) | Spot | — | — | |
| P-EXIT | Template | Spot | Spot | Spot | **Primary** | |
| P-PAY-EX | Template | Spot | — | — | Spot | P2 |
| P-DISCIPLINE | Template | Spot | Spot | — | Spot | P2 |
| P-CAT-EXT | Approve gov | Apply pull | Apply pull | **Extension FE** | Apply pull | Catalog đa CT |

**Catalog HRM keys (XBOS SoT → apply-to-members → HRM pull)** — mỗi key × CO-HOLD publish + ≥2 member apply:

`job_titles` · `departments` · `leave_types` · `contract_types` · `positions` · (P0 từ BA_ERP_XBOS_CTRL)

---

## 6. Artifact TC bắt buộc (wave mới)

| WI | Deliverable | Owner |
|----|-------------|-------|
| `PO-WF-CAT-TAXONOMY-01` | Chốt taxonomy + map code AS-IS/GAP (BA-P) | ba-process |
| `PO-WF-CAT-COMPANY-MATRIX-01` | File ma trận process×company×catalog key + AC (BA-D + BA-P) | ba-data / ba-process |
| `PO-ECO-TC-XBOS-WF-MATRIX-01` | Pack TC: tạo từng P-* trên WF designer @ HOLDING | qa |
| `PO-ECO-TC-XBOS-CAT-MEMBER-01` | Pack TC: publish + apply-to-members × CO-* | qa |
| `PO-ECO-TC-HRM-WF-INSTANCE-MATRIX-01` | Pack TC: instance/approve theo ô Primary trong §5 | qa |
| `PO-ECO-TC-SYNTH-WF-CAT-01` | Dedupe vs WF-DESIGNER / INBOX-CAT / SETTINGS | qa |

Template vẫn: `_TEMPLATE_MENU_TC_PACK.md` + cột thêm `process_id` · `co_key` · `catalog_key`.

---

## 7. DoD «đủ» theo sponsor

1. Mỗi `process_id` P0 có ≥1 TC **tạo định nghĩa** trên XBOS (FE).  
2. Mỗi CT member có ≥3 process Primary/Spot khác nhau (bảng §5).  
3. Mỗi catalog key P0: HOLDING publish → apply ≥1 member → HRM pull thấy item (F5).  
4. Inbox/approve TC **không** dùng seed.  
5. Gap code (CANDIDATE) = **SPEC_GAP** row + BA/SA — không bịa WF code.  
6. **Không** claim UAT DONE khi mới xong catalog matrix.

---

## 8. Liên kết

- Pack hiện có: `docs/qa/testcases/xbos/XBOS-WF-DESIGNER.md` · `XBOS-INBOX-CAT.md` · `XBOS-CATALOG-CC.md`
- Status depth: `PO_ECOSYSTEM_TC_DEPTH_STATUS.md`
- Competitive/vision: `PO_HRM_COMPETITIVE_CAPABILITY_MAP.md` · `PO_ENTERPRISE_HRM_PRODUCT_VISION.md`

---

*PO-WF-CAT-MATRIX-01*
