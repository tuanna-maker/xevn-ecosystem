# PO-HRM-SETTINGS-IA-UX-REMasters — Cài đặt HRM: tách màn · đồng bộ UI (AMIS-style)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01` |
| **Ngày** | 2026-08-10 |
| **Sponsor** | Yêu cầu tách bạch nghiệp vụ · không gộp một tab · list + search mã/tên + popup thêm/sửa · nav dọc nhóm (AMIS HRM) |
| **SRS** | FR-UC-BP-CORE-09a · 09d · FR-UC-BP-PLT-01 · FR-HRM-SC-* (Settings catalog) |
| **Trạng thái** | **W1 DONE** + **density W1.5 DONE** (embed padding · `settings-page` · nav compact) · **W3 IN FLIGHT** (cuốn chiếu · mẫu = Loại phép) |

---

## 1. Vấn đề hiện trạng (AS-IS)

| # | Triệu chứng | Nguyên nhân |
|---|-------------|-------------|
| 1 | ~25 `TabsTrigger` ngang, icon ẩn trên mobile | Một `TabsList` gom tài khoản + 14 catalog PLT + HĐ + ATT/EMP/SI |
| 2 | Tab **Điều khoản HĐ** = clause form + list + DnD mẫu + CFG số HĐ + phát hành tập đoàn + MergeToken | Gộp FR-09a + 09d + publish + PLT-TOK |
| 3 | Catalog EMP/ATT inline form trên list, không popup | Pattern cũ wave PLT-01 |
| 4 | Master-data vs catalogs vs PLT tab trùng vai “danh mục” | Nhiều wave ADD tab không IA tổng |

---

## 2. Nguyên tắc TO-BE (đồng bộ toàn Cài đặt)

### 2.1. Một màn = một nghiệp vụ quản trị

Không gộp create form dài + DnD composer + publish holding trên cùng scroll.

### 2.2. Pattern UI chuẩn (Settings Catalog Screen)

Mọi màn danh mục / thư viện dùng **cùng khung**:

| Vùng | Thành phần |
|------|------------|
| **Header** | Tiêu đề (h-10 trục) · mô tả 1 dòng · nút **Làm mới** |
| **Toolbar** | Ô **Tìm theo mã hoặc tên** · (tuỳ chọn) lọc nhóm/trạng thái · **+ Thêm mới** |
| **Body** | Bảng danh sách (sort mặc định mã) · empty state U65 |
| **Mutate** | **Dialog/Sheet popup** thêm/sửa — không form cố định chiếm nửa màn |
| **Hàng động** | Sửa · Hiệu lực/Ngừng · (không xóa cứng) |

Tham chiếu code: `SettingsCatalogScreenShell.tsx` · mẫu đích `EmpDocumentTypeSettingsPanel` (sẽ nâng lên popup W3).

### 2.3. Điều hướng (AMIS HRM–like)

- **Cột trái cố định** (~240px): nhóm nghiệp vụ + mục con.
- **Cột phải**: nội dung một màn duy nhất.
- Deep link: `/hr/settings?tab=<id>` (giữ query hiện có).
- Tab cũ `contract-legal` → alias `contract-clauses` (redirect).

### 2.4. Select trong Dialog (embed Command Center)

| Bối cảnh | Portal Select | AC |
|----------|---------------|-----|
| Filter / toolbar **ngoài** Dialog trên trang Settings | `SelectContent portalScope="iframe"` (DEF-CTR-SETTINGS-SELECT-EMBED-01) | Dropdown hiện, click được trên chrome embed |
| Select **bên trong** Dialog thêm/sửa catalog | **`SettingsDialogSelectContent`** (= `portalScope="parent"`, z ≥ `HRM_PORTAL_FLOATING_Z`) | Mở «Nhóm» → option **nằm trên** popup, không lọt dưới overlay |
| Cấm | `portalScope="iframe"` trong Dialog | z-50 iframe < dialog z-[100000] parent → option “ẩn dưới popup” |

Work item hotfix: `DEF-SETTINGS-SELECT-IN-DIALOG-EMBED-01` · evidence `docs/qa/evidence/po-hrm-settings-select-in-dialog-embed-01.md`

### 2.5. Mật độ màn (sponsor 2026-08-10 — MUST_KEEP)

- Embed `/settings`: `AppLayout` padding dense — **cấm** revert `px-4 py-5` trên route settings.
- Page: **không** bọc `xevn-safe-inline` (tránh double 32–48px); class `settings-page` full width.
- `PageHeader` **`density="compact"`** trên Settings only.
- Form card (Tài khoản, …): `.settings-panel-card` — header/content ~16px, không `p-6` mặc định.
- Dispatch: `docs/program/dispatch/PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01.md`

---

## 3. Sơ đồ nhóm menu Cài đặt (thứ tự trên → dưới)

