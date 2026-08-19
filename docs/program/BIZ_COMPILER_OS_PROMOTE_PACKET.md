# Business Change Compiler — OS promote packet (Phase B)

| Mục | Nội dung |
|-----|----------|
| **work_item_id** | `PO-BIZ-CHANGE-COMPILER-OS-PROMOTE-01` |
| **Phase** | B — sau Phase A sample Manifest xanh (`PO-BIZ-CHANGE-COMPILER-BA-01`) |
| **SoT quyết định** | ADR §9 — `docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md` |
| **Pilot nguồn** | `docs/program/schemas/*` trong `xevn-ecosystem` |
| **Target** | Full `projects/_vibe-team-os` (có `02` … `33`) |
| **Cấm** | Ghi vào stub OS 2-file · `apps/**` · thay Spec-first · Tencent bắt buộc |

---

## 1. Entry criteria

- [x] ADR Option C Accepted (SA-01)  
- [x] Schema v0.1.1 trên pilot  
- [x] BA-01: Excel column map + `change-manifest.example.json` (3 samples ATT/EMP/REC)  
- [x] Sample validate checklist trong evidence BA-01  
- [ ] QA spot docs đối chiếu phiếu/gap (khuyến nghị trước Phase B)  
- [ ] PM bus `DISPATCHED` work item promote này  

**Không vào Phase B** nếu sample còn invent UC hoặc đụng `apps/**`.

---

## 2. Files to ADD (dưới root full `_vibe-team-os/`)

| # | Path | Content nguồn (pilot) |
|---|------|------------------------|
| 1 | **`34-BUSINESS-CHANGE-COMPILER.md`** | Doctrine — dùng **§8 outline** dưới đây làm body khởi tạo |
| 2 | `templates/CHANGE_MANIFEST.example.json` | Copy pilot example (có thể tách 1 sample Plane D đơn nếu OS muốn file ajv-root) |
| 3 | `templates/CHANGE_MANIFEST_EXCEL_COLUMNS.md` | Copy `docs/program/schemas/CHANGE_MANIFEST_EXCEL_COLUMNS.md` |
| 4 | `templates/compile-change-manifest.md` | How-to compile/validate (manual v0.1 + script stub path) |
| 5 | `schemas/change-manifest.schema.json` | Copy pilot schema — giữ `0.1.x` |
| 6 | Optional `rules/business-change-compiler.mdc` | Pointer mỏng → chapter 34 |
| 7 | Optional `skills/…` checklist | Superpowers-like ADD-only — không đè role cards |

---

## 3. Files to UPDATE

| # | Path | Change |
|---|------|--------|
| 1 | `MANIFEST.json` | Thêm `"34-BUSINESS-CHANGE-COMPILER.md"` vào `docs[]`; bump version + `updated` |
| 2 | `CHANGELOG.md` | Entry Phase B promote U77-equivalent |
| 3 | `PM-START-HERE.md` | Situation: “Sponsor Excel / change batch” → đọc `34` |
| 4 | `README.md` / `MEMORY.md` | Lock row compiler / Manifest nếu OS có bảng lock |
| 5 | `06-PM-ORCHESTRATION.md` | Dispatch: field `change_manifest_path` khi batch change |
| 6 | `templates/PM_DETAILED_DISPATCH.md` | `change_manifest_path:` |
| 7 | `templates/SUBAGENT_READ_MAP.md` (hoặc OS tương đương) | Row compiler / Manifest |

---

## 4. MUST promote gate (exit Phase B)

- [ ] Chapter **34** trên disk tại full OS root  
- [ ] Schema + example + Excel columns template present  
- [ ] `MANIFEST.json` lists 34  
- [ ] `PM-START-HERE` situation link  
- [ ] Câu invariant: **Spec-first unchanged**; Memory/Compound = loadout/compound only  
- [ ] Evidence: `docs/qa/evidence/po-biz-change-compiler-os-promote-01.md` (pilot) hoặc OS `case-studies/`  
- [ ] Không Tencent / cloud memory bắt buộc  
- [ ] Không ghi stub NFC 2-file  

---

## 5. Copy-ready dispatch (PM → sa / ba-docs)

```text
work_item_id: PO-BIZ-CHANGE-COMPILER-OS-PROMOTE-01
from_role: pm
to_role: sa
priority: P1
lane: governance

read_first (ordered):
1. docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md §9
2. docs/program/BIZ_COMPILER_OS_PROMOTE_PACKET.md
3. docs/program/schemas/change-manifest.schema.json
4. docs/program/schemas/change-manifest.example.json
5. docs/program/schemas/CHANGE_MANIFEST_EXCEL_COLUMNS.md
6. docs/program/COMPOUND_MEMORY_INTEGRATION_CHECKLIST.md
7. docs/qa/evidence/po-biz-change-compiler-ba-01.md
8. Full OS root: MANIFEST.json + PM-START-HERE.md + README-SOT-LOCATION.md

Deliverables:
- ADD 34-BUSINESS-CHANGE-COMPILER.md + templates + schemas (packet §2)
- Body chapter 34 từ packet §8 (Hybrid C + anti-patterns + links)
- UPDATE MANIFEST.json + PM-START-HERE + dispatch templates (packet §3)
- Evidence docs/qa/evidence/po-biz-change-compiler-os-promote-01.md
- Tick §4 MUST gate

exit_criteria:
- §4 all checked
- ack_status PASS_TO_PM
- next_dispatch_prompt: pm refresh BUSINESS_CHANGE_COMPILER_PROGRAM.md Phase B DONE + optional A3 compile script

cấm: stub OS 2-file · apps/** · replace Spec-first · Tencent mandatory · claim product remaster
```

