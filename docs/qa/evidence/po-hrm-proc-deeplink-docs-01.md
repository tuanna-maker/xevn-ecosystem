# Evidence — PO-HRM-PROC-DEEPLINK-DOCS-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-PROC-DEEPLINK-DOCS-01` |
| from_role | ba-docs |
| to_role | pm |
| parent | `PO-HRM-UC-MENU-COVERAGE-AUDIT-01` · PAY-CFG **P0-PROC-01/02** |
| lane | governance |
| change_mode | ADD-only · no wipe · no_prompt_echo · NO `apps/**` |
| date | 2026-08-06 |
| ack_status | **PASS_TO_PM** |

---

## Honesty locks (unchanged — not UAT)

| Flag | Value |
|------|--------|
| `processes_catalog_bound` | **false** |
| `payroll_e2e_ready` | **false** (untouched) |
| Module processes UAT | **not claimed** |
| apps/** touched | **no** |
| seed | **no** |
| Invent HRM CRUD processes | **no** |

---

## DOC-DELTA closed

| Delta | Target | Result |
|-------|--------|--------|
| CTA deep-link XBOS/CC **bắt buộc** (AC-PROC-05) | Enterprise **FR-UC-BP-PROC-01** v**0.17** (7 mục) · HDSD CH08 §4 | **MERGED** |
| Empty **chỉ** khi catalog trống (AC-PROC-06) | Enterprise Diễn biến + AC table · team §13.1 test table · matrix AC-PROC-05/06 | **MERGED** |
| Read-only ownership (no HRM CRUD) | Enterprise BR-BP-PROC-01..03 · HDSD §5 | **LOCKED** |
| AC-PROC-05/06 **testable** | Click/keyboard → CC; bind when `effectiveItems>0` | **YES** |

### Files touched (docs only)

- `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` (v0.17 · ADD FR-UC-BP-PROC-01 · §1.2/1.3 · §5 · inventory **55**)
- `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH08_HRM_QUY_TRINH.md` (**NEW**)
- `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` (link CH08)
- `docs/hrm/SRS.md` §13.1 (AC testable table + Enterprise/HDSD pointers)
- `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` (AC-PROC-05/06 test wording)
- `docs/program/specs/PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md` (§H D3 stamp Enterprise+HDSD)

---

## Spot-check (internal)

| Check | OK |
|-------|----|
| FR-UC-BP-PROC-01 đủ 7 mục (metadata · input · flow · BR · AC · special · sequence · Diễn biến) | yes |
| Customer Enterprise: no work_item / sponsor chat echo in FR body | yes |
| No invent HRM process CRUD UC | yes |
| No apps/** · no UAT claim | yes |

---

## completion_report

- **Closed:** ADD-only Enterprise **FR-UC-BP-PROC-01** (v0.17) + HDSD Chương 8 — CTA deep-link Command Center bắt buộc; empty chỉ khi danh mục sau đồng bộ = 0; AC-PROC-05/06 có bước kiểm đo được; cấm CRUD quy trình trên Nhân sự. Team §13.1 + matrix đồng bộ test wording. Không sửa `apps/**`, không seed, không claim `processes_catalog_bound` / UAT.
- **Residual (impl):** P0-PROC-01 hard `[]` bind + P0-PROC-02 FE deep-link → **sa** contract GET snapshot §55–58 + deep-link CC route, rồi Dev-FE. Coverage stamp leaf Processes vẫn **IMPL_GAP** đến khi Tech + FE + QA.

## next_owner

**pm** → dispatch **sa** `PO-HRM-PROC-CATALOG-BIND-TECH-01` (parallel_after_docs)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PROC-CATALOG-BIND-TECH-01
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-PROC-DEEPLINK-DOCS-01 · PAY-CFG P0-PROC-01/02
change_mode: ADD-only TechSpec / API_DESIGN / DB note — NO apps/**

read_first:
1. docs/qa/evidence/po-hrm-proc-deeplink-docs-01.md
2. docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PROC-01 (v0.17) · AC-PROC-05/06
3. docs/hrm/SRS.md §13.1 · docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md processes · AC-PROC-01..06
4. docs/program/specs/PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md §A3 · §C P0-PROC-01/02 · §D3
5. docs/hrm/DANH_MUC_XBOS_CHO_HRM.md §9 STT 55–58 · XBOS-DM-HRM-14
6. _vibe-team-os/13 §3.4.11 F.1 API_DESIGN (Mục đích · Nghiệp vụ · bước SRS)

Task:
- API_DESIGN: GET snapshot keys DM §55–58 (settings-catalogs / catalog-sync) cho menu processes
  - Mục đích + Nghiệp vụ xử lý + Tham chiếu bước SRS FR-UC-BP-PROC-01 Diễn biến #1–#6 / AC-PROC-05/06
  - Response display-ready list items (code, name/label, group) — cấm FE tự join invent
- Deep-link CC: document canonical route/URL Command Center WF hoặc catalog admin (AC-PROC-05)
- DB note: read synced_catalogs / effective items only — NO new HRM company_processes CRUD table
- Cấm invent HRM mutate API; honesty processes_catalog_bound=false đến QA
- Exit: completion_report + next_dispatch_prompt →
    PO-HRM-PROC-CATALOG-BIND-FE-01 (dev-fe) và/hoặc BE nếu thiếu GET
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-proc-catalog-bind-tech-01.md
```

## ack_status

**PASS_TO_PM**
