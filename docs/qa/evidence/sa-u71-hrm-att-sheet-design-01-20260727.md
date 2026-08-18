# SA-U71-HRM-ATT-SHEET-DESIGN-01 — Physical DB_DESIGN + API_DESIGN (Attendance sheets)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-ATT-SHEET-DESIGN-01` |
| **lane** | governance · U71 P1 |
| **date** | 2026-07-27 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** |
| **forbidden** | `apps/**` (not touched) |
| **must_keep** | Leave pair · TEXT `company_id` scope parity · AC-ATT-SHEET · G-DB-07 no auto roster |

---

## 1. Deliverables

| Artifact | Path | F.1 / physical |
|----------|------|----------------|
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_ATT_SHEET.md` | `attendance_sheets` columns + TEXT `company_id` + status lifecycle; related `attendance_records` period bind (no FK); indexes; dual-plane |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_ATT_SHEET.md` | **list / get / generate / close** each with Mục đích · Nghiệp vụ · Bước SRS · DTO↔DB · lỗi; companion records open-grid |
| Pointers | `docs/tech-spec/DB_DESIGN_HRM_ATT_SHEET.md` · `API_DESIGN_HRM_ATT_SHEET.md` | Thin links only |
| Index | `docs/tech-spec/README.md` §2–§3 | Pair moved COMPLETE; backlog row removed |

---

## 2. Spec read ack

| Layer | Cite |
|-------|------|
| Gap scan | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` — Attendance sheets **P1** |
| TechSpec | `docs/hrm/TECHSPEC.md` **§12.1** · **§13** · **§14.4 FR-HRM-AT-14** |
| SRS khách | `SRS_HRM_KHACH.md` §3.4 FR-HRM-AT-14 Diễn biến #1–#12 |
| Team SRS | `docs/hrm/SRS.md` UC-HRM-23 / HRM-AT-14 · AC-ATT-SHEET-01..06 · BR-ATT-SHEET-01..07 |
| Leave must_keep | `docs/hrm/DB_DESIGN_HRM_LEAVE.md` · `API_DESIGN_HRM_LEAVE.md` — **not modified** |
| Gate | `.cursor/rules/spec-db-api-design-gate.mdc` · OS §3.4.11 F/F.1 |
| Runtime truth | `attendance-catalog.service.ts` ensureAttendanceSheetSchema · create INSERT sheets only · `HRM-AS-200/201/404/409` |

---

## 3. Op alias (PM ↔ TechSpec)

| PM op | TechSpec / runtime | F.1 section |
|-------|--------------------|-------------|
| list | `GET …/attendance-sheets` | API §1 |
| get | `GET …/attendance-sheets/{id}` (design SoT; list-pick interim OK) | API §2 |
| generate | `POST …/attendance-sheets` (`createAttendanceSheet`) | API §3 |
| close | `PATCH …/{id}` `{status:closed}` | API §4 |
| (companion) | `GET …/records` weekly open | API §5 |

---

## 4. must_keep verified in docs

| Rule | Documented |
|------|------------|
| `company_id` TEXT slug (not LE UUID) | DB §1.1 · API generate/list/get/close |
| Header ≠ auto roster / no FK sheet→records | DB §1.2 · §2 · API generate §3 |
| Scope parity list↔get↔mutate | DB §3 · API §7 |
| Leave pair untouched | Evidence §2 · DB must_keep · no edits to leave files |
| AC-ATT-SHEET-01..06 | API FE after 2xx + §8 QA block |

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **GET by id** | Design SoT; runtime may list-pick — Dev ADD route + assert for U19 | `dev-be` when coding wave |
| **Close status wire** | Column `status` exists; Update DTO/SQL omit `status` today — Dev ADD before QA close UF | `dev-be` |
| OpenAPI thin | Optional sync codes/schemas | `dev-be` optional |
| Overlap #7 | Soft unique optional — product may enforce later | BA/Dev if product locks |

---

## 6. Handoff

### completion_report

**Closed:** U71 P1 Attendance sheets physical pair — `DB_DESIGN_HRM_ATT_SHEET.md` + `API_DESIGN_HRM_ATT_SHEET.md` with F.1 triad on list/get/generate/close (+ records companion); aligned TechSpec §12.1/§13/§14.4 and FR-HRM-AT-14 Diễn biến; TEXT company_id + header-only generate + G-DB-07; leave pair preserved; tech-spec pointers + README index updated.

**Residual:** GET-by-id route + PATCH `status` wiring for close (runtime gaps) — not blocking U71 design gate; Dev when execution opens.

### next_owner

`pm`

### next_dispatch_prompt

```text
Operate as pm. work_item_id SA-U71-HRM-ATT-SHEET-DESIGN-01 CLOSED (U71 P1 physical F.1).
Read docs/qa/evidence/sa-u71-hrm-att-sheet-design-01-20260727.md.
Update U71 backlog: Attendance sheets COMPLETE under physical F.1.
Do NOT dispatch Dev att-sheet feature without read_first:
  - docs/hrm/DB_DESIGN_HRM_ATT_SHEET.md
  - docs/hrm/API_DESIGN_HRM_ATT_SHEET.md
  - docs/hrm/TECHSPEC.md §12.1 · §13 · §14.4
  - docs/hrm/DB_DESIGN_HRM_LEAVE.md (must_keep sibling — do not wipe)
Next P1 design candidates from docs/tech-spec/README.md §3:
  SA-U71-HRM-CONTRACTS-INS-DESIGN-01 and/or XBOS P1 catalog-gov / WF.
If Dev wave opens for sheets: include residuals GET-by-id + PATCH status=closed; QA J-HRM-06b AC-ATT-SHEET-01..06 U65 zero-seed.
Cấm: apps/** from governance; seed for PASS.
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-hrm-att-sheet-design-01-20260727.md`

### pm_dispatch_hint

Next U71 P1 write: `SA-U71-HRM-CONTRACTS-INS-DESIGN-01` or XBOS catalog-gov/WF — att-sheet design gate closed.
