# MOB-UX-04 Smart Hub — Delta AC Package

**work_item_id:** `PCOMP-W4-BA-HUB-01`  
**from_role:** ba-process  
**to_role:** pm  
**ack_status:** `PASS_TO_PM`  
**trigger:** U48 · [`MOBILE_HOME_HUB_UX_RESEARCH.md`](./MOBILE_HOME_HUB_UX_RESEARCH.md)  
**program slice:** `MOB-UX-04` (Smart Hub) · execution wave **`MOB-UX-04a`** P0  
**evidence_path:** `docs/program/MOBILE_HOME_HUB_AC_DELTA.md`  
**Ngày:** 2026-06-07

---

## 1. Process objective and actors

| Actor | Vai trò |
|-------|---------|
| Nhân viên (NV) | Sau login thấy **Việc cần làm** (đơn pending của mình + inbox) trên Home |
| Quản lý (`manager` / `hr_manager` JWT) | Home ưu tiên **Cần duyệt (n)** — tổng đơn pending cấp dưới trực tiếp; tap → màn duyệt |
| Dev-BE | Cung cấp aggregate `GET /api/hrm/home/summary` **hoặc** document compose từ endpoint hiện có |
| Dev-Mobile | `DashboardScreen` → Smart Hub v2; persona order; deep link J-* |
| QA / QA-Device | L2.5 `J-MOB-06`..`10` với account UAT matrix |

**Mục tiêu:** Chuyển Trang chủ từ dashboard tĩnh (MOB-UX-02b) sang **task-first Smart Hub** (MOB-UX-04) có AC đo được, trace `UC-HRM-MOB-03` + `UC-HRM-MOB-13`, không mock khi API sẵn.

**Phạm vi wave:**

| Slice | J-* / widget | Giai đoạn |
|-------|--------------|-----------|
| **MOB-UX-04a** (P0 — dispatch ngay) | J-MOB-06, J-MOB-07 | Việc cần làm + manager card on Home |
| **MOB-UX-04b** (P1) | J-MOB-08, J-MOB-09 | Sinh nhật + Ai nghỉ hôm nay |
| **MOB-UX-04c** (P2) | J-MOB-10 | Quick actions pin/unpin |

---

## 2. As-is vs to-be

| Khía cạnh | As-is (`DashboardScreen.tsx`) | To-be (MOB-UX-04 Smart Hub) |
|-----------|------------------------------|----------------------------|
| Task visibility | Pending chỉ trong section «Hôm nay» (1 dòng text) | Section **«Việc cần làm»** riêng, ≥3 preview row + badge tổng |
| Manager approvals | Chỉ tab **Thêm** + badge (`RootNavigator.tsx` L108–140) | Card **«Cần duyệt (n)»** **trên Home** (J-MOB-07) |
| Inbox (`UC-HRM-MOB-13`) | Màn `InAppNotificationsScreen` — không surface Home | Preview inbox (unread / recent) trong «Việc cần làm» |
| Sinh nhật | Không có | Widget celebrations (04b); data `custom_fields.date_of_birth` |
| Who's out | Không có | Widget leave approved overlapping today (04b) |
| API calls | 4 parallel: records, leave, pending leave, pending update | 04a: compose 4–6 calls **hoặc** 1× `home/summary`; NFR ≤4 parallel (SRS_MOBILE §8) |

---

## 3. Traceability map

| Artifact | Liên kết |
|----------|----------|
| **U48** | `TEAM_USER_REQUIREMENTS.md` — Home hub sinh động, task-first |
| **UC-HRM-MOB-03** | Bảng điều khiển cá nhân — Smart Hub là evolution của UC này |
| **UC-HRM-MOB-08** | Manager approve — preview + deep link từ Home |
| **UC-HRM-MOB-13** | Inbox — `GET /api/hrm/notifications/inbox` |
| **UC-HRM-MOB-07** | Đơn pending của NV — preview trên Home |
| **Catalog field** | `date_of_birth` — `settings-catalogs.service.ts` L706; seed `employees.custom_fields.date_of_birth` (`scripts/lib/uat-workforce.mjs`) |
| **SRS** | `docs/hrm/SRS_MOBILE.md` §4.3 (MOB-03), §4.13 (MOB-13), §8 NFR |
| **Research** | `MOBILE_HOME_HUB_UX_RESEARCH.md` §5–6 |

