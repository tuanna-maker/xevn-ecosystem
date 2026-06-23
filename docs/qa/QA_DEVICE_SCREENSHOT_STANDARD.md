# QA-Device Screenshot Folder Standard (xevn-ecosystem)

**Owner:** QA / qa-device · **Gate:** `pnpm run verify:qc:evidence-pack -- --evidence <pack.md> [--check-assets] [--check-git]`

## Folder naming

| Evidence MD | Screenshot folder (sibling) |
|-------------|----------------------------|
| `{work}-qa-device-20260609.md` | `docs/qa/evidence/{work}-screens/` |
| `{work}-qa-r2-20260609.md` | `docs/qa/evidence/{stem-without-qa-r2}-screens/` (e.g. `mob-ux-10d-screens`) |
| `r-dir-detail-01-qa-device-*.md` | `docs/qa/evidence/r-dir-detail-01-screens/` |

**Rule:** One folder per wave; never scatter PNG/XML under `tmp/` or repo root.

## File naming

| Type | Pattern | Example |
|------|---------|---------|
| PNG screenshot | `{wave}-{step}.png` or `{feature}-{state}.png` | `rdir-03-detail.png`, `r2-history-initial.png` |
| UIAutomator XML | Same stem as PNG when paired | `rdir-detail.xml` ↔ `rdir-03-detail.png` |
| Machine JSON | Sibling of MD, not inside `-screens/` | `mob-ux-10d-qa-device-20260609.json` |

**Pairing:** Every PNG cited in evidence **must** have a matching XML dump when automation used uiautomator (QC spot-audit prefers XML; PNG for sponsor visual).

## Evidence MD requirements

1. **Header fields** (verifier-friendly):
   - `work_item_id:` or table row `**work_item_id** | \`ID\``
   - `ack_status:` or table row `**ack_status** |`
   - Mobile: `api_base: https://14-225-217-232.nip.io` (not portal 5175)
2. **## Screenshot manifest** table:

```markdown
| Step | PNG (repo path) | XML (repo path) | git |
|------|-----------------|-----------------|-----|
| List | `docs/qa/evidence/foo-screens/list.png` | `foo-screens/list.xml` | required |
```

3. **Commands table** with exit codes (`adb`, `node`, or `pnpm run`).
4. **L2.5 J-*** journey rows with PASS/FAIL.
5. **## Residual** — or explicit "None blocking".

## Git commit policy (C-W8QC-PACK-02)

PNG/XML under `docs/qa/evidence/*-screens/` **must be git-added** before `PASS_TO_PM` when cited in evidence. Untracked assets fail:

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/foo.md --check-assets --check-git
```

PM/DevOps may batch-add large screen folders; QA documents SHA/size in manifest. Do **not** reference PNG paths that exist only on the local emulator host.

## Audit commands

```bash
# Scan mob-ux-*, qc-mob-*, r-dir-* packs for PNG refs vs disk/git
node scripts/audit-mobile-qc-png-refs.mjs

# Format gate (mobile packs accept api_base @ nip.io)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-ux-10d-qa-r2-20260609.md

# Strict asset gate before QC dispatch
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-dir-detail-01-qa-device-20260609.md --check-assets
```

## Reference packs (2026-06-09 wave)

| Pack | Screen folder | PNG on disk | Git tracked (pre-fix) |
|------|---------------|-------------|------------------------|
| `mob-ux-10d-qa-r2-20260609.md` | `mob-ux-10d-screens/` | 10 | pending `git add` |
| `r-dir-detail-01-qa-device-20260609.md` | `r-dir-detail-01-screens/` | 4 | pending `git add` |
| `mob-ux-10-p0-qa-device-20260609.md` | `mob-ux-10-p0-screens/` | 7 | pending `git add` |

See audit evidence: `docs/qa/evidence/c-w8qc-pack-02-20260609.md`.
