# QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-03 — SoftDel + BH combined · Dev8088

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-03` |
| **program** | `P-HDSD-ECOSYSTEM-03` · `R-8088-FE-BH-VIMONEY-01` · SoftDel post-`08c166b` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://14.225.217.232:8088` |
| **hrm_embed** | `http://14.225.217.232:8080` (+ portal `/hr/*`) |
| **entry** | `DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-03` PASS_TO_PM · VPS HEAD **`7c03091`** · SoftDel export retained from `08c166b` · `docs/ops/evidence/do-hdsd-mutate-softdel-bh-redeploy-03-20260801.md` |
| **parallel SoftDel** | `QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET` **FAIL_TO_PM** (same EmpForm crash) · `docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-ret-20260801.md` — **cited + re-smoked** after ViMoney recreate |
| **policy** | U65 zero-seed · browser-only · U76 HDSD SoftDel + BH · **no seed** · **no** probe-only PASS · **cấm** demote local matrix 🟢 · **cấm** PASS if either TC FAIL |
| **ack_status** | **FAIL_TO_PM** |
| **harnesses** | SoftDel `scripts/qa/qa-hdsd-bf-03-softdel-ret-01-browser.mjs` · BH `qa-hdsd-bf-03-bh-ret-02-browser.mjs` + targeted ViMoney enroll `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-bh-8088-smoke-03-bh-vimoney.mjs` |
| **runtime** | softdel `_tmp-…-smoke-03-softdel-runtime.json` · bh `_tmp-…-smoke-03-bh-runtime.json` · vimoney `_tmp-…-bh-vimoney-runtime.json` · diag `_tmp-…-diag.json` · vite `_tmp-…-vite-probe.json` |
| **screens** | `docs/qa/evidence/screens/hdsd-mutate-softdel-bh-8088-smoke-03-20260801/` (+ `docs/docs/qa/evidence/screens/…` path twin from harness cwd) |
| **local greens** | TC-025 / TC-049 on `:5173` — **not demoted** |

## Executive verdict

**FAIL_TO_PM** — Combined SoftDel+BH after ViMoney redeploy-03: **TC-049 🟢**, **TC-025 🔴**. Overall FAIL (exit rule: either TC FAIL → no PASS).

| Prior residual | After SMOKE-03 |
|----------------|----------------|
| ~~R-8088-FE-BH-VIMONEY-01~~ `Failed to resolve ViMoneyInput` | **CLOSED** — Vite module body **200** · dialog opens · `base_salary: 15000000` via ViMoneyInput · POST participants **201** `HRM-INS-P-201` · dialog close · F5 no Sync ERROR |
| SoftDel metadata export `resolveHrmCompanySlugForDisplay` (`08c166b`) | **still CLOSED** — `hrmMetadataCompany.ts` Vite **200** + export |
| SoftDel mutate on Dev8088 | **still BLOCKED** — same as 03A-RET: `EmployeeFormDialog` `departments.map` when `departments` undefined → Employees root empty |

| TC | Dev8088 | Why |
|----|---------|-----|
| **TC-HRM-HDSD-025** SoftDel | 🔴 **FAIL** | Employees blank · PageError `TypeError: … 'map'` @ `EmployeeFormDialog.tsx:381` (`departments.map`) · **0** archive POST · stamp `SD8MGOSD` |
| **TC-HRM-HDSD-025** row→profile | 🔴 **FAIL** | **0** table rows (same crash) |
| **TC-HRM-HDSD-049** Thêm BH + ViMoney | 🟢 **PASS** | Dialog open · no resolve fail · amount via ViMoney · POST **201** · FE after + F5 |
| Local matrix TC-025 / TC-049 🟢 | **preserved** | No promote/demote |

**False-green guard SoftDel:** auth `GET /api/hrm/employees?company_id=main` → **200** `HRM-EMP-200` total **42** — BE OK; UI empty from FE crash. **No** SoftDel PASS from API/probe alone.

**Local FE note:** workspace already has uncommitted guard `D-HDSD-MUTATE-SOFTDEL-EMP-FORM-MAP-01` on `EmployeeFormDialog.tsx` (`departmentOptionsFromCatalog(catalogs ?? [])` · cấm `departments.map`) — **not** on VPS HEAD `7c03091`.

---

## U76 HDSD coverage inventory

