# FE-HRM-G-DEC-01-DENSITY-01 — Decisions live-empty + create→list density

| Field | Value |
|-------|-------|
| **work_item_id** | `FE-HRM-G-DEC-01-DENSITY-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P1 |
| **date** | 2026-07-22 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD (density/fidelity UX) |
| **spec_ref** | khách `SRS_HRM_KHACH.md` §3.50 **FR-HRM-27** · team `docs/hrm/SRS.md` UC-HRM-27 · TechSpec §16.5 #50 · §16.9 **G-DEC-01** |
| **entry** | `docs/qa/evidence/tm-hrm-code-spec-convention-w2d-01-20260722.md` §3.3 + §4.1 |
| **U65** | zero-seed — density via FE create only |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| **srs (khách)** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.50 **FR-HRM-27** — empty «Không có quyết định nào»; F5 sau tạo; cấm «chưa triển khai» |
| **srs (team)** | `docs/hrm/SRS.md` UC-HRM-27 · AC-DEC-02 · AC-DEC-04 · **AC-DEC-DENSITY** · BR-DEC-03/06 |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §16.5 #50 · §16.9 **G-DEC-01** |
| **tm entry** | `tm-hrm-code-spec-convention-w2d-01-20260722.md` §3.3 + §4.1 |
| **sponsor_confirm** | PM dispatch `code_allowed: true` (sponsor auto-continue) |
| **change_mode** | ADD |
| **must_keep** | AC-ATT-SHEET · 44 Cao · U65 · live-empty honesty |
| **forbidden** | seed decisions · Phase1/PROD claim · claim UC-27 DONE without density AC |

**spec says:** empty live OK; density/fidelity **not** DONE until create→list→F5 U65 + AC-DEC-DENSITY.  
**code does (before):** REST CRUD + `decisions.noData` OK; risk — create từ tab loại + filter → list vẫn trống sau 201.  
**after:** empty CTA + reset visibility sau create; CODE-MEMORY; vitest density gate.

---

## Implementation

| Layer | Change |
|-------|--------|
| Helper | `src/lib/decisionListUi.ts` — live-empty gate · `resolveListVisibilityAfterCreate` · create dialog type prefill |
| Page | `Decisions.tsx` — empty «Không có quyết định nào» + hint + CTA Thêm; sau create → tab Tất cả / clear filter / page 1; prefill type từ tab |
| Hook | `useDecisions.ts` — CODE-MEMORY VI + CHANGE; giữ `invalidateQueries` sau create |
| i18n | `vi.json` / `en.json` — `decisions.emptyHint` |
| Tests | `decisionListUi.test.ts` (7) + `useDecisions.test.ts` (3) |

**Not claimed:** UC-HRM-27 DONE · Phase1 · PROD · UF 🟢 (QA browser U65 required).  
**Not touched:** AC-ATT-SHEET / attendance sheet paths.

---

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/decisionListUi.test.ts src/hooks/useDecisions.test.ts --reporter=dot
```

| Suite | Result |
|-------|--------|
| `decisionListUi.test.ts` — **7 tests** | **PASS** |
| `useDecisions.test.ts` — **3 tests** | **PASS** |
| **Total 10** | **exit 0** |

---

## QA browser checklist (U65 — cấm seed)

Persona: `ceo@xe.vn` · portal → HRM embed → **Quyết định** (`/decisions` / Command Center HRM decisions)

1. **Empty honesty:** nếu `total:0` → copy **«Không có quyết định nào»** (+ hint/CTA) — **không** «chưa triển khai» / mock.
2. **Create→list:** Thêm quyết định → mã + tiêu đề + NV → **Lưu** → Network **POST** `/api/hrm/decisions` **2xx** → list hiện ≥1 row (kể cả khi tạo từ tab loại khác).
3. **F5:** reload → row còn (persist).
4. **Regression:** không đụng Chấm công / bảng công (AC-ATT-SHEET).

**cấm:** `pnpm seed:*` · API fake density · claim UC-27 DONE chỉ vì empty+200.

---

## completion_report

**Closed:** FE G-DEC-01 density path — live-empty copy locked; empty CTA; create→list visibility reset; CODE-MEMORY; vitest 10 PASS.

**Residual (QA owns):** Browser U65 create→list→F5 evidence; AC-DEC-DENSITY close only after ≥1 QSĐ via FE; **không** promote UC-27 DONE trong wave này.

**ack_status:** READY_FOR_QA

---

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-HRM-G-DEC-01-DENSITY-01
from_role: pm
to_role: qa
lane: execution
priority: P1
entry_criteria: FE READY docs/qa/evidence/fe-hrm-g-dec-01-density-01-20260722.md · L0 stack up · U65 zero-seed
spec_ref: UC-HRM-27 / FR-HRM-27 · AC-DEC-02 · AC-DEC-04 · AC-DEC-DENSITY · TechSpec §16.5 #50 · G-DEC-01
must_keep: AC-ATT-SHEET · 44 Cao · U65
cấm: seed · probe-only PASS · claim UC-27 DONE without browser density

Browser (ceo@xe.vn → HRM → Quyết định):
1) Empty: «Không có quyết định nào» (not «chưa triển khai»)
2) FE create → POST 2xx → row on list
3) F5 → row remains
4) Evidence: docs/qa/evidence/qa-hrm-g-dec-01-density-01-20260722.md
exit_criteria: PASS_TO_PM with UF blocks; residual if any
```
