# Repo hygiene cleanup — W1 + W2 evidence

**work_item_id:** `REPO-HYGIENE-01-W1W2`  
**executed_at:** 2026-06-20  
**owner:** devops  
**program:** `docs/program/REPO_HYGIENE_CLEANUP_PROGRAM.md`

## Summary

W1 safe cleanup and W2 script restructure completed. Tracked `scripts/tmp-*` reduced from 64 → 0; two CC legal probes promoted to `scripts/qa/`. `pnpm run qc:dev-stack` exit **0**.

## Before / after file counts

| Metric | Before | After |
|--------|--------|-------|
| `scripts/tmp-*` (disk) | 352 | **0** |
| `scripts/tmp-*` (git tracked) | 64 | **0** |
| `docs/qa/evidence/` total | 3617 | **1312** |
| evidence `.xml` | 1701 | **0** |
| evidence `.png` | 735 | **131** (tracked + cited) |
| evidence `.md` | 996 | **996** (unchanged) |
| evidence `.json` | 146 | **146** (unchanged) |
| `docs/ops/evidence/tmp-plink-*.txt` | 6 | **0** |

## Promoted scripts (W2)

| Old path | New path |
|----------|----------|
| `scripts/tmp-cc-legal-entity-crud-probe.mjs` | `scripts/qa/xbos-cc-legal-entity-crud-probe.mjs` |
| `scripts/tmp-cc-legal-entity-member-save-probe.mjs` | `scripts/qa/xbos-cc-legal-entity-member-save-probe.mjs` |

**package.json** updated:

- `test:xbos:cc-legal-crud` → `./scripts/qa/xbos-cc-legal-entity-crud-probe.mjs`
- `test:xbos:cc-member-save` → `./scripts/qa/xbos-cc-legal-entity-member-save-probe.mjs`

**VPS promote:** No tracked `tmp-vps-*` / `tmp-run-vps-*` in git index; dated VPS shells remain local-only under gitignored `scripts/tmp-*` per deploy evidence. Created empty target dir `scripts/ops/vps/` for future promotes.

## Deleted categories

| Category | Count | Notes |
|----------|-------|-------|
| `docs/qa/evidence/**/*.xml` | **1701** | adb UI dumps — all removed |
| Untracked `docs/qa/evidence/**/*.png` | **593** | not cited by tracked `.md` in same folder |
| Untracked `scripts/tmp-*` | **288** | not in `git ls-files` |
| Tracked `scripts/tmp-*` (git rm) | **62** | one-off probes; historical refs remain in evidence/bus only |
| `docs/ops/evidence/tmp-plink-*.txt` | **6** | plink session logs |

**Not deleted:** tracked `.md` / `.json` evidence; tracked PNG (131) retained.

## `.gitignore` diff summary

Added to root `.gitignore`:

- `docs/qa/evidence/**/*.xml`
- `docs/qa/evidence/**/ui-dump/`
- `*.apk`, `*.aab`, `android/app/build/`
- `scripts/tmp-*`

## New artifacts

- `scripts/README.md` — folder layout (`qa/`, `ops/`, `ops/vps/`, `dev/`, `lib/`)
- `scripts/qa/` — promoted XBOS CC legal probes

## Gate

```text
pnpm run qc:dev-stack
exit code: 0
hrm-api: 200 @ :28001
xbos-api: 200 @ :28002
web-portal: 200 @ :5173
```

## Residual / next waves

| Wave | Item |
|------|------|
| W3 | ~~Archive pre-2026-05 evidence~~ **DONE** — 89 tracked; see §W3 |
| W4 | SQL consolidation — `apps/api/xbos-api/migrations/` vs `migrations/xbos/` (**TM sign-off**) |
| W5 | QC hygiene GO + broken-path grep |

Historical evidence/bus entries still cite removed `scripts/tmp-*` paths — acceptable for audit trail; re-run probes use promoted paths or local gitignored tmp.

---

## W3 — Evidence archive + index (2026-06-20)

**work_item_id:** `REPO-HYGIENE-01-W3` · retry **`REPO-HYGIENE-01-W3-R2`** (2026-06-20)  
**owner:** devops  
**script:** `scripts/ops/repo-hygiene-w3-archive.mjs`

### Before / after (git tracked)

| Metric | Before W3 | After W3 |
|--------|-----------|----------|
| `git ls-files docs/qa/evidence/` | **753** | **89** |
| Root tracked | 447 | **72** |
| `.xml` tracked | 175 | **0** |
| `.png` tracked | 131 | **0** |
| Archive milestone `.md` tracked | 0 | **17** (EVIDENCE_INDEX May rows) |

### Before / after (disk — W3-R2 audit)

| Metric | Before W3 | After W3-R2 |
|--------|-----------|-------------|
| Root `.md` + `.json` (disk) | **1142** | **769** |
| `archive/2026-05/` `.md` + `.json` | 0 | **375** |
| `git mv` (tracked) | — | **17** |
| Filesystem `mv` (untracked May) | — | **358** |

### Actions

| Action | Count | Notes |
|--------|-------|-------|
| Pre-20260501 root `.md`/`.json` → `archive/2026-05/` | **0** | Không có file pre-May trong index git |
| May 2026 root `.md`/`.json` → `archive/2026-05/` (`git mv`) | **375** | Tháng 05 gom archive; 2026-06+ giữ root |
| `git rm --cached` archived May (không EVIDENCE_INDEX) | **358** | Còn trên disk; giảm index |
| `git rm --cached` `*.xml` | **175** | W1 `.gitignore` residual |
| `git rm --cached` screen `*.png` | **131** | PNG cited — disk under `archive/.../screens/` |
| Screen dirs → `archive/2026-05/screens/` | **5** dirs | adb dumps; path cập nhật trong mob QA md |

### New / updated docs

| File | Purpose |
|------|---------|
| `docs/qa/evidence/README.md` | Naming, cấm xml, archive policy |
| `docs/program/EVIDENCE_INDEX.md` | Archive pointer; May paths → `archive/2026-05/` |
| `docs/qa/evidence/repo-hygiene-w3-stats.json` | Machine stats từ script |

### Target ≤200 tracked

**PASS** — **89** tracked (`76` `.md`, `10` `.json`, `3` `.txt`). Milestone QC traceable qua `EVIDENCE_INDEX.md` + grep bus.

### Residual

| Item | Owner |
|------|-------|
| W4 SQL consolidation | **technical-manager** |
| W5 QC hygiene GO + broken-path grep | **qc** |
| ~358 archived May `.md`/`.json` on disk untracked | OK — tra cứu local; milestone 17 file vẫn tracked trong archive |

**ack_status:** `PASS_TO_PM`  
**next_owner:** pm → **technical-manager** (W4)  
**evidence_path:** `docs/qa/evidence/repo-hygiene-cleanup-20260620.md` §W3

