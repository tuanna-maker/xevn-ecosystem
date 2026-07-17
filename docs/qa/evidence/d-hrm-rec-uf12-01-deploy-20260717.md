# GWC-HRM-REC-UF12-01-DEPLOY (+ D-HRM-TOOLS-STUB-TOAST-01) — DevOps deploy evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `GWC-HRM-REC-UF12-01-DEPLOY` (+ addendum `D-HRM-TOOLS-STUB-TOAST-01`) |
| **date** | 2026-07-17 |
| **owner** | devops |
| **target** | `http://14.225.217.232:8088` |
| **U65** | zero-seed — **no** `pnpm seed:*` / inbox seed / DB fake |
| **ack_status** | **READY_FOR_QA** |

---

## Commits deployed

| SHA | Message |
|-----|---------|
| `57bbed7` | fix(hrm): harden UF-HRM-12 recruitment mutate gates for portal QA |
| `397ac81` | fix(hrm): Tools menu deferred honesty — no stub mutate toasts |

**VPS HEAD:** `397ac81` (`git pull origin main` fast-forward from `63915ed`).

### Allow-list (committed + pushed)

**UF12 recruitment**

- `apps/web/hrm/src/components/auth/PermissionGate.tsx`
- `apps/web/hrm/src/components/auth/PermissionGate.test.ts`
- `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx`
- `apps/web/hrm/src/components/recruitment/HeadcountProposalTab.tsx`
- `apps/web/hrm/src/hooks/useJobRequisitions.ts`
- `apps/web/hrm/src/hooks/useJobRequisitions.test.ts`
- `apps/web/hrm/src/lib/jobRequisitionScope.ts`
- `docs/qa/evidence/d-hrm-rec-uf12-01-20260717.md`

**Tools stub toast**

- `apps/web/hrm/src/pages/ToolsEquipment.tsx`
- `apps/web/hrm/src/pages/ToolsEquipment.readOnly.test.ts`
- `apps/web/hrm/src/hooks/useToolsEquipment.ts`
- `apps/web/hrm/src/hooks/useToolsEquipment.test.ts`
- `apps/web/hrm/src/lib/hrmNonPilotApiGuard.test.ts`
- `docs/qa/evidence/d-hrm-tools-stub-toast-20260717.md`

Unrelated dirty lanes (xbos auth, leave-workflow, portal auth session, …) **not** scooped.

---

## Commands (VPS)

```bash
cd /opt/xevn-ecosystem
git stash -u || true
git fetch origin main
git pull origin main   # → 397ac81
node scripts/merge-vps-port-env.mjs --apply-canonical

cd deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --no-deps --force-recreate \
  portal-fe hrm-fe
```

### Services recreated

| Container | StartedAt (UTC) | Status | Ports |
|-----------|-----------------|--------|-------|
| `xevn-portal-fe-dev` | `2026-07-17T03:42:57.094Z` | running | `8088→5173` |
| `xevn-hrm-fe-dev` | `2026-07-17T03:42:56.834Z` | running | `8080→8080` |

Non-xevn left running (ytexa_*, hsbx_*, asms_*, viconnec_*). **No** `docker compose down`.

---

## Smoke results

| Check | Result |
|-------|--------|
| `GET http://14.225.217.232:8088/` | **200** |
| `GET http://14.225.217.232:8088/command-center` | **200** |
| `GET http://14.225.217.232:8088/command-center/hrm/recruitment` | **200** |
| `GET http://14.225.217.232:8088/command-center/hrm/tools-equipment` | **200** |
| `GET http://127.0.0.1:8080/` (on VPS) | **302** (SPA redirect — OK) |
| Seed used | **none** |

### Bind-mount source proof (VPS HEAD `397ac81`)

| Marker | Result |
|--------|--------|
| `toast.success` in Tools hook/page | **0** / **0** |
| `tools-deferred-banner` | **1** |
| `Thêm CCDC` | **0** |
| `Chi tiết` in JobRequisitionsTab | **2** |
| `portal` refs in PermissionGate | **2** |

---

## QA next (browser · U65)

### 1) UF-HRM-12 / J-HRM-05 — recruitment mutate

**URL:** `http://14.225.217.232:8088/command-center/hrm/recruitment`  
**Persona:** `ceo@xe.vn` / `Xevn@2026` · `companyId=main`

| # | Step | PASS when |
|---|------|-----------|
| 1 | Login → Tuyển dụng | L0: no ERROR / 409 / `54321` |
| 2 | Dashboard + Ứng viên | No `candidate-evaluations` storm off Evaluations tab |
| 3 | Yêu cầu tuyển dụng | **Thêm** + **Sửa** + **Chi tiết** visible |
| 4 | Chi tiết | Dialog from GET `:id` 200 |
| 5 | Sửa → Lưu | PATCH 2xx → list updates → **F5** persists |
| 6 | Đề xuất → Tạo → Lưu | POST 2xx → row → **F5** |

**cấm:** seed · API-only PASS without FE after 2xx + F5

### 2) Tools — deferred honesty

**URL:** `http://14.225.217.232:8088/command-center/hrm/tools-equipment`

| # | Step | PASS when |
|---|------|-----------|
| 1 | Open Tools menu | Deferred banner visible; **no** Thêm CCDC / Tạo phiếu |
| 2 | Interact | **No** success toast («Đã thêm CCDC…») |
| 3 | Matrix | Menu stays **⚪ deferred** (do not promote 🟢) |

---

## Residual

- Browser L2.5 mutate / Tools UX not executed by DevOps (L0 smoke only).
- Local `Invoke-WebRequest` on `:8080` may mis-report 302; on-VPS curl **302** is authoritative.

---

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | Allow-list commit+push UF12 + Tools; VPS pull `397ac81`; recreate `portal-fe`+`hrm-fe` `--no-deps`; smoke :8088/recruitment/tools **200**; source proof PASS |
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/d-hrm-rec-uf12-01-deploy-20260717.md` |
| **fe_evidence** | `docs/qa/evidence/d-hrm-rec-uf12-01-20260717.md` · `docs/qa/evidence/d-hrm-tools-stub-toast-20260717.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: GWC-HRM-REC-UF12-01-QA (+ D-HRM-TOOLS-STUB-TOAST-01-QA)
from_role: pm
to_role: qa
entry_criteria: DevOps READY_FOR_QA — VPS HEAD 397ac81; evidence docs/qa/evidence/d-hrm-rec-uf12-01-deploy-20260717.md; U65 zero-seed
exit_criteria:
  1) UF-HRM-12 + J-HRM-05 browser: Thêm/Sửa/Chi tiết; PATCH+F5; Đề xuất POST+F5; no eval storm → promote matrix if PASS
  2) Tools: no Thêm/Tạo phiếu/success toast; deferred banner; menu stays ⚪ deferred
evidence_path: docs/qa/evidence/gwc-hrm-rec-uf12-01-qa-20260717.md (+ tools retest note)
cấm: pnpm seed:* · API-only PASS
ack_status target: PASS_TO_PM
```
