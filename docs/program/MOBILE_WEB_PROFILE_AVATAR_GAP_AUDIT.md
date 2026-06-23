# Rà soát Mobile + Web — Avatar & khoảng trống tính năng (U50)

**work_item_id:** `PCOMP-W4-MOB-GAP-AUDIT-01`  
**Ngày:** 2026-06-07  
**Trigger:** Sponsor — nhân sự **tự upload avatar** web + app; mobile **thiếu rất nhiều** so với kỳ vọng quốc tế  
**Liên kết:** `SRS_MOBILE.md` · `MOBILE_HOME_HUB_UX_RESEARCH.md` · U49 · U50

---

## 1) Kết luận executive

| Phát hiện | Mức độ | Ý nghĩa |
|-----------|--------|---------|
| **Avatar không lưu được end-to-end** | **P0** | Web có UI upload nhưng **API/DB không có `avatar_url`**; mobile **không có màn upload** |
| **EmployeeProfile web — nút Camera trang trí** | **P0** | NV không tự đổi ảnh trên hồ sơ cá nhân |
| **Mobile ProfileScreen tối giản** | **P1** | Chỉ sửa họ tên/chức danh — thiếu ảnh, SĐT, metadata động (SRS MOB-12) |
| **Avatar không hiển thị trên Home/celebration** | **P1** | Smart Hub 04b dùng initials — cần URL thật sau BE |
| **Push / deep link / biometric** | **P2** | Đã backlog; không chặn avatar |

**Quyết định PM:** Wave **`PROFILE-AVATAR-01`** (BE → FE web self-service → Mobile) **trước** MOB-UX-04b celebrations — không hiển thị sinh nhật với avatar giả.

---

## 2) Avatar — hiện trạng kỹ thuật (audit code)

### 2.1 Web

| Thành phần | Trạng thái | Ghi chú |
|------------|------------|---------|
| `EmployeeAvatarUpload.tsx` | **Có** — chọn ảnh, upload `POST /api/hrm/files/upload` | Hoạt động **chỉ trong form** |
| `EmployeeFormDialog.tsx` | Gọi upload → `setAvatarUrl` → submit `avatar_url` | **`useEmployees.updateEmployee` không gửi `avatar_url` lên API** |
| `EmployeeProfile.tsx` | Avatar hiển thị + nút Camera | **Không wire** upload — decorative |
| `useEmployees.ts` | `avatar_url` trong type FE | **Luôn `null`** từ API (BE không trả) |
| `uploadHrmFile` | **Có** — multipart, trả public URL | File lưu disk; **không gắn employee** |

### 2.2 API / DB

| Thành phần | Trạng thái |
|------------|------------|
| `public.employees` schema | **Không có cột `avatar_url`** — chỉ `custom_fields JSONB` |
| `UpdateEmployeeDto` | **Không có `avatar_url`** |
| `POST /api/hrm/files/upload` | **Có** (`catalog-extensions.controller.ts`) |
| Self PATCH policy | Chưa rõ NV chỉ sửa **chính mình** vs HR sửa hết |

### 2.3 Mobile

| Thành phần | Trạng thái |
|------------|------------|
| `ProfileScreen.tsx` | Text fields only — **không avatar** |
| `EmployeeRow` type | **Không `avatar_url`** |
| `expo-image-picker` | **Chưa cài** — cần cho camera/gallery |
| `LeaveHeroCard` | Circle initials placeholder — **không ảnh thật** |
| Home / directory | **Không có** màn danh bạ đồng nghiệp |

### 2.4 Benchmark (Personio / HiBob / Workday)

| App | NV tự đổi ảnh | Ghi chú |
|-----|---------------|---------|
| **Personio** | Có — profile + sync directory | Ảnh hiện org chart, who's out |
| **HiBob** | Có — homepage + profile | Celebration cards dùng avatar |
| **Workday** | Có — worker profile photo | Manager directory |
| **BambooHR** | Có — My Info photo | Mobile + web |

