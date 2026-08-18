# QA-HRM-G-DEC-01-DENSITY-01 — Decisions density browser U65

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-G-DEC-01-DENSITY-01` |
| **from_role** | `qa` |
| **to_role** | `pm` / `qc` |
| **ack_status** | **PASS_TO_PM** |
| **priority** | P1 |
| **executed_at** | 2026-07-22 ~19:15–19:25 ICT |
| **PORTAL_DEV_URL** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` (session already active; inbox shows ceo@xe.vn) |
| **U65** | zero-seed · browser-only · **no** `pnpm seed:*` · no JWT / P-CC-01 · no Phase1/PROD · **no** UC-HRM-27 DONE claim |
| **spec_ref** | UC-HRM-27 / FR-HRM-27 · AC-DEC-02 · AC-DEC-04 · AC-DEC-DENSITY · TechSpec §16.5 #50 · §16.9 **G-DEC-01** |
| **entry** | `docs/qa/evidence/fe-hrm-g-dec-01-density-01-20260722.md` (**READY_FOR_QA**) |

---

## Executive summary

Browser U65 on Dev8088: empty honesty **«Không có quyết định nào»** (baseline **0**), FE create → **POST `/api/hrm/decisions` 201** `HRM-DEC-201` → row on list (**Tất cả 1** / **Bổ nhiệm 1**), F5 → row persists, no error banner. **AC-DEC-DENSITY** density path **PASS**. **Not claimed:** UC-HRM-27 full DONE · Phase1 · PROD · JWT.

**Verdict: PASS_TO_PM** → next **QC** sample gate G-DEC-01 density.

---

## Environment

| Item | Detail |
|------|--------|
| Portal | `http://14.225.217.232:8088/` (`PORTAL_DEV_URL=http://14.225.217.232:8088`) |
| Local L0 | `qc:dev-stack` FAIL (28001/28002/5173 down) — used VPS `:8088` |
| nip.io | portal HTML 200; not primary for this wave |
| HRM path | standalone `/hr/decisions` (embed iframe not MCP-accessible; same JWT as portal) |
| Seed | **none** |
| JWT / P-CC-01 | **not touched** |

---

## Micro-checklist results

| # | Check | Result |
|---|--------|--------|
| 1 | Login `ceo@xe.vn` → HRM → **Quyết định** | **PASS** — session ceo@xe.vn → `/hr/decisions` |
| 2 | Empty honesty «Không có quyết định nào» (not «chưa triển khai») | **PASS** — baseline **0**; forbidden copy **false** |
| 3 | FE create → Lưu → POST **2xx** → row on list | **PASS** — **201** `HRM-DEC-201`; list **1** |
| 4 | F5 → row còn; no banner lỗi | **PASS** — row + title persist; no Sync ERROR / chưa triển khai |
| 5 | Evidence + ack | **PASS** — this file · `PASS_TO_PM` |

---

## UF blocks (U65 mẫu)

### UF-DEC-EMPTY — Empty honesty (AC-DEC-02)

- **Persona / URL / click path:** `ceo@xe.vn` → `http://14.225.217.232:8088/hr/decisions`
- **Trước mutate:** tabs **Tất cả 0** … **Gia hạn HĐ 0**; footer `Hiển thị 0 - 0 trong số 0 bản ghi`
- **FE empty copy:** **«Không có quyết định nào»** visible in table body
- **Forbidden:** `chưa triển khai` / `not implemented` → **absent** (`hasForbidden: false`)
- **Network:** GET list live empty OK (pre-create)
- **Verdict:** 🟢
- **spec_ref:** FR-HRM-27 · AC-DEC-02 · BR-DEC-03

### UF-DEC-CREATE-LIST — Create → list density (AC-DEC-04 / AC-DEC-DENSITY)

