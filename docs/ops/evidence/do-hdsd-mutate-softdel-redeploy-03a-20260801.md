# DO-HDSD-MUTATE-SOFTDEL-REDEPLOY-03A — evidence (2026-08-01)

**work_item_id:** `DO-HDSD-MUTATE-SOFTDEL-REDEPLOY-03A`  
**program:** `P-HDSD-ECOSYSTEM-03` · `R-8088-FE-SOFTDEL-METADATA-EXPORT-01`  
**from_role:** devops · **to_role:** qa  
**ack_status:** `READY_FOR_QA`  
**VPS HEAD:** `08c166b` (`origin/main`)  
**Operator:** devops  
**U65:** no seed · no demote · no blind stash pop · no compose down · no wide push

## Closed (this wave)

1. **Allow-list commit** `08c166b` — exactly 4 paths:
   - `apps/web/hrm/src/lib/hrmMetadataCompany.ts`
   - `apps/web/hrm/src/lib/hrmMetadataCompany.test.ts`
   - `docs/qa/evidence/d-hdsd-mutate-fe-metadata-export-01-20260801.md`
   - `docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-20260801.md`
2. **Push** `e590fd0..08c166b` → `origin/main` (not `git add .`).
3. **VPS** clean tree (`dirty_lines=0`) → `git pull --ff-only` `ea2df15 → 08c166b` (**no stash**).
4. **Recreate** `hrm-fe` + `portal-fe` with `-f docker-compose.yml -f docker-compose.xbos-node.yml` · `--force-recreate --no-deps`.
5. **xbos-be** left Up (healthy); non-xevn (ytexa/hsbx/asms/viconnec) left Up.

## Module-body proof (not SPA HTML trap)

Probe JSON: `docs/ops/evidence/_tmp-do-hdsd-mutate-redeploy-03a-probes.json`

| URL | HTTP | HTML shell? | Body assert | Verdict |
|-----|------|-------------|-------------|---------|
| `:8088/hr/src/lib/hrmMetadataCompany.ts` | **200** | **false** | `export` + `resolveHrmCompanySlugForDisplay` | **PASS** |
| `:8080/hr/src/lib/hrmMetadataCompany.ts` | **200** | **false** | same | **PASS** |
| `:8088/hr/src/pages/Employees.tsx` (spot) | **200** | **false** | transform OK · no missing-export / SyntaxError | **PASS** |

Snippet (:8088):

```text
export function resolveHrmCompanySlugForDisplay(companyId) {
    const raw = companyId?.trim();
    if (!raw) return null;
    if (UUID_RE.test(raw)) {
        return ...
```

## L0 smoke

| Check | Result |
|-------|--------|
| `GET :8088/` | **200** |
| `GET :3001/api/hrm/metrics` | **200** |
| xbos-node override | **yes** (`docker-compose.xbos-node.yml`) |
| non-xevn containers | still Up |

## Residual (out of this WI)

| ID | Owner | Note |
|----|-------|------|
| SoftDel TC-025 Dev8088 | **qa** | Retest now — metadata export live on VPS |
| `R-8088-FE-BH-VIMONEY-01` | parallel | **unchanged** — AddInsuranceDialog / ViMoney still out of scope |

## Explicit non-claims

- Did **not** touch `Employees.tsx` / ViMoney / CatalogSearchPicker.
- Did **not** run seed or browser mutate (QA lane).
- Did **not** demote local SoftDel greens.

## Next

`READY_FOR_QA` → **`QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET`** on `http://14.225.217.232:8088` (U65 browser-only; prove SoftDel / Employees no longer blocked by missing `resolveHrmCompanySlugForDisplay`).
