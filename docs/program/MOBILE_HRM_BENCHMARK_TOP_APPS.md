# Benchmark — Top HRM mobile (nghiệp vụ + UI/UX)

**work_item_id:** `PCOMP-W4-MOB-BENCH-01`  
**Ngày:** 2026-06-07  
**Mục đích:** Bổ sung hướng làm cho XeVN mobile (U46) — không copy 1:1, **chọn pattern phù hợp quy mô tập đoàn VN + nền web HRM sẵn có**.  
**Liên kết:** `MOBILE_IOS_UX_INHERITANCE_PLAN.md` · `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` (typography/navigation/thumb chi tiết) · `pcomp-w4-fe-spec-01-20260607.md`

---

## 1) Apps tham chiếu (phân tầng)

| Tier | App | Đối tượng | Điểm mạnh mobile | Hạn chế / không áp dụng ngay |
|------|-----|-----------|------------------|------------------------------|
| **Enterprise** | [Workday Mobile](https://www.workday.com/en-us/products/platform-product-extensions/workday-mobile.html) | 10k+ NV, đa quốc gia | Hub theo vai trò; absence timeline gộp request+correct; check-in/break/checkout; manager approve real-time; **Canvas** đồng bộ web/mobile | **Sana AI** conversational UI — Phase 2+; phụ thuộc hệ sinh thái Workday |
| **Enterprise** | [SAP SuccessFactors Mobile](https://www.sap.com/design-system/hcm/) | Enterprise APAC | **SFUX** design system (cards, filter panels, detail panel); **Bite-Snack-Meal**; Home + To-Do + Browse; profile-based content; mobile-first IDP | Triển khai nặng; theme manager phức tạp |
| **Mid-market** | [BambooHR Mobile](https://help.bamboohr.com/s/article/588027) | SMB 50–500 | Home widget «Request Time Off»; flow **calendar chọn ngày → category → balance → Send**; inbox filter (Time Off / Timesheet / Signature); push notification | Ít multi-company holding; UI đơn giản |
| **Mid-market EU** | [Personio Mobile](https://www.personio.com/product/mobile/) | SMB remote workforce | Widget Home: Time Off, Who's Out, Time Tracking; **balance hiển thị khi chọn loại nghỉ**; upload chứng từ ảnh; calendar tổng hợp nghỉ + chấm công | Payroll compliance form dài — web parity mới đủ (2025) |

**Kết luận cho XeVN:** Lấy **Personio/BambooHR** làm mức UX mục tiêu Phase 1 (employee self-service); tham chiếu **Workday/SF** cho **hub navigation + manager inbox + timeline absence** ở Phase 2; **không** làm AI chat front door trước khi core flows đẹp.

---

## 2) Pattern nghiệp vụ chung (industry standard)

### 2.1 Information architecture (tab / hub)

```text
[Home]     Hành động nhanh + widget trạng thái hôm nay
[Time]     Chấm công + lịch sử + (optional) ca làm
[Requests] Đơn nghỉ + đơn cập nhật + trạng thái duyệt
[More]     Lương, HĐ, duyệt (manager), cài đặt, thông báo
```

| Pattern | Workday | BambooHR | Personio | XeVN đề xuất |
|---------|---------|----------|----------|--------------|
| Entry request nghỉ | Absence hub + balances | Home **hoặ** My Info → Time Off | Home widget «Request time off» | **Home CTA** + tab Requests (giữ stack hiện tại, thêm shortcut Home) |
| Hiển thị số dư phép | Trong absence view | Dưới tên category khi chọn | Khi chọn type + trên Time off page | **Trước khi gửi đơn** — gọi API balance (nếu có) hoặc placeholder «Liên hệ HR» |
| Manager approve | In-app inbox | Home inbox filter Time Off | Push + task list | `ManagerApprovalsScreen` → **inbox unified** giống BambooHR filter chips |
| Check-in | One-tap + break | Time Clock widget Home | Time Tracking widget | `CheckInScreen` — **FAB hoặc card lớn** trên Home (Personio-style) |
| Payslip | Self-service agent / hub | My Info | Documents hub | Giữ More stack; list → detail với **format tiền VND** (đã spec FE) |

### 2.2 Leave request flow (best practice)

**Chuẩn 4 bước** (BambooHR + Personio + web XeVN LeaveTab):

1. **Chọn ngày** — calendar native (iOS `DateTimePicker`), không text field ISO  
2. **Chọn loại nghỉ** — picker + **nhãn tiếng Việt** + màu badge (web `leaveTypeLabels`)  
3. **Xác nhận** — số ngày/giờ, lý do, bàn giao (nếu SRS có); cảnh báo âm quỹ  
4. **Gửi** — toast/banner xác nhận + quay list «Scheduled»

**Detail screen** (Workday Unified Absence + web LeaveTab):

- Hero: loại nghỉ + badge trạng thái (không raw `LVT_01`)  
- Grid: từ–đến, số ngày, gửi lúc, duyệt lúc  
- Khối lý do riêng (muted background)  
- Action bar: **Sửa / Hủy** nếu `pending` (Personio/BambooHR pattern)

### 2.3 Attendance

| Element | Benchmark | XeVN |
|---------|-----------|------|
| Today status | Card «Đã chấm / Chưa chấm» trên Home | `DashboardScreen` widget |
| History | List grouped by week | `AttendanceHistoryScreen` + section headers |
| Time format | Localized, no ISO | `formatHrmDateTime` (UX-01) |

### 2.4 Manager

- **Single inbox** với filter: Nghỉ phép | Cập nhật công | (future) Ký số  
- Swipe hoặc button pair **Duyệt / Từ chối** + optional comment  
- «Ai nghỉ cùng ngày» (BambooHR manager view) — Phase 2 nếu API có

---

## 3) Pattern UI/UX (visual + interaction)

### 3.1 Design systems tham chiếu

| System | Áp dụng cho XeVN |
|--------|------------------|
| **Apple HIG** (iOS) | Grouped inset lists `#F2F2F7`, large title, 44pt touch, tab bar SF Symbol style (Ionicons) |
| **SAP SFUX** | **Card library** cho Home widgets; **detail panel** pattern cho leave/payslip |
| **Workday Canvas** | Spacing 8pt grid; semantic status colors — map vào `tokens.ts` |
| **XeVN web** | shadcn muted blocks, StatusBadge, LeaveTab layout — **source of truth Phase 1** |

### 3.2 Home screen (Personio / BambooHR model)

```text
┌─────────────────────────────┐
│ Xin chào, {tên} · {công ty} │
├─────────────────────────────┤
│ [ Chấm công hôm nay    → ]  │  ← primary card
│ [ Tạo đơn nghỉ phép    → ]  │
├─────────────────────────────┤
│ Hôm nay                     │
│ • Check-in 08:02            │
│ • 1 đơn chờ duyệt           │
├─────────────────────────────┤
│ Sắp tới (nghỉ phép)         │
│ • 08–11/08 · Nghỉ phép năm  │
└─────────────────────────────┘
```

### 3.3 Leave detail (target — so với screenshot sponsor)

| Hiện tại (xấu) | Target (benchmark) |
|----------------|-------------------|
| `LVT_01` | «Nghỉ phép năm» + chip màu |
| ISO datetime | `08/08/2026 – 11/08/2026` · `Gửi: 06/06/2026 17:24` |
| `seed:...` | «—» hoặc copy thật; không lộ seed |
| Plain text list | Hero + grouped sections + optional edit |
| Tab icon X | Ionicons filled/outline |

### 3.4 Micro-interactions (Phase 2)

- Pull-to-refresh (đã có)  
- Haptic light on submit approve  
- Bottom sheet confirm thay `Alert`  
- Skeleton loading thay spinner full-screen  
- Push notification deep link → detail (J-MOB)

### 3.5 Accessibility (bắt buộc mọi wave)

- Dynamic Type (iOS) — test 1 level up  
- VoiceOver label trên StatusBadge + CTA  
- Contrast badge ≥ 4.5:1 (`uiux-quality-accessibility.mdc`)

---

## 4) Ma trận ưu tiên XeVN (business × UX)

| Journey | SRS / UC | Benchmark lead | Wave |
|---------|----------|----------------|------|
| J-MOB-03 Leave list→detail | Attendance leave | BambooHR detail + web LeaveTab | **MOB-UX-02** |
| J-MOB-04 Create leave | Leave create | BambooHR calendar flow | **MOB-UX-02** |
| J-MOB-01 Check-in | Attendance | Personio Time Tracking widget | MOB-UX-03 |
| J-MOB-02 Payslip | Payroll | SF detail panel + VND format | MOB-UX-03 |
| J-MOB-05 Manager approve | RBAC manager | Workday manager hub / BambooHR inbox | MOB-UX-03 |
| Home widgets | — | Personio Home | **MOB-UX-02b** (sau UX-02) |

---

## 5) Anti-patterns (tránh)

1. **Developer UI** — raw API field names, ISO, seed strings on screen  
2. **Menu sâu 4 tầng** — enterprise apps đang chuyển sang hub + search (Workday 2026R1); XeVN giữ ≤2 tap tới create leave  
3. **WebView toàn app** — mất offline queue đã build  
4. **Dark theme half-baked** — ship light polished trước  
5. **Parity web 100% trên mobile** — mobile chỉ employee/manager slice; admin vẫn web

---

## 6) Deliverables cho team

| Role | Việc | Output |
|------|------|--------|
| **Dev-Mobile** | MOB-UX-02: Leave theo §3.3 + flow §2.2 | Figma-free — implement trực tiếp + screenshot evidence |
| **Dev-Mobile** | MOB-UX-02b: Home widgets §3.2 | `DashboardScreen` refactor |
| **Dev-FE** | Giữ parity web khi thêm field leave | Update §2B khi web đổi |
| **BA-P** | AC journey J-MOB-* gắn benchmark row §4 | Delta SRS § mobile nếu thiếu balance/handover |
| **QA-Device** | So sánh before/after vs AC-MUX + J-MOB | `pcomp-w4-qa-device-*.md` |

---

## 7) Phase roadmap (cập nhật U46)

```text
UX-01 Foundation     ← formatters, icons, seed (DONE/QA)
UX-02 Leave iOS      ← benchmark §2.2 + §3.3 (P0 sponsor pain)
UX-02b Home hub      ← Personio widgets
UX-03 Attendance/Payroll/Manager
UX-04 Polish         ← haptics, skeleton, push deep link
UX-05 (future)       ← search hub, «Who's out» — Workday-lite
UX-04 Smart Hub v2   ← U48: task-first home, celebrations — `MOBILE_HOME_HUB_UX_RESEARCH.md`
```

**Không claim «đẹp bằng Workday» Phase 1** — mục tiêu: **cùng phân khúc Personio/BambooHR**, data display đúng chuẩn VN, iOS native feel.

---

## Tài liệu tham khảo

- Workday 2026R1 UI / Unified Absence — [successday.nl](https://successday.nl/en/workday-release-2026r1-ui-transformation/)  
- Workday Mobile product — [workday.com](https://www.workday.com/en-us/products/platform-product-extensions/workday-mobile.html)  
- BambooHR Request Time Off mobile — [help.bamboohr.com](https://help.bamboohr.com/s/article/588027)  
- SAP SuccessFactors SFUX — [sap.com/design-system/hcm](https://www.sap.com/design-system/hcm/introduction/introduction/usage)  
- Personio Mobile — [personio.com/product/mobile](https://www.personio.com/product/mobile/)
