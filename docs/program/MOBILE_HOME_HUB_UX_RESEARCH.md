# Nghiên cứu Home Hub & điều hướng — HRM + quản trị tổ chức (quốc tế)

**work_item_id:** `PCOMP-W4-MOB-HUB-RESEARCH-01`  
**Ngày:** 2026-06-07  
**Trigger:** U48 — sponsor yêu cầu Home sinh động, task ngay sau login, sinh nhật, chuẩn UX quốc tế  
**Liên kết:** `MOBILE_HRM_BENCHMARK_TOP_APPS.md` · `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` · `MOBILE_IOS_UX_INHERITANCE_PLAN.md`

---

## 1) Kết luận executive (1 trang)

| Khía cạnh | App quốc tế làm gì | XeVN hiện tại | Gap |
|-----------|-------------------|---------------|-----|
| **Ngay sau login** | To-do / Inbox nổi bật + quick actions cấu hình | 2 action card + block «Hôm nay» tĩnh | Thiếu **task queue**, thiếu **cá nhân hóa theo vai** |
| **Sinh nhật / kỷ niệm** | Card «People to celebrate» (Personio web, HiBob mobile) | Không có | **Thiếu API + widget** (có field `date_of_birth` trong catalog) |
| **Việc cần làm hôm nay** | Workday Quick Actions; Viva Tasks card; BambooHR inbox | Chỉ đếm pending của **chính mình** | Manager thiếu **«3 việc cần duyệt»** trên Home |
| **Navigation** | 4–5 tab + Inbox badge + hub cards | 4 tab + More sâu | **More = ngăn chứa** — chưa phải hub |
| **Sinh động / cảm xúc** | Animation celebration, avatar, màu theo sự kiện | Flat cards, không illustration | Phase 2 polish |

**Định hướng XeVN:** Giữ **4 tab bottom** (đã lock DS) nhưng **biến Trang chủ thành Smart Hub** theo mô hình **Workday Home + Personio widgets + HiBob culture layer** — không thêm tab thứ 5; đưa **Inbox/Tasks** lên Home dưới dạng card có hành động.

---

## 2) Benchmark mở rộng (HRM + org / team)

### 2.1 HRM chuyên sâu

