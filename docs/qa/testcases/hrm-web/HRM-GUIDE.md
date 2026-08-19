# Menu TC Pack — `HRM-GUIDE` · Hướng dẫn sử dụng (HRM Web + CC embed)

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-GUIDE` |
| **surface** | `hrm-web` · **CC embed** `XBOS-HRM-EMBED-GUIDE` (CTA — không full iframe) · **mobile** bottom-nav entry |
| **route(s)** | `/guide` (public, ngoài `ProtectedRoute`) · `/hr/guide` · CC `/command-center/hrm/guide` · admin tab `platform-admin` → **Hướng dẫn SD** |
| **HDSD** | Sidebar/footer HRM **Hướng dẫn** · CC → Nhân sự → **Hướng dẫn sử dụng** → **Mở HRM / Hướng dẫn** · Mobile nav **Hướng dẫn** |
| **SRS / FR / UC** | **SPEC_GAP** — không có FR riêng trong pack VN; nội dung static/i18n + overlay DB · liên kết **HDSD** theo phân hệ (Employees, Attendance, …) |
| **TechSpec** | `docs/hrm/TECHSPEC.md` (static help + `hrm_guide_content` catalog extension) |
| **API_CONTRACT** | `GET /api/hrm/guide-content` → **200** `HRM-GUIDE-200` · `POST /api/hrm/guide-content` → **201** `HRM-GUIDE-201` · `DELETE /api/hrm/guide-content` → **200** `HRM-GUIDE-200` |
| **UF / J-*** | **J-HRM-MENU-SWEEP** (leaf static) · roster **HRM-GUIDE** / **XBOS-HRM-EMBED-GUIDE** · không UF-HRM-MENU-* riêng |
| **Menu roster** | Wave C · `PO-ECO-TC-HRM-GUIDE-01` |
| **author** | qa · PO-ECO-TC-HRM-GUIDE-01 |
| **work_item_id** | `PO-ECO-TC-HRM-GUIDE-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **thin_ui_flag** | **STUB** — User Guide read-only: **không** `data-testid`; automate = MANUAL / future harness |

