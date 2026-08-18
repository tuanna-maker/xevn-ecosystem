# BA-U71-IM-RESIDUAL-01 — Close G-IM soft residuals (IM-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-U71-IM-RESIDUAL-01` |
| **from_role** | `pm` |
| **to_role** | `ba-process` |
| **lane** | governance |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| Team residual lock (AC/BR) | `docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md` | **ADD** |
| API_DESIGN residual § | `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` §0 / §A / §1–§2 | **UPDATED** |
| DB_DESIGN residual § | `docs/hrm/DB_DESIGN_HRM_IMPORT_PREVIEW.md` §0 / §2–§3 | **UPDATED** |
| TechSpec W2b gap rows | `docs/hrm/TECHSPEC.md` §16.2 W2b notes (+ leftover Info row) | **UPDATED** thin |
| Khách SRS §3.32 | `SRS_HRM_KHACH.md` | **Not wiped** — remaster optional later (team §5) |

**forbidden:** invent staging · `apps/**` · seed · Phase1/PROD claim · prompt-echo in client docs — **honored**.

---

## 2. Residual closures

| ID | Decision | BR / AC | Status |
|----|----------|---------|--------|
| **G-IM-01** | Commit = **HRM-IM-02** (`SHEET-201`); export = **HRM-IM-03** — **OUT** of FR-HRM-IM-01 DONE | BR-IM-01-SCOPE-01 · AC-IM-01-SCOPE-01/02 | **CLOSED** |
| **G-IM-SESSION-01** | «Mã phiên» = **non-goal**; SoT = ephemeral `SHEET-200` (`previewRows`/`errors`/…); no `sessionId` | BR-IM-01-SESSION-01 · AC-IM-01-SESSION-01..03 | **CLOSED** |
| **G-IM-CATALOG-01** | IM-01 = in-memory field validate; catalog hard-block + DB dup = **IM-02**; cấm staging | BR-IM-01-VAL-01/02 · BR-IM-02-VAL-01 · AC-IM-01-VAL-01..04 | **CLOSED (spec)** |

**Still open (execution, not BA):** **G-IM-OPENAPI-01** → `BE-HRM-OA-IMPORT-FLEET-01`.

---

## 3. Spec says / code does (honest)

| Topic | Spec lock after BA | Runtime (cite SA) |
|-------|--------------------|-------------------|
| Persist preview | N/A table | `previewEmployeeImport` — no INSERT |
| Session id | Non-goal | No session field in payload |
| Catalog / DB dup on preview | OUT hard-fail | In-memory field validation only — **aligned with lock** |

Dev/QA **must not** invent staging to «match» khách sequence SYS→DB for IM-01 MVP.

---

## 4. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | `pm` → `qa` (after BE OpenAPI WI) or intake close if OA already READY |
| **completion_report** | Closed G-IM-01 / G-IM-SESSION-01 / G-IM-CATALOG-01 with measurable AC in team delta + API/DB residual sections. No staging invent. Khách SRS untouched. |
| **evidence_path** | `docs/qa/evidence/ba-u71-im-residual-01-20260727.md` |
| **next_dispatch_prompt** | See §5 |

---

## 5. next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-IM-01-PREVIEW-AC-01
from_role: pm
to_role: qa
lane: execution
entry_criteria:
  - BA-U71-IM-RESIDUAL-01 PASS (docs/qa/evidence/ba-u71-im-residual-01-20260727.md)
  - API_DESIGN_HRM_IMPORT_PREVIEW + SRS_HRM_IM_01_RESIDUAL_TEAM AC lock
  - BE-HRM-OA-IMPORT-FLEET-01 READY_FOR_QA or already PASS (G-IM-OPENAPI-01) — if still DISPATCHED, wait then chain
  - L0 stack up; U65 zero-seed; browser-only
exit_criteria:
  - AC-IM-01-SCOPE-01/02 · AC-IM-01-SESSION-01/02 · AC-IM-01-VAL-01..03 PASS on FE
  - Network POST /api/hrm/spreadsheet/import/preview → SHEET-200; no employees INSERT; no sessionId required
  - FAIL if evidence uses seed/staging invent or requires commit to pass IM-01
  - evidence_path: docs/qa/evidence/qa-hrm-im-01-preview-ac-01-20260727.md
  - ack_status: PASS_TO_PM
cấm: pnpm seed:* · invent staging · claim IM-02 DONE · Phase1/PROD
persona: ceo@xe.vn / Xevn@2026 (or HCNS import persona if matrix specifies)
```

If `BE-HRM-OA-IMPORT-FLEET-01` not yet READY_FOR_QA:

```text
work_item_id: PM-INTAKE-BA-U71-IM-RESIDUAL-01
from_role: pm
to_role: pm
lane: governance
entry_criteria: ba-u71-im-residual-01-20260727.md PASS_TO_PM
exit_criteria: Bus INTAKE close G-IM-01/SESSION/CATALOG; keep BE-HRM-OA-IMPORT-FLEET-01 in flight; dispatch QA-HRM-IM-01-PREVIEW-AC-01 when OA READY_FOR_QA
cấm: reopen SA wipe · invent staging · Phase1/PROD
```
