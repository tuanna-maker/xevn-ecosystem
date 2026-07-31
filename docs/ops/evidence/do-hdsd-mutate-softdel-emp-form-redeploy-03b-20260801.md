# DO-HDSD-MUTATE-SOFTDEL-EMP-FORM-REDEPLOY-03B — evidence (2026-08-01)

**work_item_id:** `DO-HDSD-MUTATE-SOFTDEL-EMP-FORM-REDEPLOY-03B`  
**program:** `P-HDSD-ECOSYSTEM-03` · `R-8088-FE-SOFTDEL-EMP-FORM-MAP-01`  
**from_role:** devops · **to_role:** qa  
**ack_status:** `READY_FOR_QA`  
**VPS HEAD:** `ba2ad5f` (`origin/main`)  
**Operator:** devops  
**U65:** no seed · no demote · no blind stash pop · no compose down · no wide `git add .`

## Closed (this wave)

1. **Allow-list commit** `a463aff` — SoftDel mount-guard dialog + test + Dev evidence:
   - `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx`
   - `apps/web/hrm/src/components/employee/EmployeeFormDialog.mount-guard.test.ts`
   - `docs/qa/evidence/d-hdsd-mutate-softdel-emp-form-map-01-20260801.md`
2. **Push** `e176c70..a463aff` → `origin/main` (not `git add .`).
3. **First VPS pull** landed on `01fffad` (labelMaps UTF-8 already ahead); disk already had SoftDel guard markers + SoftDel `08c166b` / ViMoney `7c03091` ancestry.
4. **Vite FAIL (caught by module-body proof):** `:8080`/`:8088` returned **HTTP 500 HTML Error** — `Failed to resolve import "@/components/ui/ViDateField"` (file **never shipped** on `main`). Lesson: HTML 500 ≠ module body.
5. **Hotfix allow-list** `ba2ad5f` — drop `ViDateField`; restore `Input type="date"` for start/birth; keep SoftDel `departmentOptionsFromCatalog(catalogs ?? [])` + `ViMoneyInput`.
6. **VPS** clean (`dirty=0`) → `git pull --ff-only` `9f50e44 → ba2ad5f` (**no stash**).
7. **Recreate** `hrm-fe` + `portal-fe` with `-f docker-compose.yml -f docker-compose.xbos-node.yml` · `--force-recreate --no-deps`.
8. SoftDel metadata + ViMoney modules **intact** (ancestry + Vite 200).

## Module-body proof (not SPA HTML trap)

Probe JSON: `docs/ops/evidence/_tmp-do-hdsd-mutate-softdel-emp-form-redeploy-03b-probes.json`

| URL | HTTP | HTML shell? | Body assert | Verdict |
|-----|------|-------------|-------------|---------|
| `:8080/hr/src/components/employee/EmployeeFormDialog.tsx` | **200** | **false** | `import` module · `departmentOptionsFromCatalog` · `catalogs ?? []` · **no** `departments.map(` | **PASS** |
| `:8088/hr/src/components/employee/EmployeeFormDialog.tsx` | **200** | **false** | same | **PASS** |
| `:8080/hr/src/pages/Employees.tsx` | **200** | — | transform OK | **PASS** |
| `:8080/.../hrmMetadataCompany.ts` SoftDel | **200** | — | intact | **PASS** |
| `:8080/.../ViMoneyInput.tsx` | **200** | — | intact | **PASS** |

Snippet (:8088):

```text
import { createHotContext as __vite__createHotContext } from "/hr/@vite/client";
import.meta.hot = __vite__createHotContext("/src/components/employee/EmployeeFormDialog.tsx");
import ...
```

## L0 smoke

| Check | Result |
|-------|--------|
| `GET :8088/` | **200** |
| `GET :3001/api/hrm/metrics` | **200** |
| xbos-node override | **yes** (`docker-compose.xbos-node.yml`) |
| non-xevn (ytexa/hsbx) | still Up |

## Residual

| ID | Owner | Note |
|----|-------|------|
| SoftDel TC-025 Dev8088 | **qa** | Retest now — Employees + SoftDel mount path live |
| BH / ViMoney browser | qa (SMOKE-03 if open) | SoftDel **first** per PM; ViMoney left intact, not claimed here |
| Ship real `ViDateField` (vi-VN dd/MM/yyyy) | **dev-fe** (later) | Dialog temporarily uses `Input type="date"` to unblock SoftDel |

## Explicit non-claims

- Did **not** stash-pop wide dirty tree.
- Did **not** recreate full stack / touch `hrm-be` / `xbos-be`.
- Did **not** run seed or browser SoftDel mutate (QA lane).
- Did **not** demote SoftDel/ViMoney greens.

## Next

`READY_FOR_QA` → **`QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET2`** on `http://14.225.217.232:8088` (U65 browser-only; TC-025 SoftDel first).
