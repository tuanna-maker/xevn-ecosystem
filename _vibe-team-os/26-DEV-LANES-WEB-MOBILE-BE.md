# 26 — Dev lanes: FE Web · FE Mobile · BE (API+DB)

**Mục đích:** Phân biệt **rõ việc / ranh giới / kỹ năng** để PM chia Task tối ưu — không giao BE làm UI, không giao FE sửa Prisma/migration.

**Đọc kèm:** `25-SOLID-AND-CODING-CONVENTION.md` · `09` §5 · `roles/dev-fe.md` · `roles/dev-be.md` · `roles/dev-mobile.md`

> **SoC nội dung FE↔BE (display-ready API):** xem **`28-FE-BE-SEPARATION-DISPLAY-READY.md`**.  
> File `26` = **ai làm lane nào** (web / mobile / API+DB). File `28` = FE **không** mang BR/merge graph; BE trả view model sẵn bind. PM/QC reject theo checklist `28` §6–§8.

---

## 0. Một câu mỗi lane

| Lane | Sub-agent | Một câu |
|------|-----------|---------|
| **FE Web** | `dev-fe` | Portal / Vite / React — màn hình, UX, gọi API đã có (hoặc contract đã khóa). **Không** migration/Prisma/Nest service. |
| **FE Mobile** | `dev-mobile` | React Native / Expo — luồng chạm, offline-first tài xế/NV, cùng contract API với web. **Không** BE/DB. |
| **BE** | `dev-be` | Nest API + PostgreSQL/Prisma (+ RLS/index) + DTO/validation + test API. **Không** polish CSS portal; có thể thêm OpenAPI field khi cần FE. |

**Hợp đồng chung:** Spec (SRS → TechSpec → DB_DESIGN → API_DESIGN) **trước** code. FE **không** tự nghĩ schema; BE **không** tự nghĩ layout HDSD.

---

## 1. Ma trận trách nhiệm (được / cấm)

| Việc | FE Web | FE Mobile | BE |
|------|:------:|:---------:|:--:|
| Page / Tab / Dialog React (web) | ✅ | ❌ | ❌ |
| RN screen / navigation / offline queue | ❌ | ✅ | ❌ |
| Gọi API, React Query / Zustand client | ✅ | ✅ | ❌ (viết API) |
| Nest Controller / Service / DTO | ❌ | ❌ | ✅ |
| Prisma schema / migration / index / RLS | ❌ | ❌ | ✅ |
| Seed script nghiệp vụ (khi sponsor bootstrap) | ❌ | ❌ | ✅ / devops |
| OpenAPI / contract sync | đọc | đọc | ✅ sở hữu |
| i18n / token UI / a11y web | ✅ | ⚪ RN a11y | ❌ |
| Soft-delete UI (menu, dialog) | ✅ | nếu có app | API archive ✅ |
| Scope JWT / 409 parity | consume + header | consume | **sở hữu** resolver |
| Vitest component / flow FE | ✅ | Jest/Detox | ❌ |
| Jest e2e API / service | ❌ | ❌ | ✅ |
| Docker / VPS recreate FE image | gợi ý | — | phối hợp **devops** |
| Sửa `docs/` BRD khách | ❌ (ba-docs) | ❌ | ❌ |

---

## 2. Kỹ năng cần có (research checklist — train agent)

### 2.1 `dev-fe` (Web)

| Kỹ năng | Mức tối thiểu team |
|---------|-------------------|
| React 18 + Vite + TypeScript | Functional components, hooks, không `any` bừa |
| Tailwind / design tokens dự án | Bám brand (XeVN: Precision Motion / `.cursorrules` UI) |
| React Query + Zustand | Server state vs client state đúng chỗ |
| Form / validate | Zod hoặc pattern dự án; AutoResizeTextarea khi multi-line |
| Routing / embed iframe | Portal embed HRM — scope company slug |
| A11y + vi-VN format | `dd/MM/yyyy`, tiền nhóm nghìn (UX lock) |
| Network-aware QA mindset | Sau Lưu: FE phản ánh 2xx + F5 |
| CODE-MEMORY + slice | `25` + `22` + `04` |

**Không yêu cầu:** viết migration SQL; thiết kế bảng; Nest DI.

### 2.2 `dev-mobile`

| Kỹ năng | Mức tối thiểu |
|---------|----------------|
| React Native / Expo | Navigation, list/detail, touch >44px |
| Offline-first | Queue local → sync khi online (tài xế: QR, hóa đơn) |
| Secure storage / auth token | Cùng RBAC scope với web |
| Camera / file / push (khi UC) | Theo TechSpec mobile |
| Share types/contracts | Dùng package shared nếu monorepo có |
| Device QA handoff | Evidence cho `qa-device` |

**Không yêu cầu:** Prisma; portal CSS; Nest module.

### 2.3 `dev-be`

