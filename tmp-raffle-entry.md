### 2026-07-28T14:46:51+07:00 | CLAUDE-PM -> CURSOR-PM | OPEN | PEER-UX-GAP-RAFFLE-01

- **from:** CLAUDE-PM (Phó Giám đốc, U74 propose)
- **to:** CURSOR-PM
- **work_item_id:** `PEER-UX-GAP-RAFFLE-01`
- **ack_status:** OPEN
- **sponsor_lock:** sponsor chốt — chưa authorize remaster wave

---

#### Bảng gap còn lại (theo ANALYSIS + REMAINING-SYNTHESIS)

| WI | Mô tả | Owner | Phase | Phụ thuộc |
|----|-------|-------|-------|-----------|
| D-UX-UX03-DEBOUNCE-01 | Wire 300ms debounce Shifts + Contracts search | Cursor | R1 | — |
| D-UX-D5-ZOD-TAX-01 | Zod + RHF Payroll salary form; wire FormMessage | Cursor | R1 | — |
| D-UX-UX09-SHIFTS-BULK-01 | Shifts bulk toolbar + DataTable extraction | Cursor | R2 | UX-03 QA PASS |
| D-UX-P0C-ATTENDANCE-REDUCER-01 | Attendance/Payroll useReducer domain blocks | Cursor | R3 | D5 QA PASS |
| D-UX-PROFILE-TABS-C2 | Profile 15 tabs → Core/HR/Career/Personal + lazy | Cursor | C2 queue | Sponsor chốt C2 |
| D-UX-WCAG22-FOCUS-MOBILE | WCAG 2.2 focus-not-obscured (4 mobile screens) | Cursor | R3m | — |
| D-UX-OVERLAY-TOKEN-01 | Overlay/button height token async dialog | Claude | Wave A | Lane A tokens |
| D-UX-EMPTY-STATE-SOT-01 | EmptyState/ErrorState SoT component | Claude | Wave B | D1 audit close |
| D-UX-PERMISSION-FALLBACK-01 | PermissionFallback VI message + CTA | Claude | Wave B | UX-07 link |
| D-UX-I18N-HARDCODE-01 | Hardcode JSX scan → t() pipeline | Claude | Wave B | P2 backlog |

**Phân loại:**
- Wave 1 (NOW): D5 + UX-03 (Cursor FE/QA in-flight) + WCAG 2.2 mobile (Cursor, song song)
- Wave 2 (R2): UX-09 Shifts bulk (gated UX-03 QA)
- Wave 3 (R3): P0-c useReducer + WCAG 2.2 mobile
- Wave C2 (queue): Profile tab grouping — chờ sponsor
- Wave A (tokens): XBOS Inter/color token cleanup — DONE QA PASS
- Wave B (lib): XTable/EmptyState/PermissionFallback — plan-only; D1 audit delivered

**Thứ tự wave remaster đề xuất:**
Wave 1 NOW → Wave 2 (UX-09) → Wave 3 (P0-c + WCAG) → Wave C2 queue → Wave A/B docs-only

**Non-negotiable:**
- Không claim Phase1/PROD
- Không đè C1 Clock-In / taxSettlementFloatingUi
- Claude Wave A/B = docs + component plan only, no apps/** code
- Mọi wave mới qua U74 (góp ý → synthesis → sponsor chốt → execute)

**Next action:** Chờ Cursor-PM tổng hợp + sponsor chốt wave order. Claude standby peer review Wave 2/3; execute Wave A/B docs khi unlock.

---