**Journey map action (PM/QA):** Thêm hàng `J-MOB-06`..`10` vào `docs/program/PROGRAM_JOURNEY_MAP.md` §Mobile; cập nhật `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` §Mobile hub khi QA mở cycle.

---

## 4. Journey acceptance criteria (J-MOB-06..10)

### 4.1 J-MOB-06 — Login → Home task visible

**Persona:** NV UAT `uat.nv0001@xe.vn` / `xevn-uat-2026` (hoặc manager sau scope select).

| AC-ID | Điều kiện | Pass (đo được) | Fail |
|-------|-----------|----------------|------|
| AC-MOB-HUB-06-01 | Đăng nhập + scope OK; mạng online | Trong **≤2s** sau `DashboardScreen` mount (cold start sau login), section **«Việc cần làm»** hiển thị (header + body) — không full-screen spinner che section | Section không xuất hiện >2s hoặc crash |
| AC-MOB-HUB-06-02 | Có ≥1 task (inbox unread **hoặc** own pending leave/update) | List ≥1 `ListRow` với title nghiệp vụ (không raw UUID); badge tổng **≥1** | Badge = 0 khi API trả ≥1 pending/inbox |
| AC-MOB-HUB-06-03 | Không có task | Empty state: copy «Bạn đã xử lý hết việc hôm nay» + CTA «Tạo đơn nghỉ» hoặc «Xem thông báo» | Blank / «Chưa có dữ liệu» không CTA |
| AC-MOB-HUB-06-04 | Tap task row (own pending leave) | Navigate `LeaveRequestDetail` với đúng `id` (L2.5 cross-nav) | 404 / wrong screen |
| AC-MOB-HUB-06-05 | Tap «Xem tất cả» | Navigate `InAppNotifications` **hoặc** `LeaveRequestsList` theo loại task | Dead link |
| AC-MOB-HUB-06-06 | Một API task lỗi (500) | Partial state: card lỗi theo module; greeting + section khác vẫn render (SRS MOB-03) | White screen / unhandled rejection |
| AC-MOB-HUB-06-07 | Offline (P1) | Banner cache; section task từ `ASYNC_CACHE.DASHBOARD_V1` hoặc thông báo offline | Ghi âm thầm khi offline |

**Evidence:** `docs/qa/evidence/pcomp-w4-mob-hub-jmob06-YYYYMMDD.md` — screenshot + `adb logcat` timestamp; API HAR hoặc jest integration `homeSummary` / compose calls.

---

### 4.2 J-MOB-07 — Manager Home pending on Home

**Persona:** Manager UAT có `manager` role + `manager_employee_id` trả pending (seed qual hook như J-MOB-05).

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-MOB-HUB-07-01 | `auth.isManager === true` | Card **«Cần duyệt (n)»** xuất hiện **trên Home** (scroll position trước «Hôm nay») | Chỉ thấy badge tab Thêm |
| AC-MOB-HUB-07-02 | API: `GET leave-requests` + `GET update-requests` với `manager_employee_id` | `n = count(leave pending direct reports) + count(update pending direct reports)`; UI badge khớp **±0** | Lệch count hoặc 409 scope |
| AC-MOB-HUB-07-03 | `n > 0` | Preview ≥1 dòng: tên NV + loại đơn (nghỉ / chỉnh sửa CC) | Card ẩn khi n>0 |
| AC-MOB-HUB-07-04 | Tap card / row | Navigate `ManagerApprovals` với filter phù hợp | Mở More menu thay vì approvals |
| AC-MOB-HUB-07-05 | Manager duyệt 1 đơn → quay Home pull-to-refresh | `n` giảm 1; badge tab Thêm đồng bộ | Stale count >90s không refresh |
| AC-MOB-HUB-07-06 | NV không phải manager | Card «Cần duyệt» **không** render | Hiển thị cho NV |
| AC-MOB-HUB-07-07 | Cross-nav approve | Home → ManagerApprovals → approve → success toast (J-MOB-05 regression) | Raw `HRM-ATT-REQ-203` |

**Evidence:** Cùng file J-MOB-06 + manager account; so sánh với `ManagerApprovalsScreen.tsx` load query.

---

### 4.3 J-MOB-08 — Birthday today (MOB-UX-04b — AC locked sẵn)

