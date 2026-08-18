# Evidence — PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-02` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · U89 Wave-29 · UC-BP-ATT-11 |
| **date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **FIX** · CODE-MEMORY **APPEND** |
| **depends_on** | QA-01 `ATT11QA1-MSLXD7ZD` · FE-01 RETAIN · API-01 RETAIN |
| **honesty** | `attendance_uat_ready=false` · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT UAT · printable false · PAY OUT · DENY `att_leave_hold` · Nest `/core` DENY · C-SLICE · U65 |

---

## Root cause (P0-ATT11-FE-VITE-COMMENT-TERMINATOR)

`hrmApi.ts` block comment `@CODE-MEMORY-CHANGE` FE-01 contained literal `attendance-sheets*/signatures` — the `*/` closed the comment early → Vite transform **500** → blank `/hr/attendance` (QA-01 J-01..06 BLOCKED).

---

## Fix (narrow)

| Item | Detail |
|------|--------|
| File | `apps/web/hrm/src/integrations/hrmApi.ts` (~L6861–6875) |
| Change | `must_keep` path text → `attendance-sheets/{id}/signatures\|close\|reopen` (no star-slash inside block comment) |
| APPEND | `@CODE-MEMORY-CHANGE` **PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-02** |
| Runtime URLs | **unchanged** — `${sheetId}/signatures` etc. |
| SignPanel / rings | **unchanged** (FE-01 behavior RETAIN) |

Grep `hrmApi.ts` + ATT-11 comments: **no other** `sheets*/` inside block comments (only this line was defective).

---

## Verification

| Check | Result |
|-------|--------|
| `pnpm vitest run src/lib/poHrmMvpGd1Att11ClusterFe01.source.test.ts` | **5 PASS** (incl. FE-02 comment guard) |
| `pnpm vitest run src/lib/poHrmMvpGd1Att10ClusterFe01.source.test.ts` | **4 PASS** (SignPanel peer RETAIN) |
| `pnpm exec vite build` (apps/web/hrm) | **exit 0** · `Attendance-*.js` chunk built · hrmApi transforms OK |
| Nest `/core` invent | **none** |
| seed / PAY / CSUM / INBOX | **none** |

---

## must_keep seals (RETAIN)

`ATT10QC1-MSLWGUYH` · `ATT09QC1-MSLUTL9D` · `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06

---

## Residual (QA)

- Browser U65 retest **J-HRM-ATT-11-01..06** on `/hr/attendance` — confirm `att-sign-panel` / `att-11-sign-display` mount after Vite 200.
- Prior QA-01 sheet probe `2d1a688e-0449-4237-a2df-2b2f1707f138` still valid for sign ladder (read-only).

---

## completion_report

**Closed:** P0 Vite comment terminator in `hrmApi.ts`; FE-02 CODE-MEMORY APPEND; vitest + vite build PASS; honesty seals unchanged.

**Open:** Full browser J-01..06 evidence → QA-02.

---

## Handoff

- **next_owner:** `qa`
- **next_dispatch_prompt:**

```text
PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-02 — RE-DISPATCH browser U65 retest after FE-02 Vite fix.

entry_criteria:
- evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-02.md READY_FOR_QA
- portal :5173 or :8088 + HRM embed :8080/:5175 · hrm-api :28001 · ceo@xe.vn / Xevn@2026 · companyId=main
- U65 zero-seed · sheet read-only QA-ATT-10-CLUSTER-01 2d1a688e-0449-4237-a2df-2b2f1707f138 submitted if still present

exit_criteria:
- GET /hr/src/integrations/hrmApi.ts (or module graph) → 200 · no Vite 500
- J-HRM-ATT-11-01..06 full UF blocks per docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qa-01.md template
- att-sign-panel · att-11-sign-display · att-sign-confirm-* · att-sign-close-sheet · att-11-honesty reachable
- Nest /core sign SoT 404 · honesty seals RETAIN (≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · printable false · PAY OUT · DENY att_leave_hold)
- evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qa-02.md · ack PASS_TO_PM or FAIL_TO_PM

cấm: seed · invent /core · honesty flip · claim ATT UAT
```
