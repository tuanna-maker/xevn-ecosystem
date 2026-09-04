# Business Change Compiler — Program (sponsor 2026-08-05)

| Field | Value |
|-------|--------|
| **program_id** | `PO-BIZ-CHANGE-COMPILER` |
| **sponsor_lock** | Excel/docs delta → Manifest JSON → Spec-first pipeline → Dev/QA/QC; then **promote** to `_vibe-team-os` |
| **scope_phase_A** | `xevn-ecosystem` only — `docs/program/**`, schemas, checklists, scripts under `scripts/` if needed — **cấm** `apps/**` |
| **scope_phase_B** | Promote doctrine + templates into `projects/_vibe-team-os` (SoT đa dự án / công ty Agent) |
| **remaster / product GO** | **không** liên quan — không claim |

## 1. North star

Sponsor chỉ cập nhật nghiệp vụ trên **Excel / docs / SRS delta**. Hệ thống (PM + agents) tự:

1. Compile → **Change Manifest** (JSON)
2. Gate Spec-first (SRS → TechSpec → DB_DESIGN → API_DESIGN)
3. Squad dispatch đúng role
4. Evidence + neo (`@CODE-MEMORY`, slice, bus)
5. **Compound** learnings + **Memory loadout** theo role
6. Sau khi ổn trên XeVN → **cập nhật `_vibe-team-os`** để mọi PM/PO sau không cần nhắc lại

## 2. Roadmap (đã chốt sponsor)

| Phase | Owner | Deliverable | Exit |
|-------|--------|-------------|------|
| **A0** | PM | Program + U77 lock + bus | this file |
| **A1** | SA | ADR-lite / option eval + Manifest JSON Schema + Memory/Compound integration map | evidence `docs/qa/evidence/po-biz-change-compiler-sa-01.md` |
| **A2** | BA-docs + BA-data | Excel column SoT + sample Manifest từ sheet chốt (HRM) + validation matrix | `…-ba-01.md` + schema files under `docs/program/schemas/` |
| **A3** | PM | Checklist tích hợp Compound Engineering + Team Memory (không bắt buộc deploy Tencent ngay) | `docs/program/COMPOUND_MEMORY_INTEGRATION_CHECKLIST.md` |
| **A4** | QA spot | Validate: 1 Excel row giả → Manifest hợp lệ → dispatch packet đủ field (docs-only) | `…-qa-01.md` |
| **B1** | ba-docs / SA | Promote → `_vibe-team-os`: doctrine mới (số chương kế tiếp), templates, `MANIFEST.json` entry, `PM-START-HERE` / `PM-NEW-JOIN-KIT` pointer | OS CHANGELOG + README |
| **B2** | PM | Global Cursor rule pointer (optional) `~/.cursor/rules/` → OS doctrine | rule 1 file |

## 3. Non-goals (Phase A)

- Không rewrite product UI/API
- Không thay Superpowers/Compound nguyên gói đè Spec-first XeVN
- Không bắt buộc self-host TencentDB Agent Memory ngay — chỉ thiết kế loadout + checklist

## 4. Work items

| work_item_id | Role | Status |
|--------------|------|--------|
| `PO-BIZ-CHANGE-COMPILER-SA-01` | sa | DISPATCHED |
| `PO-BIZ-CHANGE-COMPILER-BA-01` | ba-docs (+ ba-data collab) | DISPATCHED |
| `PO-BIZ-CHANGE-COMPILER-QA-01` | qa | after A1+A2 |
| `PO-BIZ-CHANGE-COMPILER-OS-PROMOTE-01` | ba-docs + sa | after A3+A4 PASS |

## 5. References (research 2026-08-05)

- GitHub Trending adapt: Tencent Agent Memory · obra/superpowers · EveryInc compound-engineering · firecrawl/pdf-inspector · uber/ADR (agent security)
- Existing OS: Spec-first, CODE-MEMORY, slice, squad, SOLID (`_vibe-team-os` 02/04/13/14/22/25…)
- Pilot business sheets: `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_CHOT_*`
