# Scripts layout — xevn-ecosystem

Operational scripts for seed, deploy, QA probes, and shared helpers. One-off dated probes belong in local `scripts/tmp-*` (gitignored) until promoted or deleted.

## Directories

| Folder | Purpose | Examples |
|--------|---------|----------|
| `scripts/qa/` | Reusable QA / acceptance probes (browser, API, pilot) | `xbos-cc-legal-entity-crud-probe.mjs` |
| `scripts/ops/` | Deploy, VPS smoke, production enable helpers | `p1-r3-do-01-b1-vps-verify.sh` |
| `scripts/ops/vps/` | VPS-specific pscp / remote deploy shells (dated one-offs stay local) | — |
| `scripts/dev/` | Seed, repair SQL, dev-only maintenance | see `scripts/dev/` |
| `scripts/lib/` | Shared imports for probes and seeds | `hrm-company-slug-map.mjs` |
| `scripts/load/` | Load-test helpers | — |

## Naming rules

1. **No `tmp-` prefix** in tracked scripts — use module prefix (`xbos-`, `hrm-`, `p1-`) and role suffix (`-probe`, `-smoke`, `-device`).
2. **Dated VPS one-offs** (`*-20260620.sh`) — local only under `scripts/tmp-*` (gitignored); cite path in `docs/ops/evidence/*.md` if used once.
3. **package.json** — only stable probes get npm script entries; path under `scripts/qa/` or `scripts/ops/`.
4. **Evidence** — adb UI dumps (`.xml`, `ui-dump/`) and APK/AAB are never committed; see root `.gitignore`.

## Promote workflow (from REPO-HYGIENE program)

```text
scripts/tmp-* (local) → grep refs in package.json + deploy docs
  → promote to scripts/qa/ or scripts/ops/vps/ with clean name
  → update package.json
  → delete tmp copy; scripts/tmp-* stays gitignored
```

## Related docs

- `docs/program/REPO_HYGIENE_CLEANUP_PROGRAM.md`
- `docs/ops/DEPLOY_GUIDE.md`
- `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md`