| HDSD menu / màn | Nút / function | Click path | Verdict |
|-----------------|----------------|------------|---------|
| HRM · Nhân viên | List loads | Login → `/hr/employees` | 🔴 page crash / empty root |
| HRM · Nhân viên | ⋯ → Xóa → AlertDialog → archive | SoftDel TC-025 | 🔴 unreachable |
| HRM · Nhân viên | Plain row → hồ sơ | J-HRM-02 must_keep | 🔴 unreachable |
| HRM · Bảo hiểm | Thêm bảo hiểm | `/hr/insurance` → CTA | 🟢 |
| HRM · Bảo hiểm | ViMoney mức lương đóng | `base_salary` ViMoneyInput | 🟢 |
| HRM · Bảo hiểm | Lưu tham gia | POST participants | 🟢 **201** `HRM-INS-P-201` |
| HRM · Bảo hiểm | F5 persist / no Sync ERROR | reload | 🟢 |

---

## Adjunct Vite probes (not sole PASS)

| URL | HTTP | HTML shell? | Body | Verdict |
|-----|------|-------------|------|---------|
| `:8088/hr/src/components/ui/ViMoneyInput.tsx` | **200** | **false** | export + transform | PASS |
| `:8088/hr/src/components/insurance/AddInsuranceDialog.tsx` | **200** | **false** | no `Failed to resolve` | PASS |
| `:8088/hr/src/pages/Employees.tsx` | **200** | **false** | module OK | PASS (compile) |
| `:8088/hr/src/lib/hrmMetadataCompany.ts` | **200** | **false** | export OK | PASS |
| `:8088/hr/src/lib/hdsdMutateTestIds.ts` | **200** | **false** | module OK | PASS |
| `:8080` same paths | **200** | **false** | aligned | PASS |

L0: `:8088/` **200** · `:8080/` **302** · `:3001/api/hrm/metrics` **200**.

---

## TC-025 SoftDel — browser (re-smoke after recreate)

1. Login `ceo@xe.vn` → `http://14.225.217.232:8088/hr/employees?portal=1&tenantId=xevn&companyId=main`.
2. **Observed:** `#root` empty (`htmlLen=0`, `rowCount=0`, create CTA **0**).
3. PageError: `Cannot read properties of undefined (reading 'map')` — VPS transform line **381** = `departments.map((d)=>d.name)` inside `departmentOptions` `useMemo`.
4. SoftDel harness: row-click 🔴 · create «Thêm nhân viên» miss · **0** `POST …/archive`.
5. Cite parallel 03A-RET: same failure class after SoftDel metadata redeploy — ViMoney recreate did **not** regress SoftDel Vite modules; EmpForm crash remains.

**Verdict TC-025 Dev8088:** 🔴 FAIL / BLOCKED — not SoftDel AlertDialog regression on local `:5173` (must_keep).

---

## TC-049 BH + ViMoney — browser

### Preflight
- Policies auth **200** `HRM-INS-POL-200` · active **3**.
- Participants list **200**.

### Click path (PASS run)
1. `/hr/insurance` → **Thêm bảo hiểm** → dialog **visible**.
2. Console/page: **no** `Failed to resolve … ViMoneyInput`.
3. Select free employee `QAMD8EMR0V` (not already enrolled) · pick policy · fill **ViMoney** `base_salary` → **15.000.000** (POST body `15000000`).
4. **Lưu** → Network `POST /api/hrm/insurance-policy-participants` → **201** `HRM-INS-P-201` · `success: true`.
5. Dialog **closed** · F5 · **no** Sync ERROR banner.

### Earlier harness note (honest)
- `bh-ret-02` first hit **409** `HRM-INS-P-DUP` when default policy + already-enrolled SoftDel stamp emp — **not** ViMoney failure; targeted free-employee enroll proved **201**.

**Verdict TC-049 Dev8088:** 🟢 PASS — R-8088-FE-BH-VIMONEY-01 CLOSED for browser UF.

---

## Spec says / code does (Dev8088 @ `7c03091`)

| Layer | Spec / DoD | Observed |
|-------|------------|----------|
| SoftDel FE | Employees loads → ⋯ → Xóa → AlertDialog → archive 2xx → F5 | **FAIL** — EmpForm `departments` undefined `.map` |
| SoftDel must_keep | plain row → profile | **FAIL** — 0 rows |
| BH ViMoney | dialog + amount + Lưu 2xx + F5 | **PASS** — 201 + salary field |
| Vite SoftDel/ViMoney modules | body 200 not SPA | **PASS** (adjunct) |
| Local TC-025/049 | must_keep 🟢 | **unchanged** |

