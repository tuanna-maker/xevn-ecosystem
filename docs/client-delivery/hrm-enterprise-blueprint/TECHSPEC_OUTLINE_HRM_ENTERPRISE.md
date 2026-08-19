# TechSpec Outline — HRM Enterprise Blueprint (4 Pillars)

| Field | Value |
|-------|--------|
| **Doc ID** | TECHSPEC-OUTLINE-HRM-ENT |
| **work_item_id** | `PO-HRM-BP-ARCH-API-BOUNDARY-01` · APPEND `PO-HRM-BP-ADR-Q-PAY-FORMULA-01` · APPEND `PO-HRM-BP-MEET-TECH-API-01` · APPEND `PO-HRM-BP-SYNTH-PAY-TECH-01` |
| **Status** | **DRAFT unlocked (meeting-locked — 4 pillars)** — SoT depth → [`TECHSPEC_HRM_ENTERPRISE.md`](./TECHSPEC_HRM_ENTERPRISE.md) **v0.3.0-DRAFT**; API → [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) **v0.3.0-DRAFT**. **Vẫn chưa customer-signed (D7).** PAY **P1–P6** depth mở; **Q-PAY-FORMULA authoring** vẫn HOLD. **Không** mở Dev coding. |
| **Date** | 2026-08-04 |
| **ref_adr** | [`ADR-HRM-4-PILLAR-API-BOUNDARY.md`](./ADR-HRM-4-PILLAR-API-BOUNDARY.md) (§6 I-5 · **§10 Q-PAY-FORMULA** · **§11 Q-ASSET-MODULE**) |
| **ref_boundary** | [`API_BOUNDARY_MAP.md`](./API_BOUNDARY_MAP.md) |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) |
| **ref_synthesis** | [`SYNTHESIS_MASTER_HRM_ENTERPRISE.md`](./SYNTHESIS_MASTER_HRM_ENTERPRISE.md) §2.4 P1–P6 · D8 |
| **ref_meeting** | [`MEETING_20260804_CUSTOMER_WANTS.md`](./MEETING_20260804_CUSTOMER_WANTS.md) |
| **Preserve** | Không đè `docs/hrm/TECHSPEC.md` / Phase 1 TechSpec khách cho đến wave merge có chủ đích |

---

## 0. Mandate (slide 14)

```text
Approve 100% logic on paper → then DB_DESIGN + API_DESIGN → then code.
Stop "code and fix".
```

**Unlock Dev:** SRS **customer confirm** (sponsor D7) + ba-data `DB_DESIGN` cột spine + TechSpec/API signed for wave — **chưa** đạt chỉ vì draft này.

---

## 1. Document structure — depth status (2026-08-04)

| § | Section | Depth now | Owner |
|---|---------|-----------|-------|
| 1 | Mục tiêu & phạm vi GĐ (IN/OUT) | **DRAFT** in TechSpec §1 | SA + ba-docs |
| 2 | Kiến trúc logic 4 trụ + Gateway | **ADR locked** + TechSpec §2 | SA |
| 3 | Mat trận biên giới API / event | **Map locked** + TechSpec §3 | SA |
| 4 | REC — thành phần & tích hợp CORE | **DRAFT** meeting R1–R8; Campaign = **GĐ2** | SA |
| 5 | CORE — hồ sơ, HĐ, bảo mật, lifecycle | **DRAFT** meeting C1–C9 | SA |
| 6 | ATT — ca, lễ, phép, OT, **đóng bảng công** | **DRAFT** meeting A1–A6 | SA |
| 7 | PAY — period, closed sheet, C&B, KT/KL, payslip, split/settle | **DRAFT P1–P6** · formula **authoring** = Q-PAY-FORMULA HOLD | SA |
| 8 | Cross-cutting: scope, soft-delete, catalog XBOS | Pointer Phase 1 ADR | SA |
| 9 | NFR | Draft bullets TechSpec §9 | SA |
| 10 | Ma trận FR↔module↔API↔DB | Logical grid TechSpec §10 · API F.1 published | SA + ba-data |
| 11 | Residual / GĐ2 | Campaign hub · formula UI GĐ2 · Asset SoT · D7 sign | PM |

---

## 2. Section sketches (historical — superseded by draft TechSpec)

> Giữ sketch dưới đây làm pointer ngắn. **SoT depth** = `TECHSPEC_HRM_ENTERPRISE.md` + `API_DESIGN_HRM_ENTERPRISE.md`.

### §2 Kiến trúc logic

- Deploy: Option A modular monolith (`hrm-api`) + portal BFF.
- Bounded contexts: REC / CORE / ATT / PAY.
- Edge: deny-list GW-HRM-01..04 (see boundary map).

### §3 Biên giới

- Embed `API_BOUNDARY_MAP` by reference (single SoT).

### §4 REC

