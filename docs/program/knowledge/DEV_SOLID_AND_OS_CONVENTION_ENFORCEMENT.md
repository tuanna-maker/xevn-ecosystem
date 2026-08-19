# Dev — Tuân SOLID & coding convention (Vibe Team OS)

| Meta | Value |
|------|--------|
| **Audience** | dev-fe · dev-be · dev-mobile · PM dispatch · QC/TM |
| **SoT OS đầy đủ** | `C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\_vibe-team-os\` (repo này chỉ **mirror** một phần — xem `_vibe-team-os/README.md`) |
| **Bắt buộc đọc theo lane** | `AGENTS.md` → `docs/program/SUBAGENT_READ_MAP.md` → role card `_vibe-team-os/roles/<role>.md` |

---

## 1. Ba lớp “ép” tuân thủ (không dựa vào nhớ)

| Lớp | Cơ chế | Ai chịu trách nhiệm |
|-----|--------|---------------------|
| **A — Luật Cursor (always-on)** | `.cursorrules` · `.cursor/rules/senior-engineering-solid.mdc` · `code-memory-journal-full` (global) · `team-preserve-spec-neo.mdc` | Mọi agent/human trong repo |
| **B — Handoff dispatch** | Mỗi Task Dev **bắt buộc** block §9 trong `_vibe-team-os/templates/PM_DETAILED_DISPATCH.md`: `read_first`, `spec_read_ack`, `solid_convention_ack`, `allowed_paths`, `code_memory_required` | PM |
| **C — Gate trước READY_FOR_QA / merge** | Build/test package · QC/TM reject nếu thiếu ack · (target) preflight `@CODE-MEMORY` trên file business đã sửa | Dev + QA + QC |

**Nguyên tắc:** Spec/UI contract quyết định **cái gì**; OS `25`/`26`/`28` quyết định **cách tách code**; CODE-MEMORY là **bằng chứng đã đọc spec**.

---

## 2. Dev đọc gì (theo lane — không đọc cả OS)

| Lane | File OS (shared `_vibe-team-os`) | Rule project |
|------|----------------------------------|--------------|
| **BE** | `25-SOLID-AND-CODING-CONVENTION.md` · `12-NEST-MONOREPO-CODE-MEMORY.md` | Controller → Service → Repository; validation DTO; scope parity list↔get-by-id |
| **FE web** | `25` · **`26-DEV-LANES-WEB-MOBILE-BE.md`** · **`28-FE-BE-SEPARATION-DISPLAY-READY.md`** | Không aggregate domain trên FE; không formula payroll/insurance; bind field display-ready từ Nest |
| **Mobile** | `25` · `26` · `docs/UI_UX_SPEC_XEVN_HRM_MOBILE.md` | `integrations/` một HTTP client; feature folder; offline P2 không phá contract |

Map artifact: `docs/program/SUBAGENT_READ_MAP.md` (cột `read_first` / `forbidden`).

---

## 3. `solid_convention_ack` — bắt buộc khi dispatch & khi sửa file

PM copy vào **mọi** Task dev (§9 template):

```yaml
solid_convention_ack:
  lane: dev-fe | dev-be | dev-mobile
  boundaries: "Mô tả 1–2 câu: logic nghiệp vụ ở đâu; transport/UI ở đâu"
  fe_be: "FE chỉ bind DTO/display-ready — không invent enum/amount [dev-fe/mobile]"
  display_ready: "Field list từ API response — không join 2 entity trên FE [dev-fe]"
  scope_parity: "List và get-by-id cùng resolver [dev-be]"
  tests: "jest/vitest path đụng module"
code_memory_required: true
code_memory_mode: APPEND
```

Dev **ghi lại** trong `@CODE-MEMORY` (hoặc `@CODE-MEMORY-CHANGE`) dòng:

```text
solid_convention_ack: <cùng nội dung ngắn, tiếng Việt>
```

**QC/TM reject** nếu: sửa `src/**` business mà thiếu block · ack mâu thuẫn impl (vd. FE tính lương) · thiếu `spec_read_ack` khi đụng UC mới.

---

## 4. CODE-MEMORY — journal bắt buộc (OS `04` + rule global)

Trước khi sửa logic nghiệp vụ:

1. SRS FR/UC + Diễn biến bước  
2. TechSpec + DB_DESIGN + API_DESIGN (endpoint + bước SRS)  
3. Đọc hết `@CODE-MEMORY` / `-CHANGE` trong file  

Sau khi sửa: **APPEND** `@CODE-MEMORY-CHANGE` (work_item, must_keep, không xóa block cũ).

Template: `~/.cursor/templates/CODE_MEMORY_BLOCK.md`

---

## 5. SOLID — checklist nhanh theo vai trò

| Nguyên tắc | BE | FE / Mobile |
|------------|----|-------------|
| **S** | Service một domain; controller mỏng | Screen/feature một UC; tách hook API vs presentational |
| **O** | Mở rộng catalog/rule bằng config/BE, không if sponsor trong UI | Pattern shell (Settings catalog) — compose, không copy-paste 500 dòng |
| **L** | DTO contract ổn định cho consumer | Không đổi nghĩa field khi map API |
| **I** | Interface repository nhỏ | Props component nhỏ; không “god screen” |
| **D** | Phụ thuộc abstraction (service interface), không gọi Prisma từ controller | `integrations/hrmApiClient` — UI không `fetch` rải rác |

Anti-pattern **cấm** (rule `senior-engineering-solid.mdc`): God module · business logic trong controller/view · FE nested write DTO · FE payroll formula.

---

## 6. PM — copy-ready đoạn gắn vào Task Dev

```text
read_first (ordered):
1. docs/program/SUBAGENT_READ_MAP.md — lane <ROLE>
2. _vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md
3. _vibe-team-os/26-DEV-LANES-WEB-MOBILE-BE.md
4. [dev-fe] _vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md
5. Spec slice: <SRS/API/UI_UX path> for this work_item_id

exit_criteria (SOLID):
- Mọi file business touched có @CODE-MEMORY + solid_convention_ack
- Không vi phạm forbidden_paths / lane (SUBAGENT_READ_MAP)
- Regression test package filter PASS
- evidence ghi spec_read_ack + solid_convention_ack verbatim
```

---

## 7. QA / QC — không pass “chỉ chạy được”

- QA **FAIL** nếu impl lệch SRS nhưng “console sạch” (U76/U65).  
- QC **NO-GO** nếu thiếu `solid_convention_ack` / CODE-MEMORY trên diff business · hoặc FE-BE boundary vi phạm `28`.  
- TM spot-check wave lớn: grep `solid_convention_ack` trên files trong `allowed_paths` của slice.

---

## 8. Gap hiện tại (program)

- Preflight `check-code-memory` trên CI: **chưa bootstrap đủ** (QC GWC residual C-CM-01) — Dev vẫn **không được** bỏ CODE-MEMORY; PM coi thiếu block = process P0.  
- Mirror OS trong repo **không** thay SoT shared — sync doctrine ở `projects/_vibe-team-os` khi đổi chuẩn team.

---

## 9. Liên kết UI/UX Spec mới

- Web Settings: `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md` + `docs/hrm/ui-screens/*`  
- Mobile: `docs/UI_UX_SPEC_XEVN_HRM_MOBILE.md`  

UI spec **không** thay SOLID — bổ sung **layout/field/state**; SOLID vẫn quyết định **cấu trúc code** và **ranh giới FE/BE.
