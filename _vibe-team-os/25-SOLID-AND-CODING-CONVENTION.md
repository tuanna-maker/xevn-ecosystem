# 25 — SOLID & Coding Convention (training SoT cho mọi Dev / sub-agent)

**Mục đích:** Đây là tài liệu **train + reject gate** — không chỉ bảng layer ngắn như `09` §5.  
Mọi `dev-fe` / `dev-be` / `dev-mobile` **đọc file này trước khi code** (cùng SRS → TechSpec → CODE-MEMORY).

**Liên kết:** `09` §5 (map layer) · `04-CODE-MEMORY-JOURNAL.md` · `14-TRACEABILITY-SRS-TECHSPEC-CODE.md` · `12-NEST-MONOREPO-CODE-MEMORY.md`

---

## 0. Hai khái niệm — đừng gộp

| | **Coding Convention** | **SOLID** |
|--|----------------------|-----------|
| Là gì | Quy ước **cách viết & tổ chức** code trong team (tên, folder, comment, test, error, type) | Nguyên lý **thiết kế** module để dễ đổi, dễ test, ít vỡ lan |
| Trả lời câu | “File đặt đâu? Đặt tên thế nào? Comment gì? Cấm gì?” | “Ai chịu trách nhiệm gì? Phụ thuộc ai? Mở rộng thế nào mà không đập core?” |
| Ví dụ | `src/lib` = logic; không `any`; `@CODE-MEMORY`; file >300 LOC tách | Service HRM không gọi thẳng Prisma từ Controller; map BR ở lib thuần |
| Khi thiếu | Code “chạy được” nhưng mỗi người một style → review hỗn loạn | Code “đúng convention” nhưng vẫn god-service / logic trong UI → sửa 1 chỗ hỏng 10 chỗ |

**Sub-agent phải nắm cả hai.** Chỉ thuộc layer table `09` §5 = **chưa đủ**.

---

## 1. Coding Convention (bắt buộc)

### 1.1 Ranh giới folder (mọi stack — map sang Nest/React tương đương)

| Layer | Được làm | Không được làm |
|-------|----------|----------------|
| **Domain / lib thuần** (`src/lib/**`, `*.domain.ts`, Nest `*.service` domain helpers) | Tính toán BR, validate nghiệp vụ, map DTO↔domain, gọi port/interface | Import React, Nest `@Req`, Prisma client trực tiếp nếu đã có repository |
| **Application / flow** (`*Flows.ts`, Nest use-case service) | Orchestrate bước UC, transaction boundary | Hardcode nhãn UI; copy-paste công thức đã có ở lib |
| **Interface / UI** (components, pages) | Wire props, gọi hook/flow, `t('key')`, trạng thái loading/error | Công thức lương/BH/phạm vi; SQL; gọi SDK partner |
| **Transport** (Controller, Edge handler) | Auth, parse input, map HTTP status, gọi service | Business if/else dài; query DB phức tạp |
| **Infrastructure** (Repository, Prisma, Supabase client) | I/O, SQL, mapping row↔entity | Quyết định BR “có được duyệt không” |

### 1.2 Quy ước viết

1. **Tên rõ việc** — `calculateInsuranceEmployeeShare` chứ không `calc2` / `handleData`.
2. **Một file ≈ một lý do đổi** — vượt **~300 LOC** business → tách (lib / types / mapper / tests).
3. **Type an toàn** — không `any` khi có alternative; DTO/Zod/class-validator ở biên.
4. **Lỗi có chủ** — không `catch {}` nuốt; message ổn định cho FE; không lộ secret.
5. **Side-effect rõ** — hàm thuần không âm thầm ghi DB; mutate ghi trong service/repo có tên rõ.
6. **i18n** — UI chỉ `t('key')` / nhãn VI từ catalog; không nhét UUID làm label.
7. **@CODE-MEMORY** — mọi file business: UC/BR/SRS/TechSpec + field **SOLID** (tiếng Việt) — xem `04`.
8. **Test đặt tên theo UC/BR** — `br-hrm-ins-employee-share.test.ts`, không `test1`.
9. **Cùng commit** enum DB ↔ TypeScript union/type hand-written.
10. **Không dead code / duplicate công thức** — dialog và lib dùng **một** hàm SoT.