**XeVN target:** NV upload ảnh **≤3 tap** (Profile → tap avatar → chọn ảnh → lưu); hiển thị everywhere (Home greeting, list, leave detail, celebrations).

---

## 3) Thiết kế đích — Avatar end-to-end

### 3.1 Data model (Dev-BE)

```sql
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;
```

- Hoặc `custom_fields.avatar_url` (nhanh hơn migration) — **khuyến nghị cột riêng** cho query/index celebrations.
- `GET /employees/:id` + list trả `avatar_url`
- `PATCH /employees/:id` nhận `avatar_url` (nullable = xóa)
- **Policy:** JWT `employee_id` === `:id` → cho PATCH `avatar_url` only; HR role → full PATCH

### 3.2 Upload flow (web + mobile chung)

```text
1. POST /api/hrm/files/upload?feature=employee-avatar&company_id={uuid}
   → { url: "/api/hrm/files/{company}/{file}" }
2. PATCH /api/hrm/employees/{selfId} { "avatar_url": url }
3. Client cache bust + hiển thị Image
```

**Mobile:** `expo-image-picker` → multipart (FormData) — mirror `uploadHrmFile` web.

### 3.3 UI spec

| Surface | Component | AC |
|---------|-----------|-----|
| **Web** `EmployeeProfile` (self) | Wire `EmployeeAvatarUpload` | NV đổi ảnh, refresh list |
| **Web** `EmployeeFormDialog` | Fix `updateEmployee` gửi `avatar_url` | HR tạo/sửa NV |
| **Web** `Employees` list | `AvatarImage` đã có — cần URL thật | |
| **Mobile** `ProfileScreen` | `AvatarUploadField` 96pt + camera overlay | AC-AVT-MOB-01 |
| **Mobile** `DashboardScreen` | Greeting row avatar 40pt | AC-AVT-MOB-02 |
| **Mobile** `LeaveHeroCard` | `Image` nếu URL else initials | AC-AVT-MOB-03 |
| **Mobile** Home 04b | Celebration horizontal avatars | sau PROFILE-AVATAR-01 |

### 3.4 Validation

- MIME: `image/jpeg`, `image/png`, `image/webp`
- Max **5MB** (khớp web)
- Min dimension 128×128 (reject quá nhỏ — optional Phase 2)

---

## 4) Ma trận Mobile vs SRS — khoảng trống đầy đủ

Legend: ✅ đủ pilot · 🟡 partial · 🔴 thiếu / stub · ⏳ planned wave

| UC | Tên | Màn hình | Trạng thái | Gap chính |
|----|-----|----------|------------|-----------|
| MOB-01 | Login | LoginScreen | ✅ | OAuth/SSO enterprise ⏳ |
| MOB-02 | Scope | ScopeScreen | ✅ | Multi-company UX polish |
| MOB-03 | Dashboard | DashboardScreen | 🟡 | Smart Hub 04a ⏳; thiếu task-first |
| MOB-04 | Check-in | CheckInScreen | ✅ | GPS geofence P2 |
| MOB-05 | Lịch sử CC | AttendanceHistoryScreen | ✅ | |
| MOB-06 | Tạo đơn | Create* screens | ✅ | Wizard UX done |
| MOB-07 | List đơn | Leave/Update lists | ✅ | Edit/cancel device P2 |
| MOB-08 | Duyệt | ManagerApprovalsScreen | 🟡 | Write header fix ⏳ QA |
| MOB-09 | Lương | Payroll/Payslip | 🟡 | tabular-nums; thiếu chart |
| MOB-10 | HĐ/BH | ContractsScreen | 🟡 | Read-only; thiếu upload chứng từ |
| MOB-11 | Operations | OperationsScreen | 🟡 | Basic list; thiếu create task mobile |
| **MOB-12** | **Hồ sơ** | ProfileScreen | **🔴** | **No avatar, no phone, no metadata dynamic forms** |
| MOB-13 | Thông báo | InAppNotifications | 🟡 | No push pilot; no Home preview ⏳ 04a |
| MOB-14 | Offline | Queue | 🟡 | Read cache partial |
| MOB-15 | Logout | Settings | ✅ | |
| — | **Avatar self-service** | — | **🔴** | **Không có — U50 P0** |
| — | **Directory / org chart** | — | **🔴** | HiBob/Personio có — Phase 2 |
| — | **Document upload leave** | — | **🔴** | Personio có — attach medical |
| — | **Leave balance API** | Create leave | **🔴** | Placeholder text |
| — | **Biometric login** | Settings toggle | 🟡 | Stub |
| — | **Search hub** | — | **🔴** | Workday 2026R1 ⏳ UX-05 |
| — | **Who's out / Birthday** | — | **🔴** | MOB-UX-04b ⏳ |
| — | **Push deep link** | — | **🔴** | FCM Phase 2 |