- **Persona / URL / click path:** same → **+ Thêm quyết định** → fill → **Thêm mới**
- **Trước mutate:** total **0**
- **Action:**
  - Số QĐ: `QĐ-QA-DEC-220726-01`
  - Loại: Bổ nhiệm
  - Tiêu đề: `QA density U65 — bổ nhiệm kiểm thử G-DEC-01`
  - NV: `CEO Tập đoàn` / `PORTAL-GCEO`
  - Tình trạng: Dự thảo
  - Submit: **Thêm mới** (UI showed **Đang lưu...**)
- **Network:**

```http
POST /api/hrm/decisions → 201
code: HRM-DEC-201
id: e1052924-a905-41d1-9a8d-dcc9ad0510ae

GET /api/hrm/decisions?company_id=main → 200
code: HRM-DEC-200
```

- **FE sau 2xx (SRS):** dialog closed; row `QĐ-QA-DEC-220726-01` on list; tabs **Tất cả 1** / **Bổ nhiệm 1**; footer `Hiển thị 1 - 1 trong số 1 bản ghi`; status **Dự thảo**
- **Verdict:** 🟢
- **spec_ref:** AC-DEC-04 · AC-DEC-DENSITY · G-DEC-01

### UF-DEC-F5 — Persist after reload

- **Action:** navigate/reload `http://14.225.217.232:8088/hr/decisions` (F5 equivalent)
- **FE sau F5:** row `QĐ-QA-DEC-220726-01` + title still present; **Tất cả 1**; `Hiển thị 1 - 1 trong số 1 bản ghi`
- **Banner lỗi:** none (`hasErrorBanner: false`)
- **Verdict:** 🟢
- **spec_ref:** FR-HRM-27 F5 · AC-DEC-DENSITY

---

## AC matrix (narrow)

| AC | Result | Notes |
|----|--------|-------|
| AC-DEC-02 empty honesty | **PASS** | «Không có quyết định nào»; no stub |
| AC-DEC-04 create→list | **PASS** | POST 201 → row without filter hide |
| AC-DEC-DENSITY | **PASS** | ≥1 QSĐ via FE create→list→F5 U65 |
| UC-HRM-27 full DONE | **not claimed** | density closed; other UC-27 branches out of this wave |
| AC-ATT-SHEET | **must_keep** | not touched |

---

## Residuals / not promoted

| ID | Severity | Note |
|----|----------|------|
| UC-HRM-27 full product DONE | — | **not promoted** — only density browser closed |
| JWT / P-CC-01 | — | **out of scope** (closed elsewhere) |
| Local L0 | P3 | workstation APIs down; VPS `:8088` used |
| emptyHint CTA text | soft | empty state showed SoT «Không có quyết định nào»; CTA **Thêm quyết định** present — hint line not separately asserted |

---

## completion_report

**Closed:** QA-HRM-G-DEC-01-DENSITY-01 browser U65 — empty honesty + create→POST 201→list + F5 persist on `PORTAL_DEV_URL=http://14.225.217.232:8088`. AC-DEC-02 / AC-DEC-04 / AC-DEC-DENSITY **PASS**. Zero seed.

**Residual:** Do not claim UC-HRM-27 / Phase1 / PROD; QC may sample G-DEC-01 density only.

**ack_status:** PASS_TO_PM

---

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: QC-HRM-G-DEC-01-DENSITY-01
from_role: pm
to_role: qc
lane: governance
priority: P1
entry_criteria: QA PASS docs/qa/evidence/qa-hrm-g-dec-01-density-01-20260722.md · FE READY docs/qa/evidence/fe-hrm-g-dec-01-density-01-20260722.md
spec_ref: UC-HRM-27 / FR-HRM-27 · AC-DEC-DENSITY · TechSpec §16.9 G-DEC-01
must_keep: AC-ATT-SHEET · 44 Cao · U65 · no JWT reopen
cấm: seed · claim UC-27/Phase1/PROD DONE beyond density sample

Audit browser UF blocks UF-DEC-EMPTY / UF-DEC-CREATE-LIST / UF-DEC-F5 on PORTAL_DEV_URL=http://14.225.217.232:8088
exit: GO or GWC with residual list; evidence docs/qa/evidence/qc-hrm-g-dec-01-density-01-20260722.md
```