**Persona:** NV trong scope có đồng nghiệp `custom_fields.date_of_birth` MM-DD = hôm nay (Asia/Ho_Chi_Minh).

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-MOB-HUB-08-01 | Hôm nay = DOB của **chính user** | Banner «Chúc mừng sinh nhật, {tên}!»; **không** hiển thị năm sinh (BR-BDAY-01) | Thiếu banner hoặc lộ năm |
| AC-MOB-HUB-08-02 | ≥1 đồng nghiệp sinh nhật trong scope công ty | Section «Sinh nhật hôm nay»: avatar initials + **tên**; tối đa 10 preview + «Xem thêm» | Không hiện khi API trả ≥1 |
| AC-MOB-HUB-08-03 | Không ai sinh nhật | Section **ẩn** (không empty card chiếm chỗ) | «Chưa có dữ liệu» |
| AC-MOB-HUB-08-04 | Response/API log | Không field `birth_year` / full ISO year trong payload hub/celebrations | `1990-06-07` hiển thị trên UI |
| AC-MOB-HUB-08-05 | NV `inactive` / `archived_at` set | Không liệt kê trong celebrations | Hiện NV đã nghỉ |
| AC-MOB-HUB-08-06 | Scope `main` rollup (group CEO mobile — nếu áp dụng) | Chỉ NV thuộc `companyIds` resolver; không leak member khác tenant | 409 / wrong company |

**Evidence:** `docs/qa/evidence/pcomp-w4-mob-hub-jmob08-YYYYMMDD.md`; seed ít nhất 2 NV cùng ngày sinh pilot.

---

### 4.4 J-MOB-09 — Who's out today (MOB-UX-04b)

**Persona:** NV bất kỳ trong cùng `company_id`.

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-MOB-HUB-09-01 | ≥1 `leave_requests` **approved** với `start_date ≤ today ≤ end_date` | Section «Ai nghỉ hôm nay (n)»: tên + `leave_type` label (i18n `leaveTypes.ts`) | Không hiện khi có đơn approved overlap |
| AC-MOB-HUB-09-02 | Chỉ pending / rejected | Không liệt kê | Pending hiện như đang nghỉ |
| AC-MOB-HUB-09-03 | Tap row | Navigate `LeaveRequestDetail` (read-only) hoặc profile stub — **không** approve từ widget | Dead end |
| AC-MOB-HUB-09-04 | Không ai nghỉ | Section ẩn hoặc «Không có ai nghỉ hôm nay» (1 dòng, không card lớn) | Error banner |
| AC-MOB-HUB-09-05 | Privacy | Không hiển thị lý do nghỉ chi tiết trên Home preview (chỉ loại nghỉ) | Lộ `reason` dài |

**Evidence:** API probe `leave-requests?status=approved` + client filter today; device screenshot.

---

### 4.5 J-MOB-10 — Quick action customize (MOB-UX-04c — Phase 2)

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-MOB-HUB-10-01 | User long-press / edit quick action | Ẩn 1 action khỏi horizontal chips; persist `AsyncStorage` key `home_quick_actions_v1` | Không persist sau kill app |
| AC-MOB-HUB-10-02 | Restore | Sau relaunch, thứ tự/visibility giữ nguyên | Reset default |
| AC-MOB-HUB-10-03 | Scope | Tối thiểu 2 quick actions luôn hiển thị (Chấm công + Tạo nghỉ) | Ẩn hết |

**Gate:** QA **không** FAIL 04a vì J-MOB-10 chưa implement — mark **DEFERRED** đến MOB-UX-04c.

---

## 5. Business rule matrix

### 5.1 Birthday visibility (`BR-BDAY-*`)

| Mã | Điều kiện | Hành động | Kết quả | Nguồn dữ liệu |
|----|-----------|-----------|---------|--------------|
| BR-BDAY-01 | Hiển thị UI bất kỳ (banner, list, push) | **Che năm sinh** — chỉ DD/MM hoặc copy «Sinh nhật hôm nay» | Không lộ tuổi | U48 privacy; Personio/HiBob pattern |
| BR-BDAY-02 | Server aggregate celebrations | Trả `display_date: "07/06"` hoặc `month_day: "06-07"`; **không** trả `birth_year` | Mobile không parse ISO đầy đủ | `employees.custom_fields.date_of_birth` |
| BR-BDAY-03 | `date_of_birth` null / invalid | Bỏ qua NV đó | Không crash query | Catalog optional field |
| BR-BDAY-04 | So khớp ngày | Dùng timezone **`Asia/Ho_Chi_Minh`** cho «hôm nay» | Đồng nhất VN pilot | SRS NFR |
| BR-BDAY-05 | Chính user sinh nhật | Banner cá nhân **ưu tiên** trên celebration list | 1 lần/ngày confetti (04c) | Research §4.4 |
| BR-BDAY-06 | Scope list | `resolveHrmListScope` — cùng rule list employees | Không 409 | ADR scope ladder |

