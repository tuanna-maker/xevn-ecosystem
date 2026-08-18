# Evidence — PO-HRM-PAY-CNTT-SRS-DELTA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-SRS-DELTA-01` |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-08-11 |
| **sponsor_confirm** | 2026-08-11 — ADD-only UC-BP-PAY-STP-01..12 |
| **change_mode** | ADD-only |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim UAT/module LIVE · **cấm** `apps/**` · U65 zero-seed |
| **no_prompt_echo** | PASS — không meta pipeline / work_item trong thân FR khách |

---

## 0. Read ack (ordered)

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-PAY-CNTT-BA-PROCESS-01.md` | 12 UC · BR · AC mẫu · F-STP |
| 2 | `docs/program/PO-HRM-PAY-CNTT-GAP-SYNTH-01.md` | Sponsor confirm · G-CNTT-08 |
| 3 | `docs/qa/evidence/po-hrm-pay-cntt-ba-process-01.md` | PASS_TO_PM · matrix rollup |
| 4 | `docs/hrm/SRS.md` §16 PAY pointers | must_keep PAY-01..09 |
| 5 | `docs/program/PM_PO_DELIVERY_PIPELINE_UIUX.md` | SRS → TechSpec gate |

---

## 1. Deliverable summary

| # | Output | Path | Status |
|---|--------|------|--------|
| 1 | Delta SRS body — 12 FR uniform 7 mục | `docs/program/deltas/PO-HRM-PAY-CNTT-STP-SRS-DELTA-01.md` | **DONE** |
| 2 | Team mirror (UC map · handoff · must_keep) | `docs/program/deltas/PO-HRM-PAY-CNTT-STP-SRS-DELTA-01_team.md` | **DONE** |
| 3 | Merge pointer `docs/hrm/SRS.md` §16.9 | `docs/hrm/SRS.md` | **DONE** |
| 4 | Enterprise blueprint v0.42 + §3.B TOC | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | **DONE** |
| 5 | HTML rebuild | `pnpm docs:srs:html` | **DEFER** — STP FR chưa trong catalog 373 UC build; delta path until ba-docs promote |

**FR coverage:** 12/12 `FR-UC-BP-PAY-STP-01..12` — mỗi FR có: Thông tin chung · Dữ liệu đầu vào · Luồng chính · Quy tắc · Trường hợp đặc biệt · Sơ đồ `sequenceDiagram` · Diễn biến 4 cột.

**AC FE (U65):** AC-PAY-STP-01..05 · AC-PAY-STP-GLOBAL-01..03 — pattern Lưu 2xx → FE cập nhật → F5 còn.

**BR:** BR-PAY-STP-01..08 trong delta §0.

---

## 2. Quality gate (ba-docs self-check)

| Gate | Result |
|------|--------|
| ADD-only vs FR-UC-BP-PAY-01..09 | PASS — không REPLACE runtime PAY |
| STP-09 vs FR-UC-BP-PAY-09 | PASS — UI Thiết lập bổ sung; runtime FR giữ |
| 7 mục / FR | PASS — 12/12 |
| Diễn biến + sequence | PASS — 12/12 |
| no_prompt_echo | PASS — Ctrl+F «sponsor» / «work_item» / «Cấm hiểu» = 0 trong FR body |
| payroll_e2e_ready | **false** — ghi rõ delta + SRS §16.9 |
| apps/** | **0** edits |

---

## 3. Residual (open)

| ID | Mô tả | Owner |
|----|--------|-------|
| R-SRS-HTML | Promote 12 FR vào catalog/overrides + `pnpm docs:srs:audit` 373+N | ba-docs / pm wave |
| R-TECHSPEC | TechSpec + DB_DESIGN + API_DESIGN physical post SA-01 | sa → pm |
| R-UI-SPEC | UI_SCREEN_SPEC Thiết lập cluster | dev-fe post spec |
| R-PACK-MOUNT | Fragment STP-08 INV until pack mount | PM / POLICY-DECOMPOSE |

---

## completion_report

### Closed

1. Delta SRS **Thiết lập lương** — 12 UC ADD với FR uniform 7 mục, Diễn biến, AC FE sau 2xx + F5.
2. Pointer `docs/hrm/SRS.md` §16.9 + enterprise v0.42 §3.B TOC.
3. Team mirror với must_keep PAY-01..09.
4. Không `apps/**` · không prompt-echo · honesty `payroll_e2e_ready=false`.

### Residual

- HTML catalog merge (373 FR build) — không block PM TechSpec wave.
- Physical DB/API + UI_SCREEN_SPEC trước Dev lớn.

---

## next_owner

**pm** — confirm DB_DESIGN/API_DESIGN dispatch post `PO-HRM-PAY-CNTT-SA-01` · UI_SCREEN_SPEC wave

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAY-CNTT-DB-API-CONFIRM-01
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01
priority: P0

## Goal
Physical DB_DESIGN + API_DESIGN APPEND F-PAY-POLICY-PACK-* · F-PAY-INPUT-PROFILE-* · F-PAY-SETUP-RESOLVE-01 — map FR-UC-BP-PAY-STP-01..12 Diễn biến.

## read_first
1. docs/program/deltas/PO-HRM-PAY-CNTT-STP-SRS-DELTA-01.md
2. docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md
3. docs/qa/evidence/po-hrm-pay-cntt-ba-data-01.md
4. docs/hrm/DB_DESIGN_HRM.md (APPEND slice)

## exit
DB_DESIGN + API_DESIGN paths in handoff · sponsor_confirm gate · no apps/** until Dev dispatch
```

---

## pm_dispatch_hint

`PO-HRM-PAY-CNTT-UI-SCREEN-01` — ba-process/UI_SCREEN_SPEC Thiết lập menu cluster sau DB/API confirm.

---

## evidence_path

- Delta: `docs/program/deltas/PO-HRM-PAY-CNTT-STP-SRS-DELTA-01.md`
- Team: `docs/program/deltas/PO-HRM-PAY-CNTT-STP-SRS-DELTA-01_team.md`
- Merge: `docs/hrm/SRS.md` §16.9
- Enterprise: `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` v0.42
- Evidence: `docs/qa/evidence/po-hrm-pay-cntt-srs-delta-01.md`
