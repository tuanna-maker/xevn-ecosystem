# Evidence — PO-HRM-BP-ADR-Q-PAY-FORMULA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ADR-Q-PAY-FORMULA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |

---

## completion_report

### Closed

1. **Q-PAY-FORMULA** APPEND vào [`ADR-HRM-4-PILLAR-API-BOUNDARY.md`](../../client-delivery/hrm-enterprise-blueprint/ADR-HRM-4-PILLAR-API-BOUNDARY.md) **§10**:
   - Conflict Excel `REQ_L_002` (IT/DB) vs PPT slide 11 (HR engine / no hardcode).
   - Option A/B/C + trade-off ngắn.
   - **Recommended: Option A** — dual-control (**C&B author** + **technical publish**); runtime **metadata formula engine**; **cấm hardcode** công thức/hệ số tenant trong code path tính kỳ lương.
   - Reconcile: Excel = IT owns publish/DB; PPT = engine + HR author; UI kéo-thả = **GĐ2** cùng metadata.
   - Failure modes + mitigation + validation HOLD (no code).

2. **Q-ASSET-MODULE** outline ADR **§11** (HR-006): GĐ1 assignment **stub** vs full Asset SoT later; thu hồi khi nghỉ vẫn bắt buộc.

3. [`TECHSPEC_OUTLINE_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_OUTLINE_HRM_ENTERPRISE.md): HOLD pointers §5/§7 + residuals R-BP-FORMULA-CONFIRM / R-BP-ASSET-SOT + DOC-DELTA.

4. [`UC_BR_MATRIX_DEPTH.md`](../../client-delivery/hrm-enterprise-blueprint/UC_BR_MATRIX_DEPTH.md) §8: Q-PAY-FORMULA / Q-ASSET-MODULE → **SA-REC** (không claim customer confirm).

### Residual (open — not this wave)

| ID | Item | Owner |
|----|------|-------|
| R-BP-FORMULA-CONFIRM | Khách/đối tác sign-off Q-PAY-FORMULA Option A | PM → partner workshop |
| R-BP-SRS-PAY-FR | SRS FR author/publish/evaluate/version bind | ba-docs (sau confirm) |
| R-BP-PAY-VARS | ba-data ownership biến ATT closed + CORE compensation | ba-data |
| R-BP-ASSET-SOT | Full Asset SoT phase | PM scope later |
| API F.1 / apps/** | **HOLD** — cấm đến unlock | — |

### Explicit non-claims

- Không customer confirm.
- Không API_DESIGN F.1 đầy đủ.
- Không `apps/**`.
- Không unlock Dev PAY formula.

---

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-PARTNER-Q-PAY-FORMULA-CONFIRM-01
from_role: pm
to_role: ba-docs (prep) + PM workshop đối tác
lane: governance
priority: P0

## Mission
Đưa SA Recommended Q-PAY-FORMULA Option A (ADR-HRM-4-PILLAR-API-BOUNDARY §10) vào agenda chốt với đối tác/khách.
Không code. Không claim confirm trước khi có biên bản/chữ ký scope.

## read_first
1. docs/client-delivery/hrm-enterprise-blueprint/ADR-HRM-4-PILLAR-API-BOUNDARY.md §10–§11
2. docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_OUTLINE_HRM_ENTERPRISE.md §7 HOLD
3. docs/qa/evidence/po-hrm-bp-adr-q-pay-formula-01.md
4. docs/program/customer-blueprint/PARTNER_REQ_CATALOG_20260804.md §5 Q-PAY-FORMULA

## Exit
- Packet 1 trang: conflict · Option A dual-control · GĐ1 vs GĐ2 UI · câu hỏi confirm Yes/No
- Optional: Q-ASSET-MODULE stub vs full (ADR §11) cùng agenda
- ack_status PASS_TO_PM khi packet sẵn sàng workshop
- cấm: apps/** · API_DESIGN F.1 · giả confirm

Sau confirm → dispatch ba-docs SRS FR PAY (UC-BP-PAY-02) cite ADR §10; ba-data ownership biến công thức.
```

---

## evidence_path

`docs/qa/evidence/po-hrm-bp-adr-q-pay-formula-01.md`

## Files touched

- `docs/client-delivery/hrm-enterprise-blueprint/ADR-HRM-4-PILLAR-API-BOUNDARY.md` (§10–§11)
- `docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_OUTLINE_HRM_ENTERPRISE.md`
- `docs/client-delivery/hrm-enterprise-blueprint/UC_BR_MATRIX_DEPTH.md` (§8 status SA-REC)
- `docs/qa/evidence/po-hrm-bp-adr-q-pay-formula-01.md` (this file)
