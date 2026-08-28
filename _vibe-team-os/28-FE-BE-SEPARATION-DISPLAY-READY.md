# 28 — FE/BE separation & display-ready API (SoT mọi dự án)

**Work item neo:** `OS-STD-FEBE-SOC-01` · **Cập nhật:** 2026-08-03  
**Ai đọc:** SA, TM, PM (dispatch), `dev-fe` / `dev-be` / `dev-mobile`, QA/QC (reject gate)  
**Đọc kèm:** `25` (SOLID/convention) · `26` (dev lanes) · `13` §3.4.11.F / **F.1** (API_DESIGN) · `04` / `14` (CODE-MEMORY)

---

## 0. Một câu khóa

> **Frontend = UI/UX + validate form + gọi API + bind response + trạng thái màn hình.**  
> **Backend = 100% nghiệp vụ + biến đổi + contract + truy vấn DB — trả về payload đã sẵn để hiển thị (display-ready).**  
> FE **không** là nơi “ghép đồ”, “tính lương/BH”, hay “tự invent DTO tổng hợp”.

Đây là SoT **tách trách nhiệm tuyệt đối** giữa FE và BE — bổ sung `26` (ai làm lane nào) bằng **ranh giới nội dung** trong từng response/API.

---

## 1. Why — vì sao phải khóa cứng

### 1.1 Ba failure mode lặp lại trên mọi dự án

| Failure mode | Triệu chứng | Hệ quả |
|--------------|-------------|--------|
| **A. Double business rule** | Cùng BR (phạm vi, duyệt nghỉ, tỷ lệ BH) viết ở Service **và** trong component/hook FE | Đổi rule một nơi → UI lệch API; QA “PASS API / FAIL browser” |
| **B. Drift FE vs BE** | FE reshape sâu (join 3 list, map status → nhãn, tính aggregate) trong khi BE đã/ sẽ đổi shape | Mỗi sprint FE “vá mapper”; OpenAPI/API_DESIGN không còn SoT |
| **C. Untestable UI** | Component chứa công thức + merge graph → unit test phải mock cả thế giới | Vitest phình; regression chậm; hotfix UI phá BR |

### 1.2 Rationale kỹ thuật (ngắn, đủ để train agent)

1. **Một nguồn sự thật cho BR** — công thức, scope ladder, state machine duyệt nằm ở BE (hoặc domain lib **server-side**). FE chỉ trình bày kết quả đã quyết định.
2. **Contract ổn định cho UI** — response mang `label`, `statusTone`, nested view model khi cần; FE không phải biết schema nội bộ 5 bảng.
3. **Scope parity list ↔ get-by-id** là **BE-owned** — FE không “tự lọc lại” để che 409/403.
4. **API_DESIGN F.1** đã yêu cầu *Mục đích + Nghiệp vụ xử lý + Bước SRS* — doctrine này khóa thêm: **payload = view model tiêu thụ được**, không dump entity thô rồi bắt FE hoàn thiện.
5. **SOLID S/I** (`25`): UI layer không chứa lý do đổi khi sponsor đổi BR tính toán; Service không hardcode layout CSS.

### 1.3 Không phải gì

- Không cấm FE validate **form** (Zod client) — đó là UX sớm, không thay BR server.
- Không bắt mọi field phải pre-format string trên BE (xem §4 vùng xám).
- Không dán lại chat sponsor — chỉ chiết xuất quy tắc vận hành.

---

## 2. Ma trận trách nhiệm

