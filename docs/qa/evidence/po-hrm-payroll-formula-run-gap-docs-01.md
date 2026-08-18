# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-DOCS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DOCS-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | `payroll_e2e_ready=false` · **no** formula LIVE · **no** invent UAT · **no** `apps/**` |
| **no_prompt_echo** | Client SRS body: no pipeline/work_item echo; Decision IDs only where already in §6.1 inventory |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `po-hrm-payroll-formula-run-gap-sa-01.md` | Unlock: Q ANSWERED; residual = product fidelity; DOC-DELTA §7.4 / R-BP-FORMULA-CONFIRM |
| 2 | `po-hrm-payroll-formula-run-gap-ba-01.md` | AC pack + stale API HOLD wording class |
| 3 | `DECISION_PACKET_Q_PAY_FORMULA.md` | **ANSWERED** · R-PAY-DD-01 Form GĐ1 + DnD GĐ2 · Q-PAY-F-3 |
| 4 | `TECHSPEC_HRM_ENTERPRISE.md` §7 | Stale «chờ confirm / Q open» → ANSWERED + product HOLD |
| 5 | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-PAY-02 | Residual «đề xuất Q-PAY-FORMULA» on Diễn biến → đã chốt |

---

## 2. DOC-DELTA (ADD-only — no wipe P1–P6)

### 2.1 TechSpec (`TECHSPEC_HRM_ENTERPRISE.md`)

| Location | Before (stale) | After |
|----------|----------------|-------|
| Header Status | Q-PAY-FORMULA **vẫn mở** | **ANSWERED** · F-PAY-FORMULA-* HOLD = product fidelity (DATA+API) |
| §1.1 PAY / §1.2 DnD / §1.3 | Authoring **còn mở** · chờ confirm Option A | ANSWERED · Form GĐ1 · DnD GĐ2 · cấm LIVE claim |
| §7 title + intro | «Q-PAY-FORMULA open» | ANSWERED + DOC-DELTA stamp |
| §7.1 P4 / §7.2 note | Author UX chờ Q · HOLD Q-PAY-FORMULA | Option A ANSWERED · HOLD product fidelity |
| **§7.4** | SA Recommended · chờ khách confirm | **ANSWERED/LOCKED** · R-BP-FORMULA-CONFIRM **PAPER_CLOSED** · F.1 HOLD = DATA+API |
| §7.5 / §7.6 | expression = Q open · open Q-PAY-FORMULA | Inner schema = ba-data · Q struck as ANSWERED |
| §10 PAY-02 / §11 | R-BP-FORMULA-CONFIRM open | PAPER_CLOSED + **R-BP-FORMULA-PRODUCT** residual |
| §12 #4 | «thêm Q-PAY-FORMULA confirm» | ANSWERED — unlock after DATA+API only |

### 2.2 SRS (`SRS_HRM_ENTERPRISE.md` → **v0.22**)

| Location | Change |
|----------|--------|
| Header phiên bản | **0.22** — công thức giấy đã chốt; không claim UAT lương |
| FR-UC-BP-PAY-02 Tiên quyết | Bỏ «cờ Q-PAY-FORMULA đã hướng xử lý» → hai bước đã chốt + Form GĐ1 |
| FR-UC-BP-PAY-02 Diễn biến #2 / Thành công | Bỏ «đề xuất Q-PAY-FORMULA» / «cờ … biên bản» → tiếng Việt nghiệp vụ |
| §6.1 Q-PAY-FORMULA / R-PAY-DD-01 | **Đã chốt** (kept — already correct) |
| Changelog | ADD **0.22** row |

**Kept:** Decision row ANSWERED; technical-depth HOLD language (product, not workshop); no `payroll_e2e_ready` / LIVE claim.

### 2.3 API Design (`API_DESIGN_HRM_ENTERPRISE.md`) — team pointer (same residual class)

| Location | Change |
|----------|--------|
| Status / §4 HOLD blurb | HOLD reason = product fidelity; Q **ANSWERED** |
| F-PAY-FORMULA-* block | SUPERSEDE «chờ khách confirm»; KEEP HOLD until DATA+API |
| §7.3 / §8 / SYNTH KEEP / DOC-DELTA append | Align · next = sa API-01 after DATA |

---

## 3. Explicit non-claims

- No `apps/**`
- No invent module / formula UAT
- No claim formula LIVE / `payroll_e2e_ready=true`
- No wipe P1–P6 meeting-locked depth
- No re-open Q-PAY-FORMULA workshop
- F-PAY-FORMULA-* **still HOLD** until DATA + API F.1

---

## 4. Residual closed / open

| ID | Status | Note |
|----|--------|------|
| R-PAY-DOCS-STALE / R-BP-FORMULA-CONFIRM (paper) | **CLOSED** this seat | Wording ANSWERED |
| R-PAY-DATA-EXPR | OPEN | ba-data `…-DATA-01` |
| R-PAY-API-F1 | OPEN | sa `…-API-01` **after DATA** |
| Dev / UAT flag | HOLD / false | pm |

---

## completion_report

**Closed**

1. TechSpec §7.4 / §7.6 / §11 — Q-PAY-FORMULA / R-PAY-DD-01 = **ANSWERED**; F-PAY-FORMULA-* HOLD = **product fidelity**.
2. SRS FR-UC-BP-PAY-02 status/Diễn biến — no stale «chờ / đề xuất» workshop language; v0.22.
3. API_DESIGN HOLD reason aligned (team pointer).
4. Honesty locks preserved.

**Residual**

- Next after DATA: **sa** `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01`.

---

## Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-hrm-payroll-formula-run-gap-docs-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01
from_role: pm
to_role: sa
lane: governance
priority: P0
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01

## Gate
Entry: DATA-01 CONFIRMED (expression_json inner + catalogs).
Cite: docs/qa/evidence/po-hrm-payroll-formula-run-gap-docs-01.md · sa-01 §3.4
Q-PAY-FORMULA ANSWERED — do NOT re-workshop.

## Mission
F.1 AUTHOR/PUBLISH/EVAL/LIST + COMP catalog + deepen F-PAY-PROCESS-01 bind.
Lift F-PAY-FORMULA-* HOLD only when F.1 Mục đích·Nghiệp vụ·bước SRS·DTO↔cột·lỗi đủ.
exit: PASS_TO_PM · cấm apps/** · payroll_e2e_ready=false
```

---

## Files touched

- `docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md`
- `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md`
- `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md`
- `docs/qa/evidence/po-hrm-payroll-formula-run-gap-docs-01.md` (this file)