---

## Residual (P0)

| ID | Item | Sev | Owner |
|----|------|-----|-------|
| **R-8088-FE-SOFTDEL-EMP-FORM-MAP-01** | Commit + push + redeploy `EmployeeFormDialog` mount guard (workspace FIX already local / uncommitted `D-HDSD-MUTATE-SOFTDEL-EMP-FORM-MAP-01`) — cấm `departments.map` when prop missing; prove Employees rows + SoftDel archive 2xx | **P0** | **dev-fe** → **devops** → **qa** SoftDel RET |
| ~~R-8088-FE-BH-VIMONEY-01~~ | ViMoneyInput missing / resolve fail | — | **CLOSED** this smoke |
| SoftDel metadata export | `resolveHrmCompanySlugForDisplay` | — | **CLOSED** (retained) |

**Local greens:** TC-025 / TC-049 — **not demoted**.

---

## Matrix / Dev8088 note

- `HDSD_SRS_TESTCASE_MATRIX.md`: **no row mutate** (cấm demote local 🟢; SoftDel Dev8088 still not browser-green).
- Combined WI cannot promote SoftDel; BH ViMoney residual CLOSED in evidence only.

---

## Command table

| Command / check | Result |
|-----------------|--------|
| Vite probe script | all SoftDel/ViMoney/AddInsurance paths **200** module |
| SoftDel harness `:8088` | exit **2** · TC-025 🔴 · stamp `SD8MGOSD` |
| BH ret-02 harness `:8088` | first enroll **409** DUP (harness default emp/policy) |
| Targeted ViMoney enroll | exit **0** · TC-049 🟢 · POST **201** `HRM-INS-P-201` · `base_salary: 15000000` |
| Seed | **none** (U65) |

---

## Handoff

**completion_report:** Combined SoftDel+BH smoke on `:8088` after ViMoney HEAD `7c03091` **FAIL_TO_PM** overall. **TC-049 🟢** (ViMoney dialog + amount + participants **201** + F5). **TC-025 🔴** — Employees still blank from `EmployeeFormDialog` `departments.map` (same as 03A-RET; SoftDel re-smoke after recreate confirms). Prior ViMoney Vite residual **CLOSED**. SoftDel metadata export **still CLOSED**. U65 browser-only; **0** false SoftDel archive 2xx. Local matrix SoftDel/BH 🟢 **not demoted**.

**next_owner:** `pm` → **dev-fe** (commit EmpForm MAP guard) → **devops** redeploy → **qa** SoftDel-only RET (BH may must_keep spot-check)

**next_dispatch_prompt:**

```text
work_item_id: D-HDSD-MUTATE-SOFTDEL-EMP-FORM-MAP-01
from_role: pm | to_role: dev-fe
program: P-HDSD-ECOSYSTEM-03 · R-8088-FE-SOFTDEL-EMP-FORM-MAP-01
priority: P0
entry_criteria:
- QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-03 FAIL_TO_PM
- evidence: docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-03-20260801.md
- VPS still has departments.map crash in EmployeeFormDialog (Vite L381); Employees root empty; SoftDel unreachable
- Workspace already has local FIX (git status M EmployeeFormDialog.tsx) — verify tests + CODE-MEMORY; do not rewrite SoftDel DataTable / BH / ViMoney
exit_criteria:
1. Confirm mount guard: departmentOptionsFromCatalog(catalogs ?? []); never departments.map on undefined; open=false does not throw
2. Unit/mount-guard test PASS; @CODE-MEMORY-CHANGE retained
3. READY_FOR_QA or PASS_TO_PM with allow-list paths for devops:
   - apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx
   - related test(s) only
4. must_keep: SoftDel AlertDialog path · TC-049 ViMoney 🟢 · CatalogSearchPicker · no seed
Then PM → DO-HDSD-MUTATE-SOFTDEL-EMP-FORM-REDEPLOY-01 (recreate hrm-fe/portal-fe) → QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-04 (TC-025 archive 2xx + row→profile; BH must_keep spot only)
cấm: seed · demote TC-049 · rewrite BH dialog · claim SoftDel PASS without browser archive 2xx
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-03-20260801.md`

**ack_status:** **FAIL_TO_PM**