| Trách nhiệm | FE Web / Mobile | BE (API + domain) | Ghi chú |
|-------------|-----------------|-------------------|---------|
| Layout, a11y, i18n key, loading / empty / error | ✅ | ❌ | Empty hợp lệ ≠ che lỗi API |
| Form / input validation (Zod, required, format ô) | ✅ | ✅ validate lại biên HTTP | Server vẫn SoT — không tin client |
| Gọi API, bind field → component | ✅ | ❌ (viết API) | Bind đúng contract đã khóa |
| Business transform (status machine, eligibility) | ❌ | ✅ | |
| Deep reshape / join nhiều entity graph | ❌ | ✅ | FE cấm “Promise.all 4 list rồi merge” thành DTO tự nghĩ |
| Công thức lương / BH / thuế / scope rollup | ❌ | ✅ | |
| Aggregate DTO / list row view model | ❌ invent | ✅ sở hữu | Khai trong API_DESIGN |
| Nhãn hiển thị nghiệp vụ (`statusLabel`, tên phòng) | consume | ✅ trả sẵn khi UI cần | FE không map enum→VI nếu BE đã có catalog |
| List ↔ detail **scope parity** | consume header/token | ✅ **sở hữu** resolver | |
| Mã lỗi ổn định (`XBOS-*`, `HRM-*`) | hiển thị / map toast | ✅ phát hành | |
| OpenAPI / DTO version | đọc | ✅ | |
| Presentation format `dd/MM/yyyy`, nhóm nghìn vi-VN | ✅ pure format | có thể trả ISO/number | §4 |
| Optimistic UI | ✅ + rollback | SoT sau 2xx/4xx | §4 |

### 2.1 FE — ĐƯỢC / CẤM (checklist nhanh)

**ĐƯỢC**

- Pure UI/UX; state loading / success / empty / error.
- Schema validate input trước khi POST (Zod/client).
- `fetch` / React Query → gán props; conditional render theo field **đã có** trong response.
- Format trình bày thuần (ngày/tiền) từ số/ISO đã final.
- Optimistic update **có** rollback khi fail.

**CẤM**

- Complex business transforms; nhánh “nếu role X và period Y thì…”.
- Deep structure reshaping (flatten/nest lại graph lớn cho “tiện render”).
- Join/merge nhiều entity graphs mà BE phải assemble (NV + HĐ + BH + phòng → một row).
- Payroll / insurance / scope business formulas trên browser.
- Invent aggregate DTO trong FE rồi coi đó là contract ngầm.

### 2.2 BE — ĐƯỢC / BẮT BUỘC

- 100% business logic, transforms, API contracts, DB queries (kèm index/RLS khi cần).
- Shape response **cho UI**: labels, nested view models, flags `canApprove`, stable error codes.
- List và get-by-id dùng **cùng** scope resolver.
- Mọi field FE bind được ghi trong API_DESIGN (F.1 + map cột DB).

---

## 3. Display-ready response — định nghĩa + ví dụ

### 3.1 Định nghĩa

Một response **display-ready** khi:

1. FE có thể render **hàng/list/detail** chủ yếu bằng gán field — không cần join thêm API chỉ để có nhãn cơ bản.
2. Quyết định nghiệp vụ đã nằm trong payload (`can*`, `status`, `reasonCode`) — FE không tái tính.
3. Lỗi mang **mã ổn định** + message an toàn cho user (không stack/SQL).
4. Shape khớp API_DESIGN / OpenAPI đã confirm — không “entity dump” tùy hứng.

**Không bắt buộc:** mọi số đã là string có dấu phẩy; ISO date vẫn OK nếu FE chỉ format.

### 3.2 Ví dụ A — HRM list row (nhân viên / hợp đồng tóm tắt)

**Anti (entity thô — FE phải “ghép đồ”):**

```json
{
  "employeeId": "uuid",
  "deptId": "uuid",
  "contractTypeCode": "HD_CT",
  "status": 2,
  "salary": 15000000
}
```

FE sẽ: gọi thêm departments, map `2` → “Đang làm”, tự format lương, tự suy “có HĐ chính chưa”…

**Display-ready (BE assemble):**