---

## 6. Residual sau promote

| ID | Item | Owner |
|----|------|-------|
| R-OS-1 | Optional `scripts/compile-change-manifest.mjs` trên OS hoặc pilot | devops / sa |
| R-OS-2 | Program markdown pilot đánh dấu Phase B DONE | pm |
| R-OS-3 | Thin Cursor rule pointer nếu team dùng rule always-on | pm / sa |

---

## 7. Liên kết

- U77 — `docs/program/TEAM_USER_REQUIREMENTS.md`  
- Compound checklist — `docs/program/COMPOUND_MEMORY_INTEGRATION_CHECKLIST.md`  
- BA evidence — `docs/qa/evidence/po-biz-change-compiler-ba-01.md`

---

## 8. Draft body — `34-BUSINESS-CHANGE-COMPILER.md` (copy vào OS)

> Dùng nguyên khối dưới khi ADD chapter 34. Giữ tiếng Việt kỹ thuật nội bộ OS. **Không** dán chat sponsor / work_item chat vào tài liệu khách.

```markdown
# 34 — Business Change Compiler

| Field | Value |
|-------|--------|
| **Status** | Active (promoted from xevn-ecosystem pilot) |
| **Decision** | Hybrid Option C — Excel/docs (human) + Manifest JSON (machine) |
| **Depends** | `02-SPEC-FIRST-GATE` · `05-MEMORY-LAYERS` · `06-PM-ORCHESTRATION` · `09` · `13` · `14` · `22` |
| **Schema** | `schemas/change-manifest.schema.json` |
| **Templates** | `templates/CHANGE_MANIFEST_EXCEL_COLUMNS.md` · `templates/CHANGE_MANIFEST.example.json` |

## 1. Mục đích

Chuẩn hóa đường: nguồn thay đổi nghiệp vụ (Excel / docs / chat extract) → **Change Manifest JSON** máy-đọc → **Spec-first pipeline** (SRS → confirm → TechSpec → DB_DESIGN → API_DESIGN → slice/neo → Dev → QA → QC).

Manifest **feed** Spec-first — **không** thay thứ tự Spec-first, không thay `sponsor_confirm`, không thay `spec_read_ack`.

## 2. Hybrid Option C

| Plane | Artifact | Owner |
|-------|----------|-------|
| Human | Excel / phiếu chốt | Sponsor + BA |
| Machine | Manifest JSON (Plane D) | BA emit · PM attach `change_manifest_path` |
| Compiler | Manual (v0.1) → script (v0.2+) | devops/SA |

Khi sheet ≠ JSON: **Manifest thắng**; BA re-compile.

## 3. Pipeline (invariant)

```text
Sponsor Excel/docs
  → Compiler emit Manifest (ajv)
  → Team Memory LOADOUT (optional; adapt — not gate)
  → Spec-first (02 / 13 / 14) — UNCHANGED order
  → Dev (slice + neo / 22) → QA → QC
  → Compound UPDATE (bus/evidence/memory) → optional promote OS lesson
```

## 4. Field glossary (tóm tắt)

Required: `manifest_version`, `work_item_id`, `uc_ids`, `br_ids`, `ac[]`, `slice_id`,
`allowed_paths`, `forbidden_paths`, `role_owners`, `sponsor_confirm`, `change_mode`, `neo_tags`.

`change_mode`: `ADD` | `UPGRADE` | `FIX` only. REPLACE/REMOVE → `sponsor_override`.

`ac[].verify=browser` ⇒ bắt buộc `uf_or_j`.  
`sponsor_confirm.status=CONFIRMED` ⇒ bắt buộc `date`.

## 5. Compound + Team Memory

- Pre-task: loadout từ Manifest ids (`compound_hooks.pre_task_memory_loadout`).
- Post-task: cập nhật memory/bus/slice (`post_task_memory_update`).
- **Cấm:** “memory đã có → khỏi SRS”; daemon/cloud memory bắt buộc để GO.

Xem checklist pilot: Compound/Memory integration checklist (copy sang OS skills nếu cần).

## 6. Anti-patterns

| Anti-pattern | Reject |
|--------------|--------|
| Spreadsheet-only, không Manifest | Vi phạm lock compiler |
| Manifest cấp quyền code khi PENDING | STOP Dev |
| Invent UC/BR | BA reject |
| Promote vào stub OS 2-file | STOP — chỉ full OS root |
| Claim remaster/product GO từ wave compiler | NO-GO |

## 7. PM dispatch

Khi batch change từ Excel: gắn `change_manifest_path` (một file Plane D / wave).  
Đọc thêm: `PM-START-HERE` situation “Sponsor Excel / change batch”.

## 8. Promote maintenance

Schema/templates đổi ở pilot → sync lại OS + bump `MANIFEST.json`.  
Không bắt buộc Tencent / Superpowers full install.
```