- MVP: JD · định biên · YCTD · UV+application N–N · dashboard · mail/eval in pipeline.
- **Campaign hub / tin đa kênh = GĐ2** (meeting R1).
- Integration: **only** CORE for hire; **OUT** PAY/ATT assign.

### §5 CORE

- Public vs C&B rings; contract + checklist; insurance timeline; KT/KL; asset **stub**; employment history; termination voluntary/dismissal.
- **HOLD — Q-ASSET-MODULE:** GĐ1 stub (ADR §11).

### §6 ATT

- Shift definition ≠ assignment; holiday; late penalty modes; accrual+hold; closed timesheet SoT → PAY.

### §7 PAY — meeting-locked DRAFT (authoring still Q-*)

- **IN (P1–P6):** closed timesheet only · C&B read · KT/KL enforced · period · payslip · split-month + termination settle pointers (FR PAY-01/02/04/07).
- Runtime metadata engine — **no hardcoded tenant formula** (I-5).
- **HOLD — Q-PAY-FORMULA:** Option A dual-control author/publish (ADR §10). **Không** mở drag-drop GĐ1. **Không** ghi «họp lương chưa xong».
- API F.1: `F-PAY-PERIOD/ATT-CLOSED/CB-READ/RD-APPLY/PROCESS/PAYSLIP/SPLIT/TERM-SETTLE` = DRAFT; `F-PAY-FORMULA-*` authoring = HOLD.

### §8–§9 Cross-cutting / NFR

- Xem TechSpec draft §8–§9.

### §11 Residuals / GĐ2

| ID | Item | Gate |
|----|------|------|
| R-BP-CAMPAIGN-GĐ2 | Campaign hub + đa kênh | Đối tác API |
| R-BP-FORMULA-UI | Drag-drop formula designer | GĐ2 — sau confirm Q-PAY-FORMULA |
| R-BP-FORMULA-CONFIRM | Khách sign-off Q-PAY-FORMULA Option A | Trước F-PAY-FORMULA authoring F.1 đầy đủ |
| ~~R-BP-PAY-MEETING~~ | ~~Họp lương buổi sau~~ | **SUPERSEDED** — SYNTHESIS v1.0 |
| R-BP-ASSET-SOT | Full Asset SoT vs CORE stub | Phase sau |
| R-BP-PAY-DB-DEPTH | ba-data PAY columns vs API §4 | Concurrent SYNTH-PAY-DB |
| R-BP-DB-ALIGN | Align API ↔ DB_DESIGN | Spot-check trước Dev |
| R-BP-CUSTOMER-SIGN | Customer/sponsor sign-off pack (D7) | Trước claim signed |

---

## 3. Explicit HOLD — vẫn còn

**Cấm** cho đến unlock Dev:

- Migration / Prisma / Nest controllers cho blueprint.
- Claim TechSpec/API **khách đã confirm** (D7).
- Invent full PAY formula **authoring** API / drag-drop GĐ1 / DDL expression sâu trước Q-PAY-FORMULA.

**Đã được phép:**

- TechSpec draft depth REC/CORE/ATT + **PAY P1–P6** từ họp (SYNTHESIS).
- API_DESIGN F.1 meeting-locked gồm PAY runtime/orchestrator (không authoring formula).
- Align logical tables với DB_DESIGN (ba-data concurrent).

---

## 4. DOC-DELTA log

### `PO-HRM-BP-ADR-Q-PAY-FORMULA-01` (2026-08-04)

- Pointer HOLD §7 → ADR §10 **Q-PAY-FORMULA** Option A.
- Pointer HOLD §5 → ADR §11 **Q-ASSET-MODULE**.

### `PO-HRM-BP-MEET-TECH-API-01` (2026-08-04)

- Status outline: HOLD skeleton → **DRAFT unlocked** (meeting-locked) — **not customer-signed**.
- Promoted: `TECHSPEC_HRM_ENTERPRISE.md` + `API_DESIGN_HRM_ENTERPRISE.md`.
- Campaign hub marked **GĐ2**; PAY was outline + Q-PAY-FORMULA (superseded by SYNTH-PAY-TECH below for P1–P6).
- Evidence: `docs/qa/evidence/po-hrm-bp-meet-tech-api-01.md`.

### `PO-HRM-BP-SYNTH-PAY-TECH-01` (2026-08-04)

- **CORRECTION:** Remove HOLD reasons «họp lương chưa xong / MEETING P1 unfinished».
- PAY TechSpec §7 + API §4 depth for SYNTHESIS P1–P6 + FR PAY-01/02/04/07.
- Q-PAY-FORMULA remains open for **authoring**; drag-drop ≠ GĐ1.
- GW deny-list kept; DRAFT not customer-signed (D7); no `apps/**`.
- Evidence: `docs/qa/evidence/po-hrm-bp-synth-pay-tech-01.md`.
