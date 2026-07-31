# DO-REC-13-S2-SUBMIT-DEPLOY-01 — evidence (2026-08-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `DO-REC-13-S2-SUBMIT-DEPLOY-01` |
| **program** | `P-REC-E2E-13STEP-01` · residual `R-REC-13-S2-SUBMIT-INBOX` |
| **from_role** | devops → **pm** / **qa** |
| **prior** | `D-REC-13-S2-SUBMIT-INBOX-01` READY_FOR_QA · `docs/qa/evidence/d-rec-13-s2-submit-inbox-01-20260801.md` |
| **VPS HEAD** | `01fffad` (`origin/main`) |
| **ack_status** | **PASS_TO_PM** |
| **policy** | U65 zero-seed · serialize SoftDel/ViMoney · no `git add .` · no compose down |

---

## Serialize note

- SoftDel/ViMoney FE recreate was still warm (~1 min Up) at entry — waited, then **one pull/recreate wave** for REC submit CTA.
- Concurrent SoftDel EmployeeFormDialog commit landed on `main` between pulls; VPS ff-only absorbed it without stash conflict.

## Closed scope

### 1) Allow-list commit (submit CTA)

`cdf0b0c` — **7 paths** (no wide add):

- `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` (+ test)
- `apps/web/hrm/src/components/recruitment/RecruitmentWfSpawnBanner.tsx`
- `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx`
- `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` (+ test)
- `docs/qa/evidence/d-rec-13-s2-submit-inbox-01-20260801.md`

Message: `fix(hrm): show Gửi duyệt QT after YCTD create`

### 2) Compile deps (Vite resolve — required)

After first recreate, Vite **500** on `JobRequisitionsTab`: `Failed to resolve import "@/lib/labelMaps"`.

Restored from git blob history (UTF-8 `git cat-file -p`, **not** PowerShell `>` UTF-16):

| Commit | Paths |
|--------|--------|
| `b39ed2d` | `labelMaps.ts` + `labelMaps.test.ts` |
| `e176c70` | `compensationAllowanceCodes.ts`, `recruitmentFunnel.ts`(+test), `employeePickerLabel.ts`(+test) |
| `01fffad` | rewrite `labelMaps*` UTF-8 (fix PowerShell UTF-16 LE BOM `fffe`) |

### 3) VPS

1. `git pull origin main` → HEAD `01fffad`
2. Sequential `--force-recreate --no-deps`: **hrm-fe** then **portal-fe**
3. Non-xevn left Up (ytexa/hsbx/asms)

---

## Module-body proof (not SPA HTML)

| URL | HTTP | SPA/err HTML? | Body assert | Verdict |
|-----|------|---------------|-------------|---------|
| `:8080/hr/src/components/recruitment/JobRequisitionsTab.tsx` | **200** | **false** | `export` + `Gửi duyệt QT` / submit markers | **PASS** |
| `:8088/hr/src/components/recruitment/JobRequisitionsTab.tsx` | **200** | **false** | same | **PASS** |
| `:8080/hr/src/lib/recruitmentWorkflowUi.ts` | **200** | **false** | `export` + `canSubmitRequisitionWorkflow` | **PASS** |
| `:8088/hr/src/lib/recruitmentWorkflowUi.ts` | **200** | **false** | same | **PASS** |
| `:8080/hr/src/lib/labelMaps.ts` | **200** | **false** | `export` + `resolveEmploymentTypeDisplay` | **PASS** |
| `:8088/hr/src/lib/labelMaps.ts` | **200** | **false** | same | **PASS** |
| `:8080/hr/.../RecruitmentWfSpawnBanner.tsx` | **200** | **false** | `export` | **PASS** |

First-wave FAIL (closed): JobRequisitionsTab **500** missing `@/lib/labelMaps`; labelMaps **500** UTF-16 syntax — both closed by compile-dep commits above.

---

## L0 smoke

| Check | Result |
|-------|--------|
| `GET :8088/` | **200** |
| `GET :8088/command-center` | **200** |
| `GET :3001/api/hrm/metrics` | **200** |
| `xevn-hrm-fe-dev` / `xevn-portal-fe-dev` | Up |
| `xevn-hrm-be-dev` | healthy |
| non-xevn | still Up |
| seed | **none** |

---

## Residual

- Browser UF S2 (create → **Gửi duyệt QT** → Network submit-workflow → Inbox) → **QA** on `:8088` — not claimed here.
- If submit 2xx + SPAWN-MISSING / Inbox empty → BE residual `D-REC-13-S2-SUBMIT-INBOX-BE-01` (no seed).

---

## next_owner

`qa` (retest already dispatched may proceed on `:8088`)

```text
work_item_id: QA-REC-13-S2-SUBMIT-INBOX-8088-01
entry: DO-REC-13-S2-SUBMIT-DEPLOY-01 PASS; VPS HEAD 01fffad; JobRequisitionsTab + recruitmentWorkflowUi Vite 200 non-SPA
task: Browser S2 on :8088 — login ceo@xe.vn → /hr/recruitment?tab=requisitions → Thêm YCTD → Lưu (POST 201) → visible «Gửi duyệt QT» → click → POST submit-workflow 2xx → Inbox or honest SPAWN-MISSING (U65 no seed)
exit: evidence block UF; matrix/J-REC-WF-02 update; ack PASS_TO_PM
evidence: docs/qa/evidence/qa-rec-13-s2-submit-inbox-8088-01-20260801.md
cấm: pnpm seed:* · inbox seed · DB fake
```
