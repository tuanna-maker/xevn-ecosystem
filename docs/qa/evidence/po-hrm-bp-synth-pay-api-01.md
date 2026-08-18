# Evidence — PO-HRM-BP-SYNTH-PAY-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-SYNTH-PAY-API-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-04 |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |

---

## Mission

Merged PAY-ALIGN + PAY-API: UPGRADE `API_DESIGN_HRM_ENTERPRISE.md` §4 PAY + §7 aliases to match `DB_DESIGN_HRM_ENTERPRISE.md` **v0.3.0-DRAFT** and TechSpec PAY v0.3. One-line DOC-DELTA on TECHSPEC §11: **R-BP-DB-ALIGN CLOSED**.

## read_first (ack)

| # | Artifact | Result |
|---|----------|--------|
| 1 | `po-hrm-bp-synth-pay-db-01.md` | DB v0.3 PAY P1–P6 + `att_leave_type` — residual R-BP-API-PAY-DELTA → this seat |
| 2 | `po-hrm-bp-synth-pay-tech-01.md` | TechSpec/API F.1 already v0.3 meeting-locked; formula HOLD = Q-PAY-FORMULA |
| 3 | `po-hrm-bp-meet-db-align-01.md` | Column spot-check CLOSED; TECHSPEC §11 still listed open → closed this wave |
| 4 | DB §5 · API §4/§7 · TECHSPEC §7/§11 · SYNTHESIS §2.4 | Applied |

---

## completion_report

### Closed

1. **API_DESIGN → v0.3.1-DRAFT**  
   - §4 Request→DB synced: `pay_period_timesheet_bind`, `pay_payslip_line`, `pay_payslip_split_segment`, `pay_termination_settlement`, `pay_insurance_rate_cfg`, `pay_payroll_group`, RD `payroll_period_id`.  
   - Deprecated vague `split_segments_json` → segment table.  
   - Period no longer pretends `timesheet_header_id` column (bind table).  
   - F-PAY-FORMULA-* remains **HOLD authoring** (Q-PAY-FORMULA) — **not** «họp lương chưa xong».

2. **§7.1–7.4 PASS vs pay_* + att_leave_type**  
   - SoT pointer → DB **v0.3.0**.  
   - Table aliases: bind, rate CFG, group, lines, segments, reward_link, termination_settlement, `att_leave_type`.  
   - Field aliases: leave flags/balance carry·advance; payslip header statics; settle checklist.  
   - Boundary checklist rows 1–8 **PASS**.

3. **TECHSPEC §11 DOC-DELTA (no rewrite)**  
   - **R-BP-DB-ALIGN CLOSED** → pointer `po-hrm-bp-meet-db-align-01.md` (+ PAY delta this evidence).  
   - **R-BP-PAY-DB-DEPTH CLOSED** (DB v0.3 + API sync).  
   - Note: broad TechSpec expand still **UC-GAP HOLD** until W3.

### Grep self-check

| Phrase | Active HOLD? |
|--------|----------------|
| `họp lương chưa xong` as reason | **No** (only SUPERSEDED / cấm ghi) |
| F-PAY-FORMULA authoring | **Yes** — Q-PAY-FORMULA |
| D7 / customer-signed | Still **unsigned** |

### Explicit non-claims

- Not customer-signed / not Dev unlock / no `apps/**`.  
- Did not invent formula OpenAPI / drag-drop GĐ1.  
- Did not expand TechSpec beyond §11 residual pointer.  
- Did not invent UC-GAP customer sign.

### Residual (not this seat)

| ID | Item | Owner |
|----|------|-------|
| R-BP-FORMULA-CONFIRM | Q-PAY-FORMULA Option A partner confirm | pm + partner |
| R-BP-CUSTOMER-SIGN | D7 paper | pm |
| UC-GAP W1–W3 | Meeting↔product↔SRS gap before broad TechSpec expand | ba-process / qa / ba-docs (program) |
| R-BP-CAMPAIGN-GĐ2 · Q-LEAVE-* · Q-SI-* | Prior opens | as listed TechSpec §11 |

---

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-UC-GAP-W3-SYNTH-01
from_role: pm
to_role: ba-process (synth) after W1 ATT-DEEP + W2 surface inventory PASS
lane: governance
priority: P0

## Mission
Program `docs/program/HRM_BP_MEETING_UC_GAP_PROGRAM.md` — synthesize `UC_MEETING_PRODUCT_GAP_MATRIX.md` covering SYNTHESIS D1–D8 + R/C/A/P; verdict READY_FOR_TECHSPEC | NOT_READY + gap list. Do NOT invent customer paper sign (D7). Do NOT reopen PAY meeting («họp lương chưa xong» banned). Broad TechSpec/API/DB expand HOLD until this W3 PASS. PAY API↔DB already synced (SYNTH-PAY-API-01) — out of scope except cite as done for PAY spine.

## read_first
1. docs/program/HRM_BP_MEETING_UC_GAP_PROGRAM.md
2. docs/client-delivery/hrm-enterprise-blueprint/SYNTHESIS_MASTER_HRM_ENTERPRISE.md
3. ATT deep inventory evidence from ATT-DEEP-* (when ready)
4. docs/qa/evidence/po-hrm-bp-synth-pay-api-01.md (PAY API closed — do not re-dispatch PAY depth)

## Exit
- Gap matrix + WBS/SRS completeness verdict
- evidence · PASS_TO_PM
- cấm: apps/** · claim D7 signed · invent unfinished-PAY meeting
```

---

## evidence_path

- This file: `docs/qa/evidence/po-hrm-bp-synth-pay-api-01.md`
- API: `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` (**v0.3.1-DRAFT**)
- TechSpec §11: `docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md`
- DB SoT: `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` (**v0.3.0-DRAFT**)

## ack_status

`PASS_TO_PM`

---

## Completion seat re-verify (stalled prior → closed)

| Check | Result |
|-------|--------|
| Prior `sa` Kick PAY API align → subagentStop `error` | Confirmed on bus hook — docs already written; **bus PASS_TO_PM missing** → appended this seat |
| API_DESIGN header **0.3.1-DRAFT** + DOC-DELTA SYNTH-PAY-API-01 | **PASS** |
| §4 F-PAY-* Request→DB vs DB §5.1–5.10 (bind / lines / segments / settlement / rate CFG / group) | **PASS** spot-check |
| §7.1–7.4 boundary rows 1–8 | **PASS** |
| TECHSPEC §11 `R-BP-DB-ALIGN` / `R-BP-PAY-DB-DEPTH` | **CLOSED** |
| TECHSPEC §7.5 stale «concurrent ba-data» note | **UPGRADE one-line** → DB v0.3 synced pointer |
| Active HOLD «họp lương chưa xong» | **0** (ban upheld; Q-PAY-FORMULA authoring only) |
| `apps/**` / customer-signed / Dev unlock | **None claimed** |