### 5.2 Manager task aggregation (`BR-MGR-TASK-*`)

| Mã | Điều kiện | Hành động | Kết quả | API |
|----|-----------|-----------|---------|-----|
| BR-MGR-TASK-01 | User có role `manager` hoặc `hr_manager` | Bật aggregation manager | `isManager` từ JWT (`jwtClaims.ts`) | — |
| BR-MGR-TASK-02 | Đếm pending duyệt | Query leave + update với `manager_employee_id={viewer}` | Chỉ **cấp dưới trực tiếp** (`employees.manager_id`) | `attendance.service.ts` L615–619 pattern |
| BR-MGR-TASK-03 | Tổng badge Home | `pending_approval_count = \|leave_pending\| + \|update_pending\|` | Khớp ManagerApprovals list | Không đếm inbox broadcast |
| BR-MGR-TASK-04 | Section order manager | **Cần duyệt** → Việc cần làm (inbox/own) → Hôm nay | Task-first | Research §4.3 |
| BR-MGR-TASK-05 | Section order NV | Việc cần làm → Hôm nay → Sắp tới | Không hiện Cần duyệt | — |
| BR-MGR-TASK-06 | Inbox trong «Việc cần làm» | `GET /notifications/inbox` `limit≤5`; unread = `read_at IS NULL` | Preview tối đa 5; tap → `InAppNotifications` | `UC-HRM-MOB-13` |
| BR-MGR-TASK-07 | Own pending | `employee_id={viewer}` + `status=pending` trên leave/update | Không trộn vào manager count | `DashboardScreen` hiện tại |
| BR-MGR-TASK-08 | Trùng đơn (vừa inbox vừa pending) | Dedupe theo `entity_id` + `kind` | Một row trên UI | Dev-Mobile merge rule |
| BR-MGR-TASK-09 | API lỗi một nhánh | Partial card + `formatHrmError` | Không fail cả Home | SRS MOB-03 |

### 5.3 Inbox event mapping (`BR-INBOX-HUB-*`)

| `event_type` (payload) | Label Home | Deep link |
|------------------------|------------|-----------|
| `leave_request.created` | «Đơn nghỉ mới — {name}» | `ManagerApprovals` (manager) / `LeaveRequestsList` (NV) |
| `leave_request.approved` / `rejected` | «Đơn nghỉ đã {trạng thái}» | `LeaveRequestDetail` |
| `attendance_update_request.*` | «Chỉnh sửa chấm công — {name}» | `ManagerApprovals` / `UpdateRequests` |

---

## 6. Data contract — `GET /api/hrm/home/summary`

### 6.1 Quyết định BA (khuyến nghị)

| Option | Mô tả | Wave 04a |
|--------|-------|----------|
| **A — Compose client** | Mobile gọi 4–6 endpoint hiện có (≤4 parallel/batch) | **PASS 04a** nếu đủ AC-MOB-HUB-06/07 |
| **B — Aggregate BE** | Một endpoint `home/summary` | **Khuyến nghị** giảm latency + single scope check; optional 04a, **bắt buộc** trước 04b celebrations |

Dev-BE chọn A hoặc B; QA evidence ghi rõ path đã test.

### 6.2 Proposed aggregate endpoint (Option B)

```
GET /api/hrm/home/summary
```

**Query**

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `company_id` | UUID/slug | Y | Scope công ty active |
| `employee_id` | UUID | Y | Viewer |
| `include` | string | N | CSV: `tasks,manager_pending,celebrations,whos_out` — default `tasks,manager_pending` cho 04a |

**Headers:** `Authorization`, `x-tenant-id`, `x-company-id` (chuẩn HRM).

**Response 200** (`HRM-HOME-200`)

