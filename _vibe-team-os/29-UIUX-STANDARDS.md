# 29 — UIUX Standards (Vibe Code System)

> **Scope:** Chuan UX/UI cho moi he thong Vibe Code — Admin Panel, HRM, ERP, CRM, E-commerce, Clinic, v.v.
> **Doc kem:** `25-SOLID-AND-CODING-CONVENTION.md` · `41-UIUX Spec & FE-BE Binding.md`
> **Tham chieu:** SAP Fiori · Workday Canvas · Oracle Redwood · Ant Design Pro
> **Case studies:** `case-studies/xevn-hrm/` · `case-studies/smartclinic/` · v.v.
>
> **Cach dung:** Doc Section A–F de nam principle chung.
> Moi du an them **project-specific extension** vao `case-studies/{project}/29-UIUX-EXT.md`.

---

## A. UNIVERSAL UX RULES — AP DUNG MOI HE THONG

### A.1 Mandatory Rules (vi pham = reject QA)

| # | Rule | Ly do |
|---|------|-------|
| **U-01** | Moi danh sach >= 10 items PHAI co **Search/Filter** | Usability — user khong the scan bang mat |
| **U-02** | Tao moi / sua: dung **Drawer hoac Modal**, KHONG navigate page moi | Giu context, tranh mat du lieu form |
| **U-03** | Moi form PHAI co **[Huy]** va **[Luu]** — [Luu] disabled khi chua co thay doi | Prevent accidental save & data loss |
| **U-04** | Moi async call PHAI co **Loading state** (Skeleton rows/cards, KHONG spinner toan trang) | Perceived performance |
| **U-05** | Moi trang co data PHAI co **Empty state**: icon + text + CTA | UX completeness |
| **U-06** | Sau moi action PHAI co **Toast**: Success (xanh) / Error (do) / Warning (vang) | Feedback loop — user phai biet dieu gi xay ra |
| **U-07** | Hanh dong Xoa / Khoa / Huy PHAI co **Confirm dialog** truoc | Destructive action guard |
| **U-08** | Row/item la du lieu "he thong" (platform): **disabled Edit+Delete**, badge "He thong" | Chong user xoa du lieu goc |
| **U-09** | Input ngay thang: PHAI dung **DatePicker**, KHONG cho nhap tay | Chong format sai, chong timezone |
| **U-10** | Search input PHAI co **debounce 300ms** truoc khi goi API | Performance — tranh spam API |

### A.2 Input Component Matrix — BAT BUOC tham chieu khi spec UI

| Tinh huong | Component | Cau hinh bat buoc |
|-----------|-----------|-----------------|
| Chon 1 gia tri, list tinh, <= 10 items | `<Select>` | Khong search |
| Chon 1 gia tri, list dong / > 10 items | `<Select>` + search (combobox) | Debounce 300ms, placeholder "Tim kiem..." |
| Chon nhieu gia tri | `<MultiSelect>` + search + checkbox | Count "N da chon" + nut "Xoa het" |
| Nhap so (so nguyen / thap phan) | `<InputNumber>` | min, max, step ro rang |
| Nhap tien te | `<InputNumber>` | Format nhom nghin, suffix don vi tien |
| Nhap phan tram | `<InputNumber>` | suffix "%", min=0, max=100, step=0.1 |
| Nhap ngay | `<DatePicker>` | Format theo locale du an, KHONG nhap tay |
| Nhap khoang ngay | `<DateRangePicker>` | Validate from <= to |
| Du lieu tier / bac thang | **Editable Grid** | Nut "+ Them dong" + icon xoa dong moi row |
| Upload file | `<FileUpload>` | Accept types ro rang, preview ten + size |
| Chon mau | `<ColorPicker>` | N preset + custom hex |
| Chon icon | `<IconPicker>` | Grid icon + search theo ten |
| Nhap van ban dai | `<Textarea>` | maxLength ro rang, counter hien thi |
| Nhap van ban ngan | `<Input>` | placeholder, maxLength, trim |

---

## B. LAYOUT PATTERNS

### B.1 Admin Settings Screen (CRUD don gian)

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb: Module / Sub-module / Ten man hinh      │
│ [Ten man hinh]                    [+ Them] [Import] │
├─────────────────────────────────────────────────────┤
│ [Search ...........] [Bo loc ▼]        [Export]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Danh sach / Grid / Table]                         │
│  - System rows: badge "He thong" + no actions       │
│  - User rows: [Edit] [Delete] [Toggle status]       │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Hien thi 1–20 / 100   [ < ]  1  2  3  ...  [ > ]  │
└─────────────────────────────────────────────────────┘
```

### B.2 Right Drawer — Them moi / Chinh sua (chieu rong: 400–560px)

```
┌────────────────────────────────────────────┐
│ [Them moi Ten-Item]                    [x] │
├────────────────────────────────────────────┤
│                                            │
│  [Form fields voi label + validation]      │
│                                            │
│  * = bat buoc                              │
│                                            │
├────────────────────────────────────────────┤
│ [Huy]                         [Luu]        │  ← sticky footer
└────────────────────────────────────────────┘
```

- Footer **sticky** — luon hien du scroll
- [Luu] disabled khi: form invalid / dang check async / khong co thay doi
- [Huy] confirm popup neu form co thay doi chua save

### B.3 Confirm Dialog — Xoa / Khoa

```
┌──────────────────────────────────────┐
│  ⚠  Xoa [Ten Item]?                 │
│                                      │
│  Hanh dong nay khong the hoan tac.   │
│  [X ban ghi lien quan se bi anh huong] │
│                                      │
│  [Huy]              [Xac nhan xoa]   │
└──────────────────────────────────────┘
```

> Text PHAI cu the: ghi ten item thuc te, so cascade thuc te. CHAM DUT dung "Ban co chac?".

### B.4 Grid Cards Layout (dung cho catalog / category screens)

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ [Icon][Badge]│  │ [Icon][Badge]│  │ [Icon]       │
│              │  │              │  │  [He thong]  │
│  Ten item    │  │  Ten item    │  │  Ten item    │
│  Subtitle    │  │  Subtitle    │  │  Subtitle    │
│     [✏][🗑] │  │     [✏][🗑] │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
  User item          User item         System item
  (co actions)       (co actions)      (no actions)
```