### 1.3 Convention ≠ “trông đẹp”

Convention đạt khi **người khác (hoặc sub-agent khác) biết tìm logic ở đâu trong ≤2 phút**.  
Nếu QA/Dev mới phải đọc cả `Employees.tsx` 2000 dòng để tìm BR → **FAIL convention**.

---

## 2. SOLID — diễn giải đủ để train agent

Ghi nhớ: SOLID áp dụng cho **module/class/function boundary**, không phải “tách file cho vui”.

### S — Single Responsibility (Một trách nhiệm)

**Ý:** Một đơn vị chỉ có **một lý do để thay đổi**.

| Đúng | Sai |
|------|-----|
| `InsurancePremiumCalculator` chỉ tính tiền; `InsuranceEnrollmentService` chỉ orchestrate lưu | `EmployeesPage` vừa fetch, vừa tính BH, vừa soft-delete, vừa format date |
| Nest: Controller mỏng → Service nghiệp vụ → Repository | Controller 400 dòng chứa SQL + if BR |
| FE: `mapRequisitionToForm` tách khỏi `JobRequisitionsTab.tsx` | Tab vừa render vừa POST vừa parse UTF-16 |

**Câu hỏi agent tự hỏi trước khi merge:**  
“Nếu sponsor đổi *chỉ* quy tắc tính X, mình có phải sửa file UI/API transport không?” → Nếu có → tách chưa đủ.

### O — Open/Closed (Mở để mở rộng, đóng để sửa)

**Ý:** Thêm hành vi mới bằng **composition / strategy / registry**, tránh mở lại core ổn định mỗi lần.

| Đúng | Sai |
|------|-----|
| Thêm kênh catalog: đăng ký handler mới vào map `channel → applicator` | Sửa `if/else` 20 nhánh trong một hàm `applyCatalog` khổng lồ mỗi kênh mới |
| Feature flag / strategy cho soft-delete vs hard (nếu policy đổi) | Copy-paste cả service rồi sửa 2 chỗ |

**Không hiểu sai O:** “Không bao giờ sửa file cũ” — vẫn được sửa khi bug/BR đổi; O chống **mở rộng bằng cách phá core**.

### L — Liskov Substitution (Thay thế subtype an toàn)

**Ý:** Implementation thay thế phải **giữ hợp đồng** (precondition không chặt hơn, postcondition không yếu hơn, không ném lỗi bất ngờ).

| Đúng | Sai |
|------|-----|
| `MemberScopeRepository` và `HoldingScopeRepository` đều thỏa `ListEmployeesQuery` (cùng lỗi 409 scope) | Subclass “tối ưu” nuốt 409 thành [] rỗng → FE tưởng hết data |
| Mock test implement cùng interface service | Fake trả `null` chỗ production trả `[]` → test xanh prod vỡ |

### I — Interface Segregation (Interface nhỏ, đúng việc)

**Ý:** Caller không bị buộc phụ thuộc method không dùng.

| Đúng | Sai |
|------|-----|
| `SubmitRequisitionWorkflow` port chỉ `submit(id)` | `IHrmGodService` 40 method — FE import cả đống để gọi 1 hàm |
| FE hook `useArchiveEmployee` riêng | Một context “all HRM mutations” bắt mọi màn re-render |

### D — Dependency Inversion (Đảo phụ thuộc)

**Ý:** Domain/application **không** phụ thuộc chi tiết Prisma/Supabase/HTTP; phụ thuộc **abstraction** (port). Infrastructure implement port.

| Đúng | Sai |
|------|-----|
| `RecruitmentService` nhận `JobRequisitionRepo` interface; Prisma class implements | Service import `@prisma/client` rồi dùng khắp BR |
| FE lib nhận `apiClient` inject / param — dễ test | Lib import cứng `fetch('http://localhost:28001')` |

