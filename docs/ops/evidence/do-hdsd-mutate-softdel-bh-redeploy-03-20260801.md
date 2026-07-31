# DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-03 — evidence (2026-08-01)

**work_item_id:** `DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-03`  
**program:** `P-HDSD-ECOSYSTEM-03` · `R-8088-FE-BH-VIMONEY-01`  
**from_role:** devops · **to_role:** pm / qa  
**ack_status:** `PASS_TO_PM`  
**VPS HEAD:** `7c03091` (`origin/main`)  
**Operator:** devops  
**U65:** no seed · no demote · no blind stash · no compose down · no SoftDel rewrite

## Serialize note (03A)

- `DO-HDSD-MUTATE-SOFTDEL-REDEPLOY-03A` already on VPS at entry: HEAD `08c166b` SoftDel export; `hrm-fe`/`portal-fe` recreated ~1 min before this wave.
- This wave **sequential**: commit+push ViMoney only → pull `08c166b..7c03091` → one recreate FE.

## Closed scope

1. **Allow-list commit** `7c03091` — exactly 3 paths (no `git add .`):
   - `apps/web/hrm/src/components/ui/ViMoneyInput.tsx`
   - `apps/web/hrm/src/components/ui/ViMoneyInput.test.ts`
   - `docs/qa/evidence/d-hdsd-mutate-fe-vimoney-01-20260801.md`
2. **Push** `08c166b..7c03091` → `origin/main`.
3. **VPS** `git pull --ff-only` `08c166b → 7c03091` (clean; **no stash**).
4. **Recreate** `hrm-fe` + `portal-fe` with `-f docker-compose.yml -f docker-compose.xbos-node.yml` · `--force-recreate --no-deps`.
5. **xbos-be** left Up (started 05:03Z, not recreated); non-xevn (ytexa/hsbx) left Up.

## Module-body proof (not SPA HTML trap)

Probe JSON: `docs/ops/evidence/_tmp-do-hdsd-mutate-bh-redeploy-03-probes.json`

| URL | HTTP | HTML shell? | Body assert | Verdict |
|-----|------|-------------|-------------|---------|
| `:8080/hr/src/components/ui/ViMoneyInput.tsx` | **200** | **false** | Vite transform + `export` + ViMoney markers | **PASS** |
| `:8088/hr/src/components/ui/ViMoneyInput.tsx` | **200** | **false** | same | **PASS** |
| `:8080/hr/src/components/insurance/AddInsuranceDialog.tsx` | **200** | **false** | transform OK; **no** `Failed to resolve` | **PASS** |
| `:8088/hr/.../AddInsuranceDialog.tsx` | **200** | **false** | same | **PASS** |

Prior residual from redeploy-02 (`Failed to resolve @/components/ui/ViMoneyInput`) — **CLOSED**.

## L0 smoke

| Check | Result |
|-------|--------|
| `GET :8088/` | **200** |
| `GET :8080/` | **302** (SPA OK) |
| `GET :3001/api/hrm/metrics` | **200** |
| xbos-node override | **yes** (`docker-compose.xbos-node.yml`) |
| non-xevn containers | still Up (ytexa/hsbx healthy) |

## Residual

- None for ViMoney Vite resolve on server-dev.  
- SoftDel metadata export already on `08c166b` (03A).  
- Browser UF (TC-025 + TC-049) → QA smoke next — not claimed here.

## next_owner

`qa` → `QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-03` (TC-025 + TC-049; SoftDel RET if 03A queue separate)

```text
work_item_id: QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-03
entry: DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-03 PASS; VPS HEAD 7c03091; ViMoney+AddInsuranceDialog Vite 200
exit: browser TC-025 SoftDel + TC-049 BH add insurance on :8088; U65 no seed; no demote
evidence: docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-03-20260801.md
```
