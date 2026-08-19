# U74 DELTA — Claude UX-UI-C1-SYNTHESIS vs remaining đã chốt

| Field | Value |
|-------|-------|
| **Date** | 2026-07-28 |
| **Status** | **CHỜ SPONSOR** — lệch owner; **không** đổi execution cho đến khi bạn chốt lại |
| **Baseline chốt** | `UX-UI-ERP-REMAINING-SYNTHESIS.md` ACTIVE |
| **Claude ping** | `UX-UI-C1-SYNTHESIS` + evidence D1/D5 audits |

## 1. Evidence Claude đã giao (tiếp nhận)

| Artifact | Path | Cursor intake |
|----------|------|---------------|
| D1 audit | `docs/qa/evidence/d1-datatable-audit-20260728.md` | **R0 D1 = READY** (3 plain table Attendance; Payroll TBD) |
| D5 audit (docs) | `docs/qa/evidence/d5-payroll-form-validation-20260728.md` | Audit OK — **chưa** authorize code |

## 2. Bảng lệch owner

| WI | Đã chốt (ACTIVE) | Claude đề xuất mới | Cursor đề xuất giữ |
|----|------------------|--------------------|--------------------|
| D1 audit | Claude R0 | Claude ✓ | **Giữ Claude** — R0 đóng bằng evidence trên |
| D5 Zod **code** | **Claude** R1 | **Cursor** | **Giữ Claude** trừ bạn chốt đổi |
| UX-03 debounce | **Claude** R1 | **Cursor** | **Giữ Claude** (tránh Cursor+Claude đụng Shifts trước UX-09) |
| UX-09 bulk | Cursor R2 | Cursor ✓ | Giữ — sau UX-03 |
| P0-c useReducer | Cursor R3 | Cursor ✓ | Giữ — sau D5 |
| WCAG mobile | Cursor R3m | Claude audit + Cursor fix | Cursor đang `D-UX-R3-WCAG-MOBILE-01`; Claude audit docs optional |

## 3. Sequence đề xuất (giữ ACTIVE cho đến khi bạn sửa)

```text
R0 Claude D1 — CLOSED bằng evidence (copy/alias sang docs/program/D1-DATATABLE-AUDIT.md khuyến nghị)
R1 Claude UX-03 → D5 code
R2 Cursor UX-09
R3 Cursor P0-c + WCAG mobile (in flight)
```

## 4. Xin sponsor một dòng

- **«Giữ chốt remaining cũ»** — Claude làm UX-03+D5; bỏ đề xuất đổi owner  
- **«Chốt theo Claude C1-SYNTHESIS»** — D5+UX-03 chuyển Cursor  
- **«Sửa: …»**