| Kỹ năng | Mức tối thiểu |
|---------|----------------|
| NestJS module/controller/service | Architecture Controller → Service → Repository |
| Prisma + PostgreSQL | Migration, index search, soft-delete |
| Multi-tenant / RLS / scope | List vs get-by-id **parity** |
| DTO + class-validator / Zod | Biên HTTP chặt |
| Error semantics ổn định | Mã XBOS/HRM, không nuốt lỗi |
| OpenAPI / contract | Cập nhật khi đổi request/response |
| Jest service/e2e API | Map UC/BR |
| Performance cơ bản | Tránh N+1; pagination |

**Không yêu cầu:** pixel-perfect UI; RN navigation.

---

## 3. Handoff FE ↔ BE (tránh kẹt)

```
BA/SA khóa API_DESIGN (method, path, DTO, bước SRS)
  → BE implement + READY_FOR_QA (hoặc contract stub + OpenAPI trước nếu song song)
  → FE bind đúng field; không invent endpoint
  → QA browser (U65) + API smoke
```

| Tình huống | Ai làm |
|------------|--------|
| API 404 / 500 / scope 409 | **dev-be** trước |
| UI trắng / Vite missing export / nhãn sai | **dev-fe** |
| App crash RN / sync fail | **dev-mobile** |
| Contract lệch SRS | **ba-process/sa** delta — không để FE “đoán” |
| Cần cả UI + API cùng UC | PM **2 Task song song** sau khi API_DESIGN khóa; FE mock tạm **cấm** nếu sponsor U65 live |

---

## 4. Dispatch packet mẫu (copy)

### FE Web only

```yaml
to_role: dev-fe
allowed_paths: [apps/web/**, apps/portal/**]  # theo repo
forbidden_paths: [apps/api/**, **/prisma/**, **/migrations/**]
read_first:
  - _vibe-team-os/26-DEV-LANES-WEB-MOBILE-BE.md
  - _vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md
  - <project>/docs/program/SUBAGENT_READ_MAP.md  # lane FE
```

### Mobile only

```yaml
to_role: dev-mobile
allowed_paths: [apps/mobile/**]
forbidden_paths: [apps/api/**, apps/web/**, **/prisma/**]
read_first:
  - _vibe-team-os/26-DEV-LANES-WEB-MOBILE-BE.md
  - _vibe-team-os/roles/dev-mobile.md
```

### BE (API + DB)

```yaml
to_role: dev-be
allowed_paths: [apps/api/**, **/prisma/**, **/migrations/**, openapi/**]
forbidden_paths: [apps/web/**/components/**, apps/mobile/**]  # trừ shared types package
read_first:
  - _vibe-team-os/26-DEV-LANES-WEB-MOBILE-BE.md
  - DB_DESIGN + API_DESIGN paths từ SUBAGENT_READ_MAP
```

---

## 5. Anti-pattern PM (gây chậm)

1. Một Task “full-stack” cho 1 agent khi UC cần cả FE+BE → tách 2 lane.  
2. FE tự thêm cột DB “cho nhanh”.  
3. BE sửa JSX “vì thấy lỗi UI”.  
4. Mobile copy nguyên web layout không tối ưu touch/offline.  
5. Không ghi `forbidden_paths` → agent scope creep.
6. Cho FE “tạm tính / merge list” vì API chưa display-ready → **vi phạm `28`**; phải khóa view model trên API_DESIGN rồi BE implement.

---

## 6. Quan hệ SmartClinic / YTEXA (đúc kết)

| Học từ | Đưa vào OS |
|--------|------------|
| SmartClinic `SUBAGENT_READ_MAP` lane INVOICE/QUEUE… | Mọi repo cần map **theo module** + `do_not_read` |
| YTEXA `AGENTS.md` + `code_allowed` + 3-dev backlog | Root `AGENTS.md` + `SUBAGENT_READ_MAP` + không đọc hết OS |
| YTEXA DEV_CURSOR_ONBOARDING | Project onboarding ngắn trỏ OS `PM-START-HERE` + file `26` |

Chi tiết role card: `roles/dev-*.md`.

---

## 7. FE ↔ BE Separation of Concerns (pointer → `28`)

> **SoT đầy đủ (LANDED `OS-STD-FEBE-SOC-01`):** **`28-FE-BE-SEPARATION-DISPLAY-READY.md`**.  
> Bảng dưới = tóm tắt lane; chi tiết + ví dụ apply/reject = `28`; reject ngắn thêm ở `25` §3.1; rule pointer `rules/fe-be-display-ready-soc.mdc` (cần sửa path rule trỏ đúng tên file DISPLAY-READY).

| Bề mặt | Được | Không |
|--------|------|-------|
| **FE** (web/mobile) | UI, UX state, validate **input** (required/format/mask), gọi API, bind field display-ready | Join đa entity thành aggregate; công thức lương/BH/thuế; build nested write-DTO; N+1 merge list |
| **BE** | BR, orchestration UC, DB/Prisma, soft-delete, scope parity, calculator | Nhét layout/CSS; để FE “tự tính” số SoT |
| **Response** | Đủ field FE bind (labels, totals, status text khi contract quy định) | Bắt FE tự lắp cây từ nhiều GET |

Handoff Dev: `solid_convention_ack` phải có `fe_boundary` / `be_boundary` / `display_ready_ack` (`25` §4).