---

## 3. Anti-pattern (QA / TM / QC được quyền REJECT)

1. **God component / god service** — nhiều BR unrelated trong một file.  
2. **Business logic trong UI** — tính tiền, scope, state machine trong `.tsx`.  
3. **Business logic trong Controller** — chỉ được validate transport + ủy quyền service.  
4. **Duplicate SoT** — cùng công thức ở FE + BE lệch nhau không có test chung / không document SoT.  
5. **SDK/DB xuyên tầng** — UI gọi Supabase thẳng khi đã có Nest API (trừ ADR ngoại lệ).  
6. **Hàm > ~80 dòng** với nhiều side-effect không tên — tách.  
7. **Sửa “cho test xanh”** bằng cách nới guard nghiệp vụ — cấm (xem E2E integrity).  
8. **Thiếu `@CODE-MEMORY` / thiếu field SOLID** trên file business mới/sửa.

### 3.1 Reject rõ — FE vượt ranh giới (display-ready / SoC)

> **Vì sao reject:** FE chỉ được **hiển thị + validate input người dùng**. Join đa nguồn, công thức nghiệp vụ, và DTO lồng nhau thuộc **BE** (và contract API). Khi FE “tự lắp” aggregate, mọi đổi BR buộc sửa UI + lệch so với mobile/consumer khác → regression im lặng. SoT chi tiết FE/BE SoC: **`28-FE-BE-SEPARATION-DISPLAY-READY.md`** (ưu tiên); stub ngắn: `26` §7.

| # | Pattern REJECT (FE) | Vì sao sai | Cách đúng |
|---|---------------------|------------|-----------|
| R-FE-01 | `Array.reduce` / `Map` join **nhiều** response API (employees + contracts + insurance + dept) thành **một domain aggregate** trong page/hook | FE đang làm **query composer / BFF**; thiếu transaction/consistency; khó audit; mobile phải copy lại | BE trả **view-model / projection** đã join (list DTO hoặc get-by-id embed); FE chỉ bind field |
| R-FE-02 | Công thức **lương / BHXH / thuế / phụ cấp** (hoặc preview “tính tạm”) copy trong `.tsx` / `lib` FE mà **không** gọi endpoint tính của BE | Hai SoT số → UAT lệch; đổi nghị định BH chỉ sửa một phía | BE sở hữu calculator; FE gọi API preview/compute hoặc chỉ hiển thị số BE đã trả; format tiền = presentation only |
| R-FE-03 | FE **tự dựng nested DTO** (object cây sâu: employee → contracts[] → insuranceLines[] → employerShare) rồi POST — trong khi API_DESIGN đã định BE assemble từ id phẳng | Client trở thành writer schema; validation lệch; OpenAPI vô nghĩa | FE gửi **payload phẳng / id + field form**; BE load quan hệ, validate BR, persist, trả **display-ready** response |
| R-FE-04 | FE “làm giàu” list bằng N+1 `Promise.all` get-by-id rồi merge cột | Phá pagination/scope; storm API; che thiếu field trên list API | Mở rộng **list DTO** phía BE (hoặc dedicated summary endpoint); FE một GET |

**Được phép trên FE (không reject):** map field → form control; Zod/schema **shape + required + format** (email, date `dd/MM/yyyy`, tiền nhóm nghìn); disable nút theo trạng thái UI đã có; i18n label; empty/loading/error.

---

## 4. Checklist trước `READY_FOR_QA` (Dev tự điền trong evidence)

