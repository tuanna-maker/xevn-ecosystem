# Evidence — PO-HRM-BP-MEET-TECH-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-MEET-TECH-API-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |

---

## completion_report

### Closed

1. **TechSpec draft** [`TECHSPEC_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md) v0.2.0-DRAFT:
   - `ref_srs` → `SRS_HRM_ENTERPRISE.md`
   - Depth REC (R1–R8) · CORE (C1–C9) · ATT (A1–A6) from `MEETING_20260804_CUSTOMER_WANTS.md`
   - **Campaign hub / tin đa kênh = GĐ2**; GĐ1 pipeline flags on YCTD
   - **PAY** = outline + Q-PAY-FORMULA HOLD (họp lương chưa xong)
   - Explicit non-claims: not customer-signed · not production-ready · no Dev unlock

2. **API_DESIGN** [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) v0.2.0-DRAFT:
   - F.1 on each function: Mục đích · Nghiệp vụ · Tham chiếu bước SRS · Request/Response→DB · business errors
   - REC: JD, headcount, YCTD in/out, applications N–N, eval, mail, hire→CORE, dashboard; Campaign **GĐ2 HOLD**
   - CORE: public/C&B, history, contract/checklist, insurance timeline, KT/KL, asset stub, termination, activate
   - ATT: shifts, assignment, holiday, late rules, punch, leave hold/approve, sheet aggregate/close/reopen/GET
   - PAY: **only** F-PAY-ATT-CLOSED-01 boundary; **F-PAY-FORMULA-* HOLD**
   - Honor GW-HRM-01..04 + deny-list REC↛PAY · PAY↛Leave/OT

3. **Outline status** [`TECHSPEC_OUTLINE_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_OUTLINE_HRM_ENTERPRISE.md):
   - HOLD skeleton → **DRAFT unlocked (meeting-locked scope)**; still **not customer-signed**
   - DOC-DELTA `PO-HRM-BP-MEET-TECH-API-01`

4. **DB align:** `DB_DESIGN_HRM_ENTERPRISE.md` (`PO-HRM-BP-MEET-DB-01`) xuất hiện cùng phiên — đã thêm **alias map** API↔`rec_*`/`hrm_*`/`att_*`/`pay_*` tại API_DESIGN §7; Campaign GĐ2 + PAY stub khớp. Residual = column-level spot-check trước Dev unlock.

### Residual (open)

| ID | Item | Owner |
|----|------|-------|
| R-BP-DB-ALIGN | Column-level spot-check F.* fields ↔ DB_DESIGN columns (alias map đã có) | sa + ba-data |
| R-BP-PAY-MEETING | Họp lương + depth PAY TechSpec/API | PM |
| R-BP-FORMULA-CONFIRM | Q-PAY-FORMULA Option A customer confirm | PM + partner |
| R-BP-CAMPAIGN-GĐ2 | Campaign hub khi có API kênh | PM / ba-docs |
| R-BP-Q-* | Q-LEAVE-ACCRUAL/UNIT · Q-SI-SUSPEND · Q-REC-HEADCOUNT | ba-process |
| R-BP-CUSTOMER-SIGN | Sponsor pack + khách chốt | PM |
| Dev coding | **Forbidden** until unlock criteria TechSpec §12 | — |

### Explicit non-claims

- Không production-ready.
- Không mở Dev / `apps/**`.
- Không overwrite `docs/hrm/TECHSPEC.md`.
- Không invent full PAY formula API.
- Không claim khách đã confirm TechSpec/API/DB.

---

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-MEET-DB-ALIGN-01
from_role: pm
to_role: ba-data + sa
lane: governance
priority: P0

## Mission
Column-level spot-check: mỗi F-* Request/Response trong API_DESIGN_HRM_ENTERPRISE.md §1–§3 ↔ cột trong DB_DESIGN_HRM_ENTERPRISE.md (alias map API §7 đã có). Chốt tên exact att_attendance_rule / rec_mail_outbox nếu DB còn lệch. PAY formula tables HOLD.

## read_first
1. docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md §7
2. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md
3. docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md §10–§11
4. docs/qa/evidence/po-hrm-bp-meet-tech-api-01.md

## Exit
- Matrix F-id → table.column PASS; D-I-2/3/3b FK checks
- evidence + PASS_TO_PM
- cấm: apps/** · invent PAY formula DDL · claim customer-signed / Dev unlock

Parallel (PM): schedule PAY meeting; Q-PAY-FORMULA confirm workshop.
Optional: ba-docs — FR-UC-BP-REC-03 Campaign = GĐ2 in SRS khách nếu chưa.
```
---

## evidence_path

`docs/qa/evidence/po-hrm-bp-meet-tech-api-01.md`

## ack_status

**PASS_TO_PM**