> Chuẩn: IEEE 829 / ISO 29119 lean · WORLD-STANDARD depth (`PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2). U65: customize nội dung admin **từ FE** (Platform Admin → sửa bước → Lưu); **cấm seed** trong execution. **Không** claim UAT/Phase1 DONE. CC embed **AS-IS:** panel mô tả + **Mở HRM / Hướng dẫn** — không iframe full.

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-GUIDE-SHELL | page | `/guide` | `UserGuide` full-page (header + main); **không** `AppLayout` sidebar | loading overlay API · grid · detail · search empty |
| SCR-GUIDE-HEADER | chrome | sticky header | Back **/** · title `guide.title` · LanguageSwitcher · ThemeToggle | — |
| SCR-GUIDE-HERO | inline | main top | Badge · heading · subtitle (i18n) | — |
| SCR-GUIDE-SEARCH | control | hero dưới | Input + icon Search | empty query · filtered · noResults |
| SCR-GUIDE-QUICK | inline | grid trên | Badge chips 11 section (quick jump) | hidden khi `activeSection` set |
| SCR-GUIDE-GRID | view | default | 3-col cards `guideSections` | 11 cards · hover «Xem N bước» |
| SCR-GUIDE-DETAIL | view | `activeSection` | Card + Accordion steps | i18n default · custom HTML overlay |
| SCR-GUIDE-NORESULT | empty | search miss | Icon + `guide.noResults` | — |
| SCR-CC-GUIDE | panel | CC `view=guide` | Copy + **Mở HRM / Hướng dẫn** | CTA only |
| SCR-ADMIN-GUIDE | tab | `/platform-admin` tab **guide** | `GuideManagementPage` grid + badge «N đã tùy chỉnh» | platform admin only |
| SCR-ADMIN-DETAIL | view | admin section pick | Accordion + pencil · badge «Đã tùy chỉnh» · image count | — |
| DLG-GUIDE-EDITOR | dialog | admin pencil | `GuideStepEditor` — title · RichText · images · Lưu/Hủy/Khôi phục | open · saving · error toast |

**Đếm:** pages=2 (UserGuide + CC panel) · admin views=2 · dialogs=1 · confirms=**0** · empty=1

### 1.1 Section / link inventory (`guideSections.ts`)

| section_id | Icon theme | Steps (#) | i18n titleKey (root) | HDSD cross-link (nghiệp vụ) |
|------------|------------|-----------|----------------------|-----------------------------|
| `getting-started` | Lightbulb | 3 | `guide.sections.gettingStarted.title` | Onboarding · điều hướng menu |
| `employees` | Users | 3 | `guide.sections.employees.title` | → pack **HRM-EMPLOYEES** |
| `attendance` | Clock | 4 | `guide.sections.attendance.title` | → **HRM-ATTENDANCE** · link `attPage.viewGuide` |
| `payroll` | Wallet | 3 | `guide.sections.payroll.title` | → **HRM-PAYROLL** |
| `recruitment` | UserPlus | 3 | `guide.sections.recruitment.title` | → **HRM-RECRUITMENT** |
| `contracts` | FileSignature | 2 | `guide.sections.contracts.title` | → **HRM-CONTRACTS** |
| `insurance` | Shield | 2 | `guide.sections.insurance.title` | → **HRM-INSURANCE** |
| `company` | Building2 | 3 | `guide.sections.company.title` | → **HRM-COMPANY** / Company menu |
| `reports` | BarChart3 | 2 | `guide.sections.reports.title` | → Reports menu |
| `uniai` | Bot | 2 | `guide.sections.uniai.title` | → UniAI `/ai` (**Phase-2 STUB** copy) |
| `settings` | Settings | 2 | `guide.sections.settings.title` | → **HRM-SETTINGS** |

**Tổng bước accordion (static keys):** **28** · **Không** deep-link URL tới từng menu từ card (chỉ nội dung văn bản).

### 1.2 Navigation entry points (links)

| link_id | From | Target | Notes |
|---------|------|--------|-------|
| LNK-SB-GUIDE | `AppSidebar` footer | `/guide` | `guide.title` |
| LNK-MOB-GUIDE | `MobileBottomNav` | `/guide` | HelpCircle |
| LNK-CC-OPEN | `HrmWorkspacePanel` case `guide` | `/hr/guide` via `openHrmApp` | **Mở HRM / Hướng dẫn** |
| LNK-GUIDE-HOME | UserGuide header | `/` | ArrowLeft — về dashboard shell (cần login nếu protected `/`) |
| LNK-ATT-GUIDE | `Attendance.tsx` | (inline modals) | **Cross-ref only** — không route `/guide` |

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 User Guide — read-only display

| field_id | UI label (VI) | screen_id | control | req | validation / BR | API / source | format |
|----------|---------------|-----------|---------|-----|-----------------|--------------|--------|
| F-HDR-TITLE | Hướng dẫn | SCR-GUIDE-HEADER | h1 | — | i18n `guide.title` | — | — |
| F-HERO-BADGE | badge hero | SCR-GUIDE-HERO | Badge | — | `guide.badge` | — | — |
| F-HERO-H1 | tiêu đề hero | SCR-GUIDE-HERO | h2 | — | `guide.heading` | — | — |
| F-HERO-SUB | mô tả hero | SCR-GUIDE-HERO | p | — | `guide.subtitle` | — | — |
| F-SRCH | Tìm kiếm | SCR-GUIDE-SEARCH | Input | N | filter client-side title/desc/steps | — | text |
| F-CARD-TITLE | tiêu đề phân hệ | SCR-GUIDE-GRID | h3 | — | `t(section.titleKey)` | — | label not raw key |
| F-CARD-DESC | mô tả ngắn | SCR-GUIDE-GRID | p line-clamp-2 | — | `descKey` | — | — |
| F-CARD-STEPS-HINT | Xem N bước | SCR-GUIDE-GRID | hover text | — | `guide.viewSteps` | — | count exempt |
| F-SEC-TITLE | tiêu đề section detail | SCR-GUIDE-DETAIL | CardTitle | — | i18n or `custom_title` | `hrm_guide_content` | — |
| F-SEC-DESC | mô tả section | SCR-GUIDE-DETAIL | muted p | — | i18n `descKey` | — | — |
| F-STEP-NUM | số thứ tự | SCR-GUIDE-DETAIL | badge 1..n | — | — | — | — |
| F-STEP-TITLE | tiêu đề bước | SCR-GUIDE-DETAIL | AccordionTrigger | — | i18n or `custom_title` | overlay | — |
| F-STEP-BODY | nội dung bước | SCR-GUIDE-DETAIL | AccordionContent | — | i18n plain or `custom_content` HTML | overlay | HTML sanitize observe |
| F-NORESULT | không có kết quả | SCR-GUIDE-NORESULT | p | — | `guide.noResults` | — | — |

### 2.2 Admin editor (`DLG-GUIDE-EDITOR`)

| field_id | UI label | screen_id | control | req | validation / BR | API column |
|----------|----------|-----------|---------|-----|-----------------|------------|
| F-ED-TITLE | Tiêu đề | DLG-GUIDE-EDITOR | Input | N* | lưu as `custom_title` | `custom_title` |
| F-ED-CONTENT | Nội dung | DLG-GUIDE-EDITOR | RichTextEditor (TipTap) | N* | HTML | `custom_content` |
| F-ED-IMG-LIST | Ảnh đã upload | DLG-GUIDE-EDITOR | thumbnails | N | remove chip | `image_urls[]` jsonb |
| F-ADM-COUNT | N đã tùy chỉnh | SCR-ADMIN-GUIDE | Badge | — | `contents.length` | list GET |

\* Admin có thể Lưu title/content mặc định prefilled — không Zod empty block trên FE.

### 2.3 CC embed chrome

| field_id | UI label | screen_id | notes |
|----------|----------|-----------|-------|
| F-CC-TITLE | Hướng dẫn sử dụng | SCR-CC-GUIDE | workspace header from `titles.guide` |
| F-CC-SUB | subtitle panel | SCR-CC-GUIDE | «Mục lục hướng dẫn theo từng phân hệ.» |
| F-CC-CTA | Mở HRM / Hướng dẫn | SCR-CC-GUIDE | button |

**Đếm fields:** **22** (read 14 + editor 4 + admin 1 + CC 3)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API METHOD path | success FE+F5 | fail codes | HDSD |
|-------|---------------|-----------|---------|-----------------|---------------|------------|------|
| FN-NAV-SB | Sidebar **Hướng dẫn** | SCR-GUIDE-SHELL | thường đã login | GET guide-content (background) | `/guide` render 11 cards | 5xx toast silent/list default i18n | Sidebar footer → Hướng dẫn |
| FN-NAV-MOB | Mobile nav **Hướng dẫn** | SCR-GUIDE-SHELL | mobile layout | same GET | page load | — | Bottom nav |
| FN-GUIDE-LOAD | Mount UserGuide | SCR-GUIDE-SHELL | — | GET `/guide-content?company_id=` | **200** `HRM-GUIDE-200`; merge overlay | API down → i18n only | Mở `/hr/guide` |
| FN-GUIDE-SEARCH | Gõ tìm kiếm | SCR-GUIDE-SEARCH | — | — | Grid lọc; reset `activeSection` | — | Nhập từ khóa |
| FN-GUIDE-BADGE | Quick badge section | SCR-GUIDE-QUICK | !detail | — | `activeSection=id` | — | Click chip |
| FN-GUIDE-OPEN | Click card section | SCR-GUIDE-GRID | — | — | Detail + accordion | — | Chọn phân hệ |
| FN-GUIDE-BACK | **Quay lại** | SCR-GUIDE-DETAIL | detail | — | Grid + quick badges | — | «Quay lại tất cả» |
| FN-GUIDE-ACC | Mở bước accordion | SCR-GUIDE-DETAIL | — | — | Step body visible | — | Expand step |
| FN-GUIDE-I18N | LanguageSwitcher | SCR-GUIDE-HEADER | — | — | Section/step text đổi ngôn ngữ (i18n keys) | — | Header |
| FN-GUIDE-THEME | ThemeToggle | SCR-GUIDE-HEADER | — | — | dark/light persist | — | Header |
| FN-GUIDE-HOME | Back **/** | SCR-GUIDE-HEADER | — | — | Navigate `/` | login gate if protected | Arrow |
| FN-CC-PANEL | CC tab Hướng dẫn | SCR-CC-GUIDE | CC login | — | Panel + copy | — | CC → Nhân sự → Hướng dẫn |
| FN-CC-OPEN | **Mở HRM / Hướng dẫn** | SCR-CC-GUIDE | — | — | Tab/app `/hr/guide` | — | Click CTA |
| FN-ADM-OPEN | Admin chọn section | SCR-ADMIN-GUIDE | PlatformAdmin | GET | Detail list steps | — | Platform Admin → Hướng dẫn SD |
| FN-ADM-EDIT | **Pencil** bước | SCR-ADMIN-DETAIL | — | — | `DLG-GUIDE-EDITOR` open | — | Sửa bước |
| FN-ADM-SAVE | **Lưu** editor | DLG-GUIDE-EDITOR | platform admin | POST `/guide-content` | **201** `HRM-GUIDE-201`; toast «Đã lưu»; UserGuide F5 shows custom | scope 409 on company | Sửa → Lưu |
| FN-ADM-RESET | **Khôi phục mặc định** | DLG-GUIDE-EDITOR | có overlay | DELETE `/guide-content` | **200**; i18n default restored | — | Khôi phục |
| FN-ADM-IMG | Upload ảnh editor | DLG-GUIDE-EDITOR | file pick | **STUB** `hrmStorageUploadStub` | URL in editor + `image_urls` on save | toast uploadError | Toolbar image |

**Đếm functions:** **18**

**Mutate subset (≥1 FD):** FN-ADM-SAVE · FN-ADM-RESET · FN-ADM-IMG = **3**

**Ghi chú AS-IS:** Route `/guide` **public** (ngoài `ProtectedRoute`) — đọc help không bắt buộc JWT; GET guide-content vẫn gửi token nếu có session. Rich text render **`dangerouslySetInnerHTML`** — security/regression = manual + TM review.

---

## 4. Test case matrix (chi tiết)

### Quy ước

- **TC-ID:** `TC-GUIDE-<area>-<type>-<nnn>`
- **Type:** HP · FD · BD · AU · UX · **STUB** · **OOS**
- **Persona mặc định:** Group CEO `ceo@xe.vn` / `Xevn@2026` · `company_id=main`
- **HDSD (U76):** Sidebar **Hướng dẫn** hoặc CC → Nhân sự → **Hướng dẫn sử dụng** → (CTA) **Mở HRM / Hướng dẫn**

### 4.1 Load · embed · J-HRM-MENU-SWEEP

| TC-ID | Type | Covers | Precond | Steps (HDSD) | Expected | Layer | Automate | Status |
|-------|------|--------|---------|--------------|----------|-------|----------|--------|
| TC-GUIDE-L-HP-001 | HP | FN-NAV-SB · FN-GUIDE-LOAD | L0 · logged in | Sidebar → **Hướng dẫn** | `/hr/guide`; hero + **11** cards; GET **200** optional | UI | MANUAL | PLANNED |
| TC-GUIDE-L-HP-002 | HP | FN-CC-PANEL · UF static | CC | CC → Nhân sự → **Hướng dẫn sử dụng** | Copy + **Mở HRM / Hướng dẫn**; không blank iframe | UI | MANUAL | PLANNED |
| TC-GUIDE-L-HP-003 | HP | FN-CC-OPEN | CC panel | Click **Mở HRM / Hướng dẫn** | Same as 001 | UI | MANUAL | PLANNED |
| TC-GUIDE-L-HP-004 | HP | FN-NAV-MOB | viewport mobile | Bottom nav → Hướng dẫn | UserGuide shell | UI | MANUAL | PLANNED |
| TC-GUIDE-L-HP-005 | HP | public route | logout | Direct `/hr/guide` | Page renders static i18n; **không** crash | UI | MANUAL | PLANNED |
| TC-GUIDE-L-UX-006 | UX | FN-GUIDE-LOAD | API chậm | Mở guide | i18n cards visible; eventual overlay | UI | MANUAL | PLANNED |
| TC-GUIDE-L-FD-007 | FD | FN-GUIDE-LOAD | hrm-api down | Mở guide | i18n fallback; no fake custom rows | UI | MANUAL | PLANNED |
| TC-GUIDE-L-FD-008 | FD | scope | token vs `company_id` query mismatch | GET probe | **409** on persist paths; list không leak CT khác | API | API | PLANNED |
| TC-GUIDE-L-AU-009 | AU | FN-ADM-SAVE | user không platform admin | Deep `/platform-admin` tab guide | **403**/redirect; không POST | UI | MANUAL | PLANNED |
| TC-GUIDE-L-UX-010 | UX | J-HRM-MENU-SWEEP | — | Leaf load | No console P0; static content honest | UI | MANUAL | PLANNED |

### 4.2 Tìm kiếm · điều hướng section

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-GUIDE-SR-HP-001 | HP | FN-GUIDE-SEARCH | Gõ «chấm công» | Grid lọc `attendance`; others hidden | PLANNED |
| TC-GUIDE-SR-HP-002 | HP | FN-GUIDE-BADGE | Click badge **Nhân viên** | Detail `employees`; quick badges hidden | PLANNED |
| TC-GUIDE-SR-HP-003 | HP | FN-GUIDE-OPEN | Click card **Báo cáo** | Detail + **2** accordion items | PLANNED |
| TC-GUIDE-SR-HP-004 | HP | FN-GUIDE-BACK | Detail → **Quay lại** | Grid 11 cards; quick badges visible | PLANNED |
| TC-GUIDE-SR-FD-001 | FD | FN-GUIDE-SEARCH | Gõ «xyznonexistent» | `SCR-GUIDE-NORESULT`; no crash | PLANNED |
| TC-GUIDE-SR-BD-001 | BD | F-SRCH | Chuỗi 200+ ký tự | Client filter stable; no hang | PLANNED |
| TC-GUIDE-SR-UX-001 | UX | FN-GUIDE-ACC | Expand step 1..n | Body visible; custom HTML if overlay | PLANNED |

### 4.3 Overlay nội dung (GET merge)

| TC-ID | Type | Covers | Precond | Steps | Expected | Status |
|-------|------|--------|---------|-------|----------|--------|
| TC-GUIDE-OV-HP-001 | HP | FN-GUIDE-LOAD · overlay | U65: admin đã **Lưu** 1 bước từ FE | User mở cùng section/step | Title/body custom; **F5** còn | PLANNED |
| TC-GUIDE-OV-HP-002 | HP | FN-ADM-RESET | có overlay | Admin Khôi phục → user F5 | i18n default text | PLANNED |
| TC-GUIDE-OV-UX-001 | UX | F-STEP-BODY | custom HTML có `<img>` | Render rounded; không vỡ layout | PLANNED |
| TC-GUIDE-OV-STUB-001 | STUB | security | custom HTML script tag | **TM review** — XSS policy documented | PLANNED |

### 4.4 Platform Admin — mutate (U65)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-GUIDE-AD-HP-001 | HP | FN-ADM-SAVE | Platform Admin → guide → section **employees** step 1 → đổi title → **Lưu** | POST **201**; badge «Đã tùy chỉnh»; UserGuide shows | PLANNED |
| TC-GUIDE-AD-HP-002 | HP | FN-ADM-SAVE | Rich text bold/list → Lưu | HTML persisted; GET returns | PLANNED |
| TC-GUIDE-AD-HP-003 | HP | FN-ADM-RESET | **Khôi phục mặc định** on customized step | DELETE **200**; default i18n | PLANNED |
| TC-GUIDE-AD-HP-004 | HP | FN-ADM-IMG | Upload ảnh (stub storage) | Toast success or honest error; `image_urls` on save if OK | PLANNED |
| TC-GUIDE-AD-FD-001 | FD | FN-ADM-SAVE | hrm-api down during Lưu | Toast error; dialog stays; no silent OK | PLANNED |
| TC-GUIDE-AD-FD-002 | FD | FN-ADM-SAVE | invalid `section_id` via API probe | 4xx; no corrupt row | PLANNED |
| TC-GUIDE-AD-UX-001 | UX | FN-ADM-EDIT | Cancel **Hủy** | No POST; dialog close | PLANNED |
| TC-GUIDE-AD-UX-002 | UX | F-ADM-COUNT | Save 2 steps | Badge count ≥2 | PLANNED |

### 4.5 i18n · theme · chrome

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-GUIDE-UX-HP-001 | HP | FN-GUIDE-I18N | Switch EN/VI | Section titles change; keys not shown raw | PLANNED |
| TC-GUIDE-UX-HP-002 | HP | FN-GUIDE-THEME | Toggle dark | Readable contrast; cards visible | PLANNED |
| TC-GUIDE-UX-HP-003 | HP | FN-GUIDE-HOME | Click back home | Navigate `/`; protected gate if logged out | PLANNED |

### 4.6 Cross-ref · OOS

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-GUIDE-X-OOS-001 | OOS | LNK-ATT-GUIDE | Attendance inline guides | Modals only — **not** `/guide` route | OOS |
| TC-GUIDE-X-STUB-001 | STUB | `uniai` section | Read UniAI steps | Copy STUB Phase-2; link pack **HRM-AI** when exists | STUB |

### Coverage check (bắt buộc)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions với ≥1 HP | 18 | 18 | 0 |
| Mutate fn ≥1 FD | 3 | 3 | 0 |
| Required fields admin (soft) ≥1 UX/FD | 2 | TC-GUIDE-AD-* | 0 |
| Dialog open/cancel/submit | 1 | TC-GUIDE-AD-HP-001 + AD-UX-001 | 0 |
| CC CTA embed | 1 | TC-GUIDE-L-HP-002/003 | 0 |

**Tổng TC:** **42** (40 PLANNED · 1 OOS · 1 STUB security)

---

## 5. Traceability

| TC-ID | SRS / matrix | TechSpec | API | HDSD |
|-------|--------------|----------|-----|------|
| TC-GUIDE-L-HP-001..010 | `HRM_MENU_DATA_LINKAGE_MATRIX.md` row `guide` Static | catalog-extensions `hrm_guide_content` | GET guide-content | Sidebar Hướng dẫn |
| TC-GUIDE-AD-HP-001..004 | SPEC_GAP platform help CMS | same | POST/DELETE | Platform Admin → Hướng dẫn SD |
| TC-GUIDE-L-HP-002..003 | `PILOT_BUSINESS_FLOW_MATRIX` CC embed guide | ADR embed static | — | CC → Nhân sự → Hướng dẫn |
| TC-GUIDE-OV-* | overlay BR | upsert ON CONFLICT | POST/GET | Admin save → user read |
| TC-GUIDE-SR-* | — | client filter | — | Search box |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| Deep link từ guide card → `/employees` etc. | UI không có router link trong `UserGuide` | **OOS** — future enhancement |
| Full HDSD PDF/HTML khách | Ba-docs deliverable riêng | **OOS** |
| `hrmStorageUploadStub` production file API | AS-IS stub upload | **STUB** TC-GUIDE-AD-HP-004 |
| UniAI module depth | Phase-2 menu | **STUB** TC-GUIDE-X-STUB-001 |
| Automated `data-testid` harness | thin_ui_flag | **STUB** — MANUAL until FE adds testids |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-guide-01.md
next_owner: qa-synth
counts: screens=12 fields=22 functions=18 tcs=42
```
