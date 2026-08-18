# SA-U71-XBOS-ORG-LEGAL-DESIGN-01 — Physical DB_DESIGN + API_DESIGN (F.1)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-ORG-LEGAL-DESIGN-01` |
| **lane** | governance · U71 P0 |
| **date** | 2026-07-27 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** |
| **forbidden** | `apps/**` (honored — docs only) |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN | `docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md` | **ADD** |
| API_DESIGN | `docs/xbos/API_DESIGN_XBOS_ORG_LEGAL.md` | **ADD** |
| Industry pair (must_keep) | `docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md` · `API_DESIGN_HRM_COMPANY_LIST.md` | **Untouched** |
| Dual-plane cite | `docs/hrm/DB_DESIGN_HRM_CO_HC.md` §4 | Referenced |

---

## 2. F.1 checklist (API_DESIGN)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | DTO↔DB | Errors |
|----------|----------|-----------|----------|--------|--------|
| GET group-member-units | ✅ | ✅ | FR-ORG-01 #1–8 · UC-HRM-CO-01 | ✅ + `business_lines` must_keep | ✅ |
| GET legal-entities | ✅ | ✅ | FR-ORG-03 #2 · ORG-01 detail | ✅ | ✅ |
| POST legal-entities | ✅ | ✅ | FR-ORG-03 #3–4 | ✅ `businessLines`→`business_lines` | ✅ |
| PUT legal-entities/{id} | ✅ | ✅ | FR-ORG-03 #1–4,8–9 · UF-03 | ✅ | ✅ |
| GET …/documents | ✅ | ✅ | FR-ORG-03 #2/#7/#8 | ✅ | ✅ |
| POST …/documents | ✅ | ✅ | FR-ORG-03 #5 | ✅ | ✅ |
| PUT …/documents/{id} | ✅ | ✅ | FR-ORG-03 #5/#8 | ✅ | ✅ |
| DELETE …/documents/{id} | ✅ | ✅ | FR-ORG-03 soft-remove | ✅ | ✅ |
| POST …/upload | ✅ | ✅ | FR-ORG-03 #6 | ✅ storage | ✅ 413/415 |
| GET legal-documents/{id}/file | ✅ | ✅ | FR-ORG-03 #7 | ✅ stream | ✅ |

---

## 3. DB spine coverage

| Area | Covered |
|------|---------|
| `xbos_legal_entity` identity Plane A UUID | ✅ |
| `business_lines` vs `entity_type` anti-confusion | ✅ |
| group-member-units join keys | ✅ |
| `xbos_legal_entity_document` + storage path keys | ✅ |
| Dual-plane vs HRM CO-HC | ✅ |
| Shareholders | **Out of scope** → `SA-U71-XBOS-SHAREHOLDER-DESIGN-01` |

---

## 4. Spec read ack (governance)

```markdown
## spec_read_ack
- srs: docs/client-delivery/xbos/SRS_XBOS_KHACH.md §3.4 FR-XBOS-ORG-01 Diễn biến #1–8 · §3.5 FR-XBOS-ORG-03 Diễn biến #1–9
- tech_spec: docs/xbos/TECHSPEC.md §14.4–14.5 · COMMAND_CENTER_P0_TECHSPEC.md §2–4
- db_design: docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md · tables xbos_legal_entity, xbos_legal_entity_document
- api_design: docs/xbos/API_DESIGN_XBOS_ORG_LEGAL.md · listGroupMemberUnits / legal GET-PUT / documents*
- must_keep: industry HRM pair + business_lines expose
- sponsor_confirm: U71 physical gate 2026-07-27
```

---

## 5. Residuals

| Item | Owner | Notes |
|------|-------|-------|
| `SA-U71-XBOS-SHAREHOLDER-DESIGN-01` | SA | Separate F.1 pair for SHR |
| Optional OpenAPI deepen for PUT body schema | Dev-BE when execution opens | Runtime DTO already exists |
| Industry API_DESIGN stale “SELECT omits business_lines” wording | P2 doc-sync | Runtime already ADDs `business_lines` (spec evidence) — do not wipe industry file |
| Path convention `docs/tech-spec/` | `SA-U71-PATH-CONVENTION-01` | Slice lives under `docs/xbos/` per scan recommendation |

---

## 6. Handoff

### completion_report

**Closed:** Physical U71 pair for XBOS org legal spine — `DB_DESIGN_XBOS_ORG_LEGAL.md` (LE Plane A, group join keys, documents, dual-plane) + `API_DESIGN_XBOS_ORG_LEGAL.md` with F.1 triad on listGroupMemberUnits, legal GET/POST/PUT, and full documents CRUD+upload+file. Industry HRM pair preserved; `business_lines` expose locked as must_keep.

**Residual:** Shareholders design wave; optional OpenAPI body deepen on Dev open; path convention bootstrap still open program-wide.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-XBOS-SHAREHOLDER-DESIGN-01
role: sa
lane: governance · U71 P0
read_first:
  - docs/xbos/TECHSPEC.md §14.6 FR-CC-P0-01
  - docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md §2 shareholders · §4 API
  - docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md (parent LE Plane A — extend, don't wipe)
  - docs/client-delivery/xbos/SRS_XBOS_KHACH.md §3.6 FR-CC-P0-01
  - .cursor/rules/spec-db-api-design-gate.mdc
deliver:
  - docs/xbos/DB_DESIGN_XBOS_SHAREHOLDERS.md (xbos_legal_entity_shareholder; FK legal_entity_id; ref_srs)
  - docs/xbos/API_DESIGN_XBOS_SHAREHOLDERS.md
    GET/POST/PUT/DELETE …/legal-entities/{id}/shareholders*
    mỗi endpoint F.1: Mục đích · Nghiệp vụ · bước SRS · DTO↔DB · errors XBOS-SHR-*
must_keep: UF-XBOS-04/05 🟢 · parent org-legal design · ratio 0–100 · money vi-VN FE
forbidden: apps/**
exit: F.1 complete; PASS_TO_PM
evidence_path: docs/qa/evidence/sa-u71-xbos-shareholder-design-01-YYYYMMDD.md

Optional parallel: when Dev opens legal bind gaps only —
  read_first must include docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md + API_DESIGN_XBOS_ORG_LEGAL.md
  + industry HRM pair; U65 browser UF-XBOS-02/03/06.
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-xbos-org-legal-design-01-20260727.md`

### pm_dispatch_hint

`SA-U71-XBOS-SHAREHOLDER-DESIGN-01` — next U71 org spine write; Dev feature on legal/docs only after `spec_read_ack` cites this pair.
