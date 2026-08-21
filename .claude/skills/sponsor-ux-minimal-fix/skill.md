---
name: sponsor-ux-minimal-fix
description: >-
  Handle sponsor UX rejection with minimal scope: rollback over-engineering,
  restore only what sponsor kept, explicit KEEP vs REMOVE lists. Use when sponsor
  says rollback, "chỉ cần X", rejects confusing labels, or corrects over-removal.
---

# Sponsor UX minimal fix

## Triggers

- "Không đẹp" / "vô nghĩa" / "bỏ đi" / "rollback"
- Sponsor points at **specific rows** in screenshot (only those are REMOVE candidates)
- "Làm quá rồi" / "có chỉ vào … đâu"
- Sponsor confirms minimal path: e.g. **STT column only**

## Workflow

```
1. STOP current wave — mark superseded in bus
2. PM intake CORRECTION block: KEEP vs REMOVE (explicit table)
3. BA only if business rule ambiguous; else dev-fe display-only slice
4. QA matrix: assert REMOVED absent + KEPT present
5. Sponsor spot-check local → "deploy" → scope-controlled commit slice
```

## REMOVE vs KEEP template

Copy into bus / dispatch:

| REMOVE (sponsor asked) | KEEP (unless sponsor said remove) |
|------------------------|----------------------------------|
| (list exact UI rows)   | (discount, partner name, status…) |

**Rule:** If sponsor did not point at a row, **default KEEP**.

## SmartClinic collect examples (2026-07-09)

| Wave | Wrong | Right |
|------|-------|-------|
| Package parity v1/v2 | Package chrome in/on table | Flat table + STT only (sponsor rollback) |
| Dedupe v1 | Removed discount + partner context | Remove only Total/Paid/Final; keep Discount + Partner+tên |

## UX labels

- Every visible number/label must be **meaningful to role** (accountant, reception) in 3 seconds
- No raw indices like `1 (16)` without human label — prefer consult reference or skip feature

## PM must not

- Expand v2 after v1 reject without sponsor wireframe approve
- Dispatch "fix everything" — one correction `work_item_id` per sponsor message

## Cross-ref

- `incidents/INC-COLLECT-UX-OVER-ENGINEER.md`
- `incidents/INC-COLLECT-DEDUPE-OVER-REMOVE.md`
- `skills/scope-controlled-delivery/SKILL.md`