```json
{
  "success": true,
  "code": "HRM-HOME-200",
  "data": {
    "viewer": {
      "employee_id": "uuid",
      "display_name": "Nguyễn Văn A",
      "is_manager": true,
      "is_birthday_today": false
    },
    "tasks": {
      "total_count": 4,
      "unread_inbox_count": 2,
      "own_pending_count": 1,
      "items": [
        {
          "id": "uuid",
          "kind": "manager_approval_leave",
          "title": "Duyệt đơn nghỉ — Trần B",
          "subtitle": "01/07 – 03/07 · Phép năm",
          "priority": 1,
          "entity_type": "leave_request",
          "entity_id": "uuid",
          "created_at": "2026-06-07T08:00:00Z",
          "deep_link": "ManagerApprovals"
        }
      ]
    },
    "manager_pending": {
      "total_count": 3,
      "leave_count": 2,
      "update_count": 1,
      "preview": []
    },
    "celebrations": {
      "total_count": 0,
      "items": []
    },
    "whos_out": {
      "total_count": 0,
      "items": []
    },
    "attendance_today": {
      "checked_in": true,
      "check_in_at": "2026-06-07T08:02:00+07:00",
      "status": "present"
    },
    "generated_at": "2026-06-07T09:00:00+07:00"
  }
}
```

**`celebrations.items[]` (04b)**

| Field | Type | Rule |
|-------|------|------|
| `employee_id` | UUID | — |
| `display_name` | string | `full_name` |
| `month_day` | string | `MM-DD` only |
| `display_date` | string | `DD/MM` VN format |
| `avatar_initials` | string | 1–2 ký tự |
| ~~`birth_year`~~ | — | **Cấm** (BR-BDAY-01) |

**`whos_out.items[]` (04b)**

| Field | Type | Rule |
|-------|------|------|
| `employee_id` | UUID | — |
| `display_name` | string | — |
| `leave_type` | string | Code → i18n label |
| `leave_request_id` | UUID | Deep link |

**Errors**

| HTTP | Code | Khi |
|------|------|-----|
| 401 | `HRM-AUTH-001` | Unauthorized |
| 409 | `HRM-ERR-SCOPE-INVALID` | company mismatch |
| 400 | `HRM-ERR-VALIDATION` | Thiếu `employee_id` |

### 6.3 Compose-from-existing (Option A — 04a minimum)

Mobile **phải** gọi (cùng scope `company_id` + `employee_id`):

| # | Endpoint | Mục đích | Map vào hub |
|---|----------|----------|-------------|
| 1 | `GET /notifications/inbox?company_id&employee_id&limit=5` | Inbox preview | `tasks.items` (kind=inbox) |
| 2 | `GET /attendance/leave-requests?company_id&employee_id&status=pending` | Own pending | `tasks` + count |
| 3 | `GET /attendance/update-requests?company_id&employee_id&status=pending` | Own pending | `tasks` + count |
| 4 | `GET /attendance/leave-requests?company_id&status=pending&manager_employee_id` | Manager only | `manager_pending` |
| 5 | `GET /attendance/update-requests?company_id&status=pending&manager_employee_id` | Manager only | `manager_pending` |
| 6 | `GET /attendance/records?company_id&employee_id&from_date={today}&to_date={today}` | Check-in today | «Hôm nay» (giữ) |

**04b bổ sung:**

| # | Endpoint / query mới | Mục đích |
|---|---------------------|----------|
| 7 | `GET /employees/celebrations?company_id&on_date={today}` **(mới)** hoặc SQL `custom_fields->>'date_of_birth'` MM-DD | J-MOB-08 |
| 8 | `GET /attendance/leave-requests?company_id&status=approved` + client filter today ∈ [start,end] | J-MOB-09 |

**Catalog / storage trace `date_of_birth`:**

- Catalog definition: `settings-catalogs` employee field `date_of_birth` (unit `date`, active).
- Runtime value: `employees.custom_fields.date_of_birth` (ISO `YYYY-MM-DD` in seed).
- BE celebrations query **must** project only MM-DD to client (BR-BDAY-02).

---

## 7. Persona section order (deterministic)

| Persona | Block order (top → bottom) |
|---------|---------------------------|
| NV | Greeting → Quick actions → **Việc cần làm** → Hôm nay → Sắp tới → (04b) Sinh nhật → (04b) Ai nghỉ |
| Manager | Greeting → **Cần duyệt (n)** → Quick actions → Việc cần làm → Hôm nay → Sắp tới → (04b) … |
| HR manager | Giống manager; (04b) celebration card rộng hơn (max 10 avatars) |

---

## 8. Handoff package

### 8.1 Dev-BE (`MOB-UX-04a-BE`)