```json
{
  "employeeId": "uuid",
  "employeeCode": "NV-1024",
  "fullName": "Nguyễn Văn A",
  "department": { "id": "uuid", "name": "Vận hành kho" },
  "primaryContract": {
    "typeCode": "HD_CT",
    "typeLabel": "Hợp đồng chính thức",
    "status": "ACTIVE",
    "statusLabel": "Đang hiệu lực",
    "statusTone": "success"
  },
  "salaryAmount": 15000000,
  "currency": "VND",
  "scope": { "companyId": "uuid", "companyName": "XeVN Logistics" },
  "permissions": { "canViewSalary": true, "canEdit": false }
}
```

FE: bind cột; format `salaryAmount` vi-VN nếu cần; ẩn nút Sửa theo `canEdit`.

### 3.3 Ví dụ B — Kết quả duyệt nghỉ phép

**Anti (FE tự quyết sau 200):**

```json
{ "ok": true, "leaveRequestId": "uuid", "balance": 8 }
```

FE tự đổi badge “Chờ duyệt” → “Đã duyệt”, tự trừ ngày trên UI từ form cũ…

**Display-ready:**

```json
{
  "leaveRequestId": "uuid",
  "decision": "APPROVED",
  "decisionLabel": "Đã duyệt",
  "statusTone": "success",
  "balanceAfter": { "annualRemaining": 8, "unit": "day" },
  "timeline": [
    { "at": "2026-08-03T09:15:00+07:00", "actorName": "Trưởng phòng B", "actionLabel": "Duyệt" }
  ],
  "ui": {
    "toastKey": "leave.approve.success",
    "listRowPatch": {
      "status": "APPROVED",
      "statusLabel": "Đã duyệt",
      "statusTone": "success"
    }
  }
}
```

FE: toast + patch row theo `listRowPatch` (hoặc invalidate query); **không** tự suy balance.

### 3.4 API_DESIGN — ghi rõ “display-ready fields”

Trong mỗi function (bổ sung F.1):

| Mục | Nội dung |
|-----|----------|
| Mục đích | … |
| Nghiệp vụ xử lý | nhánh BE, BR |
| Tham chiếu bước SRS | UC + Diễn biến # |
| **View model UI** | liệt kê field label/tone/`can*` FE được bind — cấm “FE tự map” |

---

## 4. Vùng xám (Grey zone) — document rõ

| Hạng mục | Cho phép trên FE? | Điều kiện |
|----------|-------------------|-----------|
| **Presentation formatters** (vi-VN date/money) | ✅ | Pure format của số/ISO **đã final** từ BE; không đổi ý nghĩa nghiệp vụ |
| **Optimistic UI** | ✅ | Rollback khi fail; sau response server = SoT; không commit BR chỉ trên client |
| **Shared types packages** | ✅ types/DTO shapes | **Không** nhét BR engines vào FE bundle trừ **sponsor exception** ghi bus + expiry |
| Client Zod “business-like” | ⚠ chỉ UX | Rule bắt buộc (eligibility, trần ngày nghỉ) **phải** enforce lại trên BE; FE hint ≠ SoT |
| Derived UI state cục bộ | ✅ | VD. tab đang mở, accordion — không phải aggregate nghiệp vụ đa entity |
| i18n `t(key)` khi BE trả `toastKey` | ✅ | Key ổn định; copy VI nằm catalog FE hoặc message từ BE đã an toàn |

**Cấm lợi dụng vùng xám:** “formatter” mà bên trong gọi nhiều API để suy status; “shared package” chứa `calculatePayroll()`.

---

## 5. Anti-patterns (ví dụ code-shaped, language-agnostic)

### AP-01 — FE join/merge graph

```text
// CẤM
emps = GET /employees
depts = GET /departments
contracts = GET /contracts
rows = emps.map(e => ({
  ...e,
  deptName: depts.find(...),
  contract: contracts.find(...),
  badge: e.status === 2 ? "Đang làm" : "..."
}))
```

**Reject →** BE `GET /employees` (hoặc projection `?view=listRow`) trả sẵn `department.name`, `primaryContract`, `statusLabel`.

### AP-02 — FE công thức BH / lương

```text
// CẤM
employeeShare = salary * 0.08
companyShare = salary * 0.17
if (region === "HN") employeeShare *= 1.0
```

