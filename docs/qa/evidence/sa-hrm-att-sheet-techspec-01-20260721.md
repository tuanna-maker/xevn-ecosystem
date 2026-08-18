# SA-HRM-ATT-SHEET-TECHSPEC-01 — TechSpec OpenAPI / fetch semantics align

| Field | Value |
|-------|-------|
| **work_item_id** | `SA-HRM-ATT-SHEET-TECHSPEC-01` |
| **from_role** | pm |
| **to_role** | sa |
| **lane** | governance |
| **date** | 2026-07-21 |
| **ack_status** | **PASS_TO_PM** |
| **change_mode** | ADD-only (no SRS wipe · no `apps/**`) |
| **ref_srs** | `docs/hrm/SRS.md` UC-HRM-23 / HRM-AT-14 · AC-ATT-SHEET-01..06 · BR-ATT-SHEET-01..07 |

---

## 1. Entry artifacts read

| Artifact | Role |
|----------|------|
| `docs/qa/evidence/ba-hrm-att-sheet-ac-01-20260721.md` | BA AC lock 01..06 |
| `docs/qa/evidence/ba-hrm-spec-quality-audit-01-20260721.md` | Spec quality + SA handoff |
| `docs/hrm/SRS.md` UC-HRM-23 / HRM-AT-14 | Business AC / BR |
| `docs/hrm/TECHSPEC.md` §12.1 / §13 (pre) | Baseline BA contract stub |
| BE `attendance-catalog.service.ts` create/list sheets | Header-only INSERT confirmed |
| BE `attendance.service.ts` `listRecords` + DTO | Weekly `from_date`/`to_date` + `HRM-ATT-200` |
| FE `useAttendanceSheets.ts` / `useWeeklyAttendanceSummary.ts` | RQ singleflight pattern (as-is / target) |

---

## 2. Spec says / code does (SA audit)

| Topic | Spec (after ADD) | Runtime |
|-------|------------------|---------|
| Create | POST → `attendance_sheets` header only; **≠** auto roster / records | `createAttendanceSheet` INSERT header; status `draft` — **ALIGNED** |
| Open grid | GET `records` by sheet period; aggregate FE | `useWeeklyAttendanceSummary` → `listAttendanceRecords(from,to)` — **ALIGNED** (storm was FE deps — execution lane) |
| Empty | 200 + `data=[]` = live-empty OK | BE returns empty list — **ALIGNED**; UI must not ERROR/spin |
| Storm | ≤2 GET sheets + ≤2 GET records / 10s | Sheets RQ fixed earlier; weekly RQ singleflight required — TechSpec §12.1.6 |
| Zod shared | Optional gap noted | No `packages/shared` AttendanceSheet Zod — **non-blocking** |

---

## 3. ADD-only TechSpec deltas applied

**File:** `docs/hrm/TECHSPEC.md`

| Section | ADD |
|---------|-----|
| §12.1.1 | Semantic lock: header ≠ roster; empty OK; weekly source; anti-storm |
| §12.1.2 | OpenAPI-style ops: `HRM-AS-200/201`, `HRM-ATT-200`; `AttendanceSheetRow`; create body; weekly fetch steps |
| §12.1.3–4 | Persistence + Zod/DTO gap (optional Dev-BE DTO) |
| §12.1.5–7 | FE bind AC map + **RQ singleflight recommended client pattern** + NFR thresholds |
| §12.1.8 | Out of scope (auto-records CR · Phase1 DONE · apps rewrite) |
| §13 | Map SRS→API/FE refreshed; SA verdict **ALIGNED**; handoff FE/QA |

**cấm tuân thủ:** không sửa `apps/**` · không wipe SRS · không claim Phase1 DONE.

---

## 4. Architecture decision (short)

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Document header-only + RQ singleflight (this wave) | Matches BA AC; zero product rewrite; clear FE NFR | Empty grid may surprise users expecting roster | **SELECT** |
| B — Auto-generate records on POST sheet | Full grid always | Product CR; seed-like; U65 conflict risk | Reject (out of scope) |
| C — New dedicated `/attendance-sheets/:id/grid` | Cleaner domain API | Extra endpoint; FE+BE churn; not required by AC | Defer |

**Recommended client pattern:** React Query **singleflight** — stable primitive `queryKey`, `staleTime≥60s`, `refetchOnWindowFocus:false`, one invalidate after mutate (§12.1.6).

---

## 5. Scope / NFR notes

- Scope ladder: sheets list `resolveHrmListScope`; mutate assert `HRM-AS-404/409`; records `pushWorkforceEmployeeScopeFilter` — parity required (U19).
- Observability: client storm → RATE-429 is **FAIL AC**, not BE capacity issue.
- Platform NFR: no new service; existing Nest envelope §5.

---

## 6. completion_report

**Closed:** TechSpec OpenAPI/contracts + weekly fetch semantics aligned to AC-ATT-SHEET-01..06; header≠roster + empty OK locked; FE RQ singleflight documented as recommended/must for anti-storm; Zod gap recorded non-blocking; evidence this file.

**Residual:**
1. Browser U65 QA still required (`QA-HRM-ATT-SHEET-AC-01` / J-HRM-06b).
2. Optional Dev-BE: `CreateAttendanceSheetDto` class-validator parity (not gate).
3. Ensure Dev8088/VPS has FE weekly RQ fix (`D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01`) before claiming AC-06 PASS on :8088.

**Not claimed:** Phase 1 DONE / PROD-READY.

---

## 7. Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/sa-hrm-att-sheet-techspec-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-ATT-SHEET-AC-01
from_role: pm
to_role: qa
lane: execution

## Spec (read first)
- docs/hrm/SRS.md UC-HRM-23 / HRM-AT-14 · AC-ATT-SHEET-01..06 · BR-ATT-SHEET-06/07
- docs/hrm/TECHSPEC.md §12.1 / §13 (SA-HRM-ATT-SHEET-TECHSPEC-01)
- docs/qa/evidence/sa-hrm-att-sheet-techspec-01-20260721.md
- docs/qa/evidence/ba-hrm-att-sheet-ac-01-20260721.md

## Entry
L0 stack up (or Dev8088 if wave target); U65 browser-only; FE weekly RQ fix present on target host.

## Exit
Browser evidence AC-ATT-SHEET-01..06 + J-HRM-06b:
- Create kỳ 01/07/2026–31/07/2026 + Công chuẩn → POST 201 HRM-AS-201 → list row no F5
- Open → grid OR live-empty (200 empty OK); loading ends
- ≤2 GET attendance-sheets + ≤2 GET records (same from/to) / 10s settle
- F5 persist sheet
ack_status PASS_TO_PM; matrix UF-HRM-16 / J-HRM-06b flag

cấm: seed · probe-only PASS · Phase1 DONE
```

If target host still lacks weekly RQ fix:

```text
work_item_id: D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01 (verify/sync)
to_role: devops | dev-fe
exit: useWeeklyAttendanceSummary RQ singleflight live on UAT host; then QA-HRM-ATT-SHEET-AC-01
```