```text
A. Tài khoản & portal
   account · branding · notifications · security · roles · system · subscription

B. Danh mục tổng hợp
   catalogs (sync XBOS) · master-data (MD buckets)

C. Hợp đồng lao động          ← FR-09a / 09d / publish / PLT token
   contract-clauses             — chỉ điều khoản (+ nhóm)
   contract-templates           — chỉ mẫu + DnD canvas
   contract-number-config       — CFG-01 số HĐ
   contract-library-publish     — phát hành / kéo gói tập đoàn
   merge-tokens                 — FR-PLT-01 L3 (tách hẳn)

D. Tuyển dụng
   jd-dynamic · rec-pipeline-stages

E. Chấm công (ATT)
   att-leave-types · att-attendance-codes · att-ot-types · att-ot-comp-types

F. Nhân sự (EMP catalog)
   emp-document-types · emp-employment-types · emp-employment-statuses

G. Bảo hiểm (SI)
   si-insurance-types · si-insurers

H. Quyết định
   dec-decision-types

I. Lương & mặc định
   pay-sheet-tpl · settings-defaults
```

---

## 4. Chi tiết từng màn (phạm vi field)

### 4.1. `contract-clauses` (FR-UC-BP-CORE-09a)

| Có | Không |
|----|--------|
| List điều khoản · lọc **nhóm điều khoản** · search **mã / tiêu đề** | Mẫu DnD · CFG · Publish · MergeToken |
| Popup: mã · nhóm · tiêu đề · body · pack · bắt buộc · Lưu | Form inline full-page |

### 4.2. `contract-templates` (FR-UC-BP-CORE-09d)

| Có | Không |
|----|--------|
| List mẫu · search mã/tên · popup meta · màn composer DnD (full-width) | Clause CRUD · Publish |

### 4.3. `contract-number-config`

Chỉ org_suffix + pattern + Lưu CFG.

### 4.4. `contract-library-publish`

Chỉ holding publish / member pull-apply + bảng phiên bản.

### 4.5. `merge-tokens`

Giữ panel hiện tại · pattern list + popup (W2).

---

## 5. Lộ trình wave (team rà soát)

| Wave | Phạm vi | Owner | Exit |
|------|---------|-------|------|
| **W1** | Nav dọc AMIS · tách tab HĐ (5 mục) · clauses list+search+dialog | dev-fe | Sponsor F5 trên :5173 CC embed |
| **W2** | Templates list+search · popup meta · DnD tách scroll | dev-fe | QA J-HRM-PLT / CTR settings |
| **W3** | EMP/ATT/SI/DEC/REC panels → Catalog Shell + dialog + pagination | dev-fe | **ATT Loại phép DONE** · còn 10 catalog panel |
| **W4** | Master-data buckets đồng bộ toolbar search | dev-fe | BA AC-SET-UI |
| **BA** | Delta SRS mục 4 (1 màn 1 UC) · cập nhật HDSD | ba-process | Không prompt-echo |
| **QA** | Browser U65 từng tab · không gộp evidence | qa | L2.5 settings journeys |
| **QC** | GO slice W1–W2 · honesty printable=false RETAIN | qc | GWC residual W3 |

---

## 6. Rà soát team (checklist)

- [ ] SA: embed `?tab=` + iframe Select `portalScope=iframe` trên chrome Settings
- [ ] BA: AC mỗi màn = list + search + popup + F5
- [ ] Dev-FE: `settingsNavigation.ts` SoT thứ tự menu
- [ ] QA: `data-testid` giữ `ctr-clause-*` / `settings-tab-*` hoặc alias document
- [ ] QC: Cấm 🟢 UF-HRM-10 chỉ vì tab load — mutate từng màn

---

## 7. Liên kết code (W1)

| Artifact | Path |
|----------|------|
| Nav config | `apps/web/hrm/src/lib/settingsNavigation.ts` |
| Layout | `apps/web/hrm/src/components/settings/SettingsNavLayout.tsx` |
| Shell + pagination | `SettingsCatalogScreenShell.tsx` · `SettingsCatalogPagination.tsx` · `settingsCatalogPagination.ts` |
| Row actions | `SettingsCatalogRowActions.tsx` |
| Dialog Select | `SettingsDialogSelectContent.tsx` |
| Mẫu ATT | `AttLeaveTypeSettingsPanel.tsx` (list-only + dialog) |
| Page | `apps/web/hrm/src/pages/Settings.tsx` |
| Clauses | `ContractLegalPrintSettingsPanel` prop `view="clauses"` |
| Clause table | `apps/web/hrm/src/components/settings/ContractClauseListTable.tsx` |

*Sponsor lock U65: empty list hợp lệ — CTA hướng dẫn tạo từ FE, không seed.*
