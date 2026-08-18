# SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01 — API F.1 (IM-01 non-persist)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01` |
| **from_role** | `pm` |
| **to_role** | `sa` |
| **lane** | governance · U71 P3 physical design (API_DESIGN · no persist table) |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| API_DESIGN (canonical) F.1 | `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` | **ADD** |
| DB_DESIGN note (N/A table) | `docs/hrm/DB_DESIGN_HRM_IMPORT_PREVIEW.md` | **ADD** — explicitly non-persist |
| Pointer API | `docs/tech-spec/API_DESIGN_HRM_IMPORT_PREVIEW.md` | **ADD** |
| Pointer DB | `docs/tech-spec/DB_DESIGN_HRM_IMPORT_PREVIEW.md` | **ADD** |
| Index promote | `docs/tech-spec/README.md` §2 → **21** pairs · §3 Import **DONE** · must_keep IM-01 | **UPDATED** |
| Admin residual pointer | `API_DESIGN_HRM_ADMIN` §7 next → DONE cite | **UPDATED** (thin) |

**forbidden_paths:** `apps/**` — **not touched**.  
**cấm:** invent persist tables · seed · Phase1/PROD claim — **honored**.

---

## 2. F.1 checklist (API_DESIGN)

| § | Endpoint | Mục đích | Nghiệp vụ xử lý | Bước SRS (UC/FR + Diễn biến) | Verdict |
|---|----------|----------|-----------------|------------------------------|---------|
| A | `POST /api/hrm/spreadsheet/import/preview` | ✅ Xem trước import NV — không ghi hồ sơ | ✅ auth + scope + parse + row validate + `SHEET-200` · **zero INSERT** | FR-HRM-IM-01 / HRM-IM-01 **#1–#8** · G-IM-CATALOG-01 on #4 | **PASS** |
| B | `GET …/spreadsheet/limits` | ✅ Supporting limits | ✅ snapshot env limits · no DB | Supporting FR-IM-01 precondition | **PASS** (supporting) |
| C | `GET …/spreadsheet/templates/:kind` | ✅ Supporting mẫu tệp | ✅ stream csv/xlsx · no DB | Supporting · leftover IM-04 cite | **PASS** (supporting) |

**Non-persist proof (design):** `DB_DESIGN_HRM_IMPORT_PREVIEW` §0 + TechSpec §17.1 `*(import preview — no persist)*` + runtime `previewEmployeeImport` (read-only evidence for SA; no code change).

**Out of scope documented:** `POST …/import/commit` (`SHEET-201` · IM-02) · export — **G-IM-01**.

---

## 3. must_keep (verified not rewritten)

| Pair | Path |
|------|------|
| HRM Admin | `docs/hrm/DB_DESIGN_HRM_ADMIN.md` · API — **COMPLETE** (see §6) |
| HRM Fleet / Operations / W2 | prior `docs/hrm/DB_DESIGN_HRM_*` |
| HRM Employees / Payroll / Leave / ATT | prior pairs |
| XBOS Auth/Tenant · RACI · WF · catalog-gov · KPI | prior `docs/xbos/DB_DESIGN_XBOS_*` |

---

## 4. Architecture facts (evidence-based)

| Fact | Source |
|------|--------|
| Primary path `POST /api/hrm/spreadsheet/import/preview` | TechSpec §16.2 row 32 · `SpreadsheetController` |
| Success code `SHEET-200` | TechSpec + controller `ok(..., 'SHEET-200', 'Import preview')` |
| Kind `employee_import` | `ImportMultipartMetaDto` |
| Preview payload fields | `ImportPreviewResult` in `spreadsheet.service.ts` |
| Default `maxPreviewRows` = 100 | `spreadsheet-limits.ts` |
| No staging table | TechSpec §17.1 · design N/A |
| SRS Diễn biến #1–#8 | `SRS_HRM_KHACH.md` §3.32 |
| Spec/runtime gap catalog+dup | Documented **G-IM-CATALOG-01** — not invent table |

---

## 5. Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-IM-01** | Info | ba optional | Commit/export leftover catalog |
| **G-IM-SESSION-01** | Info | ba | SRS «mã phiên» vs no session id |
| **G-IM-CATALOG-01** | P2 | ba/dev-be | SRS #4 catalog/dup vs in-memory preview |
| **G-IM-OPENAPI-01** | P2 | `dev-be` | OpenAPI multipart deepen |

**No next U71 physical-design WI in README §3** — backlog table closed for listed slices.

---

## 6. Admin COMPLETE confirmation (already on disk)

| Check | Result |
|-------|--------|
| `docs/hrm/DB_DESIGN_HRM_ADMIN.md` | **EXISTS** |
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` | **EXISTS** |
| Pointers `docs/tech-spec/*_HRM_ADMIN.md` | **EXISTS** |
| Evidence `docs/qa/evidence/sa-u71-hrm-admin-design-01-20260727.md` | **EXISTS** · ack **PASS_TO_PM** · README §2 Admin **COMPLETE** |
| Separate Admin evidence rewrite this wave? | **Not required** — file already complete; Import evidence cites §6 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | `pm` |
| **completion_report** | Closed U71 P3 IM-01 F.1 non-persist (API + N/A DB note + pointers + README §2/§3). Residuals G-IM-* Info/P2 only — no invent staging. Admin COMPLETE already evidenced. |
| **next_dispatch_prompt** | See §8 |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-U71-PHYSICAL-BACKLOG-CLOSE-01
from_role: pm
to_role: pm (intake) → optional technical-manager / ba-process
lane: governance
entry_criteria: README §3 listed U71 physical rows DONE (21 pairs); Import evidence sa-u71-hrm-import-preview-design-01-20260727.md PASS_TO_PM
exit_criteria: Decide (a) close G-RULE-11 path note as F.1-complete for scanned slices OR (b) dispatch ba-process on G-IM-CATALOG-01 / G-IM-SESSION-01 only if sponsor wants preview to hard-check catalog+dup; OpenAPI deepen = optional dev-be P2 — not blocking physical design
evidence_path: docs/qa/evidence/sa-u71-hrm-import-preview-design-01-20260727.md
cấm: invent import staging tables · apps/** without WI · Phase1/PROD claim · seed
```
