# CODE-MEMORY — nhật ký từng file (FE + BE)

**Global rule:** `~/.cursor/rules/code-memory-journal-full.mdc`  
**Template:** `~/.cursor/templates/CODE_MEMORY_BLOCK.md`  
**Gate:** `npm run preflight` → `check-code-memory.mjs` (per project)

---

## Triết lý sponsor

> Comment trong code là **memory của team**, không trang trí.  
> Agent đọc SRS → tech-spec → **@CODE-MEMORY trong file** trước khi sửa.

Chi tiết hơn episodic agentmemory: biết **Callers/Callees**, **FE-Actions table**, **BE-Chain**, **must_keep**.

---

## Khi bắt buộc

| Touch | Block |
|-------|-------|
| `src/**` business logic | Có |
| `supabase/migrations/**` RPC/trigger | Có (SQL comment) |
| Pure test / tmp probe | Không |
| i18n key-only | Optional ngắn |

---

## Trường bắt buộc (không TBD)

Screen · UC · BR · SRS path § · TechSpec § · Purpose · WorkItem · Coded ·  
Callers · Callees · FEActions (table) · BEChain · Impact · must_keep · SOLID · LastVerified

---

## Khi sửa — append, không xóa

```ts
/**
 * @CODE-MEMORY-CHANGE 2026-06-22
 * WorkItem: W-DEVFE-...
 * What: ...
 * Why: ...
 * SRS/BR: ...
 * @see docs/knowledge/FLOW-....md
 */
```

---

## SQL migration

```sql
-- @CODE-MEMORY
-- UC: UC-XXX
-- BE-Chain: rpc_name → tables
-- LastVerified: *.migration.test.ts
```

---

## Flow map (UC phức tạp)

Thêm/cập nhật `docs/knowledge/FLOW-{UC-ID}.md` và link từ block.

---

## Preflight fail = không handoff

Changed business files without valid `@CODE-MEMORY` → fix trước merge.

---

## Bổ sung 2026-07-19 — Feature UPGRADE

Khi **nâng cấp** (bridge, dashboard, API mới): **không** xóa `@CODE-MEMORY` gốc — thêm `@CODE-MEMORY-CHANGE`.  
Doctrine: `11-FEATURE-UPGRADE-NO-OVERWRITE.md` · Nest mẫu: `12-NEST-MONOREPO-CODE-MEMORY.md`.

---

## Bổ sung 2026-07-20 — Trace + tiếng Việt (YTEXA Sponsor)

**Chi tiết đầy đủ:** `14-TRACEABILITY-SRS-TECHSPEC-CODE.md`

1. **Diễn giải trong `@CODE-MEMORY` và comment chỗ xử lý = 100% tiếng Việt** (giữ nguyên mã `UC-`/`FR-`/`BR-`/`TS-`/`W-` và tên symbol kỹ thuật).
2. Trường **SRS** / **TechSpec** phải ghi **mã tham chiếu** (FR/UC + § + TS-id nếu có), khớp TechSpec dòng `ref_srs`.
3. **Trước mọi sửa file:** đọc SRS → TechSpec → toàn bộ `@CODE-MEMORY` / `@CODE-MEMORY-CHANGE` — nếu comment lệch spec đã confirm → dừng, báo BA/SA.
4. Logic then chốt (đổi trạng thái, trừ kho, validate…): thêm comment ngắn tiếng Việt **xử lý gì / để làm gì** tại chỗ.
5. UPGRADE: append CHANGE tiếng Việt; **không** xóa block gốc; tôn trọng `must_keep`.

---

## Comment tại chỗ (FE/BE) — ngoài header `@CODE-MEMORY`

**Phân tầng:** `@CODE-MEMORY` = **nhật ký file** (UC/BR/SRS/TechSpec/Callers/must_keep) — SoT “file này thuộc UC nào”.  
**Comment tại chỗ** = giải thích **luồng / nhánh / I/O** ngay cạnh code — để agent sau **không phải đoán** vì sao có `if` này.

### Khi nào **bắt buộc** comment tại chỗ