| App | Home sau login | Sinh nhật / văn hóa | Task / việc cần làm | Navigation |
|-----|--------------|---------------------|---------------------|------------|
| **[Personio](https://www.personio.com/product/mobile/)** | Widget: Time Off, Who's Out, Time Tracking, Documents, Announcements | **Web:** card «People to celebrate» (birthday/anniversary, animation). **Mobile:** chưa đầy đủ celebration card — inbox sync desktop | **Inbox** icon — task/notification đồng bộ web; phức tạp → mở browser | Bottom areas + widget scroll |
| **[Workday Mobile](https://www.workday.com/en-us/products/platform-product-extensions/workday-mobile.html)** | **2025R2 Quick Actions** — tối đa 5 nút + overflow; personalized home | Announcements trên home; AI answers | **Notifications + tasks** — «take action immediately» | Home-centric; role-based cards |
| **[BambooHR](https://help.bamboohr.com/s/article/588027)** | Widget Request Time Off; inbox trên Home | Limited mobile | **Inbox filter:** Time Off / Timesheet / Signature | My Info + Home widgets |
| **[HiBob](https://www.hibob.com/product-briefs/mobile-app/)** | **Company homepage** — news, shoutouts, **birthdays, anniversaries, new joiners** | **Core mobile** — celebration + kudos văn hóa | **Manage and complete tasks** + performance reviews | Home = social + HR hub |
| **[SAP SFUX](https://www.sap.com/design-system/hcm/)** | Bite-Snack-Meal; Home + To-Do + Browse | Profile-based | To-Do tab riêng | 3 pillar tabs |

### 2.2 Quản trị tổ chức / làm việc nhóm (pattern áp dụng cho «sinh động»)

| App | Pattern học được | Áp dụng XeVN |
|-----|------------------|--------------|
| **[Microsoft Viva Connections](https://learn.microsoft.com/en-us/viva/connections/available-dashboard-cards)** | **Dashboard cards** — reorder/hide; Announcements top; Tasks, Approvals, Shifts cards | `HomeWidgetRegistry` — card có thể ẩn/hiện theo role |
| **[Slack / Teams](https://support.microsoft.com/en-us/viva/connections/viva-connections-on-mobile-devices)** | Activity feed + badge; deep link | Realtime feed snippet trên Home (đã có socket — chưa surface UI) |
| **Lattice / Culture Amp** | 1:1 reminders, review cycles on home | Phase 3 — performance |
| **Notion / Asana home** | «My tasks today» grouped by due | **«Việc của tôi hôm nay»** section |

### 2.3 Quy luật chung (industry 2025–2026)

1. **F-pattern trên mobile:** Greeting + **urgent actions** → **tasks/inbox** → **context today** → **upcoming/social**
2. **Không bury approvals** — manager thấy pending **trên Home**, không chỉ More
3. **Celebration = lightweight** — avatar circle + tên + «Chúc mừng sinh nhật» — không cần full social network Phase 1
4. **Configurable quick actions** — Workday 2025: admin/ user reorder 5 nút
5. **Empty states có personality** — illustration + CTA, không chỉ «Chưa có dữ liệu»

---

## 3) So sánh với XeVN `DashboardScreen` hiện tại

```text
HIỆN TẠI (MOB-UX-02b)          TARGET (MOB-UX-04 Smart Hub)
─────────────────────          ─────────────────────────────
Greeting                       Greeting + contextual subtitle (role)
2 action cards                 Quick Actions row (3–5, role-based)
Hôm nay (check-in, pending)    ┌─ Việc cần làm (inbox/tasks) ─┐
Sắp tới (leave)                │ Duyệt 2 · Ký 1 · Đọc 3        │
                               ├─ Hôm nay (attendance) ─────────┤
                               ├─ Ai nghỉ / Sinh nhật ──────────┤
                               └─ Sắp tới ──────────────────────┘
More → Duyệt (manager)         Manager: approve card ON HOME
More → Thông báo               Inbox preview + «Xem tất cả»
```

**Thiếu data/API (phải BE trước FE):**

| Widget | API / data | Ghi chú |
|--------|------------|---------|
| Sinh nhật hôm nay | `GET employees?celebrations=today` hoặc query `date_of_birth` MM-DD | Catalog có `date_of_birth`; cần endpoint scoped |
| Việc cần làm | `GET /notifications/inbox` + aggregate pending approvals | SRS UC-HRM-12, MOB-13 — **đã có**, chưa compose Home |
| Ai nghỉ hôm nay | Leave list filter today | Personio «Who's Out» — API leave by date |
| Announcements | Broadcast inbox hoặc XBOS | Phase 2 |
| Quick actions config | Local AsyncStorage + server prefs | Workday pattern — Phase 2 admin |

---

## 4) Thiết kế điều hướng đề xuất (không phá 4 tab)

### 4.1 Tab bar — giữ nguyên, đổi vai trò mental model

| Tab | Tên hiển thị | Vai trò mới |
|-----|--------------|-------------|
| **Trang chủ** | Trang chủ | **Smart Hub** — mọi thứ «hôm nay» |
| **Chấm công** | Chấm công | Deep work time — không duplicate hub |
| **Đơn công** | Đơn công | Absence hub — list + create |
| **Thêm** | Thêm | **Profile + cài đặt + deep links** — giảm menu dài; chuyển Duyệt lên Home cho manager |

**Tùy chọn Phase 2:** Tab «Thêm» → **«Bạn»** (Personio/HiBob «You») nếu sponsor muốn inbox-centric.

### 4.2 Cấu trúc scroll Home (top → bottom)

```text
┌──────────────────────────────────────┐
│ 🎂 Chúc mừng sinh nhật, Lan!         │  ← conditional banner (today = user DOB)
│    hoặc: «Hôm nay có 2 đồng nghiệp   │
│    sinh nhật» → tap xem               │
├──────────────────────────────────────┤
│ Xin chào, {tên} · {đơn vị}           │
├──────────────────────────────────────┤
│ [Quick: Chấm công] [Tạo nghỉ] [+2]   │  ← horizontal scroll chips
├──────────────────────────────────────┤
│ ⚡ Việc cần làm              (3) →   │  ← NEW — inbox + manager pending
│  • Duyệt đơn nghỉ — Nguyễn A         │
│  • Chấm công chưa hoàn thành          │
├──────────────────────────────────────┤
│ Hôm nay                               │
│  • Check-in 08:02 · Đúng giờ          │
├──────────────────────────────────────┤
│ 🎉 Sinh nhật & kỷ niệm               │  ← NEW — avatars horizontal
│  (Lan · 3 năm · Minh)                 │
├──────────────────────────────────────┤
│ Ai nghỉ hôm nay (2)                   │  ← NEW — Personio Who's Out
├──────────────────────────────────────┤
│ Sắp tới (nghỉ phép)                   │
└──────────────────────────────────────┘
```

### 4.3 Persona — nội dung Home khác nhau

| Persona | Sections ưu tiên (order) |
|---------|--------------------------|
| **Nhân viên** | Quick actions → Việc của tôi (đơn pending) → Hôm nay → Sắp tới |
| **Quản lý** | **Việc cần duyệt (N)** → Quick actions → Hôm nay team → Sắp tới |
| **HR (`hr_manager`)** | Giống manager + link Operations; celebration card rộng hơn |

### 4.4 «Sinh động» — trong phạm vi DS (không gamification thừa)

| Element | Spec | Ref |
|---------|------|-----|
| Birthday banner | Gradient nhẹ `#FEF3C7` → `#FFFFFF`; emoji 🎂 optional | HiBob celebration |
| Avatar initials | Circle 40pt, màu hash tên | SFUX people card |
| Task row | Icon trái + chevron; swipe dismiss read | iOS Mail |
| Celebration micro-animation | Lottie confetti **chỉ** khi chính user sinh nhật — 1 lần/ngày | Personio web animation |
| Skeleton | Shimmer cards thay full-screen spinner | Workday |

---

## 5) Ma trận journey & AC (draft cho BA)

| ID | Journey | AC (pass) |
|----|---------|-----------|
| J-MOB-06 | Login → Home task visible | ≤2s sau login, section «Việc cần làm» có ≥0 item hoặc empty CTA rõ |
| J-MOB-07 | Manager Home pending | Manager thấy card «Cần duyệt (n)» **trên Home**, tap → inbox |
| J-MOB-08 | Birthday today | Nếu có NV sinh nhật hôm nay trong scope → hiển thị tên (không lộ năm sinh nếu policy) |
| J-MOB-09 | Who's out today | ≥1 colleague on leave today → list tên + loại nghỉ |
| J-MOB-10 | Quick action customize | User pin/unpin 1 action (local) — Phase 2 |

---

## 6) Roadmap triển khai

```text
MOB-UX-04a (P0 sponsor)  Smart Hub v2 — «Việc cần làm» + manager card on Home
                         API: compose inbox + pending (existing endpoints)
                         Dev-Mobile + Dev-BE (aggregate endpoint optional)

MOB-UX-04b (P1)          Celebrations + Who's Out
                         Dev-BE: celebrations query; seed DOB pilot

MOB-UX-04c (P2)          Quick actions config, skeleton, confetti, push deep link

MOB-UX-05 (nav)          Refactor More → «Bạn»; giảm depth menu
```

**Không claim parity Personio/Workday Phase 1** — mục tiêu: **cùng logic hub** (task-first home), văn hóa VN, data thật.

---

## 7) RACI — ai chịu trách nhiệm

| Deliverable | Owner | Reviewer |
|-------------|-------|----------|
| Nghiên cứu & direction (tài liệu này) | **PM** | Sponsor |
| AC J-MOB-06..10, BR data birthday | **BA-Process** | BA-Data |
| API celebrations / home aggregate | **Dev-BE Lead** | SA |
| Home widgets, navigation refactor | **Dev-Mobile Lead** | Dev-FE (parity) |
| Visual polish, motion | **Dev-Mobile** | PM + sponsor |
| Device evidence persona | **QA-Device** | QA Lead |
| GO release slice | **QC** | PM |

---

## 8) Tài liệu tham khảo

- Personio mobile overview — [support.personio.de](https://support.personio.de/hc/en-us/articles/22089774701853-Overview-of-the-Personio-mobile-app)
- Personio Home celebrations config — [support.personio.de](https://support.personio.de/hc/en-us/articles/115005034909)
- Workday Mobile datasheet — [workday.com PDF](http://workday.com/content/dam/web/en-us/documents/datasheets/workday-mobile-datasheet-enus.pdf)
- Workday 2025R2 Quick Actions — [wellbuiltnewsletter.com](https://www.wellbuiltnewsletter.com/p/workday-2025r2-platform-changes-364c)
- HiBob mobile — [hibob.com/product-briefs/mobile-app](https://www.hibob.com/product-briefs/mobile-app/)
- Microsoft Viva Connections cards — [learn.microsoft.com](https://learn.microsoft.com/en-us/viva/connections/available-dashboard-cards)
- XeVN SRS Mobile UC-HRM-MOB-13 — `docs/hrm/SRS_MOBILE.md`