```markdown
## solid_convention_ack
- [ ] Đã đọc `_vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md`
- [ ] Logic BR nằm ở lib/service (không phải page/controller)
- [ ] File mới/sửa có @CODE-MEMORY + field SOLID (tiếng Việt)
- [ ] Không god-file; >300 LOC đã tách hoặc giải thích waiver
- [ ] Port/repo hoặc seam test được nêu (D)
- [ ] Test map UC/BR (hoặc lý do không có + residual)
- [ ] Không duplicate công thức với module 🟢 khác
- [ ] convention: naming, no any thừa, error không nuốt
### FE–BE boundary (bắt buộc khi đụng list/detail/mutate)
- [ ] fe_boundary: UI + input validate only — không join đa API thành aggregate; không công thức lương/BH/thuế; không tự build nested write-DTO (xem §3.1)
- [ ] be_boundary: business rules + DB + soft-delete/scope; response **display-ready** (đủ field FE bind, không bắt FE N+1)
- [ ] display_ready_ack: liệt kê field FE bind ← response path (hoặc cite API_DESIGN §) — không “FE sẽ tính thêm”
- [ ] soc_ref: đã đọc `28-FE-BE-SEPARATION-DISPLAY-READY.md` (bắt buộc khi wave đụng API list/mutate)
```

**Thiếu block này → handoff INVALID / QA fail process** (cùng mức thiếu `spec_read_ack`).  
**Thiếu FE–BE boundary khi wave đụng API list/mutate → TM/QC residual P1 process** (không coi DONE convention).

---

## 5. Ví dụ ngắn theo stack team

### Nest (BE)

```
Controller  →  parse + authz + gọi service
Service     →  BR / UC steps (S)
Repository  →  Prisma/SQL only (D: service phụ thuộc interface repo)
DTO/Zod     →  biên HTTP
```

### React (FE)

```
Page/Tab    →  layout + wire
Hook/Flow   →  gọi API + state server
lib/*       →  thuần: map, guard, format, BR preview
```

### Ví dụ SoftDel (đúng hướng)

- UI: menu ⋯ → dialog confirm → gọi `archiveEmployee(id)`  
- lib/api: path + error code  
- BE service: quyền, soft-delete flag, audit  
- **Không** nhét `departments.map` crash vào form mount không liên quan SoftDel (SRP: form options ≠ archive)

---

## 6. Cách PM / Claude / Cursor train sub-agent

Trong mọi Task `dev-*` thêm:

```yaml
read_first:
  - _vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md
  - _vibe-team-os/26-DEV-LANES-WEB-MOBILE-BE.md
  - _vibe-team-os/09-TEAM-OPERATING-MODEL.md  # §5 layer map
  - _vibe-team-os/04-CODE-MEMORY-JOURNAL.md
  - <repo>/docs/program/SUBAGENT_READ_MAP.md
exit_criteria:
  - solid_convention_ack filled in evidence
```

**Không** chỉ viết “follow SOLID” một dòng — agent sẽ hiểu mơ hồ.  
**Có** bắt `solid_convention_ack` + CODE-MEMORY field SOLID.

---

## 7. Quan hệ với `09` §5

| Artifact | Dùng khi |
|----------|----------|
| **File này (`25`)** | Hiểu *vì sao* + checklist train/reject |
| **`26` Dev lanes** | Ai làm FE web / mobile / BE |
| **`28-FE-BE-SEPARATION-DISPLAY-READY.md`** | Ranh giới UI↔API↔DB + display-ready (SoT SA) |
| **`09` §5** | Nhìn nhanh “logic để đâu / test để đâu” |
| **Rule Cursor `senior-engineering-solid.mdc`** | Always-on nhắc trong IDE (tóm tắt) |
| **Rule OS `rules/fe-be-display-ready-soc.mdc`** | Pointer → `28` (+ stub `26` §7) |

Nếu hai nơi lệch: **ưu tiên file `25` trong `_vibe-team-os`** rồi cập nhật rule IDE cho khớp.

---

## 8. Acceptance (DONE kỹ thuật)

- Review ghi rõ: SRP boundary + chỗ mở rộng (O) + seam test (D).  
- Không DONE khi logic BR vẫn trong UI/Controller “cho nhanh”.  
- Refactor SOLID phải **giảm** độ phức tạp đo được (ít nhánh, ít duplicate) hoặc có regression test giữ hành vi 🟢.
