# Evidence — PO-HRM-UI-BRAND-ADR-03-LOCK

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-ADR-03-LOCK` |
| **Role** | SA |
| **Date** | 2026-08-05 |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` |
| **ack_status** | **PASS_TO_PM** |
| **ADR** | [`docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md`](../../architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md) **§16 LOCK** (+ §15 PENDING → LOCKED pointers) |
| **Source** | `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_UI_BRAND_OPEN_QUESTIONS.md` **§7.1** (~13:44) |
| **Prior** | ADR §15 from `PO-HRM-UI-BRAND-ADR-02-APPEND` |
| **Cấm honored** | No wipe ADR · no `apps/**` · no remaster DONE · no Attendance CLOSED · no Face LIVE · no invent LIVE on SKIP |

---

## 1. Mission closed

APPEND-only **FINAL LOCK** converting §15 PENDING (B5 body · S3 · ATT scope wording) to **LOCKED**. Hex SoT (§7) + pale ban (§8) + dual-surface (§9) + modal anatomy (§15.4) **preserved**. Brand Open Q has **zero PENDING**.

---

## 2. Sponsor §7.1 → ADR §16

| Lock | Sponsor value | ADR disposition |
|------|---------------|-----------------|
| **B4** | CONFIRMED cấm AI purple/cream/glow | Hard law (reinforces §8 / §15.2) |
| **B5 body** | **Source Sans 3** (final) + Montserrat display | **LOCKED** — Inter interim body retired |
| **S3** | **A** chrome brand + honesty (final) | **LOCKED** — stub/SKIP keep banner/disabled |
| **ATT scope** | Remaster **all 90** surfaces | **LOCKED** — SKIP = S3=A chrome+honesty only |
| **Pipeline** | HTML neo → FE squad parallel · libs OK if research chốt | **LOCKED** |

---

## 3. A1–A5 / PENDING disposition (after ADR-03)

| Item | Disposition |
|------|-------------|
| A1 / B1 | LOCKED XeVN (unchanged) |
| A2 / Q2 | LOCKED floors (unchanged) |
| A3 / U1 | SUPERSEDED by U1 (ADR-02) |
| A4 / U2 | SUPERSEDED by U2 / §15.4 (ADR-02) |
| A5 / S3 | **LOCKED = A** (§16) |
| B5 body | **LOCKED = Source Sans 3** (§16) |
| S2 / ATT 90 | **LOCKED** remaster all 90 (§16) |

---

## 4. Residual (program — not invent)

| ID | Item | Owner |
|----|------|-------|
| R-FE-DIALOG | Dialog chrome wire in flight | `PO-HRM-UI-BRAND-FE-DIALOG-01` · `dev-fe` |
| R-SQUAD | Batch remaster ATT 90 + modules | `dev-fe` / `dev-mobile` after foundation |
| R-QA | Brand Q1/Q2 gate | `qa` after FE READY |
| R-PROG | remaster_program_done / attendance_closed / face_live | remain **false** |

**No sponsor one-liner residual** — B5/S3 CLOSED.

---

## 5. Files touched

| Path | Action |
|------|--------|
| `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` | Header meta · §15 PENDING→LOCKED pointers · **§16 APPEND LOCK** |
| `docs/qa/evidence/po-hrm-ui-brand-adr-03.md` | This evidence |
| `apps/**` | **untouched** |

---

## 6. Handoff contract

```yaml
work_item_id: PO-HRM-UI-BRAND-ADR-03-LOCK
from_role: sa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-adr-03.md
adr_path: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
section: §16
next_owner: pm
completion_report: |
  ADR §16 LOCKED from Open Q §7.1 — B4 CONFIRMED, B5 Source Sans 3 + Montserrat,
  S3=A, ATT all 90 (SKIP=chrome+honesty), pipeline HTML→FE squad+lib OK.
  No wipe · no remaster DONE · no Face LIVE invent.
next_dispatch_prompt: |
  PM continue/monitor PO-HRM-UI-BRAND-FE-DIALOG-01 (dev-fe) with LOCKED fonts
  Montserrat + Source Sans 3 and S3=A; after READY_FOR_QA → Task qa brand Q1/Q2;
  then squad parallel ATT 90 / REC / PAY — cấm remaster DONE / Attendance CLOSED / Face LIVE.
pm_dispatch_hint: PO-HRM-UI-BRAND-FE-DIALOG-01 — confirm Body=Source Sans 3 · S3=A locked in ADR §16
```

---

## 7. Validation checklist

- [x] APPEND §16 (no wipe §1–§15)
- [x] B4 / B5 / S3 / ATT 90 / Pipeline = LOCKED
- [x] Evidence written
- [x] Bus PASS_TO_PM
- [x] Cấm remaster DONE / Attendance CLOSED / Face LIVE / invent LIVE on SKIP

---

## 8. Seat verify (re-dispatch after stall)

| Check | Result |
|-------|--------|
| Open Q §7.1 vs ADR §16.1 | Match — B4 CONFIRMED · B5 Source Sans 3 · S3=A · ATT 90 · pipeline |
| §15 PENDING rows | Closed via §16 pointers (15.1 A5 · 15.2 B4/B5 · 15.5 S2/S3 · 15.6) |
| §6 Inter interim | Historical kept + **SUPERSEDED** callout → §16.2 |
| Hex / pale / dual-surface / §15.4 anatomy | Untouched |
| `apps/**` | Untouched |
| remaster DONE / Attendance CLOSED / Face LIVE | **Not claimed** |
