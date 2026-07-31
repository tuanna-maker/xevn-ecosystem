# D-REC-13-S2-LABELMAPS-UTF8-01 — labelMaps.ts UTF-8 encoding fix

| Field | Value |
|-------|-------|
| **work_item_id** | `D-REC-13-S2-LABELMAPS-UTF8-01` |
| **program** | `P-REC-E2E-13STEP-01` |
| **from_role** | pm → **dev-fe** |
| **date** | 2026-08-01 |
| **change_mode** | FIX |
| **prior** | `QA-REC-13-S2-SUBMIT-INBOX-RET-01` **FAIL_TO_PM** — Vite UTF-16 LE on `labelMaps.ts` |
| **ack_status** | **READY_FOR_QA** |
| **seed** | **none** (U65) |

---

## completion_report

### Closed

1. **Encoding:** `apps/web/hrm/src/lib/labelMaps.ts` on-disk is **UTF-8** (starts `2F 2A 2A 0A` = `/**\n`; **no** `FF FE` BOM; NUL ratio `0.0000`).
2. Prior binary fix already landed in commit `01fffad` (`Bin 27110 → 13216`, UTF-16 LE → UTF-8). This WI **APPEND** `@CODE-MEMORY-CHANGE` for `D-REC-13-S2-LABELMAPS-UTF8-01` and adds encoding gate test.
3. **Vite transform:** `GET http://127.0.0.1:8080/hr/src/lib/labelMaps.ts` → **200** `Content-Type: text/javascript`; body starts with CODE-MEMORY; exports present; **no** Vite `Unexpected character` transform failure.
4. **JobRequisitionsTab:** `GET …/JobRequisitionsTab.tsx` → **200**; still imports `submitJobRequisitionWorkflow` (Gửi duyệt QT wire **untouched**).
5. **Recruitment shell:** `GET /hr/recruitment?tab=requisitions` → **200** (SPA shell; module graph no longer blocked by labelMaps encoding).
6. **Tests:** `labelMaps.encoding.test.ts` + `labelMaps.test.ts` → **23/23 PASS**.

### must_keep preserved

| Item | Status |
|------|--------|
| VI semantic label maps | Kept (no dictionary rewrite) |
| Gửi duyệt QT FE wire | Untouched (`submitJobRequisitionWorkflow` still in JobRequisitionsTab) |
| Historic UF-HRM-12 | Not demoted |
| SoftDel / BH / EmployeeFormDialog | Not touched |

### Residual (next owners — not this WI)

| Residual | Owner | work_item |
|----------|-------|-----------|
| VPS `:8088` may still serve old UTF-16 blob until pull+recreate | devops | **DO-REC-13-S2-LABELMAPS-REDEPLOY-01** |
| Create 201 + Gửi duyệt QT + submit-workflow 2xx + Inbox U65 | qa | **QA-REC-13-S2-SUBMIT-INBOX-RET-01** retest after redeploy |
| Full 13-step DONE | — | **not claimed** |

---

## Verify (local)

```text
# Bytes
labelMaps.ts first4 = 2F 2A 2A 0A ; fffe=false ; nul_ratio=0.0000

# Vite
curl.exe -s -D - http://127.0.0.1:8080/hr/src/lib/labelMaps.ts
→ HTTP/1.1 200 OK ; Content-Type: text/javascript ; body UTF-8 CODE-MEMORY

# Vitest (cwd apps/web/hrm)
pnpm exec vitest run src/lib/labelMaps.encoding.test.ts src/lib/labelMaps.test.ts
→ Test Files 2 passed · Tests 23 passed
```

### Files touched (allow-list)

- `apps/web/hrm/src/lib/labelMaps.ts` — CODE-MEMORY APPEND + UTF-8 save
- `apps/web/hrm/src/lib/labelMaps.encoding.test.ts` — encoding smoke gate
- `docs/qa/evidence/d-rec-13-s2-labelmaps-utf8-01-20260801.md` — this evidence

### Forbidden / not touched

- JobRequisitionsTab / Gửi duyệt QT wire rewrite
- SoftDel / BH / EmployeeFormDialog
- `apps/api/**`
- seed / inbox seed
- `git add .`

---

## next_owner

**devops** → then **qa**

## next_dispatch_prompt

```text
work_item_id: DO-REC-13-S2-LABELMAPS-REDEPLOY-01
from_role: pm | to_role: devops
program: P-REC-E2E-13STEP-01
priority: P0

entry_criteria:
- D-REC-13-S2-LABELMAPS-UTF8-01 READY_FOR_QA
- evidence: docs/qa/evidence/d-rec-13-s2-labelmaps-utf8-01-20260801.md
- Local :8080 labelMaps Vite 200 UTF-8 proven; VPS :8088 still blocked until redeploy

allowed_paths (commit+push allow-list ONLY):
- apps/web/hrm/src/lib/labelMaps.ts
- apps/web/hrm/src/lib/labelMaps.encoding.test.ts
- docs/qa/evidence/d-rec-13-s2-labelmaps-utf8-01-20260801.md
cấm: git add . · seed · demote UF-HRM-12

exit_criteria:
1. Allow-list commit + push (labelMaps.ts + encoding test + evidence only)
2. VPS pull; recreate hrm-fe + portal-fe containers
3. Prove on :8088: module body UTF-8 (no FF FE) + GET /hr/src/lib/labelMaps.ts (or Vite transform URL) HTTP 200 without Unexpected character
4. Smoke /hr/recruitment?tab=requisitions mounts (no whitescreen from labelMaps)
5. PASS_TO_PM → PM dispatch QA-REC-13-S2-SUBMIT-INBOX-RET-01 retest:
   create POST 201 + Gửi duyệt QT + submit-workflow 2xx + Inbox U65 (browser-only; zero seed)
```

## ack_status

**READY_FOR_QA** (local encoding + Vite transform closed; VPS redeploy required before QA browser retest on `:8088`)