**Entry:** File này §5–6; `MOBILE_HOME_HUB_UX_RESEARCH.md` §3.

**Exit:**

- [ ] Document trong code/OpenAPI: Option A compose **hoặc** implement `GET /home/summary` stub với `tasks` + `manager_pending`
- [ ] Scope: `resolveHrmListScope` trên mọi sub-query
- [ ] Unit spec: manager count = direct reports only; 409 on scope mismatch
- [ ] (04b) `celebrations` query không trả `birth_year`

**Không làm trong 04a:** confetti, quick-action server prefs, push deep link.

### 8.2 Dev-Mobile (`MOB-UX-04a-MOB`)

**Entry:** `DashboardScreen.tsx`; `AuthContext.isManager`; design tokens MOB-UX-02.

**Exit:**

- [ ] Section «Việc cần làm» + manager card «Cần duyệt (n)» per §7 order
- [ ] Deep links AC-MOB-HUB-06-04, 07-04
- [ ] Dedupe BR-MGR-TASK-08; partial error BR-MGR-TASK-09
- [ ] Vitest: merge task list + manager count from fixture envelopes

### 8.3 QA

**Entry:** J-MOB-06, 07 PASS criteria §4.1–4.2.

**Exit:** Evidence file; J-MOB-08..09 **NOT PROMOTED** until 04b dispatch.

---

## 9. Open risks and clarifications

| ID | Rủi ro | Owner | Mitigation |
|----|--------|-------|------------|
| R-HUB-01 | UAT seed DOB không có NV sinh nhật «hôm nay» | DevOps/QA | Qual hook: set 2 NV `date_of_birth` = today trước J-MOB-08 |
| R-HUB-02 | `leave-requests` list thiếu filter `on_date` — client filter 200 rows | Dev-BE 04b | Thêm query `covering_date` |
| R-HUB-03 | Inbox broadcast (`recipient_employee_id NULL`) hiện manager | Dev-Mobile | Manager: show as «Thông báo chung»; không tăng `pending_approval_count` |
| R-HUB-04 | Latency >2s nếu 6 sequential calls | Dev-BE | Prefer `home/summary` or 2 batch Promise.all |
| R-HUB-05 | J-MOB-10 deferred — QC không block 04a | PM | Mark DEFERRED in journey map |

**Clarification closed (BA):** Che năm sinh = **bắt buộc** Phase 1 (U48 privacy). Không cần sponsor waiver.

---

## 10. Completion contract

```yaml
completion_report: |
  Closed: Delta AC package MOB-UX-04 Smart Hub — formal J-MOB-06..10 with pass/fail AC-IDs,
  BR-BDAY-* / BR-MGR-TASK-* / BR-INBOX-HUB-* matrices, trace UC-HRM-MOB-03/07/08/13 + date_of_birth catalog,
  data contract GET /api/hrm/home/summary + compose-from-existing map for MOB-UX-04a.
  Residual: J-MOB-08/09/10 execution in MOB-UX-04b/c; PROGRAM_JOURNEY_MAP rows J-MOB-06..10 (PM sync);
  celebrations BE endpoint not yet implemented.

next_owner: pm

next_dispatch_prompt: |
  work_item_id: MOB-UX-04a-BE
  Dispatch dev-be: Implement Smart Hub data layer per docs/program/MOBILE_HOME_HUB_AC_DELTA.md §6 —
  either document compose-from-existing (6 calls) in hrmApiClient + scope tests, OR add GET /api/hrm/home/summary
  returning tasks + manager_pending per contract (include BR-MGR-TASK-02/03). Exit: controller spec PASS,
  resolveHrmListScope on all branches, no birth_year in any 04a response. ack_status: READY_FOR_QA.
  Then dispatch dev-mobile MOB-UX-04a-MOB: Refactor DashboardScreen to Smart Hub v2 — sections «Việc cần làm»
  (AC-MOB-HUB-06) and manager «Cần duyệt (n)» on Home (AC-MOB-HUB-07), persona order §7, deep links to
  ManagerApprovals / InAppNotifications / LeaveRequestDetail. Spec_ref: MOBILE_HOME_HUB_AC_DELTA.md §4.1–4.2, §8.2.
  Exit: vitest task merge + device-ready; ack_status: READY_FOR_QA. PM then dispatch qa-device J-MOB-06/07.

evidence_path: docs/program/MOBILE_HOME_HUB_AC_DELTA.md
ack_status: PASS_TO_PM
```