**Tỷ lệ ước lượng:** ~**55%** SRS functional parity · ~**35%** UX/visual parity vs Personio mid-market.

---

## 5) Web — gap bổ sung (NV self-service)

| Màn / tính năng | Trạng thái | Wave |
|-----------------|------------|------|
| EmployeeProfile — self edit avatar | 🔴 Camera không hoạt động | WEB-PROFILE-01 |
| EmployeeProfile — NV sửa SĐT/địa chỉ | 🟡 HR form only | WEB-PROFILE-02 |
| My Info portal (ESS) vs admin Employees | 🟡 Lẫn admin UX | Cần route ESS riêng |
| Avatar trong Attendance/Leave modals | 🔴 Initials fake | sau BE |

---

## 6) Roadmap waves (PM lock)

```text
PROFILE-AVATAR-01 (P0 — U50)     BE column + PATCH + self policy
                                 WEB wire profile + form fix
                                 MOB ProfileScreen + ImagePicker upload
                                 QA J-AVT-01 web + mobile same URL

MOB-UX-04a (P0 — đang chạy)      Smart Hub task-first

MOB-UX-04b (P1)                  Celebrations + Who's out (cần avatar_url)

WEB-ESS-01 (P1)                  Portal «Hồ sơ của tôi» tách admin

MOB-UX-05 (P2)                   Directory, search, doc upload leave
```

**Thứ tự bắt buộc:** `PROFILE-AVATAR-01` **song song** 04a được; **04b blocked** until avatar URL exists.

---

## 7) Journey & AC mới (draft)

| ID | Journey | Pass |
|----|---------|------|
| J-AVT-01 | NV web — Profile → upload → refresh | Ảnh hiện list + profile |
| J-AVT-02 | NV mobile — Profile → tap avatar → gallery → lưu | Ảnh hiện Home + leave hero |
| J-AVT-03 | NV A upload → NV B thấy avatar A trong list (scope) | Same URL within 30s |

---

## 8) RACI

| Deliverable | Owner |
|-------------|-------|
| Gap audit (doc này) | PM |
| AC + SRS delta avatar | BA-Process |
| `avatar_url` schema + PATCH policy | **Dev-BE Lead** |
| Web profile + form fix | **Dev-FE** |
| Mobile upload + display | **Dev-Mobile Lead** |
| Cross-platform QA | QA-Device + QA |
| Visual AC-VIS + AVT | QC gate |

---

## 9) Anti-patterns (cấm)

1. Upload file **không** PATCH employee → orphan files trên disk  
2. Chỉ mobile có avatar — web không sync  
3. Initials-only khi đã có URL  
4. HR-only upload — **U50 yêu cầu NV tự upload**

---

**Evidence path:** `docs/program/MOBILE_WEB_PROFILE_AVATAR_GAP_AUDIT.md`