**Reject →** BE calculator / service; response `premium: { employeeShare, companyShare, basis }`.

### AP-03 — FE “vá” scope

```text
// CẤM
all = GET /employees?companyId=HOLDING
visible = all.filter(e => membershipIds.includes(e.companyId))
```

**Reject →** BE scope resolver; FE chỉ gửi token/header đúng; 403/409 = đúng hành vi.

### AP-04 — Invent DTO trên browser rồi POST lại shape lạ

```text
// CẤM
body = { ...form, _computed: { grade, band, nextReview } } // FE tự tính band
POST /contracts
```

**Reject →** BE nhận input nghiệp vụ thô đã validate; tự derive `grade`/`band`; trả view model sau lưu.

### AP-05 — BE dump entity, đổ trách nhiệm sang FE

```text
// CẤM (BE)
return prisma.employee.findMany({ include: { /* 12 quan hệ thô */ } })
// "FE tự chọn field"
```

**Reject →** mapper/view model layer; API_DESIGN liệt kê field UI; không lộ cột nội bộ thừa.

### AP-06 — Double BR (FE + BE lệch)

```text
// FE: canApprove = role === "MANAGER" && days <= 3
// BE: canApprove = workflow step + balance + proxy
```

**Reject →** chỉ BE quyết; FE bind `permissions.canApprove` từ detail/list.

---

## 6. Review checklist (PM / QC / dev-fe / dev-be)

### 6.1 PM (trước dispatch)

- [ ] API_DESIGN đã có **View model UI** / field display-ready cho UC?
- [ ] Packet `dev-fe` ghi `forbidden`: business transform, multi-list merge?
- [ ] Packet `dev-be` ghi exit: list↔detail scope parity + labels/`can*`?
- [ ] Không giao 1 Task “FE tự tính vì API chưa có” khi BR đã trong SRS.

### 6.2 dev-be (trước READY_FOR_QA)

- [ ] Mapper/view model — không raw dump.
- [ ] Jest/service test theo UC/BR cho transform & scope.
- [ ] Error codes ổn định; OpenAPI/DTO cập nhật.
- [ ] `spec_read_ack` trích API_DESIGN F.1 + field UI.

### 6.3 dev-fe / dev-mobile (trước READY_FOR_QA)

- [ ] Không file UI chứa công thức lương/BH/scope.
- [ ] Không `Promise.all` + merge đa entity thành row nghiệp vụ.
- [ ] Bind field có trong contract; thiếu field → **PASS_TO_BA/SA**, không invent.
- [ ] Zod = input UX; không thay server rule.
- [ ] `@CODE-MEMORY` ghi rõ “BR ở BE / FE chỉ bind” (tiếng Việt).

### 6.4 QA

- [ ] Browser: sau mutate, UI khớp body display-ready (không chỉ HTTP 200).
- [ ] Network: không storm N+1 từ FE để “tự đủ data”.
- [ ] Scope persona: không PASS khi FE filter che lệch scope.

### 6.5 QC

- [ ] Residual **P0** nếu FE chứa BR engine / merge graph trái §2.
- [ ] Residual **P0 depth** nếu API thiếu view model trong khi SRS đòi nhãn/quyền nút (`13` F.1 + doctrine này).
- [ ] GO chỉ khi checklist §6.2–6.4 đủ evidence path.

---

## 7. Quan hệ với doctrine / gate khác

| Artifact | Quan hệ với `28` |
|----------|------------------|
| **`25` SOLID & convention** | UI layer ≠ domain; S/I: đổi BR không sửa page. `28` = áp dụng biên FE↔BE cụ thể |
| **`26` Dev lanes** | `26` = **ai** (fe/mobile/be); `28` = **nội dung trách nhiệm** trong API/UI |
| **`13` §F / F.1 API_DESIGN** | F.1 = mục đích + nghiệp vụ + bước SRS; `28` = bắt buộc shape **display-ready** / view model UI |
| **`04` + `14` CODE-MEMORY** | Block phải nêu SoT BR (BE path) và FE chỉ wire; CHANGE khi chuyển BR sang FE = vi phạm trừ waiver |
| **`21` Dual-plane** | Metric Plane B do BE/bridge SoT — FE không suy count từ list Plane A |
| **`02` Spec-first** | Không code FE “tạm tính” thay API_DESIGN thiếu |
| **U65 zero-seed / FE-only QA** | Nghiệm thu từ UI vẫn đúng — miễn FE không giả BR bằng seed/transform che BE |

