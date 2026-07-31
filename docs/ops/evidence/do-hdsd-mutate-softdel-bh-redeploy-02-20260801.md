# DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-02 — evidence (2026-08-01)

**work_item_id:** `DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-02`  
**program:** `P-HDSD-ECOSYSTEM-03` · R-8088-FE-SOFTDEL-TESTIDS-01 + R-8088-FE-BH-CATALOG-PICKER-01  
**from_role:** devops · **to_role:** pm / qa  
**ack_status:** `PASS_TO_PM` (SoftDel Vite gap closed; BH still blocked — new residual)  
**VPS HEAD:** `ea2df15` (`origin/main`)  
**Operator:** devops  
**U65:** no seed · no demote · no blind stash pop · no compose down

## Closed (this wave)

1. **Allow-list commit** `ea2df15` — exactly 11 paths (CatalogSearchPicker + lib helpers + HDSD mutate test ids + QA evidence). No `git add .`.
2. **Push** `8a8a359..ea2df15` → `origin/main`.
3. **VPS** `git pull --ff-only` `3920df3 → ea2df15` (clean tree; **no stash**).
4. **Recreate** `hrm-fe` + `portal-fe` with `-f docker-compose.yml -f docker-compose.xbos-node.yml` · `--force-recreate --no-deps`.
5. **xbos-be** left Up (healthy); non-xevn (ytexa/hsbx/asms/viconnec) left Up.

## Module-body proof (not SPA HTML trap)

Probe JSON: `docs/ops/evidence/_tmp-do-hdsd-mutate-redeploy-02-probes.json`

| URL | HTTP | HTML shell? | Body assert | Verdict |
|-----|------|-------------|-------------|---------|
| `:8080/hr/src/lib/hdsdMutateTestIds.ts` | **200** | **false** | contains `export` + `HDSD_MUTATE_TEST_IDS` | **PASS** |
| `:8088/hr/src/lib/hdsdMutateTestIds.ts` | **200** | **false** | same | **PASS** |
| `:8080/hr/src/components/common/CatalogSearchPicker.tsx` | **200** | **false** | Vite transform + `export` | **PASS** |
| `:8088/hr/.../CatalogSearchPicker.tsx` | **200** | **false** | same | **PASS** |
| `:8080/hr/src/pages/Employees.tsx` | **200** | **false** | transform OK (prior 500 CLOSED) | **PASS** |
| `:8088/hr/src/pages/Employees.tsx` | **200** | **false** | same | **PASS** |
| `:8080/hr/src/components/insurance/AddInsuranceDialog.tsx` | **500** | n/a | resolve fail | **FAIL** |
| `:8088/hr/.../AddInsuranceDialog.tsx` | **500** | n/a | same | **FAIL** |

### Vite error (BH residual)

```
Failed to resolve import "@/components/ui/ViMoneyInput"
from "src/components/insurance/AddInsuranceDialog.tsx"
```

- `apps/web/hrm/src/components/ui/ViMoneyInput.tsx` — **absent** on VPS and local workspace.
- `git log --all -- **/ViMoneyInput*` — **empty** (never shipped to `main`).
- Import used by AddInsuranceDialog (+ Payroll/Employee/Recruitment siblings) but **no module file in repo**.

**R-8088-FE-BH-VIMONEY-01** — Dev-FE must add `ViMoneyInput` (vi-VN thousand grouping money input per UX locale lock) then DevOps redeploy-03. **Outside** this allow-list; devops did not invent FE component.

## L0 smoke

| Check | Result |
|-------|--------|
| `GET :8088/` | **200** |
| `GET :8080/` | **302** (SPA OK) |
| `GET :3001/api/hrm/metrics` | **200** |
| xbos-node override | **yes** (`docker-compose.xbos-node.yml`) |
| non-xevn containers | still Up |

## Residual (PM must dispatch)

| ID | Owner | Action |
|----|-------|--------|
| **R-8088-FE-BH-VIMONEY-01** | `dev-fe` | Create/ship `apps/web/hrm/src/components/ui/ViMoneyInput.tsx` (+ tests); wire props used by AddInsuranceDialog (`value`/`onValueChange`/…) |
| **DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-03** | `devops` | After FE commit: allow-list push + recreate hrm-fe; prove AddInsuranceDialog **200** body |
| SoftDel TC-025 | `qa` | May retest SoftDel **only** on Dev8088 now (Employees transform 200); **do not** claim TC-049 until ViMoneyInput live |

## Explicit non-claims

- Did **not** claim AddInsuranceDialog unblock.
- Did **not** demote TC-025/049 local greens.
- Did **not** run seed / browser mutate (QA lane).

## Next

`PASS_TO_PM` → dispatch **dev-fe** `R-8088-FE-BH-VIMONEY-01` (P0) before full `QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-03`. Optional parallel SoftDel-only QA smoke if PM wants SoftDel evidence early.