| Tình huống | FE | BE | Nội dung tối thiểu (tiếng Việt nghiệp vụ) |
|------------|----|----|-------------------------------------------|
| Nhánh không hiển nhiên (early return, guard song song, fallback) | ✅ | ✅ | *Xử lý gì / điều kiện nào / để tránh lỗi gì* + **`UC-…` · Diễn biến #** (hoặc tên bước sequence) — xem `30-HDSD-ALIGNED-QA-AND-SRS-BRANCH-TRACE.md` |
| Mọi `if` / `else` / `switch` nghiệp vụ (không phải null-check UI thuần) | ✅ | ✅ | Neo **bước SRS** đang hiện thực; thiếu = trace_gap (QA/QC reject) |
| Hàm **export** (hook, util, mapper, pure lib) | ✅ I/O | ✅ I/O | Input kỳ vọng · output shape · side-effect (có/không) |
| Method **public** trên Nest service / use-case | — | ✅ | Hợp đồng: pre-condition (scope, status), bước BR chính, lỗi nghiệp vụ ổn định |
| Đổi trạng thái / soft-delete / transaction | nếu FE gọi | ✅ tại service | Trạng thái trước→sau; bảng/cột chạm; ai được gọi tiếp |
| Validate chỉ UI vs validate BR | ✅ ghi rõ “chỉ format/required” | ✅ ghi BR id nếu chặn | Tránh FE/BE hiểu nhầm ai là SoT |

### Khi nào **không** cần (tránh nhiễu)

- Prop drilling / JSX layout thuần; getter một dòng rõ tên.  
- Comment trùng 100% tên hàm (`// lấy employee` trên `getEmployee`).  
- Dán lại cả SRS vào từng dòng — dùng `@CODE-MEMORY` + `FLOW-*.md`.

### Ngôn ngữ & quan hệ với journal

1. Giải thích nghiệp vụ / vì sao nhánh = **tiếng Việt**; giữ mã `UC-`/`BR-`/`FR-`/`TS-` và tên symbol.  
2. **Không** thay `@CODE-MEMORY` bằng chỉ comment rải — thiếu block header = preflight FAIL.  
3. Sửa logic then-chốt: cập nhật comment tại chỗ **cùng diff**; nếu đổi hợp đồng public → append `@CODE-MEMORY-CHANGE`.  
4. FE: comment I/O không được “che” việc FE đang join/tính BR (xem `25` §3.1 — vẫn REJECT).  
5. BE: comment public method phải khớp API_DESIGN (mục đích + bước SRS) — lệch → dừng, SA/BA trước.

### Mẫu ngắn

```ts
// FE — SRS UC-HRM-SoftDel · Diễn biến #2 — thiếu catalog phòng ban thì không mount form
if (!departments?.length) return <EmptyCatalogHint />;

/**
 * BE — public: archiveEmployee
 * SRS UC-HRM-21 · Diễn biến #6 — ACTIVE→ARCHIVED
 * Vào: employeeId + JWT scope. Ra: 204 / lỗi XBOS-HRM-*.
 * BR: chỉ ACTIVE→ARCHIVED; soft-delete; ghi audit. Không hard-delete.
 */
```

---

## Bổ sung 2026-07-28 — Neo đa loại file + Feature slice

`@CODE-MEMORY` trên TS/SQL **vẫn bắt buộc** cho business logic — nhưng **không đủ** cho cả feature.

| Bổ sung | SoT |
| --- | --- |
| Tag theo loại file (CSS, route, env, CI, contract, docs…) | `22-ARTIFACT-NEO-AND-FEATURE-SLICE.md` |
| Template copy vào repo | `templates/ARTIFACT_NEO_MARKING.md` |
| 1 Story = đủ path | `templates/FEATURE_SLICE_MAP.md` · `templates/slices/_TEMPLATE.md` |
| JSON/config không comment | `templates/CONFIG_REGISTRY.md` |
| Incident | `incidents/INC-MULTI-DEV-SHARED-FILE-NO-NEO.md` |

PM/Dev: mọi Story nghiệp vụ có `docs/program/slices/<StoryID>.md`; DoD = diff ⊆ slice + neo đúng tag từng path.