**Dispatch packet — thêm field gợi ý:**

```yaml
fe_be_soc: display-ready   # theo _vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md
forbidden_fe:
  - business_transforms
  - multi_entity_merge
  - payroll_insurance_scope_formulas
required_be:
  - view_model_fields_in_api_design
  - list_detail_scope_parity
```

---

## 8. Acceptance / reject criteria

### 8.1 ACCEPT (PASS lane)

| Tiêu chí | Bằng chứng |
|----------|------------|
| FE chỉ validate form + bind + UX states | Diff FE không có BR engines / merge graphs |
| BE sở hữu transform + scope + labels/`can*` | API_DESIGN + test service; response mẫu trong evidence |
| Display-ready đủ để render list/detail chính | QA Network + screenshot bind field |
| Grey zone tuân §4 | Formatter thuần / optimistic có rollback |
| CODE-MEMORY nêu SoT BR phía BE | Grep `@CODE-MEMORY` trên file đụng |

### 8.2 REJECT (NO-GO / re-dispatch)

| Vi phạm | Owner kế |
|---------|----------|
| FE tính lương/BH/scope hoặc dual BR | `dev-fe` revert + `dev-be` chuyển BR |
| FE merge ≥2 entity graphs thành DTO nghiệp vụ | `dev-be` projection/view API; FE xóa merge |
| BE trả entity thô, QA/FE “tự map cho xong” | `dev-be` + SA cập nhật API_DESIGN view model |
| Shared package mang BR vào FE bundle không waiver | TM/SA — tách server-only hoặc exception ghi bus |
| List OK / detail 409 do lệch scope FE che | `dev-be` parity — **không** FE filter vá |
| API_DESIGN thiếu View model UI khi SRS có nút/nhãn theo quyền | BA/SA delta — chặn coding |

### 8.3 Waiver

Chỉ khi sponsor ghi rõ exception (vd. prototype spike) + **owner + expiry** trên bus. Hết hạn → phải kéo BR về BE.

---

## 9. Áp dụng / từ chối — bảng nhanh (VI)

| Tình huống | Áp dụng `28` | Từ chối |
|------------|--------------|---------|
| Màn list HRM cần tên phòng + nhãn HĐ | BE list row display-ready | FE gọi 3 API rồi merge |
| Nút Duyệt nghỉ | BE trả `canApprove` + kết quả decisionLabel | FE tự `if (days<=3 && role)` |
| Ô lương gõ form | FE Zod số + format nhóm nghìn | FE tự ra net pay theo rule BH |
| Package `@xevn/types` | Export interfaces/DTO | Export `computeInsurance()` chạy trên browser |
| Mobile offline queue | Queue thao tác; sync theo API | Mobile tự approve workflow offline như SoT |

---

## 10. Liên kết vận hành

- Lane chia Task: `26-DEV-LANES-WEB-MOBILE-BE.md` (§ pointer → file này)
- Reject convention/SOLID: `25-SOLID-AND-CODING-CONVENTION.md`
- Gate API: `13-BRD-SRS-TECHSPEC-QUALITY.md` §3.4.11.F.1
- Role card: `roles/dev-fe.md` · `roles/dev-be.md` · `roles/dev-mobile.md`

**Hết file.** Mọi dự án Vibe Coding dùng chung doctrine này; repo cụ thể chỉ thêm ví dụ domain trong `case-studies/` hoặc evidence QA — **không** fork nội dung mâu thuẫn §2–§8.
