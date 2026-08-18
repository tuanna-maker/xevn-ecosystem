# Evidence — PO-HRM-UI-BRAND-ADR-02-APPEND

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-ADR-02-APPEND` |
| **Role** | SA |
| **Date** | 2026-08-05 |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` |
| **ack_status** | **PASS_TO_PM** |
| **ADR** | [`docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md`](../../architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md) **§15 APPEND** |
| **Source** | `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_UI_BRAND_OPEN_QUESTIONS.md` §3–§4 · §8 |
| **Prompt spirit** | `docs/program/prompts/CLAUDE_ENTERPRISE_UI_RESEARCH_PROMPT.md` (Prompt 3 / enterprise dialog) |
| **Cấm honored** | No wipe ADR · no `apps/**` · no invent final body font · no remaster DONE / Attendance CLOSED / Face LIVE |

---

## 1. Mission closed

APPEND-only sponsor fill into living Precision Motion ADR. Hex SoT (§7) + pale ban (§8) + dual-surface hex lockstep (§9) **preserved**. Interim A3/A4 **superseded** by U1/U2; B5 body + S3 remain **PENDING**.

---

## 2. Sponsor locks encoded (§15)

| ID | Encoded |
|----|---------|
| B1 | Brand = **XeVN** |
| B2 | Wordmark **mọi modal** |
| B3 | Sắc nét enterprise — bỏ cực Apple luxury vs ops-first cứng |
| B4 | Cấm AI tím/cream/glow |
| B5 | Display **Montserrat**; body A/B/C **PENDING** (rec Source Sans 3) |
| U1 | Hero/visual modal **OK** |
| U2 | Glass + full-bleed header brand |
| U3 | Giảm field OK · dialog rộng · input compact theo ký tự |
| U4 | Mobile **cùng** brand system |
| S1 | Squad song song · làm hết |
| S2 | Không bắt buộc 1 wave 46/90 |
| S3 | **PENDING** A/B — SA recommend **A** chrome+honesty |
| S4 | HTML/Figma neo **trước** Dev-FE |
| Q1 | Viền xanh đầu + logo trái |
| Q2 | 12–14px sắc nét đậm |
| §4 | D7 vs UI **song song** · brand = portal chrome · component thay nếu UX tốt hơn · layout nghiệp vụ giữ · tư vấn ngoài = tham khảo only |

---

## 3. A1–A5 disposition

| Assumption | Disposition |
|------------|-------------|
| A1 | LOCKED as XeVN (+ hex unchanged) |
| A2 | LOCKED via Q2 floors |
| A3 | **SUPERSEDED** by U1 |
| A4 | **SUPERSEDED** by U2 / §15.4 |
| A5 / S3 | **PENDING** — recommend A |

---

## 4. Residual (not invented)

| ID | Item | Owner |
|----|------|-------|
| R-B5 | Body font A/B/C one-liner | Sponsor |
| R-S3 | Stub chrome A vs B one-liner | Sponsor |
| R-HTML | Prompt 1 + HTML neo 5 dialogs | `PO-HRM-UI-BRAND-HTML-NEO-01` · ba-docs |
| R-PROG | remaster_program_done / attendance_closed / face_live | remain **false** |

---

## 5. Files touched

| Path | Action |
|------|--------|
| `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` | Header meta + **§15 APPEND** (no wipe §1–§14) |
| `docs/qa/evidence/po-hrm-ui-brand-adr-02.md` | This evidence |
| `apps/**` | **untouched** |

---

## 6. Handoff contract

```yaml
work_item_id: PO-HRM-UI-BRAND-ADR-02-APPEND
from_role: sa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-adr-02.md
completion_report: |
  ADR §15 APPEND CLOSED — sponsor Open Q §3–§4+§8 locks encoded.
  Hex/pale/dual-surface preserved. A3/A4 superseded (hero+glass header).
  B5 body + S3 PENDING (rec body=A Source Sans 3 · S3=A chrome+honesty).
  Not remaster DONE · Attendance not CLOSED · Face not LIVE.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: PO-HRM-UI-BRAND-HTML-NEO-01
  from_role: pm
  to_role: ba-docs
  priority: P0
  lane: governance
  entry_criteria: ADR §15 Accepted · docs/qa/evidence/po-hrm-ui-brand-adr-02.md · prompts CLAUDE_ENTERPRISE_UI_RESEARCH_PROMPT.md
  scope: Run PROMPT 1 enterprise research then PROMPT 2 HTML neo (Login + ATT Overview + 2 ATT dialogs + EMP profile modal) per §15.4 anatomy (full-bleed blue bar + logo left + glass header + Montserrat titles + field-width rules U3). Preview body = Source Sans 3 as research rec only — mark B5 PENDING. Stub surfaces use S3=A working assumption + honesty banner.
  exit_criteria: evidence docs/qa/evidence/po-hrm-ui-brand-html-neo-01.md + HTML deliverable path; QA 5s checklist Q1/Q2; no apps/** production remaster claim
  parallel_optional: PM ping sponsor Body=A|B|C and S3=A|B
  cấm: remaster DONE · Attendance CLOSED · Face LIVE · invent final body font · seed · wipe ADR
pm_dispatch_hint: PO-HRM-UI-BRAND-HTML-NEO-01 (ba-docs) — already DISPATCHED 13:40 if in-flight; else ensure research→HTML before further Dev-FE chrome
```

---

## 7. Validation / acceptance

- [x] ADR APPEND section dated 2026-08-05 sponsor fill (§15)
- [x] Evidence this file
- [x] Bus PASS_TO_PM + next_dispatch_prompt
- [x] No invent body font final
- [x] No remaster DONE / Attendance CLOSED / Face LIVE claims
