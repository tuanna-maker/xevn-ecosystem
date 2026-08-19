# Cursor reclaim — Claude UC wave (sponsor 2026-08-10)

| Meta | Value |
|------|--------|
| **work_item_id** | `CURSOR-RECLAIM-CLAUDE-UC-WAVE-01` |
| **from** | Sponsor — Claude lane không đáng tin (verify-only + md; API 524) |
| **to** | Cursor execution (dev-be · dev-fe · qa) |
| **Claude lane** | **PARKED** — không dispatch thêm tới `CLAUDE-CODE` |
| **U65** | Browser QA only · zero seed |

---

## 1. Claude đã giao — trạng thái thật

| work_item_id | UC / fidelity | Code trong phiên? | Evidence | Cursor owner kế |
|--------------|---------------|-------------------|----------|-----------------|
| `D-HRM-CO-01-SUMMARY-BE-01` | `UC-HRM-CO-01` headcount BE | Có (jest spec + verify) | `d-hrm-co-01-summary-be-01.md` | **qa** headcount browser |
| `PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01` | `UC-BP-PAY-09` | Có (wave trước) | `po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01.md` | **qa** retest J-09 nếu residual |
| `PO-HRM-SETTINGS-CATALOG-CONSUMER-FE-01` | `HRM-SC-02` UF-HRM-10 | Có (~19:50 Contracts) | `po-hrm-settings-catalog-consumer-audit-fe-01.md` | **qa** U65 consumer |
| `FE-PAY09-CATALOG-LIST-STALE` | PAY-09 residual | Có (`usePayrollGroups.ts` ??) | `po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md` | **dev-fe** stabilize track + **qa** |
| `HRM-CTR-U65-TPL-UV-FE-PATH-01` | CTR U65 | **Verify-only** | `hrm-ctr-u65-tpl-uv-fe-path-01.md` | **qa** U65 path (không tin DONE Claude) |
| `PO-HRM-SETTINGS-JD-MASTER-LIST-FE-01` | FR-UC-BP-REC-00 | **Verify-only** | `po-hrm-jd-ia-list-detail-fe-01.md` | **qa** JD tab |
| `PO-HRM-SETTINGS-CTR-TPL-COMPOSER-FE-01` | FR-09d | **Verify-only** | shared CTR evidence | **qa** composer dialog |
| `PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01` | `HRM-SC-01` | **QA PASS** `ATTLVTSOTQA-MSNG88NH` | `qa-hrm-settings-att-lvt-sot-01.md` | **dev-fe** `PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01` |
| `D-HRM-CO-01-FE-HEADCOUNT-BIND-01` | `UC-HRM-CO-01` FE | **DONE** + QA PASS | `d-hrm-co-01-fe-headcount-bind-01.md` | — |
| `HRM-CTR-CREATE-REDESIGN-FE-BE-02` | `HRM-CI-01` | Chưa | — | defer sau P0 |
| `PO-HRM-MVP-GD1-REC-01-BE-01` | `UC-HRM-22` | Chưa | — | defer sau DATA |
| `QA-HRM-CO-01-HEADCOUNT-01` | `UC-HRM-CO-01` | **PASS** `COHCQA1-MSNFXBJS` | `qa-hrm-co-01-headcount-01.md` | PM matrix promote khi industry xong |

---

## 2. UC matrix — chưa đóng (SoT gate 2026-08-10)

| UC id | impl_status | Việc Cursor |
|-------|-------------|-------------|
| `UC-HRM-CO-01` | **planned** | FE headcount bind + QA browser → promote matrix |
| `UC-HRM-27` | waived | Không burn |
| P0 fidelity §3–§6 backlog | e2e_pass · fidelity_P0 | ATT LVT BE · W3 mutate · CTR/PAY QA slices |

SoT: `docs/program/PHASE1_UC_CLOSURE_BACKLOG.md` · `pnpm phase1:gate`

---

## 3. Dispatch Cursor (wave 1 — song song)

| Priority | work_item_id | Role | exit |
|----------|--------------|------|------|
| P0 | `PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01` | dev-be | jest VAL-ATT-LVT exit 0 · evidence `po-hrm-settings-att-lvt-sot-be-01.md` |
| P0 | `D-HRM-CO-01-FE-HEADCOUNT-BIND-01` | dev-fe | bind `GET /employees/summary` · vitest · `UI-CO-COMPANY-HEADCOUNT.md` |
| P0 | `QA-HRM-CO-01-HEADCOUNT-01` | qa | U65 ceo@xe.vn · AC-CO-EMP · F5 |
| P0 | `QA-HRM-SETTINGS-CONSUMER-PAY-STALE-01` | qa | Retest consumer + PAY stale evidence READY_FOR_QA |
| P1 | `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` | dev-fe | Sau wave 1 · ATT/EMP/SI mutate tabs |

**Cấm:** seed · flip honesty flags · Phase 1 DONE claim

---

## 4. Claude terminal

Sponsor có thể **Ctrl+C** terminal 27 — lane **PARKED**. Mọi WI mở thuộc bảng §3.