- **System item:** badge "He thong" (indigo), NO Edit/Delete, tooltip "Du lieu he thong khong the chinh sua"
- **Responsive:** 3 col desktop → 2 col tablet → 1 col mobile
- **Hover:** hien action buttons moi hover (tranh cluttered UI)

### B.5 Table Standard

| Yeu cau | Chi tiet |
|---------|---------|
| Column sort | Click header, hien mui ten asc/desc |
| Pagination | Mac dinh 20/trang, cho chon 20/50/100 |
| Selection | Checkbox cot dau, header = chon tat ca trang |
| Bulk actions | Action bar noi len khi co selection |
| Loading | Skeleton rows — KHONG spinner |
| Empty | Icon phu hop + mo ta + CTA |
| Error | Icon loi + "Khong tai duoc" + [Thu lai] |

---

## C. TOAST & NOTIFICATION STANDARDS

### C.1 Text format

| Loai | Format | Vi du |
|------|--------|-------|
| **Success** | "[Hanh dong] thanh cong" | "Tao thanh cong", "Cap nhat thanh cong", "Xoa thanh cong" |
| **Error** | "[Hanh dong] that bai — [Ly do]" | "Tao that bai — Ma da ton tai", "Khong co quyen thuc hien" |
| **Warning** | "[Canh bao cu the]" | "Du lieu chua duoc luu", "Phien dang nhap sap het han" |
| **Info** | "[Thong tin trung lap]" | "Dang xu ly, vui long doi..." |

### C.2 Duration

| Loai | Thoi gian | Auto-dismiss? |
|------|----------|--------------|
| Success | 3s | Co |
| Info | 4s | Co |
| Warning | 5s | Co |
| Error | Cho den khi dong | KHONG (user phai xu ly) |

---

## D. VALIDATION STANDARDS

### D.1 Thoi diem validate

| Khi nao | Loai validate |
|---------|-------------|
| Blur (roi khoi field) | Format, required, min/max length |
| onChange (debounce 300ms) | Unique check (goi API) |
| Submit | Toan bo form |

### D.2 Hien thi loi

- Loi hien **inline duoi field** — KHONG alert popup
- Text loi: **cu the, co goi y** — vi du: "Ma nhan vien phai tu 3-20 ky tu, chi chu va so" (KHONG: "Ma khong hop le")
- Field loi: border do, icon canh bao
- Form submit bi block: scroll den field loi dau tien

---

## E. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Adaptation |
|-----------|-------|-----------|
| Mobile | < 768px | Single column, bottom sheet thay drawer, tab collapse |
| Tablet | 768–1024px | 2 columns, drawer thu hep |
| Desktop | > 1024px | Full layout 3 col, full drawer |

---

## F. ACCESSIBILITY MINIMUM

- Moi interactive element: **focus ring** ro rang
- Moi icon-only button: `aria-label` mo ta hanh dong
- Moi form field: `<label>` lien ket chinh xac
- Color KHONG duoc la cach duy nhat phan biet trang thai (them icon/text)
- Contrast ratio: >= 4.5:1 cho text thuong, >= 3:1 cho text lon

---

## G. ANTI-PATTERNS — BI CAM TUYET DOI

| Anti-pattern | Thay bang |
|-------------|----------|
| Navigate page moi khi tao/sua | Drawer hoac Modal |
| Spinner toan trang khi load | Skeleton component |
| Toast "Loi xay ra" (generic) | Toast co ten loi + goi y fix |
| "Ban co chac muon xoa?" | Confirm dialog co ten item + cascade count |
| Input text de nhap ngay thang | DatePicker |
| Nut Luu luon active | Disabled khi form invalid / khong doi |
| Xoa du lieu system rows | Badge "He thong" + disable buttons |
| Search real-time khong debounce | Debounce 300ms |
| Bat buoc nhap email/so dien thoai vao `<Input>` thuong | Dung type="email", type="tel" voi validate pattern |

---

## H. HOW TO EXTEND (PROJECT-SPECIFIC)

Moi du an them extension file tai:
```
_vibe-team-os/case-studies/{project-name}/29-UIUX-EXT.md
```

Extension file co the them:
- Domain-specific component patterns (vi du: Payroll Tier Grid, Clinic Appointment Calendar)
- Color scheme / design tokens cua du an
- Locale-specific rules (vi du: VND format, date format)
- Module-specific layouts (vi du: HRM Settings Grid Cards, E-commerce Product Cards)

**Khong duoc sua file goc `29-UIUX-STANDARDS.md`** — chi them extension.

---

## APPENDIX: Case Studies

| Du an | Extension file | Ghi chu |
|-------|---------------|---------|
| XeVN HRM | `case-studies/xevn-hrm/29-UIUX-EXT.md` | Payroll, Attendance, Employee |
| SmartClinic | `case-studies/smartclinic/29-UIUX-EXT.md` | Appointment, EMR, Billing |
| (them moi) | `case-studies/{name}/29-UIUX-EXT.md` | |